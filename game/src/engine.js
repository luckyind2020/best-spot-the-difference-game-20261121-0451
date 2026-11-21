// Milo's Garden — game engine.
//
// Owns the round state, the 90-second timer, scoring, hints, the click
// rules, and every overlay. Rendering is one requestAnimationFrame loop that
// repaints both panels from the scene painters, then draws found markers,
// the hint pulse and wrong-click flashes on top, plus the brown frames and
// the A / B badges. The HUD lives in the DOM and is refreshed from here.

import { SCENES } from './scenes.js';
import { makeSfx } from './audio.js';

export const ROUND_SECONDS = 90;
export const POINTS_FOUND = 100;
export const POINTS_WRONG = 20;
export const BONUS_PER_SECOND = 5;
export const HINTS_PER_ROUND = 3;

const PANEL_W = 600;
const PANEL_H = 600;
const PANEL_A_X = 15;
const PANEL_B_X = 625;

const $ = (id) => document.getElementById(id);

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function checkMark(ctx, x, y, r, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x - r * 0.1, y + r * 0.4);
  ctx.lineTo(x + r * 0.5, y - r * 0.4);
  ctx.stroke();
}

export function createGame(canvas) {
  const ctx = canvas.getContext('2d');
  const sfx = makeSfx();

  const state = {
    screen: 'title', // title | intro | play | paused | roundclear | victory | gameover
    round: 0,
    score: 0,
    found: new Set(),
    hintsLeft: HINTS_PER_ROUND,
    timeLeft: ROUND_SECONDS,
    bonus: 0,
    frozen: false, // shot mode: the clock never ticks
    hint: null, // {diff, until}
    misses: [], // {x, y, until} red X flashes, canvas coords
    introUntil: 0,
    pausedFrom: null,
    lastTick: 0,
  };

  function scene() { return SCENES[state.round]; }
  function foundCount() { return state.found.size; }
  function roundDone() { return foundCount() === scene().diffs.length; }

  // ------------------------------------------------------------ overlays ---
  const overlay = $('overlay');
  const panel = $('overlay-panel');

  function showOverlay(html) {
    panel.innerHTML = html;
    overlay.classList.remove('hidden');
    panel.querySelectorAll('[data-act]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sfx.click();
        doAction(btn.dataset.act);
      });
    });
  }
  function hideOverlay() { overlay.classList.add('hidden'); }

  function titleHtml() {
    return `<h2>🐱 Milo's Garden</h2>
      <p>Two pictures of Milo's day — <b>spot the 7 differences</b> before the
      clock runs out. Click a difference on <b>either</b> picture.</p>
      <p>Three rounds: Garden Morning, Beach Sunset, Cozy Kitchen.</p>
      <button type="button" data-act="start">▶ Start playing</button>`;
  }

  function clearHtml() {
    const last = state.round === SCENES.length - 1;
    return `<h2>${last ? '🎉 You did it!' : '🌟 Round clear!'}</h2>
      <p>You found all <b>7 differences</b> in ${scene().name}.</p>
      <p>Time bonus: <b>+${state.bonus}</b> &nbsp;·&nbsp; Score: <span class="big">${state.score}</span></p>
      <button type="button" data-act="${last ? 'again' : 'next'}">${last ? '↻ Play again' : 'Next round ▶'}</button>`;
  }

  function gameOverHtml() {
    return `<h2>⏰ Time's up!</h2>
      <p>You found <b>${foundCount()} of 7</b> differences in ${scene().name}.</p>
      <p>Final score: <span class="big">${state.score}</span></p>
      <button type="button" data-act="again">↻ Try again</button>`;
  }

  function pausedHtml() {
    return `<h2>⏸ Paused</h2>
      <p>Take a breath — Milo is waiting.</p>
      <p>Score: <b>${state.score}</b> &nbsp;·&nbsp; Found: <b>${foundCount()} / 7</b></p>
      <button type="button" data-act="resume">▶ Keep playing</button>`;
  }

  function syncOverlay() {
    if (state.screen === 'title') showOverlay(titleHtml());
    else if (state.screen === 'roundclear' || state.screen === 'victory') showOverlay(clearHtml());
    else if (state.screen === 'gameover') showOverlay(gameOverHtml());
    else if (state.screen === 'paused') showOverlay(pausedHtml());
    else hideOverlay();
  }

  // ---------------------------------------------------------------- HUD ---
  function syncHud() {
    $('round-label').textContent = `Round ${state.round + 1} / ${SCENES.length} · ${scene().name}`;
    $('time-text').textContent = fmtTime(state.timeLeft);
    const fill = $('timer-fill');
    fill.style.width = `${(state.timeLeft / ROUND_SECONDS) * 100}%`;
    fill.classList.toggle('low', state.timeLeft <= 15);
    $('score-val').textContent = state.score;
    $('found-val').textContent = `${foundCount()} / ${scene().diffs.length}`;
    const hintBtn = $('hint-btn');
    hintBtn.textContent = `💡 Hint (${state.hintsLeft})`;
    hintBtn.disabled = state.screen !== 'play' || state.hintsLeft <= 0;
    $('sound-btn').textContent = sfx.muted ? '🔇 Sound off' : '🔊 Sound on';
  }

  // ------------------------------------------------------------- actions ---
  function beginRound() {
    state.found = new Set();
    state.hintsLeft = HINTS_PER_ROUND;
    state.timeLeft = ROUND_SECONDS;
    state.hint = null;
    state.misses = [];
    state.screen = 'intro';
    state.introUntil = performance.now() + 1700;
    syncHud();
    syncOverlay();
    showBanner(`Round ${state.round + 1} — ${scene().name}`);
  }

  function startGame() {
    state.round = 0;
    state.score = 0;
    beginRound();
  }

  function showBanner(text) {
    const el = document.createElement('div');
    el.className = 'banner';
    el.textContent = text;
    overlay.classList.remove('hidden');
    panel.style.display = 'none';
    overlay.appendChild(el);
    setTimeout(() => {
      el.remove();
      panel.style.display = '';
      if (state.screen === 'intro') {
        state.screen = 'play';
        state.lastTick = performance.now();
        syncOverlay();
        syncHud();
      }
    }, 1700);
  }

  function finishRound() {
    state.bonus = Math.round(state.timeLeft) * BONUS_PER_SECOND;
    state.score += state.bonus;
    if (state.round === SCENES.length - 1) {
      state.screen = 'victory';
      sfx.fanfare();
    } else {
      state.screen = 'roundclear';
      sfx.clear();
    }
    syncHud();
    syncOverlay();
  }

  function doAction(act) {
    if (act === 'start' || act === 'again') startGame();
    else if (act === 'next') { state.round += 1; beginRound(); }
    else if (act === 'resume') {
      state.screen = 'play';
      state.lastTick = performance.now();
      syncOverlay();
      syncHud();
    }
  }

  function useHint() {
    if (state.screen !== 'play' || state.hintsLeft <= 0) return;
    const remaining = scene().diffs.filter((d) => !state.found.has(d.id));
    if (!remaining.length) return;
    state.hintsLeft -= 1;
    state.hint = { diff: remaining[Math.floor(Math.random() * remaining.length)], until: performance.now() + 2500 };
    sfx.click();
    syncHud();
  }

  function togglePause() {
    if (state.screen === 'play') {
      state.screen = 'paused';
      syncOverlay();
      syncHud();
    } else if (state.screen === 'paused') {
      doAction('resume');
    }
  }

  // -------------------------------------------------------------- input ---
  function panelPoint(evt) {
    const box = canvas.getBoundingClientRect();
    const sx = canvas.width / box.width;
    const sy = canvas.height / box.height;
    const cx = (evt.clientX - box.left) * sx;
    const cy = (evt.clientY - box.top) * sy;
    if (cx >= PANEL_A_X && cx < PANEL_A_X + PANEL_W) return { x: cx - PANEL_A_X, y: cy };
    if (cx >= PANEL_B_X && cx < PANEL_B_X + PANEL_W) return { x: cx - PANEL_B_X, y: cy };
    return null;
  }

  function onCanvasClick(evt) {
    if (state.screen !== 'play') return;
    const p = panelPoint(evt);
    if (!p) return;
    const now = performance.now();
    for (const d of scene().diffs) {
      if (state.found.has(d.id)) continue;
      const dx = p.x - d.x;
      const dy = p.y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) {
        state.found.add(d.id);
        state.score += POINTS_FOUND;
        sfx.found();
        syncHud();
        if (roundDone()) finishRound();
        return;
      }
    }
    // wrong click: -20, never below zero, red X where clicked
    state.score = Math.max(0, state.score - POINTS_WRONG);
    state.misses.push({ x: p.x, y: p.y, until: now + 900 });
    sfx.wrong();
    syncHud();
  }

  canvas.addEventListener('click', onCanvasClick);

  $('hint-btn').addEventListener('click', useHint);
  $('sound-btn').addEventListener('click', () => { sfx.toggleMuted(); syncHud(); });
  $('restart-btn').addEventListener('click', () => { sfx.click(); startGame(); });

  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') {
      if (state.screen === 'title' || state.screen === 'roundclear' || state.screen === 'victory' || state.screen === 'gameover') {
        const act = state.screen === 'roundclear' ? 'next' : 'start';
        doAction(act === 'next' && state.round === SCENES.length - 1 ? 'again' : act);
      }
    } else if (evt.key === 'h' || evt.key === 'H') useHint();
    else if (evt.key === 'm' || evt.key === 'M') { sfx.toggleMuted(); syncHud(); }
    else if (evt.key === 'r' || evt.key === 'R') startGame();
    else if (evt.key === 'p' || evt.key === 'P' || evt.key === 'Escape') togglePause();
  });

  // ------------------------------------------------------------ drawing ---
  function drawMarks(now) {
    const diffs = scene().diffs;
    for (const originX of [PANEL_A_X, PANEL_B_X]) {
      for (const d of diffs) {
        if (!state.found.has(d.id)) continue;
        const x = originX + d.x;
        const y = d.y;
        ctx.strokeStyle = '#2e9e44';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, y, d.r + 4, 0, Math.PI * 2);
        ctx.stroke();
        checkMark(ctx, x, y - 2, d.r, '#2e9e44');
      }
      if (state.hint && now < state.hint.until) {
        const pulse = 1 + 0.12 * Math.sin(now / 130);
        const d = state.hint.diff;
        ctx.strokeStyle = '#ffcf3f';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(originX + d.x, d.y, (d.r + 8) * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (const m of state.misses) {
        if (now > m.until) continue;
        const x = originX + m.x;
        const y = m.y;
        ctx.strokeStyle = '#d94f3d';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 11, y - 11); ctx.lineTo(x + 11, y + 11);
        ctx.moveTo(x + 11, y - 11); ctx.lineTo(x - 11, y + 11);
        ctx.stroke();
      }
    }
  }

  function drawFrame(now) {
    // brown frames + round letter badges
    ctx.strokeStyle = '#8a5a2e';
    ctx.lineWidth = 6;
    ctx.strokeRect(PANEL_A_X - 3, 3, PANEL_W + 6, PANEL_H - 6);
    ctx.strokeRect(PANEL_B_X - 3, 3, PANEL_W + 6, PANEL_H - 6);
    for (const [bx, label] of [[PANEL_A_X + 22, 'A'], [PANEL_B_X + 22, 'B']]) {
      circleBadge(bx, 26, label);
    }
    function circleBadge(x, y, label) {
      ctx.fillStyle = '#b3541e';
      ctx.beginPath();
      ctx.arc(x, y, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff7e6';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y + 1);
    }
  }

  function frame(now) {
    // tick the clock
    if (state.screen === 'play' && !state.frozen) {
      const dt = (now - state.lastTick) / 1000;
      state.lastTick = now;
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.screen = 'gameover';
        sfx.gameOver();
        syncHud();
        syncOverlay();
      } else {
        syncHud();
      }
    }
    if (state.screen === 'intro' && now >= state.introUntil) {
      state.screen = 'play';
      state.lastTick = now;
      syncOverlay();
      syncHud();
    }
    state.misses = state.misses.filter((m) => now < m.until);
    if (state.hint && now >= state.hint.until) state.hint = null;

    // paint both panels
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(PANEL_A_X, 0);
    scene().paint(ctx, false);
    ctx.restore();
    ctx.save();
    ctx.translate(PANEL_B_X, 0);
    scene().paint(ctx, true);
    ctx.restore();
    drawMarks(now);
    drawFrame(now);
    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------- test hooks ---
  // Exposed so an automated play-test can read the live state; the game
  // itself never calls these.
  window.MILO = { state, scene };

  syncHud();
  syncOverlay();
  requestAnimationFrame(frame);

  return {
    state,
    sfx,
    startGame,
    useHint,
    togglePause,
    doAction,
    syncHud,
    syncOverlay,
  };
}
