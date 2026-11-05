import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { roadmapsApi, aiApi } from '../services/api';
import {
  BarChart2,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Info,
  Clock,
  Compass,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { SkeletonCard } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';

const SkillGapPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeRoadmap, profile, activeRole, addToast } = useApp();

  const currentTab = searchParams.get('tab') || 'results';
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (currentTab === 'strong') setFilterStatus('met');
    else if (currentTab === 'developing' || currentTab === 'weak') setFilterStatus('needs_improvement');
    else if (currentTab === 'missing') setFilterStatus('missing');
    else setFilterStatus('all');
  }, [currentTab]);

  // AI Explanation Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedSkillForAi, setSelectedSkillForAi] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);

  useEffect(() => {
    const fetchGaps = async () => {
      setLoading(true);
      try {
        if (activeRoadmap?.id) {
          const res = await roadmapsApi.getSkillGaps(activeRoadmap.id);
          setGapData(res);
        } else if (profile?.target_role_id) {
          const res = await roadmapsApi.analyzeGaps(profile.target_role_id, profile.skills_assessment || {});
          setGapData(res);
        } else {
          setGapData(null);
        }
      } catch (err) {
        addToast('error', err.message || 'Failed to calculate skill gap analysis.', 'Error');
      } finally {
        setLoading(false);
      }
    };

    fetchGaps();
  }, [activeRoadmap, profile, addToast]);

  const handleRequestAiExplanation = async (gapItem) => {
    setSelectedSkillForAi(gapItem);
    setAiModalOpen(true);
    setAiLoading(true);
    setAiExplanation(null);

    try {
      const res = await aiApi.getSkillGapExplanation({
        topic: gapItem.skill_name,
        target_role: gapData?.role_title || activeRole?.title || 'Engineering',
      });
      setAiExplanation(res);
    } catch (err) {
      addToast('error', 'Could not generate AI explanation.', 'AI Provider Error');
    } finally {
      setAiLoading(false);
    }
  };

  if (!profile && !activeRoadmap) {
    return (
      <EmptyState
        icon={Compass}
        title="No Target Role Selected"
        description="Select a career role in your profile to run real-time skill-gap calculations."
        actionLabel="Go to Profile"
        onAction={() => navigate('/profile')}
      />
    );
  }

  // Format data for Radar Chart
  const radarChartData = (gapData?.gaps || []).slice(0, 8).map((g) => ({
    skill: g.skill_name.length > 14 ? g.skill_name.substring(0, 12) + '...' : g.skill_name,
    Current: g.current_proficiency,
    Required: g.required_proficiency,
  }));

  const filteredGaps = (gapData?.gaps || []).filter((g) => {
    if (filterStatus === 'all') return true;
    return g.status === filterStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="primary" className="mb-2">Step 3: Benchmark Comparison</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2">
            <span>Skill Gap Analysis:</span>
            <span className="text-brand-cyan">{gapData?.role_title || 'Target Role'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Calculated by backend rule engine comparing your self-reported proficiency with required standards.
          </p>
        </div>

        {activeRoadmap && (
          <Link to="/roadmap" className="btn-primary py-2 px-4 shrink-0 text-xs">
            <span>View Learning Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Sub-option Navigation Tabs (Progressive Disclosure) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        {[
          { id: 'results', label: 'Assessment Results' },
          { id: 'strong', label: 'Strong Skills' },
          { id: 'developing', label: 'Developing Skills' },
          { id: 'weak', label: 'Weak Skills' },
          { id: 'missing', label: 'Missing Skills' },
          { id: 'readiness', label: 'Career Readiness' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              currentTab === tab.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !gapData ? (
        <EmptyState
          icon={BarChart2}
          title="Analysis Not Ready"
          description="Please assign a target role to trigger the backend gap analyzer."
          actionLabel="Select Role"
          onAction={() => navigate('/careers')}
        />
      ) : (
        <>
          {/* 4 Category Status Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Overall Score */}
            <div className="glass-card p-4 col-span-2 lg:col-span-1 border-brand-cyan/40 bg-navy-850">
              <div className="text-[11px] text-slate-400 font-medium mb-1">Calculated Readiness</div>
              <div className="text-3xl font-extrabold font-mono text-brand-cyan">
                {gapData.readiness_score}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Weighted baseline match</div>
            </div>

            {/* Met */}
            <div
              onClick={() => setFilterStatus(filterStatus === 'met' ? 'all' : 'met')}
              className={`glass-card p-4 cursor-pointer transition-all ${
                filterStatus === 'met' ? 'border-emerald-500 bg-emerald-950/20' : ''
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Met</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{gapData.met_count}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Meets requirements</div>
            </div>

            {/* Needs Improvement */}
            <div
              onClick={() => setFilterStatus(filterStatus === 'needs_improvement' ? 'all' : 'needs_improvement')}
              className={`glass-card p-4 cursor-pointer transition-all ${
                filterStatus === 'needs_improvement' ? 'border-amber-500 bg-amber-950/20' : ''
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Improve</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400">{gapData.needs_improvement_count}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Partially known</div>
            </div>

            {/* Missing */}
            <div
              onClick={() => setFilterStatus(filterStatus === 'missing' ? 'all' : 'missing')}
              className={`glass-card p-4 cursor-pointer transition-all ${
                filterStatus === 'missing' ? 'border-rose-500 bg-rose-950/20' : ''
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Missing</span>
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-rose-400">{gapData.missing_count}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Zero proficiency</div>
            </div>

            {/* Blocked */}
            <div
              onClick={() => setFilterStatus(filterStatus === 'blocked' ? 'all' : 'blocked')}
              className={`glass-card p-4 cursor-pointer transition-all ${
                filterStatus === 'blocked' ? 'border-purple-500 bg-purple-950/20' : ''
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Blocked</span>
                <Lock className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-purple-400">{gapData.blocked_count}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Prerequisites unmet</div>
            </div>
          </div>

          {/* Visual Proficiency Radar Comparison */}
          {radarChartData.length > 2 && (
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-brand-cyan" />
                    <span>Curriculum Proficiency Benchmark Radar</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Compares your self-assessed level (0-3) with the required proficiency level (1-3)
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1 text-brand-cyan">
                    <span className="w-3 h-3 rounded-full bg-brand-cyan/40 border border-brand-cyan" /> Current
                  </span>
                  <span className="flex items-center gap-1 text-sky-400">
                    <span className="w-3 h-3 rounded-full bg-sky-500/30 border border-sky-400" /> Required
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="skill" stroke="#94a3b8" fontSize={11} />
                    <PolarRadiusAxis domain={[0, 5]} stroke="#475569" fontSize={10} />
                    <Radar name="Current Proficiency" dataKey="Current" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.35} />
                    <Radar name="Required Benchmark" dataKey="Required" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detailed Skill Gaps Table / Cards */}
          <div className="glass-panel p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  Comprehensive Competency Breakdown ({filteredGaps.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Sorted by importance weight and deficit magnitude.
                </p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {['all', 'met', 'needs_improvement', 'missing', 'blocked'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg font-mono capitalize transition-all ${
                      filterStatus === st
                        ? 'bg-slate-700 text-brand-cyan font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredGaps.map((gap) => (
                <div
                  key={gap.skill_id}
                  className="p-4 rounded-xl bg-navy-850/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-slate-100">{gap.skill_name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {gap.category}
                      </span>
                      {gap.is_core && <Badge variant="primary" size="xs">Core Skill</Badge>}
                      <Badge
                        variant={
                          gap.status === 'met'
                            ? 'success'
                            : gap.status === 'needs_improvement'
                            ? 'warning'
                            : gap.status === 'blocked'
                            ? 'purple'
                            : 'danger'
                        }
                        size="xs"
                      >
                        {gap.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                      <span>Proficiency: <strong className="text-slate-200">Lvl {gap.current_proficiency}</strong> / Lvl {gap.required_proficiency}</span>
                      <span>Importance: <strong className="text-brand-cyan">{'★'.repeat(gap.importance_weight)}</strong></span>
                      <span>Est. Hours: <strong className="text-sky-400">~{gap.estimated_hours_to_bridge}h</strong></span>
                    </div>

                    {/* Unmet prerequisites notice */}
                    {gap.unmet_prerequisites?.length > 0 && (
                      <div className="text-[11px] text-purple-300/90 flex items-center gap-1.5 pt-1">
                        <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>Prerequisites to learn first: <strong>{gap.unmet_prerequisites.join(', ')}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {gap.doc_url && (
                      <a
                        href={gap.doc_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary text-xs py-1.5 px-3"
                        title="Official Documentation"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Docs</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRequestAiExplanation(gap)}
                      className="btn-primary text-xs py-1.5 px-3.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-navy-950" />
                      <span>AI Explain</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Official Disclaimer */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
              <Info className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              {gapData.disclaimer}
            </div>
          </div>
        </>
      )}

      {/* AI Skill Explanation Modal */}
      <Modal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title={`AI Competency Analysis: ${selectedSkillForAi?.skill_name}`}
        maxWidth="max-w-2xl"
      >
        {aiLoading ? (
          <div className="space-y-4 py-8 text-center">
            <div className="w-10 h-10 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-mono">Synthesizing role relevance and study milestones...</p>
          </div>
        ) : aiExplanation ? (
          <div className="space-y-5 text-xs sm:text-sm">
            <div>
              <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-brand-cyan font-mono">
                Conceptual Overview
              </h4>
              <p className="text-slate-300 leading-relaxed bg-navy-850 p-3.5 rounded-lg border border-slate-800">
                {aiExplanation.explanation}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-sky-400 font-mono">
                Why Hiring Managers Care
              </h4>
              <p className="text-slate-300 leading-relaxed bg-navy-850 p-3.5 rounded-lg border border-slate-800">
                {aiExplanation.why_important}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-brand-indigo font-mono">
                Targeted 3-Week Study Strategy
              </h4>
              <div className="text-slate-300 leading-relaxed bg-navy-850 p-3.5 rounded-lg border border-slate-800 whitespace-pre-line font-mono text-xs">
                {aiExplanation.study_strategy}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-amber-400 font-mono">
                Placement Interview Tip & Trap
              </h4>
              <p className="text-slate-300 leading-relaxed bg-navy-850 p-3.5 rounded-lg border border-slate-800">
                {aiExplanation.interview_tip}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default SkillGapPage;

