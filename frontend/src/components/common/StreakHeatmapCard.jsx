import React, { useState, useEffect } from 'react';
import {
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import { activitiesApi } from '../../services/api';
import Badge from './Badge';

export default function StreakHeatmapCard({ profileId, onActivityCompleted }) {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [targetType, setTargetType] = useState('days_per_week');
  const [targetValue, setTargetValue] = useState(5);
  const [savingGoal, setSavingGoal] = useState(false);

  const fetchStreak = async () => {
    if (!profileId) return;
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const data = await activitiesApi.getStreakStatus(profileId, userTimezone);
      setStreakData(data);
      if (data?.weekly_goal) {
        setTargetType(data.weekly_goal.target_type || 'days_per_week');
        setTargetValue(data.weekly_goal.target_value || 5);
      }
    } catch (err) {
      console.warn('Could not fetch streak data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, [profileId]);

  const handleSaveGoal = async () => {
    if (!profileId) return;
    setSavingGoal(true);
    try {
      await activitiesApi.setWeeklyGoal(profileId, {
        target_type: targetType,
        target_value: Number(targetValue),
      });
      await fetchStreak();
      setShowGoalModal(false);
    } catch (err) {
      console.error('Failed to save weekly goal:', err);
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading || !streakData) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/4" />
        <div className="h-24 bg-slate-800 rounded w-full" />
      </div>
    );
  }

  const {
    current_daily_streak = 0,
    longest_daily_streak = 0,
    activity_completed_today = false,
    current_weekly_streak = 0,
    longest_weekly_streak = 0,
    weekly_goal,
    recent_activity_map = {},
    streak_freeze_available = true,
  } = streakData;

  // Build 60-day visual cells
  const days = [];
  const today = new Date();
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = recent_activity_map[dateStr] || 0;
    days.push({
      date: dateStr,
      count,
      isToday: i === 0,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
    });
  }

  const weeklyTarget = weekly_goal?.target_value || 5;
  const weeklyCurrent = weekly_goal?.current_progress || 0;
  const weeklyPct = Math.min(100, Math.round((weeklyCurrent / weeklyTarget) * 100));

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-6">
      {/* Header with Streaks */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <Flame className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Daily & Weekly Learning Streaks</h3>
              {activity_completed_today ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Today Completed
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Ready for Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified daily learning increases your streak once every 24 hours.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowGoalModal(true)}
          className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto flex items-center gap-1.5"
        >
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          <span>Set Weekly Goal</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Daily Streak */}
        <div className="p-4 rounded-2xl bg-slate-850/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Daily Streak</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {current_daily_streak} <span className="text-xs text-slate-400 font-normal">days</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Best: {longest_daily_streak} days
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              {current_daily_streak > 0 ? 'Active 🔥' : 'Start Today'}
            </span>
          </div>
        </div>

        {/* Weekly Streak */}
        <div className="p-4 rounded-2xl bg-slate-850/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Weekly Streak</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {current_weekly_streak} <span className="text-xs text-slate-400 font-normal">weeks</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Best: {longest_weekly_streak} weeks
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">
              Target: {weeklyTarget}d/wk
            </span>
          </div>
        </div>

        {/* Weekly Goal Progress */}
        <div className="p-4 rounded-2xl bg-slate-850/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>This Week's Goal</span>
            </span>
            <span className="font-bold text-white">
              {weeklyCurrent} / {weeklyTarget} {weekly_goal?.target_type === 'hours_per_week' ? 'hrs' : 'days'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${weeklyPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{weeklyPct}% achieved</span>
            <span className={weeklyPct >= 100 ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
              {weeklyPct >= 100 ? 'Goal Met! 🎉' : `${weeklyTarget - weeklyCurrent} left`}
            </span>
          </div>
        </div>
      </div>

      {/* 60-Day Activity Heatmap Calendar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>60-Day Activity Calendar</span>
          </span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-800" />
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-900/60" />
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-600" />
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid (10 columns x 6 rows) */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div className="grid grid-cols-12 sm:grid-cols-20 gap-1.5">
            {days.map((day) => {
              let bgClass = 'bg-slate-800/60 border-slate-800';
              if (day.count === 1) bgClass = 'bg-cyan-900/70 border-cyan-800 text-cyan-200';
              else if (day.count === 2) bgClass = 'bg-cyan-600 border-cyan-500 text-white';
              else if (day.count >= 3) bgClass = 'bg-cyan-400 border-cyan-300 shadow-sm shadow-cyan-400 text-slate-950 font-bold';

              return (
                <div
                  key={day.date}
                  title={`${day.date} (${day.dayName}): ${day.count} activity completed`}
                  className={`aspect-square rounded-md border text-[9px] flex items-center justify-center transition-transform hover:scale-125 cursor-pointer ${bgClass} ${
                    day.isToday ? 'ring-1 ring-amber-400' : ''
                  }`}
                >
                  {day.count > 0 ? day.count : ''}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Goal Setting Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Configure Weekly Learning Target</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Your weekly streak increments when you hit your target each week.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5">Target Metric</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('days_per_week');
                      setTargetValue(5);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                      targetType === 'days_per_week'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Days Per Week
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('hours_per_week');
                      setTargetValue(10);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                      targetType === 'hours_per_week'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Hours Per Week
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5">
                  Target Value ({targetType === 'days_per_week' ? '1 to 7 days' : '5 to 40 hours'})
                </label>
                <input
                  type="number"
                  min={targetType === 'days_per_week' ? 1 : 2}
                  max={targetType === 'days_per_week' ? 7 : 40}
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="glass-input w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="btn-secondary text-xs py-2 px-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGoal}
                disabled={savingGoal}
                className="btn-primary text-xs py-2 px-4"
              >
                {savingGoal ? 'Saving...' : 'Save Goal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

