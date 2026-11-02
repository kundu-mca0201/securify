import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Search, Download, Trash2, Filter } from 'lucide-react';
import { ActivityLog } from '../modules/models';

interface ActivityHistoryProps {
  logs: ActivityLog[];
  onClearLogs: () => void;
}

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({ logs, onClearLogs }) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'security' | 'completed' | 'blocked'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filterMode === 'security' && !log.isSecurityEvent) return false;
    if (filterMode === 'completed' && log.status !== 'completed') return false;
    if (filterMode === 'blocked' && log.status !== 'blocked' && log.status !== 'failed') return false;

    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      log.rawCommand.toLowerCase().includes(query) ||
      log.recognizedIntent.toLowerCase().includes(query) ||
      log.feedback.toLowerCase().includes(query)
    );
  });

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `securemate_activity_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-cyber text-slate-100 flex items-center gap-2">
            <span>ACTIVITY AUDIT TRAIL</span>
            <span className="text-xs font-mono-cyber font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              {logs.length} EVENTS RECORDED
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable local transaction history with execution latencies and security tags.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-50 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all font-mono-cyber"
            title="Export full log as JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPORT</span>
          </button>

          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700 text-xs text-slate-400 hover:text-rose-300 transition-all font-mono-cyber"
            title="Clear stored log history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-100/50 p-2.5 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands, intents, feedback..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-200 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 font-mono-cyber outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline" />
          {[
            { id: 'all', label: 'All Logs' },
            { id: 'security', label: 'Security Events' },
            { id: 'completed', label: 'Completed' },
            { id: 'blocked', label: 'Blocked / Failed' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMode(m.id as any)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono-cyber transition-all ${
                filterMode === m.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-slate-200 bg-surface-200/50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 glass-panel-card rounded-xl text-slate-500 font-mono-cyber text-xs">
            NO ACTIVITY LOGS MATCH CURRENT QUERY
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isCompleted = log.status === 'completed';
            const isBlocked = log.status === 'blocked';

            return (
              <div
                key={log.id}
                className="glass-panel-card p-3.5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 border-l-4 transition-all"
                style={{
                  borderLeftColor: log.isSecurityEvent
                    ? '#f43f5e'
                    : isCompleted
                    ? '#00f2fe'
                    : '#f59e0b',
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {log.isSecurityEvent ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-100 font-mono-cyber">
                        "{log.rawCommand}"
                      </span>
                      <span className="text-[10px] font-mono-cyber px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {log.recognizedIntent}
                      </span>
                      {log.language && (
                        <span className="text-[10px] font-mono-cyber px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800">
                          {log.language.toUpperCase()}
                        </span>
                      )}
                      {log.confidence && (
                        <span className="text-[10px] font-mono-cyber text-slate-400">
                          {Math.round(log.confidence * 100)}% conf
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{log.feedback}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800 text-[11px] font-mono-cyber text-slate-400">
                  {log.executionTimeMs && <span>{log.executionTimeMs}ms</span>}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isCompleted
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        : isBlocked
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {log.status}
                  </span>
                  <span className="text-slate-500">{log.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
