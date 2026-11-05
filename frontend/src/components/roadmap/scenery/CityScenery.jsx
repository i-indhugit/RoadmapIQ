import React from 'react';

const CityScenery = ({ mapHeight = 1200 }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 transition-opacity duration-1000"
      viewBox={`0 0 1000 ${mapHeight}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="cityTowerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="goldBeaconGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
      </defs>

      {/* Excel District Grid Foundation (Upper Left) */}
      <g transform="translate(60, 180)" stroke="#10b981" strokeWidth="0.8" strokeOpacity="0.3" fill="none">
        {/* Spreadsheet Table Outline */}
        <rect x="0" y="0" width="140" height="90" rx="4" fill="#064e3b" fillOpacity="0.15" />
        <line x1="0" y1="22" x2="140" y2="22" strokeWidth="1.5" stroke="#34d399" />
        <line x1="0" y1="44" x2="140" y2="44" />
        <line x1="0" y1="66" x2="140" y2="66" />
        <line x1="35" y1="0" x2="35" y2="90" />
        <line x1="70" y1="0" x2="70" y2="90" />
        <line x1="105" y1="0" x2="105" y2="90" />
        {/* Sum Formula indicator */}
        <text x="8" y="16" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">∑ fx: SUM()</text>
      </g>

      {/* SQL Tower (Upper Right) - Multi-layer cylindrical database skyscraper */}
      <g transform="translate(860, 240)">
        {/* Cylindrical database disc stack */}
        {[0, 26, 52, 78].map((offset, i) => (
          <g key={i} transform={`translate(0, ${offset})`}>
            <rect x="-35" y="0" width="70" height="20" fill="url(#cityTowerGrad)" stroke="#10b981" strokeWidth="1.2" rx="3" />
            <ellipse cx="0" cy="0" rx="35" ry="8" fill="#047857" stroke="#34d399" strokeWidth="1.2" />
            <circle cx="-20" cy="10" r="2" fill="#34d399" />
            <circle cx="-12" cy="10" r="2" fill="#38bdf8" />
            <circle cx="20" cy="10" r="2" fill="#fbbf24" className="animate-pulse" />
          </g>
        ))}
        {/* SQL Tower Antenna */}
        <line x1="0" y1="0" x2="0" y2="-30" stroke="#34d399" strokeWidth="2" />
        <circle cx="0" cy="-32" r="3" fill="#fbbf24" className="animate-ping" />
      </g>

      {/* Analytics Center & Holographic Chart (Mid Left) */}
      <g transform="translate(90, 560)">
        {/* Chart Axis */}
        <line x1="0" y1="80" x2="120" y2="80" stroke="#64748b" strokeWidth="1.5" />
        <line x1="0" y1="0" x2="0" y2="80" stroke="#64748b" strokeWidth="1.5" />
        {/* Bar chart bars */}
        <rect x="15" y="45" width="16" height="35" fill="#10b981" fillOpacity="0.6" rx="2" />
        <rect x="40" y="25" width="16" height="55" fill="#34d399" fillOpacity="0.8" rx="2" />
        <rect x="65" y="50" width="16" height="30" fill="#059669" fillOpacity="0.5" rx="2" />
        <rect x="90" y="10" width="16" height="70" fill="#fbbf24" fillOpacity="0.85" rx="2" />
        {/* Trendline */}
        <polyline points="23,40 48,20 73,45 98,5" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="98" cy="5" r="3.5" fill="#facc15" className="animate-ping" />
      </g>

      {/* Financial Skyline Silhouettes (Lower Region) */}
      <g transform={`translate(780, ${mapHeight - 320})`}>
        {/* Tower 1 */}
        <rect x="-40" y="0" width="35" height="180" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
        {/* Tower 2 - Center High Rise */}
        <rect x="0" y="-40" width="45" height="220" fill="#064e3b" fillOpacity="0.4" stroke="#34d399" strokeWidth="1.2" />
        {/* Windows matrix */}
        {[0, 15, 30, 45, 60, 75].map((yOff, i) => (
          <g key={i}>
            <rect x="8" y={yOff - 20} width="6" height="6" fill="#34d399" opacity="0.6" />
            <rect x="18" y={yOff - 20} width="6" height="6" fill="#fbbf24" opacity="0.8" />
            <rect x="28" y={yOff - 20} width="6" height="6" fill="#38bdf8" opacity="0.5" />
          </g>
        ))}
        {/* Crown Pinnacle */}
        <polygon points="22.5,-70 38,-40 7,-40" fill="url(#goldBeaconGrad)" stroke="#facc15" strokeWidth="1.5" />
        <circle cx="22.5" cy="-73" r="3.5" fill="#fbbf24" className="animate-ping" />
      </g>
    </svg>
  );
};

export default CityScenery;

