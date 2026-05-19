/** Cookie stores account id only (profile loaded from Supabase on resume). */
const ACCOUNT_ID_COOKIE = "escape_account_id";

/** 30 days — “stay logged in” for browser players. */
const ACCOUNT_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * True when running in a normal browser document (not workers / SSR).
 * @returns {boolean}
 */
export function isBrowserEnvironment() {
  return (
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    typeof document.cookie === "string"
  );
}

/**
 * Cookie path scoped to the game’s deploy directory (GitHub Pages subpaths, etc.).
 * @returns {string}
 */
export function getBrowserCookiePath() {
  if (!isBrowserEnvironment()) return "/";

  const baseUrl = import.meta.env?.BASE_URL ?? "/";
  if (baseUrl && baseUrl !== "/" && baseUrl !== "./") {
    const trimmed = String(baseUrl).replace(/^\./, "").replace(/\/$/, "");
    if (trimmed) return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  const path = window.location.pathname || "/";
  if (path === "/" || path.endsWith("/")) return path || "/";
  const dir = path.replace(/\/[^/]*$/, "");
  return dir || "/";
}

/**
 * @param {string} raw
 * @returns {boolean}
 */
function isValidAccountId(raw) {
  return typeof raw === "string" && UUID_RE.test(raw.trim());
}

/**
 * @param {string} accountId
 */
export function setBrowserAccountCookie(accountId) {
  if (!isBrowserEnvironment() || !isValidAccountId(accountId)) return;

  const secure = window.location.protocol === "https:";
  const parts = [
    `${ACCOUNT_ID_COOKIE}=${encodeURIComponent(accountId.trim())}`,
    `Max-Age=${ACCOUNT_COOKIE_MAX_AGE_SEC}`,
    `Path=${getBrowserCookiePath()}`,
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  document.cookie = parts.join("; ");
}

export function clearBrowserAccountCookie() {
  if (!isBrowserEnvironment()) return;

  const secure = window.location.protocol === "https:";
  const parts = [
    `${ACCOUNT_ID_COOKIE}=`,
    "Max-Age=0",
    `Path=${getBrowserCookiePath()}`,
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  document.cookie = parts.join("; ");
}

/**
 * @returns {string | null}
 */
export function getBrowserAccountIdFromCookie() {
  if (!isBrowserEnvironment()) return null;

  const prefix = `${ACCOUNT_ID_COOKIE}=`;
  for (const chunk of document.cookie.split(";")) {
    const part = chunk.trim();
    if (!part.startsWith(prefix)) continue;
    const value = decodeURIComponent(part.slice(prefix.length));
    if (isValidAccountId(value)) return value.trim();
  }
  return null;
}
