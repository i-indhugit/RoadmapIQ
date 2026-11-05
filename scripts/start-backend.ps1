# RoadmapIQ Backend Launcher
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   RoadmapIQ FastAPI Backend Launcher    " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$env:PYTHONPATH = "backend"
$pythonPath = ".\backend\venv\Scripts\python.exe"

if (-Not (Test-Path $pythonPath)) {
    Write-Host "Error: Virtual environment not found at $pythonPath" -ForegroundColor Red
    exit 1
}

Write-Host "Starting FastAPI server on http://localhost:8000..." -ForegroundColor Green
Write-Host "Swagger Documentation available at http://localhost:8000/docs" -ForegroundColor Yellow

& $pythonPath -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

