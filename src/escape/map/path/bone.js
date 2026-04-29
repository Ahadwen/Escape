/**
 * Bone path config.
 * Keep all path-specific tuning in this module.
 */

export const BONE_PATH_DEF = {
  id: "bone",
  label: "Bone",
  tileTint: "#2a2d33",
  /** @param {any} payload */
  onDamage(payload) {
    return payload;
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
