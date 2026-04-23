import { createKnight } from "./Knight.js";
import { createRogue } from "./Rogue.js";
import { createLunatic } from "./Lunatic.js";
import { createValiant } from "./Valiant.js";
import { createBulwark } from "./Bulwark.js";
import { createBulwarkWorld } from "./bulwarkWorld.js";

export { getHeroRoster, HERO_ROSTER, resolveImplementedHeroId } from "./roster.js";
export { createBulwarkWorld } from "./bulwarkWorld.js";

/**
 * Controllers should implement:
 * - `getCombatProfile()` → `{ maxHp, startingHp? }`
 * - `getShellUi()` (optional) → `{ controlsHintLine }`
 * - `getHpHudYOffset()` (optional) for HP text placement vs the orb
 *
 * @param {string} characterId
 * @param {ReturnType<import("./rogueWorld.js").createRogueWorld> | null} [rogueWorld] — required when `characterId === "rogue"`
 * @param {ReturnType<import("./valiantWorld.js").createValiantWorld> | null} [valiantWorld] — required when `characterId === "valiant"`
 * @param {ReturnType<typeof createBulwarkWorld> | null} [bulwarkWorld] — required when `characterId === "bulwark"`
 */
export function createCharacterController(characterId, rogueWorld = null, valiantWorld = null, bulwarkWorld = null) {
  if (characterId === "knight") return createKnight();
  if (characterId === "rogue") {
    if (!rogueWorld) throw new Error("createCharacterController(rogue): rogueWorld is required");
    return createRogue(rogueWorld);
  }
  if (characterId === "lunatic") return createLunatic();
  if (characterId === "valiant") {
    if (!valiantWorld) throw new Error("createCharacterController(valiant): valiantWorld is required");
    return createValiant(valiantWorld);
  }
  if (characterId === "bulwark") {
    if (!bulwarkWorld) throw new Error("createCharacterController(bulwark): bulwarkWorld is required");
    return createBulwark(bulwarkWorld);
  }
  throw new Error(`Unknown character: ${characterId}`);
}
