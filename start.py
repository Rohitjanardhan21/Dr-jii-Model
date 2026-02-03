#!/usr/bin/env python3
"""
Render deployment startup script for Dr. Jii Medical Assistant
"""
import os
import sys
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

# Set working directory to backend
os.chdir(str(backend_path))

# Import and run the main application
from main import app
import uvicorn

if __name__ == "__main__":
    # Get port from environment (Render sets this)
    port = int(os.environ.get("PORT", 10000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting Dr. Jii Medical Assistant on {host}:{port}")
    print(f"📚 API Documentation: https://dr-jii-medical-assistant.onrender.com/docs")
    print(f"🌐 Frontend: https://dr-jii-medical-assistant.onrender.com/frontend/")
    
    # Run the application
    uvicorn.run(
        app, 
        host=host, 
        port=port,
        log_level="info"
    )