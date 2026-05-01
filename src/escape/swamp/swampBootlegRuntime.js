/**
 * Swamp bootleg crystal — active curses, blood tax, and mirrored cooldown totals on `inventory`.
 */

/** @typedef {import('./swampBootlegCrystalPool.js').BootlegOffer} BootlegOffer */

/**
 * @param {{ purge: import('./swampBootlegCrystalPool.js').ResolvedPurge }} row
 * @param {number} simElapsed
 */
export function swampBootlegPurgeIsActive(row, simElapsed) {
  const p = row.purge;
  if (!p) return false;
  if (p.kind === "nextCrystal") return true;
  if (p.kind === "timer") return simElapsed < p.until;
  if (p.kind === "damageHits") return p.left > 0;
  return false;
}

/**
 * @param {object} inventory
 * @param {number} simElapsed
 */
export function recalcSwampBootlegCdMirror(inventory, simElapsed) {
  let d = 0;
  let b = 0;
  const list = inventory.swampBootlegCurses;
  if (Array.isArray(list)) {
    for (const row of list) {
      if (!swampBootlegPurgeIsActive(row, simElapsed)) continue;
      d += row.extraDashCd || 0;
      b += row.extraBurstCd || 0;
    }
  }
  inventory.swampBootlegCdDash = d;
  inventory.swampBootlegCdBurst = b;
}

/**
 * @param {object} inventory
 * @param {number} simElapsed
 */
export function tickSwampBootlegCurses(inventory, simElapsed) {
  const list = inventory.swampBootlegCurses;
  if (!Array.isArray(list) || list.length === 0) {
    recalcSwampBootlegCdMirror(inventory, simElapsed);
    return;
  }
  for (let i = list.length - 1; i >= 0; i--) {
    const row = list[i];
    const p = row.purge;
    if (!p) {
      list.splice(i, 1);
      continue;
    }
    if (p.kind === "timer" && simElapsed >= p.until) {
      if (row.clearsWithSpellSilence) {
        inventory.swampBootlegSpellSilenceUntil = 0;
      }
      list.splice(i, 1);
      continue;
    }
    if (p.kind === "damageHits" && p.left <= 0) {
      list.splice(i, 1);
      continue;
    }
  }
  if ((inventory.swampBootlegSpellSilenceUntil ?? 0) > 0 && simElapsed >= inventory.swampBootlegSpellSilenceUntil) {
    inventory.swampBootlegSpellSilenceUntil = 0;
  }
  recalcSwampBootlegCdMirror(inventory, simElapsed);
}

/**
 * @param {object} inventory
 */
export function purgeSwampBootlegNextCrystalCurses(inventory) {
  const list = inventory.swampBootlegCurses;
  if (!Array.isArray(list)) return;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].purge?.kind === "nextCrystal") list.splice(i, 1);
  }
}

/**
 * @param {object} inventory
 * @param {number} simElapsed
 */
export function onSwampBootlegPlayerDamageHit(inventory, simElapsed) {
  const list = inventory.swampBootlegCurses;
  if (!Array.isArray(list)) return;
  for (const row of list) {
    const p = row.purge;
    if (!p || p.kind !== "damageHits") continue;
    if (!swampBootlegPurgeIsActive(row, simElapsed)) continue;
    p.left = Math.max(0, (p.left ?? 0) - 1);
  }
}

/**
 * @param {object} inventory
 * @param {number} simElapsed
 */
export function getSwampBootlegMoveSpeedMult(inventory, simElapsed) {
  let m = 1;
  const list = inventory.swampBootlegCurses;
  if (!Array.isArray(list)) return m;
  for (const row of list) {
    if (row.moveSlow && swampBootlegPurgeIsActive(row, simElapsed)) m *= 0.85;
  }
  return m;
}

/**
 * @param {object} inventory
 * @param {number} simElapsed
 */
export function getSwampBootlegColourblind(inventory, simElapsed) {
  const list = inventory.swampBootlegCurses;
  if (!Array.isArray(list)) return false;
  for (const row of list) {
    if (row.colourblind && swampBootlegPurgeIsActive(row, simElapsed)) return true;
  }
  return false;
}

/**
 * @param {object} inventory
 * @param {number} simElapsed
 */
export function getSwampBootlegInvertMove(inventory, simElapsed) {
  const list = inventory.swampBootlegCurses;
  if (!Array.isArray(list)) return false;
  for (const row of list) {
    if (row.invertMove && swampBootlegPurgeIsActive(row, simElapsed)) return true;
  }
  return false;
}

/**
 * @param {object} inventory
 * @param {number} simElapsed
 */
export function getSwampBootlegFragileExtra(inventory, simElapsed) {
  let n = 0;
  const list = inventory.swampBootlegCurses;
  if (!Array.isArray(list)) return 0;
  for (const row of list) {
    if (row.fragile && swampBootlegPurgeIsActive(row, simElapsed)) n += 1;
  }
  return n;
}

/**
 * @param {object} inventory
 * @param {number} simElapsed
 */
export function tickSwampBootlegBloodTax(inventory, simElapsed, damageFn) {
  const t = inventory.swampBootlegBloodTax;
  if (!t || t.ticksLeft <= 0) {
    inventory.swampBootlegBloodTax = null;
    return;
  }
  if (simElapsed < t.nextAt) return;
  damageFn(t.damagePerTick ?? 1);
  t.ticksLeft -= 1;
  if (t.ticksLeft <= 0) {
    inventory.swampBootlegBloodTax = null;
    return;
  }
  t.nextAt = simElapsed + (t.intervalSec ?? 5);
}

/**
 * @param {object} inventory
 * @param {BootlegOffer} offer
 * @param {number} simElapsed
 * @param {() => number} nextUid
 */
export function applySwampBootlegOffer(inventory, offer, simElapsed, nextUid) {
  if (!Array.isArray(inventory.swampBootlegCurses)) inventory.swampBootlegCurses = [];

  if (offer.bloodTax) {
    const { intervalSec, ticks, damagePerTick } = offer.bloodTax;
    inventory.swampBootlegBloodTax = {
      nextAt: simElapsed + intervalSec,
      ticksLeft: ticks,
      intervalSec,
      damagePerTick,
    };
  }

  if (offer.spellSilenceSec) {
    inventory.swampBootlegSpellSilenceUntil = simElapsed + offer.spellSilenceSec;
  }

  const curse = offer.curse;
  if (curse && curse.purge) {
    inventory.swampBootlegCurses.push({
      uid: nextUid(),
      extraDashCd: curse.extraDashCd,
      extraBurstCd: curse.extraBurstCd,
      moveSlow: curse.moveSlow,
      colourblind: curse.colourblind,
      fragile: curse.fragile,
      invertMove: curse.invertMove,
      clearsWithSpellSilence: curse.clearsWithSpellSilence,
      purge: curse.purge,
    });
  }

  recalcSwampBootlegCdMirror(inventory, simElapsed);
}

/**
 * @param {object} inventory
 */
export function resetSwampBootlegState(inventory) {
  inventory.swampBootlegCurses = [];
  inventory.swampBootlegCdDash = 0;
  inventory.swampBootlegCdBurst = 0;
  inventory.swampBootlegSpellSilenceUntil = 0;
  inventory.swampBootlegBloodTax = null;
}

/**
 * @param {object} row
 */
function bootlegCurseEffectLabel(row) {
  if (row.extraBurstCd) return `W +${row.extraBurstCd}s cooldown`;
  if (row.extraDashCd) return `Q +${row.extraDashCd}s cooldown`;
  if (row.moveSlow) return "Move speed −15%";
  if (row.colourblind) return "Murk vision (grey hunters)";
  if (row.fragile) return "Fragile (+1 damage taken)";
  if (row.invertMove) return "Inverted movement";
  if (row.clearsWithSpellSilence) return "Spell lock (Q/W/E)";
  return "Curse";
}

/**
 * @param {import('./swampBootlegCrystalPool.js').ResolvedPurge | undefined} purge
 * @param {number} simElapsed
 */
function bootlegCursePurgeLabel(purge, simElapsed) {
  if (!purge) return "—";
  if (purge.kind === "nextCrystal") return "Ends: next health crystal";
  if (purge.kind === "damageHits") return `Ends: ${purge.left} more hit(s)`;
  const rem = Math.max(0, purge.until - simElapsed);
  if (rem >= 120) return `Ends: ${(rem / 60).toFixed(1)} min`;
  return `Ends: ${rem.toFixed(1)}s`;
}

/**
 * Rows for the swamp bootleg sidebar HUD (effect + purge each).
 * @param {object} inventory
 * @param {number} simElapsed
 * @returns {{ effect: string; purge: string }[]}
 */
export function getSwampBootlegSidebarRows(inventory, simElapsed) {
  /** @type {{ effect: string; purge: string }[]} */
  const rows = [];
  const blood = inventory.swampBootlegBloodTax;
  if (blood && (blood.ticksLeft ?? 0) > 0) {
    const nextIn = Math.max(0, blood.nextAt - simElapsed);
    rows.push({
      effect: "Blood toll",
      purge: `${blood.ticksLeft} drain(s) · −${blood.damagePerTick ?? 1} HP in ${nextIn.toFixed(1)}s`,
    });
  }
  const list = inventory.swampBootlegCurses;
  if (!Array.isArray(list)) return rows;
  for (const row of list) {
    if (!swampBootlegPurgeIsActive(row, simElapsed)) continue;
    rows.push({
      effect: bootlegCurseEffectLabel(row),
      purge: bootlegCursePurgeLabel(row.purge, simElapsed),
    });
  }
  return rows;
}
