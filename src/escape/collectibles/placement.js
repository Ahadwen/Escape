import { TAU } from "../constants.js";
import { randRange } from "../rng.js";

function circleRectOverlap(cx, cy, cr, rect) {
  const px = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const py = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - px;
  const dy = cy - py;
  return dx * dx + dy * dy < cr * cr;
}

function circleHitsAnyObstacle(cx, cy, r, obstacles) {
  for (const o of obstacles) {
    if (circleRectOverlap(cx, cy, r, o)) return true;
  }
  return false;
}

function separatedFromCollectibles(x, y, r, collectibles, minGap = 68) {
  for (const c of collectibles) {
    if (Math.hypot(c.x - x, c.y - y) < c.r + r + minGap) return false;
  }
  return true;
}

function spawnLootPointClear(x, y, r, player, obstacles, collectibles, worldToHex, isLootForbiddenHex) {
  if (isLootForbiddenHex && worldToHex) {
    const h = worldToHex(x, y);
    if (isLootForbiddenHex(h.q, h.r)) return false;
  }
  if (circleHitsAnyObstacle(x, y, r, obstacles)) return false;
  if (!separatedFromCollectibles(x, y, r, collectibles)) return false;
  const rr = r + player.r + 44;
  const dx = x - player.x;
  const dy = y - player.y;
  if (dx * dx + dy * dy <= rr * rr) return false;
  return true;
}

/**
 * REFERENCE-style open point: ring around the player mixed with jitter inside active hex cells.
 *
 * @param {object} opts
 * @param {{ x: number, y: number, r: number }} opts.player
 * @param {Array<{ x: number, y: number, w: number, h: number }>} opts.obstacles
 * @param {Array<{ x: number, y: number, r: number }>} opts.collectibles
 * @param {Array<{ q: number, r: number }>} opts.activeHexes
 * @param {(q: number, r: number) => { x: number, y: number }} opts.hexToWorld
 * @param {number} opts.tileW
 * @param {number} opts.canvasW
 * @param {number} opts.canvasH
 * @param {number} opts.hitR
 * @param {number} [opts.attempts]
 * @param {(x: number, y: number) => { q: number, r: number }} [opts.worldToHex]
 * @param {(q: number, r: number) => boolean} [opts.isLootForbiddenHex] — spawn tile (0,0) and procedural event hexes (arena, surge, roulette, forge).
 * @returns {{ x: number, y: number, r: number } | null}
 */
export function randomOpenLootPoint(opts) {
  const {
    player,
    obstacles,
    collectibles,
    activeHexes,
    hexToWorld,
    worldToHex,
    tileW,
    canvasW,
    canvasH,
    hitR,
    attempts = 96,
    isLootForbiddenHex,
  } = opts;

  const dMin = 96 + hitR;
  const dMax = Math.min(canvasW, canvasH) * 0.66;
  const baseHexes = activeHexes.length ? activeHexes : [{ q: 0, r: 0 }];
  const sourceHexes = isLootForbiddenHex ? baseHexes.filter((h) => !isLootForbiddenHex(h.q, h.r)) : baseHexes;

  for (let i = 0; i < attempts; i++) {
    let candidate;
    const useHexJitter = i % 2 === 1 && sourceHexes.length > 0;
    if (!useHexJitter) {
      const ang = Math.random() * TAU;
      const d = randRange(dMin, dMax);
      candidate = { x: player.x + Math.cos(ang) * d, y: player.y + Math.sin(ang) * d, r: hitR };
    } else {
      const h = sourceHexes[Math.floor(Math.random() * sourceHexes.length)];
      const c = hexToWorld(h.q, h.r);
      candidate = {
        x: c.x + randRange(-tileW * 0.46, tileW * 0.46),
        y: c.y + randRange(-tileW * 0.46, tileW * 0.46),
        r: hitR,
      };
    }
    if (spawnLootPointClear(candidate.x, candidate.y, candidate.r, player, obstacles, collectibles, worldToHex, isLootForbiddenHex)) {
      return candidate;
    }
  }

  for (let j = 0; j < 40; j++) {
    const ang = Math.random() * TAU;
    const d = randRange(dMin, dMax * 0.92);
    const candidate = { x: player.x + Math.cos(ang) * d, y: player.y + Math.sin(ang) * d, r: hitR };
    if (spawnLootPointClear(candidate.x, candidate.y, candidate.r, player, obstacles, collectibles, worldToHex, isLootForbiddenHex)) {
      return candidate;
    }
  }

  for (let k = 0; k < 24; k++) {
    const candidate = { x: player.x + randRange(-280, 280), y: player.y + randRange(-280, 280), r: hitR };
    if (spawnLootPointClear(candidate.x, candidate.y, candidate.r, player, obstacles, collectibles, worldToHex, isLootForbiddenHex)) {
      return candidate;
    }
  }

  for (let f = 0; f < 32; f++) {
    const p = { x: player.x + randRange(-140, 140), y: player.y + randRange(-140, 140), r: hitR };
    if (spawnLootPointClear(p.x, p.y, p.r, player, obstacles, collectibles, worldToHex, isLootForbiddenHex)) return p;
  }

  for (let z = 0; z < 24; z++) {
    const p = { x: player.x + randRange(-100, 100), y: player.y + randRange(-100, 100), r: hitR };
    if (spawnLootPointClear(p.x, p.y, p.r, player, obstacles, collectibles, worldToHex, isLootForbiddenHex)) return p;
  }

  return null;
}
