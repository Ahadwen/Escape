import { axialToWorld } from "../hexMath.js";
import { generateHexTileObstacles } from "../tiles.js";
import { REFERENCE_TILE_W } from "../balance.js";

/**
 * REFERENCE dist: `function o(h){ return { TILE_COLS:16, TILE_ROWS:Math.floor(h/35) } }`
 * (`h` = canvas height). Passed through `tileConfig` for parity with the old build.
 */
export function referenceTileGridFromCanvasHeight(canvasHeight) {
  return {
    TILE_COLS: 16,
    TILE_ROWS: Math.floor(canvasHeight / 35),
    TILE_W: REFERENCE_TILE_W,
  };
}

/**
 * Build obstacle rectangles for a fixed list of axial hexes (e.g. editor / whole-map tools).
 * The live game uses `generatedTiles.js` (REFERENCE-style sliding 7-hex window + cache).
 */

/**
 * Build obstacle rectangles for a set of axial hexes.
 * @param {{ q: number; r: number }[]} cells
 * @param {{ hexRadius: number; block: number; emptyTerrain?: boolean; safeSpawn?: { q: number; r: number } }} opts
 * @returns {{ q: number; r: number; cx: number; cy: number; obstacles: { x: number; y: number; w: number; h: number }[] }[]}
 */
export function buildHexTerrainChunks(cells, opts) {
  const { hexRadius, block, emptyTerrain = false, safeSpawn = { q: 0, r: 0 } } = opts;
  return cells.map(({ q, r }) => {
    const { x: cx, y: cy } = axialToWorld(q, r, hexRadius);
    const emptyHere = emptyTerrain || (q === safeSpawn.q && r === safeSpawn.r);
    const obstacles = generateHexTileObstacles(q, r, {
      BLOCK: block,
      centerX: cx,
      centerY: cy,
      hexSize: hexRadius,
      TILE_COLS: 0,
      TILE_ROWS: 0,
      TILE_W: 0,
      emptyTerrain: emptyHere,
    });
    return { q, r, cx, cy, obstacles };
  });
}
