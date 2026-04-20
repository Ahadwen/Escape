/**
 * REFERENCE `entities.attackRings` — expanding stroke rings for ability impacts.
 * @typedef {{ x: number; y: number; r: number; color: string; bornAt: number; expiresAt: number }} AttackRing
 */

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

/**
 * @param {AttackRing[]} rings
 * @param {number} elapsed
 */
export function tickAttackRings(rings, elapsed) {
  for (let i = rings.length - 1; i >= 0; i--) {
    if (elapsed >= rings[i].expiresAt) rings.splice(i, 1);
  }
}

/**
 * @param {AttackRing[]} rings
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} elapsed
 */
export function drawAttackRings(ctx, rings, elapsed) {
  for (const ring of rings) {
    const span = Math.max(1e-4, ring.expiresAt - ring.bornAt);
    const t = clamp((elapsed - ring.bornAt) / span, 0, 1);
    const rr = ring.r * (1 + t * 0.28);
    ctx.save();
    ctx.strokeStyle = ring.color;
    ctx.globalAlpha = 0.85 * (1 - t);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, rr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * @param {AttackRing[]} rings
 * @param {number} x
 * @param {number} y
 * @param {number} r
 * @param {string} color
 * @param {number} bornAt
 * @param {number} durationSec
 */
export function pushAttackRing(rings, x, y, r, color, bornAt, durationSec) {
  rings.push({
    x,
    y,
    r,
    color,
    bornAt,
    expiresAt: bornAt + durationSec,
  });
}
