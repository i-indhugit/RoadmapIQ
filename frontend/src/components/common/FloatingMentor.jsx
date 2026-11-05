import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { aiApi, ragApi } from '../../services/api';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  HelpCircle,
  ChevronRight,
  User,
  Zap,
  Compass,
  Award,
  Map,
  TrendingUp,
  Database,
  ExternalLink,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import KnowledgeAdminModal from '../rag/KnowledgeAdminModal';

const MODULE_STARTER_PROMPTS = {
  discover: [
    'Suggest careers for my academic background',
    'What qualifications are needed for my target track?',
    'How do I transition into this field?',
  ],
  assess: [
    'Explain my lowest scoring diagnostic skill gap',
    'Generate a practice question for my weak skill',
    'How can I prepare for reassessment?',
  ],
  journey: [
    'Explain the core concept in my current milestone',
    'How do I complete today\'s practical task?',
    'Recommend free materials for this phase',
  ],
  growth: [
    'How do I improve my career readiness score?',
    'What project evidence should I submit for my portfolio?',
    'Tips to maintain my daily study streak',
  ],
  default: [
    'What skill should I focus on first?',
    'How do I balance study with a busy schedule?',
    'How do I bridge my highest priority gap?',
    'What portfolio projects should I build?',
  ],
};

const FloatingMentor = () => {
  const location = useLocation();
  const { profile, activeRoadmap, activeRole, aiStatus } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'mentor',
      text: "👋 Hi! I'm your RoadmapIQ Career Mentor. Ask me any question about your learning roadmap, skill priorities, interview tips, or overcoming study roadblocks!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef(null);

  // Determine current active module from route
  const currentModuleKey = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('discover') || path.includes('careers')) return 'discover';
    if (path.includes('assess') || path.includes('skill-gap')) return 'assess';
    if (path.includes('journey') || path.includes('roadmap')) return 'journey';
    if (path.includes('growth') || path.includes('progress') || path.includes('portfolio')) return 'growth';
    return 'default';
  }, [location.pathname]);

  const starterPrompts = MODULE_STARTER_PROMPTS[currentModuleKey] || MODULE_STARTER_PROMPTS.default;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const targetRoleTitle = activeRole?.title || activeRoadmap?.role_title || 'General Career Path';
      const targetDomain = activeRole?.domain || activeRoadmap?.domain || 'Technology and IT';

      // 1. Primary: Centralized RAG Knowledge Engine
      let replyText = '';
      let sources = [];
      let isGrounded = false;

      try {
        const ragRes = await ragApi.query({
          query: text,
          target_role: targetRoleTitle,
          domain: targetDomain,
          profile_id: profile?.id,
        });
        if (ragRes?.data?.answer) {
          replyText = ragRes.data.answer;
          sources = ragRes.data.sources || [];
          isGrounded = ragRes.data.is_grounded_in_rag;
        }
      } catch (ragErr) {
        console.warn('RAG query fallback to general assistant:', ragErr);
      }

      // 2. Secondary fallback if RAG query returned empty
      if (!replyText) {
        const studentContext = {
          role_title: targetRoleTitle,
          domain: targetDomain,
          readiness_score: activeRoadmap?.readiness_score || 45,
          education: profile?.educational_field || profile?.education_level || 'Undergraduate',
          weekly_hours: profile?.weekly_study_hours || 15,
          current_module: currentModuleKey,
          streak_days: profile?.streak_days || 1,
        };

        const response = await aiApi.askAssistant({
          message: text,
          student_context: studentContext,
        });

        replyText =
          response?.data?.reply ||
          response?.data?.answer ||
          response?.reply ||
          response?.response ||
          "Based on your profile, I recommend prioritizing your core prerequisites first and building a small milestone project each week.";
        sources = response?.data?.sources || [];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'mentor',
          text: replyText,
          sources: sources,
          isGrounded: isGrounded,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'mentor',
          text: `Deterministic Guidance: Focus on your target career (${activeRole?.title || 'Selected Path'}). Prioritize critical gaps first and allocate ${profile?.weekly_study_hours || 15} hours per week on hands-on code exercises and portfolio submissions.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside aria-label="AI Career Mentor" className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button (when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-slate-950 font-bold shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Open AI Career Mentor"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
          </div>
          <span className="text-sm tracking-wide hidden sm:inline">AI Mentor</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-950/20 text-slate-950 font-mono uppercase text-[10px]">
            {currentModuleKey}
          </span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div
          className={`bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
            isMinimized ? 'w-80 h-14' : 'w-[90vw] sm:w-96 h-[520px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>AI Career Mentor</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">
                  {activeRole?.title || 'General Path'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setAdminModalOpen(true)}
                className="p-1 rounded-lg hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition-colors"
                title="Curriculum & RAG Knowledge Base Admin"
              >
                <Database className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Contextual Module Prompt Pills */}
              <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold shrink-0">
                  Quick:
                </span>
                {starterPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={loading}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap bg-slate-900 hover:bg-cyan-950/40 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                          isUser
                            ? 'bg-cyan-600 text-white rounded-br-none'
                            : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.text}</div>

                        {/* Verified RAG Curriculum Sources */}
                        {!isUser && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5">
                            <div className="text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-cyan-400" />
                              <span>Verified Curriculum Sources ({msg.sources.length}):</span>
                            </div>
                            <div className="space-y-1">
                              {msg.sources.slice(0, 3).map((s, idx) => (
                                <a
                                  key={idx}
                                  href={s.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] p-1.5 rounded-lg bg-slate-900 border border-slate-800/80 hover:border-cyan-500/50 flex items-center justify-between text-slate-300 hover:text-white transition-colors"
                                >
                                  <span className="truncate max-w-[190px] font-semibold">
                                    [{idx + 1}] {s.title}
                                  </span>
                                  <span className="text-[9px] font-mono text-cyan-300/80 shrink-0 ml-1">
                                    {s.provider}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-[9px] text-right opacity-60 mt-1 font-mono">
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>Analyzing your roadmap & formulating guidance...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ask anything about ${activeRole?.title || 'your career'}...`}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Centralized RAG Knowledge Base Admin Modal */}
      <KnowledgeAdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </aside>
  );
};

export default FloatingMentor;
