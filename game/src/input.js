// Twin Lanterns — mouse and keyboard input. Clicks land on either panel and are
// translated into scene coordinates (both panels share one coordinate space);
// arrow keys drive a reticle so the whole game is playable without a mouse.
import { VIEW, PANEL } from './config.js';

export class Input {
  constructor(canvas, hooks) {
    this.canvas = canvas;
    this.hooks = hooks;
    // The reticle starts in the middle of the left panel.
    this.reticle = { x: PANEL.leftX + PANEL.width / 2, y: PANEL.top + PANEL.height / 2 };
    this.panel = 0;
    this.keyboardMode = false;
    this.attach();
  }

  toLogical(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW.width,
      y: ((clientY - rect.top) / rect.height) * VIEW.height,
    };
  }

  /** Which panel a logical point is in, and its scene coordinates — or null. */
  panelAt(logical) {
    const panels = [
      { x: PANEL.leftX, index: 0 },
      { x: PANEL.leftX + PANEL.width + PANEL.gap, index: 1 },
    ];
    for (const p of panels) {
      if (
        logical.x >= p.x &&
        logical.x < p.x + PANEL.width &&
        logical.y >= PANEL.top &&
        logical.y < PANEL.top + PANEL.height
      ) {
        return { panel: p.index, sx: logical.x - p.x, sy: logical.y - PANEL.top };
      }
    }
    return null;
  }

  moveReticle(dx, dy) {
    this.keyboardMode = true;
    this.reticle.x = Math.min(VIEW.width - 8, Math.max(8, this.reticle.x + dx));
    this.reticle.y = Math.min(VIEW.height - 8, Math.max(8, this.reticle.y + dy));
    const hit = this.panelAt(this.reticle);
    if (hit) this.panel = hit.panel;
  }

  jumpPanel() {
    this.keyboardMode = true;
    this.panel = 1 - this.panel;
    const baseX = this.panel === 0 ? PANEL.leftX : PANEL.leftX + PANEL.width + PANEL.gap;
    const relX = this.reticle.x - (this.panel === 0 ? PANEL.leftX + PANEL.width + PANEL.gap : PANEL.leftX);
    this.reticle.x = baseX + Math.min(PANEL.width - 8, Math.max(8, relX));
  }

  attach() {
    this.canvas.addEventListener('pointerdown', (event) => {
      this.hooks.onPointerDown();
      const logical = this.toLogical(event.clientX, event.clientY);
      const hit = this.panelAt(logical);
      if (hit) this.hooks.onMark(hit.sx, hit.sy, hit.panel);
      else this.hooks.onEmptyClick();
    });
    this.canvas.addEventListener('pointermove', (event) => {
      const logical = this.toLogical(event.clientX, event.clientY);
      this.reticle.x = logical.x;
      this.reticle.y = logical.y;
      const hit = this.panelAt(logical);
      if (hit) this.panel = hit.panel;
    });
    window.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 48 : 14;
      switch (event.key) {
        case 'ArrowLeft':
          this.moveReticle(-step, 0);
          event.preventDefault();
          break;
        case 'ArrowRight':
          this.moveReticle(step, 0);
          event.preventDefault();
          break;
        case 'ArrowUp':
          this.moveReticle(0, -step);
          event.preventDefault();
          break;
        case 'ArrowDown':
          this.moveReticle(0, step);
          event.preventDefault();
          break;
        case 'Tab':
          this.jumpPanel();
          event.preventDefault();
          break;
        case 'Enter':
        case ' ': {
          const hit = this.panelAt(this.reticle);
          if (hit) this.hooks.onMark(hit.sx, hit.sy, hit.panel);
          else this.hooks.onEmptyClick();
          event.preventDefault();
          break;
        }
        case 'h':
        case 'H':
          this.hooks.onHint();
          break;
        case 'm':
        case 'M':
          this.hooks.onMute();
          break;
        case 'r':
        case 'R':
          this.hooks.onRestart();
          break;
        case 'Escape':
          this.hooks.onEscape();
          break;
        default:
          break;
      }
    });
  }
}
