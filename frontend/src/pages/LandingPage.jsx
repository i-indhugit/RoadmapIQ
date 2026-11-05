import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Bot,
  Brain,
  Cpu,
  BarChart3,
  Terminal,
  Code2,
  Share2,
  ShieldAlert,
  Landmark,
  Palette,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCareerTheme, applyThemeToDocument } from '../utils/careerThemes';

const FEATURED_CAREERS = [
  {
    id: 7,
    slug: 'machine-learning-engineer',
    title: 'AI/ML Engineer',
    themeKey: 'ai_galaxy',
    paletteName: 'AI Galaxy',
    colors: ['#00d2ff', '#8b5cf6', '#38bdf8'],
    bgBase: '#070c1a',
    cardBorder: 'rgba(56, 189, 248, 0.4)',
    accentGradient: 'from-cyan-500 via-indigo-500 to-purple-600',
    icon: Brain,
    categoryBadge: 'Deep Tech & AI',
    tagline: 'Neural networks, PyTorch, LLM fine-tuning & MLOps pipelines',
    milestones: ['Linear Algebra & Stats', 'Deep Learning Labs', 'Transformer Architecture', 'Production Inference'],
  },
  {
    id: 9,
    slug: 'business-analyst',
    title: 'Business Analyst',
    themeKey: 'business_city',
    paletteName: 'Business City',
    colors: ['#10b981', '#f59e0b', '#059669'],
    bgBase: '#04150f',
    cardBorder: 'rgba(16, 185, 129, 0.4)',
    accentGradient: 'from-emerald-500 via-teal-500 to-amber-500',
    icon: BarChart3,
    categoryBadge: 'Analytics & Strategy',
    tagline: 'Excel financial modeling, SQL queries, BI dashboards & PRD strategy',
    milestones: ['Quantitative Modeling', 'SQL Relational Schemas', 'Executive PowerBI', 'Strategic Business Case'],
  },
  {
    id: 1,
    slug: 'software-development-engineer',
    title: 'Software Developer',
    themeKey: 'code_kingdom',
    paletteName: 'Code Kingdom',
    colors: ['#00f0ff', '#14b8a6', '#3b82f6'],
    bgBase: '#090d14',
    cardBorder: 'rgba(0, 240, 255, 0.4)',
    accentGradient: 'from-cyan-400 via-teal-500 to-blue-600',
    icon: Code2,
    categoryBadge: 'Core Engineering',
    tagline: 'Algorithms, data structures, resilient APIs & distributed systems',
    milestones: ['DSA & Complexity', 'RESTful API Engineering', 'Docker & CI/CD', 'Scalable Full-Stack System'],
  },
  {
    id: 10,
    slug: 'digital-marketing-specialist',
    title: 'Digital Marketing',
    themeKey: 'creative_universe',
    paletteName: 'Creative Universe',
    colors: ['#ec4899', '#fb7185', '#f97316'],
    bgBase: '#140810',
    cardBorder: 'rgba(236, 72, 153, 0.4)',
    accentGradient: 'from-pink-500 via-rose-500 to-orange-500',
    icon: Share2,
    categoryBadge: 'Growth & Brand',
    tagline: 'SEO authority, viral copywriting, PPC funnels & conversion analytics',
    milestones: ['Audience Persona & Copy', 'Technical Search Indexing', 'Multi-Channel PPC', 'Conversion Funnel Audit'],
  },
  {
    id: 12,
    slug: 'cybersecurity-analyst',
    title: 'Cybersecurity',
    themeKey: 'cyber_fortress',
    paletteName: 'Cyber Fortress',
    colors: ['#ef4444', '#cbd5e1', '#38bdf8'],
    bgBase: '#050914',
    cardBorder: 'rgba(239, 68, 68, 0.4)',
    accentGradient: 'from-red-500 via-slate-400 to-sky-400',
    icon: ShieldAlert,
    categoryBadge: 'Security & Defense',
    tagline: 'Network packet auditing, SIEM threat detection, cryptography & zero-trust',
    milestones: ['TCP/IP Network Hardening', 'Vulnerability Analysis', 'Intrusion Detection Logs', 'Enterprise Security Audit'],
  },
  {
    id: 14,
    slug: 'financial-analyst',
    title: 'Finance',
    themeKey: 'finance_empire',
    paletteName: 'Finance Empire',
    colors: ['#f59e0b', '#fef3c7', '#d97706'],
    bgBase: '#120d08',
    cardBorder: 'rgba(245, 158, 11, 0.4)',
    accentGradient: 'from-amber-400 via-yellow-500 to-amber-700',
    icon: Landmark,
    categoryBadge: 'Corporate Finance',
    tagline: 'Discounted Cash Flows, GAAP balance sheets, EBITDA ratios & valuation',
    milestones: ['Financial Accounting Core', 'Ratio & Cash Flow Analysis', 'DCF Valuation Models', 'Equity Research Capstone'],
  },
  {
    id: 11,
    slug: 'ui-ux-designer',
    title: 'UI/UX Designer',
    themeKey: 'design_world',
    paletteName: 'Design World',
    colors: ['#c084fc', '#9333ea', '#f472b6'],
    bgBase: '#0f091c',
    cardBorder: 'rgba(192, 132, 252, 0.4)',
    accentGradient: 'from-purple-400 via-fuchsia-500 to-pink-500',
    icon: Palette,
    categoryBadge: 'Product Design',
    tagline: 'Design systems, interactive Figma flows, user research & usability testing',
    milestones: ['User Research & Personas', 'Wireframing & Layout Grids', 'Design Systems & Tokens', 'Cross-Platform Product Design'],
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const {
    activeRole,
    activeRoadmap,
    allRoles,
    switchCareer,
    isSwitchingCareer,
    activeTheme,
    addToast
  } = useApp();

  // Selected career state defaults to activeRole or AI/ML Engineer
  const [selectedCareer, setSelectedCareer] = useState(() => {
    if (activeRole) {
      const match = FEATURED_CAREERS.find((c) => c.slug === activeRole.slug || c.id === activeRole.id);
      if (match) return match;
    }
    return FEATURED_CAREERS[0];
  });

  const handleSelectCareer = (career) => {
    setSelectedCareer(career);
    // Instantly preview theme
    const theme = getCareerTheme(career.slug);
    applyThemeToDocument(theme);
  };

  const handleContinue = async () => {
    try {
      // Find database role ID
      const targetRole = allRoles?.find((r) => r.slug === selectedCareer.slug) || selectedCareer;
      if (targetRole?.id) {
        await switchCareer(targetRole.id, { silent: true });
      }
      navigate('/assessment');
    } catch {
      // Fallback navigation
      navigate('/assessment');
    }
  };

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* 1. Header / Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto pt-4 sm:pt-8 px-4">
        {/* Subtle dynamic glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none -z-10 opacity-30 transition-all duration-700"
          style={{ backgroundColor: selectedCareer.colors[0] }}
        />

        {/* RoadmapIQ Branding Badge */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono mb-4 shadow-sm transition-all"
          style={{
            backgroundColor: 'rgba(10, 15, 29, 0.7)',
            borderColor: selectedCareer.colors[0],
            color: selectedCareer.colors[0],
          }}
        >
          <Compass className="w-4 h-4 animate-spin-slow" />
          <span className="font-semibold tracking-wide">RoadmapIQ • AI Career Learning Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Your Skills. Your Path.{' '}
          <span
            className="bg-clip-text text-transparent bg-gradient-to-r transition-all duration-500"
            style={{
              backgroundImage: `linear-gradient(135deg, ${selectedCareer.colors[0]}, ${selectedCareer.colors[1]})`,
            }}
          >
            Your Journey.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed">
          Transform your career preparation from an ordinary checklist into an interactive visual journey. Choose your destination, test your competencies, unlock checkpoints, and prepare for placement with Google Gemini.
        </p>

        {/* Quick Active Roadmap Pill */}
        {activeRoadmap && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-950/70 border border-slate-800 text-xs text-slate-300 mb-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: selectedCareer.colors[0] }} />
            <span>Active Journey: <strong className="text-white">{activeRoadmap.role_title}</strong></span>
            <button
              onClick={() => navigate('/roadmap')}
              className="ml-2 font-semibold hover:underline flex items-center gap-0.5"
              style={{ color: selectedCareer.colors[0] }}
            >
              Resume Path →
            </button>
          </div>
        )}
      </section>

      {/* 2. Career Selection Section with Themed Cards */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: selectedCareer.colors[0] }} />
              <span>Step 1: Choose Your World</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Select Your Career Journey
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Click any career to activate its unique theme & environment
          </span>
        </div>

        {/* Themed Career Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FEATURED_CAREERS.map((career) => {
            const isSelected = selectedCareer.slug === career.slug;
            const IconComponent = career.icon;

            return (
              <div
                key={career.slug}
                onClick={() => handleSelectCareer(career)}
                className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between group overflow-hidden border ${
                  isSelected
                    ? 'ring-2 shadow-lg transform -translate-y-1'
                    : 'hover:border-slate-700 hover:-translate-y-0.5'
                }`}
                style={{
                  backgroundColor: isSelected ? career.bgBase : 'rgba(12, 18, 32, 0.75)',
                  borderColor: isSelected ? career.colors[0] : 'rgba(51, 65, 85, 0.6)',
                  boxShadow: isSelected ? `0 10px 25px -5px ${career.colors[0]}33` : 'none',
                }}
              >
                {/* Top: Icon & Category Badge */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${career.colors[0]}22`,
                        color: career.colors[0],
                        border: `1px solid ${career.colors[0]}44`,
                      }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${career.colors[0]}15`,
                        borderColor: `${career.colors[0]}33`,
                        color: career.colors[0],
                      }}
                    >
                      {career.categoryBadge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-slate-100">
                    {career.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                    {career.tagline}
                  </p>

                  {/* Milestones Preview */}
                  <div className="space-y-1 pt-2 border-t border-slate-800/80 mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                      Learning Milestones:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {career.milestones.slice(0, 2).map((m, idx) => (
                        <span key={idx} className="text-[10px] text-slate-300 px-2 py-0.5 rounded bg-navy-950/80 border border-slate-800">
                          {m}
                        </span>
                      ))}
                      <span className="text-[10px] text-slate-400 px-1 py-0.5">
                        +{career.milestones.length - 2} more
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Palette indicator & Selection pill */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 mt-auto">
                  <div className="flex items-center gap-1.5">
                    {career.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                    <span className="text-[10px] font-mono text-slate-500 ml-1">
                      {career.paletteName}
                    </span>
                  </div>

                  {isSelected && (
                    <span
                      className="flex items-center gap-1 text-[11px] font-mono font-bold"
                      style={{ color: career.colors[0] }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selected</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Continue Button Action Area */}
        <div className="mt-8 p-6 rounded-2xl glass-panel text-center max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-300">
            <span>Destination Selected:</span>
            <strong className="text-white font-semibold text-sm" style={{ color: selectedCareer.colors[0] }}>
              {selectedCareer.title}
            </strong>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleContinue}
              disabled={isSwitchingCareer}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${selectedCareer.colors[0]}, ${selectedCareer.colors[1]})`,
                color: '#060a12',
                boxShadow: `0 10px 20px -5px ${selectedCareer.colors[0]}66`,
              }}
            >
              <span>{isSwitchingCareer ? 'Configuring Theme...' : `Begin ${selectedCareer.title} Journey`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/assessment')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs bg-navy-900 border border-slate-700 hover:border-cyan-400 text-white transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Take Career Skill Assessment</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Next: Take the competency skill test or configure your weekly study hours.
          </p>
        </div>
      </section>

      {/* 4. 4-Stage Learning Journey Structure Preview */}
      <section className="max-w-6xl mx-auto px-4 pt-6">
        <div className="text-center mb-8">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
            Connected Milestone Path
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            How Your Roadmap Journey Unfolds
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-1">
            Skills are organized into sequential phases. Complete required checkpoints to unlock subsequent skills on the connected roadmap path.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              phase: 'Phase 1',
              title: 'Foundation Checkpoints',
              desc: 'Core domain syntax, mathematical foundations & essential terminology.',
              icon: Compass,
            },
            {
              phase: 'Phase 2',
              title: 'Intermediate Labs',
              desc: 'Practical frameworks, data pipelines & hands-on problem solving.',
              icon: Layers,
            },
            {
              phase: 'Phase 3',
              title: 'Advanced Architecture',
              desc: 'Production systems, design patterns, testing & performance tuning.',
              icon: Cpu,
            },
            {
              phase: 'Phase 4',
              title: 'Career Readiness Capstone',
              desc: 'End-to-end portfolio projects, mock interview rubrics & placement review.',
              icon: Award,
            },
          ].map((stg, i) => {
            const Icon = stg.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl glass-card relative overflow-hidden"
                style={{
                  borderColor: selectedCareer.colors[0] + '33',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                    style={{
                      backgroundColor: `${selectedCareer.colors[0]}22`,
                      color: selectedCareer.colors[0],
                    }}
                  >
                    {stg.phase}
                  </span>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {stg.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {stg.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Core RoadmapIQ Principles */}
      <section className="max-w-6xl mx-auto px-4 pt-4">
        <div className="p-6 rounded-2xl bg-navy-950/60 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-center shrink-0" style={{ color: selectedCareer.colors[0] }}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block mb-0.5">Assessed, Not Assumed</strong>
              <p className="text-slate-400 leading-relaxed">
                We never assume skills from academic degrees. Competency tests and self-reported ratings determine your genuine starting checkpoint.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-center shrink-0" style={{ color: selectedCareer.colors[1] }}>
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block mb-0.5">Google Gemini + Grounded RAG</strong>
              <p className="text-slate-400 leading-relaxed">
                Personalized explanations, weekly study pacing, and mock evaluations are synthesized with Google Gemini, citing verified curriculum sources without hallucinated links.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-center shrink-0" style={{ color: selectedCareer.colors[0] }}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block mb-0.5">Persistent Career Progress</strong>
              <p className="text-slate-400 leading-relaxed">
                Completed checkpoints and logged hours are saved in SQLite. Switch between careers anytime without losing your previous progress.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
