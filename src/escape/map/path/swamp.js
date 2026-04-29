/**
 * Swamp path config.
 * Keep all path-specific tuning in this module.
 */

export const SWAMP_PATH_DEF = {
  id: "swamp",
  label: "Swamp",
  tileTint: "#122015",
  /** @param {any} payload */
  onDamage(payload) {
    if (!payload) return payload;
    const amount = Number(payload.amount ?? 0);
    const opts = payload.opts || {};
    if (opts.swampInfectionOnly) {
      return {
        ...payload,
        amount: 0,
        opts: { ...opts, swampApplyInfection: true },
      };
    }
    if (amount <= 0) return payload;
    const stacks = Math.max(0, Math.floor(Number(payload.inventory?.swampInfectionStacks ?? 0)));
    const runLevel = Math.max(0, Math.floor(Number(payload.runLevel ?? 0)));
    const divisor = runLevel >= 2 ? 8 : 10;
    const bonus = Math.floor(stacks / divisor);
    return {
      ...payload,
      amount: amount + bonus,
      opts: { ...opts, swampApplyInfection: true },
    };
  },
  /** @param {any} payload */
  onEnemy(payload) {
    return payload;
  },
  /** @param {any} payload */
  onDebuff(payload) {
    return payload;
  },
};
