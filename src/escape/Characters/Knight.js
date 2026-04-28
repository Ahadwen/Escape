import { getEquippedUltimateType, buildEquippedUltimateHud } from "../items/ultimateSlot.js";
import { forEachDeckCard } from "../items/inventoryState.js";
import { SET_BONUS_SUIT_THRESHOLD, SET_BONUS_SUIT_MAX } from "../balance.js";

/** HUD + shell copy (single source for this hero’s player-facing names). */
const LABEL_Q = "Dash";
const LABEL_W = "Burst";
const LABEL_E = "Decoy";
const LABEL_R = "Ultimate";

/** Hit points — REFERENCE knight default `maxHp: 10`. */
export const KNIGHT_MAX_HP = 10;

/** Cooldowns / tuning aligned with REFERENCE knight kit (seconds). */
const DASH_COOLDOWN = 2.2;
const DASH_DISTANCE = 120;
const DASH_DISTANCE_EMPOWERED = 240;
const BURST_COOLDOWN = 5;
const BURST_DURATION = 3;
/** REFERENCE move path uses `wBurstMult = 2` while burst is active (without diamond speed empower). */
const BURST_SPEED_MULT = 2;
const DECOY_COOLDOWN = 8;
const DECOY_DURATION = 5;
const DECOY_MIN_UPTIME_SEC = 0.3;
const DECOY_HITS_AFTER_ARM = 4;
const KNIGHT_DIAMOND_BURST_SPEED_MULT = 2.6;
const KNIGHT_DIAMOND_BURST_DURATION_BONUS_SEC = 1.5;

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

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
  let currentInventory = null;
  let burstUntil = 0;
  /** @type {{ x: number; y: number; r: number; until: number }[]} */
  let decoys = [];
  let invulnUntil = 0;
  let dashChargesMax = 1;
  let dashCharges = 1;
  let dashNextRechargeAt = 0;
  const cdrHud = { dash: "", burst: "", decoy: "" };

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

  function diamondSpeedEmpowerActive(passive, inventory) {
    return passive.suits.diamonds >= SET_BONUS_SUIT_THRESHOLD && inventory.diamondEmpower === "speedPassive";
  }

  function dashDistanceForState(passive, inventory) {
    const omniEmpower = passive.suits.diamonds >= SET_BONUS_SUIT_MAX;
    const dash2xEmpower = inventory?.diamondEmpower === "dash2x";
    return dash2xEmpower || omniEmpower ? DASH_DISTANCE_EMPOWERED : DASH_DISTANCE;
  }

  function tryDash(ctx) {
    const { player, elapsed, resolvePlayer, spawnAttackRing, circleHitsObstacle, inventory } = ctx;
    const passive = collectPassive(inventory);
    if (dashCharges <= 0) return;
    const dashCd = effectiveCooldown(passive, "dash", DASH_COOLDOWN, 0.25);
    dashCharges -= 1;
    // Cooldown starts on first spend and refills the whole dash magazine at once.
    if (dashCharges < dashChargesMax && dashNextRechargeAt <= elapsed) {
      dashNextRechargeAt = elapsed + dashCd;
      dashReadyAt = dashNextRechargeAt;
    }
    const dashDistance = dashDistanceForState(passive, inventory);
    const len = Math.hypot(player.facing.x, player.facing.y) || 1;
    const fx = player.facing.x / len;
    const fy = player.facing.y / len;

    /** REFERENCE `computeDashTarget` (knight): step along the ray; on obstacle hit `continue` (skip), else advance. */
    const step = 12;
    let tx = player.x;
    let ty = player.y;
    let progressed = false;
    if (typeof circleHitsObstacle === "function") {
      for (let d = step; d <= dashDistance; d += step) {
        const nx = player.x + fx * d;
        const ny = player.y + fy * d;
        if (circleHitsObstacle(nx, ny, player.r)) continue;
        tx = nx;
        ty = ny;
        progressed = true;
      }
    } else {
      tx = player.x + fx * dashDistance;
      ty = player.y + fy * dashDistance;
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
    const passive = collectPassive(inventory);
    if (elapsed < burstReadyAt) return;
    burstReadyAt = elapsed + effectiveCooldown(passive, "burst", BURST_COOLDOWN, 0.4);
    const burstDurBonus = diamondSpeedEmpowerActive(passive, inventory) ? KNIGHT_DIAMOND_BURST_DURATION_BONUS_SEC : 0;
    burstUntil = elapsed + BURST_DURATION + burstDurBonus;
    const invisSec = passive.invisOnBurst + sumInvisBurstSecondsFromDeck(inventory);
    if (invisSec > 0) {
      const invisUntil = Math.min(burstUntil, elapsed + invisSec);
      inventory.clubsInvisUntil = Math.max(inventory.clubsInvisUntil ?? 0, invisUntil);
    }
    if (typeof spawnAttackRing === "function") {
      spawnAttackRing(player.x, player.y, 72, "#94a3b8", 0.2);
      spawnAttackRing(player.x, player.y, 128, "#cbd5e1", 0.28);
    }
  }

  function tryDecoy(ctx) {
    const { player, elapsed, spawnAttackRing, inventory } = ctx;
    const passive = collectPassive(inventory);
    if (elapsed < decoyReadyAt) return;
    decoyReadyAt = elapsed + effectiveCooldown(passive, "decoy", DECOY_COOLDOWN, 0.4);
    decoys.push({
      x: player.x,
      y: player.y,
      r: player.r * 0.85,
      until: elapsed + DECOY_DURATION,
      invulnerableUntil: elapsed + DECOY_MIN_UPTIME_SEC,
      hp: DECOY_HITS_AFTER_ARM,
    });
    if (typeof spawnAttackRing === "function") {
      spawnAttackRing(player.x, player.y, player.r + 24, "#818cf8", 0.25);
    }
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
      const { elapsed, player, inventory } = ctx;
      currentInventory = inventory;
      const passive = collectPassive(inventory);
      const dashCd = effectiveCooldown(passive, "dash", DASH_COOLDOWN, 0.25);
      const burstCd = effectiveCooldown(passive, "burst", BURST_COOLDOWN, 0.4);
      const decoyCd = effectiveCooldown(passive, "decoy", DECOY_COOLDOWN, 0.4);
      dashChargesMax = 1 + passive.dashChargesBonus;
      dashCharges = Math.min(dashCharges, dashChargesMax);
      if (dashCharges >= dashChargesMax) {
        dashNextRechargeAt = 0;
        dashReadyAt = 0;
      } else if (dashNextRechargeAt <= 0) {
        dashNextRechargeAt = elapsed + dashCd;
        dashReadyAt = dashNextRechargeAt;
      }
      if (dashCharges < dashChargesMax && dashNextRechargeAt > 0 && elapsed >= dashNextRechargeAt) {
        dashCharges = dashChargesMax;
        dashNextRechargeAt = 0;
        dashReadyAt = dashNextRechargeAt;
      }
      decoys = decoys.filter((d) => d.until > elapsed);
      const burstLeg = elapsed < burstUntil || diamondSpeedEmpowerActive(passive, inventory);
      player.speedBurstMult = burstLeg ? (diamondSpeedEmpowerActive(passive, inventory) ? KNIGHT_DIAMOND_BURST_SPEED_MULT : BURST_SPEED_MULT) : 1;
      player.speedPassiveMult = passive.speedMult;
      player.terrainTouchMult = passive.obstacleTouchMult;
      player.dodgeChanceWhenDashCd = passive.dodgeChanceWhenDashCd;
      player.stunOnHitSecs = passive.stunOnHitSecs;
      player.frontShieldArcDeg = passive.heartsShieldArc;
      player.maxHp = Math.max(1, KNIGHT_MAX_HP + passive.maxHpBonus);
      player.hp = Math.min(player.hp, player.maxHp);
      inventory.heartsRegenPerSec = passive.suits.hearts >= SET_BONUS_SUIT_THRESHOLD ? 0.3 : 0;
      cdrHud.dash = cooldownIndicator(DASH_COOLDOWN, dashCd);
      cdrHud.burst = cooldownIndicator(BURST_COOLDOWN, burstCd);
      cdrHud.decoy = cooldownIndicator(DECOY_COOLDOWN, decoyCd);
      if (!getEquippedUltimateType(inventory)) inventory.aceUltimateReadyAt = 0;
    },

    getAbilityHud(elapsed) {
      const dashChargesText = `${dashCharges}/${dashChargesMax}`;
      const dashCdText = cdValue(dashReadyAt, elapsed);
      const ultimateHud = buildEquippedUltimateHud(currentInventory, elapsed, LABEL_R, "#60a5fa");
      return {
        q: {
          label: LABEL_Q,
          value: dashCdText === "READY" ? `${dashChargesText}${cdrHud.dash} READY` : `${dashChargesText}${cdrHud.dash} ${dashCdText}`,
          fill: {
            remaining: cdRemaining(dashReadyAt, elapsed),
            duration: DASH_COOLDOWN,
            color: "#38bdf8",
          },
        },
        w: {
          label: LABEL_W,
          value: `${cdrHud.burst ? cdrHud.burst.trim() + " " : ""}${cdValue(burstReadyAt, elapsed)}`,
          fill: {
            remaining: cdRemaining(burstReadyAt, elapsed),
            duration: BURST_COOLDOWN,
            color: "#22d3ee",
          },
        },
        e: {
          label: LABEL_E,
          value: `${cdrHud.decoy ? cdrHud.decoy.trim() + " " : ""}${cdValue(decoyReadyAt, elapsed)}`,
          fill: {
            remaining: cdRemaining(decoyReadyAt, elapsed),
            duration: DECOY_COOLDOWN,
            color: "#a78bfa",
          },
        },
        r: {
          ...ultimateHud,
        },
      };
    },

    onAbilityPress(slot, ctx) {
      if (slot === "r") return;
      if (slot === "q") tryDash(ctx);
      else if (slot === "w") tryBurst(ctx);
      else if (slot === "e") tryDecoy(ctx);
    },
    isDashCoolingDown(elapsed) {
      return elapsed < dashReadyAt || dashCharges < dashChargesMax;
    },
  };
}
