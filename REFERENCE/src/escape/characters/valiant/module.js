import { makeCharacterSchema } from "../schema.js";

export const valiantModule = makeCharacterSchema({
  id: "valiant",
  controlsHint:
    "Move: Arrows | Abilities: Q Surge, W shock field (enemies), E Rescue, R Ultimate (Ace slot) | Pause: Space | Retry: R (character select)",
  hpModel: {
    missingHealth01: ({ state, clamp }) => clamp(1 - state.valiantWill, 0, 1),
    routeDamage: (ctx, packet) => {
      if (!ctx.isValiant?.()) return false;
      ctx.valiantApplyDamage?.(packet.amount, packet.opts || {});
      return true;
    },
  },
  abilities: {
    onQ: (ctx) => {
      const ability = ctx.abilities.dash;
      if (!ctx.state.running) return true;
      if (
        ctx.state.runLevelUpCinematic &&
        ctx.performance.now() - ctx.state.runLevelUpCinematic.startMs < ctx.constants.RUN_LEVEL_UP_CINEMATIC_MS
      )
        return true;
      if (ctx.state.pausedForRoulette || ctx.state.pausedForSafehousePrompt || ctx.state.pausedForForge) return true;
      if (ctx.state.elapsed < ability.nextReadyAt) return true;
      const cd = ctx.effectiveAbilityCooldown("dash", ability.cooldown, ability.minCooldown ?? 0.45);
      ability.nextReadyAt = ctx.state.elapsed + cd;
      const burstDurBonus = ctx.knightDiamondBurstEmpowerActive() ? ctx.constants.KNIGHT_DIAMOND_BURST_DURATION_BONUS_SEC : 0;
      const dur = (ctx.abilities.dash.duration ?? ctx.abilities.burst.duration ?? 3) + burstDurBonus;
      ctx.player.burstUntil = ctx.state.elapsed + dur;
      if (ctx.passive.invisOnBurst > 0) {
        ctx.inventory.clubsInvisUntil = Math.max(ctx.inventory.clubsInvisUntil, ctx.state.elapsed + ctx.passive.invisOnBurst);
      }
      ctx.spawnAttackRing(ctx.player.x, ctx.player.y, 58, "#38bdf8", 0.22);
      ctx.spawnAttackRing(ctx.player.x, ctx.player.y, 88, "#7dd3fc", 0.18);
      return true;
    },
    onW: (ctx) => {
      const ability = ctx.abilities.burst;
      if (!ctx.state.running) return true;
      if (ctx.valiantBoxChargeState.charges <= 0 && ctx.state.elapsed < ability.nextReadyAt) return true;
      if (ctx.valiantBoxChargeState.charges <= 0) return true;
      ctx.valiantBoxChargeState.charges -= 1;
      if (ctx.valiantBoxChargeState.charges < ctx.valiantBoxChargeState.maxCharges) {
        const cd = ctx.effectiveAbilityCooldown("burst", ability.cooldown, ability.minCooldown ?? 0.5);
        ctx.valiantBoxChargeState.nextRechargeAt = Math.max(ctx.valiantBoxChargeState.nextRechargeAt, ctx.state.elapsed + cd);
      }
      if (ctx.valiantBoxChargeState.charges <= 0) {
        ability.nextReadyAt = ctx.state.elapsed + ctx.effectiveAbilityCooldown("burst", ability.cooldown, ability.minCooldown ?? 0.5);
      }
      ctx.placeValiantShockField();
      return true;
    },
    onE: (ctx) => {
      ctx.tryValiantRescueRabbit();
      return true;
    },
  },
});
