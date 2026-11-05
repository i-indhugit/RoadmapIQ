# RoadmapIQ Full-Stack Launcher (PowerShell)
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       Starting RoadmapIQ Platform (Full-Stack)         " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$backendPath = "backend\venv\Scripts\python.exe"

if (-Not (Test-Path $backendPath)) {
    Write-Host "Error: Virtual environment not found at $backendPath" -ForegroundColor Red
    exit 1
}

Write-Host "Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PYTHONPATH='backend'; .\backend\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 2

Write-Host "Launching React + Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`nRoadmapIQ platform started successfully!" -ForegroundColor Yellow
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "- Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "- API Docs: http://localhost:8000/docs" -ForegroundColor White

