import { MODAL_SET_SUIT_ORDER, CARD_SET_GLOW_CLASSES, SUIT_GLYPH } from "./cardUtils.js";
import { forEachDeckCard } from "./inventoryState.js";
import { SET_BONUS_SUIT_MAX, SET_BONUS_SUIT_THRESHOLD } from "../balance.js";

function addSuitCount(suits, card) {
  if (!card?.suit) return;
  if (card.suit === "joker") {
    suits.diamonds += 1;
    suits.hearts += 1;
    suits.clubs += 1;
    suits.spades += 1;
  } else if (suits[card.suit] != null) suits[card.suit] += 1;
}

export function countSuitsAcrossAllStowed(inventory, pendingCard) {
  const suits = { diamonds: 0, hearts: 0, clubs: 0, spades: 0 };
  addSuitCount(suits, pendingCard);
  forEachDeckCard(inventory, (c) => addSuitCount(suits, c));
  for (const c of inventory.backpackSlots) addSuitCount(suits, c);
  return suits;
}

export function countSuitsInActiveSlots(inventory) {
  const suits = { diamonds: 0, hearts: 0, clubs: 0, spades: 0 };
  forEachDeckCard(inventory, (c) => addSuitCount(suits, c));
  return suits;
}

export function suitDisplayNameForModal(suit) {
  return { diamonds: "Diamonds", hearts: "Hearts", clubs: "Clubs", spades: "Spades" }[suit] ?? suit;
}

/**
 * One-line set progress for the main HUD (plain suit glyphs like deck tiles, not emoji).
 * @param {object} inventory
 */
export function getHudSetBonusCompactLine(inventory) {
  const suits = countSuitsInActiveSlots(inventory);
  const parts = [];
  for (const suit of MODAL_SET_SUIT_ORDER) {
    const n = suits[suit];
    if (n < 1) continue;
    const g = SUIT_GLYPH[suit] ?? "?";
    if (n < SET_BONUS_SUIT_THRESHOLD) {
      parts.push(`${g} ${n}/${SET_BONUS_SUIT_THRESHOLD}`);
      continue;
    }
    const cap = SET_BONUS_SUIT_MAX;
    const tierProg = Math.min(n, cap);
    if (tierProg < cap) {
      parts.push(`${g} ${SET_BONUS_SUIT_THRESHOLD}/${SET_BONUS_SUIT_THRESHOLD} ${g} ${tierProg}/${cap}`);
    } else {
      parts.push(`${g} ${SET_BONUS_SUIT_THRESHOLD}/${SET_BONUS_SUIT_THRESHOLD} ${g} ${cap}/${cap}`);
    }
  }
  return parts.join("  |  ");
}

/**
 * @param {object} card
 * @param {ReturnType<typeof countSuitsAcrossAllStowed>} suits
 */
export function suitInventoryGlowClass(card, suits) {
  if (!card?.suit) return "";
  if (card.suit === "joker") return "card-set-glow-white";
  const n = suits[card.suit];
  if (n < 2) return "";
  const suitsWithPair = MODAL_SET_SUIT_ORDER.filter((s) => suits[s] >= 2);
  const idx = suitsWithPair.indexOf(card.suit);
  if (idx < 0) return "";
  if (suitsWithPair.length === 1 && n >= 4) return "card-set-glow-yellow";
  const glowByPairOrder = ["card-set-glow-red", "card-set-glow-yellow", "card-set-glow-green", "card-set-glow-blue"];
  return glowByPairOrder[Math.min(idx, glowByPairOrder.length - 1)];
}

export function clearCardGlowClasses(el) {
  if (!el) return;
  for (const c of CARD_SET_GLOW_CLASSES) el.classList.remove(c);
}

/**
 * @param {object} inventory
 * @param {object | null} pendingCard
 * @param {object} itemRules — suit* label methods
 */
export function getModalSetBonusProgressLines(inventory, pendingCard, itemRules) {
  const suits = countSuitsInActiveSlots(inventory);
  const lines = [];
  for (const suit of MODAL_SET_SUIT_ORDER) {
    const n = suits[suit];
    if (n < 1) continue;
    const name = suitDisplayNameForModal(suit);
    if (n < SET_BONUS_SUIT_THRESHOLD) {
      lines.push(`${name} ${n}/${SET_BONUS_SUIT_THRESHOLD} (${itemRules.suitSetBonusGoalLabel(suit)})`);
      continue;
    }
    lines.push(
      `${name} ${SET_BONUS_SUIT_THRESHOLD}/${SET_BONUS_SUIT_THRESHOLD} (${itemRules.suitSetBonusSevenActiveShort(suit)})`,
    );
    if (n < SET_BONUS_SUIT_MAX) {
      lines.push(`${name} ${n}/${SET_BONUS_SUIT_MAX} (${itemRules.suitSetBonusTierTwoGoalLabel(suit)})`);
    } else {
      lines.push(`${name} ${SET_BONUS_SUIT_MAX}/${SET_BONUS_SUIT_MAX} (${itemRules.suitSetBonusTierTwoActiveShort(suit)})`);
    }
  }
  return lines;
}
