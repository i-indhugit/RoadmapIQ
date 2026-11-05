@echo off
echo =========================================
echo    RoadmapIQ FastAPI Backend Launcher
echo =========================================

set PYTHONPATH=backend
.\backend\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

