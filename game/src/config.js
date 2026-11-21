// Twin Lanterns — configuration: one place for every number the game tunes by.
// The play field is a fixed 1280 x 480 stage so screenshots and play look the same;
// the canvas scales to the browser window around it.
export const VIEW = { width: 1280, height: 480 };

export const PANEL = {
  width: 608,
  height: 396,
  top: 60,
  leftX: 24,
  gap: 16,
};

export const HUD = { height: 52 };

export const HINTS_PER_LEVEL = 3;
export const MISS_PENALTY_SECONDS = 5;
export const HINT_COST_SECONDS = 10;
export const POINTS_PER_FIND = 100;
export const COMBO_STEP = 25;
export const TIME_BONUS_PER_SECOND = 5;

export const LEVELS = [
  { id: 'market', name: 'Lantern Market', sub: 'Level 1 · Night bazaar', time: 180 },
  { id: 'harbour', name: 'Harbour Dusk', sub: 'Level 2 · Sunset tide', time: 150 },
  { id: 'garden', name: 'Secret Garden', sub: 'Level 3 · Morning bloom', time: 120 },
];

export const SHOT_QUERIES = ['start', 'play', 'garden', 'end'];
