/**
 * Rogue-only world simulation: hunger, food pickups, smoke zones, stealth LOS state,
 * food sense, and hunter pick-target helpers (REFERENCE `game.js` / `rogue/module.js`).
 */
import {
  ROGUE_STEALTH_AFTER_LOS_BREAK,
  ROGUE_STEALTH_OPEN_GRACE,
  ROGUE_FOOD_HUNGER_RESTORE,
  ROGUE_FOOD_LIFETIME,
  ROGUE_FOOD_SENSE_DURATION,
  ROGUE_FOOD_ARROW_CLOSE_PLATEAU,
  ROGUE_FOOD_ARROW_FAR_LEN,
  ROGUE_DESPERATION_SPEED_MAX,
  ROGUE_HUNGER_MAX,
  ROGUE_FIRST_FOOD_AT_SEC,
  SET_BONUS_SUIT_THRESHOLD,
  SET_BONUS_SUIT_MAX,
} from "../balance.js";
import { forEachDeckCard } from "../items/inventoryState.js";

const TAU = Math.PI * 2;

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

function distSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function countSuitInDeck(inventory, suit) {
  let n = 0;
  forEachDeckCard(inventory, (card) => {
    if (!card?.suit) return;
    if (card.suit === "joker") n += 1;
    else if (card.suit === suit) n += 1;
  });
  return n;
}

function syncRogueDiamondRangeBoost(inventory) {
  let diamonds = 0;
  forEachDeckCard(inventory, (card) => {
    if (!card?.suit) return;
    if (card.suit === "joker" || card.suit === "diamonds") diamonds += 1;
  });
  inventory.rogueDiamondRangeBoost = diamonds >= SET_BONUS_SUIT_THRESHOLD;
}

/**
 * @typedef {object} RogueWorldTickDeps
 * @property {number} simDt
 * @property {number} simElapsed
 * @property {{ x: number; y: number; r: number }} player
 * @property {object} inventory
 * @property {{ x: number; y: number; w: number; h: number }[]} obstacles
 * @property {boolean} moving
 * @property {boolean} touchedObstacle
 * @property {(a: number, b: number) => number} rand
 * @property {() => { x: number; y: number } | null} randomFoodPoint
 * @property {(x: number, y: number, text: string, color: string) => void} [spawnWorldPopup]
 */

export function createRogueWorld() {
  /** @type {{ x: number; y: number; r: number; bornAt: number; expiresAt: number }[]} */
  const smokeZones = [];
  /** @type {{ x: number; y: number; r: number; bornAt: number; expiresAt: number; nutrition: number }[]} */
  const foods = [];
  /** @type {{ x: number; y: number; text: string; color: string; bornAt: number; expiresAt: number }[]} */
  const popups = [];

  let hunger = ROGUE_HUNGER_MAX;
  let hungerMax = ROGUE_HUNGER_MAX;
  let lastSeenAt = 0;
  let alertUntil = 0;
  let stealthActive = false;
  let stealthOpenUntil = 0;
  let foodSenseUntil = 0;
  let nextFoodAt = 0;
  let nextHungryPopupAt = 0;
  let hasEnemyLos = false;
  let dashAiming = false;
  let lastKnownPlayerPos = { x: 0, y: 0 };

  function reset(simElapsed, player) {
    smokeZones.length = 0;
    foods.length = 0;
    popups.length = 0;
    hunger = ROGUE_HUNGER_MAX;
    hungerMax = ROGUE_HUNGER_MAX;
    lastSeenAt = simElapsed;
    alertUntil = 0;
    stealthActive = false;
    stealthOpenUntil = 0;
    foodSenseUntil = 0;
    nextFoodAt = simElapsed + ROGUE_FIRST_FOOD_AT_SEC;
    nextHungryPopupAt = 0;
    hasEnemyLos = false;
    dashAiming = false;
    lastKnownPlayerPos = player
      ? { x: player.x, y: player.y }
      : { x: 0, y: 0 };
  }

  function spawnPopup(px, py, text, color, elapsed, life = 0.65) {
    popups.push({
      x: px,
      y: py - 18,
      text,
      color,
      bornAt: elapsed,
      expiresAt: elapsed + life,
    });
  }

  function prunePopups(elapsed) {
    for (let i = popups.length - 1; i >= 0; i--) {
      if (elapsed >= popups[i].expiresAt) popups.splice(i, 1);
    }
  }

  function isPointNearTerrain(px, py, margin, rects) {
    for (const o of rects) {
      const cx = clamp(px, o.x, o.x + o.w);
      const cy = clamp(py, o.y, o.y + o.h);
      if (Math.hypot(px - cx, py - cy) <= margin) return true;
    }
    return false;
  }

  function playerInsideSmoke(px, py, elapsed) {
    for (const z of smokeZones) {
      if (elapsed >= z.expiresAt) continue;
      const dx = px - z.x;
      const dy = py - z.y;
      if (dx * dx + dy * dy <= z.r * z.r) return true;
    }
    return false;
  }

  function smokeRadiusForInventory(inventory) {
    const d = countSuitInDeck(inventory, "diamonds");
    if (d >= SET_BONUS_SUIT_MAX) return 300;
    if (inventory.rogueDiamondRangeBoost) return 260;
    return 180;
  }

  function clubsPhaseThroughObstacles(inventory, px, py, elapsed) {
    if (countSuitInDeck(inventory, "clubs") < SET_BONUS_SUIT_THRESHOLD) return false;
    return playerInsideSmoke(px, py, elapsed);
  }

  function updateEnemyLos(hunterEntities, elapsed, player, hasLineOfSight) {
    if (!hunterEntities?.hunters) {
      hasEnemyLos = false;
      return;
    }
    let seen = false;
    for (const h of hunterEntities.hunters) {
      if (h.type === "spawner" || h.type === "airSpawner" || (h.type === "cryptSpawner" && h.cryptDisguised))
        continue;
      if (elapsed < (h.stunnedUntil || 0)) continue;
      if (hasLineOfSight(h, player)) {
        seen = true;
        break;
      }
    }
    hasEnemyLos = seen;
    if (seen) lastSeenAt = elapsed;
  }

  /**
   * @param {RogueWorldTickDeps} deps
   * @param {(reason: "hunger") => void} onHungerDeath
   */
  function tickNeeds(deps, onHungerDeath) {
    const {
      simDt,
      simElapsed,
      player,
      inventory,
      obstacles,
      moving: _moving,
      touchedObstacle,
      rand,
      randomFoodPoint,
      spawnWorldPopup,
    } = deps;
    void _moving;
    syncRogueDiamondRangeBoost(inventory);

    for (let i = smokeZones.length - 1; i >= 0; i--) {
      if (simElapsed >= smokeZones[i].expiresAt) smokeZones.splice(i, 1);
    }

    hunger = Math.max(0, hunger - simDt);
    if (hunger <= 0) {
      onHungerDeath("hunger");
      return;
    }

    while (simElapsed >= nextFoodAt) {
      const pt = randomFoodPoint();
      if (pt) {
        foods.push({
          x: pt.x,
          y: pt.y,
          r: 13,
          bornAt: simElapsed,
          expiresAt: simElapsed + ROGUE_FOOD_LIFETIME,
          nutrition: ROGUE_FOOD_HUNGER_RESTORE,
        });
      }
      nextFoodAt += rand(4.8, 7.8);
    }

    const inSmoke = playerInsideSmoke(player.x, player.y, simElapsed);
    const huggingTerrain =
      touchedObstacle ||
      isPointNearTerrain(player.x, player.y, 20, obstacles) ||
      isPointNearTerrain(player.x, player.y, 56, obstacles);

    const canEnterStealth = simElapsed - lastSeenAt >= ROGUE_STEALTH_AFTER_LOS_BREAK || inSmoke;
    if (canEnterStealth && (huggingTerrain || inSmoke)) {
      stealthActive = true;
      stealthOpenUntil = simElapsed + ROGUE_STEALTH_OPEN_GRACE;
    }
    if (stealthActive) {
      if (huggingTerrain || inSmoke) {
        stealthOpenUntil = simElapsed + ROGUE_STEALTH_OPEN_GRACE;
      } else if (simElapsed >= stealthOpenUntil) {
        stealthActive = false;
      }
    }

    const hungryRatio = 1 - clamp(hunger / Math.max(1e-3, hungerMax), 0, 1);
    if (hungryRatio >= 0.25 && simElapsed >= nextHungryPopupAt) {
      spawnWorldPopup?.(player.x, player.y - player.r - 12, "I'm hungry", "#67e8f9");
      const cadence = hungryRatio >= 0.7 ? 3.2 : hungryRatio >= 0.45 ? 5.2 : 7.0;
      nextHungryPopupAt = simElapsed + cadence;
    }

    for (let i = foods.length - 1; i >= 0; i--) {
      const f = foods[i];
      if (simElapsed >= f.expiresAt) {
        foods.splice(i, 1);
        continue;
      }
      const rr = f.r + player.r;
      if (distSq(f, player) <= rr * rr) {
        hunger = Math.min(hungerMax, Math.max(hunger, f.nutrition ?? ROGUE_FOOD_HUNGER_RESTORE));
        spawnWorldPopup?.(player.x, player.y - player.r - 8, "Fed", "#fcd34d");
        foods.splice(i, 1);
      }
    }

    prunePopups(simElapsed);
  }

  function pushSmokeZone(x, y, elapsed, durationSec, inventory) {
    const r = smokeRadiusForInventory(inventory);
    smokeZones.push({
      x,
      y,
      r,
      bornAt: elapsed,
      expiresAt: elapsed + durationSec,
    });
  }

  function beginFoodSense(elapsed) {
    foodSenseUntil = Math.max(foodSenseUntil, elapsed + ROGUE_FOOD_SENSE_DURATION);
  }

  /**
   * REFERENCE `pickTargetForHunter` rogue branch.
   * @returns {object} target `{x,y}` or `player` ref.
   */
  function pickRogueHunterTarget(hunter, player, inventory, nearestDecoy, hasLOS, fallback, simElapsed) {
    if (simElapsed < (inventory.spadesLandingStealthUntil ?? 0)) return nearestDecoy(hunter) || fallback;
    if (stealthActive) return nearestDecoy(hunter) || fallback;
    if (hasLOS(hunter, player)) {
      lastSeenAt = simElapsed;
      alertUntil = Math.max(alertUntil, simElapsed + 1.4);
      lastKnownPlayerPos = { x: player.x, y: player.y };
      return player;
    }
    return lastKnownPlayerPos && Number.isFinite(lastKnownPlayerPos.x) ? lastKnownPlayerPos : fallback;
  }

  function onDashLanded(inventory, elapsed, qualifiesForSpadesDashBonus) {
    const spades = countSuitInDeck(inventory, "spades");
    if (spades < SET_BONUS_SUIT_THRESHOLD || !qualifiesForSpadesDashBonus) return;
    stealthActive = true;
    stealthOpenUntil = Math.max(stealthOpenUntil, elapsed + ROGUE_STEALTH_OPEN_GRACE + 0.12);
    inventory.spadesLandingStealthUntil = Math.max(
      inventory.spadesLandingStealthUntil ?? 0,
      stealthOpenUntil,
    );
  }

  function desperationSpeedMult() {
    const hungerLeftRatio = clamp(hunger / Math.max(1e-3, hungerMax), 0, 1);
    return (1 - hungerLeftRatio) * ROGUE_DESPERATION_SPEED_MAX;
  }

  function stealthBlocksDamage(elapsed, inventory) {
    if (stealthActive) return true;
    if (elapsed < (inventory.spadesLandingStealthUntil ?? 0)) return true;
    return false;
  }

  function drawSmokeAndFood(ctx, elapsed) {
    for (const z of smokeZones) {
      if (elapsed >= z.expiresAt) continue;
      const u = clamp((z.expiresAt - elapsed) / Math.max(0.001, z.expiresAt - z.bornAt), 0, 1);
      const g = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
      g.addColorStop(0, `rgba(148, 163, 184, ${0.22 * u})`);
      g.addColorStop(0.55, `rgba(100, 116, 139, ${0.12 * u})`);
      g.addColorStop(1, `rgba(71, 85, 105, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.r, 0, TAU);
      ctx.fill();
    }
    for (const f of foods) {
      if (elapsed >= f.expiresAt) continue;
      const pulse = 0.85 + 0.15 * Math.sin(elapsed * 9 + f.x * 0.01);
      ctx.fillStyle = `rgba(251, 191, 36, ${0.55 * pulse})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(254, 243, 199, 0.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  function drawFoodSenseArrows(ctx, elapsed, player) {
    if (elapsed >= foodSenseUntil) return;
    for (const f of foods) {
      if (elapsed >= f.expiresAt) continue;
      const lifeTotal = Math.max(0.001, f.expiresAt - f.bornAt);
      const freshness = clamp((f.expiresAt - elapsed) / lifeTotal, 0, 1);
      const dx = f.x - player.x;
      const dy = f.y - player.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const close =
        len <= ROGUE_FOOD_ARROW_CLOSE_PLATEAU
          ? 1
          : clamp(
              1 - (len - ROGUE_FOOD_ARROW_CLOSE_PLATEAU) / Math.max(0.001, ROGUE_FOOD_ARROW_FAR_LEN - ROGUE_FOOD_ARROW_CLOSE_PLATEAU),
              0,
              1,
            );
      const reach = 44 + close * 22;
      const px = player.x;
      const py = player.y;
      const sideX = -uy;
      const sideY = ux;
      const s = 5.5 + close * 6.5;
      const freshAlpha = 0.54 + 0.4 * freshness;
      const a = Math.min(0.94, Math.max(0.48, freshAlpha));
      const tipX = px + ux * reach;
      const tipY = py + uy * reach;
      ctx.fillStyle = `rgba(252, 211, 77, ${a})`;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - ux * (s * 1.8) + sideX * s, tipY - uy * (s * 1.8) + sideY * s);
      ctx.lineTo(tipX - ux * (s * 1.8) - sideX * s, tipY - uy * (s * 1.8) - sideY * s);
      ctx.closePath();
      ctx.fill();
    }
  }

  /** REFERENCE `drawRogueSurvivalHud` — arcs around the hero for stealth open-grace and hunger. */
  function drawSurvivalHudArcs(ctx, player, elapsed) {
    const arcR = player.r + 12;
    const trackStroke = "rgba(148, 163, 184, 0.42)";
    const trackStrokeWide = "rgba(30, 41, 59, 0.55)";
    ctx.save();
    ctx.lineCap = "round";
    if (stealthActive) {
      const graceRem = stealthOpenUntil - elapsed;
      const graceRatio = clamp(graceRem / Math.max(1e-3, ROGUE_STEALTH_OPEN_GRACE), 0, 1);
      if (graceRatio > 0.02) {
        const sCx = player.x;
        const sCy = player.y;
        const sLeft = -Math.PI * 0.8;
        const sRight = -Math.PI * 0.2;
        const stealthFill = graceRatio > 0.35 ? "#6ee7b7" : "#34d399";
        ctx.strokeStyle = trackStrokeWide;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sCx, sCy, arcR, sLeft, sRight);
        ctx.stroke();
        ctx.strokeStyle = trackStroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sCx, sCy, arcR, sLeft, sRight);
        ctx.stroke();
        ctx.strokeStyle = stealthFill;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const stealthEnd = sLeft + (sRight - sLeft) * graceRatio;
        ctx.arc(sCx, sCy, arcR, stealthEnd, sLeft, true);
        ctx.stroke();
      }
    }
    const ratio = clamp(hunger / Math.max(1e-3, hungerMax), 0, 1);
    const hungerFill = ratio > 0.35 ? "#f59e0b" : "#ef4444";
    const hCx = player.x;
    const hCy = player.y;
    const hLeft = Math.PI * 0.2;
    const hRight = Math.PI * 0.8;
    ctx.strokeStyle = trackStrokeWide;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(hCx, hCy, arcR, hLeft, hRight);
    ctx.stroke();
    ctx.strokeStyle = trackStroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hCx, hCy, arcR, hLeft, hRight);
    ctx.stroke();
    if (ratio > 1e-3) {
      ctx.strokeStyle = hungerFill;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const hungerStart = hRight - (hRight - hLeft) * ratio;
      ctx.arc(hCx, hCy, arcR, hungerStart, hRight);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawDashAim(ctx, player, range) {
    if (!dashAiming) return;
    const fl = Math.hypot(player.facing.x, player.facing.y) || 1;
    const fx = player.facing.x / fl;
    const fy = player.facing.y / fl;
    const x2 = player.x + fx * range;
    const y2 = player.y + fy * range;
    ctx.strokeStyle = "rgba(125, 211, 252, 0.9)";
    ctx.lineWidth = 2.4;
    ctx.setLineDash([9, 7]);
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(186, 230, 253, 0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x2, y2, 7, 0, TAU);
    ctx.stroke();
  }

  function drawWorldPopups(ctx, elapsed) {
    ctx.save();
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const p of popups) {
      if (elapsed >= p.expiresAt) continue;
      const u = clamp((p.expiresAt - elapsed) / Math.max(0.001, p.expiresAt - p.bornAt), 0, 1);
      ctx.globalAlpha = 0.35 + 0.65 * u;
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.restore();
  }

  function drawScreenHud(ctx, elapsed, viewW, viewH) {
    const ratio = clamp(hunger / Math.max(1e-3, hungerMax), 0, 1);
    const x = 14;
    const y = 114;
    const w = 160;
    const h = 10;
    ctx.save();
    ctx.fillStyle = "rgba(51, 65, 85, 0.9)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = ratio > 0.35 ? "#f59e0b" : "#ef4444";
    ctx.fillRect(x, y, w * ratio, h);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
    ctx.fillStyle = "#fde68a";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`Fed: ${hunger.toFixed(1)}s`, x, y + 14);
    if (stealthActive) {
      ctx.fillStyle = "#bbf7d0";
      ctx.fillText("Stealthed", x, y + 31);
    } else if (elapsed <= alertUntil) {
      ctx.fillStyle = "#fca5a5";
      ctx.fillText("Alerted", x, y + 31);
    } else {
      ctx.fillStyle = "#93c5fd";
      ctx.fillText("Seeking", x, y + 31);
    }

    const hungerMissing = 1 - ratio;
    if (hungerMissing > 0) {
      ctx.fillStyle = `rgba(20, 184, 166, ${0.04 + hungerMissing * 0.18})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }
    if (!hasEnemyLos) {
      ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.fillStyle = "#d1fae5";
      ctx.font = "bold 14px Arial";
      ctx.fillText("LoS broken", 14, 130);
    }
    ctx.restore();
  }

  function drawStealthAid(ctx, player, obstacles) {
    if (!stealthActive) return;
    const safeRadius = 56;
    ctx.strokeStyle = "rgba(16, 185, 129, 0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, safeRadius, 0, TAU);
    ctx.stroke();
    let bestD = Infinity;
    let bestPt = null;
    for (const o of obstacles) {
      const cx = clamp(player.x, o.x, o.x + o.w);
      const cy = clamp(player.y, o.y, o.y + o.h);
      const d = Math.hypot(player.x - cx, player.y - cy);
      if (d < bestD) {
        bestD = d;
        bestPt = { x: cx, y: cy };
      }
    }
    const inSafe = bestD <= safeRadius;
    if (bestPt && inSafe) {
      ctx.strokeStyle = "rgba(110, 231, 183, 0.72)";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(bestPt.x, bestPt.y);
      ctx.stroke();
      ctx.fillStyle = "rgba(167, 243, 208, 0.95)";
      ctx.beginPath();
      ctx.arc(bestPt.x, bestPt.y, 3.4, 0, TAU);
      ctx.fill();
    }
  }

  return {
    reset,
    get smokeZones() {
      return smokeZones;
    },
    get foods() {
      return foods;
    },
    getHunger() {
      return hunger;
    },
    getDashAiming() {
      return dashAiming;
    },
    setDashAiming(v) {
      dashAiming = !!v;
    },
    tickNeeds,
    updateEnemyLos,
    pushSmokeZone,
    beginFoodSense,
    pickRogueHunterTarget,
    onDashLanded,
    desperationSpeedMult,
    stealthBlocksDamage,
    clubsPhaseThroughObstacles,
    playerInsideSmoke,
    drawSmokeAndFood,
    drawFoodSenseArrows,
    drawDashAim,
    drawSurvivalHudArcs,
    drawScreenHud,
    drawWorldPopups,
    drawStealthAid,
    spawnPopup,
    syncRogueDiamondRangeBoost,
    countSuitInDeck,
    smokeRadiusForInventory,
  };
}
