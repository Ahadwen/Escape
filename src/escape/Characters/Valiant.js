import { getEquippedUltimateType, buildEquippedUltimateHud } from "../items/ultimateSlot.js";
import { forEachDeckCard } from "../items/inventoryState.js";
import {
  SET_BONUS_SUIT_THRESHOLD,
  SET_BONUS_SUIT_MAX,
  VALIANT_RESCUE_COOLDOWN_SEC,
  VALIANT_SURGE_COOLDOWN_SEC,
  VALIANT_SURGE_MIN_COOLDOWN_SEC,
  VALIANT_SURGE_DURATION_SEC,
  VALIANT_SURGE_SPEED_MULT,
  VALIANT_SURGE_SPEED_MULT_DIAMOND,
  VALIANT_SURGE_DURATION_DIAMOND_BONUS_SEC,
  VALIANT_SHOCK_ABILITY_COOLDOWN_SEC,
  VALIANT_SHOCK_ABILITY_MIN_COOLDOWN_SEC,
} from "../balance.js";

const LABEL_Q = "Surge";
const LABEL_W = "Shock field";
const LABEL_E = "Rescue";
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

function sumInvisBurstSecondsFromDeck(inventory) {
  let s = 0;
  forEachDeckCard(inventory, (c) => {
    if (c?.effect?.kind === "invisBurst" && typeof c.effect.value === "number") s += c.effect.value;
  });
  return s;
}

/**
 * @param {ReturnType<import("./valiantWorld.js").createValiantWorld>} valiantWorld
 */
export function createValiant(valiantWorld) {
  let surgeReadyAt = 0;
  let surgeUntil = 0;
  let burstReadyAt = 0;
  let invulnUntil = 0;
  /** @type {object | null} */
  let currentInventory = null;
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
    inventory.valiantElectricBoxChargeBonus = 0;
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
      else if (e.kind === "dashCharge") {
        if (card.suit === "spades" || card.suit === "joker") inventory.valiantElectricBoxChargeBonus += e.value;
        else p.dashChargesBonus += e.value;
      } else if (e.kind === "frontShield") p.heartsShieldArc += e.arc;
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

  function effectiveRescueCd(passive) {
    return effectiveCooldown(passive, "decoy", VALIANT_RESCUE_COOLDOWN_SEC, 0.5);
  }

  function trySurge(ctx) {
    const { player, elapsed, inventory, spawnAttackRing } = ctx;
    const passive = collectPassive(inventory);
    if (elapsed < surgeReadyAt) return;
    const cd = effectiveCooldown(passive, "dash", VALIANT_SURGE_COOLDOWN_SEC, VALIANT_SURGE_MIN_COOLDOWN_SEC);
    surgeReadyAt = elapsed + cd;
    const diamondSurgeTuning =
      (inventory.diamondEmpower === "valiantSpeed" && passive.suits.diamonds >= SET_BONUS_SUIT_THRESHOLD) ||
      passive.suits.diamonds >= SET_BONUS_SUIT_MAX;
    const durBonus = diamondSurgeTuning ? VALIANT_SURGE_DURATION_DIAMOND_BONUS_SEC : 0;
    surgeUntil = elapsed + VALIANT_SURGE_DURATION_SEC + durBonus;
    const invisSec = passive.invisOnBurst + sumInvisBurstSecondsFromDeck(inventory);
    if (invisSec > 0) {
      inventory.clubsInvisUntil = Math.max(inventory.clubsInvisUntil ?? 0, elapsed + invisSec);
    }
    spawnAttackRing?.(player.x, player.y, 58, "#38bdf8", 0.22);
    spawnAttackRing?.(player.x, player.y, 88, "#7dd3fc", 0.18);
  }

  function tryShock(ctx) {
    const { player, elapsed, inventory, spawnAttackRing } = ctx;
    const passive = collectPassive(inventory);
    const effBurst = effectiveCooldown(passive, "burst", VALIANT_SHOCK_ABILITY_COOLDOWN_SEC, VALIANT_SHOCK_ABILITY_MIN_COOLDOWN_SEC);
    const st = valiantWorld.getBoxChargeState();
    if (st.charges <= 0 && elapsed < burstReadyAt) return;
    if (st.charges <= 0) return;
    if (!valiantWorld.tryConsumeShockCharge(elapsed, effBurst)) return;
    valiantWorld.placeShockField(player, inventory, elapsed, spawnAttackRing);
    const st2 = valiantWorld.getBoxChargeState();
    if (st2.charges <= 0) burstReadyAt = elapsed + effBurst;
  }

  function tryRescue(ctx) {
    const { player, elapsed, inventory, spawnAttackRing } = ctx;
    const passive = collectPassive(inventory);
    valiantWorld.tryRescue(elapsed, inventory, player, effectiveRescueCd(passive), spawnAttackRing);
  }

  return {
    id: "valiant",

    getCombatProfile() {
      return { maxHp: 1, startingHp: 1 };
    },

    getHpHudYOffset() {
      return 0;
    },

    getShellUi() {
      return {
        controlsHintLine: `Move: Arrows | ${LABEL_Q} (Q) Surge · ${LABEL_W} (W) shock · ${LABEL_E} (E) Rescue · ${LABEL_R} (R) | Pause: Space`,
      };
    },

    getDecoys() {
      return [];
    },

    getInvulnUntil() {
      return invulnUntil;
    },

    getBurstVisualUntil(elapsed) {
      return elapsed < surgeUntil ? surgeUntil : 0;
    },

    getValiantSurgeUntil() {
      return surgeUntil;
    },

    getValiantWorld() {
      return valiantWorld;
    },

    applySafehouseFullHeal() {
      valiantWorld.applySafehouseFullHeal();
    },

    onHealCrystalPickup(ctx, healAmt) {
      valiantWorld.healInjuredRabbitFromCrystal(healAmt);
      const refreshFactor = 0.8;
      const now = ctx.elapsed;
      const passive = collectPassive(ctx.inventory);
      const shrink = (readyAt) => {
        const rem = readyAt - now;
        if (rem <= 0) return readyAt;
        return now + rem * refreshFactor;
      };
      surgeReadyAt = shrink(surgeReadyAt);
      burstReadyAt = shrink(burstReadyAt);
      const st = valiantWorld.getBoxChargeState();
      if (st.nextRechargeAt > 0) st.nextRechargeAt = shrink(st.nextRechargeAt);
      valiantWorld.setRescueReadyAt(shrink(valiantWorld.getRescueReadyAt()));
    },

    tick(ctx) {
      const { elapsed, player, inventory, dt } = ctx;
      currentInventory = inventory;
      const passive = collectPassive(inventory);
      inventory.heartsRegenPerSec = passive.suits.hearts >= SET_BONUS_SUIT_THRESHOLD ? 0.3 : 0;

      const bonusSplit = [0, 0, 0];
      for (let k = 0; k < passive.maxHpBonus; k++) bonusSplit[k % 3]++;
      valiantWorld.setSlotBonusMax(bonusSplit);

      valiantWorld.syncBoxMaxCharges(1 + (inventory.valiantElectricBoxChargeBonus ?? 0));
      valiantWorld.tickBoxRecharge(elapsed);

      player.maxHp = 1;
      player.hp = 1;
      player.speedPassiveMult = passive.speedMult;
      player.terrainTouchMult = passive.obstacleTouchMult;
      player.dodgeChanceWhenDashCd = passive.dodgeChanceWhenDashCd;
      player.stunOnHitSecs = passive.stunOnHitSecs;
      player.frontShieldArcDeg = passive.heartsShieldArc;

      const diamondSurgeTuning =
        (inventory.diamondEmpower === "valiantSpeed" && passive.suits.diamonds >= SET_BONUS_SUIT_THRESHOLD) ||
        passive.suits.diamonds >= SET_BONUS_SUIT_MAX;
      const surgeLeg = elapsed < surgeUntil || diamondSurgeTuning;
      player.speedBurstMult = surgeLeg ? (diamondSurgeTuning ? VALIANT_SURGE_SPEED_MULT_DIAMOND : VALIANT_SURGE_SPEED_MULT) : 1;

      const rescueCd = effectiveRescueCd(passive);
      valiantWorld.tickWillDecay(dt ?? 0, { onWillDeath: ctx.onValiantWillDeath });
      valiantWorld.tickExpireEntities(elapsed);
      valiantWorld.tryPickupBunnies(player, elapsed);
      valiantWorld.updateRescueCooldownWhenNoRabbits(elapsed, rescueCd);

      const dashCd = effectiveCooldown(passive, "dash", VALIANT_SURGE_COOLDOWN_SEC, VALIANT_SURGE_MIN_COOLDOWN_SEC);
      const burstCd = effectiveCooldown(passive, "burst", VALIANT_SHOCK_ABILITY_COOLDOWN_SEC, VALIANT_SHOCK_ABILITY_MIN_COOLDOWN_SEC);
      cdrHud.dash = cooldownIndicator(VALIANT_SURGE_COOLDOWN_SEC, dashCd);
      cdrHud.burst = cooldownIndicator(VALIANT_SHOCK_ABILITY_COOLDOWN_SEC, burstCd);
      cdrHud.decoy = cooldownIndicator(VALIANT_RESCUE_COOLDOWN_SEC, rescueCd);
      if (!getEquippedUltimateType(inventory)) inventory.aceUltimateReadyAt = 0;
    },

    getAbilityHud(elapsed) {
      const inv = currentInventory ?? { deckByRank: {}, backpackSlots: [], valiantElectricBoxChargeBonus: 0 };
      const passive = collectPassive(inv);
      const dashCd = effectiveCooldown(passive, "dash", VALIANT_SURGE_COOLDOWN_SEC, VALIANT_SURGE_MIN_COOLDOWN_SEC);
      const burstCd = effectiveCooldown(passive, "burst", VALIANT_SHOCK_ABILITY_COOLDOWN_SEC, VALIANT_SHOCK_ABILITY_MIN_COOLDOWN_SEC);
      const rescueCd = effectiveRescueCd(passive);
      const st = valiantWorld.getBoxChargeState();
      const shockLabel =
        st.charges > 0 ? `${st.charges}/${st.maxCharges}` : cdRemaining(burstReadyAt, elapsed) > 0 ? cdValue(burstReadyAt, elapsed) : "READY";
      const ultimateHud = buildEquippedUltimateHud(currentInventory, elapsed, LABEL_R, "#a5b4fc");
      return {
        q: {
          label: LABEL_Q,
          value: `${cdrHud.dash ? cdrHud.dash.trim() + " " : ""}${cdValue(surgeReadyAt, elapsed)}`,
          fill: { remaining: cdRemaining(surgeReadyAt, elapsed), duration: dashCd, color: "#38bdf8" },
        },
        w: {
          label: LABEL_W,
          value: `${cdrHud.burst ? cdrHud.burst.trim() + " " : ""}${shockLabel}`,
          fill: {
            remaining: st.charges > 0 ? 0 : cdRemaining(burstReadyAt, elapsed),
            duration: burstCd,
            color: "#22d3ee",
          },
        },
        e: {
          label: LABEL_E,
          value: `${cdrHud.decoy ? cdrHud.decoy.trim() + " " : ""}${cdValue(valiantWorld.getRescueReadyAt(), elapsed)}`,
          fill: { remaining: cdRemaining(valiantWorld.getRescueReadyAt(), elapsed), duration: rescueCd, color: "#a78bfa" },
        },
        r: { ...ultimateHud },
      };
    },

    onAbilityPress(slot, ctx) {
      if (slot === "r") return;
      if (slot === "q") trySurge(ctx);
      else if (slot === "w") tryShock(ctx);
      else if (slot === "e") tryRescue(ctx);
    },

    isDashCoolingDown(elapsed) {
      return elapsed < surgeReadyAt;
    },
  };
}
