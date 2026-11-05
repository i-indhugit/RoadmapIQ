/**
 * KnowledgeAdminModal.jsx
 * Administrative management interface for RoadmapIQ Centralized RAG Knowledge Base.
 * Supports:
 * 1. Viewing knowledge base stats and indexed document catalog.
 * 2. Ingesting new documents with metadata (domain, category, provider, URL).
 * 3. Testing semantic retrieval relevance with similarity scores.
 * 4. Removing outdated or invalid reference documents.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Layers,
  X,
  RefreshCw,
  Sliders,
  Sparkles,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import { ragApi } from '../../services/api';

const CAREER_DOMAINS = [
  'All Domains',
  'Technology and IT',
  'Artificial Intelligence & Machine Learning',
  'Data Science & Analytics',
  'Cloud, DevOps & Systems Engineering',
  'Commerce, Finance & Banking',
  'Healthcare, Medicine & Life Sciences',
  'Law & Legal Services',
  'Government, Civil Services & Public Policy',
  'Design, Media & Creative Arts',
  'Business, Management & Consulting',
  'Core Engineering',
  'Agriculture, Environment & Sustainability',
  'Psychology & Behavioral Sciences',
  'Education, Teaching & Academic Research',
  'Entrepreneurship & Startups',
  'Cybersecurity & Information Security',
  'Hospitality, Tourism & Event Management',
  'Arts, Humanities & Social Sciences',
];

const KNOWLEDGE_CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'official_documentation', label: 'Official Documentation' },
  { id: 'examination_syllabi', label: 'Examination Syllabi' },
  { id: 'learning_materials', label: 'Learning Materials' },
  { id: 'preparation_tutorials', label: 'Preparation Tutorials' },
  { id: 'practical_exercises', label: 'Practical Exercises' },
  { id: 'projects_portfolio', label: 'Projects & Portfolio' },
  { id: 'interview_preparation', label: 'Interview Preparation' },
  { id: 'qualifications_eligibility', label: 'Eligibility & Qualifications' },
  { id: 'skills_competencies', label: 'Skills & Competencies' },
  { id: 'profile_responsibilities', label: 'Profile Responsibilities' },
];

export default function KnowledgeAdminModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'ingest' | 'test'
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Ingestion form state
  const [ingestForm, setIngestForm] = useState({
    title: '',
    provider: '',
    source_url: '',
    career_domain: 'Technology and IT',
    career_role_title: '',
    category: 'learning_materials',
    difficulty: 'intermediate',
    country_jurisdiction: 'Global',
    content: '',
  });
  const [ingestStatus, setIngestStatus] = useState(null); // { type: 'success'|'error', message: '' }
  const [ingesting, setIngesting] = useState(false);

  // Retrieval test state
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);

  // Fetch stats & documents
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const statsRes = await ragApi.getAdminStats();
      setStats(statsRes.data);

      const params = {};
      if (selectedDomain !== 'All Domains') params.domain = selectedDomain;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const docsRes = await ragApi.getAdminDocs(params);
      setDocuments(docsRes.data || []);
    } catch (err) {
      console.error('Failed to load RAG admin data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDomain, selectedCategory]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  // Handle document submission
  const handleIngest = async (e) => {
    e.preventDefault();
    if (!ingestForm.title.trim() || !ingestForm.content.trim()) {
      setIngestStatus({ type: 'error', message: 'Title and document content are required.' });
      return;
    }

    setIngesting(true);
    setIngestStatus(null);
    try {
      const res = await ragApi.ingestDoc(ingestForm);
      setIngestStatus({
        type: 'success',
        message: `Successfully indexed "${res.data.title}" into ${res.data.chunk_count} semantic chunks!`,
      });
      setIngestForm({
        title: '',
        provider: '',
        source_url: '',
        career_domain: ingestForm.career_domain,
        career_role_title: '',
        category: 'learning_materials',
        difficulty: 'intermediate',
        country_jurisdiction: 'Global',
        content: '',
      });
      loadData();
    } catch (err) {
      setIngestStatus({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to ingest document.',
      });
    } finally {
      setIngesting(false);
    }
  };

  // Handle document deletion
  const handleDeleteDoc = async (docId) => {
    if (!window.confirm(`Delete document #${docId} and its associated semantic chunks?`)) return;
    try {
      await ragApi.deleteDoc(docId);
      loadData();
    } catch (err) {
      alert('Failed to delete document: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Handle test retrieval
  const handleTestSearch = async () => {
    if (!testQuery.trim()) return;
    setTesting(true);
    try {
      const res = await ragApi.testRetrieval({
        query: testQuery,
        domain: selectedDomain !== 'All Domains' ? selectedDomain : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        top_k: 5,
      });
      setTestResults(res.data);
    } catch (err) {
      alert('Test retrieval failed: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>RAG Knowledge Base & Curriculum Admin</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-700/40">
                  Centralized
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Grounding AI Mentor & Roadmap Milestones across 18 career domains
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Stats Ribbon */}
        {stats && (
          <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-4">
              <span>Docs: <strong className="text-white">{stats.total_documents}</strong></span>
              <span>Semantic Chunks: <strong className="text-cyan-400">{stats.total_chunks}</strong></span>
              <span>Domains Covered: <strong className="text-emerald-400">{stats.domains_covered}</strong></span>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Knowledge Catalog ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ingest')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ingest'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Document</span>
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'test'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Test Retrieval</span>
          </button>
        </div>

        {/* Tab 1: Knowledge Catalog */}
        {activeTab === 'catalog' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full sm:w-1/2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {CAREER_DOMAINS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-1/2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {KNOWLEDGE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Documents List */}
            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500">Loading catalog...</div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                No indexed documents match the selected filters.
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                          {doc.career_domain}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {doc.category?.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {doc.chunk_count} chunks
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white truncate">{doc.title}</h4>
                      <p className="text-xs text-slate-400">
                        Authority: <strong className="text-slate-300">{doc.provider}</strong>
                        {doc.country_jurisdiction && ` · Jurisdiction: ${doc.country_jurisdiction}`}
                      </p>

                      <a
                        href={doc.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-sm">{doc.source_url}</span>
                      </a>
                    </div>

                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Document Ingestion */}
        {activeTab === 'ingest' && (
          <form onSubmit={handleIngest} className="flex-1 overflow-y-auto p-5 space-y-4">
            {ingestStatus && (
              <div
                className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                  ingestStatus.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                }`}
              >
                {ingestStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{ingestStatus.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Constitutional Law Precedents 2026"
                  value={ingestForm.title}
                  onChange={(e) => setIngestForm({ ...ingestForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Authoritative Provider / Body</label>
                <input
                  type="text"
                  placeholder="e.g. Supreme Court of India, Oracle, ICAI"
                  value={ingestForm.provider}
                  onChange={(e) => setIngestForm({ ...ingestForm, provider: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Career Domain *</label>
                <select
                  value={ingestForm.career_domain}
                  onChange={(e) => setIngestForm({ ...ingestForm, career_domain: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {CAREER_DOMAINS.filter((d) => d !== 'All Domains').map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Knowledge Category</label>
                <select
                  value={ingestForm.category}
                  onChange={(e) => setIngestForm({ ...ingestForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {KNOWLEDGE_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Official Reference URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={ingestForm.source_url}
                  onChange={(e) => setIngestForm({ ...ingestForm, source_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Country / Jurisdiction</label>
                <input
                  type="text"
                  placeholder="e.g. India, Global, US"
                  value={ingestForm.country_jurisdiction}
                  onChange={(e) => setIngestForm({ ...ingestForm, country_jurisdiction: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Document Content / Markdown / Syllabus Text *
              </label>
              <textarea
                required
                rows={9}
                placeholder="Paste authoritative syllabus content, statute text, API technical documentation, or tutorial notes here..."
                value={ingestForm.content}
                onChange={(e) => setIngestForm({ ...ingestForm, content: e.target.value })}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={ingesting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {ingesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing & Embedding...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Validate & Ingest into Vector Store</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Test Retrieval */}
        {activeTab === 'test' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Semantic Retrieval Inspector</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Test raw vector similarity scores and metadata filters without generating full LLM synthesis.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter query, e.g. 'JVM Eden space GC tuning' or 'Ind AS 115 revenue steps'"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTestSearch()}
                  className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleTestSearch}
                  disabled={testing}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {testResults && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400">
                  Retrieved <strong>{testResults.results_count}</strong> matching chunks:
                </div>

                {testResults.matches?.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">
                        #{idx + 1} {m.source_title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Score: {(m.score * 100).toFixed(1)}%
                      </span>
                    </div>

                    <p className="text-slate-300 font-mono text-[11px] bg-slate-900/60 p-2 rounded-lg">
                      {m.snippet}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                      <span>Provider: {m.provider}</span>
                      <span>Domain: {m.domain}</span>
                      {m.section_reference && <span>Section: {m.section_reference}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

