/**
 * Swamp path: bootleg health crystal — two random offers.
 * Effect and purge are composed independently (separate rolls) except fixed bundles below.
 */

/** @typedef {{ kind: 'nextCrystal'; label: string }} PurgeNextCrystal */
/** @typedef {{ kind: 'damageHits'; n: number; label: string }} PurgeDamageHits */
/** @typedef {{ kind: 'timer'; sec: number; label: string }} PurgeTimerSpec */

/**
 * @param {() => number} rand
 * @returns {PurgeNextCrystal | PurgeDamageHits | PurgeTimerSpec}
 */
export function rollBootlegPurge(rand) {
  const u = rand();
  if (u < 1 / 3) {
    return { kind: "nextCrystal", label: "Curse ends when you touch the next health crystal." };
  }
  if (u < 2 / 3) {
    const n = 1 + Math.floor(rand() * 3);
    return { kind: "damageHits", n, label: `Curse ends after you take damage ${n} more time(s).` };
  }
  const sec = 5 + Math.floor(rand() * 11);
  return { kind: "timer", sec, label: `Curse ends after ${sec} seconds.` };
}

const FLAVOR_LINES = [
  "You hear the sound of distant maniacal laughter, slowly getting closer.",
  "The bog remembers other footsteps — none of them left.",
  "Something under the water counts your heartbeats, one… two…",
];

/**
 * @param {() => number} rand
 */
export function pickBootlegFlavor(rand) {
  return FLAVOR_LINES[Math.floor(rand() * FLAVOR_LINES.length)];
}

/**
 * @typedef {{
 *   kind: 'nextCrystal'
 * } | {
 *   kind: 'damageHits'
 *   left: number
 * } | {
 *   kind: 'timer'
 *   until: number
 * }} ResolvedPurge
 */

/**
 * @typedef {{
 *   id: string
 *   title: string
 *   bodyLines: string[]
 *   heal: number
 *   spellSilenceSec?: number
 *   bloodTax?: { intervalSec: number; ticks: number; damagePerTick: number }
 *   curse?: {
 *     extraDashCd?: number
 *     extraBurstCd?: number
 *     moveSlow?: boolean
 *     colourblind?: boolean
 *     fragile?: boolean
 *     invertMove?: boolean
 *     clearsWithSpellSilence?: boolean
 *     purge: ResolvedPurge
 *   } | null
 * }} BootlegOffer
 */

/**
 * @param {PurgeNextCrystal | PurgeDamageHits | PurgeTimerSpec} spec
 * @param {number} simElapsed
 * @returns {ResolvedPurge}
 */
export function resolvePurgeAtApply(spec, simElapsed) {
  if (spec.kind === "nextCrystal") return { kind: "nextCrystal" };
  if (spec.kind === "damageHits") return { kind: "damageHits", left: spec.n };
  return { kind: "timer", until: simElapsed + spec.sec };
}

/** Effects that use a fresh {@link rollBootlegPurge} each time (independent of each other and of the other column). */
const RANDOM_PURGE_EFFECT_IDS = ["tax_q", "tax_w", "mud_legs", "murk_vision", "brittle", "wrong_footing"];

/** Fixed bundles (no independent random purge roll) share the same table as random-purge effects for column picks. */
const ALL_EFFECT_IDS = ["blood_bargain", "stingy", "silence_feast", "honest_two", ...RANDOM_PURGE_EFFECT_IDS];

/**
 * @param {string} effectId
 * @param {PurgeNextCrystal | PurgeDamageHits | PurgeTimerSpec} purgeSpec
 * @param {number} simElapsed
 * @returns {BootlegOffer}
 */
function buildOfferForEffect(effectId, purgeSpec, simElapsed) {
  switch (effectId) {
    case "blood_bargain":
      return {
        id: "blood_bargain",
        title: "Blood bargain",
        bodyLines: [
          "Restore 5 HP now.",
          "Lose 1 HP every 5 seconds for 20 seconds (four bites). Net +1 if you survive the toll.",
        ],
        heal: 5,
        bloodTax: { intervalSec: 5, ticks: 4, damagePerTick: 1 },
        curse: null,
      };
    case "stingy":
      return {
        id: "stingy",
        title: "Stingy sip",
        bodyLines: ["Only restore 1 HP.", "No curse hangs on after this — the bog barely gives."],
        heal: 1,
        curse: null,
      };
    case "silence_feast": {
      const paired = /** @type {const} */ ({ kind: "timer", sec: 6, label: "" });
      return {
        id: "silence_feast",
        title: "Heavy meal",
        bodyLines: [
          "Restore 3 HP.",
          "You cannot use Q, W, or E for 6 seconds — the same window ends the bargain.",
        ],
        heal: 3,
        spellSilenceSec: 6,
        curse: {
          clearsWithSpellSilence: true,
          purge: resolvePurgeAtApply(paired, simElapsed),
        },
      };
    }
    case "honest_two":
      return {
        id: "honest_two",
        title: "Honest glint",
        bodyLines: ["Restore 2 HP.", "No curse — this one is almost real."],
        heal: 2,
        curse: null,
      };
    case "tax_q":
      return {
        id: "tax_q",
        title: "Q toll",
        bodyLines: ["Restore 2 HP.", `Your Q ability cooldown is +1s (after reductions). ${purgeSpec.label}`],
        heal: 2,
        curse: { extraDashCd: 1, purge: resolvePurgeAtApply(purgeSpec, simElapsed) },
      };
    case "tax_w":
      return {
        id: "tax_w",
        title: "W toll",
        bodyLines: ["Restore 2 HP.", `Your W ability cooldown is +3s (after reductions). ${purgeSpec.label}`],
        heal: 2,
        curse: { extraBurstCd: 3, purge: resolvePurgeAtApply(purgeSpec, simElapsed) },
      };
    case "mud_legs":
      return {
        id: "mud_legs",
        title: "Mud legs",
        bodyLines: ["Restore 2 HP.", `Move speed −15%. ${purgeSpec.label}`],
        heal: 2,
        curse: { moveSlow: true, purge: resolvePurgeAtApply(purgeSpec, simElapsed) },
      };
    case "murk_vision":
      return {
        id: "murk_vision",
        title: "Murk vision",
        bodyLines: [
          "Restore 2 HP.",
          `Colourblind murk: every hunter reads the same grey-green shade. ${purgeSpec.label}`,
        ],
        heal: 2,
        curse: { colourblind: true, purge: resolvePurgeAtApply(purgeSpec, simElapsed) },
      };
    case "brittle":
      return {
        id: "brittle",
        title: "Brittle glass",
        bodyLines: ["Restore 2 HP.", `Fragile: you take +1 damage from each hit. ${purgeSpec.label}`],
        heal: 2,
        curse: { fragile: true, purge: resolvePurgeAtApply(purgeSpec, simElapsed) },
      };
    case "wrong_footing":
      return {
        id: "wrong_footing",
        title: "Wrong footing",
        bodyLines: ["Restore 2 HP.", `Movement controls are inverted. ${purgeSpec.label}`],
        heal: 2,
        curse: { invertMove: true, purge: resolvePurgeAtApply(purgeSpec, simElapsed) },
      };
    default:
      return {
        id: "honest_two",
        title: "Honest glint",
        bodyLines: ["Restore 2 HP.", "No curse — this one is almost real."],
        heal: 2,
        curse: null,
      };
  }
}

/**
 * @param {() => number} rand
 * @returns {string}
 */
function rollEffectId(rand) {
  return ALL_EFFECT_IDS[Math.floor(rand() * ALL_EFFECT_IDS.length)];
}

/**
 * @param {() => number} rand
 * @param {string} excludeId
 * @returns {string}
 */
function rollDistinctEffectId(rand, excludeId) {
  let id = rollEffectId(rand);
  let guard = 0;
  while (id === excludeId && guard++ < 64) {
    id = rollEffectId(rand);
  }
  if (id === excludeId) {
    const idx = ALL_EFFECT_IDS.indexOf(excludeId);
    id = ALL_EFFECT_IDS[(idx + 1) % ALL_EFFECT_IDS.length];
  }
  return id;
}

/**
 * @param {string} effectId
 * @param {() => number} rand
 * @param {number} simElapsed
 */
function composeOffer(effectId, rand, simElapsed) {
  if (RANDOM_PURGE_EFFECT_IDS.includes(effectId)) {
    const purgeSpec = rollBootlegPurge(rand);
    return buildOfferForEffect(effectId, purgeSpec, simElapsed);
  }
  const dummyPurge = { kind: "nextCrystal", label: "" };
  return buildOfferForEffect(effectId, dummyPurge, simElapsed);
}

/**
 * @param {() => number} rand
 * @param {number} simElapsed
 * @returns {{ flavor: string; left: BootlegOffer; right: BootlegOffer }}
 */
export function rollTwoBootlegOffers(rand, simElapsed) {
  const leftId = rollEffectId(rand);
  const rightId = rollDistinctEffectId(rand, leftId);
  const flavor = pickBootlegFlavor(rand);
  return {
    flavor,
    left: composeOffer(leftId, rand, simElapsed),
    right: composeOffer(rightId, rand, simElapsed),
  };
}
