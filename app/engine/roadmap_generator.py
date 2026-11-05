import math
from typing import Dict, List, Set, Tuple, Any, Optional
from app.engine.skill_gap_analyzer import analyze_skill_gaps, calculate_readiness_score, TECHNICAL_CATEGORIES
from app.engine.topological_planner import TopologicalPlanner, DependencyCycleError


class GeneratedTaskData:
    def __init__(
        self,
        skill_id: Optional[int],
        phase_number: int,
        phase_name: str,
        week_number: int,
        order_in_week: int,
        title: str,
        skill_category: str,
        task_type: str,
        description: str,
        estimated_hours: int,
        priority: str,
        completion_criteria: str,
        deliverable: Optional[str],
        resources: List[Dict[str, Any]],
        is_completed: bool = False
    ):
        self.skill_id = skill_id
        self.phase_number = phase_number
        self.phase_name = phase_name
        self.week_number = week_number
        self.order_in_week = order_in_week
        self.title = title
        self.skill_category = skill_category
        self.task_type = task_type
        self.description = description
        self.estimated_hours = estimated_hours
        self.priority = priority
        self.completion_criteria = completion_criteria
        self.deliverable = deliverable
        self.resources = resources
        self.is_completed = is_completed


class GeneratedRoadmapPlan:
    def __init__(
        self,
        role_id: int,
        target_duration_weeks: int,
        weekly_hours: int,
        readiness_score: float,
        total_estimated_hours: int,
        is_over_capacity: bool,
        capacity_warning: Optional[str],
        summary: str,
        tasks: List[GeneratedTaskData],
        skill_gaps_summary: Dict[str, Any]
    ):
        self.role_id = role_id
        self.target_duration_weeks = target_duration_weeks
        self.weekly_hours = weekly_hours
        self.readiness_score = readiness_score
        self.total_estimated_hours = total_estimated_hours
        self.is_over_capacity = is_over_capacity
        self.capacity_warning = capacity_warning
        self.summary = summary
        self.tasks = tasks
        self.skill_gaps_summary = skill_gaps_summary


def generate_roadmap_plan(
    role: Any,
    role_requirements: List[Any],
    prerequisites: List[Tuple[int, int]],
    skills_by_id: Dict[int, Any],
    resources_by_skill_id: Dict[int, List[Any]],
    student_skills: Dict[str, int],
    weekly_study_hours: int = 15,
    target_duration_weeks: int = 12,
    preferred_format: str = "mixed",
    projects: Optional[List[Any]] = None,
    existing_completed_tasks: Optional[List[Any]] = None
) -> GeneratedRoadmapPlan:
    """
    Background-Adaptive & Phase-Structured Roadmap Generation Engine:
    1. Runs deterministic skill gap analysis and calculates weighted baseline readiness.
    2. Constructs topological DAG of required competencies respecting prerequisite constraints.
    3. Allocates tasks into 5 standardized phases:
       - Phase 1: Foundations
       - Phase 2: Core Role-Specific Skills
       - Phase 3: Applied Practice
       - Phase 4: Capstone / Deliverable Projects
       - Phase 5: Interview & Career Preparation
    4. Customizes deliverables for technical vs non-technical careers.
    5. Preserves existing completed tasks when rescheduling.
    """
    weekly_study_hours = max(3, min(60, weekly_study_hours))
    target_duration_weeks = max(2, min(52, target_duration_weeks))

    # Map prerequisites
    prereq_map: Dict[int, List[int]] = {}
    for target_id, prereq_id in prerequisites:
        if target_id not in prereq_map:
            prereq_map[target_id] = []
        prereq_map[target_id].append(prereq_id)

    # Analyze gaps
    gap_analysis = analyze_skill_gaps(
        role=role,
        role_requirements=role_requirements,
        prerequisite_map=prereq_map,
        skill_lookup=skills_by_id,
        student_skills=student_skills
    )

    # Topological sorting of role skills
    skill_ids_in_role = {req.skill_id for req in role_requirements}
    skill_names = {sid: (skills_by_id[sid].name if sid in skills_by_id else str(sid)) for sid in skill_ids_in_role}
    skill_weights = {req.skill_id: req.importance_weight for req in role_requirements}

    planner = TopologicalPlanner(
        skill_ids=skill_ids_in_role,
        prerequisites=prerequisites,
        skill_names=skill_names,
        skill_weights=skill_weights
    )

    topological_skill_order = planner.get_topological_order()
    gap_by_skill: Dict[int, Any] = {gap.skill_id: gap for gap in gap_analysis.gaps}

    # Identify whether this role is primarily technical or non-technical
    role_category_lower = getattr(role, "category", "").lower()
    role_title_lower = getattr(role, "title", "").lower()
    is_technical_role = (
        "software" in role_category_lower or
        "developer" in role_title_lower or
        "engineer" in role_title_lower or
        "cybersecurity" in role_title_lower or
        "data scientist" in role_title_lower
    )

    # Build tasks queue
    tasks_to_schedule: List[Dict[str, Any]] = []

    for sid in topological_skill_order:
        skill = skills_by_id.get(sid)
        if not skill:
            continue

        gap_item = gap_by_skill.get(sid)
        curr_prof = gap_item.current_proficiency if gap_item else 0
        req_prof = gap_item.required_proficiency if gap_item else 3
        deficit = max(0, req_prof - curr_prof)
        importance = gap_item.importance_weight if gap_item else 3
        priority = "High" if importance >= 4 else ("Medium" if importance >= 3 else "Low")
        skill_cat = skill.category

        res_list = resources_by_skill_id.get(sid, [])
        formatted_resources = [
            {
                "title": r.title,
                "url": r.url,
                "provider": r.provider,
                "format": r.format
            } for r in res_list[:3]
        ]

        # Domain deliverable tailoring
        if "excel" in skill.name.lower() or "spreadsheet" in skill.name.lower():
            deliverable_name = "Dynamic Multi-Tab Spreadsheet Model with Pivot Tables"
        elif "sql" in skill.name.lower() or "database" in skill.name.lower():
            deliverable_name = "Relational Schema Diagram & Complex Analytical Queries"
        elif "marketing" in skill_cat.lower() or "seo" in skill.name.lower():
            deliverable_name = "Comprehensive SEO Audit & 30-Day Campaign Content Calendar"
        elif "human resources" in skill_cat.lower() or "talent" in skill.name.lower():
            deliverable_name = "Competency-Based Interview Rubric & Onboarding Journey Map"
        elif "design" in skill_cat.lower() or "ui" in skill.name.lower():
            deliverable_name = "Figma Interactive Component Library & Usability Test Script"
        elif "communication" in skill_cat.lower() or "presentation" in skill.name.lower():
            deliverable_name = "5-Minute Executive Concept Presentation with Slide Deck"
        elif "financial" in skill_cat.lower() or "accounting" in skill.name.lower():
            deliverable_name = "Discounted Cash Flow (DCF) & Ratio Valuation Workbook"
        elif is_technical_role:
            deliverable_name = f"Tested {skill.name} Module with Automated Unit Tests"
        else:
            deliverable_name = f"Practical Case Study Implementation for {skill.name}"

        if deficit == 0:
            # Skill already met: Phase 3 revision & advanced application task
            tasks_to_schedule.append({
                "skill_id": sid,
                "phase_number": 3,
                "phase_name": "Phase 3: Applied Practice",
                "title": f"{skill.name}: Advanced Trade-offs & Production Review",
                "skill_category": skill.category,
                "task_type": "revision",
                "description": f"Review edge-cases, common production failure modes, and interview trade-offs for {skill.name}.",
                "estimated_hours": 3,
                "priority": "Low",
                "completion_criteria": f"Successfully articulate key architectural or operational decisions involving {skill.name}.",
                "deliverable": f"Advanced {skill.name} Notes & Trade-off Checklist",
                "resources": formatted_resources,
            })
        elif deficit <= 2:
            # Moderate gap: Phase 1 Foundations + Phase 2 Core Skills
            theory_hours = max(2, skill.estimated_hours_beginner // 2)
            practice_hours = max(3, skill.estimated_hours_intermediate // 2)

            tasks_to_schedule.append({
                "skill_id": sid,
                "phase_number": 1,
                "phase_name": "Phase 1: Foundations",
                "title": f"{skill.name}: Foundational Principles & Core Concepts",
                "skill_category": skill.category,
                "task_type": "theory",
                "description": f"Master fundamental principles, official documentation, and key terminology of {skill.name}.",
                "estimated_hours": theory_hours,
                "priority": priority,
                "completion_criteria": f"Complete conceptual reading and summarize primary mechanisms of {skill.name}.",
                "deliverable": f"Concept Summary Document for {skill.name}",
                "resources": formatted_resources,
            })
            tasks_to_schedule.append({
                "skill_id": sid,
                "phase_number": 2,
                "phase_name": "Phase 2: Core Role Skills",
                "title": f"{skill.name}: Hands-on Practical Application",
                "skill_category": skill.category,
                "task_type": "practice",
                "description": f"Apply {skill.name} to realistic workplace problem sets, labs, or domain case scenarios.",
                "estimated_hours": practice_hours,
                "priority": priority,
                "completion_criteria": f"Deliver a functional solution verifying proficiency in {skill.name}.",
                "deliverable": deliverable_name,
                "resources": formatted_resources,
            })
        else:
            # Large gap (3+ levels deficit): Phase 1 Foundations + Phase 2 Deep Dive + Phase 3 Applied Milestone
            total_skill_hours = gap_item.estimated_hours_to_bridge if gap_item else 25
            theory_hours = max(3, int(total_skill_hours * 0.3))
            practice_hours = max(4, int(total_skill_hours * 0.4))
            milestone_hours = max(3, total_skill_hours - theory_hours - practice_hours)

            tasks_to_schedule.append({
                "skill_id": sid,
                "phase_number": 1,
                "phase_name": "Phase 1: Foundations",
                "title": f"{skill.name}: Core Concepts & Fundamentals",
                "skill_category": skill.category,
                "task_type": "theory",
                "description": f"Establish solid theoretical grounding in {skill.name} syntax, semantics, and ecosystem patterns.",
                "estimated_hours": theory_hours,
                "priority": priority,
                "completion_criteria": f"Demonstrate clear understanding of fundamental {skill.name} idioms and mechanics.",
                "deliverable": f"Foundational Knowledge Notes on {skill.name}",
                "resources": formatted_resources,
            })
            tasks_to_schedule.append({
                "skill_id": sid,
                "phase_number": 2,
                "phase_name": "Phase 2: Core Role Skills",
                "title": f"{skill.name}: Intensive Exercises & Problem Solving",
                "skill_category": skill.category,
                "task_type": "practice",
                "description": f"Solve practical challenges and build intermediate workflow components using {skill.name}.",
                "estimated_hours": practice_hours,
                "priority": priority,
                "completion_criteria": f"Complete hands-on problem sets and verify error-handling paths for {skill.name}.",
                "deliverable": f"Problem Set Artifact for {skill.name}",
                "resources": formatted_resources,
            })
            tasks_to_schedule.append({
                "skill_id": sid,
                "phase_number": 3,
                "phase_name": "Phase 3: Applied Practice",
                "title": f"{skill.name}: Applied Domain Milestone",
                "skill_category": skill.category,
                "task_type": "assessment",
                "description": f"Synthesize {skill.name} into an integrated real-world deliverable demonstrating independence.",
                "estimated_hours": milestone_hours,
                "priority": priority,
                "completion_criteria": f"Deliver a documented, reviewable artifact applying {skill.name}.",
                "deliverable": deliverable_name,
                "resources": formatted_resources,
            })

    # Phase 4 & 5: Capstone Project & Career / Interview Preparation
    selected_project = projects[0] if (projects and len(projects) > 0) else None
    proj_name = selected_project.name if selected_project else f"{role.title} Capstone Project"
    proj_stack = ", ".join(selected_project.suggested_tech_stack) if selected_project else "Industry Standard Toolkit"

    capstone_task = {
        "skill_id": None,
        "phase_number": 4,
        "phase_name": "Phase 4: Practical Projects",
        "title": f"Capstone Project: {proj_name}",
        "skill_category": "Portfolio & Practical Project",
        "task_type": "project",
        "description": f"Build and document a comprehensive portfolio deliverable for {role.title}. Tools: {proj_stack}.",
        "estimated_hours": 12,
        "priority": "High",
        "completion_criteria": "Fully documented deliverable with README/case-study overview, execution steps, and live or recorded walkthrough.",
        "deliverable": f"Production Portfolio Deliverable: {proj_name}",
        "resources": [
            {"title": "Project Portfolio Best Practices", "url": "https://roadmap.sh", "provider": "RoadmapIQ", "format": "documentation"},
            {"title": "Documentation Guidelines", "url": "https://www.writethedocs.org/guide/", "provider": "Write The Docs", "format": "documentation"}
        ]
    }

    # Role-appropriate Phase 5 interview prep
    if is_technical_role:
        interview_task_1 = {
            "skill_id": None,
            "phase_number": 5,
            "phase_name": "Phase 5: Career & Interview Prep",
            "title": "Technical Problem Solving & Algorithm Patterns",
            "skill_category": "Interview Preparation",
            "task_type": "interview",
            "description": "High-frequency interview problem solving: data structures, algorithmic complexity, and system design.",
            "estimated_hours": 8,
            "priority": "High",
            "completion_criteria": "Solve and explain 10 core interview questions with time/space complexity analysis.",
            "deliverable": "Interview Problem Set Solutions",
            "resources": [{"title": "LeetCode Curated Set", "url": "https://leetcode.com/problemset/", "provider": "LeetCode", "format": "practice"}]
        }
        interview_task_2 = {
            "skill_id": None,
            "phase_number": 5,
            "phase_name": "Phase 5: Career & Interview Prep",
            "title": "Behavioral STAR Stories & System Architecture Presentation",
            "skill_category": "Interview Preparation",
            "task_type": "interview",
            "description": f"Prepare 3 STAR-format stories highlighting technical trade-offs, debugging challenges, and teamwork for {role.title}.",
            "estimated_hours": 6,
            "priority": "High",
            "completion_criteria": "Write and rehearse 3 STAR stories and rehearse technical communication.",
            "deliverable": "Written STAR Behavioral Stories",
            "resources": [{"title": "STAR Method Guide", "url": "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique", "provider": "Indeed", "format": "documentation"}]
        }
    else:
        # Non-technical / Business / Creative / Domain interview prep
        interview_task_1 = {
            "skill_id": None,
            "phase_number": 5,
            "phase_name": "Phase 5: Career & Interview Prep",
            "title": f"{role.title} Business Case Study & Problem Analysis",
            "skill_category": "Interview Preparation",
            "task_type": "case_study",
            "description": f"Work through 2 comprehensive business case studies analyzing requirements, operational bottlenecks, and ROI for {role.title}.",
            "estimated_hours": 8,
            "priority": "High",
            "completion_criteria": "Draft a structured 2-page case study solution with executive summary and actionable recommendations.",
            "deliverable": "Business Case Analysis Document",
            "resources": [{"title": "Business Case Analysis Framework", "url": "https://hbr.org", "provider": "HBR Guides", "format": "documentation"}]
        }
        interview_task_2 = {
            "skill_id": None,
            "phase_number": 5,
            "phase_name": "Phase 5: Career & Interview Prep",
            "title": "Portfolio Presentation & Behavioral STAR Interview Preparation",
            "skill_category": "Interview Preparation",
            "task_type": "interview",
            "description": "Prepare a 10-minute walkthrough of your capstone deliverable and rehearse 3 behavioral STAR responses for hiring managers.",
            "estimated_hours": 6,
            "priority": "High",
            "completion_criteria": "Rehearse presentation out loud and record answers to top behavioral questions.",
            "deliverable": "Portfolio Slide Deck & STAR Script",
            "resources": [{"title": "STAR Interview Method", "url": "https://www.themuse.com/advice/star-interview-method", "provider": "The Muse", "format": "documentation"}]
        }

    # Time capacity check
    student_total_capacity = weekly_study_hours * target_duration_weeks
    total_estimated_hours = sum(t["estimated_hours"] for t in tasks_to_schedule) + 12 + 8 + 6

    is_over_capacity = total_estimated_hours > student_total_capacity
    capacity_warning = None
    if is_over_capacity:
        suggested_weeks = math.ceil(total_estimated_hours / weekly_study_hours)
        suggested_weekly = math.ceil(total_estimated_hours / target_duration_weeks)
        capacity_warning = (
            f"The recommended curriculum workload is {total_estimated_hours} hours, which exceeds your planned capacity "
            f"of {student_total_capacity} hours ({target_duration_weeks} weeks × {weekly_study_hours} hrs/week). "
            f"We suggest extending your duration to {suggested_weeks} weeks or allocating ~{suggested_weekly} hours/week "
            f"for sustainable mastery without burnout."
        )

    # Distribute tasks across weeks
    prep_weeks = 2 if target_duration_weeks >= 6 else (1 if target_duration_weeks >= 3 else 0)
    skill_learning_weeks = max(1, target_duration_weeks - prep_weeks)

    scheduled_tasks: List[GeneratedTaskData] = []
    current_week = 1
    current_week_hours = 0
    order_in_week = 1

    for t in tasks_to_schedule:
        task_hours = t["estimated_hours"]
        if (current_week_hours + task_hours > weekly_study_hours) and (current_week < skill_learning_weeks):
            current_week += 1
            current_week_hours = 0
            order_in_week = 1

        scheduled_tasks.append(
            GeneratedTaskData(
                skill_id=t["skill_id"],
                phase_number=t["phase_number"],
                phase_name=t["phase_name"],
                week_number=current_week,
                order_in_week=order_in_week,
                title=t["title"],
                skill_category=t["skill_category"],
                task_type=t["task_type"],
                description=t["description"],
                estimated_hours=task_hours,
                priority=t["priority"],
                completion_criteria=t["completion_criteria"],
                deliverable=t["deliverable"],
                resources=t["resources"],
                is_completed=False
            )
        )
        current_week_hours += task_hours
        order_in_week += 1

    # Place Capstone and Interview tasks in final weeks
    project_week = max(1, target_duration_weeks - 1) if prep_weeks == 2 else target_duration_weeks
    interview_week = target_duration_weeks

    scheduled_tasks.append(
        GeneratedTaskData(
            skill_id=capstone_task["skill_id"],
            phase_number=capstone_task["phase_number"],
            phase_name=capstone_task["phase_name"],
            week_number=project_week,
            order_in_week=20,
            title=capstone_task["title"],
            skill_category=capstone_task["skill_category"],
            task_type=capstone_task["task_type"],
            description=capstone_task["description"],
            estimated_hours=capstone_task["estimated_hours"],
            priority=capstone_task["priority"],
            completion_criteria=capstone_task["completion_criteria"],
            deliverable=capstone_task["deliverable"],
            resources=capstone_task["resources"],
            is_completed=False
        )
    )

    scheduled_tasks.append(
        GeneratedTaskData(
            skill_id=interview_task_1["skill_id"],
            phase_number=interview_task_1["phase_number"],
            phase_name=interview_task_1["phase_name"],
            week_number=interview_week,
            order_in_week=21,
            title=interview_task_1["title"],
            skill_category=interview_task_1["skill_category"],
            task_type=interview_task_1["task_type"],
            description=interview_task_1["description"],
            estimated_hours=interview_task_1["estimated_hours"],
            priority=interview_task_1["priority"],
            completion_criteria=interview_task_1["completion_criteria"],
            deliverable=interview_task_1["deliverable"],
            resources=interview_task_1["resources"],
            is_completed=False
        )
    )

    scheduled_tasks.append(
        GeneratedTaskData(
            skill_id=interview_task_2["skill_id"],
            phase_number=interview_task_2["phase_number"],
            phase_name=interview_task_2["phase_name"],
            week_number=interview_week,
            order_in_week=22,
            title=interview_task_2["title"],
            skill_category=interview_task_2["skill_category"],
            task_type=interview_task_2["task_type"],
            description=interview_task_2["description"],
            estimated_hours=interview_task_2["estimated_hours"],
            priority=interview_task_2["priority"],
            completion_criteria=interview_task_2["completion_criteria"],
            deliverable=interview_task_2["deliverable"],
            resources=interview_task_2["resources"],
            is_completed=False
        )
    )

    # Re-normalize ordering in each week
    scheduled_tasks.sort(key=lambda x: (x.week_number, x.order_in_week))
    week_counters: Dict[int, int] = {}
    for st in scheduled_tasks:
        week_counters[st.week_number] = week_counters.get(st.week_number, 0) + 1
        st.order_in_week = week_counters[st.week_number]

    # Preserve any existing completed tasks if this is a reschedule operation
    if existing_completed_tasks:
        completed_titles = {t.title for t in existing_completed_tasks if getattr(t, "is_completed", False)}
        for st in scheduled_tasks:
            if st.title in completed_titles:
                st.is_completed = True

    summary = (
        f"Adaptive {target_duration_weeks}-week roadmap for {role.title} "
        f"organized into 5 progressive phases covering {gap_analysis.missing_count + gap_analysis.needs_improvement_count} competency areas. "
        f"Estimated baseline readiness: {gap_analysis.readiness_score}%. "
        f"Structured with prerequisite foundations first, followed by hands-on labs, applied milestones, "
        f"portfolio capstone deliverables, and career interview practice."
    )

    return GeneratedRoadmapPlan(
        role_id=role.id,
        target_duration_weeks=target_duration_weeks,
        weekly_hours=weekly_study_hours,
        readiness_score=gap_analysis.readiness_score,
        total_estimated_hours=total_estimated_hours,
        is_over_capacity=is_over_capacity,
        capacity_warning=capacity_warning,
        summary=summary,
        tasks=scheduled_tasks,
        skill_gaps_summary={
            "readiness_score": gap_analysis.readiness_score,
            "met_count": gap_analysis.met_count,
            "needs_improvement_count": gap_analysis.needs_improvement_count,
            "missing_count": gap_analysis.missing_count,
            "blocked_count": gap_analysis.blocked_count,
            "total_skills": gap_analysis.total_skills_count
        }
    )
