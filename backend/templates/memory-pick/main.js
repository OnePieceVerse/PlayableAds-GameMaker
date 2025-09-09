(() => {
  const CFG = (window && window.MP_CONFIG) ? window.MP_CONFIG : {};
  const GP = CFG.gameplay || {};
  const TIME_LIMIT = Number.isInteger(GP.timeLimitSec) && GP.timeLimitSec > 0 ? GP.timeLimitSec : 10;
  const REVEAL_MODE = GP.revealMode === 'col' ? 'col' : 'row';
  const REVEAL_MS = Number.isFinite(GP.revealPerCardMs) ? Math.max(120, GP.revealPerCardMs) : 420;
  const TARGET_COPIES = Number.isInteger(GP.targetCopies) && GP.targetCopies > 0 ? GP.targetCopies : 3;

  const els = {
    board: document.getElementById('board'),
    timerText: document.getElementById('timerText'),
    foundText: document.getElementById('foundText'),
    targetImg: document.getElementById('targetImg'),
    pageBg: document.getElementById('pageBg')
  };

  const state = {
    timerId: null,
    remaining: TIME_LIMIT,
    finished: false,
    started: false,
    found: 0,
    grid: 3,
    targetIdx: 0,
    cells: [], // {el, type, flipped, locked}
    canPick: false
  };

  const sound = (() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext || function(){})();
    let unlocked = false;
    function unlock(){ if (!ctx || unlocked) return; const b = ctx.createBuffer(1,1,22050); const s = ctx.createBufferSource(); s.buffer=b; s.connect(ctx.destination); s.start(0); unlocked = true; }
    function beep(freq=900, durationMs=90, type='triangle', gain=0.04){ if (!ctx) return; const t0=ctx.currentTime; const o=ctx.createOscillator(); const g=ctx.createGain(); o.type=type; o.frequency.setValueAtTime(freq,t0); g.gain.value=gain; g.gain.exponentialRampToValueAtTime(0.0001, t0+durationMs/1000); o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0+durationMs/1000); }
    return { unlock, beep };
  })();

  const gameAudio = (() => {
    let bgm=null, sfxSuccess=null, sfxFail=null, sfxPlace=null, inited=false, started=false;
    function clamp(v,d){ const n=typeof v==='number'?v:d; return Math.max(0, Math.min(1, isFinite(n)?n:d)); }
    function init(){ if (inited) return; const A = CFG.audio||{}; try{
      if (A.bgm && A.bgmEnabled !== false){ bgm = new Audio(A.bgm); bgm.loop = true; bgm.volume = clamp(A.bgmVolume, .3); }
      if (A.sfxSuccess){ sfxSuccess = new Audio(A.sfxSuccess); sfxSuccess.volume = clamp(A.sfxVolume, 1); }
      if (A.sfxFail){ sfxFail = new Audio(A.sfxFail); sfxFail.volume = clamp(A.sfxVolume, 1); }
      if (A.sfxPlace){ sfxPlace = new Audio(A.sfxPlace); sfxPlace.volume = clamp(A.sfxVolume, 1); }
    } catch(_){}
    inited=true; }
    async function startBgm(){
      init();
      if (!bgm || started) return false;
      try {
        await bgm.play();
        started = true;
        return true;
      } catch (err) {
        try { console.warn('[memory-pick] BGM play blocked:', err && err.message ? err.message : err); } catch(_) {}
        return false;
      }
    }
    function play(el){ if (el) { try { el.currentTime = 0; el.play(); } catch(_){} } }
    return { init, startBgm, get started(){ return started; }, success(){ play(sfxSuccess); }, fail(){ play(sfxFail); }, place(){ play(sfxPlace); } };
  })();

  function setTime(t){ state.remaining = t; if (els.timerText) els.timerText.textContent = String(t) + 's'; }
  function setFound(n){ state.found = n; if (els.foundText) els.foundText.textContent = String(n) + '/' + String(TARGET_COPIES); }

  function startTimer(){ stopTimer(); setTime(TIME_LIMIT); state.timerId = setInterval(() => { state.remaining -= 1; setTime(Math.max(state.remaining,0)); if (state.remaining <= 0){ stopTimer(); endGame(false); } }, 1000); }
  function stopTimer(){ if (state.timerId){ clearInterval(state.timerId); state.timerId = null; } }

  function buildBoard(){
    els.board.innerHTML = '';
    els.board.style.gridTemplateColumns = 'repeat(3, 1fr)';
    els.board.style.gridTemplateRows = 'repeat(3, 1fr)';
    state.cells = [];

    const images = Array.isArray(CFG.image && CFG.image.candidates) ? CFG.image.candidates : [];
    const pool = images.length ? images : ['../whack-a-mole/assets/images/mole.svg'];

    // choose target index within pool
    state.targetIdx = Math.floor(Math.random() * pool.length);
    if (els.targetImg) {
      els.targetImg.style.backgroundImage = `url('${pool[state.targetIdx]}')`;
    }

    // Prepare 9 items: exactly TARGET_COPIES of target, the rest distributed from other candidates
    const items = [];
    for (let i=0;i<TARGET_COPIES;i+=1) items.push(state.targetIdx);
    const others = [];
    for (let i=0;i<pool.length;i+=1){ if (i!==state.targetIdx) others.push(i); }
    while (items.length < 9) { items.push(others[(items.length + Math.floor(Math.random()*others.length)) % others.length]); }
    // shuffle
    for (let i=items.length-1;i>0;i-=1){ const j=Math.floor(Math.random()*(i+1)); [items[i],items[j]]=[items[j],items[i]]; }

    for (let i=0;i<9;i+=1){
      const cell = document.createElement('div');
      cell.className = 'cell';
      const card = document.createElement('div');
      card.className = 'card';
      const front = document.createElement('div'); front.className = 'card-inner front';
      const back = document.createElement('div'); back.className = 'card-inner back'; back.style.backgroundImage = `url('${pool[items[i]]}')`;
      card.appendChild(front); card.appendChild(back); cell.appendChild(card); els.board.appendChild(cell);
      state.cells.push({ el: card, type: items[i], flipped: false, locked: false });
    }
  }

  async function revealSequence(){
    state.canPick = false;
    const order = [];
    if (REVEAL_MODE === 'col'){
      for (let c=0;c<3;c+=1){ for (let r=0;r<3;r+=1){ order.push(r*3+c); } }
    } else {
      for (let r=0;r<3;r+=1){ for (let c=0;c<3;c+=1){ order.push(r*3+c); } }
    }
    for (const idx of order){
      flipTo(idx, true);
      await waitMs(REVEAL_MS);
      flipTo(idx, false);
      await waitMs(80);
    }
    state.canPick = true;
  }

  function bindPickHandlers(){
    for (let i=0;i<state.cells.length;i+=1){
      const card = state.cells[i].el;
      card.addEventListener('click', () => onPick(i));
    }
  }

  function onPick(idx){
    if (!state.canPick || state.finished) return;
    const cell = state.cells[idx];
    if (cell.locked) return;
    flipTo(idx, true);
    gameAudio.place(); sound.beep(1200, 80, 'triangle', 0.04);
    if (cell.type === state.targetIdx){
      cell.locked = true; cell.el.classList.add('success');
      setFound(state.found + 1);
      if (state.found >= TARGET_COPIES){ endGame(true); }
    } else {
      cell.el.classList.add('wrong');
      endGame(false);
    }
  }

  function flipTo(idx, showBack){
    const cell = state.cells[idx];
    if (!cell) return;
    if (showBack) { cell.el.classList.add('flipped'); cell.flipped = true; }
    else { cell.el.classList.remove('flipped'); cell.flipped = false; }
  }

  function endGame(win){ if (state.finished) return; state.finished = true; state.canPick=false; stopTimer(); document.body.classList.add('no-interactions');
    if (win){ gameAudio.success(); overlay('恭喜全部找到！🎉 点击重来'); }
    else { gameAudio.fail(); overlay('时间到或点击错误，挑战失败。点击重试'); }
  }

  function overlay(text){ let ov=document.querySelector('.overlay'); if(!ov){ ov=document.createElement('div'); ov.className='overlay show'; const dlg=document.createElement('div'); dlg.className='dialog'; dlg.textContent=text; ov.appendChild(dlg); ov.addEventListener('click', resetGame); document.body.appendChild(ov); } else { ov.classList.add('show'); ov.querySelector('.dialog').textContent=text; } }
  function hideOverlay(){ const ov=document.querySelector('.overlay'); if (ov) ov.classList.remove('show'); }

  function applyBackground(){ const bg=(CFG.image && CFG.image.background)? CFG.image.background : null; if (bg && els.pageBg) els.pageBg.style.backgroundImage = `url('${bg}')`; }

  function startGame(){ if (state.started) return; state.started=true; setFound(0); setTime(TIME_LIMIT); startTimer(); revealSequence(); }
  function resetGame(){ hideOverlay(); document.body.classList.remove('no-interactions'); state.finished=false; state.started=false; setFound(0); setTime(TIME_LIMIT); buildBoard(); bindPickHandlers(); startGame(); }

  function waitMs(ms){ return new Promise(res => setTimeout(res, ms)); }

  function bindAudioUnlock(){
    const onGesture = async () => {
      sound.unlock();
      const ok = await gameAudio.startBgm();
      if (!state.started) startGame();
      if (ok || gameAudio.started) {
        document.removeEventListener('pointerdown', onGesture, { passive: true });
        document.removeEventListener('click', onGesture, { passive: true });
      }
    };
    document.addEventListener('pointerdown', onGesture, { passive: true });
    document.addEventListener('click', onGesture, { passive: true });
  }

  function main(){ bindAudioUnlock(); applyBackground(); buildBoard(); bindPickHandlers(); setFound(0); setTime(TIME_LIMIT); }
  window.addEventListener('load', main);
})();


