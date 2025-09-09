;(function(){
  window.WAM_CONFIG = {
    image: {
      background: 'assets/images/background.jpg',
      mole: 'assets/images/mole.svg',
      hammer: 'assets/images/hammer.png'
    },
    audio: {
      bgm: 'assets/audios/background.mp3',
      bgmVolume: 0.25,
      bgmEnabled: true,
      sfxHit: 'assets/audios/hit.mp3',
      sfxSuccess: 'assets/audios/success.mp3',
      sfxFail: 'assets/audios/fail.mp3',
      sfxSpawn: 'assets/audios/spawn.mp3',
      sfxVolume: 1.0
    },
    gameplay: {
      columns: 3,
      rows: 3,
      timeLimitSec: 15,
      targetScore: 100,
      hitScore: 10,
      moleUpMs: [800, 1000],
      spawnIntervalMs: [700, 1000]
    }
  };
})();


