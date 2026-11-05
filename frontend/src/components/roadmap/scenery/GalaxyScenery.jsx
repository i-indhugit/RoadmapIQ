import React from 'react';

const GalaxyScenery = ({ mapHeight = 1200 }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 transition-opacity duration-1000"
      viewBox={`0 0 1000 ${mapHeight}`}
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id="neuralPlanet1" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <radialGradient id="neuralPlanet2" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="70%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <radialGradient id="neuralCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Twinkling Star Field */}
      {[
        [80, 120, 1.5], [200, 300, 2], [140, 600, 1.2], [100, 950, 1.8],
        [850, 150, 2], [920, 450, 1.5], [870, 750, 2.2], [900, 1050, 1.4],
        [450, 80, 1.5], [600, 220, 2], [350, 500, 1.2], [650, 800, 1.8],
        [400, 1100, 2], [250, 780, 1.6], [750, 950, 1.4], [550, 400, 2.5]
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#e0f2fe" opacity={0.6 + (i % 4) * 0.1} />
      ))}

      {/* Floating Neural Planet 1 (Data Planet) - Upper Left */}
      <g transform="translate(110, 220)">
        <circle cx="0" cy="0" r="50" fill="url(#neuralPlanet1)" />
        {/* Planetary Rings */}
        <ellipse cx="0" cy="0" rx="80" ry="20" fill="none" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.6" transform="rotate(-25)" />
        <ellipse cx="0" cy="0" rx="90" ry="24" fill="none" stroke="#818cf8" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="6 4" transform="rotate(-25)" />
        {/* Orbiting Satellite Data Station */}
        <rect x="68" y="-30" width="12" height="6" rx="2" fill="#38bdf8" />
        <line x1="74" y1="-30" x2="74" y2="-38" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="74" cy="-38" r="2" fill="#a855f7" className="animate-ping" />
      </g>

      {/* Neural Network Nodes & Constellation Lines */}
      <g stroke="#818cf8" strokeWidth="1" strokeOpacity="0.3" fill="#c084fc">
        <line x1="180" y1="260" x2="260" y2="340" />
        <line x1="260" y1="340" x2="220" y2="420" />
        <line x1="220" y1="420" x2="160" y2="390" />
        <circle cx="260" cy="340" r="3.5" />
        <circle cx="220" cy="420" r="3" />
        <circle cx="160" cy="390" r="2.5" />
      </g>

      {/* Model Training Starbase (Right Side Mid-Map) */}
      <g transform="translate(860, 520)">
        <circle cx="0" cy="0" r="70" fill="url(#neuralCoreGlow)" />
        <circle cx="0" cy="0" r="42" fill="url(#neuralPlanet2)" />
        {/* Training Rings */}
        <circle cx="0" cy="0" r="55" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="8 6" className="animate-spin" />
        {/* Solar Arrays */}
        <rect x="-60" y="-3" width="22" height="6" rx="1" fill="#38bdf8" />
        <rect x="38" y="-3" width="22" height="6" rx="1" fill="#38bdf8" />
        <circle cx="0" cy="0" r="4" fill="#f43f5e" className="animate-pulse" />
      </g>

      {/* Deep Space Nebulae Dust (Lower Realm) */}
      <g transform="translate(130, 880)">
        <circle cx="0" cy="0" r="80" fill="url(#neuralCoreGlow)" />
        <circle cx="0" cy="0" r="35" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
        {/* Neural Network Cluster */}
        <circle cx="-15" cy="-10" r="4" fill="#38bdf8" />
        <circle cx="15" cy="-12" r="4" fill="#ec4899" />
        <circle cx="0" cy="15" r="4" fill="#a855f7" />
        <line x1="-15" y1="-10" x2="15" y2="-12" stroke="#a855f7" strokeWidth="1.5" />
        <line x1="15" y1="-12" x2="0" y2="15" stroke="#a855f7" strokeWidth="1.5" />
        <line x1="0" y1="15" x2="-15" y2="-10" stroke="#a855f7" strokeWidth="1.5" />
      </g>

      {/* Final AGI Starbase Spire (Bottom Right) */}
      <g transform="translate(840, Math.max(1000, mapHeight - 140))">
        <polygon points="0,-45 20,20 -20,20" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
        <circle cx="0" cy="-48" r="5" fill="#38bdf8" className="animate-ping" />
        <circle cx="0" cy="-48" r="3" fill="#ffffff" />
      </g>
    </svg>
  );
};

export default GalaxyScenery;

