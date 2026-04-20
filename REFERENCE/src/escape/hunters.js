export function createHuntersManager({
  constants,
  relDifficultySurvivalSec,
  state,
  player,
  entities,
  rand,
  clamp,
  ejectSpawnerHunterFromSpecialHexFootprint,
  isWorldPointOnSpecialSpawnerForbiddenHex,
  collidesAnyObstacle,
  midgameEscalationTicks,
  getSpawnIntervalFromRunTime,
  pickTargetForHunterImpl,
  avoidObstaclesImpl,
  moveHuntersImpl,
  updateRangedAttackersImpl,
  updateSpawnersImpl,
  anyOtherEnemyHasLineOfSightToPlayerImpl,
  updateRogueLineOfSightStateImpl,
}) {
  const {
    TAU,
    LATE_GAME_ELITE_SPAWN_SEC,
    LASER_BLUE_COOLDOWN_SEC,
    LASER_BLUE_WARN_SEC,
    ARENA_NEXUS_SIEGE_SEC,
    BASE_WAVE_SPAWN_JOBS,
  } = constants;

  function hunterPalette(type) {
    switch (type) {
      case "chaser":
        return { light: "#fecaca", core: "#dc2626", shadow: "#7f1d1d", rim: "#fca5a5", mark: "#fff1f2" };
      case "cutter":
        return { light: "#fde68a", core: "#d97706", shadow: "#78350f", rim: "#fcd34d", mark: "#fffbeb" };
      case "sniper":
        return { light: "#fbcfe8", core: "#db2777", shadow: "#831843", rim: "#f9a8d4", mark: "#fdf2f8" };
      case "laser":
        return { light: "#fecaca", core: "#ef4444", shadow: "#7f1d1d", rim: "#f87171", mark: "#fef2f2" };
      case "laserBlue":
        return { light: "#bfdbfe", core: "#2563eb", shadow: "#1e3a8a", rim: "#60a5fa", mark: "#eff6ff" };
      case "spawner":
        return { light: "#fecdd3", core: "#e11d48", shadow: "#881337", rim: "#fb7185", mark: "#fff1f2" };
      case "airSpawner":
        return { light: "#ddd6fe", core: "#7c3aed", shadow: "#4c1d95", rim: "#a78bfa", mark: "#f5f3ff" };
      case "ranged":
        return { light: "#bae6fd", core: "#0284c7", shadow: "#0c4a6e", rim: "#38bdf8", mark: "#f0f9ff" };
      case "fast":
        return { light: "#fed7aa", core: "#ea580c", shadow: "#7c2d12", rim: "#fb923c", mark: "#fff7ed" };
      default:
        return { light: "#ddd6fe", core: "#7c3aed", shadow: "#3b0764", rim: "#c4b5fd", mark: "#f5f3ff" };
    }
  }

  function drawHunterBody(ctx, h) {
    const pal = hunterPalette(h.type);
    const { x, y, r } = h;
    const g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.08, x, y, r);
    g.addColorStop(0, pal.light);
    g.addColorStop(0.55, pal.core);
    g.addColorStop(1, pal.shadow);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = pal.rim;
    ctx.lineWidth = 2;
    ctx.stroke();
    const mx = h.dir.x * r * 0.38;
    const my = h.dir.y * r * 0.38;
    ctx.fillStyle = pal.mark;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(x + mx, y + my, r * 0.22, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function pickRegularHunterType() {
    if (relDifficultySurvivalSec() >= LATE_GAME_ELITE_SPAWN_SEC) {
      const er = Math.random();
      if (er < 0.055) return "airSpawner";
      if (er < 0.11) return "laserBlue";
    }
    const roll = Math.random();
    if (roll < 0.25) return "chaser";
    if (roll < 0.44) return "cutter";
    if (roll < 0.61) return "sniper";
    if (roll < 0.78) return "ranged";
    if (roll < 0.93) return "laser";
    return "spawner";
  }

  function hunterRadiusForType(type) {
    if (type === "sniper") return 12;
    if (type === "spawner") return 18;
    if (type === "airSpawner") return 26;
    if (type === "laser" || type === "laserBlue") return 13;
    if (type === "fast") return 9;
    return 10;
  }

  function spawnHunter(type, customX, customY, opts) {
    let r = 10;
    let life = 8;
    let lastShotAt = state.elapsed + rand(0.3, 1.1);
    const h = {
      type,
      x: 0,
      y: 0,
      r: 10,
      bornAt: state.elapsed,
      dieAt: state.elapsed + life,
      lastShotAt: 0,
      dir: { x: 1, y: 0 },
      hitLockUntil: 0,
    };

    if (type === "sniper") {
      r = 12;
      life = 8;
      lastShotAt = state.elapsed + rand(0.6, 1.2);
    } else if (type === "chaser") {
      r = 10;
      life = 8;
      lastShotAt = state.elapsed + rand(0.3, 1.1);
      h.chaserDashPhase = "chase";
      h.chaserDashNextReady = state.elapsed + rand(0.35, 1.0);
    } else if (type === "cutter") {
      r = 10;
      life = 8;
      lastShotAt = state.elapsed + rand(0.3, 1.1);
    } else if (type === "ranged") {
      r = 10;
      life = 8;
      lastShotAt = state.elapsed + rand(0.4, 1.0);
      h.shotInterval = 1.35;
      h.shotSpeed = 360;
    } else if (type === "laser") {
      r = 13;
      life = 8;
      lastShotAt = state.elapsed + rand(0.6, 1.2);
      h.laserState = "move";
      h.aimStartedAt = 0;
      h.nextLaserReadyAt = state.elapsed + rand(0.7, 1.4);
      h.laserCooldown = 1.0;
      h.laserWarning = 0.42;
      h.laserAim = null;
    } else if (type === "laserBlue") {
      r = 13;
      life = 8;
      lastShotAt = state.elapsed + rand(0.5, 1.0);
      h.laserState = "move";
      h.aimStartedAt = 0;
      h.nextLaserReadyAt = state.elapsed + rand(0.55, 1.1);
      h.laserCooldown = LASER_BLUE_COOLDOWN_SEC;
      h.laserWarning = LASER_BLUE_WARN_SEC;
      h.laserAim = null;
    } else if (type === "fast") {
      r = 9;
      life = 2;
      lastShotAt = state.elapsed + 999;
    } else if (type === "spawner") {
      r = 18;
      life = 8;
      lastShotAt = state.elapsed + 999;
      h.spawnDelayUntil = state.elapsed + 2;
      h.spawnActiveUntil = state.elapsed + 8;
      h.nextSwarmAt = h.spawnDelayUntil;
      h.swarmInterval = 0.6;
      h.swarmN = 5;
      h.fastR = 10;
    } else if (type === "airSpawner") {
      r = 26;
      life = 9;
      lastShotAt = state.elapsed + 999;
      h.spawnDelayUntil = state.elapsed;
      h.spawnActiveUntil = state.elapsed + 9;
      h.nextSwarmAt = state.elapsed;
      h.swarmInterval = 0.62;
      h.swarmN = 5;
      h.fastR = 10;
    }
    h.r = r;
    h.life = life;
    h.dieAt = state.elapsed + life;
    h.lastShotAt = lastShotAt;
    if (opts?.arenaNexusSpawn) {
      h.arenaNexusSpawn = true;
      h.dieAt = Math.max(h.dieAt, state.elapsed + ARENA_NEXUS_SIEGE_SEC + 2.5);
    }

    if (customX != null && customY != null) {
      h.x = customX;
      h.y = customY;
      if (type === "spawner" || type === "airSpawner") {
        for (let attempt = 0; attempt < 56; attempt++) {
          ejectSpawnerHunterFromSpecialHexFootprint(h);
          const circ = { x: h.x, y: h.y, r: h.r };
          if (!isWorldPointOnSpecialSpawnerForbiddenHex(h.x, h.y) && !collidesAnyObstacle(circ)) break;
          const a = Math.random() * TAU;
          const dist = rand(300, 780);
          h.x = player.x + Math.cos(a) * dist;
          h.y = player.y + Math.sin(a) * dist;
        }
      }
      entities.hunters.push(h);
      return;
    }

    if (type === "spawner" || type === "airSpawner") {
      for (let attempt = 0; attempt < 64; attempt++) {
        const ang2 = Math.random() * TAU;
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

    const ang = Math.random() * TAU;
    const d = rand(320, 760);
    h.x = player.x + Math.cos(ang) * d;
    h.y = player.y + Math.sin(ang) * d;
    if (type === "spawner" || type === "airSpawner") ejectSpawnerHunterFromSpecialHexFootprint(h);
    entities.hunters.push(h);
  }

  function scheduleWaveSpawns() {
    const jobs = [];
    const nJobs = BASE_WAVE_SPAWN_JOBS + midgameEscalationTicks();
    for (let i = 0; i < nJobs; i++) {
      jobs.push(() => {
        const type = pickRegularHunterType();
        hunterRadiusForType(type);
        const ang = Math.random() * TAU;
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
    const spread = state.spawnInterval * 0.88;
    const t0 = state.elapsed;
    const n = jobs.length;
    const slot = spread / n;
    for (let i = 0; i < n; i++) {
      const jitter = (Math.random() - 0.5) * slot * 0.5;
      const at = clamp(t0 + (i + 0.5) * slot + jitter, t0 + 0.04, t0 + spread);
      state.spawnScheduled.push({ at, fn: jobs[i] });
    }
    state.spawnScheduled.sort((a, b) => a.at - b.at);
  }

  function advanceSpawnWave() {
    state.wave += 1;
    state.spawnInterval = getSpawnIntervalFromRunTime();
    state.nextSpawnAt = state.elapsed + state.spawnInterval;
    scheduleWaveSpawns();
  }

  return {
    hunterPalette,
    drawHunterBody,
    spawnHunter,
    pickRegularHunterType,
    hunterRadiusForType,
    scheduleWaveSpawns,
    advanceSpawnWave,
    pickTargetForHunter: pickTargetForHunterImpl,
    avoidObstacles: avoidObstaclesImpl,
    moveHunters: moveHuntersImpl,
    updateRangedAttackers: updateRangedAttackersImpl,
    updateSpawners: updateSpawnersImpl,
    anyOtherEnemyHasLineOfSightToPlayer: anyOtherEnemyHasLineOfSightToPlayerImpl,
    updateRogueLineOfSightState: updateRogueLineOfSightStateImpl,
  };
}
