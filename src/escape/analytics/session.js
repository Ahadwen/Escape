const PLAYER_ID_LS_KEY = "escape-player-id";
const PLAYER_SYNCED_LS_KEY = "escape-analytics-player-synced";

/**
 * @returns {string}
 */
export function createUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * @returns {string}
 */
export function getOrCreatePlayerId() {
  try {
    const existing = localStorage.getItem(PLAYER_ID_LS_KEY);
    if (existing && existing.length >= 8) return existing;
    const id = createUuid();
    localStorage.setItem(PLAYER_ID_LS_KEY, id);
    return id;
  } catch {
    return createUuid();
  }
}

/** @param {string} playerId */
export function isPlayerSyncedToSupabase(playerId) {
  try {
    return localStorage.getItem(PLAYER_SYNCED_LS_KEY) === playerId;
  } catch {
    return false;
  }
}

/** @param {string} playerId */
export function markPlayerSyncedToSupabase(playerId) {
  try {
    localStorage.setItem(PLAYER_SYNCED_LS_KEY, playerId);
  } catch {
    /* private mode */
  }
}
