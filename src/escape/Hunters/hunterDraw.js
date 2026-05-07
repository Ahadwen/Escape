import { TAU } from "../constants.js";
import { clamp } from "./hunterGeometry.js";
import {
  ELDRITCH_BLOOD_BETWEEN_PHASE_INTERLUDE_SEC,
  ELDRITCH_BLOOD_PHASE3_END_FLASH_SEC,
} from "../specials/EldritchBlood.js";
import { HALLS_COIN_HIT_RADIUS_PX } from "./hallsLogic.js";

/** Asset URLs via `URL` avoid native ES module loaders fetching `.png` as JavaScript when not using Vite. */
const depthsEldritchBossUrl = new URL("../../assets/Cthulu.png", import.meta.url).href;
const depthsEldritchLightningUrl = new URL("../../assets/lightning.png", import.meta.url).href;
const hallsKingUrl = new URL("../../assets/king.png", import.meta.url).href;
const hallsQueenUrl = new URL("../../assets/queen.png", import.meta.url).href;
const hallsRookUrl = new URL("../../assets/rook.png", import.meta.url).href;
const hallsBishopUrl = new URL("../../assets/bishop.png", import.meta.url).href;
const hallsKnightUrl = new URL("../../assets/knight.png", import.meta.url).href;
const hallsPawnUrl = new URL("../../assets/pawn.png", import.meta.url).href;

/** Preloaded boss PNG (2D canvas). */
const depthsEldritchBossImg = new Image();
depthsEldritchBossImg.src = depthsEldritchBossUrl;

const depthsEldritchLightningImg = new Image();
depthsEldritchLightningImg.src = depthsEldritchLightningUrl;

/** Halls chess piece PNGs (direct image per piece). */
const hallsPieceImgByType = {
  hallsKing: new Image(),
  hallsQueen: new Image(),
  hallsRook: new Image(),
  hallsBishop: new Image(),
  hallsKnight: new Image(),
  hallsPawn: new Image(),
};
hallsPieceImgByType.hallsKing.src = hallsKingUrl;
hallsPieceImgByType.hallsQueen.src = hallsQueenUrl;
hallsPieceImgByType.hallsRook.src = hallsRookUrl;
hallsPieceImgByType.hallsBishop.src = hallsBishopUrl;
hallsPieceImgByType.hallsKnight.src = hallsKnightUrl;
hallsPieceImgByType.hallsPawn.src = hallsPawnUrl;

/** Halls chess enemies: direct piece PNG when loaded; else procedural coin. */
const HALLS_COIN_RADIUS_PX = HALLS_COIN_HIT_RADIUS_PX;
const HALLS_COIN_PIECE_TYPES = new Set([
  "hallsPawn",
  "hallsRook",
  "hallsKnight",
  "hallsBishop",
  "hallsQueen",
  "hallsKing",
]);

/**
 * Staunton-style silhouettes (filled), tuned for ~100px coin legibility.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} pieceType
 */
function drawHallsCoinInsignia(ctx, pieceType) {
  const s = HALLS_COIN_RADIUS_PX * 0.52;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  switch (pieceType) {
    case "hallsPawn": {
      ctx.beginPath();
      ctx.arc(0, -0.44 * s, s * 0.17, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, -0.24 * s, s * 0.22, s * 0.075, 0, 0, TAU);
      ctx.fill();
      ctx.fillRect(-s * 0.075, -0.16 * s, s * 0.15, s * 0.2);
      ctx.beginPath();
      ctx.moveTo(-s * 0.28, 0.16 * s);
      ctx.quadraticCurveTo(-s * 0.34, 0.36 * s, 0, 0.4 * s);
      ctx.quadraticCurveTo(s * 0.34, 0.36 * s, s * 0.28, 0.16 * s);
      ctx.lineTo(s * 0.1, 0.06 * s);
      ctx.lineTo(-s * 0.1, 0.06 * s);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "hallsRook": {
      const w = s * 0.44;
      const bodyTop = -0.55 * s;
      const bodyH = 0.88 * s;
      ctx.fillRect(-w * 0.5, bodyTop, w, bodyH);
      const toothW = w / 3;
      const merlonH = s * 0.15;
      for (let i = 0; i < 3; i++) {
        const x0 = -w * 0.5 + i * toothW + toothW * 0.05;
        ctx.fillRect(x0, bodyTop - merlonH, toothW * 0.9, merlonH);
      }
      break;
    }
    case "hallsKnight": {
      ctx.beginPath();
      ctx.moveTo(-0.06 * s, 0.36 * s);
      ctx.quadraticCurveTo(-0.34 * s, 0.24 * s, -0.32 * s, -0.02 * s);
      ctx.quadraticCurveTo(-0.3 * s, -0.26 * s, -0.12 * s, -0.36 * s);
      ctx.lineTo(-0.04 * s, -0.54 * s);
      ctx.quadraticCurveTo(-0.14 * s, -0.42 * s, -0.22 * s, -0.34 * s);
      ctx.quadraticCurveTo(-0.02 * s, -0.4 * s, 0.18 * s, -0.34 * s);
      ctx.quadraticCurveTo(0.46 * s, -0.2 * s, 0.4 * s, 0.04 * s);
      ctx.quadraticCurveTo(0.24 * s, 0.14 * s, 0.04 * s, 0.08 * s);
      ctx.quadraticCurveTo(-0.04 * s, 0.2 * s, -0.06 * s, 0.36 * s);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "hallsBishop": {
      ctx.beginPath();
      ctx.moveTo(0, -0.58 * s);
      ctx.bezierCurveTo(-0.24 * s, -0.48 * s, -0.44 * s, -0.1 * s, -0.3 * s, 0.12 * s);
      ctx.lineTo(-0.1 * s, 0.04 * s);
      ctx.lineTo(0, 0.14 * s);
      ctx.lineTo(0.1 * s, 0.04 * s);
      ctx.lineTo(0.3 * s, 0.12 * s);
      ctx.bezierCurveTo(0.44 * s, -0.1 * s, 0.24 * s, -0.48 * s, 0, -0.58 * s);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -0.64 * s, s * 0.095, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0.26 * s, s * 0.24, s * 0.085, 0, 0, TAU);
      ctx.fill();
      ctx.fillRect(-s * 0.055, 0.15 * s, s * 0.11, s * 0.14);
      break;
    }
    case "hallsQueen": {
      const bandTop = -0.18 * s;
      const bandH = s * 0.11;
      ctx.fillRect(-s * 0.4, bandTop, s * 0.8, bandH);
      const spikeH = s * 0.32;
      const xs = [-0.34, -0.17, 0, 0.17, 0.34];
      for (const xf of xs) {
        const cx = xf * s;
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.075, bandTop);
        ctx.lineTo(cx, bandTop - spikeH);
        ctx.lineTo(cx + s * 0.075, bandTop);
        ctx.closePath();
        ctx.fill();
      }
      for (const xf of xs) {
        ctx.beginPath();
        ctx.arc(xf * s, bandTop - spikeH - s * 0.04, s * 0.055, 0, TAU);
        ctx.fill();
      }
      ctx.fillRect(-s * 0.07, bandTop + bandH, s * 0.14, s * 0.24);
      ctx.beginPath();
      ctx.ellipse(0, 0.42 * s, s * 0.3, s * 0.095, 0, 0, TAU);
      ctx.fill();
      break;
    }
    case "hallsKing": {
      ctx.beginPath();
      ctx.ellipse(0, 0.4 * s, s * 0.26, s * 0.09, 0, 0, TAU);
      ctx.fill();
      ctx.fillRect(-s * 0.075, 0.12 * s, s * 0.15, s * 0.3);
      const domeCy = -0.02 * s;
      const domeR = s * 0.26;
      ctx.beginPath();
      ctx.moveTo(-domeR, domeCy);
      ctx.arc(0, domeCy, domeR, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();
      const crossY = domeCy - domeR;
      ctx.fillRect(-s * 0.038, crossY - s * 0.42, s * 0.076, s * 0.44);
      ctx.fillRect(-s * 0.16, crossY - s * 0.24, s * 0.32, s * 0.07);
      ctx.fillRect(-s * 0.032, crossY - s * 0.5, s * 0.064, s * 0.13);
      break;
    }
    default:
      break;
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number; y: number; hallsPieceType: string }} h
 */
function drawHallsChessCoin(ctx, h, opts) {
  const { x, y } = h;
  const pieceType = String(h.hallsPieceType ?? "");
  if (!HALLS_COIN_PIECE_TYPES.has(pieceType)) return;
  const alpha = clamp(Number(h.opacity ?? 1), 0, 1);
  const t = Number.isFinite(Number(opts.simElapsed)) ? Number(opts.simElapsed) : 0;
  const R = HALLS_COIN_RADIUS_PX;
  const img = hallsPieceImgByType[pieceType];
  const useSprite = !!img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;

  ctx.save();
  ctx.globalAlpha = alpha;
  const glint = 0.5 + 0.5 * Math.sin(t * 2.4 + Number(h.bornAt ?? 0) * 0.01);
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.arc(2.5, 3.5, R, 0, TAU);
  ctx.fillStyle = "rgba(12, 8, 4, 0.28)";
  ctx.fill();

  if (useSprite) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.clip();
    const sw = img.naturalWidth;
    const sh = img.naturalHeight;
    const cover = Math.max((2 * R) / sw, (2 * R) / sh);
    const dw = sw * cover;
    const dh = sh * cover;
    ctx.drawImage(img, 0, 0, sw, sh, -dw * 0.5, -dh * 0.5, dw, dh);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.strokeStyle = "rgba(40, 28, 10, 0.82)";
    ctx.lineWidth = 3.2;
    ctx.stroke();

    const shine = ctx.createLinearGradient(-R, -R, R * 0.6, R * 0.6);
    shine.addColorStop(0, `rgba(255, 255, 255, ${0.1 + 0.08 * glint})`);
    shine.addColorStop(0.35, "rgba(255, 255, 255, 0)");
    shine.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.beginPath();
    ctx.arc(0, 0, R - 3, 0, TAU);
    ctx.fillStyle = shine;
    ctx.fill();
  } else {
    const body = ctx.createRadialGradient(-R * 0.42, -R * 0.42, R * 0.08, 0, 0, R);
    body.addColorStop(0, `rgba(255, 248, 220, ${0.92 + 0.06 * glint})`);
    body.addColorStop(0.22, "#f0d078");
    body.addColorStop(0.5, "#c9a227");
    body.addColorStop(0.78, "#8b6914");
    body.addColorStop(1, "#5c4210");
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fillStyle = body;
    ctx.fill();

    ctx.strokeStyle = "rgba(60, 40, 12, 0.75)";
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, R - 10, 0, TAU);
    ctx.strokeStyle = "rgba(120, 90, 30, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const innerBg = ctx.createRadialGradient(R * 0.15, R * 0.12, 0, 0, 0, R - 14);
    innerBg.addColorStop(0, "rgba(255, 243, 200, 0.22)");
    innerBg.addColorStop(0.55, "rgba(180, 140, 50, 0.12)");
    innerBg.addColorStop(1, "rgba(70, 50, 18, 0.18)");
    ctx.beginPath();
    ctx.arc(0, 0, R - 14, 0, TAU);
    ctx.fillStyle = innerBg;
    ctx.fill();

    ctx.fillStyle = "#2c1f0a";
    ctx.strokeStyle = "#1a1206";
    ctx.lineWidth = 1.1;
    drawHallsCoinInsignia(ctx, pieceType);

    const shine = ctx.createLinearGradient(-R, -R, R * 0.6, R * 0.6);
    shine.addColorStop(0, `rgba(255, 255, 255, ${0.14 + 0.1 * glint})`);
    shine.addColorStop(0.35, "rgba(255, 255, 255, 0)");
    shine.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.beginPath();
    ctx.arc(0, 0, R - 4, 0, TAU);
    ctx.fillStyle = shine;
    ctx.fill();
  }

  if (h.hallsPathwayCreamEnemy) {
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fillStyle = "rgba(255, 250, 242, 0.55)";
    ctx.fill();
    ctx.globalCompositeOperation = "multiply";
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fillStyle = "rgba(210, 196, 172, 0.38)";
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

/** Extra radians applied when drawing the boss PNG; 0 = use the asset’s native orientation. */
const DEPTHS_ELDRITCH_BOSS_SPRITE_YAW = 0;

/** Offscreen buffer for boss shading (getImageData / putImageData). */
const _eldritchShade = {
  /** @type {HTMLCanvasElement | null} */
  canvas: null,
  /** @type {CanvasRenderingContext2D | null} */
  ctx: null,
};

function ensureEldritchShadeCanvas(dw, dh) {
  if (!_eldritchShade.canvas || _eldritchShade.canvas.width !== dw || _eldritchShade.canvas.height !== dh) {
    _eldritchShade.canvas = document.createElement("canvas");
    _eldritchShade.canvas.width = dw;
    _eldritchShade.canvas.height = dh;
    _eldritchShade.ctx = _eldritchShade.canvas.getContext("2d", { willReadFrequently: true });
  }
  return _eldritchShade;
}

/** Treat clearly red-dominant pixels as authored (eyes, gore); body/purple shifts with `brightMul`. */
function eldritchProtectedRed(pr, pg, pb) {
  const dr = pr - pg;
  const db = pr - pb;
  if (pr < 38) return false;
  if (dr < 12 || db < 12) return false;
  if (pr > 236 && pg > 220 && pb > 210) return false;
  return true;
}

/**
 * @param {CanvasImageSource} img
 * @param {number} dw
 * @param {number} dh
 * @param {number} brightMul
 * @returns {HTMLCanvasElement | null}
 */
function eldritchBossShadedCanvas(img, dw, dh, brightMul) {
  const { canvas, ctx } = ensureEldritchShadeCanvas(dw, dh);
  if (!ctx || !canvas) return null;
  ctx.clearRect(0, 0, dw, dh);
  ctx.drawImage(img, 0, 0, dw, dh);
  let imageData;
  try {
    imageData = ctx.getImageData(0, 0, dw, dh);
  } catch {
    return null;
  }
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    if (eldritchProtectedRed(r, g, b)) continue;
    d[i] = clamp((r * brightMul) | 0, 0, 255);
    d[i + 1] = clamp((g * brightMul) | 0, 0, 255);
    d[i + 2] = clamp((b * brightMul) | 0, 0, 255);
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * @param {CanvasImageSource} img
 * @param {number} dw
 * @param {number} dh
 * @param {number} nonRedBrightMul — body / purple channel (0 = black)
 * @param {number} redBrightMul — protected red accents (usually 1; below 1 fades reds last)
 * @returns {HTMLCanvasElement | null}
 */
function eldritchBossShadedDualTone(img, dw, dh, nonRedBrightMul, redBrightMul) {
  const { canvas, ctx } = ensureEldritchShadeCanvas(dw, dh);
  if (!ctx || !canvas) return null;
  ctx.clearRect(0, 0, dw, dh);
  ctx.drawImage(img, 0, 0, dw, dh);
  let imageData;
  try {
    imageData = ctx.getImageData(0, 0, dw, dh);
  } catch {
    return null;
  }
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const mul = eldritchProtectedRed(r, g, b) ? redBrightMul : nonRedBrightMul;
    d[i] = clamp((r * mul) | 0, 0, 255);
    d[i + 1] = clamp((g * mul) | 0, 0, 255);
    d[i + 2] = clamp((b * mul) | 0, 0, 255);
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/** Frog detonation burst + mud pool grow-in duration (seconds); same easing for both. */
export const FROG_SPLASH_GROW_SEC = 0.88;

/** 0..1 scale while splash/pool expands from center (ease-out, matches burst `ease`). */
export function frogMudPoolGrowScale(bornAt, now) {
  const u = clamp((now - bornAt) / FROG_SPLASH_GROW_SEC, 0, 1);
  return 1 - Math.pow(1 - u, 2.45);
}

export function hunterPalette(type) {
  switch (type) {
    case "chaser":
      return { light: "#fecaca", core: "#dc2626", shadow: "#7f1d1d", rim: "#fca5a5", mark: "#fff1f2" };
    case "frogChaser":
      return { light: "#86efac", core: "#166534", shadow: "#14532d", rim: "#4ade80", mark: "#ecfccb" };
    case "cutter":
      return { light: "#fde68a", core: "#d97706", shadow: "#78350f", rim: "#fcd34d", mark: "#fffbeb" };
    case "sniper":
      return { light: "#fbcfe8", core: "#db2777", shadow: "#831843", rim: "#f9a8d4", mark: "#fdf2f8" };
    /** Depths path sniper — violet / abyss teal (matches bolt minion & grapple laser family). */
    case "depthsSniper":
      return { light: "#c4b5fd", core: "#5b21b6", shadow: "#1e1b4b", rim: "#2dd4bf", mark: "#e0e7ff" };
    case "laser":
      return { light: "#fecaca", core: "#ef4444", shadow: "#7f1d1d", rim: "#f87171", mark: "#fef2f2" };
    case "laserBlue":
      return { light: "#bfdbfe", core: "#2563eb", shadow: "#1e3a8a", rim: "#60a5fa", mark: "#eff6ff" };
    case "spawner":
      return { light: "#fecdd3", core: "#e11d48", shadow: "#881337", rim: "#fb7185", mark: "#fff1f2" };
    case "airSpawner":
      return { light: "#ddd6fe", core: "#7c3aed", shadow: "#4c1d95", rim: "#a78bfa", mark: "#f5f3ff" };
    case "depthsBoltSpawner":
      return { light: "#99f6e4", core: "#0d9488", shadow: "#134e4a", rim: "#5eead4", mark: "#ccfbf1" };
    case "depthsShardChaser":
      return { light: "#e9d5ff", core: "#7e22ce", shadow: "#3b0764", rim: "#c084fc", mark: "#f3e8ff" };
    case "depthsGrappleLaser":
      return { light: "#a5f3fc", core: "#6366f1", shadow: "#312e81", rim: "#818cf8", mark: "#e0e7ff" };
    case "cryptSpawner":
      return { light: "#f8fafc", core: "#e2e8f0", shadow: "#475569", rim: "#f1f5f9", mark: "#ffffff" };
    case "ranged":
      return { light: "#bae6fd", core: "#0284c7", shadow: "#0c4a6e", rim: "#38bdf8", mark: "#f0f9ff" };
    case "fast":
      return { light: "#fed7aa", core: "#ea580c", shadow: "#7c2d12", rim: "#fb923c", mark: "#fff7ed" };
    /** Depths bolt-spawner shot — not a spawn `type`; used from `drawHunterBody` when `h.depthsBoltMinion`. */
    case "depthsBoltMinion":
      return { light: "#a7f3d0", core: "#5b21b6", shadow: "#134e4a", rim: "#2dd4bf", mark: "#ede9fe" };
    /** Depths L5 eldritch bloom — custom body draw; palette fallback only. */
    case "depthsEldritchBloom":
      return { light: "#a78bfa", core: "#4c1d95", shadow: "#1e0533", rim: "#7c3aed", mark: "#fecaca" };
    case "depthsEldritchBarrageBolt":
      return { light: "#c4b5fd", core: "#312e81", shadow: "#0f172a", rim: "#38bdf8", mark: "#e0e7ff" };
    case "depthsEldritchCageLunge":
      return { light: "#fca5a5", core: "#9f1239", shadow: "#450a0a", rim: "#fdba74", mark: "#fff1f2" };
    case "ghost":
      return { light: "#f3f4f6", core: "#cbd5e1", shadow: "#6b7280", rim: "#e5e7eb", mark: "#ffffff" };
    default:
      return { light: "#ddd6fe", core: "#7c3aed", shadow: "#3b0764", rim: "#c4b5fd", mark: "#f5f3ff" };
  }
}

/** @param {{ x: number; y: number }} p0 @param {{ x: number; y: number }} p1 @param {{ x: number; y: number }} p2 */
function quadBezierPoint(p0, p1, p2, u) {
  const om = 1 - u;
  return {
    x: om * om * p0.x + 2 * om * u * p1.x + u * u * p2.x,
    y: om * om * p0.y + 2 * om * u * p1.y + u * u * p2.y,
  };
}

/** @param {{ x: number; y: number }} p0 @param {{ x: number; y: number }} p1 @param {{ x: number; y: number }} p2 */
function quadBezierTangent(p0, p1, p2, u) {
  return {
    x: 2 * (1 - u) * (p1.x - p0.x) + 2 * u * (p2.x - p1.x),
    y: 2 * (1 - u) * (p1.y - p0.y) + 2 * u * (p2.y - p1.y),
  };
}

/** @param {{ x: number; y: number }} p0 p1 p2 p3 */
function cubicBezierPoint(p0, p1, p2, p3, u) {
  const om = 1 - u;
  const om2 = om * om;
  const om3 = om2 * om;
  const u2 = u * u;
  const u3 = u2 * u;
  return {
    x: om3 * p0.x + 3 * om2 * u * p1.x + 3 * om * u2 * p2.x + u3 * p3.x,
    y: om3 * p0.y + 3 * om2 * u * p1.y + 3 * om * u2 * p2.y + u3 * p3.y,
  };
}

/** @param {{ x: number; y: number }} p0 p1 p2 p3 */
function cubicBezierTangent(p0, p1, p2, p3, u) {
  const om = 1 - u;
  const om2 = om * om;
  const u2 = u * u;
  return {
    x: 3 * om2 * (p1.x - p0.x) + 6 * om * u * (p2.x - p1.x) + 3 * u2 * (p3.x - p2.x),
    y: 3 * om2 * (p1.y - p0.y) + 6 * om * u * (p2.y - p1.y) + 3 * u2 * (p3.y - p2.y),
  };
}

/** World-space chord below this is drawn as if this long (reads big at close range). */
const DEPTHS_TENTACLE_VIEW_MIN_CHORD = 248;

/** 0..1: body “wound up” during coil, eases off through damaging strike (draw-only). */
function depthsTentacleCoilSpineU(h, simElapsed) {
  const coilStart = Number(h.depthsTelegraphEnd ?? 0);
  const coilEnd = Number(h.depthsCoilEnd ?? 0);
  const strikeEnd = Number(h.depthsStrikeEnd ?? 0);
  if (!Number.isFinite(coilStart) || simElapsed < coilStart) return 0;
  if (simElapsed < coilEnd) {
    const t = clamp((simElapsed - coilStart) / Math.max(1e-4, coilEnd - coilStart), 0, 1);
    return t * t * (3 - 2 * t);
  }
  if (simElapsed < strikeEnd) {
    const t = clamp((simElapsed - coilEnd) / Math.max(1e-4, strikeEnd - coilEnd), 0, 1);
    const releaseU = t * t * (3 - 2 * t);
    return 1 - releaseU;
  }
  return 0;
}

/**
 * 0..1 draw-only: opposite-side flex ramps with follow time (no hard cut = no paired “second
 * move” pop).
 */
function depthsTentacleFollowMomentumOpposite(h, simElapsed) {
  const strike = Number(h.depthsStrikeEnd ?? 0);
  const motion = Number(h.depthsMotionEnd ?? 0);
  if (simElapsed < strike || simElapsed >= motion) return 0;
  const t = (simElapsed - strike) / Math.max(1e-4, motion - strike);
  const v = clamp((t - 0.1) / 0.9, 0, 1);
  return v * v * (3 - 2 * v);
}

/** @param {CanvasRenderingContext2D} ctx */
function drawDepthsTentacle(ctx, h, simElapsed) {
  const ax = h.depthsAnchorX;
  const ay = h.depthsAnchorY;
  const tx = h.x;
  const ty = h.y;
  const op = clamp(Number(h.opacity ?? 1), 0, 1);
  const rawDx = tx - ax;
  const rawDy = ty - ay;
  const rawLen = Math.hypot(rawDx, rawDy) || 1;
  const visScale = rawLen < DEPTHS_TENTACLE_VIEW_MIN_CHORD ? DEPTHS_TENTACLE_VIEW_MIN_CHORD / rawLen : 1;
  const p0 = { x: ax, y: ay };
  const p2 = { x: ax + rawDx * visScale, y: ay + rawDy * visScale };
  const tdx = p2.x - ax;
  const tdy = p2.y - ay;
  const chord = Math.hypot(tdx, tdy) || 1;
  const nx0 = -tdy / chord;
  const ny0 = tdx / chord;
  const bend = Math.min(52, chord * 0.26);
  const coilSp = depthsTentacleCoilSpineU(h, simElapsed);
  const momentumOpp = depthsTentacleFollowMomentumOpposite(h, simElapsed);
  const cSign = Number(h.depthsCoilSign ?? 1) || 1;
  /** Coil-side bulge; carried follow bends the opposite way as tip keeps same-turn sweep. */
  const baseSide = bend * (0.92 - coilSp * 0.22);
  const coilArc = coilSp * Math.min(122, chord * 0.5);
  const oppositeArc = momentumOpp * Math.min(118, chord * 0.5);
  const totalSide = baseSide + cSign * (coilArc - oppositeArc);
  const chordUx = tdx / chord;
  const chordUy = tdy / chord;
  const curlBack = coilSp * chord * 0.1 + momentumOpp * chord * 0.08;
  const cp1 = {
    x: ax + tdx * (1 / 3) + nx0 * totalSide * 0.5 - chordUx * curlBack,
    y: ay + tdy * (1 / 3) + ny0 * totalSide * 0.5 - chordUy * curlBack,
  };
  const cp2 = {
    x: ax + tdx * (2 / 3) + nx0 * totalSide * 0.92 - chordUx * curlBack * 0.55,
    y: ay + tdy * (2 / 3) + ny0 * totalSide * 0.92 - chordUy * curlBack * 0.55,
  };
  const p3 = p2;

  const N = 32;
  /** @type {{ x: number; y: number; u: number; nx: number; ny: number; half: number }[]} */
  const spine = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const p = cubicBezierPoint(p0, cp1, cp2, p3, u);
    const tang = cubicBezierTangent(p0, cp1, cp2, p3, u);
    const tlen = Math.hypot(tang.x, tang.y) || 1;
    let px = -tang.y / tlen;
    let py = tang.x / tlen;
    const wobble =
      Math.sin(u * TAU * 2.4 + simElapsed * 4.2) *
      3.8 *
      (1 - u) *
      (1 - u) *
      (1 - coilSp * 0.88);
    p.x += px * wobble;
    p.y += py * wobble;
    const baseHalf =
      (Math.min(22, 10 + chord * 0.068) * Math.pow(1 - u, 0.5) + 2.5 * (1 - u)) * 1.12;
    spine.push({ x: p.x, y: p.y, u, nx: px, ny: py, half: baseHalf });
  }

  const midC = cubicBezierPoint(p0, cp1, cp2, p3, 0.5);
  const ventralSign =
    Math.sign((p2.x - ax) * (midC.y - ay) - (p2.y - ay) * (midC.x - ax)) || 1;

  ctx.save();
  ctx.globalAlpha = op;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const left = spine.map((s) => ({
    x: s.x + s.nx * s.half * ventralSign,
    y: s.y + s.ny * s.half * ventralSign,
  }));
  const right = spine.map((s) => ({
    x: s.x - s.nx * s.half * ventralSign,
    y: s.y - s.ny * s.half * ventralSign,
  }));

  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < left.length; i++) ctx.lineTo(left[i].x, left[i].y);
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  const gx0 = ax - chord * 0.08;
  const gy0 = ay - chord * 0.12;
  const gx1 = p2.x + chord * 0.1;
  const gy1 = p2.y + chord * 0.08;
  const bodyGrad = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
  bodyGrad.addColorStop(0, "rgba(12, 18, 42, 0.98)");
  bodyGrad.addColorStop(0.35, "rgba(36, 28, 72, 0.95)");
  bodyGrad.addColorStop(0.65, "rgba(52, 42, 88, 0.92)");
  bodyGrad.addColorStop(1, "rgba(28, 38, 62, 0.9)");
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(4, 12, 28, 0.88)";
  ctx.lineWidth = 2.4;
  ctx.stroke();

  ctx.beginPath();
  for (let i = 0; i < spine.length; i++) {
    const s = spine[i];
    const dorsalX = s.x - s.nx * s.half * 0.55 * ventralSign;
    const dorsalY = s.y - s.ny * s.half * 0.55 * ventralSign;
    if (i === 0) ctx.moveTo(dorsalX, dorsalY);
    else ctx.lineTo(dorsalX, dorsalY);
  }
  ctx.strokeStyle = "rgba(120, 160, 210, 0.38)";
  ctx.lineWidth = 3.2;
  ctx.stroke();

  const suckerU = [0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86];
  for (const su of suckerU) {
    const idx = Math.round(su * N);
    const s = spine[clamp(idx, 0, spine.length - 1)];
    const inset = 0.42;
    const sx = s.x + s.nx * s.half * ventralSign * inset;
    const sy = s.y + s.ny * s.half * ventralSign * inset;
    const tang = cubicBezierTangent(p0, cp1, cp2, p3, su);
    const ang = Math.atan2(tang.y, tang.x);
    const rad = 4 + (1 - su) * 5.5;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(ang);
    ctx.scale(1, 0.78);
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, TAU);
    ctx.fillStyle = "rgba(18, 14, 38, 0.92)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.72, 0, TAU);
    ctx.fillStyle = "rgba(140, 120, 188, 0.55)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.38, 0, TAU);
    ctx.fillStyle = "rgba(32, 26, 58, 0.85)";
    ctx.fill();
    ctx.strokeStyle = "rgba(200, 210, 235, 0.22)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.72, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  ctx.strokeStyle = "rgba(220, 238, 255, 0.55)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(spine[0].x, spine[0].y);
  for (let i = 1; i < spine.length; i++) ctx.lineTo(spine[i].x, spine[i].y);
  ctx.stroke();

  const splashU = Number(h.depthsSplashU ?? 0);
  if (splashU > 0 && splashU < 1) {
    const rad = 20 + splashU * 78;
    const a = (1 - splashU) * 0.62;
    ctx.fillStyle = `rgba(186, 230, 253, ${a * 0.5})`;
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, rad, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.85})`;
    ctx.lineWidth = 2.8;
    ctx.stroke();
  }
  ctx.restore();
}

/** Depths L5 eldritch scripted radial burst — small dark electric dart (passes through terrain). */
function drawDepthsEldritchBarrageBolt(ctx, h, simElapsed) {
  const t = Number(h.bornAt ?? 0) * 0.02 + simElapsed * 22;
  const pulse = 0.5 + 0.5 * Math.sin(t);
  const { x, y, r } = h;
  const vx = Number(h.eldritchBarrageVx ?? 1);
  const vy = Number(h.eldritchBarrageVy ?? 0);
  const ang = Math.atan2(vy, vx);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.globalCompositeOperation = "lighter";
  const core = ctx.createLinearGradient(-r * 3, 0, r * 3.5, 0);
  core.addColorStop(0, "rgba(15, 8, 32, 0)");
  core.addColorStop(0.35, `rgba(56, 189, 248, ${0.35 + 0.25 * pulse})`);
  core.addColorStop(0.55, `rgba(167, 139, 250, ${0.55 + 0.2 * pulse})`);
  core.addColorStop(0.72, `rgba(30, 20, 60, ${0.75})`);
  core.addColorStop(1, "rgba(4, 2, 12, 0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 4.2, r * 1.05, 0, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(12, 8, 28, ${0.82 + 0.12 * pulse})`;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.85, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(186, 230, 253, ${0.45 + 0.35 * pulse})`;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
}

/** Scripted P2 melee rush from cage beat — blunt crimson claw head, ignores obstacles. */
function drawDepthsEldritchCageLunge(ctx, h, opts = {}) {
  const simElapsed = Number(opts.simElapsed);
  const t = Number(h.bornAt ?? 0) * 0.03 + (Number.isFinite(simElapsed) ? simElapsed : 0) * 19;
  const pulse = 0.5 + 0.5 * Math.sin(t);
  const { x, y, r } = h;
  const vx = Number(h.eldritchCageLungeVx ?? 1);
  const vy = Number(h.eldritchCageLungeVy ?? 0);
  const ang = Math.atan2(vy, vx);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.globalCompositeOperation = "lighter";
  const core = ctx.createLinearGradient(-r * 2.8, 0, r * 4, 0);
  core.addColorStop(0, "rgba(24, 4, 10, 0)");
  core.addColorStop(0.35, `rgba(255, 90, 120, ${0.35 + 0.25 * pulse})`);
  core.addColorStop(0.58, `rgba(230, 50, 90, ${0.5 + 0.2 * pulse})`);
  core.addColorStop(0.76, `rgba(80, 10, 50, ${0.75})`);
  core.addColorStop(1, "rgba(14, 0, 16, 0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 3.5, r * 1.1, 0, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = `rgba(255, 200, 220, ${0.32 + 0.28 * pulse})`;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(r * 0.15, 0, r * 1.95, r * 0.88, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/**
 * Depths L5 boss: raster from `src/assets/Cthulu.png`, scaled (~2.5× base fit on hit radius), yaw toward player (`h.dir`).
 */
function drawDepthsEldritchBloom(ctx, h, simElapsed) {
  if (h.depthsEldritchP3BossHidden) return;
  const vanishT = Number(h.depthsEldritchP3VanishFlashStartSim ?? 0);
  if (h.depthsEldritchPhase3Tone && vanishT > 0) {
    const age = simElapsed - vanishT;
    if (age >= 0 && age < ELDRITCH_BLOOD_PHASE3_END_FLASH_SEC) return;
  }
  const { x, y, r } = h;
  const t = simElapsed;
  const phase = Number(h.bornAt ?? 0) * 0.09;
  const bob = Math.sin(t * 1.25 + phase) * 1.8;
  const p2p3Until = Number(h.depthsEldritchP2P3InterludeUntil);
  const p2p3Start = Number(h.depthsEldritchP2P3InterludeStartSim ?? 0);
  const inP2P3Interlude = p2p3Until > t && p2p3Start > 0;
  const cy = inP2P3Interlude ? y : y + bob;
  const alpha = clamp(Number(h.opacity ?? 1), 0, 1);
  const p2p3ScriptedOp = inP2P3Interlude
    ? clamp(Number(h.depthsEldritchP2P3ScriptedOpacity ?? 1), 0, 1)
    : 1;
  const maxSpan = r * 2.2 * 2.5;

  ctx.save();
  ctx.globalAlpha = alpha * p2p3ScriptedOp;
  ctx.translate(x, cy);

  if (inP2P3Interlude && p2p3ScriptedOp < 0.008) {
    ctx.restore();
    return;
  }

  const bpUntil = Number(h.depthsBetweenPhasesUntil);
  const bpStart = Number(h.depthsBetweenPhasesStartSim ?? 0);
  const inInterlude = bpUntil > t && bpStart > 0;
  /** 0→1 progress through the scripted P1→P2 interlude (≈ `ELDRITCH_BLOOD_BETWEEN_PHASE_INTERLUDE_SEC`). */
  const interludeU = inInterlude
    ? clamp((t - bpStart) / Math.max(1e-4, ELDRITCH_BLOOD_BETWEEN_PHASE_INTERLUDE_SEC), 0, 1)
    : 0;
  const inhaleSeg = interludeU < 0.62;
  const inhaleU01 = inhaleSeg ? clamp(interludeU / 0.62, 0, 1) : 0;
  const inhaleEase = inhaleU01 * inhaleU01 * (3 - 2 * inhaleU01);
  const burstU01 = !inhaleSeg ? clamp((interludeU - 0.62) / 0.38, 0, 1) : 0;
  const burstEase = burstU01 * burstU01 * (3 - 2 * burstU01);

  const glowUntil = Number(h.depthsRewindGlowUntil);
  /** Match `DEPTHS_ELDRITCH_REWIND_GLOW_SEC` in `entry.js`. */
  const ELDRITCH_REWIND_GLOW_SEC = 0.52;
  if (!inInterlude && glowUntil > simElapsed) {
    const rem = glowUntil - simElapsed;
    const g = clamp(rem / ELDRITCH_REWIND_GLOW_SEC, 0, 1);
    const pulse = Math.sin(g * Math.PI);
    const R = maxSpan * 0.62;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const grd = ctx.createRadialGradient(0, 0, R * 0.06, 0, 0, R * 1.08);
    grd.addColorStop(0, `rgba(236, 224, 255, ${0.52 * pulse})`);
    grd.addColorStop(0.38, `rgba(130, 72, 175, ${0.34 * pulse})`);
    grd.addColorStop(0.72, `rgba(70, 28, 95, ${0.2 * pulse})`);
    grd.addColorStop(1, "rgba(10, 2, 20, 0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.08, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = `rgba(210, 180, 255, ${0.38 * pulse * g})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.52 + (1 - g) * R * 0.12, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  const teleUntil = Number(h.depthsEldritchTeleportFxUntil);
  if (!inInterlude && teleUntil > t) {
    const gx = Number(h.depthsEldritchTeleportGhostX);
    const gy = Number(h.depthsEldritchTeleportGhostY);
    if (Number.isFinite(gx) && Number.isFinite(gy)) {
      const lx = gx - x;
      const ly = gy - cy;
      const rem = teleUntil - t;
      const u = clamp(rem / 0.36, 0, 1);
      const pulse = 0.5 + 0.5 * Math.sin(t * 28 + u * 6);
      ctx.save();
      ctx.translate(lx, ly);
      ctx.globalCompositeOperation = "lighter";
      const R = maxSpan * (0.55 + (1 - u) * 0.5);
      const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, R);
      grd.addColorStop(0, `rgba(255, 250, 255, ${0.35 * (1 - u) * pulse})`);
      grd.addColorStop(0.25, `rgba(120, 200, 255, ${0.42 * (1 - u * 0.5)})`);
      grd.addColorStop(0.55, `rgba(40, 20, 80, ${0.55 * (1 - u * 0.3)})`);
      grd.addColorStop(1, "rgba(4, 0, 10, 0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = `rgba(224, 242, 255, ${0.55 * (1 - u * 0.4)})`;
      ctx.lineWidth = 3 + (1 - u) * 4;
      ctx.beginPath();
      ctx.arc(0, 0, R * (0.42 + 0.12 * pulse), 0, TAU);
      ctx.stroke();
      ctx.setLineDash([7, 11]);
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.72, -t * 2.2, -t * 2.2 + TAU * 0.88);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  if (!inInterlude && h.depthsEldritchLightningCastActive) {
    const pulse = 0.55 + 0.45 * Math.sin(t * 20 + phase * 0.9);
    const R = maxSpan * 0.78;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const grd = ctx.createRadialGradient(0, 0, R * 0.04, 0, 0, R * 1.12);
    grd.addColorStop(0, `rgba(255, 255, 255, ${0.42 + 0.28 * pulse})`);
    grd.addColorStop(0.28, `rgba(186, 240, 255, ${0.5 * pulse})`);
    grd.addColorStop(0.55, `rgba(56, 189, 248, ${0.38 * pulse})`);
    grd.addColorStop(0.82, `rgba(14, 116, 144, ${0.16 * pulse})`);
    grd.addColorStop(1, "rgba(6, 20, 40, 0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.12, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(224, 250, 255, ${0.35 + 0.45 * pulse})`;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.48 + pulse * R * 0.08, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  if (!inInterlude && h.depthsEldritchBarrageAttackActive && !h.depthsEldritchLightningCastActive) {
    const pulse = 0.55 + 0.45 * Math.sin(t * 17 + phase * 0.7);
    const R = maxSpan * 0.72;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const grd = ctx.createRadialGradient(0, 0, R * 0.05, 0, 0, R * 1.05);
    grd.addColorStop(0, `rgba(230, 210, 255, ${0.38 + 0.22 * pulse})`);
    grd.addColorStop(0.3, `rgba(90, 40, 140, ${0.45 * pulse})`);
    grd.addColorStop(0.6, `rgba(30, 12, 60, ${0.35 * pulse})`);
    grd.addColorStop(1, "rgba(4, 0, 10, 0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.05, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.28 + 0.35 * pulse})`;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.5 + pulse * R * 0.06, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  const eldritchPrepStart = Number(h.depthsSpellLiftPrepStartSim ?? 0);
  const eldritchPrepEnd = Number(h.depthsSpellLiftPrepEndSim ?? 0);
  const eldritchInLiftPrep =
    eldritchPrepEnd > eldritchPrepStart &&
    t >= eldritchPrepStart &&
    t < eldritchPrepEnd &&
    !h.depthsEldritchLightningCastActive &&
    !h.depthsEldritchBarrageAttackActive &&
    !h.depthsEldritchCageStrikeActive;

  if (!inInterlude && h.depthsEldritchPhase2Tone && eldritchInLiftPrep) {
    const u = clamp((t - eldritchPrepStart) / Math.max(1e-4, eldritchPrepEnd - eldritchPrepStart), 0, 1);
    const pulse = 0.55 + 0.45 * Math.sin(t * 15 + phase * 0.5);
    const R = maxSpan * 0.74;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const grd = ctx.createRadialGradient(0, 0, R * 0.06, 0, 0, R * 1.08);
    grd.addColorStop(0, `rgba(255, 220, 240, ${0.22 + 0.34 * pulse * u})`);
    grd.addColorStop(0.35, `rgba(220, 60, 120, ${0.28 * pulse + 0.15 * u})`);
    grd.addColorStop(0.72, `rgba(58, 10, 60, ${0.4 * pulse * u})`);
    grd.addColorStop(1, "rgba(8, 0, 10, 0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.08, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 150, 120, ${0.2 + 0.45 * pulse * u})`;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.52 + pulse * R * 0.05 * u, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  if (!inInterlude && h.depthsEldritchCageStrikeActive && !h.depthsEldritchLightningCastActive) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 18 + phase * 0.6);
    const R = maxSpan * 0.76;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const grd = ctx.createRadialGradient(0, 0, R * 0.05, 0, 0, R * 1.12);
    grd.addColorStop(0, `rgba(255, 228, 240, ${0.4 + 0.18 * pulse})`);
    grd.addColorStop(0.3, `rgba(200, 40, 100, ${0.32 + 0.16 * pulse})`);
    grd.addColorStop(0.65, `rgba(72, 8, 64, ${0.32 * pulse})`);
    grd.addColorStop(1, "rgba(10, 0, 14, 0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.12, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = `rgba(255, 112, 150, ${0.3 + 0.35 * pulse})`;
    ctx.lineWidth = 2.85;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.5 + pulse * R * 0.07, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  if (inInterlude) {
    const pull = inhaleEase;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    const grdV = ctx.createRadialGradient(0, 0, maxSpan * 0.08, 0, 0, maxSpan * 1.15);
    grdV.addColorStop(0, `rgba(40, 6, 18, ${0.5 * pull})`);
    grdV.addColorStop(0.45, `rgba(12, 4, 22, ${0.32 * pull})`);
    grdV.addColorStop(0.78, `rgba(4, 2, 10, ${0.1 * pull})`);
    grdV.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grdV;
    ctx.beginPath();
    ctx.arc(0, 0, maxSpan * 1.12, 0, TAU);
    ctx.fill();

    /** Deterministic 0..1 for interlude FX (no allocation). */
    const ih01 = (n) => ((n * 134775813 + 1) >>> 0) / 4294967296;

    {
      /** Elder Futhark — just outside blob shell, thick ring; still darker than inner energy. */
      const runeR = maxSpan * 1.042;
      const runeSpin = t * 0.24;
      const nRunes = 26;
      const runeChars = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛝᛟᛞ";
      const fontPx = clamp(maxSpan * 0.118, 13, 52);
      const ringEnergy = inhaleSeg ? pull : 0.45 + 0.55 * (1 - burstU01);
      const ringDim = 0.26 + 0.12 * ringEnergy * (1 - burstU01 * 0.45) + 0.05 * Math.sin(t * 1.55 + phase);
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = `rgba(42, 16, 38, ${0.52 + 0.28 * ringDim})`;
      ctx.lineWidth = Math.max(2.5, maxSpan * 0.028);
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, runeR, runeSpin * 0.15, TAU + runeSpin * 0.15);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(0, 0, runeR * 0.972, 0, TAU);
      ctx.strokeStyle = `rgba(58, 22, 48, ${0.42 + 0.28 * ringDim})`;
      ctx.lineWidth = Math.max(2, maxSpan * 0.02);
      ctx.stroke();
      ctx.font = `${fontPx}px "Times New Roman", "Noto Sans Runic", Tinos, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < nRunes; i++) {
        const ang = (i / nRunes) * TAU + runeSpin;
        const ch = runeChars[i % runeChars.length];
        ctx.save();
        ctx.rotate(ang);
        ctx.translate(runeR, 0);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = `rgba(62, 28, 54, ${0.78 + 0.18 * ringDim})`;
        ctx.fillText(ch, 0, 0);
        ctx.restore();
      }
      ctx.restore();
    }

    if (inhaleSeg) {
      ctx.globalCompositeOperation = "lighter";
      const rLim = maxSpan * 1.02;
      const blobN = 72;
      for (let i = 0; i < blobN; i++) {
        const h0 = ih01(i * 17 + 3);
        const h1 = ih01(i * 29 + 11);
        const h2 = ih01(i * 41 + 7);
        const ang = h0 * TAU + (h1 - 0.5) * 0.22;
        const speed = 13.5 + h2 * 9;
        const off = h1 * 2.17 + i * 0.019;
        let u = (t * speed + off) % 1;
        if (u < 0) u += 1;
        const easeIn = u * u * u;
        const r = rLim * (0.06 + (1 - easeIn) * (0.94 - 0.38 * pull));
        const wobble = (h2 - 0.5) * maxSpan * 0.016 * (1 - easeIn);
        const bx = Math.cos(ang) * r + wobble * Math.cos(ang * 2.1);
        const by = Math.sin(ang) * r + wobble * Math.sin(ang * 2.1);
        const br = maxSpan * (0.028 + h1 * 0.052) * (0.55 + 0.65 * pull);
        const trail = 4 * u * (1 - u);
        const aBlob = trail * trail * (0.26 + 0.48 * pull) * (0.52 + 0.48 * (1 - easeIn));
        if (aBlob < 0.03) continue;
        const mix = h2;
        const cr = Math.floor(220 + mix * 35);
        const cg = Math.floor(40 + mix * 90);
        const cb = Math.floor(95 + mix * 120);
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, br * 1.35);
        g.addColorStop(0, `rgba(255, 252, 255, ${aBlob * 0.95})`);
        g.addColorStop(0.35, `rgba(${cr}, ${cg}, ${cb}, ${aBlob * 0.88})`);
        g.addColorStop(0.72, `rgba(90, 20, 75, ${aBlob * 0.35})`);
        g.addColorStop(1, "rgba(20, 4, 28, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, br * 1.35, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "lighter";
      const corePulse = 0.35 + 0.65 * pull;
      const gCore = ctx.createRadialGradient(0, 0, 0, 0, 0, maxSpan * (0.22 + 0.2 * pull));
      gCore.addColorStop(0, `rgba(255, 235, 245, ${0.35 * corePulse})`);
      gCore.addColorStop(0.45, `rgba(200, 60, 110, ${0.28 * corePulse})`);
      gCore.addColorStop(1, "rgba(40, 8, 30, 0)");
      ctx.fillStyle = gCore;
      ctx.beginPath();
      ctx.arc(0, 0, maxSpan * (0.42 + 0.18 * pull), 0, TAU);
      ctx.fill();
    }

    if (burstU01 > 0.004) {
      const fade = (1 - burstU01) * (1 - burstU01);
      const shockR = maxSpan * (0.18 + burstEase * 1.62);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const gShock = ctx.createRadialGradient(0, 0, shockR * 0.12, 0, 0, shockR * 1.05);
      gShock.addColorStop(0, `rgba(255, 248, 252, ${0.55 * fade})`);
      gShock.addColorStop(0.25, `rgba(255, 190, 210, ${0.42 * fade})`);
      gShock.addColorStop(0.55, `rgba(180, 40, 95, ${0.28 * fade * (1 - burstEase * 0.4)})`);
      gShock.addColorStop(0.82, `rgba(70, 12, 60, ${0.12 * fade})`);
      gShock.addColorStop(1, "rgba(8, 0, 12, 0)");
      ctx.fillStyle = gShock;
      ctx.beginPath();
      ctx.arc(0, 0, shockR * 1.05, 0, TAU);
      ctx.fill();

      const outN = 48;
      for (let i = 0; i < outN; i++) {
        const h0 = ih01(i * 19 + 5);
        const h1 = ih01(i * 31 + 13);
        const h2 = ih01(i * 47 + 2);
        const ang = h0 * TAU;
        const lag = h1 * 0.22;
        const e = clamp((burstEase - lag) / 0.78, 0, 1);
        const ee = e * e * (3 - 2 * e);
        const dist = maxSpan * (0.28 + ee * 1.45);
        const ox = Math.cos(ang) * dist;
        const oy = Math.sin(ang) * dist;
        const obr = maxSpan * (0.05 + h2 * 0.09) * (1 - ee * 0.35);
        const aOut = fade * (0.38 + 0.42 * (1 - ee)) * (0.55 + 0.45 * h1);
        const g2 = ctx.createRadialGradient(ox, oy, 0, ox, oy, obr * 1.4);
        g2.addColorStop(0, `rgba(255, 240, 248, ${aOut * 0.9})`);
        g2.addColorStop(0.4, `rgba(255, 140, 170, ${aOut * 0.65})`);
        g2.addColorStop(0.75, `rgba(120, 24, 70, ${aOut * 0.28})`);
        g2.addColorStop(1, "rgba(12, 0, 14, 0)");
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(ox, oy, obr * 1.4, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  const lightningSprite = !!h.depthsEldritchPostCageLightningSprite;
  if (lightningSprite) {
    ctx.rotate(t * 16.8 + phase * 1.05);
    const flick = 0.52 + 0.48 * Math.sin(t * 44);
    ctx.globalAlpha *= clamp(flick, 0.26, 1);
    const imgL = depthsEldritchLightningImg;
    if (imgL.complete && imgL.naturalWidth > 0) {
      const iw = imgL.naturalWidth;
      const ih = imgL.naturalHeight;
      let dw = maxSpan * 0.72;
      let dh = (ih / iw) * dw;
      if (dh > maxSpan * 0.72) {
        dh = maxSpan * 0.72;
        dw = (iw / ih) * dh;
      }
      const brightL = 0.92 + 0.28 * Math.sin(t * 31);
      ctx.filter = `brightness(${brightL.toFixed(3)})`;
      ctx.drawImage(imgL, -dw * 0.5, -dh * 0.5, dw, dh);
      ctx.filter = "none";
    } else {
      ctx.fillStyle = "rgba(200, 240, 255, 0.55)";
      ctx.beginPath();
      ctx.arc(0, 0, maxSpan * 0.34, 0, TAU);
      ctx.fill();
    }
  } else {
    ctx.rotate(DEPTHS_ELDRITCH_BOSS_SPRITE_YAW);

    const img = depthsEldritchBossImg;
    if (img.complete && img.naturalWidth > 0) {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      let dw = maxSpan;
      let dh = (ih / iw) * dw;
      if (dh > maxSpan) {
        dh = maxSpan;
        dw = (iw / ih) * dh;
      }
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.95 + phase * 1.15);
      /** Deeper troughs than before; peaks ~unchanged — reds stay on `eldritchProtectedRed` path. */
      const brightMul = inInterlude
        ? Math.max(
            0.028,
            0.05 +
              inhaleEase * 0.055 +
              (inhaleSeg ? 0.018 * Math.sin(t * 15) : -0.012 * burstEase) +
              (burstU01 > 0.02 ? burstEase * 0.04 : 0),
          )
        : h.depthsEldritchLightningCastActive
          ? 0.62 + pulse * 0.38
          : h.depthsEldritchBarrageAttackActive
            ? 0.54 + pulse * 0.42
            : h.depthsEldritchCageStrikeActive
              ? 0.52 + pulse * 0.4
              : h.depthsEldritchPhase3Tone
                ? 0.34 + pulse * 0.62
                : 0.32 + pulse * 0.78;
      const shaded = eldritchBossShadedCanvas(img, (dw + 0.5) | 0, (dh + 0.5) | 0, brightMul);
      if (shaded) {
        ctx.drawImage(shaded, -dw * 0.5, -dh * 0.5, dw, dh);
      } else {
        ctx.filter = `brightness(${brightMul.toFixed(3)})`;
        ctx.drawImage(img, -dw * 0.5, -dh * 0.5, dw, dh);
        ctx.filter = "none";
      }
    } else {
      ctx.fillStyle = "#1a1028";
      ctx.beginPath();
      ctx.arc(0, 0, maxSpan * 0.45, 0, TAU);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** @param {CanvasRenderingContext2D} ctx
 * @param {object} h
 * @param {{ colourblind?: boolean; simElapsed?: number; depthsPath?: boolean }} [opts]
 */
export function drawHunterBody(ctx, h, opts = {}) {
  const tNow = Number.isFinite(Number(opts.simElapsed)) ? Number(opts.simElapsed) : 0;
  if (h.hallsPieceType && HALLS_COIN_PIECE_TYPES.has(String(h.hallsPieceType))) {
    const x = Number(h.x ?? 0);
    const y = Number(h.y ?? 0);
    const r = Number(h.r ?? HALLS_COIN_RADIUS_PX);
    if (h.type === "hallsBishop") {
      const prayer = h.hallsBishopHeavenState === "praying";
      const activeHeaven = h.hallsBishopHeavenState === "active";
      if (prayer || activeHeaven) {
        const holyPulse = 0.5 + 0.5 * Math.sin(tNow * 7.8 + Number(h.bornAt ?? 0) * 0.13);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const aura = ctx.createRadialGradient(x, y, r * 0.2, x, y, r + 34);
        const auraMul = prayer ? 1 : 0.72;
        aura.addColorStop(0, `rgba(255,255,255,${(0.2 + 0.22 * holyPulse) * auraMul})`);
        aura.addColorStop(0.45, `rgba(186, 230, 253, ${(0.14 + 0.16 * holyPulse) * auraMul})`);
        aura.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(x, y, r + 34, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      if (prayer) {
        // Prayer phase: light from heaven shines on the bishop itself.
        const pulse = 0.5 + 0.5 * Math.sin(tNow * 10.5);
        ctx.save();
        const cone = ctx.createRadialGradient(x, y - 22, 8, x, y, 130);
        cone.addColorStop(0, `rgba(255,255,255,${0.24 + 0.18 * pulse})`);
        cone.addColorStop(0.5, "rgba(250, 250, 255, 0.2)");
        cone.addColorStop(1, "rgba(200, 210, 255, 0)");
        ctx.fillStyle = cone;
        ctx.beginPath();
        ctx.ellipse(x, y + 6, 84, 40, 0, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${0.3 + 0.28 * pulse})`;
        ctx.lineWidth = 5 + pulse * 2.6;
        ctx.shadowColor = "rgba(255,255,255,0.75)";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(x, y - 480);
        ctx.lineTo(x, y + 4);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
      }
      if (activeHeaven) {
        // Active phase: a separate heaven beam chases the player.
        const beamX = Number(h.hallsBishopHeavenX ?? x);
        const beamY = Number(h.hallsBishopHeavenY ?? y);
        const pulse = 0.5 + 0.5 * Math.sin(tNow * 9.2);
        const drift = Math.sin(tNow * 8.5 + beamX * 0.02) * 1.8;
        const shaftTopY = beamY - 460;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const pool = ctx.createRadialGradient(beamX, beamY - 8, 6, beamX, beamY, 108);
        pool.addColorStop(0, `rgba(255,255,255,${0.34 + 0.2 * pulse})`);
        pool.addColorStop(0.35, "rgba(219, 234, 254, 0.24)");
        pool.addColorStop(1, "rgba(147, 197, 253, 0)");
        ctx.fillStyle = pool;
        ctx.beginPath();
        ctx.ellipse(beamX, beamY + 5, 72 + pulse * 6, 34 + pulse * 3, 0, 0, TAU);
        ctx.fill();

        // Soft atmospheric column that clearly fades from the sky downward.
        const skyMist = ctx.createLinearGradient(beamX, shaftTopY - 30, beamX, beamY + 8);
        skyMist.addColorStop(0, "rgba(219, 234, 254, 0)");
        skyMist.addColorStop(0.2, "rgba(219, 234, 254, 0.08)");
        skyMist.addColorStop(0.68, "rgba(191, 219, 254, 0.2)");
        skyMist.addColorStop(1, `rgba(255,255,255,${0.24 + 0.16 * pulse})`);
        ctx.strokeStyle = skyMist;
        ctx.lineWidth = 20 + pulse * 4;
        ctx.shadowColor = "rgba(191, 219, 254, 0.38)";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(beamX + drift * 0.2, shaftTopY - 18);
        ctx.lineTo(beamX, beamY + 4);
        ctx.stroke();

        const outer = ctx.createLinearGradient(beamX, shaftTopY, beamX, beamY + 6);
        outer.addColorStop(0, "rgba(191, 219, 254, 0)");
        outer.addColorStop(0.12, `rgba(219, 234, 254, ${0.1 + 0.06 * pulse})`);
        outer.addColorStop(0.64, `rgba(147, 197, 253, ${0.4 + 0.15 * pulse})`);
        outer.addColorStop(1, `rgba(255,255,255, ${0.34 + 0.2 * pulse})`);
        ctx.strokeStyle = outer;
        ctx.lineWidth = 13 + pulse * 2.8;
        ctx.shadowColor = "rgba(191, 219, 254, 0.65)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(beamX + drift * 0.35, shaftTopY);
        ctx.lineTo(beamX, beamY + 3);
        ctx.stroke();

        const core = ctx.createLinearGradient(beamX, shaftTopY, beamX, beamY + 6);
        core.addColorStop(0, "rgba(255,255,255,0)");
        core.addColorStop(0.2, `rgba(255,255,255,${0.55 + 0.16 * pulse})`);
        core.addColorStop(0.8, `rgba(255,255,255,${0.9 + 0.1 * pulse})`);
        core.addColorStop(1, `rgba(255,255,255,${0.96})`);
        ctx.strokeStyle = core;
        ctx.lineWidth = 3.8 + pulse * 1.1;
        ctx.shadowColor = "rgba(255,255,255,0.8)";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(beamX + drift, shaftTopY + 8);
        ctx.lineTo(beamX, beamY + 3);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = `rgba(255,255,255,${0.3 + 0.28 * pulse})`;
        ctx.beginPath();
        ctx.ellipse(beamX, beamY + 5, 26 + pulse * 6, 11 + pulse * 2.5, 0, 0, TAU);
        ctx.stroke();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = `rgba(186, 230, 253,${0.2 + 0.18 * pulse})`;
        ctx.beginPath();
        ctx.ellipse(beamX, beamY + 5, 38 + pulse * 8, 16 + pulse * 3, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }
    const hallsTeleUntil = Number(h.hallsTeleportFxUntil ?? 0);
    if (hallsTeleUntil > tNow) {
      const gx = Number(h.hallsTeleportGhostX);
      const gy = Number(h.hallsTeleportGhostY);
      if (Number.isFinite(gx) && Number.isFinite(gy)) {
        const rem = hallsTeleUntil - tNow;
        const u = clamp(rem / 0.36, 0, 1);
        const pulse = 0.5 + 0.5 * Math.sin(tNow * 28 + u * 6);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const R = r * 2.1 * (0.55 + (1 - u) * 0.5);
        const grd = ctx.createRadialGradient(gx, gy, 2, gx, gy, R);
        grd.addColorStop(0, `rgba(255, 250, 255, ${0.34 * (1 - u) * pulse})`);
        grd.addColorStop(0.25, `rgba(120, 200, 255, ${0.4 * (1 - u * 0.5)})`);
        grd.addColorStop(0.55, `rgba(40, 20, 80, ${0.52 * (1 - u * 0.3)})`);
        grd.addColorStop(1, "rgba(4, 0, 10, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(gx, gy, R, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = `rgba(224, 242, 255, ${0.52 * (1 - u * 0.4)})`;
        ctx.lineWidth = 3 + (1 - u) * 4;
        ctx.beginPath();
        ctx.arc(gx, gy, R * (0.42 + 0.12 * pulse), 0, TAU);
        ctx.stroke();
        ctx.setLineDash([7, 11]);
        ctx.beginPath();
        ctx.arc(gx, gy, R * 0.72, -tNow * 2.2, -tNow * 2.2 + TAU * 0.88);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }
    if (h.type === "hallsRook" && !h.hallsKingLineProjectile) {
      const pulse = 0.5 + 0.5 * Math.sin(tNow * 7.1 + Number(h.bornAt ?? 0) * 0.3);
      const auraR = r + 92 + pulse * 10;
      const ring1 = auraR;
      const ring2 = auraR * (0.78 + 0.04 * Math.sin(tNow * 5.4));
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, auraR + 28);
      g.addColorStop(0, `rgba(224, 242, 254, ${0.08 + 0.07 * pulse})`);
      g.addColorStop(0.48, `rgba(56, 189, 248, ${0.12 + 0.08 * pulse})`);
      g.addColorStop(1, "rgba(30, 64, 175, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, auraR + 28, 0, TAU);
      ctx.fill();

      ctx.setLineDash([10, 9]);
      ctx.lineDashOffset = -tNow * 58;
      ctx.strokeStyle = `rgba(147, 197, 253, ${0.42 + 0.24 * pulse})`;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(x, y, ring1, 0, TAU);
      ctx.stroke();

      ctx.setLineDash([6, 12]);
      ctx.lineDashOffset = tNow * 44;
      ctx.strokeStyle = `rgba(191, 219, 254, ${0.32 + 0.2 * pulse})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y, ring2, 0, TAU);
      ctx.stroke();
      ctx.restore();
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
    }
    if (h.type === "hallsKing" && Number(h.hallsKingGlowUntil ?? 0) > tNow) {
      const glow = String(h.hallsKingGlowColor || "#93c5fd");
      const startAt = Number(h.hallsKingGlowStartAt ?? (Number(h.hallsKingGlowUntil) - 4));
      const life = Math.max(0.001, Number(h.hallsKingGlowUntil) - startAt);
      const rem = Math.max(0, Number(h.hallsKingGlowUntil) - tNow);
      const fade = Math.max(0, Math.min(1, rem / life));
      const castPhase = 1 - fade;
      const pulseFast = 0.5 + 0.5 * Math.sin(tNow * 11.4);
      const pulseSlow = 0.5 + 0.5 * Math.sin(tNow * 4.3 + 0.8);
      const burst = Math.max(0, 1 - castPhase / 0.2);
      const intensity = Math.max(0, fade * fade * (1.1 + pulseFast * 0.35));
      const arenaCx = Number.isFinite(Number(h.hallsLockCenterX)) ? Number(h.hallsLockCenterX) : x;
      const arenaCy = Number.isFinite(Number(h.hallsLockCenterY)) ? Number(h.hallsLockCenterY) : y;

      if (h.hallsKingGlowVoid) {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        const voidR = r + 58 + pulseSlow * 22 + burst * 30;
        const gVoid = ctx.createRadialGradient(x, y, r * 0.15, x, y, voidR);
        gVoid.addColorStop(0, `rgba(12, 10, 18, ${0.55 * intensity + 0.2 * burst})`);
        gVoid.addColorStop(0.35, `rgba(8, 8, 14, ${0.42 * intensity})`);
        gVoid.addColorStop(0.72, `rgba(30, 27, 45, ${0.22 * intensity})`);
        gVoid.addColorStop(1, "rgba(12, 12, 20, 0)");
        ctx.fillStyle = gVoid;
        ctx.beginPath();
        ctx.arc(x, y, voidR, 0, TAU);
        ctx.fill();

        const tileVoidR = r * 6.2 + pulseSlow * 36 + burst * 26;
        const gTile = ctx.createRadialGradient(arenaCx, arenaCy, 2, arenaCx, arenaCy, tileVoidR);
        gTile.addColorStop(0, `rgba(6, 6, 10, ${0.5 * intensity + 0.18 * burst})`);
        gTile.addColorStop(0.5, `rgba(24, 20, 38, ${0.28 * intensity})`);
        gTile.addColorStop(1, "rgba(10, 10, 16, 0)");
        ctx.fillStyle = gTile;
        ctx.beginPath();
        ctx.arc(arenaCx, arenaCy, tileVoidR, 0, TAU);
        ctx.fill();

        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `rgba(167, 139, 250, ${0.22 * intensity + 0.12 * pulseFast})`;
        ctx.lineWidth = 2.2;
        ctx.setLineDash([5, 9]);
        ctx.lineDashOffset = -tNow * 88;
        ctx.beginPath();
        ctx.arc(arenaCx, arenaCy, tileVoidR * (0.56 + 0.04 * pulseSlow), 0, TAU);
        ctx.stroke();
        ctx.setLineDash([3, 11]);
        ctx.lineDashOffset = tNow * 102;
        ctx.strokeStyle = `rgba(226, 232, 240, ${0.14 * intensity + 0.1 * burst})`;
        ctx.beginPath();
        ctx.arc(x, y, r + 40 + pulseFast * 6, 0, TAU);
        ctx.stroke();
        ctx.restore();
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
      } else {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      // Large floor bloom + outer haze so the cast reads from far away.
      const floorAuraR = r + 62 + pulseSlow * 16 + burst * 24;
      const gFloor = ctx.createRadialGradient(x, y, r * 0.2, x, y, floorAuraR);
      gFloor.addColorStop(0, `${glow}00`);
      gFloor.addColorStop(0.18, `${glow}6a`);
      gFloor.addColorStop(0.55, `${glow}28`);
      gFloor.addColorStop(1, "rgba(15,23,42,0)");
      ctx.fillStyle = gFloor;
      ctx.beginPath();
      ctx.arc(x, y, floorAuraR, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Arena-center tint pulse (base wash + edge ring) so the floor read is unmistakable.
      const tileTintR = r * 6.9 + pulseSlow * 34 + burst * 28;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      drawCircle(ctx, arenaCx, arenaCy, tileTintR, glow, (0.22 + 0.08 * pulseFast) * intensity);
      drawCircle(ctx, arenaCx, arenaCy, tileTintR * 0.78, "#ffffff", (0.06 + 0.04 * pulseSlow) * intensity);
      ctx.strokeStyle = `rgba(248, 250, 252, ${(0.16 + 0.12 * pulseFast) * intensity})`;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(arenaCx, arenaCy, tileTintR * (0.9 + 0.04 * pulseSlow), 0, TAU);
      ctx.stroke();
      ctx.restore();

      drawCircle(ctx, x, y, r + 44 + pulseSlow * 8 + burst * 7, glow, (0.44 + 0.2 * pulseFast) * intensity);
      drawCircle(ctx, x, y, r + 26 + pulseFast * 6, glow, (0.3 + 0.14 * pulseSlow) * intensity);
      drawCircle(ctx, x, y, r + 12 + pulseFast * 2.4, "#ffffff", (0.24 + 0.12 * pulseFast) * intensity);

      // Rotating runic rings + crown spikes.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(241, 245, 249, ${0.34 * intensity + 0.2 * pulseFast * intensity})`;
      ctx.lineWidth = 1.9;
      ctx.setLineDash([13, 8]);
      ctx.lineDashOffset = -tNow * 74;
      ctx.beginPath();
      ctx.arc(x, y, r + 44 + pulseFast * 3.2, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([4, 10]);
      ctx.lineDashOffset = tNow * 61;
      ctx.strokeStyle = `rgba(191, 219, 254, ${0.3 * intensity + 0.14 * pulseSlow * intensity})`;
      ctx.beginPath();
      ctx.arc(x, y, r + 57 + pulseSlow * 4.2, 0, TAU);
      ctx.stroke();
      ctx.restore();

      const spokeCount = 10;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(255,255,255,${0.2 * intensity + 0.22 * burst})`;
      ctx.lineWidth = 2.3;
      for (let i = 0; i < spokeCount; i++) {
        const a = (i / spokeCount) * TAU + tNow * 0.9;
        const inner = r + 36 + pulseSlow * 5;
        const outer = inner + 22 + burst * 20 + (i % 2 ? 6 : 0);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * inner, y + Math.sin(a) * inner);
        ctx.lineTo(x + Math.cos(a) * outer, y + Math.sin(a) * outer);
        ctx.stroke();
      }
      ctx.restore();

      // Denser embers for motion and readability.
      const pCount = 24;
      for (let i = 0; i < pCount; i++) {
        const a = tNow * (1.5 + i * 0.03) + i * 0.54;
        const ringR = r + 26 + ((i % 6) * 8) + Math.sin(tNow * 2.7 + i * 0.41) * 5;
        const px = x + Math.cos(a) * ringR;
        const py = y + Math.sin(a * 1.12) * ringR * 0.8;
        const pr = 1.3 + (i % 4) * 0.5 + pulseFast * 0.35;
        drawCircle(ctx, px, py, pr, glow, (0.14 + 0.1 * pulseFast + 0.12 * burst) * intensity);
      }
      }
    }
    if (h.hallsHolyGlow) {
      const holyPulse = 0.5 + 0.5 * Math.sin((Number(h.bornAt ?? 0) + x * 0.005 + y * 0.004) * 7.2);
      drawCircle(ctx, x, y, r + 12 + holyPulse * 3.5, "#f8fafc", 0.14 + holyPulse * 0.12);
      drawCircle(ctx, x, y, r + 7 + holyPulse * 2.2, "#ddd6fe", 0.12 + holyPulse * 0.1);
    }
    drawHallsChessCoin(ctx, h, opts);
    return;
  }
  if (h.type === "depthsTentacle") {
    const t = Number(opts.simElapsed);
    drawDepthsTentacle(ctx, h, Number.isFinite(t) ? t : 0);
    return;
  }
  if (h.type === "depthsEldritchBloom") {
    const t = Number(opts.simElapsed);
    drawDepthsEldritchBloom(ctx, h, Number.isFinite(t) ? t : 0);
    return;
  }
  if (h.type === "depthsEldritchBarrageBolt") {
    const t = Number(opts.simElapsed);
    drawDepthsEldritchBarrageBolt(ctx, h, Number.isFinite(t) ? t : 0);
    return;
  }
  if (h.type === "depthsEldritchCageLunge") {
    drawDepthsEldritchCageLunge(ctx, h, opts);
    return;
  }
  if (h.type === "cryptSpawner" && h.cryptDisguised) {
    const s = 35;
    const pulse = 0.5 + 0.5 * Math.sin((Number(h.bornAt ?? 0) + h.x * 0.01 + h.y * 0.01) * 4.2);
    ctx.save();
    ctx.fillStyle = "#1b1d24";
    ctx.strokeStyle = "#8b95a8";
    ctx.lineWidth = 2;
    ctx.fillRect(h.x - s / 2, h.y - s / 2, s, s);
    ctx.strokeRect(h.x - s / 2, h.y - s / 2, s, s);
    ctx.strokeStyle = `rgba(226, 232, 240, ${0.18 + pulse * 0.18})`;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(h.x - s / 2 + 1.8, h.y - s / 2 + 1.8, s - 3.6, s - 3.6);
    ctx.restore();
    return;
  }
  const boneSwarmGhostFast = h.type === "fast" && !!h.boneSwarmPhasing;
  const depthsBoltFast = h.type === "fast" && !!h.depthsBoltMinion;
  const swampMudFast = h.type === "fast" && !!h.swampMudSpawn;
  const colourblind = !!opts.colourblind;
  const depthsSniperPal = h.type === "sniper" && !!opts.depthsPath;
  const hallsPathwayCream = !!h.hallsPathwayCreamEnemy;
  const pal = colourblind
    ? { light: "#9ca89a", core: "#5a6658", shadow: "#3a4239", rim: "#6b7569", mark: "#b4c0b0" }
    : hallsPathwayCream
      ? { light: "#faf6f0", core: "#ebe3d6", shadow: "#c4b8a4", rim: "#fffefb", mark: "#ddd2c4" }
      : boneSwarmGhostFast
      ? { light: "#f8fafc", core: "#cbd5e1", shadow: "#64748b", rim: "#e2e8f0", mark: "#ffffff" }
      : depthsBoltFast
        ? hunterPalette("depthsBoltMinion")
        : swampMudFast
          ? { light: "#5c4a3a", core: "#342a1f", shadow: "#120e0a", rim: "#3d3024", mark: "#2a2218" }
          : depthsSniperPal
            ? hunterPalette("depthsSniper")
            : hunterPalette(h.type);
  const { x, y, r } = h;
  const alpha = clamp(Number(h.opacity ?? 1), 0, 1);
  const cryptRevealU = h.type === "cryptSpawner" ? clamp(Number(h.cryptRevealU ?? 1), 0, 1) : 1;
  const cryptRevealPulse = h.type === "cryptSpawner" ? 1 + (1 - cryptRevealU) * 0.22 : 1;
  const ghostTelegraph = h.type === "ghost" && (h.ghostPhase === "telegraph1" || h.ghostPhase === "telegraph2");
  const teleU = ghostTelegraph ? clamp(Number(h.ghostTelegraphU ?? 0), 0, 1) : 0;
  const rBase = ghostTelegraph ? r * (1 - 0.12 * Math.sin(teleU * Math.PI)) : r;
  const rBody = rBase * cryptRevealPulse;
  if (h.type === "ghost" && Array.isArray(h.motionTrail)) {
    for (const tr of h.motionTrail) {
      const ta = clamp(Number(tr.alpha ?? 0), 0, 1) * 0.55 * alpha;
      if (ta <= 0.01) continue;
      drawCircle(ctx, tr.x, tr.y, tr.r ?? r, "#9ca3af", ta);
    }
  }
  if (ghostTelegraph) {
    const dx = Number(h.ghostDashDir?.x ?? 1);
    const dy = Number(h.ghostDashDir?.y ?? 0);
    const lenFull = Math.max(40, Number(h.ghostTelegraphLineLen ?? 200));
    const len = lenFull * Math.max(0.001, teleU);
    const x2 = x + dx * len;
    const y2 = y + dy * len;
    const lineA = 0.42 + teleU * 0.48;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = `rgba(226, 232, 240, ${lineA})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(148, 163, 184, ${lineA * 0.38})`;
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
  if (h.type === "ghost") {
    const aura = clamp(Number(h.ghostAura ?? 0.75), 0, 1);
    drawCircle(ctx, x, y, rBody + 11 + aura * 3, "#cbd5e1", 0.13 + aura * 0.08);
    drawCircle(ctx, x, y, rBody + 6 + aura * 2, "#94a3b8", 0.1 + aura * 0.06);
  }
  if (boneSwarmGhostFast) {
    const pulse = 0.5 + 0.5 * Math.sin((Number(h.bornAt ?? 0) + x * 0.01 + y * 0.01) * 6);
    drawCircle(ctx, x, y, rBody + 6 + pulse * 3, "#e2e8f0", 0.16 + pulse * 0.12);
    drawCircle(ctx, x, y, rBody + 2 + pulse * 1.5, "#cbd5e1", 0.18 + pulse * 0.14);
  }
  if (h.type === "cryptSpawner" && cryptRevealU < 1) {
    const flash = 1 - cryptRevealU;
    drawCircle(ctx, x, y, rBody + 24 + flash * 11, "#ffffff", 0.1 + flash * 0.24);
    drawCircle(ctx, x, y, rBody + 15 + flash * 8, "#e2e8f0", 0.14 + flash * 0.2);
  }
  if (h.type === "cryptSpawner") {
    const pulse = 0.5 + 0.5 * Math.sin((Number(h.cryptRevealU ?? 1) + x * 0.004 + y * 0.004) * 8.5);
    drawCircle(ctx, x, y, rBody + 9 + pulse * 3, "#cbd5e1", 0.12 + pulse * 0.1);
    drawCircle(ctx, x, y, rBody + 4 + pulse * 2, "#f8fafc", 0.08 + pulse * 0.08);
  }
  if (h.hallsHolyGlow) {
    const holyPulse = 0.5 + 0.5 * Math.sin((Number(h.bornAt ?? 0) + x * 0.005 + y * 0.004) * 7.2);
    drawCircle(ctx, x, y, rBody + 12 + holyPulse * 3.5, "#f8fafc", 0.14 + holyPulse * 0.12);
    drawCircle(ctx, x, y, rBody + 7 + holyPulse * 2.2, "#ddd6fe", 0.12 + holyPulse * 0.1);
  }
  const g = ctx.createRadialGradient(x - rBody * 0.38, y - rBody * 0.42, rBody * 0.08, x, y, rBody);
  g.addColorStop(0, pal.light);
  g.addColorStop(0.55, pal.core);
  g.addColorStop(1, pal.shadow);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, rBody, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = pal.rim;
  ctx.lineWidth = 2;
  ctx.stroke();
  if (h.fireGlow) {
    ctx.strokeStyle = "rgba(248, 113, 113, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, rBody + 4.5, 0, TAU);
    ctx.stroke();
  }
  const mx = h.dir.x * rBody * 0.38;
  const my = h.dir.y * rBody * 0.38;
  ctx.fillStyle = pal.mark;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(x + mx, y + my, rBody * 0.22, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawCircle(ctx, x, y, r, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawProjectileBody(ctx, p) {
  if (p.hallsKingSpiralBolt) {
    const ang = Math.atan2(Number(p.vy ?? 0), Number(p.vx ?? 1));
    const rad = p.r ?? 8;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(ang);
    const g = ctx.createRadialGradient(-rad * 0.4, 0, 0.3, 0, 0, rad * 1.35);
    g.addColorStop(0, "rgba(250, 250, 250, 0.95)");
    g.addColorStop(0.25, "rgba(100, 90, 130, 0.88)");
    g.addColorStop(0.55, "rgba(28, 26, 38, 0.92)");
    g.addColorStop(1, "rgba(6, 6, 10, 0.35)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, rad * 1.15, rad * 0.62, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(196, 181, 253, 0.55)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (p.hallsQueenArcBolt) {
    const ang = Math.atan2(Number(p.vy ?? 0), Number(p.vx ?? 1));
    const len = (p.r ?? 8) * 2.35;
    const halfW = (p.r ?? 8) * 0.62;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(ang);
    const g = ctx.createLinearGradient(-len * 0.5, 0, len * 0.55, 0);
    g.addColorStop(0, "rgba(69, 10, 10, 0.85)");
    g.addColorStop(0.38, "rgba(127, 29, 29, 0.95)");
    g.addColorStop(0.72, "rgba(185, 28, 28, 0.95)");
    g.addColorStop(1, "rgba(254, 202, 202, 0.88)");
    ctx.fillStyle = g;
    ctx.beginPath();
    // Glass shard silhouette (sharp spear).
    ctx.moveTo(len * 0.58, 0);
    ctx.lineTo(-len * 0.18, halfW * 0.95);
    ctx.lineTo(-len * 0.56, halfW * 0.44);
    ctx.lineTo(-len * 0.48, 0);
    ctx.lineTo(-len * 0.56, -halfW * 0.44);
    ctx.lineTo(-len * 0.18, -halfW * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(254, 226, 226, 0.84)";
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.strokeStyle = "rgba(248, 113, 113, 0.62)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-len * 0.3, -halfW * 0.22);
    ctx.lineTo(len * 0.38, 0);
    ctx.lineTo(-len * 0.3, halfW * 0.22);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (p.fireCone) {
    const gFire = ctx.createRadialGradient(p.x - p.r * 0.32, p.y - p.r * 0.32, 0.5, p.x, p.y, p.r);
    gFire.addColorStop(0, "#fee2e2");
    gFire.addColorStop(0.4, "#fb7185");
    gFire.addColorStop(1, "#7f1d1d");
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, TAU);
    ctx.fillStyle = gFire;
    ctx.fill();
    ctx.strokeStyle = "rgba(248, 113, 113, 0.9)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
    return;
  }
  const g = ctx.createRadialGradient(p.x - 1, p.y - 1, 0.5, p.x, p.y, p.r);
  g.addColorStop(0, "#fef3c7");
  g.addColorStop(0.4, "#f59e0b");
  g.addColorStop(1, "#b45309");
  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

/** REFERENCE `drawLaserBeamFancy` — `now` replaces `state.elapsed` for pulses. */
export function drawLaserBeamFancy(ctx, beam, now) {
  const x1 = beam.x1;
  const y1 = beam.y1;
  const x2 = beam.x2;
  const y2 = beam.y2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const blue = !!beam.blueLaser;
  const boneGhostGrey = !!beam.boneGhostBeam && !blue;
  const boneGhostPaleBlue = !!beam.boneGhostBlueBeam && blue;
  const pulse = 0.5 + 0.5 * Math.sin(now * (beam.warning ? 26 : 16));

  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(ang);
  ctx.lineCap = "round";

  if (beam.hallsPawnGamma) {
    const t = beam.warning
      ? clamp((now - beam.bornAt) / Math.max(0.001, beam.expiresAt - beam.bornAt), 0, 1)
      : 0;
    const fade = beam.warning ? 0.42 + 0.58 * (1 - t) : 1;
    ctx.shadowBlur = beam.warning ? 24 : 30;
    ctx.shadowColor = "rgba(168, 85, 247, 0.82)";
    const gWide = ctx.createLinearGradient(0, 0, len, 0);
    gWide.addColorStop(0, `rgba(233, 213, 255, ${0.34 * fade})`);
    gWide.addColorStop(0.3, `rgba(147, 51, 234, ${0.84 * fade})`);
    gWide.addColorStop(0.7, `rgba(56, 189, 248, ${0.78 * fade})`);
    gWide.addColorStop(1, `rgba(30, 27, 75, ${0.72 * fade})`);
    ctx.strokeStyle = gWide;
    ctx.lineWidth = (beam.warning ? 18 : 22) + pulse * 7;
    if (beam.warning) {
      ctx.setLineDash([20, 10]);
      ctx.lineDashOffset = -now * 180;
    }
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.strokeStyle = `rgba(245, 208, 254, ${0.6 + 0.35 * pulse})`;
    ctx.lineWidth = (beam.warning ? 6 : 8) + pulse * 2.4;
    if (beam.warning) {
      ctx.setLineDash([10, 12]);
      ctx.lineDashOffset = now * 130;
    } else {
      ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    if (!beam.warning) {
      const wiggle = 1.8 + Math.sin(now * 18 + len * 0.003) * 1.2;
      ctx.strokeStyle = `rgba(186, 230, 253, ${0.42 + 0.26 * pulse})`;
      ctx.lineWidth = 3.2 + pulse * 1.4;
      ctx.beginPath();
      ctx.moveTo(0, wiggle);
      ctx.lineTo(len, wiggle * 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -wiggle);
      ctx.lineTo(len, -wiggle * 0.8);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    ctx.restore();
    return;
  }

  if (beam.depthsPurpleLaser) {
    const t = beam.warning
      ? clamp((now - beam.bornAt) / Math.max(0.001, beam.expiresAt - beam.bornAt), 0, 1)
      : 0;
    const fade = 0.48 + 0.5 * (1 - t * 0.3);
    ctx.shadowBlur = 22;
    ctx.shadowColor = "rgba(167, 139, 250, 0.5)";
    const gWide = ctx.createLinearGradient(0, 0, len, 0);
    gWide.addColorStop(0, `rgba(204, 251, 241, ${0.16 * fade})`);
    gWide.addColorStop(0.38, `rgba(45, 212, 191, ${0.42 * fade + 0.12 * pulse})`);
    gWide.addColorStop(0.72, `rgba(167, 139, 250, ${0.38 * fade})`);
    gWide.addColorStop(1, `rgba(88, 28, 135, ${0.36 * fade})`);
    ctx.strokeStyle = gWide;
    ctx.lineWidth = (beam.warning ? 10 : 9) + pulse * 4;
    if (beam.warning) ctx.setLineDash([15, 10]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.strokeStyle = `rgba(216, 180, 254, ${0.44 + 0.34 * pulse})`;
    ctx.lineWidth = 2.8 + pulse * 1.6;
    if (beam.warning) ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    ctx.restore();
    return;
  }

  if (beam.warning) {
    const t = clamp((now - beam.bornAt) / Math.max(0.001, beam.expiresAt - beam.bornAt), 0, 1);
    const fade = 0.42 + 0.48 * (1 - t * 0.4);
    if (boneGhostPaleBlue) {
      ctx.shadowBlur = 22;
      ctx.shadowColor = "rgba(186, 230, 253, 0.65)";
      const gWide = ctx.createLinearGradient(0, 0, len, 0);
      gWide.addColorStop(0, `rgba(255, 255, 255, ${0.16 * fade})`);
      gWide.addColorStop(0.35, `rgba(224, 242, 254, ${0.42 * fade + 0.14 * pulse})`);
      gWide.addColorStop(1, `rgba(125, 211, 252, ${0.36 * fade})`);
      ctx.strokeStyle = gWide;
      ctx.lineWidth = 11 + pulse * 5;
      ctx.setLineDash([16, 9]);
      ctx.lineDashOffset = -now * 130;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + 0.38 * pulse})`;
      ctx.lineWidth = 3.2 + pulse * 1.8;
      ctx.setLineDash([9, 11]);
      ctx.lineDashOffset = now * 100;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    } else if (boneGhostGrey) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = "rgba(203, 213, 225, 0.55)";
      const gWide = ctx.createLinearGradient(0, 0, len, 0);
      gWide.addColorStop(0, `rgba(248, 250, 252, ${0.12 * fade})`);
      gWide.addColorStop(0.35, `rgba(226, 232, 240, ${0.4 * fade + 0.14 * pulse})`);
      gWide.addColorStop(1, `rgba(100, 116, 139, ${0.34 * fade})`);
      ctx.strokeStyle = gWide;
      ctx.lineWidth = 11 + pulse * 5;
      ctx.setLineDash([16, 9]);
      ctx.lineDashOffset = -now * 130;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.34 + 0.4 * pulse})`;
      ctx.lineWidth = 3.2 + pulse * 1.8;
      ctx.setLineDash([9, 11]);
      ctx.lineDashOffset = now * 100;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    } else {
      ctx.shadowBlur = blue ? 20 : 16;
      ctx.shadowColor = blue ? "rgba(56, 189, 248, 0.75)" : "rgba(248, 113, 113, 0.7)";
      const gWide = ctx.createLinearGradient(0, 0, len, 0);
      if (blue) {
        gWide.addColorStop(0, `rgba(191, 219, 254, ${0.12 * fade})`);
        gWide.addColorStop(0.35, `rgba(96, 165, 250, ${0.38 * fade + 0.12 * pulse})`);
        gWide.addColorStop(1, `rgba(30, 64, 175, ${0.35 * fade})`);
      } else {
        gWide.addColorStop(0, `rgba(254, 226, 226, ${0.14 * fade})`);
        gWide.addColorStop(0.35, `rgba(248, 113, 113, ${0.42 * fade + 0.18 * pulse})`);
        gWide.addColorStop(1, `rgba(127, 29, 29, ${0.38 * fade})`);
      }
      ctx.strokeStyle = gWide;
      ctx.lineWidth = 11 + pulse * 5;
      ctx.setLineDash([16, 9]);
      ctx.lineDashOffset = -now * 130;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();

      ctx.strokeStyle = blue
        ? `rgba(224, 242, 254, ${0.35 + 0.4 * pulse})`
        : `rgba(254, 249, 239, ${0.38 + 0.42 * pulse})`;
      ctx.lineWidth = 3.2 + pulse * 1.8;
      ctx.setLineDash([9, 11]);
      ctx.lineDashOffset = now * 100;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    }
  } else if (boneGhostPaleBlue) {
    ctx.shadowBlur = 26;
    ctx.shadowColor = "rgba(186, 230, 253, 0.75)";
    const gBody = ctx.createLinearGradient(0, 0, len, 0);
    gBody.addColorStop(0, "rgba(255, 255, 255, 0.96)");
    gBody.addColorStop(0.2, "rgba(240, 249, 255, 0.96)");
    gBody.addColorStop(0.45, "rgba(186, 230, 253, 0.95)");
    gBody.addColorStop(0.72, "rgba(125, 211, 252, 0.92)");
    gBody.addColorStop(1, "rgba(56, 189, 248, 0.78)");
    ctx.strokeStyle = gBody;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (boneGhostGrey) {
    ctx.shadowBlur = 22;
    ctx.shadowColor = "rgba(226, 232, 240, 0.7)";
    const gBody = ctx.createLinearGradient(0, 0, len, 0);
    gBody.addColorStop(0, "rgba(255, 255, 255, 0.96)");
    gBody.addColorStop(0.22, "rgba(241, 245, 249, 0.96)");
    gBody.addColorStop(0.5, "rgba(203, 213, 225, 0.95)");
    gBody.addColorStop(0.78, "rgba(148, 163, 184, 0.9)");
    gBody.addColorStop(1, "rgba(71, 85, 105, 0.82)");
    ctx.strokeStyle = gBody;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else {
    ctx.shadowBlur = blue ? 28 : 24;
    ctx.shadowColor = blue ? "rgba(56, 189, 248, 0.85)" : "rgba(251, 113, 133, 0.8)";
    const gBody = ctx.createLinearGradient(0, 0, len, 0);
    if (blue) {
      gBody.addColorStop(0, "rgba(224, 231, 255, 0.98)");
      gBody.addColorStop(0.22, "rgba(96, 165, 250, 0.98)");
      gBody.addColorStop(0.55, "rgba(37, 99, 235, 0.96)");
      gBody.addColorStop(1, "rgba(23, 37, 84, 0.9)");
    } else {
      gBody.addColorStop(0, "rgba(255, 251, 235, 0.98)");
      gBody.addColorStop(0.18, "rgba(251, 191, 36, 0.96)");
      gBody.addColorStop(0.48, "rgba(248, 113, 113, 0.98)");
      gBody.addColorStop(0.82, "rgba(220, 38, 38, 0.95)");
      gBody.addColorStop(1, "rgba(88, 28, 28, 0.88)");
    }
    ctx.strokeStyle = gBody;
    ctx.lineWidth = blue ? 9 : 10;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();

    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

/** Depths sniper linger: disk shrinks and fades as if the surface seals back over the strike. */
function drawDepthsSniperZoneSinking(ctx, zone, now) {
  const { x, y, r } = zone;
  const t0 = zone.detonateAt;
  const t1 = zone.lingerUntil ?? t0;
  const raw = (now - t0) / Math.max(0.001, t1 - t0);
  const u = clamp(raw, 0, 1);
  const sink = u * u * (3 - 2 * u);
  const visR = r * (1 - 0.3 * Math.pow(sink, 1.12));
  const bodyA = (1 - sink * 0.94) * 0.52;

  ctx.save();
  const g = ctx.createRadialGradient(x, y, visR * 0.06, x, y, visR * 1.02);
  g.addColorStop(0, `rgba(45, 212, 191, ${0.1 * (1 - sink * 0.85)})`);
  g.addColorStop(0.32, `rgba(67, 56, 202, ${0.2 * bodyA})`);
  g.addColorStop(0.58, `rgba(49, 46, 129, ${0.26 * bodyA})`);
  g.addColorStop(0.88, `rgba(15, 23, 42, ${0.14 * bodyA})`);
  g.addColorStop(1, "rgba(3, 8, 16, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, visR, 0, TAU);
  ctx.fill();

  const rimA = 0.62 * (1 - sink) * (1 - sink);
  ctx.strokeStyle = `rgba(45, 212, 191, ${rimA})`;
  ctx.lineWidth = 2.4 * (1 - sink * 0.72);
  ctx.beginPath();
  ctx.arc(x, y, visR * (0.9 - 0.08 * sink), 0, TAU);
  ctx.stroke();

  const lag = clamp((sink - 0.08) / 0.92, 0, 1);
  if (lag > 0.02 && lag < 0.995) {
    const ripR = r * (0.92 - 0.48 * lag);
    ctx.strokeStyle = `rgba(167, 139, 250, ${0.38 * (1 - lag) * (1 - lag)})`;
    ctx.lineWidth = 1.15 * (1 - lag);
    ctx.beginPath();
    ctx.arc(x, y, ripR, 0, TAU);
    ctx.stroke();
  }

  const deep = ctx.createRadialGradient(x, y, visR * 0.02, x, y, visR * 0.88);
  deep.addColorStop(0, `rgba(2, 6, 14, ${0.12 * sink})`);
  deep.addColorStop(0.55, `rgba(4, 12, 24, ${0.35 * sink * sink})`);
  deep.addColorStop(1, "rgba(2, 8, 18, 0)");
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.arc(x, y, visR * 0.96, 0, TAU);
  ctx.fill();

  ctx.restore();
}

function drawArtilleryDetonationBang(ctx, zone, u) {
  const { x, y, r } = zone;
  const fade = 1 - u * u;
  const coreR = r * (0.5 + 0.2 * (1 - u));
  const depths = !!zone.depthsSniperZone;
  if (depths) {
    drawCircle(ctx, x, y, coreR, "#312e81", 0.44 * fade);
    drawCircle(ctx, x, y, coreR * 0.42, "#5eead4", 0.36 * fade);
    const ringR = r * (0.4 + u * 1.25);
    ctx.save();
    ctx.strokeStyle = `rgba(167, 139, 250, ${0.7 * fade})`;
    ctx.lineWidth = 2.6 * (1 - u * 0.45);
    ctx.beginPath();
    ctx.arc(x, y, ringR, 0, TAU);
    ctx.stroke();
    ctx.restore();
  } else {
    drawCircle(ctx, x, y, coreR, "#fef3c7", 0.38 * fade);
    drawCircle(ctx, x, y, coreR * 0.42, "#fffbeb", 0.48 * fade);
    const ringR = r * (0.4 + u * 1.25);
    ctx.save();
    ctx.strokeStyle = `rgba(254, 215, 170, ${0.72 * fade})`;
    ctx.lineWidth = 2.6 * (1 - u * 0.45);
    ctx.beginPath();
    ctx.arc(x, y, ringR, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawDangerZones(ctx, dangerZones, now, sniperBangDuration) {
  for (const zone of dangerZones) {
    const zu = zone.windup != null ? zone.windup : 0.8;
    const life = clamp((now - zone.bornAt) / zu, 0, 1);
    const lingering = zone.exploded && now < (zone.lingerUntil ?? zone.detonateAt);
    const tSinceDet = now - zone.detonateAt;
    const inBang = zone.exploded && lingering && tSinceDet < sniperBangDuration;

    if (!zone.exploded) {
      const radius = zone.r * (1 - 0.045 * life);
      const firePath = !!zone.firePath;
      const hallsHoly = !!zone.hallsHolyZone;
      const depthsSnipe = !!zone.depthsSniperZone;
      if (depthsSnipe) {
        drawCircle(ctx, zone.x, zone.y, radius, "#4c1d95", 0.22 + life * 0.42);
        ctx.strokeStyle = "#2dd4bf";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, radius, 0, TAU);
        ctx.stroke();
        const inner = radius * 0.58;
        drawCircle(ctx, zone.x, zone.y, inner, "#6d28d9", 0.14 + 0.12 * life);
        ctx.strokeStyle = "rgba(196, 181, 253, 0.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, radius * 0.78, 0, TAU);
        ctx.stroke();
      } else {
        drawCircle(
          ctx,
          zone.x,
          zone.y,
          radius,
          hallsHoly ? "#f8fafc" : firePath ? "#dc2626" : "#ef4444",
          hallsHoly ? 0.32 + life * 0.42 : 0.25 + life * 0.4,
        );
        ctx.strokeStyle = hallsHoly ? "#ffffff" : firePath ? "#fb7185" : "#f87171";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, radius, 0, TAU);
        ctx.stroke();
        if (firePath) {
          const inner = radius * 0.58;
          drawCircle(
            ctx,
            zone.x,
            zone.y,
            inner,
            hallsHoly ? "#e9d5ff" : "#fb7185",
            (hallsHoly ? 0.22 : 0.16) + 0.1 * life,
          );
          ctx.strokeStyle = hallsHoly ? "rgba(255, 255, 255, 0.72)" : "rgba(254, 226, 226, 0.55)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, radius * 0.78, 0, TAU);
          ctx.stroke();
        }
      }
    } else if (lingering) {
      const r = zone.r;
      const firePath = !!zone.firePath;
      const hallsHoly = !!zone.hallsHolyZone;
      const depthsSnipe = !!zone.depthsSniperZone;
      if (depthsSnipe) {
        drawDepthsSniperZoneSinking(ctx, zone, now);
      } else {
        drawCircle(
          ctx,
          zone.x,
          zone.y,
          r,
          hallsHoly ? "#e2e8f0" : firePath ? "#991b1b" : "#9f1239",
          hallsHoly ? 0.5 : firePath ? 0.46 : 0.38,
        );
        ctx.strokeStyle = hallsHoly ? "rgba(255, 255, 255, 0.98)" : firePath ? "rgba(251, 113, 133, 0.95)" : "rgba(248, 113, 113, 0.95)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, r, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = hallsHoly ? "rgba(233, 213, 255, 0.72)" : "rgba(254, 202, 202, 0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, r * 0.72, 0, TAU);
        ctx.stroke();
      }
      if (firePath) {
        const swirl = now * 2.6;
        const ringR = r * (0.5 + 0.08 * Math.sin(now * 7));
        ctx.strokeStyle = hallsHoly ? "rgba(255, 255, 255, 0.6)" : "rgba(252, 165, 165, 0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, ringR, swirl, swirl + Math.PI * 1.5);
        ctx.stroke();
        ctx.strokeStyle = hallsHoly ? "rgba(243, 232, 255, 0.45)" : "rgba(254, 242, 242, 0.28)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, r * 0.9, -swirl * 0.9, -swirl * 0.9 + Math.PI * 1.2);
        ctx.stroke();
      }
      if (inBang) {
        const u = clamp(tSinceDet / sniperBangDuration, 0, 1);
        drawArtilleryDetonationBang(ctx, zone, u);
      }
    }
  }
}

export function drawSniperFireArcs(ctx, fireArcs, now) {
  for (const arc of fireArcs) {
    const t = clamp((now - arc.bornAt) / Math.max(0.001, arc.life), 0, 1);
    const fade = 1 - t * 0.35;
    const start = arc.a - arc.halfA;
    const end = arc.a + arc.halfA;
    const outerR = arc.radius + arc.width * 0.52;
    const innerR = Math.max(1, arc.radius - arc.width * 0.52);
    ctx.save();
    ctx.fillStyle = `rgba(251, 113, 133, ${0.72 * fade})`;
    ctx.shadowBlur = 14;
    ctx.shadowColor = "rgba(220, 38, 38, 0.65)";
    ctx.beginPath();
    ctx.arc(arc.x, arc.y, outerR, start, end);
    ctx.arc(arc.x, arc.y, innerR, end, start, true);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(251, 113, 133, ${0.98 * fade})`;
    ctx.lineWidth = Math.max(2, arc.width * 0.34);
    ctx.beginPath();
    ctx.arc(arc.x, arc.y, outerR, start, end);
    ctx.stroke();
    ctx.strokeStyle = `rgba(254, 226, 226, ${0.92 * fade})`;
    ctx.lineWidth = Math.max(1.5, arc.width * 0.2);
    ctx.beginPath();
    ctx.arc(arc.x, arc.y, innerR, start, end);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawSwampPools(ctx, pools, now) {
  for (const p of pools) {
    const life = clamp((now - p.bornAt) / Math.max(0.001, p.expiresAt - p.bornAt), 0, 1);
    const fade = 1 - life * 0.75;
    const pulse = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(now * 5 + p.x * 0.01 + p.y * 0.01));
    const R = p.r;
    if (p.frogMudPool) {
      ctx.save();
      const grow = frogMudPoolGrowScale(p.bornAt, now);
      const drawR = Math.max(2, R * grow);
      const g = ctx.createRadialGradient(p.x, p.y - drawR * 0.12, drawR * 0.06, p.x, p.y, drawR);
      g.addColorStop(0, `rgba(36, 44, 30, ${0.9 * fade})`);
      g.addColorStop(0.28, `rgba(44, 36, 24, ${0.88 * fade})`);
      g.addColorStop(0.55, `rgba(32, 40, 28, ${0.78 * fade})`);
      g.addColorStop(0.78, `rgba(22, 30, 22, ${0.62 * fade})`);
      g.addColorStop(0.94, `rgba(16, 22, 18, ${0.45 * fade})`);
      g.addColorStop(1, `rgba(10, 14, 12, ${0.28 * fade})`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, drawR, 0, TAU);
      ctx.fillStyle = g;
      ctx.fill();
      const gSheen = ctx.createRadialGradient(
        p.x - drawR * 0.22,
        p.y - drawR * 0.28,
        0,
        p.x,
        p.y,
        drawR * 0.52,
      );
      gSheen.addColorStop(0, `rgba(62, 54, 42, ${0.22 * fade})`);
      gSheen.addColorStop(0.45, `rgba(40, 34, 26, ${0.12 * fade})`);
      gSheen.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.beginPath();
      ctx.arc(p.x, p.y, drawR * 0.98, 0, TAU);
      ctx.fillStyle = gSheen;
      ctx.fill();
      ctx.strokeStyle = `rgba(6, 8, 6, ${0.72 * fade})`;
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1.5, drawR - 1.2), 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(153, 27, 27, ${(0.62 + pulse * 0.18) * fade})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1.2, drawR - 0.6), 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(254, 202, 202, ${0.14 * fade})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, drawR - 2.4), 0, TAU);
      ctx.stroke();
      ctx.restore();
    } else {
      drawCircle(ctx, p.x, p.y, R, "#2d1f12", 0.5 * fade);
      drawCircle(ctx, p.x, p.y, R * 0.78, "#3f2f1e", (0.2 + 0.12 * pulse) * fade);
      ctx.strokeStyle = `rgba(161, 98, 7, ${(0.45 + pulse * 0.2) * fade})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R * (0.9 + 0.05 * pulse), 0, TAU);
      ctx.stroke();
    }
  }
}

export function drawSwampBlastBursts(ctx, bursts, now) {
  for (const b of bursts) {
    const t = clamp((now - b.bornAt) / Math.max(0.001, b.life), 0, 1);
    const fade = 1 - t * 0.2;
    if (b.frogWave) {
      const ease = 1 - Math.pow(1 - t, 2.45);
      const rr = b.r * (0.02 + 0.98 * ease);
      const vis = Math.pow(Math.sin(Math.min(1, t / 0.9) * Math.PI), 0.75);
      const aMul = vis * (0.88 + 0.12 * (1 - t));
      ctx.save();
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, Math.max(rr, 2));
      g.addColorStop(0, `rgba(30, 44, 32, ${0.5 * aMul})`);
      g.addColorStop(0.38, `rgba(48, 40, 28, ${0.4 * aMul})`);
      g.addColorStop(0.72, `rgba(26, 38, 30, ${0.2 * aMul})`);
      g.addColorStop(1, "rgba(8, 12, 10, 0)");
      ctx.beginPath();
      ctx.arc(b.x, b.y, rr, 0, TAU);
      ctx.fillStyle = g;
      ctx.fill();
      const edgeA = 0.55 * aMul * (0.35 + 0.65 * ease);
      ctx.strokeStyle = `rgba(140, 28, 28, ${0.82 * edgeA})`;
      ctx.lineWidth = 1.6 + (1 - ease) * 1.4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, rr, 0, TAU);
      ctx.stroke();
      const rippleStart = 0.58;
      if (t >= rippleStart) {
        const rip = clamp((t - rippleStart) / (1 - rippleStart), 0, 1);
        const decay = (1 - rip) * (1 - rip);
        const baseR = b.r;
        for (let ring = 0; ring < 3; ring++) {
          const lag = ring * 0.16;
          const uRing = clamp((rip - lag) / Math.max(0.001, 1 - lag), 0, 1);
          if (uRing <= 0.02) continue;
          const ringR = baseR * (0.72 + 0.32 * uRing);
          const ra = 0.38 * decay * (1 - ring * 0.18);
          ctx.strokeStyle = `rgba(48, 36, 26, ${ra})`;
          ctx.lineWidth = 5 + (1 - uRing) * 6;
          ctx.beginPath();
          ctx.arc(b.x, b.y, ringR, 0, TAU);
          ctx.stroke();
        }
        ctx.strokeStyle = `rgba(28, 44, 32, ${0.22 * decay})`;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, baseR * (0.68 + 0.36 * rip), 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = `rgba(185, 45, 45, ${0.2 * decay})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(b.x, b.y, baseR * (0.82 + 0.28 * rip), 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    } else {
      const rr = b.r * (0.2 + 0.95 * t);
      drawCircle(ctx, b.x, b.y, rr, "#a16207", 0.22 * fade);
      ctx.strokeStyle = `rgba(217, 119, 6, ${0.75 * fade})`;
      ctx.lineWidth = 3.2 - t * 1.8;
      ctx.beginPath();
      ctx.arc(b.x, b.y, rr, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(254, 243, 199, ${0.5 * fade})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, rr * (0.72 + 0.15 * (1 - t)), 0, TAU);
      ctx.stroke();
    }
  }
}

/** High-fidelity pawn diagonal strike landing burst. */
export function drawHallsPawnImpactBursts(ctx, bursts, now) {
  for (const b of bursts) {
    const life = Math.max(0.001, Number(b.life ?? 0.95));
    const u = clamp((now - b.bornAt) / life, 0, 1);
    if (u >= 1) continue;
    const easeOut = 1 - Math.pow(1 - u, 2.2);
    const fade = Math.pow(1 - u, 1.25);
    const x = b.x;
    const y = b.y;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const shockR = 22 + easeOut * 150;
    ctx.strokeStyle = `rgba(254, 240, 138, ${0.55 * fade})`;
    ctx.lineWidth = 10 * (1 - u * 0.55);
    ctx.beginPath();
    ctx.arc(x, y, shockR, 0, TAU);
    ctx.stroke();

    const heat = ctx.createRadialGradient(x, y, 0, x, y, 96 + easeOut * 52);
    heat.addColorStop(0, `rgba(255, 255, 255, ${0.42 * fade})`);
    heat.addColorStop(0.2, `rgba(251, 191, 36, ${0.36 * fade})`);
    heat.addColorStop(0.55, `rgba(239, 68, 68, ${0.2 * fade})`);
    heat.addColorStop(1, "rgba(30, 10, 10, 0)");
    ctx.fillStyle = heat;
    ctx.beginPath();
    ctx.arc(x, y, 96 + easeOut * 52, 0, TAU);
    ctx.fill();

    const scorchA = 0.4 * (1 - u * 0.8);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(35, 20, 16, ${scorchA})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 34 + easeOut * 44, 20 + easeOut * 28, 0, 0, TAU);
    ctx.fill();

    ctx.globalCompositeOperation = "lighter";
    const sparkN = 18;
    for (let i = 0; i < sparkN; i++) {
      const a = ((i * 137.507764) % 360) * (Math.PI / 180) + u * 2.6;
      const r = 26 + easeOut * (80 + (i % 5) * 14);
      const sx = x + Math.cos(a) * r;
      const sy = y + Math.sin(a) * r;
      const sr = 1.8 + (1 - u) * 2.8;
      ctx.fillStyle = `rgba(254, 243, 199, ${0.24 * fade})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, TAU);
      ctx.fill();
    }

    const smokeN = 12;
    for (let i = 0; i < smokeN; i++) {
      const a = ((i * 53.2 + 17) % 360) * (Math.PI / 180);
      const r = 10 + i * 3 + easeOut * 36;
      const sx = x + Math.cos(a) * r * 0.55;
      const sy = y + Math.sin(a) * r * 0.36 - easeOut * (8 + i * 0.9);
      const sr = 10 + i * 0.75 + easeOut * 10;
      const alpha = (0.18 + (i % 4) * 0.03) * fade;
      ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }
}

export function drawSniperBullets(ctx, bullets, now) {
  for (const b of bullets) {
    const life = clamp((now - b.bornAt) / b.life, 0, 1);
    const x = b.x + (b.tx - b.x) * life;
    const y = b.y + (b.ty - b.y) * life;
    const col = b.hallsHolyShell ? "#f8fafc" : b.depthsShell ? "#5eead4" : "#fca5a5";
    drawCircle(ctx, x, y, 2, col);
  }
}

export function drawSpawnerChargeClocks(ctx, hunters, now) {
  for (const h of hunters) {
    if (h.type !== "spawner" && h.type !== "airSpawner" && h.type !== "cryptSpawner" && h.type !== "depthsBoltSpawner")
      continue;
    if (h.type === "cryptSpawner" && h.cryptDisguised) continue;
    if (now >= h.spawnDelayUntil) continue;

    const delayTotal = h.type === "airSpawner" ? 2.1 : 2;
    const elapsedSinceBorn = now - h.bornAt;
    const progress = clamp(elapsedSinceBorn / delayTotal, 0, 1);
    const remaining = 1 - progress;

    const clockR = h.r + 28 + remaining * 6;
    const pulse = 1 + Math.sin(now * 10) * 0.04;
    const alpha = 0.1 + remaining * 0.18;
    const ringCol = h.type === "airSpawner" ? "#a78bfa" : h.type === "cryptSpawner" ? "#e2e8f0" : "#fb7185";
    const handCol = h.type === "airSpawner" ? "#7c3aed" : h.type === "cryptSpawner" ? "#cbd5e1" : "#f43f5e";

    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = ringCol;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, clockR * pulse, 0, TAU);
    ctx.stroke();

    ctx.strokeStyle = handCol;
    ctx.lineWidth = 4;
    ctx.beginPath();

    const a1 = -Math.PI / 2 + progress * TAU * 0.9;
    const a2 = -Math.PI / 2 + progress * TAU * 0.35;

    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a1) * clockR * 0.68, Math.sin(a1) * clockR * 0.68);
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a2) * clockR * 0.45, Math.sin(a2) * clockR * 0.45);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawHunterLifeBars(ctx, hunters, now) {
  for (const h of hunters) {
    if (
      h.type === "depthsTentacle" ||
      h.type === "depthsEldritchBloom" ||
      h.type === "depthsEldritchBarrageBolt" ||
      h.type === "depthsEldritchCageLunge"
    )
      continue;
    if (h.type === "cryptSpawner" && h.cryptDisguised) continue;
    const total = h.life || Math.max(0.0001, h.dieAt - h.bornAt);
    const lifeLeft = clamp((h.dieAt - now) / total, 0, 1);
    const barW = h.r * 2.6;
    const barH = 5;
    const x = h.x - barW / 2;
    const y = h.y + h.r + 9;
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
    ctx.fillRect(x - 1, y - 1, barW + 2, barH + 2);
    ctx.fillStyle = "rgba(51, 65, 85, 0.92)";
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = lifeLeft > 0.35 ? "#22c55e" : "#ef4444";
    ctx.fillRect(x, y, barW * lifeLeft, barH);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 0.5, y - 0.5, barW + 1, barH + 1);
    ctx.restore();
  }
}
