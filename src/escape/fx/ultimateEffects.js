const TAU = Math.PI * 2;

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
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

export function drawUltimateEffects(ctx, effects, shields, elapsed, player) {
  for (const fx of effects) {
    if (elapsed < fx.bornAt) continue;
    const span = Math.max(1e-3, fx.expiresAt - fx.bornAt);
    const t = clamp((elapsed - fx.bornAt) / span, 0, 1);
    if (fx.type === "burstWave") {
      const ease = 1 - Math.pow(1 - t, 1.35);
      const rr = fx.radius * (0.1 + ease * 0.98);
      ctx.save();
      ctx.translate(fx.x, fx.y);
      ctx.rotate(elapsed * 6 + fx.bornAt * 3);
      if (t < 0.22) {
        const flash = 1 - t / 0.22;
        drawCircle(ctx, 0, 0, rr * 0.12 + flash * fx.radius * 0.1, "#ffffff", 0.5 * flash);
      }
      const segs = 40;
      for (let k = 0; k < 3; k++) {
        const rrk = rr * (1 - k * 0.1);
        const alpha = (0.62 - k * 0.14) * (1 - t);
        ctx.strokeStyle = `rgba(224, 242, 254, ${alpha})`;
        ctx.lineWidth = 11 - k * 2.5 - t * 5;
        ctx.beginPath();
        for (let i = 0; i <= segs; i++) {
          const ang = (i / segs) * TAU;
          const wobble = 1 + 0.045 * Math.sin(ang * 9 + elapsed * 24);
          const px = Math.cos(ang) * rrk * wobble;
          const py = Math.sin(ang) * rrk * wobble;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = `rgba(96, 165, 250, ${0.4 * (1 - t)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, rr + 10, 0, TAU);
      ctx.stroke();
    } else if (fx.type === "shieldSummon") {
      const rr = fx.radius * (0.2 + t * 1.05);
      const pulse = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(elapsed * 18));
      ctx.save();
      ctx.translate(fx.x, fx.y);
      ctx.rotate(-elapsed * 2.2);
      const rays = 24;
      for (let i = 0; i < rays; i++) {
        const ang = (i / rays) * TAU;
        const len = rr * (0.5 + 0.55 * (1 - t));
        const alpha = (0.35 - i * 0.008) * (1 - t);
        ctx.strokeStyle = `rgba(191, 219, 254, ${Math.max(0, alpha)})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * rr * 0.08, Math.sin(ang) * rr * 0.08);
        ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
        ctx.stroke();
      }
      ctx.restore();
      drawCircle(ctx, fx.x, fx.y, rr * (0.2 + pulse * 0.1), "#ffffff", 0.2 * (1 - t));
      drawCircle(ctx, fx.x, fx.y, rr * 0.45, "#dbeafe", 0.28 * (1 - t * 0.6));
      drawCircle(ctx, fx.x, fx.y, rr, fx.color, 0.14 * (1 - t));
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 * (1 - t)})`;
      ctx.lineWidth = 5 - t * 2.5;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, rr * (0.92 - t * 0.08), 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.45 * (1 - t)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, rr * 1.08, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(186, 230, 253, ${0.35 * (1 - t)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, rr * (0.72 + 0.12 * pulse), 0, TAU);
      ctx.stroke();
    } else if (fx.type === "timelockWorld") {
      const ease = 1 - Math.pow(1 - t, 0.85);
      const rr = fx.radius * (0.15 + ease * 1.05);
      const frost = 0.22 * (1 - t);
      drawCircle(ctx, fx.x, fx.y, rr, "#e0e7ff", frost * 0.5);
      ctx.strokeStyle = `rgba(196, 181, 253, ${0.55 * (1 - t * 0.5)})`;
      ctx.lineWidth = 5 + (1 - t) * 4;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, rr, 0, TAU);
      ctx.stroke();
      const ticks = 24;
      for (let i = 0; i < ticks; i++) {
        const ang = (i / ticks) * TAU - elapsed * 0.35;
        ctx.strokeStyle = `rgba(237, 233, 254, ${0.35 * (1 - t)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fx.x + Math.cos(ang) * rr * 0.88, fx.y + Math.sin(ang) * rr * 0.88);
        ctx.lineTo(fx.x + Math.cos(ang) * rr * 1.02, fx.y + Math.sin(ang) * rr * 1.02);
        ctx.stroke();
      }
    } else if (fx.type === "timelock") {
      const phaseSelf = t < 0.5;
      const localSelf = phaseSelf ? t / 0.5 : 1;
      const fade = phaseSelf ? 1 : Math.max(0, 1 - (t - 0.5) * 2.2);
      const pulse = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(elapsed * 14));
      const spiralR = fx.radius * (0.35 + localSelf * 0.9) + pulse * 8;
      drawCircle(ctx, fx.x, fx.y, spiralR, "#c084fc", (0.1 + (1 - localSelf) * 0.08) * fade);
      ctx.strokeStyle = `rgba(233, 213, 255, ${(0.5 + 0.25 * (1 - localSelf)) * fade})`;
      ctx.lineWidth = 3;
      const coils = 3;
      ctx.beginPath();
      for (let i = 0; i <= 72; i++) {
        const u = i / 72;
        const ang = u * coils * TAU + elapsed * 3;
        const rad = 8 + u * spiralR * 0.95;
        const px = fx.x + Math.cos(ang) * rad;
        const py = fx.y + Math.sin(ang) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      const tickN = 12;
      for (let i = 0; i < tickN; i++) {
        const ang = (i / tickN) * TAU - elapsed * 2;
        ctx.strokeStyle = `rgba(250, 245, 255, ${0.55 * fade})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fx.x + Math.cos(ang) * (player.r + 6), fx.y + Math.sin(ang) * (player.r + 6));
        ctx.lineTo(fx.x + Math.cos(ang) * (player.r + 18), fx.y + Math.sin(ang) * (player.r + 18));
        ctx.stroke();
      }
    } else if (fx.type === "healVitality") {
      const pulse = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(elapsed * 16));
      for (let ring = 0; ring < 3; ring++) {
        const lag = ring * 0.12;
        const tt = clamp((t - lag) / (1 - lag), 0, 1);
        const rr = fx.radius * (0.25 + tt * 0.82);
        drawCircle(ctx, fx.x, fx.y, rr, "#6ee7b7", 0.08 * (1 - tt) * (1 - ring * 0.2));
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.45 * (1 - tt) * pulse})`;
        ctx.lineWidth = 4 - ring;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, rr, 0, TAU);
        ctx.stroke();
      }
      const rays = 14;
      for (let i = 0; i < rays; i++) {
        const ang = (i / rays) * TAU + elapsed * 0.8;
        const len = fx.radius * (0.4 + 0.55 * (1 - t));
        ctx.strokeStyle = `rgba(167, 243, 208, ${0.4 * (1 - t)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fx.x, fx.y);
        ctx.lineTo(fx.x + Math.cos(ang) * len, fx.y + Math.sin(ang) * len);
        ctx.stroke();
      }
      if (t < 0.35) {
        const b = 1 - t / 0.35;
        drawCircle(ctx, fx.x, fx.y, player.r + 6 + b * 12, "#ecfdf5", 0.35 * b);
      }
    }
  }

  for (const shield of shields) {
    const spawnAge = shield.bornAt != null ? clamp((elapsed - shield.bornAt) / 0.34, 0, 1) : 1;
    const pop = 0.2 + 0.8 * (1 - Math.pow(1 - spawnAge, 2.4));
    const pulse = 0.9 + 0.1 * Math.sin(elapsed * 8 + shield.angle * 2.2);
    const drawR = shield.r * pop * pulse;
    const tx = -Math.sin(shield.angle);
    const ty = Math.cos(shield.angle);
    ctx.strokeStyle = "rgba(147, 197, 253, 0.35)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(shield.x - tx * (drawR + 6), shield.y - ty * (drawR + 6));
    ctx.lineTo(shield.x + tx * (drawR + 14), shield.y + ty * (drawR + 14));
    ctx.stroke();
    drawCircle(ctx, shield.x, shield.y, drawR + 9, "#bfdbfe", 0.28);
    drawCircle(ctx, shield.x, shield.y, drawR + 4, "#e0f2fe", 0.45);
    drawCircle(ctx, shield.x, shield.y, drawR, "#38bdf8", 0.95);
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(shield.x, shield.y, drawR + 1.2, 0, TAU);
    ctx.stroke();
  }

  if (shields.length) {
    const orbitR = shields[0].radius;
    ctx.strokeStyle = "rgba(147, 197, 253, 0.2)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 10]);
    ctx.lineDashOffset = -elapsed * 40;
    ctx.beginPath();
    ctx.arc(player.x, player.y, orbitR, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
