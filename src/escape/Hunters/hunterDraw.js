import { TAU } from "../constants.js";
import { clamp } from "./hunterGeometry.js";

export function hunterPalette(type) {
  switch (type) {
    case "chaser":
      return { light: "#fecaca", core: "#dc2626", shadow: "#7f1d1d", rim: "#fca5a5", mark: "#fff1f2" };
    case "cutter":
      return { light: "#fde68a", core: "#d97706", shadow: "#78350f", rim: "#fcd34d", mark: "#fffbeb" };
    case "sniper":
      return { light: "#fbcfe8", core: "#db2777", shadow: "#831843", rim: "#f9a8d4", mark: "#fdf2f8" };
    case "laser":
      return { light: "#fecaca", core: "#ef4444", shadow: "#7f1d1d", rim: "#f87171", mark: "#fef2f2" };
    case "laserBlue":
      return { light: "#bfdbfe", core: "#2563eb", shadow: "#1e3a8a", rim: "#60a5fa", mark: "#eff6ff" };
    case "spawner":
      return { light: "#fecdd3", core: "#e11d48", shadow: "#881337", rim: "#fb7185", mark: "#fff1f2" };
    case "airSpawner":
      return { light: "#ddd6fe", core: "#7c3aed", shadow: "#4c1d95", rim: "#a78bfa", mark: "#f5f3ff" };
    case "ranged":
      return { light: "#bae6fd", core: "#0284c7", shadow: "#0c4a6e", rim: "#38bdf8", mark: "#f0f9ff" };
    case "fast":
      return { light: "#fed7aa", core: "#ea580c", shadow: "#7c2d12", rim: "#fb923c", mark: "#fff7ed" };
    default:
      return { light: "#ddd6fe", core: "#7c3aed", shadow: "#3b0764", rim: "#c4b5fd", mark: "#f5f3ff" };
  }
}

export function drawHunterBody(ctx, h) {
  const pal = hunterPalette(h.type);
  const { x, y, r } = h;
  const g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.08, x, y, r);
  g.addColorStop(0, pal.light);
  g.addColorStop(0.55, pal.core);
  g.addColorStop(1, pal.shadow);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = pal.rim;
  ctx.lineWidth = 2;
  ctx.stroke();
  const mx = h.dir.x * r * 0.38;
  const my = h.dir.y * r * 0.38;
  ctx.fillStyle = pal.mark;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(x + mx, y + my, r * 0.22, 0, TAU);
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
  const pulse = 0.5 + 0.5 * Math.sin(now * (beam.warning ? 26 : 16));

  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(ang);
  ctx.lineCap = "round";

  if (beam.warning) {
    const t = clamp((now - beam.bornAt) / Math.max(0.001, beam.expiresAt - beam.bornAt), 0, 1);
    const fade = 0.42 + 0.48 * (1 - t * 0.4);
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

function drawArtilleryDetonationBang(ctx, zone, u) {
  const { x, y, r } = zone;
  const fade = 1 - u * u;
  const coreR = r * (0.5 + 0.2 * (1 - u));
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

export function drawDangerZones(ctx, dangerZones, now, sniperBangDuration) {
  for (const zone of dangerZones) {
    const zu = zone.windup != null ? zone.windup : 0.8;
    const life = clamp((now - zone.bornAt) / zu, 0, 1);
    const lingering = zone.exploded && now < (zone.lingerUntil ?? zone.detonateAt);
    const tSinceDet = now - zone.detonateAt;
    const inBang = zone.exploded && lingering && tSinceDet < sniperBangDuration;

    if (!zone.exploded) {
      const pulse = 1 + Math.sin(now * 20) * 0.08;
      const radius = zone.r * pulse;
      drawCircle(ctx, zone.x, zone.y, radius, "#ef4444", 0.25 + life * 0.4);
      ctx.strokeStyle = "#f87171";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, radius, 0, TAU);
      ctx.stroke();
    } else if (lingering) {
      const r = zone.r;
      drawCircle(ctx, zone.x, zone.y, r, "#9f1239", 0.38);
      ctx.strokeStyle = "rgba(248, 113, 113, 0.95)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, r, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "rgba(254, 202, 202, 0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, r * 0.72, 0, TAU);
      ctx.stroke();
      if (inBang) {
        const u = clamp(tSinceDet / sniperBangDuration, 0, 1);
        drawArtilleryDetonationBang(ctx, zone, u);
      }
    }
  }
}

export function drawSniperBullets(ctx, bullets, now) {
  for (const b of bullets) {
    const life = clamp((now - b.bornAt) / b.life, 0, 1);
    const x = b.x + (b.tx - b.x) * life;
    const y = b.y + (b.ty - b.y) * life;
    drawCircle(ctx, x, y, 2, "#fca5a5");
  }
}

export function drawSpawnerChargeClocks(ctx, hunters, now) {
  for (const h of hunters) {
    if (h.type !== "spawner" && h.type !== "airSpawner") continue;
    if (now >= h.spawnDelayUntil) continue;

    const delayTotal = h.type === "airSpawner" ? 2.1 : 2;
    const elapsedSinceBorn = now - h.bornAt;
    const progress = clamp(elapsedSinceBorn / delayTotal, 0, 1);
    const remaining = 1 - progress;

    const clockR = h.r + 28 + remaining * 6;
    const pulse = 1 + Math.sin(now * 10) * 0.04;
    const alpha = 0.1 + remaining * 0.18;
    const ringCol = h.type === "airSpawner" ? "#a78bfa" : "#fb7185";
    const handCol = h.type === "airSpawner" ? "#7c3aed" : "#f43f5e";

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
