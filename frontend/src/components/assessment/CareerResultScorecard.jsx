import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  BarChart2,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Check,
  Terminal,
  Cpu,
  Server,
  Cloud,
  Bot,
  Table,
  Zap,
  Globe,
  CheckSquare,
  Scale,
} from 'lucide-react';
import ReassessmentComparisonModal from './ReassessmentComparisonModal';

const PROFICIENCY_CONFIG = {
  Beginner: {
    label: 'Beginner (0–39%)',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    description: 'Foundational concepts require structured reinforcement before advancing to production workloads.',
  },
  Developing: {
    label: 'Developing (40–59%)',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    description: 'Basic working knowledge demonstrated with key gaps in practical syntax and execution patterns.',
  },
  Intermediate: {
    label: 'Intermediate (60–79%)',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    description: 'Solid conceptual understanding and good problem-solving ability in core industry standards.',
  },
  Advanced: {
    label: 'Advanced (80–100%)',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description: 'Mastery over core principles, ready for complex production and system design work.',
  },
};

export const CareerResultScorecard = ({
  evaluationResult,
  environment,
  career,
  onRetake,
  onProceedToGapAnalysis,
  attemptId,
  previousAttemptId,
}) => {
  const [questionFilter, setQuestionFilter] = useState('all'); // 'all' | 'correct' | 'incorrect'
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const theme = environment?.theme || {};
  const layoutType = environment?.layoutType || 'ide';

  // Filter questions
  const filteredQuestions = (evaluationResult?.question_details || []).filter((q) => {
    if (questionFilter === 'correct') return q.is_correct;
    if (questionFilter === 'incorrect') return !q.is_correct;
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Career-Specific Evaluation Banner */}
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
                {environment.resultTitle}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Environment: <strong className="text-white">{environment.environmentName}</strong>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <span>Proficiency:</span>
              <span
                className={`px-3 py-1 rounded-xl text-base sm:text-lg border ${
                  PROFICIENCY_CONFIG[evaluationResult.proficiency_level]?.badgeClass || 'bg-cyan-500/20 text-cyan-300'
                }`}
              >
                {evaluationResult.proficiency_level}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {environment.resultSubtitle}
            </p>
          </div>

          {/* Overall Score Gauge & Metrics Grid */}
          <div className="flex items-center gap-6 p-5 rounded-2xl bg-navy-950/80 border border-slate-800 shrink-0">
            <div className="text-center">
              <div
                className="text-4xl font-extrabold font-mono"
                style={{ color: theme.primary || '#00f0ff' }}
              >
                {evaluationResult.score_percentage}%
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">Verification Score</div>
            </div>

            <div className="w-px h-12 bg-slate-800" />

            <div className="space-y-1 text-xs font-mono">
              <div className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span><strong>{evaluationResult.correct_count}</strong> / {evaluationResult.total_questions} Correct</span>
              </div>
              <div className="text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                <span><strong>{evaluationResult.incorrect_count}</strong> Incorrect</span>
              </div>
              <div className="text-slate-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                <span><strong>{evaluationResult.total_marks_earned}</strong> / {evaluationResult.total_possible_marks} Pts Earned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Career-Specific Performance Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          {/* Category-wise Breakdown */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4" />
              <span>Competency Category Breakdown</span>
            </div>
            <div className="space-y-2.5">
              {Object.entries(evaluationResult.category_scores || {}).map(([cat, score]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">{cat}</span>
                    <span className="font-bold text-white">
                      {score.percentage}% ({score.correct}/{score.total})
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score.percentage >= 80 ? 'bg-emerald-400' : score.percentage >= 60 ? 'bg-cyan-400' : score.percentage >= 40 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${score.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>Rigor Level Performance</span>
            </div>
            <div className="space-y-2.5">
              {Object.entries(evaluationResult.difficulty_scores || {}).map(([diff, score]) => (
                <div key={diff} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 capitalize">{diff}</span>
                    <span className="font-bold text-white">
                      {score.percentage}% ({score.correct}/{score.total})
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score.percentage >= 80 ? 'bg-emerald-400' : score.percentage >= 60 ? 'bg-cyan-400' : score.percentage >= 40 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${score.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onRetake}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-navy-900 border border-slate-700 text-slate-300 hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake in {environment.environmentName}</span>
            </button>

            {previousAttemptId && (
              <button
                onClick={() => setShowComparisonModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:text-white transition"
              >
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>Compare with Previous Test</span>
              </button>
            )}
          </div>

          <button
            onClick={onProceedToGapAnalysis}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 text-navy-950 hover:bg-cyan-300 transition shadow-glow"
          >
            <span>Proceed to Skill Gap Analysis</span>
            <ArrowRight className="w-4 h-4 font-bold" />
          </button>
        </div>
      </div>

      {/* 2. Detailed Question Review Accordion */}
      <div className="glass-panel p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Assessment Item Review & Conceptual Explanations</h3>
            <p className="text-xs text-slate-400">
              Review conceptual takeaways calibrated for {career?.title}.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: `All (${evaluationResult.total_questions})` },
              { id: 'correct', label: `Correct (${evaluationResult.correct_count})` },
              { id: 'incorrect', label: `Incorrect (${evaluationResult.incorrect_count})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setQuestionFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition ${
                  questionFilter === f.id
                    ? 'bg-cyan-500 text-navy-950 font-bold'
                    : 'bg-navy-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Cards */}
        <div className="space-y-3">
          {filteredQuestions.map((q) => {
            const isExpanded = expandedQuestionId === q.question_id;
            return (
              <div
                key={q.question_id}
                className={`rounded-2xl border transition-all ${
                  q.is_correct
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                <div
                  onClick={() => setExpandedQuestionId(isExpanded ? null : q.question_id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    {q.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                        <span>Q{q.question_index + 1}</span>
                        <span>•</span>
                        <span>{q.category}</span>
                        <span>•</span>
                        <span className="capitalize">{q.difficulty}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-0.5">{q.question}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                        q.is_correct ? 'text-emerald-300 bg-emerald-500/15' : 'text-rose-300 bg-rose-500/15'
                      }`}
                    >
                      {q.is_correct ? `+${q.marks_earned} pts` : '0 pts'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-3 text-xs">
                    <div className="space-y-1.5 pt-3">
                      {q.options.map((opt, oIdx) => {
                        const isUserChoice = q.candidate_answer_index === oIdx;
                        const isCorrectChoice = q.correct_answer_index === oIdx;

                        let optClass = 'bg-navy-950/60 border-slate-800 text-slate-400';
                        if (isCorrectChoice) {
                          optClass = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 font-semibold';
                        } else if (isUserChoice && !q.is_correct) {
                          optClass = 'bg-rose-950/60 border-rose-500/60 text-rose-200';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${optClass}`}
                          >
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {isCorrectChoice && (
                              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                                <Check className="w-3 h-3" /> Correct Choice
                              </span>
                            )}
                            {isUserChoice && !isCorrectChoice && (
                              <span className="text-[10px] font-mono text-rose-400">Your Selection</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1 font-mono">
                      <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Conceptual Takeaway:
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Modal */}
      <ReassessmentComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        currentAttemptId={attemptId}
        previousAttemptId={previousAttemptId}
        careerTitle={career?.title}
      />
    </div>
  );
};

export default CareerResultScorecard;

