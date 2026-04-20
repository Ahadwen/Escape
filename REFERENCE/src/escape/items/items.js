const MODAL_SET_SUIT_ORDER = ["hearts", "diamonds", "clubs", "spades"];
const CARD_SET_GLOW_CLASSES = [
  "card-set-glow-red",
  "card-set-glow-yellow",
  "card-set-glow-green",
  "card-set-glow-blue",
  "card-set-glow-white",
];

export function createItemsManager({
  state,
  inventory,
  selectedCharacterId,
  isValiant,
  setBonusThreshold,
  setBonusMax,
  forEachDeckCard,
  formatCardName,
  describeCardEffect,
  cardRankText,
  runLog,
  logCodes,
  renderCardSlots,
  recalcCardPassives,
  updateSetBonusStatus,
  cardModal,
  cardModalFace,
  cardSwapRow,
  modalDeckStripEl,
  modalSetBonusStatusEl,
}) {
  function countSuitsAcrossAllStowed() {
    const suits = { diamonds: 0, hearts: 0, clubs: 0, spades: 0 };
    const add = (card) => {
      if (!card?.suit) return;
      if (card.suit === "joker") {
        suits.diamonds += 1;
        suits.hearts += 1;
        suits.clubs += 1;
        suits.spades += 1;
      } else if (suits[card.suit] != null) suits[card.suit] += 1;
    };
    add(state.pendingCard);
    forEachDeckCard((c) => add(c));
    for (const c of inventory.backpackSlots) add(c);
    return suits;
  }

  function suitInventoryGlowClass(card) {
    if (!card?.suit) return "";
    if (card.suit === "joker") return "card-set-glow-white";
    const suits = countSuitsAcrossAllStowed();
    const n = suits[card.suit];
    if (n < 2) return "";
    const suitsWithPair = MODAL_SET_SUIT_ORDER.filter((s) => suits[s] >= 2);
    const idx = suitsWithPair.indexOf(card.suit);
    if (idx < 0) return "";
    if (suitsWithPair.length === 1 && n >= 4) return "card-set-glow-yellow";
    const glowByPairOrder = ["card-set-glow-red", "card-set-glow-yellow", "card-set-glow-green", "card-set-glow-blue"];
    return glowByPairOrder[Math.min(idx, glowByPairOrder.length - 1)];
  }

  function countSuitsInActiveSlots() {
    const suits = { diamonds: 0, hearts: 0, clubs: 0, spades: 0 };
    forEachDeckCard((card) => {
      if (!card?.suit) return;
      if (card.suit === "joker") {
        suits.diamonds += 1;
        suits.hearts += 1;
        suits.clubs += 1;
        suits.spades += 1;
      } else if (suits[card.suit] != null) suits[card.suit] += 1;
    });
    return suits;
  }

  function suitDisplayNameForModal(suit) {
    return { diamonds: "Diamonds", hearts: "Hearts", clubs: "Clubs", spades: "Spades" }[suit] ?? suit;
  }

  function suitSetBonusGoalLabel(suit) {
    if (suit === "hearts") return isValiant() ? "regen heals rabbits at random" : "continuous health regen";
    if (suit === "diamonds") {
      if (selectedCharacterId() === "rogue") return "larger dash & smoke radius";
      if (isValiant()) return "Surge / shock field / Rescue empowerment";
      return "ability empowerment";
    }
    if (suit === "clubs") {
      if (selectedCharacterId() === "rogue") return "phase through terrain in smoke";
      if (isValiant()) return "phase through terrain during Surge (Q)";
      return "burst phases through terrain";
    }
    if (selectedCharacterId() === "rogue") return "stealth refresh on stealth-dash landing";
    if (isValiant()) return "+1 shock-field charge; ultimate world slow";
    return "after ultimate: world (except you) at 30% speed for 2s";
  }

  function suitSetBonusSevenActiveShort(suit) {
    if (suit === "diamonds") return "diamond empowerment active";
    if (suit === "hearts") return isValiant() ? "regen heals rabbits" : "passive HP regeneration";
    if (suit === "clubs") return selectedCharacterId() === "rogue" ? "phase in smoke" : "phase-through active";
    return selectedCharacterId() === "rogue" ? "stealth refresh on dash" : "ultimate world slow";
  }

  function suitSetBonusTierTwoGoalLabel(suit) {
    if (suit === "hearts") return "death defiance on 30s cooldown (lethal -> 5 HP)";
    if (suit === "diamonds") return isValiant() ? "all Valiant empowerments active together" : "all empowerments active";
    if (suit === "clubs") return "30% smaller hitbox; 1s untargetable after hit";
    if (suit === "spades") return "~2in aura: hostiles slowed ~30%";
    return "";
  }

  function suitSetBonusTierTwoActiveShort(suit) {
    if (suit === "hearts") return "death defiance active";
    if (suit === "diamonds") return "max diamond empowerment active";
    if (suit === "clubs") return "smaller hitbox + untargetable";
    if (suit === "spades") return "nearby hostiles slowed in aura";
    return "";
  }

  function getModalSetBonusProgressLines() {
    const suits = countSuitsInActiveSlots();
    const lines = [];
    for (const suit of MODAL_SET_SUIT_ORDER) {
      const n = suits[suit];
      if (n < 1) continue;
      const name = suitDisplayNameForModal(suit);
      if (n < setBonusThreshold) {
        lines.push(`${name} ${n}/${setBonusThreshold} (${suitSetBonusGoalLabel(suit)})`);
        continue;
      }
      lines.push(`${name} ${setBonusThreshold}/${setBonusThreshold} (${suitSetBonusSevenActiveShort(suit)})`);
      if (n < setBonusMax) lines.push(`${name} ${n}/${setBonusMax} (${suitSetBonusTierTwoGoalLabel(suit)})`);
      else lines.push(`${name} ${setBonusMax}/${setBonusMax} (${suitSetBonusTierTwoActiveShort(suit)})`);
    }
    return lines;
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
    });
  }

  function appendCardToZone(zoneEl, zoneId, card, compact) {
    if (card) {
      const cardEl = document.createElement("div");
      cardEl.className = "zone-card";
      cardEl.draggable = true;
      const glow = suitInventoryGlowClass(card);
      if (glow) cardEl.classList.add(glow);
      cardEl.textContent = compact ? formatCardName(card) : `${formatCardName(card)} — ${describeCardEffect(card)}`;
      cardEl.addEventListener("dragstart", (event) => {
        event.dataTransfer?.setData("text/plain", zoneId);
      });
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
    cell.innerHTML = `<div class="modal-deck-cell-label">${cardRankText(rank)}</div>`;
    if (card) {
      const glow = suitInventoryGlowClass(card);
      if (glow) cell.classList.add(glow);
      const t = document.createElement("div");
      t.className = "modal-deck-cell-card";
      t.textContent = formatCardName(card);
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
    cell.innerHTML = `<div class="modal-deck-cell-label">Pack ${packIndex + 1}</div>`;
    if (card) {
      const glow = suitInventoryGlowClass(card);
      if (glow) cell.classList.add(glow);
      const t = document.createElement("div");
      t.className = "modal-deck-cell-card";
      t.textContent = formatCardName(card);
      cell.appendChild(t);
    } else {
      const e = document.createElement("div");
      e.className = "modal-deck-cell-empty";
      e.textContent = "—";
      cell.appendChild(e);
    }
    parent.appendChild(cell);
  }

  function rankDeckIsCompletelyEmpty() {
    for (let rank = 1; rank <= 13; rank++) if (inventory.deckByRank[rank]) return false;
    return true;
  }

  function cardModalInventoryDragHintHtml() {
    return `<aside class="card-face-hint" aria-label="How to use inventory"><strong>Using inventory</strong><p><strong>Click and hold</strong> a card, then <b>drag</b> it to a slot and <b>release</b> to drop, either in the relevant card slot, or the <b>backpack</b>.</p></aside>`;
  }

  function getCardByZone(zoneId) {
    if (zoneId === "pickup") return state.pendingCard;
    const dr = parseDeckZoneId(zoneId);
    if (dr != null) return inventory.deckByRank[dr] || null;
    const bi = parseBpZoneId(zoneId);
    if (bi != null) return inventory.backpackSlots[bi] || null;
    return null;
  }

  function setCardByZone(zoneId, card) {
    if (zoneId === "pickup") state.pendingCard = card;
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
    if (!state.cardPickupFlowActive) return;
    if (state.pendingCard) {
      state.pickupTargetRank = state.pendingCard.rank;
      return;
    }
    if (fromZoneId === "pickup") {
      const dTo = parseDeckZoneId(toZoneId);
      if (dTo != null) {
        state.pickupTargetRank = dTo;
        return;
      }
      const bTo = parseBpZoneId(toZoneId);
      if (bTo != null && !toCardBefore && fromCardBefore) {
        state.pickupTargetRank = fromCardBefore.rank;
        return;
      }
    }
    state.pickupTargetRank = null;
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
      !state.pendingCard &&
      state.cardPickupFlowActive &&
      fromCard &&
      (bFrom != null ||
        (dFrom != null &&
          fromCard.rank === dFrom &&
          (state.pickupTargetRank == null || dFrom === state.pickupTargetRank)));
    if (toPickup && !state.pendingCard && !allowStageToEmptyPickup) return;
    if (toPickup && !fromCard) return;

    if (dFrom != null && fromCard && fromCard.rank !== dFrom) return;
    if (dTo != null && fromCard && fromCard.rank !== dTo) return;
    if (dTo != null && toCard && toCard.rank !== dTo) return;
    if (dFrom != null && toPickup && toCard && toCard.rank !== dFrom) return;
    if (dFrom != null && bTo != null && toCard && toCard.rank !== dFrom) return;

    setCardByZone(fromZoneId, toCard || null);
    setCardByZone(toZoneId, fromCard || null);
    syncPickupTargetRankAfterSwap(fromZoneId, toZoneId, fromCard, toCard);
    recalcCardPassives();
    renderCardModal();
  }

  function renderCardModal() {
    if (!cardModal || !cardModalFace || !cardSwapRow) return;
    if (modalDeckStripEl) modalDeckStripEl.innerHTML = "";
    if (!state.inventoryModalOpen) {
      cardModal.classList.remove("open");
      if (modalSetBonusStatusEl) modalSetBonusStatusEl.textContent = "";
      cardSwapRow.innerHTML = "";
      cardModalFace.innerHTML = "";
      renderCardSlots();
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

    if (state.cardPickupFlowActive) {
      const r = state.pendingCard?.rank ?? state.pickupTargetRank;
      if (r != null) {
        const showCard = state.pendingCard || inventory.deckByRank[r] || null;
        const showFirstCardHint = rankDeckIsCompletelyEmpty();
        if (showCard) {
          cardModalFace.classList.remove("compact");
          if (showFirstCardHint) {
            cardModalFace.innerHTML = `<div class="card-face-layout"><div class="card-face-primary"><div class="big">${formatCardName(showCard)}</div><div class="desc">${describeCardEffect(showCard)}</div></div>${cardModalInventoryDragHintHtml()}</div>`;
          } else {
            cardModalFace.innerHTML = `<div class="big">${formatCardName(showCard)}</div><div class="desc">${describeCardEffect(showCard)}</div>`;
          }
        } else {
          if (showFirstCardHint) {
            cardModalFace.classList.remove("compact");
            cardModalFace.innerHTML = `<div class="card-face-layout"><div class="card-face-primary"><div class="desc">Rank <strong>${cardRankText(r)}</strong> — empty. Use <strong>New pickup</strong> or a backpack slot below, or <strong>Leave</strong>.</div></div>${cardModalInventoryDragHintHtml()}</div>`;
          } else {
            cardModalFace.classList.add("compact");
            cardModalFace.innerHTML = `<div class="desc">Rank <strong>${cardRankText(r)}</strong> — empty. Use <strong>New pickup</strong> or a backpack slot below, or <strong>Leave</strong>.</div>`;
          }
        }
      } else {
        const showFirstHintNoRank = state.cardPickupFlowActive && rankDeckIsCompletelyEmpty();
        if (showFirstHintNoRank) {
          cardModalFace.classList.remove("compact");
          cardModalFace.innerHTML = `<div class="card-face-layout"><div class="card-face-primary"><div class="desc">Drag a card into <strong>New pickup</strong> from a backpack slot or the rank row above, or <strong>Leave</strong>.</div></div>${cardModalInventoryDragHintHtml()}</div>`;
        } else {
          cardModalFace.classList.add("compact");
          cardModalFace.innerHTML =
            '<div class="desc">Drag a card into <strong>New pickup</strong> from a backpack slot or the rank row above, or <strong>Leave</strong>.</div>';
        }
      }
    } else if (state.pendingCard) {
      const card = state.pendingCard;
      cardModalFace.classList.remove("compact");
      cardModalFace.innerHTML = `<div class="big">${formatCardName(card)}</div><div class="desc">${describeCardEffect(card)}</div>`;
    } else {
      cardModalFace.classList.add("compact");
      cardModalFace.innerHTML =
        '<div class="desc">Drag between rank slots and the three backpack packs. Leave closes without taking a new pickup.</div>';
    }
    cardSwapRow.innerHTML = "";
    const zones = [];
    if (state.cardPickupFlowActive) {
      zones.push({ id: "pickup", label: "New pickup", card: state.pendingCard, kind: "pickup" });
      const deckR = state.pendingCard?.rank ?? state.pickupTargetRank;
      if (deckR != null) {
        zones.push({
          id: `deck-${deckR}`,
          label: `Card slot: ${cardRankText(deckR)}`,
          card: inventory.deckByRank[deckR] || null,
          kind: "rank",
        });
      }
    } else if (state.pendingCard) {
      zones.push({ id: "pickup", label: "New pickup", card: state.pendingCard, kind: "pickup" });
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
      appendCardToZone(zoneEl, zone.id, zone.card, false);
      cardSwapRow.appendChild(zoneEl);
    }
    if (state.setBonusChoicePendingSuit === "diamonds" && !inventory.diamondEmpower) {
      const mk = (id, text) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "leave-button";
        btn.textContent = `Set bonus! ${text}`;
        btn.addEventListener("click", () => {
          inventory.diamondEmpower = id;
          state.setBonusChoicePendingSuit = null;
          updateSetBonusStatus();
          renderCardModal();
        });
        return btn;
      };
      if (isValiant()) {
        cardSwapRow.appendChild(mk("valiantSpeed", "Surge: +30% speed boost, +1.5s duration (passive)"));
        cardSwapRow.appendChild(mk("valiantBox", "Shock field tiles are larger"));
        cardSwapRow.appendChild(mk("valiantRescue", "Rescue restores more Will"));
      } else {
        cardSwapRow.appendChild(mk("dash2x", "Dash goes twice as far"));
        cardSwapRow.appendChild(mk("speedPassive", selectedCharacterId() === "knight" ? "Burst: +30% speed boost, +1.5s duration (passive)" : "Speed burst is passive"));
        cardSwapRow.appendChild(mk("decoyLead", "Decoy drifts away, -2s cooldown, +1s duration"));
      }
    }
    const leaveBtn = document.createElement("button");
    leaveBtn.type = "button";
    leaveBtn.className = "leave-button";
    leaveBtn.textContent = "Leave";
    leaveBtn.addEventListener("click", () => continueAfterLoadout());
    cardSwapRow.appendChild(leaveBtn);
    if (modalSetBonusStatusEl) {
      const progress = getModalSetBonusProgressLines();
      modalSetBonusStatusEl.textContent = progress.length ? progress.join("\n") : "";
    }
    renderCardSlots();
  }

  function closeCardModal() {
    runLog.event(logCodes.EVT_CARD_MODAL_CLOSE, "Card / inventory modal closed");
    state.inventoryModalOpen = false;
    state.pendingCard = null;
    state.cardPickupFlowActive = false;
    state.pickupTargetRank = null;
    state.pausedForCard = true;
    state.waitingForMovementResume = true;
    state.playerHeadstartUntil = state.elapsed + 0.3;
    renderCardModal();
  }

  function continueAfterLoadout() {
    runLog.event(logCodes.EVT_CARD_LOADOUT_CONTINUE, "Player continued after card / loadout modal");
    state.pendingCard = null;
    closeCardModal();
  }

  return {
    countSuitsAcrossAllStowed,
    suitInventoryGlowClass,
    countSuitsInActiveSlots,
    suitDisplayNameForModal,
    suitSetBonusGoalLabel,
    suitSetBonusSevenActiveShort,
    suitSetBonusTierTwoGoalLabel,
    suitSetBonusTierTwoActiveShort,
    getModalSetBonusProgressLines,
    parseDeckZoneId,
    parseBpZoneId,
    wireDropZone,
    appendCardToZone,
    appendModalDeckDisplayCell,
    appendModalBackpackDisplayCell,
    rankDeckIsCompletelyEmpty,
    cardModalInventoryDragHintHtml,
    getCardByZone,
    setCardByZone,
    syncPickupTargetRankAfterSwap,
    swapCardsBetweenZones,
    renderCardModal,
    closeCardModal,
    continueAfterLoadout,
  };
}
