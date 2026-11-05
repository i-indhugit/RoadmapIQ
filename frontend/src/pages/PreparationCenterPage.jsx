import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { interviewApi, aiApi } from '../services/api';
import {
  BookOpen,
  Code2,
  CheckCircle2,
  HelpCircle,
  FolderGit2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Flame,
  Award,
  Play,
  Layers,
  Send,
  Loader2,
  FileText,
} from 'lucide-react';
import Badge from '../components/common/Badge';

export default function PreparationCenterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeRole, activeRoadmap, profile, addToast, triggerCelebration } = useApp();

  const activeTab = searchParams.get('tab') || 'learn';

  // Learning Resources (Learn)
  const resources = activeRoadmap?.tasks?.flatMap((t) => t.resources || []) || [];
  const uniqueResources = Array.from(new Map(resources.map((r) => [r.url, r])).values());

  // Practice & Interactive Exercises (Practice)
  const practiceTasks = (activeRoadmap?.tasks || []).filter((t) => t.deliverable || t.priority === 'High');

  // Quizzes & Self Checks (Test)
  const testTasks = activeRoadmap?.tasks || [];

  // Mini-Projects & Deliverables (Build)
  const buildProjects = (activeRoadmap?.tasks || []).filter((t) => t.deliverable);

  // Interview Prep state
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    if (activeTab === 'interview') {
      setLoadingQuestions(true);
      interviewApi
        .getQuestions({ role_id: activeRole?.id || activeRoadmap?.role_id })
        .then((data) => {
          setQuestions(data || []);
          if (data && data.length > 0) setSelectedQuestion(data[0]);
        })
        .catch(() => null)
        .finally(() => setLoadingQuestions(false));
    }
  }, [activeTab, activeRole?.id, activeRoadmap?.role_id]);

  const handleEvaluateAnswer = async () => {
    if (!selectedQuestion || !userAnswer.trim()) return;
    setEvaluating(true);
    setFeedback(null);
    try {
      const res = await aiApi.evaluateInterviewAnswer({
        question: selectedQuestion.question_text || selectedQuestion.title,
        candidate_answer: userAnswer,
        role_title: activeRole?.title || activeRoadmap?.role_title || 'Software Engineer',
      });
      setFeedback(res);
      triggerCelebration();
      addToast('success', 'Gemini AI evaluation completed!', 'Feedback Ready');
    } catch (err) {
      addToast('error', err.message || 'Could not evaluate answer.', 'AI Error');
    } finally {
      setEvaluating(false);
    }
  };

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const MODES = [
    { id: 'learn', label: '1. Learn', sub: 'Theory & Docs', icon: BookOpen },
    { id: 'practice', label: '2. Practice', sub: 'Coding Drills', icon: Code2 },
    { id: 'test', label: '3. Test', sub: 'Topic Quizzes', icon: HelpCircle },
    { id: 'build', label: '4. Build', sub: 'Mini-Projects', icon: FolderGit2 },
    { id: 'revise', label: '5. Revise', sub: 'Key Concepts', icon: RotateCcw },
    { id: 'interview', label: '6. Interview Prep', sub: 'AI Mock Q&A', icon: Award },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Preparation Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Daily Study & Skill Mastery Modes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Select a learning mode below. Only the relevant tools and materials for that mode are presented.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          Active: <strong className="text-cyan-400">{activeRole?.title || activeRoadmap?.role_title || 'Target Role'}</strong>
        </span>
      </div>

      {/* 6 Mode Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeTab === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setTab(mode.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-cyan-400'}`} />
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
              </div>
              <div className="text-xs font-bold truncate">{mode.label}</div>
              <div className={`text-[10px] truncate ${isActive ? 'text-slate-900/80 font-medium' : 'text-slate-500 font-mono'}`}>
                {mode.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* MODE 1: LEARN (Documentation, Free Curated Guides, Video Theory) */}
      {activeTab === 'learn' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Curated Free Online Learning Materials</span>
              </h3>
              <p className="text-xs text-slate-300">
                100% free verified documentation, interactive guides, and textbooks without paywalls.
              </p>
            </div>
            <Badge variant="primary" size="xs">Verified Free</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(uniqueResources.length > 0
              ? uniqueResources
              : [
                  { title: 'MDN Web Docs Core Guide', provider: 'MDN Web Docs', url: 'https://developer.mozilla.org', type: 'Official Documentation' },
                  { title: 'Harvard CS50 Computer Science', provider: 'Harvard University', url: 'https://cs50.harvard.edu', type: 'Interactive Course' },
                  { title: 'fast.ai Practical Deep Learning', provider: 'fast.ai', url: 'https://course.fast.ai', type: 'Course & Notebooks' },
                  { title: 'freeCodeCamp Full Curriculum', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org', type: 'Interactive Sandbox' },
                  { title: 'Kaggle Micro-Courses', provider: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', type: 'Hands-on Exercises' },
                  { title: 'PortSwigger Web Security Academy', provider: 'PortSwigger', url: 'https://portswigger.net/web-security', type: 'Security Labs' },
                ]
            ).map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400 hover:bg-slate-850 flex flex-col justify-between transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                      Free Resource
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {res.title || res.provider}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Provider: {res.provider || 'Verified Free Source'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-3 text-[11px] font-mono text-cyan-400 flex items-center justify-between">
                  <span>Open Official Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* MODE 2: PRACTICE (Coding Drills & Sandbox Challenges) */}
      {activeTab === 'practice' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Hands-on Practice & Sandbox Exercises</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Reinforce syntax and concepts by writing working implementations.
            </p>
          </div>

          <div className="space-y-3">
            {practiceTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo" size="xs">Week {task.week_number}</Badge>
                    <span className="text-xs font-mono text-slate-400">Est. {task.estimated_hours}h</span>
                  </div>
                  <h4 className="text-base font-bold text-white">{task.title}</h4>
                  <p className="text-xs text-slate-400">{task.description}</p>
                </div>
                <button
                  onClick={() => navigate('/planner')}
                  className="btn-primary text-xs py-2 px-4 shrink-0 flex items-center gap-1.5"
                >
                  <span>Start Drill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 3: TEST (Topic Quizzes & Diagnostic Checks) */}
      {activeTab === 'test' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Self-Assessment & Diagnostic Quizzes</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Validate your conceptual grasp before advancing to complex milestones.
              </p>
            </div>
            <button
              onClick={() => navigate('/assessment')}
              className="btn-primary text-xs py-2 px-4 shrink-0"
            >
              Take Comprehensive Career Test
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {testTasks.slice(0, 4).map((task, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                    Concept Check #{idx + 1}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Week {task.week_number}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{task.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => navigate('/assessment')}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Quiz Check
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 4: BUILD (Mini-Projects & Artifact Deliverables) */}
      {activeTab === 'build' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-emerald-400" />
              <span>Portfolio Mini-Projects & Practical Deliverables</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Build production artifacts required for placement clearance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {buildProjects.map((p, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                  Artifact Deliverable
                </span>
                <h4 className="text-base font-bold text-white">{p.title}</h4>
                <div className="text-xs font-mono text-cyan-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  Deliverable: {p.deliverable}
                </div>
                <p className="text-xs text-slate-400">{p.description}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => navigate('/projects')}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    View Project Specification
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 5: REVISE (Summaries & Flashcards) */}
      {activeTab === 'revise' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <span>Knowledge Synthesis & Conceptual Review</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Consolidate retention with high-yield conceptual takeaways and flashcards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { topic: 'Core Architecture & Patterns', takeaway: 'Understand separation of concerns, decoupling, and dependency injection before scaling codebases.' },
              { topic: 'Data Relational Integrity', takeaway: 'Master ACID transactions, indexing strategies, and normalization to prevent data corruption.' },
              { topic: 'Async & Concurrency Mechanics', takeaway: 'Event loops, worker threads, and promises prevent blocking execution under high concurrency.' },
              { topic: 'Defensive Security Posture', takeaway: 'Never trust input: sanitize parameters, validate schemas, and use parameterized queries.' },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-purple-300 font-mono">Concept #{idx + 1}: {item.topic}</span>
                <p className="text-xs text-slate-300 leading-relaxed">{item.takeaway}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 6: INTERVIEW PREP (Real Q&A with Gemini AI evaluation) */}
      {activeTab === 'interview' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Technical Interview & Oral Defense Simulator</span>
              </h3>
              <p className="text-xs text-slate-300">
                Answer career-specific interview questions and receive instant evaluation from Google Gemini AI.
              </p>
            </div>
            <Badge variant="primary" size="xs">Google Gemini AI</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Question List */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Interview Questions:
              </span>
              <div className="space-y-2">
                {(questions.length > 0
                  ? questions
                  : [
                      { id: 1, question_text: 'Explain the difference between synchronous and asynchronous architectures.', category: 'Architecture' },
                      { id: 2, question_text: 'How do you identify and mitigate database query bottlenecks?', category: 'Database' },
                      { id: 3, question_text: 'Describe an instance where you resolved a critical production failure.', category: 'Behavioral & Troubleshooting' },
                    ]
                ).map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      setSelectedQuestion(q);
                      setFeedback(null);
                      setUserAnswer('');
                    }}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                      selectedQuestion?.id === q.id
                        ? 'bg-cyan-500/15 border-cyan-400 text-white font-semibold'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-cyan-400 mb-0.5">{q.category || 'Interview'}</div>
                    <div className="line-clamp-2">{q.question_text || q.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Question Response & Feedback Panel */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              {selectedQuestion ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">Prompt</span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                      {selectedQuestion.question_text || selectedQuestion.title}
                    </h3>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1.5">
                      Your Technical Answer:
                    </label>
                    <textarea
                      rows={5}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your structured technical response here..."
                      className="glass-input w-full p-3 text-xs leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleEvaluateAnswer}
                      disabled={evaluating || !userAnswer.trim()}
                      className="btn-primary text-xs py-2 px-5 flex items-center gap-2 disabled:opacity-50"
                    >
                      {evaluating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Gemini is evaluating...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit for Gemini AI Feedback</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Feedback Card */}
                  {feedback && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>Gemini Interview Assessment</span>
                        </span>
                        {feedback.score !== undefined && (
                          <Badge variant={feedback.score >= 70 ? 'success' : 'secondary'}>
                            Score: {feedback.score}%
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed">
                        {feedback.feedback || feedback.explanation}
                      </p>

                      {feedback.model_answer && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                          <span className="font-bold text-slate-300 font-mono">Exemplary Answer Structure:</span>
                          <p className="text-slate-400 leading-relaxed">{feedback.model_answer}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  Select a question on the left to begin interview preparation.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

