/** Shown if a character does not expose `getShellUi()`. */
export const GENERIC_CONTROLS_HINT =
  "Move: Arrows | Abilities: Q, W, E, R (labels from your hero) | Pause: Space | After death: Enter retry";

/**
 * Apply static shell copy that depends on the active hero (character module owns the strings).
 * @param {Document} doc
 * @param {{ getShellUi?: () => { controlsHintLine?: string } }} character
 */
export function applyShellUiFromCharacter(doc, character) {
  const el = doc.getElementById("game-controls-hint");
  if (!el) return;
  const line =
    typeof character.getShellUi === "function"
      ? character.getShellUi()?.controlsHintLine
      : null;
  el.textContent = (line && line.trim()) || GENERIC_CONTROLS_HINT;
}
