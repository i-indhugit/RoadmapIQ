import React from 'react';

const KingdomScenery = ({ mapHeight = 1200 }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 transition-opacity duration-1000"
      viewBox={`0 0 1000 ${mapHeight}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Programming Village (Upper Left) */}
      <g transform="translate(80, 160)">
        {/* House 1 */}
        <polygon points="20,0 40,25 0,25" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x="5" y="25" width="30" height="25" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
        <rect x="15" y="35" width="10" height="15" fill="#38bdf8" fillOpacity="0.7" />
        {/* Code glyph on village wall */}
        <text x="7" y="32" fill="#38bdf8" fontSize="8" fontFamily="monospace">{'</>'}</text>

        {/* House 2 */}
        <polygon points="65,10 80,30 50,30" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x="55" y="30" width="20" height="20" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
        <circle cx="65" cy="40" r="3" fill="#e0f2fe" />
      </g>

      {/* DSA Mountain Range (Upper Right) */}
      <g transform="translate(840, 200)">
        {/* Back Peak */}
        <polygon points="40,-60 90,80 -10,80" fill="url(#mountainGrad)" stroke="#0284c7" strokeWidth="1.2" />
        {/* Front Peak */}
        <polygon points="0,-40 50,80 -50,80" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.5" />
        {/* Snow Peak / Binary Crest */}
        <polygon points="0,-40 15,-10 -15,-10" fill="#e0f2fe" />
        {/* Binary Tree Structure etched on Mountain */}
        <g stroke="#38bdf8" strokeWidth="1.2" fill="#38bdf8">
          <circle cx="0" cy="15" r="3" />
          <line x1="0" y1="15" x2="-18" y2="35" />
          <line x1="0" y1="15" x2="18" y2="35" />
          <circle cx="-18" cy="35" r="2.5" />
          <circle cx="18" cy="35" r="2.5" />
          <line x1="-18" y1="35" x2="-28" y2="55" />
          <circle cx="-28" cy="55" r="2" />
        </g>
        <text x="-40" y="75" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">O(log N) Summit</text>
      </g>

      {/* Database Fortress Keep (Mid-Left) */}
      <g transform="translate(80, 580)">
        {/* Fortress Base Walls */}
        <rect x="0" y="20" width="110" height="60" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        {/* Battlements / Crenellations */}
        {[0, 22, 44, 66, 88].map((xOff) => (
          <rect key={xOff} x={xOff} y="10" width="12" height="10" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1" />
        ))}
        {/* Fortress Gate with Binary Portcullis */}
        <path d="M40,80 L40,45 Q55,35 70,45 L70,80 Z" fill="#0369a1" fillOpacity="0.5" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="47" y1="42" x2="47" y2="80" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="63" y1="42" x2="63" y2="80" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="40" y1="58" x2="70" y2="58" stroke="#38bdf8" strokeWidth="1" />
        {/* Watchtower Crystals */}
        <polygon points="5,5 11,-8 1,-8" fill="#38bdf8" className="animate-pulse" />
        <polygon points="105,5 111,-8 101,-8" fill="#38bdf8" className="animate-pulse" />
      </g>

      {/* Testing Laboratory & Circuit Trace (Lower Right) */}
      <g transform={`translate(820, ${mapHeight - 340})`}>
        {/* Circuit board traces */}
        <g stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.5" fill="none">
          <path d="M 0,0 L 40,0 L 60,30 L 60,70" />
          <circle cx="60" cy="70" r="3" fill="#38bdf8" />
          <path d="M 20,0 L 20,40 L 40,60" />
          <circle cx="40" cy="60" r="3" fill="#0284c7" />
        </g>
        {/* Bug Testing Scanner Shield */}
        <circle cx="70" cy="20" r="22" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
        <path d="M62,20 L68,26 L78,14" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        <text x="25" y="100" fill="#10b981" fontSize="9" fontFamily="monospace">✓ 100% Tests Pass</text>
      </g>
    </svg>
  );
};

export default KingdomScenery;

