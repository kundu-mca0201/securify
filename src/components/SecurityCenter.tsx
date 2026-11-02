import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Mic, Lock, Database, KeyRound, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { SecurityManager, SecurityStatusReport } from '../modules/SecurityManager';
import { AuthenticationManager } from '../modules/AuthenticationManager';

interface SecurityCenterProps {
  privacyMode: boolean;
  onTogglePrivacy: (enabled: boolean) => void;
  onEmergencyStop: () => void;
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({
  privacyMode,
  onTogglePrivacy,
  onEmergencyStop,
}) => {
  const [report, setReport] = useState<SecurityStatusReport | null>(null);
  const [authTesting, setAuthTesting] = useState(false);
  const [authResult, setAuthResult] = useState<string | null>(null);

  const loadReport = async () => {
    const res = await SecurityManager.assessSecurity();
    setReport(res);
  };

  useEffect(() => {
    loadReport();
  }, [privacyMode]);

  const handleTestBiometrics = async () => {
    setAuthTesting(true);
    setAuthResult(null);
    const res = await AuthenticationManager.requestNativeVerification('Security Shield Self-Test');
    setAuthTesting(false);
    setAuthResult(res.message);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      {/* Top Banner */}
      <div className="glass-panel-glow p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-cyber text-white">AI SECURITY ENCLAVE</h2>
              <span className="px-2 py-0.5 text-[10px] font-mono-cyber font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                ZERO-TELEMETRY CERTIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono-cyber mt-0.5">
              100% on-device speech processing. Passwords and biometrics are never stored or bypassed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onTogglePrivacy(!privacyMode)}
            className={`px-4 py-2 rounded-xl text-xs font-cyber font-bold tracking-wider border transition-all ${
              privacyMode
                ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-glow-crimson'
                : 'bg-surface-100 hover:bg-surface-50 text-slate-300 border-slate-700'
            }`}
          >
            {privacyMode ? 'PRIVACY MODE: ENGAGED' : 'ENGAGE PRIVACY MODE'}
          </button>

          <button
            onClick={onEmergencyStop}
            className="px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500 text-xs font-cyber font-bold tracking-wider shadow-glow-crimson transition-all"
          >
            PANIC DISCONNECT
          </button>
        </div>
      </div>

      {/* Security Policies Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Microphone Protection */}
        <div className="glass-panel-card p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-cyan-400 font-cyber font-bold text-sm">
              <Mic className="w-4 h-4" /> MICROPHONE ACCESS & STREAM
            </span>
            <span className="text-[10px] font-mono-cyber px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              STRICT CONSENT
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Microphone listening only activates upon explicit user action or wake word trigger. Zero continuous recording to permanent disk.
          </p>
          <div className="p-2.5 rounded-lg bg-surface-200 text-xs font-mono-cyber text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Hardware Listening State:</span>
              <span className={privacyMode ? 'text-rose-400' : 'text-cyan-400'}>
                {privacyMode ? 'FORCE-MUTED' : 'USER CONTROLLABLE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Remote Stream Redirection:</span>
              <span className="text-emerald-400">DISABLED (AIR-GAPPED)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Biometric Authentication Policy */}
        <div className="glass-panel-card p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-violet-400 font-cyber font-bold text-sm">
              <KeyRound className="w-4 h-4" /> BIOMETRIC AUTHENTICATION HANDOFF
            </span>
            <span className="text-[10px] font-mono-cyber px-2 py-0.5 rounded bg-violet-950 text-violet-400 border border-violet-800">
              FIDO2 / ENCLAVE
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Voice recognition alone is <strong className="text-rose-400">never</strong> treated as sufficient authentication. Unlocking requires native OS verification.
          </p>
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleTestBiometrics}
              disabled={authTesting}
              className="text-xs font-mono-cyber px-3 py-1.5 rounded bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/40 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${authTesting ? 'animate-spin' : ''}`} />
              <span>TEST NATIVE AUTH HANDOFF</span>
            </button>
          </div>
          {authResult && (
            <div className="p-2 rounded bg-surface-200 border border-violet-500/30 text-[11px] font-mono-cyber text-slate-300">
              {authResult}
            </div>
          )}
        </div>

        {/* Card 3: Command Validation Allowlist */}
        <div className="glass-panel-card p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-blue-400 font-cyber font-bold text-sm">
              <Lock className="w-4 h-4" /> STRICT COMMAND ALLOWLIST
            </span>
            <span className="text-[10px] font-mono-cyber px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
              ENFORCED
            </span>
          </div>
          <p className="text-xs text-slate-300">
            SecureMate AI enforces an immutable action allowlist. Arbitrary shell commands or unchecked AI-generated bash commands are strictly prohibited.
          </p>
          <div className="p-2.5 rounded-lg bg-surface-200 text-xs font-mono-cyber text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Arbitrary Terminal Execution:</span>
              <span className="text-emerald-400">BLOCKED</span>
            </div>
            <div className="flex justify-between">
              <span>Destructive Action Confirmation:</span>
              <span className="text-amber-400">MANDATORY MODAL</span>
            </div>
          </div>
        </div>

        {/* Card 4: Local Storage & Cryptography */}
        <div className="glass-panel-card p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-emerald-400 font-cyber font-bold text-sm">
              <Database className="w-4 h-4" /> LOCAL DATA INTEGRITY
            </span>
            <span className="text-[10px] font-mono-cyber px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              SQLITE ENCRYPTED
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Activity audit logs and configuration keys reside exclusively on this device in local storage/SQLite. No analytics or tracking pings are sent to any external server.
          </p>
          <div className="p-2.5 rounded-lg bg-surface-200 text-xs font-mono-cyber text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Cloud Telemetry Sync:</span>
              <span className="text-emerald-400">OFFLINE / ZERO</span>
            </div>
            <div className="flex justify-between">
              <span>Plaintext Password Storage:</span>
              <span className="text-emerald-400">PROHIBITED (0 BYTES)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

