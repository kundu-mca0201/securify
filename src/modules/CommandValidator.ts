import { ActionIntent, ParsedCommand } from './models';

export interface ValidationResult {
  isValid: boolean;
  requiresConfirmation: boolean;
  reason?: string;
  sanitizedTarget?: string;
}

export class CommandValidator {
  // Strict allowlist of safe applications that can be launched via voice
  private static ALLOWED_APPLICATIONS = new Set([
    'chrome',
    'google chrome',
    'safari',
    'firefox',
    'edge',
    'microsoft edge',
    'brave',
    'terminal',
    'iterm',
    'calculator',
    'code',
    'vscode',
    'visual studio code',
    'notes',
    'spotify',
    'slack',
    'discord',
    'browser',
  ]);

  // Strict allowlist of recognized intents
  private static ALLOWED_INTENTS = new Set<ActionIntent>([
    'LOCK_SYSTEM',
    'SLEEP_SYSTEM',
    'RESTART_SYSTEM',
    'SHUTDOWN_SYSTEM',
    'OPEN_BROWSER',
    'OPEN_APP',
    'STOP_LISTENING',
    'SYSTEM_STATUS',
    'SECURITY_CHECK',
    'MUTE_MIC',
  ]);

  public static validate(command: ParsedCommand, privacyModeActive: boolean): ValidationResult {
    // 1. Check Privacy Mode
    if (privacyModeActive && command.intent !== 'STOP_LISTENING' && command.intent !== 'MUTE_MIC') {
      return {
        isValid: false,
        requiresConfirmation: false,
        reason: 'Privacy Mode is currently ACTIVE. Voice command execution is blocked.',
      };
    }

    // 2. Intent Allowlist check
    if (!this.ALLOWED_INTENTS.has(command.intent)) {
      return {
        isValid: false,
        requiresConfirmation: false,
        reason: 'Security Alert: Intent is not permitted in system allowlist.',
      };
    }

    // 3. Confidence Threshold Check (Never execute on low confidence!)
    if (command.confidence < 0.65) {
      return {
        isValid: false,
        requiresConfirmation: false,
        reason: `Command confidence (${Math.round(command.confidence * 100)}%) is below security threshold (65%).`,
      };
    }

    // 4. App Launch Validation
    if (command.intent === 'OPEN_APP' || command.intent === 'OPEN_BROWSER') {
      const target = (command.targetApp || '').trim().toLowerCase();
      
      // Strict regex sanitization: only alphanumeric characters, spaces, dashes
      if (!/^[a-z0-9\s_-]+$/i.test(target)) {
        return {
          isValid: false,
          requiresConfirmation: false,
          reason: 'Security Violation: Disallowed characters in application target name.',
        };
      }

      if (command.intent === 'OPEN_APP' && !this.ALLOWED_APPLICATIONS.has(target)) {
        return {
          isValid: false,
          requiresConfirmation: false,
          reason: `App "${target}" is not in the trusted desktop allowlist. Allowed apps: Chrome, Safari, Terminal, Code, Notes, Slack, etc.`,
        };
      }

      return {
        isValid: true,
        requiresConfirmation: false,
        sanitizedTarget: target,
      };
    }

    // 5. Destructive Commands (Restart, Shutdown) MUST have confirmation
    if (command.isDestructive) {
      return {
        isValid: true,
        requiresConfirmation: true,
        reason: 'Destructive power command: Mandatory safety confirmation required.',
      };
    }

    return {
      isValid: true,
      requiresConfirmation: false,
    };
  }
}

