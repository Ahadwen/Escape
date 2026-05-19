import { queueAchievementPopupsFromKeys } from "../accounts/achievementPopups.js";
import { maybeSyncAccountRunStarted, maybeSyncAccountSegmentClose } from "../accounts/sync.js";
import { ensureSupabaseClient, getSupabaseClient } from "./client.js";
import { flushAnalyticsQueue, migrateAnalyticsQueue } from "./flush.js";
import { resolveDamageSourceKey } from "./damageSource.js";
import { getOrCreatePlayerId } from "./session.js";
import { createSegmentTracker } from "./segmentTracker.js";

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
  if (!ANALYTICS_ENABLED) {
    return createNoopAnalytics();
  }

  const playerId = getOrCreatePlayerId();
  migrateAnalyticsQueue();

  const tracker = createSegmentTracker({
    getClient: () => getSupabaseClient(),
    getPlayerId: () => playerId,
    getHero: deps.getHero,
    getRunLevel: deps.getRunLevel,
    getPathId: deps.getPathId,
    getInventory: deps.getInventory,
    getSimElapsed: deps.getSimElapsed,
    getDifficultyClockSec: deps.getDifficultyClockSec,
    getPendingCard: deps.getPendingCard,
    resolveSpecialHexAt: deps.resolveSpecialHexAt,
  });

  ensureSupabaseClient().then((client) => {
    if (client) flushAnalyticsQueue(client).catch(() => {});
  });

  function segmentContext() {
    return {
      simElapsed: deps.getSimElapsed(),
      difficultyClockSec: deps.getDifficultyClockSec(),
      wave: deps.getWave(),
      hunters: deps.getHunterCount(),
    };
  }

  /** @param {{ achievementKeys?: string[] } | null} closed */
  function notifySegmentAchievements(closed) {
    if (closed?.achievementKeys?.length) {
      queueAchievementPopupsFromKeys(closed.achievementKeys);
    }
  }

  return {
    beginRun() {
      maybeSyncAccountRunStarted();
      ensureSupabaseClient().then(() => tracker.beginRun());
    },

    onSafehouseLevelUp() {
      const ctx = segmentContext();
      const closed = tracker.takeSegmentClose({ ...ctx, outcome: "safehouse_level_up" });
      notifySegmentAchievements(closed);
      tracker.startSegment(ctx);
      ensureSupabaseClient().then((client) => {
        tracker.flushSegmentClose(closed, client);
        maybeSyncAccountSegmentClose(closed);
      });
    },

    onDeath() {
      const ctx = segmentContext();
      const closed = tracker.takeSegmentClose({ ...ctx, outcome: "death" });
      notifySegmentAchievements(closed);
      const ended = tracker.takeEndRun("death");
      ensureSupabaseClient().then((client) => {
        tracker.flushSegmentClose(closed, client);
        maybeSyncAccountSegmentClose(closed);
        tracker.flushEndRun(ended, client);
      });
    },

    onVictory() {
      const ctx = segmentContext();
      const closed = tracker.takeSegmentClose({ ...ctx, outcome: "victory" });
      notifySegmentAchievements(closed);
      const ended = tracker.takeEndRun("victory");
      ensureSupabaseClient().then((client) => {
        tracker.flushSegmentClose(closed, client);
        maybeSyncAccountSegmentClose(closed);
        tracker.flushEndRun(ended, client);
      });
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
      ensureSupabaseClient().then((client) => {
        if (client) flushAnalyticsQueue(client).catch(() => {});
      });
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
    recordDamageFromOpts: noop,
    notePlayerPosition: noop,
    flush: noop,
  };
}

export { resolveDamageSourceKey } from "./damageSource.js";
export { snapshotBuild, effectFingerprint, cardToSlotSnapshot } from "./buildSnapshot.js";
