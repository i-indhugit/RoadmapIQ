import React from 'react';
import { CheckCircle2, Lock, Clock } from 'lucide-react';

/**
 * Renders career-specific 2D checkpoint illustrations tailored for each career theme.
 */
export const CheckpointIllustration = ({ themeId = 'code_kingdom', status = 'available', size = 26 }) => {
  // If completed, always render the clean verified checkmark
  if (status === 'completed') {
    return <CheckCircle2 className="w-6 h-6 text-emerald-400 stroke-[2.5]" />;
  }

  // If in progress, show clock indicator
  if (status === 'in_progress') {
    return <Clock className="w-6 h-6 text-amber-400 stroke-[2.5]" />;
  }

  // Inactive / locked opacity
  const isLocked = status === 'locked';
  const strokeColor = isLocked ? '#64748b' : 'currentColor';

  switch (themeId) {
    // 1. AI/ML Engineer: Navy, Electric Blue & Violet (Neural Node & Synapses)
    case 'ai_galaxy':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3.8" fill={isLocked ? '#475569' : '#00d2ff'} />
          <circle cx="5" cy="6" r="2.2" fill={isLocked ? '#475569' : '#8b5cf6'} />
          <circle cx="19" cy="6" r="2.2" fill={isLocked ? '#475569' : '#8b5cf6'} />
          <circle cx="6" cy="18" r="2" fill={isLocked ? '#475569' : '#38bdf8'} />
          <circle cx="18" cy="18" r="2" fill={isLocked ? '#475569' : '#38bdf8'} />
          <line x1="7" y1="7" x2="10" y2="10.5" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="17" y1="7" x2="14" y2="10.5" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="7.5" y1="16.5" x2="10.5" y2="13.5" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="16.5" y1="16.5" x2="13.5" y2="13.5" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
          {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400 absolute" />}
        </svg>
      );

    // 2. Business Analyst: Forest Green, Mint & Warm Gold (Bar Chart & Gold Trend)
    case 'business_city':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="13" width="3.5" height="7" rx="1" fill={isLocked ? '#475569' : '#059669'} />
          <rect x="10.25" y="9" width="3.5" height="11" rx="1" fill={isLocked ? '#475569' : '#10b981'} />
          <rect x="16.5" y="5" width="3.5" height="15" rx="1" fill={isLocked ? '#475569' : '#f59e0b'} />
          <path d="M4 11 L10.5 7 L17 3" stroke={isLocked ? '#64748b' : '#f59e0b'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400 absolute" />}
        </svg>
      );

    // 3. Software Developer: Charcoal, Cyan & Teal (Code Brackets & Terminal Prompt)
    case 'code_kingdom':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 7 L3 12 L8 17" stroke={isLocked ? '#64748b' : '#00f0ff'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 7 L21 12 L16 17" stroke={isLocked ? '#64748b' : '#00f0ff'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="13.5" y1="5" x2="10.5" y2="19" stroke={isLocked ? '#475569' : '#14b8a6'} strokeWidth="2" strokeLinecap="round" />
          {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400 absolute" />}
        </svg>
      );

    // 4. Digital Marketing: Berry Pink, Coral & Orange (Megaphone & Campaign Waves)
    case 'creative_universe':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 11V13C4 14.1 4.9 15 6 15H7L12 18V6L7 9H6C4.9 9 4 9.9 4 11Z" fill={isLocked ? '#475569' : '#ec4899'} />
          <path d="M15 9C16.5 10 16.5 14 15 15" stroke={isLocked ? '#64748b' : '#fb7185'} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M18 7C20.5 8.5 20.5 15.5 18 17" stroke={isLocked ? '#64748b' : '#f97316'} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="7" y1="15" x2="6" y2="20" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
          {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400 absolute" />}
        </svg>
      );

    // 5. Cybersecurity: Midnight Navy, Crimson & Silver (Cyber Shield & Scanning Matrix)
    case 'cyber_fortress':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 3 L20 7 V12 C20 16.5 16.5 20.2 12 21.5 C7.5 20.2 4 16.5 4 12 V7 L12 3 Z"
            fill={isLocked ? '#334155' : 'rgba(239, 68, 68, 0.15)'}
            stroke={isLocked ? '#64748b' : '#ef4444'}
            strokeWidth="2.2"
          />
          <circle cx="12" cy="11" r="2.2" fill={isLocked ? '#64748b' : '#cbd5e1'} />
          <path d="M12 13.2 V16" stroke={isLocked ? '#64748b' : '#cbd5e1'} strokeWidth="1.8" strokeLinecap="round" />
          {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400 absolute" />}
        </svg>
      );

    // 6. Finance: Deep Brown, Gold & Cream (Golden Vault & Asset Coins)
    case 'finance_empire':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8.5" stroke={isLocked ? '#64748b' : '#f59e0b'} strokeWidth="2.2" />
          <circle cx="12" cy="12" r="6" stroke={isLocked ? '#475569' : '#fef3c7'} strokeWidth="1" strokeDasharray="2 2" />
          <path
            d="M12 7 V17 M9 9.5 C9 8.5 10.3 8 12 8 C13.7 8 15 8.7 15 10 C15 11.5 13.5 11.8 12 12 C10.5 12.2 9 12.5 9 14 C9 15.3 10.3 16 12 16 C13.7 16 15 15.5 15 14.5"
            stroke={isLocked ? '#475569' : '#f59e0b'}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400 absolute" />}
        </svg>
      );

    // 7. UI/UX Designer: Lavender, Purple & Soft Pink (Vector Pen Tool & Canvas Anchor)
    case 'design_world':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 3 L15.5 10 L12 14 L8.5 10 L12 3 Z"
            fill={isLocked ? '#475569' : '#c084fc'}
            stroke={isLocked ? '#64748b' : '#9333ea'}
            strokeWidth="1.6"
          />
          <circle cx="12" cy="14" r="1.5" fill={isLocked ? '#64748b' : '#f472b6'} />
          <line x1="12" y1="14" x2="12" y2="21" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
          <rect x="10.5" y="19" width="3" height="3" rx="0.5" fill={isLocked ? '#64748b' : '#f472b6'} />
          {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400 absolute" />}
        </svg>
      );

    // 8. People Planet: Teal & Soft Green (Team Nodes)
    case 'people_planet':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="9" r="3" fill={isLocked ? '#475569' : '#2dd4bf'} />
          <circle cx="15" cy="9" r="3" fill={isLocked ? '#475569' : '#10b981'} />
          <path d="M5 19 C5 16 7 14 9 14 C11 14 13 16 13 19" stroke={isLocked ? '#64748b' : '#2dd4bf'} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M11 19 C11 16.5 13 14 15 14 C17 14 19 16.5 19 19" stroke={isLocked ? '#64748b' : '#10b981'} strokeWidth="1.8" strokeLinecap="round" />
          {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400 absolute" />}
        </svg>
      );

    // Universal Fallback
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" stroke={isLocked ? '#64748b' : '#00f0ff'} strokeWidth="2" />
          <circle cx="12" cy="12" r="3" fill={isLocked ? '#475569' : '#8b5cf6'} />
          {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400 absolute" />}
        </svg>
      );
  }
};

export default CheckpointIllustration;
