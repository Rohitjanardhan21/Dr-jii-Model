@echo off
echo 🚀 Starting Dr. Jii Medical Assistant (Full Stack)
echo ================================================
echo.

echo 📦 Step 1: Installing Python dependencies...
call .venv\Scripts\activate
pip install -r requirements.txt

echo.
echo 🔨 Step 2: Building React frontend...
cd frontend
call npm install
call npm run build
cd ..

echo.
echo 🚀 Step 3: Starting backend server...
echo Server will be available at:
echo • Frontend: http://localhost:8000/frontend/
echo • API Docs: http://localhost:8000/docs
echo • Health Check: http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the server
echo.

python backend/main.py