import { makeDefaultCardEffect, describeDefaultCardEffect } from "./defaultCardEffects.js";

const ABILITY_LABELS = {
  dash: "Dash",
  burst: "Smoke",
  decoy: "Consume",
  random: "Ultimate",
};

const ROGUE_DIAMOND_COOLDOWN_CTX = {
  characterId: "rogue",
  diamondCooldownAbilityIds: ["dash", "burst", "decoy"],
};

/** REFERENCE `rogueDiamondCooldownPctForRank` (`game.js`). */
export function rogueDiamondCooldownPctForRank(rank) {
  if (rank <= 2) return 0.05;
  if (rank <= 4) return 0.08;
  if (rank === 5) return 0.1;
  if (rank <= 8) return 0.12;
  if (rank <= 10) return 0.15;
  if (rank === 11) return 0.18;
  if (rank === 12) return 0.22;
  return 0.25;
}

/**
 * Rogue: diamond cards roll **percent** cooldown reduction on Q/W/R kit slots (`dash` / `burst` / `decoy` ids).
 * Other suits match the default table; clubs `invisBurst` extends smoke duration in `Rogue.js`.
 */
export function createRogueItemRules() {
  return {
    characterId: "rogue",

    makeCardEffect(suit, rank) {
      if (suit === "diamonds") {
        const abilityPool = ROGUE_DIAMOND_COOLDOWN_CTX.diamondCooldownAbilityIds;
        const target = abilityPool[Math.floor(Math.random() * abilityPool.length)];
        return { kind: "cooldownPct", target, value: rogueDiamondCooldownPctForRank(rank) };
      }
      return makeDefaultCardEffect(suit, rank, ROGUE_DIAMOND_COOLDOWN_CTX);
    },

    describeCardEffect(card) {
      const e = card?.effect;
      if (e?.kind === "invisBurst") {
        const base = `Smoke lingers +${e.value.toFixed(1)}s`;
        if (card?.suit === "joker") return base;
        return `${base} (clubs)`;
      }
      return describeDefaultCardEffect(card, {
        abilityLabel: (id) => ABILITY_LABELS[id] ?? id,
      });
    },

    suitSetBonusGoalLabel(suit) {
      if (suit === "hearts") return "continuous health regen";
      if (suit === "diamonds") return "larger dash & smoke radius";
      if (suit === "clubs") return "phase through terrain in smoke";
      return "stealth refresh on stealth-dash landing";
    },

    suitSetBonusSevenActiveShort(suit) {
      if (suit === "diamonds") return "diamond empowerment active";
      if (suit === "hearts") return "passive HP regeneration";
      if (suit === "clubs") return "phase in smoke";
      return "stealth refresh on dash";
    },

    suitSetBonusTierTwoGoalLabel(suit) {
      if (suit === "hearts") return "death defiance on 30s cooldown (lethal -> 5 HP)";
      if (suit === "diamonds") return "stronger dash, smoke, and consume together";
      if (suit === "clubs") return "30% smaller hitbox; 1s untargetable after hit";
      if (suit === "spades") return "~2in aura: hostiles slowed ~30%";
      return "";
    },

    suitSetBonusTierTwoActiveShort(suit) {
      if (suit === "hearts") return "death defiance active";
      if (suit === "diamonds") return "maximum diamond mobility";
      if (suit === "clubs") return "smaller hitbox + untargetable";
      if (suit === "spades") return "nearby hostiles slowed in aura";
      return "";
    },
  };
}
