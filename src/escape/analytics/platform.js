/** @returns {string} */
export function getGameVersion() {
  const fromEnv = import.meta.env?.VITE_GAME_VERSION;
  if (typeof fromEnv === "string" && fromEnv.trim()) return fromEnv.trim();
  return "0.0.0";
}

/**
 * Where the game is running — resolved at runtime so one build works on localhost and GitHub Pages.
 * @returns {string}
 */
export function getAnalyticsPlatform() {
  if (typeof window !== "undefined" && window.location) {
    const host = String(window.location.hostname || "").toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]") {
      return "web_localhost";
    }
    if (host.endsWith(".github.io") || host === "github.io") {
      return "web_github_pages";
    }
    if (host.endsWith(".gitlab.io")) {
      return "web_gitlab_pages";
    }
  }

  const fromEnv = import.meta.env?.VITE_PLATFORM;
  if (typeof fromEnv === "string" && fromEnv.trim()) return fromEnv.trim();
  return "web_unknown";
}

/**
 * @param {{ url?: string; key?: string }} creds
 * @returns {boolean}
 */
export function hasAnalyticsCredentials(creds) {
  return typeof creds?.url === "string" && creds.url.length > 0 && typeof creds?.key === "string" && creds.key.length > 0;
}

/**
 * Env baked in at build time (Vite / CI).
 * @returns {{ url: string; key: string } | null}
 */
export function getBuildTimeCredentials() {
  const url = import.meta.env?.VITE_SUPABASE_URL;
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  if (hasAnalyticsCredentials({ url, key })) {
    return { url: String(url).trim(), key: String(key).trim() };
  }
  return null;
}

/** @returns {boolean} */
export function isAnalyticsConfigured() {
  return getBuildTimeCredentials() != null;
}
