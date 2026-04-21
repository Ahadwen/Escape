import {
  SAFEHOUSE_INNER_HIT_R,
  PLAYER_RADIUS,
  SAFEHOUSE_EMBED_CENTER_INSET,
  SAFEHOUSE_SPENT_TILE_ANIM_MS,
} from "../balance.js";
import { hexKey } from "../hexMath.js";
import { safehouseEmbedSiteHitRadiusWorld } from "../draw.js";

/**
 * Sanctuary tile: level modal, post-accept embed reveal, mini roulette / forge, clock freeze, spend-on-leave.
 * Ported from REFERENCE `game.js` safehouse state + `updateSafehouseHex` family.
 */
export function createSafehouseHexFlow() {
  /** @type {Set<string>} */
  const levelPromptShownKeys = new Set();

  let innerFacilitiesUnlocked = false;
  let embeddedRouletteComplete = false;
  let embeddedForgeComplete = false;
  let embedRevealAtMs = 0;
  let forgeInnerExitLatch = false;
  let rouletteInnerExitLatch = false;
  let levelInnerLatch = false;
  let pausedForSafehousePrompt = false;
  let awaitingLeaveAfterLevelUp = false;
  let levelUpTileKey = "";
  let safehouseClockFreeze = 0;
  /** @type {{ key: string; startMs: number } | null} */
  let spentTileAnim = null;

  function resetEmbeddedProgress() {
    innerFacilitiesUnlocked = false;
    embeddedRouletteComplete = false;
    embeddedForgeComplete = false;
    embedRevealAtMs = 0;
    forgeInnerExitLatch = false;
    rouletteInnerExitLatch = false;
    levelInnerLatch = false;
    awaitingLeaveAfterLevelUp = false;
    levelUpTileKey = "";
  }

  function resetSession() {
    levelPromptShownKeys.clear();
    resetEmbeddedProgress();
    pausedForSafehousePrompt = false;
    safehouseClockFreeze = 0;
    spentTileAnim = null;
  }

  /**
   * @param {string} cacheKey
   * @param {{ isSafehouseHexTile: (q: number, r: number) => boolean }} specials
   */
  function onTileCacheEvicted(cacheKey, specials) {
    const parts = cacheKey.split(",");
    if (parts.length !== 2) return;
    const q = Number(parts[0]);
    const r = Number(parts[1]);
    if (!Number.isFinite(q) || !Number.isFinite(r)) return;
    if (!specials.isSafehouseHexTile(q, r)) return;
    levelPromptShownKeys.delete(cacheKey);
    if (levelUpTileKey === cacheKey) {
      awaitingLeaveAfterLevelUp = false;
      levelUpTileKey = "";
    }
    if (spentTileAnim?.key === cacheKey) spentTileAnim = null;
    resetEmbeddedProgress();
  }

  function onProceduralSafehousePlaced() {
    resetEmbeddedProgress();
  }

  /** @param {string} k */
  function onProceduralSafehouseSpent(k) {
    resetEmbeddedProgress();
    spentTileAnim = { key: k, startMs: performance.now() };
  }

  function tickSpentTileAnimDone() {
    const fx = spentTileAnim;
    if (!fx) return;
    if (performance.now() - fx.startMs >= SAFEHOUSE_SPENT_TILE_ANIM_MS) spentTileAnim = null;
  }

  function tickEmbedRevealFromWallClock(getIsLunatic) {
    if (getIsLunatic()) {
      embedRevealAtMs = 0;
      return;
    }
    if (embedRevealAtMs > 0 && performance.now() >= embedRevealAtMs) {
      innerFacilitiesUnlocked = true;
      embedRevealAtMs = 0;
    }
  }

  function updateSpendAfterLevelLeave(getPlayer, worldToHex, markProceduralSafehouseHexSpent) {
    if (!awaitingLeaveAfterLevelUp || !levelUpTileKey) return;
    const pk = levelUpTileKey;
    const parts = pk.split(",");
    if (parts.length !== 2) {
      awaitingLeaveAfterLevelUp = false;
      levelUpTileKey = "";
      return;
    }
    const pq = Number(parts[0]);
    const pr = Number(parts[1]);
    if (!Number.isFinite(pq) || !Number.isFinite(pr)) {
      awaitingLeaveAfterLevelUp = false;
      levelUpTileKey = "";
      return;
    }
    const ph = worldToHex(getPlayer().x, getPlayer().y);
    if (ph.q === pq && ph.r === pr) return;
    markProceduralSafehouseHexSpent(pq, pr);
  }

  function clampPlayerOutOfSpentCore(getPlayer, worldToHex, hexToWorld, isSafehouseHexSpentTile, setPlayerPos) {
    const p = getPlayer();
    const ph = worldToHex(p.x, p.y);
    if (!isSafehouseHexSpentTile(ph.q, ph.r)) return;
    const cc = hexToWorld(ph.q, ph.r);
    const dx = p.x - cc.x;
    const dy = p.y - cc.y;
    const d = Math.hypot(dx, dy) || 1;
    const minR = SAFEHOUSE_INNER_HIT_R + PLAYER_RADIUS * 0.25;
    if (d < minR && d > 1e-4) {
      setPlayerPos(cc.x + (dx / d) * minR, cc.y + (dy / d) * minR);
    }
  }

  /**
   * @param {object} o
   * @param {number} o.dt
   * @param {() => boolean} o.runDead
   * @param {() => boolean} o.innerGameplayFrozen — full world pause (manual, modals, sanctuary prompt).
   * @param {boolean} o.advanceFreezeClock — when false, danger clock freeze does not accumulate this frame.
   * @param {() => boolean} o.getIsLunatic
   * @param {() => { x: number; y: number }} o.getPlayer
   * @param {(x: number, y: number) => { q: number; r: number }} o.worldToHex
   * @param {(q: number, r: number) => { x: number; y: number }} o.hexToWorld
   * @param {number} o.hexSize
   * @param {{ q: number; r: number }[]} o.HEX_DIRS
   * @param {() => { q: number; r: number } | null} o.getPrimarySafehouseAxial
   * @param {(q: number, r: number) => boolean} o.isSafehouseHexTile
   * @param {(q: number, r: number) => boolean} o.isSafehouseHexActiveTile
   * @param {(q: number, r: number) => boolean} o.isSafehouseHexSpentTile
   * @param {HTMLElement | null} o.safehouseModalEl
   * @param {() => void} o.clearKeys
   * @param {() => void} o.openRouletteEmbedded
   * @param {() => void} o.openForgeWorldEmbedded
   * @param {(q: number, r: number) => void} o.markProceduralSafehouseHexSpent
   * @param {(x: number, y: number) => void} o.setPlayerPos
   */
  function tickAlways(getIsLunatic) {
    tickSpentTileAnimDone();
    tickEmbedRevealFromWallClock(getIsLunatic);
  }

  function tick(o) {
    tickAlways(o.getIsLunatic);

    if (o.advanceFreezeClock && o.dt > 0 && !o.runDead()) {
      const p0 = o.getPlayer();
      const ph0 = o.worldToHex(p0.x, p0.y);
      if (o.isSafehouseHexTile(ph0.q, ph0.r)) safehouseClockFreeze += o.dt;
    }

    if (!o.runDead()) {
      updateSpendAfterLevelLeave(o.getPlayer, o.worldToHex, o.markProceduralSafehouseHexSpent);
      clampPlayerOutOfSpentCore(
        o.getPlayer,
        o.worldToHex,
        o.hexToWorld,
        o.isSafehouseHexSpentTile,
        o.setPlayerPos,
      );
    }

    if (o.runDead() || o.innerGameplayFrozen()) return;

    const prim = o.getPrimarySafehouseAxial();
    if (prim && o.isSafehouseHexActiveTile(prim.q, prim.r) && o.safehouseModalEl) {
      const k = hexKey(prim.q, prim.r);
      const player = o.getPlayer();
      const ph = o.worldToHex(player.x, player.y);
      const c = o.hexToWorld(prim.q, prim.r);
      const dist = Math.hypot(player.x - c.x, player.y - c.y);
      const inInner = ph.q === prim.q && ph.r === prim.r && dist <= SAFEHOUSE_INNER_HIT_R;

      if (!inInner) {
        levelInnerLatch = false;
      } else if (!pausedForSafehousePrompt && !levelPromptShownKeys.has(k)) {
        if (!levelInnerLatch) {
          levelInnerLatch = true;
          levelPromptShownKeys.add(k);
          pausedForSafehousePrompt = true;
          o.clearKeys();
          o.safehouseModalEl.hidden = false;
        }
      }
    } else {
      levelInnerLatch = false;
    }

    const embedHitR = safehouseEmbedSiteHitRadiusWorld();
    const inset = o.hexSize * SAFEHOUSE_EMBED_CENTER_INSET;

    if (!o.getIsLunatic() && innerFacilitiesUnlocked && !embeddedForgeComplete) {
      const p2 = o.getPrimarySafehouseAxial();
      if (p2 && o.isSafehouseHexActiveTile(p2.q, p2.r)) {
        const player = o.getPlayer();
        const ph = o.worldToHex(player.x, player.y);
        if (ph.q !== p2.q || ph.r !== p2.r) forgeInnerExitLatch = false;
        else {
          const cc = o.hexToWorld(p2.q, p2.r);
          const e = o.hexToWorld(p2.q + o.HEX_DIRS[0].q, p2.r + o.HEX_DIRS[0].r);
          const lenE = Math.hypot(e.x - cc.x, e.y - cc.y) || 1;
          const fw = {
            x: cc.x + ((e.x - cc.x) / lenE) * inset,
            y: cc.y + ((e.y - cc.y) / lenE) * inset,
          };
          const dist = Math.hypot(player.x - fw.x, player.y - fw.y);
          const inForge = dist <= embedHitR;
          if (inForge && !forgeInnerExitLatch) {
            forgeInnerExitLatch = true;
            o.openForgeWorldEmbedded();
          }
          if (!inForge) forgeInnerExitLatch = false;
        }
      }
    }

    if (!o.getIsLunatic() && innerFacilitiesUnlocked && !embeddedRouletteComplete) {
      const p3 = o.getPrimarySafehouseAxial();
      if (p3 && o.isSafehouseHexActiveTile(p3.q, p3.r)) {
        const player = o.getPlayer();
        const ph = o.worldToHex(player.x, player.y);
        if (ph.q !== p3.q || ph.r !== p3.r) {
          rouletteInnerExitLatch = false;
        } else {
          const cc = o.hexToWorld(p3.q, p3.r);
          const w = o.hexToWorld(p3.q + o.HEX_DIRS[3].q, p3.r + o.HEX_DIRS[3].r);
          const lenW = Math.hypot(w.x - cc.x, w.y - cc.y) || 1;
          const rw = {
            x: cc.x + ((w.x - cc.x) / lenW) * inset,
            y: cc.y + ((w.y - cc.y) / lenW) * inset,
          };
          const d = Math.hypot(player.x - rw.x, player.y - rw.y);
          const inRainbow = d <= embedHitR;
          if (inRainbow && !rouletteInnerExitLatch) {
            rouletteInnerExitLatch = true;
            o.openRouletteEmbedded();
          }
          if (!inRainbow) rouletteInnerExitLatch = false;
        }
      }
    }
  }

  function getDifficultyClockSec(simElapsed) {
    return Math.max(0, simElapsed - safehouseClockFreeze);
  }

  /**
   * @param {object} o
   * @param {() => void} o.onRunLevelIncrement
   * @param {(effectiveSurvivalSec: number) => void} o.onSpawnAnchorResetToDifficultyClock
   * @param {() => void} o.healPlayerToMax
   * @param {() => boolean} o.getIsLunatic
   * @param {() => { q: number; r: number } | null} o.getPrimarySafehouseAxial
   * @param {() => number} o.getSimElapsed
   */
  function applyLevelUpAccepted(o) {
    o.onRunLevelIncrement();
    o.onSpawnAnchorResetToDifficultyClock(getDifficultyClockSec(o.getSimElapsed()));
    o.healPlayerToMax();
    if (!o.getIsLunatic()) embedRevealAtMs = performance.now() + 830;
    const prim = o.getPrimarySafehouseAxial();
    const tileK = prim ? hexKey(prim.q, prim.r) : "";
    if (tileK) {
      awaitingLeaveAfterLevelUp = true;
      levelUpTileKey = tileK;
    }
  }

  function closeLevelModal(safehouseModalEl, clearKeys) {
    pausedForSafehousePrompt = false;
    if (safehouseModalEl) safehouseModalEl.hidden = true;
    clearKeys();
  }

  return {
    resetSession,
    onTileCacheEvicted,
    onProceduralSafehousePlaced,
    onProceduralSafehouseSpent,
    tick,
    tickAlways,
    getDifficultyClockSec,
    isPausedForSafehousePrompt: () => pausedForSafehousePrompt,
    closeLevelModal,
    applyLevelUpAccepted,
    getInnerFacilitiesUnlocked: () => innerFacilitiesUnlocked,
    getEmbeddedRouletteComplete: () => embeddedRouletteComplete,
    getEmbeddedForgeComplete: () => embeddedForgeComplete,
    setEmbeddedRouletteComplete(v) {
      embeddedRouletteComplete = !!v;
    },
    setEmbeddedForgeComplete(v) {
      embeddedForgeComplete = !!v;
    },
    getSpentTileAnim: () => spentTileAnim,
    getSafehouseClockFreeze: () => safehouseClockFreeze,
  };
}
