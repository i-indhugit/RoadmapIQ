import pytest
from app.engine.topological_planner import TopologicalPlanner, DependencyCycleError
from app.engine.skill_gap_analyzer import calculate_readiness_score, analyze_skill_gaps
from app.engine.roadmap_generator import generate_roadmap_plan


class MockSkill:
    def __init__(self, id, slug, name, category="General", doc_url="", hb=15, hi=25, ha=35):
        self.id = id
        self.slug = slug
        self.name = name
        self.category = category
        self.doc_url = doc_url
        self.estimated_hours_beginner = hb
        self.estimated_hours_intermediate = hi
        self.estimated_hours_advanced = ha


class MockRequirement:
    def __init__(self, skill_id, skill, req_prof=2, weight=3, is_core=True):
        self.skill_id = skill_id
        self.skill = skill
        self.required_proficiency = req_prof
        self.importance_weight = weight
        self.is_core = is_core


class MockRole:
    def __init__(self, id=1, title="Software Development Engineer"):
        self.id = id
        self.title = title


def test_topological_planner_linear():
    """Test linear dependencies: Python (1) -> DSA (2) -> System Design (3)"""
    skill_ids = {1, 2, 3}
    prereqs = [(2, 1), (3, 2)]  # 2 requires 1, 3 requires 2
    names = {1: "Python", 2: "DSA", 3: "System Design"}
    weights = {1: 4, 2: 5, 3: 4}

    planner = TopologicalPlanner(skill_ids, prereqs, names, weights)
    order = planner.get_topological_order()

    assert order.index(1) < order.index(2)
    assert order.index(2) < order.index(3)


def test_topological_planner_cycle_detection():
    """Test that a circular dependency raises DependencyCycleError."""
    skill_ids = {1, 2}
    prereqs = [(1, 2), (2, 1)]  # 1 requires 2, 2 requires 1

    planner = TopologicalPlanner(skill_ids, prereqs)
    with pytest.raises(DependencyCycleError):
        planner.get_topological_order()


def test_readiness_score_calculation():
    s1 = MockSkill(1, "python", "Python")
    s2 = MockSkill(2, "dsa", "DSA")

    reqs = [
        MockRequirement(1, s1, req_prof=2, weight=4),
        MockRequirement(2, s2, req_prof=2, weight=6)
    ]

    # Student has python=2, dsa=0
    # Expected: (4 * 1.0 + 6 * 0.0) / 10 * 100 = 40.0%
    score = calculate_readiness_score(reqs, {"python": 2, "dsa": 0})
    assert score == 40.0

    # Student has python=2, dsa=2
    score_full = calculate_readiness_score(reqs, {"python": 2, "dsa": 2})
    assert score_full == 100.0


def test_skill_gap_analysis():
    s1 = MockSkill(1, "python", "Python")
    s2 = MockSkill(2, "fastapi", "FastAPI")

    role = MockRole()
    reqs = [
        MockRequirement(1, s1, req_prof=2, weight=5, is_core=True),
        MockRequirement(2, s2, req_prof=2, weight=4, is_core=True)
    ]

    prereq_map = {2: [1]}  # FastAPI requires Python
    skill_lookup = {1: s1, 2: s2}

    # Student has zero skills
    res = analyze_skill_gaps(role, reqs, prereq_map, skill_lookup, {})
    assert res.readiness_score == 0.0
    assert res.total_skills_count == 2
    # FastAPI should be marked 'blocked' because Python is missing
    fastapi_gap = next(g for g in res.gaps if g.skill_id == 2)
    assert fastapi_gap.status == "blocked"
    assert "Python" in fastapi_gap.unmet_prerequisites

