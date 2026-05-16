import { ensureSupabaseClient, getSupabaseClient } from "./client.js";
import { isPlayerSyncedToSupabase, markPlayerSyncedToSupabase } from "./session.js";

const QUEUE_LS_KEY = "escape-analytics-queue";
const QUEUE_VERSION_KEY = "escape-analytics-queue-version";
const QUEUE_VERSION = 3;
const MAX_QUEUE = 50;

/** @type {Promise<void>} */
let flushChain = Promise.resolve();

/** Drop stale failed jobs from before RLS fix / upsert removal. */
export function migrateAnalyticsQueue() {
  try {
    const v = localStorage.getItem(QUEUE_VERSION_KEY);
    if (v === String(QUEUE_VERSION)) return;
    localStorage.removeItem(QUEUE_LS_KEY);
    localStorage.setItem(QUEUE_VERSION_KEY, String(QUEUE_VERSION));
  } catch {
    /* private mode */
  }
}

/**
 * @returns {object[]}
 */
function readQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * @param {object[]} items
 */
function writeQueue(items) {
  try {
    localStorage.setItem(QUEUE_LS_KEY, JSON.stringify(items.slice(-MAX_QUEUE)));
  } catch {
    /* quota */
  }
}

function isDuplicateKeyError(error) {
  const err = /** @type {{ code?: string }} */ (error);
  return err?.code === "23505";
}

function isForeignKeyError(error) {
  const err = /** @type {{ code?: string }} */ (error);
  return err?.code === "23503";
}

/**
 * @param {object} job
 * @param {unknown} error
 */
function logAnalyticsError(job, error) {
  if (!import.meta.env?.DEV) return;
  if (isDuplicateKeyError(error) || isForeignKeyError(error)) return;
  const err = /** @type {{ message?: string }} */ (error);
  console.warn("[escape analytics]", job.table, job.op, err?.message ?? error, error);
}

function shouldDropFailedJob(error) {
  return isDuplicateKeyError(error) || isForeignKeyError(error);
}

/**
 * @param {object} job
 * @returns {object}
 */
function normalizeJob(job) {
  if (job.op === "upsert" && job.table === "analytics_players") {
    return { ...job, op: "touch_player" };
  }
  if (job.op === "upsert") {
    return { ...job, op: "insert" };
  }
  return job;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {object} row
 */
async function touchPlayerRow(client, row) {
  const payload = {
    id: row.id,
    platform: row.platform,
    game_version: row.game_version,
    last_seen_at: row.last_seen_at,
  };
  if (!isPlayerSyncedToSupabase(row.id)) {
    payload.first_seen_at = row.first_seen_at ?? row.last_seen_at;
  }

  const { error } = await client.from("analytics_players").upsert(payload, { onConflict: "id" });
  if (error) throw error;
  markPlayerSyncedToSupabase(row.id);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {object} job
 */
async function executeJob(client, job) {
  const normalized = normalizeJob(job);
  const { table, row, op } = normalized;

  if (op === "touch_player" || (op === "insert" && table === "analytics_players")) {
    await touchPlayerRow(client, row);
    return;
  }

  if (op === "update") {
    const { error } = await client.from(table).update(row.patch).eq(normalized.matchColumn, row.id);
    if (error) throw error;
    return;
  }

  const { error } = await client.from(table).insert(row);
  if (!error) return;

  if (isDuplicateKeyError(error)) {
    if (table === "analytics_players") {
      await touchPlayerRow(client, row);
      return;
    }
    if (
      table === "analytics_runs" ||
      table === "analytics_level_segments" ||
      table === "analytics_player_achievements"
    ) {
      return;
    }
  }

  throw error;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient | null} client
 */
export async function flushAnalyticsQueue(client) {
  if (!client) return;
  migrateAnalyticsQueue();
  const pending = readQueue();
  if (!pending.length) return;
  const remaining = [];
  for (const job of pending) {
    try {
      await executeJob(client, job);
    } catch (err) {
      if (!shouldDropFailedJob(err)) {
        logAnalyticsError(job, err);
        remaining.push(job);
      }
    }
  }
  writeQueue(remaining);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient | null} client
 * @param {object} job
 */
export function enqueueAnalyticsJob(client, job) {
  const run = (resolvedClient) => {
    if (!resolvedClient) {
      const q = readQueue();
      q.push(job);
      writeQueue(q);
      return;
    }
    flushChain = flushChain
      .then(() => executeJob(resolvedClient, job))
      .catch((err) => {
        if (shouldDropFailedJob(err)) return;
        logAnalyticsError(job, err);
        const q = readQueue();
        q.push(job);
        writeQueue(q);
      });
  };

  if (client) {
    run(client);
    return;
  }

  flushChain = flushChain.then(() =>
    ensureSupabaseClient().then((resolved) => run(resolved ?? getSupabaseClient())),
  );
}
