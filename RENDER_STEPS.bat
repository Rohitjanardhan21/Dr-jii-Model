@echo off
echo ========================================
echo   Dr. Jii - Render Deployment Steps
echo ========================================
echo.
echo STEP 1: Go to render.com
echo - Click "Get Started for Free"
echo - Sign up with GitHub
echo.
echo STEP 2: Create Web Service
echo - Click "New +" button
echo - Select "Web Service"
echo - Connect your GitHub account
echo - Select your repository
echo.
echo STEP 3: Configure Settings
echo Name: dr-jii-backend
echo Region: Choose closest to you
echo Branch: main
echo Root Directory: (leave empty)
echo Runtime: Python 3
echo Build Command: pip install -r requirements.txt
echo Start Command: python backend/main.py
echo.
echo STEP 4: Add Environment Variables
echo OPENAI_API_KEY = (your OpenAI API key)
echo SECRET_KEY = (generate a random string)
echo ENVIRONMENT = production
echo PORT = 10000
echo.
echo STEP 5: Deploy
echo - Click "Create Web Service"
echo - Wait for deployment (5-10 minutes)
echo - You'll get a URL like: https://dr-jii-backend.onrender.com
echo.
echo STEP 6: Test
echo - Visit: https://your-url.onrender.com/docs
echo - Should show FastAPI documentation
echo.
echo ========================================
echo After deployment, update your Cloudflare Pages
echo frontend to use the new backend URL!
echo ========================================
pause