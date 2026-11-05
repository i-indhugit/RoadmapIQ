"""
Dynamic Question Generator for All-Domain Careers in RoadmapIQ.
Generates 25 balanced, authentic assessment questions for any career role
based on its core competencies, tools & technologies, and domain principles.
"""
from typing import List, Dict, Any
from app.models import CareerRole, CareerAssessmentQuestion
from sqlalchemy.orm import Session

def generate_questions_for_role(role: CareerRole, db: Session) -> List[CareerAssessmentQuestion]:
    """Generates and persists 25 balanced questions for a career role."""
    competencies = role.core_competencies or ["Foundations", "Core Methodology", "Analysis", "Practical Execution"]
    tools = role.tools_and_technologies or ["Industry Standard Tools", "Documentation", "Best Practices"]
    domain = role.domain or "Professional Discipline"
    title = role.title

    questions_to_create = []

    # 1. Fundamentals (10 questions - 40%)
    for i in range(10):
        comp = competencies[i % len(competencies)]
        q_text = f"In {title} practice, what is the primary role and fundamental principle of '{comp}'?"
        opt_a = f"Establishes foundational operational standards and reliable workflow execution for {comp}."
        opt_b = f"Bypasses statutory quality controls to reduce project delivery time."
        opt_c = f"Eliminates the requirement for documentation and team collaboration."
        opt_d = f"Restricts analytical verification exclusively to third-party consultants."
        
        q = CareerAssessmentQuestion(
            role_id=role.id,
            category=comp,
            question_type="multiple_choice",
            difficulty="fundamentals",
            question=q_text,
            code_snippet=None,
            options=[opt_a, opt_b, opt_c, opt_d],
            correct_answer=opt_a,
            explanation=f"'{comp}' is fundamental in {title} to establish rigorous, reliable operational and procedural standards.",
            marks=1,
            is_active=True
        )
        questions_to_create.append(q)

    # 2. Intermediate Concepts & Methodologies (8 questions - 32%)
    for i in range(8):
        comp = competencies[(i + 2) % len(competencies)]
        tool = tools[i % len(tools)]
        q_text = f"When utilizing '{tool}' to address '{comp}' challenges in {domain}, which workflow delivers optimal outcomes?"
        opt_a = f"Integrating automated verification pipelines and standardized review checkpoints."
        opt_b = f"Manual ad-hoc interventions without version tracking or peer audit."
        opt_c = f"Disregarding baseline requirements and deploying uncalibrated models."
        opt_d = f"Relying solely on default legacy parameters without stress testing."

        q = CareerAssessmentQuestion(
            role_id=role.id,
            category="Methodology & Tooling",
            question_type="scenario",
            difficulty="intermediate",
            question=q_text,
            code_snippet=None,
            options=[opt_a, opt_b, opt_c, opt_d],
            correct_answer=opt_a,
            explanation=f"Deploying automated verification and standardized review checkpoints with {tool} ensures reproducibility and quality in {domain}.",
            marks=1,
            is_active=True
        )
        questions_to_create.append(q)

    # 3. Practical / Scenario Problem Solving (5 questions - 20%)
    scenarios = [
        ("A critical anomaly or performance bottleneck is detected during high-throughput execution.",
         "Conduct isolated root-cause telemetry profiling to identify latency origins and apply targeted mitigation.",
         "Restart the entire operational environment repeatedly without checking diagnostic logs.",
         "Ignore the bottleneck until end-users file formal escalation tickets.",
         "Permanently disable alerting thresholds to mask warning indicators."),
        ("A regulatory compliance audit identifies an inconsistency in data retention and verification records.",
         "Audit the entire traceability chain, rectify audit logs, and establish continuous automated validation gates.",
         "Backdate contradictory records to match previous inspection dates.",
         "Delegate compliance responsibility entirely to non-technical subcontractors.",
         "Remove the questioned historical records from institutional archives."),
        ("Stakeholders request a major architectural scope adjustment mid-stream with tight deadline constraints.",
         "Perform an impact feasibility assessment evaluating technical debt, risk trade-offs, and critical path milestones.",
         "Accept all modifications immediately without adjusting delivery budgets or testing timelines.",
         "Reject the proposal outright without presenting data or trade-off alternatives.",
         "Pause all ongoing sprints indefinitely while seeking external legal counsel."),
        ("Disparate legacy datasets contain conflicting naming conventions, null attributes, and duplicate records.",
         "Construct a standardized normalization pipeline with schema validation and automated deduplication rules.",
         "Manually edit database tables in production without backups or transaction logs.",
         "Drop all records containing any missing values regardless of historical importance.",
         "Force all fields into unstructured text columns without relational constraints."),
        ("A mission-critical service must maintain zero-downtime availability during an essential version upgrade.",
         "Implement a blue-green or rolling deployment strategy with health checks and automated rollback triggers.",
         "Shut down live production instances during peak user hours without prior notification.",
         "Deploy code directly to production clusters without staging verification.",
         "Disable backup snapshots to speed up artifact extraction times.")
    ]

    for title_scen, opt_a, opt_b, opt_c, opt_d in scenarios:
        q = CareerAssessmentQuestion(
            role_id=role.id,
            category="Practical Scenarios",
            question_type="scenario",
            difficulty="practical",
            question=f"Scenario for a {title}: {title_scen} What is the recommended professional approach?",
            code_snippet=None,
            options=[opt_a, opt_b, opt_c, opt_d],
            correct_answer=opt_a,
            explanation=f"Professional best practice dictates: {opt_a}",
            marks=2,
            is_active=True
        )
        questions_to_create.append(q)

    # 4. Advanced & Strategic Architecture (2 questions - 8%)
    adv_scenarios = [
        (f"In enterprise-scale {title} architectures, how do you balance high fault tolerance against operational overhead?",
         "Decoupling critical path subsystems with asynchronous message queuing, circuit breakers, and automated self-healing.",
         "Combining all operational modules into a monolithic single-thread process.",
         "Eliminating redundant backup nodes to minimize monthly infrastructure cloud spend.",
         "Routing all synchronous requests through a single central coordinator without failover."),
        (f"How should a senior {title} approach long-term capacity planning and technical debt reduction?",
         "Establishing formal architectural review boards, automated regression testing, and modular refactoring milestones.",
         "Deferring all refactoring indefinitely in favor of quick temporary patches.",
         "Rewriting the entire software system from scratch every quarter.",
         "Prohibiting code modifications to any existing production service.")
    ]

    for q_text, opt_a, opt_b, opt_c, opt_d in adv_scenarios:
        q = CareerAssessmentQuestion(
            role_id=role.id,
            category="Advanced Architecture",
            question_type="scenario",
            difficulty="advanced",
            question=q_text,
            code_snippet=None,
            options=[opt_a, opt_b, opt_c, opt_d],
            correct_answer=opt_a,
            explanation=f"Advanced systems in {domain} rely on: {opt_a}",
            marks=2,
            is_active=True
        )
        questions_to_create.append(q)

    # Add all questions to DB
    for q in questions_to_create:
        db.add(q)
    db.commit()

    return questions_to_create

