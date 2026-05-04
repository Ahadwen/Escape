/**
 * Halls **Tribunal** hex — two-step seal: crossing the **full tile** outer boundary commits the axial cell and clamps you
 * to that outer hex; crossing the **inner** nexus hex then starts combat (inner clamp + annulus barrier + rounds).
 * Three combat rounds (6s / 10s / 6s) with 3s gaps, then a **Halls Tribunal Key** reward modal (drag key into ring slot; no Joker card); seals release on reset / reward exit as today.
 * Round 1: elite halls rotor. Round 2: two inner-hex “tribunal bouncers” (ghost-like billiard chasers). Round 3: ten fast-lock twin pairs.
 */
import { HEX_SIZE, ARENA_NEXUS_REWARD_MODAL_DELAY_SEC, PLAYER_RADIUS } from "../../balance.js";
import { HEX_DIRS } from "../../hexMath.js";
import {
  pointInsidePointyHex,
  innerInteractionVertexRadius,
  crossedIntoExpandedInnerHex,
  clampPlayerCenterToExpandedInnerHex,
} from "./innerHexZone.js";

const TRIBUNAL_ROUND_R1_SEC = 6;
const TRIBUNAL_ROUND_R2_SEC = 10;
const TRIBUNAL_ROUND_R3_SEC = 6;
const TRIBUNAL_GAP_SEC = 3;
const TRIBUNAL_TWIN_PAIR_COUNT = 10;
const TRIBUNAL_TWIN_SPAWN_SPACING = TRIBUNAL_ROUND_R3_SEC / TRIBUNAL_TWIN_PAIR_COUNT;

/** Vertex radius matching spawner / Gauntlet barrier disk (`HEX_SIZE + 4`). */
const TRIBUNAL_TILE_VERTEX_R = HEX_SIZE + 4;

/**
 * @typedef {object} TribunalHexEventDeps
 * @property {() => number} getSimElapsed
 * @property {() => { x: number; y: number; r: number; velX?: number; velY?: number }} getPlayer
 * @property {(x: number, y: number) => { q: number; r: number }} worldToHex
 * @property {(q: number, r: number) => { x: number; y: number }} hexToWorld
 * @property {(q: number, r: number) => boolean} isTribunalHexTile
 * @property {(q: number, r: number) => boolean} isTribunalHexInteractive
 * @property {(q: number, r: number) => void} markProceduralTribunalHexSpent
 * @property {(q: number, r: number) => void} grantTribunalKeyPickup
 * @property {(type: string, x: number, y: number, opts?: object) => void} spawnHunter
 * @property {(q: number, r: number) => void} killHuntersOnTribunalHex
 * @property {(id: number) => void} cullTribunalEncounter
 * @property {(cx: number, cy: number, id: number) => void} spawnHallsTwinPairNearTribunal
 * @property {(q: number, r: number, opts?: { excludeTribunalEncounterId?: number }) => void} ejectHuntersFromTribunalOuterLock
 * @property {() => boolean} [isCardPickupPaused]
 */

/**
 * @param {TribunalHexEventDeps} deps
 */
export function createTribunalHexEvent(deps) {
  const {
    getSimElapsed,
    getPlayer,
    worldToHex,
    hexToWorld,
    isTribunalHexTile,
    isTribunalHexInteractive,
    markProceduralTribunalHexSpent,
    grantTribunalKeyPickup,
    spawnHunter,
    killHuntersOnTribunalHex,
    cullTribunalEncounter,
    spawnHallsTwinPairNearTribunal,
    ejectHuntersFromTribunalOuterLock,
    isCardPickupPaused = () => false,
  } = deps;

  /** @type {'idle'|'r1'|'gap1'|'r2'|'gap2'|'r3'|'reward'} */
  let mode = "idle";
  let lockQ = 0;
  let lockR = 0;
  let segmentEndAt = 0;
  let encounterId = 0;
  let twinSpawned = 0;
  let nextTwinSpawnAt = 0;
  let wasInTribunalHex = false;
  let cardRewardAt = 0;
  let rewardPendingOnUnpause = false;
  /** True after the player crosses into this cell's full-tile outer hex (before inner / combat). */
  let outerSealCommitted = false;

  function reset() {
    mode = "idle";
    lockQ = 0;
    lockR = 0;
    segmentEndAt = 0;
    twinSpawned = 0;
    nextTwinSpawnAt = 0;
    wasInTribunalHex = false;
    cardRewardAt = 0;
    rewardPendingOnUnpause = false;
    outerSealCommitted = false;
  }

  function worldCenter() {
    return hexToWorld(lockQ, lockR);
  }

  function isCombatBarrierPhase() {
    return mode === "r1" || mode === "gap1" || mode === "r2" || mode === "gap2" || mode === "r3";
  }

  /**
   * Gauntlet-style world barrier (wired like `isSurgeLockBarrierWorldPoint`), but **pointy-hex**:
   * on the locked axial cell, the annulus between the inner nexus hex and the full tile footprint blocks ordnance / LoS.
   */
  function isLockBarrierWorldPoint(px, py) {
    if (!isCombatBarrierPhase()) return false;
    const h = worldToHex(px, py);
    if (h.q !== lockQ || h.r !== lockR) return false;
    const c = hexToWorld(lockQ, lockR);
    if (!pointInsidePointyHex(px, py, c.x, c.y, TRIBUNAL_TILE_VERTEX_R)) return false;
    const vrInner = innerInteractionVertexRadius(PLAYER_RADIUS);
    return !pointInsidePointyHex(px, py, c.x, c.y, vrInner - 0.5);
  }

  /** Only the full-tile outer boundary (idle, after outer seal — annulus walkable until inner combat). */
  function clampPlayerToTribunalOuterTileOnly(player) {
    if (!outerSealCommitted || mode !== "idle") return;
    const c = hexToWorld(lockQ, lockR);
    const tileSealR = TRIBUNAL_TILE_VERTEX_R - player.r - 0.75;
    clampPlayerCenterToExpandedInnerHex(player, c.x, c.y, tileSealR);
  }

  /** Full tile seal + Gauntlet-style ring + inner nexus (combat rounds and gaps only). */
  function clampPlayerToTribunalCombatFootprint(player) {
    if (!isCombatBarrierPhase()) return;
    const c = hexToWorld(lockQ, lockR);
    const tileSealR = TRIBUNAL_TILE_VERTEX_R - player.r - 0.75;
    clampPlayerCenterToExpandedInnerHex(player, c.x, c.y, tileSealR);
    const ph = worldToHex(player.x, player.y);
    if (ph.q !== lockQ || ph.r !== lockR || !isTribunalHexTile(lockQ, lockR)) return;
    const outerVr = HEX_SIZE + player.r;
    clampPlayerCenterToExpandedInnerHex(player, c.x, c.y, outerVr);
    clampPlayerCenterToExpandedInnerHex(player, c.x, c.y, innerInteractionVertexRadius(player.r));
  }

  function beginCombat(q, r) {
    const elapsed = getSimElapsed();
    lockQ = q;
    lockR = r;
    outerSealCommitted = true;
    encounterId++;
    killHuntersOnTribunalHex(q, r);
    ejectHuntersFromTribunalOuterLock(q, r);
    segmentEndAt = elapsed + TRIBUNAL_ROUND_R1_SEC;
    mode = "r1";
    const player = getPlayer();
    clampPlayerToTribunalCombatFootprint(player);
    const { x: cx, y: cy } = hexToWorld(q, r);
    spawnHunter("hallsRotor", cx, cy, {
      hallsRotorTribunalElite: true,
      tribunalEncounterId: encounterId,
      allowSpecialHexFootprintSpawn: true,
    });
  }

  function grantRewardIfDue(elapsed, cardPaused) {
    if (cardRewardAt <= 0) return;
    if (elapsed >= cardRewardAt) {
      if (!cardPaused) {
        cardRewardAt = 0;
        rewardPendingOnUnpause = false;
        grantTribunalKeyPickup(lockQ, lockR);
      } else {
        rewardPendingOnUnpause = true;
      }
    }
    if (!cardPaused && rewardPendingOnUnpause) {
      rewardPendingOnUnpause = false;
      cardRewardAt = 0;
      grantTribunalKeyPickup(lockQ, lockR);
    }
  }

  function tick(dt = 1 / 60) {
    const elapsed = getSimElapsed();
    const player = getPlayer();
    const cardPaused = isCardPickupPaused();
    const pdt = Math.max(1e-5, dt);

    if (mode === "reward") {
      const ph = worldToHex(player.x, player.y);
      const inTribunal = isTribunalHexTile(ph.q, ph.r);
      grantRewardIfDue(elapsed, cardPaused);
      if (!inTribunal || ph.q !== lockQ || ph.r !== lockR) {
        if (cardRewardAt > 0) {
          if (!cardPaused) {
            grantTribunalKeyPickup(lockQ, lockR);
            cardRewardAt = 0;
            rewardPendingOnUnpause = false;
          } else {
            rewardPendingOnUnpause = true;
            return;
          }
        }
        reset();
      }
      return;
    }

    if (isCombatBarrierPhase()) {
      clampPlayerToTribunalCombatFootprint(player);
    } else if (outerSealCommitted && mode === "idle") {
      clampPlayerToTribunalOuterTileOnly(player);
    }

    const ph = worldToHex(player.x, player.y);
    const inTribunal = isTribunalHexTile(ph.q, ph.r);

    if (!inTribunal) {
      wasInTribunalHex = false;
      if (isCombatBarrierPhase()) {
        const c = hexToWorld(lockQ, lockR);
        clampPlayerCenterToExpandedInnerHex(player, c.x, c.y, TRIBUNAL_TILE_VERTEX_R - player.r - 0.75);
      } else if (outerSealCommitted && mode === "idle") {
        const c = hexToWorld(lockQ, lockR);
        clampPlayerCenterToExpandedInnerHex(player, c.x, c.y, TRIBUNAL_TILE_VERTEX_R - player.r - 0.75);
      } else if (mode !== "idle") {
        cullTribunalEncounter(encounterId);
        reset();
      }
      return;
    }

    if (mode === "idle") {
      const prevX = player.x - (player.velX || 0) * pdt;
      const prevY = player.y - (player.velY || 0) * pdt;
      const prevPh = worldToHex(prevX, prevY);
      const outerCrossR = TRIBUNAL_TILE_VERTEX_R - player.r - 0.75;

      /**
       * Axial snap lags the body on edges: `ph` can still be a neighbor while the circle already
       * entered this tribunal's outer hex — test current, previous, and neighbors (Gauntlet / surge parity).
       */
      function findInteractiveTribunalTouchingOuterMotion() {
        const seen = new Set();
        /** @type {{ q: number; r: number }[]} */
        const cand = [];
        const push = (q, r) => {
          const k = `${q},${r}`;
          if (seen.has(k)) return;
          seen.add(k);
          cand.push({ q, r });
        };
        push(ph.q, ph.r);
        push(prevPh.q, prevPh.r);
        for (const d of HEX_DIRS) push(ph.q + d.q, ph.r + d.r);

        for (const cell of cand) {
          if (!isTribunalHexInteractive(cell.q, cell.r)) continue;
          const cw = hexToWorld(cell.q, cell.r);
          if (
            pointInsidePointyHex(player.x, player.y, cw.x, cw.y, outerCrossR) ||
            crossedIntoExpandedInnerHex(prevX, prevY, player.x, player.y, cw.x, cw.y, outerCrossR)
          ) {
            return cell;
          }
        }
        return null;
      }

      const motionCell = findInteractiveTribunalTouchingOuterMotion();
      if (!motionCell) {
        wasInTribunalHex = false;
        return;
      }

      if (!outerSealCommitted) {
        lockQ = motionCell.q;
        lockR = motionCell.r;
        outerSealCommitted = true;
        wasInTribunalHex = true;
        clampPlayerToTribunalOuterTileOnly(player);
        return;
      }

      if (motionCell.q !== lockQ || motionCell.r !== lockR) {
        wasInTribunalHex = false;
        return;
      }

      const c = hexToWorld(lockQ, lockR);
      const vrInner = innerInteractionVertexRadius(player.r);
      if (
        pointInsidePointyHex(player.x, player.y, c.x, c.y, vrInner) ||
        crossedIntoExpandedInnerHex(prevX, prevY, player.x, player.y, c.x, c.y, vrInner)
      ) {
        beginCombat(lockQ, lockR);
      }
      wasInTribunalHex = true;
      return;
    }

    wasInTribunalHex = true;

    clampPlayerToTribunalCombatFootprint(player);

    if (mode === "r1" && elapsed >= segmentEndAt) {
      cullTribunalEncounter(encounterId);
      segmentEndAt = elapsed + TRIBUNAL_GAP_SEC;
      mode = "gap1";
      return;
    }
    if (mode === "gap1" && elapsed >= segmentEndAt) {
      const { x: cx, y: cy } = worldCenter();
      const spread = 92;
      const dieAt = elapsed + TRIBUNAL_ROUND_R2_SEC;
      const baseOpts = {
        tribunalEncounterId: encounterId,
        allowSpecialHexFootprintSpawn: true,
        dieAtOverride: dieAt,
        hallsTribunalInnerLockQ: lockQ,
        hallsTribunalInnerLockR: lockR,
      };
      spawnHunter("hallsTribunalBouncer", cx - spread * 0.7, cy + spread * 0.35, {
        ...baseOpts,
        hallsTribunalBouncerLead: false,
      });
      spawnHunter("hallsTribunalBouncer", cx + spread * 0.7, cy - spread * 0.35, {
        ...baseOpts,
        hallsTribunalBouncerLead: true,
      });
      segmentEndAt = elapsed + TRIBUNAL_ROUND_R2_SEC;
      mode = "r2";
      return;
    }
    if (mode === "r2" && elapsed >= segmentEndAt) {
      cullTribunalEncounter(encounterId);
      segmentEndAt = elapsed + TRIBUNAL_GAP_SEC;
      mode = "gap2";
      return;
    }
    if (mode === "gap2" && elapsed >= segmentEndAt) {
      mode = "r3";
      twinSpawned = 0;
      nextTwinSpawnAt = elapsed;
      segmentEndAt = elapsed + TRIBUNAL_ROUND_R3_SEC;
      return;
    }
    if (mode === "r3") {
      const { x: cx, y: cy } = worldCenter();
      while (twinSpawned < TRIBUNAL_TWIN_PAIR_COUNT && elapsed >= nextTwinSpawnAt) {
        spawnHallsTwinPairNearTribunal(cx, cy, encounterId);
        twinSpawned++;
        nextTwinSpawnAt += TRIBUNAL_TWIN_SPAWN_SPACING;
      }
      if (elapsed >= segmentEndAt) {
        cullTribunalEncounter(encounterId);
        markProceduralTribunalHexSpent(lockQ, lockR);
        mode = "reward";
        rewardPendingOnUnpause = false;
        cardRewardAt = elapsed + ARENA_NEXUS_REWARD_MODAL_DELAY_SEC;
      }
      return;
    }
  }

  function postHunterTick() {
    if (isCombatBarrierPhase()) {
      ejectHuntersFromTribunalOuterLock(lockQ, lockR, { excludeTribunalEncounterId: encounterId });
    }
  }

  function clampPlayerSegment(player) {
    if (isCombatBarrierPhase()) {
      clampPlayerToTribunalCombatFootprint(player);
    } else if (outerSealCommitted && mode === "idle") {
      clampPlayerToTribunalOuterTileOnly(player);
    }
  }

  function getDrawState() {
    const elapsed = getSimElapsed();
    const combat = isCombatBarrierPhase();
    const inRoundGap = mode === "gap1" || mode === "gap2";
    return {
      phase: combat ? 1 : mode === "reward" ? 2 : 0,
      lockQ,
      lockR,
      simElapsed: elapsed,
      gapRemainSec: inRoundGap ? Math.max(0, segmentEndAt - elapsed) : null,
      gapTotalSec: TRIBUNAL_GAP_SEC,
    };
  }

  return {
    reset,
    tick,
    postHunterTick,
    clampPlayerSegment,
    getDrawState,
    isLockBarrierWorldPoint,
  };
}
