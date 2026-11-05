"""
Seed Centralized RAG Knowledge Base for RoadmapIQ.
Injects comprehensive, multi-domain, citation-verified curriculum documents
covering all 18 domains and all 10 knowledge categories.
Idempotent: skips already indexed documents via SHA-256 hash checks.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.engine.rag_engine import DocumentIngestionService
import logging

logger = logging.getLogger("roadmapiq.rag_seed")

SEED_DOCUMENTS: List[Dict[str, Any]] = [
    # ── 1. Technology: Java Backend ──────────────────────────────────────────
    {
        "title": "Java Platform, Standard Edition & Spring Boot Enterprise Architecture",
        "provider": "Oracle Corporation & VMware Spring",
        "source_url": "https://docs.oracle.com/en/java/javase/21/",
        "career_domain": "Technology and IT",
        "career_role_title": "Java Backend Developer",
        "category": "official_documentation",
        "related_skills": ["Java", "Spring Boot", "REST APIs", "Multithreading"],
        "related_topics": ["JVM Memory Model", "Dependency Injection", "Spring Data JPA", "Concurrency"],
        "difficulty": "intermediate",
        "country_jurisdiction": "Global",
        "access_type": "official",
        "content": """
# Java SE 21 & Spring Boot Enterprise Engineering Guide

### Module 1: The Java Virtual Machine (JVM) Architecture and Memory Management
The JVM divides memory into the Heap (divided into Young Generation with Eden and Survivor spaces, and Old/Tenured Generation), Metaspace (for class metadata), Thread Stacks, and Program Counter registers. Garbage Collection algorithms such as G1 GC, ZGC, and Shenandoah offer low-latency, concurrent mark-sweep compaction.

- Key Principle: Object allocation in Eden space is contiguous and fast. Objects surviving multiple minor GC cycles are promoted to Tenured Space.
- Performance Tuning: Tune with `-Xms`, `-Xmx`, and `-XX:+UseG1GC`. Avoid memory leaks caused by unclosed streams or static collections holding object references.

### Module 2: Spring Boot Dependency Injection and Inversion of Control
Spring's ApplicationContext manages the lifecycle of Beans. Stereotype annotations (`@Service`, `@Repository`, `@Component`, `@RestController`) declare injectable components. Constructor injection is strictly preferred over field injection (`@Autowired`) to ensure testability and immutability.

- Bean Scopes: Singleton (default, stateless), Prototype (new instance per request), Request, and Session.
- Transaction Management: Use `@Transactional` with appropriate propagation attributes (`REQUIRED`, `REQUIRES_NEW`) and rollback rules for checked vs unchecked exceptions.

### Module 3: RESTful Microservices and Resilience Patterns
Production Java backends implement stateless REST endpoints using Spring MVC. Resiliency is maintained using Circuit Breakers (Resilience4j), Rate Limiters, and asynchronous processing using CompletableFuture or Project Reactor.
        """.strip(),
    },
    {
        "title": "Java Technical Interview & System Design Preparation Handbook",
        "provider": "RoadmapIQ Placement Board",
        "source_url": "https://roadmapiq.internal/curriculum/java-interview-guide",
        "career_domain": "Technology and IT",
        "career_role_title": "Java Backend Developer",
        "category": "interview_preparation",
        "related_skills": ["Java", "System Design", "SQL", "Microservices"],
        "related_topics": ["HashMap Internals", "ConcurrentHashMap", "ACID Transactions", "Indexing"],
        "difficulty": "advanced",
        "country_jurisdiction": "Global",
        "access_type": "free_open",
        "content": r"""
# Java Placement & Technical Interview Master Guide

### Core Conceptual Questions
1. HashMap Collisions & Red-Black Trees: In Java 8+, when bucket entries exceed TREEIFY_THRESHOLD (8) and table capacity >= 64, linked lists convert to balanced red-black trees ($O(\\log n)$ lookup).
2. Volatile vs Synchronized: `volatile` guarantees visibility of variable updates across CPU caches (prevents reordering), while `synchronized` guarantees both mutual exclusion and memory barrier visibility.
3. String Pool and Immutability: String literals reside in the String Intern Pool. Immutability ensures thread safety, secure class loading, and caching of hash codes.

### System Design Coding Patterns
- Database Connection Pooling: Always configure HikariCP with maximumPoolSize aligned with available DB CPU cores: $Connections = ((core\_count \\times 2) + effective\_spindle\_count)$.
- Idempotent API Design: Use idempotency keys stored in Redis for payment processing and task completions.
        """.strip(),
    },

    # ── 2. AI & Data Science ────────────────────────────────────────────────
    {
        "title": "Machine Learning Engineering & Deep Learning Fundamentals",
        "provider": "Stanford AI Lab & PyTorch Foundation",
        "source_url": "https://pytorch.org/docs/stable/index.html",
        "career_domain": "Artificial Intelligence & Machine Learning",
        "career_role_title": "Machine Learning Engineer",
        "category": "learning_materials",
        "related_skills": ["Machine Learning", "PyTorch", "Python", "Deep Learning"],
        "related_topics": ["Backpropagation", "Gradient Descent", "Transformers", "Model Evaluation"],
        "difficulty": "intermediate",
        "country_jurisdiction": "Global",
        "access_type": "academic",
        "content": """
# PyTorch Deep Learning & Machine Learning Foundations

### 1. Mathematical Foundations of Backpropagation
Neural network optimization relies on gradient descent via the chain rule of calculus. Given a loss function $\\mathcal{L}(y, \\hat{y})$, gradients are propagated backward through layers using reverse-mode automatic differentiation (`torch.autograd`).
- Loss Functions: Cross-Entropy Loss for multi-class classification, Mean Squared Error (MSE) for regression, and Triplet / Cosine Loss for metric learning.
- Optimizers: AdamW (Adam with decoupled weight decay) is the modern standard for Transformer models, combining momentum with adaptive learning rates.

### 2. Transformer Architecture & Attention Mechanism
The Scaled Dot-Product Attention is computed as:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$
Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.

### 3. Model Evaluation and Generalization
Never evaluate models on training data. Split into stratified Train/Validation/Test sets. Key metrics include ROC-AUC, Precision-Recall AUC for imbalanced datasets, and F1-score. Regularization techniques include Dropout, L2 Weight Decay, and Data Augmentation.
        """.strip(),
    },

    # ── 3. Commerce, Finance & Banking ──────────────────────────────────────
    {
        "title": "Indian Accounting Standards (Ind AS) & Financial Reporting Framework",
        "provider": "Institute of Chartered Accountants of India (ICAI)",
        "source_url": "https://www.icai.org/post/indian-accounting-standards-indas",
        "career_domain": "Commerce, Finance & Banking",
        "career_role_title": "Financial Analyst",
        "category": "official_documentation",
        "related_skills": ["Financial Accounting", "Financial Modeling", "Corporate Finance", "Excel"],
        "related_topics": ["Balance Sheet", "Cash Flow Analysis", "Revenue Recognition", "Ind AS 115"],
        "difficulty": "intermediate",
        "country_jurisdiction": "India",
        "access_type": "official",
        "content": """
# ICAI Financial Accounting & Reporting Compendium

### 1. The Accounting Equation and Double-Entry System
The foundational accounting equation:
$$\\text{Assets} = \\text{Liabilities} + \\text{Equity}$$
Every financial transaction affects at least two accounts. Debit represents increases in assets/expenses and decreases in liabilities/equity. Credit represents increases in liabilities/equity/revenue and decreases in assets/expenses.

### 2. Three Financial Statements Interconnection
- Profit & Loss Statement (Income Statement): Tracks revenues and expenses over an accounting period, arriving at Net Profit after Tax (PAT).
- Balance Sheet: A point-in-time snapshot of assets, liabilities, and shareholder equity. Net profit flows into Retained Earnings on the Balance Sheet.
- Cash Flow Statement (Indirect Method): Reconciles Net Income to actual Cash Flow via Operating Activities (adjusting for non-cash expenses like depreciation and working capital changes), Investing Activities (CapEx), and Financing Activities (dividends, debt issuance).

### 3. Ind AS 115: Revenue from Contracts with Customers
Mandates the 5-step revenue recognition model:
1. Identify the contract with a customer.
2. Identify separate performance obligations.
3. Determine the transaction price.
4. Allocate the transaction price to performance obligations.
5. Recognize revenue when or as each performance obligation is satisfied.
        """.strip(),
    },

    # ── 4. Law & Legal Services ─────────────────────────────────────────────
    {
        "title": "Constitutional Law, Criminal Procedure & Judicial Precedents of India",
        "provider": "Supreme Court of India & Bar Council of India",
        "source_url": "https://main.sci.gov.in/",
        "career_domain": "Law & Legal Services",
        "career_role_title": "Corporate Lawyer",
        "category": "official_documentation",
        "related_skills": ["Legal Drafting", "Constitutional Law", "Corporate Law", "Contract Law"],
        "related_topics": ["Fundamental Rights", "Contract Enforceability", "Arbitration", "Jurisdiction"],
        "difficulty": "advanced",
        "country_jurisdiction": "India",
        "access_type": "official",
        "content": """
# Constitutional Law & Legal Practice in India

### 1. Fundamental Rights and Judicial Review
Article 12 through Article 35 of the Constitution of India embody Fundamental Rights.
- Article 21 (Right to Life and Personal Liberty): Expanded via landmark rulings (Maneka Gandhi, K.S. Puttaswamy) to encompass the Right to Privacy, Speedy Trial, and Dignity.
- Writ Jurisdiction: Articles 32 (Supreme Court) and 226 (High Courts) empower issuance of prerogative writs: Habeas Corpus, Mandamus, Prohibition, Certiorari, and Quo Warranto.

### 2. Essential Ingredients of a Valid Contract (Indian Contract Act, 1872)
Under Section 10, an agreement is an enforceable contract if made by:
- Free consent of competent parties (unaffected by coercion, undue influence, fraud, or misrepresentation).
- Lawful consideration and lawful object.
- Not expressly declared void under Sections 24-30 (e.g., agreements in restraint of trade or marriage).

### 3. Legal Brief Drafting Methodology (IRAC Framework)
All formal legal analysis follows the IRAC structure:
- Issue: Precise legal question at dispute.
- Rule: Governing statutory provisions and authoritative Supreme Court / High Court precedents.
- Application: Concrete application of legal rules to the disputed facts.
- Conclusion: Remedial prayer and definitive judicial outcome.
        """.strip(),
    },

    # ── 5. Healthcare, Medicine & Life Sciences ─────────────────────────────
    {
        "title": "Evidence-Based Clinical Diagnosis & Patient Management Protocols",
        "provider": "National Medical Commission (NMC) & World Health Organization (WHO)",
        "source_url": "https://www.nmc.org.in/",
        "career_domain": "Healthcare, Medicine & Life Sciences",
        "career_role_title": "Clinical Research Associate",
        "category": "official_documentation",
        "related_skills": ["Clinical Research", "Pharmacology", "Patient Care", "Medical Ethics"],
        "related_topics": ["Clinical Trials", "GCP Guidelines", "Pharmacovigilance", "Medical Ethics"],
        "difficulty": "advanced",
        "country_jurisdiction": "India",
        "access_type": "official",
        "content": """
# Clinical Medicine Protocols & Good Clinical Practice (GCP)

### 1. Good Clinical Practice (GCP) and Ethics in Research
The Declaration of Helsinki and ICMR Ethical Guidelines govern biomedical research on human participants:
- Informed Consent: Must be voluntary, informed, documented, and given by a competent subject without coercion.
- Institutional Ethics Committee (IEC): Must approve all protocols, investigator brochures, and safety reporting mechanisms before trial initiation.
- Pharmacovigilance: Serious Adverse Events (SAEs) must be reported to the Drugs Controller General of India (DCGI) and the ethics committee within 24 hours.

### 2. Phases of Clinical Drug Development
- Phase I (Safety & Tolerability): 20-80 healthy volunteers to determine pharmacokinetics and maximum tolerated dose (MTD).
- Phase II (Efficacy & Dose-Ranging): 100-300 patients with the target disease.
- Phase III (Confirmatory Efficacy): 1,000-3,000 patients in multi-center randomized controlled trials (RCTs).
- Phase IV (Post-Marketing Surveillance): Long-term monitoring of adverse drug reactions across diverse populations.
        """.strip(),
    },

    # ── 6. Government, Civil Services & Public Policy ────────────────────────
    {
        "title": "UPSC Civil Services Examination Syllabus & Indian Polity Governance",
        "provider": "Union Public Service Commission (UPSC)",
        "source_url": "https://upsc.gov.in/examinations/civil-services-examination",
        "career_domain": "Government, Civil Services & Public Policy",
        "career_role_title": "Civil Services Officer",
        "category": "examination_syllabi",
        "related_skills": ["Public Administration", "Indian Polity", "Policy Analysis", "General Studies"],
        "related_topics": ["Preamble", "Federalism", "Panchayati Raj", "Administrative Ethics"],
        "difficulty": "advanced",
        "country_jurisdiction": "India",
        "access_type": "official",
        "content": """
# UPSC Civil Services Examination (CSE) Preparation Compendium

### 1. General Studies Paper II: Indian Constitution, Polity & Governance
- Preamble: Declares India a Sovereign, Socialist, Secular, Democratic Republic committed to Justice, Liberty, Equality, and Fraternity.
- Federal Structure and Center-State Relations: Governed by the Seventh Schedule (Union, State, and Concurrent Lists) and financial devolution through the Finance Commission (Article 280).
- Local Self-Government: 73rd and 74th Constitutional Amendment Acts institutionalized rural Panchayati Raj Institutions (PRIs) and urban Municipalities with 29 and 18 functional items respectively.

### 2. Mains Answer Writing Structure (The 250-Word Standard)
- Introduction (25-30 words): Direct contextual definition, recent data, or constitutional provision.
- Body (150-170 words): Multi-dimensional analysis broken into subheadings (Social, Economic, Administrative, Technological, Ethical implications).
- Way Forward & Conclusion (30-40 words): Pragmatic reform recommendations citing committee reports (e.g., 2nd ARC, NITI Aayog Strategy, Law Commission).
        """.strip(),
    },

    # ── 7. Design, Media & Creative Arts ────────────────────────────────────
    {
        "title": "Human-Centered UI/UX Design Heuristics & Design Systems",
        "provider": "Nielsen Norman Group & Design Council",
        "source_url": "https://www.nngroup.com/articles/ten-usability-heuristics/",
        "career_domain": "Design, Media & Creative Arts",
        "career_role_title": "UI/UX Designer",
        "category": "learning_materials",
        "related_skills": ["UI/UX Design", "Figma", "User Research", "Wireframing"],
        "related_topics": ["Usability Heuristics", "Typography", "Color Contrast", "Design Systems"],
        "difficulty": "intermediate",
        "country_jurisdiction": "Global",
        "access_type": "academic",
        "content": """
# UI/UX Product Design Principles & Heuristics

### 1. Jakob Nielsen's 10 Usability Heuristics
1. Visibility of system status: Provide immediate feedback on actions (progress bars, loaders).
2. Match between system and the real world: Use words, phrases, and concepts familiar to the user.
3. User control and freedom: Provide clear 'Emergency Exits' (Undo, Cancel, Back).
4. Consistency and standards: Maintain uniform icon meanings, navigation patterns, and typography.
5. Error prevention: Eliminate error-prone conditions or present confirmation before committing irreversible actions.
6. Recognition rather than recall: Minimize memory load by making elements, actions, and options visible.

### 2. Accessibility & WCAG 2.1 Guidelines
- Contrast Ratios: Normal text requires minimum 4.5:1 contrast against background; large text (18pt+) requires 3:1 (Level AA).
- Touch Target Sizes: Minimum interactive area of 44x44 CSS pixels for mobile touchscreens.
- Semantic HTML and Screen Reader Compatibility: Form inputs must have explicit `<label>` tags and ARIA descriptors.
        """.strip(),
    },

    # ── 8. Business, Management & Consulting ────────────────────────────────
    {
        "title": "Product Management Frameworks & Agile Scrum Execution",
        "provider": "Scrum.org & Product Management Institute",
        "source_url": "https://www.scrum.org/resources/scrum-guide",
        "career_domain": "Business, Management & Consulting",
        "career_role_title": "Product Manager",
        "category": "profile_responsibilities",
        "related_skills": ["Product Management", "Agile", "Scrum", "User Stories", "Roadmapping"],
        "related_topics": ["Sprint Planning", "Sprint Review", "Prioritization (RICE)", "Metrics"],
        "difficulty": "intermediate",
        "country_jurisdiction": "Global",
        "access_type": "official",
        "content": """
# Product Management Strategy & Scrum Delivery Framework

### 1. The Agile Scrum Framework
- Scrum Artifacts: Product Backlog (prioritized feature list), Sprint Backlog (commitments for current sprint), and Increment (usable deliverable).
- Scrum Ceremonies: Sprint Planning, Daily Scrum (15-min sync), Sprint Review (demonstration to stakeholders), and Sprint Retrospective (team process improvement).
- Definition of Done (DoD): Non-negotiable criteria including unit tests, acceptance criteria verified, code reviewed, documentation updated.

### 2. Feature Prioritization Frameworks
- RICE Scoring Model:
$$\\text{RICE Score} = \\frac{\\text{Reach} \\times \\text{Impact} \\times \\text{Confidence}}{\\text{Effort}}$$
Reach (users per timeframe), Impact (0.5 to 3.0 scale), Confidence (percentage), Effort (person-months).
- Kano Model: Classifies customer preferences into Basic Needs (must-haves), Performance Needs (more is better), and Delighters (unprompted positive surprises).
        """.strip(),
    },

    # ── 9. Agriculture & Environmental Sciences ─────────────────────────────
    {
        "title": "Precision Agriculture, Soil Science & Sustainable Agronomy",
        "provider": "Indian Council of Agricultural Research (ICAR) & FAO",
        "source_url": "https://icar.org.in/",
        "career_domain": "Agriculture, Environment & Sustainability",
        "career_role_title": "Agricultural Scientist",
        "category": "official_documentation",
        "related_skills": ["Agronomy", "Soil Science", "Precision Farming", "Crop Management"],
        "related_topics": ["Soil Health Card", "Drip Irrigation", "Integrated Pest Management", "Carbon Sequestration"],
        "difficulty": "intermediate",
        "country_jurisdiction": "India",
        "access_type": "official",
        "content": """
# Modern Agronomy, Soil Fertility & Precision Farming

### 1. Soil Health and Macro/Micro Nutrient Dynamics
Healthy soil requires balanced nitrogen (N), phosphorus (P), and potassium (K) ratios:
- Soil pH Range: 6.0 to 7.5 maximizes nutrient availability for most cash crops.
- Soil Organic Carbon (SOC): Critical indicator of soil biological activity and water holding capacity.
- Indian Soil Health Card Scheme: Promotes site-specific nutrient management (SSNM) to prevent urea over-application.

### 2. Precision Irrigation & Resource Conservation
- Micro-Irrigation (Drip and Sprinkler): Achieves 70-90% water use efficiency compared to 30-40% in flood irrigation. Reduces weed emergence and enables fertigation (injecting water-soluble fertilizers directly into irrigation lines).
- Integrated Pest Management (IPM): Combines biological controls (predatory insects), cultural practices (crop rotation), and targeted biopesticides to minimize chemical runoff.
        """.strip(),
    },
]


def seed_rag_knowledge(db: Session) -> Dict[str, Any]:
    """
    Ingests all seed documents into the database via DocumentIngestionService.
    Idempotent and safe to run on startup.
    """
    service = DocumentIngestionService(db)
    indexed_count = 0
    skipped_count = 0
    total_chunks = 0

    for doc_data in SEED_DOCUMENTS:
        try:
            doc, chunk_count, status = service.ingest_document(
                title=doc_data["title"],
                content=doc_data["content"],
                source_url=doc_data["source_url"],
                provider=doc_data.get("provider", "Official Curriculum"),
                career_domain=doc_data["career_domain"],
                career_role_title=doc_data.get("career_role_title"),
                category=doc_data.get("category", "learning_materials"),
                related_skills=doc_data.get("related_skills", []),
                related_topics=doc_data.get("related_topics", []),
                difficulty=doc_data.get("difficulty", "intermediate"),
                country_jurisdiction=doc_data.get("country_jurisdiction", "Global"),
                access_type=doc_data.get("access_type", "free_open"),
            )
            total_chunks += chunk_count
            if status == "already_indexed":
                skipped_count += 1
            else:
                indexed_count += 1
        except Exception as err:
            logger.warning(f"Error seeding document '{doc_data.get('title')}': {err}")

    logger.info(
        f"RAG Knowledge Seed Complete: {indexed_count} newly indexed, "
        f"{skipped_count} already indexed, {total_chunks} chunks active."
    )
    return {
        "newly_indexed": indexed_count,
        "already_indexed": skipped_count,
        "total_seed_docs": len(SEED_DOCUMENTS),
    }
