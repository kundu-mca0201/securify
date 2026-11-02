import React, { useState } from 'react';
import { Mic, MicOff, Send, Sparkles, Volume2, ShieldCheck, Terminal } from 'lucide-react';
import { VoiceStatus } from '../modules/models';
import { AiAssistantOrb } from './AiAssistantOrb';
import { AudioWaveform } from './AudioWaveform';

interface AiAssistantCenterProps {
  status: VoiceStatus;
  audioLevel: number;
  transcript: string;
  aiResponse: string;
  onToggleListening: () => void;
  onSubmitCommand: (text: string) => void;
  language: 'en' | 'hi' | 'hinglish';
  onChangeLanguage: (lang: 'en' | 'hi' | 'hinglish') => void;
}

export const AiAssistantCenter: React.FC<AiAssistantCenterProps> = ({
  status,
  audioLevel,
  transcript,
  aiResponse,
  onToggleListening,
  onSubmitCommand,
  language,
  onChangeLanguage,
}) => {
  const [typedInput, setTypedInput] = useState('');

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedInput.trim()) return;
    onSubmitCommand(typedInput.trim());
    setTypedInput('');
  };

  const sampleCommands = [
    { label: 'Lock laptop', text: 'Hey SecureMate, lock my laptop', lang: 'en' },
    { label: 'Computer lock karo', text: 'Computer lock karo', lang: 'hinglish' },
    { label: 'Put to sleep', text: 'Put my laptop to sleep', lang: 'en' },
    { label: 'Open Chrome', text: 'Open Chrome', lang: 'en' },
    { label: 'Security scan', text: 'Run security status check', lang: 'en' },
    { label: 'Stop listening', text: 'Stop listening', lang: 'en' },
  ];

  const getStatusBadge = () => {
    switch (status) {
      case 'listening':
        return {
          text: 'LISTENING FOR VOICE COMMAND...',
          color: 'text-cyan-300 border-cyan-400 bg-cyan-950/60 shadow-glow-cyan',
          dot: 'bg-cyan-400 animate-ping',
        };
      case 'processing':
        return {
          text: 'PARSING INTENT & VALIDATING POLICIES...',
          color: 'text-purple-300 border-purple-400 bg-purple-950/60 shadow-glow-violet',
          dot: 'bg-purple-400 animate-spin',
        };
      case 'speaking':
        return {
          text: 'TRANSMITTING VOICE RESPONSE...',
          color: 'text-emerald-300 border-emerald-400 bg-emerald-950/60',
          dot: 'bg-emerald-400 animate-pulse',
        };
      case 'ready':
        return {
          text: 'COMMAND EXECUTED — READY',
          color: 'text-blue-300 border-blue-400 bg-blue-950/60',
          dot: 'bg-blue-400',
        };
      default:
        return {
          text: 'SECURE STANDBY — CLICK OR SAY WAKE WORD',
          color: 'text-slate-400 border-slate-700 bg-surface-100',
          dot: 'bg-slate-500',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="flex flex-col items-center justify-between h-full max-w-4xl mx-auto py-2 px-4 select-none">
      {/* Top Language & Mode Selector */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono-cyber uppercase">Language Mode:</span>
          <div className="inline-flex rounded-lg bg-surface-100 p-0.5 border border-slate-800">
            {(['en', 'hinglish', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => onChangeLanguage(l)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === l
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l === 'en' ? 'English' : l === 'hi' ? 'हिंदी (Hindi)' : 'Hinglish'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-cyber text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-medium">Allowlist Active</span>
        </div>
      </div>

      {/* Central 3D Animated AI Orb */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <AiAssistantOrb
          status={status}
          audioLevel={audioLevel}
          onClickToggle={onToggleListening}
        />

        {/* Dynamic Status Pill */}
        <div
          className={`mt-2 px-4 py-1.5 rounded-full border text-xs font-mono-cyber font-bold tracking-wider flex items-center gap-2.5 transition-all duration-300 ${badge.color}`}
        >
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          {badge.text}
        </div>
      </div>

      {/* Real-time Audio Waveform */}
      <AudioWaveform isListening={status === 'listening'} audioLevel={audioLevel} />

      {/* Speech Transcription & AI Feedback Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Live Recognized Speech */}
        <div className="glass-panel-card p-3 rounded-xl min-h-[70px] flex flex-col justify-center border-l-4 border-l-cyan-400">
          <div className="flex items-center justify-between text-[11px] font-mono-cyber text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Mic className="w-3 h-3" /> LIVE RECOGNITION
            </span>
            <span>{language.toUpperCase()} ENGINE</span>
          </div>
          <p className="text-sm font-medium text-slate-100 italic">
            {transcript ? `"${transcript}"` : <span className="text-slate-500">Awaiting voice command input...</span>}
          </p>
        </div>

        {/* AI System Response */}
        <div className="glass-panel-card p-3 rounded-xl min-h-[70px] flex flex-col justify-center border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between text-[11px] font-mono-cyber text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-violet-400 font-semibold">
              <Volume2 className="w-3 h-3" /> SECUREMATE FEEDBACK
            </span>
            <span>OS HANDLER</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">
            {aiResponse || 'Systems initialized. Say "Hey SecureMate" or choose a quick command below.'}
          </p>
        </div>
      </div>

      {/* Suggested Command Chips */}
      <div className="w-full mb-3">
        <div className="flex items-center gap-1.5 mb-1.5 text-xs text-slate-400 font-mono-cyber">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>TRY SAMPLE VOICE COMMANDS:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleCommands.map((cmd, i) => (
            <button
              key={i}
              onClick={() => onSubmitCommand(cmd.text)}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-50 border border-slate-700/60 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all font-mono-cyber flex items-center gap-1.5 group"
            >
              <span className="text-slate-500 group-hover:text-cyan-400 font-bold">&gt;</span>
              <span>"{cmd.text}"</span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Cyber Command Bar */}
      <form onSubmit={handleSend} className="w-full flex items-center gap-2">
        <div className="relative flex-1">
          <Terminal className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder="Type voice command (e.g. 'lock my laptop', 'computer lock karo', 'open chrome')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-100/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-500 font-mono-cyber outline-none transition-all"
          />
        </div>

        <button
          type="button"
          onClick={onToggleListening}
          className={`p-2.5 rounded-xl border font-bold transition-all flex items-center justify-center ${
            status === 'listening'
              ? 'bg-rose-600/30 text-rose-400 border-rose-500 animate-pulse shadow-glow-crimson'
              : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/30 shadow-glow-cyan'
          }`}
          title={status === 'listening' ? 'Stop Listening' : 'Start Continuous Voice Listening'}
        >
          {status === 'listening' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          type="submit"
          disabled={!typedInput.trim()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-cyber font-bold tracking-wider flex items-center gap-1.5 shadow-glow-cyan transition-all"
        >
          <span>EXECUTE</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

