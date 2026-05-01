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
  drawSpawnerChargeClocks,
  drawHunterLifeBars,
  frogMudPoolGrowScale,
  FROG_SPLASH_GROW_SEC,
} from "./hunterDraw.js";

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
    const t = getDangerRamp01();
    return SPAWN_INTERVAL_START + (SPAWN_INTERVAL_FLOOR - SPAWN_INTERVAL_START) * t;
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

    if (elapsed < getPlayerUntargetableUntil()) {
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
    if (getCharacterId() === "rogue" && pickRogueHunterTarget) {
      return pickRogueHunterTarget(hunter, player, inv, nearestDecoy, hasLineOfSight, fallback, elapsed);
    }

    if (elapsed < (inv.clubsInvisUntil ?? 0)) {
      return nearestDecoy(hunter) || fallback;
    }
    if (getCharacterId() === "rogue" && elapsed < (inv.spadesLandingStealthUntil ?? 0)) {
      return nearestDecoy(hunter) || fallback;
    }

    const target = player;
    if (!getDecoys().length) return target;
    if (hunter.type === "chaser" || hunter.type === "frogChaser" || hunter.type === "fast") {
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
      if (h.type === "spawner" || h.type === "airSpawner" || (h.type === "cryptSpawner" && h.cryptDisguised))
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
    if (type === "spawner" || type === "cryptSpawner") return 18;
    if (type === "airSpawner") return 26;
    if (type === "laser" || type === "laserBlue") return 13;
    if (type === "fast") return 9;
    if (type === "frogChaser") return 11;
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
    }
    h.r = r;
    h.life = life;
    h.dieAt = elapsed + life;
    h.lastShotAt = lastShotAt;
    if (opts?.arenaNexusSpawn) {
      h.arenaNexusSpawn = true;
      h.dieAt = Math.max(h.dieAt, elapsed + ARENA_NEXUS_SIEGE_SEC + 2.5);
    }

    const relocateIfForbidden = () => {
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
      h.x = customX;
      h.y = customY;
      if (type === "spawner" || type === "airSpawner" || type === "cryptSpawner") {
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
      entities.hunters.push(h);
      return;
    }

    if (type === "spawner" || type === "airSpawner" || type === "cryptSpawner") {
      for (let attempt = 0; attempt < 64; attempt++) {
        const ang2 = Math.random() * Math.PI * 2;
        const d2 = rand(320, 760);
        h.x = player.x + Math.cos(ang2) * d2;
        h.y = player.y + Math.sin(ang2) * d2;
        if (isWorldPointOnSpecialSpawnerForbiddenHex(h.x, h.y)) continue;
        const circ = { x: h.x, y: h.y, r: h.r };
        if (collidesAnyObstacle(circ)) continue;
        entities.hunters.push(h);
        return;
      }
    }

    const ang = Math.random() * Math.PI * 2;
    const d = rand(320, 760);
    h.x = player.x + Math.cos(ang) * d;
    h.y = player.y + Math.sin(ang) * d;
    if (type === "spawner" || type === "airSpawner" || type === "cryptSpawner")
      ejectSpawnerHunterFromSpecialHexFootprint(h);
    relocateIfForbidden();
    entities.hunters.push(h);
  }

  function scheduleWaveSpawns() {
    const jobs = [];
    const nJobs = BASE_WAVE_SPAWN_JOBS + midgameEscalationTicks();
    const player = getPlayer();
    for (let i = 0; i < nJobs; i++) {
      jobs.push(() => {
        const type = pickWaveHunterType();
        const ang = Math.random() * Math.PI * 2;
        const d = rand(300, 780);
        const x = player.x + Math.cos(ang) * d;
        const y = player.y + Math.sin(ang) * d;
        spawnHunter(type, x, y);
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
      const windup = SNIPER_ARTILLERY_WINDUP;
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
      const firePath = getActivePathId() === "fire";
      const zoneR = firePath ? 54 : 28;
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
      });
      const dist = Math.hypot(aimX - h.x, aimY - h.y) || 1;
      entities.bullets.push({
        x: h.x,
        y: h.y,
        tx: aimX,
        ty: aimY,
        bornAt: elapsed,
        life: clamp(0.14 + dist / 2200, 0.16, 0.32),
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
      if (elapsed < (h.stunnedUntil || 0)) continue;
      const spDt = dt * spades13AuraEnemyDtMult();

      if (h.type === "airSpawner") {
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

      const lifeSpan = h.life || Math.max(0.0001, h.dieAt - h.bornAt);
      const age = clamp((elapsed - h.bornAt) / lifeSpan, 0, 1);
      const speedFactor = 1 + age * HUNTER_SPEED_AGE_COEFF;
      const baseSpeed =
        h.type === "sniper"
          ? 100
          : h.type === "cutter"
            ? 116
            : h.type === "laser" || h.type === "laserBlue"
              ? h.type === "laserBlue"
                ? 156
                : 138
            : h.type === "ranged"
              ? 85
              : h.type === "fast"
                ? 150
                : 110;
      const sm = runLevelEnemySpeedMult();
      const steerW = Math.min(0.42, 0.26 * runLevelEnemyAccelMult());
      const inertiaW = 1 - steerW;
      let speed = baseSpeed * sm * speedFactor * midgameEnemySpeedMult() * boneEnemySpeedMult();

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
      } else if (h.type === "laser" || h.type === "laserBlue") {
        const isBlue = h.type === "laserBlue";
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
              ...(bone && !isBlue ? { boneGhostBeam: true } : {}),
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
            ...(boneW && !isBlue ? { boneGhostBeam: true } : {}),
            ...(boneW && isBlue ? { boneGhostBlueBeam: true } : {}),
          });
          continue;
        }

        const d2 = distSq(h, target);
        const away = vectorToTarget(target, h);
        const toward = vectorToTarget(h, target);
        desired = d2 < 200 * 200 ? away : toward;
      } else if (h.type === "chaser") {
        const target = pickTargetForHunter(h);
        const toT = vectorToTarget(h, target);
        const dist = Math.hypot(target.x - h.x, target.y - h.y);

        if (h.chaserDashPhase === "windup") {
          h.dir.x = toT.x;
          h.dir.y = toT.y;
          if (elapsed >= h.chaserDashWindupEnd) {
            h.chaserDashPhase = "dashing";
            h.chaserDashDir = { x: toT.x, y: toT.y };
            h.chaserDashDist = 124;
          } else {
            continue;
          }
        }

        if (h.chaserDashPhase === "dashing") {
          const dashSpeed = 405 * sm * speedFactor * midgameEnemySpeedMult();
          const stepLen = Math.min(dashSpeed * spDt, 24);
          const nx = h.x + h.chaserDashDir.x * stepLen;
          const ny = h.y + h.chaserDashDir.y * stepLen;
          const test = { x: nx, y: ny, r: h.r };
          if (
            outOfBoundsCircle(test) ||
            collidesAnyObstacle(test) ||
            !!collidesValiantEnemyShockFieldDep?.(test, elapsed)
          ) {
            h.chaserDashPhase = "chase";
            h.chaserDashNextReady = elapsed + rand(1.45, 2.05);
          } else {
            h.x = nx;
            h.y = ny;
            h.chaserDashDist -= stepLen;
            if (h.chaserDashDist <= 0) {
              h.chaserDashPhase = "chase";
              h.chaserDashNextReady = elapsed + rand(1.45, 2.05);
            }
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
      for (let s = 0; s <= 5; s++) {
        const u = s / 5;
        const sx = prevX + (p.x - prevX) * u;
        const sy = prevY + (p.y - prevY) * u;
        if (isWorldPointOnSurgeLockBarrierTile(sx, sy)) {
          hitBarrier = true;
          break;
        }
        if (isWorldPointOnSafehouseBarrierDisk(sx, sy)) {
          hitBarrier = true;
          break;
        }
        if (isWorldPointOnForgeRouletteBarrierTile(sx, sy)) {
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
      if (elapsed - p.bornAt > p.life || outOfBoundsCircle(circle) || collidesAnyObstacle(circle)) {
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

  function updateSpawners() {
    const elapsed = getSimElapsed();
    for (const h of entities.hunters) {
      if (h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner")
        ejectSpawnerHunterFromSpecialHexFootprint(h);
    }
    for (const h of entities.hunters) {
      if (h.type !== "spawner" && h.type !== "airSpawner" && h.type !== "cryptSpawner") continue;
      if (h.type === "cryptSpawner" && h.cryptDisguised) continue;
      if (elapsed < h.spawnDelayUntil) continue;
      if (elapsed >= h.spawnActiveUntil) continue;
      if (elapsed < h.nextSwarmAt) continue;

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

  /** REFERENCE hearts J/Q/K front arc shield: repel nearby hostiles and clear projectiles in facing cone. */
  function applyFrontShieldArc() {
    const player = getPlayer();
    const arcDeg = Math.max(0, Number(player.frontShieldArcDeg ?? 0));
    if (arcDeg <= 0) return;

    const facingAngle = Math.atan2(player.facing?.y ?? 0, player.facing?.x ?? 1);
    const halfArc = (arcDeg * Math.PI) / 360;
    const shieldR = player.r + 30;

    for (const h of entities.hunters) {
      if (h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner") continue;
      const dx = h.x - player.x;
      const dy = h.y - player.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > shieldR + h.r) continue;
      const ang = Math.atan2(dy, dx);
      let delta = ang - facingAngle;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      if (Math.abs(delta) > halfArc) continue;

      const away = vectorToTarget(player, h);
      const test = { x: h.x + away.x * 34, y: h.y + away.y * 34, r: h.r };
      if (!outOfBoundsCircle(test) && !collidesAnyObstacle(test)) {
        h.x = test.x;
        h.y = test.y;
      }
      h.dir.x = away.x;
      h.dir.y = away.y;
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
      const laserOpts =
        typeof beam.damageId === "number" ? { laserOneShotId: beam.damageId, damage: 1 } : { damage: 1 };
      if (!hitDecoyAlongSegment(beam.x1, beam.y1, beam.x2, beam.y2, 5, laserOpts)) {
        const hitDist = pointToSegmentDistance(player.x, player.y, beam.x1, beam.y1, beam.x2, beam.y2);
        if (hitDist <= player.r + 5) {
          damagePlayer(
            2,
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
      if (elapsed < h.hitLockUntil) continue;
      if (hitDecoyIfAny(h, h.r + 2)) {
        h.hitLockUntil = elapsed + ENEMY_HIT_COOLDOWN_SEC;
        continue;
      }
      const rr = h.r + player.r;
      if (distSq(h, player) <= rr * rr) {
        damagePlayer(1, { sourceX: h.x, sourceY: h.y });
        h.hitLockUntil = elapsed + ENEMY_HIT_COOLDOWN_SEC;
      }
    }
  }

  function tickLaserBeamExpiry() {
    const elapsed = getSimElapsed();
    for (let i = entities.laserBeams.length - 1; i >= 0; i--) {
      if (elapsed >= entities.laserBeams[i].expiresAt) entities.laserBeams.splice(i, 1);
    }
  }

  function tickSpawnWavesAndLifetime() {
    const elapsed = getSimElapsed();
    while (spawnState.spawnScheduled.length && spawnState.spawnScheduled[0].at <= elapsed) {
      spawnState.spawnScheduled.shift()?.fn();
    }
    if (elapsed >= spawnState.nextSpawnAt) advanceSpawnWave();

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
    updateRangedAttackers(dt);
    updateSniperFireArcs(dt);
    updateSwampPools();
    updateSwampBursts();
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
      if (h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner") {
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
    boneGhostNextSpawnAt = null;
    spawnState.wave = 0;
    spawnState.spawnInterval = SPAWN_INTERVAL_START;
    spawnState.spawnScheduled.length = 0;
    spawnDifficultyAnchorSurvival = 0;
    const elapsed = getSimElapsed();
    spawnState.nextSpawnAt = elapsed + HUNTER_FIRST_WAVE_AT_SEC;
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
    for (const h of entities.hunters) {
      drawHunterBody(ctx, h, { colourblind });
    }
    drawHunterLifeBars(ctx, entities.hunters, now);
    drawDangerZones(ctx, entities.dangerZones, now, SNIPER_ARTILLERY_BANG_DURATION);
    drawSwampPools(ctx, entities.swampPools, now);
    drawSwampBlastBursts(ctx, entities.swampBursts, now);
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
      if (h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner") continue;
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
      if (h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner") continue;
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
      if (!h || h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner") continue;
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
  };
}
