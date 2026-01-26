from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path
import os


class Settings(BaseSettings):
    APP_NAME: str = "Dr. Jii Doctor Assistant"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Always use root database, regardless of where the app is run from
    _project_root = Path(__file__).parent.parent
    _db_path = _project_root / "drjii.db"
    DATABASE_URL: str = f"sqlite:///{_db_path.absolute()}"
    
    REDIS_URL: str = "redis://localhost:6379/0"
    
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"
    
    SECRET_KEY: str = "temp-secret-key-for-testing"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    OPENAI_API_KEY: str = ""
    HUGGINGFACE_TOKEN: str = ""
    
    NER_MODEL_PATH: str = "./models/ner_model"
    INTENT_MODEL_PATH: str = "./models/intent_model"
    TRIAGE_MODEL_PATH: str = "./models/triage_model"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    FAISS_INDEX_PATH: str = "./data/faiss_index"
    
    MAX_FILE_SIZE: int = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS: list = [".pdf", ".jpg", ".jpeg", ".png", ".docx"]
    
    ABDM_BASE_URL: str = "https://healthidsbx.abdm.gov.in"
    ABDM_CLIENT_ID: str = ""
    ABDM_CLIENT_SECRET: str = ""
    
    HIPAA_COMPLIANT: bool = True
    LOG_PHI: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings():
    return Settings()