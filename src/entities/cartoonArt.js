// Cleaned-up Cartoon-Style Creature & Prop Renderers

const INK = "#0f172a";

/**
 * Smooth round chomping alien with wedge mouth and 3 curved eyes.
 */
export function drawMoonChomper(ctx, { x, y, w, h, facing = 1, timeSec = 0 }) {
  ctx.save();
  const hover = Math.sin(timeSec * 6.5 + x * 0.03) * 3.5;
  const cx = x + w / 2;
  const cy = y + h / 2 + hover;
  const r = Math.min(w, h) * 0.45;

  ctx.translate(cx, cy);
  ctx.scale(facing, 1);

  // Animated chomping mouth angle (opens wide & snaps shut!)
  const chomp = 0.08 + 0.28 * Math.abs(Math.sin(timeSec * 7.5 + x * 0.02));

  // Inner mouth cavity (visible behind open jaw)
  ctx.fillStyle = "#4c1d95";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.92, -chomp, chomp);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  // Cute cartoon tongue inside mouth
  if (chomp > 0.16) {
    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.ellipse(r * 0.35, r * 0.16, r * 0.24, r * 0.12, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main glossy teal-lime chomper body
  ctx.fillStyle = "#2dd4bf";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-r * 0.12, 0);
  ctx.arc(0, 0, r, chomp, Math.PI * 2 - chomp, false);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cartoon cel-shade glossy highlight on upper rim
  ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.76, Math.PI * 1.18, Math.PI * 1.55);
  ctx.stroke();

  // 3 eyes curving down along the cheek (1 larger top eye + 2 smaller curved eyes)
  const eyes = [
    { ex: -r * 0.05, ey: -r * 0.48, er: 4.3 },
    { ex: -r * 0.36, ey: -r * 0.14, er: 3.3 },
    { ex: -r * 0.44, ey: r * 0.22, er: 3.0 },
  ];
  eyes.forEach((e) => drawCartoonEye(ctx, e.ex, e.ey, e.er, 1.1, -0.3));

  ctx.restore();
}

/**
 * Chomping alien with 3 spiky crests on top and 3 diagonal eyes!
 */
export function drawSpikyChomper(ctx, { x, y, w, h, facing = 1, timeSec = 0 }) {
  ctx.save();
  const hover = Math.sin(timeSec * 7.2 + x * 0.03) * 4;
  const cx = x + w / 2;
  const cy = y + h / 2 + 3 + hover;
  const r = Math.min(w, h) * 0.41;

  ctx.translate(cx, cy);
  ctx.scale(facing, 1);

  const chomp = 0.1 + 0.3 * Math.abs(Math.sin(timeSec * 8.5 + x * 0.02));

  // 3 Cartoon Spiky Crests on top-back of head
  const spikes = [
    { a1: -2.55, tipA: -2.32, a2: -2.08, len: r * 1.52, color: "#facc15" },
    { a1: -2.08, tipA: -1.82, a2: -1.56, len: r * 1.56, color: "#fb923c" },
    { a1: -1.56, tipA: -1.30, a2: -1.05, len: r * 1.48, color: "#facc15" },
  ];
  spikes.forEach((sp) => {
    ctx.fillStyle = sp.color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(Math.cos(sp.a1) * (r * 0.85), Math.sin(sp.a1) * (r * 0.85));
    ctx.lineTo(Math.cos(sp.tipA) * sp.len, Math.sin(sp.tipA) * sp.len);
    ctx.lineTo(Math.cos(sp.a2) * (r * 0.85), Math.sin(sp.a2) * (r * 0.85));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // Inner mouth shadow
  ctx.fillStyle = "#3b0764";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.9, -chomp, chomp);
  ctx.lineTo(-r * 0.15, 0);
  ctx.closePath();
  ctx.fill();

  // Main berry-magenta body
  ctx.fillStyle = "#ec4899";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-r * 0.15, 0);
  ctx.arc(0, 0, r, chomp, Math.PI * 2 - chomp, false);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glossy cheek shine
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.74, Math.PI * 0.7, Math.PI * 1.05);
  ctx.stroke();

  // 3 Diagonal Eyes lined up along upper head!
  const diagEyes = [
    { ex: r * 0.18, ey: -r * 0.56, er: 3.4 },
    { ex: -r * 0.08, ey: -r * 0.34, er: 3.2 },
    { ex: -r * 0.32, ey: -r * 0.12, er: 3.0 },
  ];
  diagEyes.forEach((e) => drawCartoonEye(ctx, e.ex, e.ey, e.er, 1.0, 0));

  ctx.restore();
}

/**
 * Rounded arch body, 2 tall bulb antennae, 3 triangle eyes, 2 splayed legs + center dangler!
 */
export function drawStalkAlien(ctx, { x, y, w, h, facing = 1, timeSec = 0, isBoss = false, hurtFlash = false }) {
  ctx.save();
  const scale = Math.min(w / 46, h / 48);
  const bounce = Math.sin(timeSec * (isBoss ? 4.2 : 6) + x * 0.04) * (isBoss ? 5 : 3);
  const cx = x + w / 2;
  const cy = y + h / 2 + 2 * scale + bounce;

  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  if (hurtFlash) {
    ctx.globalAlpha = 0.6;
  }

  // Boss royal energy aura & crown spikes!
  if (isBoss) {
    ctx.fillStyle = "rgba(168, 85, 247, 0.16)";
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // Mini gold boss crown right between the stalks!
    ctx.fillStyle = "#facc15";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6, -13);
    ctx.lineTo(-7, -20);
    ctx.lineTo(-2.5, -16);
    ctx.lineTo(0, -22);
    ctx.lineTo(2.5, -16);
    ctx.lineTo(7, -20);
    ctx.lineTo(6, -13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Two springy antenna stalks with big glossy pom-pom bulbs
  const sway = Math.sin(timeSec * 8) * 2.5;
  [-1, 1].forEach((side) => {
    const bx = side * 16 + sway * side * 0.5;
    const by = -18 + Math.cos(timeSec * 8 + side) * 1.5;

    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(side * 9, -8);
    ctx.quadraticCurveTo(side * 14, -14, bx, by);
    ctx.stroke();

    // Big round bulb at tip
    ctx.fillStyle = "#a855f7";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(bx, by, 4.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f5d0fe";
    ctx.beginPath();
    ctx.arc(bx - 1.4, by - 1.4, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Center hanging tongue / middle leg behind arch
  const midSwing = Math.sin(timeSec * 9) * 2.5;
  ctx.fillStyle = "#fb7185";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-4.5, 4);
  ctx.quadraticCurveTo(-5 + midSwing, 19, midSwing, 20);
  ctx.quadraticCurveTo(5 + midSwing, 19, 4.5, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Main arched alien body with two wide splayed outer legs!
  const legSpread = Math.sin(timeSec * 7) * 2;
  ctx.fillStyle = "#84cc16";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.lineJoin = "round";
  ctx.beginPath();
  // Top dome
  ctx.moveTo(-13, -2);
  ctx.bezierCurveTo(-13, -17, 13, -17, 13, -2);
  // Right splayed leg
  ctx.quadraticCurveTo(17, 8, 20 + legSpread, 17);
  ctx.quadraticCurveTo(18 + legSpread, 21, 13 + legSpread * 0.6, 17);
  // Inner arch under belly
  ctx.quadraticCurveTo(6, 6, 0, 6);
  ctx.quadraticCurveTo(-6, 6, -13 - legSpread * 0.6, 17);
  // Left splayed leg foot
  ctx.quadraticCurveTo(-18 - legSpread, 21, -20 - legSpread, 17);
  ctx.quadraticCurveTo(-17, 8, -13, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glossy forehead highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.beginPath();
  ctx.ellipse(-3, -10, 5, 2.2, -0.25, 0, Math.PI * 2);
  ctx.fill();

  // 3 Eyes in a Triangle (1 top center, 2 lower sides)
  const lookX = facing * 0.9;
  drawCartoonEye(ctx, 0, -8, 3.2, lookX, 0);
  drawCartoonEye(ctx, -6.5, -1.5, 3.4, lookX, 0);
  drawCartoonEye(ctx, 6.5, -1.5, 3.4, lookX, 0);

  ctx.restore();
}

/**
 * Double-outlined cartoon triangle craft with bottom plasma pod & swooshing exhaust fin!
 */
export function drawTriangleUfo(ctx, { x, y, w, h, facing = -1, timeSec = 0 }) {
  ctx.save();
  const hover = Math.sin(timeSec * 5.5 + x * 0.02) * 3;
  const cx = x + w / 2;
  const cy = y + h / 2 + hover;

  ctx.translate(cx, cy);

  // Bottom swooshing plasma exhaust plume (pointing opposite facing direction)
  const flicker = 8 + Math.sin(timeSec * 22) * 4;
  ctx.fillStyle = "#fde047";
  ctx.strokeStyle = "#f97316";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(-facing * (14 + flicker), 13);
  ctx.lineTo(-facing * 8, 17);
  ctx.lineTo(-facing * (16 + flicker * 0.7), 20);
  ctx.lineTo(2 * facing, 19);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bottom thruster / blaster pod claw under the triangle
  ctx.fillStyle = "#64748b";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-6, 7);
  ctx.lineTo(0, 21);
  ctx.lineTo(7, 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing blaster core inside bottom pod
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.arc(0.5, 12, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Outer Cartoon Triangle Hull
  ctx.fillStyle = "#38bdf8";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, -21);
  ctx.lineTo(24, 8);
  ctx.lineTo(-24, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Nested Triangle (glowing gold/orange core!)
  const pulse = 0.8 + 0.2 * Math.sin(timeSec * 8);
  ctx.fillStyle = `rgba(250, 204, 21, ${pulse})`;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(14, 4);
  ctx.lineTo(-14, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Dual rocket tanks with rounded tops, side mini-blaster wings, and twin flames!
 */
export function drawTwinJetBooster(ctx, { x, y, w = 28, h = 30, timeSec = 0, recharging = false }) {
  ctx.save();
  if (recharging) {
    ctx.globalAlpha = 0.28;
  }
  const bob = Math.sin(timeSec * 5 + x * 0.05) * 4;
  const cx = x + w / 2;
  const cy = y + h / 2 + bob;

  ctx.translate(cx, cy);
  ctx.rotate(-0.18);

  // Side mini-blaster wing pods
  ctx.fillStyle = "#38bdf8";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.fillRect(-14, -4, 5, 7);
  ctx.strokeRect(-14, -4, 5, 7);
  ctx.fillRect(9, -4, 5, 7);
  ctx.strokeRect(9, -4, 5, 7);

  // Twin bottom rocket flames
  [-5.5, 5.5].forEach((tx, idx) => {
    const fl = 6 + Math.sin(timeSec * 20 + idx * 2) * 3;
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(tx - 4, 9);
    ctx.lineTo(tx, 9 + fl);
    ctx.lineTo(tx + 4, 9);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.moveTo(tx - 2.2, 9);
    ctx.lineTo(tx, 9 + fl * 0.6);
    ctx.lineTo(tx + 2.2, 9);
    ctx.closePath();
    ctx.fill();
  });

  // Center bridge plate
  ctx.fillStyle = "#10b981";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.fillRect(-5, -8, 10, 16);
  ctx.strokeRect(-5, -8, 10, 16);

  // Left & Right Twin Rocket Cylinders with rounded dome caps
  [-6, 6].forEach((tx) => {
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.roundRect(tx - 4.5, -12, 9, 21, [5, 5, 2, 2]);
    ctx.fill();
    ctx.stroke();

    // Emerald fuel stripe
    ctx.fillStyle = "#10b981";
    ctx.fillRect(tx - 3, -3, 6, 7);
  });

  ctx.restore();
}

/**
 * Cartoon square blocks with glowing L- and U-shaped geometric maze corridors!
 */
export function drawMazeBarrier(ctx, { x, y, w, h, hp, maxHp = 3, timeSec = 0 }) {
  ctx.save();
  // Draw stacked cartoon maze squares inside (x, y, w, h)
  const blockCount = Math.max(1, Math.round(h / w));
  const cellH = h / blockCount;

  for (let i = 0; i < blockCount; i++) {
    const bx = x;
    const by = y + i * cellH;

    // Outer cartoon cube
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, cellH, 6);
    ctx.fill();
    ctx.stroke();

    // Inner bevel frame
    const glowColor = hp === 1 ? "#fde047" : hp === 2 ? "#fb923c" : "#f43f5e";
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 3.5, by + 3.5, w - 7, cellH - 7);

    const pulse = 0.75 + 0.25 * Math.sin(timeSec * 8 + i);
    ctx.strokeStyle = `rgba(56, 189, 248, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";

    const mx = bx + 8;
    const my = by + 8;
    const mw = w - 16;
    const mh = cellH - 16;

    ctx.beginPath();
    // Top-left L channel
    ctx.moveTo(mx + mw * 0.28, my);
    ctx.lineTo(mx + mw * 0.28, my + mh * 0.38);
    ctx.lineTo(mx, my + mh * 0.38);

    // Top-right vertical channel
    ctx.moveTo(mx + mw * 0.66, my);
    ctx.lineTo(mx + mw * 0.66, my + mh * 0.45);

    // Bottom-left L channel
    ctx.moveTo(mx, my + mh * 0.68);
    ctx.lineTo(mx + mw * 0.42, my + mh * 0.68);
    ctx.lineTo(mx + mw * 0.42, my + mh);

    // Bottom-right corner turn
    ctx.moveTo(mx + mw, my + mh * 0.65);
    ctx.lineTo(mx + mw * 0.72, my + mh * 0.65);
    ctx.lineTo(mx + mw * 0.72, my + mh);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCartoonEye(ctx, cx, cy, r, pupilDx = 0, pupilDy = 0) {
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(cx + pupilDx, cy + pupilDy, r * 0.48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx + pupilDx - r * 0.16, cy + pupilDy - r * 0.18, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 */
export function drawSkyStar(ctx, { x, y, w = 26, h = 26, timeSec = 0 }) {
  ctx.save();
  const bob = Math.sin(timeSec * 5 + x * 0.05) * 4;
  const wobble = Math.sin(timeSec * 3.5 + x * 0.03) * 0.14;
  const cx = x + w / 2;
  const cy = y + h / 2 + bob;
  const outerR = Math.min(w, h) * 0.52;
  const innerR = outerR * 0.44;

  ctx.translate(cx, cy);
  ctx.rotate(wobble);

  // Soft starlight glow
  ctx.shadowColor = "rgba(250, 204, 21, 0.7)";
  ctx.shadowBlur = 10;

  ctx.fillStyle = "#fde047";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Inner bright star shine
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-outerR * 0.14, -outerR * 0.16, outerR * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 */
export function drawTrampoline(ctx, { x, y, w = 74, h = 20, boingTimer = 0 }) {
  ctx.save();
  const boingOffset = boingTimer > 0 ? Math.sin(boingTimer * 38) * 6 * (boingTimer / 0.45) : 0;
  const padY = y + boingOffset;

  // Base anchor feet
  ctx.fillStyle = "#475569";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.fillRect(x + 6, y + h - 5, w - 12, 5);
  ctx.strokeRect(x + 6, y + h - 5, w - 12, 5);

  // Coiled zig-zag springs
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  [x + 18, x + w / 2, x + w - 18].forEach((sx) => {
    ctx.beginPath();
    ctx.moveTo(sx - 5, y + h - 5);
    ctx.lineTo(sx + 5, (padY + 8 + (y + h - 5)) / 2);
    ctx.lineTo(sx - 5, padY + 8);
    ctx.stroke();
  });

  // Bouncy top mat (bright magenta-cyan neon!)
  ctx.fillStyle = "#f43f5e";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.roundRect(x, padY, w, 9, 5);
  ctx.fill();
  ctx.stroke();

  // Bright bounce chevron stripe
  ctx.fillStyle = "#fde047";
  ctx.fillRect(x + 10, padY + 2.5, w - 20, 3.5);

  ctx.restore();
}

/**
 * Staggered terracotta bricks with mortar lines, cartoon highlights & progressive damage cracks!
 */
export function drawBrickWall(ctx, { x, y, w = 44, h = 88, hp = 4, maxHp = 4 }) {
  ctx.save();

  // Warm mortar backdrop & bold outer cartoon border
  ctx.fillStyle = "#cbd5e1";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fill();
  ctx.stroke();

  // Clip inner brick courses cleanly inside outer border
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 2);
  ctx.clip();

  const rows = Math.max(4, Math.round(h / 14));
  const rowH = (h - 4) / rows;
  const brickPalette = ["#dc2626", "#ea580c", "#b91c1c", "#c2410c"];
  const gap = 2.4;

  for (let r = 0; r < rows; r++) {
    const ry = y + 2 + r * rowH;
    const offset = r % 2 === 0 ? 0 : -w * 0.28;
    const brickW = w * 0.54;

    for (let c = 0; c < 3; c++) {
      const bx = x + 2 + offset + c * (brickW + gap);
      const drawX = bx;
      const drawY = ry + gap * 0.5;
      const drawW = brickW;
      const drawH = Math.max(4, rowH - gap);

      if (drawX + drawW < x || drawX > x + w) continue;

      const tone = brickPalette[(r * 3 + c) % brickPalette.length];
      ctx.fillStyle = tone;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.fillRect(drawX, drawY, drawW, drawH);
      ctx.strokeRect(drawX, drawY, drawW, drawH);

      // Cartoon top highlight strip on each brick
      ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
      ctx.fillRect(drawX + 1.5, drawY + 1.5, Math.max(2, drawW - 3), 2.2);
    }
  }

  // Progressive cartoon cracks as the wall takes laser hits!
  const damageRatio = 1 - hp / Math.max(1, maxHp);
  if (damageRatio > 0.05) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.22, y + h * 0.18);
    ctx.lineTo(x + w * 0.48, y + h * 0.34);
    ctx.lineTo(x + w * 0.35, y + h * 0.52);
    if (damageRatio >= 0.45) {
      ctx.lineTo(x + w * 0.68, y + h * 0.68);
      ctx.lineTo(x + w * 0.52, y + h * 0.86);
      ctx.moveTo(x + w * 0.78, y + h * 0.26);
      ctx.lineTo(x + w * 0.48, y + h * 0.34);
    }
    ctx.stroke();

    if (hp <= 1) {
      // Glowing unstable crack right before crumbling!
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
  }

  ctx.restore();

  // Re-stroke crisp outer frame over clipped bricks
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.stroke();

  ctx.restore();
}

/**
 * Stands on a launchpad; when pilot boards, they appear looking out the porthole window & blast into the sky!
 */
export function drawEscapeRocket(
  ctx,
  {
    x,
    y,
    w = 68,
    h = 108,
    locked = false,
    bossName = "KALIGATER",
    pilotInside = null,
    launchOffsetY = 0,
    isLaunching = false,
    timeSec = 0,
  }
) {
  ctx.save();
  const cx = x + w / 2;
  const bottomY = y + h;
  const rumbleAmt = isLaunching ? 2.6 : !locked ? 1.2 : 0;
  const rumbleX = rumbleAmt ? Math.sin(timeSec * 44) * rumbleAmt : 0;

  // Fixed steel launchpad deck on the ground
  ctx.fillStyle = "#334155";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x - 6, bottomY - 8, w + 12, 8, 3);
  ctx.fill();
  ctx.stroke();

  // Hazard yellow stripes on launchpad
  ctx.fillStyle = "#facc15";
  ctx.fillRect(x + 2, bottomY - 6, 10, 4);
  ctx.fillRect(x + w - 12, bottomY - 6, 10, 4);

  // Translate the Rocket Ship itself upward during liftoff!
  const rocketBaseY = bottomY - 8 - launchOffsetY;
  ctx.save();
  ctx.translate(cx + rumbleX, rocketBaseY);

  // Ignition / Liftoff rocket exhaust plume!
  if (!locked) {
    const baseFlame = isLaunching ? 46 : 12;
    const fl = baseFlame + Math.sin(timeSec * 30) * (isLaunching ? 14 : 4);
    const outerW = isLaunching ? 19 : 11;

    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.moveTo(-outerW, -3);
    ctx.lineTo(0, fl + 8);
    ctx.lineTo(outerW, -3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(-outerW * 0.68, -3);
    ctx.lineTo(0, fl * 0.75);
    ctx.lineTo(outerW * 0.68, -3);
    ctx.closePath();
    ctx.fill();

    if (isLaunching) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(-6, -3);
      ctx.lineTo(0, fl * 0.42);
      ctx.lineTo(6, -3);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Side delta fins (Left & Right)
  ctx.fillStyle = locked ? "#be123c" : "#ef4444";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.lineJoin = "round";
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 15, -36);
    ctx.lineTo(side * 31, -8);
    ctx.lineTo(side * 26, 0);
    ctx.lineTo(side * 12, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // Engine bell nozzle
  ctx.fillStyle = "#475569";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-10, -10);
  ctx.lineTo(-15, 0);
  ctx.lineTo(15, 0);
  ctx.lineTo(10, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Main sleek cartoon rocket fuselage
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(0, -96);
  ctx.bezierCurveTo(24, -72, 23, -34, 16, -9);
  ctx.lineTo(-16, -9);
  ctx.bezierCurveTo(-23, -34, -24, -72, 0, -96);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red nose cone cap & hull trim (clipped to hull)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, -96);
  ctx.bezierCurveTo(24, -72, 23, -34, 16, -9);
  ctx.lineTo(-16, -9);
  ctx.bezierCurveTo(-23, -34, -24, -72, 0, -96);
  ctx.closePath();
  ctx.clip();

  ctx.fillStyle = locked ? "#be123c" : "#ef4444";
  ctx.fillRect(-26, -100, 52, 30);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-24, -70);
  ctx.quadraticCurveTo(0, -64, 24, -70);
  ctx.stroke();

  // Racing accent band near tail
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(-22, -21, 44, 6);

  // Glossy left fuselage highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.beginPath();
  ctx.ellipse(-9, -46, 3, 16, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Re-stroke hull outline crisply
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(0, -96);
  ctx.bezierCurveTo(24, -72, 23, -34, 16, -9);
  ctx.lineTo(-16, -9);
  ctx.bezierCurveTo(-23, -34, -24, -72, 0, -96);
  ctx.closePath();
  ctx.stroke();

  const winY = -46;
  const winOuterR = 13.5;
  const winInnerR = 10.6;

  ctx.fillStyle = "#94a3b8";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, winY, winOuterR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cabin interior clipped inside porthole glass
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, winY, winInnerR, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = locked ? "#334155" : pilotInside ? "#0f172a" : "#bae6fd";
  ctx.fillRect(-winInnerR - 2, winY - winInnerR - 2, winInnerR * 2 + 4, winInnerR * 2 + 4);

  if (pilotInside) {
    // Draw Pilot inside cabin looking right out of the window & waving!
    const bob = Math.sin(timeSec * 14) * 1.1;

    // Suit shoulders at bottom of window
    ctx.fillStyle = pilotInside.suitPrimary;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-8, winY + 4 + bob, 16, 9, 4);
    ctx.fill();
    ctx.stroke();

    // Helmet looking out window
    ctx.fillStyle = pilotInside.suitPrimary;
    ctx.beginPath();
    ctx.roundRect(-7.5, winY - 8 + bob, 15, 13, 6);
    ctx.fill();
    ctx.stroke();

    // Helmet antenna tip peeking up
    ctx.fillStyle = pilotInside.trimColor;
    ctx.beginPath();
    ctx.arc(0, winY - 9.2 + bob, 2, 0, Math.PI * 2);
    ctx.fill();

    // Front-facing glowing visor looking out at the player!
    ctx.fillStyle = pilotInside.visorColor;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-5.2, winY - 4.8 + bob, 10.4, 6.4, 3);
    ctx.fill();
    ctx.stroke();

    // Visor shine
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.fillRect(-3.4, winY - 3.6 + bob, 4.2, 1.8);

    // Little waving glove!
    const waveY = winY + 2 + Math.sin(timeSec * 18) * 2.2;
    ctx.fillStyle = pilotInside.trimColor;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(7.2, waveY, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Empty window reflection
    ctx.fillStyle = locked ? "#475569" : "#38bdf8";
    ctx.fillRect(-winInnerR, winY - winInnerR, winInnerR * 2, winInnerR * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.arc(-3.5, winY - 3.5, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Crisp inner window rim stroke
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, winY, winInnerR, 0, Math.PI * 2);
  ctx.stroke();

  // Security lock clamp across rocket when Boss Kaligater is still alive!
  if (locked) {
    ctx.fillStyle = "#f43f5e";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-22, -29, 44, 9, 4);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();

  // Overhead status banner (tracks rocket upward as it blasts off!)
  const bannerY = y - 10 - launchOffsetY;
  if (bannerY > -24) {
    ctx.fillStyle = locked ? "#fecdd3" : "#fde047";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.font = "800 12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    const labelText = isLaunching && pilotInside
      ? `🚀 BLAST OFF!`
      : locked
        ? `🔒 BEAT ${bossName.toUpperCase()}!`
        : "🚀 BOARD ROCKET!";
    ctx.strokeText(labelText, cx, bannerY);
    ctx.fillText(labelText, cx, bannerY);
  }

  ctx.restore();
}

/**
 * 6-wheel space rover with camera mast, solar trim, spinning knobby tires, and a big cab window
 */
export function drawMarsRover(
  ctx,
  {
    x,
    y,
    w = 112,
    h = 70,
    pilotInside = null,
    driveOffsetX = 0,
    wheelSpinOffset = null,
    isDriving = false,
    showParkingPad = true,
    bannerText = undefined,
    timeSec = 0,
  }
) {
  ctx.save();
  const groundY = y + h;
  const rx = x + driveOffsetX;
  const spinDist = wheelSpinOffset !== null ? wheelSpinOffset : driveOffsetX;
  const wheelR = 12.5;
  const wheelCy = groundY - wheelR;
  const bounceY = isDriving
    ? Math.sin(spinDist * 0.16 + timeSec * 22) * 1.8
    : Math.sin(timeSec * 4) * 0.5;

  // Fixed Rover Parking Pad Stripes on the ground at goal parking spot
  if (showParkingPad) {
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(x - 4, groundY - 5, w + 8, 5, 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#facc15";
    ctx.fillRect(x + 6, groundY - 4, 14, 3);
    ctx.fillRect(x + w - 20, groundY - 4, 14, 3);
  }

  // Translate to moving Rover chassis
  ctx.save();
  ctx.translate(rx, bounceY);

  // Warm Headlight Beam shining right!
  const beamAlpha = isDriving ? 0.34 : 0.18;
  const beamGrad = ctx.createLinearGradient(w - 4, groundY - 34, w + 88, groundY - 22);
  beamGrad.addColorStop(0, `rgba(254, 240, 138, ${beamAlpha})`);
  beamGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(w - 6, groundY - 36);
  ctx.lineTo(w + 88, groundY - 54);
  ctx.lineTo(w + 88, groundY - 8);
  ctx.lineTo(w - 6, groundY - 24);
  ctx.closePath();
  ctx.fill();

  // Rear turbo booster flame when driving!
  if (isDriving && spinDist > 2) {
    const fl = 14 + Math.sin(timeSec * 32) * 5;
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(6, groundY - 32);
    ctx.lineTo(-fl, groundY - 27);
    ctx.lineTo(6, groundY - 22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.moveTo(6, groundY - 30);
    ctx.lineTo(-fl * 0.6, groundY - 27);
    ctx.lineTo(6, groundY - 24);
    ctx.closePath();
    ctx.fill();
  }

  // Rear exhaust muffler nozzle
  ctx.fillStyle = "#475569";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(1, groundY - 33, 10, 9, 3);
  ctx.fill();
  ctx.stroke();

  // Top Mars Camera / Radar Mast on rear deck
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(26, groundY - 46);
  ctx.lineTo(23, groundY - 64);
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Camera head + blinking Mars sensor eye
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(16, groundY - 70, 16, 9, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = Math.floor(timeSec * 5) % 2 === 0 ? "#ef4444" : "#38bdf8";
  ctx.beginPath();
  ctx.arc(28, groundY - 65.5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Rocker-bogie suspension struts connecting chassis to the 3 wheels
  const wheelOffsets = [20, 56, 92];
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  wheelOffsets.forEach((wx) => {
    ctx.beginPath();
    ctx.moveTo(wx, groundY - 24);
    ctx.lineTo(wx, wheelCy - bounceY);
    ctx.stroke();
  });

  // Main Mars Rover Armored Hull (crisp white + Mars orange racing stripe!)
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(10, groundY - 20);
  ctx.lineTo(10, groundY - 44);
  ctx.lineTo(36, groundY - 46);
  ctx.lineTo(46, groundY - 58);
  ctx.lineTo(84, groundY - 58);
  ctx.lineTo(102, groundY - 38);
  ctx.lineTo(106, groundY - 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mars Rover Orange-Gold Lower Stripe & Solar Roof Rack
  ctx.fillStyle = "#f97316";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(11, groundY - 29, 94, 9, 3);
  ctx.fill();
  ctx.stroke();

  // Blue Solar Panel strip on rear deck
  ctx.fillStyle = "#0284c7";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(13, groundY - 48, 25, 6, 2);
  ctx.fill();
  ctx.stroke();

  // Front LED Headlight lamp
  ctx.fillStyle = "#fef08a";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(100, groundY - 36, 7, 9, 3);
  ctx.fill();
  ctx.stroke();

  // Big Panoramic Cab Window (shows Pilot sitting inside driving & waving!)
  const winX = 47;
  const winY = groundY - 54;
  const winW = 46;
  const winH = 23;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(winX, winY + winH);
  ctx.lineTo(winX + 4, winY);
  ctx.lineTo(winX + 33, winY);
  ctx.lineTo(winX + winW, winY + 13);
  ctx.lineTo(winX + winW, winY + winH);
  ctx.closePath();
  ctx.fillStyle = pilotInside ? "#0f172a" : "#bae6fd";
  ctx.fill();
  ctx.clip();

  // Steering wheel inside right side of cab
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(winX + 38, winY + winH);
  ctx.lineTo(winX + 33, winY + 13);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(winX + 32, winY + 12, 4, 0, Math.PI * 2);
  ctx.stroke();

  if (pilotInside) {
    const bob = Math.sin(timeSec * 15) * 0.9;
    const px = winX + 19;
    const py = winY + 13 + bob;

    // Pilot suit torso
    ctx.fillStyle = pilotInside.suitPrimary;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(px - 8, py + 2, 16, 11, 4);
    ctx.fill();
    ctx.stroke();

    // Pilot helmet facing right toward the road!
    ctx.fillStyle = pilotInside.suitPrimary;
    ctx.beginPath();
    ctx.roundRect(px - 7.5, py - 10, 15, 13, 6);
    ctx.fill();
    ctx.stroke();

    // Antenna tip
    ctx.fillStyle = pilotInside.trimColor;
    ctx.beginPath();
    ctx.arc(px - 1, py - 11.2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Glowing visor looking forward-right!
    ctx.fillStyle = pilotInside.visorColor;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(px - 2, py - 7, 9.5, 6.2, 3);
    ctx.fill();
    ctx.stroke();

    // Visor shine
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.fillRect(px - 0.5, py - 5.8, 4, 1.7);

    // Glove holding the rover steering wheel / waving!
    ctx.fillStyle = pilotInside.trimColor;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(winX + 31, winY + 13 + Math.sin(timeSec * 16) * 1.2, 2.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Glossy empty cab glass reflection
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(winX, winY, winW, winH);
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.beginPath();
    ctx.moveTo(winX + 8, winY + winH);
    ctx.lineTo(winX + 16, winY);
    ctx.lineTo(winX + 23, winY);
    ctx.lineTo(winX + 15, winY + winH);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Cab window crisp cartoon border
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(winX, winY + winH);
  ctx.lineTo(winX + 4, winY);
  ctx.lineTo(winX + 33, winY);
  ctx.lineTo(winX + winW, winY + 13);
  ctx.lineTo(winX + winW, winY + winH);
  ctx.closePath();
  ctx.stroke();

  ctx.restore(); // End chassis bounce transform

  // Draw 3 Spinning Knobby Mars Rover Wheels on the ground!
  const wheelSpin = spinDist * 0.085;
  wheelOffsets.forEach((wx) => {
    ctx.save();
    ctx.translate(rx + wx, wheelCy);
    ctx.rotate(wheelSpin);

    // Knobby outer rubber tire
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tire treads around circumference
    ctx.fillStyle = "#475569";
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (wheelR - 2), Math.sin(a) * (wheelR - 2), 2.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mars orange alloy hubcap + spokes so rotation is clearly visible!
    ctx.fillStyle = "#fb923c";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, 6.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-5.5, 0);
    ctx.lineTo(5.5, 0);
    ctx.moveTo(0, -5.5);
    ctx.lineTo(0, 5.5);
    ctx.stroke();

    ctx.restore();
  });

  // Overhead status callout banner (tracks Rover as it drives!)
  const resolvedBanner =
    bannerText !== undefined
      ? bannerText
      : isDriving && pilotInside
        ? `🚙 ROVER AWAY!`
        : "🚙 HOP IN MARS ROVER!";

  if (resolvedBanner) {
    const bannerX = Math.max(88, rx + w / 2);
    const bannerY = y - 10;
    ctx.fillStyle = "#fde047";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.font = "800 12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText(resolvedBanner, bannerX, bannerY);
    ctx.fillText(resolvedBanner, bannerX, bannerY);
  }

  ctx.restore();
}

/**
 * Stacked icy-cyan faceted diamond blocks with crystalline bevels, twinkling 4-point star glints,
 * and progressive laser fracture lines!
 */
export function drawDiamondWall(ctx, { x, y, w = 42, h = 88, hp = 4, maxHp = 4, timeSec = 0 }) {
  ctx.save();

  // Soft icy diamond aura glow
  ctx.shadowColor = "rgba(34, 211, 238, 0.55)";
  ctx.shadowBlur = 10;

  // Outer cartoon border
  ctx.fillStyle = "#0891b2";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 5);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw 2 stacked faceted cartoon diamond blocks inside (x, y, w, h)
  const blockCount = Math.max(2, Math.round(h / 44));
  const cellH = h / blockCount;

  for (let i = 0; i < blockCount; i++) {
    const bx = x + 2;
    const by = y + i * cellH + 2;
    const bw = w - 4;
    const bh = cellH - 4;
    const cx = bx + bw / 2;
    const cy = by + bh / 2;
    const inset = 7;

    // Top-left bright icy highlight bevel
    ctx.fillStyle = "#a5f3fc";
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw - inset, by + inset);
    ctx.lineTo(bx + inset, by + inset);
    ctx.lineTo(bx + inset, by + bh - inset);
    ctx.lineTo(bx, by + bh);
    ctx.closePath();
    ctx.fill();

    // Bottom-right deep sapphire-cyan shadow bevel
    ctx.fillStyle = "#0e7490";
    ctx.beginPath();
    ctx.moveTo(bx + bw, by);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + inset, by + bh - inset);
    ctx.lineTo(bx + bw - inset, by + bh - inset);
    ctx.lineTo(bx + bw - inset, by + inset);
    ctx.closePath();
    ctx.fill();

    // Inner bright turquoise crystal table
    const shimmer = 0.88 + 0.12 * Math.sin(timeSec * 6 + i * 1.7);
    ctx.fillStyle = `rgba(34, 211, 238, ${shimmer})`;
    ctx.strokeStyle = "#ecfeff";
    ctx.lineWidth = 1.4;
    ctx.fillRect(bx + inset, by + inset, bw - inset * 2, bh - inset * 2);
    ctx.strokeRect(bx + inset, by + inset, bw - inset * 2, bh - inset * 2);

    // Crisp diagonal facet corner lines
    ctx.strokeStyle = "#0e7490";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + inset, by + inset);
    ctx.moveTo(bx + bw, by);
    ctx.lineTo(bx + bw - inset, by + inset);
    ctx.moveTo(bx, by + bh);
    ctx.lineTo(bx + inset, by + bh - inset);
    ctx.moveTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw - inset, by + bh - inset);
    ctx.stroke();

    // Center cut-diamond gem emblem inside each block!
    const gemW = Math.min(10, bw * 0.28);
    const gemH = Math.min(12, bh * 0.3);
    ctx.fillStyle = "#ecfeff";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx, cy - gemH);
    ctx.lineTo(cx + gemW, cy);
    ctx.lineTo(cx, cy + gemH);
    ctx.lineTo(cx - gemW, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner sky-blue gem facet
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(cx, cy - gemH * 0.55);
    ctx.lineTo(cx + gemW * 0.55, cy);
    ctx.lineTo(cx, cy + gemH * 0.55);
    ctx.lineTo(cx - gemW * 0.55, cy);
    ctx.closePath();
    ctx.fill();

    // Divider seam between stacked diamond blocks
    if (i > 0) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x + 1, y + i * cellH);
      ctx.lineTo(x + w - 1, y + i * cellH);
      ctx.stroke();
    }
  }

  // Twinkling 4-point white diamond sparkles!
  const sparkles = [
    { sx: x + w * 0.24, sy: y + h * 0.18, phase: 0 },
    { sx: x + w * 0.78, sy: y + h * 0.44, phase: 2.1 },
    { sx: x + w * 0.28, sy: y + h * 0.74, phase: 4.2 },
  ];
  sparkles.forEach((sp) => {
    const s = 2.5 + Math.max(0, Math.sin(timeSec * 7 + sp.phase)) * 3.2;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(sp.sx, sp.sy - s);
    ctx.lineTo(sp.sx + s * 0.32, sp.sy - s * 0.32);
    ctx.lineTo(sp.sx + s, sp.sy);
    ctx.lineTo(sp.sx + s * 0.32, sp.sy + s * 0.32);
    ctx.lineTo(sp.sx, sp.sy + s);
    ctx.lineTo(sp.sx - s * 0.32, sp.sy + s * 0.32);
    ctx.lineTo(sp.sx - s, sp.sy);
    ctx.lineTo(sp.sx - s * 0.32, sp.sy - s * 0.32);
    ctx.closePath();
    ctx.fill();
  });

  // Progressive fracture lines as lasers chip the diamond!
  const damageRatio = 1 - hp / Math.max(1, maxHp);
  if (damageRatio > 0.05) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2, y + h * 0.22);
    ctx.lineTo(x + w * 0.54, y + h * 0.38);
    ctx.lineTo(x + w * 0.36, y + h * 0.56);
    if (damageRatio >= 0.45) {
      ctx.lineTo(x + w * 0.72, y + h * 0.72);
      ctx.lineTo(x + w * 0.48, y + h * 0.88);
      ctx.moveTo(x + w * 0.8, y + h * 0.28);
      ctx.lineTo(x + w * 0.54, y + h * 0.38);
    }
    ctx.stroke();

    if (hp <= 1) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
  }

  // Crisp outer cartoon frame
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 5);
  ctx.stroke();

  ctx.restore();
}

/**
 * Round glowing coral-gold alien surrounded by 10 undulating wavy flame/tentacle rays,
 * two cartoon eyes, and a squiggly mouth!
 */
export function drawSolarWobbler(ctx, { x, y, w = 48, h = 48, facing = -1, timeSec = 0, hurtFlash = false }) {
  ctx.save();
  const bob = Math.sin(timeSec * 5.5 + x * 0.04) * 3.5;
  const cx = x + w / 2;
  const cy = y + h / 2 + bob;
  ctx.translate(cx, cy);

  // 10 Wavy Sunburst Tentacle Rays radiating around the body
  const rayCount = 10;
  for (let i = 0; i < rayCount; i++) {
    const baseAngle = (i * Math.PI * 2) / rayCount + Math.sin(timeSec * 2.2) * 0.12;
    const wave = Math.sin(timeSec * 9 + i * 1.3) * 4.2;
    ctx.save();
    ctx.rotate(baseAngle);

    ctx.fillStyle = hurtFlash ? "#ffffff" : i % 2 === 0 ? "#fb923c" : "#facc15";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.1;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-4, 11);
    ctx.quadraticCurveTo(-5 + wave * 0.6, 18, -2.5 + wave, 24.5);
    ctx.arc(0 + wave, 25, 2.6, Math.PI, 0, true);
    ctx.quadraticCurveTo(5 + wave * 0.6, 18, 4, 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Round Core Alien Body
  ctx.fillStyle = hurtFlash ? "#fef08a" : "#f97316";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Warm glossy highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
  ctx.beginPath();
  ctx.ellipse(-4, -6, 5, 2.5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Two cartoon eyes
  const lookX = facing * 1.1;
  drawCartoonEye(ctx, -4.8, -3.2, 3.6, lookX, 0);
  drawCartoonEye(ctx, 4.8, -3.2, 3.6, lookX, 0);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-7.5, 5.2);
  ctx.quadraticCurveTo(-5, 2.5, -2.5, 5.2);
  ctx.quadraticCurveTo(0, 7.9, 2.5, 5.2);
  ctx.quadraticCurveTo(5, 2.5, 7.5, 5.2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Sharp cartoon diamond/kite body: upper triangle has two big eyes, lower triangle has a
 * triangular fang-filled mouth, X-claw side arms, and nimble little legs!
 */
export function drawDiamondFang(
  ctx,
  { x, y, w = 48, h = 54, facing = -1, timeSec = 0, hurtFlash = false, isChaser = false }
) {
  ctx.save();
  const bounce = Math.abs(Math.sin(timeSec * (isChaser ? 12 : 8) + x * 0.03)) * 3.5;
  const cx = x + w / 2;
  const cy = y + h / 2 - bounce * 0.5;
  ctx.translate(cx, cy);

  const armWave = Math.sin(timeSec * 12) * 4;

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  [-1, 1].forEach((side) => {
    const ax0 = side * 12;
    const ay0 = -5;
    const ax1 = side * 22;
    const ay1 = -11 + side * armWave * 0.5;
    ctx.beginPath();
    ctx.moveTo(ax0, ay0);
    ctx.lineTo(ax1, ay1);
    // Forked X-claw tips
    ctx.moveTo(ax1 - 3, ay1 - 3.5);
    ctx.lineTo(ax1 + 3, ay1 + 3.5);
    ctx.moveTo(ax1 + 3, ay1 - 3.5);
    ctx.lineTo(ax1 - 3, ay1 + 3.5);
    ctx.stroke();
  });

  // Little lower kite legs
  const step = Math.sin(timeSec * 14) * 2.5;
  ctx.beginPath();
  ctx.moveTo(-5, 16);
  ctx.lineTo(-9, 24 + step);
  ctx.moveTo(5, 16);
  ctx.lineTo(9, 24 - step);
  ctx.stroke();

  // Main Diamond / Kite Body (Top + Bottom triangles with equator crease)
  const bodyColor = hurtFlash ? "#ffffff" : isChaser ? "#f43f5e" : "#a3e635";
  const lowerShade = hurtFlash ? "#fde047" : isChaser ? "#e11d48" : "#65a30d";

  // Top Triangle
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.lineTo(18, -2);
  ctx.lineTo(-18, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bottom Inverted Triangle
  ctx.fillStyle = lowerShade;
  ctx.beginPath();
  ctx.moveTo(-18, -2);
  ctx.lineTo(18, -2);
  ctx.lineTo(0, 25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Two Eyes in Upper Triangle
  const lookX = facing * 1.1;
  drawCartoonEye(ctx, -5, -9.5, 3.8, lookX, 0);
  drawCartoonEye(ctx, 5, -9.5, 3.8, lookX, 0);

  // Big Triangular Mouth in Lower Triangle with Jagged Fang Teeth!
  ctx.fillStyle = "#4c0519";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-11, 2);
  ctx.lineTo(11, 2);
  ctx.lineTo(0, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sharp White Zig-Zag Teeth inside triangular mouth
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(-9, 2.5);
  ctx.lineTo(-5.5, 8);
  ctx.lineTo(-2, 2.5);
  ctx.lineTo(1.5, 8);
  ctx.lineTo(5, 2.5);
  ctx.lineTo(8.5, 7.5);
  ctx.lineTo(9.5, 2.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Compact round alien ringed by 14 spiky flower/urchin petals, a horizontal face stripe,
 * two eyes on top, and a round "o" mouth!
 */
export function drawPetalUrchin(ctx, { x, y, w = 44, h = 44, facing = -1, timeSec = 0, hurtFlash = false }) {
  ctx.save();
  const spinWobble = Math.sin(timeSec * 7 + x * 0.05) * 0.14;
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.translate(cx, cy);

  // 14 Cartoon Petal Spikes around circumference
  const petals = 14;
  ctx.save();
  ctx.rotate(spinWobble);
  for (let i = 0; i < petals; i++) {
    const a = (i * Math.PI * 2) / petals;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = hurtFlash ? "#ffffff" : i % 2 === 0 ? "#f472b6" : "#c084fc";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3.5, 10);
    ctx.quadraticCurveTo(-5, 18, 0, 21);
    ctx.quadraticCurveTo(5, 18, 3.5, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // Round Center Head
  ctx.fillStyle = hurtFlash ? "#fef08a" : "#ec4899";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#38bdf8";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-11.2, -2, 22.4, 4.5, 2);
  ctx.fill();
  ctx.stroke();

  // Two Eyes above the band
  const lookX = facing * 0.9;
  drawCartoonEye(ctx, -4.2, -5.8, 3.0, lookX, 0);
  drawCartoonEye(ctx, 4.2, -5.8, 3.0, lookX, 0);

  // Little round "O" mouth below the band!
  ctx.fillStyle = "#0f172a";
  ctx.strokeStyle = "#fde047";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(facing * 1.2, 6.2, 2.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Cross-domed 4-eyed sky jellyfish/squid with a V-pincer claw arm on the left,
 * a tall feeler tentacle on the right, and 4 long undulating tentacles below!
 */
export function drawTentacleJelly(ctx, { x, y, w = 58, h = 68, facing = -1, timeSec = 0, hurtFlash = false }) {
  ctx.save();
  const hover = Math.sin(timeSec * 4.8 + x * 0.03) * 4.5;
  const cx = x + w / 2;
  const cy = y + 24 + hover;
  ctx.translate(cx, cy);

  // 4 Flowing Lower Ribbon Tentacles
  const tentacleXs = [-11, -3.5, 4, 11.5];
  tentacleXs.forEach((tx, idx) => {
    const sw1 = Math.sin(timeSec * 7 + idx * 1.4) * 6;
    const sw2 = Math.cos(timeSec * 6 + idx * 1.9) * 7;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tx, 7);
    ctx.bezierCurveTo(tx + sw1, 18, tx - sw2, 28, tx + sw1 * 0.7, 38);
    ctx.stroke();

    ctx.strokeStyle = hurtFlash ? "#ffffff" : idx % 2 === 0 ? "#22d3ee" : "#a855f7";
    ctx.lineWidth = 3.2;
    ctx.stroke();
  });

  const clawWave = Math.sin(timeSec * 6) * 3.5;
  ctx.fillStyle = hurtFlash ? "#ffffff" : "#22d3ee";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-17, 2);
  ctx.quadraticCurveTo(-26, -2, -27, -14 + clawWave);
  ctx.lineTo(-23, -8 + clawWave);
  ctx.lineTo(-19, -15 + clawWave);
  ctx.quadraticCurveTo(-18, -4, -14, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const whipWave = Math.cos(timeSec * 6.5) * 4.5;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(16, 3);
  ctx.bezierCurveTo(26, 2, 27 + whipWave, -12, 22 + whipWave * 0.6, -24);
  ctx.stroke();
  ctx.strokeStyle = hurtFlash ? "#ffffff" : "#38bdf8";
  ctx.lineWidth = 2.8;
  ctx.stroke();

  // Cross-Shaped Tri-Lobe Dome Head!
  const domeFill = hurtFlash ? "#fef08a" : "#06b6d4";
  ctx.fillStyle = domeFill;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;

  // Left & Right Horizontal Ear Lobes
  ctx.beginPath();
  ctx.roundRect(-22, -7, 44, 15, 8);
  ctx.fill();
  ctx.stroke();

  // Tall Vertical Top Dome Lobe
  ctx.beginPath();
  ctx.roundRect(-9, -23, 18, 31, [10, 10, 4, 4]);
  ctx.fill();
  ctx.stroke();

  // Center Face Panel Square
  ctx.fillStyle = hurtFlash ? "#ffffff" : "#67e8f9";
  ctx.beginPath();
  ctx.roundRect(-8.5, -6.5, 17, 14, 3);
  ctx.fill();
  ctx.stroke();

  // 4 Eyes (Top Dome Eye, Left Lobe Eye, Right Lobe Eye, and Center Bullseye Eye!)
  const lookX = facing * 0.8;
  drawCartoonEye(ctx, 0, -14.5, 3.3, lookX, 0);
  drawCartoonEye(ctx, -15, 0.5, 3.0, lookX, 0);
  drawCartoonEye(ctx, 15, 0.5, 3.0, lookX, 0);
  // Center Ringed Bullseye Eye
  drawCartoonEye(ctx, 0, 0.5, 4.2, lookX, 0);

  ctx.restore();
}

/**
 * Massive wide rectangular boss with twin bulb antennas, heavy hooded menacing eyes,
 * giant crescent mouth packed with two rows of sharp zig-zag teeth, waving side arms & wide legs!
 */
export function drawSnooloBoss(
  ctx,
  { x, y, w = 184, h = 166, facing = -1, timeSec = 0, hurtFlash = false, jumpState = "PATROL" }
) {
  ctx.save();
  const isCrouching = jumpState === "CROUCH";
  const isAirborne = jumpState === "AIR";
  const stomp = isAirborne || isCrouching ? 0 : Math.abs(Math.sin(timeSec * 6.5)) * 4;
  const cx = x + w / 2;
  const bodyW = 148;
  const bodyH = 96;
  const bodyX = -bodyW / 2;
  const bodyY = -28 - stomp;

  const jitterX = isCrouching ? Math.sin(timeSec * 52) * 3.5 : 0;
  ctx.translate(cx + jitterX, y + h * 0.52 + (isCrouching ? 10 : 0));
  if (isCrouching) {
    ctx.scale(1.11, 0.87);
  } else if (isAirborne) {
    ctx.scale(0.96, 1.06);
  }

  // Boss Aura Glow
  ctx.shadowColor = "rgba(244, 63, 94, 0.45)";
  ctx.shadowBlur = 18;

  // Crouch / Jump Warning Callout!
  if (isCrouching) {
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fde047";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.font = "900 14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText("💢 SNOOLO JUMP!", 0, bodyY - 38);
    ctx.fillText("💢 SNOOLO JUMP!", 0, bodyY - 38);
    ctx.restore();
  }

  // Wide-Stance Angled Cartoon Legs underneath rectangle
  const legSwing = Math.sin(timeSec * 6.5) * 6;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-36, bodyY + bodyH - 4);
  ctx.lineTo(-56 + legSwing, 74);
  ctx.moveTo(36, bodyY + bodyH - 4);
  ctx.lineTo(56 - legSwing, 74);
  ctx.stroke();

  ctx.strokeStyle = hurtFlash ? "#ffffff" : "#fb7185";
  ctx.lineWidth = 3.8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Outstretched Side Cartoon Arms (waving menacingly!)
  const armWave = Math.sin(timeSec * 8) * 7;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(bodyX + 2, bodyY + 52);
  ctx.lineTo(bodyX - 24, bodyY + 38 + armWave);
  ctx.moveTo(bodyX + bodyW - 2, bodyY + 52);
  ctx.lineTo(bodyX + bodyW + 24, bodyY + 38 - armWave);
  ctx.stroke();

  ctx.strokeStyle = hurtFlash ? "#ffffff" : "#f43f5e";
  ctx.lineWidth = 3.4;
  ctx.stroke();

  [-1, 1].forEach((side, idx) => {
    const baseX = side * 26;
    const baseY = bodyY + 2;
    const tipX = side * 38 + Math.sin(timeSec * 7 + idx * 2) * 3;
    const tipY = bodyY - 28;

    ctx.strokeStyle = INK;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Glowing Plasma Antenna Orb
    const orbPulse = 8.5 + Math.sin(timeSec * 12 + idx) * 1.5;
    ctx.fillStyle = hurtFlash ? "#ffffff" : "#fde047";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(tipX, tipY, orbPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Golden Boss Crown centered between Snoolo's antennas!
  ctx.fillStyle = "#facc15";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-16, bodyY + 2);
  ctx.lineTo(-19, bodyY - 14);
  ctx.lineTo(-8, bodyY - 6);
  ctx.lineTo(0, bodyY - 18);
  ctx.lineTo(8, bodyY - 6);
  ctx.lineTo(19, bodyY - 14);
  ctx.lineTo(16, bodyY + 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // GIANT Wide Rectangular Body (Snoolo's signature boxy silhouette!)
  const bodyGrad = ctx.createLinearGradient(0, bodyY, 0, bodyY + bodyH);
  if (hurtFlash) {
    bodyGrad.addColorStop(0, "#fef08a");
    bodyGrad.addColorStop(1, "#ffffff");
  } else {
    bodyGrad.addColorStop(0, "#e11d48");
    bodyGrad.addColorStop(1, "#881337");
  }
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(bodyX, bodyY, bodyW, bodyH, 8);
  ctx.fill();
  ctx.stroke();

  // Inner bevel highlight along top edge of rectangle
  ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
  ctx.fillRect(bodyX + 5, bodyY + 4, bodyW - 10, 6);

  // Two HUGE Heavy-Lidded / Hooded Menacing Eyes hanging from top edge of rectangle!
  [-36, 36].forEach((ex) => {
    const ey = bodyY + 18;
    const ew = 25;
    const eh = 19;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(ex, ey + 4, ew, eh, 0, 0, Math.PI);
    ctx.lineTo(ex - ew, bodyY + 2);
    ctx.lineTo(ex + ew, bodyY + 2);
    ctx.closePath();
    ctx.fillStyle = "#fef2f2";
    ctx.fill();
    ctx.clip();

    // Big Fierce Dark Iris tracking the player!
    const px = ex + facing * 5.5;
    const py = ey + 10;
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.ellipse(px, py, 15, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing fiery red-gold pupil glint
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(px + facing * 2.5, py, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(px - 4, py - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Angry Upper Eyelid Droop
    ctx.fillStyle = hurtFlash ? "#fde047" : "#9f1239";
    ctx.fillRect(ex - ew - 2, bodyY, ew * 2 + 4, 13);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(ex - ew - 2, bodyY + 13);
    ctx.quadraticCurveTo(ex, bodyY + 18, ex + ew + 2, bodyY + 11);
    ctx.stroke();

    ctx.restore();

    // Crisp outer socket outline
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ex - ew, bodyY + 2);
    ctx.lineTo(ex - ew, ey + 4);
    ctx.ellipse(ex, ey + 4, ew, eh, 0, Math.PI, 0, true);
    ctx.lineTo(ex + ew, bodyY + 2);
    ctx.stroke();
  });

  // MASSIVE Crescent Shark-Tooth Grin with Double Row of Zig-Zag Fangs!
  const mouthY = bodyY + 54;
  ctx.save();
  ctx.fillStyle = "#1e0510";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-48, mouthY - 6);
  ctx.quadraticCurveTo(0, mouthY + 8, 48, mouthY - 6);
  ctx.lineTo(38, mouthY + 30);
  ctx.quadraticCurveTo(0, mouthY + 38, -38, mouthY + 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.clip();

  // Top Row of Sharp White Zig-Zag Teeth
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-48, mouthY - 8);
  for (let tx = -44; tx <= 44; tx += 14) {
    ctx.lineTo(tx + 7, mouthY + 12);
    ctx.lineTo(tx + 14, mouthY - 4);
  }
  ctx.lineTo(48, mouthY - 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bottom Row of Sharp White Zig-Zag Teeth
  ctx.beginPath();
  ctx.moveTo(-42, mouthY + 38);
  for (let tx = -38; tx <= 36; tx += 13) {
    ctx.lineTo(tx + 6.5, mouthY + 18);
    ctx.lineTo(tx + 13, mouthY + 36);
  }
  ctx.lineTo(42, mouthY + 38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  ctx.restore();
}

/**
 * Cosmic cyan/violet/magenta spiral vortex nestled inside the fortress pit
 * (and briefly opening above the start pad as an exit portal when warping back!).
 */
export function drawWormhole(
  ctx,
  { x, y, w = 90, h = 52, timeSec = 0, isExit = false, scale = 1 }
) {
  if (scale <= 0.02) return;
  ctx.save();

  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = Math.max(8, w * 0.46 * scale);
  const ry = Math.max(6, h * 0.43 * scale);
  const spin = timeSec * (isExit ? -5.2 : 4.4);

  // Subtle upward gravitational glow inside the pit chasm
  if (!isExit) {
    const pitGlow = ctx.createLinearGradient(cx, y - 26, cx, y + h);
    pitGlow.addColorStop(0, "rgba(34, 211, 238, 0)");
    pitGlow.addColorStop(0.55, "rgba(168, 85, 247, 0.24)");
    pitGlow.addColorStop(1, "rgba(34, 211, 238, 0.38)");
    ctx.fillStyle = pitGlow;
    ctx.fillRect(x, y - 24, w, h + 24);
  }

  // Outer glowing accretion halo
  const pulse = 1 + 0.06 * Math.sin(timeSec * 7);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx * 1.18 * pulse, ry * 1.22 * pulse);
  const halo = ctx.createRadialGradient(0, 0, 0.55, 0, 0, 1);
  halo.addColorStop(0, "rgba(34, 211, 238, 0.55)");
  halo.addColorStop(0.6, "rgba(168, 85, 247, 0.35)");
  halo.addColorStop(1, "rgba(168, 85, 247, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Clipped Elliptical Event Horizon + Rotating Cartoon Spiral Arms
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);

  // Deep cosmic space background
  const coreGrad = ctx.createRadialGradient(0, 0, 0.08, 0, 0, 1);
  coreGrad.addColorStop(0, "#020008");
  coreGrad.addColorStop(0.38, "#1e1b4b");
  coreGrad.addColorStop(0.78, "#581c87");
  coreGrad.addColorStop(1, "#0891b2");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 1.05, 0, Math.PI * 2);
  ctx.fill();

  // 5 vibrant cartoon spiral ribbons swirling into the singularity
  const armColors = ["#22d3ee", "#f472b6", "#a855f7", "#38bdf8", "#fde047"];
  for (let i = 0; i < armColors.length; i++) {
    const baseAng = spin + (i * Math.PI * 2) / armColors.length;
    ctx.strokeStyle = armColors[i];
    ctx.lineWidth = 0.13;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let step = 0; step <= 18; step++) {
      const u = step / 18; // 0 (center) -> 1 (rim)
      const r = 0.22 + u * 0.78;
      const a = baseAng + u * 2.55;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (step === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // Bright cyan-white inner photon ring + pitch-dark center black hole
  const innerR = 0.27 + 0.03 * Math.sin(timeSec * 9);
  ctx.fillStyle = "#03000a";
  ctx.strokeStyle = "#67e8f9";
  ctx.lineWidth = 0.08;
  ctx.beginPath();
  ctx.arc(0, 0, innerR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
  ctx.restore();

  // Crisp Cartoon Ink Rim + Neon Cyan Inner Lip
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = isExit ? "#f472b6" : "#22d3ee";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(2, rx - 2.2), Math.max(2, ry - 2.2), 0, 0, Math.PI * 2);
  ctx.stroke();

  // Orbiting 4-point cartoon space sparkles pulled around the vortex rim!
  const sparkleCount = w > 180 ? 8 : 4;
  for (let i = 0; i < sparkleCount; i++) {
    const a = -spin * 0.85 + i * ((Math.PI * 2) / sparkleCount);
    const sx = cx + Math.cos(a) * (rx * 0.92);
    const sy = cy + Math.sin(a) * (ry * 0.92);
    const sr = (i % 2 === 0 ? 4.2 : 3.2) * scale;
    ctx.fillStyle = i % 2 === 0 ? "#fde047" : "#67e8f9";
    ctx.beginPath();
    ctx.moveTo(sx, sy - sr);
    ctx.lineTo(sx + sr * 0.35, sy - sr * 0.35);
    ctx.lineTo(sx + sr, sy);
    ctx.lineTo(sx + sr * 0.35, sy + sr * 0.35);
    ctx.lineTo(sx, sy + sr);
    ctx.lineTo(sx - sr * 0.35, sy + sr * 0.35);
    ctx.lineTo(sx - sr, sy);
    ctx.lineTo(sx - sr * 0.35, sy - sr * 0.35);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Suspended hover-bucket brimming with shiny cartoon ice cubes that wobbles & tips over every 5s!
 */
export function drawIceBucket(
  ctx,
  { x, y, tipAngle = 0, isWarning = false, hasIceInside = true, timeSec = 0 }
) {
  ctx.save();
  const jitterX = isWarning ? Math.sin(timeSec * 46) * 2.8 : 0;

  // Hover drone suspension mount above the bucket pivot
  ctx.save();
  ctx.translate(x + jitterX, y);

  // Glowing cyan anti-grav suspension ring
  ctx.fillStyle = "rgba(34, 211, 238, 0.25)";
  ctx.beginPath();
  ctx.ellipse(0, -28, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#334155";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(-18, -32, 36, 10, 5);
  ctx.fill();
  ctx.stroke();

  // Twin side hanger struts down to pivot axle (0, 0)
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-14, -22);
  ctx.lineTo(-22, 0);
  ctx.moveTo(14, -22);
  ctx.lineTo(22, 0);
  ctx.stroke();

  if (isWarning) {
    ctx.fillStyle = "#bae6fd";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.font = "800 11.5px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText("❄️ ICE TIPPING!", 0, -40);
    ctx.fillText("❄️ ICE TIPPING!", 0, -40);
  }

  // Rotate bucket around its side trunnion pivot!
  ctx.rotate(tipAngle);

  // Mound of gleaming cartoon ice cubes heaped at the top of the bucket
  if (hasIceInside) {
    const cubes = [
      { cx: -11, cy: -15, s: 12, r: -0.18 },
      { cx: 1, cy: -18, s: 13, r: 0.14 },
      { cx: 12, cy: -14, s: 11.5, r: 0.28 },
      { cx: -5, cy: -9, s: 11, r: 0.05 },
      { cx: 7, cy: -9, s: 11, r: -0.12 },
    ];
    cubes.forEach((c) => {
      ctx.save();
      ctx.translate(c.cx, c.cy);
      ctx.rotate(c.r);
      ctx.fillStyle = "#cffafe";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-c.s / 2, -c.s / 2, c.s, c.s, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-c.s / 2 + 2, -c.s / 2 + 2, c.s * 0.38, c.s * 0.38);
      ctx.restore();
    });
  }

  // Tapered frosty steel-blue cartoon bucket body
  const bGrad = ctx.createLinearGradient(-24, 0, 24, 0);
  bGrad.addColorStop(0, "#38bdf8");
  bGrad.addColorStop(0.35, "#bae6fd");
  bGrad.addColorStop(1, "#0284c7");
  ctx.fillStyle = bGrad;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-24, -10);
  ctx.lineTo(24, -10);
  ctx.lineTo(18, 28);
  ctx.lineTo(-18, 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rolled upper bucket rim
  ctx.fillStyle = "#e0f2fe";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(-26, -13, 52, 7, 3.5);
  ctx.fill();
  ctx.stroke();

  // Crisp snowflake / ice diamond crest on bucket front
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#0369a1";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(7, 9);
  ctx.lineTo(0, 18);
  ctx.lineTo(-7, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Side pivot rivets
  [-21, 21].forEach((px) => {
    ctx.fillStyle = "#facc15";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(px, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
  ctx.restore();
}

/**
 */
export function drawFallingIceCube(ctx, { x, y, size = 16, rot = 0 }) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  ctx.fillStyle = "rgba(165, 243, 252, 0.92)";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(-size / 2, -size / 2, size, size, 3.5);
  ctx.fill();
  ctx.stroke();

  // Glossy white ice specular highlight
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(-size / 2 + 2.5, -size / 2 + 2.5, size * 0.42, size * 0.32, 1.5);
  ctx.fill();

  ctx.restore();
}

/**
 * Shows progressive fracture cracks as the player hits it 5 times to shatter free!
 */
export function drawFrozenIceBlock(
  ctx,
  { x, y, w = 32, h = 44, hitsLeft = 5, shakeTimer = 0, timeSec = 0 }
) {
  ctx.save();
  const shakeX = shakeTimer > 0 ? Math.sin(timeSec * 65) * 4.5 : 0;
  const bx = x - 9 + shakeX;
  const by = y - 8;
  const bw = w + 18;
  const bh = h + 14;

  // Translucent icy cyan block over the pilot
  const iceGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  iceGrad.addColorStop(0, "rgba(224, 242, 254, 0.72)");
  iceGrad.addColorStop(0.5, "rgba(103, 232, 249, 0.56)");
  iceGrad.addColorStop(1, "rgba(14, 165, 233, 0.68)");
  ctx.fillStyle = iceGrad;
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 8);
  ctx.fill();
  ctx.stroke();

  // Crisp inner white frost bevel
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bx + 3, by + 3, bw - 6, bh - 6, 5);
  ctx.stroke();

  // Diagonal specular ice gleam
  ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
  ctx.beginPath();
  ctx.moveTo(bx + 7, by + 4);
  ctx.lineTo(bx + 19, by + 4);
  ctx.lineTo(bx + 9, by + bh - 6);
  ctx.lineTo(bx + 4, by + bh - 14);
  ctx.closePath();
  ctx.fill();

  // Progressive fracture cracks as hits accumulate (5 -> 1)!
  const cracksTaken = Math.max(0, 5 - hitsLeft);
  if (cracksTaken >= 1) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.25, by + 4);
    ctx.lineTo(bx + bw * 0.42, by + bh * 0.36);
    ctx.lineTo(bx + bw * 0.3, by + bh * 0.58);
    if (cracksTaken >= 2) {
      ctx.moveTo(bx + bw * 0.78, by + 8);
      ctx.lineTo(bx + bw * 0.56, by + bh * 0.44);
      ctx.lineTo(bx + bw * 0.72, by + bh * 0.74);
    }
    if (cracksTaken >= 3) {
      ctx.moveTo(bx + 5, by + bh * 0.48);
      ctx.lineTo(bx + bw * 0.52, by + bh * 0.52);
      ctx.lineTo(bx + bw - 5, by + bh * 0.38);
    }
    if (cracksTaken >= 4) {
      ctx.moveTo(bx + bw * 0.48, by + bh * 0.44);
      ctx.lineTo(bx + bw * 0.22, by + bh - 5);
      ctx.moveTo(bx + bw * 0.54, by + bh * 0.48);
      ctx.lineTo(bx + bw * 0.84, by + bh - 6);
    }
    ctx.stroke();
  }

  // Overhead Breakout Counter Prompt!
  const cx = x + w / 2;
  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cx - 68, by - 26, 136, 20, 7);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fde047";
  ctx.font = "800 11px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`❄️ FROZEN! Hit ${hitsLeft}x!`, cx, by - 12);

  ctx.restore();
}

/**
 * Oak-and-steel torsion catapult with spoked wheels and a cushioned launch spoon
 * that rests cocked on the left and whips forward ("💥 FLING!") to hurl pilots across craters!
 */
export function drawCatapult(ctx, { x, y, w = 108, h = 30, boingTimer = 0, timeSec = 0 }) {
  ctx.save();

  const groundY = y + h;
  const pivotX = x + w * 0.72;
  const pivotY = groundY - 14;

  // Arm angle: 0 = pointing straight left (cocked low); swings up-and-right (~2.15 rad) when triggered!
  let swing = 0;
  if (boingTimer > 0) {
    const progress = 1 - Math.min(1, boingTimer / 0.48); // 0 -> 1
    if (progress < 0.28) {
      swing = (progress / 0.28) * 2.08;
    } else {
      const settle = (progress - 0.28) / 0.72;
      swing = 2.08 * (1 - settle * 0.85) + Math.sin(settle * Math.PI * 3) * 0.08 * (1 - settle);
    }
  } else {
    swing = Math.sin(timeSec * 3.5) * 0.025;
  }

  // Rear A-frame support strut (behind spoon arm)
  ctx.fillStyle = "#92400e";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(pivotX - 16, groundY - 6);
  ctx.lineTo(pivotX - 2, pivotY - 12);
  ctx.lineTo(pivotX + 12, pivotY - 12);
  ctx.lineTo(pivotX + 20, groundY - 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pivoting Wooden Spoon Arm + Red Launch Cup!
  ctx.save();
  ctx.translate(pivotX, pivotY);
  // At swing = 0, arm points left & slightly down (-0.08 rad so cup rests near y + h - 14)
  ctx.rotate(-0.08 + swing);

  const armLen = w * 0.66;
  // Sturdy tapered wooden beam extending to -armLen
  ctx.fillStyle = "#d97706";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(8, -4);
  ctx.lineTo(-armLen, -3.5);
  ctx.lineTo(-armLen, 4.5);
  ctx.lineTo(8, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cushioned crimson-and-gold catapult launch spoon/bucket at tip!
  const cupX = -armLen + 4;
  ctx.fillStyle = "#ef4444";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cupX, -4, 15, 0.08 * Math.PI, 0.92 * Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden rim trim on launch spoon
  ctx.fillStyle = "#facc15";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cupX - 16, -7, 32, 5.5, 2.5);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Heavy Oak Base Beam & Steel Corner Plates
  ctx.fillStyle = "#b45309";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.roundRect(x + 8, groundY - 13, w - 14, 9, 4);
  ctx.fill();
  ctx.stroke();

  // Wood grain highlight
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(x + 14, groundY - 11, w - 26, 2.5);

  // Front upright stopper post & steel bracket
  ctx.fillStyle = "#b45309";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(pivotX + 6, pivotY - 16, 10, 22, 3);
  ctx.fill();
  ctx.stroke();

  // Twisted golden torsion rope coil + iron hub at pivot
  ctx.fillStyle = "#fbbf24";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 3.8, 0, Math.PI * 2);
  ctx.fill();

  // Two Cartoon Spoked Catapult Wheels sitting flush on the platform!
  [x + 24, x + w - 22].forEach((wx) => {
    const wy = groundY - 7.5;
    const r = 7.5;
    ctx.fillStyle = "#475569";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.arc(wx, wy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#d97706";
    ctx.beginPath();
    ctx.arc(wx, wy, r - 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(wx, wy, 2.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Action callout when flinging!
  if (boingTimer > 0.08) {
    ctx.fillStyle = "#fde047";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.font = "900 13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText("💥 FLING!", x + w / 2, y - 18);
    ctx.fillText("💥 FLING!", x + w / 2, y - 18);
  }

  ctx.restore();
}

/**
 * Streaking fiery comet tail + cratered molten-rimmed cartoon space rock!
 */
export function drawMeteorPickup(ctx, { x, y, w = 26, h = 26, timeSec = 0 }) {
  ctx.save();
  const bobY = Math.sin(timeSec * 5.2 + x * 0.03) * 3.5;
  const cx = x + w / 2;
  const cy = y + h / 2 + bobY;

  ctx.translate(cx, cy);
  ctx.rotate(-0.52); // Swooping diagonally down-left like a falling shooting meteor!

  const flicker1 = Math.sin(timeSec * 22 + x) * 3.2;
  const flicker2 = Math.cos(timeSec * 18 + y) * 2.5;

  // Outer crimson-magenta flame tail streaming behind (+X in rotated space)
  ctx.fillStyle = "#f43f5e";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-4, -10);
  ctx.quadraticCurveTo(14, -13, 30 + flicker1, -5);
  ctx.lineTo(22 + flicker2, 0);
  ctx.lineTo(32 - flicker1 * 0.7, 6);
  ctx.quadraticCurveTo(14, 13, -4, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Middle vibrant orange flame core
  ctx.fillStyle = "#fb923c";
  ctx.beginPath();
  ctx.moveTo(-3, -7.5);
  ctx.quadraticCurveTo(11, -9, 23 + flicker2, -2.5);
  ctx.lineTo(17, 1);
  ctx.lineTo(24 + flicker1 * 0.5, 4.5);
  ctx.quadraticCurveTo(10, 8.5, -3, 7.5);
  ctx.closePath();
  ctx.fill();

  // Inner white-hot yellow flame tongue
  ctx.fillStyle = "#fef08a";
  ctx.beginPath();
  ctx.moveTo(-2, -4.5);
  ctx.quadraticCurveTo(8, -5, 15 + flicker1 * 0.4, 0);
  ctx.quadraticCurveTo(8, 5, -2, 4.5);
  ctx.closePath();
  ctx.fill();

  // Trailing glowing ember sparks
  ctx.fillStyle = "#fde047";
  ctx.beginPath();
  ctx.arc(33 + ((timeSec * 26) % 8), -4, 2.2, 0, Math.PI * 2);
  ctx.arc(30 + (((timeSec + 0.3) * 24) % 9), 5, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Chunky Cratered Cartoon Meteor Rock Head (at -4, 0)
  const rockGrad = ctx.createRadialGradient(-7, -3, 2, -4, 0, 12);
  rockGrad.addColorStop(0, "#f59e0b");
  rockGrad.addColorStop(0.55, "#b45309");
  rockGrad.addColorStop(1, "#78350f");
  ctx.fillStyle = rockGrad;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(-4, 0, 10.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cute cartoon meteor craters
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.arc(-7.5, -3, 2.5, 0, Math.PI * 2);
  ctx.arc(-2, 4, 2.1, 0, Math.PI * 2);
  ctx.arc(-0.5, -3.5, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Leading hot incandescent rim highlight
  ctx.strokeStyle = "#fef08a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-4, 0, 8.2, Math.PI * 0.68, Math.PI * 1.35);
  ctx.stroke();

  ctx.restore();
}

/**
 * Flush yellow-and-black hazard floor grate from which 5 gleaming metallic spikes
 * rattle in warning and shoot straight out of the ground every 5 seconds!
 */
export function drawPopupSpikes(
  ctx,
  { x, y, w = 72, h = 38, extendRatio = 0, isWarning = false, timeSec = 0 }
) {
  ctx.save();
  const baseH = 8;
  const floorY = y + h;
  const plateY = floorY - baseH;
  const maxSpikeH = h - baseH + 2;
  const rattleX = isWarning ? Math.sin(timeSec * 52) * 2.2 : 0;

  // Clip spikes cleanly to above the hazard floor housing so they slide out of the ground!
  if (extendRatio > 0.02) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 6, y - 14, w + 12, h - baseH + 15);
    ctx.clip();

    const spikeCount = 5;
    const padX = 5;
    const spikeW = (w - padX * 2) / spikeCount;
    const curRise = maxSpikeH * Math.max(0, Math.min(1, extendRatio));
    const tipY = plateY + 1 - curRise;
    const spikeBottomY = plateY + maxSpikeH + 2;

    for (let i = 0; i < spikeCount; i++) {
      const sx = x + padX + i * spikeW + rattleX;
      const midX = sx + spikeW / 2;

      // Left bright silver facet
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.moveTo(sx + 0.5, spikeBottomY);
      ctx.lineTo(midX, tipY);
      ctx.lineTo(midX, spikeBottomY);
      ctx.closePath();
      ctx.fill();

      // Right icy steel-blue facet
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.moveTo(midX, tipY);
      ctx.lineTo(sx + spikeW - 0.5, spikeBottomY);
      ctx.lineTo(midX, spikeBottomY);
      ctx.closePath();
      ctx.fill();

      // Crisp cartoon spike outline
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(sx + 0.5, spikeBottomY);
      ctx.lineTo(midX, tipY);
      ctx.lineTo(sx + spikeW - 0.5, spikeBottomY);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Yellow-and-black hazard base plate bolted flush onto the platform surface
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, plateY, w, baseH, [3, 3, 1, 1]);
  ctx.fillStyle = "#1e293b";
  ctx.fill();
  ctx.clip();

  ctx.fillStyle = "#facc15";
  for (let stripeX = x - 8; stripeX < x + w + 8; stripeX += 14) {
    ctx.beginPath();
    ctx.moveTo(stripeX, plateY + baseH);
    ctx.lineTo(stripeX + 6, plateY);
    ctx.lineTo(stripeX + 12, plateY);
    ctx.lineTo(stripeX + 6, plateY + baseH);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(x, plateY, w, baseH, [3, 3, 1, 1]);
  ctx.stroke();

  // Status warning / pop callout!
  if (isWarning) {
    ctx.fillStyle = "#fde047";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.font = "800 11.5px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText("⚠️ SPIKES!", x + w / 2 + rattleX, plateY - 12);
    ctx.fillText("⚠️ SPIKES!", x + w / 2 + rattleX, plateY - 12);
  }

  ctx.restore();
}

/**
 * Two-wheel knobby space-motocross Mars Bike with coil suspension, twin turbo tailpipes,
 */
export function drawMarsBike(
  ctx,
  {
    x,
    y,
    w = 98,
    h = 62,
    pilotInside = null,
    driveOffsetX = 0,
    wheelSpinOffset = null,
    isDriving = false,
    showParkingPad = true,
    bannerText = undefined,
    timeSec = 0,
  }
) {
  ctx.save();

  // Optional glowing bike pad on the ground
  if (showParkingPad) {
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(x - 6, y + h - 5, w + 12, 7, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#facc15";
    for (let sx = x + 4; sx < x + w - 8; sx += 20) {
      ctx.fillRect(sx, y + h - 4, 10, 3);
    }
  }

  const rx = x + driveOffsetX;
  const spinDist = wheelSpinOffset !== null ? wheelSpinOffset : driveOffsetX;
  const bounceY = isDriving
    ? Math.sin(timeSec * 38) * 1.8
    : Math.sin(timeSec * 3.5) * 0.6;
  const wheelR = 14;
  const wheelCy = y + h - wheelR - 1;
  const rearWx = rx + 21;
  const frontWx = rx + w - 20;

  // Twin Turbo Booster Flame when riding!
  if (isDriving) {
    const flameLen = 20 + Math.sin(timeSec * 48) * 7;
    ctx.fillStyle = "#f97316";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rx + 8, y + h - 26 + bounceY);
    ctx.lineTo(rx - flameLen, y + h - 22 + bounceY);
    ctx.lineTo(rx + 8, y + h - 17 + bounceY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.moveTo(rx + 8, y + h - 24 + bounceY);
    ctx.lineTo(rx - flameLen * 0.55, y + h - 21.5 + bounceY);
    ctx.lineTo(rx + 8, y + h - 19 + bounceY);
    ctx.closePath();
    ctx.fill();
  }

  // Warm headlight beam cone ahead of Mars Bike
  const beamGrad = ctx.createLinearGradient(rx + w - 10, 0, rx + w + 82, 0);
  beamGrad.addColorStop(0, "rgba(254, 240, 138, 0.36)");
  beamGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(rx + w - 11, y + 22 + bounceY);
  ctx.lineTo(rx + w + 82, y + 8 + bounceY);
  ctx.lineTo(rx + w + 82, y + 48 + bounceY);
  ctx.lineTo(rx + w - 11, y + 30 + bounceY);
  ctx.closePath();
  ctx.fill();

  // Draw 2 Knobby Motocross Mars Wheels first so forks/swingarm clamp cleanly onto hubs!
  const wheelSpin = spinDist * 0.095;
  [rearWx, frontWx].forEach((wx) => {
    ctx.save();
    ctx.translate(wx, wheelCy);
    ctx.rotate(wheelSpin);

    // Thick knobby Mars tire
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Perimeter tire knobs
    ctx.fillStyle = "#475569";
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (wheelR - 2), Math.sin(a) * (wheelR - 2), 2.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vibrant Mars-orange alloy rim
    ctx.fillStyle = "#fb923c";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.arc(0, 0, 7.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Spokes so spin is super readable
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6.8, 0);
    ctx.lineTo(6.8, 0);
    ctx.moveTo(0, -6.8);
    ctx.lineTo(0, 6.8);
    ctx.stroke();

    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // --- Mars Bike Chassis, Forks, Saddle & Rider (with slight wheelie pop when accelerating!) ---
  ctx.save();
  const wheelieTilt = isDriving && driveOffsetX > 8 ? -0.075 : 0;
  ctx.translate(rearWx, wheelCy);
  ctx.rotate(wheelieTilt);
  ctx.translate(-rearWx, -wheelCy + bounceY);

  // Rear swingarm + yellow coil shock + twin angled chrome exhaust pipes
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(rearWx, wheelCy);
  ctx.lineTo(rx + 44, y + 34);
  ctx.stroke();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rearWx, wheelCy);
  ctx.lineTo(rx + 44, y + 34);
  ctx.stroke();

  // Twin rear turbo tailpipes
  ctx.fillStyle = "#64748b";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(rx + 34, y + 33);
  ctx.lineTo(rx + 7, y + 26);
  ctx.lineTo(rx + 6, y + 33);
  ctx.lineTo(rx + 34, y + 39);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Telescopic front forks from front axle up to handlebars
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(frontWx, wheelCy);
  ctx.lineTo(rx + 64, y + 14);
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(frontWx, wheelCy);
  ctx.lineTo(rx + 64, y + 14);
  ctx.stroke();

  // Front mudguard fender over front tire
  ctx.fillStyle = "#f97316";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(frontWx, wheelCy, wheelR + 4, -Math.PI * 0.82, -Math.PI * 0.22);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#f97316";
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // Pilot Riding the Mars Bike (drawn behind handlebars/windscreen!)
  if (pilotInside) {
    const seatX = rx + 42;
    const seatY = y + 26;

    // Jetpack cylinders on rider's back
    ctx.fillStyle = "#e2e8f0";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(seatX - 15, seatY - 18, 9, 18, 3);
    ctx.fill();
    ctx.stroke();

    // Bent leg gripping tank down to footpeg
    ctx.strokeStyle = pilotInside.suitSecondary || "#1d4ed8";
    ctx.lineWidth = 6.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(seatX - 2, seatY);
    ctx.lineTo(seatX + 8, seatY + 8);
    ctx.lineTo(seatX + 3, seatY + 16);
    ctx.stroke();

    // Torso leaning sportily toward handlebars
    ctx.fillStyle = pilotInside.suitPrimary;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(seatX - 8, seatY - 19, 15, 20, 5);
    ctx.fill();
    ctx.stroke();

    // Helmet + glowing visor + antenna
    const hx = seatX + 1;
    const hy = seatY - 29;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx - 2, hy - 9);
    ctx.lineTo(hx - 4, hy - 15);
    ctx.stroke();
    ctx.fillStyle = pilotInside.visorColor;
    ctx.beginPath();
    ctx.arc(hx - 4, hy - 16, 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = pilotInside.suitPrimary;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.arc(hx, hy, 10.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = pilotInside.visorColor;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(hx - 1, hy - 5, 10.5, 7.5, 3.5);
    ctx.fill();
    ctx.stroke();

    // Arm reaching forward gripping the Mars Bike handlebar!
    ctx.strokeStyle = pilotInside.suitPrimary;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(seatX + 3, seatY - 13);
    ctx.lineTo(rx + 62, y + 14);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(seatX + 3, seatY - 13);
    ctx.lineTo(rx + 62, y + 14);
    ctx.stroke();
  }

  // Sleek White & Mars-Orange Bike Frame + Fuel Tank + Engine Cowl
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(rx + 22, y + 26);
  ctx.lineTo(rx + 50, y + 23);
  ctx.lineTo(rx + 74, y + 17);
  ctx.lineTo(rx + 84, y + 26);
  ctx.lineTo(rx + 64, y + 38);
  ctx.lineTo(rx + 36, y + 39);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mars-orange lower belly shroud
  ctx.fillStyle = "#f97316";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rx + 34, y + 31);
  ctx.lineTo(rx + 78, y + 27);
  ctx.lineTo(rx + 65, y + 39);
  ctx.lineTo(rx + 37, y + 39);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing cyan power core cell in center frame
  ctx.fillStyle = "#38bdf8";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(rx + 48, y + 29, 13, 7, 3);
  ctx.fill();
  ctx.stroke();

  // Contoured dark motocross saddle
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(rx + 28, y + 22, 24, 6.5, 3);
  ctx.fill();
  ctx.stroke();

  // Translucent cyan aerodynamic bubble windscreen + handlebars
  ctx.fillStyle = "rgba(56, 189, 248, 0.78)";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(rx + 68, y + 18);
  ctx.quadraticCurveTo(rx + 73, y + 6, rx + 82, y + 19);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Handlebar grip
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.roundRect(rx + 58, y + 11, 10, 4.5, 2);
  ctx.fill();

  // Bright LED Headlight on nose
  ctx.fillStyle = "#fef08a";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(rx + 81, y + 21, 6, 8, 2.5);
  ctx.fill();
  ctx.stroke();

  ctx.restore(); // End wheelie/bounce transform

  // Overhead status callout banner
  const resolvedBanner =
    bannerText !== undefined
      ? bannerText
      : isDriving && pilotInside
        ? `🏍️ MARS BIKE AWAY!`
        : "🏍️ HOP ON MARS BIKE!";

  if (resolvedBanner) {
    const bannerX = Math.max(92, rx + w / 2);
    const bannerY = y - 8;
    ctx.fillStyle = "#fde047";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.font = "800 12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText(resolvedBanner, bannerX, bannerY);
    ctx.fillText(resolvedBanner, bannerX, bannerY);
  }

  ctx.restore();
}
