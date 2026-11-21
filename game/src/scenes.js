// Twin Lanterns — the three scenes. Every scene is drawn twice, side by side:
// the left panel with the base values, the right panel with the variant values.
// A difference is one entry of `differences`: its scene coordinates, its hit
// radius, and the line the game shows when it is found. `draw(ctx, W, H, v)`
// takes v[index] true when that difference is switched on.
import { mulberry32 } from './random.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function sky(ctx, W, H, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  for (const [at, colour] of stops) g.addColorStop(at, colour);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function stars(ctx, W, seed, count, maxY) {
  const rng = mulberry32(seed);
  ctx.fillStyle = '#fff8e0';
  for (let i = 0; i < count; i += 1) {
    const x = rng() * W;
    const y = rng() * maxY;
    const r = 0.6 + rng() * 1.4;
    ctx.globalAlpha = 0.35 + rng() * 0.6;
    circle(ctx, x, y, r);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function paperLantern(ctx, x, y, r, colour, glow) {
  if (glow) {
    ctx.save();
    ctx.shadowColor = colour;
    ctx.shadowBlur = 18;
    circle(ctx, x, y, r);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.restore();
  } else {
    circle(ctx, x, y, r);
    ctx.fillStyle = colour;
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(60,20,10,0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.7, y - r * 0.45);
  ctx.lineTo(x + r * 0.7, y - r * 0.45);
  ctx.moveTo(x - r * 0.7, y + r * 0.45);
  ctx.lineTo(x + r * 0.7, y + r * 0.45);
  ctx.stroke();
  ctx.fillStyle = '#3a1c10';
  ctx.fillRect(x - 3, y - r - 4, 6, 5);
  ctx.fillRect(x - 3, y + r - 1, 6, 5);
}

function drawMarket(ctx, W, H, v) {
  sky(ctx, W, H, [[0, '#171233'], [0.55, '#452052'], [1, '#7a2e4d']]);
  stars(ctx, W, 11, 60, 150);
  // Moon: crescent in the base picture, full in the twin.
  ctx.fillStyle = '#ffeec2';
  circle(ctx, 520, 52, 26);
  ctx.fill();
  if (!v[0]) {
    ctx.fillStyle = '#452052';
    circle(ctx, 532, 46, 24);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,238,194,0.25)';
  circle(ctx, 520, 52, 34);
  ctx.fill();
  // Distant rooftops and lit windows.
  ctx.fillStyle = '#241a3e';
  ctx.fillRect(0, 150, W, 90);
  ctx.fillStyle = '#2e2149';
  ctx.beginPath();
  ctx.moveTo(0, 170); ctx.lineTo(90, 128); ctx.lineTo(180, 170); ctx.closePath();
  ctx.moveTo(200, 170); ctx.lineTo(300, 122); ctx.lineTo(400, 170); ctx.closePath();
  ctx.moveTo(420, 170); ctx.lineTo(520, 126); ctx.lineTo(608, 170); ctx.closePath();
  ctx.fill();
  // Windows: the left one goes dark in the twin.
  ctx.fillStyle = v[5] ? '#241a3e' : '#ffd76a';
  ctx.fillRect(84, 138, 20, 26);
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(248, 136, 18, 24);
  ctx.fillRect(470, 138, 18, 24);
  ctx.fillRect(330, 142, 16, 20);
  ctx.fillStyle = 'rgba(255,215,106,0.75)';
  ctx.fillRect(150, 148, 12, 16);
  ctx.fillRect(410, 146, 12, 16);
  ctx.fillRect(540, 146, 12, 16);
  // The cat on the middle roof: there in the base picture, gone in the twin.
  if (!v[1]) {
    ctx.fillStyle = '#120d24';
    ctx.beginPath();
    ctx.ellipse(305, 158, 16, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 318, 146, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(313, 141); ctx.lineTo(315, 133); ctx.lineTo(319, 140); ctx.closePath();
    ctx.moveTo(320, 140); ctx.lineTo(323, 132); ctx.lineTo(325, 140); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(290, 156); ctx.quadraticCurveTo(280, 146, 284, 136);
    ctx.quadraticCurveTo(290, 144, 293, 152);
    ctx.fill();
  }
  // String of lanterns across the street; one goes missing in the twin.
  ctx.strokeStyle = '#1c1433';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 84);
  ctx.quadraticCurveTo(W / 2, 108, W, 80);
  ctx.stroke();
  const stringXs = [70, 180, 290, 430, 540];
  stringXs.forEach((x, i) => {
    if (v[3] && i === 3) return;
    const y = 88 + Math.sin((x / W) * Math.PI) * 12;
    paperLantern(ctx, x, y, 13, i % 2 ? '#ff5a4e' : '#ffb020', true);
  });
  // Cobbles.
  ctx.fillStyle = '#3a2547';
  ctx.fillRect(0, 240, W, H - 240);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let y = 252; y < H; y += 22) {
    for (let x = (y % 44 ? 0 : 18); x < W; x += 36) ctx.fillRect(x, y, 26, 4);
  }
  // Left stall: fruit, with a teal awning in the base picture and an orange one in the twin.
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(52, 300, 150, 12);
  ctx.fillRect(60, 312, 10, 60);
  ctx.fillRect(184, 312, 10, 60);
  ctx.fillStyle = v[2] ? '#ff7a2a' : '#1f9d8a';
  ctx.beginPath();
  ctx.moveTo(44, 300); ctx.lineTo(210, 300); ctx.lineTo(196, 252); ctx.lineTo(58, 252); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(70, 258, 12, 36);
  ctx.fillRect(110, 258, 12, 36);
  ctx.fillRect(150, 258, 12, 36);
  // Apples on the fruit stall: red in both pictures.
  ctx.fillStyle = '#e23b3b';
  [[80, 292], [104, 290], [128, 292], [152, 290], [176, 292]].forEach(([x, y]) => {
    circle(ctx, x, y, 9);
    ctx.fill();
  });
  ctx.fillStyle = '#ffb020';
  [[92, 293], [116, 291], [140, 293], [164, 291]].forEach(([x, y]) => {
    circle(ctx, x, y, 8);
    ctx.fill();
  });
  // Right stall: hanging lanterns and a sign that changes shape.
  ctx.fillStyle = '#4a2c1c';
  ctx.fillRect(430, 296, 140, 12);
  ctx.fillRect(438, 308, 10, 64);
  ctx.fillRect(552, 308, 10, 64);
  ctx.fillStyle = '#8c2f2f';
  ctx.beginPath();
  ctx.moveTo(422, 296); ctx.lineTo(578, 296); ctx.lineTo(564, 250); ctx.lineTo(436, 250); ctx.closePath();
  ctx.fill();
  paperLantern(ctx, 460, 276, 12, '#ff5a4e', true);
  paperLantern(ctx, 500, 280, 12, '#ffb020', true);
  paperLantern(ctx, 540, 276, 12, '#ff5a4e', true);
  // The sign: a round paper lantern in the base picture, a square board in the twin.
  if (v[6]) {
    ctx.fillStyle = '#f2d8a0';
    rr(ctx, 500, 216, 40, 34, 4);
    ctx.fill();
    ctx.strokeStyle = '#7a2e1e';
    ctx.lineWidth = 2;
    ctx.strokeRect(508, 224, 24, 18);
  } else {
    paperLantern(ctx, 520, 233, 17, '#ffe08a', true);
  }
  // Two shoppers strolling between the stalls; the second one strolls away in the twin.
  ctx.fillStyle = '#160f2e';
  circle(ctx, 300, 330, 12);
  ctx.fill();
  rr(ctx, 288, 342, 24, 44, 8);
  ctx.fill();
  if (!v[4]) {
    circle(ctx, 352, 336, 11);
    ctx.fill();
    rr(ctx, 342, 347, 22, 38, 8);
    ctx.fill();
  }
  // A streetlamp between the stalls, pooling warm light on the cobbles.
  ctx.fillStyle = '#241a3e';
  ctx.fillRect(246, 236, 6, 62);
  ctx.fillStyle = '#ffd76a';
  circle(ctx, 249, 230, 9);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,215,106,0.20)';
  ctx.beginPath();
  ctx.arc(249, 232, 26, 0, Math.PI * 2);
  ctx.fill();
  // Little paper flags strung above the street.
  ctx.strokeStyle = '#1c1433';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 196);
  ctx.quadraticCurveTo(W / 2, 214, W, 194);
  ctx.stroke();
  ['#ff5a4e', '#ffb020', '#1f9d8a', '#c86bff'].forEach((colour, i) => {
    const x = 90 + i * 140;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(x, 200); ctx.lineTo(x + 22, 200); ctx.lineTo(x + 11, 218); ctx.closePath();
    ctx.fill();
  });
  // Warm light pooling on the cobbles.
  ctx.fillStyle = 'rgba(255,176,32,0.12)';
  ctx.beginPath();
  ctx.ellipse(300, 372, 220, 20, 0, 0, Math.PI * 2);
  ctx.fill();
}

const MARKET_DIFFERENCES = [
  { x: 520, y: 52, r: 26, label: 'The moon turned full!' },
  { x: 305, y: 152, r: 22, label: 'The rooftop cat vanished!' },
  { x: 118, y: 272, r: 24, label: 'The awning changed colour!' },
  { x: 430, y: 92, r: 18, label: 'A lantern went missing!' },
  { x: 352, y: 336, r: 20, label: 'A shopper strolled away!' },
  { x: 94, y: 151, r: 20, label: 'A window went dark!' },
  { x: 520, y: 233, r: 22, label: 'The round sign went square!' },
];

function drawHarbour(ctx, W, H, v) {
  sky(ctx, W, H, [[0, '#ff9a3c'], [0.45, '#ff6b81'], [0.75, '#6a3a7a'], [1, '#2c2145']]);
  // Clouds catching the sunset.
  ctx.fillStyle = 'rgba(255,220,180,0.75)';
  ctx.beginPath();
  ctx.ellipse(150, 70, 70, 16, 0, 0, Math.PI * 2);
  ctx.ellipse(200, 62, 48, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,190,160,0.6)';
  ctx.beginPath();
  ctx.ellipse(430, 46, 60, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Sun: rayed in the base picture, a plain disc in the twin.
  ctx.fillStyle = '#fff3c4';
  circle(ctx, 500, 120, 30);
  ctx.fill();
  if (!v[0]) {
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(500 + Math.cos(a) * 38, 120 + Math.sin(a) * 38);
      ctx.lineTo(500 + Math.cos(a) * 50, 120 + Math.sin(a) * 50);
      ctx.stroke();
    }
  }
  // Gulls: three in the base picture, two in the twin.
  ctx.strokeStyle = '#3a2440';
  ctx.lineWidth = 2.5;
  const gulls = [[120, 66], [180, 48], [455, 60]];
  gulls.forEach(([x, y], i) => {
    if (v[2] && i === 2) return;
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.quadraticCurveTo(x - 4, y - 8, x, y);
    ctx.quadraticCurveTo(x + 4, y - 8, x + 10, y);
    ctx.stroke();
  });
  // Far shore with little houses.
  ctx.fillStyle = '#4a2a55';
  ctx.fillRect(0, 168, W, 34);
  ctx.fillStyle = '#5a3566';
  [[40, 150, 46, 20], [130, 142, 52, 26], [560, 148, 48, 20]].forEach(([x, y, w, h]) => {
    ctx.fillRect(x, y, w, h);
    ctx.beginPath();
    ctx.moveTo(x - 4, y); ctx.lineTo(x + w / 2, y - 12); ctx.lineTo(x + w + 4, y); ctx.closePath();
    ctx.fill();
  });
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(56, 156, 10, 12);
  ctx.fillRect(148, 150, 10, 12);
  // The sea.
  const sea = ctx.createLinearGradient(0, 200, 0, H);
  sea.addColorStop(0, '#c94f6d');
  sea.addColorStop(0.5, '#7a3a6e');
  sea.addColorStop(1, '#33244d');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 200, W, H - 200);
  // Sun's glitter path on the water.
  ctx.fillStyle = 'rgba(255,243,196,0.35)';
  for (let i = 0; i < 7; i += 1) {
    const y = 212 + i * 24;
    ctx.fillRect(470 - i * 6, y, 60 + i * 12, 5);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i += 1) {
    const y = 224 + i * 18;
    ctx.beginPath();
    ctx.moveTo(30 + (i % 3) * 60, y);
    ctx.quadraticCurveTo(90 + (i % 3) * 60, y - 6, 150 + (i % 3) * 60, y);
    ctx.stroke();
  }
  // Lighthouse on the left point; its lamp burns in the base picture, dark in the twin.
  ctx.fillStyle = '#e8e0d0';
  ctx.beginPath();
  ctx.moveTo(66, 210); ctx.lineTo(76, 92); ctx.lineTo(104, 92); ctx.lineTo(114, 210); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(70, 176, 40, 14);
  ctx.fillRect(73, 140, 34, 14);
  ctx.fillStyle = '#2c2145';
  ctx.fillRect(74, 76, 32, 18);
  if (!v[1]) {
    ctx.save();
    ctx.shadowColor = '#ffe08a';
    ctx.shadowBlur = 26;
    ctx.fillStyle = '#ffe08a';
    ctx.fillRect(78, 80, 24, 10);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,224,138,0.25)';
    ctx.beginPath();
    ctx.moveTo(102, 85); ctx.lineTo(180, 60); ctx.lineTo(180, 110); ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = '#4a3a55';
    ctx.fillRect(78, 80, 24, 10);
  }
  // Sailboat: a white sail in the base picture, a red one in the twin.
  ctx.fillStyle = '#5a3a22';
  ctx.beginPath();
  ctx.moveTo(340, 268); ctx.lineTo(440, 268); ctx.lineTo(420, 284); ctx.lineTo(360, 284); ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a2418';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(390, 268); ctx.lineTo(390, 176); ctx.stroke();
  ctx.fillStyle = v[3] ? '#d9382b' : '#fdf6e3';
  ctx.beginPath();
  ctx.moveTo(390, 180); ctx.lineTo(390, 264); ctx.lineTo(340, 264); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = v[3] ? '#b32a20' : '#e8dcc0';
  ctx.beginPath();
  ctx.moveTo(394, 188); ctx.lineTo(394, 264); ctx.lineTo(432, 264); ctx.closePath();
  ctx.fill();
  // A second little rowboat.
  ctx.fillStyle = '#7a4a2a';
  ctx.beginPath();
  ctx.moveTo(210, 300); ctx.lineTo(270, 300); ctx.lineTo(258, 312); ctx.lineTo(222, 312); ctx.closePath();
  ctx.fill();
  // The buoy bobs in the base picture and is gone in the twin.
  if (!v[4]) {
    ctx.fillStyle = '#ff5a2a';
    ctx.beginPath();
    ctx.moveTo(180, 296); ctx.lineTo(196, 296); ctx.lineTo(192, 312); ctx.lineTo(184, 312); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.fillRect(181, 302, 14, 5);
  }
  // A fish leaps beside the sailboat in the base picture only.
  if (!v[5]) {
    ctx.fillStyle = '#9fd8e8';
    ctx.beginPath();
    ctx.ellipse(300, 288, 14, 6, -0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(288, 280); ctx.lineTo(282, 272); ctx.lineTo(292, 276); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(300, 300, 12, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
  // Wooden dock along the bottom, with a rope coil in the base picture only.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(0, 330, W, 66);
  ctx.fillStyle = '#7d5230';
  for (let x = 0; x < W; x += 44) ctx.fillRect(x, 330, 4, 66);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, 330, W, 6);
  if (!v[6]) {
    ctx.strokeStyle = '#d8b25a';
    ctx.lineWidth = 5;
    circle(ctx, 540, 362, 16);
    ctx.stroke();
    circle(ctx, 540, 362, 9);
    ctx.stroke();
  }
}

const HARBOUR_DIFFERENCES = [
  { x: 500, y: 120, r: 30, label: 'The sun lost its rays!' },
  { x: 90, y: 85, r: 24, label: 'The lighthouse lamp went out!' },
  { x: 455, y: 60, r: 18, label: 'A gull flew away!' },
  { x: 388, y: 222, r: 26, label: 'The sail turned red!' },
  { x: 188, y: 304, r: 18, label: 'The buoy vanished!' },
  { x: 300, y: 288, r: 18, label: 'The leaping fish is gone!' },
  { x: 540, y: 362, r: 20, label: 'The rope coil disappeared!' },
];

function drawGarden(ctx, W, H, v) {
  sky(ctx, W, H, [[0, '#8ec9ee'], [0.6, '#cfeef7'], [1, '#e8f7d8']]);
  // Sun with rays, top left.
  ctx.fillStyle = '#ffd94a';
  circle(ctx, 84, 58, 26);
  ctx.fill();
  ctx.strokeStyle = '#ffd94a';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 + 0.4;
    ctx.beginPath();
    ctx.moveTo(84 + Math.cos(a) * 32, 58 + Math.sin(a) * 32);
    ctx.lineTo(84 + Math.cos(a) * 42, 58 + Math.sin(a) * 42);
    ctx.stroke();
  }
  // Clouds: two in the base picture, three in the twin.
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.ellipse(300, 56, 52, 14, 0, 0, Math.PI * 2);
  ctx.ellipse(330, 48, 36, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  if (v[5]) {
    ctx.beginPath();
    ctx.ellipse(520, 62, 44, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(545, 55, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // The butterfly flutters in the base picture only.
  if (!v[0]) {
    ctx.fillStyle = '#ff7ab8';
    ctx.beginPath();
    ctx.ellipse(462, 116, 12, 8, -0.6, 0, Math.PI * 2);
    ctx.ellipse(478, 116, 12, 8, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a2e5a';
    ctx.fillRect(468, 110, 3, 14);
  }
  // Rolling lawn with a hedge along the horizon.
  ctx.fillStyle = '#69b455';
  ctx.fillRect(0, 240, W, H - 240);
  ctx.fillStyle = '#4e8f3e';
  for (let x = 0; x < W; x += 52) {
    circle(ctx, x + 26, 244, 22);
    ctx.fill();
  }
  ctx.fillStyle = '#5aa348';
  ctx.beginPath();
  ctx.ellipse(304, 396, 340, 40, 0, Math.PI, 0);
  ctx.fill();
  // The big tree on the left, with a birdhouse in the base picture only.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(96, 150, 26, 100);
  ctx.beginPath();
  ctx.moveTo(96, 190); ctx.quadraticCurveTo(70, 210, 66, 240); ctx.lineTo(96, 240); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3f8f3a';
  circle(ctx, 110, 130, 62);
  ctx.fill();
  circle(ctx, 60, 158, 40);
  ctx.fill();
  circle(ctx, 162, 158, 42);
  ctx.fill();
  ctx.fillStyle = '#57a84e';
  circle(ctx, 96, 108, 34);
  ctx.fill();
  circle(ctx, 140, 96, 26);
  ctx.fill();
  if (!v[4]) {
    ctx.fillStyle = '#a8642f';
    ctx.fillRect(140, 176, 30, 34);
    ctx.beginPath();
    ctx.moveTo(136, 176); ctx.lineTo(155, 158); ctx.lineTo(174, 176); ctx.closePath();
    ctx.fillStyle = '#7a2e1e';
    ctx.fill();
    circle(ctx, 155, 192, 7);
    ctx.fillStyle = '#2c1a10';
    ctx.fill();
  }
  // Stepping-stone path; one stone is missing in the twin.
  ctx.fillStyle = '#cfc4a8';
  const stones = [[268, 352], [308, 366], [350, 356], [392, 368], [432, 352]];
  stones.forEach(([x, y], i) => {
    if (v[6] && i === 2) return;
    ctx.beginPath();
    ctx.ellipse(x, y, 26, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  // The fountain: three jets in the base picture, two in the twin.
  ctx.fillStyle = '#b8b0a0';
  ctx.beginPath();
  ctx.ellipse(304, 300, 78, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7ec8e8';
  ctx.beginPath();
  ctx.ellipse(304, 296, 66, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b8b0a0';
  ctx.fillRect(296, 216, 16, 84);
  ctx.beginPath();
  ctx.ellipse(304, 214, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#9fdcf2';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(304, 210); ctx.quadraticCurveTo(304, 178, 304, 168); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(296, 210); ctx.quadraticCurveTo(272, 182, 262, 172); ctx.stroke();
  if (!v[1]) {
    ctx.beginPath();
    ctx.moveTo(312, 210); ctx.quadraticCurveTo(336, 182, 346, 172); ctx.stroke();
  }
  ctx.fillStyle = '#cfeef7';
  circle(ctx, 304, 164, 6);
  ctx.fill();
  circle(ctx, 262, 170, 5);
  ctx.fill();
  if (!v[1]) {
    circle(ctx, 346, 170, 5);
    ctx.fill();
  }
  // Flower beds left and right.
  function flower(x, y, petal, centre) {
    ctx.fillStyle = petal;
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2;
      circle(ctx, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 6);
      ctx.fill();
    }
    ctx.fillStyle = centre;
    circle(ctx, x, y, 5);
    ctx.fill();
  }
  ctx.strokeStyle = '#3f8f3a';
  ctx.lineWidth = 3;
  [[40, 330], [70, 344], [100, 328], [500, 332], [530, 344], [560, 328]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x, y + 22); ctx.stroke();
  });
  flower(40, 328, '#ff5a7a', '#ffd94a');
  flower(70, 342, '#ffb020', '#7a2e1e');
  flower(100, 326, '#c86bff', '#fff3c4');
  flower(500, 330, '#ff5a7a', '#ffd94a');
  flower(530, 342, '#ffb020', '#7a2e1e');
  // The prize rose: red in the base picture, blue in the twin.
  ctx.beginPath();
  ctx.moveTo(430, 318); ctx.lineTo(430, 342); ctx.stroke();
  flower(430, 314, v[2] ? '#3a7bff' : '#e23b3b', '#ffd94a');
  // A toadstool by the tree in the base picture only.
  if (!v[3]) {
    ctx.fillStyle = '#f2ead8';
    ctx.fillRect(196, 336, 10, 18);
    ctx.fillStyle = '#e23b3b';
    ctx.beginPath();
    ctx.arc(201, 336, 16, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    circle(ctx, 194, 328, 3);
    ctx.fill();
    circle(ctx, 206, 330, 2.5);
    ctx.fill();
  }
  // Bees, birds and petals drifting.
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 2;
  [[400, 90], [440, 74]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.quadraticCurveTo(x - 4, y - 7, x, y);
    ctx.quadraticCurveTo(x + 4, y - 7, x + 9, y);
    ctx.stroke();
  });
  ctx.fillStyle = '#3a2a1a';
  circle(ctx, 220, 120, 3);
  ctx.fill();
  circle(ctx, 250, 100, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,122,184,0.7)';
  circle(ctx, 520, 250, 4);
  ctx.fill();
  circle(ctx, 80, 260, 4);
  ctx.fill();
}

const GARDEN_DIFFERENCES = [
  { x: 470, y: 116, r: 18, label: 'The butterfly flew off!' },
  { x: 346, y: 176, r: 20, label: 'A fountain jet stopped!' },
  { x: 430, y: 314, r: 18, label: 'The rose turned blue!' },
  { x: 201, y: 332, r: 18, label: 'The toadstool vanished!' },
  { x: 155, y: 190, r: 22, label: 'The birdhouse is gone!' },
  { x: 520, y: 60, r: 20, label: 'A new cloud drifted in!' },
  { x: 350, y: 356, r: 18, label: 'A stepping stone went missing!' },
];

export const SCENES = [
  { id: 'market', name: 'Lantern Market', draw: drawMarket, differences: MARKET_DIFFERENCES },
  { id: 'harbour', name: 'Harbour Dusk', draw: drawHarbour, differences: HARBOUR_DIFFERENCES },
  { id: 'garden', name: 'Secret Garden', draw: drawGarden, differences: GARDEN_DIFFERENCES },
];

/** Variant flags for a panel: {} for the original, every difference on for the twin. */
export function baseVariant() {
  return {};
}

export function twinVariant(scene) {
  const v = {};
  scene.differences.forEach((_, i) => {
    v[i] = true;
  });
  return v;
}
