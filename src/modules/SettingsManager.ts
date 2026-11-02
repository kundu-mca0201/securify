import { AppSettings } from './models';

const SETTINGS_STORAGE_KEY = 'securemate_settings_v1';

export class SettingsManager {
  private static defaultSettings: AppSettings = {
    startOnStartup: false,
    microphoneDeviceId: 'default',
    language: 'en', // 'en' | 'hi' | 'hinglish'
    wakeWord: 'Hey SecureMate',
    voiceSensitivity: 7,
    speechEngine: 'web-speech',
    notificationPreferences: true,
    privacyMode: false,
    soundFeedback: true,
    requirePinForDestructive: true,
    securityShieldLevel: 'maximum',
  };

  public static getSettings(): AppSettings {
    if (typeof window === 'undefined') return this.defaultSettings;
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...this.defaultSettings, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return this.defaultSettings;
  }

  public static updateSettings(partial: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Quota error
    }
    return updated;
  }

  public static resetDefaults(): AppSettings {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {
      // Ignore
    }
    return this.defaultSettings;
  }
}

