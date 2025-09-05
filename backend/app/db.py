from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session
from sqlalchemy import String, Text, Enum, Boolean, Integer, BigInteger, JSON, TIMESTAMP, ForeignKey
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()

def build_mysql_url() -> str:
    url = os.getenv("MYSQL_URL")
    if url:
        return url
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "3306")
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASSWORD", "password")
    db = os.getenv("DB_NAME", "playableads_gamemaker")
    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{db}?charset=utf8mb4"

engine = create_engine(build_mysql_url(), pool_pre_ping=True)

class Base(DeclarativeBase):
    pass

class Templates(Base):
    __tablename__ = "templates"
    template_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    template_name: Mapped[str] = mapped_column(String(200))
    template_category: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text())
    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    template_files_path: Mapped[str] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class TemplateAssets(Base):
    __tablename__ = "template_assets"
    asset_def_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    template_id: Mapped[str] = mapped_column(String(50), ForeignKey("templates.template_id"))
    asset_key: Mapped[str] = mapped_column(String(100))
    asset_name: Mapped[str] = mapped_column(String(200))
    asset_type: Mapped[str] = mapped_column(Enum("image", "audio", "video", name="asset_type"))
    allowed_formats: Mapped[dict] = mapped_column(JSON)
    max_file_size_mb: Mapped[float]
    required_width: Mapped[int | None]
    required_height: Mapped[int | None]
    allow_resize: Mapped[bool | None]
    placeholder_path: Mapped[str | None] = mapped_column(String(500))
    placeholder_cos_url: Mapped[str | None] = mapped_column(String(500))
    is_required: Mapped[bool] = mapped_column(Boolean, default=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

class Projects(Base):
    __tablename__ = "projects"
    project_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    template_id: Mapped[str] = mapped_column(String(50))
    project_name: Mapped[str] = mapped_column(String(200))
    user_id: Mapped[str | None] = mapped_column(String(50))
    preview_url: Mapped[str | None] = mapped_column(String(500))
    export_zip_path: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[str | None] = mapped_column(Enum("draft", "preview_ready", "exported", name="project_status"))

class TemplateAnalytics(Base):
    __tablename__ = "template_analytics"
    analytics_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    template_id: Mapped[str] = mapped_column(String(50))
    preview_count: Mapped[int] = mapped_column(Integer, default=0)
    export_count: Mapped[int] = mapped_column(Integer, default=0)

class OperationLogs(Base):
    __tablename__ = "operation_logs"
    log_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    project_id: Mapped[str | None] = mapped_column(String(50))
    template_id: Mapped[str | None] = mapped_column(String(50))
    operation_type: Mapped[str] = mapped_column(Enum("preview", "export", "asset_upload", "asset_validation", "edit", name="operation_type"))
    operation_status: Mapped[str] = mapped_column(Enum("success", "failed", "processing", name="operation_status"))
    operation_details: Mapped[dict | None] = mapped_column(JSON)


def get_session() -> Session:
    return Session(engine)
