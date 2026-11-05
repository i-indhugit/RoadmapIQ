"""
All-Domain Career Catalog for RoadmapIQ.
Contains all 252 comprehensive, authentic career profiles across 18 distinct domains:
- Technology and IT
- Artificial Intelligence & Machine Learning
- Data Science & Analytics
- Commerce, Finance & Banking
- Arts, Humanities & Social Sciences
- Business, Management & Consulting
- Healthcare, Medicine & Life Sciences
- Core Engineering
- Cybersecurity & Information Security
- Cloud, DevOps & Systems Engineering
- Law & Legal Services
- Education, Teaching & Academic Research
- Government, Civil Services & Public Policy
- Psychology & Behavioral Sciences
- Design, Media & Creative Arts
- Hospitality, Tourism & Event Management
- Agriculture, Environment & Sustainability
- Entrepreneurship & Startups
"""
from typing import Dict, List, Any, Optional
from app.engine.domain_definitions import DOMAIN_GROUPS

def _build_catalog() -> List[Dict[str, Any]]:
    catalog = []
    for grp in DOMAIN_GROUPS:
        domain_name = grp["domain"]
        category_name = grp["category"]
        for role_tuple in grp["roles"]:
            (title, slug, short_summary, description, education, eligibility,
             tools, competencies, responsibilities, progression,
             is_regulated, disclaimer, demand, salary, icon, subdomain) = role_tuple
            
            career_dict = {
                "slug": slug,
                "title": title,
                "category": category_name,
                "domain": domain_name,
                "subdomain": subdomain,
                "short_summary": short_summary,
                "description": description,
                "required_education": education,
                "eligibility_requirements": eligibility,
                "optional_qualifications": [f"Certifications in {competencies[0]}", f"Advanced professional diploma in {subdomain}"],
                "tools_and_technologies": tools,
                "core_competencies": competencies,
                "daily_responsibilities": responsibilities,
                "career_progression": progression,
                "is_regulated_profession": is_regulated,
                "regulatory_disclaimer": disclaimer,
                "market_demand": demand,
                "average_salary_range": salary,
                "icon": icon,
                "assessment_duration_mins": 30,
                "assessment_question_count": 25,
                "difficulty_distribution": {"fundamentals": 40, "intermediate": 30, "practical": 20, "advanced": 10}
            }
            catalog.append(career_dict)
    return catalog

ALL_DOMAIN_CAREERS: List[Dict[str, Any]] = _build_catalog()

CAREER_SLUG_MAP: Dict[str, Dict[str, Any]] = {
    c["slug"]: c for c in ALL_DOMAIN_CAREERS
}

DOMAIN_LIST: List[str] = [grp["domain"] for grp in DOMAIN_GROUPS]

def get_career_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    return CAREER_SLUG_MAP.get(slug)

def get_careers_by_domain(domain: str) -> List[Dict[str, Any]]:
    return [c for c in ALL_DOMAIN_CAREERS if c["domain"].lower() == domain.lower()]

def search_careers(query: str, domain: Optional[str] = None) -> List[Dict[str, Any]]:
    q = query.lower().strip()
    results = []
    for c in ALL_DOMAIN_CAREERS:
        if domain and c["domain"].lower() != domain.lower():
            continue
        if (q in c["title"].lower() or
            q in c["short_summary"].lower() or
            q in c["domain"].lower() or
            q in (c["subdomain"] or "").lower() or
            any(q in t.lower() for t in c["tools_and_technologies"]) or
            any(q in comp.lower() for comp in c["core_competencies"])):
            results.append(c)
    return results

if __name__ == "__main__":
    print(f"Loaded {len(ALL_DOMAIN_CAREERS)} careers across {len(DOMAIN_LIST)} domains.")

