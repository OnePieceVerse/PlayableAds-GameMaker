;(function(){
  window.MP_CONFIG = {
    image: {
      // 九宫格三种候选图片（可相同风格角色的不同姿态）
      candidates: [
        'assets/images/cat_a.svg',
        'assets/images/cat_b.svg',
        'assets/images/cat_c.svg'
      ],
      background: 'assets/images/background.jpg'
    },
    audio: {
      bgm: 'assets/audios/background.mp3',
      bgmVolume: 0.5,
      bgmEnabled: true,
      sfxSuccess: 'assets/audios/success.mp3',
      sfxFail: 'assets/audios/fail.mp3',
      sfxPlace: 'assets/audios/place.mp3',
      sfxVolume: 1.0
    },
    gameplay: {
      timeLimitSec: 10,
      // 展示顺序：'row' 按行逐格翻开，'col' 按列逐格翻开
      revealMode: 'row',
      // 每张卡片展示的毫秒
      revealPerCardMs: 420,
      // 需要找到的目标图片数量（默认三张）
      targetCopies: 3
    }
  };
})();


