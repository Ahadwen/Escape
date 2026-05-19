import {
  fetchAccount,
  linkAnalyticsPlayer,
  recordAccountRunStarted,
  recordAccountSegmentProgress,
} from "./api.js";
import { getOrCreatePlayerId } from "../analytics/session.js";
import {
  clearBrowserAccountCookie,
  getBrowserAccountIdFromCookie,
  isBrowserEnvironment,
} from "./browserPersistence.js";
import { getLoggedInAccountId, loadAccountProfile, saveAccountProfile } from "./session.js";

/**
 * Browser only: restore session from stay-logged-in cookie when localStorage is empty.
 * @returns {Promise<import('./session.js').EscapeAccountProfile | null>}
 */
export async function resumeAccountFromBrowserCookie() {
  if (!isBrowserEnvironment()) return null;

  const existing = loadAccountProfile();
  if (existing?.id) return existing;

  const accountId = getBrowserAccountIdFromCookie();
  if (!accountId) return null;

  try {
    const profile = await fetchAccount(accountId);
    saveAccountProfile(profile);
    maybeLinkAccountAnalyticsPlayer();
    return profile;
  } catch (err) {
    console.warn("[Escape accounts] cookie resume failed:", err);
    clearBrowserAccountCookie();
    return null;
  }
}

function getLocalAnalyticsPlayerId() {
  try {
    return getOrCreatePlayerId();
  } catch {
    return null;
  }
}

/** Link browser analytics id to the logged-in account when possible. */
export function maybeLinkAccountAnalyticsPlayer() {
  const accountId = getLoggedInAccountId();
  const playerId = getLocalAnalyticsPlayerId();
  if (!accountId || !playerId) return;

  linkAnalyticsPlayer(accountId, playerId).catch(() => {});
}

export function maybeSyncAccountRunStarted() {
  const accountId = getLoggedInAccountId();
  if (!accountId) return;

  const analyticsPlayerId = getLocalAnalyticsPlayerId();

  const profile = loadAccountProfile();
  if (profile) {
    saveAccountProfile({
      ...profile,
      run_count: (profile.run_count ?? 0) + 1,
    });
  }

  recordAccountRunStarted(accountId, analyticsPlayerId ?? undefined)
    .then(() => refreshLoggedInAccount())
    .catch(() => {});
}

/**
 * @param {{ segmentRow?: object; achievementKeys?: string[] } | null} prepared
 */
export function maybeSyncAccountSegmentClose(prepared) {
  if (!prepared?.segmentRow) return;
  const accountId = getLoggedInAccountId();
  if (!accountId) return;

  const { segmentRow, achievementKeys = [] } = prepared;
  const displayLevel = Number(segmentRow.display_level ?? 1);

  recordAccountSegmentProgress(accountId, displayLevel, achievementKeys)
    .then(() => refreshLoggedInAccount())
    .catch(() => {});
}

export async function refreshLoggedInAccount() {
  const accountId = getLoggedInAccountId();
  if (!accountId) return null;
  try {
    const profile = await fetchAccount(accountId);
    saveAccountProfile(profile);
    maybeLinkAccountAnalyticsPlayer();
    return profile;
  } catch (err) {
    console.warn("[Escape accounts] refresh:", err);
    return loadAccountProfile();
  }
}
