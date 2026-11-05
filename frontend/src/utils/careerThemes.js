// Centralized Career Theme System for RoadmapIQ
// Delivers a clean, friendly, career-specific visual environment tailored to all 18 professional domains.

export const CAREER_THEMES = {
  // 1. Technology: Developer Universe, code-inspired elements, terminal visuals and blue/cyan accents
  technology: {
    id: 'technology',
    domainId: 'technology',
    domainName: 'Technology & IT',
    roleSlugs: ['software-development-engineer', 'full-stack-developer', 'backend-developer', 'python-developer', 'frontend-developer', 'java-developer', 'mobile-app-developer', 'qa-automation-engineer'],
    name: 'Developer Universe',
    environmentName: 'Code Laboratory & System Studio',
    tagline: 'Clean Code Architectures, Resilient Distributed Systems, RESTful APIs & Cloud Native Services',
    palette: {
      primary: '#00f0ff', // Vivid Cyan
      secondary: '#14b8a6', // Teal
      accent: '#3b82f6', // Electric Tech Blue
      baseBg: '#080d17', // Deep Charcoal Navy
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #111e33 0%, #080d17 60%, #03060a 100%)',
      cardBg: 'rgba(14, 22, 38, 0.90)',
      cardBorder: 'rgba(0, 240, 255, 0.28)',
      glow: 'rgba(0, 240, 255, 0.38)',
      btnGradient: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
      btnText: '#040810',
      badgeBorder: 'border-cyan-400/40',
      badgeBg: 'rgba(0, 240, 255, 0.12)',
      badgeText: '#00f0ff',
      bgGradient: 'from-slate-950 via-slate-900 to-navy-950',
      pathStroke: '#00f0ff',
      pathGlow: 'rgba(20, 184, 166, 0.4)',
    },
    visualMotif: {
      styleName: 'Monospaced Terminal Grids & Git DAG Topology',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2300f0ff\' fill-opacity=\'0.04\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")',
      heroWatermark: '💻 DEV_RUNTIME_V2',
    },
    defaultAvatar: 'code_knight',
    sceneryType: 'kingdom',
    landmark: {
      title: 'Software Development & Architecture Certification',
      subtitle: 'Demonstrate production-grade code architecture, reliable test suites, and scalable API deployments.',
      badge: 'Software Developer Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Core Programming Syntax, Git & CLI Tools', icon: 'Terminal' },
      { number: 2, name: 'Phase 2: Data Structures', subtitle: 'Algorithms, Complexity & Problem Solving', icon: 'Layers' },
      { number: 3, name: 'Phase 3: Databases & APIs', subtitle: 'RESTful Architecture, SQL & Cache Stores', icon: 'Database' },
      { number: 4, name: 'Phase 4: Testing & CI/CD', subtitle: 'Unit Tests, Docker & Cloud Deployment', icon: 'CheckSquare' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Scalable Full-Stack Web Application', icon: 'Award' },
    ]
  },

  // 2. AI and ML: AI Intelligence Lab, neural-network graphics, data visualizations and purple/blue accents
  ai_ml: {
    id: 'ai_ml',
    domainId: 'ai_ml',
    domainName: 'AI & Machine Learning',
    roleSlugs: ['ai-engineer', 'machine-learning-engineer', 'generative-ai-developer', 'deep-learning-researcher', 'prompt-engineer-ai-agent-developer', 'agentic-ai-engineer'],
    name: 'AI Intelligence Lab',
    environmentName: 'Neural Research Center & Agentic Lab',
    tagline: 'Linear Algebra, PyTorch Neural Networks, Transformer Embeddings & Autonomous Agent Systems',
    palette: {
      primary: '#00d2ff', // Electric Cyan
      secondary: '#a855f7', // Vivid Purple
      accent: '#6366f1', // Indigo Accent
      baseBg: '#070a1a', // Deep Cosmic Navy
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #171638 0%, #070a1a 60%, #03040c 100%)',
      cardBg: 'rgba(15, 18, 42, 0.90)',
      cardBorder: 'rgba(168, 85, 247, 0.32)',
      glow: 'rgba(0, 210, 255, 0.40)',
      btnGradient: 'linear-gradient(135deg, #00d2ff 0%, #a855f7 100%)',
      btnText: '#040714',
      badgeBorder: 'border-purple-400/40',
      badgeBg: 'rgba(168, 85, 247, 0.14)',
      badgeText: '#c084fc',
      bgGradient: 'from-slate-950 via-indigo-950/40 to-slate-900',
      pathStroke: '#00d2ff',
      pathGlow: 'rgba(168, 85, 247, 0.45)',
    },
    visualMotif: {
      styleName: 'Neural Tensor Nodes & High-Dimensional Vector Embeddings',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%23a855f7\' stroke-width=\'1\' stroke-opacity=\'0.06\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'12\'/%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'4\'/%3E%3Ccircle cx=\'50\' cy=\'10\' r=\'4\'/%3E%3Ccircle cx=\'10\' cy=\'50\' r=\'4\'/%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'4\'/%3E%3C/g%3E%3C/svg%3E")',
      heroWatermark: '🧠 NEURAL_SYNAPSE_GRID',
    },
    defaultAvatar: 'ai_robot',
    sceneryType: 'galaxy',
    landmark: {
      title: 'AI & Machine Learning Career Certification',
      subtitle: 'Complete all 5 phases to demonstrate job-ready AI modeling, fine-tuning, and production deployment.',
      badge: 'ML & AI Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Mathematics, Vector Spaces & Python Core', icon: 'Sparkles' },
      { number: 2, name: 'Phase 2: Classical ML', subtitle: 'Scikit-Learn, Feature Extraction & Cross-Validation', icon: 'BarChart' },
      { number: 3, name: 'Phase 3: Deep Neural Nets', subtitle: 'PyTorch, Convolutions & Recurrent Networks', icon: 'Layers' },
      { number: 4, name: 'Phase 4: Generative Models', subtitle: 'Transformers, LLM Fine-Tuning & Vector Stores', icon: 'Cpu' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Autonomous Agent Pipeline & Production MLOps', icon: 'Award' },
    ]
  },

  // 3. Data Science: Data Intelligence Center, analytics charts, dashboards and visualization-inspired elements
  data_science: {
    id: 'data_science',
    domainId: 'data_science',
    domainName: 'Data Science & Analytics',
    roleSlugs: ['data-analyst', 'data-scientist', 'business-intelligence-developer', 'data-engineer'],
    name: 'Data Intelligence Center',
    environmentName: 'Statistical Discovery & Analytics Hub',
    tagline: 'Statistical Inference, Relational Schemas, Feature Engineering & Executive Dashboards',
    palette: {
      primary: '#10b981', // Mint Emerald
      secondary: '#0284c7', // Sky Blue
      accent: '#f59e0b', // Warm Gold
      baseBg: '#051214', // Deep Aquatic Emerald
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #0b2426 0%, #051214 60%, #02090a 100%)',
      cardBg: 'rgba(8, 28, 30, 0.90)',
      cardBorder: 'rgba(16, 185, 129, 0.30)',
      glow: 'rgba(16, 185, 129, 0.38)',
      btnGradient: 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)',
      btnText: '#041214',
      badgeBorder: 'border-emerald-400/40',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      badgeText: '#34d399',
      bgGradient: 'from-slate-950 via-emerald-950/30 to-slate-900',
      pathStroke: '#10b981',
      pathGlow: 'rgba(2, 132, 199, 0.40)',
    },
    visualMotif: {
      styleName: 'Cartesian Histogram Scatterplots & SQL Data Pipelines',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'50\' height=\'50\' viewBox=\'0 0 50 50\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 40H40V10\' fill=\'none\' stroke=\'%2310b981\' stroke-width=\'1\' stroke-opacity=\'0.06\'/%3E%3Ccircle cx=\'20\' cy=\'30\' r=\'2\' fill=\'%2310b981\' fill-opacity=\'0.08\'/%3E%3Ccircle cx=\'30\' cy=\'20\' r=\'2\' fill=\'%2310b981\' fill-opacity=\'0.08\'/%3E%3C/svg%3E")',
      heroWatermark: '📊 DATA_INSIGHT_RADAR',
    },
    defaultAvatar: 'business_pro',
    sceneryType: 'city',
    landmark: {
      title: 'Data Science & Analytical Mastery',
      subtitle: 'Complete all 5 phases to master exploratory analysis, predictive modeling, and executive metric storytelling.',
      badge: 'Data Scientist Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Descriptive Statistics, Probability & Pandas', icon: 'BarChart' },
      { number: 2, name: 'Phase 2: Relational Data', subtitle: 'SQL Window Functions & Warehousing', icon: 'Database' },
      { number: 3, name: 'Phase 3: Exploratory Analysis', subtitle: 'Hypothesis Testing & Feature Selection', icon: 'Layers' },
      { number: 4, name: 'Phase 4: Predictive Modeling', subtitle: 'Regression, Classification & Clustering', icon: 'TrendingUp' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Executive Dashboard & Predictive Pipeline', icon: 'Award' },
    ]
  },

  // 4. Commerce and Finance: Financial Intelligence Center, financial graphics, elegant navy and gold accents
  commerce_finance: {
    id: 'commerce_finance',
    domainId: 'commerce_finance',
    domainName: 'Commerce & Finance',
    roleSlugs: ['financial-analyst', 'investment-analyst', 'chartered-accountant-ca', 'wealth-manager', 'equity-research-analyst', 'credit-risk-analyst', 'corporate-treasury-analyst'],
    name: 'Financial Intelligence Center',
    environmentName: 'Institutional Trading & Valuation Chamber',
    tagline: 'Balance Sheet Integrity, Discounted Cash Flows, Equity Valuation & Risk Mitigation',
    palette: {
      primary: '#f59e0b', // Burnished Radiant Gold
      secondary: '#38bdf8', // Ice Blue Ticker
      accent: '#d97706', // Deep Amber
      baseBg: '#090e18', // Imperial Midnight Navy
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #1a1e2e 0%, #090e18 60%, #03050a 100%)',
      cardBg: 'rgba(15, 23, 40, 0.90)',
      cardBorder: 'rgba(245, 158, 11, 0.32)',
      glow: 'rgba(245, 158, 11, 0.38)',
      btnGradient: 'linear-gradient(135deg, #f59e0b 0%, #ca8a04 100%)',
      btnText: '#090e18',
      badgeBorder: 'border-amber-400/40',
      badgeBg: 'rgba(245, 158, 11, 0.14)',
      badgeText: '#fbbf24',
      bgGradient: 'from-slate-950 via-amber-950/25 to-slate-900',
      pathStroke: '#f59e0b',
      pathGlow: 'rgba(245, 158, 11, 0.45)',
    },
    visualMotif: {
      styleName: 'Candlestick Chart Trajectories & Ledger Watermarks',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M5 35L15 25L25 30L35 15\' fill=\'none\' stroke=\'%23f59e0b\' stroke-width=\'1\' stroke-opacity=\'0.06\'/%3E%3C/svg%3E")',
      heroWatermark: '📈 CAPITAL_VALUATION_DESK',
    },
    defaultAvatar: 'wealth_banker',
    sceneryType: 'finance',
    landmark: {
      title: 'Institutional Financial Analysis Certification',
      subtitle: 'Complete all 5 phases to master 3-statement models, DCF equity valuations, and auditing standards.',
      badge: 'Financial Analyst Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'GAAP/IFRS Accounting, Cash Flows & Ratios', icon: 'BookOpen' },
      { number: 2, name: 'Phase 2: Financial Modeling', subtitle: 'Dynamic 3-Statement Excel Forecasting', icon: 'Calculator' },
      { number: 3, name: 'Phase 3: Corporate Valuation', subtitle: 'DCF, Comparable Multiples & WACC', icon: 'Landmark' },
      { number: 4, name: 'Phase 4: Risk Management', subtitle: 'Credit Scoring, Portfolio Theory & Hedging', icon: 'Shield' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Comprehensive Institutional Equity Research Report', icon: 'Award' },
    ]
  },

  // 5. Arts and Humanities: Creative Studio, editorial layouts, visual textures and expressive typography
  arts_humanities: {
    id: 'arts_humanities',
    domainId: 'arts_humanities',
    domainName: 'Arts & Humanities',
    roleSlugs: ['creative-writer', 'journalist', 'historian-archivist', 'pr-corporate-communications-specialist', 'content-strategist', 'museum-curator'],
    name: 'Creative & Editorial Studio',
    environmentName: 'Humanities & Cultural Discourse Chamber',
    tagline: 'Compelling Storytelling, Critical Cultural Inquiries, Rhetoric & Editorial Authority',
    palette: {
      primary: '#ec4899', // Berry Rose
      secondary: '#f59e0b', // Warm Amber
      accent: '#a855f7', // Violet
      baseBg: '#110915', // Rich Plum Obsidian
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #29102c 0%, #110915 60%, #07030a 100%)',
      cardBg: 'rgba(26, 14, 32, 0.90)',
      cardBorder: 'rgba(236, 72, 153, 0.28)',
      glow: 'rgba(236, 72, 153, 0.38)',
      btnGradient: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
      btnText: '#110915',
      badgeBorder: 'border-pink-400/40',
      badgeBg: 'rgba(236, 72, 153, 0.14)',
      badgeText: '#f472b6',
      bgGradient: 'from-slate-950 via-pink-950/30 to-slate-900',
      pathStroke: '#ec4899',
      pathGlow: 'rgba(245, 158, 11, 0.40)',
    },
    visualMotif: {
      styleName: 'Editorial Serifs, Parchment Grain & Columnar Balance',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 10H40M0 20H40M0 30H40\' fill=\'none\' stroke=\'%23ec4899\' stroke-width=\'0.75\' stroke-opacity=\'0.05\'/%3E%3C/svg%3E")',
      heroWatermark: '✒️ EDITORIAL_DISCOURSE',
    },
    defaultAvatar: 'creator_avatar',
    sceneryType: 'creative',
    landmark: {
      title: 'Humanities & Narrative Communication Mastery',
      subtitle: 'Complete all 5 phases to master critical reasoning, investigative synthesis, and authoritative writing.',
      badge: 'Humanities Scholar Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Rhetorical Theory, Logic & Literary Canons', icon: 'BookOpen' },
      { number: 2, name: 'Phase 2: Research Methods', subtitle: 'Archival Synthesis, Citation & Ethics', icon: 'Search' },
      { number: 3, name: 'Phase 3: Long-Form Synthesis', subtitle: 'Investigative Essays & Narrative Craft', icon: 'PenTool' },
      { number: 4, name: 'Phase 4: Cultural Engagement', subtitle: 'Public Discourse, Media & Curation', icon: 'Users' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Major Analytical Monograph or Editorial Portfolio', icon: 'Award' },
    ]
  },

  // 6. Business: Business Strategy Center, strategy boards, planning visuals and professional graphics
  business_management: {
    id: 'business_management',
    domainId: 'business_management',
    domainName: 'Business & Management',
    roleSlugs: ['product-manager', 'management-consultant', 'business-analyst', 'operations-manager', 'supply-chain-analyst', 'hr-specialist'],
    name: 'Business Strategy Center',
    environmentName: 'Executive Strategy & Operations Room',
    tagline: 'Strategic Frameworks, OKR Alignment, Cross-Functional Execution & Scalable Growth',
    palette: {
      primary: '#0ea5e9', // Strategic Cerulean
      secondary: '#10b981', // Emerald
      accent: '#f59e0b', // Gold
      baseBg: '#060e18', // Executive Dark Blue
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #0e223b 0%, #060e18 60%, #02050a 100%)',
      cardBg: 'rgba(12, 23, 40, 0.90)',
      cardBorder: 'rgba(14, 165, 233, 0.30)',
      glow: 'rgba(14, 165, 233, 0.38)',
      btnGradient: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
      btnText: '#060e18',
      badgeBorder: 'border-sky-400/40',
      badgeBg: 'rgba(14, 165, 233, 0.12)',
      badgeText: '#38bdf8',
      bgGradient: 'from-slate-950 via-slate-900 to-navy-950',
      pathStroke: '#0ea5e9',
      pathGlow: 'rgba(16, 185, 129, 0.40)',
    },
    visualMotif: {
      styleName: 'Kanban Sprint Swimlanes & Decision Matrix Trees',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'4\' y=\'4\' width=\'14\' height=\'14\' rx=\'2\' fill=\'none\' stroke=\'%230ea5e9\' stroke-width=\'1\' stroke-opacity=\'0.06\'/%3E%3Crect x=\'22\' y=\'4\' width=\'14\' height=\'24\' rx=\'2\' fill=\'none\' stroke=\'%230ea5e9\' stroke-width=\'1\' stroke-opacity=\'0.06\'/%3E%3C/svg%3E")',
      heroWatermark: '🎯 EXECUTIVE_STRATEGY',
    },
    defaultAvatar: 'business_pro',
    sceneryType: 'city',
    landmark: {
      title: 'Business Strategy & Product Management Certification',
      subtitle: 'Complete all 5 phases to master market validation, roadmap roadblocks, and stakeholder leadership.',
      badge: 'Strategy Leader Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Market Analysis, SWOT & Unit Economics', icon: 'Compass' },
      { number: 2, name: 'Phase 2: Product Discovery', subtitle: 'User Interviews, PRDs & Prioritization Matrices', icon: 'Search' },
      { number: 3, name: 'Phase 3: Agile Execution', subtitle: 'Scrum Sprints, Roadmaps & Cross-Functional Alignment', icon: 'Layers' },
      { number: 4, name: 'Phase 4: Growth & Metrics', subtitle: 'A/B Experimentation, LTV/CAC & OKRs', icon: 'TrendingUp' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Full Product Strategy & Scaling Operating Plan', icon: 'Award' },
    ]
  },

  // 7. Healthcare: Clinical Learning Center, medical illustrations, clinical imagery and clean teal/white surfaces
  healthcare_life: {
    id: 'healthcare_life',
    domainId: 'healthcare_life',
    domainName: 'Healthcare & Life Sciences',
    roleSlugs: ['general-physician', 'clinical-data-analyst', 'bioinformatics-scientist', 'pharmacovigilance-specialist', 'clinical-research-coordinator', 'radiologist'],
    name: 'Clinical Learning Center',
    environmentName: 'Diagnostic Medicine & Biomedical Suite',
    tagline: 'Evidence-Based Protocols, Human Anatomy, Pharmacology & Clinical Diagnostics',
    palette: {
      primary: '#14b8a6', // Jade Clinical Teal
      secondary: '#06b6d4', // Cyan
      accent: '#f43f5e', // Pulse Red Accent
      baseBg: '#051417', // Deep Medical Teal
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #0a292d 0%, #051417 60%, #02090a 100%)',
      cardBg: 'rgba(9, 32, 36, 0.92)',
      cardBorder: 'rgba(20, 184, 166, 0.32)',
      glow: 'rgba(20, 184, 166, 0.40)',
      btnGradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
      btnText: '#041315',
      badgeBorder: 'border-teal-400/40',
      badgeBg: 'rgba(20, 184, 166, 0.14)',
      badgeText: '#2dd4bf',
      bgGradient: 'from-slate-950 via-teal-950/40 to-slate-900',
      pathStroke: '#14b8a6',
      pathGlow: 'rgba(6, 182, 212, 0.45)',
    },
    visualMotif: {
      styleName: 'ECG Pulse Telemetry & Cellular Hexagonal Matrix',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'30\' viewBox=\'0 0 60 30\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 15H20L23 5L27 25L30 10L33 18L36 15H60\' fill=\'none\' stroke=\'%2314b8a6\' stroke-width=\'1\' stroke-opacity=\'0.08\'/%3E%3C/svg%3E")',
      heroWatermark: '🩺 CLINICAL_TELEMETRY',
    },
    defaultAvatar: 'health_healer',
    sceneryType: 'city',
    landmark: {
      title: 'Clinical & Life Sciences Competency Certification',
      subtitle: 'Complete all 5 phases to demonstrate rigorous healthcare diagnostics, pathology, and clinical trial ethics.',
      badge: 'Healthcare Professional Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Anatomy, Pathophysiology & Bio-Ethics', icon: 'Shield' },
      { number: 2, name: 'Phase 2: Diagnostics', subtitle: 'Clinical Data, Lab Panels & EMR Records', icon: 'Activity' },
      { number: 3, name: 'Phase 3: Therapeutics', subtitle: 'Pharmacotherapy & Clinical Protocol Design', icon: 'BookOpen' },
      { number: 4, name: 'Phase 4: Informatics', subtitle: 'Biostatistics, Epidemiology & Health Compliance', icon: 'Cpu' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Comprehensive Clinical Evidence Case Study', icon: 'Award' },
    ]
  },

  // 8. Engineering: Engineering Innovation Lab, technical drawings, mechanical illustrations and industrial visuals
  core_engineering: {
    id: 'core_engineering',
    domainId: 'core_engineering',
    domainName: 'Core Engineering',
    roleSlugs: ['mechanical-engineer', 'civil-structural-engineer', 'electrical-systems-engineer', 'robotics-engineer', 'aerospace-engineer'],
    name: 'Engineering Innovation Lab',
    environmentName: 'Hardware Schematics & Industrial Proving Ground',
    tagline: 'Thermodynamics, Finite Element Analysis, Parametric CAD & Kinematic Mechatronics',
    palette: {
      primary: '#f97316', // Industrial Safety Orange
      secondary: '#38bdf8', // Blueprint Steel Blue
      accent: '#94a3b8', // Titanium Silver
      baseBg: '#0f1118', // Heavy Industrial Carbon
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #2b1d12 0%, #0f1118 60%, #050609 100%)',
      cardBg: 'rgba(23, 26, 36, 0.92)',
      cardBorder: 'rgba(249, 115, 22, 0.32)',
      glow: 'rgba(249, 115, 22, 0.38)',
      btnGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      btnText: '#0f1118',
      badgeBorder: 'border-orange-400/40',
      badgeBg: 'rgba(249, 115, 22, 0.15)',
      badgeText: '#fb923c',
      bgGradient: 'from-slate-950 via-orange-950/25 to-slate-900',
      pathStroke: '#f97316',
      pathGlow: 'rgba(56, 189, 248, 0.40)',
    },
    visualMotif: {
      styleName: 'CAD Parametric Isometric Grids & Caliper Annotations',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%23f97316\' stroke-width=\'0.75\' stroke-opacity=\'0.06\'%3E%3Cpath d=\'M0 0H40V40H0z\'/%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'8\'/%3E%3C/g%3E%3C/svg%3E")',
      heroWatermark: '⚙️ CAD_ISOMETRIC_LAB',
    },
    defaultAvatar: 'mech_forger',
    sceneryType: 'fortress',
    landmark: {
      title: 'Physical Engineering & Mechatronics Certification',
      subtitle: 'Complete all 5 phases to master kinematic analysis, FEA stress modeling, and physical assembly reliability.',
      badge: 'Systems Engineer Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Calculus, Statics & Material Science', icon: 'Compass' },
      { number: 2, name: 'Phase 2: CAD Schematics', subtitle: 'Parametric 3D Modeling & GD&T Standards', icon: 'Cpu' },
      { number: 3, name: 'Phase 3: Simulation & FEA', subtitle: 'Stress Analysis, Thermal Loads & Fluid Dynamics', icon: 'Layers' },
      { number: 4, name: 'Phase 4: Mechatronics', subtitle: 'Sensors, Actuators, PLC & Control Theory', icon: 'Activity' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Engineered System Architecture & Validation', icon: 'Award' },
    ]
  },

  // 9. Cybersecurity: Security Operations Center, security dashboards, network diagrams and dark security-inspired visuals
  cybersecurity: {
    id: 'cybersecurity',
    domainId: 'cybersecurity',
    domainName: 'Cybersecurity',
    roleSlugs: ['cybersecurity-analyst', 'cybersecurity-specialist', 'security-engineer', 'penetration-tester', 'soc-analyst', 'incident-response-specialist'],
    name: 'Security Operations Center',
    environmentName: 'SOC Threat Hunting & Zero-Trust Chamber',
    tagline: 'Vulnerability Assessment, Cryptographic Handshakes, Threat Telemetry & Zero-Trust Firewalls',
    palette: {
      primary: '#ef4444', // Threat Alert Crimson
      secondary: '#38bdf8', // Cyber Radar Blue
      accent: '#94a3b8', // Stealth Carbon
      baseBg: '#05070f', // Stealth Black
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #1e0912 0%, #05070f 60%, #020307 100%)',
      cardBg: 'rgba(12, 16, 28, 0.92)',
      cardBorder: 'rgba(239, 68, 68, 0.32)',
      glow: 'rgba(239, 68, 68, 0.40)',
      btnGradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
      btnText: '#ffffff',
      badgeBorder: 'border-red-500/40',
      badgeBg: 'rgba(239, 68, 68, 0.14)',
      badgeText: '#f87171',
      bgGradient: 'from-slate-950 via-red-950/30 to-slate-900',
      pathStroke: '#ef4444',
      pathGlow: 'rgba(56, 189, 248, 0.40)',
    },
    visualMotif: {
      styleName: 'Concentric Radar Sweeps & Encrypted Hexadecimal Streams',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'50\' height=\'50\' viewBox=\'0 0 50 50\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'25\' cy=\'25\' r=\'20\' fill=\'none\' stroke=\'%23ef4444\' stroke-width=\'0.75\' stroke-opacity=\'0.06\'/%3E%3Cline x1=\'0\' y1=\'25\' x2=\'50\' y2=\'25\' stroke=\'%23ef4444\' stroke-width=\'0.5\' stroke-opacity=\'0.05\'/%3E%3C/svg%3E")',
      heroWatermark: '🛡️ SOC_THREAT_WATCH',
    },
    defaultAvatar: 'cyber_guardian',
    sceneryType: 'fortress',
    landmark: {
      title: 'Cybersecurity Defense & Ethical Hacking Certification',
      subtitle: 'Complete all 5 phases to master intrusion detection, cryptographic security, and incident response.',
      badge: 'Cybersecurity Specialist Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'TCP/IP, OSI Model & Linux Shell Security', icon: 'Shield' },
      { number: 2, name: 'Phase 2: Security Labs', subtitle: 'Vulnerability Scanning, OWASP Top 10 & Crypto', icon: 'Lock' },
      { number: 3, name: 'Phase 3: Threat Telemetry', subtitle: 'SIEM Logs, Snort Rules & Network Traffic', icon: 'Crosshair' },
      { number: 4, name: 'Phase 4: Offensive & Defensive', subtitle: 'Penetration Testing, Exploit Analysis & Hardening', icon: 'ShieldAlert' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Enterprise Security Audit & Incident Playbook', icon: 'Award' },
    ]
  },

  // 10. Cloud: Infrastructure Command Center, network infrastructure graphics and technical blue accents
  cloud_devops: {
    id: 'cloud_devops',
    domainId: 'cloud_devops',
    domainName: 'Cloud & DevOps',
    roleSlugs: ['cloud-engineer', 'devops-engineer', 'site-reliability-engineer-sre', 'cloud-security-architect', 'kubernetes-platform-engineer'],
    name: 'Infrastructure Command Center',
    environmentName: 'Cloud Cluster Orchestration Deck',
    tagline: 'Terraform IaC, Kubernetes Pod Clusters, Multi-Region High Availability & Observability',
    palette: {
      primary: '#38bdf8', // Azure Sky Blue
      secondary: '#6366f1', // Indigo Cloud
      accent: '#10b981', // Healthy Node Green
      baseBg: '#050c18', // Deep Cluster Navy
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #0d1e38 0%, #050c18 60%, #02050b 100%)',
      cardBg: 'rgba(11, 20, 38, 0.90)',
      cardBorder: 'rgba(56, 189, 248, 0.30)',
      glow: 'rgba(56, 189, 248, 0.38)',
      btnGradient: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
      btnText: '#050c18',
      badgeBorder: 'border-sky-400/40',
      badgeBg: 'rgba(56, 189, 248, 0.14)',
      badgeText: '#7dd3fc',
      bgGradient: 'from-slate-950 via-sky-950/30 to-slate-900',
      pathStroke: '#38bdf8',
      pathGlow: 'rgba(99, 102, 241, 0.45)',
    },
    visualMotif: {
      styleName: 'Kubernetes Pod Meshes & Server Rack Node Topologies',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'48\' height=\'48\' viewBox=\'0 0 48 48\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M24 4L42 14V34L24 44L6 34V14L24 4Z\' fill=\'none\' stroke=\'%2338bdf8\' stroke-width=\'1\' stroke-opacity=\'0.06\'/%3E%3C/svg%3E")',
      heroWatermark: '☁️ K8S_CLUSTER_ACTIVE',
    },
    defaultAvatar: 'code_knight',
    sceneryType: 'galaxy',
    landmark: {
      title: 'Cloud Infrastructure & SRE Certification',
      subtitle: 'Complete all 5 phases to master zero-downtime CI/CD, auto-scaling clusters, and infrastructure as code.',
      badge: 'Cloud Architect Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Linux Systems, Networking & Cloud Providers', icon: 'Server' },
      { number: 2, name: 'Phase 2: Containerization', subtitle: 'Docker Container Runtimes & Multi-Stage Builds', icon: 'Layers' },
      { number: 3, name: 'Phase 3: Orchestration', subtitle: 'Kubernetes Ingress, Services, ConfigMaps & Helm', icon: 'Cpu' },
      { number: 4, name: 'Phase 4: IaC & Automation', subtitle: 'Terraform Modules, GitHub Actions & Monitoring', icon: 'CheckSquare' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Multi-Region Fault-Tolerant Microservices Platform', icon: 'Award' },
    ]
  },

  // 11. Law: Legal Research Workspace, document-inspired layouts, case-study visuals and professional typography
  law_legal: {
    id: 'law_legal',
    domainId: 'law_legal',
    domainName: 'Law & Legal Studies',
    roleSlugs: ['corporate-lawyer', 'criminal-defense-advocate', 'intellectual-property-attorney', 'legal-analyst', 'arbitration-specialist'],
    name: 'Legal Research Workspace',
    environmentName: 'Jurisprudence Chambers & Appellate Forum',
    tagline: 'Constitutional Precedents, Contract Enforceability, Case Briefings & Statutory Interpretation',
    palette: {
      primary: '#eab308', // Regal Jurisprudence Gold
      secondary: '#38bdf8', // Ice Blue
      accent: '#ca8a04', // Burnished Gold
      baseBg: '#090d18', // Deep Regal Navy
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #171f38 0%, #090d18 60%, #03050c 100%)',
      cardBg: 'rgba(15, 23, 44, 0.90)',
      cardBorder: 'rgba(234, 179, 8, 0.32)',
      glow: 'rgba(234, 179, 8, 0.38)',
      btnGradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
      btnText: '#090d18',
      badgeBorder: 'border-yellow-400/40',
      badgeBg: 'rgba(234, 179, 8, 0.14)',
      badgeText: '#fde047',
      bgGradient: 'from-slate-950 via-amber-950/25 to-slate-900',
      pathStroke: '#eab308',
      pathGlow: 'rgba(234, 179, 8, 0.45)',
    },
    visualMotif: {
      styleName: 'Scales of Justice Watermark & Gilded Parchment Frames',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 5V35M10 15H30M10 15L6 25M30 15L34 25\' fill=\'none\' stroke=\'%23eab308\' stroke-width=\'0.75\' stroke-opacity=\'0.06\'/%3E%3C/svg%3E")',
      heroWatermark: '⚖️ JURISPRUDENCE_CHAMBERS',
    },
    defaultAvatar: 'justice_arbiter',
    sceneryType: 'fortress',
    landmark: {
      title: 'Jurisprudence & Legal Advocacy Certification',
      subtitle: 'Complete all 5 phases to master statutory analysis, contract drafting, and appellate court arguments.',
      badge: 'Legal Scholar Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Constitutional Law, Jurisprudence & Legal History', icon: 'Scale' },
      { number: 2, name: 'Phase 2: Statutory Analysis', subtitle: 'Civil & Criminal Codes, Contract Law', icon: 'FileText' },
      { number: 3, name: 'Phase 3: Legal Research', subtitle: 'Precedents, Judicial Review & Brief Drafting', icon: 'Search' },
      { number: 4, name: 'Phase 4: Advocacy Practice', subtitle: 'Moot Court Arguments, Cross-Examination & Ethics', icon: 'Landmark' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Full Appellate Memorandum & Case Briefing', icon: 'Award' },
    ]
  },

  // 12. Education: Academic Learning Center, academic illustrations and learning-focused layouts
  education_research: {
    id: 'education_research',
    domainId: 'education_research',
    domainName: 'Education & Research',
    roleSlugs: ['academic-professor', 'educational-technology-specialist', 'curriculum-developer', 'instructional-designer', 'research-scientist'],
    name: 'Academic Learning Center',
    environmentName: 'Pedagogy & Scholarly Research Arch',
    tagline: 'Pedagogical Psychology, Instructional Design, Curriculum Frameworks & Quantitative Research',
    palette: {
      primary: '#60a5fa', // Scholarly Azure
      secondary: '#34d399', // Mint
      accent: '#fbbf24', // Academic Gold
      baseBg: '#080d19', // Scholarly Obsidian
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #12213d 0%, #080d19 60%, #03060d 100%)',
      cardBg: 'rgba(14, 24, 42, 0.90)',
      cardBorder: 'rgba(96, 165, 250, 0.30)',
      glow: 'rgba(96, 165, 250, 0.35)',
      btnGradient: 'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)',
      btnText: '#080d19',
      badgeBorder: 'border-blue-400/40',
      badgeBg: 'rgba(96, 165, 250, 0.12)',
      badgeText: '#93c5fd',
      bgGradient: 'from-slate-950 via-slate-900 to-navy-950',
      pathStroke: '#60a5fa',
      pathGlow: 'rgba(52, 211, 153, 0.40)',
    },
    visualMotif: {
      styleName: 'Academic Colonnades, Open Folios & Research Taxonomy Trees',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 10H30V30H10Z M20 10V30\' fill=\'none\' stroke=\'%2360a5fa\' stroke-width=\'0.75\' stroke-opacity=\'0.06\'/%3E%3C/svg%3E")',
      heroWatermark: '🎓 ACADEMIC_RESEARCH_ARCH',
    },
    defaultAvatar: 'people_coach',
    sceneryType: 'city',
    landmark: {
      title: 'Pedagogy & Educational Research Mastery',
      subtitle: 'Complete all 5 phases to master instructional design models, assessment rubrics, and research methods.',
      badge: 'Master Educator Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Learning Theories, Cognitive Psychology & Bloom Taxonomy', icon: 'BookOpen' },
      { number: 2, name: 'Phase 2: Instructional Design', subtitle: 'ADDIE Framework, Lesson Architectures & Rubrics', icon: 'Layers' },
      { number: 3, name: 'Phase 3: EdTech Systems', subtitle: 'LMS Configurations, Interactive Video & Gamification', icon: 'Cpu' },
      { number: 4, name: 'Phase 4: Research Methodology', subtitle: 'Qualitative Inquiries & Statistical Validation', icon: 'Search' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Comprehensive Accreditated Curriculum Blueprint', icon: 'Award' },
    ]
  },

  // 13. Government: Civil Services Preparation Center, public administration and examination preparation visuals
  government_public: {
    id: 'government_public',
    domainId: 'government_public',
    domainName: 'Government & Public Services',
    roleSlugs: ['ias-officer', 'ips-officer', 'public-policy-analyst', 'diplomat-foreign-service', 'revenue-officer-irs'],
    name: 'Civil Services Preparation Center',
    environmentName: 'Public Administration & Civic Governance Forum',
    tagline: 'Constitutional Governance, Socio-Economic Delivery, Civic Ethics & Diplomatic Strategy',
    palette: {
      primary: '#38bdf8', // National Sky Blue
      secondary: '#f59e0b', // Saffron Amber Gold
      accent: '#ef4444', // Sovereign Crimson
      baseBg: '#090f1e', // Regal Governance Navy
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #152445 0%, #090f1e 60%, #03060e 100%)',
      cardBg: 'rgba(15, 25, 48, 0.92)',
      cardBorder: 'rgba(56, 189, 248, 0.32)',
      glow: 'rgba(56, 189, 248, 0.38)',
      btnGradient: 'linear-gradient(135deg, #38bdf8 0%, #f59e0b 100%)',
      btnText: '#090f1e',
      badgeBorder: 'border-sky-400/40',
      badgeBg: 'rgba(56, 189, 248, 0.14)',
      badgeText: '#7dd3fc',
      bgGradient: 'from-slate-950 via-sky-950/30 to-slate-900',
      pathStroke: '#38bdf8',
      pathGlow: 'rgba(245, 158, 11, 0.40)',
    },
    visualMotif: {
      styleName: 'Ashoka Chakra Emblems & National Governance Pillar Motifs',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'48\' height=\'48\' viewBox=\'0 0 48 48\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'24\' cy=\'24\' r=\'18\' fill=\'none\' stroke=\'%2338bdf8\' stroke-width=\'0.75\' stroke-opacity=\'0.06\'/%3E%3Cpath d=\'M24 6V42M6 24H42\' stroke=\'%23f59e0b\' stroke-width=\'0.5\' stroke-opacity=\'0.05\'/%3E%3C/svg%3E")',
      heroWatermark: '🏛️ CIVIC_GOVERNANCE_DESK',
    },
    defaultAvatar: 'governance_pillar',
    sceneryType: 'kingdom',
    landmark: {
      title: 'Civil Services & Public Administration Certification',
      subtitle: 'Complete all 5 phases to master administrative policy, public welfare delivery, and civic crisis leadership.',
      badge: 'Civil Governance Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Governance Frameworks & Constitutional Ethics', icon: 'Landmark' },
      { number: 2, name: 'Phase 2: Public Administration', subtitle: 'District Management, Public Delivery & Budgeting', icon: 'Users' },
      { number: 3, name: 'Phase 3: Policy Analysis', subtitle: 'Socio-Economic Planning, Infrastructure & Metrics', icon: 'BarChart' },
      { number: 4, name: 'Phase 4: Crisis Governance', subtitle: 'Disaster Relief, Law & Order, Strategic Diplomacy', icon: 'Shield' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Integrated National Public Policy Whitepaper', icon: 'Award' },
    ]
  },

  // 14. Psychology: Behavioural Research Studio, research-inspired imagery and calm visual design
  psychology_behavioral: {
    id: 'psychology_behavioral',
    domainId: 'psychology_behavioral',
    domainName: 'Psychology & Behavioral Science',
    roleSlugs: ['clinical-psychologist', 'organizational-psychologist', 'counseling-psychologist', 'cognitive-neuroscientist', 'behavioral-data-scientist'],
    name: 'Behavioural Research Studio',
    environmentName: 'Cognitive Science & Empathy Lab',
    tagline: 'Cognitive Biases, Psychometrics, Therapeutic Modalities & Behavioral Economics',
    palette: {
      primary: '#a855f7', // Soothing Lavender Purple
      secondary: '#38bdf8', // Mind Calm Blue
      accent: '#fb7185', // Warm Rose
      baseBg: '#0f0a1c', // Deep Mind Dusk
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #25133d 0%, #0f0a1c 60%, #06030c 100%)',
      cardBg: 'rgba(24, 16, 44, 0.90)',
      cardBorder: 'rgba(168, 85, 247, 0.30)',
      glow: 'rgba(168, 85, 247, 0.38)',
      btnGradient: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)',
      btnText: '#0f0a1c',
      badgeBorder: 'border-purple-400/40',
      badgeBg: 'rgba(168, 85, 247, 0.14)',
      badgeText: '#d8b4fe',
      bgGradient: 'from-slate-950 via-purple-950/35 to-slate-900',
      pathStroke: '#a855f7',
      pathGlow: 'rgba(56, 189, 248, 0.40)',
    },
    visualMotif: {
      styleName: 'Synaptic Waveforms, Calming Contours & Psychometric Meshes',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 20C10 10 30 30 40 20\' fill=\'none\' stroke=\'%23a855f7\' stroke-width=\'1\' stroke-opacity=\'0.06\'/%3E%3C/svg%3E")',
      heroWatermark: '🧠 COGNITIVE_BEHAVIORAL_LAB',
    },
    defaultAvatar: 'people_coach',
    sceneryType: 'design',
    landmark: {
      title: 'Psychology & Behavioral Science Certification',
      subtitle: 'Complete all 5 phases to master clinical assessment, psychometric calibration, and behavioral interventions.',
      badge: 'Behavioral Scientist Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Neuroanatomy, Cognitive Principles & Development', icon: 'Sparkles' },
      { number: 2, name: 'Phase 2: Psychometrics', subtitle: 'Reliability, Validity & Diagnostic Inventories', icon: 'Activity' },
      { number: 3, name: 'Phase 3: Behavioral Analysis', subtitle: 'Conditioning, Nudge Theory & Decision Science', icon: 'Search' },
      { number: 4, name: 'Phase 4: Intervention Design', subtitle: 'CBT Principles, Counseling Ethics & Case Formulations', icon: 'Users' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Comprehensive Psychological Case Evaluation & Intervention', icon: 'Award' },
    ]
  },

  // 15. Design: Digital Design Studio, creative canvases, typography and visual portfolios
  design_creative: {
    id: 'design_creative',
    domainId: 'design_creative',
    domainName: 'Design, Media & Creative Arts',
    roleSlugs: ['ui-ux-designer', 'product-designer', 'brand-identity-designer', 'motion-graphics-animator', '3d-artist-game-designer'],
    name: 'Digital Design Studio',
    environmentName: 'Artboard Canvas & Creative Agency',
    tagline: 'Figma Auto-Layout Tokens, Design Systems, Motion Dynamics & Visual Empathy',
    palette: {
      primary: '#c084fc', // Vibrant Lavender
      secondary: '#fb7185', // Radiant Coral
      accent: '#38bdf8', // Creative Cyan
      baseBg: '#120a22', // Deep Canvas Purple
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #2e164f 0%, #120a22 60%, #07030e 100%)',
      cardBg: 'rgba(26, 16, 48, 0.90)',
      cardBorder: 'rgba(192, 132, 252, 0.32)',
      glow: 'rgba(192, 132, 252, 0.40)',
      btnGradient: 'linear-gradient(135deg, #c084fc 0%, #fb7185 100%)',
      btnText: '#120a22',
      badgeBorder: 'border-purple-400/40',
      badgeBg: 'rgba(192, 132, 252, 0.14)',
      badgeText: '#d8b4fe',
      bgGradient: 'from-slate-950 via-purple-950/35 to-slate-900',
      pathStroke: '#c084fc',
      pathGlow: 'rgba(251, 113, 133, 0.40)',
    },
    visualMotif: {
      styleName: 'Precision 8pt Grids, Bezier Vector Paths & Swatch Palettes',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'32\' height=\'32\' viewBox=\'0 0 32 32\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0H32V32H0Z\' fill=\'none\' stroke=\'%23c084fc\' stroke-width=\'0.5\' stroke-opacity=\'0.06\'/%3E%3C/svg%3E")',
      heroWatermark: '🎨 FIGMA_DESIGN_STUDIO',
    },
    defaultAvatar: 'ux_artisan',
    sceneryType: 'design',
    landmark: {
      title: 'UI/UX & Product Design Career Certification',
      subtitle: 'Complete all 5 phases to master cross-platform design systems, interaction tokens, and usability evaluations.',
      badge: 'Product Designer Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Design Thinking, User Flows & Information Hierarchy', icon: 'Layout' },
      { number: 2, name: 'Phase 2: Wireframing', subtitle: 'Low-Fidelity Architecture & Layout Grids', icon: 'Play' },
      { number: 3, name: 'Phase 3: Design Systems', subtitle: 'Typography Tokens, Color Swatches & Figma Variables', icon: 'Palette' },
      { number: 4, name: 'Phase 4: Prototyping & Tests', subtitle: 'Interactive Micro-Interactions & Usability Testing', icon: 'Users' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'End-to-End Responsive Multi-Platform Product System', icon: 'Award' },
    ]
  },

  // 16. Hospitality: Hospitality Operations Center, travel, hotel and service-industry imagery
  hospitality_tourism: {
    id: 'hospitality_tourism',
    domainId: 'hospitality_tourism',
    domainName: 'Hospitality & Tourism',
    roleSlugs: ['hotel-general-manager', 'event-operations-director', 'luxury-tourism-consultant', 'food-beverage-director'],
    name: 'Hospitality Operations Center',
    environmentName: 'Global Travel & Guest Experience Deck',
    tagline: 'Service Excellence, Revenue Optimization, Luxury Experience Architecture & Event Operations',
    palette: {
      primary: '#d97706', // Warm Amber Bronze
      secondary: '#0d9488', // Turquoise Teal
      accent: '#f59e0b', // Gold
      baseBg: '#120e0a', // Deep Luxury Bronze
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #291c13 0%, #120e0a 60%, #080503 100%)',
      cardBg: 'rgba(28, 20, 14, 0.90)',
      cardBorder: 'rgba(217, 119, 6, 0.30)',
      glow: 'rgba(217, 119, 6, 0.38)',
      btnGradient: 'linear-gradient(135deg, #d97706 0%, #0d9488 100%)',
      btnText: '#120e0a',
      badgeBorder: 'border-amber-500/40',
      badgeBg: 'rgba(217, 119, 6, 0.14)',
      badgeText: '#f59e0b',
      bgGradient: 'from-slate-950 via-amber-950/30 to-slate-900',
      pathStroke: '#d97706',
      pathGlow: 'rgba(13, 148, 136, 0.40)',
    },
    visualMotif: {
      styleName: 'Global Latitude Flight Paths & Compass Rose Lineaments',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'14\' fill=\'none\' stroke=\'%23d97706\' stroke-width=\'0.75\' stroke-opacity=\'0.06\'/%3E%3Cpath d=\'M20 6V34M6 20H34\' stroke=\'%23d97706\' stroke-width=\'0.5\' stroke-opacity=\'0.05\'/%3E%3C/svg%3E")',
      heroWatermark: '🛎️ GLOBAL_HOSPITALITY_HUB',
    },
    defaultAvatar: 'wealth_banker',
    sceneryType: 'city',
    landmark: {
      title: 'Hospitality Leadership & Operations Certification',
      subtitle: 'Complete all 5 phases to master guest satisfaction indices, RevPAR yield management, and event logistics.',
      badge: 'Hospitality Executive Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Hospitality Principles & Service Experience Standards', icon: 'Compass' },
      { number: 2, name: 'Phase 2: Revenue Operations', subtitle: 'Yield Management, ADR & Property Management Systems', icon: 'BarChart' },
      { number: 3, name: 'Phase 3: Event Logistics', subtitle: 'Vendor Contracts, Banqueting & Protocol Planning', icon: 'Layers' },
      { number: 4, name: 'Phase 4: Luxury Experience', subtitle: 'VIP Relationship Management & Quality Auditing', icon: 'Award' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Full Resort Operational Plan & Yield Model', icon: 'Landmark' },
    ]
  },

  // 17. Agriculture: Sustainable Agriculture Research Center, agricultural imagery and environmental visuals
  agriculture_environmental: {
    id: 'agriculture_environmental',
    domainId: 'agriculture_environmental',
    domainName: 'Agriculture & Environmental Science',
    roleSlugs: ['precision-agriculture-specialist', 'agronomist', 'environmental-impact-consultant', 'sustainable-supply-chain-director'],
    name: 'Sustainable Agriculture Center',
    environmentName: 'Ecological Telemetry & Agro-Tech Greenhouse',
    tagline: 'Precision Agronomy, Soil Microbiomes, GIS Remote Sensing & Climate Sustainability',
    palette: {
      primary: '#22c55e', // Vibrant Foliage Green
      secondary: '#0ea5e9', // Water Sky Blue
      accent: '#eab308', // Harvest Sun Gold
      baseBg: '#05140b', // Deep Earth Canopy
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #0d2e1b 0%, #05140b 60%, #020904 100%)',
      cardBg: 'rgba(9, 32, 18, 0.90)',
      cardBorder: 'rgba(34, 197, 94, 0.30)',
      glow: 'rgba(34, 197, 94, 0.38)',
      btnGradient: 'linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)',
      btnText: '#05140b',
      badgeBorder: 'border-green-400/40',
      badgeBg: 'rgba(34, 197, 94, 0.14)',
      badgeText: '#4ade80',
      bgGradient: 'from-slate-950 via-emerald-950/35 to-slate-900',
      pathStroke: '#22c55e',
      pathGlow: 'rgba(14, 165, 233, 0.40)',
    },
    visualMotif: {
      styleName: 'Leaf Vein Tessellations, Topographic Contours & GIS NDVI Meshes',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 0C30 10 30 30 20 40C10 30 10 10 20 0Z\' fill=\'none\' stroke=\'%2322c55e\' stroke-width=\'0.75\' stroke-opacity=\'0.06\'/%3E%3C/svg%3E")',
      heroWatermark: '🌿 SUSTAINABLE_AGRO_TECH',
    },
    defaultAvatar: 'business_pro',
    sceneryType: 'city',
    landmark: {
      title: 'Precision Agriculture & Sustainability Certification',
      subtitle: 'Complete all 5 phases to master soil nutrient sensor telemetry, satellite crop indexing, and ESG compliance.',
      badge: 'Agro-Tech Specialist Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Plant Physiology, Soil Chemistry & Crop Cycles', icon: 'Compass' },
      { number: 2, name: 'Phase 2: GIS & Sensing', subtitle: 'Satellite NDVI Mapping & Drone Multispectral Imaging', icon: 'Map' },
      { number: 3, name: 'Phase 3: IoT Irrigation', subtitle: 'Moisture Sensors, Automated Fertigation & SCADA', icon: 'Activity' },
      { number: 4, name: 'Phase 4: Climate Adaptation', subtitle: 'Carbon Footprinting, ESG Audits & Organic Protocols', icon: 'Shield' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Large-Scale Precision Farm Decarbonization Plan', icon: 'Award' },
    ]
  },

  // 18. Entrepreneurship: Startup Innovation Studio, business planning and innovation-inspired visuals
  entrepreneurship_innovation: {
    id: 'entrepreneurship_innovation',
    domainId: 'entrepreneurship_innovation',
    domainName: 'Entrepreneurship & Innovation',
    roleSlugs: ['startup-founder-ceo', 'venture-capital-analyst', 'innovation-ecosystem-manager', 'growth-strategist'],
    name: 'Startup Innovation Studio',
    environmentName: 'Venture Incubation & Rapid Prototyping Bay',
    tagline: 'Venture Capital Pitching, Cap Tables, Zero-to-One Validation & Viral Growth Loops',
    palette: {
      primary: '#a855f7', // Hyper-Growth Purple
      secondary: '#06b6d4', // Electric Cyan
      accent: '#f43f5e', // Rocket Fuel Rose
      baseBg: '#0a0d18', // Deep Space Velocity
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #1a1638 0%, #0a0d18 60%, #04050a 100%)',
      cardBg: 'rgba(16, 20, 42, 0.90)',
      cardBorder: 'rgba(168, 85, 247, 0.32)',
      glow: 'rgba(168, 85, 247, 0.40)',
      btnGradient: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
      btnText: '#0a0d18',
      badgeBorder: 'border-purple-400/40',
      badgeBg: 'rgba(168, 85, 247, 0.14)',
      badgeText: '#c084fc',
      bgGradient: 'from-slate-950 via-indigo-950/40 to-slate-900',
      pathStroke: '#a855f7',
      pathGlow: 'rgba(6, 182, 212, 0.45)',
    },
    visualMotif: {
      styleName: 'Rocket Trajectory Parabolas & Exponential Growth Curves',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M5 35Q15 30 25 15Q30 7 35 5\' fill=\'none\' stroke=\'%23a855f7\' stroke-width=\'1\' stroke-opacity=\'0.08\'/%3E%3C/svg%3E")',
      heroWatermark: '🚀 VENTURE_INCUBATION_BAY',
    },
    defaultAvatar: 'code_knight',
    sceneryType: 'galaxy',
    landmark: {
      title: 'Venture Creation & Startup Scaling Certification',
      subtitle: 'Complete all 5 phases to validate product-market fit, construct investor pitch decks, and manage cap tables.',
      badge: 'Venture Founder Certified',
    },
    stages: [
      { number: 1, name: 'Phase 1: Zero-to-One', subtitle: 'Problem Validation, Customer Discovery & Lean Canvases', icon: 'Compass' },
      { number: 2, name: 'Phase 2: MVP Prototyping', subtitle: 'Rapid No-Code/Code Builds & Smoke Tests', icon: 'Cpu' },
      { number: 3, name: 'Phase 3: Growth Loops', subtitle: 'Virality Engines, Organic Acquisition & Retention Cohorts', icon: 'TrendingUp' },
      { number: 4, name: 'Phase 4: Venture Capital', subtitle: 'SAFE Notes, Term Sheets, Pitch Decks & Valuation', icon: 'Landmark' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Investor-Ready Pitch Deck, Financial Model & Live Demo', icon: 'Award' },
    ]
  },

  // Fallback Universal Career Journey
  universal_journey: {
    id: 'universal_journey',
    domainId: 'general',
    domainName: 'Professional Exploration',
    roleSlugs: [],
    name: 'Career Learning Path',
    environmentName: 'Universal Professional Workspace',
    tagline: 'Master Core Competencies, Finish Practical Milestones & Attain Certification',
    palette: {
      primary: '#00f0ff',
      secondary: '#8b5cf6',
      accent: '#10b981',
      baseBg: '#060a12',
      pageGradient: 'radial-gradient(ellipse at 50% 0%, #101c3d 0%, #060a12 60%, #03060d 100%)',
      cardBg: 'rgba(10, 15, 29, 0.88)',
      cardBorder: 'rgba(0, 240, 255, 0.25)',
      glow: 'rgba(0, 240, 255, 0.35)',
      btnGradient: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
      btnText: '#060a12',
      badgeBorder: 'border-cyan-500/40',
      badgeBg: 'rgba(0, 240, 255, 0.12)',
      badgeText: '#00f0ff',
      bgGradient: 'from-slate-950 via-slate-900 to-navy-950',
      pathStroke: '#00f0ff',
      pathGlow: 'rgba(139, 92, 246, 0.35)',
    },
    visualMotif: {
      styleName: 'Prismatic Geometric Compass Mesh',
      svgPattern: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 0L40 20L20 40L0 20Z\' fill=\'none\' stroke=\'%2300f0ff\' stroke-width=\'0.5\' stroke-opacity=\'0.05\'/%3E%3C/svg%3E")',
      heroWatermark: '🧭 ROADMAPIQ_CAREER_REALM',
    },
    defaultAvatar: 'code_knight',
    sceneryType: 'kingdom',
    landmark: {
      title: 'Professional Career Certification',
      subtitle: 'Complete all 5 curriculum phases to earn your verified industry readiness credential.',
      badge: 'Certified Professional',
    },
    stages: [
      { number: 1, name: 'Phase 1: Foundations', subtitle: 'Core Domain Knowledge & Principles', icon: 'Compass' },
      { number: 2, name: 'Phase 2: Core Tools', subtitle: 'Essential Frameworks & Practical Techniques', icon: 'Cpu' },
      { number: 3, name: 'Phase 3: Applied Practice', subtitle: 'Hands-on Projects & Problem Solving', icon: 'Layers' },
      { number: 4, name: 'Phase 4: Advanced Skills', subtitle: 'Production Workflows & Systems', icon: 'Users' },
      { number: 5, name: 'Phase 5: Capstone', subtitle: 'Portfolio Evaluation & Final Review', icon: 'Award' },
    ]
  }
};

// Aliases for backwards compatibility with existing components
CAREER_THEMES.ai_galaxy = CAREER_THEMES.ai_ml;
CAREER_THEMES.code_kingdom = CAREER_THEMES.technology;
CAREER_THEMES.business_city = CAREER_THEMES.business_management;
CAREER_THEMES.creative_universe = CAREER_THEMES.arts_humanities;
CAREER_THEMES.cyber_fortress = CAREER_THEMES.cybersecurity;
CAREER_THEMES.finance_empire = CAREER_THEMES.commerce_finance;
CAREER_THEMES.design_world = CAREER_THEMES.design_creative;
CAREER_THEMES.people_planet = CAREER_THEMES.business_management;

// Export all 18 domains for Explore Hub and theme previewers
export const ALL_18_DOMAINS_THEMES = [
  CAREER_THEMES.technology,
  CAREER_THEMES.ai_ml,
  CAREER_THEMES.data_science,
  CAREER_THEMES.commerce_finance,
  CAREER_THEMES.arts_humanities,
  CAREER_THEMES.business_management,
  CAREER_THEMES.healthcare_life,
  CAREER_THEMES.core_engineering,
  CAREER_THEMES.cybersecurity,
  CAREER_THEMES.cloud_devops,
  CAREER_THEMES.law_legal,
  CAREER_THEMES.education_research,
  CAREER_THEMES.government_public,
  CAREER_THEMES.psychology_behavioral,
  CAREER_THEMES.design_creative,
  CAREER_THEMES.hospitality_tourism,
  CAREER_THEMES.agriculture_environmental,
  CAREER_THEMES.entrepreneurship_innovation,
];

/**
 * Injects CSS custom properties into document.documentElement so the entire UI
 * (backgrounds, buttons, borders, highlights, gradients, motifs) updates dynamically.
 */
export function applyThemeToDocument(theme) {
  if (typeof document === 'undefined' || !theme?.palette) return;
  const root = document.documentElement;
  const p = theme.palette;

  root.style.setProperty('--theme-primary', p.primary);
  root.style.setProperty('--theme-secondary', p.secondary);
  root.style.setProperty('--theme-accent', p.accent);
  root.style.setProperty('--theme-bg-base', p.baseBg);
  root.style.setProperty('--theme-bg-gradient', p.pageGradient);
  root.style.setProperty('--theme-card-bg', p.cardBg);
  root.style.setProperty('--theme-card-border', p.cardBorder);
  root.style.setProperty('--theme-glow', p.glow);
  root.style.setProperty('--theme-btn-gradient', p.btnGradient);
  root.style.setProperty('--theme-btn-text', p.btnText);
  root.style.setProperty('--theme-badge-bg', p.badgeBg);
  root.style.setProperty('--theme-badge-border', p.badgeBorder);
  root.style.setProperty('--theme-badge-text', p.badgeText);
  root.style.setProperty('--theme-path-stroke', p.pathStroke);
  root.style.setProperty('--theme-path-glow', p.pathGlow);

  if (theme.visualMotif?.svgPattern) {
    root.style.setProperty('--theme-pattern', theme.visualMotif.svgPattern);
  }

  root.setAttribute('data-career-theme', theme.id);
}

// Skill Category Environment Mapping
export const SKILL_ENVIRONMENTS = {
  technical: {
    name: 'Technical Skill',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    accentColor: '#00f0ff',
    icon: 'Cpu'
  },
  analytical: {
    name: 'Analytical Skill',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    accentColor: '#10b981',
    icon: 'BarChart'
  },
  creative: {
    name: 'Design & Creative',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    accentColor: '#c084fc',
    icon: 'PenTool'
  },
  business: {
    name: 'Business & Strategy',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    accentColor: '#f59e0b',
    icon: 'Briefcase'
  },
  leadership: {
    name: 'Leadership & Team',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    accentColor: '#fb7185',
    icon: 'Users'
  },
  communication: {
    name: 'Communication & Soft Skills',
    badgeClass: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    accentColor: '#2dd4bf',
    icon: 'MessageSquare'
  }
};

/**
 * Resolves a career theme based on role slug, title, category, or domain name.
 * Supports all 18 domains with precision mapping.
 */
export function getCareerTheme(roleSlugOrTitle = '') {
  if (!roleSlugOrTitle) return CAREER_THEMES.universal_journey;

  const normalized = roleSlugOrTitle.toLowerCase().replace(/[\s_]+/g, '-');

  // Direct ID check
  if (CAREER_THEMES[normalized]) {
    return CAREER_THEMES[normalized];
  }

  // Slug inclusion check
  for (const theme of Object.values(CAREER_THEMES)) {
    if (theme.roleSlugs && theme.roleSlugs.some((slug) => normalized.includes(slug) || slug.includes(normalized))) {
      return theme;
    }
  }

  // Exact 18-Domain keyword mapping
  if (normalized.includes('ai') || normalized.includes('machine-learning') || normalized.includes('genai') || normalized.includes('deep-learning') || normalized.includes('agentic')) {
    return CAREER_THEMES.ai_ml;
  }
  if (normalized.includes('data-scientist') || normalized.includes('data-analyst') || normalized.includes('analytics') || normalized.includes('bi-') || normalized.includes('data-engineer')) {
    return CAREER_THEMES.data_science;
  }
  if (normalized.includes('cloud') || normalized.includes('devops') || normalized.includes('sre') || normalized.includes('kubernetes') || normalized.includes('aws') || normalized.includes('azure') || normalized.includes('docker')) {
    return CAREER_THEMES.cloud_devops;
  }
  if (normalized.includes('security') || normalized.includes('cyber') || normalized.includes('threat') || normalized.includes('soc') || normalized.includes('infosec') || normalized.includes('pentest')) {
    return CAREER_THEMES.cybersecurity;
  }
  if (normalized.includes('finance') || normalized.includes('financial') || normalized.includes('investment') || normalized.includes('accounting') || normalized.includes('chartered-accountant') || normalized.includes('ca-') || normalized.includes('bank') || normalized.includes('audit') || normalized.includes('wealth')) {
    return CAREER_THEMES.commerce_finance;
  }
  if (normalized.includes('medical') || normalized.includes('doctor') || normalized.includes('physician') || normalized.includes('clinical') || normalized.includes('pharma') || normalized.includes('nurse') || normalized.includes('health') || normalized.includes('biomedical') || normalized.includes('bioinformatics') || normalized.includes('hospital')) {
    return CAREER_THEMES.healthcare_life;
  }
  if (normalized.includes('law') || normalized.includes('legal') || normalized.includes('lawyer') || normalized.includes('advocate') || normalized.includes('judiciary') || normalized.includes('attorney') || normalized.includes('jurisprudence') || normalized.includes('arbitration')) {
    return CAREER_THEMES.law_legal;
  }
  if (normalized.includes('civil-service') || normalized.includes('upsc') || normalized.includes('ias') || normalized.includes('ips') || normalized.includes('governance') || normalized.includes('policy') || normalized.includes('diplomat') || normalized.includes('public-administration')) {
    return CAREER_THEMES.government_public;
  }
  if (normalized.includes('mechanical') || normalized.includes('civil-eng') || normalized.includes('structural') || normalized.includes('electrical') || normalized.includes('robotics') || normalized.includes('aerospace') || normalized.includes('automotive') || normalized.includes('mechatronics')) {
    return CAREER_THEMES.core_engineering;
  }
  if (normalized.includes('ui') || normalized.includes('ux') || normalized.includes('graphic') || normalized.includes('animat') || normalized.includes('3d') || normalized.includes('creative-arts') || normalized.includes('brand-identity')) {
    return CAREER_THEMES.design_creative;
  }
  if (normalized.includes('writer') || normalized.includes('journal') || normalized.includes('history') || normalized.includes('humanities') || normalized.includes('literature') || normalized.includes('editorial') || normalized.includes('pr-') || normalized.includes('communications')) {
    return CAREER_THEMES.arts_humanities;
  }
  if (normalized.includes('startup') || normalized.includes('founder') || normalized.includes('entrepreneur') || normalized.includes('venture') || normalized.includes('incubation')) {
    return CAREER_THEMES.entrepreneurship_innovation;
  }
  if (normalized.includes('hotel') || normalized.includes('hospitality') || normalized.includes('tourism') || normalized.includes('travel') || normalized.includes('culinary') || normalized.includes('resort')) {
    return CAREER_THEMES.hospitality_tourism;
  }
  if (normalized.includes('agri') || normalized.includes('agronom') || normalized.includes('environment') || normalized.includes('ecology') || normalized.includes('forestry') || normalized.includes('sustainable')) {
    return CAREER_THEMES.agriculture_environmental;
  }
  if (normalized.includes('psycholog') || normalized.includes('counsel') || normalized.includes('therap') || normalized.includes('mental-health') || normalized.includes('behavioral')) {
    return CAREER_THEMES.psychology_behavioral;
  }
  if (normalized.includes('education') || normalized.includes('professor') || normalized.includes('teacher') || normalized.includes('curriculum') || normalized.includes('instructional') || normalized.includes('academic')) {
    return CAREER_THEMES.education_research;
  }
  if (normalized.includes('business') || normalized.includes('management') || normalized.includes('consultant') || normalized.includes('product-manager') || normalized.includes('strategy') || normalized.includes('operations') || normalized.includes('hr-') || normalized.includes('human-resources')) {
    return CAREER_THEMES.business_management;
  }
  if (normalized.includes('software') || normalized.includes('developer') || normalized.includes('engineer') || normalized.includes('code') || normalized.includes('frontend') || normalized.includes('backend') || normalized.includes('full-stack') || normalized.includes('qa') || normalized.includes('tech')) {
    return CAREER_THEMES.technology;
  }

  return CAREER_THEMES.universal_journey;
}

export function getSkillEnvironment(category = '') {
  const cat = (category || '').toLowerCase();
  if (cat.includes('communication') || cat.includes('presentation') || cat.includes('soft') || cat.includes('interpersonal')) {
    return SKILL_ENVIRONMENTS.communication;
  }
  if (cat.includes('leadership') || cat.includes('team') || cat.includes('management') || cat.includes('strategic')) {
    return SKILL_ENVIRONMENTS.leadership;
  }
  if (cat.includes('business') || cat.includes('finance') || cat.includes('accounting') || cat.includes('domain')) {
    return SKILL_ENVIRONMENTS.business;
  }
  if (cat.includes('analysis') || cat.includes('data') || cat.includes('math') || cat.includes('stat')) {
    return SKILL_ENVIRONMENTS.analytical;
  }
  if (cat.includes('design') || cat.includes('creative') || cat.includes('ux') || cat.includes('ui') || cat.includes('content')) {
    return SKILL_ENVIRONMENTS.creative;
  }
  return SKILL_ENVIRONMENTS.technical;
}
