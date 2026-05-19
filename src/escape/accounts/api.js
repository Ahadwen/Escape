import { ensureSupabaseClient } from "../analytics/client.js";
import {
  isValidAccountId,
  normalizeAccountProfile,
  parseOAuthSyncResponse,
} from "./accountProfile.js";

/**
 * @param {unknown} err
 * @returns {string}
 */
function rpcErrorMessage(err) {
  if (!err) return "Request failed";
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null) {
    const o = /** @type {{ msg?: string; message?: string; error_code?: string; code?: number | string }} */ (err);
    if (typeof o.msg === "string" && o.msg.trim()) return o.msg.trim();
    if (typeof o.message === "string" && o.message.trim()) {
      try {
        const parsed = JSON.parse(o.message);
        if (parsed?.msg) return String(parsed.msg);
      } catch {
        /* plain message */
      }
      return o.message.trim();
    }
  }
  return "Request failed";
}

const GOOGLE_PROVIDER_DISABLED_HINT =
  "Google sign-in is not enabled in Supabase yet. Open your project → Authentication → Providers → Google → Enable, " +
  "paste a Google Cloud OAuth client ID and secret, then add redirect URL " +
  "https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback (and your app URL under Authentication → URL configuration).";

/**
 * @param {unknown} err
 * @returns {string}
 */
function authErrorMessage(err) {
  const raw = rpcErrorMessage(err).toLowerCase();
  if (raw.includes("provider is not enabled") || raw.includes("unsupported provider")) {
    return GOOGLE_PROVIDER_DISABLED_HINT;
  }
  return rpcErrorMessage(err);
}

/**
 * @param {import('@supabase/supabase-js').PostgrestError | null} error
 * @param {unknown} data
 */
/**
 * @param {import('@supabase/supabase-js').PostgrestError | null} error
 * @param {unknown} data
 */
function assertAccountRpcOk(error, data) {
  if (error) throw new Error(rpcErrorMessage(error));
  const profile = normalizeAccountProfile(data);
  if (!profile) throw new Error("Invalid account response from server");
  return profile;
}

/**
 * @param {string} accountId
 */
function requireAccountId(accountId) {
  if (!isValidAccountId(accountId)) {
    throw new Error("Invalid account session — please log in again");
  }
  return accountId.trim();
}

/**
 * @param {{ username: string; email: string; password: string }} fields
 */
export async function registerAccount(fields) {
  const client = await ensureSupabaseClient();
  if (!client) throw new Error("Accounts are unavailable — Supabase is not configured.");

  const { data, error } = await client.rpc("escape_register_account", {
    p_username: fields.username,
    p_email: fields.email,
    p_password: fields.password,
  });
  return assertAccountRpcOk(error, data);
}

/**
 * @param {{ email: string; password: string }} fields
 */
export async function loginAccount(fields) {
  const client = await ensureSupabaseClient();
  if (!client) throw new Error("Accounts are unavailable — Supabase is not configured.");

  const { data, error } = await client.rpc("escape_login_account", {
    p_email: fields.email,
    p_password: fields.password,
  });
  return assertAccountRpcOk(error, data);
}

/**
 * @param {string} accountId
 */
export async function fetchAccount(accountId) {
  const client = await ensureSupabaseClient();
  if (!client) throw new Error("Accounts are unavailable — Supabase is not configured.");

  const { data, error } = await client.rpc("escape_get_account", {
    p_account_id: requireAccountId(accountId),
  });
  return assertAccountRpcOk(error, data);
}

/**
 * @param {string} accountId
 */
export async function recordAccountRunStarted(accountId) {
  const client = await ensureSupabaseClient();
  if (!client) return;

  const { error } = await client.rpc("escape_record_run_started", {
    p_account_id: requireAccountId(accountId),
  });
  if (error) console.warn("[Escape accounts] record_run_started:", rpcErrorMessage(error));
}

/**
 * @param {string} accountId
 * @param {number} displayLevel
 * @param {string[]} keys
 */
/**
 * Redirects to Google OAuth (returns to current page).
 */
export async function signInWithGoogle() {
  const client = await ensureSupabaseClient();
  if (!client) throw new Error("Accounts are unavailable — Supabase is not configured.");

  const redirectTo =
    typeof window !== "undefined" ? window.location.href.split("#")[0] : undefined;

  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw new Error(authErrorMessage(error));
}

/**
 * After OAuth redirect, link Supabase Auth user to escape_accounts.
 * New users without a row get `{ needsUsername: true, email }` until a username is submitted.
 * @param {{ username?: string }} [opts]
 * @returns {Promise<import('./session.js').EscapeAccountProfile | { needsUsername: true; email: string } | null>}
 */
export async function syncOAuthAccountFromSession(opts = {}) {
  const client = await ensureSupabaseClient();
  if (!client) return null;

  const { data, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw new Error(rpcErrorMessage(sessionError));
  const user = data.session?.user;
  if (!user?.id || !user.email) return null;

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email.split("@")[0] ??
    "Player";

  const username = opts.username?.trim();
  const { data: payload, error } = await client.rpc("escape_sync_oauth_account", {
    p_auth_user_id: user.id,
    p_email: user.email,
    p_display_name: displayName,
    p_username: username || null,
  });
  if (error) throw new Error(rpcErrorMessage(error));

  const parsed = parseOAuthSyncResponse(payload);
  if (!parsed) throw new Error("Invalid account response from server");
  if ("needsUsername" in parsed) return parsed;

  return parsed;
}

/**
 * Finish Google sign-up after the player picks a username.
 * @param {string} username
 */
export async function completeOAuthRegistration(username) {
  const trimmed = username.trim();
  if (trimmed.length < 2 || trimmed.length > 32) {
    throw new Error("Username must be 2–32 characters");
  }
  const result = await syncOAuthAccountFromSession({ username: trimmed });
  if (!result || "needsUsername" in result) {
    throw new Error("Could not create account — try again");
  }
  return result;
}

export async function signOutSupabaseAuth() {
  const client = await ensureSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
}

export async function recordAccountSegmentProgress(accountId, displayLevel, keys) {
  const client = await ensureSupabaseClient();
  if (!client) return;

  const { error } = await client.rpc("escape_record_segment_progress", {
    p_account_id: requireAccountId(accountId),
    p_display_level: displayLevel,
    p_keys: keys ?? [],
  });
  if (error) console.warn("[Escape accounts] record_segment_progress:", rpcErrorMessage(error));
}
