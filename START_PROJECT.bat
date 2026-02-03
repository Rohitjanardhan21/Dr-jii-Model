@echo off
title Dr. Jii - Complete Project Startup
color 0A

echo.
echo ========================================
echo 🚀 DR. JII - COMPLETE PROJECT STARTUP
echo ========================================
echo.

echo 📋 Checking project status...
echo.

REM Check if virtual environment exists
if not exist ".venv" (
    echo ❌ Virtual environment not found!
    echo Creating virtual environment...
    python -m venv .venv
    echo ✅ Virtual environment created
)

echo 🔧 Activating virtual environment...
call .venv\Scripts\activate.bat

echo 📦 Installing/updating dependencies...
pip install -r requirements.txt --quiet

echo.
echo 🗄️ Checking database...
if exist "drjii.db" (
    echo ✅ Database found: drjii.db
) else (
    echo ⚠️ Database not found - will be created on first run
)

echo.
echo 🌐 Starting Dr. Jii Backend + Frontend...
echo.
echo 📍 Server will be available at:
echo    🔗 Frontend App: http://localhost:8000/frontend/
echo    🔗 API Docs:     http://localhost:8000/docs
echo    🔗 Main API:     http://localhost:8000/
echo    🔗 Health Check: http://localhost:8000/health
echo.
echo 💡 Press Ctrl+C to stop the server
echo.

cd backend
python main.py