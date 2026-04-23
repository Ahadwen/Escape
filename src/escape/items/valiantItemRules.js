import { makeDefaultCardEffect, describeDefaultCardEffect } from "./defaultCardEffects.js";

const ABILITY_LABELS = {
  dash: "Surge",
  burst: "Shock field",
  decoy: "Rescue",
  random: "Ultimate",
};

export function createValiantItemRules() {
  const ctx = {
    characterId: "valiant",
    diamondCooldownAbilityIds: ["dash", "burst", "decoy"],
  };

  return {
    characterId: "valiant",

    makeCardEffect(suit, rank) {
      return makeDefaultCardEffect(suit, rank, ctx);
    },

    describeCardEffect(card) {
      return describeDefaultCardEffect(card, {
        abilityLabel: (id) => ABILITY_LABELS[id] ?? id,
      });
    },

    suitSetBonusGoalLabel(suit) {
      if (suit === "hearts") return "regen ticks heal injured rabbits at random";
      if (suit === "diamonds") return "Surge / shock field / Rescue empowerment";
      if (suit === "clubs") return "phase through terrain during Surge (Q)";
      return "+1 shock-field charge (J/Q/K); ultimate still slows the world";
    },

    suitSetBonusSevenActiveShort(suit) {
      if (suit === "diamonds") return "diamond empowerment active";
      if (suit === "hearts") return "hearts regen heals rabbits";
      if (suit === "clubs") return "phase-through during Surge";
      return "+1 shock charge; ultimate world slow";
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
