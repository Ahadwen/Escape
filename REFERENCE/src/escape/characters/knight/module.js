import { makeCharacterSchema } from "../schema.js";

export const knightModule = makeCharacterSchema({
  id: "knight",
  controlsHint: "Move: Arrows | Abilities: Q dash, W speed burst, E decoy | Pause: Space | Retry: R (character select)",
});
