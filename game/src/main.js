// Twin Lanterns — boot and the frame loop. The canvas keeps its fixed
// 1280 x 480 stage and scales to the window; clicks are scored here, then
// the state ticks, the effects age, and the renderer draws.
import { VIEW, POINTS_PER_FIND, COMBO_STEP } from './config.js';
import { SCENES } from './scenes.js';
import { GameState, SCREEN_TITLE, SCREEN_PLAY, SCREEN_LEVEL_CLEAR, SCREEN_GAME_CLEAR, SCREEN_TIME_UP } from './state.js';
import { Renderer, Effects } from './render.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { stageShot, shotFromUrl } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = new GameState();
const renderer = new Renderer();
const effects = new Effects();
const sounds = new SoundBank();

function fitCanvas() {
  const hint = document.querySelector('.hint');
  const hintSpace = hint && hint.style.display !== 'none' ? 40 : 0;
  const scale = Math.min(window.innerWidth / VIEW.width, (window.innerHeight - hintSpace) / VIEW.height);
  canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
}

function nearestDifference(sx, sy) {
  const scene = SCENES[state.levelIndex];
  for (let i = 0; i < scene.differences.length; i += 1) {
    if (state.found.has(i)) continue;
    const d = scene.differences[i];
    const dx = sx - d.x;
    const dy = sy - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) return i;
  }
  return -1;
}

/** Advance past a non-play screen (title, level clear, game clear, time up). */
function advanceScreen() {
  if (state.screen === SCREEN_TITLE) {
    state.startGame();
    return true;
  }
  if (state.screen === SCREEN_LEVEL_CLEAR) {
    state.nextLevel();
    return true;
  }
  if (state.screen === SCREEN_GAME_CLEAR || state.screen === SCREEN_TIME_UP) {
    state.startGame();
    return true;
  }
  return false;
}

function onEmptyClick() {
  sounds.ensure();
  advanceScreen();
}

function onMark(sx, sy, panel) {
  sounds.ensure();
  if (advanceScreen()) return;
  if (!state.isPlaying) return;
  const index = nearestDifference(sx, sy);
  if (index >= 0) {
    const points = POINTS_PER_FIND + state.combo * COMBO_STEP;
    state.registerFind(index, points);
    const scene = SCENES[state.levelIndex];
    const d = scene.differences[index];
    effects.burst(panel, d.x, d.y);
    effects.burst(1 - panel, d.x, d.y);
    effects.floater(panel, d.x, d.y - d.r - 8, `+${points}`);
    effects.setToast(d.label, performance.now());
    sounds.found(state.combo);
    if (state.remaining === 0) {
      state.finishLevel();
      if (state.screen === SCREEN_GAME_CLEAR) sounds.gameClear();
      else sounds.levelClear();
    }
  } else {
    state.registerMiss();
    effects.miss(panel, sx, sy);
    effects.setToast('Not quite — that costs 5 seconds.', performance.now());
    sounds.miss();
  }
}

function onHint() {
  if (!state.isPlaying) return;
  const index = state.useHint();
  if (index >= 0) sounds.hint();
}

function onMute() {
  const muted = sounds.toggleMute();
  effects.setToast(muted ? 'Sound off.' : 'Sound on.', performance.now());
}

function onRestart() {
  if (state.screen === SCREEN_TIME_UP || state.isPlaying) state.startLevel(state.levelIndex);
}

function onEscape() {
  if (state.isPlaying) state.screen = SCREEN_TITLE;
}

const input = new Input(canvas, {
  onMark,
  onEmptyClick,
  onHint,
  onMute,
  onRestart,
  onEscape,
  onPointerDown: () => sounds.ensure(),
});

window.addEventListener('resize', fitCanvas);
fitCanvas();

const shot = shotFromUrl(window.location);
if (shot) {
  const hint = document.querySelector('.hint');
  if (hint) hint.style.display = 'none';
  stageShot(shot, state);
  fitCanvas();
}

let last = performance.now();
function frame(nowMs) {
  const dt = Math.min(0.1, (nowMs - last) / 1000);
  last = nowMs;
  if (state.frozenTime === null) {
    const before = state.timeLeft;
    state.tick(dt);
    if (state.isPlaying && state.timeLeft <= 30 && Math.ceil(before) !== Math.ceil(state.timeLeft)) {
      sounds.tick();
    }
    effects.update(dt);
  }
  renderer.draw(ctx, state, input, effects, state.frozenTime ?? nowMs);
  window.__shotReady = true;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
