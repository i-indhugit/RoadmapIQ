@echo off
echo ========================================================
echo       Starting RoadmapIQ Platform (Full-Stack)
echo ========================================================
echo.
echo Launching FastAPI Backend on http://localhost:8000...
start "RoadmapIQ Backend" cmd /k "set PYTHONPATH=backend && .\backend\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo Launching React + Vite Frontend on http://localhost:5173...
start "RoadmapIQ Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo RoadmapIQ application launched!
echo - Frontend:  http://localhost:5173
echo - Backend:   http://localhost:8000
echo - Swagger:   http://localhost:8000/docs
echo ========================================================

