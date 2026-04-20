/**
 * Player damage pipeline — REFERENCE `damagePlayer` / temp HP / set bonuses / hit feedback,
 * scoped to what Escape already models (rank deck, no Valiant/Lunatic paths).
 */
import {
  SET_BONUS_SUIT_MAX,
  DAMAGE_HURT_FLASH_SEC,
  DAMAGE_PLAYER_INVULN_SEC,
  DAMAGE_SCREEN_SHAKE_SEC,
  DAMAGE_SCREEN_SHAKE_STRENGTH,
  LASER_BLUE_PLAYER_SLOW_SEC,
  HEARTS_13_DEATH_DEFY_CD_SEC,
  CLUBS_13_UNTARGETABLE_SEC,
} from "./balance.js";
import { forEachDeckCard } from "./items/inventoryState.js";

/**
 * @typedef {object} PlayerDamageDeps
 * @property {() => number} getSimElapsed
 * @property {() => { hp: number; maxHp: number; tempHp?: number; tempHpExpiry?: number }} getPlayer
 * @property {object} inventory — may carry `clubsInvisUntil`, `heartsResistanceReadyAt`
 * @property {() => number} getCharacterInvulnUntil — e.g. Knight ult i-frames
 * @property {() => void} [onPlayerDeath]
 */

/**
 * @param {PlayerDamageDeps} deps
 */
export function createPlayerDamage(deps) {
  const { getSimElapsed, getPlayer, inventory, getCharacterInvulnUntil, onPlayerDeath } = deps;

  const combat = {
    playerInvulnerableUntil: 0,
    playerUntargetableUntil: 0,
    hurtFlashRemain: 0,
    screenShakeUntil: 0,
    screenShakeStrength: 0,
    playerLaserSlowUntil: 0,
    heartsDeathDefyReadyAt: 0,
  };

  function countSuitInRankDeck(suit) {
    let n = 0;
    forEachDeckCard(inventory, (c) => {
      if (c && c.suit === suit) n += 1;
    });
    return n;
  }

  function getHeartsResistanceCardCount() {
    let n = 0;
    forEachDeckCard(inventory, (c) => {
      if (c?.effect?.kind === "hitResist") n += 1;
    });
    return n;
  }

  function getHeartsResistanceCooldown() {
    let totalRank = 0;
    forEachDeckCard(inventory, (c) => {
      if (c?.effect?.kind === "hitResist") totalRank += c.rank;
    });
    if (totalRank <= 0) return 15;
    return Math.max(3, 15 - 0.5 * totalRank);
  }

  function clearTempHp(player) {
    player.tempHp = 0;
    player.tempHpExpiry = 0;
  }

  /**
   * @param {number} amount
   * @param {object} [opts]
   * @param {boolean} [opts.rouletteHexOuterPenalty] — bypass i-frames / resist (REFERENCE)
   * @param {boolean} [opts.laserBlueSlow]
   * @param {boolean} [opts.surgeHexPulse] — gauntlet pulse (REFERENCE; Knight uses normal damage path)
   * @param {number} [opts.floorHpAtMin] — after damage, clamp `hp` to at least this (Escape roulette/forge ring floor)
   */
  function damagePlayer(amount, opts = {}) {
    const elapsed = getSimElapsed();
    const player = getPlayer();
    const rouletteHexOuter = !!opts.rouletteHexOuterPenalty;

    if (!rouletteHexOuter) {
      const invulnGate = Math.max(combat.playerInvulnerableUntil, getCharacterInvulnUntil());
      if (elapsed < invulnGate) return;
      if (elapsed < combat.playerUntargetableUntil) return;
      if (elapsed < (inventory.clubsInvisUntil ?? 0)) return;

      const heartsResistanceCount = getHeartsResistanceCardCount();
      if (
        heartsResistanceCount > 0 &&
        elapsed >= (inventory.heartsResistanceReadyAt ?? 0) &&
        !opts.lunaticCrash &&
        !opts.lunaticRoarTerrain
      ) {
        const cd = getHeartsResistanceCooldown();
        inventory.heartsResistanceReadyAt = elapsed + cd;
        return;
      }
    }

    if (amount <= 0) return;

    let rem = amount;
    const temp = player.tempHp ?? 0;
    if (temp > 0) {
      const absorbed = Math.min(rem, temp);
      player.tempHp = temp - absorbed;
      rem -= absorbed;
      if ((player.tempHp ?? 0) <= 0) clearTempHp(player);
    }
    if (rem > 0) player.hp = Math.max(0, player.hp - rem);
    if (opts.floorHpAtMin != null) player.hp = Math.max(opts.floorHpAtMin, player.hp);

    if (rem > 0 && countSuitInRankDeck("clubs") >= SET_BONUS_SUIT_MAX) {
      combat.playerUntargetableUntil = elapsed + CLUBS_13_UNTARGETABLE_SEC;
    }
    if (opts.laserBlueSlow) {
      combat.playerLaserSlowUntil = elapsed + LASER_BLUE_PLAYER_SLOW_SEC;
    }

    combat.hurtFlashRemain = DAMAGE_HURT_FLASH_SEC;
    combat.playerInvulnerableUntil = elapsed + DAMAGE_PLAYER_INVULN_SEC;
    combat.screenShakeUntil = elapsed + DAMAGE_SCREEN_SHAKE_SEC;
    combat.screenShakeStrength = Math.max(combat.screenShakeStrength, DAMAGE_SCREEN_SHAKE_STRENGTH);

    if (player.hp <= 0) {
      const heartsFull = countSuitInRankDeck("hearts") >= SET_BONUS_SUIT_MAX;
      if (heartsFull && elapsed >= combat.heartsDeathDefyReadyAt) {
        player.hp = 5;
        combat.heartsDeathDefyReadyAt = elapsed + HEARTS_13_DEATH_DEFY_CD_SEC;
        combat.playerInvulnerableUntil = Math.max(combat.playerInvulnerableUntil, elapsed + 0.55);
        return;
      }
      onPlayerDeath?.();
    }
  }

  function tickCombatPresentation(dt) {
    combat.hurtFlashRemain = Math.max(0, combat.hurtFlashRemain - dt);
    combat.screenShakeStrength = Math.max(0, combat.screenShakeStrength - dt * 30);
    const elapsed = getSimElapsed();
    const player = getPlayer();
    if ((player.tempHp ?? 0) > 0 && (player.tempHpExpiry ?? 0) > 0 && elapsed >= player.tempHpExpiry) {
      clearTempHp(player);
    }
  }

  function getShakeOffset() {
    const elapsed = getSimElapsed();
    if (elapsed >= combat.screenShakeUntil) return { x: 0, y: 0 };
    const s = combat.screenShakeStrength;
    return { x: (Math.random() * 2 - 1) * s, y: (Math.random() * 2 - 1) * s };
  }

  function isLaserSlowActive() {
    return getSimElapsed() < combat.playerLaserSlowUntil;
  }

  function resetCombatState() {
    combat.playerInvulnerableUntil = 0;
    combat.playerUntargetableUntil = 0;
    combat.hurtFlashRemain = 0;
    combat.screenShakeUntil = 0;
    combat.screenShakeStrength = 0;
    combat.playerLaserSlowUntil = 0;
    combat.heartsDeathDefyReadyAt = 0;
  }

  /** REFERENCE `triggerUltScreenShake` — arena/surge FX without HP change. */
  function bumpScreenShake(strength = DAMAGE_SCREEN_SHAKE_STRENGTH, sec = DAMAGE_SCREEN_SHAKE_SEC) {
    const elapsed = getSimElapsed();
    combat.screenShakeUntil = elapsed + sec;
    combat.screenShakeStrength = Math.max(combat.screenShakeStrength, strength);
  }

  return {
    damagePlayer,
    combat,
    tickCombatPresentation,
    getShakeOffset,
    isLaserSlowActive,
    resetCombatState,
    bumpScreenShake,
  };
}
