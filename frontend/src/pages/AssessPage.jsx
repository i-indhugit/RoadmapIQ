import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { careerAssessmentApi, roadmapsApi, aiApi } from '../services/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BarChart2,
  Clock,
  Layers,
  Flag,
  Target,
  FileText,
  ShieldCheck,
  TrendingUp,
  History,
  Scale,
  Play,
  Sliders,
  Check,
  Bot,
  Info,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EnvironmentQuestionFrame from '../components/assessment/EnvironmentQuestionFrame';
import CareerResultScorecard from '../components/assessment/CareerResultScorecard';
import { getCareerEnvironment } from '../utils/careerEnvironments';

export default function AssessPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    profile,
    activeRole,
    activeRoadmap,
    setActiveRoadmap,
    addToast,
    triggerCelebration,
    activeTheme,
    refreshGamification,
  } = useApp();

  const currentTab = searchParams.get('tab') || 'take';

  const setTab = (tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  // -------------------------------------------------------------
  // Test Configuration State
  // -------------------------------------------------------------
  const [questionCount, setQuestionCount] = useState(15);
  const [difficultyTier, setDifficultyTier] = useState('standard');
  const [durationMins, setDurationMins] = useState(25);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isStartingTest, setIsStartingTest] = useState(false);

  // Active Assessment Attempt & Questions
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewFlags, setReviewFlags] = useState([]);
  const [timeRemainingSecs, setTimeRemainingSecs] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Evaluation & Gap State
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [gapReport, setGapReport] = useState(null);
  const [loadingGaps, setLoadingGaps] = useState(false);
  const [isSendingToRoadmap, setIsSendingToRoadmap] = useState(false);

  // History & Reassessment State
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [compareAttemptId, setCompareAttemptId] = useState(null);
  const [comparisonDelta, setComparisonDelta] = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // AI Gap Explanation Modal
  const [aiGapModalOpen, setAiGapModalOpen] = useState(false);
  const [selectedGapForAi, setSelectedGapForAi] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Career Environment for Test UI
  const currentEnvironment = useMemo(() => {
    const slugOrTitle = activeRole?.slug || activeRole?.title || 'java-developer';
    return getCareerEnvironment(slugOrTitle);
  }, [activeRole]);

  // Load Assessment History on Mount
  const loadHistory = useCallback(async () => {
    if (!profile?.id) return;
    setLoadingHistory(true);
    try {
      const data = await careerAssessmentApi.getHistory(profile.id);
      setHistoryList(data || []);
      if (data && data.length >= 2) {
        setSelectedAttemptId(data[0].id);
        setCompareAttemptId(data[1].id);
      } else if (data && data.length === 1) {
        setSelectedAttemptId(data[0].id);
      }
    } catch (err) {
      console.warn('History load note:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Load Gaps for Active Attempt or Role
  useEffect(() => {
    const fetchLatestGaps = async () => {
      if (attempt?.id) {
        setLoadingGaps(true);
        try {
          const gaps = await careerAssessmentApi.getSkillAnalysis(attempt.id);
          setGapReport(gaps);
        } catch {
          // Fall back
        } finally {
          setLoadingGaps(false);
        }
      } else if (historyList.length > 0) {
        const latestAttempt = historyList[0];
        setLoadingGaps(true);
        try {
          const gaps = await careerAssessmentApi.getSkillAnalysis(latestAttempt.id);
          setGapReport(gaps);
        } catch {
          // Fall back
        } finally {
          setLoadingGaps(false);
        }
      }
    };

    fetchLatestGaps();
  }, [attempt?.id, historyList]);

  // Load Comparison between two attempts
  useEffect(() => {
    if (selectedAttemptId && compareAttemptId && selectedAttemptId !== compareAttemptId) {
      setLoadingCompare(true);
      careerAssessmentApi
        .compareAttempts(selectedAttemptId, compareAttemptId)
        .then(setComparisonDelta)
        .catch(() => setComparisonDelta(null))
        .finally(() => setLoadingCompare(false));
    }
  }, [selectedAttemptId, compareAttemptId]);

  // -------------------------------------------------------------
  // Countdown Timer
  // -------------------------------------------------------------
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeRemainingSecs > 0) {
      interval = setInterval(() => {
        setTimeRemainingSecs((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmitOnTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemainingSecs]);

  const handleAutoSubmitOnTimeout = () => {
    addToast('warning', 'Assessment time expired. Automatically submitting your answers...', 'Time Up');
    handleSubmitAssessment();
  };

  // -------------------------------------------------------------
  // Test Actions
  // -------------------------------------------------------------
  const handleStartAssessment = async () => {
    if (!activeRole?.id) {
      addToast('warning', 'Please select a target career in Discover before taking the assessment.', 'No Target Role');
      navigate('/discover?tab=target');
      return;
    }

    setIsStartingTest(true);
    try {
      const res = await careerAssessmentApi.startAssessment({
        role_id: activeRole.id,
        profile_id: profile?.id || undefined,
        question_count: questionCount,
        duration_mins: durationMins,
        difficulty_tier: difficultyTier,
      });

      setAttempt(res.attempt);
      setQuestions(res.questions || []);
      setCurrentIdx(0);
      setAnswers({});
      setReviewFlags([]);
      setTimeRemainingSecs(res.attempt.duration_minutes * 60 || durationMins * 60);
      setIsTimerRunning(true);
      setIsTestActive(true);
      addToast('info', `Assessment started for ${activeRole.title}. Good luck!`, 'Exam Started');
    } catch (err) {
      addToast('error', err.message || 'Could not start assessment.', 'Error');
    } finally {
      setIsStartingTest(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const toggleFlagQuestion = (questionId) => {
    setReviewFlags((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const handleSubmitAssessment = async () => {
    if (!attempt?.id) return;
    setIsSubmitting(true);
    setIsTimerRunning(false);
    setShowConfirmSubmit(false);

    try {
      const result = await careerAssessmentApi.submitAssessment(attempt.id, {
        answers,
        time_spent_seconds: (attempt.duration_minutes * 60) - timeRemainingSecs,
      });

      setEvaluationResult(result);
      setIsTestActive(false);
      triggerCelebration();

      // Refresh gamification & history
      await refreshGamification();
      await loadHistory();

      // Fetch Skill Gap Report
      const gaps = await careerAssessmentApi.getSkillAnalysis(attempt.id).catch(() => null);
      if (gaps) setGapReport(gaps);

      addToast(
        'success',
        `Assessment complete! You scored ${result.score_percentage}% (${result.proficiency_level}).`,
        'Test Submitted'
      );

      // Automatically transition to gaps tab
      setTab('gaps');
    } catch (err) {
      addToast('error', err.message || 'Failed to submit assessment.', 'Error');
      setIsTimerRunning(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Send Assessment Findings to Roadmap Generator
  // -------------------------------------------------------------
  const handleSendFindingsToRoadmap = async () => {
    const targetAttemptId = attempt?.id || (historyList.length > 0 ? historyList[0].id : null);
    if (!targetAttemptId) {
      addToast('warning', 'Please complete an assessment before generating a roadmap.', 'No Assessment Found');
      return;
    }

    setIsSendingToRoadmap(true);
    try {
      const newRoadmap = await careerAssessmentApi.generateRoadmapFromAssessment({
        attempt_id: targetAttemptId,
        weekly_hours: profile?.weekly_study_hours || 15,
        duration_weeks: profile?.target_duration_weeks || 12,
      });

      setActiveRoadmap(newRoadmap);
      triggerCelebration();
      addToast(
        'success',
        `Personalized roadmap generated! Mastered topics skipped, priority placed on ${gapReport?.critical_gaps?.length || 'core'} foundational gaps.`,
        'Roadmap Adapted'
      );
      navigate('/journey?tab=roadmap');
    } catch (err) {
      addToast('error', err.message || 'Could not adapt roadmap.', 'Error');
    } finally {
      setIsSendingToRoadmap(false);
    }
  };

  // AI Gap Explanation Handler
  const handleOpenAiGapExplanation = async (skillName) => {
    setSelectedGapForAi(skillName);
    setAiGapModalOpen(true);
    setAiLoading(true);
    setAiExplanation(null);

    try {
      const exp = await aiApi.getSkillGapExplanation({
        topic: skillName,
        target_role: activeRole?.title || 'Technical Specialist',
      });
      setAiExplanation(exp);
    } catch (err) {
      addToast('error', 'Could not retrieve AI explanation.', 'AI Offline');
    } finally {
      setAiLoading(false);
    }
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx] || null;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Award className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
                Module 2 • Skill Assessment & Gap Analysis
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Validate Competencies & Discover Gaps
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Take customizable career assessments in your track's specific technical environment, audit strong vs weak competencies, and feed insights directly into your roadmap generator.
            </p>
          </div>

          {/* Active Target Career Pill */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-400">Assessing Track</div>
                <div className="text-xs font-bold text-white truncate max-w-[160px]">
                  {activeRole?.title || 'General Career Track'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setTab('take')}
            disabled={isTestActive}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'take'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-indigo-400" />
            <span>Take Assessment</span>
          </button>

          <button
            onClick={() => setTab('gaps')}
            disabled={isTestActive}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'gaps'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Skill Gaps & Readiness</span>
            {gapReport && (
              <span className="px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px]">
                {gapReport.readiness_score}%
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('history')}
            disabled={isTestActive}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'history'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>History & Reassessment</span>
            {historyList.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/30 text-cyan-300 text-[10px]">
                {historyList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUBTAB 1: TAKE ASSESSMENT                                       */}
      {/* ============================================================== */}
      {currentTab === 'take' && (
        <>
          {!isTestActive ? (
            /* Test Configuration & Start Card */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Exam Configuration</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Configure {activeRole?.title || 'Career'} Assessment
                  </h2>
                  <p className="text-xs text-slate-400">
                    Customize your question count and duration. Questions cover core syntax, architectural concepts, edge cases, and practical problem-solving.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Question Count */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase font-bold">
                      Question Count
                    </label>
                    <div className="flex gap-2">
                      {[10, 15, 25].map((cnt) => (
                        <button
                          key={cnt}
                          onClick={() => setQuestionCount(cnt)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            questionCount === cnt
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          {cnt} Qs
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Tier */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase font-bold">
                      Difficulty Level
                    </label>
                    <select
                      value={difficultyTier}
                      onChange={(e) => setDifficultyTier(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="standard">Standard (Foundational & Intermediate)</option>
                      <option value="balanced">Balanced (Real-World Mix)</option>
                      <option value="rigorous">Rigorous (Senior Edge Cases)</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase font-bold">
                      Allocated Time
                    </label>
                    <div className="flex gap-2">
                      {[15, 25, 40].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => setDurationMins(mins)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                            durationMins === mins
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Exam Notice */}
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Distraction-Free Environment</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Once started, a timer runs in the background. Questions include syntax snippets, practical design scenarios, and code snippets adapted to {activeRole?.title}. Results generate deterministic skill mastery records.
                  </p>
                </div>

                <button
                  onClick={handleStartAssessment}
                  disabled={isStartingTest}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isStartingTest ? (
                    <span>Preparing Exam Environment...</span>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Start Assessment Now &rarr;</span>
                    </>
                  )}
                </button>
              </div>

              {/* Competencies Preview Sidebar */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Covered Competencies</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Skills tested for {activeRole?.title || 'your track'}:
                </p>

                <div className="space-y-2">
                  {(activeRole?.skills || [
                    { name: 'Core Foundations & Architecture' },
                    { name: 'Data Structures & Algorithms' },
                    { name: 'System Design & APIs' },
                    { name: 'Error Handling & Performance' },
                    { name: 'Testing & Automation' },
                  ]).slice(0, 6).map((sk, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between"
                    >
                      <span>{typeof sk === 'string' ? sk : sk.name}</span>
                      <span className="text-[10px] text-indigo-400 font-bold">Assessed</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Distraction-Free Test Interface */
            <div className="p-3.5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl space-y-5 sm:space-y-6">
              {/* Header Bar: Progress, Timer, Flags */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                    Q<strong className="text-white text-xs sm:text-sm ml-0.5">{currentIdx + 1}</strong>/{questions.length}
                  </span>
                  <div className="w-20 sm:w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3">
                  {/* Timer Badge */}
                  <div className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-mono text-[11px] sm:text-xs font-bold flex items-center gap-1.5 border ${
                    timeRemainingSecs < 180
                      ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                      : 'bg-slate-950 text-indigo-300 border-indigo-500/30'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimer(timeRemainingSecs)}</span>
                  </div>

                  <button
                    onClick={() => toggleFlagQuestion(currentQ?.id)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-mono flex items-center gap-1 border transition-all ${
                      reviewFlags.includes(currentQ?.id)
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                    title="Flag question for review"
                  >
                    <Flag className="w-3 h-3" />
                    <span className="hidden xs:inline">Flag</span>
                  </button>

                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="px-3 sm:px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shrink-0"
                  >
                    Submit ({answeredCount}/{questions.length})
                  </button>
                </div>
              </div>

              {/* Current Question Frame */}
              {currentQ && (
                <div className="space-y-6">
                  {/* Category and Difficulty Tag */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40 text-indigo-300">
                      {currentQ.category || currentQ.skill_name || 'Core Assessment'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {currentQ.difficulty || 'Intermediate'} ({currentQ.marks || 1} pt)
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {currentQ.prompt || currentQ.question_text}
                  </h3>

                  {/* Code snippet if present */}
                  {currentQ.code_snippet && (
                    <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                      <code>{currentQ.code_snippet}</code>
                    </pre>
                  )}

                  {/* Options */}
                  <div className="space-y-2.5 sm:space-y-3">
                    {Object.entries(currentQ.options || {}).map(([key, val]) => {
                      const isSelected = answers[currentQ.id] === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleSelectOption(currentQ.id, key)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-start gap-3 min-h-[48px] active:scale-[0.99] ${
                            isSelected
                              ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500/50'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 active:bg-slate-900'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            {key.toUpperCase()}
                          </span>
                          <span className="text-xs sm:text-sm pt-0.5 leading-relaxed">{val}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-2">
                <button
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 min-h-[44px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {/* Quick question dots navigation */}
                <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-md px-1 scrollbar-none">
                  {questions.map((q, idx) => {
                    const isAnswered = !!answers[q.id];
                    const isCurrent = idx === currentIdx;
                    const isFlagged = reviewFlags.includes(q.id);

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(idx)}
                        className={`w-7 h-7 sm:w-6 sm:h-6 rounded-md text-[10px] font-mono font-bold flex items-center justify-center transition-all shrink-0 ${
                          isCurrent
                            ? 'ring-2 ring-indigo-400 bg-indigo-600 text-white'
                            : isFlagged
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                            : isAnswered
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-950 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[44px]"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors min-h-[44px]"
                  >
                    <span>Submit Exam</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Confirm Submit Modal */}
          {showConfirmSubmit && (
            <Modal
              isOpen={showConfirmSubmit}
              onClose={() => setShowConfirmSubmit(false)}
              title="Confirm Assessment Submission"
              maxWidth="max-w-md"
            >
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  You have answered <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> questions.
                  {reviewFlags.length > 0 && (
                    <span className="block mt-1 text-amber-400 font-mono">
                      * You have {reviewFlags.length} flagged questions pending review.
                    </span>
                  )}
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmSubmit(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Review Answers
                  </button>
                  <button
                    onClick={handleSubmitAssessment}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs"
                  >
                    {isSubmitting ? 'Submitting...' : 'Yes, Submit Test'}
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 2: SKILL GAPS & CAREER READINESS                         */}
      {/* ============================================================== */}
      {currentTab === 'gaps' && (
        <div className="space-y-6">
          {gapReport ? (
            <>
              {/* Readiness Score & 1-Click Send to Roadmap Bar */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
                    Objective Career Readiness
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <span className="text-4xl font-extrabold text-white">
                      {gapReport.readiness_score}%
                    </span>
                    <span className="text-xs text-slate-400 max-w-xs">
                      Evaluated against verified criteria for {gapReport.role_title || activeRole?.title}.
                    </span>
                  </div>
                </div>

                {/* Primary Action: Send to Roadmap Generator */}
                <button
                  onClick={handleSendFindingsToRoadmap}
                  disabled={isSendingToRoadmap}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isSendingToRoadmap
                      ? 'Adapting Learning Roadmap...'
                      : 'Send Findings to Roadmap Generator &rarr;'}
                  </span>
                </button>
              </div>

              {/* Four Quadrants: Strong, Developing, Weak, Missing */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Strong Skills */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Strong Skills</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {gapReport.strong_skills?.length || 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Mastered. Skipped in beginner phases.</p>
                  <div className="space-y-1.5">
                    {(gapReport.strong_skills || []).map((sk, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 truncate"
                      >
                        {typeof sk === 'string' ? sk : sk.name}
                      </div>
                    ))}
                    {(!gapReport.strong_skills || gapReport.strong_skills.length === 0) && (
                      <div className="text-[11px] text-slate-500 italic">None assessed as strong yet</div>
                    )}
                  </div>
                </div>

                {/* Developing Skills */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      <span>Developing</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {gapReport.needs_improvement_skills?.length || 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Intermediate. Requires practice drills.</p>
                  <div className="space-y-1.5">
                    {(gapReport.needs_improvement_skills || []).map((sk, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 truncate"
                      >
                        {typeof sk === 'string' ? sk : sk.name}
                      </div>
                    ))}
                    {(!gapReport.needs_improvement_skills || gapReport.needs_improvement_skills.length === 0) && (
                      <div className="text-[11px] text-slate-500 italic">None in developing tier</div>
                    )}
                  </div>
                </div>

                {/* Weak / Critical Gaps */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Critical Gaps</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {gapReport.critical_gaps?.length || 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Foundational. Prioritized in early weeks.</p>
                  <div className="space-y-1.5">
                    {(gapReport.critical_gaps || []).map((sk, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleOpenAiGapExplanation(typeof sk === 'string' ? sk : sk.name)}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300 hover:border-amber-500 cursor-pointer flex items-center justify-between group"
                      >
                        <span className="truncate">{typeof sk === 'string' ? sk : sk.name}</span>
                        <Bot className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0" />
                      </div>
                    ))}
                    {(!gapReport.critical_gaps || gapReport.critical_gaps.length === 0) && (
                      <div className="text-[11px] text-slate-500 italic">No critical gaps detected!</div>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>Missing Skills</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {gapReport.missing_skills?.length || 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Not yet covered in test.</p>
                  <div className="space-y-1.5">
                    {(gapReport.missing_skills || []).map((sk, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 truncate"
                      >
                        {typeof sk === 'string' ? sk : sk.name}
                      </div>
                    ))}
                    {(!gapReport.missing_skills || gapReport.missing_skills.length === 0) && (
                      <div className="text-[11px] text-slate-500 italic">All skills assessed</div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Gap Explanation Section */}
              {gapReport.ai_gap_explanation && (
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span>AI Diagnostic Overview</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {gapReport.ai_gap_explanation}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 px-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <BarChart2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Assessment Findings Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Take an assessment to generate your skill gap analysis and objective career readiness score.
              </p>
              <button
                onClick={() => setTab('take')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <span>Take Assessment Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 3: HISTORY & REASSESSMENT                                */}
      {/* ============================================================== */}
      {currentTab === 'history' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <span>Assessment History & Reassessment</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review your historical assessment attempts, evaluate side-by-side growth delta, and retake the exam.
              </p>
            </div>

            <button
              onClick={() => {
                setTab('take');
                setIsTestActive(false);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Assessment</span>
            </button>
          </div>

          {/* Historical Attempts List */}
          {historyList.length > 0 ? (
            <div className="space-y-3">
              {historyList.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {item.role_title || 'Career Track'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        Attempt #{historyList.length - idx}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Completed: {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : 'In Progress'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-white">
                        {item.score_percentage ?? 0}%
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400">
                        {item.proficiency_level || 'Evaluated'}
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        const gaps = await careerAssessmentApi.getSkillAnalysis(item.id).catch(() => null);
                        if (gaps) {
                          setGapReport(gaps);
                          setTab('gaps');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800"
                    >
                      View Gaps
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-500">
              No previous assessment attempts recorded. Complete an assessment to see your history here.
            </div>
          )}

          {/* Side-by-Side Comparison Delta if 2+ attempts exist */}
          {comparisonDelta && (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <span>Side-by-Side Growth Delta (Attempt #{comparisonDelta.current_attempt_id} vs #{comparisonDelta.previous_attempt_id})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Score Delta</div>
                  <div className={`text-xl font-extrabold mt-1 ${
                    comparisonDelta.score_delta >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {comparisonDelta.score_delta >= 0 ? `+${comparisonDelta.score_delta}%` : `${comparisonDelta.score_delta}%`}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Newly Mastered Skills</div>
                  <div className="text-xl font-extrabold text-cyan-400 mt-1">
                    {comparisonDelta.improved_skills?.length || 0} Skills
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Closed Gaps</div>
                  <div className="text-xl font-extrabold text-purple-400 mt-1">
                    {comparisonDelta.closed_gaps?.length || 0} Resolved
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Gap Explanation Modal */}
      {aiGapModalOpen && (
        <Modal
          isOpen={aiGapModalOpen}
          onClose={() => setAiGapModalOpen(false)}
          title={`AI Concept Diagnosis: ${selectedGapForAi}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            {aiLoading ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Sparkles className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
                <p>Generating personalized concept breakdown and study roadmap...</p>
              </div>
            ) : aiExplanation ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
                  {aiExplanation.explanation || aiExplanation.overview || aiExplanation.reply}
                </div>
                {aiExplanation.recommended_steps && (
                  <div className="space-y-1.5">
                    <div className="font-mono text-purple-400 uppercase font-bold">Recommended Study Steps:</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      {aiExplanation.recommended_steps.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400">Could not retrieve explanation.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

