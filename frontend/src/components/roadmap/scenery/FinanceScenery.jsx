import React from 'react';

const FinanceScenery = ({ mapHeight = 1200 }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 transition-opacity duration-1000"
      viewBox={`0 0 1000 ${mapHeight}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
      </defs>

      {/* Accounting District Ledgers & Pillars (Upper Left) */}
      <g transform="translate(80, 180)">
        {/* Ledger Balance Sheet */}
        <rect x="0" y="0" width="70" height="90" rx="3" fill="#0f172a" stroke="#eab308" strokeWidth="1.5" />
        <line x1="8" y1="20" x2="62" y2="20" stroke="#facc15" strokeWidth="1.2" />
        <line x1="8" y1="35" x2="62" y2="35" stroke="#facc15" strokeWidth="0.8" strokeOpacity="0.6" />
        <line x1="8" y1="50" x2="62" y2="50" stroke="#facc15" strokeWidth="0.8" strokeOpacity="0.6" />
        <line x1="35" y1="20" x2="35" y2="80" stroke="#eab308" strokeWidth="1" />
        <text x="12" y="14" fill="#facc15" fontSize="8" fontFamily="monospace" fontWeight="bold">ASSETS = L + E</text>
      </g>

      {/* Investment Tower (Upper Right) - Neoclassical Facade */}
      <g transform="translate(860, 220)">
        {/* Pediment / Triangular Roof */}
        <polygon points="0,0 50,-30 100,0" fill="#0f172a" stroke="#eab308" strokeWidth="1.5" />
        {/* Columns */}
        <rect x="8" y="0" width="10" height="70" fill="url(#goldGrad)" stroke="#713f12" strokeWidth="0.8" />
        <rect x="32" y="0" width="10" height="70" fill="url(#goldGrad)" stroke="#713f12" strokeWidth="0.8" />
        <rect x="58" y="0" width="10" height="70" fill="url(#goldGrad)" stroke="#713f12" strokeWidth="0.8" />
        <rect x="82" y="0" width="10" height="70" fill="url(#goldGrad)" stroke="#713f12" strokeWidth="0.8" />
        {/* Base Steps */}
        <rect x="-5" y="70" width="110" height="12" fill="#0f172a" stroke="#eab308" strokeWidth="1.2" />
      </g>

      {/* Holographic Ticker Tape Ribbon (Mid Left) */}
      <g transform="translate(70, 580)">
        <path d="M 0,20 Q 50,-10 100,20 T 200,20" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" />
        <rect x="20" y="5" width="65" height="22" rx="4" fill="#064e3b" stroke="#34d399" strokeWidth="1" />
        <text x="26" y="20" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">▲ +18.4% ROI</text>
      </g>

      {/* Vault Door & Wealth HQ (Lower Right) */}
      <g transform={`translate(820, ${mapHeight - 340})`}>
        {/* Massive Steel Vault Door Circle */}
        <circle cx="50" cy="50" r="45" fill="#0f172a" stroke="url(#goldGrad)" strokeWidth="3" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="8 6" />
        {/* Vault Wheel Spokes */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="50"
            x2={50 + 26 * Math.cos((deg * Math.PI) / 180)}
            y2={50 + 26 * Math.sin((deg * Math.PI) / 180)}
            stroke="#facc15"
            strokeWidth="2.5"
          />
        ))}
        <circle cx="50" cy="50" r="8" fill="#eab308" />
      </g>
    </svg>
  );
};

export default FinanceScenery;

