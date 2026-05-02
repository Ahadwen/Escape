import { TAU } from "../constants.js";

export function distSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

export function vectorToTarget(from, target) {
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

/** Circle vs axis-aligned rect overlap (REFERENCE-style obstacle test). */
export function intersectsRectCircle(circle, rect) {
  const cx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
  const dx = circle.x - cx;
  const dy = circle.y - cy;
  return dx * dx + dy * dy < circle.r * circle.r;
}

export function lineIntersectsRect(x1, y1, x2, y2, rect) {
  const steps = Math.max(6, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 12));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return true;
  }
  return false;
}

/** Wrap angle to (-π, π]. */
export function normalizeAngle(a) {
  let x = a;
  while (x <= -Math.PI) x += TAU;
  while (x > Math.PI) x -= TAU;
  return x;
}

/**
 * Whether a circle at (px,py) with radius `pr` can overlap an annular sector
 * from pivot (ox,oy): radii [rMin,rMax], angles a0→a1 (a1 may be CCW or CW from a0).
 */
export function annularSectorContainsCircle(ox, oy, rMin, rMax, a0, a1, px, py, pr) {
  const dx = px - ox;
  const dy = py - oy;
  const d = Math.hypot(dx, dy);
  const rIn = Math.max(0, rMin - pr);
  const rOut = rMax + pr;
  if (d < rIn || d > rOut) return false;
  const ap = Math.atan2(dy, dx);
  const sweep = normalizeAngle(a1 - a0);
  const rel = normalizeAngle(ap - a0);
  const margin = 0.04;
  if (sweep >= 0) return rel >= -margin && rel <= sweep + margin;
  return rel <= margin && rel >= sweep - margin;
}

export function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const wx = px - x1;
  const wy = py - y1;
  const c1 = vx * wx + vy * wy;
  if (c1 <= 0) return Math.hypot(px - x1, py - y1);
  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return Math.hypot(px - x2, py - y2);
  const b = c1 / c2;
  const bx = x1 + b * vx;
  const by = y1 + b * vy;
  return Math.hypot(px - bx, py - by);
}

export function outOfBoundsCircle() {
  return false;
}
