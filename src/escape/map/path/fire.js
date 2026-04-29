/**
 * Fire path config.
 * Keep all path-specific tuning in this module.
 */

export const FIRE_PATH_DEF = {
  id: "fire",
  label: "Fire",
  tileTint: "#341412",
  /** @param {any} payload */
  onDamage(payload) {
    if (!payload || (payload.amount ?? 0) <= 0) return payload;
    const prevOpts = payload.opts || {};
    if (prevOpts.fireIgniteTick || prevOpts.fireNoIgnite) return payload;
    return {
      ...payload,
      opts: {
        ...prevOpts,
        fireApplyIgnite: true,
      },
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
