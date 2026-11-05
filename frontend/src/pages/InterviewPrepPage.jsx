import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { interviewApi, aiApi } from '../services/api';
import {
  MessageSquareCode,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  HelpCircle,
  Send,
  RefreshCw,
  ThumbsUp,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { SkeletonCard } from '../components/common/LoadingSkeleton';

const categories = ['All Categories', 'DSA', 'Core CS', 'Technical', 'HR/Behavioral'];

const InterviewPrepPage = () => {
  const { profile, activeRole, addToast } = useApp();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  // Mock Practice & Feedback State
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [practicingQuestion, setPracticingQuestion] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState(null);

  // Gemini AI Question Generation state
  const [generatingAiQuestions, setGeneratingAiQuestions] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState([]);

  const handleGenerateAiQuestions = async () => {
    setGeneratingAiQuestions(true);
    try {
      const res = await aiApi.generateInterviewQuestions({
        role_title: activeRole?.title || 'Software Development Engineer',
        category: selectedCategory !== 'All Categories' ? selectedCategory : 'Technical',
        difficulty: 'Intermediate',
      });
      if (res?.questions) {
        setAiGeneratedQuestions(res.questions);
        addToast('success', `Generated ${res.questions.length} questions for ${res.role_title} with Gemini!`, 'AI Generator');
      }
    } catch (err) {
      addToast('error', err.message || 'Failed to generate AI interview questions.', 'AI Error');
    } finally {
      setGeneratingAiQuestions(false);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
        role_id: activeRole?.id || profile?.target_role_id || undefined,
      };
      const data = await interviewApi.getQuestions(params);
      setQuestions(data);
    } catch (err) {
      addToast('error', 'Could not load interview question bank.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, activeRole, profile]);

  const handleToggleComplete = async (question) => {
    const nextStatus = !question.is_completed;
    try {
      await interviewApi.updateStatus(question.id, { is_completed: nextStatus });
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? { ...q, is_completed: nextStatus } : q))
      );
      addToast('success', nextStatus ? 'Question marked as mastered!' : 'Marked as uncompleted.', 'Status');
    } catch {
      addToast('error', 'Failed to update question status.', 'Error');
    }
  };

  const handleToggleBookmark = async (question) => {
    const nextStatus = !question.is_bookmarked;
    try {
      await interviewApi.updateStatus(question.id, { is_bookmarked: nextStatus });
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? { ...q, is_bookmarked: nextStatus } : q))
      );
      addToast('success', nextStatus ? 'Bookmarked for revision.' : 'Bookmark removed.', 'Bookmark');
    } catch {
      addToast('error', 'Failed to update bookmark.', 'Error');
    }
  };

  const handleOpenPractice = (question) => {
    setPracticingQuestion(question);
    setStudentAnswer('');
    setFeedbackResult(null);
    setPracticeModalOpen(true);
  };

  const handleSubmitPractice = async (e) => {
    e.preventDefault();
    if (!studentAnswer.trim() || submittingFeedback) return;

    setSubmittingFeedback(true);
    try {
      const res = await interviewApi.getFeedback({
        question_id: practicingQuestion.id,
        question_title: practicingQuestion.title,
        question_text: practicingQuestion.question,
        student_answer: studentAnswer,
        target_role: activeRole?.title || 'Software Engineering',
      });
      setFeedbackResult(res);
      addToast('success', 'AI interview evaluation complete!', 'Feedback Ready');
    } catch (err) {
      addToast('error', 'Failed to generate interview evaluation.', 'Evaluation Error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const completedQuestionsCount = questions.filter((q) => q.is_completed).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <Badge variant="primary" className="mb-2">Placement Mock Sandbox</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <span>Interview Preparation & AI Evaluation</span>
          <MessageSquareCode className="w-6 h-6 text-brand-cyan" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          High-frequency DSA patterns, Core CS principles, and behavioral STAR questions with interactive AI rubric grading.
        </p>
      </div>

      {/* Progress & Category Filter Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-cyan text-navy-950 font-bold shadow-glow-cyan/20'
                  : 'bg-navy-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mastered Metric & Gemini Generator */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleGenerateAiQuestions}
            disabled={generatingAiQuestions}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg btn-primary text-xs font-semibold shadow-glow-cyan/20 transition disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${generatingAiQuestions ? 'animate-spin' : ''}`} />
            <span>{generatingAiQuestions ? 'Generating...' : 'Gemini AI Practice'}</span>
          </button>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span>Mastery:</span>
            <span className="font-bold text-emerald-400">{completedQuestionsCount}</span>
            <span>/</span>
            <span>{questions.length} questions</span>
          </div>
        </div>
      </div>

      {/* Gemini AI Generated Practice Questions Panel */}
      {aiGeneratedQuestions.length > 0 && (
        <div className="glass-panel p-5 space-y-4 border-cyan-500/40">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Gemini Custom Placement Questions ({aiGeneratedQuestions.length})</span>
                <Badge variant="primary" size="xs">Google Gemini</Badge>
              </h2>
            </div>
            <button
              onClick={() => setAiGeneratedQuestions([])}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Dismiss
            </button>
          </div>

          <div className="space-y-3">
            {aiGeneratedQuestions.map((aiQ, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-navy-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {aiQ.category || 'Technical'} • {aiQ.difficulty || 'Intermediate'}
                  </span>
                  <button
                    onClick={() => handleOpenPractice({
                      id: `ai-${idx}`,
                      title: `Gemini Question ${idx + 1}`,
                      question: aiQ.question,
                    })}
                    className="btn-primary text-[11px] py-1 px-2.5"
                  >
                    Practice with AI Feedback
                  </button>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-white">{aiQ.question}</h3>
                {aiQ.model_answer && (
                  <details className="text-xs text-slate-400 pt-1">
                    <summary className="cursor-pointer text-cyan-400 font-mono text-[11px] hover:underline">
                      View Model Answer & Key Concepts
                    </summary>
                    <div className="mt-2 p-3 rounded-lg bg-navy-900 border border-slate-800 text-slate-300 leading-relaxed space-y-2">
                      <p>{aiQ.model_answer}</p>
                      {aiQ.key_concepts && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {aiQ.key_concepts.map((kc, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {kc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : questions.length === 0 ? (
        <div className="glass-panel p-10 text-center text-slate-400">
          No questions found for the category "{selectedCategory}".
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className={`glass-panel border transition-all ${
                  q.is_completed ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800'
                }`}
              >
                {/* Question Header Card */}
                <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={q.is_completed}
                      onChange={() => handleToggleComplete(q)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 text-brand-cyan focus:ring-brand-cyan accent-brand-cyan cursor-pointer"
                    />

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="primary" size="xs">{q.category}</Badge>
                        <Badge
                          variant={q.difficulty === 'Hard' ? 'danger' : q.difficulty === 'Medium' ? 'warning' : 'success'}
                          size="xs"
                        >
                          {q.difficulty}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-slate-100 leading-snug">
                        {q.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {q.question}
                      </p>
                    </div>
                  </div>

                  {/* Actions on right */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(q)}
                      className={`p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors ${
                        q.is_bookmarked ? 'text-amber-400 fill-current' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={q.is_bookmarked ? 'Bookmarked' : 'Bookmark question'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenPractice(q)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-navy-950" />
                      <span>Mock Practice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title={isExpanded ? 'Hide answer' : 'View answer'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Benchmark Solution */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-800/80 mt-2 space-y-4 text-xs sm:text-sm">
                    {/* Key Evaluation Points */}
                    {q.key_points && q.key_points.length > 0 && (
                      <div className="pt-3">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cyan font-bold block mb-1.5">
                          What The Interviewer Evaluates (Key Points)
                        </span>
                        <ul className="space-y-1 bg-navy-850 p-3 rounded-lg border border-slate-800">
                          {q.key_points.map((pt, i) => (
                            <li key={i} className="text-slate-300 text-xs flex items-start gap-2">
                              <span className="text-brand-cyan font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Benchmark Sample Answer */}
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold block mb-1.5">
                        High-Scoring Sample Answer
                      </span>
                      <div className="bg-navy-900 p-4 rounded-xl border border-slate-800 text-slate-200 text-xs sm:text-sm whitespace-pre-line leading-relaxed font-mono">
                        {q.sample_answer}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Mock Practice Modal */}
      <Modal
        isOpen={practiceModalOpen}
        onClose={() => setPracticeModalOpen(false)}
        title={`AI Mock Interview: ${practicingQuestion?.title}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Question Prompt */}
          <div className="p-3.5 rounded-xl bg-navy-850 border border-slate-800">
            <span className="text-[10px] font-mono text-brand-cyan uppercase font-bold block mb-1">
              Interview Question
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {practicingQuestion?.question}
            </p>
          </div>

          {/* Student Answer Input Form */}
          <form onSubmit={handleSubmitPractice} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Your Answer (Speak or Type clearly):</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {studentAnswer.split(/\s+/).filter(Boolean).length} words
                </span>
              </label>
              <textarea
                rows={5}
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="State your answer. Explain mechanisms, time/space trade-offs, and edge-cases (e.g. using STAR format)..."
                disabled={submittingFeedback}
                className="glass-input w-full text-xs font-mono leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPracticeModalOpen(false)}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={!studentAnswer.trim() || submittingFeedback}
                className="btn-primary text-xs py-1.5 px-4"
              >
                <Sparkles className="w-3.5 h-3.5 text-navy-950" />
                <span>{submittingFeedback ? 'Grading...' : 'Submit to AI Rubric'}</span>
              </button>
            </div>
          </form>

          {/* Feedback Result */}
          {feedbackResult && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              {/* Score Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-navy-850 border border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Rubric Evaluation Score
                  </span>
                  <div className="text-2xl font-black font-mono text-brand-cyan">
                    {feedbackResult.score} <span className="text-xs text-slate-400 font-normal">/ 10</span>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant={feedbackResult.score >= 7 ? 'success' : feedbackResult.score >= 5 ? 'warning' : 'danger'}>
                    {feedbackResult.score >= 7 ? 'Strong Delivery' : feedbackResult.score >= 5 ? 'Acceptable' : 'Needs Depth'}
                  </Badge>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Key Strengths</span>
                </h4>
                <ul className="space-y-1 bg-navy-850 p-3 rounded-lg border border-slate-800">
                  {feedbackResult.strengths?.map((s, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div>
                <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Areas to Refine</span>
                </h4>
                <ul className="space-y-1 bg-navy-850 p-3 rounded-lg border border-slate-800">
                  {feedbackResult.areas_for_improvement?.map((imp, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow-up Interviewer Questions */}
              {feedbackResult.follow_up_questions?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-sky-400 font-mono flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Likely Follow-Up Probes</span>
                  </h4>
                  <ul className="space-y-1.5 bg-navy-850 p-3 rounded-lg border border-slate-800">
                    {feedbackResult.follow_up_questions.map((fq, i) => (
                      <li key={i} className="text-xs text-slate-300 font-mono">
                        "{fq}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default InterviewPrepPage;

