import { getSupabaseClient } from "./client.js";
import { flushAnalyticsQueue, migrateAnalyticsQueue } from "./flush.js";
import { resolveDamageSourceKey } from "./damageSource.js";
import { getOrCreatePlayerId } from "./session.js";
import { createSegmentTracker } from "./segmentTracker.js";
import { isAnalyticsConfigured } from "./platform.js";

/** Gate for future opt-in banner. */
export const ANALYTICS_ENABLED = true;

/**
 * @param {object} deps
 * @property {() => string} deps.getHero
 * @property {() => number} deps.getRunLevel
 * @property {() => string | null} deps.getPathId
 * @property {() => object} deps.getInventory
 * @property {() => number} deps.getSimElapsed
 * @property {() => number} deps.getDifficultyClockSec
 * @property {() => number} deps.getWave
 * @property {() => number} deps.getHunterCount
 * @property {() => object | null} [deps.getPendingCard]
 * @property {(x: number, y: number) => string | null} [deps.resolveSpecialHexAt]
 */
export function createAnalytics(deps) {
  if (!ANALYTICS_ENABLED || !isAnalyticsConfigured()) {
    return createNoopAnalytics();
  }

  const playerId = getOrCreatePlayerId();
  const client = getSupabaseClient();
  migrateAnalyticsQueue();
  flushAnalyticsQueue(client).catch(() => {});

  const tracker = createSegmentTracker({
    getClient: () => client,
    getPlayerId: () => playerId,
    getHero: deps.getHero,
    getRunLevel: deps.getRunLevel,
    getPathId: deps.getPathId,
    getInventory: deps.getInventory,
    getPendingCard: deps.getPendingCard,
    resolveSpecialHexAt: deps.resolveSpecialHexAt,
  });

  function segmentContext() {
    return {
      simElapsed: deps.getSimElapsed(),
      difficultyClockSec: deps.getDifficultyClockSec(),
      wave: deps.getWave(),
      hunters: deps.getHunterCount(),
    };
  }

  return {
    beginRun() {
      tracker.beginRun();
    },

    onSafehouseLevelUp() {
      const ctx = segmentContext();
      tracker.closeSegment({ ...ctx, outcome: "safehouse_level_up" });
      tracker.startSegment();
    },

    onDeath() {
      const ctx = segmentContext();
      tracker.closeSegment({ ...ctx, outcome: "death" });
      tracker.endRun("death");
    },

    onVictory() {
      const ctx = segmentContext();
      tracker.closeSegment({ ...ctx, outcome: "victory" });
      tracker.endRun("victory");
    },

    onAbandon() {
      const ctx = segmentContext();
      tracker.abandonOpenSegment(ctx.simElapsed, ctx.difficultyClockSec, ctx.wave, ctx.hunters);
    },

    /** @param {number} appliedAmount HP/temp HP actually removed */
    recordDamageFromOpts(appliedAmount, opts = {}) {
      if (appliedAmount <= 0) return;
      const key = resolveDamageSourceKey(opts);
      if (key) tracker.recordDamage(key, appliedAmount);
    },

    notePlayerPosition(x, y) {
      tracker.notePlayerPositionForDeath(x, y);
    },

    flush() {
      flushAnalyticsQueue(client).catch(() => {});
    },
  };
}

function createNoopAnalytics() {
  const noop = () => {};
  return {
    beginRun: noop,
    onSafehouseLevelUp: noop,
    onDeath: noop,
    onVictory: noop,
    onAbandon: noop,
    recordDamageFromOpts: noop,
    notePlayerPosition: noop,
    flush: noop,
  };
}

export { resolveDamageSourceKey } from "./damageSource.js";
export { snapshotBuild, effectFingerprint, cardToSlotSnapshot } from "./buildSnapshot.js";
