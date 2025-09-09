-- Template: image-puzzle
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
  allowed_formats, max_file_size_kb, required_width, required_height, max_duration_sec, is_required
) VALUES
(@tpl_id, '拼图图片', 'image', 'sample.svg', JSON_ARRAY('svg'), 100, NULL, NULL, TRUE),
(@tpl_id, '背景图片', 'image', 'background.webp', JSON_ARRAY('webp','jpg','png'), 100, 640, 960, NULL, TRUE),
(@tpl_id, '背景音乐', 'audio', 'background.mp3', JSON_ARRAY('mp3'), 100, NULL, NULL, 20, FALSE),
(@tpl_id, '成功音效', 'audio', 'success.mp3', JSON_ARRAY('mp3'), 50, NULL, NULL, 1, FALSE),
(@tpl_id, '失败音效', 'audio', 'fail.mp3', JSON_ARRAY('mp3'), 50, NULL, NULL, 1, FALSE),
(@tpl_id, '放置音效', 'audio', 'place.mp3', JSON_ARRAY('mp3'), 50, NULL, NULL, 1, FALSE);




-- Template: whack-a-mole
INSERT INTO templates (
  template_name, template_title, template_category, template_gameplay,
  template_desc, thumbnail_url, template_tags, is_active
) VALUES (
  'whack-a-mole',
  'H5 打地鼠 - Whack-a-Mole',
  'arcade',
  '点击冒出的地鼠得分',
  '轻量有趣的打地鼠玩法模板',
  'https://banner2.cleanpng.com/20180613/bjh/aa70ey3kg.webp',
  JSON_ARRAY('打地鼠','休闲','反应'),
  TRUE
);

SET @tpl_id = LAST_INSERT_ID();

INSERT INTO template_assets (
  template_id, asset_name, asset_type, asset_file_name,
  allowed_formats, max_file_size_kb, required_width, required_height, max_duration_sec, is_required
) VALUES
(@tpl_id, '背景图片', 'image', 'background.jpg', JSON_ARRAY('jpg','png','webp'), 100, NULL, NULL, NULL, TRUE),
(@tpl_id, '地鼠图片', 'image', 'mole.svg', JSON_ARRAY('svg'), 100, NULL, NULL, NULL, TRUE),
(@tpl_id, '锤子图片', 'image', 'hammer.png', JSON_ARRAY('png'), 100, NULL, NULL, NULL, TRUE),
(@tpl_id, '背景音乐', 'audio', 'background.mp3', JSON_ARRAY('mp3'), 100, NULL, NULL, 20, FALSE),
(@tpl_id, '击中音效', 'audio', 'hit.mp3', JSON_ARRAY('mp3'), 50, NULL, NULL, 1, FALSE),
(@tpl_id, '成功音效', 'audio', 'success.mp3', JSON_ARRAY('mp3'), 50, NULL, NULL, 1, FALSE),
(@tpl_id, '失败音效', 'audio', 'fail.mp3', JSON_ARRAY('mp3'), 50, NULL, NULL, 1, FALSE),
(@tpl_id, '出现音效', 'audio', 'spawn.mp3', JSON_ARRAY('mp3'), 50, NULL, NULL, 1, FALSE);

