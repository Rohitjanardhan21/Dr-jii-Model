from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "AI-Health Assistant Doctor Jii is Online!",
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "port": os.getenv("PORT", "8000")
    }

@app.get("/predict")
def predict():
    # This is where your model logic will eventually go
    return {"status": "Model is ready for health queries"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "openai_api_key_configured": bool(os.getenv("OPENAI_API_KEY")),
        "service": "Dr. Jii Model"
    }

# Frontend serving
frontend_path = Path(__file__).parent / "frontend"
if frontend_path.exists():
    # Mount static files
    app.mount("/frontend", StaticFiles(directory=str(frontend_path), html=True), name="frontend")
    
    # Serve index.html at the root frontend path
    @app.get("/frontend/")
    async def serve_frontend():
        return FileResponse(str(frontend_path / "index.html"))
else:
    @app.get("/frontend/")
    async def frontend_not_found():
        return {"error": "Frontend directory not found", "path": str(frontend_path)}

if __name__ == "__main__":
    import uvicorn
    # Cloud Run provides the PORT environment variable
    port = int(os.environ.get("PORT", 8000))  # Changed to port 8000
    print(f"\n🚀 Starting Dr. Jii Model on http://localhost:{port}")
    print(f"📚 API Docs: http://localhost:{port}/docs")
    print(f"🌐 Frontend: http://localhost:{port}/frontend/")
    print(f"🔮 Predict: http://localhost:{port}/predict\n")
    uvicorn.run(app, host="0.0.0.0", port=port)
