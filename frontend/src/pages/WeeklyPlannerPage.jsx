import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle,
  ExternalLink,
  Sliders,
  Layers,
  Link as LinkIcon,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  FolderGit2,
  Flame,
  BookOpen,
  Code2,
  CheckSquare,
  HelpCircle,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiApi, activitiesApi } from '../services/api';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started', color: 'bg-slate-800 text-slate-300' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-950/60 text-amber-300 border border-amber-500/30' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' },
];

const WeeklyPlannerPage = () => {
  const {
    activeRoadmap,
    toggleTask,
    updateTaskDetails,
    rescheduleActiveRoadmap,
    addToast,
    profile,
    triggerCelebration,
  } = useApp();

  const [selectedWeek, setSelectedWeek] = useState('all');
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [newWeeklyHours, setNewWeeklyHours] = useState(activeRoadmap?.weekly_hours || 15);
  const [newWeeks, setNewWeeks] = useState(activeRoadmap?.target_duration_weeks || 12);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState(null);

  // Evidence modal state
  const [evidenceModalTask, setEvidenceModalTask] = useState(null);
  const [evidenceInput, setEvidenceInput] = useState('');
  const [loggedHoursInput, setLoggedHoursInput] = useState('');

  // AI Weekly Breakdown state
  const [aiPlanLoading, setAiPlanLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState(null);
  const [showAiPlan, setShowAiPlan] = useState(false);

  const handleCompleteDailyActivity = async (task) => {
    setCompletingTaskId(task.id);
    try {
      // 1. Mark task completed
      await updateTaskDetails(task.id, {
        is_completed: true,
        status: 'completed',
        actual_hours_spent: task.actual_hours_spent > 0 ? task.actual_hours_spent : task.estimated_hours || 2,
      });

      // 2. Record daily learning activity for streak
      if (profile?.id) {
        const res = await activitiesApi.complete({
          student_id: profile.id,
          activity_type: 'task_completion',
          task_id: task.id,
          title: task.title,
          hours_spent: task.estimated_hours || 2,
        });

        triggerCelebration();
        if (res?.daily_streak_incremented) {
          addToast('success', `Daily Streak Advanced! 🔥 ${res.current_daily_streak} days (+50 XP)`, 'Streak Maintained');
        } else {
          addToast('success', `Activity completed! (+${res?.xp_awarded || 50} XP)`, 'Progress Logged');
        }
      }
    } catch (err) {
      addToast('error', err.message || 'Could not record daily activity.', 'Error');
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleGenerateAiPlan = async () => {
    setAiPlanLoading(true);
    setShowAiPlan(true);
    try {
      const weekNum = selectedWeek === 'all' ? 1 : parseInt(selectedWeek, 10);
      const skillsInWeek = filteredTasks.map(t => t.title).slice(0, 5);
      const res = await aiApi.generateWeeklyPlan({
        role_title: activeRoadmap.role_title || 'Software Engineering',
        target_skills: skillsInWeek.length > 0 ? skillsInWeek : ['Foundations', 'Core Concepts'],
        weekly_hours: activeRoadmap.weekly_hours || 15,
        week_number: weekNum,
        focus_topic: filteredTasks[0]?.phase_name || 'Core Curriculum',
      });
      setAiPlan(res);
      addToast('success', `Generated Week ${weekNum} Day-by-Day schedule with Gemini!`, 'AI Planner');
    } catch (err) {
      addToast('error', err.message || 'Failed to generate AI weekly schedule.', 'AI Error');
    } finally {
      setAiPlanLoading(false);
    }
  };

  if (!activeRoadmap || !activeRoadmap.tasks || activeRoadmap.tasks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          title="No Active Roadmap Found"
          description="Generate a personalized roadmap to activate your weekly planner, task schedules, and progress tracking."
          actionText="Explore Careers & Generate"
          actionPath="/careers"
          icon={Calendar}
        />
      </div>
    );
  }

  const tasks = activeRoadmap.tasks;

  // Derive available weeks and phases
  const weeks = Array.from(new Set(tasks.map((t) => t.week_number))).sort((a, b) => a - b);
  const phases = Array.from(new Set(tasks.map((t) => t.phase_name || `Phase ${t.phase_number}`)));

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesWeek = selectedWeek === 'all' || t.week_number === parseInt(selectedWeek, 10);
    const matchesPhase = selectedPhase === 'all' || (t.phase_name || `Phase ${t.phase_number}`) === selectedPhase;
    return matchesWeek && matchesPhase;
  });

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTaskDetails(task.id, {
        status: newStatus,
        is_completed: newStatus === 'completed',
      });
    } catch {
      // Toast handled by AppContext
    }
  };

  const handleOpenEvidence = (task) => {
    setEvidenceModalTask(task);
    setEvidenceInput(task.evidence_link || '');
    setLoggedHoursInput(task.actual_hours_spent > 0 ? task.actual_hours_spent.toString() : task.estimated_hours.toString());
  };

  const handleSaveEvidence = async () => {
    if (!evidenceModalTask) return;
    try {
      const hoursNum = parseFloat(loggedHoursInput) || evidenceModalTask.estimated_hours;
      await updateTaskDetails(evidenceModalTask.id, {
        evidence_link: evidenceInput.trim() || null,
        actual_hours_spent: hoursNum,
      });
      setEvidenceModalTask(null);
    } catch {
      // Toast handled by AppContext
    }
  };

  const handleExecuteReschedule = async () => {
    setIsRescheduling(true);
    try {
      await rescheduleActiveRoadmap(newWeeklyHours, newWeeks);
      setIsRescheduleOpen(false);
    } catch {
      // Toast handled by AppContext
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-mono font-medium mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Structured Pacing & Execution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Weekly Study Planner
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track daily activities, log actual study hours, attach deliverable evidence, and dynamically reschedule as your schedule evolves.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAiPlan}
            disabled={aiPlanLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-xs font-semibold shadow-glow-cyan/20 transition disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${aiPlanLoading ? 'animate-spin' : ''}`} />
            <span>{aiPlanLoading ? 'Planning...' : 'Gemini Day-by-Day Plan'}</span>
          </button>

          <button
            onClick={() => {
              setNewWeeklyHours(activeRoadmap.weekly_hours);
              setNewWeeks(activeRoadmap.target_duration_weeks);
              setIsRescheduleOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Sliders className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Adaptive Reschedule</span>
          </button>
        </div>
      </div>

      {/* Capacity Alert if over capacity */}
      {activeRoadmap.is_over_capacity && activeRoadmap.capacity_warning && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <span className="font-semibold block mb-0.5 text-amber-300">Pacing Warning:</span>
            {activeRoadmap.capacity_warning}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-navy-900/40 border border-slate-800 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        {/* Week Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedWeek('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${selectedWeek === 'all'
                ? 'bg-brand-cyan text-navy-950 font-semibold'
                : 'bg-navy-800/80 text-slate-300 hover:bg-slate-700/60'
              }`}
          >
            All Weeks ({weeks.length})
          </button>
          {weeks.map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w.toString())}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${selectedWeek === w.toString()
                  ? 'bg-brand-cyan text-navy-950 font-semibold'
                  : 'bg-navy-800/80 text-slate-300 hover:bg-slate-700/60'
                }`}
            >
              Week {w}
            </button>
          ))}
        </div>

        {/* Phase Filter Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">Phase:</span>
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-navy-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-brand-cyan"
          >
            <option value="all">All 5 Phases</option>
            {phases.map((p, idx) => (
              <option key={idx} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gemini AI Day-by-Day Breakdown Card */}
      {showAiPlan && (
        <div className="glass-panel p-5 sm:p-6 space-y-4 border-brand-cyan/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-brand-cyan">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>Gemini Weekly Study Itinerary</span>
                  <Badge variant="primary" size="xs">Google Gemini AI</Badge>
                </h2>
                <p className="text-xs text-slate-400">
                  {aiPlan?.focus_summary || 'Custom day-by-day breakdown tailored to your weekly hour quota.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAiPlan(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              ✕ Close
            </button>
          </div>

          {aiPlanLoading ? (
            <div className="py-8 flex items-center justify-center gap-3 text-xs text-slate-400 font-mono">
              <Sparkles className="w-4 h-4 text-brand-cyan animate-spin" />
              <span>Prompting Google Gemini for pacing & practical drills...</span>
            </div>
          ) : aiPlan?.day_plans ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {aiPlan.day_plans.map((day, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800 hover:border-brand-cyan/30 transition-all space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span className="text-brand-cyan font-mono">{day.day}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {day.hours}h
                      </span>
                    </div>
                    <div className="text-xs font-medium text-white">{day.focus}</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{day.activity}</p>
                    {day.milestone && (
                      <div className="text-[10px] text-emerald-300 font-mono pt-1 border-t border-slate-800/80">
                        ✓ {day.milestone}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {aiPlan.tips && aiPlan.tips.length > 0 && (
                <div className="p-3 rounded-xl bg-navy-900/40 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    Gemini Retention & Pacing Tips:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {aiPlan.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const isDone = task.is_completed;
          const currentStatus = task.status || (isDone ? 'completed' : 'not_started');

          return (
            <div
              key={task.id}
              className={`p-5 rounded-2xl border transition-all ${isDone
                  ? 'bg-navy-900/20 border-slate-800/60 opacity-85'
                  : 'bg-navy-900/50 border-slate-800 hover:border-slate-700'
                }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left: Task Info */}
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleTask(task.id, isDone)}
                    className="mt-1 text-slate-500 hover:text-brand-cyan transition shrink-0"
                    title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 hover:text-brand-cyan" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-blue/20 text-blue-300 border border-blue-500/20">
                        Week {task.week_number}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {task.phase_name || `Phase ${task.phase_number}`}
                      </span>
                      <Badge variant={task.priority === 'High' ? 'danger' : 'secondary'}>
                        {task.priority} Priority
                      </Badge>
                      {task.deliverable && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 flex items-center gap-1">
                          <FolderGit2 className="w-3 h-3" />
                          <span>Artifact: {task.deliverable}</span>
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-semibold ${isDone ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      {task.description}
                    </p>

                    {/* Completion Criteria */}
                    <div className="text-[11px] text-slate-400 bg-navy-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <strong className="text-slate-300">Completion Milestone:</strong> {task.completion_criteria}
                    </div>

                    {/* Curated Free Online Resources */}
                    {task.resources && task.resources.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 font-semibold flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-cyan-400" />
                            Curated Free Online Materials:
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            100% Free • No Paywall
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {task.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700/80 hover:border-cyan-400 text-xs text-slate-200 hover:text-cyan-300 transition group"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              <span className="font-medium">{res.provider || res.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Monday - Sunday Daily Breakdown Ribbon */}
                    <div className="pt-2">
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 text-[10px] font-mono text-slate-400 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 text-center">
                        <div className="p-1 rounded bg-slate-900 border border-slate-800"><span className="text-cyan-400 font-bold block">Mon</span>LEARN</div>
                        <div className="p-1 rounded bg-slate-900 border border-slate-800"><span className="text-indigo-400 font-bold block">Tue</span>PRACTICE</div>
                        <div className="p-1 rounded bg-slate-900 border border-slate-800"><span className="text-amber-400 font-bold block">Wed</span>TEST</div>
                        <div className="p-1 rounded bg-slate-900 border border-slate-800"><span className="text-emerald-400 font-bold block">Thu</span>BUILD</div>
                        <div className="p-1 rounded bg-slate-900 border border-slate-800"><span className="text-purple-400 font-bold block">Fri</span>REVISE</div>
                        <div className="p-1 rounded bg-slate-900 border border-slate-800"><span className="text-sky-400 font-bold block">Sat</span>PREPARE</div>
                        <div className="p-1 rounded bg-slate-900 border border-slate-800"><span className="text-slate-400 font-bold block">Sun</span>REFLECT</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Status Selector, Complete Daily Activity & Logged Hours */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 block">Est: {task.estimated_hours}h</span>
                    {task.actual_hours_spent > 0 && (
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold block">
                        Logged: {task.actual_hours_spent}h
                      </span>
                    )}
                  </div>

                  {/* Daily Streak Activity Log Button */}
                  {!isDone && (
                    <button
                      type="button"
                      onClick={() => handleCompleteDailyActivity(task)}
                      disabled={completingTaskId === task.id}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{completingTaskId === task.id ? 'Logging...' : 'Log Activity (+50 XP)'}</span>
                    </button>
                  )}

                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-navy-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-brand-cyan"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleOpenEvidence(task)}
                    className={`text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${task.evidence_link
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-navy-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                      }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{task.evidence_link ? 'View Evidence' : 'Add Evidence'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adaptive Reschedule Modal */}
      <Modal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Adaptive Roadmap Rescheduling"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p>
            Adjust your weekly study commitment or target duration. RoadmapIQ will dynamically re-allocate remaining uncompleted tasks across future weeks while strictly preserving all completed tasks, timestamps, and logged evidence.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1">
                Available Study Hours Per Week
              </label>
              <input
                type="number"
                min="3"
                max="60"
                value={newWeeklyHours}
                onChange={(e) => setNewWeeklyHours(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-cyan"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Current: {activeRoadmap.weekly_hours} hrs/week</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1">
                Target Roadmap Duration (Total Weeks)
              </label>
              <input
                type="number"
                min="2"
                max="52"
                value={newWeeks}
                onChange={(e) => setNewWeeks(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-cyan"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Current: {activeRoadmap.target_duration_weeks} weeks</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setIsRescheduleOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteReschedule}
              disabled={isRescheduling}
              className="px-5 py-2 rounded-xl bg-brand-cyan text-navy-950 font-semibold hover:bg-cyan-300 transition disabled:opacity-50"
            >
              {isRescheduling ? 'Rescheduling...' : 'Apply Schedule'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Evidence & Hours Log Modal */}
      <Modal
        isOpen={!!evidenceModalTask}
        onClose={() => setEvidenceModalTask(null)}
        title="Log Hours & Attach Project Evidence"
      >
        {evidenceModalTask && (
          <div className="space-y-4 text-xs text-slate-300">
            <div>
              <span className="font-semibold text-white block mb-1">{evidenceModalTask.title}</span>
              <span className="text-slate-400 block">Deliverable: {evidenceModalTask.deliverable || 'Practical exercise completion'}</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1">
                Actual Hours Spent
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={loggedHoursInput}
                onChange={(e) => setLoggedHoursInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-cyan"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Estimated: {evidenceModalTask.estimated_hours} hours</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-200 mb-1">
                Evidence Link (GitHub, Google Docs, Notion, or live demo)
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-brand-cyan"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Attaching tangible links proves verified mastery.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setEvidenceModalTask(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 transition"
              >
                Close
              </button>
              <button
                onClick={handleSaveEvidence}
                className="px-5 py-2 rounded-xl bg-brand-cyan text-navy-950 font-semibold hover:bg-cyan-300 transition"
              >
                Save Progress
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WeeklyPlannerPage;

