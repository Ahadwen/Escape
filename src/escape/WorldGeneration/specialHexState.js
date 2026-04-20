import { SPECIAL_HEX_PROCEDURAL_CHANCE } from "../balance.js";

/**
 * Tracks roulette / forge anchors (procedural rare spawns + dev west test hex),
 * spent flags, and hooks for generated tile cache lifecycle.
 */
export function createSpecialHexRuntime({ HEX_DIRS, hexKey }) {
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
  const rouletteSpent = new Set();
  /** @type {Set<string>} */
  const forgeSpent = new Set();
  /** @type {Set<string>} */
  const arenaSpent = new Set();
  /** @type {Set<string>} */
  const surgeSpent = new Set();

  /** @type {'na' | 'roulette' | 'forge' | 'arena' | 'surge' | string} */
  let testWestKind = "na";

  function parseWestKind(raw) {
    const v = String(raw || "").trim();
    if (v === "roulette" || v === "forge" || v === "arena" || v === "surge") return v;
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
    return null;
  }

  function tryProceduralRareSpecialHex(q, r) {
    if (isSpawnHex(q, r)) return;
    if (isWestTestHex(q, r) && westVisualKind()) return;
    const k = key(q, r);
    if (
      proceduralRoulette.has(k) ||
      proceduralForge.has(k) ||
      proceduralArena.has(k) ||
      proceduralSurge.has(k)
    ) {
      return;
    }
    const activeSpecials =
      proceduralRoulette.size + proceduralForge.size + proceduralArena.size + proceduralSurge.size;
    if (activeSpecials >= 1) return;
    if (Math.random() >= SPECIAL_HEX_PROCEDURAL_CHANCE) return;
    rouletteSpent.delete(k);
    forgeSpent.delete(k);
    arenaSpent.delete(k);
    surgeSpent.delete(k);
    const roll = Math.random();
    if (roll < 0.25) proceduralArena.add(k);
    else if (roll < 0.5) proceduralRoulette.add(k);
    else if (roll < 0.75) proceduralSurge.add(k);
    else proceduralForge.add(k);
  }

  function purgeProceduralSpecialAnchorsOutsideWindow(neededKeys) {
    for (const s of proceduralRoulette) {
      if (!neededKeys.has(s)) proceduralRoulette.delete(s);
    }
    for (const s of proceduralForge) {
      if (!neededKeys.has(s)) proceduralForge.delete(s);
    }
    for (const s of proceduralArena) {
      if (!neededKeys.has(s)) proceduralArena.delete(s);
    }
    for (const s of proceduralSurge) {
      if (!neededKeys.has(s)) proceduralSurge.delete(s);
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
  }

  function onTileEvicted(cacheKey) {
    proceduralRoulette.delete(cacheKey);
    proceduralForge.delete(cacheKey);
    proceduralArena.delete(cacheKey);
    proceduralSurge.delete(cacheKey);
    rouletteSpent.delete(cacheKey);
    forgeSpent.delete(cacheKey);
    arenaSpent.delete(cacheKey);
    surgeSpent.delete(cacheKey);
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
  }

  function isSpecialTile(q, r) {
    if (isSpawnHex(q, r)) return true;
    const kind = getVisualKind(q, r);
    return kind === "roulette" || kind === "forge" || kind === "arena" || kind === "surge";
  }

  function resetSessionState() {
    proceduralRoulette.clear();
    proceduralForge.clear();
    proceduralArena.clear();
    proceduralSurge.clear();
    rouletteSpent.clear();
    forgeSpent.clear();
    arenaSpent.clear();
    surgeSpent.clear();
  }

  return {
    westTestQ,
    westTestR,
    setTestWestKind,
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
    resetSessionState,
  };
}
