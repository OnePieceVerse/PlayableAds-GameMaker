# PlayableAds Backend (FastAPI + MySQL)

## Prerequisites
- Python 3.11+
- MySQL 8.x
- uv (package manager): https://github.com/astral-sh/uv

## Configure
Export MySQL URL or create a `.env` to export it before running:

```
export MYSQL_URL="mysql+pymysql://root:password@127.0.0.1:3306/h5_game_saas?charset=utf8mb4"
```

## Install & Run (uv)
```
cd backend
uv sync
uv run serve
```
Server runs on http://localhost:8000

## Endpoints
- GET /health
- GET /templates
- GET /templates/{id}
- POST /templates/{id}/stats/{preview|edit|export}
- POST /projects (multipart/form-data: projectId, templateId, projectName)
- POST /projects/{id}/assets (multipart/form-data: file, category, filename)

## Smoke tests
```
curl -s http://localhost:8000/health
curl -s http://localhost:8000/templates | jq .[0]
TID=tpl_puzzle_001
curl -s http://localhost:8000/templates/$TID | jq .templateName
curl -s -X POST http://localhost:8000/templates/$TID/stats/preview
curl -s -F projectId=p_123 -F templateId=$TID -F projectName=test http://localhost:8000/projects
```
