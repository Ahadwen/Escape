import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let s = fs.readFileSync(path.join(__dirname, "_extracted.js"), "utf8");

s = s.replace(
  /const canvas = document\.getElementById\("game"\);\r?\nconst ctx = canvas\.getContext\("2d"\);\r?\nconst snapshotFolderButton = document\.getElementById\("snapshot-folder-button"\);\r?\nconst snapshotStatus = document\.getElementById\("snapshot-status"\);\r?\n\r?\nconst world = \{ w: canvas\.width, h: canvas\.height \};\r?\nconst VIEW_W = world\.w;\r?\nconst VIEW_H = world\.h;\r?\nconst TAU = Math\.PI \* 2;\r?\n\r?\n\/\/ Infinite-ish[\s\S]*?const HEAL_PICKUP_ARM_THICK = 6;\r?\n\r?\n/,
  ""
);

s = s.replace(/function makeRng\([\s\S]*?^function ensureTilesForPlayer/ms, "function ensureTilesForPlayer");

s = s.replace(
  /^function clamp\([\s\S]*?^function outOfBoundsCircle/ms,
  "function outOfBoundsCircle"
);

s = s.replace(/const SNIPER_ARTILLERY_WINDUP = [\d.]+;\r?\nconst SNIPER_ARTILLERY_LEAD = [\d.]+;\r?\n\r?\n/, "");

s = s.replace(/^function drawCircle\([\s\S]*?^function drawHud/ms, "function drawHud");

s = s.replace(/generateTileObstacles\((\w+)\)/g, "generateTileObstacles($1, { TILE_COLS, TILE_ROWS, TILE_W, BLOCK })");

s = s.replace(/drawCircle\(/g, "drawCircle(ctx, ");
s = s.replace(/drawHealPickup\((\w+)\)/g, "drawHealPickup(ctx, $1, state.elapsed)");
s = s.replace(/drawObstacles\(\)/g, "drawObstacles(ctx, obstacles)");

s = s.replace(/let cameraOffset = 0;\r?\nconst CAMERA_PAN_SPEED = 900;\r?\nlet lastTileIndex/, "let cameraOffset = 0;\nlet lastTileIndex");

const header = `import {
  TAU,
  TILE_W,
  BLOCK,
  CAMERA_PAN_SPEED,
  HEAL_PICKUP_HIT_R,
  HEAL_PICKUP_PLUS_HALF,
  HEAL_PICKUP_ARM_THICK,
  SNIPER_ARTILLERY_WINDUP,
  SNIPER_ARTILLERY_LEAD,
  tileGridDims,
} from "./constants.js";
import { clamp, distSq, pointToSegmentDistance, rand, intersectsRectCircle, lineIntersectsRect } from "./math.js";
import { generateTileObstacles } from "./tiles.js";
import { drawCircle, drawHealPickup, drawObstacles } from "./draw.js";

export function mountEscape({ canvas, snapshotFolderButton, snapshotStatus }) {
  const ctx = canvas.getContext("2d");
  const world = { w: canvas.width, h: canvas.height };
  const VIEW_W = world.w;
  const VIEW_H = world.h;
  const { TILE_COLS, TILE_ROWS } = tileGridDims(world.h);

`;

const footer = `
}
`;

s = header + s.trimStart() + footer;
fs.writeFileSync(path.join(__dirname, "game.js"), s);
console.log("Wrote game.js, length", s.length);
