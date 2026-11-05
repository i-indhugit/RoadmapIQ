"""
Intelligent Career Discovery Engine for RoadmapIQ.
Evaluates student background, aptitude, interests, analytical style, and career goals
to recommend optimal career pathways across 18 domains with match percentages and rationale.
"""
from typing import Dict, List, Any
from app.engine.all_domain_careers_data import ALL_DOMAIN_CAREERS

DISCOVERY_QUESTIONS = [
    {
        "id": "stream",
        "question": "What is your primary educational background or degree stream?",
        "category": "education",
        "options": [
            {"value": "engineering_tech", "label": "Engineering & Technology (B.Tech / BCA / MCA / CS)"},
            {"value": "commerce_finance", "label": "Commerce & Finance (B.Com / BBA Finance / CA Intermediate)"},
            {"value": "arts_humanities", "label": "Arts & Humanities (English, History, Sociology, Mass Comm)"},
            {"value": "medical_healthcare", "label": "Healthcare & Life Sciences (MBBS / BDS / Nursing / Pharmacy / BMLT)"},
            {"value": "science_math", "label": "Natural & Applied Sciences (B.Sc Math, Physics, Statistics, Biotech)"},
            {"value": "business_management", "label": "Business & Management (BBA, MBA, General Management)"},
            {"value": "law_legal", "label": "Law & Legal Studies (LL.B. / B.A. LL.B.)"},
            {"value": "vocational_other", "label": "Diploma / Vocational / Self-Taught / Other"}
        ]
    },
    {
        "id": "interests",
        "question": "Which activity excites you the most on a day-to-day basis?",
        "category": "interest",
        "options": [
            {"value": "coding_software", "label": "Writing code, building web apps, algorithms, and software systems"},
            {"value": "ai_data", "label": "Analyzing patterns, statistics, machine learning models, and big data"},
            {"value": "finance_money", "label": "Financial markets, investment valuation, accounting, and economics"},
            {"value": "creative_design", "label": "Visual design, user experiences, branding, video editing, or animation"},
            {"value": "people_strategy", "label": "Leading teams, management consulting, product roadmaps, or startups"},
            {"value": "healthcare_biology", "label": "Clinical patient care, diagnosis, medical biology, and human physiology"},
            {"value": "law_governance", "label": "Public policy, legal rights, civil administration, and social impact"},
            {"value": "core_engineering", "label": "Designing physical machines, electrical circuits, civil structures, or hardware"}
        ]
    },
    {
        "id": "analytical_style",
        "question": "How do you prefer approaching complex challenges?",
        "category": "aptitude",
        "options": [
            {"value": "algorithmic", "label": "Breaking problems into logical, algorithmic steps and automated code"},
            {"value": "data_driven", "label": "Querying datasets, examining distributions, and verifying statistical proof"},
            {"value": "empathetic_human", "label": "Understanding human psychology, user emotional needs, and communication"},
            {"value": "strategic_business", "label": "Evaluating commercial trade-offs, market ROI, and competitive positioning"},
            {"value": "empirical_scientific", "label": "Formulating hypotheses, physical laboratory testing, and evidence gathering"},
            {"value": "legal_rhetorical", "label": "Interpreting rules, synthesizing precedents, and crafting persuasive arguments"}
        ]
    },
    {
        "id": "work_style",
        "question": "What is your ideal professional work environment?",
        "category": "lifestyle",
        "options": [
            {"value": "remote_tech", "label": "Modern digital workspace / remote flexibility with developer tools"},
            {"value": "corporate_client", "label": "High-energy corporate boardroom, consulting client presentations, and travel"},
            {"value": "clinical_hospital", "label": "Hospital, clinical medical facility, or patient-facing environment"},
            {"value": "creative_studio", "label": "Dynamic creative studio, agency, or digital media workshop"},
            {"value": "court_government", "label": "Courtrooms, public administration offices, or policy think-tanks"},
            {"value": "field_plant", "label": "Manufacturing plant, physical infrastructure site, or field operations"}
        ]
    },
    {
        "id": "career_priority",
        "question": "What is your primary career priority over the next 3-5 years?",
        "category": "ambition",
        "options": [
            {"value": "high_growth_tech", "label": "Rapid technical career growth and lucrative salary packages in tech"},
            {"value": "social_impact", "label": "Public service, societal welfare, and measurable community impact"},
            {"value": "creative_freedom", "label": "Creative expression, portfolio excellence, and original design"},
            {"value": "corporate_prestige", "label": "Executive leadership, corporate strategy, or high-stakes finance"},
            {"value": "entrepreneurship", "label": "Building my own startup venture and achieving financial independence"},
            {"value": "academic_research", "label": "Pioneering academic research, discoveries, and scientific patents"}
        ]
    }
]

STREAM_DOMAIN_AFFINITIES = {
    "engineering_tech": {
        "Technology and IT": 1.0,
        "Artificial Intelligence & Machine Learning": 0.95,
        "Cloud, DevOps & Systems Engineering": 0.95,
        "Cybersecurity & Information Security": 0.90,
        "Data Science & Analytics": 0.90,
        "Core Engineering": 0.85,
        "Entrepreneurship & Startups": 0.80,
        "Design, Media & Creative Arts": 0.70,
    },
    "commerce_finance": {
        "Commerce, Finance & Banking": 1.0,
        "Business, Management & Consulting": 0.95,
        "Data Science & Analytics": 0.85,
        "Entrepreneurship & Startups": 0.85,
        "Law & Legal Services": 0.70,
        "Technology and IT": 0.65,
    },
    "arts_humanities": {
        "Arts, Humanities & Social Sciences": 1.0,
        "Design, Media & Creative Arts": 0.90,
        "Government, Civil Services & Public Policy": 0.90,
        "Education, Teaching & Academic Research": 0.85,
        "Psychology & Behavioral Sciences": 0.85,
        "Law & Legal Services": 0.80,
        "Business, Management & Consulting": 0.70,
    },
    "medical_healthcare": {
        "Healthcare, Medicine & Life Sciences": 1.0,
        "Psychology & Behavioral Sciences": 0.90,
        "Data Science & Analytics": 0.75,
        "Education, Teaching & Academic Research": 0.75,
        "Government, Civil Services & Public Policy": 0.70,
    },
    "science_math": {
        "Data Science & Analytics": 0.95,
        "Artificial Intelligence & Machine Learning": 0.95,
        "Technology and IT": 0.90,
        "Education, Teaching & Academic Research": 0.90,
        "Core Engineering": 0.80,
        "Agriculture, Environment & Sustainability": 0.80,
        "Commerce, Finance & Banking": 0.75,
    },
    "business_management": {
        "Business, Management & Consulting": 1.0,
        "Commerce, Finance & Banking": 0.90,
        "Entrepreneurship & Startups": 0.90,
        "Hospitality, Tourism & Event Management": 0.85,
        "Data Science & Analytics": 0.75,
        "Technology and IT": 0.70,
    },
    "law_legal": {
        "Law & Legal Services": 1.0,
        "Government, Civil Services & Public Policy": 0.95,
        "Business, Management & Consulting": 0.80,
        "Commerce, Finance & Banking": 0.75,
        "Arts, Humanities & Social Sciences": 0.75,
    },
    "vocational_other": {
        "Technology and IT": 0.85,
        "Design, Media & Creative Arts": 0.85,
        "Hospitality, Tourism & Event Management": 0.85,
        "Entrepreneurship & Startups": 0.80,
        "Commerce, Finance & Banking": 0.70,
        "Agriculture, Environment & Sustainability": 0.70,
    }
}

INTEREST_ROLE_KEYWORDS = {
    "coding_software": ["developer", "engineer", "software", "backend", "frontend", "full stack", "mobile"],
    "ai_data": ["machine learning", "data", "ai", "analyst", "scientist", "nlp", "vision", "analytics"],
    "finance_money": ["financial", "banker", "accountant", "actuary", "wealth", "treasury", "credit", "audit"],
    "creative_design": ["designer", "ui", "ux", "visual", "editor", "animator", "writer", "creative", "artist"],
    "people_strategy": ["manager", "consultant", "product", "scrum", "operations", "recruiter", "partner"],
    "healthcare_biology": ["physician", "nurse", "therapist", "pharmacist", "clinical", "biomedical", "health"],
    "law_governance": ["legal", "lawyer", "attorney", "officer", "civil services", "policy", "diplomat", "compliance"],
    "core_engineering": ["mechanical", "electrical", "civil", "chemical", "aerospace", "automotive", "robotics"]
}

def evaluate_career_discovery(answers: Dict[str, str], db_roles: List[Any] = None) -> List[Dict[str, Any]]:
    """
    Evaluates questionnaire answers and scores all catalog careers.
    Returns the top 5 matched careers with match percentage, rationale, and competencies.
    """
    stream = answers.get("stream", "engineering_tech")
    interest = answers.get("interests", "coding_software")
    analytical_style = answers.get("analytical_style", "algorithmic")
    work_style = answers.get("work_style", "remote_tech")
    career_priority = answers.get("career_priority", "high_growth_tech")
    
    stream_affinities = STREAM_DOMAIN_AFFINITIES.get(stream, {})
    interest_keywords = INTEREST_ROLE_KEYWORDS.get(interest, [])
    
    scored_careers = []
    
    for career in ALL_DOMAIN_CAREERS:
        score = 50.0  # Base score
        
        # 1. Stream & Domain Affinity (up to +30 points)
        domain = career["domain"]
        domain_weight = stream_affinities.get(domain, 0.4)
        score += domain_weight * 30.0
        
        # 2. Interest Alignment (up to +15 points)
        title_lower = career["title"].lower()
        summary_lower = career["short_summary"].lower()
        keyword_hits = sum(1 for kw in interest_keywords if kw in title_lower or kw in summary_lower)
        if keyword_hits > 0:
            score += min(15.0, keyword_hits * 6.0)
            
        # 3. Work Style & Analytical Style Modifiers (+5 points)
        if work_style == "remote_tech" and domain in ["Technology and IT", "Artificial Intelligence & Machine Learning", "Design, Media & Creative Arts"]:
            score += 5.0
        elif work_style == "corporate_client" and domain in ["Business, Management & Consulting", "Commerce, Finance & Banking"]:
            score += 5.0
        elif work_style == "clinical_hospital" and domain in ["Healthcare, Medicine & Life Sciences", "Psychology & Behavioral Sciences"]:
            score += 5.0
        elif work_style == "court_government" and domain in ["Law & Legal Services", "Government, Civil Services & Public Policy"]:
            score += 5.0
            
        # 4. Ambition Alignment (+5 points)
        if career_priority == "high_growth_tech" and career["market_demand"] in ["Very High", "High"] and domain in ["Technology and IT", "Artificial Intelligence & Machine Learning", "Data Science & Analytics", "Cybersecurity & Information Security"]:
            score += 5.0
        elif career_priority == "entrepreneurship" and domain in ["Entrepreneurship & Startups", "Business, Management & Consulting"]:
            score += 5.0
        elif career_priority == "social_impact" and domain in ["Government, Civil Services & Public Policy", "Healthcare, Medicine & Life Sciences", "Agriculture, Environment & Sustainability"]:
            score += 5.0
            
        # Clamp match percentage between 60% and 98%
        match_percentage = round(min(98.0, max(60.0, score)), 1)
        
        # Educational alignment message
        if career["is_regulated_profession"]:
            edu_align = "Regulated Profession: Requires statutory degree & statutory council registration."
        elif any(degree.lower() in stream.replace("_", " ").lower() for degree in career["required_education"]):
            edu_align = "Direct Educational Match: Your stream directly fulfills standard entry prerequisites."
        else:
            edu_align = "Eligible Pathway: Open to candidates with demonstrated technical competencies and portfolio."
            
        reason = (
            f"Strong match for your {stream.replace('_', ' ').title()} stream and passion for {interest.replace('_', ' ')}. "
            f"Aligns closely with your {analytical_style.replace('_', ' ')} analytical style and {career['market_demand'].lower()} market demand."
        )
        
        scored_careers.append({
            "slug": career["slug"],
            "title": career["title"],
            "domain": career["domain"],
            "subdomain": career["subdomain"],
            "match_percentage": match_percentage,
            "match_reason": reason,
            "educational_alignment": edu_align,
            "key_competencies": career["core_competencies"][:5],
            "tools": career["tools_and_technologies"][:6],
            "average_salary_range": career["average_salary_range"],
            "market_demand": career["market_demand"],
            "icon": career["icon"],
            "is_regulated_profession": career["is_regulated_profession"],
            "regulatory_disclaimer": career["regulatory_disclaimer"]
        })
        
    # Sort descending by match percentage
    scored_careers.sort(key=lambda x: x["match_percentage"], reverse=True)
    return scored_careers[:5]

