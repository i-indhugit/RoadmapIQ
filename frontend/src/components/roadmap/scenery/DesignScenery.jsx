import React from 'react';

const DesignScenery = ({ mapHeight = 1200 }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 transition-opacity duration-1000"
      viewBox={`0 0 1000 ${mapHeight}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="coralLavender" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>

      {/* Wireframe Workshop Mobile Device (Upper Left) */}
      <g transform="translate(80, 180)">
        {/* Mobile Phone Mockup */}
        <rect x="0" y="0" width="50" height="95" rx="8" fill="#0f172a" stroke="#f472b6" strokeWidth="1.5" />
        {/* Screen Notch */}
        <rect x="15" y="4" width="20" height="4" rx="2" fill="#f472b6" />
        {/* UI Elements */}
        <rect x="8" y="18" width="34" height="20" rx="3" fill="#334155" />
        <rect x="8" y="44" width="22" height="4" rx="2" fill="#c084fc" />
        <rect x="8" y="52" width="34" height="4" rx="2" fill="#475569" />
        <rect x="8" y="60" width="16" height="4" rx="2" fill="#475569" />
        {/* Floating Toggle Switch */}
        <rect x="8" y="72" width="24" height="12" rx="6" fill="#f472b6" />
        <circle cx="24" cy="78" r="4" fill="#ffffff" />
      </g>

      {/* Color Wheel Sun & Creativity Island (Upper Right) */}
      <g transform="translate(860, 240)">
        {/* Color Wheel segments */}
        <circle cx="0" cy="0" r="42" fill="none" stroke="url(#coralLavender)" strokeWidth="10" strokeDasharray="12 4" />
        <circle cx="0" cy="0" r="28" fill="#0f172a" stroke="#e879f9" strokeWidth="1.5" />
        {/* Color Swatch Dots */}
        <circle cx="-12" cy="-6" r="4" fill="#fb7185" />
        <circle cx="12" cy="-6" r="4" fill="#38bdf8" />
        <circle cx="0" cy="12" r="4" fill="#a855f7" />
        <text x="-16" y="2" fill="#ffffff" fontSize="7" fontFamily="monospace">HEX</text>
      </g>

      {/* Bezier Vector Pen Anchor Curve (Mid Left) */}
      <g transform="translate(70, 580)">
        {/* S-curve path */}
        <path d="M 0,50 C 40,0 80,100 120,50" fill="none" stroke="#f472b6" strokeWidth="2.5" />
        {/* Control Handle 1 */}
        <circle cx="40" cy="0" r="4" fill="#c084fc" />
        <line x1="40" y1="0" x2="25" y2="28" stroke="#c084fc" strokeWidth="1" strokeDasharray="2 2" />
        {/* Control Handle 2 */}
        <circle cx="80" cy="100" r="4" fill="#f472b6" />
        <line x1="80" y1="100" x2="95" y2="72" stroke="#f472b6" strokeWidth="1" strokeDasharray="2 2" />
        {/* Active Anchor Points */}
        <rect x="-4" y="46" width="8" height="8" fill="#ffffff" stroke="#c084fc" strokeWidth="1.5" />
        <rect x="116" y="46" width="8" height="8" fill="#ffffff" stroke="#c084fc" strokeWidth="1.5" />
      </g>

      {/* Prototype Studio & Design Showcase (Lower Right) */}
      <g transform={`translate(820, ${mapHeight - 340})`}>
        {/* Artboard 1 */}
        <rect x="0" y="0" width="75" height="55" rx="4" fill="#0f172a" stroke="#c084fc" strokeWidth="1.5" />
        {/* Artboard 2 (Overlapping) */}
        <rect x="25" y="25" width="75" height="55" rx="4" fill="#1e1b4b" stroke="#f472b6" strokeWidth="1.5" />
        {/* Prototype connecting node line */}
        <path d="M 60,30 Q 75,15 80,40" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="80" cy="40" r="3" fill="#38bdf8" className="animate-ping" />
        <polygon points="50,15 54,23 46,23" fill="#f472b6" transform="rotate(45 50 15)" />
      </g>
    </svg>
  );
};

export default DesignScenery;

