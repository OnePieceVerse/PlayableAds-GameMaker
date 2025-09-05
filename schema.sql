-- H5 游戏 SaaS 产品数据库结构
-- 基于 PRD 文档设计
-- 支持 MySQL 8.0+

-- 设置字符集和时区
SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- 创建数据库（可选）
-- CREATE DATABASE h5_game_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE h5_game_saas;

-- =============================================
-- 1. 模板表 (templates)
-- 存储系统内置的H5游戏模板信息
-- =============================================
CREATE TABLE templates (
    template_id VARCHAR(50) PRIMARY KEY COMMENT '模板唯一标识',
    template_name VARCHAR(200) NOT NULL COMMENT '模板名称',
    description TEXT COMMENT '模板描述',
    thumbnail_url VARCHAR(500) COMMENT '模板缩略图URL',
    template_files_path VARCHAR(500) NOT NULL COMMENT '模板文件存储路径',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',

    INDEX idx_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模板表';

-- =============================================
-- 2. 模板素材定义表 (template_assets)
-- 定义每个模板所需的素材规格和校验规则
-- =============================================
CREATE TABLE template_assets (
    asset_def_id VARCHAR(50) PRIMARY KEY COMMENT '素材定义唯一标识',
    template_id VARCHAR(50) NOT NULL COMMENT '关联模板ID',
    asset_key VARCHAR(100) NOT NULL COMMENT '素材在模板中的标识符',
    asset_name VARCHAR(200) NOT NULL COMMENT '素材显示名称',
    asset_type ENUM('image', 'audio', 'video') NOT NULL COMMENT '素材类型',
    allowed_formats JSON NOT NULL COMMENT '允许的文件格式，如["jpg", "png", "gif"]',
    max_file_size_mb DECIMAL(10,2) NOT NULL COMMENT '最大文件大小(MB)',
    required_width INT COMMENT '要求宽度(像素)',
    required_height INT COMMENT '要求高度(像素)',
    allow_resize BOOLEAN DEFAULT FALSE COMMENT '是否允许自动调整尺寸',
    placeholder_path VARCHAR(500) COMMENT '默认占位符本地文件路径',
    placeholder_cos_url VARCHAR(500) COMMENT '默认占位符腾讯云COS链接',
    is_required BOOLEAN DEFAULT TRUE COMMENT '是否必需',
    display_order INT DEFAULT 0 COMMENT '显示顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    FOREIGN KEY (template_id) REFERENCES templates(template_id) ON DELETE CASCADE,
    UNIQUE KEY uk_template_asset_key (template_id, asset_key),
    INDEX idx_template_id (template_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模板素材定义表';

-- =============================================
-- 3. 用户项目表 (projects)
-- 用户基于模板创建的项目
-- =============================================
CREATE TABLE projects (
    project_id VARCHAR(50) PRIMARY KEY COMMENT '项目唯一标识',
    template_id VARCHAR(50) NOT NULL COMMENT '使用的模板ID',
    project_name VARCHAR(200) NOT NULL COMMENT '项目名称',
    user_id VARCHAR(50) COMMENT '用户ID（预留字段）',
    preview_url VARCHAR(500) COMMENT '预览页面URL',
    preview_generated_at TIMESTAMP NULL COMMENT '预览生成时间',
    export_zip_path VARCHAR(500) COMMENT 'ZIP导出文件路径',
    export_generated_at TIMESTAMP NULL COMMENT '导出生成时间',
    status ENUM('draft', 'preview_ready', 'exported') DEFAULT 'draft' COMMENT '项目状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    FOREIGN KEY (template_id) REFERENCES templates(template_id),
    INDEX idx_template_id (template_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户项目表';

-- =============================================
-- 4. 用户素材表 (user_assets)
-- 用户上传的素材文件及校验信息
-- =============================================
CREATE TABLE user_assets (
    asset_id VARCHAR(50) PRIMARY KEY COMMENT '素材唯一标识',
    project_id VARCHAR(50) NOT NULL COMMENT '所属项目ID',
    asset_def_id VARCHAR(50) NOT NULL COMMENT '对应的素材定义ID',
    original_filename VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_path VARCHAR(500) COMMENT '文件本地存储路径（临时）',
    cos_url VARCHAR(500) NOT NULL COMMENT '腾讯云COS存储链接',
    cos_key VARCHAR(500) NOT NULL COMMENT '腾讯云COS对象键名',
    file_size_bytes BIGINT NOT NULL COMMENT '文件大小(字节)',
    file_format VARCHAR(20) NOT NULL COMMENT '文件格式',
    image_width INT COMMENT '图片宽度(像素)',
    image_height INT COMMENT '图片高度(像素)',
    validation_status ENUM('pending', 'valid', 'invalid') DEFAULT 'pending' COMMENT '校验状态',
    validation_message TEXT COMMENT '校验结果消息',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    validated_at TIMESTAMP NULL COMMENT '校验完成时间',
    cos_uploaded_at TIMESTAMP NULL COMMENT 'COS上传完成时间',

    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (asset_def_id) REFERENCES template_assets(asset_def_id),
    UNIQUE KEY uk_project_asset_def (project_id, asset_def_id) COMMENT '每个项目中每种素材只能有一个',
    INDEX idx_project_id (project_id),
    INDEX idx_validation_status (validation_status),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户素材表';

-- =============================================
-- 5. 模板统计表 (template_analytics)
-- 记录模板使用情况和统计数据
-- =============================================
CREATE TABLE template_analytics (
    analytics_id VARCHAR(50) PRIMARY KEY COMMENT '统计记录唯一标识',
    template_id VARCHAR(50) NOT NULL COMMENT '模板ID',
    preview_count INT DEFAULT 0 COMMENT '预览次数',
    export_count INT DEFAULT 0 COMMENT '导出次数',
    last_preview_at TIMESTAMP NULL COMMENT '最后预览时间',
    last_export_at TIMESTAMP NULL COMMENT '最后导出时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    FOREIGN KEY (template_id) REFERENCES templates(template_id) ON DELETE CASCADE,
    UNIQUE KEY uk_template_id (template_id),
    INDEX idx_preview_count (preview_count),
    INDEX idx_export_count (export_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模板统计表';

-- =============================================
-- 6. 操作日志表 (operation_logs)
-- 记录系统关键操作的详细日志
-- =============================================
CREATE TABLE operation_logs (
    log_id VARCHAR(50) PRIMARY KEY COMMENT '日志唯一标识',
    project_id VARCHAR(50) COMMENT '相关项目ID',
    template_id VARCHAR(50) COMMENT '相关模板ID',
    operation_type ENUM('preview', 'export', 'asset_upload', 'asset_validation') NOT NULL COMMENT '操作类型',
    operation_status ENUM('success', 'failed', 'processing') NOT NULL COMMENT '操作状态',
    operation_details JSON COMMENT '操作详细信息',
    error_message TEXT COMMENT '错误信息',
    processing_time_ms INT COMMENT '处理时间(毫秒)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    INDEX idx_project_id (project_id),
    INDEX idx_template_id (template_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_operation_status (operation_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- =============================================
-- 初始化数据
-- =============================================

-- 插入示例模板数据
INSERT INTO templates (template_id, template_name, description, thumbnail_url, template_files_path) VALUES
('tpl_puzzle_001', '拼图游戏模板', '经典拼图游戏，支持自定义背景图片', '/thumbnails/puzzle_001.jpg', '/templates/puzzle_001/'),
('tpl_memory_001', '记忆翻牌游戏', '记忆力训练游戏，可替换卡片图案', '/thumbnails/memory_001.jpg', '/templates/memory_001/'),
('tpl_runner_001', '跑酷游戏模板', '横版跑酷游戏，支持背景和角色替换', '/thumbnails/runner_001.jpg', '/templates/runner_001/');

-- 插入拼图游戏模板的素材定义
INSERT INTO template_assets (asset_def_id, template_id, asset_key, asset_name, asset_type, allowed_formats, max_file_size_mb, required_width, required_height, placeholder_cos_url, is_required, display_order) VALUES
('asset_puzzle_bg', 'tpl_puzzle_001', 'background_image', '背景图片', 'image', '["jpg", "png"]', 5.0, 800, 600, 'https://h5-game-templates-1234567890.cos.ap-guangzhou.myqcloud.com/templates/puzzle_001/placeholder_bg.jpg', true, 1),
('asset_puzzle_audio', 'tpl_puzzle_001', 'background_music', '背景音乐', 'audio', '["mp3", "wav"]', 10.0, NULL, NULL, 'https://h5-game-templates-1234567890.cos.ap-guangzhou.myqcloud.com/templates/puzzle_001/placeholder_music.mp3', false, 2);

-- 插入记忆游戏模板的素材定义
INSERT INTO template_assets (asset_def_id, template_id, asset_key, asset_name, asset_type, allowed_formats, max_file_size_mb, required_width, required_height, placeholder_cos_url, is_required, display_order) VALUES
('asset_memory_cards', 'tpl_memory_001', 'card_images', '卡片图案', 'image', '["jpg", "png"]', 2.0, 100, 100, 'https://h5-game-templates-1234567890.cos.ap-guangzhou.myqcloud.com/templates/memory_001/placeholder_cards.png', true, 1),
('asset_memory_bg', 'tpl_memory_001', 'game_background', '游戏背景', 'image', '["jpg", "png"]', 3.0, 800, 600, 'https://h5-game-templates-1234567890.cos.ap-guangzhou.myqcloud.com/templates/memory_001/placeholder_bg.jpg', false, 2);

-- 初始化模板统计数据
INSERT INTO template_analytics (analytics_id, template_id) VALUES
('analytics_puzzle_001', 'tpl_puzzle_001'),
('analytics_memory_001', 'tpl_memory_001'),
('analytics_runner_001', 'tpl_runner_001');

-- =============================================
-- 常用查询示例
-- =============================================

-- 查询所有激活的模板及其素材定义
/*
SELECT
    t.template_id,
    t.template_name,
    ta.asset_key,
    ta.asset_name,
    ta.asset_type,
    ta.is_required
FROM templates t
LEFT JOIN template_assets ta ON t.template_id = ta.template_id
WHERE t.is_active = true
ORDER BY t.template_name, ta.display_order;
*/

-- 查询项目的完成状态（是否所有必需素材都已上传且校验通过）
/*
SELECT
    p.project_id,
    p.project_name,
    COUNT(ta.asset_def_id) as required_assets_count,
    COUNT(ua.asset_id) as uploaded_assets_count,
    COUNT(CASE WHEN ua.validation_status = 'valid' THEN 1 END) as valid_assets_count
FROM projects p
JOIN template_assets ta ON p.template_id = ta.template_id AND ta.is_required = true
LEFT JOIN user_assets ua ON p.project_id = ua.project_id AND ta.asset_def_id = ua.asset_def_id
GROUP BY p.project_id, p.project_name;
*/

-- 查询模板使用统计排行
/*
SELECT
    t.template_name,
    COUNT(p.project_id) as project_count,
    ta.preview_count,
    ta.export_count
FROM templates t
LEFT JOIN projects p ON t.template_id = p.template_id
LEFT JOIN template_analytics ta ON t.template_id = ta.template_id
GROUP BY t.template_id, t.template_name, ta.preview_count, ta.export_count
ORDER BY project_count DESC;
*/
