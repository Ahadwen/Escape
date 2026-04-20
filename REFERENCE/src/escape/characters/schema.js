/**
 * Shared character-schema contract.
 *
 * A module can override any hook; default behavior stays in `game.js`.
 * Hooks are intentionally narrow so migration can be incremental.
 */
export function makeCharacterSchema(overrides = {}) {
  return {
    id: "unknown",
    controlsHint: "",
    tutorialHtml: "",
    hpModel: {
      /**
       * Return `null` to use default health fraction from player HP.
       * Return a number in [0,1] to override the "missing health" model.
       */
      missingHealth01: null,
      /** Optional damage router: return true if handled. */
      routeDamage: null,
    },
    passives: {
      beforeUpdate: null,
      afterUpdate: null,
      onAfterDashLanding: null,
      speedBonus: null,
      phaseThroughActive: null,
      suppressMovementInput: null,
      onDashKeyDown: null,
      onDashKeyUp: null,
      pickTargetForHunter: null,
      modifyHunterMovement: null,
      canRangedFireAtTarget: null,
      canSniperFireAtTarget: null,
      shouldIgnoreDamage: null,
      drawAimOverlay: null,
      drawPostFxOverlay: null,
      drawHudOverlay: null,
      drawWorldPlayerAid: null,
      drawSurvivalHud: null,
    },
    abilities: {
      onQ: null,
      onW: null,
      onE: null,
      onR: null,
      dashRange: null,
      dashStopOnObstacle: null,
    },
    traits: {
      /** Character uses stealth/hunger/dash-aim/smoke style systems. */
      usesRogueSystems: false,
    },
    itemModifiers: {
      /** Called after card passives recalc. */
      onRecalc: null,
      /** Called before a heal pickup is spawned. */
      modifyHealPickupSpawn: null,
      makeDiamondCardEffect: null,
      allowDiamondEmpowerChoice: null,
    },
    interactableHooks: {
      modifyCardSpawn: null,
      modifyFoodSpawn: null,
    },
    eventOverrides: {
      beforeSurgeUpdate: null,
      afterSurgeUpdate: null,
      beforeArenaUpdate: null,
      afterArenaUpdate: null,
      beforeSafehouseUpdate: null,
      afterSafehouseUpdate: null,
      beforeRouletteUpdate: null,
      afterRouletteUpdate: null,
    },
    ui: {
      setBonusLineForSuitThreshold: null,
      setBonusLineForSuitMax: null,
      suitSetBonusGoalLabel: null,
      diamondsActiveSummary: null,
      suitSetBonusSevenActiveShort: null,
      suitSetBonusTierTwoGoalLabel: null,
      suitSetBonusTierTwoActiveShort: null,
      hpHudLiftPx: null,
    },
    ...overrides,
  };
}

export const DEFAULT_CHARACTER_SCHEMA = makeCharacterSchema({
  id: "default",
});
