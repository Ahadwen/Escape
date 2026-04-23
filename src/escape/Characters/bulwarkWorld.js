import {
  BULWARK_FLAG_MAX_HP,
  BULWARK_FLAG_PLANT_INVULN_SEC,
  BULWARK_FLAG_PLANT_CHARGE_INTERVAL_SEC,
  BULWARK_FLAG_PICKUP_HEAL_PER_CHARGE,
  BULWARK_FLAG_PICKUP_R,
  BULWARK_FLAG_LURE_RADIUS,
  BULWARK_FLAG_RECHARGE_PER_SEC,
  BULWARK_NEAR_FLAG_CD_RADIUS,
  BULWARK_DEATH_LOCK_RADIUS,
  BULWARK_DEATH_LOCK_SEC,
  BULWARK_FLAG_RESPAWN_HP,
} from "../balance.js";

function distSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function createBulwarkWorld() {
  let carriedHp = BULWARK_FLAG_MAX_HP;
  let flagCarried = true;
  /** @type {{ x: number; y: number } | null} */
  let planted = null;
  /** @type {{ cx: number; cy: number; r: number; until: number } | null} */
  let deathLock = null;

  const plantedFlagDecoy = {
    kind: "bulwarkFlag",
    x: 0,
    y: 0,
    r: 26,
    until: 1e12,
    hp: BULWARK_FLAG_MAX_HP,
    maxHp: BULWARK_FLAG_MAX_HP,
    invulnerableUntil: 0,
    /** Last `damageId` from hunter laser that already applied 1 HP this beam. */
    lastLaserBeamHitId: 0,
  };

  /** @type {typeof plantedFlagDecoy[]} */
  const decoysReturn = [];

  /** Seconds banked toward the next plant charge (0.5s → +1 charge). */
  let plantChargeAcc = 0;
  /** Charges built while planted; pickup heals `charges × BULWARK_FLAG_PICKUP_HEAL_PER_CHARGE` (does not change planted flag HP). */
  let plantedCharges = 0;

  function reset() {
    carriedHp = BULWARK_FLAG_MAX_HP;
    flagCarried = true;
    planted = null;
    deathLock = null;
    decoysReturn.length = 0;
    plantedFlagDecoy.hp = BULWARK_FLAG_MAX_HP;
    plantedFlagDecoy.invulnerableUntil = 0;
    plantedFlagDecoy.lastLaserBeamHitId = 0;
    plantChargeAcc = 0;
    plantedCharges = 0;
  }

  function getPlantedFlagForAi() {
    if (flagCarried || !planted || plantedFlagDecoy.hp <= 0) return null;
    return { x: planted.x, y: planted.y, r: plantedFlagDecoy.r, lureR: BULWARK_FLAG_LURE_RADIUS };
  }

  function isNearPlantedFlag(player) {
    if (flagCarried || !planted || plantedFlagDecoy.hp <= 0) return false;
    return distSq(player, planted) <= BULWARK_NEAR_FLAG_CD_RADIUS * BULWARK_NEAR_FLAG_CD_RADIUS;
  }

  function getDeathLock() {
    return deathLock;
  }

  /** @param {{ x: number; y: number; r: number }} player */
  function clampPlayerInDeathLock(player) {
    if (!deathLock) return;
    const dx = player.x - deathLock.cx;
    const dy = player.y - deathLock.cy;
    const d = Math.hypot(dx, dy) || 1;
    const maxD = Math.max(0, deathLock.r - player.r - 2);
    if (d > maxD) {
      player.x = deathLock.cx + (dx / d) * maxD;
      player.y = deathLock.cy + (dy / d) * maxD;
    }
  }

  function tickDeathLock(elapsed) {
    if (deathLock && elapsed >= deathLock.until) {
      deathLock = null;
      flagCarried = true;
      carriedHp = BULWARK_FLAG_RESPAWN_HP;
    }
  }

  function onPlantedFlagDestroyed(px, py, elapsed) {
    planted = null;
    decoysReturn.length = 0;
    plantChargeAcc = 0;
    plantedCharges = 0;
    deathLock = { cx: px, cy: py, r: BULWARK_DEATH_LOCK_RADIUS, until: elapsed + BULWARK_DEATH_LOCK_SEC };
  }

  /** @param {number} elapsed @param {number} dt */
  function tick(elapsed, dt) {
    tickDeathLock(elapsed);
    if (flagCarried && carriedHp < BULWARK_FLAG_MAX_HP && !deathLock) {
      carriedHp = Math.min(BULWARK_FLAG_MAX_HP, carriedHp + BULWARK_FLAG_RECHARGE_PER_SEC * (dt ?? 0));
    }
    if (!flagCarried && planted && plantedFlagDecoy.hp > 0) {
      plantChargeAcc += dt;
      while (plantChargeAcc >= BULWARK_FLAG_PLANT_CHARGE_INTERVAL_SEC) {
        plantChargeAcc -= BULWARK_FLAG_PLANT_CHARGE_INTERVAL_SEC;
        plantedCharges += 1;
      }
    } else if (flagCarried) {
      plantChargeAcc = 0;
    }
    if (!flagCarried && planted && plantedFlagDecoy.hp <= 0) {
      onPlantedFlagDestroyed(planted.x, planted.y, elapsed);
    }
  }

  /**
   * @param {{ x: number; y: number; r: number }} player
   * @param {number} elapsed
   */
  function tryPlantFlag(player, elapsed) {
    if (!flagCarried || Math.floor(carriedHp) < 1 || deathLock) return false;
    planted = { x: player.x, y: player.y };
    plantedFlagDecoy.x = planted.x;
    plantedFlagDecoy.y = planted.y;
    const pool = Math.min(BULWARK_FLAG_MAX_HP, Math.max(1, Math.floor(carriedHp)));
    plantedFlagDecoy.hp = pool;
    plantedFlagDecoy.maxHp = BULWARK_FLAG_MAX_HP;
    plantedFlagDecoy.invulnerableUntil = elapsed + BULWARK_FLAG_PLANT_INVULN_SEC;
    plantedFlagDecoy.lastLaserBeamHitId = 0;
    plantChargeAcc = 0;
    plantedCharges = 0;
    flagCarried = false;
    decoysReturn.length = 0;
    decoysReturn.push(plantedFlagDecoy);
    return true;
  }

  /**
   * @param {{ x: number; y: number; r: number }} player
   * @returns {false | number} `false` if no pickup; else HP to restore to the hero (`charges × healPerCharge`, may be 0).
   */
  function tryPickupFlag(player) {
    if (flagCarried || !planted || plantedFlagDecoy.hp <= 0) return false;
    const rr = BULWARK_FLAG_PICKUP_R + player.r;
    if (distSq(player, planted) > rr * rr) return false;
    const heal = plantedCharges * BULWARK_FLAG_PICKUP_HEAL_PER_CHARGE;
    plantedCharges = 0;
    plantChargeAcc = 0;
    carriedHp = plantedFlagDecoy.hp;
    flagCarried = true;
    planted = null;
    decoysReturn.length = 0;
    return heal;
  }

  function getDecoys() {
    decoysReturn.length = 0;
    if (!flagCarried && planted && plantedFlagDecoy.hp > 0) {
      plantedFlagDecoy.x = planted.x;
      plantedFlagDecoy.y = planted.y;
      decoysReturn.push(plantedFlagDecoy);
    }
    return decoysReturn;
  }

  return {
    reset,
    tick,
    getPlantedFlagForAi,
    isNearPlantedFlag,
    getDeathLock,
    clampPlayerInDeathLock,
    tryPlantFlag,
    tryPickupFlag,
    getDecoys,
    isFlagCarried: () => flagCarried,
    /** Integer HP shown in HUD / on the carried flag (internal HP regens fractionally). */
    getCarriedHp: () => Math.floor(carriedHp),
    getPlantedChargeCount: () => plantedCharges,
    getPlantedFlagDecoy: () => plantedFlagDecoy,
    hasPlantedFlag: () => !!planted && plantedFlagDecoy.hp > 0,
  };
}
