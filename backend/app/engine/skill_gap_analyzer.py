from typing import Dict, List, Set, Tuple, Any, Optional
from app.schemas import SkillGapItem, SkillGapAnalysisResponse


TECHNICAL_CATEGORIES = {
    "Technical skills",
    "Digital literacy skills",
    "Programming Languages",
    "Core CS",
    "Frontend",
    "Backend",
    "Data & AI",
    "DevOps & Tools",
    "Testing",
    "Data Analytics",
    "Cybersecurity"
}


def calculate_readiness_score(
    role_requirements: List[Any],
    student_skills: Dict[str, int]
) -> float:
    """
    Calculates weighted readiness score using standard formula:
    Readiness Score = 100 * sum(weight * min(curr_prof / req_prof, 1.0)) / sum(weights)
    Supports 0 to 5 proficiency scale:
    0 = Not learned
    1 = Beginner
    2 = Basic working knowledge
    3 = Intermediate
    4 = Advanced
    5 = Expert
    """
    if not role_requirements:
        return 0.0

    total_weight = sum(req.importance_weight for req in role_requirements)
    if total_weight <= 0:
        return 0.0

    weighted_progress = 0.0
    for req in role_requirements:
        skill_identifier = getattr(req.skill, "slug", None) or str(req.skill_id)
        curr_prof = student_skills.get(skill_identifier)
        if curr_prof is None and hasattr(req, "skill") and req.skill:
            curr_prof = student_skills.get(req.skill.slug)
        if curr_prof is None:
            curr_prof = student_skills.get(str(req.skill_id), 0)

        # Scale 0 to 5
        curr_prof = max(0, min(5, int(curr_prof or 0)))
        req_prof = max(1, min(5, int(req.required_proficiency)))

        ratio = min(curr_prof / req_prof, 1.0)
        weighted_progress += req.importance_weight * ratio

    score = (weighted_progress / total_weight) * 100.0
    return round(score, 1)


def analyze_skill_gaps(
    role: Any,
    role_requirements: List[Any],
    prerequisite_map: Dict[int, List[int]],  # skill_id -> list of prerequisite skill_ids
    skill_lookup: Dict[int, Any],            # skill_id -> Skill model or dict
    student_skills: Dict[str, int],          # slug/id -> proficiency (0-5)
    assessed_skills: Optional[Dict[str, Any]] = None,  # slug/id -> metadata
    student_background: Optional[str] = None
) -> SkillGapAnalysisResponse:
    """
    Performs deterministic, background-adaptive skill gap analysis.
    Identifies:
    - Technical and non-technical gaps
    - Transferable strengths from existing user experience
    - Unmet prerequisite chains
    - Skills requiring verification assessment
    """
    assessed_map = assessed_skills or {}
    gaps: List[SkillGapItem] = []
    technical_gaps: List[SkillGapItem] = []
    non_technical_gaps: List[SkillGapItem] = []
    transferable_strengths: List[SkillGapItem] = []
    high_priority_gaps: List[SkillGapItem] = []
    skills_requiring_assessment: List[SkillGapItem] = []

    met_count = 0
    needs_improvement_count = 0
    missing_count = 0
    blocked_count = 0
    total_estimated_effort = 0

    def get_prof(skill_obj, skill_id) -> int:
        if skill_obj and skill_obj.slug in student_skills:
            return int(student_skills[skill_obj.slug] or 0)
        if str(skill_id) in student_skills:
            return int(student_skills[str(skill_id)] or 0)
        return 0

    def is_verified(skill_obj, skill_id) -> bool:
        slug = skill_obj.slug if skill_obj else str(skill_id)
        if slug in assessed_map:
            return bool(assessed_map[slug].get("verified", False))
        return False

    # Check which skills user has
    student_prof_by_id: Dict[int, int] = {}
    for req in role_requirements:
        skill_id = req.skill_id
        skill_obj = skill_lookup.get(skill_id)
        student_prof_by_id[skill_id] = get_prof(skill_obj, skill_id)

    for req in role_requirements:
        skill_id = req.skill_id
        skill_obj = skill_lookup.get(skill_id)
        skill_name = skill_obj.name if skill_obj else f"Skill #{skill_id}"
        skill_slug = skill_obj.slug if skill_obj else f"skill-{skill_id}"
        category = skill_obj.category if skill_obj else "General"
        doc_url = skill_obj.doc_url if skill_obj else ""

        curr_prof = student_prof_by_id.get(skill_id, 0)
        req_prof = req.required_proficiency

        # Prerequisite validation
        unmet_prereqs: List[str] = []
        prereq_ids = prerequisite_map.get(skill_id, [])
        for p_id in prereq_ids:
            p_obj = skill_lookup.get(p_id)
            p_prof = get_prof(p_obj, p_id)
            if p_prof == 0:
                p_name = p_obj.name if p_obj else f"Skill #{p_id}"
                unmet_prereqs.append(p_name)

        # Estimate bridge effort based on delta (scale 0-5)
        prof_delta = max(0, req_prof - curr_prof)
        hours_per_delta = 10
        if skill_obj:
            hours_per_delta = max(6, skill_obj.estimated_hours_beginner // 2)
        estimated_hours = prof_delta * hours_per_delta
        total_estimated_effort += estimated_hours

        # Determine status
        if curr_prof >= req_prof:
            status = "met"
            met_count += 1
        elif len(unmet_prereqs) > 0 and curr_prof == 0:
            status = "blocked"
            blocked_count += 1
            missing_count += 1
        elif curr_prof == 0:
            status = "missing"
            missing_count += 1
        else:
            status = "needs_improvement"
            needs_improvement_count += 1

        # Classify category type (Technical vs Non-technical)
        is_tech = any(cat in category for cat in TECHNICAL_CATEGORIES)
        cat_type = "technical" if is_tech else "non_technical"

        # Check transferable capability
        # If user has non-zero proficiency, it represents a transferable or existing strength
        is_transferable = curr_prof >= 2

        verified = is_verified(skill_obj, skill_id)

        # Natural language recommendation reason
        if status == "met":
            reason = f"You already meet or exceed the required benchmark ({curr_prof}/{req_prof}) for {skill_name}."
        elif status == "blocked":
            reason = f"Essential for {role.title}, but prerequisite '{unmet_prereqs[0]}' must be established first."
        elif status == "needs_improvement":
            reason = f"You possess foundational knowledge ({curr_prof}/{req_prof}); targeted practice will bridge this to production level."
        else:
            reason = f"Required core competency ({req_prof}/5) frequently tested in {role.title} interviews."

        gap_item = SkillGapItem(
            skill_id=skill_id,
            skill_slug=skill_slug,
            skill_name=skill_name,
            category=category,
            category_type=cat_type,
            current_proficiency=curr_prof,
            required_proficiency=req_prof,
            importance_weight=req.importance_weight,
            is_core=req.is_core,
            status=status,
            is_transferable=is_transferable,
            is_verified_assessment=verified,
            recommendation_reason=reason,
            unmet_prerequisites=unmet_prereqs,
            doc_url=doc_url,
            estimated_hours_to_bridge=estimated_hours
        )

        gaps.append(gap_item)

        if cat_type == "technical":
            technical_gaps.append(gap_item)
        else:
            non_technical_gaps.append(gap_item)

        if is_transferable:
            transferable_strengths.append(gap_item)

        if prof_delta > 0 and (req.importance_weight >= 4 or req.is_core):
            high_priority_gaps.append(gap_item)

        if curr_prof > 0 and not verified:
            skills_requiring_assessment.append(gap_item)

    readiness_score = calculate_readiness_score(role_requirements, student_skills)

    # Sort gaps by importance weight descending, then by deficit descending
    gaps.sort(key=lambda g: (-g.importance_weight, -(g.required_proficiency - g.current_proficiency)))
    high_priority_gaps.sort(key=lambda g: (-g.importance_weight, -(g.required_proficiency - g.current_proficiency)))

    return SkillGapAnalysisResponse(
        role_id=role.id,
        role_title=role.title,
        readiness_score=readiness_score,
        readiness_formula="100 * sum(weights * min(curr_prof / req_prof, 1.0)) / sum(weights)",
        total_skills_count=len(role_requirements),
        met_count=met_count,
        needs_improvement_count=needs_improvement_count,
        missing_count=missing_count,
        blocked_count=blocked_count,
        technical_gaps=technical_gaps,
        non_technical_gaps=non_technical_gaps,
        transferable_strengths=transferable_strengths,
        high_priority_gaps=high_priority_gaps,
        skills_requiring_assessment=skills_requiring_assessment,
        gaps=gaps,
        total_estimated_effort_hours=total_estimated_effort,
        disclaimer=(
            "RoadmapIQ readiness scores represent an estimated baseline based on your self-reported skills, "
            "assessment results, and standard job requirements. They are not a guarantee of employment or placement."
        )
    )
