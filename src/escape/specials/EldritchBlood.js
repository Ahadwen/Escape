/**
 * Depths L5 eldritch boss — scripted “blood” encounter layer (timed strikes, follow-up hazards, …).
 * Wave + timewarp stay in `entry.js`; this module owns scripted attack timing/FX only.
 * Phase 1: for `ELDRITCH_BLOOD_PHASE1_DURATION_SEC` after the intro, random orb / lightning / radial barrage
 * spells fire every `ELDRITCH_BLOOD_ATTACK_COOLDOWN_*` seconds (same spells may repeat).
 * Phase 2: same drift → prep → glow → cadence (`ELDRITCH_BLOOD_PHASE2_DURATION_SEC`), different attack pool; first strike is floating cage arena.
 */
import { PLAYER_RADIUS } from "../balance.js";
import { clamp } from "../Hunters/hunterGeometry.js";

export const ELDRITCH_BLOOD_PHASE1_START_SEC = 10;
/** Wall time from entering P1 until the scripted wave ends (no further P1 spells arm after this). */
export const ELDRITCH_BLOOD_PHASE1_DURATION_SEC = 80;
/** Boss center must stay at least this many px above the rising wave while a P1 beat is active (charge → tentacles). */
export const ELDRITCH_BLOOD_CAST_ABOVE_WAVE_PX = 200;
/** Seconds before strike telegraph: height clamp turns on so the bloom can drift up (no Y snap at telegraph start). */
export const ELDRITCH_BLOOD_CAST_PREP_DRIFT_SEC = 1.5;
/** Random cooldown `[lo, hi)` seconds between P1 spells (after a spell fully resolves, before the next arms). */
export const ELDRITCH_BLOOD_ATTACK_COOLDOWN_LO_SEC = 4;
export const ELDRITCH_BLOOD_ATTACK_COOLDOWN_HI_SEC = 7;
/** Visual-only interlude after P1 ends (boss “gathers” then “releases”); no gameplay effect. */
export const ELDRITCH_BLOOD_BETWEEN_PHASE_INTERLUDE_SEC = 8;
/** Mirrors P1 scripted window until P2 resolves (later attacks can diversify). */
export const ELDRITCH_BLOOD_PHASE2_DURATION_SEC = ELDRITCH_BLOOD_PHASE1_DURATION_SEC;
/** Floating “mini cage” arena: diameter in px (terrain ignored for the player inside the ring). */
export const ELDRITCH_BLOOD_FLOATING_CAGE_DIAMETER_PX = 350;

const FLOATING_CAGE_RADIUS_PX = ELDRITCH_BLOOD_FLOATING_CAGE_DIAMETER_PX / 2;
/** Boss dash to flank matches P1 radial barrage, then snaps the cage on the player. */
const FLOATING_CAGE_DASH_ALIGN_MAX_SEC = 2.85;
/** While the ring is active: melee lunges spawn from the bloom toward the player. */
const FLOATING_CAGE_CAGED_DURATION_SEC = 5.1;
const FLOATING_CAGE_MELEE_GAP_SEC = 1.08;
const FLOATING_CAGE_MELEE_COUNT = 4;
/** Short rush hitbox spawned from scripted bloom during the cage beat. */
const FLOATING_CAGE_LUNGE_SPEED_PX = 740;

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
  /** `0` intro · `1` P1 · `2` interlude · `3` Phase 2 · `4` P2 idle (stub). */
  let macroPhase = /** @type {0 | 1 | 2 | 3 | 4} */ (0);
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

  /** @type {{ phase: "dash" | "caged"; phaseStartSim: number; flankSign: 1 | -1; dashVx: number; dashVy: number; cageCx: number; cageYOffsetFromWave: number; meleeSpawned: number; cageWaveFY: number; lastSyncedCy: number } | null} */
  let floatingCageStrike = null;
  /** `macroPhase === 3` wall clock baseline. */
  let p2PhaseEnterSim = 0;
  /** @type {"idle" | "gap"} */
  let p2Mode = /** @type {"idle" | "gap"} */ ("idle");
  let p2NextAttackSim = 0;

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
        h.depthsEldritchCageStrikeActive = false;
        h.depthsEldritchPhase2Tone = false;
        clearBloomLiftPrepFields(h);
      }
    }
    lightningStrike = null;
    eldritchBarrageStrike = null;
    floatingCageStrike = null;
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
    p2PhaseEnterSim = 0;
    p2Mode = "idle";
    p2NextAttackSim = 0;
    clearBloomScriptedTelegraph();
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
    if (!C || C.phase !== "caged") return null;
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

  function endP2Wave() {
    macroPhase = 4;
    p2Mode = "idle";
    floatingCageStrike = null;
    tentacleHitSim = 0;
    tentacleLastK = -1;
    homingOrbStrike = null;
    lightningStrike = null;
    eldritchBarrageStrike = null;
    clearBloomScriptedTelegraph();
  }

  function scheduleP2GapFromSpellEnd(simElapsed) {
    if (simElapsed - p2PhaseEnterSim >= ELDRITCH_BLOOD_PHASE2_DURATION_SEC) {
      endP2Wave();
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
      clearBloomLiftPrepFields(bloom);
    }
    scheduleP2GapFromSpellEnd(simElapsed);
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
      meleeSpawned: 0,
      cageWaveFY: getDepthsBossRisingWaveFrontY?.() ?? player.y,
      lastSyncedCy: player.y,
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
      C.meleeSpawned = 0;
      C.dashVx = 0;
      C.dashVy = 0;
      C.lastSyncedCy = player.y;
      bloom.depthsEldritchTelegraphHoldUntil = sim + FLOATING_CAGE_CAGED_DURATION_SEC + 0.6;
      return;
    }

    if (C.phase === "caged") {
      const age = sim - C.phaseStartSim;
      while (
        C.meleeSpawned < FLOATING_CAGE_MELEE_COUNT &&
        age >= C.meleeSpawned * FLOATING_CAGE_MELEE_GAP_SEC + 0.14
      ) {
        let dx = player.x - bloom.x;
        let dy = player.y - bloom.y;
        const l = Math.hypot(dx, dy) || 1;
        dx /= l;
        dy /= l;
        rt.spawnHunter("depthsEldritchCageLunge", bloom.x, bloom.y, {
          eldritchCageLungeVx: dx * FLOATING_CAGE_LUNGE_SPEED_PX,
          eldritchCageLungeVy: dy * FLOATING_CAGE_LUNGE_SPEED_PX,
        });
        C.meleeSpawned += 1;
      }

      if (age >= FLOATING_CAGE_CAGED_DURATION_SEC) {
        finishFloatingCageStrike(sim);
      }
    }
  }

  function applyFloatingCageRisingWaveCarryBeforePlayerMove() {
    const C = floatingCageStrike;
    if (!C || C.phase !== "caged") return;
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
    return !!(C && C.phase === "caged");
  }

  function clampPlayerToFloatingCage() {
    const C = floatingCageStrike;
    if (!C || C.phase !== "caged") return;
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
      }
      return;
    }

    if (macroPhase >= 4) return;

    if (macroPhase === 3 && simElapsed - p2PhaseEnterSim >= ELDRITCH_BLOOD_PHASE2_DURATION_SEC) {
      endP2Wave();
      return;
    }

    const fightAge = simElapsed - fightStartSim;
    const bloom = getBloomHunter();

    if (floatingCageStrike) {
      tickFloatingCageStrike(dt);
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
          /** First P2 attack for now — later diversify `p2NextSpellKind`. */
          beginFloatingCageStrike(bloom);
        }
      }
      return;
    }
  }

  /** FX that should sit under hunter sprites (charge auras, ground telegraphs, …). */
  function drawUnderHunters(ctx) {
    if (!isDepthsBossFightLevel()) return;
    const bloom = getBloomHunter();
    const fc = floatingCageStrike;
    if (fc?.phase === "caged") {
      const ctr = getFloatingCageCenterWorldXY();
      if (ctr) {
        const simElapsed = getSimElapsed();
        const pulse = 0.5 + 0.5 * Math.sin(simElapsed * 13);
        const R = FLOATING_CAGE_RADIUS_PX;
        const { cx, cy } = ctr;
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
    if (!homingOrbStrike) return;
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

  /**
   * Dev-only: abort any scripted beat and start one immediately (Depths L5 boss chase).
   * @param {string} spellId `p1_orb` | `p1_lightning` | `p1_barrage` | `p2_cage`
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
      if (bloom) bloom.depthsEldritchPhase2Tone = true;
      beginFloatingCageStrike(bloom);
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
