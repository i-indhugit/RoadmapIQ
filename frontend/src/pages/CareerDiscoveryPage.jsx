import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { rolesApi, profileApi } from '../services/api';
import {
  Compass,
  Search,
  Layers,
  Sparkles,
  Bookmark,
  Scale,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Heart,
  Landmark,
  Scale as ScaleIcon,
  Wrench,
  Cpu,
  GraduationCap,
  Globe,
  FileCode,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import CareerDiscoveryModal from '../components/discovery/CareerDiscoveryModal';
import { getCareerTheme } from '../utils/careerThemes';
import { matchesDomainFilter } from './ExploreHubPage';

const ALL_18_DOMAINS = [
  { code: 'A', id: 'Technology & IT', label: 'Technology & IT', icon: Cpu, rolesCount: 28, desc: 'Software development, full stack, mobile, architecture & systems.' },
  { code: 'B', id: 'AI & Machine Learning', label: 'AI & Machine Learning', icon: Sparkles, rolesCount: 15, desc: 'Machine learning, deep learning, NLP, computer vision & LLMs.' },
  { code: 'C', id: 'Data Science & Analytics', label: 'Data Science & Analytics', icon: Layers, rolesCount: 14, desc: 'Statistical modeling, business intelligence, big data & metrics.' },
  { code: 'D', id: 'Commerce & Finance', label: 'Commerce & Finance', icon: Briefcase, rolesCount: 17, desc: 'Corporate accounting, investment banking, ICAI CA & equity research.' },
  { code: 'E', id: 'Arts & Humanities', label: 'Arts & Humanities', icon: GraduationCap, rolesCount: 20, desc: 'Journalism, history, literature, content strategy & public communication.' },
  { code: 'F', id: 'Business & Management', label: 'Business & Management', icon: Briefcase, rolesCount: 16, desc: 'Product management, agile operations, executive strategy & HR.' },
  { code: 'G', id: 'Healthcare & Life Sciences', label: 'Healthcare & Life Sciences', icon: Heart, rolesCount: 15, desc: 'Medicine, clinical data, pharmacology & bioinformatics (NMC regulated).' },
  { code: 'H', id: 'Core Engineering', label: 'Core Engineering', icon: Wrench, rolesCount: 15, desc: 'Mechanical, civil structural, electrical systems & robotics.' },
  { code: 'I', id: 'Cybersecurity', label: 'Cybersecurity', icon: Briefcase, rolesCount: 12, desc: 'SOC defense, threat intelligence, pentesting & incident response.' },
  { code: 'J', id: 'Cloud & DevOps', label: 'Cloud & DevOps', icon: Globe, rolesCount: 12, desc: 'AWS/GCP solutions architecture, Kubernetes, Terraform & CI/CD.' },
  { code: 'K', id: 'Law & Legal Studies', label: 'Law & Legal Studies', icon: ScaleIcon, rolesCount: 11, desc: 'Corporate law, criminal litigation, IP & judiciary (Bar Council regulated).' },
  { code: 'L', id: 'Education & Research', label: 'Education & Research', icon: GraduationCap, rolesCount: 12, desc: 'Academic professorship, scientific research, edtech & curriculum design.' },
  { code: 'M', id: 'Government & Public Services', label: 'Government & Public Services', icon: Landmark, rolesCount: 12, desc: 'Civil Services (IAS/IPS), public policy & diplomacy (UPSC regulated).' },
  { code: 'N', id: 'Psychology & Behavioral Science', label: 'Psychology & Behavioral Science', icon: Heart, rolesCount: 10, desc: 'Clinical psychology, child counseling & organizational behavior.' },
  { code: 'O', id: 'Design, Media & Creative Arts', label: 'Design, Media & Creative Arts', icon: Sparkles, rolesCount: 14, desc: 'UI/UX design, motion graphics, game design & visual direction.' },
  { code: 'P', id: 'Hospitality & Tourism', label: 'Hospitality & Tourism', icon: Globe, rolesCount: 10, desc: 'Hotel operations, culinary arts, eco-tourism & event management.' },
  { code: 'Q', id: 'Agriculture & Environmental Science', label: 'Agriculture & Environmental Science', icon: Globe, rolesCount: 11, desc: 'Agronomy, precision agriculture, environmental assessment & ecology.' },
  { code: 'R', id: 'Entrepreneurship & Innovation', label: 'Entrepreneurship & Innovation', icon: Briefcase, rolesCount: 9, desc: 'Startup venture creation, incubator management & innovation strategy.' },
];

export default function CareerDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile, setProfile, setActiveRole, switchCareer, addToast } = useApp();

  const activeTab = searchParams.get('tab') || 'explore';

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedRoleDetail, setSelectedRoleDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
  const [savedRoleIds, setSavedRoleIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('roadmapiq_saved_careers') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    rolesApi
      .getAll()
      .then((data) => setRoles(data || []))
      .catch(() => addToast('error', 'Could not load career catalog.', 'Error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const handleToggleSave = (roleId) => {
    setSavedRoleIds((prev) => {
      const updated = prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId];
      localStorage.setItem('roadmapiq_saved_careers', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectRole = async (role) => {
    try {
      const targetRoleId = role.id || role.role_id;
      if (switchCareer) {
        await switchCareer(targetRoleId);
      } else {
        setActiveRole(role);
        if (profile?.id) {
          const updated = await profileApi.update(profile.id, { target_role_id: targetRoleId });
          setProfile(updated);
        }
      }
      setIsDetailOpen(false);
      addToast('success', `Target career set to ${role.title}!`, 'Career Selected');
      navigate('/my-career');
    } catch (err) {
      addToast('error', err.message || 'Could not select career.', 'Selection Error');
    }
  };

  const handleOpenDetail = async (role) => {
    setIsDetailOpen(true);
    try {
      const detail = await rolesApi.getDetail(role.id);
      setSelectedRoleDetail(detail);
    } catch {
      setSelectedRoleDetail(role);
    }
  };

  // Filtered lists
  const domainRoles = selectedDomain
    ? roles.filter((r) => matchesDomainFilter(r, selectedDomain))
    : [];

  const searchedRoles = searchTerm
    ? roles.filter((r) => {
        const q = searchTerm.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.short_summary.toLowerCase().includes(q) ||
          (r.domain && r.domain.toLowerCase().includes(q)) ||
          (r.tools_technologies && r.tools_technologies.some((t) => t.toLowerCase().includes(q)))
        );
      })
    : roles;

  const savedRoles = roles.filter((r) => savedRoleIds.includes(r.id));

  // Top recommendations: match user's academic stream or top demand roles
  const recommendedRoles = roles
    .filter((r) => {
      if (!profile?.academic_stream) return r.market_demand === 'Very High' || r.market_demand === 'High';
      const stream = profile.academic_stream.toLowerCase();
      const domain = (r.domain || r.category || '').toLowerCase();
      if (stream.includes('engineer') || stream.includes('tech')) return domain.includes('technology') || domain.includes('ai') || domain.includes('engineering');
      if (stream.includes('commerce') || stream.includes('financ')) return domain.includes('commerce') || domain.includes('finance') || domain.includes('business');
      if (stream.includes('medic') || stream.includes('health') || stream.includes('bio')) return domain.includes('healthcare');
      if (stream.includes('law')) return domain.includes('law');
      return r.market_demand === 'Very High';
    })
    .slice(0, 9);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Career Discovery Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Find & Explore Your Target Career
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Progressive navigation across 18 domains and 252 professional career paths.
          </p>
        </div>

        <button
          onClick={() => setIsDiscoveryModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition self-start sm:self-auto shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch AI Career Questionnaire</span>
        </button>
      </div>

      {/* Sub-option Navigation Tabs (Progressive Disclosure) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        {[
          { id: 'explore', label: 'Explore Career Domains', icon: Layers },
          { id: 'search', label: 'Search Careers', icon: Search },
          { id: 'recommended', label: 'Recommended Careers', icon: Sparkles },
          { id: 'saved', label: `Saved Careers (${savedRoleIds.length})`, icon: Bookmark },
          { id: 'discover', label: 'Discover Careers', icon: Compass },
          { id: 'compare', label: 'Compare Careers', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'discover') {
                  setIsDiscoveryModalOpen(true);
                } else if (tab.id === 'compare') {
                  navigate('/compare');
                } else {
                  setTab(tab.id);
                }
              }}
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

      {/* TAB 1: EXPLORE CAREER DOMAINS (Hierarchical Drilldown) */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {!selectedDomain ? (
            /* Level 1: Show the 18 Domain Cards */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Select a domain to inspect its career paths:</span>
                <span>18 Disciplines Available</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ALL_18_DOMAINS.map((domain) => {
                  const Icon = domain.icon;
                  return (
                    <div
                      key={domain.code}
                      onClick={() => setSelectedDomain(domain)}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850/80 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {domain.rolesCount} Careers
                          </span>
                        </div>

                        <div>
                          <div className="text-[10px] font-mono text-cyan-400">Domain {domain.code}</div>
                          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {domain.label}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {domain.desc}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs text-slate-400 font-mono group-hover:text-cyan-400">
                        <span>Explore Subcategories</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Level 2: Selected Domain Roles List */
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedDomain(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400">Domain {selectedDomain.code}</div>
                    <h2 className="text-lg font-bold text-white">{selectedDomain.label}</h2>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDomain(null)}
                  className="text-xs font-mono text-slate-400 hover:text-white underline"
                >
                  View All 18 Domains
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {domainRoles.map((role) => {
                  const theme = getCareerTheme(role.slug || role.title);
                  const isSaved = savedRoleIds.includes(role.id);
                  return (
                    <div
                      key={role.id}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-mono border"
                            style={{
                              backgroundColor: `${theme.palette.primary}12`,
                              borderColor: `${theme.palette.primary}40`,
                              color: theme.palette.primary,
                            }}
                          >
                            {role.market_demand || 'High Demand'}
                          </span>
                          <button
                            onClick={() => handleToggleSave(role.id)}
                            className="text-slate-500 hover:text-amber-400 transition"
                            title={isSaved ? 'Remove from saved' : 'Save career'}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>
                        </div>

                        <h4 className="text-base font-bold text-white">{role.title}</h4>

                        {role.regulatory_disclaimer && (
                          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] flex items-start gap-1 leading-snug">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                            <span><strong>Statutory:</strong> {role.regulatory_disclaimer}</span>
                          </div>
                        )}

                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {role.short_summary || role.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-semibold text-emerald-400">
                          {role.average_salary_range}
                        </span>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(role)}
                            className="btn-secondary text-xs py-1.5 px-3"
                          >
                            Curriculum
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectRole(role)}
                            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                          >
                            <span>Select</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SEARCH CAREERS */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search across 252 roles by title, skill, or tool..."
              className="glass-input w-full pl-10"
              autoFocus
            />
          </div>

          <div className="text-xs font-mono text-slate-400">
            Showing <strong className="text-white">{searchedRoles.length}</strong> careers
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchedRoles.slice(0, 30).map((role) => (
              <div
                key={role.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 mb-1">{role.domain || role.category}</div>
                  <h4 className="text-base font-bold text-white mb-2">{role.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {role.short_summary || role.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-semibold">{role.average_salary_range}</span>
                  <button
                    onClick={() => handleOpenDetail(role)}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RECOMMENDED CAREERS */}
      {activeTab === 'recommended' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI Curated Career Tracks</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Tailored to your {profile?.academic_stream || 'educational'} stream and high industry hiring velocity.
              </p>
            </div>
            <button
              onClick={() => setIsDiscoveryModalOpen(true)}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Refine AI Preferences
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedRoles.map((role) => (
              <div
                key={role.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                    95% Match
                  </span>
                  <h4 className="text-base font-bold text-white">{role.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {role.short_summary || role.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-semibold">{role.average_salary_range}</span>
                  <button
                    onClick={() => handleSelectRole(role)}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <span>Enroll Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SAVED CAREERS */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedRoles.length === 0 ? (
            <div className="p-12 text-center text-slate-400 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No Saved Careers Yet</h4>
              <p className="text-xs text-slate-400">Click the bookmark icon on any career to save it here for later review.</p>
              <button
                onClick={() => setTab('explore')}
                className="btn-primary text-xs py-2 px-4 inline-flex"
              >
                Browse Careers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRoles.map((role) => (
                <div
                  key={role.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-white">{role.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {role.short_summary || role.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleSave(role.id)}
                      className="text-xs text-rose-400 hover:underline font-mono"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleSelectRole(role)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Select Role
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Discovery Modal */}
      <CareerDiscoveryModal
        isOpen={isDiscoveryModalOpen}
        onClose={() => setIsDiscoveryModalOpen(false)}
        onSelectCareer={(career) => {
          handleSelectRole(career);
        }}
      />

      {/* Role Curriculum Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedRoleDetail?.title || 'Career Profile Details'}
        maxWidth="max-w-3xl"
      >
        {selectedRoleDetail && (
          <div className="space-y-5">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedRoleDetail.description}
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
              <span>Domain: <strong className="text-white">{selectedRoleDetail.domain || selectedRoleDetail.category}</strong></span>
              <span>Benchmark: <strong className="text-emerald-400">{selectedRoleDetail.average_salary_range}</strong></span>
              <span>Demand: <strong className="text-cyan-400">{selectedRoleDetail.market_demand}</strong></span>
            </div>

            {selectedRoleDetail.regulatory_disclaimer && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <div className="font-bold text-amber-300">Statutory Licensing Requirement</div>
                  <div className="mt-0.5">{selectedRoleDetail.regulatory_disclaimer}</div>
                </div>
              </div>
            )}

            {selectedRoleDetail.requirements?.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">
                  Curriculum Competencies ({selectedRoleDetail.requirements.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRoleDetail.requirements.map((req) => (
                    <div key={req.skill_id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <span className="text-slate-200 font-medium">{req.skill_name}</span>
                      <Badge variant="primary" size="xs">Lvl {req.required_proficiency} Req</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsDetailOpen(false);
                  navigate('/journey?tab=roadmap');
                }}
                className="btn-secondary text-xs py-2 px-4"
              >
                View Career Roadmap
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole(selectedRoleDetail)}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Select & View Career
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

