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
    case "cryptSpawner":
      return { light: "#f8fafc", core: "#e2e8f0", shadow: "#475569", rim: "#f1f5f9", mark: "#ffffff" };
    case "ranged":
      return { light: "#bae6fd", core: "#0284c7", shadow: "#0c4a6e", rim: "#38bdf8", mark: "#f0f9ff" };
    case "fast":
      return { light: "#fed7aa", core: "#ea580c", shadow: "#7c2d12", rim: "#fb923c", mark: "#fff7ed" };
    case "ghost":
      return { light: "#f3f4f6", core: "#cbd5e1", shadow: "#6b7280", rim: "#e5e7eb", mark: "#ffffff" };
    default:
      return { light: "#ddd6fe", core: "#7c3aed", shadow: "#3b0764", rim: "#c4b5fd", mark: "#f5f3ff" };
  }
}

export function drawHunterBody(ctx, h) {
  if (h.type === "cryptSpawner" && h.cryptDisguised) {
    const s = 35;
    ctx.save();
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.fillRect(h.x - s / 2, h.y - s / 2, s, s);
    ctx.strokeRect(h.x - s / 2, h.y - s / 2, s, s);
    ctx.restore();
    return;
  }
  const pal = hunterPalette(h.type);
  const { x, y, r } = h;
  const alpha = clamp(Number(h.opacity ?? 1), 0, 1);
  const ghostTelegraph = h.type === "ghost" && (h.ghostPhase === "telegraph1" || h.ghostPhase === "telegraph2");
  const teleU = ghostTelegraph ? clamp(Number(h.ghostTelegraphU ?? 0), 0, 1) : 0;
  const rBody = ghostTelegraph ? r * (1 - 0.12 * Math.sin(teleU * Math.PI)) : r;
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
      const firePath = !!zone.firePath;
      drawCircle(ctx, zone.x, zone.y, radius, firePath ? "#dc2626" : "#ef4444", 0.25 + life * 0.4);
      ctx.strokeStyle = firePath ? "#fb7185" : "#f87171";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, radius, 0, TAU);
      ctx.stroke();
      if (firePath) {
        const inner = radius * (0.58 + 0.08 * Math.sin(now * 9));
        drawCircle(ctx, zone.x, zone.y, inner, "#fb7185", 0.16 + 0.1 * life);
        ctx.strokeStyle = "rgba(254, 226, 226, 0.55)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, radius * 0.78, 0, TAU);
        ctx.stroke();
      }
    } else if (lingering) {
      const r = zone.r;
      const firePath = !!zone.firePath;
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
    drawCircle(ctx, p.x, p.y, p.r, "#2d1f12", 0.5 * fade);
    drawCircle(ctx, p.x, p.y, p.r * 0.78, "#3f2f1e", (0.2 + 0.12 * pulse) * fade);
    ctx.strokeStyle = `rgba(161, 98, 7, ${(0.45 + pulse * 0.2) * fade})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (0.9 + 0.05 * pulse), 0, TAU);
    ctx.stroke();
  }
}

export function drawSwampBlastBursts(ctx, bursts, now) {
  for (const b of bursts) {
    const t = clamp((now - b.bornAt) / Math.max(0.001, b.life), 0, 1);
    const fade = 1 - t;
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
    if (h.type !== "spawner" && h.type !== "airSpawner" && h.type !== "cryptSpawner") continue;
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
