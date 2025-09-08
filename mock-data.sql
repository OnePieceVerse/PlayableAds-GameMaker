-- Template: image-puzzle, 真实数据
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'image-puzzle',
  'H5 拼图游戏 - Image Puzzle',
  'puzzle',
  '拖拽拼图完成挑战',
  '简洁的拼图玩法模板',
  'https://banner2.cleanpng.com/20240209/cka/transparent-jigsaw-icon-puzzle-pieces-colors-pile-jigsaw-colorful-puzzle-pieces-form-a-piled-1710882451834.webp',
  JSON_ARRAY('拼图','益智'),
  TRUE
);

SET @tpl_id = LAST_INSERT_ID();


INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '拼图图片', 'image', 'assets/images/sample.svg', JSON_ARRAY('svg'), 100, NULL, NULL, TRUE),
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 100, 640, 960, TRUE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 100, NULL, NULL, FALSE),
(@tpl_id, '成功音效', 'audio', 'assets/audios/success.mp3', JSON_ARRAY('mp3'), 50, NULL, NULL, FALSE),
(@tpl_id, '失败音效', 'audio', 'assets/audios/fail.mp3', JSON_ARRAY('mp3'), 50, NULL, NULL, FALSE),
(@tpl_id, '放置音效', 'audio', 'assets/audios/place.mp3', JSON_ARRAY('mp3'), 50, NULL, NULL, FALSE);





-- mock data
-- Template: memory-flip
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'memory-flip',
  '记忆翻牌 - Memory Flip',
  'puzzle',
  '翻牌记忆配对',
  '通过记忆卡片位置进行配对的轻量益智玩法',
  NULL,
  JSON_ARRAY('益智','翻牌'),
  TRUE
);
SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 300, 640, 960, TRUE),
(@tpl_id, '卡片图集', 'image', 'assets/images/cards.png', JSON_ARRAY('png','webp'), 300, NULL, NULL, TRUE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 500, NULL, NULL, FALSE),
(@tpl_id, '成功音效', 'audio', 'assets/audios/success.mp3', JSON_ARRAY('mp3'), 200, NULL, NULL, FALSE),
(@tpl_id, '失败音效', 'audio', 'assets/audios/fail.mp3', JSON_ARRAY('mp3'), 200, NULL, NULL, FALSE);

-- Template: whack-a-mole
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'whack-a-mole',
  '打地鼠 - Whack a Mole',
  'arcade',
  '点击地鼠得分',
  '在限定时间内快速点击出现的地鼠获取分数',
  NULL,
  JSON_ARRAY('反应','休闲'),
  TRUE
);
SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 300, 640, 960, TRUE),
(@tpl_id, '地鼠图集', 'image', 'assets/images/moles.png', JSON_ARRAY('png','webp'), 300, NULL, NULL, TRUE),
(@tpl_id, '锤子图标', 'image', 'assets/images/hammer.png', JSON_ARRAY('png','webp'), 200, NULL, NULL, TRUE),
(@tpl_id, '命中音效', 'audio', 'assets/audios/hit.mp3', JSON_ARRAY('mp3'), 200, NULL, NULL, FALSE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 500, NULL, NULL, FALSE);

-- Template: endless-runner
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'endless-runner',
  '奔跑者 - Endless Runner',
  'arcade',
  '躲避障碍奔跑',
  '角色自动前进，玩家通过跳跃/下蹲躲避障碍',
  NULL,
  JSON_ARRAY('动作','跑酷'),
  TRUE
);
SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 400, 640, 960, TRUE),
(@tpl_id, '角色图集', 'image', 'assets/images/runner.png', JSON_ARRAY('png','webp'), 400, NULL, NULL, TRUE),
(@tpl_id, '障碍物图集', 'image', 'assets/images/obstacles.png', JSON_ARRAY('png','webp'), 400, NULL, NULL, TRUE),
(@tpl_id, '跳跃音效', 'audio', 'assets/audios/jump.mp3', JSON_ARRAY('mp3'), 200, NULL, NULL, FALSE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 600, NULL, NULL, FALSE);

-- Template: quiz-basic
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'quiz-basic',
  '知识问答 - Quiz',
  'quiz',
  '答题选择正确答案',
  '多选题答题闯关，支持计时与得分',
  NULL,
  JSON_ARRAY('问答','休闲'),
  TRUE
);
SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 300, 640, 960, TRUE),
(@tpl_id, 'Logo 图片', 'image', 'assets/images/logo.png', JSON_ARRAY('png','webp','jpg'), 200, NULL, NULL, FALSE),
(@tpl_id, '正确音效', 'audio', 'assets/audios/correct.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '错误音效', 'audio', 'assets/audios/wrong.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 500, NULL, NULL, FALSE);

-- Template: match-3
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'match-3',
  '三消 - Match 3',
  'puzzle',
  '交换相邻方块进行三消',
  '经典三消玩法，支持连锁与得分倍增',
  NULL,
  JSON_ARRAY('消除','益智'),
  TRUE
);
SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 400, 640, 960, TRUE),
(@tpl_id, '宝石图集', 'image', 'assets/images/gems.png', JSON_ARRAY('png','webp'), 400, NULL, NULL, TRUE),
(@tpl_id, '交换音效', 'audio', 'assets/audios/swap.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '消除音效', 'audio', 'assets/audios/match.mp3', JSON_ARRAY('mp3'), 200, NULL, NULL, FALSE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 600, NULL, NULL, FALSE);

-- Template: flappy-bird
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'flappy-bird',
  '飞翔小鸟 - Flappy',
  'arcade',
  '点击飞行躲避障碍',
  '点击屏幕控制小鸟上升，穿越管道得分',
  NULL,
  JSON_ARRAY('街机','反应'),
  TRUE
);
SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 300, 640, 960, TRUE),
(@tpl_id, '小鸟精灵', 'image', 'assets/images/bird.png', JSON_ARRAY('png','webp'), 200, NULL, NULL, TRUE),
(@tpl_id, '管道图集', 'image', 'assets/images/pipes.png', JSON_ARRAY('png','webp'), 300, NULL, NULL, TRUE),
(@tpl_id, '拍打音效', 'audio', 'assets/audios/flap.mp3', JSON_ARRAY('mp3'), 100, NULL, NULL, FALSE),
(@tpl_id, '得分音效', 'audio', 'assets/audios/score.mp3', JSON_ARRAY('mp3'), 120, NULL, NULL, FALSE),
(@tpl_id, '失败音效', 'audio', 'assets/audios/fail.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 500, NULL, NULL, FALSE);

-- Template: slider-puzzle
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'slider-puzzle',
  '滑块拼图 - Slider Puzzle',
  'puzzle',
  '滑动方块拼出完整图案',
  '将打乱的方块滑动到正确位置完成拼图',
  NULL,
  JSON_ARRAY('拼图','滑块'),
  TRUE
);
SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 300, 640, 960, TRUE),
(@tpl_id, '拼图原图', 'image', 'assets/images/picture.jpg', JSON_ARRAY('jpg','png','webp'), 500, NULL, NULL, TRUE),
(@tpl_id, '放置音效', 'audio', 'assets/audios/place.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 400, NULL, NULL, FALSE);

-- Template: spot-the-difference
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'spot-the-difference',
  '找不同 - Spot the Difference',
  'puzzle',
  '在两张图中找出不同点',
  '观察两张近似图片中的差异并点击标记',
  NULL,
  JSON_ARRAY('观察','找茬'),
  TRUE
);
SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 300, 640, 960, TRUE),
(@tpl_id, '基准图片', 'image', 'assets/images/base.png', JSON_ARRAY('png','webp','jpg'), 800, NULL, NULL, TRUE),
(@tpl_id, '差异图片', 'image', 'assets/images/diff.png', JSON_ARRAY('png','webp','jpg'), 800, NULL, NULL, TRUE),
(@tpl_id, '正确音效', 'audio', 'assets/audios/success.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '错误音效', 'audio', 'assets/audios/fail.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 500, NULL, NULL, FALSE);

-- Template: color-match
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'color-match',
  '颜色匹配 - Color Match',
  'puzzle',
  '快速匹配目标颜色',
  '根据目标颜色选择最接近的颜色块得分',
  NULL,
  JSON_ARRAY('反应','颜色'),
  TRUE
);
SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 300, 640, 960, TRUE),
(@tpl_id, '颜色方块图集', 'image', 'assets/images/tiles.png', JSON_ARRAY('png','webp'), 300, NULL, NULL, TRUE),
(@tpl_id, '正确音效', 'audio', 'assets/audios/success.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '错误音效', 'audio', 'assets/audios/fail.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 400, NULL, NULL, FALSE);

-- Template: reaction-tap
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'reaction-tap',
  '反应点击 - Reaction Tap',
  'arcade',
  '快速点击提示按钮',
  '观察提示快速点击，考验反应速度与准确度',
  NULL,
  JSON_ARRAY('反应','休闲'),
  TRUE
);
SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 300, 640, 960, TRUE),
(@tpl_id, '按钮图片', 'image', 'assets/images/button.png', JSON_ARRAY('png','webp'), 200, NULL, NULL, TRUE),
(@tpl_id, '点击音效', 'audio', 'assets/audios/tap.mp3', JSON_ARRAY('mp3'), 120, NULL, NULL, FALSE),
(@tpl_id, '成功音效', 'audio', 'assets/audios/success.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 400, NULL, NULL, FALSE);

-- Template: tower-blocks
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'tower-blocks',
  '堆塔方块 - Tower Blocks',
  'arcade',
  '时机对齐堆叠方块',
  '抓准时机落下方块，保持对齐堆叠更高',
  NULL,
  JSON_ARRAY('节奏','堆叠'),
  TRUE
);
SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 300, 640, 960, TRUE),
(@tpl_id, '方块图集', 'image', 'assets/images/blocks.png', JSON_ARRAY('png','webp'), 400, NULL, NULL, TRUE),
(@tpl_id, '放置音效', 'audio', 'assets/audios/place.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '失败音效', 'audio', 'assets/audios/fail.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 500, NULL, NULL, FALSE);

-- Template: bubble-shooter
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'bubble-shooter',
  '泡泡龙 - Bubble Shooter',
  'puzzle',
  '发射泡泡进行匹配消除',
  '通过发射泡泡与同色相连实现消除',
  NULL,
  JSON_ARRAY('消除','射击'),
  TRUE
);
SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 400, 640, 960, TRUE),
(@tpl_id, '泡泡图集', 'image', 'assets/images/bubbles.png', JSON_ARRAY('png','webp'), 400, NULL, NULL, TRUE),
(@tpl_id, '发射音效', 'audio', 'assets/audios/shoot.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '消除音效', 'audio', 'assets/audios/match.mp3', JSON_ARRAY('mp3'), 200, NULL, NULL, FALSE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 600, NULL, NULL, FALSE);

-- Template: runner-2d-side
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'runner-2d-side',
  '横版跑酷 - 2D Runner',
  'arcade',
  '横版视角躲避障碍奔跑',
  '横版跑酷收集金币，躲避陷阱获取高分',
  NULL,
  JSON_ARRAY('跑酷','横版'),
  TRUE
);
SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'assets/images/background.webp', JSON_ARRAY('webp','jpg','png'), 400, 640, 960, TRUE),
(@tpl_id, '角色图集', 'image', 'assets/images/runner2d.png', JSON_ARRAY('png','webp'), 400, NULL, NULL, TRUE),
(@tpl_id, '金币图标', 'image', 'assets/images/coin.png', JSON_ARRAY('png','webp'), 150, NULL, NULL, FALSE),
(@tpl_id, '跳跃音效', 'audio', 'assets/audios/jump.mp3', JSON_ARRAY('mp3'), 150, NULL, NULL, FALSE),
(@tpl_id, '背景音乐', 'audio', 'assets/audios/background.mp3', JSON_ARRAY('mp3'), 600, NULL, NULL, FALSE);
