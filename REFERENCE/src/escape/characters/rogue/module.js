import { makeCharacterSchema } from "../schema.js";

export const rogueModule = makeCharacterSchema({
  id: "rogue",
  controlsHint: "Move: Arrows | Abilities: Q dash, W smoke bomb, E point to food | Pause: Space | Retry: R (character select)",
  traits: {
    usesRogueSystems: true,
  },
  abilities: {
    dashRange: (ctx) => {
      if (ctx.deckSuitCounts.diamonds >= ctx.constants.SET_BONUS_SUIT_MAX) return 220;
      return ctx.inventory.rogueDiamondRangeBoost ? 180 : 120;
    },
    dashStopOnObstacle: () => true,
    onW: (ctx) => {
      const ability = ctx.abilities.burst;
      if (ctx.state.elapsed < ability.nextReadyAt || !ctx.state.running) return true;
      ability.nextReadyAt = ctx.state.elapsed + ctx.effectiveAbilityCooldown("burst", ability.cooldown, ability.minCooldown ?? 1);
      ctx.entities.smokeZones.push({
        x: ctx.player.x,
        y: ctx.player.y,
        r:
          ctx.deckSuitCounts.diamonds >= ctx.constants.SET_BONUS_SUIT_MAX
            ? 300
            : ctx.inventory.rogueDiamondRangeBoost
              ? 260
              : 180,
        bornAt: ctx.state.elapsed,
        expiresAt: ctx.state.elapsed + (ability.duration ?? 3),
      });
      ctx.spawnAttackRing(ctx.player.x, ctx.player.y, 72, "#94a3b8", 0.2);
      ctx.spawnAttackRing(ctx.player.x, ctx.player.y, 128, "#cbd5e1", 0.28);
      return true;
    },
    onE: (ctx) => {
      const ability = ctx.abilities.decoy;
      if (ctx.state.elapsed < ability.nextReadyAt || !ctx.state.running) return true;
      ability.nextReadyAt = ctx.state.elapsed + Math.max(ability.minCooldown ?? 0.5, ability.cooldown);
      ctx.state.rogueFoodSenseUntil = Math.max(ctx.state.rogueFoodSenseUntil, ctx.state.elapsed + ctx.constants.ROGUE_FOOD_SENSE_DURATION);
      return true;
    },
  },
  itemModifiers: {
    makeDiamondCardEffect: (ctx, rank, target, defaultBuilder) => {
      void defaultBuilder;
      return { kind: "cooldownPct", target, value: ctx.rogueDiamondCooldownPctForRank(rank) };
    },
    allowDiamondEmpowerChoice: () => false,
    onRecalc: (_ctx, payload) => {
      if (payload.suits.diamonds >= 7) payload.inventory.rogueDiamondRangeBoost = true;
    },
  },
  passives: {
    onAfterDashLanding: (ctx, payload) => {
      const { spadesCount, qualifiesForSpadesDashBonus } = payload;
      if (spadesCount < ctx.constants.SET_BONUS_SUIT_THRESHOLD || !qualifiesForSpadesDashBonus) return;
      ctx.state.rogueStealthActive = true;
      ctx.state.rogueStealthOpenUntil = Math.max(
        ctx.state.rogueStealthOpenUntil,
        ctx.state.elapsed + ctx.constants.ROGUE_STEALTH_OPEN_GRACE + 0.12
      );
      ctx.inventory.spadesLandingStealthUntil = Math.max(
        ctx.inventory.spadesLandingStealthUntil,
        ctx.state.rogueStealthOpenUntil
      );
    },
    speedBonus: (ctx) => {
      const hungerLeftRatio = ctx.clamp(ctx.state.rogueHunger / Math.max(0.001, ctx.state.rogueHungerMax), 0, 1);
      return (1 - hungerLeftRatio) * ctx.constants.ROGUE_DESPERATION_SPEED_MAX;
    },
    phaseThroughActive: (ctx) => ctx.playerInsideSmoke(),
    suppressMovementInput: (ctx) => !!ctx.state.rogueDashAiming,
    onDashKeyDown: (ctx) => {
      if (
        !ctx.state.running ||
        ctx.state.pausedForCard ||
        ctx.state.pausedForRoulette ||
        ctx.state.pausedForSafehousePrompt ||
        ctx.state.pausedForForge ||
        ctx.state.inventoryModalOpen
      ) {
        return true;
      }
      if (ctx.dashState.charges <= 0) return true;
      ctx.state.rogueDashAiming = true;
      return true;
    },
    onDashKeyUp: (ctx) => {
      if (!ctx.state.rogueDashAiming) return true;
      ctx.state.rogueDashAiming = false;
      ctx.tryDash();
      return true;
    },
    pickTargetForHunter: (ctx, payload) => {
      const { hunter, nearestDecoy, fallback } = payload;
      if (ctx.state.elapsed < ctx.inventory.spadesLandingStealthUntil) return nearestDecoy(hunter) || fallback;
      if (ctx.state.rogueStealthActive) return nearestDecoy(hunter) || fallback;
      const hasLosToPlayer = ctx.hasLineOfSight(hunter, ctx.player);
      if (hasLosToPlayer) {
        ctx.state.rogueLastSeenAt = ctx.state.elapsed;
        ctx.state.rogueAlertUntil = Math.max(ctx.state.rogueAlertUntil, ctx.state.elapsed + 1.4);
        ctx.state.rogueLastKnownPlayerPos = { x: ctx.player.x, y: ctx.player.y };
        return ctx.player;
      }
      return ctx.state.rogueLastKnownPlayerPos || fallback;
    },
    modifyHunterMovement: (ctx, payload) => {
      const { hunter, spDt } = payload;
      if (ctx.state.elapsed > ctx.state.rogueAlertUntil) return { speedMult: 0.58, handled: false };
      if (!ctx.state.rogueStealthActive) return null;
      if (!hunter.patrolDir || ctx.state.elapsed >= (hunter.patrolTurnAt ?? 0)) {
        const ang = Math.random() * ctx.constants.TAU;
        hunter.patrolDir = { x: Math.cos(ang), y: Math.sin(ang) };
        hunter.patrolTurnAt = ctx.state.elapsed + ctx.rand(0.8, 1.8);
      }
      const patrolSteer = ctx.avoidObstacles(hunter, hunter.patrolDir);
      hunter.dir.x = hunter.dir.x * 0.7 + patrolSteer.x * 0.3;
      hunter.dir.y = hunter.dir.y * 0.7 + patrolSteer.y * 0.3;
      const plen = Math.hypot(hunter.dir.x, hunter.dir.y) || 1;
      hunter.dir.x /= plen;
      hunter.dir.y /= plen;
      ctx.moveCircleWithCollisions(hunter, hunter.dir.x * payload.speed * 0.38, hunter.dir.y * payload.speed * 0.38, spDt, {
        blockValiantEnemyShockFields: true,
      });
      return { handled: true };
    },
    canRangedFireAtTarget: (_ctx, payload) => payload.target === _ctx.player,
    canSniperFireAtTarget: (ctx, payload) => {
      if (payload.target !== ctx.player) return false;
      if (payload.phase === "losGate") {
        if (payload.hunter.arenaNexusSpawn) return true;
        return ctx.anyOtherEnemyHasLineOfSightToPlayer(payload.hunter);
      }
      return true;
    },
    shouldIgnoreDamage: (ctx) =>
      ctx.state.rogueStealthActive || ctx.state.elapsed < ctx.inventory.spadesLandingStealthUntil,
    drawAimOverlay: (ctx, gfx) => {
      if (!ctx.state.rogueDashAiming) return false;
      const { target, cameraX, cameraY, shake } = gfx;
      const tipX = target.x;
      const tipY = target.y;
      const draw = gfx.ctx;
      draw.strokeStyle = "rgba(125, 211, 252, 0.9)";
      draw.lineWidth = 2.4;
      draw.setLineDash([9, 7]);
      draw.beginPath();
      draw.moveTo(ctx.player.x - cameraX + shake.x, ctx.player.y - cameraY + shake.y);
      draw.lineTo(tipX - cameraX + shake.x, tipY - cameraY + shake.y);
      draw.stroke();
      draw.setLineDash([]);
      gfx.drawCircle(draw, tipX - cameraX + shake.x, tipY - cameraY + shake.y, 7, "#7dd3fc", 0.3);
      draw.strokeStyle = "rgba(186, 230, 253, 0.95)";
      draw.lineWidth = 2;
      draw.beginPath();
      draw.arc(tipX - cameraX + shake.x, tipY - cameraY + shake.y, 7, 0, ctx.constants.TAU);
      draw.stroke();
      return true;
    },
    drawPostFxOverlay: (ctx, gfx) => {
      if (!ctx.state.running) return;
      const draw = gfx.ctx;
      const hungerMissing = 1 - ctx.clamp(ctx.state.rogueHunger / Math.max(0.001, ctx.state.rogueHungerMax), 0, 1);
      if (hungerMissing > 0) {
        const alpha = 0.04 + hungerMissing * 0.22;
        draw.fillStyle = `rgba(20, 184, 166, ${alpha})`;
        draw.fillRect(0, 0, gfx.world.w, gfx.world.h);
      }
      if (!ctx.state.rogueHasEnemyLos) {
        draw.fillStyle = "rgba(16, 185, 129, 0.08)";
        draw.fillRect(0, 0, gfx.world.w, gfx.world.h);
        draw.fillStyle = "#d1fae5";
        draw.textAlign = "left";
        draw.textBaseline = "top";
        draw.font = "bold 14px Arial";
        draw.fillText("LoS broken", 14, 130);
      }
    },
    drawHudOverlay: (ctx, payload) => {
      if (payload?.ctx) {
        const draw = payload.ctx;
        const ratio = ctx.clamp(ctx.state.rogueHunger / Math.max(0.001, ctx.state.rogueHungerMax), 0, 1);
        const x = 14;
        const y = 114;
        const w = 160;
        const h = 10;
        draw.fillStyle = "rgba(51, 65, 85, 0.9)";
        draw.fillRect(x, y, w, h);
        draw.fillStyle = ratio > 0.35 ? "#f59e0b" : "#ef4444";
        draw.fillRect(x, y, w * ratio, h);
        draw.strokeStyle = "rgba(148, 163, 184, 0.6)";
        draw.lineWidth = 1;
        draw.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
        draw.fillStyle = "#fde68a";
        draw.fillText(`Fed: ${ctx.state.rogueHunger.toFixed(1)}s`, x, y + 14);
        if (ctx.state.rogueStealthActive) {
          draw.fillStyle = "#bbf7d0";
          draw.fillText("Stealthed", x, y + 31);
        } else if (ctx.state.elapsed <= ctx.state.rogueAlertUntil) {
          draw.fillStyle = "#fca5a5";
          draw.fillText("Alerted", x, y + 31);
        } else {
          draw.fillStyle = "#93c5fd";
          draw.fillText("Seeking", x, y + 31);
        }
      }
      return ctx.state.elapsed < ctx.state.rogueFoodSenseUntil;
    },
    drawWorldPlayerAid: (ctx, payload) => {
      if (!ctx.state.rogueStealthActive) return false;
      const draw = payload.ctx;
      const safeRadius = 56;
      const info = ctx.nearestTerrainInfo(ctx.player.x, ctx.player.y);
      const terrainDist = Number.isFinite(info.dist) ? info.dist : safeRadius;
      const inSafeRange = terrainDist <= safeRadius;
      const ringColor = inSafeRange ? "rgba(110, 231, 183, 0.72)" : "rgba(248, 113, 113, 0.72)";
      draw.strokeStyle = "rgba(16, 185, 129, 0.22)";
      draw.lineWidth = 1.5;
      draw.beginPath();
      draw.arc(ctx.player.x, ctx.player.y, safeRadius, 0, payload.TAU);
      draw.stroke();
      if (info.point && inSafeRange) {
        draw.strokeStyle = ringColor;
        draw.lineWidth = 2.6;
        draw.beginPath();
        draw.moveTo(ctx.player.x, ctx.player.y);
        draw.lineTo(info.point.x, info.point.y);
        draw.stroke();
        ctx.drawCircle(draw, info.point.x, info.point.y, 3.4, "#a7f3d0", 0.95);
      }
      return true;
    },
    drawSurvivalHud: () => true,
    onUpdateNeeds: (ctx, payload) => {
      const { simDt, moving, touchedObstacle } = payload;
      ctx.state.rogueHunger = Math.max(0, ctx.state.rogueHunger - simDt);
      if (ctx.state.rogueHunger <= 0) {
        ctx.player.hp = 0;
        ctx.state.running = false;
        ctx.state.deathStartedAtMs = ctx.state.lastTime;
        ctx.state.bestSurvival = Math.max(ctx.state.bestSurvival, ctx.runClockEffectiveSec());
        return;
      }

      while (ctx.state.elapsed >= ctx.state.rogueNextFoodAt) {
        ctx.spawnRogueFood();
        ctx.state.rogueNextFoodAt += ctx.rand(4.8, 7.8);
      }

      const inSmoke = ctx.playerInsideSmoke();
      const huggingTerrain = touchedObstacle || ctx.isPlayerHuggingTerrain(20) || ctx.isPointNearTerrain(ctx.player.x, ctx.player.y, 56);
      const canEnterStealth =
        ctx.state.elapsed - ctx.state.rogueLastSeenAt >= ctx.constants.ROGUE_STEALTH_AFTER_LOS_BREAK || inSmoke;
      if (canEnterStealth && (huggingTerrain || inSmoke)) {
        ctx.state.rogueStealthActive = true;
        ctx.state.rogueStealthOpenUntil = ctx.state.elapsed + ctx.constants.ROGUE_STEALTH_OPEN_GRACE;
      }
      if (ctx.state.rogueStealthActive) {
        if (huggingTerrain || inSmoke) {
          ctx.state.rogueStealthOpenUntil = ctx.state.elapsed + ctx.constants.ROGUE_STEALTH_OPEN_GRACE;
        } else if (ctx.state.elapsed >= ctx.state.rogueStealthOpenUntil) {
          ctx.state.rogueStealthActive = false;
        }
      }

      const hungryRatio = 1 - ctx.clamp(ctx.state.rogueHunger / Math.max(0.001, ctx.state.rogueHungerMax), 0, 1);
      if (hungryRatio >= 0.25 && ctx.state.elapsed >= ctx.state.rogueNextHungryPopupAt) {
        ctx.spawnHealPopup(ctx.player.x, ctx.player.y - ctx.player.r - 12, "I'm hungry", "#67e8f9");
        const cadence = hungryRatio >= 0.7 ? 3.2 : hungryRatio >= 0.45 ? 5.2 : 7;
        ctx.state.rogueNextHungryPopupAt = ctx.state.elapsed + cadence;
      }

      for (let i = ctx.entities.foods.length - 1; i >= 0; i--) {
        const f = ctx.entities.foods[i];
        if (ctx.state.elapsed >= f.expiresAt) {
          ctx.entities.foods.splice(i, 1);
          continue;
        }
        const rr = f.r + ctx.player.r;
        if (ctx.distSq(f, ctx.player) <= rr * rr) {
          ctx.state.rogueHunger = Math.min(
            ctx.state.rogueHungerMax,
            Math.max(ctx.state.rogueHunger, f.nutrition ?? ctx.constants.ROGUE_FOOD_HUNGER_RESTORE)
          );
          ctx.logEvent(ctx.logCodes.EVT_ROGUE_FOOD_EATEN, "Rogue ate food pickup", {
            hungerAfter: ctx.state.rogueHunger,
            hungerMax: ctx.state.rogueHungerMax,
            nutrition: f.nutrition ?? ctx.constants.ROGUE_FOOD_HUNGER_RESTORE,
          });
          ctx.spawnHealPopup(ctx.player.x, ctx.player.y - ctx.player.r - 8, "Fed", "#fcd34d");
          ctx.entities.foods.splice(i, 1);
        }
      }
      void moving;
    },
    onUpdateLineOfSight: (ctx) => {
      let seen = false;
      for (const h of ctx.entities.hunters) {
        if (h.type === "spawner" || h.type === "airSpawner") continue;
        if (ctx.state.elapsed < (h.stunnedUntil || 0)) continue;
        if (ctx.hasLineOfSight(h, ctx.player)) {
          seen = true;
          break;
        }
      }
      ctx.state.rogueHasEnemyLos = seen;
      if (seen) ctx.state.rogueLastSeenAt = ctx.state.elapsed;
    },
  },
  ui: {
    setBonusLineForSuitThreshold: (_ctx, suit) => {
      if (suit === "diamonds") return "Set bonus! Diamonds: dash range and smoke radius increased.";
      if (suit === "clubs") return "Set bonus! Clubs: phase through terrain while inside smoke.";
      if (suit === "spades") {
        return "Set bonus! Spades: dash from stealth snaps you back into stealth on landing (extra grace to hug cover).";
      }
      return null;
    },
    setBonusLineForSuitMax: (_ctx, suit) => {
      if (suit === "diamonds") return "Set bonus! Diamonds (13): maximum dash, smoke, and consume tuning.";
      return null;
    },
    suitSetBonusGoalLabel: (ctx, suit) => {
      if (suit === "diamonds") return "larger dash & smoke radius";
      if (suit === "clubs") return "phase through terrain in smoke";
      if (suit === "spades") return "stealth refresh on stealth-dash landing";
      return null;
    },
    diamondsActiveSummary: (ctx) => {
      if (ctx.diamondsOmniEmpowerActive()) return "maximum dash, smoke, and consume tuning";
      return "larger dash & smoke radius";
    },
    suitSetBonusSevenActiveShort: (_ctx, suit) => {
      if (suit === "clubs") return "phase through terrain while inside smoke";
      if (suit === "spades") return "stealth refresh on stealth-dash landing";
      return null;
    },
    suitSetBonusTierTwoGoalLabel: (_ctx, suit) => {
      if (suit === "diamonds") return "stronger dash, smoke, and consume together";
      return null;
    },
    suitSetBonusTierTwoActiveShort: (_ctx, suit) => {
      if (suit === "diamonds") return "maximum diamond mobility";
      return null;
    },
    hpHudLiftPx: () => 7,
  },
});
