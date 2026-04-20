import { HEX_SIZE, ROULETTE_INNER_HIT_R, ROULETTE_INNER_HEX_DRAW_R } from "../balance.js";
import { strokePointyHexOutline, fillPointyHexRainbowGlow } from "../draw.js";

/**
 * REFERENCE `updateRouletteHex` / `drawRouletteHexWorld`: outer crossing penalty, inner latch opens modal.
 */
export function createRouletteHexFlow({ hexKey }) {
  let phase = 0;
  let lockQ = 0;
  let lockR = 0;
  let wasInHex = false;
  let innerExitLatch = false;
  /** Session flag while still inside the hex (REFERENCE `rouletteForgeComplete`). */
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
    const enteredHexThisFrame = inHex && !wasInHex;
    wasInHex = true;

    if (enteredHexThisFrame && phase === 0 && o.isRouletteHexInteractive(ph.q, ph.r)) {
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
      let cellOuter = "rgba(59, 130, 246, 0.92)";
      if (isRouletteSpent(h.q, h.r)) {
        cellOuter = "rgba(34, 197, 94, 0.92)";
      } else if (isRouletteHexInteractive(h.q, h.r)) {
        cellOuter = outerDamageAppliedKeys.has(k) ? "rgba(59, 130, 246, 0.92)" : "rgba(249, 115, 22, 0.92)";
      }
      strokePointyHexOutline(ctx, cx, cy, HEX_SIZE, cellOuter, 3.2, 18);
      fillPointyHexRainbowGlow(ctx, cx, cy, ROULETTE_INNER_HEX_DRAW_R, simElapsed);
    }
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
    outerDamageHas(key) {
      return outerDamageAppliedKeys.has(key);
    },
  };
}
