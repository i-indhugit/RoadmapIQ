import React, { useState, useEffect, useMemo } from 'react';
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
  BookOpen,
  FolderGit2,
  HelpCircle,
  Calendar,
  ArrowRight,
  Target,
  Zap,
  Layers,
  Award,
  Play,
  RotateCcw,
  Check,
  CalendarCheck2,
  Code,
  Terminal,
  Bot,
  Compass,
  Maximize2,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ThemedJourneyMap from '../components/roadmap/ThemedJourneyMap';
import CheckpointDrawer from '../components/roadmap/CheckpointDrawer';
import CareerCompletionModal from '../components/roadmap/CareerCompletionModal';
import { getCareerTheme } from '../utils/careerThemes';
import { soundEffects } from '../utils/soundEffects';

export default function JourneyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'roadmap';

  const setTab = (tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const {
    activeRoadmap,
    setActiveRoadmap,
    activeRoadmapProgress,
    setActiveRoadmapProgress,
    activeRole,
    profile,
    toggleTask,
    updateTaskDetails,
    refreshRoadmap,
    triggerCelebration,
    addToast,
    refreshGamification,
  } = useApp();

  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [isCompletingCheckpoint, setIsCompletingCheckpoint] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [selectedDayFilter, setSelectedDayFilter] = useState('all');

  // AI Advice Modal State
  const [adviceModalOpen, setAdviceModalOpen] = useState(false);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState(null);

  useEffect(() => {
    if (!activeRoadmap) {
      refreshRoadmap();
    }
  }, [activeRoadmap, refreshRoadmap]);

  // Derived tasks & current "Continue Learning" target
  const allTasks = useMemo(() => activeRoadmap?.tasks || [], [activeRoadmap?.tasks]);
  const pendingTasks = useMemo(() => allTasks.filter((t) => !t.is_completed), [allTasks]);
  const completedTasks = useMemo(() => allTasks.filter((t) => t.is_completed), [allTasks]);
  const continueLearningTask = pendingTasks[0] || null;

  // Complete Checkpoint from Drawer or Continue Learning banner
  const handleCompleteCheckpoint = async (checkpoint, { evidenceLink, actualHours } = {}) => {
    if (!checkpoint) return;
    setIsCompletingCheckpoint(true);
    try {
      await updateTaskDetails(checkpoint.id, {
        is_completed: true,
        status: 'completed',
        evidence_link: evidenceLink || null,
        actual_hours_spent: actualHours || checkpoint.estimated_hours || 2,
      });

      // Increment daily streak via activity API
      if (profile?.id) {
        try {
          const streakRes = await activitiesApi.complete({
            student_id: profile.id,
            activity_type: 'task_completion',
            task_id: checkpoint.id,
            title: checkpoint.title || checkpoint.name,
            hours_spent: actualHours || checkpoint.estimated_hours || 2,
          });
          if (streakRes?.daily_streak_incremented) {
            addToast(
              'success',
              `Daily learning streak advanced to ${streakRes.current_daily_streak} days! 🔥 (+50 XP)`,
              'Streak Maintained'
            );
          }
        } catch (actErr) {
          console.debug('Activity logging note:', actErr);
        }
      }

      soundEffects.playMilestoneComplete();
      triggerCelebration({ particleCount: 80, spread: 70 });
      await refreshGamification();

      addToast(
        'success',
        `Milestone "${checkpoint.title}" Mastered! +${checkpoint.xp_reward || 50} XP earned.`,
        'Checkpoint Unlocked'
      );

      setSelectedCheckpoint((prev) =>
        prev && prev.id === checkpoint.id ? { ...prev, is_completed: true, status: 'completed' } : prev
      );

      // Check if all tasks finished
      if (pendingTasks.length <= 1) {
        setCompletionModalOpen(true);
      }
    } catch (err) {
      addToast('error', err.message || 'Failed to complete milestone.', 'Error');
    } finally {
      setIsCompletingCheckpoint(false);
    }
  };

  const handleUncompleteCheckpoint = async (checkpoint) => {
    if (!checkpoint) return;
    setIsCompletingCheckpoint(true);
    try {
      await updateTaskDetails(checkpoint.id, {
        is_completed: false,
        status: 'pending',
      });
      addToast('info', `Milestone "${checkpoint.title}" reset to incomplete.`, 'Progress Updated');
      setSelectedCheckpoint((prev) =>
        prev && prev.id === checkpoint.id ? { ...prev, is_completed: false, status: 'available' } : prev
      );
    } catch (err) {
      addToast('error', err.message || 'Failed to reset milestone.', 'Error');
    } finally {
      setIsCompletingCheckpoint(false);
    }
  };

  // AI Roadmap Advice Handler
  const handleOpenAiAdvice = async () => {
    setAdviceModalOpen(true);
    setAdviceLoading(true);
    setAiAdvice(null);
    try {
      const res = await aiApi.getRoadmapAdvice({
        roadmap_id: activeRoadmap?.id,
        role_title: activeRole?.title || activeRoadmap?.role_title || 'Career Track',
        progress_percentage: activeRoadmapProgress?.completion_percentage || 0,
      });
      setAiAdvice(res);
    } catch (err) {
      addToast('error', 'Could not fetch AI advice.', 'AI Offline');
    } finally {
      setAdviceLoading(false);
    }
  };

  if (!activeRoadmap && !activeRole) {
    return (
      <EmptyState
        icon={Compass}
        title="No Career Target Selected"
        description="Select a career target in Discover to generate your personalized learning journey."
        actionLabel="Go to Discover"
        onAction={() => navigate('/discover')}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* 1. Header Banner & Clear "Continue Learning" Action */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Map className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-bold">
                Module 2 • My Career Journey
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeRoadmap?.title || `${activeRole?.title || 'Career'} Master Preparation Roadmap`}
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Connected roadmap blending interactive milestones, daily tasks, curated free resources, coding drills, and weekly reviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setTab('roadmap');
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set('tab', 'roadmap');
                  next.set('fullscreen', 'true');
                  return next;
                });
              }}
              className="px-4 py-2.5 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center gap-2 hover:bg-teal-500/25 transition-all shadow-sm"
              title="Open full-screen interactive roadmap (100% viewport)"
            >
              <Maximize2 className="w-4 h-4 text-teal-400" />
              <span>Open Roadmap Fullscreen</span>
            </button>

            <button
              onClick={handleOpenAiAdvice}
              className="px-4 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-2 hover:bg-purple-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Roadmap Advisor</span>
            </button>
          </div>
        </div>

        {/* Prominent "Continue Learning" Hero Card */}
        {continueLearningTask && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-cyan-950/80 border border-teal-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  Next Up • Week {continueLearningTask.week_number} • Day {continueLearningTask.day_number || 1}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  +{continueLearningTask.xp_reward || 50} XP
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                {continueLearningTask.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">
                {continueLearningTask.description || 'Core learning checkpoint with free study materials and practical drills.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setSelectedCheckpoint(continueLearningTask)}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-teal-300 border border-teal-500/40 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Materials</span>
              </button>
              <button
                onClick={() => handleCompleteCheckpoint(continueLearningTask)}
                disabled={isCompletingCheckpoint}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Continue Learning</span>
              </button>
            </div>
          </div>
        )}

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setTab('roadmap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'roadmap'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-teal-400" />
            <span>Interactive Roadmap</span>
          </button>

          <button
            onClick={() => setTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'tasks'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Daily Tasks & Schedule</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
              {pendingTasks.length} Pending
            </span>
          </button>

          <button
            onClick={() => setTab('review')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'review'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Weekly Review & Goals</span>
          </button>

          <button
            onClick={() => setTab('practice')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'practice'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-amber-400" />
            <span>Practice & Challenges</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUBTAB 1: INTERACTIVE ROADMAP (THEMED MAP + CHECKPOINT DRAWER)   */}
      {/* ============================================================== */}
      {currentTab === 'roadmap' && (
        <div className="space-y-6">
          <ThemedJourneyMap
            roadmap={activeRoadmap}
            role={activeRole}
            onSelectCheckpoint={(cp) => setSelectedCheckpoint(cp)}
            selectedCheckpointId={selectedCheckpoint?.id}
            onOpenCertificate={() => setCompletionModalOpen(true)}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 2: DAILY TASKS & WEEKLY SCHEDULE                         */}
      {/* ============================================================== */}
      {currentTab === 'tasks' && (
        <div className="space-y-6">
          {/* Day Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDayFilter(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedDayFilter === day
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {day === 'all' ? 'All Days' : day}
              </button>
            ))}
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {allTasks
              .filter((t) => selectedDayFilter === 'all' || t.day_of_week === selectedDayFilter)
              .map((task) => {
                const isDone = task.is_completed;
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-slate-950/60 border-slate-800/60 opacity-80'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() =>
                          isDone
                            ? handleUncompleteCheckpoint(task)
                            : handleCompleteCheckpoint(task)
                        }
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'bg-slate-950 border-slate-700 hover:border-cyan-500 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              isDone ? 'line-through text-slate-500' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            {task.day_of_week || 'Weekday'} • Week {task.week_number}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-xs font-mono text-cyan-400 font-bold whitespace-nowrap">
                        +{task.xp_reward || 50} XP
                      </span>
                      <button
                        onClick={() => setSelectedCheckpoint(task)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 whitespace-nowrap"
                      >
                        Open Details &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 3: WEEKLY REVIEW & GOALS                                 */}
      {/* ============================================================== */}
      {currentTab === 'review' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-emerald-400" />
              <span>Weekly Milestone Performance Review</span>
            </h2>
            <p className="text-xs text-slate-400">
              Reflect on completed milestones, audit weekly study hours, and review weak skill revision before advancing to subsequent phases.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-400">Tasks Completed</div>
                <div className="text-2xl font-extrabold text-white mt-1">
                  {completedTasks.length} / {allTasks.length}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-400">Total Hours Invested</div>
                <div className="text-2xl font-extrabold text-cyan-400 mt-1">
                  {completedTasks.reduce((acc, t) => acc + (t.actual_hours_spent || t.estimated_hours || 2), 0)} hrs
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-400">Roadmap Progress</div>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                  {activeRoadmapProgress?.completion_percentage || 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 4: PRACTICE & CHALLENGES                                 */}
      {/* ============================================================== */}
      {currentTab === 'practice' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-amber-400" />
              <span>Hands-On Practice & Milestone Challenges</span>
            </h2>
            <p className="text-xs text-slate-400">
              Apply what you have learned with concrete implementation drills and interview technical challenges.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  Technical Interview Drills
                </span>
                <p className="text-xs text-slate-400">
                  Practice scenario-based interview questions tailored to {activeRole?.title || 'your career'}.
                </p>
                <button
                  onClick={() => navigate('/interview')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-800"
                >
                  Start Interview Simulator &rarr;
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase">
                  Capstone Portfolio Projects
                </span>
                <p className="text-xs text-slate-400">
                  Build production-grade repositories to demonstrate verifiable competency.
                </p>
                <button
                  onClick={() => navigate('/growth?tab=portfolio')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-800"
                >
                  Go to Skill Portfolio &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 14-Point Comprehensive Checkpoint Drawer */}
      {selectedCheckpoint && (
        <CheckpointDrawer
          checkpoint={selectedCheckpoint}
          role={activeRole}
          roadmap={activeRoadmap}
          onClose={() => setSelectedCheckpoint(null)}
          onCompleteCheckpoint={handleCompleteCheckpoint}
          onUncompleteCheckpoint={handleUncompleteCheckpoint}
          isCompleting={isCompletingCheckpoint}
        />
      )}

      {/* Career Completion Modal */}
      {completionModalOpen && (
        <CareerCompletionModal
          isOpen={completionModalOpen}
          onClose={() => setCompletionModalOpen(false)}
          roadmap={activeRoadmap}
          role={activeRole}
          profile={profile}
        />
      )}

      {/* AI Advice Modal */}
      {adviceModalOpen && (
        <Modal
          isOpen={adviceModalOpen}
          onClose={() => setAdviceModalOpen(false)}
          title="AI Career Mentor: Roadmap Insights"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            {adviceLoading ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Sparkles className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
                <p>Analyzing roadmap milestones and optimal study velocity...</p>
              </div>
            ) : aiAdvice ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
                  {aiAdvice.advice || aiAdvice.reply || aiAdvice.recommendation}
                </div>
                {aiAdvice.key_focus_areas && (
                  <div className="space-y-1.5">
                    <div className="font-mono text-teal-400 uppercase font-bold">Recommended Focus:</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      {aiAdvice.key_focus_areas.map((fa, i) => (
                        <li key={i}>{fa}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400">Could not retrieve advice.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

