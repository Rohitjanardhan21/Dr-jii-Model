@echo off
echo Starting Dr. Jii Backend Server...
cd backend
start http://localhost:8081/frontend/index.html
python -m uvicorn main:app --reload --port 8081