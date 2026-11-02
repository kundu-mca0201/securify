import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { ParsedCommand } from '../modules/models';

interface ConfirmationModalProps {
  command: ParsedCommand | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  command,
  onConfirm,
  onCancel,
}) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!command) return;
    setCountdown(10);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onCancel(); // Safety auto-cancel after 10 seconds if no explicit user interaction!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [command, onCancel]);

  if (!command) return null;

  const isShutdown = command.intent === 'SHUTDOWN_SYSTEM';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel-glow border-2 border-rose-500/80 rounded-2xl p-6 shadow-glow-crimson overflow-hidden">
        {/* Top Danger Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-rose-400 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-cyber font-bold text-white tracking-wider">
              {isShutdown ? 'SYSTEM SHUTDOWN CONFIRMATION' : 'SYSTEM RESTART CONFIRMATION'}
            </h3>
            <span className="text-[11px] font-mono-cyber text-rose-400">
              DESTRUCTIVE OPERATION SAFETY GATE
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <p className="text-sm text-slate-200">
            A voice instruction was parsed requesting:{' '}
            <strong className="text-cyan-400 font-mono-cyber">
              {command.intent}
            </strong>
          </p>

          <div className="p-3 rounded-xl bg-surface-200/90 border border-slate-700 text-xs font-mono-cyber text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Confidence Score:</span>
              <span className="text-emerald-400 font-bold">
                {Math.round(command.confidence * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Language Detected:</span>
              <span className="text-cyan-400 uppercase">{command.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Auto-Abort In:</span>
              <span className="text-rose-400 font-bold">{countdown}s</span>
            </div>
          </div>

          <p className="text-xs text-rose-300/90 leading-relaxed">
            Unsaved application states will be terminated. Please confirm whether you wish to execute this operation.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-slate-700 text-xs font-cyber font-bold tracking-wider text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>ABORT (CANCEL)</span>
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-cyber font-bold tracking-wider shadow-glow-crimson transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-white" />
            <span>CONFIRM & EXECUTE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

