/**
 * Character-specific copy surface so `game.js` can delegate text ownership.
 * `game.js` still provides full fallback text during migration.
 */
export function getCharacterControlsHint(module, fallback) {
  if (module?.controlsHint) return module.controlsHint;
  return fallback;
}

export function getCharacterDefaultControlsHint(characterId) {
  if (characterId === "rogue") {
    return "Move: Arrows | Abilities: Q dash, W smoke bomb, E point to food | Pause: Space | Retry: R (character select)";
  }
  if (characterId === "valiant") {
    return "Move: Arrows | Abilities: Q Surge, W shock field (enemies), E Rescue, R Ultimate (Ace slot) | Pause: Space | Retry: R (character select)";
  }
  if (characterId === "lunatic") {
    return "Move: Arrows (stumble) | Sprint: W — hold Q or Left to curve left, E or Right to curve right | R roar (sprint only) | Pause: Space | Retry: R (character select)";
  }
  return "Move: Arrows | Abilities: Q dash, W speed burst, E decoy | Pause: Space | Retry: R (character select)";
}
