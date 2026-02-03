from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import logging
from pathlib import Path
from database import engine, Base
from config import get_settings
from api import doctor_routes, patient_routes, admin_routes
from api.auth_routes import router as auth_router

settings = get_settings()
logging.basicConfig(level=logging.INFO)

Base.metadata.create_all(bind=engine)

# Get absolute path to frontend build directory
FRONTEND_BUILD_PATH = Path(__file__).parent.parent / "frontend" / "dist"
FRONTEND_DEV_PATH = Path(__file__).parent.parent / "frontend" / "src"

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-powered Doctor Assistant Platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(doctor_routes.router)
app.include_router(patient_routes.router)
app.include_router(admin_routes.router)

@app.get("/")
async def root():
    # Redirect to frontend for better UX
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/frontend/")

@app.get("/api")
async def api_root():
    return {
        "message": "Dr. Jii API is running",
        "version": settings.VERSION,
        "docs": "/docs",
        "frontend": "/frontend/"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Dr. Jii API"}

# Serve React frontend
if FRONTEND_BUILD_PATH.exists():
    # Production: serve built React app
    app.mount("/frontend", StaticFiles(directory=str(FRONTEND_BUILD_PATH), html=True), name="frontend")
    
    @app.get("/frontend/{path:path}")
    async def serve_react_app(path: str):
        file_path = FRONTEND_BUILD_PATH / path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        # For React Router, return index.html for unknown routes
        return FileResponse(FRONTEND_BUILD_PATH / "index.html")
else:
    # Development: serve message about building frontend
    @app.get("/frontend/")
    async def frontend_build_required():
        return {
            "message": "Frontend build not found. Please run 'npm run build' in the frontend directory.",
            "build_path": str(FRONTEND_BUILD_PATH),
            "instructions": [
                "cd frontend",
                "npm install",
                "npm run build"
            ]
        }

if __name__ == "__main__":
    import uvicorn
    print(f"\n🚀 Starting Dr. Jii on http://localhost:{settings.PORT}")
    print(f"📚 API Docs: http://localhost:{settings.PORT}/docs")
    print(f"🌐 Frontend: http://localhost:{settings.PORT}/frontend/\n")
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)