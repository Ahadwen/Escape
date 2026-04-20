import { TAU, HEAL_PICKUP_PLUS_HALF, HEAL_PICKUP_ARM_THICK } from "./constants.js";
import { HEX_SIZE, SURGE_SAFE_HEX_DRAW_R } from "./balance.js";

export function drawCircle(ctx, x, y, r, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawHealPickup(ctx, p, elapsed) {
  const pulse = 0.94 + 0.06 * (0.5 + 0.5 * Math.sin(elapsed * 5));
  const h = (p.plusHalf ?? HEAL_PICKUP_PLUS_HALF) * pulse;
  const t = p.plusThick ?? HEAL_PICKUP_ARM_THICK;
  const { x, y } = p;
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = "rgba(52, 211, 153, 0.95)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#047857";
  ctx.fillRect(-h, -t / 2, 2 * h, t);
  ctx.fillRect(-t / 2, -h, t, 2 * h);
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#10b981";
  ctx.fillRect(-h + 0.8, -t / 2 + 0.5, 2 * h - 1.6, t - 1);
  ctx.fillRect(-t / 2 + 0.5, -h + 0.8, t - 1, 2 * h - 1.6);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#d1fae5";
  ctx.fillRect(-h * 0.52, -t * 0.32, h * 1.04, t * 0.64);
  ctx.fillRect(-t * 0.32, -h * 0.52, t * 0.64, h * 1.04);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(236, 253, 245, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-h, -t / 2, 2 * h, t);
  ctx.strokeRect(-t / 2, -h, t, 2 * h);
  ctx.restore();
}

export function drawObstacles(ctx, obstacles) {
  ctx.fillStyle = "#334155";
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  for (const o of obstacles) {
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeRect(o.x, o.y, o.w, o.h);
  }
}

export function strokePointyHexOutline(ctx, cx, cy, vertexRadius, strokeStyle, lineWidth, glowBlur) {
  ctx.save();
  ctx.shadowColor = strokeStyle;
  ctx.shadowBlur = glowBlur;
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (Math.PI / 3) * i;
    const x = cx + Math.cos(a) * vertexRadius;
    const y = cy + Math.sin(a) * vertexRadius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.stroke();
  ctx.restore();
}

/** Rainbow fill for roulette hex; `elapsed` drives spin (game seconds). */
export function fillPointyHexRainbowGlow(ctx, cx, cy, vertexRadius, elapsed, drawOutline = true, fillAlphaScale = 1) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (Math.PI / 3) * i;
    const x = cx + Math.cos(a) * vertexRadius;
    const y = cy + Math.sin(a) * vertexRadius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  const spin = elapsed * 2.8;
  if (typeof ctx.createConicGradient === "function") {
    const g = ctx.createConicGradient(spin, cx, cy);
    for (let k = 0; k <= 7; k++) g.addColorStop(k / 7, `hsl(${(k / 7) * 360} 92% 58%)`);
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = `hsla(${(elapsed * 110) % 360}, 92%, 58%, 0.55)`;
  }
  ctx.globalAlpha = 0.52 * fillAlphaScale;
  ctx.fill();
  ctx.globalAlpha = 1;
  if (drawOutline) {
    ctx.strokeStyle = `rgba(255,255,255,${0.35 * fillAlphaScale})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

/** Safehouse: radial fill, wisps, solid core hex + soft moving “dark water” shimmer (screen sheen) inside core. */
export function drawSafehouseHexCell(ctx, cx, cy, vertexRadius, elapsed) {
  const innerVertexR = (vertexRadius * SURGE_SAFE_HEX_DRAW_R) / HEX_SIZE;
  const coreFill = "rgba(15, 23, 42, 0.94)";
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (Math.PI / 3) * i;
    const x = cx + Math.cos(a) * vertexRadius;
    const y = cy + Math.sin(a) * vertexRadius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.clip();
  const outerGradR = vertexRadius * 0.98;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerGradR);
  g.addColorStop(0, coreFill);
  g.addColorStop(0.12, "rgba(15, 23, 42, 0.9)");
  g.addColorStop(0.28, "rgba(30, 41, 59, 0.42)");
  g.addColorStop(0.4, "rgba(51, 65, 85, 0.32)");
  g.addColorStop(0.52, "rgba(100, 116, 139, 0.38)");
  g.addColorStop(0.62, "rgba(148, 163, 184, 0.46)");
  g.addColorStop(0.7, "rgba(186, 198, 214, 0.55)");
  g.addColorStop(0.78, "rgba(226, 232, 240, 0.72)");
  g.addColorStop(0.86, "rgba(248, 250, 252, 0.9)");
  g.addColorStop(0.93, "rgba(255, 255, 255, 0.97)");
  g.addColorStop(1, "rgba(255, 255, 255, 0.99)");
  ctx.fillStyle = g;
  ctx.fill();
  const nWisps = 14;
  for (let w = 0; w < nWisps; w++) {
    const drift = elapsed * 0.48 + w * (TAU / nWisps) + w * 0.31;
    const radial = 0.72 + 0.12 * Math.sin(elapsed * 0.9 + w * 0.7) + (w % 4) * 0.018;
    const px = cx + Math.cos(drift) * vertexRadius * radial + Math.sin(elapsed * 1.15 + w * 0.9) * 4;
    const py = cy + Math.sin(drift * 0.85) * vertexRadius * radial + Math.cos(elapsed * 0.95 + w * 0.6) * 3;
    const smokeR = vertexRadius * (0.14 + 0.06 * Math.sin(elapsed * 2.2 + w * 1.1));
    const sg = ctx.createRadialGradient(px, py, 0, px, py, smokeR);
    sg.addColorStop(0, "rgba(148, 163, 184, 0.12)");
    sg.addColorStop(0.5, "rgba(148, 163, 184, 0.06)");
    sg.addColorStop(1, "rgba(148, 163, 184, 0)");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(px, py, smokeR, 0, TAU);
    ctx.fill();
  }
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (Math.PI / 3) * i;
    const x = cx + Math.cos(a) * innerVertexR;
    const y = cy + Math.sin(a) * innerVertexR;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = coreFill;
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (Math.PI / 3) * i;
    const x = cx + Math.cos(a) * innerVertexR;
    const y = cy + Math.sin(a) * innerVertexR;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.clip();
  const pad = innerVertexR * 2.8;
  const t = elapsed;
  const hx = Math.cos(t * 0.62) * innerVertexR * 0.42;
  const hy = Math.sin(t * 0.48 + 0.7) * innerVertexR * 0.36;
  const sh1 = ctx.createRadialGradient(cx + hx, cy + hy, 0, cx + hx * 0.15, cy + hy * 0.12, innerVertexR * 1.45);
  sh1.addColorStop(0, "rgba(190, 220, 235, 0.5)");
  sh1.addColorStop(0.38, "rgba(56, 100, 128, 0.18)");
  sh1.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = sh1;
  ctx.fillRect(cx - pad, cy - pad, pad * 2, pad * 2);
  const hx2 = Math.cos(t * 0.38 + 2.2) * innerVertexR * 0.33;
  const hy2 = Math.sin(t * 0.71 + 1.1) * innerVertexR * 0.4;
  const sh2 = ctx.createRadialGradient(cx + hx2, cy + hy2, 0, cx, cy, innerVertexR * 1.05);
  sh2.addColorStop(0, "rgba(165, 200, 218, 0.35)");
  sh2.addColorStop(0.5, "rgba(30, 55, 75, 0.08)");
  sh2.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.globalAlpha = 0.11;
  ctx.fillStyle = sh2;
  ctx.fillRect(cx - pad, cy - pad, pad * 2, pad * 2);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
  ctx.restore();
  strokePointyHexOutline(ctx, cx, cy, vertexRadius, "rgba(255, 255, 255, 0.94)", 3.4, 14);
}

/**
 * Sanctuary add-ons: **only** the inner rainbow disc (same as roulette inner) on the left, and a forge hex on the right
 * at the **same** vertex scale.
 */
export function drawSafehouseEmbeddedFacilities(ctx, opts) {
  const {
    rouletteX,
    rouletteY,
    forgeX,
    forgeY,
    vertexRadius,
    elapsed,
    embeddedRouletteComplete,
    embeddedForgeComplete = false,
  } = opts;
  ctx.save();
  if (embeddedRouletteComplete) {
    fillPointyHexRainbowGlow(ctx, rouletteX, rouletteY, vertexRadius, elapsed, false, 0.34);
  } else {
    fillPointyHexRainbowGlow(ctx, rouletteX, rouletteY, vertexRadius, elapsed, false);
  }
  ctx.restore();
  drawForgeHexCell(ctx, forgeX, forgeY, vertexRadius, elapsed, !!embeddedForgeComplete);
}

/** Small forge satellite: warm metal frame + soft ember core. */
export function drawForgeHexCell(ctx, cx, cy, vertexRadius, elapsed, spentLook = false) {
  const t = elapsed;
  const lwOut = Math.max(1.1, Math.min(3.1, vertexRadius * 0.16));
  const lwIn = Math.max(0.9, lwOut * 0.52);
  const outStroke = spentLook ? "rgba(55, 48, 36, 0.92)" : "rgba(180, 83, 9, 0.95)";
  const inStroke = spentLook ? "rgba(71, 85, 105, 0.45)" : "rgba(253, 224, 71, 0.55)";
  strokePointyHexOutline(ctx, cx, cy, vertexRadius, outStroke, lwOut, Math.min(12, vertexRadius * 0.45));
  strokePointyHexOutline(ctx, cx, cy, vertexRadius * 0.88, inStroke, lwIn, Math.min(6, vertexRadius * 0.28));
  const pulse = spentLook ? 0.35 : 0.5 + 0.5 * Math.sin(t * 2.4);
  const coreR = vertexRadius * 0.42;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 1.6);
  g.addColorStop(0, `rgba(254, 243, 199, ${spentLook ? 0.08 : 0.35 + 0.2 * pulse})`);
  g.addColorStop(0.45, spentLook ? "rgba(30, 27, 20, 0.72)" : "rgba(120, 53, 15, 0.55)");
  g.addColorStop(1, "rgba(30, 20, 12, 0.2)");
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (Math.PI / 3) * i;
    const x = cx + Math.cos(a) * vertexRadius * 0.78;
    const y = cy + Math.sin(a) * vertexRadius * 0.78;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

const CARD_PICKUP_SUIT_GLYPH = {
  hearts: "\u2665",
  diamonds: "\u2666",
  clubs: "\u2663",
  spades: "\u2660",
};

function cardPickupRankLabel(rank) {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

function cardPickupSuitPalette(suit) {
  /** Red suits (hearts + diamonds): rank and pips read in red on the light pickup face. */
  if (suit === "hearts") return { ink: "#b91c1c", fill: "#fff1f2", rim: "rgba(185, 28, 28, 0.45)" };
  if (suit === "diamonds") return { ink: "#b91c1c", fill: "#fff5f5", rim: "rgba(185, 28, 28, 0.42)" };
  if (suit === "clubs") return { ink: "#166534", fill: "#f0fdf4", rim: "rgba(22, 101, 52, 0.45)" };
  return { ink: "#0f172a", fill: "#f8fafc", rim: "rgba(15, 23, 42, 0.4)" };
}

function drawCardPickupMiniFace(ctx, card, w, h) {
  const { ink, fill, rim } = cardPickupSuitPalette(card.suit);
  const glyph = CARD_PICKUP_SUIT_GLYPH[card.suit] ?? "?";
  const hw = w / 2;
  const hh = h / 2;
  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.35)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = fill;
  ctx.fillRect(-hw, -hh, w, h);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = rim;
  ctx.lineWidth = 2;
  ctx.strokeRect(-hw + 1, -hh + 1, w - 2, h - 2);
  ctx.fillStyle = ink;
  ctx.font = "bold 11px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`${cardPickupRankLabel(card.rank)}${glyph}`, -hw + 4, -hh + 3);
  ctx.font = "bold 20px ui-serif, Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(glyph, 0, 1);
  ctx.restore();
}

/**
 * World map card loot: soft spotlight, pulse ring, and a flipping mini card (two faces).
 * `pickup.card` is the real reward; `pickup.flipCard` is optional decor-only second face.
 */
export function drawCardPickupWorld(ctx, pickup, elapsed) {
  const born = pickup.bornAt ?? elapsed;
  const bob = Math.sin((elapsed - born) * 4.2) * 2.2;
  const cx = pickup.x;
  const cy = pickup.y + bob;
  const flipT = (elapsed - born) * 2.35;
  const cos = Math.cos(flipT);
  const scaleX = Math.max(0.11, Math.abs(cos));
  const face = cos >= 0 ? pickup.card : pickup.flipCard ?? pickup.card;
  const w = 28;
  const h = 38;
  const spotR = Math.max(48, (pickup.r ?? 20) * 2.6);

  ctx.save();
  ctx.translate(cx, cy);

  const g0 = ctx.createRadialGradient(0, 0, 0, 0, 0, spotR);
  g0.addColorStop(0, "rgba(254, 252, 232, 0.42)");
  g0.addColorStop(0.35, "rgba(251, 191, 36, 0.14)");
  g0.addColorStop(0.65, "rgba(59, 130, 246, 0.06)");
  g0.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.fillStyle = g0;
  ctx.beginPath();
  ctx.arc(0, 0, spotR, 0, TAU);
  ctx.fill();

  const ringPulse = 0.5 + 0.5 * Math.sin(elapsed * 3.1 + born * 0.7);
  const ringR = (pickup.r ?? 20) + 10 + ringPulse * 5;
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.22 + 0.18 * ringPulse})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, ringR, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(251, 191, 36, ${0.12 + 0.1 * ringPulse})`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, ringR + 3, 0, TAU);
  ctx.stroke();

  ctx.scale(scaleX, 1);
  if (scaleX < 0.2) {
    ctx.strokeStyle = "rgba(248, 250, 252, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.55);
    ctx.lineTo(0, h * 0.55);
    ctx.stroke();
  } else {
    drawCardPickupMiniFace(ctx, face, w, h);
  }

  ctx.restore();
}
