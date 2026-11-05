import React, { useState, useEffect } from 'react';
import {
  Swords,
  Code2,
  Brain,
  Cpu,
  Users,
  FolderGit2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import { gamificationApi } from '../services/api';
import { useApp } from '../context/AppContext';

const ARENA_CATEGORIES = [
  { id: 'all', label: 'All Arenas', icon: Swords },
  { id: 'dsa', label: 'DSA Arena', icon: Code2, desc: 'Algorithms & Problem Solving' },
  { id: 'aptitude', label: 'Aptitude Arena', icon: Brain, desc: 'Quantitative & Analytical Logic' },
  { id: 'technical', label: 'Tech Interview Arena', icon: Cpu, desc: 'Architecture & System Design' },
  { id: 'hr', label: 'HR Arena', icon: Users, desc: 'STAR Behavioral Scenarios' },
  { id: 'project', label: 'Project Arena', icon: FolderGit2, desc: 'Hands-on Engineering Challenges' },
];

export default function CareerArenaPage() {
  const { userProfile, activeTheme, refreshGamification } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active challenge for modal / solving
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [solutionText, setSolutionText] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    fetchChallenges(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const fetchChallenges = async (category) => {
    setLoading(true);
    setError(null);
    try {
      const data = await gamificationApi.getArenaChallenges(category, userProfile?.id);
      setChallenges(data || []);
    } catch (err) {
      console.error('Error fetching arena challenges:', err);
      setError('Failed to load arena challenges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setSolutionText(challenge.starter_code || '');
    setShowHints(false);
    setSubmissionResult(null);
    setTimerSeconds(0);
    setTimerActive(true);
  };

  const handleCloseChallenge = () => {
    setSelectedChallenge(null);
    setTimerActive(false);
    setSubmissionResult(null);
  };

  const handleSubmitSolution = async () => {
    if (!solutionText.trim() || solutionText.trim().length < 10) {
      alert('Please provide a complete solution before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await gamificationApi.submitArenaChallenge(selectedChallenge.id, {
        profile_id: userProfile?.id,
        submission_text: solutionText,
        time_spent_secs: timerSeconds,
      });
      setSubmissionResult(result);
      setTimerActive(false);
      // Refresh gamification XP & challenges state
      refreshGamification();
      fetchChallenges(activeCategory);
    } catch (err) {
      console.error('Failed to submit arena challenge:', err);
      alert('Error submitting solution: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border backdrop-blur-xl shadow-2xl"
        style={{
          backgroundColor: activeTheme?.palette?.cardBg || 'rgba(10, 15, 29, 0.85)',
          borderColor: activeTheme?.palette?.cardBorder || 'rgba(51, 65, 85, 0.6)',
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase mb-2" style={{ color: activeTheme?.palette?.primary || '#00f0ff' }}>
              <Swords className="w-4 h-4 animate-pulse" />
              <span>Combat Training & Placement Arena</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Career <span style={{ color: activeTheme?.palette?.primary || '#00f0ff' }}>Arena</span>
            </h1>
            <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Test your engineering prowess, mathematical logic, and communication skills under real interview constraints. Earn verified XP, unlock combat achievements, and build placement readiness.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 shrink-0">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-mono">Arena Honor</div>
              <div className="text-xl font-bold text-white flex items-center gap-1.5">
                <span>{challenges.filter((c) => c.is_completed).length} / {challenges.length}</span>
                <span className="text-xs text-slate-400 font-normal">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-800/80 mt-6 no-scrollbar">
          {ARENA_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-300 shadow-lg shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-slate-400">Loading arena combat trials...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center text-rose-300">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
          <p>{error}</p>
          <button
            onClick={() => fetchChallenges(activeCategory)}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((c) => {
            const isCompleted = c.is_completed;
            const diffColor =
              c.difficulty === 'Easy'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                : c.difficulty === 'Medium'
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

            return (
              <div
                key={c.id}
                className="group relative rounded-2xl border bg-slate-900/80 border-slate-800/90 p-5 flex flex-col justify-between hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300"
              >
                <div>
                  {/* Top Bar: Difficulty & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full border ${diffColor}`}>
                      {c.difficulty}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-lg">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        +{c.xp_reward} XP
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-lg">
                          <CheckCircle2 className="w-3 h-3" />
                          Passed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Arena Type */}
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                    {c.arena_type} Arena
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {c.title}
                  </h3>

                  {/* Description preview */}
                  <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {c.problem_statement}
                  </p>
                </div>

                {/* Bottom Details & Action */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.time_limit_mins} mins</span>
                  </div>

                  <button
                    onClick={() => handleOpenChallenge(c)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all shadow-md shadow-cyan-600/20"
                  >
                    <span>{isCompleted ? 'Retry Trial' : 'Enter Arena'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Challenge Solve Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 mb-1">
                  <span>{selectedChallenge.arena_type.toUpperCase()} COMBAT ARENA</span>
                  <span>•</span>
                  <span>+{selectedChallenge.xp_reward} XP</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedChallenge.title}
                </h2>
              </div>

              {/* Timer Pill & Close */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300">
                  <Clock className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>{formatTime(timerSeconds)}</span>
                </div>
                <button
                  onClick={handleCloseChallenge}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* Problem Statement Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Problem Description
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedChallenge.problem_statement}
                </p>
              </div>

              {/* Hints Drawer */}
              {selectedChallenge.hints && selectedChallenge.hints.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center justify-between w-full text-xs font-mono text-amber-400 hover:text-amber-300"
                  >
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>{showHints ? 'Hide Architectural Hints' : 'Reveal Architectural Hints'}</span>
                    </div>
                    <span>{showHints ? '▲' : '▼'}</span>
                  </button>
                  {showHints && (
                    <ul className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1 text-xs text-slate-300 list-disc list-inside">
                      {selectedChallenge.hints.map((hint, idx) => (
                        <li key={idx}>{hint}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Solution Code / Text Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Your Solution Implementation:</span>
                  <span>{solutionText.length} characters</span>
                </div>
                <textarea
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  placeholder="Type your solution, algorithm implementation, or STAR scenario response here..."
                  rows={10}
                  className="w-full rounded-2xl p-4 bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs sm:text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 resize-y"
                />
              </div>

              {/* Result Notification Banner */}
              {submissionResult && (
                <div
                  className={`p-4 rounded-2xl border animate-fadeIn ${
                    submissionResult.passed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    {submissionResult.passed ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>Victory! Score: {submissionResult.score}%</span>
                        {submissionResult.xp_awarded > 0 && (
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                            +{submissionResult.xp_awarded} XP Awarded
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                        <span>Trial Failed — Score: {submissionResult.score}%</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {submissionResult.feedback}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <button
                onClick={() => setSolutionText(selectedChallenge.starter_code || '')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Code</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloseChallenge}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={handleSubmitSolution}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/25"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Evaluating Rubric...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Submit Solution</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

