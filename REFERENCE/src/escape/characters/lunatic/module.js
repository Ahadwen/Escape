import { makeCharacterSchema } from "../schema.js";

export const lunaticModule = makeCharacterSchema({
  id: "lunatic",
  controlsHint:
    "Move: Arrows (stumble) | Sprint: W — hold Q or Left to curve left, E or Right to curve right | R roar (sprint only) | Pause: Space | Retry: R (character select)",
  interactableHooks: {
    modifyCardSpawn: (_ctx, spec) => ({ ...spec, disabled: true }),
  },
  abilities: {
    onQ: () => true,
    onW: (ctx) => {
      ctx.tryLunaticWToggle();
      return true;
    },
    onE: () => true,
  },
});
