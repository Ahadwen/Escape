/**
 * Achievement keys ↔ `escape_accounts` boolean columns.
 * Keep in sync with `supabase/migrations/005_escape_accounts.sql` and `achievementKeysFromSegment`.
 */

/** @typedef {"hearts" | "diamonds" | "clubs" | "spades"} SuitId */

/** Legal display level × path clears (pathRuntime bands). */
export const LEGAL_LEVEL_CLEAR_KEYS = [
  "clear:base:L1",
  "clear:bone:L2",
  "clear:fire:L2",
  "clear:swamp:L2",
  "clear:bone:L3",
  "clear:fire:L3",
  "clear:swamp:L3",
  "clear:depths:L4",
  "clear:halls:L4",
  "clear:depths:L5",
  "clear:halls:L5",
];

/** @type {readonly SuitId[]} */
export const ACHIEVEMENT_SUITS = ["hearts", "diamonds", "clubs", "spades"];

export const SET13_ACHIEVEMENT_KEYS = ACHIEVEMENT_SUITS.map((s) => `set13:${s}`);

export const VICTORY_ACHIEVEMENT_KEY = "victory";
export const MINIMALIST_ACHIEVEMENT_KEY = "minimalist";

/** @type {Record<string, string>} */
export const ACHIEVEMENT_KEY_TO_COLUMN = {
  "clear:base:L1": "ach_clear_base_l1",
  "clear:bone:L2": "ach_clear_bone_l2",
  "clear:fire:L2": "ach_clear_fire_l2",
  "clear:swamp:L2": "ach_clear_swamp_l2",
  "clear:bone:L3": "ach_clear_bone_l3",
  "clear:fire:L3": "ach_clear_fire_l3",
  "clear:swamp:L3": "ach_clear_swamp_l3",
  "clear:depths:L4": "ach_clear_depths_l4",
  "clear:halls:L4": "ach_clear_halls_l4",
  "clear:depths:L5": "ach_clear_depths_l5",
  "clear:halls:L5": "ach_clear_halls_l5",
  "set13:hearts": "ach_set13_hearts",
  "set13:diamonds": "ach_set13_diamonds",
  "set13:clubs": "ach_set13_clubs",
  "set13:spades": "ach_set13_spades",
  [VICTORY_ACHIEVEMENT_KEY]: "ach_victory",
  [MINIMALIST_ACHIEVEMENT_KEY]: "ach_minimalist",
};

export const ALL_ACCOUNT_ACHIEVEMENT_KEYS = [
  ...LEGAL_LEVEL_CLEAR_KEYS,
  ...SET13_ACHIEVEMENT_KEYS,
  VICTORY_ACHIEVEMENT_KEY,
  MINIMALIST_ACHIEVEMENT_KEY,
];

/** @typedef {{ key: string; column: string; title: string; detail: string; group: "levels" | "suits" | "victory" }} AchievementEntry */

/** @type {AchievementEntry[]} */
/**
 * @param {string} key
 */
export function getAchievementEntry(key) {
  return ACHIEVEMENT_ENTRIES.find((e) => e.key === key) ?? null;
}

export const ACHIEVEMENT_ENTRIES = [
  { key: "clear:base:L1", column: "ach_clear_base_l1", title: "Level 1", detail: "Sanctuary — base run", group: "levels" },
  { key: "clear:bone:L2", column: "ach_clear_bone_l2", title: "Level 2 · Bone", detail: "Clear on the Bone path", group: "levels" },
  { key: "clear:fire:L2", column: "ach_clear_fire_l2", title: "Level 2 · Fire", detail: "Clear on the Fire path", group: "levels" },
  { key: "clear:swamp:L2", column: "ach_clear_swamp_l2", title: "Level 2 · Swamp", detail: "Clear on the Swamp path", group: "levels" },
  { key: "clear:bone:L3", column: "ach_clear_bone_l3", title: "Level 3 · Bone", detail: "Clear on the Bone path", group: "levels" },
  { key: "clear:fire:L3", column: "ach_clear_fire_l3", title: "Level 3 · Fire", detail: "Clear on the Fire path", group: "levels" },
  { key: "clear:swamp:L3", column: "ach_clear_swamp_l3", title: "Level 3 · Swamp", detail: "Clear on the Swamp path", group: "levels" },
  { key: "clear:depths:L4", column: "ach_clear_depths_l4", title: "Level 4 · Depths", detail: "Clear on the Depths path", group: "levels" },
  { key: "clear:halls:L4", column: "ach_clear_halls_l4", title: "Level 4 · Halls", detail: "Clear on the Halls path", group: "levels" },
  { key: "clear:depths:L5", column: "ach_clear_depths_l5", title: "Level 5 · Depths", detail: "Clear on the Depths path", group: "levels" },
  { key: "clear:halls:L5", column: "ach_clear_halls_l5", title: "Level 5 · Halls", detail: "Clear on the Halls path", group: "levels" },
  {
    key: "set13:hearts",
    column: "ach_set13_hearts",
    title: "Hearts 13/13",
    detail: "Reach a safehouse with a full hearts rank deck",
    group: "suits",
  },
  {
    key: "set13:diamonds",
    column: "ach_set13_diamonds",
    title: "Diamonds 13/13",
    detail: "Reach a safehouse with a full diamonds rank deck",
    group: "suits",
  },
  {
    key: "set13:clubs",
    column: "ach_set13_clubs",
    title: "Clubs 13/13",
    detail: "Reach a safehouse with a full clubs rank deck",
    group: "suits",
  },
  {
    key: "set13:spades",
    column: "ach_set13_spades",
    title: "Spades 13/13",
    detail: "Reach a safehouse with a full spades rank deck",
    group: "suits",
  },
  {
    key: VICTORY_ACHIEVEMENT_KEY,
    column: "ach_victory",
    title: "Escape",
    detail: "Reach the victory screen",
    group: "victory",
  },
  {
    key: MINIMALIST_ACHIEVEMENT_KEY,
    column: "ach_minimalist",
    title: "Minimalist",
    detail: "Reach a Level 1 safehouse after 7:00 on the level",
    group: "victory",
  },
];
