import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { rolesApi, profileApi } from '../services/api';
import {
  Compass,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Briefcase,
  Scale,
  Code2,
  Coffee,
  FileCode,
  Layout,
  BarChart3,
  LineChart,
  Cpu,
  CheckCircle,
  FolderGit2,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  GraduationCap,
  Heart,
  Landmark,
  Wrench,
  BookOpen,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { SkeletonCard } from '../components/common/LoadingSkeleton';
import Modal from '../components/common/Modal';
import { getCareerTheme } from '../utils/careerThemes';
import CareerDiscoveryModal from '../components/discovery/CareerDiscoveryModal';

// Icon mapping helper
const getRoleIcon = (slug = '', domain = '') => {
  const s = slug.toLowerCase();
  const d = domain.toLowerCase();
  if (s.includes('java')) return Coffee;
  if (s.includes('python')) return FileCode;
  if (s.includes('frontend') || s.includes('design')) return Layout;
  if (s.includes('data-analyst') || s.includes('analyst')) return BarChart3;
  if (s.includes('data-scientist') || s.includes('scientist')) return LineChart;
  if (s.includes('ai') || s.includes('learning')) return Sparkles;
  if (s.includes('qa') || s.includes('test')) return CheckCircle;
  if (s.includes('law') || s.includes('legal') || d.includes('law')) return Scale;
  if (s.includes('medical') || s.includes('doctor') || d.includes('healthcare')) return Heart;
  if (s.includes('civil-service') || s.includes('ias') || d.includes('government')) return Landmark;
  if (s.includes('mechanical') || s.includes('electrical') || d.includes('engineering')) return Wrench;
  if (s.includes('software') || s.includes('developer')) return Code2;
  return Briefcase;
};

const ALL_18_DOMAINS = [
  'All Domains',
  'Technology & IT',
  'AI & Machine Learning',
  'Data Science & Analytics',
  'Commerce & Finance',
  'Arts & Humanities',
  'Business & Management',
  'Healthcare & Life Sciences',
  'Core Engineering',
  'Cybersecurity',
  'Cloud & DevOps',
  'Law & Legal Studies',
  'Education & Research',
  'Government & Public Services',
  'Psychology & Behavioral Science',
  'Design, Media & Creative Arts',
  'Hospitality & Tourism',
  'Agriculture & Environmental Science',
  'Entrepreneurship & Innovation',
];

const CareerExplorerPage = () => {
  const navigate = useNavigate();
  const { allRoles, profile, setProfile, setActiveRole, addToast, switchCareer } = useApp();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  const [selectedRoleDetail, setSelectedRoleDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [selectingRole, setSelectingRole] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const data = await rolesApi.getAll();
        setRoles(data);
      } catch (err) {
        addToast('error', 'Failed to fetch career roles from backend.', 'Error');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [addToast]);

  const handleOpenDetail = async (role) => {
    setIsModalOpen(true);
    setDetailLoading(true);
    try {
      const detail = await rolesApi.getDetail(role.id);
      setSelectedRoleDetail(detail);
    } catch (err) {
      addToast('error', 'Could not load role curriculum details.', 'Error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectRole = async (role) => {
    setSelectingRole(true);
    const targetRoleId = role.id || role.role_id;
    try {
      if (switchCareer) {
        await switchCareer(targetRoleId);
      } else {
        setActiveRole(role);
        if (profile?.id) {
          const updated = await profileApi.update(profile.id, { target_role_id: targetRoleId });
          setProfile(updated);
        }
      }
      setIsModalOpen(false);
      addToast('success', `Target career set to ${role.title}!`, 'Target Role Set');
      navigate('/roadmap');
    } catch (err) {
      addToast('error', err.message || 'Could not update target role.', 'Selection Error');
    } finally {
      setSelectingRole(false);
    }
  };

  const handleStartAssessmentForRole = (role) => {
    setActiveRole(role);
    navigate(`/assessment?career=${role.slug || role.id}`);
  };

  const filteredRoles = roles.filter((role) => {
    const roleDomain = role.domain || role.category || '';
    const matchesDomain =
      selectedDomain === 'All Domains' ||
      roleDomain.toLowerCase() === selectedDomain.toLowerCase() ||
      role.category?.toLowerCase() === selectedDomain.toLowerCase();

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      role.title.toLowerCase().includes(searchLower) ||
      role.short_summary.toLowerCase().includes(searchLower) ||
      (role.domain && role.domain.toLowerCase().includes(searchLower)) ||
      (role.category && role.category.toLowerCase().includes(searchLower)) ||
      (role.tools_technologies && role.tools_technologies.some((t) => t.toLowerCase().includes(searchLower))) ||
      (role.core_competencies && role.core_competencies.some((c) => c.toLowerCase().includes(searchLower)));

    return matchesDomain && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* 1. Hero & Discovery Options Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-700/80 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary">RoadmapIQ All-Domain Catalog</Badge>
              <span className="text-xs font-mono text-cyan-400">252 Verified Career Tracks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Explore Careers Across All 18 Academic Disciplines
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              From Engineering and AI to Medicine, Law, Public Policy, Humanities, and Commerce. Each career features industry-calibrated competencies, free learning resources, and customizable skill assessments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDiscoveryOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4" />
              <span>Help Me Discover My Career</span>
            </button>

            <button
              onClick={() => navigate('/compare')}
              className="btn-secondary py-3 px-4 text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Compare Careers</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Domain Filter & Search Bar */}
      <div className="glass-panel p-5 space-y-4">
        {/* Search Input */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by career, tool (Python, SQL, Lexis), or skill..."
              className="glass-input w-full pl-10"
            />
          </div>

          <div className="text-xs font-mono text-slate-400 self-start md:self-auto">
            Showing <strong className="text-white">{filteredRoles.length}</strong> careers
          </div>
        </div>

        {/* 18 Domain Horizontal Scroll Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ALL_18_DOMAINS.map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedDomain === domain
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan/20'
                  : 'bg-slate-850/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Role Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 space-y-3">
          <p className="text-sm">No career roles found matching "{searchTerm}" in {selectedDomain}.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedDomain('All Domains');
            }}
            className="text-xs text-cyan-400 underline font-mono"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => {
            const Icon = getRoleIcon(role.slug, role.domain || role.category);
            const isSelected = profile?.target_role_id === role.id || activeRole?.id === role.id;
            const theme = getCareerTheme(role.slug || role.title);
            const hasRegulatoryDisclaimer = Boolean(role.regulatory_disclaimer);

            return (
              <div
                key={role.id}
                className={`glass-card p-6 flex flex-col justify-between transition-all duration-200 hover:border-slate-600 ${
                  isSelected ? 'border-cyan-400 shadow-glow-cyan/20 bg-navy-850' : ''
                }`}
              >
                <div>
                  {/* Top Bar: Icon & Category */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm"
                      style={{
                        backgroundColor: `${theme.palette.primary}15`,
                        borderColor: `${theme.palette.primary}40`,
                        color: theme.palette.primary,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {role.domain || role.category}
                      </span>
                      {role.market_demand && (
                        <span className="text-[10px] font-mono font-semibold text-emerald-400">
                          {role.market_demand} Demand
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Theme Badge */}
                  <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-1.5">
                    <span>{role.title}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </h3>

                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border flex items-center gap-1"
                      style={{
                        backgroundColor: `${theme.palette.primary}12`,
                        borderColor: `${theme.palette.primary}40`,
                        color: theme.palette.primary,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.palette.primary }} />
                      <span>{theme.name}</span>
                    </span>
                  </div>

                  {/* Statutory Regulatory Disclaimer Badge (Medical, Law, UPSC, CA) */}
                  {hasRegulatoryDisclaimer && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] flex items-start gap-1.5 mb-3 leading-snug">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                      <span><strong>Statutory:</strong> {role.regulatory_disclaimer}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                    {role.short_summary || role.description}
                  </p>

                  {/* Tools preview */}
                  {role.tools_technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {role.tools_technologies.slice(0, 3).map((tool, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60">
                          {tool}
                        </span>
                      ))}
                      {role.tools_technologies.length > 3 && (
                        <span className="text-[10px] font-mono text-slate-500">
                          +{role.tools_technologies.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="text-slate-400">Benchmark:</span>
                    <span className="font-mono font-semibold text-emerald-400">{role.average_salary_range}</span>
                  </div>

                  {/* Primary 1-Click Set Target Action */}
                  {isSelected ? (
                    <div className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <span>Active Target Career Track</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectRole(role)}
                      disabled={selectingRole}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition cursor-pointer"
                    >
                      <Target className="w-4 h-4" />
                      <span>Set as Target Career</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(role)}
                      className="btn-secondary text-xs py-2 px-3 text-center justify-center"
                    >
                      Curriculum
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartAssessmentForRole(role)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1 border border-slate-700 transition"
                    >
                      <span>Take Test</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Interactive Discovery Questionnaire Modal */}
      <CareerDiscoveryModal
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        onSelectCareer={(career) => {
          handleSelectRole(career);
        }}
      />

      {/* 5. Role Curriculum Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRoleDetail?.title || 'Career Path Curriculum'}
        maxWidth="max-w-3xl"
      >
        {detailLoading || !selectedRoleDetail ? (
          <div className="space-y-4 py-6">
            <div className="h-4 bg-slate-800 rounded w-1/3 animate-pulse" />
            <div className="h-16 bg-slate-800 rounded w-full animate-pulse" />
            <div className="h-32 bg-slate-800 rounded w-full animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedRoleDetail.description}
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400 font-mono">
                <span>Domain: <strong className="text-slate-200">{selectedRoleDetail.domain || selectedRoleDetail.category}</strong></span>
                <span>Salary: <strong className="text-emerald-400">{selectedRoleDetail.average_salary_range}</strong></span>
                <span>Demand: <strong className="text-sky-400">{selectedRoleDetail.market_demand}</strong></span>
              </div>
            </div>

            {/* Regulatory Notice in modal */}
            {selectedRoleDetail.regulatory_disclaimer && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <div className="font-bold text-amber-300">Mandatory Statutory & Licensing Requirement</div>
                  <div className="mt-0.5 leading-relaxed">{selectedRoleDetail.regulatory_disclaimer}</div>
                </div>
              </div>
            )}

            {/* Core Required Skills */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2.5">
                Core Curriculum Requirements ({selectedRoleDetail.requirements?.length || 0})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedRoleDetail.requirements?.map((req) => (
                  <div key={req.skill_id} className="p-2.5 rounded-lg bg-navy-850 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">{req.skill_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {req.prerequisites?.length > 0 ? `Requires: ${req.prerequisites.join(', ')}` : 'Foundational'}
                      </div>
                    </div>
                    <Badge variant={req.required_proficiency === 3 ? 'primary' : 'blue'} size="xs">
                      Lvl {req.required_proficiency} Req
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Projects */}
            {selectedRoleDetail.suggested_projects?.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2.5 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Curated Portfolio Projects</span>
                </h4>
                <div className="space-y-2">
                  {selectedRoleDetail.suggested_projects.map((proj) => (
                    <div key={proj.id} className="p-3 rounded-lg bg-navy-850 border border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-200">{proj.name}</span>
                        <Badge variant="indigo" size="xs">{proj.difficulty}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{proj.problem_statement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Action */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleStartAssessmentForRole(selectedRoleDetail)}
                className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <span>Take Custom Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole(selectedRoleDetail)}
                  disabled={selectingRole}
                  className="btn-primary text-xs px-5 py-2"
                >
                  <span>Select Role & Generate Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CareerExplorerPage;
