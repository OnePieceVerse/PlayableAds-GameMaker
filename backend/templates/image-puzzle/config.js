;(function(){
  // Edit these defaults to configure the game
  window.PUZZLE_CONFIG = {
    // Image assets
    image: {
      // Default puzzle image path (relative to index.html)
      puzzle: 'assets/images/sample.svg',
      // Background image path
      background: 'assets/images/background.webp'
    },

    // Audio configuration
    audio: {
      // Background music
      bgm: 'assets/audios/background.mp3',
      bgmVolume: 0.3,
      bgmEnabled: true,
      // Sound effects
      sfxSuccess: 'assets/audios/success.mp3',
      sfxFail: 'assets/audios/fail.mp3',
      // Placement effect when putting a piece into a board slot
      sfxPlace: 'assets/audios/place.mp3',
      sfxVolume: 1.0,
    },


    // Gameplay parameters
    gameplay: {
      // Grid size (N x N)
      grid: 3,
      // Time limit (seconds)
      timeLimitSec: 30,
      // Seconds to gradually hide the puzzle guide (0 disables)
      revealSec: 10
    }

  };
})();


