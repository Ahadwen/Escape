import { SET_BONUS_SUIT_THRESHOLD } from "../balance.js";

const ULTIMATE_ABILITY_COOLDOWN_SEC = 20;
const ULT_BURST_RADIUS = 250;
const ULT_BURST_WAVE_COUNT = 4;
const ULT_BURST_WAVE_SPAN_SEC = 2;
const KNIGHT_SPADES_WORLD_SLOW_SEC = 2;

export function getEquippedUltimateType(inventory) {
  const ace = inventory?.deckByRank?.[1];
  const e = ace?.effect;
  return e && e.kind === "ultimate" ? e.ultType : null;
}

function cdRemaining(readyAt, elapsed) {
  return Math.max(0, readyAt - elapsed);
}

function cdValue(readyAt, elapsed) {
  const left = cdRemaining(readyAt, elapsed);
  if (left <= 0.05) return "READY";
  return `${left.toFixed(1)}s`;
}

function ultimateDisplayName(ultType) {
  if (ultType === "shield") return "Shield";
  if (ultType === "burst") return "Earthquake";
  if (ultType === "timelock") return "Timelock";
  if (ultType === "heal") return "Heal";
  return "Ultimate";
}

/** Shared item-driven HUD cell for the R slot. */
export function buildEquippedUltimateHud(inventory, elapsed, fallbackLabel = "Ultimate", color = "#60a5fa") {
  const ultType = getEquippedUltimateType(inventory);
  const hasAceUlt = !!ultType;
  const readyAt = Number(inventory?.aceUltimateReadyAt ?? 0);
  const displayName = ultimateDisplayName(ultType);
  return {
    label: hasAceUlt ? displayName : fallbackLabel,
    value: hasAceUlt ? cdValue(readyAt, elapsed) : "---",
    fill: {
      remaining: hasAceUlt ? cdRemaining(readyAt, elapsed) : 1,
      duration: hasAceUlt ? ULTIMATE_ABILITY_COOLDOWN_SEC : 1,
      color,
    },
  };
}

function applyUltimateBurstWavePush(player, hunterEntities, burstRadius) {
  if (!hunterEntities) return;
  for (const h of hunterEntities.hunters ?? []) {
    const dx = h.x - player.x;
    const dy = h.y - player.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > burstRadius * burstRadius) continue;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const push = h.type === "spawner" || h.type === "airSpawner" ? 0 : 95;
    h.x += ux * push;
    h.y += uy * push;
    h.dir = { x: ux, y: uy };
  }
  for (let i = (hunterEntities.projectiles?.length ?? 0) - 1; i >= 0; i--) {
    const p = hunterEntities.projectiles[i];
    const dx = p.x - player.x;
    const dy = p.y - player.y;
    if (dx * dx + dy * dy <= burstRadius * burstRadius) hunterEntities.projectiles.splice(i, 1);
  }
}

/**
 * Resolve Ace-rank ultimate and consume the R key when available.
 * @param {object} ctx
 * @returns {boolean} true if an Ace ultimate consumed the press.
 */
export function tryUseEquippedUltimate(ctx) {
  const ultType = getEquippedUltimateType(ctx.inventory);
  if (!ultType) return false;

  const elapsed = ctx.elapsed ?? 0;
  const readyAt = Number(ctx.inventory.aceUltimateReadyAt ?? 0);
  if (elapsed < readyAt) return true;

  if (ultType === "shield") {
    ctx.bumpScreenShake?.(9, 0.2);
    ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 28, "#ffffff", 0.12);
    ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 52, "#bfdbfe", 0.34);
    ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 88, "#60a5fa", 0.42);
    ctx.spawnUltimateEffect?.("shieldSummon", ctx.player.x, ctx.player.y, "#93c5fd", 0.95, 88);
    ctx.setUltimateShields?.(elapsed, ctx.player.r + 34);
  } else if (ultType === "burst") {
    ctx.bumpScreenShake?.(13, 0.24);
    ctx.setUltimateSpeedUntil?.(elapsed + ULT_BURST_WAVE_SPAN_SEC);
    ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ULT_BURST_RADIUS * 0.35, "#ffffff", 0.14);
    ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ULT_BURST_RADIUS * 0.72, "#bfdbfe", 0.24);
    ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ULT_BURST_RADIUS * 0.95, "#93c5fd", 0.28);
    ctx.spawnUltimateEffect?.("burstWave", ctx.player.x, ctx.player.y, "#e0f2fe", 0.4, ULT_BURST_RADIUS * 0.6);
    ctx.scheduleBurstWaves?.(elapsed, ULT_BURST_WAVE_COUNT, ULT_BURST_WAVE_SPAN_SEC, ULT_BURST_RADIUS);
    applyUltimateBurstWavePush(ctx.player, ctx.hunterEntities, ULT_BURST_RADIUS);
  } else if (ultType === "timelock") {
    ctx.bumpScreenShake?.(6, 0.18);
    // Timelock is a full 4s defensive window: 2s player lock + 2s enemy lock.
    ctx.grantInvulnerabilityUntil?.(elapsed + 4);
    ctx.setPlayerTimelockUntil?.(elapsed + 2);
    ctx.setTimelockWindow?.(elapsed + 2, elapsed + 4);
    ctx.setTimelockWorldShakeAt?.(elapsed + 2);
    ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 18, "#faf5ff", 0.22);
    ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 36, "#e9d5ff", 0.32);
    ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 58, "#c084fc", 0.4);
    ctx.spawnUltimateEffect?.("timelock", ctx.player.x, ctx.player.y, "#c084fc", 4, 56);
    ctx.spawnUltimateEffect?.("timelockWorld", ctx.player.x, ctx.player.y, "#c4b5fd", 2, ULT_BURST_RADIUS * 1.05, {
      bornAt: elapsed + 2,
      expiresAt: elapsed + 4,
    });
  } else if (ultType === "heal") {
    ctx.bumpScreenShake?.(7, 0.18);
    ctx.setTempHp?.(3, elapsed + 20);
    ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 18, "#ecfdf5", 0.2);
    ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 38, "#bbf7d0", 0.34);
    ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 62, "#34d399", 0.42);
    ctx.spawnUltimateEffect?.("healVitality", ctx.player.x, ctx.player.y, "#34d399", 1.15, 72);
  }

  const spades = ctx.countActiveSuits?.().spades ?? 0;
  if (spades >= SET_BONUS_SUIT_THRESHOLD) {
    ctx.setWorldSlowUntil?.(elapsed + KNIGHT_SPADES_WORLD_SLOW_SEC);
  }
  ctx.inventory.aceUltimateReadyAt = elapsed + ULTIMATE_ABILITY_COOLDOWN_SEC;
  return true;
}
