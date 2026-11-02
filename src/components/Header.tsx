import React from 'react';
import { Shield, ShieldAlert, Mic, MicOff, Settings, AlertOctagon, Activity, Radio, Lock } from 'lucide-react';
import { VoiceStatus } from '../modules/models';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  voiceStatus: VoiceStatus;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  onEmergencyStop: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  voiceStatus,
  privacyMode,
  onTogglePrivacy,
  onEmergencyStop,
  onOpenSettings,
}) => {
  const isListening = voiceStatus === 'listening';

  return (
    <header className="w-full glass-panel border-b border-cyan-500/20 px-4 py-3 flex items-center justify-between relative z-40">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer" onClick={() => setActiveTab('assistant')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 p-[1.5px] shadow-glow-cyan">
            <div className="w-full h-full bg-surface-200 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          {isListening && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-violet-400 font-cyber">
              SECUREMATE <span className="text-cyan-400">AI</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] uppercase font-mono-cyber font-semibold tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 rounded-full">
              v2.4 Pro
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">
            Your Voice. Your Laptop. Your Security.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="hidden lg:flex items-center gap-1 bg-surface-100/70 p-1 rounded-xl border border-slate-800">
        {[
          { id: 'assistant', label: 'AI Assistant', icon: Radio },
          { id: 'status', label: 'System Status', icon: Activity },
          { id: 'commands', label: 'Quick Commands', icon: Lock },
          { id: 'security', label: 'Security Center', icon: ShieldAlert },
          { id: 'history', label: 'Activity Logs', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Control Actions & Status */}
      <div className="flex items-center gap-2.5">
        {/* Microphone Status Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-mono-cyber transition-all ${
            isListening
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-glow-cyan'
              : privacyMode
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}
        >
          {isListening ? (
            <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          ) : (
            <MicOff className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span className="hidden sm:inline">
            {isListening ? 'MIC ACTIVE' : privacyMode ? 'PRIVACY MUTED' : 'MIC STANDBY'}
          </span>
        </div>

        {/* Privacy Mode Quick Toggle */}
        <button
          onClick={onTogglePrivacy}
          title={privacyMode ? 'Disable Privacy Mode' : 'Enable Privacy Mode (Mutes mic and blocks voice telemetry)'}
          className={`p-2 rounded-lg border transition-all text-xs font-semibold flex items-center gap-1.5 ${
            privacyMode
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-glow-crimson'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span className="hidden md:inline">{privacyMode ? 'Privacy: ON' : 'Privacy'}</span>
        </button>

        {/* Emergency Stop Listening Button */}
        <button
          onClick={onEmergencyStop}
          title="Emergency Stop: Instantly kill microphone listening and audio synthesis"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-xs font-bold font-cyber hover:shadow-glow-crimson transition-all active:scale-95"
        >
          <AlertOctagon className="w-4 h-4 text-rose-500" />
          <span className="hidden md:inline">PANIC STOP</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Open Settings"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
