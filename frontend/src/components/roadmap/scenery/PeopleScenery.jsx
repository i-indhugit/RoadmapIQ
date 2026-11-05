import React from 'react';

const PeopleScenery = ({ mapHeight = 1200 }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 transition-opacity duration-1000"
      viewBox={`0 0 1000 ${mapHeight}`}
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id="peopleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Recruitment Funnel & Candidate Cards (Upper Left) */}
      <g transform="translate(80, 180)">
        {/* Candidate Profile Cards */}
        <rect x="0" y="0" width="45" height="60" rx="4" fill="#0f172a" stroke="#2dd4bf" strokeWidth="1.5" />
        <circle cx="22" cy="18" r="8" fill="#14b8a6" />
        <rect x="10" y="32" width="25" height="4" rx="2" fill="#fdba74" />
        <rect x="12" y="40" width="21" height="3" rx="1.5" fill="#64748b" />
        {/* Match Checkmark */}
        <circle cx="42" cy="10" r="7" fill="#10b981" />
        <path d="M39,10 L41,12 L45,8" fill="none" stroke="#ffffff" strokeWidth="1.5" />
      </g>

      {/* Communication Hub & Empathy Waves (Upper Right) */}
      <g transform="translate(860, 240)">
        {/* Concentric Acoustic Speech Rings */}
        <circle cx="0" cy="0" r="50" fill="url(#peopleGlow)" stroke="#2dd4bf" strokeWidth="0.8" strokeDasharray="4 4" />
        <circle cx="0" cy="0" r="32" fill="none" stroke="#fdba74" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#2dd4bf" strokeWidth="1.5" />
        {/* Heart Emblem */}
        <text x="-6" y="5" fill="#f43f5e" fontSize="13">♥</text>
        <text x="-25" y="45" fill="#2dd4bf" fontSize="8" fontFamily="monospace">EMPATHY HUB</text>
      </g>

      {/* Talent Development Garden Tree (Mid Left) */}
      <g transform="translate(90, 580)">
        {/* Trunk and Branches */}
        <path d="M 40,90 Q 40,50 25,30 M 40,55 Q 55,40 65,25" fill="none" stroke="#fdba74" strokeWidth="3" strokeLinecap="round" />
        {/* Blooming Skill Foliage Nodes */}
        <circle cx="25" cy="30" r="14" fill="#14b8a6" fillOpacity="0.8" stroke="#5eead4" strokeWidth="1.5" />
        <circle cx="65" cy="25" r="12" fill="#2dd4bf" fillOpacity="0.8" stroke="#5eead4" strokeWidth="1.5" />
        <circle cx="45" cy="10" r="16" fill="#10b981" fillOpacity="0.8" stroke="#6ee7b7" strokeWidth="1.5" />
        {/* Fruit / Achievement Stars */}
        <circle cx="25" cy="30" r="3" fill="#fef08a" />
        <circle cx="65" cy="25" r="2.5" fill="#fef08a" />
        <circle cx="45" cy="10" r="3" fill="#fef08a" />
      </g>

      {/* Leadership Academy Pavilion (Lower Right) */}
      <g transform={`translate(820, ${mapHeight - 340})`}>
        {/* Pavilion Dome */}
        <path d="M 0,40 Q 50,-10 100,40 Z" fill="#0f172a" stroke="#2dd4bf" strokeWidth="2" />
        {/* Columns */}
        <line x1="15" y1="40" x2="15" y2="80" stroke="#fdba74" strokeWidth="2" />
        <line x1="50" y1="40" x2="50" y2="80" stroke="#fdba74" strokeWidth="2" />
        <line x1="85" y1="40" x2="85" y2="80" stroke="#fdba74" strokeWidth="2" />
        {/* Base */}
        <rect x="-5" y="80" width="110" height="10" rx="2" fill="#0f172a" stroke="#2dd4bf" strokeWidth="1.5" />
        {/* Laurel Wreath Crown */}
        <circle cx="50" cy="18" r="8" fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="3 2" />
        <polygon points="50,14 51,17 54,17 51.5,19 52.5,22 50,20 47.5,22 48.5,19 46,17 49,17" fill="#facc15" />
      </g>
    </svg>
  );
};

export default PeopleScenery;

