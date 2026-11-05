import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { activitiesApi } from '../services/api';
import {
  Compass,
  ArrowRight,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  Play,
  Briefcase,
  Award,
  Map,
  TrendingUp,
  RotateCcw,
  Bot,
  Zap,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    profile,
    activeRoadmap,
    activeRoadmapProgress,
    activeRole,
    allRoles,
    gamification,
    refreshRoadmap,
    updateTaskDetails,
    addToast,
    triggerCelebration,
    switchCareer,
    refreshGamification,
  } = useApp();

  const [streakStatus, setStreakStatus] = useState(null);
  const [loggingTask, setLoggingTask] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  useEffect(() => {
    if (!activeRoadmap) {
      refreshRoadmap();
    }
  }, [activeRoadmap, refreshRoadmap]);

  useEffect(() => {
    if (profile?.id) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      activitiesApi
        .getStreakStatus(profile.id, tz)
        .then(setStreakStatus)
        .catch(() => null);
    }
  }, [profile?.id]);

  // Derived progress metrics
  const completionPct = activeRoadmapProgress?.completion_percentage ?? 0;
  const completedTasks = activeRoadmapProgress?.completed_tasks ?? activeRoadmap?.completed_tasks_count ?? 0;
  const totalTasks = activeRoadmapProgress?.total_tasks ?? activeRoadmap?.tasks_count ?? (activeRoadmap?.tasks?.length || 0);
  const readinessScore = activeRoadmapProgress?.readiness_score ?? activeRoadmap?.readiness_score ?? 45;

  // Single Focused "Today's Task" & "Continue Learning"
  const pendingTasks = useMemo(
    () => (activeRoadmap?.tasks || []).filter((t) => !t.is_completed),
    [activeRoadmap?.tasks]
  );
  const continueLearningTask = pendingTasks[0] || null;
  const todayTask = pendingTasks[0] || null;

  // Quick Switch Career Target
  const handleQuickSwitchRole = async (roleId) => {
    if (!roleId) return;
    setIsSwitchingRole(true);
    try {
      await switchCareer(Number(roleId));
      triggerCelebration();
      addToast('success', 'Switched career target! Roadmap and history restored.', 'Career Track Activated');
    } catch (err) {
      addToast('error', err.message || 'Could not change career.', 'Switch Error');
    } finally {
      setIsSwitchingRole(false);
    }
  };

  // Complete Today's Task handler
  const handleCompleteTodayTask = async () => {
    if (!todayTask) return;
    setLoggingTask(true);
    try {
      await updateTaskDetails(todayTask.id, {
        is_completed: true,
        status: 'completed',
        actual_hours_spent: todayTask.estimated_hours || 2,
      });

      if (profile?.id) {
        const res = await activitiesApi.complete({
          student_id: profile.id,
          activity_type: 'task_completion',
          task_id: todayTask.id,
          title: todayTask.title,
          hours_spent: todayTask.estimated_hours || 2,
        });

        triggerCelebration();
        await refreshGamification();

        if (res?.daily_streak_incremented) {
          addToast('success', `Daily Streak Advanced! 🔥 ${res.current_daily_streak} days (+50 XP)`, 'Streak Maintained');
        } else {
          addToast('success', `Completed "${todayTask.title}"! (+${res?.xp_awarded || 50} XP)`, 'Task Finished');
        }

        // Refresh streak status
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        activitiesApi.getStreakStatus(profile.id, tz).then(setStreakStatus).catch(() => null);
      }
    } catch (err) {
      addToast('error', err.message || 'Could not complete task.', 'Error');
    } finally {
      setLoggingTask(false);
    }
  };

  const currentDailyStreak = streakStatus?.current_daily_streak ?? gamification?.streakDays ?? 1;
  const currentWeeklyStreak = streakStatus?.current_weekly_streak ?? 1;

  // Four Primary Modules
  const primaryModules = [
    {
      id: 'discover',
      title: 'Discover',
      tagline: 'Explore 259+ Careers & Match',
      desc: 'Browse 18 domains, compare careers side-by-side, take the AI questionnaire, and lock your target.',
      path: '/discover',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400 hover:border-cyan-400',
      icon: Compass,
    },
    {
      id: 'assess',
      title: 'Assess',
      tagline: 'Career-Specific Testing & Gaps',
      desc: 'Take timed skill evaluations in your track’s environment, audit critical gaps, and adapt your roadmap.',
      path: '/assess',
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/40 text-indigo-400 hover:border-indigo-400',
      icon: Award,
    },
    {
      id: 'journey',
      title: 'My Journey',
      tagline: 'Interactive Roadmap & Daily Tasks',
      desc: 'Navigate milestone DAGs, access curated free materials, complete coding drills, and review weekly goals.',
      path: '/journey',
      color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-400 hover:border-teal-400',
      icon: Map,
    },
    {
      id: 'growth',
      title: 'My Growth',
      tagline: 'Verified Portfolio & Analytics',
      desc: 'Submit repository evidence, monitor separate readiness metrics, unlock RPG badges, and view activity streaks.',
      path: '/growth',
      color: 'from-rose-500/20 to-amber-500/10 border-rose-500/40 text-rose-400 hover:border-rose-400',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fadeIn">
      {/* 1. Clean Top Header: Welcome, Streaks & Selected Career */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Welcome back, {profile?.display_name || 'Explorer'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">
                {profile?.educational_field || 'Engineering / Technology'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              RoadmapIQ Career Command
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Your personalized career preparation journey is active. Advance daily tasks to build verifiable competencies.
            </p>
          </div>

          {/* Compact Streaks & Level Badges */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-400">Streak</div>
                <div className="text-xs font-extrabold text-amber-300 font-mono">
                  {currentDailyStreak} Days
                </div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-400">Player</div>
                <div className="text-xs font-extrabold text-cyan-300 font-mono">
                  Lvl {gamification.level} ({gamification.xp} XP)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Supporting Progress Indicators Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
              Roadmap Progress
            </div>
            <div className="text-xl font-extrabold text-white mt-0.5">
              {completionPct}%
            </div>
            <div className="text-[10px] text-slate-500">
              {completedTasks} of {totalTasks} milestones
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-mono text-indigo-400 font-semibold">
              Career Readiness
            </div>
            <div className="text-xl font-extrabold text-indigo-300 mt-0.5">
              {readinessScore}%
            </div>
            <div className="text-[10px] text-slate-500">Verified by assessments</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-mono text-amber-400 font-semibold">
              Weekly Streak
            </div>
            <div className="text-xl font-extrabold text-amber-300 mt-0.5">
              {currentWeeklyStreak} Wks
            </div>
            <div className="text-[10px] text-slate-500">Weekly goals achieved</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-mono text-teal-400 font-semibold">
              Active Track
            </div>
            <div className="text-sm font-bold text-teal-300 mt-1 truncate">
              {activeRole?.title || 'General Path'}
            </div>
            <div className="text-[10px] text-slate-500">
              {profile?.target_duration_weeks || 12} Weeks Plan
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. THE THREE PRIMARY DASHBOARD CARDS                           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: MY TARGET */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                <span>Primary Target</span>
              </div>
              <Link
                to="/discover?tab=target"
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Manage &rarr;
              </Link>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                {activeRole?.title || 'Target Role Not Set'}
              </h2>
              <div className="text-xs font-mono text-cyan-400 mt-0.5">
                {activeRole?.domain || 'Technology & IT'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Goal:</span>
                <span className="font-semibold text-white truncate max-w-[150px]">
                  {profile?.career_goals || 'Land High-Paying Role'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-semibold text-white">
                  {profile?.target_duration_weeks || 12} Weeks
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Weekly Commitment:</span>
                <span className="font-semibold text-white">
                  {profile?.weekly_study_hours || 15} hrs/wk
                </span>
              </div>
            </div>
          </div>

          {/* Quick Target Switcher */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1 flex items-center justify-between">
              <span>Switch Active Target Track</span>
              {isSwitchingRole && <span className="text-cyan-400 font-normal lowercase animate-pulse">saving...</span>}
            </label>
            <select
              value={activeRole?.id || ''}
              onChange={(e) => handleQuickSwitchRole(e.target.value)}
              disabled={isSwitchingRole}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-50"
            >
              {allRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CARD 2: CONTINUE LEARNING (HERO ACTION) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-950/50 via-slate-900 to-slate-900/90 border border-teal-500/40 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Play className="w-3.5 h-3.5" />
                <span>Continue Learning</span>
              </div>
              <Link
                to="/journey?tab=roadmap"
                className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
              >
                View Roadmap &rarr;
              </Link>
            </div>

            {continueLearningTask ? (
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Week {continueLearningTask.week_number} • Checkpoint
                </span>
                <h2 className="text-base font-bold text-white mt-0.5 line-clamp-2">
                  {continueLearningTask.title}
                </h2>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {continueLearningTask.description || 'Hands-on practical checkpoint with curated free resources.'}
                </p>
              </div>
            ) : (
              <div className="py-4 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white">All Milestones Mastered!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Congratulations! You have completed all roadmap milestones.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (continueLearningTask) {
                navigate('/journey?tab=roadmap');
              } else {
                navigate('/journey');
              }
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Current Milestone</span>
          </button>
        </div>

        {/* CARD 3: TODAY'S TASK */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Today's Task</span>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                +{todayTask?.xp_reward || 50} XP
              </span>
            </div>

            {todayTask ? (
              <div className="space-y-2">
                <h2 className="text-base font-bold text-white line-clamp-2">
                  {todayTask.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>Est: {todayTask.estimated_hours || 2} hrs</span>
                  <span>•</span>
                  <span>{todayTask.day_of_week || 'Today'}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {todayTask.description || 'Focused daily technical activity designed to reinforce practical mastery.'}
                </p>
              </div>
            ) : (
              <div className="py-4 text-center">
                <Check className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-slate-300">All tasks completed for today!</p>
              </div>
            )}
          </div>

          {todayTask && (
            <button
              onClick={handleCompleteTodayTask}
              disabled={loggingTask}
              className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-emerald-500/50 text-emerald-300 font-extrabold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{loggingTask ? 'Logging Verified Progress...' : 'Mark Completed Today (+50 XP)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. FOUR PRIMARY MODULES ENTRY NAVIGATION                       */}
      {/* ============================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            Four Core Learning Modules
          </h2>
          <span className="text-xs text-slate-500 font-mono">RoadmapIQ Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {primaryModules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.id}
                to={m.path}
                className={`p-5 rounded-3xl bg-slate-900/80 border transition-all duration-300 hover:shadow-xl flex flex-col justify-between group space-y-4 ${m.color}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-inherit">
                      <Icon className="w-5 h-5" />
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-white transition-all" />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-inherit transition-colors">
                      {m.title}
                    </h3>
                    <div className="text-[11px] font-mono text-slate-400 font-semibold mt-0.5">
                      {m.tagline}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="text-xs font-bold text-inherit flex items-center gap-1 pt-1">
                  <span>Enter Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
