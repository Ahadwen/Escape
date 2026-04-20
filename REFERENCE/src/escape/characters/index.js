import { DEFAULT_CHARACTER_SCHEMA } from "./schema.js";
import { knightModule } from "./knight/module.js";
import { rogueModule } from "./rogue/module.js";
import { lunaticModule } from "./lunatic/module.js";
import { valiantModule } from "./valiant/module.js";

export const characterModules = {
  knight: knightModule,
  rogue: rogueModule,
  lunatic: lunaticModule,
  valiant: valiantModule,
};

export function getCharacterModule(characterId) {
  return characterModules[characterId] || DEFAULT_CHARACTER_SCHEMA;
}
