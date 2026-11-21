// Twin Lanterns — everything on screen: the HUD, the two panels, the markers
// on found differences, the reticle, the particles and the title/clear screens.
import { VIEW, PANEL, HUD } from './config.js';
import { SCENES, baseVariant, twinVariant } from './scenes.js';
import {
  SCREEN_TITLE,
  SCREEN_PLAY,
  SCREEN_LEVEL_CLEAR,
  SCREEN_GAME_CLEAR,
  SCREEN_TIME_UP,
} from './state.js';

export class Effects {
  constructor() {
    this.sparkles = [];
    this.floaters = [];
    this.misses = [];
    this.toast = null;
    this.toastUntil = 0;
  }

  burst(panel, sx, sy) {
    for (let i = 0; i < 18; i += 1) {
      const a = (i / 18) * Math.PI * 2;
      this.sparkles.push({
        panel,
        x: sx,
        y: sy,
        vx: Math.cos(a) * (30 + (i % 5) * 14),
        vy: Math.sin(a) * (30 + (i % 5) * 14) - 20,
        life: 0.7,
        colour: i % 3 === 0 ? '#ffd94a' : i % 3 === 1 ? '#ff7ab8' : '#7ee8a2',
      });
    }
  }

  floater(panel, sx, sy, text) {
    this.floaters.push({ panel, x: sx, y: sy, text, life: 1.1 });
  }

  miss(panel, sx, sy) {
    this.misses.push({ panel, x: sx, y: sy, life: 0.6 });
  }

  setToast(text, now) {
    this.toast = text;
    this.toastUntil = now + 2600;
  }

  update(dt) {
    for (const s of this.sparkles) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 60 * dt;
      s.life -= dt;
    }
    this.sparkles = this.sparkles.filter((s) => s.life > 0);
    for (const f of this.floaters) {
      f.y -= 26 * dt;
      f.life -= dt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
    for (const m of this.misses) m.life -= dt;
    this.misses = this.misses.filter((m) => m.life > 0);
  }
}

function panelOrigin(index) {
  return {
    x: index === 0 ? PANEL.leftX : PANEL.leftX + PANEL.width + PANEL.gap,
    y: PANEL.top,
  };
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function ring(ctx, x, y, r, colour, width, dash) {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export class Renderer {
  draw(ctx, state, input, effects, nowMs) {
    const now = nowMs / 1000;
    this.drawBackdrop(ctx);
    this.drawHud(ctx, state);
    this.drawTimerBar(ctx, state);
    this.drawPanels(ctx, state, now);
    this.drawMarkers(ctx, state, effects, now);
    this.drawEffects(ctx, effects, now);
    if (state.isPlaying && state.frozenTime === null) this.drawReticle(ctx, input, now);
    this.drawFooter(ctx, state, effects, nowMs);
    if (state.screen === SCREEN_TITLE) this.drawTitle(ctx, state);
    if (state.screen === SCREEN_LEVEL_CLEAR) this.drawLevelClear(ctx, state);
    if (state.screen === SCREEN_GAME_CLEAR) this.drawGameClear(ctx, state);
    if (state.screen === SCREEN_TIME_UP) this.drawTimeUp(ctx, state);
  }

  drawBackdrop(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, VIEW.height);
    g.addColorStop(0, '#191230');
    g.addColorStop(1, '#0e0a1e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }

  drawHud(ctx, state) {
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏮 TWIN LANTERNS', 24, 22);
    ctx.fillStyle = '#e8ddff';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${state.level.name}  ·  ${state.level.sub}`, VIEW.width / 2, 20);
    // Found counter: big, with dots for each difference.
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText(`FOUND ${state.found.size} / ${state.differences.length}`, VIEW.width - 24, 18);
    const dotY = 40;
    let dotX = VIEW.width - 24 - (state.differences.length - 1) * 18;
    state.differences.forEach((_, i) => {
      ctx.beginPath();
      ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
      if (state.found.has(i)) {
        ctx.fillStyle = '#ffd94a';
        ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      dotX += 18;
    });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#b8aee0';
    ctx.font = '15px Georgia, serif';
    ctx.fillText(`Score ${state.score}   ·   Hints ${state.hintsLeft}   ·   Combo x${state.combo}`, 24, 42);
    ctx.textAlign = 'right';
    ctx.fillStyle = state.timeLeft <= 30 && state.isPlaying ? '#ff6b6b' : '#b8aee0';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText(`⏱ ${formatTime(state.timeLeft)}`, VIEW.width - 170, 42);
  }

  drawTimerBar(ctx, state) {
    const ratio = Math.max(0, state.timeLeft / state.level.time);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(0, HUD.height, VIEW.width, 6);
    ctx.fillStyle = ratio > 0.5 ? '#7ee8a2' : ratio > 0.25 ? '#ffd94a' : '#ff6b6b';
    ctx.fillRect(0, HUD.height, VIEW.width * ratio, 6);
  }

  drawPanels(ctx, state, now) {
    const scene = SCENES[state.levelIndex];
    const variants = [baseVariant(), twinVariant(scene)];
    const labels = ['ORIGINAL', 'TWIN'];
    for (let p = 0; p < 2; p += 1) {
      const o = panelOrigin(p);
      ctx.save();
      ctx.beginPath();
      ctx.rect(o.x, o.y, PANEL.width, PANEL.height);
      ctx.clip();
      ctx.translate(o.x, o.y);
      scene.draw(ctx, PANEL.width, PANEL.height, variants[p]);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,217,74,0.65)';
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x, o.y, PANEL.width, PANEL.height);
      // Panel tag.
      ctx.fillStyle = 'rgba(14,10,30,0.82)';
      ctx.beginPath();
      ctx.roundRect(o.x + 10, o.y + 10, 108, 26, 13);
      ctx.fill();
      ctx.fillStyle = '#ffd94a';
      ctx.font = 'bold 13px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[p], o.x + 64, o.y + 24);
    }
  }

  drawMarkers(ctx, state, effects, now) {
    const scene = SCENES[state.levelIndex];
    const pulse = 1 + 0.12 * Math.sin(now * 5);
    scene.differences.forEach((d, i) => {
      if (state.found.has(i)) {
        for (let p = 0; p < 2; p += 1) {
          const o = panelOrigin(p);
          ring(ctx, o.x + d.x, o.y + d.y, d.r * pulse, '#ffd94a', 4);
          ring(ctx, o.x + d.x, o.y + d.y, d.r * pulse + 6, 'rgba(255,217,74,0.45)', 2);
          ctx.fillStyle = '#ffd94a';
          ctx.font = 'bold 20px Georgia, serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✓', o.x + d.x, o.y + d.y + 1);
        }
      } else if (state.hinted.has(i)) {
        for (let p = 0; p < 2; p += 1) {
          const o = panelOrigin(p);
          ring(ctx, o.x + d.x, o.y + d.y, d.r * (1 + 0.18 * Math.sin(now * 6)), '#ff9a3c', 3, [6, 5]);
        }
      }
    });
  }

  drawEffects(ctx, effects, now) {
    for (const s of effects.sparkles) {
      const o = panelOrigin(s.panel);
      ctx.globalAlpha = Math.max(0, s.life / 0.7);
      ctx.fillStyle = s.colour;
      ctx.beginPath();
      ctx.arc(o.x + s.x, o.y + s.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const f of effects.floaters) {
      const o = panelOrigin(f.panel);
      ctx.globalAlpha = Math.max(0, f.life / 1.1);
      ctx.fillStyle = '#ffd94a';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.text, o.x + f.x, o.y + f.y);
    }
    ctx.globalAlpha = 1;
    for (const m of effects.misses) {
      const o = panelOrigin(m.panel);
      ctx.globalAlpha = Math.max(0, m.life / 0.6);
      ctx.strokeStyle = '#ff5a5a';
      ctx.lineWidth = 4;
      const x = o.x + m.x;
      const y = o.y + m.y;
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 10); ctx.lineTo(x + 10, y + 10);
      ctx.moveTo(x + 10, y - 10); ctx.lineTo(x - 10, y + 10);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  drawReticle(ctx, input, now) {
    const { x, y } = input.reticle;
    const blink = 0.55 + 0.45 * Math.sin(now * 4);
    ctx.save();
    ctx.globalAlpha = blink;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 22, y); ctx.lineTo(x - 10, y);
    ctx.moveTo(x + 10, y); ctx.lineTo(x + 22, y);
    ctx.moveTo(x, y - 22); ctx.lineTo(x, y - 10);
    ctx.moveTo(x, y + 10); ctx.lineTo(x, y + 22);
    ctx.stroke();
    ctx.restore();
  }

  drawFooter(ctx, state, effects, nowMs) {
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#b8aee0';
    ctx.font = '14px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('H Hint   ·   M Sound   ·   R Restart   ·   Arrows + Enter work too', 24, 470);
    if (effects.toast && nowMs < effects.toastUntil) {
      ctx.fillStyle = '#ffd94a';
      ctx.font = 'bold 15px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(effects.toast, VIEW.width / 2, 470);
    }
    ctx.fillStyle = '#b8aee0';
    ctx.font = '14px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText('Two pictures · Seven differences · One sharp eye', VIEW.width - 24, 470);
  }

  dim(ctx) {
    ctx.fillStyle = 'rgba(10,6,24,0.72)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }

  card(ctx, y, height) {
    ctx.fillStyle = 'rgba(24,17,48,0.92)';
    ctx.beginPath();
    ctx.roundRect(290, y, 700, height, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,217,74,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawTitle(ctx, state) {
    this.dim(ctx);
    this.card(ctx, 84, 312);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 52px Georgia, serif';
    ctx.fillText('🏮 TWIN LANTERNS', VIEW.width / 2, 150);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText('Spot the Difference', VIEW.width / 2, 198);
    ctx.fillStyle = '#cfc4ee';
    ctx.font = '16px Georgia, serif';
    ctx.fillText('Two pictures hang side by side. Seven small things changed', VIEW.width / 2, 236);
    ctx.fillText('between them. Find all seven before the lanterns burn down.', VIEW.width / 2, 260);
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.fillText('3 scenes  ·  21 differences  ·  later scenes, shorter clocks', VIEW.width / 2, 296);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 19px Georgia, serif';
    ctx.fillText('Click a difference — or move with the arrows and press Enter', VIEW.width / 2, 338);
    ctx.fillStyle = '#7ee8a2';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText('▶  Press Enter or click to play', VIEW.width / 2, 372);
  }

  drawLevelClear(ctx, state) {
    this.dim(ctx);
    this.card(ctx, 120, 240);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#7ee8a2';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText('Level Clear!', VIEW.width / 2, 180);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Georgia, serif';
    ctx.fillText(`All 7 differences found in ${state.level.name}.`, VIEW.width / 2, 226);
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText(`Time bonus +${state.levelBonus}   ·   Score ${state.score}`, VIEW.width / 2, 262);
    ctx.fillStyle = '#cfc4ee';
    ctx.font = '17px Georgia, serif';
    ctx.fillText('Press Enter for the next scene', VIEW.width / 2, 306);
  }

  drawGameClear(ctx, state) {
    this.dim(ctx);
    this.card(ctx, 96, 288);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText('🏮 All Scenes Solved!', VIEW.width / 2, 156);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Georgia, serif';
    ctx.fillText('Every twin unmasked — all 21 differences found.', VIEW.width / 2, 204);
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText(`Final score ${state.score}`, VIEW.width / 2, 246);
    ctx.fillStyle = '#cfc4ee';
    ctx.font = '17px Georgia, serif';
    ctx.fillText(`Best combo x${state.bestCombo}   ·   Misses ${state.misses}`, VIEW.width / 2, 282);
    ctx.fillStyle = '#7ee8a2';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText('Press Enter to play again', VIEW.width / 2, 330);
  }

  drawTimeUp(ctx, state) {
    this.dim(ctx);
    this.card(ctx, 120, 240);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText("Time's Up!", VIEW.width / 2, 180);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Georgia, serif';
    ctx.fillText(`You found ${state.found.size} of 7 in ${state.level.name}.`, VIEW.width / 2, 226);
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText(`Score ${state.score}`, VIEW.width / 2, 262);
    ctx.fillStyle = '#cfc4ee';
    ctx.font = '17px Georgia, serif';
    ctx.fillText('Press R to try the level again', VIEW.width / 2, 306);
  }
}
