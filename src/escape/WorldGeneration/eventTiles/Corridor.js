/**
 * Halls **Corridor** — on entry, seal the player in a growing axial chain (lock + up to 3 extensions).
 * Entering cell 2 adds cell 3; entering 3 adds 4; entering 4 completes: clears the seal, marks tiles spent, halls key reward.
 */
import { HEX_SIZE } from "../../balance.js";
import { HEX_DIRS, axialHexSharedEdgeWorld, isAxialHexNeighbor } from "../../hexMath.js";
import {
  clampPlayerToExpandedHexChainUnion,
  pointInsidePointyHex,
} from "./innerHexZone.js";

/**
 * Second corridor cell: neighbor of the lock **opposite** the side the player is biased toward
 * (so it is always adjacent and stays in the center+6 sliding window while sealed).
 */
function oppositeNeighborTwinHex(lockQ, lockR, player, hexToWorld) {
  const c = hexToWorld(lockQ, lockR);
  const px = player.x - c.x;
  const py = player.y - c.y;
  let bestI = 0;
  let bestDot = -Infinity;
  for (let i = 0; i < HEX_DIRS.length; i++) {
    const d = HEX_DIRS[i];
    const n = hexToWorld(lockQ + d.q, lockR + d.r);
    const nx = n.x - c.x;
    const ny = n.y - c.y;
    const dot = px * nx + py * ny;
    if (dot > bestDot) {
      bestDot = dot;
      bestI = i;
    }
  }
  const opp = HEX_DIRS[(bestI + 3) % 6];
  return { mq: lockQ + opp.q, mr: lockR + opp.r };
}

function chainOccupancyKey(q, r) {
  return `${q},${r}`;
}

/** Next axial in the chain from `tip`, avoiding already-used hexes (no doubling back). */
function pickNextCorridorCell(tipQ, tipR, player, hexToWorld, chain) {
  const occ = new Set(chain.map((c) => chainOccupancyKey(c.q, c.r)));
  const primary = oppositeNeighborTwinHex(tipQ, tipR, player, hexToWorld);
  if (!occ.has(chainOccupancyKey(primary.mq, primary.mr))) return primary;
  for (const d of HEX_DIRS) {
    const nq = tipQ + d.q;
    const nr = tipR + d.r;
    if (occ.has(chainOccupancyKey(nq, nr))) continue;
    return { mq: nq, mr: nr };
  }
  return { mq: tipQ, mr: tipR };
}

/** Vertex radius aligned with Gauntlet barrier / Tribunal tile seal (`HEX_SIZE + 4`). */
const CORRIDOR_TILE_VERTEX_R = HEX_SIZE + 4;

/**
 * @typedef {object} CorridorHexEventDeps
 * @property {() => number} getSimElapsed
 * @property {() => { x: number; y: number; r: number; velX?: number; velY?: number }} getPlayer
 * @property {(x: number, y: number) => { q: number; r: number }} worldToHex
 * @property {(q: number, r: number) => { x: number; y: number }} hexToWorld
 * @property {(q: number, r: number) => boolean} isCorridorHexTile
 * @property {(q: number, r: number) => boolean} isCorridorHexInteractive
 * @property {(q: number, r: number) => void} killHuntersOnSurgeHex
 * @property {(cells: { q: number; r: number }[]) => void} [clearHallsTwinDroneEffectsOnAxialCells] — Halls twin-drone walls + pairs on these axials.
 * @property {(lockQ: number, lockR: number, surgePhase: number, mirrorQ?: number | null, mirrorR?: number | null, extraCells?: { q: number; r: number }[] | null) => void} ejectHuntersFromSurgeLockHex
 * @property {(mq: number, mr: number) => void} registerCorridorMirrorHex — forces extra `proceduralCorridor` anchor (non-interactive).
 * @property {() => void} clearCorridorMirrorHex
 * @property {(q: number, r: number) => void} markProceduralCorridorHexSpent
 * @property {() => void} grantCorridorKeyPickup
 * @property {(q: number, r: number) => void} invalidateHexTile
 * @property {() => boolean} [isCardPickupPaused]
 */

/**
 * @param {CorridorHexEventDeps} deps
 */
export function createCorridorHexEvent(deps) {
  const {
    getSimElapsed,
    getPlayer,
    worldToHex,
    hexToWorld,
    isCorridorHexTile,
    isCorridorHexInteractive,
    killHuntersOnSurgeHex,
    clearHallsTwinDroneEffectsOnAxialCells = () => {},
    ejectHuntersFromSurgeLockHex,
    registerCorridorMirrorHex,
    clearCorridorMirrorHex,
    markProceduralCorridorHexSpent,
    grantCorridorKeyPickup,
    invalidateHexTile,
    isCardPickupPaused = () => false,
  } = deps;

  /** @type {0|1} */
  let phase = 0;
  let wasInCorridor = false;
  /** Sealed walkable chain: [lock, …extensions], length 2–4 while `phase === 1`. */
  let corridorChain = /** @type {{ q: number; r: number }[]} */ ([]);
  /** Previous player axial while sealed (tip-entry detection). */
  let prevSealedAxialQ = /** @type {number | null} */ (null);
  let prevSealedAxialR = /** @type {number | null} */ (null);

  function reset() {
    const cells = corridorChain.slice();
    if (cells.length) {
      clearHallsTwinDroneEffectsOnAxialCells(cells);
    }
    clearCorridorMirrorHex();
    for (const c of cells) {
      invalidateHexTile(c.q, c.r);
    }
    corridorChain = [];
    prevSealedAxialQ = null;
    prevSealedAxialR = null;
    phase = 0;
    wasInCorridor = false;
  }

  /** @param {{ x: number; y: number }} player */
  function clampPlayerToLockHexFor(player) {
    if (phase !== 1 || corridorChain.length === 0) return;
    const tileSealR = CORRIDOR_TILE_VERTEX_R - player.r - 0.75;
    const centers = corridorChain.map((c) => hexToWorld(c.q, c.r));
    clampPlayerToExpandedHexChainUnion(player, centers, tileSealR);
  }

  function appendChainCell(mq, mr, player) {
    corridorChain.push({ q: mq, r: mr });
    registerCorridorMirrorHex(mq, mr);
    killHuntersOnSurgeHex(mq, mr);
    clearHallsTwinDroneEffectsOnAxialCells(corridorChain.slice());
    invalidateHexTile(mq, mr);
    clampPlayerToLockHexFor(player);
  }

  function completeCorridor() {
    const cells = corridorChain.slice();
    grantCorridorKeyPickup();
    for (const c of cells) {
      markProceduralCorridorHexSpent(c.q, c.r);
    }
    clearCorridorMirrorHex();
    clearHallsTwinDroneEffectsOnAxialCells(cells);
    // Do not invalidate spent chain hexes: keep cached `emptyTerrain` obstacle data so we do not
    // regenerate full tetris slabs under the spent corridor ring (`drawCorridorHexWorld` + green border).
    corridorChain = [];
    prevSealedAxialQ = null;
    prevSealedAxialR = null;
    phase = 0;
  }

  /** While sealed: extend the chain or finish when the player newly enters the current tip cell. */
  function maybeAdvanceCorridorChainOnTipEntry(player, ph) {
    if (corridorChain.length < 2) return;
    const tip = corridorChain[corridorChain.length - 1];
    const onTip = ph.q === tip.q && ph.r === tip.r;
    const prevOnTip =
      prevSealedAxialQ != null &&
      prevSealedAxialR != null &&
      prevSealedAxialQ === tip.q &&
      prevSealedAxialR === tip.r;
    const risingOntoTip = onTip && !prevOnTip && prevSealedAxialQ != null;
    prevSealedAxialQ = ph.q;
    prevSealedAxialR = ph.r;
    if (!risingOntoTip) return;

    if (corridorChain.length === 2) {
      const { mq, mr } = pickNextCorridorCell(tip.q, tip.r, player, hexToWorld, corridorChain);
      if (mq !== tip.q || mr !== tip.r) appendChainCell(mq, mr, player);
      return;
    }
    if (corridorChain.length === 3) {
      const { mq, mr } = pickNextCorridorCell(tip.q, tip.r, player, hexToWorld, corridorChain);
      if (mq !== tip.q || mr !== tip.r) appendChainCell(mq, mr, player);
      return;
    }
    if (corridorChain.length === 4) {
      completeCorridor();
    }
  }

  function tick(_dt = 1 / 60) {
    if (isCardPickupPaused()) return;
    if (phase === 1) {
      wasInCorridor = true;
      const player = getPlayer();
      const ph = worldToHex(player.x, player.y);
      maybeAdvanceCorridorChainOnTipEntry(player, ph);
      return;
    }

    const player = getPlayer();
    const ph = worldToHex(player.x, player.y);
    const inCorridor = isCorridorHexTile(ph.q, ph.r);

    if (!inCorridor) {
      wasInCorridor = false;
      return;
    }

    const enteredThisFrame = inCorridor && !wasInCorridor;
    wasInCorridor = true;

    if (enteredThisFrame && phase === 0 && isCorridorHexInteractive(ph.q, ph.r)) {
      phase = 1;
      const lockQ = ph.q;
      const lockR = ph.r;
      corridorChain = [{ q: lockQ, r: lockR }];
      killHuntersOnSurgeHex(lockQ, lockR);
      const { mq, mr } = oppositeNeighborTwinHex(lockQ, lockR, player, hexToWorld);
      if (mq !== lockQ || mr !== lockR) {
        corridorChain.push({ q: mq, r: mr });
        registerCorridorMirrorHex(mq, mr);
        killHuntersOnSurgeHex(mq, mr);
        clearHallsTwinDroneEffectsOnAxialCells(corridorChain.slice());
        invalidateHexTile(mq, mr);
      }
      prevSealedAxialQ = null;
      prevSealedAxialR = null;
      clampPlayerToLockHexFor(player);
    }
  }

  function postHunterTick() {
    if (phase !== 1 || corridorChain.length === 0) return;
    const lock = corridorChain[0];
    if (corridorChain.length >= 2) {
      const c1 = corridorChain[1];
      const extras = corridorChain.length > 2 ? corridorChain.slice(2) : null;
      ejectHuntersFromSurgeLockHex(lock.q, lock.r, 1, c1.q, c1.r, extras);
    } else {
      ejectHuntersFromSurgeLockHex(lock.q, lock.r, 1);
    }
  }

  /** @param {{ x: number; y: number }} player */
  function clampPlayerSegment(player) {
    clampPlayerToLockHexFor(player);
  }

  /** Same footprint test as {@link Gauntlet.js} `isSurgeLockBarrierWorldPoint` (phase 1 outer lock). */
  function isCorridorLockBarrierWorldPoint(px, py) {
    if (phase !== 1) return false;
    const h = worldToHex(px, py);
    for (const c of corridorChain) {
      if (h.q === c.q && h.r === c.r) {
        const wc = hexToWorld(c.q, c.r);
        return Math.hypot(px - wc.x, py - wc.y) <= HEX_SIZE + 4;
      }
    }
    return false;
  }

  /**
   * Full pointy-hex footprint of forced extension cells — hunters must never stand here while sealed.
   */
  function isCorridorMirrorHunterForbiddenWorldPoint(px, py) {
    if (phase !== 1) return false;
    for (let i = 1; i < corridorChain.length; i++) {
      const c = corridorChain[i];
      const wc = hexToWorld(c.q, c.r);
      if (pointInsidePointyHex(px, py, wc.x, wc.y, CORRIDOR_TILE_VERTEX_R)) return true;
    }
    return false;
  }

  function getDrawState() {
    return {
      phase,
      corridorChain: corridorChain.map((c) => ({ q: c.q, r: c.r })),
      simElapsed: getSimElapsed(),
    };
  }

  /** Shared-edge segments between consecutive chain neighbors (for obstacle cull). */
  function getTwinGateWorlds() {
    if (phase !== 1 || corridorChain.length < 2) return /** @type {{ x0: number; y0: number; x1: number; y1: number }[]} */ ([]);
    /** @type {{ x0: number; y0: number; x1: number; y1: number }[]} */
    const out = [];
    for (let i = 0; i < corridorChain.length - 1; i++) {
      const a = corridorChain[i];
      const b = corridorChain[i + 1];
      if (!isAxialHexNeighbor(a.q, a.r, b.q, b.r)) continue;
      const seg = axialHexSharedEdgeWorld(a.q, a.r, b.q, b.r, hexToWorld, HEX_SIZE);
      if (seg) out.push(seg);
    }
    return out;
  }

  /** @deprecated Prefer {@link getTwinGateWorlds}; first segment only. */
  function getTwinGateWorld() {
    const g = getTwinGateWorlds();
    return g.length ? g[0] : null;
  }

  return {
    reset,
    tick,
    postHunterTick,
    clampPlayerSegment,
    getDrawState,
    getTwinGateWorld,
    getTwinGateWorlds,
    isCorridorLockBarrierWorldPoint,
    isCorridorMirrorHunterForbiddenWorldPoint,
  };
}
