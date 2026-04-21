/**
 * Default suit/rank → effect object and human-readable lines (REFERENCE `makeCardEffect` / `describeCardEffect`).
 * Character-specific tuning should wrap or replace these via `itemRules.makeCardEffect`.
 *
 * @param {string} suit
 * @param {number} rank
 * @param {{ characterId: string, diamondCooldownAbilityIds: string[] }} ctx
 */
export function makeDefaultCardEffect(suit, rank, ctx) {
  const abilityPool = ctx.diamondCooldownAbilityIds?.length
    ? ctx.diamondCooldownAbilityIds
    : ["dash", "burst", "decoy"];

  if (rank === 1) {
    const pool = ["shield", "burst", "timelock", "heal"];
    return { kind: "ultimate", ultType: pool[Math.floor(Math.random() * pool.length)] };
  }
  if (suit === "diamonds") {
    const target = abilityPool[Math.floor(Math.random() * abilityPool.length)];
    return { kind: "cooldown", target, value: 0.1 * rank };
  }
  if (suit === "hearts") {
    if (rank >= 11) return { kind: "frontShield", arc: 28 + rank * 4 };
    if (Math.random() < 0.5) return { kind: "maxHp", value: Math.ceil(rank * 0.5) };
    return { kind: "hitResist", cooldown: Math.max(3, 15 - 0.5 * rank) };
  }
  if (suit === "clubs") {
    const picks = ["dodge", "stun", "invisBurst"];
    const pick = picks[Math.floor(Math.random() * picks.length)];
    if (pick === "dodge") return { kind: "dodge", value: (5 + 0.1 * rank) / 100 };
    if (pick === "stun") return { kind: "stun", value: 0.2 * rank };
    return { kind: "invisBurst", value: 0.1 * rank };
  }
  if (rank >= 11) return { kind: "dashCharge", value: 1 };
  if (Math.random() < 0.5) return { kind: "speed", value: Math.min(0.18, 0.018 * rank) };
  return { kind: "terrainBoost", value: Math.min(0.36, 0.036 * rank) };
}

/**
 * @param {object} card
 * @param {{ abilityLabel: (id: string) => string }} helpers
 */
export function describeDefaultCardEffect(card, helpers) {
  const e = card.effect;
  const abilityLabel = helpers.abilityLabel;
  let base;
  if (e.kind === "ultimate") {
    const names = {
      shield: "Orbiting shields",
      burst: "Earthquake",
      timelock: "Timelock",
      heal: "Vitality (temp HP)",
    };
    base = `Ultimate — ${names[e.ultType] ?? e.ultType}`;
  } else if (e.kind === "cooldown") base = `-${e.value.toFixed(1)}s ${abilityLabel(e.target)} cooldown`;
  else if (e.kind === "cooldownPct") base = `-${Math.round(e.value * 100)}% ${abilityLabel(e.target)} cooldown`;
  else if (e.kind === "maxHp") base = `+${e.value} max HP`;
  else if (e.kind === "hitResist") base = `Block one hit every ${e.cooldown.toFixed(1)}s`;
  else if (e.kind === "frontShield") base = `Front shield arc +${Math.round(e.arc)}deg`;
  else if (e.kind === "dodge") base = `${Math.round(e.value * 1000) / 10}% dodge while dash is cooling down`;
  else if (e.kind === "stun") base = `Stun nearby enemies ${e.value.toFixed(1)}s on hit`;
  else if (e.kind === "invisBurst") base = `Burst grants ${e.value.toFixed(1)}s invisibility`;
  else if (e.kind === "speed") base = `+${Math.round(e.value * 100)}% passive speed`;
  else if (e.kind === "terrainBoost") base = `+${Math.round(e.value * 100)}% terrain-touch speed boost`;
  else if (e.kind === "dashCharge") base = `+${e.value} dash charge`;
  else base = "Passive effect";
  if (card?.suit === "joker") {
    return `${base} (Joker — Contributes towards all set bonuses).`;
  }
  return base;
}
