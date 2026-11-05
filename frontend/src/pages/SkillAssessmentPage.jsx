import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Check,
  AlertCircle,
  BarChart2,
  Clock,
  Layers,
  Flag,
  ChevronDown,
  ChevronUp,
  Search,
  Zap,
  Target,
  Compass,
  Code,
  FileText,
  ShieldCheck,
  TrendingUp,
  History,
  BookOpen,
  Filter,
  CheckSquare,
  Database,
  Cpu,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { careerAssessmentApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { getCareerEnvironment } from '../utils/careerEnvironments';
import Badge from '../components/common/Badge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import EnvironmentQuestionFrame from '../components/assessment/EnvironmentQuestionFrame';
import CareerEntryTransition from '../components/assessment/CareerEntryTransition';
import CareerResultScorecard from '../components/assessment/CareerResultScorecard';
import CareerGapRoadmapSection from '../components/assessment/CareerGapRoadmapSection';

const DIFFICULTY_CONFIG = {
  fundamentals: { label: 'Fundamentals (1 pt)', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  intermediate: { label: 'Intermediate (1 pt)', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  practical: { label: 'Practical / Code (2 pts)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  advanced: { label: 'Advanced (2 pts)', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
};

const SkillAssessmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    profile,
    activeRole,
    refreshProfile,
    addToast,
    activeTheme,
    setActiveRoadmap,
    setActiveRole,
    triggerCelebration,
    switchCareer,
  } = useApp();

  // Workflow Stages: 'select_career' | 'overview' | 'testing' | 'results' | 'gap_analysis'
  const [stage, setStage] = useState('select_career');

  // Stage 1: Careers Catalog
  const [careers, setCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [careerFilter, setCareerFilter] = useState('all');
  const [careerSearch, setCareerSearch] = useState('');

  // Reassessment & Comparison Tracking
  const [previousAttemptId, setPreviousAttemptId] = useState(null);

  // Active Career Environment configuration
  const currentEnvironment = useMemo(() => {
    const slugOrTitle = selectedCareer?.slug || selectedCareer?.title || activeRole?.slug || 'java-developer';
    return getCareerEnvironment(slugOrTitle);
  }, [selectedCareer, activeRole]);

  // Stage 2: Career Overview
  const [careerOverview, setCareerOverview] = useState(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  // Stage 3: Testing State
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewFlags, setReviewFlags] = useState([]);
  const [timeRemainingSecs, setTimeRemainingSecs] = useState(30 * 60);
  const [timeSpentSecs, setTimeSpentSecs] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState('idle');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Stage 4: Results & Evaluation
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Stage 5: Skill Gap Report & Roadmap
  const [gapReport, setGapReport] = useState(null);
  const [roadmapWeeklyHours, setRoadmapWeeklyHours] = useState(15);
  const [roadmapDurationWeeks, setRoadmapDurationWeeks] = useState(12);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // General Loading & History
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Autosave timer ref
  const autosaveTimerRef = useRef(null);

  // -------------------------------------------------------------
  // Initial Catalog Load
  // -------------------------------------------------------------
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [careerList, history] = await Promise.all([
          careerAssessmentApi.getCareers(),
          profile?.id ? careerAssessmentApi.getHistory(profile.id).catch(() => []) : Promise.resolve([]),
        ]);
        setCareers(careerList || []);
        setHistoryList(history || []);

        if (activeRole) {
          const match = careerList.find((c) => c.id === activeRole.id || c.slug === activeRole.slug);
          if (match) setSelectedCareer(match);
        }

        // Check query parameters for progressive tabs and career selection
        const queryParams = new URLSearchParams(location.search);
        const careerQuery = queryParams.get('career');
        const tabQuery = queryParams.get('tab');

        let targetCareer = null;
        if (careerQuery) {
          targetCareer = (careerList || []).find(
            (c) => String(c.id) === careerQuery || c.slug === careerQuery
          );
        } else if (activeRole) {
          targetCareer = (careerList || []).find(
            (c) => c.id === activeRole.id || c.slug === activeRole.slug
          );
        }

        if (tabQuery === 'history') {
          setShowHistoryModal(true);
        }

        if ((tabQuery === 'config' || tabQuery === 'overview') && targetCareer) {
          handleSelectCareerForOverview(targetCareer);
        } else if (targetCareer && careerQuery) {
          handleSelectCareerForOverview(targetCareer);
        }
      } catch (err) {
        addToast('error', err.message || 'Failed to load career assessment catalog.', 'Catalog Error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [profile?.id, activeRole, location.search, addToast]);

  // -------------------------------------------------------------
  // Career Selection -> Overview
  // -------------------------------------------------------------
  const handleSelectCareerForOverview = async (career) => {
    setSelectedCareer(career);
    setIsLoadingOverview(true);
    setStage('overview');
    try {
      const overview = await careerAssessmentApi.getCareerOverview(career.id || career.slug);
      setCareerOverview(overview);
    } catch (err) {
      addToast('error', err.message || 'Could not load career overview.', 'Overview Error');
    } finally {
      setIsLoadingOverview(false);
    }
  };

  // -------------------------------------------------------------
  // Start Career Assessment Test (Stage 3)
  // -------------------------------------------------------------
  const handleStartAssessment = async (config = {}) => {
    if (!selectedCareer) return;
    setIsLoading(true);
    try {
      if (attempt?.attempt_id) {
        setPreviousAttemptId(attempt.attempt_id);
      }

      const qCount = config?.question_count || 25;
      const diff = config?.difficulty || 'intermediate';
      const durationMins = config?.duration_mins || 30;

      const res = await careerAssessmentApi.startAssessment({
        career_id_or_slug: selectedCareer.id || selectedCareer.slug,
        profile_id: profile?.id,
        question_count: qCount,
        difficulty: diff,
        duration_mins: durationMins,
      });

      setAttempt(res);
      setQuestions(res.questions || []);
      setCurrentIdx(0);
      setAnswers(res.saved_answers || {});
      setReviewFlags(res.review_flags || []);

      const durationSecs = (res.duration_mins || durationMins || 30) * 60;
      setTimeRemainingSecs(durationSecs);
      setTimeSpentSecs(0);
      setIsTimerRunning(true);
      setStage('testing');

      addToast(
        'info',
        `Entered ${currentEnvironment.environmentName}. ${res.questions?.length || qCount} questions, ${durationMins} minutes allotted.`,
        'Assessment Active'
      );
    } catch (err) {
      addToast('error', err.message || 'Failed to start career assessment.', 'Test Error');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Timer Countdown (30 minutes)
  // -------------------------------------------------------------
  useEffect(() => {
    if (stage !== 'testing' || !isTimerRunning) return;

    const timer = setInterval(() => {
      setTimeRemainingSecs((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerRunning(false);
          addToast('warning', 'Assessment time has expired! Auto-submitting answers...', 'Time Expired');
          handleSubmitAssessment(true);
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentSecs((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, isTimerRunning]);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // Autosave
  // -------------------------------------------------------------
  const triggerAutosave = useCallback(
    (newAnswers, newFlags) => {
      if (!attempt?.attempt_id) return;

      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      setAutosaveStatus('saving');
      autosaveTimerRef.current = setTimeout(async () => {
        try {
          await careerAssessmentApi.saveAnswers(attempt.attempt_id, {
            answers: newAnswers,
            review_flags: newFlags,
            time_spent_secs: timeSpentSecs,
          });
          setAutosaveStatus('saved');
          setTimeout(() => setAutosaveStatus('idle'), 2500);
        } catch {
          setAutosaveStatus('idle');
        }
      }, 1500);
    },
    [attempt?.attempt_id, timeSpentSecs]
  );

  const handleSelectOption = (questionId, optionIndex) => {
    const newAnswers = {
      ...answers,
      [String(questionId)]: optionIndex,
    };
    setAnswers(newAnswers);
    triggerAutosave(newAnswers, reviewFlags);
  };

  const handleClearAnswer = (questionId) => {
    const newAnswers = { ...answers };
    delete newAnswers[String(questionId)];
    setAnswers(newAnswers);
    triggerAutosave(newAnswers, reviewFlags);
  };

  const handleToggleReviewFlag = (questionId) => {
    const isFlagged = reviewFlags.includes(questionId);
    const newFlags = isFlagged
      ? reviewFlags.filter((id) => id !== questionId)
      : [...reviewFlags, questionId];
    setReviewFlags(newFlags);
    triggerAutosave(answers, newFlags);
  };

  // -------------------------------------------------------------
  // Final Submission (Stage 3 -> Stage 4)
  // -------------------------------------------------------------
  const handleSubmitAssessment = async (isAutoSubmit = false) => {
    if (!attempt?.attempt_id) return;
    setShowSubmitModal(false);
    setIsTimerRunning(false);
    setIsSubmitting(true);

    try {
      const result = await careerAssessmentApi.submitAssessment(attempt.attempt_id, {
        answers,
        time_spent_secs: timeSpentSecs,
      });

      setEvaluationResult(result);
      setStage('results');
      triggerCelebration();

      await refreshProfile();

      addToast(
        'success',
        `Assessment complete! Overall score: ${result.score_percentage}% (${result.proficiency_level}).`,
        'Evaluation Finished'
      );
    } catch (err) {
      addToast('error', err.message || 'Failed to submit assessment.', 'Submission Error');
      setIsTimerRunning(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Stage 4 -> Stage 5 (Skill Gap Analysis)
  // -------------------------------------------------------------
  const handleProceedToGapAnalysis = async () => {
    if (!attempt?.attempt_id) return;
    setIsLoading(true);
    try {
      const report = await careerAssessmentApi.getSkillAnalysis(attempt.attempt_id);
      setGapReport(report);
      setStage('gap_analysis');
    } catch (err) {
      addToast('error', err.message || 'Failed to load skill gap analysis.', 'Analysis Error');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Stage 5 Action: Generate Personalized Roadmap
  // -------------------------------------------------------------
  const handleGeneratePersonalizedRoadmap = async () => {
    if (!attempt?.attempt_id) return;
    setIsGeneratingRoadmap(true);
    try {
      const generatedRoadmap = await careerAssessmentApi.generateRoadmapFromAssessment({
        attempt_id: attempt.attempt_id,
        weekly_hours: roadmapWeeklyHours,
        duration_weeks: roadmapDurationWeeks,
      });

      setActiveRoadmap(generatedRoadmap);
      if (selectedCareer) {
        setActiveRole(selectedCareer);
        if (switchCareer) {
          switchCareer(selectedCareer.id, { silent: true }).catch(() => null);
        }
      }
      triggerCelebration();

      addToast(
        'success',
        `Personalized roadmap tailored to your ${selectedCareer?.title} assessment generated!`,
        'Roadmap Generated'
      );

      navigate('/roadmap');
    } catch (err) {
      addToast('error', err.message || 'Failed to generate personalized roadmap.', 'Roadmap Error');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // -------------------------------------------------------------
  // Review Past Attempt from History
  // -------------------------------------------------------------
  const handleLoadPastAttempt = async (attemptItem) => {
    setShowHistoryModal(false);
    setIsLoading(true);
    try {
      const [res, gap] = await Promise.all([
        careerAssessmentApi.getResults(attemptItem.id),
        careerAssessmentApi.getSkillAnalysis(attemptItem.id),
      ]);
      setAttempt({ attempt_id: attemptItem.id, role_id: attemptItem.role_id, role_title: attemptItem.role_title });
      setEvaluationResult(res);
      setGapReport(gap);
      setStage('results');
    } catch (err) {
      addToast('error', err.message || 'Failed to load past assessment results.', 'History Error');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering
  const filteredCareers = useMemo(() => {
    return careers.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(careerSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(careerSearch.toLowerCase()) ||
        (c.core_skills || []).some((s) => s.toLowerCase().includes(careerSearch.toLowerCase()));

      if (careerFilter === 'all') return matchesSearch;
      if (careerFilter === 'ai') return matchesSearch && (c.slug.includes('ai') || c.slug.includes('data') || c.slug.includes('learning'));
      if (careerFilter === 'software') return matchesSearch && (c.slug.includes('developer') || c.slug.includes('engineer') && !c.slug.includes('ai'));
      if (careerFilter === 'cloud_qa') return matchesSearch && (c.slug.includes('cloud') || c.slug.includes('qa'));
      return matchesSearch;
    });
  }, [careers, careerSearch, careerFilter]);

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = reviewFlags.length;
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  if (isLoading && stage === 'select_career') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-6">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* =============================================================
          TOP ENVIRONMENT HEADER & STEP INDICATOR
      ============================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border"
              style={{
                backgroundColor: currentEnvironment.theme.badgeBg || 'rgba(0, 240, 255, 0.12)',
                borderColor: currentEnvironment.theme.badgeBorder || 'rgba(0, 240, 255, 0.3)',
                color: currentEnvironment.theme.badgeText || '#00f0ff',
              }}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Career Assessment Environment: {currentEnvironment.environmentName}</span>
            </span>

            {selectedCareer && (
              <span className="text-xs font-mono text-slate-400">
                / <strong>{selectedCareer.title}</strong>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            {stage === 'select_career' && 'Select Your Career Realm'}
            {stage === 'overview' && `${selectedCareer?.title} — Entry Clearance`}
            {stage === 'testing' && `${currentEnvironment.environmentName} Testing Suite`}
            {stage === 'results' && currentEnvironment.resultTitle}
            {stage === 'gap_analysis' && 'Skill Gap Analysis & Tailored Roadmap'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
            {stage === 'select_career' &&
              'Every career track enters its own dedicated visual environment—from IDE code laboratories to multi-agent command centers and cloud infrastructure topologies.'}
            {stage === 'overview' &&
              `Prepare to enter ${currentEnvironment.environmentName}. Inspect required core competencies, tools, and assessment rigor.`}
            {stage === 'testing' &&
              `Evaluating real technical scenarios inside ${currentEnvironment.environmentName}.`}
            {stage === 'results' &&
              'Transparent scoring, category breakdowns, and conceptual takeaways calibrated to industry standards.'}
            {stage === 'gap_analysis' &&
              'Analyzes assessed proficiency against industry job requirements and prepares an adaptive personalized roadmap.'}
          </p>
        </div>

        {/* History and Back Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {historyList.length > 0 && stage !== 'testing' && (
            <button
              onClick={() => setShowHistoryModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-navy-900 border border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white transition shadow-sm"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Past Tests ({historyList.length})</span>
            </button>
          )}

          {stage !== 'select_career' && stage !== 'testing' && (
            <button
              onClick={() => setStage('select_career')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-navy-950 border border-slate-800 text-slate-400 hover:text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Switch Career</span>
            </button>
          )}
        </div>
      </div>

      {/* Progressive Disclosure Sub-Option Tabs (Visible before active test) */}
      {stage !== 'testing' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
          {[
            { id: 'overview', label: '1. Select Career & Overview', icon: Target },
            { id: 'config', label: '2. Configure Rigor & Questions', icon: Zap },
            { id: 'history', label: '3. Assessment History', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive =
              (tab.id === 'overview' && stage === 'select_career') ||
              (tab.id === 'config' && stage === 'overview');
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'history') {
                    setShowHistoryModal(true);
                  } else if (tab.id === 'overview') {
                    setStage('select_career');
                  } else if (tab.id === 'config') {
                    if (selectedCareer) {
                      handleSelectCareerForOverview(selectedCareer);
                    } else if (careers.length > 0) {
                      handleSelectCareerForOverview(careers[0]);
                    }
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isTabActive
                    ? 'bg-brand-cyan text-navy-950 shadow-glow font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* =============================================================
          STAGE 1: CAREER SELECTION SCREEN
      ============================================================= */}
      {stage === 'select_career' && (
        <div className="space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-navy-950/80 border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search career by role, stack, or tools..."
                value={careerSearch}
                onChange={(e) => setCareerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-900/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: `All Environments (${careers.length})` },
                { id: 'software', label: 'Software & Web' },
                { id: 'ai', label: 'AI, ML & Data' },
                { id: 'cloud_qa', label: 'Cloud & QA' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCareerFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    careerFilter === tab.id
                      ? 'bg-cyan-500 text-navy-950 font-bold shadow-md'
                      : 'bg-navy-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 13 Career Environment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCareers.map((c) => {
              const env = getCareerEnvironment(c.slug || c.title);
              const isSelected = selectedCareer?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCareer(c)}
                  className={`group relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'bg-navy-900/95 border-cyan-400 ring-2 ring-cyan-400/40 shadow-glow transform -translate-y-1'
                      : 'bg-navy-950/70 border-slate-800/90 hover:border-slate-600 hover:bg-navy-900/60'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Environment Badge & Market Demand */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div
                          className="text-[10px] font-mono uppercase tracking-wider font-bold"
                          style={{ color: env.theme.primary || '#00f0ff' }}
                        >
                          {env.environmentName}
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition mt-0.5">
                          {c.title}
                        </h3>
                      </div>
                      <Badge variant="success" size="xs">
                        {c.market_demand || 'High Demand'}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {c.description}
                    </p>

                    {/* Environment Visual Concept Pill */}
                    <div className="p-2 rounded-xl bg-navy-950/90 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                      <Terminal className="w-3 h-3 text-cyan-400" />
                      <span className="truncate">{env.visualConcept}</span>
                    </div>

                    {/* Core Skills Tags */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex flex-wrap gap-1">
                        {(c.core_skills || []).slice(0, 4).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-navy-900 text-slate-300 border border-slate-700/60 text-[11px]"
                          >
                            {skill}
                          </span>
                        ))}
                        {(c.core_skills || []).length > 4 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-navy-900/40 text-slate-400 text-[10px]">
                            +{(c.core_skills || []).length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      30m • 25 Qs
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCareerForOverview(c);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs bg-cyan-500 text-navy-950 hover:bg-cyan-400 transition shadow-sm"
                    >
                      <span>Enter Overview</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCareers.length === 0 && (
            <EmptyState
              title="No career tracks found"
              description="Try adjusting your search query or switching category filter."
              icon={HelpCircle}
            />
          )}
        </div>
      )}

      {/* =============================================================
          STAGE 2: CAREER ENTRY TRANSITION & ENVIRONMENT SHOWCASE
      ============================================================= */}
      {stage === 'overview' && (
        <CareerEntryTransition
          career={careerOverview || selectedCareer}
          environment={currentEnvironment}
          onStartAssessment={handleStartAssessment}
          onBack={() => setStage('select_career')}
          isLoading={isLoading}
        />
      )}

      {/* =============================================================
          STAGE 3: TIMED CAREER ASSESSMENT TEST
      ============================================================= */}
      {stage === 'testing' && currentQ && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-navy-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-lg font-mono">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-[10px] uppercase text-slate-400 tracking-wider">
                  Environment: {currentEnvironment.environmentName}
                </span>
                <div className="text-sm sm:text-base font-bold text-white font-sans">
                  {attempt?.role_title || selectedCareer?.title}
                </div>
              </div>
            </div>

            {/* Middle: Timer */}
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-navy-900 border border-slate-700">
              <Clock
                className={`w-4 h-4 ${timeRemainingSecs < 300 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}
              />
              <span
                className={`text-base sm:text-lg font-extrabold tracking-wider ${
                  timeRemainingSecs < 300 ? 'text-rose-400 animate-pulse' : 'text-white'
                }`}
              >
                {formatTimer(timeRemainingSecs)}
              </span>
              <span className="text-[10px] text-slate-400">remaining</span>
            </div>

            {/* Right: Autosave & Finish button */}
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
              <div className="text-slate-400 flex items-center gap-1.5">
                {autosaveStatus === 'saving' && (
                  <span className="text-amber-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
                  </span>
                )}
                {autosaveStatus === 'saved' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Autosaved
                  </span>
                )}
                {autosaveStatus === 'idle' && (
                  <span className="text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Cloud Sync Active
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-navy-950 hover:bg-cyan-400 transition shadow-sm"
              >
                <span>Submit Test</span>
                <CheckSquare className="w-3.5 h-3.5 font-bold" />
              </button>
            </div>
          </div>

          {/* 2-Column Assessment Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left 3 Cols: Active Question Focus Area */}
            <div className="lg:col-span-3 glass-panel p-6 sm:p-8 space-y-6">
              {/* Question Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white">
                    Question <strong className="text-cyan-400 text-base">{currentIdx + 1}</strong> of {questions.length}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-mono text-slate-300">
                    Category: <strong className="text-white">{currentQ.category}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono border ${
                      DIFFICULTY_CONFIG[currentQ.difficulty]?.color || 'text-slate-300 bg-slate-800 border-slate-700'
                    }`}
                  >
                    {DIFFICULTY_CONFIG[currentQ.difficulty]?.label || currentQ.difficulty}
                  </span>
                </div>
              </div>

              {/* DYNAMIC CAREER-SPECIFIC QUESTION FRAME (IDE, Notebook, SQL Table, Agent Mesh, Cloud VPC, etc.) */}
              <EnvironmentQuestionFrame
                environment={currentEnvironment}
                currentQ={currentQ}
                currentIdx={currentIdx}
                totalQuestions={questions.length}
                codeSnippet={currentQ.code_snippet}
                category={currentQ.category}
                difficulty={currentQ.difficulty}
                marks={currentQ.marks}
              />

              {/* Question Statement */}
              <div className="space-y-3 pt-2">
                <h2 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                  {currentQ.question}
                </h2>
              </div>

              {/* 4 Interactive Multiple-Choice Options */}
              <div className="space-y-3 pt-1">
                {currentQ.options.map((optText, optIdx) => {
                  const isSelected = answers[String(currentQ.id)] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`flex items-center gap-3.5 p-4 rounded-2xl border text-xs sm:text-sm cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 text-white font-medium ring-1 ring-cyan-400/40 shadow-glow'
                          : 'bg-navy-950/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-navy-900/50'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 font-mono text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-400 text-navy-950 shadow-md'
                            : 'border-slate-600 bg-navy-900 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>

                      <span className="flex-1 leading-relaxed">{optText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Question Footer Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleReviewFlag(currentQ.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      reviewFlags.includes(currentQ.id)
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'bg-navy-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{reviewFlags.includes(currentQ.id) ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>

                  {answers[String(currentQ.id)] !== undefined && (
                    <button
                      onClick={() => handleClearAnswer(currentQ.id)}
                      className="text-xs text-slate-400 hover:text-rose-400 transition underline underline-offset-4"
                    >
                      Clear answer
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                    disabled={currentIdx === 0}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium bg-navy-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="inline-flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-navy-950 hover:bg-cyan-400 transition shadow-md"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="inline-flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-400 text-navy-950 hover:bg-emerald-300 transition shadow-md"
                    >
                      <span>Review & Submit</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Jump Matrix Palette */}
            <div className="glass-panel p-5 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono font-bold border-b border-slate-800 pb-2">
                <span className="text-white">Question Palette</span>
                <span className="text-cyan-400">
                  {answeredCount}/{questions.length}
                </span>
              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Jump Matrix Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, qIndex) => {
                  const isCurrent = qIndex === currentIdx;
                  const isAnswered = answers[String(q.id)] !== undefined;
                  const isFlagged = reviewFlags.includes(q.id);

                  let btnStyle = 'bg-navy-950 border-slate-800 text-slate-400 hover:border-slate-600';
                  if (isCurrent) {
                    btnStyle = 'border-white text-white font-bold ring-2 ring-cyan-400';
                  } else if (isFlagged) {
                    btnStyle = 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold';
                  } else if (isAnswered) {
                    btnStyle = 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(qIndex)}
                      className={`relative h-9 rounded-xl text-xs font-mono flex items-center justify-center border transition-all ${btnStyle}`}
                    >
                      <span>{qIndex + 1}</span>
                      {isFlagged && <Flag className="w-2 h-2 text-amber-400 absolute top-1 right-1" />}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-cyan-500/20 border border-cyan-500/50" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-amber-500/20 border border-amber-500/60" />
                  <span>Marked for Review ({flaggedCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-navy-950 border border-slate-800" />
                  <span>Unanswered ({unansweredCount})</span>
                </div>
              </div>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-navy-900 hover:bg-cyan-500 hover:text-navy-950 text-slate-200 border border-slate-700 transition"
              >
                Finish Assessment
              </button>
            </div>
          </div>

          {/* Pre-submission confirmation modal */}
          {showSubmitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn">
              <div className="glass-panel max-w-md w-full p-6 space-y-5 border border-cyan-500/40 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Confirm Assessment Submission</h3>
                    <p className="text-xs text-slate-400 font-mono">{currentEnvironment.environmentName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center p-3 rounded-xl bg-navy-950 border border-slate-800 font-mono">
                  <div>
                    <div className="text-lg font-bold text-cyan-400">{answeredCount}</div>
                    <div className="text-[10px] text-slate-400">Answered</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-400">{flaggedCount}</div>
                    <div className="text-[10px] text-slate-400">Flagged</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-rose-400">{unansweredCount}</div>
                    <div className="text-[10px] text-slate-400">Unanswered</div>
                  </div>
                </div>

                {unansweredCount > 0 && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>
                      You have <strong>{unansweredCount} unanswered questions</strong>. They will receive 0 marks.
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-navy-900 border border-slate-700 text-slate-300 hover:text-white transition"
                  >
                    Back to Test
                  </button>

                  <button
                    onClick={() => handleSubmitAssessment(false)}
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-navy-950 hover:bg-cyan-400 transition shadow-glow disabled:opacity-50"
                  >
                    {isSubmitting ? 'Evaluating...' : 'Confirm Submission'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =============================================================
          STAGE 4: CAREER-SPECIFIC ASSESSMENT EVALUATION RESULTS
      ============================================================= */}
      {stage === 'results' && evaluationResult && (
        <CareerResultScorecard
          evaluationResult={evaluationResult}
          environment={currentEnvironment}
          career={selectedCareer}
          attemptId={attempt?.attempt_id}
          previousAttemptId={previousAttemptId}
          onRetake={handleStartAssessment}
          onProceedToGapAnalysis={handleProceedToGapAnalysis}
        />
      )}

      {/* =============================================================
          STAGE 5: SKILL GAP REPORT & TAILORED ROADMAP
      ============================================================= */}
      {stage === 'gap_analysis' && gapReport && (
        <CareerGapRoadmapSection
          gapReport={gapReport}
          environment={currentEnvironment}
          career={selectedCareer}
          roadmapWeeklyHours={roadmapWeeklyHours}
          setRoadmapWeeklyHours={setRoadmapWeeklyHours}
          roadmapDurationWeeks={roadmapDurationWeeks}
          setRoadmapDurationWeeks={setRoadmapDurationWeeks}
          isGeneratingRoadmap={isGeneratingRoadmap}
          onGenerateRoadmap={handleGeneratePersonalizedRoadmap}
          onBackToResults={() => setStage('results')}
        />
      )}

      {/* =============================================================
          PAST ATTEMPTS HISTORY MODAL
      ============================================================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel max-w-2xl w-full p-6 space-y-4 border border-slate-700 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Assessment Attempt History</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs font-mono text-slate-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {historyList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">{item.role_title}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Attempt #{item.id} • {item.started_at ? new Date(item.started_at).toLocaleDateString() : 'Recent'} • {Math.round((item.time_spent_secs || 0) / 60)} mins
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <div className="text-base font-bold text-cyan-400">
                        {item.score_percentage !== null ? `${item.score_percentage}%` : 'In Progress'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.proficiency_level || 'Evaluating'}
                      </div>
                    </div>

                    {item.status === 'evaluated' && (
                      <button
                        onClick={() => handleLoadPastAttempt(item)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-navy-950 transition"
                      >
                        Inspect
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {historyList.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 font-mono">
                  No previous assessment attempts recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillAssessmentPage;
