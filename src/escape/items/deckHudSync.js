import { formatCardHudSuitGlyph, cardRankText } from "./cardUtils.js";
import { clearCardGlowClasses, countSuitsAcrossAllStowed, suitInventoryGlowClass } from "./setBonusPresentation.js";

function preferTouchPointerDrag() {
  return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
}

function fillDeckSlotEl(el, rank, card, inventory, pendingCard, itemRules, forgeHudDragSources) {
  if (!el) return;
  const suitsAll = countSuitsAcrossAllStowed(inventory, pendingCard);
  clearCardGlowClasses(el);
  el.classList.toggle("filled", !!card);
  el.dataset.rank = String(rank);
  if (!card) {
    el.removeAttribute("draggable");
    delete el.dataset.forgeRef;
    el.innerHTML = `<span class="deck-rank-label">${cardRankText(rank)}</span><span class="deck-slot-empty">—</span>`;
    return;
  }
  const glow = suitInventoryGlowClass(card, suitsAll);
  if (glow) el.classList.add(glow);
  el.innerHTML = `<span class="deck-rank-label">${cardRankText(card.rank)}</span><div class="card-slot-copy"><span class="title">${formatCardHudSuitGlyph(card)}</span><span class="meta">${itemRules.describeCardEffect(card)}</span></div>`;
  if (forgeHudDragSources && card.suit !== "joker") {
    el.draggable = !preferTouchPointerDrag();
    el.dataset.forgeRef = JSON.stringify({ kind: "deck", rank });
  } else {
    el.removeAttribute("draggable");
    delete el.dataset.forgeRef;
  }
}

/**
 * @param {(HTMLElement | null)[]} deckRankSlotEls length 13 index 0 = rank 1
 * @param {(HTMLElement | null)[]} backpackSlotEls length 3
 * @param {boolean} [forgeHudDragSources] — deck/backpack cells become draggable forge sources (`data-forge-ref`).
 */
export function syncDeckSlotsFromInventory(
  deckRankSlotEls,
  backpackSlotEls,
  inventory,
  pendingCard,
  itemRules,
  forgeHudDragSources = false,
) {
  if (deckRankSlotEls?.length) {
    for (let r = 1; r <= 13; r++) {
      const el = deckRankSlotEls[r - 1];
      fillDeckSlotEl(el, r, inventory.deckByRank[r] || null, inventory, pendingCard, itemRules, forgeHudDragSources);
    }
  }
  const suitsAll = countSuitsAcrossAllStowed(inventory, pendingCard);
  if (backpackSlotEls?.length) {
    for (let i = 0; i < 3; i++) {
      const slot = backpackSlotEls[i];
      if (!slot) continue;
      const card = inventory.backpackSlots[i] || null;
      clearCardGlowClasses(slot);
      slot.classList.toggle("filled", !!card);
      slot.dataset.bpIdx = String(i);
      if (!card) {
        slot.removeAttribute("draggable");
        delete slot.dataset.forgeRef;
        slot.innerHTML = `Pack ${i + 1}<span class="deck-slot-empty">Empty</span>`;
        continue;
      }
      const glow = suitInventoryGlowClass(card, suitsAll);
      if (glow) slot.classList.add(glow);
      slot.innerHTML = `<span class="deck-rank-label">${cardRankText(card.rank)}</span><div class="card-slot-copy"><span class="title">${formatCardHudSuitGlyph(
        card,
      )}</span><span class="meta">${itemRules.describeCardEffect(card)}</span></div>`;
      if (forgeHudDragSources && card.suit !== "joker") {
        slot.draggable = !preferTouchPointerDrag();
        slot.dataset.forgeRef = JSON.stringify({ kind: "bp", idx: i });
      } else {
        slot.removeAttribute("draggable");
        delete slot.dataset.forgeRef;
      }
    }
  }
}
