import { CARD_RANK_SPAWN_WEIGHT_MAX, CARD_RANK_SPAWN_WEIGHT_MIN } from "../balance.js";
import { deckKey } from "./cardUtils.js";

export function cardRankSpawnWeight(rank) {
  if (rank === 1) return cardRankSpawnWeight(9);
  if (rank >= 2 && rank <= 13) {
    const span = 11;
    const t = (rank - 2) / span;
    return CARD_RANK_SPAWN_WEIGHT_MAX - t * (CARD_RANK_SPAWN_WEIGHT_MAX - CARD_RANK_SPAWN_WEIGHT_MIN);
  }
  return CARD_RANK_SPAWN_WEIGHT_MIN;
}

/**
 * @param {Set<string>} reserved — `deckKey` values already placed in deck, backpack, map, or modal
 * @param {{ makeCardEffect: (suit: string, rank: number) => object }} itemRules
 */
export function makeRandomMapCard(reserved, itemRules) {
  const suits = ["diamonds", "hearts", "clubs", "spades"];
  const candidates = [];
  for (const suit of suits) {
    for (let rank = 1; rank <= 13; rank++) {
      if (reserved.has(deckKey(suit, rank))) continue;
      candidates.push({ suit, rank, w: cardRankSpawnWeight(rank) });
    }
  }

  let suit;
  let rank;
  if (!candidates.length) {
    let found = null;
    outer: for (const s of suits) {
      for (let r = 1; r <= 13; r++) {
        if (!reserved.has(deckKey(s, r))) {
          found = { suit: s, rank: r };
          break outer;
        }
      }
    }
    if (!found) {
      suit = "hearts";
      rank = 2;
    } else {
      suit = found.suit;
      rank = found.rank;
    }
  } else {
    let total = 0;
    for (const c of candidates) total += c.w;
    let pick = Math.random() * total;
    let chosen = candidates[candidates.length - 1];
    for (const c of candidates) {
      pick -= c.w;
      if (pick <= 0) {
        chosen = c;
        break;
      }
    }
    suit = chosen.suit;
    rank = chosen.rank;
  }

  return {
    id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    suit,
    rank,
    effect: itemRules.makeCardEffect(suit, rank),
  };
}
