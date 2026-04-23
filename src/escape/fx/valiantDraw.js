import { TAU } from "../constants.js";

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number; y: number; w: number; h: number; expiresAt: number }[]} boxes
 * @param {number} elapsed
 */
export function drawValiantShockFields(ctx, boxes, elapsed) {
  for (const box of boxes) {
    if (elapsed >= box.expiresAt) continue;
    const { x, y, w, h } = box;
    const cs = Math.min(28, w * 0.11, h * 0.11);
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
    ctx.fillRect(x, y, cs, cs);
    ctx.fillRect(x + w - cs, y, cs, cs);
    ctx.fillRect(x + w - cs, y + h - cs, cs, cs);
    ctx.fillRect(x, y + h - cs, cs, cs);
    const inset = cs * 0.32;
    const ix = x + inset;
    const iy = y + inset;
    const iw = w - inset * 2;
    const ih = h - inset * 2;
    const flicker = 0.55 + 0.45 * Math.sin(elapsed * 19 + x * 0.015);
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.52 * flicker})`;
    ctx.lineWidth = 3.2;
    ctx.shadowColor = "rgba(56, 189, 248, 0.65)";
    ctx.shadowBlur = 16;
    ctx.setLineDash([8, 5]);
    ctx.lineDashOffset = -elapsed * 52;
    ctx.strokeRect(ix, iy, iw, ih);
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(147, 197, 253, ${0.45 + 0.4 * Math.sin(elapsed * 24 + y * 0.018)})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    const jx = 0.18 + 0.08 * Math.sin(elapsed * 31);
    ctx.moveTo(ix + iw * jx, iy);
    ctx.lineTo(ix + iw * jx, iy + ih);
    ctx.moveTo(ix + iw * (1 - jx), iy);
    ctx.lineTo(ix + iw * (1 - jx), iy + ih);
    ctx.moveTo(ix, iy + ih * jx);
    ctx.lineTo(ix + iw, iy + ih * jx);
    ctx.moveTo(ix, iy + ih * (1 - jx));
    ctx.lineTo(ix + iw, iy + ih * (1 - jx));
    ctx.stroke();
    ctx.strokeStyle = `rgba(253, 224, 71, ${0.22 + 0.18 * flicker})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.restore();
  }
}

/**
 * Wild pickup bunnies — REFERENCE `entities.valiantBunnies` draw (ellipse body + ear ellipses).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number; y: number; r: number }[]} bunnies
 * @param {number} elapsed
 */
export function drawValiantBunnies(ctx, bunnies, elapsed) {
  for (const bn of bunnies) {
    if (elapsed >= bn.expiresAt) continue;
    const { x, y, r } = bn;
    const pulse = 0.92 + 0.08 * Math.sin(elapsed * 9 + x * 0.02);
    const rp = r * pulse;
    ctx.save();
    ctx.fillStyle = "#fecdd3";
    ctx.beginPath();
    ctx.ellipse(x, y + rp * 0.08, rp * 0.82, rp * 0.68, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.ellipse(x - rp * 0.55, y - rp * 0.42, rp * 0.28, rp * 0.5, -0.4, 0, TAU);
    ctx.ellipse(x + rp * 0.55, y - rp * 0.42, rp * 0.28, rp * 0.5, 0.4, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(157, 23, 77, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y + rp * 0.08, rp * 0.82, rp * 0.68, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Equipped rabbit orbiters — REFERENCE `drawValiantRabbitOrbiters`: body, ear icons, HP bar, HP text.
 * Draw after the player body so companions read on top.
 * @param {number} [bodyAlpha]
 */
export function drawValiantRabbitOrbiters(ctx, world, player, elapsed, bodyAlpha = 1) {
  void elapsed;
  ctx.save();
  ctx.globalAlpha = clamp(bodyAlpha, 0, 1);
  const slots = world.getRabbitSlots();
  const br = 5.5;
  for (let slot = 0; slot < 3; slot++) {
    const rb = slots[slot];
    if (!rb || rb.hp <= 0) continue;
    const { x: bx, y: by } = world.rabbitAnchorWorld(slot, player);

    ctx.fillStyle = "#fecdd3";
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(157, 23, 77, 0.8)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const earR = br * 0.28;
    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.ellipse(bx - br * 0.55, by - br * 0.42, earR, earR * 1.2, -0.4, 0, TAU);
    ctx.ellipse(bx + br * 0.55, by - br * 0.42, earR, earR * 1.2, 0.4, 0, TAU);
    ctx.fill();

    const ratio = rb.maxHp > 0 ? rb.hp / rb.maxHp : 0;
    ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
    ctx.fillRect(bx - br, by + br + 2, br * 2, 2.5);
    ctx.fillStyle = ratio > 0.45 ? "#4ade80" : "#f87171";
    ctx.fillRect(bx - br, by + br + 2, br * 2 * ratio, 2.5);

    const hpLabel = `${Math.round(rb.hp)}/${Math.round(rb.maxHp)}`;
    ctx.font = "bold 9px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(15, 23, 42, 0.92)";
    ctx.strokeText(hpLabel, bx, by + br + 5);
    ctx.fillStyle = "#f8fafc";
    ctx.fillText(hpLabel, bx, by + br + 5);
  }
  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {ReturnType<import("../Characters/valiantWorld.js").createValiantWorld>} world
 * @param {number} elapsed
 */
export function drawValiantRabbitFx(ctx, world, elapsed) {
  for (const fx of world.getRabbitFx()) {
    const u = clamp((elapsed - fx.bornAt) / Math.max(1e-3, fx.expiresAt - fx.bornAt), 0, 1);
    if (fx.kind === "rabbitDeath") {
      const { x, y, angles } = fx;
      const fade = (1 - u) * (1 - u);
      const splurt = Math.sin(u * Math.PI);
      ctx.save();
      ctx.globalAlpha = 0.9 * fade;
      for (let i = 0; i < (angles?.length ?? 0); i++) {
        const ang = angles[i];
        const len = 7 + splurt * (24 + (i % 4) * 5);
        ctx.strokeStyle = i % 2 === 0 ? "rgba(185, 28, 28, 0.95)" : "rgba(127, 29, 29, 0.88)";
        ctx.lineWidth = 1.8 + (i % 3) * 0.45;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.45 * (1 - u);
      ctx.fillStyle = "rgba(153, 27, 27, 0.9)";
      ctx.beginPath();
      ctx.ellipse(x, y + 3, 11 * (0.45 + u * 0.55), 5 * (0.4 + u * 0.35), 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    } else if (fx.kind === "rescue" || fx.kind === "bunnySaved") {
      /** REFERENCE `standalone.js` `drawValiantRabbitFx` — rescue: beam + rabbit rise, then zoom-away trails. */
      const { x, y } = fx;
      const riseEnd = 0.42;
      if (u < riseEnd) {
        const u1 = u / riseEnd;
        ctx.save();
        const beamH = 22 + u1 * 118;
        const grad = ctx.createLinearGradient(x, y + 24, x, y - beamH);
        grad.addColorStop(0, "rgba(254, 243, 199, 0)");
        grad.addColorStop(0.28, "rgba(253, 224, 71, 0.28)");
        grad.addColorStop(0.62, "rgba(255, 255, 255, 0.5)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0.12)");
        ctx.fillStyle = grad;
        const wv = 11 + u1 * 16;
        ctx.beginPath();
        ctx.moveTo(x - wv * 0.5, y + 24);
        ctx.lineTo(x + wv * 0.5, y + 24);
        ctx.lineTo(x + wv * 0.2, y - beamH);
        ctx.lineTo(x - wv * 0.2, y - beamH);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(254, 252, 232, ${0.32 * (1 - u1 * 0.25)})`;
        ctx.fillRect(x - 3.5, y - beamH * u1, 7, beamH * u1 + 22);
        const ry = y - 10 - 36 * u1;
        const br = 5.5;
        ctx.fillStyle = "#fecdd3";
        ctx.beginPath();
        ctx.arc(x, ry, br, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "rgba(157, 23, 77, 0.78)";
        ctx.lineWidth = 1.15;
        ctx.stroke();
        ctx.restore();
      } else {
        const u2 = (u - riseEnd) / (1 - riseEnd);
        const ease = u2 * u2;
        const br = 5.5 * (1 - ease * 0.88);
        const rx = x + 78 * ease * ease + Math.sin(u2 * Math.PI * 2.5) * 5;
        const ry = y - 46 - 128 * ease - 18 * Math.sin(u2 * Math.PI);
        const fade = 1 - ease;
        ctx.save();
        ctx.globalAlpha = 0.4 * fade;
        ctx.strokeStyle = "rgba(253, 230, 138, 0.95)";
        ctx.lineWidth = 2;
        for (let k = 0; k < 5; k++) {
          const lag = k * 0.07;
          const lk = clamp(u2 - lag, 0, 1);
          const sx = x + 62 * lk * lk;
          const sy = y - 46 - 102 * lk * lk;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }
        ctx.globalAlpha = fade;
        ctx.fillStyle = "#fecdd3";
        ctx.beginPath();
        ctx.arc(rx, ry, Math.max(1.5, br), 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

/**
 * Above-player Will text only — REFERENCE `drawPlayerHpHud` Valiant branch (no bar on the body).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number; y: number; r: number }} player
 * @param {number} will01
 * @param {number} [extraHudYOffset]
 */
export function drawValiantWillTextAbovePlayer(ctx, player, will01, extraHudYOffset = 0) {
  const px = player.x;
  const py = player.y;
  const pr = player.r;
  const wPct = Math.round(will01 * 100);
  const yMain = py - pr - 10 - extraHudYOffset;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.font = 'bold 14px ui-sans-serif, system-ui, "Segoe UI", sans-serif';
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(2, 6, 23, 0.82)";
  ctx.strokeText(`Will ${wPct}%`, px, yMain);
  ctx.fillStyle = will01 <= 0.22 ? "#fca5a5" : "#e0e7ff";
  ctx.fillText(`Will ${wPct}%`, px, yMain);
  ctx.restore();
}

/**
 * Screen-space Valiant status — REFERENCE stats block: Will bar, rabbit count / Will-per-sec, slot pips.
 * Call after `ctx.restore()` (identity transform), same as `drawRunStatsHud`.
 * @param {object} p
 * @param {number} p.will01
 * @param {number} p.occupiedRabbitCount
 * @param {number} p.netWillPerSec
 * @param {(null | { hp: number; maxHp: number })[]} p.rabbitSlots
 */
export function drawValiantScreenHud(ctx, p) {
  const { will01, occupiedRabbitCount, netWillPerSec, rabbitSlots } = p;
  const x = 14;
  const y = 114;
  const w = 160;
  const h = 10;
  const occ = occupiedRabbitCount;
  const empty = 3 - occ;

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.fillStyle = "rgba(51, 65, 85, 0.9)";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = will01 > 0.22 ? "#a5b4fc" : "#fb7185";
  ctx.fillRect(x, y, w * clamp(will01, 0, 1), h);
  ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);

  ctx.font = "15px Arial";
  ctx.fillStyle = "#e0e7ff";
  ctx.fillText(`Will ${(will01 * 100).toFixed(0)}%`, x, y + 14);

  ctx.font = "12px Arial";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(
    `Rabbits: ${occ}/3 (${empty} empty) — ${netWillPerSec >= 0 ? "+" : ""}${netWillPerSec.toFixed(3)} Will/s`,
    x,
    y + 30,
  );

  const pipY = y - 10;
  const pipSpacing = 18;
  for (let i = 0; i < 3; i++) {
    const slot = rabbitSlots[i];
    const filled = slot && slot.hp > 0;
    const cx = x + 8 + i * pipSpacing;
    ctx.beginPath();
    ctx.arc(cx, pipY + 4, 5, 0, TAU);
    if (filled) {
      const t = slot.maxHp > 0 ? slot.hp / slot.maxHp : 0;
      ctx.fillStyle = t < 0.35 ? "#fca5a5" : "#fecdd3";
      ctx.fill();
      ctx.strokeStyle = "rgba(157, 23, 77, 0.85)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = "#fb7185";
      const er = 2.1;
      ctx.beginPath();
      ctx.ellipse(cx - 2.8, pipY + 1.5, er, er * 1.1, -0.35, 0, TAU);
      ctx.ellipse(cx + 2.8, pipY + 1.5, er, er * 1.1, 0.35, 0, TAU);
      ctx.fill();
    } else {
      ctx.strokeStyle = "rgba(148, 163, 184, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * REFERENCE `entities.healPopups` draw — rise + fade above pickup point.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number; y: number; text: string; color: string; fontPx: number; bornAt: number; expiresAt: number }[]} popups
 * @param {number} elapsed
 */
export function drawValiantFloatPopups(ctx, popups, elapsed) {
  if (!popups?.length) return;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const p of popups) {
    if (elapsed >= p.expiresAt) continue;
    const dur = p.expiresAt - p.bornAt;
    const t = dur > 0 ? clamp((elapsed - p.bornAt) / dur, 0, 1) : 1;
    const y = p.y - t * 20;
    ctx.globalAlpha = 1 - t;
    const fs = p.fontPx ?? 13;
    ctx.font = `bold ${fs}px Arial`;
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = p.color ?? "#86efac";
    ctx.fillText(p.text, p.x, y);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  ctx.restore();
}
