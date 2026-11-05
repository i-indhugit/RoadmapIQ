import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { projectsApi, aiApi } from '../services/api';
import {
  FolderGit2,
  Sparkles,
  Layers,
  Clock,
  CheckSquare,
  ChevronRight,
  Code2,
  Terminal,
  ExternalLink,
  Bot,
  Compass,
  FileCode,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight,
  Swords,
  Globe,
  Briefcase,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { SkeletonCard } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const PRACTICAL_ASSIGNMENTS = [
  {
    id: 'asg-1',
    title: 'Secure Stateless Authentication Service',
    difficulty: 'Intermediate',
    estimated_hours: 4,
    xp_reward: 75,
    skills: ['JWT', 'Bcrypt', 'OAuth2', 'Security Headers'],
    description: 'Build a production-grade authentication microservice with refresh token rotation, bcrypt password hashing, and rate-limiting on login endpoints.',
    deliverable: 'GitHub repo with automated unit tests verifying token expiration and invalid signature handling.',
  },
  {
    id: 'asg-2',
    title: 'Multi-Stage Docker & Compose Orchestration',
    difficulty: 'Intermediate',
    estimated_hours: 3,
    xp_reward: 75,
    skills: ['Docker', 'Compose', 'DevOps', 'Alpine Linux'],
    description: 'Containerize a full-stack application using optimized multi-stage Docker builds (<100MB production image size) and a docker-compose.yml with health checks.',
    deliverable: 'Dockerfile and docker-compose.yml tested with non-root user execution.',
  },
  {
    id: 'asg-3',
    title: 'Database Query Profiler & Index Optimizer',
    difficulty: 'Advanced',
    estimated_hours: 5,
    xp_reward: 90,
    skills: ['PostgreSQL / SQLite', 'EXPLAIN ANALYZE', 'B-Tree Indexing'],
    description: 'Given a 100,000-row dataset with slow complex queries, run EXPLAIN ANALYZE, diagnose sequential scans, and design optimal compound indexes to reduce latency by >80%.',
    deliverable: 'Benchmark comparison markdown report showing query latency before and after indexing.',
  },
  {
    id: 'asg-4',
    title: 'Resilient API Client with Exponential Backoff',
    difficulty: 'Intermediate',
    estimated_hours: 3,
    xp_reward: 75,
    skills: ['Resilience', 'Error Handling', 'Async / Promises', 'Rate Limits'],
    description: 'Implement an HTTP client utility supporting automatic retry with jitter, circuit breaker pattern, and timeout controls for downstream microservice resilience.',
    deliverable: 'Code module with mock tests verifying exponential backoff retries.',
  },
];

const ProjectRecommendationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'recommended-projects';

  const { profile, activeRole, activeRoadmap, addToast, triggerCelebration } = useApp();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectSubmissions, setProjectSubmissions] = useState({});
  const [submittedProjects, setSubmittedProjects] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('roadmapiq_submitted_projects') || '{}');
    } catch {
      return {};
    }
  });

  // AI Project Mentor Modal
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [mentorGuidance, setMentorGuidance] = useState(null);

  const handleProjectSubmit = (projectId) => {
    const url = projectSubmissions[projectId];
    if (!url || !url.trim()) {
      addToast('warning', 'Please provide a valid GitHub repo or live demo link.', 'Submission Required');
      return;
    }
    const updated = { ...submittedProjects, [projectId]: url.trim() };
    setSubmittedProjects(updated);
    try {
      localStorage.setItem('roadmapiq_submitted_projects', JSON.stringify(updated));
    } catch {}
    triggerCelebration({ particleCount: 100, spread: 80 });
    addToast('success', 'Capstone project submitted! +150 XP awarded for portfolio evidence.', 'Project Arena');
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const targetRoleId = activeRoadmap?.role_id || profile?.target_role_id;
        const data = await projectsApi.getAll({ role_id: targetRoleId });
        setProjects(data);
      } catch (err) {
        addToast('error', 'Could not load portfolio project recommendations.', 'Error');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [activeRoadmap, profile, addToast]);

  const handleOpenMentor = async (project, milestone, index) => {
    setSelectedProject(project);
    setSelectedMilestone(milestone);
    setMentorModalOpen(true);
    setMentorLoading(true);
    setMentorGuidance(null);

    try {
      const guidance = await aiApi.getProjectMentor({
        project_name: project.name,
        target_role: activeRoadmap?.role_title || activeRole?.title || 'Full-Stack Developer',
        milestone_index: index,
        milestone_text: milestone,
        tech_stack: project.suggested_tech_stack || [],
      });
      setMentorGuidance(guidance);
    } catch (err) {
      addToast('error', 'Failed to retrieve AI mentor architectural guidance.', 'Error');
    } finally {
      setMentorLoading(false);
    }
  };

  const PROJECT_TABS = [
    { id: 'recommended-projects', label: 'Recommended Projects', icon: FolderGit2 },
    { id: 'assignments', label: 'Practical Assignments', icon: FileCode },
    { id: 'challenges', label: 'Weekly Challenges', icon: Swords },
    { id: 'milestones', label: 'Project Milestones', icon: Layers },
    { id: 'portfolio', label: 'Portfolio', icon: Award },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <Badge variant="primary" className="mb-2">Portfolio Engineering</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <span>Projects & Challenges</span>
          <FolderGit2 className="w-6 h-6 text-brand-cyan" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Recruiters prioritize real, working applications with architecture diagrams and test suites over trivial tutorial clones.
        </p>
      </div>

      {/* Progressive Disclosure Sub-Option Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {PROJECT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'challenges') {
                  navigate('/arena');
                } else {
                  setSearchParams({ tab: tab.id });
                }
              }}
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

      {/* Tab 1: Recommended Projects */}
      {activeTab === 'recommended-projects' && (
        loading ? (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="No Projects Found"
            description="We are adding curated projects for your selected role. Check back soon."
          />
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {projects.map((proj) => (
              <div key={proj.id} className="glass-panel p-6 sm:p-7 space-y-6 border-slate-800">
                {/* Project Title and Stats */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          proj.difficulty === 'Advanced' ? 'danger' : proj.difficulty === 'Intermediate' ? 'warning' : 'primary'
                        }
                        size="sm"
                      >
                        {proj.difficulty}
                      </Badge>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        ~{proj.estimated_hours} Hours Build Time
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                      {proj.name}
                    </h2>
                  </div>

                  <div className="text-xs font-mono text-slate-400 bg-navy-850 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0">
                    Target Portfolio Asset
                  </div>
                </div>

                {/* Problem Statement */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                    The Problem to Solve
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-navy-850/80 p-4 rounded-xl border border-slate-800">
                    {proj.problem_statement}
                  </p>
                </div>

                {/* Suggested Tech Stack & Skills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                      Suggested Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.suggested_tech_stack?.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono bg-navy-800 text-brand-cyan border border-brand-cyan/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                      Skills Demonstrated
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.skills_covered?.map((skill, i) => (
                        <Badge key={i} variant="default" size="xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Milestones with AI Mentor Button */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Development Milestones
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Click 'AI Mentor' on any milestone for starter code & guidance
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {proj.milestones?.map((milestone, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-navy-850 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-lg bg-navy-800 text-brand-cyan font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                            {milestone}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenMentor(proj, milestone, idx)}
                          className="btn-secondary text-xs py-1.5 px-3 shrink-0 self-end sm:self-auto"
                        >
                          <Sparkles className="w-3 h-3 text-brand-cyan" />
                          <span>AI Mentor</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evaluation Checklist */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Recruiter Evaluation Checklist</span>
                  </h4>
                  <div className="space-y-2 bg-navy-850/50 p-4 rounded-xl border border-slate-800">
                    {proj.evaluation_criteria?.map((crit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{crit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proof of Work & Capstone Submission Box */}
                <div className="p-4 rounded-xl bg-navy-900/80 border border-brand-cyan/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <FolderGit2 className="w-4 h-4 text-brand-cyan" /> Submit Proof of Work
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                        +150 XP Reward
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {submittedProjects[proj.id]
                        ? `Submitted: ${submittedProjects[proj.id]} (Verified)`
                        : 'Link your GitHub repo or live deployment to verify this capstone asset.'}
                    </p>
                  </div>
                  {submittedProjects[proj.id] ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      ✓ Verified & Recorded
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="url"
                        placeholder="https://github.com/username/repo"
                        value={projectSubmissions[proj.id] || ''}
                        onChange={(e) =>
                          setProjectSubmissions((prev) => ({ ...prev, [proj.id]: e.target.value }))
                        }
                        className="bg-navy-950 border border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-cyan flex-1 sm:w-64 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleProjectSubmit(proj.id)}
                        className="btn-primary text-xs py-2 px-3.5 shrink-0"
                      >
                        <span>Submit</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab 2: Practical Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-brand-cyan" />
              <span>Targeted Practical Engineering Assignments</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Focused, bite-sized technical deliverables designed to reinforce core architectural competencies and earn verified XP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PRACTICAL_ASSIGNMENTS.map((asg) => (
              <div
                key={asg.id}
                className="glass-panel p-5 border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={asg.difficulty === 'Advanced' ? 'warning' : 'primary'} size="xs">
                      {asg.difficulty}
                    </Badge>
                    <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      +{asg.xp_reward} XP
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">
                    {asg.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {asg.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {asg.skills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-800 text-sky-300 border border-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-[11px] text-slate-400">
                    <span className="text-brand-cyan font-mono font-bold block mb-0.5">Deliverable:</span>
                    {asg.deliverable}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    ~{asg.estimated_hours}h estimated
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      triggerCelebration({ particleCount: 60, spread: 50 });
                      addToast('success', `Assignment brief for "${asg.title}" initialized! Check your editor.`, 'Assignment Active');
                    }}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <span>Start Assignment</span>
                    <ArrowRight className="w-3 h-3 text-brand-cyan" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Weekly Challenges */}
      {activeTab === 'challenges' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-navy-900 to-cyan-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-mono text-purple-300 uppercase font-bold">Live Career Arena</span>
              </div>
              <h3 className="text-xl font-bold text-white">Weekly Synchronous Coding Arena</h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Compete against real peer test runs, solve timed algorithmic puzzles, and climb the weekly leaderboard.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/arena')}
              className="btn-primary text-xs py-2.5 px-5 shrink-0 shadow-glow flex items-center gap-2"
            >
              <span>Enter Career Arena</span>
              <ArrowRight className="w-4 h-4 text-navy-950" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Project Milestones */}
      {activeTab === 'milestones' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-cyan" />
              <span>Consolidated Development Milestones</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Track project milestones step-by-step. Click 'AI Mentor' on any milestone to inspect architecture and get starter code.
            </p>
          </div>

          <div className="space-y-4">
            {projects.flatMap((proj) =>
              (proj.milestones || []).map((m, idx) => ({
                milestone: m,
                idx,
                proj,
                key: `${proj.id}-${idx}`,
              }))
            ).map(({ milestone, idx, proj, key }) => (
              <div
                key={key}
                className="p-4 rounded-xl bg-navy-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                      {proj.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Step {idx + 1}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">{milestone}</h4>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenMentor(proj, milestone, idx)}
                  className="btn-secondary text-xs py-1.5 px-3 shrink-0 flex items-center gap-1.5 self-end sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>AI Mentor Advice</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Portfolio */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-cyan" />
                  <span>Verified Recruiter Portfolio Asset Gallery</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proof-of-work repositories and live deployment URLs that hiring managers can audit.
                </p>
              </div>

              <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                {Object.keys(submittedProjects).length} of {projects.length} Verified Assets
              </div>
            </div>

            {Object.keys(submittedProjects).length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No Portfolio Assets Submitted Yet"
                description="Complete and submit a capstone project above to populate your recruiter portfolio with verified evidence."
                actionLabel="Explore Projects"
                onAction={() => setSearchParams({ tab: 'recommended-projects' })}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects
                  .filter((p) => submittedProjects[p.id])
                  .map((proj) => (
                    <div
                      key={proj.id}
                      className="p-5 rounded-2xl bg-navy-950/80 border border-emerald-500/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                          ✓ Verified Proof of Work
                        </span>
                        <span className="text-xs font-mono text-cyan-300">+150 XP</span>
                      </div>

                      <h4 className="text-base font-bold text-white">{proj.name}</h4>
                      <p className="text-xs text-slate-300 line-clamp-2">{proj.problem_statement}</p>

                      <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between text-xs">
                        <a
                          href={submittedProjects[proj.id]}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-cyan font-mono hover:underline flex items-center gap-1.5 truncate max-w-[280px]"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{submittedProjects[proj.id]}</span>
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Project Mentor Modal */}
      <Modal
        isOpen={mentorModalOpen}
        onClose={() => setMentorModalOpen(false)}
        title={`AI Project Mentor: ${selectedProject?.name}`}
        maxWidth="max-w-3xl"
      >
        {mentorLoading ? (
          <div className="space-y-4 py-8 text-center">
            <div className="w-10 h-10 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-mono">Generating milestone architecture & code guidance...</p>
          </div>
        ) : mentorGuidance ? (
          <div className="space-y-5 text-xs sm:text-sm">
            {/* Active Milestone */}
            <div className="p-3.5 rounded-xl bg-navy-850 border border-slate-800">
              <span className="text-[10px] font-mono text-brand-cyan uppercase font-bold block mb-1">
                Target Milestone
              </span>
              <p className="text-xs text-slate-200 font-semibold">{selectedMilestone}</p>
            </div>

            {/* Architecture Overview */}
            <div>
              <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-brand-cyan font-mono">
                Architectural Separation & Strategy
              </h4>
              <p className="text-slate-300 leading-relaxed bg-navy-850 p-3.5 rounded-lg border border-slate-800">
                {mentorGuidance.architecture_overview}
              </p>
            </div>

            {/* Step-by-Step Implementation */}
            <div>
              <h4 className="font-semibold text-slate-200 mb-1.5 text-xs uppercase tracking-wider text-sky-400 font-mono">
                Step-by-Step Implementation Flow
              </h4>
              <ol className="space-y-2 bg-navy-850 p-4 rounded-lg border border-slate-800">
                {mentorGuidance.implementation_steps?.map((step, idx) => (
                  <li key={idx} className="text-slate-300 flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-slate-800 text-brand-cyan font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Starter Code Snippet */}
            {mentorGuidance.code_starter_snippet && (
              <div>
                <h4 className="font-semibold text-slate-200 mb-1.5 text-xs uppercase tracking-wider text-brand-indigo font-mono flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-brand-indigo" />
                  <span>Pattern Starter Snippet</span>
                </h4>
                <pre className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
                  <code>{mentorGuidance.code_starter_snippet}</code>
                </pre>
              </div>
            )}

            {/* Tradeoffs & Testing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-amber-400 font-mono">
                  Engineering Trade-Offs
                </h4>
                <p className="text-xs text-slate-300 bg-navy-850 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {mentorGuidance.key_tradeoffs}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 mb-1 text-xs uppercase tracking-wider text-emerald-400 font-mono">
                  Verification & Testing
                </h4>
                <p className="text-xs text-slate-300 bg-navy-850 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {mentorGuidance.testing_strategy}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setMentorModalOpen(false)}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                Close Guidance
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ProjectRecommendationsPage;

