export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function distSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function pointToSegmentDistance(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const ab2 = abx * abx + aby * aby || 1;
  const apx = px - ax;
  const apy = py - ay;
  const t = clamp((apx * abx + apy * aby) / ab2, 0, 1);
  const cx = ax + abx * t;
  const cy = ay + aby * t;
  return Math.hypot(px - cx, py - cy);
}

export function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function intersectsRectCircle(circle, rect) {
  const nx = clamp(circle.x, rect.x, rect.x + rect.w);
  const ny = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - nx;
  const dy = circle.y - ny;
  return dx * dx + dy * dy <= circle.r * circle.r;
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
