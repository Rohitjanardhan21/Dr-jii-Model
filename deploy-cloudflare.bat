@echo off
echo 🌐 Deploying Dr. Jii to Cloudflare
echo ==================================

echo.
echo 📋 Prerequisites Check:
echo   1. Cloudflare account created
echo   2. Wrangler CLI installed
echo   3. Domain configured (optional)
echo.

echo 🔧 Step 1: Install Wrangler CLI (if not installed)
where wrangler >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Wrangler CLI...
    npm install -g wrangler
) else (
    echo ✅ Wrangler CLI already installed
)

echo.
echo 🔑 Step 2: Login to Cloudflare
wrangler auth login

echo.
echo 📊 Step 3: Create D1 Database
echo Creating D1 database for Dr. Jii...
wrangler d1 create dr-jii-database

echo.
echo 📤 Step 4: Deploy Frontend to Cloudflare Pages
echo Go to: https://dash.cloudflare.com/pages
echo 1. Connect your GitHub repository
echo 2. Set build command: (leave empty)
echo 3. Set build output directory: frontend
echo 4. Deploy

echo.
echo 🚀 Step 5: Deploy Worker (API)
echo Deploying Cloudflare Worker...
wrangler deploy

echo.
echo ✅ Deployment Complete!
echo.
echo 📋 Next Steps:
echo   1. Configure your database schema in D1
echo   2. Add environment variables (API keys)
echo   3. Update frontend API URLs
echo   4. Test your deployment
echo.
pause