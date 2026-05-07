/**
 * Sliding hex window + obstacle cache (ported from REFERENCE `map/generatedTiles.js`).
 * Keeps the player’s hex plus its six neighbors generated and cached; evicts the rest.
 */
export function createGeneratedTilesManager({
  worldToHex,
  hexKey,
  hexToWorld,
  HEX_DIRS,
  generateHexTileObstacles,
  tileConfig,
  tryProceduralRareSpecialHex = () => {},
  isSpecialTile = () => false,
  onTileEvicted = () => {},
  purgeProceduralSpecialAnchorsOutsideWindow = () => {},
}) {
  const tileCache = new Map();
  /** Hex keys whose floor was voided (pit); survives until `clearCache` (run / path reset). */
  const voidedGroundKeys = new Set();
  /** Axial `r` values whose entire horizontal row is collapsed (halls boss); new tiles at that r spawn as pits. */
  const voidedRowR = new Set();
  /** Hex keys on a voided row that stay solid until a northward step (sideways row collapse spare). */
  const sparedRowGroundKeys = new Set();

  function clearCache() {
    voidedGroundKeys.clear();
    voidedRowR.clear();
    sparedRowGroundKeys.clear();
    tileCache.clear();
  }

  function ensureTilesForPlayer({ player, obstacles, activePlayerHex, activeHexes, lastPlayerHexKey }) {
    const center = worldToHex(player.x, player.y);
    const centerKey = hexKey(center.q, center.r);
    activePlayerHex = center;
    const needed = [{ q: center.q, r: center.r }, ...HEX_DIRS.map((d) => ({ q: center.q + d.q, r: center.r + d.r }))];

    let rowReconciled = false;
    for (const h of needed) {
      const key = hexKey(h.q, h.r);
      const special = isSpecialTile(h.q, h.r);
      if (!voidedRowR.has(h.r) || special || sparedRowGroundKeys.has(key) || !tileCache.has(key)) continue;
      const chunk = tileCache.get(key);
      const alreadyRowPit =
        chunk &&
        chunk.length > 0 &&
        chunk.every((o) => o.collisionOnly === true);
      if (!alreadyRowPit) {
        voidHexTerrain(h.q, h.r, { inaccessiblePit: true });
        rowReconciled = true;
      }
    }

    if (lastPlayerHexKey === centerKey && obstacles.length && !rowReconciled) {
      return { obstacles, activePlayerHex, activeHexes, lastPlayerHexKey };
    }
    lastPlayerHexKey = centerKey;
    activeHexes = needed;

    for (const h of needed) {
      const key = hexKey(h.q, h.r);
      if (!tileCache.has(key)) {
        // Roll as tiles are generated, but never on the player's current center tile (keeps warning visible before entry).
        if (h.q !== center.q || h.r !== center.r) tryProceduralRareSpecialHex(h.q, h.r);
        const c = hexToWorld(h.q, h.r);
        const special = isSpecialTile(h.q, h.r);
        const rowVoid = voidedRowR.has(h.r) && !sparedRowGroundKeys.has(key);
        const emptyTerrain = special || rowVoid;
        tileCache.set(
          key,
          generateHexTileObstacles(h.q, h.r, {
            ...tileConfig,
            centerX: c.x,
            centerY: c.y,
            emptyTerrain,
            inaccessiblePit: rowVoid && !special,
          }),
        );
      }
    }

    const neededKeys = new Set(needed.map((h) => hexKey(h.q, h.r)));
    for (const key of Array.from(tileCache.keys())) {
      if (!neededKeys.has(key)) {
        onTileEvicted(key);
        tileCache.delete(key);
      }
    }
    purgeProceduralSpecialAnchorsOutsideWindow(neededKeys);

    obstacles = [];
    for (const h of needed) {
      obstacles = obstacles.concat(tileCache.get(hexKey(h.q, h.r)));
    }
    return { obstacles, activePlayerHex, activeHexes, lastPlayerHexKey };
  }

  /**
   * Replace cached obstacles for one hex with empty terrain (e.g. depths whirlpool).
   * @param {{ inaccessiblePit?: boolean }} [opts] — if true, full hex collision so nothing can stand on the void (halls pit).
   */
  function voidHexTerrain(q, r, opts = {}) {
    const key = hexKey(q, r);
    voidedGroundKeys.add(key);
    const c = hexToWorld(q, r);
    tileCache.set(
      key,
      generateHexTileObstacles(q, r, {
        ...tileConfig,
        centerX: c.x,
        centerY: c.y,
        emptyTerrain: true,
        inaccessiblePit: !!opts.inaccessiblePit,
      }),
    );
  }

  /**
   * Collapse every cached hex on axial row `r` (screen-horizontal band for pointy-top), and remember `r`
   * so newly generated tiles on that row become pits. Skips special tiles.
   * @returns {{ q: number; r: number }[]} hexes voided from cache (for VFX)
   */
  function voidRowAtR(r, opts = {}) {
    voidedRowR.add(r);
    for (const k of Array.from(sparedRowGroundKeys)) {
      const pr = Number(k.split(",")[1]);
      if (pr === r) sparedRowGroundKeys.delete(k);
    }
    const voided = [];
    for (const key of Array.from(tileCache.keys())) {
      const parts = key.split(",").map(Number);
      const rq = parts[0];
      const rr = parts[1];
      if (rr !== r) continue;
      if (isSpecialTile(rq, rr)) continue;
      voidHexTerrain(rq, rr, opts);
      voided.push({ q: rq, r: rr });
    }
    return voided;
  }

  /**
   * Like `voidRowAtR`, but leaves `spareQ,spareR` solid if it lies on row `r` (non-special) until a north leave.
   * @returns {{ q: number; r: number }[]} hexes voided from cache (for VFX)
   */
  function voidRowAtRExcept(r, spareQ, spareR, opts = {}) {
    voidedRowR.add(r);
    for (const k of Array.from(sparedRowGroundKeys)) {
      const pr = Number(k.split(",")[1]);
      if (pr === r) sparedRowGroundKeys.delete(k);
    }
    const spareOnRow = spareR === r && !isSpecialTile(spareQ, spareR);
    if (spareOnRow) sparedRowGroundKeys.add(hexKey(spareQ, spareR));
    const voided = [];
    for (const key of Array.from(tileCache.keys())) {
      const parts = key.split(",").map(Number);
      const rq = parts[0];
      const rr = parts[1];
      if (rr !== r) continue;
      if (isSpecialTile(rq, rr)) continue;
      if (spareOnRow && rq === spareQ && rr === spareR) continue;
      voidHexTerrain(rq, rr, opts);
      voided.push({ q: rq, r: rr });
    }
    return voided;
  }

  /**
   * When the player steps north off a spared row tile, void it and clear spare tracking.
   * @returns {boolean} true if a spared hex was finalized
   */
  function finalizeSparedHallsRowHex(q, r) {
    const k = hexKey(q, r);
    if (!sparedRowGroundKeys.has(k)) return false;
    sparedRowGroundKeys.delete(k);
    voidHexTerrain(q, r, { inaccessiblePit: true });
    return true;
  }

  function getHexObstacleCount(q, r) {
    const chunk = tileCache.get(hexKey(q, r));
    return chunk ? chunk.length : 0;
  }

  function isHexGroundVoided(q, r) {
    const k = hexKey(q, r);
    if (voidedGroundKeys.has(k)) return true;
    if (sparedRowGroundKeys.has(k)) return false;
    return voidedRowR.has(r) && !isSpecialTile(q, r);
  }

  /** Rebuild flat `obstacles` from the sliding window without changing cache keys (after `voidHexTerrain`). */
  function rebuildObstaclesFromActiveHexes(activeHexes) {
    let out = [];
    for (const h of activeHexes) {
      const chunk = tileCache.get(hexKey(h.q, h.r));
      if (chunk && chunk.length) out = out.concat(chunk);
    }
    return out;
  }

  return {
    clearCache,
    ensureTilesForPlayer,
    voidHexTerrain,
    voidRowAtR,
    voidRowAtRExcept,
    finalizeSparedHallsRowHex,
    getHexObstacleCount,
    isHexGroundVoided,
    rebuildObstaclesFromActiveHexes,
  };
}
