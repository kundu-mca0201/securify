import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { AiAssistantCenter } from './components/AiAssistantCenter';
import { ComputerStatus } from './components/ComputerStatus';
import { QuickCommands } from './components/QuickCommands';
import { SecurityCenter } from './components/SecurityCenter';
import { ActivityHistory } from './components/ActivityHistory';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ToastContainer } from './components/ToastContainer';

import { VoiceStatus, SystemStatus, ParsedCommand, ActionIntent, ActivityLog } from './modules/models';
import { voiceEngine } from './modules/VoiceEngine';
import { OSController } from './modules/OSController';
import { SecurityManager } from './modules/SecurityManager';
import { ActivityLogger } from './modules/ActivityLogger';
import { SettingsManager } from './modules/SettingsManager';
import { NotificationManager } from './modules/NotificationManager';
import { soundEffects } from './modules/SoundEffects';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('assistant');
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  
  const [settings, setSettings] = useState(SettingsManager.getSettings());
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>(ActivityLogger.getLogs());

  // Safety confirmation state
  const [pendingConfirmCommand, setPendingConfirmCommand] = useState<ParsedCommand | null>(null);
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);
  const [onCancelCallback, setOnCancelCallback] = useState<(() => void) | null>(null);

  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Refresh system information
  const refreshSystemStatus = useCallback(async () => {
    const status = await OSController.getSystemStatus();
    setSystemStatus(status);
  }, []);

  // Update activity logs
  const refreshLogs = useCallback(() => {
    setLogs(ActivityLogger.getLogs());
  }, []);

  // Initialize and register VoiceEngine event listeners
  useEffect(() => {
    refreshSystemStatus();

    voiceEngine.registerEvents({
      onStatusChange: (st) => setVoiceStatus(st),
      onTranscript: (txt) => setTranscript(txt),
      onAiResponse: (resp) => {
        setAiResponse(resp);
        refreshLogs();
        NotificationManager.show('SecureMate AI', resp, 'info');
      },
      onAudioLevel: (lvl) => setAudioLevel(lvl),
      onRequireConfirmation: (cmd, confirm, cancel) => {
        setPendingConfirmCommand(cmd);
        setOnConfirmCallback(() => () => {
          setPendingConfirmCommand(null);
          confirm();
          refreshLogs();
        });
        setOnCancelCallback(() => () => {
          setPendingConfirmCommand(null);
          cancel();
          refreshLogs();
        });
      },
      onError: (err) => {
        NotificationManager.show('Security / Audio Alert', err, 'warning');
      },
    });

    // Keyboard Shortcuts
    let lastEscTime = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Emergency Panic Stop: Double Escape
      if (e.key === 'Escape') {
        const now = Date.now();
        if (now - lastEscTime < 450) {
          handleEmergencyStop();
        }
        lastEscTime = now;
      }

      // Space toggle listening: Ctrl+Space or Meta+Space
      if (e.code === 'Space' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleToggleListening();
      }

      // Instant Lock: Ctrl+Alt+L
      if (e.code === 'KeyL' && e.ctrlKey && e.altKey) {
        e.preventDefault();
        voiceEngine.processInput('lock my laptop');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshSystemStatus, refreshLogs]);

  // Handle listening toggle
  const handleToggleListening = async () => {
    if (voiceStatus === 'listening') {
      voiceEngine.stopListening();
    } else {
      const ok = await voiceEngine.startListening();
      if (!ok) {
        NotificationManager.show(
          'Microphone Initialization',
          'Voice monitoring paused or permission needed. You can also type commands directly.',
          'info'
        );
      }
    }
  };

  // Handle privacy mode toggle
  const handleTogglePrivacy = (enabled?: boolean) => {
    const nextVal = enabled !== undefined ? enabled : !settings.privacyMode;
    SecurityManager.togglePrivacyMode(nextVal);
    const updated = SettingsManager.updateSettings({ privacyMode: nextVal });
    setSettings(updated);

    if (nextVal) {
      voiceEngine.stopListening();
      soundEffects.playClick();
      NotificationManager.show(
        'Privacy Mode Engaged',
        'Microphone is strictly disconnected. Speech telemetric analysis suspended.',
        'warning'
      );
    } else {
      soundEffects.playSuccess();
      NotificationManager.show(
        'Privacy Mode Disengaged',
        'Standard voice assistant readiness restored.',
        'success'
      );
    }
  };

  // Emergency Panic Stop
  const handleEmergencyStop = () => {
    SecurityManager.triggerEmergencyStop();
    const updated = SettingsManager.updateSettings({ privacyMode: true });
    setSettings(updated);
    soundEffects.playError();
    NotificationManager.show(
      'EMERGENCY PANIC DISCONNECT',
      'All audio capture terminated immediately. System set to Privacy Lock.',
      'danger'
    );
  };

  // Trigger quick command intents
  const handleTriggerIntent = (intent: ActionIntent, appName?: string) => {
    soundEffects.playClick();
    if (intent === 'OPEN_APP' && appName) {
      voiceEngine.processInput(`open ${appName}`);
    } else if (intent === 'LOCK_SYSTEM') {
      voiceEngine.processInput('lock my laptop');
    } else if (intent === 'SLEEP_SYSTEM') {
      voiceEngine.processInput('put my laptop to sleep');
    } else if (intent === 'RESTART_SYSTEM') {
      voiceEngine.processInput('restart my computer');
    } else if (intent === 'SHUTDOWN_SYSTEM') {
      voiceEngine.processInput('shutdown my laptop');
    } else if (intent === 'OPEN_BROWSER') {
      voiceEngine.processInput('open browser');
    } else {
      voiceEngine.processInput(intent.toLowerCase());
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col relative overflow-hidden cyber-grid">
      {/* Scanline CRT simulation layer */}
      <div className="scanline" />

      {/* Cybernetic Ambient Glow Orbs in Background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        voiceStatus={voiceStatus}
        privacyMode={settings.privacyMode}
        onTogglePrivacy={() => handleTogglePrivacy()}
        onEmergencyStop={handleEmergencyStop}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto relative z-10 flex flex-col justify-start py-2">
        {activeTab === 'assistant' && (
          <AiAssistantCenter
            status={voiceStatus}
            audioLevel={audioLevel}
            transcript={transcript}
            aiResponse={aiResponse}
            onToggleListening={handleToggleListening}
            onSubmitCommand={(cmd) => voiceEngine.processInput(cmd)}
            language={settings.language}
            onChangeLanguage={(lang) => {
              const updated = SettingsManager.updateSettings({ language: lang });
              setSettings(updated);
            }}
          />
        )}

        {activeTab === 'status' && systemStatus && (
          <ComputerStatus
            status={systemStatus}
            voiceStatus={voiceStatus}
            privacyMode={settings.privacyMode}
            onRefresh={refreshSystemStatus}
          />
        )}

        {activeTab === 'commands' && (
          <QuickCommands
            onTriggerIntent={handleTriggerIntent}
            osName={systemStatus?.os || 'Workstation'}
          />
        )}

        {activeTab === 'security' && (
          <SecurityCenter
            privacyMode={settings.privacyMode}
            onTogglePrivacy={(en) => handleTogglePrivacy(en)}
            onEmergencyStop={handleEmergencyStop}
          />
        )}

        {activeTab === 'history' && (
          <ActivityHistory
            logs={logs}
            onClearLogs={() => {
              ActivityLogger.clearLogs();
              refreshLogs();
            }}
          />
        )}
      </main>

      {/* Confirmation Modal for Destructive Operations */}
      <ConfirmationModal
        command={pendingConfirmCommand}
        onConfirm={() => onConfirmCallback?.()}
        onCancel={() => onCancelCallback?.()}
      />

      {/* Full Settings Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChanged={(newSt) => setSettings(newSt)}
      />

      {/* Toast Alert System */}
      <ToastContainer />
    </div>
  );
};

export default App;
