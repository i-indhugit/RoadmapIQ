"""
Database seed data for RoadmapIQ.
Contains realistic, verified career roles, skills across 9 standardized categories,
prerequisites, free vetted learning resources, assessment quizzes, portfolio projects,
and interview questions for technical and non-technical domains alike.
"""
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models import (
    CareerRole,
    Skill,
    RoleSkillRequirement,
    SkillPrerequisite,
    LearningResource,
    Project,
    InterviewQuestion,
    AssessmentQuiz,
    DailyChallenge,
    Achievement,
    BossBattle,
    ArenaChallenge,
)


def seed_database(db: Session) -> None:
    # Check if database is already seeded with full catalogue (14 roles)
    existing_roles = db.query(CareerRole).count()
    if existing_roles >= 14:
        seed_gamification_content(db)
        return

    # -------------------------------------------------------------
    # 1. Career Roles (Tech & Non-Tech)
    # -------------------------------------------------------------
    roles_data = [
        {
            "slug": "software-development-engineer",
            "title": "Software Development Engineer",
            "category": "Software Engineering",
            "description": "Designs, develops, and maintains scalable software systems, backend services, and distributed architectures with rigorous focus on algorithms, data structures, and code quality.",
            "short_summary": "Core algorithms, system design, and high-performance backend application engineering.",
            "market_demand": "Very High",
            "average_salary_range": "₹9 - 24 LPA",
            "icon": "Code2",
        },
        {
            "slug": "full-stack-developer",
            "title": "Full-Stack Developer",
            "category": "Software Engineering",
            "description": "Bridges frontend user experience and robust backend architectures, building end-to-end applications from database schema to responsive browser views and DevOps deployment.",
            "short_summary": "End-to-end engineering across React, FastAPI/Node.js, SQL databases, and cloud hosting.",
            "market_demand": "Very High",
            "average_salary_range": "₹8 - 20 LPA",
            "icon": "Layers",
        },
        {
            "slug": "python-developer",
            "title": "Python Developer",
            "category": "Software Engineering",
            "description": "Builds robust backend web APIs, automated ETL pipelines, and async microservices using Python, FastAPI, Django, and modern asynchronous frameworks.",
            "short_summary": "High-velocity backend APIs, automation scripting, and asynchronous web services.",
            "market_demand": "High",
            "average_salary_range": "₹6 - 16 LPA",
            "icon": "FileCode",
        },
        {
            "slug": "frontend-developer",
            "title": "Frontend Developer",
            "category": "Software Engineering",
            "description": "Crafts responsive, accessible, and performant web user interfaces using modern React, TypeScript, state management, and web performance optimization.",
            "short_summary": "Pixel-perfect, interactive web applications built with React, TypeScript, and modern CSS.",
            "market_demand": "High",
            "average_salary_range": "₹6 - 16 LPA",
            "icon": "Layout",
        },
        {
            "slug": "data-analyst",
            "title": "Data Analyst",
            "category": "Data & AI",
            "description": "Transforms raw transactional data into actionable business intelligence using SQL, Pandas, statistical modeling, and interactive dashboards.",
            "short_summary": "Actionable business insights derived through SQL querying, exploratory analysis, and visualization.",
            "market_demand": "High",
            "average_salary_range": "₹5 - 13 LPA",
            "icon": "BarChart3",
        },
        {
            "slug": "data-scientist",
            "title": "Data Scientist",
            "category": "Data & AI",
            "description": "Applies mathematical modeling, statistical hypothesis testing, and machine learning algorithms to uncover hidden patterns and deliver predictive intelligence.",
            "short_summary": "Advanced statistical modeling, predictive algorithms, and exploratory data science pipelines.",
            "market_demand": "High",
            "average_salary_range": "₹8 - 22 LPA",
            "icon": "LineChart",
        },
        {
            "slug": "machine-learning-engineer",
            "title": "Machine Learning Engineer",
            "category": "Data & AI",
            "description": "Designs, trains, optimizes, and serves production-grade machine learning and deep learning models with scalable MLOps deployment pipelines.",
            "short_summary": "Production ML systems, deep learning architectures in PyTorch, and scalable inference APIs.",
            "market_demand": "Very High",
            "average_salary_range": "₹10 - 26 LPA",
            "icon": "Cpu",
        },
        {
            "slug": "generative-ai-developer",
            "title": "Generative & Agentic AI Engineer",
            "category": "Data & AI",
            "description": "Develops state-of-the-art agentic workflows, Retrieval-Augmented Generation (RAG) pipelines, fine-tuned LLM services, and vector database integrations.",
            "short_summary": "Agentic AI systems, enterprise RAG pipelines, LLM prompt engineering, and vector search.",
            "market_demand": "Very High",
            "average_salary_range": "₹12 - 28 LPA",
            "icon": "Sparkles",
        },
        {
            "slug": "business-analyst",
            "title": "Business Analyst",
            "category": "Business & Domain",
            "description": "Translates complex business challenges into structured technical requirements, process flows, KPI models, and data-backed operational roadmaps.",
            "short_summary": "Requirements gathering, process modeling, stakeholder alignment, and data-driven business decisions.",
            "market_demand": "Very High",
            "average_salary_range": "₹6 - 15 LPA",
            "icon": "TrendingUp",
        },
        {
            "slug": "digital-marketing-specialist",
            "title": "Digital Marketing Specialist",
            "category": "Marketing & Creative",
            "description": "Drives customer acquisition and brand growth through search engine optimization (SEO), performance analytics, content strategy, and conversion rate optimization.",
            "short_summary": "Organic and paid growth campaigns, SEO audits, audience research, and conversion tracking.",
            "market_demand": "High",
            "average_salary_range": "₹4.5 - 12 LPA",
            "icon": "Megaphone",
        },
        {
            "slug": "ui-ux-designer",
            "title": "UI/UX Designer",
            "category": "Design & Product",
            "description": "Creates human-centered digital experiences through user research, wireframing, high-fidelity interactive prototyping in Figma, and design systems.",
            "short_summary": "User journey mapping, wireframing, Figma design systems, and usability evaluation.",
            "market_demand": "High",
            "average_salary_range": "₹6 - 16 LPA",
            "icon": "Figma",
        },
        {
            "slug": "cybersecurity-analyst",
            "title": "Cybersecurity Analyst",
            "category": "Security & Infrastructure",
            "description": "Protects organizational assets and networks by monitoring vulnerabilities, analyzing threat vectors, implementing security policies, and incident response.",
            "short_summary": "Threat detection, network defense, vulnerability assessments, and compliance governance.",
            "market_demand": "Very High",
            "average_salary_range": "₹7 - 18 LPA",
            "icon": "ShieldCheck",
        },
        {
            "slug": "hr-specialist",
            "title": "Human Resources Specialist",
            "category": "People & Operations",
            "description": "Oversees talent acquisition, employee onboarding, performance management, workplace culture, and organizational policy implementation.",
            "short_summary": "Full-cycle recruitment, talent management, employee engagement, and HR compliance.",
            "market_demand": "Moderate",
            "average_salary_range": "₹4.5 - 11 LPA",
            "icon": "Users",
        },
        {
            "slug": "financial-analyst",
            "title": "Financial Analyst",
            "category": "Finance & Economics",
            "description": "Conducts quantitative financial modeling, discounted cash flow (DCF) valuations, variance analysis, and capital budgeting to guide strategic investment decisions.",
            "short_summary": "Three-statement financial forecasting, company valuation, variance reporting, and investment analysis.",
            "market_demand": "High",
            "average_salary_range": "₹6 - 17 LPA",
            "icon": "DollarSign",
        },
        {
            "slug": "project-manager",
            "title": "Project Manager",
            "category": "Leadership & Management",
            "description": "Leads cross-functional teams to deliver strategic projects on time and within scope using Agile, Scrum, risk management, and stakeholder alignment.",
            "short_summary": "Agile sprint planning, timeline governance, cross-functional delivery, and risk mitigation.",
            "market_demand": "High",
            "average_salary_range": "₹8 - 22 LPA",
            "icon": "CalendarCheck",
        },
        {
            "slug": "sales-executive",
            "title": "Sales & Business Development Executive",
            "category": "Sales & Growth",
            "description": "Identifies high-value prospects, manages B2B sales pipelines, negotiates contracts, and drives enterprise revenue growth through consultative selling.",
            "short_summary": "Pipeline generation, enterprise deal negotiation, CRM management, and client relationship building.",
            "market_demand": "High",
            "average_salary_range": "₹5 - 16 LPA",
            "icon": "Handshake",
        },
    ]

    roles_dict: Dict[str, CareerRole] = {}
    for r_data in roles_data:
        role = db.query(CareerRole).filter_by(slug=r_data["slug"]).first()
        if not role:
            role = CareerRole(**r_data)
            db.add(role)
            db.flush()
        else:
            for k, v in r_data.items():
                setattr(role, k, v)
        roles_dict[r_data["slug"]] = role

    # -------------------------------------------------------------
    # 2. Skills Across 9 Standardized Categories
    # -------------------------------------------------------------
    skills_data = [
        # --- 1. Technical Skills ---
        {
            "slug": "python-programming",
            "name": "Python Programming",
            "category": "Technical",
            "description": "Python 3 core language fundamentals: data structures, object-oriented principles, generators, decorators, and package management.",
            "doc_url": "https://docs.python.org/3/",
            "difficulty_level": "beginner",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 15,
            "estimated_hours_intermediate": 25,
            "estimated_hours_advanced": 35,
        },
        {
            "slug": "javascript-typescript",
            "name": "JavaScript & TypeScript",
            "category": "Technical",
            "description": "Modern ECMAScript, event loop, async/await, closures, static typing with TypeScript, interfaces, and generics.",
            "doc_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
            "difficulty_level": "intermediate",
            "assessment_method": "code_test",
            "cost_type": "free",
            "estimated_hours_beginner": 16,
            "estimated_hours_intermediate": 26,
            "estimated_hours_advanced": 36,
        },
        {
            "slug": "data-structures-algorithms",
            "name": "Data Structures & Algorithms",
            "category": "Technical",
            "description": "Arrays, Linked Lists, Stacks, Queues, Hash Tables, Trees, Graphs, Sorting, Binary Search, and Dynamic Programming.",
            "doc_url": "https://leetcode.com/explore/",
            "difficulty_level": "intermediate",
            "assessment_method": "code_test",
            "cost_type": "free",
            "estimated_hours_beginner": 25,
            "estimated_hours_intermediate": 45,
            "estimated_hours_advanced": 60,
        },
        {
            "slug": "operating-systems-linux",
            "name": "Operating Systems & Linux",
            "category": "Technical",
            "description": "Processes, threads, concurrency, virtual memory, file systems, Linux shell commands, scripting, and system monitoring.",
            "doc_url": "https://linuxjourney.com/",
            "difficulty_level": "beginner",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 12,
            "estimated_hours_intermediate": 20,
            "estimated_hours_advanced": 30,
        },
        {
            "slug": "computer-networks",
            "name": "Computer Networks",
            "category": "Technical",
            "description": "OSI & TCP/IP stack, DNS, HTTP/HTTPS, WebSockets, TCP vs UDP, IP addressing, TLS encryption, and network security.",
            "doc_url": "https://developer.mozilla.org/en-US/docs/Web/HTTP",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 12,
            "estimated_hours_intermediate": 20,
            "estimated_hours_advanced": 28,
        },
        {
            "slug": "html-css-modern-styling",
            "name": "HTML5 & Modern CSS",
            "category": "Technical",
            "description": "Semantic HTML, CSS Flexbox, Grid, responsive layouts, Tailwind CSS, animations, and WCAG accessibility standards.",
            "doc_url": "https://developer.mozilla.org/en-US/docs/Learn/CSS",
            "difficulty_level": "beginner",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 10,
            "estimated_hours_intermediate": 18,
            "estimated_hours_advanced": 25,
        },
        {
            "slug": "react-frontend-development",
            "name": "React.js & State Management",
            "category": "Technical",
            "description": "React component hierarchy, JSX, hooks (useState, useEffect, custom hooks), context API, routing, and render optimization.",
            "doc_url": "https://react.dev/learn",
            "difficulty_level": "intermediate",
            "assessment_method": "code_test",
            "cost_type": "free",
            "estimated_hours_beginner": 16,
            "estimated_hours_intermediate": 30,
            "estimated_hours_advanced": 40,
        },
        {
            "slug": "restful-apis-fastapi",
            "name": "RESTful API Design & FastAPI",
            "category": "Technical",
            "description": "REST principles, OpenAPI documentation, async endpoints, Pydantic data validation, SQLAlchemy ORM, and auth middlewares.",
            "doc_url": "https://fastapi.tiangolo.com/tutorial/",
            "difficulty_level": "intermediate",
            "assessment_method": "code_test",
            "cost_type": "free",
            "estimated_hours_beginner": 14,
            "estimated_hours_intermediate": 24,
            "estimated_hours_advanced": 34,
        },
        {
            "slug": "system-design-distributed-systems",
            "name": "System Design & Architecture",
            "category": "Technical",
            "description": "Scalability principles, caching (Redis), message queues (Kafka/RabbitMQ), load balancers, database sharding, and high availability.",
            "doc_url": "https://github.com/donnemartin/system-design-primer",
            "difficulty_level": "advanced",
            "assessment_method": "case_study",
            "cost_type": "free",
            "estimated_hours_beginner": 18,
            "estimated_hours_intermediate": 32,
            "estimated_hours_advanced": 45,
        },
        {
            "slug": "machine-learning-scikit-learn",
            "name": "Machine Learning Fundamentals",
            "category": "Technical",
            "description": "Supervised & unsupervised learning: Linear/Logistic Regression, Decision Trees, Random Forests, SVM, k-Means, cross-validation, and metrics.",
            "doc_url": "https://scikit-learn.org/stable/user_guide.html",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 18,
            "estimated_hours_intermediate": 32,
            "estimated_hours_advanced": 45,
        },
        {
            "slug": "deep-learning-pytorch",
            "name": "Deep Learning & PyTorch",
            "category": "Technical",
            "description": "Neural network architectures, backpropagation, CNNs, RNNs/Transformers, PyTorch tensors, autograd, and GPU model training.",
            "doc_url": "https://pytorch.org/tutorials/",
            "difficulty_level": "advanced",
            "assessment_method": "code_test",
            "cost_type": "free",
            "estimated_hours_beginner": 22,
            "estimated_hours_intermediate": 38,
            "estimated_hours_advanced": 55,
        },
        {
            "slug": "llms-prompt-engineering",
            "name": "LLMs & Agentic AI",
            "category": "Technical",
            "description": "Transformer self-attention, prompting strategies, tokenization, Hugging Face transformers, fine-tuning basics, and LLM APIs.",
            "doc_url": "https://huggingface.co/docs/transformers/index",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 16,
            "estimated_hours_intermediate": 28,
            "estimated_hours_advanced": 40,
        },
        {
            "slug": "rag-vector-databases",
            "name": "RAG & Vector Search",
            "category": "Technical",
            "description": "Embedding models, vector similarity metrics (cosine/dot product), vector databases (Chroma/FAISS), LangChain, and grounded AI agents.",
            "doc_url": "https://docs.trychroma.com/",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 14,
            "estimated_hours_intermediate": 26,
            "estimated_hours_advanced": 38,
        },
        {
            "slug": "network-security-basics",
            "name": "Cybersecurity & Network Defense",
            "category": "Technical",
            "description": "Threat modeling, common vulnerabilities (OWASP Top 10), penetration testing fundamentals, firewall configuration, and incident containment.",
            "doc_url": "https://owasp.org/www-project-top-ten/",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 16,
            "estimated_hours_intermediate": 28,
            "estimated_hours_advanced": 40,
        },
        {
            "slug": "docker-containers-devops",
            "name": "Docker & DevOps Fundamentals",
            "category": "Technical",
            "description": "Containerization with Docker, multi-stage Dockerfiles, docker-compose, Git version control, and GitHub Actions CI/CD workflows.",
            "doc_url": "https://docs.docker.com/get-started/",
            "difficulty_level": "intermediate",
            "assessment_method": "code_test",
            "cost_type": "free",
            "estimated_hours_beginner": 12,
            "estimated_hours_intermediate": 20,
            "estimated_hours_advanced": 30,
        },

        # --- 2. Digital Literacy Skills ---
        {
            "slug": "advanced-excel-spreadsheets",
            "name": "Advanced Excel & Spreadsheets",
            "category": "Digital literacy",
            "description": "Spreadsheet mastery: VLOOKUP/XLOOKUP, INDEX/MATCH, dynamic Pivot Tables, nested IF logic, conditional formatting, and financial data modeling.",
            "doc_url": "https://support.microsoft.com/en-us/excel",
            "difficulty_level": "beginner",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 10,
            "estimated_hours_intermediate": 18,
            "estimated_hours_advanced": 28,
        },
        {
            "slug": "database-systems-sql",
            "name": "Database Systems & SQL",
            "category": "Digital literacy",
            "description": "Relational schema design, normalization, ACID transactions, complex SQL queries, JOINs, indexing, and query optimization.",
            "doc_url": "https://www.postgresql.org/docs/",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 15,
            "estimated_hours_intermediate": 25,
            "estimated_hours_advanced": 35,
        },
        {
            "slug": "powerbi-tableau-visualization",
            "name": "Power BI & Tableau Dashboarding",
            "category": "Digital literacy",
            "description": "Connecting diverse data sources, DAX calculations, interactive drill-down reporting, visual storytelling, and executive dashboard design.",
            "doc_url": "https://learn.microsoft.com/en-us/power-bi/",
            "difficulty_level": "intermediate",
            "assessment_method": "case_study",
            "cost_type": "free",
            "estimated_hours_beginner": 12,
            "estimated_hours_intermediate": 22,
            "estimated_hours_advanced": 32,
        },
        {
            "slug": "crm-software-hubspot",
            "name": "CRM Systems & HubSpot / Salesforce",
            "category": "Digital literacy",
            "description": "Lead lifecycle management, pipeline deal stages, automated email sequences, CRM reporting, and customer contact tracking.",
            "doc_url": "https://academy.hubspot.com/",
            "difficulty_level": "beginner",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 8,
            "estimated_hours_intermediate": 15,
            "estimated_hours_advanced": 24,
        },
        {
            "slug": "google-workspace-analytics",
            "name": "Google Analytics 4 & Tag Manager",
            "category": "Digital literacy",
            "description": "Event-based measurement, funnel analysis, UTM tagging, audience segmentation, user attribution models, and conversion tracking.",
            "doc_url": "https://support.google.com/analytics",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 10,
            "estimated_hours_intermediate": 18,
            "estimated_hours_advanced": 26,
        },

        # --- 3. Soft Skills ---
        {
            "slug": "critical-thinking-problem-solving",
            "name": "Critical Thinking & Problem Solving",
            "category": "Soft skills",
            "description": "Deconstructing ambiguous problems, deductive reasoning, cognitive bias recognition, hypothesis testing, and logical synthesis.",
            "doc_url": "https://www.mindtools.com/pages/article/newCT_02.htm",
            "difficulty_level": "beginner",
            "assessment_method": "case_study",
            "cost_type": "free",
            "estimated_hours_beginner": 8,
            "estimated_hours_intermediate": 14,
            "estimated_hours_advanced": 20,
        },
        {
            "slug": "time-management-adaptability",
            "name": "Time Management & Prioritization",
            "category": "Soft skills",
            "description": "Eisenhower priority matrix, time-blocking, sprint pacing, managing shifting priorities under pressure, and meeting tight deadlines.",
            "doc_url": "https://asana.com/resources/eisenhower-matrix",
            "difficulty_level": "beginner",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 6,
            "estimated_hours_intermediate": 10,
            "estimated_hours_advanced": 16,
        },
        {
            "slug": "interpersonal-teamwork",
            "name": "Cross-Functional Team Collaboration",
            "category": "Soft skills",
            "description": "Working synchronously across engineering, product, sales, and design; constructive code/document reviews; and psychological safety.",
            "doc_url": "https://rework.withgoogle.com/guides/understanding-team-effectiveness/",
            "difficulty_level": "beginner",
            "assessment_method": "presentation",
            "cost_type": "free",
            "estimated_hours_beginner": 6,
            "estimated_hours_intermediate": 12,
            "estimated_hours_advanced": 18,
        },
        {
            "slug": "emotional-intelligence",
            "name": "Emotional Intelligence & Empathy",
            "category": "Soft skills",
            "description": "Self-awareness, active listening, perspective-taking, conflict de-escalation, and empathetic human communication in diverse teams.",
            "doc_url": "https://hbr.org/topic/emotional-intelligence",
            "difficulty_level": "intermediate",
            "assessment_method": "case_study",
            "cost_type": "free",
            "estimated_hours_beginner": 8,
            "estimated_hours_intermediate": 14,
            "estimated_hours_advanced": 20,
        },

        # --- 4. Communication Skills ---
        {
            "slug": "executive-stakeholder-communication",
            "name": "Executive & Stakeholder Communication",
            "category": "Communication skills",
            "description": "Synthesizing complex technical insights into high-level business summaries, executive briefings, and cross-department alignment.",
            "doc_url": "https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights",
            "difficulty_level": "intermediate",
            "assessment_method": "presentation",
            "cost_type": "free",
            "estimated_hours_beginner": 8,
            "estimated_hours_intermediate": 16,
            "estimated_hours_advanced": 24,
        },
        {
            "slug": "business-writing-documentation",
            "name": "Business Writing & Documentation",
            "category": "Communication skills",
            "description": "Clear technical specs, Product Requirement Documents (PRDs), meeting memos, structured email updates, and user manuals.",
            "doc_url": "https://developers.google.com/tech-writing",
            "difficulty_level": "beginner",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 8,
            "estimated_hours_intermediate": 15,
            "estimated_hours_advanced": 22,
        },
        {
            "slug": "presentation-pitch-skills",
            "name": "Presentation & Pitching Skills",
            "category": "Communication skills",
            "description": "Slide deck design, public speaking, storytelling with data, handling tough Q&A sessions, and investor/client pitching.",
            "doc_url": "https://hbr.org/2013/06/how-to-give-a-killer-presentation",
            "difficulty_level": "intermediate",
            "assessment_method": "presentation",
            "cost_type": "free",
            "estimated_hours_beginner": 8,
            "estimated_hours_intermediate": 16,
            "estimated_hours_advanced": 24,
        },
        {
            "slug": "client-negotiation-persuasion",
            "name": "Negotiation & Persuasive Communication",
            "category": "Communication skills",
            "description": "Principled negotiation (BATNA), value-based objection handling, consensus building, and closing agreements win-win.",
            "doc_url": "https://www.pon.harvard.edu/",
            "difficulty_level": "intermediate",
            "assessment_method": "case_study",
            "cost_type": "free",
            "estimated_hours_beginner": 10,
            "estimated_hours_intermediate": 18,
            "estimated_hours_advanced": 26,
        },

        # --- 5. Business and Domain Skills ---
        {
            "slug": "requirements-engineering-user-stories",
            "name": "Requirements Gathering & User Stories",
            "category": "Business and domain",
            "description": "Conducting stakeholder interviews, writing INVEST-compliant user stories with Gherkin acceptance criteria, and traceability matrices.",
            "doc_url": "https://www.agilealliance.org/glossary/user-story-template/",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 10,
            "estimated_hours_intermediate": 18,
            "estimated_hours_advanced": 28,
        },
        {
            "slug": "financial-modeling-valuation",
            "name": "Financial Modeling & Valuation",
            "category": "Business and domain",
            "description": "Three-statement dynamic models (Income, Balance Sheet, Cash Flow), DCF enterprise valuation, sensitivity tables, and CapEx forecasting.",
            "doc_url": "https://corporatefinanceinstitute.com/resources/financial-modeling/",
            "difficulty_level": "advanced",
            "assessment_method": "case_study",
            "cost_type": "free",
            "estimated_hours_beginner": 18,
            "estimated_hours_intermediate": 32,
            "estimated_hours_advanced": 48,
        },
        {
            "slug": "digital-marketing-seo-strategy",
            "name": "SEO & Content Marketing Strategy",
            "category": "Business and domain",
            "description": "Keyword search intent research, on-page optimization, technical crawlability audits, backlink profiling, and editorial calendar planning.",
            "doc_url": "https://moz.com/beginners-guide-to-seo",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 12,
            "estimated_hours_intermediate": 22,
            "estimated_hours_advanced": 34,
        },
        {
            "slug": "talent-acquisition-hr-lifecycle",
            "name": "Talent Acquisition & HR Lifecycle",
            "category": "Business and domain",
            "description": "Sourcing pipelines, structured STAR behavioral interviewing rubrics, candidate evaluation, compensation benchmarking, and onboarding.",
            "doc_url": "https://www.shrm.org/topics/talent-acquisition",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 10,
            "estimated_hours_intermediate": 18,
            "estimated_hours_advanced": 28,
        },
        {
            "slug": "b2b-sales-pipeline-funnel",
            "name": "B2B Sales Pipeline & Deal Closing",
            "category": "Business and domain",
            "description": "MEDDPICC / BANT sales qualification, discovery calls, economic buyer mapping, overcoming price objections, and contract closing.",
            "doc_url": "https://www.salesforce.com/resources/articles/sales-pipeline/",
            "difficulty_level": "intermediate",
            "assessment_method": "case_study",
            "cost_type": "free",
            "estimated_hours_beginner": 12,
            "estimated_hours_intermediate": 20,
            "estimated_hours_advanced": 30,
        },
        {
            "slug": "business-model-canvas-strategy",
            "name": "Business Model Canvas & Lean Strategy",
            "category": "Business and domain",
            "description": "Value proposition design, revenue stream analysis, cost structure validation, customer discovery interviews, and unit economics.",
            "doc_url": "https://www.strategyzer.com/library/the-business-model-canvas",
            "difficulty_level": "intermediate",
            "assessment_method": "case_study",
            "cost_type": "free",
            "estimated_hours_beginner": 10,
            "estimated_hours_intermediate": 18,
            "estimated_hours_advanced": 26,
        },

        # --- 6. Analytical and Cognitive Skills ---
        {
            "slug": "statistics-applied-probability",
            "name": "Applied Statistics & Probability",
            "category": "Analytical and cognitive",
            "description": "Descriptive statistics, distributions, hypothesis testing, p-values, regression analysis, Bayesian probability, and confidence intervals.",
            "doc_url": "https://www.khanacademy.org/math/statistics-probability",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 15,
            "estimated_hours_intermediate": 25,
            "estimated_hours_advanced": 35,
        },
        {
            "slug": "data-analysis-pandas-numpy",
            "name": "Data Analysis with Pandas & NumPy",
            "category": "Analytical and cognitive",
            "description": "Data wrangling, cleaning missing values, DataFrame manipulations, aggregations, vector math, and Matplotlib/Seaborn visualization.",
            "doc_url": "https://pandas.pydata.org/docs/user_guide/index.html",
            "difficulty_level": "intermediate",
            "assessment_method": "code_test",
            "cost_type": "free",
            "estimated_hours_beginner": 14,
            "estimated_hours_intermediate": 24,
            "estimated_hours_advanced": 32,
        },
        {
            "slug": "business-metrics-kpi-analysis",
            "name": "Business KPI & Metrics Analysis",
            "category": "Analytical and cognitive",
            "description": "Calculating and diagnosing CAC, LTV, Churn, ARR/MRR, Gross Margin, Net Promoter Score (NPS), and Return on Ad Spend (ROAS).",
            "doc_url": "https://corporatefinanceinstitute.com/resources/management/kpi-key-performance-indicator/",
            "difficulty_level": "beginner",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 8,
            "estimated_hours_intermediate": 16,
            "estimated_hours_advanced": 24,
        },
        {
            "slug": "market-research-competitive-analysis",
            "name": "Market Research & Competitor Benchmarking",
            "category": "Analytical and cognitive",
            "description": "Primary and secondary market research, SWOT analysis, Porter's Five Forces, pricing matrix benchmarking, and trend forecasting.",
            "doc_url": "https://www.hbs.edu/faculty/Pages/item.aspx?num=42211",
            "difficulty_level": "beginner",
            "assessment_method": "case_study",
            "cost_type": "free",
            "estimated_hours_beginner": 10,
            "estimated_hours_intermediate": 18,
            "estimated_hours_advanced": 26,
        },

        # --- 7. Leadership and Management Skills ---
        {
            "slug": "agile-scrum-project-management",
            "name": "Agile, Scrum & Kanban Methodologies",
            "category": "Leadership and management",
            "description": "Sprint ceremonies (Planning, Daily Standup, Review, Retrospective), backlog refinement, story point estimation, and burndown charts.",
            "doc_url": "https://www.scrumguides.org/",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 8,
            "estimated_hours_intermediate": 16,
            "estimated_hours_advanced": 24,
        },
        {
            "slug": "people-management-coaching",
            "name": "Team Leadership & Mentorship",
            "category": "Leadership and management",
            "description": "1-on-1 coaching frameworks, performance appraisal rubrics, delegation strategies, motivation techniques, and talent retention.",
            "doc_url": "https://www.ccl.org/articles/leading-effectively-articles/coaching-skills-for-leaders/",
            "difficulty_level": "intermediate",
            "assessment_method": "case_study",
            "cost_type": "free",
            "estimated_hours_beginner": 10,
            "estimated_hours_intermediate": 18,
            "estimated_hours_advanced": 26,
        },
        {
            "slug": "risk-management-compliance",
            "name": "Risk Assessment & Governance",
            "category": "Leadership and management",
            "description": "Risk identification registers, likelihood vs impact scoring matrices, contingency planning, and regulatory compliance adherence.",
            "doc_url": "https://www.pmi.org/learning/library/risk-management-project-governance-8192",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 10,
            "estimated_hours_intermediate": 18,
            "estimated_hours_advanced": 26,
        },

        # --- 8. Creative Skills ---
        {
            "slug": "ui-ux-wireframing-figma",
            "name": "UI/UX Wireframing & Prototyping (Figma)",
            "category": "Creative",
            "description": "Low-to-high fidelity wireframing, Figma auto-layout, interactive component variants, design tokens, and user click-through testing.",
            "doc_url": "https://help.figma.com/hc/en-us",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 12,
            "estimated_hours_intermediate": 24,
            "estimated_hours_advanced": 36,
        },
        {
            "slug": "design-thinking-user-research",
            "name": "Design Thinking & User Research",
            "category": "Creative",
            "description": "5-stage Design Thinking (Empathize, Define, Ideate, Prototype, Test), user persona generation, empathy maps, and usability tests.",
            "doc_url": "https://www.interaction-design.org/literature/article/5-stages-in-the-design-thinking-process",
            "difficulty_level": "beginner",
            "assessment_method": "case_study",
            "cost_type": "free",
            "estimated_hours_beginner": 10,
            "estimated_hours_intermediate": 18,
            "estimated_hours_advanced": 26,
        },
        {
            "slug": "creative-copywriting-brand-storytelling",
            "name": "Copywriting & Brand Storytelling",
            "category": "Creative",
            "description": "Direct response ad copy, website landing page messaging, narrative brand positioning, headline hooks, and call-to-action (CTA) testing.",
            "doc_url": "https://copyblogger.com/copywriting-101/",
            "difficulty_level": "beginner",
            "assessment_method": "case_study",
            "cost_type": "free",
            "estimated_hours_beginner": 8,
            "estimated_hours_intermediate": 16,
            "estimated_hours_advanced": 24,
        },
        {
            "slug": "visual-design-hierarchy",
            "name": "Visual Design & Layout Hierarchy",
            "category": "Creative",
            "description": "Typography pairing, color theory, spacing ratios, Gestalt grouping principles, visual contrast, and WCAG accessibility standards.",
            "doc_url": "https://www.interaction-design.org/literature/topics/visual-hierarchy",
            "difficulty_level": "beginner",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 8,
            "estimated_hours_intermediate": 16,
            "estimated_hours_advanced": 24,
        },

        # --- 9. Role-Specific Certifications ---
        {
            "slug": "scrum-master-certification-prep",
            "name": "Scrum Master (PSM I / CSM) Prep",
            "category": "Certifications",
            "description": "Scrum Guide deep dive, servant leadership principles, velocity metrics, and practicing scenario-based mock certification exams.",
            "doc_url": "https://www.scrum.org/assessments/professional-scrum-master-i-certification",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 12,
            "estimated_hours_intermediate": 20,
            "estimated_hours_advanced": 30,
        },
        {
            "slug": "security-plus-cyber-cert",
            "name": "CompTIA Security+ Fundamentals",
            "category": "Certifications",
            "description": "Core cybersecurity domains: threats, attacks, vulnerabilities, cryptography, identity & access management (IAM), and risk mitigation.",
            "doc_url": "https://www.comptia.org/certifications/security",
            "difficulty_level": "intermediate",
            "assessment_method": "quiz",
            "cost_type": "free",
            "estimated_hours_beginner": 18,
            "estimated_hours_intermediate": 30,
            "estimated_hours_advanced": 45,
        },
    ]

    skills_dict: Dict[str, Skill] = {}
    for s_data in skills_data:
        skill = db.query(Skill).filter_by(slug=s_data["slug"]).first()
        if not skill:
            skill = Skill(**s_data)
            db.add(skill)
            db.flush()
        else:
            for k, v in s_data.items():
                setattr(skill, k, v)
        skills_dict[s_data["slug"]] = skill

    # -------------------------------------------------------------
    # 3. Prerequisites (Tech & Non-Tech)
    # -------------------------------------------------------------
    prereqs = [
        # Target skill -> Required prerequisite
        ("data-structures-algorithms", "python-programming"),
        ("database-systems-sql", "operating-systems-linux"),
        ("restful-apis-fastapi", "python-programming"),
        ("restful-apis-fastapi", "database-systems-sql"),
        ("react-frontend-development", "javascript-typescript"),
        ("react-frontend-development", "html-css-modern-styling"),
        ("system-design-distributed-systems", "database-systems-sql"),
        ("system-design-distributed-systems", "computer-networks"),
        ("data-analysis-pandas-numpy", "python-programming"),
        ("statistics-applied-probability", "python-programming"),
        ("machine-learning-scikit-learn", "data-analysis-pandas-numpy"),
        ("machine-learning-scikit-learn", "statistics-applied-probability"),
        ("deep-learning-pytorch", "machine-learning-scikit-learn"),
        ("llms-prompt-engineering", "deep-learning-pytorch"),
        ("rag-vector-databases", "llms-prompt-engineering"),
        ("rag-vector-databases", "database-systems-sql"),
        ("network-security-basics", "computer-networks"),
        ("security-plus-cyber-cert", "network-security-basics"),
        ("docker-containers-devops", "operating-systems-linux"),
        # Non-Technical & Analytical Prerequisites
        ("business-metrics-kpi-analysis", "advanced-excel-spreadsheets"),
        ("financial-modeling-valuation", "advanced-excel-spreadsheets"),
        ("powerbi-tableau-visualization", "advanced-excel-spreadsheets"),
        ("powerbi-tableau-visualization", "database-systems-sql"),
        ("requirements-engineering-user-stories", "critical-thinking-problem-solving"),
        ("requirements-engineering-user-stories", "business-writing-documentation"),
        ("agile-scrum-project-management", "requirements-engineering-user-stories"),
        ("scrum-master-certification-prep", "agile-scrum-project-management"),
        ("digital-marketing-seo-strategy", "creative-copywriting-brand-storytelling"),
        ("google-workspace-analytics", "digital-marketing-seo-strategy"),
        ("ui-ux-wireframing-figma", "design-thinking-user-research"),
        ("ui-ux-wireframing-figma", "visual-design-hierarchy"),
        ("b2b-sales-pipeline-funnel", "crm-software-hubspot"),
        ("b2b-sales-pipeline-funnel", "client-negotiation-persuasion"),
        ("talent-acquisition-hr-lifecycle", "emotional-intelligence"),
        ("talent-acquisition-hr-lifecycle", "business-writing-documentation"),
        ("business-model-canvas-strategy", "market-research-competitive-analysis"),
    ]

    for target_slug, prereq_slug in prereqs:
        t_skill = skills_dict.get(target_slug)
        p_skill = skills_dict.get(prereq_slug)
        if t_skill and p_skill:
            exists = db.query(SkillPrerequisite).filter_by(
                skill_id=t_skill.id, prerequisite_skill_id=p_skill.id
            ).first()
            if not exists:
                db.add(SkillPrerequisite(skill_id=t_skill.id, prerequisite_skill_id=p_skill.id, is_strict=True))

    db.flush()

    # -------------------------------------------------------------
    # 4. Role-Skill Requirements (0-5 scale, weights 1-5)
    # -------------------------------------------------------------
    # Format: (role_slug, skill_slug, required_proficiency 1-5, importance_weight 1-5, is_core)
    role_skills_matrix = [
        # Software Development Engineer
        ("software-development-engineer", "data-structures-algorithms", 4, 5, True),
        ("software-development-engineer", "python-programming", 3, 4, True),
        ("software-development-engineer", "database-systems-sql", 3, 4, True),
        ("software-development-engineer", "operating-systems-linux", 3, 3, True),
        ("software-development-engineer", "computer-networks", 3, 3, True),
        ("software-development-engineer", "system-design-distributed-systems", 3, 4, True),
        ("software-development-engineer", "docker-containers-devops", 2, 2, False),
        ("software-development-engineer", "critical-thinking-problem-solving", 4, 4, True),

        # Full-Stack Developer
        ("full-stack-developer", "javascript-typescript", 4, 5, True),
        ("full-stack-developer", "react-frontend-development", 4, 5, True),
        ("full-stack-developer", "python-programming", 3, 4, True),
        ("full-stack-developer", "restful-apis-fastapi", 3, 4, True),
        ("full-stack-developer", "database-systems-sql", 3, 4, True),
        ("full-stack-developer", "html-css-modern-styling", 3, 3, True),
        ("full-stack-developer", "docker-containers-devops", 2, 3, False),

        # Python Developer
        ("python-developer", "python-programming", 4, 5, True),
        ("python-developer", "restful-apis-fastapi", 4, 5, True),
        ("python-developer", "database-systems-sql", 3, 4, True),
        ("python-developer", "data-structures-algorithms", 3, 4, True),
        ("python-developer", "docker-containers-devops", 2, 3, False),

        # Frontend Developer
        ("frontend-developer", "javascript-typescript", 4, 5, True),
        ("frontend-developer", "react-frontend-development", 4, 5, True),
        ("frontend-developer", "html-css-modern-styling", 4, 4, True),
        ("frontend-developer", "ui-ux-wireframing-figma", 2, 3, False),

        # Data Analyst
        ("data-analyst", "database-systems-sql", 4, 5, True),
        ("data-analyst", "advanced-excel-spreadsheets", 4, 5, True),
        ("data-analyst", "data-analysis-pandas-numpy", 3, 4, True),
        ("data-analyst", "powerbi-tableau-visualization", 4, 5, True),
        ("data-analyst", "business-metrics-kpi-analysis", 3, 4, True),
        ("data-analyst", "executive-stakeholder-communication", 3, 3, False),

        # Data Scientist
        ("data-scientist", "python-programming", 4, 5, True),
        ("data-scientist", "data-analysis-pandas-numpy", 4, 5, True),
        ("data-scientist", "statistics-applied-probability", 4, 5, True),
        ("data-scientist", "machine-learning-scikit-learn", 4, 5, True),
        ("data-scientist", "database-systems-sql", 3, 4, True),

        # Machine Learning Engineer
        ("machine-learning-engineer", "python-programming", 4, 5, True),
        ("machine-learning-engineer", "machine-learning-scikit-learn", 4, 5, True),
        ("machine-learning-engineer", "deep-learning-pytorch", 4, 5, True),
        ("machine-learning-engineer", "restful-apis-fastapi", 3, 4, True),
        ("machine-learning-engineer", "docker-containers-devops", 3, 3, False),

        # Generative & Agentic AI Engineer
        ("generative-ai-developer", "python-programming", 4, 5, True),
        ("generative-ai-developer", "llms-prompt-engineering", 4, 5, True),
        ("generative-ai-developer", "rag-vector-databases", 4, 5, True),
        ("generative-ai-developer", "restful-apis-fastapi", 3, 4, True),
        ("generative-ai-developer", "deep-learning-pytorch", 3, 4, True),

        # Business Analyst (Non-Technical / Hybrid)
        ("business-analyst", "advanced-excel-spreadsheets", 4, 5, True),
        ("business-analyst", "requirements-engineering-user-stories", 4, 5, True),
        ("business-analyst", "business-metrics-kpi-analysis", 4, 4, True),
        ("business-analyst", "executive-stakeholder-communication", 4, 5, True),
        ("business-analyst", "database-systems-sql", 3, 4, True),
        ("business-analyst", "powerbi-tableau-visualization", 3, 4, True),
        ("business-analyst", "agile-scrum-project-management", 3, 3, False),
        ("business-analyst", "critical-thinking-problem-solving", 4, 4, True),

        # Digital Marketing Specialist
        ("digital-marketing-specialist", "digital-marketing-seo-strategy", 4, 5, True),
        ("digital-marketing-specialist", "google-workspace-analytics", 4, 5, True),
        ("digital-marketing-specialist", "creative-copywriting-brand-storytelling", 4, 4, True),
        ("digital-marketing-specialist", "business-metrics-kpi-analysis", 3, 4, True),
        ("digital-marketing-specialist", "market-research-competitive-analysis", 3, 3, True),
        ("digital-marketing-specialist", "crm-software-hubspot", 3, 3, False),
        ("digital-marketing-specialist", "presentation-pitch-skills", 3, 3, False),

        # UI/UX Designer
        ("ui-ux-designer", "ui-ux-wireframing-figma", 4, 5, True),
        ("ui-ux-designer", "design-thinking-user-research", 4, 5, True),
        ("ui-ux-designer", "visual-design-hierarchy", 4, 5, True),
        ("ui-ux-designer", "interpersonal-teamwork", 3, 3, True),
        ("ui-ux-designer", "presentation-pitch-skills", 3, 4, True),
        ("ui-ux-designer", "html-css-modern-styling", 2, 2, False),

        # Cybersecurity Analyst
        ("cybersecurity-analyst", "network-security-basics", 4, 5, True),
        ("cybersecurity-analyst", "computer-networks", 4, 5, True),
        ("cybersecurity-analyst", "operating-systems-linux", 3, 4, True),
        ("cybersecurity-analyst", "risk-management-compliance", 3, 4, True),
        ("cybersecurity-analyst", "security-plus-cyber-cert", 3, 4, True),
        ("cybersecurity-analyst", "python-programming", 2, 3, False),

        # Human Resources Specialist
        ("hr-specialist", "talent-acquisition-hr-lifecycle", 4, 5, True),
        ("hr-specialist", "emotional-intelligence", 4, 5, True),
        ("hr-specialist", "executive-stakeholder-communication", 4, 5, True),
        ("hr-specialist", "interpersonal-teamwork", 4, 4, True),
        ("hr-specialist", "business-writing-documentation", 3, 4, True),
        ("hr-specialist", "time-management-adaptability", 3, 3, False),

        # Financial Analyst
        ("financial-analyst", "financial-modeling-valuation", 4, 5, True),
        ("financial-analyst", "advanced-excel-spreadsheets", 5, 5, True),
        ("financial-analyst", "business-metrics-kpi-analysis", 4, 4, True),
        ("financial-analyst", "presentation-pitch-skills", 3, 4, True),
        ("financial-analyst", "executive-stakeholder-communication", 3, 4, True),
        ("financial-analyst", "database-systems-sql", 2, 3, False),

        # Project Manager
        ("project-manager", "agile-scrum-project-management", 4, 5, True),
        ("project-manager", "executive-stakeholder-communication", 4, 5, True),
        ("project-manager", "risk-management-compliance", 4, 4, True),
        ("project-manager", "time-management-adaptability", 4, 5, True),
        ("project-manager", "people-management-coaching", 3, 4, True),
        ("project-manager", "requirements-engineering-user-stories", 3, 3, False),
        ("project-manager", "scrum-master-certification-prep", 3, 3, False),

        # Sales & Business Development Executive
        ("sales-executive", "b2b-sales-pipeline-funnel", 4, 5, True),
        ("sales-executive", "client-negotiation-persuasion", 4, 5, True),
        ("sales-executive", "crm-software-hubspot", 3, 4, True),
        ("sales-executive", "presentation-pitch-skills", 4, 5, True),
        ("sales-executive", "executive-stakeholder-communication", 4, 4, True),
        ("sales-executive", "market-research-competitive-analysis", 3, 3, False),
    ]

    for role_slug, skill_slug, req_prof, weight, is_core in role_skills_matrix:
        role = roles_dict.get(role_slug)
        skill = skills_dict.get(skill_slug)
        if role and skill:
            exists = db.query(RoleSkillRequirement).filter_by(
                role_id=role.id, skill_id=skill.id
            ).first()
            if not exists:
                db.add(
                    RoleSkillRequirement(
                        role_id=role.id,
                        skill_id=skill.id,
                        required_proficiency=req_prof,
                        importance_weight=weight,
                        is_core=is_core,
                    )
                )

    db.flush()

    # -------------------------------------------------------------
    # 5. Free Learning Resources
    # -------------------------------------------------------------
    resources_data = [
        # Technical
        {
            "skill_slug": "data-structures-algorithms",
            "title": "LeetCode Curated Top Interview 150",
            "provider": "LeetCode",
            "url": "https://leetcode.com/studyplan/top-interview-150/",
            "format": "practice",
            "difficulty": "intermediate",
            "is_free": True,
            "cost_info": "100% Free Practice Problems",
            "description": "Essential placement coding problems covering arrays, trees, graphs, and dynamic programming.",
            "rating": 4.9,
        },
        {
            "skill_slug": "python-programming",
            "title": "Official Python 3 Documentation & Tutorial",
            "provider": "Python Software Foundation",
            "url": "https://docs.python.org/3/tutorial/",
            "format": "documentation",
            "difficulty": "beginner",
            "is_free": True,
            "cost_info": "Official Free Documentation",
            "description": "The definitive guide to Python syntax, standard library, modules, and data structures.",
            "rating": 4.9,
        },
        {
            "skill_slug": "javascript-typescript",
            "title": "MDN Web Docs: JavaScript Guide",
            "provider": "Mozilla MDN",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
            "format": "documentation",
            "difficulty": "beginner",
            "is_free": True,
            "cost_info": "100% Open Access",
            "description": "Gold standard web documentation for asynchronous JS, promises, closures, and the event loop.",
            "rating": 5.0,
        },
        {
            "skill_slug": "react-frontend-development",
            "title": "React.dev Official Interactive Tutorial",
            "provider": "Meta React Team",
            "url": "https://react.dev/learn",
            "format": "documentation",
            "difficulty": "intermediate",
            "is_free": True,
            "cost_info": "Free Interactive Handbook",
            "description": "Modern React with hooks, state preserving principles, effects, and best practices.",
            "rating": 5.0,
        },
        {
            "skill_slug": "restful-apis-fastapi",
            "title": "FastAPI Official Interactive Tutorial",
            "provider": "FastAPI Tiangolo",
            "url": "https://fastapi.tiangolo.com/tutorial/",
            "format": "documentation",
            "difficulty": "intermediate",
            "is_free": True,
            "cost_info": "100% Free Official Guide",
            "description": "High performance async web framework with automated docs, Pydantic, and dependency injection.",
            "rating": 4.9,
        },
        {
            "skill_slug": "database-systems-sql",
            "title": "PostgreSQL Official Documentation & Tutorial",
            "provider": "PostgreSQL Global Development Group",
            "url": "https://www.postgresql.org/docs/current/tutorial.html",
            "format": "documentation",
            "difficulty": "beginner",
            "is_free": True,
            "cost_info": "100% Free Open Source",
            "description": "Relational architecture, indexing mechanisms, transactions, and SQL query optimizations.",
            "rating": 4.8,
        },
        {
            "skill_slug": "advanced-excel-spreadsheets",
            "title": "Excel Video Training & Function Guide",
            "provider": "Microsoft Support",
            "url": "https://support.microsoft.com/en-us/excel",
            "format": "documentation",
            "difficulty": "beginner",
            "is_free": True,
            "cost_info": "Free Official Tutorials",
            "description": "Official guides for XLOOKUP, Pivot Tables, conditional logic, and spreadsheet best practices.",
            "rating": 4.8,
        },
        {
            "skill_slug": "requirements-engineering-user-stories",
            "name": "Agile Alliance User Story Guide",
            "title": "Writing Effective User Stories & Acceptance Criteria",
            "provider": "Agile Alliance",
            "url": "https://www.agilealliance.org/glossary/user-story-template/",
            "format": "documentation",
            "difficulty": "intermediate",
            "is_free": True,
            "cost_info": "100% Free Access",
            "description": "Master the INVEST mnemonic, persona-driven stories, and Gherkin Given-When-Then criteria.",
            "rating": 4.8,
        },
        {
            "skill_slug": "digital-marketing-seo-strategy",
            "title": "The Beginner's Guide to SEO",
            "provider": "Moz Academy",
            "url": "https://moz.com/beginners-guide-to-seo",
            "format": "documentation",
            "difficulty": "beginner",
            "is_free": True,
            "cost_info": "Free Comprehensive Course",
            "description": "How search engines discover, crawl, and rank pages; keyword intent, and on-page optimization.",
            "rating": 4.9,
        },
        {
            "skill_slug": "ui-ux-wireframing-figma",
            "title": "Figma for Beginners Official Series",
            "provider": "Figma Design",
            "url": "https://help.figma.com/hc/en-us",
            "format": "video",
            "difficulty": "beginner",
            "is_free": True,
            "cost_info": "Free Official Tutorials",
            "description": "Auto-layout mechanics, component components, constraints, and interactive click-through prototyping.",
            "rating": 4.9,
        },
        {
            "skill_slug": "financial-modeling-valuation",
            "title": "Corporate Finance Institute Free Modeling Guides",
            "provider": "Corporate Finance Institute",
            "url": "https://corporatefinanceinstitute.com/resources/financial-modeling/",
            "format": "documentation",
            "difficulty": "intermediate",
            "is_free": True,
            "cost_info": "Free Educational Resource",
            "description": "Three-statement forecasting, DCF valuation methods, WACC calculations, and financial ratios.",
            "rating": 4.8,
        },
        {
            "skill_slug": "agile-scrum-project-management",
            "title": "The 2020 Scrum Guide (Official Definition)",
            "provider": "Scrum.org",
            "url": "https://www.scrumguides.org/",
            "format": "documentation",
            "difficulty": "beginner",
            "is_free": True,
            "cost_info": "Free Open Standard",
            "description": "The definitive account of Scrum roles (Product Owner, Scrum Master, Developers) and artifacts.",
            "rating": 5.0,
        },
        {
            "skill_slug": "talent-acquisition-hr-lifecycle",
            "title": "SHRM Structured Interviewing & Talent Acquisition Guide",
            "provider": "SHRM",
            "url": "https://www.shrm.org/topics/talent-acquisition",
            "format": "documentation",
            "difficulty": "intermediate",
            "is_free": True,
            "cost_info": "Free Industry Primer",
            "description": "Competency-based interviewing, anti-bias evaluation rubrics, and modern ATS workflows.",
            "rating": 4.7,
        },
        {
            "skill_slug": "powerbi-tableau-visualization",
            "title": "Microsoft Power BI Guided Learning",
            "provider": "Microsoft Learn",
            "url": "https://learn.microsoft.com/en-us/power-bi/",
            "format": "documentation",
            "difficulty": "intermediate",
            "is_free": True,
            "cost_info": "100% Free Official Learning Path",
            "description": "Build high-impact interactive dashboards, data transforms with Power Query, and DAX calculations.",
            "rating": 4.9,
        },
    ]

    for res in resources_data:
        skill = skills_dict.get(res["skill_slug"])
        if skill:
            exists = db.query(LearningResource).filter_by(url=res["url"]).first()
            if not exists:
                db.add(
                    LearningResource(
                        skill_id=skill.id,
                        title=res["title"],
                        provider=res["provider"],
                        url=res["url"],
                        format=res["format"],
                        difficulty=res["difficulty"],
                        is_free=res["is_free"],
                        cost_info=res.get("cost_info", "100% Free Access"),
                        description=res["description"],
                        rating=res["rating"],
                    )
                )

    db.flush()

    # -------------------------------------------------------------
    # 6. Interactive Assessment Quizzes
    # -------------------------------------------------------------
    quizzes_data = [
        # Advanced Excel
        {
            "skill_slug": "advanced-excel-spreadsheets",
            "question": "What is the primary architectural advantage of XLOOKUP over the traditional VLOOKUP formula in Excel?",
            "options": [
                "XLOOKUP only works on numeric data and executes in O(1) time",
                "XLOOKUP defaults to an exact match, looks both left and right, and handles column additions without breaking",
                "XLOOKUP automatically encrypts the worksheet data",
                "XLOOKUP requires the lookup array to be strictly sorted ascending"
            ],
            "correct_answer_index": 1,
            "explanation": "XLOOKUP defaults to exact match (unlike VLOOKUP's TRUE/approximate default), can return items to the left of the lookup column, and refers to return ranges directly rather than hardcoded column index numbers.",
            "difficulty": "intermediate"
        },
        {
            "skill_slug": "advanced-excel-spreadsheets",
            "question": "In an Excel financial model, which keyboard/formula practice is essential for dynamic sensitivity tables?",
            "options": [
                "Hardcoding final values with colored fonts",
                "Using absolute references ($A$1) and two-variable Data Tables connected to input assumptions",
                "Manually recalculating every cell using a handheld calculator",
                "Deleting all named ranges from the workbook"
            ],
            "correct_answer_index": 1,
            "explanation": "Two-variable Data Tables (What-If Analysis) let you test how varying two key assumptions (e.g. discount rate and revenue growth) simultaneously impact key outputs (e.g. NPV).",
            "difficulty": "intermediate"
        },
        # SQL & Database Systems
        {
            "skill_slug": "database-systems-sql",
            "question": "What is the functional difference between an INNER JOIN and a LEFT OUTER JOIN in SQL?",
            "options": [
                "INNER JOIN returns only rows with matches in both tables; LEFT JOIN returns all rows from the left table plus matching rows from the right table",
                "LEFT JOIN deletes unmatched rows from the database permanently",
                "INNER JOIN can only be used on primary keys, while LEFT JOIN cannot",
                "There is no difference in modern relational database engines"
            ],
            "correct_answer_index": 0,
            "explanation": "INNER JOIN retains records where the join predicate evaluates to true in both tables. LEFT OUTER JOIN preserves every row from the left table, filling missing right-table columns with NULL.",
            "difficulty": "beginner"
        },
        {
            "skill_slug": "database-systems-sql",
            "question": "Why does executing `WHERE column_name = NULL` in SQL return no rows even if NULL values exist?",
            "options": [
                "NULL represents an unknown value in three-valued logic, so comparison requires `IS NULL` instead of `= NULL`",
                "SQL databases do not support the equality operator",
                "The table must be re-indexed first",
                "NULL values are automatically converted to 0 in SQL queries"
            ],
            "correct_answer_index": 0,
            "explanation": "In ANSI SQL three-valued logic (TRUE, FALSE, UNKNOWN), any comparison with NULL using `=` results in UNKNOWN. You must use `IS NULL` or `IS NOT NULL`.",
            "difficulty": "intermediate"
        },
        # Python Programming
        {
            "skill_slug": "python-programming",
            "question": "In Python, which of the following standard data types is mutable?",
            "options": [
                "tuple",
                "frozenset",
                "list",
                "str"
            ],
            "correct_answer_index": 2,
            "explanation": "Lists, dictionaries, and sets are mutable in Python; tuples, strings, integers, and frozensets are immutable.",
            "difficulty": "beginner"
        },
        {
            "skill_slug": "python-programming",
            "question": "What is the key benefit of a Python generator function using the `yield` keyword over returning a full list?",
            "options": [
                "Generators automatically run multithreaded on all CPU cores",
                "Generators evaluate lazily on-demand, consuming O(1) memory regardless of sequence size",
                "Generators guarantee all exceptions are suppressed",
                "Generators can only yield strings"
            ],
            "correct_answer_index": 1,
            "explanation": "Generators produce items one at a time on demand (`yield`) instead of allocating memory for the entire collection up front, enabling streaming of gigabyte-scale datasets.",
            "difficulty": "intermediate"
        },
        # Requirements Engineering / Business Analysis
        {
            "skill_slug": "requirements-engineering-user-stories",
            "question": "In the Agile INVEST framework for evaluating user stories, what does the letter 'V' stand for?",
            "options": [
                "Verified",
                "Valuable",
                "Versatile",
                "Visual"
            ],
            "correct_answer_index": 1,
            "explanation": "INVEST stands for Independent, Negotiable, Valuable (delivers clear value to users or business), Estimable, Small, and Testable.",
            "difficulty": "intermediate"
        },
        {
            "skill_slug": "requirements-engineering-user-stories",
            "question": "What is the standard structure of a Gherkin scenario used in Acceptance Criteria?",
            "options": [
                "Input -> Processing -> Output",
                "Given (precondition) -> When (action/trigger) -> Then (expected outcome)",
                "Problem -> Solution -> Metrics",
                "Subject -> Verb -> Object"
            ],
            "correct_answer_index": 1,
            "explanation": "Gherkin format uses 'Given' (context/state), 'When' (event occurs), and 'Then' (observable expected outcome) to establish unambiguous acceptance criteria.",
            "difficulty": "beginner"
        },
        # SEO & Digital Marketing
        {
            "skill_slug": "digital-marketing-seo-strategy",
            "question": "Why is a `rel='canonical'` link tag used on web pages in Technical SEO?",
            "options": [
                "To tell search engines which URL represents the master copy of a page, preventing duplicate content dilution",
                "To force Google to re-crawl the website every hour",
                "To automatically generate social media preview images",
                "To hide paid advertisement links from search engines"
            ],
            "correct_answer_index": 0,
            "explanation": "Canonical tags resolve duplicate or parameter-based URL variations by specifying the authoritative URL search engines should index and credit with ranking signals.",
            "difficulty": "intermediate"
        },
        # UI/UX & Figma
        {
            "skill_slug": "ui-ux-wireframing-figma",
            "question": "What is the primary purpose of Figma's Auto Layout feature in modern design systems?",
            "options": [
                "To generate 3D animated renders",
                "To create responsive components that automatically resize, pad, and wrap like CSS Flexbox",
                "To compress image file sizes for web publishing",
                "To run automated usability tests with real users"
            ],
            "correct_answer_index": 1,
            "explanation": "Auto Layout mirrors CSS Flexbox behaviors, allowing frames and buttons to adapt dynamically as text content changes or screen dimensions shift.",
            "difficulty": "beginner"
        },
        # Financial Modeling
        {
            "skill_slug": "financial-modeling-valuation",
            "question": "In a Discounted Cash Flow (DCF) model, why is Unlevered Free Cash Flow (UFCF) discounted using the Weighted Average Cost of Capital (WACC)?",
            "options": [
                "WACC accounts for both the cost of equity and cost of debt, matching UFCF which belongs to all capital providers",
                "WACC is always equal to the statutory corporate tax rate",
                "WACC ignores inflation completely",
                "Because debt holders have no claim on business cash flows"
            ],
            "correct_answer_index": 0,
            "explanation": "Unlevered Free Cash Flow represents cash generated before interest payments, meaning it is available to both debt and equity investors. Therefore, it must be discounted using the blended cost of both: WACC.",
            "difficulty": "advanced"
        },
        # Agile & Scrum
        {
            "skill_slug": "agile-scrum-project-management",
            "question": "In Scrum, who is ultimately responsible for maximizing the business value of the product resulting from the team's work?",
            "options": [
                "The Scrum Master",
                "The Product Owner",
                "The Lead Developer",
                "The Project Management Office (PMO)"
            ],
            "correct_answer_index": 1,
            "explanation": "According to the Scrum Guide, the Product Owner is accountable for maximizing the value of the product by managing and ordering the Product Backlog.",
            "difficulty": "beginner"
        },
    ]

    for q_data in quizzes_data:
        skill = skills_dict.get(q_data["skill_slug"])
        if skill:
            exists = db.query(AssessmentQuiz).filter_by(
                skill_id=skill.id, question=q_data["question"]
            ).first()
            if not exists:
                db.add(
                    AssessmentQuiz(
                        skill_id=skill.id,
                        question=q_data["question"],
                        options=q_data["options"],
                        correct_answer_index=q_data["correct_answer_index"],
                        explanation=q_data["explanation"],
                        difficulty=q_data["difficulty"],
                    )
                )

    db.flush()

    # -------------------------------------------------------------
    # 7. Portfolio Projects (Tech & Non-Tech)
    # -------------------------------------------------------------
    projects_data = [
        # Software Engineer
        {
            "role_slug": "software-development-engineer",
            "name": "Distributed In-Memory Key-Value Cache with Raft Consensus",
            "slug": "distributed-kv-cache-raft",
            "problem_statement": "Design a high-throughput, fault-tolerant in-memory key-value storage engine supporting atomic transactions, TTL expiration, and consensus replication across multiple nodes.",
            "skills_covered": ["Data Structures & Algorithms", "Operating Systems & Linux", "Computer Networks", "System Design & Architecture"],
            "difficulty": "Advanced",
            "estimated_hours": 30,
            "suggested_tech_stack": ["Go or Python", "TCP Sockets", "Docker", "PyTest"],
            "milestones": [
                "Implement single-node in-memory store with LRU eviction and thread-safe locks",
                "Define custom binary communication protocol over TCP",
                "Implement Raft leader election and log replication logic",
                "Benchmark throughput and demonstrate failover resilience under node shutdown"
            ],
            "evaluation_criteria": [
                "Zero data race conditions under concurrent load test",
                "Clean recovery upon primary node simulation crash",
                "Comprehensive unit and integration test coverage (>80%)"
            ],
            "deliverables": ["GitHub repository with architecture documentation and benchmark results"],
            "portfolio_presentation_tips": "Highlight how your Raft leader election resolves split-brain scenarios under network partition simulation."
        },
        # Full-Stack Developer
        {
            "role_slug": "full-stack-developer",
            "name": "Enterprise Talent & Skill Roadmap Intelligence Platform",
            "slug": "talent-skill-roadmap-platform",
            "problem_statement": "Build an end-to-end full-stack SaaS platform that assesses candidate skills, compares with role benchmarks, and generates dynamic multi-week preparation roadmaps.",
            "skills_covered": ["React.js & State Management", "RESTful API Design & FastAPI", "Database Systems & SQL", "Docker & DevOps Fundamentals"],
            "difficulty": "Intermediate",
            "estimated_hours": 25,
            "suggested_tech_stack": ["React + Vite", "FastAPI", "SQLite/PostgreSQL", "Tailwind CSS"],
            "milestones": [
                "Design relational DB schema with foreign keys and topological dependencies",
                "Build REST API endpoints with Pydantic validation and JWT authentication",
                "Develop responsive React frontend with dark theme, glassmorphism, and Recharts",
                "Containerize frontend and backend using multi-stage Dockerfiles"
            ],
            "evaluation_criteria": [
                "Sub-100ms API response latency on roadmap calculations",
                "Clean responsive UI with no layout shifts on mobile or tablet",
                "Production build passing zero ESLint or PyTest warnings"
            ],
            "deliverables": ["Live web demo URL and GitHub repository with full README setup guide"],
            "portfolio_presentation_tips": "Showcase your component state hierarchy and explain your DAG topological sequencing logic."
        },
        # Business Analyst
        {
            "role_slug": "business-analyst",
            "name": "Omnichannel Retail Supply Chain Requirements & KPI Dashboard",
            "slug": "retail-supply-chain-requirements-kpi",
            "problem_statement": "Conduct end-to-end business analysis for a retail chain experiencing fulfillment bottlenecks. Produce a complete PRD with INVEST user stories, process flow diagrams, and an interactive executive KPI model.",
            "skills_covered": ["Requirements Gathering & User Stories", "Advanced Excel & Spreadsheets", "Business KPI & Metrics Analysis", "Executive & Stakeholder Communication"],
            "difficulty": "Intermediate",
            "estimated_hours": 20,
            "suggested_tech_stack": ["Excel (Pivot & What-If)", "BPMN / Miro", "Notion PRD", "Tableau or Power BI"],
            "milestones": [
                "Map current-state 'As-Is' vs future-state 'To-Be' fulfillment process flows in BPMN",
                "Author comprehensive Product Requirement Document (PRD) with 15+ user stories and acceptance criteria",
                "Construct interactive Excel KPI model forecasting inventory stockout reduction and cost savings",
                "Deliver executive slide deck with actionable implementation roadmap"
            ],
            "evaluation_criteria": [
                "Clear traceability between business problem, user stories, and KPI impact",
                "Accurate financial and fulfillment sensitivity modeling in spreadsheets",
                "Professional executive communication tone in presentation deck"
            ],
            "deliverables": ["PRD Specification Document", "Dynamic Excel Financial Model", "Executive Presentation Deck (PDF)"],
            "portfolio_presentation_tips": "Present the business ROI: explain how your proposed workflow reduces order turnaround by 28%."
        },
        # Digital Marketing Specialist
        {
            "role_slug": "digital-marketing-specialist",
            "name": "D2C Brand Organic Growth & Performance Marketing Audit",
            "slug": "d2c-growth-seo-performance-audit",
            "problem_statement": "Execute a full-funnel digital growth audit for a direct-to-consumer e-commerce brand. Develop a comprehensive technical SEO roadmap, keyword cluster strategy, and high-converting landing page copywriting campaign.",
            "skills_covered": ["SEO & Content Marketing Strategy", "Google Analytics 4 & Tag Manager", "Copywriting & Brand Storytelling", "Market Research & Competitor Benchmarking"],
            "difficulty": "Intermediate",
            "estimated_hours": 18,
            "suggested_tech_stack": ["Google Analytics 4", "SEMrush / Ahrefs", "Google Docs Editorial Calendar", "Figma Wireframe"],
            "milestones": [
                "Audit technical SEO: crawl health, site architecture, canonicalization, and core web vitals",
                "Build keyword intent matrix mapping 50+ keywords to top/middle/bottom of funnel",
                "Write persuasive copy for 3 high-intent landing pages with A/B test hypotheses",
                "Create GA4 measurement strategy with custom conversion events and ROAS dashboard"
            ],
            "evaluation_criteria": [
                "Data-backed keyword prioritization based on search volume and business intent",
                "Compelling headline and call-to-action copy following direct response principles",
                "Clear attribution model separating paid vs organic acquisition channels"
            ],
            "deliverables": ["Technical SEO Audit Report", "Keyword Cluster Spreadsheet", "Landing Page Copy Deck & Wireframe"],
            "portfolio_presentation_tips": "Focus on the conversion funnel: show before/after headline tests and estimated organic traffic lift."
        },
        # UI/UX Designer
        {
            "role_slug": "ui-ux-designer",
            "name": "Telemedicine Healthcare Mobile App UX Redesign & Design System",
            "slug": "telemedicine-ux-redesign-figma",
            "problem_statement": "Design an accessible, human-centric mobile patient onboarding and appointment booking flow for a healthcare app with high drop-off rates.",
            "skills_covered": ["UI/UX Wireframing & Prototyping (Figma)", "Design Thinking & User Research", "Visual Design & Layout Hierarchy", "Presentation & Pitching Skills"],
            "difficulty": "Intermediate",
            "estimated_hours": 22,
            "suggested_tech_stack": ["Figma", "FigJam", "Miro", "Loom Video Walkthrough"],
            "milestones": [
                "Conduct user research: empathy maps, 2 primary patient personas, and journey drop-off diagnosis",
                "Create low-fidelity wireframes and test 3 appointment scheduling variants",
                "Build scalable Figma design system with color tokens, typography scales, and interactive button variants",
                "Deliver clickable high-fidelity mobile prototype with micro-interactions"
            ],
            "evaluation_criteria": [
                "Adherence to WCAG 2.1 AA accessibility contrast guidelines",
                "Logical usability progression with minimal cognitive load during critical booking steps",
                "Modular Figma component library leveraging auto-layout and component properties"
            ],
            "deliverables": ["Figma Prototype Link", "Design System Component Sheet", "Case Study Walkthrough Deck"],
            "portfolio_presentation_tips": "Walk through your UX trade-offs: explain why variant B reduced booking friction by 40% in user testing."
        },
        # HR Specialist
        {
            "role_slug": "hr-specialist",
            "name": "High-Growth Tech Startup Talent Acquisition & Competency Framework",
            "slug": "startup-talent-acquisition-framework",
            "problem_statement": "Design a complete talent acquisition and onboarding infrastructure for a scaling startup, including job architecture, competency rubrics, structured STAR interview guides, and retention metrics.",
            "skills_covered": ["Talent Acquisition & HR Lifecycle", "Emotional Intelligence & Empathy", "Executive & Stakeholder Communication", "Business Writing & Documentation"],
            "difficulty": "Intermediate",
            "estimated_hours": 16,
            "suggested_tech_stack": ["Notion HR Portal", "Google Sheets Recruitment Tracker", "Google Docs Candidate Scorecards"],
            "milestones": [
                "Define role competency matrix and salary benchmarking bands for 5 core startup roles",
                "Develop structured STAR behavioral interview guide with anti-bias scoring rubrics",
                "Map 90-day employee onboarding journey with milestone check-ins and pulse survey templates",
                "Create recruitment funnel tracker measuring Time-to-Hire, Cost-per-Hire, and Offer Acceptance Rate"
            ],
            "evaluation_criteria": [
                "Equitable and objective interview scoring rubrics aligned to role competencies",
                "Comprehensive 30-60-90 day onboarding roadmap fostering psychological safety",
                "Accurate recruitment funnel metrics modeling"
            ],
            "deliverables": ["Talent Acquisition Playbook (PDF)", "STAR Interview Scorecard Kit", "Recruitment Metrics Dashboard"],
            "portfolio_presentation_tips": "Demonstrate your understanding of structured hiring: show how objective rubrics eliminate hiring bias."
        },
        # Financial Analyst
        {
            "role_slug": "financial-analyst",
            "name": "B2B SaaS Three-Statement Financial Forecast & DCF Valuation Model",
            "slug": "saas-three-statement-dcf-valuation",
            "problem_statement": "Build a fully integrated three-statement financial model (P&L, Balance Sheet, Cash Flow) with dynamic debt schedule, revenue cohorts, and Discounted Cash Flow (DCF) enterprise valuation.",
            "skills_covered": ["Financial Modeling & Valuation", "Advanced Excel & Spreadsheets", "Business KPI & Metrics Analysis", "Presentation & Pitching Skills"],
            "difficulty": "Advanced",
            "estimated_hours": 24,
            "suggested_tech_stack": ["Microsoft Excel", "Power BI / PowerPoint", "Financial FactSet/SEC Filings"],
            "milestones": [
                "Construct historical 3-year financial statements with clean schedule formatting and error checks",
                "Build dynamic operational revenue build based on ARR, net revenue retention (NRR), and churn",
                "Build working capital, depreciation (PP&E), and debt interest amortization schedules",
                "Calculate WACC and perform DCF valuation with two-variable sensitivity tables (growth vs discount rate)"
            ],
            "evaluation_criteria": [
                "Balance sheet balances across all projected years with zero manual plugs",
                "Dynamic formulas with zero hardcoded numbers in calculation rows",
                "Professional IB/PE formatting standards (blue for inputs, black for formulas, green for links)"
            ],
            "deliverables": ["Dynamic Excel Model (.xlsx)", "Valuation Summary Memo (PDF)", "Executive Pitch Deck"],
            "portfolio_presentation_tips": "Walk through your sensitivity analysis: explain how a 100bps shift in terminal growth impacts equity value."
        },
    ]

    for p_data in projects_data:
        role = roles_dict.get(p_data["role_slug"])
        if role:
            exists = db.query(Project).filter_by(slug=p_data["slug"]).first()
            if not exists:
                db.add(
                    Project(
                        role_id=role.id,
                        name=p_data["name"],
                        slug=p_data["slug"],
                        problem_statement=p_data["problem_statement"],
                        skills_covered=p_data["skills_covered"],
                        difficulty=p_data["difficulty"],
                        estimated_hours=p_data["estimated_hours"],
                        suggested_tech_stack=p_data["suggested_tech_stack"],
                        milestones=p_data["milestones"],
                        evaluation_criteria=p_data["evaluation_criteria"],
                        deliverables=p_data.get("deliverables", []),
                        portfolio_presentation_tips=p_data.get("portfolio_presentation_tips"),
                    )
                )

    db.flush()

    # -------------------------------------------------------------
    # 8. Interview Questions (Technical, Domain & Behavioral)
    # -------------------------------------------------------------
    questions_data = [
        # DSA / Coding
        {
            "category": "DSA",
            "title": "Two Sum & Two Pointers Pattern",
            "question": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Explain both the hash map approach and the two-pointer approach on a sorted array.",
            "sample_answer": "1. Hash Map approach: Iterate through the array once while maintaining a hash map of {value: index}. For each element x, check if (target - x) exists in the map. If yes, return current index and mapped index. Time Complexity: O(n), Space Complexity: O(n).\n2. Two Pointers approach: If the array is sorted, place left pointer at 0 and right pointer at n-1. If sum < target, advance left; if sum > target, decrement right; if equal, return indices. Time Complexity: O(n log n) if unsorted, O(1) auxiliary space.",
            "difficulty": "Easy",
            "key_points": [
                "Time vs space trade-off between Hash Map O(n)/O(n) and Two Pointers O(n)/O(1)",
                "Edge cases: duplicates, negative numbers, no valid pair",
                "Explain why two pointers requires sorted order"
            ],
        },
        # Business Analysis Case Study
        {
            "category": "Case Study",
            "title": "Diagnosing a 30% Checkout Drop-Off in E-Commerce",
            "question": "A retail client notices that 30% of shoppers abandon their cart at the payment review step. As a Business Analyst, how would you structure your investigation and what recommendations would you deliver?",
            "sample_answer": "1. Problem Framing: Segment abandonment by device (mobile vs desktop), browser, payment method, and geographic region to isolate technical failures vs UX friction.\n2. Data Analysis: Examine event funnels in Google Analytics/Mixpanel. Check latency of payment gateway API calls and unexpected charges (shipping fees, taxes) disclosed late in the flow.\n3. Stakeholder Discovery: Interview customer support leads to collect qualitative complaints.\n4. Hypotheses & Tests: A) Mandatory account creation adds friction -> test guest checkout. B) Hidden shipping costs -> test upfront calculator. C) Missing local payment options -> integrate UPI/Apple Pay.\n5. Outcome Measurement: Track checkout completion rate and average order value via A/B test.",
            "difficulty": "Medium",
            "key_points": [
                "Structured approach: quantitative data first, qualitative feedback second",
                "Isolate technical glitches from user experience friction",
                "Propose prioritized, measurable A/B test solutions"
            ],
        },
        # Digital Marketing Case Study
        {
            "category": "Case Study",
            "title": "SEO Recovery After an Organic Traffic Drop",
            "question": "A website's organic search traffic dropped by 40% over a 3-week span. What is your diagnostic checklist to identify the root cause?",
            "sample_answer": "1. Google Search Console Check: Inspect Manual Actions report and Security Issues. Check whether drop coincides with an announced Google Core Algorithm Update.\n2. Technical Crawl: Run a Screaming Frog audit to check for accidental `noindex` robots tags, broken canonical links, or XML sitemap errors.\n3. URL Level Analysis: Determine whether the drop is sitewide or concentrated on specific high-traffic URLs. Check if a recent code release deleted key H1/schema tags or increased LCP/CLS latency.\n4. Competitor & SERP Intent: Check if search intent shifted or if featured snippets/zero-click results were captured by competitors.\n5. Action Plan: Revert erroneous tags, disavow toxic backlink spikes if algorithmic, and update stale content with authoritative original data.",
            "difficulty": "Medium",
            "key_points": [
                "Distinguish algorithmic update impact from self-inflicted technical errors",
                "Use Google Search Console impressions vs click analysis",
                "Check recent deployment changelogs and server status codes"
            ],
        },
        # Financial Analysis
        {
            "category": "Case Study",
            "title": "Walking Through the Three Financial Statements",
            "question": "If depreciation expense increases by $10, walk me through how this impacts the Income Statement, Cash Flow Statement, and Balance Sheet (assuming a 20% corporate tax rate).",
            "sample_answer": "1. Income Statement: Operating income (EBIT) decreases by $10. With a 20% tax rate, net income decreases by $10 * (1 - 0.20) = $8.\n2. Cash Flow Statement: Net income starts at -$8. Depreciation is a non-cash expense, so we add back the entire $10. Net change in operating cash flow is +$2 (cash increased by $2 due to the tax shield).\n3. Balance Sheet: Cash increases by $2 on the asset side. PP&E decreases by $10 (due to depreciation). Total Assets decrease by $8. On the Liabilities & Equity side, Retained Earnings decreases by $8 (matching Net Income). Both sides balance perfectly: -$8 = -$8.",
            "difficulty": "Intermediate",
            "key_points": [
                "Understand the non-cash nature of depreciation and the resulting tax shield",
                "Explain the exact flow through each financial statement sequentially",
                "Verify that Assets = Liabilities + Shareholders' Equity balances"
            ],
        },
        # HR / Behavioral
        {
            "category": "HR/Behavioral",
            "title": "STAR Method: Resolving a Critical Cross-Functional Conflict",
            "question": "Tell me about a time you experienced a significant disagreement with a teammate or stakeholder over project direction. How did you handle it?",
            "sample_answer": "Situation: In our previous product launch, the marketing team demanded an immediate release, while engineering flagged 3 unresolved accessibility compliance bugs.\nTask: As the project lead, I needed to protect product quality and legal compliance without missing our enterprise marketing campaign window.\nAction: I scheduled a 30-minute sync with both leads. Instead of debating opinions, I created a risk-impact matrix showing the legal exposure of the a11y bugs versus the cost of a 4-day release delay. I proposed a phased release: launching a private beta to media partners immediately while dedicating a 48-hour sprint to patch the 3 compliance bugs before public traffic hit.\nResult: Both teams aligned on the compromise. We launched on time with zero compliance violations and achieved a 94% customer satisfaction score.",
            "difficulty": "Medium",
            "key_points": [
                "Structured STAR method (Situation, Task, Action, Result)",
                "Objective, data-driven resolution instead of emotional confrontation",
                "Creative win-win compromise that respects both technical and business goals"
            ],
        },
    ]

    for q_data in questions_data:
        exists = db.query(InterviewQuestion).filter_by(title=q_data["title"]).first()
        if not exists:
            db.add(
                InterviewQuestion(
                    role_id=None,
                    category=q_data["category"],
                    title=q_data["title"],
                    question=q_data["question"],
                    sample_answer=q_data["sample_answer"],
                    difficulty=q_data["difficulty"],
                    key_points=q_data["key_points"],
                    is_completed=False,
                    is_bookmarked=False,
                )
            )

    # -------------------------------------------------------------
    # 9. Daily Challenges (Gamified Learning Quests)
    # -------------------------------------------------------------
    challenges_data = [
        {
            "category": "SQL",
            "title": "Find the 2nd Highest Salary Without LIMIT",
            "description": "Write an ANSI SQL query to retrieve the second highest distinct salary from the Employees table without using LIMIT, OFFSET, or TOP.",
            "difficulty": "Medium",
            "time_estimate_mins": 10,
            "instructions": "Use a subquery with MAX() or DENSE_RANK() window function to return the 2nd distinct salary.",
            "starter_prompt": "SELECT MAX(salary) AS SecondHighestSalary FROM Employees WHERE salary < (...);",
            "xp_reward": 75,
        },
        {
            "category": "Python",
            "title": "Validate Balanced Brackets with a Stack",
            "description": "Implement a Python function `is_valid_brackets(s: str) -> bool` that verifies whether parentheses '()', braces '{}', and brackets '[]' are matched and closed in the correct order.",
            "difficulty": "Easy",
            "time_estimate_mins": 15,
            "instructions": "Push opening brackets to a stack; pop and check matching bracket on closing characters. Handle edge cases like odd length and empty strings.",
            "starter_prompt": "def is_valid_brackets(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    # Write logic here\n    return len(stack) == 0",
            "xp_reward": 75,
        },
        {
            "category": "Excel",
            "title": "Dynamic Two-Way Lookup with XLOOKUP",
            "description": "Construct a single nested XLOOKUP formula to retrieve the revenue for a specific Department (row) and Month (column).",
            "difficulty": "Medium",
            "time_estimate_mins": 10,
            "instructions": "Nest one XLOOKUP inside another: the outer lookup returns the array row, while the inner lookup locates the column index.",
            "starter_prompt": "=XLOOKUP(TargetDept, DeptList, XLOOKUP(TargetMonth, MonthHeaderList, DataGrid))",
            "xp_reward": 75,
        },
        {
            "category": "Business Analysis",
            "title": "Draft Given-When-Then for User OTP Login",
            "description": "Write a standardized Gherkin acceptance test scenario for a mobile banking login flow with SMS One-Time Password (OTP) verification including rate-limiting upon 3 failed attempts.",
            "difficulty": "Medium",
            "time_estimate_mins": 15,
            "instructions": "Structure your answer with Feature, Scenario, Given, When, and Then statements covering both success and lockout.",
            "starter_prompt": "Scenario: User enters incorrect OTP 3 times\nGiven the user has requested an OTP...\nWhen the user submits an incorrect code 3 consecutive times...\nThen the account should be locked for 15 minutes.",
            "xp_reward": 75,
        },
        {
            "category": "Marketing",
            "title": "Diagnose LTV to CAC Ratio Health",
            "description": "A SaaS company spends $120,000 on Google Ads and acquires 400 customers. Average customer lifespan is 24 months at $35/month gross margin. Calculate CAC, LTV, and LTV:CAC ratio. Is this sustainable?",
            "difficulty": "Easy",
            "time_estimate_mins": 10,
            "instructions": "CAC = Spend / Customers. LTV = Margin * Lifespan. Determine if LTV:CAC >= 3:1.",
            "starter_prompt": "CAC = $120,000 / 400 = $300\nLTV = $35 * 24 = $840\nRatio = 840 / 300 = 2.8x (Slightly below healthy 3x benchmark).",
            "xp_reward": 75,
        },
        {
            "category": "UI/UX",
            "title": "WCAG Touch Target & Contrast Audit",
            "description": "Evaluate a mobile checkout confirmation screen. What are the minimum WCAG 2.1 AA touch target sizes and color contrast ratios required for normal text and buttons?",
            "difficulty": "Easy",
            "time_estimate_mins": 10,
            "instructions": "State the minimum touch target dimensions in CSS pixels (44x44 or 48x48) and contrast ratio (4.5:1 for normal text, 3:1 for large text).",
            "starter_prompt": "1. Minimum touch target size: 44x44 CSS pixels (WCAG 2.5.5) / 48x48dp (Material Design)\n2. Text contrast ratio: 4.5:1 minimum for body text, 3:1 for large/bold text.",
            "xp_reward": 75,
        },
    ]

    for c_data in challenges_data:
        exists = db.query(DailyChallenge).filter_by(title=c_data["title"]).first()
        if not exists:
            db.add(DailyChallenge(**c_data))

    db.commit()

    # Seed gamification content (achievements, bosses, arena)
    seed_gamification_content(db)
    print("Database seeding completed successfully with 14 career tracks, challenges, and rich curriculum!")


def seed_gamification_content(db: Session) -> None:
    """Seeds standard achievements, 5 milestone Boss Battles, and 5 Career Arenas."""
    # 1. Standard Achievements
    achievements_data = [
        {
            "slug": "first_quest",
            "title": "First Quest Complete",
            "description": "Completed your very first career learning quest or roadmap checkpoint.",
            "category": "quest",
            "xp_reward": 100,
            "icon": "Sparkles",
            "badge_color": "#00f0ff",
        },
        {
            "slug": "first_coding_problem",
            "title": "Code Breaker",
            "description": "Conquered your first practical challenge in the Career Arena.",
            "category": "arena",
            "xp_reward": 100,
            "icon": "Code2",
            "badge_color": "#38bdf8",
        },
        {
            "slug": "seven_day_streak",
            "title": "Relentless Momentum",
            "description": "Maintained an unbroken 7-day learning and practice streak.",
            "category": "streak",
            "xp_reward": 200,
            "icon": "Flame",
            "badge_color": "#f59e0b",
        },
        {
            "slug": "bug_slayer",
            "title": "Boss Slayer",
            "description": "Defeated your first milestone Boss Battle.",
            "category": "boss",
            "xp_reward": 250,
            "icon": "ShieldAlert",
            "badge_color": "#ef4444",
        },
        {
            "slug": "project_architect",
            "title": "Project Architect",
            "description": "Built and submitted verified repository evidence for a capstone project.",
            "category": "project",
            "xp_reward": 250,
            "icon": "FolderGit2",
            "badge_color": "#10b981",
        },
        {
            "slug": "interview_warrior",
            "title": "Interview Warrior",
            "description": "Successfully completed 5 evaluated mock technical and behavioral interview responses.",
            "category": "interview",
            "xp_reward": 200,
            "icon": "MessageSquareCode",
            "badge_color": "#c084fc",
        },
        {
            "slug": "roadmap_master",
            "title": "Career Roadmap Master",
            "description": "Mastered all curriculum phases and checkpoints in your target career journey.",
            "category": "mastery",
            "xp_reward": 500,
            "icon": "Trophy",
            "badge_color": "#fbbf24",
        },
    ]

    for ach in achievements_data:
        exists = db.query(Achievement).filter_by(slug=ach["slug"]).first()
        if not exists:
            db.add(Achievement(**ach))

    # 2. Five Milestone Boss Battles
    bosses_data = [
        {
            "slug": "java_core_boss",
            "title": "Java Fundamentals Boss",
            "boss_name": "The Bytecode Titan",
            "boss_title": "Guardian of JVM Memory & OOP Principles",
            "category": "Core Fundamentals",
            "difficulty": "Intermediate",
            "health_points": 100,
            "required_level": 1,
            "xp_reward": 250,
            "badge_slug": "bug_slayer",
            "passing_score": 70.0,
            "description": "A towering sentinel forged from JVM internals. Prove your mastery of memory management, polymorphism, and exception hierarchies to defeat it.",
            "phases": [
                {
                    "phase": 1,
                    "question": "What happens when an object in Java is unreachable in heap memory?",
                    "options": [
                        "It is instantly deallocated synchronously",
                        "It becomes eligible for Garbage Collection",
                        "A StackOverflowError is thrown",
                        "It gets pushed into PermGen/Metaspace"
                    ],
                    "correct_index": 1,
                    "explanation": "Unreachable objects become eligible for GC during mark-and-sweep or generational GC cycles."
                },
                {
                    "phase": 2,
                    "question": "Which statement about Java's synchronized block is TRUE?",
                    "options": [
                        "It uses the monitor lock of the specified object",
                        "It prevents all threads from executing any method",
                        "It only works on primitive types",
                        "It bypasses the thread scheduler completely"
                    ],
                    "correct_index": 0,
                    "explanation": "synchronized(obj) acquires the intrinsic monitor lock of obj, ensuring mutual exclusion."
                },
                {
                    "phase": 3,
                    "question": "How does Java 8+ HashMap handle bucket hash collisions when bucket size exceeds 8?",
                    "options": [
                        "Converts the bucket linked list into a Red-Black Tree (O(log N))",
                        "Discards the older keys using LRU eviction",
                        "Throws a HashCollisionException",
                        "Rehashes the entire table synchronously to double size"
                    ],
                    "correct_index": 0,
                    "explanation": "When a bucket list exceeds TREEIFY_THRESHOLD (8) and table capacity >= 64, it converts to TreeNode (Red-Black tree) reducing worst-case lookup from O(N) to O(log N)."
                }
            ]
        },
        {
            "slug": "dsa_pattern_boss",
            "title": "DSA Boss",
            "boss_name": "The Graph Colossus",
            "boss_title": "Master of Recursion, Trees & Dynamic Programming",
            "category": "Algorithms & DSA",
            "difficulty": "Advanced",
            "health_points": 100,
            "required_level": 2,
            "xp_reward": 350,
            "badge_slug": "bug_slayer",
            "passing_score": 70.0,
            "description": "An ancient elemental entity formed of cyclic dependencies and recursive states. Overcome its algorithmic trials to claim victory.",
            "phases": [
                {
                    "phase": 1,
                    "question": "What is the optimal algorithm to detect a cycle in a directed graph?",
                    "options": [
                        "Kruskal's algorithm with Disjoint Set Union",
                        "DFS with 3-color states (White, Gray, Black) or Kahn's Topological Sort",
                        "Dijkstra's shortest path algorithm",
                        "Floyd-Warshall all-pairs shortest paths"
                    ],
                    "correct_index": 1,
                    "explanation": "DFS with 3-state tracking detects back-edges (Gray nodes), while Kahn's indegree queue detects cycles if visited count < V."
                },
                {
                    "phase": 2,
                    "question": "In the 0/1 Knapsack problem with N items and capacity W, what are the time and auxiliary space complexities?",
                    "options": [
                        "O(2^N) time, O(1) space",
                        "O(N * W) pseudo-polynomial time, O(W) space",
                        "O(N log N) time, O(N) space",
                        "O(W^2) time, O(N) space"
                    ],
                    "correct_index": 1,
                    "explanation": "Bottom-up 1D space-optimized DP solves 0/1 knapsack in O(N*W) time and O(W) auxiliary space."
                },
                {
                    "phase": 3,
                    "question": "Which data structure provides O(1) average time for insert, delete, and getRandom()?",
                    "options": [
                        "ArrayList with a HashMap of indices",
                        "Balanced AVL Tree",
                        "Singly Linked List with tail pointer",
                        "Min-Heap with binary search"
                    ],
                    "correct_index": 0,
                    "explanation": "An ArrayList stores elements while a HashMap maps value -> array index. Deletions swap the target with the last element and pop in O(1)."
                }
            ]
        },
        {
            "slug": "aptitude_matrix_boss",
            "title": "Aptitude Boss",
            "boss_name": "The Quantitative Sphinx",
            "boss_title": "Architect of Logic & Mathematical Puzzles",
            "category": "Aptitude & Logic",
            "difficulty": "Intermediate",
            "health_points": 100,
            "required_level": 2,
            "xp_reward": 250,
            "badge_slug": "bug_slayer",
            "passing_score": 70.0,
            "description": "Solve its mathematical riddles in work rates, probability, and speed to shatter its riddle barrier.",
            "phases": [
                {
                    "phase": 1,
                    "question": "Pipe A can fill a tank in 6 hours, and Pipe B can empty it in 8 hours. If both are opened together, in how many hours will the tank be full?",
                    "options": ["14 hours", "24 hours", "12 hours", "18 hours"],
                    "correct_index": 1,
                    "explanation": "Net rate = (1/6 - 1/8) = (4 - 3)/24 = 1/24 per hour. Tank fills in 24 hours."
                },
                {
                    "phase": 2,
                    "question": "Two cards are drawn at random from a standard 52-card deck without replacement. What is the probability that both are Kings?",
                    "options": ["(4/52) * (3/51) = 1/221", "(4/52) * (4/52) = 1/169", "1/52", "2/52"],
                    "correct_index": 0,
                    "explanation": "First King: 4/52. Second King: 3/51. Combined = (4*3)/(52*51) = 12/2652 = 1/221."
                },
                {
                    "phase": 3,
                    "question": "A train 180m long passes an electric pole in 9 seconds. What is the train's speed in km/h?",
                    "options": ["72 km/h", "60 km/h", "80 km/h", "90 km/h"],
                    "correct_index": 0,
                    "explanation": "Speed = 180m / 9s = 20 m/s. In km/h: 20 * (18/5) = 72 km/h."
                }
            ]
        },
        {
            "slug": "architecture_boss",
            "title": "Technical Interview Boss",
            "boss_name": "The Distributed Archon",
            "boss_title": "Master of System Design, Caching & CAP Theorem",
            "category": "System Architecture",
            "difficulty": "Advanced",
            "health_points": 100,
            "required_level": 3,
            "xp_reward": 350,
            "badge_slug": "bug_slayer",
            "passing_score": 70.0,
            "description": "A hyper-resilient microservice construct spanning multiple data centers. Demonstrate system partitioning and fault recovery to neutralize it.",
            "phases": [
                {
                    "phase": 1,
                    "question": "According to the CAP Theorem, during a network partition, what must a distributed system choose between?",
                    "options": [
                        "Consistency vs Availability",
                        "Latency vs Scalability",
                        "Throughput vs Durability",
                        "Security vs Performance"
                    ],
                    "correct_index": 0,
                    "explanation": "When network partition (P) occurs, the system must choose between returning consistent latest data (CP) or remaining available with potentially stale data (AP)."
                },
                {
                    "phase": 2,
                    "question": "How does Consistent Hashing mitigate cache server node additions or removals in a distributed cluster?",
                    "options": [
                        "Only K/N keys need to be remapped on average instead of all keys",
                        "It locks the database during reshuffling",
                        "It converts all hash keys into contiguous strings",
                        "It eliminates cache misses completely"
                    ],
                    "correct_index": 0,
                    "explanation": "With consistent hashing on a ring, adding or removing a node only impacts neighbors, remapping approximately 1/N of keys."
                },
                {
                    "phase": 3,
                    "question": "What is the primary trade-off when using Write-Back (Write-Behind) caching over Write-Through?",
                    "options": [
                        "Lower write latency but potential risk of data loss if cache fails before flushing to DB",
                        "Higher latency on reads",
                        "Inability to handle concurrent readers",
                        "Requires relational SQLite only"
                    ],
                    "correct_index": 0,
                    "explanation": "Write-back acknowledges writes immediately after writing to cache, improving latency, but risks data loss if the cache node crashes before async DB flush."
                }
            ]
        },
        {
            "slug": "final_placement_boss",
            "title": "Final Placement Simulation Boss",
            "boss_name": "The Placement Overlord",
            "boss_title": "Final Gatekeeper of Industry Readiness",
            "category": "Placement Simulation",
            "difficulty": "Legendary",
            "health_points": 100,
            "required_level": 4,
            "xp_reward": 500,
            "badge_slug": "roadmap_master",
            "passing_score": 75.0,
            "description": "The ultimate industry recruitment gauntlet combining algorithms, architectural trade-offs, behavioral STAR handling, and database indexing.",
            "phases": [
                {
                    "phase": 1,
                    "question": "You need to process 10 million streaming events per minute with deduplication. Which architecture is best?",
                    "options": [
                        "Kafka message stream with Redis Bloom filter / sliding window deduplication and async worker pools",
                        "Direct synchronous HTTP POST to a single SQLite instance",
                        "Cron job reading from a local JSON file once per hour",
                        "Sending each event as an email attachment"
                    ],
                    "correct_index": 0,
                    "explanation": "Partitioned Kafka event log + distributed Redis Bloom filter/TTL keys handles high-throughput stream deduplication with sub-millisecond lookups."
                },
                {
                    "phase": 2,
                    "question": "When an interviewer asks 'Tell me about a time you made a major mistake in production', what is the ideal STAR response structure?",
                    "options": [
                        "Blame the junior teammate and explain why it was not your fault",
                        "Situation (context), Task (goal), Action (how you took ownership, fixed the root cause, added alerting), and Result (outcomes & preventive safeguards)",
                        "Claim you have never made any mistakes in production",
                        "Refuse to answer questions about past failures"
                    ],
                    "correct_index": 1,
                    "explanation": "Hiring managers look for mature accountability, rapid systematic incident triage, blameless post-mortem analysis, and automated guardrails."
                },
                {
                    "phase": 3,
                    "question": "Why does a composite index on (user_id, status, created_at) NOT accelerate a query with WHERE created_at > NOW() without filtering on user_id?",
                    "options": [
                        "Leftmost prefix rule: B-tree indexes require preceding columns to be matched first",
                        "Indexes only work on primary keys",
                        "created_at cannot be indexed in SQL",
                        "Database engines ignore composite indexes automatically"
                    ],
                    "correct_index": 0,
                    "explanation": "B-Tree composite indexes require leftmost prefix match. Without user_id, the index cannot be searched hierarchically and requires an index scan or table scan."
                }
            ]
        }
    ]

    for boss in bosses_data:
        exists = db.query(BossBattle).filter_by(slug=boss["slug"]).first()
        if not exists:
            db.add(BossBattle(**boss))

    # 3. Career Arena Challenges (5 Arenas)
    arena_data = [
        # DSA Arena
        {
            "slug": "dsa-two-sum-hash",
            "arena_type": "dsa",
            "title": "Two-Sum Hash Map Target Lookup",
            "difficulty": "Medium",
            "time_limit_mins": 20,
            "xp_reward": 90,
            "problem_statement": "Given an array of integers nums and an integer target, write a function to return indices of the two numbers such that they add up to target in O(N) time and O(N) space.",
            "starter_code": "def two_sum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
            "test_cases": [{"input": "[2, 7, 11, 15], target=9", "expected": "[0, 1]"}],
            "rubric": {"time_complexity": "O(N)", "space_complexity": "O(N)"},
            "hints": ["Use a hash map to remember indices of previously seen values."]
        },
        {
            "slug": "dsa-lru-cache",
            "arena_type": "dsa",
            "title": "Design LRU Cache with O(1) Operations",
            "difficulty": "Hard",
            "time_limit_mins": 30,
            "xp_reward": 140,
            "problem_statement": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with get(key) and put(key, value) operations running in O(1) average time complexity.",
            "starter_code": "class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}\n\n    def get(self, key: int) -> int:\n        # TODO: Move to front and return\n        return self.cache.get(key, -1)\n\n    def put(self, key: int, value: int) -> None:\n        # TODO: Evict least recently used if full\n        self.cache[key] = value",
            "test_cases": [{"input": "put(1, 1), put(2, 2), get(1), put(3, 3), get(2)", "expected": "-1"}],
            "rubric": {"get_complexity": "O(1)", "put_complexity": "O(1)"},
            "hints": ["Combine a doubly linked list with a hash map."]
        },
        # Aptitude Arena
        {
            "slug": "apt-work-rate",
            "arena_type": "aptitude",
            "title": "Combined Work & Pipe Flow Optimization",
            "difficulty": "Medium",
            "time_limit_mins": 15,
            "xp_reward": 75,
            "problem_statement": "Worker A completes a project in 12 days. Worker B is 50% more efficient than A. How many days will they take to complete the project working together?",
            "starter_code": "# Calculate days:\n# A's rate = 1/12\n# B's rate = (1/12) * 1.5 = 1/8\n# Combined = 1/12 + 1/8 = 5/24\n# Days = 24 / 5 = 4.8 days",
            "test_cases": [{"input": "A=12 days, B=1.5x efficiency", "expected": "4.8 days"}],
            "rubric": {"accuracy": "4.8 days"},
            "hints": ["Convert efficiency into unit rates per day."]
        },
        # Technical Interview Arena
        {
            "slug": "tech-fastapi-concurrency",
            "arena_type": "technical",
            "title": "FastAPI Async Event Loop & Worker Pools",
            "difficulty": "Medium",
            "time_limit_mins": 20,
            "xp_reward": 100,
            "problem_statement": "Explain how FastAPI handles async def vs regular def endpoints under the hood. What occurs if a CPU-bound blocking computation is run inside an async def function?",
            "starter_code": "# Write explanation covering:\n# 1. ThreadPoolExecutor for regular 'def'\n# 2. Main asyncio event loop for 'async def'\n# 3. Event loop starvation when blocking code runs in async def",
            "test_cases": [],
            "rubric": {"event_loop_explanation": 30, "threadpool_distinction": 35, "mitigation_strategy": 35},
            "hints": ["Mention asyncio threadpool and starvation."]
        },
        # HR Interview Arena
        {
            "slug": "hr-star-deadlines",
            "arena_type": "hr",
            "title": "Managing High-Stakes Deadline Conflicts",
            "difficulty": "Medium",
            "time_limit_mins": 15,
            "xp_reward": 80,
            "problem_statement": "Describe a scenario where critical feature requirements changed 48 hours before a production deployment deadline. How did you communicate with stakeholders and safeguard code quality?",
            "starter_code": "Situation: ...\nTask: ...\nAction: ...\nResult: ...",
            "test_cases": [],
            "rubric": {"STAR_structure": 30, "stakeholder_communication": 35, "quality_safeguards": 35},
            "hints": ["Use clear Situation, Task, Action, and Result headers."]
        },
        # Project Challenge Arena
        {
            "slug": "proj-sliding-window-limiter",
            "arena_type": "project",
            "title": "Build a Resilient Sliding-Window Rate Limiter",
            "difficulty": "Hard",
            "time_limit_mins": 35,
            "xp_reward": 150,
            "problem_statement": "Design an in-memory or Redis-backed sliding-window rate limiter middleware that permits at most 100 requests per minute per IP address with burst handling.",
            "starter_code": "import time\n\nclass SlidingWindowLimiter:\n    def __init__(self, max_requests: int = 100, window_secs: int = 60):\n        self.max_requests = max_requests\n        self.window_secs = window_secs\n        self.requests = {}  # ip -> list of timestamps\n\n    def is_allowed(self, ip: str) -> bool:\n        now = time.time()\n        # TODO: Evict timestamps older than now - window_secs\n        # TODO: Check if len < max_requests\n        return True",
            "test_cases": [{"input": "100 requests in 30s", "expected": "Allowed"}],
            "rubric": {"correctness": 40, "memory_efficiency": 30, "concurrency_handling": 30},
            "hints": ["Remove timestamps outside the current sliding window before appending."]
        }
    ]

    for ar in arena_data:
        exists = db.query(ArenaChallenge).filter_by(slug=ar["slug"]).first()
        if not exists:
            db.add(ArenaChallenge(**ar))

    db.commit()
