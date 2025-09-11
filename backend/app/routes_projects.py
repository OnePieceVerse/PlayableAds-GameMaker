from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from .db import get_session, Projects, Templates
from pathlib import Path
import shutil
from datetime import datetime

router = APIRouter(prefix="/projects", tags=["projects"])

TEMPLATES_ROOT = Path(__file__).resolve().parent.parent / "templates"
PROJECTS_ROOT = Path(__file__).resolve().parent.parent / "projects"
EXPORTS_ROOT = Path(__file__).resolve().parent.parent / "exports"
PROJECTS_ROOT.mkdir(parents=True, exist_ok=True)
EXPORTS_ROOT.mkdir(parents=True, exist_ok=True)

@router.get("")
async def list_projects():
    with get_session() as s:
        return {"projects": s.query(Projects).all()}

@router.get("/{project_id}")
async def get_project(project_id: str):
    with get_session() as s:
        p = s.get(Projects, project_id)
        if not p:
            raise HTTPException(404, "Project not found")
        return {"project": p}

@router.post("")
async def create_project(projectId: str = Form(...), templateId: int = Form(...), projectName: str = Form("项目")):
    with get_session() as s:
        tpl = s.get(Templates, templateId)
        if not tpl:
            raise HTTPException(404, "Template not found")
        if s.get(Projects, projectId) is None:
            s.add(Projects(project_id=projectId, template_id=templateId, project_name=projectName, status="draft"))
        # copy template dir
        src = TEMPLATES_ROOT / tpl.template_name
        dst = PROJECTS_ROOT / f"{tpl.template_id}-{projectId}"
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)
        s.commit()
        return {"ok": True}

@router.post("/{project_id}/export")
async def export_project(project_id: str):
    # compress project dir and move to PROJECTS_ROOT/exports
    with get_session() as s:
        p = s.get(Projects, project_id)
        if not p:
            raise HTTPException(404, "Project not found")
        if p.status != "preview_ready":
            raise HTTPException(400, "Project is not ready for export")

        dst_base = EXPORTS_ROOT / f"{project_id}"
        zip_path = shutil.make_archive(dst_base, "zip", PROJECTS_ROOT / f"{p.template_id}-{project_id}")

        p.export_zip_path = str(zip_path)
        p.export_generated_at = datetime.now()
        p.status = "exported"
        s.commit()
        return {"ok": True, "downloadUrl": f"/projects/{project_id}/download"}

@router.get("/{project_id}/download")
async def download_export(project_id: str):
    with get_session() as s:
        p = s.get(Projects, project_id)
        if not p or not p.export_zip_path:
            raise HTTPException(404, "Export not found")
        export_path = p.export_zip_path
    path = Path(export_path)
    if not path.exists():
        raise HTTPException(404, "File not found")
    return FileResponse(path=str(path), media_type="application/zip", filename=f"{project_id}.zip")

@router.post("/{project_id}/status/{status}")
async def update_project_status(project_id: str, status: str):
    # check status
    if status not in {"draft", "preview_ready", "exported"}:
        raise HTTPException(400, "Invalid status")

    with get_session() as s:
        p = s.get(Projects, project_id)
        if not p:
            raise HTTPException(404, "Project not found")

        p.status = status
        s.commit()
        return {"ok": True}

@router.get("/{project_id}/status")
async def get_project_status(project_id: str):
    with get_session() as s:
        p = s.get(Projects, project_id)
        if not p:
            raise HTTPException(404, "Project not found")
        return {"status": p.status}


@router.post("/{project_id}/assets")
async def upload_asset(project_id: str, file: UploadFile = File(...), category: str = Form("images"), filename: str = Form(None)):
    # print(f"upload_asset: {project_id}, {file}, {category}, {filename}")
    with get_session() as s:
        p = s.get(Projects, project_id)
        if not p:
            raise HTTPException(404, "Project not found")
        # if p.status != "draft":
        #     raise HTTPException(400, "Project is not in draft status")
        # Validate and normalize inputs
        if not filename:
            raise HTTPException(400, "filename is required")
        # Only keep the base name to prevent any path traversal
        safe_filename = Path(filename).name
        if not safe_filename:
            raise HTTPException(400, "invalid filename")

        normalized_category = (category or "images").strip().lower()
        if normalized_category in {"image", "audio", "video"}:
            normalized_category = normalized_category + "s"
        if normalized_category not in {"images", "audios", "videos"}:
            raise HTTPException(400, "invalid category")

        dst = PROJECTS_ROOT / f"{p.template_id}-{project_id}" / "assets" / normalized_category / safe_filename
        dst.parent.mkdir(parents=True, exist_ok=True)
        with dst.open("wb") as f:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                f.write(chunk)

        p.status = "preview_ready"
        s.commit()
        return {"ok": True, "path": str(dst.relative_to(PROJECTS_ROOT))}
