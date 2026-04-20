/**
 * Single registry for heroes shown in character select and elsewhere.
 * `implemented` — controller exists in `createCharacterController` (others stay visible but disabled).
 */
export const HERO_ROSTER = [
  {
    id: "knight",
    title: "Knight",
    /** Keep HP line in sync with `KNIGHT_MAX_HP` in `Knight.js`. */
    /** Keep HP line in sync with `KNIGHT_MAX_HP` in `Knight.js`. */
    meta: "Balanced · 10 HP · classic kit",
    implemented: true,
  },
  {
    id: "rogue",
    title: "Hungry Rogue",
    meta: "High risk · hunger · stealth & smoke",
    implemented: false,
  },
  {
    id: "lunatic",
    title: "The Lunatic",
    meta: "No cards · sprint charge · roar through walls",
    implemented: false,
  },
  {
    id: "valiant",
    title: "The Valiant",
    meta: "Will meter · find and protect rabbits · shock fields",
    implemented: false,
  },
];

/** @returns {typeof HERO_ROSTER} */
export function getHeroRoster() {
  return HERO_ROSTER;
}

/** First match for `preferredId` if implemented, else first implemented hero, else `"knight"`. */
export function resolveImplementedHeroId(preferredId) {
  const roster = getHeroRoster();
  return (
    roster.find((h) => h.id === preferredId && h.implemented)?.id ??
    roster.find((h) => h.implemented)?.id ??
    "knight"
  );
}
