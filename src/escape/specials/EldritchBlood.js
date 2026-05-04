/**
 * Depths L5 eldritch boss — scripted “blood” encounter layer (timed strikes, follow-up hazards, …).
 * Wave + timewarp stay in `entry.js`; this module owns scripted attack timing/FX only.
 * Phase 1: for `ELDRITCH_BLOOD_PHASE1_DURATION_SEC` after the intro, random orb / lightning / radial barrage
 * spells fire every `ELDRITCH_BLOOD_ATTACK_COOLDOWN_*` seconds (same spells may repeat).
 * Phase 2: same drift → prep → glow → cadence (`ELDRITCH_BLOOD_PHASE2_DURATION_SEC`), different attack pool; first strike is floating cage arena.
 * Phase 3: begins after the P2→P3 interlude (`macroPhase === 5`); attack scripting can extend here later.
 */
import { PLAYER_RADIUS } from "../balance.js";
import { clamp, pointToSegmentDistance } from "../Hunters/hunterGeometry.js";

/** Wall time for each scripted boss combat phase (P1 / P2); intermissions are extra. */
export const ELDRITCH_BLOOD_BOSS_SCRIPTED_PHASE_DURATION_SEC = 80;
export const ELDRITCH_BLOOD_PHASE1_START_SEC = 10;
/** Wall time from entering P1 until the scripted wave ends (no further P1 spells arm after this). */
export const ELDRITCH_BLOOD_PHASE1_DURATION_SEC = ELDRITCH_BLOOD_BOSS_SCRIPTED_PHASE_DURATION_SEC;
/** Boss center must stay at least this many px above the rising wave while a P1 beat is active (charge → tentacles). */
export const ELDRITCH_BLOOD_CAST_ABOVE_WAVE_PX = 200;
/** Seconds before strike telegraph: height clamp turns on so the bloom can drift up (no Y snap at telegraph start). */
export const ELDRITCH_BLOOD_CAST_PREP_DRIFT_SEC = 1.5;
/** Random cooldown `[lo, hi)` seconds between P1 spells (after a spell fully resolves, before the next arms). */
export const ELDRITCH_BLOOD_ATTACK_COOLDOWN_LO_SEC = 4;
export const ELDRITCH_BLOOD_ATTACK_COOLDOWN_HI_SEC = 7;
/** Visual-only interlude after P1 ends (boss “gathers” then “releases”); no gameplay effect. */
export const ELDRITCH_BLOOD_BETWEEN_PHASE_INTERLUDE_SEC = 8;
/** Mirrors P1: same 80s scripted window and gap cadence until the P2→P3 interlude arms. */
export const ELDRITCH_BLOOD_PHASE2_DURATION_SEC = ELDRITCH_BLOOD_BOSS_SCRIPTED_PHASE_DURATION_SEC;
/** P2→P3: boss fades out, scripted storm washes + ambient lightning, then drifts back for phase 3. */
export const ELDRITCH_BLOOD_P2P3_FADE_OUT_SEC = 1.15;
export const ELDRITCH_BLOOD_P2P3_STORM_AMBIENT_SEC = 5;
export const ELDRITCH_BLOOD_P2P3_RETURN_DRIFT_SEC = 1.75;
export const ELDRITCH_BLOOD_P2_TO_P3_INTERLUDE_SEC =
  ELDRITCH_BLOOD_P2P3_FADE_OUT_SEC + ELDRITCH_BLOOD_P2P3_STORM_AMBIENT_SEC + ELDRITCH_BLOOD_P2P3_RETURN_DRIFT_SEC;
/** Floating “mini cage” arena: diameter in px (terrain ignored for the player inside the ring). */
export const ELDRITCH_BLOOD_FLOATING_CAGE_DIAMETER_PX = 350;

const FLOATING_CAGE_RADIUS_PX = ELDRITCH_BLOOD_FLOATING_CAGE_DIAMETER_PX / 2;
/** Boss dash to flank matches P1 radial barrage, then snaps the cage on the player. */
const FLOATING_CAGE_DASH_ALIGN_MAX_SEC = 2.85;
/** Brief beat after the ring snaps on the player before the boss floats to the ring exterior. */
const FLOATING_CAGE_APPEAR_HOLD_SEC = 0.18;

/** Boss eases to a point outside the ring: cage radius + this pad from center (along ray from center toward boss). */
const POST_CAGE_OUTSIDE_PAD_PX = 70;

/** After float: lightning column on the boss, lightning sprite form, then three dashes aimed at the locked player position. */
const POST_CAGE_FLOAT_SEC = 1.28;
const POST_CAGE_LIGHTNING_FORM_SEC = 0.92;
const POST_CAGE_DASH_TELEGRAPH_SEC = 0.62;
const POST_CAGE_DASH_MOVE_SEC = 0.42;
const POST_CAGE_DASH_PAUSE_SEC = 0.52;
const POST_CAGE_DASH_HIT_HW_PX = 38;
/** Lightning-ball boss: touch damage + shake (cooldown avoids per-frame hits). */
const POST_CAGE_LIGHTNING_TOUCH_COOLDOWN_SEC = 0.4;
const POST_CAGE_LIGHTNING_TOUCH_SHAKE = 46;
const POST_CAGE_LIGHTNING_TOUCH_SHAKE_SEC = 0.38;

/** Phases where the cage center tracks the wave and the player is clamped / terrain-free inside the ring. */
const FLOATING_CAGE_INTERIOR_PHASES = new Set([
  "caged",
  "postBossFloat",
  "postLightningFlash",
  "postLightningForm",
  "postDashTelegraph",
  "postDashMove",
  "postDashPause",
]);

/** World point ~`padPx` beyond the ring rim, on the ray from cage center toward `(bx, by)` (closest exterior side). */
function outsideRingBossPoint(cx, cy, bx, by, R, padPx) {
  let dx = bx - cx;
  let dy = by - cy;
  if (Math.abs(dx) + Math.abs(dy) < 1e-5) {
    dx = 1;
    dy = 0;
  }
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  return { x: cx + ux * (R + padPx), y: cy + uy * (R + padPx) };
}

/**
 * Largest `t > eps` with `|{rx,ry} + t*{ux,uy}|² = circleRsq` (`u` unit).
 * Dash starts on that circle (`outsideRingBossPoint`); the second root is the opposite rim hit without overshooting.
 */
function largestRayCircleHitT(rx, ry, ux, uy, circleRsq, eps) {
  const b = 2 * (rx * ux + ry * uy);
  const c = rx * rx + ry * ry - circleRsq;
  const disc = b * b - 4 * c;
  if (disc < 0) return null;
  const s = Math.sqrt(disc);
  const t0 = (-b - s) / 2;
  const t1 = (-b + s) / 2;
  let best = null;
  for (const t of [t0, t1]) {
    if (t > eps && (best === null || t > best)) best = t;
  }
  return best;
}

const ORB_CHARGE_SEC = 0.92;
const ORB_RADIUS = 26;
/** Speed along the current heading (ramps up — feels like commitment, not jitter). */
const ORB_SPEED_RAMP = 520;
const ORB_MAX_SPEED = 920;
/** Small fixed blend toward perpendicular at launch only — one smooth arc, alternating side per beat. */
const ORB_FLIGHT_CURVE_BIAS = 0.14;
const ORB_LAUNCH_SPEED = 280;
/** Homing-orb strike: caps how fast the heading can swing (prevents spiral around the player). */
const ORB_MAX_TURN_RAD_PER_SEC = 5.2;
/** When close, allow a bit more turn so the arc closes cleanly. */
const ORB_CLOSE_DIST_PX = 200;
const ORB_CLOSE_TURN_MULT = 1.85;
const ORB_HIT_DIST = PLAYER_RADIUS + ORB_RADIUS + 12;
const ORB_MAX_FLIGHT_SEC = 11;

const TENTACLE_BURST_SPAN_MULT = 2;

/** Telegraph window: strike resolves at end (slightly longer reads clearer in play). */
const LIGHTNING_TELEGRAPH_TO_STRIKE_SEC = 0.28;
const LIGHTNING_STRIKE_FLASH_SEC = 0.12;
/** Idle time between lightning volleys (after strike flash, before next telegraph). */
const LIGHTNING_BETWEEN_VOLLEY_SEC = 0.5;
const LIGHTNING_VOLLEY_COUNT = 3;
/** Half-width (px) of the **strike** column hitbox (+ player `r`). Telegraph column is drawn narrower. */
const LIGHTNING_COLUMN_HIT_HW = 44;

/** P1 “dark barrage”: dash to flank → radial bolts ×3 with teleports between. */
const BARRAGE_FLANK_OFFSET_X = 350;
const BARRAGE_DASH_ACCEL = 980;
const BARRAGE_DASH_MAX_SPEED = 760;
const BARRAGE_DASH_MAX_SEC = 2.75;
const BARRAGE_PROJECTILE_COUNT = 34;
const BARRAGE_PROJECTILE_SPEED_LO = 322;
const BARRAGE_PROJECTILE_SPEED_HI = 458;
const BARRAGE_SPAWN_WINDOW_SEC = 0.36;
const BARRAGE_POST_VOLLEY_WAIT_SEC = 0.7;
const BARRAGE_TELEPORT_SEC = 0.36;
const BARRAGE_TELEPORT_SWAP_AT = 0.14;

/** P2 “swarm”: barrage-style flank lock, depths bolt-spawner `fast` minions every `P2_SWARM_SPAWN_INTERVAL_SEC`, teleport, then repeat. */
const P2_SWARM_SPAWN_INTERVAL_SEC = 0.1;
const P2_SWARM_BURST1_SEC = 2;
const P2_SWARM_BURST2_SEC = 3;

/** P2 triplicate lightning dash (after global prep drift from `entry.js` gap). */
const P2_TRIPLICATE_GLOW_SEC = 0.5;
const P2_TRIPLICATE_SPLIT_SEC = 0.52;
const P2_TRIPLICATE_LIGHTNING_FORM_SEC = 0.4;
const P2_TRIPLICATE_ATTACK_WINDOW_SEC = 4;
const P2_TRIPLICATE_TELEGRAPH_SEC = 0.28;
const P2_TRIPLICATE_DASH_SEC = 0.44;
const P2_TRIPLICATE_DASH_OVERSHOOT_PX = 220;
const P2_TRIPLICATE_SPLIT_RADIUS_PX = 158;
/** Random pause only after a dash completes, before the next telegraph. */
const P2_TRIPLICATE_PAUSE_LO_SEC = 0.1;
const P2_TRIPLICATE_PAUSE_HI_SEC = 0.3;
const P2_TRIPLICATE_REVERT_SEC = 0.45;
const P2_TRIPLICATE_MERGE_SEC = 0.82;
const P2_TRIPLICATE_DASH_HIT_HW = 40;

function stormHash01(n) {
  return ((n * 134775813 + 1) & 0x7fffffff) / 0x7fffffff;
}

/**
 * @typedef {object} EldritchBloodDeps
 * @property {() => number} getSimElapsed
 * @property {() => { x: number; y: number; r: number }} getPlayer
 * @property {() => boolean} getRunDead
 * @property {() => boolean} isDepthsBossFightLevel
 * @property {() => boolean} isPlayerInSafehouse
 * @property {() => boolean} getHuntersEnabled
 * @property {() => { spawnHunter: (t: string, x: number, y: number, o?: object) => void; entities: { hunters: object[] } } | null} getHunterRuntime
 * @property {(n: number) => number} [stormHash01Dep]
 * @property {(amount: number, opts?: { sourceX?: number; sourceY?: number; eldritchBloodAttack?: string }) => void} damagePlayerThroughPath
 * @property {(strength: number, sec: number) => void} bumpScreenShake
 * @property {(opts: { columnX: number; playerX: number; playerY: number }) => void} [onLightningColumnPlayerHit] — extra FX when the column connects (e.g. rings + screen flare; base shake is applied in this module).
 * @property {(opts: { playerX: number; playerY: number }) => void} [onPostCageLightningBallPlayerHit] — FX when the post-cage lightning orb touch deals damage (screen/UI read).
 * @property {() => object | null} getBloomHunter
 * @property {(a: number, b: number) => number} randRange — uniform `[a, b)` (see `rng.js`)
 * @property {() => { x0: number; y0: number; x1: number; y1: number }} getWorldDrawBounds — world-space rect for full-screen FX (camera + view).
 * @property {number} tentacleBurstPauseSec
 * @property {number} tentacleBurstIntervalSec
 * @property {number} tentacleSpawnRadiusPx
 * @property {number} tentacleBurstSpanSecBase — L4 storm span (module doubles for P1 rain).
 * @property {() => number | null} [getDepthsBossRisingWaveFrontY] — rising tide Y for boss floor clamp during scripted moves.
 * @property {() => string} [getFloatingCageInteriorFill] — flat hex floor colour (masks obstacle art inside the cage disk).
 */

export function createEldritchBloodFlow(/** @type {EldritchBloodDeps} */ deps) {
  const {
    getSimElapsed,
    getPlayer,
    getRunDead,
    isDepthsBossFightLevel,
    isPlayerInSafehouse,
    getHuntersEnabled,
    getHunterRuntime,
    stormHash01Dep,
    damagePlayerThroughPath,
    bumpScreenShake,
    onLightningColumnPlayerHit,
    onPostCageLightningBallPlayerHit,
    getBloomHunter,
    randRange,
    getWorldDrawBounds,
    tentacleBurstPauseSec,
    tentacleBurstIntervalSec,
    tentacleSpawnRadiusPx,
    tentacleBurstSpanSecBase,
    getDepthsBossRisingWaveFrontY,
    getFloatingCageInteriorFill: getFloatingCageInteriorFillDep,
  } = deps;

  /** Depths playable hex tint from `entry.js`; safe default if deps omit. */
  const getFloatingCageInteriorFill = getFloatingCageInteriorFillDep ?? (() => "#050f18");

  const hash01 = stormHash01Dep ?? stormHash01;

  const p1TentacleBurstSpanSec = tentacleBurstSpanSecBase * TENTACLE_BURST_SPAN_MULT;
  const p1TentacleBurstCount =
    Math.round(p1TentacleBurstSpanSec / tentacleBurstIntervalSec) + 1;

  /** `simElapsed` when rising-wave chase arms (`0` = idle). */
  let fightStartSim = 0;
  /** `0` intro · `1` P1 · `2` P1→P2 interlude · `3` P2 · `4` P2→P3 interlude · `5` P3. */
  let macroPhase = /** @type {0 | 1 | 2 | 3 | 4 | 5} */ (0);
  /** `simElapsed` when `macroPhase` became `1` (used with `ELDRITCH_BLOOD_PHASE1_DURATION_SEC`). */
  let p1PhaseEnterSim = 0;
  /** `0` homing orb+tentacles · `1` lightning · `2` radial barrage + teleports. */
  let p1NextSpellKind = /** @type {0 | 1 | 2} */ (0);
  /** Flips each homing-orb cast so consecutive orbs curve opposite ways. */
  let p1OrbArcToggle = false;
  /** @type {"idle" | "strike" | "tentacles" | "gap"} */
  let p1Mode = /** @type {"idle" | "strike" | "tentacles" | "gap"} */ ("idle");
  let p1NextAttackSim = 0;

  /**
   * Homing-orb strike state only (`null` when that strike is not simulating). Other scripted strikes
   * should use their own state, not overload this field.
   * @type {null | { phase: "charge"|"flight"; x: number; y: number; vx: number; vy: number; chargeStartSim: number; flightStartSim: number; arcSide: 1|-1 }}
   */
  let homingOrbStrike = null;
  /**
   * P1 lightning beat: three volleys (1 / 2 / 3 columns), ambient telegraph then strike flash per volley.
   * @type {null | { volleyIndex: number; phase: "telegraph"|"strikeFlash"|"between"; phaseStartSim: number; strikeSim: number; columns: number[]; dealtDamage: boolean }}
   */
  let lightningStrike = null;
  let tentacleHitSim = 0;
  let tentacleLastK = -1;
  /**
   * P1 radial barrage + flank teleports (`null` when inactive).
   * @type {null | {
   *   phase: "dash" | "volley" | "teleport";
   *   phaseStartSim: number;
   *   volleyIndex: number;
   *   initialFlankSign: 1 | -1;
   *   dashVx: number;
   *   dashVy: number;
   *   volleySpawned: number;
   *   teleportSwapped: boolean;
   * }}
   */
  let eldritchBarrageStrike = null;

  /**
   * @type {null | {
   *   phase:
   *     | "dash"
   *     | "caged"
   *     | "postBossFloat"
   *     | "postLightningFlash"
   *     | "postLightningForm"
   *     | "postDashTelegraph"
   *     | "postDashMove"
   *     | "postDashPause";
   *   phaseStartSim: number;
   *   flankSign: 1 | -1;
   *   dashVx: number;
   *   dashVy: number;
   *   cageCx: number;
   *   cageYOffsetFromWave: number;
   *   cageWaveFY: number;
   *   lastSyncedCy: number;
   *   cageBossRelX: number;
   *   cageBossRelY: number;
   *   postFloatOriginRelX?: number;
   *   postFloatOriginRelY?: number;
   *   postFloatTargetRelX?: number;
   *   postFloatTargetRelY?: number;
   *   postDashRound?: number;
   *   postDashDamageDealt?: boolean;
   *   dashSegRelX0?: number;
   *   dashSegRelY0?: number;
   *   dashSegRelX1?: number;
   *   dashSegRelY1?: number;
   *   dashLockRelX?: number;
   *   dashLockRelY?: number;
   * }}
   */
  let floatingCageStrike = null;
  /**
   * P2 swarm beat: dash to barrage flank → depths swarm `fast` minions → teleport → more minions (`null` when inactive).
   * @type {null | {
   *   phase: "dash" | "burst1" | "teleport" | "burst2";
   *   phaseStartSim: number;
   *   initialFlankSign: 1 | -1;
   *   dashVx: number;
   *   dashVy: number;
   *   burstWindowStartSim: number;
   *   burstSpawned: number;
   *   nextSpawnSim: number;
   *   teleportSwapped: boolean;
   * }}
   */
  let p2SwarmStrike = null;
  /**
   * P2 triplicate: glow → split → lightning → 4s staggered telegraph+dashes → revert → merge.
   * @type {null | {
   *   phase: "glow" | "split" | "lightningForm" | "attack" | "revert" | "merge";
   *   phaseStartSim: number;
   *   anchorX: number;
   *   anchorY: number;
   *   clones: { x: number; y: number }[];
   *   layout: { x: number; y: number }[] | null;
   *   attackWindowEndSim: number;
   *   mergeStart0?: { x: number; y: number };
   *   mergeStart2?: { x: number; y: number };
   *   cloneStates: { mode: "cooldown" | "telegraph" | "dash"; cooldownUntilSim: number; telegraphStartSim: number; aimPx: number; aimPy: number; dashT0: number; fx: number; fy: number; tx: number; ty: number; dashDealt: boolean }[];
   *   mergeTargetX: number;
   *   mergeTargetY: number;
   * }}
   */
  let p2TriplicateStrike = null;
  /** `macroPhase === 3` wall clock baseline. */
  let p2PhaseEnterSim = 0;
  /** `macroPhase === 5` wall clock baseline (P3 combat stub). */
  let p3PhaseEnterSim = 0;
  /** @type {"idle" | "gap"} */
  let p2Mode = /** @type {"idle" | "gap"} */ ("idle");
  let p2NextAttackSim = 0;
  /** Cycles P2 beats: 0 cage · 1 swarm · 2 triplicate. */
  let p2StrikeIndex = 0;
  /** One-shot: capture return drift start position when P2→P3 return phase begins. */
  let p2P3ReturnAnchored = false;

  function clearBloomLiftPrepFields(h) {
    h.depthsSpellLiftPrepStartSim = 0;
    h.depthsSpellLiftPrepEndSim = 0;
    h._depthsSpellPrepAnchorSim = 0;
  }

  function clearBloomScriptedTelegraph() {
    const rt = getHunterRuntime();
    if (!rt) return;
    for (const h of rt.entities.hunters) {
      if (h.type === "depthsEldritchBloom") {
        h.depthsEldritchTelegraphHoldUntil = 0;
        h.depthsCastLiftActive = false;
        h.depthsEldritchOrbStrikeChanneling = false;
        h.depthsEldritchLightningCastActive = false;
        h.depthsEldritchBarrageAttackActive = false;
        h.depthsEldritchTeleportFxUntil = 0;
        h.depthsEldritchTeleportGhostX = 0;
        h.depthsEldritchTeleportGhostY = 0;
        h.depthsBetweenPhasesUntil = 0;
        h.depthsBetweenPhasesStartSim = 0;
        h.depthsEldritchP2P3InterludeUntil = 0;
        h.depthsEldritchP2P3InterludeStartSim = 0;
        h.depthsEldritchP2P3AnchorX = 0;
        h.depthsEldritchP2P3AnchorY = 0;
        h.depthsEldritchP2P3InterludeScripted = false;
        h.depthsEldritchP2P3ScriptedOpacity = 1;
        h.depthsEldritchP2P3StormAmbientActive = false;
        h.depthsEldritchP2P3StormPushBurstActive = false;
        h.depthsEldritchP2P3StormBurstStartSim = 0;
        h.depthsEldritchP2P3ReturnFromX = 0;
        h.depthsEldritchP2P3ReturnFromY = 0;
        h.depthsEldritchCageStrikeActive = false;
        h.depthsEldritchPhase2Tone = false;
        h.depthsEldritchPostCageScripted = false;
        h.depthsEldritchPostCageLightningSprite = false;
        h.depthsEldritchTriplicateScripted = false;
        h.depthsEldritchDashTrail = null;
        h.depthsPostCageLightningContactUntil = 0;
        clearBloomLiftPrepFields(h);
      }
    }
    lightningStrike = null;
    eldritchBarrageStrike = null;
    floatingCageStrike = null;
    p2SwarmStrike = null;
    p2TriplicateStrike = null;
  }

  function reset() {
    fightStartSim = 0;
    macroPhase = 0;
    p1PhaseEnterSim = 0;
    p1NextSpellKind = 0;
    p1OrbArcToggle = false;
    p1Mode = "idle";
    p1NextAttackSim = 0;
    homingOrbStrike = null;
    lightningStrike = null;
    eldritchBarrageStrike = null;
    tentacleHitSim = 0;
    tentacleLastK = -1;
    floatingCageStrike = null;
    p2SwarmStrike = null;
    p2TriplicateStrike = null;
    p2PhaseEnterSim = 0;
    p2Mode = "idle";
    p2NextAttackSim = 0;
    p2StrikeIndex = 0;
    p3PhaseEnterSim = 0;
    clearBloomScriptedTelegraph();
    p2P3ReturnAnchored = false;
    const bloomReset = getBloomHunter();
    if (bloomReset) bloomReset.depthsEldritchPhase3Tone = false;
  }

  /** Call when `depthsBossRisingWaveFrontY` first becomes active (leaving sanctuary / chase start). */
  function notifyFightClockStart(simElapsed) {
    if (fightStartSim <= 0) fightStartSim = simElapsed;
  }

  function eldritchStrike01(n) {
    return ((n * 134775813 + 1) & 0x7fffffff) / 0x7fffffff;
  }

  function columnsForLightningVolley(volleyIndex, player) {
    const px = player.x;
    if (volleyIndex === 0) return [px];
    if (volleyIndex === 1) {
      let ox = px + randRange(-210, 210.001);
      if (Math.abs(ox - px) < 56) ox += ox >= px ? 92 : -92;
      return [px, ox];
    }
    let o1 = px + randRange(-270, 270.001);
    let o2 = px + randRange(-270, 270.001);
    if (Math.abs(o1 - px) < 50) o1 += 104;
    if (Math.abs(o2 - px) < 50) o2 -= 104;
    if (Math.abs(o2 - o1) < 44) o2 += 90;
    return [px, o1, o2];
  }

  /**
   * Telegraph: obvious vertical “lane” (ribbon + edge ticks) plus ambient-style jagged bolts
   * (core + softer echo), ramps with `pulse01` toward the strike.
   */
  function drawLightningColumnTelegraphAmbient(ctx, cx, yTop, yBot, simElapsed, seed, pulse01) {
    const ySpan = Math.max(120, yBot - yTop);
    const ramp = pulse01 * pulse01 * (3 - 2 * pulse01);
    const laneAlpha = 0.12 + ramp * 0.38;
    const ribbonW = 36 + ramp * 22;
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    const rib = ctx.createLinearGradient(cx - ribbonW, 0, cx + ribbonW, 0);
    rib.addColorStop(0, `rgba(180, 230, 255, 0)`);
    rib.addColorStop(0.42, `rgba(210, 245, 255, ${laneAlpha * 0.55})`);
    rib.addColorStop(0.5, `rgba(248, 252, 255, ${laneAlpha * 0.95})`);
    rib.addColorStop(0.58, `rgba(210, 245, 255, ${laneAlpha * 0.55})`);
    rib.addColorStop(1, `rgba(180, 230, 255, 0)`);
    ctx.globalAlpha = 1;
    ctx.fillStyle = rib;
    ctx.fillRect(cx - ribbonW, yTop - 24, ribbonW * 2, ySpan + 48);

    ctx.globalAlpha = 0.22 + ramp * 0.5;
    ctx.strokeStyle = "rgba(200, 240, 255, 0.85)";
    ctx.lineWidth = 1.4;
    for (const ox of [-22, 0, 22]) {
      ctx.beginPath();
      ctx.moveTo(cx + ox, yTop - 12);
      ctx.lineTo(cx + ox, yBot + 12);
      ctx.stroke();
    }

    const drawBoltCore = (offsetX, lw, alphaMul, blur) => {
      const segN = 13 + (Math.floor(seed) % 5);
      const alpha = (0.35 + ramp * 0.55) * alphaMul;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(252, 254, 255, 0.96)";
      ctx.lineWidth = lw;
      ctx.shadowColor = "rgba(186, 230, 253, 0.92)";
      ctx.shadowBlur = blur;
      ctx.lineJoin = "round";
      ctx.beginPath();
      let x = cx + offsetX + (eldritchStrike01(seed + 1) - 0.5) * 8;
      let y = yTop - 8;
      ctx.moveTo(x, y);
      for (let s = 0; s < segN; s++) {
        const jx =
          Math.sin(seed * 0.02 + s * 2.1) * (11 + eldritchStrike01(seed + s) * 8) +
          Math.cos(simElapsed * 24 + s * 1.7) * 5;
        const jy = (ySpan + 16) / segN;
        x += jx;
        y += jy;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    drawBoltCore(5, 2.1, 0.42, 10);
    drawBoltCore(-4, 2.65, 0.88, 20);
    drawBoltCore(0, 3.15, 1, 26);

    ctx.restore();
  }

  function drawLightningColumnStrikeFlash(ctx, cx, yTop, yBot, u) {
    const pulse = clamp(u, 0, 1);
    const halfW = 18 + 48 * (1 - pulse);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const grd = ctx.createLinearGradient(cx - halfW, 0, cx + halfW, 0);
    grd.addColorStop(0, `rgba(255, 255, 255, 0)`);
    grd.addColorStop(0.35, `rgba(230, 248, 255, ${0.55 * pulse})`);
    grd.addColorStop(0.5, `rgba(255, 255, 255, ${0.72 + 0.2 * pulse})`);
    grd.addColorStop(0.65, `rgba(200, 235, 255, ${0.5 * pulse})`);
    grd.addColorStop(1, `rgba(255, 255, 255, 0)`);
    ctx.fillStyle = grd;
    ctx.fillRect(cx - halfW, yTop - 30, halfW * 2, yBot - yTop + 60);
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 + 0.4 * pulse})`;
    ctx.lineWidth = 5 + 14 * pulse;
    ctx.shadowColor = "rgba(186, 230, 253, 0.95)";
    ctx.shadowBlur = 28 + 40 * pulse;
    ctx.beginPath();
    ctx.moveTo(cx, yTop - 20);
    ctx.lineTo(cx, yBot + 20);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function endP1Wave() {
    const sim = getSimElapsed();
    macroPhase = 2;
    p1Mode = "idle";
    homingOrbStrike = null;
    lightningStrike = null;
    eldritchBarrageStrike = null;
    tentacleHitSim = 0;
    tentacleLastK = -1;
    clearBloomScriptedTelegraph();
    const bloom = getBloomHunter();
    if (bloom) {
      bloom.depthsBetweenPhasesUntil = sim + ELDRITCH_BLOOD_BETWEEN_PHASE_INTERLUDE_SEC;
      bloom.depthsBetweenPhasesStartSim = sim;
    }
  }

  function rollP1NextSpellKind() {
    return /** @type {0 | 1 | 2} */ (Math.floor(randRange(0, 2.999999)));
  }

  /** After lightning or orb+tentacles fully resolves: either end P1 or arm the next random spell after `[4,7)` s. */
  function scheduleP1GapFromSpellEnd(simElapsed) {
    if (simElapsed - p1PhaseEnterSim >= ELDRITCH_BLOOD_PHASE1_DURATION_SEC) {
      endP1Wave();
      return;
    }
    p1NextSpellKind = rollP1NextSpellKind();
    p1Mode = "gap";
    p1NextAttackSim =
      simElapsed +
      randRange(ELDRITCH_BLOOD_ATTACK_COOLDOWN_LO_SEC, ELDRITCH_BLOOD_ATTACK_COOLDOWN_HI_SEC + 1e-6);
  }

  function finishLightningBeatToGap(simElapsed) {
    lightningStrike = null;
    const bloom = getBloomHunter();
    if (bloom) {
      bloom.depthsEldritchOrbStrikeChanneling = false;
      bloom.depthsEldritchTelegraphHoldUntil = 0;
      bloom.depthsCastLiftActive = false;
      bloom.depthsEldritchLightningCastActive = false;
      clearBloomLiftPrepFields(bloom);
    }
    scheduleP1GapFromSpellEnd(simElapsed);
  }

  /** World-space cage center `{ cx, cy }` from wave front + scripted offset (rising tide = fy decreases upward). */
  function getFloatingCageCenterWorldXY() {
    const C = floatingCageStrike;
    if (!C || !FLOATING_CAGE_INTERIOR_PHASES.has(C.phase)) return null;
    const fy = getDepthsBossRisingWaveFrontY?.() ?? null;
    const cy =
      fy != null && Number.isFinite(fy)
        ? fy + C.cageYOffsetFromWave
        : Number.isFinite(C.lastSyncedCy)
          ? C.lastSyncedCy
          : getPlayer().y;
    C.lastSyncedCy = cy;
    return { cx: C.cageCx, cy };
  }

  function applyBloomWorldFromCageRel(/** @type {NonNullable<typeof floatingCageStrike>} */ C, bloom) {
    const ctr = getFloatingCageCenterWorldXY();
    if (!ctr || !Number.isFinite(C.cageBossRelX) || !Number.isFinite(C.cageBossRelY)) return;
    bloom.x = ctr.cx + C.cageBossRelX;
    bloom.y = ctr.cy + C.cageBossRelY;
  }

  function beginP2ToP3Interlude(simElapsed) {
    floatingCageStrike = null;
    p2SwarmStrike = null;
    p2TriplicateStrike = null;
    tentacleHitSim = 0;
    tentacleLastK = -1;
    homingOrbStrike = null;
    lightningStrike = null;
    eldritchBarrageStrike = null;
    clearBloomScriptedTelegraph();
    p2P3ReturnAnchored = false;
    macroPhase = 4;
    p2Mode = "idle";
    const bloom = getBloomHunter();
    if (bloom) {
      bloom.depthsEldritchP2P3InterludeStartSim = simElapsed;
      bloom.depthsEldritchP2P3InterludeUntil = simElapsed + ELDRITCH_BLOOD_P2_TO_P3_INTERLUDE_SEC;
      bloom.depthsEldritchP2P3AnchorX = bloom.x;
      bloom.depthsEldritchP2P3AnchorY = bloom.y;
      bloom.depthsBetweenPhasesUntil = 0;
      bloom.depthsBetweenPhasesStartSim = 0;
      bloom.depthsEldritchPhase3Tone = false;
      bloom.depthsEldritchPhase2Tone = false;
      bloom.depthsEldritchP2P3ScriptedOpacity = 1;
      bloom.depthsEldritchP2P3StormAmbientActive = false;
      bloom.depthsEldritchP2P3StormPushBurstActive = false;
      bloom.depthsEldritchP2P3StormBurstStartSim = 0;
      bloom.depthsEldritchP2P3ReturnFromX = 0;
      bloom.depthsEldritchP2P3ReturnFromY = 0;
      bloom.depthsEldritchP2P3InterludeScripted = true;
      bloom.depthsEldritchOrbStrikeChanneling = false;
      bloom.depthsCastLiftActive = false;
      bloom.depthsEldritchTelegraphHoldUntil = 0;
      bloom.depthsEldritchLightningCastActive = false;
      bloom.depthsEldritchBarrageAttackActive = false;
      bloom.depthsEldritchCageStrikeActive = false;
      bloom.depthsEldritchPostCageScripted = false;
      bloom.depthsEldritchPostCageLightningSprite = false;
      bloom.depthsEldritchTriplicateScripted = false;
      bloom.depthsEldritchDashTrail = null;
      bloom.depthsPostCageLightningContactUntil = 0;
      clearBloomLiftPrepFields(bloom);
    }
  }

  function finishP2ToP3Interlude(simElapsed) {
    const bloom = getBloomHunter();
    const waveY = getDepthsBossRisingWaveFrontY?.() ?? null;
    const player = getPlayer();
    p2P3ReturnAnchored = false;
    if (bloom) {
      bloom.depthsEldritchP2P3InterludeUntil = 0;
      bloom.depthsEldritchP2P3InterludeStartSim = 0;
      bloom.depthsEldritchP2P3InterludeScripted = false;
      bloom.depthsEldritchP2P3AnchorX = 0;
      bloom.depthsEldritchP2P3AnchorY = 0;
      bloom.depthsEldritchP2P3ScriptedOpacity = 1;
      bloom.depthsEldritchP2P3StormAmbientActive = false;
      bloom.depthsEldritchP2P3StormPushBurstActive = false;
      bloom.depthsEldritchP2P3StormBurstStartSim = 0;
      bloom.depthsEldritchP2P3ReturnFromX = 0;
      bloom.depthsEldritchP2P3ReturnFromY = 0;
      bloom.depthsEldritchPhase2Tone = false;
      bloom.depthsEldritchPhase3Tone = true;
      if (waveY != null && Number.isFinite(waveY)) {
        bloom.y = waveY - ELDRITCH_BLOOD_CAST_ABOVE_WAVE_PX;
      }
      const leashX = 480;
      bloom.x = clamp(bloom.x, player.x - leashX, player.x + leashX);
    }
    macroPhase = 5;
    p3PhaseEnterSim = simElapsed;
  }

  function tickP2P3Interlude(_dt) {
    const sim = getSimElapsed();
    const bloom = getBloomHunter();
    const player = getPlayer();
    if (!bloom) {
      macroPhase = 5;
      p3PhaseEnterSim = sim;
      return;
    }
    const t0 = Number(bloom.depthsEldritchP2P3InterludeStartSim ?? 0);
    const until = Number(bloom.depthsEldritchP2P3InterludeUntil ?? 0);
    if (t0 <= 0 || until <= t0) {
      finishP2ToP3Interlude(sim);
      return;
    }
    const rel = sim - t0;
    if (rel >= ELDRITCH_BLOOD_P2_TO_P3_INTERLUDE_SEC) {
      finishP2ToP3Interlude(sim);
      return;
    }

    const ax = Number(bloom.depthsEldritchP2P3AnchorX);
    const ay = Number(bloom.depthsEldritchP2P3AnchorY);
    const waveY = getDepthsBossRisingWaveFrontY?.() ?? null;
    const b = getWorldDrawBounds();
    const midX = Number.isFinite(b.x0) && Number.isFinite(b.x1) ? (b.x0 + b.x1) * 0.5 : player.x;
    const capY = waveY != null && Number.isFinite(waveY) ? waveY - ELDRITCH_BLOOD_CAST_ABOVE_WAVE_PX : ay - 120;
    const hideY = waveY != null && Number.isFinite(waveY) ? waveY + 240 : b.y1 + 260;

    const smooth = (a, b, u) => a + (b - a) * (u * u * (3 - 2 * u));

    const tFade = ELDRITCH_BLOOD_P2P3_FADE_OUT_SEC;
    const tStormEnd = tFade + ELDRITCH_BLOOD_P2P3_STORM_AMBIENT_SEC;

    bloom.depthsEldritchP2P3StormAmbientActive = false;
    bloom.depthsEldritchP2P3StormPushBurstActive = false;

    if (rel < tFade) {
      const u = clamp(rel / Math.max(1e-4, tFade), 0, 1);
      const e = u * u * (3 - 2 * u);
      bloom.depthsEldritchP2P3ScriptedOpacity = 1 - e;
      bloom.x = ax;
      bloom.y = ay;
    } else if (rel < tStormEnd) {
      bloom.depthsEldritchP2P3ScriptedOpacity = 0;
      bloom.depthsEldritchP2P3StormAmbientActive = true;
      bloom.depthsEldritchP2P3StormPushBurstActive = true;
      if ((Number(bloom.depthsEldritchP2P3StormBurstStartSim) || 0) <= 0) {
        bloom.depthsEldritchP2P3StormBurstStartSim = t0 + tFade;
      }
      bloom.x = midX;
      bloom.y = hideY;
    } else {
      const u = clamp((rel - tStormEnd) / Math.max(1e-4, ELDRITCH_BLOOD_P2P3_RETURN_DRIFT_SEC), 0, 1);
      const e = u * u * (3 - 2 * u);
      bloom.depthsEldritchP2P3ScriptedOpacity = e;
      if (!p2P3ReturnAnchored) {
        p2P3ReturnAnchored = true;
        bloom.depthsEldritchP2P3ReturnFromX = midX;
        bloom.depthsEldritchP2P3ReturnFromY = b.y1 + 200;
      }
      const fx = Number(bloom.depthsEldritchP2P3ReturnFromX);
      const fy = Number(bloom.depthsEldritchP2P3ReturnFromY);
      const tx = clamp(player.x, fx - 200, fx + 200);
      bloom.x = smooth(fx, tx, e);
      bloom.y = smooth(fy, capY, e);
    }

    bloom.dir.x = bloom.x < player.x ? -1 : 1;
    bloom.dir.y = -0.35;
    const dlen = Math.hypot(bloom.dir.x, bloom.dir.y) || 1;
    bloom.dir.x /= dlen;
    bloom.dir.y /= dlen;
  }

  function scheduleP2GapFromSpellEnd(simElapsed) {
    if (simElapsed - p2PhaseEnterSim >= ELDRITCH_BLOOD_PHASE2_DURATION_SEC) {
      beginP2ToP3Interlude(simElapsed);
      return;
    }
    p2Mode = "gap";
    p2NextAttackSim =
      simElapsed +
      randRange(ELDRITCH_BLOOD_ATTACK_COOLDOWN_LO_SEC, ELDRITCH_BLOOD_ATTACK_COOLDOWN_HI_SEC + 1e-6);
  }

  function finishFloatingCageStrike(simElapsed) {
    floatingCageStrike = null;
    const bloom = getBloomHunter();
    if (bloom) {
      bloom.depthsEldritchCageStrikeActive = false;
      bloom.depthsEldritchOrbStrikeChanneling = false;
      bloom.depthsCastLiftActive = false;
      bloom.depthsEldritchTelegraphHoldUntil = 0;
      bloom.depthsEldritchLightningCastActive = false;
      bloom.depthsEldritchPostCageScripted = false;
      bloom.depthsEldritchPostCageLightningSprite = false;
      bloom.depthsEldritchDashTrail = null;
      bloom.depthsPostCageLightningContactUntil = 0;
      clearBloomLiftPrepFields(bloom);
    }
    scheduleP2GapFromSpellEnd(simElapsed);
    p2StrikeIndex = (p2StrikeIndex + 1) % 3;
  }

  function setupPostCageDashSegmentForRound(
    /** @type {NonNullable<typeof floatingCageStrike>} */ C,
    bloom,
    player,
  ) {
    const ctr = getFloatingCageCenterWorldXY();
    if (!ctr) return false;
    const R = FLOATING_CAGE_RADIUS_PX;
    const out = outsideRingBossPoint(ctr.cx, ctr.cy, bloom.x, bloom.y, R, POST_CAGE_OUTSIDE_PAD_PX);
    C.dashSegRelX0 = out.x - ctr.cx;
    C.dashSegRelY0 = out.y - ctr.cy;
    C.dashLockRelX = player.x - ctr.cx;
    C.dashLockRelY = player.y - ctr.cy;
    const vx = C.dashLockRelX - C.dashSegRelX0;
    const vy = C.dashLockRelY - C.dashSegRelY0;
    const vlen = Math.hypot(vx, vy) || 1;
    const ux = vx / vlen;
    const uy = vy / vlen;
    const pad = POST_CAGE_OUTSIDE_PAD_PX;
    const targetR = R + pad;
    const targetRsq = targetR * targetR;
    const x0 = C.dashSegRelX0;
    const y0 = C.dashSegRelY0;
    let tEnd = largestRayCircleHitT(x0, y0, ux, uy, targetRsq, 1e-2);
    if (tEnd == null || !Number.isFinite(tEnd)) {
      const dot0 = x0 * ux + y0 * uy;
      tEnd = -2 * dot0;
      if (!(tEnd > 1e-2)) tEnd = Math.max(vlen * 0.55 + R * 0.35, targetR * 0.35);
    }
    C.dashSegRelX1 = x0 + ux * tEnd;
    C.dashSegRelY1 = y0 + uy * tEnd;
    C.postDashDamageDealt = false;
    C.cageBossRelX = C.dashSegRelX0;
    C.cageBossRelY = C.dashSegRelY0;
    bloom.dir.x = ux;
    bloom.dir.y = uy;
    bloom.depthsEldritchDashTrail = [];
    applyBloomWorldFromCageRel(C, bloom);
    return true;
  }

  function tickPostCageLightningBallPlayerContact(bloom, player, simElapsed) {
    if (!bloom?.depthsEldritchPostCageLightningSprite) return;
    const lockUntil = Number(bloom.depthsPostCageLightningContactUntil ?? 0);
    if (simElapsed < lockUntil) return;
    const pr = Number(player.r) || PLAYER_RADIUS;
    const br = Number(bloom.r) || 36;
    const touchR = br * 1.08 + pr;
    const dx = player.x - bloom.x;
    const dy = player.y - bloom.y;
    if (dx * dx + dy * dy > touchR * touchR) return;
    bloom.depthsPostCageLightningContactUntil = simElapsed + POST_CAGE_LIGHTNING_TOUCH_COOLDOWN_SEC;
    damagePlayerThroughPath(2, {
      sourceX: bloom.x,
      sourceY: bloom.y,
      eldritchBloodAttack: "postCageLightningTouch",
    });
    bumpScreenShake(POST_CAGE_LIGHTNING_TOUCH_SHAKE, POST_CAGE_LIGHTNING_TOUCH_SHAKE_SEC);
    onPostCageLightningBallPlayerHit?.({ playerX: player.x, playerY: player.y });
  }

  function beginFloatingCageStrike(bloom) {
    const sim = getSimElapsed();
    const player = getPlayer();
    clearBloomLiftPrepFields(bloom);
    bloom.depthsEldritchLightningCastActive = false;
    bloom.depthsEldritchBarrageAttackActive = false;
    bloom.depthsCastLiftActive = true;
    bloom.depthsEldritchOrbStrikeChanneling = true;
    bloom.depthsEldritchCageStrikeActive = true;
    bloom.depthsEldritchTelegraphHoldUntil = sim + 18;
    p2Mode = "gap";
    const flankSign = /** @type {1 | -1} */ (bloom.x < player.x ? -1 : 1);
    floatingCageStrike = {
      phase: "dash",
      phaseStartSim: sim,
      flankSign,
      dashVx: 0,
      dashVy: 0,
      cageCx: 0,
      cageYOffsetFromWave: 0,
      cageWaveFY: getDepthsBossRisingWaveFrontY?.() ?? player.y,
      lastSyncedCy: player.y,
      cageBossRelX: 0,
      cageBossRelY: 0,
    };
  }

  function tickFloatingCageStrike(dt) {
    const sim = getSimElapsed();
    const bloom = getBloomHunter();
    const player = getPlayer();
    const rt = getHunterRuntime();
    const C = floatingCageStrike;
    if (!C) return;
    if (!bloom || !rt) {
      floatingCageStrike = null;
      clearBloomScriptedTelegraph();
      return;
    }

    if (C.phase === "dash") {
      const tx = player.x + C.flankSign * BARRAGE_FLANK_OFFSET_X;
      const ty = clampBloomYForBarrage(bloom, player.y);
      const ddx = tx - bloom.x;
      const ddy = ty - bloom.y;
      const dist = Math.hypot(ddx, ddy) || 1;
      C.dashVx += (ddx / dist) * BARRAGE_DASH_ACCEL * dt;
      C.dashVy += (ddy / dist) * BARRAGE_DASH_ACCEL * dt;
      let sp = Math.hypot(C.dashVx, C.dashVy);
      if (sp > BARRAGE_DASH_MAX_SPEED) {
        const s = BARRAGE_DASH_MAX_SPEED / sp;
        C.dashVx *= s;
        C.dashVy *= s;
      }
      bloom.x += C.dashVx * dt;
      bloom.y += C.dashVy * dt;
      bloom.y = clampBloomYForBarrage(bloom, bloom.y);

      const arrived = Math.hypot(tx - bloom.x, ty - bloom.y) < 30 || sim - C.phaseStartSim >= FLOATING_CAGE_DASH_ALIGN_MAX_SEC;
      if (!arrived) return;

      bloom.x = tx;
      bloom.y = ty;
      const fySnap = getDepthsBossRisingWaveFrontY?.() ?? player.y;
      C.cageCx = player.x;
      C.cageYOffsetFromWave = player.y - fySnap;
      C.cageWaveFY = fySnap;
      C.phase = "caged";
      C.phaseStartSim = sim;
      C.dashVx = 0;
      C.dashVy = 0;
      C.lastSyncedCy = player.y;
      const cySnap = fySnap + C.cageYOffsetFromWave;
      C.cageBossRelX = bloom.x - C.cageCx;
      C.cageBossRelY = bloom.y - cySnap;
      bloom.depthsEldritchTelegraphHoldUntil = sim + 24;
      return;
    }

    if (FLOATING_CAGE_INTERIOR_PHASES.has(C.phase)) {
      applyBloomWorldFromCageRel(C, bloom);
    }

    if (C.phase === "caged") {
      const age = sim - C.phaseStartSim;
      if (age >= FLOATING_CAGE_APPEAR_HOLD_SEC) {
        const ctr = getFloatingCageCenterWorldXY();
        if (!ctr || !Number.isFinite(bloom.x)) {
          finishFloatingCageStrike(sim);
          return;
        }
        const out = outsideRingBossPoint(
          ctr.cx,
          ctr.cy,
          bloom.x,
          bloom.y,
          FLOATING_CAGE_RADIUS_PX,
          POST_CAGE_OUTSIDE_PAD_PX,
        );
        C.postFloatOriginRelX = C.cageBossRelX;
        C.postFloatOriginRelY = C.cageBossRelY;
        C.postFloatTargetRelX = out.x - ctr.cx;
        C.postFloatTargetRelY = out.y - ctr.cy;
        C.phase = "postBossFloat";
        C.phaseStartSim = sim;
        bloom.depthsEldritchPostCageScripted = true;
      }
      return;
    }

    if (C.phase === "postBossFloat") {
      const ox = Number(C.postFloatOriginRelX);
      const oy = Number(C.postFloatOriginRelY);
      const tx = Number(C.postFloatTargetRelX);
      const ty = Number(C.postFloatTargetRelY);
      const age = sim - C.phaseStartSim;
      const u = clamp(age / Math.max(1e-4, POST_CAGE_FLOAT_SEC), 0, 1);
      const e = u * u * (3 - 2 * u);
      if (Number.isFinite(ox) && Number.isFinite(oy) && Number.isFinite(tx) && Number.isFinite(ty)) {
        C.cageBossRelX = ox + (tx - ox) * e;
        C.cageBossRelY = oy + (ty - oy) * e;
        applyBloomWorldFromCageRel(C, bloom);
      }
      if (age >= POST_CAGE_FLOAT_SEC) {
        C.phase = "postLightningFlash";
        C.phaseStartSim = sim;
        bumpScreenShake(52, 0.58);
      }
      return;
    }

    if (C.phase === "postLightningFlash") {
      if (sim - C.phaseStartSim >= LIGHTNING_STRIKE_FLASH_SEC) {
        C.phase = "postLightningForm";
        C.phaseStartSim = sim;
        bloom.depthsEldritchCageStrikeActive = false;
        bloom.depthsEldritchLightningCastActive = true;
        bloom.depthsEldritchPostCageLightningSprite = true;
      }
      return;
    }

    if (C.phase === "postLightningForm") {
      if (sim - C.phaseStartSim >= POST_CAGE_LIGHTNING_FORM_SEC) {
        C.postDashRound = 0;
        C.phase = "postDashTelegraph";
        C.phaseStartSim = sim;
        if (!setupPostCageDashSegmentForRound(C, bloom, player)) finishFloatingCageStrike(sim);
      }
      tickPostCageLightningBallPlayerContact(bloom, player, sim);
      return;
    }

    if (C.phase === "postDashTelegraph") {
      if (sim - C.phaseStartSim >= POST_CAGE_DASH_TELEGRAPH_SEC) {
        C.phase = "postDashMove";
        C.phaseStartSim = sim;
        bumpScreenShake(12, 0.16);
      }
      tickPostCageLightningBallPlayerContact(bloom, player, sim);
      return;
    }

    if (C.phase === "postDashMove") {
      const rx0 = Number(C.dashSegRelX0);
      const ry0 = Number(C.dashSegRelY0);
      const rx1 = Number(C.dashSegRelX1);
      const ry1 = Number(C.dashSegRelY1);
      const age = sim - C.phaseStartSim;
      const u = clamp(age / Math.max(1e-4, POST_CAGE_DASH_MOVE_SEC), 0, 1);
      const e = u * u * (3 - 2 * u);
      C.cageBossRelX = rx0 + (rx1 - rx0) * e;
      C.cageBossRelY = ry0 + (ry1 - ry0) * e;
      applyBloomWorldFromCageRel(C, bloom);
      const ctrHit = getFloatingCageCenterWorldXY();
      if (!Array.isArray(bloom.depthsEldritchDashTrail)) bloom.depthsEldritchDashTrail = [];
      bloom.depthsEldritchDashTrail.push({ x: bloom.x, y: bloom.y, t: sim });
      while (bloom.depthsEldritchDashTrail.length > 20) bloom.depthsEldritchDashTrail.shift();

      if (!C.postDashDamageDealt && ctrHit) {
        const pr = Number(player.r) || PLAYER_RADIUS;
        const x0 = ctrHit.cx + rx0;
        const y0 = ctrHit.cy + ry0;
        const x1 = ctrHit.cx + rx1;
        const y1 = ctrHit.cy + ry1;
        const dHit = pointToSegmentDistance(player.x, player.y, x0, y0, x1, y1);
        if (dHit <= POST_CAGE_DASH_HIT_HW_PX + pr) {
          C.postDashDamageDealt = true;
          damagePlayerThroughPath(3, {
            sourceX: bloom.x,
            sourceY: bloom.y,
            eldritchBloodAttack: "floatingCageDash",
          });
        }
      }

      if (age >= POST_CAGE_DASH_MOVE_SEC) {
        C.cageBossRelX = rx1;
        C.cageBossRelY = ry1;
        applyBloomWorldFromCageRel(C, bloom);
        C.phase = "postDashPause";
        C.phaseStartSim = sim;
      }
      tickPostCageLightningBallPlayerContact(bloom, player, sim);
      return;
    }

    if (C.phase === "postDashPause") {
      if (sim - C.phaseStartSim >= POST_CAGE_DASH_PAUSE_SEC) {
        const r = (C.postDashRound ?? 0) + 1;
        if (r >= 3) {
          bloom.depthsEldritchPostCageLightningSprite = false;
          bloom.depthsEldritchLightningCastActive = false;
          bloom.depthsEldritchPostCageScripted = false;
          bloom.depthsEldritchDashTrail = null;
          bloom.depthsPostCageLightningContactUntil = 0;
          finishFloatingCageStrike(sim);
          return;
        }
        C.postDashRound = r;
        C.phase = "postDashTelegraph";
        C.phaseStartSim = sim;
        if (!setupPostCageDashSegmentForRound(C, bloom, player)) finishFloatingCageStrike(sim);
      }
      tickPostCageLightningBallPlayerContact(bloom, player, sim);
      return;
    }
  }

  function applyFloatingCageRisingWaveCarryBeforePlayerMove() {
    const C = floatingCageStrike;
    if (!C || !FLOATING_CAGE_INTERIOR_PHASES.has(C.phase)) return;
    const fy = getDepthsBossRisingWaveFrontY?.() ?? null;
    if (fy == null || !Number.isFinite(fy)) return;
    const prevFy = C.cageWaveFY;
    const dfy = fy - prevFy;
    C.cageWaveFY = fy;
    if (Math.abs(dfy) < 1e-8) return;
    const ctr = getFloatingCageCenterWorldXY();
    if (!ctr) return;
    const p = getPlayer();
    const pr = Number(p.r) || PLAYER_RADIUS;
    const dx = p.x - ctr.cx;
    const dy = p.y - ctr.cy;
    const maxRide = FLOATING_CAGE_RADIUS_PX - pr * 0.99;
    if (maxRide > 0 && Math.hypot(dx, dy) <= maxRide) {
      p.y += dfy;
    }
  }

  /** While active, player collision uses no obstacle rects (see `entry.js` `obstaclesForPlayerCollision`). */
  function isFloatingCageTerrainCollisionSuppressedNow() {
    const C = floatingCageStrike;
    return !!(C && FLOATING_CAGE_INTERIOR_PHASES.has(C.phase));
  }

  function clampPlayerToFloatingCage() {
    const C = floatingCageStrike;
    if (!C || !FLOATING_CAGE_INTERIOR_PHASES.has(C.phase)) return;
    const ctr = getFloatingCageCenterWorldXY();
    if (!ctr) return;
    const p = getPlayer();
    const pr = Number(p.r) || PLAYER_RADIUS;
    const maxDist = FLOATING_CAGE_RADIUS_PX - pr;
    if (!(maxDist > 1)) return;
    let dx = p.x - ctr.cx;
    let dy = p.y - ctr.cy;
    const d = Math.hypot(dx, dy) || 1;
    if (d <= maxDist) return;
    const s = maxDist / d;
    p.x = ctr.cx + dx * s;
    p.y = ctr.cy + dy * s;
  }

  function beginLightningStrike(bloom) {
    const sim = getSimElapsed();
    clearBloomLiftPrepFields(bloom);
    bloom.depthsEldritchBarrageAttackActive = false;
    bloom.depthsCastLiftActive = true;
    bloom.depthsEldritchOrbStrikeChanneling = true;
    bloom.depthsEldritchLightningCastActive = true;
    const dx = Number(bloom.dir?.x ?? 1);
    const dy = Number(bloom.dir?.y ?? -0.5);
    const dlen = Math.hypot(dx, dy) || 1;
    bloom._eldritchMvX = dx / dlen;
    bloom._eldritchMvY = dy / dlen;
    const seqDur =
      LIGHTNING_VOLLEY_COUNT * (LIGHTNING_TELEGRAPH_TO_STRIKE_SEC + LIGHTNING_STRIKE_FLASH_SEC) +
      (LIGHTNING_VOLLEY_COUNT - 1) * LIGHTNING_BETWEEN_VOLLEY_SEC +
      0.35;
    bloom.depthsEldritchTelegraphHoldUntil = sim + seqDur;
    p1Mode = "strike";
    const player = getPlayer();
    lightningStrike = {
      volleyIndex: 0,
      phase: "telegraph",
      phaseStartSim: sim,
      strikeSim: sim + LIGHTNING_TELEGRAPH_TO_STRIKE_SEC,
      columns: columnsForLightningVolley(0, player),
      dealtDamage: false,
    };
  }

  function tickLightningStrike(dt) {
    const sim = getSimElapsed();
    const player = getPlayer();
    const L = lightningStrike;
    if (!L) return;
    if (!getBloomHunter()) {
      lightningStrike = null;
      clearBloomScriptedTelegraph();
      return;
    }

    if (L.phase === "telegraph" && sim >= L.strikeSim) {
      let strikeShakeStrength = 32;
      let strikeShakeSec = 0.5;
      if (!L.dealtDamage && !getRunDead()) {
        const hw = LIGHTNING_COLUMN_HIT_HW;
        let hitCx = L.columns[0];
        let any = false;
        for (const cx of L.columns) {
          if (Math.abs(player.x - cx) <= hw + player.r * 0.95) {
            any = true;
            hitCx = cx;
            break;
          }
        }
        if (any) {
          damagePlayerThroughPath(2, {
            sourceX: hitCx,
            sourceY: player.y,
            eldritchBloodAttack: "lightningColumn",
          });
          onLightningColumnPlayerHit?.({
            columnX: hitCx,
            playerX: player.x,
            playerY: player.y,
          });
          strikeShakeStrength = 54;
          strikeShakeSec = 0.72;
        } else {
          strikeShakeStrength = 22;
          strikeShakeSec = 0.36;
        }
      }
      L.dealtDamage = true;
      bumpScreenShake(strikeShakeStrength, strikeShakeSec);
      L.phase = "strikeFlash";
      L.phaseStartSim = sim;
    } else if (L.phase === "strikeFlash" && sim - L.phaseStartSim >= LIGHTNING_STRIKE_FLASH_SEC) {
      L.volleyIndex += 1;
      if (L.volleyIndex >= LIGHTNING_VOLLEY_COUNT) {
        finishLightningBeatToGap(sim);
        return;
      }
      L.phase = "between";
      L.phaseStartSim = sim;
    } else if (L.phase === "between" && sim - L.phaseStartSim >= LIGHTNING_BETWEEN_VOLLEY_SEC) {
      L.columns = columnsForLightningVolley(L.volleyIndex, player);
      L.phase = "telegraph";
      L.phaseStartSim = sim;
      L.strikeSim = sim + LIGHTNING_TELEGRAPH_TO_STRIKE_SEC;
      L.dealtDamage = false;
    }
  }

  function resolveHomingOrbStrike(ox, oy) {
    homingOrbStrike = null;
    const sim = getSimElapsed();
    const bloom = getBloomHunter();
    if (bloom) {
      bloom.depthsEldritchOrbStrikeChanneling = false;
      const dx = Number(bloom.dir?.x ?? 1);
      const dy = Number(bloom.dir?.y ?? -0.5);
      const dlen = Math.hypot(dx, dy) || 1;
      bloom._eldritchMvX = dx / dlen;
      bloom._eldritchMvY = dy / dlen;
      /** Stay frozen through tentacle spawn window so float AI + cast clamp never snap the frame the orb hits. */
      bloom.depthsEldritchTelegraphHoldUntil =
        sim +
        tentacleBurstPauseSec +
        Math.max(0, p1TentacleBurstCount - 1) * tentacleBurstIntervalSec +
        0.55;
    }
    if (!getRunDead()) {
      damagePlayerThroughPath(1, {
        sourceX: ox,
        sourceY: oy,
        eldritchBloodAttack: "homingOrb",
      });
    }
    bumpScreenShake(19, 0.35);
    tentacleHitSim = sim;
    tentacleLastK = -1;
    p1Mode = "tentacles";
  }

  function tickTentacleRain() {
    if (!isDepthsBossFightLevel() || !getHunterRuntime() || !getHuntersEnabled()) return;
    if (!(tentacleHitSim > 0)) return;
    if (tentacleLastK + 1 >= p1TentacleBurstCount) return;

    const simElapsed = getSimElapsed();
    const burstStart = tentacleHitSim + tentacleBurstPauseSec;
    if (simElapsed < burstStart) return;
    const rt = getHunterRuntime();
    if (!rt) return;
    const player = getPlayer();
    while (tentacleLastK + 1 < p1TentacleBurstCount) {
      const nextK = tentacleLastK + 1;
      if (simElapsed < burstStart + nextK * tentacleBurstIntervalSec) break;
      const ang = Math.random() * Math.PI * 2;
      const rOff =
        tentacleSpawnRadiusPx *
        (0.92 + hash01(nextK * 17 + 8803 + Math.floor(tentacleHitSim * 1000)) * 0.16);
      rt.spawnHunter("depthsTentacle", player.x + Math.cos(ang) * rOff, player.y + Math.sin(ang) * rOff, {});
      tentacleLastK = nextK;
    }

    if (tentacleLastK + 1 >= p1TentacleBurstCount) {
      tentacleHitSim = 0;
      tentacleLastK = -1;
      const bloomDone = getBloomHunter();
      if (bloomDone) {
        bloomDone.depthsCastLiftActive = false;
        bloomDone.depthsEldritchTelegraphHoldUntil = 0;
        bloomDone.depthsEldritchOrbStrikeChanneling = false;
        clearBloomLiftPrepFields(bloomDone);
      }
      scheduleP1GapFromSpellEnd(simElapsed);
    }
  }

  function beginHomingOrbStrike(bloom) {
    const simElapsed = getSimElapsed();
    clearBloomLiftPrepFields(bloom);
    bloom.depthsEldritchBarrageAttackActive = false;
    bloom.depthsEldritchLightningCastActive = false;
    bloom.depthsCastLiftActive = true;
    bloom.depthsEldritchOrbStrikeChanneling = true;
    const dx = Number(bloom.dir?.x ?? 1);
    const dy = Number(bloom.dir?.y ?? -0.5);
    const dlen = Math.hypot(dx, dy) || 1;
    bloom._eldritchMvX = dx / dlen;
    bloom._eldritchMvY = dy / dlen;
    const flightAt = simElapsed + ORB_CHARGE_SEC;
    homingOrbStrike = {
      phase: "charge",
      x: bloom.x,
      y: bloom.y,
      vx: 0,
      vy: 0,
      chargeStartSim: simElapsed,
      flightStartSim: flightAt,
      arcSide: 1,
    };
    bloom.depthsEldritchTelegraphHoldUntil = flightAt;
    p1Mode = "strike";
  }

  function tickHomingOrbStrike(dt) {
    const simElapsed = getSimElapsed();
    const player = getPlayer();
    const bloom = getBloomHunter();
    if (!homingOrbStrike) return;

    const o = homingOrbStrike;
    if (o.phase === "charge") {
      if (!bloom) {
        homingOrbStrike = null;
        clearBloomScriptedTelegraph();
        return;
      }
      o.x = bloom.x;
      o.y = bloom.y;
      bloom.depthsEldritchTelegraphHoldUntil = o.flightStartSim;
      if (simElapsed < o.flightStartSim) return;
      o.phase = "flight";
      let dx = player.x - o.x;
      let dy = player.y - o.y;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const perpX = -dy;
      const perpY = dx;
      p1OrbArcToggle = !p1OrbArcToggle;
      o.arcSide = p1OrbArcToggle ? 1 : -1;
      const b = ORB_FLIGHT_CURVE_BIAS;
      let ivx = dx * (1 - b) + perpX * b * o.arcSide;
      let ivy = dy * (1 - b) + perpY * b * o.arcSide;
      const il = Math.hypot(ivx, ivy) || 1;
      o.vx = (ivx / il) * ORB_LAUNCH_SPEED;
      o.vy = (ivy / il) * ORB_LAUNCH_SPEED;
    }

    const of = homingOrbStrike;
    if (!of || of.phase !== "flight") return;
    let dx = player.x - of.x;
    let dy = player.y - of.y;
    const dist = Math.hypot(dx, dy) || 1;
    const desiredX = dx / dist;
    const desiredY = dy / dist;

    let spd = Math.hypot(of.vx, of.vy);
    if (spd < 1e-3) {
      of.vx = desiredX * ORB_LAUNCH_SPEED;
      of.vy = desiredY * ORB_LAUNCH_SPEED;
      spd = ORB_LAUNCH_SPEED;
    }
    let hx = of.vx / spd;
    let hy = of.vy / spd;
    const dot = clamp(hx * desiredX + hy * desiredY, -1, 1);
    const crossZ = hx * desiredY - hy * desiredX;
    const angle = Math.atan2(crossZ, dot);
    const close01 = clamp(1 - dist / ORB_CLOSE_DIST_PX, 0, 1);
    const maxTurn = ORB_MAX_TURN_RAD_PER_SEC * (1 + close01 * (ORB_CLOSE_TURN_MULT - 1)) * dt;
    const step = clamp(angle, -maxTurn, maxTurn);
    const hAng = Math.atan2(hy, hx);
    const nAng = hAng + step;
    const newSpd = Math.min(ORB_MAX_SPEED, spd + ORB_SPEED_RAMP * dt);
    of.vx = Math.cos(nAng) * newSpd;
    of.vy = Math.sin(nAng) * newSpd;
    of.x += of.vx * dt;
    of.y += of.vy * dt;

    const flightAge = simElapsed - of.flightStartSim;
    const hit = Math.hypot(player.x - of.x, player.y - of.y) <= ORB_HIT_DIST;
    if (hit || flightAge >= ORB_MAX_FLIGHT_SEC) {
      const hx = hit ? of.x : player.x;
      const hy = hit ? of.y : player.y;
      resolveHomingOrbStrike(hx, hy);
    }
  }

  function clampBloomYForBarrage(bloom, y) {
    const wy = getDepthsBossRisingWaveFrontY?.() ?? null;
    if (wy != null && Number.isFinite(wy)) {
      return Math.min(y, wy - ELDRITCH_BLOOD_CAST_ABOVE_WAVE_PX);
    }
    return y;
  }

  function finishBarrageStrike(simElapsed) {
    eldritchBarrageStrike = null;
    const bloom = getBloomHunter();
    if (bloom) {
      bloom.depthsEldritchBarrageAttackActive = false;
      bloom.depthsEldritchOrbStrikeChanneling = false;
      bloom.depthsEldritchTelegraphHoldUntil = 0;
      bloom.depthsCastLiftActive = false;
      bloom.depthsEldritchLightningCastActive = false;
      bloom.depthsEldritchTeleportFxUntil = 0;
      bloom.depthsEldritchTeleportGhostX = 0;
      bloom.depthsEldritchTeleportGhostY = 0;
      clearBloomLiftPrepFields(bloom);
    }
    scheduleP1GapFromSpellEnd(simElapsed);
  }

  function beginBarrageStrike(bloom) {
    const sim = getSimElapsed();
    const player = getPlayer();
    clearBloomLiftPrepFields(bloom);
    bloom.depthsEldritchLightningCastActive = false;
    bloom.depthsCastLiftActive = true;
    bloom.depthsEldritchOrbStrikeChanneling = true;
    bloom.depthsEldritchBarrageAttackActive = true;
    bloom.depthsEldritchTelegraphHoldUntil = sim + 14;
    const initialFlank = /** @type {1 | -1} */ (bloom.x < player.x ? -1 : 1);
    eldritchBarrageStrike = {
      phase: "dash",
      phaseStartSim: sim,
      volleyIndex: 0,
      initialFlankSign: initialFlank,
      dashVx: 0,
      dashVy: 0,
      volleySpawned: 0,
      teleportSwapped: false,
    };
    p1Mode = "strike";
  }

  function tickBarrageStrike(dt) {
    const sim = getSimElapsed();
    const bloom = getBloomHunter();
    const player = getPlayer();
    const rt = getHunterRuntime();
    const B = eldritchBarrageStrike;
    if (!B) return;
    if (!bloom || !rt) {
      eldritchBarrageStrike = null;
      clearBloomScriptedTelegraph();
      return;
    }

    const flankSignForVolley = (vi) => B.initialFlankSign * (vi % 2 === 0 ? 1 : -1);
    const targetForVolley = (vi) => {
      const fs = flankSignForVolley(vi);
      return {
        tx: player.x + fs * BARRAGE_FLANK_OFFSET_X,
        ty: clampBloomYForBarrage(bloom, player.y),
      };
    };

    if (B.phase === "dash") {
      const { tx, ty } = targetForVolley(0);
      const ddx = tx - bloom.x;
      const ddy = ty - bloom.y;
      const dist = Math.hypot(ddx, ddy) || 1;
      B.dashVx += (ddx / dist) * BARRAGE_DASH_ACCEL * dt;
      B.dashVy += (ddy / dist) * BARRAGE_DASH_ACCEL * dt;
      const sp = Math.hypot(B.dashVx, B.dashVy);
      if (sp > BARRAGE_DASH_MAX_SPEED) {
        const s = BARRAGE_DASH_MAX_SPEED / sp;
        B.dashVx *= s;
        B.dashVy *= s;
      }
      bloom.x += B.dashVx * dt;
      bloom.y += B.dashVy * dt;
      bloom.y = clampBloomYForBarrage(bloom, bloom.y);
      if (Math.hypot(tx - bloom.x, ty - bloom.y) < 28 || sim - B.phaseStartSim >= BARRAGE_DASH_MAX_SEC) {
        bloom.x = tx;
        bloom.y = ty;
        B.phase = "volley";
        B.phaseStartSim = sim;
        B.volleyIndex = 0;
        B.volleySpawned = 0;
        B.dashVx = 0;
        B.dashVy = 0;
      }
      return;
    }

    if (B.phase === "volley") {
      const tRel = sim - B.phaseStartSim;
      while (B.volleySpawned < BARRAGE_PROJECTILE_COUNT) {
        const nextT = (B.volleySpawned / BARRAGE_PROJECTILE_COUNT) * BARRAGE_SPAWN_WINDOW_SEC;
        if (tRel + 1e-4 < nextT) break;
        const ang =
          (B.volleySpawned / BARRAGE_PROJECTILE_COUNT) * Math.PI * 2 + randRange(-0.09, 0.09);
        const spd = randRange(BARRAGE_PROJECTILE_SPEED_LO, BARRAGE_PROJECTILE_SPEED_HI + 1e-6);
        rt.spawnHunter("depthsEldritchBarrageBolt", bloom.x, bloom.y, {
          eldritchBarrageAngle: ang,
          eldritchBarrageSpeed: spd,
        });
        B.volleySpawned += 1;
      }
      const volleyDoneT = BARRAGE_SPAWN_WINDOW_SEC + BARRAGE_POST_VOLLEY_WAIT_SEC;
      if (B.volleySpawned >= BARRAGE_PROJECTILE_COUNT && tRel >= volleyDoneT) {
        if (B.volleyIndex >= 2) {
          finishBarrageStrike(sim);
          return;
        }
        B.phase = "teleport";
        B.phaseStartSim = sim;
        B.teleportSwapped = false;
        bloom.depthsEldritchTeleportGhostX = bloom.x;
        bloom.depthsEldritchTeleportGhostY = bloom.y;
        bloom.depthsEldritchTeleportFxUntil = sim + BARRAGE_TELEPORT_SEC;
      }
      return;
    }

    if (B.phase === "teleport") {
      const tRel = sim - B.phaseStartSim;
      if (!B.teleportSwapped && tRel >= BARRAGE_TELEPORT_SWAP_AT) {
        const nextVi = B.volleyIndex + 1;
        const { tx, ty } = targetForVolley(nextVi);
        bloom.x = tx;
        bloom.y = ty;
        B.teleportSwapped = true;
        bumpScreenShake(16, 0.24);
      }
      if (tRel >= BARRAGE_TELEPORT_SEC) {
        B.volleyIndex += 1;
        B.phase = "volley";
        B.phaseStartSim = sim;
        B.volleySpawned = 0;
        bloom.depthsEldritchTeleportFxUntil = 0;
      }
      return;
    }
  }

  function spawnP2SwarmMinion(bloom, player) {
    const rt = getHunterRuntime();
    rt?.spawnDepthsSwarmFastFromBloom?.(bloom, player);
  }

  function p2SwarmFlankTargetPx(player, bloom, initialFlankSign, volleyIndex) {
    const fs = initialFlankSign * (volleyIndex % 2 === 0 ? 1 : -1);
    return {
      tx: player.x + fs * BARRAGE_FLANK_OFFSET_X,
      ty: clampBloomYForBarrage(bloom, player.y),
    };
  }

  function beginP2SwarmStrike(bloom) {
    const sim = getSimElapsed();
    const player = getPlayer();
    clearBloomLiftPrepFields(bloom);
    bloom.depthsEldritchLightningCastActive = false;
    bloom.depthsCastLiftActive = true;
    bloom.depthsEldritchOrbStrikeChanneling = true;
    bloom.depthsEldritchBarrageAttackActive = true;
    bloom.depthsEldritchTelegraphHoldUntil =
      sim + BARRAGE_DASH_MAX_SEC + P2_SWARM_BURST1_SEC + BARRAGE_TELEPORT_SEC + P2_SWARM_BURST2_SEC + 2;
    const initialFlank = /** @type {1 | -1} */ (bloom.x < player.x ? -1 : 1);
    p2SwarmStrike = {
      phase: "dash",
      phaseStartSim: sim,
      initialFlankSign: initialFlank,
      dashVx: 0,
      dashVy: 0,
      burstWindowStartSim: sim,
      burstSpawned: 0,
      nextSpawnSim: sim,
      teleportSwapped: false,
    };
  }

  function finishP2SwarmStrike(simElapsed) {
    p2SwarmStrike = null;
    const bloom = getBloomHunter();
    if (bloom) {
      bloom.depthsEldritchBarrageAttackActive = false;
      bloom.depthsEldritchOrbStrikeChanneling = false;
      bloom.depthsEldritchTelegraphHoldUntil = 0;
      bloom.depthsCastLiftActive = false;
      bloom.depthsEldritchLightningCastActive = false;
      bloom.depthsEldritchTeleportFxUntil = 0;
      bloom.depthsEldritchTeleportGhostX = 0;
      bloom.depthsEldritchTeleportGhostY = 0;
      clearBloomLiftPrepFields(bloom);
    }
    scheduleP2GapFromSpellEnd(simElapsed);
    p2StrikeIndex = (p2StrikeIndex + 1) % 3;
  }

  function triplicateCloneLayout(player, anchorX, anchorY) {
    const mx = player.x - anchorX;
    const my = player.y - anchorY;
    const ml = Math.hypot(mx, my) || 1;
    const fx = mx / ml;
    const fy = my / ml;
    const px = -fy;
    const py = fx;
    const R = P2_TRIPLICATE_SPLIT_RADIUS_PX;
    return [
      { x: anchorX + px * R - fx * 44, y: anchorY + py * R - fy * 44 },
      { x: anchorX + fx * 72, y: anchorY + fy * 72 },
      { x: anchorX - px * R - fx * 44, y: anchorY - py * R - fy * 44 },
    ];
  }

  function beginP2TriplicateStrike(bloom) {
    const sim = getSimElapsed();
    const player = getPlayer();
    clearBloomLiftPrepFields(bloom);
    bloom.depthsEldritchLightningCastActive = false;
    bloom.depthsEldritchBarrageAttackActive = false;
    bloom.depthsCastLiftActive = true;
    bloom.depthsEldritchOrbStrikeChanneling = true;
    bloom.depthsEldritchTriplicateScripted = true;
    bloom.depthsEldritchTelegraphHoldUntil =
      sim +
      P2_TRIPLICATE_GLOW_SEC +
      P2_TRIPLICATE_SPLIT_SEC +
      P2_TRIPLICATE_LIGHTNING_FORM_SEC +
      P2_TRIPLICATE_ATTACK_WINDOW_SEC +
      P2_TRIPLICATE_REVERT_SEC +
      P2_TRIPLICATE_MERGE_SEC +
      2;
    p2Mode = "gap";
    const ax = bloom.x;
    const ay = bloom.y;
    const c0 = { x: ax, y: ay };
    p2TriplicateStrike = {
      phase: "glow",
      phaseStartSim: sim,
      anchorX: ax,
      anchorY: ay,
      clones: [c0, { x: ax, y: ay }, { x: ax, y: ay }],
      layout: triplicateCloneLayout(player, ax, ay),
      attackWindowEndSim: 0,
      cloneStates: [],
      mergeTargetX: ax,
      mergeTargetY: ay,
    };
  }

  function finishP2TriplicateStrike(simElapsed) {
    p2TriplicateStrike = null;
    const bloom = getBloomHunter();
    if (bloom) {
      bloom.depthsEldritchTriplicateScripted = false;
      bloom.depthsEldritchOrbStrikeChanneling = false;
      bloom.depthsCastLiftActive = false;
      bloom.depthsEldritchTelegraphHoldUntil = 0;
      bloom.depthsEldritchPostCageLightningSprite = false;
      bloom.depthsEldritchDashTrail = null;
      bloom.depthsPostCageLightningContactUntil = 0;
      clearBloomLiftPrepFields(bloom);
    }
    scheduleP2GapFromSpellEnd(simElapsed);
    p2StrikeIndex = (p2StrikeIndex + 1) % 3;
  }

  function syncBloomToTriplicateCenter(bloom, T) {
    const mid = T.clones[1];
    if (mid && Number.isFinite(mid.x) && Number.isFinite(mid.y)) {
      bloom.x = mid.x;
      bloom.y = mid.y;
    }
  }

  function tickP2TriplicateStrike(dt) {
    const sim = getSimElapsed();
    const bloom = getBloomHunter();
    const player = getPlayer();
    const T = p2TriplicateStrike;
    if (!T) return;
    if (!bloom) {
      p2TriplicateStrike = null;
      clearBloomScriptedTelegraph();
      return;
    }

    const age = sim - T.phaseStartSim;

    if (T.phase === "glow") {
      if (age >= P2_TRIPLICATE_GLOW_SEC) {
        T.phase = "split";
        T.phaseStartSim = sim;
        T.layout = triplicateCloneLayout(player, T.anchorX, T.anchorY);
      }
      syncBloomToTriplicateCenter(bloom, T);
      return;
    }

    if (T.phase === "split") {
      T.layout = triplicateCloneLayout(player, T.anchorX, T.anchorY);
      const u = clamp(age / Math.max(1e-4, P2_TRIPLICATE_SPLIT_SEC), 0, 1);
      const e = u * u * (3 - 2 * u);
      const lay = T.layout;
      if (lay && lay.length === 3) {
        for (let i = 0; i < 3; i++) {
          T.clones[i].x = T.anchorX + (lay[i].x - T.anchorX) * e;
          T.clones[i].y = T.anchorY + (lay[i].y - T.anchorY) * e;
        }
      }
      syncBloomToTriplicateCenter(bloom, T);
      if (age >= P2_TRIPLICATE_SPLIT_SEC) {
        T.phase = "lightningForm";
        T.phaseStartSim = sim;
      }
      return;
    }

    if (T.phase === "lightningForm") {
      bloom.depthsEldritchPostCageLightningSprite = true;
      syncBloomToTriplicateCenter(bloom, T);
      if (age >= P2_TRIPLICATE_LIGHTNING_FORM_SEC) {
        T.phase = "attack";
        T.phaseStartSim = sim;
        T.attackWindowEndSim = sim + P2_TRIPLICATE_ATTACK_WINDOW_SEC;
        T.cloneStates = [];
        for (let i = 0; i < 3; i++) {
          T.cloneStates.push({
            mode: "cooldown",
            cooldownUntilSim: sim + i * 0.14,
            telegraphStartSim: 0,
            aimPx: 0,
            aimPy: 0,
            dashT0: 0,
            fx: 0,
            fy: 0,
            tx: 0,
            ty: 0,
            dashDealt: false,
          });
        }
      }
      return;
    }

    if (T.phase === "attack") {
      bloom.depthsEldritchPostCageLightningSprite = true;
      const pr = Number(player.r) || PLAYER_RADIUS;
      const hardStop = T.attackWindowEndSim + P2_TRIPLICATE_DASH_SEC + 0.12;

      for (let i = 0; i < 3; i++) {
        const st = T.cloneStates[i];
        const c = T.clones[i];
        if (st.mode === "cooldown") {
          if (sim >= st.cooldownUntilSim && sim < T.attackWindowEndSim) {
            st.mode = "telegraph";
            st.telegraphStartSim = sim;
            st.aimPx = player.x;
            st.aimPy = player.y;
          }
        } else if (st.mode === "telegraph") {
          if (sim - st.telegraphStartSim >= P2_TRIPLICATE_TELEGRAPH_SEC) {
            st.mode = "dash";
            st.dashT0 = sim;
            st.fx = c.x;
            st.fy = c.y;
            let dx = st.aimPx - st.fx;
            let dy = st.aimPy - st.fy;
            let len = Math.hypot(dx, dy);
            if (len < 12) {
              dx = player.x - st.fx;
              dy = player.y - st.fy;
              len = Math.hypot(dx, dy) || 1;
            }
            const travel = len + P2_TRIPLICATE_DASH_OVERSHOOT_PX;
            st.tx = st.fx + (dx / len) * travel;
            st.ty = st.fy + (dy / len) * travel;
            st.dashDealt = false;
          }
        } else if (st.mode === "dash") {
          const u = clamp((sim - st.dashT0) / Math.max(1e-4, P2_TRIPLICATE_DASH_SEC), 0, 1);
          const ee = u * u * (3 - 2 * u);
          c.x = st.fx + (st.tx - st.fx) * ee;
          c.y = st.fy + (st.ty - st.fy) * ee;
          if (!st.dashDealt && !getRunDead()) {
            const dHit = pointToSegmentDistance(player.x, player.y, st.fx, st.fy, c.x, c.y);
            if (dHit <= P2_TRIPLICATE_DASH_HIT_HW + pr * 0.95) {
              st.dashDealt = true;
              damagePlayerThroughPath(1, {
                sourceX: c.x,
                sourceY: c.y,
                eldritchBloodAttack: "p2TriplicateDash",
              });
            }
          }
          if (sim - st.dashT0 >= P2_TRIPLICATE_DASH_SEC) {
            st.mode = "cooldown";
            st.cooldownUntilSim = sim + randRange(P2_TRIPLICATE_PAUSE_LO_SEC, P2_TRIPLICATE_PAUSE_HI_SEC + 1e-6);
          }
        }
      }

      syncBloomToTriplicateCenter(bloom, T);
      const allBetweenCombos = T.cloneStates.every((s) => s.mode === "cooldown");
      if ((sim >= T.attackWindowEndSim && allBetweenCombos) || sim >= hardStop) {
        T.phase = "revert";
        T.phaseStartSim = sim;
        bloom.depthsEldritchPostCageLightningSprite = false;
        bloom.depthsEldritchDashTrail = null;
      }
      return;
    }

    if (T.phase === "revert") {
      syncBloomToTriplicateCenter(bloom, T);
      if (age >= P2_TRIPLICATE_REVERT_SEC) {
        T.phase = "merge";
        T.phaseStartSim = sim;
        T.mergeTargetX = T.clones[1].x;
        T.mergeTargetY = T.clones[1].y;
        T.mergeStart0 = { x: T.clones[0].x, y: T.clones[0].y };
        T.mergeStart2 = { x: T.clones[2].x, y: T.clones[2].y };
      }
      return;
    }

    if (T.phase === "merge") {
      const u = clamp(age / Math.max(1e-4, P2_TRIPLICATE_MERGE_SEC), 0, 1);
      const e = u * u * (3 - 2 * u);
      const mx = T.mergeTargetX;
      const my = T.mergeTargetY;
      const m0 = T.mergeStart0;
      const m2 = T.mergeStart2;
      if (m0 && m2) {
        T.clones[0].x = m0.x + (mx - m0.x) * e;
        T.clones[0].y = m0.y + (my - m0.y) * e;
        T.clones[2].x = m2.x + (mx - m2.x) * e;
        T.clones[2].y = m2.y + (my - m2.y) * e;
      }
      syncBloomToTriplicateCenter(bloom, T);
      if (age >= P2_TRIPLICATE_MERGE_SEC) {
        bloom.x = mx;
        bloom.y = my;
        finishP2TriplicateStrike(sim);
      }
      return;
    }
  }

  function tickP2SwarmStrike(dt) {
    const sim = getSimElapsed();
    const bloom = getBloomHunter();
    const player = getPlayer();
    const rt = getHunterRuntime();
    const S = p2SwarmStrike;
    if (!S) return;
    if (!bloom || !rt) {
      p2SwarmStrike = null;
      clearBloomScriptedTelegraph();
      return;
    }

    const maxSpawns1 = Math.round(P2_SWARM_BURST1_SEC / P2_SWARM_SPAWN_INTERVAL_SEC);
    const maxSpawns2 = Math.round(P2_SWARM_BURST2_SEC / P2_SWARM_SPAWN_INTERVAL_SEC);

    if (S.phase === "dash") {
      const { tx, ty } = p2SwarmFlankTargetPx(player, bloom, S.initialFlankSign, 0);
      const ddx = tx - bloom.x;
      const ddy = ty - bloom.y;
      const dist = Math.hypot(ddx, ddy) || 1;
      S.dashVx += (ddx / dist) * BARRAGE_DASH_ACCEL * dt;
      S.dashVy += (ddy / dist) * BARRAGE_DASH_ACCEL * dt;
      const sp = Math.hypot(S.dashVx, S.dashVy);
      if (sp > BARRAGE_DASH_MAX_SPEED) {
        const sc = BARRAGE_DASH_MAX_SPEED / sp;
        S.dashVx *= sc;
        S.dashVy *= sc;
      }
      bloom.x += S.dashVx * dt;
      bloom.y += S.dashVy * dt;
      bloom.y = clampBloomYForBarrage(bloom, bloom.y);
      if (Math.hypot(tx - bloom.x, ty - bloom.y) < 28 || sim - S.phaseStartSim >= BARRAGE_DASH_MAX_SEC) {
        bloom.x = tx;
        bloom.y = ty;
        S.phase = "burst1";
        S.burstWindowStartSim = sim;
        S.burstSpawned = 0;
        S.nextSpawnSim = sim;
        S.dashVx = 0;
        S.dashVy = 0;
      }
      return;
    }

    if (S.phase === "burst1") {
      bloom.y = clampBloomYForBarrage(bloom, player.y);
      const burst1End = S.burstWindowStartSim + P2_SWARM_BURST1_SEC;
      while (
        S.burstSpawned < maxSpawns1 &&
        sim + 1e-5 >= S.nextSpawnSim &&
        sim < burst1End
      ) {
        spawnP2SwarmMinion(bloom, player);
        S.burstSpawned += 1;
        S.nextSpawnSim += P2_SWARM_SPAWN_INTERVAL_SEC;
      }
      if (sim >= burst1End) {
        S.phase = "teleport";
        S.phaseStartSim = sim;
        S.teleportSwapped = false;
        bloom.depthsEldritchTeleportGhostX = bloom.x;
        bloom.depthsEldritchTeleportGhostY = bloom.y;
        bloom.depthsEldritchTeleportFxUntil = sim + BARRAGE_TELEPORT_SEC;
      }
      return;
    }

    if (S.phase === "teleport") {
      const tRel = sim - S.phaseStartSim;
      if (!S.teleportSwapped && tRel >= BARRAGE_TELEPORT_SWAP_AT) {
        const { tx, ty } = p2SwarmFlankTargetPx(player, bloom, S.initialFlankSign, 1);
        bloom.x = tx;
        bloom.y = ty;
        S.teleportSwapped = true;
        bumpScreenShake(16, 0.24);
      }
      if (tRel >= BARRAGE_TELEPORT_SEC) {
        S.phase = "burst2";
        S.burstWindowStartSim = sim;
        S.burstSpawned = 0;
        S.nextSpawnSim = sim;
        bloom.depthsEldritchTeleportFxUntil = 0;
      }
      return;
    }

    if (S.phase === "burst2") {
      bloom.y = clampBloomYForBarrage(bloom, player.y);
      const burst2End = S.burstWindowStartSim + P2_SWARM_BURST2_SEC;
      while (
        S.burstSpawned < maxSpawns2 &&
        sim + 1e-5 >= S.nextSpawnSim &&
        sim < burst2End
      ) {
        spawnP2SwarmMinion(bloom, player);
        S.burstSpawned += 1;
        S.nextSpawnSim += P2_SWARM_SPAWN_INTERVAL_SEC;
      }
      if (sim >= burst2End) {
        finishP2SwarmStrike(sim);
      }
    }
  }

  function tick(dt) {
    if (!isDepthsBossFightLevel() || !getHunterRuntime() || !getHuntersEnabled() || getRunDead()) return;
    if (isPlayerInSafehouse()) return;
    if (fightStartSim <= 0) return;

    tickTentacleRain();

    const simElapsed = getSimElapsed();
    if (macroPhase === 2) {
      const bloom = getBloomHunter();
      const until = bloom ? Number(bloom.depthsBetweenPhasesUntil ?? 0) : 0;
      if (!bloom || simElapsed >= until) {
        macroPhase = 3;
        if (bloom) {
          bloom.depthsBetweenPhasesUntil = 0;
          bloom.depthsBetweenPhasesStartSim = 0;
          bloom.depthsEldritchPhase2Tone = true;
        }
        p2PhaseEnterSim = simElapsed;
        p2Mode = "gap";
        p2NextAttackSim = simElapsed + ELDRITCH_BLOOD_CAST_PREP_DRIFT_SEC;
        p2StrikeIndex = 0;
      }
      return;
    }

    if (macroPhase === 4) {
      tickP2P3Interlude(dt);
      return;
    }

    if (macroPhase === 5) {
      return;
    }

    if (macroPhase === 3 && simElapsed - p2PhaseEnterSim >= ELDRITCH_BLOOD_PHASE2_DURATION_SEC) {
      beginP2ToP3Interlude(simElapsed);
      return;
    }

    const fightAge = simElapsed - fightStartSim;
    const bloom = getBloomHunter();

    if (floatingCageStrike) {
      tickFloatingCageStrike(dt);
      return;
    }
    if (p2TriplicateStrike) {
      tickP2TriplicateStrike(dt);
      return;
    }
    if (p2SwarmStrike) {
      tickP2SwarmStrike(dt);
      return;
    }

    if (homingOrbStrike) {
      tickHomingOrbStrike(dt);
      return;
    }
    if (lightningStrike) {
      tickLightningStrike(dt);
      return;
    }
    if (eldritchBarrageStrike) {
      tickBarrageStrike(dt);
      return;
    }

    if (macroPhase <= 1) {
      if (p1Mode === "tentacles") {
        return;
      }

      if (macroPhase === 0) {
        if (fightAge < ELDRITCH_BLOOD_PHASE1_START_SEC || !bloom) return;
        macroPhase = 1;
        p1PhaseEnterSim = simElapsed;
        p1NextSpellKind = rollP1NextSpellKind();
        p1Mode = "gap";
        p1NextAttackSim = simElapsed + ELDRITCH_BLOOD_CAST_PREP_DRIFT_SEC;
      }

      if (p1Mode === "gap") {
        if (macroPhase === 1 && simElapsed - p1PhaseEnterSim >= ELDRITCH_BLOOD_PHASE1_DURATION_SEC) {
          endP1Wave();
          return;
        }
        if (bloom) {
          bloom.depthsSpellLiftPrepStartSim = p1NextAttackSim - ELDRITCH_BLOOD_CAST_PREP_DRIFT_SEC;
          bloom.depthsSpellLiftPrepEndSim = p1NextAttackSim;
        }
        if (bloom && simElapsed >= p1NextAttackSim - ELDRITCH_BLOOD_CAST_PREP_DRIFT_SEC) {
          bloom.depthsCastLiftActive = true;
        }
        if (simElapsed >= p1NextAttackSim && bloom) {
          if (p1NextSpellKind === 1) beginLightningStrike(bloom);
          else if (p1NextSpellKind === 2) beginBarrageStrike(bloom);
          else beginHomingOrbStrike(bloom);
        }
      }
      return;
    }

    if (macroPhase === 3) {
      if (p2Mode === "gap") {
        if (bloom) {
          bloom.depthsSpellLiftPrepStartSim = p2NextAttackSim - ELDRITCH_BLOOD_CAST_PREP_DRIFT_SEC;
          bloom.depthsSpellLiftPrepEndSim = p2NextAttackSim;
        }
        if (bloom && simElapsed >= p2NextAttackSim - ELDRITCH_BLOOD_CAST_PREP_DRIFT_SEC) {
          bloom.depthsCastLiftActive = true;
        }
        if (simElapsed >= p2NextAttackSim && bloom) {
          const k = p2StrikeIndex % 3;
          if (k === 0) beginFloatingCageStrike(bloom);
          else if (k === 1) beginP2SwarmStrike(bloom);
          else beginP2TriplicateStrike(bloom);
        }
      }
      return;
    }
  }

  function drawP2TriplicateUnder(ctx, bloom) {
    const T = p2TriplicateStrike;
    if (!T || !bloom) return;
    const sim = getSimElapsed();
    const player = getPlayer();
    const pulse = 0.5 + 0.5 * Math.sin(sim * 17);

    if (T.phase === "glow" || T.phase === "split") {
      for (let i = 0; i < 3; i++) {
        const c = T.clones[i];
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const grd = ctx.createRadialGradient(c.x, c.y, 8, c.x, c.y, 52 + pulse * 14);
        grd.addColorStop(0, `rgba(255, 230, 255, ${0.32 + 0.22 * pulse})`);
        grd.addColorStop(0.5, `rgba(160, 200, 255, ${0.2})`);
        grd.addColorStop(1, "rgba(20, 40, 80, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    if (T.phase === "attack" && T.cloneStates) {
      for (let i = 0; i < 3; i++) {
        const st = T.cloneStates[i];
        if (st.mode !== "telegraph") continue;
        const c = T.clones[i];
        const u = clamp((sim - st.telegraphStartSim) / Math.max(1e-4, P2_TRIPLICATE_TELEGRAPH_SEC), 0, 1);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `rgba(255, 200, 255, ${0.22 + 0.52 * u})`;
        ctx.lineWidth = 4 + 16 * u;
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(255, 220, 255, 0.55)";
        ctx.shadowBlur = 12 + 14 * u;
        const ax = Number.isFinite(st.aimPx) ? st.aimPx : player.x;
        const ay = Number.isFinite(st.aimPy) ? st.aimPy : player.y;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(ax, ay);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function drawP2TriplicateOver(ctx, bloom) {
    const T = p2TriplicateStrike;
    if (!T || !bloom) return;
    const sim = getSimElapsed();
    const age = sim - T.phaseStartSim;
    const flick = 0.55 + 0.45 * Math.sin(sim * 38);

    const drawLightningOrb = (x, y) => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(x, y, 4, x, y, 40);
      g.addColorStop(0, `rgba(255, 252, 255, ${0.82 * flick})`);
      g.addColorStop(0.35, `rgba(200, 230, 255, ${0.52 * flick})`);
      g.addColorStop(0.7, `rgba(120, 180, 255, ${0.26 * flick})`);
      g.addColorStop(1, "rgba(30, 60, 120, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    if (T.phase === "lightningForm" || T.phase === "attack") {
      for (let i = 0; i < 3; i++) {
        const c = T.clones[i];
        drawLightningOrb(c.x, c.y);
      }
    }

    if (T.phase === "revert" || T.phase === "merge") {
      const dark = T.phase === "revert" ? clamp(age / Math.max(1e-4, P2_TRIPLICATE_REVERT_SEC), 0, 1) : 1;
      const mergeT = T.phase === "merge" ? clamp(age / Math.max(1e-4, P2_TRIPLICATE_MERGE_SEC), 0, 1) : 0;
      const a = 0.18 + 0.42 * dark * (1 - mergeT * 0.88);
      for (let i = 0; i < 3; i++) {
        const c = T.clones[i];
        ctx.save();
        ctx.fillStyle = `rgba(4, 6, 18, ${a})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 56, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  /** FX that should sit under hunter sprites (charge auras, ground telegraphs, …). */
  function drawUnderHunters(ctx) {
    if (!isDepthsBossFightLevel()) return;
    const bloom = getBloomHunter();
    drawP2TriplicateUnder(ctx, bloom);
    const fc = floatingCageStrike;
    const ctrCage = fc ? getFloatingCageCenterWorldXY() : null;
    if (fc && ctrCage && FLOATING_CAGE_INTERIOR_PHASES.has(fc.phase)) {
      const simElapsed = getSimElapsed();
      const pulse = 0.5 + 0.5 * Math.sin(simElapsed * 13);
      const R = FLOATING_CAGE_RADIUS_PX;
      const { cx, cy } = ctrCage;
      const floorRad = Math.max(28, R - 14);
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = getFloatingCageInteriorFill();
      ctx.beginPath();
      ctx.arc(cx, cy, floorRad, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = `rgba(255, 120, 180, ${0.38 + 0.22 * pulse})`;
      ctx.lineWidth = 5;
      ctx.shadowColor = "rgba(255, 160, 200, 0.55)";
      ctx.shadowBlur = 22 + pulse * 12;
      ctx.beginPath();
      ctx.arc(cx, cy, R - 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(170, 220, 255, ${0.18 + 0.12 * pulse})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, R - 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    if (fc?.phase === "postLightningFlash" && bloom) {
      const b = getWorldDrawBounds();
      const simElapsed = getSimElapsed();
      const u = clamp(
        (simElapsed - fc.phaseStartSim) / Math.max(1e-4, LIGHTNING_STRIKE_FLASH_SEC),
        0,
        1,
      );
      drawLightningColumnStrikeFlash(ctx, bloom.x, b.y0, b.y1, u);
    }
    if (
      fc?.phase === "postDashTelegraph" &&
      ctrCage &&
      Number.isFinite(fc.dashSegRelX0) &&
      Number.isFinite(fc.dashSegRelX1)
    ) {
      const simElapsed = getSimElapsed();
      const age = simElapsed - fc.phaseStartSim;
      const u = clamp(age / Math.max(1e-4, POST_CAGE_DASH_TELEGRAPH_SEC), 0, 1);
      const w = 5 + 26 * u;
      const wx0 = ctrCage.cx + fc.dashSegRelX0;
      const wy0 = ctrCage.cy + fc.dashSegRelY0;
      const wx1 = ctrCage.cx + fc.dashSegRelX1;
      const wy1 = ctrCage.cy + fc.dashSegRelY1;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(255, 140, 210, ${0.22 + 0.48 * u})`;
      ctx.lineWidth = w;
      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(255, 200, 255, 0.55)";
      ctx.shadowBlur = 16 + 18 * u;
      ctx.beginPath();
      ctx.moveTo(wx0, wy0);
      ctx.lineTo(wx1, wy1);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + 0.4 * u})`;
      ctx.lineWidth = Math.max(1.5, w * 0.22);
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(wx0, wy0);
      ctx.lineTo(wx1, wy1);
      ctx.stroke();
      ctx.restore();
    }
    if (bloom?.depthsEldritchDashTrail?.length) {
      const simElapsed = getSimElapsed();
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < bloom.depthsEldritchDashTrail.length; i++) {
        const p = bloom.depthsEldritchDashTrail[i];
        const ageT = simElapsed - p.t;
        const fade = clamp(1 - ageT / 0.42, 0, 1);
        if (fade <= 0.02) continue;
        const a = fade * 0.38;
        ctx.globalAlpha = a;
        ctx.fillStyle = `rgba(200, 240, 255, ${0.55 * fade})`;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 32 * fade, 16 * fade, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (lightningStrike && bloom) {
      const simElapsed = getSimElapsed();
      const u = clamp((simElapsed - lightningStrike.phaseStartSim) / 1.15, 0, 1);
      const pulse = 0.5 + 0.5 * Math.sin(simElapsed * 16);
      const cx = bloom.x;
      const cy = bloom.y;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const outer = 52 + 38 * u + pulse * 12;
      const grd = ctx.createRadialGradient(cx, cy, 10, cx, cy, outer);
      grd.addColorStop(0, `rgba(220, 248, 255, ${0.42 + 0.2 * u})`);
      grd.addColorStop(0.35, `rgba(120, 200, 255, ${0.35 + 0.15 * pulse * u})`);
      grd.addColorStop(0.65, `rgba(60, 140, 220, ${0.22 * u})`);
      grd.addColorStop(1, "rgba(10, 30, 60, 0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, outer, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = `rgba(200, 235, 255, ${0.28 + 0.35 * u * pulse})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(cx, cy, 36 + u * 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (bloom?.depthsEldritchBarrageAttackActive) {
      const simElapsed = getSimElapsed();
      const u = clamp((Math.sin(simElapsed * 0.9) + 1) * 0.5, 0, 1);
      const pulse = 0.5 + 0.5 * Math.sin(simElapsed * 19);
      const cx = bloom.x;
      const cy = bloom.y;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const outer = 58 + 44 * u + pulse * 14;
      const grd = ctx.createRadialGradient(cx, cy, 8, cx, cy, outer);
      grd.addColorStop(0, `rgba(200, 160, 255, ${0.38 + 0.18 * u})`);
      grd.addColorStop(0.35, `rgba(80, 40, 120, ${0.42 + 0.12 * pulse})`);
      grd.addColorStop(0.65, `rgba(30, 10, 60, ${0.28 * u})`);
      grd.addColorStop(1, "rgba(4, 0, 12, 0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, outer, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = `rgba(120, 200, 255, ${0.22 + 0.25 * pulse * u})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy, 40 + u * 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (!homingOrbStrike || homingOrbStrike.phase !== "charge") return;
    const simElapsed = getSimElapsed();
    const o = homingOrbStrike;
    const u = clamp((simElapsed - o.chargeStartSim) / Math.max(1e-4, ORB_CHARGE_SEC), 0, 1);
    const pulse = 0.55 + 0.45 * Math.sin(simElapsed * 14);
    const cx = o.x;
    const cy = o.y;
    const outer = ORB_RADIUS * (5.2 + 2.4 * u) + (1 - u) * 40;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const grd = ctx.createRadialGradient(cx, cy, ORB_RADIUS * 0.2, cx, cy, outer);
    grd.addColorStop(0, `rgba(255, 248, 255, ${0.38 + 0.22 * pulse * u})`);
    grd.addColorStop(0.35, `rgba(190, 140, 255, ${0.32 * u + 0.18 * pulse})`);
    grd.addColorStop(0.65, `rgba(100, 50, 160, ${0.22 * u})`);
    grd.addColorStop(1, "rgba(20, 6, 40, 0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = `rgba(230, 210, 255, ${0.35 + 0.35 * u * pulse})`;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(cx, cy, ORB_RADIUS * 2.4 + u * 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /** FX that should sit on top of hunter sprites (projectiles, bright cores, …). */
  function drawOverHunters(ctx) {
    if (!isDepthsBossFightLevel()) return;
    const bloom = getBloomHunter();
    drawP2TriplicateOver(ctx, bloom);
    const b = getWorldDrawBounds();
    const yTop = b.y0;
    const yBot = b.y1;
    const L = lightningStrike;
    if (L) {
      const simElapsed = getSimElapsed();
      if (L.phase === "telegraph") {
        const wob = clamp((simElapsed - L.phaseStartSim) / Math.max(1e-4, L.strikeSim - L.phaseStartSim), 0, 1);
        for (let ci = 0; ci < L.columns.length; ci++) {
          const cx = L.columns[ci];
          const seed = Math.floor(cx * 0.31 + ci * 17 + L.volleyIndex * 131);
          drawLightningColumnTelegraphAmbient(ctx, cx, yTop, yBot, simElapsed, seed, wob);
        }
      } else if (L.phase === "strikeFlash") {
        const u = clamp((simElapsed - L.phaseStartSim) / Math.max(1e-4, LIGHTNING_STRIKE_FLASH_SEC), 0, 1);
        for (const cx of L.columns) {
          drawLightningColumnStrikeFlash(ctx, cx, yTop, yBot, u);
        }
      }
    }
    if (homingOrbStrike) {
      const simElapsed = getSimElapsed();
      const o = homingOrbStrike;
      const pulse = 0.5 + 0.5 * Math.sin(simElapsed * 18 + (o.phase === "charge" ? 0 : 2.1));
      const cx = o.x;
      const cy = o.y;
      const r = ORB_RADIUS * (o.phase === "charge" ? 0.72 + 0.28 * pulse : 1);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const grd = ctx.createRadialGradient(cx, cy, r * 0.12, cx, cy, r * 2.15);
      grd.addColorStop(0, `rgba(255, 252, 255, ${0.75 + 0.2 * pulse})`);
      grd.addColorStop(0.4, `rgba(200, 170, 255, ${0.55})`);
      grd.addColorStop(0.72, `rgba(120, 70, 190, ${0.38})`);
      grd.addColorStop(1, "rgba(30, 10, 60, 0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = `rgba(240, 220, 255, ${0.55 + 0.25 * pulse})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Dev-only: abort any scripted beat and start one immediately (Depths L5 boss chase).
   * @param {string} spellId `p1_orb` | `p1_lightning` | `p1_barrage` | `p2_cage` | `p2_swarm` | `p2_triplicate` | `interlude_p1_p2` | `interlude_p2_p3`
   * @returns {{ ok: true } | { ok: false, reason: string }}
   */
  function debugForceEldritchSpell(spellId) {
    if (!isDepthsBossFightLevel()) return { ok: false, reason: "not_boss_chase" };
    if (!getHuntersEnabled()) return { ok: false, reason: "hunters_disabled" };
    if (getRunDead()) return { ok: false, reason: "run_dead" };
    if (isPlayerInSafehouse()) return { ok: false, reason: "safehouse" };
    const rt = getHunterRuntime();
    if (!rt) return { ok: false, reason: "no_hunter_runtime" };
    const bloom = getBloomHunter();
    if (!bloom) return { ok: false, reason: "no_bloom" };

    const sim = getSimElapsed();
    notifyFightClockStart(sim);

    homingOrbStrike = null;
    lightningStrike = null;
    eldritchBarrageStrike = null;
    floatingCageStrike = null;
    p2SwarmStrike = null;
    p2TriplicateStrike = null;
    tentacleHitSim = 0;
    tentacleLastK = -1;
    p1Mode = "gap";
    clearBloomScriptedTelegraph();

    if (spellId === "p1_orb") {
      macroPhase = 1;
      p1PhaseEnterSim = sim;
      p1NextAttackSim = sim;
      if (bloom) bloom.depthsEldritchPhase2Tone = false;
      beginHomingOrbStrike(bloom);
      return { ok: true };
    }
    if (spellId === "p1_lightning") {
      macroPhase = 1;
      p1PhaseEnterSim = sim;
      p1NextAttackSim = sim;
      if (bloom) bloom.depthsEldritchPhase2Tone = false;
      beginLightningStrike(bloom);
      return { ok: true };
    }
    if (spellId === "p1_barrage") {
      macroPhase = 1;
      p1PhaseEnterSim = sim;
      p1NextAttackSim = sim;
      if (bloom) bloom.depthsEldritchPhase2Tone = false;
      beginBarrageStrike(bloom);
      return { ok: true };
    }
    if (spellId === "p2_cage") {
      macroPhase = 3;
      p2PhaseEnterSim = sim;
      p2Mode = "gap";
      p2NextAttackSim = sim;
      p2StrikeIndex = 0;
      if (bloom) bloom.depthsEldritchPhase2Tone = true;
      beginFloatingCageStrike(bloom);
      return { ok: true };
    }
    if (spellId === "p2_swarm") {
      macroPhase = 3;
      p2PhaseEnterSim = sim;
      p2Mode = "gap";
      p2NextAttackSim = sim;
      p2StrikeIndex = 1;
      if (bloom) bloom.depthsEldritchPhase2Tone = true;
      beginP2SwarmStrike(bloom);
      return { ok: true };
    }
    if (spellId === "p2_triplicate") {
      macroPhase = 3;
      p2PhaseEnterSim = sim;
      p2Mode = "gap";
      p2NextAttackSim = sim;
      p2StrikeIndex = 2;
      if (bloom) bloom.depthsEldritchPhase2Tone = true;
      beginP2TriplicateStrike(bloom);
      return { ok: true };
    }
    if (spellId === "interlude_p1_p2") {
      macroPhase = 2;
      p1Mode = "gap";
      if (bloom) {
        bloom.depthsBetweenPhasesStartSim = sim;
        bloom.depthsBetweenPhasesUntil = sim + ELDRITCH_BLOOD_BETWEEN_PHASE_INTERLUDE_SEC;
        bloom.depthsEldritchPhase2Tone = false;
        bloom.depthsEldritchPhase3Tone = false;
      }
      return { ok: true };
    }
    if (spellId === "interlude_p2_p3") {
      beginP2ToP3Interlude(sim);
      return { ok: true };
    }
    return { ok: false, reason: "unknown_spell" };
  }

  return {
    reset,
    notifyFightClockStart,
    tick,
    drawUnderHunters,
    drawOverHunters,
    applyFloatingCageRisingWaveCarryBeforePlayerMove,
    isFloatingCageTerrainCollisionSuppressedNow,
    clampPlayerToFloatingCage,
    debugForceEldritchSpell,
  };
}
