import { createUuid } from "./session.js";
import { snapshotBuild, achievementKeysFromSegment } from "./buildSnapshot.js";
import { enqueueAnalyticsJob } from "./flush.js";
import { getAnalyticsPlatform, getGameVersion } from "./platform.js";

/**
 * @typedef {object} SegmentCloseContext
 * @property {string} outcome
 * @property {number} simElapsed
 * @property {number} difficultyClockSec
 * @property {number} wave
 * @property {number} hunters
 * @property {object | null} [deathContext]
 */

/**
 * @param {object} deps
 * @property {() => import('@supabase/supabase-js').SupabaseClient | null} deps.getClient
 * @property {() => string} deps.getPlayerId
 * @property {() => string} deps.getHero
 * @property {() => number} deps.getRunLevel
 * @property {() => string | null} deps.getPathId
 * @property {() => object} deps.getInventory
 * @property {() => number} deps.getSimElapsed
 * @property {() => number} deps.getDifficultyClockSec
 * @property {() => object | null} [deps.getPendingCard]
 * @property {(q: number, r: number) => string | null} [deps.resolveSpecialHexAt]
 */
export function createSegmentTracker(deps) {
  const {
    getClient,
    getPlayerId,
    getHero,
    getRunLevel,
    getPathId,
    getInventory,
    getSimElapsed,
    getDifficultyClockSec,
    getPendingCard = () => null,
    resolveSpecialHexAt = () => null,
  } = deps;

  /** @type {string | null} */
  let runId = null;
  /** @type {object | null} */
  let openSegment = null;
  /** @type {{ sourceKey: string; amount: number } | null} */
  let lastDamageHit = null;

  function touchPlayer() {
    const client = getClient();
    if (!client) return;
    const now = new Date().toISOString();
    enqueueAnalyticsJob(client, {
      table: "analytics_players",
      op: "touch_player",
      row: {
        id: getPlayerId(),
        platform: getAnalyticsPlatform(),
        game_version: getGameVersion(),
        last_seen_at: now,
        first_seen_at: now,
      },
    });
  }

  function beginRun() {
    touchPlayer();
    runId = createUuid();
    const client = getClient();
    if (!client) return;
    enqueueAnalyticsJob(client, {
      table: "analytics_runs",
      op: "insert",
      row: {
        id: runId,
        player_id: getPlayerId(),
        hero: getHero(),
        platform: getAnalyticsPlatform(),
        started_at: new Date().toISOString(),
        outcome: null,
      },
    });
    startSegment({
      simElapsed: getSimElapsed(),
      difficultyClockSec: getDifficultyClockSec(),
    });
  }

  /**
   * Begin tracking a level segment (one display level until safehouse / death / victory).
   * @param {{ simElapsed: number; difficultyClockSec: number }} at
   */
  function startSegment(at) {
    openSegment = {
      id: createUuid(),
      runId,
      simStartedAt: at.simElapsed,
      difficultyClockAtStart: at.difficultyClockSec,
      damageBySource: {},
      buildStart: snapshotBuild(getInventory(), getHero(), getPendingCard()),
    };
    lastDamageHit = null;
  }

  /**
   * @param {string} sourceKey
   * @param {number} amount
   */
  function recordDamage(sourceKey, amount) {
    if (!openSegment || !sourceKey || amount <= 0) return;
    const key = String(sourceKey);
    openSegment.damageBySource[key] = (openSegment.damageBySource[key] ?? 0) + amount;
    lastDamageHit = { sourceKey: key, amount };
  }

  /**
   * @param {number} playerX
   * @param {number} playerY
   */
  function notePlayerPositionForDeath(playerX, playerY) {
    if (!openSegment) return;
    openSegment.deathPlayerX = playerX;
    openSegment.deathPlayerY = playerY;
  }

  /**
   * Snapshot segment close synchronously (before async Supabase flush).
   * @param {SegmentCloseContext} ctx
   * @returns {{ segmentRow: object; achievementKeys: string[] } | null}
   */
  function takeSegmentClose(ctx) {
    if (!openSegment || !runId) return null;
    const seg = openSegment;
    const activeRunId = runId;
    openSegment = null;

    const simEndedAt = ctx.simElapsed;
    /** Active level time: difficulty clock minus safehouse-tile freeze (same clock used for spawns). */
    const levelDifficultyClockSec = Math.max(0, ctx.difficultyClockSec - seg.difficultyClockAtStart);

    const buildEnd = snapshotBuild(getInventory(), getHero(), getPendingCard());

    /** @type {object | null} */
    let deathContext = ctx.deathContext ?? null;
    if (ctx.outcome === "death") {
      const specialHex =
        seg.deathPlayerX != null && seg.deathPlayerY != null
          ? resolveSpecialHexAt(seg.deathPlayerX, seg.deathPlayerY)
          : null;
      deathContext = {
        ...(deathContext ?? {}),
        special_hex: specialHex,
        last_damage_source: lastDamageHit?.sourceKey ?? null,
        enemy_type: lastDamageHit?.sourceKey ?? null,
      };
    }

    const segmentRow = {
      id: seg.id,
      run_id: activeRunId,
      player_id: getPlayerId(),
      run_level: getRunLevel(),
      display_level: getRunLevel() + 1,
      path_id: getPathId(),
      hero: getHero(),
      platform: getAnalyticsPlatform(),
      outcome: ctx.outcome,
      survival_sec: levelDifficultyClockSec,
      difficulty_clock_sec: levelDifficultyClockSec,
      sec_since_prev_safehouse: null,
      sim_started_at: seg.simStartedAt,
      sim_ended_at: simEndedAt,
      wave_end: ctx.wave,
      hunters_end: ctx.hunters,
      build_start: seg.buildStart,
      build_end: buildEnd,
      damage_by_source: seg.damageBySource,
      death_context: deathContext,
      game_version: getGameVersion(),
    };

    return {
      segmentRow,
      achievementKeys: achievementKeysFromSegment(segmentRow),
    };
  }

  /**
   * @param {{ segmentRow: object; achievementKeys: string[] } | null} prepared
   * @param {import('@supabase/supabase-js').SupabaseClient | null} client
   */
  function flushSegmentClose(prepared, client) {
    if (!prepared) return;
    const { segmentRow, achievementKeys } = prepared;
    enqueueAnalyticsJob(client, { table: "analytics_level_segments", op: "insert", row: segmentRow });
    const unlockedAt = new Date().toISOString();
    for (const achievement_key of achievementKeys) {
      enqueueAnalyticsJob(client, {
        table: "analytics_player_achievements",
        op: "insert",
        row: {
          player_id: getPlayerId(),
          achievement_key,
          unlocked_at: unlockedAt,
        },
      });
    }
  }

  /**
   * @param {'victory' | 'death'} outcome
   * @returns {{ id: string; outcome: string; ended_at: string } | null}
   */
  function takeEndRun(outcome) {
    if (!runId) return null;
    const prepared = {
      id: runId,
      outcome,
      ended_at: new Date().toISOString(),
    };
    runId = null;
    openSegment = null;
    return prepared;
  }

  /**
   * @param {{ id: string; outcome: string; ended_at: string } | null} prepared
   * @param {import('@supabase/supabase-js').SupabaseClient | null} client
   */
  function flushEndRun(prepared, client) {
    if (!prepared) return;
    enqueueAnalyticsJob(client, {
      table: "analytics_runs",
      op: "update",
      matchColumn: "id",
      row: {
        id: prepared.id,
        patch: {
          ended_at: prepared.ended_at,
          outcome: prepared.outcome,
        },
      },
    });
  }

  return {
    beginRun,
    startSegment,
    takeSegmentClose,
    flushSegmentClose,
    takeEndRun,
    flushEndRun,
    recordDamage,
    notePlayerPositionForDeath,
    getRunId: () => runId,
    hasOpenSegment: () => !!openSegment,
  };
}
