"""
Build script to compile all 241 career profiles across 18 domains into
backend/app/engine/all_domain_careers_data.py.
"""
import sys
import json

def get_all_domains_catalog():
    # Will assemble all 18 domains
    from app.engine.domain_definitions import DOMAIN_GROUPS
    all_careers = []
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
                "optional_qualifications": [f"Certifications in {competencies[0]}", f"Advanced diploma in {subdomain}"],
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
            all_careers.append(career_dict)
    return all_careers

if __name__ == "__main__":
    print("Catalog builder loaded.")

