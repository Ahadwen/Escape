import {
  SPECIAL_PROCEDURAL_DENOM_MIN,
  SPECIAL_PROCEDURAL_DENOM_START,
  SPECIAL_PROCEDURAL_GRACE_SEC,
  SPECIAL_PROCEDURAL_POST_DESPAWN_LOCK_SEC,
  SPECIAL_PROCEDURAL_RAMP_STEP_SEC,
  SAFEHOUSE_PROC_MIN_SIM_LEVEL_3_4_SEC,
  SAFEHOUSE_PROC_EARLY_CAP_RUNLEVEL_LO,
  SAFEHOUSE_PROC_EARLY_CAP_RUNLEVEL_HI,
} from "../balance.js";

/**
 * @param {number} sim
 * @param {number} rampBaseSim
 */
function proceduralSpecialDenominator(sim, rampBaseSim) {
  const elapsed = sim - rampBaseSim;
  if (elapsed < 0) return SPECIAL_PROCEDURAL_DENOM_START;
  const steps = Math.floor(elapsed / SPECIAL_PROCEDURAL_RAMP_STEP_SEC);
  return Math.max(SPECIAL_PROCEDURAL_DENOM_MIN, SPECIAL_PROCEDURAL_DENOM_START - steps);
}

/**
 * Tracks roulette / forge / arena / surge / safehouse anchors (procedural rare spawns + dev west test hex),
 * spent flags, and hooks for generated tile cache lifecycle.
 *
 * @param {() => boolean} [getShouldSuppressProceduralEventHexSpawns] — when true, `tryProceduralRareSpecialHex` is a no-op
 * (existing anchors / west-test / spent flags unchanged — e.g. Depths boss tier keeps the run-start sanctuary only).
 */
export function createSpecialHexRuntime({
  HEX_DIRS,
  hexKey,
  getIsLunatic = () => false,
  getSimElapsed = () => 0,
  getRunLevel = () => 0,
  getShouldSuppressProceduralEventHexSpawns = () => false,
}) {
  const west = HEX_DIRS[3];
  const westTestQ = west.q;
  const westTestR = west.r;

  /** @type {Set<string>} */
  const proceduralRoulette = new Set();
  /** @type {Set<string>} */
  const proceduralForge = new Set();
  /** @type {Set<string>} */
  const proceduralArena = new Set();
  /** @type {Set<string>} */
  const proceduralSurge = new Set();
  /** @type {Set<string>} */
  const proceduralSafehouse = new Set();
  /** @type {Set<string>} */
  const rouletteSpent = new Set();
  /** @type {Set<string>} */
  const forgeSpent = new Set();
  /** @type {Set<string>} */
  const arenaSpent = new Set();
  /** @type {Set<string>} */
  const surgeSpent = new Set();
  /** @type {Set<string>} */
  const safehouseSpent = new Set();

  /** @type {'na' | 'roulette' | 'forge' | 'arena' | 'surge' | 'safehouse' | string} */
  let testWestKind = "na";

  /** @type {null | (() => void)} */
  let onProceduralSafehousePlaced = null;

  /** Sim time when quartet (arena / roulette / surge / forge) ramp last reset (starts at grace so first roll uses `1/30`). */
  let quadRampBaseSim = SPECIAL_PROCEDURAL_GRACE_SEC;
  /** Independent safehouse ramp base (same rule as quartet). */
  let safeRampBaseSim = SPECIAL_PROCEDURAL_GRACE_SEC;
  /** No new procedural specials until `sim >=` this value (set when an active procedural tile despawns). */
  let spawnLockUntilSim = 0;

  function bumpProceduralSpecialDespawnLock() {
    const t = getSimElapsed();
    spawnLockUntilSim = Math.max(spawnLockUntilSim, t + SPECIAL_PROCEDURAL_POST_DESPAWN_LOCK_SEC);
  }

  function setOnProceduralSafehousePlaced(fn) {
    onProceduralSafehousePlaced = typeof fn === "function" ? fn : null;
  }

  function parseWestKind(raw) {
    const v = String(raw || "").trim();
    if (v === "roulette" || v === "forge" || v === "arena" || v === "surge" || v === "safehouse") return v;
    return "na";
  }

  function setTestWestKind(raw) {
    testWestKind = parseWestKind(raw);
  }

  function key(q, r) {
    return hexKey(q, r);
  }

  function isSpawnHex(q, r) {
    return q === 0 && r === 0;
  }

  function isWestTestHex(q, r) {
    return q === westTestQ && r === westTestR;
  }

  function westVisualKind() {
    if (testWestKind === "roulette") return "roulette";
    if (testWestKind === "forge") return "forge";
    if (testWestKind === "arena") return "arena";
    if (testWestKind === "surge") return "surge";
    if (testWestKind === "safehouse") return "safehouse";
    return null;
  }

  /** Procedural safehouse only (not quartet specials). */
  function isProceduralSafehouseEarlyCapBlocked(simNow) {
    const lv = getRunLevel();
    if (lv < SAFEHOUSE_PROC_EARLY_CAP_RUNLEVEL_LO || lv > SAFEHOUSE_PROC_EARLY_CAP_RUNLEVEL_HI) return false;
    return simNow < SAFEHOUSE_PROC_MIN_SIM_LEVEL_3_4_SEC;
  }

  function tryProceduralRareSpecialHex(q, r) {
    if (getShouldSuppressProceduralEventHexSpawns()) return;
    if (isSpawnHex(q, r)) return;
    if (isWestTestHex(q, r)) return;
    const k = key(q, r);
    if (
      proceduralRoulette.has(k) ||
      proceduralForge.has(k) ||
      proceduralArena.has(k) ||
      proceduralSurge.has(k) ||
      proceduralSafehouse.has(k) ||
      safehouseSpent.has(k)
    ) {
      return;
    }
    const activeSpecials =
      proceduralRoulette.size +
      proceduralForge.size +
      proceduralArena.size +
      proceduralSurge.size +
      proceduralSafehouse.size;
    if (activeSpecials >= 1) return;

    const sim = getSimElapsed();
    if (sim < SPECIAL_PROCEDURAL_GRACE_SEC) return;
    if (sim < spawnLockUntilSim) return;
    // Block touching any special-touched cell (active, spent, or dev west) so e.g. safehouse
    // cannot appear adjacent the moment an arena becomes "spent" and leaves procedural sets.
    for (const d of HEX_DIRS) {
      if (getVisualKind(q + d.q, r + d.r) !== null) return;
    }

    rouletteSpent.delete(k);
    forgeSpent.delete(k);
    arenaSpent.delete(k);
    surgeSpent.delete(k);
    safehouseSpent.delete(k);

    if (getIsLunatic()) {
      const dSafe = proceduralSpecialDenominator(sim, safeRampBaseSim);
      if (Math.random() >= 1 / dSafe) return;
      if (isProceduralSafehouseEarlyCapBlocked(sim)) return;
      proceduralSafehouse.add(k);
      onProceduralSafehousePlaced?.();
      safeRampBaseSim = sim;
      return;
    }

    const dQuad = proceduralSpecialDenominator(sim, quadRampBaseSim);
    if (Math.random() < 1 / dQuad) {
      const kindRoll = Math.random();
      const kind =
        kindRoll < 0.25 ? "arena" : kindRoll < 0.5 ? "roulette" : kindRoll < 0.75 ? "surge" : "forge";
      if (kind === "arena") proceduralArena.add(k);
      else if (kind === "roulette") proceduralRoulette.add(k);
      else if (kind === "surge") proceduralSurge.add(k);
      else proceduralForge.add(k);
      quadRampBaseSim = sim;
      return;
    }

    const dSafe = proceduralSpecialDenominator(sim, safeRampBaseSim);
    if (Math.random() >= 1 / dSafe) return;
    if (isProceduralSafehouseEarlyCapBlocked(sim)) return;
    proceduralSafehouse.add(k);
    onProceduralSafehousePlaced?.();
    safeRampBaseSim = sim;
  }

  function purgeProceduralSpecialAnchorsOutsideWindow(neededKeys) {
    for (const s of proceduralRoulette) {
      if (!neededKeys.has(s) && proceduralRoulette.delete(s)) bumpProceduralSpecialDespawnLock();
    }
    for (const s of proceduralForge) {
      if (!neededKeys.has(s) && proceduralForge.delete(s)) bumpProceduralSpecialDespawnLock();
    }
    for (const s of proceduralArena) {
      if (!neededKeys.has(s) && proceduralArena.delete(s)) bumpProceduralSpecialDespawnLock();
    }
    for (const s of proceduralSurge) {
      if (!neededKeys.has(s) && proceduralSurge.delete(s)) bumpProceduralSpecialDespawnLock();
    }
    for (const s of proceduralSafehouse) {
      if (!neededKeys.has(s) && proceduralSafehouse.delete(s)) bumpProceduralSpecialDespawnLock();
    }
    for (const s of rouletteSpent) {
      if (!neededKeys.has(s)) rouletteSpent.delete(s);
    }
    for (const s of forgeSpent) {
      if (!neededKeys.has(s)) forgeSpent.delete(s);
    }
    for (const s of arenaSpent) {
      if (!neededKeys.has(s)) arenaSpent.delete(s);
    }
    for (const s of surgeSpent) {
      if (!neededKeys.has(s)) surgeSpent.delete(s);
    }
    for (const s of safehouseSpent) {
      if (!neededKeys.has(s)) safehouseSpent.delete(s);
    }
  }

  function onTileEvicted(cacheKey) {
    let removedActive = false;
    if (proceduralRoulette.delete(cacheKey)) removedActive = true;
    if (proceduralForge.delete(cacheKey)) removedActive = true;
    if (proceduralArena.delete(cacheKey)) removedActive = true;
    if (proceduralSurge.delete(cacheKey)) removedActive = true;
    if (proceduralSafehouse.delete(cacheKey)) removedActive = true;
    if (removedActive) bumpProceduralSpecialDespawnLock();
    rouletteSpent.delete(cacheKey);
    forgeSpent.delete(cacheKey);
    arenaSpent.delete(cacheKey);
    surgeSpent.delete(cacheKey);
    safehouseSpent.delete(cacheKey);
  }

  function getVisualKind(q, r) {
    if (isSpawnHex(q, r)) return null;
    const k = key(q, r);
    if (isWestTestHex(q, r)) {
      const w = westVisualKind();
      if (w) return w;
    }
    if (proceduralRoulette.has(k) || rouletteSpent.has(k)) return "roulette";
    if (proceduralForge.has(k) || forgeSpent.has(k)) return "forge";
    if (proceduralArena.has(k) || arenaSpent.has(k)) return "arena";
    if (proceduralSurge.has(k) || surgeSpent.has(k)) return "surge";
    if (proceduralSafehouse.has(k) || safehouseSpent.has(k)) return "safehouse";
    return null;
  }

  function isRouletteHexTile(q, r) {
    const k = key(q, r);
    if (proceduralRoulette.has(k) || rouletteSpent.has(k)) return true;
    if (isWestTestHex(q, r) && testWestKind === "roulette") return true;
    return false;
  }

  function isRouletteHexInteractive(q, r) {
    const k = key(q, r);
    if (proceduralRoulette.has(k)) return true;
    if (isWestTestHex(q, r) && testWestKind === "roulette") return true;
    return false;
  }

  function markProceduralRouletteHexSpent(q, r) {
    const k = key(q, r);
    if (!proceduralRoulette.has(k)) return;
    proceduralRoulette.delete(k);
    rouletteSpent.add(k);
    bumpProceduralSpecialDespawnLock();
  }

  function isForgeHexTile(q, r) {
    const k = key(q, r);
    if (proceduralForge.has(k) || forgeSpent.has(k)) return true;
    if (isWestTestHex(q, r) && testWestKind === "forge") return true;
    return false;
  }

  function isForgeHexInteractive(q, r) {
    const k = key(q, r);
    if (proceduralForge.has(k)) return true;
    if (isWestTestHex(q, r) && testWestKind === "forge") return true;
    return false;
  }

  function markProceduralForgeHexSpent(q, r) {
    const k = key(q, r);
    if (!proceduralForge.has(k)) return;
    proceduralForge.delete(k);
    forgeSpent.add(k);
    bumpProceduralSpecialDespawnLock();
  }

  function isArenaHexTile(q, r) {
    const k = key(q, r);
    if (proceduralArena.has(k) || arenaSpent.has(k)) return true;
    if (isWestTestHex(q, r) && testWestKind === "arena") return true;
    return false;
  }

  function isArenaHexInteractive(q, r) {
    const k = key(q, r);
    if (proceduralArena.has(k)) return true;
    if (isWestTestHex(q, r) && testWestKind === "arena") return true;
    return false;
  }

  function markProceduralArenaHexSpent(q, r) {
    const k = key(q, r);
    if (!proceduralArena.has(k)) return;
    proceduralArena.delete(k);
    arenaSpent.add(k);
    bumpProceduralSpecialDespawnLock();
  }

  function isSurgeHexTile(q, r) {
    const k = key(q, r);
    if (proceduralSurge.has(k) || surgeSpent.has(k)) return true;
    if (isWestTestHex(q, r) && testWestKind === "surge") return true;
    return false;
  }

  function isSurgeHexInteractive(q, r) {
    const k = key(q, r);
    if (proceduralSurge.has(k)) return true;
    if (isWestTestHex(q, r) && testWestKind === "surge") return true;
    return false;
  }

  function markProceduralSurgeHexSpent(q, r) {
    const k = key(q, r);
    if (!proceduralSurge.has(k)) return;
    proceduralSurge.delete(k);
    surgeSpent.add(k);
    bumpProceduralSpecialDespawnLock();
  }

  function isSafehouseHexActiveTile(q, r) {
    const k = key(q, r);
    if (safehouseSpent.has(k)) return false;
    if (proceduralSafehouse.has(k)) return true;
    if (isWestTestHex(q, r) && testWestKind === "safehouse") return true;
    return false;
  }

  function isSafehouseHexSpentTile(q, r) {
    return safehouseSpent.has(key(q, r));
  }

  function isSafehouseHexTile(q, r) {
    return isSafehouseHexActiveTile(q, r) || isSafehouseHexSpentTile(q, r);
  }

  function getPrimarySafehouseAxial() {
    if (isWestTestHex(westTestQ, westTestR) && testWestKind === "safehouse") {
      const k = key(westTestQ, westTestR);
      if (!safehouseSpent.has(k)) return { q: westTestQ, r: westTestR };
    }
    for (const k of proceduralSafehouse) {
      const [q, r] = k.split(",").map(Number);
      return { q, r };
    }
    return null;
  }

  /** Active + spent + dev west sanctuary centers (for hunter barrier clamp). */
  function forEachSafehouseBarrierHex(cb) {
    for (const k of proceduralSafehouse) {
      const [q, r] = k.split(",").map(Number);
      if (Number.isFinite(q) && Number.isFinite(r)) cb(q, r);
    }
    for (const k of safehouseSpent) {
      const [q, r] = k.split(",").map(Number);
      if (Number.isFinite(q) && Number.isFinite(r)) cb(q, r);
    }
    if (testWestKind === "safehouse") cb(westTestQ, westTestR);
  }

  function markProceduralSafehouseHexSpent(q, r) {
    const k = key(q, r);
    const isDev = isWestTestHex(q, r) && testWestKind === "safehouse";
    if (proceduralSafehouse.has(k)) {
      proceduralSafehouse.delete(k);
      safehouseSpent.add(k);
      bumpProceduralSpecialDespawnLock();
    } else if (isDev) {
      safehouseSpent.add(k);
      bumpProceduralSpecialDespawnLock();
    } else {
      return;
    }
  }

  function isSpecialTile(q, r) {
    if (isSpawnHex(q, r)) return true;
    const kind = getVisualKind(q, r);
    return (
      kind === "roulette" || kind === "forge" || kind === "arena" || kind === "surge" || kind === "safehouse"
    );
  }

  function resetSessionState() {
    proceduralRoulette.clear();
    proceduralForge.clear();
    proceduralArena.clear();
    proceduralSurge.clear();
    proceduralSafehouse.clear();
    rouletteSpent.clear();
    forgeSpent.clear();
    arenaSpent.clear();
    surgeSpent.clear();
    safehouseSpent.clear();
    quadRampBaseSim = SPECIAL_PROCEDURAL_GRACE_SEC;
    safeRampBaseSim = SPECIAL_PROCEDURAL_GRACE_SEC;
    spawnLockUntilSim = 0;
  }

  return {
    westTestQ,
    westTestR,
    setTestWestKind,
    setOnProceduralSafehousePlaced,
    tryProceduralRareSpecialHex,
    purgeProceduralSpecialAnchorsOutsideWindow,
    onTileEvicted,
    getVisualKind,
    isSpecialTile,
    isRouletteHexTile,
    isRouletteHexInteractive,
    markProceduralRouletteHexSpent,
    isForgeHexTile,
    isForgeHexInteractive,
    markProceduralForgeHexSpent,
    isRouletteSpent: (q, r) => rouletteSpent.has(key(q, r)),
    isForgeSpent: (q, r) => forgeSpent.has(key(q, r)),
    isArenaHexTile,
    isArenaHexInteractive,
    isArenaSpent: (q, r) => arenaSpent.has(key(q, r)),
    markProceduralArenaHexSpent,
    isSurgeHexTile,
    isSurgeHexInteractive,
    isSurgeSpent: (q, r) => surgeSpent.has(key(q, r)),
    markProceduralSurgeHexSpent,
    isSafehouseHexTile,
    isSafehouseHexActiveTile,
    isSafehouseHexSpentTile,
    getPrimarySafehouseAxial,
    markProceduralSafehouseHexSpent,
    forEachSafehouseBarrierHex,
    resetSessionState,
  };
}
