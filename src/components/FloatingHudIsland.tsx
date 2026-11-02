import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Lock,
  ArrowUp,
  ArrowDown,
  Minimize2,
  Maximize2,
  Globe,
  Shield,
  Zap,
} from 'lucide-react';
import { VoiceStatus } from '../modules/models';

interface FloatingHudIslandProps {
  voiceStatus: VoiceStatus;
  audioLevel: number;
  transcript: string;
  aiResponse: string;
  privacyMode: boolean;
  onToggleListening: () => void;
  onTogglePrivacy: () => void;
  onTriggerLock: () => void;
  onTriggerBrowser: () => void;
}

export const FloatingHudIsland: React.FC<FloatingHudIslandProps> = ({
  voiceStatus,
  audioLevel,
  transcript,
  aiResponse,
  privacyMode,
  onToggleListening,
  onTogglePrivacy,
  onTriggerLock,
  onTriggerBrowser,
}) => {
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const isListening = voiceStatus === 'listening';
  const isSpeaking = voiceStatus === 'speaking';
  const isProcessing = voiceStatus === 'processing';

  // Toggle Top / Bottom screen position
  const togglePosition = () => {
    setPosition((prev) => (prev === 'top' ? 'bottom' : 'top'));
  };

  return (
    <aside
      aria-label="Floating AI Assistant HUD"
      className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out select-none ${
        position === 'top' ? 'top-3 md:top-4' : 'bottom-3 md:bottom-4'
      }`}
    >
      {/* Collapsed Compact Floating Orb Pill */}
      {isMinimized ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:border-cyan-400 transition-all">
          {/* Mini Orb Indicator */}
          <button
            onClick={onToggleListening}
            title={isListening ? 'Click to Turn OFF' : 'Click to Turn ON'}
            className="relative flex items-center justify-center cursor-pointer group"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-gradient-to-tr from-cyan-500 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)] animate-pulse'
                  : privacyMode
                  ? 'bg-rose-950/80 border border-rose-500/60'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              {isListening ? (
                <Mic className="w-4 h-4 text-slate-950" />
              ) : (
                <MicOff className="w-4 h-4 text-slate-400" />
              )}
            </div>
            {isListening && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </button>

          {/* Quick status label */}
          <div className="text-left pr-1 cursor-pointer" onClick={() => setIsMinimized(false)}>
            <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1">
              <span>SECUREMATE</span>
              <span
                className={`px-1 rounded text-[9px] ${
                  isListening
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isListening ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium truncate max-w-[130px]">
              {transcript || (isListening ? 'Listening...' : 'Standby')}
            </div>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setIsMinimized(false)}
            title="Expand Full Screen HUD"
            className="p-1 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Expanded Dynamic Island HUD Bar */
        <div className="flex flex-col md:flex-row items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/35 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.18)] hover:border-cyan-400/50 transition-all max-w-[95vw] md:max-w-2xl">
          {/* Left: Interactive ON / OFF Switch */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onToggleListening}
              title={isListening ? 'Click to Turn OFF AI Listening' : 'Click to Turn ON AI Listening'}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-r from-emerald-500/25 to-cyan-500/20 border border-emerald-400/60 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:bg-emerald-500/30'
                  : 'bg-slate-900 border border-slate-700/80 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              {isListening ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                  </span>
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI: ON</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-slate-600"></span>
                  <MicOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>AI: OFF</span>
                </>
              )}
            </button>

            {/* Audio Waveform Bars (Active when listening) */}
            <div className="flex items-center gap-0.5 h-4 px-1">
              {[0.4, 0.8, 1.2, 0.7, 0.5].map((multiplier, i) => {
                const height = isListening
                  ? Math.max(3, Math.min(16, (audioLevel * 100 + 4) * multiplier))
                  : isSpeaking
                  ? 10
                  : 3;
                return (
                  <span
                    key={i}
                    style={{ height: `${height}px` }}
                    className={`w-0.5 rounded-full transition-all duration-75 ${
                      isListening
                        ? 'bg-cyan-400'
                        : isSpeaking
                        ? 'bg-violet-400 animate-pulse'
                        : 'bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Center: Live Transcript / Speech Indicator */}
          <div className="flex-1 min-w-[160px] max-w-[280px] text-center md:text-left truncate px-2">
            {transcript ? (
              <span className="text-xs font-semibold text-cyan-300 animate-pulse">
                "{transcript}"
              </span>
            ) : isSpeaking ? (
              <span className="text-xs font-semibold text-violet-300 flex items-center gap-1 justify-center md:justify-start">
                <Zap className="w-3 h-3 text-violet-400" /> Assistant Speaking...
              </span>
            ) : isProcessing ? (
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1 justify-center md:justify-start">
                <Zap className="w-3 h-3 text-amber-400 animate-spin" /> Processing...
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-mono tracking-tight truncate block">
                {isListening
                  ? 'Say "Lock laptop" or "Open Chrome"'
                  : 'Click [AI: OFF] to Activate Voice'}
              </span>
            )}
          </div>

          {/* Right: Quick Controls (Position, Lock, Browser, Minimize) */}
          <div className="flex items-center gap-1 border-t md:border-t-0 md:border-l border-slate-800/80 pt-1.5 md:pt-0 md:pl-2">
            {/* Quick Lock Button */}
            <button
              onClick={onTriggerLock}
              title="Instant Lock Workstation"
              className="p-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>

            {/* Quick Browser Button */}
            <button
              onClick={onTriggerBrowser}
              title="Launch Browser"
              className="p-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-blue-400 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>

            {/* Position Toggle: Top / Bottom */}
            <button
              onClick={togglePosition}
              title={
                position === 'top'
                  ? 'Move HUD to Bottom of Screen'
                  : 'Move HUD to Top of Screen'
              }
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 hover:text-cyan-300 transition-colors"
            >
              {position === 'top' ? (
                <>
                  <ArrowDown className="w-3 h-3 text-cyan-400" />
                  <span>Bottom</span>
                </>
              ) : (
                <>
                  <ArrowUp className="w-3 h-3 text-cyan-400" />
                  <span>Top</span>
                </>
              )}
            </button>

            {/* Minimize / Collapse Button */}
            <button
              onClick={() => setIsMinimized(true)}
              title="Minimize to Floating Pill"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
