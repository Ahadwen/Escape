export function createPlayerControlsManager({
  state,
  getAbilities,
  selectedCharacterId,
  isLunatic,
  runLevelUpCinematicMs,
  tryLunaticWToggle,
  tryLunaticRoar,
  startRogueDashAim,
  tryDash,
  tryBurst,
  tryDecoy,
  useRandomAbility,
  closeRouletteForgeUi,
  closeSafehouseLevelModal,
  closeForgeModalUi,
  continueAfterLoadout,
  releaseRogueDashAim,
  getGameStarted,
  setGameStarted,
  resetGame,
  afterDeathRetry,
  runLog,
  logCodes,
  controlsHintEl,
  player,
  dashState,
  valiantBoxChargeState,
  inventory,
  entities,
  deckSuitCounts,
  setBonusThreshold,
  setBonusMax,
  runLevelUpCinematic,
  effectiveAbilityCooldown,
  knightDiamondBurstEmpowerActive,
  spawnAttackRing,
  computeNow = () => performance.now(),
  clampPlayerToArenaNexusInnerHex,
  clampPlayerToSurgeLockHex,
  forEachDeckCard,
  computeDashTarget,
  rogueStealthOpenGrace,
  tryValiantRescueRabbit,
  placeValiantShockField,
  countSuitsInActiveSlots,
  constants,
  spawnUltimateEffect,
  triggerUltScreenShake,
  distSq,
  vectorToTarget,
  outOfBoundsCircle,
  collidesAnyObstacle,
  damagePlayer,
  isValiant,
  moveCircleWithCollisions,
  playerSpeedHealthMultiplier,
  spawnLunaticSprintTierSpeedFx,
  intersectsRectCircle,
  getObstacles,
  worldToHex,
  hexToWorld,
  arenaNexusWorldCenter,
  arenaNexusSiegeInnerMaxCenterDistPx,
  surgeOuterWaitingMaxCenterDistPx,
  surgeLockTileMaxCenterDistPx,
  diamondsOmniEmpowerActive,
  deathSnapshotsEnabled,
  runClockEffectiveSec,
  spawnHealPopup,
  spawnValiantRescueFx,
  spawnValiantRabbitDeathFx,
  passive,
  randomOpenPoint,
  clampFn,
  randFn,
}) {
  const {
    KNIGHT_DIAMOND_BURST_DURATION_BONUS_SEC,
    SET_BONUS_SUIT_THRESHOLD,
    ULT_BURST_WAVE_SPAN_SEC,
    ULT_BURST_WAVE_COUNT,
    ULT_BURST_RADIUS,
    ULT_ORBIT_SHIELD_RADIUS_EXTRA,
    ULT_ORBIT_SHIELD_STAGGER_SEC,
    ULTIMATE_ABILITY_COOLDOWN_SEC,
    KNIGHT_SPADES_WORLD_SLOW_SEC,
    TAU,
    LUNATIC_W_TOGGLE_COOLDOWN_SEC,
    LUNATIC_DECEL_SPRINT_REF_SEC,
    LUNATIC_DECEL_SEC,
    LUNATIC_STUMBLE_MOVE_MULT,
    LUNATIC_SPRINT_MOMENTUM_RAMP_SEC,
    LUNATIC_SPRINT_PEAK_SPEED_MULT,
    LUNATIC_ROAR_SPEED_MULT,
    LUNATIC_CRASH_DAMAGE_BRACKET_1_SEC,
    LUNATIC_CRASH_DAMAGE_BRACKET_2_SEC,
    LUNATIC_CRASH_DAMAGE_TIER_1,
    LUNATIC_CRASH_DAMAGE_TIER_2,
    LUNATIC_CRASH_DAMAGE_TIER_3,
    LUNATIC_CRASH_STUN_SEC,
    LUNATIC_SPRINT_TIER_FX_DUR_T2,
    LUNATIC_SPRINT_TIER_FX_DUR_T4,
    LUNATIC_STEER_MAX_RAD_PER_SEC,
    LUNATIC_TURN_RADIUS_PX,
    LASER_BLUE_PLAYER_SLOW_MULT,
    LASER_BLUE_PLAYER_SLOW_SEC,
    LUNATIC_ROAR_TERRAIN_DAMAGE_INTERVAL_SEC,
    LUNATIC_ROAR_TERRAIN_DAMAGE,
    VALIANT_DIAMOND_BOX_SCALE,
    VALIANT_WILL_RABBIT_DEATH_COST,
    VALIANT_WILL_DECAY_PER_EMPTY_SLOT,
    VALIANT_WILL_REGEN_PER_SEC_THREE_RABBITS,
    VALIANT_BUNNY_PICKUP_R,
    VALIANT_RABBIT_BASE_HP,
    VALIANT_SHOCK_BOX_W,
    VALIANT_SHOCK_BOX_H,
    VALIANT_SHOCK_BOX_DURATION_SEC,
    VALIANT_RESCUE_COOLDOWN_SEC,
    VALIANT_RESCUE_WILL_RESTORE,
    VALIANT_DIAMOND_RESCUE_WILL_BONUS,
  } = constants;
  function onAbilityKey(key) {
    if (state.runLevelUpCinematic && performance.now() - state.runLevelUpCinematic.startMs < runLevelUpCinematicMs) return;
    if (state.pausedForCard || state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge) return;
    const abilities = getAbilities();
    if (isLunatic()) {
      if (key === abilities.dash.key) {
        state.lunaticSteerLeft = true;
        return;
      }
      if (key === abilities.decoy.key) {
        state.lunaticSteerRight = true;
        return;
      }
      if (key === abilities.burst.key) {
        tryLunaticWToggle();
        return;
      }
      if (key === abilities.random.key) {
        tryLunaticRoar();
        return;
      }
      return;
    }
    if (key === abilities.dash.key) {
      if (selectedCharacterId() === "rogue") {
        startRogueDashAim();
        return;
      }
      tryDash();
    }
    if (key === abilities.burst.key) tryBurst();
    if (key === abilities.decoy.key) tryDecoy();
    if (key === abilities.random.key) useRandomAbility();
  }

  function tryLunaticWToggleAction() {
    if (!state.running) return;
    if (state.elapsed < state.lunaticStunUntil) return;
    if (state.lunaticPhase === "stumble") {
      if (state.elapsed < state.lunaticPressSprintUnlockAt) return;
      state.lunaticPhase = "sprint";
      state.lunaticMomentum = 0;
      state.lunaticSprintStartedAt = state.elapsed;
      state.lunaticSprintTier2FxFired = false;
      state.lunaticSprintTier4FxFired = false;
      state.lunaticPressStopUnlockAt = state.elapsed + LUNATIC_W_TOGGLE_COOLDOWN_SEC;
      return;
    }
    if (state.lunaticPhase === "sprint") {
      if (state.elapsed < state.lunaticPressStopUnlockAt) return;
      state.lunaticPhase = "decel";
      const sprintDur = Math.max(0, state.elapsed - state.lunaticSprintStartedAt);
      const decelScale = Math.max(0, Math.min(1, sprintDur / Math.max(1e-4, LUNATIC_DECEL_SPRINT_REF_SEC)));
      const decelDur = LUNATIC_DECEL_SEC * decelScale;
      state.lunaticDecelStartAt = state.elapsed;
      state.lunaticDecelEndAt = state.elapsed + decelDur;
      state.lunaticPressSprintUnlockAt = state.elapsed + LUNATIC_W_TOGGLE_COOLDOWN_SEC;
    }
  }

  function tryLunaticRoarAction() {
    if (!state.running || !isLunatic()) return;
    if (state.elapsed < state.lunaticRoarReadyAt) return;
    if (state.lunaticPhase !== "sprint") return;
    state.lunaticRoarUntil = state.elapsed + constants.LUNATIC_ROAR_DURATION_SEC;
    state.lunaticRoarReadyAt = state.elapsed + constants.LUNATIC_ROAR_COOLDOWN_SEC;
    state.lunaticRoarTerrainDmgBank = 0;
    spawnAttackRing(player.x, player.y, player.r + 24, "#ef4444", 0.35);
  }

  function tryDashAction() {
    const abilities = getAbilities();
    if (isValiant()) {
      const ability = abilities.dash;
      if (!state.running) return;
      const cin = runLevelUpCinematic?.();
      if (cin && computeNow() - cin.startMs < runLevelUpCinematicMs) return;
      if (state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge) return;
      if (state.elapsed < ability.nextReadyAt) return;
      const cd = effectiveAbilityCooldown("dash", ability.cooldown, ability.minCooldown ?? 0.45);
      ability.nextReadyAt = state.elapsed + cd;
      const burstDurBonus = knightDiamondBurstEmpowerActive() ? KNIGHT_DIAMOND_BURST_DURATION_BONUS_SEC : 0;
      player.burstUntil = state.elapsed + (abilities.dash.duration ?? abilities.burst.duration ?? 3) + burstDurBonus;
      if (state.elapsed < inventory.clubsInvisUntil) inventory.clubsInvisUntil = Math.max(inventory.clubsInvisUntil, state.elapsed);
      spawnAttackRing(player.x, player.y, 58, "#38bdf8", 0.22);
      spawnAttackRing(player.x, player.y, 88, "#7dd3fc", 0.18);
      return;
    }
    if (selectedCharacterId() === "lunatic" || !state.running) return;
    const ability = abilities.dash;
    if (state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge) return;
    if (dashState.charges <= 0) return;
    let spadesCount = 0;
    forEachDeckCard((c) => {
      if (c.suit === "spades" || c.suit === "joker") spadesCount += 1;
    });
    const qualifiesForSpadesDashBonus =
      (selectedCharacterId() === "rogue" && state.rogueStealthActive) || state.elapsed < inventory.clubsInvisUntil;
    dashState.charges -= 1;
    if (dashState.charges < dashState.maxCharges) {
      const cd = effectiveAbilityCooldown("dash", ability.cooldown, ability.minCooldown ?? 0.25);
      dashState.nextRechargeAt = Math.max(dashState.nextRechargeAt, state.elapsed + cd);
    }
    const target = computeDashTargetAction();
    if (!target.progressed) return;
    player.x = target.x;
    player.y = target.y;
    clampPlayerToArenaNexusInnerHex();
    clampPlayerToSurgeLockHex();
    if (selectedCharacterId() === "rogue" && spadesCount >= setBonusThreshold && qualifiesForSpadesDashBonus) {
      state.rogueStealthActive = true;
      state.rogueStealthOpenUntil = Math.max(state.rogueStealthOpenUntil, state.elapsed + rogueStealthOpenGrace + 0.12);
      inventory.spadesLandingStealthUntil = Math.max(inventory.spadesLandingStealthUntil, state.rogueStealthOpenUntil);
    }
  }

  function startRogueDashAimAction() {
    if (selectedCharacterId() !== "rogue") return;
    if (!state.running || state.pausedForCard || state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge || state.inventoryModalOpen) return;
    if (dashState.charges <= 0) return;
    state.rogueDashAiming = true;
  }

  function releaseRogueDashAimAction() {
    if (selectedCharacterId() !== "rogue" || !state.rogueDashAiming) return;
    state.rogueDashAiming = false;
    tryDashAction();
  }

  function tryBurstAction() {
    const abilities = getAbilities();
    const ability = abilities.burst;
    if (selectedCharacterId() === "lunatic") {
      tryLunaticWToggleAction();
      return;
    }
    if (isValiant()) {
      if (!state.running || valiantBoxChargeState.charges <= 0) return;
      valiantBoxChargeState.charges -= 1;
      if (valiantBoxChargeState.charges < valiantBoxChargeState.maxCharges) {
        const cd = effectiveAbilityCooldown("burst", ability.cooldown, ability.minCooldown ?? 0.5);
        valiantBoxChargeState.nextRechargeAt = Math.max(valiantBoxChargeState.nextRechargeAt, state.elapsed + cd);
      }
      placeValiantShockField();
      return;
    }
    if (state.elapsed < ability.nextReadyAt || !state.running) return;
    if (selectedCharacterId() === "rogue") {
      ability.nextReadyAt = state.elapsed + effectiveAbilityCooldown("burst", ability.cooldown, ability.minCooldown ?? 1);
      entities.smokeZones.push({ x: player.x, y: player.y, r: deckSuitCounts.diamonds >= setBonusMax ? 300 : inventory.rogueDiamondRangeBoost ? 260 : 180, bornAt: state.elapsed, expiresAt: state.elapsed + (ability.duration ?? 3) });
      spawnAttackRing(player.x, player.y, 72, "#94a3b8", 0.2);
      spawnAttackRing(player.x, player.y, 128, "#cbd5e1", 0.28);
      return;
    }
    ability.nextReadyAt = state.elapsed + effectiveAbilityCooldown("burst", ability.cooldown, ability.minCooldown ?? 0.4);
    player.burstUntil = state.elapsed + ability.duration + (knightDiamondBurstEmpowerActive() ? KNIGHT_DIAMOND_BURST_DURATION_BONUS_SEC : 0);
  }

  function tryDecoyAction() {
    if (selectedCharacterId() === "lunatic") return;
    if (isValiant()) return void tryValiantRescueRabbit();
    const ability = getAbilities().decoy;
    if (state.elapsed < ability.nextReadyAt || !state.running) return;
    if (selectedCharacterId() === "rogue") {
      ability.nextReadyAt = state.elapsed + Math.max(ability.minCooldown ?? 0.5, ability.cooldown);
      state.rogueFoodSenseUntil = Math.max(state.rogueFoodSenseUntil, state.elapsed + constants.ROGUE_FOOD_SENSE_DURATION);
      return;
    }
    const decoyEmpower = inventory.diamondEmpower === "decoyLead" || deckSuitCounts.diamonds >= setBonusMax;
    ability.nextReadyAt = state.elapsed + effectiveAbilityCooldown("decoy", ability.cooldown, ability.minCooldown ?? 0.4, decoyEmpower ? 2 : 0);
    entities.decoys.push({ x: player.x, y: player.y, r: player.r, hp: 3, invulnerableUntil: state.elapsed + 0.4, expiresAt: state.elapsed + 6 + (decoyEmpower ? 1 : 0) });
  }

  function useRandomAbilityAction() {
    const ability = getAbilities().random;
    if (!state.running || !ability.type || ability.ammo <= 0) return;
    if (state.elapsed < ability.nextReadyAt || state.playerTimelockUntil > state.elapsed) return;
    if (ability.type === "shield") {
      triggerUltScreenShake(9, 0.2);
      spawnAttackRing(player.x, player.y, player.r + 28, "#ffffff", 0.12);
      entities.shields = [];
      const orbitR = player.r + ULT_ORBIT_SHIELD_RADIUS_EXTRA;
      for (let i = 0; i < 4; i++) entities.shields.push({ angle: (TAU / 4) * i, radius: orbitR, r: 10, bornAt: state.elapsed, expiresAt: state.elapsed + ULT_ORBIT_SHIELD_STAGGER_SEC * (i + 1) });
    } else if (ability.type === "burst") {
      player.ultimateSpeedUntil = state.elapsed + ULT_BURST_WAVE_SPAN_SEC;
      state.ultimateBurstWaves = [];
      for (let i = 0; i < ULT_BURST_WAVE_COUNT; i++) state.ultimateBurstWaves.push(state.elapsed + (i * ULT_BURST_WAVE_SPAN_SEC) / ULT_BURST_WAVE_COUNT);
      spawnUltimateEffect("burstWave", player.x, player.y, "#e0f2fe", 0.4, ULT_BURST_RADIUS * 0.6);
    } else if (ability.type === "timelock") {
      state.playerTimelockUntil = Math.max(state.playerTimelockUntil, state.elapsed + 2);
    } else if (ability.type === "heal") {
      state.tempHp = 3;
      state.tempHpExpiry = state.elapsed + 20;
    }
    ability.ammo -= 1;
    ability.nextReadyAt = state.elapsed + ULTIMATE_ABILITY_COOLDOWN_SEC;
    if ((selectedCharacterId() === "knight" || selectedCharacterId() === "valiant") && countSuitsInActiveSlots().spades >= SET_BONUS_SUIT_THRESHOLD) {
      state.knightSpadesWorldSlowUntil = state.elapsed + KNIGHT_SPADES_WORLD_SLOW_SEC;
    }
  }

  function currentDashDirectionAction() {
    let mx = 0;
    let my = 0;
    if (state.keys.has("arrowleft")) mx -= 1;
    if (state.keys.has("arrowright")) mx += 1;
    if (state.keys.has("arrowup")) my -= 1;
    if (state.keys.has("arrowdown")) my += 1;
    if (mx || my) {
      const len = Math.hypot(mx, my) || 1;
      return { x: mx / len, y: my / len };
    }
    return { x: player.facing.x || 1, y: player.facing.y || 0 };
  }

  function currentDashRangeAction() {
    if (selectedCharacterId() === "rogue") {
      if (deckSuitCounts.diamonds >= setBonusMax) return 220;
      return inventory.rogueDiamondRangeBoost ? 180 : 120;
    }
    return inventory.diamondEmpower === "dash2x" || deckSuitCounts.diamonds >= setBonusMax ? 240 : 120;
  }

  function computeDashTargetAction() {
    const dir = currentDashDirectionAction();
    const step = 12;
    const dashRange = currentDashRangeAction();
    let tx = player.x;
    let ty = player.y;
    let progressed = false;
    for (let d = step; d <= dashRange; d += step) {
      const test = { x: player.x + dir.x * d, y: player.y + dir.y * d, r: player.r };
      if (outOfBoundsCircle(test)) break;
      if (state.arenaPhase === 1) {
        const { x: acx, y: acy } = arenaNexusWorldCenter();
        const maxC = arenaNexusSiegeInnerMaxCenterDistPx();
        if (Math.hypot(test.x - acx, test.y - acy) > maxC + 1e-4) break;
      }
      if (state.surgePhase === 1 || state.surgePhase === 2 || state.surgePhase === 3) {
        const hq = worldToHex(test.x, test.y);
        if (hq.q !== state.surgeLockQ || hq.r !== state.surgeLockR) break;
        const tc = hexToWorld(state.surgeLockQ, state.surgeLockR);
        const maxS = state.surgePhase === 1 || state.surgePhase === 3 ? surgeOuterWaitingMaxCenterDistPx() : surgeLockTileMaxCenterDistPx();
        if (Math.hypot(test.x - tc.x, test.y - tc.y) > maxS + 1e-4) break;
      }
      if (collidesAnyObstacle(test)) {
        if (selectedCharacterId() === "rogue") break;
        continue;
      }
      tx = test.x;
      ty = test.y;
      progressed = true;
    }
    return { x: tx, y: ty, progressed, dir, range: dashRange };
  }

  function lunaticSprintDamageImmuneAction() {
    if (!isLunatic()) return false;
    return state.lunaticPhase === "sprint" || state.lunaticPhase === "decel";
  }

  function lunaticSprintSpeedMultFromMomentumAction(m) {
    return LUNATIC_STUMBLE_MOVE_MULT + (LUNATIC_SPRINT_PEAK_SPEED_MULT - LUNATIC_STUMBLE_MOVE_MULT) * m;
  }

  function removeObstaclesIntersectingPlayerCircleAction() {
    const c = { x: player.x, y: player.y, r: player.r };
    const obstacles = getObstacles();
    for (let i = obstacles.length - 1; i >= 0; i--) {
      if (intersectsRectCircle(c, obstacles[i])) obstacles.splice(i, 1);
    }
  }

  function lunaticCrashDamageFromSprintDurAction() {
    const d = Math.max(0, state.elapsed - state.lunaticSprintStartedAt);
    if (d <= LUNATIC_CRASH_DAMAGE_BRACKET_1_SEC) return LUNATIC_CRASH_DAMAGE_TIER_1;
    if (d <= LUNATIC_CRASH_DAMAGE_BRACKET_2_SEC) return LUNATIC_CRASH_DAMAGE_TIER_2;
    return LUNATIC_CRASH_DAMAGE_TIER_3;
  }

  function lunaticApplyCrashFromObstacleAction() {
    damagePlayer(lunaticCrashDamageFromSprintDurAction(), { lunaticCrash: true });
    spawnAttackRing(player.x, player.y, player.r + 14, "#fef9c3", 0.14);
    spawnAttackRing(player.x, player.y, player.r + 34, "#fb923c", 0.28);
    spawnAttackRing(player.x, player.y, player.r + 56, "#ea580c", 0.4);
    state.lunaticPhase = "stumble";
    state.lunaticMomentum = 0;
    state.lunaticDecelEndAt = 0;
    state.lunaticDecelStartAt = 0;
    state.lunaticStunUntil = state.elapsed + LUNATIC_CRASH_STUN_SEC;
    state.lunaticPressSprintUnlockAt = state.elapsed + LUNATIC_W_TOGGLE_COOLDOWN_SEC;
    state.lunaticSprintTier2FxFired = false;
    state.lunaticSprintTier4FxFired = false;
  }

  function lunaticTickRoarTerrainAction(simDt) {
    if (!isLunatic() || state.elapsed >= state.lunaticRoarUntil) return;
    if (!collidesAnyObstacle({ x: player.x, y: player.y, r: player.r })) return;
    state.lunaticRoarTerrainDmgBank += simDt;
    while (state.lunaticRoarTerrainDmgBank >= LUNATIC_ROAR_TERRAIN_DAMAGE_INTERVAL_SEC) {
      state.lunaticRoarTerrainDmgBank -= LUNATIC_ROAR_TERRAIN_DAMAGE_INTERVAL_SEC;
      damagePlayer(LUNATIC_ROAR_TERRAIN_DAMAGE, { lunaticRoarTerrain: true });
    }
    removeObstaclesIntersectingPlayerCircleAction();
  }

  function updateLunaticMovementAction(dt, simDt) {
    if (state.elapsed < state.lunaticStunUntil) {
      moveCircleWithCollisions(player, 0, 0, dt, {});
      return { touchedObstacle: false };
    }
    if (state.lunaticPhase === "decel" && state.elapsed >= state.lunaticDecelEndAt) {
      state.lunaticPhase = "stumble";
      state.lunaticMomentum = 0;
      state.lunaticDecelEndAt = 0;
      state.lunaticDecelStartAt = 0;
    }
    let mx = 0;
    let my = 0;
    if (state.keys.has("arrowleft")) mx -= 1;
    if (state.keys.has("arrowright")) mx += 1;
    if (state.keys.has("arrowup")) my -= 1;
    if (state.keys.has("arrowdown")) my += 1;
    if (state.lunaticPhase === "stumble") {
      if (mx || my) {
        const mlen = Math.hypot(mx, my);
        player.facing.x = mx / mlen;
        player.facing.y = my / mlen;
      }
      const laserSlowMult = state.elapsed < state.playerLaserSlowUntil ? LASER_BLUE_PLAYER_SLOW_MULT : 1;
      const effectiveSpeed = player.speed * playerSpeedHealthMultiplier() * laserSlowMult * LUNATIC_STUMBLE_MOVE_MULT;
      const mlen = Math.hypot(mx, my) || 1;
      return moveCircleWithCollisions(player, (mx / mlen) * effectiveSpeed, (my / mlen) * effectiveSpeed, dt, {});
    }
    let speedMult = 1;
    if (state.lunaticPhase === "sprint") {
      state.lunaticMomentum = Math.min(1, state.lunaticMomentum + simDt / Math.max(1e-4, LUNATIC_SPRINT_MOMENTUM_RAMP_SEC));
      speedMult = lunaticSprintSpeedMultFromMomentumAction(state.lunaticMomentum);
      if (state.elapsed < state.lunaticRoarUntil) speedMult *= LUNATIC_ROAR_SPEED_MULT;
      const sprintDur = state.elapsed - state.lunaticSprintStartedAt;
      if (!state.lunaticSprintTier2FxFired && sprintDur > LUNATIC_CRASH_DAMAGE_BRACKET_1_SEC) {
        state.lunaticSprintTier2FxFired = true;
        spawnLunaticSprintTierSpeedFx(2);
      }
      if (!state.lunaticSprintTier4FxFired && sprintDur > LUNATIC_CRASH_DAMAGE_BRACKET_2_SEC) {
        state.lunaticSprintTier4FxFired = true;
        spawnLunaticSprintTierSpeedFx(4);
      }
    } else if (state.lunaticPhase === "decel") {
      const decelTotal = Math.max(1e-5, state.lunaticDecelEndAt - state.lunaticDecelStartAt);
      const u = Math.max(0, Math.min(1, 1 - (state.lunaticDecelEndAt - state.elapsed) / decelTotal));
      const peak = lunaticSprintSpeedMultFromMomentumAction(state.lunaticMomentum);
      speedMult = peak * (1 - u);
      if (state.elapsed < state.lunaticRoarUntil) speedMult *= LUNATIC_ROAR_SPEED_MULT;
    }
    const laserSlowMult = state.elapsed < state.playerLaserSlowUntil ? LASER_BLUE_PLAYER_SLOW_MULT : 1;
    const sp = player.speed * playerSpeedHealthMultiplier() * laserSlowMult * speedMult;
    const yawRate = Math.min(LUNATIC_STEER_MAX_RAD_PER_SEC, sp / Math.max(1, LUNATIC_TURN_RADIUS_PX));
    let fx = player.facing.x;
    let fy = player.facing.y;
    const fl0 = Math.hypot(fx, fy) || 1;
    fx /= fl0;
    fy /= fl0;
    let steerLeft = state.lunaticSteerLeft || state.keys.has("arrowleft");
    let steerRight = state.lunaticSteerRight || state.keys.has("arrowright");
    if (steerLeft && steerRight) steerLeft = steerRight = false;
    if (steerLeft) {
      const ang = -yawRate * simDt;
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      const nx = fx * c - fy * s;
      const ny = fx * s + fy * c;
      fx = nx;
      fy = ny;
    }
    if (steerRight) {
      const ang = yawRate * simDt;
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      const nx = fx * c - fy * s;
      const ny = fx * s + fy * c;
      fx = nx;
      fy = ny;
    }
    player.facing.x = fx;
    player.facing.y = fy;
    const vx = fx * sp;
    const vy = fy * sp;
    const prevX = player.x;
    const prevY = player.y;
    const roarPlowing = state.elapsed < state.lunaticRoarUntil;
    const moveRes = moveCircleWithCollisions(player, vx, vy, dt, roarPlowing ? { ignoreObstacles: true } : {});
    if (roarPlowing) return moveRes;
    if (moveRes.touchedObstacle || collidesAnyObstacle(player)) {
      player.x = prevX;
      player.y = prevY;
      lunaticApplyCrashFromObstacleAction();
      return { touchedObstacle: true };
    }
    return moveRes;
  }

  function ejectPlayerFromObstaclesIfStuckAction() {
    const c = { x: player.x, y: player.y, r: player.r };
    if (!collidesAnyObstacle(c)) return;
    const STEP = 3;
    const ANGLES = 28;
    const MAX_R = 220;
    for (let rad = STEP; rad <= MAX_R; rad += STEP) {
      for (let i = 0; i < ANGLES; i++) {
        const ang = (i / ANGLES) * TAU;
        const cand = { x: player.x + Math.cos(ang) * rad, y: player.y + Math.sin(ang) * rad, r: player.r };
        if (!collidesAnyObstacle(cand)) {
          player.x = cand.x;
          player.y = cand.y;
          return;
        }
      }
    }
  }

  function updatePlayerVelocityAction(dt) {
    const pdt = Math.max(dt, 1e-5);
    const ix = (player.x - player._px) / pdt;
    const iy = (player.y - player._py) / pdt;
    player.velX = player.velX * 0.38 + ix * 0.62;
    player.velY = player.velY * 0.38 + iy * 0.62;
    player._px = player.x;
    player._py = player.y;
  }

  function valiantShockBoxScaleAction() {
    if (inventory.diamondEmpower === "valiantBox" || diamondsOmniEmpowerActive()) return VALIANT_DIAMOND_BOX_SCALE;
    return 1;
  }

  function valiantFirstEmptySlotAction() {
    for (let i = 0; i < 3; i++) if (!state.valiantRabbitSlots[i]) return i;
    return -1;
  }

  function valiantLowestHpOccupiedSlotAction() {
    let best = -1;
    let bestHp = Infinity;
    for (let i = 0; i < 3; i++) {
      const s = state.valiantRabbitSlots[i];
      if (!s || s.hp <= 0) continue;
      if (best < 0 || s.hp < bestHp || (s.hp === bestHp && i < best)) {
        bestHp = s.hp;
        best = i;
      }
    }
    return best;
  }

  function valiantRandomOccupiedRabbitIndexAction() {
    const opts = [];
    for (let i = 0; i < 3; i++) {
      const s = state.valiantRabbitSlots[i];
      if (s && s.hp > 0) opts.push(i);
    }
    if (!opts.length) return -1;
    return opts[Math.floor(Math.random() * opts.length)];
  }

  function valiantRabbitAnchorWorldAction(slot) {
    const px = player.x;
    const py = player.y;
    const fx = player.facing.x || 1;
    const fy = player.facing.y || 0;
    const fl = Math.hypot(fx, fy) || 1;
    const rdx = fx / fl;
    const rdy = fy / fl;
    const lx = -rdy;
    const ly = rdx;
    const spots = [
      { slot: 0, ox: lx * 15 - rdx * 7, oy: ly * 15 - rdy * 7 },
      { slot: 1, ox: -lx * 15 - rdx * 7, oy: -ly * 15 - rdy * 7 },
      { slot: 2, ox: -rdx * 19, oy: -rdy * 19 },
    ];
    const sp = spots.find((s) => s.slot === slot);
    if (!sp) return { x: px, y: py };
    return { x: px + sp.ox, y: py + sp.oy };
  }

  function valiantTriggerDeathFromWillAction() {
    if (!state.running) return;
    state.valiantWill = 0;
    player.hp = 0;
    state.running = false;
    state.deathCount += 1;
    if (deathSnapshotsEnabled) state.snapshotPending = true;
    state.deathStartedAtMs = state.lastTime;
    state.bestSurvival = Math.max(state.bestSurvival, runClockEffectiveSec());
  }

  function valiantApplyDamageAction(amount, opts = {}) {
    if (amount <= 0) return;
    const dmg = opts.surgeHexPulse ? 1 : amount;
    const idx = opts.surgeHexPulse ? valiantLowestHpOccupiedSlotAction() : valiantRandomOccupiedRabbitIndexAction();
    if (idx < 0) return;
    const slot = state.valiantRabbitSlots[idx];
    if (!slot) return;
    slot.hp -= dmg;
    if (opts.laserBlueSlow) state.playerLaserSlowUntil = state.elapsed + LASER_BLUE_PLAYER_SLOW_SEC;
    state.hurtFlash = 0.16;
    state.playerInvulnerableUntil = state.elapsed + 0.35;
    state.screenShakeUntil = state.elapsed + 0.18;
    state.screenShakeStrength = 8;
    entities.damageRipples.push({ x: player.x, y: player.y, bornAt: state.elapsed, expiresAt: state.elapsed + 0.22 });
    state.damageEvents.push({ t: state.elapsed, amount: dmg, hpAfter: Math.round(state.valiantWill * 100) });
    if (passive.stunOnHitSecs > 0) {
      for (const h of entities.hunters) {
        if (distSq(h, player) <= 220 * 220) h.stunnedUntil = Math.max(h.stunnedUntil || 0, state.elapsed + passive.stunOnHitSecs);
      }
    }
    if (slot.hp <= 0) {
      const { x: dax, y: day } = valiantRabbitAnchorWorldAction(idx);
      spawnValiantRabbitDeathFx(dax, day);
      triggerUltScreenShake(16, 0.26);
      state.valiantRabbitSlots[idx] = null;
      state.valiantWill = Math.max(0, state.valiantWill - VALIANT_WILL_RABBIT_DEATH_COST);
      spawnHealPopup(player.x, player.y - player.r - 14, "Rabbit lost", "#fca5a5", 0.85, 13);
      if (state.valiantWill <= 0) valiantTriggerDeathFromWillAction();
    }
  }

  function valiantOccupiedRabbitCountAction() {
    let n = 0;
    for (let i = 0; i < 3; i++) if (state.valiantRabbitSlots[i]) n++;
    return n;
  }

  function valiantWillNetChangePerSecAction() {
    const occ = valiantOccupiedRabbitCountAction();
    const drainAtZeroRabbits = 3 * VALIANT_WILL_DECAY_PER_EMPTY_SLOT;
    if (occ === 0) return -drainAtZeroRabbits;
    if (occ === 1) return -drainAtZeroRabbits / 2;
    if (occ === 2) return 0;
    return VALIANT_WILL_REGEN_PER_SEC_THREE_RABBITS;
  }

  function updateValiantWillDecayAction(simDt) {
    if (!isValiant() || !state.running) return;
    const netPerSec = valiantWillNetChangePerSecAction();
    state.valiantWill += netPerSec * simDt;
    state.valiantWill = Math.min(1, state.valiantWill);
    if (state.valiantWill <= 0) valiantTriggerDeathFromWillAction();
  }

  function spawnValiantWildBunnyAction() {
    if (!isValiant()) return;
    const point = randomOpenPoint(VALIANT_BUNNY_PICKUP_R, 72, { excludeArenaNexus: true });
    entities.valiantBunnies.push({ x: point.x, y: point.y, r: VALIANT_BUNNY_PICKUP_R, bornAt: state.elapsed, expiresAt: state.elapsed + 18 });
  }

  function updateValiantBunnyPickupsAction() {
    if (!isValiant()) return;
    for (let i = entities.valiantBunnies.length - 1; i >= 0; i--) {
      const b = entities.valiantBunnies[i];
      if (state.elapsed >= b.expiresAt) {
        entities.valiantBunnies.splice(i, 1);
        continue;
      }
      const slot = valiantFirstEmptySlotAction();
      if (slot < 0) continue;
      const rr = b.r + player.r;
      if (distSq(b, player) <= rr * rr) {
        const bonus = state.valiantSlotBonusMax[slot] ?? 0;
        state.valiantRabbitSlots[slot] = { hp: VALIANT_RABBIT_BASE_HP + bonus, maxHp: VALIANT_RABBIT_BASE_HP + bonus };
        entities.valiantBunnies.splice(i, 1);
        spawnHealPopup(player.x, player.y - player.r - 10, "Saved", "#86efac", 0.65, 13);
      }
    }
  }

  function placeValiantShockFieldAction() {
    const scale = valiantShockBoxScaleAction();
    const w = VALIANT_SHOCK_BOX_W * scale;
    const h = VALIANT_SHOCK_BOX_H * scale;
    const cx = player.x;
    const cy = player.y;
    entities.valiantElectricBoxes.push({ x: cx - w / 2, y: cy - h / 2, w, h, expiresAt: state.elapsed + VALIANT_SHOCK_BOX_DURATION_SEC });
    spawnAttackRing(cx, cy, Math.max(w, h) * 0.55, "#38bdf8", 0.28);
    spawnAttackRing(cx, cy, Math.max(w, h) * 0.38, "#bae6fd", 0.22);
  }

  function startValiantRescueCooldownFromNowAction() {
    if (!isValiant()) return;
    const rescueCd = effectiveAbilityCooldown("decoy", VALIANT_RESCUE_COOLDOWN_SEC, 0.5);
    state.valiantRescueReadyAt = state.elapsed + rescueCd;
    getAbilities().decoy.nextReadyAt = state.elapsed + rescueCd;
  }

  function updateValiantRescueCooldownWhenNoRabbitsAction() {
    if (!isValiant() || !state.running) return;
    if (valiantOccupiedRabbitCountAction() === 0) startValiantRescueCooldownFromNowAction();
  }

  function tryValiantRescueRabbitAction() {
    if (state.elapsed < state.valiantRescueReadyAt || !state.running) return;
    const slot = valiantLowestHpOccupiedSlotAction();
    if (slot < 0) return;
    const anchor = valiantRabbitAnchorWorldAction(slot);
    state.valiantRabbitSlots[slot] = null;
    startValiantRescueCooldownFromNowAction();
    let willBump = VALIANT_RESCUE_WILL_RESTORE;
    if (inventory.diamondEmpower === "valiantRescue" || diamondsOmniEmpowerActive()) willBump += VALIANT_DIAMOND_RESCUE_WILL_BONUS;
    state.valiantWill = Math.min(1, state.valiantWill + willBump);
    spawnValiantRescueFx(anchor.x, anchor.y);
    spawnHealPopup(player.x, player.y - player.r - 12, "To safety", "#a5b4fc", 0.9, 14);
    spawnAttackRing(player.x, player.y, player.r + 24, "#818cf8", 0.25);
  }

  function isPointNearTerrainAction(x, y, extraRadius = 40) {
    const rr = extraRadius * extraRadius;
    for (const obstacle of getObstacles()) {
      const cx = clampFn(x, obstacle.x, obstacle.x + obstacle.w);
      const cy = clampFn(y, obstacle.y, obstacle.y + obstacle.h);
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= rr) return true;
    }
    return false;
  }

  function nearestTerrainInfoAction(x, y) {
    let bestDist = Infinity;
    let bestPoint = null;
    for (const obstacle of getObstacles()) {
      const cx = clampFn(x, obstacle.x, obstacle.x + obstacle.w);
      const cy = clampFn(y, obstacle.y, obstacle.y + obstacle.h);
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.hypot(dx, dy);
      if (d < bestDist) {
        bestDist = d;
        bestPoint = { x: cx, y: cy };
      }
    }
    return { dist: bestDist, point: bestPoint };
  }

  function playerInsideSmokeAction() {
    for (const smoke of entities.smokeZones) {
      if (state.elapsed >= smoke.expiresAt) continue;
      const dx = player.x - smoke.x;
      const dy = player.y - smoke.y;
      if (dx * dx + dy * dy <= smoke.r * smoke.r) return true;
    }
    return false;
  }

  function isPlayerHuggingTerrainAction(margin = 20) {
    const probe = { x: player.x, y: player.y, r: player.r + margin };
    for (const obstacle of getObstacles()) {
      if (intersectsRectCircle(probe, obstacle)) return true;
    }
    return false;
  }

  function formatControlsHintLine() {
    const id = selectedCharacterId();
    if (id === "rogue") {
      return "Move: Arrows | Abilities: Q dash, W smoke bomb, E point to food | Pause: Space | Retry: R (character select)";
    }
    if (id === "valiant") {
      return "Move: Arrows | Abilities: Q Surge, W shock field (enemies), E Rescue, R Ultimate (Ace slot) | Pause: Space | Retry: R (character select)";
    }
    if (id === "lunatic") {
      return "Move: Arrows (stumble) | Sprint: W — hold Q or Left to curve left, E or Right to curve right | R roar (sprint only) | Pause: Space | Retry: R (character select)";
    }
    return "Move: Arrows | Abilities: Q dash, W speed burst, E decoy | Pause: Space | Retry: R (character select)";
  }

  function refreshControlsHint() {
    if (controlsHintEl) controlsHintEl.textContent = formatControlsHintLine();
  }

  function bindKeyboardControls() {
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (key.startsWith("arrow")) event.preventDefault();
      const abilities = getAbilities();
      if (!getGameStarted()) return;
      if (key === abilities.random.key && !state.running) {
        event.preventDefault();
        setGameStarted(false);
        resetGame();
        afterDeathRetry();
        return;
      }
      if (state.manualPause) {
        const resumeGameplay =
          key.startsWith("arrow") ||
          key === abilities.dash.key ||
          key === abilities.burst.key ||
          key === abilities.decoy.key ||
          key === abilities.random.key;
        if (!resumeGameplay) {
          if (key === " ") event.preventDefault();
          return;
        }
        state.manualPause = false;
        runLog.event(logCodes.EVT_MANUAL_RESUME, "Manual pause: resumed");
      }
      if (state.pausedForRoulette && key === "escape") {
        event.preventDefault();
        closeRouletteForgeUi();
        return;
      }
      if (state.pausedForSafehousePrompt && key === "escape") {
        event.preventDefault();
        closeSafehouseLevelModal();
        return;
      }
      if (state.pausedForForge && key === "escape") {
        event.preventDefault();
        closeForgeModalUi();
        return;
      }
      if (state.inventoryModalOpen && !state.pausedForRoulette && (key === "enter" || key === " " || key === "escape")) {
        continueAfterLoadout();
        return;
      }
      if (key === " " && !state.pausedForCard && !state.inventoryModalOpen && !state.pausedForSafehousePrompt && !state.pausedForForge) {
        state.manualPause = true;
        runLog.event(logCodes.EVT_MANUAL_PAUSE, "Manual pause: paused (Space)");
        state.keys.clear();
        state.lunaticSteerLeft = false;
        state.lunaticSteerRight = false;
        return;
      }
      if (state.waitingForMovementResume) {
        const movementInput = key.startsWith("arrow");
        if (!movementInput) return;
        state.waitingForMovementResume = false;
        state.pausedForCard = false;
      }
      if (key.startsWith("arrow")) state.keys.add(key);
      onAbilityKey(key);
    });

    window.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      if (key.startsWith("arrow")) event.preventDefault();
      if (key.startsWith("arrow")) state.keys.delete(key);
      const abilities = getAbilities();
      if (isLunatic()) {
        if (key === abilities.dash.key) state.lunaticSteerLeft = false;
        if (key === abilities.decoy.key) state.lunaticSteerRight = false;
      }
      if (key === abilities.dash.key) releaseRogueDashAim();
    });
  }

  return {
    onAbilityKey,
    formatControlsHintLine,
    refreshControlsHint,
    bindKeyboardControls,
    tryLunaticWToggleAction,
    tryLunaticRoarAction,
    tryDashAction,
    startRogueDashAimAction,
    releaseRogueDashAimAction,
    tryBurstAction,
    tryDecoyAction,
    useRandomAbilityAction,
    currentDashDirectionAction,
    currentDashRangeAction,
    computeDashTargetAction,
    lunaticSprintDamageImmuneAction,
    lunaticSprintSpeedMultFromMomentumAction,
    removeObstaclesIntersectingPlayerCircleAction,
    lunaticCrashDamageFromSprintDurAction,
    lunaticApplyCrashFromObstacleAction,
    lunaticTickRoarTerrainAction,
    updateLunaticMovementAction,
    ejectPlayerFromObstaclesIfStuckAction,
    updatePlayerVelocityAction,
    valiantShockBoxScaleAction,
    valiantFirstEmptySlotAction,
    valiantLowestHpOccupiedSlotAction,
    valiantRandomOccupiedRabbitIndexAction,
    valiantRabbitAnchorWorldAction,
    valiantTriggerDeathFromWillAction,
    valiantApplyDamageAction,
    valiantOccupiedRabbitCountAction,
    valiantWillNetChangePerSecAction,
    updateValiantWillDecayAction,
    spawnValiantWildBunnyAction,
    updateValiantBunnyPickupsAction,
    placeValiantShockFieldAction,
    startValiantRescueCooldownFromNowAction,
    updateValiantRescueCooldownWhenNoRabbitsAction,
    tryValiantRescueRabbitAction,
    isPointNearTerrainAction,
    nearestTerrainInfoAction,
    playerInsideSmokeAction,
    isPlayerHuggingTerrainAction,
  };
}
