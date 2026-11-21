// Twin Lanterns — screenshot staging. ?shot=start|play|garden|end puts the
// real game into the exact frame a screenshot needs: the play shots show two
// near-identical pictures side by side, gold rings on the differences found,
// several still unfound, and the counter of how many remain. The clock is
// frozen so every capture is identical.
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_GAME_CLEAR } from './state.js';

const FROZEN_NOW_MS = 1400;

export function stageShot(name, state) {
  state.shotName = name;
  state.frozenTime = FROZEN_NOW_MS;
  if (name === 'play') {
    state.startLevel(0);
    state.found = new Set([0, 2, 4]);
    state.hinted = new Set([6]);
    state.timeLeft = 92;
    state.score = 350;
    state.combo = 3;
    state.screen = SCREEN_PLAY;
    return;
  }
  if (name === 'garden') {
    state.startLevel(2);
    state.found = new Set([1, 3]);
    state.timeLeft = 88;
    state.score = 1840;
    state.combo = 2;
    state.screen = SCREEN_PLAY;
    return;
  }
  if (name === 'end') {
    state.startLevel(2);
    state.found = new Set([0, 1, 2, 3, 4, 5, 6]);
    state.timeLeft = 45;
    state.score = 2310;
    state.bestCombo = 5;
    state.misses = 2;
    state.totalFound = 21;
    state.screen = SCREEN_GAME_CLEAR;
    return;
  }
  // Any other name (including 'start') is the title screen over level one.
  state.startLevel(0);
  state.screen = SCREEN_TITLE;
  state.timeLeft = 180;
  state.score = 0;
}

export function shotFromUrl(url) {
  const params = new URLSearchParams(url.search);
  return params.get('shot');
}
