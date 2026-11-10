# RoadmapIQ – Production Deployment Guide (Render ONLY, ₹0 Free Tier)

Deploy **RoadmapIQ** completely **FREE** on **Render** with persistent **PostgreSQL**.

---

## Architecture Overview

RoadmapIQ is configured to run seamlessly on **Render** using the unified full-stack blueprint (`render.yaml`), or optionally as two separate Render services:

1. **Recommended (Single Unified Render Web Service — Free Tier ₹0):**
   - **Runtime:** Python 3.10 (`uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1 --proxy-headers`)
   - **API:** Served at `/api/*` (`/health` and `/ready` for Render health checks)
   - **Frontend SPA:** Pre-built React + Vite bundle in `dist/` served directly by FastAPI with SPA client-side route fallback.
   - **Database:** External PostgreSQL (`DATABASE_URL` pointing to Render Managed PostgreSQL or Neon Free PostgreSQL).

2. **Alternative (Separate Render Backend Web Service + Render Frontend Static Site):**
   - **Backend Web Service:** Root directory `.` (or `backend`), Build `pip install -r requirements.txt`, Start `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1 --proxy-headers`.
   - **Frontend Static Site:** Root directory `frontend`, Build `npm ci && npm run build`, Publish directory `dist`.
   - **Rewrite Rule (Required for SPA Refresh on Static Site):** Source `/*` → Destination `/index.html` (Action: `Rewrite`).
   - **Frontend Env Var:** `VITE_API_BASE_URL=https://your-backend-service.onrender.com/api`.

---

## Critical Production Requirement: Persistent PostgreSQL (`DATABASE_URL`)

> **IMPORTANT:** Render's Free Web Service local filesystem is **ephemeral** — SQLite (`roadmapiq.db`) resets whenever Render restarts or redeploys the container.

To persist student accounts, target careers, roadmaps, and progress across deployments:
1. Provision a free PostgreSQL database (Render Free PostgreSQL or Neon Free PostgreSQL).
2. Set `DATABASE_URL` in Render → **Environment** (e.g. `postgresql://user:pass@host/dbname?sslmode=require`).
3. Verify connectivity by opening `https://<your-render-app>.onrender.com/ready` — look for `"database": "connected"` and `"database_url_dialect": "postgresql"`.

---

## Required Render Environment Variables

| Variable | Value / Description | Required |
|---|---|---|
| `PYTHON_VERSION` | `3.10.16` | Recommended |
| `APP_ENV` | `production` | Yes |
| `DATABASE_URL` | PostgreSQL connection string | **Yes (for persistence)** |
| `SECRET_KEY` | Random secret string for auth tokens | **Yes** |
| `GEMINI_API_KEY` | Google Gemini API key (optional; deterministic/RAG fallback active if unset) | Optional |
| `CORS_ORIGINS` | JSON array of allowed origins if hosting frontend separately | Optional (`*.onrender.com` allowed automatically) |

---

## Local Verification Commands

```bash
# Build frontend production bundle and sync to root dist/
cd frontend && npm run build
Copy-Item -Path frontend/dist/* -Destination dist/ -Recurse -Force

# Run backend automated test suite
backend\venv\Scripts\python -m pytest backend\tests
```
