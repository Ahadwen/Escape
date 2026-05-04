/**
 * Halls path — formal "procession" hazard: alternating horizontal / vertical passes of
 * golden spheres on a rigid grid (contrast with chaotic Depths storm wash).
 * Each pass spawns the formation offscreen and marches it across; orbs only draw / deal damage
 * while their center lies on the current generated hex footprint.
 */

import { HEX_SIZE } from "../balance.js";
import { TAU } from "../constants.js";
import { clamp } from "../Hunters/hunterGeometry.js";
import { pointInsidePointyHex } from "../WorldGeneration/eventTiles/innerHexZone.js";

/**
 * Polished ceremonial gold orb: ground shadow, soft bloom, metallic body, AO, specular, rims.
 * @param {{ telegraph: boolean }} meta
 */
function drawHallsParadeOrbVisual(ctx, ox, oy, or, meta, simElapsed) {
  const tele = meta.telegraph;
  const slow = tele ? 0.52 : 1;
  const uniq = ox * 0.021 + oy * 0.019;
  const breathe = 0.5 + 0.5 * Math.sin(simElapsed * slow * 1.65 + uniq);
  const roll = 0.5 + 0.5 * Math.sin(simElapsed * slow * 0.38 + uniq * 1.7);

  const lx = ox - or * (0.4 + 0.08 * roll);
  const ly = oy - or * (0.36 + 0.06 * breathe);
  const rimW = Math.max(0.9, or * 0.11);
  const rimW2 = Math.max(0.65, or * 0.055);

  ctx.save();

  // Ground contact shadow
  ctx.globalAlpha = tele ? 0.16 : 0.32;
  const sh = ctx.createRadialGradient(ox, oy + or * 0.55, 0, ox, oy + or * 0.55, or * 1.35);
  sh.addColorStop(0, "rgba(22, 14, 6, 0.55)");
  sh.addColorStop(0.4, "rgba(22, 14, 6, 0.14)");
  sh.addColorStop(1, "rgba(22, 14, 6, 0)");
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.ellipse(ox, oy + or * 0.36, or * 0.98, or * 0.34, 0, 0, TAU);
  ctx.fill();

  const bodyA = tele ? 0.4 + breathe * 0.18 : 0.98 + breathe * 0.02;
  ctx.globalAlpha = clamp(bodyA, 0, 1);

  // Soft torch bloom
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = tele ? 0.07 : 0.12;
  const bloom = ctx.createRadialGradient(ox, oy, or * 0.5, ox, oy, or * 1.9);
  bloom.addColorStop(0, "rgba(255, 210, 140, 0)");
  bloom.addColorStop(0.45, "rgba(255, 195, 110, 0.32)");
  bloom.addColorStop(1, "rgba(255, 170, 70, 0)");
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(ox, oy, or * 1.75, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  ctx.globalAlpha = clamp(bodyA, 0, 1);
  const base = ctx.createRadialGradient(lx, ly, 0, ox, oy + or * 0.2, or * 1.06);
  base.addColorStop(0, "rgba(255, 254, 250, 1)");
  base.addColorStop(0.06, "rgba(255, 248, 225, 1)");
  base.addColorStop(0.18, "rgba(254, 236, 190, 1)");
  base.addColorStop(0.34, "rgba(245, 210, 120, 1)");
  base.addColorStop(0.52, "rgba(210, 165, 55, 1)");
  base.addColorStop(0.7, "rgba(150, 105, 28, 1)");
  base.addColorStop(0.86, "rgba(72, 48, 16, 1)");
  base.addColorStop(0.96, "rgba(32, 20, 8, 1)");
  base.addColorStop(1, "rgba(18, 10, 4, 1)");
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(ox, oy, or, 0, TAU);
  ctx.fill();

  // Ambient occlusion (underside)
  ctx.save();
  ctx.beginPath();
  ctx.arc(ox, oy, or, 0, TAU);
  ctx.clip();
  const ao = ctx.createLinearGradient(ox, oy - or, ox, oy + or);
  ao.addColorStop(0, "rgba(0,0,0,0)");
  ao.addColorStop(0.42, "rgba(0,0,0,0)");
  ao.addColorStop(1, tele ? "rgba(8,4,2,0.28)" : "rgba(6,3,1,0.42)");
  ctx.fillStyle = ao;
  ctx.fillRect(ox - or - 2, oy - or - 2, (or + 2) * 2, (or + 2) * 2);
  ctx.restore();

  // Cool upper Fresnel rim
  ctx.globalAlpha = tele ? 0.32 : 0.58;
  ctx.strokeStyle = "rgba(255, 250, 238, 0.62)";
  ctx.lineWidth = rimW;
  ctx.beginPath();
  ctx.arc(ox, oy, Math.max(or - rimW * 0.45, or * 0.82), 0, TAU);
  ctx.stroke();

  // Warm inner ring (cast bronze)
  ctx.globalAlpha = tele ? 0.28 : 0.48;
  ctx.strokeStyle = "rgba(180, 125, 35, 0.82)";
  ctx.lineWidth = rimW2;
  ctx.beginPath();
  ctx.arc(ox, oy, Math.max(or - rimW * 1.1, or * 0.72), 0, TAU);
  ctx.stroke();

  // Specular + micro sparkle (screen)
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = tele ? 0.22 : 0.48;
  const spec = ctx.createRadialGradient(lx, ly, 0, lx, ly, or * 0.48);
  spec.addColorStop(0, "rgba(255, 255, 255, 1)");
  spec.addColorStop(0.12, "rgba(255, 252, 235, 0.65)");
  spec.addColorStop(0.35, "rgba(255, 230, 170, 0.22)");
  spec.addColorStop(1, "rgba(255, 200, 120, 0)");
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(ox, oy, or, 0, TAU);
  ctx.fill();

  ctx.globalAlpha = tele ? 0.12 : 0.22;
  const glint = ctx.createRadialGradient(
    ox - or * 0.15,
    oy - or * 0.28,
    0,
    ox - or * 0.15,
    oy - or * 0.28,
    or * 0.2,
  );
  glint.addColorStop(0, "rgba(255, 255, 255, 0.9)");
  glint.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glint;
  ctx.beginPath();
  ctx.arc(ox, oy, or, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  if (tele) {
    ctx.globalAlpha = 0.45 + breathe * 0.25;
    ctx.strokeStyle = "rgba(95, 70, 28, 0.9)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(ox, oy, or + 3.5, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = "rgba(12, 8, 4, 0.45)";
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.arc(ox, oy, or - 0.4, 0, TAU);
    ctx.stroke();
  }

  ctx.restore();
}

export const HALLS_SPHERE_PARADE_PERIOD_SEC = 13;
/** Hard cap for a single pass (seconds) if terrain query glitches. Pass normally ends when no orb center is on terrain. */
export const HALLS_SPHERE_PARADE_PASS_MAX_SEC = 95;
export const HALLS_SPHERE_PARADE_SPHERE_R_PX = 18;
/** Center-to-center along the march (original 96px, ×3). */
export const HALLS_SPHERE_PARADE_SPACING_PX = 128;
/** Center-to-center between parallel lanes (original 90px, ×3). */
export const HALLS_SPHERE_PARADE_LANE_PITCH_PX = 128;
/** ~3× prior march speed (px/s). */
export const HALLS_SPHERE_PARADE_SPEED_PX_S = 520;
export const HALLS_SPHERE_PARADE_HIT_COOLDOWN_SEC = 0.42;
export const HALLS_SPHERE_PARADE_N_LANES = 16;
export const HALLS_SPHERE_PARADE_N_ALONG = 22;
/** `span = viewSpan * mult + spacing` — coverage past the viewport. */
export const HALLS_SPHERE_PARADE_EXTEND_MULT = 0.58;

function snapFormalGrid(v, step) {
  return Math.round(v / step) * step;
}

/**
 * @param {{ q: number; r: number }[]} activeHexes
 * @param {(q: number, r: number) => { x: number; y: number }} hexToWorld
 */
export function hallsParadeOrbCenterOnGeneratedTerrain(ox, oy, activeHexes, hexToWorld) {
  if (!activeHexes?.length) return false;
  for (const h of activeHexes) {
    const c = hexToWorld(h.q, h.r);
    if (pointInsidePointyHex(ox, oy, c.x, c.y, HEX_SIZE)) return true;
  }
  return false;
}

/**
 * @typedef {{ telegraph: boolean; pass: boolean; tMove: number; horizontal: boolean }} HallsParadeDrive
 */

/**
 * How far behind the nominal leading edge the formation starts (px along march), so the first
 * frame is fully offscreen before marching toward the anchor / playfield.
 */
export function hallsParadeSpawnBehindPx(viewSpan) {
  const spacing = HALLS_SPHERE_PARADE_SPACING_PX;
  const span = viewSpan * HALLS_SPHERE_PARADE_EXTEND_MULT + spacing * 4;
  const halfAlong = (HALLS_SPHERE_PARADE_N_ALONG - 1) / 2;
  return viewSpan + span + (halfAlong + 0.5) * spacing;
}

function hallsParadeMarchAlongOffsetPx(drive, viewSpan) {
  if (!drive.pass) return 0;
  const speed = HALLS_SPHERE_PARADE_SPEED_PX_S;
  return speed * drive.tMove - hallsParadeSpawnBehindPx(viewSpan);
}

/**
 * Every parade orb center at this march time (ignores terrain — for "any still on map" tests).
 * @param {(x: number, y: number) => void} visitor
 */
export function forEachHallsParadeOrbCenter(drive, anchorX, anchorY, viewSpan, visitor) {
  if (!drive.pass) return;

  const spacing = HALLS_SPHERE_PARADE_SPACING_PX;
  const lanePitch = HALLS_SPHERE_PARADE_LANE_PITCH_PX;
  const gx = snapFormalGrid(anchorX, lanePitch);
  const gy = snapFormalGrid(anchorY, lanePitch);
  const span = viewSpan * HALLS_SPHERE_PARADE_EXTEND_MULT + spacing * 4;
  const offset = hallsParadeMarchAlongOffsetPx(drive, viewSpan);

  const nLanes = HALLS_SPHERE_PARADE_N_LANES;
  const nAlong = HALLS_SPHERE_PARADE_N_ALONG;
  const halfLanes = (nLanes - 1) / 2;
  const halfAlong = (nAlong - 1) / 2;

  if (drive.horizontal) {
    const baseX = gx - span + offset;
    for (let lane = -halfLanes; lane <= halfLanes; lane++) {
      const y = gy + lane * lanePitch;
      for (let k = -halfAlong; k <= halfAlong; k++) {
        visitor(baseX + k * spacing, y);
      }
    }
  } else {
    const baseY = gy - span + offset;
    for (let lane = -halfLanes; lane <= halfLanes; lane++) {
      const x = gx + lane * lanePitch;
      for (let k = -halfAlong; k <= halfAlong; k++) {
        visitor(x, baseY + k * spacing);
      }
    }
  }
}

/**
 * True if at least one orb center lies on generated terrain (pass continues until this is false).
 */
export function hallsParadeAnyOrbCenterStillOnTerrain(drive, anchorX, anchorY, viewSpan, terrain) {
  if (!terrain?.activeHexes?.length) return false;
  let any = false;
  forEachHallsParadeOrbCenter(drive, anchorX, anchorY, viewSpan, (ox, oy) => {
    if (hallsParadeOrbCenterOnGeneratedTerrain(ox, oy, terrain.activeHexes, terrain.hexToWorld)) any = true;
  });
  return any;
}

export function hallsParadeDriveShouldShow(drive) {
  return drive.pass;
}

/**
 * @param {(x: number, y: number, r: number, meta: { telegraph: boolean }) => void} visitor
 * @param {{ activeHexes: { q: number; r: number }[]; hexToWorld: (q: number, r: number) => { x: number; y: number } }} [terrain] When set, orbs off the generated hex window are skipped (draw/hit).
 */
export function visitHallsSphereParadeOrbsWithDrive(drive, anchorX, anchorY, viewSpan, visitor, terrain = undefined) {
  if (!drive.pass) return;

  const r = HALLS_SPHERE_PARADE_SPHERE_R_PX;
  const meta = { telegraph: false };

  const onTerrain = (ox, oy) =>
    !terrain ||
    hallsParadeOrbCenterOnGeneratedTerrain(ox, oy, terrain.activeHexes, terrain.hexToWorld);

  forEachHallsParadeOrbCenter(drive, anchorX, anchorY, viewSpan, (ox, oy) => {
    if (!onTerrain(ox, oy)) return;
    visitor(ox, oy, r, meta);
  });
}

/**
 * Hit-test during the moving pass only.
 * @returns {{ hit: boolean; sx: number; sy: number }}
 */
export function hallsSphereParadeHitQuery(drive, anchorX, anchorY, viewSpan, px, py, pr, terrain) {
  if (!drive.pass) return { hit: false, sx: px, sy: py };

  const touchR = pr + HALLS_SPHERE_PARADE_SPHERE_R_PX - 0.75;
  let hit = false;
  let sx = px;
  let sy = py;
  let bestD = Infinity;
  visitHallsSphereParadeOrbsWithDrive(drive, anchorX, anchorY, viewSpan, (ox, oy) => {
    const d = Math.hypot(px - ox, py - oy);
    if (d < touchR && d < bestD) {
      bestD = d;
      hit = true;
      sx = ox;
      sy = oy;
    }
  }, terrain);
  return { hit, sx, sy };
}

/**
 * World-space draw (call inside camera translate). Culls orbs outside view + margin.
 */
export function drawHallsSphereParadeWorld(
  ctx,
  simElapsed,
  drive,
  anchorX,
  anchorY,
  viewSpan,
  cameraX,
  cameraY,
  viewW,
  viewH,
  terrain,
) {
  if (!hallsParadeDriveShouldShow(drive)) return;

  const margin = HALLS_SPHERE_PARADE_SPHERE_R_PX + 20;
  const minX = cameraX - margin;
  const maxX = cameraX + viewW + margin;
  const minY = cameraY - margin;
  const maxY = cameraY + viewH + margin;

  visitHallsSphereParadeOrbsWithDrive(
    drive,
    anchorX,
    anchorY,
    viewSpan,
    (ox, oy, or, meta) => {
      if (ox < minX || ox > maxX || oy < minY || oy > maxY) return;
      drawHallsParadeOrbVisual(ctx, ox, oy, or, meta, simElapsed);
    },
    terrain,
  );
}
