import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { roadmapsApi, aiApi, activitiesApi } from '../services/api';
import {
  Map,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BookOpen,
  FolderGit2,
  HelpCircle,
  Calendar,
  Compass,
  ArrowRight,
  Target,
  Zap,
  Layers,
  ListOrdered,
  Award,
  Maximize2,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { SkeletonCard } from '../components/common/LoadingSkeleton';
import ThemedJourneyMap from '../components/roadmap/ThemedJourneyMap';
import CheckpointDrawer from '../components/roadmap/CheckpointDrawer';
import CareerCompletionModal from '../components/roadmap/CareerCompletionModal';
import { getCareerTheme } from '../utils/careerThemes';
import { soundEffects } from '../utils/soundEffects';

const RoadmapPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const {
    activeRoadmap,
    setActiveRoadmap,
    activeRoadmapProgress,
    setActiveRoadmapProgress,
    activeRole,
    allRoles,
    switchCareer,
    isSwitchingCareer,
    profile,
    toggleTask,
    updateTaskDetails,
    refreshRoadmap,
    triggerCelebration,
    addToast
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [togglingTaskId, setTogglingTaskId] = useState(null);

  // View Mode: 'journey' (Interactive RPG Map) vs 'quests' (Quest Board)
  const [viewMode, setViewMode] = useState('journey');
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [isCompletingCheckpoint, setIsCompletingCheckpoint] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);

  // AI Advice Modal State
  const [adviceModalOpen, setAdviceModalOpen] = useState(false);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState(null);

  useEffect(() => {
    if (!activeRoadmap) {
      refreshRoadmap();
    }
  }, [activeRoadmap, refreshRoadmap]);

  // Expand first two weeks by default
  useEffect(() => {
    if (activeRoadmap?.tasks) {
      const initial = {};
      const weeks = [...new Set(activeRoadmap.tasks.map((t) => t.week_number))];
      weeks.forEach((w, i) => {
        initial[w] = i < 2; // open first two weeks
      });
      setExpandedWeeks(initial);
    }
  }, [activeRoadmap]);

  const handleToggleWeek = (weekNum) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekNum]: !prev[weekNum],
    }));
  };

  const handleTaskCheck = async (task) => {
    setTogglingTaskId(task.id);
    try {
      await toggleTask(task.id, task.is_completed);
    } catch {
      // Toast already shown in context
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleCompleteCheckpoint = async (checkpoint, { evidenceLink, actualHours }) => {
    setIsCompletingCheckpoint(true);
    try {
      await updateTaskDetails(checkpoint.id, {
        is_completed: true,
        status: 'completed',
        evidence_link: evidenceLink || null,
        actual_hours_spent: actualHours || checkpoint.estimated_hours || 4,
      });

      // Record verified daily learning activity for streak progression
      if (profile?.id) {
        try {
          const streakRes = await activitiesApi.complete({
            student_id: profile.id,
            activity_type: 'checkpoint_mastery',
            task_id: checkpoint.id,
            title: checkpoint.title || checkpoint.name,
            hours_spent: actualHours || checkpoint.estimated_hours || 2,
          });
          if (streakRes?.daily_streak_incremented) {
            addToast('success', `Daily learning streak advanced to ${streakRes.current_daily_streak} days! 🔥 (+50 XP)`, 'Streak Maintained');
          }
        } catch (actErr) {
          console.debug('Activity logging note:', actErr);
        }
      }

      soundEffects.playMilestoneComplete();
      triggerCelebration({ particleCount: 80, spread: 70 });
      addToast(
        'success',
        `Milestone "${checkpoint.title}" Mastered! Avatar is advancing forward on the road.`,
        'Checkpoint Unlocked!'
      );

      setSelectedCheckpoint((prev) =>
        prev ? { ...prev, is_completed: true, status: 'completed' } : null
      );
    } catch (err) {
      addToast('error', err.message || 'Failed to complete milestone.', 'Error');
    } finally {
      setIsCompletingCheckpoint(false);
    }
  };

  const handleUncompleteCheckpoint = async (checkpoint) => {
    setIsCompletingCheckpoint(true);
    try {
      await updateTaskDetails(checkpoint.id, {
        is_completed: false,
        status: 'pending',
      });
      addToast('info', `Milestone "${checkpoint.title}" reset to incomplete.`, 'Progress Updated');
      setSelectedCheckpoint((prev) =>
        prev ? { ...prev, is_completed: false, status: 'available' } : null
      );
    } catch (err) {
      addToast('error', err.message || 'Failed to reset milestone.', 'Error');
    } finally {
      setIsCompletingCheckpoint(false);
    }
  };

  const handleRegenerate = async () => {
    const effectiveRoleId = profile?.target_role_id || activeRole?.id || activeRoadmap?.role_id;
    if (!effectiveRoleId) {
      addToast('warning', 'Please select a target career first.', 'Notice');
      navigate('/discovery');
      return;
    }

    setRegenerating(true);
    try {
      addToast('info', 'Recalculating prerequisite DAG and weekly schedule...', 'Regenerating');
      const newPlan = await roadmapsApi.generate({
        profile_id: profile?.id,
        role_id: effectiveRoleId,
        weekly_hours: profile?.weekly_study_hours || 15,
        target_duration_weeks: profile?.target_duration_weeks || 12,
        preferred_format: profile?.preferred_learning_format || 'mixed',
        skills_assessment: profile?.skills_assessment || {},
      });

      setActiveRoadmap(newPlan);
      const prog = await roadmapsApi.getProgress(newPlan.id).catch(() => null);
      if (prog) setActiveRoadmapProgress(prog);

      addToast('success', 'Roadmap regenerated successfully!', 'Updated Plan');
    } catch (err) {
      addToast('error', err.message || 'Regeneration failed.', 'Error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleGetAiAdvice = async () => {
    setAdviceModalOpen(true);
    setAdviceLoading(true);
    setAiAdvice(null);

    try {
      const res = await aiApi.getRoadmapAdvice({
        roadmap_id: activeRoadmap?.id,
        role_title: activeRoadmap?.role_title || 'Software Development Engineer',
        readiness_score: activeRoadmap?.readiness_score || 0,
        target_duration_weeks: activeRoadmap?.target_duration_weeks || 12,
        weekly_hours: activeRoadmap?.weekly_hours || 15,
        top_gaps: ['Data Structures & Algorithms', 'System Architecture', 'Database Indexing'],
      });
      setAiAdvice(res);
    } catch (err) {
      addToast('error', 'Could not generate AI advice.', 'AI Provider Error');
    } finally {
      setAdviceLoading(false);
    }
  };

  if (!activeRoadmap) {
    return (
      <EmptyState
        icon={Compass}
        title="No Roadmap Generated Yet"
        description="Configure your student profile or select a target role to generate your personal learning roadmap."
        actionLabel="Go to Profile"
        onAction={() => navigate('/profile')}
      />
    );
  }

  // Group tasks by week
  const tasksByWeek = {};
  (activeRoadmap.tasks || []).forEach((task) => {
    if (!tasksByWeek[task.week_number]) {
      tasksByWeek[task.week_number] = [];
    }
    tasksByWeek[task.week_number].push(task);
  });

  const weekNumbers = Object.keys(tasksByWeek).map(Number).sort((a, b) => a - b);

  const completedCount = activeRoadmapProgress?.completed_tasks ?? activeRoadmap.completed_tasks_count ?? 0;
  const totalCount = activeRoadmapProgress?.total_tasks ?? activeRoadmap.tasks_count ?? 0;
  const completionPercentage = activeRoadmapProgress?.completion_percentage ?? (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Career Track Selector Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4 border-slate-700/80 bg-navy-900/90 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-cyan">
                Active Career Track
              </span>
              {isSwitchingCareer && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan animate-pulse">
                  Switching Track...
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{activeRole?.title || activeRoadmap.role_title}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <label htmlFor="career-select" className="text-xs font-mono text-slate-400 font-semibold shrink-0">
            Select Career:
          </label>
          <select
            id="career-select"
            value={activeRole?.id || activeRoadmap.role_id}
            onChange={(e) => switchCareer(Number(e.target.value))}
            disabled={isSwitchingCareer}
            className="w-full sm:w-72 bg-navy-950 border border-slate-700 hover:border-brand-cyan/60 text-slate-100 font-semibold text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all cursor-pointer disabled:opacity-50 shadow-inner"
          >
            {allRoles.map((r) => (
              <option key={r.id} value={r.id} className="bg-navy-900 text-slate-100 py-1">
                {r.title} ({r.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="primary">Step 4: Execution & Mastery</Badge>
            <span className="text-xs font-mono text-slate-400">
              {activeRoadmap.target_duration_weeks} Weeks • {activeRoadmap.weekly_hours} hrs/week
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <span>Roadmap:</span>
            <span className="text-brand-cyan">{activeRoadmap.role_title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {activeRoadmap.summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleGetAiAdvice}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span>AI Study Advice</span>
          </button>

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="btn-primary text-xs py-2 px-4"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-navy-950 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Recomputing...' : 'Regenerate Plan'}</span>
          </button>
        </div>
      </div>

      {/* Progressive Disclosure Sub-Option Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Roadmap Overview', icon: Compass },
          { id: 'phases', label: 'Learning Phases', icon: ListOrdered },
          { id: 'weekly-goals', label: 'Weekly Goals', icon: Target },
          { id: 'daily-tasks', label: 'Daily Tasks', icon: Calendar },
          { id: 'resources', label: 'Learning Resources', icon: BookOpen },
          { id: 'history', label: 'Roadmap History', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-brand-cyan text-navy-950 shadow-glow font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Progress Metric Banner */}
      <div className="glass-panel p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-200">Overall Curriculum Completion</span>
            <span className="font-mono text-brand-cyan font-bold">{completionPercentage}%</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span><strong>{completedCount}</strong> of <strong>{totalCount}</strong> tasks finished</span>
            <span>•</span>
            <span>Readiness: <strong className="text-slate-200">{activeRoadmap.readiness_score}%</strong></span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-cyan via-sky-400 to-brand-blue h-2.5 rounded-full transition-all duration-500 shadow-glow-cyan"
            style={{ width: `${Math.min(100, completionPercentage)}%` }}
          />
        </div>
      </div>

      {/* 100% Milestone Completion Certificate Callout Banner */}
      {totalCount > 0 && completedCount === totalCount && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-navy-900 border border-amber-400/50 flex flex-wrap items-center justify-between gap-4 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-navy-950 flex items-center justify-center font-bold shadow-lg shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-400 text-navy-950 font-black">
                  100% COMPLETE
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  Career Certified
                </span>
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-100 mt-0.5">
                Congratulations! You have mastered all phases of {activeRole?.title || activeRoadmap.role_title}.
              </h4>
            </div>
          </div>
          <button
            onClick={() => setCompletionModalOpen(true)}
            className="btn-primary text-xs py-2 px-4 shadow-glow-cyan flex items-center gap-2 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>View Career Certificate</span>
          </button>
        </div>
      )}

      {/* Capacity Warning if any */}
      {activeRoadmap.is_over_capacity && (
        <div className="glass-panel p-4 border-amber-500/30 bg-amber-950/20 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{activeRoadmap.capacity_warning}</p>
        </div>
      )}

      {/* View Mode Content according to Progressive Disclosure Sub-Option Tab */}
      {isSwitchingCareer ? (
        <div className="glass-panel p-16 text-center flex flex-col items-center justify-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 border-3 border-brand-cyan border-t-transparent rounded-full animate-spin" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-slate-100">
              Loading {activeRole?.title || 'Selected Track'} Curriculum & Theme...
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Generating or retrieving topologically sequenced milestones...
            </p>
          </div>
        </div>
      ) : currentTab === 'overview' ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-cyan" />
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Roadmap Presentation Mode
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode('journey');
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('fullscreen', 'true');
                    return next;
                  });
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-850 hover:bg-slate-800 border border-brand-cyan/40 text-brand-cyan hover:border-brand-cyan text-xs font-semibold transition-all shadow-sm"
                title="Enter Full-Screen Learning Mode (100% Viewport)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full-Screen Mode</span>
              </button>

              <div className="flex items-center rounded-xl bg-navy-850 p-1 border border-slate-700/80">
              <button
                type="button"
                onClick={() => setViewMode('journey')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'journey'
                    ? 'bg-brand-cyan text-navy-950 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Themed Journey</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('quests')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'quests'
                    ? 'bg-brand-cyan text-navy-950 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Quest Board</span>
              </button>
            </div>
          </div>

          {viewMode === 'journey' ? (
            <ThemedJourneyMap
              roadmap={activeRoadmap}
              role={activeRole}
              onSelectCheckpoint={(node) => setSelectedCheckpoint(node)}
              selectedCheckpointId={selectedCheckpoint?.id}
              onOpenCertificate={() => setCompletionModalOpen(true)}
            />
          ) : (
            <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 mb-1">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Gamified Quest Board</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Roadmap Learning Quests
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Each completed quest updates your career readiness, awards verified XP, and unlocks achievements.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                {activeRoadmap?.tasks?.filter((t) => t.is_completed).length || 0} / {activeRoadmap?.tasks?.length || 0} Quests Conquered
              </span>
            </div>
          </div>

          {/* Quests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(activeRoadmap?.tasks || []).map((task) => {
              const isCompleted = task.is_completed;
              const isEpic = (task.estimated_hours || 0) >= 6 || !!task.deliverable;
              const isDaily = (task.estimated_hours || 0) <= 2;
              const questLabel = isEpic
                ? 'Epic Project Quest'
                : isDaily
                ? 'Daily Sprint Quest'
                : 'Weekly Skill Quest';

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-slate-900/60 border-emerald-500/40'
                      : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/40 shadow-lg'
                  }`}
                >
                  <div>
                    {/* Quest Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                          isEpic
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                            : isDaily
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                        }`}
                      >
                        {questLabel} • Week {task.week_number}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-lg">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          +{task.xp_reward || 80} XP
                        </span>
                        {isCompleted && (
                          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-lg">
                            ✓ Mastered
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1.5">
                      {task.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-3">
                      {task.description}
                    </p>

                    {task.deliverable && (
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 mb-3">
                        <span className="font-semibold text-cyan-400 font-mono">Deliverable: </span>
                        {task.deliverable}
                      </div>
                    )}
                  </div>

                  {/* Actions & Verification */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      ~{task.estimated_hours}h effort
                    </span>

                    <button
                      onClick={() => handleTaskCheck(task)}
                      disabled={togglingTaskId === task.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isCompleted
                          ? 'bg-slate-800 text-slate-400 hover:text-rose-400'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Mark Incomplete' : 'Complete Quest'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </div>
      ) : currentTab === 'phases' ? (
        /* Tab 2: Learning Phases (Weekly Accordion Sections) */
        <div className="space-y-4 animate-fadeIn">
        {weekNumbers.map((weekNum) => {
          const weekTasks = tasksByWeek[weekNum] || [];
          const weekCompleted = weekTasks.filter((t) => t.is_completed).length;
          const weekTotalHours = weekTasks.reduce((sum, t) => sum + t.estimated_hours, 0);
          const isExpanded = !!expandedWeeks[weekNum];
          const isAllDone = weekCompleted === weekTasks.length && weekTasks.length > 0;

          return (
            <div
              key={weekNum}
              className={`glass-panel overflow-hidden border transition-all ${
                isAllDone
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : 'border-slate-800'
              }`}
            >
              {/* Week Accordion Header */}
              <button
                type="button"
                onClick={() => handleToggleWeek(weekNum)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                      isAllDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-navy-800 text-brand-cyan border border-slate-700'
                    }`}
                  >
                    W{weekNum}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                      <span>Week {weekNum} Curriculum</span>
                      {isAllDone && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>{weekTasks.length} tasks</span>
                      <span>•</span>
                      <span>~{weekTotalHours} hours</span>
                      <span>•</span>
                      <span className={isAllDone ? 'text-emerald-400 font-semibold' : ''}>
                        {weekCompleted}/{weekTasks.length} completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Tasks List within Week */}
              {isExpanded && (
                <div className="p-4 sm:p-5 pt-0 space-y-3.5 border-t border-slate-800/80 mt-2">
                  {weekTasks.map((task) => {
                    const isToggling = togglingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border transition-all ${
                          task.is_completed
                            ? 'bg-navy-900/40 border-emerald-500/30 opacity-75'
                            : 'bg-navy-850/80 border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Task Completion Checkbox */}
                          <div className="pt-0.5 shrink-0">
                            <input
                              type="checkbox"
                              id={`task-${task.id}`}
                              checked={task.is_completed}
                              disabled={isToggling}
                              onChange={() => handleTaskCheck(task)}
                              className="w-4 h-4 rounded border-slate-700 text-brand-cyan focus:ring-brand-cyan accent-brand-cyan cursor-pointer disabled:opacity-50"
                            />
                          </div>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                                  {task.skill_category}
                                </span>
                                <Badge
                                  variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'default'}
                                  size="xs"
                                >
                                  {task.priority} Priority
                                </Badge>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 font-semibold">
                                  <Zap className="w-2.5 h-2.5" /> +{task.xp_reward || 50} XP
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-800 text-brand-cyan">
                                  {task.task_type.toUpperCase()}
                                </span>
                                {task.deliverable && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                                    Artifact: {task.deliverable}
                                  </span>
                                )}
                              </div>

                              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.estimated_hours}h
                              </span>
                            </div>

                            <label
                              htmlFor={`task-${task.id}`}
                              className={`block font-semibold text-sm cursor-pointer ${
                                task.is_completed ? 'line-through text-slate-400' : 'text-slate-100'
                              }`}
                            >
                              {task.title}
                            </label>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {task.description}
                            </p>

                            {/* Completion Criteria */}
                            <div className="p-2.5 rounded-lg bg-navy-900/60 border border-slate-800/80 text-[11px] text-slate-300">
                              <strong className="text-brand-cyan font-mono">Completion Criteria: </strong>
                              {task.completion_criteria}
                            </div>

                            {/* Free Learning Resources */}
                            {task.resources && task.resources.length > 0 && (
                              <div className="pt-1.5 space-y-1.5">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                                  Free Vetted Resources
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {task.resources.map((res, i) => (
                                    <a
                                      key={i}
                                      href={res.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-slate-800 border border-slate-700/80 text-xs text-sky-300 hover:text-sky-200 transition-colors"
                                    >
                                      <BookOpen className="w-3 h-3 text-brand-cyan" />
                                      <span>{res.title}</span>
                                      <span className="text-[10px] font-mono text-slate-500">({res.provider})</span>
                                      <ExternalLink className="w-3 h-3 text-slate-500 ml-0.5" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      ) : currentTab === 'weekly-goals' ? (
        /* Tab 3: Weekly Goals & Pacing Allocation */
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-5 space-y-1 border-slate-800">
              <span className="text-xs font-mono text-slate-400 uppercase">Target Commitment</span>
              <div className="text-2xl font-extrabold text-white font-mono">
                {activeRoadmap.weekly_hours} hrs/week
              </div>
              <p className="text-xs text-slate-400">Paced for sustainable retention.</p>
            </div>

            <div className="glass-panel p-5 space-y-1 border-slate-800">
              <span className="text-xs font-mono text-slate-400 uppercase">Target Duration</span>
              <div className="text-2xl font-extrabold text-brand-cyan font-mono">
                {activeRoadmap.target_duration_weeks} Weeks
              </div>
              <p className="text-xs text-slate-400">Total preparation timeline.</p>
            </div>

            <div className="glass-panel p-5 space-y-1 border-slate-800">
              <span className="text-xs font-mono text-slate-400 uppercase">Weekly Milestone Pace</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {Math.ceil((activeRoadmap.tasks?.length || 12) / (activeRoadmap.target_duration_weeks || 12))} Goals/Wk
              </div>
              <p className="text-xs text-slate-400">Average weekly tasks scheduled.</p>
            </div>
          </div>

          {/* Week-by-Week Goal Breakdown Table */}
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-cyan" />
                <span>Weekly Goal Milestones Matrix</span>
              </h3>
              <button
                type="button"
                onClick={handleGetAiAdvice}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                <span>AI Pacing Feedback</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-navy-950 text-slate-400 font-mono uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Week</th>
                    <th className="p-3">Focus Objective</th>
                    <th className="p-3">Est. Study Hours</th>
                    <th className="p-3">Tasks</th>
                    <th className="p-3 text-right">Completion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {weekNumbers.map((wNum) => {
                    const wTasks = tasksByWeek[wNum] || [];
                    const wCompleted = wTasks.filter((t) => t.is_completed).length;
                    const wHours = wTasks.reduce((s, t) => s + (t.estimated_hours || 0), 0);
                    return (
                      <tr key={wNum} className="hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-brand-cyan">Week {wNum}</td>
                        <td className="p-3 font-sans text-slate-200">
                          {wTasks[0]?.title || `Milestone Pack W${wNum}`}
                        </td>
                        <td className="p-3 text-slate-300">~{wHours} hrs</td>
                        <td className="p-3 text-slate-400">{wTasks.length} tasks</td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${
                            wCompleted === wTasks.length && wTasks.length > 0
                              ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {wCompleted}/{wTasks.length}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : currentTab === 'daily-tasks' ? (
        /* Tab 4: Daily Tasks */
        <div className="space-y-6 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-navy-900 to-slate-900 border border-brand-cyan/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cyan font-bold">
                Today's Daily Action
              </span>
              <h3 className="text-lg font-bold text-white">
                {activeRoadmap?.tasks?.find((t) => !t.is_completed)?.title || "All current tasks completed!"}
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                {activeRoadmap?.tasks?.find((t) => !t.is_completed)?.description || "You're caught up on your roadmap! Review past lessons or take a practice quiz."}
              </p>
            </div>

            {activeRoadmap?.tasks?.find((t) => !t.is_completed) && (
              <button
                type="button"
                onClick={() => handleTaskCheck(activeRoadmap.tasks.find((t) => !t.is_completed))}
                className="btn-primary text-xs py-2.5 px-5 shrink-0 shadow-glow"
              >
                <CheckCircle2 className="w-4 h-4 text-navy-950" />
                <span>Complete Task (+50 XP)</span>
              </button>
            )}
          </div>

          <div className="glass-panel p-6 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-cyan" />
                <span>Full Monday-Sunday Interactive Study Schedule</span>
              </h4>
              <p className="text-xs text-slate-400">
                Manage your daily 7-day schedule, rearrange study blocks, and track study time hours.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/planner')}
              className="btn-secondary text-xs py-2 px-4 shrink-0 flex items-center gap-2"
            >
              <span>Open Weekly Planner</span>
              <ArrowRight className="w-4 h-4 text-brand-cyan" />
            </button>
          </div>
        </div>
      ) : currentTab === 'resources' ? (
        /* Tab 5: Learning Resources */
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-navy-900/60 border border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-cyan" />
                <span>Curated Free Online Learning Materials</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Zero paywalls. Vetted documentation, interactive guides, tutorials, and standard references.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/resources')}
              className="btn-secondary text-xs py-2 px-4 shrink-0 flex items-center gap-1.5"
            >
              <span>Browse Full Resource Library</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-cyan" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(activeRoadmap?.tasks || []).flatMap((t) =>
              (t.resources || []).map((res, i) => ({ ...res, week: t.week_number, taskTitle: t.title, key: `${t.id}-${i}` }))
            ).map((res) => (
              <a
                key={res.key}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="glass-panel p-4 border-slate-800 hover:border-brand-cyan/50 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                      Week {res.week}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {res.provider}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-brand-cyan transition-colors">
                    {res.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    Associated milestone: {res.taskTitle}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-brand-cyan">
                  <span>Open Free Learning Material</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : (
        /* Tab 6: Roadmap History */
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-cyan" />
                  <span>Roadmap Plan History & Provenance</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Active personalized learning trajectory and recalculation milestones.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE VERSION
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block">Target Role</span>
                <span className="text-sm font-bold text-white mt-1 block">
                  {activeRoadmap.role_title}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block">Baseline Readiness</span>
                <span className="text-sm font-bold text-brand-cyan mt-1 block">
                  {activeRoadmap.readiness_score || 0}%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block">Total Milestones</span>
                <span className="text-sm font-bold text-white mt-1 block">
                  {activeRoadmap.tasks?.length || 0} Topics
                </span>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block">Study Allocation</span>
                <span className="text-sm font-bold text-amber-300 mt-1 block">
                  {activeRoadmap.weekly_hours}h / {activeRoadmap.target_duration_weeks}w
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerating}
                className="btn-primary text-xs py-2 px-4 shadow-glow"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-navy-950 ${regenerating ? 'animate-spin' : ''}`} />
                <span>{regenerating ? 'Recalculating...' : 'Regenerate Updated Roadmap'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Checkpoint Detail Drawer */}
      <CheckpointDrawer
        checkpoint={selectedCheckpoint}
        role={activeRole}
        roadmap={activeRoadmap}
        onClose={() => setSelectedCheckpoint(null)}
        onCompleteCheckpoint={handleCompleteCheckpoint}
        onUncompleteCheckpoint={handleUncompleteCheckpoint}
        isCompleting={isCompletingCheckpoint}
      />

      {/* Career Completion Certificate Modal */}
      <CareerCompletionModal
        isOpen={completionModalOpen}
        onClose={() => setCompletionModalOpen(false)}
        roadmap={activeRoadmap}
        theme={getCareerTheme(activeRole?.slug || activeRoadmap?.role_title || '')}
        profile={profile}
      />

      {/* AI Roadmap Advice Modal */}
      <Modal
        isOpen={adviceModalOpen}
        onClose={() => setAdviceModalOpen(false)}
        title={`AI Strategic Pacing Advice: ${activeRoadmap.role_title}`}
        maxWidth="max-w-2xl"
      >
        {adviceLoading ? (
          <div className="space-y-4 py-8 text-center">
            <div className="w-10 h-10 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-mono">Consulting technical curriculum reasoning model...</p>
          </div>
        ) : aiAdvice ? (
          <div className="space-y-5 text-xs sm:text-sm">
            <div>
              <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-brand-cyan font-mono">
                Executive Strategy Summary
              </h4>
              <p className="text-slate-300 leading-relaxed bg-navy-850 p-3.5 rounded-lg border border-slate-800">
                {aiAdvice.executive_summary}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-sky-400 font-mono">
                Weekly Time Pacing Allocation
              </h4>
              <p className="text-slate-300 leading-relaxed bg-navy-850 p-3.5 rounded-lg border border-slate-800">
                {aiAdvice.weekly_pacing_strategy}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-amber-400 font-mono">
                Potential Pitfalls & Bottlenecks to Avoid
              </h4>
              <ul className="space-y-1.5 bg-navy-850 p-3.5 rounded-lg border border-slate-800">
                {aiAdvice.potential_bottlenecks?.map((item, idx) => (
                  <li key={idx} className="text-slate-300 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-emerald-400 font-mono">
                Campus & Placement Interview Recommendations
              </h4>
              <ul className="space-y-1.5 bg-navy-850 p-3.5 rounded-lg border border-slate-800">
                {aiAdvice.placement_tips?.map((tip, idx) => (
                  <li key={idx} className="text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setAdviceModalOpen(false)}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                Close Advice
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default RoadmapPage;

