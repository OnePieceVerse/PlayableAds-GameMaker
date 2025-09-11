from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
import os
from pathlib import Path

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

# Static mounts for templates and projects
BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = BASE_DIR / "templates"
PROJECTS_DIR = BASE_DIR / "projects"
TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)
PROJECTS_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/templates-static", StaticFiles(directory=str(TEMPLATES_DIR)), name="templates-static")
app.mount("/projects-static", StaticFiles(directory=str(PROJECTS_DIR)), name="projects-static")

# Prevent aggressive caching when previewing project assets so that
# recently uploaded replacements (e.g., audio) take effect immediately.
@app.middleware("http")
async def no_cache_for_projects_static(request, call_next):
    response = await call_next(request)
    try:
        path = request.url.path
        if path.startswith("/projects-static/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
    except Exception:
        # best-effort; don't block response on header mutation errors
        pass
    return response
