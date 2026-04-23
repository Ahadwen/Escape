import { getEquippedUltimateType, buildEquippedUltimateHud } from "../items/ultimateSlot.js";
import { TAU } from "../constants.js";
import {
  LUNATIC_PASSIVE_HP_PER_SEC,
  LUNATIC_STUMBLE_MOVE_MULT,
  LUNATIC_W_TOGGLE_COOLDOWN_SEC,
  LUNATIC_SPRINT_MOMENTUM_RAMP_SEC,
  LUNATIC_SPRINT_PEAK_SPEED_MULT,
  LUNATIC_DECEL_SEC,
  LUNATIC_DECEL_SPRINT_REF_SEC,
  LUNATIC_CRASH_STUN_SEC,
  LUNATIC_CRASH_DAMAGE_BRACKET_1_SEC,
  LUNATIC_CRASH_DAMAGE_BRACKET_2_SEC,
  LUNATIC_CRASH_DAMAGE_TIER_1,
  LUNATIC_CRASH_DAMAGE_TIER_2,
  LUNATIC_CRASH_DAMAGE_TIER_3,
  LUNATIC_TURN_RADIUS_PX,
  LUNATIC_STEER_MAX_RAD_PER_SEC,
  LUNATIC_ROAR_COOLDOWN_SEC,
  LUNATIC_ROAR_DURATION_SEC,
  LUNATIC_ROAR_SPEED_MULT,
  LUNATIC_ROAR_TERRAIN_DAMAGE_INTERVAL_SEC,
  LUNATIC_ROAR_TERRAIN_DAMAGE,
} from "../balance.js";

const LABEL_Q = "Steer L";
const LABEL_W = "Sprint / Stop";
const LABEL_E = "Steer R";
const LABEL_R = "Roar";

/** Lunatic base HP. */
export const LUNATIC_MAX_HP = 18;

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

function cdRemaining(readyAt, elapsed) {
  return Math.max(0, readyAt - elapsed);
}

function cdValue(readyAt, elapsed) {
  const left = cdRemaining(readyAt, elapsed);
  if (left <= 0.05) return "READY";
  return `${left.toFixed(1)}s`;
}

function fmtSec(s) {
  return `${s.toFixed(1)}s`;
}

function sprintSpeedMultFromMomentum(m) {
  return LUNATIC_STUMBLE_MOVE_MULT + (LUNATIC_SPRINT_PEAK_SPEED_MULT - LUNATIC_STUMBLE_MOVE_MULT) * m;
}

/** Circle vs axis-aligned rect overlap (same test as `collectibles/placement.js`). */
function intersectsRectCircle(circle, rect) {
  const cx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
  const dx = circle.x - cx;
  const dy = circle.y - cy;
  return dx * dx + dy * dy < circle.r * circle.r;
}

function removeObstaclesIntersectingPlayerCircle(player, obstacles) {
  const c = { x: player.x, y: player.y, r: player.r };
  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (intersectsRectCircle(c, obstacles[i])) obstacles.splice(i, 1);
  }
}

function playerCollidesAnyObstacle(player, obstacles) {
  for (const o of obstacles) {
    if (intersectsRectCircle({ x: player.x, y: player.y, r: player.r }, o)) return true;
  }
  return false;
}

export function createLunatic() {
  /** @type {"stumble" | "sprint" | "decel"} */
  let phase = "stumble";
  let momentum = 0;
  let pressSprintUnlockAt = 0;
  let pressStopUnlockAt = 0;
  let decelEndAt = 0;
  let decelStartAt = 0;
  let sprintStartedAt = 0;
  let stunUntil = 0;
  let roarUntil = 0;
  let roarReadyAt = 0;
  let roarTerrainDmgBank = 0;
  let healExcludeHexKey = "";
  let sprintTier2FxFired = false;
  let sprintTier4FxFired = false;
  /** @type {object | null} */
  let currentInventory = null;

  function resetInternal(spawnHexKey) {
    phase = "stumble";
    momentum = 0;
    pressSprintUnlockAt = 0;
    pressStopUnlockAt = 0;
    decelEndAt = 0;
    decelStartAt = 0;
    sprintStartedAt = 0;
    stunUntil = 0;
    roarUntil = 0;
    roarReadyAt = 0;
    roarTerrainDmgBank = 0;
    healExcludeHexKey = spawnHexKey || "";
    sprintTier2FxFired = false;
    sprintTier4FxFired = false;
  }

  function crashDamageFromSprintDur(elapsed) {
    const d = Math.max(0, elapsed - sprintStartedAt);
    if (d <= LUNATIC_CRASH_DAMAGE_BRACKET_1_SEC) return LUNATIC_CRASH_DAMAGE_TIER_1;
    if (d <= LUNATIC_CRASH_DAMAGE_BRACKET_2_SEC) return LUNATIC_CRASH_DAMAGE_TIER_2;
    return LUNATIC_CRASH_DAMAGE_TIER_3;
  }

  function applyCrashFromObstacle(player, elapsed, damagePlayer, spawnAttackRing) {
    damagePlayer(crashDamageFromSprintDur(elapsed), { lunaticCrash: true });
    if (typeof spawnAttackRing === "function") {
      spawnAttackRing(player.x, player.y, player.r + 14, "#fef9c3", 0.14);
      spawnAttackRing(player.x, player.y, player.r + 34, "#fb923c", 0.28);
      spawnAttackRing(player.x, player.y, player.r + 56, "#ea580c", 0.4);
    }
    phase = "stumble";
    momentum = 0;
    decelEndAt = 0;
    decelStartAt = 0;
    stunUntil = elapsed + LUNATIC_CRASH_STUN_SEC;
    pressSprintUnlockAt = elapsed + LUNATIC_W_TOGGLE_COOLDOWN_SEC;
    sprintTier2FxFired = false;
    sprintTier4FxFired = false;
  }

  function tryWToggle(elapsed) {
    if (elapsed < stunUntil) return;
    if (phase === "stumble") {
      if (elapsed < pressSprintUnlockAt) return;
      phase = "sprint";
      momentum = 0;
      sprintStartedAt = elapsed;
      sprintTier2FxFired = false;
      sprintTier4FxFired = false;
      pressStopUnlockAt = elapsed + LUNATIC_W_TOGGLE_COOLDOWN_SEC;
      return;
    }
    if (phase === "sprint") {
      if (elapsed < pressStopUnlockAt) return;
      const sprintDur = Math.max(0, elapsed - sprintStartedAt);
      const decelScale = clamp(sprintDur / Math.max(1e-4, LUNATIC_DECEL_SPRINT_REF_SEC), 0, 1);
      const decelDur = LUNATIC_DECEL_SEC * decelScale;
      phase = "decel";
      decelStartAt = elapsed;
      decelEndAt = elapsed + decelDur;
      pressSprintUnlockAt = elapsed + LUNATIC_W_TOGGLE_COOLDOWN_SEC;
    }
  }

  function tryRoar(elapsed, spawnAttackRing, player) {
    if (elapsed < roarReadyAt) return false;
    if (phase !== "sprint") return false;
    roarUntil = elapsed + LUNATIC_ROAR_DURATION_SEC;
    roarReadyAt = elapsed + LUNATIC_ROAR_COOLDOWN_SEC;
    roarTerrainDmgBank = 0;
    if (typeof spawnAttackRing === "function") {
      spawnAttackRing(player.x, player.y, player.r + 24, "#ef4444", 0.35);
    }
    return true;
  }

  return {
    id: "lunatic",

    getCombatProfile() {
      return { maxHp: LUNATIC_MAX_HP, startingHp: LUNATIC_MAX_HP };
    },

    getShellUi() {
      return {
        controlsHintLine: `Move: Arrows · Sprint: W · Roar: R (while sprinting) · Steer sprint: Q / E or Left / Right | Pause: Space | After death: Enter retry`,
      };
    },

    getInvulnUntil() {
      return 0;
    },

    getDecoys() {
      return [];
    },

    getLunaticPhase() {
      return phase;
    },

    getLunaticRoarUntil() {
      return roarUntil;
    },

    getHealExcludeHexKey() {
      return healExcludeHexKey;
    },

    /** @param {string} [spawnHexKey] */
    resetRunState(spawnHexKey) {
      resetInternal(spawnHexKey);
    },

    getLunaticSprintDamageImmune() {
      return phase === "sprint" || phase === "decel";
    },

    isDashCoolingDown() {
      return false;
    },

    tick(ctx) {
      const { elapsed, player, inventory, dt } = ctx;
      currentInventory = inventory;
      player.speedBurstMult = 1;
      player.speedPassiveMult = 1;
      player.terrainTouchMult = 1;
      player.dodgeChanceWhenDashCd = 0;
      player.stunOnHitSecs = 0;
      player.frontShieldArcDeg = 0;
      inventory.heartsRegenPerSec = 0;
      if (!getEquippedUltimateType(inventory)) inventory.aceUltimateReadyAt = 0;

      if (player.hp > 0) {
        inventory.lunaticRegenBank = (inventory.lunaticRegenBank ?? 0) + LUNATIC_PASSIVE_HP_PER_SEC * (dt ?? 0);
        while ((inventory.lunaticRegenBank ?? 0) >= 1 && player.hp < player.maxHp) {
          inventory.lunaticRegenBank -= 1;
          player.hp += 1;
        }
        if (player.hp >= player.maxHp) inventory.lunaticRegenBank = 0;
      }
    },

    onAbilityPress(slot, ctx) {
      if (slot === "w") tryWToggle(ctx.elapsed);
      else if (slot === "r") tryRoar(ctx.elapsed, ctx.spawnAttackRing, ctx.player);
    },

    /**
     * @param {object} ctx
     * @param {number} ctx.dt
     * @param {number} ctx.simElapsed
     * @param {{ x: number; y: number; r: number; facing: { x: number; y: number }; speedBurstMult?: number; speedPassiveMult?: number; terrainTouchMult?: number }} ctx.player
     * @param {{ isDown: (k: string) => boolean }} ctx.keys
     * @param {() => boolean} ctx.steerLeft
     * @param {() => boolean} ctx.steerRight
     * @param {object} ctx.inventory
     * @param {number} ctx.PLAYER_SPEED
     * @param {number} ctx.ultimateSpeedUntil
     * @param {number} ctx.laserSlowMult
     * @param {() => unknown[]} ctx.getObsForCollision
     * @param {(x: number, y: number, r: number, rects: unknown[]) => { x: number; y: number }} ctx.resolvePlayerAgainstRects
     * @param {(x: number, y: number, r: number, rects: unknown[]) => boolean} ctx.circleOverlapsAnyRect
     * @param {(n: number, o?: object) => void} ctx.damagePlayer
     * @param {(x: number, y: number, r: number, color: string, dur: number) => void} [ctx.spawnAttackRing]
     * @returns {{ rogueMovementIntent: boolean; touchedObstacle: boolean } | null}
     */
    applyMovementFrame(ctx) {
      const {
        dt,
        simElapsed,
        player,
        keys,
        steerLeft,
        steerRight,
        inventory = {},
        PLAYER_SPEED,
        ultimateSpeedUntil,
        laserSlowMult,
        getObsForCollision,
        resolvePlayerAgainstRects,
        circleOverlapsAnyRect,
        damagePlayer,
        spawnAttackRing,
        onLunaticSprintTierFx,
      } = ctx;

      if (phase === "decel" && simElapsed >= decelEndAt) {
        phase = "stumble";
        momentum = 0;
        decelEndAt = 0;
        decelStartAt = 0;
      }

      let mx = 0;
      let my = 0;
      if (keys.isDown("ArrowLeft")) mx -= 1;
      if (keys.isDown("ArrowRight")) mx += 1;
      if (keys.isDown("ArrowUp")) my -= 1;
      if (keys.isDown("ArrowDown")) my += 1;

      const obsRects = getObsForCollision();
      let touchedObstacle = false;
      let rogueMovementIntent = false;

      if (simElapsed < stunUntil) {
        return { rogueMovementIntent: false, touchedObstacle: false };
      }

      if (phase === "stumble") {
        if (mx || my) {
          const mlen2 = Math.hypot(mx, my) || 1;
          player.facing = { x: mx / mlen2, y: my / mlen2 };
        }
        const effectiveSpeed =
          PLAYER_SPEED *
          (player.speedBurstMult ?? 1) *
          (player.speedPassiveMult ?? 1) *
          laserSlowMult *
          LUNATIC_STUMBLE_MOVE_MULT;
        const mlen = Math.hypot(mx, my) || 1;
        const ddx = (mx / mlen) * effectiveSpeed * dt;
        const ddy = (my / mlen) * effectiveSpeed * dt;
        rogueMovementIntent = !!(mx || my);
        player.x += ddx;
        player.y += ddy;
        const resolved = resolvePlayerAgainstRects(player.x, player.y, player.r, obsRects);
        touchedObstacle = Math.abs(resolved.x - player.x) > 1e-6 || Math.abs(resolved.y - player.y) > 1e-6;
        player.x = resolved.x;
        player.y = resolved.y;
        return { rogueMovementIntent, touchedObstacle };
      }

      let speedMult = 1;
      if (phase === "sprint") {
        momentum = Math.min(1, momentum + dt / Math.max(1e-4, LUNATIC_SPRINT_MOMENTUM_RAMP_SEC));
        speedMult = sprintSpeedMultFromMomentum(momentum);
        if (simElapsed < roarUntil) speedMult *= LUNATIC_ROAR_SPEED_MULT;
        const sprintDur = simElapsed - sprintStartedAt;
        if (!sprintTier2FxFired && sprintDur > LUNATIC_CRASH_DAMAGE_BRACKET_1_SEC) {
          sprintTier2FxFired = true;
          onLunaticSprintTierFx?.(2);
        }
        if (!sprintTier4FxFired && sprintDur > LUNATIC_CRASH_DAMAGE_BRACKET_2_SEC) {
          sprintTier4FxFired = true;
          onLunaticSprintTierFx?.(4);
        }
      } else if (phase === "decel") {
        const decelTotal = Math.max(1e-5, decelEndAt - decelStartAt);
        const u = clamp(1 - (decelEndAt - simElapsed) / decelTotal, 0, 1);
        const peak = sprintSpeedMultFromMomentum(momentum);
        speedMult = peak * (1 - u);
        if (simElapsed < roarUntil) speedMult *= LUNATIC_ROAR_SPEED_MULT;
      }

      const laserM = laserSlowMult;
      let sp =
        PLAYER_SPEED *
        (player.speedBurstMult ?? 1) *
        (player.speedPassiveMult ?? 1) *
        laserM *
        speedMult;
      if (simElapsed < ultimateSpeedUntil) sp *= 1.75;
      if (simElapsed < (inventory?.spadesObstacleBoostUntil ?? 0)) {
        sp *= 1 + Math.max(0, (player.terrainTouchMult ?? 1) - 1);
      }

      const yawRate = Math.min(LUNATIC_STEER_MAX_RAD_PER_SEC, sp / Math.max(1, LUNATIC_TURN_RADIUS_PX));
      let fx = player.facing.x;
      let fy = player.facing.y;
      const fl0 = Math.hypot(fx, fy) || 1;
      fx /= fl0;
      fy /= fl0;
      let sl = steerLeft() || keys.isDown("ArrowLeft");
      let sr = steerRight() || keys.isDown("ArrowRight");
      if (sl && sr) sl = sr = false;
      if (sl) {
        const ang = -yawRate * dt;
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        const nx = fx * c - fy * s;
        const ny = fx * s + fy * c;
        fx = nx;
        fy = ny;
      }
      if (sr) {
        const ang = yawRate * dt;
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        const nx = fx * c - fy * s;
        const ny = fx * s + fy * c;
        fx = nx;
        fy = ny;
      }
      const flN = Math.hypot(fx, fy) || 1;
      player.facing = { x: fx / flN, y: fy / flN };
      fx = player.facing.x;
      fy = player.facing.y;

      const vx = fx * sp * dt;
      const vy = fy * sp * dt;
      const prevX = player.x;
      const prevY = player.y;
      const roarPlowing = simElapsed < roarUntil;
      rogueMovementIntent = phase === "sprint" || phase === "decel" || !!(mx || my) || sl || sr;

      if (roarPlowing) {
        player.x += vx;
        player.y += vy;
        return { rogueMovementIntent, touchedObstacle: false };
      }

      player.x += vx;
      player.y += vy;
      const resolved = resolvePlayerAgainstRects(player.x, player.y, player.r, obsRects);
      const hit = Math.abs(resolved.x - player.x) > 1e-6 || Math.abs(resolved.y - player.y) > 1e-6;
      player.x = resolved.x;
      player.y = resolved.y;
      touchedObstacle = hit;

      const overlapStill = circleOverlapsAnyRect(player.x, player.y, player.r, obsRects);
      if (hit || overlapStill) {
        player.x = prevX;
        player.y = prevY;
        applyCrashFromObstacle(player, simElapsed, damagePlayer, spawnAttackRing);
        touchedObstacle = true;
        return { rogueMovementIntent: true, touchedObstacle: true };
      }

      return { rogueMovementIntent, touchedObstacle };
    },

    /**
     * @param {object} ctx
     * @param {number} ctx.simDt
     * @param {number} ctx.simElapsed
     * @param {{ x: number; y: number; r: number }} ctx.player
     * @param {unknown[]} ctx.obstacles
     * @param {(n: number, o?: object) => void} ctx.damagePlayer
     */
    tickLunaticRoarTerrain(ctx) {
      const { simDt, simElapsed, player, obstacles, damagePlayer } = ctx;
      if (simElapsed >= roarUntil) return;
      if (!playerCollidesAnyObstacle(player, obstacles)) return;
      roarTerrainDmgBank += simDt;
      while (roarTerrainDmgBank >= LUNATIC_ROAR_TERRAIN_DAMAGE_INTERVAL_SEC) {
        roarTerrainDmgBank -= LUNATIC_ROAR_TERRAIN_DAMAGE_INTERVAL_SEC;
        damagePlayer(LUNATIC_ROAR_TERRAIN_DAMAGE, { lunaticRoarTerrain: true });
      }
      removeObstaclesIntersectingPlayerCircle(player, obstacles);
    },

    /**
     * @param {object} ctx
     * @param {{ x: number; y: number; r: number }} ctx.player
     * @param {(x: number, y: number, r: number) => boolean} ctx.circleHitsObstacle
     */
    ejectFromObstaclesIfStuck(ctx) {
      const { player, circleHitsObstacle } = ctx;
      if (!circleHitsObstacle(player.x, player.y, player.r)) return;
      const STEP = 3;
      const ANGLES = 28;
      const MAX_R = 220;
      for (let rad = STEP; rad <= MAX_R; rad += STEP) {
        for (let i = 0; i < ANGLES; i++) {
          const ang = (i / ANGLES) * TAU;
          const candX = player.x + Math.cos(ang) * rad;
          const candY = player.y + Math.sin(ang) * rad;
          if (!circleHitsObstacle(candX, candY, player.r)) {
            player.x = candX;
            player.y = candY;
            return;
          }
        }
      }
    },

    getAbilityHud(elapsed) {
      const inv = currentInventory ?? {};
      const sprintCdRem = Math.max(0, pressSprintUnlockAt - elapsed);
      const stopCdRem = Math.max(0, pressStopUnlockAt - elapsed);
      const roarRem = Math.max(0, roarReadyAt - elapsed);
      const ultHud = buildEquippedUltimateHud(inv, elapsed, LABEL_R, "#60a5fa");
      const hasAceUlt = !!getEquippedUltimateType(inv);

      return {
        q: {
          label: LABEL_Q,
          value: "Hold Q",
          fill: { remaining: 0, duration: 1, color: "#64748b" },
        },
        w: {
          label: LABEL_W,
          value: `Sprint ${fmtSec(sprintCdRem)}\nStop ${fmtSec(stopCdRem)}`,
          valueClass: "ability-value--lunatic-w",
          fill: {
            remaining: sprintCdRem,
            duration: LUNATIC_W_TOGGLE_COOLDOWN_SEC,
            color: "#22d3ee",
          },
        },
        e: {
          label: LABEL_E,
          value: "Hold E",
          fill: { remaining: 0, duration: 1, color: "#64748b" },
        },
        r: hasAceUlt
          ? ultHud
          : {
              label: LABEL_R,
              value: `${cdValue(roarReadyAt, elapsed)} · ${phase === "sprint" ? "Sprint" : "—"}`,
              fill: {
                remaining: roarRem,
                duration: LUNATIC_ROAR_COOLDOWN_SEC,
                color: "#f87171",
              },
            },
      };
    },
  };
}
