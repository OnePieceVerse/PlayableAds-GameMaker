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


## API
- GET `/health`
  - 数据库连通性检测

- 模板（Templates）
  - GET `/templates`
    - 模板列表，包含 `analytics.previewCount/exportCount/editCount`
  - GET `/templates/{template_id}`
    - 模板详情与素材清单
  - GET `/templates/{template_id}/stats`
    - 返回该模板的统计数据
  - POST `/templates/{template_id}/stats/{kind}`
    - `kind` ∈ {`preview`, `edit`, `export`}
    - 递增统计计数

- 项目（Projects）
  - GET `/projects`
    - 项目列表
  - GET `/projects/{project_id}`
    - 项目详情
  - POST `/projects`
    - Content-Type: `multipart/form-data`
    - 字段：`projectId`(必填, string), `templateId`(必填, int), `projectName`(可选，默认 "项目")
    - 行为：将 `backend/templates/{template_name}` 复制到 `backend/projects/{templateId}-{projectId}`，并在 `projects` 表创建（若不存在）
  - GET `/projects/{project_id}/status`
    - 查询项目状态，`status` ∈ {`draft`, `preview_ready`, `exported`}
  - POST `/projects/{project_id}/status/{status}`
    - 更新项目状态；`status` 必须为 {`draft`, `preview_ready`, `exported`} 之一
  - POST `/projects/{project_id}/assets`
    - Content-Type: `multipart/form-data`
    - 字段：`file`(必填), `category`(可选，默认 `images`), `filename`(必填；服务器按该文件名保存)
    - 保存到：`backend/projects/{templateId}-{projectId}/uploads/{category}/{filename}`；上传成功后项目状态置为 `preview_ready`
  - POST `/projects/{project_id}/export`
    - 生成导出 ZIP（要求项目状态为 `preview_ready`），并返回 `downloadUrl`
  - GET `/projects/{project_id}/download`
    - 下载导出生成的 ZIP 文件

跨域：已允许所有来源（开发阶段方便前端联调）。

## Smoke Tests
```
# 健康检查
curl -s http://localhost:8000/health

# 模板列表与选择一个模板ID（整数）
TID=$(curl -s http://localhost:8000/templates | jq '.[0].templateId')
echo "TID=${TID}"

# 模板详情与统计
curl -s http://localhost:8000/templates/$TID | jq .templateName
curl -s http://localhost:8000/templates/$TID/stats | jq .
curl -s -X POST http://localhost:8000/templates/$TID/stats/preview

# 创建项目
PID=p_123
curl -s -X POST -F projectId=$PID -F templateId=$TID -F projectName=test http://localhost:8000/projects

# 查看项目状态（应为 draft）
curl -s http://localhost:8000/projects/$PID/status | jq .

# 上传一个素材（示例使用仓库中的示例图片）后，项目状态会变为 preview_ready
curl -s -X POST \
  -F file=@backend/templates/image-puzzle/assets/images/background.webp \
  -F category=images \
  -F filename=background.webp \
  http://localhost:8000/projects/$PID/assets

# 确认项目状态为 preview_ready
curl -s http://localhost:8000/projects/$PID/status | jq .

# 生成导出 ZIP，并获取下载地址
curl -s -X POST http://localhost:8000/projects/$PID/export | jq .

# 下载导出 ZIP（可选）
curl -s -L -o backend/exports/${PID}.zip http://localhost:8000/projects/$PID/download
```
