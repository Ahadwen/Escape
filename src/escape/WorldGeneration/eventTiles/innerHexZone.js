/**
 * Inner special-hex zone — matches `draw.js` pointy inner stroke (`HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE`)
 * plus player radius for hit tests, segment tunneling, and arena siege clamp.
 */
import { HEX_SIZE, ARENA_NEXUS_INNER_HEX_SCALE } from "../../balance.js";

const SQRT3 = Math.sqrt(3);

export function pointInsidePointyHex(px, py, cx, cy, vertexRadius) {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  if (dx > (SQRT3 / 2) * vertexRadius) return false;
  return dy <= vertexRadius - dx / SQRT3;
}

/** Circumradius of inner drawn hex + player body (same as legacy `vertexRadiusFromApothem(INNER_APOTHEM) + r`). */
export function innerInteractionVertexRadius(playerR) {
  return HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE + playerR;
}

const SEGMENT_INNER_STEPS = 22;

/**
 * True if the motion from prev→curr enters the expanded inner hex this frame, including
 * tunneling when both endpoints are outside but the segment passes through the region.
 */
export function crossedIntoExpandedInnerHex(prevX, prevY, currX, currY, cx, cy, vr) {
  const prevIn = pointInsidePointyHex(prevX, prevY, cx, cy, vr);
  const currIn = pointInsidePointyHex(currX, currY, cx, cy, vr);
  if (currIn && !prevIn) return true;
  if (prevIn || currIn) return false;
  for (let i = 1; i < SEGMENT_INNER_STEPS; i++) {
    const t = i / SEGMENT_INNER_STEPS;
    const sx = prevX + (currX - prevX) * t;
    const sy = prevY + (currY - prevY) * t;
    if (pointInsidePointyHex(sx, sy, cx, cy, vr)) return true;
  }
  return false;
}

/** Pull player center onto / inside the expanded inner hex boundary (arena siege clamp). */
export function clampPlayerCenterToExpandedInnerHex(player, cx, cy, vr) {
  if (pointInsidePointyHex(player.x, player.y, cx, cy, vr)) return;
  let lo = 0;
  let hi = 1;
  const px = player.x;
  const py = player.y;
  for (let k = 0; k < 22; k++) {
    const mid = (lo + hi) * 0.5;
    const tx = cx + (px - cx) * mid;
    const ty = cy + (py - cy) * mid;
    if (pointInsidePointyHex(tx, ty, cx, cy, vr)) lo = mid;
    else hi = mid;
  }
  const t = Math.max(0, lo - 1e-5);
  player.x = cx + (px - cx) * t;
  player.y = cy + (py - cy) * t;
}
