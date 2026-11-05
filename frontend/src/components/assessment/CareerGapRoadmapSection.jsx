import React, { useState } from 'react';
import {
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Sparkles,
  BookOpen,
  Compass,
  ArrowRight,
  ArrowLeft,
  Clock,
  Calendar,
} from 'lucide-react';

export const CareerGapRoadmapSection = ({
  gapReport,
  environment,
  career,
  roadmapWeeklyHours,
  setRoadmapWeeklyHours,
  roadmapDurationWeeks,
  setRoadmapDurationWeeks,
  isGeneratingRoadmap,
  onGenerateRoadmap,
  onBackToResults,
}) => {
  const theme = environment?.theme || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Readiness & Gap Overview Banner */}
      <div
        className="p-6 sm:p-8 rounded-3xl border backdrop-blur-xl space-y-6"
        style={{
          backgroundColor: theme.cardBg || 'rgba(12, 18, 36, 0.94)',
          borderColor: theme.cardBorder || 'rgba(0, 240, 255, 0.35)',
          boxShadow: `0 14px 40px -8px ${theme.glow || 'rgba(0, 240, 255, 0.25)'}`,
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border"
                style={{
                  backgroundColor: theme.badgeBg || 'rgba(0, 240, 255, 0.12)',
                  borderColor: theme.badgeBorder || 'rgba(0, 240, 255, 0.35)',
                  color: theme.badgeText || '#00f0ff',
                }}
              >
                {environment.environmentName} Readiness Index
              </span>
              <span className="text-xs font-mono text-slate-400">
                Track: <strong className="text-white">{gapReport.role_title}</strong>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Personalized Skill Gap & Readiness Analysis
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Calculated based on your verified performance in {environment.environmentName}, penalized for foundational deficits in core prerequisite competencies.
            </p>
          </div>

          {/* Readiness Meter Gauge */}
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-navy-950/80 border border-slate-800 shrink-0">
            <div className="text-center">
              <div
                className="text-4xl font-extrabold font-mono"
                style={{ color: theme.primary || '#00f0ff' }}
              >
                {gapReport.readiness_score}%
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">Career Readiness</div>
            </div>

            <div className="w-px h-12 bg-slate-800" />

            <div className="space-y-1 text-xs font-mono">
              <div className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span><strong>{gapReport.strong_skills?.length || 0}</strong> Strong Skills</span>
              </div>
              <div className="text-amber-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span><strong>{gapReport.needs_improvement_skills?.length || 0}</strong> Needs Focus</span>
              </div>
              <div className="text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span><strong>{gapReport.critical_gaps?.length || 0}</strong> Critical Gaps</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Categorized Skill Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          {/* Strong Skills */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Strong Skills ({gapReport.strong_skills?.length || 0})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(gapReport.strong_skills || []).map((s, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-300 font-medium">
                  {s}
                </span>
              ))}
              {(gapReport.strong_skills || []).length === 0 && (
                <span className="text-[11px] text-slate-400 italic">None yet</span>
              )}
            </div>
          </div>

          {/* Needs Improvement */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
              <TrendingUp className="w-4 h-4" />
              <span>Needs Improvement ({gapReport.needs_improvement_skills?.length || 0})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(gapReport.needs_improvement_skills || []).map((s, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/40 text-[11px] text-amber-300 font-medium">
                  {s}
                </span>
              ))}
              {(gapReport.needs_improvement_skills || []).length === 0 && (
                <span className="text-[11px] text-slate-400 italic">None</span>
              )}
            </div>
          </div>

          {/* Critical Gaps */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Critical Gaps ({gapReport.critical_gaps?.length || 0})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(gapReport.critical_gaps || []).map((s, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-300 font-bold">
                  {s}
                </span>
              ))}
              {(gapReport.critical_gaps || []).length === 0 && (
                <span className="text-[11px] text-slate-400 italic">Zero critical gaps</span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="p-4 rounded-xl bg-navy-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
              <HelpCircle className="w-4 h-4" />
              <span>Missing / Uncovered ({gapReport.missing_skills?.length || 0})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(gapReport.missing_skills || []).map((s, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-navy-900 border border-slate-700 text-[11px] text-slate-300">
                  {s}
                </span>
              ))}
              {(gapReport.missing_skills || []).length === 0 && (
                <span className="text-[11px] text-slate-400 italic">None</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Detailed Skill Gap Comparison Table */}
      <div className="glass-panel p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <span>Curriculum Competency Comparison Matrix</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {gapReport.skills_table?.length || 0} Competencies Analyzed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Skill</th>
                <th className="py-3 px-4 font-semibold">Required Level</th>
                <th className="py-3 px-4 font-semibold">Assessed Level</th>
                <th className="py-3 px-4 font-semibold">Gap Level</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Roadmap Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(gapReport.skills_table || []).map((item, idx) => {
                let statusBadge = 'bg-slate-800 text-slate-300';
                if (item.gap_status === 'Strong') {
                  statusBadge = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
                } else if (item.gap_status === 'Needs Improvement') {
                  statusBadge = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
                } else if (item.gap_status === 'Critical Gap') {
                  statusBadge = 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold';
                }

                return (
                  <tr key={idx} className="hover:bg-navy-900/40 transition">
                    <td className="py-3 px-4 font-semibold text-white">{item.skill_name}</td>
                    <td className="py-3 px-4 text-slate-300">{item.required_level}</td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          item.assessed_level === 'Advanced'
                            ? 'text-emerald-400 font-bold'
                            : item.assessed_level === 'Intermediate'
                            ? 'text-cyan-400'
                            : item.assessed_level === 'Developing'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }
                      >
                        {item.assessed_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{item.gap_level}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${statusBadge}`}>
                        {item.gap_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          item.priority === 1
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : item.priority === 2
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-navy-900 text-slate-400'
                        }`}
                      >
                        P{item.priority}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. AI Gap Explanation & Recommended Topics */}
      {gapReport.ai_gap_explanation && (
        <div className="glass-panel p-6 sm:p-8 space-y-4 border-l-4 border-l-cyan-400">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Skill Gap Explanation & Recommended Focus Topics</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {gapReport.ai_gap_explanation}
          </p>

          {(gapReport.ai_learning_topics || []).length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono text-slate-400">Recommended Next Steps:</div>
              <div className="flex flex-wrap gap-2">
                {gapReport.ai_learning_topics.map((topic, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-3 py-1 rounded-xl bg-navy-950 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{topic}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Personalized Roadmap Generation Action Card */}
      <div
        className="p-6 sm:p-8 rounded-3xl border space-y-6"
        style={{
          backgroundColor: theme.cardBg || 'rgba(12, 18, 36, 0.94)',
          borderColor: theme.cardBorder || 'rgba(0, 240, 255, 0.35)',
          boxShadow: `0 14px 40px -8px ${theme.glow || 'rgba(0, 240, 255, 0.25)'}`,
        }}
      >
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>Generate Personalized {career?.title} Roadmap</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            Your roadmap automatically calibrates to your {environment.environmentName} assessment. Mastered competencies skip beginner repetition, while identified critical gaps are prioritized in early sprints.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Weekly Study Hours</span>
            </label>
            <input
              type="number"
              min="5"
              max="40"
              value={roadmapWeeklyHours}
              onChange={(e) => setRoadmapWeeklyHours(Math.max(5, parseInt(e.target.value) || 15))}
              className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Duration (Weeks)</span>
            </label>
            <input
              type="number"
              min="4"
              max="24"
              value={roadmapDurationWeeks}
              onChange={(e) => setRoadmapDurationWeeks(Math.max(4, parseInt(e.target.value) || 12))}
              className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            onClick={onBackToResults}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-navy-900 border border-slate-700 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Assessment Evaluation</span>
          </button>

          <button
            onClick={onGenerateRoadmap}
            disabled={isGeneratingRoadmap}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-extrabold bg-cyan-400 text-navy-950 hover:bg-cyan-300 transition shadow-glow disabled:opacity-50"
          >
            <span>{isGeneratingRoadmap ? 'Generating Tailored Roadmap...' : 'Generate Personalized Roadmap'}</span>
            <ArrowRight className="w-4 h-4 font-bold" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerGapRoadmapSection;

