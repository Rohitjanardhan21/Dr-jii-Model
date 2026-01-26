from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
from database import engine, Base
from config import get_settings
from api import doctor_routes, patient_routes, admin_routes
from api.auth_routes import router as auth_router

settings = get_settings()
logging.basicConfig(level=logging.INFO)

Base.metadata.create_all(bind=engine)

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
    return {
        "message": "Dr. Jii API is running",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Dr. Jii API"}

app.mount("/frontend", StaticFiles(directory="../frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    print(f"\n🚀 Starting Dr. Jii on http://localhost:{settings.PORT}")
    print(f"📚 API Docs: http://localhost:{settings.PORT}/docs")
    print(f"🌐 Frontend: http://localhost:{settings.PORT}/frontend/index.html\n")
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)