import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { rolesApi, profileApi, discoveryApi, roadmapsApi } from '../services/api';
import {
  Compass,
  Search,
  Filter,
  Sparkles,
  Layers,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Award,
  BookOpen,
  Briefcase,
  DollarSign,
  GraduationCap,
  Scale,
  Clock,
  TrendingUp,
  Cpu,
  Shield,
  Heart,
  Globe,
  X,
  Play,
  RotateCcw,
  Target,
  Sliders,
  Check,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import CareerDiscoveryModal from '../components/discovery/CareerDiscoveryModal';
import { DOMAIN_DETAILS } from './ExploreHubPage';
import { getCareerTheme } from '../utils/careerThemes';

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    profile,
    setProfile,
    activeRole,
    allRoles,
    switchCareer,
    addToast,
    triggerCelebration,
    isSwitchingCareer,
  } = useApp();

  const currentTab = searchParams.get('tab') || 'explore';

  const setTab = (tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  // State for Catalog
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState('all');
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState(null);

  // State for Saved Careers
  const [savedCareers, setSavedCareers] = useState([]);

  // State for Compare
  const [compareList, setCompareList] = useState([]);

  // State for Discovery Wizard Modal
  const [isDiscoveryWizardOpen, setIsDiscoveryWizardOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // State for Target Setting Form
  const [targetForm, setTargetForm] = useState({
    goal: profile?.career_goals || 'Land First High-Paying Role',
    targetRoleId: activeRole?.id || '',
    durationWeeks: profile?.target_duration_weeks || 12,
    weeklyHours: profile?.weekly_study_hours || 15,
  });
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [activatingRoleId, setActivatingRoleId] = useState(null);
  const [activateError, setActivateError] = useState(null);

  // Initialize roles from allRoles or fetch
  useEffect(() => {
    if (allRoles && allRoles.length > 0) {
      setRoles(allRoles);
    } else {
      setLoading(true);
      rolesApi
        .getAll()
        .then((data) => setRoles(data || []))
        .catch((err) => console.warn('Could not fetch roles:', err))
        .finally(() => setLoading(false));
    }
  }, [allRoles]);

  // Load saved careers from backend profile or localStorage
  useEffect(() => {
    const loadSaved = async () => {
      if (profile?.id) {
        try {
          const remoteSaved = await profileApi.getSavedCareers(profile.id);
          if (Array.isArray(remoteSaved) && remoteSaved.length > 0) {
            setSavedCareers(remoteSaved);
            localStorage.setItem('roadmapiq_saved_careers', JSON.stringify(remoteSaved));
            return;
          }
        } catch {
          // fallback to localStorage
        }
      }
      const raw = localStorage.getItem('roadmapiq_saved_careers');
      if (raw) {
        try {
          setSavedCareers(JSON.parse(raw));
        } catch {
          setSavedCareers([]);
        }
      }
    };
    loadSaved();
  }, [profile?.id]);

  // Sync target form when activeRole changes
  useEffect(() => {
    if (activeRole) {
      setTargetForm((prev) => ({
        ...prev,
        targetRoleId: activeRole.id,
      }));
    }
  }, [activeRole]);

  // Toggle Save Career (Persists to both Neon PostgreSQL and localStorage)
  const toggleSaveCareer = async (role, e) => {
    if (e) e.stopPropagation();
    const isSaved = savedCareers.some((c) => c.id === role.id);
    let next;
    if (isSaved) {
      next = savedCareers.filter((c) => c.id !== role.id);
      addToast('info', `Removed ${role.title} from saved careers.`, 'Bookmark Updated');
      if (profile?.id) {
        profileApi.removeSavedCareer(profile.id, role.id).catch(() => null);
      }
    } else {
      const item = { id: role.id, title: role.title, domain: role.domain, slug: role.slug };
      next = [...savedCareers, item];
      addToast('success', `Saved ${role.title} to your career bookmarks!`, 'Career Bookmarked');
      if (profile?.id) {
        profileApi.saveCareer(profile.id, role.id).catch(() => null);
      }
    }
    setSavedCareers(next);
    localStorage.setItem('roadmapiq_saved_careers', JSON.stringify(next));
  };

  // Toggle Compare
  const toggleCompare = (role, e) => {
    if (e) e.stopPropagation();
    if (compareList.some((c) => c.id === role.id)) {
      setCompareList(compareList.filter((c) => c.id !== role.id));
    } else {
      if (compareList.length >= 3) {
        addToast('warning', 'You can compare up to 3 careers simultaneously.', 'Comparison Limit');
        return;
      }
      setCompareList([...compareList, role]);
      addToast('info', `Added ${role.title} to comparison.`, 'Comparing Careers');
    }
  };

  // Switch Active Career Target
  const handleActivateCareer = async (roleId, customSettings = {}) => {
    if (!roleId || isSwitchingCareer) return;
    setActivatingRoleId(roleId);
    setActivateError(null);
    try {
      await switchCareer(roleId, customSettings);
      triggerCelebration();
      addToast('success', 'Active career target saved in Neon database! Your progress and roadmaps are synchronized.', 'Target Saved');
      return true;
    } catch (err) {
      const msg = err.message || 'Could not save target career. Please check network connection and try again.';
      setActivateError(msg);
      addToast('error', msg, 'Target Selection Error');
      return false;
    } finally {
      setActivatingRoleId(null);
    }
  };

  // Handle Save Target from Form
  const handleSaveTargetForm = async (e) => {
    e.preventDefault();
    if (!targetForm.targetRoleId) {
      addToast('warning', 'Please select a target career track.', 'Selection Required');
      return;
    }
    setIsSavingTarget(true);
    setActivateError(null);
    try {
      const targetId = Number(targetForm.targetRoleId);
      // Persist target and options atomically
      await switchCareer(targetId, {
        careerGoals: targetForm.goal,
        durationWeeks: Number(targetForm.durationWeeks),
        weeklyHours: Number(targetForm.weeklyHours),
      });

      triggerCelebration();
      addToast('success', `Target set to ${allRoles.find((r) => r.id === targetId)?.title || 'Selected Track'}. Ready for assessment!`, 'Target Locked');
      navigate('/assess?tab=take');
    } catch (err) {
      const msg = err.message || 'Failed to update target.';
      setActivateError(msg);
      addToast('error', msg, 'Error');
    } finally {
      setIsSavingTarget(false);
    }
  };

  // Filtered Roles (Tokenized multi-word search matching across title, tools, description, domain, and slug)
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const q = searchQuery.toLowerCase().trim();
      const tokens = q.split(/\s+/).filter(Boolean);

      const toolsText = Array.isArray(role.tools_and_technologies)
        ? role.tools_and_technologies.join(' ')
        : (role.tools || []).join(' ');
      const skillsText = Array.isArray(role.skills)
        ? role.skills.map((s) => (typeof s === 'string' ? s : s.name)).join(' ')
        : '';
      const competenciesText = Array.isArray(role.core_competencies)
        ? role.core_competencies.join(' ')
        : '';

      const searchableHaystack = [
        role.title || '',
        role.domain || '',
        role.subdomain || '',
        role.category || '',
        role.slug || '',
        role.description || '',
        role.short_summary || '',
        toolsText,
        skillsText,
        competenciesText,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = tokens.length === 0 || tokens.every((token) => searchableHaystack.includes(token));

      const matchesDomain =
        selectedDomain === 'all' ||
        (role.domain && role.domain.toLowerCase().includes(selectedDomain.toLowerCase()));

      return matchesSearch && matchesDomain;
    });
  }, [roles, searchQuery, selectedDomain]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Compass className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Module 1 • Career Discovery
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Discover Your Ideal Career Track
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Explore 259+ careers across 18 academic domains, compare options side-by-side, receive AI-powered recommendations, and lock in your target path.
            </p>
          </div>

          {/* Quick Target Status & Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {activeRole && (
              <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400">Current Target</div>
                  <div className="text-xs font-bold text-white truncate max-w-[160px]">{activeRole.title}</div>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsDiscoveryWizardOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Career Matcher</span>
            </button>
          </div>
        </div>

        {/* Four Primary Sub-tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'explore'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Explore & Search (259+)</span>
          </button>

          <button
            onClick={() => setTab('suggestions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'suggestions'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Suggestions</span>
            {aiSuggestions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px]">
                {aiSuggestions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('compare')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'compare'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            <span>Compare Careers</span>
            {compareList.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 text-[10px]">
                {compareList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('target')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              currentTab === 'target'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Set Target & Saved</span>
            {savedCareers.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px]">
                {savedCareers.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUBTAB 1: EXPLORE & SEARCH                                      */}
      {/* ============================================================== */}
      {currentTab === 'explore' && (
        <div className="space-y-6">
          {/* Search and Filters Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 259+ careers by title, skills, or domain (e.g. Java, Data, Cyber, Bio)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All 18 Domains</option>
                {DOMAIN_DETAILS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>

              <div className="text-xs text-slate-500 font-mono whitespace-nowrap">
                {filteredRoles.length} Careers
              </div>
            </div>
          </div>

          {/* Quick Domain Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                selectedDomain === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Domains
            </button>
            {DOMAIN_DETAILS.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  selectedDomain === d.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Careers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => {
              const isActiveTarget = activeRole?.id === role.id;
              const isSaved = savedCareers.some((c) => c.id === role.id);
              const isCompared = compareList.some((c) => c.id === role.id);

              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRoleForDetail(role)}
                  className={`group relative p-5 rounded-2xl bg-slate-900/80 border transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between ${
                    isActiveTarget
                      ? 'border-cyan-500 shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
                        {role.domain || 'Technology & IT'}
                      </span>
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => toggleSaveCareer(role, e)}
                          title={isSaved ? 'Remove from saved' : 'Save career'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isSaved
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => toggleCompare(role, e)}
                          title={isCompared ? 'Remove from compare' : 'Compare career'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isCompared
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                          }`}
                        >
                          <Scale className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {role.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {role.description || 'Comprehensive career track with structured learning stages, core competencies, and practical projects.'}
                      </p>
                    </div>

                    {/* Skill Tags */}
                    {role.skills && role.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {role.skills.slice(0, 3).map((sk, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                          >
                            {typeof sk === 'string' ? sk : sk.name}
                          </span>
                        ))}
                        {role.skills.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5">
                            +{role.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    {isActiveTarget ? (
                      <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active Target</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivateCareer(role.id)}
                        disabled={isSwitchingCareer}
                        className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          activatingRoleId === role.id
                            ? 'text-cyan-400 animate-pulse'
                            : 'text-slate-300 hover:text-cyan-300'
                        } disabled:opacity-50 cursor-pointer`}
                      >
                        {activatingRoleId === role.id ? (
                          <>
                            <div className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <span>Set as Target</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedRoleForDetail(role)}
                      className="text-xs text-slate-500 hover:text-white"
                    >
                      Details &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 2: AI SUGGESTIONS & MATCHER                              */}
      {/* ============================================================== */}
      {currentTab === 'suggestions' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Recommendation Engine</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Personalized Career Matching
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Our AI analyzes your educational stream ({profile?.educational_field || 'Engineering / Technology'}), current skills, and interests to rank the most viable career trajectories with concrete gap explanations.
              </p>
            </div>

            <button
              onClick={() => setIsDiscoveryWizardOpen(true)}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 whitespace-nowrap transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Retake Discovery Questionnaire</span>
            </button>
          </div>

          {aiSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {aiSuggestions.map((sugg, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 shadow-lg shadow-purple-500/5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300">
                      Match Rank #{idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {sugg.match_score || 94}% Fit
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{sugg.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3">
                      {sugg.rationale || sugg.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="text-[10px] uppercase font-mono text-slate-400">Why recommended:</div>
                    <div className="text-xs text-slate-300">{sugg.why_recommended || 'Strong alignment with your problem-solving interests and technical prerequisites.'}</div>
                  </div>

                  <button
                    onClick={() => handleActivateCareer(sugg.id || sugg.role_id)}
                    disabled={isSwitchingCareer}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSwitchingCareer && activatingRoleId === (sugg.id || sugg.role_id) ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                        <span>Saving Target in Database...</span>
                      </>
                    ) : (
                      <>
                        <span>Activate This Career Track</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <Sparkles className="w-10 h-10 text-purple-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No active suggestions loaded yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Complete the 3-minute Career Discovery Questionnaire to let RoadmapIQ generate ranked options customized to your academic history.
              </p>
              <button
                onClick={() => setIsDiscoveryWizardOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-2"
              >
                <span>Start Discovery Questionnaire</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 3: COMPARE CAREERS                                       */}
      {/* ============================================================== */}
      {currentTab === 'compare' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-400" />
                <span>Side-by-Side Career Comparison</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Compare up to 3 careers across required qualifications, duration, demand, and skill sets.
              </p>
            </div>
            {compareList.length > 0 && (
              <button
                onClick={() => setCompareList([])}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Clear comparison list
              </button>
            )}
          </div>

          {compareList.length >= 2 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60">
                    <th className="p-4 text-slate-400 font-mono uppercase tracking-wider w-44">Attribute</th>
                    {compareList.map((c) => (
                      <th key={c.id} className="p-4 text-white font-bold text-sm min-w-[220px]">
                        <div className="flex items-center justify-between">
                          <span>{c.title}</span>
                          <button
                            onClick={() => toggleCompare(c)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-4 text-slate-400 font-medium">Domain</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-4 font-mono text-cyan-300">
                        {c.domain || 'Technology & IT'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-slate-400 font-medium">Estimated Duration</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-4">
                        {c.typical_study_weeks || 12} Weeks (Standard)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-slate-400 font-medium">Salary Range</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-4 font-semibold text-emerald-400">
                        {c.salary_range || '₹8 LPA – ₹24 LPA'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-slate-400 font-medium">Core Required Skills</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {(c.skills || []).slice(0, 4).map((sk, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono"
                            >
                              {typeof sk === 'string' ? sk : sk.name}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-slate-400 font-medium">Action</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-4">
                        {activeRole?.id === c.id ? (
                          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active Track
                          </span>
                        ) : (
                          <button
                            onClick={() => handleActivateCareer(c.id)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                          >
                            Set Target
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 px-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <Scale className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Select at least 2 careers to compare</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Go to the Explore tab and click the Scale icon on any career card to add it to your comparison list.
              </p>
              <button
                onClick={() => setTab('explore')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <span>Browse Careers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 4: SET TARGET & SAVED CAREERS                            */}
      {/* ============================================================== */}
      {currentTab === 'target' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Target Setting Form (2 cols) */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                <Target className="w-3.5 h-3.5" />
                <span>Target Definition</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Set Target Career Track
              </h2>
              <p className="text-xs text-slate-400">
                Configure your target goal, desired career name, and preparation duration. Switching active targets preserves all completed task history.
              </p>
            </div>

            <form onSubmit={handleSaveTargetForm} className="space-y-5">
              {/* Goal Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  1. Preparation Goal
                </label>
                <select
                  value={targetForm.goal}
                  onChange={(e) => setTargetForm({ ...targetForm, goal: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Land First High-Paying Role">Land First High-Paying Role (College Student / Fresher)</option>
                  <option value="Non-Tech to Tech Transition">Non-Tech to Tech Career Transition</option>
                  <option value="Senior Level Promotion">Upskilling for Senior Promotion</option>
                  <option value="Remote Freelance Mastery">Remote / Global Freelancing</option>
                  <option value="Higher Education / Research">Preparation for Higher Research / M.S.</option>
                </select>
              </div>

              {/* Target Career Name Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  2. Target Career Name
                </label>
                <select
                  value={targetForm.targetRoleId}
                  onChange={(e) => setTargetForm({ ...targetForm, targetRoleId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Select Target Career --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.domain || 'Technology'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration and Weekly Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                    3. Target Duration
                  </label>
                  <select
                    value={targetForm.durationWeeks}
                    onChange={(e) => setTargetForm({ ...targetForm, durationWeeks: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={8}>8 Weeks (Intensive Bootcamp)</option>
                    <option value={12}>12 Weeks (Standard Semester Track)</option>
                    <option value={16}>16 Weeks (Comprehensive Preparation)</option>
                    <option value={24}>24 Weeks (Foundational Deep Dive)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                    Weekly Commitment
                  </label>
                  <select
                    value={targetForm.weeklyHours}
                    onChange={(e) => setTargetForm({ ...targetForm, weeklyHours: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={10}>10 Hours / Week (Casual)</option>
                    <option value={15}>15 Hours / Week (Balanced)</option>
                    <option value={25}>25 Hours / Week (Intense)</option>
                    <option value={35}>35+ Hours / Week (Full-time)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingTarget}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isSavingTarget ? (
                  <span>Locking Target & Initializing Track...</span>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    <span>Lock Target Career & Proceed to Assessment &rarr;</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Saved Careers Manager (1 col) */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>Saved Careers ({savedCareers.length})</span>
              </h3>
            </div>

            {savedCareers.length > 0 ? (
              <div className="space-y-2.5">
                {savedCareers.map((item) => {
                  const isActive = activeRole?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-cyan-950/40 border-cyan-500/50'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white">{item.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.domain || 'Technology'}</div>
                        </div>
                        <button
                          onClick={(e) => toggleSaveCareer(item, e)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        {isActive ? (
                          <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Active Track
                          </span>
                        ) : (
                          <button
                            onClick={() => handleActivateCareer(item.id)}
                            className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                          >
                            <span>Switch to this Career</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No bookmarked careers yet. Bookmark any career in the Explore tab to save it here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Role Details Modal */}
      {selectedRoleForDetail && (
        <Modal
          isOpen={!!selectedRoleForDetail}
          onClose={() => setSelectedRoleForDetail(null)}
          title={selectedRoleForDetail.title}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                  {selectedRoleForDetail.domain || 'Technology & IT'}
                </span>
                <div className="text-sm font-bold text-white mt-0.5">
                  Salary: {selectedRoleForDetail.salary_range || '₹8 LPA – ₹24 LPA'}
                </div>
              </div>
              {activeRole?.id === selectedRoleForDetail.id ? (
                <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Current Target</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await handleActivateCareer(selectedRoleForDetail.id);
                    if (ok) setSelectedRoleForDetail(null);
                  }}
                  disabled={isSwitchingCareer}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  {isSwitchingCareer && activatingRoleId === selectedRoleForDetail.id ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      <span>Saving Target...</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-3.5 h-3.5" />
                      <span>Set as My Target</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {activateError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center justify-between">
                <span>{activateError}</span>
                <button
                  onClick={() => handleActivateCareer(selectedRoleForDetail.id)}
                  className="ml-3 px-2 py-1 bg-red-500/20 hover:bg-red-500/40 rounded text-[11px] font-bold text-red-100"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Career Overview
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedRoleForDetail.description}
              </p>
            </div>

            {selectedRoleForDetail.required_education && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Recommended Educational Qualifications
                </h4>
                <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {Array.isArray(selectedRoleForDetail.required_education)
                    ? selectedRoleForDetail.required_education.join(', ')
                    : selectedRoleForDetail.required_education}
                </div>
              </div>
            )}

            {selectedRoleForDetail.skills && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Required Competencies & Tools
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRoleForDetail.skills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 text-cyan-300 border border-slate-800"
                    >
                      {typeof sk === 'string' ? sk : sk.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Discovery Questionnaire Modal */}
      {isDiscoveryWizardOpen && (
        <CareerDiscoveryModal
          isOpen={isDiscoveryWizardOpen}
          onClose={() => setIsDiscoveryWizardOpen(false)}
          onRecommendationsReady={(recs) => {
            setAiSuggestions(recs);
            setTab('suggestions');
            addToast('success', 'Generated personalized career recommendations based on your questionnaire!', 'AI Match Ready');
          }}
        />
      )}
    </div>
  );
}

