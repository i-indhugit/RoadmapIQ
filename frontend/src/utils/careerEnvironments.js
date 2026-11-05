// Centralized Career Environments Registry for RoadmapIQ
// Transforms each career assessment into a distinct professional visual world.

export const CAREER_ENVIRONMENTS = {
  // 1. Java Developer – Code Laboratory
  java_developer: {
    id: 'java_developer',
    roleSlugs: ['java-developer'],
    environmentName: 'Code Laboratory IDE',
    visualConcept: 'Professional Developer IDE (VS Code / IntelliJ-inspired)',
    tagline: 'Dark coding workspace, JVM runtime inspector, and compiler-driven assessment.',
    layoutType: 'ide',
    theme: {
      primary: '#00f0ff',
      secondary: '#3b82f6',
      accent: '#818cf8',
      bgBase: '#090d16',
      cardBg: 'rgba(13, 20, 36, 0.92)',
      cardBorder: 'rgba(0, 240, 255, 0.3)',
      glow: 'rgba(0, 240, 255, 0.25)',
      badgeBg: 'rgba(0, 240, 255, 0.12)',
      badgeBorder: 'rgba(0, 240, 255, 0.35)',
      badgeText: '#00f0ff',
      editorFile: 'Main.java',
      editorTab: 'Java 21 Enterprise',
    },
    hudBadges: ['JDK 21 LTS', 'Spring Boot 3.2', 'JVM HotSpot', 'Git: main'],
    terminalPrompt: 'javac -Xlint:all Main.java && java -ea Main',
    statusIndicator: 'JVM Runtime: Active • 0 Errors',
    bootMessage: 'Initializing Code Laboratory IDE & JVM Runtime...',
    resultTitle: 'Developer Production Readiness Audit',
    resultSubtitle: 'Object-Oriented Architecture, JVM Memory Management & Enterprise Reliability',
  },

  // 2. Python Developer – Python Innovation Studio
  python_developer: {
    id: 'python_developer',
    roleSlugs: ['python-developer'],
    environmentName: 'Python Innovation Studio',
    visualConcept: 'Interactive Python Workspace (Jupyter / IPython-inspired)',
    tagline: 'Notebook-inspired content panels, Python REPL previews, and async logic.',
    layoutType: 'notebook',
    theme: {
      primary: '#38bdf8',
      secondary: '#f59e0b',
      accent: '#10b981',
      bgBase: '#0a1017',
      cardBg: 'rgba(12, 22, 33, 0.92)',
      cardBorder: 'rgba(56, 189, 248, 0.3)',
      glow: 'rgba(56, 189, 248, 0.25)',
      badgeBg: 'rgba(56, 189, 248, 0.12)',
      badgeBorder: 'rgba(56, 189, 248, 0.35)',
      badgeText: '#38bdf8',
      editorFile: 'solution.py',
      editorTab: 'Python 3.12 • CPython',
    },
    hudBadges: ['Python 3.12', 'AsyncIO Loop', 'FastAPI Core', 'Pytest Suite'],
    terminalPrompt: 'python -m pytest tests/ -v --asyncio-mode=strict',
    statusIndicator: 'Kernel: Idle • Memory: 42MB',
    bootMessage: 'Spawning Python Interactive Kernel & Testing Environment...',
    resultTitle: 'Python Engineering Competency Report',
    resultSubtitle: 'Modern Syntax, Algorithmic Elegance & Asynchronous Architecture',
  },

  // 3. Full Stack Developer – Digital Product Studio
  full_stack: {
    id: 'full_stack',
    roleSlugs: ['full-stack-developer'],
    environmentName: 'Digital Product Studio',
    visualConcept: 'Split Frontend / Backend Digital Architecture (Client & Server)',
    tagline: 'Dual split-view workspace, API route inspector, and database schema bridges.',
    layoutType: 'fullstack',
    theme: {
      primary: '#06b6d4',
      secondary: '#8b5cf6',
      accent: '#10b981',
      bgBase: '#090e18',
      cardBg: 'rgba(14, 21, 38, 0.92)',
      cardBorder: 'rgba(6, 182, 212, 0.3)',
      glow: 'rgba(6, 182, 212, 0.25)',
      badgeBg: 'rgba(6, 182, 212, 0.12)',
      badgeBorder: 'rgba(6, 182, 212, 0.35)',
      badgeText: '#06b6d4',
      editorFile: 'App.tsx ⇄ api/route.ts',
      editorTab: 'Full Stack Architecture',
    },
    hudBadges: ['React 18', 'Node.js / Express', 'PostgreSQL DB', 'Tailwind CSS'],
    terminalPrompt: 'npm run dev -- --host & npx prisma migrate status',
    statusIndicator: 'Client: Port 5173 • API: Port 8000 • DB: Healthy',
    bootMessage: 'Connecting Digital Product Architecture: Client, API & Database...',
    resultTitle: 'Full-Stack Product Engineering Scorecard',
    resultSubtitle: 'End-to-End System Design, State Management & Robust REST APIs',
  },

  // 4. Frontend Developer – Interactive Design Studio
  frontend_developer: {
    id: 'frontend_developer',
    roleSlugs: ['frontend-developer'],
    environmentName: 'Interactive Design Studio',
    visualConcept: 'Modern UI/UX & Responsive Browser Workspace (Figma / DevTools)',
    tagline: 'Browser preview canvas, device viewport switcher, and component tree inspector.',
    layoutType: 'frontend',
    theme: {
      primary: '#a855f7',
      secondary: '#ec4899',
      accent: '#06b6d4',
      bgBase: '#100a1c',
      cardBg: 'rgba(23, 14, 40, 0.92)',
      cardBorder: 'rgba(168, 85, 247, 0.3)',
      glow: 'rgba(168, 85, 247, 0.25)',
      badgeBg: 'rgba(168, 85, 247, 0.12)',
      badgeBorder: 'rgba(168, 85, 247, 0.35)',
      badgeText: '#c084fc',
      editorFile: 'Component.tsx',
      editorTab: 'DOM & Layout Inspector',
    },
    hudBadges: ['React 18 DOM', 'Viewport: 1440px', 'Tailwind Tokens', 'Lighthouse: 99'],
    terminalPrompt: 'vite build --profile && npx chromatic test',
    statusIndicator: 'Responsive Engine: 60 FPS • Zero Layout Shift',
    bootMessage: 'Initializing Frontend Design Studio & DOM Inspector Canvas...',
    resultTitle: 'Frontend & UI/UX Engineering Audit',
    resultSubtitle: 'Component Hierarchy, Responsive Aesthetics & State Reactivity',
  },

  // 5. Backend Developer – Server Command Center
  backend_developer: {
    id: 'backend_developer',
    roleSlugs: ['backend-developer'],
    environmentName: 'Server Command Center',
    visualConcept: 'Backend Infrastructure & API Operations (Postman / Datadog-inspired)',
    tagline: 'API gateway monitoring, request-response payloads, and database relationship schemas.',
    layoutType: 'backend',
    theme: {
      primary: '#10b981',
      secondary: '#06b6d4',
      accent: '#f59e0b',
      bgBase: '#061312',
      cardBg: 'rgba(9, 29, 27, 0.92)',
      cardBorder: 'rgba(16, 185, 129, 0.3)',
      glow: 'rgba(16, 185, 129, 0.25)',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      badgeBorder: 'rgba(16, 185, 129, 0.35)',
      badgeText: '#34d399',
      editorFile: 'server.go / gateway.py',
      editorTab: 'API Gateway Console',
    },
    hudBadges: ['HTTP/2 TLS', 'PostgreSQL Pool', 'Redis Cache Store', 'p99: 14ms'],
    terminalPrompt: 'curl -i -X POST /api/v1/auth -d \'{"grant_type":"client"}\'',
    statusIndicator: 'Cluster: 3 Nodes Online • Latency: 12ms • Uptime: 99.99%',
    bootMessage: 'Mounting Server Command Center & Gateway Stream...',
    resultTitle: 'Backend Architecture & Distributed Systems Report',
    resultSubtitle: 'Relational Schemas, Concurrency, Caching & Scalable API Resilience',
  },

  // 6. Software Engineer – High-Performance Engineering Lab
  software_engineer: {
    id: 'software_engineer',
    roleSlugs: ['software-development-engineer', 'software-engineer'],
    environmentName: 'Systems Engineering Laboratory',
    visualConcept: 'Core Computer Science & Systems Engineering Workspace',
    tagline: 'Data structures, algorithm complexity benchmarks, and system-level reasoning.',
    layoutType: 'ide',
    theme: {
      primary: '#00f0ff',
      secondary: '#14b8a6',
      accent: '#3b82f6',
      bgBase: '#090d14',
      cardBg: 'rgba(15, 23, 38, 0.92)',
      cardBorder: 'rgba(0, 240, 255, 0.3)',
      glow: 'rgba(0, 240, 255, 0.25)',
      badgeBg: 'rgba(0, 240, 255, 0.12)',
      badgeBorder: 'rgba(0, 240, 255, 0.35)',
      badgeText: '#00f0ff',
      editorFile: 'Solution.cpp / Algo.ts',
      editorTab: 'Algorithm & Big-O Analyzer',
    },
    hudBadges: ['Big-O Space/Time', 'Binary Tree Traversal', 'Graph Dijkstra', 'POSIX Threads'],
    terminalPrompt: 'valgrind --leak-check=full ./algo_test --benchmark',
    statusIndicator: 'Memory: Clean • Time Complexity: Optimal',
    bootMessage: 'Calibrating Systems Engineering Test Harness & Complexity Profiler...',
    resultTitle: 'Core Software Engineering & Algorithmic Audit',
    resultSubtitle: 'Data Structures, Mathematical Precision & Architectural Clean Code',
  },

  // 7. Data Analyst – Data Intelligence Center
  data_analyst: {
    id: 'data_analyst',
    roleSlugs: ['data-analyst'],
    environmentName: 'Data Intelligence Center',
    visualConcept: 'Professional Analytics Laboratory (Spreadsheets, SQL & Tableau)',
    tagline: 'Spreadsheet-inspired question grids, SQL query panels, and data distribution charts.',
    layoutType: 'data_analyst',
    theme: {
      primary: '#10b981',
      secondary: '#f59e0b',
      accent: '#38bdf8',
      bgBase: '#041510',
      cardBg: 'rgba(8, 31, 24, 0.92)',
      cardBorder: 'rgba(16, 185, 129, 0.3)',
      glow: 'rgba(16, 185, 129, 0.25)',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      badgeBorder: 'rgba(16, 185, 129, 0.35)',
      badgeText: '#34d399',
      editorFile: 'analytics_query.sql',
      editorTab: 'SQL & BI Workspace',
    },
    hudBadges: ['PostgreSQL 16', 'Excel Matrix', 'Tableau Dashboards', 'Pandas v2.2'],
    terminalPrompt: 'SELECT cohort, SUM(revenue) FROM transactions GROUP BY 1 ORDER BY 2 DESC;',
    statusIndicator: 'Query Engine: Executed in 48ms • 14,200 Rows Scanned',
    bootMessage: 'Loading Data Intelligence Center & Tabular SQL Query Workspace...',
    resultTitle: 'Analytical Intelligence & Business Querying Report',
    resultSubtitle: 'Relational Aggregations, Window Functions, Metric Hygiene & Executive Insights',
  },

  // 8. Data Scientist – Research and Analytics Lab
  data_scientist: {
    id: 'data_scientist',
    roleSlugs: ['data-scientist'],
    environmentName: 'Scientific Research Lab',
    visualConcept: 'Advanced Data Research & Statistical Laboratory',
    tagline: 'Dataset feature profiling, statistical distribution curves, and model validation splits.',
    layoutType: 'data_science',
    theme: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      accent: '#ec4899',
      bgBase: '#0c0a1a',
      cardBg: 'rgba(18, 15, 38, 0.92)',
      cardBorder: 'rgba(139, 92, 246, 0.3)',
      glow: 'rgba(139, 92, 246, 0.25)',
      badgeBg: 'rgba(139, 92, 246, 0.12)',
      badgeBorder: 'rgba(139, 92, 246, 0.35)',
      badgeText: '#a78bfa',
      editorFile: 'research_notebook.ipynb',
      editorTab: 'Statistical Inference Lab',
    },
    hudBadges: ['Scikit-Learn', 'SciPy Stats', 'p-value < 0.01', 'ROC AUC: 0.94'],
    terminalPrompt: 'python -c "import scipy.stats as st; print(st.ttest_ind(sample_a, sample_b))"',
    statusIndicator: 'Distribution: Gaussian • Confidence Interval: 95%',
    bootMessage: 'Calibrating Research Analytics Lab & Statistical Distributions...',
    resultTitle: 'Data Science & Statistical Inference Report',
    resultSubtitle: 'Probability Distributions, Feature Engineering & Rigorous Hypothesis Testing',
  },

  // 9. Machine Learning Engineer – ML Model Laboratory
  machine_learning: {
    id: 'machine_learning',
    roleSlugs: ['machine-learning-engineer'],
    environmentName: 'ML Model Experimentation Lab',
    visualConcept: 'Machine Learning Experimentation Environment (Weights & Biases / PyTorch)',
    tagline: 'Neural layer topologies, loss curve charts, and tensor shape inspector.',
    layoutType: 'ml',
    theme: {
      primary: '#f59e0b',
      secondary: '#8b5cf6',
      accent: '#ef4444',
      bgBase: '#120d18',
      cardBg: 'rgba(28, 18, 38, 0.92)',
      cardBorder: 'rgba(245, 158, 11, 0.3)',
      glow: 'rgba(245, 158, 11, 0.25)',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      badgeBorder: 'rgba(245, 158, 11, 0.35)',
      badgeText: '#fbbf24',
      editorFile: 'train_model.py',
      editorTab: 'PyTorch Model Pipeline',
    },
    hudBadges: ['PyTorch 2.3', 'CUDA 12.1', 'AdamW Optimizer', 'Batch Size: 64'],
    terminalPrompt: 'python train.py --epochs 50 --lr 1e-4 --amp-fp16',
    statusIndicator: 'GPU 0: NVIDIA A100 • Epoch 48/50 • Loss: 0.0318',
    bootMessage: 'Mounting ML Model Laboratory & CUDA Tensor Stream...',
    resultTitle: 'Machine Learning Engineering Validation Report',
    resultSubtitle: 'Deep Neural Architecture, Hyperparameter Optimization & MLOps Deployment',
  },

  // 10. Generative AI Engineer – Generative AI Studio
  generative_ai: {
    id: 'generative_ai',
    roleSlugs: ['generative-ai-engineer', 'generative-ai-developer'],
    environmentName: 'Generative AI Studio',
    visualConcept: 'Advanced AI Creation Laboratory (LLM Studio / Playground)',
    tagline: 'Prompt engineering console, context window tokens, and RAG vector store pipelines.',
    layoutType: 'genai',
    theme: {
      primary: '#a855f7',
      secondary: '#00f0ff',
      accent: '#ec4899',
      bgBase: '#0c081c',
      cardBg: 'rgba(19, 13, 40, 0.92)',
      cardBorder: 'rgba(168, 85, 247, 0.3)',
      glow: 'rgba(168, 85, 247, 0.25)',
      badgeBg: 'rgba(168, 85, 247, 0.12)',
      badgeBorder: 'rgba(168, 85, 247, 0.35)',
      badgeText: '#c084fc',
      editorFile: 'prompt_pipeline.py',
      editorTab: 'Gemini 2.5 Flash Playground',
    },
    hudBadges: ['Gemini 2.5 Flash', 'Vector Store', 'Embeddings 768d', 'Temp: 0.2'],
    terminalPrompt: 'python -m rag.ingest --chunk-size 512 --overlap 64 --index chroma',
    statusIndicator: 'Context Window: 8,192 / 1,000,000 Tokens • Embedding Cosine: 0.91',
    bootMessage: 'Activating Generative AI Studio & Semantic Vector Space...',
    resultTitle: 'Generative AI Architecture & LLM Engineering Audit',
    resultSubtitle: 'System Prompt Optimization, Retrieval Augmented Generation & Vector Embeddings',
  },

  // 11. Agentic AI Engineer – Autonomous Agent Command Center
  agentic_ai: {
    id: 'agentic_ai',
    roleSlugs: ['agentic-ai-engineer'],
    environmentName: 'Autonomous Agent Command Center',
    visualConcept: 'Futuristic Multi-Agent Operations Mesh (LangGraph / AgentOps)',
    tagline: 'Multi-agent node graphs, live tool-calling execution feed, and memory state monitors.',
    layoutType: 'agentic',
    theme: {
      primary: '#00f0ff',
      secondary: '#8b5cf6',
      accent: '#10b981',
      bgBase: '#070b18',
      cardBg: 'rgba(11, 18, 38, 0.92)',
      cardBorder: 'rgba(0, 240, 255, 0.35)',
      glow: 'rgba(0, 240, 255, 0.3)',
      badgeBg: 'rgba(0, 240, 255, 0.12)',
      badgeBorder: 'rgba(0, 240, 255, 0.35)',
      badgeText: '#00f0ff',
      editorFile: 'graph_orchestrator.py',
      editorTab: 'LangGraph Mesh Workflow',
    },
    hudBadges: ['LangGraph StateMesh', 'ReAct Loop', 'Tool Calling v2', 'Memory Checkpointer'],
    terminalPrompt: 'agent_graph.stream({"input": query}, config={"thread_id": "session-42"})',
    statusIndicator: 'Orchestration Mesh: Active • Tool Nodes: 4 Ready • Loop: Stable',
    bootMessage: 'Initializing Autonomous Agent Mesh & Tool Calling Registry...',
    resultTitle: 'Autonomous Multi-Agent Systems Competency Report',
    resultSubtitle: 'Graph State Machines, Human-in-the-Loop, Tool Calling Precision & Persistent Memory',
  },

  // 12. Cloud Engineer – Cloud Infrastructure Operations Center
  cloud_engineer: {
    id: 'cloud_engineer',
    roleSlugs: ['cloud-engineer'],
    environmentName: 'Cloud Infrastructure Operations Center',
    visualConcept: 'Cloud Infrastructure & Topology Operations (AWS / GCP / Terraform)',
    tagline: 'VPC topology schematics, Terraform HCL declarations, and high availability metrics.',
    layoutType: 'cloud',
    theme: {
      primary: '#f97316',
      secondary: '#38bdf8',
      accent: '#10b981',
      bgBase: '#100b08',
      cardBg: 'rgba(26, 17, 13, 0.92)',
      cardBorder: 'rgba(249, 115, 22, 0.3)',
      glow: 'rgba(249, 115, 22, 0.25)',
      badgeBg: 'rgba(249, 115, 22, 0.12)',
      badgeBorder: 'rgba(249, 115, 22, 0.35)',
      badgeText: '#fb923c',
      editorFile: 'main.tf',
      editorTab: 'Terraform IaC & Topology',
    },
    hudBadges: ['AWS VPC', 'Kubernetes K8s', 'Terraform v1.8', 'Region: us-east-1'],
    terminalPrompt: 'terraform plan -out=tfplan.binary && kubectl get pods -n production',
    statusIndicator: 'Cloud Region: us-east-1a • Pods: 24/24 Running • SLA: 99.99%',
    bootMessage: 'Connecting to Cloud Infrastructure Operations Center & VPC Topology...',
    resultTitle: 'Cloud Architecture & Reliability Engineering Report',
    resultSubtitle: 'Multi-AZ Availability, Infrastructure as Code, Kubernetes & Zero-Trust Security',
  },

  // 13. QA Automation Engineer – Software Testing Laboratory
  qa_automation: {
    id: 'qa_automation',
    roleSlugs: ['qa-automation-engineer'],
    environmentName: 'Software Testing Laboratory',
    visualConcept: 'Automated Testing & Quality Engineering Suite (Playwright / Pytest)',
    tagline: 'Test case suite runners, assertion inspectors, and bug triage verification.',
    layoutType: 'qa',
    theme: {
      primary: '#10b981',
      secondary: '#ef4444',
      accent: '#38bdf8',
      bgBase: '#07130e',
      cardBg: 'rgba(11, 29, 21, 0.92)',
      cardBorder: 'rgba(16, 185, 129, 0.3)',
      glow: 'rgba(16, 185, 129, 0.25)',
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      badgeBorder: 'rgba(16, 185, 129, 0.35)',
      badgeText: '#34d399',
      editorFile: 'auth_workflow.spec.ts',
      editorTab: 'Test Runner Suite',
    },
    hudBadges: ['Playwright E2E', 'Pytest Core', 'CI/CD Pipeline', 'Pass Rate: 100%'],
    terminalPrompt: 'npx playwright test --reporter=html --workers=4',
    statusIndicator: 'Suite: 25 Assertions • Passing: 100% • Flakiness: 0.0%',
    bootMessage: 'Loading Software Testing Laboratory & Test Runner Harness...',
    resultTitle: 'Quality Engineering & Test Automation Verification Report',
    resultSubtitle: 'Assertion Rigor, E2E Workflows, API Integration Testing & Regression Defense',
  },

  // 14. Law & Legal Chamber
  legal_chamber: {
    id: 'legal_chamber',
    roleSlugs: ['corporate-lawyer', 'criminal-defense-advocate', 'intellectual-property-attorney', 'legal-analyst'],
    environmentName: 'High Court & Legal Chamber',
    visualConcept: 'Jurisprudence & Moot Court Analysis Environment',
    tagline: 'Statutory citations, landmark precedent review, and rigorous legal drafting.',
    layoutType: 'legal',
    theme: {
      primary: '#eab308',
      secondary: '#38bdf8',
      accent: '#facc15',
      bgBase: '#090d18',
      cardBg: 'rgba(15, 23, 42, 0.92)',
      cardBorder: 'rgba(234, 179, 8, 0.3)',
      glow: 'rgba(234, 179, 8, 0.25)',
      badgeBg: 'rgba(234, 179, 8, 0.12)',
      badgeBorder: 'rgba(234, 179, 8, 0.35)',
      badgeText: '#fde047',
      editorFile: 'brief_petition.legal',
      editorTab: 'Appellate Memorandum',
    },
    hudBadges: ['Bar Standard', 'IPC / BNS Code', 'Case Law Lexis', 'Jurisprudence: Active'],
    terminalPrompt: 'legal-search --precedents "Supreme Court" --statute "Contract Act"',
    statusIndicator: 'Dossier: Active • 14 Precedents Indexed • Validity: Certified',
    bootMessage: 'Entering Legal Chamber & Judicial Precedent Registry...',
    resultTitle: 'Legal Reasoning & Jurisprudence Competency Report',
    resultSubtitle: 'Constitutional Understanding, Statutory Interpretation & Legal Advocacy Rigor',
  },

  // 15. Medical & Clinical Diagnostics Center
  medical_diagnostics: {
    id: 'medical_diagnostics',
    roleSlugs: ['general-physician', 'clinical-data-analyst', 'bioinformatics-scientist', 'pharmacovigilance-specialist'],
    environmentName: 'Biomedical & Clinical Diagnostics Center',
    visualConcept: 'Evidence-Based Clinical Diagnostics & EMR Workspace',
    tagline: 'Pathophysiology differential diagnosis, lab panel verification, and bioethics.',
    layoutType: 'medical',
    theme: {
      primary: '#14b8a6',
      secondary: '#06b6d4',
      accent: '#34d399',
      bgBase: '#051416',
      cardBg: 'rgba(9, 32, 35, 0.92)',
      cardBorder: 'rgba(20, 184, 166, 0.3)',
      glow: 'rgba(20, 184, 166, 0.25)',
      badgeBg: 'rgba(20, 184, 166, 0.12)',
      badgeBorder: 'rgba(20, 184, 166, 0.35)',
      badgeText: '#2dd4bf',
      editorFile: 'patient_case_study.emr',
      editorTab: 'Clinical Diagnostics',
    },
    hudBadges: ['NMC Protocol', 'ICD-11 Indexed', 'Pharmacopeia', 'Evidence-Based'],
    terminalPrompt: 'diagnostics --panel "CBC, LFT, Lipid" --differential-engine active',
    statusIndicator: 'Telemetry: Stable • Clinical Protocols Verified',
    bootMessage: 'Initializing Biomedical Diagnostics Center & Clinical Workstation...',
    resultTitle: 'Clinical Medicine & Biomedical Knowledge Scorecard',
    resultSubtitle: 'Diagnostic Acumen, Therapeutic Protocols & Evidence-Based Healthcare Rigor',
  },

  // 16. Civil Governance & Public Policy Hall
  civil_council: {
    id: 'civil_council',
    roleSlugs: ['ias-officer', 'ips-officer', 'public-policy-analyst', 'diplomat-foreign-service'],
    environmentName: 'Public Administration & Civil Council',
    visualConcept: 'National Policy & District Governance Operations Center',
    tagline: 'Policy frameworks, socio-economic analysis, administrative crisis management.',
    layoutType: 'governance',
    theme: {
      primary: '#38bdf8',
      secondary: '#f59e0b',
      accent: '#ef4444',
      bgBase: '#090f1d',
      cardBg: 'rgba(14, 25, 48, 0.92)',
      cardBorder: 'rgba(56, 189, 248, 0.3)',
      glow: 'rgba(56, 189, 248, 0.25)',
      badgeBg: 'rgba(56, 189, 248, 0.12)',
      badgeBorder: 'rgba(56, 189, 248, 0.35)',
      badgeText: '#7dd3fc',
      editorFile: 'welfare_policy.gov',
      editorTab: 'Policy Dossier',
    },
    hudBadges: ['Constitutional Oath', 'General Studies', 'District Admin', 'Public Welfare'],
    terminalPrompt: 'policy-eval --metric "Socio-Economic Impact" --budget-allocation verified',
    statusIndicator: 'Administration: Active • 36 Districts Synchronized',
    bootMessage: 'Connecting to Public Administration & Civil Council Operations...',
    resultTitle: 'Public Administration & Policy Leadership Evaluation',
    resultSubtitle: 'Constitutional Governance, Socio-Economic Development & Administrative Integrity',
  },

  // 17. Financial Valuation Terminal
  financial_terminal: {
    id: 'financial_terminal',
    roleSlugs: ['chartered-accountant', 'financial-analyst', 'investment-banker', 'equity-research-analyst'],
    environmentName: 'Institutional Finance & Valuation Terminal',
    visualConcept: 'Quantitative Bloomberg-Style Financial Terminal',
    tagline: 'Balance sheets, DCF models, auditing standards, and portfolio analytics.',
    layoutType: 'finance',
    theme: {
      primary: '#f59e0b',
      secondary: '#fef3c7',
      accent: '#d97706',
      bgBase: '#120d08',
      cardBg: 'rgba(31, 22, 14, 0.92)',
      cardBorder: 'rgba(245, 158, 11, 0.3)',
      glow: 'rgba(245, 158, 11, 0.25)',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      badgeBorder: 'rgba(245, 158, 11, 0.35)',
      badgeText: '#fbbf24',
      editorFile: 'dcf_valuation_model.xlsx',
      editorTab: 'Institutional Valuation',
    },
    hudBadges: ['ICAI GAAP', 'DCF Engine', 'WACC 8.4%', 'Audited Financials'],
    terminalPrompt: 'valuation --wacc 0.084 --terminal-growth 0.03 --fcf-projection 5y',
    statusIndicator: 'Terminal: Live Market Feeds • Arbitrage Clean',
    bootMessage: 'Connecting to Institutional Financial Modeling Terminal...',
    resultTitle: 'Corporate Finance & Accounting Competency Scorecard',
    resultSubtitle: 'Valuation Rigor, Statutory Auditing, Cash Flow Forecasting & Capital Structure',
  },

  // 18. Physical Engineering Laboratory
  engineering_workshop: {
    id: 'engineering_workshop',
    roleSlugs: ['mechanical-engineer', 'civil-structural-engineer', 'electrical-systems-engineer', 'robotics-engineer'],
    environmentName: 'Advanced Physical Engineering Laboratory',
    visualConcept: 'CAD/FEA Simulation & Hardware Engineering Workspace',
    tagline: 'Stress calculations, thermodynamics, circuits, and structural mechanics.',
    layoutType: 'engineering',
    theme: {
      primary: '#f97316',
      secondary: '#38bdf8',
      accent: '#94a3b8',
      bgBase: '#0f1015',
      cardBg: 'rgba(24, 25, 34, 0.92)',
      cardBorder: 'rgba(249, 115, 22, 0.3)',
      glow: 'rgba(249, 115, 22, 0.25)',
      badgeBg: 'rgba(249, 115, 22, 0.12)',
      badgeBorder: 'rgba(249, 115, 22, 0.35)',
      badgeText: '#fb923c',
      editorFile: 'finite_element_mesh.step',
      editorTab: 'FEA Simulation',
    },
    hudBadges: ['ANSYS Mesh', 'Von Mises Yield', 'CAD SolidWorks', 'Safety Factor: 2.4'],
    terminalPrompt: 'fea-solve --mesh-density fine --boundary-load 12000N --safety-factor min',
    statusIndicator: 'Simulation: Converged • Stress Peak within Elastic Limit',
    bootMessage: 'Loading CAD/FEA Physical Engineering Suite...',
    resultTitle: 'Physical Systems & Structural Engineering Evaluation',
    resultSubtitle: 'Material Science, Kinematics, CAD Modeling & Structural Safety Integrity',
  },
};

/**
 * Resolves the career environment configuration given a role slug or title.
 * Always returns a rich, structured environment object.
 */
export function getCareerEnvironment(roleSlugOrTitle = '') {
  if (!roleSlugOrTitle) return CAREER_ENVIRONMENTS.java_developer;

  const normalized = roleSlugOrTitle.toLowerCase().replace(/[\s_]+/g, '-');

  for (const env of Object.values(CAREER_ENVIRONMENTS)) {
    if (env.roleSlugs.some((slug) => normalized.includes(slug) || slug.includes(normalized))) {
      return env;
    }
  }

  // Keyword fallbacks across all 18 domains
  if (normalized.includes('medical') || normalized.includes('doctor') || normalized.includes('physician') || normalized.includes('clinical') || normalized.includes('pharma') || normalized.includes('nurse') || normalized.includes('health') || normalized.includes('bio')) {
    return CAREER_ENVIRONMENTS.medical_diagnostics;
  }
  if (normalized.includes('law') || normalized.includes('legal') || normalized.includes('advocate') || normalized.includes('judiciary') || normalized.includes('attorney')) {
    return CAREER_ENVIRONMENTS.legal_chamber;
  }
  if (normalized.includes('civil-service') || normalized.includes('upsc') || normalized.includes('ias') || normalized.includes('ips') || normalized.includes('policy') || normalized.includes('diplomat') || normalized.includes('governance')) {
    return CAREER_ENVIRONMENTS.civil_council;
  }
  if (normalized.includes('finance') || normalized.includes('accountant') || normalized.includes('audit') || normalized.includes('banking') || normalized.includes('investment') || normalized.includes('ca-')) {
    return CAREER_ENVIRONMENTS.financial_terminal;
  }
  if (normalized.includes('mechanical') || normalized.includes('civil-') || normalized.includes('electrical') || normalized.includes('robotics') || normalized.includes('hardware') || normalized.includes('aerospace')) {
    return CAREER_ENVIRONMENTS.engineering_workshop;
  }
  if (normalized.includes('business-analyst') || normalized.includes('product-manager') || normalized.includes('operations')) {
    return CAREER_ENVIRONMENTS.business_boardroom || CAREER_ENVIRONMENTS.data_analyst;
  }
  if (normalized.includes('agent')) return CAREER_ENVIRONMENTS.agentic_ai;
  if (normalized.includes('cloud') || normalized.includes('devops')) return CAREER_ENVIRONMENTS.cloud_engineer;
  if (normalized.includes('qa') || normalized.includes('test')) return CAREER_ENVIRONMENTS.qa_automation;
  if (normalized.includes('gen') || normalized.includes('llm')) return CAREER_ENVIRONMENTS.generative_ai;
  if (normalized.includes('machine') || normalized.includes('ml')) return CAREER_ENVIRONMENTS.machine_learning;
  if (normalized.includes('data-scientist')) return CAREER_ENVIRONMENTS.data_scientist;
  if (normalized.includes('data') || normalized.includes('analyst')) return CAREER_ENVIRONMENTS.data_analyst;
  if (normalized.includes('frontend') || normalized.includes('ui') || normalized.includes('design')) return CAREER_ENVIRONMENTS.frontend_developer;
  if (normalized.includes('backend')) return CAREER_ENVIRONMENTS.backend_developer;
  if (normalized.includes('full-stack') || normalized.includes('fullstack')) return CAREER_ENVIRONMENTS.full_stack;
  if (normalized.includes('python')) return CAREER_ENVIRONMENTS.python_developer;
  if (normalized.includes('java')) return CAREER_ENVIRONMENTS.java_developer;

  return CAREER_ENVIRONMENTS.software_engineer;
}

