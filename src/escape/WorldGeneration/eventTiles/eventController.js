import { createArenaHexEvent } from "./Arena.js";
import { createGauntletHexEvent } from "./Gauntlet.js";
import { HEX_SIZE } from "../../balance.js";
import { HALLS_PIECE_IDS } from "../../Hunters/hallsLogic.js";

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
 * @property {(q: number, r: number) => boolean} [isHallsEventHexInteractive]
 * @property {(q: number, r: number) => void} [markProceduralHallsEventHexSpent]
 * @property {(q: number, r: number) => void} [spawnHallsHealCrystal]
 * @property {(q: number, r: number) => void} [killHuntersOnHex]
 * @property {(lockQ: number, lockR: number) => void} [ejectHuntersFromHallsLockHex]
 * @property {() => string | null} [getDebugHallsPieceType]
 * @property {() => boolean} [isCardPickupPaused]
 * @property {() => boolean} [allowProceduralHallsEvents]
 */

/**
 * Composes procedural / west-test **event hex** runtimes (arena, gauntlet). Forge / roulette stay in `specials/` until migrated.
 * Drop-in replacement for the former `createArenaSurgeRuntime` API.
 * @param {EventHexControllerDeps} deps
 */
export function createEventHexController(deps) {
  const SQRT3 = Math.sqrt(3);
  const HALLS_EVENT_ORDER = [
    HALLS_PIECE_IDS.PAWN,
    HALLS_PIECE_IDS.KNIGHT,
    HALLS_PIECE_IDS.BISHOP,
    HALLS_PIECE_IDS.ROOK,
    HALLS_PIECE_IDS.QUEEN,
    HALLS_PIECE_IDS.KING,
  ];
  const HALLS_EVENT_DURATION_SEC = 30;
  const cardPaused = deps.isCardPickupPaused ?? (() => false);
  const allowProceduralHallsEvents = deps.allowProceduralHallsEvents ?? (() => true);

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

  /** @type {null | { lockQ: number; lockR: number; pieceType: string; startedAt: number; endsAt: number; spawned: boolean; finished: boolean; source: "tile" | "trigger" }} */
  let hallsActive = null;
  let hallsEventIndex = 0;

  function hallsMaxCenterDistPx(playerR) {
    return Math.max(6, HEX_SIZE * (SQRT3 / 2) - playerR - 1.5);
  }

  function clampPlayerToHallsLock(player) {
    if (!hallsActive) return;
    const c = deps.hexToWorld(hallsActive.lockQ, hallsActive.lockR);
    const maxD = hallsMaxCenterDistPx(player.r);
    const dx = player.x - c.x;
    const dy = player.y - c.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d <= maxD) return;
    player.x = c.x + (dx / d) * maxD;
    player.y = c.y + (dy / d) * maxD;
  }

  function beginHallsEncounter(q, r, opts = {}) {
    if (hallsActive) return;
    const source = opts.source === "trigger" ? "trigger" : "tile";
    if (source === "tile" && hallsEventIndex >= HALLS_EVENT_ORDER.length) return;
    const forced = String(opts.pieceType ?? deps.getDebugHallsPieceType?.() ?? "");
    const forcedPiece = HALLS_EVENT_ORDER.includes(forced) ? forced : null;
    const pieceType = forcedPiece ?? HALLS_EVENT_ORDER[hallsEventIndex % HALLS_EVENT_ORDER.length];
    hallsActive = {
      lockQ: q,
      lockR: r,
      pieceType,
      startedAt: deps.getSimElapsed(),
      endsAt: deps.getSimElapsed() + HALLS_EVENT_DURATION_SEC,
      spawned: false,
      finished: false,
      source,
    };
    // Preserve sequence progression for both tile and trigger encounters.
    // If debug forces a specific piece, do not advance sequence state.
    if (!forcedPiece) hallsEventIndex += 1;
    deps.killHuntersOnHex?.(q, r);
    const player = deps.getPlayer();
    clampPlayerToHallsLock(player);
  }

  function finishHallsEncounter() {
    if (!hallsActive || hallsActive.finished) return;
    if (hallsActive.source === "tile") {
      deps.markProceduralHallsEventHexSpent?.(hallsActive.lockQ, hallsActive.lockR);
    }
    hallsActive.finished = true;
    deps.spawnHallsHealCrystal?.(hallsActive.lockQ, hallsActive.lockR);
    hallsActive = null;
  }

  function tickHalls() {
    const elapsed = deps.getSimElapsed();
    const player = deps.getPlayer();
    const ph = deps.worldToHex(player.x, player.y);

    if (!hallsActive && allowProceduralHallsEvents() && deps.isHallsEventHexInteractive?.(ph.q, ph.r)) {
      beginHallsEncounter(ph.q, ph.r);
    }
    if (!hallsActive) return;
    if (!hallsActive.spawned) {
      hallsActive.spawned = true;
      const c = deps.hexToWorld(hallsActive.lockQ, hallsActive.lockR);
      deps.spawnHunter(hallsActive.pieceType, c.x, c.y, {
        hallsPieceType: hallsActive.pieceType,
        dieAtOverride: hallsActive.endsAt,
        allowInsideSpecialTile: true,
        hallsEventSpawn: true,
        forceExactPosition: true,
        hallsLockCenterX: c.x,
        hallsLockCenterY: c.y,
      });
    }
    clampPlayerToHallsLock(player);
    if (elapsed >= hallsActive.endsAt) finishHallsEncounter();
  }

  function reset() {
    arena.reset();
    gauntlet.reset();
    hallsActive = null;
    hallsEventIndex = 0;
  }

  function tick(dt) {
    if (deps.getRunDead() || !deps.specialsUnpaused()) return;
    arena.tick(dt);
    gauntlet.tick(dt);
    tickHalls();
  }

  function postHunterTick() {
    if (deps.getRunDead()) return;
    arena.postHunterTick();
    gauntlet.postHunterTick();
    if (hallsActive) deps.ejectHuntersFromHallsLockHex?.(hallsActive.lockQ, hallsActive.lockR);
  }

  /** @param {{ x: number; y: number }} player */
  function clampPlayer(player) {
    arena.clampPlayerSegment(player);
    gauntlet.clampPlayerSegment(player);
    clampPlayerToHallsLock(player);
  }

  return {
    reset,
    tick,
    postHunterTick,
    clampPlayer,
    getArenaDrawState: () => arena.getDrawState(),
    getSurgeDrawState: () => gauntlet.getDrawState(),
    getHallsDrawState: () => {
      if (!hallsActive) return null;
      return {
        lockQ: hallsActive.lockQ,
        lockR: hallsActive.lockR,
        endsAt: hallsActive.endsAt,
        simElapsed: deps.getSimElapsed(),
      };
    },
    getSurgeScreenFlashUntil: () => gauntlet.getScreenFlashUntil(),
    startHallsTriggerEncounterAt: (q, r, pieceType = null) => {
      if (hallsActive) return false;
      beginHallsEncounter(q, r, { source: "trigger", pieceType });
      return !!hallsActive;
    },
    isHallsEncounterActive: () => !!hallsActive,
    isHallsLockBarrierWorldPoint: (x, y) => {
      if (!hallsActive) return false;
      const h = deps.worldToHex(x, y);
      if (h.q !== hallsActive.lockQ || h.r !== hallsActive.lockR) return false;
      const c = deps.hexToWorld(h.q, h.r);
      return Math.hypot(x - c.x, y - c.y) <= HEX_SIZE + 4;
    },
    isSurgeLockBarrierWorldPoint: (x, y) => gauntlet.isSurgeLockBarrierWorldPoint(x, y),
  };
}
