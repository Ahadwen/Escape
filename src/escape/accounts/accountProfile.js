/** @typedef {import('./session.js').EscapeAccountProfile} EscapeAccountProfile */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * @param {unknown} value
 * @returns {value is string}
 */
export function isValidAccountId(value) {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function toBool(value) {
  return value === true || value === "t" || value === "true" || value === 1;
}

/**
 * Normalize Supabase RPC payload (jsonb object, or legacy Postgres composite string).
 * @param {unknown} data
 * @returns {EscapeAccountProfile | null}
 */
/**
 * @param {unknown} data
 * @returns {{ needsUsername: true; email: string } | null}
 */
export function parseOAuthNeedsUsername(data) {
  if (data == null || typeof data !== "object" || Array.isArray(data)) return null;
  const o = /** @type {Record<string, unknown>} */ (data);
  if (o.needs_username !== true && o.needsUsername !== true) return null;
  return { needsUsername: true, email: String(o.email ?? "") };
}

/**
 * @param {unknown} data
 * @returns {EscapeAccountProfile | { needsUsername: true; email: string } | null}
 */
export function parseOAuthSyncResponse(data) {
  const pending = parseOAuthNeedsUsername(data);
  if (pending) return pending;
  return normalizeAccountProfile(data);
}

export function normalizeAccountProfile(data) {
  if (data == null) return null;

  if (typeof data === "string") {
    const trimmed = data.trim();
    if (trimmed.startsWith("{")) {
      try {
        return normalizeAccountProfile(JSON.parse(trimmed));
      } catch {
        return null;
      }
    }
    if (trimmed.startsWith("(")) {
      return normalizeAccountProfile(parsePgCompositeAccount(trimmed));
    }
    return null;
  }

  if (typeof data !== "object" || Array.isArray(data)) return null;

  const o = /** @type {Record<string, unknown>} */ (data);
  const id = o.id;
  if (!isValidAccountId(String(id ?? ""))) return null;

  return {
    id: String(id),
    username: String(o.username ?? ""),
    email: String(o.email ?? ""),
    max_display_level: Number(o.max_display_level ?? 1) || 1,
    run_count: Number(o.run_count ?? 0) || 0,
    analytics_player_id: o.analytics_player_id ? String(o.analytics_player_id) : null,
    auth_user_id: o.auth_user_id ? String(o.auth_user_id) : null,
    ach_clear_base_l1: toBool(o.ach_clear_base_l1),
    ach_clear_bone_l2: toBool(o.ach_clear_bone_l2),
    ach_clear_fire_l2: toBool(o.ach_clear_fire_l2),
    ach_clear_swamp_l2: toBool(o.ach_clear_swamp_l2),
    ach_clear_bone_l3: toBool(o.ach_clear_bone_l3),
    ach_clear_fire_l3: toBool(o.ach_clear_fire_l3),
    ach_clear_swamp_l3: toBool(o.ach_clear_swamp_l3),
    ach_clear_depths_l4: toBool(o.ach_clear_depths_l4),
    ach_clear_halls_l4: toBool(o.ach_clear_halls_l4),
    ach_clear_depths_l5: toBool(o.ach_clear_depths_l5),
    ach_clear_halls_l5: toBool(o.ach_clear_halls_l5),
    ach_set13_hearts: toBool(o.ach_set13_hearts),
    ach_set13_diamonds: toBool(o.ach_set13_diamonds),
    ach_set13_clubs: toBool(o.ach_set13_clubs),
    ach_set13_spades: toBool(o.ach_set13_spades),
    ach_victory: toBool(o.ach_victory),
    ach_minimalist: toBool(o.ach_minimalist),
  };
}

/**
 * Legacy PostgREST composite literal: (uuid,name,email,...).
 * @param {string} raw
 * @returns {Record<string, unknown> | null}
 */
function parsePgCompositeAccount(raw) {
  const inner = raw.trim().replace(/^\(/, "").replace(/\)$/, "");
  if (!inner) return null;

  const fields = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      cur += ch;
      continue;
    }
    if (ch === "," && !inQuotes) {
      fields.push(unquotePgField(cur));
      cur = "";
      continue;
    }
    cur += ch;
  }
  fields.push(unquotePgField(cur));

  if (fields.length < 4 || !isValidAccountId(fields[0] ?? "")) return null;

  const hasAuthCol = fields.length >= 26;

  return {
    id: fields[0],
    username: fields[1],
    email: fields[2],
    max_display_level: Number(fields[3]) || 1,
    run_count: Number(fields[4]) || 0,
    analytics_player_id: fields[5] || null,
    auth_user_id: hasAuthCol ? fields[6] || null : null,
    ach_clear_base_l1: toBool(fields[hasAuthCol ? 7 : 6]),
    ach_clear_bone_l2: toBool(fields[hasAuthCol ? 8 : 7]),
    ach_clear_fire_l2: toBool(fields[hasAuthCol ? 9 : 8]),
    ach_clear_swamp_l2: toBool(fields[hasAuthCol ? 10 : 9]),
    ach_clear_bone_l3: toBool(fields[hasAuthCol ? 11 : 10]),
    ach_clear_fire_l3: toBool(fields[hasAuthCol ? 12 : 11]),
    ach_clear_swamp_l3: toBool(fields[hasAuthCol ? 13 : 12]),
    ach_clear_depths_l4: toBool(fields[hasAuthCol ? 14 : 13]),
    ach_clear_halls_l4: toBool(fields[hasAuthCol ? 15 : 14]),
    ach_clear_depths_l5: toBool(fields[hasAuthCol ? 16 : 15]),
    ach_clear_halls_l5: toBool(fields[hasAuthCol ? 17 : 16]),
    ach_set13_hearts: toBool(fields[hasAuthCol ? 18 : 17]),
    ach_set13_diamonds: toBool(fields[hasAuthCol ? 19 : 18]),
    ach_set13_clubs: toBool(fields[hasAuthCol ? 20 : 19]),
    ach_set13_spades: toBool(fields[hasAuthCol ? 21 : 20]),
    ach_victory: toBool(fields[hasAuthCol ? 22 : 21]),
  };
}

/**
 * @param {string} raw
 */
function unquotePgField(raw) {
  const s = raw.trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1).replace(/""/g, '"');
  }
  return s;
}
