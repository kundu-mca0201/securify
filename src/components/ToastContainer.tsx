import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { CyberToast, NotificationManager } from '../modules/NotificationManager';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<CyberToast[]>([]);

  useEffect(() => {
    return NotificationManager.subscribe((list) => {
      setToasts([...list]);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        let border = 'border-cyan-500/50 text-cyan-400';
        let bg = 'bg-cyan-950/90 shadow-glow-cyan';
        let Icon = Info;

        if (t.type === 'success') {
          border = 'border-emerald-500/50 text-emerald-400';
          bg = 'bg-emerald-950/90';
          Icon = ShieldCheck;
        } else if (t.type === 'warning') {
          border = 'border-amber-500/50 text-amber-400';
          bg = 'bg-amber-950/90';
          Icon = AlertTriangle;
        } else if (t.type === 'danger') {
          border = 'border-rose-500/50 text-rose-400';
          bg = 'bg-rose-950/90 shadow-glow-crimson';
          Icon = AlertCircle;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3 rounded-xl border backdrop-blur-md flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-right-4 ${border} ${bg}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-cyber font-bold text-white tracking-wide">
                {t.title}
              </div>
              <p className="text-xs text-slate-200 mt-0.5 break-words font-medium">
                {t.message}
              </p>
              <span className="text-[10px] text-slate-400 font-mono-cyber mt-1 block">
                {t.timestamp}
              </span>
            </div>
            <button
              onClick={() => NotificationManager.dismiss(t.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
