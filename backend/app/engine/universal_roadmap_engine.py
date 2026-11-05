"""
Universal Interactive Career Roadmap Engine for RoadmapIQ.
Dynamically generates comprehensive, personalized, career-specific learning journeys
across all 18 academic domains and 259+ careers.

Supports domain-specific learning methods:
- Technology & AI: Coding, debugging, algorithm implementation
- Commerce & Finance: Financial modeling, auditing, balance sheets, Excel
- Healthcare & Life Sciences: Clinical trial analysis, case ethics, bioinformatics
- Law & Legal: Case briefing (IRAC), statutory drafting, contract clauses
- Design & Creative: Design briefs, Figma tokens, heuristic evaluations
- Government & Public Policy: Syllabus modules, policy briefs, mock exams
- Core Engineering: Stress calculations, thermodynamics, CAD simulations
- Business & Management: Case studies, market analysis, PRDs, unit economics
- Agriculture & Environment: ESG carbon audits, agronomic balance, soil health
"""
import math
import logging
from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy.orm import Session

from app.models import (
    CareerRole,
    Skill,
    RoleSkillRequirement,
    SkillPrerequisite,
    LearningResource,
    Project,
    Roadmap,
    RoadmapTask,
    TaskResource,
    StudentProfile,
)
from app.engine.free_learning_resources_data import VERIFIED_FREE_RESOURCES

logger = logging.getLogger("roadmapiq.universal_roadmap_engine")

# ---------------------------------------------------------------------------
# Domain Method & Workspace Mapping
# ---------------------------------------------------------------------------
DOMAIN_METHOD_CONFIG = {
    "Technology and IT": {
        "method": "coding",
        "badge": "Code Implementation",
        "deliverable_type": "Git Repository / Script",
        "practice_label": "Coding Exercises & Unit Tests",
        "simulation_label": "Software Architecture Build",
        "eval_label": "Code Execution & Test Cases",
    },
    "Artificial Intelligence & Machine Learning": {
        "method": "coding",
        "badge": "Model & Pipeline Dev",
        "deliverable_type": "Jupyter Notebook & Weights",
        "practice_label": "Tensor / Data Wrangling Drills",
        "simulation_label": "Predictive Pipeline Deployment",
        "eval_label": "Model Accuracy & Validation",
    },
    "Data Science & Analytics": {
        "method": "coding",
        "badge": "SQL & Data Pipeline",
        "deliverable_type": "SQL Script & Tableau Dashboard",
        "practice_label": "Statistical SQL Queries",
        "simulation_label": "Exploratory Dataset Investigation",
        "eval_label": "Query Performance & Insights",
    },
    "Commerce, Finance & Banking": {
        "method": "financial_model",
        "badge": "Financial Modeling & Audit",
        "deliverable_type": "Excel Workbook / Financial Model",
        "practice_label": "Ledger Balancing & Ratio Drills",
        "simulation_label": "3-Statement Valuation Model",
        "eval_label": "Formula Integrity & Financial Ratios",
    },
    "Arts, Humanities & Social Sciences": {
        "method": "research_essay",
        "badge": "Scholarly Research & Analysis",
        "deliverable_type": "Analytical Monograph / Editorial",
        "practice_label": "Source Critique & Historiography",
        "simulation_label": "Investigative Research Report",
        "eval_label": "Argumentative Rigor & Source Citation",
    },
    "Business, Management & Consulting": {
        "method": "business_case",
        "badge": "Case Study & Strategy Deck",
        "deliverable_type": "PRD / Strategic Executive Deck",
        "practice_label": "Market Sizing & 5 Forces Analysis",
        "simulation_label": "Consulting Case Bottleneck Audit",
        "eval_label": "Business Logic & Unit Economics",
    },
    "Healthcare, Medicine & Life Sciences": {
        "method": "clinical_case",
        "badge": "Biomedical Case Analysis",
        "deliverable_type": "Clinical Protocol / Data Paper",
        "practice_label": "Diagnostic Heuristics & Ethics",
        "simulation_label": "Epidemiological Protocol Simulation",
        "eval_label": "Scientific Validity & Ethical Standards",
    },
    "Core Engineering": {
        "method": "engineering_calc",
        "badge": "Technical Calculations & CAD",
        "deliverable_type": "Engineering Calculation Sheet / CAD",
        "practice_label": "Thermodynamic & Stress Calculations",
        "simulation_label": "Component Parametric Design",
        "eval_label": "Tolerance & Factor of Safety Check",
    },
    "Cybersecurity & Information Security": {
        "method": "security_audit",
        "badge": "Threat Hunting & Defense",
        "deliverable_type": "Vulnerability Assessment Report",
        "practice_label": "Log Parsing & Packet Analysis",
        "simulation_label": "Zero-Trust Penetration Audit",
        "eval_label": "Threat Identification & Remediation",
    },
    "Cloud, DevOps & Systems Engineering": {
        "method": "cloud_infra",
        "badge": "Infrastructure as Code",
        "deliverable_type": "Terraform / Kubernetes Manifest",
        "practice_label": "CI/CD Pipeline Configurations",
        "simulation_label": "High-Availability Cluster Deployment",
        "eval_label": "Manifest Validation & Reliability",
    },
    "Law & Legal Services": {
        "method": "legal_draft",
        "badge": "Statutory Analysis & Drafting",
        "deliverable_type": "Contract Clause / Appellate Brief",
        "practice_label": "IRAC Case Briefing Exercises",
        "simulation_label": "Commercial Contract Negotiation Brief",
        "eval_label": "Precedent Alignment & Statutory Rigor",
    },
    "Education, Teaching & Academic Research": {
        "method": "curriculum_plan",
        "badge": "Pedagogy & Curriculum Design",
        "deliverable_type": "Instructional Unit Plan",
        "practice_label": "Bloom's Taxonomy Rubric Design",
        "simulation_label": "Multi-Week Curriculum Framework",
        "eval_label": "Pedagogical Clarity & Rubric Balance",
    },
    "Government, Civil Services & Public Policy": {
        "method": "syllabus_prep",
        "badge": "Public Policy & GS Syllabus",
        "deliverable_type": "Policy Brief & Examination Script",
        "practice_label": "General Studies Essay Structuring",
        "simulation_label": "District Governance Action Plan",
        "eval_label": "Constitutional Compliance & Feasibility",
    },
    "Psychology & Behavioral Sciences": {
        "method": "psychology_case",
        "badge": "Behavioral Assessment & Nudge",
        "deliverable_type": "Case Conceptualization Protocol",
        "practice_label": "Cognitive Heuristic Diagnostics",
        "simulation_label": "Organizational Culture Intervention",
        "eval_label": "Evidence-Based Rationale & Ethics",
    },
    "Design, Media & Creative Arts": {
        "method": "design_brief",
        "badge": "Design Brief & Prototype",
        "deliverable_type": "Figma Prototype & Design Spec",
        "practice_label": "Typography & Auto-Layout Drills",
        "simulation_label": "Multi-Screen Design System",
        "eval_label": "Accessibility, Usability & Hierarchy",
    },
    "Hospitality, Tourism & Event Management": {
        "method": "hospitality_ops",
        "badge": "Operations & Guest Experience",
        "deliverable_type": "Standard Operating Procedure (SOP)",
        "practice_label": "Yield Management Rate Calculations",
        "simulation_label": "Luxury Resort Conference Run of Show",
        "eval_label": "Operational Efficiency & Hospitality SLA",
    },
    "Agriculture, Environment & Sustainability": {
        "method": "field_analysis",
        "badge": "Agro-Ecological & ESG Audit",
        "deliverable_type": "GHG Protocol Audit & Soil Plan",
        "practice_label": "Nutrient Balance & Carbon Ledger",
        "simulation_label": "Regenerative Farm Transition Plan",
        "eval_label": "Scientific Accuracy & Sustainability ROI",
    },
    "Entrepreneurship & Startups": {
        "method": "startup_pitch",
        "badge": "Venture Model & MVP Brief",
        "deliverable_type": "Investor Deck & Unit Economics",
        "practice_label": "Customer Interview Synthesis",
        "simulation_label": "Go-to-Market Strategy & Financial Plan",
        "eval_label": "Problem-Solution Fit & Traction Model",
    },
}

DEFAULT_METHOD_CONFIG = {
    "method": "theory",
    "badge": "Core Professional Milestone",
    "deliverable_type": "Practical Deliverable Document",
    "practice_label": "Practical Application Exercises",
    "simulation_label": "Role Capstone Simulation",
    "eval_label": "Evaluation Rubrics",
}

# ---------------------------------------------------------------------------
# Domain Specialization Branches Mapping
# ---------------------------------------------------------------------------
DOMAIN_SPECIALIZATION_BRANCHES = {
    "Technology and IT": [
        {"id": "cloud_microservices", "title": "Cloud Microservices & Distributed Architecture", "focus": "Docker, Kubernetes, Event-Driven Architecture, High Availability"},
        {"id": "fullstack_modern", "title": "Full Stack Modern Systems & Real-time Web", "focus": "Modern Frontend Frameworks, WebSockets, REST/gRPC APIs, Database Indexing"},
        {"id": "qa_automation", "title": "Enterprise Quality Assurance & Chaos Engineering", "focus": "End-to-End Test Automation, Load Testing, CI/CD Integration"},
    ],
    "Commerce, Finance & Banking": [
        {"id": "corp_audit", "title": "Corporate Audit, Taxation & IFRS Reporting", "focus": "Ind AS / IFRS compliance, Statutory Audit Checklists, Corporate Tax Planning"},
        {"id": "investment_banking", "title": "Investment Banking, M&A & Private Equity", "focus": "Discounted Cash Flow, Comparable Companies, LBO Modeling, Pitch Decks"},
        {"id": "wealth_portfolio", "title": "Wealth Management & Algorithmic Trading", "focus": "Modern Portfolio Theory, Risk-Adjusted Returns (Sharpe/Sortino), Quantitative Screening"},
    ],
    "Healthcare, Medicine & Life Sciences": [
        {"id": "clinical_trials", "title": "Clinical Research Operations & Pharmacovigilance", "focus": "GCP Guidelines, Trial Protocol Design, Adverse Event Reporting"},
        {"id": "health_informatics", "title": "Healthcare Informatics & FHIR Interoperability", "focus": "HL7 FHIR Standards, Electronic Health Records (EHR), Medical Coding"},
        {"id": "bioinformatics", "title": "Genomics & Computational Life Sciences", "focus": "Sequence Alignment, R/Bioconductor, Molecular Modeling, Variant Calling"},
    ],
    "Law & Legal Services": [
        {"id": "corp_transactions", "title": "Corporate Mergers, Acquisitions & Financing", "focus": "Due Diligence, Term Sheets, Share Purchase Agreements, Regulatory Filings"},
        {"id": "dispute_litigation", "title": "Appellate Litigation & Commercial Arbitration", "focus": "Pleadings, Oral Advocacy Briefs, Evidence Analysis, Moot Protocols"},
        {"id": "ip_technology", "title": "Intellectual Property, Patents & Tech Law", "focus": "Patent Searches, Trademark Registrations, Software Licensing, GDPR/Data Privacy"},
    ],
    "Design, Media & Creative Arts": [
        {"id": "design_systems", "title": "Enterprise Design Systems & UI Architecture", "focus": "Design Tokens, Component Libraries, Accessibility (WCAG AAA), Developer Handoff"},
        {"id": "user_research", "title": "Advanced User Research & Product Discovery", "focus": "Usability Lab Testing, Ethnographic Studies, Information Architecture, Heuristic Audits"},
        {"id": "motion_interaction", "title": "Micro-Interactions & 3D Visual Experience", "focus": "Framer Motion, Spline 3D, Micro-animations, Spatial Canvas Interaction"},
    ],
    "Government, Civil Services & Public Policy": [
        {"id": "civil_admin", "title": "District Governance & Public Administration", "focus": "General Studies I-IV, District Administration Protocols, Disaster Management"},
        {"id": "policy_analysis", "title": "Public Policy Research & Economic Planning", "focus": "Quantitative Policy Impact, NITI White Papers, Regulatory Impact Assessments"},
        {"id": "foreign_service", "title": "Diplomatic Affairs & International Relations", "focus": "Bilateral Treaties, Multilateral Organizations, Geopolitical Strategy"},
    ],
    "Core Engineering": [
        {"id": "cad_fea", "title": "Computational FEA & Mechanical Simulations", "focus": "ANSYS Structural Analysis, Thermal Heat Transfer, Parametric Optimization"},
        {"id": "embedded_iot", "title": "Mechatronics, Robotics & Embedded Control", "focus": "Microcontrollers (ARM/ESP32), Real-Time Operating Systems, Sensor Arrays"},
        {"id": "power_energy", "title": "Sustainable Power Systems & Smart Grids", "focus": "Renewable Integration, High-Voltage Transmission, Battery Storage Modeling"},
    ],
    "Business, Management & Consulting": [
        {"id": "product_growth", "title": "Digital Product Management & Growth Loops", "focus": "PLG (Product-Led Growth), AARRR Funnels, User Retention Modeling, A/B Experiments"},
        {"id": "management_consulting", "title": "Management Consulting & Corporate Restructuring", "focus": "MECE Problem Solving, Value Stream Mapping, Profitability Trees, C-Suite Storytelling"},
        {"id": "supply_chain", "title": "Global Operations & Supply Chain Optimization", "focus": "Six Sigma, Inventory Optimization (EOQ), Logistics Routing, Vendor Risk"},
    ],
}


def get_domain_config(domain: str) -> Dict[str, Any]:
    """Returns domain-tailored learning methods and UI badge configurations."""
    for d_name, cfg in DOMAIN_METHOD_CONFIG.items():
        if d_name.lower() in domain.lower() or domain.lower() in d_name.lower():
            return cfg
    return DEFAULT_METHOD_CONFIG


def get_specialization_branches(domain: str) -> List[Dict[str, str]]:
    """Returns 2-3 specialization tracks for the given domain."""
    for d_name, branches in DOMAIN_SPECIALIZATION_BRANCHES.items():
        if d_name.lower() in domain.lower() or domain.lower() in d_name.lower():
            return branches
    return [
        {"id": "core_professional", "title": "Core Professional Practice", "focus": "Foundational competencies and end-to-end industry execution"},
        {"id": "advanced_strategy", "title": "Strategic Leadership & Consulting", "focus": "Advanced optimization, organizational leadership, and executive deliverables"},
    ]


# ---------------------------------------------------------------------------
# Dynamic Curriculum Synthesis & Seeding for All 259 Roles
# ---------------------------------------------------------------------------
def ensure_role_curriculum_requirements(role: CareerRole, db: Session) -> List[RoleSkillRequirement]:
    """
    Guarantees that ANY career from ANY domain has authentic, structured
    Skill and RoleSkillRequirement records in the database.
    Synthesizes skills from role.core_competencies and role.tools_and_technologies if absent.
    """
    reqs = db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == role.id).all()
    if reqs and len(reqs) >= 4:
        return reqs

    competencies = role.core_competencies or []
    tools = role.tools_and_technologies or []
    subdomain = role.subdomain or role.category or "Specialization"
    domain = role.domain or "Professional Discipline"

    # If competencies are somehow empty, create authentic defaults based on title
    if not competencies:
        competencies = [
            f"{role.title} Core Foundations",
            f"{subdomain} Principles & Methodologies",
            f"Analytical Problem Solving in {subdomain}",
            f"Advanced Application & Execution",
            f"Professional Ethics & Standards"
        ]

    created_reqs = []
    created_skills = []

    # 1. Competency Skills
    for idx, comp_name in enumerate(competencies):
        slug = f"{role.slug}-comp-{idx + 1}"
        skill = db.query(Skill).filter(Skill.slug == slug).first()
        if not skill:
            skill = Skill(
                slug=slug,
                name=comp_name,
                category=domain,
                description=f"Core competency in {comp_name} essential for practical excellence as a {role.title}.",
                doc_url="https://en.wikipedia.org/wiki/" + comp_name.replace(" ", "_"),
                difficulty_level="intermediate" if idx > 1 else "beginner",
                assessment_method="case_study" if "Finance" in domain or "Law" in domain else "quiz",
                estimated_hours_beginner=10,
                estimated_hours_intermediate=20,
                estimated_hours_advanced=30,
            )
            db.add(skill)
            db.flush()

        req = RoleSkillRequirement(
            role_id=role.id,
            skill_id=skill.id,
            required_proficiency=3 if idx < 2 else 4,
            is_core=True if idx < 3 else False,
            importance_weight=5 if idx < 2 else 4
        )
        db.add(req)
        created_reqs.append(req)
        created_skills.append(skill)

    # 2. Tool Skills
    for idx, tool_name in enumerate(tools[:4]):
        slug = f"{role.slug}-tool-{idx + 1}"
        skill = db.query(Skill).filter(Skill.slug == slug).first()
        if not skill:
            skill = Skill(
                slug=slug,
                name=tool_name,
                category=f"{domain} Tools",
                description=f"Industry-standard tool {tool_name} used daily by professional {role.title}s.",
                doc_url="https://en.wikipedia.org/wiki/" + tool_name.replace(" ", "_"),
                difficulty_level="beginner" if idx == 0 else "intermediate",
                assessment_method="practice",
                estimated_hours_beginner=8,
                estimated_hours_intermediate=16,
                estimated_hours_advanced=24,
            )
            db.add(skill)
            db.flush()

        req = RoleSkillRequirement(
            role_id=role.id,
            skill_id=skill.id,
            required_proficiency=3,
            is_core=True,
            importance_weight=4
        )
        db.add(req)
        created_reqs.append(req)
        created_skills.append(skill)

    # 3. Create prerequisite dependencies between the skills
    if len(created_skills) >= 2:
        for i in range(1, len(created_skills)):
            target = created_skills[i]
            prereq = created_skills[i - 1]
            existing_prereq = db.query(SkillPrerequisite).filter(
                SkillPrerequisite.skill_id == target.id,
                SkillPrerequisite.prerequisite_skill_id == prereq.id
            ).first()
            if not existing_prereq:
                db.add(SkillPrerequisite(skill_id=target.id, prerequisite_skill_id=prereq.id))

    db.commit()
    logger.info(f"Synthesized {len(created_reqs)} curriculum requirements for {role.title} ({domain}).")
    return db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == role.id).all()


# ---------------------------------------------------------------------------
# Universal Workspace Data Synthesizer
# ---------------------------------------------------------------------------
def synthesize_milestone_workspace(
    title: str,
    phase_number: int,
    phase_name: str,
    role: CareerRole,
    domain_cfg: Dict[str, Any],
    resources: List[Dict[str, Any]],
    week_number: int
) -> Dict[str, Any]:
    """
    Constructs the full 5-part learning workspace for any milestone:
    A. Learn (Explanations, concept summary, workflow diagram, verified resources)
    B. Practice (Beginner, intermediate, advanced exercises + scenario challenge)
    C. AI Tutor (Pre-configured prompt actions)
    D. Build (Practical project / simulation brief, rubrics, deliverable format)
    E. Evaluate (3-question diagnostic quiz, criteria checklist)
    """
    method = domain_cfg.get("method", "theory")
    role_title = role.title
    domain = role.domain or "Professional Practice"

    # 1. Learn Section
    explanation = (
        f"Mastering '{title}' is an essential milestone in the {role_title} curriculum. "
        f"In professional {domain.lower()} environments, practitioners rely on this competency to navigate daily workflows, "
        f"eliminate friction in technical and analytical deliverables, and build verifiable outcomes."
    )
    summary = (
        f"• Core Objective: Understand and implement principles of {title}.\n"
        f"• Professional Impact: Directly applied in {role.subdomain or 'the industry'} workflows.\n"
        f"• Practical Deliverable: {domain_cfg.get('deliverable_type', 'Working Document')}."
    )
    diagram = (
        f"┌───────────────────────────┐\n"
        f"│   Foundations: {title}    │\n"
        f"└─────────────┬─────────────┘\n"
        f"              ▼              \n"
        f"┌───────────────────────────┐\n"
        f"│  {domain_cfg.get('practice_label', 'Practical Application')}  │\n"
        f"└─────────────┬─────────────┘\n"
        f"              ▼              \n"
        f"┌───────────────────────────┐\n"
        f"│ Capstone: {role_title} Output │\n"
        f"└───────────────────────────┘"
    )

    # 2. Practice Exercises
    exercises = {
        "coding": {
            "beginner": f"Write a clean implementation showcasing the core logic of {title}.",
            "intermediate": f"Refactor your solution to handle edge cases, error conditions, and async/memory bounds.",
            "advanced": f"Benchmark throughput and write integration tests verifying reliability under concurrent load.",
            "scenario": f"Scenario: A critical service in the {role_title} stack throws unexpected exceptions. Debug and patch the root cause."
        },
        "financial_model": {
            "beginner": f"Set up basic assumptions and calculate core ratios for {title}.",
            "intermediate": f"Construct a dynamic 3-statement forecast linking Income Statement, Balance Sheet, and Cash Flow.",
            "advanced": f"Perform a two-variable sensitivity analysis (WACC vs Terminal Growth) and document findings.",
            "scenario": f"Scenario: Management expects a 15% revenue drop. Model liquidity survival and recommend capital allocation changes."
        },
        "clinical_case": {
            "beginner": f"Define key physiological / biochemical mechanisms and diagnostic indicators for {title}.",
            "intermediate": f"Review patient cohort data and construct a differential analysis matrix.",
            "advanced": f"Design an observational clinical protocol with ethical compliance considerations.",
            "scenario": f"Scenario: An unexpected adverse event arises during research. Formulate an incident review report adhering to GCP."
        },
        "legal_draft": {
            "beginner": f"Draft a 1-page case brief using the IRAC method (Issue, Rule, Application, Conclusion).",
            "intermediate": f"Draft standard indemnification, limitation of liability, and governing law clauses for a commercial contract.",
            "advanced": f"Analyze conflicting statutory precedents and draft an appellate advocacy memorandum.",
            "scenario": f"Scenario: A client faces a potential breach of contract claim. Identify defense arguments and settlement terms."
        },
        "design_brief": {
            "beginner": f"Create a mood board and typographic hierarchy scale for {title}.",
            "intermediate": f"Design a 3-screen responsive layout utilizing Auto-Layout and design tokens in Figma.",
            "advanced": f"Run a cognitive walkthrough audit identifying friction points against Nielsen's 10 Heuristics.",
            "scenario": f"Scenario: User drop-off during onboarding is 42%. Redesign the flow to reduce cognitive friction."
        },
        "syllabus_prep": {
            "beginner": f"Summarize key constitutional articles, policies, and factual timelines relevant to {title}.",
            "intermediate": f"Draft a structured 250-word answer examining the socio-economic impacts of this topic.",
            "advanced": f"Critically evaluate conflicting stakeholder viewpoints and propose pragmatic administrative solutions.",
            "scenario": f"Scenario: District administration faces public service delivery delays. Formulate a citizen-centric action plan."
        },
        "engineering_calc": {
            "beginner": f"Calculate fundamental loads, voltages, or mass-energy balances for {title}.",
            "intermediate": f"Perform a parametric finite element or circuit simulation verifying safety margins.",
            "advanced": f"Optimize the design for manufacturability (DFM) and minimum material cost under operating constraints.",
            "scenario": f"Scenario: Thermal dissipation exceeds design limits by 20%. Re-engineer cooling channels to preserve stability."
        },
        "business_case": {
            "beginner": f"Conduct a SWOT and 5-Forces analysis for {title} in a target market.",
            "intermediate": f"Map customer acquisition channels, calculate CAC & LTV, and identify viral loops.",
            "advanced": f"Draft a comprehensive Product Requirements Document (PRD) with user stories and release metrics.",
            "scenario": f"Scenario: A well-funded competitor enters the market at half your price. Propose a defensible differentiation strategy."
        },
    }

    practice_data = exercises.get(method, exercises["coding"])

    # 3. Build Project Simulation
    build_data = {
        "title": f"Practical Deliverable: {title}",
        "brief": f"Act as a professional {role_title}. Apply principles of {title} to build a production-grade portfolio deliverable.",
        "deliverable_format": domain_cfg.get("deliverable_type", "Comprehensive PDF / Repository Link"),
        "evaluation_rubrics": [
            "Technical/Analytical accuracy and completeness of the solution",
            "Adherence to industry conventions, formatting, and documentation clarity",
            "Practical applicability and consideration of real-world constraints",
        ],
    }

    # 4. Evaluate Quiz
    evaluate_data = {
        "checkpoint_quiz": [
            {
                "question": f"What is the foundational objective of implementing {title} in professional {role_title} workflows?",
                "options": {
                    "a": f"To establish robust, verifiable standards and minimize structural operational risk",
                    "b": "To fulfill nominal compliance checklists without practical integration",
                    "c": "To bypass prerequisite testing and accelerate arbitrary releases",
                    "d": "To avoid collaborative documentation across cross-functional teams"
                },
                "correct_option": "a",
                "explanation": f"In {domain}, establishing standardized methodology and mitigating operational risk is the primary reason for {title} mastery."
            },
            {
                "question": f"When encountering conflicting requirements or edge cases in {title}, what is the best practice?",
                "options": {
                    "a": "Disregard edge cases and assume optimal conditions",
                    "b": "Analyze trade-offs, document constraints, and apply systematic testing or sensitivity analysis",
                    "c": "Outsource decision-making without empirical data",
                    "d": "Pause the entire organization indefinitely"
                },
                "correct_option": "b",
                "explanation": f"Systematic trade-off analysis and empirical testing represent the gold standard across all {domain} disciplines."
            },
            {
                "question": f"What serves as the primary verification artifact for demonstrating {title} competence?",
                "options": {
                    "a": "Simply reading documentation without applying the knowledge",
                    "b": f"Producing a verifiable deliverable ({domain_cfg.get('deliverable_type', 'portfolio artifact')}) with measurable outcomes",
                    "c": "Self-reporting completion without practical evidence",
                    "d": "Completing unrelated trivia questions"
                },
                "correct_option": "b",
                "explanation": f"RoadmapIQ progress requires verifiable practical deliverables and tangible deliverables."
            }
        ],
        "criteria": [
            f"Studied conceptual explanations and official references for {title}",
            f"Completed at least one practical drill in {domain_cfg.get('practice_label', 'practical activities')}",
            f"Attached verifiable deliverable link ({domain_cfg.get('deliverable_type', 'proof of work')})"
        ]
    }

    return {
        "learn": {
            "topic_explanation": explanation,
            "concept_summary": summary,
            "workflow_diagram": diagram,
            "resources": resources,
        },
        "practice": practice_data,
        "ai_tutor": {
            "suggested_prompts": [
                f"Explain {title} in simple terms with an everyday analogy",
                f"Generate structured revision notes for {title}",
                f"Create 5 quick flashcards to test my memory on {title}",
                f"Walk me through a real-world example of how a {role_title} uses {title}",
                f"What are the top 3 mistakes beginners make when learning {title}?"
            ]
        },
        "build": build_data,
        "evaluate": evaluate_data,
    }


# ---------------------------------------------------------------------------
# Universal Roadmap Generation Execution
# ---------------------------------------------------------------------------
def generate_universal_career_roadmap(
    role: CareerRole,
    profile: StudentProfile,
    weekly_hours: int,
    target_duration_weeks: int,
    specialization_branch: Optional[str] = None,
    student_skills: Optional[Dict[str, int]] = None,
    db: Session = None,
    preferred_format: str = "mixed"
) -> Roadmap:
    """
    Main entry point for generating dynamic, career-specific roadmaps for ANY role.
    """
    if db is None:
        raise ValueError("Database session required for roadmap generation.")

    weekly_hours = max(3, min(60, weekly_hours or 15))
    target_duration_weeks = max(2, min(52, target_duration_weeks or 12))

    # 1. Ensure curriculum requirements exist for this role
    requirements = ensure_role_curriculum_requirements(role, db)
    domain_cfg = get_domain_config(role.domain or "Technology")
    specializations = get_specialization_branches(role.domain or "Technology")
    active_branch = specialization_branch or (specializations[0]["id"] if specializations else "core")

    # 2. Gather Verified Free Resources matching this domain
    domain_resources = [r for r in VERIFIED_FREE_RESOURCES if r["domain"].lower() == (role.domain or "").lower()]
    if not domain_resources:
        # Fallback to general educational portals
        domain_resources = [
            {"title": f"{role.title} Official Knowledge Portal", "url": "https://en.wikipedia.org/wiki/" + role.title.replace(" ", "_"), "provider": "Open Educational Reference", "format": "documentation"},
            {"title": "Khan Academy Open Lessons", "url": "https://www.khanacademy.org", "provider": "Khan Academy", "format": "course"},
            {"title": "Harvard & MIT OpenCourseWare", "url": "https://ocw.mit.edu", "provider": "MIT OpenCourseWare", "format": "course"},
        ]

    # 3. Create or Update Roadmap Entity
    roadmap = Roadmap(
        profile_id=profile.id,
        role_id=role.id,
        target_duration_weeks=target_duration_weeks,
        weekly_hours=weekly_hours,
        readiness_score=45.0,
        total_estimated_hours=weekly_hours * target_duration_weeks,
        is_over_capacity=False,
        summary=f"Personalized {target_duration_weeks}-week {role.title} learning adventure in {role.domain}. Structured into 5 progressive stages from foundational principles to capstone deliverables and industry placement.",
    )
    db.add(roadmap)
    db.flush()

    # 4. Generate Structured 5-Phase Tasks
    phases = [
        {"num": 1, "name": "Phase 1: Foundations & Core Principles", "category": "LEARN", "quest": "skill_quest"},
        {"num": 2, "name": "Phase 2: Technical Tools & Analytical Workflows", "category": "PRACTICE", "quest": "skill_quest"},
        {"num": 3, "name": f"Phase 3: Advanced Competencies ({active_branch.replace('_', ' ').title()})", "category": "BUILD", "quest": "weekly_mission"},
        {"num": 4, "name": "Phase 4: Practical Capstone Simulation", "category": "BUILD", "quest": "epic_project"},
        {"num": 5, "name": "Phase 5: Professional Placement & Licensure Prep", "category": "PREPARE", "quest": "boss"},
    ]

    total_tasks_needed = max(8, min(24, target_duration_weeks * 2))
    tasks_per_phase = max(1, total_tasks_needed // len(phases))

    days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    current_task_idx = 0

    for phase in phases:
        p_num = phase["num"]
        p_name = phase["name"]

        # Select matching requirements or competencies for this phase
        for p_task_idx in range(tasks_per_phase):
            req_idx = current_task_idx % len(requirements)
            req = requirements[req_idx]
            skill = req.skill

            current_task_idx += 1
            week_num = min(target_duration_weeks, math.ceil((current_task_idx / total_tasks_needed) * target_duration_weeks))
            day_name = days_of_week[p_task_idx % len(days_of_week)]

            task_title = f"{skill.name} Mastery" if p_num < 4 else (
                f"{role.title} Capstone Simulation Project" if p_num == 4 else f"{role.title} Interview & Licensure Preparation"
            )

            # Build rich workspace
            workspace = synthesize_milestone_workspace(
                title=task_title,
                phase_number=p_num,
                phase_name=p_name,
                role=role,
                domain_cfg=domain_cfg,
                resources=domain_resources[:3],
                week_number=week_num,
            )

            task = RoadmapTask(
                roadmap_id=roadmap.id,
                skill_id=skill.id if p_num < 4 else None,
                phase_number=p_num,
                phase_name=p_name,
                week_number=week_num,
                order_in_week=p_task_idx + 1,
                day_of_week=day_name,
                day_number=(p_task_idx % 5) + 1,
                activity_category=phase["category"],
                quest_type=phase["quest"],
                title=task_title,
                skill_category=skill.category if skill else role.domain,
                task_type="project" if p_num == 4 else ("interview" if p_num == 5 else "theory"),
                description=f"Master {task_title} using domain-tailored {domain_cfg['badge']} methods. Build practical artifacts and verify competency.",
                estimated_hours=max(2, weekly_hours // tasks_per_phase),
                actual_hours_spent=0.0,
                priority="High" if p_num in [1, 4] else "Medium",
                status="not_started",
                is_completed=False,
                completion_criteria=f"Complete recommended study materials, practice exercises, and verify the {domain_cfg['deliverable_type']}.",
                deliverable=f"{task_title} {domain_cfg['deliverable_type']}",
                xp_reward=100 if p_num in [4, 5] else 50,
                mission_title=f"{p_name} • Mission #{current_task_idx}",
                activity_method=domain_cfg["method"],
                specialization_branch=active_branch,
                workspace_data=workspace,
                practice_exercises=[
                    workspace["practice"]["beginner"],
                    workspace["practice"]["intermediate"],
                    workspace["practice"]["advanced"],
                ],
                quiz_data=workspace["evaluate"]["checkpoint_quiz"],
            )
            db.add(task)
            db.flush()

            # Attach resources to task
            for res_item in domain_resources[:2]:
                tr = TaskResource(
                    task_id=task.id,
                    title=res_item.get("title", f"{task_title} Resource"),
                    url=res_item.get("url", "https://roadmap.sh"),
                    provider=res_item.get("provider", "RoadmapIQ Verified Open Access"),
                    format=res_item.get("format", "documentation")
                )
                db.add(tr)

    db.commit()
    db.refresh(roadmap)
    logger.info(f"Generated universal roadmap #{roadmap.id} for {role.title} with {len(roadmap.tasks)} tasks.")
    return roadmap
