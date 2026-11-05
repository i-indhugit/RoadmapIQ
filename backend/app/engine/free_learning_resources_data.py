"""
Curated Catalog of Genuine, Free Online Learning Resources for RoadmapIQ.
Every single resource in this catalog is verified, accessible, and 100% free (or free-to-audit without paywall).
Covers official documentation, university courseware, interactive platforms, and video courses.
"""
from typing import Dict, List, Any, Optional

VERIFIED_FREE_RESOURCES: List[Dict[str, Any]] = [
    # Technology & Programming
    {
        "id": "res-py-official",
        "domain": "Technology and IT",
        "topic": "Python Programming",
        "title": "Official Python 3 Documentation & Tutorial",
        "provider": "Python Software Foundation",
        "url": "https://docs.python.org/3/tutorial/",
        "format": "documentation",
        "difficulty": "beginner",
        "estimated_duration": "12 hours",
        "free_status": "100% Free Open Access",
        "description": "Comprehensive, authoritative guide from Python core developers covering data types, control flow, functions, OOP, and standard libraries.",
        "rating": 4.9
    },
    {
        "id": "res-py-fcc",
        "domain": "Technology and IT",
        "topic": "Python Fundamentals",
        "title": "Python for Beginners - Full Free Course",
        "provider": "freeCodeCamp",
        "url": "https://www.youtube.com/watch?v=rfscVS0vtbw",
        "format": "video",
        "difficulty": "beginner",
        "estimated_duration": "4.5 hours",
        "free_status": "100% Free YouTube",
        "description": "Clear step-by-step video tutorial covering variables, loops, lists, dictionaries, functions, and building beginner mini-projects.",
        "rating": 4.8
    },
    {
        "id": "res-cs50-py",
        "domain": "Technology and IT",
        "topic": "Algorithmic Python",
        "title": "CS50's Introduction to Programming with Python",
        "provider": "Harvard University",
        "url": "https://cs50.harvard.edu/python/",
        "format": "course",
        "difficulty": "intermediate",
        "estimated_duration": "30 hours",
        "free_status": "100% Free Courseware",
        "description": "Harvard's open course teaching functions, conditionals, loops, exceptions, libraries, unit tests, file I/O, regex, and OOP.",
        "rating": 5.0
    },
    {
        "id": "res-java-mooc",
        "domain": "Technology and IT",
        "topic": "Core Java & OOP",
        "title": "Java Programming I & II Online MOOC",
        "provider": "University of Helsinki",
        "url": "https://java-programming.mooc.fi/",
        "format": "practice",
        "difficulty": "intermediate",
        "estimated_duration": "40 hours",
        "free_status": "100% Free Interactive Course",
        "description": "World-renowned interactive course with automated tests in NetBeans/VS Code covering OOP, collections, file streams, and algorithms.",
        "rating": 4.9
    },
    {
        "id": "res-spring-baeldung",
        "domain": "Technology and IT",
        "topic": "Spring Boot",
        "title": "Spring Boot Reference Guides and Tutorials",
        "provider": "Baeldung",
        "url": "https://www.baeldung.com/spring-boot",
        "format": "documentation",
        "difficulty": "intermediate",
        "estimated_duration": "15 hours",
        "free_status": "100% Free Access",
        "description": "Industry-standard architectural articles explaining dependency injection, REST APIs, JPA persistence, security, and microservices.",
        "rating": 4.8
    },
    {
        "id": "res-mdn-web",
        "domain": "Technology and IT",
        "topic": "Web Foundations",
        "title": "MDN Web Docs - HTML, CSS & JavaScript",
        "provider": "Mozilla",
        "url": "https://developer.mozilla.org/en-US/docs/Web",
        "format": "documentation",
        "difficulty": "beginner",
        "estimated_duration": "25 hours",
        "free_status": "100% Free Open Web Standard",
        "description": "Authoritative documentation for HTML5 semantics, modern CSS Flexbox/Grid layouts, and modern ECMAScript standard behaviors.",
        "rating": 5.0
    },
    {
        "id": "res-react-dev",
        "domain": "Technology and IT",
        "topic": "React.js",
        "title": "React Official Interactive Documentation",
        "provider": "React Team",
        "url": "https://react.dev/learn",
        "format": "practice",
        "difficulty": "intermediate",
        "estimated_duration": "18 hours",
        "free_status": "100% Free Interactive",
        "description": "Modern React docs emphasizing component thinking, props, declarative state, effect lifecycles, and custom hooks with in-browser sandboxes.",
        "rating": 4.9
    },
    {
        "id": "res-fullstack-open",
        "domain": "Technology and IT",
        "topic": "Full Stack Engineering",
        "title": "Full Stack Open - Modern Web Development",
        "provider": "University of Helsinki",
        "url": "https://fullstackopen.com/en/",
        "format": "course",
        "difficulty": "advanced",
        "estimated_duration": "60 hours",
        "free_status": "100% Free Open Course",
        "description": "Deep-dive into React, Redux, Node.js, Express, MongoDB/PostgreSQL, TypeScript, GraphQL, CI/CD, and containerization.",
        "rating": 5.0
    },
    {
        "id": "res-fastapi-docs",
        "domain": "Technology and IT",
        "topic": "API Development",
        "title": "FastAPI Complete Tutorial & Guide",
        "provider": "FastAPI (Tiangolo)",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "format": "documentation",
        "difficulty": "intermediate",
        "estimated_duration": "10 hours",
        "free_status": "100% Free Open Source",
        "description": "High-performance Python API framework documentation with automatic OpenAPI docs, Pydantic validation, async/await, and JWT security.",
        "rating": 4.9
    },
    {
        "id": "res-docker-curriculum",
        "domain": "Cloud, DevOps & Systems Engineering",
        "topic": "Docker & Containers",
        "title": "Docker for Beginners Practical Curriculum",
        "provider": "Prakhar Srivastav",
        "url": "https://docker-curriculum.com/",
        "format": "documentation",
        "difficulty": "beginner",
        "estimated_duration": "6 hours",
        "free_status": "100% Free Community Guide",
        "description": "Practical hands-on guide teaching container fundamentals, Dockerfiles, port binding, multi-container compose, and AWS deployment.",
        "rating": 4.8
    },
    {
        "id": "res-k8s-basics",
        "domain": "Cloud, DevOps & Systems Engineering",
        "topic": "Kubernetes",
        "title": "Kubernetes Official Interactive Tutorials",
        "provider": "Kubernetes.io / Linux Foundation",
        "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
        "format": "practice",
        "difficulty": "intermediate",
        "estimated_duration": "8 hours",
        "free_status": "100% Free Interactive Terminal",
        "description": "Deploy, expose, scale, and update containerized applications on live terminal Kubernetes pods and cluster nodes.",
        "rating": 4.8
    },

    # AI & Data Science
    {
        "id": "res-kaggle-learn",
        "domain": "Data Science & Analytics",
        "topic": "Data Science Micro-Courses",
        "title": "Kaggle Learn - Python, Pandas, SQL & ML",
        "provider": "Kaggle / Google",
        "url": "https://www.kaggle.com/learn",
        "format": "practice",
        "difficulty": "beginner",
        "estimated_duration": "20 hours",
        "free_status": "100% Free Interactive Notebooks",
        "description": "Hands-on micro-courses with executable Jupyter kernels covering data cleaning, exploratory analysis, SQL queries, and baseline Scikit-Learn models.",
        "rating": 4.9
    },
    {
        "id": "res-fastai-dl",
        "domain": "Artificial Intelligence & Machine Learning",
        "topic": "Deep Learning",
        "title": "Practical Deep Learning for Coders",
        "provider": "fast.ai",
        "url": "https://course.fast.ai/",
        "format": "course",
        "difficulty": "intermediate",
        "estimated_duration": "35 hours",
        "free_status": "100% Free Course",
        "description": "Top-down pragmatic deep learning curriculum by Jeremy Howard teaching CNNs, tabular models, NLP, PyTorch, and fine-tuning with zero math gatekeeping.",
        "rating": 5.0
    },
    {
        "id": "res-statquest-ml",
        "domain": "Data Science & Analytics",
        "topic": "Machine Learning Fundamentals",
        "title": "StatQuest with Josh Starmer - ML & Stats",
        "provider": "StatQuest",
        "url": "https://www.youtube.com/c/joshstarmer",
        "format": "video",
        "difficulty": "beginner",
        "estimated_duration": "15 hours",
        "free_status": "100% Free YouTube",
        "description": "Visually breaks down complex mathematical models: PCA, decision trees, random forests, neural networks, p-values, and linear regression.",
        "rating": 4.9
    },
    {
        "id": "res-huggingface-nlp",
        "domain": "Artificial Intelligence & Machine Learning",
        "topic": "NLP & Transformers",
        "title": "Hugging Face Natural Language Processing Course",
        "provider": "Hugging Face",
        "url": "https://huggingface.co/learn/nlp-course/",
        "format": "course",
        "difficulty": "intermediate",
        "estimated_duration": "20 hours",
        "free_status": "100% Free Interactive Course",
        "description": "Master transformer architectures, tokenizers, fine-tuning BERT and GPT models, Datasets library, and evaluating models on real tasks.",
        "rating": 5.0
    },
    {
        "id": "res-google-genai",
        "domain": "Artificial Intelligence & Machine Learning",
        "topic": "Generative AI",
        "title": "Generative AI for Developers Learning Path",
        "provider": "Google Cloud",
        "url": "https://www.cloudskillsboost.google/paths/118",
        "format": "course",
        "difficulty": "intermediate",
        "estimated_duration": "15 hours",
        "free_status": "100% Free Courseware",
        "description": "Official Google learning path covering LLM architecture, attention mechanisms, prompt engineering, Gemini API integrations, and responsible AI.",
        "rating": 4.8
    },

    # Cybersecurity
    {
        "id": "res-owasp-top10",
        "domain": "Cybersecurity & Information Security",
        "topic": "Web Application Security",
        "title": "OWASP Top Ten Web Application Security Risks",
        "provider": "OWASP Foundation",
        "url": "https://owasp.org/www-project-top-ten/",
        "format": "documentation",
        "difficulty": "intermediate",
        "estimated_duration": "8 hours",
        "free_status": "100% Free Open Standard",
        "description": "The globally recognized benchmark for web application flaws: Broken Access Control, Cryptographic Failures, Injection, and Insecure Design.",
        "rating": 4.9
    },
    {
        "id": "res-portswigger-academy",
        "domain": "Cybersecurity & Information Security",
        "topic": "Ethical Hacking & Pen Testing",
        "title": "PortSwigger Web Security Academy",
        "provider": "PortSwigger (Burp Suite)",
        "url": "https://portswigger.net/web-security",
        "format": "practice",
        "difficulty": "intermediate",
        "estimated_duration": "40 hours",
        "free_status": "100% Free Interactive Labs",
        "description": "Real vulnerable sandbox labs to practice SQL injection, cross-site scripting (XSS), CSRF, SSRF, and JWT attacks with Burp Suite.",
        "rating": 5.0
    },
    {
        "id": "res-prof-messer-secplus",
        "domain": "Cybersecurity & Information Security",
        "topic": "Information Security Fundamentals",
        "title": "CompTIA Security+ Training Course",
        "provider": "Professor Messer",
        "url": "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/",
        "format": "video",
        "difficulty": "beginner",
        "estimated_duration": "16 hours",
        "free_status": "100% Free Video Course",
        "description": "Complete, comprehensive video series covering threats, attacks, vulnerabilities, identity management, cryptography, and risk assessment.",
        "rating": 4.9
    },

    # Commerce & Finance
    {
        "id": "res-khan-finance",
        "domain": "Commerce, Finance & Banking",
        "topic": "Finance & Capital Markets",
        "title": "Finance and Capital Markets Curriculum",
        "provider": "Khan Academy",
        "url": "https://www.khanacademy.org/economics-finance-domain/core-finance",
        "format": "video",
        "difficulty": "beginner",
        "estimated_duration": "14 hours",
        "free_status": "100% Free Educational Platform",
        "description": "Clear conceptual videos explaining interest rates, bonds, equity stocks, financial statements, inflation, options, and banking systems.",
        "rating": 4.9
    },
    {
        "id": "res-damodaran-finance",
        "domain": "Commerce, Finance & Banking",
        "topic": "Corporate Valuation",
        "title": "Corporate Finance & Valuation Video Lectures",
        "provider": "Prof. Aswath Damodaran (NYU Stern)",
        "url": "https://pages.stern.nyu.edu/~adamodar/",
        "format": "course",
        "difficulty": "advanced",
        "estimated_duration": "35 hours",
        "free_status": "100% Free Open University Course",
        "description": "The 'Dean of Valuation' provides complete semester video lectures, syllabi, and Excel financial modeling templates on DCF and pricing.",
        "rating": 5.0
    },
    {
        "id": "res-cfi-resources",
        "domain": "Commerce, Finance & Banking",
        "topic": "Financial Modeling",
        "title": "CFI Financial Guides & Excel Templates",
        "provider": "Corporate Finance Institute",
        "url": "https://corporatefinanceinstitute.com/resources/",
        "format": "documentation",
        "difficulty": "intermediate",
        "estimated_duration": "15 hours",
        "free_status": "100% Free Open Library",
        "description": "Authoritative guides on 3-statement models, DCF valuation formulas, working capital metrics, and accounting ratios.",
        "rating": 4.8
    },

    # Business, Management & Consulting
    {
        "id": "res-atlassian-agile",
        "domain": "Business, Management & Consulting",
        "topic": "Agile & Scrum",
        "title": "Atlassian Agile Coach - Complete Scrum Guide",
        "provider": "Atlassian",
        "url": "https://www.atlassian.com/agile",
        "format": "documentation",
        "difficulty": "beginner",
        "estimated_duration": "8 hours",
        "free_status": "100% Free Knowledge Base",
        "description": "Industry best practices on sprints, standups, retrospectives, burndown charts, story points, and Kanban boards.",
        "rating": 4.8
    },
    {
        "id": "res-product-school",
        "domain": "Business, Management & Consulting",
        "topic": "Product Management",
        "title": "The Product Book & Free Resources",
        "provider": "Product School",
        "url": "https://productschool.com/resources",
        "format": "documentation",
        "difficulty": "intermediate",
        "estimated_duration": "12 hours",
        "free_status": "100% Free eBooks & Templates",
        "description": "Comprehensive guide on user discovery, writing PRDs, prioritization matrices (RICE), metrics (AARRR), and product roadmaps.",
        "rating": 4.8
    },

    # Design, Media & Creative Arts
    {
        "id": "res-figma-learn",
        "domain": "Design, Media & Creative Arts",
        "topic": "UI/UX & Prototyping",
        "title": "Figma Official Design Tutorial Series",
        "provider": "Figma",
        "url": "https://help.figma.com/hc/en-us/categories/360002042553-Figma-design",
        "format": "practice",
        "difficulty": "beginner",
        "estimated_duration": "10 hours",
        "free_status": "100% Free Official Tutorials",
        "description": "Master auto-layout, nested component variants, interactive prototyping, design tokens, and developer handoff in Figma.",
        "rating": 4.9
    },
    {
        "id": "res-laws-of-ux",
        "domain": "Design, Media & Creative Arts",
        "topic": "UX Psychology",
        "title": "Laws of UX - Psychological Design Principles",
        "provider": "Jon Yablonski",
        "url": "https://lawsofux.com/",
        "format": "documentation",
        "difficulty": "beginner",
        "estimated_duration": "4 hours",
        "free_status": "100% Free Visual Guide",
        "description": "Exquisite visual compendium of cognitive heuristics: Fitts's Law, Hick's Law, Jakob's Law, and Miller's Rule applied to interface design.",
        "rating": 5.0
    },
    {
        "id": "res-nngroup-articles",
        "domain": "Design, Media & Creative Arts",
        "topic": "Usability Research",
        "title": "Nielsen Norman Group Usability Research Library",
        "provider": "Nielsen Norman Group (NN/g)",
        "url": "https://www.nngroup.com/articles/",
        "format": "documentation",
        "difficulty": "intermediate",
        "estimated_duration": "20 hours",
        "free_status": "100% Free Open Research",
        "description": "Empirical usability benchmarks, wireframing guidelines, accessibility best practices, and user research interview techniques.",
        "rating": 5.0
    },

    # Healthcare, Medicine & Sciences
    {
        "id": "res-ncbi-bookshelf",
        "domain": "Healthcare, Medicine & Life Sciences",
        "topic": "Medical Reference & Anatomy",
        "title": "NCBI Bookshelf - Free Biomedical Textbooks",
        "provider": "National Institutes of Health (NIH)",
        "url": "https://www.ncbi.nlm.nih.gov/books/",
        "format": "documentation",
        "difficulty": "intermediate",
        "estimated_duration": "40 hours",
        "free_status": "100% Free National Library of Medicine",
        "description": "Free full-text access to authoritative biomedical textbooks covering pharmacology, human physiology, biochemistry, and pathology.",
        "rating": 4.9
    },
    {
        "id": "res-openwho-health",
        "domain": "Healthcare, Medicine & Life Sciences",
        "topic": "Public Health & Epidemiology",
        "title": "OpenWHO Free Interactive Health Courses",
        "provider": "World Health Organization (WHO)",
        "url": "https://openwho.org/",
        "format": "course",
        "difficulty": "beginner",
        "estimated_duration": "12 hours",
        "free_status": "100% Free WHO Certificate Courses",
        "description": "Interactive learning modules from WHO covering disease outbreak response, infection prevention, immunization, and epidemiology.",
        "rating": 4.8
    },

    # Law & Public Policy
    {
        "id": "res-india-const",
        "domain": "Law & Legal Services",
        "topic": "Constitutional Law",
        "title": "The Constitution of India Official Digital Portal",
        "provider": "Ministry of Law and Justice, Government of India",
        "url": "https://legislative.gov.in/constitution-of-india/",
        "format": "documentation",
        "difficulty": "intermediate",
        "estimated_duration": "15 hours",
        "free_status": "100% Free Public Government Resource",
        "description": "Official, authenticated full text of the Constitution of India including fundamental rights, directive principles, and amendments.",
        "rating": 5.0
    },
    {
        "id": "res-cornell-law",
        "domain": "Law & Legal Services",
        "topic": "Legal Research & Jurisprudence",
        "title": "Legal Information Institute (LII)",
        "provider": "Cornell Law School",
        "url": "https://www.law.cornell.edu/",
        "format": "documentation",
        "difficulty": "beginner",
        "estimated_duration": "10 hours",
        "free_status": "100% Free Open Legal Access",
        "description": "Free open-access legal encyclopedia, contract law summaries, tort definitions, and international legal principles.",
        "rating": 4.9
    },
    {
        "id": "res-niti-policy",
        "domain": "Government, Civil Services & Public Policy",
        "topic": "Public Policy & Development",
        "title": "NITI Aayog Policy Reports & Sectoral Action Agendas",
        "provider": "NITI Aayog (National Institution for Transforming India)",
        "url": "https://www.niti.gov.in/reports",
        "format": "documentation",
        "difficulty": "intermediate",
        "estimated_duration": "12 hours",
        "free_status": "100% Free Government Repository",
        "description": "Authentic policy vision documents, economic white papers, healthcare reform strategies, and sustainable development goal indexes.",
        "rating": 4.8
    },

    # Agriculture & Environment
    {
        "id": "res-fao-agriculture",
        "domain": "Agriculture, Environment & Sustainability",
        "topic": "Sustainable Agriculture",
        "title": "FAO Digital Library & Ag Learning Portals",
        "provider": "Food and Agriculture Organization of the UN",
        "url": "https://www.fao.org/publications/en",
        "format": "documentation",
        "difficulty": "intermediate",
        "estimated_duration": "15 hours",
        "free_status": "100% Free United Nations Open Access",
        "description": "Global research reports on soil nutrition, climate-smart farming, watershed management, hydroponics, and crop protection.",
        "rating": 4.8
    },
    {
        "id": "res-ghg-protocol",
        "domain": "Agriculture, Environment & Sustainability",
        "topic": "Carbon Accounting & Sustainability",
        "title": "Greenhouse Gas Protocol Corporate Standard",
        "provider": "World Resources Institute & WBCSD",
        "url": "https://ghgprotocol.org/corporate-standard",
        "format": "documentation",
        "difficulty": "intermediate",
        "estimated_duration": "10 hours",
        "free_status": "100% Free Global Standard",
        "description": "The world's most widely used greenhouse gas accounting standard for Scope 1, Scope 2, and Scope 3 emissions calculations.",
        "rating": 4.9
    }
]

def get_resources_for_domain(domain: str) -> List[Dict[str, Any]]:
    return [r for r in VERIFIED_FREE_RESOURCES if r["domain"].lower() == domain.lower()]

def get_resources_for_topic(topic_query: str) -> List[Dict[str, Any]]:
    q = topic_query.lower()
    return [
        r for r in VERIFIED_FREE_RESOURCES
        if q in r["topic"].lower() or q in r["title"].lower() or q in r["domain"].lower()
    ]

