@echo off
echo Starting Dr. Jii Backend Server...
cd backend
start http://localhost:8000/frontend/index.html
python -m uvicorn main:app --reload