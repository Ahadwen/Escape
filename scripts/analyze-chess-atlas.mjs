/**
 * One-off: read src/assets/Chess.png, treat near-white / transparent as background
 * (flood from image edges), find foreground connected components, sort into reading order.
 *
 * Usage: node scripts/analyze-chess-atlas.mjs [path/to/Chess.png]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultPng = path.join(__dirname, "../src/assets/Chess.png");
const pngPath = process.argv[2] || defaultPng;

const buf = fs.readFileSync(pngPath);
const png = PNG.sync.read(buf);
const { width: w, height: h, data } = png;

function isBg(x, y) {
  const i = (y * w + x) * 4;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];
  if (a < 26) return true;
  // light sheet / margins (tune if pieces clip)
  return r > 232 && g > 232 && b > 232;
}

const outside = new Uint8Array(w * h);
const qx = new Int32Array(w * h);
const qy = new Int32Array(w * h);
let qt = 0;
function tryPush(x, y) {
  if (x < 0 || x >= w || y < 0 || y >= h) return;
  const p = y * w + x;
  if (outside[p]) return;
  if (!isBg(x, y)) return;
  outside[p] = 1;
  qx[qt] = x;
  qy[qt] = y;
  qt++;
}

for (let x = 0; x < w; x++) {
  tryPush(x, 0);
  tryPush(x, h - 1);
}
for (let y = 0; y < h; y++) {
  tryPush(0, y);
  tryPush(w - 1, y);
}

for (let qh = 0; qh < qt; qh++) {
  const x = qx[qh];
  const y = qy[qh];
  tryPush(x + 1, y);
  tryPush(x - 1, y);
  tryPush(x, y + 1);
  tryPush(x, y - 1);
}

const labels = new Int32Array(w * h);
let nextLabel = 0;
const boxes = [];

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const p = y * w + x;
    if (outside[p] || labels[p] !== 0) continue;

    nextLabel++;
    const lab = nextLabel;
    let minX = x;
    let maxX = x;
    let minY = y;
    let maxY = y;
    let count = 0;

    let t = 0;
    qx[t] = x;
    qy[t] = y;
    t++;
    labels[p] = lab;

    for (let qi = 0; qi < t; qi++) {
      const cx = qx[qi];
      const cy = qy[qi];
      count++;
      if (cx < minX) minX = cx;
      if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy;
      if (cy > maxY) maxY = cy;

      const nbs = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1],
      ];
      for (const [nx, ny] of nbs) {
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const np = ny * w + nx;
        if (outside[np] || labels[np] !== 0) continue;
        labels[np] = lab;
        qx[t] = nx;
        qy[t] = ny;
        t++;
      }
    }

    if (count < 800) continue;
    const cx = (minX + maxX) * 0.5;
    const cy = (minY + maxY) * 0.5;
    boxes.push({
      lab,
      minX,
      maxX,
      minY,
      maxY,
      count,
      cx,
      cy,
      sx: minX,
      sy: minY,
      sw: maxX - minX + 1,
      sh: maxY - minY + 1,
    });
  }
}

boxes.sort((a, b) => b.count - a.count);
const top6 = boxes.slice(0, 6);
const sortedY = [...top6].sort((a, b) => a.cy - b.cy);
const row0 = sortedY.slice(0, 3).sort((a, b) => a.cx - b.cx);
const row1 = sortedY.slice(3, 6).sort((a, b) => a.cx - b.cx);
const ordered = [...row0, ...row1];

const names = ["hallsKing", "hallsQueen", "hallsRook", "hallsBishop", "hallsKnight", "hallsPawn"];

console.log(`Image: ${pngPath}`);
console.log(`Size: ${w} × ${h}`);
console.log(`Foreground blobs (area ≥ 800): ${boxes.length}, using largest ${top6.length}\n`);

if (boxes.length < 6) {
  console.warn("Expected ≥6 coins; try lowering min area or adjusting isBg() white threshold.");
}

ordered.forEach((b, i) => {
  const name = names[i] ?? `extra_${i}`;
  console.log(`${name}: sx=${b.sx} sy=${b.sy} sw=${b.sw} sh=${b.sh} (area=${b.count}, cx≈${b.cx.toFixed(1)})`);
});

if (ordered.length >= 2) {
  const r0 = ordered.slice(0, 3);
  const r1 = ordered.slice(3, 6);
  if (r0.length) {
    const g1 = r0.length > 1 ? r0[1].sx - (r0[0].sx + r0[0].sw) : null;
    console.log("\n--- inferred row 0 (king/queen/rook) ---");
    console.log(`first left px: ${Math.min(...r0.map((r) => r.sx))}`);
    if (g1 != null) console.log(`gap after col0 (edge to edge): ${g1}`);
    console.log(`coin width samples: ${r0.map((r) => r.sw).join(", ")}`);
  }
  if (r0.length && r1.length) {
    const topY = Math.min(...r0.map((r) => r.sy));
    const botY = Math.min(...r1.map((r) => r.sy));
    const gapY = botY - Math.max(...r0.map((r) => r.sy + r.sh));
    console.log("\n--- inferred vertical ---");
    console.log(`row0 top: ${topY}, row1 top: ${botY}, gap (row0 bottom to row1 top): ${gapY}`);
  }
}

console.log("\n--- suggested hallsLogic (if uniform square D; else use per-piece rects) ---");
if (ordered.length === 6) {
  const sws = ordered.map((b) => b.sw);
  const shs = ordered.map((b) => b.sh);
  const d = Math.round(Math.max(...sws, ...shs));
  const firstLeft = Math.min(ordered[0].sx, ordered[3].sx);
  const firstTop = Math.min(ordered[0].sy, ordered[1].sy, ordered[2].sy);
  const colGap = ordered[1].sx - (ordered[0].sx + ordered[0].sw);
  const rowGap = ordered[3].sy - (ordered[0].sy + ordered[0].sh);
  console.log(`HALLS_CHESS_ATLAS_CELL_D_PX = ${d}`);
  console.log(`HALLS_CHESS_ATLAS_FIRST_COL_LEFT_PX = ${firstLeft}`);
  console.log(`HALLS_CHESS_ATLAS_COL_GAP_PX = ${colGap}`);
  console.log(`HALLS_CHESS_ATLAS_FIRST_ROW_TOP_PX = ${firstTop}`);
  console.log(`HALLS_CHESS_ATLAS_ROW_GAP_PX = ${rowGap}`);
}
