import {
  HEX_SIZE,
  BLOCK,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  CAMERA_FOLLOW_LERP,
  REFERENCE_TILE_W,
  PICKUP_SPAWN_INTERVAL,
  CARD_SPAWN_INTERVAL,
  HEAL_CRYSTAL_LIFETIME_SEC,
  CARD_COLLECTIBLE_LIFETIME_SEC,
  HEAL_CRYSTAL_HP,
  ROULETTE_OUTER_PENALTY_HP,
  FORGE_OUTER_PENALTY_HP,
  LASER_BLUE_PLAYER_SLOW_MULT,
  SURGE_TILE_FLASH_SEC,
  TERRAIN_SPEED_BOOST_LINGER,
} from "./balance.js";
import { referenceTileGridFromCanvasHeight } from "./WorldGeneration/tileGenerator.js";
import { attachArrowKeyState } from "./gameControls.js";
import { attachAbilityKeyPresses } from "./controls/abilityKeys.js";
import {
  createCharacterController,
  resolveImplementedHeroId,
} from "./Characters/index.js";
import { tryUseEquippedUltimate } from "./items/ultimateSlot.js";
import { syncAbilityBarDocument } from "./hud/abilityBar.js";
import { applyShellUiFromCharacter } from "./hud/shellUi.js";
import { mountCharacterRoster } from "./hud/characterRoster.js";
import { mountDevActiveHeroSelect } from "./hud/devHeroSelect.js";
import {
  axialToWorld,
  worldToAxial,
  HEX_DIRS,
  hexKey,
} from "./hexMath.js";
import { createGeneratedTilesManager } from "./WorldGeneration/generatedTiles.js";
import { createSpecialHexRuntime } from "./WorldGeneration/specialHexState.js";
import { generateHexTileObstacles } from "./tiles.js";
import {
  drawObstacles,
  fillPointyHexCell,
  drawPlayerBody,
  drawPlayerHpHud,
  drawKnightBurstAura,
  drawFrontShieldArc,
  drawArenaNexusHexWorld,
  drawSurgeHexWorld,
  drawSafehouseHexWorld,
  drawRunStatsHud,
  drawDecoy,
  drawHealPickup,
  drawCardPickupWorld,
} from "./draw.js";
import {
  HEAL_PICKUP_HIT_R,
  CARD_PICKUP_HIT_R,
  HEAL_PICKUP_PLUS_HALF,
  HEAL_PICKUP_ARM_THICK,
  CARD_PICKUP_REACH_EXTRA,
} from "./constants.js";
import { randRange } from "./rng.js";
import { randomOpenLootPoint } from "./collectibles/placement.js";
import { makePickupVisualPair } from "./items/cardUtils.js";
import { createEmptyInventory, collectReservedDeckKeys } from "./items/inventoryState.js";
import { makeRandomMapCard } from "./items/makeRandomCard.js";
import { getItemRulesForCharacter } from "./items/itemRulesRegistry.js";
import { countSuitsInActiveSlots } from "./items/setBonusPresentation.js";
import { createCardPickupModal } from "./items/cardPickupModal.js";
import { syncDeckSlotsFromInventory } from "./items/deckHudSync.js";
import { getModalSetBonusProgressLines } from "./items/setBonusPresentation.js";
import { createForgeHexFlow } from "./specials/forgeHexFlow.js";
import { createForgeWorldModal } from "./specials/forgeModal.js";
import { createRouletteHexFlow } from "./specials/rouletteHexFlow.js";
import { createRouletteModal } from "./specials/rouletteModal.js";
import { createSafehouseHexFlow } from "./specials/safehouseHexFlow.js";
import { createEventHexController } from "./WorldGeneration/eventTiles/eventController.js";
import { dropJokerRewardFromSpecialEvent } from "./items/jokerEventReward.js";
import { createHunterRuntime } from "./Hunters/hunterRuntime.js";
import { clamp, pointToSegmentDistance } from "./Hunters/hunterGeometry.js";
import { tickAttackRings, drawAttackRings, pushAttackRing } from "./fx/attackRings.js";
import { drawUltimateEffects } from "./fx/ultimateEffects.js";
import { createPlayerDamage } from "./playerDamage.js";
import { createRunLogger, instrumentObjectMethods } from "./debug/runLogger.js";

/** Procedural hex floor — near REFERENCE slate fill (`rgba(15,23,42,…)` family). */
const FLOOR_HEX_FILL = "#0f172a";

/** Until character select exists, default active hero id. */
let activeCharacterId = "knight";

/** REFERENCE `state.runLevel` — tier from accepted safehouse level-ups (slice: stays 0 → display 1). */
let runLevel = 0;

const BEST_SURVIVAL_LS_KEY = "escape-best-survival-sec";

function readBestSurvivalFromStorage() {
  try {
    const raw = localStorage.getItem(BEST_SURVIVAL_LS_KEY);
    const v = raw == null ? 0 : Number.parseFloat(raw);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  } catch {
    return 0;
  }
}

function circleRectMTV(cx, cy, r, b) {
  const apx = Math.max(b.x, Math.min(cx, b.x + b.w));
  const apy = Math.max(b.y, Math.min(cy, b.y + b.h));
  let dx = cx - apx;
  let dy = cy - apy;
  const d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return null;
  if (d2 < 1e-8) {
    const tcx = cx < b.x + b.w / 2 ? b.x : b.x + b.w;
    const tcy = cy < b.y + b.h / 2 ? b.y : b.y + b.h;
    dx = cx - tcx;
    dy = cy - tcy;
    const L = Math.hypot(dx, dy) || 1;
    return { dx: (dx / L) * r, dy: (dy / L) * r };
  }
  const L = Math.sqrt(d2);
  const pen = r - L;
  return { dx: (dx / L) * pen, dy: (dy / L) * pen };
}

function resolvePlayerAgainstRects(x, y, r, rects) {
  let px = x;
  let py = y;
  for (let iter = 0; iter < 6; iter++) {
    let any = false;
    for (const o of rects) {
      const m = circleRectMTV(px, py, r, o);
      if (m) {
        px += m.dx;
        py += m.dy;
        any = true;
      }
    }
    if (!any) break;
  }
  return { x: px, y: py };
}

/** REFERENCE `collidesAnyObstacle` for a circle — used by Knight dash raycast. */
function circleOverlapsAnyRect(cx, cy, r, rects) {
  for (const o of rects) {
    if (circleRectMTV(cx, cy, r, o)) return true;
  }
  return false;
}

function boot() {
  const runLogger = createRunLogger(30);
  mountCharacterRoster(document);

  const canvas = document.getElementById("game");
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    runLogger.error("entry", "#game canvas not found");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    runLogger.error("entry", "2d context unavailable");
    return;
  }

  const runLogLiveEl = document.getElementById("run-log-live");
  if (runLogLiveEl) runLogger.bindTextSink((text) => (runLogLiveEl.textContent = text));
  document.getElementById("run-log-print-console")?.addEventListener("click", () => {
    const text = runLogger.text();
    if (text) console.log(text);
  });
  document.getElementById("run-log-download-txt")?.addEventListener("click", () => {
    const blob = new Blob([runLogger.text()], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `escape-run-log-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  runLogger.log("entry", "boot");

  /** Declared early so west-test `change` / death callbacks never hit the TDZ on these bindings. */
  let hunterRuntime = /** @type {ReturnType<typeof createHunterRuntime> | null} */ (null);
  let hexEventRuntime = /** @type {ReturnType<typeof createEventHexController> | null} */ (null);

  /** Simulation clock in seconds — before tile/special managers so `getSimElapsed` is valid on first `ensureTilesForPlayer`. */
  let simElapsed = 0;

  const worldToHex = (x, y) => worldToAxial(x, y, HEX_SIZE);
  const hexToWorld = (q, r) => axialToWorld(q, r, HEX_SIZE);

  const specials = instrumentObjectMethods(createSpecialHexRuntime({
    HEX_DIRS,
    hexKey,
    getIsLunatic: () => activeCharacterId === "lunatic",
    getSimElapsed: () => simElapsed,
  }), "specials", runLogger);
  const safehouseHexFlow = instrumentObjectMethods(createSafehouseHexFlow(), "safehouse", runLogger);
  specials.setOnProceduralSafehousePlaced(() => safehouseHexFlow.onProceduralSafehousePlaced());
  const rouletteHexFlow = instrumentObjectMethods(createRouletteHexFlow({ hexKey }), "rouletteHex", runLogger);
  const forgeHexFlow = instrumentObjectMethods(createForgeHexFlow({ hexKey }), "forgeHex", runLogger);

  /** Set after `createRouletteModal` (tile eviction may close the modal). */
  let rouletteModal = /** @type {ReturnType<typeof createRouletteModal> | null} */ (null);
  let forgeWorldModal = /** @type {ReturnType<typeof createForgeWorldModal> | null} */ (null);

  const tileConfig = {
    BLOCK,
    hexSize: HEX_SIZE,
    ...referenceTileGridFromCanvasHeight(canvas.height),
  };

  const tiles = createGeneratedTilesManager({
    worldToHex,
    hexKey,
    hexToWorld,
    HEX_DIRS,
    generateHexTileObstacles,
    tileConfig,
    tryProceduralRareSpecialHex: (q, r) => specials.tryProceduralRareSpecialHex(q, r),
    isSpecialTile: (q, r) => specials.isSpecialTile(q, r),
    onTileEvicted: (key) => {
      safehouseHexFlow.onTileCacheEvicted(key, specials);
      specials.onTileEvicted(key);
      rouletteHexFlow.onTileCacheEvicted(key, () => rouletteModal?.closeUi());
      forgeHexFlow.onTileCacheEvicted(key, () => forgeWorldModal?.closeUi());
    },
    purgeProceduralSpecialAnchorsOutsideWindow: (neededKeys) =>
      specials.purgeProceduralSpecialAnchorsOutsideWindow(neededKeys),
  });

  const specialTestWestEl = document.getElementById("special-test-west-select");
  if (specialTestWestEl && "value" in specialTestWestEl) {
    specials.setTestWestKind(specialTestWestEl.value);
    specialTestWestEl.addEventListener("change", () => {
      specials.setTestWestKind(specialTestWestEl.value);
      rouletteHexFlow.resetSession();
      forgeHexFlow.resetSession();
      safehouseHexFlow.resetSession();
      hexEventRuntime?.reset();
      rouletteModal?.closeUi();
      forgeWorldModal?.closeUi();
      tiles.clearCache();
      obstacles = [];
      activeHexes = [];
      lastPlayerHexKey = "";
      ({ obstacles, activePlayerHex, activeHexes, lastPlayerHexKey } = tiles.ensureTilesForPlayer({
        player,
        obstacles,
        activePlayerHex,
        activeHexes,
        lastPlayerHexKey,
      }));
    });
  }

  const keys = attachArrowKeyState(window);
  const player = {
    x: 0,
    y: 0,
    r: PLAYER_RADIUS,
    facing: { x: 1, y: 0 },
    /** Speed multiplier from abilities (e.g. Knight burst). */
    speedBurstMult: 1,
    speedPassiveMult: 1,
    terrainTouchMult: 1,
    dodgeChanceWhenDashCd: 0,
    stunOnHitSecs: 0,
    frontShieldArcDeg: 0,
    hp: 1,
    maxHp: 1,
    /** Bonus HP shown as "+N temp" when greater than 0 (REFERENCE `H.tempHp`). */
    tempHp: 0,
    /** For sniper lead (REFERENCE `player.velX` / `velY`). */
    velX: 0,
    velY: 0,
    _px: 0,
    _py: 0,
  };

  let obstacles = [];
  let activeHexes = [];
  let lastPlayerHexKey = "";
  let activePlayerHex = { q: 0, r: 0 };
  ({ obstacles, activePlayerHex, activeHexes, lastPlayerHexKey } = tiles.ensureTilesForPlayer({
    player,
    obstacles,
    activePlayerHex,
    activeHexes,
    lastPlayerHexKey,
  }));

  activeCharacterId = resolveImplementedHeroId(activeCharacterId);
  let character = instrumentObjectMethods(createCharacterController(activeCharacterId), "character", runLogger, {
    skip: ["getAbilityHud"],
  });
  applyShellUiFromCharacter(document, character);

  function applyCombatFromCharacter() {
    const profile = character.getCombatProfile();
    player.maxHp = Math.max(1, profile.maxHp);
    player.hp = Math.min(player.maxHp, profile.startingHp ?? profile.maxHp);
    player.speedBurstMult = 1;
    player.speedPassiveMult = 1;
    player.terrainTouchMult = 1;
    player.dodgeChanceWhenDashCd = 0;
    player.stunOnHitSecs = 0;
    player.frontShieldArcDeg = 0;
    player.tempHp = 0;
    player.tempHpExpiry = 0;
  }
  applyCombatFromCharacter();

  /** @type {Array<{ kind: string, x: number, y: number, r: number, expiresAt: number } & Record<string, unknown>>} */
  const collectibles = [];
  /** REFERENCE `entities.attackRings` — ability impact rings. */
  const attackRings = [];
  /** Ace-ultimate world VFX. */
  const ultimateEffects = [];
  /** Orbiting shield state from Ace shield ultimate. */
  const ultimateShields = [];
  /** Delayed burst-wave timestamps. */
  const ultimateBurstWaves = [];
  let timelockEnemyFrom = 0;
  let timelockEnemyUntil = 0;
  let playerTimelockUntil = 0;
  let timelockWorldShakeAt = 0;
  let ultimateSpeedUntil = 0;
  let knightSpadesWorldSlowUntil = 0;
  let nextHealSpawnAt = 3.5;
  let nextCardSpawnAt = 10;
  const MAX_HEAL_CRYSTALS = 6;
  const MAX_CARD_PICKUPS = 4;

  const inventory = createEmptyInventory();
  inventory.clubsInvisUntil = 0;
  inventory.spadesLandingStealthUntil = 0;
  inventory.spadesObstacleBoostUntil = 0;
  inventory.heartsResistanceReadyAt = 0;
  inventory.heartsRegenPerSec = 0;
  inventory.heartsRegenBank = 0;

  /** When true, movement, pickups, specials, and hunters stop (REFERENCE `state.running === false`). */
  let runDead = false;

  /** REFERENCE `state.manualPause` — Space toggles; sim halts until movement or Q/W/E/R (Space alone does not resume). */
  let manualPause = false;

  /** After closing the card pickup modal, same pause as Space until movement or Q/W/E/R. */
  let handsResetPause = false;

  const deckRankSlotEls = Array.from({ length: 13 }, (_, i) => document.getElementById(`deck-slot-${i + 1}`));
  const backpackSlotEls = Array.from({ length: 3 }, (_, i) => document.getElementById(`backpack-slot-${i + 1}`));
  const setBonusStatusEl = document.getElementById("set-bonus-status");

  let bestSurvivalSec = readBestSurvivalFromStorage();

  const deathScreenEl = document.getElementById("death-screen");
  const deathStatSurvivalEl = document.getElementById("death-stat-survival");
  const deathStatLevelEl = document.getElementById("death-stat-level");
  const deathStatBestEl = document.getElementById("death-stat-best");
  const deathStatWaveEl = document.getElementById("death-stat-wave");
  const deathStatHuntersEl = document.getElementById("death-stat-hunters");

  function hideDeathScreen() {
    if (!deathScreenEl) return;
    deathScreenEl.hidden = true;
    deathScreenEl.setAttribute("aria-hidden", "true");
  }

  function showDeathScreen(/** @type {{ survival: number; displayLevel: number; wave: number; hunters: number; best: number }} */ stats) {
    if (deathStatSurvivalEl) deathStatSurvivalEl.textContent = `${stats.survival.toFixed(1)}s`;
    if (deathStatLevelEl) deathStatLevelEl.textContent = String(stats.displayLevel);
    if (deathStatBestEl) deathStatBestEl.textContent = `${stats.best.toFixed(1)}s`;
    if (deathStatWaveEl) deathStatWaveEl.textContent = String(stats.wave);
    if (deathStatHuntersEl) deathStatHuntersEl.textContent = String(stats.hunters);
    if (deathScreenEl) {
      deathScreenEl.hidden = false;
      deathScreenEl.setAttribute("aria-hidden", "false");
    }
  }

  const playerDamage = createPlayerDamage({
    getSimElapsed: () => simElapsed,
    getPlayer: () => player,
    inventory,
    getCharacterInvulnUntil: () => character.getInvulnUntil(),
    isDashCoolingDown: () => (typeof character.isDashCoolingDown === "function" ? character.isDashCoolingDown(simElapsed) : false),
    stunNearbyEnemies: (secs) => {
      if (!hunterRuntime) return;
      for (const h of hunterRuntime.entities.hunters) {
        const dx = h.x - player.x;
        const dy = h.y - player.y;
        if (dx * dx + dy * dy <= 220 * 220) h.stunnedUntil = Math.max(h.stunnedUntil || 0, simElapsed + secs);
      }
    },
    onPlayerDeath: () => {
      manualPause = false;
      handsResetPause = false;
      runDead = true;
      const survival = simElapsed;
      bestSurvivalSec = Math.max(bestSurvivalSec, survival);
      try {
        localStorage.setItem(BEST_SURVIVAL_LS_KEY, String(bestSurvivalSec));
      } catch {
        /* ignore quota / private mode */
      }
      const wave = hunterRuntime?.spawnState?.wave ?? 0;
      const hunters = hunterRuntime?.entities?.hunters?.length ?? 0;
      showDeathScreen({
        survival,
        displayLevel: runLevel + 1,
        wave,
        hunters,
        best: bestSurvivalSec,
      });
      attackRings.length = 0;
    },
  });

  /** @type {ReturnType<typeof createCardPickupModal> | null} */
  let cardPickup = null;
  function modalChromePausesWorld() {
    return (
      (cardPickup?.isPaused() ?? false) ||
      (rouletteModal?.isPaused() ?? false) ||
      (forgeWorldModal?.isForgePaused() ?? false) ||
      safehouseHexFlow.isPausedForSafehousePrompt()
    );
  }

  /** Simulation time advances (REFERENCE: elapsed keeps ticking during sanctuary Yes/No). */
  function simClockPaused() {
    return manualPause || handsResetPause || (cardPickup?.isPaused() ?? false) ||
      (rouletteModal?.isPaused() ?? false) ||
      (forgeWorldModal?.isForgePaused() ?? false);
  }

  function isWorldPaused() {
    return manualPause || handsResetPause || modalChromePausesWorld();
  }

  function syncDeckHud() {
    syncDeckSlotsFromInventory(
      deckRankSlotEls,
      backpackSlotEls,
      inventory,
      cardPickup?.getPendingCard() ?? null,
      getItemRulesForCharacter(activeCharacterId),
      forgeWorldModal?.isForgePaused() ?? false,
    );
    if (setBonusStatusEl) {
      const lines = getModalSetBonusProgressLines(inventory, cardPickup?.getPendingCard() ?? null, getItemRulesForCharacter(activeCharacterId));
      setBonusStatusEl.textContent = lines.length ? lines.join("\n") : "";
    }
  }

  function switchActiveCharacter(id) {
    if (id === activeCharacterId) return;
    hideDeathScreen();
    activeCharacterId = id;
    character = instrumentObjectMethods(createCharacterController(id), "character", runLogger, {
      skip: ["getAbilityHud"],
    });
    applyShellUiFromCharacter(document, character);
    applyCombatFromCharacter();
    runDead = false;
    manualPause = false;
    handsResetPause = false;
    playerDamage.resetCombatState();
    player.x = 0;
    player.y = 0;
    player._px = 0;
    player._py = 0;
    player.speedBurstMult = 1;
    inventory.aceUltimateReadyAt = 0;
    ultimateEffects.length = 0;
    ultimateShields.length = 0;
    ultimateBurstWaves.length = 0;
    timelockEnemyFrom = 0;
    timelockEnemyUntil = 0;
    playerTimelockUntil = 0;
    timelockWorldShakeAt = 0;
    ultimateSpeedUntil = 0;
    knightSpadesWorldSlowUntil = 0;
    specials.resetSessionState();
    safehouseHexFlow.resetSession();
    runLevel = 0;
    if (specialTestWestEl && "value" in specialTestWestEl) {
      specials.setTestWestKind(specialTestWestEl.value);
    }
    tiles.clearCache();
    obstacles = [];
    activeHexes = [];
    lastPlayerHexKey = "";
    activePlayerHex = { q: 0, r: 0 };
    ({ obstacles, activePlayerHex, activeHexes, lastPlayerHexKey } = tiles.ensureTilesForPlayer({
      player,
      obstacles,
      activePlayerHex,
      activeHexes,
      lastPlayerHexKey,
    }));
    snapCameraToPlayer();
    collectibles.length = 0;
    attackRings.length = 0;
    nextHealSpawnAt = simElapsed + 2;
    nextCardSpawnAt = simElapsed + 4;
    cardPickup?.resetAll();
    rouletteHexFlow.resetSession();
    forgeHexFlow.resetSession();
    rouletteModal?.closeUi();
    forgeWorldModal?.closeUi();
    hunterRuntime.reset();
    hexEventRuntime?.reset();
    syncDeckHud();
  }

  const devHeroSelect = mountDevActiveHeroSelect(document, {
    initialId: activeCharacterId,
    onSelect: switchActiveCharacter,
  });

  cardPickup = instrumentObjectMethods(createCardPickupModal({
    cardModal: document.getElementById("card-modal"),
    cardModalFace: document.getElementById("card-modal-face"),
    modalDeckStripEl: document.getElementById("modal-deck-strip"),
    cardSwapRow: document.getElementById("card-swap-row"),
    modalSetBonusStatusEl: document.getElementById("modal-set-bonus-status"),
    cardCloseButton: document.getElementById("card-close-button"),
    inventory,
    getItemRules: () => getItemRulesForCharacter(activeCharacterId),
    syncDeckSlots: syncDeckHud,
    onPausedChange: (paused) => {
      if (paused) {
        handsResetPause = false;
        return;
      }
      if (runDead) return;
      handsResetPause = true;
      keys.clearHeld();
    },
  }), "cardModal", runLogger);
  syncDeckHud();

  rouletteModal = instrumentObjectMethods(createRouletteModal({
    doc: document,
    inventory,
    getItemRules: () => getItemRulesForCharacter(activeCharacterId),
    getPendingCard: () => cardPickup?.getPendingCard() ?? null,
    getWorldCardPickups: () =>
      collectibles.filter((x) => x.kind === "card").map((x) => ({ card: x.card })),
    syncDeckSlots: syncDeckHud,
    onPausedChange: () => {},
  }), "rouletteModal", runLogger);

  forgeWorldModal = instrumentObjectMethods(createForgeWorldModal({
    doc: document,
    inventory,
    getItemRules: () => getItemRulesForCharacter(activeCharacterId),
    syncDeckSlots: syncDeckHud,
    getOpenCardPickup: () => (card) => cardPickup?.openCardPickup(card),
    onPausedChange: () => {},
  }), "forgeModal", runLogger);

  const safehouseLevelModalEl = document.getElementById("safehouse-level-modal");
  const safehouseLevelYesBtn = document.getElementById("safehouse-level-yes");
  const safehouseLevelNoBtn = document.getElementById("safehouse-level-no");
  if (safehouseLevelYesBtn) {
    safehouseLevelYesBtn.addEventListener("click", () => {
      safehouseHexFlow.closeLevelModal(safehouseLevelModalEl, () => keys.clearHeld());
      safehouseHexFlow.applyLevelUpAccepted({
        onRunLevelIncrement: () => {
          runLevel += 1;
        },
        onSpawnAnchorResetToDifficultyClock: (eff) => {
          hunterRuntime?.softResetSpawnPacingAfterSafehouseLevel(eff);
        },
        healPlayerToMax: () => {
          player.hp = player.maxHp;
        },
        getIsLunatic: () => activeCharacterId === "lunatic",
        getPrimarySafehouseAxial: () => specials.getPrimarySafehouseAxial(),
        getSimElapsed: () => simElapsed,
      });
    });
  }
  if (safehouseLevelNoBtn) {
    safehouseLevelNoBtn.addEventListener("click", () => {
      safehouseHexFlow.closeLevelModal(safehouseLevelModalEl, () => keys.clearHeld());
    });
  }

  function isWorldPointOnRouletteHexTile(x, y) {
    const h = worldToHex(x, y);
    if (!specials.isRouletteHexTile(h.q, h.r)) return false;
    const c = hexToWorld(h.q, h.r);
    return Math.hypot(x - c.x, y - c.y) <= HEX_SIZE + 4;
  }

  function isWorldPointOnSafehouseBarrierDisk(x, y) {
    const h = worldToHex(x, y);
    if (!specials.isSafehouseHexTile(h.q, h.r)) return false;
    const c = hexToWorld(h.q, h.r);
    return Math.hypot(x - c.x, y - c.y) <= HEX_SIZE + 4;
  }

  function isWorldPointOnSpecialSpawnerForbiddenHex(x, y) {
    if (isWorldPointOnSafehouseBarrierDisk(x, y)) return true;
    if (isWorldPointOnRouletteHexTile(x, y)) return true;
    const fh = worldToHex(x, y);
    if (specials.isForgeHexTile(fh.q, fh.r)) {
      const fc = hexToWorld(fh.q, fh.r);
      if (Math.hypot(x - fc.x, y - fc.y) <= HEX_SIZE + 4) return true;
    }
    const h = worldToHex(x, y);
    if (!specials.isArenaHexTile(h.q, h.r) && !specials.isSurgeHexTile(h.q, h.r)) return false;
    const c = hexToWorld(h.q, h.r);
    return Math.hypot(x - c.x, y - c.y) <= HEX_SIZE + 4;
  }

  function ejectSpawnerHunterFromSpecialHexFootprint(h) {
    if (h.type !== "spawner" && h.type !== "airSpawner") return;
    if (!isWorldPointOnSpecialSpawnerForbiddenHex(h.x, h.y)) return;
    const hq = worldToHex(h.x, h.y);
    const c = hexToWorld(hq.q, hq.r);
    const pad = 8;
    const targetR = HEX_SIZE + h.r + pad;
    const dx = h.x - c.x;
    const dy = h.y - c.y;
    const d = Math.hypot(dx, dy);
    if (d < 1e-3) {
      const ang = Math.random() * Math.PI * 2;
      h.x = c.x + Math.cos(ang) * targetR;
      h.y = c.y + Math.sin(ang) * targetR;
      return;
    }
    h.x = c.x + (dx / d) * targetR;
    h.y = c.y + (dy / d) * targetR;
  }

  function clampHunterOutsideSafehouseDisk(h) {
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
    specials.forEachSafehouseBarrierHex((q, r) => {
      const c = hexToWorld(q, r);
      applyPush(c.x, c.y);
    });
  }

  let pendingRouletteOutcomeIsEmbedded = false;
  let pendingForgeOutcomeIsEmbedded = false;

  function specialsSimUnpaused() {
    return (
      !runDead &&
      !(cardPickup?.isPaused() ?? false) &&
      !(rouletteModal?.isPaused() ?? false) &&
      !(forgeWorldModal?.isForgePaused() ?? false)
    );
  }

  function hitDecoyIfAny(source, range) {
    const ds = character.getDecoys();
    const now = simElapsed;
    for (let i = ds.length - 1; i >= 0; i--) {
      const d = ds[i];
      const rr = range + d.r;
      const dx = source.x - d.x;
      const dy = source.y - d.y;
      if (dx * dx + dy * dy <= rr * rr) {
        if (now < (d.invulnerableUntil ?? 0)) return true;
        d.hp = Math.max(0, (d.hp ?? 1) - 1);
        if (d.hp <= 0) ds.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  function hitDecoyAlongSegment(x1, y1, x2, y2, extraRadius) {
    const ds = character.getDecoys();
    const now = simElapsed;
    for (let i = ds.length - 1; i >= 0; i--) {
      const d = ds[i];
      if (pointToSegmentDistance(d.x, d.y, x1, y1, x2, y2) <= d.r + extraRadius) {
        if (now < (d.invulnerableUntil ?? 0)) return true;
        d.hp = Math.max(0, (d.hp ?? 1) - 1);
        if (d.hp <= 0) ds.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  hunterRuntime = instrumentObjectMethods(createHunterRuntime({
    getSimElapsed: () => simElapsed,
    getPlayer: () => player,
    getObstacles: () => obstacles,
    getDecoys: () => character.getDecoys(),
    getCharacterId: () => activeCharacterId,
    rand: randRange,
    getViewSize: () => ({ w: canvas.width, h: canvas.height }),
    damagePlayer: (amt, opts) => playerDamage.damagePlayer(amt, opts),
    hitDecoyIfAny,
    hitDecoyAlongSegment,
    worldToHex,
    hexToWorld,
    isArenaHexTile: (q, r) => specials.isArenaHexTile(q, r),
    isWorldPointOnSurgeLockBarrierTile: (x, y) =>
      hexEventRuntime?.isSurgeLockBarrierWorldPoint?.(x, y) ?? false,
    isWorldPointOnSpecialSpawnerForbiddenHex,
    ejectSpawnerHunterFromSpecialHexFootprint,
    getDifficultyClockSec: () => safehouseHexFlow.getDifficultyClockSec(simElapsed),
    getRunLevel: () => runLevel,
    isWorldPointOnSafehouseBarrierDisk,
    clampHunterOutsideSafehouseDisk,
    isWorldPointOnForgeRouletteBarrierTile: (x, y) =>
      (rouletteHexFlow?.isOuterBarrierWorldPoint?.(
        x,
        y,
        worldToHex,
        hexToWorld,
        (q, r) => specials.isRouletteHexInteractive(q, r),
      ) ?? false) ||
      (forgeHexFlow?.isOuterBarrierWorldPoint?.(
        x,
        y,
        worldToHex,
        hexToWorld,
        (q, r) => specials.isForgeHexInteractive(q, r),
      ) ?? false),
  }), "hunters", runLogger, { skip: ["draw", "tick"] });
  hunterRuntime.reset();

  hexEventRuntime = instrumentObjectMethods(createEventHexController({
    getSimElapsed: () => simElapsed,
    getPlayer: () => player,
    worldToHex,
    hexToWorld,
    specialsUnpaused: specialsSimUnpaused,
    getRunDead: () => runDead,
    isArenaHexTile: (q, r) => specials.isArenaHexTile(q, r),
    isArenaHexInteractive: (q, r) => specials.isArenaHexInteractive(q, r),
    markProceduralArenaHexSpent: (q, r) => specials.markProceduralArenaHexSpent(q, r),
    isSurgeHexTile: (q, r) => specials.isSurgeHexTile(q, r),
    isSurgeHexInteractive: (q, r) => specials.isSurgeHexInteractive(q, r),
    markProceduralSurgeHexSpent: (q, r) => specials.markProceduralSurgeHexSpent(q, r),
    damagePlayer: (amt, opts) => playerDamage.damagePlayer(amt, opts),
    bumpScreenShake: (s, sec) => playerDamage.bumpScreenShake(s, sec),
    dropSpecialEventJokerReward: () =>
      dropJokerRewardFromSpecialEvent({
        getCharacterId: () => activeCharacterId,
        openCardPickup: (card) => cardPickup?.openCardPickup(card),
      }),
    spawnHunter: (type, x, y, opts) => hunterRuntime.spawnHunter(type, x, y, opts),
    killHuntersOnSurgeHex: (q, r) => hunterRuntime.killHuntersStandingOnSurgeHex(q, r),
    cleanupArenaNexusSiegeCombat: () => hunterRuntime.cleanupArenaNexusSiegeCombat(),
    clampArenaNexusDefendersOnRing: (cx, cy) => hunterRuntime.clampArenaNexusDefendersOnRing(cx, cy),
    ejectHuntersFromArenaNexusDuringSiege: (cx, cy) => hunterRuntime.ejectHuntersFromArenaNexusDuringSiege(cx, cy),
    ejectHuntersFromSurgeLockHex: (lq, lr, sp) => hunterRuntime.ejectHuntersFromSurgeLockHex(lq, lr, sp),
    isCardPickupPaused: () => cardPickup?.isPaused() ?? false,
  }), "events", runLogger, { skip: ["tick", "postHunterTick", "getArenaDrawState", "getSurgeDrawState"] });

  function restartRunAfterDeath() {
    if (!runDead || !hunterRuntime) return;
    hideDeathScreen();
    runDead = false;
    manualPause = false;
    handsResetPause = false;
    simElapsed = 0;
    character = instrumentObjectMethods(createCharacterController(activeCharacterId), "character", runLogger, {
      skip: ["getAbilityHud"],
    });
    applyShellUiFromCharacter(document, character);
    applyCombatFromCharacter();
    playerDamage.resetCombatState();
    player.x = 0;
    player.y = 0;
    player._px = 0;
    player._py = 0;
    player.velX = 0;
    player.velY = 0;
    player.speedBurstMult = 1;
    for (let r = 1; r <= 13; r++) {
      inventory.deckByRank[r] = null;
    }
    inventory.backpackSlots[0] = null;
    inventory.backpackSlots[1] = null;
    inventory.backpackSlots[2] = null;
    inventory.clubsInvisUntil = 0;
    inventory.spadesLandingStealthUntil = 0;
    inventory.spadesObstacleBoostUntil = 0;
    inventory.heartsResistanceReadyAt = 0;
    inventory.heartsRegenPerSec = 0;
    inventory.heartsRegenBank = 0;
    inventory.aceUltimateReadyAt = 0;
    ultimateEffects.length = 0;
    ultimateShields.length = 0;
    ultimateBurstWaves.length = 0;
    timelockEnemyFrom = 0;
    timelockEnemyUntil = 0;
    playerTimelockUntil = 0;
    timelockWorldShakeAt = 0;
    ultimateSpeedUntil = 0;
    knightSpadesWorldSlowUntil = 0;
    specials.resetSessionState();
    safehouseHexFlow.resetSession();
    runLevel = 0;
    if (specialTestWestEl && "value" in specialTestWestEl) {
      specials.setTestWestKind(specialTestWestEl.value);
    }
    tiles.clearCache();
    obstacles = [];
    activeHexes = [];
    lastPlayerHexKey = "";
    activePlayerHex = { q: 0, r: 0 };
    ({ obstacles, activePlayerHex, activeHexes, lastPlayerHexKey } = tiles.ensureTilesForPlayer({
      player,
      obstacles,
      activePlayerHex,
      activeHexes,
      lastPlayerHexKey,
    }));
    collectibles.length = 0;
    attackRings.length = 0;
    nextHealSpawnAt = simElapsed + 2;
    nextCardSpawnAt = simElapsed + 4;
    cardPickup?.resetAll();
    rouletteHexFlow.resetSession();
    forgeHexFlow.resetSession();
    rouletteModal?.closeUi();
    forgeWorldModal?.closeUi();
    hunterRuntime.reset();
    hexEventRuntime?.reset();
    syncDeckHud();
    snapCameraToPlayer();
  }

  /** @param {KeyboardEvent} e */
  function onDeathRetryKeydown(e) {
    if (!runDead) return;
    if (e.key !== "Enter") return;
    if (e.repeat) return;
    e.preventDefault();
    restartRunAfterDeath();
  }
  window.addEventListener("keydown", onDeathRetryKeydown);

  const RESUME_KEYS = new Set(["q", "w", "e", "r", "arrowup", "arrowdown", "arrowleft", "arrowright"]);

  function isCharacterSelectModalOpen() {
    return document.getElementById("character-select-modal")?.classList.contains("open") ?? false;
  }

  function pauseKeyRoutingBlocked(ev) {
    const t = ev.target;
    if (t instanceof Element && t.closest("input, textarea, select, button, [contenteditable=true]")) return true;
    if (isCharacterSelectModalOpen()) return true;
    return false;
  }

  /** Runs before ability keys so Space can pause without scrolling; resume matches REFERENCE (not Space). */
  function onManualPauseKeydown(ev) {
    if (ev.repeat) return;
    if (pauseKeyRoutingBlocked(ev)) return;
    const key = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key.toLowerCase();

    if (manualPause || handsResetPause) {
      if (!RESUME_KEYS.has(key)) {
        if (key === " ") ev.preventDefault();
        return;
      }
      manualPause = false;
      handsResetPause = false;
      keys.clearHeld();
      return;
    }

    if (key === " " && !runDead && !modalChromePausesWorld()) {
      manualPause = true;
      keys.clearHeld();
      ev.preventDefault();
      ev.stopImmediatePropagation();
    }
  }
  window.addEventListener("keydown", onManualPauseKeydown);

  const dangerRampFillEl = document.getElementById("danger-ramp-fill");

  const devHuntersEl = document.getElementById("dev-hunters-enabled");
  let huntersEnabled = true;
  const HUNTERS_LS_KEY = "escape-dev-hunters-enabled";
  if (devHuntersEl && "checked" in devHuntersEl) {
    const saved = localStorage.getItem(HUNTERS_LS_KEY);
    if (saved != null) devHuntersEl.checked = saved !== "0";
    huntersEnabled = devHuntersEl.checked;
    devHuntersEl.addEventListener("change", () => {
      huntersEnabled = devHuntersEl.checked;
      localStorage.setItem(HUNTERS_LS_KEY, huntersEnabled ? "1" : "0");
      hunterRuntime.reset();
    });
  }

  const debugItemSuitEl = document.getElementById("debug-item-suit");
  const debugItemRankEl = document.getElementById("debug-item-rank");
  const debugItemEffectEl = document.getElementById("debug-item-effect");
  const debugItemDropBtn = document.getElementById("debug-item-drop-button");

  /**
   * @param {string} suit
   * @param {number} rank
   * @returns {Array<{ id: string; label: string; effect: object; effectBorrowedSuit?: string }>}
   */
  function debugEffectOptions(suit, rank) {
    const opts = [];
    const add = (id, label, effect, effectBorrowedSuit) => opts.push({ id, label, effect, effectBorrowedSuit });
    const addDefaultBySuit = (srcSuit) => {
      if (rank === 1) {
        add(`${srcSuit}:ult:shield`, `${srcSuit} ultimate: shield`, { kind: "ultimate", ultType: "shield" }, srcSuit);
        add(`${srcSuit}:ult:burst`, `${srcSuit} ultimate: burst`, { kind: "ultimate", ultType: "burst" }, srcSuit);
        add(`${srcSuit}:ult:timelock`, `${srcSuit} ultimate: timelock`, { kind: "ultimate", ultType: "timelock" }, srcSuit);
        add(`${srcSuit}:ult:heal`, `${srcSuit} ultimate: heal`, { kind: "ultimate", ultType: "heal" }, srcSuit);
        return;
      }
      if (srcSuit === "diamonds") {
        add(`diamonds:cd:dash`, "diamonds cooldown -> dash", { kind: "cooldown", target: "dash", value: 0.1 * rank }, srcSuit);
        add(`diamonds:cd:burst`, "diamonds cooldown -> burst", { kind: "cooldown", target: "burst", value: 0.1 * rank }, srcSuit);
        add(`diamonds:cd:decoy`, "diamonds cooldown -> decoy", { kind: "cooldown", target: "decoy", value: 0.1 * rank }, srcSuit);
        return;
      }
      if (srcSuit === "hearts") {
        if (rank >= 11) add(`hearts:frontShield`, "hearts front shield arc", { kind: "frontShield", arc: 28 + rank * 4 }, srcSuit);
        add(`hearts:maxHp`, "hearts max HP", { kind: "maxHp", value: Math.ceil(rank * 0.5) }, srcSuit);
        add(`hearts:hitResist`, "hearts hit resist", { kind: "hitResist", cooldown: Math.max(3, 15 - 0.5 * rank) }, srcSuit);
        return;
      }
      if (srcSuit === "clubs") {
        add(`clubs:dodge`, "clubs dodge", { kind: "dodge", value: (5 + 0.1 * rank) / 100 }, srcSuit);
        add(`clubs:stun`, "clubs stun", { kind: "stun", value: 0.2 * rank }, srcSuit);
        add(`clubs:invisBurst`, "clubs invis on burst", { kind: "invisBurst", value: 0.1 * rank }, srcSuit);
        return;
      }
      if (srcSuit === "spades") {
        if (rank >= 11) add(`spades:dashCharge`, "spades dash charge", { kind: "dashCharge", value: 1 }, srcSuit);
        add(`spades:speed`, "spades speed", { kind: "speed", value: Math.min(0.18, 0.018 * rank) }, srcSuit);
        add(`spades:terrainBoost`, "spades terrain boost", { kind: "terrainBoost", value: Math.min(0.36, 0.036 * rank) }, srcSuit);
      }
    };

    if (suit === "joker") {
      addDefaultBySuit("diamonds");
      addDefaultBySuit("hearts");
      addDefaultBySuit("clubs");
      addDefaultBySuit("spades");
    } else {
      addDefaultBySuit(suit);
    }
    return opts;
  }

  function refreshDebugItemEffectOptions() {
    if (!debugItemSuitEl || !debugItemRankEl || !debugItemEffectEl) return;
    const suit = String(debugItemSuitEl.value || "diamonds");
    const rank = Number.parseInt(String(debugItemRankEl.value || "1"), 10) || 1;
    const options = debugEffectOptions(suit, rank);
    debugItemEffectEl.innerHTML = "";
    const randomOpt = document.createElement("option");
    randomOpt.value = "__random__";
    randomOpt.textContent = "Random";
    debugItemEffectEl.appendChild(randomOpt);
    for (const o of options) {
      const opt = document.createElement("option");
      opt.value = o.id;
      opt.textContent = o.label;
      debugItemEffectEl.appendChild(opt);
    }
    debugItemEffectEl.value = "__random__";
    const wrap = debugItemEffectEl.closest(".dev-item-row");
    if (wrap) wrap.style.display = options.length > 1 ? "" : "none";
  }

  if (debugItemRankEl) {
    const rankLabels = [
      { v: 1, t: "A" },
      { v: 2, t: "2" },
      { v: 3, t: "3" },
      { v: 4, t: "4" },
      { v: 5, t: "5" },
      { v: 6, t: "6" },
      { v: 7, t: "7" },
      { v: 8, t: "8" },
      { v: 9, t: "9" },
      { v: 10, t: "10" },
      { v: 11, t: "J" },
      { v: 12, t: "Q" },
      { v: 13, t: "K" },
    ];
    for (const r of rankLabels) {
      const opt = document.createElement("option");
      opt.value = String(r.v);
      opt.textContent = r.t;
      debugItemRankEl.appendChild(opt);
    }
    debugItemRankEl.value = "1";
  }
  debugItemSuitEl?.addEventListener("change", refreshDebugItemEffectOptions);
  debugItemRankEl?.addEventListener("change", refreshDebugItemEffectOptions);
  refreshDebugItemEffectOptions();

  debugItemDropBtn?.addEventListener("click", () => {
    if (!debugItemSuitEl || !debugItemRankEl || !debugItemEffectEl) return;
    const suit = String(debugItemSuitEl.value || "diamonds");
    const rank = Number.parseInt(String(debugItemRankEl.value || "1"), 10) || 1;
    const options = debugEffectOptions(suit, rank);
    const selectedId = String(debugItemEffectEl.value || "__random__");
    const chosen =
      selectedId === "__random__"
        ? options[Math.floor(Math.random() * options.length)]
        : (options.find((o) => o.id === selectedId) ?? options[Math.floor(Math.random() * options.length)]);
    if (!chosen) return;
    const card = {
      id: `debug-drop-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      suit,
      rank,
      effect: chosen.effect,
      ...(suit === "joker" ? { effectBorrowedSuit: chosen.effectBorrowedSuit ?? "spades" } : {}),
    };
    const visuals = makePickupVisualPair(card);
    collectibles.push({
      kind: "card",
      x: player.x - 96,
      y: player.y,
      r: CARD_PICKUP_HIT_R,
      card,
      ...visuals,
      bornAt: simElapsed,
      expiresAt: simElapsed + CARD_COLLECTIBLE_LIFETIME_SEC,
    });
    runLogger.log("debug", "spawned item drop", {
      suit: card.suit,
      rank: card.rank,
      effect: card.effect?.kind ?? "unknown",
    });
  });

  function buildAbilityContext(dt) {
    return {
      player,
      elapsed: simElapsed,
      dt,
      obstacles,
      inventory,
      resolvePlayer: (x, y, r) => resolvePlayerAgainstRects(x, y, r, obstacles),
      circleHitsObstacle: (x, y, r) => circleOverlapsAnyRect(x, y, r, obstacles),
      spawnAttackRing: (x, y, r, color, durationSec) => {
        pushAttackRing(attackRings, x, y, r, color, simElapsed, durationSec);
      },
      spawnUltimateEffect: (type, x, y, color, durationSec, radius, opts = {}) => {
        const bornAt = opts.bornAt ?? simElapsed;
        const expiresAt = opts.expiresAt ?? bornAt + durationSec;
        ultimateEffects.push({ type, x, y, color, bornAt, expiresAt, radius });
      },
      setUltimateShields: (bornAt, radius) => {
        ultimateShields.length = 0;
        for (let i = 0; i < 4; i++) {
          ultimateShields.push({
            angle: (Math.PI * 2 * i) / 4,
            radius,
            r: 10,
            bornAt,
            expiresAt: simElapsed + 4 * (i + 1),
            x: player.x,
            y: player.y,
          });
        }
      },
      scheduleBurstWaves: (startAt, count, spanSec, radius) => {
        ultimateBurstWaves.length = 0;
        for (let i = 0; i < count; i++) {
          ultimateBurstWaves.push({
            at: startAt + (i * spanSec) / count,
            radius,
          });
        }
      },
      setTimelockWindow: (from, until) => {
        timelockEnemyFrom = from;
        timelockEnemyUntil = until;
      },
      setPlayerTimelockUntil: (until) => {
        playerTimelockUntil = Math.max(playerTimelockUntil, until);
      },
      setTimelockWorldShakeAt: (at) => {
        timelockWorldShakeAt = Math.max(timelockWorldShakeAt, at);
      },
      setUltimateSpeedUntil: (until) => {
        ultimateSpeedUntil = Math.max(ultimateSpeedUntil, until);
      },
      setWorldSlowUntil: (until) => {
        knightSpadesWorldSlowUntil = Math.max(knightSpadesWorldSlowUntil, until);
      },
      setTempHp: (value, expiry) => {
        player.tempHp = value;
        player.tempHpExpiry = expiry;
      },
      countActiveSuits: () => countSuitsInActiveSlots(inventory),
      bumpScreenShake: (strength, sec) => playerDamage.bumpScreenShake(strength, sec),
      grantInvulnerabilityUntil: (until) => playerDamage.grantInvulnerabilityUntil(until),
      hunterEntities: hunterRuntime?.entities ?? null,
    };
  }

  const abilityKeys = attachAbilityKeyPresses(window, (slot) => {
    if (runDead || isWorldPaused()) return;
    if (simElapsed < playerTimelockUntil) return;
    const ctx = buildAbilityContext(0);
    if (slot === "r" && tryUseEquippedUltimate(ctx)) return;
    character.onAbilityPress(slot, ctx);
  });

  /** Viewport top-left in world space (same convention as legacy `game.js`). */
  let cameraX = 0;
  let cameraY = 0;

  function snapCameraToPlayer() {
    const viewW = canvas.width;
    const viewH = canvas.height;
    cameraX = player.x - viewW / 2;
    cameraY = player.y - viewH / 2;
  }

  snapCameraToPlayer();

  let last = performance.now() / 1000;
  let raf = 0;

  function frame(nowMs) {
    try {
    const now = nowMs / 1000;
    const rawDt = Math.min(0.05, now - last);
    last = now;

    const simInput = document.getElementById("game-speed");
    let speedMul = 1;
    if (simInput && "value" in simInput) {
      const v = Number.parseFloat(String(simInput.value));
      if (Number.isFinite(v) && v > 0) speedMul = v;
    }
    const dt = rawDt * speedMul;

    const simPaused = simClockPaused();
    const paused = isWorldPaused();

    if (!paused) {
      playerDamage.tickCombatPresentation(rawDt);
    }

    if (!simPaused && !runDead) {
      simElapsed += rawDt;
      character.tick(buildAbilityContext(dt));
      player.hp = Math.max(0, Math.min(player.maxHp, player.hp));
    }

    if (!paused && !runDead) {
      let vx = 0;
      let vy = 0;
      if (simElapsed < playerTimelockUntil) {
        player.velX = 0;
        player.velY = 0;
        player._px = player.x;
        player._py = player.y;
      } else {
      if (keys.isDown("ArrowLeft")) vx -= 1;
      if (keys.isDown("ArrowRight")) vx += 1;
      if (keys.isDown("ArrowUp")) vy -= 1;
      if (keys.isDown("ArrowDown")) vy += 1;
      const len = Math.hypot(vx, vy);
      if (len > 1e-6) {
        player.facing = { x: vx / len, y: vy / len };
        let sp = PLAYER_SPEED * (player.speedBurstMult ?? 1);
        if (simElapsed < ultimateSpeedUntil) sp *= 1.75;
        sp *= player.speedPassiveMult ?? 1;
        if (simElapsed < (inventory.spadesObstacleBoostUntil ?? 0)) {
          sp *= 1 + Math.max(0, (player.terrainTouchMult ?? 1) - 1);
        }
        if (playerDamage.isLaserSlowActive()) sp *= LASER_BLUE_PLAYER_SLOW_MULT;
        vx = (vx / len) * sp * dt;
        vy = (vy / len) * sp * dt;
      }

      player.x += vx;
      player.y += vy;

      ({ obstacles, activePlayerHex, activeHexes, lastPlayerHexKey } = tiles.ensureTilesForPlayer({
        player,
        obstacles,
        activePlayerHex,
        activeHexes,
        lastPlayerHexKey,
      }));

      const resolved = resolvePlayerAgainstRects(player.x, player.y, player.r, obstacles);
      const touchedObstacle = Math.abs(resolved.x - player.x) > 1e-6 || Math.abs(resolved.y - player.y) > 1e-6;
      player.x = resolved.x;
      player.y = resolved.y;
      if (touchedObstacle && (player.terrainTouchMult ?? 1) > 1) {
        inventory.spadesObstacleBoostUntil = simElapsed + TERRAIN_SPEED_BOOST_LINGER;
      }

      if (!runDead && specialsSimUnpaused()) {
        hexEventRuntime?.clampPlayer(player);
      }

      const pdt = Math.max(dt, 1e-5);
      player.velX = (player.x - player._px) / pdt;
      player.velY = (player.y - player._py) / pdt;
      player._px = player.x;
      player._py = player.y;
      }
    }

    if (!paused) {
      const lootPlacementOpts = () => ({
        player,
        obstacles,
        collectibles,
        activeHexes,
        hexToWorld,
        worldToHex,
        isLootForbiddenHex: (q, r) => specials.isSpecialTile(q, r),
        tileW: REFERENCE_TILE_W,
        canvasW: canvas.width,
        canvasH: canvas.height,
      });

      const worldCardPickups = collectibles.filter((x) => x.kind === "card").map((x) => ({ card: x.card }));
      const reserved = collectReservedDeckKeys(inventory, cardPickup?.getPendingCard() ?? null, worldCardPickups);

      if (simElapsed >= nextHealSpawnAt) {
        if (!runDead) {
          if (collectibles.filter((c) => c.kind === "heal").length < MAX_HEAL_CRYSTALS) {
            const pt = randomOpenLootPoint({ ...lootPlacementOpts(), hitR: HEAL_PICKUP_HIT_R });
            if (pt) {
              collectibles.push({
                kind: "heal",
                x: pt.x,
                y: pt.y,
                r: HEAL_PICKUP_HIT_R,
                plusHalf: HEAL_PICKUP_PLUS_HALF,
                plusThick: HEAL_PICKUP_ARM_THICK,
                heal: HEAL_CRYSTAL_HP,
                bornAt: simElapsed,
                expiresAt: simElapsed + HEAL_CRYSTAL_LIFETIME_SEC,
              });
            }
          }
        }
        nextHealSpawnAt = simElapsed + (PICKUP_SPAWN_INTERVAL + randRange(-0.45, 0.85));
      }

      if (simElapsed >= nextCardSpawnAt) {
        if (!runDead) {
          if (collectibles.filter((c) => c.kind === "card").length < MAX_CARD_PICKUPS) {
            const pt = randomOpenLootPoint({ ...lootPlacementOpts(), hitR: CARD_PICKUP_HIT_R });
            if (pt) {
              const card = makeRandomMapCard(reserved, getItemRulesForCharacter(activeCharacterId));
              const visuals = makePickupVisualPair(card);
              collectibles.push({
                kind: "card",
                x: pt.x,
                y: pt.y,
                r: CARD_PICKUP_HIT_R,
                card,
                ...visuals,
                bornAt: simElapsed,
                expiresAt: simElapsed + CARD_COLLECTIBLE_LIFETIME_SEC,
              });
            }
          }
        }
        nextCardSpawnAt = simElapsed + (CARD_SPAWN_INTERVAL + randRange(-1.6, 3.4));
      }

      if (!runDead) {
        for (let i = collectibles.length - 1; i >= 0; i--) {
          const c = collectibles[i];
          if (simElapsed >= c.expiresAt) {
            collectibles.splice(i, 1);
            continue;
          }
          const reach = c.kind === "card" ? CARD_PICKUP_REACH_EXTRA : 0;
          const rr = c.r + player.r + reach;
          const dx = player.x - c.x;
          const dy = player.y - c.y;
          if (dx * dx + dy * dy > rr * rr) continue;
          if (c.kind === "heal") {
            player.hp = Math.min(player.maxHp, player.hp + (c.heal ?? HEAL_CRYSTAL_HP));
          } else if (c.kind === "card" && cardPickup) {
            cardPickup.openCardPickup(c.card);
          }
          collectibles.splice(i, 1);
        }
      }

      const hexFlowsUnpaused =
        !runDead &&
        !(cardPickup?.isPaused() ?? false) &&
        !(rouletteModal?.isPaused() ?? false) &&
        !(forgeWorldModal?.isForgePaused() ?? false) &&
        !safehouseHexFlow.isPausedForSafehousePrompt();
      if (hexFlowsUnpaused) {
        const modalPause = () =>
          (cardPickup?.isPaused() ?? false) ||
          (rouletteModal?.isPaused() ?? false) ||
          (forgeWorldModal?.isForgePaused() ?? false);

        rouletteHexFlow.tick({
          isWorldPaused: modalPause,
          getPlayer: () => player,
          worldToHex,
          hexToWorld,
          getSimElapsed: () => simElapsed,
          isRouletteHexTile: (q, r) => specials.isRouletteHexTile(q, r),
          isRouletteHexInteractive: (q, r) => specials.isRouletteHexInteractive(q, r),
          onOuterPenalty: () => {
            playerDamage.damagePlayer(ROULETTE_OUTER_PENALTY_HP, {
              rouletteHexOuterPenalty: true,
              floorHpAtMin: 1,
            });
            rouletteHexFlow.setScreenFlashUntil(simElapsed + 0.4);
          },
          openRouletteModal: () => {
            pendingRouletteOutcomeIsEmbedded = false;
            rouletteModal?.open(() => {
              if (pendingRouletteOutcomeIsEmbedded) {
                safehouseHexFlow.setEmbeddedRouletteComplete(true);
                pendingRouletteOutcomeIsEmbedded = false;
              } else {
                const { q, r } = rouletteHexFlow.getLock();
                specials.markProceduralRouletteHexSpent(q, r);
                rouletteHexFlow.onForgeSuccess();
              }
            });
          },
        });

        forgeHexFlow.tick({
          isWorldPaused: modalPause,
          getPlayer: () => player,
          worldToHex,
          hexToWorld,
          getSimElapsed: () => simElapsed,
          isForgeHexTile: (q, r) => specials.isForgeHexTile(q, r),
          isForgeHexInteractive: (q, r) => specials.isForgeHexInteractive(q, r),
          onOuterPenalty: () => {
            playerDamage.damagePlayer(FORGE_OUTER_PENALTY_HP, {
              rouletteHexOuterPenalty: true,
              floorHpAtMin: 1,
            });
            forgeHexFlow.setScreenFlashUntil(simElapsed + 0.4);
          },
          openForgeModal: () => {
            pendingForgeOutcomeIsEmbedded = false;
            forgeWorldModal?.open({
              onCommitSuccess: () => {
                if (pendingForgeOutcomeIsEmbedded) {
                  safehouseHexFlow.setEmbeddedForgeComplete(true);
                  pendingForgeOutcomeIsEmbedded = false;
                } else {
                  const { q, r } = forgeHexFlow.getLock();
                  specials.markProceduralForgeHexSpent(q, r);
                  forgeHexFlow.onForgeSuccess();
                }
              },
            });
          },
        });

        hexEventRuntime?.tick(dt);
      }

      while (ultimateBurstWaves.length && simElapsed >= ultimateBurstWaves[0].at) {
        const wave = ultimateBurstWaves.shift();
        if (!wave || !hunterRuntime) continue;
        for (const h of hunterRuntime.entities.hunters) {
          const dx = h.x - player.x;
          const dy = h.y - player.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > wave.radius * wave.radius) continue;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          if (h.type !== "spawner" && h.type !== "airSpawner") {
            h.x += ux * 95;
            h.y += uy * 95;
          }
          h.dir = { x: ux, y: uy };
        }
        for (let i = hunterRuntime.entities.projectiles.length - 1; i >= 0; i--) {
          const p = hunterRuntime.entities.projectiles[i];
          const dx = p.x - player.x;
          const dy = p.y - player.y;
          if (dx * dx + dy * dy <= wave.radius * wave.radius) {
            hunterRuntime.entities.projectiles.splice(i, 1);
          }
        }
        playerDamage.bumpScreenShake(11, 0.16);
        pushAttackRing(attackRings, player.x, player.y, wave.radius * 0.92, "#e0f2fe", simElapsed, 0.26);
        pushAttackRing(attackRings, player.x, player.y, wave.radius * 0.72, "#93c5fd", simElapsed, 0.22);
        pushAttackRing(attackRings, player.x, player.y, wave.radius * 0.48, "#bfdbfe", simElapsed, 0.18);
        ultimateEffects.push({
          type: "burstWave",
          x: player.x,
          y: player.y,
          color: "#93c5fd",
          bornAt: simElapsed,
          expiresAt: simElapsed + 0.52,
          radius: wave.radius,
        });
      }

      if (timelockWorldShakeAt > 0 && simElapsed >= timelockWorldShakeAt) {
        timelockWorldShakeAt = 0;
        playerDamage.bumpScreenShake(12, 0.2);
      }

      for (let i = ultimateShields.length - 1; i >= 0; i--) {
        const s = ultimateShields[i];
        if (simElapsed >= s.expiresAt) {
          ultimateShields.splice(i, 1);
        }
      }
      for (const shield of ultimateShields) {
        shield.angle += dt * 3.8;
        shield.x = player.x + Math.cos(shield.angle) * shield.radius;
        shield.y = player.y + Math.sin(shield.angle) * shield.radius;
      }
      if (hunterRuntime?.entities) {
        for (const shield of ultimateShields) {
          for (const h of hunterRuntime.entities.hunters) {
            if (h.type === "spawner" || h.type === "airSpawner") continue;
            const rr = shield.r + h.r;
            const dx = h.x - shield.x;
            const dy = h.y - shield.y;
            if (dx * dx + dy * dy > rr * rr) continue;
            // Deflect from player center outward (REFERENCE shield behavior).
            const awayLen = Math.hypot(h.x - player.x, h.y - player.y) || 1;
            const awayX = (h.x - player.x) / awayLen;
            const awayY = (h.y - player.y) / awayLen;
            h.x += awayX * 28;
            h.y += awayY * 28;
            h.dir = { x: awayX, y: awayY };
          }
        }
        for (let p = hunterRuntime.entities.projectiles.length - 1; p >= 0; p--) {
          const pr = hunterRuntime.entities.projectiles[p];
          let blocked = false;
          for (const shield of ultimateShields) {
            const rr = (pr.r ?? 4) + shield.r;
            const dx = pr.x - shield.x;
            const dy = pr.y - shield.y;
            if (dx * dx + dy * dy <= rr * rr) {
              blocked = true;
              pushAttackRing(attackRings, shield.x, shield.y, shield.r + 6, "#93c5fd", simElapsed, 0.1);
              break;
            }
          }
          if (blocked) hunterRuntime.entities.projectiles.splice(p, 1);
        }
      }
      for (let i = ultimateEffects.length - 1; i >= 0; i--) {
        if (simElapsed >= ultimateEffects[i].expiresAt) ultimateEffects.splice(i, 1);
      }

      const timelockFrozen = simElapsed >= timelockEnemyFrom && simElapsed < timelockEnemyUntil;
      let worldTimeScale = timelockFrozen ? 0.05 : 1;
      if (simElapsed < knightSpadesWorldSlowUntil) worldTimeScale = Math.min(worldTimeScale, 0.3);

      if (huntersEnabled && !runDead) {
        hunterRuntime.tick(dt * worldTimeScale, { suppressRangedAttacks: timelockFrozen });
      }
      if (!runDead) {
        hexEventRuntime?.postHunterTick();
      }

      tickAttackRings(attackRings, simElapsed);
      if ((inventory.heartsRegenPerSec ?? 0) > 0 && player.hp > 0 && player.hp < player.maxHp) {
        inventory.heartsRegenBank = (inventory.heartsRegenBank ?? 0) + inventory.heartsRegenPerSec * dt;
        while (inventory.heartsRegenBank >= 1 && player.hp < player.maxHp) {
          player.hp += 1;
          inventory.heartsRegenBank -= 1;
        }
      }
    }

    safehouseHexFlow.tick({
      dt: rawDt,
      runDead: () => runDead,
      innerGameplayFrozen: () => paused,
      advanceFreezeClock: !simClockPaused() && !runDead,
      getIsLunatic: () => activeCharacterId === "lunatic",
      getPlayer: () => player,
      worldToHex,
      hexToWorld,
      hexSize: HEX_SIZE,
      HEX_DIRS,
      getPrimarySafehouseAxial: () => specials.getPrimarySafehouseAxial(),
      isSafehouseHexTile: (q, r) => specials.isSafehouseHexTile(q, r),
      isSafehouseHexActiveTile: (q, r) => specials.isSafehouseHexActiveTile(q, r),
      isSafehouseHexSpentTile: (q, r) => specials.isSafehouseHexSpentTile(q, r),
      safehouseModalEl: document.getElementById("safehouse-level-modal"),
      clearKeys: () => keys.clearHeld(),
      openRouletteEmbedded: () => {
        pendingRouletteOutcomeIsEmbedded = true;
        rouletteModal?.open(() => {
          if (pendingRouletteOutcomeIsEmbedded) {
            safehouseHexFlow.setEmbeddedRouletteComplete(true);
            pendingRouletteOutcomeIsEmbedded = false;
          } else {
            const { q, r } = rouletteHexFlow.getLock();
            specials.markProceduralRouletteHexSpent(q, r);
            rouletteHexFlow.onForgeSuccess();
          }
        });
      },
      openForgeWorldEmbedded: () => {
        pendingForgeOutcomeIsEmbedded = true;
        forgeWorldModal?.open({
          onCommitSuccess: () => {
            if (pendingForgeOutcomeIsEmbedded) {
              safehouseHexFlow.setEmbeddedForgeComplete(true);
              pendingForgeOutcomeIsEmbedded = false;
            } else {
              const { q, r } = forgeHexFlow.getLock();
              specials.markProceduralForgeHexSpent(q, r);
              forgeHexFlow.onForgeSuccess();
            }
          },
        });
      },
      markProceduralSafehouseHexSpent: (q, r) => {
        const wasActive = specials.isSafehouseHexActiveTile(q, r);
        specials.markProceduralSafehouseHexSpent(q, r);
        if (wasActive) safehouseHexFlow.onProceduralSafehouseSpent(hexKey(q, r));
      },
      setPlayerPos: (x, y) => {
        player.x = x;
        player.y = y;
      },
    });

    if (rouletteModal?.isPaused()) {
      rouletteModal.tickWallClock();
    }

    syncAbilityBarDocument(document, character.getAbilityHud(simElapsed));

    if (dangerRampFillEl && hunterRuntime) {
      const u = hunterRuntime.getDangerRamp01();
      dangerRampFillEl.style.width = `${(100 * u).toFixed(1)}%`;
    }

    const viewW = canvas.width;
    const viewH = canvas.height;
    if (!paused) {
      const targetCameraX = player.x - viewW / 2;
      const targetCameraY = player.y - viewH / 2;
      const cameraBlend = 1 - Math.pow(1 - CAMERA_FOLLOW_LERP, dt * 60);
      cameraX += (targetCameraX - cameraX) * cameraBlend;
      cameraY += (targetCameraY - cameraY) * cameraBlend;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, viewW, viewH);

    const shake = playerDamage.getShakeOffset();
    ctx.save();
    ctx.translate(-cameraX + shake.x, -cameraY + shake.y);

    for (const h of activeHexes) {
      const { x: cx, y: cy } = hexToWorld(h.q, h.r);
      fillPointyHexCell(ctx, cx, cy, HEX_SIZE, FLOOR_HEX_FILL, null);
    }
    /** REFERENCE `render`: obstacles, sanctuary, arena nexus, roulette, surge (specials above tetris footprint). */
    drawObstacles(ctx, obstacles);
    drawSafehouseHexWorld(ctx, {
      activeHexes,
      hexToWorld,
      simElapsed,
      nowMs: performance.now(),
      HEX_DIRS,
      isSafehouseHexTile: (q, r) => specials.isSafehouseHexTile(q, r),
      isSafehouseHexActiveTile: (q, r) => specials.isSafehouseHexActiveTile(q, r),
      isSafehouseHexSpentTile: (q, r) => specials.isSafehouseHexSpentTile(q, r),
      isLunatic: () => activeCharacterId === "lunatic",
      innerFacilitiesUnlocked: safehouseHexFlow.getInnerFacilitiesUnlocked(),
      embeddedRouletteComplete: safehouseHexFlow.getEmbeddedRouletteComplete(),
      embeddedForgeComplete: safehouseHexFlow.getEmbeddedForgeComplete(),
      getPrimarySafehouseAxial: () => specials.getPrimarySafehouseAxial(),
      spentTileAnim: safehouseHexFlow.getSpentTileAnim(),
    });
    drawArenaNexusHexWorld(
      ctx,
      activeHexes,
      hexToWorld,
      specials.isArenaHexTile,
      specials.isArenaSpent,
      hexEventRuntime?.getArenaDrawState() ?? null,
    );
    rouletteHexFlow.drawWorld(
      ctx,
      activeHexes,
      hexToWorld,
      simElapsed,
      (q, r) => specials.isRouletteHexTile(q, r),
      (q, r) => specials.isRouletteHexInteractive(q, r),
      (q, r) => specials.isRouletteSpent(q, r),
    );
    forgeHexFlow.drawWorld(
      ctx,
      activeHexes,
      hexToWorld,
      simElapsed,
      (q, r) => specials.isForgeHexTile(q, r),
      (q, r) => specials.isForgeHexInteractive(q, r),
      (q, r) => specials.isForgeSpent(q, r),
    );
    drawSurgeHexWorld(
      ctx,
      activeHexes,
      hexToWorld,
      specials.isSurgeHexTile,
      specials.isSurgeSpent,
      hexEventRuntime?.getSurgeDrawState() ?? null,
    );
    if (huntersEnabled) {
      hunterRuntime.draw(ctx);
    }
    for (const c of collectibles) {
      if (c.kind === "heal") {
        drawHealPickup(ctx, c, simElapsed);
      } else if (c.kind === "card") {
        drawCardPickupWorld(ctx, c, simElapsed);
      }
    }
    for (const d of character.getDecoys()) {
      drawDecoy(ctx, d);
    }
    drawAttackRings(ctx, attackRings, simElapsed);
    drawUltimateEffects(ctx, ultimateEffects, ultimateShields, simElapsed, player);

    const hurt01 =
      player.maxHp > 0
        ? Math.min(1, 1 - player.hp / player.maxHp + (playerDamage.combat.hurtFlashRemain > 0 ? 0.22 : 0))
        : 0;

    const invulnGate = Math.max(character.getInvulnUntil(), playerDamage.combat.playerInvulnerableUntil);
    let bodyAlpha = 1;
    if (simElapsed < invulnGate) {
      bodyAlpha = 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(simElapsed * 32));
    }
    if (activeCharacterId === "knight" && simElapsed < (inventory.clubsInvisUntil ?? 0)) {
      const pulse = 0.5 + 0.5 * Math.sin(simElapsed * 12);
      const ghostAlpha = clamp(0.34 + 0.16 * pulse, 0.28, 0.52);
      bodyAlpha = Math.min(bodyAlpha, ghostAlpha);
    }

    if (
      typeof character.getBurstVisualUntil === "function" &&
      character.getBurstVisualUntil(simElapsed) > simElapsed
    ) {
      drawKnightBurstAura(ctx, player.x, player.y, player.r, bodyAlpha);
    }
    drawFrontShieldArc(ctx, player, simElapsed);

    drawPlayerHpHud(ctx, player, {
      tempHp: player.tempHp,
      extraHudYOffset: typeof character.getHpHudYOffset === "function" ? character.getHpHudYOffset() : 0,
    });
    drawPlayerBody(ctx, player.x, player.y, player.r, player.facing, hurt01, bodyAlpha);

    ctx.restore();

    drawRunStatsHud(ctx, {
      survivalSec: simElapsed,
      bestSec: bestSurvivalSec,
      displayLevel: runLevel + 1,
      wave: hunterRuntime?.spawnState?.wave ?? 0,
      hunterCount: hunterRuntime?.entities?.hunters?.length ?? 0,
    });

    const rFlash = rouletteHexFlow.getScreenFlashUntil();
    const fFlash = forgeHexFlow.getScreenFlashUntil();
    if (simElapsed < rFlash) {
      const u = Math.max(0, Math.min(1, (rFlash - simElapsed) / 0.4));
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${0.38 * u})`;
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.restore();
    } else if (simElapsed < fFlash) {
      const u = Math.max(0, Math.min(1, (fFlash - simElapsed) / 0.4));
      ctx.save();
      ctx.fillStyle = `rgba(251, 146, 60, ${0.42 * u})`;
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.restore();
    }

    const surgeFlashUntil = hexEventRuntime?.getSurgeScreenFlashUntil() ?? 0;
    if (simElapsed < surgeFlashUntil) {
      const u = Math.max(0, Math.min(1, (surgeFlashUntil - simElapsed) / SURGE_TILE_FLASH_SEC));
      ctx.save();
      ctx.fillStyle = `rgba(220, 38, 38, ${0.38 * u})`;
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.restore();
    }

    if (playerDamage.combat.hurtFlashRemain > 0) {
      ctx.save();
      ctx.fillStyle = "rgba(220, 38, 38, 0.24)";
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.restore();
    }

    if ((manualPause || handsResetPause) && !runDead) {
      ctx.save();
      ctx.fillStyle = "rgba(2, 6, 23, 0.45)";
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.fillStyle = "#f8fafc";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 38px Arial";
      ctx.fillText("Paused", viewW / 2, viewH / 2 - 10);
      ctx.font = "16px Arial";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText("Press movement or ability keys to resume", viewW / 2, viewH / 2 + 24);
      ctx.restore();
    }

    raf = window.requestAnimationFrame(frame);
    } catch (err) {
      runLogger.error("frame", "unhandled frame exception", err);
      throw err;
    }
  }

  raf = window.requestAnimationFrame(frame);

  window.addEventListener(
    "beforeunload",
    () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onDeathRetryKeydown);
      window.removeEventListener("keydown", onManualPauseKeydown);
      keys.dispose();
      abilityKeys.dispose();
      devHeroSelect.dispose();
      cardPickup?.dispose();
      rouletteModal?.dispose();
      forgeWorldModal?.dispose();
    },
    { once: true },
  );
}

boot();
