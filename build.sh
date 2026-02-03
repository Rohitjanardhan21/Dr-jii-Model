#!/bin/bash
set -e

echo "🔨 Building Dr. Jii for Render Deployment"
echo "=========================================="

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Check Node.js availability
echo "🔍 Checking Node.js environment..."
node --version
npm --version

# Navigate to frontend directory
echo "📁 Navigating to frontend directory..."
cd frontend
pwd
ls -la

# Clean any existing build
echo "🧹 Cleaning previous builds..."
rm -rf dist node_modules/.cache

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build the React app
echo "🏗️ Building React application..."
npm run build

# Verify build success
echo "✅ Verifying build..."
if [ -d "dist" ]; then
    echo "✅ Build successful! Contents:"
    ls -la dist/
    echo "📄 Index.html exists: $(test -f dist/index.html && echo 'YES' || echo 'NO')"
else
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

cd ..
echo "🎉 Build process completed successfully!"