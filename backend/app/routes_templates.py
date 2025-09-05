from fastapi import APIRouter, HTTPException
from sqlalchemy import select, func
from .db import get_session, Templates, TemplateAssets, TemplateAnalytics, OperationLogs
from datetime import datetime

router = APIRouter(prefix="/templates", tags=["templates"])

def get_edit_count(s, template_id: str) -> int:
    return s.execute(
        select(func.count()).select_from(OperationLogs).where(
            OperationLogs.template_id == template_id,
            OperationLogs.operation_type == "edit",
        )
    ).scalar_one()

@router.get("")
async def list_templates():
    with get_session() as s:
        rows = s.execute(select(Templates)).scalars().all()
        stats_map = {a.template_id: a for a in s.execute(select(TemplateAnalytics)).scalars().all()}
        return [
            {
                "templateId": r.template_id,
                "templateName": r.template_name,
                "category": getattr(r, "template_category", None),
                "description": r.description,
                "thumbnailUrl": r.thumbnail_url,
                "analytics": {
                    "previewCount": stats_map.get(r.template_id).preview_count if stats_map.get(r.template_id) else 0,
                    "exportCount": stats_map.get(r.template_id).export_count if stats_map.get(r.template_id) else 0,
                    "editCount": get_edit_count(s, r.template_id),
                },
            }
            for r in rows
        ]

@router.get("/{template_id}")
async def get_template(template_id: str):
    with get_session() as s:
        tpl = s.get(Templates, template_id)
        if not tpl:
            raise HTTPException(404, "Template not found")
        assets = s.execute(
            select(TemplateAssets).where(TemplateAssets.template_id == template_id).order_by(TemplateAssets.display_order)
        ).scalars().all()
        return {
            "templateId": tpl.template_id,
            "templateName": tpl.template_name,
            "category": getattr(tpl, "template_category", None),
            "description": tpl.description,
            "thumbnailUrl": tpl.thumbnail_url,
            "assets": [
                {
                    "assetDefId": a.asset_def_id,
                    "assetKey": a.asset_key,
                    "assetName": a.asset_name,
                    "assetType": a.asset_type,
                    "allowedFormats": a.allowed_formats,
                    "maxFileSizeMb": a.max_file_size_mb,
                    "requiredWidth": a.required_width,
                    "requiredHeight": a.required_height,
                    "allowResize": a.allow_resize,
                    "placeholderUrl": a.placeholder_path or a.placeholder_cos_url,
                    "isRequired": a.is_required,
                    "displayOrder": a.display_order,
                }
                for a in assets
            ],
        }

@router.get("/{template_id}/stats")
async def get_stats(template_id: str):
    with get_session() as s:
        sa = s.execute(select(TemplateAnalytics).where(TemplateAnalytics.template_id == template_id)).scalar_one_or_none()
        return {
            "previewCount": sa.preview_count if sa else 0,
            "exportCount": sa.export_count if sa else 0,
            "editCount": get_edit_count(s, template_id),
        }

@router.post("/{template_id}/stats/{kind}")
async def inc_stats(template_id: str, kind: str):
    if kind not in {"preview", "edit", "export"}:
        raise HTTPException(400, "invalid kind")
    with get_session() as s:
        sa = s.execute(select(TemplateAnalytics).where(TemplateAnalytics.template_id == template_id)).scalar_one_or_none()
        if not sa:
            sa = TemplateAnalytics(analytics_id=f"an_{template_id}", template_id=template_id, preview_count=0, export_count=0)
            s.add(sa)
        if kind == "preview":
            sa.preview_count += 1
        elif kind == "export":
            sa.export_count += 1
        # log operation
        s.add(OperationLogs(
            log_id=f"log_{template_id}_{kind}_{datetime.utcnow().timestamp()}",
            project_id=None,
            template_id=template_id,
            operation_type=kind if kind in ("preview", "export") else "edit",
            operation_status="success",
            operation_details={}
        ))
        s.commit()
        return {"ok": True}
