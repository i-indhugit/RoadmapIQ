# RoadmapIQ | Skill Roadmap Generator

> **"Your Skills. Your Path. Your Future."**

RoadmapIQ is a full-stack, AI-powered career roadmap generator and placement preparation platform. It evaluates a student's self-assessed technical skills, performs rigorous rule-based skill-gap analysis, sequences learning milestones through a Directed Acyclic Graph (DAG) topological planner, retrieves verified free resources via a Grounded RAG engine, and delivers contextual Generative AI mentorship.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.10+ (Python 3.12 included in `backend/venv`)
- **Node.js**: 18+ (tested with v24.18.0, npm 11.16.0)
- **Optional**: Local Ollama instance running `llama3` on `http://localhost:11434` (falls back automatically to deterministic curriculum reasoning if offline)

---

### 1. Backend Setup & Run

The backend is built with FastAPI, SQLite, and SQLAlchemy. The database auto-seeds on initial launch with 10 industry roles, 20+ core skills, prerequisite dependencies, 60+ verified learning resources, portfolio projects, and interview questions.

#### Using PowerShell:
```powershell
# Set PYTHONPATH and start the FastAPI server
$env:PYTHONPATH = "backend"
.\backend\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Or using the helper script:
```powershell
.\scripts\start-backend.ps1
# Or in cmd.exe:
.\scripts\start-backend.bat
```

- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

#### Running Backend Tests:
```powershell
$env:PYTHONPATH = "backend"
.\backend\venv\Scripts\pytest.exe backend\tests -v
```

---

### 2. Frontend Setup & Run

The frontend is built with React 18, Vite, React Router v6, Tailwind CSS, Recharts, and Lucide React.

```powershell
cd frontend
npm install
npm run dev
```

#### Or using the helper script:
```powershell
.\scripts\start-frontend.ps1
# Or in cmd.exe:
.\scripts\start-frontend.bat
```

- **Frontend Application**: `http://localhost:5173`

#### Building for Production:
```powershell
cd frontend
npm run build
```

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Base URL pointing to the FastAPI backend API |

*Note: Never place API keys or secrets in frontend environment variables. All AI keys and configurations remain securely on the backend.*

### Backend (`backend/.env` or defaults in `backend/app/config.py`)
| Variable | Default Value | Description |
|---|---|---|
| `APP_NAME` | `RoadmapIQ` | Application name |
| `DATABASE_URL` | `sqlite:///./roadmapiq.db` | SQLAlchemy SQLite database path |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Local Ollama daemon base URL |
| `OLLAMA_MODEL` | `llama3` | Target Ollama model name |
| `OLLAMA_TIMEOUT_SECONDS` | `5.0` | Timeout before graceful fallback |

---

## 🧭 Application Pages

1. **Landing Page (`/`)**: Brand overview, system architecture pipeline, and career role showcase.
2. **Student Profile (`/profile`)**: Education level, degree, weekly study hours (3-60), target duration (2-52 weeks), and self-reported skills proficiency (1-3).
3. **Career Explorer (`/careers`)**: Search and filter 10 standardized technical roles (SDE, Java, Python, Frontend, Full-Stack, Data Analyst, Data Scientist, ML Engineer, GenAI Developer, QA Automation).
4. **Main Dashboard (`/dashboard`)**: Overall readiness score, active streak, weekly progress chart, next upcoming tasks, and quick guidance shortcuts.
5. **Skill Gap Analysis (`/skill-gap`)**: Visual readiness breakdown (Met, Needs Improvement, Missing, Blocked by prerequisites), Recharts radar chart, and "AI Explain" button.
6. **AI-Generated Roadmap (`/roadmap`)**: Weekly sections, expandable task cards, estimated hours, priority badges, completion criteria, verified free resources, task completion checkboxes with backend persistence, and AI study advice.
7. **RAG Learning Assistant (`/assistant`)**: Grounded AI chat assistant citing real retrieved documentation and coding platforms with clickable URLs. Clear negative match handling without hallucinations.
8. **Free Resource Library (`/resources`)**: Searchable and filterable learning resources (by skill, difficulty, format). Ratings, provider badges, bookmarks, and external links.
9. **Project Recommendations (`/projects`)**: Curated portfolio projects matched to target role and gaps, with problem statements, suggested tech stack, milestones, and "AI Project Mentor" modal with starter code.
10. **Interview Preparation (`/interview`)**: Placement question bank across DSA, Core CS, Technical, and HR/Behavioral with expandable sample answers, key points, completion toggle, and AI Mock Practice evaluation with score 1-10.
11. **Settings & Diagnostics (`/settings`)**: FastAPI connection diagnostics, AI provider status (Ollama vs Deterministic engine), pacing adjustment sliders, and local cache reset.

---

## 🔒 Security & Data Integrity
- **Backend-Only AI Secrets**: No sensitive keys are exposed to the client.
- **Strictly Grounded RAG**: The assistant only cites verified database resources with real URLs.
- **Relational Persistence**: All progress and task states are verified and persisted in SQLite.

