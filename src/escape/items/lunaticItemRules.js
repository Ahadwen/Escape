import { makeDefaultCardEffect, describeDefaultCardEffect } from "./defaultCardEffects.js";

const ABILITY_LABELS = {
  dash: "Steer L",
  burst: "Sprint",
  decoy: "Steer R",
  random: "Roar",
};

const LUNATIC_CTX = {
  characterId: "lunatic",
  diamondCooldownAbilityIds: ["dash", "burst", "decoy"],
};

/**
 * Lunatic does not collect procedural map cards; rules exist so shared UI / forge paths never fall through to Knight defaults silently.
 */
export function createLunaticItemRules() {
  return {
    characterId: "lunatic",

    makeCardEffect(suit, rank) {
      return makeDefaultCardEffect(suit, rank, LUNATIC_CTX);
    },

    describeCardEffect(card) {
      return describeDefaultCardEffect(card, {
        abilityLabel: (id) => ABILITY_LABELS[id] ?? id,
      });
    },

    suitSetBonusGoalLabel() {
      return "not used — no card deck";
    },

    suitSetBonusSevenActiveShort() {
      return "";
    },

    suitSetBonusTierTwoGoalLabel() {
      return "";
    },

    suitSetBonusTierTwoActiveShort() {
      return "";
    },
  };
}
