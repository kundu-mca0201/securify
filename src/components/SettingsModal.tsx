import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Sliders, Mic, Shield, Globe, Bell, Volume2, Keyboard } from 'lucide-react';
import { AppSettings } from '../modules/models';
import { SettingsManager } from '../modules/SettingsManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChanged,
}) => {
  const [settings, setSettings] = useState<AppSettings>(SettingsManager.getSettings());
  const [activeSubTab, setActiveSubTab] = useState<'voice' | 'security' | 'system' | 'shortcuts'>('voice');

  useEffect(() => {
    if (isOpen) {
      setSettings(SettingsManager.getSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const saved = SettingsManager.updateSettings(settings);
    onSettingsChanged(saved);
    onClose();
  };

  const handleReset = () => {
    const res = SettingsManager.resetDefaults();
    setSettings(res);
    onSettingsChanged(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel-glow rounded-2xl border border-cyan-500/40 p-6 shadow-glow-cyan overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-cyber font-bold text-white tracking-wider">
                SECUREMATE CONFIGURATION
              </h3>
              <p className="text-xs text-slate-400 font-mono-cyber">
                Tweak system parameters, neural voice thresholds, and device policies
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-surface-100 hover:bg-surface-50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 py-3">
          {[
            { id: 'voice', label: 'Voice & Language', icon: Mic },
            { id: 'security', label: 'Security & Privacy', icon: Shield },
            { id: 'system', label: 'Startup & Audio', icon: Bell },
            { id: 'shortcuts', label: 'Hotkeys & Shortcuts', icon: Keyboard },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {activeSubTab === 'voice' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono-cyber text-slate-300 block mb-1.5">
                  PRIMARY LANGUAGE MODEL
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value as any })}
                  className="w-full bg-surface-100 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400 font-mono-cyber"
                >
                  <option value="en">English (US/UK) — International</option>
                  <option value="hinglish">Hinglish (Hindi-English colloquial)</option>
                  <option value="hi">हिंदी (Hindi Devanagari)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports bilingual parsing ("Computer lock karo", "Shutdown laptop", "ब्राउज़र खोलो").
                </p>
              </div>

              <div>
                <label className="text-xs font-mono-cyber text-slate-300 block mb-1.5">
                  WAKE WORD ACTIVATION PHRASE
                </label>
                <input
                  type="text"
                  value={settings.wakeWord}
                  onChange={(e) => setSettings({ ...settings, wakeWord: e.target.value })}
                  placeholder="Hey SecureMate"
                  className="w-full bg-surface-100 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400 font-mono-cyber"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono-cyber text-slate-300 mb-1.5">
                  <span>VOICE SENSITIVITY THRESHOLD:</span>
                  <span className="text-cyan-400 font-bold">{settings.voiceSensitivity} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.voiceSensitivity}
                  onChange={(e) => setSettings({ ...settings, voiceSensitivity: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-surface-100 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Higher sensitivity triggers on subtler background vocal frequencies.
                </p>
              </div>

              <div>
                <label className="text-xs font-mono-cyber text-slate-300 block mb-1.5">
                  SPEECH RECOGNITION ENGINE
                </label>
                <select
                  value={settings.speechEngine}
                  onChange={(e) => setSettings({ ...settings, speechEngine: e.target.value as any })}
                  className="w-full bg-surface-100 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400 font-mono-cyber"
                >
                  <option value="web-speech">Web Speech Engine (Built-in High Accuracy)</option>
                  <option value="vosk-local">Vosk Offline Embedded Neural Engine</option>
                  <option value="whisper-local">OpenAI Whisper Tiny Offline Model</option>
                </select>
              </div>
            </div>
          )}

          {activeSubTab === 'security' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-100 border border-slate-800">
                <div>
                  <div className="text-xs font-cyber font-bold text-slate-200">PRIVACY MODE</div>
                  <div className="text-[11px] text-slate-400">
                    Completely disconnects microphone and suppresses speech input recognition.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacyMode}
                  onChange={(e) => setSettings({ ...settings, privacyMode: e.target.checked })}
                  className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-100 border border-slate-800">
                <div>
                  <div className="text-xs font-cyber font-bold text-slate-200">
                    DESTRUCTIVE ACTION SAFETY PIN / CONFIRMATION
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Mandatory countdown confirmation dialog before Restart and Shutdown.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requirePinForDestructive}
                  onChange={(e) => setSettings({ ...settings, requirePinForDestructive: e.target.checked })}
                  className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-mono-cyber text-slate-300 block mb-1.5">
                  SECURITY ENCLAVE DEFENSE PROFILE
                </label>
                <select
                  value={settings.securityShieldLevel}
                  onChange={(e) => setSettings({ ...settings, securityShieldLevel: e.target.value as any })}
                  className="w-full bg-surface-100 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400 font-mono-cyber"
                >
                  <option value="maximum">Maximum (Full allowlist, Strict biometric handoff)</option>
                  <option value="standard">Standard (Allowlist verified, OS confirmation)</option>
                  <option value="minimal">Minimal (Developer test mode)</option>
                </select>
              </div>
            </div>
          )}

          {activeSubTab === 'system' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-100 border border-slate-800">
                <div>
                  <div className="text-xs font-cyber font-bold text-slate-200">START ON SYSTEM STARTUP</div>
                  <div className="text-[11px] text-slate-400">
                    Launch SecureMate AI automatically when OS boots up.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.startOnStartup}
                  onChange={(e) => setSettings({ ...settings, startOnStartup: e.target.checked })}
                  className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-100 border border-slate-800">
                <div>
                  <div className="text-xs font-cyber font-bold text-slate-200">FUTURISTIC SOUND EFFECTS</div>
                  <div className="text-[11px] text-slate-400">
                    Synthesized sci-fi chimes, wake cues, and acoustic confirmation tones.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundFeedback}
                  onChange={(e) => setSettings({ ...settings, soundFeedback: e.target.checked })}
                  className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-100 border border-slate-800">
                <div>
                  <div className="text-xs font-cyber font-bold text-slate-200">DESKTOP NOTIFICATIONS</div>
                  <div className="text-[11px] text-slate-400">
                    Display notification banners on completed or blocked voice commands.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationPreferences}
                  onChange={(e) => setSettings({ ...settings, notificationPreferences: e.target.checked })}
                  className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeSubTab === 'shortcuts' && (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-surface-100 border border-slate-800 flex justify-between items-center text-xs font-mono-cyber">
                <span className="text-slate-300">Toggle Voice Listening:</span>
                <span className="px-2 py-1 bg-surface-200 border border-cyan-500/30 text-cyan-400 rounded">
                  Ctrl + Space / ⌘ + Space
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-100 border border-slate-800 flex justify-between items-center text-xs font-mono-cyber">
                <span className="text-slate-300">Emergency Panic Stop:</span>
                <span className="px-2 py-1 bg-surface-200 border border-rose-500/30 text-rose-400 rounded">
                  Esc + Esc
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-100 border border-slate-800 flex justify-between items-center text-xs font-mono-cyber">
                <span className="text-slate-300">Instant Lock Laptop:</span>
                <span className="px-2 py-1 bg-surface-200 border border-slate-700 text-slate-300 rounded">
                  Ctrl + Alt + L
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-100 border border-slate-800 flex justify-between items-center text-xs font-mono-cyber">
                <span className="text-slate-300">Open Security Center:</span>
                <span className="px-2 py-1 bg-surface-200 border border-slate-700 text-slate-300 rounded">
                  Alt + S
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-mono-cyber"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DEFAULTS</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-50 border border-slate-700 text-xs font-cyber font-bold text-slate-300"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-cyber font-bold tracking-wider shadow-glow-cyan flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>SAVE CONFIGURATION</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
