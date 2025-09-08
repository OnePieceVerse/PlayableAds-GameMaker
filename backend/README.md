# PlayableAds Backend (FastAPI + MySQL)

FastAPI 后端，提供模板列表/详情、模板统计、项目创建与素材上传等接口。模板静态文件位于 `backend/templates`，用户自定义内容在运行时生成到 `backend/projects`。

## 环境要求
- Python 3.11+
- MySQL 8.x
- uv（推荐包管理器）: https://github.com/astral-sh/uv
  - 也可使用 pip/venv 运行

## 目录结构（后端）
```
backend/
  app/
    __main__.py          # 启动入口 (uv script: serve)
    main.py              # FastAPI 应用、健康检查、CORS
    db.py                # SQLAlchemy ORM 定义与会话
    routes_templates.py  # 模板相关接口
    routes_projects.py   # 项目与素材上传接口
  templates/             # 模板静态资源根目录
    image-puzzle/        # 示例模板
      assets/
      index.html
      main.js
      styles.css
  requirements.txt
  pyproject.toml
```

运行时会创建目录：
- `backend/projects/{templateName}-{projectId}`：创建项目时从模板复制生成
- `backend/projects/uploads/{projectId}/{category}`：素材上传保存目录

## 环境变量配置
后端支持两种方式配置数据库连接：

1) 通过 `MYSQL_URL`（同时被健康检查与 ORM 使用，推荐）：
```
export MYSQL_URL="mysql+pymysql://root:password@127.0.0.1:3306/h5_game_saas?charset=utf8mb4"
```

2) 或者使用分散变量（仅 ORM 使用，`app/db.py` 会读取）：
```
export DB_HOST=127.0.0.1
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=password
export DB_NAME=playableads_gamemaker
```

也可在 `backend/` 目录下创建 `.env` 文件，内容同上。

## 安装与运行
使用 uv（推荐）：
```
cd backend
uv sync
uv run -m app
```
服务启动后访问: http://localhost:8000

若健康检查返回数据库错误，请先启动本地 MySQL 并设置环境变量，例如：
```
export MYSQL_URL="mysql+pymysql://root:password@127.0.0.1:3306/playableads_gamemaker?charset=utf8mb4"
```
或在 `backend/.env` 中配置同名变量。

使用 pip/venv：
```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 数据库初始化与模板数据
请根据 `app/db.py` 的 ORM 字段自行建表并准备数据（根目录 `schema.sql` 可作参考，但以 ORM 字段命名为准）：
- `templates`：`template_id`, `template_name`, `template_category`, `description`, `thumbnail_url`, `template_files_path`, `is_active`
- `template_assets`：`asset_def_id`, `template_id`, `asset_key`, `asset_name`, `asset_type`, `allowed_formats`, `max_file_size_mb`, `required_width`, `required_height`, `allow_resize`, `placeholder_path`, `placeholder_cos_url`, `is_required`, `display_order`
- `projects`：`project_id`, `template_id`, `project_name`, `user_id`, `preview_url`, `export_zip_path`, `status`
- `template_analytics`：`analytics_id`, `template_id`, `preview_count`, `export_count`
- `operation_logs`：`log_id`, `project_id`, `template_id`, `operation_type`, `operation_status`, `operation_details`

示例模板记录（确保 `template_files_path` 对应 `backend/templates` 下的目录，例如示例为 `image-puzzle`）：
```
INSERT INTO templates (template_id, template_name, template_category, description, thumbnail_url, template_files_path, is_active)
VALUES ('tpl_puzzle_001', 'puzzle_001', 'puzzle', '示例拼图模板', NULL, 'image-puzzle', 1);
```

## API
- GET `/health`
  - 数据库连通性检测

- GET `/templates`
  - 模板列表，包含 `analytics.previewCount/exportCount/editCount`

- GET `/templates/{template_id}`
  - 模板详情与素材清单

- GET `/templates/{template_id}/stats`
  - 返回该模板的统计数据

- POST `/templates/{template_id}/stats/{kind}`
  - `kind` ∈ {`preview`, `edit`, `export`}
  - 递增统计并记录到 `operation_logs`

- POST `/projects`
  - Content-Type: `multipart/form-data`
  - 字段：`projectId`(必填), `templateId`(必填), `projectName`(可选，默认 "项目")
  - 行为：将 `backend/templates/{template_files_path}` 复制到 `backend/projects/{templateName}-{projectId}`，并在 `projects` 表落库（若不存在）

- POST `/projects/{project_id}/assets`
  - Content-Type: `multipart/form-data`
  - 字段：`file`(必填), `category`(可选，默认 `images`), `filename`(可选；默认使用上传文件名)
  - 保存到：`backend/projects/uploads/{project_id}/{category}/{filename}`

跨域：已允许所有来源（开发阶段方便前端联调）。

## Smoke Tests
```
curl -s http://localhost:8000/health
curl -s http://localhost:8000/templates | jq .[0]
TID=tpl_puzzle_001
curl -s http://localhost:8000/templates/$TID | jq .templateName
curl -s http://localhost:8000/templates/$TID/stats | jq .
curl -s -X POST http://localhost:8000/templates/$TID/stats/preview
curl -s -X POST -F projectId=p_123 -F templateId=$TID -F projectName=test http://localhost:8000/projects
```
