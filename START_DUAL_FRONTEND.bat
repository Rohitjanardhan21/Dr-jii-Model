@echo off
echo 🚀 Starting Dr. Jii with Dual Frontend System
echo ================================================
echo.

echo 📦 Step 1: Installing Python dependencies...
call .venv\Scripts\activate
pip install -r requirements.txt

echo.
echo 🔨 Step 2: Building Chat Frontend...
cd frontend
call npm install
call npm run build
cd ..

echo.
echo 🔨 Step 3: Building Expert Dashboard...
cd frontend-expert
call npm install
call npm run build
cd ..

echo.
echo 🚀 Step 4: Starting backend server...
echo.
echo ✅ Server will be available at:
echo    • Expert Dashboard: http://localhost:8000/expert/
echo    • Chat Frontend: http://localhost:8000/frontend/
echo    • API Docs: http://localhost:8000/docs
echo    • Health Check: http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the server
echo.

python backend/main.py