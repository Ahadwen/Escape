import { createArenaHexEvent } from "./Arena.js";
import { createGauntletHexEvent } from "./Gauntlet.js";

/**
 * @typedef {object} EventHexControllerDeps
 * @property {() => number} getSimElapsed
 * @property {() => { x: number; y: number; r: number }} getPlayer
 * @property {(x: number, y: number) => { q: number; r: number }} worldToHex
 * @property {(q: number, r: number) => { x: number; y: number }} hexToWorld
 * @property {() => boolean} specialsUnpaused
 * @property {() => boolean} getRunDead
 * @property {(q: number, r: number) => boolean} isArenaHexInteractive
 * @property {(q: number, r: number) => void} markProceduralArenaHexSpent
 * @property {(q: number, r: number) => boolean} isSurgeHexTile
 * @property {(q: number, r: number) => boolean} isSurgeHexInteractive
 * @property {(q: number, r: number) => void} markProceduralSurgeHexSpent
 * @property {(amount: number, opts?: object) => void} damagePlayer
 * @property {(strength?: number, sec?: number) => void} bumpScreenShake
 * @property {() => void} dropSpecialEventJokerReward
 * @property {(type: string, x: number, y: number, opts?: { arenaNexusSpawn?: boolean }) => void} spawnHunter
 * @property {(q: number, r: number) => void} killHuntersOnSurgeHex
 * @property {() => void} cleanupArenaNexusSiegeCombat
 * @property {(cx: number, cy: number) => void} clampArenaNexusDefendersOnRing
 * @property {(cx: number, cy: number) => void} ejectHuntersFromArenaNexusDuringSiege
 * @property {(lockQ: number, lockR: number, surgePhase: number) => void} ejectHuntersFromSurgeLockHex
 * @property {() => boolean} [isCardPickupPaused]
 */

/**
 * Composes procedural / west-test **event hex** runtimes (arena, gauntlet). Forge / roulette stay in `specials/` until migrated.
 * Drop-in replacement for the former `createArenaSurgeRuntime` API.
 * @param {EventHexControllerDeps} deps
 */
export function createEventHexController(deps) {
  const cardPaused = deps.isCardPickupPaused ?? (() => false);

  const arena = createArenaHexEvent({
    getSimElapsed: deps.getSimElapsed,
    getPlayer: deps.getPlayer,
    worldToHex: deps.worldToHex,
    hexToWorld: deps.hexToWorld,
    isArenaHexInteractive: deps.isArenaHexInteractive,
    markProceduralArenaHexSpent: deps.markProceduralArenaHexSpent,
    dropSpecialEventJokerReward: deps.dropSpecialEventJokerReward,
    spawnHunter: deps.spawnHunter,
    cleanupArenaNexusSiegeCombat: deps.cleanupArenaNexusSiegeCombat,
    clampArenaNexusDefendersOnRing: deps.clampArenaNexusDefendersOnRing,
    ejectHuntersFromArenaNexusDuringSiege: deps.ejectHuntersFromArenaNexusDuringSiege,
    isCardPickupPaused: cardPaused,
  });

  const gauntlet = createGauntletHexEvent({
    getSimElapsed: deps.getSimElapsed,
    getPlayer: deps.getPlayer,
    worldToHex: deps.worldToHex,
    hexToWorld: deps.hexToWorld,
    isSurgeHexTile: deps.isSurgeHexTile,
    isSurgeHexInteractive: deps.isSurgeHexInteractive,
    markProceduralSurgeHexSpent: deps.markProceduralSurgeHexSpent,
    damagePlayer: deps.damagePlayer,
    bumpScreenShake: deps.bumpScreenShake,
    dropSpecialEventJokerReward: deps.dropSpecialEventJokerReward,
    killHuntersOnSurgeHex: deps.killHuntersOnSurgeHex,
    ejectHuntersFromSurgeLockHex: deps.ejectHuntersFromSurgeLockHex,
    isCardPickupPaused: cardPaused,
  });

  function reset() {
    arena.reset();
    gauntlet.reset();
  }

  function tick(dt) {
    if (deps.getRunDead() || !deps.specialsUnpaused()) return;
    arena.tick(dt);
    gauntlet.tick(dt);
  }

  function postHunterTick() {
    if (deps.getRunDead()) return;
    arena.postHunterTick();
    gauntlet.postHunterTick();
  }

  /** @param {{ x: number; y: number }} player */
  function clampPlayer(player) {
    arena.clampPlayerSegment(player);
    gauntlet.clampPlayerSegment(player);
  }

  return {
    reset,
    tick,
    postHunterTick,
    clampPlayer,
    getArenaDrawState: () => arena.getDrawState(),
    getSurgeDrawState: () => gauntlet.getDrawState(),
    getSurgeScreenFlashUntil: () => gauntlet.getScreenFlashUntil(),
  };
}
