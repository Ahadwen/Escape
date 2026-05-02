/**
 * Depths path (late game, display levels 4–5). Gameplay hooks live here as they are added.
 */

export const DEPTHS_PATH_DEF = {
  id: "depths",
  label: "Depths",
  tileTint: "#050f18",
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
