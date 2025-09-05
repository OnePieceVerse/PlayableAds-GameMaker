from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
import os

from .routes_templates import router as templates_router
from .routes_projects import router as projects_router

MYSQL_URL = os.getenv("MYSQL_URL", "mysql+pymysql://root:password@127.0.0.1:3306/h5_game_saas?charset=utf8mb4")

app = FastAPI(title="PlayableAds GameMaker Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_engine: Engine | None = None

def get_engine() -> Engine:
    global _engine
    if _engine is None:
        _engine = create_engine(MYSQL_URL, pool_pre_ping=True)
    return _engine

@app.get("/health")
async def health():
    try:
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}

app.include_router(templates_router)
app.include_router(projects_router)
