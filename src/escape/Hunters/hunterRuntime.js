/**
 * Hunter simulation, spawning, and combat — ported from REFERENCE `game.js` / `hunters.js`,
 * trimmed for the current Escape slice (roulette barrier hooks still minimal).
 */
import {
  SPAWN_INTERVAL_START,
  SPAWN_INTERVAL_FLOOR,
  HUNTER_FIRST_WAVE_AT_SEC,
  DANGER_RAMP_SECONDS,
  LATE_GAME_ELITE_SPAWN_SEC,
  ARENA_NEXUS_SIEGE_SEC,
  ARENA_NEXUS_RING_LO,
  ARENA_NEXUS_RING_HI,
  HEX_SIZE,
  MIDGAME_ESCALATION_START_SEC,
  MIDGAME_ESCALATION_INTERVAL_SEC,
  MIDGAME_ESCALATION_SPEED_FACTOR,
  BASE_WAVE_SPAWN_JOBS,
  AIR_SPAWNER_CHASE_SPEED,
  LASER_BLUE_COOLDOWN_SEC,
  LASER_BLUE_WARN_SEC,
  HUNTER_SPEED_AGE_COEFF,
  ENEMY_HIT_COOLDOWN_SEC,
  BULWARK_POST_HIT_INVULN_SEC,
  BULWARK_CHARGE_WALL_STUN_SEC,
  BULWARK_CHARGE_PUSH_CORRIDOR_MARGIN,
  BULWARK_CHARGE_TERRAIN_GROUP_STUN_SEC,
  FROG_MUD_POOL_MOVE_MULT,
  SWAMP_L3PLUS_SNIPER_WAVE_KEEP_FRACTION,
} from "../balance.js";
import { SNIPER_ARTILLERY_WINDUP, SNIPER_ARTILLERY_LEAD, SNIPER_ARTILLERY_BANG_DURATION } from "../constants.js";
import {
  distSq,
  clamp,
  vectorToTarget,
  intersectsRectCircle,
  lineIntersectsRect,
  pointToSegmentDistance,
  normalizeAngle,
  annularSectorContainsCircle,
  outOfBoundsCircle,
} from "./hunterGeometry.js";
import {
  drawHunterBody,
  drawProjectileBody,
  drawLaserBeamFancy,
  drawDangerZones,
  drawSniperBullets,
  drawSniperFireArcs,
  drawSwampPools,
  drawSwampBlastBursts,
  drawHallsPawnImpactBursts,
  drawSpawnerChargeClocks,
  drawHunterLifeBars,
  frogMudPoolGrowScale,
  FROG_SPLASH_GROW_SEC,
} from "./hunterDraw.js";
import {
  getHallsSpawnIntervalSec,
  getHallsWaveSpawnJobs,
  pickHallsWaveSpawnSpec,
  resolveHallsPieceHunterType,
  HALLS_PIECE_IDS,
  HALLS_ENEMY_LIFETIME_SEC,
  HALLS_COIN_HIT_RADIUS_PX,
  HALLS_COIN_DIAMETER_PX,
  HALLS_PAWN_DASH_PX,
  HALLS_KNIGHT_LONG_LEG_PX,
  HALLS_KNIGHT_SHORT_LEG_PX,
  HALLS_SLIDE_PROBE_MAX_PX,
  HALLS_BISHOP_APPROACH_CAP_PX,
  HALLS_BISHOP_LINEUP_MIN_PX,
  HALLS_BISHOP_LINEUP_MAX_PX,
  HALLS_BISHOP_LINEUP_FRAC,
  HALLS_BISHOP_ALIGN_CROSS_WEIGHT,
  HALLS_BISHOP_ALIGN_DIST_WEIGHT,
  HALLS_BISHOP_PAUSE_SEC,
  HALLS_BISHOP_TURN_PAUSE_SEC,
  HALLS_BISHOP_LINE_CROSS_EPS,
  HALLS_BISHOP_PLAYER_CLEAR_BUFFER,
  HALLS_BISHOP_STRIKE_COMMIT_MAX_T_PX,
  HALLS_BISHOP_STRIKE_PAST_PLAYER_PX,
  HALLS_BISHOP_STRIKE_MAX_T_PX,
  HALLS_ROOK_APPROACH_CAP_PX,
  HALLS_ROOK_LINEUP_MIN_PX,
  HALLS_ROOK_LINEUP_MAX_PX,
  HALLS_ROOK_LINEUP_FRAC,
  HALLS_ROOK_ALIGN_CROSS_WEIGHT,
  HALLS_ROOK_ALIGN_DIST_WEIGHT,
  HALLS_ROOK_PAUSE_SEC,
  HALLS_ROOK_TURN_PAUSE_SEC,
  HALLS_ROOK_LINE_CROSS_EPS,
  HALLS_ROOK_STRIKE_COMMIT_MAX_T_PX,
  HALLS_ROOK_STRIKE_PAST_PLAYER_PX,
  HALLS_ROOK_STRIKE_MAX_T_PX,
  HALLS_QUEEN_SLIDE_CAP_PX,
  HALLS_KING_SLIDE_CAP_PX,
  HALLS_CHESS_GLIDE_SPEED_PX_S,
  HALLS_KNIGHT_LONG_GLIDE_MUL,
  HALLS_KNIGHT_SHORT_GLIDE_MUL,
} from "./hallsLogic.js";
import { ELDRITCH_BLOOD_CAST_ABOVE_WAVE_PX } from "../specials/EldritchBlood.js";

/** Swamp frog: detonation / pool radius (px). ~3× the original ~35 (“~200% bigger”). */
const SWAMP_FROG_BLAST_R = 105;
/** Hop ends in explode if target within this distance (aligned ~with blast reach). */
const SWAMP_FROG_LAND_EXPLODE_DIST = SWAMP_FROG_BLAST_R + 24;

/**
 * @typedef {object} HunterRuntimeDeps
 * @property {() => number} getSimElapsed
 * @property {() => { x: number; y: number; r: number; facing: { x: number; y: number } }} getPlayer
 * @property {() => { x: number; y: number; w: number; h: number }[]} getObstacles
 * @property {() => { x: number; y: number; r: number }[]} getDecoys
 * @property {() => string} getCharacterId
 * @property {(a: number, b: number) => number} rand
 * @property {() => { w: number; h: number }} getViewSize
 * @property {(amount: number, opts?: object) => void} damagePlayer
 * @property {(source: { x: number; y: number }, range: number, opts?: { artilleryKind?: "detonation" | "linger"; damage?: number }) => boolean} hitDecoyIfAny
 * @property {(x1: number, y1: number, x2: number, y2: number, extra: number, opts?: { laserOneShotId?: number; damage?: number }) => boolean} hitDecoyAlongSegment
 * @property {(x: number, y: number) => { q: number; r: number }} [worldToHex]
 * @property {(q: number, r: number) => { x: number; y: number }} [hexToWorld]
 * @property {(q: number, r: number) => boolean} [isArenaHexTile]
 * @property {(x: number, y: number) => boolean} [isWorldPointOnSurgeLockBarrierTile]
 * @property {(x: number, y: number) => boolean} [isWorldPointOnSpecialSpawnerForbiddenHex]
 * @property {(h: any) => void} [ejectSpawnerHunterFromSpecialHexFootprint]
 * @property {() => number} [getDifficultyClockSec] — survival clock minus safehouse freeze (defaults to `getSimElapsed`).
 * @property {() => number} [getRunLevel] — accepted sanctuary level-ups for enemy scaling (defaults to 0).
 * @property {(x: number, y: number) => boolean} [isWorldPointOnSafehouseBarrierDisk]
 * @property {(h: any) => void} [clampHunterOutsideSafehouseDisk]
 * @property {(x: number, y: number) => boolean} [isWorldPointOnForgeRouletteBarrierTile]
 * @property {() => string | null} [getActivePathId]
 * @property {() => object} [getInventory] — for `clubsInvisUntil` / rogue stealth windows
 * @property {() => number} [getPlayerUntargetableUntil]
 * @property {(hunter: any, player: any, nearestDecoy: (h: any) => any, hasLOS: (a: any, b: any) => boolean, fallback: { x: number; y: number }, elapsed: number) => any} [pickRogueHunterTarget]
 * @property {(circle: { x: number; y: number; r: number }, elapsed: number) => boolean} [collidesValiantEnemyShockField] — hunter-only shock rects (Valiant W)
 * @property {() => { x: number; y: number; r: number; lureR: number } | null} [getBulwarkPlantedFlag] — planted Bulwark flag lures hunters in radius
 * @property {() => string | null} [getDebugHunterTypeFilter] — debug-only forced wave spawn type (null = normal mix)
 * @property {() => boolean} [getSwampBootlegColourblind] — swamp crystal curse: uniform grey-green hunter bodies
 * @property {() => boolean} [getSuppressDepthsBossNormalSpawns] — Depths display L5: no wave spawns / scheduled jobs
 * @property {() => boolean} [getSuppressDepthsBossBloomRespawn] — When true with boss spawns suppressed, do not auto-respawn `depthsEldritchBloom` (e.g. post-P3 victory ascent).
 * @property {() => number | null} [getDepthsBossRisingWaveFrontY] — Depths L5: world Y of rising tide front (+Y down); null when inactive
 */

export function createHunterRuntime(/** @type {HunterRuntimeDeps} */ deps) {
  const {
    getSimElapsed,
    getPlayer,
    getObstacles,
    getDecoys,
    getCharacterId,
    rand,
    getViewSize,
    damagePlayer,
    hitDecoyIfAny,
    hitDecoyAlongSegment,
    worldToHex: worldToHexDep,
    hexToWorld: hexToWorldDep,
    isArenaHexTile: isArenaHexTileDep,
    isWorldPointOnSurgeLockBarrierTile: surgeBarrierDep,
    isWorldPointOnSpecialSpawnerForbiddenHex: forbiddenHexDep,
    ejectSpawnerHunterFromSpecialHexFootprint: ejectSpawnerDep,
    getDifficultyClockSec: getDifficultyClockSecDep,
    getRunLevel: getRunLevelDep,
    isWorldPointOnSafehouseBarrierDisk: safehouseBarrierDep,
    clampHunterOutsideSafehouseDisk: clampSafehouseDep,
    isWorldPointOnForgeRouletteBarrierTile: forgeRouletteBarrierDep,
    getActivePathId: getActivePathIdDep,
    getInventory: getInventoryDep,
    getPlayerUntargetableUntil: getPlayerUntargetableUntilDep,
    pickRogueHunterTarget: pickRogueHunterTargetDep,
    collidesValiantEnemyShockField: collidesValiantEnemyShockFieldDep,
    getBulwarkPlantedFlag: getBulwarkPlantedFlagDep,
    getDebugHunterTypeFilter: getDebugHunterTypeFilterDep,
    getSwampBootlegColourblind: getSwampBootlegColourblindDep,
    getSuppressDepthsBossNormalSpawns: getSuppressDepthsBossNormalSpawnsDep,
    getSuppressDepthsBossBloomRespawn: getSuppressDepthsBossBloomRespawnDep,
    getDepthsBossRisingWaveFrontY: getDepthsBossRisingWaveFrontYDep,
  } = deps;

  const worldToHex = worldToHexDep ?? (() => ({ q: 0, r: 0 }));
  const hexToWorld = hexToWorldDep ?? ((q, r) => ({ x: 0, y: 0 }));
  const isArenaHexTile = isArenaHexTileDep ?? (() => false);
  const isWorldPointOnSurgeLockBarrierTile = surgeBarrierDep ?? (() => false);
  const isWorldPointOnSpecialSpawnerForbiddenHex = forbiddenHexDep ?? (() => false);
  const ejectSpawnerHunterFromSpecialHexFootprint = ejectSpawnerDep ?? (() => {});
  const getDifficultyClockSec = getDifficultyClockSecDep ?? getSimElapsed;
  const getRunLevel = getRunLevelDep ?? (() => 0);
  const isWorldPointOnSafehouseBarrierDisk = safehouseBarrierDep ?? (() => false);
  const clampHunterOutsideSafehouseDisk = clampSafehouseDep ?? (() => {});
  const isWorldPointOnForgeRouletteBarrierTile = forgeRouletteBarrierDep ?? (() => false);
  const getActivePathId = getActivePathIdDep ?? (() => null);
  const getInventory = getInventoryDep ?? (() => ({}));
  const getPlayerUntargetableUntil = getPlayerUntargetableUntilDep ?? (() => 0);
  const pickRogueHunterTarget = pickRogueHunterTargetDep ?? null;
  const getBulwarkPlantedFlag = getBulwarkPlantedFlagDep ?? (() => null);
  const getDebugHunterTypeFilter = getDebugHunterTypeFilterDep ?? (() => null);
  const getSwampBootlegColourblind = getSwampBootlegColourblindDep ?? (() => false);
  const suppressDepthsBossBloomRespawn = () => getSuppressDepthsBossBloomRespawnDep?.() === true;
  const getDepthsBossRisingWaveFrontY = getDepthsBossRisingWaveFrontYDep ?? (() => null);

  /** Half flat-to-flat span of one hex (pointy hex, `HEX_SIZE` = circumradius). */
  const DEPTHS_BOLT_AGENCY_DIST = (HEX_SIZE * Math.sqrt(3)) / 2;
  /** Time between single bolt-minion shots (`depthsBoltSpawner`). */
  const DEPTHS_BOLT_SPAWN_INTERVAL_SEC = 0.9;
  /** P2 scripted swarm from eldritch bloom only: scales initial bolt-dash (`depthsBoltSpawner` unchanged). */
  const DEPTHS_SWARM_BLOOM_SPIT_SPEED_MULT = 0.56;
  /** Depths sniper shells: ~3× default off–fire-path radius, shorter windup (non–fire-path only). */
  const DEPTHS_SNIPER_ZONE_R_MULT = 3;
  const DEPTHS_SNIPER_WINDUP_MULT = 0.8;
  /** Halls bishop holy artillery: larger predictive white-hot ignition field. */
  const HALLS_BISHOP_HOLY_CAST_COOLDOWN_SEC = 2.6;
  const HALLS_BISHOP_HOLY_WINDUP_SEC = 0.92;
  const HALLS_BISHOP_HOLY_ZONE_R = 96;
  const HALLS_BISHOP_HOLY_LINGER_SEC = 2.8;
  const HALLS_BISHOP_HOLY_TICK_SEC = 0.2;
  const HALLS_BISHOP_HOLY_AHEAD_FACING_PX = 220;
  const HALLS_BISHOP_HOLY_LEAD_SEC = 0.7;
  const HALLS_BISHOP_HEAVEN_TRIGGER_SEC = 15;
  const HALLS_BISHOP_HEAVEN_PRAY_SEC = 2;
  const HALLS_BISHOP_HEAVEN_CHASE_R = 56;
  const HALLS_BISHOP_HEAVEN_TICK_SEC = 0.2;
  const HALLS_BISHOP_HEAVEN_CHASE_SPEED = 240;
  const HALLS_PAWN_DIAG_VOLLEY_COOLDOWN_SEC = 1.35;
  const HALLS_PAWN_DIAG_VOLLEY_MATCH_EPS_PX = 110;
  const HALLS_PAWN_DIAG_VOLLEY_MIN_DIST_PX = 120;
  const HALLS_PAWN_DIAG_VOLLEY_MAX_DIST_PX = HALLS_PAWN_DASH_PX * 2.75;
  const HALLS_PAWN_DIAG_LEAP_MUL = 1.4;
  const HALLS_KNIGHT_LAND_BARRAGE_COUNT = 14;
  const HALLS_KNIGHT_LAND_BARRAGE_SPEED = 520;
  const HALLS_KNIGHT_LAND_BARRAGE_LIFE_SEC = 1.55;
  const HALLS_KNIGHT_LAND_BARRAGE_BOLT_R = 7.5;
  const HALLS_QUEEN_ORBIT_R = HEX_SIZE * 1.06;
  const HALLS_QUEEN_ORBIT_SPEED = 380;
  const HALLS_QUEEN_CHARGE_SPEED_MUL = 1.8;
  const HALLS_QUEEN_CHARGE_MIN_SEC = 0.4;
  const HALLS_QUEEN_CHARGE_MAX_SEC = 0.9;
  const HALLS_QUEEN_BOUNDARY_R = HEX_SIZE * 0.94;
  const HALLS_QUEEN_ARC_BOLTS = 12;
  const HALLS_QUEEN_ARC_SPREAD_RAD = Math.PI * 1.15;
  const HALLS_QUEEN_ARC_BOLT_SPEED = 880;
  const HALLS_QUEEN_ARC_BOLT_LIFE = 0.9;
  const HALLS_QUEEN_ARC_BOLT_R = 9;
  const HALLS_ROOK_AURA_R = 142;
  const HALLS_ROOK_AURA_TICK_SEC = 0.26;
  const HALLS_KING_CAST_INTERVAL_PHASE1_SEC = 4;
  const HALLS_KING_CAST_INTERVAL_PHASE2_SEC = 3;
  const HALLS_KING_CAST_INTERVAL_PHASE3_SEC = 2;
  const HALLS_KING_CAST_PHASE2_AT_SEC = 20;
  const HALLS_KING_CAST_PHASE3_AT_SEC = 40;
  const HALLS_KING_GLOW_FALLOFF_SEC = 4;
  const HALLS_KING_ROOK_LINE_COUNT = 6;
  const HALLS_KING_ROOK_LINE_SPAN = HEX_SIZE * 1.7;
  const HALLS_KING_ROOK_LINE_START_OFF = HEX_SIZE * 1.55;
  const HALLS_KING_ROOK_LINE_SPEED = 710;
  const HALLS_KING_ROOK_LINE_LIFE = 3.4;
  const HALLS_KING_BISHOP_LINE_COUNT = 5;
  const HALLS_KING_BISHOP_LINE_SPAN = HEX_SIZE * 1.7;
  const HALLS_KING_BISHOP_LINE_START_OFF = HEX_SIZE * 1.65;
  const HALLS_KING_BISHOP_LINE_SPEED = 710;
  const HALLS_KING_BISHOP_LINE_LIFE = 3.4;
  /** Orthogonal rook waves (file then rank); bishop second diagonal follows this gap. */
  const HALLS_KING_LINE_DOUBLE_GAP_SEC = 0.36;
  /** King line “coin” uses full art radius; player hit uses this cap (see `updateCollisions`). */
  const HALLS_KING_LINE_HIT_R = 18;
  const HALLS_KING_SPIRAL_BOLT_TOTAL = 72;
  const HALLS_KING_SPIRAL_DURATION_SEC = 2;
  const HALLS_KING_SPIRAL_REVOLUTIONS = 3;
  const HALLS_KING_SPIRAL_SPEED = 520;
  const HALLS_KING_SPIRAL_LIFE = 2.85;
  const HALLS_KING_SPIRAL_BOLT_R = 8;
  /** King-summoned queen: orbit / charge pacing (wave queens use full speed). */
  const HALLS_QUEEN_EVENT_ORBIT_SPEED_MULT = 0.76;
  const HALLS_QUEEN_EVENT_CHARGE_GLIDE_MULT = 0.82;
  const HALLS_PAWN_EVENT_COOLDOWN_MULT = 1.38;
  const HALLS_PAWN_EVENT_DIAG_VOLLEY_MULT = 1.42;
  const HALLS_KING_PAWN_RAIN_COUNT = 4;
  const HALLS_KING_PAWN_RAIN_STEP_SEC = 0.34;
  const HALLS_KING_PAWN_RAIN_LIFE_SEC = 6;
  const HALLS_KING_QUEEN_SUMMON_LIFE_SEC = 6;
  const DEPTHS_SHARD_SPREAD_RAD = (20 * Math.PI) / 180;
  const DEPTHS_SHARD_DASH_MULT = 3;
  const DEPTHS_SHARD_BASE_DASH = 124;
  let nextHunterUid = 0;
  function pushHunter(/** @type {any} */ h) {
    nextHunterUid += 1;
    h.hunterUid = nextHunterUid;
    entities.hunters.push(h);
  }

  /** Ghost dashes run to predicted target + this many pixels along aim (not a fixed world cap). */
  const GHOST_PRED_OVERSHOOT_PX = 40;
  const GHOST_DASH_LEN_MIN = 72;

  const entities = {
    /** @type {any[]} */
    hunters: [],
    /** @type {any[]} */
    projectiles: [],
    /** @type {any[]} */
    laserBeams: [],
    /** @type {any[]} */
    dangerZones: [],
    /** @type {any[]} */
    bullets: [],
    /** @type {any[]} */
    fireArcs: [],
    /** @type {any[]} */
    swampPools: [],
    /** @type {any[]} */
    swampBursts: [],
    /** @type {any[]} */
    hallsPawnImpacts: [],
  };
  let suppressRangedAttacksNow = false;
  /** Unique id per damaging laser beam — Bulwark flag takes at most 1 HP per beam from the segment. */
  let nextLaserBeamDamageId = 1;

  const spawnState = {
    wave: 0,
    spawnInterval: SPAWN_INTERVAL_START,
    nextSpawnAt: 0,
    /** @type {{ at: number; fn: () => void }[]} */
    spawnScheduled: [],
  };

  let spawnDifficultyAnchorSurvival = 0;
  let boneGhostNextSpawnAt = null;

  function relDifficultySurvivalSec() {
    return Math.max(0, getDifficultyClockSec() - spawnDifficultyAnchorSurvival);
  }

  function getDangerRamp01() {
    return clamp(relDifficultySurvivalSec() / DANGER_RAMP_SECONDS, 0, 1);
  }

  function getSpawnIntervalFromRunTime() {
    if (hallsPathActive()) {
      return getHallsSpawnIntervalSec(relDifficultySurvivalSec());
    }
    const t = getDangerRamp01();
    return SPAWN_INTERVAL_START + (SPAWN_INTERVAL_FLOOR - SPAWN_INTERVAL_START) * t;
  }

  function getWaveSpawnJobsFromRunTime() {
    if (hallsPathActive()) {
      return getHallsWaveSpawnJobs(relDifficultySurvivalSec());
    }
    return BASE_WAVE_SPAWN_JOBS + midgameEscalationTicks();
  }

  function midgameEscalationTicks() {
    const t = relDifficultySurvivalSec();
    if (t < MIDGAME_ESCALATION_START_SEC) return 0;
    return 1 + Math.floor((t - MIDGAME_ESCALATION_START_SEC) / MIDGAME_ESCALATION_INTERVAL_SEC);
  }

  function midgameEnemySpeedMult() {
    const n = midgameEscalationTicks();
    if (n <= 0) return 1;
    return Math.pow(MIDGAME_ESCALATION_SPEED_FACTOR, n);
  }

  function runLevelEnemySpeedMult() {
    const lv = getRunLevel();
    if (lv <= 0) return 1;
    return Math.pow(1.15, lv);
  }
  function runLevelEnemyAccelMult() {
    const lv = getRunLevel();
    if (lv <= 0) return 1;
    return Math.pow(1.1, lv);
  }
  function spades13AuraEnemyDtMult() {
    return 1;
  }
  function bonePathActive() {
    return getActivePathId() === "bone";
  }
  function depthsPathActive() {
    return getActivePathId() === "depths";
  }
  function hallsPathActive() {
    return getActivePathId() === "halls";
  }
  function isHallsChessPieceType(type) {
    return (
      type === HALLS_PIECE_IDS.PAWN ||
      type === HALLS_PIECE_IDS.ROOK ||
      type === HALLS_PIECE_IDS.KNIGHT ||
      type === HALLS_PIECE_IDS.BISHOP ||
      type === HALLS_PIECE_IDS.QUEEN ||
      type === HALLS_PIECE_IDS.KING
    );
  }
  function boneEnemySpeedMult() {
    return bonePathActive() ? 1.2 : 1;
  }

  function collidesAnyObstacle(circle) {
    for (const obstacle of getObstacles()) {
      if (intersectsRectCircle(circle, obstacle)) return true;
    }
    return false;
  }

  function hasLineOfSight(from, target, opts = {}) {
    const ignoreObstacles = !!opts.ignoreObstacles;
    for (let s = 0; s <= 20; s++) {
      const u = s / 20;
      const sx = from.x + (target.x - from.x) * u;
      const sy = from.y + (target.y - from.y) * u;
      if (isWorldPointOnSurgeLockBarrierTile(sx, sy)) return false;
      if (isWorldPointOnSafehouseBarrierDisk(sx, sy)) return false;
      if (isWorldPointOnForgeRouletteBarrierTile(sx, sy)) return false;
    }
    if (!ignoreObstacles) {
      for (const obstacle of getObstacles()) {
        if (lineIntersectsRect(from.x, from.y, target.x, target.y, obstacle)) return false;
      }
    }
    return true;
  }

  function getLaserEndpoint(x, y, dx, dy, maxLen = 900, opts = {}) {
    const throughObstacles = !!opts.throughObstacles;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    let lastX = x;
    let lastY = y;
    for (let d = 8; d <= maxLen; d += 8) {
      const px = x + ux * d;
      const py = y + uy * d;
      if (isWorldPointOnSurgeLockBarrierTile(px, py)) {
        return { x: lastX, y: lastY };
      }
      if (isWorldPointOnSafehouseBarrierDisk(px, py)) {
        return { x: lastX, y: lastY };
      }
      if (isWorldPointOnForgeRouletteBarrierTile(px, py)) {
        return { x: lastX, y: lastY };
      }
      if (!throughObstacles) {
        for (const obstacle of getObstacles()) {
          if (px >= obstacle.x && px <= obstacle.x + obstacle.w && py >= obstacle.y && py <= obstacle.y + obstacle.h) {
            return { x: lastX, y: lastY };
          }
        }
      }
      lastX = px;
      lastY = py;
    }
    return { x: lastX, y: lastY };
  }

  function moveCircleWithCollisions(entity, vx, vy, dt, opts = {}) {
    const ignoreObstacles = !!opts.ignoreObstacles;
    const blockValiantShock = !!opts.blockValiantEnemyShockFields;
    const elapsed = getSimElapsed();
    let touchedObstacle = false;
    const nx = { x: entity.x + vx * dt, y: entity.y, r: entity.r };
    const nxBlocked =
      outOfBoundsCircle(nx) ||
      isWorldPointOnForgeRouletteBarrierTile(nx.x, nx.y) ||
      (!ignoreObstacles && collidesAnyObstacle(nx)) ||
      (blockValiantShock && !!collidesValiantEnemyShockFieldDep?.(nx, elapsed));
    if (!nxBlocked) entity.x = nx.x;
    else if (!ignoreObstacles) touchedObstacle = true;
    const ny = { x: entity.x, y: entity.y + vy * dt, r: entity.r };
    const nyBlocked =
      outOfBoundsCircle(ny) ||
      isWorldPointOnForgeRouletteBarrierTile(ny.x, ny.y) ||
      (!ignoreObstacles && collidesAnyObstacle(ny)) ||
      (blockValiantShock && !!collidesValiantEnemyShockFieldDep?.(ny, elapsed));
    if (!nyBlocked) entity.y = ny.y;
    else if (!ignoreObstacles) touchedObstacle = true;
    return { touchedObstacle };
  }

  function nearestDecoy(from) {
    const list = getDecoys();
    if (!list.length) return null;
    let best = null;
    let bestDist = Infinity;
    for (const d of list) {
      const score = distSq(from, d);
      if (score < bestDist) {
        bestDist = score;
        best = d;
      }
    }
    return best;
  }

  function pickTargetForHunter(hunter) {
    const player = getPlayer();
    const elapsed = getSimElapsed();
    const fallback = { x: hunter.x + hunter.dir.x * 40, y: hunter.y + hunter.dir.y * 40 };
    /** Depths L5 eldritch chase: hunters must keep real aggro (clubs burst invis / post-hit untargetable / rogue misdirection). */
    const depthsBossChaseIgnoresPlayerStealth =
      depthsPathActive() && !!getSuppressDepthsBossNormalSpawnsDep?.();

    if (!depthsBossChaseIgnoresPlayerStealth && elapsed < getPlayerUntargetableUntil()) {
      return nearestDecoy(hunter) || fallback;
    }

    const bFlag = getBulwarkPlantedFlag();
    if (bFlag) {
      const lr = bFlag.lureR ?? 300;
      if (distSq(hunter, bFlag) <= lr * lr) {
        return { x: bFlag.x, y: bFlag.y, r: bFlag.r ?? 26 };
      }
    }

    const inv = getInventory();
    if (!depthsBossChaseIgnoresPlayerStealth && getCharacterId() === "rogue" && pickRogueHunterTarget) {
      return pickRogueHunterTarget(hunter, player, inv, nearestDecoy, hasLineOfSight, fallback, elapsed);
    }

    if (!depthsBossChaseIgnoresPlayerStealth && elapsed < (inv.clubsInvisUntil ?? 0)) {
      return nearestDecoy(hunter) || fallback;
    }
    if (
      !depthsBossChaseIgnoresPlayerStealth &&
      getCharacterId() === "rogue" &&
      elapsed < (inv.spadesLandingStealthUntil ?? 0)
    ) {
      return nearestDecoy(hunter) || fallback;
    }

    const target = player;
    if (!getDecoys().length) return target;
    if (
      hunter.type === "chaser" ||
      hunter.type === "frogChaser" ||
      hunter.type === "fast" ||
      hunter.type === "depthsShardChaser"
    ) {
      return nearestDecoy(hunter) || target;
    }
    if (hunter.type === "cutter") {
      const decoy = nearestDecoy(hunter);
      if (decoy && distSq(hunter, decoy) < 240 * 240) return decoy;
    }
    return target;
  }

  function anyOtherEnemyHasLineOfSightToPlayer(excludedHunter) {
    const elapsed = getSimElapsed();
    const player = getPlayer();
    for (const h of entities.hunters) {
      if (h === excludedHunter) continue;
      if (h.type === "depthsTentacle") continue;
      if (
        h.type === "spawner" ||
        h.type === "airSpawner" ||
        h.type === "depthsBoltSpawner" ||
        (h.type === "cryptSpawner" && h.cryptDisguised)
      )
        continue;
      if (elapsed < (h.stunnedUntil || 0)) continue;
      if (hasLineOfSight(h, player)) return true;
    }
    return false;
  }

  function avoidObstacles(hunter, desired) {
    const lookAhead = 30;
    const sample = {
      x: hunter.x + desired.x * lookAhead,
      y: hunter.y + desired.y * lookAhead,
      r: hunter.r,
    };
    if (!collidesAnyObstacle(sample)) return desired;
    let ax = 0;
    let ay = 0;
    for (const obstacle of getObstacles()) {
      const closestX = clamp(hunter.x, obstacle.x, obstacle.x + obstacle.w);
      const closestY = clamp(hunter.y, obstacle.y, obstacle.y + obstacle.h);
      const awayX = hunter.x - closestX;
      const awayY = hunter.y - closestY;
      const dist = Math.hypot(awayX, awayY) || 1;
      const influence = 1 / Math.max(25, dist);
      ax += (awayX / dist) * influence;
      ay += (awayY / dist) * influence;
    }
    const mixX = desired.x * 0.65 + ax * 35;
    const mixY = desired.y * 0.65 + ay * 35;
    const len = Math.hypot(mixX, mixY) || 1;
    return { x: mixX / len, y: mixY / len };
  }

  function pickRegularHunterType() {
    if (depthsPathActive()) {
      const r = Math.random();
      if (r < 0.25) return "depthsBoltSpawner";
      if (r < 0.5) return "depthsShardChaser";
      if (r < 0.75) return "depthsGrappleLaser";
      return "sniper";
    }
    if (relDifficultySurvivalSec() >= LATE_GAME_ELITE_SPAWN_SEC) {
      const er = Math.random();
      if (er < 0.055) return "airSpawner";
      if (er < 0.11) return "laserBlue";
    }
    const boneCrypt = bonePathActive() && getRunLevel() >= 2;
    const cryptChance = boneCrypt ? 0.22 + 0.55 * getDangerRamp01() : 0;
    if (boneCrypt && Math.random() < cryptChance) return "cryptSpawner";
    const roll = Math.random();
    if (roll < 0.25) return getActivePathId() === "swamp" ? "frogChaser" : "chaser";
    if (roll < 0.44) return "cutter";
    if (roll < 0.61) {
      const swampL3Plus = getActivePathId() === "swamp" && getRunLevel() >= 2;
      if (swampL3Plus && Math.random() > SWAMP_L3PLUS_SNIPER_WAVE_KEEP_FRACTION) {
        const r2 = Math.random();
        if (r2 < 0.45) return "frogChaser";
        if (r2 < 0.8) return "cutter";
        return "ranged";
      }
      return "sniper";
    }
    if (roll < 0.78) return "ranged";
    if (roll < 0.93) return "laser";
    // Bone L3+: replace the normal spawner slot with the crypt mimic so it is clearly present.
    if (boneCrypt) return "cryptSpawner";
    return "spawner";
  }

  function pickWaveHunterType() {
    const forced = getDebugHunterTypeFilter();
    if (typeof forced === "string" && forced) return forced;
    return pickRegularHunterType();
  }

  function hunterRadiusForType(type) {
    if (type === "sniper") return 12;
    if (type === "ghost") return 14;
    if (type === "depthsTentacle") return 8;
    if (type === "depthsEldritchBloom") return 40;
    if (type === "spawner" || type === "cryptSpawner") return 18;
    if (type === "airSpawner" || type === "depthsBoltSpawner") return 26;
    if (type === "laser" || type === "laserBlue" || type === "depthsGrappleLaser") return 13;
    if (type === "depthsShardChaser") return 10;
    if (type === "depthsEldritchBarrageBolt") return 6.5;
    if (type === "depthsEldritchCageLunge") return 11;
    if (type === "fast") return 9;
    if (type === "frogChaser") return 11;
    if (isHallsChessPieceType(type)) return HALLS_COIN_HIT_RADIUS_PX;
    return 10;
  }

  function randomOpenPointAround(cx, cy, radiusMin, radiusMax, r, attempts = 40, opts = {}) {
    const excludeSpecialHex = !!opts.excludeSpecialHex;
    for (let i = 0; i < attempts; i++) {
      const ang = Math.random() * Math.PI * 2;
      const d = rand(radiusMin, radiusMax);
      const candidate = { x: cx + Math.cos(ang) * d, y: cy + Math.sin(ang) * d, r };
      if (excludeSpecialHex && isWorldPointOnSpecialSpawnerForbiddenHex(candidate.x, candidate.y)) continue;
      if (outOfBoundsCircle(candidate)) continue;
      if (!collidesAnyObstacle(candidate)) return candidate;
    }
    return { x: cx, y: cy, r };
  }

  function nearestLegalPointForSmallHunter(cx, cy, r) {
    const center = { x: cx, y: cy, r };
    if (!collidesAnyObstacle(center) && !outOfBoundsCircle(center) && !isWorldPointOnSpecialSpawnerForbiddenHex(center.x, center.y)) {
      return center;
    }
    const STEP = 5;
    const ANGLES = 32;
    const MAX_R = 260;
    for (let rad = STEP; rad <= MAX_R; rad += STEP) {
      for (let i = 0; i < ANGLES; i++) {
        const ang = (i / ANGLES) * Math.PI * 2;
        const cand = { x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad, r };
        if (
          !outOfBoundsCircle(cand) &&
          !collidesAnyObstacle(cand) &&
          !isWorldPointOnSpecialSpawnerForbiddenHex(cand.x, cand.y)
        ) {
          return cand;
        }
      }
    }
    return { x: cx, y: cy, r };
  }

  function resolveFastSpawnNearAirSpawner(h, fastR) {
    const ideal = randomOpenPointAround(h.x, h.y, h.r + 12, h.r + 40, fastR, 56, { excludeSpecialHex: true });
    return nearestLegalPointForSmallHunter(ideal.x, ideal.y, fastR);
  }

  function scheduleNextBoneGhostSpawn(fromElapsed, isRespawn) {
    if (isRespawn) boneGhostNextSpawnAt = fromElapsed + rand(1.5, 8);
    else if (getRunLevel() >= 2) boneGhostNextSpawnAt = fromElapsed + 0.02;
    else boneGhostNextSpawnAt = fromElapsed + 60;
  }

  function spawnHunter(type, customX, customY, opts) {
    const elapsed = getSimElapsed();
    const player = getPlayer();
    let r = 10;
    let life = 8;
    let lastShotAt = elapsed + rand(0.3, 1.1);
    const h = {
      type,
      x: 0,
      y: 0,
      r: 10,
      bornAt: elapsed,
      dieAt: elapsed + life,
      lastShotAt: 0,
      dir: { x: 1, y: 0 },
      hitLockUntil: 0,
    };
    if (isHallsChessPieceType(type)) h.hallsPieceType = type;
    else if (opts?.hallsPieceType) h.hallsPieceType = opts.hallsPieceType;
    if (opts?.hallsEventSpawn) h.hallsEventSpawn = true;
    if (opts?.hallsKingSummonedQueen) h.hallsKingSummonedQueen = true;
    if (opts?.hallsKingPawnSummon) h.hallsKingPawnSummon = true;

    if (type === "sniper") {
      r = 12;
      life = 8;
      lastShotAt = elapsed + rand(0.6, 1.2);
    } else if (type === "chaser") {
      r = 10;
      life = 8;
      lastShotAt = elapsed + rand(0.3, 1.1);
      h.chaserDashPhase = "chase";
      h.chaserDashNextReady = elapsed + rand(0.35, 1.0);
    } else if (type === "frogChaser") {
      r = 11;
      life = 8;
      lastShotAt = elapsed + rand(0.3, 1.1);
      h.chaserDashPhase = "chase";
      h.chaserDashNextReady = elapsed;
    } else if (type === "cutter") {
      r = 10;
      life = 8;
      lastShotAt = elapsed + rand(0.3, 1.1);
    } else if (type === "ranged") {
      r = 10;
      life = 8;
      lastShotAt = elapsed + rand(0.4, 1.0);
      h.shotInterval = 1.35;
      h.shotSpeed = 360;
    } else if (type === "laser") {
      r = 13;
      life = 8;
      lastShotAt = elapsed + rand(0.6, 1.2);
      h.laserState = "move";
      h.aimStartedAt = 0;
      h.nextLaserReadyAt = elapsed + rand(0.7, 1.4);
      h.laserCooldown = 1.0;
      h.laserWarning = 0.42;
      h.laserAim = null;
    } else if (type === "laserBlue") {
      r = 13;
      life = 8;
      lastShotAt = elapsed + rand(0.5, 1.0);
      h.laserState = "move";
      h.aimStartedAt = 0;
      h.nextLaserReadyAt = elapsed + rand(0.55, 1.1);
      h.laserCooldown = LASER_BLUE_COOLDOWN_SEC;
      h.laserWarning = LASER_BLUE_WARN_SEC;
      h.laserAim = null;
    } else if (type === "fast") {
      r = 9;
      life = 2;
      lastShotAt = elapsed + 999;
      if (opts?.boneSwarmPhasing) h.boneSwarmPhasing = true;
      if (opts?.swampMudSpawn) h.swampMudSpawn = true;
      if (opts?.depthsBoltMinion) {
        h.depthsBoltMinion = true;
        h.depthsBoltUnagitated = true;
        const bdx = opts.depthsBoltDir?.x ?? 1;
        const bdy = opts.depthsBoltDir?.y ?? 0;
        const bl = Math.hypot(bdx, bdy) || 1;
        h.depthsBoltDir = { x: bdx / bl, y: bdy / bl };
        h.depthsBoltOx = opts.depthsBoltOx != null ? opts.depthsBoltOx : h.x;
        h.depthsBoltOy = opts.depthsBoltOy != null ? opts.depthsBoltOy : h.y;
        if (opts.depthsBoltSpitSpeedMult != null && Number.isFinite(opts.depthsBoltSpitSpeedMult)) {
          h.depthsBoltSpitSpeedMult = clamp(opts.depthsBoltSpitSpeedMult, 0.15, 1.5);
        }
      }
    } else if (type === "spawner") {
      r = 18;
      life = 8;
      lastShotAt = elapsed + 999;
      h.spawnDelayUntil = elapsed + (bonePathActive() ? 0.4 : 2);
      h.spawnActiveUntil = elapsed + 8;
      h.nextSwarmAt = h.spawnDelayUntil;
      h.swarmInterval = 0.6;
      h.swarmN = 5;
      h.fastR = 10;
    } else if (type === "cryptSpawner") {
      r = 18;
      life = 20;
      lastShotAt = elapsed + 999;
      h.cryptDisguised = true;
      h.spawnDelayUntil = elapsed + 9999;
      h.spawnActiveUntil = elapsed + 9999;
      h.nextSwarmAt = elapsed + 9999;
      h.swarmInterval = 0.6;
      h.swarmN = 5;
      h.fastR = 10;
    } else if (type === "airSpawner") {
      r = 26;
      life = 9;
      lastShotAt = elapsed + 999;
      h.spawnDelayUntil = elapsed;
      h.spawnActiveUntil = elapsed + 9;
      h.nextSwarmAt = elapsed;
      h.swarmInterval = 0.62;
      h.swarmN = 5;
      h.fastR = 10;
    } else if (type === "depthsBoltSpawner") {
      r = 26;
      life = 9;
      lastShotAt = elapsed + 999;
      h.spawnDelayUntil = elapsed;
      h.spawnActiveUntil = elapsed + 9;
      h.nextSwarmAt = elapsed;
      h.swarmInterval = DEPTHS_BOLT_SPAWN_INTERVAL_SEC;
      h.swarmN = 1;
      h.fastR = 10;
    } else if (type === "depthsShardChaser") {
      r = 10;
      life = 8;
      lastShotAt = elapsed + rand(0.3, 1.1);
      if (opts?.shardClone) {
        h.chaserDashPhase = "dashing";
        h.chaserDashDir = { x: opts.shardDashDir.x, y: opts.shardDashDir.y };
        h.chaserDashDist = opts.shardDashDist ?? DEPTHS_SHARD_BASE_DASH * DEPTHS_SHARD_DASH_MULT;
        h.shardsSyncDashReady = opts.shardsSyncDashReady ?? elapsed + 1.65;
      } else {
        h.chaserDashPhase = "chase";
        h.chaserDashNextReady = elapsed + rand(0.35, 1.0);
      }
    } else if (type === "depthsGrappleLaser") {
      r = 13;
      life = 8;
      lastShotAt = elapsed + rand(0.6, 1.2);
      h.laserState = "move";
      h.aimStartedAt = 0;
      h.nextLaserReadyAt = elapsed + rand(0.7, 1.4);
      h.laserCooldown = 1.0;
      h.laserWarning = 0.42;
      h.laserAim = null;
    } else if (type === "depthsTentacle") {
      /** Total sweep during spin (not a full turn). */
      h.depthsSpinRad = (260 * Math.PI) / 180;
      r = 8;
      lastShotAt = elapsed + 999;
      const leg = nearestLegalPointForSmallHunter(customX ?? player.x, customY ?? player.y, 8);
      h.depthsAnchorX = leg.x;
      h.depthsAnchorY = leg.y;
      h.depthsSpawnAt = elapsed;
      const EMERGE = 0.38;
      const COIL = 0.38;
      const SPIN = 0.46 / 2.5;
      const SPLASH = 0;
      h.depthsEmergeEnd = elapsed + EMERGE;
      h.depthsTelegraphEnd = h.depthsEmergeEnd;
      h.depthsCoilEnd = h.depthsTelegraphEnd + COIL;
      h.depthsStrikeEnd = h.depthsCoilEnd + SPIN;
      h.depthsMotionEnd = h.depthsStrikeEnd;
      h.depthsSplashEnd = h.depthsMotionEnd + SPLASH;
      h.dieAt = h.depthsStrikeEnd;
      life = Math.max(0.5, h.dieAt - elapsed);
      h.depthsReach = 0;
      h.depthsSlamDirX = 1;
      h.depthsSlamDirY = 0;
      h.depthsDamaged = false;
      h.depthsCoilInit = false;
      h.depthsCoilSign = (Math.floor(Math.abs((customX ?? 0) * 13 + (customY ?? 0) * 7)) & 1) === 0 ? -1 : 1;
      h.depthsSlamPrevAngle = null;
      h.depthsGrazedDecoys = [];
      h.depthsSplashU = 0;
      h.opacity = 1;
      h.x = h.depthsAnchorX;
      h.y = h.depthsAnchorY;
    } else if (type === "depthsEldritchBarrageBolt") {
      r = 6.5;
      life = 3.25;
      lastShotAt = elapsed + 999;
      h.opacity = 1;
      h.depthsEldritchBarrageBolt = true;
      const ang = Number(opts?.eldritchBarrageAngle ?? 0);
      const spd = Number(opts?.eldritchBarrageSpeed ?? 390);
      h.eldritchBarrageVx = Math.cos(ang) * spd;
      h.eldritchBarrageVy = Math.sin(ang) * spd;
    } else if (type === "depthsEldritchCageLunge") {
      r = 11;
      life = 0.58;
      lastShotAt = elapsed + 999;
      h.opacity = 1;
      h.depthsEldritchCageLunge = true;
      h.eldritchCageLungeVx = Number(opts?.eldritchCageLungeVx ?? 0);
      h.eldritchCageLungeVy = Number(opts?.eldritchCageLungeVy ?? 0);
    } else if (type === "depthsEldritchBloom") {
      r = 40;
      life = 86400 * 120;
      lastShotAt = elapsed + 999;
      h.opacity = 1;
      h.depthsOrbitSign = rand() < 0.5 ? -1 : 1;
    } else if (type === "ghost") {
      r = 14;
      life = 20;
      lastShotAt = elapsed + 999;
      h.ghostPhase = "windup1";
      h.ghostWindupEnd = elapsed + 0.76;
      h.ghostDash1Total = 0;
      h.ghostDash2Total = 0;
      h.ghostDashSpeed = 980;
      h.ghostDashDir = { x: 1, y: 0 };
      h.ghostDamageLockUntil = 0;
      h.opacity = 1;
      h.motionTrail = [];
      h.ghostAnchorPlayerX = player.x;
      h.ghostAnchorPlayerY = player.y;
    } else if (isHallsChessPieceType(type)) {
      r = hunterRadiusForType(type);
      life = HALLS_ENEMY_LIFETIME_SEC;
      lastShotAt = elapsed + 999;
      h.hallsGliding = false;
      h.hallsKnightStage = null;
      h.hallsNextThinkAt = elapsed;
      h.hallsPawnVolleyNextAt =
        elapsed + rand(0.25, 0.9) + (opts?.hallsKingPawnSummon && type === HALLS_PIECE_IDS.PAWN ? rand(0.35, 0.75) : 0);
      h.hallsPawnDiagImpactPending = false;
      if (type === HALLS_PIECE_IDS.BISHOP) {
        h.hallsBishopPhase = "approach";
        h.hallsBishopUntil = 0;
        h.hallsBishopLineUx = 0;
        h.hallsBishopLineUy = 0;
        h.hallsBishopHasLastDiag = false;
        h.hallsBishopLastUx = 0;
        h.hallsBishopLastUy = 0;
        h.hallsBishopPendingDestX = 0;
        h.hallsBishopPendingDestY = 0;
        h.hallsHolyGlow = true;
        h.hallsBishopHolyNextAt = elapsed + rand(0.65, 1.3);
        h.hallsBishopHeavenState = "idle";
        h.hallsBishopHeavenStartAt = elapsed + HALLS_BISHOP_HEAVEN_TRIGGER_SEC;
        h.hallsBishopHeavenPrayUntil = 0;
        h.hallsBishopHeavenX = h.x;
        h.hallsBishopHeavenY = h.y;
        h.hallsBishopHeavenTargetX = h.x;
        h.hallsBishopHeavenTargetY = h.y;
        h.hallsBishopHeavenNextTickAt = 0;
      }
      if (type === HALLS_PIECE_IDS.ROOK) {
        h.hallsRookPhase = "approach";
        h.hallsRookUntil = 0;
        h.hallsRookLineUx = 0;
        h.hallsRookLineUy = 0;
        h.hallsRookHasLastDir = false;
        h.hallsRookLastUx = 0;
        h.hallsRookLastUy = 0;
        h.hallsRookPendingDestX = 0;
        h.hallsRookPendingDestY = 0;
        h.hallsRookGlideAxis = "x";
        h.hallsRookAuraNextAt = elapsed + 0.12;
      }
      if (type === HALLS_PIECE_IDS.QUEEN) {
        h.hallsQueenState = "orbit";
        h.hallsQueenOrbitAng = Math.random() * Math.PI * 2;
        h.hallsQueenOrbitDir = Math.random() < 0.5 ? -1 : 1;
        h.hallsQueenChargeNextAt = elapsed + rand(HALLS_QUEEN_CHARGE_MIN_SEC, HALLS_QUEEN_CHARGE_MAX_SEC);
        h.hallsQueenChargeUx = 1;
        h.hallsQueenChargeUy = 0;
        h.hallsQueenWasInside = false;
      }
      if (type === HALLS_PIECE_IDS.KING) {
        h.hallsKingCastNextAt = elapsed + HALLS_KING_CAST_INTERVAL_PHASE1_SEC;
        h.hallsKingGlowColor = "";
        h.hallsKingGlowStartAt = 0;
        h.hallsKingGlowUntil = 0;
        h.hallsKingPawnRainRemaining = 0;
        h.hallsKingPawnRainNextAt = 0;
        h.hallsKingPawnRainExpireAt = 0;
        h.hallsKingSpellBag = [];
        h.hallsKingCastsSinceQueen = 0;
        h.hallsKingLastSpellId = "";
        h.hallsKingCastFollowups = [];
        h.hallsKingGlowVoid = false;
        h.hallsKingSpiralStartAt = 0;
        h.hallsKingSpiralSpawned = 0;
        h.hallsKingSpiralBase = 0;
      }
    }
    if (opts?.hallsKingLineProjectile) {
      h.hallsKingLineProjectile = true;
      h.hallsScriptedVx = Number(opts?.hallsScriptedVx ?? 0);
      h.hallsScriptedVy = Number(opts?.hallsScriptedVy ?? 0);
    }
    if (Number.isFinite(Number(opts?.hallsLockCenterX)) && Number.isFinite(Number(opts?.hallsLockCenterY))) {
      h.hallsLockCenterX = Number(opts.hallsLockCenterX);
      h.hallsLockCenterY = Number(opts.hallsLockCenterY);
    }
    h.r = r;
    h.life = life;
    h.dieAt = type === "depthsTentacle" ? h.dieAt : elapsed + life;
    h.lastShotAt = lastShotAt;
    if (opts?.dieAtOverride != null) h.dieAt = opts.dieAtOverride;
    if (opts?.arenaNexusSpawn) {
      h.arenaNexusSpawn = true;
      h.dieAt = Math.max(h.dieAt, elapsed + ARENA_NEXUS_SIEGE_SEC + 2.5);
    }

    const relocateIfForbidden = () => {
      if (opts?.allowInsideSpecialTile) return;
      if (!isWorldPointOnSpecialSpawnerForbiddenHex(h.x, h.y)) return;
      for (let attempt = 0; attempt < 40; attempt++) {
        const a = Math.random() * Math.PI * 2;
        const dist = rand(280, 780);
        h.x = player.x + Math.cos(a) * dist;
        h.y = player.y + Math.sin(a) * dist;
        const circ = { x: h.x, y: h.y, r: h.r };
        if (!isWorldPointOnSpecialSpawnerForbiddenHex(h.x, h.y) && !collidesAnyObstacle(circ) && !outOfBoundsCircle(circ)) return;
      }
    };

    if (customX != null && customY != null) {
      if (type !== "depthsTentacle") {
        h.x = customX;
        h.y = customY;
      }
      if (type === "depthsTentacle") {
        pushHunter(h);
        return;
      }
      if (type === "spawner" || type === "airSpawner" || type === "cryptSpawner" || type === "depthsBoltSpawner") {
        for (let attempt = 0; attempt < 56; attempt++) {
          ejectSpawnerHunterFromSpecialHexFootprint(h);
          const circ = { x: h.x, y: h.y, r: h.r };
          if (!isWorldPointOnSpecialSpawnerForbiddenHex(h.x, h.y) && !collidesAnyObstacle(circ)) break;
          const a = Math.random() * Math.PI * 2;
          const dist = rand(300, 780);
          h.x = player.x + Math.cos(a) * dist;
          h.y = player.y + Math.sin(a) * dist;
        }
      }
      relocateIfForbidden();
      if (opts?.forceExactPosition) {
        h.x = customX;
        h.y = customY;
      }
      pushHunter(h);
      return;
    }

    if (type === "spawner" || type === "airSpawner" || type === "cryptSpawner" || type === "depthsBoltSpawner") {
      for (let attempt = 0; attempt < 64; attempt++) {
        const ang2 = Math.random() * Math.PI * 2;
        const d2 = rand(320, 760);
        h.x = player.x + Math.cos(ang2) * d2;
        h.y = player.y + Math.sin(ang2) * d2;
        if (isWorldPointOnSpecialSpawnerForbiddenHex(h.x, h.y)) continue;
        const circ = { x: h.x, y: h.y, r: h.r };
        if (collidesAnyObstacle(circ)) continue;
        pushHunter(h);
        return;
      }
    }

    const ang = Math.random() * Math.PI * 2;
    const d = rand(320, 760);
    h.x = player.x + Math.cos(ang) * d;
    h.y = player.y + Math.sin(ang) * d;
    if (type === "spawner" || type === "airSpawner" || type === "cryptSpawner" || type === "depthsBoltSpawner")
      ejectSpawnerHunterFromSpecialHexFootprint(h);
    relocateIfForbidden();
    pushHunter(h);
  }

  function scheduleWaveSpawns() {
    const jobs = [];
    const nJobs = getWaveSpawnJobsFromRunTime();
    const hallsPath = hallsPathActive();
    const hallsRelSec = relDifficultySurvivalSec();
    const player = getPlayer();
    for (let i = 0; i < nJobs; i++) {
      jobs.push(() => {
        let type = pickWaveHunterType();
        let hallsPieceType = null;
        if (hallsPath) {
          if (isHallsChessPieceType(type)) {
            hallsPieceType = type;
            type = resolveHallsPieceHunterType(hallsPieceType);
          } else {
            const spec = pickHallsWaveSpawnSpec(hallsRelSec, Math.random);
            type = spec.hunterType;
            hallsPieceType = spec.pieceType;
          }
        }
        const ang = Math.random() * Math.PI * 2;
        const d = rand(300, 780);
        const x = player.x + Math.cos(ang) * d;
        const y = player.y + Math.sin(ang) * d;
        spawnHunter(type, x, y, hallsPieceType ? { hallsPieceType } : undefined);
      });
    }
    for (let i = jobs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = jobs[i];
      jobs[i] = jobs[j];
      jobs[j] = tmp;
    }
    const elapsed = getSimElapsed();
    const spread = spawnState.spawnInterval * 0.88;
    const t0 = elapsed;
    const n = jobs.length;
    const slot = spread / n;
    for (let i = 0; i < n; i++) {
      const jitter = (Math.random() - 0.5) * slot * 0.5;
      const at = clamp(t0 + (i + 0.5) * slot + jitter, t0 + 0.04, t0 + spread);
      spawnState.spawnScheduled.push({ at, fn: jobs[i] });
    }
    spawnState.spawnScheduled.sort((a, b) => a.at - b.at);
  }

  function advanceSpawnWave() {
    spawnState.wave += 1;
    spawnState.spawnInterval = getSpawnIntervalFromRunTime();
    spawnState.nextSpawnAt = getSimElapsed() + spawnState.spawnInterval;
    scheduleWaveSpawns();
  }

  function sniperArtillerySuppressedByRoulette(sniperX, sniperY, aimX, aimY) {
    if (isWorldPointOnSurgeLockBarrierTile(aimX, aimY)) return true;
    if (isWorldPointOnSafehouseBarrierDisk(aimX, aimY)) return true;
    if (isWorldPointOnForgeRouletteBarrierTile(aimX, aimY)) return true;
    for (let s = 0; s <= 28; s++) {
      const u = s / 28;
      const sx = sniperX + (aimX - sniperX) * u;
      const sy = sniperY + (aimY - sniperY) * u;
      if (isWorldPointOnSurgeLockBarrierTile(sx, sy)) return true;
      if (isWorldPointOnSafehouseBarrierDisk(sx, sy)) return true;
      if (isWorldPointOnForgeRouletteBarrierTile(sx, sy)) return true;
    }
    return false;
  }

  function updateSnipers() {
    if (suppressRangedAttacksNow) return;
    const elapsed = getSimElapsed();
    const player = getPlayer();
    const { w: VIEW_W, h: VIEW_H } = getViewSize();
    for (const h of entities.hunters) {
      if (h.type !== "sniper") continue;
      if (elapsed - h.lastShotAt < 2.1) continue;
      const target = pickTargetForHunter(h);
      if (getCharacterId() === "rogue" && target !== player) continue;
      if (
        getCharacterId() === "rogue" &&
        !h.arenaNexusSpawn &&
        !anyOtherEnemyHasLineOfSightToPlayer(h)
      ) {
        continue;
      }
      h.lastShotAt = elapsed;
      const firePath = getActivePathId() === "fire";
      const depthSnipe = depthsPathActive() && !firePath;
      const windup = depthSnipe ? SNIPER_ARTILLERY_WINDUP * DEPTHS_SNIPER_WINDUP_MULT : SNIPER_ARTILLERY_WINDUP;
      const leadT = windup * SNIPER_ARTILLERY_LEAD;
      const tvx = target === player ? (player.velX ?? 0) : 0;
      const tvy = target === player ? (player.velY ?? 0) : 0;
      let aimX = target.x + tvx * leadT + rand(-12, 12);
      let aimY = target.y + tvy * leadT + rand(-12, 12);
      aimX = clamp(aimX, player.x - VIEW_W * 0.9, player.x + VIEW_W * 0.9);
      aimY = clamp(aimY, player.y - VIEW_H * 0.9, player.y + VIEW_H * 0.9);
      if (sniperArtillerySuppressedByRoulette(h.x, h.y, aimX, aimY)) {
        h.lastShotAt = elapsed;
        continue;
      }
      const zoneRBase = firePath ? 54 : 28;
      const zoneR = firePath ? zoneRBase : depthSnipe ? zoneRBase * DEPTHS_SNIPER_ZONE_R_MULT : zoneRBase;
      const lingerDur = firePath ? 4.6 : 1.8;
      const tickInterval = firePath ? 0.22 : 0.3;
      entities.dangerZones.push({
        x: aimX,
        y: aimY,
        r: zoneR,
        bornAt: elapsed,
        detonateAt: elapsed + windup,
        lingerUntil: elapsed + windup + lingerDur,
        nextTickAt: elapsed + windup + 0.25,
        tickInterval,
        windup,
        exploded: false,
        firePath,
        depthsSniperZone: depthSnipe,
      });
      const dist = Math.hypot(aimX - h.x, aimY - h.y) || 1;
      entities.bullets.push({
        x: h.x,
        y: h.y,
        tx: aimX,
        ty: aimY,
        bornAt: elapsed,
        life: clamp(0.14 + dist / 2200, 0.16, 0.32),
        depthsShell: depthSnipe,
      });
    }

    for (let i = entities.bullets.length - 1; i >= 0; i--) {
      const b = entities.bullets[i];
      if (elapsed - b.bornAt > b.life) {
        entities.bullets.splice(i, 1);
        continue;
      }
      let hitBarrier = false;
      for (let s = 0; s <= 16; s++) {
        const u = s / 16;
        const sx = b.x + (b.tx - b.x) * u;
        const sy = b.y + (b.ty - b.y) * u;
        if (
          isWorldPointOnSurgeLockBarrierTile(sx, sy) ||
          isWorldPointOnSafehouseBarrierDisk(sx, sy) ||
          isWorldPointOnForgeRouletteBarrierTile(sx, sy) ||
          collidesAnyObstacle({ x: sx, y: sy, r: 2 })
        ) {
          hitBarrier = true;
          break;
        }
      }
      if (hitBarrier) {
        entities.bullets.splice(i, 1);
        continue;
      }
    }

    for (let i = entities.dangerZones.length - 1; i >= 0; i--) {
      const zone = entities.dangerZones[i];
      if (!zone.exploded && elapsed >= zone.detonateAt) {
        zone.exploded = true;
        if (!hitDecoyIfAny(zone, zone.r, { artilleryKind: "detonation", damage: 1 })) {
          const rr = zone.r + player.r;
          if (distSq(zone, player) <= rr * rr) {
            damagePlayer(2, {
              sourceX: zone.x,
              sourceY: zone.y,
              ...(zone.firePath ? { fireApplyIgnite: true } : {}),
            });
          }
        }
        // Swamp display level 3+ (`runLevel >= 2`): sniper shell lands like a frog detonation (mud wave + pool + mud spawns).
        if (getActivePathId() === "swamp" && getRunLevel() >= 2 && !zone.firePath) {
          applySwampFrogExplosionAt(zone.x, zone.y, elapsed);
        }
      }
      if (
        zone.exploded &&
        elapsed < (zone.lingerUntil ?? zone.detonateAt) &&
        elapsed >= (zone.nextTickAt ?? Infinity)
      ) {
        zone.nextTickAt += zone.tickInterval ?? 0.3;
        if (!hitDecoyIfAny(zone, zone.r * 0.92, { artilleryKind: "linger" })) {
          const rr = zone.r * 0.92 + player.r;
          if (distSq(zone, player) <= rr * rr) {
            damagePlayer(1, {
              sourceX: zone.x,
              sourceY: zone.y,
              ...(zone.firePath ? { fireApplyIgnite: true } : {}),
            });
          }
        }
      }
      const zu = zone.windup != null ? zone.windup : 0.8;
      const lingerTotal = Math.max(zu + 0.48, (zone.lingerUntil ?? zone.bornAt) - zone.bornAt);
      if (elapsed - zone.bornAt > lingerTotal) entities.dangerZones.splice(i, 1);
    }
  }

  function updateHallsBishopHolyStrikes() {
    if (suppressRangedAttacksNow) return;
    if (!hallsPathActive()) return;
    const elapsed = getSimElapsed();
    const player = getPlayer();
    const { w: VIEW_W, h: VIEW_H } = getViewSize();
    for (const h of entities.hunters) {
      if (h.type !== HALLS_PIECE_IDS.BISHOP) continue;
      if (h.hallsBishopHeavenState === "praying" || h.hallsBishopHeavenState === "active") continue;
      if (elapsed < Number(h.hallsBishopHolyNextAt ?? 0)) continue;
      h.hallsBishopHolyNextAt = elapsed + HALLS_BISHOP_HOLY_CAST_COOLDOWN_SEC + rand(-0.2, 0.35);

      const vx = Number(player.velX ?? 0);
      const vy = Number(player.velY ?? 0);
      const fx = Number(player.facing?.x ?? 1);
      const fy = Number(player.facing?.y ?? 0);
      let aimX =
        player.x +
        vx * HALLS_BISHOP_HOLY_LEAD_SEC +
        fx * HALLS_BISHOP_HOLY_AHEAD_FACING_PX +
        rand(-18, 18);
      let aimY =
        player.y +
        vy * HALLS_BISHOP_HOLY_LEAD_SEC +
        fy * HALLS_BISHOP_HOLY_AHEAD_FACING_PX +
        rand(-18, 18);
      aimX = clamp(aimX, player.x - VIEW_W * 0.95, player.x + VIEW_W * 0.95);
      aimY = clamp(aimY, player.y - VIEW_H * 0.95, player.y + VIEW_H * 0.95);
      if (sniperArtillerySuppressedByRoulette(h.x, h.y, aimX, aimY)) continue;

      entities.dangerZones.push({
        x: aimX,
        y: aimY,
        r: HALLS_BISHOP_HOLY_ZONE_R,
        bornAt: elapsed,
        detonateAt: elapsed + HALLS_BISHOP_HOLY_WINDUP_SEC,
        lingerUntil: elapsed + HALLS_BISHOP_HOLY_WINDUP_SEC + HALLS_BISHOP_HOLY_LINGER_SEC,
        nextTickAt: elapsed + HALLS_BISHOP_HOLY_WINDUP_SEC + 0.2,
        tickInterval: HALLS_BISHOP_HOLY_TICK_SEC,
        windup: HALLS_BISHOP_HOLY_WINDUP_SEC,
        exploded: false,
        firePath: true,
        hallsHolyZone: true,
      });
      const dist = Math.hypot(aimX - h.x, aimY - h.y) || 1;
      entities.bullets.push({
        x: h.x,
        y: h.y,
        tx: aimX,
        ty: aimY,
        bornAt: elapsed,
        life: clamp(0.14 + dist / 2200, 0.16, 0.34),
        hallsHolyShell: true,
      });
    }
  }

  /** Swamp frog-chaser / L3+ sniper shell: large mud wave, 4s pool, spawner-style mud fasts (+ optional center hit). */
  function applySwampFrogExplosionAt(wx, wy, elapsed) {
    const player = getPlayer();
    const blastR = SWAMP_FROG_BLAST_R;
    const center = { x: wx, y: wy };
    if (!hitDecoyIfAny(center, blastR, { damage: 1 })) {
      const rr = blastR + player.r;
      if (distSq(center, player) <= rr * rr) {
        damagePlayer(1, {
          sourceX: wx,
          sourceY: wy,
          swampApplyInfection: true,
        });
      }
    }
    entities.swampPools.push({
      x: wx,
      y: wy,
      r: blastR,
      bornAt: elapsed,
      expiresAt: elapsed + 4,
      nextTickAt: elapsed + 0.22,
      tickInterval: 0.48,
      frogMudPool: true,
    });
    entities.swampBursts.push({
      x: wx,
      y: wy,
      r: blastR,
      bornAt: elapsed,
      life: FROG_SPLASH_GROW_SEC,
      frogWave: true,
    });
    const fastR = 10;
    const swarmN = 5;
    for (let i = 0; i < swarmN; i++) {
      const open = randomOpenPointAround(wx, wy, 40, 78, fastR, 34, { excludeSpecialHex: true });
      spawnHunter("fast", open.x, open.y, { swampMudSpawn: true });
    }
  }

  function triggerSwampFrogExplosion(h, elapsed) {
    applySwampFrogExplosionAt(h.x, h.y, elapsed);
    h._removeNow = true;
  }

  function hallsChessPlacementBlocked(cx, cy, r) {
    const c = { x: cx, y: cy, r };
    const t = getSimElapsed();
    return (
      outOfBoundsCircle(c) ||
      isWorldPointOnForgeRouletteBarrierTile(cx, cy) ||
      collidesAnyObstacle(c) ||
      !!collidesValiantEnemyShockFieldDep?.(c, t)
    );
  }

  function hallsChessMaxSlideDist(px, py, h, ux, uy, maxLen) {
    if (maxLen <= 0) return 0;
    const len = Math.hypot(ux, uy) || 1;
    const nx = ux / len;
    const ny = uy / len;
    let lo = 0;
    let hi = maxLen;
    for (let i = 0; i < 26; i++) {
      const mid = (lo + hi) / 2;
      const cx = px + nx * mid;
      const cy = py + ny * mid;
      if (hallsChessPlacementBlocked(cx, cy, h.r)) hi = mid;
      else lo = mid;
    }
    return lo;
  }

  /** @returns {"arrived" | "moving" | "stuck"} */
  function hallsChessGlideToward(h, destX, destY, glideSpeedPxS, spDt) {
    const eps = 1.6;
    const dx = destX - h.x;
    const dy = destY - h.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= eps) {
      h.x = destX;
      h.y = destY;
      return "arrived";
    }
    const ux = dx / dist;
    const uy = dy / dist;
    const vx = ux * glideSpeedPxS;
    const vy = uy * glideSpeedPxS;
    const prevDist = dist;
    const { touchedObstacle } = moveCircleWithCollisions(h, vx, vy, spDt, {
      blockValiantEnemyShockFields: true,
      ignoreObstacles: !!h.boneSwarmPhasing,
    });
    const nd = Math.hypot(destX - h.x, destY - h.y);
    if (nd <= eps) {
      h.x = destX;
      h.y = destY;
      return "arrived";
    }
    if (touchedObstacle || nd >= prevDist - 0.25) return "stuck";
    return "moving";
  }

  /**
   * Orthogonal glide (one axis only) so knight L-legs read as long-then-short, not one diagonal smear.
   * @param {"x" | "y"} axis
   * @returns {"arrived" | "moving" | "stuck"}
   */
  function hallsChessGlideAxisToward(h, destX, destY, axis, glideSpeedPxS, spDt) {
    const eps = 1.6;
    const minDt = Math.max(spDt, 1e-6);
    if (axis === "x") {
      const dx = destX - h.x;
      if (Math.abs(dx) <= eps) {
        h.x = destX;
        return "arrived";
      }
      const step = Math.sign(dx) * Math.min(glideSpeedPxS * spDt, Math.abs(dx));
      const vx = step / minDt;
      const prevAbs = Math.abs(dx);
      const { touchedObstacle } = moveCircleWithCollisions(h, vx, 0, spDt, {
        blockValiantEnemyShockFields: true,
        ignoreObstacles: !!h.boneSwarmPhasing,
      });
      const nd = Math.abs(destX - h.x);
      if (nd <= eps) {
        h.x = destX;
        return "arrived";
      }
      if (touchedObstacle || nd >= prevAbs - 0.25) return "stuck";
      return "moving";
    }
    const dy = destY - h.y;
    if (Math.abs(dy) <= eps) {
      h.y = destY;
      return "arrived";
    }
    const step = Math.sign(dy) * Math.min(glideSpeedPxS * spDt, Math.abs(dy));
    const vy = step / minDt;
    const prevAbs = Math.abs(dy);
    const { touchedObstacle } = moveCircleWithCollisions(h, 0, vy, spDt, {
      blockValiantEnemyShockFields: true,
      ignoreObstacles: !!h.boneSwarmPhasing,
    });
    const nd = Math.abs(destY - h.y);
    if (nd <= eps) {
      h.y = destY;
      return "arrived";
    }
    if (touchedObstacle || nd >= prevAbs - 0.25) return "stuck";
    return "moving";
  }

  function hallsChessCooldownFor(pieceType) {
    if (pieceType === HALLS_PIECE_IDS.PAWN) return 0.62;
    if (pieceType === HALLS_PIECE_IDS.ROOK) return 0.58;
    if (pieceType === HALLS_PIECE_IDS.KNIGHT) return 0.52;
    if (pieceType === HALLS_PIECE_IDS.BISHOP) return 0.52;
    if (pieceType === HALLS_PIECE_IDS.QUEEN) return 0.44;
    if (pieceType === HALLS_PIECE_IDS.KING) return 0.62;
    return 0.5;
  }

  function hallsChessFaceToward(h, ax, ay) {
    const dx = ax - h.x;
    const dy = ay - h.y;
    const l = Math.hypot(dx, dy) || 1;
    h.dir.x = dx / l;
    h.dir.y = dy / l;
  }

  function hallsPickPawnDash(h, target) {
    const dx = target.x - h.x;
    const dy = target.y - h.y;

    /** @param {number} ux @param {number} uy */
    const orthoDash = (ux, uy) => {
      const d = hallsChessMaxSlideDist(h.x, h.y, h, ux, uy, HALLS_PAWN_DASH_PX);
      if (d < 0.05) return null;
      return { x: h.x + ux * d, y: h.y + uy * d, score: distSq({ x: h.x + ux * d, y: h.y + uy * d }, target) };
    };

    const wantX = Math.abs(dx) >= Math.abs(dy);
    const primaryUx = wantX ? (dx >= 0 ? 1 : -1) : 0;
    const primaryUy = wantX ? 0 : dy >= 0 ? 1 : -1;
    const primary = orthoDash(primaryUx, primaryUy);
    if (primary) return { x: primary.x, y: primary.y };

    const secondaryUx = wantX ? 0 : dx >= 0 ? 1 : -1;
    const secondaryUy = wantX ? (dy >= 0 ? 1 : -1) : 0;
    const secondary = orthoDash(secondaryUx, secondaryUy);
    if (secondary) return { x: secondary.x, y: secondary.y };
    return null;
  }

  /** Cross-track (px) from `(hx,hy)` to rook line through that point: rank if `|uy|`≈0 else file. */
  function hallsRookLineCrossAt(hx, hy, player, ux, uy) {
    if (Math.abs(uy) < 1e-9) return Math.abs(player.y - hy);
    return Math.abs(player.x - hx);
  }

  function hallsRookStrikeGlideT(h, ux, uy, player) {
    const tHit = hallsBishopRayFirstHitPlayerT(h, ux, uy, player);
    const past = HALLS_ROOK_STRIKE_PAST_PLAYER_PX;
    const want = tHit != null ? tHit + past : 560;
    return hallsChessMaxSlideDist(h.x, h.y, h, ux, uy, Math.min(want, HALLS_ROOK_STRIKE_MAX_T_PX));
  }

  /** @param {any} h @param {{ x: number; y: number; r?: number }} target @param {{ x: number; y: number; r?: number }} player */
  function hallsTickRookChess(h, elapsed, spDt, target, player, glide) {
    const minMovePx = HALLS_COIN_DIAMETER_PX;
    const leadX = Number(target.x ?? player.x) + Number(target.velX ?? 0) * 0.34;
    const leadY = Number(target.y ?? player.y) + Number(target.velY ?? 0) * 0.34;
    const aimAt = () => hallsChessFaceToward(h, leadX, leadY);

    if (h.hallsGliding && h.hallsDestX != null && h.hallsDestY != null) {
      aimAt();
      const axis = h.hallsRookGlideAxis === "y" ? "y" : "x";
      const st = hallsChessGlideAxisToward(h, h.hallsDestX, h.hallsDestY, axis, glide, spDt);
      const done = st === "arrived" || st === "stuck";
      if (!done) return;

      h.hallsGliding = false;
      h.hallsDestX = null;
      h.hallsDestY = null;

      const ph = h.hallsRookPhase ?? "approach";

      if (ph === "strike") {
        const Rr = hallsBishopPlayerHitRadius(h, player);
        const miss = distSq(h, player) > Rr * Rr;
        if (miss) {
          h.hallsRookPhase = "approach";
          h.hallsNextThinkAt = elapsed + 0.08;
        } else {
          h.hallsRookPhase = "approach";
          h.hallsNextThinkAt = elapsed + hallsChessCooldownFor(HALLS_PIECE_IDS.ROOK) * 0.22;
        }
        return;
      }

      if (ph === "approach") {
        h.hallsRookLastUx = Number(h.hallsRookLineUx);
        h.hallsRookLastUy = Number(h.hallsRookLineUy);
        h.hallsRookHasLastDir = true;
      }

      h.hallsNextThinkAt = elapsed + hallsChessCooldownFor(HALLS_PIECE_IDS.ROOK) * 0.16;
      return;
    }

    const phase = h.hallsRookPhase ?? "approach";

    if (phase === "pause") {
      aimAt();
      if (elapsed < (h.hallsRookUntil ?? 0)) return;
      const ux = Number(h.hallsRookLineUx);
      const uy = Number(h.hallsRookLineUy);
      if (Math.hypot(ux, uy) < 0.2) {
        h.hallsRookPhase = "approach";
        h.hallsNextThinkAt = elapsed;
        return;
      }
      const tStrike = hallsRookStrikeGlideT(h, ux, uy, player);
      if (tStrike < minMovePx) {
        h.hallsRookPhase = "approach";
        h.hallsNextThinkAt = elapsed;
        return;
      }
      h.hallsRookPhase = "strike";
      h.hallsRookGlideAxis = Math.abs(uy) < 1e-9 ? "x" : "y";
      h.hallsDestX = h.x + ux * tStrike;
      h.hallsDestY = h.y + uy * tStrike;
      h.hallsGliding = true;
      return;
    }

    if (phase === "turn_pause") {
      aimAt();
      if (elapsed < (h.hallsRookUntil ?? 0)) return;
      const px = Number(h.hallsRookPendingDestX);
      const py = Number(h.hallsRookPendingDestY);
      if (!Number.isFinite(px) || !Number.isFinite(py)) {
        h.hallsRookPhase = "approach";
        h.hallsNextThinkAt = elapsed;
        return;
      }
      h.hallsRookGlideAxis = Math.abs(px - h.x) >= Math.abs(py - h.y) ? "x" : "y";
      h.hallsDestX = px;
      h.hallsDestY = py;
      h.hallsGliding = true;
      h.hallsRookPhase = "approach";
      aimAt();
      return;
    }

    if (elapsed < (h.hallsNextThinkAt ?? 0)) {
      aimAt();
      return;
    }

    const wpx = leadX - h.x;
    const wpy = leadY - h.y;
    const distTo = Math.hypot(wpx, wpy) || 1;
    const lineWant = clamp(
      HALLS_ROOK_LINEUP_FRAC * distTo,
      HALLS_ROOK_LINEUP_MIN_PX,
      HALLS_ROOK_LINEUP_MAX_PX,
    );
    const cap = HALLS_ROOK_APPROACH_CAP_PX;

    /** Best single-axis slide to share a rank or file with the player (then pause + strike). */
    let bestUx = 0;
    let bestUy = 0;
    let bestT = 0;
    let bestScore = Infinity;
    const orthos = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const [oux, ouy] of orthos) {
      const tObs = hallsChessMaxSlideDist(h.x, h.y, h, oux, ouy, cap);
      const t = Math.min(lineWant, tObs);
      if (t < minMovePx) continue;
      const px = h.x + oux * t;
      const py = h.y + ouy * t;
      let strikeUx = 0;
      let strikeUy = 0;
      if (Math.abs(ouy) > 0.5) {
        strikeUx = Math.abs(wpx) > 6 ? Math.sign(wpx) : 1;
        strikeUy = 0;
      } else {
        strikeUx = 0;
        strikeUy = Math.abs(wpy) > 6 ? Math.sign(wpy) : 1;
      }
      const crossEnd = hallsRookLineCrossAt(px, py, player, strikeUx, strikeUy);
      const score =
        HALLS_ROOK_ALIGN_CROSS_WEIGHT * crossEnd +
        HALLS_ROOK_ALIGN_DIST_WEIGHT * distSq({ x: px, y: py }, { x: leadX, y: leadY });
      if (score < bestScore) {
        bestScore = score;
        bestUx = oux;
        bestUy = ouy;
        bestT = t;
      }
    }

    /** Shortest hit along a rank or file the rook can shoot forward on. */
    let threatUx = bestUx;
    let threatUy = bestUy;
    let threatHit = Infinity;
    for (const sx of [-1, 1]) {
      const ux = sx;
      const uy = 0;
      if (wpx * ux + wpy * uy < 5) continue;
      const th = hallsBishopRayFirstHitPlayerT(h, ux, uy, player);
      if (th != null && th < threatHit) {
        threatHit = th;
        threatUx = ux;
        threatUy = uy;
      }
    }
    for (const sy of [-1, 1]) {
      const ux = 0;
      const uy = sy;
      if (wpx * ux + wpy * uy < 5) continue;
      const th = hallsBishopRayFirstHitPlayerT(h, ux, uy, player);
      if (th != null && th < threatHit) {
        threatHit = th;
        threatUx = ux;
        threatUy = uy;
      }
    }

    if (bestT < minMovePx || !Number.isFinite(bestScore)) {
      h.hallsNextThinkAt = elapsed + 0.2;
      aimAt();
      return;
    }

    const crossNow = hallsRookLineCrossAt(h.x, h.y, player, threatUx, threatUy);
    const aheadThreat = wpx * threatUx + wpy * threatUy > 5;
    const strikeReady =
      threatHit < Infinity &&
      aheadThreat &&
      crossNow < HALLS_ROOK_LINE_CROSS_EPS * 1.15 &&
      threatHit > minMovePx &&
      threatHit < HALLS_ROOK_STRIKE_COMMIT_MAX_T_PX * 1.2;

    if (strikeReady) {
      h.hallsRookPhase = "pause";
      h.hallsRookLineUx = threatUx;
      h.hallsRookLineUy = threatUy;
      h.hallsRookUntil = elapsed + HALLS_ROOK_PAUSE_SEC;
      aimAt();
      return;
    }

    h.hallsRookLineUx = bestUx;
    h.hallsRookLineUy = bestUy;
    const destX = h.x + bestUx * bestT;
    const destY = h.y + bestUy * bestT;

    const dirEps = 1e-4;
    const dirChanged =
      !!h.hallsRookHasLastDir &&
      (Math.abs(bestUx - Number(h.hallsRookLastUx)) > dirEps || Math.abs(bestUy - Number(h.hallsRookLastUy)) > dirEps);

    if (dirChanged) {
      h.hallsRookPhase = "turn_pause";
      h.hallsRookPendingDestX = destX;
      h.hallsRookPendingDestY = destY;
      h.hallsRookUntil = elapsed + HALLS_ROOK_TURN_PAUSE_SEC;
      aimAt();
      return;
    }

    h.hallsRookGlideAxis = Math.abs(bestUx) > 0.5 ? "x" : "y";
    h.hallsDestX = destX;
    h.hallsDestY = destY;
    h.hallsGliding = true;
    h.hallsRookPhase = "approach";
    aimAt();
  }

  function hallsEmitQueenBoundaryArc(h, elapsed, targetX, targetY) {
    const dx = Number(targetX ?? h.x) - h.x;
    const dy = Number(targetY ?? h.y) - h.y;
    const a0 = Math.atan2(dy, dx);
    for (let i = 0; i < HALLS_QUEEN_ARC_BOLTS; i++) {
      const t = HALLS_QUEEN_ARC_BOLTS <= 1 ? 0.5 : i / (HALLS_QUEEN_ARC_BOLTS - 1);
      const sprayJitter = rand(-0.12, 0.12);
      const speedJitter = rand(0.84, 1.18);
      const a = a0 - HALLS_QUEEN_ARC_SPREAD_RAD * 0.5 + HALLS_QUEEN_ARC_SPREAD_RAD * t + sprayJitter;
      entities.projectiles.push({
        x: h.x,
        y: h.y,
        vx: Math.cos(a) * HALLS_QUEEN_ARC_BOLT_SPEED * speedJitter,
        vy: Math.sin(a) * HALLS_QUEEN_ARC_BOLT_SPEED * speedJitter,
        r: HALLS_QUEEN_ARC_BOLT_R,
        bornAt: elapsed,
        life: HALLS_QUEEN_ARC_BOLT_LIFE,
        damage: 1,
        hallsQueenArcBolt: true,
      });
    }
  }

  function hallsTickQueenChess(h, elapsed, spDt, target, glide) {
    const cx = Number.isFinite(Number(h.hallsLockCenterX)) ? Number(h.hallsLockCenterX) : Number(h.x);
    const cy = Number.isFinite(Number(h.hallsLockCenterY)) ? Number(h.hallsLockCenterY) : Number(h.y);
    const faceTargetX = Number(target.x ?? cx);
    const faceTargetY = Number(target.y ?? cy);
    const summonedQueen = !!h.hallsKingSummonedQueen;
    const orbitSpd = HALLS_QUEEN_ORBIT_SPEED * (summonedQueen ? HALLS_QUEEN_EVENT_ORBIT_SPEED_MULT : 1);
    const chargeGlideMul = HALLS_QUEEN_CHARGE_SPEED_MUL * (summonedQueen ? HALLS_QUEEN_EVENT_CHARGE_GLIDE_MULT : 1);
    hallsChessFaceToward(h, faceTargetX, faceTargetY);

    if ((h.hallsQueenState ?? "orbit") === "charge") {
      const st = hallsChessGlideToward(h, Number(h.hallsDestX), Number(h.hallsDestY), glide * chargeGlideMul, spDt);
      const insideNow = distSq(h, { x: cx, y: cy }) <= HALLS_QUEEN_BOUNDARY_R * HALLS_QUEEN_BOUNDARY_R;
      if (insideNow !== !!h.hallsQueenWasInside) {
        hallsEmitQueenBoundaryArc(h, elapsed, faceTargetX, faceTargetY);
      }
      h.hallsQueenWasInside = insideNow;
      if (st === "arrived" || st === "stuck") {
        h.hallsQueenState = "orbit";
        h.hallsQueenChargeNextAt = elapsed + rand(HALLS_QUEEN_CHARGE_MIN_SEC, HALLS_QUEEN_CHARGE_MAX_SEC);
        h.hallsDestX = null;
        h.hallsDestY = null;
        const ang = Math.atan2(h.y - cy, h.x - cx);
        if (Number.isFinite(ang)) h.hallsQueenOrbitAng = ang;
      }
      return;
    }

    const orbitDir = Number(h.hallsQueenOrbitDir ?? 1) >= 0 ? 1 : -1;
    const orbitAng =
      Number(h.hallsQueenOrbitAng ?? 0) + (orbitDir * orbitSpd * spDt) / Math.max(1, HALLS_QUEEN_ORBIT_R);
    h.hallsQueenOrbitAng = orbitAng;
    h.x = cx + Math.cos(orbitAng) * HALLS_QUEEN_ORBIT_R;
    h.y = cy + Math.sin(orbitAng) * HALLS_QUEEN_ORBIT_R;

    if (elapsed < Number(h.hallsQueenChargeNextAt ?? 0)) return;
    const dx = faceTargetX - h.x;
    const dy = faceTargetY - h.y;
    const d = Math.hypot(dx, dy) || 1;
    const ux = dx / d;
    const uy = dy / d;
    const chargeDist = HALLS_QUEEN_BOUNDARY_R * 2.7;
    h.hallsDestX = h.x + ux * chargeDist;
    h.hallsDestY = h.y + uy * chargeDist;
    h.hallsQueenChargeUx = ux;
    h.hallsQueenChargeUy = uy;
    h.hallsQueenWasInside = distSq(h, { x: cx, y: cy }) <= HALLS_QUEEN_BOUNDARY_R * HALLS_QUEEN_BOUNDARY_R;
    h.hallsQueenState = "charge";
  }

  function hallsKingSpawnRookLineWave(h, elapsed, nx, ny) {
    const cx = Number.isFinite(Number(h.hallsLockCenterX)) ? Number(h.hallsLockCenterX) : Number(h.x);
    const cy = Number.isFinite(Number(h.hallsLockCenterY)) ? Number(h.hallsLockCenterY) : Number(h.y);
    const px = -ny;
    const py = nx;
    for (let i = 0; i < HALLS_KING_ROOK_LINE_COUNT; i++) {
      const t = HALLS_KING_ROOK_LINE_COUNT <= 1 ? 0.5 : i / (HALLS_KING_ROOK_LINE_COUNT - 1);
      const off = (t - 0.5) * HALLS_KING_ROOK_LINE_SPAN;
      const sx = cx - nx * HALLS_KING_ROOK_LINE_START_OFF + px * off;
      const sy = cy - ny * HALLS_KING_ROOK_LINE_START_OFF + py * off;
      spawnHunter(HALLS_PIECE_IDS.ROOK, sx, sy, {
        hallsPieceType: HALLS_PIECE_IDS.ROOK,
        hallsEventSpawn: true,
        hallsKingLineProjectile: true,
        hallsScriptedVx: nx * HALLS_KING_ROOK_LINE_SPEED,
        hallsScriptedVy: ny * HALLS_KING_ROOK_LINE_SPEED,
        allowInsideSpecialTile: true,
        forceExactPosition: true,
        dieAtOverride: elapsed + HALLS_KING_ROOK_LINE_LIFE,
      });
    }
  }

  function hallsKingSpawnBishopLineWave(h, elapsed, nx, ny) {
    const cx = Number.isFinite(Number(h.hallsLockCenterX)) ? Number(h.hallsLockCenterX) : Number(h.x);
    const cy = Number.isFinite(Number(h.hallsLockCenterY)) ? Number(h.hallsLockCenterY) : Number(h.y);
    const px = -ny;
    const py = nx;
    for (let i = 0; i < HALLS_KING_BISHOP_LINE_COUNT; i++) {
      const t = HALLS_KING_BISHOP_LINE_COUNT <= 1 ? 0.5 : i / (HALLS_KING_BISHOP_LINE_COUNT - 1);
      const off = (t - 0.5) * HALLS_KING_BISHOP_LINE_SPAN;
      const sx = cx - nx * HALLS_KING_BISHOP_LINE_START_OFF + px * off;
      const sy = cy - ny * HALLS_KING_BISHOP_LINE_START_OFF + py * off;
      spawnHunter(HALLS_PIECE_IDS.BISHOP, sx, sy, {
        hallsPieceType: HALLS_PIECE_IDS.BISHOP,
        hallsEventSpawn: true,
        hallsKingLineProjectile: true,
        hallsScriptedVx: nx * HALLS_KING_BISHOP_LINE_SPEED,
        hallsScriptedVy: ny * HALLS_KING_BISHOP_LINE_SPEED,
        allowInsideSpecialTile: true,
        forceExactPosition: true,
        dieAtOverride: elapsed + HALLS_KING_BISHOP_LINE_LIFE,
      });
    }
  }

  function hallsKingCastRookLine(h, elapsed) {
    const sy = Math.random() < 0.5 ? 1 : -1;
    hallsKingSpawnRookLineWave(h, elapsed, 0, sy);
    const sx = Math.random() < 0.5 ? 1 : -1;
    if (!Array.isArray(h.hallsKingCastFollowups)) h.hallsKingCastFollowups = [];
    h.hallsKingCastFollowups.push({
      t: elapsed + HALLS_KING_LINE_DOUBLE_GAP_SEC,
      kind: "rook",
      nx: sx,
      ny: 0,
    });
  }

  function hallsKingCastBishopLine(h, elapsed) {
    const sx = Math.random() < 0.5 ? 1 : -1;
    const sy = Math.random() < 0.5 ? 1 : -1;
    const nx0 = sx * Math.SQRT1_2;
    const ny0 = sy * Math.SQRT1_2;
    hallsKingSpawnBishopLineWave(h, elapsed, nx0, ny0);
    const nx1 = sx * Math.SQRT1_2;
    const ny1 = -sy * Math.SQRT1_2;
    if (!Array.isArray(h.hallsKingCastFollowups)) h.hallsKingCastFollowups = [];
    h.hallsKingCastFollowups.push({
      t: elapsed + HALLS_KING_LINE_DOUBLE_GAP_SEC,
      kind: "bishop",
      nx: nx1,
      ny: ny1,
    });
  }

  function hallsKingBeginSpiralVolley(h, elapsed) {
    h.hallsKingSpiralStartAt = elapsed;
    h.hallsKingSpiralSpawned = 0;
    h.hallsKingSpiralBase = Math.random() * Math.PI * 2;
  }

  function hallsKingPushSpiralBolt(cx, cy, elapsed, angleRad) {
    const speedJ = rand(0.92, 1.05);
    entities.projectiles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angleRad) * HALLS_KING_SPIRAL_SPEED * speedJ,
      vy: Math.sin(angleRad) * HALLS_KING_SPIRAL_SPEED * speedJ,
      r: HALLS_KING_SPIRAL_BOLT_R,
      bornAt: elapsed,
      life: HALLS_KING_SPIRAL_LIFE,
      damage: 1,
      hallsKingSpiralBolt: true,
    });
  }

  /** Spawns spiral bolts over `HALLS_KING_SPIRAL_DURATION_SEC` with `HALLS_KING_SPIRAL_REVOLUTIONS` full turns. */
  function hallsKingTickSpiralVolley(h, elapsed) {
    const n = HALLS_KING_SPIRAL_BOLT_TOTAL;
    let spawned = Number(h.hallsKingSpiralSpawned ?? 0);
    if (spawned >= n) return;
    const t0 = Number(h.hallsKingSpiralStartAt ?? 0);
    if (!(t0 > 0)) return;
    const cx = Number.isFinite(Number(h.hallsLockCenterX)) ? Number(h.hallsLockCenterX) : Number(h.x);
    const cy = Number.isFinite(Number(h.hallsLockCenterY)) ? Number(h.hallsLockCenterY) : Number(h.y);
    const base = Number(h.hallsKingSpiralBase ?? 0);
    const dur = HALLS_KING_SPIRAL_DURATION_SEC;
    const rev = HALLS_KING_SPIRAL_REVOLUTIONS * Math.PI * 2;
    while (spawned < n) {
      const fireAt = t0 + (spawned / n) * dur;
      if (elapsed + 1e-5 < fireAt) break;
      const u = n <= 1 ? 0.5 : spawned / (n - 1);
      const a = base + u * rev;
      hallsKingPushSpiralBolt(cx, cy, elapsed, a);
      spawned += 1;
    }
    h.hallsKingSpiralSpawned = spawned;
  }

  function hallsKingProcessCastFollowups(h, elapsed) {
    const q = h.hallsKingCastFollowups;
    if (!Array.isArray(q) || q.length === 0) return;
    while (q.length > 0 && elapsed + 1e-5 >= Number(q[0].t ?? 0)) {
      const job = q.shift();
      if (!job || typeof job !== "object") continue;
      if (job.kind === "rook") hallsKingSpawnRookLineWave(h, elapsed, Number(job.nx), Number(job.ny));
      else if (job.kind === "bishop")
        hallsKingSpawnBishopLineWave(h, elapsed, Number(job.nx), Number(job.ny));
    }
  }

  function hallsTickKingChess(h, elapsed, target) {
    hallsKingProcessCastFollowups(h, elapsed);
    hallsKingTickSpiralVolley(h, elapsed);
    const cx = Number.isFinite(Number(h.hallsLockCenterX)) ? Number(h.hallsLockCenterX) : Number(h.x);
    const cy = Number.isFinite(Number(h.hallsLockCenterY)) ? Number(h.hallsLockCenterY) : Number(h.y);
    const aliveSec = Math.max(0, elapsed - Number(h.bornAt ?? elapsed));
    const phase2 = aliveSec >= HALLS_KING_CAST_PHASE2_AT_SEC;
    const phase3 = aliveSec >= HALLS_KING_CAST_PHASE3_AT_SEC;
    const castInterval = phase3
      ? HALLS_KING_CAST_INTERVAL_PHASE3_SEC
      : phase2
        ? HALLS_KING_CAST_INTERVAL_PHASE2_SEC
        : HALLS_KING_CAST_INTERVAL_PHASE1_SEC;
    const spellIds = phase3
      ? ["rookLine", "bishopLine", "spiralVolley", "queenSummon"]
      : ["rookLine", "bishopLine", "pawnRain", "spiralVolley", "queenSummon"];
    hallsChessFaceToward(h, Number(target.x ?? h.x), Number(target.y ?? h.y));
    h.hallsGliding = false;
    h.hallsDestX = h.x;
    h.hallsDestY = h.y;

    if (Number(h.hallsKingPawnRainRemaining ?? 0) > 0 && elapsed >= Number(h.hallsKingPawnRainNextAt ?? 0)) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * HEX_SIZE * 0.78;
      spawnHunter(HALLS_PIECE_IDS.PAWN, cx + Math.cos(a) * r, cy + Math.sin(a) * r, {
        hallsPieceType: HALLS_PIECE_IDS.PAWN,
        hallsEventSpawn: true,
        hallsKingPawnSummon: true,
        allowInsideSpecialTile: true,
        forceExactPosition: true,
        dieAtOverride: Number(h.hallsKingPawnRainExpireAt ?? (elapsed + HALLS_KING_PAWN_RAIN_LIFE_SEC)),
      });
      h.hallsKingPawnRainRemaining = Number(h.hallsKingPawnRainRemaining ?? 0) - 1;
      h.hallsKingPawnRainNextAt = elapsed + HALLS_KING_PAWN_RAIN_STEP_SEC;
    }

    if (elapsed < Number(h.hallsKingCastNextAt ?? 0)) return;
    h.hallsKingCastNextAt = elapsed + castInterval;
    if (Array.isArray(h.hallsKingSpellBag) && h.hallsKingSpellBag.length) {
      h.hallsKingSpellBag = h.hallsKingSpellBag.filter((id) => spellIds.includes(String(id)));
    }
    if (!Array.isArray(h.hallsKingSpellBag) || h.hallsKingSpellBag.length === 0) {
      h.hallsKingSpellBag = spellIds.slice();
      for (let i = h.hallsKingSpellBag.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        const tmp = h.hallsKingSpellBag[i];
        h.hallsKingSpellBag[i] = h.hallsKingSpellBag[j];
        h.hallsKingSpellBag[j] = tmp;
      }
    }
    const forceQueen = Number(h.hallsKingCastsSinceQueen ?? 0) >= 2;
    let spellId = forceQueen ? "queenSummon" : String(h.hallsKingSpellBag.pop() ?? "rookLine");
    if (phase3 && spellId === "pawnRain") spellId = "spiralVolley";
    const lastSpellId = String(h.hallsKingLastSpellId ?? "");
    if (!forceQueen && spellId === lastSpellId) {
      const bag = Array.isArray(h.hallsKingSpellBag) ? h.hallsKingSpellBag : [];
      const altIdx = bag.findIndex((id) => String(id) !== lastSpellId);
      if (altIdx >= 0) {
        spellId = String(bag.splice(altIdx, 1)[0]);
      } else {
        const fallback = spellIds.find((id) => id !== lastSpellId);
        if (fallback) spellId = fallback;
      }
    }
    if (spellId === "rookLine") {
      h.hallsKingGlowVoid = false;
      h.hallsKingGlowColor = "#93c5fd";
      h.hallsKingGlowStartAt = elapsed;
      h.hallsKingGlowUntil = elapsed + HALLS_KING_GLOW_FALLOFF_SEC;
      hallsKingCastRookLine(h, elapsed);
      h.hallsKingCastsSinceQueen = Number(h.hallsKingCastsSinceQueen ?? 0) + 1;
      h.hallsKingLastSpellId = spellId;
      return;
    }
    if (spellId === "bishopLine") {
      h.hallsKingGlowVoid = false;
      h.hallsKingGlowColor = "#ffffff";
      h.hallsKingGlowStartAt = elapsed;
      h.hallsKingGlowUntil = elapsed + HALLS_KING_GLOW_FALLOFF_SEC;
      hallsKingCastBishopLine(h, elapsed);
      h.hallsKingCastsSinceQueen = Number(h.hallsKingCastsSinceQueen ?? 0) + 1;
      h.hallsKingLastSpellId = spellId;
      return;
    }
    if (spellId === "pawnRain") {
      h.hallsKingGlowVoid = false;
      h.hallsKingGlowColor = "#fb923c";
      h.hallsKingGlowStartAt = elapsed;
      h.hallsKingGlowUntil = elapsed + HALLS_KING_GLOW_FALLOFF_SEC;
      h.hallsKingPawnRainRemaining = HALLS_KING_PAWN_RAIN_COUNT;
      h.hallsKingPawnRainNextAt = elapsed;
      h.hallsKingPawnRainExpireAt = elapsed + HALLS_KING_PAWN_RAIN_LIFE_SEC;
      h.hallsKingCastsSinceQueen = Number(h.hallsKingCastsSinceQueen ?? 0) + 1;
      h.hallsKingLastSpellId = spellId;
      return;
    }
    if (spellId === "spiralVolley") {
      h.hallsKingGlowVoid = true;
      h.hallsKingGlowColor = "#09090d";
      h.hallsKingGlowStartAt = elapsed;
      h.hallsKingGlowUntil = elapsed + HALLS_KING_GLOW_FALLOFF_SEC;
      hallsKingBeginSpiralVolley(h, elapsed);
      h.hallsKingCastsSinceQueen = Number(h.hallsKingCastsSinceQueen ?? 0) + 1;
      h.hallsKingLastSpellId = spellId;
      return;
    }
    if (spellId === "queenSummon") {
      h.hallsKingGlowVoid = false;
      h.hallsKingGlowColor = "#f9a8d4";
      h.hallsKingGlowStartAt = elapsed;
      h.hallsKingGlowUntil = elapsed + HALLS_KING_GLOW_FALLOFF_SEC;
      const ang = Math.random() * Math.PI * 2;
      const spawnR = HEX_SIZE * 1.16;
      spawnHunter(HALLS_PIECE_IDS.QUEEN, cx + Math.cos(ang) * spawnR, cy + Math.sin(ang) * spawnR, {
        hallsPieceType: HALLS_PIECE_IDS.QUEEN,
        hallsEventSpawn: true,
        hallsKingSummonedQueen: true,
        hallsLockCenterX: cx,
        hallsLockCenterY: cy,
        allowInsideSpecialTile: true,
        forceExactPosition: true,
        dieAtOverride: elapsed + HALLS_KING_QUEEN_SUMMON_LIFE_SEC,
      });
      h.hallsKingCastsSinceQueen = 0;
      h.hallsKingLastSpellId = spellId;
    }
  }

  function hallsBishopPlayerHitRadius(h, player) {
    return h.r + (player.r ?? 10) + HALLS_BISHOP_PLAYER_CLEAR_BUFFER;
  }

  function hallsBishopCrossAt(hx, hy, player, ux, uy) {
    const dx = player.x - hx;
    const dy = player.y - hy;
    return Math.abs(dx * uy - dy * ux);
  }

  function hallsBishopLineCrossPx(h, player, ux, uy) {
    return hallsBishopCrossAt(h.x, h.y, player, ux, uy);
  }

  /** Smallest t>0 where |h + u*t − player| = hit radius (u unit); null if ray misses that disk ahead. */
  function hallsBishopRayFirstHitPlayerT(h, ux, uy, player) {
    const R = hallsBishopPlayerHitRadius(h, player);
    const ax = h.x - player.x;
    const ay = h.y - player.y;
    const b = 2 * (ax * ux + ay * uy);
    const c = ax * ax + ay * ay - R * R;
    const disc = b * b - 4 * c;
    if (disc < 0) return null;
    const s = Math.sqrt(disc);
    const t0 = (-b - s) / 2;
    const t1 = (-b + s) / 2;
    let best = Infinity;
    if (t0 > 1e-3 && Number.isFinite(t0)) best = Math.min(best, t0);
    if (t1 > 1e-3 && Number.isFinite(t1)) best = Math.min(best, t1);
    return best < Infinity ? best : null;
  }

  /** Max t along u (≤ maxT) before obstacles or clipping the player disk (approach). */
  function hallsBishopApproachMaxT(h, ux, uy, maxT, player) {
    const tObs = hallsChessMaxSlideDist(h.x, h.y, h, ux, uy, maxT);
    const tHit = hallsBishopRayFirstHitPlayerT(h, ux, uy, player);
    if (tHit == null) return tObs;
    return Math.min(tObs, Math.max(0, tHit - 16));
  }

  function hallsBishopStrikeGlideT(h, ux, uy, player) {
    const tHit = hallsBishopRayFirstHitPlayerT(h, ux, uy, player);
    const past = HALLS_BISHOP_STRIKE_PAST_PLAYER_PX;
    const want = tHit != null ? tHit + past : 560;
    return hallsChessMaxSlideDist(h.x, h.y, h, ux, uy, Math.min(want, HALLS_BISHOP_STRIKE_MAX_T_PX));
  }

  /** @param {any} h @param {{ x: number; y: number; r?: number }} target @param {{ x: number; y: number; r?: number }} player */
  function hallsTickBishopChess(h, elapsed, spDt, target, player, glide) {
    let chaseTarget = target;
    if (h.hallsBishopHeavenState === "idle" && elapsed >= Number(h.hallsBishopHeavenStartAt ?? Infinity)) {
      h.hallsBishopHeavenState = "praying";
      h.hallsBishopHeavenPrayUntil = elapsed + HALLS_BISHOP_HEAVEN_PRAY_SEC;
      h.hallsBishopHeavenX = h.x;
      h.hallsBishopHeavenY = h.y;
      h.hallsBishopHeavenTargetX = player.x;
      h.hallsBishopHeavenTargetY = player.y;
      h.hallsBishopHeavenNextTickAt = h.hallsBishopHeavenPrayUntil;
      h.hallsGliding = false;
      h.hallsDestX = null;
      h.hallsDestY = null;
    }
    h.hallsHolyGlow = false;
    if (h.hallsBishopHeavenState === "praying") {
      h.hallsHolyGlow = true;
      hallsChessFaceToward(h, player.x, player.y);
      if (elapsed < Number(h.hallsBishopHeavenPrayUntil ?? 0)) return;
      h.hallsBishopHeavenState = "active";
    }
    if (h.hallsBishopHeavenState === "active") {
      // Prayer spotlight ends, but the bishop remains holy-lit while resuming movement/chase.
      h.hallsHolyGlow = true;
      const leadX = player.x + Number(player.velX ?? 0) * 0.42;
      const leadY = player.y + Number(player.velY ?? 0) * 0.42;
      const targetSteer = 0.22;
      h.hallsBishopHeavenTargetX =
        Number(h.hallsBishopHeavenTargetX ?? h.x) + (leadX - Number(h.hallsBishopHeavenTargetX ?? h.x)) * targetSteer;
      h.hallsBishopHeavenTargetY =
        Number(h.hallsBishopHeavenTargetY ?? h.y) + (leadY - Number(h.hallsBishopHeavenTargetY ?? h.y)) * targetSteer;
      const tx = Number(h.hallsBishopHeavenTargetX ?? h.x) - Number(h.hallsBishopHeavenX ?? h.x);
      const ty = Number(h.hallsBishopHeavenTargetY ?? h.y) - Number(h.hallsBishopHeavenY ?? h.y);
      const d = Math.hypot(tx, ty) || 1;
      const step = Math.min(d, HALLS_BISHOP_HEAVEN_CHASE_SPEED * Math.max(spDt, 1 / 120));
      h.hallsBishopHeavenX = Number(h.hallsBishopHeavenX ?? h.x) + (tx / d) * step;
      h.hallsBishopHeavenY = Number(h.hallsBishopHeavenY ?? h.y) + (ty / d) * step;
      if (elapsed >= Number(h.hallsBishopHeavenNextTickAt ?? 0)) {
        h.hallsBishopHeavenNextTickAt = elapsed + HALLS_BISHOP_HEAVEN_TICK_SEC;
        if (distSq({ x: h.hallsBishopHeavenX, y: h.hallsBishopHeavenY }, player) <= (HALLS_BISHOP_HEAVEN_CHASE_R + player.r) ** 2) {
          damagePlayer(1, { sourceX: h.hallsBishopHeavenX, sourceY: h.hallsBishopHeavenY, hallsBishopHeavenLaser: true });
        }
      }
      chaseTarget = { x: h.hallsBishopHeavenX, y: h.hallsBishopHeavenY };
    }

    const aimAt = () => hallsChessFaceToward(h, chaseTarget.x, chaseTarget.y);
    const diagEqualized = () => Math.abs(Math.abs(player.x - h.x) - Math.abs(player.y - h.y)) <= HALLS_BISHOP_LINE_CROSS_EPS;
    const leadX = chaseTarget.x;
    const leadY = chaseTarget.y;
    const aggressiveLineWant = (distTo) =>
      clamp(
        HALLS_BISHOP_LINEUP_FRAC * distTo * 1.45,
        HALLS_BISHOP_LINEUP_MIN_PX * 1.15,
        HALLS_BISHOP_LINEUP_MAX_PX * 1.4,
      );

    if (h.hallsGliding && h.hallsDestX != null && h.hallsDestY != null) {
      aimAt();
      const st = hallsChessGlideToward(h, h.hallsDestX, h.hallsDestY, glide, spDt);
      const done = st === "arrived" || st === "stuck";
      if (!done) return;

      h.hallsGliding = false;
      h.hallsDestX = null;
      h.hallsDestY = null;

      const ph = h.hallsBishopPhase ?? "approach";

      if (ph === "strike") {
        const Rr = hallsBishopPlayerHitRadius(h, player);
        const miss = distSq(h, player) > Rr * Rr;
        if (miss) {
          h.hallsBishopPhase = "approach";
          h.hallsNextThinkAt = elapsed + 0.06;
        } else {
          h.hallsBishopPhase = "approach";
          h.hallsNextThinkAt = elapsed + hallsChessCooldownFor(HALLS_PIECE_IDS.BISHOP) * 0.25;
        }
        return;
      }

      if (ph === "approach") {
        h.hallsBishopLastUx = Number(h.hallsBishopLineUx);
        h.hallsBishopLastUy = Number(h.hallsBishopLineUy);
        h.hallsBishopHasLastDiag = true;
      }

      // Keep bishops flowing: re-plan immediately after each approach glide.
      h.hallsNextThinkAt = elapsed;
      return;
    }

    const phase = h.hallsBishopPhase ?? "approach";

    if (phase === "pause") {
      aimAt();
      if (elapsed < (h.hallsBishopUntil ?? 0)) return;
      const ux = Number(h.hallsBishopLineUx);
      const uy = Number(h.hallsBishopLineUy);
      if (Math.hypot(ux, uy) < 0.2) {
        h.hallsBishopPhase = "approach";
        h.hallsNextThinkAt = elapsed;
        return;
      }
      const tObs = hallsChessMaxSlideDist(h.x, h.y, h, ux, uy, HALLS_BISHOP_STRIKE_MAX_T_PX);
      const tWant = clamp(Math.hypot(leadX - h.x, leadY - h.y) * 0.95, 220, HALLS_BISHOP_STRIKE_MAX_T_PX);
      const tStrike = Math.min(tObs, tWant);
      if (tStrike < 12) {
        h.hallsBishopPhase = "approach";
        h.hallsNextThinkAt = elapsed;
        return;
      }
      h.hallsBishopPhase = "strike";
      h.hallsDestX = h.x + ux * tStrike;
      h.hallsDestY = h.y + uy * tStrike;
      h.hallsGliding = true;
      return;
    }

    if (phase === "turn_pause") {
      aimAt();
      if (elapsed < (h.hallsBishopUntil ?? 0)) return;
      const px = Number(h.hallsBishopPendingDestX);
      const py = Number(h.hallsBishopPendingDestY);
      if (!Number.isFinite(px) || !Number.isFinite(py)) {
        h.hallsBishopPhase = "approach";
        h.hallsNextThinkAt = elapsed;
        return;
      }
      h.hallsDestX = px;
      h.hallsDestY = py;
      h.hallsGliding = true;
      h.hallsBishopPhase = "approach";
      aimAt();
      return;
    }

    if (elapsed < (h.hallsNextThinkAt ?? 0)) {
      aimAt();
      return;
    }

    const wpx = player.x - h.x;
    const wpy = player.y - h.y;
    const distTo = Math.hypot(wpx, wpy) || 1;
    const lineWant = aggressiveLineWant(distTo);
    const cap = HALLS_BISHOP_APPROACH_CAP_PX;

    // Rule 1: keep gliding on a diagonal until |dx| ~= |dy| (same diagonal relation).
    let bestUx = 0;
    let bestUy = 0;
    let bestT = 0;
    let bestScore = Infinity;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const ux = sx * Math.SQRT1_2;
        const uy = sy * Math.SQRT1_2;
        if (wpx * ux + wpy * uy < 8) continue;
        // For confident motion, use full obstacle-limited stride (don't brake early near player disk).
        const tClear = hallsChessMaxSlideDist(h.x, h.y, h, ux, uy, cap);
        const t = Math.min(lineWant, tClear);
        if (t < 120) continue;
        const px = h.x + ux * t;
        const py = h.y + uy * t;
        const ddx = Math.abs(leadX - px);
        const ddy = Math.abs(leadY - py);
        const equalErr = Math.abs(ddx - ddy);
        const closeScore = distSq({ x: px, y: py }, { x: leadX, y: leadY });
        const score = HALLS_BISHOP_ALIGN_CROSS_WEIGHT * equalErr + HALLS_BISHOP_ALIGN_DIST_WEIGHT * closeScore * 0.65;
        if (score < bestScore) {
          bestScore = score;
          bestUx = ux;
          bestUy = uy;
          bestT = t;
        }
      }
    }

    if (bestT < 120) {
      h.hallsNextThinkAt = elapsed + 0.06;
      aimAt();
      return;
    }

    // Rule 2: once equalized, switch to the perpendicular diagonal and move toward the player.
    if (diagEqualized()) {
      const lwx = leadX - h.x;
      const lwy = leadY - h.y;
      const sameSign = lwx * lwy >= 0;
      const perpA = sameSign ? { ux: Math.SQRT1_2, uy: -Math.SQRT1_2 } : { ux: Math.SQRT1_2, uy: Math.SQRT1_2 };
      const perpB = sameSign ? { ux: -Math.SQRT1_2, uy: Math.SQRT1_2 } : { ux: -Math.SQRT1_2, uy: -Math.SQRT1_2 };
      const dotA = lwx * perpA.ux + lwy * perpA.uy;
      const dotB = lwx * perpB.ux + lwy * perpB.uy;
      const pick = dotA >= dotB ? perpA : perpB;
      h.hallsBishopLineUx = pick.ux;
      h.hallsBishopLineUy = pick.uy;
      const dirEps = 1e-4;
      const attackDirChanged =
        !!h.hallsBishopHasLastDiag &&
        (Math.abs(pick.ux - Number(h.hallsBishopLastUx)) > dirEps ||
          Math.abs(pick.uy - Number(h.hallsBishopLastUy)) > dirEps);
      const crashObs = hallsChessMaxSlideDist(h.x, h.y, h, pick.ux, pick.uy, HALLS_BISHOP_STRIKE_MAX_T_PX);
      const crashWant = clamp(Math.hypot(lwx, lwy) * 1.05, 240, HALLS_BISHOP_STRIKE_MAX_T_PX);
      const crashT = Math.min(crashObs, crashWant);
      if (crashT > 24) {
        if (attackDirChanged) {
          h.hallsBishopPhase = "turn_pause";
          h.hallsBishopPendingDestX = h.x + pick.ux * crashT;
          h.hallsBishopPendingDestY = h.y + pick.uy * crashT;
          h.hallsBishopUntil = elapsed + HALLS_BISHOP_TURN_PAUSE_SEC;
          aimAt();
          return;
        }
        h.hallsBishopPhase = "strike";
        h.hallsDestX = h.x + pick.ux * crashT;
        h.hallsDestY = h.y + pick.uy * crashT;
        h.hallsGliding = true;
        aimAt();
        return;
      }
      h.hallsBishopPhase = "pause";
      h.hallsBishopUntil = elapsed + HALLS_BISHOP_PAUSE_SEC;
      aimAt();
      return;
    }

    h.hallsBishopLineUx = bestUx;
    h.hallsBishopLineUy = bestUy;
    const destX = h.x + bestUx * bestT;
    const destY = h.y + bestUy * bestT;
    const dirEps = 1e-4;
    const dirChanged =
      !!h.hallsBishopHasLastDiag &&
      (Math.abs(bestUx - Number(h.hallsBishopLastUx)) > dirEps ||
        Math.abs(bestUy - Number(h.hallsBishopLastUy)) > dirEps);
    if (dirChanged) {
      h.hallsBishopPhase = "turn_pause";
      h.hallsBishopPendingDestX = destX;
      h.hallsBishopPendingDestY = destY;
      h.hallsBishopUntil = elapsed + HALLS_BISHOP_TURN_PAUSE_SEC;
      aimAt();
      return;
    }

    h.hallsDestX = destX;
    h.hallsDestY = destY;
    h.hallsGliding = true;
    h.hallsBishopPhase = "approach";
    aimAt();
  }

  function hallsPickQueenSlide(h, target) {
    const dx = target.x - h.x;
    const dy = target.y - h.y;
    const l = Math.hypot(dx, dy) || 1;
    const ux = dx / l;
    const uy = dy / l;
    const max = hallsChessMaxSlideDist(h.x, h.y, h, ux, uy, HALLS_QUEEN_SLIDE_CAP_PX);
    if (max < 0.05) return null;
    return { x: h.x + ux * max, y: h.y + uy * max };
  }

  function hallsPickKingSlide(h, target) {
    const dx = target.x - h.x;
    const dy = target.y - h.y;
    const l = Math.hypot(dx, dy) || 1;
    const ux = dx / l;
    const uy = dy / l;
    const max = hallsChessMaxSlideDist(h.x, h.y, h, ux, uy, HALLS_KING_SLIDE_CAP_PX);
    if (max < 0.05) return null;
    return { x: h.x + ux * max, y: h.y + uy * max };
  }

  function hallsPickKnightL(h, target) {
    const L = HALLS_KNIGHT_LONG_LEG_PX;
    const S = HALLS_KNIGHT_SHORT_LEG_PX;
    let best = null;
    let bestD = Infinity;
    /** @param {number} mxx @param {number} myy @param {number} exx @param {number} eyy */
    const consider = (mxx, myy, exx, eyy) => {
      if (hallsChessPlacementBlocked(mxx, myy, h.r)) return;
      if (hallsChessPlacementBlocked(exx, eyy, h.r)) return;
      const d = distSq({ x: exx, y: eyy }, target);
      if (d < bestD) {
        bestD = d;
        best = { mx: mxx, my: myy, ex: exx, ey: eyy };
      }
    };
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        consider(h.x + sx * L, h.y, h.x + sx * L, h.y + sy * S);
        consider(h.x, h.y + sx * L, h.x + sy * S, h.y + sx * L);
      }
    }
    return best;
  }

  /** @param {any} h @param {{ x: number; y: number; r?: number }} target */
  function hallsTickChessPieceMovement(h, elapsed, spDt, target) {
    const piece = h.type;
    const glide =
      HALLS_CHESS_GLIDE_SPEED_PX_S *
      runLevelEnemySpeedMult() *
      midgameEnemySpeedMult() *
      boneEnemySpeedMult();

    if (piece === HALLS_PIECE_IDS.BISHOP) {
      hallsTickBishopChess(h, elapsed, spDt, target, getPlayer(), glide);
      return;
    }
    if (piece === HALLS_PIECE_IDS.ROOK) {
      hallsTickRookChess(h, elapsed, spDt, target, getPlayer(), glide);
      return;
    }
    if (piece === HALLS_PIECE_IDS.QUEEN) {
      hallsTickQueenChess(h, elapsed, spDt, target, glide);
      return;
    }
    if (piece === HALLS_PIECE_IDS.KING) {
      hallsTickKingChess(h, elapsed, target);
      return;
    }

    const aimAt = () => hallsChessFaceToward(h, target.x, target.y);

    if (piece === HALLS_PIECE_IDS.PAWN) {
      const player = getPlayer();
      const dx = player.x - h.x;
      const dy = player.y - h.y;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      const dist = Math.hypot(dx, dy);
      const diagRatio = Math.min(adx, ady) / Math.max(1, Math.max(adx, ady));
      const diagBand =
        adx >= HALLS_PAWN_DIAG_VOLLEY_MIN_DIST_PX * 0.75 &&
        ady >= HALLS_PAWN_DIAG_VOLLEY_MIN_DIST_PX * 0.75 &&
        Math.abs(adx - HALLS_PAWN_DASH_PX) <= HALLS_PAWN_DIAG_VOLLEY_MATCH_EPS_PX * 1.35 &&
        Math.abs(ady - HALLS_PAWN_DASH_PX) <= HALLS_PAWN_DIAG_VOLLEY_MATCH_EPS_PX * 1.35 &&
        diagRatio >= 0.58 &&
        dist >= HALLS_PAWN_DIAG_VOLLEY_MIN_DIST_PX &&
        dist <= HALLS_PAWN_DIAG_VOLLEY_MAX_DIST_PX;
      if (diagBand && elapsed >= Number(h.hallsPawnVolleyNextAt ?? 0)) {
        const sx = dx >= 0 ? 1 : -1;
        const sy = dy >= 0 ? 1 : -1;
        const ux = sx * Math.SQRT1_2;
        const uy = sy * Math.SQRT1_2;
        const leapMax = HALLS_PAWN_DASH_PX * HALLS_PAWN_DIAG_LEAP_MUL;
        const d = hallsChessMaxSlideDist(h.x, h.y, h, ux, uy, leapMax);
        if (d > 10) {
          h.hallsDestX = h.x + ux * d;
          h.hallsDestY = h.y + uy * d;
          h.hallsGliding = true;
          h.hallsPawnDiagImpactPending = true;
        }
        const diagCd =
          HALLS_PAWN_DIAG_VOLLEY_COOLDOWN_SEC *
          (h.hallsKingPawnSummon ? HALLS_PAWN_EVENT_DIAG_VOLLEY_MULT : 1);
        h.hallsPawnVolleyNextAt = elapsed + diagCd;
      }
    }

    const finishDash = () => {
      if (piece === HALLS_PIECE_IDS.KNIGHT) {
        for (let i = 0; i < HALLS_KNIGHT_LAND_BARRAGE_COUNT; i++) {
          const a = (i / HALLS_KNIGHT_LAND_BARRAGE_COUNT) * Math.PI * 2;
          entities.projectiles.push({
            x: h.x,
            y: h.y,
            vx: Math.cos(a) * HALLS_KNIGHT_LAND_BARRAGE_SPEED,
            vy: Math.sin(a) * HALLS_KNIGHT_LAND_BARRAGE_SPEED,
            r: HALLS_KNIGHT_LAND_BARRAGE_BOLT_R,
            bornAt: elapsed,
            life: HALLS_KNIGHT_LAND_BARRAGE_LIFE_SEC,
            damage: 2,
            hallsKnightLandBolt: true,
          });
        }
      }
      h.hallsGliding = false;
      h.hallsKnightStage = null;
      h.hallsDestX = null;
      h.hallsDestY = null;
      const cdMult =
        piece === HALLS_PIECE_IDS.PAWN && h.hallsKingPawnSummon ? HALLS_PAWN_EVENT_COOLDOWN_MULT : 1;
      h.hallsNextThinkAt = elapsed + hallsChessCooldownFor(piece) * cdMult;
    };

    if (h.hallsGliding && h.hallsDestX != null && h.hallsDestY != null) {
      aimAt();
      const knight = piece === HALLS_PIECE_IDS.KNIGHT;
      const knightMul =
        knight && h.hallsKnightStage === "a"
          ? HALLS_KNIGHT_LONG_GLIDE_MUL
          : knight && h.hallsKnightStage === "b"
            ? HALLS_KNIGHT_SHORT_GLIDE_MUL
            : 1;
      const spd = glide * knightMul;
      const st = knight
        ? hallsChessGlideAxisToward(
            h,
            h.hallsDestX,
            h.hallsDestY,
            h.hallsKnightAxis === "y" ? "y" : "x",
            spd,
            spDt,
          )
        : hallsChessGlideToward(h, h.hallsDestX, h.hallsDestY, spd, spDt);
      const done = st === "arrived" || st === "stuck";
      if (!done) return;

      if (piece === HALLS_PIECE_IDS.KNIGHT && h.hallsKnightStage === "a" && done) {
        if (st === "arrived") {
          h.hallsKnightStage = "b";
          h.hallsKnightAxis = h.hallsKnightAxis === "x" ? "y" : "x";
          h.hallsDestX = Number(h.hallsKnightEndX);
          h.hallsDestY = Number(h.hallsKnightEndY);
          h.hallsGliding = true;
          return;
        }
        finishDash();
        return;
      }

      if (piece === HALLS_PIECE_IDS.PAWN && h.hallsPawnDiagImpactPending) {
        h.hallsPawnDiagImpactPending = false;
        entities.hallsPawnImpacts.push({ x: h.x, y: h.y, bornAt: elapsed, life: 0.96 });
      }

      finishDash();
      return;
    }

    if (elapsed < (h.hallsNextThinkAt ?? 0)) {
      aimAt();
      return;
    }

    /** @type {{ x: number; y: number } | null} */
    let dest = null;
    if (piece === HALLS_PIECE_IDS.PAWN) dest = hallsPickPawnDash(h, target);
    else if (piece === HALLS_PIECE_IDS.QUEEN) dest = hallsPickQueenSlide(h, target);
    else if (piece === HALLS_PIECE_IDS.KING) dest = hallsPickKingSlide(h, target);
    else if (piece === HALLS_PIECE_IDS.KNIGHT) {
      const plan = hallsPickKnightL(h, target);
      if (plan) {
        h.hallsKnightStage = "a";
        h.hallsKnightAxis =
          Math.abs(plan.mx - h.x) >= Math.abs(plan.my - h.y) ? "x" : "y";
        h.hallsKnightMidX = plan.mx;
        h.hallsKnightMidY = plan.my;
        h.hallsKnightEndX = plan.ex;
        h.hallsKnightEndY = plan.ey;
        h.hallsDestX = plan.mx;
        h.hallsDestY = plan.my;
        h.hallsGliding = true;
        h.hallsNextThinkAt = elapsed;
        aimAt();
        return;
      }
    }

    if (!dest) {
      h.hallsNextThinkAt = elapsed + 0.18;
      aimAt();
      return;
    }

    h.hallsDestX = dest.x;
    h.hallsDestY = dest.y;
    h.hallsGliding = true;
    h.hallsKnightStage = null;
    aimAt();
  }

  function moveHunters(dt) {
    const elapsed = getSimElapsed();
    const player = getPlayer();
    for (const h of entities.hunters) {
      if (h.type === "cryptSpawner" && h.cryptDisguised) {
        const ddx = h.x - player.x;
        const ddy = h.y - player.y;
        if (ddx * ddx + ddy * ddy > 160 * 160) continue;
        h.cryptDisguised = false;
        h.life = 3;
        h.dieAt = elapsed + 3;
        h.cryptRevealStartAt = elapsed;
        h.cryptRevealEndAt = elapsed + 0.35;
        h.cryptRevealU = 0;
        h.spawnDelayUntil = elapsed;
        h.spawnActiveUntil = elapsed + 3;
        h.nextSwarmAt = elapsed;
        h.fireGlow = true;
      }
      if (h.type === "cryptSpawner" && !h.cryptDisguised) {
        const t0 = Number(h.cryptRevealStartAt ?? 0);
        const t1 = Number(h.cryptRevealEndAt ?? 0);
        if (t1 > t0) h.cryptRevealU = clamp((elapsed - t0) / Math.max(0.0001, t1 - t0), 0, 1);
        else h.cryptRevealU = 1;
      }
      if (h.type === "spawner" || h.type === "cryptSpawner") continue;
      if (elapsed < (h.stunnedUntil || 0) && h.type !== "depthsTentacle" && h.type !== "depthsEldritchBarrageBolt")
        continue;
      const spDt = dt * spades13AuraEnemyDtMult();

      if (h.hallsKingLineProjectile) {
        h.hallsKingLinePrevX = h.x;
        h.hallsKingLinePrevY = h.y;
        moveCircleWithCollisions(h, Number(h.hallsScriptedVx ?? 0), Number(h.hallsScriptedVy ?? 0), spDt, {
          ignoreObstacles: true,
        });
        continue;
      }

      if (isHallsChessPieceType(h.type)) {
        hallsTickChessPieceMovement(h, elapsed, spDt, pickTargetForHunter(h));
        continue;
      }

      if (h.type === "airSpawner" || h.type === "depthsBoltSpawner") {
        const target = pickTargetForHunter(h);
        const desired = vectorToTarget(h, target);
        const sm = runLevelEnemySpeedMult();
        const am = runLevelEnemyAccelMult();
        const airSteer = Math.min(0.88, 0.78 * am);
        const airInertia = 1 - airSteer;
        const airSpeed = AIR_SPAWNER_CHASE_SPEED * sm * midgameEnemySpeedMult() * boneEnemySpeedMult();
        h.dir.x = h.dir.x * airInertia + desired.x * airSteer;
        h.dir.y = h.dir.y * airInertia + desired.y * airSteer;
        const alen = Math.hypot(h.dir.x, h.dir.y) || 1;
        h.dir.x /= alen;
        h.dir.y /= alen;
        moveCircleWithCollisions(h, h.dir.x * airSpeed, h.dir.y * airSpeed, spDt, { ignoreObstacles: true });
        ejectSpawnerHunterFromSpecialHexFootprint(h);
        continue;
      }

      if (h.type === "depthsEldritchBarrageBolt") {
        moveCircleWithCollisions(h, h.eldritchBarrageVx, h.eldritchBarrageVy, spDt, {
          ignoreObstacles: true,
          blockValiantEnemyShockFields: true,
        });
        continue;
      }

      if (h.type === "depthsEldritchCageLunge") {
        moveCircleWithCollisions(h, h.eldritchCageLungeVx, h.eldritchCageLungeVy, spDt, {
          ignoreObstacles: true,
          blockValiantEnemyShockFields: true,
        });
        continue;
      }

      if (h.type === "ghost") {
        const target = pickTargetForHunter(h);
        const ghostSpeed = h.ghostDashSpeed * boneEnemySpeedMult();
        const trail = h.motionTrail || (h.motionTrail = []);
        h.ghostAura = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(elapsed * 9 + h.x * 0.02));
        for (let i = trail.length - 1; i >= 0; i--) {
          trail[i].alpha *= 0.78;
          if (trail[i].alpha < 0.05) trail.splice(i, 1);
        }
        if (h.ghostPhase === "windup1") {
          const ax = Number(h.ghostAnchorPlayerX ?? player.x);
          const ay = Number(h.ghostAnchorPlayerY ?? player.y);
          h.x += player.x - ax;
          h.y += player.y - ay;
          h.ghostAnchorPlayerX = player.x;
          h.ghostAnchorPlayerY = player.y;
        }
        if (h.ghostPhase === "windup1") {
          const lead = 0.34;
          const tx = target.x + (target.velX ?? 0) * lead;
          const ty = target.y + (target.velY ?? 0) * lead;
          h.ghostDashDir = vectorToTarget(h, { x: tx, y: ty });
          h.dir = { x: h.ghostDashDir.x, y: h.ghostDashDir.y };
          h.opacity = 1;
          if (elapsed >= (h.ghostWindupEnd ?? 0)) {
            const reach = Math.hypot(tx - h.x, ty - h.y);
            h.ghostDash1Total = Math.max(GHOST_DASH_LEN_MIN, reach + GHOST_PRED_OVERSHOOT_PX);
            h.ghostTelegraphLineLen = h.ghostDash1Total;
            h.ghostPhase = "telegraph1";
            h.ghostTelegraphStart = elapsed;
            h.ghostTelegraphDur = 0.18;
            h.ghostTelegraphU = 0;
          }
          continue;
        }
        if (h.ghostPhase === "telegraph1") {
          const dur = Math.max(0.0001, h.ghostTelegraphDur ?? 0.18);
          h.ghostTelegraphU = Math.min(1, (elapsed - (h.ghostTelegraphStart ?? elapsed)) / dur);
          h.opacity = 0.86 + 0.14 * Math.sin(h.ghostTelegraphU * Math.PI);
          if (h.ghostTelegraphU >= 1 - 1e-5) {
            h.ghostPhase = "dash1";
            h.ghostDashRemain = Math.max(1, h.ghostDash1Total || GHOST_DASH_LEN_MIN);
            h.opacity = 1;
          }
          continue;
        }
        if (h.ghostPhase === "dash1") {
          const step = Math.min(ghostSpeed * spDt, h.ghostDashRemain ?? 0);
          const prevX = h.x;
          const prevY = h.y;
          h.x += h.ghostDashDir.x * step;
          h.y += h.ghostDashDir.y * step;
          h.ghostDashRemain -= step;
          trail.push({ x: prevX, y: prevY, r: h.r * 0.95, alpha: 0.55 });
          if (elapsed >= (h.ghostDamageLockUntil ?? 0)) {
            const hitDist = pointToSegmentDistance(player.x, player.y, prevX, prevY, h.x, h.y);
            if (hitDist <= player.r + h.r * 0.9) {
              damagePlayer(1, { sourceX: h.x, sourceY: h.y });
              h.ghostDamageLockUntil = elapsed + ENEMY_HIT_COOLDOWN_SEC;
            }
          }
          if ((h.ghostDashRemain ?? 0) <= 0.0001) {
            h.ghostPhase = "pause2";
            h.ghostPause2End = elapsed + 0.26;
          }
          continue;
        }
        if (h.ghostPhase === "pause2") {
          h.opacity = 1;
          if (elapsed >= (h.ghostPause2End ?? 0)) {
            const lead2 = 0.18;
            const tx = target.x + (target.velX ?? 0) * lead2;
            const ty = target.y + (target.velY ?? 0) * lead2;
            h.ghostDashDir = vectorToTarget(h, { x: tx, y: ty });
            h.dir = { x: h.ghostDashDir.x, y: h.ghostDashDir.y };
            const reach2 = Math.hypot(tx - h.x, ty - h.y);
            h.ghostDash2Total = Math.max(GHOST_DASH_LEN_MIN, reach2 + GHOST_PRED_OVERSHOOT_PX);
            h.ghostTelegraphLineLen = h.ghostDash2Total;
            h.ghostPhase = "telegraph2";
            h.ghostTelegraphStart = elapsed;
            h.ghostTelegraphDur = 0.13;
            h.ghostTelegraphU = 0;
          }
          continue;
        }
        if (h.ghostPhase === "telegraph2") {
          const dur = Math.max(0.0001, h.ghostTelegraphDur ?? 0.13);
          h.ghostTelegraphU = Math.min(1, (elapsed - (h.ghostTelegraphStart ?? elapsed)) / dur);
          h.opacity = 0.84 + 0.16 * Math.sin(h.ghostTelegraphU * Math.PI);
          if (h.ghostTelegraphU >= 1 - 1e-5) {
            h.ghostPhase = "dash2";
            h.ghostDashRemain = Math.max(1, h.ghostDash2Total || GHOST_DASH_LEN_MIN);
            h.ghostDash2Start = h.ghostDashRemain;
            h.opacity = 1;
          }
          continue;
        }
        if (h.ghostPhase === "dash2") {
          const start = Math.max(1, h.ghostDash2Start ?? Math.max(1, h.ghostDash2Total || 1));
          const step = Math.min(ghostSpeed * spDt, h.ghostDashRemain ?? 0);
          const prevX = h.x;
          const prevY = h.y;
          h.x += h.ghostDashDir.x * step;
          h.y += h.ghostDashDir.y * step;
          h.ghostDashRemain -= step;
          const traveledU = 1 - (h.ghostDashRemain ?? 0) / start;
          h.opacity = clamp(1 - traveledU, 0, 1);
          trail.push({ x: prevX, y: prevY, r: h.r * 0.95, alpha: 0.48 * h.opacity });
          if (traveledU <= 0.75 && elapsed >= (h.ghostDamageLockUntil ?? 0)) {
            const hitDist = pointToSegmentDistance(player.x, player.y, prevX, prevY, h.x, h.y);
            if (hitDist <= player.r + h.r * 0.9) {
              damagePlayer(1, { sourceX: h.x, sourceY: h.y });
              h.ghostDamageLockUntil = elapsed + ENEMY_HIT_COOLDOWN_SEC;
            }
          }
          if ((h.ghostDashRemain ?? 0) <= 0.0001) {
            h._removeNow = true;
            scheduleNextBoneGhostSpawn(elapsed, true);
          }
          continue;
        }
      }

      if (h.type === "depthsTentacle") {
        const ax = h.depthsAnchorX;
        const ay = h.depthsAnchorY;
        const emergeEnd = h.depthsEmergeEnd;
        const telegraphEnd = h.depthsTelegraphEnd;
        const coilEnd = h.depthsCoilEnd;
        const strikeEnd = h.depthsStrikeEnd;
        const motionEnd = h.depthsMotionEnd;
        const splashEnd = h.depthsSplashEnd;

        const aimToPlayer = () => {
          const ddx = player.x - ax;
          const ddy = player.y - ay;
          const dlen = Math.hypot(ddx, ddy) || 1;
          return { ux: ddx / dlen, uy: ddy / dlen, dst: dlen };
        };

        const placeTip = (reach, ux, uy) => {
          h.depthsReach = reach;
          h.depthsSlamDirX = ux;
          h.depthsSlamDirY = uy;
          h.dir = { x: ux, y: uy };
          h.x = ax + ux * reach;
          h.y = ay + uy * reach;
        };

        const placeTipOnArc = (theta) => {
          const px = h.depthsPivotX;
          const py = h.depthsPivotY;
          const R = h.depthsArcR;
          h.depthsReach = R;
          h.depthsSlamDirX = Math.cos(theta);
          h.depthsSlamDirY = Math.sin(theta);
          h.dir = { x: h.depthsSlamDirX, y: h.depthsSlamDirY };
          h.x = px + R * Math.cos(theta);
          h.y = py + R * Math.sin(theta);
        };

        if (elapsed < emergeEnd) {
          const span = Math.max(1e-4, emergeEnd - h.depthsSpawnAt);
          const u = clamp((elapsed - h.depthsSpawnAt) / span, 0, 1);
          const ease = 1 - Math.pow(1 - u, 2.05);
          const aim = aimToPlayer();
          const reach = Math.min(aim.dst * 0.76, 188) * ease;
          placeTip(reach, aim.ux, aim.uy);
          h.opacity = 0.35 + 0.6 * ease;
          continue;
        }
        if (elapsed < coilEnd) {
          if (!h.depthsCoilInit) {
            h.depthsCoilInit = true;
            const aim = aimToPlayer();
            h.depthsLockedUx = aim.ux;
            h.depthsLockedUy = aim.uy;
            h.depthsR0 = Math.max(8, h.depthsReach);
            const ux = h.depthsLockedUx;
            const uy = h.depthsLockedUy;
            const perpX = -uy * h.depthsCoilSign;
            const perpY = ux * h.depthsCoilSign;
            const d0 = h.depthsR0;
            h.depthsPivotX = ax + ux * (d0 * 0.18) + perpX * (d0 * 0.38);
            h.depthsPivotY = ay + uy * (d0 * 0.18) + perpY * (d0 * 0.38);
            const t0x = ax + ux * d0;
            const t0y = ay + uy * d0;
            const dx0 = t0x - h.depthsPivotX;
            const dy0 = t0y - h.depthsPivotY;
            h.depthsArcR = Math.hypot(dx0, dy0) || 1;
            h.depthsAngleTele = Math.atan2(dy0, dx0);
            const COIL_RAD = (74 * Math.PI) / 180;
            h.depthsAngleCoiled = h.depthsAngleTele - h.depthsCoilSign * COIL_RAD;
          }
          const span = Math.max(1e-4, coilEnd - telegraphEnd);
          const cu = clamp((elapsed - telegraphEnd) / span, 0, 1);
          const smooth = cu * cu * (3 - 2 * cu);
          const th = h.depthsAngleTele + (h.depthsAngleCoiled - h.depthsAngleTele) * smooth;
          placeTipOnArc(th);
          h.opacity = 0.82 + 0.12 * Math.sin(elapsed * 18);
          continue;
        }
        if (elapsed < strikeEnd) {
          const span = Math.max(1e-4, strikeEnd - coilEnd);
          const su = clamp((elapsed - coilEnd) / span, 0, 1);
          /** ~constant angular speed full turn; ends with non-zero slope into splash fade. */
          const spinEase = su * (1.16 - 0.16 * su);
          const spinRad = Number(h.depthsSpinRad ?? (260 * Math.PI) / 180);
          const th = h.depthsAngleCoiled + h.depthsCoilSign * spinRad * spinEase;
          const prevTh = h.depthsSlamPrevAngle == null ? th : h.depthsSlamPrevAngle;
          placeTipOnArc(th);
          h.opacity = 1;

          const ox = h.depthsPivotX;
          const oy = h.depthsPivotY;
          const rMin = 0;
          const rMax = h.depthsArcR + 88;
          const dAng = Math.abs(normalizeAngle(th - prevTh));

          if (dAng > 0.006 && su >= 0.03 && elapsed >= (h.hitLockUntil ?? 0)) {
            const pdx = player.x - ox;
            const pdy = player.y - oy;
            const pDist = Math.hypot(pdx, pdy);
            const pivotNear =
              pDist <= player.r + 26 &&
              pDist <= rMax + player.r + 12 &&
              su >= 0.04;
            const sectorHit = annularSectorContainsCircle(
              ox,
              oy,
              rMin,
              rMax,
              prevTh,
              th,
              player.x,
              player.y,
              player.r + 12,
            );
            if (!h.depthsDamaged && (sectorHit || pivotNear)) {
              damagePlayer(1, { sourceX: h.x, sourceY: h.y });
              h.depthsDamaged = true;
            }

            const grazed = h.depthsGrazedDecoys;
            const decoys = getDecoys();
            const nowHit = getSimElapsed();
            for (let di = decoys.length - 1; di >= 0; di--) {
              const d = decoys[di];
              if (grazed.includes(d)) continue;
              const dr = d.r ?? 10;
              const ddx = d.x - ox;
              const ddy = d.y - oy;
              const dDist = Math.hypot(ddx, ddy);
              const decoyPivotNear = dDist <= dr + 22 && dDist <= rMax + dr + 6;
              if (
                !annularSectorContainsCircle(ox, oy, rMin, rMax, prevTh, th, d.x, d.y, dr + 6) &&
                !decoyPivotNear
              )
                continue;
              grazed.push(d);
              if (nowHit < (d.invulnerableUntil ?? 0)) continue;
              d.hp = Math.max(0, (d.hp ?? 1) - 1);
              if (d.kind === "bulwarkFlag") d.invulnerableUntil = nowHit + BULWARK_POST_HIT_INVULN_SEC;
              if (d.hp <= 0 && d.kind !== "bulwarkFlag") decoys.splice(di, 1);
            }
          }

          h.depthsSlamPrevAngle = th;
          continue;
        }
        if (elapsed < splashEnd) {
          h.depthsSplashU = clamp((elapsed - motionEnd) / Math.max(1e-4, splashEnd - motionEnd), 0, 1);
          h.opacity = (1 - h.depthsSplashU) * 0.95;
          continue;
        }
        continue;
      }

      if (h.type === "depthsEldritchBloom") {
        const waveY = getDepthsBossRisingWaveFrontY();
        if (h.depthsEldritchTriplicateScripted) {
          continue;
        }
        if (h.depthsEldritchP2P3InterludeScripted) {
          continue;
        }
        if (Number(h.depthsEldritchP3DriftUntilSim ?? 0) > elapsed) {
          continue;
        }
        if (h.depthsEldritchP3BossHidden) {
          continue;
        }
        if (h.depthsEldritchTriplicateScripted) {
          continue;
        }
        if (h.depthsEldritchPostCageScripted) {
          continue;
        }
        if (h.depthsEldritchCageStrikeActive || h.depthsEldritchBarrageAttackActive) {
          continue;
        }
        /** Lightning volleys: stay `ELDRITCH_BLOOD_CAST_ABOVE_WAVE_PX` above the wave and keep drawing glow (see `hunterDraw`). */
        if (h.depthsEldritchLightningCastActive && waveY != null && Number.isFinite(waveY)) {
          const capY = waveY - ELDRITCH_BLOOD_CAST_ABOVE_WAVE_PX;
          h.y = capY;
          const eldritchBossChase = depthsPathActive() && !!getSuppressDepthsBossNormalSpawnsDep?.();
          const wanderT = elapsed * 0.22 + Number(h.bornAt ?? 0) * 0.00062;
          const spin = Number(h.depthsOrbitSign) || 1;
          const wanderAmp = 150;
          const lateral =
            Math.sin(wanderT) * wanderAmp * 0.62 +
            Math.sin(wanderT * 1.57 + spin * 1.1) * wanderAmp * 0.38;
          const aimX = player.x + lateral;
          const spd =
            178 *
            (eldritchBossChase ? 1.16 : 1) *
            runLevelEnemySpeedMult() *
            midgameEnemySpeedMult() *
            boneEnemySpeedMult();
          const tx = aimX - h.x;
          const mx = clamp(tx / 380, -1, 1);
          const prevX = h.x;
          moveCircleWithCollisions(h, mx * spd * 0.68, 0, spDt, {
            blockValiantEnemyShockFields: true,
            ignoreObstacles: true,
          });
          const leashX = eldritchBossChase ? 480 : 380;
          h.x = clamp(h.x, player.x - leashX, player.x + leashX);
          const dxm = h.x - prevX;
          h.dir.x = Math.abs(dxm) > 0.06 ? Math.sign(dxm) : tx >= 0 ? 1 : -1;
          h.dir.y = -0.48;
          const ddir = Math.hypot(h.dir.x, h.dir.y) || 1;
          h.dir.x /= ddir;
          h.dir.y /= ddir;
          continue;
        }
        if (Number(h.depthsEldritchTelegraphHoldUntil ?? 0) > elapsed) {
          continue;
        }
        if (h.depthsEldritchOrbStrikeChanneling) {
          continue;
        }
        const eldritchBossChase = depthsPathActive() && !!getSuppressDepthsBossNormalSpawnsDep?.();
        const prepStart = Number(h.depthsSpellLiftPrepStartSim ?? 0);
        const prepEnd = Number(h.depthsSpellLiftPrepEndSim ?? 0);
        const inSpellLiftPrep =
          prepEnd > prepStart &&
          elapsed >= prepStart &&
          elapsed < prepEnd &&
          waveY != null &&
          Number.isFinite(waveY);

        if (inSpellLiftPrep) {
          const capY = waveY - ELDRITCH_BLOOD_CAST_ABOVE_WAVE_PX;
          const dur = prepEnd - prepStart;
          const u = dur > 1e-6 ? clamp((elapsed - prepStart) / dur, 0, 1) : 1;
          const easeInOut =
            u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
          if (Number(h._depthsSpellPrepAnchorSim ?? 0) !== prepStart) {
            h.depthsSpellPrepAnchorY = h.y;
            h._depthsSpellPrepAnchorSim = prepStart;
          }
          const ay = Number(h.depthsSpellPrepAnchorY);
          const destY = Math.min(ay, capY);
          h.y = ay + (destY - ay) * easeInOut;

          const wanderT = elapsed * 0.22 + Number(h.bornAt ?? 0) * 0.00062;
          const spin = Number(h.depthsOrbitSign) || 1;
          const wanderAmp = 150;
          const lateral =
            Math.sin(wanderT) * wanderAmp * 0.62 +
            Math.sin(wanderT * 1.57 + spin * 1.1) * wanderAmp * 0.38;
          const aimX = player.x + lateral;
          const spd =
            178 *
            (eldritchBossChase ? 1.16 : 1) *
            runLevelEnemySpeedMult() *
            midgameEnemySpeedMult() *
            boneEnemySpeedMult();
          const tx = aimX - h.x;
          const mx = clamp(tx / 380, -1, 1);
          const prevX = h.x;
          moveCircleWithCollisions(h, mx * spd * 0.68, 0, spDt, {
            blockValiantEnemyShockFields: true,
            ignoreObstacles: true,
          });
          const leashX = eldritchBossChase ? 480 : 380;
          h.x = clamp(h.x, player.x - leashX, player.x + leashX);
          const dxm = h.x - prevX;
          h.dir.x = Math.abs(dxm) > 0.06 ? Math.sign(dxm) : tx >= 0 ? 1 : -1;
          h.dir.y = -0.48;
          const ddir = Math.hypot(h.dir.x, h.dir.y) || 1;
          h.dir.x /= ddir;
          h.dir.y /= ddir;
          continue;
        }

        /** Preferred float: this far below the rising front (+Y down). */
        const ELDRITCH_FLOAT_BELOW_WAVE = 150;
        /** When |player.y − wave| is below this, no extra “rise toward player” ceiling beyond the wave. */
        const ELDRITCH_PLAYER_WAVE_DIST_LO = 300;
        /** At this |player.y − wave| or more, boss uses full `ELDRITCH_CEILING_ABOVE_WAVE` (ramp completes here). */
        const ELDRITCH_PLAYER_WAVE_DIST_HI = 500;
        /** Max how far above the wave front the boss may target (px), when player is far from the wave. */
        const ELDRITCH_CEILING_ABOVE_WAVE = 820;
        /** How strongly vertical target follows the player (0 = stay on float line, 1 = match player y). */
        const ELDRITCH_PLAYER_Y_BLEND = 0.62;

        let targetY;
        let yMinClamp;
        let yMaxClamp;
        if (waveY != null && Number.isFinite(waveY)) {
          const prefY = waveY + ELDRITCH_FLOAT_BELOW_WAVE;
          const distPw = Math.abs(player.y - waveY);
          const riseT = clamp(
            (distPw - ELDRITCH_PLAYER_WAVE_DIST_LO) /
              Math.max(1e-4, ELDRITCH_PLAYER_WAVE_DIST_HI - ELDRITCH_PLAYER_WAVE_DIST_LO),
            0,
            1,
          );
          const riseCap = riseT * ELDRITCH_CEILING_ABOVE_WAVE;
          yMinClamp = waveY - riseCap;
          targetY = prefY + (player.y - prefY) * ELDRITCH_PLAYER_Y_BLEND;
          targetY = Math.max(targetY, yMinClamp);
          yMaxClamp = waveY + 450;
        } else {
          targetY = player.y + 170;
          yMinClamp = player.y - 380;
          yMaxClamp = player.y + 520;
        }
        if (h.depthsCastLiftActive && waveY != null && Number.isFinite(waveY)) {
          const castCapY = waveY - ELDRITCH_BLOOD_CAST_ABOVE_WAVE_PX;
          yMaxClamp = Math.min(yMaxClamp, castCapY);
          yMinClamp = Math.min(yMinClamp, yMaxClamp);
          targetY = Math.min(targetY, castCapY);
        }
        /** Slow horizontal wander so the boss drifts side-to-side instead of parking on `player.x`. */
        const wanderT = elapsed * 0.29 + Number(h.bornAt ?? 0) * 0.00062;
        const spin = Number(h.depthsOrbitSign) || 1;
        const wanderAmp = 290;
        const lateral =
          Math.sin(wanderT) * wanderAmp * 0.62 +
          Math.sin(wanderT * 1.57 + spin * 1.1) * wanderAmp * 0.38;
        const aimX = player.x + lateral;
        const tx = aimX - h.x;
        const ty = targetY - h.y;
        const tlen = Math.hypot(tx, ty) || 1;
        let mx = tx / tlen;
        let my = ty / tlen;
        const tangX = -my * spin * 0.54;
        const tangY = mx * spin * 0.54;
        mx = mx * 0.58 + tangX;
        my = my * 0.58 + tangY;
        const mlen0 = Math.hypot(mx, my) || 1;
        mx /= mlen0;
        my /= mlen0;
        const steer = 0.34;
        const inertia = 1 - steer;
        h._eldritchMvX = (h._eldritchMvX ?? mx) * inertia + mx * steer;
        h._eldritchMvY = (h._eldritchMvY ?? my) * inertia + my * steer;
        const mlen = Math.hypot(h._eldritchMvX, h._eldritchMvY) || 1;
        h._eldritchMvX /= mlen;
        h._eldritchMvY /= mlen;
        h.dir.x = h._eldritchMvX;
        h.dir.y = h._eldritchMvY;
        const spd =
          178 *
          (eldritchBossChase ? 1.16 : 1) *
          runLevelEnemySpeedMult() *
          midgameEnemySpeedMult() *
          boneEnemySpeedMult();
        moveCircleWithCollisions(h, h._eldritchMvX * spd, h._eldritchMvY * spd, spDt, {
          blockValiantEnemyShockFields: true,
          ignoreObstacles: true,
        });
        const leashX = eldritchBossChase ? 480 : 380;
        h.x = clamp(h.x, player.x - leashX, player.x + leashX);
        h.y = clamp(h.y, yMinClamp, yMaxClamp);
        continue;
      }

      const lifeSpan = h.life || Math.max(0.0001, h.dieAt - h.bornAt);
      const age = clamp((elapsed - h.bornAt) / lifeSpan, 0, 1);
      const speedFactor = 1 + age * HUNTER_SPEED_AGE_COEFF;
      const baseSpeed =
        h.type === "sniper"
          ? 100
          : h.type === "cutter"
            ? 116
            : h.type === "laser" || h.type === "laserBlue" || h.type === "depthsGrappleLaser"
              ? h.type === "laserBlue"
                ? 156
                : 138
            : h.type === "ranged"
              ? 85
              : h.type === "fast"
                ? 150
                : h.type === "depthsShardChaser"
                  ? 110
                  : 110;
      const sm = runLevelEnemySpeedMult();
      const steerW = Math.min(0.42, 0.26 * runLevelEnemyAccelMult());
      const inertiaW = 1 - steerW;
      let speed = baseSpeed * sm * speedFactor * midgameEnemySpeedMult() * boneEnemySpeedMult();

      if (h.type === "fast" && h.depthsBoltUnagitated) {
        const boltDir = h.depthsBoltDir || { x: 1, y: 0 };
        const spitMult =
          h.depthsBoltSpitSpeedMult != null && Number.isFinite(h.depthsBoltSpitSpeedMult) && h.depthsBoltSpitSpeedMult > 0
            ? h.depthsBoltSpitSpeedMult
            : 1;
        const boltSpeed =
          468 * sm * speedFactor * midgameEnemySpeedMult() * boneEnemySpeedMult() * spitMult;
        const { touchedObstacle } = moveCircleWithCollisions(
          h,
          boltDir.x * boltSpeed,
          boltDir.y * boltSpeed,
          spDt,
          { blockValiantEnemyShockFields: true, ignoreObstacles: true },
        );
        if (touchedObstacle) h.depthsBoltUnagitated = false;
        else {
          const ox = Number(h.depthsBoltOx ?? h.x);
          const oy = Number(h.depthsBoltOy ?? h.y);
          const dx = h.x - ox;
          const dy = h.y - oy;
          if (dx * dx + dy * dy >= DEPTHS_BOLT_AGENCY_DIST * DEPTHS_BOLT_AGENCY_DIST) h.depthsBoltUnagitated = false;
        }
        h.dir.x = boltDir.x;
        h.dir.y = boltDir.y;
        continue;
      }

      let desired;
      if (h.type === "cutter") {
        const target = pickTargetForHunter(h);
        const lead = 58;
        if (target === player) {
          const px = player.x + player.facing.x * lead;
          const py = player.y + player.facing.y * lead;
          desired = vectorToTarget(h, { x: px, y: py });
        } else {
          desired = vectorToTarget(h, target);
        }
      } else if (h.type === "sniper") {
        const target = pickTargetForHunter(h);
        const away = vectorToTarget(target, h);
        const toward = vectorToTarget(h, target);
        const d2 = distSq(h, target);
        desired = d2 < 210 * 210 ? away : toward;
      } else if (h.type === "ranged") {
        const target = pickTargetForHunter(h);
        const d2 = distSq(h, target);
        const away = vectorToTarget(target, h);
        const toward = vectorToTarget(h, target);
        desired = d2 < 240 * 240 ? away : toward;
      } else if (h.type === "laser" || h.type === "laserBlue" || h.type === "depthsGrappleLaser") {
        const isBlue = h.type === "laserBlue";
        const isDepthsPurple = h.type === "depthsGrappleLaser";
        const target = pickTargetForHunter(h);
        const los = isBlue ? hasLineOfSight(h, target, { ignoreObstacles: true }) : hasLineOfSight(h, target);
        if (suppressRangedAttacksNow) {
          h.laserState = "move";
          h.laserAim = null;
          continue;
        }

        if (h.laserState === "aim") {
          if (elapsed >= h.aimStartedAt + h.laserWarning) {
            const aim = h.laserAim;
            if (!aim) {
              h.laserState = "move";
              h.nextLaserReadyAt = elapsed + h.laserCooldown;
              continue;
            }
            const laserDamageId = nextLaserBeamDamageId++;
            const bone = bonePathActive();
            entities.laserBeams.push({
              x1: aim.x1,
              y1: aim.y1,
              x2: aim.x2,
              y2: aim.y2,
              bornAt: elapsed,
              expiresAt: elapsed + 0.5,
              warning: false,
              active: true,
              blueLaser: isBlue,
              damageId: laserDamageId,
              ...(isDepthsPurple ? { depthsPurpleLaser: true } : {}),
              ...(bone && !isBlue && !isDepthsPurple ? { boneGhostBeam: true } : {}),
              ...(bone && isBlue ? { boneGhostBlueBeam: true } : {}),
            });
            if (!hitDecoyAlongSegment(aim.x1, aim.y1, aim.x2, aim.y2, 5, { laserOneShotId: laserDamageId })) {
              const hitDist = pointToSegmentDistance(player.x, player.y, aim.x1, aim.y1, aim.x2, aim.y2);
              if (hitDist <= player.r + 5) {
                damagePlayer(
                  2,
                  isBlue
                    ? {
                        laserBlueSlow: true,
                        sourceX: aim.x1,
                        sourceY: aim.y1,
                        swampDamageInstanceId: `laser-${laserDamageId}`,
                      }
                    : {
                        sourceX: aim.x1,
                        sourceY: aim.y1,
                        swampDamageInstanceId: `laser-${laserDamageId}`,
                      },
                );
              }
            }
            h.laserState = "move";
            h.laserAim = null;
            h.nextLaserReadyAt = elapsed + h.laserCooldown;
          }
          continue;
        }

        if (los && elapsed >= h.nextLaserReadyAt) {
          const aimDirX = target.x - h.x;
          const aimDirY = target.y - h.y;
          const endpoint = isBlue
            ? getLaserEndpoint(h.x, h.y, aimDirX, aimDirY, 900, { throughObstacles: true })
            : getLaserEndpoint(h.x, h.y, aimDirX, aimDirY);
          h.laserAim = { x1: h.x, y1: h.y, x2: endpoint.x, y2: endpoint.y };
          h.laserState = "aim";
          h.aimStartedAt = elapsed;
          const boneW = bonePathActive();
          entities.laserBeams.push({
            x1: h.laserAim.x1,
            y1: h.laserAim.y1,
            x2: h.laserAim.x2,
            y2: h.laserAim.y2,
            bornAt: elapsed,
            expiresAt: elapsed + h.laserWarning,
            warning: true,
            active: false,
            blueLaser: isBlue,
            ...(isDepthsPurple ? { depthsPurpleLaser: true } : {}),
            ...(boneW && !isBlue && !isDepthsPurple ? { boneGhostBeam: true } : {}),
            ...(boneW && isBlue ? { boneGhostBlueBeam: true } : {}),
          });
          continue;
        }

        const d2 = distSq(h, target);
        const away = vectorToTarget(target, h);
        const toward = vectorToTarget(h, target);
        desired = d2 < 200 * 200 ? away : toward;
      } else if (h.type === "chaser" || h.type === "depthsShardChaser") {
        const target = pickTargetForHunter(h);
        const toT = vectorToTarget(h, target);
        const dist = Math.hypot(target.x - h.x, target.y - h.y);
        const isShard = h.type === "depthsShardChaser";
        const dashLenFull = isShard ? DEPTHS_SHARD_BASE_DASH * DEPTHS_SHARD_DASH_MULT : 124;

        if (h.chaserDashPhase === "windup") {
          h.dir.x = toT.x;
          h.dir.y = toT.y;
          if (elapsed >= h.chaserDashWindupEnd) {
            if (isShard) {
              const baseAng = Math.atan2(toT.y, toT.x);
              const syncReady = elapsed + 1.92;
              const sharedDie = h.dieAt;
              for (const da of [-DEPTHS_SHARD_SPREAD_RAD, 0, DEPTHS_SHARD_SPREAD_RAD]) {
                const ang = baseAng + da;
                spawnHunter("depthsShardChaser", h.x, h.y, {
                  shardClone: true,
                  shardDashDir: { x: Math.cos(ang), y: Math.sin(ang) },
                  shardDashDist: dashLenFull,
                  shardsSyncDashReady: syncReady,
                  dieAtOverride: sharedDie,
                });
              }
              h._removeNow = true;
              continue;
            }
            h.chaserDashPhase = "dashing";
            h.chaserDashDir = { x: toT.x, y: toT.y };
            h.chaserDashDist = dashLenFull;
          } else {
            continue;
          }
        }

        if (h.chaserDashPhase === "dashing") {
          const dashSpeed = 405 * sm * speedFactor * midgameEnemySpeedMult();
          const stepCap = isShard ? 28 : 24;
          const stepLen = Math.min(dashSpeed * spDt, stepCap);
          const nx = h.x + h.chaserDashDir.x * stepLen;
          const ny = h.y + h.chaserDashDir.y * stepLen;
          const test = { x: nx, y: ny, r: h.r };
          const resumeChase = () => {
            h.chaserDashPhase = "chase";
            h.chaserDashNextReady =
              h.shardsSyncDashReady != null ? h.shardsSyncDashReady : elapsed + rand(1.45, 2.05);
          };
          if (
            outOfBoundsCircle(test) ||
            collidesAnyObstacle(test) ||
            !!collidesValiantEnemyShockFieldDep?.(test, elapsed)
          ) {
            resumeChase();
          } else {
            h.x = nx;
            h.y = ny;
            h.chaserDashDist -= stepLen;
            if (h.chaserDashDist <= 0) resumeChase();
          }
          continue;
        }

        desired = vectorToTarget(h, target);
        const canDash = elapsed >= (h.chaserDashNextReady ?? 0);
        if (h.chaserDashPhase === "chase" && canDash && dist <= 168 && dist >= 36 && hasLineOfSight(h, target)) {
          h.chaserDashPhase = "windup";
          h.chaserDashWindupEnd = elapsed + 0.1;
          h.dir.x = toT.x;
          h.dir.y = toT.y;
          continue;
        }
      } else if (h.type === "frogChaser") {
        const target = pickTargetForHunter(h);
        const toT = vectorToTarget(h, target);
        const dist = Math.hypot(target.x - h.x, target.y - h.y);

        if (h.chaserDashPhase === "swampExplodeWindup") {
          if (elapsed >= (h.swampExplodeAt ?? 0)) triggerSwampFrogExplosion(h, elapsed);
          continue;
        }

        if (h.chaserDashPhase === "windup") {
          h.dir.x = toT.x;
          h.dir.y = toT.y;
          if (elapsed >= h.chaserDashWindupEnd) {
            h.chaserDashPhase = "dashing";
            h.chaserDashDir = { x: toT.x, y: toT.y };
            h.chaserDashDist = rand(85, 122);
          } else {
            continue;
          }
        }

        if (h.chaserDashPhase === "dashing") {
          const dashSpeed = 356 * sm * speedFactor * midgameEnemySpeedMult();
          const stepLen = Math.min(dashSpeed * spDt, 21);
          const nx = h.x + h.chaserDashDir.x * stepLen;
          const ny = h.y + h.chaserDashDir.y * stepLen;
          const test = { x: nx, y: ny, r: h.r };
          const landChase = () => {
            h.chaserDashPhase = "chase";
            h.chaserDashNextReady = elapsed + rand(0.72, 1.38);
          };
          const tryExplode = () => {
            const snap = Math.hypot(target.x - h.x, target.y - h.y);
            if (snap <= SWAMP_FROG_LAND_EXPLODE_DIST && hasLineOfSight({ x: h.x, y: h.y, r: h.r }, target)) {
              h.chaserDashPhase = "swampExplodeWindup";
              h.swampExplodeAt = elapsed + 0.07;
            } else landChase();
          };
          if (
            outOfBoundsCircle(test) ||
            collidesAnyObstacle(test) ||
            !!collidesValiantEnemyShockFieldDep?.(test, elapsed)
          ) {
            landChase();
          } else {
            h.x = nx;
            h.y = ny;
            h.chaserDashDist -= stepLen;
            if (h.chaserDashDist <= 0) tryExplode();
          }
          continue;
        }

        if (h.chaserDashPhase === "chase") {
          h.dir.x = toT.x;
          h.dir.y = toT.y;
          const canHop = elapsed >= (h.chaserDashNextReady ?? 0);
          if (canHop) {
            h.chaserDashPhase = "windup";
            h.chaserDashWindupEnd = elapsed + 0.14;
            h.dir.x = toT.x;
            h.dir.y = toT.y;
          }
          continue;
        }
        continue;
      } else {
        const target = pickTargetForHunter(h);
        desired = vectorToTarget(h, target);
      }
      const steer = avoidObstacles(h, desired);
      h.dir.x = h.dir.x * inertiaW + steer.x * steerW;
      h.dir.y = h.dir.y * inertiaW + steer.y * steerW;
      const dlen = Math.hypot(h.dir.x, h.dir.y) || 1;
      h.dir.x /= dlen;
      h.dir.y /= dlen;
      moveCircleWithCollisions(h, h.dir.x * speed, h.dir.y * speed, spDt, {
        blockValiantEnemyShockFields: true,
        ignoreObstacles: !!h.boneSwarmPhasing,
      });
    }
    for (const h of entities.hunters) {
      clampHunterOutsideSafehouseDisk(h);
    }
    for (let i = entities.hunters.length - 1; i >= 0; i--) {
      if (entities.hunters[i]._removeNow) entities.hunters.splice(i, 1);
    }
  }

  function updateRangedAttackers(dt) {
    if (suppressRangedAttacksNow) return;
    const elapsed = getSimElapsed();
    const player = getPlayer();
    for (const h of entities.hunters) {
      if (h.type !== "ranged") continue;
      if (elapsed - h.lastShotAt < h.shotInterval) continue;
      const target = pickTargetForHunter(h);
      if (getCharacterId() === "rogue" && target !== player) continue;
      h.lastShotAt = elapsed;

      const to = vectorToTarget(h, target);
      const speed = (h.shotSpeed || 360) * runLevelEnemySpeedMult() * midgameEnemySpeedMult();
      const firePath = getActivePathId() === "fire";
      if (firePath) {
        const dist = Math.hypot(target.x - h.x, target.y - h.y) || 1;
        entities.fireArcs.push({
          x: h.x,
          y: h.y,
          a: Math.atan2(to.y, to.x),
          halfA: Math.PI / 24, // +/- 7.5deg (15deg total arc angle).
          radius: 8,
          width: 20,
          speed: 380,
          maxRadius: Math.max(220, dist + 28),
          bornAt: elapsed,
          life: 0.96,
          nextHitAt: elapsed,
          fireApplyIgnite: true,
        });
      } else {
        entities.projectiles.push({
          x: h.x,
          y: h.y,
          vx: to.x * speed,
          vy: to.y * speed,
          r: 3,
          bornAt: elapsed,
          life: 1.25,
          damage: 1,
        });
      }
    }

    for (let i = entities.projectiles.length - 1; i >= 0; i--) {
      const p = entities.projectiles[i];
      const sp = spades13AuraEnemyDtMult();
      const prevX = p.x;
      const prevY = p.y;
      p.x += p.vx * dt * sp;
      p.y += p.vy * dt * sp;
      if (p.fireCone && p.rEnd != null) {
        const ageU = clamp((elapsed - p.bornAt) / Math.max(0.001, p.life), 0, 1);
        p.r = 4 + (p.rEnd - 4) * ageU;
      }
      let hitBarrier = false;
      const ignoreArenaBarriers =
        !!p.hallsKnightLandBolt || !!p.hallsQueenArcBolt || !!p.hallsKingSpiralBolt;
      for (let s = 0; s <= 5; s++) {
        const u = s / 5;
        const sx = prevX + (p.x - prevX) * u;
        const sy = prevY + (p.y - prevY) * u;
        if (!ignoreArenaBarriers && isWorldPointOnSurgeLockBarrierTile(sx, sy)) {
          hitBarrier = true;
          break;
        }
        if (!ignoreArenaBarriers && isWorldPointOnSafehouseBarrierDisk(sx, sy)) {
          hitBarrier = true;
          break;
        }
        if (!ignoreArenaBarriers && isWorldPointOnForgeRouletteBarrierTile(sx, sy)) {
          hitBarrier = true;
          break;
        }
        if (hitDecoyIfAny({ x: sx, y: sy }, p.r)) {
          hitBarrier = true;
          break;
        }
      }
      if (hitBarrier) {
        entities.projectiles.splice(i, 1);
        continue;
      }

      const circle = { x: p.x, y: p.y, r: p.r };
      const hitObstacle =
        !p.hallsQueenArcBolt && !p.hallsKingSpiralBolt && collidesAnyObstacle(circle);
      if (elapsed - p.bornAt > p.life || outOfBoundsCircle(circle) || hitObstacle) {
        entities.projectiles.splice(i, 1);
        continue;
      }

      if (hitDecoyIfAny(p, p.r)) {
        entities.projectiles.splice(i, 1);
        continue;
      }

      const rr = p.r + player.r;
      if (distSq(p, player) <= rr * rr) {
        damagePlayer(p.damage || 1, {
          sourceX: p.x,
          sourceY: p.y,
          ...(p.fireApplyIgnite ? { fireApplyIgnite: true } : {}),
        });
        entities.projectiles.splice(i, 1);
      }
    }
  }

  function updateSniperFireArcs(dt) {
    if (!entities.fireArcs.length) return;
    const elapsed = getSimElapsed();
    const player = getPlayer();
    for (let i = entities.fireArcs.length - 1; i >= 0; i--) {
      const arc = entities.fireArcs[i];
      if (elapsed - arc.bornAt > arc.life) {
        entities.fireArcs.splice(i, 1);
        continue;
      }
      arc.radius += arc.speed * dt * spades13AuraEnemyDtMult();
      if (arc.radius >= arc.maxRadius) {
        entities.fireArcs.splice(i, 1);
        continue;
      }
      const dx = player.x - arc.x;
      const dy = player.y - arc.y;
      const d = Math.hypot(dx, dy) || 1;
      const ang = Math.atan2(dy, dx);
      let delta = ang - arc.a;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      const radialOk = Math.abs(d - arc.radius) <= arc.width + player.r;
      const angularOk = Math.abs(delta) <= arc.halfA + 0.02;
      if (radialOk && angularOk && elapsed >= (arc.nextHitAt ?? 0)) {
        damagePlayer(1, {
          sourceX: arc.x + Math.cos(arc.a) * arc.radius,
          sourceY: arc.y + Math.sin(arc.a) * arc.radius,
          ...(arc.fireApplyIgnite ? { fireApplyIgnite: true } : {}),
        });
        arc.nextHitAt = elapsed + 0.22;
      }
    }
  }

  function updateSwampPools() {
    if (!entities.swampPools.length) return;
    const elapsed = getSimElapsed();
    const player = getPlayer();
    for (let i = entities.swampPools.length - 1; i >= 0; i--) {
      const p = entities.swampPools[i];
      if (elapsed >= p.expiresAt) {
        entities.swampPools.splice(i, 1);
        continue;
      }
      if (elapsed < (p.nextTickAt ?? Infinity)) continue;
      p.nextTickAt += p.tickInterval ?? 0.48;
      const rPool = p.frogMudPool ? p.r * frogMudPoolGrowScale(p.bornAt, elapsed) : p.r;
      const rr = rPool + player.r;
      if (distSq(p, player) <= rr * rr) {
        damagePlayer(0, {
          sourceX: p.x,
          sourceY: p.y,
          swampApplyInfection: true,
          swampInfectionOnly: true,
        });
      }
    }
  }

  /** While overlapping a frog mud pool (growing radius), movement uses {@link FROG_MUD_POOL_MOVE_MULT}. */
  function getFrogMudPoolMoveMult(px, py, pr, elapsed) {
    for (const p of entities.swampPools) {
      if (!p.frogMudPool) continue;
      if (elapsed >= p.expiresAt) continue;
      const rPool = p.r * frogMudPoolGrowScale(p.bornAt, elapsed);
      const rr = rPool + pr;
      if (distSq(p, { x: px, y: py }) <= rr * rr) return FROG_MUD_POOL_MOVE_MULT;
    }
    return 1;
  }

  function updateSwampBursts() {
    if (!entities.swampBursts.length) return;
    const elapsed = getSimElapsed();
    for (let i = entities.swampBursts.length - 1; i >= 0; i--) {
      const b = entities.swampBursts[i];
      if (elapsed - b.bornAt > b.life) entities.swampBursts.splice(i, 1);
    }
  }

  function updateHallsPawnImpacts() {
    if (!entities.hallsPawnImpacts.length) return;
    const elapsed = getSimElapsed();
    for (let i = entities.hallsPawnImpacts.length - 1; i >= 0; i--) {
      const b = entities.hallsPawnImpacts[i];
      if (elapsed - b.bornAt > b.life) entities.hallsPawnImpacts.splice(i, 1);
    }
  }

  function updateSpawners() {
    const elapsed = getSimElapsed();
    for (const h of entities.hunters) {
      if (h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner" || h.type === "depthsBoltSpawner")
        ejectSpawnerHunterFromSpecialHexFootprint(h);
    }
    for (const h of entities.hunters) {
      if (h.type !== "spawner" && h.type !== "airSpawner" && h.type !== "cryptSpawner" && h.type !== "depthsBoltSpawner")
        continue;
      if (h.type === "cryptSpawner" && h.cryptDisguised) continue;
      if (elapsed < h.spawnDelayUntil) continue;
      if (elapsed >= h.spawnActiveUntil) continue;
      if (elapsed < h.nextSwarmAt) continue;

      if (h.type === "depthsBoltSpawner") {
        const boltIv = Math.max(0.35, Number(h.swarmInterval) || DEPTHS_BOLT_SPAWN_INTERVAL_SEC);
        let safety = 0;
        while (elapsed >= h.nextSwarmAt && safety < 4) {
          h.nextSwarmAt += boltIv;
          safety++;
          const target = pickTargetForHunter(h);
          const to = vectorToTarget(h, target);
          const sx = h.x + to.x * (h.r + 12);
          const sy = h.y + to.y * (h.r + 12);
          const open = nearestLegalPointForSmallHunter(sx, sy, 9);
          spawnHunter("fast", open.x, open.y, {
            depthsBoltMinion: true,
            depthsBoltDir: { x: to.x, y: to.y },
            depthsBoltOx: open.x,
            depthsBoltOy: open.y,
          });
        }
        continue;
      }

      let safety = 0;
      while (elapsed >= h.nextSwarmAt && safety < 4) {
        h.nextSwarmAt += h.swarmInterval;
        safety++;

        const fastR = h.fastR || 10;
        const swarmN = h.swarmN || 5;
        for (let i = 0; i < swarmN; i++) {
          const open =
            h.type === "airSpawner"
              ? resolveFastSpawnNearAirSpawner(h, fastR)
              : randomOpenPointAround(h.x, h.y, h.r + 16, h.r + 34, fastR, 25, { excludeSpecialHex: true });
          spawnHunter("fast", open.x, open.y, { boneSwarmPhasing: h.type === "cryptSpawner" });
        }
      }
    }
  }

  /**
   * Same `fast` + `depthsBoltMinion` spawn as `depthsBoltSpawner` swarms (Depths L5 scripted beats).
   * @param {{ x: number; y: number; r?: number }} bloomLike
   * @param {{ x: number; y: number }} target
   */
  function spawnDepthsSwarmFastFromBloom(bloomLike, target) {
    const dx = target.x - bloomLike.x;
    const dy = target.y - bloomLike.y;
    const len = Math.hypot(dx, dy) || 1;
    const to = { x: dx / len, y: dy / len };
    const br = Number(bloomLike.r) || 40;
    const sx = bloomLike.x + to.x * (br + 12);
    const sy = bloomLike.y + to.y * (br + 12);
    const open = nearestLegalPointForSmallHunter(sx, sy, 9);
    spawnHunter("fast", open.x, open.y, {
      depthsBoltMinion: true,
      depthsBoltDir: { x: to.x, y: to.y },
      depthsBoltOx: open.x,
      depthsBoltOy: open.y,
      depthsBoltSpitSpeedMult: DEPTHS_SWARM_BLOOM_SPIT_SPEED_MULT,
    });
  }

  function hallsKingArenaActive() {
    return entities.hunters.some((h) => h?.type === HALLS_PIECE_IDS.KING && !!h?.hallsEventSpawn);
  }

  /** REFERENCE hearts J/Q/K front arc shield: repel nearby hostiles and clear projectiles in facing cone. */
  function applyFrontShieldArc() {
    const player = getPlayer();
    const arcDeg = Math.max(0, Number(player.frontShieldArcDeg ?? 0));
    if (arcDeg <= 0) return;
    const disablePushback = hallsKingArenaActive();

    const facingAngle = Math.atan2(player.facing?.y ?? 0, player.facing?.x ?? 1);
    const halfArc = (arcDeg * Math.PI) / 360;
    const shieldR = player.r + 30;

    for (const h of entities.hunters) {
      if (h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner" || h.type === "depthsBoltSpawner")
        continue;
      const dx = h.x - player.x;
      const dy = h.y - player.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > shieldR + h.r) continue;
      const ang = Math.atan2(dy, dx);
      let delta = ang - facingAngle;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      if (Math.abs(delta) > halfArc) continue;

      if (!disablePushback) {
        const away = vectorToTarget(player, h);
        const test = { x: h.x + away.x * 34, y: h.y + away.y * 34, r: h.r };
        if (!outOfBoundsCircle(test) && !collidesAnyObstacle(test)) {
          h.x = test.x;
          h.y = test.y;
        }
        h.dir.x = away.x;
        h.dir.y = away.y;
      }
    }

    for (let i = entities.projectiles.length - 1; i >= 0; i--) {
      const p = entities.projectiles[i];
      const dx = p.x - player.x;
      const dy = p.y - player.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > shieldR + p.r) continue;
      const ang = Math.atan2(dy, dx);
      let delta = ang - facingAngle;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      if (Math.abs(delta) > halfArc) continue;
      entities.projectiles.splice(i, 1);
    }
  }

  function updateLaserHazards() {
    const player = getPlayer();
    for (const beam of entities.laserBeams) {
      if (beam.warning || !beam.active) continue;
      const hitExtra = beam.hallsPawnGamma ? 12 : 5;
      const laserOpts =
        typeof beam.damageId === "number" ? { laserOneShotId: beam.damageId, damage: beam.hallsPawnGamma ? 2 : 1 } : { damage: 1 };
      if (!hitDecoyAlongSegment(beam.x1, beam.y1, beam.x2, beam.y2, hitExtra, laserOpts)) {
        const hitDist = pointToSegmentDistance(player.x, player.y, beam.x1, beam.y1, beam.x2, beam.y2);
        if (hitDist <= player.r + hitExtra) {
          damagePlayer(
            beam.hallsPawnGamma ? 3 : 2,
            beam.blueLaser
              ? {
                  laserBlueSlow: true,
                  sourceX: beam.x1,
                  sourceY: beam.y1,
                  swampDamageInstanceId: `laser-${beam.damageId ?? beam.bornAt ?? 0}`,
                }
              : {
                  sourceX: beam.x1,
                  sourceY: beam.y1,
                  swampDamageInstanceId: `laser-${beam.damageId ?? beam.bornAt ?? 0}`,
                },
          );
        }
      }
    }
  }

  function updateCollisions() {
    const elapsed = getSimElapsed();
    const player = getPlayer();
    for (const h of entities.hunters) {
      if (h.type === "depthsTentacle" || h.type === "depthsEldritchBloom") continue;
      if (elapsed < h.hitLockUntil) continue;
      const hitR = h.hallsKingLineProjectile ? Math.min(h.r, HALLS_KING_LINE_HIT_R) : h.r;
      if (hitDecoyIfAny(h, hitR + 2)) {
        h.hitLockUntil = elapsed + ENEMY_HIT_COOLDOWN_SEC;
        continue;
      }
      const rr = hitR + player.r;
      let hitPlayer = distSq(h, player) <= rr * rr;
      if (!hitPlayer && h.hallsKingLineProjectile) {
        const px = Number(h.hallsKingLinePrevX);
        const py = Number(h.hallsKingLinePrevY);
        if (Number.isFinite(px) && Number.isFinite(py)) {
          hitPlayer = pointToSegmentDistance(player.x, player.y, px, py, h.x, h.y) <= rr;
        }
      }
      if (hitPlayer) {
        damagePlayer(1, {
          sourceX: h.x,
          sourceY: h.y,
          ...(h.depthsEldritchBarrageBolt ? { eldritchBloodAttack: "eldritchBarrageBolt" } : {}),
          ...(h.depthsEldritchCageLunge ? { eldritchBloodAttack: "eldritchCageLunge" } : {}),
        });
        h.hitLockUntil = elapsed + ENEMY_HIT_COOLDOWN_SEC;
      }
      if (h.type === HALLS_PIECE_IDS.ROOK && elapsed >= Number(h.hallsRookAuraNextAt ?? 0)) {
        if (h.hallsKingLineProjectile) continue;
        h.hallsRookAuraNextAt = elapsed + HALLS_ROOK_AURA_TICK_SEC;
        const auraR = HALLS_ROOK_AURA_R + player.r;
        if (distSq(h, player) <= auraR * auraR) {
          damagePlayer(1, { sourceX: h.x, sourceY: h.y, hallsRookAura: true });
        }
      }
    }
  }

  function tickLaserBeamExpiry() {
    const elapsed = getSimElapsed();
    for (let i = entities.laserBeams.length - 1; i >= 0; i--) {
      const b = entities.laserBeams[i];
      if (b._orphanExpire || elapsed >= b.expiresAt) entities.laserBeams.splice(i, 1);
    }
  }

  function depthsBossSuppressNormalSpawns() {
    return !!(depthsPathActive() && getSuppressDepthsBossNormalSpawnsDep?.());
  }

  function tickSpawnWavesAndLifetime() {
    const elapsed = getSimElapsed();
    const bossNoSpawn = depthsBossSuppressNormalSpawns();
    const hallsNoPassiveSpawn = hallsPathActive();
    if (bossNoSpawn) {
      spawnState.spawnScheduled.length = 0;
      if (spawnState.nextSpawnAt < elapsed + 1e6) spawnState.nextSpawnAt = elapsed + 1e6;
    }
    if (hallsNoPassiveSpawn) {
      spawnState.spawnScheduled.length = 0;
      if (spawnState.nextSpawnAt < elapsed + 1e6) spawnState.nextSpawnAt = elapsed + 1e6;
    }
    if (!depthsPathActive()) {
      for (let i = entities.hunters.length - 1; i >= 0; i--) {
        const ht = entities.hunters[i].type;
        if (
          ht === "depthsTentacle" ||
          ht === "depthsEldritchBloom" ||
          ht === "depthsEldritchBarrageBolt" ||
          ht === "depthsEldritchCageLunge"
        )
          entities.hunters.splice(i, 1);
      }
    }
    while (spawnState.spawnScheduled.length && spawnState.spawnScheduled[0].at <= elapsed) {
      if (bossNoSpawn || hallsNoPassiveSpawn) spawnState.spawnScheduled.shift();
      else spawnState.spawnScheduled.shift()?.fn();
    }
    if (elapsed >= spawnState.nextSpawnAt && !bossNoSpawn && !hallsNoPassiveSpawn) advanceSpawnWave();

    if (bossNoSpawn && depthsPathActive()) {
      let hasEldritch = false;
      for (const h of entities.hunters) {
        if (h.type === "depthsEldritchBloom") {
          hasEldritch = true;
          break;
        }
      }
      if (!hasEldritch && !suppressDepthsBossBloomRespawn()) {
        const p = getPlayer();
        const er = hunterRadiusForType("depthsEldritchBloom");
        for (let attempt = 0; attempt < 56; attempt++) {
          const ang = Math.random() * Math.PI * 2;
          const d = rand(420, 760);
          const sx = p.x + Math.cos(ang) * d;
          const sy = p.y + Math.sin(ang) * d;
          if (forbiddenHexDep?.(sx, sy)) continue;
          const circ = { x: sx, y: sy, r: er };
          if (outOfBoundsCircle(circ) || collidesAnyObstacle(circ)) continue;
          spawnHunter("depthsEldritchBloom", sx, sy);
          break;
        }
      }
    }

    for (let i = entities.hunters.length - 1; i >= 0; i--) {
      const h = entities.hunters[i];
      if (elapsed >= h.dieAt) {
        if (h.type === "frogChaser") {
          triggerSwampFrogExplosion(h, elapsed);
          entities.hunters.splice(i, 1);
          continue;
        }
        if (h.type === "ghost") scheduleNextBoneGhostSpawn(elapsed, true);
        entities.hunters.splice(i, 1);
      }
    }
    if (!bonePathActive()) {
      for (let i = entities.hunters.length - 1; i >= 0; i--) {
        if (entities.hunters[i].type === "ghost") entities.hunters.splice(i, 1);
      }
      boneGhostNextSpawnAt = null;
      return;
    }
    let ghostAlive = false;
    for (const h of entities.hunters) {
      if (h.type === "ghost") {
        ghostAlive = true;
        break;
      }
    }
    if (!ghostAlive) {
      if (boneGhostNextSpawnAt == null) scheduleNextBoneGhostSpawn(elapsed, false);
      if (elapsed >= boneGhostNextSpawnAt) {
        const p = getPlayer();
        const spawn = randomOpenPointAround(p.x, p.y, 150, 280, hunterRadiusForType("ghost"), 64, {
          excludeSpecialHex: true,
        });
        spawnHunter("ghost", spawn.x, spawn.y);
        boneGhostNextSpawnAt = null;
      }
    }
  }

  function tick(dt, opts = {}) {
    suppressRangedAttacksNow = !!opts.suppressRangedAttacks;
    tickSpawnWavesAndLifetime();
    moveHunters(dt);
    applyFrontShieldArc();
    updateSnipers();
    updateHallsBishopHolyStrikes();
    updateRangedAttackers(dt);
    updateSniperFireArcs(dt);
    updateSwampPools();
    updateSwampBursts();
    updateHallsPawnImpacts();
    updateSpawners();
    updateLaserHazards();
    updateCollisions();
    tickLaserBeamExpiry();
  }

  function cleanupArenaNexusSiegeCombat() {
    entities.laserBeams = entities.laserBeams.filter((b) => !b.arenaHazard);
    entities.dangerZones = entities.dangerZones.filter((z) => !z.arenaHazard);
    for (let i = entities.hunters.length - 1; i >= 0; i--) {
      if (entities.hunters[i].arenaNexusSpawn) entities.hunters.splice(i, 1);
    }
  }

  function killHuntersStandingOnSurgeHex(q, r) {
    for (let i = entities.hunters.length - 1; i >= 0; i--) {
      const h = entities.hunters[i];
      const hq = worldToHex(h.x, h.y);
      if (hq.q !== q || hq.r !== r) continue;
      if (h.type === "depthsEldritchBloom") continue;
      if (h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner" || h.type === "depthsBoltSpawner") {
        ejectSpawnerHunterFromSpecialHexFootprint(h);
        continue;
      }
      entities.hunters.splice(i, 1);
    }
  }

  function ejectHuntersFromArenaNexusDuringSiege(cx, cy) {
    const edgeR = HEX_SIZE + 14;
    for (const h of entities.hunters) {
      if (h.arenaNexusSpawn) continue;
      const hq = worldToHex(h.x, h.y);
      if (!isArenaHexTile(hq.q, hq.r)) continue;
      const dx = h.x - cx;
      const dy = h.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      h.x = cx + (dx / len) * (edgeR + h.r);
      h.y = cy + (dy / len) * (edgeR + h.r);
    }
  }

  function clampArenaNexusDefendersOnRing(cx, cy) {
    for (const h of entities.hunters) {
      if (!h.arenaNexusSpawn) continue;
      const dx = h.x - cx;
      const dy = h.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      if (d < ARENA_NEXUS_RING_LO) {
        h.x = cx + (dx / d) * ARENA_NEXUS_RING_LO;
        h.y = cy + (dy / d) * ARENA_NEXUS_RING_LO;
      } else if (d > ARENA_NEXUS_RING_HI) {
        h.x = cx + (dx / d) * ARENA_NEXUS_RING_HI;
        h.y = cy + (dy / d) * ARENA_NEXUS_RING_HI;
      }
    }
  }

  function ejectHuntersFromSurgeLockHex(lockQ, lockR, surgePhase) {
    if (surgePhase !== 1 && surgePhase !== 2 && surgePhase !== 3) return;
    const { x: cx, y: cy } = hexToWorld(lockQ, lockR);
    const edgeR = HEX_SIZE + 14;
    for (const h of entities.hunters) {
      if (h.arenaNexusSpawn) continue;
      if (h.hallsEventSpawn) continue;
      const hq = worldToHex(h.x, h.y);
      if (hq.q !== lockQ || hq.r !== lockR) continue;
      const dx = h.x - cx;
      const dy = h.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      h.x = cx + (dx / len) * (edgeR + h.r);
      h.y = cy + (dy / len) * (edgeR + h.r);
    }
  }

  function reset() {
    entities.hunters.length = 0;
    entities.projectiles.length = 0;
    entities.laserBeams.length = 0;
    entities.dangerZones.length = 0;
    entities.bullets.length = 0;
    entities.fireArcs.length = 0;
    entities.swampPools.length = 0;
    entities.swampBursts.length = 0;
    entities.hallsPawnImpacts.length = 0;
    boneGhostNextSpawnAt = null;
    nextHunterUid = 0;
    spawnState.wave = 0;
    spawnState.spawnInterval = SPAWN_INTERVAL_START;
    spawnState.spawnScheduled.length = 0;
    spawnDifficultyAnchorSurvival = 0;
    const elapsed = getSimElapsed();
    spawnState.nextSpawnAt = elapsed + HUNTER_FIRST_WAVE_AT_SEC;
  }

  /** Depths boss (display L5): strip ambient hunters / shells / bolts before the chase. */
  function clearHunterSwarmEntities() {
    entities.hunters.length = 0;
    entities.dangerZones.length = 0;
    entities.bullets.length = 0;
    entities.fireArcs.length = 0;
    entities.projectiles.length = 0;
    entities.laserBeams.length = 0;
    entities.swampPools.length = 0;
    entities.swampBursts.length = 0;
    entities.hallsPawnImpacts.length = 0;
  }

  /** REFERENCE `applySafehouseLevelUp` spawn pacing reset. */
  function softResetSpawnPacingAfterSafehouseLevel(anchorEffectiveSurvivalSec) {
    spawnDifficultyAnchorSurvival = Math.max(0, anchorEffectiveSurvivalSec);
    spawnState.spawnScheduled.length = 0;
    spawnState.spawnInterval = getSpawnIntervalFromRunTime();
    const elapsed = getSimElapsed();
    spawnState.nextSpawnAt = elapsed + spawnState.spawnInterval;
  }

  function draw(ctx) {
    const now = getSimElapsed();
    for (const beam of entities.laserBeams) {
      drawLaserBeamFancy(ctx, beam, now);
    }
    drawSpawnerChargeClocks(ctx, entities.hunters, now);
    const colourblind = getSwampBootlegColourblind();
    const depthsPath = depthsPathActive();
    for (const h of entities.hunters) {
      drawHunterBody(ctx, h, { colourblind, simElapsed: now, depthsPath });
    }
    drawHunterLifeBars(ctx, entities.hunters, now);
    drawDangerZones(ctx, entities.dangerZones, now, SNIPER_ARTILLERY_BANG_DURATION);
    drawSwampPools(ctx, entities.swampPools, now);
    drawSwampBlastBursts(ctx, entities.swampBursts, now);
    drawHallsPawnImpactBursts(ctx, entities.hallsPawnImpacts, now);
    drawSniperBullets(ctx, entities.bullets, now);
    drawSniperFireArcs(ctx, entities.fireArcs, now);
    for (const p of entities.projectiles) {
      drawProjectileBody(ctx, p);
    }
  }

  function hasEnemyLineOfSightToPlayer(hunter) {
    return hasLineOfSight(hunter, getPlayer());
  }

  /** Bulwark W: radial knockback (Earthquake-style displacement on hunters in radius). */
  function bulwarkParryPushHunters(px, py, radius, pushDist) {
    for (const h of entities.hunters) {
      if (h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner" || h.type === "depthsTentacle")
        continue;
      const dx = h.x - px;
      const dy = h.y - py;
      const d = Math.hypot(dx, dy) || 1;
      if (d > radius) continue;
      const nx = dx / d;
      const ny = dy / d;
      h.x += nx * pushDist;
      h.y += ny * pushDist;
      h.dir = { x: nx, y: ny };
      const c = { x: h.x, y: h.y, r: h.r };
      if (collidesAnyObstacle(c)) {
        h.x -= nx * pushDist * 0.5;
        h.y -= ny * pushDist * 0.5;
      }
    }
  }

  /**
   * Bulwark Q: shove hunters with the charge segment; optional `pushedOut` collects shoved hunters for terrain-end stun.
   * @param {Set<object> | null} [pushedOut]
   */
  function bulwarkChargePushHunters(prevX, prevY, nextX, nextY, playerR, elapsed, pushedOut = null) {
    const dx = nextX - prevX;
    const dy = nextY - prevY;
    if (Math.abs(dx) < 1e-4 && Math.abs(dy) < 1e-4) return;
    for (const h of entities.hunters) {
      if (h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner" || h.type === "depthsTentacle")
        continue;
      const dist = pointToSegmentDistance(h.x, h.y, prevX, prevY, nextX, nextY);
      if (dist > playerR + h.r + BULWARK_CHARGE_PUSH_CORRIDOR_MARGIN) continue;
      h.x += dx;
      h.y += dy;
      pushedOut?.add(h);
      const c = { x: h.x, y: h.y, r: h.r };
      if (collidesAnyObstacle(c) || outOfBoundsCircle(c)) {
        h.x -= dx * 0.4;
        h.y -= dy * 0.4;
        h.stunnedUntil = Math.max(h.stunnedUntil || 0, elapsed + BULWARK_CHARGE_WALL_STUN_SEC);
      }
    }
  }

  /** Stun everyone Bulwark shoved during a charge when that charge ends on terrain. */
  function bulwarkChargeApplyTerrainGroupStun(pushedSet, elapsed) {
    if (!pushedSet || pushedSet.size === 0) return;
    const until = elapsed + BULWARK_CHARGE_TERRAIN_GROUP_STUN_SEC;
    for (const h of pushedSet) {
      if (!h || h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner" || h.type === "depthsTentacle")
        continue;
      h.stunnedUntil = Math.max(h.stunnedUntil || 0, until);
    }
  }

  return {
    entities,
    spawnState,
    getDangerRamp01,
    hasEnemyLineOfSightToPlayer,
    tick,
    draw,
    reset,
    softResetSpawnPacingAfterSafehouseLevel,
    spawnHunter,
    spawnDepthsSwarmFastFromBloom,
    hunterRadiusForType,
    cleanupArenaNexusSiegeCombat,
    killHuntersStandingOnSurgeHex,
    ejectHuntersFromArenaNexusDuringSiege,
    clampArenaNexusDefendersOnRing,
    ejectHuntersFromSurgeLockHex,
    bulwarkChargePushHunters,
    bulwarkChargeApplyTerrainGroupStun,
    bulwarkParryPushHunters,
    getFrogMudPoolMoveMult,
    clearHunterSwarmEntities,
  };
}
