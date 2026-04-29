/**
 * Run path runtime.
 * Activates from level 2 onward in normal play; debug can force selection.
 * Path-specific logic is sourced from `map/path/*`.
 */

import { BONE_PATH_DEF } from "../map/path/bone.js";
import { FIRE_PATH_DEF } from "../map/path/fire.js";
import { SWAMP_PATH_DEF } from "../map/path/swamp.js";

/** @typedef {"bone" | "fire" | "swamp"} PathId */

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
export const PATH_DEFS = [BONE_PATH_DEF, FIRE_PATH_DEF, SWAMP_PATH_DEF];

const PATH_BY_ID = new Map(PATH_DEFS.map((d) => [d.id, d]));

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

  function pickRandomPathId() {
    const i = Math.max(0, Math.min(PATH_DEFS.length - 1, Math.floor(rng() * PATH_DEFS.length)));
    return PATH_DEFS[i].id;
  }

  /**
   * Assigns random path once when run reaches level 2+.
   * @param {number} runLevel zero-based (display level = runLevel + 1)
   * @returns {PathId | null}
   */
  function ensurePathAssignedForLevel(runLevel) {
    if (forcedPathId) {
      currentPathId = forcedPathId;
      assignedAtLevel = Math.max(1, runLevel);
      return currentPathId;
    }
    if (runLevel < 1) return currentPathId;
    if (!currentPathId) {
      currentPathId = pickRandomPathId();
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

  // Extension hooks delegated to active path module (currently no-op stubs).
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
