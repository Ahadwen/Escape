import { createClient } from "@supabase/supabase-js";
import { getBuildTimeCredentials, hasAnalyticsCredentials } from "./platform.js";

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;

/** @type {Promise<import('@supabase/supabase-js').SupabaseClient | null> | null} */
let initPromise = null;

/**
 * @returns {Promise<{ url: string; key: string } | null>}
 */
async function resolveCredentials() {
  const builtIn = getBuildTimeCredentials();
  if (builtIn) return builtIn;

  if (typeof fetch === "undefined") return null;

  try {
    const base = import.meta.env?.BASE_URL ?? "/";
    const path = `${base}escape-analytics.json`.replace(/\/{2,}/g, "/");
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const url = data?.url ?? data?.VITE_SUPABASE_URL;
    const key = data?.key ?? data?.VITE_SUPABASE_ANON_KEY;
    if (hasAnalyticsCredentials({ url, key })) {
      return { url: String(url).trim(), key: String(key).trim() };
    }
  } catch {
    /* offline / missing file */
  }
  return null;
}

/**
 * Initializes Supabase once (env from build, else `public/escape-analytics.json` on deploy).
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient | null>}
 */
export function ensureSupabaseClient() {
  if (client) return Promise.resolve(client);
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const creds = await resolveCredentials();
    if (!creds) {
      if (import.meta.env?.PROD) {
        console.warn(
          "[Escape analytics] Disabled: no Supabase URL/key in build. " +
            "Set GitHub Actions secrets or add public/escape-analytics.json before deploy.",
        );
      }
      return null;
    }
    client = createClient(creds.url, creds.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return client;
  })();

  return initPromise;
}

/**
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function getSupabaseClient() {
  return client;
}
