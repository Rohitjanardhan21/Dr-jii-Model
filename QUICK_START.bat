@echo off
echo ========================================
echo   Dr. Jii - Quick Local Start
echo ========================================
echo.
echo Starting backend server on http://localhost:8000
echo.
start "Dr. Jii Backend" cmd /k "cd /d %~dp0 && .venv\Scripts\activate && python backend/main.py"
echo.
echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul
echo.
echo Opening frontend in browser...
start "" "http://localhost:8000/frontend/index.html"
echo.
echo ========================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:8000/frontend/index.html
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Press any key to close...
pause > nul