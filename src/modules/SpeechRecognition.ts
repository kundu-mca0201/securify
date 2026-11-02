// Cross-platform Web Speech Recognition and Audio Stream provider

export interface SpeechRecognitionCallbacks {
  onResult: (transcript: string, isFinal: boolean, confidence: number) => void;
  onError: (error: string) => void;
  onAudioLevel?: (level: number) => void;
  onStateChange: (state: 'listening' | 'idle' | 'error') => void;
}

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private callbacks: SpeechRecognitionCallbacks | null = null;
  private langCode: string = 'en-US';

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as IWindow;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public setLanguage(lang: 'en' | 'hi' | 'hinglish') {
    switch (lang) {
      case 'hi':
        this.langCode = 'hi-IN';
        break;
      case 'hinglish':
        this.langCode = 'en-IN'; // Indian English handles Hinglish phonetic tokens well
        break;
      case 'en':
      default:
        this.langCode = 'en-US';
        break;
    }
    if (this.recognition) {
      this.recognition.lang = this.langCode;
    }
  }

  public async start(callbacks: SpeechRecognitionCallbacks): Promise<boolean> {
    this.callbacks = callbacks;
    if (this.isListening) return true;

    try {
      // 1. Request microphone stream (Explicit user action required)
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 2. Setup AudioContext & Analyser for real-time waveform visualization
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.audioStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      // Start audio level monitor loop
      this.monitorAudioLevel();

      // 3. Setup Web Speech Recognition
      const win = window as IWindow;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        callbacks.onError('Web Speech API is not supported in this environment. Manual text input enabled.');
        callbacks.onStateChange('idle');
        return false;
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.langCode;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks?.onStateChange('listening');
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        let highestConfidence = 0.85;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          if (result[0].confidence && result[0].confidence > 0) {
            highestConfidence = result[0].confidence;
          }
          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript.trim().length > 0) {
          this.callbacks?.onResult(finalTranscript.trim(), true, highestConfidence);
        } else if (interimTranscript.trim().length > 0) {
          this.callbacks?.onResult(interimTranscript.trim(), false, 0.5);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Normal timeout waiting for speech, ignore
          return;
        }
        if (event.error === 'not-allowed') {
          this.callbacks?.onError('Microphone access denied by user or OS security settings.');
          this.stop();
        } else {
          this.callbacks?.onError(`Speech recognition notice: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        // If still supposed to be listening, restart (continuous mode resilience)
        if (this.isListening) {
          try {
            this.recognition?.start();
          } catch {
            // Already active or error
          }
        } else {
          this.callbacks?.onStateChange('idle');
        }
      };

      this.recognition.start();
      return true;
    } catch (err) {
      callbacks.onError(`Could not start microphone: ${err}`);
      this.callbacks?.onStateChange('error');
      this.stop();
      return false;
    }
  }

  private monitorAudioLevel() {
    if (!this.analyser) return;

    const dataArray: any = new Uint8Array(this.analyser.frequencyBinCount);
    const checkLevel = () => {
      if (!this.isListening || !this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const normalized = Math.min(1, average / 128); // 0 to 1

      this.callbacks?.onAudioLevel?.(normalized);

      this.animFrameId = requestAnimationFrame(checkLevel);
    };

    checkLevel();
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public stop() {
    this.isListening = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignored
      }
      this.recognition = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {
        // Ignored
      }
      this.audioContext = null;
    }
    this.analyser = null;
    this.callbacks?.onStateChange('idle');
  }

  public getListeningState(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechRecognitionService();
