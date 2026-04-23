/**
 * Surge / gauntlet event hex — lock phases, safe pocket, travel waves, damage pulse.
 */
import {
  HEX_SIZE,
  ARENA_NEXUS_INNER_ENTER_R,
  ARENA_NEXUS_INNER_APOTHEM,
  SURGE_HEX_WAVES,
  SURGE_TRAVEL_DUR_FIRST,
  SURGE_TRAVEL_DUR_DECREMENT_PER_WAVE,
  SURGE_WAVE_PAUSE_SEC,
  SURGE_TILE_DAMAGE,
  SURGE_TILE_FLASH_SEC,
  SURGE_GAUNTLET_SAFE_HIT_R,
  SURGE_GAUNTLET_MIN_CENTER_SEP_PX,
} from "../../balance.js";
import { TAU } from "../../constants.js";

const SQRT3 = Math.sqrt(3);

function pointInsidePointyHex(px, py, cx, cy, vertexRadius) {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  if (dx > (SQRT3 / 2) * vertexRadius) return false;
  return dy <= vertexRadius - dx / SQRT3;
}

function vertexRadiusFromApothem(apothem) {
  return (2 * apothem) / SQRT3;
}

/**
 * @typedef {object} GauntletHexEventDeps
 * @property {() => number} getSimElapsed
 * @property {() => { x: number; y: number; r: number }} getPlayer
 * @property {(x: number, y: number) => { q: number; r: number }} worldToHex
 * @property {(q: number, r: number) => { x: number; y: number }} hexToWorld
 * @property {(q: number, r: number) => boolean} isSurgeHexTile
 * @property {(q: number, r: number) => boolean} isSurgeHexInteractive
 * @property {(q: number, r: number) => void} markProceduralSurgeHexSpent
 * @property {(amount: number, opts?: object) => void} damagePlayer
 * @property {(strength?: number, sec?: number) => void} bumpScreenShake
 * @property {() => void} dropSpecialEventJokerReward — `items/jokerEventReward` (special hex only).
 * @property {(q: number, r: number) => void} killHuntersOnSurgeHex
 * @property {(lockQ: number, lockR: number, surgePhase: number) => void} ejectHuntersFromSurgeLockHex
 * @property {() => boolean} [isCardPickupPaused]
 */

/**
 * Surge / gauntlet hex — REFERENCE `updateSurgeHex`, safe pocket, travel waves, screen flash.
 * @param {GauntletHexEventDeps} deps
 */
export function createGauntletHexEvent(deps) {
  const {
    getSimElapsed,
    getPlayer,
    worldToHex,
    hexToWorld,
    isSurgeHexTile,
    isSurgeHexInteractive,
    markProceduralSurgeHexSpent,
    damagePlayer,
    bumpScreenShake,
    dropSpecialEventJokerReward,
    killHuntersOnSurgeHex,
    ejectHuntersFromSurgeLockHex,
    isCardPickupPaused = () => false,
  } = deps;

  /** @type {0|1|2|3|4} */
  let phase = 0;
  let lockQ = 0;
  let lockR = 0;
  let wave = 1;
  let wasInSurgeHex = false;
  /** @type {'idle'|'travel'|'pause'} */
  let awaitMode = "idle";
  let travelStartAt = 0;
  let travelDur = 1;
  let pauseEndAt = 0;
  let safeX = 0;
  let safeY = 0;
  let prevSafeX = 0;
  let prevSafeY = 0;
  let hasPrevSafeBubble = false;
  let eligibleForInnerExitReward = false;
  let rewardPendingOnUnpause = false;
  /** Last known “inside inner reward hex” — primed at wave end so reward fires on inward cross only. */
  let wasInsideInnerRewardHex = false;
  let screenFlashUntil = 0;

  function reset() {
    phase = 0;
    lockQ = 0;
    lockR = 0;
    wave = 1;
    wasInSurgeHex = false;
    awaitMode = "idle";
    travelStartAt = 0;
    travelDur = 1;
    pauseEndAt = 0;
    safeX = 0;
    safeY = 0;
    prevSafeX = 0;
    prevSafeY = 0;
    hasPrevSafeBubble = false;
    eligibleForInnerExitReward = false;
    rewardPendingOnUnpause = false;
    wasInsideInnerRewardHex = false;
    screenFlashUntil = 0;
  }

  function travelDurationForWave(w) {
    return Math.max(0.05, SURGE_TRAVEL_DUR_FIRST - SURGE_TRAVEL_DUR_DECREMENT_PER_WAVE * (w - 1));
  }

  function lockTileMaxCenterDistPx() {
    const player = getPlayer();
    return Math.max(6, ARENA_NEXUS_INNER_APOTHEM - player.r - 0.75);
  }

  function outerWaitingMaxCenterDistPx() {
    const player = getPlayer();
    return Math.max(6, HEX_SIZE * (SQRT3 / 2) - player.r - 1.5);
  }

  function pickSafeAndPulseFrom(q, r) {
    const tc = hexToWorld(q, r);
    const apo = HEX_SIZE * (SQRT3 / 2) * 0.72;
    const maxSafeCenterDist = Math.max(10, lockTileMaxCenterDistPx() - SURGE_GAUNTLET_SAFE_HIT_R - 8);
    const distCap = Math.min(apo * 0.69, maxSafeCenterDist);
    const minSep = SURGE_GAUNTLET_MIN_CENTER_SEP_PX;

    const inPlayDisc = (sx, sy) => Math.hypot(sx - tc.x, sy - tc.y) <= maxSafeCenterDist + 1e-3;
    const farEnoughFromPrev = (sx, sy) => {
      if (!hasPrevSafeBubble) return true;
      return Math.hypot(sx - prevSafeX, sy - prevSafeY) >= minSep - 1e-3;
    };

    let sx = tc.x;
    let sy = tc.y;
    let found = false;
    for (let a = 0; a < 56; a++) {
      const ang = Math.random() * TAU;
      const dist = ((0.14 + Math.random() * 0.55) / 0.69) * distCap;
      const tx = tc.x + Math.cos(ang) * dist;
      const ty = tc.y + Math.sin(ang) * dist;
      if (inPlayDisc(tx, ty) && farEnoughFromPrev(tx, ty)) {
        sx = tx;
        sy = ty;
        found = true;
        break;
      }
    }
    if (!found && hasPrevSafeBubble) {
      const px = prevSafeX;
      const py = prevSafeY;
      for (let i = 0; i < 40; i++) {
        const ang = (i / 40) * TAU;
        const tx = px + Math.cos(ang) * minSep;
        const ty = py + Math.sin(ang) * minSep;
        if (inPlayDisc(tx, ty) && farEnoughFromPrev(tx, ty)) {
          sx = tx;
          sy = ty;
          found = true;
          break;
        }
      }
    }
    if (!found && hasPrevSafeBubble) {
      const vx = tc.x - prevSafeX;
      const vy = tc.y - prevSafeY;
      const vlen = Math.hypot(vx, vy) || 1;
      const ux = vx / vlen;
      const uy = vy / vlen;
      for (let s = maxSafeCenterDist; s >= minSep * 0.4; s -= maxSafeCenterDist * 0.07) {
        const tx = tc.x + ux * s;
        const ty = tc.y + uy * s;
        if (inPlayDisc(tx, ty) && farEnoughFromPrev(tx, ty)) {
          sx = tx;
          sy = ty;
          found = true;
          break;
        }
      }
    }
    if (!found && hasPrevSafeBubble) {
      for (let b = 0; b < 48; b++) {
        const ang = Math.random() * TAU;
        const dist = (0.3 + Math.random() * 0.7) * distCap;
        const tx = tc.x + Math.cos(ang) * dist;
        const ty = tc.y + Math.sin(ang) * dist;
        if (inPlayDisc(tx, ty) && farEnoughFromPrev(tx, ty)) {
          sx = tx;
          sy = ty;
          found = true;
          break;
        }
      }
    }
    if (!found) {
      const ang = Math.random() * TAU;
      const dist = ((0.14 + Math.random() * 0.55) / 0.69) * distCap;
      sx = tc.x + Math.cos(ang) * dist;
      sy = tc.y + Math.sin(ang) * dist;
    }
    safeX = sx;
    safeY = sy;
    prevSafeX = sx;
    prevSafeY = sy;
    hasPrevSafeBubble = true;
  }

  function beginTravelWave() {
    pickSafeAndPulseFrom(lockQ, lockR);
    travelDur = travelDurationForWave(wave);
    travelStartAt = getSimElapsed();
    awaitMode = "travel";
  }

  function hitNow() {
    const elapsed = getSimElapsed();
    screenFlashUntil = elapsed + SURGE_TILE_FLASH_SEC;
    bumpScreenShake(12, 0.18);
    const player = getPlayer();
    const inSafe = Math.hypot(player.x - safeX, player.y - safeY) <= SURGE_GAUNTLET_SAFE_HIT_R;
    if (!inSafe) damagePlayer(SURGE_TILE_DAMAGE, { surgeHexPulse: true });
  }

  function beginOuterLock(q, r) {
    phase = 1;
    lockQ = q;
    lockR = r;
    wave = 1;
    hasPrevSafeBubble = false;
    eligibleForInnerExitReward = false;
    rewardPendingOnUnpause = false;
    wasInsideInnerRewardHex = false;
    killHuntersOnSurgeHex(q, r);
    awaitMode = "idle";
    screenFlashUntil = 0;
    clampPlayerToLockHex();
  }

  function beginGauntletActive() {
    phase = 2;
    wave = 1;
    hasPrevSafeBubble = false;
    eligibleForInnerExitReward = false;
    rewardPendingOnUnpause = false;
    wasInsideInnerRewardHex = false;
    clampPlayerToLockHex();
    beginTravelWave();
  }

  function clampPlayerToLockHex() {
    clampPlayerToLockHexFor(getPlayer());
  }

  /** @param {{ x: number; y: number }} player */
  function clampPlayerSegment(player) {
    clampPlayerToLockHexFor(player);
  }

  /** @param {{ x: number; y: number }} player */
  function clampPlayerToLockHexFor(player) {
    // Only outer wait (1) and active gauntlet (2). Phase 3+ must not clamp — circular maxD vs pointy hex traps players at vertices.
    if (phase !== 1 && phase !== 2) return;
    const ph = worldToHex(player.x, player.y);
    if (ph.q !== lockQ || ph.r !== lockR) return;
    const c = hexToWorld(ph.q, ph.r);
    const maxD = phase === 1 ? outerWaitingMaxCenterDistPx() : lockTileMaxCenterDistPx();
    const dx = player.x - c.x;
    const dy = player.y - c.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d <= maxD) return;
    player.x = c.x + (dx / d) * maxD;
    player.y = c.y + (dy / d) * maxD;
  }

  function tick() {
    const elapsed = getSimElapsed();
    const player = getPlayer();
    const cardPaused = isCardPickupPaused();

    if (!cardPaused && phase === 3 && rewardPendingOnUnpause) {
      rewardPendingOnUnpause = false;
      dropSpecialEventJokerReward();
      phase = 4;
    }

    const ph = worldToHex(player.x, player.y);
    const inSurge = isSurgeHexTile(ph.q, ph.r);
    if (!inSurge) {
      wasInSurgeHex = false;
      if (phase === 4) {
        phase = 0;
      } else if (phase === 3) {
        rewardPendingOnUnpause = false;
        phase = 0;
        awaitMode = "travel";
        wave = 1;
        screenFlashUntil = 0;
        hasPrevSafeBubble = false;
        eligibleForInnerExitReward = false;
        wasInsideInnerRewardHex = false;
      } else if (phase === 1 || phase === 2) {
        phase = 0;
        awaitMode = "travel";
        wave = 1;
        screenFlashUntil = 0;
        hasPrevSafeBubble = false;
        eligibleForInnerExitReward = false;
        rewardPendingOnUnpause = false;
        wasInsideInnerRewardHex = false;
      }
      return;
    }
    const enteredThisFrame = inSurge && !wasInSurgeHex;
    wasInSurgeHex = true;
    if (enteredThisFrame && phase === 0 && isSurgeHexInteractive(ph.q, ph.r)) {
      beginOuterLock(ph.q, ph.r);
    }
    if (phase === 1 && ph.q === lockQ && ph.r === lockR) {
      const c = hexToWorld(lockQ, lockR);
      const innerVertexR = vertexRadiusFromApothem(ARENA_NEXUS_INNER_APOTHEM) + player.r;
      if (pointInsidePointyHex(player.x, player.y, c.x, c.y, innerVertexR)) {
        beginGauntletActive();
      }
    }
    if (phase === 3 && ph.q === lockQ && ph.r === lockR) {
      const c = hexToWorld(lockQ, lockR);
      const innerVertexR = vertexRadiusFromApothem(ARENA_NEXUS_INNER_APOTHEM) + player.r;
      const insideInner = pointInsidePointyHex(player.x, player.y, c.x, c.y, innerVertexR);
      const crossedIntoInner = insideInner && !wasInsideInnerRewardHex;
      wasInsideInnerRewardHex = insideInner;
      if (eligibleForInnerExitReward && crossedIntoInner) {
        eligibleForInnerExitReward = false;
        if (cardPaused) {
          rewardPendingOnUnpause = true;
        } else {
          dropSpecialEventJokerReward();
          phase = 4;
        }
      }
    }
    if (phase !== 2) return;
    if (ph.q !== lockQ || ph.r !== lockR) return;

    if (awaitMode === "travel") {
      const u = (elapsed - travelStartAt) / Math.max(1e-4, travelDur);
      if (u >= 1) {
        hitNow();
        pauseEndAt = elapsed + SURGE_WAVE_PAUSE_SEC;
        awaitMode = "pause";
      }
    } else if (awaitMode === "pause" && elapsed >= pauseEndAt) {
      wave += 1;
      if (wave > SURGE_HEX_WAVES) {
        phase = 3;
        awaitMode = "idle";
        eligibleForInnerExitReward = true;
        rewardPendingOnUnpause = false;
        {
          const c = hexToWorld(lockQ, lockR);
          const innerVertexR = vertexRadiusFromApothem(ARENA_NEXUS_INNER_APOTHEM) + player.r;
          wasInsideInnerRewardHex = pointInsidePointyHex(player.x, player.y, c.x, c.y, innerVertexR);
        }
        markProceduralSurgeHexSpent(lockQ, lockR);
      } else {
        beginTravelWave();
      }
    }
  }

  function postHunterTick() {
    ejectHuntersFromSurgeLockHex(lockQ, lockR, phase);
  }

  function getDrawState() {
    const elapsed = getSimElapsed();
    return {
      phase,
      lockQ,
      lockR,
      safeX,
      safeY,
      travelStartAt,
      travelDur,
      simElapsed: elapsed,
    };
  }

  function getScreenFlashUntil() {
    return screenFlashUntil;
  }

  function getPhase() {
    return phase;
  }

  /** Active during outer lock + waves only — blocks ordnance into the locked hex. Off in phase 3+ so the tile is not a cage after the gauntlet. */
  function isSurgeLockBarrierWorldPoint(px, py) {
    if (phase !== 1 && phase !== 2) return false;
    const h = worldToHex(px, py);
    if (h.q !== lockQ || h.r !== lockR) return false;
    const c = hexToWorld(h.q, h.r);
    return Math.hypot(px - c.x, py - c.y) <= HEX_SIZE + 4;
  }

  return {
    reset,
    tick,
    clampPlayerSegment,
    clampPlayerToLockHex,
    postHunterTick,
    getDrawState,
    getScreenFlashUntil,
    getPhase,
    isSurgeLockBarrierWorldPoint,
  };
}
