@echo off
echo ========================================
echo   Dr. Jii - Simple Cloudflare Deployment
echo ========================================
echo.
echo This script will help you deploy to Cloudflare Pages
echo.
echo OPTION 1: Manual Upload
echo 1. Go to https://dash.cloudflare.com/
echo 2. Click "Pages" in sidebar
echo 3. Click "Create a project"
echo 4. Choose "Upload assets"
echo 5. Upload the "frontend" folder
echo 6. Set project name: dr-jii-medical
echo 7. Click "Deploy site"
echo.
echo OPTION 2: GitHub Integration
echo 1. Push this project to GitHub
echo 2. In Cloudflare Pages, choose "Connect to Git"
echo 3. Select your repository
echo 4. Set build output directory: frontend
echo 5. Deploy
echo.
echo OPTION 3: Command Line (if wrangler works)
echo Run: npx wrangler pages deploy frontend --project-name dr-jii-medical
echo.
echo ========================================
echo Your frontend files are in: frontend/
echo Your backend needs to be hosted separately (like Render, Railway, etc.)
echo ========================================
pause