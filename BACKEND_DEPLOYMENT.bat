@echo off
echo ========================================
echo   Dr. Jii - Backend Deployment Guide
echo ========================================
echo.
echo STEP 1: Choose a hosting service
echo.
echo OPTION A: RAILWAY (Recommended)
echo 1. Go to: https://railway.app
echo 2. Sign up with GitHub
echo 3. Click "Deploy from GitHub repo"
echo 4. Select your Dr-jii-Model repository
echo 5. Railway will auto-detect Python
echo 6. Add environment variables:
echo    - OPENAI_API_KEY=your_openai_key
echo    - SECRET_KEY=your_secret_key
echo    - ENVIRONMENT=production
echo 7. Deploy!
echo.
echo OPTION B: RENDER
echo 1. Go to: https://render.com
echo 2. Sign up with GitHub
echo 3. Click "New Web Service"
echo 4. Connect your repository
echo 5. Settings:
echo    - Build Command: pip install -r requirements.txt
echo    - Start Command: python backend/main.py
echo 6. Add environment variables (same as above)
echo 7. Deploy!
echo.
echo ========================================
echo STEP 2: Update Frontend API URLs
echo After backend is deployed, you'll get a URL like:
echo https://your-app.railway.app
echo.
echo Update your Cloudflare Pages frontend to use this URL
echo ========================================
echo.
echo Current frontend is at: Cloudflare Pages
echo Backend will be at: Railway/Render URL
echo ========================================
pause