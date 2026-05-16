/** @returns {string} */
export function getAnalyticsPlatform() {
  const fromEnv = import.meta.env?.VITE_PLATFORM;
  if (typeof fromEnv === "string" && fromEnv.trim()) return fromEnv.trim();
  return "web_github_pages";
}

/** @returns {string} */
export function getGameVersion() {
  const fromEnv = import.meta.env?.VITE_GAME_VERSION;
  if (typeof fromEnv === "string" && fromEnv.trim()) return fromEnv.trim();
  return "0.0.0";
}

/** @returns {boolean} */
export function isAnalyticsConfigured() {
  const url = import.meta.env?.VITE_SUPABASE_URL;
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  return typeof url === "string" && url.length > 0 && typeof key === "string" && key.length > 0;
}
