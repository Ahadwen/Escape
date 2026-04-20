import { tryUseEquippedUltimate } from "../items/ultimateSlot.js";
import { forEachDeckCard } from "../items/inventoryState.js";

/** HUD + shell copy (single source for this hero’s player-facing names). */
const LABEL_Q = "Dash";
const LABEL_W = "Burst";
const LABEL_E = "Decoy";
const LABEL_R = "Ultimate";

/** Hit points — REFERENCE knight default `maxHp: 10`. */
export const KNIGHT_MAX_HP = 10;

/** Cooldowns / tuning aligned with REFERENCE knight kit (seconds). */
const DASH_COOLDOWN = 2.2;
const DASH_DISTANCE = 230;
const BURST_COOLDOWN = 5;
const BURST_DURATION = 3;
const BURST_SPEED_MULT = 1.55;
const DECOY_COOLDOWN = 8;
const DECOY_DURATION = 5;
const ULTIMATE_COOLDOWN = 20;

function cdRemaining(readyAt, elapsed) {
  return Math.max(0, readyAt - elapsed);
}

function cdValue(readyAt, elapsed) {
  const left = cdRemaining(readyAt, elapsed);
  if (left <= 0.05) return "READY";
  return `${left.toFixed(1)}s`;
}

/** REFERENCE `passive.invisOnBurst` — seconds of `clubsInvisUntil` extension per Burst (from deck). */
function sumInvisBurstSecondsFromDeck(inventory) {
  let s = 0;
  forEachDeckCard(inventory, (c) => {
    if (c?.effect?.kind === "invisBurst" && typeof c.effect.value === "number") s += c.effect.value;
  });
  return s;
}

export function createKnight() {
  let dashReadyAt = 0;
  let burstReadyAt = 0;
  let decoyReadyAt = 0;
  let ultReadyAt = 0;
  let burstUntil = 0;
  /** @type {{ x: number; y: number; r: number; until: number }[]} */
  let decoys = [];
  let invulnUntil = 0;

  function tryDash(ctx) {
    const { player, elapsed, resolvePlayer, spawnAttackRing, circleHitsObstacle } = ctx;
    if (elapsed < dashReadyAt) return;
    dashReadyAt = elapsed + DASH_COOLDOWN;
    const len = Math.hypot(player.facing.x, player.facing.y) || 1;
    const fx = player.facing.x / len;
    const fy = player.facing.y / len;

    /** REFERENCE `computeDashTarget` (knight): step along the ray; on obstacle hit `continue` (skip), else advance. */
    const step = 12;
    let tx = player.x;
    let ty = player.y;
    let progressed = false;
    if (typeof circleHitsObstacle === "function") {
      for (let d = step; d <= DASH_DISTANCE; d += step) {
        const nx = player.x + fx * d;
        const ny = player.y + fy * d;
        if (circleHitsObstacle(nx, ny, player.r)) continue;
        tx = nx;
        ty = ny;
        progressed = true;
      }
    } else {
      tx = player.x + fx * DASH_DISTANCE;
      ty = player.y + fy * DASH_DISTANCE;
      progressed = true;
    }

    if (progressed) {
      const res = resolvePlayer(tx, ty, player.r);
      player.x = res.x;
      player.y = res.y;
    }

    if (progressed && typeof spawnAttackRing === "function") {
      spawnAttackRing(player.x, player.y, 30, "rgba(56, 189, 248, 0.4)", 0.1);
    }
  }

  function tryBurst(ctx) {
    const { player, elapsed, inventory, spawnAttackRing } = ctx;
    if (elapsed < burstReadyAt) return;
    burstReadyAt = elapsed + BURST_COOLDOWN;
    burstUntil = elapsed + BURST_DURATION;
    const invisSec = sumInvisBurstSecondsFromDeck(inventory);
    if (invisSec > 0) {
      inventory.clubsInvisUntil = Math.max(inventory.clubsInvisUntil ?? 0, elapsed + invisSec);
    }
    if (typeof spawnAttackRing === "function") {
      spawnAttackRing(player.x, player.y, 72, "#94a3b8", 0.2);
      spawnAttackRing(player.x, player.y, 128, "#cbd5e1", 0.28);
    }
  }

  function tryDecoy(ctx) {
    const { player, elapsed, spawnAttackRing } = ctx;
    if (elapsed < decoyReadyAt) return;
    decoyReadyAt = elapsed + DECOY_COOLDOWN;
    decoys.push({
      x: player.x,
      y: player.y,
      r: player.r * 0.85,
      until: elapsed + DECOY_DURATION,
    });
    if (typeof spawnAttackRing === "function") {
      spawnAttackRing(player.x, player.y, player.r + 24, "#818cf8", 0.25);
    }
  }

  function tryUltimate(ctx) {
    const { elapsed } = ctx;
    if (elapsed < ultReadyAt) return;
    ultReadyAt = elapsed + ULTIMATE_COOLDOWN;
    invulnUntil = elapsed + 1.2;
  }

  return {
    id: "knight",

    getCombatProfile() {
      return { maxHp: KNIGHT_MAX_HP, startingHp: KNIGHT_MAX_HP };
    },

    getHpHudYOffset() {
      return 0;
    },

    getShellUi() {
      return {
        controlsHintLine: `Move: Arrows | ${LABEL_Q} (Q), ${LABEL_W} (W), ${LABEL_E} (E), ${LABEL_R} (R — item deck can override R) | Pause: Space | After death: Enter retry`,
      };
    },

    getDecoys() {
      return decoys;
    },

    getInvulnUntil() {
      return invulnUntil;
    },

    /** For REFERENCE-style burst cyan halo (`player.burstUntil`). */
    getBurstVisualUntil(elapsed) {
      return elapsed < burstUntil ? burstUntil : 0;
    },

    tick(ctx) {
      const { elapsed, player } = ctx;
      decoys = decoys.filter((d) => d.until > elapsed);
      player.speedBurstMult = elapsed < burstUntil ? BURST_SPEED_MULT : 1;
    },

    getAbilityHud(elapsed) {
      const ultColor = "#60a5fa";
      return {
        q: {
          label: LABEL_Q,
          value: cdValue(dashReadyAt, elapsed),
          fill: {
            remaining: cdRemaining(dashReadyAt, elapsed),
            duration: DASH_COOLDOWN,
            color: "#38bdf8",
          },
        },
        w: {
          label: LABEL_W,
          value: cdValue(burstReadyAt, elapsed),
          fill: {
            remaining: cdRemaining(burstReadyAt, elapsed),
            duration: BURST_COOLDOWN,
            color: "#22d3ee",
          },
        },
        e: {
          label: LABEL_E,
          value: cdValue(decoyReadyAt, elapsed),
          fill: {
            remaining: cdRemaining(decoyReadyAt, elapsed),
            duration: DECOY_COOLDOWN,
            color: "#a78bfa",
          },
        },
        r: {
          label: LABEL_R,
          value: cdValue(ultReadyAt, elapsed),
          fill: {
            remaining: cdRemaining(ultReadyAt, elapsed),
            duration: ULTIMATE_COOLDOWN,
            color: ultColor,
          },
        },
      };
    },

    onAbilityPress(slot, ctx) {
      if (slot === "r") {
        if (tryUseEquippedUltimate(ctx)) return;
        tryUltimate(ctx);
        return;
      }
      if (slot === "q") tryDash(ctx);
      else if (slot === "w") tryBurst(ctx);
      else if (slot === "e") tryDecoy(ctx);
    },
  };
}
