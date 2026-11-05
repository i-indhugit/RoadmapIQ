import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { aiApi } from '../services/api';
import {
  CalendarCheck2,
  TrendingUp,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Layers,
  Loader2,
} from 'lucide-react';
import Badge from '../components/common/Badge';

export default function WeeklyReviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeRole, activeRoadmap, activeRoadmapProgress, profile, addToast, triggerCelebration } = useApp();

  const activeTab = searchParams.get('tab') || 'performance';

  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [nextWeekPlan, setNextWeekPlan] = useState(null);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const tasks = activeRoadmap?.tasks || [];
  const completedTasks = tasks.filter((t) => t.is_completed);
  const completionPct = activeRoadmapProgress?.completion_percentage || 0;
  const hoursCompleted = activeRoadmapProgress?.completed_hours || 0;

  const handleGenerateNextWeekPlan = async () => {
    setGeneratingPlan(true);
    try {
      const skillsInFocus = tasks.filter((t) => !t.is_completed).slice(0, 4).map((t) => t.title);
      const res = await aiApi.generateWeeklyPlan({
        role_title: activeRole?.title || activeRoadmap?.role_title || 'Software Engineer',
        target_skills: skillsInFocus.length > 0 ? skillsInFocus : ['Core Systems', 'Production Practices'],
        weekly_hours: activeRoadmap?.weekly_hours || 15,
        week_number: 2,
        focus_topic: 'Adaptive Pacing & Weak Skill Revision',
      });
      setNextWeekPlan(res);
      triggerCelebration();
      addToast('success', 'Generated adaptive Next Week Plan with Gemini AI!', 'AI Planner');
    } catch (err) {
      addToast('error', err.message || 'Could not generate plan.', 'AI Error');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const TABS = [
    { id: 'performance', label: 'Performance Review', icon: TrendingUp },
    { id: 'assessment', label: 'Weekly Assessment', icon: Award },
    { id: 'revision', label: 'Weak Skill Revision', icon: RotateCcw },
    { id: 'next-plan', label: 'Next Week Plan', icon: CalendarCheck2 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Weekly Reflection & Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Weekly Performance & Progress Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Evaluate your weekly execution velocity, revise weak areas, and generate an adaptive schedule.
          </p>
        </div>

        <button
          onClick={() => {
            setTab('next-plan');
            handleGenerateNextWeekPlan();
          }}
          disabled={generatingPlan}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generatingPlan ? 'Generating...' : 'Generate Next Week Plan'}</span>
        </button>
      </div>

      {/* Progressive Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. PERFORMANCE REVIEW TAB */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Completed Tasks</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                {completedTasks.length} / {tasks.length}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">{completionPct}% curriculum complete</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Hours Dedicated</span>
              <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">
                {hoursCompleted} hrs
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Target: {activeRoadmap?.weekly_hours || 15} hrs/wk</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Velocity Status</span>
              <span className="text-2xl font-bold font-mono text-indigo-400 mt-1 block">
                {hoursCompleted >= (activeRoadmap?.weekly_hours || 15) ? 'On Track 🎉' : 'Pacing Well'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Consistent weekly cadence</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Weekly Milestone Completion Summary</span>
            </h3>
            <div className="space-y-2">
              {completedTasks.slice(0, 5).map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Week {t.week_number}</span>
                </div>
              ))}
              {completedTasks.length === 0 && (
                <p className="text-xs text-slate-400 py-3">No tasks marked as completed yet this week. Open Weekly Planner to check off finished tasks.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. WEEKLY ASSESSMENT TAB */}
      {activeTab === 'assessment' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  <span>End-of-Week Knowledge Diagnostic</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm weekly retention and demonstrate mastery over newly introduced concepts.
                </p>
              </div>
              <button
                onClick={() => navigate('/journey?tab=roadmap')}
                className="btn-primary text-xs py-2 px-4"
              >
                Continue Roadmap Journey
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-mono text-cyan-300 font-semibold block">Weekly Diagnostic Protocol:</span>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li>10 to 25 adaptive questions calibrated to your target career.</li>
                <li>Evaluates conceptual foundations, syntax mechanics, and architecture trade-offs.</li>
                <li>Updates your placement readiness score in real time upon submission.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. WEAK SKILL REVISION TAB */}
      {activeTab === 'revision' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-purple-400" />
              <span>Targeted Skill Gaps Requiring Revision</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { skill: 'Asynchronous Event Mechanics', reason: 'High error rate in recent quiz on promises and thread loops.', action: 'Review MDN Async guide' },
                { skill: 'Relational Schema Normalization', reason: 'Assessed at Level 1, role standard requires Level 3.', action: 'Practice 3 SQL Joins drills' },
                { skill: 'Input Sanitization & Security', reason: 'Missing parameter validation in mini-project submission.', action: 'Review OWASP injection guide' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.skill}</span>
                    <Badge variant="danger" size="xs">Needs Revision</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.reason}</p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-cyan-400 flex items-center justify-between">
                    <span>Action: {item.action}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. NEXT WEEK PLAN TAB */}
      {activeTab === 'next-plan' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CalendarCheck2 className="w-5 h-5 text-cyan-400" />
                  <span>Adaptive Study Schedule for Next Week</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dynamically adjusted by Google Gemini AI based on your pacing and weak skill areas.
                </p>
              </div>
              <button
                onClick={handleGenerateNextWeekPlan}
                disabled={generatingPlan}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                {generatingPlan && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{generatingPlan ? 'Generating...' : 'Refresh Adaptive Schedule'}</span>
              </button>
            </div>

            {nextWeekPlan ? (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-200">
                  {nextWeekPlan.focus_summary || 'Adaptive week itinerary prioritizing weak skills.'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(nextWeekPlan.day_plans || []).map((day, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-white">
                        <span className="text-cyan-400 font-mono">{day.day}</span>
                        <span className="text-[10px] font-mono text-slate-400">{day.hours}h</span>
                      </div>
                      <div className="text-xs font-medium text-slate-200">{day.focus}</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{day.activity}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Click "Generate Next Week Plan" to prompt Google Gemini for an adaptive day-by-day plan.</p>
                <button
                  onClick={handleGenerateNextWeekPlan}
                  disabled={generatingPlan}
                  className="btn-primary text-xs py-2 px-4 inline-flex"
                >
                  Generate Plan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

