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
    getPendingCard = () => null,
    resolveSpecialHexAt = () => null,
  } = deps;

  /** @type {string | null} */
  let runId = null;
  /** @type {object | null} */
  let openSegment = null;
  let prevSafehouseDifficultyClock = 0;
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
        started_at: new Date().toISOString(),
        outcome: null,
      },
    });
    prevSafehouseDifficultyClock = 0;
    startSegment();
  }

  function startSegment() {
    const simNow = openSegment?.simEndedAt ?? 0;
    openSegment = {
      id: createUuid(),
      runId,
      simStartedAt: typeof simNow === "number" ? simNow : 0,
      difficultyClockAtStart: prevSafehouseDifficultyClock,
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
   * @param {SegmentCloseContext} ctx
   */
  function closeSegment(ctx) {
    if (!openSegment || !runId) return;
    const seg = openSegment;
    openSegment = null;

    const simEndedAt = ctx.simElapsed;
    const survivalSec = Math.max(0, simEndedAt - seg.simStartedAt);
    const difficultyClockSec = ctx.difficultyClockSec;
    const secSincePrevSafehouse =
      seg.difficultyClockAtStart > 0
        ? Math.max(0, difficultyClockSec - seg.difficultyClockAtStart)
        : difficultyClockSec;

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

    const row = {
      id: seg.id,
      run_id: runId,
      player_id: getPlayerId(),
      run_level: getRunLevel(),
      display_level: getRunLevel() + 1,
      path_id: getPathId(),
      hero: getHero(),
      outcome: ctx.outcome,
      survival_sec: survivalSec,
      difficulty_clock_sec: difficultyClockSec,
      sec_since_prev_safehouse: secSincePrevSafehouse,
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

    const client = getClient();
    enqueueAnalyticsJob(client, { table: "analytics_level_segments", op: "insert", row });

    const achievementKeys = achievementKeysFromSegment(row);
    for (const achievement_key of achievementKeys) {
      enqueueAnalyticsJob(client, {
        table: "analytics_player_achievements",
        op: "insert",
        row: {
          player_id: getPlayerId(),
          achievement_key,
          unlocked_at: new Date().toISOString(),
        },
      });
    }

    if (ctx.outcome === "safehouse_level_up") {
      prevSafehouseDifficultyClock = difficultyClockSec;
    }
  }

  /**
   * @param {'victory' | 'death' | 'abandon'} outcome
   */
  function endRun(outcome) {
    if (!runId) return;
    const client = getClient();
    enqueueAnalyticsJob(client, {
      table: "analytics_runs",
      op: "update",
      matchColumn: "id",
      row: {
        id: runId,
        patch: {
          ended_at: new Date().toISOString(),
          outcome,
        },
      },
    });
    runId = null;
    openSegment = null;
  }

  function abandonOpenSegment(simElapsed, difficultyClockSec, wave, hunters) {
    if (!openSegment) return;
    closeSegment({
      outcome: "abandon",
      simElapsed,
      difficultyClockSec,
      wave,
      hunters,
    });
    endRun("abandon");
  }

  return {
    beginRun,
    startSegment,
    closeSegment,
    endRun,
    recordDamage,
    notePlayerPositionForDeath,
    abandonOpenSegment,
    getRunId: () => runId,
    hasOpenSegment: () => !!openSegment,
  };
}
