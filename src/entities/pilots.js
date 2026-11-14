// Pilot suit definitions and cartoon sprite renderer

const INK = "#0f172a";

export const PILOTS = [
  {
    id: "nova",
    name: "Starlight Nova Pilot",
    tagline: "Crimson Laser · Solar Thrusters",
    suitPrimary: "#fb7185",
    suitSecondary: "#be185d",
    visorColor: "#67e8f9",
    trimColor: "#fde047",
    laserColor: "#f472b6",
    laserCore: "#ffffff",
    jetOuter: "#f43f5e",
    jetInner: "#fde047",
    cardGlow: "rgba(251, 113, 133, 0.42)",
  },
  {
    id: "ion",
    name: "Turbo Ion Commander",
    tagline: "Cobalt Blaster · Ion Thrusters",
    suitPrimary: "#3b82f6",
    suitSecondary: "#1d4ed8",
    visorColor: "#fde047",
    trimColor: "#7dd3fc",
    laserColor: "#38bdf8",
    laserCore: "#ffffff",
    jetOuter: "#06b6d4",
    jetInner: "#fef08a",
    cardGlow: "rgba(59, 130, 246, 0.48)",
  },
];

export function getPilotById(id) {
  return PILOTS.find((p) => p.id.toLowerCase() === String(id).toLowerCase()) || PILOTS[0];
}

/**
 * Draws the cartoon jetpack pilot centered around (x, y) top-left bounding box (w=32, h=44).
 */
export function drawPilotSprite(ctx, {
  x,
  y,
  w = 32,
  h = 44,
  facing = 1,
  pilot = PILOTS[0],
  jetting = false,
  walkPhase = 0,
  hurtFlash = false,
  scale = 1,
}) {
  ctx.save();
  const cx = x + (w * scale) / 2;
  const cy = y + (h * scale) / 2;
  ctx.translate(cx, cy);
  ctx.scale(facing * scale, scale);

  if (hurtFlash) {
    ctx.globalAlpha = 0.55;
  }

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  [-16.5, -11].forEach((tx, idx) => {
    ctx.fillStyle = "#e2e8f0";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    roundRect(ctx, tx, -9, 6.5, 20, 3, true, true);

    ctx.fillStyle = pilot.visorColor;
    ctx.fillRect(tx + 1.5, -3, 3.5, 8);

    // Twin nozzles & dual flames!
    if (jetting) {
      const flicker = 8 + Math.random() * 10 + idx * 2;
      ctx.fillStyle = pilot.jetOuter;
      ctx.beginPath();
      ctx.moveTo(tx, 12);
      ctx.lineTo(tx + 6.5, 12);
      ctx.lineTo(tx + 3.25, 12 + flicker);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = pilot.jetInner;
      ctx.beginPath();
      ctx.moveTo(tx + 1.4, 12);
      ctx.lineTo(tx + 5.1, 12);
      ctx.lineTo(tx + 3.25, 12 + flicker * 0.6);
      ctx.closePath();
      ctx.fill();
    }
  });

  // Legs (animated cartoon stride)
  const legSwing = Math.sin(walkPhase) * 4;
  ctx.fillStyle = pilot.suitSecondary;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  roundRect(ctx, -6 + legSwing * 0.5, 10, 6.5, 11, 2.5, true, true);
  roundRect(ctx, 1 - legSwing * 0.5, 10, 6.5, 11, 2.5, true, true);

  // Boots
  ctx.fillStyle = pilot.trimColor;
  roundRect(ctx, -6.5 + legSwing * 0.5, 18, 7.5, 4.5, 2, true, true);
  roundRect(ctx, 0.5 - legSwing * 0.5, 18, 7.5, 4.5, 2, true, true);

  // Torso suit
  ctx.fillStyle = pilot.suitPrimary;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  roundRect(ctx, -8, -8, 17, 20, 4.5, true, true);

  // Chest emblem stripe
  ctx.fillStyle = pilot.trimColor;
  ctx.fillRect(-5, -2, 11, 3.5);

  // Cartoon Helmet
  ctx.fillStyle = pilot.suitPrimary;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  roundRect(ctx, -9, -22, 19, 16, 7.5, true, true);

  // Glowing Visor
  ctx.fillStyle = pilot.visorColor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  roundRect(ctx, -1, -18.5, 10.5, 8.5, 3.5, true, true);
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillRect(1, -17, 5, 2.5);

  // Helmet Antenna
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-3, -22);
  ctx.lineTo(-5, -27);
  ctx.stroke();
  ctx.fillStyle = pilot.trimColor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(-5, -27, 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Arm & Laser Blaster
  ctx.fillStyle = pilot.suitSecondary;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  roundRect(ctx, -1, -3, 10, 6, 2.5, true, true);
  ctx.fillStyle = "#e2e8f0";
  roundRect(ctx, 7, -4.5, 9.5, 6.5, 2, true, true);
  ctx.fillStyle = pilot.laserColor;
  ctx.fillRect(14.5, -3, 3.5, 3.8);

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
