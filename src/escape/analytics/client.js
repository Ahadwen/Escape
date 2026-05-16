import { createClient } from "@supabase/supabase-js";
import { isAnalyticsConfigured } from "./platform.js";

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let client = null;

/**
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function getSupabaseClient() {
  if (!isAnalyticsConfigured()) return null;
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
