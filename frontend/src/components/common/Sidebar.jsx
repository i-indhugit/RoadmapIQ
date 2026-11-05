import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Award,
  Map,
  TrendingUp,
  LayoutDashboard,
  User,
  Settings,
  ChevronDown,
  ChevronRight,
  Target,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PRIMARY_MODULES = [
  {
    id: 'discover',
    title: 'Discover',
    basePath: '/discover',
    altPaths: ['/discovery', '/careers', '/explore', '/compare'],
    icon: Compass,
    badge: '18 Domains',
    subOptions: [
      { id: 'explore', label: 'Explore & Search (259+)', path: '/discover?tab=explore' },
      { id: 'suggestions', label: 'AI Career Matcher', path: '/discover?tab=suggestions' },
      { id: 'compare', label: 'Compare Careers', path: '/discover?tab=compare' },
      { id: 'target', label: 'Set Target & Saved', path: '/discover?tab=target' },
    ],
  },
  {
    id: 'journey',
    title: 'My Journey',
    basePath: '/journey',
    altPaths: ['/roadmap', '/planner', '/preparation', '/weekly-review', '/projects', '/arena', '/bosses', '/interview'],
    icon: Map,
    badge: 'Curriculum',
    subOptions: [
      { id: 'roadmap', label: 'Interactive Roadmap', path: '/journey?tab=roadmap' },
      { id: 'tasks', label: 'Daily Tasks & Schedule', path: '/journey?tab=tasks' },
      { id: 'review', label: 'Weekly Review', path: '/journey?tab=review' },
      { id: 'practice', label: 'Practice & Challenges', path: '/journey?tab=practice' },
    ],
  },
  {
    id: 'growth',
    title: 'My Growth',
    basePath: '/growth',
    altPaths: ['/progress', '/skill-tree', '/portfolio', '/leaderboard'],
    icon: TrendingUp,
    badge: 'Evidence',
    subOptions: [
      { id: 'portfolio', label: 'Skill Portfolio & Evidence', path: '/growth?tab=overview' },
      { id: 'tree', label: 'Visual Skill Tree', path: '/growth?tab=tree' },
      { id: 'activity', label: 'Activity & Streaks', path: '/growth?tab=activity' },
      { id: 'achievements', label: 'Achievements & Badges', path: '/growth?tab=achievements' },
    ],
  },
  {
    id: 'mentor',
    title: 'AI Mentor',
    basePath: '/learning-assistant',
    altPaths: ['/assistant', '/mentor'],
    icon: Sparkles,
    badge: '24/7 Grounded',
    subOptions: [
      { id: 'tutor', label: 'Curriculum AI Tutor', path: '/learning-assistant?tab=tutor' },
      { id: 'knowledge', label: 'RAG Knowledge Search', path: '/learning-assistant?tab=knowledge' },
      { id: 'interview', label: 'Mock Interview Simulator', path: '/interview' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeRoadmap, activeRole, activeTheme, activeRoadmapProgress } = useApp();

  const [expandedSectionId, setExpandedSectionId] = useState(null);

  // Auto-expand matching module on route change
  useEffect(() => {
    const currentPath = location.pathname;
    const match = PRIMARY_MODULES.find((sec) => {
      if (currentPath === sec.basePath || currentPath.startsWith(sec.basePath + '/')) return true;
      if (sec.altPaths && sec.altPaths.some((p) => currentPath === p || currentPath.startsWith(p + '/'))) return true;
      return false;
    });

    if (match) {
      setExpandedSectionId(match.id);
    }
  }, [location.pathname]);

  const handleToggleSection = (section) => {
    if (expandedSectionId === section.id) {
      setExpandedSectionId(null);
    } else {
      setExpandedSectionId(section.id);
      navigate(section.basePath);
    }
  };

  const currentPath = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Collapsible Sidebar Drawer */}
      <aside
        className={`fixed md:sticky top-0 md:top-[61px] left-0 z-50 h-screen md:h-[calc(100vh-61px)] w-72 max-w-[85vw] backdrop-blur-2xl border-r p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 ease-in-out overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          backgroundColor: activeTheme?.palette?.cardBg || 'rgba(9, 14, 28, 0.96)',
          borderColor: activeTheme?.palette?.cardBorder || 'rgba(51, 65, 85, 0.5)',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="space-y-3">
          {/* Mobile Drawer Header with Close Button */}
          <div className="md:hidden flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              RoadmapIQ Navigation
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Dashboard Quick Link */}
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-850/80 border border-transparent'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Dashboard</span>
          </NavLink>

          {/* Section Divider: Four Primary Modules */}
          <div className="border-t border-slate-800/80 pt-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3 mb-2 flex items-center justify-between">
              <span>Primary Modules</span>
              <span className="text-[9px] text-cyan-400/80 font-semibold">4 Pillars</span>
            </div>

            {/* 4 Hierarchical Modules Accordion */}
            <nav className="space-y-1">
              {PRIMARY_MODULES.map((section) => {
                const Icon = section.icon;
                const isExpanded = expandedSectionId === section.id;
                const isSectionActive =
                  currentPath === section.basePath ||
                  (section.altPaths && section.altPaths.includes(currentPath));

                return (
                  <div key={section.id} className="rounded-xl overflow-hidden">
                    {/* Module Header Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleSection(section)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left group ${
                        isSectionActive
                          ? 'bg-slate-850/90 text-white font-bold border border-slate-700/80 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isSectionActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                        <span className="truncate">{section.title}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        <span className="text-[9px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800">
                          {section.badge}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-cyan-400 transition-transform" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform" />
                        )}
                      </div>
                    </button>

                    {/* Sub-options for progressive disclosure */}
                    {isExpanded && (
                      <div className="pl-6 pr-2 py-1.5 space-y-0.5 animate-fadeIn border-l border-slate-800 ml-5 my-1">
                        {section.subOptions.map((sub) => {
                          const subUrl = new URL(sub.path, 'http://dummy.com');
                          const subPath = subUrl.pathname;
                          const subTab = subUrl.searchParams.get('tab');
                          const isSubActive =
                            currentPath === subPath && (!subTab || currentTab === subTab);

                          return (
                            <NavLink
                              key={sub.id}
                              to={sub.path}
                              onClick={onClose}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                                isSubActive
                                  ? 'text-cyan-300 font-bold bg-cyan-500/10 border-l-2 border-cyan-400'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
                              }`}
                            >
                              <span className="truncate">{sub.label}</span>
                              {isSubActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 ml-1" />}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Secondary Account Options */}
          <div className="border-t border-slate-800/80 pt-2 space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3 mb-1">
              Account
            </div>
            <NavLink
              to="/profile"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-850 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>My Profile</span>
            </NavLink>

            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-850 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>

        {/* Bottom Current Track Status Badge */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          {activeRole || activeRoadmap ? (
            <div
              onClick={() => {
                navigate('/discover?tab=target');
                onClose();
              }}
              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                  <Target className="w-3 h-3" /> Target Track
                </span>
                <span className="text-emerald-400 font-bold">
                  {activeRoadmapProgress?.completion_percentage ? `${activeRoadmapProgress.completion_percentage}% Done` : 'Enrolled'}
                </span>
              </div>
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                {activeRole?.title || activeRoadmap?.role_title}
              </div>
            </div>
          ) : (
            <div
              onClick={() => {
                navigate('/discover');
                onClose();
              }}
              className="p-2.5 rounded-xl border border-dashed border-slate-800 text-center text-[11px] text-slate-500 hover:text-cyan-400 hover:border-slate-700 cursor-pointer font-mono transition"
            >
              + Select Target Career Track
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
