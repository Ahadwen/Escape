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
  LASER_BLUE_PLAYER_SLOW_MULT,
  LASER_BLUE_PLAYER_SLOW_SEC,
  SWAMP_HIT_SLOW_MULT,
  SWAMP_HIT_SLOW_SEC,
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
 * @property {() => boolean} [isDashCoolingDown]
 * @property {(secs: number) => void} [stunNearbyEnemies]
 * @property {() => void} [onPlayerDeath]
 * @property {() => boolean} [rogueStealthBlocksDamage] — REFERENCE rogue `shouldIgnoreDamage`
 * @property {() => boolean} [getLunaticSprintDamageImmune] — sprint/decel damage immunity (still takes `lunaticCrash` / `lunaticRoarTerrain`)
 * @property {() => boolean} [getIsValiant]
 * @property {(amount: number, opts?: object) => void} [applyValiantIncomingDamage] — rabbits / Will; skips normal HP
 * @property {() => boolean} [getBulwarkParryActive] — true during Bulwark W: block damage from all directions
 * @property {() => number | null} [getPostHitInvulnerabilitySec] — override default i-frame duration (Bulwark)
 */

/**
 * @param {PlayerDamageDeps} deps
 */
export function createPlayerDamage(deps) {
  const {
    getSimElapsed,
    getPlayer,
    inventory,
    getCharacterInvulnUntil,
    isDashCoolingDown,
    stunNearbyEnemies,
    onPlayerDeath,
    rogueStealthBlocksDamage,
    getLunaticSprintDamageImmune,
    getIsValiant,
    applyValiantIncomingDamage,
    getBulwarkParryActive,
    getPostHitInvulnerabilitySec,
  } = deps;

  const combat = {
    playerInvulnerableUntil: 0,
    playerUntargetableUntil: 0,
    hurtFlashRemain: 0,
    screenShakeUntil: 0,
    screenShakeStrength: 0,
    playerLaserSlowUntil: 0,
    playerSwampSlowUntil: 0,
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

  function getFrontShieldArcDeg() {
    const player = getPlayer();
    return Math.max(0, Number(player.frontShieldArcDeg ?? 0));
  }

  function getDodgeChanceWhenDashCd() {
    const player = getPlayer();
    return Math.max(0, Number(player.dodgeChanceWhenDashCd ?? 0));
  }

  function getStunOnHitSecs() {
    const player = getPlayer();
    return Math.max(0, Number(player.stunOnHitSecs ?? 0));
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
      if (rogueStealthBlocksDamage?.()) return;
      if (getLunaticSprintDamageImmune?.() && !opts.lunaticCrash && !opts.lunaticRoarTerrain) return;
      if (elapsed < (inventory.clubsInvisUntil ?? 0)) return;
      if ((isDashCoolingDown?.() ?? false) && Math.random() < getDodgeChanceWhenDashCd()) return;
      if (getBulwarkParryActive?.()) return;

      const arcDeg = getFrontShieldArcDeg();
      if (arcDeg > 0 && opts.sourceX != null && opts.sourceY != null) {
        const fx = player.facing?.x ?? 1;
        const fy = player.facing?.y ?? 0;
        const fl = Math.hypot(fx, fy) || 1;
        const nx = fx / fl;
        const ny = fy / fl;
        const vx = opts.sourceX - player.x;
        const vy = opts.sourceY - player.y;
        const vl = Math.hypot(vx, vy) || 1;
        const dot = (nx * (vx / vl) + ny * (vy / vl));
        const halfArc = (arcDeg * Math.PI) / 360;
        if (Math.acos(Math.max(-1, Math.min(1, dot))) <= halfArc) return;
      }

      const heartsResistanceCount = getHeartsResistanceCardCount();
      if (
        heartsResistanceCount > 0 &&
        elapsed >= (inventory.heartsResistanceReadyAt ?? 0) &&
        !opts.lunaticCrash &&
        !opts.lunaticRoarTerrain
      ) {
        const cd = getHeartsResistanceCooldown();
        inventory.heartsResistanceCooldownDuration = cd;
        inventory.heartsResistanceReadyAt = elapsed + cd;
        return;
      }
    }

    if (amount <= 0) return;

    if (getIsValiant?.()) {
      applyValiantIncomingDamage?.(amount, opts);
      return;
    }

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
    const invulnSec = getPostHitInvulnerabilitySec?.();
    const invulnDur =
      typeof invulnSec === "number" && Number.isFinite(invulnSec) && invulnSec > 0 ? invulnSec : DAMAGE_PLAYER_INVULN_SEC;
    combat.playerInvulnerableUntil = elapsed + invulnDur;
    combat.screenShakeUntil = elapsed + DAMAGE_SCREEN_SHAKE_SEC;
    combat.screenShakeStrength = Math.max(combat.screenShakeStrength, DAMAGE_SCREEN_SHAKE_STRENGTH);
    const stunSecs = getStunOnHitSecs();
    if (stunSecs > 0) stunNearbyEnemies?.(stunSecs);

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

  function applySwampHitSlow() {
    const elapsed = getSimElapsed();
    combat.playerSwampSlowUntil = elapsed + SWAMP_HIT_SLOW_SEC;
  }

  /** Multiplicative product of path/debuff movement slows (e.g. blue laser × swamp hit). */
  function getMovementSlowMult() {
    const elapsed = getSimElapsed();
    let m = 1;
    if (elapsed < combat.playerLaserSlowUntil) m *= LASER_BLUE_PLAYER_SLOW_MULT;
    if (elapsed < combat.playerSwampSlowUntil) m *= SWAMP_HIT_SLOW_MULT;
    return m;
  }

  function resetCombatState() {
    combat.playerInvulnerableUntil = 0;
    combat.playerUntargetableUntil = 0;
    combat.hurtFlashRemain = 0;
    combat.screenShakeUntil = 0;
    combat.screenShakeStrength = 0;
    combat.playerLaserSlowUntil = 0;
    combat.playerSwampSlowUntil = 0;
    combat.heartsDeathDefyReadyAt = 0;
  }

  /** REFERENCE `triggerUltScreenShake` — arena/surge FX without HP change. */
  function bumpScreenShake(strength = DAMAGE_SCREEN_SHAKE_STRENGTH, sec = DAMAGE_SCREEN_SHAKE_SEC) {
    const elapsed = getSimElapsed();
    combat.screenShakeUntil = elapsed + sec;
    combat.screenShakeStrength = Math.max(combat.screenShakeStrength, strength);
  }

  function grantInvulnerabilityUntil(until) {
    combat.playerInvulnerableUntil = Math.max(combat.playerInvulnerableUntil, until);
  }

  /** Hunger / script deaths — bypasses i-frames, dodge, and hearts death-defy. */
  function killPlayerImmediate() {
    const player = getPlayer();
    if (player.hp <= 0) return;
    player.hp = 0;
    onPlayerDeath?.();
  }

  return {
    damagePlayer,
    killPlayerImmediate,
    combat,
    tickCombatPresentation,
    getShakeOffset,
    isLaserSlowActive,
    applySwampHitSlow,
    getMovementSlowMult,
    resetCombatState,
    bumpScreenShake,
    grantInvulnerabilityUntil,
    getHeartsResistanceCardCount,
    getHeartsResistanceCooldown,
  };
}
