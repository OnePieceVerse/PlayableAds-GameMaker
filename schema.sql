-- H5 游戏 SaaS 产品数据库结构
-- 基于 PRD 文档设计
-- 支持 MySQL 8.0+

-- 设置字符集和时区
SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- 创建数据库（可选）
CREATE DATABASE playableads_gamemaker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE playableads_gamemaker;

-- =============================================
-- 1. 模板表 (templates)
-- 存储系统内置的H5游戏模板基础信息
-- =============================================
CREATE TABLE templates (
    template_id INT NOT NULL AUTO_INCREMENT COMMENT '模板唯一标识',
    template_name VARCHAR(200) NOT NULL COMMENT '模板名称, 与模板所在文件夹名称一致',
    template_title VARCHAR(200) NOT NULL COMMENT '模板标题',
    template_category VARCHAR(200) NOT NULL COMMENT '模板分类',
    template_gameplay VARCHAR(200) NOT NULL COMMENT '模板玩法介绍',
    template_desc TEXT COMMENT '模板描述',
    thumbnail_url VARCHAR(500) COMMENT '模板缩略图URL',
    template_tags JSON NOT NULL COMMENT '模板标签, 如["益智", "休闲"]',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    PRIMARY KEY (template_id),
    INDEX idx_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模板表';

-- =============================================
-- 2. 模板素材清单表 (template_assets)
-- 定义每个模板所需的素材清单和要求
-- =============================================
CREATE TABLE template_assets (
    asset_id INT NOT NULL AUTO_INCREMENT COMMENT '素材唯一标识',
    template_id INT NOT NULL COMMENT '关联模板ID',
    asset_name VARCHAR(200) NOT NULL COMMENT '素材显示名称',
    asset_type ENUM('image', 'audio', 'video', 'gif') NOT NULL COMMENT '素材类型',
    asset_file_name VARCHAR(200) NOT NULL COMMENT '素材文件名',
    allowed_formats JSON NOT NULL COMMENT '允许的文件格式，如["jpg", "png", "mp3", "wav", "mp4", "gif"]',
    max_file_size_kb DECIMAL(10,2) NOT NULL COMMENT '最大文件大小(KB)',
    required_width INT COMMENT '要求宽度(像素)',
    required_height INT COMMENT '要求高度(像素)',
    max_duration_sec INT COMMENT '音频时最大时长(秒)',
    is_required BOOLEAN DEFAULT TRUE COMMENT '是否必需',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    PRIMARY KEY (asset_id),
    UNIQUE KEY uk_template_asset_file_name (template_id, asset_file_name),
    INDEX idx_template_id (template_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模板素材定义表';

-- =============================================
-- 3. 用户项目表 (projects)
-- 用户基于模板创建的项目
-- =============================================
CREATE TABLE projects (
    project_id VARCHAR(50) NOT NULL COMMENT '项目唯一标识',
    template_id VARCHAR(50) NOT NULL COMMENT '使用的模板ID',
    project_name VARCHAR(200) NOT NULL COMMENT '项目名称',
    user_id VARCHAR(50) DEFAULT '' COMMENT '用户ID（预留字段）',
    export_zip_path VARCHAR(500) COMMENT 'ZIP导出文件路径',
    export_generated_at TIMESTAMP NULL COMMENT '导出生成时间',
    status ENUM('draft', 'preview_ready', 'exported') DEFAULT 'draft' COMMENT '项目状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    PRIMARY KEY (project_id),
    INDEX idx_template_id (template_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户项目表';


-- =============================================
-- 5. 模板统计表 (template_analytics)
-- 记录模板使用情况和统计数据
-- =============================================
CREATE TABLE template_analytics (
    template_id INT NOT NULL COMMENT '模板ID',
    preview_count INT DEFAULT 0 COMMENT '预览次数',
    edit_count INT DEFAULT 0 COMMENT '编辑定制次数',
    export_count INT DEFAULT 0 COMMENT '导出次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    PRIMARY KEY (template_id),
    INDEX idx_preview_count (preview_count),
    INDEX idx_edit_count (edit_count),
    INDEX idx_export_count (export_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模板统计表';
