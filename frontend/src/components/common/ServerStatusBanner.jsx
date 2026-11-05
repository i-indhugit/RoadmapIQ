import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle, CheckCircle2, RefreshCw, X, Zap } from 'lucide-react';

const ServerStatusBanner = () => {
  const { backendOnline, checkHealth } = useApp();
  const [coldStartEvent, setColdStartEvent] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [justConnected, setJustConnected] = useState(false);

  useEffect(() => {
    const handleColdStart = (e) => {
      const detail = e.detail;
      setColdStartEvent(detail);

      if (detail.status === 'connected') {
        setJustConnected(true);
        const timer = setTimeout(() => {
          setJustConnected(false);
          setColdStartEvent(null);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (detail.status === 'waking' || detail.status === 'sleeping') {
        setDismissed(false);
      }
    };

    window.addEventListener('roadmapiq:coldstart', handleColdStart);
    return () => window.removeEventListener('roadmapiq:coldstart', handleColdStart);
  }, []);

  const handleManualRetry = async () => {
    setIsRetrying(true);
    try {
      await checkHealth();
    } finally {
      setIsRetrying(false);
    }
  };

  // Condition 1: Just reconnected successfully
  if (justConnected) {
    return (
      <aside aria-label="Cloud Server Status" className="w-full bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-200 px-3 sm:px-6 py-2 text-xs flex items-center justify-between backdrop-blur-md transition-all duration-300 z-50">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">
            Connected to RoadmapIQ Cloud Backend (Render + Neon PostgreSQL). All services operational!
          </span>
        </div>
      </aside>
    );
  }

  // Condition 2: Waking up from cold start or offline
  const isWaking = coldStartEvent?.status === 'waking';
  const isOffline = backendOnline === false || coldStartEvent?.status === 'sleeping';

  if (!isWaking && !isOffline) {
    return null;
  }

  if (dismissed) {
    return null;
  }

  return (
    <aside aria-label="Cloud Server Status" className="w-full bg-amber-950/90 border-b border-amber-500/50 text-amber-200 px-3 sm:px-6 py-2.5 text-xs backdrop-blur-md transition-all duration-300 z-50 shadow-md">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <div className="leading-tight truncate sm:whitespace-normal">
            <span className="font-bold text-amber-300">
              {isWaking ? 'Server Waking Up: ' : 'Free-tier Server Inactive: '}
            </span>
            <span className="text-amber-100">
              {isWaking
                ? `Connecting to Render Cloud (${coldStartEvent.attempt}/${coldStartEvent.maxAttempts}). Free-tier services take ~30-45s to wake from sleep.`
                : 'RoadmapIQ cloud backend sleeps after 15m of inactivity. Please allow 30 seconds for warm-up.'}
            </span>
            <span className="text-amber-300/80 hidden md:inline ml-1">
              Your inputs, target career and roadmaps are safely preserved.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-mono text-[11px] transition-colors active:scale-95 disabled:opacity-50"
            title="Manually retry connecting to the backend"
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded text-amber-400/80 hover:text-amber-200 hover:bg-amber-500/20 transition-colors"
            aria-label="Dismiss server waking banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ServerStatusBanner;

