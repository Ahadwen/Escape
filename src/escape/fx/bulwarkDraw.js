import { TAU } from "../constants.js";
import { BULWARK_PARRY_DURATION_SEC, BULWARK_FLAG_MAX_HP } from "../balance.js";

/**
 * Front shield arc — steel / cyan (Bulwark passive + charge read as “forward”).
 * Same geometry as `drawFrontShieldArc` in `draw.js`.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number; y: number; r: number; facing: { x: number; y: number }; frontShieldArcDeg?: number }} player
 * @param {number} elapsed
 */
export function drawBulwarkFrontShieldArc(ctx, player, elapsed) {
  const arcDeg = Math.max(0, Number(player.frontShieldArcDeg ?? 0));
  if (arcDeg <= 0) return;
  const fx = player.facing?.x ?? 1;
  const fy = player.facing?.y ?? 0;
  const facing = Math.atan2(fy, fx);
  const arc = (arcDeg * Math.PI) / 180;
  const pulse = 0.82 + 0.18 * (0.5 + 0.5 * Math.sin(elapsed * 8));
  const r = player.r + 28;
  ctx.save();
  ctx.strokeStyle = `rgba(56, 189, 248, ${0.82 * pulse})`;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(player.x, player.y, r, facing - arc / 2, facing + arc / 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(186, 230, 253, ${0.42 * pulse})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(player.x, player.y, r + 4, facing - arc / 2, facing + arc / 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Flag on the hero — vertical pole, banner to world +X only (does not spin with facing). HP as text only.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number; y: number; r: number }} player
 * @param {number} carriedHp
 * @param {number} maxHp
 * @param {number} elapsed
 */
export function drawBulwarkFlagCarried(ctx, player, carriedHp, maxHp, elapsed) {
  const bx = player.x;
  const by = player.y - player.r - 30;
  const mh = maxHp > 0 ? maxHp : BULWARK_FLAG_MAX_HP;
  const hpText = `${Math.floor(carriedHp)}/${Math.ceil(mh)}`;

  ctx.save();
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bx, by + 18);
  ctx.lineTo(bx, by - 18);
  ctx.stroke();

  const wave = Math.sin(elapsed * 9) * 2.5;
  ctx.fillStyle = "#15803d";
  ctx.beginPath();
  ctx.moveTo(bx, by - 14);
  ctx.lineTo(bx + 26 + wave, by - 10);
  ctx.lineTo(bx + 22 - wave * 0.35, by + 2);
  ctx.lineTo(bx, by - 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#86efac";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.font = "bold 10px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(2, 6, 23, 0.85)";
  ctx.strokeText(hpText, bx, by + 22);
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText(hpText, bx, by + 22);
  ctx.restore();
}

/**
 * Planted flag — same fixed banner direction; HP + charge count.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number; y: number; hp: number; maxHp?: number }} flagDecoy
 * @param {number} elapsed
 * @param {number} [chargeCount=0] count built while planted (shown large under HP).
 */
export function drawBulwarkFlagPlanted(ctx, flagDecoy, elapsed, chargeCount = 0) {
  const { x, y, hp, maxHp } = flagDecoy;
  const mh = maxHp ?? BULWARK_FLAG_MAX_HP;
  const hpText = `${Math.ceil(hp)}/${Math.ceil(mh)}`;
  const chargeText = String(Math.floor(chargeCount));

  ctx.save();
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y + 22);
  ctx.lineTo(x, y - 40);
  ctx.stroke();

  const wave = Math.sin(elapsed * 5.5 + x * 0.015) * 3.5;
  ctx.fillStyle = "#166534";
  ctx.beginPath();
  ctx.moveTo(x, y - 34);
  ctx.lineTo(x + 34 + wave, y - 26);
  ctx.lineTo(x + 30 - wave * 0.5, y - 12);
  ctx.lineTo(x, y - 18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#4ade80";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "bold 11px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(2, 6, 23, 0.85)";
  ctx.strokeText(hpText, x, y + 30);
  ctx.fillStyle = "#f1f5f9";
  ctx.fillText(hpText, x, y + 30);

  ctx.font = "800 14px system-ui, sans-serif";
  ctx.strokeStyle = "rgba(2, 6, 23, 0.9)";
  ctx.lineWidth = 4;
  ctx.strokeText(chargeText, x, y + 46);
  ctx.fillStyle = "#6ee7b7";
  ctx.fillText(chargeText, x, y + 46);
  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number; y: number; r: number }} player
 * @param {number} elapsed
 * @param {number} parryUntil
 */
export function drawBulwarkParry(ctx, player, elapsed, parryUntil) {
  if (elapsed >= parryUntil) return;
  const start = parryUntil - BULWARK_PARRY_DURATION_SEC;
  const u = Math.max(0, Math.min(1, (elapsed - start) / BULWARK_PARRY_DURATION_SEC));
  const { x: px, y: py, r: pr } = player;
  const pulse = 1 + 0.35 * Math.sin(u * Math.PI * 18);
  const fade = 1 - u * 0.35;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = `rgba(254, 249, 195, ${0.55 * fade})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(px, py, pr + 12 + u * 26 * pulse, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(250, 204, 21, ${0.45 * fade})`;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(px, py, pr + 22 + u * 40 * pulse, 0, TAU);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(253, 224, 71, ${0.14 * fade})`;
  ctx.beginPath();
  ctx.arc(px, py, pr + 8, 0, TAU);
  ctx.fill();
  ctx.restore();
}
