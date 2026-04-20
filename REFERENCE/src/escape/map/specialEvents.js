export function createSpecialEventsManager({
  state,
  clamp,
  hexKey,
  hexToWorld,
  worldToHex,
  HEX_DIRS,
  constants,
  escapeLocalDevHost,
  specialTestWestSelect,
  isLunatic,
  runLog,
  logCodes,
  player,
  safehouseLevelModal,
  drawSafehouseHexCell,
  drawSafehouseEmbeddedFacilities,
  runClockEffectiveSec,
  getSpawnIntervalFromRunTime,
  displayWorldLevel,
  getNow = () => performance.now(),
  entities,
  spawnHunter,
  openCardPickupModal,
  makeJokerArenaRewardCard,
  triggerUltScreenShake,
  damagePlayer,
  strokePointyHexOutline,
  fillPointyHexRainbowGlow,
  openRouletteForgeModal,
  collectArenaNexusAxials,
  collectSurgeHexAxials,
  collectRouletteHexAxials,
  isArenaNexusTile,
  isArenaNexusInteractive,
  isSurgeHexTile,
  isSurgeHexInteractive,
  isRouletteHexTile,
  isRouletteHexInteractive,
  arenaNexusWorldCenter,
  markProceduralArenaHexSpent,
  markProceduralSurgeHexSpent,
  markProceduralRouletteHexSpent,
}) {
  const {
    PROCEDURAL_SPECIAL_HEX_MIN_ELAPSED_SEC,
    SPECIAL_SPAWN_WEIGHT_START,
    SPECIAL_SPAWN_WEIGHT_END,
    SPECIAL_SPAWN_DECAY_SEC,
    SPECIAL_SPAWN_COOLDOWN_SEC,
    SURGE_TRAVEL_DUR_FIRST,
    HEX_SIZE,
    SQRT3,
    SAFEHOUSE_EMBED_SITE_HIT_R,
    SAFEHOUSE_EMBED_CENTER_INSET,
    SAFEHOUSE_EMBED_HEX_VERTEX_R_MULT,
    SAFEHOUSE_INNER_HIT_R,
    SAFEHOUSE_SPENT_TILE_ANIM_MS,
    TAU,
    ARENA_NEXUS_SIEGE_SEC,
    ARENA_NEXUS_INNER_HEX_SCALE,
    ARENA_NEXUS_INNER_ENTER_R,
    ARENA_NEXUS_INNER_APOTHEM,
    ARENA_NEXUS_RING_LO,
    ARENA_NEXUS_RING_HI,
    ARENA_NEXUS_RING_LASER_SPAWN_INTERVAL,
    ARENA_NEXUS_RING_SNIPER_SPAWN_INTERVAL,
    ARENA_NEXUS_REWARD_MODAL_DELAY_SEC,
    ROULETTE_INNER_HIT_R,
    ROULETTE_INNER_HEX_DRAW_R,
    SURGE_HEX_WAVES,
    SURGE_TRAVEL_DUR_DECREMENT_PER_WAVE,
    SURGE_WAVE_PAUSE_SEC,
    SURGE_TILE_DAMAGE,
    SURGE_TILE_FLASH_SEC,
    SURGE_SAFE_HEX_DRAW_R,
    SURGE_SAFE_HIT_R,
    SURGE_SAFE_MIN_CENTER_SEP_PX,
    LATE_GAME_ELITE_SPAWN_SEC,
  } = constants;

  function surgeTravelDurationForWave(wave) {
    return Math.max(0.05, SURGE_TRAVEL_DUR_FIRST - SURGE_TRAVEL_DUR_DECREMENT_PER_WAVE * (wave - 1));
  }

  function surgeLockTileMaxCenterDistPx() {
    return Math.max(6, ARENA_NEXUS_INNER_APOTHEM - player.r - 0.75);
  }

  function pickSurgeSafeAndPulseFrom(q, r) {
    const tc = hexToWorld(q, r);
    const apo = HEX_SIZE * (SQRT3 / 2) * 0.72;
    const maxSafeCenterDist = Math.max(10, surgeLockTileMaxCenterDistPx() - SURGE_SAFE_HIT_R - 8);
    const distCap = Math.min(apo * 0.69, maxSafeCenterDist);
    const minSep = SURGE_SAFE_MIN_CENTER_SEP_PX;
    const inPlayDisc = (sx, sy) => Math.hypot(sx - tc.x, sy - tc.y) <= maxSafeCenterDist + 1e-3;
    const farEnoughFromPrev = (sx, sy) => {
      if (!state.surgeHasPrevSafeBubble) return true;
      return Math.hypot(sx - state.surgePrevSafeX, sy - state.surgePrevSafeY) >= minSep - 1e-3;
    };
    let sx = tc.x;
    let sy = tc.y;
    let found = false;
    for (let a = 0; a < 56; a++) {
      const ang = Math.random() * TAU;
      const dist = ((0.14 + Math.random() * 0.55) / 0.69) * distCap;
      const tx = tc.x + Math.cos(ang) * dist;
      const ty = tc.y + Math.sin(ang) * dist;
      if (inPlayDisc(tx, ty) && farEnoughFromPrev(tx, ty)) {
        sx = tx;
        sy = ty;
        found = true;
        break;
      }
    }
    if (!found) {
      for (let i = 0; i < 40; i++) {
        const ang = (i / 40) * TAU;
        const dist = (0.3 + Math.random() * 0.7) * distCap;
        const tx = tc.x + Math.cos(ang) * dist;
        const ty = tc.y + Math.sin(ang) * dist;
        if (inPlayDisc(tx, ty) && farEnoughFromPrev(tx, ty)) {
          sx = tx;
          sy = ty;
          break;
        }
      }
    }
    state.surgeSafeX = sx;
    state.surgeSafeY = sy;
  }

  function beginSurgeTravelWave() {
    pickSurgeSafeAndPulseFrom(state.surgeLockQ, state.surgeLockR);
    state.surgeTravelStartAt = state.elapsed;
    state.surgeTravelDur = surgeTravelDurationForWave(state.surgeWave);
    state.surgeAwait = "travel";
  }

  function killHuntersOnSurgeHex(q, r) {
    entities.hunters = entities.hunters.filter((h) => {
      const hh = worldToHex(h.x, h.y);
      return hh.q !== q || hh.r !== r;
    });
  }

  function surgeHitNow() {
    const q = state.surgeLockQ;
    const r = state.surgeLockR;
    killHuntersOnSurgeHex(q, r);
    const c = hexToWorld(q, r);
    const d = Math.hypot(player.x - state.surgeSafeX, player.y - state.surgeSafeY);
    if (d > SURGE_SAFE_HIT_R) damagePlayer(SURGE_TILE_DAMAGE, { surgePulse: true });
    state.surgeScreenFlashUntil = state.elapsed + SURGE_TILE_FLASH_SEC;
    state.surgePrevSafeX = state.surgeSafeX;
    state.surgePrevSafeY = state.surgeSafeY;
    state.surgeHasPrevSafeBubble = true;
    triggerUltScreenShake(8, 0.12);
    return c;
  }

  function beginSurgeOuterLock(q, r) {
    state.surgePhase = 1;
    state.surgeLockQ = q;
    state.surgeLockR = r;
    state.surgeWave = 1;
    state.surgeAwait = "travel";
    state.surgeHasPrevSafeBubble = false;
    state.surgeScreenFlashUntil = 0;
    state.surgeEligibleForInnerExitReward = false;
    state.surgeCardRewardAt = 0;
  }

  function beginSurgeGauntletActive() {
    state.surgePhase = 2;
    state.surgeWave = 1;
    state.surgeHasPrevSafeBubble = false;
    beginSurgeTravelWave();
    // Lock immediately when crossing the inner threshold so there is no one-frame grace.
    const c = hexToWorld(state.surgeLockQ, state.surgeLockR);
    const dx = player.x - c.x;
    const dy = player.y - c.y;
    const d = Math.hypot(dx, dy) || 1;
    const maxD = surgeLockTileMaxCenterDistPx();
    if (d > maxD) {
      player.x = c.x + (dx / d) * maxD;
      player.y = c.y + (dy / d) * maxD;
    }
  }

  function ejectHuntersFromSurgeLockHex() {
    if (state.surgePhase !== 1 && state.surgePhase !== 2 && state.surgePhase !== 3) return;
    const edgeR = HEX_SIZE + 14;
    for (const h of entities.hunters) {
      if (h.arenaNexusSpawn) continue;
      const hq = worldToHex(h.x, h.y);
      if (hq.q !== state.surgeLockQ || hq.r !== state.surgeLockR) continue;
      const { x: cx, y: cy } = hexToWorld(hq.q, hq.r);
      const dx = h.x - cx;
      const dy = h.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      h.x = cx + (dx / len) * (edgeR + h.r);
      h.y = cy + (dy / len) * (edgeR + h.r);
    }
  }

  function ejectHuntersFromInteractiveSurgeHexesPreTrigger() {
    if (state.surgePhase !== 0) return;
    const edgeR = HEX_SIZE + 14;
    for (const h of entities.hunters) {
      if (h.arenaNexusSpawn) continue;
      const hq = worldToHex(h.x, h.y);
      if (!isSurgeHexInteractive(hq.q, hq.r)) continue;
      const { x: cx, y: cy } = hexToWorld(hq.q, hq.r);
      const dx = h.x - cx;
      const dy = h.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      h.x = cx + (dx / len) * (edgeR + h.r);
      h.y = cy + (dy / len) * (edgeR + h.r);
    }
  }

  function isWorldPointOnSurgeLockBarrierTile(px, py) {
    if (state.surgePhase !== 1 && state.surgePhase !== 2 && state.surgePhase !== 3) return false;
    const h = worldToHex(px, py);
    if (h.q !== state.surgeLockQ || h.r !== state.surgeLockR) return false;
    const c = hexToWorld(h.q, h.r);
    return Math.hypot(px - c.x, py - c.y) <= HEX_SIZE + 4;
  }

  function updateSurgeHex() {
    if (!state.running || state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge) return;
    if (state.pausedForCard) return;
    ejectHuntersFromInteractiveSurgeHexesPreTrigger();
    const ph = worldToHex(player.x, player.y);
    const inSurge = isSurgeHexTile(ph.q, ph.r);
    if (!inSurge) {
      state.surgeWasInSurgeHex = false;
      // Keep completed/pending-complete surge state on this tile until it despawns.
      // Only cancel/reset if the player leaves mid-event (outer lock or active gauntlet).
      if (state.surgePhase === 1 || state.surgePhase === 2) {
        state.surgePhase = 0;
        state.surgeAwait = "travel";
        state.surgeWave = 1;
        state.surgeScreenFlashUntil = 0;
        state.surgeHasPrevSafeBubble = false;
        state.surgeEligibleForInnerExitReward = false;
        state.surgeCardRewardAt = 0;
      }
      return;
    }
    const enteredThisFrame = inSurge && !state.surgeWasInSurgeHex;
    state.surgeWasInSurgeHex = true;
    if (enteredThisFrame && state.surgePhase === 0 && isSurgeHexInteractive(ph.q, ph.r)) beginSurgeOuterLock(ph.q, ph.r);
    if (state.surgePhase === 1) {
      // Outer lock is active: keep enemies out until player commits by crossing the inner threshold.
      ejectHuntersFromSurgeLockHex();
    }
    if (state.surgePhase === 1 && ph.q === state.surgeLockQ && ph.r === state.surgeLockR) {
      const c = hexToWorld(state.surgeLockQ, state.surgeLockR);
      if (Math.hypot(player.x - c.x, player.y - c.y) <= ARENA_NEXUS_INNER_ENTER_R) beginSurgeGauntletActive();
    }
    if (state.surgePhase === 3 && ph.q === state.surgeLockQ && ph.r === state.surgeLockR) {
      const c = hexToWorld(state.surgeLockQ, state.surgeLockR);
      const d = Math.hypot(player.x - c.x, player.y - c.y);
      if (state.surgeEligibleForInnerExitReward && d > ARENA_NEXUS_INNER_ENTER_R) {
        state.surgeEligibleForInnerExitReward = false;
        state.surgeCardRewardAt = 0;
        openCardPickupModal(makeJokerArenaRewardCard());
        state.surgePhase = 4;
      }
    }
    if (state.surgePhase !== 2 || ph.q !== state.surgeLockQ || ph.r !== state.surgeLockR) return;
    if (state.surgeAwait === "travel") {
      const u = (state.elapsed - state.surgeTravelStartAt) / Math.max(1e-4, state.surgeTravelDur);
      if (u >= 1) {
        surgeHitNow();
        state.surgePauseEndAt = state.elapsed + SURGE_WAVE_PAUSE_SEC;
        state.surgeAwait = "pause";
      }
    } else if (state.surgeAwait === "pause" && state.elapsed >= state.surgePauseEndAt) {
      state.surgeWave += 1;
      if (state.surgeWave > SURGE_HEX_WAVES) {
        state.surgePhase = 3;
        state.surgeAwait = "idle";
        state.surgeEligibleForInnerExitReward = true;
        state.surgeCardRewardAt = 0;
        markProceduralSurgeHexSpent(state.surgeLockQ, state.surgeLockR);
      } else beginSurgeTravelWave();
    }
  }

  function drawSurgeHexWorld(ctx) {
    const cells = collectSurgeHexAxials();
    if (!cells.length) return;
    const innerVertexR = HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE;
    for (const { q, r } of cells) {
      const c = hexToWorld(q, r);
      const cx = c.x;
      const cy = c.y;
      const isOuterWait = state.surgePhase === 1 && q === state.surgeLockQ && r === state.surgeLockR;
      const isActiveGauntlet = state.surgePhase === 2 && q === state.surgeLockQ && r === state.surgeLockR;
      const isInnerOpenOuterLocked = state.surgePhase === 3 && q === state.surgeLockQ && r === state.surgeLockR;
      const isFullyCleared = state.surgePhase === 4 && q === state.surgeLockQ && r === state.surgeLockR;
      let outer = "rgba(59, 130, 246, 0.92)";
      let inner = "rgba(96, 165, 250, 0.88)";
      if (state.proceduralSurgeSpentKeys.has(hexKey(q, r))) {
        outer = "rgba(34, 197, 94, 0.92)";
        inner = "rgba(74, 222, 128, 0.88)";
      } else if (isOuterWait) {
        outer = "rgba(239, 68, 68, 0.95)";
      } else if (isActiveGauntlet) {
        outer = "rgba(239, 68, 68, 0.95)";
        inner = "rgba(248, 113, 113, 0.9)";
      } else if (isInnerOpenOuterLocked) {
        outer = "rgba(239, 68, 68, 0.95)";
        inner = "rgba(74, 222, 128, 0.88)";
      } else if (isFullyCleared) {
        outer = "rgba(34, 197, 94, 0.92)";
        inner = "rgba(74, 222, 128, 0.88)";
      }
      strokePointyHexOutline(ctx, cx, cy, HEX_SIZE, outer, 3.2, 18);
      strokePointyHexOutline(ctx, cx, cy, innerVertexR, inner, 2.4, 14);
      if (isActiveGauntlet) {
        ctx.save();
        ctx.fillStyle = "rgba(248, 250, 252, 0.92)";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI / 2 + (Math.PI / 3) * i;
          const x = state.surgeSafeX + Math.cos(a) * SURGE_SAFE_HEX_DRAW_R;
          const y = state.surgeSafeY + Math.sin(a) * SURGE_SAFE_HEX_DRAW_R;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        const u = clamp((state.elapsed - state.surgeTravelStartAt) / Math.max(1e-4, state.surgeTravelDur), 0, 1);
        const pulseCx = cx + (state.surgeSafeX - cx) * u;
        const pulseCy = cy + (state.surgeSafeY - cy) * u;
        const pulseR = innerVertexR + (SURGE_SAFE_HEX_DRAW_R - innerVertexR) * u;
        const pulseStroke = 2.4 + (3.2 - 2.4) * (1 - u);
        strokePointyHexOutline(ctx, pulseCx, pulseCy, pulseR, "rgba(248, 113, 113, 0.95)", pulseStroke, 18);
      }
    }
  }

  function cleanupArenaNexusSiegeCombat() {
    entities.laserBeams = entities.laserBeams.filter((b) => !b.arenaHazard);
    entities.dangerZones = entities.dangerZones.filter((z) => !z.arenaHazard);
    entities.hunters = entities.hunters.filter((h) => !h.arenaNexusSpawn);
  }

  function randomPointOnArenaNexusRing() {
    const { x: cx, y: cy } = arenaNexusWorldCenter();
    const ang = Math.random() * TAU;
    const ringR = ARENA_NEXUS_RING_LO + (0.15 + Math.random() * 0.85) * (ARENA_NEXUS_RING_HI - ARENA_NEXUS_RING_LO);
    return { x: cx + Math.cos(ang) * ringR, y: cy + Math.sin(ang) * ringR };
  }

  function spawnArenaNexusRingLaserHunter() {
    const type = state.elapsed >= LATE_GAME_ELITE_SPAWN_SEC && Math.random() < 0.38 ? "laserBlue" : "laser";
    const p = randomPointOnArenaNexusRing();
    spawnHunter(type, p.x, p.y, { arenaNexusSpawn: true });
  }

  function spawnArenaNexusRingSniperHunter() {
    const p = randomPointOnArenaNexusRing();
    spawnHunter("sniper", p.x, p.y, { arenaNexusSpawn: true });
  }

  function ejectHuntersFromArenaNexusDuringSiege() {
    if (state.arenaPhase !== 1) return;
    const { x: cx, y: cy } = arenaNexusWorldCenter();
    const edgeR = HEX_SIZE + 14;
    for (const h of entities.hunters) {
      if (h.arenaNexusSpawn) continue;
      const hq = worldToHex(h.x, h.y);
      if (!isArenaNexusTile(hq.q, hq.r)) continue;
      const dx = h.x - cx;
      const dy = h.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      h.x = cx + (dx / len) * (edgeR + h.r);
      h.y = cy + (dy / len) * (edgeR + h.r);
    }
  }

  function arenaNexusSiegeInnerMaxCenterDistPx() {
    return Math.max(6, ARENA_NEXUS_INNER_APOTHEM - player.r - 0.75);
  }

  function clampPlayerToArenaNexusInnerHex() {
    if (state.arenaPhase !== 1) return;
    const { x: cx, y: cy } = arenaNexusWorldCenter();
    const dx = player.x - cx;
    const dy = player.y - cy;
    const d = Math.hypot(dx, dy) || 1;
    const maxD = arenaNexusSiegeInnerMaxCenterDistPx();
    if (d <= maxD) return;
    player.x = cx + (dx / d) * maxD;
    player.y = cy + (dy / d) * maxD;
  }

  function beginArenaNexusSiege() {
    const ph = worldToHex(player.x, player.y);
    state.arenaSiegeQ = ph.q;
    state.arenaSiegeR = ph.r;
    state.arenaPhase = 1;
    state.arenaSiegeEndAt = state.elapsed + ARENA_NEXUS_SIEGE_SEC;
    state.arenaNextLaserEnemyAt = state.elapsed;
    state.arenaNextSniperEnemyAt = state.elapsed + 0.12;
    ejectHuntersFromArenaNexusDuringSiege();
    clampPlayerToArenaNexusInnerHex();
  }

  function finishArenaNexusSiege() {
    state.arenaPhase = 2;
    cleanupArenaNexusSiegeCombat();
    state.arenaCardRewardAt = state.elapsed + ARENA_NEXUS_REWARD_MODAL_DELAY_SEC;
    markProceduralArenaHexSpent(state.arenaSiegeQ, state.arenaSiegeR);
  }

  function updateArenaNexus() {
    if (!state.running || state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge) return;
    if (state.arenaPhase === 2 && state.arenaCardRewardAt > 0 && state.elapsed >= state.arenaCardRewardAt && !state.pausedForCard) {
      state.arenaCardRewardAt = 0;
      openCardPickupModal(makeJokerArenaRewardCard());
    }
    if (state.pausedForCard) return;
    if (state.arenaPhase === 1) {
      while (state.elapsed >= state.arenaNextLaserEnemyAt) {
        spawnArenaNexusRingLaserHunter();
        state.arenaNextLaserEnemyAt += ARENA_NEXUS_RING_LASER_SPAWN_INTERVAL;
      }
      while (state.elapsed >= state.arenaNextSniperEnemyAt) {
        spawnArenaNexusRingSniperHunter();
        state.arenaNextSniperEnemyAt += ARENA_NEXUS_RING_SNIPER_SPAWN_INTERVAL;
      }
      if (state.elapsed >= state.arenaSiegeEndAt) finishArenaNexusSiege();
    }
    if (state.arenaPhase !== 0) return;
    const ph = worldToHex(player.x, player.y);
    if (!isArenaNexusInteractive(ph.q, ph.r)) return;
    const c = hexToWorld(ph.q, ph.r);
    if (Math.hypot(player.x - c.x, player.y - c.y) <= ARENA_NEXUS_INNER_ENTER_R) beginArenaNexusSiege();
  }

  function drawArenaNexusWorld(ctx) {
    const cells = collectArenaNexusAxials();
    if (!cells.length) return;
    for (const { q, r } of cells) {
      const c = hexToWorld(q, r);
      const spent = state.proceduralArenaSpentKeys.has(hexKey(q, r));
      const outer = spent ? "rgba(34, 197, 94, 0.92)" : state.arenaPhase === 1 ? "rgba(239, 68, 68, 0.95)" : "rgba(59, 130, 246, 0.92)";
      const inner = spent ? "rgba(74, 222, 128, 0.88)" : state.arenaPhase === 1 ? "rgba(248, 113, 113, 0.9)" : "rgba(96, 165, 250, 0.88)";
      strokePointyHexOutline(ctx, c.x, c.y, HEX_SIZE, outer, 3.2, 18);
      strokePointyHexOutline(ctx, c.x, c.y, HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE, inner, 2.4, 14);
    }
  }

  function isWorldPointOnRouletteHexTile(x, y) {
    const h = worldToHex(x, y);
    if (!isRouletteHexTile(h.q, h.r)) return false;
    const c = hexToWorld(h.q, h.r);
    return Math.hypot(x - c.x, y - c.y) <= HEX_SIZE + 4;
  }

  function ejectHuntersFromRouletteHexLock() {
    if (state.roulettePhase !== 1) return;
    const edgeR = HEX_SIZE + 14;
    for (const h of entities.hunters) {
      if (h.arenaNexusSpawn) continue;
      const hq = worldToHex(h.x, h.y);
      if (!isRouletteHexTile(hq.q, hq.r)) continue;
      const { x: cx, y: cy } = hexToWorld(hq.q, hq.r);
      const dx = h.x - cx;
      const dy = h.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      h.x = cx + (dx / len) * (edgeR + h.r);
      h.y = cy + (dy / len) * (edgeR + h.r);
    }
  }

  function triggerRouletteHexOuterCrossing() {
    state.roulettePhase = 1;
    state.rouletteScreenFlashUntil = state.elapsed + 0.4;
    triggerUltScreenShake(14, 0.22);
    damagePlayer(2, { rouletteHexOuterPenalty: true });
    ejectHuntersFromRouletteHexLock();
    state.rouletteOuterDamageAppliedKeys.add(hexKey(state.rouletteLockQ, state.rouletteLockR));
  }

  function drawRouletteHexWorld(ctx) {
    const cells = collectRouletteHexAxials();
    if (!cells.length) return;
    for (const { q, r } of cells) {
      const c = hexToWorld(q, r);
      const k = hexKey(q, r);
      let cellOuter = "rgba(59, 130, 246, 0.92)";
      if (state.proceduralRouletteSpentKeys.has(k)) cellOuter = "rgba(34, 197, 94, 0.92)";
      else if (isRouletteHexInteractive(q, r)) cellOuter = state.rouletteOuterDamageAppliedKeys.has(k) ? "rgba(59, 130, 246, 0.92)" : "rgba(249, 115, 22, 0.92)";
      strokePointyHexOutline(ctx, c.x, c.y, HEX_SIZE, cellOuter, 3.2, 18);
      fillPointyHexRainbowGlow(ctx, c.x, c.y, ROULETTE_INNER_HEX_DRAW_R, state.elapsed);
    }
  }

  function updateRouletteHex() {
    if (!state.running || state.pausedForCard || state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge) return;
    const ph = worldToHex(player.x, player.y);
    const prim = getPrimarySafehouseAxial();
    if (state.safehouseInnerFacilitiesUnlocked && prim && ph.q === prim.q && ph.r === prim.r) return;
    const inHex = isRouletteHexTile(ph.q, ph.r);
    if (!inHex) {
      state.rouletteWasInHex = false;
      state.roulettePhase = 0;
      state.rouletteForgeComplete = false;
      state.rouletteInnerExitLatch = false;
      return;
    }
    const rc = hexToWorld(ph.q, ph.r);
    const inInner = Math.hypot(player.x - rc.x, player.y - rc.y) <= ROULETTE_INNER_HIT_R;
    const enteredHexThisFrame = inHex && !state.rouletteWasInHex;
    if (enteredHexThisFrame && state.roulettePhase === 0 && isRouletteHexInteractive(ph.q, ph.r)) {
      state.rouletteLockQ = ph.q;
      state.rouletteLockR = ph.r;
      const rk = hexKey(ph.q, ph.r);
      if (state.rouletteOuterDamageAppliedKeys.has(rk)) {
        state.roulettePhase = 1;
        state.rouletteScreenFlashUntil = 0;
      } else triggerRouletteHexOuterCrossing();
    }
    state.rouletteWasInHex = true;
    if (state.roulettePhase === 1 && ph.q === state.rouletteLockQ && ph.r === state.rouletteLockR && inInner && !state.rouletteForgeComplete && !state.rouletteInnerExitLatch) {
      state.rouletteInnerExitLatch = true;
      openRouletteForgeModal();
    }
    if (!inInner) state.rouletteInnerExitLatch = false;
    if (state.roulettePhase === 2 && !state.proceduralRouletteKeys.has(hexKey(state.rouletteLockQ, state.rouletteLockR))) {
      markProceduralRouletteHexSpent(state.rouletteLockQ, state.rouletteLockR);
    }
  }
  function resetSafehouseEmbeddedProgress() {
    state.safehouseInnerFacilitiesUnlocked = false;
    state.safehouseEmbeddedRouletteComplete = false;
    state.safehouseEmbeddedForgeComplete = false;
    state.safehouseEmbedRevealAtMs = 0;
    state.forgeInnerExitLatch = false;
    state.safehouseLevelInnerLatch = false;
    state.safehouseAwaitingLeaveAfterLevelUp = false;
    state.safehouseLevelUpTileKey = "";
  }

  function markProceduralSafehouseHexSpent(q, r) {
    const k = hexKey(q, r);
    const isDev =
      escapeLocalDevHost && state.testWestKind === "safehouse" && q === state.testWestQ && r === state.testWestR;
    if (state.proceduralSafehouseKeys.has(k)) {
      state.proceduralSafehouseKeys.delete(k);
      state.proceduralSafehouseSpentKeys.add(k);
      resetSafehouseEmbeddedProgress();
      state.safehouseSpentTileAnim = { key: k, startMs: getNow() };
      notifyProceduralSpecialTileUsedForSpawnSchedule();
    } else if (isDev) {
      state.proceduralSafehouseSpentKeys.add(k);
      resetSafehouseEmbeddedProgress();
      state.safehouseSpentTileAnim = { key: k, startMs: getNow() };
      notifyProceduralSpecialTileUsedForSpawnSchedule();
    }
  }

  function resetSafehouseIfSafehouseHexEvicted(cacheKey) {
    const parts = cacheKey.split(",");
    if (parts.length !== 2) return;
    const q = Number(parts[0]);
    const r = Number(parts[1]);
    if (!Number.isFinite(q) || !Number.isFinite(r)) return;
    const k = hexKey(q, r);
    const isSafe =
      state.proceduralSafehouseKeys.has(k) ||
      state.proceduralSafehouseSpentKeys.has(k) ||
      (escapeLocalDevHost && state.testWestKind === "safehouse" && q === state.testWestQ && r === state.testWestR);
    if (!isSafe) return;
    const hadActiveSafe = state.proceduralSafehouseKeys.has(k);
    state.proceduralSafehouseKeys.delete(k);
    state.proceduralSafehouseSpentKeys.delete(k);
    state.safehouseLevelPromptShownKeys.delete(k);
    if (state.safehouseLevelUpTileKey === k) {
      state.safehouseAwaitingLeaveAfterLevelUp = false;
      state.safehouseLevelUpTileKey = "";
    }
    if (state.safehouseSpentTileAnim?.key === k) state.safehouseSpentTileAnim = null;
    resetSafehouseEmbeddedProgress();
    if (hadActiveSafe) notifyProceduralSpecialTileUnusedDespawned();
  }

  function collectSafehouseHexAxials() {
    const out = [];
    const seen = new Set();
    const add = (q, r) => {
      const kk = hexKey(q, r);
      if (seen.has(kk)) return;
      seen.add(kk);
      out.push({ q, r });
    };
    for (const k of state.proceduralSafehouseKeys) {
      const [q, r] = k.split(",").map(Number);
      add(q, r);
    }
    for (const k of state.proceduralSafehouseSpentKeys) {
      const [q, r] = k.split(",").map(Number);
      add(q, r);
    }
    if (escapeLocalDevHost && state.testWestKind === "safehouse") add(state.testWestQ, state.testWestR);
    return out;
  }

  function isSafehouseHexActiveTile(q, r) {
    const k = hexKey(q, r);
    if (state.proceduralSafehouseSpentKeys.has(k)) return false;
    if (state.proceduralSafehouseKeys.has(k)) return true;
    if (escapeLocalDevHost && state.testWestKind === "safehouse" && q === state.testWestQ && r === state.testWestR) return true;
    return false;
  }

  function isSafehouseHexSpentTile(q, r) {
    return state.proceduralSafehouseSpentKeys.has(hexKey(q, r));
  }

  function isSafehouseHexTile(q, r) {
    return isSafehouseHexActiveTile(q, r) || isSafehouseHexSpentTile(q, r);
  }

  function isWorldPointOnSafehouseBarrierDisk(x, y) {
    const h = worldToHex(x, y);
    if (!isSafehouseHexTile(h.q, h.r)) return false;
    const c = hexToWorld(h.q, h.r);
    return Math.hypot(x - c.x, y - c.y) <= HEX_SIZE + 4;
  }

  function clampHunterOutsideSafehouseDisks(h) {
    if (h.arenaNexusSpawn) return;
    const minPad = 3;
    const applyPush = (cx, cy) => {
      const dx = h.x - cx;
      const dy = h.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const minDist = HEX_SIZE + h.r + minPad;
      if (d < minDist) {
        h.x = cx + (dx / d) * minDist;
        h.y = cy + (dy / d) * minDist;
      }
    };
    for (const k of state.proceduralSafehouseKeys) {
      const [q, r] = k.split(",").map(Number);
      const c = hexToWorld(q, r);
      applyPush(c.x, c.y);
    }
    for (const k of state.proceduralSafehouseSpentKeys) {
      const [q, r] = k.split(",").map(Number);
      const c = hexToWorld(q, r);
      applyPush(c.x, c.y);
    }
    if (escapeLocalDevHost && state.testWestKind === "safehouse") {
      const c = hexToWorld(state.testWestQ, state.testWestR);
      applyPush(c.x, c.y);
    }
  }

  function getSafehouseEmbeddedRouletteWorld(prim) {
    const c = hexToWorld(prim.q, prim.r);
    const w = hexToWorld(prim.q + HEX_DIRS[3].q, prim.r + HEX_DIRS[3].r);
    const t = HEX_SIZE * SAFEHOUSE_EMBED_CENTER_INSET;
    const len = Math.hypot(w.x - c.x, w.y - c.y) || 1;
    return { x: c.x + ((w.x - c.x) / len) * t, y: c.y + ((w.y - c.y) / len) * t };
  }

  function getSafehouseEmbeddedForgeWorld(prim) {
    const c = hexToWorld(prim.q, prim.r);
    const e = hexToWorld(prim.q + HEX_DIRS[0].q, prim.r + HEX_DIRS[0].r);
    const t = HEX_SIZE * SAFEHOUSE_EMBED_CENTER_INSET;
    const len = Math.hypot(e.x - c.x, e.y - c.y) || 1;
    return { x: c.x + ((e.x - c.x) / len) * t, y: c.y + ((e.y - c.y) / len) * t };
  }

  function safehouseEmbeddedMiniVertexRadius() {
    return HEX_SIZE * SAFEHOUSE_EMBED_HEX_VERTEX_R_MULT;
  }

  function safehouseEmbedSiteHitR() {
    return Math.max(SAFEHOUSE_EMBED_SITE_HIT_R, safehouseEmbeddedMiniVertexRadius() * (SQRT3 / 2) * 1.08);
  }

  function getPrimarySafehouseAxial() {
    if (escapeLocalDevHost && state.testWestKind === "safehouse") {
      const k = hexKey(state.testWestQ, state.testWestR);
      if (!state.proceduralSafehouseSpentKeys.has(k)) return { q: state.testWestQ, r: state.testWestR };
    }
    for (const k of state.proceduralSafehouseKeys) {
      const [q, r] = k.split(",").map(Number);
      return { q, r };
    }
    return null;
  }

  function drawSafehouseHexWorld(ctx) {
    const cells = collectSafehouseHexAxials();
    if (!cells.length) return;
    const activePrim = getPrimarySafehouseAxial();
    const prim =
      !isLunatic() &&
      state.safehouseInnerFacilitiesUnlocked &&
      activePrim &&
      isSafehouseHexActiveTile(activePrim.q, activePrim.r)
        ? activePrim
        : null;
    for (const { q, r } of cells) {
      const c = hexToWorld(q, r);
      drawSafehouseHexCell(ctx, c.x, c.y, HEX_SIZE, state.elapsed);
      const kk = hexKey(q, r);
      if (state.proceduralSafehouseSpentKeys.has(kk)) {
        const fx = state.safehouseSpentTileAnim;
        let u = 1;
        if (fx && fx.key === kk) {
          const raw = (getNow() - fx.startMs) / SAFEHOUSE_SPENT_TILE_ANIM_MS;
          u = clamp(raw, 0, 1);
          u = u * u * (3 - 2 * u);
        }
        const overlayA = 0.72 * u;
        const rimA = 0.62 * Math.max(0, u - 0.12) * Math.min(1, (u - 0.12) / 0.55);
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI / 2 + (Math.PI / 3) * i;
          const x = c.x + Math.cos(a) * HEX_SIZE;
          const y = c.y + Math.sin(a) * HEX_SIZE;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        if (fx && fx.key === kk && u < 0.28) {
          const w = Math.sin((u / 0.28) * Math.PI);
          ctx.fillStyle = `rgba(254, 243, 199, ${0.1 * w})`;
          ctx.fill();
        }
        ctx.fillStyle = `rgba(15, 23, 42, ${overlayA})`;
        ctx.fill();
        if (rimA > 0.02) {
          ctx.strokeStyle = `rgba(51, 65, 85, ${rimA})`;
          ctx.lineWidth = 2.4 + 1.8 * Math.min(1, (u - 0.2) / 0.65);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (prim && prim.q === q && prim.r === r) {
        const rw = getSafehouseEmbeddedRouletteWorld(prim);
        const fw = getSafehouseEmbeddedForgeWorld(prim);
        const vr = safehouseEmbeddedMiniVertexRadius();
        drawSafehouseEmbeddedFacilities(ctx, {
          rouletteX: rw.x,
          rouletteY: rw.y,
          forgeX: fw.x,
          forgeY: fw.y,
          vertexRadius: vr,
          elapsed: state.elapsed,
          embeddedRouletteComplete: state.safehouseEmbeddedRouletteComplete,
          embeddedForgeComplete: state.safehouseEmbeddedForgeComplete,
        });
      }
    }
  }

  function tickSafehouseEmbedRevealFromWallClock() {
    if (isLunatic()) {
      state.safehouseEmbedRevealAtMs = 0;
      return;
    }
    if (state.safehouseEmbedRevealAtMs > 0 && getNow() >= state.safehouseEmbedRevealAtMs) {
      state.safehouseInnerFacilitiesUnlocked = true;
      state.safehouseEmbedRevealAtMs = 0;
    }
  }

  function tickSafehouseSpentTileAnimDone() {
    const fx = state.safehouseSpentTileAnim;
    if (!fx) return;
    if (getNow() - fx.startMs >= SAFEHOUSE_SPENT_TILE_ANIM_MS) {
      state.safehouseSpentTileAnim = null;
    }
  }

  function updateSafehouseSpendAfterLevelLeave() {
    if (!state.safehouseAwaitingLeaveAfterLevelUp || !state.safehouseLevelUpTileKey) return;
    const pk = state.safehouseLevelUpTileKey;
    const parts = pk.split(",");
    if (parts.length !== 2) {
      state.safehouseAwaitingLeaveAfterLevelUp = false;
      state.safehouseLevelUpTileKey = "";
      return;
    }
    const pq = Number(parts[0]);
    const pr = Number(parts[1]);
    if (!Number.isFinite(pq) || !Number.isFinite(pr)) {
      state.safehouseAwaitingLeaveAfterLevelUp = false;
      state.safehouseLevelUpTileKey = "";
      return;
    }
    const ph = worldToHex(player.x, player.y);
    if (ph.q === pq && ph.r === pr) return;
    markProceduralSafehouseHexSpent(pq, pr);
  }

  function clampPlayerOutOfSpentSafehouseCore() {
    const ph = worldToHex(player.x, player.y);
    if (!isSafehouseHexSpentTile(ph.q, ph.r)) return;
    const cc = hexToWorld(ph.q, ph.r);
    const dx = player.x - cc.x;
    const dy = player.y - cc.y;
    const d = Math.hypot(dx, dy) || 1;
    const minR = SAFEHOUSE_INNER_HIT_R + player.r * 0.25;
    if (d < minR && d > 1e-4) {
      player.x = cc.x + (dx / d) * minR;
      player.y = cc.y + (dy / d) * minR;
    }
  }

  function closeSafehouseLevelModal() {
    state.pausedForSafehousePrompt = false;
    if (safehouseLevelModal) safehouseLevelModal.hidden = true;
    state.keys.clear();
  }

  function openSafehouseLevelModal() {
    const prim = getPrimarySafehouseAxial();
    if (!prim || !isSafehouseHexActiveTile(prim.q, prim.r)) return;
    const k = hexKey(prim.q, prim.r);
    if (state.safehouseLevelPromptShownKeys.has(k)) return;
    if (!safehouseLevelModal || state.pausedForSafehousePrompt) return;
    state.safehouseLevelPromptShownKeys.add(k);
    state.pausedForSafehousePrompt = true;
    state.keys.clear();
    safehouseLevelModal.hidden = false;
  }

  function applySafehouseLevelUp() {
    state.runLevel += 1;
    state.spawnDifficultyAnchorSurvival = runClockEffectiveSec();
    state.spawnScheduled = [];
    state.spawnInterval = getSpawnIntervalFromRunTime();
    state.nextSpawnAt = state.elapsed + state.spawnInterval;
    runLog.event(logCodes.EVT_SAFEHOUSE_LEVEL_UP, "Safehouse level accepted", {
      runLevel: state.runLevel,
      innerFacilities: !isLunatic(),
    });
  }

  function updateSafehouseHex() {
    if (state.pausedForCard || state.pausedForRoulette || state.pausedForForge || state.pausedForSafehousePrompt) return;
    const prim = getPrimarySafehouseAxial();
    if (!prim || !isSafehouseHexActiveTile(prim.q, prim.r)) return;
    if (!safehouseLevelModal) return;
    const ph = worldToHex(player.x, player.y);
    const c = hexToWorld(prim.q, prim.r);
    const dist = Math.hypot(player.x - c.x, player.y - c.y);
    const inInner = ph.q === prim.q && ph.r === prim.r && dist <= SAFEHOUSE_INNER_HIT_R;
    if (!inInner) {
      state.safehouseLevelInnerLatch = false;
      return;
    }
    if (!state.safehouseLevelInnerLatch) {
      state.safehouseLevelInnerLatch = true;
      openSafehouseLevelModal();
    }
  }

  function onSafehouseLevelAccepted() {
    const prim = getPrimarySafehouseAxial();
    const tileK = prim ? hexKey(prim.q, prim.r) : "";
    closeSafehouseLevelModal();
    applySafehouseLevelUp();
    player.hp = player.maxHp;
    state.runLevelUpCinematic = { startMs: getNow(), announceLevel: displayWorldLevel() };
    if (!isLunatic()) state.safehouseEmbedRevealAtMs = getNow() + 830;
    if (tileK) {
      state.safehouseAwaitingLeaveAfterLevelUp = true;
      state.safehouseLevelUpTileKey = tileK;
    }
  }

  function onSafehouseLevelDeclined() {
    closeSafehouseLevelModal();
  }


  function readTestSpecialWestSelection() {
    if (!escapeLocalDevHost) return "na";
    const raw = String(specialTestWestSelect?.value ?? "na").toLowerCase();
    if (raw === "arena" || raw === "roulette" || raw === "surge" || raw === "safehouse") return raw;
    return "na";
  }

  function getProceduralSpecialSpawnWeight() {
    const e = state.elapsed;
    if (e < PROCEDURAL_SPECIAL_HEX_MIN_ELAPSED_SEC) return 0;
    if (e < state.specialSpawnCooldownUntil) return 0;
    if (state.specialSpawnHoldMaxRate) return SPECIAL_SPAWN_WEIGHT_END;
    const u = clamp((e - state.specialSpawnRateEpochStart) / SPECIAL_SPAWN_DECAY_SEC, 0, 1);
    return SPECIAL_SPAWN_WEIGHT_START + (SPECIAL_SPAWN_WEIGHT_END - SPECIAL_SPAWN_WEIGHT_START) * u;
  }

  function notifyProceduralSpecialTileUsedForSpawnSchedule() {
    state.specialSpawnCooldownUntil = state.elapsed + SPECIAL_SPAWN_COOLDOWN_SEC;
    state.specialSpawnHoldMaxRate = false;
    state.specialSpawnRateEpochStart = state.specialSpawnCooldownUntil;
  }

  function notifyProceduralSpecialTileUnusedDespawned() {
    state.specialSpawnCooldownUntil = state.elapsed + SPECIAL_SPAWN_COOLDOWN_SEC;
    state.specialSpawnHoldMaxRate = true;
  }

  function initSpecialHexTiles(spawnQ, spawnR) {
    const westQ = spawnQ + HEX_DIRS[3].q;
    const westR = spawnR + HEX_DIRS[3].r;
    state.testWestQ = westQ;
    state.testWestR = westR;
    const mode = readTestSpecialWestSelection();
    state.testWestKind =
      mode === "arena"
        ? "arena"
        : mode === "roulette"
          ? "roulette"
          : mode === "surge"
            ? "surge"
            : mode === "safehouse"
              ? "safehouse"
              : "none";

    state.proceduralArenaKeys.clear();
    state.proceduralRouletteKeys.clear();
    state.proceduralSurgeKeys.clear();
    state.proceduralSafehouseKeys.clear();
    state.proceduralSafehouseSpentKeys.clear();
    state.proceduralArenaSpentKeys.clear();
    state.proceduralRouletteSpentKeys.clear();
    state.proceduralSurgeSpentKeys.clear();
    state.rouletteOuterDamageAppliedKeys.clear();
    state.specialSpawnCooldownUntil = 0;
    state.specialSpawnHoldMaxRate = false;
    state.specialSpawnRateEpochStart = PROCEDURAL_SPECIAL_HEX_MIN_ELAPSED_SEC;
    state.arenaSiegeQ = spawnQ;
    state.arenaSiegeR = spawnR;
    state.arenaPhase = 0;
    state.arenaSiegeEndAt = 0;
    state.arenaNextLaserEnemyAt = 0;
    state.arenaNextSniperEnemyAt = 0;
    state.arenaCardRewardAt = 0;
    state.roulettePhase = 0;
    state.rouletteWasInHex = false;
    state.rouletteScreenFlashUntil = 0;
    state.rouletteForgeComplete = false;
    state.rouletteInnerExitLatch = false;
    state.pausedForRoulette = false;
    state.rouletteStep = null;
    state.rouletteSourceRef = null;
    state.rouletteSourceCardSnapshot = null;
    state.rouletteOptionA = null;
    state.rouletteOptionB = null;
    state.rouletteSpinShuffleUntil = 0;
    state.rouletteSpinRevealAt = 0;
    state.surgePhase = 0;
    state.surgeLockQ = 0;
    state.surgeLockR = 0;
    state.surgeWave = 1;
    state.surgeAwait = "travel";
    state.surgeTravelStartAt = 0;
    state.surgeTravelDur = SURGE_TRAVEL_DUR_FIRST;
    state.surgePauseEndAt = 0;
    state.surgeSafeX = 0;
    state.surgeSafeY = 0;
    state.surgePrevSafeX = 0;
    state.surgePrevSafeY = 0;
    state.surgeHasPrevSafeBubble = false;
    state.surgeWasInSurgeHex = false;
    state.surgeScreenFlashUntil = 0;
    state.surgeEligibleForInnerExitReward = false;
    state.surgeCardRewardAt = 0;
    state.rouletteLockQ = 0;
    state.rouletteLockR = 0;
    state.safehouseInnerFacilitiesUnlocked = false;
    state.safehouseEmbeddedRouletteComplete = false;
    state.safehouseEmbeddedForgeComplete = false;
    state.safehouseLevelPromptShownKeys.clear();
    state.safehouseEmbedRevealAtMs = 0;
    state.safehouseAwaitingLeaveAfterLevelUp = false;
    state.safehouseLevelUpTileKey = "";
    state.runLevelUpCinematic = null;
    state.safehouseSpentTileAnim = null;
  }

  function tryProceduralRareSpecialHex(q, r) {
    const w = getProceduralSpecialSpawnWeight();
    if (w <= 0) return;
    const k = hexKey(q, r);
    if (
      state.proceduralArenaKeys.has(k) ||
      state.proceduralRouletteKeys.has(k) ||
      state.proceduralSurgeKeys.has(k) ||
      state.proceduralSafehouseKeys.has(k) ||
      state.proceduralSafehouseSpentKeys.has(k) ||
      (escapeLocalDevHost && state.testWestQ === q && state.testWestR === r)
    ) {
      return;
    }
    const activeProceduralSpecials =
      state.proceduralArenaKeys.size +
      state.proceduralRouletteKeys.size +
      state.proceduralSurgeKeys.size +
      state.proceduralSafehouseKeys.size;
    if (activeProceduralSpecials >= 1) return;
    if (Math.random() >= w) return;
    state.proceduralArenaSpentKeys.delete(k);
    state.proceduralRouletteSpentKeys.delete(k);
    state.proceduralSurgeSpentKeys.delete(k);
    state.proceduralSafehouseSpentKeys.delete(k);
    const kindRoll = Math.random();
    const kind = isLunatic()
      ? "safehouse"
      : kindRoll < 0.25
        ? "arena"
        : kindRoll < 0.5
          ? "roulette"
          : kindRoll < 0.75
            ? "surge"
            : "safehouse";
    if (kind === "arena") state.proceduralArenaKeys.add(k);
    else if (kind === "roulette") state.proceduralRouletteKeys.add(k);
    else if (kind === "surge") state.proceduralSurgeKeys.add(k);
    else {
      state.proceduralSafehouseKeys.add(k);
      state.safehouseLevelPromptShownKeys.delete(k);
      resetSafehouseEmbeddedProgress();
    }
    runLog.event(logCodes.EVT_PROCEDURAL_SPECIAL_HEX, "Procedural special tile placed", { q, r, kind, spawnWeight: w });
  }

  return {
    getProceduralSpecialSpawnWeight,
    notifyProceduralSpecialTileUsedForSpawnSchedule,
    notifyProceduralSpecialTileUnusedDespawned,
    initSpecialHexTiles,
    tryProceduralRareSpecialHex,
    resetSafehouseEmbeddedProgress,
    markProceduralSafehouseHexSpent,
    resetSafehouseIfSafehouseHexEvicted,
    collectSafehouseHexAxials,
    isSafehouseHexActiveTile,
    isSafehouseHexSpentTile,
    isSafehouseHexTile,
    isWorldPointOnSafehouseBarrierDisk,
    clampHunterOutsideSafehouseDisks,
    getSafehouseEmbeddedRouletteWorld,
    getSafehouseEmbeddedForgeWorld,
    safehouseEmbeddedMiniVertexRadius,
    safehouseEmbedSiteHitR,
    drawSafehouseHexWorld,
    tickSafehouseEmbedRevealFromWallClock,
    tickSafehouseSpentTileAnimDone,
    updateSafehouseSpendAfterLevelLeave,
    clampPlayerOutOfSpentSafehouseCore,
    getPrimarySafehouseAxial,
    closeSafehouseLevelModal,
    openSafehouseLevelModal,
    applySafehouseLevelUp,
    updateSafehouseHex,
    onSafehouseLevelAccepted,
    onSafehouseLevelDeclined,
    isWorldPointOnSurgeLockBarrierTile,
    updateSurgeHex,
    drawSurgeHexWorld,
    pickSurgeSafeAndPulseFrom,
    beginSurgeTravelWave,
    surgeHitNow,
    beginSurgeOuterLock,
    beginSurgeGauntletActive,
    cleanupArenaNexusSiegeCombat,
    spawnArenaNexusRingLaserHunter,
    spawnArenaNexusRingSniperHunter,
    beginArenaNexusSiege,
    finishArenaNexusSiege,
    ejectHuntersFromArenaNexusDuringSiege,
    clampPlayerToArenaNexusInnerHex,
    updateArenaNexus,
    drawArenaNexusWorld,
    isWorldPointOnRouletteHexTile,
    ejectHuntersFromRouletteHexLock,
    triggerRouletteHexOuterCrossing,
    drawRouletteHexWorld,
    updateRouletteHex,
    ejectHuntersFromInteractiveSurgeHexesPreTrigger,
    ejectHuntersFromSurgeLockHex,
  };
}
