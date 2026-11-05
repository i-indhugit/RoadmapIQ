import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

const ROUTE_LABELS = {
  '': 'Dashboard',
  'dashboard': 'Dashboard',
  'discover': 'Discover',
  'journey': 'My Journey',
  'growth': 'My Growth',
  'mentor': 'AI Mentor',
  'discovery': 'Discover',
  'careers': 'Discover',
  'explore': 'Discover',
  'my-career': 'My Career',
  'assess': 'My Journey',
  'assessment': 'My Journey',
  'skill-gap': 'My Journey',
  'skill-analysis': 'My Journey',
  'roadmap': 'My Journey',
  'planner': 'My Journey',
  'preparation': 'My Journey',
  'interview': 'My Journey',
  'projects': 'My Journey',
  'progress': 'My Growth',
  'portfolio': 'My Growth',
  'weekly-review': 'My Journey',
  'reassessment': 'My Journey',
  'assistant': 'AI Mentor',
  'profile': 'My Profile',
  'settings': 'Settings',
  'arena': 'My Journey',
  'bosses': 'My Journey',
  'skill-tree': 'My Growth',
  'leaderboard': 'My Growth',
  'compare': 'Discover',
};

const TAB_LABELS = {
  // Discover Module Tabs
  'suggestions': 'AI Career Matcher',
  'target': 'Target Career & Duration',
  'compare': 'Compare Careers',
  'explore': 'Explore & Search (259+)',
  'discover': 'Discover Careers',
  'search': 'Search Careers',
  'recommended': 'Recommended Careers',
  'saved': 'Saved Careers',

  // My Journey Module Tabs
  'roadmap': 'Interactive Roadmap',
  'tasks': 'Daily Tasks & Workspace',
  'review': 'Weekly Review',
  'practice': 'Projects & Practice',
  'phases': 'Learning Phases',
  'weekly-goals': 'Weekly Goals',
  'daily-tasks': 'Daily Tasks',
  'resources': 'Learning Resources',
  'learn': 'Learn (Core Theory)',
  'test': 'Test (Quizzes)',
  'build': 'Build (Mini-Projects)',
  'revise': 'Revise (Synthesis)',
  'interview': 'Interview & Exam Prep',
  'recommended-projects': 'Recommended Projects',
  'assignments': 'Practical Assignments',
  'challenges': 'Weekly Challenges',
  'milestones': 'Project Milestones',

  // My Growth Module Tabs
  'portfolio': 'Skill Portfolio & Evidence',
  'tree': 'Visual Skill Tree',
  'activity': 'Activity & Streaks',
  'achievements': 'Achievements & Badges',
  'dashboard': 'Progress Dashboard',
  'daily-streak': 'Daily Streak',
  'weekly-streak': 'Weekly Streak',
  'xp-levels': 'XP & Levels',
  'calendar': 'Learning Calendar',

  // AI Mentor Module Tabs
  'guidance': 'Real-Time Career Advice',
  'concepts': 'Concept Deep Dives',
  'gaps': 'Adaptive Recommendations',
  'gap-explanation': 'Skill Gap Explanations',
  'recommendations': 'Resource Recommendations',
  'feedback': 'Study Pace & Feedback',

  // My Career Tabs
  'overview': 'Career Overview',
  'eligibility': 'Eligibility',
  'qualifications': 'Qualifications',
  'skills': 'Required Skills',
  'progression': 'Career Progression',
  'environment': 'Career Environment',

  // Performance Review Tabs
  'summary': 'Weekly Summary',
  'reflection': 'Habit Reflection',
  'reschedule': 'Task Rescheduling',
  'performance': 'Performance Review',
  'revision': 'Weak Skill Revision',
  'next-plan': 'Next Week Plan',
  'results': 'Assessment Results',
  'strong': 'Strong Skills',
  'developing': 'Developing Skills',
  'weak': 'Weak Skills',
  'missing': 'Missing Skills',
  'readiness': 'Career Readiness',
  'retake': 'Retake Assessment',
  'compare-results': 'Compare Previous Results',
  'improvement-history': 'Skill Improvement History',
  'updated-readiness': 'Updated Readiness',
  'updated-roadmap': 'Generate Updated Roadmap',

  // Settings
  'preferences': 'Learning Preferences',
  'theme': 'Theme & Visual Environment',
  'notifications': 'Notification Preferences',
  'account': 'Account Management',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();

  // If on landing page or root without path, return null
  if (location.pathname === '/') return null;

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPath = pathSegments[0] || '';
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');
  const careerParam = searchParams.get('career');

  const mainLabel = ROUTE_LABELS[currentPath] || currentPath.charAt(0).toUpperCase() + currentPath.slice(1);
  const subLabel = currentTab ? TAB_LABELS[currentTab] || currentTab.charAt(0).toUpperCase() + currentTab.slice(1) : null;

  return (
    <nav className="flex items-center justify-between gap-2 text-xs mb-4 sm:mb-6 px-1 animate-fadeIn overflow-x-auto scrollbar-none" aria-label="Breadcrumb">
      <div className="flex items-center gap-1.5 text-slate-400 flex-nowrap sm:flex-wrap shrink-0">
        {/* Home / Dashboard link */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1 hover:text-cyan-400 transition-colors font-medium"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>

        {currentPath && currentPath !== 'dashboard' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            {subLabel || careerParam ? (
              <Link
                to={`/${currentPath}`}
                className="hover:text-cyan-400 transition-colors font-medium text-slate-300"
              >
                {mainLabel}
              </Link>
            ) : (
              <span className="text-white font-semibold">{mainLabel}</span>
            )}
          </>
        )}

        {subLabel && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="text-cyan-300 font-semibold">{subLabel}</span>
          </>
        )}

        {careerParam && !subLabel && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="text-cyan-300 font-mono text-[11px] capitalize">{careerParam.replace(/-/g, ' ')}</span>
          </>
        )}
      </div>

      {currentPath !== 'dashboard' && (
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition text-[11px] font-mono shrink-0"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back</span>
        </button>
      )}
    </nav>
  );
}
