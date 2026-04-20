import { HEX_SIZE, ROULETTE_INNER_HIT_R, ROULETTE_INNER_HEX_DRAW_R } from "../balance.js";
import { strokePointyHexOutline, drawForgeHexCell } from "../draw.js";

/**
 * Same interaction pattern as roulette (`rouletteHexFlow.js`), with forge palette + inner `drawForgeHexCell`.
 */
export function createForgeHexFlow({ hexKey }) {
  let phase = 0;
  let lockQ = 0;
  let lockR = 0;
  let wasInHex = false;
  let innerExitLatch = false;
  let forgeComplete = false;
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
    const enteredHexThisFrame = inHex && !wasInHex;
    wasInHex = true;

    if (enteredHexThisFrame && phase === 0 && o.isForgeHexInteractive(ph.q, ph.r)) {
      lockQ = ph.q;
      lockR = ph.r;
      const rk = hexKey(ph.q, ph.r);
      if (outerDamageAppliedKeys.has(rk)) {
        phase = 1;
        screenFlashUntil = 0;
      } else {
        phase = 1;
        screenFlashUntil = o.getSimElapsed() + 0.4;
        o.onOuterPenalty();
        outerDamageAppliedKeys.add(rk);
      }
    }

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
      let cellOuter = "rgba(59, 130, 246, 0.92)";
      if (isForgeSpent(h.q, h.r)) {
        cellOuter = "rgba(34, 197, 94, 0.92)";
      } else if (isForgeHexInteractive(h.q, h.r)) {
        cellOuter = outerDamageAppliedKeys.has(k) ? "rgba(59, 130, 246, 0.92)" : "rgba(217, 119, 6, 0.94)";
      }
      strokePointyHexOutline(ctx, cx, cy, HEX_SIZE, cellOuter, 3.2, 18);
      drawForgeHexCell(ctx, cx, cy, ROULETTE_INNER_HEX_DRAW_R, simElapsed, isForgeSpent(h.q, h.r));
    }
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
  };
}
