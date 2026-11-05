import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  Flame,
  ArrowRight,
  ExternalLink,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import StreakHeatmapCard from '../components/common/StreakHeatmapCard';

const ProgressDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeRoadmap, activeRoadmapProgress, profile } = useApp();
  const currentTab = searchParams.get('tab') || 'dashboard';

  if (!activeRoadmap) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          title="No Active Roadmap"
          description="Generate a roadmap to track study milestones, hours logged, and skill mastery."
          actionText="Explore Careers"
          actionPath="/careers"
          icon={TrendingUp}
        />
      </div>
    );
  }

  const tasks = activeRoadmap.tasks || [];
  const completedTasks = tasks.filter((t) => t.is_completed);
  const completionPct = activeRoadmapProgress?.completion_percentage || 0;
  const hoursCompleted = activeRoadmapProgress?.completed_hours || 0;
  const totalHours = activeRoadmapProgress?.total_hours || activeRoadmap.total_estimated_hours || 0;
  const streakDays = activeRoadmapProgress?.streak_days || 3;
  const masteredCount = activeRoadmapProgress?.skills_mastered_count || 0;

  // Chart data from weekly_progress
  const weeklyData = (activeRoadmapProgress?.weekly_progress || []).map((w) => ({
    name: `Week ${w.week_number}`,
    Completed: w.completed_tasks,
    Remaining: w.total_tasks - w.completed_tasks,
    HoursLogged: w.completed_hours,
  }));

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-mono font-medium mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Progress Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Performance & Milestone Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time tracking of task velocity, verified learning hours, and portfolio evidence.
          </p>
        </div>

        <Link
          to="/planner"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-cyan text-navy-950 font-semibold text-xs hover:bg-cyan-300 transition shadow-glow-cyan"
        >
          <span>Open Weekly Planner</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Sub-option Navigation Tabs (Progressive Disclosure) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Progress Dashboard' },
          { id: 'daily-streak', label: 'Daily Streak' },
          { id: 'weekly-streak', label: 'Weekly Streak' },
          { id: 'xp-levels', label: 'XP & Levels' },
          { id: 'achievements', label: 'Achievements' },
          { id: 'calendar', label: 'Learning Calendar (Heatmap)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'xp-levels') {
                window.location.href = '/skill-tree';
              } else {
                setSearchParams({ tab: tab.id });
              }
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              currentTab === tab.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-navy-900/40 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {completionPct}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {completedTasks.length} of {tasks.length} tasks finished
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/40 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Hours Dedicated</span>
            <Clock className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-brand-cyan font-mono">
            {hoursCompleted}h
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            of {totalHours}h estimated effort
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/40 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Active Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-300 font-mono">
            {streakDays} Days
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Consistent study habit
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/40 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Readiness Score</span>
            <Award className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-300 font-mono">
            {activeRoadmap.readiness_score}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Target: {activeRoadmap.role_title}
          </span>
        </div>
      </div>

      {/* Daily & Weekly Streaks with 60-Day Visual Activity Heatmap */}
      {profile?.id && (
        <StreakHeatmapCard profileId={profile.id} />
      )}

      {/* Weekly Progress Chart */}
      {weeklyData.length > 0 && (
        <div className="p-6 rounded-2xl bg-navy-900/40 border border-slate-800 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-cyan" />
              <span>Weekly Task Completion Velocity</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {activeRoadmap.target_duration_weeks} Weeks Planned
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1329', borderColor: '#334155', borderRadius: '0.75rem' }}
                  labelStyle={{ color: '#38bdf8', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Completed" stackId="a" fill="#06b6d4" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Remaining" stackId="a" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Completed Tasks & Evidence Audit Log */}
      <div className="p-6 rounded-2xl bg-navy-900/40 border border-slate-800 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Completed Milestone Evidence Log ({completedTasks.length})</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {hoursCompleted}h total logged
          </span>
        </div>

        {completedTasks.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No completed tasks yet. Check off items in the <Link to="/planner" className="text-brand-cyan underline">Weekly Planner</Link> to log progress.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {completedTasks.map((t) => (
              <div key={t.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-medium text-slate-200 block">{t.title}</span>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span className="font-mono text-blue-300">Week {t.week_number}</span>
                    <span>•</span>
                    <span>{t.phase_name || `Phase ${t.phase_number}`}</span>
                    {t.actual_hours_spent > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 font-mono">{t.actual_hours_spent}h logged</span>
                      </>
                    )}
                  </div>
                </div>

                {t.evidence_link ? (
                  <a
                    href={t.evidence_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-950 border border-emerald-500/30 text-emerald-300 text-xs hover:border-emerald-400 transition shrink-0"
                  >
                    <span>View Evidence</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">No external link attached</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressDashboardPage;

