#!/usr/bin/env python3
"""
Render deployment startup script for Dr. Jii Medical Assistant
"""
import os
import sys
from pathlib import Path

def main():
    try:
        # Add backend to Python path
        backend_path = Path(__file__).parent / "backend"
        sys.path.insert(0, str(backend_path))
        
        # Set working directory to backend
        os.chdir(str(backend_path))
        
        # Import and run the main application
        from main import app
        import uvicorn
        
        # Get port from environment (Render sets this)
        port = int(os.environ.get("PORT", 10000))
        host = os.environ.get("HOST", "0.0.0.0")
        
        print(f"🚀 Starting Dr. Jii Medical Assistant on {host}:{port}")
        print(f"📚 API Documentation will be available at /docs")
        print(f"🌐 Frontend will be available at /frontend/")
        
        # Run the application
        uvicorn.run(
            app, 
            host=host, 
            port=port,
            log_level="info",
            access_log=True
        )
        
    except Exception as e:
        print(f"❌ Startup Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()