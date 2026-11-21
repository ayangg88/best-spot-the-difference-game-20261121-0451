// Twin Lanterns — the game state: which screen is showing, which level is
// being hunted, what has been found, and the clock. Pure data and rules;
// render.js draws it, input.js changes it.
import { LEVELS, HINTS_PER_LEVEL, MISS_PENALTY_SECONDS } from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_LEVEL_CLEAR = 'level-clear';
export const SCREEN_GAME_CLEAR = 'game-clear';
export const SCREEN_TIME_UP = 'time-up';

export class GameState {
  constructor() {
    this.screen = SCREEN_TITLE;
    this.levelIndex = 0;
    this.found = new Set();
    this.hinted = new Set();
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.timeLeft = this.level.time;
    this.levelBonus = 0;
    this.totalFound = 0;
    this.misses = 0;
    this.frozenTime = null;
    this.shotName = null;
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  get differences() {
    return SCENES[this.levelIndex].differences;
  }

  get remaining() {
    return this.differences.length - this.found.size;
  }

  get isPlaying() {
    return this.screen === SCREEN_PLAY;
  }

  startLevel(index) {
    this.levelIndex = index;
    this.found = new Set();
    this.hinted = new Set();
    this.combo = 0;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.timeLeft = this.level.time;
    this.levelBonus = 0;
    this.screen = SCREEN_PLAY;
  }

  startGame() {
    this.score = 0;
    this.totalFound = 0;
    this.misses = 0;
    this.bestCombo = 0;
    this.startLevel(0);
  }

  /** Mark a difference found. Returns the points earned, or 0 when already found. */
  registerFind(index, points) {
    if (this.found.has(index)) return 0;
    this.found.add(index);
    this.totalFound += 1;
    this.combo += 1;
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;
    this.score += points;
    return points;
  }

  registerMiss() {
    this.combo = 0;
    this.misses += 1;
    this.timeLeft = Math.max(0, this.timeLeft - MISS_PENALTY_SECONDS);
  }

  useHint() {
    if (this.hintsLeft <= 0) return -1;
    for (let i = 0; i < this.differences.length; i += 1) {
      if (!this.found.has(i) && !this.hinted.has(i)) {
        this.hintsLeft -= 1;
        this.hinted.add(i);
        this.timeLeft = Math.max(0, this.timeLeft - 10);
        return i;
      }
    }
    return -1;
  }

  tick(seconds) {
    if (!this.isPlaying || this.frozenTime !== null) return;
    this.timeLeft = Math.max(0, this.timeLeft - seconds);
    if (this.timeLeft <= 0) this.screen = SCREEN_TIME_UP;
  }

  finishLevel() {
    this.levelBonus = Math.round(this.timeLeft) * 5;
    this.score += this.levelBonus;
    if (this.levelIndex + 1 >= LEVELS.length) {
      this.screen = SCREEN_GAME_CLEAR;
    } else {
      this.screen = SCREEN_LEVEL_CLEAR;
    }
  }

  nextLevel() {
    this.startLevel(this.levelIndex + 1);
  }
}
