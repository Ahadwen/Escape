/**
 * Arena nexus event hex — siege loop, ring spawns, inner clamp, Joker reward timing.
 */
import {
  ARENA_NEXUS_SIEGE_SEC,
  ARENA_NEXUS_RING_LO,
  ARENA_NEXUS_RING_HI,
  ARENA_NEXUS_RING_LASER_SPAWN_INTERVAL,
  ARENA_NEXUS_RING_SNIPER_SPAWN_INTERVAL,
  ARENA_NEXUS_REWARD_MODAL_DELAY_SEC,
  LATE_GAME_ELITE_SPAWN_SEC,
} from "../../balance.js";
import { TAU } from "../../constants.js";
import {
  pointInsidePointyHex,
  innerInteractionVertexRadius,
  crossedIntoExpandedInnerHex,
  clampPlayerCenterToExpandedInnerHex,
} from "./innerHexZone.js";

/**
 * @typedef {object} ArenaHexEventDeps
 * @property {() => number} getSimElapsed
 * @property {() => { x: number; y: number; r: number }} getPlayer
 * @property {(x: number, y: number) => { q: number; r: number }} worldToHex
 * @property {(q: number, r: number) => { x: number; y: number }} hexToWorld
 * @property {(q: number, r: number) => boolean} isArenaHexInteractive
 * @property {(q: number, r: number) => void} markProceduralArenaHexSpent
 * @property {() => void} dropSpecialEventJokerReward — `items/jokerEventReward.dropJokerRewardFromSpecialEvent` (special hex only).
 * @property {(type: string, x: number, y: number, opts?: { arenaNexusSpawn?: boolean }) => void} spawnHunter
 * @property {() => void} cleanupArenaNexusSiegeCombat
 * @property {(cx: number, cy: number) => void} clampArenaNexusDefendersOnRing
 * @property {(cx: number, cy: number) => void} ejectHuntersFromArenaNexusDuringSiege
 * @property {() => boolean} [isCardPickupPaused]
 */

/**
 * Arena nexus tile — REFERENCE `updateArenaNexus` / siege / inner clamp / ring spawns.
 * @param {ArenaHexEventDeps} deps
 */
export function createArenaHexEvent(deps) {
  const {
    getSimElapsed,
    getPlayer,
    worldToHex,
    hexToWorld,
    isArenaHexInteractive,
    markProceduralArenaHexSpent,
    dropSpecialEventJokerReward,
    spawnHunter,
    cleanupArenaNexusSiegeCombat,
    clampArenaNexusDefendersOnRing,
    ejectHuntersFromArenaNexusDuringSiege,
    isCardPickupPaused = () => false,
  } = deps;

  /** @type {0|1|2} */
  let phase = 0;
  let siegeQ = 0;
  let siegeR = 0;
  let siegeEndAt = 0;
  let nextLaserEnemyAt = 0;
  let nextSniperEnemyAt = 0;
  let cardRewardAt = 0;
  /** True while card UI is paused at/after reward time — grant on unpause (Gauntlet parity). */
  let arenaRewardPendingOnUnpause = false;

  function reset() {
    phase = 0;
    siegeQ = 0;
    siegeR = 0;
    siegeEndAt = 0;
    nextLaserEnemyAt = 0;
    nextSniperEnemyAt = 0;
    cardRewardAt = 0;
    arenaRewardPendingOnUnpause = false;
  }

  function worldCenter() {
    return hexToWorld(siegeQ, siegeR);
  }

  function beginSiege() {
    const player = getPlayer();
    const ph = worldToHex(player.x, player.y);
    siegeQ = ph.q;
    siegeR = ph.r;
    phase = 1;
    const elapsed = getSimElapsed();
    siegeEndAt = elapsed + ARENA_NEXUS_SIEGE_SEC;
    nextLaserEnemyAt = elapsed;
    nextSniperEnemyAt = elapsed + 0.12;
    const c = worldCenter();
    ejectHuntersFromArenaNexusDuringSiege(c.x, c.y);
    clampPlayerToInnerHex();
  }

  function finishSiege() {
    phase = 2;
    cleanupArenaNexusSiegeCombat();
    arenaRewardPendingOnUnpause = false;
    cardRewardAt = getSimElapsed() + ARENA_NEXUS_REWARD_MODAL_DELAY_SEC;
    markProceduralArenaHexSpent(siegeQ, siegeR);
  }

  function randomPointOnRing() {
    const { x: cx, y: cy } = worldCenter();
    const ang = Math.random() * TAU;
    const t = 0.15 + Math.random() * 0.85;
    const ringR = ARENA_NEXUS_RING_LO + t * (ARENA_NEXUS_RING_HI - ARENA_NEXUS_RING_LO);
    return { x: cx + Math.cos(ang) * ringR, y: cy + Math.sin(ang) * ringR };
  }

  function spawnRingLaserHunter() {
    const elapsed = getSimElapsed();
    const late = elapsed >= LATE_GAME_ELITE_SPAWN_SEC;
    const type = late && Math.random() < 0.38 ? "laserBlue" : "laser";
    const p = randomPointOnRing();
    spawnHunter(type, p.x, p.y, { arenaNexusSpawn: true });
  }

  function spawnRingSniperHunter() {
    const p = randomPointOnRing();
    spawnHunter("sniper", p.x, p.y, { arenaNexusSpawn: true });
  }

  function clampPlayerToInnerHex() {
    if (phase !== 1) return;
    const player = getPlayer();
    const { x: cx, y: cy } = worldCenter();
    clampPlayerCenterToExpandedInnerHex(player, cx, cy, innerInteractionVertexRadius(player.r));
  }

  /** @param {{ x: number; y: number }} player */
  function clampPlayerSegment(player) {
    if (phase !== 1) return;
    const { x: cx, y: cy } = worldCenter();
    clampPlayerCenterToExpandedInnerHex(player, cx, cy, innerInteractionVertexRadius(player.r));
  }

  function tick(dt = 1 / 60) {
    const elapsed = getSimElapsed();
    const player = getPlayer();
    const cardPaused = isCardPickupPaused();
    const ph = worldToHex(player.x, player.y);
    const pdt = Math.max(1e-5, dt);

    if (phase === 2 && cardRewardAt > 0 && elapsed >= cardRewardAt) {
      if (!cardPaused) {
        cardRewardAt = 0;
        arenaRewardPendingOnUnpause = false;
        dropSpecialEventJokerReward();
      } else {
        arenaRewardPendingOnUnpause = true;
      }
    }
    if (!cardPaused && phase === 2 && arenaRewardPendingOnUnpause) {
      arenaRewardPendingOnUnpause = false;
      cardRewardAt = 0;
      dropSpecialEventJokerReward();
    }
    if (phase === 2 && (ph.q !== siegeQ || ph.r !== siegeR)) {
      // Leaving the tile before the delayed grant used to reset state and skip the
      // reward entirely (common when moving fast). Still grant if the siege completed.
      if (cardRewardAt > 0) {
        if (!cardPaused) {
          dropSpecialEventJokerReward();
          cardRewardAt = 0;
          arenaRewardPendingOnUnpause = false;
        } else {
          arenaRewardPendingOnUnpause = true;
          return;
        }
      }
      // Once the completed arena despawns from active play, reset event state
      // so future arena tiles start fresh instead of inheriting a spent phase.
      reset();
      return;
    }

    if (phase === 1) {
      while (elapsed >= nextLaserEnemyAt) {
        spawnRingLaserHunter();
        nextLaserEnemyAt += ARENA_NEXUS_RING_LASER_SPAWN_INTERVAL;
      }
      while (elapsed >= nextSniperEnemyAt) {
        spawnRingSniperHunter();
        nextSniperEnemyAt += ARENA_NEXUS_RING_SNIPER_SPAWN_INTERVAL;
      }
      if (elapsed >= siegeEndAt) finishSiege();
    }

    if (phase !== 0) return;
    if (!isArenaHexInteractive(ph.q, ph.r)) return;
    const c = hexToWorld(ph.q, ph.r);
    const vr = innerInteractionVertexRadius(player.r);
    const prevX = player.x - (player.velX || 0) * pdt;
    const prevY = player.y - (player.velY || 0) * pdt;
    if (
      pointInsidePointyHex(player.x, player.y, c.x, c.y, vr) ||
      crossedIntoExpandedInnerHex(prevX, prevY, player.x, player.y, c.x, c.y, vr)
    ) {
      beginSiege();
    }
  }

  function postHunterTick() {
    if (phase === 1) {
      const c = worldCenter();
      ejectHuntersFromArenaNexusDuringSiege(c.x, c.y);
      clampArenaNexusDefendersOnRing(c.x, c.y);
    }
  }

  function getDrawState() {
    const elapsed = getSimElapsed();
    return {
      phase,
      siegeQ,
      siegeR,
      siegeEndAt,
      simElapsed: elapsed,
    };
  }

  function getPhase() {
    return phase;
  }

  return {
    reset,
    tick,
    clampPlayerSegment,
    clampPlayerToInnerHex,
    postHunterTick,
    getDrawState,
    getPhase,
  };
}
