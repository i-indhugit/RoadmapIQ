import React from 'react';

export const AVATAR_STYLES = {
  // 1. AI Galaxy - AI Robot
  ai_robot: {
    id: 'ai_robot',
    name: 'AI Robot',
    title: 'Autonomous Synthetic Explorer',
    description: 'Equipped with a neural core visor, quantum antennas, and anti-gravity levitation rings.',
    category: 'ai',
    accentColor: '#38bdf8',
    secondaryColor: '#a855f7',
    borderGlow: 'rgba(56, 189, 248, 0.4)',
    renderAvatar: ({ size = 48, isMoving = false }) => (
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
        {/* Antennas */}
        <line x1="18" y1="12" x2="14" y2="7" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="7" r="2.5" fill="#38bdf8" className="animate-pulse" />
        <line x1="34" y1="12" x2="38" y2="7" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
        <circle cx="38" cy="7" r="2.5" fill="#38bdf8" className="animate-pulse" />
        {/* Curved Robot Head */}
        <rect x="14" y="14" width="24" height="18" rx="7" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
        {/* Glowing Visor */}
        <rect x="17" y="18" width="18" height="8" rx="4" fill="#0284c7" />
        <line x1="20" y1="22" x2="32" y2="22" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
        {/* Neural Core Emblem */}
        <circle cx="26" cy="38" r="4" fill="#a855f7" className={isMoving ? 'animate-ping' : ''} />
        <circle cx="26" cy="38" r="2" fill="#ffffff" />
      </svg>
    )
  },

  // 2. Business City - Business Professional
  business_pro: {
    id: 'business_pro',
    name: 'Business Strategist',
    title: 'Executive Analytics Director',
    description: 'Carries high-fidelity PRD tablets, stakeholder insights, and boardroom authority.',
    category: 'business',
    accentColor: '#10b981',
    secondaryColor: '#fbbf24',
    borderGlow: 'rgba(16, 185, 129, 0.4)',
    renderAvatar: ({ size = 48, isMoving = false }) => (
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="24" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" />
        {/* Head */}
        <circle cx="26" cy="18" r="9" fill="#f8fafc" />
        {/* Professional Hair */}
        <path d="M 17,17 Q 26,10 35,17 Q 35,12 26,11 Q 17,12 17,17 Z" fill="#0f172a" />
        {/* Executive Collar & Tie */}
        <polygon points="26,27 22,34 30,34" fill="#fbbf24" />
        <line x1="26" y1="34" x2="26" y2="44" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        {/* Business Blazer */}
        <path d="M 12,46 L 20,30 L 26,38 L 32,30 L 40,46 Z" fill="#022c22" stroke="#34d399" strokeWidth="1.5" />
      </svg>
    )
  },

  // 3. Code Kingdom - Developer / Code Knight
  code_knight: {
    id: 'code_knight',
    name: 'Code Knight',
    title: 'Master Systems Architect',
    description: 'Armored in clean code principles, wielding mechanical syntax blades and terminal shields.',
    category: 'developer',
    accentColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    borderGlow: 'rgba(6, 182, 212, 0.4)',
    renderAvatar: ({ size = 48, isMoving = false }) => (
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="24" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" />
        {/* Helmet Visor */}
        <rect x="14" y="16" width="24" height="12" rx="4" fill="#0284c7" />
        <line x1="18" y1="22" x2="34" y2="22" stroke="#e0f2fe" strokeWidth="2.5" strokeLinecap="round" />
        {/* Code Wings */}
        <path d="M 12,20 L 7,16 L 12,24 Z" fill="#38bdf8" />
        <path d="M 40,20 L 45,16 L 40,24 Z" fill="#38bdf8" />
        {/* Syntax Shield */}
        <polygon points="26,30 36,36 33,46 26,49 19,46 16,36" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
        <text x="22" y="42" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">{'</>'}</text>
      </svg>
    )
  },

  // 4. Creative Universe - Creator Avatar
  creator_avatar: {
    id: 'creator_avatar',
    name: 'Creative Artisan',
    title: 'Viral Media Pioneer',
    description: 'Equipped with holographic headphones, camera rig, and viral aesthetic intuition.',
    category: 'marketing',
    accentColor: '#ec4899',
    secondaryColor: '#f59e0b',
    borderGlow: 'rgba(236, 72, 153, 0.4)',
    renderAvatar: ({ size = 48, isMoving = false }) => (
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="24" fill="#1e1b4b" stroke="#ec4899" strokeWidth="2.5" />
        {/* Headphones band */}
        <path d="M 12,24 A 14,14 0 0 1 40,24" fill="none" stroke="#f59e0b" strokeWidth="3" />
        <rect x="10" y="22" width="6" height="12" rx="3" fill="#ec4899" />
        <rect x="36" y="22" width="6" height="12" rx="3" fill="#ec4899" />
        {/* Head & Sunglasses */}
        <circle cx="26" cy="24" r="10" fill="#fbcfe8" />
        <rect x="19" y="21" width="14" height="6" rx="2" fill="#831843" />
        {/* Mic boom */}
        <line x1="38" y1="30" x2="31" y2="35" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="30" cy="35" r="2" fill="#ec4899" className="animate-pulse" />
      </svg>
    )
  },

  // 5. Cyber Fortress - Cyber Guardian
  cyber_guardian: {
    id: 'cyber_guardian',
    name: 'Cyber Guardian',
    title: 'Zero-Trust Bastion Operative',
    description: 'Reinforced with reactive firewall armor, red-alert threat scanners, and intrusion shielding.',
    category: 'security',
    accentColor: '#ef4444',
    secondaryColor: '#38bdf8',
    borderGlow: 'rgba(239, 68, 68, 0.4)',
    renderAvatar: ({ size = 48, isMoving = false }) => (
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="24" fill="#0f172a" stroke="#ef4444" strokeWidth="2.5" />
        {/* Tactical Headgear */}
        <polygon points="26,10 38,18 36,32 26,42 16,32 14,18" fill="#18181b" stroke="#ef4444" strokeWidth="1.5" />
        {/* Red HUD Scanner Line */}
        <line x1="18" y1="22" x2="34" y2="22" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
        <circle cx="26" cy="22" r="3" fill="#ffffff" className="animate-ping" />
        {/* Tactical Chevrons */}
        <path d="M 22,30 L 26,34 L 30,30" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <path d="M 22,35 L 26,39 L 30,35" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },

  // 6. Finance Empire - Wealth Banker
  wealth_banker: {
    id: 'wealth_banker',
    name: 'Wealth Sovereign',
    title: 'Capital Markets Architect',
    description: 'Adorned in gold leaf cuffs, quantum ledger seals, and sovereign portfolio dials.',
    category: 'finance',
    accentColor: '#facc15',
    secondaryColor: '#10b981',
    borderGlow: 'rgba(250, 204, 21, 0.4)',
    renderAvatar: ({ size = 48, isMoving = false }) => (
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="24" fill="#1c1917" stroke="#facc15" strokeWidth="2.5" />
        {/* Monocle & Banker Head */}
        <circle cx="26" cy="20" r="9" fill="#fef08a" fillOpacity="0.8" />
        {/* Gold Monocle */}
        <circle cx="29" cy="19" r="4.5" stroke="#facc15" strokeWidth="1.8" fill="none" />
        <line x1="29" y1="23.5" x2="35" y2="33" stroke="#facc15" strokeWidth="1.2" />
        {/* Golden Silk Cravat */}
        <polygon points="26,29 21,38 31,38" fill="#eab308" />
        {/* Coin Insignia */}
        <circle cx="26" cy="42" r="5" fill="#facc15" />
        <text x="24" y="45" fill="#713f12" fontSize="7" fontWeight="bold">₹</text>
      </svg>
    )
  },

  // 7. Design World - UX Artisan
  ux_artisan: {
    id: 'ux_artisan',
    name: 'Design Artisan',
    title: 'Haptic Systems Sculptor',
    description: 'Armed with digital stylus beacons, color spectrum halos, and wireframe optics.',
    category: 'design',
    accentColor: '#f472b6',
    secondaryColor: '#c084fc',
    borderGlow: 'rgba(244, 114, 182, 0.4)',
    renderAvatar: ({ size = 48, isMoving = false }) => (
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="24" fill="#1e1b4b" stroke="#f472b6" strokeWidth="2.5" />
        {/* Color Spectrum Halo */}
        <circle cx="26" cy="18" r="11" fill="#fdf4ff" />
        {/* Beret / Stylist cap */}
        <path d="M 14,16 Q 26,8 38,16 Q 30,12 14,16 Z" fill="#c084fc" />
        <circle cx="26" cy="10" r="1.5" fill="#f472b6" />
        {/* Interactive Stylus Pen */}
        <polygon points="36,25 44,14 41,12 33,23" fill="#f472b6" />
        <circle cx="44" cy="13" r="2" fill="#ffffff" className="animate-pulse" />
        {/* Palette Collar */}
        <path d="M 16,36 Q 26,46 36,36 Z" fill="#c084fc" />
      </svg>
    )
  },

  // 8. People Planet - People Coach
  people_coach: {
    id: 'people_coach',
    name: 'People Coach',
    title: 'Talent Growth Mentor',
    description: 'Radiates interpersonal warmth, empathy indicators, and leadership harmony.',
    category: 'hr',
    accentColor: '#2dd4bf',
    secondaryColor: '#fdba74',
    borderGlow: 'rgba(45, 212, 191, 0.4)',
    renderAvatar: ({ size = 48, isMoving = false }) => (
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="24" fill="#042f2e" stroke="#2dd4bf" strokeWidth="2.5" />
        {/* Head */}
        <circle cx="26" cy="18" r="9" fill="#ccfbf1" />
        {/* Empathy Aura Ring */}
        <circle cx="26" cy="18" r="12" fill="none" stroke="#fdba74" strokeWidth="1.2" strokeDasharray="3 2" />
        {/* Heart Emblem */}
        <path d="M 26,30 C 23,26 18,27 18,31 C 18,35 26,42 26,42 C 26,42 34,35 34,31 C 34,27 29,26 26,30 Z" fill="#f43f5e" />
        {/* Green leaf crown */}
        <path d="M 21,11 Q 26,6 31,11" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
};

export function getAvatarStyle(styleId = 'ai_robot') {
  return AVATAR_STYLES[styleId] || AVATAR_STYLES.ai_robot;
}
