#!/usr/bin/env python3
"""
Alternative startup script for Render
"""
import os
import sys
import uvicorn

# Simple approach - run from root directory
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting Dr. Jii on {host}:{port}")
    
    # Run the backend main module
    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        log_level="info",
        reload=False
    )