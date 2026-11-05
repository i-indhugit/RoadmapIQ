"""
Career Assessment and Skill Gap Analysis Engine for RoadmapIQ.
Performs deterministic and AI-augmented:
1. Scoring and proficiency grading across categories and difficulty tiers.
2. Skill gap analysis comparing assessed vs required levels.
3. Objective readiness calculation independent of XP.
4. Adaptive roadmap generation tailored to student weaknesses and strengths.
"""
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timezone
import math
from sqlalchemy.orm import Session

from app.models import (
    CareerRole,
    Skill,
    RoleSkillRequirement,
    CareerAssessmentQuestion,
    CareerAssessmentAttempt,
    CareerAssessmentResult,
    CareerSkillGapReport,
    StudentProfile,
    Roadmap,
    RoadmapTask,
    TaskResource,
    SkillPrerequisite,
)
from app.engine.gamification_engine import award_xp_transaction

# Proficiency scale mapping
PROFICIENCY_TIERS = [
    (80, 100, 4, "Advanced"),
    (60, 79, 3, "Intermediate"),
    (40, 59, 2, "Developing"),
    (0, 39, 1, "Beginner"),
]


def get_proficiency_tier(score_percentage: float) -> Tuple[int, str]:
    """Returns proficiency numerical level (1-4) and human label."""
    for min_score, max_score, level, label in PROFICIENCY_TIERS:
        if score_percentage >= min_score:
            return level, label
    return 1, "Beginner"


def evaluate_career_assessment(
    db: Session,
    attempt: CareerAssessmentAttempt,
    user_answers: Dict[str, Any],
    time_spent_secs: int = 0
) -> Tuple[CareerAssessmentResult, CareerSkillGapReport]:
    """
    Evaluates candidate responses against question bank criteria.
    Generates CareerAssessmentResult and CareerSkillGapReport.
    """
    role = db.query(CareerRole).filter(CareerRole.id == attempt.role_id).first()
    questions = db.query(CareerAssessmentQuestion).filter(
        CareerAssessmentQuestion.role_id == attempt.role_id,
        CareerAssessmentQuestion.is_active == True
    ).all()

    total_questions = len(questions)
    if total_questions == 0:
        raise ValueError(f"No active assessment questions found for career role {attempt.role_id}")

    answered_count = 0
    correct_count = 0
    incorrect_count = 0
    unanswered_count = 0
    total_marks_earned = 0
    total_possible_marks = 0

    category_buckets: Dict[str, Dict[str, int]] = {}
    difficulty_buckets: Dict[str, Dict[str, int]] = {}
    question_details: List[Dict[str, Any]] = []

    for q in questions:
        q_id_str = str(q.id)
        marks = q.marks or 1
        total_possible_marks += marks

        # Initialize buckets
        cat = q.category
        if cat not in category_buckets:
            category_buckets[cat] = {"total": 0, "correct": 0, "marks_earned": 0, "marks_possible": 0}
        category_buckets[cat]["total"] += 1
        category_buckets[cat]["marks_possible"] += marks

        diff = q.difficulty or "intermediate"
        if diff not in difficulty_buckets:
            difficulty_buckets[diff] = {"total": 0, "correct": 0}
        difficulty_buckets[diff]["total"] += 1

        user_choice = user_answers.get(q_id_str)
        if user_choice is not None and user_choice != -1 and str(user_choice) != "":
            answered_count += 1
            if isinstance(user_choice, int) or (isinstance(user_choice, str) and user_choice.isdigit()):
                user_choice_idx = int(user_choice)
                is_correct = (user_choice_idx == getattr(q, "correct_answer_index", 0))
            elif isinstance(user_choice, str) and q.options and user_choice in q.options:
                user_choice_idx = q.options.index(user_choice)
                is_correct = (user_choice == getattr(q, "correct_answer", None) or user_choice_idx == getattr(q, "correct_answer_index", 0))
            else:
                user_choice_idx = 0
                is_correct = (str(user_choice) == str(getattr(q, "correct_answer", "")))
            if is_correct:
                correct_count += 1
                total_marks_earned += marks
                category_buckets[cat]["correct"] += 1
                category_buckets[cat]["marks_earned"] += marks
                difficulty_buckets[diff]["correct"] += 1
            else:
                incorrect_count += 1
        else:
            unanswered_count += 1
            user_choice_idx = None
            is_correct = False

        question_details.append({
            "id": q.id,
            "category": q.category,
            "difficulty": q.difficulty,
            "question_type": q.question_type,
            "question": q.question,
            "code_snippet": q.code_snippet,
            "options": q.options,
            "user_choice": user_choice_idx,
            "correct_choice": q.correct_answer_index,
            "is_correct": is_correct,
            "explanation": q.explanation,
            "marks": marks
        })

    # Overall percentage
    score_percentage = round((total_marks_earned / total_possible_marks * 100.0) if total_possible_marks > 0 else 0.0, 1)
    overall_lvl, overall_label = get_proficiency_tier(score_percentage)

    # Process category breakdown
    category_scores: Dict[str, Any] = {}
    for cat, data in category_buckets.items():
        pct = round((data["marks_earned"] / data["marks_possible"] * 100.0) if data["marks_possible"] > 0 else 0.0, 1)
        lvl, lbl = get_proficiency_tier(pct)
        category_scores[cat] = {
            "total_questions": data["total"],
            "correct_answers": data["correct"],
            "score_percentage": pct,
            "assessed_proficiency_level": lvl,
            "proficiency_label": lbl,
            "coverage_confidence": "High" if data["total"] >= 3 else "Medium" if data["total"] == 2 else "Low"
        }

    # Process difficulty breakdown
    difficulty_scores: Dict[str, Any] = {}
    for diff, data in difficulty_buckets.items():
        pct = round((data["correct"] / data["total"] * 100.0) if data["total"] > 0 else 0.0, 1)
        difficulty_scores[diff] = {
            "total_questions": data["total"],
            "correct_answers": data["correct"],
            "score_percentage": pct
        }

    # Record or update assessment result in database
    existing_result = db.query(CareerAssessmentResult).filter_by(attempt_id=attempt.id).first()
    if existing_result:
        result = existing_result
        result.total_questions = total_questions
        result.answered_count = answered_count
        result.correct_count = correct_count
        result.incorrect_count = incorrect_count
        result.unanswered_count = unanswered_count
        result.total_marks_earned = total_marks_earned
        result.total_possible_marks = total_possible_marks
        result.score_percentage = score_percentage
        result.proficiency_level = overall_label
        result.category_scores = category_scores
        result.difficulty_scores = difficulty_scores
        result.question_details = question_details
        result.evaluated_at = datetime.now(timezone.utc)
    else:
        result = CareerAssessmentResult(
            attempt_id=attempt.id,
            profile_id=attempt.profile_id,
            role_id=attempt.role_id,
            total_questions=total_questions,
            answered_count=answered_count,
            correct_count=correct_count,
            incorrect_count=incorrect_count,
            unanswered_count=unanswered_count,
            total_marks_earned=total_marks_earned,
            total_possible_marks=total_possible_marks,
            score_percentage=score_percentage,
            proficiency_level=overall_label,
            category_scores=category_scores,
            difficulty_scores=difficulty_scores,
            question_details=question_details,
            evaluated_at=datetime.now(timezone.utc)
        )
        db.add(result)

    # Generate detailed Skill Gap Analysis
    gap_report = generate_career_skill_gap_report(db, attempt, category_scores, score_percentage)

    # Update attempt status
    attempt.status = "evaluated"
    attempt.completed_at = datetime.now(timezone.utc)
    attempt.time_spent_secs = time_spent_secs
    attempt.answers = user_answers

    # Update student profile's verified skills assessment dictionary
    profile = db.query(StudentProfile).filter(StudentProfile.id == attempt.profile_id).first()
    if profile:
        profile_assessed = dict(profile.assessed_skills or {})
        for cat, c_info in category_scores.items():
            slug = cat.lower().replace(" ", "-").replace("&", "and").replace("/", "-")
            profile_assessed[slug] = {
                "level": c_info["assessed_proficiency_level"],
                "label": c_info["proficiency_label"],
                "score_percentage": c_info["score_percentage"],
                "verified": True,
                "assessed_at": datetime.now(timezone.utc).isoformat()
            }
        profile.assessed_skills = profile_assessed

        # Award verified XP for taking comprehensive career assessment (+150 XP)
        award_xp_transaction(
            db=db,
            profile=profile,
            amount=150,
            source_type="career_assessment",
            source_id=f"attempt_{attempt.id}",
            description=f"Completed {role.title} Technical Competency Assessment ({score_percentage}%)"
        )

    db.commit()
    db.refresh(result)
    db.refresh(gap_report)

    return result, gap_report


def generate_career_skill_gap_report(
    db: Session,
    attempt: CareerAssessmentAttempt,
    category_scores: Dict[str, Any],
    overall_score_percentage: float
) -> CareerSkillGapReport:
    """Computes detailed skill gaps comparing required proficiency vs assessed proficiency."""
    role = db.query(CareerRole).filter(CareerRole.id == attempt.role_id).first()
    role_reqs = db.query(RoleSkillRequirement).filter_by(role_id=role.id).all()

    skills_table: List[Dict[str, Any]] = []
    strong_skills: List[str] = []
    needs_improvement_skills: List[str] = []
    missing_skills: List[str] = []
    critical_gaps: List[str] = []
    recommended_priorities: List[Dict[str, Any]] = []

    # Map required skills
    total_weight = 0
    weighted_competency_sum = 0.0

    for req in role_reqs:
        skill = db.query(Skill).filter(Skill.id == req.skill_id).first()
        if not skill:
            continue

        skill_name = skill.name
        req_prof = req.required_proficiency  # 1 to 5 scale (normalize to 1-4: 1=Beg, 2=Dev, 3=Int, 4=Adv)
        req_prof_norm = min(4, max(1, req_prof))
        weight = req.importance_weight or 3
        total_weight += weight

        # Match assessed category
        matched_cat_info = None
        for cat_name, c_info in category_scores.items():
            if (cat_name.lower() in skill_name.lower()) or (skill_name.lower() in cat_name.lower()):
                matched_cat_info = c_info
                break

        if matched_cat_info:
            assessed_prof = matched_cat_info["assessed_proficiency_level"]
            assessed_label = matched_cat_info["proficiency_label"]
            score_pct = matched_cat_info["score_percentage"]
            confidence = matched_cat_info["coverage_confidence"]
        else:
            assessed_prof = 1
            assessed_label = "Not Covered"
            score_pct = 0.0
            confidence = "Low (Insufficient Evidence)"

        # Calculate gap
        gap_diff = req_prof_norm - assessed_prof
        if gap_diff <= 0:
            gap_level = "None"
            gap_status = "Strong"
            priority = 5
            strong_skills.append(skill_name)
        elif gap_diff == 1:
            gap_level = "Moderate"
            gap_status = "Needs Improvement"
            priority = 3
            needs_improvement_skills.append(skill_name)
        elif gap_diff >= 2:
            gap_level = "High" if not req.is_core else "Critical"
            gap_status = "Critical Gap" if req.is_core else "High Gap"
            priority = 1 if req.is_core else 2
            critical_gaps.append(skill_name)
        else:
            gap_level = "Missing"
            gap_status = "Missing"
            priority = 1
            missing_skills.append(skill_name)

        # Weighted score contribution
        ratio = min(1.0, assessed_prof / req_prof_norm) if req_prof_norm > 0 else 1.0
        weighted_competency_sum += (weight * ratio)

        skills_table.append({
            "skill_name": skill_name,
            "category": skill.category,
            "required_level_num": req_prof_norm,
            "required_level": "Advanced" if req_prof_norm >= 4 else "Intermediate" if req_prof_norm == 3 else "Developing",
            "assessed_level_num": assessed_prof,
            "assessed_level": assessed_label,
            "score_percentage": score_pct,
            "gap_level": gap_level,
            "gap_status": gap_status,
            "priority": priority,
            "confidence": confidence,
            "is_core": req.is_core
        })

    # Sort priorities (Priority 1 first)
    skills_table.sort(key=lambda x: (x["priority"], -x["required_level_num"]))

    for s in skills_table:
        if s["gap_status"] != "Strong":
            recommended_priorities.append({
                "skill_name": s["skill_name"],
                "priority_level": s["priority"],
                "gap": s["gap_level"],
                "reason": f"Critical core competency gap for {role.title}" if s["priority"] == 1 else "Prerequisite skill needing targeted practice"
            })

    # Calculate objective career readiness score
    baseline_readiness = (weighted_competency_sum / total_weight * 100.0) if total_weight > 0 else 0.0
    # Apply penalty for critical foundational gaps
    critical_penalty = min(20.0, len(critical_gaps) * 4.0)
    readiness_score = max(0.0, min(100.0, round(baseline_readiness - critical_penalty, 1)))

    ai_explanation = (
        f"Assessment indicates strong aptitude in {', '.join(strong_skills[:3]) if strong_skills else 'introductory concepts'}. "
        f"However, critical gaps were detected in {', '.join(critical_gaps[:3]) if critical_gaps else 'intermediate frameworks'}. "
        f"Your personalized learning roadmap has been restructured to prioritize foundational prerequisites before advancing."
    )

    ai_topics = [
        f"Deep dive into {skill}" for skill in (critical_gaps[:3] + needs_improvement_skills[:2])
    ]

    existing_report = db.query(CareerSkillGapReport).filter_by(attempt_id=attempt.id).first()
    if existing_report:
        report = existing_report
        report.readiness_score = readiness_score
        report.skills_table = skills_table
        report.strong_skills = strong_skills
        report.needs_improvement_skills = needs_improvement_skills
        report.missing_skills = missing_skills
        report.critical_gaps = critical_gaps
        report.recommended_priorities = recommended_priorities
        report.ai_gap_explanation = ai_explanation
        report.ai_learning_topics = ai_topics
    else:
        report = CareerSkillGapReport(
            attempt_id=attempt.id,
            profile_id=attempt.profile_id,
            role_id=attempt.role_id,
            readiness_score=readiness_score,
            skills_table=skills_table,
            strong_skills=strong_skills,
            needs_improvement_skills=needs_improvement_skills,
            missing_skills=missing_skills,
            critical_gaps=critical_gaps,
            recommended_priorities=recommended_priorities,
            ai_gap_explanation=ai_explanation,
            ai_learning_topics=ai_topics,
            created_at=datetime.now(timezone.utc)
        )
        db.add(report)

    return report


def generate_personalized_roadmap_from_assessment(
    db: Session,
    attempt_id: int,
    weekly_hours: int = 15,
    target_duration_weeks: int = 12
) -> Roadmap:
    """
    Generates a personalized learning roadmap dynamically tailored to assessment results:
    - If strong in foundations, beginner tasks are marked completed or skipped.
    - If weak in OOP, DSA, or core concepts, Phase 1 and 2 are restructured to prioritize foundations.
    - Saves the Roadmap and RoadmapTasks directly.
    """
    attempt = db.query(CareerAssessmentAttempt).filter(CareerAssessmentAttempt.id == attempt_id).first()
    if not attempt:
        raise ValueError(f"Assessment attempt {attempt_id} not found")

    role = db.query(CareerRole).filter(CareerRole.id == attempt.role_id).first()
    report = db.query(CareerSkillGapReport).filter_by(attempt_id=attempt.id).first()
    result = db.query(CareerAssessmentResult).filter_by(attempt_id=attempt.id).first()

    profile = db.query(StudentProfile).filter(StudentProfile.id == attempt.profile_id).first()
    if not profile:
        raise ValueError(f"Student profile {attempt.profile_id} not found")

    # Set profile target role
    profile.target_role_id = role.id

    readiness = report.readiness_score if report else (result.score_percentage if result else 45.0)

    # Determine strong vs weak skills
    strong_set = set(report.strong_skills if report else [])
    weak_set = set(report.critical_gaps if report else []) | set(report.needs_improvement_skills if report else [])

    # Create new Roadmap
    summary = (
        f"Personalized {role.title} career plan tailored to your verified assessment score ({result.score_percentage if result else 0}%). "
        f"Foundational prerequisites in {', '.join(list(weak_set)[:2]) or 'core concepts'} are prioritized in early phases."
    )

    roadmap = Roadmap(
        profile_id=profile.id,
        role_id=role.id,
        target_duration_weeks=target_duration_weeks,
        weekly_hours=weekly_hours,
        readiness_score=readiness,
        total_estimated_hours=target_duration_weeks * weekly_hours,
        summary=summary,
        ai_advice=report.ai_gap_explanation if report else None,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(roadmap)
    db.flush()

    # Build 5 phases of tasks tailored to assessment with structured Monday to Sunday schedule:
    from app.engine.free_learning_resources_data import VERIFIED_FREE_RESOURCES, get_resources_for_domain

    competencies = role.core_competencies or [
        "Core Fundamentals", "Object-Oriented Design", "Data Structures", "APIs & Frameworks", "Database Systems"
    ]
    domain_resources = get_resources_for_domain(role.domain or "Technology and IT")
    if not domain_resources:
        domain_resources = VERIFIED_FREE_RESOURCES[:5]

    total_tasks_created = 0
    weeks = target_duration_weeks
    weeks_per_phase = max(1, weeks // 5)

    phase_configs = [
        {"num": 1, "name": "Phase 1: Foundations & Core Concepts", "focus": competencies[:3]},
        {"num": 2, "name": "Phase 2: Problem Solving & Algorithms", "focus": competencies[2:5]},
        {"num": 3, "name": "Phase 3: Applied Frameworks & Architecture", "focus": competencies[4:8] if len(competencies) > 7 else competencies[2:4]},
        {"num": 4, "name": "Phase 4: Capstone Engineering Deliverable", "focus": competencies[6:10] if len(competencies) > 9 else competencies[3:]},
        {"num": 5, "name": "Phase 5: Technical Interview & Placement Sim", "focus": ["Interview Readiness", "System Design & Optimization"]},
    ]

    DAILY_STRUCTURE = [
        {"day": "Monday", "day_num": 1, "cat": "LEARN", "type": "theory", "hours": 2, "xp": 60, "action": "Deep Study & Conceptual Theory"},
        {"day": "Tuesday", "day_num": 2, "cat": "PRACTICE", "type": "practice", "hours": 2, "xp": 70, "action": "Hands-On Practice & Exercises"},
        {"day": "Wednesday", "day_num": 3, "cat": "TEST", "type": "assessment", "hours": 1, "xp": 50, "action": "Diagnostic Check & Edge Cases"},
        {"day": "Thursday", "day_num": 4, "cat": "BUILD", "type": "project", "hours": 3, "xp": 100, "action": "Build Deliverable & Repository Lab"},
        {"day": "Friday", "day_num": 5, "cat": "REVISE", "type": "revision", "hours": 1, "xp": 50, "action": "Active Recall & Code Refactoring"},
        {"day": "Saturday", "day_num": 6, "cat": "PREPARE", "type": "interview", "hours": 2, "xp": 80, "action": "Interview Scenarios & Portfolio Showcase"},
        {"day": "Sunday", "day_num": 7, "cat": "REVISE", "type": "revision", "hours": 1, "xp": 40, "action": "Weekly Review & Streak Consolidation"}
    ]

    for p_idx, p_conf in enumerate(phase_configs):
        p_num = p_conf["num"]
        p_name = p_conf["name"]
        start_week = (p_num - 1) * weeks_per_phase + 1
        end_week = p_num * weeks_per_phase if p_num < 5 else weeks

        for w in range(start_week, end_week + 1):
            comp_focus = p_conf["focus"][(w - 1) % len(p_conf["focus"])]
            
            # Check mastery or critical gaps
            is_already_mastered = (p_num == 1 and any(s.lower() in comp_focus.lower() for s in strong_set))
            is_critical = any(w_s.lower() in comp_focus.lower() for w_s in weak_set)
            base_priority = "High" if is_critical else ("Low" if is_already_mastered else "Medium")

            for sched in DAILY_STRUCTURE:
                task_title = f"{sched['action']}: {comp_focus}"
                task_priority = base_priority
                task_hours = sched["hours"] if not is_already_mastered else 1

                # Tailored practice prompts
                practice_exercises = [
                    f"Implement core patterns for {comp_focus} avoiding edge-case pitfalls.",
                    f"Construct a verified unit test suite proving correctness of {comp_focus} logic.",
                    f"Benchmark latency and memory consumption of your {comp_focus} routine."
                ]

                # Diagnostic mini quiz questions
                quiz_data = [
                    {
                        "question": f"What is the foundational requirement when implementing {comp_focus}?",
                        "options": [
                            f"Enforcing strict encapsulation and error boundary validation",
                            f"Disregarding error handling in development environments",
                            f"Bypassing data validation layers to maximize raw throughput",
                            f"Hardcoding configuration parameters into source files"
                        ],
                        "correct_answer": f"Enforcing strict encapsulation and error boundary validation",
                        "explanation": f"Encapsulation and boundary validation prevent cascading failures in {comp_focus}."
                    },
                    {
                        "question": f"Which trade-off is most critical when scaling {comp_focus} in production?",
                        "options": [
                            f"Balancing throughput against memory allocation overhead",
                            f"Disabling database indexes to speed up write operations",
                            f"Running all background routines synchronously in the main thread",
                            f"Using global mutable state across distributed workers"
                        ],
                        "correct_answer": f"Balancing throughput against memory allocation overhead",
                        "explanation": f"Balancing throughput and memory allocation prevents resource starvation and out-of-memory crashes."
                    }
                ]

                coding_challenge = None
                if sched["cat"] == "BUILD":
                    coding_challenge = {
                        "title": f"{comp_focus} Mini Project Deliverable",
                        "problem_statement": f"Build a modular, tested deliverable demonstrating production-quality implementation of {comp_focus}.",
                        "requirements": [
                            "Clean separation of concerns with modular classes/functions",
                            "Input validation with structured error handling",
                            "Comprehensive automated unit tests with >80% code coverage",
                            "Git repository commit with clear README documentation"
                        ],
                        "deliverable": f"{comp_focus} GitHub Repository / Architecture Prototype"
                    }

                task = RoadmapTask(
                    roadmap_id=roadmap.id,
                    phase_number=p_num,
                    phase_name=p_name,
                    week_number=w,
                    order_in_week=sched["day_num"],
                    day_of_week=sched["day"],
                    day_number=sched["day_num"],
                    activity_category=sched["cat"],
                    practice_exercises=practice_exercises,
                    quiz_data=quiz_data,
                    coding_challenge=coding_challenge,
                    title=task_title,
                    skill_category=role.category,
                    task_type=sched["type"],
                    description=f"{sched['action']} focusing on {comp_focus} in {role.title} preparation. Tailored based on your verified assessment score ({result.score_percentage if result else 0}%).",
                    estimated_hours=task_hours,
                    actual_hours_spent=task_hours if is_already_mastered else 0.0,
                    priority=task_priority,
                    status="completed" if is_already_mastered else "not_started",
                    is_completed=is_already_mastered,
                    completed_at=datetime.now(timezone.utc) if is_already_mastered else None,
                    completion_criteria=f"Complete {sched['cat']} sprint for {comp_focus} and verify daily task.",
                    deliverable=f"{comp_focus} Portfolio Artifact" if sched["cat"] == "BUILD" else None,
                    xp_reward=sched["xp"] if not is_already_mastered else (sched["xp"] // 2),
                    quest_type="skill_quest" if sched["cat"] != "BUILD" else "epic_project"
                )
                db.add(task)
                db.flush()

                # Add vetted genuine free learning resources
                chosen_res = domain_resources[total_tasks_created % len(domain_resources)]
                db.add(TaskResource(
                    task_id=task.id,
                    title=f"{chosen_res['title']} ({chosen_res['provider']})",
                    url=chosen_res["url"],
                    provider=chosen_res["provider"],
                    format=chosen_res["format"]
                ))
                total_tasks_created += 1

    db.commit()
    db.refresh(roadmap)
    return roadmap

    db.commit()
    db.refresh(roadmap)
    return roadmap

