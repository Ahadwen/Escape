export function createGeneratedTilesManager({
  worldToHex,
  hexKey,
  hexToWorld,
  HEX_DIRS,
  generateHexTileObstacles,
  tileConfig,
  tryProceduralRareSpecialHex,
  isSpecialTile,
  onTileEvicted,
  purgeProceduralSpecialAnchorsOutsideWindow,
}) {
  const tileCache = new Map();

  function clearCache() {
    tileCache.clear();
  }

  function ensureTilesForPlayer({ player, obstacles, activePlayerHex, activeHexes, lastPlayerHexKey }) {
    const center = worldToHex(player.x, player.y);
    const centerKey = hexKey(center.q, center.r);
    activePlayerHex = center;
    if (lastPlayerHexKey === centerKey && obstacles.length) {
      return { obstacles, activePlayerHex, activeHexes, lastPlayerHexKey };
    }
    lastPlayerHexKey = centerKey;

    const needed = [{ q: center.q, r: center.r }, ...HEX_DIRS.map((d) => ({ q: center.q + d.q, r: center.r + d.r }))];
    activeHexes = needed;
    for (const h of needed) {
      const key = hexKey(h.q, h.r);
      if (!tileCache.has(key)) {
        tryProceduralRareSpecialHex(h.q, h.r);
        const c = hexToWorld(h.q, h.r);
        const emptyTerrain = isSpecialTile(h.q, h.r);
        tileCache.set(
          key,
          generateHexTileObstacles(h.q, h.r, {
            ...tileConfig,
            centerX: c.x,
            centerY: c.y,
            emptyTerrain,
          })
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

  return {
    clearCache,
    ensureTilesForPlayer,
  };
}
