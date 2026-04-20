import { createKnightItemRules } from "./knightItemRules.js";

/**
 * @param {string} characterId
 * @returns {ReturnType<typeof createKnightItemRules>}
 */
export function getItemRulesForCharacter(characterId) {
  switch (characterId) {
    case "knight":
      return createKnightItemRules();
    default:
      return createKnightItemRules();
  }
}
