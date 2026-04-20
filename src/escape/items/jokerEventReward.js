import { makeDefaultCardEffect } from "./defaultCardEffects.js";

/**
 * Marks cards granted only by arena / gauntlet (and future) **special hex events** — not random map drops.
 * World collectibles must not use this source.
 */
export const JOKER_REWARD_PICKUP_SOURCE = "specialEventHex";

/**
 * Builds a Joker reward card for special-event completion (REFERENCE `makeJokerArenaRewardCard` shape).
 * @param {string} [characterId]
 * @returns {{ id: string; suit: string; rank: number; effectBorrowedSuit: string; effect: unknown; pickupSource: string }}
 */
export function makeJokerEventRewardCard(characterId = "knight") {
  const ranks = [10, 11, 12, 13];
  const rank = ranks[Math.floor(Math.random() * ranks.length)];
  const sourceSuits = ["diamonds", "hearts", "clubs", "spades"];
  const effectBorrowedSuit = sourceSuits[Math.floor(Math.random() * sourceSuits.length)];
  const ctx = {
    characterId,
    diamondCooldownAbilityIds: ["dash", "burst", "decoy"],
  };
  return {
    id: `joker-event-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    suit: "joker",
    rank,
    effectBorrowedSuit,
    effect: makeDefaultCardEffect(effectBorrowedSuit, rank, ctx),
    pickupSource: JOKER_REWARD_PICKUP_SOURCE,
  };
}

/**
 * @typedef {object} DropJokerEventRewardDeps
 * @property {() => string} getCharacterId
 * @property {(card: object) => void} openCardPickup
 */

/**
 * Presents the special-event Joker through the normal card pickup flow.
 * Call **only** from special hex completion (arena siege end, surge reward windows, etc.).
 * @param {DropJokerEventRewardDeps} deps
 */
export function dropJokerRewardFromSpecialEvent(deps) {
  const { getCharacterId, openCardPickup } = deps;
  const card = makeJokerEventRewardCard(getCharacterId());
  openCardPickup(card);
}
