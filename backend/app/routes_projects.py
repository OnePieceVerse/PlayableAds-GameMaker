from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from .db import get_session, Projects, Templates
from pathlib import Path
import shutil

router = APIRouter(prefix="/projects", tags=["projects"])

TEMPLATES_ROOT = Path(__file__).resolve().parent.parent / "templates"
CUSTOM_ROOT = Path(__file__).resolve().parent.parent / "customizations"
CUSTOM_ROOT.mkdir(parents=True, exist_ok=True)

@router.post("")
async def create_project(projectId: str = Form(...), templateId: str = Form(...), projectName: str = Form("项目")):
    with get_session() as s:
        tpl = s.get(Templates, templateId)
        if not tpl:
            raise HTTPException(404, "Template not found")
        if s.get(Projects, projectId) is None:
            s.add(Projects(project_id=projectId, template_id=templateId, project_name=projectName, status="draft"))
        # copy template dir
        src = TEMPLATES_ROOT / tpl.template_files_path.strip("/")
        dst = CUSTOM_ROOT / f"{tpl.template_name}-{projectId}"
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
        s.commit()
        return {"ok": True}

@router.post("/{project_id}/assets")
async def upload_asset(project_id: str, file: UploadFile = File(...), category: str = Form("images"), filename: str = Form(None)):
    target_dir = CUSTOM_ROOT / "uploads" / project_id / category
    target_dir.mkdir(parents=True, exist_ok=True)
    name = filename or file.filename
    dest = target_dir / name
    with dest.open("wb") as f:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)
    return {"ok": True, "path": str(dest)}
