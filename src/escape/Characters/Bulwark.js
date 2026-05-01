import { getEquippedUltimateType, buildEquippedUltimateHud } from "../items/ultimateSlot.js";
import { forEachDeckCard } from "../items/inventoryState.js";
import { SET_BONUS_SUIT_THRESHOLD } from "../balance.js";
import {
  BULWARK_MAX_HP,
  BULWARK_FLAG_MAX_HP,
  BULWARK_CHARGE_COOLDOWN_SEC,
  BULWARK_CHARGE_COOLDOWN_NEAR_FLAG_SEC,
  BULWARK_PARRY_COOLDOWN_SEC,
  BULWARK_PARRY_COOLDOWN_NEAR_FLAG_SEC,
  BULWARK_PARRY_DURATION_SEC,
  BULWARK_CHARGE_DISTANCE,
  BULWARK_CHARGE_SPEED,
  BULWARK_PASSIVE_FRONT_SHIELD_DEG,
  BULWARK_CHARGE_FRONT_SHIELD_DEG,
  BULWARK_PARRY_PUSH_RADIUS,
  BULWARK_PARRY_PUSH_DIST,
  BULWARK_FLAG_PICKUP_HEAL_PER_CHARGE,
} from "../balance.js";

const LABEL_Q = "Charge";
const LABEL_W = "Parry";
const LABEL_E = "Flag";
const LABEL_R = "Ultimate";

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

/** @param {ReturnType<typeof import("./bulwarkWorld.js").createBulwarkWorld>} bulwarkWorld */
export function createBulwark(bulwarkWorld) {
  let chargeReadyAt = 0;
  let parryReadyAt = 0;
  let parryUntil = 0;
  let chargeShieldUntil = 0;
  /** True while Q is driving forward motion over multiple frames. */
  let chargeActive = false;
  let chargeDirX = 0;
  let chargeDirY = 0;
  let chargeTraveled = 0;
  /** Hunters carried by the current Q segment — stunned together if the charge stops on terrain. */
  const chargePushedHunterSet = new Set();
  let currentInventory = null;
  /** Updated each tick for HUD (near planted flag shortens Q/W). */
  let nearFlagHud = false;
  const cdrHud = { dash: "", burst: "", decoy: "" };

  function collectPassive(inventory) {
    const p = {
      cooldownFlat: { dash: 0, burst: 0, decoy: 0 },
      cooldownPct: { dash: 0, burst: 0, decoy: 0 },
      speedMult: 1,
      obstacleTouchMult: 1,
      dodgeChanceWhenDashCd: 0,
      stunOnHitSecs: 0,
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
      else if (e.kind === "speed") p.speedMult += e.value;
      else if (e.kind === "terrainBoost") p.obstacleTouchMult += e.value;
      else if (e.kind === "frontShield") p.heartsShieldArc += e.arc;
    });
    return p;
  }

  function effectiveCooldown(passive, abilityId, baseCooldown, minCooldown, inventory) {
    const flat = passive.cooldownFlat[abilityId] || 0;
    const pct = clamp(passive.cooldownPct[abilityId] || 0, 0, 0.85);
    const baseEff = Math.max(0.3, minCooldown, Math.max(0, baseCooldown - flat) * (1 - pct));
    const swQ = abilityId === "dash" ? inventory?.swampBootlegCdDash ?? 0 : 0;
    const swW = abilityId === "burst" ? inventory?.swampBootlegCdBurst ?? 0 : 0;
    return baseEff + swQ + swW;
  }

  function cooldownIndicator(baseCooldown, effectiveCooldownSec) {
    const reducedBy = Math.max(0, baseCooldown - effectiveCooldownSec);
    if (reducedBy <= 0.05) return "";
    return ` ↓${reducedBy.toFixed(1)}s`;
  }

  function chargeBaseCd(player) {
    return bulwarkWorld.isNearPlantedFlag(player) ? BULWARK_CHARGE_COOLDOWN_NEAR_FLAG_SEC : BULWARK_CHARGE_COOLDOWN_SEC;
  }

  function parryBaseCd(player) {
    return bulwarkWorld.isNearPlantedFlag(player) ? BULWARK_PARRY_COOLDOWN_NEAR_FLAG_SEC : BULWARK_PARRY_COOLDOWN_SEC;
  }

  function spawnChargeEndFx(spawnAttackRing, player) {
    spawnAttackRing?.(player.x, player.y, player.r + 22, "rgba(148, 163, 184, 0.45)", 0.18);
    spawnAttackRing?.(player.x, player.y, player.r + 48, "rgba(226, 232, 240, 0.28)", 0.24);
  }

  /**
   * @param {object} ctx
   */
  function tickBulwarkCharge(ctx) {
    if (!chargeActive) return;
    const {
      player,
      elapsed,
      dt,
      resolvePlayer,
      circleHitsObstacle,
      bulwarkChargePushHunters,
      bulwarkChargeApplyTerrainGroupStun,
      spawnAttackRing,
    } = ctx;
    const speed = BULWARK_CHARGE_SPEED;
    const stepCap = speed * Math.max(dt ?? 0.016, 1e-4);
    let remaining = BULWARK_CHARGE_DISTANCE - chargeTraveled;
    if (remaining <= 1e-3) {
      chargeActive = false;
      spawnChargeEndFx(spawnAttackRing, player);
      chargePushedHunterSet.clear();
      return;
    }
    const step = Math.min(remaining, stepCap);
    const fx = chargeDirX;
    const fy = chargeDirY;
    const ox = player.x;
    const oy = player.y;
    const nx = player.x + fx * step;
    const ny = player.y + fy * step;
    if (typeof circleHitsObstacle === "function" && circleHitsObstacle(nx, ny, player.r)) {
      chargeActive = false;
      spawnChargeEndFx(spawnAttackRing, player);
      bulwarkChargeApplyTerrainGroupStun?.(chargePushedHunterSet, elapsed);
      chargePushedHunterSet.clear();
      return;
    }
    player.x = nx;
    player.y = ny;
    const res = resolvePlayer(player.x, player.y, player.r);
    const slip = Math.hypot(res.x - nx, res.y - ny);
    const blocked = slip > 1.2;
    player.x = res.x;
    player.y = res.y;
    bulwarkChargePushHunters?.(ox, oy, player.x, player.y, player.r, elapsed, chargePushedHunterSet);
    const moved = Math.hypot(player.x - ox, player.y - oy);
    chargeTraveled += moved;
    if (blocked || moved < step * 0.22) {
      chargeActive = false;
      spawnChargeEndFx(spawnAttackRing, player);
      bulwarkChargeApplyTerrainGroupStun?.(chargePushedHunterSet, elapsed);
      chargePushedHunterSet.clear();
      return;
    }
    if (chargeTraveled >= BULWARK_CHARGE_DISTANCE - 0.5) {
      chargeActive = false;
      spawnChargeEndFx(spawnAttackRing, player);
      chargePushedHunterSet.clear();
    }
  }

  function tryCharge(ctx) {
    const { player, elapsed, inventory, spawnAttackRing } = ctx;
    const passive = collectPassive(inventory);
    if (chargeActive) return;
    if (elapsed < chargeReadyAt) return;
    const baseCd = chargeBaseCd(player);
    const effCd = effectiveCooldown(passive, "dash", baseCd, 0.35, inventory);
    chargeReadyAt = elapsed + effCd;

    const fl = Math.hypot(player.facing.x, player.facing.y) || 1;
    chargeDirX = player.facing.x / fl;
    chargeDirY = player.facing.y / fl;
    chargeTraveled = 0;
    chargePushedHunterSet.clear();
    chargeActive = true;
    const dur = BULWARK_CHARGE_DISTANCE / BULWARK_CHARGE_SPEED;
    chargeShieldUntil = elapsed + dur + 0.22;

    spawnAttackRing?.(player.x, player.y, player.r + 12, "rgba(148, 163, 184, 0.38)", 0.12);
    spawnAttackRing?.(player.x, player.y, player.r + 28, "rgba(203, 213, 225, 0.22)", 0.16);
  }

  function tryParry(ctx) {
    const { player, elapsed, inventory, spawnAttackRing, bulwarkParryPushHunters, bumpScreenShake } = ctx;
    const passive = collectPassive(inventory);
    if (elapsed < parryReadyAt) return;
    const baseCd = parryBaseCd(player);
    const effCd = effectiveCooldown(passive, "burst", baseCd, 0.35, inventory);
    parryReadyAt = elapsed + effCd;
    parryUntil = elapsed + BULWARK_PARRY_DURATION_SEC;
    bulwarkParryPushHunters?.(player.x, player.y, BULWARK_PARRY_PUSH_RADIUS, BULWARK_PARRY_PUSH_DIST);
    spawnAttackRing?.(player.x, player.y, player.r + 20, "rgba(254, 249, 195, 0.55)", 0.14);
    spawnAttackRing?.(player.x, player.y, player.r + 58, "rgba(250, 204, 21, 0.32)", 0.22);
    spawnAttackRing?.(player.x, player.y, player.r + 92, "rgba(251, 191, 36, 0.2)", 0.28);
    bumpScreenShake?.(6, 0.09);
  }

  function tryFlag(ctx) {
    const { player, elapsed, spawnAttackRing } = ctx;
    if (bulwarkWorld.isFlagCarried()) {
      if (bulwarkWorld.tryPlantFlag(player, elapsed)) {
        spawnAttackRing?.(player.x, player.y, player.r + 30, "rgba(34, 197, 94, 0.35)", 0.22);
      }
    } else {
      const pickupHeal = bulwarkWorld.tryPickupFlag(player);
      if (pickupHeal !== false) {
        if (pickupHeal > 0) {
          player.hp = Math.min(player.maxHp, player.hp + pickupHeal);
        }
        spawnAttackRing?.(player.x, player.y, player.r + 26, "rgba(59, 130, 246, 0.32)", 0.2);
      }
    }
  }

  return {
    id: "bulwark",

    resetRunState() {
      bulwarkWorld.reset();
      chargeReadyAt = 0;
      parryReadyAt = 0;
      parryUntil = 0;
      chargeShieldUntil = 0;
      chargeActive = false;
      chargeTraveled = 0;
      chargeDirX = 0;
      chargeDirY = 0;
      chargePushedHunterSet.clear();
    },

    getCombatProfile() {
      return { maxHp: BULWARK_MAX_HP, startingHp: BULWARK_MAX_HP };
    },

    getShellUi() {
      return {
        controlsHintLine: `Move: Arrows | ${LABEL_Q} (Q), ${LABEL_W} (W), ${LABEL_E} (E) plant/pick flag | ${LABEL_R} (R) | Pause: Space | After death: Enter or Choose hero → character select`,
      };
    },

    getDecoys() {
      return bulwarkWorld.getDecoys();
    },

    getInvulnUntil() {
      return 0;
    },

    isBulwarkCharging() {
      return chargeActive;
    },

    getBulwarkParryUntil() {
      return parryUntil;
    },

    getBulwarkWorld() {
      return bulwarkWorld;
    },

    tick(ctx) {
      const { elapsed, player, inventory } = ctx;
      currentInventory = inventory;
      const passive = collectPassive(inventory);
      nearFlagHud = bulwarkWorld.isNearPlantedFlag(player);
      bulwarkWorld.tick(elapsed, ctx.dt ?? 0);
      tickBulwarkCharge(ctx);

      const qBase = chargeBaseCd(player);
      const wBase = parryBaseCd(player);
      const qCd = effectiveCooldown(passive, "dash", qBase, 0.35, inventory);
      const wCd = effectiveCooldown(passive, "burst", wBase, 0.35, inventory);
      cdrHud.dash = cooldownIndicator(qBase, qCd);
      cdrHud.burst = cooldownIndicator(wBase, wCd);

      player.speedBurstMult = 1;
      player.speedPassiveMult = passive.speedMult;
      player.terrainTouchMult = passive.obstacleTouchMult;
      player.dodgeChanceWhenDashCd = passive.dodgeChanceWhenDashCd;
      player.stunOnHitSecs = passive.stunOnHitSecs;
      const passiveArc = passive.heartsShieldArc + BULWARK_PASSIVE_FRONT_SHIELD_DEG;
      if (elapsed < chargeShieldUntil || chargeActive) {
        player.frontShieldArcDeg = Math.max(passiveArc, BULWARK_CHARGE_FRONT_SHIELD_DEG);
      } else {
        player.frontShieldArcDeg = passiveArc;
      }
      player.maxHp = Math.max(1, BULWARK_MAX_HP + passive.maxHpBonus);
      player.hp = Math.min(player.hp, player.maxHp);
      inventory.heartsRegenPerSec = passive.suits.hearts >= SET_BONUS_SUIT_THRESHOLD ? 0.3 : 0;
      if (!getEquippedUltimateType(inventory)) inventory.aceUltimateReadyAt = 0;
    },

    getAbilityHud(elapsed) {
      const inv = currentInventory ?? { deckByRank: {}, backpackSlots: [] };
      const passive = collectPassive(inv);
      const qBase = nearFlagHud ? BULWARK_CHARGE_COOLDOWN_NEAR_FLAG_SEC : BULWARK_CHARGE_COOLDOWN_SEC;
      const wBase = nearFlagHud ? BULWARK_PARRY_COOLDOWN_NEAR_FLAG_SEC : BULWARK_PARRY_COOLDOWN_SEC;
      const qCd = effectiveCooldown(passive, "dash", qBase, 0.35, inv);
      const wCd = effectiveCooldown(passive, "burst", wBase, 0.35, inv);
      const ultimateHud = buildEquippedUltimateHud(inv, elapsed, LABEL_R, "#94a3b8");
      const carried = bulwarkWorld.isFlagCarried();
      const fd = bulwarkWorld.getPlantedFlagDecoy();
      const charges = bulwarkWorld.getPlantedChargeCount();
      const pickupHp = charges * BULWARK_FLAG_PICKUP_HEAL_PER_CHARGE;
      const eCarriedLine = `Carry ${bulwarkWorld.getCarriedHp()}/${BULWARK_FLAG_MAX_HP} (regen while held) — E plant`;
      const ePlantedValue =
        fd.hp > 0
          ? `${charges}\nPlanted ${fd.hp}/${BULWARK_FLAG_MAX_HP} · pickup +${pickupHp} HP`
          : "Flag down";
      return {
        q: {
          label: LABEL_Q,
          value: `${cdrHud.dash ? cdrHud.dash.trim() + " " : ""}${cdValue(chargeReadyAt, elapsed)}`,
          fill: { remaining: cdRemaining(chargeReadyAt, elapsed), duration: qBase, color: "#94a3b8" },
        },
        w: {
          label: LABEL_W,
          value: `${cdrHud.burst ? cdrHud.burst.trim() + " " : ""}${cdValue(parryReadyAt, elapsed)}`,
          fill: { remaining: cdRemaining(parryReadyAt, elapsed), duration: wBase, color: "#fbbf24" },
        },
        e: carried
          ? { label: LABEL_E, value: eCarriedLine, fill: null }
          : fd.hp > 0
            ? { label: LABEL_E, value: ePlantedValue, fill: null, valueClass: "ability-value--bulwark-e" }
            : { label: LABEL_E, value: ePlantedValue, fill: null },
        r: { ...ultimateHud },
      };
    },

    onAbilityPress(slot, ctx) {
      if (slot === "r") return;
      if (slot === "q") tryCharge(ctx);
      else if (slot === "w") tryParry(ctx);
      else if (slot === "e") tryFlag(ctx);
    },

    isDashCoolingDown(elapsed) {
      return elapsed < chargeReadyAt;
    },
  };
}
