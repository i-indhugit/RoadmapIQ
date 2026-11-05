import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Award,
  Map,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MOBILE_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    altPaths: ['/'],
  },
  {
    id: 'discover',
    label: 'Discover',
    path: '/discover',
    icon: Compass,
    altPaths: ['/discovery', '/careers', '/explore', '/compare'],
  },
  {
    id: 'assess',
    label: 'Assess',
    path: '/assess',
    icon: Award,
    altPaths: ['/assessment', '/skill-gap', '/skill-analysis', '/reassessment'],
  },
  {
    id: 'journey',
    label: 'Journey',
    path: '/journey',
    icon: Map,
    altPaths: ['/roadmap', '/planner', '/preparation', '/weekly-review'],
  },
  {
    id: 'growth',
    label: 'Growth',
    path: '/growth',
    icon: TrendingUp,
    altPaths: ['/progress', '/skill-tree', '/portfolio', '/leaderboard'],
  },
];

export default function BottomNav() {
  const location = useLocation();
  const { activeTheme } = useApp();
  const currentPath = location.pathname;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden backdrop-blur-xl border-t transition-colors duration-300"
      style={{
        backgroundColor: activeTheme?.palette?.cardBg || 'rgba(6, 10, 18, 0.94)',
        borderColor: activeTheme?.palette?.cardBorder || 'rgba(51, 65, 85, 0.7)',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPath === item.path ||
            currentPath.startsWith(item.path + '/') ||
            (item.altPaths && item.altPaths.some((p) => currentPath === p || currentPath.startsWith(p + '/')));

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-95 min-w-[56px] min-h-[46px] select-none ${
                isActive
                  ? 'text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 shadow-sm'
                    : 'bg-transparent'
                }`}
                style={
                  isActive
                    ? {
                        color: activeTheme?.palette?.primary || '#00f0ff',
                        boxShadow: `0 0 12px -2px ${activeTheme?.palette?.glow || 'rgba(0, 240, 255, 0.4)'}`,
                      }
                    : undefined
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <span className="text-[10px] tracking-tight font-medium mt-0.5 truncate max-w-[64px]">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
