import { deckKey } from "../items/cardUtils.js";
import { countSuitsAcrossAllStowed } from "../items/setBonusPresentation.js";
import { forEachDeckCard } from "../items/inventoryState.js";
import { SET_BONUS_SUIT_MAX, SET_BONUS_SUIT_THRESHOLD } from "../balance.js";

const SUITS = ["hearts", "diamonds", "clubs", "spades"];

/**
 * @param {number} n
 * @returns {string}
 */
function fmtNum(n) {
  if (!Number.isFinite(n)) return "?";
  const r = Math.round(n * 1000) / 1000;
  return Number.isInteger(r) ? String(r) : String(r);
}

/**
 * Stable, compact effect id for analytics (kind + parameters that define gameplay).
 * @param {object | null | undefined} effect
 * @returns {string | null}
 */
export function effectFingerprint(effect) {
  if (!effect?.kind) return null;
  const k = effect.kind;
  switch (k) {
    case "ultimate":
      return `${k}:${effect.ultType ?? "?"}`;
    case "cooldown":
    case "cooldownPct":
      return `${k}:${effect.target ?? "?"}:${fmtNum(effect.value)}`;
    case "maxHp":
    case "dodge":
    case "stun":
    case "invisBurst":
    case "speed":
    case "terrainBoost":
    case "dashCharge":
      return `${k}:${fmtNum(effect.value)}`;
    case "hitResist":
      return `${k}:cd${fmtNum(effect.cooldown)}`;
    case "frontShield":
      return `${k}:arc${fmtNum(effect.arc)}`;
    default:
      return k;
  }
}

/**
 * @param {object | null} card
 * @returns {string | null}
 */
function cardSlotKey(card) {
  if (!card || !Number.isInteger(card.rank)) return null;
  if (card.suit === "joker") return `joker:${card.rank}`;
  if (card.suit) return deckKey(card.suit, card.rank);
  return null;
}

/**
 * One deck/backpack slot for analytics JSON.
 * @param {object | null} card
 * @returns {{ k: string; e: string | null; from?: string } | null}
 */
export function cardToSlotSnapshot(card) {
  if (!card) return null;
  const k = cardSlotKey(card);
  if (!k) return null;
  /** @type {{ k: string; e: string | null; from?: string }} */
  const slot = { k, e: effectFingerprint(card.effect) };
  if (card.suit === "joker" && card.effectBorrowedSuit) slot.from = card.effectBorrowedSuit;
  return slot;
}

/**
 * @param {Record<string, number>} suitCounts
 * @returns {Record<string, 0 | 7 | 13>}
 */
function suitCountsToSetTiers(suitCounts) {
  /** @type {Record<string, 0 | 7 | 13>} */
  const tiers = {};
  for (const suit of SUITS) {
    const n = suitCounts[suit] ?? 0;
    if (n >= SET_BONUS_SUIT_MAX) tiers[suit] = 13;
    else if (n >= SET_BONUS_SUIT_THRESHOLD) tiers[suit] = 7;
    else tiers[suit] = 0;
  }
  return tiers;
}

/**
 * Compact inventory snapshot for analytics.
 * Deck/backpack slots: `{ k, e, from? }` — rank+suit key, effect fingerprint, joker borrow suit.
 * @param {object} inventory
 * @param {string} hero
 * @param {object | null} [pendingCard]
 */
export function snapshotBuild(inventory, hero, pendingCard = null) {
  const deck = [];
  for (let r = 1; r <= 13; r++) {
    deck.push(cardToSlotSnapshot(inventory.deckByRank[r]));
  }
  const backpack = inventory.backpackSlots.map((c) => cardToSlotSnapshot(c));
  const suit_counts = countSuitsAcrossAllStowed(inventory, pendingCard);
  return {
    hero,
    deck,
    backpack,
    suit_counts,
    set_tiers: suitCountsToSetTiers(suit_counts),
    diamond_empower: inventory.diamondEmpower ?? null,
    pending: cardToSlotSnapshot(pendingCard),
  };
}

/**
 * Achievement keys to unlock from a closed segment.
 * @param {object} segmentRow
 * @returns {string[]}
 */
export function achievementKeysFromSegment(segmentRow) {
  const keys = [];
  const { outcome, path_id, display_level, build_end } = segmentRow;
  if (outcome === "safehouse_level_up" || outcome === "victory") {
    const pathKey = path_id ?? "base";
    keys.push(`clear:${pathKey}:L${display_level}`);
  }
  const tiers = build_end?.set_tiers;
  if (tiers && typeof tiers === "object") {
    for (const suit of SUITS) {
      if (tiers[suit] === 13) keys.push(`set13:${suit}`);
    }
  }
  return keys;
}

/**
 * @param {object} inventory
 * @param {string} suit
 */
export function countSuitInRankDeck(inventory, suit) {
  let n = 0;
  forEachDeckCard(inventory, (c) => {
    if (c?.suit === suit) n += 1;
  });
  return n;
}
