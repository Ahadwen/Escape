import { createKnightItemRules } from "./knightItemRules.js";
import { createRogueItemRules } from "./rogueItemRules.js";
import { createLunaticItemRules } from "./lunaticItemRules.js";
import { createValiantItemRules } from "./valiantItemRules.js";
import { createBulwarkItemRules } from "./bulwarkItemRules.js";

/**
 * @param {string} characterId
 * @returns {ReturnType<typeof createKnightItemRules> | ReturnType<typeof createRogueItemRules> | ReturnType<typeof createLunaticItemRules>}
 */
export function getItemRulesForCharacter(characterId) {
  switch (characterId) {
    case "knight":
      return createKnightItemRules();
    case "rogue":
      return createRogueItemRules();
    case "lunatic":
      return createLunaticItemRules();
    case "valiant":
      return createValiantItemRules();
    case "bulwark":
      return createBulwarkItemRules();
    default:
      return createKnightItemRules();
  }
}
