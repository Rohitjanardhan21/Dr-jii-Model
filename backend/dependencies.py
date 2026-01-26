from functools import lru_cache
from config import get_settings

settings = get_settings()

@lru_cache()
def get_neo4j_driver():
    return None

@lru_cache()
def get_redis_client():
    return None

def get_neo4j_session():
    yield None