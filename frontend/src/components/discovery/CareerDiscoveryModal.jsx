import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Heart,
  Brain,
  Building,
  Target,
  Loader2,
  X,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { discoveryApi } from '../../services/api';
import Badge from '../common/Badge';

const FALLBACK_DISCOVERY_QUESTIONS = [
  {
    id: 'stream',
    step: 1,
    title: 'What is your educational background or current academic stream?',
    subtitle: 'RoadmapIQ prepares students from every academic discipline for high-impact careers.',
    icon: GraduationCap,
    options: [
      { id: 'Engineering', label: 'Engineering & Technology', desc: 'B.Tech, B.E., BCA, CS/IT or technical diplomas' },
      { id: 'Science', label: 'Pure & Applied Science', desc: 'B.Sc/M.Sc in Physics, Chemistry, Math, Biology, Biotech' },
      { id: 'Commerce', label: 'Commerce, Accounting & Finance', desc: 'B.Com, BAF, BBA Finance, CA aspirants' },
      { id: 'Arts', label: 'Arts & Humanities', desc: 'BA in History, Literature, Sociology, Economics, Journalism' },
      { id: 'Medical', label: 'Medical & Healthcare Sciences', desc: 'MBBS, BDS, B.Pharm, Nursing, Allied Health' },
      { id: 'Law', label: 'Law & Legal Studies', desc: 'LL.B., B.A. LL.B., B.B.A. LL.B., or pre-law' },
      { id: 'Management', label: 'Business & Management', desc: 'BBA, BMS, MBA, International Business' },
      { id: 'Vocational', label: 'Diploma / Vocational / Self-Taught', desc: 'Polytechnic, bootcamps, or independent learner' },
    ],
  },
  {
    id: 'interests',
    step: 2,
    title: 'What kind of work or topics genuinely excite you most?',
    subtitle: 'Choose the area where you lose track of time when learning or solving problems.',
    icon: Heart,
    options: [
      { id: 'Problem solving & software programming', label: 'Coding & Software Engineering', desc: 'Writing clean code, designing architectures, debugging software' },
      { id: 'Artificial Intelligence, mathematics & algorithms', label: 'AI, Math & Machine Learning', desc: 'Neural networks, predictive modeling, statistical algorithms' },
      { id: 'Data analysis, spreadsheets & market patterns', label: 'Data Analysis & Numbers', desc: 'Mining patterns, creating dashboards, economic insights' },
      { id: 'Finance, investment, corporate accounting & wealth', label: 'Finance & Banking', desc: 'Financial modeling, stock markets, auditing, investment banking' },
      { id: 'Creative visual design, UI/UX & media storytelling', label: 'Creative Design & Media', desc: 'UI/UX interfaces, graphic art, brand design, digital video' },
      { id: 'Biological sciences, healthcare & patient wellness', label: 'Healthcare & Life Sciences', desc: 'Clinical care, pharmaceutical research, patient well-being' },
      { id: 'Legal justice, courtroom advocacy & constitutional rights', label: 'Law & Justice', desc: 'Statutory research, contracts, civil rights, courtroom advocacy' },
      { id: 'Governance, public administration & national policy', label: 'Civil Services & Public Policy', desc: 'District administration, socio-economic welfare, governance' },
      { id: 'Physical machines, civil structures & robotics', label: 'Core Engineering Systems', desc: 'Hardware, mechanical parts, buildings, electrical grids' },
      { id: 'Business growth, marketing & startup building', label: 'Entrepreneurship & Strategy', desc: 'Building products, user acquisition, team leadership' },
    ],
  },
  {
    id: 'analytical_style',
    step: 3,
    title: 'How do you prefer to think, analyze and solve problems?',
    subtitle: 'Every career track aligns with a distinct cognitive and analytical approach.',
    icon: Brain,
    options: [
      { id: 'Data-driven, logical, and structured step-by-step', label: 'Structured & Analytical', desc: 'Rely on data, formal logic, and systematic execution' },
      { id: 'Deep theoretical, research-oriented and academic curiosity', label: 'Deep Research & Theory', desc: 'Dig deep into root causes, papers, and mathematical foundations' },
      { id: 'Hands-on practical building, experimenting and rapid iteration', label: 'Hands-on Builder', desc: 'Learn best by building real working prototypes immediately' },
      { id: 'Empathetic, human-centric and interpersonal communication', label: 'Human-Centric & Intuitive', desc: 'Understand people, emotional intelligence, and team dynamics' },
      { id: 'Strategic, systemic, and big-picture institutional governance', label: 'Strategic & High-Level', desc: 'Think in systems, policies, resource trade-offs, and long-term vision' },
    ],
  },
  {
    id: 'work_environment',
    step: 4,
    title: 'What type of professional environment do you see yourself thriving in?',
    subtitle: 'Where you work day-to-day shapes your long-term satisfaction and growth.',
    icon: Building,
    options: [
      { id: 'Tech campus, modern software office, or remote workspace', label: 'Tech Office / Remote', desc: 'Modern workstations, agile sprints, asynchronous collaboration' },
      { id: 'Hospitals, clinical research facilities, and medical diagnostic centers', label: 'Clinical & Biomedical Center', desc: 'Healthcare settings, laboratories, patient diagnostic units' },
      { id: 'Corporate law firms, judicial courtrooms, and legal arbitration chambers', label: 'Legal Chambers & Courtrooms', desc: 'Law firms, client consultations, judicial proceedings' },
      { id: 'Financial trading desks, investment advisory firms, and corporate headquarters', label: 'Financial Trading / Corporate HQ', desc: 'Fast-paced market desks, boardrooms, client pitches' },
      { id: 'Government administrative secretariats, public departments, and field sites', label: 'Public Governance & Field Admin', desc: 'Government secretariats, district administration, civic outreach' },
      { id: 'Creative design studios, content production labs, and agencies', label: 'Creative Studio / Media Agency', desc: 'Design labs, media studios, dynamic brainstorming spaces' },
      { id: 'Engineering manufacturing plants, construction projects, and robotics workshops', label: 'Industrial Plants & Workshops', desc: 'Physical assembly floors, testing bays, infrastructure sites' },
    ],
  },
  {
    id: 'ambition',
    step: 5,
    title: 'What is your overarching career ambition and definition of success?',
    subtitle: 'What drives your career aspiration at this stage of your life?',
    icon: Target,
    options: [
      { id: 'High earning potential, competitive compensation, and corporate scale', label: 'High Earning & Market Scale', desc: 'Maximized compensation, tech equity, rapid financial independence' },
      { id: 'Public service, nation-building, social equity, and civic impact', label: 'Public Service & Social Impact', desc: 'Serving society, uplifting communities, driving institutional change' },
      { id: 'Inventing breakthrough technology, novel algorithms, and patents', label: 'Deep Tech & Innovation', desc: 'Pushing the frontiers of science, AI, and patentable inventions' },
      { id: 'Creative originality, personal voice, and aesthetic excellence', label: 'Creative Excellence & Mastery', desc: 'Recognized for distinctive artistic, design, or written voice' },
      { id: 'Autonomy, starting my own venture, and business ownership', label: 'Autonomy & Entrepreneurship', desc: 'Leading your own company, creating jobs, building equity' },
    ],
  },
];

export default function CareerDiscoveryModal({ isOpen, onClose, onSelectCareer }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [questions, setQuestions] = useState(FALLBACK_DISCOVERY_QUESTIONS);
  const [answers, setAnswers] = useState({
    stream: '',
    interests: '',
    analytical_style: '',
    work_environment: '',
    ambition: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch questions from backend if available
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    discoveryApi
      .getQuestions()
      .then((data) => {
        if (isMounted && data && Array.isArray(data.questions) && data.questions.length > 0) {
          // Merge icons and subtitles
          const merged = data.questions.map((q, idx) => ({
            ...q,
            icon: FALLBACK_DISCOVERY_QUESTIONS[idx]?.icon || Compass,
            subtitle: FALLBACK_DISCOVERY_QUESTIONS[idx]?.subtitle || '',
            options: q.options || FALLBACK_DISCOVERY_QUESTIONS[idx]?.options || [],
          }));
          setQuestions(merged);
        }
      })
      .catch(() => {
        // Fallback already in place
      });
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ = questions[currentStep - 1] || questions[0];
  const IconComponent = currentQ.icon || Compass;

  const handleSelectOption = (optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleNext = async () => {
    if (currentStep < questions.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final step -> submit discovery
      setIsSubmitting(true);
      setErrorMsg(null);
      try {
        const payload = {
          stream: answers.stream || 'Science',
          interests: answers.interests || 'Problem solving & software programming',
          analytical_style: answers.analytical_style || 'Data-driven, logical, and structured step-by-step',
          work_environment: answers.work_environment || 'Tech campus, modern software office, or remote workspace',
          ambition: answers.ambition || 'High earning potential, competitive compensation, and corporate scale',
          current_education_level: 'Undergraduate',
        };
        const res = await discoveryApi.discover(payload);
        setRecommendations(res.recommendations || []);
      } catch (err) {
        setErrorMsg(err.message || 'Could not compute career recommendations.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setRecommendations(null);
    setAnswers({
      stream: '',
      interests: '',
      analytical_style: '',
      work_environment: '',
      ambition: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">AI Career Discovery Navigator</h2>
                <Badge variant="primary" size="xs">All 18 Domains</Badge>
              </div>
              <p className="text-xs text-slate-400">
                {recommendations ? 'Your Top Personalized Matches' : `Step ${currentStep} of ${questions.length}: Find Your Optimal Path`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar (when questionnaire is active) */}
        {!recommendations && (
          <div className="w-full bg-slate-800/80 h-1">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${(currentStep / questions.length) * 100}%` }}
            />
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Questionnaire View */}
          {!recommendations && !isSubmitting && (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    {currentQ.title}
                  </h3>
                  {currentQ.subtitle && (
                    <p className="text-xs text-slate-400 mt-0.5">{currentQ.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {currentQ.options?.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400/80 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                      <div className="space-y-0.5">
                        <div className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {opt.label || opt.id}
                        </div>
                        {opt.desc && (
                          <div className="text-[11px] text-slate-400 leading-snug">{opt.desc}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading Recommendations State */}
          {isSubmitting && (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-spin">
                <Loader2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Analyzing Your Profile & Preferences...</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Comparing your stream, interests, analytical style, and career ambitions against 252 career tracks across all 18 domains.
              </p>
            </div>
          )}

          {/* Results Recommendations View */}
          {recommendations && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Top 3 Career Recommendations Found</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Based on your {answers.stream || 'academic'} background and preferences. Select any path to begin!
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono shrink-0 ml-3"
                >
                  Retake Discovery
                </button>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec, index) => {
                  const matchPct = rec.match_score || (index === 0 ? 96 : index === 1 ? 91 : 85);
                  return (
                    <div
                      key={rec.career_id || rec.slug || index}
                      className="p-5 rounded-2xl bg-slate-850/80 border border-slate-700/80 hover:border-cyan-500/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/40">
                            #{index + 1} • {matchPct}% Match
                          </span>
                          {rec.domain && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                              {rec.domain}
                            </span>
                          )}
                          {rec.market_demand && (
                            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                              {rec.market_demand} Demand
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-white">{rec.title}</h4>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {rec.match_rationale || rec.short_summary || rec.description}
                        </p>

                        {/* Regulatory Disclaimer Pill if present */}
                        {rec.regulatory_disclaimer && (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                            <span><strong>Statutory Requirement:</strong> {rec.regulatory_disclaimer}</span>
                          </div>
                        )}

                        {/* Key Competencies */}
                        {rec.key_competencies?.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] text-slate-400 font-mono">Skills:</span>
                            {rec.key_competencies.slice(0, 4).map((c, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 shrink-0">
                        {rec.average_salary_range && (
                          <span className="text-xs font-mono text-emerald-400 font-semibold text-right">
                            {rec.average_salary_range}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCareer(rec.role_id || rec.id || rec);
                            onClose();
                          }}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
                        >
                          <span>Select This Career</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!recommendations && !isSubmitting && (
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/50">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                currentStep === 1
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                answers[currentQ.id]
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>{currentStep === questions.length ? 'Discover My Career Matches' : 'Next Question'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

