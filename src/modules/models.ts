export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'ready' | 'error';

export type OperatingSystem = 'macOS' | 'Windows' | 'Linux' | 'Unknown';

export interface SystemStatus {
  os: OperatingSystem;
  osVersion: string;
  computerModel: string;
  hostname: string;
  isLocked: boolean;
  microphoneStatus: 'granted' | 'denied' | 'prompt' | 'inactive';
  voiceRecognitionStatus: 'ready' | 'listening' | 'muted' | 'error';
  securityScore: number; // 0 - 100
  uptime: string;
  batteryLevel?: number;
  isCharging?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  rawCommand: string;
  recognizedIntent: string;
  language: 'en' | 'hi' | 'hinglish';
  confidence: number;
  status: 'completed' | 'failed' | 'blocked' | 'pending_confirmation';
  feedback: string;
  isSecurityEvent: boolean;
  executionTimeMs?: number;
}

export interface AppSettings {
  startOnStartup: boolean;
  microphoneDeviceId: string;
  language: 'en' | 'hi' | 'hinglish';
  wakeWord: string;
  voiceSensitivity: number; // 1 to 10
  speechEngine: 'web-speech' | 'whisper-local' | 'vosk-local';
  notificationPreferences: boolean;
  privacyMode: boolean;
  soundFeedback: boolean;
  requirePinForDestructive: boolean;
  securityShieldLevel: 'maximum' | 'standard' | 'minimal';
}

export type ActionIntent =
  | 'LOCK_SYSTEM'
  | 'SLEEP_SYSTEM'
  | 'RESTART_SYSTEM'
  | 'SHUTDOWN_SYSTEM'
  | 'OPEN_BROWSER'
  | 'OPEN_APP'
  | 'STOP_LISTENING'
  | 'SYSTEM_STATUS'
  | 'SECURITY_CHECK'
  | 'MUTE_MIC'
  | 'UNKNOWN';

export interface ParsedCommand {
  intent: ActionIntent;
  confidence: number;
  language: 'en' | 'hi' | 'hinglish';
  targetApp?: string;
  isDestructive: boolean;
  explanation: string;
}
