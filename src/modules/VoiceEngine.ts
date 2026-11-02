import { VoiceStatus, ParsedCommand, ActionIntent } from './models';
import { IntentProcessor } from './IntentProcessor';
import { CommandValidator } from './CommandValidator';
import { OSController } from './OSController';
import { ActivityLogger } from './ActivityLogger';
import { SettingsManager } from './SettingsManager';
import { speechService } from './SpeechRecognition';
import { soundEffects } from './SoundEffects';

export interface VoiceEngineEvents {
  onStatusChange: (status: VoiceStatus) => void;
  onTranscript: (text: string, isFinal: boolean) => void;
  onAiResponse: (text: string) => void;
  onAudioLevel: (level: number) => void;
  onRequireConfirmation: (command: ParsedCommand, onConfirm: () => void, onCancel: () => void) => void;
  onError: (msg: string) => void;
}

export class VoiceEngine {
  private events: VoiceEngineEvents | null = null;
  private currentStatus: VoiceStatus = 'idle';
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public registerEvents(events: VoiceEngineEvents) {
    this.events = events;
  }

  public setStatus(status: VoiceStatus) {
    this.currentStatus = status;
    this.events?.onStatusChange(status);
  }

  public getStatus(): VoiceStatus {
    return this.currentStatus;
  }

  public async startListening(): Promise<boolean> {
    const settings = SettingsManager.getSettings();
    if (settings.privacyMode) {
      this.events?.onError('Cannot activate listening: Privacy Mode is ON.');
      return false;
    }

    soundEffects.playWakeWord();
    speechService.setLanguage(settings.language);

    const started = await speechService.start({
      onResult: (transcript, isFinal, confidence) => {
        this.events?.onTranscript(transcript, isFinal);
        if (isFinal) {
          this.processInput(transcript, confidence);
        }
      },
      onError: (err) => {
        this.events?.onError(err);
        soundEffects.playError();
        this.setStatus('idle');
      },
      onAudioLevel: (lvl) => {
        this.events?.onAudioLevel(lvl);
      },
      onStateChange: (state) => {
        if (state === 'listening') {
          this.setStatus('listening');
        } else if (state === 'idle') {
          this.setStatus('idle');
        }
      },
    });

    return started;
  }

  public stopListening() {
    speechService.stop();
    this.setStatus('idle');
    soundEffects.playClick();
  }

  // Process natural voice or typed command
  public async processInput(text: string, confidenceScore: number = 0.92) {
    if (!text || text.trim().length === 0) return;

    this.setStatus('processing');
    const settings = SettingsManager.getSettings();

    // 1. Intent Recognition
    const parsed = IntentProcessor.parse(text);
    // Use the higher confidence if speech engine provided one
    const effectiveConfidence = Math.max(parsed.confidence, confidenceScore);
    parsed.confidence = effectiveConfidence;

    // 2. Command Validation & Security Allowlist Check
    const validation = CommandValidator.validate(parsed, settings.privacyMode);

    if (!validation.isValid) {
      soundEffects.playError();
      const feedback = validation.reason || 'Command denied by security validator.';
      this.events?.onAiResponse(feedback);
      this.speak(feedback, parsed.language);

      ActivityLogger.log({
        rawCommand: text,
        recognizedIntent: parsed.intent,
        language: parsed.language,
        confidence: parsed.confidence,
        status: 'blocked',
        feedback,
        isSecurityEvent: true,
        executionTimeMs: 15,
      });

      this.setStatus('ready');
      return;
    }

    // 3. Check if Confirmation is required (Restart or Shutdown)
    if (validation.requiresConfirmation) {
      soundEffects.playWakeWord();
      this.events?.onRequireConfirmation(
        parsed,
        () => this.executeAction(parsed, text),
        () => {
          this.events?.onAiResponse('Action cancelled by user.');
          ActivityLogger.log({
            rawCommand: text,
            recognizedIntent: parsed.intent,
            language: parsed.language,
            confidence: parsed.confidence,
            status: 'failed',
            feedback: 'Operation aborted during safety confirmation.',
            isSecurityEvent: true,
          });
          this.setStatus('ready');
        }
      );
      return;
    }

    // 4. Direct Safe Execution
    await this.executeAction(parsed, text);
  }

  private async executeAction(parsed: ParsedCommand, rawText: string) {
    const startTime = performance.now();
    let responseText = '';
    let isSuccess = true;

    try {
      switch (parsed.intent) {
        case 'LOCK_SYSTEM': {
          const res = await OSController.lockScreen();
          responseText = parsed.language === 'hi' 
            ? 'कंप्यूटर को सुरक्षित रूप से लॉक कर दिया गया है।' 
            : parsed.language === 'hinglish' 
            ? 'Computer lock kar diya gaya hai. Security active.' 
            : 'Laptop locked securely. Native authentication required to resume.';
          isSuccess = res.success;
          break;
        }

        case 'SLEEP_SYSTEM': {
          const res = await OSController.sleepSystem();
          responseText = parsed.language === 'hi' 
            ? 'सिस्टम स्लीप मोड में जा रहा है।' 
            : 'System entering low-power sleep mode.';
          isSuccess = res.success;
          break;
        }

        case 'RESTART_SYSTEM': {
          const res = await OSController.restartSystem();
          responseText = 'System restarting. Securing runtime states.';
          isSuccess = res.success;
          break;
        }

        case 'SHUTDOWN_SYSTEM': {
          const res = await OSController.shutdownSystem();
          responseText = 'System shutdown initiated. Goodbye.';
          isSuccess = res.success;
          break;
        }

        case 'OPEN_BROWSER': {
          const res = await OSController.openBrowser();
          responseText = 'Opening default browser.';
          isSuccess = res.success;
          break;
        }

        case 'OPEN_APP': {
          const appName = parsed.targetApp || 'application';
          const res = await OSController.openApp(appName);
          responseText = `Launching ${appName}.`;
          isSuccess = res.success;
          break;
        }

        case 'STOP_LISTENING': {
          this.stopListening();
          responseText = parsed.language === 'hi' 
            ? 'माइक्रोफ़ोन बंद कर दिया गया है।' 
            : parsed.language === 'hinglish' 
            ? 'Listening band kar di gayi hai.' 
            : 'Listening deactivated. Tap microphone to resume.';
          isSuccess = true;
          break;
        }

        case 'SYSTEM_STATUS':
        case 'SECURITY_CHECK': {
          const status = await OSController.getSystemStatus();
          responseText = `SecureMate active. System: ${status.os}, Security score: ${status.securityScore}%. All modules operational.`;
          isSuccess = true;
          break;
        }

        default:
          responseText = 'Command not recognized. Please consult the quick command center.';
          isSuccess = false;
          break;
      }
    } catch (err) {
      responseText = `Execution error: ${err}`;
      isSuccess = false;
    }

    const duration = Math.round(performance.now() - startTime);

    if (isSuccess) {
      soundEffects.playSuccess();
    } else {
      soundEffects.playError();
    }

    this.events?.onAiResponse(responseText);
    this.speak(responseText, parsed.language);

    ActivityLogger.log({
      rawCommand: rawText,
      recognizedIntent: parsed.intent,
      language: parsed.language,
      confidence: parsed.confidence,
      status: isSuccess ? 'completed' : 'failed',
      feedback: responseText,
      isSecurityEvent: parsed.isDestructive || parsed.intent === 'LOCK_SYSTEM',
      executionTimeMs: duration,
    });

    if (this.currentStatus !== 'idle') {
      this.setStatus('ready');
    }
  }

  // Voice feedback generation using Web Speech Synthesis
  public speak(message: string, lang: 'en' | 'hi' | 'hinglish' = 'en') {
    if (!this.synth) return;
    const settings = SettingsManager.getSettings();
    if (!settings.soundFeedback) return;

    this.setStatus('speaking');
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.05;
    utterance.pitch = 0.95; // Slightly cybernetic/futuristic pitch

    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (lang === 'hinglish') {
      utterance.lang = 'en-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend = () => {
      if (speechService.getListeningState()) {
        this.setStatus('listening');
      } else {
        this.setStatus('idle');
      }
    };

    utterance.onerror = () => {
      this.setStatus('idle');
    };

    this.synth.speak(utterance);
  }
}

export const voiceEngine = new VoiceEngine();
