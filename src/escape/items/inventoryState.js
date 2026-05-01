import { deckKey } from "./cardUtils.js";

export function createEmptyInventory() {
  /** @type {Record<number, object | null>} */
  const deckByRank = {};
  for (let r = 1; r <= 13; r++) deckByRank[r] = null;
  return {
    deckByRank,
    backpackSlots: /** @type {(object | null)[]} */ ([null, null, null]),
    diamondEmpower: null,
    valiantElectricBoxChargeBonus: 0,
    heartsRegenPerSec: 0,
    heartsRegenBank: 0,
    heartsResistanceReadyAt: 0,
    heartsResistanceCooldownDuration: 0,
    swampInfectionStacks: 0,
    /** Swamp bootleg crystal curses (runtime rows; cleared on run / path reset). */
    swampBootlegCurses: /** @type {object[]} */ ([]),
    swampBootlegCdDash: 0,
    swampBootlegCdBurst: 0,
    swampBootlegSpellSilenceUntil: 0,
    swampBootlegBloodTax: null,
    spadesObstacleBoostUntil: 0,
    aceUltimateReadyAt: 0,
    /** Seven diamonds in rank deck — larger dash range and smoke radius (rogue). */
    rogueDiamondRangeBoost: false,
    /** Lunatic passive fractional HP bank (whole HP granted when bank ≥ 1). */
    lunaticRegenBank: 0,
  };
}

export function addReservedDeckKey(card, reserved) {
  if (card?.suit != null && Number.isInteger(card.rank)) {
    reserved.add(deckKey(card.suit, card.rank));
    if (card.suit === "joker") {
      for (const s of ["diamonds", "hearts", "clubs", "spades"]) {
        reserved.add(deckKey(s, card.rank));
      }
    }
  }
}

/**
 * @param {object} inventory
 * @param {object | null} pendingCard
 * @param {object[]} worldCards — `{ card }` entries still on the map
 */
export function collectReservedDeckKeys(inventory, pendingCard, worldCards) {
  const reserved = new Set();
  addReservedDeckKey(pendingCard, reserved);
  for (let r = 1; r <= 13; r++) addReservedDeckKey(inventory.deckByRank[r], reserved);
  for (const c of inventory.backpackSlots) addReservedDeckKey(c, reserved);
  for (const w of worldCards) addReservedDeckKey(w.card, reserved);
  return reserved;
}

export function forEachDeckCard(inventory, fn) {
  for (let r = 1; r <= 13; r++) {
    const c = inventory.deckByRank[r];
    if (c) fn(c, r);
  }
}
