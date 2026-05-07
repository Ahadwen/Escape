import { makeRng } from "./rng.js";

function rotatePoints(points) {
  return points.map((p) => ({ x: p.y, y: -p.x }));
}

function normalizePoints(points) {
  let minX = Infinity;
  let minY = Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
  }
  return points.map((p) => ({ x: p.x - minX, y: p.y - minY }));
}

/** @param {number} tileIndex @param {{ TILE_COLS: number; TILE_ROWS: number; TILE_W: number; BLOCK: number }} d */
export function generateTileObstacles(tileIndex, d) {
  const { TILE_COLS, TILE_ROWS, TILE_W, BLOCK } = d;
  const rng = makeRng(tileIndex * 0x9e3779b1);
  const grid = Array.from({ length: TILE_ROWS }, () => Array(TILE_COLS).fill(false));

  const topClearRows = 3;
  const bottomClearRows = 3;
  const minRow = topClearRows;
  const maxRow = TILE_ROWS - bottomClearRows - 1;

  const tetrominoes = [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }],
    [{ x: 2, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }],
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  ];

  let filled = 0;
  const targetBlocks = 72 + Math.floor(rng() * 28);

  function stampTetrominoAtEdge(side) {
    const base = tetrominoes[Math.floor(rng() * tetrominoes.length)];
    let points = base.map((p) => ({ ...p }));
    const rotations = Math.floor(rng() * 4);
    for (let i = 0; i < rotations; i++) points = rotatePoints(points);
    points = normalizePoints(points);

    const maxX = Math.max(...points.map((p) => p.x));
    const maxY = Math.max(...points.map((p) => p.y));
    const originX = side === "left" ? 0 : TILE_COLS - (maxX + 1);
    const originYMin = minRow;
    const originYMax = maxRow - maxY;
    if (originYMax < originYMin) return;
    const originY = originYMin + Math.floor(rng() * (originYMax - originYMin + 1));

    for (const p of points) {
      const gx = originX + p.x;
      const gy = originY + p.y;
      if (gx < 0 || gx >= TILE_COLS || gy < minRow || gy > maxRow) continue;
      if (!grid[gy][gx]) {
        grid[gy][gx] = true;
        filled++;
      }
    }
  }

  stampTetrominoAtEdge("left");
  stampTetrominoAtEdge("right");

  let safety = 0;
  while (filled < targetBlocks && safety < 380) {
    safety++;
    const base = tetrominoes[Math.floor(rng() * tetrominoes.length)];
    let points = base.map((p) => ({ ...p }));
    const rotations = Math.floor(rng() * 4);
    for (let i = 0; i < rotations; i++) points = rotatePoints(points);
    points = normalizePoints(points);

    const maxX = Math.max(...points.map((p) => p.x));
    const maxY = Math.max(...points.map((p) => p.y));

    const originX = Math.floor(rng() * (TILE_COLS - (maxX + 1)));
    const originYMin = minRow;
    const originYMax = maxRow - maxY;
    if (originYMax < originYMin) continue;
    const originY = originYMin + Math.floor(rng() * (originYMax - originYMin + 1));

    let ok = true;
    for (const p of points) {
      const gx = originX + p.x;
      const gy = originY + p.y;
      if (gx < 0 || gx >= TILE_COLS || gy < minRow || gy > maxRow) {
        ok = false;
        break;
      }
      if (grid[gy][gx]) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;

    for (const p of points) {
      const gx = originX + p.x;
      const gy = originY + p.y;
      grid[gy][gx] = true;
      filled++;
    }
  }

  const verticalCorridors = [
    Math.floor(TILE_COLS * 0.2 + rng() * 2),
    Math.floor(TILE_COLS * 0.5 + rng() * 2 - 1),
    Math.floor(TILE_COLS * 0.8 + rng() * 2 - 2),
  ];
  for (const center of verticalCorridors) {
    for (let c = center - 1; c <= center + 1; c++) {
      if (c < 0 || c >= TILE_COLS) continue;
      for (let r = minRow; r <= maxRow; r++) grid[r][c] = false;
    }
  }

  const horizontalCorridors = [
    Math.floor(minRow + (maxRow - minRow) * 0.3),
    Math.floor(minRow + (maxRow - minRow) * 0.62),
  ];
  for (const center of horizontalCorridors) {
    for (let r = center; r <= center + 1; r++) {
      if (r < minRow || r > maxRow) continue;
      for (let c = 0; c < TILE_COLS; c++) grid[r][c] = false;
    }
  }

  const rects = [];
  const baseX = tileIndex * TILE_W;
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = 0; c < TILE_COLS; c++) {
      if (!grid[r][c]) continue;
      rects.push({ x: baseX + c * BLOCK, y: r * BLOCK, w: BLOCK, h: BLOCK });
    }
  }
  return rects;
}

/**
 * Pointy-top hex (vertex radius `radius`); matches `beginHexPathAt`-style winding for collision inset.
 */
function pointInPointyHex(px, py, cx, cy, radius) {
  if (radius <= 1e-6) return false;
  const x = px - cx;
  const y = py - cy;
  let sign = 0;
  for (let i = 0; i < 6; i++) {
    const a0 = -Math.PI / 2 + (Math.PI / 3) * i;
    const a1 = -Math.PI / 2 + (Math.PI / 3) * ((i + 1) % 6);
    const x0 = Math.cos(a0) * radius;
    const y0 = Math.sin(a0) * radius;
    const x1 = Math.cos(a1) * radius;
    const y1 = Math.sin(a1) * radius;
    const ex = x1 - x0;
    const ey = y1 - y0;
    const cross = ex * (y - y0) - ey * (x - x0);
    if (Math.abs(cross) < 1e-9) continue;
    const s = cross > 0 ? 1 : -1;
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return sign !== 0;
}

/** Pull pit collision slightly inward so void vs solid edges don’t stack into “invisible walls”. */
const PIT_HEX_COLLISION_INSET_PX = 7;

/**
 * Solid AABB tiles covering the hex footprint — walkable surface is gone but the cell stays impassable.
 * @param {number} q
 * @param {number} r
 * @param {{ BLOCK: number; centerX: number; centerY: number; hexSize: number }} d
 */
export function generateSolidHexCollisionRects(q, r, d) {
  const { BLOCK, centerX, centerY, hexSize } = d;
  const SQRT3 = Math.sqrt(3);
  const halfW = (SQRT3 * hexSize) / 2;
  const halfH = hexSize;
  const TILE_COLS = Math.max(8, Math.ceil((halfW * 2) / BLOCK));
  const TILE_ROWS = Math.max(8, Math.ceil((halfH * 2) / BLOCK));
  const baseX = centerX - halfW;
  const baseY = centerY - halfH;
  const minRow = 0;
  const maxRow = TILE_ROWS - 1;
  const inHex = Array.from({ length: TILE_ROWS }, () => Array(TILE_COLS).fill(false));

  function worldToHexRounded(x, y) {
    const qf = ((SQRT3 / 3) * x - (1 / 3) * y) / hexSize;
    const rf = ((2 / 3) * y) / hexSize;
    let xCube = qf;
    let zCube = rf;
    let yCube = -xCube - zCube;
    let rx = Math.round(xCube);
    let ry = Math.round(yCube);
    let rz = Math.round(zCube);
    const xDiff = Math.abs(rx - xCube);
    const yDiff = Math.abs(ry - yCube);
    const zDiff = Math.abs(rz - zCube);
    if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz;
    else if (yDiff > zDiff) ry = -rx - rz;
    else rz = -rx - ry;
    return { q: rx, r: rz };
  }

  const pitInsetR = Math.max(hexSize * 0.14, hexSize - PIT_HEX_COLLISION_INSET_PX);
  for (let row = 0; row < TILE_ROWS; row++) {
    for (let col = 0; col < TILE_COLS; col++) {
      const cx = baseX + col * BLOCK + BLOCK * 0.5;
      const cy = baseY + row * BLOCK + BLOCK * 0.5;
      const owner = worldToHexRounded(cx, cy);
      const owned = owner.q === q && owner.r === r;
      inHex[row][col] = owned && pointInPointyHex(cx, cy, centerX, centerY, pitInsetR);
    }
  }

  const rects = [];
  for (let rr = minRow; rr <= maxRow; rr++) {
    for (let c = 0; c < TILE_COLS; c++) {
      if (!inHex[rr][c]) continue;
      rects.push({ x: baseX + c * BLOCK, y: baseY + rr * BLOCK, w: BLOCK, h: BLOCK, collisionOnly: true });
    }
  }
  return rects;
}

/** @param {number} q @param {number} r @param {{ TILE_COLS: number; TILE_ROWS: number; TILE_W: number; BLOCK: number; centerX: number; centerY: number; hexSize: number; emptyTerrain?: boolean; inaccessiblePit?: boolean }} d */
export function generateHexTileObstacles(q, r, d) {
  if (d.emptyTerrain && d.inaccessiblePit) {
    return generateSolidHexCollisionRects(q, r, d);
  }
  if (d.emptyTerrain) return [];
  const { BLOCK, centerX, centerY, hexSize } = d;
  const SQRT3 = Math.sqrt(3);
  const halfW = (SQRT3 * hexSize) / 2;
  const halfH = hexSize;
  const TILE_COLS = Math.max(8, Math.ceil((halfW * 2) / BLOCK));
  const TILE_ROWS = Math.max(8, Math.ceil((halfH * 2) / BLOCK));
  const seed = ((q * 73856093) ^ (r * 19349663)) | 0;
  const rng = makeRng(seed);
  const grid = Array.from({ length: TILE_ROWS }, () => Array(TILE_COLS).fill(false));
  const inHex = Array.from({ length: TILE_ROWS }, () => Array(TILE_COLS).fill(false));

  const minRow = 0;
  const maxRow = TILE_ROWS - 1;
  const baseX = centerX - halfW;
  const baseY = centerY - halfH;

  function worldToHexRounded(x, y) {
    const qf = (SQRT3 / 3 * x - (1 / 3) * y) / hexSize;
    const rf = ((2 / 3) * y) / hexSize;
    let xCube = qf;
    let zCube = rf;
    let yCube = -xCube - zCube;
    let rx = Math.round(xCube);
    let ry = Math.round(yCube);
    let rz = Math.round(zCube);
    const xDiff = Math.abs(rx - xCube);
    const yDiff = Math.abs(ry - yCube);
    const zDiff = Math.abs(rz - zCube);
    if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz;
    else if (yDiff > zDiff) ry = -rx - rz;
    else rz = -rx - ry;
    return { q: rx, r: rz };
  }

  let maskCount = 0;
  for (let row = 0; row < TILE_ROWS; row++) {
    for (let col = 0; col < TILE_COLS; col++) {
      const cx = baseX + col * BLOCK + BLOCK * 0.5;
      const cy = baseY + row * BLOCK + BLOCK * 0.5;
      // Assign each world-space cell to exactly one hex owner to avoid overlaps/gaps on boundaries.
      const owner = worldToHexRounded(cx, cy);
      const inside = owner.q === q && owner.r === r;
      inHex[row][col] = inside;
      if (inside) maskCount++;
    }
  }

  const tetrominoes = [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }],
    [{ x: 2, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }],
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  ];

  let filled = 0;
  const targetBlocks = Math.floor(maskCount * (0.145 + rng() * 0.04));

  let safety = 0;
  while (filled < targetBlocks && safety < 620) {
    safety++;
    const base = tetrominoes[Math.floor(rng() * tetrominoes.length)];
    let points = base.map((p) => ({ ...p }));
    const rotations = Math.floor(rng() * 4);
    for (let i = 0; i < rotations; i++) points = rotatePoints(points);
    points = normalizePoints(points);

    const maxX = Math.max(...points.map((p) => p.x));
    const maxY = Math.max(...points.map((p) => p.y));
    const originX = Math.floor(rng() * Math.max(1, TILE_COLS - (maxX + 1)));
    const originYMin = minRow;
    const originYMax = maxRow - maxY;
    if (originYMax < originYMin) continue;
    const originY = originYMin + Math.floor(rng() * (originYMax - originYMin + 1));

    let ok = true;
    for (const p of points) {
      const gx = originX + p.x;
      const gy = originY + p.y;
      if (gx < 0 || gx >= TILE_COLS || gy < minRow || gy > maxRow || grid[gy][gx] || !inHex[gy][gx]) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    for (const p of points) {
      const gx = originX + p.x;
      const gy = originY + p.y;
      grid[gy][gx] = true;
      filled++;
    }
  }

  // Carve short, local lanes so chunks still feel traversable without obvious seams.
  for (let i = 0; i < 5; i++) {
    const c = Math.floor(rng() * TILE_COLS);
    const start = Math.floor(rng() * TILE_ROWS);
    const len = Math.floor(TILE_ROWS * (0.45 + rng() * 0.35));
    for (let k = 0; k < len; k++) {
      const rr = start + k;
      if (rr < 0 || rr >= TILE_ROWS) continue;
      if (inHex[rr][c]) grid[rr][c] = false;
    }
  }
  for (let i = 0; i < 5; i++) {
    const row = minRow + Math.floor(rng() * Math.max(1, maxRow - minRow + 1));
    const start = Math.floor(rng() * TILE_COLS);
    const len = Math.floor(TILE_COLS * (0.45 + rng() * 0.35));
    for (let k = 0; k < len; k++) {
      const cc = start + k;
      if (cc < 0 || cc >= TILE_COLS) continue;
      if (inHex[row][cc]) grid[row][cc] = false;
    }
  }

  const rects = [];
  for (let rr = minRow; rr <= maxRow; rr++) {
    for (let c = 0; c < TILE_COLS; c++) {
      if (!grid[rr][c] || !inHex[rr][c]) continue;
      rects.push({ x: baseX + c * BLOCK, y: baseY + rr * BLOCK, w: BLOCK, h: BLOCK });
    }
  }
  return rects;
}
