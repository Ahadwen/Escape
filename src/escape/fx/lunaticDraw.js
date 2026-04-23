import { TAU } from "../constants.js";
import { LUNATIC_ROAR_DURATION_SEC } from "../balance.js";

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

/**
 * @param {{ bornAt: number; expiresAt: number; tier: 2 | 4 }[]} events
 * @param {number} simElapsed
 */
export function tickLunaticSprintTierFx(events, simElapsed) {
  for (let i = events.length - 1; i >= 0; i--) {
    if (simElapsed >= events[i].expiresAt) events.splice(i, 1);
  }
}

/**
 * @param {{ bornAt: number; expiresAt: number; tier: 2 | 4 }[]} events
 * @param {{ x: number; y: number; facing: { x: number; y: number } }} player
 * @param {number} simElapsed
 */
export function drawLunaticSprintTierSpeedFx(ctx, events, player, simElapsed) {
  if (!events.length) return;
  let ffx = player.facing.x;
  let ffy = player.facing.y;
  const fl = Math.hypot(ffx, ffy) || 1;
  ffx /= fl;
  ffy /= fl;
  const bx = -ffx;
  const by = -ffy;
  const px = -ffy;
  const py = ffx;
  const cx = player.x;
  const cy = player.y;
  for (const b of events) {
    const span = Math.max(1e-4, b.expiresAt - b.bornAt);
    const u = clamp((simElapsed - b.bornAt) / span, 0, 1);
    const fade = 1 - u;
    const lineCount = b.tier === 4 ? 12 : 8;
    const baseLen = (b.tier === 4 ? 78 : 56) * (0.72 + 0.28 * fade);
    const spreadW = b.tier === 4 ? 26 : 18;
    const jitter = (b.tier === 4 ? 5 : 3) * Math.sin(simElapsed * 38 + b.bornAt * 7);
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < lineCount; i++) {
      const t = lineCount <= 1 ? 0 : i / (lineCount - 1) - 0.5;
      const off = spreadW * t + jitter * (0.35 + 0.65 * Math.abs(t));
      const len = baseLen * (0.82 + 0.18 * Math.abs(t));
      const x0 = cx + bx * 14 + px * off;
      const y0 = cy + by * 14 + py * off;
      const x1 = cx + bx * (14 + len) + px * off * 1.08;
      const y1 = cy + by * (14 + len) + py * off * 1.08;
      const a = (b.tier === 4 ? 0.55 : 0.42) * fade;
      ctx.strokeStyle = b.tier === 4 ? `rgba(254, 215, 170, ${a})` : `rgba(125, 211, 252, ${a})`;
      ctx.lineWidth = b.tier === 4 ? 2.1 : 1.45;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** @param {string} phase */
export function drawLunaticSprintDirectionArrow(ctx, player, phase) {
  if (phase !== "sprint") return;
  const px = player.x;
  const py = player.y;
  const pr = player.r;
  let fx = player.facing.x;
  let fy = player.facing.y;
  const fl = Math.hypot(fx, fy) || 1;
  fx /= fl;
  fy /= fl;
  const stemStart = pr + 4;
  const stemEnd = pr + 26;
  const tipDist = pr + 42;
  const headHalf = 9;
  const sx = px + fx * stemStart;
  const sy = py + fy * stemStart;
  const ex = px + fx * stemEnd;
  const ey = py + fy * stemEnd;
  const tipX = px + fx * tipDist;
  const tipY = py + fy * tipDist;
  const ox = -fy * headHalf;
  const oy = fx * headHalf;
  ctx.save();
  ctx.strokeStyle = "rgba(251, 191, 36, 0.95)";
  ctx.fillStyle = "rgba(254, 249, 195, 0.88)";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(ex + ox, ey + oy);
  ctx.lineTo(ex - ox, ey - oy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * @param {number} roarUntil — sim time when roar ends
 */
export function drawLunaticRoarFx(ctx, player, simElapsed, roarUntil, bodyAlpha) {
  if (simElapsed >= roarUntil) return;
  const px = player.x;
  const py = player.y;
  const pr = player.r;
  const throb = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(simElapsed * 22));
  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    const rr = pr + 8 + i * 11 + throb * 10;
    const a = (0.42 - i * 0.07) * bodyAlpha * throb;
    ctx.strokeStyle = `rgba(220, 38, 38, ${a})`;
    ctx.lineWidth = 2.4 - i * 0.35;
    ctx.beginPath();
    ctx.arc(px, py, rr, 0, TAU);
    ctx.stroke();
  }
  const fx = player.facing.x;
  const fy = player.facing.y;
  const fl = Math.hypot(fx, fy) || 1;
  const fan = Math.PI * 0.42;
  const baseAng = Math.atan2(fy / fl, fx / fl);
  ctx.globalAlpha = 0.28 * bodyAlpha * throb;
  ctx.fillStyle = "rgba(248, 113, 113, 0.55)";
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.arc(px, py, pr + 36, baseAng - fan / 2, baseAng + fan / 2);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** @param {number} roarUntil */
export function drawLunaticRoarTimerBar(ctx, player, simElapsed, roarUntil, bodyAlpha) {
  if (simElapsed >= roarUntil) return;
  const px = player.x;
  const py = player.y;
  const pr = player.r;
  const dur = Math.max(1e-3, LUNATIC_ROAR_DURATION_SEC);
  const rem = Math.max(0, roarUntil - simElapsed);
  const ratio = clamp(rem / dur, 0, 1);
  const barW = 48;
  const barH = 5;
  const x = px - barW / 2;
  const y = py + pr + 11;
  ctx.save();
  ctx.globalAlpha = bodyAlpha;
  ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
  ctx.fillRect(x - 1, y - 1, barW + 2, barH + 2);
  ctx.strokeStyle = "rgba(248, 113, 113, 0.95)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 0.5, y - 0.5, barW + 1, barH + 1);
  ctx.fillStyle = "rgba(30, 41, 59, 0.98)";
  ctx.fillRect(x, y, barW, barH);
  ctx.fillStyle = ratio > 0.22 ? "#dc2626" : "#f87171";
  ctx.fillRect(x, y, barW * ratio, barH);
  ctx.restore();
}
