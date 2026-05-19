import { isValidAccountId, normalizeAccountProfile } from "./accountProfile.js";
import {
  clearBrowserAccountCookie,
  isBrowserEnvironment,
  setBrowserAccountCookie,
} from "./browserPersistence.js";

const ACCOUNT_PROFILE_LS_KEY = "escape_account_profile_v1";

/**
 * @typedef {object} EscapeAccountProfile
 * @property {string} id
 * @property {string} username
 * @property {string} email
 * @property {number} max_display_level
 * @property {number} run_count
 * @property {string | null} [analytics_player_id]
 * @property {string | null} [auth_user_id]
 * @property {boolean} ach_clear_base_l1
 * @property {boolean} ach_clear_bone_l2
 * @property {boolean} ach_clear_fire_l2
 * @property {boolean} ach_clear_swamp_l2
 * @property {boolean} ach_clear_bone_l3
 * @property {boolean} ach_clear_fire_l3
 * @property {boolean} ach_clear_swamp_l3
 * @property {boolean} ach_clear_depths_l4
 * @property {boolean} ach_clear_halls_l4
 * @property {boolean} ach_clear_depths_l5
 * @property {boolean} ach_clear_halls_l5
 * @property {boolean} ach_set13_hearts
 * @property {boolean} ach_set13_diamonds
 * @property {boolean} ach_set13_clubs
 * @property {boolean} ach_set13_spades
 * @property {boolean} ach_victory
 * @property {boolean} ach_minimalist
 */

/**
 * @returns {EscapeAccountProfile | null}
 */
export function loadAccountProfile() {
  try {
    const raw = localStorage.getItem(ACCOUNT_PROFILE_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const profile = normalizeAccountProfile(parsed);
    if (!profile) {
      localStorage.removeItem(ACCOUNT_PROFILE_LS_KEY);
      if (isBrowserEnvironment()) clearBrowserAccountCookie();
    }
    return profile;
  } catch {
    return null;
  }
}

/**
 * @param {EscapeAccountProfile | null} profile
 */
export function saveAccountProfile(profile) {
  try {
    const normalized = normalizeAccountProfile(profile);
    if (!normalized) {
      localStorage.removeItem(ACCOUNT_PROFILE_LS_KEY);
      if (isBrowserEnvironment()) clearBrowserAccountCookie();
      return;
    }
    localStorage.setItem(ACCOUNT_PROFILE_LS_KEY, JSON.stringify(normalized));
    if (isBrowserEnvironment()) setBrowserAccountCookie(normalized.id);
  } catch {
    /* private mode / quota */
  }
}

export function clearAccountProfile() {
  saveAccountProfile(null);
}

export { isBrowserEnvironment } from "./browserPersistence.js";

/**
 * @returns {string | null}
 */
export function getLoggedInAccountId() {
  const id = loadAccountProfile()?.id;
  return isValidAccountId(id) ? id : null;
}
