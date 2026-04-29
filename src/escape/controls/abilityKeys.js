const DEFAULT_SLOTS = ["q", "w", "e", "r"];

/**
 * Dev / shell `<select>` elements that keep focus after change but must not block in-game Q/W/E/R
 * (same idea as hero pick: browser leaves focus on the control).
 */
const SHELL_SELECTS_THAT_DO_NOT_BLOCK_ABILITY_KEYS = [
  "#dev-active-hero-select",
  "#special-test-west-select",
  "#game-speed",
  "#debug-item-suit",
  "#debug-item-rank",
  "#debug-item-effect",
  "#debug-path-select",
];

function isShellControlThatKeepsFocusButAllowsAbilityKeys(el) {
  if (!el || !(el instanceof Element)) return false;
  for (const sel of SHELL_SELECTS_THAT_DO_NOT_BLOCK_ABILITY_KEYS) {
    if (el.matches(sel) || el.closest(sel)) return true;
  }
  return false;
}

/**
 * True when the event target is a field that should swallow Q/W/E/R (modals, chat, etc.).
 * Side-panel dev `<select>`s are excluded so abilities still work after picking a hero, test hex
 * kind, sim speed, or debug item row (otherwise the control keeps focus and keys never reach the game).
 */
export function isDomShellTypingTarget(el) {
  if (!el || !(el instanceof Element)) return false;
  if (isShellControlThatKeepsFocusButAllowsAbilityKeys(el)) return false;
  return !!el.closest("input, textarea, select, button, [contenteditable=true]");
}

/**
 * Fire once per physical press (ignores key repeat). Lowercase slot names.
 * @param {(slot: string) => void} onPress
 * @param {(slot: string) => void} [onRelease] — optional keyup (e.g. Rogue dash on Q release)
 */
export function attachAbilityKeyPresses(win = window, onPress, slots = DEFAULT_SLOTS, onRelease = null) {
  const slotList = slots ?? DEFAULT_SLOTS;
  function onKeyDown(e) {
    if (e.repeat) return;
    if (isDomShellTypingTarget(e.target)) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (!slotList.includes(k)) return;
    e.preventDefault();
    onPress(k);
  }

  function onKeyUp(e) {
    if (!onRelease) return;
    if (isDomShellTypingTarget(e.target)) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (!slotList.includes(k)) return;
    e.preventDefault();
    onRelease(k);
  }

  win.addEventListener("keydown", onKeyDown);
  if (onRelease) win.addEventListener("keyup", onKeyUp);

  return {
    dispose() {
      win.removeEventListener("keydown", onKeyDown);
      if (onRelease) win.removeEventListener("keyup", onKeyUp);
    },
  };
}
