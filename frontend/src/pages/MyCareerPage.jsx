import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { rolesApi } from '../services/api';
import {
  Briefcase,
  ShieldCheck,
  GraduationCap,
  Award,
  TrendingUp,
  Cpu,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Target,
  BarChart2,
  Terminal,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { getCareerEnvironment } from '../utils/careerEnvironments';
import { getCareerTheme } from '../utils/careerThemes';

export default function MyCareerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeRole, activeRoadmap, allRoles, switchCareer, triggerCelebration, profile, addToast } = useApp();

  const activeTab = searchParams.get('tab') || 'overview';
  const [roleDetail, setRoleDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const careerId = activeRole?.id || activeRoadmap?.role_id;
  const careerTitle = activeRole?.title || activeRoadmap?.role_title || 'Software Development Engineer';

  useEffect(() => {
    if (careerId) {
      setLoading(true);
      rolesApi
        .getDetail(careerId)
        .then(setRoleDetail)
        .catch(() => setRoleDetail(activeRole))
        .finally(() => setLoading(false));
    } else {
      setRoleDetail(activeRole);
      setLoading(false);
    }
  }, [careerId, activeRole]);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const environment = getCareerEnvironment(activeRole?.slug || activeRole?.title || careerTitle);
  const theme = getCareerTheme(activeRole?.slug || activeRole?.title || careerTitle);

  const TABS = [
    { id: 'overview', label: 'Career Overview', icon: Briefcase },
    { id: 'eligibility', label: 'Eligibility', icon: ShieldCheck },
    { id: 'qualifications', label: 'Qualifications', icon: GraduationCap },
    { id: 'skills', label: 'Required Skills', icon: Award },
    { id: 'progression', label: 'Career Progression', icon: TrendingUp },
    { id: 'environment', label: 'Career Environment', icon: Cpu },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fadeIn">
      {/* Top Banner */}
      <div
        className="p-6 sm:p-8 rounded-3xl border backdrop-blur-xl relative overflow-hidden transition-all"
        style={{
          backgroundColor: theme.palette?.cardBg || 'rgba(12, 18, 36, 0.94)',
          borderColor: theme.palette?.cardBorder || 'rgba(0, 240, 255, 0.35)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Enrolled Target Career
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-300">
                {activeRole?.domain || roleDetail?.domain || 'Professional Track'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {careerTitle}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {roleDetail?.short_summary || activeRole?.short_summary || 'Industry calibrated preparation curriculum and competency verification standards.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-mono text-cyan-400">Switch Career Track:</span>
              <select
                value={activeRole?.id || ''}
                onChange={async (e) => {
                  if (e.target.value) {
                    await switchCareer(Number(e.target.value));
                    triggerCelebration();
                  }
                }}
                className="glass-input py-1 px-3 text-xs font-semibold bg-navy-950/90 border-cyan-500/40 text-cyan-200 rounded-xl cursor-pointer max-w-xs"
              >
                {allRoles.map((r) => (
                  <option key={r.id} value={r.id} className="bg-navy-900 text-slate-200">
                    {r.title} ({r.category || r.domain || 'Tech'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate(`/assessment?career=${activeRole?.slug || activeRole?.id || ''}`)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Verify Skills in Assessment</span>
            </button>

            <Link
              to="/discovery"
              className="btn-secondary text-xs py-2.5 px-4 cursor-pointer"
            >
              Browse All Domains
            </Link>
          </div>
        </div>
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

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Benchmark Compensation</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                {roleDetail?.average_salary_range || '$115,000 / yr'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Market median entry-to-mid range</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Hiring Velocity</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 mt-1 block">
                {roleDetail?.market_demand || 'High'} Demand
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Active across enterprise sectors</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Your Placement Readiness</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-400 mt-1 block">
                {activeRoadmap?.readiness_score || 0}%
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Objective 5-pillar evaluation</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Career Track Description & Industry Role</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {roleDetail?.description || roleDetail?.short_summary || activeRole?.description}
            </p>
          </div>
        </div>
      )}

      {/* 2. ELIGIBILITY TAB */}
      {activeTab === 'eligibility' && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Academic Stream & Entry Eligibility Criteria</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              RoadmapIQ supports students transitioning from various streams into this profession. Verify the degree and background requirements below:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs font-semibold text-white">Recommended Academic Streams:</span>
                <p className="text-xs text-slate-400">
                  Engineering, Computer Science, Statistics, Mathematics, or relevant domain-specific degree. Self-taught students with verified portfolio deliverables also qualify for technical roles.
                </p>
              </div>

              {roleDetail?.regulatory_disclaimer && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <strong className="block text-amber-300 font-bold mb-0.5">Statutory & Licensing Disclaimer:</strong>
                    <span className="leading-relaxed">{roleDetail.regulatory_disclaimer}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. QUALIFICATIONS TAB */}
      {activeTab === 'qualifications' && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
              <span>Industry Recognized Credentials & Certifications</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-white">RoadmapIQ Verified Skill Assessment</div>
                <div className="text-xs text-emerald-400 font-mono">Passing Grade: 70%+</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Earn placement readiness clearance by passing the dynamic 25-question scenario test calibrated for {careerTitle}.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-white">Industry Portfolio Deliverables</div>
                <div className="text-xs text-cyan-400 font-mono">2 Production Milestones</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Demonstrate end-to-end capability with verifiable GitHub or document deliverables.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. REQUIRED SKILLS TAB */}
      {activeTab === 'skills' && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <span>Core Competencies & Tools</span>
              </h3>
              <button
                onClick={() => navigate('/skill-gap')}
                className="text-xs text-cyan-400 font-mono hover:underline"
              >
                Analyze My Skill Gaps →
              </button>
            </div>

            {/* Core Competencies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(roleDetail?.core_competencies || activeRole?.core_competencies || []).map((skill, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-xs text-slate-200 font-medium">{skill}</span>
                </div>
              ))}
            </div>

            {/* Tools & Stack */}
            {(roleDetail?.tools_technologies || activeRole?.tools_technologies) && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-xs font-mono uppercase text-slate-400 font-bold block">
                  Industry Tooling & Ecosystem:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(roleDetail?.tools_technologies || activeRole?.tools_technologies).map((tool, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-300">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. CAREER PROGRESSION TAB */}
      {activeTab === 'progression' && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>Hierarchical Career Ladder & Compensation Milestones</span>
            </h3>

            <div className="space-y-3 pt-2">
              {[
                { title: `Junior ${careerTitle}`, exp: '0–2 Years', comp: '$80,000 – $105,000', focus: 'Foundational syntax, feature implementation, and collaborative workflows.' },
                { title: `Mid-Level ${careerTitle}`, exp: '2–5 Years', comp: '$110,000 – $145,000', focus: 'Autonomous design, system architecture, performance optimization & testing.' },
                { title: `Senior ${careerTitle}`, exp: '5–8 Years', comp: '$150,000 – $195,000', focus: 'Cross-functional leadership, architectural resilience & team mentorship.' },
                { title: `Principal / Lead ${careerTitle}`, exp: '8+ Years', comp: '$200,000+', focus: 'Executive strategy, technological roadmap, patent creation & institutional governance.' },
              ].map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-mono font-bold">
                        {idx + 1}
                      </span>
                      <span>{step.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">({step.exp})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-7">{step.focus}</p>
                  </div>
                  <div className="text-right pl-7 sm:pl-0">
                    <span className="text-xs font-mono font-bold text-emerald-400">{step.comp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. CAREER ENVIRONMENT TAB */}
      {activeTab === 'environment' && (
        <div className="space-y-5">
          <div
            className="p-6 sm:p-8 rounded-3xl border backdrop-blur-xl relative overflow-hidden space-y-5"
            style={{
              backgroundColor: environment.theme?.cardBg || 'rgba(12, 18, 36, 0.94)',
              borderColor: environment.theme?.cardBorder || 'rgba(0, 240, 255, 0.35)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold block">Professional Visual World</span>
                <h3 className="text-xl font-bold text-white mt-1">{environment.environmentName}</h3>
              </div>
              <Badge variant="primary">{environment.visualConcept}</Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {environment.tagline}
            </p>

            {/* Terminal Preview */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{environment.theme?.editorFile || 'environment.config'}</span>
                </span>
                <span className="text-emerald-400 text-[10px]">{environment.statusIndicator}</span>
              </div>
              <div className="text-cyan-300 pt-1">
                <code>$ {environment.terminalPrompt}</code>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(environment.hudBadges || []).map((badge, idx) => (
                <span key={idx} className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-700/80 text-xs font-mono text-slate-200">
                  {badge}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => navigate(`/assessment?career=${activeRole?.slug || activeRole?.id || ''}`)}
                className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
              >
                <span>Enter Assessment in {environment.environmentName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

