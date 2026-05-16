/**
 * Normalize damage opts into a stable analytics key.
 * @param {object} [opts]
 * @returns {string | null}
 */
export function resolveDamageSourceKey(opts = {}) {
  if (opts.damageSourceKey && typeof opts.damageSourceKey === "string") {
    return opts.damageSourceKey;
  }
  if (opts.enemyType && typeof opts.enemyType === "string") {
    return opts.enemyType;
  }
  if (opts.envKind && typeof opts.envKind === "string") {
    return opts.envKind;
  }
  if (opts.eldritchBloodAttack) return `eldritch:${opts.eldritchBloodAttack}`;
  if (opts.surgeHexPulse) return "gauntlet_pulse";
  if (opts.rouletteHexOuterPenalty) return "roulette_outer";
  if (opts.hallsBishopHeavenLaser) return "halls_bishop_laser";
  if (opts.hallsRookAura) return "halls_rook_aura";
  if (opts.lunaticCrash) return "lunatic_crash";
  if (opts.lunaticRoarTerrain) return "lunatic_roar";
  if (opts.swampBootlegBloodTax) return "swamp_bootleg_blood_tax";
  if (opts.swampInfectionOnly || (opts.swampApplyInfection && !opts.enemyType)) {
    if (opts.swampInfectionBurst) return "swamp_infection_burst";
    return "swamp_pool";
  }
  if (opts.laserBlueSlow) return "laser_blue";
  if (opts.swampDamageInstanceId != null || opts.laserOneShotId != null) {
    return opts.laserBlueSlow ? "laser_blue" : "laser";
  }
  if (opts.fireApplyIgnite) return "fire_artillery";
  if (opts.hallsHolyZone) return "halls_holy_zone";
  return null;
}
