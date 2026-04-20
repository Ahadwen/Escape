/**
 * Stable codes for run logs (local dev). Format: ESC-EVT-* = events, ESC-E-* = failures.
 * Search the codebase for a code string to find call sites.
 */

/** Session / lifecycle */
export const EVT_SESSION_START = "ESC-EVT-0001";

/** Character & run */
export const EVT_GAME_START = "ESC-EVT-0010";
export const EVT_CHARACTER_SELECTED = "ESC-EVT-0012";
export const EVT_CHARACTER_CONFIRM = "ESC-EVT-0013";
export const EVT_CHARACTER_HOWTO_OPEN = "ESC-EVT-0014";
export const EVT_CHARACTER_HOWTO_BACK = "ESC-EVT-0015";

/** Pickups & resources */
export const EVT_HEAL_PICKUP = "ESC-EVT-0100";
export const EVT_CARD_MAP_PICKUP = "ESC-EVT-0101";
export const EVT_ROGUE_FOOD_EATEN = "ESC-EVT-0102";
export const EVT_PROCEDURAL_SPECIAL_HEX = "ESC-EVT-0103";

/** Modals & UI */
export const EVT_CARD_MODAL_OPEN = "ESC-EVT-0200";
export const EVT_CARD_MODAL_CLOSE = "ESC-EVT-0201";
export const EVT_CARD_LOADOUT_CONTINUE = "ESC-EVT-0202";
export const EVT_ROULETTE_MODAL_OPEN = "ESC-EVT-0210";
export const EVT_ROULETTE_MODAL_CLOSE = "ESC-EVT-0211";
export const EVT_ROULETTE_FORGE_SUCCESS = "ESC-EVT-0212";
export const EVT_SAFEHOUSE_LEVEL_UP = "ESC-EVT-0213";
export const EVT_FORGE_MODAL_OPEN = "ESC-EVT-0214";
export const EVT_FORGE_MODAL_CLOSE = "ESC-EVT-0215";
export const EVT_FORGE_SUCCESS = "ESC-EVT-0216";
export const EVT_MANUAL_PAUSE = "ESC-EVT-0220";
export const EVT_MANUAL_RESUME = "ESC-EVT-0221";

/** Failures */
export const E_SNAPSHOT_FOLDER = "ESC-E-SNAP-0001";
/** Folder picker API missing in this browser. */
export const E_SNAPSHOT_API = "ESC-E-SNAP-0005";
export const E_SNAPSHOT_BLOB = "ESC-E-SNAP-0002";
export const E_SNAPSHOT_SAVE = "ESC-E-SNAP-0003";
export const E_SNAPSHOT_RENDER_HOOK = "ESC-E-SNAP-0004";
export const E_RUN_LOG_FINALIZE = "ESC-E-LOG-0001";

/** Uncaught exception in main frame loop (`update` / `render`). */
export const E_MAIN_LOOP = "ESC-E-LOOP-0001";

/** Roulette forge could not build a pair for the chosen source card (deck full / edge case). */
export const E_ROULETTE_NO_FORGE_PAIR = "ESC-E-ROUL-0001";
