import { collectReservedDeckKeys } from "../items/inventoryState.js";
import { deckKey, formatCardName, cardRankText } from "../items/cardUtils.js";
import {
  ROULETTE_SPIN_SHUFFLE_SEC,
  ROULETTE_SPIN_WHITEOUT_SEC,
} from "../balance.js";

function pinPlayerDeckPanel(doc) {
  const el = doc.getElementById("player-deck-panel");
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.dataset.rouletteDeckPinned = "1";
  el.style.boxSizing = "border-box";
  el.style.position = "fixed";
  el.style.top = `${Math.max(0, r.top)}px`;
  el.style.left = `${Math.max(0, r.left)}px`;
  el.style.width = `${r.width}px`;
  el.style.zIndex = "55";
}

function unpinPlayerDeckPanel(doc) {
  const el = doc.getElementById("player-deck-panel");
  if (!el || el.dataset.rouletteDeckPinned !== "1") return;
  delete el.dataset.rouletteDeckPinned;
  el.style.position = "";
  el.style.top = "";
  el.style.left = "";
  el.style.width = "";
  el.style.zIndex = "";
  el.style.boxSizing = "";
}

function getReservedDeckKeysExcludingCard(inv, pending, world, exCard) {
  const reserved = collectReservedDeckKeys(inv, pending, world);
  if (exCard && exCard.suit && exCard.suit !== "joker" && Number.isInteger(exCard.rank)) {
    reserved.delete(deckKey(exCard.suit, exCard.rank));
  }
  return reserved;
}

function makeRouletteCandidateCard(suit, rank, itemRules) {
  return {
    id: `roulette-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    suit,
    rank,
    effect: itemRules.makeCardEffect(suit, rank),
  };
}

function buildRoulettePairFromSource(sourceCard, inv, pending, world, itemRules) {
  if (!sourceCard || sourceCard.suit === "joker" || !Number.isInteger(sourceCard.rank)) return null;
  const rank = sourceCard.rank;
  const reserved = getReservedDeckKeysExcludingCard(inv, pending, world, sourceCard);
  const suits = ["diamonds", "hearts", "clubs", "spades"].filter((s) => s !== sourceCard.suit);
  const avail = suits.filter((s) => !reserved.has(deckKey(s, rank)));
  for (let i = avail.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [avail[i], avail[j]] = [avail[j], avail[i]];
  }
  if (avail.length < 2) return null;
  return {
    a: makeRouletteCandidateCard(avail[0], rank, itemRules),
    b: makeRouletteCandidateCard(avail[1], rank, itemRules),
  };
}

/**
 * REFERENCE `openRouletteForgeModal` / `updateRouletteUi` / spin DOM.
 */
export function createRouletteModal(deps) {
  const {
    doc,
    inventory,
    getItemRules,
    getPendingCard,
    getWorldCardPickups,
    syncDeckSlots,
    onPausedChange = () => {},
  } = deps;

  const rouletteModal = doc.getElementById("roulette-modal");
  const rouletteModalTitle = doc.getElementById("roulette-modal-title");
  const rouletteModalSub = doc.getElementById("roulette-modal-sub");
  const rouletteModalSpinRow = doc.getElementById("roulette-modal-spin-row");
  const rouletteModalActions = doc.getElementById("roulette-modal-actions");

  let mode = false;
  /** @type {'pickSource' | 'spin' | 'pick' | null} */
  let step = null;
  /** @type {{ kind: 'deck', rank: number } | { kind: 'bp', idx: number } | null} */
  let sourceRef = null;
  /** @type {object | null} */
  let optionA = null;
  /** @type {object | null} */
  let optionB = null;
  let shuffleUntilSec = 0;
  let revealAtSec = 0;

  /** @type {null | (() => void)} */
  let onSuccessComplete = null;

  function isPaused() {
    return mode;
  }

  function closeUi() {
    if (!rouletteModal) return;
    const had = mode;
    rouletteModal.hidden = true;
    unpinPlayerDeckPanel(doc);
    mode = false;
    step = null;
    sourceRef = null;
    optionA = null;
    optionB = null;
    shuffleUntilSec = 0;
    revealAtSec = 0;
    if (rouletteModalSpinRow) rouletteModalSpinRow.innerHTML = "";
    if (rouletteModalActions) rouletteModalActions.innerHTML = "";
    if (had) onPausedChange(false);
  }

  function onGlobalKeydown(e) {
    if (e.key !== "Escape" || !mode) return;
    e.preventDefault();
    closeUi();
  }

  doc.defaultView?.addEventListener("keydown", onGlobalKeydown);

  function setRouletteSpinCardFace(cardEl, card) {
    if (!cardEl || !card) return;
    let name = cardEl.querySelector(".roulette-spin-name");
    let meta = cardEl.querySelector(".roulette-spin-meta");
    if (!name) {
      name = doc.createElement("span");
      name.className = "roulette-spin-name";
      cardEl.appendChild(name);
    }
    if (!meta) {
      meta = doc.createElement("span");
      meta.className = "roulette-spin-meta";
      cardEl.appendChild(meta);
    }
    const rules = getItemRules();
    name.textContent = formatCardName(card);
    meta.textContent = rules.describeCardEffect(card);
  }

  function createRouletteSpinDom() {
    if (!rouletteModalSpinRow || !optionA || !optionB) return;
    rouletteModalSpinRow.innerHTML = `
    <div class="roulette-spin-pair roulette-spin-pair--shuffling" id="roulette-spin-pair-root">
      <div class="roulette-spin-card roulette-spin-card--shuffling" id="roulette-spin-left"></div>
      <div class="roulette-spin-card roulette-spin-card--shuffling" id="roulette-spin-right"></div>
    </div>`;
    const left = doc.getElementById("roulette-spin-left");
    const right = doc.getElementById("roulette-spin-right");
    if (left) setRouletteSpinCardFace(left, optionA);
    if (right) setRouletteSpinCardFace(right, optionB);
  }

  function syncRouletteSpinShuffleVisual(nowSec) {
    if (!rouletteModalSpinRow || !optionA || !optionB) return;
    const pair = doc.getElementById("roulette-spin-pair-root");
    const left = doc.getElementById("roulette-spin-left");
    const right = doc.getElementById("roulette-spin-right");
    if (!pair || !left || !right) return;

    const t = nowSec;
    const a = optionA;
    const b = optionB;
    const swap = (Math.floor(t * 3.1 + Math.sin(t * 5.2) * 1.4) % 2) === 1;
    const leftCard = swap ? b : a;
    const rightCard = swap ? a : b;
    setRouletteSpinCardFace(left, leftCard);
    setRouletteSpinCardFace(right, rightCard);

    const micro = Math.sin(t * 12) + Math.sin(t * 7.1);
    const hi = Math.floor((t * 4.6 + micro * 0.9) % 2);
    const bothDim = Math.floor(t * 5.5) % 13 === 0;

    let leftCls = "roulette-spin-card roulette-spin-card--shuffling";
    let rightCls = "roulette-spin-card roulette-spin-card--shuffling";
    if (bothDim) {
      leftCls += " roulette-spin-card--dim";
      rightCls += " roulette-spin-card--dim";
    } else if (hi === 0) {
      leftCls += " roulette-spin-card--hot";
    } else {
      rightCls += " roulette-spin-card--hot";
    }
    left.className = leftCls;
    right.className = rightCls;

    pair.classList.add("roulette-spin-pair--shuffling");
    pair.classList.remove("roulette-spin-pair--whiteout");
  }

  function syncRouletteSpinWhiteoutVisual() {
    const pair = doc.getElementById("roulette-spin-pair-root");
    const left = doc.getElementById("roulette-spin-left");
    const right = doc.getElementById("roulette-spin-right");
    if (pair) {
      pair.classList.remove("roulette-spin-pair--shuffling");
      pair.classList.add("roulette-spin-pair--whiteout");
    }
    if (left) left.className = "roulette-spin-card roulette-spin-card--whiteout-panel";
    if (right) right.className = "roulette-spin-card roulette-spin-card--whiteout-panel";
  }

  function renderRouletteSpinSettled() {
    const pair = doc.getElementById("roulette-spin-pair-root");
    const left = doc.getElementById("roulette-spin-left");
    const right = doc.getElementById("roulette-spin-right");
    if (!pair || !left || !right || !optionA || !optionB) return;
    const a = optionA;
    const b = optionB;
    pair.classList.remove("roulette-spin-pair--shuffling", "roulette-spin-pair--whiteout");
    setRouletteSpinCardFace(left, a);
    setRouletteSpinCardFace(right, b);
    left.className = "roulette-spin-card roulette-spin-card--revealed roulette-spin-card--pickable";
    right.className = "roulette-spin-card roulette-spin-card--revealed roulette-spin-card--pickable";
  }

  function wireRouletteCardPickListeners() {
    const left = doc.getElementById("roulette-spin-left");
    const right = doc.getElementById("roulette-spin-right");
    if (!left || !right || !optionA || !optionB) return;
    left.tabIndex = 0;
    right.tabIndex = 0;
    left.onclick = () => finishSuccess(optionA);
    right.onclick = () => finishSuccess(optionB);
    const onKey = (ev, pickA) => {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      ev.preventDefault();
      finishSuccess(pickA ? optionA : optionB);
    };
    left.onkeydown = (ev) => onKey(ev, true);
    right.onkeydown = (ev) => onKey(ev, false);
  }

  function renderRoulettePickWinnerButtons() {
    if (!rouletteModalActions || !optionA || !optionB) return;
    rouletteModalActions.innerHTML = "";
    const cancel = doc.createElement("button");
    cancel.type = "button";
    cancel.className = "leave-button";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => closeUi());
    rouletteModalActions.appendChild(cancel);
  }

  function finishSuccess(chosen) {
    const ref = sourceRef;
    if (!ref || !chosen) {
      closeUi();
      return;
    }
    const placed = {
      ...chosen,
      id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    };
    if (ref.kind === "deck") inventory.deckByRank[ref.rank] = placed;
    else if (ref.kind === "bp") inventory.backpackSlots[ref.idx] = placed;
    syncDeckSlots();
    onSuccessComplete?.();
    closeUi();
  }

  function startSpinFromSource(sourceCard, ref) {
    const rules = getItemRules();
    const pair = buildRoulettePairFromSource(
      sourceCard,
      inventory,
      getPendingCard() ?? null,
      getWorldCardPickups(),
      rules,
    );
    if (!pair) {
      if (rouletteModalSub) {
        rouletteModalSub.textContent =
          "That card has no two free suits at this rank (other ranks may still work). Pick another or cancel.";
      }
      return;
    }
    sourceRef = ref;
    optionA = pair.a;
    optionB = pair.b;
    step = "spin";
    if (rouletteModalSpinRow) rouletteModalSpinRow.innerHTML = "";
    if (rouletteModalActions) rouletteModalActions.innerHTML = "";
    createRouletteSpinDom();
    const now = performance.now() / 1000;
    shuffleUntilSec = now + ROULETTE_SPIN_SHUFFLE_SEC;
    revealAtSec = shuffleUntilSec + ROULETTE_SPIN_WHITEOUT_SEC;
    if (rouletteModalSub) rouletteModalSub.textContent = "Shuffling";
  }

  function renderRouletteSourcePicker() {
    if (!rouletteModalSpinRow || !rouletteModalActions) return;
    rouletteModalSpinRow.innerHTML = "";
    rouletteModalActions.innerHTML = "";
    const rules = getItemRules();
    let pickCount = 0;
    for (let r = 1; r <= 13; r++) {
      const c = inventory.deckByRank[r];
      if (!c || c.suit === "joker") continue;
      if (!buildRoulettePairFromSource(c, inventory, getPendingCard() ?? null, getWorldCardPickups(), rules)) continue;
      const b = doc.createElement("button");
      b.type = "button";
      b.className = "leave-button";
      b.textContent = `Deck ${cardRankText(r)} — ${formatCardName(c)}`;
      b.addEventListener("click", () => startSpinFromSource(c, { kind: "deck", rank: r }));
      rouletteModalActions.appendChild(b);
      pickCount += 1;
    }
    for (let i = 0; i < 3; i++) {
      const c = inventory.backpackSlots[i];
      if (!c || c.suit === "joker") continue;
      if (!buildRoulettePairFromSource(c, inventory, getPendingCard() ?? null, getWorldCardPickups(), rules)) continue;
      const b = doc.createElement("button");
      b.type = "button";
      b.className = "leave-button";
      b.textContent = `Backpack ${i + 1} — ${formatCardName(c)}`;
      b.addEventListener("click", () => startSpinFromSource(c, { kind: "bp", idx: i }));
      rouletteModalActions.appendChild(b);
      pickCount += 1;
    }
    if (pickCount === 0) {
      if (rouletteModalSub) {
        rouletteModalSub.textContent =
          "No card can forge right now — you need a non-joker in deck or backpack whose rank still has two suits not already in your deck.";
      }
      const hint = doc.createElement("p");
      hint.className = "roulette-empty-hint";
      hint.textContent = "Leave the inner hex and return with a different loadout, or press Escape to close.";
      rouletteModalSpinRow.appendChild(hint);
    }
    const cancel = doc.createElement("button");
    cancel.type = "button";
    cancel.className = "leave-button";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => closeUi());
    rouletteModalActions.appendChild(cancel);
  }

  function open(onSuccess) {
    if (!rouletteModal) return;
    onSuccessComplete = onSuccess ?? null;
    mode = true;
    step = "pickSource";
    onPausedChange(true);
    rouletteModal.hidden = false;
    if (rouletteModalTitle) rouletteModalTitle.textContent = "Roulette forge";
    if (rouletteModalSub) {
      rouletteModalSub.textContent = "Pick a card to re-roll into two other suits at the same rank.";
    }
    renderRouletteSourcePicker();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => pinPlayerDeckPanel(doc));
    });
  }

  function tickWallClock() {
    if (!mode || step !== "spin" || !optionA || !optionB) return;
    const now = performance.now() / 1000;
    if (now >= revealAtSec) {
      step = "pick";
      renderRouletteSpinSettled();
      if (rouletteModalSub) {
        rouletteModalSub.textContent = "Click a card to keep (the other is lost).";
      }
      renderRoulettePickWinnerButtons();
      wireRouletteCardPickListeners();
      return;
    }
    if (now >= shuffleUntilSec) {
      if (rouletteModalSub) rouletteModalSub.textContent = "Revealing…";
      syncRouletteSpinWhiteoutVisual();
      return;
    }
    syncRouletteSpinShuffleVisual(now);
  }

  function dispose() {
    doc.defaultView?.removeEventListener("keydown", onGlobalKeydown);
  }

  return {
    isPaused,
    open,
    closeUi,
    tickWallClock,
    dispose,
  };
}
