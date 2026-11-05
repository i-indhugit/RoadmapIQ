import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { portfolioApi, gamificationApi, activitiesApi, aiApi } from '../services/api';
import {
  TrendingUp,
  Award,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  FolderGit2,
  GitBranch,
  BarChart2,
  Layers,
  Calendar,
  Lock,
  ExternalLink,
  Plus,
  X,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Zap,
  Target,
  ArrowRight,
  Bot,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import PersonalLearningCalendar from '../components/growth/PersonalLearningCalendar';
import Modal from '../components/common/Modal';

export default function GrowthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    profile,
    activeRole,
    activeRoadmap,
    activeRoadmapProgress,
    gamification,
    refreshGamification,
    addToast,
    triggerCelebration,
  } = useApp();

  const currentTab = searchParams.get('tab') || 'overview';

  const setTab = (tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  // Portfolio State
  const [portfolioData, setPortfolioData] = useState(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [portfolioFilter, setPortfolioFilter] = useState('all');

  // Submit Evidence Modal State
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedSkillForEvidence, setSelectedSkillForEvidence] = useState(null);
  const [evidenceForm, setEvidenceForm] = useState({
    title: '',
    evidenceType: 'github_repo',
    evidenceUrl: '',
    description: '',
    selfProficiencyLevel: 3,
  });
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  // Skill Tree State
  const [skillTree, setSkillTree] = useState(null);
  const [loadingTree, setLoadingTree] = useState(false);

  // Activity Heatmap State
  const [streakStatus, setStreakStatus] = useState(null);

  // Achievements State
  const [achievements, setAchievements] = useState([]);

  // Load Portfolio Data
  const loadPortfolio = useCallback(async () => {
    if (!profile?.id) return;
    setLoadingPortfolio(true);
    try {
      const res = await portfolioApi.get(profile.id);
      setPortfolioData(res);
    } catch (err) {
      console.warn('Portfolio load note:', err);
    } finally {
      setLoadingPortfolio(false);
    }
  }, [profile?.id]);

  // Load Gamification Achievements & Tree
  useEffect(() => {
    loadPortfolio();

    if (profile?.id) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      activitiesApi
        .getStreakStatus(profile.id, tz)
        .then(setStreakStatus)
        .catch(() => null);

      gamificationApi
        .getAchievements(profile.id)
        .then((data) => setAchievements(data?.achievements || []))
        .catch(() => null);

      if (activeRole?.id) {
        setLoadingTree(true);
        gamificationApi
          .getSkillTree(activeRole.id, profile.id)
          .then(setSkillTree)
          .catch(() => null)
          .finally(() => setLoadingTree(false));
      }
    }
  }, [profile?.id, activeRole?.id, loadPortfolio]);

  // Submit Evidence Handler
  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    if (!selectedSkillForEvidence || !evidenceForm.evidenceUrl) {
      addToast('warning', 'Please provide a valid evidence URL (e.g. GitHub repository or live URL).', 'Missing URL');
      return;
    }

    setIsSubmittingEvidence(true);
    try {
      await portfolioApi.submitEvidence(profile.id, {
        skill_slug: selectedSkillForEvidence.skill_slug,
        evidence_type: evidenceForm.evidenceType,
        evidence_url: evidenceForm.evidenceUrl,
        title: evidenceForm.title || `${selectedSkillForEvidence.skill_name} Project Deliverable`,
        description: evidenceForm.description,
        self_proficiency_level: Number(evidenceForm.selfProficiencyLevel),
      });

      triggerCelebration();
      addToast(
        'success',
        `Evidence recorded for ${selectedSkillForEvidence.skill_name}! +40 XP awarded.`,
        'Evidence Submitted'
      );

      setEvidenceModalOpen(false);
      setSelectedSkillForEvidence(null);
      setEvidenceForm({
        title: '',
        evidenceType: 'github_repo',
        evidenceUrl: '',
        description: '',
        selfProficiencyLevel: 3,
      });

      await loadPortfolio();
      await refreshGamification();
    } catch (err) {
      addToast('error', err.message || 'Could not record evidence.', 'Submission Error');
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  // Metrics
  const roadmapPct = activeRoadmapProgress?.completion_percentage ?? 0;
  const readinessScore = portfolioData?.career_readiness_score ?? activeRoadmapProgress?.readiness_score ?? 45;
  const currentDailyStreak = streakStatus?.current_daily_streak ?? gamification?.streakDays ?? 1;
  const currentWeeklyStreak = streakStatus?.current_weekly_streak ?? 1;

  // Filtered Portfolio Skills
  const filteredPortfolio = useMemo(() => {
    if (!portfolioData?.skills) return [];
    if (portfolioFilter === 'all') return portfolioData.skills;
    if (portfolioFilter === 'verified') return portfolioData.skills.filter((s) => s.is_verified);
    if (portfolioFilter === 'needs_evidence') return portfolioData.skills.filter((s) => !s.evidence_link);
    return portfolioData.skills;
  }, [portfolioData?.skills, portfolioFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* 1. Header Banner & Dual Metrics Display */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <TrendingUp className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                Module 3 • My Growth & Verified Competency
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Skill Portfolio & Performance Analytics
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Track verified competency evidence, monitor separate metrics for roadmap completion vs career readiness, and view your daily activity streak logs.
            </p>
          </div>

          {/* Level & XP Capsule */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold">Level {gamification.level}</span>
              <span className="text-slate-400">{gamification.levelTitle}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500"
                style={{ width: `${gamification.levelProgressPct}%` }}
              />
            </div>
            <div className="text-[10px] text-right font-mono text-slate-500">
              {gamification.xp} / {gamification.nextLevelXp} XP
            </div>
          </div>
        </div>

        {/* Dual Metric Cards Bar: STRICT SEPARATION of Roadmap Completion vs Career Readiness */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          {/* Metric 1: Roadmap Completion */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Roadmap Progress</span>
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {roadmapPct}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Tasks completed</div>
          </div>

          {/* Metric 2: Career Readiness (Strictly Separate) */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-indigo-500/30">
            <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Career Readiness</span>
            </div>
            <div className="text-2xl font-extrabold text-indigo-300 mt-1">
              {readinessScore}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Verified competency score</div>
          </div>

          {/* Metric 3: Daily Streak */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Daily Streak</span>
            </div>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">
              {currentDailyStreak} Days
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Consecutive learning days</div>
          </div>

          {/* Metric 4: Weekly Streak */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-500/30">
            <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Weekly Streak</span>
            </div>
            <div className="text-2xl font-extrabold text-purple-300 mt-1">
              {currentWeeklyStreak} Weeks
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Met weekly study target</div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'overview'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Skill Portfolio & Evidence</span>
          </button>

          <button
            onClick={() => setTab('tree')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'tree'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>Visual Skill Tree</span>
          </button>

          <button
            onClick={() => setTab('activity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'activity'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Learning Calendar</span>
          </button>

          <button
            onClick={() => setTab('achievements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'achievements'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Achievements & Badges</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUBTAB 1: SKILL PORTFOLIO & EVIDENCE                           */}
      {/* ============================================================== */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPortfolioFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  portfolioFilter === 'all'
                    ? 'bg-rose-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Skills ({portfolioData?.skills?.length || 0})
              </button>
              <button
                onClick={() => setPortfolioFilter('verified')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  portfolioFilter === 'verified'
                    ? 'bg-rose-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Verified by Assessment
              </button>
              <button
                onClick={() => setPortfolioFilter('needs_evidence')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  portfolioFilter === 'needs_evidence'
                    ? 'bg-rose-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Awaiting Evidence
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Role: <strong className="text-white">{portfolioData?.role_title || activeRole?.title}</strong>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPortfolio.map((sk) => {
              const isVerified = sk.is_verified;
              const hasEvidence = !!sk.evidence_link;

              return (
                <div
                  key={sk.skill_id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/40">
                        {sk.category || 'Skill'}
                      </span>

                      {/* Verification Status Badge */}
                      {isVerified ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified ({sk.verified_score}%)</span>
                        </span>
                      ) : hasEvidence ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                          <FileCheck2 className="w-3 h-3" />
                          <span>Evidence Submitted</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-800">
                          Self-Reported
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">{sk.skill_name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{sk.description}</p>
                  </div>

                  {/* Level Meter and Evidence Link */}
                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Proficiency:</span>
                      <span className="text-cyan-300 font-bold">
                        Level {sk.effective_level} / 5
                      </span>
                    </div>

                    {hasEvidence && (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-300 truncate max-w-[180px]">
                          {sk.evidence_link}
                        </span>
                        <a
                          href={sk.evidence_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 p-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedSkillForEvidence(sk);
                        setEvidenceModalOpen(true);
                      }}
                      className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{hasEvidence ? 'Update Evidence' : 'Submit Practical Evidence'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 2: VISUAL SKILL TREE                                    */}
      {/* ============================================================== */}
      {currentTab === 'tree' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-cyan-400" />
              <span>Competency Skill Tree for {activeRole?.title || 'Target Track'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive RPG skill tree. Foundational prerequisites unlock intermediate and specialized capstone nodes.
            </p>

            {skillTree?.nodes ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {skillTree.nodes.map((node) => {
                  const isUnlocked = node.unlocked || node.is_unlocked;
                  return (
                    <div
                      key={node.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isUnlocked
                          ? 'bg-slate-950/80 border-cyan-500/40 shadow-sm'
                          : 'bg-slate-950/30 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{node.name || node.title}</span>
                        {isUnlocked ? (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">Unlocked</span>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-2">
                        Tier {node.tier || 1} • {node.category || 'Core'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-500">
                Loading interactive skill tree...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 3: PERSONAL LEARNING CALENDAR                           */}
      {/* ============================================================== */}
      {currentTab === 'activity' && (
        <PersonalLearningCalendar profile={profile} />
      )}

      {/* ============================================================== */}
      {/* SUBTAB 4: ACHIEVEMENTS & BADGES                                */}
      {/* ============================================================== */}
      {currentTab === 'achievements' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span>Earned RPG Badges & Milestones</span>
            </h2>
            <p className="text-xs text-slate-400">
              Verified accomplishments unlocked through practical coding, streak milestones, and assessment growth.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                { name: 'First Mission Accomplished', desc: 'Completed your first learning milestone task', unlocked: true },
                { name: 'Diagnostic Pioneer', desc: 'Completed a career technical assessment', unlocked: !!profile?.assessed_skills },
                { name: 'Week 1 Survivor', desc: 'Maintained a 7-day study streak', unlocked: currentDailyStreak >= 7 },
                { name: 'Verified Portfolio Builder', desc: 'Submitted practical repository evidence', unlocked: (portfolioData?.skills || []).some((s) => s.evidence_link) },
                { name: 'Level 5 Master', desc: 'Earned 1000+ total platform XP', unlocked: gamification.xp >= 1000 },
                { name: 'Career Ready Architect', desc: 'Achieved 80%+ verified career readiness', unlocked: readinessScore >= 80 },
              ].map((ach, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    ach.unlocked
                      ? 'bg-slate-950 border-purple-500/40 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-2 rounded-xl text-xs font-bold ${
                        ach.unlocked
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-slate-900 text-slate-600'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ach.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{ach.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit Evidence Modal */}
      {evidenceModalOpen && selectedSkillForEvidence && (
        <Modal
          isOpen={evidenceModalOpen}
          onClose={() => setEvidenceModalOpen(false)}
          title={`Submit Practical Evidence: ${selectedSkillForEvidence.skill_name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmitEvidence} className="space-y-4 text-xs">
            <p className="text-slate-400 leading-relaxed">
              Demonstrate verifiable competency for <strong>{selectedSkillForEvidence.skill_name}</strong>. Provide a link to your GitHub repository, live web deployment, or technical documentation.
            </p>

            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold uppercase">Evidence Type</label>
              <select
                value={evidenceForm.evidenceType}
                onChange={(e) => setEvidenceForm({ ...evidenceForm, evidenceType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="github_repo">GitHub Repository</option>
                <option value="live_url">Live Deployment / Web Application</option>
                <option value="project_artifact">Project Artifact / Document</option>
                <option value="certification">Industry Certification</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold uppercase">Evidence URL *</label>
              <input
                type="url"
                required
                value={evidenceForm.evidenceUrl}
                onChange={(e) => setEvidenceForm({ ...evidenceForm, evidenceUrl: e.target.value })}
                placeholder="https://github.com/username/project"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold uppercase">Deliverable Title</label>
              <input
                type="text"
                value={evidenceForm.title}
                onChange={(e) => setEvidenceForm({ ...evidenceForm, title: e.target.value })}
                placeholder={`e.g. ${selectedSkillForEvidence.skill_name} Microservice Implementation`}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 font-bold uppercase">Self-Assessed Proficiency Level (1 to 5)</label>
              <select
                value={evidenceForm.selfProficiencyLevel}
                onChange={(e) => setEvidenceForm({ ...evidenceForm, selfProficiencyLevel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value={1}>Level 1 - Novice (Basic Syntax)</option>
                <option value={2}>Level 2 - Beginner (Can build with guidance)</option>
                <option value={3}>Level 3 - Intermediate (Autonomous implementation)</option>
                <option value={4}>Level 4 - Advanced (Production-grade, optimized)</option>
                <option value={5}>Level 5 - Expert (Architectural mastery)</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEvidenceModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingEvidence}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-extrabold"
              >
                {isSubmittingEvidence ? 'Submitting...' : 'Record Evidence (+40 XP)'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

