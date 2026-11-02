import React from 'react';
import { Cpu, ShieldCheck, Lock, Mic, Activity, HardDrive, Battery, RefreshCw } from 'lucide-react';
import { SystemStatus, VoiceStatus } from '../modules/models';

interface ComputerStatusProps {
  status: SystemStatus;
  voiceStatus: VoiceStatus;
  privacyMode: boolean;
  onRefresh: () => void;
}

export const ComputerStatus: React.FC<ComputerStatusProps> = ({
  status,
  voiceStatus,
  privacyMode,
  onRefresh,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      {/* Top Banner with Host and Security Rating */}
      <div className="glass-panel-glow p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan">
            <Cpu className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-cyber text-white tracking-wide">
                {status.computerModel}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono-cyber font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full">
                DEVICE SECURED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono-cyber mt-0.5">
              OS: {status.osVersion} • Host: {status.hostname} • Uptime: {status.uptime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[11px] font-mono-cyber text-slate-400 uppercase">Security Rating</div>
            <div className="text-2xl font-black font-cyber text-cyan-400 flex items-center justify-end gap-1">
              <span>{status.securityScore}</span>
              <span className="text-sm text-cyan-600">/ 100</span>
            </div>
          </div>

          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition-all"
            title="Refresh System Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Computer Diagnostics & Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Operating System */}
        <div className="glass-panel-card p-4 rounded-xl space-y-2 border-l-2 border-l-cyan-400">
          <div className="flex items-center justify-between text-xs font-mono-cyber text-slate-400">
            <span className="flex items-center gap-2 text-cyan-400 font-semibold">
              <HardDrive className="w-4 h-4" /> OPERATING SYSTEM
            </span>
            <span className="text-[11px] bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
              NATIVE
            </span>
          </div>
          <div className="text-lg font-bold text-slate-100 font-cyber">{status.os}</div>
          <div className="text-xs text-slate-400 font-mono-cyber">
            Kernel architecture validated. Platform lock bindings operational.
          </div>
        </div>

        {/* 2. Workstation Lock Status */}
        <div className="glass-panel-card p-4 rounded-xl space-y-2 border-l-2 border-l-blue-500">
          <div className="flex items-center justify-between text-xs font-mono-cyber text-slate-400">
            <span className="flex items-center gap-2 text-blue-400 font-semibold">
              <Lock className="w-4 h-4" /> WORKSTATION LOCK
            </span>
            <span className="text-[11px] bg-blue-950/60 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
              PROTECTED
            </span>
          </div>
          <div className="text-lg font-bold text-slate-100 font-cyber">
            {status.isLocked ? 'SESSION LOCKED' : 'UNLOCKED (ACTIVE)'}
          </div>
          <div className="text-xs text-slate-400 font-mono-cyber">
            Native OS login barrier intact. Passwords never bypassed.
          </div>
        </div>

        {/* 3. Microphone Status */}
        <div className="glass-panel-card p-4 rounded-xl space-y-2 border-l-2 border-l-violet-500">
          <div className="flex items-center justify-between text-xs font-mono-cyber text-slate-400">
            <span className="flex items-center gap-2 text-violet-400 font-semibold">
              <Mic className="w-4 h-4" /> MICROPHONE SENSOR
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded border ${
                voiceStatus === 'listening'
                  ? 'bg-cyan-950 text-cyan-400 border-cyan-700 animate-pulse'
                  : privacyMode
                  ? 'bg-rose-950 text-rose-400 border-rose-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {voiceStatus === 'listening' ? 'CAPTURING' : privacyMode ? 'HARDWARE MUTED' : 'STANDBY'}
            </span>
          </div>
          <div className="text-lg font-bold text-slate-100 font-cyber">
            {voiceStatus === 'listening' ? 'STREAM RECORDING' : privacyMode ? 'PRIVACY MUTED' : 'IDLE / READY'}
          </div>
          <div className="text-xs text-slate-400 font-mono-cyber">
            {privacyMode ? 'Microphone completely detached' : 'Zero background audio stored to disk'}
          </div>
        </div>

        {/* 4. Voice Recognition Engine */}
        <div className="glass-panel-card p-4 rounded-xl space-y-2 border-l-2 border-l-purple-500">
          <div className="flex items-center justify-between text-xs font-mono-cyber text-slate-400">
            <span className="flex items-center gap-2 text-purple-400 font-semibold">
              <Activity className="w-4 h-4" /> RECOGNITION ENGINE
            </span>
            <span className="text-[11px] bg-purple-950/60 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
              OFFLINE / LOCAL
            </span>
          </div>
          <div className="text-lg font-bold text-slate-100 font-cyber">SECUREMATE VOSK/WHISPER</div>
          <div className="text-xs text-slate-400 font-mono-cyber">
            Multi-lingual intent processor active (English, Hindi, Hinglish).
          </div>
        </div>

        {/* 5. Biometrics & Authentication */}
        <div className="glass-panel-card p-4 rounded-xl space-y-2 border-l-2 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs font-mono-cyber text-slate-400">
            <span className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> BIOMETRIC ENCLAVE
            </span>
            <span className="text-[11px] bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
              ACTIVE
            </span>
          </div>
          <div className="text-lg font-bold text-slate-100 font-cyber">TOUCH ID / HELLO</div>
          <div className="text-xs text-slate-400 font-mono-cyber">
            Hardware security key handoff supported. Voice-only unlock prohibited.
          </div>
        </div>

        {/* 6. Power & Battery Status */}
        <div className="glass-panel-card p-4 rounded-xl space-y-2 border-l-2 border-l-amber-500">
          <div className="flex items-center justify-between text-xs font-mono-cyber text-slate-400">
            <span className="flex items-center gap-2 text-amber-400 font-semibold">
              <Battery className="w-4 h-4" /> POWER STATE
            </span>
            <span className="text-[11px] bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
              {status.isCharging ? 'CHARGING' : 'BATTERY'}
            </span>
          </div>
          <div className="text-lg font-bold text-slate-100 font-cyber">
            {status.batteryLevel !== undefined ? `${status.batteryLevel}%` : 'AC POWERED'}
          </div>
          <div className="text-xs text-slate-400 font-mono-cyber">
            Thermal sensors normal. Low-power sleep commands enabled.
          </div>
        </div>
      </div>
    </div>
  );
};
