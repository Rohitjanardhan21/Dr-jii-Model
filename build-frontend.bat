@echo off
echo 🔨 Building React Frontend for Dr. Jii...
echo.

cd frontend
echo 📦 Installing dependencies...
call npm install

echo 🏗️ Building production bundle...
call npm run build

echo.
echo ✅ Frontend build complete!
echo 📁 Built files are in: frontend/dist/
echo 🚀 You can now start the backend server
echo.
pause