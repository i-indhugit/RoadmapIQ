import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { careerAssessmentApi } from '../services/api';
import {
  RotateCcw,
  Scale,
  TrendingUp,
  History,
  ShieldCheck,
  Map,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import Badge from '../components/common/Badge';

export default function ReassessmentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeRole, activeRoadmap, profile, addToast, triggerCelebration } = useApp();

  const activeTab = searchParams.get('tab') || 'compare-results';

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [previousAttemptId, setPreviousAttemptId] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      careerAssessmentApi
        .getHistory(profile.id)
        .then((data) => {
          setHistoryList(data || []);
          if (data && data.length >= 2) {
            setSelectedAttemptId(data[0].id);
            setPreviousAttemptId(data[1].id);
          } else if (data && data.length === 1) {
            setSelectedAttemptId(data[0].id);
          }
        })
        .catch(() => null)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (selectedAttemptId && previousAttemptId) {
      setComparing(true);
      careerAssessmentApi
        .compareAttempts(selectedAttemptId, previousAttemptId)
        .then(setComparison)
        .catch(() => setComparison(null))
        .finally(() => setComparing(false));
    }
  }, [selectedAttemptId, previousAttemptId]);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const handleGenerateUpdatedRoadmap = async () => {
    if (!selectedAttemptId) {
      addToast('warning', 'Please complete an assessment before updating roadmap.', 'Notice');
      return;
    }
    setGeneratingRoadmap(true);
    try {
      await careerAssessmentApi.generateRoadmapFromAssessment({
        attempt_id: selectedAttemptId,
        weekly_hours: activeRoadmap?.weekly_hours || 15,
        duration_weeks: activeRoadmap?.target_duration_weeks || 12,
      });
      triggerCelebration();
      addToast('success', 'Updated preparation roadmap generated based on your latest score!', 'Roadmap Updated');
      navigate('/roadmap');
    } catch (err) {
      addToast('error', err.message || 'Could not update roadmap.', 'Error');
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const TABS = [
    { id: 'retake', label: 'Retake Assessment', icon: RotateCcw },
    { id: 'compare-results', label: 'Compare Previous Results', icon: Scale },
    { id: 'improvement-history', label: 'Skill Improvement History', icon: History },
    { id: 'updated-readiness', label: 'Updated Career Readiness', icon: ShieldCheck },
    { id: 'updated-roadmap', label: 'Generate Updated Roadmap', icon: Map },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Continuous Skill Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Career Reassessment & Growth Delta
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Re-test your competencies, track verified score deltas, and keep your personalized roadmap aligned.
          </p>
        </div>

        <button
          onClick={() => navigate(`/assessment?career=${activeRole?.slug || activeRole?.id || ''}`)}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Launch Reassessment Test</span>
        </button>
      </div>

      {/* Progressive Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. RETAKE ASSESSMENT TAB */}
      {activeTab === 'retake' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-cyan-400" />
              <span>Configure & Launch Reassessment</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Taking a reassessment tests your growth after completing roadmap checkpoints. Your previous score will be preserved to calculate growth deltas.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-slate-400 block">Target Career:</span>
                <span className="text-white font-bold">{activeRole?.title || activeRoadmap?.role_title || 'Software Engineer'}</span>
              </div>
              <button
                onClick={() => navigate(`/assessment?career=${activeRole?.slug || activeRole?.id || ''}`)}
                className="btn-primary text-xs py-2 px-5 flex items-center gap-2"
              >
                <span>Enter Test Suite</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. COMPARE PREVIOUS RESULTS TAB */}
      {activeTab === 'compare-results' && (
        <div className="space-y-5 animate-fadeIn">
          {comparison ? (
            <div className="space-y-6">
              {/* Delta Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Score Progression Delta</span>
                    <span
                      className={`text-3xl font-extrabold font-mono mt-1 block flex items-center gap-1.5 ${
                        comparison.score_difference >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {comparison.score_difference >= 0 ? <TrendingUp className="w-6 h-6 inline" /> : <TrendingDown className="w-6 h-6 inline" />}
                      {comparison.score_difference >= 0 ? `+${comparison.score_difference}%` : `${comparison.score_difference}%`}
                    </span>
                  </div>
                  <Badge variant={comparison.score_difference >= 0 ? 'success' : 'red'}>
                    {comparison.score_difference >= 0 ? 'Improvement Verified' : 'Needs Review'}
                  </Badge>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Placement Readiness Delta</span>
                    <span className="text-3xl font-extrabold font-mono text-cyan-400 mt-1 block">
                      {comparison.readiness_difference >= 0 ? `+${comparison.readiness_difference}%` : `${comparison.readiness_difference}%`}
                    </span>
                  </div>
                  <Badge variant="primary">Readiness</Badge>
                </div>
              </div>

              {/* Verdict */}
              {comparison.overall_verdict && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Evaluation Verdict</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {comparison.overall_verdict}
                  </p>
                </div>
              )}

              {/* Demonstrated Growth */}
              {comparison.improved_skills?.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Demonstrated Skill Growth ({comparison.improved_skills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {comparison.improved_skills.map((s, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <Scale className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No Previous Reassessment Comparison Found</h4>
              <p className="text-xs text-slate-400">
                You need at least 2 completed assessments to compare growth deltas side-by-side.
              </p>
              <button
                onClick={() => navigate(`/assessment?career=${activeRole?.slug || activeRole?.id || ''}`)}
                className="btn-primary text-xs py-2 px-4 inline-flex"
              >
                Take Reassessment Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. SKILL IMPROVEMENT HISTORY TAB */}
      {activeTab === 'improvement-history' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="text-xs font-mono text-slate-400">
            Total Assessment Attempts Logged: <strong className="text-white">{historyList.length}</strong>
          </div>

          <div className="space-y-2.5">
            {historyList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold font-mono">
                    #{historyList.length - idx}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.role_title}</h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : 'Recent'} • {item.proficiency_level}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-cyan-400">{item.score_percentage}%</span>
                    <span className="text-[10px] text-slate-500 block font-mono">Score</span>
                  </div>
                  <button
                    onClick={() => navigate('/assessment')}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}

            {historyList.length === 0 && (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No past assessment history recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. UPDATED CAREER READINESS TAB */}
      {activeTab === 'updated-readiness' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Current Placement Readiness Index</span>
            </h3>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="text-4xl font-extrabold font-mono text-cyan-400">
                {activeRoadmap?.readiness_score || 0}%
              </div>
              <div className="text-xs font-mono text-slate-400">
                Calibrated against job descriptions for {activeRole?.title || activeRoadmap?.role_title}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Readiness is calculated using objective testing marks, completed roadmap milestones, and verified portfolio artifacts. It reflects actual industry capability rather than mere page clicks.
            </p>
          </div>
        </div>
      )}

      {/* 5. GENERATE UPDATED ROADMAP TAB */}
      {activeTab === 'updated-roadmap' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Map className="w-5 h-5 text-cyan-400" />
                  <span>Align Roadmap to Latest Test Results</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your weekly schedule so that skills you mastered in reassessment are checked off.
                </p>
              </div>

              <button
                onClick={handleGenerateUpdatedRoadmap}
                disabled={generatingRoadmap}
                className="btn-primary text-xs py-2 px-5 flex items-center gap-2"
              >
                <span>{generatingRoadmap ? 'Updating Roadmap...' : 'Generate Updated Roadmap'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

