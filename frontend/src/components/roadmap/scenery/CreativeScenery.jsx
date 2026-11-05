import React from 'react';

const CreativeScenery = ({ mapHeight = 1200 }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 transition-opacity duration-1000"
      viewBox={`0 0 1000 ${mapHeight}`}
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id="creativeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Content Studio & Stage Lights (Upper Left) */}
      <g transform="translate(80, 180)">
        {/* Studio Spotlight Cone */}
        <polygon points="30,0 80,80 -20,80" fill="#f43f5e" fillOpacity="0.15" />
        {/* Camera Rig */}
        <rect x="15" y="0" width="30" height="20" rx="4" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" />
        <circle cx="30" cy="10" r="6" fill="#f43f5e" />
        <rect x="45" y="5" width="8" height="10" rx="1" fill="#ec4899" />
        {/* Tripod Legs */}
        <line x1="20" y1="20" x2="8" y2="45" stroke="#ec4899" strokeWidth="1.5" />
        <line x1="40" y1="20" x2="52" y2="45" stroke="#ec4899" strokeWidth="1.5" />
        <line x1="30" y1="20" x2="30" y2="45" stroke="#ec4899" strokeWidth="1.5" />
        {/* Recording Indicator */}
        <circle cx="20" cy="5" r="2" fill="#ef4444" className="animate-ping" />
      </g>

      {/* SEO Island Lighthouse (Upper Right) */}
      <g transform="translate(860, 240)">
        {/* Island Base */}
        <ellipse cx="0" cy="50" rx="55" ry="16" fill="#1e1b4b" stroke="#a855f7" strokeWidth="1.5" />
        {/* Lighthouse Tower */}
        <polygon points="-12,45 -8,-10 8,-10 12,45" fill="#0f172a" stroke="#ec4899" strokeWidth="1.5" />
        <rect x="-10" y="-18" width="20" height="8" rx="2" fill="#f59e0b" />
        {/* Light Beam with Keywords */}
        <polygon points="0,-14 -120,-40 -120,12" fill="#fbbf24" fillOpacity="0.2" />
        <text x="-80" y="-12" fill="#fde68a" fontSize="8" fontFamily="monospace">RANK #1</text>
      </g>

      {/* Social Media City & Reaction Clouds (Mid Left) */}
      <g transform="translate(80, 580)">
        {/* Chat Bubble Skyscraper */}
        <rect x="0" y="0" width="45" height="75" rx="5" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.5" />
        {/* Speech tail */}
        <polygon points="10,75 0,90 25,75" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.5" />
        {/* Floating Heart & Like Reactions */}
        <circle cx="22" cy="20" r="10" fill="#f43f5e" />
        <text x="17" y="24" fill="#ffffff" fontSize="11">♥</text>
        <circle cx="65" cy="15" r="12" fill="#a855f7" />
        <text x="59" y="20" fill="#ffffff" fontSize="11">★</text>
        <circle cx="55" cy="50" r="14" fill="#fbbf24" />
        <text x="47" y="55" fill="#0f172a" fontSize="12" fontWeight="bold">viral</text>
      </g>

      {/* Campaign Arena Megaphone Podium (Lower Right) */}
      <g transform={`translate(820, ${mapHeight - 340})`}>
        {/* Megaphone speaker */}
        <polygon points="0,20 45,0 45,40" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
        <ellipse cx="45" cy="20" rx="8" ry="20" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1.5" />
        <rect x="-15" y="14" width="15" height="12" rx="2" fill="#ec4899" />
        {/* Sound/Viral broadcast waves */}
        <path d="M 60,8 Q 75,20 60,32" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
        <path d="M 72,0 Q 90,20 72,40" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
      </g>
    </svg>
  );
};

export default CreativeScenery;

