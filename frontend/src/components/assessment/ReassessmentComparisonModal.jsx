import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  X,
  Scale,
  RotateCcw,
} from 'lucide-react';
import { careerAssessmentApi } from '../../services/api';
import Badge from '../common/Badge';

export default function ReassessmentComparisonModal({
  isOpen,
  onClose,
  currentAttemptId,
  previousAttemptId,
  careerTitle,
}) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !currentAttemptId || !previousAttemptId) return;
    setLoading(true);
    setError(null);
    careerAssessmentApi
      .compareAttempts(currentAttemptId, previousAttemptId)
      .then((data) => {
        setComparison(data);
      })
      .catch((err) => {
        setError(err.message || 'Could not fetch assessment comparison.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, currentAttemptId, previousAttemptId]);

  if (!isOpen) return null;

  const scoreDiff = comparison?.score_difference ?? 0;
  const isPositive = scoreDiff >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Reassessment Delta & Growth Audit</h3>
              <p className="text-xs text-slate-400 font-mono">{careerTitle || 'Target Career'} Progress</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="py-12 text-center space-y-3 font-mono text-xs text-slate-400 animate-pulse">
              <div className="w-10 h-10 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <p>Analyzing skill deltas and progression across attempts...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {comparison && !loading && (
            <div className="space-y-6">
              {/* Top Delta Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Score Difference */}
                <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Score Delta</span>
                    <span
                      className={`text-2xl font-bold font-mono mt-1 block flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                    >
                      {isPositive ? <TrendingUp className="w-5 h-5 inline" /> : <TrendingDown className="w-5 h-5 inline" />}
                      {isPositive ? `+${scoreDiff}%` : `${scoreDiff}%`}
                    </span>
                  </div>
                  <Badge variant={isPositive ? 'success' : 'red'} size="xs">
                    {isPositive ? 'Progressing' : 'Needs Review'}
                  </Badge>
                </div>

                {/* Readiness Difference */}
                <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Readiness Delta</span>
                    <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">
                      {comparison.readiness_difference >= 0 ? `+${comparison.readiness_difference}%` : `${comparison.readiness_difference}%`}
                    </span>
                  </div>
                  <Badge variant="primary" size="xs">Readiness</Badge>
                </div>
              </div>

              {/* Overall Verdict */}
              {comparison.overall_verdict && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Evaluation Verdict</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {comparison.overall_verdict}
                  </p>
                </div>
              )}

              {/* Improved Skills */}
              {comparison.improved_skills?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Demonstrated Skill Growth ({comparison.improved_skills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {comparison.improved_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Remaining Skill Gaps */}
              {comparison.stagnant_skills?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Skills Requiring Additional Reinforcement ({comparison.stagnant_skills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {comparison.stagnant_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono"
                      >
                        • {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end bg-slate-950/50">
          <button
            onClick={onClose}
            className="btn-primary text-xs py-2 px-5"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}

