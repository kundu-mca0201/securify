import { ActivityLog } from './models';

const STORAGE_KEY = 'securemate_activity_logs_v1';

export class ActivityLogger {
  private static logs: ActivityLog[] = [];
  private static initialized = false;

  private static init() {
    if (this.initialized || typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      } else {
        // Pre-seed initial security events so user sees a rich history
        this.logs = [
          {
            id: 'log-001',
            timestamp: new Date(Date.now() - 1000 * 60 * 18).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            rawCommand: 'Hey SecureMate, lock my laptop',
            recognizedIntent: 'LOCK_SYSTEM',
            language: 'en',
            confidence: 0.98,
            status: 'completed',
            feedback: 'Workstation screen locked successfully via native OS API',
            isSecurityEvent: true,
            executionTimeMs: 42,
          },
          {
            id: 'log-002',
            timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            rawCommand: 'computer lock karo',
            recognizedIntent: 'LOCK_SYSTEM',
            language: 'hinglish',
            confidence: 0.95,
            status: 'completed',
            feedback: 'Workstation locked in response to Hinglish voice intent',
            isSecurityEvent: true,
            executionTimeMs: 38,
          },
          {
            id: 'log-003',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            rawCommand: 'open chrome',
            recognizedIntent: 'OPEN_BROWSER',
            language: 'en',
            confidence: 0.94,
            status: 'completed',
            feedback: 'Validated application in allowlist and spawned process',
            isSecurityEvent: false,
            executionTimeMs: 110,
          },
          {
            id: 'log-004',
            timestamp: new Date(Date.now() - 1000 * 60 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            rawCommand: 'delete all root files',
            recognizedIntent: 'UNKNOWN',
            language: 'en',
            confidence: 0.2,
            status: 'blocked',
            feedback: 'Security Violation: Arbitrary command blocked by security policy allowlist',
            isSecurityEvent: true,
            executionTimeMs: 4,
          },
        ];
        this.save();
      }
    } catch {
      this.logs = [];
    }
    this.initialized = true;
  }

  private static save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs.slice(0, 200)));
    } catch {
      // Storage quota or error
    }
  }

  public static getLogs(): ActivityLog[] {
    this.init();
    return [...this.logs];
  }

  public static log(entry: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
    this.init();
    const newLog: ActivityLog = {
      ...entry,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    this.logs.unshift(newLog);
    this.save();
    return newLog;
  }

  public static clearLogs() {
    this.logs = [];
    this.save();
  }

  public static exportJSON(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  }
}

