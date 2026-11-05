"""
Career-Based Assessment Seed Data for RoadmapIQ.
Contains all 13 targeted technical careers with:
- Career metadata (tools, competencies, duration, difficulty distribution)
- Core skill requirements
- Complete, realistic question banks (25 balanced questions per career) across:
  Fundamentals (40%), Intermediate (30%), Practical/Scenario/Code (20%), Advanced (10%).
"""
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.models import (
    CareerRole,
    Skill,
    RoleSkillRequirement,
    CareerAssessmentQuestion,
)

CAREERS_CATALOGUE = [
    {
        "slug": "java-developer",
        "title": "Java Developer",
        "category": "Software Engineering",
        "description": "Engineers scalable, high-concurrency enterprise backends, microservices, and distributed systems using modern Java, Spring Boot, and robust data persistence architectures.",
        "short_summary": "Core Java, JVM internals, Spring Boot microservices, multithreading, and RESTful APIs.",
        "market_demand": "Very High",
        "average_salary_range": "₹8 - 22 LPA",
        "icon": "Coffee",
        "tools_and_technologies": [
            "Java 17/21", "Spring Boot", "Hibernate / JPA", "PostgreSQL",
            "Maven / Gradle", "Docker", "JUnit 5", "Git", "Kafka", "Redis"
        ],
        "core_competencies": [
            "Java Fundamentals", "Object-Oriented Programming", "Data Structures & Algorithms",
            "Collections Framework", "Exception Handling", "Multithreading & Concurrency",
            "SQL & DBMS", "JDBC & Persistence", "Spring Boot", "REST APIs",
            "Problem Solving", "Debugging"
        ],
        "assessment_duration_mins": 30,
        "assessment_question_count": 25,
        "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
    },
    {
        "slug": "python-developer",
        "title": "Python Developer",
        "category": "Software Engineering",
        "description": "Develops robust backend APIs, automation workflows, asynchronous microservices, and data integration pipelines using Python, modern web frameworks, and relational databases.",
        "short_summary": "Python internals, OOP, Fast/Django APIs, SQL, and algorithmic problem solving.",
        "market_demand": "Very High",
        "average_salary_range": "₹7 - 20 LPA",
        "icon": "FileCode",
        "tools_and_technologies": [
            "Python 3.12", "FastAPI", "Django", "SQLAlchemy", "PostgreSQL",
            "PyTest", "Celery", "Docker", "Git", "Redis"
        ],
        "core_competencies": [
            "Python Fundamentals", "Data Types & Memory", "Functions & Decorators",
            "Object-Oriented Programming", "Exception Handling", "Collections & Iterables",
            "File Handling & I/O", "Data Structures & Algorithms", "SQL & Database Access",
            "Problem Solving"
        ],
        "assessment_duration_mins": 30,
        "assessment_question_count": 25,
        "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
    },
    {
        "slug": "full-stack-developer",
        "title": "Full Stack Developer",
        "category": "Software Engineering",
        "description": "Bridges responsive client user experiences and resilient server backends, developing full-stack web applications, RESTful/GraphQL APIs, and database models.",
        "short_summary": "End-to-end web engineering with React, Node/Python backends, databases, and DevOps.",
        "market_demand": "Very High",
        "average_salary_range": "₹8 - 24 LPA",
        "icon": "Layers",
        "tools_and_technologies": [
            "React.js", "Node.js / Express", "TypeScript", "PostgreSQL",
            "Tailwind CSS", "REST APIs", "Docker", "Git", "JWT Auth", "Prisma / SQLAlchemy"
        ],
        "core_competencies": [
            "Frontend Fundamentals", "React State & Hooks", "Backend API Architecture",
            "Database Design & SQL", "Authentication & Security", "Version Control & Git",
            "DevOps & Deployment", "Full-Stack System Integration"
        ],
        "assessment_duration_mins": 30,
        "assessment_question_count": 25,
        "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
    },
    {
        "slug": "frontend-developer",
        "title": "Frontend Developer",
        "category": "Software Engineering",
        "description": "Crafts performant, accessible, and interactive user interfaces using modern JavaScript/TypeScript, React, state management, and responsive CSS systems.",
        "short_summary": "Modern JavaScript/TypeScript, React, UI state, performance profiling, and web accessibility.",
        "market_demand": "High",
        "average_salary_range": "₹6 - 18 LPA",
        "icon": "Layout",
        "tools_and_technologies": [
            "JavaScript ES6+", "TypeScript", "React", "Next.js",
            "Tailwind CSS", "Redux Toolkit", "Vite", "Jest / React Testing Library", "Git"
        ],
        "core_competencies": [
            "Modern JavaScript (ES6+)", "TypeScript Fundamentals", "React Core & Hooks",
            "State Management", "CSS & Responsive Design", "Web Performance & Optimization",
            "Web APIs & Asynchronous JS", "Testing & Accessibility (WCAG)"
        ],
        "assessment_duration_mins": 30,
        "assessment_question_count": 25,
        "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
    },
    {
        "slug": "backend-developer",
        "title": "Backend Developer",
        "category": "Software Engineering",
        "description": "Architects low-latency server-side business logic, database transactions, caching strategies, and distributed communication across microservices.",
        "short_summary": "Server architecture, relational & NoSQL databases, caching, concurrency, and security.",
        "market_demand": "Very High",
        "average_salary_range": "₹8 - 22 LPA",
        "icon": "Server",
        "tools_and_technologies": [
            "Python / Go / Java", "FastAPI / Spring Boot", "PostgreSQL",
            "Redis", "Docker", "Kafka / RabbitMQ", "Linux", "Git", "OpenAPI"
        ],
        "core_competencies": [
            "Server Architecture & HTTP", "RESTful API Design", "Relational DBMS & Query Tuning",
            "NoSQL & In-Memory Caching", "Concurrency & Asynchronous I/O", "Microservices & Message Queues",
            "Security & Authorization (OAuth/JWT)", "Performance Profiling"
        ],
        "assessment_duration_mins": 30,
        "assessment_question_count": 25,
        "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
    },
    {
        "slug": "software-engineer",
        "title": "Software Engineer",
        "category": "Software Engineering",
        "description": "Solves complex engineering problems through computer science fundamentals, algorithm optimization, clean object-oriented design, and scalable systems architecture.",
        "short_summary": "Core algorithms, data structures, design patterns, operating systems, and system design.",
        "market_demand": "Very High",
        "average_salary_range": "₹9 - 25 LPA",
        "icon": "Code2",
        "tools_and_technologies": [
            "C++ / Java / Python", "Data Structures & Algorithms", "Git",
            "Linux / POSIX", "SQL", "Docker", "CI/CD Pipelines", "System Design"
        ],
        "core_competencies": [
            "Computer Science Fundamentals", "Data Structures & Algorithms",
            "Object-Oriented Design & Patterns", "System Design & Architecture",
            "Database Systems & Indexing", "Operating Systems & Networking",
            "Testing & CI/CD", "Code Quality & Refactoring"
        ],
        "assessment_duration_mins": 30,
        "assessment_question_count": 25,
        "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
    },
    {
        "slug": "data-analyst",
        "title": "Data Analyst",
        "category": "Data & AI",
        "description": "Transforms raw transactional data into actionable business intelligence through complex SQL aggregations, Python data wrangling, and executive dashboard visualization.",
        "short_summary": "Advanced SQL, Python Pandas, data cleaning, exploratory data analysis, and Power BI.",
        "market_demand": "High",
        "average_salary_range": "₹5 - 14 LPA",
        "icon": "BarChart3",
        "tools_and_technologies": [
            "SQL (PostgreSQL/BigQuery)", "Python (Pandas, NumPy)", "Power BI",
            "Tableau", "Excel (Power Query)", "Git", "Statistics"
        ],
        "core_competencies": [
            "Excel & Spreadsheets", "SQL & Query Optimization", "Python for Data",
            "Pandas & NumPy", "Data Cleaning & Preprocessing", "Data Visualization",
            "Statistics & Probability", "Power BI / Business Intelligence", "Analytical Thinking"
        ],
        "assessment_duration_mins": 30,
        "assessment_question_count": 25,
        "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
    },
    {
        "slug": "data-scientist",
        "title": "Data Scientist",
        "category": "Data & AI",
        "description": "Formulates statistical hypotheses, engineers predictive machine learning models, conducts A/B testing, and derives quantitative insights from high-dimensional datasets.",
        "short_summary": "Statistical inference, supervised/unsupervised machine learning, feature engineering, and model validation.",
        "market_demand": "High",
        "average_salary_range": "₹8 - 22 LPA",
        "icon": "LineChart",
        "tools_and_technologies": [
            "Python", "Scikit-Learn", "Pandas & NumPy", "SciPy",
            "SQL", "Jupyter", "Matplotlib / Seaborn", "MLflow", "Git"
        ],
        "core_competencies": [
            "Exploratory Data Analysis (EDA)", "Statistical Inference & Hypothesis Testing",
            "Supervised Machine Learning", "Unsupervised Learning & Clustering",
            "Feature Engineering", "Model Evaluation & Cross-Validation",
            "Scikit-Learn & Python Stack", "ML in Production"
        ],
        "assessment_duration_mins": 30,
        "assessment_question_count": 25,
        "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
    },
    {
        "slug": "machine-learning-engineer",
        "title": "Machine Learning Engineer",
        "category": "Data & AI",
        "description": "Bridges research data science and high-throughput production software, deploying automated training pipelines, model serving microservices, and monitoring drift.",
        "short_summary": "Deep learning architectures, PyTorch, MLOps pipelines, model optimization, and low-latency inference.",
        "market_demand": "Very High",
        "average_salary_range": "₹10 - 26 LPA",
        "icon": "Cpu",
        "tools_and_technologies": [
            "Python", "PyTorch", "TensorFlow", "Docker",
            "FastAPI", "MLflow", "ONNX / TensorRT", "Kubernetes", "Git"
        ],
        "core_competencies": [
            "Mathematics for ML", "Deep Learning Fundamentals", "PyTorch / TensorFlow Frameworks",
            "MLOps & Model Versioning", "Model Optimization & Quantization", "Feature Pipelines",
            "Model Serving & Latency Tuning", "Monitoring & Drift Detection"
        ],
        "assessment_duration_mins": 30,
        "assessment_question_count": 25,
        "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
    },
    {
        "slug": "generative-ai-engineer",
        "title": "Generative AI Engineer",
        "category": "Data & AI",
        "description": "Builds next-generation generative AI products utilizing state-of-the-art Large Language Models, parameter-efficient fine-tuning (LoRA), RAG architectures, and vector search.",
        "short_summary": "Transformers, LLM fine-tuning, RAG retrieval systems, vector databases, and evaluation.",
        "market_demand": "Extremely High",
        "average_salary_range": "₹12 - 30 LPA",
        "icon": "Sparkles",
        "tools_and_technologies": [
            "Python", "Hugging Face Transformers", "Google Gemini API",
            "LangChain", "ChromaDB / Pinecone", "vLLM", "FastAPI", "PyTorch"
        ],
        "core_competencies": [
            "Transformer Architectures", "LLM Fine-Tuning (LoRA/QLoRA)", "Tokenization & Context Windows",
            "Prompt Engineering", "Embedding Models & Vector Indexes", "RAG Architecture",
            "LLM Safety & Hallucination Mitigation", "Cost & Latency Optimization"
        ],
        "assessment_duration_mins": 30,
        "assessment_question_count": 25,
        "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
    },
    {
        "slug": "agentic-ai-engineer",
        "title": "Agentic AI Engineer",
        "category": "Data & AI",
        "description": "Architects autonomous, multi-step AI agent workflows capable of dynamic tool calling, persistent state memory, cyclic graph orchestration (LangGraph), and multi-agent consensus.",
        "short_summary": "Autonomous agents, LangGraph, dynamic tool calling, multi-agent systems, and human-in-the-loop governance.",
        "market_demand": "Extremely High",
        "average_salary_range": "₹14 - 32 LPA",
        "icon": "Bot",
        "tools_and_technologies": [
            "Python", "LangChain", "LangGraph", "CrewAI / AutoGen",
            "Google Gemini API", "Vector Stores", "Docker", "AsyncIO", "Pydantic"
        ],
        "core_competencies": [
            "Python Programming for AI", "Machine Learning & LLM Core", "Prompt Engineering & Few-Shot",
            "Embeddings & Vector Databases", "RAG Architecture", "LangChain & Core Abstractions",
            "LangGraph & Cyclic State Graphs", "Tool Calling & Schema Validation", "Agent Memory & Persistence",
            "Multi-Agent Collaboration", "Evaluation, Guardrails & Deployment"
        ],
        "assessment_duration_mins": 30,
        "assessment_question_count": 25,
        "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
    },
    {
        "slug": "cloud-engineer",
        "title": "Cloud Engineer",
        "category": "DevOps & Cloud",
        "description": "Designs, provisions, and automates resilient cloud infrastructure, VPC networks, container orchestration clusters, and CI/CD deployment pipelines using Infrastructure as Code.",
        "short_summary": "Cloud computing, Terraform, Docker, Kubernetes, cloud networking, and security governance.",
        "market_demand": "Very High",
        "average_salary_range": "₹8 - 22 LPA",
        "icon": "Cloud",
        "tools_and_technologies": [
            "AWS / GCP", "Terraform", "Docker", "Kubernetes",
            "Linux / Bash", "GitHub Actions", "Prometheus & Grafana", "Git"
        ],
        "core_competencies": [
            "Cloud Computing Core Concepts", "Compute & Serverless Architecture", "Cloud Networking & VPCs",
            "Cloud Storage Services", "Infrastructure as Code (Terraform)", "IAM & Security Best Practices",
            "Monitoring, Logging & Observability", "High Availability & Disaster Recovery"
        ],
        "assessment_duration_mins": 30,
        "assessment_question_count": 25,
        "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
    },
    {
        "slug": "qa-automation-engineer",
        "title": "QA Automation Engineer",
        "category": "Software Engineering",
        "description": "Ensures commercial software reliability through robust automated test suites, end-to-end browser testing, REST API validation, performance benchmarking, and CI/CD integration.",
        "short_summary": "Test automation frameworks, Selenium/Playwright, API testing, performance testing, and CI/CD.",
        "market_demand": "High",
        "average_salary_range": "₹6 - 16 LPA",
        "icon": "ShieldCheck",
        "tools_and_technologies": [
            "Python / Java", "Selenium", "Playwright / Cypress", "PyTest / JUnit",
            "Postman / REST Assured", "JMeter", "Git", "GitHub Actions", "Docker"
        ],
        "core_competencies": [
            "Software Testing Fundamentals & STLC", "Test Automation Frameworks (Playwright/Selenium)",
            "API Testing & Automation", "Unit & Integration Testing (PyTest/JUnit)",
            "CI/CD Pipeline Integration", "Performance & Load Testing",
            "Bug Tracking & Test Reporting", "Code Coverage & Quality Metrics"
        ],
        "assessment_duration_mins": 30,
        "assessment_question_count": 25,
        "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
    }
]


from app.engine.career_assessment_questions_data import get_questions_for_career


def seed_career_assessments(db: Session) -> None:
    """Seeds the 13 career tracks and their rich 25-question assessment banks."""
    for c_data in CAREERS_CATALOGUE:
        slug = c_data["slug"]
        role = db.query(CareerRole).filter_by(slug=slug).first()
        
        # If not found by slug, also check if software-development-engineer should alias to software-engineer
        if not role and slug == "software-engineer":
            role = db.query(CareerRole).filter_by(slug="software-development-engineer").first()

        if not role:
            role = CareerRole(
                slug=slug,
                title=c_data["title"],
                category=c_data["category"],
                description=c_data["description"],
                short_summary=c_data["short_summary"],
                market_demand=c_data["market_demand"],
                average_salary_range=c_data["average_salary_range"],
                icon=c_data["icon"],
                tools_and_technologies=c_data["tools_and_technologies"],
                core_competencies=c_data["core_competencies"],
                assessment_duration_mins=c_data["assessment_duration_mins"],
                assessment_question_count=c_data["assessment_question_count"],
                difficulty_distribution=c_data["difficulty_distribution"],
            )
            db.add(role)
            db.flush()
        else:
            # Update metadata fields
            role.title = c_data["title"]
            role.description = c_data["description"]
            role.short_summary = c_data["short_summary"]
            role.tools_and_technologies = c_data["tools_and_technologies"]
            role.core_competencies = c_data["core_competencies"]
            role.assessment_duration_mins = c_data["assessment_duration_mins"]
            role.assessment_question_count = c_data["assessment_question_count"]
            role.difficulty_distribution = c_data["difficulty_distribution"]

        # Ensure core competencies are linked as Skills and RoleSkillRequirements
        for comp_name in c_data["core_competencies"]:
            skill_slug = comp_name.lower().replace(" ", "-").replace("&", "and").replace("/", "-")
            skill = db.query(Skill).filter_by(slug=skill_slug).first()
            if not skill:
                skill = Skill(
                    slug=skill_slug,
                    name=comp_name,
                    category=c_data["category"],
                    description=f"Core competency in {comp_name} required for {c_data['title']}.",
                    doc_url=f"https://developer.mozilla.org/search?q={skill_slug}",
                    difficulty_level="intermediate"
                )
                db.add(skill)
                db.flush()

            # Link RoleSkillRequirement if missing
            req = db.query(RoleSkillRequirement).filter_by(role_id=role.id, skill_id=skill.id).first()
            if not req:
                req = RoleSkillRequirement(
                    role_id=role.id,
                    skill_id=skill.id,
                    required_proficiency=4 if "fundamentals" in comp_name.lower() or "core" in comp_name.lower() else 3,
                    importance_weight=5 if "fundamentals" in comp_name.lower() else 4,
                    is_core=True
                )
                db.add(req)

        # Seed 25 assessment questions for this role if not already seeded
        existing_q_count = db.query(CareerAssessmentQuestion).filter_by(role_id=role.id).count()
        if existing_q_count < 25:
            # Delete any partial questions to re-seed a pristine set
            if existing_q_count > 0:
                db.query(CareerAssessmentQuestion).filter_by(role_id=role.id).delete()

            questions = get_questions_for_career(slug, c_data["core_competencies"])
            for q in questions:
                # Find matching skill if possible
                comp_slug = q["category"].lower().replace(" ", "-").replace("&", "and").replace("/", "-")
                matched_skill = db.query(Skill).filter_by(slug=comp_slug).first()
                
                db.add(CareerAssessmentQuestion(
                    role_id=role.id,
                    skill_id=matched_skill.id if matched_skill else None,
                    category=q["category"],
                    question_type=q.get("question_type", "mcq"),
                    difficulty=q.get("difficulty", "intermediate"),
                    question=q["question"],
                    code_snippet=q.get("code_snippet"),
                    options=q["options"],
                    correct_answer_index=q["correct_answer_index"],
                    explanation=q["explanation"],
                    marks=q.get("marks", 1),
                    is_active=True
                ))

    db.commit()
