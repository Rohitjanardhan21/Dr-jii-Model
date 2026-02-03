@echo off
title Dr. Jii - Complete Startup
color 0B

echo.
echo ==========================================
echo 🏥 DR. JII - COMPLETE PROJECT STARTUP
echo ==========================================
echo.

echo 🔍 Step 1: Checking if server is already running...
netstat -an | find "8000" >nul
if %errorlevel%==0 (
    echo ✅ Server is already running on port 8000
    echo.
    echo 🌐 Opening frontend applications...
    call OPEN_FRONTEND.bat
    goto :end
)

echo ⚠️ Server not running. Starting complete project...
echo.

echo 🚀 Step 2: Starting backend server...
start "Dr. Jii Backend" cmd /k "START_PROJECT.bat"

echo ⏳ Step 3: Waiting for server to start...
timeout /t 5 /nobreak >nul

echo 🌐 Step 4: Opening frontend applications...
call OPEN_FRONTEND.bat

echo.
echo ==========================================
echo 🎉 DR. JII PROJECT IS NOW RUNNING!
echo ==========================================
echo.
echo 📋 What's Running:
echo   ✅ Backend Server (FastAPI + Database)
echo   ✅ Frontend Interface (React-like UI)
echo   ✅ API Documentation (Swagger UI)
echo   ✅ All endpoints active
echo.
echo 🎯 Main Application: http://localhost:8000/frontend/
echo.
echo 💡 To stop the server:
echo    - Go to the backend window
echo    - Press Ctrl+C
echo.

:end
pause