import { createKnight } from "./Knight.js";

export { getHeroRoster, HERO_ROSTER, resolveImplementedHeroId } from "./roster.js";

/**
 * Controllers should implement:
 * - `getCombatProfile()` → `{ maxHp, startingHp? }`
 * - `getShellUi()` (optional) → `{ controlsHintLine }`
 * - `getHpHudYOffset()` (optional) for HP text placement vs the orb
 *
 * @param {string} characterId
 */
export function createCharacterController(characterId) {
  if (characterId === "knight") return createKnight();
  throw new Error(`Unknown character: ${characterId}`);
}
