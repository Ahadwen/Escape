import { HEX_SIZE, ROULETTE_INNER_HIT_R, ROULETTE_INNER_HEX_DRAW_R } from "../balance.js";
import { strokePointyHexOutline, fillPointyHexRainbowGlow } from "../draw.js";

const SQRT3 = Math.sqrt(3);

function pointInsidePointyHex(px, py, cx, cy, radius) {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  if (dx > (SQRT3 / 2) * radius) return false;
  return dy <= radius - dx / SQRT3;
}

/**
 * REFERENCE `updateRouletteHex` / `drawRouletteHexWorld`: outer crossing penalty, inner latch opens modal.
 */
export function createRouletteHexFlow({ hexKey }) {
  const OUTER_BARRIER_R = HEX_SIZE;
  const PENALTY_RING_R = HEX_SIZE - 160;
  let phase = 0;
  let lockQ = 0;
  let lockR = 0;
  let wasInHex = false;
  let innerExitLatch = false;
  /** Session flag while still inside the hex (REFERENCE `rouletteForgeComplete`). */
  let forgeComplete = false;
  let wasInsidePenaltyRing = false;
  /** @type {Set<string>} */
  const outerDamageAppliedKeys = new Set();
  let screenFlashUntil = 0;

  function resetLeavingHex() {
    phase = 0;
    forgeComplete = false;
    innerExitLatch = false;
    wasInHex = false;
    lockQ = 0;
    lockR = 0;
    wasInsidePenaltyRing = false;
  }

  function resetSession() {
    resetLeavingHex();
    outerDamageAppliedKeys.clear();
    screenFlashUntil = 0;
  }

  function onForgeSuccess() {
    forgeComplete = true;
    phase = 2;
  }

  function onForgeCancel() {
    // REFERENCE: modal closes; latch clears when leaving inner ring.
  }

  /**
   * @param {object} o
   * @param {() => boolean} o.isWorldPaused — card / forge / other full pauses
   * @param {(q: number, r: number) => boolean} o.isRouletteHexTile
   * @param {(q: number, r: number) => boolean} o.isRouletteHexInteractive
   * @param {() => { x: number, y: number }} o.getPlayer
   * @param {(x: number, y: number) => { q: number, r: number }} o.worldToHex
   * @param {(q: number, r: number) => { x: number, y: number }} o.hexToWorld
   * @param {() => number} o.getSimElapsed
   * @param {() => void} o.onOuterPenalty
   * @param {() => void} o.openRouletteModal
   */
  function tick(o) {
    if (o.isWorldPaused()) return;
    const player = o.getPlayer();
    const ph = o.worldToHex(player.x, player.y);
    const inHex = o.isRouletteHexTile(ph.q, ph.r);
    if (!inHex) {
      resetLeavingHex();
      return;
    }
    const rc = o.hexToWorld(ph.q, ph.r);
    const inInner = Math.hypot(player.x - rc.x, player.y - rc.y) <= ROULETTE_INNER_HIT_R;
    // Match the rendered pointy-hex ring geometry (not circular distance).
    const insidePenaltyRing = pointInsidePointyHex(player.x, player.y, rc.x, rc.y, PENALTY_RING_R + player.r);
    const enteredHexThisFrame = inHex && !wasInHex;
    wasInHex = true;

    if (enteredHexThisFrame && phase === 0 && o.isRouletteHexInteractive(ph.q, ph.r)) {
      lockQ = ph.q;
      lockR = ph.r;
      phase = 1;
      screenFlashUntil = 0;
      // Baseline on entry so damage only occurs on a real subsequent crossing.
      wasInsidePenaltyRing = insidePenaltyRing;
    }
    if (phase === 1 && ph.q === lockQ && ph.r === lockR) {
      const rk = hexKey(ph.q, ph.r);
      const crossedInnerRingInward = insidePenaltyRing && !wasInsidePenaltyRing;
      if (!outerDamageAppliedKeys.has(rk) && crossedInnerRingInward) {
        screenFlashUntil = o.getSimElapsed() + 0.4;
        o.onOuterPenalty();
        outerDamageAppliedKeys.add(rk);
      }
    }
    wasInsidePenaltyRing = insidePenaltyRing;

    if (
      phase === 1 &&
      ph.q === lockQ &&
      ph.r === lockR &&
      inInner &&
      !forgeComplete &&
      !innerExitLatch
    ) {
      innerExitLatch = true;
      o.openRouletteModal();
    }
    if (!inInner) innerExitLatch = false;
  }

  function onTileCacheEvicted(cacheKey, closeRouletteModalIfOpen) {
    if (hexKey(lockQ, lockR) === cacheKey) {
      closeRouletteModalIfOpen();
      resetLeavingHex();
    }
    outerDamageAppliedKeys.delete(cacheKey);
  }

  function drawWorld(ctx, activeHexes, hexToWorld, simElapsed, isRouletteHexTile, isRouletteHexInteractive, isRouletteSpent) {
    for (const h of activeHexes) {
      if (!isRouletteHexTile(h.q, h.r)) continue;
      const c = hexToWorld(h.q, h.r);
      const cx = c.x;
      const cy = c.y;
      const k = hexKey(h.q, h.r);
      const isInteractive = isRouletteHexInteractive(h.q, h.r);
      const outerYellow = "rgba(250, 204, 21, 0.96)";
      const innerRing = outerDamageAppliedKeys.has(k) ? "rgba(250, 204, 21, 0.94)" : "rgba(249, 115, 22, 0.92)";
      strokePointyHexOutline(ctx, cx, cy, OUTER_BARRIER_R, outerYellow, 3.4, 18);
      if (isInteractive) strokePointyHexOutline(ctx, cx, cy, PENALTY_RING_R, innerRing, 2.6, 14);
      fillPointyHexRainbowGlow(ctx, cx, cy, ROULETTE_INNER_HEX_DRAW_R, simElapsed);
    }
  }

  function isOuterBarrierWorldPoint(px, py, worldToHex, hexToWorld, isRouletteHexInteractive) {
    const h = worldToHex(px, py);
    if (!isRouletteHexInteractive(h.q, h.r)) return false;
    const c = hexToWorld(h.q, h.r);
    return Math.hypot(px - c.x, py - c.y) <= OUTER_BARRIER_R + 1.5;
  }

  function getScreenFlashUntil() {
    return screenFlashUntil;
  }

  function getLock() {
    return { q: lockQ, r: lockR };
  }

  return {
    tick,
    resetSession,
    onTileCacheEvicted,
    onForgeSuccess,
    onForgeCancel,
    drawWorld,
    getLock,
    getScreenFlashUntil,
    /** @param {number} t */
    setScreenFlashUntil(t) {
      screenFlashUntil = t;
    },
    isOuterBarrierWorldPoint,
    outerDamageHas(key) {
      return outerDamageAppliedKeys.has(key);
    },
  };
}
