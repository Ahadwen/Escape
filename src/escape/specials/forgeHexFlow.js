import { HEX_SIZE, ROULETTE_INNER_HIT_R, ROULETTE_INNER_HEX_DRAW_R } from "../balance.js";
import { strokePointyHexOutline, drawForgeHexCell } from "../draw.js";

const SQRT3 = Math.sqrt(3);

function pointInsidePointyHex(px, py, cx, cy, radius) {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  if (dx > (SQRT3 / 2) * radius) return false;
  return dy <= radius - dx / SQRT3;
}

/**
 * Same interaction pattern as roulette (`rouletteHexFlow.js`), with forge palette + inner `drawForgeHexCell`.
 */
export function createForgeHexFlow({ hexKey }) {
  const OUTER_BARRIER_R = HEX_SIZE;
  const PENALTY_RING_R = HEX_SIZE - 160;
  let phase = 0;
  let lockQ = 0;
  let lockR = 0;
  let wasInHex = false;
  let innerExitLatch = false;
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

  function tick(o) {
    if (o.isWorldPaused()) return;
    const player = o.getPlayer();
    const ph = o.worldToHex(player.x, player.y);
    const inHex = o.isForgeHexTile(ph.q, ph.r);
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

    if (enteredHexThisFrame && phase === 0 && o.isForgeHexInteractive(ph.q, ph.r)) {
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
      o.openForgeModal();
    }
    if (!inInner) innerExitLatch = false;
  }

  function onTileCacheEvicted(cacheKey, closeForgeModalIfOpen) {
    if (hexKey(lockQ, lockR) === cacheKey) {
      closeForgeModalIfOpen();
      resetLeavingHex();
    }
    outerDamageAppliedKeys.delete(cacheKey);
  }

  function drawWorld(ctx, activeHexes, hexToWorld, simElapsed, isForgeHexTile, isForgeHexInteractive, isForgeSpent) {
    for (const h of activeHexes) {
      if (!isForgeHexTile(h.q, h.r)) continue;
      const c = hexToWorld(h.q, h.r);
      const cx = c.x;
      const cy = c.y;
      const k = hexKey(h.q, h.r);
      const isInteractive = isForgeHexInteractive(h.q, h.r);
      const outerYellow = "rgba(250, 204, 21, 0.96)";
      const innerRing = outerDamageAppliedKeys.has(k) ? "rgba(250, 204, 21, 0.94)" : "rgba(217, 119, 6, 0.94)";
      strokePointyHexOutline(ctx, cx, cy, OUTER_BARRIER_R, outerYellow, 3.4, 18);
      if (isInteractive) strokePointyHexOutline(ctx, cx, cy, PENALTY_RING_R, innerRing, 2.6, 14);
      drawForgeHexCell(ctx, cx, cy, ROULETTE_INNER_HEX_DRAW_R, simElapsed, isForgeSpent(h.q, h.r));
    }
  }

  function isOuterBarrierWorldPoint(px, py, worldToHex, hexToWorld, isForgeHexInteractive) {
    const h = worldToHex(px, py);
    if (!isForgeHexInteractive(h.q, h.r)) return false;
    const c = hexToWorld(h.q, h.r);
    return Math.hypot(px - c.x, py - c.y) <= OUTER_BARRIER_R + 1.5;
  }

  return {
    tick,
    resetSession,
    onTileCacheEvicted,
    onForgeSuccess,
    drawWorld,
    getLock: () => ({ q: lockQ, r: lockR }),
    getScreenFlashUntil: () => screenFlashUntil,
    setScreenFlashUntil(t) {
      screenFlashUntil = t;
    },
    isOuterBarrierWorldPoint,
  };
}
