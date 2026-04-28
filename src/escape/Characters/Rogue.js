import { buildEquippedUltimateHud, getEquippedUltimateType } from "../items/ultimateSlot.js";
import { SET_BONUS_SUIT_THRESHOLD } from "../balance.js";
import { forEachDeckCard } from "../items/inventoryState.js";

const LABEL_Q = "Dash";
const LABEL_W = "Smoke";
const LABEL_E = "Consume";
const LABEL_R = "Ultimate";

export const ROGUE_MAX_HP = 7;

const DASH_COOLDOWN = 2.2;
const BURST_COOLDOWN = 16;
const CONSUME_COOLDOWN = 4.5;
const DASH_RANGE_BASE = 120;
const DASH_RANGE_DIAMONDS = 180;
const DASH_RANGE_DIAMONDS_13 = 220;
const SMOKE_DURATION = 3;

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

function cdRemaining(readyAt, elapsed) {
  return Math.max(0, readyAt - elapsed);
}

function cdValue(readyAt, elapsed, dashAiming) {
  if (dashAiming) return "AIM";
  const left = cdRemaining(readyAt, elapsed);
  if (left <= 0.05) return "READY";
  return `${left.toFixed(1)}s`;
}

function collectSuits(inventory) {
  const suits = { diamonds: 0, hearts: 0, clubs: 0, spades: 0 };
  forEachDeckCard(inventory, (card) => {
    if (!card?.suit) return;
    if (card.suit === "joker") {
      suits.diamonds += 1;
      suits.hearts += 1;
      suits.clubs += 1;
      suits.spades += 1;
    } else if (suits[card.suit] != null) {
      suits[card.suit] += 1;
    }
  });
  return suits;
}

function collectPassive(inventory) {
  const p = {
    cooldownFlat: { dash: 0, burst: 0, decoy: 0 },
    cooldownPct: { dash: 0, burst: 0, decoy: 0 },
    speedMult: 1,
    obstacleTouchMult: 1,
    dodgeChanceWhenDashCd: 0,
    stunOnHitSecs: 0,
    invisOnBurst: 0,
    dashChargesBonus: 0,
    heartsShieldArc: 0,
    maxHpBonus: 0,
    suits: { diamonds: 0, hearts: 0, clubs: 0, spades: 0 },
  };
  forEachDeckCard(inventory, (card) => {
    if (!card?.suit) return;
    if (card.suit === "joker") {
      p.suits.diamonds += 1;
      p.suits.hearts += 1;
      p.suits.clubs += 1;
      p.suits.spades += 1;
    } else if (p.suits[card.suit] != null) {
      p.suits[card.suit] += 1;
    }
    const e = card.effect;
    if (!e) return;
    if (e.kind === "cooldown") p.cooldownFlat[e.target] = (p.cooldownFlat[e.target] ?? 0) + e.value;
    else if (e.kind === "cooldownPct") p.cooldownPct[e.target] = (p.cooldownPct[e.target] ?? 0) + e.value;
    else if (e.kind === "maxHp") p.maxHpBonus += e.value;
    else if (e.kind === "dodge") p.dodgeChanceWhenDashCd += e.value;
    else if (e.kind === "stun") p.stunOnHitSecs += e.value;
    else if (e.kind === "invisBurst") p.invisOnBurst += e.value;
    else if (e.kind === "speed") p.speedMult += e.value;
    else if (e.kind === "terrainBoost") p.obstacleTouchMult += e.value;
    else if (e.kind === "dashCharge") p.dashChargesBonus += e.value;
    else if (e.kind === "frontShield") p.heartsShieldArc += e.arc;
  });
  return p;
}

function effectiveCooldown(passive, abilityId, baseCooldown, minCooldown) {
  const flat = passive.cooldownFlat[abilityId] || 0;
  const pct = clamp(passive.cooldownPct[abilityId] || 0, 0, 0.85);
  return Math.max(minCooldown, Math.max(0, baseCooldown - flat) * (1 - pct));
}

function cooldownIndicator(baseCooldown, effectiveCooldownSec) {
  const reducedBy = Math.max(0, baseCooldown - effectiveCooldownSec);
  if (reducedBy <= 0.05) return "";
  return ` ↓${reducedBy.toFixed(1)}s`;
}

/**
 * @param {ReturnType<import("./rogueWorld.js").createRogueWorld>} rogueWorld
 */
export function createRogue(rogueWorld) {
  let dashReadyAt = 0;
  let burstReadyAt = 0;
  let consumeReadyAt = 0;
  let currentInventory = null;
  let smokeUntil = 0;
  const cdrHud = { dash: "", burst: "", decoy: "" };

  function currentDashRange(inventory) {
    if (inventory?.rogueDiamondRangeBoost) {
      const suits = collectSuits(inventory);
      if (suits.diamonds >= 13) return DASH_RANGE_DIAMONDS_13;
      return DASH_RANGE_DIAMONDS;
    }
    return DASH_RANGE_BASE;
  }

  function tryExecuteDash(ctx) {
    const { player, elapsed, resolvePlayer, circleHitsObstacle, spawnAttackRing, inventory } = ctx;
    const passive = collectPassive(inventory);
    const dashCd = effectiveCooldown(passive, "dash", DASH_COOLDOWN, 0.25);
    if (elapsed < dashReadyAt) return;
    dashReadyAt = elapsed + dashCd;
    const range = currentDashRange(inventory);
    const len = Math.hypot(player.facing.x, player.facing.y) || 1;
    const fx = player.facing.x / len;
    const fy = player.facing.y / len;
    const step = 12;
    let tx = player.x;
    let ty = player.y;
    for (let d = step; d <= range; d += step) {
      const nx = player.x + fx * d;
      const ny = player.y + fy * d;
      if (typeof circleHitsObstacle === "function" && circleHitsObstacle(nx, ny, player.r)) break;
      tx = nx;
      ty = ny;
    }
    const res = resolvePlayer(tx, ty, player.r);
    player.x = res.x;
    player.y = res.y;
    spawnAttackRing?.(player.x, player.y, 26, "rgba(56, 189, 248, 0.35)", 0.1);
    const qualifies =
      rogueWorld.stealthBlocksDamage(elapsed, inventory) ||
      elapsed < (inventory.clubsInvisUntil ?? 0);
    rogueWorld.onDashLanded(inventory, elapsed, qualifies);
  }

  function trySmoke(ctx) {
    const { player, elapsed, inventory, spawnAttackRing } = ctx;
    const passive = collectPassive(inventory);
    const burstCd = effectiveCooldown(passive, "burst", BURST_COOLDOWN, 1);
    if (elapsed < burstReadyAt) return;
    burstReadyAt = elapsed + burstCd;
    const linger = SMOKE_DURATION + passive.invisOnBurst;
    smokeUntil = elapsed + linger;
    rogueWorld.pushSmokeZone(player.x, player.y, elapsed, linger, inventory);
    spawnAttackRing?.(player.x, player.y, 72, "#94a3b8", 0.2);
    spawnAttackRing?.(player.x, player.y, 128, "#cbd5e1", 0.28);
  }

  function tryConsume(ctx) {
    const { elapsed, player, inventory } = ctx;
    const passive = collectPassive(inventory);
    const consumeCd = effectiveCooldown(passive, "decoy", CONSUME_COOLDOWN, 0.4);
    if (elapsed < consumeReadyAt) return;
    consumeReadyAt = elapsed + consumeCd;
    rogueWorld.beginFoodSense(elapsed);
    rogueWorld.spawnPopup(player.x, player.y - player.r - 10, "Sense", "#f59e0b", elapsed, 0.45);
  }

  return {
    id: "rogue",

    getCombatProfile() {
      return { maxHp: ROGUE_MAX_HP, startingHp: ROGUE_MAX_HP };
    },

    getHpHudYOffset() {
      return 7;
    },

    getShellUi() {
      return {
        controlsHintLine:
          "Move: Arrows | Q hold aim / release dash, W Smoke, E Food sense, R Ultimate | Pause: Space | After death: Enter or Choose hero → character select",
      };
    },

    getDecoys() {
      return [];
    },

    getInvulnUntil() {
      return 0;
    },

    getBurstVisualUntil(elapsed) {
      return elapsed < smokeUntil ? smokeUntil : 0;
    },

    tick(ctx) {
      const { inventory, player } = ctx;
      currentInventory = inventory;
      const passive = collectPassive(inventory);
      const dashCd = effectiveCooldown(passive, "dash", DASH_COOLDOWN, 0.25);
      const burstCd = effectiveCooldown(passive, "burst", BURST_COOLDOWN, 1);
      const consumeCd = effectiveCooldown(passive, "decoy", CONSUME_COOLDOWN, 0.4);
      cdrHud.dash = cooldownIndicator(DASH_COOLDOWN, dashCd);
      cdrHud.burst = cooldownIndicator(BURST_COOLDOWN, burstCd);
      cdrHud.decoy = cooldownIndicator(CONSUME_COOLDOWN, consumeCd);

      player.maxHp = Math.max(1, ROGUE_MAX_HP + passive.maxHpBonus);
      player.hp = clamp(player.hp, 0, player.maxHp);
      player.speedBurstMult = 1;
      player.speedPassiveMult = passive.speedMult * (1 + rogueWorld.desperationSpeedMult());
      player.terrainTouchMult = passive.obstacleTouchMult;
      player.dodgeChanceWhenDashCd = passive.dodgeChanceWhenDashCd;
      player.stunOnHitSecs = passive.stunOnHitSecs;
      player.frontShieldArcDeg = passive.heartsShieldArc;
      inventory.heartsRegenPerSec = passive.suits.hearts >= SET_BONUS_SUIT_THRESHOLD ? 0.3 : 0;
      if (!getEquippedUltimateType(inventory)) inventory.aceUltimateReadyAt = 0;
    },

    getAbilityHud(elapsed) {
      const passive = collectPassive(currentInventory ?? { deckByRank: {} });
      const dashCd = effectiveCooldown(passive, "dash", DASH_COOLDOWN, 0.25);
      const burstCd = effectiveCooldown(passive, "burst", BURST_COOLDOWN, 1);
      const consumeCd = effectiveCooldown(passive, "decoy", CONSUME_COOLDOWN, 0.4);
      const ultimateHud = buildEquippedUltimateHud(currentInventory, elapsed, LABEL_R, "#60a5fa");
      const aiming = rogueWorld.getDashAiming();
      return {
        q: {
          label: LABEL_Q,
          value: `${cdrHud.dash ? cdrHud.dash.trim() + " " : ""}${cdValue(dashReadyAt, elapsed, aiming)}`,
          fill: aiming
            ? { remaining: 0, duration: dashCd, color: "#38bdf8" }
            : { remaining: cdRemaining(dashReadyAt, elapsed), duration: dashCd, color: "#38bdf8" },
        },
        w: {
          label: LABEL_W,
          value: `${cdrHud.burst ? cdrHud.burst.trim() + " " : ""}${(() => {
            const left = cdRemaining(burstReadyAt, elapsed);
            if (left <= 0.05) return "READY";
            return `${left.toFixed(1)}s`;
          })()}`,
          fill: { remaining: cdRemaining(burstReadyAt, elapsed), duration: burstCd, color: "#22d3ee" },
        },
        e: {
          label: LABEL_E,
          value: `${cdrHud.decoy ? cdrHud.decoy.trim() + " " : ""}${(() => {
            const left = cdRemaining(consumeReadyAt, elapsed);
            if (left <= 0.05) return "READY";
            return `${left.toFixed(1)}s`;
          })()}`,
          fill: { remaining: cdRemaining(consumeReadyAt, elapsed), duration: consumeCd, color: "#f59e0b" },
        },
        r: { ...ultimateHud },
      };
    },

    onAbilityPress(slot, ctx) {
      if (slot === "r") return;
      if (slot === "q") {
        rogueWorld.setDashAiming(true);
        return;
      }
      if (slot === "w") trySmoke(ctx);
      else if (slot === "e") tryConsume(ctx);
    },

    onAbilityRelease(slot, ctx) {
      if (slot !== "q") return;
      if (!rogueWorld.getDashAiming()) return;
      rogueWorld.setDashAiming(false);
      tryExecuteDash(ctx);
    },

    isDashCoolingDown(elapsed) {
      return elapsed < dashReadyAt;
    },

    getDashPreviewRange() {
      return currentDashRange(currentInventory ?? { rogueDiamondRangeBoost: false });
    },
  };
}
