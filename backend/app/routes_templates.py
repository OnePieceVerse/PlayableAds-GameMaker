from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from .db import get_session, Templates, TemplateAssets, TemplateAnalytics

router = APIRouter(prefix="/templates", tags=["templates"])

def get_edit_count(s, template_id: int) -> int:
    row = s.execute(
        select(TemplateAnalytics).where(TemplateAnalytics.template_id == template_id)
    ).scalar_one_or_none()
    return row.edit_count if row else 0

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
                "description": r.template_desc,
                "gameplay": r.template_gameplay,
                "tags": r.template_tags,
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
async def get_template(template_id: int):
    with get_session() as s:
        tpl = s.get(Templates, template_id)
        if not tpl:
            raise HTTPException(404, "Template not found")
        assets = s.execute(
            select(TemplateAssets).where(TemplateAssets.template_id == template_id)
        ).scalars().all()
        return {
            "templateId": tpl.template_id,
            "templateName": tpl.template_name,
            "templateTitle": tpl.template_title,
            "category": getattr(tpl, "template_category", None),
            "description": tpl.template_desc,
            "gameplay": tpl.template_gameplay,
            "tags": tpl.template_tags,
            "thumbnailUrl": tpl.thumbnail_url,
            "assets": [
                {
                    "assetId": a.asset_id,
                    "assetName": a.asset_name,
                    "assetType": a.asset_type,
                    "assetFileName": a.asset_file_name,
                    "allowedFormats": a.allowed_formats,
                    "maxFileSizeKb": a.max_file_size_kb,
                    "requiredWidth": a.required_width,
                    "requiredHeight": a.required_height,
                    "isRequired": a.is_required,
                }
                for a in assets
            ],
        }

@router.get("/{template_id}/stats")
async def get_stats(template_id: int):
    with get_session() as s:
        sa = s.execute(select(TemplateAnalytics).where(TemplateAnalytics.template_id == template_id)).scalar_one_or_none()
        return {
            "previewCount": sa.preview_count if sa else 0,
            "exportCount": sa.export_count if sa else 0,
            "editCount": get_edit_count(s, template_id),
        }

@router.post("/{template_id}/stats/{kind}")
async def inc_stats(template_id: int, kind: str):
    if kind not in {"preview", "edit", "export"}:
        raise HTTPException(400, "invalid kind")
    with get_session() as s:
        sa = s.execute(
            select(TemplateAnalytics).where(TemplateAnalytics.template_id == template_id)
        ).scalar_one_or_none()
        if sa is None:
            sa = TemplateAnalytics(template_id=template_id, edit_count=0, preview_count=0, export_count=0)
            s.add(sa)

        if kind == "edit":
            sa.edit_count += 1
        elif kind == "preview":
            sa.preview_count += 1
        elif kind == "export":
            sa.export_count += 1
        s.commit()
        return {"ok": True}
