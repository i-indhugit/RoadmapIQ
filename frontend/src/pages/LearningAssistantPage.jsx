import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { aiApi } from '../services/api';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  CornerDownLeft,
  Compass,
  Target,
  FileCode,
  Layers,
  MessageSquare,
  Award,
} from 'lucide-react';
import Badge from '../components/common/Badge';

const PROMPTS_BY_TAB = {
  guidance: [
    'What are the most in-demand skills for my target career track in 2026?',
    'How do I position my background when transitioning into software engineering?',
    'What should my 6-month career progression roadmap look like?',
    'What is the typical technical interview loop for mid-level roles?',
  ],
  concepts: [
    'Explain database B-Tree indexing vs hash indexing with examples.',
    'How do RAG vector databases work with embedding models and cosine similarity?',
    'Explain the event loop and asynchronous concurrency in Python and Node.js.',
    'What is the difference between monolithic, microservice, and serverless architectures?',
  ],
  gaps: [
    'How do I systematically fix my weak skills identified in the assessment?',
    'What are the highest-priority prerequisites I should master first?',
    'Why is system design and data structures essential even for junior roles?',
    'How do I bridge the gap between building toy tutorials and production code?',
  ],
  resources: [
    'What are the best free, unpaywalled resources to master algorithms?',
    'Where can I find official documentation and interactive tutorials for FastAPI?',
    'Recommend top free projects to build for cloud and containerization.',
    'What are the best vetted resources for learning React and TypeScript?',
  ],
  feedback: [
    'Can you review my study pace and suggest how to optimize my hours?',
    'How can I write cleaner, testable code for my portfolio capstone?',
    'What evaluation criteria will recruiters use when reviewing my GitHub repo?',
    'How should I practice explaining my technical decisions in mock interviews?',
  ],
};

const TAB_CONFIG = [
  { id: 'guidance', label: 'Career Guidance', icon: Compass },
  { id: 'concepts', label: 'Concept Explanations', icon: FileCode },
  { id: 'gaps', label: 'Skill Gap Explanations', icon: Target },
  { id: 'resources', label: 'Resource Recommendations', icon: BookOpen },
  { id: 'feedback', label: 'Learning Feedback', icon: MessageSquare },
];

const LearningAssistantPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'guidance';

  const { profile, activeRole, activeRoadmap, addToast } = useApp();

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Hello! I am the RoadmapIQ Grounded Learning Assistant. Ask me anything about your technical curriculum, algorithm patterns, frameworks, or placement preparation. My answers are grounded strictly in verified official documentation and free learning resources without fabricated links.',
      sources: [],
      hasSources: true,
      time: 'Just now',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const activePrompts = PROMPTS_BY_TAB[currentTab] || PROMPTS_BY_TAB.guidance;

  const handleSend = async (queryText = null) => {
    const textToSend = (queryText || query).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await aiApi.askAssistant({
        query: textToSend,
        target_role: activeRoadmap?.role_title || activeRole?.title || 'Software Engineering',
        current_skills: profile?.skills_assessment ? Object.keys(profile.skills_assessment) : [],
        preferred_format: profile?.preferred_learning_format || 'mixed',
      });

      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: res.answer,
        sources: res.sources || [],
        hasSources: res.has_relevant_sources !== false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      addToast('error', err.message || 'Failed to reach RAG assistant.', 'Query Error');
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: 'Sorry, I encountered an issue retrieving information from the curriculum database. Please verify that the backend is running.',
        sources: [],
        hasSources: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="primary">Retrieval-Augmented Generation (RAG)</Badge>
            <span className="text-xs font-mono text-slate-400">Strict Source Attribution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <span>AI Career Assistant</span>
            <Bot className="w-6 h-6 text-brand-cyan" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Curriculum reasoning system strictly linked to real database resources. No hallucinated links.
          </p>
        </div>

        {activeRole && (
          <div className="text-xs px-3 py-1.5 rounded-lg bg-navy-850 border border-slate-800 text-slate-300 font-mono shrink-0">
            Context: <strong className="text-brand-cyan">{activeRole.title}</strong>
          </div>
        )}
      </div>

      {/* Progressive Disclosure Sub-Option Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
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

      {/* Suggested Quick Prompt Pills */}
      <div className="glass-panel p-3.5 space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
          Suggested {TAB_CONFIG.find((t) => t.id === currentTab)?.label} Inquiries
        </span>
        <div className="flex flex-wrap gap-2">
          {activePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-left text-xs px-3 py-1.5 rounded-lg bg-navy-850 hover:bg-slate-800 border border-slate-800 hover:border-brand-cyan/40 text-slate-300 hover:text-slate-100 transition-all cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="glass-panel p-4 sm:p-6 space-y-5 min-h-[420px] max-h-[580px] overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-navy-800 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan shrink-0 mt-1 shadow-glow-cyan/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 space-y-3 ${
                  isUser
                    ? 'bg-gradient-to-r from-brand-cyan/20 to-brand-blue/20 border border-brand-cyan/40 text-slate-100'
                    : 'bg-navy-850/90 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-slate-400 border-b border-slate-800/60 pb-1.5">
                  <span className="font-semibold text-slate-300">
                    {isUser ? profile?.display_name || 'You' : 'RoadmapIQ RAG Intelligence'}
                  </span>
                  <span>{msg.time}</span>
                </div>

                {/* Message Body */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-2">
                  {msg.text}
                </div>

                {/* No match notice */}
                {!msg.hasSources && !isUser && (
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p>
                      No exact resources were matched in the database for this specific query. Try searching for standard core technologies like Python, React, LeetCode, or SQL.
                    </p>
                  </div>
                )}

                {/* Retrieved Verified Sources Cards */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-brand-cyan font-semibold">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Retrieved Verified Curriculum Sources ({msg.sources.length}):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 hover:border-brand-cyan/40 transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 font-mono mb-1">
                              <span className="text-brand-cyan">{src.provider}</span>
                              <Badge variant="blue" size="xs">{src.format}</Badge>
                            </div>
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-brand-cyan transition-colors line-clamp-1">
                              {src.title}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 mt-1 border-t border-slate-800">
                            <span>{src.skill_name || 'Core Topic'}</span>
                            <span className="flex items-center gap-0.5 text-slate-400 group-hover:text-brand-cyan">
                              Open Source <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-slate-400 font-mono py-2">
            <div className="w-6 h-6 rounded-lg bg-navy-800 flex items-center justify-center text-brand-cyan animate-spin">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>Retrieving matching curriculum resources & synthesizing answer...</span>
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="glass-panel p-2.5 flex items-center gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about a data structure pattern, roadmap milestone, or interview question..."
          disabled={loading}
          className="glass-input flex-1 border-0 bg-transparent focus:ring-0 text-sm"
        />

        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="btn-primary py-2 px-4 shrink-0 text-xs"
        >
          <span>Ask RAG</span>
          <Send className="w-3.5 h-3.5 text-navy-950" />
        </button>
      </form>
    </div>
  );
};

export default LearningAssistantPage;

