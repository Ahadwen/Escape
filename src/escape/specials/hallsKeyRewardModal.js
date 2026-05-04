/**
 * Halls path: special-hex keys (tribunal / audit) are claimed via a short reward UI —
 * drag the key token onto the matching ring slot (or tap the highlighted slot).
 */

/** @typedef {"tribunal" | "audit" | "corridor"} HallsKeyKind */

const KEY_META = {
  tribunal: { title: "Tribunal key", slotLabel: "Tribunal", letter: "T" },
  audit: { title: "Audit key", slotLabel: "Audit", letter: "A" },
  corridor: { title: "Corridor key", slotLabel: "Corridor", letter: "C" },
};

/**
 * @param {object} deps
 * @property {HTMLElement | null} root
 * @property {{ hallsTribunalKey?: boolean; hallsAuditKey?: boolean; hallsCorridorKey?: boolean }} inventory
 * @property {() => void} onSyncInventory
 * @property {(paused: boolean) => void} [onPausedChange]
 */
export function createHallsKeyRewardModal(deps) {
  const { root, inventory, onSyncInventory, onPausedChange = () => {} } = deps;
  if (!root) {
    return {
      openReward() {},
      isPaused: () => false,
      resetAll() {},
      dispose() {},
    };
  }

  const titleEl = root.querySelector(".halls-key-reward-title");
  const hintEl = root.querySelector(".halls-key-reward-hint");
  const stageEl = root.querySelector(".halls-key-reward-stage");
  const tokenEl = root.querySelector(".halls-key-reward-token");
  /** @type {NodeListOf<HTMLElement> | null} */
  const slotEls = root.querySelectorAll("[data-halls-key-drop]");

  let paused = false;
  /** @type {HallsKeyKind | null} */
  let pendingKey = null;
  /** @type {HallsKeyKind[]} */
  const queue = [];

  /** @type {{ pointerId: number; offsetX: number; offsetY: number; moved: boolean } | null} */
  let drag = null;

  function isPaused() {
    return paused;
  }

  function setFlag(key) {
    if (key === "tribunal") inventory.hallsTribunalKey = true;
    else if (key === "audit") inventory.hallsAuditKey = true;
    else if (key === "corridor") inventory.hallsCorridorKey = true;
    onSyncInventory();
  }

  function slotElFromPoint(clientX, clientY) {
    const stack =
      typeof document.elementsFromPoint === "function"
        ? document.elementsFromPoint(clientX, clientY)
        : [document.elementFromPoint(clientX, clientY)];
    for (const node of stack) {
      if (!(node instanceof Element)) continue;
      const z = node.closest("[data-halls-key-drop]");
      if (z && root.contains(z)) return /** @type {HTMLElement} */ (z);
    }
    return null;
  }

  function layoutTokenHome() {
    if (!tokenEl || !stageEl) return;
    tokenEl.classList.add("halls-key-reward-token--home");
    tokenEl.style.left = "";
    tokenEl.style.top = "";
    tokenEl.style.transform = "";
  }

  function hideModalUi() {
    root.classList.remove("open");
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    layoutTokenHome();
    for (const s of slotEls) {
      s.classList.remove("halls-key-reward-slot--target", "halls-key-reward-slot--inactive", "halls-key-reward-slot--hover");
    }
  }

  function endPaused() {
    paused = false;
    pendingKey = null;
    drag = null;
    onPausedChange(false);
  }

  function closeAndPump() {
    hideModalUi();
    endPaused();
    const next = queue.shift();
    if (next) openRewardInner(next);
  }

  function succeed(key) {
    setFlag(key);
    closeAndPump();
  }

  function openRewardInner(/** @type {HallsKeyKind} */ key) {
    const meta = KEY_META[key];
    if (!meta || !titleEl || !hintEl) return;
    pendingKey = key;
    paused = true;
    onPausedChange(true);
    titleEl.textContent = meta.title;
    hintEl.textContent = `Drag the key into the ${meta.slotLabel} slot, or tap the glowing slot.`;
    for (const s of slotEls) {
      const k = s.getAttribute("data-halls-key-drop");
      const isTarget = k === key;
      s.classList.toggle("halls-key-reward-slot--target", isTarget);
      s.classList.toggle("halls-key-reward-slot--inactive", !isTarget);
      s.setAttribute("aria-disabled", isTarget ? "false" : "true");
    }
    root.hidden = false;
    root.classList.add("open");
    root.setAttribute("aria-hidden", "false");
    layoutTokenHome();
  }

  function openReward(/** @type {{ key: HallsKeyKind }} */ opts) {
    const key = opts.key;
    if (!(key in KEY_META)) return;
    if (paused) {
      queue.push(key);
      return;
    }
    openRewardInner(key);
  }

  function tryCompleteDrop(clientX, clientY) {
    if (!pendingKey) return;
    const slot = slotElFromPoint(clientX, clientY);
    if (!slot) return;
    const k = slot.getAttribute("data-halls-key-drop");
    if (k === pendingKey) succeed(/** @type {HallsKeyKind} */ (k));
  }

  function onTokenPointerDown(e) {
    if (!paused || !pendingKey || !tokenEl || !stageEl) return;
    if (e.button !== 0) return;
    e.preventDefault();
    tokenEl.classList.remove("halls-key-reward-token--home");
    const tr = tokenEl.getBoundingClientRect();
    drag = {
      pointerId: e.pointerId,
      offsetX: e.clientX - tr.left,
      offsetY: e.clientY - tr.top,
      moved: false,
    };
    tokenEl.setPointerCapture(e.pointerId);
    positionTokenFromPointer(e);
  }

  function positionTokenFromPointer(e) {
    if (!tokenEl || !stageEl || !drag) return;
    const sr = stageEl.getBoundingClientRect();
    let left = e.clientX - sr.left - drag.offsetX;
    let top = e.clientY - sr.top - drag.offsetY;
    const margin = 8;
    const tw = tokenEl.offsetWidth || 72;
    const th = tokenEl.offsetHeight || 52;
    left = Math.max(margin, Math.min(left, sr.width - tw - margin));
    top = Math.max(margin, Math.min(top, sr.height - th - margin));
    tokenEl.style.left = `${left}px`;
    tokenEl.style.top = `${top}px`;
    tokenEl.style.transform = "none";
  }

  function onTokenPointerMove(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    drag.moved = true;
    positionTokenFromPointer(e);
    const slot = slotElFromPoint(e.clientX, e.clientY);
    for (const s of slotEls) {
      s.classList.toggle("halls-key-reward-slot--hover", !!slot && s === slot && s.getAttribute("data-halls-key-drop") === pendingKey);
    }
  }

  function onTokenPointerUp(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    for (const s of slotEls) s.classList.remove("halls-key-reward-slot--hover");
    try {
      tokenEl.releasePointerCapture(e.pointerId);
    } catch {
      /* */
    }
    tryCompleteDrop(e.clientX, e.clientY);
    if (paused && pendingKey) layoutTokenHome();
    drag = null;
  }

  function onSlotClick(e) {
    const t = e.currentTarget;
    if (!(t instanceof HTMLElement)) return;
    if (!pendingKey) return;
    if (!t.classList.contains("halls-key-reward-slot--target")) return;
    const k = t.getAttribute("data-halls-key-drop");
    if (k === pendingKey) succeed(/** @type {HallsKeyKind} */ (k));
  }

  if (tokenEl) {
    tokenEl.addEventListener("pointerdown", onTokenPointerDown);
    tokenEl.addEventListener("pointermove", onTokenPointerMove);
    tokenEl.addEventListener("pointerup", onTokenPointerUp);
    tokenEl.addEventListener("pointercancel", onTokenPointerUp);
  }
  for (const s of slotEls) {
    s.addEventListener("click", onSlotClick);
  }

  function resetAll() {
    queue.length = 0;
    hideModalUi();
    endPaused();
  }

  function dispose() {
    resetAll();
    if (tokenEl) {
      tokenEl.removeEventListener("pointerdown", onTokenPointerDown);
      tokenEl.removeEventListener("pointermove", onTokenPointerMove);
      tokenEl.removeEventListener("pointerup", onTokenPointerUp);
      tokenEl.removeEventListener("pointercancel", onTokenPointerUp);
    }
    for (const s of slotEls) {
      s.removeEventListener("click", onSlotClick);
    }
  }

  return {
    openReward,
    isPaused,
    resetAll,
    dispose,
  };
}
