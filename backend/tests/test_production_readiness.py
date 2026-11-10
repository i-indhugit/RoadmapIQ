import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app, Base
from app.database import get_db
from app.engine.seed_data import seed_database
from app.engine.seed_all_domain_careers import seed_all_domain_careers
from app.engine.seed_rag_knowledge import seed_rag_knowledge


@pytest.fixture
def isolated_client(tmp_path, monkeypatch):
    """
    Provides a FastAPI TestClient backed by an isolated temporary SQLite database
    so automated production tests never pollute workspace or production data.
    """
    monkeypatch.setattr("app.engine.gemini_service.call_gemini", lambda *a, **kw: None)
    monkeypatch.setattr("app.engine.gemini_service.call_gemini_text", lambda *a, **kw: None)

    test_db_path = tmp_path / "isolated_prod_test.db"
    test_engine = create_engine(
        f"sqlite:///{test_db_path}",
        connect_args={"check_same_thread": False},
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    # Seed minimal + full career catalog & RAG into isolated DB
    seed_session = TestingSessionLocal()
    try:
        seed_database(seed_session)
        seed_all_domain_careers(seed_session)
        seed_rag_knowledge(seed_session)
    finally:
        seed_session.close()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as client:
            yield client
    finally:
        app.dependency_overrides.pop(get_db, None)
        test_engine.dispose()


def test_health_ready_cors_and_spa_routing(isolated_client):
    # 1. Health & Readiness probes
    health_res = isolated_client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"

    ready_res = isolated_client.get("/ready")
    assert ready_res.status_code == 200
    assert ready_res.json()["database"] == "connected"

    # 2. Unhandled /api/* path must return 404 JSON, never index.html
    missing_api = isolated_client.get("/api/does-not-exist-endpoint")
    assert missing_api.status_code == 404
    assert "application/json" in missing_api.headers.get("content-type", "")

    # 3. Client-side SPA routes must resolve cleanly to index.html on refresh
    for route in ["/discover", "/journey", "/growth", "/mentor"]:
        spa_res = isolated_client.get(route)
        assert spa_res.status_code == 200
        assert "text/html" in spa_res.headers.get("content-type", "")

    # 4. CORS preflight for Render origin
    cors_res = isolated_client.options(
        "/api/roles",
        headers={
            "Origin": "https://roadmapiq-frontend-preview.onrender.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert cors_res.status_code in (200, 204)
    assert cors_res.headers.get("access-control-allow-origin") == "https://roadmapiq-frontend-preview.onrender.com"


def test_end_to_end_user_journeys_isolated(isolated_client):
    # Register an isolated student account
    reg = isolated_client.post(
        "/api/auth/register",
        json={
            "email": "prod_e2e@roadmapiq.test",
            "password": "StrongPassword123!",
            "display_name": "E2E Tester",
        },
    )
    assert reg.status_code == 201
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test Case 1: Career Discovery
    roles_res = isolated_client.get("/api/roles", headers=headers)
    assert roles_res.status_code == 200
    roles = roles_res.json()
    assert len(roles) >= 250
    target_role = roles[0]

    detail_res = isolated_client.get(f"/api/roles/{target_role['id']}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["title"] == target_role["title"]

    # Test Case 2: Target Career & Personalized Roadmap Persistence
    set_target = isolated_client.post(
        "/api/profile/target",
        json={"role_id": target_role["id"], "target_duration_weeks": 12, "weekly_study_hours": 15},
        headers=headers,
    )
    assert set_target.status_code == 200
    profile_data = set_target.json()
    assert profile_data["target_role_id"] == target_role["id"]
    profile_id = profile_data["id"]

    # Verify fresh /profile/latest reload preserves target career
    latest_prof = isolated_client.get("/api/profile/latest", headers=headers)
    assert latest_prof.status_code == 200
    assert latest_prof.json()["target_role_id"] == target_role["id"]

    # Switch / fetch roadmap
    rm_res = isolated_client.post(
        "/api/roadmaps/switch",
        json={"role_id": target_role["id"], "profile_id": profile_id, "target_duration_weeks": 4},
        headers=headers,
    )
    assert rm_res.status_code == 200
    roadmap = rm_res.json()
    assert roadmap["target_duration_weeks"] == 4
    assert len(roadmap["tasks"]) > 0
    first_task = roadmap["tasks"][0]

    # Test Case 3: My Growth Progress Persistence
    toggle_res = isolated_client.patch(
        f"/api/tasks/{first_task['id']}",
        json={"is_completed": True},
        headers=headers,
    )
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_completed"] is True

    prog_res = isolated_client.get(f"/api/roadmaps/{roadmap['id']}/progress", headers=headers)
    assert prog_res.status_code == 200
    assert prog_res.json()["completed_tasks"] >= 1

    # Test Case 4: AI Mentor & RAG Pipeline
    rag_res = isolated_client.post(
        "/api/rag/query",
        json={
            "query": f"What skills are essential for {target_role['title']}?",
            "target_role": target_role["title"],
            "profile_id": profile_id,
        },
        headers=headers,
    )
    assert rag_res.status_code == 200
    rag_data = rag_res.json()
    assert len(rag_data["answer"]) > 30
    assert rag_data["is_grounded_in_rag"] is True
    assert len(rag_data["sources"]) >= 1

    ai_res = isolated_client.post(
        "/api/ai/learning-assistant",
        json={
            "query": "Explain Java JVM memory and RESTful microservices",
            "target_role": target_role["title"],
        },
        headers=headers,
    )
    assert ai_res.status_code == 200
    assert ai_res.json()["is_grounded_in_rag"] is True
    assert len(ai_res.json()["sources"]) >= 1

