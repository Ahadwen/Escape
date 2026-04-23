const ARROWS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

/**
 * Tracks arrow key held state. Call `dispose()` on teardown.
 * @param {Window} win
 */
export function attachArrowKeyState(win = window) {
  /** @type {Record<string, boolean>} */
  const down = Object.fromEntries(ARROWS.map((k) => [k, false]));

  function onDown(e) {
    if (ARROWS.includes(e.key)) {
      down[e.key] = true;
      e.preventDefault();
    }
  }

  function onUp(e) {
    if (ARROWS.includes(e.key)) {
      down[e.key] = false;
      e.preventDefault();
    }
  }

  win.addEventListener("keydown", onDown);
  win.addEventListener("keyup", onUp);

  return {
    isDown(key) {
      return !!down[key];
    },
    /** Clear held movement keys (REFERENCE `state.keys.clear()` on manual pause). */
    clearHeld() {
      for (const k of ARROWS) down[k] = false;
    },
    dispose() {
      win.removeEventListener("keydown", onDown);
      win.removeEventListener("keyup", onUp);
    },
  };
}

/**
 * Tracks lowercase letter keys (e.g. Lunatic Q/E steering). Call `dispose()` on teardown.
 * @param {Window} win
 * @param {string[]} letters — single-char keys, compared case-insensitively
 */
export function attachHeldLetterKeys(win = window, letters = ["q", "e"]) {
  const norm = letters.map((l) => String(l).toLowerCase());
  /** @type {Record<string, boolean>} */
  const down = Object.fromEntries(norm.map((k) => [k, false]));

  function onDown(e) {
    if (e.repeat) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : "";
    if (!norm.includes(k)) return;
    down[k] = true;
    e.preventDefault();
  }

  function onUp(e) {
    const k = e.key.length === 1 ? e.key.toLowerCase() : "";
    if (!norm.includes(k)) return;
    down[k] = false;
    e.preventDefault();
  }

  win.addEventListener("keydown", onDown);
  win.addEventListener("keyup", onUp);

  return {
    isDown(letter) {
      return !!down[String(letter).toLowerCase()];
    },
    clearHeld() {
      for (const k of norm) down[k] = false;
    },
    dispose() {
      win.removeEventListener("keydown", onDown);
      win.removeEventListener("keyup", onUp);
    },
  };
}
