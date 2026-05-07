/**
 * Halls boss-floor: stand 1s to crack a hex; leave **north** (axial Δr = −1, Δq ∈ {0,1}) from a cracked
 * tile to collapse the whole **row** (same r). Leave **sideways** (any non-north neighbor) to collapse the
 * whole row **except** the hex you stand on, which stays solid until a later **north** step off that hex.
 *
 * **Collapse timing:** on solid anchor, the old tile voids once **movement commits** off the old hex
 * (player center outside old footprint shrunk by radius, with chord/incircle fallbacks), or after a long
 * anchor dwell cap. Crack/arm timers unchanged. Void axial seam path uses the same footprint check + dwell.
 * If you leave cracked ground into a **void/excluded** axial cell (seam / `worldToHex` pit label), voiding
 * the old tile is **deferred** until axial ground is non-void again so we do not open pits under a false “move”.
 */
import { TAU } from "../constants.js";

const STAND_ARM_SEC = 1;
const FALL_ANIM_SEC = 0.72;
/** After this long on anchor with no geometry commit, void anyway (avoids soft-lock). */
const COLLAPSE_OLD_VOID_FALLBACK_SEC = 0.55;
/** Min time on solid ground (void seam path) before we may apply the footprint check. */
const COLLAPSE_SOLID_DWELL_BEFORE_GEOMETRY_SEC = 0.05;
/** Along old→anchor center chord: count as committed past this fraction. */
const COLLAPSE_COMMIT_T_ALONG = 0.45;
/** Also commit if player center has passed this fraction of vertex radius from old hex center. */
const COLLAPSE_LEFT_OLD_FRAC = 0.88;
/**
 * Axial steps that move “screen north” (smaller r / world y-up in this layout) from a hex — both
 * pointy-top neighbors with Δr = −1, not only {0,−1}.
 */
export function isNorthwardStep(dq, dr) {
  return dr === -1 && (dq === 0 || dq === 1);
}

function clamp01(v) {
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
}

/**
 * @param {object} deps
 * @param {(q: number, r: number) => string} deps.hexKey
 * @param {(x: number, y: number) => { q: number; r: number }} deps.worldToHex
 * @param {(q: number, r: number) => { x: number; y: number }} deps.hexToWorld
 * @param {number} deps.hexVertexRadius
 * @param {() => number} deps.getSimElapsed
 * @param {() => { x: number; y: number }} deps.getPlayer
 * @param {() => number} deps.getPlayerRadius
 * @param {() => boolean} deps.getShouldTrackCollapse
 * @param {(q: number, r: number) => boolean} deps.isHexExcludedFromCollapse
 * @param {(q: number, r: number) => boolean} deps.isHexGroundVoided
 * @param {(rowR: number) => Array<{ q: number; r: number }>} deps.onVoidRow
 * @param {(rowR: number, spareQ: number, spareR: number) => Array<{ q: number; r: number }>} deps.onVoidRowExcept
 * @param {(fromQ: number, fromR: number, toQ: number, toR: number) => boolean} deps.tryFinalizeSparedRowHexNorthStep
 */
export function createTerrainHexCollapseRuntime(deps) {
  const {
    hexKey,
    worldToHex,
    hexToWorld,
    hexVertexRadius: R,
    getSimElapsed,
    getPlayer,
    getPlayerRadius,
    getShouldTrackCollapse,
    isHexExcludedFromCollapse,
    isHexGroundVoided,
    onVoidRow,
    onVoidRowExcept,
    tryFinalizeSparedRowHexNorthStep,
  } = deps;

  let lastStandKey = "";
  let standSecOnKey = 0;
  /** @type {Set<string>} */
  const armedKeys = new Set();
  /** @type {{ q: number; r: number; start: number }[]} */
  const falling = [];
  /**
   * After leaving a cracked tile: void `old` when movement commits off the old hex while on anchor (see
   * `collapseCommittedOffOldTile`), or immediately when leaving anchor for a hex other than `old`; cancelled if stepping back onto `old`.
   */
  let deferredCollapse = /** @type {null | { oldQ: number; oldR: number; anchorQ: number; anchorR: number; steppedNorth: boolean }} */ (
    null
  );
  /** Armed leave landed on void/excluded axial key — void old once real ground + dwell (`solidSince`). */
  let voidOldWhenAxialSolid =
    /** @type {null | { oldQ: number; oldR: number; steppedNorth: boolean; solidSince: number | null }} */ (null);

  function reset() {
    lastStandKey = "";
    standSecOnKey = 0;
    armedKeys.clear();
    falling.length = 0;
    deferredCollapse = null;
    voidOldWhenAxialSolid = null;
  }

  /** @param {{ oldQ: number; oldR: number; steppedNorth: boolean }} d */
  /** Pointy-top hex (same vertex order as `beginHexPathAt`); `radius` is vertex distance from center. */
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

  /**
   * True when the player body has meaningfully left the old cracked hex (handles edge straddling while
   * `worldToHex` already reports the anchor).
   */
  function collapseCommittedOffOldTile(px, py, oldQ, oldR, anchorQ, anchorR, vertexR) {
    const co = hexToWorld(oldQ, oldR);
    const prad = Math.max(1, getPlayerRadius());
    const shrunkR = Math.max(vertexR * 0.12, vertexR - prad * 0.82);
    if (!pointInPointyHex(px, py, co.x, co.y, shrunkR)) {
      return true;
    }
    const cn = hexToWorld(anchorQ, anchorR);
    const vx = cn.x - co.x;
    const vy = cn.y - co.y;
    const len2 = vx * vx + vy * vy;
    let tAlong = 0;
    if (len2 > 1e-8) {
      tAlong = ((px - co.x) * vx + (py - co.y) * vy) / len2;
    }
    const distOld = Math.hypot(px - co.x, py - co.y);
    return tAlong >= COLLAPSE_COMMIT_T_ALONG || distOld >= vertexR * COLLAPSE_LEFT_OLD_FRAC;
  }

  function flushVoidOldTile(d, t) {
    if (isHexGroundVoided(d.oldQ, d.oldR)) return;
    if (d.steppedNorth) {
      const voided = onVoidRow(d.oldR);
      for (const h of voided) {
        falling.push({ q: h.q, r: h.r, start: t });
      }
    } else {
      const cur = worldToHex(getPlayer().x, getPlayer().y);
      const voided = onVoidRowExcept(d.oldR, cur.q, cur.r);
      for (const h of voided) {
        falling.push({ q: h.q, r: h.r, start: t });
      }
    }
  }

  function resolveDeferredIfInvalidOrVoidCurrent(/** @type {number} */ t, /** @type {number} */ q, /** @type {number} */ r) {
    if (!deferredCollapse) return;
    const d = deferredCollapse;
    if (isHexGroundVoided(d.oldQ, d.oldR)) {
      deferredCollapse = null;
      return;
    }
    if (isHexGroundVoided(d.anchorQ, d.anchorR) || isHexExcludedFromCollapse(d.anchorQ, d.anchorR)) {
      flushVoidOldTile(d, t);
      deferredCollapse = null;
      return;
    }
    if (isHexGroundVoided(q, r) || isHexExcludedFromCollapse(q, r)) {
      flushVoidOldTile(d, t);
      deferredCollapse = null;
    }
  }

  function beginHexPathAt(ctx, cx, cy, vertexR) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (Math.PI / 3) * i;
      const x = cx + Math.cos(a) * vertexR;
      const y = cy + Math.sin(a) * vertexR;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function tick(dt) {
    if (!getShouldTrackCollapse()) {
      reset();
      return;
    }
    const t = getSimElapsed();
    const p = getPlayer();
    const { q, r } = worldToHex(p.x, p.y);
    const key = hexKey(q, r);

    for (const k of [...armedKeys]) {
      const parts = k.split(",").map(Number);
      const hq = parts[0];
      const hr = parts[1];
      if (isHexGroundVoided(hq, hr) || isHexExcludedFromCollapse(hq, hr)) armedKeys.delete(k);
    }

    if (lastStandKey && lastStandKey !== key) {
      const prevKey = lastStandKey;
      const [pq, pr] = prevKey.split(",").map(Number);

      if (tryFinalizeSparedRowHexNorthStep(pq, pr, q, r)) {
        falling.push({ q: pq, r: pr, start: t });
      }

      if (voidOldWhenAxialSolid) {
        const wk = hexKey(voidOldWhenAxialSolid.oldQ, voidOldWhenAxialSolid.oldR);
        if (
          key === wk &&
          !isHexGroundVoided(voidOldWhenAxialSolid.oldQ, voidOldWhenAxialSolid.oldR) &&
          !isHexExcludedFromCollapse(voidOldWhenAxialSolid.oldQ, voidOldWhenAxialSolid.oldR)
        ) {
          armedKeys.add(wk);
          voidOldWhenAxialSolid = null;
        }
      }

      if (deferredCollapse) {
        const anchorKey = hexKey(deferredCollapse.anchorQ, deferredCollapse.anchorR);
        const oldKey = hexKey(deferredCollapse.oldQ, deferredCollapse.oldR);
        if (prevKey === anchorKey) {
          if (key === oldKey) {
            armedKeys.add(oldKey);
            deferredCollapse = null;
          } else {
            flushVoidOldTile(deferredCollapse, t);
            deferredCollapse = null;
          }
        }
      }

      const dq = q - pq;
      const dr = r - pr;
      const steppedNorth = isNorthwardStep(dq, dr);
      if (armedKeys.has(prevKey)) {
        if (isHexGroundVoided(q, r) || isHexExcludedFromCollapse(q, r)) {
          voidOldWhenAxialSolid = { oldQ: pq, oldR: pr, steppedNorth, solidSince: null };
          deferredCollapse = null;
        } else {
          deferredCollapse = { oldQ: pq, oldR: pr, anchorQ: q, anchorR: r, steppedNorth };
        }
        armedKeys.delete(prevKey);
      } else {
        armedKeys.delete(prevKey);
      }
      standSecOnKey = 0;
    }

    lastStandKey = key;

    for (let i = falling.length - 1; i >= 0; i--) {
      if (t - falling[i].start >= FALL_ANIM_SEC) falling.splice(i, 1);
    }

    if (voidOldWhenAxialSolid) {
      const w = voidOldWhenAxialSolid;
      if (isHexGroundVoided(w.oldQ, w.oldR)) {
        voidOldWhenAxialSolid = null;
      } else if (isHexGroundVoided(q, r) || isHexExcludedFromCollapse(q, r)) {
        voidOldWhenAxialSolid.solidSince = null;
      } else {
        if (voidOldWhenAxialSolid.solidSince === null) voidOldWhenAxialSolid.solidSince = t;
        const solidDur = t - voidOldWhenAxialSolid.solidSince;
        const w0 = voidOldWhenAxialSolid;
        const committed =
          solidDur >= COLLAPSE_OLD_VOID_FALLBACK_SEC ||
          (solidDur >= COLLAPSE_SOLID_DWELL_BEFORE_GEOMETRY_SEC &&
            collapseCommittedOffOldTile(p.x, p.y, w0.oldQ, w0.oldR, q, r, R));
        if (committed) {
          flushVoidOldTile(voidOldWhenAxialSolid, t);
          voidOldWhenAxialSolid = null;
        }
      }
    }

    resolveDeferredIfInvalidOrVoidCurrent(t, q, r);

    if (isHexExcludedFromCollapse(q, r) || isHexGroundVoided(q, r)) {
      standSecOnKey = 0;
      return;
    }

    standSecOnKey += dt;

    if (deferredCollapse && q === deferredCollapse.anchorQ && r === deferredCollapse.anchorR) {
      const d = deferredCollapse;
      const committed =
        standSecOnKey >= COLLAPSE_OLD_VOID_FALLBACK_SEC ||
        (standSecOnKey >= COLLAPSE_SOLID_DWELL_BEFORE_GEOMETRY_SEC &&
          collapseCommittedOffOldTile(p.x, p.y, d.oldQ, d.oldR, d.anchorQ, d.anchorR, R));
      if (committed) {
        flushVoidOldTile(d, t);
        deferredCollapse = null;
      }
    }

    if (standSecOnKey >= STAND_ARM_SEC) armedKeys.add(key);
  }

  function makeRand01(seedQ, seedR) {
    let s = ((seedQ * 92837111) ^ (seedR * 689287499)) >>> 0;
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /** Per-vertex jag from seed + index only (no walk → no spiral). */
  function jag01(i, seedQ, seedR, faceIndex = 0) {
    const m =
      (i * 0x85ebca6b + seedQ * 0xc2b2ae35) ^ (seedR * 0x27d4eb2d) ^ (faceIndex * 0x4bc3d12b);
    return ((m >>> 0) & 1023) / 1023;
  }

  /**
   * Hybrid fracture: chord rim→center keeps the global split readable; perpendicular offset is
   * smooth sines + small discrete jags (all functions of t / index), so it can look “broken”
   * like the old system without cumulative steer curling inward.
   * @param {0 | 1} faceIndex — second fracture starts from another edge band (~120° apart).
   */
  function buildFracturePolylines(cx, cy, vertexR, seedQ, seedR, faceIndex = 0) {
    const rand = makeRand01(seedQ + faceIndex * 7919, seedR + faceIndex * 524287);
    const hub = ((seedQ * 92837111) ^ (seedR * 689287499) ^ (faceIndex * 0x165667b1)) >>> 0;
    const startAng = (hub / 4294967296) * TAU + faceIndex * (TAU / 3) + rand() * 0.26;
    const sx = cx + Math.cos(startAng) * vertexR * 0.92;
    const sy = cy + Math.sin(startAng) * vertexR * 0.92;
    const ex = cx + (rand() - 0.5) * vertexR * 0.3;
    const ey = cy + (rand() - 0.5) * vertexR * 0.3;

    const chordX = ex - sx;
    const chordY = ey - sy;
    const chordLen = Math.hypot(chordX, chordY) || 1;
    const ux = chordX / chordLen;
    const uy = chordY / chordLen;
    const px = -uy;
    const py = ux;

    const phase0 = rand() * TAU;
    const phase1 = rand() * TAU;
    const phase2 = rand() * TAU;
    const amp1 = vertexR * (0.048 + rand() * 0.034);
    const amp2 = vertexR * (0.023 + rand() * 0.025);
    const amp3 = vertexR * (0.012 + rand() * 0.015);
    const ampJag = vertexR * (0.06 + rand() * 0.036);

    const nSeg = 16 + ((rand() * 6) | 0);
    const main = [];
    for (let i = 0; i <= nSeg; i++) {
      const ti = i / nSeg;
      const env = Math.sin(Math.PI * ti);
      const env2 = env * env;
      const envMid = env2 * (0.72 + 0.28 * Math.sin(Math.PI * ti));
      const jag = (jag01(i, seedQ, seedR, faceIndex) - 0.5) * 2;
      const zig =
        Math.sin(ti * Math.PI * 2.5 + phase0) * amp1 * envMid +
        Math.sin(ti * Math.PI * 4.5 + phase1) * amp2 * env2 +
        Math.sin(ti * Math.PI * 7.5 + phase2) * amp3 * env2 * 0.55 +
        jag * ampJag * env2;
      main.push(sx + chordX * ti + px * zig, sy + chordY * ti + py * zig);
    }

    const branches = [];
    const nPts = main.length / 2;
    if (nPts >= 5) {
      const ia = 2 + ((rand() * Math.max(1, nPts - 5)) | 0);
      const ib = Math.min(nPts - 3, ia + 2 + ((rand() * 3) | 0));

      function tangentAtVertexIdx(vi) {
        const i = vi * 2;
        let tx = main[i + 2] - main[i];
        let ty = main[i + 3] - main[i + 1];
        if (vi > 0) {
          const tx2 = main[i] - main[i - 2];
          const ty2 = main[i + 1] - main[i - 1];
          tx = (tx + tx2) * 0.5;
          ty = (ty + ty2) * 0.5;
        }
        const d = Math.hypot(tx, ty) || 1;
        return { tx: tx / d, ty: ty / d };
      }

      function shortBranch(vertexIdx, dirSign) {
        const i = vertexIdx * 2;
        const bx = main[i];
        const by = main[i + 1];
        const { tx, ty } = tangentAtVertexIdx(vertexIdx);
        const nx = -ty * dirSign;
        const ny = tx * dirSign;
        const reach = vertexR * (0.19 + rand() * 0.12);
        const pts = [bx, by];
        const m = 5;
        for (let k = 1; k <= m; k++) {
          const u = k / m;
          const ease = u * u * (1 + 0.22 * (1 - u));
          const side =
            (jag01(k + vertexIdx * 7, seedQ, seedR ^ 1, faceIndex) - 0.5) * vertexR * 0.045 * ease;
          pts.push(bx + nx * reach * ease + tx * side, by + ny * reach * ease + ty * side);
        }
        branches.push(pts);
      }

      shortBranch(ia, 1);
      shortBranch(ib, -1);
    }

    return { main, branches };
  }

  function trimPolylineToProgress(flatPts, maxSegs) {
    const n = flatPts.length / 2;
    if (n < 2 || maxSegs < 1) return flatPts.slice(0, 2);
    const take = Math.min(n, 1 + maxSegs);
    return flatPts.slice(0, take * 2);
  }

  function strokeFractureLine(ctx, flatPts, lineW, stroke, alpha) {
    if (flatPts.length < 4) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineW;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(flatPts[0], flatPts[1]);
    for (let i = 2; i < flatPts.length; i += 2) {
      ctx.lineTo(flatPts[i], flatPts[i + 1]);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawCrackOverlay(ctx, cx, cy, crackU, seedQ, seedR) {
    ctx.save();
    beginHexPathAt(ctx, cx, cy, R);
    ctx.clip();

    const w = 1.18 + crackU * 2.05;
    const a = 0.32 + crackU * 0.58;
    const brStart = 0.38;
    const bu = crackU > brStart ? (crackU - brStart) / (1 - brStart) : 0;

    for (let face = 0; face < 2; face++) {
      const { main, branches } = buildFracturePolylines(cx, cy, R, seedQ, seedR, face);
      const nMainSegs = main.length / 2 - 1;
      const mainVisible = Math.max(1, Math.ceil(crackU * nMainSegs));
      const mainTrim = trimPolylineToProgress(main, mainVisible);

      strokeFractureLine(ctx, mainTrim, w + 1.32, "rgba(18, 14, 10, 0.88)", a * 0.92);
      strokeFractureLine(ctx, mainTrim, w * 0.52, "rgba(58, 46, 32, 0.78)", a * 0.95);
      strokeFractureLine(ctx, mainTrim, Math.max(0.62, w * 0.22), "rgba(200, 184, 158, 0.42)", a * 0.7);

      if (crackU > brStart) {
        for (const b of branches) {
          const nb = b.length / 2 - 1;
          const vis = Math.max(1, Math.ceil(bu * nb));
          const bt = trimPolylineToProgress(b, vis);
          strokeFractureLine(ctx, bt, w * 0.72 + 0.88, "rgba(16, 13, 10, 0.86)", a * 0.85);
          strokeFractureLine(ctx, bt, w * 0.32, "rgba(52, 42, 30, 0.75)", a * 0.82);
        }
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawFallShards(ctx, cx, cy, u, seedQ, seedR) {
    const seed = (seedQ * 73856093) ^ (seedR * 19349663);
    const fall = u * u * (R * 2.15);
    const alpha = 1 - u;
    if (alpha < 0.02) return;
    const nShard = 7;
    const wobble = Math.sin(u * Math.PI) * 0.06 * (1 + (seed & 1 ? 1 : -1));

    ctx.save();
    ctx.translate(cx, cy + fall);
    ctx.rotate(u * 0.055 * (seed & 1 ? 1 : -1));
    ctx.globalAlpha = alpha;

    for (let i = 0; i < nShard; i++) {
      const a0 = -Math.PI / 2 + (TAU / nShard) * i + wobble * 0.35;
      const spread = (TAU / nShard) * 0.44;
      const r0 = R * 0.1;
      const r1 = R * (0.82 + 0.05 * (i % 3));
      ctx.beginPath();
      ctx.moveTo(Math.cos(a0) * r0, Math.sin(a0) * r0);
      ctx.lineTo(Math.cos(a0 + spread * 0.55) * r1, Math.sin(a0 + spread * 0.55) * r1);
      ctx.lineTo(Math.cos(a0 + spread) * (r0 * 1.15), Math.sin(a0 + spread) * (r0 * 1.15));
      ctx.closePath();
      const tone = i % 3;
      ctx.fillStyle =
        tone === 0
          ? `rgba(236, 224, 202, ${0.75})`
          : tone === 1
            ? `rgba(188, 162, 128, ${0.72})`
            : `rgba(96, 74, 52, ${0.68})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(42, 32, 20, ${0.42 * alpha})`;
      ctx.lineWidth = 1.15;
      ctx.stroke();
    }

    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = `rgba(40, 28, 18, ${0.18 * alpha})`;
    beginHexPathAt(ctx, 0, 0, R * 0.88);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }

  /** True once a hex is fully cracked (armed or waiting for geometry commit off it). */
  function hexShowsCommittedCrack(hq, hr) {
    const k = hexKey(hq, hr);
    if (armedKeys.has(k)) return true;
    if (deferredCollapse && hexKey(deferredCollapse.oldQ, deferredCollapse.oldR) === k) return true;
    if (voidOldWhenAxialSolid && hexKey(voidOldWhenAxialSolid.oldQ, voidOldWhenAxialSolid.oldR) === k) return true;
    return false;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {{ q: number; r: number }[]} activeHexes
   */
  function draw(ctx, activeHexes) {
    if (!getShouldTrackCollapse()) return;
    const t = getSimElapsed();
    const keySet = new Set(activeHexes.map((h) => hexKey(h.q, h.r)));

    for (const h of activeHexes) {
      const k = hexKey(h.q, h.r);
      if (isHexGroundVoided(h.q, h.r)) continue;
      let crackU = 0;
      if (hexShowsCommittedCrack(h.q, h.r)) {
        crackU = 1;
      } else if (k === lastStandKey) {
        crackU = Math.min(1, standSecOnKey / STAND_ARM_SEC);
      }
      if (crackU <= 0.001) continue;
      const { x: cx, y: cy } = hexToWorld(h.q, h.r);
      drawCrackOverlay(ctx, cx, cy, crackU, h.q, h.r);
    }

    for (const f of falling) {
      if (!keySet.has(hexKey(f.q, f.r))) continue;
      const u = clamp01((t - f.start) / FALL_ANIM_SEC);
      const { x: cx, y: cy } = hexToWorld(f.q, f.r);
      drawFallShards(ctx, cx, cy, u, f.q, f.r);
    }
  }

  return { tick, draw, reset };
}
