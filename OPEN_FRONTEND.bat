@echo off
echo 🌐 Opening Dr. Jii Frontend Applications
echo ========================================

echo.
echo 🚀 Opening main application...
start http://localhost:8000/frontend/

echo ⏳ Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo 📚 Opening API documentation...
start http://localhost:8000/docs

echo ⏳ Waiting 1 second...
timeout /t 1 /nobreak >nul

echo 🔍 Opening health check...
start http://localhost:8000/health

echo.
echo ✅ All frontend applications opened!
echo.
echo 📋 Available URLs:
echo   🎯 Main App:    http://localhost:8000/frontend/
echo   📖 API Docs:    http://localhost:8000/docs
echo   ❤️ Health:      http://localhost:8000/health
echo   🔌 Main API:    http://localhost:8000/
echo.
pause