import React from 'react';
import { Lock, Moon, RotateCcw, Power, Globe, Terminal, Code2, Music, CheckCircle2 } from 'lucide-react';
import { ActionIntent } from '../modules/models';

interface QuickCommandsProps {
  onTriggerIntent: (intent: ActionIntent, appName?: string) => void;
  osName: string;
}

export const QuickCommands: React.FC<QuickCommandsProps> = ({ onTriggerIntent, osName }) => {
  const commands = [
    {
      intent: 'LOCK_SYSTEM' as ActionIntent,
      title: 'Lock Laptop',
      hindiDesc: 'कंप्यूटर तुरंत सुरक्षित लॉक करें',
      desc: `Engages native ${osName} session lock screen`,
      icon: Lock,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400 hover:border-cyan-400',
      destructive: false,
      badge: 'SAFE',
    },
    {
      intent: 'SLEEP_SYSTEM' as ActionIntent,
      title: 'Sleep Mode',
      hindiDesc: 'स्लीप मोड में डालें',
      desc: 'Suspends CPU cycles and displays to low power',
      icon: Moon,
      color: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/40 text-indigo-400 hover:border-indigo-400',
      destructive: false,
      badge: 'SAFE',
    },
    {
      intent: 'RESTART_SYSTEM' as ActionIntent,
      title: 'Restart Computer',
      hindiDesc: 'कंप्यूटर रीस्टार्ट करें',
      desc: 'Gracefully flushes buffers and reboots workstation',
      icon: RotateCcw,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400 hover:border-amber-400',
      destructive: true,
      badge: 'CONFIRMATION REQ',
    },
    {
      intent: 'SHUTDOWN_SYSTEM' as ActionIntent,
      title: 'Shutdown Laptop',
      hindiDesc: 'कंप्यूटर पूर्ण रूप से बंद करें',
      desc: 'Saves OS state and disconnects power supply',
      icon: Power,
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-400 hover:border-rose-400',
      destructive: true,
      badge: 'DESTRUCTIVE',
    },
    {
      intent: 'OPEN_BROWSER' as ActionIntent,
      title: 'Open Web Browser',
      hindiDesc: 'सुरक्षित ब्राउज़र खोलें',
      desc: 'Launches default secure browser session',
      icon: Globe,
      color: 'from-cyan-500/20 to-teal-500/10 border-teal-500/40 text-teal-400 hover:border-teal-400',
      destructive: false,
      badge: 'SANDBOXED',
    },
    {
      intent: 'OPEN_APP' as ActionIntent,
      appName: 'code',
      title: 'Open VS Code',
      hindiDesc: 'कोड एडिटर खोलें',
      desc: 'Launches Visual Studio Code developer environment',
      icon: Code2,
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/40 text-blue-400 hover:border-blue-400',
      destructive: false,
      badge: 'ALLOWLISTED',
    },
    {
      intent: 'OPEN_APP' as ActionIntent,
      appName: 'terminal',
      title: 'Open Terminal',
      hindiDesc: 'कमांड टर्मिनल लॉन्च करें',
      desc: 'Launches native command shell window',
      icon: Terminal,
      color: 'from-violet-500/20 to-purple-500/10 border-violet-500/40 text-violet-400 hover:border-violet-400',
      destructive: false,
      badge: 'AUDITED',
    },
    {
      intent: 'OPEN_APP' as ActionIntent,
      appName: 'spotify',
      title: 'Open Spotify',
      hindiDesc: 'म्यूजिक ऐप खोलें',
      desc: 'Launches verified music media player',
      icon: Music,
      color: 'from-emerald-500/20 to-green-500/10 border-emerald-500/40 text-emerald-400 hover:border-emerald-400',
      destructive: false,
      badge: 'MEDIA',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-cyber text-slate-100 flex items-center gap-2">
            <span>QUICK COMMAND MATRIX</span>
            <span className="text-xs font-mono-cyber font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              ONE-TOUCH CONTROLS
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hardware-level operations secured with cryptographic validation and safety gates.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-cyber text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Allowlist Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {commands.map((cmd, i) => {
          const Icon = cmd.icon;
          return (
            <div
              key={i}
              onClick={() => onTriggerIntent(cmd.intent, cmd.appName)}
              className={`glass-panel-card p-4 rounded-xl cursor-pointer border flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${cmd.color}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-surface-200/80 border border-white/5 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-[9px] font-mono-cyber font-bold px-1.5 py-0.5 rounded border ${
                    cmd.destructive
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700'
                  }`}
                >
                  {cmd.badge}
                </span>
              </div>

              <div>
                <h3 className="font-cyber font-bold text-sm text-slate-100 group-hover:text-white transition-colors">
                  {cmd.title}
                </h3>
                <div className="text-[11px] text-cyan-400/90 font-medium my-0.5">
                  {cmd.hindiDesc}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {cmd.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono-cyber text-slate-400 group-hover:text-cyan-300">
                <span>INTENT: {cmd.intent}</span>
                <span className="font-bold">&rarr;</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
