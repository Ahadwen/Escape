import { formatCardName } from "../items/cardUtils.js";

function preferTouchPointerDrag() {
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

function forgeRefKey(ref) {
  if (!ref) return "";
  return ref.kind === "deck" ? `d:${ref.rank}` : `b:${ref.idx}`;
}

function parseForgeRefFromDataset(json) {
  try {
    const o = JSON.parse(json);
    if (o?.kind === "deck" && Number.isInteger(o.rank)) return { kind: "deck", rank: o.rank };
    if (o?.kind === "bp" && Number.isInteger(o.idx)) return { kind: "bp", idx: o.idx };
  } catch {
    /* ignore */
  }
  return null;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function forgeForgedRankFromCards(a, b) {
  if (!a || !b || a.suit === "joker" || b.suit === "joker") return null;
  const ra = a.rank;
  const rb = b.rank;
  if (!Number.isInteger(ra) || !Number.isInteger(rb)) return null;
  return clamp(ra + rb, 1, 13);
}

function forgeOutcomeSuit(a, b) {
  const suits = [];
  if (a?.suit && a.suit !== "joker") suits.push(a.suit);
  if (b?.suit && b.suit !== "joker") suits.push(b.suit);
  if (!suits.length) return "spades";
  return suits[Math.floor(Math.random() * suits.length)];
}

/**
 * REFERENCE `openForgeModal` / drag-merge / `commitForgeMerge` (world forge sites call `open` with `onCommitSuccess`).
 */
export function createForgeWorldModal(deps) {
  const {
    doc,
    inventory,
    getItemRules,
    syncDeckSlots,
    getOpenCardPickup,
    onPausedChange = () => {},
  } = deps;

  const forgeModal = doc.getElementById("forge-modal");
  const forgeModalTitle = doc.getElementById("forge-modal-title");
  const forgeModalSub = doc.getElementById("forge-modal-sub");
  const forgeModalActions = doc.getElementById("forge-modal-actions");
  const forgeSlotLeft = doc.getElementById("forge-slot-left");
  const forgeSlotRight = doc.getElementById("forge-slot-right");
  const forgePreviewValue = doc.getElementById("forge-preview-value");
  const forgeModalHint = doc.getElementById("forge-modal-hint");

  let mode = false;
  /** @type {{ kind: 'deck', rank: number } | { kind: 'bp', idx: number } | null} */
  let forgeRefA = null;
  /** @type {{ kind: 'deck', rank: number } | { kind: 'bp', idx: number } | null} */
  let forgeRefB = null;
  let forgePendingSuit = /** @type {string | null} */ (null);
  /** @type {null | (() => void)} */
  let onCommitSuccess = null;
  /** @type {{ parent: ParentNode; next: ChildNode | null } | null} */
  let deckPanelRestore = null;

  function isForgePaused() {
    return mode;
  }

  function cardAtForgeRef(ref) {
    if (!ref) return null;
    if (ref.kind === "deck") return inventory.deckByRank[ref.rank] || null;
    return inventory.backpackSlots[ref.idx] || null;
  }

  function clearForgeRefSlot(ref) {
    if (!ref) return;
    if (ref.kind === "deck") inventory.deckByRank[ref.rank] = null;
    else inventory.backpackSlots[ref.idx] = null;
  }

  /** @type {{ pointerId: number; onMove: (e: PointerEvent) => void; onUp: (e: PointerEvent) => void } | null} */
  let forgeTouchSession = null;

  function clearForgeDropHover() {
    forgeSlotLeft?.classList.remove("forge-drop-slot--hover");
    forgeSlotRight?.classList.remove("forge-drop-slot--hover");
  }

  function forgeDropSlotFromClientPoint(clientX, clientY) {
    const stack =
      typeof document.elementsFromPoint === "function"
        ? document.elementsFromPoint(clientX, clientY)
        : [document.elementFromPoint(clientX, clientY)];
    for (const node of stack) {
      if (!(node instanceof Element)) continue;
      const z = node.closest(".forge-drop-slot[data-slot]");
      if (z && forgeModal?.contains(z)) return z;
    }
    return null;
  }

  function endForgeTouchSession() {
    if (!forgeTouchSession) return;
    window.removeEventListener("pointermove", forgeTouchSession.onMove);
    window.removeEventListener("pointerup", forgeTouchSession.onUp);
    window.removeEventListener("pointercancel", forgeTouchSession.onUp);
    if (forgeModal && "releasePointerCapture" in forgeModal) {
      try {
        forgeModal.releasePointerCapture(forgeTouchSession.pointerId);
      } catch {
        /* already released */
      }
    }
    forgeTouchSession = null;
    clearForgeDropHover();
  }

  function closeUi() {
    endForgeTouchSession();
    const had = mode;
    mode = false;
    forgeRefA = null;
    forgeRefB = null;
    forgePendingSuit = null;
    onCommitSuccess = null;
    if (forgeModal) forgeModal.hidden = true;
    restoreDeckPanelIntoPage();
    if (forgeSlotLeft) {
      forgeSlotLeft.innerHTML = "";
      forgeSlotLeft.textContent = "";
      forgeSlotLeft.style.fontSize = "";
      forgeSlotLeft.style.color = "";
    }
    if (forgeSlotRight) {
      forgeSlotRight.innerHTML = "";
      forgeSlotRight.textContent = "";
      forgeSlotRight.style.fontSize = "";
      forgeSlotRight.style.color = "";
    }
    if (forgePreviewValue) forgePreviewValue.textContent = "—";
    if (forgeModalHint) forgeModalHint.textContent = "";
    if (forgeModalActions) forgeModalActions.innerHTML = "";
    if (had) onPausedChange(false);
    syncDeckSlots();
  }

  function mountDeckPanelIntoForgeModal() {
    const panel = doc.getElementById("player-deck-panel");
    const inner = forgeModal?.querySelector(".forge-modal-inner");
    if (!panel || !inner) return;
    if (!deckPanelRestore && panel.parentNode) {
      deckPanelRestore = { parent: panel.parentNode, next: panel.nextSibling };
    }
    const head = inner.querySelector(".roulette-modal-head");
    if (panel.parentNode === inner) return;
    if (head) head.insertAdjacentElement("afterend", panel);
    else inner.prepend(panel);
  }

  function restoreDeckPanelIntoPage() {
    const panel = doc.getElementById("player-deck-panel");
    if (!panel || !deckPanelRestore?.parent) return;
    const { parent, next } = deckPanelRestore;
    if (panel.parentNode === parent) return;
    if (next && next.parentNode === parent) parent.insertBefore(panel, next);
    else parent.appendChild(panel);
  }

  function onGlobalKeydown(e) {
    if (e.key !== "Escape" || !mode) return;
    e.preventDefault();
    closeUi();
  }

  doc.defaultView?.addEventListener("keydown", onGlobalKeydown);

  function renderForgeSlotContents() {
    for (const slot of /** @type {const} */ (["left", "right"])) {
      const el = slot === "left" ? forgeSlotLeft : forgeSlotRight;
      if (!el) continue;
      const ref = slot === "left" ? forgeRefA : forgeRefB;
      const card = cardAtForgeRef(ref);
      el.innerHTML = "";
      if (!card) {
        el.textContent = "Drop";
        el.style.fontSize = "12px";
        el.style.color = "rgba(148,163,184,0.75)";
        continue;
      }
      el.textContent = "";
      el.style.fontSize = "";
      el.style.color = "";
      const wrap = doc.createElement("div");
      wrap.className = "forge-slot-card";
      wrap.textContent = formatCardName(card);
      el.appendChild(wrap);
    }
  }

  function assignForgeToSlot(slot, ref) {
    if (!ref || (slot !== "left" && slot !== "right")) return;
    const k = forgeRefKey(ref);
    if (slot === "left") {
      if (forgeRefKey(forgeRefB) === k) forgeRefB = null;
      forgeRefA = ref;
    } else {
      if (forgeRefKey(forgeRefA) === k) forgeRefA = null;
      forgeRefB = ref;
    }
    syncForgeMergeUi();
  }

  function commitForgeMerge() {
    const ca = cardAtForgeRef(forgeRefA);
    const cb = cardAtForgeRef(forgeRefB);
    const rank = forgeForgedRankFromCards(ca, cb);
    if (!ca || !cb || rank == null) {
      closeUi();
      return;
    }
    const suit = forgePendingSuit || forgeOutcomeSuit(ca, cb);
    const rules = getItemRules();
    const placed = {
      id: `forge-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      suit,
      rank,
      effect: rules.makeCardEffect(suit, rank),
    };
    const dest = !inventory.deckByRank[rank]
      ? { kind: "deck", rank }
      : (() => {
          const i = inventory.backpackSlots.findIndex((s) => !s);
          return i >= 0 ? { kind: "bp", idx: i } : null;
        })();
    if (!dest) {
      if (forgeModalHint) {
        forgeModalHint.textContent =
          "That forged rank’s deck slot is occupied and your backpack is full. Make room, then try again.";
      }
      return;
    }
    clearForgeRefSlot(forgeRefA);
    clearForgeRefSlot(forgeRefB);
    syncDeckSlots();
    onCommitSuccess?.();
    closeUi();
    const pickup = getOpenCardPickup();
    if (typeof pickup === "function") pickup(placed);
  }

  function forgeRefreshActionButtons() {
    if (!forgeModalActions) return;
    forgeModalActions.innerHTML = "";
    const ca = cardAtForgeRef(forgeRefA);
    const cb = cardAtForgeRef(forgeRefB);
    const rank = forgeForgedRankFromCards(ca, cb);
    const ready = rank != null;

    const confirm = doc.createElement("button");
    confirm.type = "button";
    confirm.className = "leave-button";
    confirm.textContent = "Confirm forge";
    confirm.disabled = !ready;
    confirm.addEventListener("click", () => {
      const c1 = cardAtForgeRef(forgeRefA);
      const c2 = cardAtForgeRef(forgeRefB);
      if (forgeForgedRankFromCards(c1, c2) == null) return;
      if (!forgePendingSuit) forgePendingSuit = forgeOutcomeSuit(c1, c2);
      commitForgeMerge();
    });
    forgeModalActions.appendChild(confirm);

    const clear = doc.createElement("button");
    clear.type = "button";
    clear.className = "leave-button";
    clear.textContent = "Clear";
    clear.addEventListener("click", () => {
      forgeRefA = null;
      forgeRefB = null;
      forgePendingSuit = null;
      syncForgeMergeUi();
    });
    forgeModalActions.appendChild(clear);

    const cancel = doc.createElement("button");
    cancel.type = "button";
    cancel.className = "leave-button";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => closeUi());
    forgeModalActions.appendChild(cancel);
  }

  function syncForgeMergeUi() {
    const ca = cardAtForgeRef(forgeRefA);
    const cb = cardAtForgeRef(forgeRefB);
    const rank = forgeForgedRankFromCards(ca, cb);

    if (forgePreviewValue) forgePreviewValue.textContent = rank == null ? "—" : String(rank);

    if (ca && cb && rank != null) {
      if (!forgePendingSuit) forgePendingSuit = forgeOutcomeSuit(ca, cb);
      if (forgeModalHint) {
        forgeModalHint.textContent = `Creates rank ${rank}. Suit: ${forgePendingSuit} (random donor). Passive rerolls on confirm.`;
      }
    } else {
      forgePendingSuit = null;
      if (forgeModalHint) {
        forgeModalHint.textContent = preferTouchPointerDrag()
          ? "Press and drag two cards from the deck row above into the side slots, then confirm."
          : "Drag two cards from your deck and backpack above into the side slots, then confirm.";
      }
    }

    renderForgeSlotContents();
    forgeRefreshActionButtons();
  }

  function onForgeHudDragStart(e) {
    if (!mode) return;
    if (preferTouchPointerDrag()) {
      e.preventDefault();
      return;
    }
    const t = e.target;
    const src = t instanceof Element ? t.closest("[data-forge-ref]") : null;
    if (!src?.dataset.forgeRef) return;
    e.dataTransfer?.setData("application/json", src.dataset.forgeRef);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy";
  }

  function onForgeModalPointerDownCapture(e) {
    if (!mode || !preferTouchPointerDrag() || e.button !== 0) return;
    const src = e.target instanceof Element ? e.target.closest("[data-forge-ref]") : null;
    if (!src?.dataset?.forgeRef || !forgeModal?.contains(src)) return;
    if (forgeTouchSession) return;
    e.preventDefault();
    const refJson = src.dataset.forgeRef;
    const pointerId = e.pointerId;
    const onMove = (ev) => {
      if (ev.pointerId !== pointerId) return;
      ev.preventDefault();
      clearForgeDropHover();
      const drop = forgeDropSlotFromClientPoint(ev.clientX, ev.clientY);
      if (drop) drop.classList.add("forge-drop-slot--hover");
    };
    const onUp = (ev) => {
      if (ev.pointerId !== pointerId) return;
      ev.preventDefault();
      const drop = forgeDropSlotFromClientPoint(ev.clientX, ev.clientY);
      const slot = drop?.dataset?.slot;
      const ref = parseForgeRefFromDataset(refJson);
      if (ref && (slot === "left" || slot === "right")) assignForgeToSlot(slot, ref);
      endForgeTouchSession();
    };
    forgeTouchSession = { pointerId, onMove, onUp };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    if ("setPointerCapture" in forgeModal) {
      try {
        forgeModal.setPointerCapture(pointerId);
      } catch {
        /* ignore */
      }
    }
  }

  function wireForgeModalDragDropOnce() {
    if (!forgeModal || forgeModal.dataset.forgeDragWired === "1") return;
    if (!forgeSlotLeft || !forgeSlotRight) return;
    forgeModal.dataset.forgeDragWired = "1";

    doc.addEventListener("dragstart", onForgeHudDragStart, true);
    forgeModal.addEventListener("pointerdown", onForgeModalPointerDownCapture, true);

    for (const slotEl of [forgeSlotLeft, forgeSlotRight]) {
      slotEl.addEventListener("dragenter", (e) => {
        e.preventDefault();
        slotEl.classList.add("forge-drop-slot--hover");
      });
      slotEl.addEventListener("dragleave", () => slotEl.classList.remove("forge-drop-slot--hover"));
      slotEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        slotEl.classList.add("forge-drop-slot--hover");
      });
      slotEl.addEventListener("drop", (e) => {
        e.preventDefault();
        slotEl.classList.remove("forge-drop-slot--hover");
        const raw = e.dataTransfer?.getData("application/json") ?? "";
        const ref = parseForgeRefFromDataset(raw);
        if (!ref) return;
        const slot = slotEl.dataset.slot;
        if (slot === "left" || slot === "right") assignForgeToSlot(slot, ref);
      });
    }
  }

  /**
   * @param {object} opts
   * @param {() => void} [opts.onCommitSuccess] — mark procedural forge spent + hex flow
   */
  function open(opts = {}) {
    wireForgeModalDragDropOnce();
    if (!forgeModal || !forgeModalActions || !forgeSlotLeft || !forgeSlotRight || !forgePreviewValue || mode) {
      return;
    }
    onCommitSuccess = opts.onCommitSuccess ?? null;
    mode = true;
    onPausedChange(true);
    forgeRefA = null;
    forgeRefB = null;
    forgePendingSuit = null;
    forgeModal.hidden = false;
    if (forgeModalTitle) forgeModalTitle.textContent = "Forge";
    if (forgeModalSub) {
      forgeModalSub.textContent = preferTouchPointerDrag()
        ? "Use your normal deck row above. Press and drag two cards into the side slots. The center is the forged rank (sum of ranks, capped at 13)."
        : "Use your normal deck row above. Drag two cards into the side slots. The center is the forged rank (sum of ranks, capped at 13).";
    }
    mountDeckPanelIntoForgeModal();
    syncForgeMergeUi();
    syncDeckSlots();
  }

  function dispose() {
    endForgeTouchSession();
    doc.defaultView?.removeEventListener("keydown", onGlobalKeydown);
    doc.removeEventListener("dragstart", onForgeHudDragStart, true);
    forgeModal?.removeEventListener("pointerdown", onForgeModalPointerDownCapture, true);
    if (forgeModal) delete forgeModal.dataset.forgeDragWired;
  }

  return {
    isForgePaused,
    open,
    closeUi,
    dispose,
  };
}
