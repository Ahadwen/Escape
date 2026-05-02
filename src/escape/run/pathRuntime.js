/**
 * Run path runtime.
 * Level 1 (runLevel 0): no path (base run).
 * Levels 2–3 (runLevel 1–2): random among Fire / Bone / Swamp.
 * Levels 4–5 (runLevel 3+): random between Depths / Halls (replaces early path when crossing into this band).
 * Debug can force any registered path.
 * Path-specific logic is sourced from `map/path/*`.
 */

import { BONE_PATH_DEF } from "../map/path/bone.js";
import { DEPTHS_PATH_DEF } from "../map/path/depths.js";
import { FIRE_PATH_DEF } from "../map/path/fire.js";
import { HALLS_PATH_DEF } from "../map/path/halls.js";
import { SWAMP_PATH_DEF } from "../map/path/swamp.js";

/** @typedef {"bone" | "depths" | "fire" | "halls" | "swamp"} PathId */

/** @type {ReadonlySet<PathId>} */
export const EARLY_PATH_IDS = new Set(["bone", "fire", "swamp"]);
/** @type {ReadonlySet<PathId>} */
export const LATE_PATH_IDS = new Set(["depths", "halls"]);

/**
 * @typedef {object} PathDef
 * @property {PathId} id
 * @property {string} label
 * @property {string} tileTint
 * @property {(payload: any) => any} [onDamage]
 * @property {(payload: any) => any} [onEnemy]
 * @property {(payload: any) => any} [onDebuff]
 */

/** @type {PathDef[]} */
export const PATH_DEFS = [BONE_PATH_DEF, FIRE_PATH_DEF, SWAMP_PATH_DEF, DEPTHS_PATH_DEF, HALLS_PATH_DEF];

const PATH_BY_ID = new Map(PATH_DEFS.map((d) => [d.id, d]));

const EARLY_PATH_DEFS = [BONE_PATH_DEF, FIRE_PATH_DEF, SWAMP_PATH_DEF];
const LATE_PATH_DEFS = [DEPTHS_PATH_DEF, HALLS_PATH_DEF];

/**
 * @param {unknown} value
 * @returns {PathId | null}
 */
function normalizePathId(value) {
  if (typeof value !== "string") return null;
  return PATH_BY_ID.has(/** @type {PathId} */ (value)) ? /** @type {PathId} */ (value) : null;
}

/**
 * @param {{ rng?: () => number }} [opts]
 */
export function createPathRuntime(opts = {}) {
  const rng = typeof opts.rng === "function" ? opts.rng : Math.random;
  /** @type {PathId | null} */
  let currentPathId = null;
  /** @type {PathId | null} */
  let forcedPathId = null;
  /** @type {number | null} */
  let assignedAtLevel = null;

  function resetRun() {
    currentPathId = null;
    forcedPathId = null;
    assignedAtLevel = null;
  }

  function pickRandomEarlyPathId() {
    const i = Math.max(0, Math.min(EARLY_PATH_DEFS.length - 1, Math.floor(rng() * EARLY_PATH_DEFS.length)));
    return EARLY_PATH_DEFS[i].id;
  }

  function pickRandomLatePathId() {
    const i = Math.max(0, Math.min(LATE_PATH_DEFS.length - 1, Math.floor(rng() * LATE_PATH_DEFS.length)));
    return LATE_PATH_DEFS[i].id;
  }

  /**
   * Assigns path by run tier: none at L1, early trio at L2–3, Depths/Halls at L4+.
   * @param {number} runLevel zero-based (display level = runLevel + 1)
   * @returns {PathId | null}
   */
  function ensurePathAssignedForLevel(runLevel) {
    if (forcedPathId) {
      currentPathId = forcedPathId;
      assignedAtLevel = Math.max(0, runLevel);
      return currentPathId;
    }
    if (runLevel < 1) {
      currentPathId = null;
      assignedAtLevel = null;
      return null;
    }
    if (runLevel >= 3) {
      if (currentPathId == null || EARLY_PATH_IDS.has(currentPathId)) {
        currentPathId = pickRandomLatePathId();
        assignedAtLevel = runLevel;
      }
      return currentPathId;
    }
    if (currentPathId == null || LATE_PATH_IDS.has(currentPathId)) {
      currentPathId = pickRandomEarlyPathId();
      assignedAtLevel = runLevel;
    }
    return currentPathId;
  }

  /**
   * Debug override. Passing null returns to automatic random behavior.
   * @param {string | null} pathId
   * @returns {PathId | null}
   */
  function setForcedPathId(pathId) {
    forcedPathId = normalizePathId(pathId);
    if (forcedPathId) {
      currentPathId = forcedPathId;
      if (assignedAtLevel == null) assignedAtLevel = 0;
    }
    return forcedPathId;
  }

  /**
   * @returns {{ id: PathId | null; label: string; tileTint: string }}
   */
  function getPathVisualConfig() {
    const def = currentPathId ? PATH_BY_ID.get(currentPathId) : null;
    return {
      id: currentPathId,
      label: def?.label ?? "None",
      tileTint: def?.tileTint ?? "#0f172a",
    };
  }

  function currentPathDef() {
    return currentPathId ? PATH_BY_ID.get(currentPathId) ?? null : null;
  }

  function applyDamageHooks(payload) {
    const def = currentPathDef();
    return def?.onDamage ? def.onDamage(payload) : payload;
  }
  function applyEnemyHooks(payload) {
    const def = currentPathDef();
    return def?.onEnemy ? def.onEnemy(payload) : payload;
  }
  function applyDebuffHooks(payload) {
    const def = currentPathDef();
    return def?.onDebuff ? def.onDebuff(payload) : payload;
  }

  return {
    resetRun,
    ensurePathAssignedForLevel,
    setForcedPathId,
    getPathVisualConfig,
    getCurrentPathId: () => currentPathId,
    getForcedPathId: () => forcedPathId,
    getAssignedAtLevel: () => assignedAtLevel,
    getPathDefs: () => PATH_DEFS.slice(),
    applyDamageHooks,
    applyEnemyHooks,
    applyDebuffHooks,
  };
}
