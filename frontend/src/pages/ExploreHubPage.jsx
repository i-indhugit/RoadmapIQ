import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { rolesApi, skillsApi, projectsApi, resourcesApi, discoveryApi } from '../services/api';
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
  Sliders,
  Award,
  BookOpen,
  FolderGit2,
  GitBranch,
  Eye,
  AlertTriangle,
  ChevronRight,
  Clock,
  TrendingUp,
  Cpu,
  Shield,
  Briefcase,
  DollarSign,
  GraduationCap,
  X,
  Play,
  Share2,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import CareerDiscoveryModal from '../components/discovery/CareerDiscoveryModal';
import { ALL_18_DOMAINS_THEMES, getCareerTheme } from '../utils/careerThemes';

export const DOMAIN_DETAILS = [
  { code: '01', id: 'technology', label: 'Technology & IT', rolesCount: 28, subdomains: ['Frontend & Web', 'Backend & Microservices', 'Full Stack Engineering', 'Mobile App Development', 'QA & Automation', 'Systems & Architecture'] },
  { code: '02', id: 'ai_ml', label: 'AI & Machine Learning', rolesCount: 16, subdomains: ['Classical Machine Learning', 'Deep Learning & Neural Networks', 'Generative AI & LLMs', 'Autonomous Agentic Systems', 'MLOps & Deployment'] },
  { code: '03', id: 'data_science', label: 'Data Science & Analytics', rolesCount: 18, subdomains: ['Business Intelligence & Reporting', 'Exploratory Data Science', 'Data Engineering & Pipelines', 'Statistical Econometrics'] },
  { code: '04', id: 'commerce_finance', label: 'Commerce & Finance', rolesCount: 22, subdomains: ['Corporate Accounting & Audit (CA)', 'Investment Banking & M&A', 'Wealth & Portfolio Management', 'Equity Research & Quantitative Trading'] },
  { code: '05', id: 'arts_humanities', label: 'Arts & Humanities', rolesCount: 15, subdomains: ['Creative & Investigative Journalism', 'Content Strategy & Editorial', 'Public Relations & Corporate Comms', 'Historical Research & Curation'] },
  { code: '06', id: 'business_management', label: 'Business & Management', rolesCount: 20, subdomains: ['Product Management & Agile', 'Management Consulting', 'Operations & Supply Chain', 'Human Resources & People Strategy'] },
  { code: '07', id: 'healthcare_life', label: 'Healthcare & Life Sciences', rolesCount: 16, subdomains: ['Clinical Medicine & Diagnostics', 'Bioinformatics & Computational Biology', 'Pharmacovigilance & Drug Trials', 'Healthcare Informatics & Records'] },
  { code: '08', id: 'core_engineering', label: 'Core Engineering', rolesCount: 18, subdomains: ['Mechanical CAD & Thermodynamics', 'Civil & Structural Mechanics', 'Electrical Systems & Power Grids', 'Robotics & Embedded Mechatronics'] },
  { code: '09', id: 'cybersecurity', label: 'Cybersecurity', rolesCount: 14, subdomains: ['SOC Threat Hunting & SIEM', 'Penetration Testing & Offensive Sec', 'Cryptographic Infrastructure', 'Zero-Trust Cloud Defense'] },
  { code: '10', id: 'cloud_devops', label: 'Cloud & DevOps', rolesCount: 14, subdomains: ['Cloud Architecture (AWS/Azure/GCP)', 'Kubernetes Cluster Orchestration', 'Infrastructure as Code (Terraform)', 'Site Reliability Engineering (SRE)'] },
  { code: '11', id: 'law_legal', label: 'Law & Legal Studies', rolesCount: 14, subdomains: ['Constitutional & Appellate Advocacy', 'Corporate Contracts & Compliance', 'Intellectual Property & Patents', 'Arbitration & Commercial Dispute'] },
  { code: '12', id: 'education_research', label: 'Education & Research', rolesCount: 12, subdomains: ['Instructional Design & Curriculum', 'Higher Education & Professorship', 'Educational Technology (EdTech)', 'Academic Research & Grants'] },
  { code: '13', id: 'government_public', label: 'Government & Public Services', rolesCount: 12, subdomains: ['Civil Services (IAS/IPS Administration)', 'Public Policy & Policy Think Tanks', 'Diplomatic Foreign Service', 'Municipal & District Governance'] },
  { code: '14', id: 'psychology_behavioral', label: 'Psychology & Behavioral Science', rolesCount: 11, subdomains: ['Clinical & Counseling Psychology', 'Organizational Psychology & Culture', 'Cognitive Neuroscience & Mind Labs', 'Behavioral Economics & Nudge Units'] },
  { code: '15', id: 'design_creative', label: 'Design, Media & Creative Arts', rolesCount: 15, subdomains: ['UI/UX & Product Design Systems', 'Brand Identity & Visual Communication', 'Motion Graphics & 3D Visualization', 'Game Art & Environmental Design'] },
  { code: '16', id: 'hospitality_tourism', label: 'Hospitality & Tourism', rolesCount: 10, subdomains: ['Luxury Hotel & Resort Operations', 'Revenue & Yield Optimization', 'Event Logistics & Conference Mgmt', 'International Travel & Tourism Tech'] },
  { code: '17', id: 'agriculture_environmental', label: 'Agriculture & Environmental Science', rolesCount: 12, subdomains: ['Precision Agronomy & Smart Sensors', 'Environmental Impact & ESG Audits', 'Soil Biology & Regenerative Systems', 'Sustainable Agro-Supply Logistics'] },
  { code: '18', id: 'entrepreneurship_innovation', label: 'Entrepreneurship & Innovation', rolesCount: 12, subdomains: ['Venture Incubation & MVP Builds', 'Product-Market Fit & Growth Loops', 'Venture Capital & Term Sheets', 'Startup Operations & Scaling'] },
];

export const CAREER_TRANSITION_PATHWAYS = [
  {
    fromStream: 'Science & Mathematics',
    targetCareer: 'Data Scientist & AI Researcher',
    rationale: 'Strong foundation in calculus, probability, and hypothesis testing transfers seamlessly into predictive machine learning.',
    bridgeSkills: ['Python & Pandas', 'SQL Warehousing', 'Scikit-Learn Modeling', 'Feature Engineering'],
    timeEstimateWeeks: 12,
  },
  {
    fromStream: 'Engineering & Technology',
    targetCareer: 'Product Manager (Technical)',
    rationale: 'Deep technical comprehension combined with systems thinking enables engineers to design high-impact PRDs and align teams.',
    bridgeSkills: ['Agile Scrum & Sprints', 'User Research & Personas', 'Unit Economics & LTV/CAC', 'Figma Product Roadmapping'],
    timeEstimateWeeks: 10,
  },
  {
    fromStream: 'Commerce & Accounting',
    targetCareer: 'Fintech Analyst & Quantitative Modeling',
    rationale: 'Fluency with 3-statement models and financial regulations accelerates quantitative analytics and digital payments strategy.',
    bridgeSkills: ['Python for Finance', 'Algorithmic Backtesting', 'Stochastic Modeling', 'Payment Gateway Protocols'],
    timeEstimateWeeks: 14,
  },
  {
    fromStream: 'Arts & Humanities',
    targetCareer: 'UI/UX Designer & Content Strategist',
    rationale: 'Empathetic storytelling, critical semiotics, and qualitative reasoning directly empower user-centric interface design.',
    bridgeSkills: ['Figma Design Systems', 'User Personas & Journey Maps', 'Micro-Interactions', 'Heuristic Usability Audits'],
    timeEstimateWeeks: 12,
  },
  {
    fromStream: 'Medical & Healthcare',
    targetCareer: 'Bioinformatics & Clinical Data Specialist',
    rationale: 'Biomedical domain knowledge paired with computational scripts resolves major bottlenecks in multi-omics and clinical trials.',
    bridgeSkills: ['Bioconductor & R/Python', 'Genomic Sequence Alignment', 'Clinical Trial EMR Data', 'FDA 21 CFR Part 11'],
    timeEstimateWeeks: 16,
  },
  {
    fromStream: 'Any Academic Discipline',
    targetCareer: 'Full Stack Web Developer',
    rationale: 'Universal software engineering fundamentals are accessible to dedicated builders through open-source documentation and practice.',
    bridgeSkills: ['JavaScript / TypeScript', 'React Frontend Architecture', 'Node.js & FastAPI APIs', 'Relational PostgreSQL'],
    timeEstimateWeeks: 16,
  },
];

export default function ExploreHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { allRoles, profile, activeRole, switchCareer, addToast, triggerCelebration } = useApp();

  const activeTab = searchParams.get('tab') || 'domains';

  // State
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedRoleDetail, setSelectedRoleDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);

  // Comparison State (up to 3 roles)
  const [comparisonRoleIds, setComparisonRoleIds] = useState([]);

  // Saved Careers (from localStorage)
  const [savedRoleIds, setSavedRoleIds] = useState(() => {
    try {
      const saved = localStorage.getItem('roadmapiq_saved_careers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Environment Previewer State
  const [previewTheme, setPreviewTheme] = useState(ALL_18_DOMAINS_THEMES[0]);

  // Initial Load
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [rList, sList, pList, resList] = await Promise.all([
          rolesApi.getAll().catch(() => []),
          skillsApi.getAll().catch(() => []),
          projectsApi.getAll().catch(() => []),
          resourcesApi.getAll().catch(() => []),
        ]);
        setRoles(rList);
        setSkills(sList);
        setProjects(pList);
        setResources(resList);
      } catch (err) {
        addToast('error', 'Could not load catalogs.', 'Load Error');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [addToast]);

  // Save/Unsave Toggle
  const handleToggleSave = (roleId) => {
    setSavedRoleIds((prev) => {
      const updated = prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId];
      localStorage.setItem('roadmapiq_saved_careers', JSON.stringify(updated));
      return updated;
    });
  };

  // Compare Toggle
  const handleToggleCompare = (roleId) => {
    setComparisonRoleIds((prev) => {
      if (prev.includes(roleId)) return prev.filter((id) => id !== roleId);
      if (prev.length >= 3) {
        addToast('info', 'You can compare up to 3 careers at once.', 'Comparison Limit');
        return prev;
      }
      return [...prev, roleId];
    });
  };

  // 1-Click Set Active Target Career
  const handleSetActiveCareer = async (role) => {
    try {
      await switchCareer(role.id || role.role_id);
      triggerCelebration();
      addToast('success', `Active career set to ${role.title}! Roadmap and theme activated.`, 'Career Selected');
    } catch (err) {
      addToast('error', err.message || 'Could not set active career.', 'Error');
    }
  };

  // Open Detailed Career Profile
  const handleOpenDetail = async (role) => {
    setIsDetailOpen(true);
    try {
      const detail = await rolesApi.getDetail(role.id);
      setSelectedRoleDetail(detail);
    } catch {
      setSelectedRoleDetail(role);
    }
  };

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        r.title.toLowerCase().includes(q) ||
        r.short_summary.toLowerCase().includes(q) ||
        (r.domain && r.domain.toLowerCase().includes(q)) ||
        (r.tools_technologies && r.tools_technologies.some((t) => t.toLowerCase().includes(q)));

      const matchesDomain =
        selectedDomainFilter === 'All' ||
        (r.domain && r.domain.toLowerCase().includes(selectedDomainFilter.toLowerCase())) ||
        (r.category && r.category.toLowerCase().includes(selectedDomainFilter.toLowerCase()));

      return matchesSearch && matchesDomain;
    });
  }, [roles, searchTerm, selectedDomainFilter]);

  // Selected domain roles
  const domainRoles = useMemo(() => {
    if (!selectedDomain) return [];
    return roles.filter((r) => {
      const d = (r.domain || r.category || '').toLowerCase();
      return d.includes(selectedDomain.id) || d.includes(selectedDomain.label.toLowerCase());
    });
  }, [roles, selectedDomain]);

  // Saved roles
  const savedRoles = useMemo(() => {
    return roles.filter((r) => savedRoleIds.includes(r.id));
  }, [roles, savedRoleIds]);

  // Comparison roles
  const comparisonRoles = useMemo(() => {
    return roles.filter((r) => comparisonRoleIds.includes(r.id));
  }, [roles, comparisonRoleIds]);

  // Exploration Tabs
  const TABS = [
    { id: 'domains', label: '1. 18 Career Domains', icon: Compass },
    { id: 'search', label: '2. Search Any Career (259+)', icon: Search },
    { id: 'skills', label: '3. Explore Skills', icon: Award },
    { id: 'projects', label: '4. Career Projects', icon: FolderGit2 },
    { id: 'resources', label: '5. Free Resources', icon: BookOpen },
    { id: 'compare', label: `6. Compare (${comparisonRoleIds.length}/3)`, icon: Sliders },
    { id: 'saved', label: `7. Saved Careers (${savedRoleIds.length})`, icon: Bookmark },
    { id: 'environments', label: '8. Visual Environments', icon: Eye },
    { id: 'pathways', label: '9. Alternative Pathways', icon: GitBranch },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">Exploration Hub</Badge>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-cyan-400">18 Domains • 259+ Careers • 100% Free Materials</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Explore Your Futures Before You Commit
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore freely. Browse domains, preview career environments, inspect skill requirements, save interests, and select an active track whenever you are ready.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDiscoveryOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Aptitude Discovery Quiz</span>
            </button>

            {activeRole && (
              <Link
                to="/my-career"
                className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                <span>Active Track: {activeRole.title}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 4-Stage Commitment Status Key */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span><strong>1. Exploring:</strong> Preview any role</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
          <Bookmark className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span><strong>2. Saved:</strong> Bookmark interests</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
          <span><strong>3. Selected:</strong> Active target track</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          <Play className="w-3 h-3 fill-emerald-400 text-emerald-400" />
          <span><strong>4. Preparing:</strong> Live AI roadmap</span>
        </div>
      </div>

      {/* Progressive Exploration Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ALL 18 CAREER DOMAINS */}
      {/* ========================================================= */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          {!selectedDomain ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Select any domain to inspect subcategories and career profiles:</span>
                <span>18 Disciplines Available</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DOMAIN_DETAILS.map((domain) => {
                  const theme = getCareerTheme(domain.id);
                  return (
                    <div
                      key={domain.code}
                      onClick={() => setSelectedDomain(domain)}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850/80 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: `${theme.palette.primary}15`,
                              borderColor: `${theme.palette.primary}40`,
                              color: theme.palette.primary,
                            }}
                          >
                            Domain {domain.code}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {domain.rolesCount} Careers
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {domain.label}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {theme.tagline}
                          </p>
                        </div>

                        {/* Subdomain chips preview */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {domain.subdomains.slice(0, 3).map((sub, i) => (
                            <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {sub}
                            </span>
                          ))}
                          {domain.subdomains.length > 3 && (
                            <span className="text-[10px] font-mono text-slate-500">
                              +{domain.subdomains.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-400 font-mono group-hover:text-cyan-400">
                        <span>Browse Roles & Visual World</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Selected Domain Detail View */
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedDomain(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  >
                    ← Back
                  </button>
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400">Domain {selectedDomain.code}</div>
                    <h2 className="text-lg font-bold text-white">{selectedDomain.label}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPreviewTheme(getCareerTheme(selectedDomain.id));
                      setSearchParams({ tab: 'environments' });
                    }}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Preview Environment</span>
                  </button>
                  <button
                    onClick={() => setSelectedDomain(null)}
                    className="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    All 18 Domains
                  </button>
                </div>
              </div>

              {/* Subcategories bar */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-mono text-slate-400">Subdomains & Focus Tracks:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedDomain.subdomains.map((sub, idx) => (
                    <span key={idx} className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-800/90 text-cyan-300 border border-slate-700">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Roles in this domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {domainRoles.map((role) => {
                  const isSaved = savedRoleIds.includes(role.id);
                  const isComparing = comparisonRoleIds.includes(role.id);
                  const isActive = activeRole?.id === role.id || profile?.target_role_id === role.id;

                  return (
                    <div
                      key={role.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isActive
                          ? 'bg-cyan-950/25 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            {role.market_demand || 'High Demand'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleCompare(role.id)}
                              className={`p-1.5 rounded-lg text-xs transition ${
                                isComparing ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
                              }`}
                              title="Compare up to 3 careers"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleSave(role.id)}
                              className="p-1.5 text-slate-500 hover:text-amber-400 transition"
                              title={isSaved ? 'Remove from saved' : 'Save career'}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                            </button>
                          </div>
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

                      <div className="space-y-2 pt-3 border-t border-slate-800 mt-4">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400">Salary:</span>
                          <span className="text-emerald-400 font-bold">{role.average_salary_range}</span>
                        </div>

                        {isActive ? (
                          <div className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                            <span>Active Career Track</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetActiveCareer(role)}
                            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Set as Active Career</span>
                          </button>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(role)}
                            className="btn-secondary text-xs py-1.5 px-2 text-center justify-center"
                          >
                            Curriculum
                          </button>
                          <Link
                            to="/journey?tab=roadmap"
                            className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700 text-center"
                          >
                            <span>Roadmap</span>
                            <ArrowRight className="w-3 h-3 text-cyan-400" />
                          </Link>
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

      {/* ========================================================= */}
      {/* TAB 2: SEARCH ANY CAREER (259+) */}
      {/* ========================================================= */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search across 259+ careers by title, tools, or keywords (e.g. Java, Python, AI, CA, Doctor)..."
                className="glass-input pl-10 w-full"
              />
            </div>

            <select
              value={selectedDomainFilter}
              onChange={(e) => setSelectedDomainFilter(e.target.value)}
              className="glass-input sm:w-64"
            >
              <option value="All">All 18 Domains ({roles.length} roles)</option>
              {DOMAIN_DETAILS.map((d) => (
                <option key={d.code} value={d.label}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Showing {filteredRoles.length} of {roles.length} available career paths</span>
            {comparisonRoleIds.length > 0 && (
              <span className="text-cyan-400">{comparisonRoleIds.length}/3 careers queued for comparison</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => {
              const isSaved = savedRoleIds.includes(role.id);
              const isComparing = comparisonRoleIds.includes(role.id);
              const isActive = activeRole?.id === role.id || profile?.target_role_id === role.id;

              return (
                <div
                  key={role.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-cyan-950/25 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {role.domain || role.category || 'Professional Track'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleCompare(role.id)}
                          className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                            isComparing ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title="Compare career"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleSave(role.id)}
                          className="p-1.5 text-slate-500 hover:text-amber-400 transition cursor-pointer"
                          title={isSaved ? 'Remove from saved' : 'Save career'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>
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

                  <div className="space-y-2 pt-3 border-t border-slate-800 mt-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Benchmark:</span>
                      <span className="text-emerald-400 font-bold">{role.average_salary_range}</span>
                    </div>

                    {isActive ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        <span>Active Target Career Track</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetActiveCareer(role)}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Set as Target Career</span>
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(role)}
                        className="btn-secondary text-xs py-1.5 px-2 text-center justify-center cursor-pointer"
                      >
                        Curriculum
                      </button>
                      <Link
                        to="/journey?tab=roadmap"
                        className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700 text-center cursor-pointer"
                      >
                        <span>Roadmap</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: EXPLORE SKILLS INDEPENDENTLY */}
      {/* ========================================================= */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Explore all {skills.length} competencies across technical, soft, and leadership domains:</span>
            <span>Vetted Documentation Included</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((s) => (
              <div key={s.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {s.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Est. {s.estimated_hours_intermediate || 20}h
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">{s.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {s.description}
                  </p>

                  {s.prerequisites?.length > 0 && (
                    <div className="text-[11px] font-mono text-slate-400 pt-1">
                      <span className="text-slate-500">Prerequisites:</span> {s.prerequisites.join(', ')}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <a
                    href={s.doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Official Guide</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <Link
                    to="/journey?tab=roadmap"
                    className="btn-secondary text-xs py-1 px-3"
                  >
                    Learn Skill
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CAREER PROJECTS */}
      {/* ========================================================= */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Portfolio capstones and practical assignments across industries:</span>
            <span>{projects.length} Curated Project Briefs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {p.difficulty || 'Intermediate'} Capstone
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ⏱ {p.estimated_hours || 25} hours
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {p.problem_statement}
                  </p>

                  {p.suggested_tech_stack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {p.suggested_tech_stack.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    to={`/projects`}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <span>View Project Spec</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: FREE RESOURCES */}
      {/* ========================================================= */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>100% Free, zero-paywall learning materials vetted by senior professionals:</span>
            <span>{resources.length} Vetted Links</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((res) => (
              <div key={res.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      100% Free Access
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {res.format || 'Docs'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{res.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {res.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">{res.provider}</span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open Material</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: COMPARE UP TO 3 CAREERS */}
      {/* ========================================================= */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Side-by-Side Career Comparison</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Compare up to three professional paths to evaluate salary benchmarks, required degrees, regulatory hurdles, and progression.
              </p>
            </div>
            {comparisonRoleIds.length > 0 && (
              <button
                onClick={() => setComparisonRoleIds([])}
                className="text-xs font-mono text-rose-400 hover:underline cursor-pointer"
              >
                Clear Selected ({comparisonRoleIds.length})
              </button>
            )}
          </div>

          {comparisonRoles.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
              <Sliders className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-300">No Careers Queued for Comparison</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click the slider icon on any career card in Domain Exploration or Search to add it to this side-by-side comparative matrix.
              </p>
              <button
                onClick={() => setSearchParams({ tab: 'search' })}
                className="btn-primary text-xs py-2 px-4 mt-2"
              >
                Browse Careers to Compare
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparisonRoles.map((role) => {
                const isActive = activeRole?.id === role.id;
                return (
                  <div
                    key={role.id}
                    className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-5 shadow-xl"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {role.domain || 'Domain Track'}
                        </span>
                        <button
                          onClick={() => handleToggleCompare(role.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="text-xl font-bold text-white">{role.title}</h3>

                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1 text-xs">
                        <div className="text-slate-400 font-mono">Salary Range:</div>
                        <div className="text-emerald-400 font-bold font-mono text-sm">{role.average_salary_range}</div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <span className="text-slate-400 font-mono">Market Demand:</span>
                        <p className="text-white font-semibold">{role.market_demand || 'High Demand'}</p>
                      </div>

                      <div className="space-y-1 text-xs">
                        <span className="text-slate-400 font-mono">Curriculum Focus:</span>
                        <p className="text-slate-300 leading-relaxed">{role.short_summary}</p>
                      </div>

                      {role.regulatory_disclaimer && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                          <strong>Statutory:</strong> {role.regulatory_disclaimer}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-800">
                      {isActive ? (
                        <div className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                          <span>Active Career Track</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetActiveCareer(role)}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Switch to this Career</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: SAVED CAREERS */}
      {/* ========================================================= */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>You have {savedRoles.length} saved career bookmarks:</span>
            <span>Stored in Persistent Local State</span>
          </div>

          {savedRoles.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-300">No Saved Careers Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Explore careers and click the bookmark ribbon to save career pathways you wish to revisit.
              </p>
              <button
                onClick={() => setSearchParams({ tab: 'domains' })}
                className="btn-primary text-xs py-2 px-4 mt-2"
              >
                Explore 18 Domains
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRoles.map((role) => (
                <div key={role.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {role.domain || 'Domain Track'}
                      </span>
                      <button
                        onClick={() => handleToggleSave(role.id)}
                        className="text-amber-400 hover:text-rose-400 p-1"
                        title="Remove bookmark"
                      >
                        <Bookmark className="w-4 h-4 fill-amber-400" />
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-white">{role.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-3">
                      {role.short_summary || role.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Salary:</span>
                      <span className="text-emerald-400 font-bold">{role.average_salary_range}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSetActiveCareer(role)}
                      className="btn-primary w-full text-xs py-2"
                    >
                      Set as Active Career
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: VISUAL ENVIRONMENT PREVIEWER (ALL 18 DOMAINS) */}
      {/* ========================================================= */}
      {activeTab === 'environments' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Career-Adaptive Environment Previewer</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every career domain features its own custom visual environment, color palette, atmospheric motif, and stage milestones.
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400">18 Custom Visual Worlds</div>
          </div>

          {/* Domain Theme Selector Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {ALL_18_DOMAINS_THEMES.map((t) => {
              const isSelected = previewTheme.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setPreviewTheme(t)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'border shadow-lg'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${t.palette.primary}20`,
                          borderColor: t.palette.primary,
                          color: t.palette.primary,
                        }
                      : {}
                  }
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.palette.primary }} />
                  <span>{t.domainName}</span>
                </button>
              );
            })}
          </div>

          {/* Live Themed Environment Showcase Stage */}
          <div
            className="p-8 sm:p-10 rounded-3xl border transition-all duration-500 relative overflow-hidden shadow-2xl space-y-8"
            style={{
              backgroundColor: previewTheme.palette.baseBg,
              backgroundImage: previewTheme.palette.pageGradient,
              borderColor: previewTheme.palette.cardBorder,
            }}
          >
            {/* Visual Motif Watermark */}
            <div
              className="absolute right-4 bottom-4 text-4xl sm:text-6xl font-black font-mono opacity-5 pointer-events-none select-none"
              style={{ color: previewTheme.palette.primary }}
            >
              {previewTheme.visualMotif?.heroWatermark || 'ROADMAPIQ'}
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-mono font-bold border"
                  style={{
                    backgroundColor: previewTheme.palette.badgeBg,
                    borderColor: previewTheme.palette.badgeBorder,
                    color: previewTheme.palette.primary,
                  }}
                >
                  {previewTheme.domainName}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono text-slate-400">{previewTheme.environmentName}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {previewTheme.name}
              </h2>

              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                {previewTheme.tagline}
              </p>
            </div>

            {/* Simulated HUD Terminal / Telemetry Box */}
            <div
              className="p-5 rounded-2xl border backdrop-blur-xl space-y-3"
              style={{
                backgroundColor: previewTheme.palette.cardBg,
                borderColor: previewTheme.palette.cardBorder,
              }}
            >
              <div className="flex items-center justify-between text-xs font-mono border-b pb-2" style={{ borderColor: `${previewTheme.palette.cardBorder}` }}>
                <span style={{ color: previewTheme.palette.primary }}>● System Status: Online & Calibrated</span>
                <span className="text-slate-400">{previewTheme.visualMotif?.styleName}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {previewTheme.palette && [
                  { label: 'Primary Accent', color: previewTheme.palette.primary },
                  { label: 'Secondary Tone', color: previewTheme.palette.secondary },
                  { label: 'Highlight Accent', color: previewTheme.palette.accent },
                  { label: 'Core Base', color: previewTheme.palette.baseBg },
                ].map((col, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono flex items-center gap-2">
                    <span className="w-4 h-4 rounded-lg shadow-sm" style={{ backgroundColor: col.color }} />
                    <span className="text-slate-300">{col.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5-Phase Curriculum Roadmap Milestone Preview */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Calibrated Curriculum Stages:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {previewTheme.stages?.map((stage) => (
                  <div
                    key={stage.number}
                    className="p-3.5 rounded-2xl border backdrop-blur-sm space-y-1.5"
                    style={{
                      backgroundColor: previewTheme.palette.cardBg,
                      borderColor: previewTheme.palette.cardBorder,
                    }}
                  >
                    <div className="text-[10px] font-mono font-bold" style={{ color: previewTheme.palette.primary }}>
                      Phase {stage.number}
                    </div>
                    <div className="text-xs font-bold text-white">{stage.name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">{stage.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 9: ALTERNATIVE CAREER PATHWAYS */}
      {/* ========================================================= */}
      {activeTab === 'pathways' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Cross-Domain Career Transition Pathways</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Students from every background can transition into high-growth careers through calculated bridge skills.
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400">Stepping Stones & Bridge Curricula</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAREER_TRANSITION_PATHWAYS.map((path, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">From Background:</span>
                    <strong className="text-cyan-300">{path.fromStream}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                    <h4 className="text-base font-bold text-white">{path.targetCareer}</h4>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {path.rationale}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-mono text-slate-400">Priority Bridge Skills to Learn:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {path.bridgeSkills.map((s, i) => (
                        <span key={i} className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Estimated Transition: ~{path.timeEstimateWeeks} weeks</span>
                  <Link to="/discovery" className="text-cyan-400 hover:underline">
                    Find Similar Roles →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Career Discovery Guided Quiz Modal */}
      <CareerDiscoveryModal
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        onSelectCareer={(career) => {
          handleSetActiveCareer(career);
          setIsDiscoveryOpen(false);
        }}
      />

      {/* Role Curriculum Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedRoleDetail?.title || 'Career Path Curriculum'}
        maxWidth="max-w-3xl"
      >
        {selectedRoleDetail && (
          <div className="space-y-6 py-2">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                {selectedRoleDetail.domain || selectedRoleDetail.category}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">{selectedRoleDetail.title}</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {selectedRoleDetail.description || selectedRoleDetail.short_summary}
              </p>
            </div>

            {selectedRoleDetail.regulatory_disclaimer && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <strong>Statutory Regulatory Notice:</strong>
                  <p className="mt-0.5">{selectedRoleDetail.regulatory_disclaimer}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Average Compensation:</span>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">{selectedRoleDetail.average_salary_range}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Market Demand Index:</span>
                <div className="text-cyan-400 font-bold text-sm mt-0.5">{selectedRoleDetail.market_demand || 'High'}</div>
              </div>
            </div>

            {selectedRoleDetail.tools_and_technologies?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-slate-400 uppercase">Core Tools & Technologies:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRoleDetail.tools_and_technologies.map((t, idx) => (
                    <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleToggleSave(selectedRoleDetail.id)}
                className="btn-secondary text-xs py-2 px-4"
              >
                {savedRoleIds.includes(selectedRoleDetail.id) ? 'Saved ★' : 'Save Career'}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSetActiveCareer(selectedRoleDetail);
                  setIsDetailOpen(false);
                }}
                className="btn-primary text-xs py-2 px-5"
              >
                Set as Active Preparation Career
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
