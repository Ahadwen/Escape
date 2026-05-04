import { TAU } from "../constants.js";
import { clamp } from "./hunterGeometry.js";
import depthsEldritchBossUrl from "../../assets/Cthulu.png";

/** Preloaded boss PNG (2D canvas). */
const depthsEldritchBossImg = new Image();
depthsEldritchBossImg.src = depthsEldritchBossUrl;

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
    /** Depths L5 eldritch orb — custom body draw; palette fallback only. */
    case "depthsEldritchBloom":
      return { light: "#a78bfa", core: "#4c1d95", shadow: "#1e0533", rim: "#7c3aed", mark: "#fecaca" };
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

/**
 * Depths L5 boss: raster from `src/assets/Cthulu.png`, scaled (~2.5× base fit on hit radius), yaw toward player (`h.dir`).
 */
function drawDepthsEldritchBloom(ctx, h, simElapsed) {
  const { x, y, r } = h;
  const t = simElapsed;
  const phase = Number(h.bornAt ?? 0) * 0.09;
  const bob = Math.sin(t * 1.25 + phase) * 1.8;
  const cy = y + bob;
  const alpha = clamp(Number(h.opacity ?? 1), 0, 1);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, cy);
  ctx.rotate(DEPTHS_ELDRITCH_BOSS_SPRITE_YAW);

  const img = depthsEldritchBossImg;
  const maxSpan = r * 2.2 * 2.5;
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
    const brightMul = 0.56 + pulse * 0.52;
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

  ctx.restore();
}

/** @param {CanvasRenderingContext2D} ctx
 * @param {object} h
 * @param {{ colourblind?: boolean; simElapsed?: number; depthsPath?: boolean }} [opts]
 */
export function drawHunterBody(ctx, h, opts = {}) {
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
  const pal = colourblind
    ? { light: "#9ca89a", core: "#5a6658", shadow: "#3a4239", rim: "#6b7569", mark: "#b4c0b0" }
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
        drawCircle(ctx, zone.x, zone.y, radius, firePath ? "#dc2626" : "#ef4444", 0.25 + life * 0.4);
        ctx.strokeStyle = firePath ? "#fb7185" : "#f87171";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, radius, 0, TAU);
        ctx.stroke();
        if (firePath) {
          const inner = radius * 0.58;
          drawCircle(ctx, zone.x, zone.y, inner, "#fb7185", 0.16 + 0.1 * life);
          ctx.strokeStyle = "rgba(254, 226, 226, 0.55)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, radius * 0.78, 0, TAU);
          ctx.stroke();
        }
      }
    } else if (lingering) {
      const r = zone.r;
      const firePath = !!zone.firePath;
      const depthsSnipe = !!zone.depthsSniperZone;
      if (depthsSnipe) {
        drawDepthsSniperZoneSinking(ctx, zone, now);
      } else {
        drawCircle(ctx, zone.x, zone.y, r, firePath ? "#991b1b" : "#9f1239", firePath ? 0.46 : 0.38);
        ctx.strokeStyle = firePath ? "rgba(251, 113, 133, 0.95)" : "rgba(248, 113, 113, 0.95)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, r, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = "rgba(254, 202, 202, 0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, r * 0.72, 0, TAU);
        ctx.stroke();
      }
      if (firePath) {
        const swirl = now * 2.6;
        const ringR = r * (0.5 + 0.08 * Math.sin(now * 7));
        ctx.strokeStyle = "rgba(252, 165, 165, 0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, ringR, swirl, swirl + Math.PI * 1.5);
        ctx.stroke();
        ctx.strokeStyle = "rgba(254, 242, 242, 0.28)";
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

export function drawSniperBullets(ctx, bullets, now) {
  for (const b of bullets) {
    const life = clamp((now - b.bornAt) / b.life, 0, 1);
    const x = b.x + (b.tx - b.x) * life;
    const y = b.y + (b.ty - b.y) * life;
    const col = b.depthsShell ? "#5eead4" : "#fca5a5";
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
    if (h.type === "depthsTentacle" || h.type === "depthsEldritchBloom") continue;
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
