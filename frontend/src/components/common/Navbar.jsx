import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Zap,
  Server,
  Sparkles,
  Menu,
  X,
  Target,
  Award,
  Flame,
  Shield,
  Layers,
  User,
} from 'lucide-react';
import Badge from './Badge';

const Navbar = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const {
    backendOnline,
    aiStatus,
    profile,
    activeRole,
    activeRoadmap,
    gamification,
    activeTheme,
    currentUser,
    setIsAuthModalOpen,
  } = useApp();

  const readinessScore = activeRoadmap?.readiness_score ?? (profile?.skills_assessment ? 45 : null);

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-md border-b px-3 sm:px-6 py-2.5 sm:py-3.5 transition-colors duration-300 select-none"
      style={{
        backgroundColor: activeTheme?.palette?.cardBg || 'rgba(6, 10, 18, 0.85)',
        borderColor: activeTheme?.palette?.cardBorder || 'rgba(51, 65, 85, 0.6)',
      }}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden text-slate-400 hover:text-slate-100 p-2 rounded-xl hover:bg-navy-800 transition-colors active:scale-95"
            aria-label="Toggle navigation drawer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black transition-transform group-hover:scale-105 shadow-lg shrink-0"
              style={{
                background: activeTheme?.palette?.btnGradient || 'linear-gradient(135deg, #00d2ff, #3b82f6)',
                color: activeTheme?.palette?.btnText || '#060a12',
              }}
            >
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-slate-100 transition-colors">
                  Roadmap<span style={{ color: activeTheme?.palette?.primary || '#00f0ff' }}>IQ</span>
                </span>
                <span
                  className="text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.2 rounded border hidden xs:inline-block"
                  style={{
                    backgroundColor: activeTheme?.palette?.badgeBg || 'rgba(0, 210, 255, 0.1)',
                    borderColor: activeTheme?.palette?.badgeBorder || 'rgba(0, 210, 255, 0.3)',
                    color: activeTheme?.palette?.primary || '#00f0ff',
                  }}
                >
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wider uppercase font-medium">
                Your Skills. Your Path. Your Future.
              </p>
            </div>
          </Link>
        </div>

        {/* Center/Right: Target Role & Readiness Indicators */}
        <div className="hidden lg:flex items-center gap-3">
          {activeRole && (
            <Link
              to="/my-career"
              className="flex items-center gap-2 px-3 py-1 rounded-full border text-xs shadow-sm transition-all hover:scale-105 cursor-pointer group"
              style={{
                backgroundColor: activeTheme?.palette?.badgeBg || 'rgba(0, 210, 255, 0.1)',
                borderColor: activeTheme?.palette?.badgeBorder || 'rgba(0, 210, 255, 0.3)',
              }}
              title="Current Target Career Track. Click to view curriculum or change."
            >
              <Target className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" style={{ color: activeTheme?.palette?.primary || '#00f0ff' }} />
              <span className="text-slate-400 font-mono">Track:</span>
              <span className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">{activeRole.title}</span>
            </Link>
          )}

          {readinessScore !== null && (
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full border text-xs"
              style={{
                backgroundColor: 'rgba(10, 15, 29, 0.7)',
                borderColor: activeTheme?.palette?.cardBorder || 'rgba(51, 65, 85, 0.6)',
              }}
            >
              <Award className="w-3.5 h-3.5" style={{ color: activeTheme?.palette?.secondary || '#8b5cf6' }} />
              <span className="text-slate-400">Readiness:</span>
              <span className="font-semibold font-mono" style={{ color: activeTheme?.palette?.primary || '#00f0ff' }}>
                {readinessScore}%
              </span>
            </div>
          )}
        </div>

        {/* Right: Gamification Badges, Backend & AI System Health Pills */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Streak Flame Badge */}
          <div
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30"
            title={`${gamification?.streakDays || 1} Day Learning Streak`}
          >
            <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400 text-amber-500" />
            <span className="font-bold">{gamification?.streakDays || 1}d</span>
          </div>

          {/* Player Level & XP Pill (Links to RPG Skill Tree) */}
          <Link
            to="/skill-tree"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:border-purple-400 transition-colors"
            title={`${gamification?.levelTitle || 'Explorer'} - View Interactive Skill Tree`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-bold">Lv.{gamification?.level || 1}</span>
            <span className="text-purple-400/80">({gamification?.xp || 100} XP)</span>
          </Link>

          {/* Backend Health Indicator */}
          <div
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-mono border transition-all ${
              backendOnline === true
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : backendOnline === false
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={backendOnline ? 'FastAPI Backend Online' : 'FastAPI Backend Offline'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline === true
                  ? 'bg-emerald-400 animate-pulse'
                  : backendOnline === false
                  ? 'bg-rose-500'
                  : 'bg-slate-500'
              }`}
            />
            <span className="hidden sm:inline">
              {backendOnline ? 'FastAPI 200' : 'Backend Disconnected'}
            </span>
          </div>

          {/* AI Provider Status */}
          {aiStatus && (
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-navy-850 border border-slate-800 text-slate-300"
              title={aiStatus.message}
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{aiStatus.available ? 'Gemini 2.5 AI' : 'Gemini Cloud AI'}</span>
            </div>
          )}

          {/* Student Account / Auth Button */}
          {currentUser && !currentUser.is_guest ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 transition-colors text-[11px] sm:text-xs font-medium"
              title="Manage Student Account"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                {(currentUser.display_name || currentUser.email).charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[90px] truncate">{currentUser.display_name}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-secondary text-[11px] sm:text-xs py-1 sm:py-1.5 px-2.5 sm:px-3 min-h-[34px] sm:min-h-[38px] flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* Quick Profile / CTA */}
          <Link to="/profile" className="btn-secondary text-[11px] sm:text-xs py-1 sm:py-1.5 px-2.5 sm:px-3 min-h-[34px] sm:min-h-[38px] flex items-center">
            <span>{profile ? profile.display_name.split(' ')[0] : 'Profile'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

