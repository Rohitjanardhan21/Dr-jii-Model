#!/bin/bash
set -e

echo "🔨 Building Dr. Jii for Render Deployment"
echo "=========================================="

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Check if Node.js is available
if command -v node &> /dev/null; then
    echo "✅ Node.js version: $(node --version)"
    echo "✅ npm version: $(npm --version)"
else
    echo "❌ Node.js not found!"
    exit 1
fi

# Build React frontend
echo "🔨 Building React frontend..."
cd frontend

# Clean install for production
echo "📦 Installing frontend dependencies..."
npm ci --only=production

# Build the React app
echo "🏗️ Building React app..."
npm run build

# Verify build
if [ -d "dist" ]; then
    echo "✅ React build successful!"
    echo "📁 Build files:"
    ls -la dist/
else
    echo "❌ React build failed - dist directory not found"
    exit 1
fi

cd ..

echo "🎉 Build complete!"
echo "✅ Python backend ready"
echo "✅ React frontend built"