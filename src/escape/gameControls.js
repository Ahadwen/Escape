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
    dispose() {
      win.removeEventListener("keydown", onDown);
      win.removeEventListener("keyup", onUp);
    },
  };
}
