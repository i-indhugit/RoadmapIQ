import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  ShieldAlert,
  Zap,
  Globe,
  Database,
  BarChart2,
  Bot,
  Cloud,
  CheckSquare,
} from 'lucide-react';
import Badge from '../common/Badge';

export const CareerEntryTransition = ({
  career,
  environment,
  onStartAssessment,
  onBack,
  isLoading,
}) => {
  const [bootStep, setBootStep] = useState(0);

  // Assessment Configuration state
  const [questionCount, setQuestionCount] = useState(25);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [durationMins, setDurationMins] = useState(30);

  // Quick 3-stage lightweight entry transition (1.2s total)
  useEffect(() => {
    const timer1 = setTimeout(() => setBootStep(1), 300);
    const timer2 = setTimeout(() => setBootStep(2), 700);
    const timer3 = setTimeout(() => setBootStep(3), 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [career?.id]);

  const theme = environment?.theme || {};

  const handleStartWithConfig = () => {
    if (onStartAssessment) {
      onStartAssessment({
        question_count: Number(questionCount),
        difficulty,
        duration_mins: Number(durationMins),
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Terminal / Environment Boot Bar */}
      <div className="p-3.5 rounded-2xl bg-navy-950 border border-slate-800 font-mono text-xs flex items-center justify-between text-slate-400 shadow-inner">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-white font-semibold">{environment.bootMessage}</span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold">READY</span>
        </div>
      </div>

      {/* 2. Main Career Environment Banner */}
      <div
        className="p-6 sm:p-8 rounded-3xl border backdrop-blur-xl relative overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: theme.cardBg || 'rgba(12, 18, 36, 0.94)',
          borderColor: theme.cardBorder || 'rgba(0, 240, 255, 0.35)',
          boxShadow: `0 14px 40px -8px ${theme.glow || 'rgba(0, 240, 255, 0.25)'}`,
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-mono font-bold border"
                style={{
                  backgroundColor: theme.badgeBg || 'rgba(0, 240, 255, 0.12)',
                  borderColor: theme.badgeBorder || 'rgba(0, 240, 255, 0.35)',
                  color: theme.badgeText || '#00f0ff',
                }}
              >
                {environment.environmentName}
              </span>

              <Badge variant="success" size="sm">
                {career?.market_demand || 'High Industry Demand'}
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {career?.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {career?.description}
            </p>

            {/* Visual concept callout */}
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300/90 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Environment Paradigm: <strong>{environment.visualConcept}</strong></span>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-navy-950/80 border border-slate-800 text-center shrink-0 min-w-[170px]">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Median Compensation</span>
            <span className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
              {career?.average_salary || '$115,000 / yr'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">Verified Industry Benchmark</span>
          </div>
        </div>
      </div>

      {/* 3. Three Specification Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evaluated Competencies */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider border-b border-slate-800 pb-2">
            <Target className="w-4 h-4" />
            <span>Target Competencies Evaluated</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(career?.core_competencies || []).map((comp, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{comp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tools & Environment HUD Badges */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider border-b border-slate-800 pb-2">
            <Cpu className="w-4 h-4" />
            <span>Professional Tools & Stack</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(career?.tools_and_technologies || environment.hudBadges || []).map((tool, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-navy-950 border border-slate-700/80 text-xs font-mono text-slate-200"
              >
                {tool}
              </span>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-navy-950/60 border border-slate-800/80 text-[11px] font-mono text-slate-400">
            Terminal Entrypoint: <code className="text-cyan-300">{environment.terminalPrompt}</code>
          </div>
        </div>

        {/* Assessment Structure & Custom Configuration */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Assessment Rigor & Calibration</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              Customizable
            </span>
          </div>

          {/* Config Controls */}
          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Question Count:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 20, 25, 30].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`py-1.5 rounded-lg border text-center transition ${
                      questionCount === num
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Difficulty Rigor:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'beginner', label: 'Beginner' },
                  { id: 'intermediate', label: 'Intermediate' },
                  { id: 'advanced', label: 'Advanced' },
                  { id: 'adaptive', label: 'Adaptive' },
                ].map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setDifficulty(diff.id)}
                    className={`py-1.5 px-2 rounded-lg border text-center capitalize transition ${
                      difficulty === diff.id
                        ? 'bg-indigo-500 text-white font-bold border-indigo-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Time Duration:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[15, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMins(mins)}
                    className={`py-1.5 rounded-lg border text-center transition ${
                      durationMins === mins
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Banner */}
      <div className="p-6 rounded-2xl bg-navy-950 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="text-xs font-mono text-slate-400 hover:text-white transition"
        >
          ← Choose Different Career
        </button>

        <button
          onClick={handleStartWithConfig}
          disabled={isLoading}
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-extrabold bg-cyan-400 text-navy-950 hover:bg-cyan-300 hover:shadow-glow transition disabled:opacity-50"
        >
          <span>{isLoading ? 'Calibrating Test...' : `Enter ${environment.environmentName} & Start Test (${questionCount} Qs • ${durationMins}m)`}</span>
          <ArrowRight className="w-4 h-4 font-bold" />
        </button>
      </div>
    </div>
  );
};

export default CareerEntryTransition;

