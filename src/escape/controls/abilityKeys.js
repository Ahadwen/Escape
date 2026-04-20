const DEFAULT_SLOTS = ["q", "w", "e", "r"];

function isTypingTarget(el) {
  if (!el || !(el instanceof Element)) return false;
  return !!el.closest("input, textarea, select, button, [contenteditable=true]");
}

/**
 * Fire once per physical press (ignores key repeat). Lowercase slot names.
 * @param {(slot: string) => void} onPress
 */
export function attachAbilityKeyPresses(win = window, onPress, slots = DEFAULT_SLOTS) {
  function onKeyDown(e) {
    if (e.repeat) return;
    if (isTypingTarget(e.target)) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (!slots.includes(k)) return;
    e.preventDefault();
    onPress(k);
  }

  win.addEventListener("keydown", onKeyDown);

  return {
    dispose() {
      win.removeEventListener("keydown", onKeyDown);
    },
  };
}
