import React from 'react';

const FortressScenery = ({ mapHeight = 1200 }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 transition-opacity duration-1000"
      viewBox={`0 0 1000 ${mapHeight}`}
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Networking Gate & Portcullis (Upper Left) */}
      <g transform="translate(80, 180)">
        {/* Armored Posts */}
        <rect x="0" y="0" width="16" height="80" rx="3" fill="#1e1b4b" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="74" y="0" width="16" height="80" rx="3" fill="#1e1b4b" stroke="#ef4444" strokeWidth="1.5" />
        {/* Laser Firewall Beams */}
        {[18, 32, 46, 60].map((yOff) => (
          <line
            key={yOff}
            x1="16"
            y1={yOff}
            x2="74"
            y2={yOff}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="4 2"
            className="animate-pulse"
          />
        ))}
        {/* Port Status */}
        <text x="22" y="-8" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">PORT 443 / SSL</text>
      </g>

      {/* Threat Detection Radar Center (Upper Right) */}
      <g transform="translate(860, 260)">
        <circle cx="0" cy="0" r="60" fill="url(#radarSweep)" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.5" />
        <circle cx="0" cy="0" r="40" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="4 4" />
        <circle cx="0" cy="0" r="20" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeOpacity="0.6" />
        {/* Crosshairs */}
        <line x1="-60" y1="0" x2="60" y2="0" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="0" y1="-60" x2="0" y2="60" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.5" />
        {/* Threat Targets */}
        <circle cx="25" cy="-22" r="3" fill="#ef4444" className="animate-ping" />
        <circle cx="-32" cy="18" r="2.5" fill="#f97316" />
      </g>

      {/* Honeycomb Firewall Shield Barrier (Mid Left) */}
      <g transform="translate(90, 600)" stroke="#38bdf8" strokeWidth="1.2" fill="#0f172a" fillOpacity="0.7">
        {/* Hexagons */}
        {[
          [0, 0], [24, -14], [24, 14], [48, 0], [48, 28], [72, 14]
        ].map(([hx, hy], i) => (
          <polygon
            key={i}
            points={`${hx+12},${hy} ${hx+6},${hy+10} ${hx-6},${hy+10} ${hx-12},${hy} ${hx-6},${hy-10} ${hx+6},${hy-10}`}
            stroke={i % 2 === 0 ? '#38bdf8' : '#ef4444'}
          />
        ))}
        <text x="0" y="45" fill="#38bdf8" fontSize="8" fontFamily="monospace">ZERO-TRUST SHIELD</text>
      </g>

      {/* Defense Headquarters Citadel (Lower Right) */}
      <g transform={`translate(820, ${mapHeight - 340})`}>
        {/* Bastion Outline */}
        <polygon points="50,0 100,25 90,80 10,80 0,25" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
        {/* Large Defense Crest Shield */}
        <path d="M50,15 L75,30 L70,60 Q50,75 50,75 Q50,75 30,60 L25,30 Z" fill="#991b1b" stroke="#f87171" strokeWidth="1.5" />
        {/* Padlock Icon */}
        <rect x="42" y="42" width="16" height="14" rx="2" fill="#f87171" />
        <path d="M46,42 L46,36 Q50,32 54,36 L54,42" fill="none" stroke="#f87171" strokeWidth="2" />
      </g>
    </svg>
  );
};

export default FortressScenery;

