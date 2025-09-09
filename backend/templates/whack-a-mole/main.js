(() => {
  const CFG = (window && window.WAM_CONFIG) ? window.WAM_CONFIG : {};

  const GP = CFG.gameplay || {};
  const COLS = Number.isInteger(GP.columns) && GP.columns > 0 ? GP.columns : 3;
  const ROWS = Number.isInteger(GP.rows) && GP.rows > 0 ? GP.rows : 3;
  const TIME_LIMIT = Number.isInteger(GP.timeLimitSec) && GP.timeLimitSec > 0 ? GP.timeLimitSec : 15;
  const TARGET = Number.isInteger(GP.targetScore) && GP.targetScore > 0 ? GP.targetScore : 100;
  const HIT_SCORE = Number.isInteger(GP.hitScore) && GP.hitScore > 0 ? GP.hitScore : 10;

  const els = {
    board: document.getElementById('board'),
    timerText: document.getElementById('timerText'),
    scoreText: document.getElementById('scoreText'),
    pageBg: document.getElementById('pageBg'),
    hammer: document.getElementById('hammer'),
  };

  const state = {
    score: 0,
    remaining: TIME_LIMIT,
    timerId: null,
    finished: false,
    started: false,
    spawnLoopId: null,
    activeHoles: new Set(),
  };

  const sound = (() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext || function(){})();
    let unlocked = false;
    function unlock(){
      if (!ctx || unlocked) return;
      const b = ctx.createBuffer(1,1,22050); const s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); unlocked = true;
    }
    function beep(freq=900, durationMs=80, type='square', gain=0.04){
      if (!ctx) return; const t0 = ctx.currentTime; const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t0); g.gain.value = gain; g.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs/1000);
      o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0 + durationMs/1000);
    }
    return { unlock, beep };
  })();

  const gameAudio = (() => {
    let bgm=null, sfxHit=null, sfxFail=null, sfxSuccess=null, sfxSpawn=null, inited=false, started=false;
    function clamp(v,d){ const n=typeof v==='number'?v:d; return Math.max(0, Math.min(1, isFinite(n)?n:d)); }
    function init(){ if (inited) return; const A = CFG.audio||{}; try{
      if (A.bgm && A.bgmEnabled !== false){ bgm = new Audio(A.bgm); bgm.loop = true; bgm.volume = clamp(A.bgmVolume, .3); }
      if (A.sfxHit){ sfxHit = new Audio(A.sfxHit); sfxHit.volume = clamp(A.sfxVolume, 1); }
      if (A.sfxFail){ sfxFail = new Audio(A.sfxFail); sfxFail.volume = clamp(A.sfxVolume, 1); }
      if (A.sfxSuccess){ sfxSuccess = new Audio(A.sfxSuccess); sfxSuccess.volume = clamp(A.sfxVolume, 1); }
      if (A.sfxSpawn){ sfxSpawn = new Audio(A.sfxSpawn); sfxSpawn.volume = clamp(A.sfxVolume, 1); }
    } catch(_){}
    inited=true; }
    async function startBgm(){ init(); if (!bgm || started) return; try{ await bgm.play(); started=true; }catch(_){}}
    function play(el){ if (el) { try { el.currentTime = 0; el.play(); } catch(_){}} }
    return { init, startBgm, hit(){ play(sfxHit); }, fail(){ play(sfxFail); }, success(){ play(sfxSuccess); }, spawn(){ play(sfxSpawn); } };
  })();

  function setScore(n){ state.score = n; if (els.scoreText) els.scoreText.textContent = String(n) + '/' + String(TARGET); }
  function setTime(t){ state.remaining = t; if (els.timerText) els.timerText.textContent = String(t) + 's'; }

  function startTimer(){ stopTimer(); setTime(TIME_LIMIT); state.timerId = setInterval(() => {
    state.remaining -= 1; setTime(Math.max(0, state.remaining)); if (state.remaining <= 0){ stopTimer(); endGame(false); }
  }, 1000); }
  function stopTimer(){ if (state.timerId){ clearInterval(state.timerId); state.timerId = null; } }

  function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function randMs(range){ const [a,b] = Array.isArray(range)?range:[range,range]; return randInt(Math.min(a,b), Math.max(a,b)); }

  function buildBoard(){
    els.board.innerHTML = '';
    els.board.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    els.board.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;
    const total = COLS*ROWS;
    for (let i=0;i<total;i+=1){
      const hole = document.createElement('div');
      hole.className = 'hole';
      const mole = document.createElement('div');
      mole.className = 'mole';
      mole.style.backgroundImage = `url('${(CFG.image&&CFG.image.mole)||'assets/images/mole.svg'}')`;
      mole.addEventListener('click', () => onHit(mole));
      hole.appendChild(mole);
      els.board.appendChild(hole);
    }
    // keep hammer element at the end so it stays above holes
    if (els.hammer && !els.board.contains(els.hammer)) {
      els.board.appendChild(els.hammer);
    } else if (els.hammer) {
      els.board.appendChild(els.hammer);
    }
  }

  function clearSpawnLoop(){ if (state.spawnLoopId){ clearTimeout(state.spawnLoopId); state.spawnLoopId = null; } }

  function spawnLoop(){
    if (state.finished) return;
    spawnMole();
    const next = randMs(GP.spawnIntervalMs||[400,800]);
    clearSpawnLoop();
    state.spawnLoopId = setTimeout(spawnLoop, next);
  }

  function spawnMole(){
    const holes = Array.from(els.board.querySelectorAll('.hole'));
    if (!holes.length) return;
    const hole = holes[randInt(0, holes.length-1)];
    const m = hole.querySelector('.mole');
    if (!m || m.classList.contains('up')) return; // avoid overcrowding the same one
    // Ensure the mole width is based on the current hole size for perfect centering
    const rect = hole.getBoundingClientRect();
    const size = Math.round(rect.width * 0.7);
    m.style.width = size + 'px';
    m.style.height = size + 'px';
    m.classList.add('up'); state.activeHoles.add(m);
    gameAudio.spawn(); sound.beep(1100,70,'triangle',.03);
    const upFor = randMs(GP.moleUpMs||[600,1000]);
    setTimeout(() => hideMole(m), upFor);
  }

  function hideMole(m){ if (!m) return; if (!m.classList.contains('up')) return; m.classList.remove('up'); state.activeHoles.delete(m); }

  function onHit(m){ if (!m.classList.contains('up')) return; if (!state.started) startGame(); m.classList.remove('up'); m.classList.add('hit');
    setTimeout(() => m.classList.remove('hit'), 120);
    state.activeHoles.delete(m);
    // Impact effect at the mole center
    try {
      const r = m.getBoundingClientRect();
      spawnImpactAt(r.left + r.width / 2, r.top + r.height * 0.7);
      spawnFloatingScore(r.left + r.width / 2, r.top + r.height * 0.3, '+' + HIT_SCORE);
      els.board.classList.add('shake');
      setTimeout(() => els.board.classList.remove('shake'), 140);
    } catch(_){ }
    setScore(state.score + HIT_SCORE);
    sound.beep(700,80,'sine',.05); gameAudio.hit();
    if (state.score >= TARGET) { endGame(true); }
  }

  function endGame(win){ if (state.finished) return; state.finished = true; stopTimer(); clearSpawnLoop(); document.body.classList.add('no-interactions');
    if (win) { gameAudio.success(); } else { gameAudio.fail(); }
    showOverlay(win ? '恭喜达成目标！🎉 点击重来' : '时间到，挑战失败。点击重试');
  }

  function showOverlay(text){
    let ov = document.querySelector('.overlay');
    if (!ov){ ov = document.createElement('div'); ov.className = 'overlay show'; const dlg = document.createElement('div'); dlg.className = 'dialog'; dlg.textContent = text; ov.appendChild(dlg); ov.addEventListener('click', resetGame); document.body.appendChild(ov); }
    else { ov.classList.add('show'); ov.querySelector('.dialog').textContent = text; }
  }
  function hideOverlay(){ const ov = document.querySelector('.overlay'); if (ov) ov.classList.remove('show'); }

  function showStartPrompt(){}

  function startGame(){ if (state.started) return; state.started = true; hideOverlay(); setTime(TIME_LIMIT); startTimer(); spawnLoop(); }

  function applyBackground(){
    const bg = (CFG.image && CFG.image.background) ? CFG.image.background : null;
    if (bg && els.pageBg) els.pageBg.style.backgroundImage = `url('${bg}')`;
    const hammer = (CFG.image && CFG.image.hammer) ? CFG.image.hammer : null;
    if (hammer && els.hammer) els.hammer.src = hammer;
  }

  function bindAudioUnlock(){
    const onGesture = async (ev) => { moveHammerToEvent(ev, true); sound.unlock(); await gameAudio.startBgm(); if (!state.started) startGame(); document.removeEventListener('pointerdown', onGesture, { passive: true }); document.removeEventListener('click', onGesture, { passive: true }); };
    document.addEventListener('pointerdown', onGesture, { passive: true });
    document.addEventListener('click', onGesture, { passive: true });
  }

  function resetGame(){ hideOverlay(); document.body.classList.remove('no-interactions'); clearSpawnLoop(); state.finished=false; state.started=false; setScore(0); setTime(TIME_LIMIT); buildBoard(); bindAudioUnlock(); spawnLoop(); }

  function main(){ bindAudioUnlock(); applyBackground(); buildBoard(); setScore(0); setTime(TIME_LIMIT); spawnLoop(); }
  window.addEventListener('load', main);

  // Hammer control
  function moveHammerToEvent(ev, instant){
    if (!els.hammer) return;
    const rect = els.board.getBoundingClientRect();
    const x = Math.max(rect.left, Math.min(ev.clientX, rect.right));
    const y = Math.max(rect.top, Math.min(ev.clientY, rect.bottom));
    const cx = x - rect.left; const cy = y - rect.top;
    els.hammer.style.left = (cx / rect.width * 100) + '%';
    els.hammer.style.top = (cy / rect.height * 100) + '%';
    if (!instant) {
      els.hammer.classList.add('hit');
      setTimeout(() => els.hammer.classList.remove('hit'), 100);
    }
  }

  document.addEventListener('pointerdown', (ev) => {
    if (!els.board.contains(ev.target)) return;
    moveHammerToEvent(ev, false);
  }, { passive: true });

  function spawnImpact(ev){
    if (!els.board) return;
    const rect = els.board.getBoundingClientRect();
    const x = Math.max(rect.left, Math.min(ev.clientX, rect.right));
    const y = Math.max(rect.top, Math.min(ev.clientY, rect.bottom));
    spawnImpactAt(x, y);
  }

  function spawnImpactAt(x, y){
    if (!els.board) return;
    const rect = els.board.getBoundingClientRect();
    const dot = document.createElement('div');
    dot.className = 'impact';
    dot.style.left = ((x - rect.left) / rect.width * 100) + '%';
    dot.style.top = ((y - rect.top) / rect.height * 100) + '%';
    els.board.appendChild(dot);
    setTimeout(() => { if (dot.parentElement) dot.parentElement.removeChild(dot); }, 260);
  }

  function spawnFloatingScore(x, y, text){
    if (!els.board) return;
    const rect = els.board.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'floating-score';
    el.textContent = text;
    el.style.left = ((x - rect.left) / rect.width * 100) + '%';
    el.style.top = ((y - rect.top) / rect.height * 100) + '%';
    els.board.appendChild(el);
    setTimeout(() => { if (el.parentElement) el.parentElement.removeChild(el); }, 650);
  }
})();


