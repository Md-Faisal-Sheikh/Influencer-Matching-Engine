import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../utils/i18n';
import { syncInfluencer } from '../utils/api';

export default function SyncLogsModal({ influencer, isOpen, onClose }) {
  const { t, language } = useI18n();
  const [logs, setLogs] = useState([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [displayedLogs, setDisplayedLogs] = useState([]);
  const [syncing, setSyncing] = useState(true);
  const [error, setError] = useState('');
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !influencer) return;

    // Reset states
    setLogs([]);
    setDisplayedLogs([]);
    setCurrentLogIndex(0);
    setSyncing(true);
    setError('');

    // Trigger sync backend request
    syncInfluencer(influencer.id)
      .then(data => {
        if (data && data.success) {
          setLogs(data.logs);
        } else {
          setError('Invalid API response');
          setSyncing(false);
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Connection to API gateway failed.');
        setSyncing(false);
      });
  }, [isOpen, influencer]);

  // Log streaming effect (streams terminal logs line by line for ultimate realism)
  useEffect(() => {
    if (logs.length === 0) return;

    if (currentLogIndex < logs.length) {
      const timer = setTimeout(() => {
        setDisplayedLogs(prev => [...prev, logs[currentLogIndex]]);
        setCurrentLogIndex(prev => prev + 1);
      }, currentLogIndex === 0 ? 100 : 350); // slight variance in latency

      return () => clearTimeout(timer);
    } else {
      setSyncing(false);
    }
  }, [logs, currentLogIndex]);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedLogs, error]);

  if (!isOpen || !influencer) return null;

  // Format timestamp
  const getFormattedTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString();
  };

  const getLogLevelStyle = (level) => {
    switch (level) {
      case 'SUCCESS': return 'text-emerald font-bold';
      case 'WARN': return 'text-gold font-bold';
      case 'ERROR': return 'text-rose font-bold';
      case 'DATA': return 'text-accent-light opacity-80';
      default: return 'text-sky-400 font-bold';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md">
      <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl glow-accent animate-fade-up">
        {/* Terminal Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose block" />
              <span className="w-3 h-3 rounded-full bg-gold block" />
              <span className="w-3 h-3 rounded-full bg-emerald block" />
            </div>
            <span className="font-mono text-sm text-muted ml-2">{t('sync.title')}</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-accent/20 text-accent-light font-mono animate-pulse">
            {syncing ? 'STATUS: SYNCING' : 'STATUS: ONLINE'}
          </span>
        </div>

        {/* Network Trace Visualization */}
        <div className="bg-card/50 border-b border-border px-6 py-4 flex items-center justify-around text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-white">💻</div>
            <span className="text-muted mt-1">Client App</span>
          </div>
          <div className="flex-1 border-t border-dashed border-border mx-4 relative">
            {syncing && <div className="absolute top-1/2 -mt-1 w-2 h-2 bg-accent rounded-full animate-ping left-1/4" />}
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-lg bg-accent/30 border border-accent/60 flex items-center justify-center text-white">🤖</div>
            <span className="text-white mt-1">IQ Engine</span>
          </div>
          <div className="flex-1 border-t border-dashed border-border mx-4 relative">
            {syncing && <div className="absolute top-1/2 -mt-1 w-2 h-2 bg-emerald rounded-full animate-ping right-1/4" />}
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors ${syncing ? 'bg-emerald/20 border border-emerald/40 animate-pulse' : 'bg-card border border-border'}`}>📡</div>
            <span className="text-muted mt-1">{influencer.platform} API</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 bg-ink font-mono text-xs text-white/95 h-72 overflow-y-auto selection:bg-accent selection:text-white leading-relaxed">
          <div className="text-muted mb-2"># influence-iq-sync --account {influencer.handle}</div>
          
          {displayedLogs.map((log, idx) => (
            <div key={idx} className="mb-1.5 flex items-start gap-2 animate-fade-up">
              <span className="text-muted flex-shrink-0 select-none">[{getFormattedTime(log.timestamp)}]</span>
              <span className={getLogLevelStyle(log.level)}>[{log.level}]</span>
              <span className="text-white/90 break-words">{log.message}</span>
            </div>
          ))}

          {syncing && (
            <div className="flex items-center gap-1.5 text-accent-light mt-3">
              <span className="w-1.5 h-3 bg-accent-light animate-pulse inline-block" />
              <span>{t('sync.running')}</span>
            </div>
          )}

          {error && (
            <div className="mt-3 text-rose flex items-start gap-2">
              <span>[ERROR]</span>
              <span>{error}</span>
            </div>
          )}

          {!syncing && !error && (
            <div className="mt-4 text-emerald font-bold text-sm">
              ✔ {t('sync.success')}
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Footer */}
        <div className="bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={syncing}
            className={`px-5 py-2.5 rounded-xl font-display font-bold text-xs transition-all ${
              syncing
                ? 'bg-border text-muted cursor-not-allowed'
                : 'bg-emerald hover:bg-emerald/90 text-ink glow-accent cursor-pointer'
            }`}
          >
            {t('sync.closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
