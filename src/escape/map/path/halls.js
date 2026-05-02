/**
 * Halls path (late game, display levels 4–5). Gameplay hooks live here as they are added.
 */

export const HALLS_PATH_DEF = {
  id: "halls",
  label: "Halls",
  tileTint: "#c9c2b8",
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
