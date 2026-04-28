import { makeDefaultCardEffect, describeDefaultCardEffect } from "./defaultCardEffects.js";

const ABILITY_LABELS = {
  dash: "Dash",
  burst: "Burst",
  decoy: "Decoy",
  random: "Ultimate",
};

/**
 * Knight uses default diamond/hearts/clubs/spades effect tables with Q/W/E cooldown targets.
 * Override methods on the returned object for hero-specific item behaviour.
 */
export function createKnightItemRules() {
  const ctx = {
    characterId: "knight",
    diamondCooldownAbilityIds: ["dash", "burst", "decoy"],
  };

  return {
    characterId: "knight",

    makeCardEffect(suit, rank) {
      return makeDefaultCardEffect(suit, rank, ctx);
    },

    describeCardEffect(card) {
      return describeDefaultCardEffect(card, {
        abilityLabel: (id) => ABILITY_LABELS[id] ?? id,
      });
    },

    suitSetBonusGoalLabel(suit) {
      if (suit === "hearts") return "continuous health regen";
      if (suit === "diamonds") return "ability empowerment";
      if (suit === "clubs") return "burst: speed + deck stealth (solid terrain)";
      return "after ultimate: world (except you) at 30% speed for 2s";
    },

    suitSetBonusSevenActiveShort(suit) {
      if (suit === "diamonds") return "diamond empowerment active";
      if (suit === "hearts") return "passive HP regeneration";
      if (suit === "clubs") return "burst speed + stealth";
      return "ultimate world slow";
    },

    suitSetBonusTierTwoGoalLabel(suit) {
      if (suit === "hearts") return "death defiance on 30s cooldown (lethal -> 5 HP)";
      if (suit === "diamonds") return "all empowerments active";
      if (suit === "clubs") return "30% smaller hitbox; 1s untargetable after hit";
      if (suit === "spades") return "~2in aura: hostiles slowed ~30%";
      return "";
    },

    suitSetBonusTierTwoActiveShort(suit) {
      if (suit === "hearts") return "death defiance active";
      if (suit === "diamonds") return "max diamond empowerment active";
      if (suit === "clubs") return "smaller hitbox + untargetable";
      if (suit === "spades") return "nearby hostiles slowed in aura";
      return "";
    },
  };
}
