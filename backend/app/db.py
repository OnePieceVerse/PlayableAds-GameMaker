from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session
from sqlalchemy import String, Text, Enum, Boolean, Integer, BigInteger, JSON, TIMESTAMP, ForeignKey
from sqlalchemy import create_engine
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def build_mysql_url() -> str:
    url = os.getenv("MYSQL_URL")
    if not url:
        raise ValueError("MYSQL_URL is not set")
    return url

engine = create_engine(build_mysql_url(), pool_pre_ping=True)

class Base(DeclarativeBase):
    pass

class Templates(Base):
    __tablename__ = "templates"
    template_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    template_name: Mapped[str] = mapped_column(String(200))
    template_title: Mapped[str] = mapped_column(String(200))
    template_category: Mapped[str] = mapped_column(String(200))
    template_desc: Mapped[str | None] = mapped_column(Text())
    template_gameplay: Mapped[str | None] = mapped_column(String(200))
    template_tags: Mapped[list[str]] = mapped_column(JSON)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class TemplateAssets(Base):
    __tablename__ = "template_assets"
    asset_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    template_id: Mapped[int] = mapped_column(Integer, ForeignKey("templates.template_id"))
    asset_name: Mapped[str] = mapped_column(String(200))
    asset_type: Mapped[str] = mapped_column(Enum("image", "audio", "video", name="asset_type"))
    asset_file_name: Mapped[str] = mapped_column(String(200))
    allowed_formats: Mapped[dict] = mapped_column(JSON)
    max_file_size_kb: Mapped[float]
    required_width: Mapped[int | None]
    required_height: Mapped[int | None]
    is_required: Mapped[bool] = mapped_column(Boolean, default=True)

class Projects(Base):
    __tablename__ = "projects"
    project_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    template_id: Mapped[str] = mapped_column(String(50))
    project_name: Mapped[str] = mapped_column(String(200))
    user_id: Mapped[str | None] = mapped_column(String(50))
    export_zip_path: Mapped[str | None] = mapped_column(String(500))
    export_generated_at: Mapped[datetime | None] = mapped_column(TIMESTAMP)
    status: Mapped[str | None] = mapped_column(Enum("draft", "preview_ready", "exported", name="project_status"))

class TemplateAnalytics(Base):
    __tablename__ = "template_analytics"
    template_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    edit_count: Mapped[int] = mapped_column(Integer, default=0)
    preview_count: Mapped[int] = mapped_column(Integer, default=0)
    export_count: Mapped[int] = mapped_column(Integer, default=0)


def get_session() -> Session:
    return Session(engine)
