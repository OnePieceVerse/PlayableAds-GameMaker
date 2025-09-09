(() => {
  const CFG = (window && window.PUZZLE_CONFIG) ? window.PUZZLE_CONFIG : {};
  const DEFAULT_IMAGE = (CFG.image && typeof CFG.image.puzzle === 'string') ? CFG.image.puzzle : 'assets/images/sample.svg';
  const GP = (CFG.gameplay || {});
  const DEFAULT_GRID = Number.isInteger(GP.grid) && GP.grid > 1 ? GP.grid : 3;
  const DEFAULT_SECONDS = Number.isInteger(GP.timeLimitSec) && GP.timeLimitSec > 0 ? GP.timeLimitSec : 120;

  const state = {
    imageUrl: DEFAULT_IMAGE,
    gridSize: DEFAULT_GRID,
    placedCount: 0,
    totalPieces: 0,
    selectedSlot: null,
    dragging: null,
    dragGhost: null,
    activePointerId: null,
    remainingSeconds: DEFAULT_SECONDS,
    timerId: null,
    finished: false,
  };

  const els = {
    board: document.getElementById('board'),
    pieces: document.getElementById('pieces'),
    status: document.getElementById('status'),
    timerText: document.getElementById('timerText'),
    pageBg: document.getElementById('pageBg'),
  };

  // Audio: try to load assets/audios, otherwise fallback to WebAudio beeps
  const sound = (() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext || function(){})();
    let unlocked = false;

    function unlock() {
      if (!ctx || unlocked) return;
      const b = ctx.createBuffer(1, 1, 22050);
      const s = ctx.createBufferSource();
      s.buffer = b; s.connect(ctx.destination); s.start(0);
      unlocked = true;
    }

    function beep(freq = 880, durationMs = 90, type = 'triangle', gain = 0.03) {
      if (!ctx) return;
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(gain, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
      osc.connect(g).connect(ctx.destination);
      osc.start(t0); osc.stop(t0 + durationMs / 1000);
    }

    return { unlock, beep };
  })();

  // Background music and SFX via HTMLAudio, configured from config.js
  const gameAudio = (() => {
    let bgmEl = null;
    let sfxSuccessEl = null;
    let sfxFailEl = null;
    let sfxPlaceEl = null;
    let hasInitialized = false;
    let hasStartedBgm = false;

    function initFromConfig() {
      if (hasInitialized) return;
      const audioCfg = (CFG && CFG.audio) ? CFG.audio : {};
      try {
        if (audioCfg.bgm && audioCfg.bgmEnabled !== false) {
          bgmEl = new Audio(audioCfg.bgm);
          bgmEl.loop = true;
          bgmEl.volume = clampVolume(audioCfg.bgmVolume, 0.5);
        }
        if (audioCfg.sfxSuccess) {
          sfxSuccessEl = new Audio(audioCfg.sfxSuccess);
          sfxSuccessEl.volume = clampVolume(audioCfg.sfxVolume, 1.0);
        }
        if (audioCfg.sfxFail) {
          sfxFailEl = new Audio(audioCfg.sfxFail);
          sfxFailEl.volume = clampVolume(audioCfg.sfxVolume, 1.0);
        }
        if (audioCfg.sfxPlace) {
          sfxPlaceEl = new Audio(audioCfg.sfxPlace);
          const vol = audioCfg.sfxVolume;
          sfxPlaceEl.volume = clampVolume(vol, 1.0);
        }
      } catch (_e) { /* ignore */ }
      hasInitialized = true;
    }

    function clampVolume(v, dflt) {
      const n = typeof v === 'number' ? v : dflt;
      if (!isFinite(n)) return dflt;
      return Math.max(0, Math.min(1, n));
    }

    async function startBgm() {
      initFromConfig();
      if (!bgmEl || hasStartedBgm) return;
      try {
        await bgmEl.play();
        hasStartedBgm = true;
        return true;
      } catch (_e) {
        return false; // autoplay blocked
      }
    }

    function stopBgm() {
      if (bgmEl) { try { bgmEl.pause(); } catch (_e) {} hasStartedBgm = false; }
    }

    function playSuccess() {
      initFromConfig();
      if (sfxSuccessEl) { try { sfxSuccessEl.currentTime = 0; sfxSuccessEl.play(); } catch (_e) {} }
    }

    function playFail() {
      initFromConfig();
      if (sfxFailEl) { try { sfxFailEl.currentTime = 0; sfxFailEl.play(); } catch (_e) {} }
    }

    function playPlace() {
      initFromConfig();
      if (sfxPlaceEl) { try { sfxPlaceEl.currentTime = 0; sfxPlaceEl.play(); } catch (_e) {} }
    }

    return { initFromConfig, startBgm, stopBgm, playSuccess, playFail, playPlace, get started(){ return hasStartedBgm; } };
  })();

  function setStatus(_text) {}

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateTimerText() {
    if (els.timerText) els.timerText.textContent = formatTime(state.remainingSeconds);
  }

  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function startTimer(seconds) {
    stopTimer();
    state.remainingSeconds = seconds;
    updateTimerText();
    state.timerId = setInterval(() => {
      state.remainingSeconds -= 1;
      if (state.remainingSeconds <= 0) {
        state.remainingSeconds = 0;
        updateTimerText();
        stopTimer();
        onTimeUp();
      } else {
        updateTimerText();
      }
    }, 1000);
  }

  function onTimeUp() {
    if (state.finished) return;
    state.finished = true;
    disableInteractions();
    gameAudio.playFail();
    showFailBanner();
  }

  function disableInteractions() {
    document.body.classList.add('no-interactions');
  }

  function enableInteractions() {
    document.body.classList.remove('no-interactions');
  }

  function showFailBanner() {
    let banner = document.querySelector('.fail-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'fail-banner active';
      const content = document.createElement('div');
      content.className = 'fail-content';
      content.innerHTML = '<strong>时间到！</strong> 很遗憾，挑战失败。<br/><br/>点击继续重试';
      banner.appendChild(content);
      banner.addEventListener('click', () => {
        banner.classList.remove('active');
        resetGame();
      });
      document.body.appendChild(banner);
    } else {
      banner.classList.add('active');
    }
  }

  function clearElement(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function shuffleInPlace(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function createBoardInner(grid) {
    const inner = document.createElement('div');
    inner.className = 'board-inner';
    inner.style.gridTemplateColumns = `repeat(${grid}, 1fr)`;
    inner.style.gridTemplateRows = `repeat(${grid}, 1fr)`;
    return inner;
  }

  function createPiecesInner() {
    const inner = document.createElement('div');
    inner.className = 'pieces-inner';
    return inner;
  }

  function pieceBackgroundPosition(col, row, grid) {
    const xPercent = (col / (grid - 1)) * 100;
    const yPercent = (row / (grid - 1)) * 100;
    return `${xPercent}% ${yPercent}%`;
  }

  function buildBoard(imageUrl, grid) {
    clearElement(els.board);
    const inner = createBoardInner(grid);
    els.board.appendChild(inner);

    // Directly use board-inner; no extra overlay wrapper
    const total = grid * grid;
    for (let idx = 0; idx < total; idx += 1) {
      const row = Math.floor(idx / grid);
      const col = idx % grid;
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.index = String(idx);
      // Create a child for the background layer we can fade out
      const bg = document.createElement('div');
      bg.className = 'slot-bg';
      bg.style.backgroundImage = `url('${imageUrl}')`;
      bg.style.backgroundSize = `${grid * 100}% ${grid * 100}%`;
      bg.style.backgroundPosition = pieceBackgroundPosition(col, row, grid);
      slot.appendChild(bg);
      slot.setAttribute('data-accepts', 'piece');
      slot.addEventListener('dragover', (e) => e.preventDefault());
      slot.addEventListener('drop', (e) => onDropOnSlot(e, slot));
      slot.addEventListener('click', () => onClickSlot(slot));
      inner.appendChild(slot);
    }

    // Start fading the per-slot original image backgrounds (no extra overlay)
    startFadeOutSlotBackgrounds(inner);
  }

  function buildPieces(imageUrl, grid) {
    clearElement(els.pieces);
    const inner = createPiecesInner();
    els.pieces.appendChild(inner);

    // Mirror board grid sizing for identical cell size
    syncPiecesGridSize(inner, grid);

    const total = grid * grid;
    // Create fixed cells so layout doesn't reflow when removing pieces
    const cells = [];
    for (let pos = 0; pos < total; pos += 1) {
      const cell = document.createElement('div');
      cell.className = 'piece-cell';
      cell.dataset.cellIndex = String(pos);
      inner.appendChild(cell);
      cells.push(cell);
    }

    // Shuffle the target indices, then place each piece into a fixed cell
    const shuffledTargets = Array.from({ length: total }, (_, i) => i);
    shuffleInPlace(shuffledTargets);

    for (let pos = 0; pos < total; pos += 1) {
      const idx = shuffledTargets[pos];
      const row = Math.floor(idx / grid);
      const col = idx % grid;
      const piece = document.createElement('div');
      piece.className = 'piece';
      piece.draggable = true;
      piece.dataset.targetIndex = String(idx);
      piece.dataset.homeCell = String(pos);
      piece.style.backgroundImage = `url('${imageUrl}')`;
      piece.style.backgroundSize = `${grid * 100}% ${grid * 100}%`;
      piece.style.backgroundPosition = pieceBackgroundPosition(col, row, grid);
      piece.addEventListener('dragstart', (e) => onDragStart(e, piece));
      piece.addEventListener('dragend', (e) => onDragEnd(e, piece));
      piece.addEventListener('click', () => onClickPiece(piece));
      cells[pos].appendChild(piece);
    }
  }

  function resetGame() {
    stopTimer();
    load(state.imageUrl, state.gridSize);
  }

  function syncPiecesGridSize(piecesInnerEl, grid) {
    const boardInner = els.board.querySelector('.board-inner');
    if (!boardInner) return;
    const gapPx = 8; // CSS gap for .pieces-inner

    // Compute available square size S based on both containers (minus paddings)
    const boardBox = els.board.getBoundingClientRect();
    const piecesBox = els.pieces.getBoundingClientRect();
    const boardCS = getComputedStyle(els.board);
    const piecesCS = getComputedStyle(els.pieces);
    const boardInnerW = Math.max(0, boardBox.width - parseFloat(boardCS.paddingLeft) - parseFloat(boardCS.paddingRight));
    const boardInnerH = Math.max(0, boardBox.height - parseFloat(boardCS.paddingTop) - parseFloat(boardCS.paddingBottom));
    const piecesInnerW = Math.max(0, piecesBox.width - parseFloat(piecesCS.paddingLeft) - parseFloat(piecesCS.paddingRight));
    const piecesInnerH = Math.max(0, piecesBox.height - parseFloat(piecesCS.paddingTop) - parseFloat(piecesCS.paddingBottom));
    const maxSquare = Math.floor(Math.min(boardInnerW, boardInnerH, piecesInnerW, piecesInnerH));

    // Set board-inner to SxS
    boardInner.style.width = `${maxSquare}px`;
    boardInner.style.height = `${maxSquare}px`;

    // Compute cell size so that grid including gaps fits exactly into S
    const cellSizePx = Math.max(8, Math.floor((maxSquare - gapPx * (grid - 1)) / grid));
    const gridSizePx = cellSizePx * grid + gapPx * (grid - 1);
    piecesInnerEl.style.gridTemplateColumns = `repeat(${grid}, ${cellSizePx}px)`;
    piecesInnerEl.style.gridTemplateRows = `repeat(${grid}, ${cellSizePx}px)`;
    piecesInnerEl.style.width = `${gridSizePx}px`;
    piecesInnerEl.style.height = `${gridSizePx}px`;
    // Center inside pieces panel (grid container itself is centered by CSS)
    piecesInnerEl.style.margin = '0 auto';
  }

  function onDragStart(e, piece) {
    piece.classList.add('dragging');
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', piece.dataset.targetIndex || '');
      e.dataTransfer.effectAllowed = 'move';
    }
  }
  function onDragEnd(_e, piece) {
    piece.classList.remove('dragging');
  }

  function onDropOnSlot(e, slot) {
    e.preventDefault();
    const dragging = document.querySelector('.piece.dragging');
    if (dragging) {
      placePieceIntoSlot(dragging, slot);
    }
  }

  function onClickSlot(slot) {
    // Toggle selection for tap-to-place on mobile
    if (state.selectedSlot === slot) {
      slot.classList.remove('selected');
      state.selectedSlot = null;
      return;
    }
    if (state.selectedSlot) state.selectedSlot.classList.remove('selected');
    state.selectedSlot = slot;
    slot.classList.add('selected');
  }

  function onClickPiece(piece) {
    if (state.selectedSlot) {
      placePieceIntoSlot(piece, state.selectedSlot);
      state.selectedSlot.classList.remove('selected');
      state.selectedSlot = null;
      return;
    }
    // If piece already in a slot, clicking returns it to pool
    const parentSlot = piece.parentElement && piece.parentElement.classList.contains('slot') ? piece.parentElement : null;
    if (parentSlot) {
      movePieceToPool(piece);
    }
  }

  function movePieceToPool(piece) {
    const inner = els.pieces.querySelector('.pieces-inner');
    const previousParent = piece.parentElement;
    // Prefer the original home cell
    const homeIndex = piece.dataset.homeCell ? parseInt(piece.dataset.homeCell, 10) : -1;
    let targetCell = null;
    if (inner) {
      if (homeIndex >= 0) {
        const maybe = inner.querySelector(`.piece-cell[data-cell-index="${homeIndex}"]`);
        if (maybe && !maybe.querySelector('.piece')) targetCell = maybe;
      }
      if (!targetCell) {
        // Find first empty cell
        const cells = Array.from(inner.querySelectorAll('.piece-cell'));
        for (const c of cells) {
          if (!c.querySelector('.piece')) { targetCell = c; break; }
        }
      }
    }
    if (targetCell) targetCell.appendChild(piece);
    if (previousParent && previousParent.classList && previousParent.classList.contains('slot')) {
      if (!previousParent.querySelector('.piece')) {
        previousParent.classList.remove('filled');
      }
    }
  }

  function placePieceIntoSlot(piece, slot) {
    if (!slot || !piece) return;
    // If slot already has a piece, send that piece back to pool first
    const existing = slot.querySelector('.piece');
    if (existing) movePieceToPool(existing);
    slot.appendChild(piece);
    slot.classList.add('filled');
    // place sfx or fallback beep
    gameAudio.playPlace();
    sound.beep(1200, 80, 'triangle', 0.04);
    checkWin();
  }

  function checkWin() {
    const grid = state.gridSize;
    const total = grid * grid;
    const inner = els.board.querySelector('.board-inner');
    if (!inner) return;
    for (let idx = 0; idx < total; idx += 1) {
      const slot = inner.children[idx];
      const piece = slot.querySelector('.piece');
      if (!piece) return; // Not complete
      if ((piece.dataset.targetIndex || '') !== String(idx)) return; // Wrong position
    }
    setStatus('完成！👏');
    stopTimer();
    state.finished = true;
    celebrate();
  }

  function celebrate() {
    // quick fanfare using WebAudio
    for (let i = 0; i < 4; i += 1) {
      setTimeout(() => sound.beep(660 + i * 120, 120, 'sine', 0.06), i * 130);
    }
    // success sfx
    gameAudio.playSuccess();
    // simple visual banner
    let banner = document.querySelector('.win-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'win-banner active';
      const content = document.createElement('div');
      content.className = 'win-content';
      content.innerHTML = '<strong>拼图完成！</strong> 恭喜你！';
      banner.appendChild(content);
      banner.addEventListener('click', () => banner.classList.remove('active'));
      document.body.appendChild(banner);
    } else {
      banner.classList.add('active');
    }
  }

  function load(imageUrl, grid) {
    state.imageUrl = imageUrl;
    state.gridSize = grid;
    state.selectedSlot = null;
    setStatus(`图片加载中…`);
    // Preload image then build
    const img = new Image();
    img.onload = () => {
      buildBoard(imageUrl, grid);
      buildPieces(imageUrl, grid);
      setStatus(`已加载：${grid} × ${grid}`);
      state.finished = false;
      enableInteractions();
      startTimer(DEFAULT_SECONDS);
    };
    img.onerror = () => {
      setStatus('图片加载失败');
    };
    img.src = imageUrl;
  }

  function triggerRevealIfConfigured(revealEl, imageUrl, grid) {
    const cfg = (window && window.PUZZLE_CONFIG) ? window.PUZZLE_CONFIG : {};
    const revealSec = (cfg.gameplay && typeof cfg.gameplay.revealSec === 'number') ? cfg.gameplay.revealSec : 10;
    if (revealSec <= 0) return;
    const durationMs = Math.max(0, Math.round(revealSec * 1000));
    // Start shown then fade smoothly to 0 over duration
    revealEl.style.backgroundPosition = 'center center';
    revealEl.classList.add('show');
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / durationMs);
      revealEl.style.opacity = String(1 - t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        if (revealEl.parentElement) revealEl.parentElement.removeChild(revealEl);
      }
    }
    requestAnimationFrame(step);
  }

  function startFadeOutSlotBackgrounds(boardInnerEl) {
    const cfg = (window && window.PUZZLE_CONFIG) ? window.PUZZLE_CONFIG : {};
    const revealSec = (cfg.gameplay && typeof cfg.gameplay.revealSec === 'number') ? cfg.gameplay.revealSec : 10;
    if (revealSec <= 0) return;
    const durationMs = Math.max(0, Math.round(revealSec * 1000));
    const slotBgs = Array.from(boardInnerEl.querySelectorAll('.slot-bg'));
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / durationMs);
      const op = String(1 - t);
      for (const bg of slotBgs) bg.style.opacity = op;
      if (t < 1) requestAnimationFrame(step);
      else {
        for (const bg of slotBgs) { if (bg.parentElement) bg.parentElement.removeChild(bg); }
      }
    }
    requestAnimationFrame(step);
  }

  function shuffle() {
    const inner = els.pieces.querySelector('.pieces-inner');
    if (!inner) return;
    const pieces = Array.from(inner.children);
    shuffleInPlace(pieces);
    for (const p of pieces) inner.appendChild(p);
    setStatus('已打乱');
  }

  function reset() {
    load(state.imageUrl, state.gridSize);
    setStatus('已重置');
  }

  function bindEvents() {
    // No toolbar controls: defaults only

    // Unlock audio and try starting BGM on user gestures until success
    const tryStartAudioOnGesture = async () => {
      sound.unlock();
      const started = await gameAudio.startBgm();
      if (started || gameAudio.started) {
        document.removeEventListener('pointerdown', tryStartAudioOnGesture, { passive: true });
        document.removeEventListener('click', tryStartAudioOnGesture, { passive: true });
      }
    };
    document.addEventListener('pointerdown', tryStartAudioOnGesture, { passive: true });
    document.addEventListener('click', tryStartAudioOnGesture, { passive: true });

    // Pointer-driven touch DnD for mobile
    document.addEventListener('pointerdown', onPointerDown, { passive: false });
    document.addEventListener('pointermove', onPointerMove, { passive: false });
    document.addEventListener('pointerup', onPointerUp, { passive: false });
    document.addEventListener('pointercancel', onPointerUp, { passive: false });

    // Resize handling
    window.addEventListener('resize', onWindowResized);
    trySetupBoardResizeObserver();
  }

  function main() {
    bindEvents();
    applyBackgroundFromConfig();
    load(DEFAULT_IMAGE, DEFAULT_GRID);
  }

  window.addEventListener('load', main);

  function applyBackgroundFromConfig() {
    const img = (CFG.image && CFG.image.background) ? CFG.image.background : null;
    if (!img || !els.pageBg) return;
    els.pageBg.style.backgroundImage = `url('${img}')`;
    // Keep sensible defaults set in CSS: cover, center, no-repeat, low opacity
  }

  // Touch/Pointer drag-n-drop
  function isPiece(el) { return el && el.classList && el.classList.contains('piece'); }
  function isSlot(el) { return el && el.classList && el.classList.contains('slot'); }

  function findSlotUnderPoint(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    if (isSlot(el)) return el;
    return el.closest && el.closest('.slot');
  }

  function onPointerDown(ev) {
    // Only start custom DnD if source is a piece and not already native dragging
    const target = ev.target;
    if (!isPiece(target)) return;
    if (state.finished) return;
    if (state.activePointerId !== null) return;
    state.activePointerId = ev.pointerId;
    state.dragging = target;
    target.classList.add('dragging');
    createGhostForPiece(target, ev.clientX, ev.clientY);
    try { ev.target.setPointerCapture(ev.pointerId); } catch (_) {}
    ev.preventDefault();
  }

  function onPointerMove(ev) {
    if (state.activePointerId !== ev.pointerId) return;
    if (!state.dragging || !state.dragGhost) return;
    positionGhost(ev.clientX, ev.clientY);
    ev.preventDefault();
  }

  function onPointerUp(ev) {
    if (state.activePointerId !== ev.pointerId) return;
    if (!state.dragging) return;
    const piece = state.dragging;
    const dropSlot = findSlotUnderPoint(ev.clientX, ev.clientY);
    if (dropSlot) {
      placePieceIntoSlot(piece, dropSlot);
    } else {
      // If released over pieces area, return to pool at end
      movePieceToPool(piece);
    }
    cleanupDrag();
    try { ev.target.releasePointerCapture(ev.pointerId); } catch (_) {}
    state.activePointerId = null;
  }

  function createGhostForPiece(piece, x, y) {
    const g = document.createElement('div');
    g.className = 'drag-ghost';
    g.style.width = `${piece.offsetWidth}px`;
    g.style.height = `${piece.offsetHeight}px`;
    g.style.backgroundImage = piece.style.backgroundImage;
    g.style.backgroundPosition = piece.style.backgroundPosition;
    g.style.backgroundSize = piece.style.backgroundSize;
    document.body.appendChild(g);
    state.dragGhost = g;
    positionGhost(x, y);
  }

  function positionGhost(x, y) {
    if (!state.dragGhost) return;
    state.dragGhost.style.left = `${x}px`;
    state.dragGhost.style.top = `${y}px`;
  }

  function cleanupDrag() {
    if (state.dragging) state.dragging.classList.remove('dragging');
    if (state.dragGhost && state.dragGhost.parentElement) state.dragGhost.parentElement.removeChild(state.dragGhost);
    state.dragging = null;
    state.dragGhost = null;
  }

  function onWindowResized() {
    const inner = els.pieces.querySelector('.pieces-inner');
    if (!inner) return;
    syncPiecesGridSize(inner, state.gridSize);
    // Ensure board stays within portrait constraints
    // No explicit JS sizing needed because CSS caps height via svh.
  }

  function trySetupBoardResizeObserver() {
    if (!('ResizeObserver' in window)) return;
    const boardInner = els.board.querySelector('.board-inner');
    if (!boardInner) return;
    const ro = new ResizeObserver(() => {
      const piecesInner = els.pieces.querySelector('.pieces-inner');
      if (piecesInner) syncPiecesGridSize(piecesInner, state.gridSize);
    });
    ro.observe(boardInner);
  }
})();


