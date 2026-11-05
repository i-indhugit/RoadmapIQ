import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Zap,
  BookOpen,
  Award,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Layers,
  FileCheck2,
  CheckSquare,
  Square,
  RotateCcw,
  Code,
  Terminal,
  HelpCircle,
  Dumbbell,
  Hammer,
  Bot,
  Send,
  Loader2,
  RotateCw,
  Eye,
  EyeOff,
  Flame,
  Check,
  AlertCircle,
  Briefcase,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { getSkillEnvironment } from '../../utils/careerThemes';
import { aiApi } from '../../services/api';

const CheckpointDrawer = ({
  checkpoint,
  role,
  roadmap,
  onClose,
  onCompleteCheckpoint,
  onUncompleteCheckpoint,
  isCompleting = false,
  soundEnabled = true,
}) => {
  // Navigation tabs: 'learn' | 'practice' | 'ai_tutor' | 'build' | 'evaluate'
  const [activeTab, setActiveTab] = useState('learn');

  // Learner verification state
  const [evidenceLink, setEvidenceLink] = useState('');
  const [hoursSpent, setHoursSpent] = useState(4);
  const [studiedMaterials, setStudiedMaterials] = useState(false);
  const [completedPractical, setCompletedPractical] = useState(false);
  const [builtDeliverable, setBuiltDeliverable] = useState(false);

  // AI Tutor state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [activeTutorAction, setActiveTutorAction] = useState('explain');
  const [customPrompt, setCustomPrompt] = useState('');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [tutorQuizAnswers, setTutorQuizAnswers] = useState({});
  const [tutorQuizSubmitted, setTutorQuizSubmitted] = useState(false);

  // Practice tab hint reveals
  const [revealedHints, setRevealedHints] = useState({});

  // Evaluate tab quiz state
  const [evalAnswers, setEvalAnswers] = useState({});
  const [evalSubmitted, setEvalSubmitted] = useState(false);
  const [evalScore, setEvalScore] = useState(null);

  // Sync state when checkpoint changes
  useEffect(() => {
    if (checkpoint) {
      setEvidenceLink(checkpoint.evidence_link || '');
      setHoursSpent(checkpoint.actual_hours_spent || checkpoint.estimated_hours || 4);
      const done = Boolean(checkpoint.is_completed);
      setStudiedMaterials(done);
      setCompletedPractical(done);
      setBuiltDeliverable(done);
      setActiveTab('learn');
      setAiResponse(null);
      setRevealedHints({});
      setEvalAnswers({});
      setEvalSubmitted(false);
      setEvalScore(null);
    }
  }, [checkpoint]);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!checkpoint) return null;

  const roleTitle = role?.title || checkpoint.role_title || roadmap?.role_title || 'Career Professional';
  const domain = role?.domain || checkpoint.domain || checkpoint.category || 'Technology';
  const env = getSkillEnvironment(checkpoint.category || checkpoint.skill_category);

  const isLocked = checkpoint.status === 'locked';
  const isCompleted = checkpoint.status === 'completed' || checkpoint.is_completed;
  const isInProgress = checkpoint.status === 'in_progress';

  // Parse workspace_data safely
  const wsData = useMemo(() => {
    if (!checkpoint.workspace_data) return {};
    if (typeof checkpoint.workspace_data === 'string') {
      try {
        return JSON.parse(checkpoint.workspace_data);
      } catch (e) {
        return {};
      }
    }
    return checkpoint.workspace_data;
  }, [checkpoint.workspace_data]);

  const learnData = wsData.learn || {};
  const practiceData = wsData.practice || {};
  const buildData = wsData.build || {};
  const evaluateData = wsData.evaluate || {};

  // Resolved resources
  const resourcesList = useMemo(() => {
    if (learnData.resources && Array.isArray(learnData.resources) && learnData.resources.length > 0) {
      return learnData.resources;
    }
    if (checkpoint.resources && Array.isArray(checkpoint.resources) && checkpoint.resources.length > 0) {
      return checkpoint.resources;
    }
    return [
      {
        title: `Official Guide to ${checkpoint.title || checkpoint.name}`,
        provider: 'Verified Industry Standard',
        type: 'Documentation',
        url: 'https://en.wikipedia.org/wiki/Portal:Contents',
        is_free: true,
      },
      {
        title: `${checkpoint.title || checkpoint.name} Deep Dive & Best Practices`,
        provider: 'Open Education Consortium',
        type: 'Interactive Guide',
        url: 'https://www.coursera.org',
        is_free: true,
      },
    ];
  }, [learnData.resources, checkpoint.resources, checkpoint.title, checkpoint.name]);

  // Can verify rule
  const canVerify = studiedMaterials && completedPractical;

  const handleComplete = () => {
    if (isCompleted || isLocked || isCompleting) return;
    onCompleteCheckpoint(checkpoint, {
      evidenceLink,
      actualHours: parseFloat(hoursSpent) || checkpoint.estimated_hours || 4,
    });
  };

  const handleUncomplete = () => {
    if (onUncompleteCheckpoint && isCompleted && !isCompleting) {
      onUncompleteCheckpoint(checkpoint);
    }
  };

  // Trigger AI Tutor API call
  const triggerAITutor = async (action, queryText = '') => {
    setAiLoading(true);
    setActiveTutorAction(action);
    setIsFlipped(false);
    setFlashcardIndex(0);
    setTutorQuizSubmitted(false);
    setTutorQuizAnswers({});

    try {
      const res = await aiApi.getMilestoneTutor({
        milestone_title: checkpoint.title || checkpoint.name,
        role_title: roleTitle,
        domain: domain,
        action: action,
        query: queryText || customPrompt,
      });
      setAiResponse(res.data);
    } catch (err) {
      console.error('Milestone AI Tutor request failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleHint = (key) => {
    setRevealedHints((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle Diagnostic Quiz Submission in Evaluate tab
  const handleEvaluateQuizSubmit = () => {
    const quizList = evaluateData.checkpoint_quiz || [];
    if (quizList.length === 0) return;
    let correct = 0;
    quizList.forEach((q, idx) => {
      const userAns = evalAnswers[idx];
      const correctOpt = q.correct_option || 'a';
      if (userAns === correctOpt) correct++;
    });
    setEvalScore({ correct, total: quizList.length });
    setEvalSubmitted(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[59] bg-navy-950/70 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-2xl bg-navy-950/98 backdrop-blur-2xl border-l border-slate-700/80 shadow-2xl flex flex-col overflow-hidden animate-slideInRight">
      {/* 1. Header Toolbar */}
      <div className="p-4 sm:p-5 bg-navy-900/90 border-b border-slate-800 flex items-start justify-between gap-3 shrink-0">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${env.badgeClass}`}>
              {env.name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-800 border border-slate-700 text-slate-300">
              Phase {checkpoint.stageNumber || checkpoint.phase_number || 1}
            </span>
            {checkpoint.activity_method && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-semibold">
                {checkpoint.activity_method.replace('_', ' ').toUpperCase()}
              </span>
            )}
            {isCompleted ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Mastered
              </span>
            ) : isLocked ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold flex items-center gap-1">
                <Unlock className="w-3 h-3" /> Available
              </span>
            )}
          </div>

          <h2 className="text-base sm:text-xl font-extrabold text-slate-100 truncate flex items-center gap-2">
            <span>{checkpoint.name || checkpoint.title}</span>
          </h2>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <Briefcase className="w-3.5 h-3.5 text-brand-cyan" />
              {roleTitle}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              ~{checkpoint.estimated_hours || 4}h study
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors shrink-0"
          title="Close Workspace"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. 5-Tab Workspace Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-navy-900/60 px-3 py-1.5 overflow-x-auto scrollbar-none shrink-0 gap-1">
        <button
          onClick={() => setActiveTab('learn')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'learn'
              ? 'bg-brand-cyan text-navy-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>1. Learn</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'practice'
              ? 'bg-brand-cyan text-navy-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>2. Practice</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('ai_tutor');
            if (!aiResponse) {
              triggerAITutor('explain');
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ai_tutor'
              ? 'bg-purple-500 text-white shadow-md font-extrabold shadow-purple-500/20'
              : 'text-purple-300 hover:text-purple-100 hover:bg-purple-950/40'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>3. AI Tutor</span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
        </button>

        <button
          onClick={() => setActiveTab('build')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'build'
              ? 'bg-brand-cyan text-navy-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
          }`}
        >
          <Hammer className="w-3.5 h-3.5" />
          <span>4. Build</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluate')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'evaluate'
              ? 'bg-brand-cyan text-navy-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>5. Evaluate</span>
        </button>
      </div>

      {/* 3. Scrollable Tab Content Body */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs sm:text-sm scrollbar-thin scrollbar-thumb-slate-700">
        {/* Unmet Prerequisites Warning Callout */}
        {isLocked && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Skill Locked by Prerequisites</span>
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              {checkpoint.lockReason || 'Before you can verify this milestone, complete the upstream prerequisites:'}
            </p>
            {checkpoint.unmet_prerequisites && checkpoint.unmet_prerequisites.length > 0 && (
              <ul className="list-disc list-inside font-semibold space-y-1 text-rose-300 text-xs">
                {checkpoint.unmet_prerequisites.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 1: LEARN (Explanations, Workflow Diagram, Authentic Free Resources)
           ========================================================================= */}
        {activeTab === 'learn' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Concept Explanation */}
            <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-2.5">
              <h3 className="font-mono text-xs uppercase tracking-wider text-brand-cyan font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Concept Foundation & Industry Context</span>
              </h3>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                {learnData.explanation ||
                  checkpoint.description ||
                  `Mastering '${checkpoint.title || checkpoint.name}' is essential for high-impact performance as a ${roleTitle}. Practitioners leverage this skill to solve complex operational challenges and meet production benchmarks.`}
              </p>
            </div>

            {/* Workflow Diagram */}
            {learnData.workflow_diagram && (
              <div className="p-4 rounded-2xl bg-navy-950 border border-cyan-500/20 space-y-2">
                <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Execution Workflow Architecture</span>
                </h4>
                <div className="p-3 rounded-xl bg-navy-900/90 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto leading-tight whitespace-pre">
                  {learnData.workflow_diagram}
                </div>
              </div>
            )}

            {/* Core Objectives Summary */}
            <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Milestone Takeaways</span>
              </h4>
              <div className="text-xs text-slate-300 space-y-1.5 whitespace-pre-line leading-relaxed">
                {learnData.summary ||
                  `• Core Objective: Implement and validate ${checkpoint.title || checkpoint.name} principles.\n• Professional Application: Integral to ${roleTitle} day-to-day assignments.\n• Target Output: Production-ready documentation and verifiable artifacts.`}
              </div>
            </div>

            {/* Verified Free Learning Resources */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Verified Free Resources</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  100% Free & Open
                </span>
              </div>

              <div className="space-y-2">
                {resourcesList.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-navy-900/80 hover:bg-navy-850 border border-slate-800 hover:border-brand-cyan/50 transition-all group"
                  >
                    <div className="flex items-center gap-3 truncate min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan shrink-0 group-hover:scale-125 transition-transform" />
                      <div className="truncate">
                        <p className="text-slate-100 group-hover:text-brand-cyan font-bold text-xs sm:text-sm truncate">
                          {res.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-400">
                          <span className="text-cyan-400">{res.provider || 'Verified Standard'}</span>
                          <span>•</span>
                          <span className="capitalize">{res.type || 'Interactive'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        FREE
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-cyan transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: PRACTICE (Beginner, Intermediate, Advanced & Scenario Drills)
           ========================================================================= */}
        {activeTab === 'practice' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3.5 rounded-2xl bg-navy-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-brand-cyan" />
                <span>Domain Hands-On Drills</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {practiceData.method ? practiceData.method.replace('_', ' ').toUpperCase() : 'PRACTICAL DRILLS'}
              </span>
            </div>

            {/* Beginner Drill */}
            <div className="p-4 rounded-2xl bg-navy-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Level 1: Beginner Foundation Drill
                </span>
                <button
                  onClick={() => toggleHint('beginner')}
                  className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  {revealedHints['beginner'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{revealedHints['beginner'] ? 'Hide Hint' : 'Hint'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200">
                {practiceData.beginner ||
                  practiceData.exercises?.beginner ||
                  `Draft a clean, basic implementation demonstrating the core mechanics of ${checkpoint.title || checkpoint.name}.`}
              </p>
              {revealedHints['beginner'] && (
                <div className="p-3 rounded-xl bg-navy-950 border border-emerald-500/30 text-[11px] text-emerald-300">
                  💡 <strong>Hint:</strong> Focus on clear naming, basic syntax/input validation, and verify outputs against the simplest test case before adding complexity.
                </div>
              )}
            </div>

            {/* Intermediate Drill */}
            <div className="p-4 rounded-2xl bg-navy-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Level 2: Intermediate Production Drill
                </span>
                <button
                  onClick={() => toggleHint('intermediate')}
                  className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  {revealedHints['intermediate'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{revealedHints['intermediate'] ? 'Hide Hint' : 'Hint'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200">
                {practiceData.intermediate ||
                  practiceData.exercises?.intermediate ||
                  `Refactor your approach to handle edge cases, error conditions, boundary inputs, and structured logging.`}
              </p>
              {revealedHints['intermediate'] && (
                <div className="p-3 rounded-xl bg-navy-950 border border-amber-500/30 text-[11px] text-amber-300">
                  💡 <strong>Hint:</strong> Formulate three negative test cases (malformed input, null boundary, network/persistence timeout) and handle them gracefully.
                </div>
              )}
            </div>

            {/* Advanced Drill */}
            <div className="p-4 rounded-2xl bg-navy-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Level 3: Advanced Optimization Drill
                </span>
                <button
                  onClick={() => toggleHint('advanced')}
                  className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  {revealedHints['advanced'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{revealedHints['advanced'] ? 'Hide Hint' : 'Hint'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200">
                {practiceData.advanced ||
                  practiceData.exercises?.advanced ||
                  `Benchmark efficiency, verify security/compliance constraints, and design automated regression tests.`}
              </p>
              {revealedHints['advanced'] && (
                <div className="p-3 rounded-xl bg-navy-950 border border-rose-500/30 text-[11px] text-rose-300">
                  💡 <strong>Hint:</strong> Evaluate Big-O algorithmic or financial sensitivity trade-offs. Ensure zero memory leak and 100% adherence to domain safety standards.
                </div>
              )}
            </div>

            {/* Workplace Scenario Challenge */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-navy-900 to-cyan-950/40 border border-purple-500/30 space-y-2">
              <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-purple-400" />
                Workplace Scenario Challenge
              </span>
              <p className="text-xs sm:text-sm text-slate-100 font-medium">
                {practiceData.scenario ||
                  practiceData.exercises?.scenario ||
                  `A critical client deliverable or service for ${roleTitle} exhibits unexpected friction. Formulate an incident review, isolate root causes, and patch the workflow.`}
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: AI TUTOR (Explain, Revision Notes, Flashcards, Diagnostic Quiz, Chat)
           ========================================================================= */}
        {activeTab === 'ai_tutor' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Quick Action Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => triggerAITutor('explain')}
                disabled={aiLoading}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                  activeTutorAction === 'explain'
                    ? 'bg-purple-950/70 border-purple-400 text-purple-200 ring-1 ring-purple-400'
                    : 'bg-navy-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono text-purple-400 mb-0.5">💡 INTUITION</div>
                <div>Deep Dive</div>
              </button>

              <button
                onClick={() => triggerAITutor('notes')}
                disabled={aiLoading}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                  activeTutorAction === 'notes'
                    ? 'bg-purple-950/70 border-purple-400 text-purple-200 ring-1 ring-purple-400'
                    : 'bg-navy-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono text-cyan-400 mb-0.5">📝 CHEAT SHEET</div>
                <div>Revision Notes</div>
              </button>

              <button
                onClick={() => triggerAITutor('flashcards')}
                disabled={aiLoading}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                  activeTutorAction === 'flashcards'
                    ? 'bg-purple-950/70 border-purple-400 text-purple-200 ring-1 ring-purple-400'
                    : 'bg-navy-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono text-amber-400 mb-0.5">🗂️ RECALL</div>
                <div>Flashcards</div>
              </button>

              <button
                onClick={() => triggerAITutor('quiz')}
                disabled={aiLoading}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                  activeTutorAction === 'quiz'
                    ? 'bg-purple-950/70 border-purple-400 text-purple-200 ring-1 ring-purple-400'
                    : 'bg-navy-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono text-emerald-400 mb-0.5">🎯 RAPID CHECK</div>
                <div>3-Q Quiz</div>
              </button>
            </div>

            {/* Custom Query Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customPrompt.trim()) triggerAITutor('custom', customPrompt.trim());
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Ask AI Tutor about ${checkpoint.title || 'this milestone'}...`}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="flex-1 bg-navy-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                disabled={aiLoading || !customPrompt.trim()}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-colors"
                title="Send Question"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* AI Tutor Output Container */}
            {aiLoading ? (
              <div className="p-8 rounded-2xl bg-navy-900/60 border border-slate-800 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                <p className="text-xs text-slate-300 font-mono">
                  Synthesizing personalized guidance with Google Gemini...
                </p>
              </div>
            ) : aiResponse ? (
              <div className="space-y-4">
                {/* Mode: Flashcards */}
                {activeTutorAction === 'flashcards' && aiResponse.flashcards && aiResponse.flashcards.length > 0 ? (
                  <div className="p-5 rounded-2xl bg-navy-900/80 border border-purple-500/30 space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>
                        Card {flashcardIndex + 1} of {aiResponse.flashcards.length}
                      </span>
                      <span>Click to flip card</span>
                    </div>

                    {/* Interactive 3D/Flipping Flashcard */}
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className={`min-h-[160px] p-6 rounded-2xl border cursor-pointer flex flex-col justify-center items-center text-center transition-all duration-300 select-none shadow-xl ${
                        isFlipped
                          ? 'bg-purple-950/90 border-purple-400 text-purple-100 shadow-purple-500/20'
                          : 'bg-navy-950 border-slate-700 text-slate-100 hover:border-cyan-400 shadow-slate-900/40'
                      }`}
                    >
                      <div className="text-[10px] font-mono uppercase tracking-wider mb-2 text-cyan-400">
                        {isFlipped ? 'Answer & Mechanism' : 'Concept Question (Front)'}
                      </div>
                      <p className="text-sm sm:text-base font-bold leading-relaxed">
                        {isFlipped
                          ? aiResponse.flashcards[flashcardIndex].back
                          : aiResponse.flashcards[flashcardIndex].front}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : aiResponse.flashcards.length - 1));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-navy-800 border border-slate-700 text-xs text-slate-300 hover:text-slate-100"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="px-3 py-1.5 rounded-lg bg-purple-900/50 border border-purple-500/40 text-xs text-purple-200 font-bold"
                      >
                        Flip
                      </button>
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setFlashcardIndex((prev) => (prev < aiResponse.flashcards.length - 1 ? prev + 1 : 0));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-navy-800 border border-slate-700 text-xs text-slate-300 hover:text-slate-100"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : activeTutorAction === 'quiz' && aiResponse.quiz && aiResponse.quiz.length > 0 ? (
                  /* Mode: Tutor Quiz */
                  <div className="space-y-4">
                    {aiResponse.quiz.map((q, idx) => {
                      const userPick = tutorQuizAnswers[idx];
                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-3">
                          <p className="text-xs sm:text-sm font-bold text-slate-100">
                            {idx + 1}. {q.question}
                          </p>
                          <div className="space-y-1.5">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = userPick === optIdx;
                              const isCorrect = optIdx === q.correct_index;
                              let btnClass = 'bg-navy-950 border-slate-800 text-slate-300 hover:border-slate-700';
                              if (tutorQuizSubmitted) {
                                if (isCorrect) btnClass = 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold';
                                else if (isSelected) btnClass = 'bg-rose-950/80 border-rose-400 text-rose-200';
                              } else if (isSelected) {
                                btnClass = 'bg-purple-950/70 border-purple-400 text-purple-200 font-bold';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => {
                                    if (!tutorQuizSubmitted) {
                                      setTutorQuizAnswers((prev) => ({ ...prev, [idx]: optIdx }));
                                    }
                                  }}
                                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors flex items-center justify-between ${btnClass}`}
                                >
                                  <span>{opt}</span>
                                  {tutorQuizSubmitted && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                </button>
                              );
                            })}
                          </div>

                          {tutorQuizSubmitted && (
                            <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-[11px] text-slate-300">
                              💡 <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="pt-2">
                      {!tutorQuizSubmitted ? (
                        <button
                          onClick={() => setTutorQuizSubmitted(true)}
                          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                        >
                          Check Quiz Answers
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setTutorQuizSubmitted(false);
                            setTutorQuizAnswers({});
                          }}
                          className="w-full py-2.5 rounded-xl bg-navy-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Retry Quiz</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Mode: Markdown Explanation or Notes */
                  <div className="p-4 sm:p-5 rounded-2xl bg-navy-900/80 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>AI Guidance: {aiResponse.action?.toUpperCase()}</span>
                      </span>
                      {aiResponse.is_ai_generated && (
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                          Gemini 2.5 Active
                        </span>
                      )}
                    </div>

                    <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-2">
                      {aiResponse.content}
                    </div>

                    {aiResponse.key_takeaways && aiResponse.key_takeaways.length > 0 && (
                      <div className="pt-3 border-t border-slate-800 space-y-1.5">
                        <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                          Key Memory Takeaways:
                        </span>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                          {aiResponse.key_takeaways.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Verified Centralized RAG Sources */}
                {aiResponse.sources && aiResponse.sources.length > 0 && (
                  <div className="p-4 rounded-2xl bg-navy-950/90 border border-cyan-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>Curriculum & Statutory References ({aiResponse.sources.length})</span>
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-700/40">
                        RAG Grounded
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {aiResponse.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 hover:border-cyan-400/60 transition-all flex flex-col justify-between group"
                        >
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                              {s.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block truncate">
                              Authority: {s.provider}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-800 text-[10px] text-cyan-400">
                            <span>{s.category ? s.category.replace('_', ' ') : 'Reference'}</span>
                            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* =========================================================================
            TAB 4: BUILD (Deliverable brief, Rubrics & Proof of Work submission)
           ========================================================================= */}
        {activeTab === 'build' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Project Simulation Brief */}
            <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-2.5">
              <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <Hammer className="w-4 h-4 text-brand-cyan" />
                <span>Deliverable Brief</span>
              </span>
              <h4 className="text-sm font-bold text-slate-100">
                {buildData.title || `Practical Deliverable: ${checkpoint.title || checkpoint.name}`}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {buildData.brief ||
                  `Act as an industry practitioner in ${roleTitle}. Produce a high-quality verifiable deliverable adhering to professional standards.`}
              </p>
              <div className="p-2.5 rounded-xl bg-navy-950 border border-cyan-500/30 text-xs text-cyan-300 font-mono">
                Deliverable Format: {buildData.deliverable_format || checkpoint.deliverable || 'Portfolio Link / Working File'}
              </div>
            </div>

            {/* Rubrics Checklist */}
            <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-2.5">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Industry Evaluation Rubrics</span>
              </span>
              <div className="space-y-2">
                {(buildData.evaluation_rubrics || [
                  'Complete implementation meeting requirements',
                  'Clear documentation and assumptions logged',
                  'Validation against edge cases and standards',
                ]).map((rubric, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                    <span>{rubric}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Proof of Work Submission Field */}
            <div className="p-4 rounded-2xl bg-navy-900 border border-cyan-500/30 space-y-3">
              <label className="block text-xs font-bold text-slate-200">
                Link Your Proof of Work (GitHub, Figma, Google Drive, or Demo):
              </label>
              <input
                type="url"
                placeholder="https://github.com/... or https://figma.com/file/..."
                value={evidenceLink}
                onChange={(e) => setEvidenceLink(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 text-xs rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-cyan"
              />
              <p className="text-[11px] text-slate-400">
                Verified proof links appear on your <strong>My Growth</strong> skill portfolio.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: EVALUATE (Diagnostic Quiz, Verification Checklist, Time Tracker)
           ========================================================================= */}
        {activeTab === 'evaluate' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Checkpoint Diagnostic Quiz */}
            {evaluateData.checkpoint_quiz && evaluateData.checkpoint_quiz.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-bold flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-brand-cyan" />
                    <span>Checkpoint Diagnostic Quiz</span>
                  </h4>
                  {evalSubmitted && evalScore && (
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Score: {evalScore.correct} / {evalScore.total}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {evaluateData.checkpoint_quiz.map((q, idx) => {
                    const userPick = evalAnswers[idx];
                    const correctKey = q.correct_option || 'a';
                    const opts = q.options || {};

                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-2.5">
                        <p className="text-xs font-bold text-slate-100">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="space-y-1.5">
                          {Object.entries(opts).map(([key, label]) => {
                            const isChosen = userPick === key;
                            const isRight = key === correctKey;
                            let style = 'bg-navy-950 border-slate-800 text-slate-300 hover:border-slate-700';
                            if (evalSubmitted) {
                              if (isRight) style = 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold';
                              else if (isChosen) style = 'bg-rose-950/80 border-rose-400 text-rose-200';
                            } else if (isChosen) {
                              style = 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-bold';
                            }

                            return (
                              <button
                                key={key}
                                onClick={() => {
                                  if (!evalSubmitted) {
                                    setEvalAnswers((prev) => ({ ...prev, [idx]: key }));
                                  }
                                }}
                                className={`w-full text-left p-2 rounded-xl border text-xs transition-colors flex items-center justify-between ${style}`}
                              >
                                <span>
                                  <strong>{key.toUpperCase()}.</strong> {label}
                                </span>
                                {evalSubmitted && isRight && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                              </button>
                            );
                          })}
                        </div>

                        {evalSubmitted && q.explanation && (
                          <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-[11px] text-slate-300">
                            💡 {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!evalSubmitted ? (
                  <button
                    onClick={handleEvaluateQuizSubmit}
                    disabled={Object.keys(evalAnswers).length < evaluateData.checkpoint_quiz.length}
                    className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-cyan-500/40 text-cyan-300 font-bold text-xs disabled:opacity-50 transition-all"
                  >
                    Submit Quiz Evaluation
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEvalSubmitted(false);
                      setEvalAnswers({});
                      setEvalScore(null);
                    }}
                    className="w-full py-2 rounded-xl bg-navy-900 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono"
                  >
                    Reset Quiz
                  </button>
                )}
              </div>
            )}

            {/* Learner Verification Checklist */}
            {!isCompleted && !isLocked && (
              <div className="p-4 rounded-2xl bg-navy-900 border border-brand-cyan/40 space-y-3 shadow-lg">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-cyan" />
                  <span>Learner Verification Checklist</span>
                </h4>
                <div className="space-y-2.5">
                  <label
                    onClick={() => setStudiedMaterials(!studiedMaterials)}
                    className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none hover:text-slate-100"
                  >
                    {studiedMaterials ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <span>I have reviewed the learning resources, concepts, and diagrams.</span>
                  </label>

                  <label
                    onClick={() => setCompletedPractical(!completedPractical)}
                    className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none hover:text-slate-100"
                  >
                    {completedPractical ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <span>I have completed the hands-on practice drills or scenario challenge.</span>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Actual Hours Logged:</span>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={hoursSpent}
                    onChange={(e) => setHoursSpent(e.target.value)}
                    className="w-20 bg-navy-950 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-100 font-mono text-right focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>
            )}

            {/* Completed Badge Summary */}
            {isCompleted && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Milestone Mastered & Verified</span>
                </div>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  This skill checkpoint is completed and recorded to your permanent career portfolio. Downstream
                  prerequisites in this branch are unlocked.
                </p>
                {checkpoint.actual_hours_spent && (
                  <p className="text-[11px] font-mono text-emerald-400/90 pt-1">
                    Hours Logged: {checkpoint.actual_hours_spent} hours
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Bottom Action Footer */}
      <div className="p-4 sm:p-5 bg-navy-900/95 border-t border-slate-800 shrink-0 flex items-center justify-between gap-3">
        {isCompleted ? (
          <div className="w-full flex items-center gap-2">
            <button
              onClick={handleUncomplete}
              disabled={isCompleting}
              className="py-2.5 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              title="Mark incomplete to review again"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
            <div className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Milestone Mastered</span>
            </div>
          </div>
        ) : isLocked ? (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-500 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Complete Upstream Prerequisites to Unlock</span>
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={isCompleting || !canVerify}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              canVerify
                ? 'btn-primary shadow-glow-cyan cursor-pointer'
                : 'bg-navy-800 border border-slate-700 text-slate-400 cursor-not-allowed opacity-80'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isCompleting
                ? 'Saving to Backend...'
                : canVerify
                ? 'Complete & Verify Milestone'
                : 'Check Requirements in Evaluate Tab to Verify'}
            </span>
          </button>
        )}
      </div>
    </div>
    </>
  );
};

export default CheckpointDrawer;
