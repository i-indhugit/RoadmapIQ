/**
 * PersonalLearningCalendar.jsx
 * Full-featured Personal Learning Calendar for My Growth tab.
 * Connects to backend /activities/students/{id}/calendar, /date/{date}, /analytics endpoints.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  Zap,
  Clock,
  BookOpen,
  Video,
  FileText,
  Code2,
  CheckCircle2,
  FolderGit2,
  ClipboardList,
  Map,
  RefreshCcw,
  Bot,
  Filter,
  TrendingUp,
  Target,
  Award,
  ArrowRight,
  X,
  Star,
  Activity,
  BarChart2,
  Layers,
} from 'lucide-react';
import { activitiesApi } from '../../services/api';

// ─── Category Configuration ───────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',          label: 'All',           icon: Layers,        color: 'slate',   bg: 'bg-slate-800',      text: 'text-slate-300',  border: 'border-slate-700',  dot: 'bg-slate-400' },
  { id: 'learning',     label: 'Learning',      icon: BookOpen,      color: 'cyan',    bg: 'bg-cyan-900/40',    text: 'text-cyan-300',   border: 'border-cyan-700/50',dot: 'bg-cyan-400' },
  { id: 'video_lesson', label: 'Video',         icon: Video,         color: 'blue',    bg: 'bg-blue-900/40',    text: 'text-blue-300',   border: 'border-blue-700/50',dot: 'bg-blue-400' },
  { id: 'study_note',   label: 'Study Notes',   icon: FileText,      color: 'indigo',  bg: 'bg-indigo-900/40',  text: 'text-indigo-300', border: 'border-indigo-700/50',dot: 'bg-indigo-400' },
  { id: 'practice',     label: 'Practice',      icon: Code2,         color: 'orange',  bg: 'bg-orange-900/40',  text: 'text-orange-300', border: 'border-orange-700/50',dot: 'bg-orange-400' },
  { id: 'quiz',         label: 'Quiz',          icon: CheckCircle2,  color: 'amber',   bg: 'bg-amber-900/40',   text: 'text-amber-300',  border: 'border-amber-700/50',dot: 'bg-amber-400' },
  { id: 'project',      label: 'Projects',      icon: FolderGit2,    color: 'purple',  bg: 'bg-purple-900/40',  text: 'text-purple-300', border: 'border-purple-700/50',dot: 'bg-purple-400' },
  { id: 'assessment',   label: 'Assessment',    icon: ClipboardList, color: 'rose',    bg: 'bg-rose-900/40',    text: 'text-rose-300',   border: 'border-rose-700/50',  dot: 'bg-rose-400' },
  { id: 'roadmap',      label: 'Roadmap',       icon: Map,           color: 'emerald', bg: 'bg-emerald-900/40', text: 'text-emerald-300',border: 'border-emerald-700/50',dot: 'bg-emerald-400' },
  { id: 'revision',     label: 'Revision',      icon: RefreshCcw,    color: 'teal',    bg: 'bg-teal-900/40',    text: 'text-teal-300',   border: 'border-teal-700/50',  dot: 'bg-teal-400' },
  { id: 'ai_learning',  label: 'AI Tutor',      icon: Bot,           color: 'violet',  bg: 'bg-violet-900/40',  text: 'text-violet-300', border: 'border-violet-700/50',dot: 'bg-violet-400' },
];

const getCategoryConfig = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

// ─── Intensity to Tailwind class mapping ──────────────────────────────────────
function intensityClass(level) {
  // level: 0-4
  switch (level) {
    case 1: return 'bg-cyan-900/70 hover:bg-cyan-800';
    case 2: return 'bg-cyan-700/80 hover:bg-cyan-600';
    case 3: return 'bg-cyan-500 hover:bg-cyan-400';
    case 4: return 'bg-teal-400 hover:bg-teal-300';
    default: return 'bg-slate-800/60 hover:bg-slate-700';
  }
}

// ─── Month/Day helpers ────────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getDaysInMonth(year, month) { return new Date(year, month, 0).getDate(); }
function getFirstDayOfWeek(year, month) { return new Date(year, month - 1, 1).getDay(); }
function padDate(n) { return String(n).padStart(2, '0'); }
function formatDateStr(year, month, day) { return `${year}-${padDate(month)}-${padDate(day)}`; }

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${padDate(d.getMonth()+1)}-${padDate(d.getDate())}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PersonalLearningCalendar({ profile }) {
  const profileId = profile?.id;
  const today = new Date();

  // ── State ──────────────────────────────────────────────────────────────────
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [selectedCat,  setSelectedCat]  = useState('all');

  const [calendarData,    setCalendarData]    = useState(null);
  const [dateActivities,  setDateActivities]  = useState(null);
  const [analyticsData,   setAnalyticsData]   = useState(null);
  const [streakData,      setStreakData]       = useState(null);

  const [loadingCal,  setLoadingCal]  = useState(false);
  const [loadingDay,  setLoadingDay]  = useState(false);
  const [loadingAna,  setLoadingAna]  = useState(false);
  const [weeklyGoalType,   setWeeklyGoalType]   = useState('days_per_week');
  const [weeklyGoalTarget, setWeeklyGoalTarget] = useState(5);
  const [savingGoal,       setSavingGoal]       = useState(false);
  const [goalSaved,        setGoalSaved]        = useState(false);

  // ── Calendar fetch ─────────────────────────────────────────────────────────
  const fetchCalendar = useCallback(() => {
    if (!profileId) return;
    setLoadingCal(true);
    activitiesApi.getCalendar(profileId, currentYear, currentMonth, selectedCat)
      .then((res) => setCalendarData(res.data))
      .catch(() => setCalendarData(null))
      .finally(() => setLoadingCal(false));
  }, [profileId, currentYear, currentMonth, selectedCat]);

  // ── Date activity fetch ───────────────────────────────────────────────────
  const fetchDateActivities = useCallback((dateStr) => {
    if (!profileId || !dateStr) return;
    setLoadingDay(true);
    activitiesApi.getDateActivities(profileId, dateStr, selectedCat)
      .then((res) => setDateActivities(res.data))
      .catch(() => setDateActivities(null))
      .finally(() => setLoadingDay(false));
  }, [profileId, selectedCat]);

  // ── Analytics fetch ───────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(() => {
    if (!profileId) return;
    setLoadingAna(true);
    activitiesApi.getAnalytics(profileId, 'monthly', currentYear, currentMonth)
      .then((res) => setAnalyticsData(res.data))
      .catch(() => setAnalyticsData(null))
      .finally(() => setLoadingAna(false));
  }, [profileId, currentYear, currentMonth]);

  // ── Streak fetch ──────────────────────────────────────────────────────────
  const fetchStreak = useCallback(() => {
    if (!profileId) return;
    activitiesApi.getStreakStatus(profileId)
      .then((res) => {
        setStreakData(res.data);
        if (res.data?.weekly_goal_type) setWeeklyGoalType(res.data.weekly_goal_type);
        if (res.data?.weekly_goal_target) setWeeklyGoalTarget(res.data.weekly_goal_target);
      })
      .catch(() => {});
  }, [profileId]);

  useEffect(() => { fetchCalendar(); fetchAnalytics(); }, [fetchCalendar, fetchAnalytics]);
  useEffect(() => { fetchStreak(); }, [fetchStreak]);
  useEffect(() => { fetchDateActivities(selectedDate); }, [fetchDateActivities, selectedDate]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goToPrevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const goToNextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };
  const goToToday = () => {
    const t = new Date();
    setCurrentYear(t.getFullYear());
    setCurrentMonth(t.getMonth() + 1);
    setSelectedDate(getTodayStr());
  };

  // ── Build calendar grid ───────────────────────────────────────────────────
  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay    = getFirstDayOfWeek(currentYear, currentMonth);
    // dayMap: { 'YYYY-MM-DD': { intensity, activities_count, hours, categories } }
    const dayMap = {};
    if (calendarData?.days) {
      calendarData.days.forEach((d) => { dayMap[d.date] = d; });
    }
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateStr(currentYear, currentMonth, day);
      cells.push({ day, dateStr, ...(dayMap[dateStr] || { intensity: 0, activities_count: 0, hours_spent: 0, categories: [] }) });
    }
    return cells;
  }, [currentYear, currentMonth, calendarData]);

  // ── Save weekly goal ──────────────────────────────────────────────────────
  const saveWeeklyGoal = async () => {
    if (!profileId) return;
    setSavingGoal(true);
    try {
      await activitiesApi.setWeeklyGoal(profileId, { goal_type: weeklyGoalType, target: weeklyGoalTarget });
      setGoalSaved(true);
      setTimeout(() => setGoalSaved(false), 2500);
    } catch {}
    setSavingGoal(false);
  };

  const todayStr    = getTodayStr();
  const currentStreak  = streakData?.current_daily_streak ?? 0;
  const longestStreak  = streakData?.longest_daily_streak ?? 0;
  const weeklyStreak   = streakData?.current_weekly_streak ?? 0;
  const nextMilestone  = streakData?.next_streak_milestone ?? null;
  const daysToMilestone = streakData?.days_to_milestone ?? null;
  const missedDays     = streakData?.missed_days ?? [];

  // ── Analytics shortcuts ───────────────────────────────────────────────────
  const ana = analyticsData || {};
  const totalDays   = ana.total_learning_days ?? 0;
  const totalHours  = ana.total_learning_hours ?? 0;
  const totalXP     = streakData?.current_xp ?? 0;
  const catDist     = ana.category_distribution || {};
  const topTopics   = ana.most_studied_topics   || [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Personal Learning Calendar</h2>
            <p className="text-xs text-slate-400">Your complete activity history, streaks &amp; analytics</p>
          </div>
        </div>

        {/* Streak pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
            <Flame className="w-5 h-5 text-amber-400" />
            <span className="text-lg font-extrabold text-amber-300">{currentStreak}</span>
            <span className="text-xs text-amber-400/70">day streak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="text-lg font-extrabold text-emerald-300">{weeklyStreak}</span>
            <span className="text-xs text-emerald-400/70">wk streak</span>
          </div>
        </div>
      </div>

      {/* ── MAIN TWO-COLUMN LAYOUT ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ══ LEFT: Calendar + Filters ══════════════════════════════════════ */}
        <div className="xl:col-span-2 space-y-4">

          {/* Category filter pills: Horizontal scroll on mobile, wrap on tablet/desktop */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all border shrink-0 ${
                    active
                      ? `${cat.bg} ${cat.text} ${cat.border}`
                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Calendar card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <button onClick={goToPrevMonth} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-white">
                  {MONTH_NAMES[currentMonth - 1]} {currentYear}
                </span>
                <button
                  onClick={goToToday}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                >
                  Today
                </button>
              </div>
              <button onClick={goToNextMonth} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1">
              {DAY_NAMES.map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            {loadingCal ? (
              <div className="text-center py-10 text-xs text-slate-500">Loading calendar…</div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {calendarGrid.map((cell, idx) => {
                  if (!cell) return <div key={`blank-${idx}`} />;
                  const isToday    = cell.dateStr === todayStr;
                  const isSelected = cell.dateStr === selectedDate;
                  const isFuture   = cell.dateStr > todayStr;
                  const activeCats = Array.isArray(cell.categories) ? cell.categories : [];
                  return (
                    <button
                      key={cell.dateStr}
                      onClick={() => !isFuture && setSelectedDate(cell.dateStr)}
                      disabled={isFuture}
                      title={`${cell.dateStr}: ${cell.activities_count || 0} activities · ${(cell.hours_spent || 0).toFixed(1)} hrs`}
                      className={`relative flex flex-col items-center justify-start pt-1 sm:pt-1.5 h-11 sm:h-14 rounded-lg transition-all border sm:border-2 text-[10px] sm:text-[11px] font-semibold
                        ${isSelected
                          ? 'border-cyan-400 bg-cyan-900/50 text-white scale-105 shadow-lg shadow-cyan-900/20'
                          : isToday
                          ? 'border-amber-400/60 text-amber-300'
                          : 'border-transparent text-slate-400 hover:border-slate-700'
                        }
                        ${isFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                        ${!isSelected && !isToday ? intensityClass(cell.intensity || 0) : ''}
                      `}
                    >
                      <span>{cell.day}</span>
                      {/* Category dots */}
                      {activeCats.length > 0 && (
                        <div className="flex gap-0.5 flex-wrap justify-center mt-1 max-w-[36px]">
                          {activeCats.slice(0, 3).map((catId) => {
                            const cfg = getCategoryConfig(catId);
                            return <span key={catId} className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />;
                          })}
                        </div>
                      )}
                      {/* Activity count badge */}
                      {(cell.activities_count || 0) > 0 && (
                        <span className="absolute top-0.5 right-0.5 text-[8px] font-mono text-slate-400">
                          {cell.activities_count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 pt-1 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Intensity:</span>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div key={level} className={`w-4 h-4 rounded-sm ${intensityClass(level)}`} />
                ))}
              </div>
              <span className="text-[10px] text-slate-500">None → High</span>
            </div>
          </div>

          {/* ── Monthly summary bar ────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Active Days',   value: totalDays,              icon: Calendar,  color: 'text-cyan-400' },
              { label: 'Study Hours',   value: totalHours.toFixed(1),  icon: Clock,     color: 'text-blue-400' },
              { label: 'Lessons Done',  value: ana.lessons_completed ?? 0, icon: BookOpen, color: 'text-emerald-400' },
              { label: 'Assessments',   value: ana.assessments_completed ?? 0, icon: ClipboardList, color: 'text-rose-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                <div className="text-xl font-extrabold text-white">{value}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ RIGHT: Streak + Day Detail ════════════════════════════════════ */}
        <div className="space-y-4">

          {/* ── Streak Card ────────────────────────────────────────────── */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Streak Status
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-amber-900/20 border border-amber-700/30 text-center">
                <div className="text-2xl font-extrabold text-amber-300">{currentStreak}</div>
                <div className="text-[10px] text-amber-400/70 mt-0.5">Current</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <div className="text-2xl font-extrabold text-slate-200">{longestStreak}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Longest</div>
              </div>
            </div>

            {nextMilestone && (
              <div className="p-3 rounded-xl bg-indigo-900/20 border border-indigo-700/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-300 font-semibold">Next Milestone</span>
                  <span className="text-xs font-bold text-white">{nextMilestone} days</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${Math.min(100, ((nextMilestone - (daysToMilestone ?? 0)) / nextMilestone) * 100)}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-slate-500">{daysToMilestone ?? 0} days to go</div>
              </div>
            )}

            {missedDays.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Recent Missed Days</div>
                <div className="flex flex-wrap gap-1.5">
                  {missedDays.slice(0, 8).map((d) => (
                    <span key={d} className="text-[10px] px-2 py-0.5 rounded bg-rose-900/30 border border-rose-700/30 text-rose-400 font-mono">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Weekly Goal ───────────────────────────────────────────── */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Weekly Goal
            </h3>

            {/* Weekly streak progress */}
            <div className="p-3 rounded-xl bg-emerald-900/20 border border-emerald-700/30 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-bold text-emerald-300">{weeklyStreak} Week Streak</div>
                <div className="text-[10px] text-emerald-400/60">Consecutive goal-achieved weeks</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold">Goal Type</label>
              <select
                value={weeklyGoalType}
                onChange={(e) => setWeeklyGoalType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="days_per_week">Days per week</option>
                <option value="activities_per_week">Activities per week</option>
                <option value="hours_per_week">Hours per week</option>
                <option value="milestones_per_week">Milestones per week</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold">Target</label>
              <input
                type="number"
                min={1}
                max={weeklyGoalType === 'hours_per_week' ? 40 : 50}
                value={weeklyGoalTarget}
                onChange={(e) => setWeeklyGoalTarget(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              onClick={saveWeeklyGoal}
              disabled={savingGoal}
              className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {savingGoal ? 'Saving…' : goalSaved ? '✓ Saved!' : 'Save Weekly Goal'}
            </button>
          </div>

          {/* ── Category Breakdown ───────────────────────────────────── */}
          {Object.keys(catDist).length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-purple-400" />
                Activity by Category
              </h3>
              <div className="space-y-2">
                {Object.entries(catDist)
                  .sort(([, a], [, b]) => b - a)
                  .map(([catId, count]) => {
                    const cfg = getCategoryConfig(catId);
                    const max = Math.max(...Object.values(catDist));
                    const pct = max > 0 ? (count / max) * 100 : 0;
                    const Icon = cfg.icon;
                    return (
                      <div key={catId} className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${cfg.text}`} />
                        <div className="flex-1">
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span className={`font-semibold ${cfg.text}`}>{cfg.label}</span>
                            <span className="text-slate-500">{count}</span>
                          </div>
                          <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${cfg.dot} transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SELECTED DATE DETAIL PANEL ────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              {selectedDate === todayStr ? "Today's Activities" : `Activities on ${selectedDate}`}
            </h3>
          </div>
          {dateActivities?.summary && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {dateActivities.summary.total_xp ?? 0} XP
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {((dateActivities.summary.total_hours ?? 0)).toFixed(1)} hrs
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                {dateActivities.summary.total_activities ?? 0} activities
              </span>
            </div>
          )}
        </div>

        {loadingDay ? (
          <div className="text-center py-8 text-xs text-slate-500">Loading activities…</div>
        ) : !dateActivities?.activities?.length ? (
          <div className="text-center py-10 space-y-2">
            <Calendar className="w-8 h-8 text-slate-700 mx-auto" />
            <p className="text-xs text-slate-500">No activities recorded on this date yet.</p>
            <p className="text-[10px] text-slate-600">Complete a lesson, quiz, or project to log your first activity.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dateActivities.activities.map((act, i) => {
              const cfg = getCategoryConfig(act.category);
              const Icon = cfg.icon;
              return (
                <div
                  key={act.id ?? i}
                  className={`p-4 rounded-xl border ${cfg.border} ${cfg.bg} flex items-start gap-3`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-900/50 border ${cfg.border}`}>
                    <Icon className={`w-4 h-4 ${cfg.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">{act.title || act.activity_type}</span>
                      <span className={`shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[10px] text-slate-500">
                      {act.xp_earned > 0 && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Zap className="w-2.5 h-2.5" />{act.xp_earned} XP
                        </span>
                      )}
                      {act.duration_minutes > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />{act.duration_minutes}m
                        </span>
                      )}
                      {act.score != null && act.score_total != null && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Star className="w-2.5 h-2.5" />{act.score}/{act.score_total}
                        </span>
                      )}
                      {act.created_at && (
                        <span className="text-slate-600 font-mono">
                          {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {act.action_url && (
                      <a
                        href={act.action_url}
                        className={`mt-2 inline-flex items-center gap-1 text-[10px] font-semibold ${cfg.text} hover:underline`}
                      >
                        View <ArrowRight className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TOP TOPICS ─────────────────────────────────────────────────────── */}
      {topTopics.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            Most Studied Topics This Month
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topTopics.slice(0, 6).map((t, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-900/30 border border-teal-700/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-teal-300">#{i + 1}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{t.title}</div>
                  <div className="text-[10px] text-slate-500">
                    {t.count} session{t.count !== 1 ? 's' : ''} · {(t.hours || 0).toFixed(1)} hrs
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

