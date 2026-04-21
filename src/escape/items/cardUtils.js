export const SUIT_GLYPH = {
  diamonds: "\u2666",
  hearts: "\u2665",
  clubs: "\u2663",
  spades: "\u2660",
  joker: "\u2605",
};

export const MODAL_SET_SUIT_ORDER = ["hearts", "diamonds", "clubs", "spades"];

export const CARD_SET_GLOW_CLASSES = [
  "card-set-glow-red",
  "card-set-glow-yellow",
  "card-set-glow-green",
  "card-set-glow-blue",
  "card-set-glow-white",
];

export function cardRankText(rank) {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function formatCardName(card) {
  return `${cardRankText(card.rank)}${SUIT_GLYPH[card.suit] ?? "?"}`;
}

export function deckKey(suit, rank) {
  return `${suit}:${rank}`;
}

const SUITS = ["diamonds", "hearts", "clubs", "spades"];

/**
 * Second face for world card pickup visuals only (REFERENCE `makePickupFlipFace`).
 * @param {{ suit: string, rank: number }} realCard
 */
export function makePickupFlipFace(realCard) {
  for (let attempt = 0; attempt < 32; attempt++) {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const rank = 1 + Math.floor(Math.random() * 13);
    if (suit !== realCard.suit || rank !== realCard.rank) return { suit, rank };
  }
  const altSuit = SUITS.find((s) => s !== realCard.suit) ?? "spades";
  return { suit: altSuit, rank: realCard.rank === 1 ? 2 : realCard.rank - 1 };
}

/**
 * Two purely visual faces for world card pickups.
 * They are intentionally decoupled from the real reward card.
 * @param {{ suit: string, rank: number }} realCard
 */
export function makePickupVisualPair(realCard) {
  const a = makePickupFlipFace(realCard);
  for (let attempt = 0; attempt < 24; attempt++) {
    const b = makePickupFlipFace(realCard);
    if (b.suit !== a.suit || b.rank !== a.rank) {
      return { visualCardA: a, visualCardB: b };
    }
  }
  return {
    visualCardA: a,
    visualCardB: { suit: a.suit === "spades" ? "hearts" : "spades", rank: a.rank === 13 ? 1 : a.rank + 1 },
  };
}
