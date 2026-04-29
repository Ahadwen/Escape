import { formatCardName, formatCardHudSuitGlyph, cardRankText, CARD_SET_GLOW_CLASSES } from "./cardUtils.js";
import { countSuitsAcrossAllStowed, suitInventoryGlowClass, getModalSetBonusProgressLines } from "./setBonusPresentation.js";

function rankDeckIsCompletelyEmpty(inventory) {
  for (let rank = 1; rank <= 13; rank++) if (inventory.deckByRank[rank]) return false;
  return true;
}

function cardModalInventoryDragHintHtml() {
  return `<aside class="card-face-hint" aria-label="How to use inventory"><strong>Using inventory</strong><p><strong>Desktop:</strong> click and hold, then <b>drag</b> a card to a slot and release.<br><strong>Touch:</strong> press and <b>drag</b> a card onto another slot (same as desktop).</p></aside>`;
}

function preferTouchPointerDrag() {
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

function cardFaceNameHtml(card) {
  const red = card?.suit === "hearts" || card?.suit === "diamonds";
  return `<span class="card-face-name${red ? " card-face-name--red" : ""}">${formatCardName(card)}</span>`;
}

/**
 * @param {object} opts
 * @property {(paused: boolean) => void} [onPausedChange] — `true` when modal opens; `false` only when closing from an open state.
 */
export function createCardPickupModal(opts) {
  const {
    cardModal,
    cardModalFace,
    modalDeckStripEl,
    cardSwapRow,
    modalSetBonusStatusEl,
    cardCloseButton,
    inventory,
    getItemRules,
    syncDeckSlots,
    onPausedChange = /** @param {boolean} _ */ () => {},
    onDiamondEmpowerPicked = () => {},
  } = opts;

  let inventoryModalOpen = false;
  let cardPickupFlowActive = false;
  let pendingCard = null;
  let setBonusChoicePendingSuit = null;
  let pickupTargetRank = null;
  /** While dragging from a backpack or rank slot, overrides stale `pickupTargetRank` for face + deck drop zone (no full row rebuild). */
  let dragIntentRank = null;
  /** Desktop: tap card then tap zone. Coarse pointer: disabled in favour of pointer-drag on `.zone-card`. */
  let tapSwapSourceZoneId = null;

  /** @type {{ pointerId: number; onMove: (e: PointerEvent) => void; onUp: (e: PointerEvent) => void } | null} */
  let touchDragSession = null;

  function clearDropZoneHoverHighlights() {
    if (!cardSwapRow) return;
    for (const el of cardSwapRow.querySelectorAll(".drop-zone.over")) el.classList.remove("over");
  }

  function dropZoneFromClientPoint(clientX, clientY) {
    const stack =
      typeof document.elementsFromPoint === "function"
        ? document.elementsFromPoint(clientX, clientY)
        : [document.elementFromPoint(clientX, clientY)];
    for (const node of stack) {
      if (!(node instanceof Element)) continue;
      const z = node.closest("[data-zone-id].drop-zone");
      if (z && cardSwapRow?.contains(z)) return z;
    }
    return null;
  }

  function endTouchDragSession() {
    if (!touchDragSession) return;
    window.removeEventListener("pointermove", touchDragSession.onMove);
    window.removeEventListener("pointerup", touchDragSession.onUp);
    window.removeEventListener("pointercancel", touchDragSession.onUp);
    if (cardModal && "releasePointerCapture" in cardModal) {
      try {
        cardModal.releasePointerCapture(touchDragSession.pointerId);
      } catch {
        /* already released */
      }
    }
    touchDragSession = null;
    clearDropZoneHoverHighlights();
  }

  function effectivePickupRank() {
    if (pendingCard?.rank != null) return pendingCard.rank;
    if (dragIntentRank != null) return dragIntentRank;
    return pickupTargetRank;
  }

  function parseDeckZoneId(zoneId) {
    const m = /^deck-(\d+)$/.exec(zoneId);
    if (!m) return null;
    const r = Number(m[1]);
    return r >= 1 && r <= 13 ? r : null;
  }

  function parseBpZoneId(zoneId) {
    const m = /^bp-(\d+)$/.exec(zoneId);
    if (!m) return null;
    const i = Number(m[1]);
    return i >= 0 && i < 3 ? i : null;
  }

  function getCardByZone(zoneId) {
    if (zoneId === "pickup") return pendingCard;
    const dr = parseDeckZoneId(zoneId);
    if (dr != null) return inventory.deckByRank[dr] || null;
    const bi = parseBpZoneId(zoneId);
    if (bi != null) return inventory.backpackSlots[bi] || null;
    return null;
  }

  function setCardByZone(zoneId, card) {
    if (zoneId === "pickup") pendingCard = card;
    else {
      const dr = parseDeckZoneId(zoneId);
      if (dr != null) inventory.deckByRank[dr] = card || null;
      else {
        const bi = parseBpZoneId(zoneId);
        if (bi != null) inventory.backpackSlots[bi] = card || null;
      }
    }
  }

  function syncPickupTargetRankAfterSwap(fromZoneId, toZoneId, fromCardBefore, toCardBefore) {
    if (!cardPickupFlowActive) return;
    if (pendingCard) {
      pickupTargetRank = pendingCard.rank;
      return;
    }
    if (fromZoneId === "pickup") {
      const dTo = parseDeckZoneId(toZoneId);
      if (dTo != null) {
        pickupTargetRank = dTo;
        return;
      }
      const bTo = parseBpZoneId(toZoneId);
      if (bTo != null && !toCardBefore && fromCardBefore) {
        pickupTargetRank = fromCardBefore.rank;
        return;
      }
    }
    const bFrom = parseBpZoneId(fromZoneId);
    if (bFrom != null && fromCardBefore) {
      pickupTargetRank = fromCardBefore.rank;
      return;
    }
    const dFrom = parseDeckZoneId(fromZoneId);
    if (dFrom != null && fromCardBefore) {
      pickupTargetRank = fromCardBefore.rank;
      return;
    }
    pickupTargetRank = null;
  }

  function swapCardsBetweenZones(fromZoneId, toZoneId) {
    if (!fromZoneId || !toZoneId || fromZoneId === toZoneId) return;

    const dFrom = parseDeckZoneId(fromZoneId);
    const dTo = parseDeckZoneId(toZoneId);
    const bFrom = parseBpZoneId(fromZoneId);
    const bTo = parseBpZoneId(toZoneId);
    const toPickup = toZoneId === "pickup";

    if (dFrom != null && dTo != null && dFrom !== dTo) return;

    const fromCard = getCardByZone(fromZoneId);
    const toCard = getCardByZone(toZoneId);
    if (!fromCard && !toCard) return;

    const allowStageToEmptyPickup =
      toPickup &&
      !pendingCard &&
      cardPickupFlowActive &&
      fromCard &&
      (bFrom != null ||
        (dFrom != null &&
          fromCard.rank === dFrom &&
          (pickupTargetRank == null ||
            dFrom === pickupTargetRank ||
            (dragIntentRank != null && dFrom === dragIntentRank))));
    if (toPickup && !pendingCard && !allowStageToEmptyPickup) return;
    if (toPickup && !fromCard) return;

    if (dFrom != null && fromCard && fromCard.rank !== dFrom) return;
    if (dTo != null && fromCard && fromCard.rank !== dTo) return;
    if (dTo != null && toCard && toCard.rank !== dTo) return;
    if (dFrom != null && toPickup && toCard && toCard.rank !== dFrom) return;
    if (dFrom != null && bTo != null && toCard && toCard.rank !== dFrom) return;

    setCardByZone(fromZoneId, toCard || null);
    setCardByZone(toZoneId, fromCard || null);
    syncPickupTargetRankAfterSwap(fromZoneId, toZoneId, fromCard, toCard);
    renderCardModal();
    syncDeckSlots();
  }

  function clearTapSwapSelection() {
    tapSwapSourceZoneId = null;
    if (!cardSwapRow) return;
    const highlighted = cardSwapRow.querySelectorAll(".drop-zone.over");
    for (const el of highlighted) el.classList.remove("over");
  }

  function markTapSwapSelection(zoneId) {
    if (!cardSwapRow) return;
    const zones = cardSwapRow.querySelectorAll("[data-zone-id]");
    for (const zoneEl of zones) {
      if (!(zoneEl instanceof HTMLElement)) continue;
      zoneEl.classList.toggle("over", zoneEl.dataset.zoneId === zoneId);
    }
    tapSwapSourceZoneId = zoneId;
  }

  function wireDropZone(zoneEl, zoneId) {
    zoneEl.dataset.zoneId = zoneId;
    zoneEl.addEventListener("dragover", (event) => {
      event.preventDefault();
      zoneEl.classList.add("over");
    });
    zoneEl.addEventListener("dragleave", () => zoneEl.classList.remove("over"));
    zoneEl.addEventListener("drop", (event) => {
      event.preventDefault();
      zoneEl.classList.remove("over");
      const from = event.dataTransfer?.getData("text/plain");
      if (!from) return;
      swapCardsBetweenZones(from, zoneId);
      clearTapSwapSelection();
    });
    if (!preferTouchPointerDrag()) {
      zoneEl.addEventListener("click", () => {
        if (!tapSwapSourceZoneId) return;
        if (tapSwapSourceZoneId === zoneId) {
          clearTapSwapSelection();
          return;
        }
        const from = tapSwapSourceZoneId;
        clearTapSwapSelection();
        swapCardsBetweenZones(from, zoneId);
      });
    }
  }

  function beginTouchDragFromZone(zoneId, card, pointerId) {
    if (touchDragSession) return;
    clearTapSwapSelection();
    if (cardPickupFlowActive && card?.rank != null) {
      const fromBp = parseBpZoneId(zoneId) != null;
      const fromDeck = parseDeckZoneId(zoneId) != null;
      if (fromBp || fromDeck) {
        dragIntentRank = card.rank;
        refreshRankTargetUiDuringDrag();
      }
    }
    const fromZoneId = zoneId;
    const onMove = (ev) => {
      if (ev.pointerId !== pointerId) return;
      ev.preventDefault();
      clearDropZoneHoverHighlights();
      const drop = dropZoneFromClientPoint(ev.clientX, ev.clientY);
      if (drop) drop.classList.add("over");
    };
    const onUp = (ev) => {
      if (ev.pointerId !== pointerId) return;
      ev.preventDefault();
      const drop = dropZoneFromClientPoint(ev.clientX, ev.clientY);
      const to = drop?.dataset?.zoneId;
      if (to && to !== fromZoneId) {
        swapCardsBetweenZones(fromZoneId, to);
        clearTapSwapSelection();
      } else if (dragIntentRank != null) {
        dragIntentRank = null;
        renderCardModal();
      }
      endTouchDragSession();
    };
    touchDragSession = { pointerId, onMove, onUp };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    if (cardModal && "setPointerCapture" in cardModal) {
      try {
        cardModal.setPointerCapture(pointerId);
      } catch {
        /* ignore */
      }
    }
  }

  function appendCardToZone(zoneEl, zoneId, card, compact, itemRules) {
    const suitsAll = countSuitsAcrossAllStowed(inventory, pendingCard);
    const usePointerDrag = preferTouchPointerDrag();
    if (card) {
      const cardEl = document.createElement("div");
      cardEl.className = "zone-card";
      cardEl.draggable = !usePointerDrag;
      const glow = suitInventoryGlowClass(card, suitsAll);
      if (glow) cardEl.classList.add(glow);
      cardEl.textContent = compact
        ? formatCardName(card)
        : `${cardRankText(card.rank)}${formatCardHudSuitGlyph(card)} — ${itemRules.describeCardEffect(card)}`;
      cardEl.addEventListener("dragstart", (event) => {
        if (usePointerDrag) {
          event.preventDefault();
          return;
        }
        event.dataTransfer?.setData("text/plain", zoneId);
        if (cardPickupFlowActive && card?.rank != null) {
          const fromBp = parseBpZoneId(zoneId) != null;
          const fromDeck = parseDeckZoneId(zoneId) != null;
          if (fromBp || fromDeck) {
            dragIntentRank = card.rank;
            refreshRankTargetUiDuringDrag();
          }
        }
      });
      cardEl.addEventListener("dragend", () => {
        if (dragIntentRank != null) {
          dragIntentRank = null;
          renderCardModal();
        }
      });
      if (usePointerDrag) {
        cardEl.addEventListener("pointerdown", (event) => {
          if (event.button !== 0) return;
          if (touchDragSession) return;
          event.preventDefault();
          beginTouchDragFromZone(zoneId, card, event.pointerId);
        });
      } else {
        cardEl.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (tapSwapSourceZoneId === zoneId) {
            clearTapSwapSelection();
            return;
          }
          markTapSwapSelection(zoneId);
        });
      }
      zoneEl.appendChild(cardEl);
    } else {
      const emptyEl = document.createElement("div");
      emptyEl.className = "zone-empty";
      emptyEl.textContent = "Empty";
      zoneEl.appendChild(emptyEl);
    }
  }

  function appendModalDeckDisplayCell(parent, rank, card, extraClass = "") {
    const cell = document.createElement("div");
    cell.className = ["modal-deck-cell", extraClass].filter(Boolean).join(" ");
    for (const c of CARD_SET_GLOW_CLASSES) cell.classList.remove(c);
    const rankLabelText = card ? cardRankText(card.rank) : cardRankText(rank);
    cell.innerHTML = `<div class="modal-deck-cell-label">${rankLabelText}</div>`;
    const suitsAll = countSuitsAcrossAllStowed(inventory, pendingCard);
    if (card) {
      const glow = suitInventoryGlowClass(card, suitsAll);
      if (glow) cell.classList.add(glow);
      const t = document.createElement("div");
      t.className = "modal-deck-cell-card";
      t.textContent = formatCardHudSuitGlyph(card);
      cell.appendChild(t);
    } else {
      const e = document.createElement("div");
      e.className = "modal-deck-cell-empty";
      e.textContent = "—";
      cell.appendChild(e);
    }
    parent.appendChild(cell);
  }

  function appendModalBackpackDisplayCell(parent, packIndex, card) {
    const cell = document.createElement("div");
    cell.className = "modal-deck-cell modal-deck-cell--bp";
    for (const c of CARD_SET_GLOW_CLASSES) cell.classList.remove(c);
    const bpLabel = card ? cardRankText(card.rank) : `Pack ${packIndex + 1}`;
    cell.innerHTML = `<div class="modal-deck-cell-label">${bpLabel}</div>`;
    const suitsAll = countSuitsAcrossAllStowed(inventory, pendingCard);
    if (card) {
      const glow = suitInventoryGlowClass(card, suitsAll);
      if (glow) cell.classList.add(glow);
      const t = document.createElement("div");
      t.className = "modal-deck-cell-card";
      t.textContent = formatCardHudSuitGlyph(card);
      cell.appendChild(t);
    } else {
      const e = document.createElement("div");
      e.className = "modal-deck-cell-empty";
      e.textContent = "—";
      cell.appendChild(e);
    }
    parent.appendChild(cell);
  }

  /** Updates centre face + rank deck drop zone only (swap row backpack/pickup nodes stay intact — safe mid-drag). */
  function refreshRankTargetUiDuringDrag() {
    const itemRules = getItemRules();
    if (!cardPickupFlowActive || !cardModalFace || !cardSwapRow) return;
    const r = effectivePickupRank();
    if (r == null) return;
    renderPickupFlowFaceHtml(itemRules, r);

    const pickupEl = cardSwapRow.querySelector('[data-zone-id="pickup"]');
    if (!pickupEl) return;
    const newDeckId = `deck-${r}`;
    const oldDeck = cardSwapRow.querySelector('[data-zone-id^="deck-"]');
    if (oldDeck?.dataset.zoneId === newDeckId) return;
    oldDeck?.remove();
    const zoneEl = document.createElement("div");
    zoneEl.className = "drop-zone drop-zone--swap drop-zone--main-slot";
    zoneEl.innerHTML = `<div class="zone-label">Card slot: ${cardRankText(r)}</div>`;
    wireDropZone(zoneEl, newDeckId);
    appendCardToZone(zoneEl, newDeckId, inventory.deckByRank[r] || null, false, itemRules);
    pickupEl.insertAdjacentElement("afterend", zoneEl);
  }

  function renderPickupFlowFaceHtml(itemRules, r) {
    const showCard = pendingCard || inventory.deckByRank[r] || null;
    const showFirstCardHint = rankDeckIsCompletelyEmpty(inventory);
    if (showCard) {
      cardModalFace.classList.remove("compact");
      if (showFirstCardHint) {
        cardModalFace.innerHTML = `<div class="card-face-layout"><div class="card-face-primary"><div class="big">${cardFaceNameHtml(showCard)}</div><div class="desc">${itemRules.describeCardEffect(showCard)}</div></div>${cardModalInventoryDragHintHtml()}</div>`;
      } else {
        cardModalFace.innerHTML = `<div class="big">${cardFaceNameHtml(showCard)}</div><div class="desc">${itemRules.describeCardEffect(showCard)}</div>`;
      }
    } else if (showFirstCardHint) {
      cardModalFace.classList.remove("compact");
      cardModalFace.innerHTML = `<div class="card-face-layout"><div class="card-face-primary"><div class="desc">Rank <strong>${cardRankText(r)}</strong> — empty. Use <strong>New pickup</strong> or a backpack slot below, or <strong>Leave</strong>.</div></div>${cardModalInventoryDragHintHtml()}</div>`;
    } else {
      cardModalFace.classList.add("compact");
      cardModalFace.innerHTML = `<div class="desc">Rank <strong>${cardRankText(r)}</strong> — empty. Use <strong>New pickup</strong> or a backpack slot below, or <strong>Leave</strong>.</div>`;
    }
  }

  function renderCardModal() {
    endTouchDragSession();
    const itemRules = getItemRules();
    if (!cardModal || !cardModalFace || !cardSwapRow) return;
    dragIntentRank = null;
    tapSwapSourceZoneId = null;
    if (modalDeckStripEl) modalDeckStripEl.innerHTML = "";
    if (!inventoryModalOpen) {
      cardModal.classList.remove("open");
      if (modalSetBonusStatusEl) modalSetBonusStatusEl.textContent = "";
      cardSwapRow.innerHTML = "";
      cardModalFace.innerHTML = "";
      syncDeckSlots();
      return;
    }
    cardModal.classList.add("open");
    if (modalDeckStripEl) {
      const labelRow = document.createElement("div");
      labelRow.className = "player-deck-label-row";
      labelRow.innerHTML =
        '<span class="deck-slots-label">Deck (one card per rank)</span><span class="deck-slots-label deck-slots-label--sub">Backpack (3)</span>';
      modalDeckStripEl.appendChild(labelRow);
      const wings = document.createElement("div");
      wings.className = "modal-deck-wings-grid";
      wings.setAttribute("aria-label", "Read-only deck and backpack preview");
      const aceWing = document.createElement("div");
      aceWing.className = "modal-deck-ace-wing";
      appendModalDeckDisplayCell(aceWing, 1, inventory.deckByRank[1] || null, "modal-deck-cell--ace");
      const mid = document.createElement("div");
      mid.className = "modal-deck-middle-twelve";
      for (let r = 2; r <= 13; r++) appendModalDeckDisplayCell(mid, r, inventory.deckByRank[r] || null);
      const bpWing = document.createElement("div");
      bpWing.className = "modal-deck-backpack-wing";
      for (let i = 0; i < 3; i++) appendModalBackpackDisplayCell(bpWing, i, inventory.backpackSlots[i] || null);
      wings.appendChild(aceWing);
      wings.appendChild(mid);
      wings.appendChild(bpWing);
      modalDeckStripEl.appendChild(wings);
    }

    if (cardPickupFlowActive) {
      const r = effectivePickupRank();
      if (r != null) {
        renderPickupFlowFaceHtml(itemRules, r);
      } else {
        const showFirstHintNoRank = cardPickupFlowActive && rankDeckIsCompletelyEmpty(inventory);
        if (showFirstHintNoRank) {
          cardModalFace.classList.remove("compact");
          cardModalFace.innerHTML = `<div class="card-face-layout"><div class="card-face-primary"><div class="desc">Drag a card into <strong>New pickup</strong> from a backpack slot or the rank row above, or <strong>Leave</strong>.</div></div>${cardModalInventoryDragHintHtml()}</div>`;
        } else {
          cardModalFace.classList.add("compact");
          cardModalFace.innerHTML =
            '<div class="desc">Drag a card into <strong>New pickup</strong> from a backpack slot or the rank row above, or <strong>Leave</strong>.</div>';
        }
      }
    } else if (pendingCard) {
      const card = pendingCard;
      cardModalFace.classList.remove("compact");
      cardModalFace.innerHTML = `<div class="big">${cardFaceNameHtml(card)}</div><div class="desc">${itemRules.describeCardEffect(card)}</div>`;
    } else {
      cardModalFace.classList.add("compact");
      cardModalFace.innerHTML =
        '<div class="desc">Drag between rank slots and the three backpack packs. Leave closes without taking a new pickup.</div>';
    }

    cardSwapRow.innerHTML = "";
    const zones = [];
    if (cardPickupFlowActive) {
      zones.push({ id: "pickup", label: "New pickup", card: pendingCard, kind: "pickup" });
      const deckR = effectivePickupRank();
      if (deckR != null) {
        zones.push({
          id: `deck-${deckR}`,
          label: `Card slot: ${cardRankText(deckR)}`,
          card: inventory.deckByRank[deckR] || null,
          kind: "rank",
        });
      }
    } else if (pendingCard) {
      zones.push({ id: "pickup", label: "New pickup", card: pendingCard, kind: "pickup" });
    }
    for (let i = 0; i < 3; i++) {
      zones.push({ id: `bp-${i}`, label: `Backpack ${i + 1}`, card: inventory.backpackSlots[i] || null, kind: "bp" });
    }
    for (const zone of zones) {
      const zoneEl = document.createElement("div");
      let zc = "drop-zone drop-zone--swap";
      if (zone.kind === "pickup" || zone.kind === "rank") zc += " drop-zone--main-slot";
      if (zone.kind === "bp") zc += " drop-zone--backpack-sm";
      zoneEl.className = zc;
      zoneEl.innerHTML = `<div class="zone-label">${zone.label}</div>`;
      wireDropZone(zoneEl, zone.id);
      appendCardToZone(zoneEl, zone.id, zone.card, false, itemRules);
      cardSwapRow.appendChild(zoneEl);
    }

    {
      const leaveBtn = document.createElement("button");
      leaveBtn.type = "button";
      leaveBtn.className = "leave-button";
      leaveBtn.textContent = "Leave";
      leaveBtn.addEventListener("click", () => continueAfterLoadout());
      cardSwapRow.appendChild(leaveBtn);
    }

    if (modalSetBonusStatusEl) {
      const progress = getModalSetBonusProgressLines(inventory, pendingCard, itemRules);
      modalSetBonusStatusEl.textContent = progress.length ? progress.join("\n") : "";
    }
    syncDeckSlots();
  }

  function closeCardModal() {
    const wasOpen = inventoryModalOpen;
    inventoryModalOpen = false;
    pendingCard = null;
    cardPickupFlowActive = false;
    pickupTargetRank = null;
    dragIntentRank = null;
    tapSwapSourceZoneId = null;
    if (wasOpen) onPausedChange(false);
    renderCardModal();
  }

  function continueAfterLoadout() {
    pendingCard = null;
    clearTapSwapSelection();
    closeCardModal();
  }

  function openCardPickup(card) {
    pendingCard = card;
    cardPickupFlowActive = true;
    pickupTargetRank = card.rank;
    inventoryModalOpen = true;
    onPausedChange(true);
    renderCardModal();
  }

  function resetAll() {
    for (let r = 1; r <= 13; r++) inventory.deckByRank[r] = null;
    for (let i = 0; i < 3; i++) inventory.backpackSlots[i] = null;
    continueAfterLoadout();
  }

  const onCloseClick = () => {
    if (setBonusChoicePendingSuit === "diamonds" && !inventory.diamondEmpower) return;
    continueAfterLoadout();
  };
  if (cardCloseButton) cardCloseButton.addEventListener("click", onCloseClick);

  function onGlobalKeydown(e) {
    const needsDiamondChoice = setBonusChoicePendingSuit === "diamonds" && !inventory.diamondEmpower;
    if (needsDiamondChoice && inventoryModalOpen) {
      const k = String(e.key || "").toLowerCase();
      if (k === "q" || k === "w" || k === "e") {
        e.preventDefault();
        if (k === "q") applyDiamondEmpowerChoice("dash2x");
        else if (k === "w") applyDiamondEmpowerChoice("speedPassive");
        else applyDiamondEmpowerChoice("decoyFortify");
        return;
      }
    }
    if (e.key !== "Escape") return;
    if (!inventoryModalOpen) return;
    if (needsDiamondChoice) return;
    e.preventDefault();
    continueAfterLoadout();
  }
  window.addEventListener("keydown", onGlobalKeydown);

  /** @param {"dash2x" | "speedPassive" | "decoyFortify"} id */
  function applyDiamondEmpowerChoice(id) {
    if (setBonusChoicePendingSuit !== "diamonds") return;
    if (inventory.diamondEmpower) return;
    inventory.diamondEmpower = id;
    setBonusChoicePendingSuit = null;
    renderCardModal();
    onDiamondEmpowerPicked();
  }

  return {
    openCardPickup,
    isPaused: () => inventoryModalOpen,
    resetAll,
    renderCardModal,
    /** @returns {object | null} */
    getPendingCard: () => pendingCard,
    openSetBonusChoice(suit) {
      if (suit !== "diamonds") return;
      if (inventory.diamondEmpower) return;
      if (setBonusChoicePendingSuit === "diamonds" && inventoryModalOpen) return;
      setBonusChoicePendingSuit = "diamonds";
      inventoryModalOpen = true;
      cardPickupFlowActive = false;
      pendingCard = null;
      pickupTargetRank = null;
      dragIntentRank = null;
      onPausedChange(true);
      renderCardModal();
    },
    clearSetBonusChoice(suit = null) {
      if (suit != null && setBonusChoicePendingSuit !== suit) return;
      if (setBonusChoicePendingSuit == null) return;
      const wasDiamonds = setBonusChoicePendingSuit === "diamonds";
      setBonusChoicePendingSuit = null;
      renderCardModal();
      if (wasDiamonds) onDiamondEmpowerPicked();
    },
    applyDiamondEmpowerChoice,
    isDiamondSetBonusChoicePending: () => setBonusChoicePendingSuit === "diamonds" && !inventory.diamondEmpower,
    dispose() {
      endTouchDragSession();
      if (cardCloseButton) cardCloseButton.removeEventListener("click", onCloseClick);
      window.removeEventListener("keydown", onGlobalKeydown);
    },
  };
}
