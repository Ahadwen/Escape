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
  SURGE_TILE_FLASH_SEC,
  TERRAIN_SPEED_BOOST_LINGER,
  LUNATIC_SPRINT_TIER_FX_DUR_T2,
  LUNATIC_SPRINT_TIER_FX_DUR_T4,
  SET_BONUS_SUIT_THRESHOLD,
  SET_BONUS_SUIT_MAX,
  VALIANT_BUNNY_PICKUP_R,
  BULWARK_POST_HIT_INVULN_SEC,
  BULWARK_FLAG_MAX_HP,
} from "./balance.js";
import { referenceTileGridFromCanvasHeight } from "./WorldGeneration/tileGenerator.js";
import { attachArrowKeyState, attachHeldLetterKeys } from "./gameControls.js";
import { attachAbilityKeyPresses, isDomShellTypingTarget } from "./controls/abilityKeys.js";
import {
  createCharacterController,
  resolveImplementedHeroId,
  createBulwarkWorld,
} from "./Characters/index.js";
import { createRogueWorld } from "./Characters/rogueWorld.js";
import { createValiantWorld } from "./Characters/valiantWorld.js";
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
  drawValiantShockFields,
  drawValiantBunnies,
  drawValiantRabbitOrbiters,
  drawValiantRabbitFx,
  drawValiantWillTextAbovePlayer,
  drawValiantScreenHud,
  drawValiantFloatPopups,
} from "./fx/valiantDraw.js";
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
import { invisBurstDurationSeconds } from "./items/defaultCardEffects.js";
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
import {
  tickLunaticSprintTierFx,
  drawLunaticSprintTierSpeedFx,
  drawLunaticSprintDirectionArrow,
  drawLunaticRoarFx,
  drawLunaticRoarTimerBar,
} from "./fx/lunaticDraw.js";
import {
  drawBulwarkParry,
  drawBulwarkFlagCarried,
  drawBulwarkFlagPlanted,
  drawBulwarkFrontShieldArc,
} from "./fx/bulwarkDraw.js";
import { drawUltimateEffects } from "./fx/ultimateEffects.js";
import { createPlayerDamage } from "./playerDamage.js";
import { createRunLogger, instrumentObjectMethods } from "./debug/runLogger.js";
import { createPathRuntime } from "./run/pathRuntime.js";
import { applyPathShellTheme } from "./hud/pathShellTheme.js";

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

function shouldUseMobileUi(win = window) {
  const coarse = win.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  const narrow = win.matchMedia?.("(max-width: 920px)")?.matches ?? false;
  const touchPoints = (navigator.maxTouchPoints ?? 0) > 0;
  return coarse && (narrow || touchPoints);
}

function isLocalDebugHost(win = window) {
  const host = String(win.location?.hostname || "").trim().toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "[::1]"
  );
}

function boot() {
  const runLogger = createRunLogger(30);
  const pathRuntime = createPathRuntime({ rng: Math.random });
  mountCharacterRoster(document);
  const debugAllowed = isLocalDebugHost(window);
  let devPanelEl = document.getElementById("special-test-west-panel");
  let devPanelToggleBtn = document.getElementById("dev-panel-toggle-button");
  if (!debugAllowed) {
    devPanelEl?.remove();
    devPanelToggleBtn?.remove();
    devPanelEl = null;
    devPanelToggleBtn = null;
  }
  const DEV_PANEL_HIDDEN_LS_KEY = "escape-dev-panel-hidden";
  function setDevPanelHidden(hidden) {
    if (!devPanelEl || !devPanelToggleBtn) return;
    devPanelEl.classList.toggle("special-test-west-panel--hidden", hidden);
    devPanelToggleBtn.textContent = hidden ? "Show debug" : "Hide debug";
    devPanelToggleBtn.setAttribute("aria-expanded", hidden ? "false" : "true");
    try {
      localStorage.setItem(DEV_PANEL_HIDDEN_LS_KEY, hidden ? "1" : "0");
    } catch {
      /* ignore storage failures */
    }
  }
  if (devPanelEl && devPanelToggleBtn) {
    let initiallyHidden = false;
    try {
      initiallyHidden = localStorage.getItem(DEV_PANEL_HIDDEN_LS_KEY) === "1";
    } catch {
      initiallyHidden = false;
    }
    setDevPanelHidden(initiallyHidden);
    devPanelToggleBtn.addEventListener("click", () => {
      setDevPanelHidden(!devPanelEl.classList.contains("special-test-west-panel--hidden"));
    });
  }

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
  const mobileUiEnabled = shouldUseMobileUi(window);
  document.body.classList.toggle("is-mobile-ui", mobileUiEnabled);
  const characterSelectModalEl = document.getElementById("character-select-modal");
  const mobileUnpauseBtn = document.getElementById("mobile-unpause-btn");

  /** Until the modal confirms a hero, picking the defaulted id must still refresh (often knight on touch). */
  let hasLockedInitialHeroFromModal = !mobileUiEnabled;
  /** After death, next pick must re-apply loadout even if the same hero stays selected. */
  let expectingCharacterPickAfterDeath = false;

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
  const steerKeys = attachHeldLetterKeys(window, ["q", "e"]);
  const touchMoveHeld = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
  const touchSteerHeld = { q: false, e: false };
  const mobileControlDisposers = [];
  function clearTouchMoveInputs() {
    touchMoveHeld.ArrowUp = false;
    touchMoveHeld.ArrowDown = false;
    touchMoveHeld.ArrowLeft = false;
    touchMoveHeld.ArrowRight = false;
  }
  function clearTouchInputs() {
    clearTouchMoveInputs();
    touchSteerHeld.q = false;
    touchSteerHeld.e = false;
  }
  function isArrowHeld(key) {
    return keys.isDown(key) || !!touchMoveHeld[key];
  }
  function isSteerHeld(letter) {
    return steerKeys.isDown(letter) || !!touchSteerHeld[String(letter).toLowerCase()];
  }
  function clearMovementKeys() {
    keys.clearHeld();
    steerKeys.clearHeld();
    clearTouchInputs();
  }
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

  function setTouchMoveFromStick(nx, ny) {
    touchMoveHeld.ArrowUp = false;
    touchMoveHeld.ArrowDown = false;
    touchMoveHeld.ArrowLeft = false;
    touchMoveHeld.ArrowRight = false;
    const mag = Math.hypot(nx, ny);
    if (mag < 0.28) return;
    const sector = Math.round(Math.atan2(ny, nx) / (Math.PI / 4));
    if (sector === 0) touchMoveHeld.ArrowRight = true;
    else if (sector === 1) {
      touchMoveHeld.ArrowRight = true;
      touchMoveHeld.ArrowDown = true;
    } else if (sector === 2) touchMoveHeld.ArrowDown = true;
    else if (sector === 3) {
      touchMoveHeld.ArrowDown = true;
      touchMoveHeld.ArrowLeft = true;
    } else if (Math.abs(sector) === 4) touchMoveHeld.ArrowLeft = true;
    else if (sector === -3) {
      touchMoveHeld.ArrowLeft = true;
      touchMoveHeld.ArrowUp = true;
    } else if (sector === -2) touchMoveHeld.ArrowUp = true;
    else if (sector === -1) {
      touchMoveHeld.ArrowUp = true;
      touchMoveHeld.ArrowRight = true;
    }
  }

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

  const inventory = createEmptyInventory();
  inventory.clubsInvisUntil = 0;
  inventory.spadesLandingStealthUntil = 0;
  inventory.spadesObstacleBoostUntil = 0;
  inventory.heartsResistanceReadyAt = 0;
  inventory.heartsResistanceCooldownDuration = 0;
  inventory.swampInfectionStacks = 0;
  inventory.heartsRegenPerSec = 0;
  inventory.heartsRegenBank = 0;

  const rogueWorld = createRogueWorld();
  rogueWorld.reset(0, player);

  const valiantWorld = createValiantWorld();
  const bulwarkWorld = createBulwarkWorld();

  let character = instrumentObjectMethods(
    createCharacterController(activeCharacterId, rogueWorld, valiantWorld, bulwarkWorld),
    "character",
    runLogger,
    {
      skip: ["getAbilityHud"],
    },
  );

  function obstaclesForPlayerCollision() {
    if (
      activeCharacterId === "rogue" &&
      rogueWorld.clubsPhaseThroughObstacles(inventory, player.x, player.y, simElapsed)
    ) {
      return [];
    }
    if (
      activeCharacterId === "valiant" &&
      countSuitsInActiveSlots(inventory).clubs >= SET_BONUS_SUIT_THRESHOLD &&
      typeof character.getValiantSurgeUntil === "function" &&
      simElapsed < character.getValiantSurgeUntil()
    ) {
      return [];
    }
    return obstacles;
  }
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
  if (typeof character.resetRunState === "function") {
    character.resetRunState(hexKey(activePlayerHex.q, activePlayerHex.r));
  }
  if (activeCharacterId === "valiant") {
    valiantWorld.reset(simElapsed);
  }
  bulwarkWorld.reset();

  /** @type {Array<{ kind: string, x: number, y: number, r: number, expiresAt: number } & Record<string, unknown>>} */
  const collectibles = [];
  /** REFERENCE `entities.attackRings` — ability impact rings. */
  const attackRings = [];
  /** REFERENCE `entities.lunaticSprintTierFx` — speed streak bursts while sprinting. */
  const lunaticSprintTierFx = /** @type {{ bornAt: number; expiresAt: number; tier: 2 | 4 }[]} */ ([]);
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
  let fireIgniteUntil = 0;
  let fireIgniteNextTickAt = 0;
  /** Seconds between ignite DoT ticks while `fireIgniteUntil` is active (L3+: 3 ticks / 2s). */
  let fireIgniteTickStep = 1;
  /** Bone path: mild ambient tunnel (always on). Laser "blind" debuff: timed peak + fade — near-black periphery + dimmed center. */
  let boneBlindDebuffPeakEnd = 0;
  let boneBlindDebuffFadeEnd = 0;
  /** True if the blind debuff was triggered by a blue laser (pale-blue accent for that debuff). */
  let boneBlindDebuffFromBlueLaser = false;
  const BONE_BLIND_DEBUFF_PEAK_SEC = 0.92;
  const BONE_BLIND_DEBUFF_FADE_SEC = 0.55;
  let swampInfectionPopupUntil = 0;
  const swampDamageInstanceSeenAt = new Map();
  const damagePopups = /** @type {{ x: number; y: number; bornAt: number; expiresAt: number; base: number; swampBonus: number; driftX: number }[]} */ ([]);
  let nextHealSpawnAt = 3.5;
  let nextCardSpawnAt = 10;
  const MAX_HEAL_CRYSTALS = 6;
  const MAX_CARD_PICKUPS = 4;

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
  const deathScreenChooseHeroBtn = document.getElementById("death-screen-choose-hero-btn");

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

  /** @type {ReturnType<typeof createPlayerDamage>} */
  let playerDamage;
  playerDamage = createPlayerDamage({
    getSimElapsed: () => simElapsed,
    getPlayer: () => player,
    inventory,
    getCharacterInvulnUntil: () => character.getInvulnUntil(),
    rogueStealthBlocksDamage: () =>
      activeCharacterId === "rogue" && rogueWorld.stealthBlocksDamage(simElapsed, inventory),
    getLunaticSprintDamageImmune: () =>
      activeCharacterId === "lunatic" &&
      typeof character.getLunaticSprintDamageImmune === "function" &&
      character.getLunaticSprintDamageImmune(),
    getIsValiant: () => activeCharacterId === "valiant",
    applyValiantIncomingDamage: (amount, opts) => {
      valiantWorld.applyDamage(amount, opts, {
        getSimElapsed: () => simElapsed,
        getPlayer: () => player,
        inventory,
        get combat() {
          return playerDamage.combat;
        },
        bumpScreenShake: (strength, sec) => playerDamage.bumpScreenShake(strength, sec),
        grantInvulnerabilityUntil: (until) => playerDamage.grantInvulnerabilityUntil(until),
        stunNearbyEnemies: (secs) => {
          if (!hunterRuntime) return;
          for (const h of hunterRuntime.entities.hunters) {
            const dx = h.x - player.x;
            const dy = h.y - player.y;
            if (dx * dx + dy * dy <= 220 * 220) h.stunnedUntil = Math.max(h.stunnedUntil || 0, simElapsed + secs);
          }
        },
        onWillDeath: () => playerDamage.killPlayerImmediate(),
      });
    },
    isDashCoolingDown: () => (typeof character.isDashCoolingDown === "function" ? character.isDashCoolingDown(simElapsed) : false),
    getBulwarkParryActive: () =>
      activeCharacterId === "bulwark" &&
      typeof character.getBulwarkParryUntil === "function" &&
      simElapsed < character.getBulwarkParryUntil(),
    getPostHitInvulnerabilitySec: () =>
      activeCharacterId === "bulwark" ? BULWARK_POST_HIT_INVULN_SEC : null,
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
      lunaticSprintTierFx.length = 0;
    },
  });

  /**
   * Extension seam for future path-specific incoming-damage modifiers.
   * First pass is identity (no behavior changes).
   */
  function resetSwampInfection() {
    inventory.swampInfectionStacks = 0;
    swampInfectionPopupUntil = 0;
    swampDamageInstanceSeenAt.clear();
  }

  function spawnDamagePopup(baseAmount, swampBonus, opts = {}) {
    if (baseAmount <= 0 && swampBonus <= 0) return;
    const sx = Number.isFinite(opts?.sourceX) ? opts.sourceX : player.x;
    const sy = Number.isFinite(opts?.sourceY) ? opts.sourceY : player.y;
    const jitter = (Math.random() - 0.5) * 18;
    damagePopups.push({
      x: sx + jitter,
      y: sy - player.r - 4,
      bornAt: simElapsed,
      expiresAt: simElapsed + 0.9,
      base: Math.max(0, Math.floor(baseAmount)),
      swampBonus: Math.max(0, Math.floor(swampBonus)),
      driftX: (Math.random() - 0.5) * 28,
    });
    if (damagePopups.length > 90) damagePopups.splice(0, damagePopups.length - 90);
  }

  function drawDamagePopups(ctx) {
    for (let i = damagePopups.length - 1; i >= 0; i--) {
      const p = damagePopups[i];
      if (simElapsed >= p.expiresAt) {
        damagePopups.splice(i, 1);
        continue;
      }
      const u = clamp((simElapsed - p.bornAt) / Math.max(0.001, p.expiresAt - p.bornAt), 0, 1);
      const alpha = 1 - u;
      const px = p.x + p.driftX * u;
      const py = p.y - u * 40;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.font = 'bold 15px ui-sans-serif, system-ui, "Segoe UI", sans-serif';
      ctx.lineWidth = 4;
      const baseTxt = `-${p.base}`;
      ctx.strokeStyle = `rgba(2, 6, 23, ${0.85 * alpha})`;
      ctx.strokeText(baseTxt, px, py);
      ctx.fillStyle = `rgba(248, 113, 113, ${alpha})`;
      ctx.fillText(baseTxt, px, py);
      if (p.swampBonus > 0) {
        const extraTxt = `-${p.swampBonus}`;
        ctx.font = 'bold 13px ui-sans-serif, system-ui, "Segoe UI", sans-serif';
        ctx.strokeStyle = `rgba(2, 6, 23, ${0.8 * alpha})`;
        ctx.strokeText(extraTxt, px + 20, py - 8);
        ctx.fillStyle = `rgba(163, 230, 53, ${alpha})`;
        ctx.fillText(extraTxt, px + 20, py - 8);
      }
      ctx.restore();
    }
  }

  function damagePlayerThroughPath(amount, opts = {}) {
    const hooked = pathRuntime.applyDamageHooks({
      amount,
      opts,
      simElapsed,
      runLevel,
      player,
      inventory,
      activeCharacterId,
    });
    if (hooked?.cancel) return;
    const finalAmount = hooked?.amount ?? amount;
    const finalOpts = hooked?.opts ?? opts;
    const baseDamage = Math.max(0, Number(amount) || 0);
    const damageBonus = Math.max(0, (Number(finalAmount) || 0) - baseDamage);
    playerDamage.damagePlayer(finalAmount, finalOpts);
    if (pathRuntime.getCurrentPathId() === "swamp" && runLevel >= 2 && Number(finalAmount) > 0) {
      playerDamage.applySwampHitSlow();
    }
    if (pathRuntime.getCurrentPathId() === "bone" && Number(finalAmount) > 0) {
      boneBlindDebuffPeakEnd = simElapsed + BONE_BLIND_DEBUFF_PEAK_SEC;
      boneBlindDebuffFadeEnd = boneBlindDebuffPeakEnd + BONE_BLIND_DEBUFF_FADE_SEC;
      boneBlindDebuffFromBlueLaser = !!finalOpts?.laserBlueSlow;
    }
    if (finalAmount > 0) spawnDamagePopup(finalAmount, damageBonus, finalOpts);
    if (pathRuntime.getCurrentPathId() === "swamp" && (finalOpts?.swampApplyInfection || finalAmount > 0)) {
      const instanceId = finalOpts?.swampDamageInstanceId;
      let shouldAddStack = true;
      if (instanceId != null) {
        const key = String(instanceId);
        if (swampDamageInstanceSeenAt.has(key)) shouldAddStack = false;
        else swampDamageInstanceSeenAt.set(key, simElapsed);
      }
      if (shouldAddStack) {
        inventory.swampInfectionStacks = Math.max(0, Math.floor((inventory.swampInfectionStacks ?? 0) + 1));
        swampInfectionPopupUntil = simElapsed + 0.95;
      }
    }
    if ((finalOpts?.fireApplyIgnite ?? false) && !(finalOpts?.fireIgniteTick ?? false)) {
      const igniteStep = runLevel >= 2 ? 2 / 3 : 1;
      fireIgniteTickStep = igniteStep;
      fireIgniteUntil = simElapsed + 2;
      fireIgniteNextTickAt = simElapsed + igniteStep;
    }
  }

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
    maybePromptDiamondEmpowerChoice();
  }

  function maybePromptDiamondEmpowerChoice() {
    if (!cardPickup) return;
    if (activeCharacterId !== "knight") {
      cardPickup.clearSetBonusChoice?.("diamonds");
      hideDiamondEmpowerOverlay();
      return;
    }
    if (inventory.diamondEmpower) {
      cardPickup.clearSetBonusChoice?.("diamonds");
      hideDiamondEmpowerOverlay();
      return;
    }
    const suits = countSuitsInActiveSlots(inventory);
    if (suits.diamonds < SET_BONUS_SUIT_THRESHOLD || suits.diamonds >= SET_BONUS_SUIT_MAX) {
      cardPickup.clearSetBonusChoice?.("diamonds");
      hideDiamondEmpowerOverlay();
      return;
    }
    // Prevent surprise mid-run pauses: only surface this chooser while card loadout modal is already open.
    if (!(cardPickup.isPaused?.() ?? false)) return;
    cardPickup.openSetBonusChoice("diamonds");
    if (cardPickup.isDiamondSetBonusChoicePending?.()) showDiamondEmpowerOverlay();
  }

  /** @param {object} [opts]
   *  @property {boolean} [forceReselect] — allow re-applying loadout while id matches (first modal confirm, retry same hero).
   */
  function switchActiveCharacter(id, opts = {}) {
    const forceReselect = !!(opts && opts.forceReselect);
    if (!forceReselect && id === activeCharacterId) return;
    hideDeathScreen();
    activeCharacterId = id;
    if (id === "lunatic") {
      for (let r = 1; r <= 13; r++) {
        inventory.deckByRank[r] = null;
      }
      inventory.backpackSlots[0] = null;
      inventory.backpackSlots[1] = null;
      inventory.backpackSlots[2] = null;
      inventory.lunaticRegenBank = 0;
      inventory.diamondEmpower = null;
      inventory.valiantElectricBoxChargeBonus = 0;
    }
    character = instrumentObjectMethods(createCharacterController(id, rogueWorld, valiantWorld, bulwarkWorld), "character", runLogger, {
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
    fireIgniteUntil = 0;
    fireIgniteNextTickAt = 0;
    fireIgniteTickStep = 1;
    boneBlindDebuffPeakEnd = 0;
    boneBlindDebuffFadeEnd = 0;
    boneBlindDebuffFromBlueLaser = false;
    resetSwampInfection();
    damagePopups.length = 0;
    specials.resetSessionState();
    safehouseHexFlow.resetSession();
    runLevel = 0;
    pathRuntime.resetRun();
    refreshDebugRunProgressUi();
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
    rogueWorld.reset(simElapsed, player);
    snapCameraToPlayer();
    collectibles.length = 0;
    attackRings.length = 0;
    lunaticSprintTierFx.length = 0;
    nextHealSpawnAt = simElapsed + 2;
    nextCardSpawnAt = simElapsed + 4;
    cardPickup?.resetAll();
    rouletteHexFlow.resetSession();
    forgeHexFlow.resetSession();
    rouletteModal?.closeUi();
    forgeWorldModal?.closeUi();
    hunterRuntime.reset();
    hexEventRuntime?.reset();
    if (typeof character.resetRunState === "function") {
      character.resetRunState(hexKey(activePlayerHex.q, activePlayerHex.r));
    }
    valiantWorld.reset(simElapsed);
    bulwarkWorld.reset();
    syncDeckHud();
  }

  const devHeroSelect = mountDevActiveHeroSelect(document, {
    initialId: activeCharacterId,
    onSelect: switchActiveCharacter,
  });

  const diamondEmpowerOverlayEl = document.getElementById("diamond-empower-overlay");
  function hideDiamondEmpowerOverlay() {
    if (!diamondEmpowerOverlayEl) return;
    diamondEmpowerOverlayEl.classList.remove("open");
    diamondEmpowerOverlayEl.setAttribute("aria-hidden", "true");
  }
  function showDiamondEmpowerOverlay() {
    if (!diamondEmpowerOverlayEl) return;
    diamondEmpowerOverlayEl.classList.add("open");
    diamondEmpowerOverlayEl.setAttribute("aria-hidden", "false");
  }
  function wireDiamondEmpowerOverlay() {
    if (!diamondEmpowerOverlayEl) return;
    const bind = (btnId, id) => {
      document.getElementById(btnId)?.addEventListener("click", () => {
        cardPickup?.applyDiamondEmpowerChoice?.(id);
      });
    };
    bind("diamond-empower-q", "dash2x");
    bind("diamond-empower-w", "speedPassive");
    bind("diamond-empower-e", "decoyFortify");
  }

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
      clearMovementKeys();
    },
    onDiamondEmpowerPicked: hideDiamondEmpowerOverlay,
  }), "cardModal", runLogger);
  wireDiamondEmpowerOverlay();
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
      safehouseHexFlow.closeLevelModal(safehouseLevelModalEl, () => clearMovementKeys());
      safehouseHexFlow.applyLevelUpAccepted({
        onRunLevelIncrement: () => {
          runLevel += 1;
          pathRuntime.ensurePathAssignedForLevel(runLevel);
          resetSwampInfection();
          refreshDebugRunProgressUi();
        },
        onSpawnAnchorResetToDifficultyClock: (eff) => {
          hunterRuntime?.softResetSpawnPacingAfterSafehouseLevel(eff);
        },
        healPlayerToMax: () => {
          if (activeCharacterId === "valiant" && typeof character.applySafehouseFullHeal === "function") {
            character.applySafehouseFullHeal();
          } else {
            player.hp = player.maxHp;
          }
        },
        getIsLunatic: () => activeCharacterId === "lunatic",
        getPrimarySafehouseAxial: () => specials.getPrimarySafehouseAxial(),
        getSimElapsed: () => simElapsed,
      });
    });
  }
  if (safehouseLevelNoBtn) {
    safehouseLevelNoBtn.addEventListener("click", () => {
      safehouseHexFlow.closeLevelModal(safehouseLevelModalEl, () => clearMovementKeys());
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
    if (h.type !== "spawner" && h.type !== "airSpawner" && h.type !== "cryptSpawner") return;
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

  /**
   * @param {{ x: number; y: number }} source
   * @param {number} range
   * @param {{ artilleryKind?: "detonation" | "linger"; damage?: number }} [opts]
   *   Sniper artillery: `detonation` = one 1-HP hit to planted Bulwark flag; `linger` = no HP to flag (area ticks).
   */
  function hitDecoyIfAny(source, range, opts = {}) {
    const ds = character.getDecoys();
    const now = simElapsed;
    const artilleryKind = opts.artilleryKind;
    const dmg = typeof opts.damage === "number" && opts.damage > 0 ? opts.damage : 1;
    for (let i = ds.length - 1; i >= 0; i--) {
      const d = ds[i];
      const rr = range + d.r;
      const dx = source.x - d.x;
      const dy = source.y - d.y;
      if (dx * dx + dy * dy <= rr * rr) {
        if (d.kind === "bulwarkFlag" && artilleryKind === "linger") {
          return true;
        }
        if (now < (d.invulnerableUntil ?? 0)) return true;
        d.hp = Math.max(0, (d.hp ?? 1) - dmg);
        if (d.kind === "bulwarkFlag") d.invulnerableUntil = now + BULWARK_POST_HIT_INVULN_SEC;
        if (d.hp <= 0 && d.kind !== "bulwarkFlag") ds.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * @param {{ laserOneShotId?: number; damage?: number }} [opts]
   *   Lasers: pass `laserOneShotId` (per beam) so planted Bulwark flag takes at most one `damage` per beam, not per tick.
   */
  function hitDecoyAlongSegment(x1, y1, x2, y2, extraRadius, opts = {}) {
    const ds = character.getDecoys();
    const now = simElapsed;
    const dmg = typeof opts.damage === "number" && opts.damage > 0 ? opts.damage : 1;
    const laserOneShotId = opts.laserOneShotId;
    for (let i = ds.length - 1; i >= 0; i--) {
      const d = ds[i];
      if (pointToSegmentDistance(d.x, d.y, x1, y1, x2, y2) <= d.r + extraRadius) {
        if (d.kind === "bulwarkFlag" && typeof laserOneShotId === "number") {
          if ((d.lastLaserBeamHitId ?? 0) === laserOneShotId) return true;
          if (now < (d.invulnerableUntil ?? 0)) return true;
          d.lastLaserBeamHitId = laserOneShotId;
          d.hp = Math.max(0, (d.hp ?? 1) - dmg);
          d.invulnerableUntil = now + BULWARK_POST_HIT_INVULN_SEC;
          return true;
        }
        if (now < (d.invulnerableUntil ?? 0)) return true;
        d.hp = Math.max(0, (d.hp ?? 1) - dmg);
        if (d.kind === "bulwarkFlag") d.invulnerableUntil = now + BULWARK_POST_HIT_INVULN_SEC;
        if (d.hp <= 0 && d.kind !== "bulwarkFlag") ds.splice(i, 1);
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
    getActivePathId: () => pathRuntime.getCurrentPathId(),
    getInventory: () => inventory,
    getPlayerUntargetableUntil: () => playerDamage.combat.playerUntargetableUntil,
    pickRogueHunterTarget: (hunter, playerRef, inv, nearestDecoy, hasLOS, fallback, elapsed) =>
      rogueWorld.pickRogueHunterTarget(hunter, playerRef, inv, nearestDecoy, hasLOS, fallback, elapsed),
    rand: randRange,
    getViewSize: () => ({ w: canvas.width, h: canvas.height }),
    damagePlayer: (amt, opts) => damagePlayerThroughPath(amt, opts),
    collidesValiantEnemyShockField: (circle, elapsed) => valiantWorld.collidesEnemyShockField(circle, elapsed),
    getBulwarkPlantedFlag: () =>
      activeCharacterId === "bulwark" && typeof character.getBulwarkWorld === "function"
        ? character.getBulwarkWorld().getPlantedFlagForAi()
        : null,
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
    damagePlayer: (amt, opts) => damagePlayerThroughPath(amt, opts),
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

  function performFullRunResetAfterDeath() {
    if (!runDead || !hunterRuntime) return;
    hideDeathScreen();
    runDead = false;
    manualPause = false;
    handsResetPause = false;
    simElapsed = 0;
    character = instrumentObjectMethods(createCharacterController(activeCharacterId, rogueWorld, valiantWorld, bulwarkWorld), "character", runLogger, {
      skip: ["getAbilityHud"],
    });
    applyShellUiFromCharacter(document, character);
    applyCombatFromCharacter();
    valiantWorld.reset(simElapsed);
    bulwarkWorld.reset();
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
    inventory.heartsResistanceCooldownDuration = 0;
    inventory.swampInfectionStacks = 0;
    inventory.heartsRegenPerSec = 0;
    inventory.heartsRegenBank = 0;
    inventory.diamondEmpower = null;
    inventory.valiantElectricBoxChargeBonus = 0;
    inventory.lunaticRegenBank = 0;
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
    fireIgniteUntil = 0;
    fireIgniteNextTickAt = 0;
    fireIgniteTickStep = 1;
    boneBlindDebuffPeakEnd = 0;
    boneBlindDebuffFadeEnd = 0;
    boneBlindDebuffFromBlueLaser = false;
    resetSwampInfection();
    damagePopups.length = 0;
    specials.resetSessionState();
    safehouseHexFlow.resetSession();
    runLevel = 0;
    pathRuntime.resetRun();
    refreshDebugRunProgressUi();
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
    rogueWorld.reset(simElapsed, player);
    collectibles.length = 0;
    attackRings.length = 0;
    lunaticSprintTierFx.length = 0;
    nextHealSpawnAt = simElapsed + 2;
    nextCardSpawnAt = simElapsed + 4;
    cardPickup?.resetAll();
    rouletteHexFlow.resetSession();
    forgeHexFlow.resetSession();
    rouletteModal?.closeUi();
    forgeWorldModal?.closeUi();
    hunterRuntime.reset();
    hexEventRuntime?.reset();
    if (typeof character.resetRunState === "function") {
      character.resetRunState(hexKey(activePlayerHex.q, activePlayerHex.r));
    }
    syncDeckHud();
    snapCameraToPlayer();
  }

  function goToCharacterSelectAfterDeath() {
    if (!runDead || !hunterRuntime) return;
    performFullRunResetAfterDeath();
    manualPause = true;
    clearMovementKeys();
    expectingCharacterPickAfterDeath = true;
    characterSelectModalEl?.classList.add("open");
  }

  /** @param {KeyboardEvent} e */
  function onDeathRetryKeydown(e) {
    if (!runDead) return;
    if (e.key !== "Enter") return;
    if (e.repeat) return;
    e.preventDefault();
    goToCharacterSelectAfterDeath();
  }
  window.addEventListener("keydown", onDeathRetryKeydown);

  function onDeathScreenChooseHeroClick() {
    if (!runDead) return;
    goToCharacterSelectAfterDeath();
  }
  deathScreenChooseHeroBtn?.addEventListener("click", onDeathScreenChooseHeroClick);
  mobileControlDisposers.push(() => deathScreenChooseHeroBtn?.removeEventListener("click", onDeathScreenChooseHeroClick));

  /** Single handler for `#character-select-pick` (touch + desktop / post-death). */
  function onHeroPickFromModal(ev) {
    const btn = ev.target instanceof Element ? ev.target.closest("button[data-character-id]") : null;
    if (!btn || btn.hasAttribute("disabled")) return;
    const nextId = btn.dataset.characterId;
    if (!nextId) return;
    const forceReselect = expectingCharacterPickAfterDeath || !hasLockedInitialHeroFromModal;
    switchActiveCharacter(nextId, { forceReselect });
    hasLockedInitialHeroFromModal = true;
    expectingCharacterPickAfterDeath = false;
    characterSelectModalEl?.classList.remove("open");
    manualPause = false;
    handsResetPause = false;
  }
  const characterPickHostEl = document.getElementById("character-select-pick");
  if (characterPickHostEl) {
    characterPickHostEl.addEventListener("click", onHeroPickFromModal);
    mobileControlDisposers.push(() => characterPickHostEl.removeEventListener("click", onHeroPickFromModal));
  }

  const RESUME_KEYS = new Set(["q", "w", "e", "r", "arrowup", "arrowdown", "arrowleft", "arrowright"]);

  function isCharacterSelectModalOpen() {
    return characterSelectModalEl?.classList.contains("open") ?? false;
  }

  function pauseKeyRoutingBlocked(ev) {
    const t = ev.target;
    if (isDomShellTypingTarget(t)) return true;
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
      return;
    }

    if (key === " " && !runDead && !modalChromePausesWorld()) {
      manualPause = true;
      clearMovementKeys();
      ev.preventDefault();
      ev.stopImmediatePropagation();
    }
  }
  window.addEventListener("keydown", onManualPauseKeydown);

  /** Mirrors Space-to-pause; used by HUD pause control on touch. */
  function tryMobileHudPause() {
    if (runDead) return;
    if (modalChromePausesWorld()) return;
    if (manualPause || handsResetPause) return;
    manualPause = true;
    clearMovementKeys();
  }

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

  const debugRunLevelDecEl = document.getElementById("debug-run-level-dec");
  const debugRunLevelIncEl = document.getElementById("debug-run-level-inc");
  const debugRunLevelValueEl = document.getElementById("debug-run-level-value");
  const debugPathSelectEl = document.getElementById("debug-path-select");

  function refreshDebugRunProgressUi() {
    const pathVisual = pathRuntime.getPathVisualConfig();
    applyPathShellTheme(pathRuntime.getCurrentPathId());
    if (debugRunLevelValueEl) {
      debugRunLevelValueEl.textContent = `Level ${runLevel + 1} \u00b7 Path: ${pathVisual.label}`;
    }
    if (debugPathSelectEl && "value" in debugPathSelectEl) {
      debugPathSelectEl.value = pathRuntime.getForcedPathId() ?? "__auto__";
    }
  }

  function applyDebugRunLevel(nextRunLevel) {
    runLevel = Math.max(0, Math.floor(nextRunLevel));
    if (runLevel < 1 && !pathRuntime.getForcedPathId()) {
      pathRuntime.resetRun();
    } else {
      pathRuntime.ensurePathAssignedForLevel(runLevel);
    }
    const eff = safehouseHexFlow.getDifficultyClockSec(simElapsed);
    hunterRuntime?.softResetSpawnPacingAfterSafehouseLevel(eff);
    resetSwampInfection();
    refreshDebugRunProgressUi();
  }

  if (debugPathSelectEl && "value" in debugPathSelectEl) {
    for (const def of pathRuntime.getPathDefs()) {
      const opt = document.createElement("option");
      opt.value = def.id;
      opt.textContent = def.label;
      debugPathSelectEl.appendChild(opt);
    }
    debugPathSelectEl.addEventListener("change", () => {
      const selected = String(debugPathSelectEl.value || "__auto__");
      if (selected === "__auto__") {
        pathRuntime.setForcedPathId(null);
        if (runLevel < 1) pathRuntime.resetRun();
        else pathRuntime.ensurePathAssignedForLevel(runLevel);
      } else {
        pathRuntime.setForcedPathId(selected);
      }
      refreshDebugRunProgressUi();
    });
  }
  debugRunLevelDecEl?.addEventListener("click", () => applyDebugRunLevel(runLevel - 1));
  debugRunLevelIncEl?.addEventListener("click", () => applyDebugRunLevel(runLevel + 1));
  refreshDebugRunProgressUi();

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
        add(`clubs:dodge`, "clubs dodge", { kind: "dodge", value: (2 + rank) / 100 }, srcSuit);
        add(`clubs:stun`, "clubs stun", { kind: "stun", value: 0.2 * rank }, srcSuit);
        add(`clubs:invisBurst`, "clubs invis on burst", { kind: "invisBurst", value: invisBurstDurationSeconds(rank) }, srcSuit);
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
      resolvePlayer: (x, y, r) => resolvePlayerAgainstRects(x, y, r, obstaclesForPlayerCollision()),
      circleHitsObstacle: (x, y, r) => circleOverlapsAnyRect(x, y, r, obstaclesForPlayerCollision()),
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
      onValiantWillDeath: () => playerDamage.killPlayerImmediate(),
      hunterEntities: hunterRuntime?.entities ?? null,
      bulwarkChargePushHunters: (px, py, nx, ny, pr, at, pushedOut) =>
        hunterRuntime?.bulwarkChargePushHunters?.(px, py, nx, ny, pr, at, pushedOut),
      bulwarkChargeApplyTerrainGroupStun: (set, at) =>
        hunterRuntime?.bulwarkChargeApplyTerrainGroupStun?.(set, at),
      bulwarkParryPushHunters: (px, py, rad, dist) => hunterRuntime?.bulwarkParryPushHunters?.(px, py, rad, dist),
    };
  }

  function handleAbilityPress(slot) {
    if (runDead) return;
    if (manualPause || handsResetPause) {
      manualPause = false;
      handsResetPause = false;
    }
    if (isWorldPaused()) return;
    if (simElapsed < playerTimelockUntil) return;
    const ctx = buildAbilityContext(0);
    if (slot === "r" && tryUseEquippedUltimate(ctx)) return;
    character.onAbilityPress(slot, ctx);
  }
  function handleAbilityRelease(slot) {
    if (runDead || isWorldPaused()) return;
    if (simElapsed < playerTimelockUntil) return;
    if (typeof character.onAbilityRelease !== "function") return;
    const ctx = buildAbilityContext(0);
    character.onAbilityRelease(slot, ctx);
  }
  const abilityKeys = attachAbilityKeyPresses(window, handleAbilityPress, undefined, handleAbilityRelease);

  if (mobileUiEnabled) {
    if (characterSelectModalEl) {
      characterSelectModalEl.classList.add("open");
      manualPause = true;
      clearMovementKeys();
    }

    if (mobileUnpauseBtn) {
      /** Same as ability `pointerdown` — `click` waits for finger up, so pause + thumb on stick blocked unpause. */
      const onMobileUnpause = (ev) => {
        if (runDead) return;
        ev.preventDefault();
        ev.stopPropagation();
        manualPause = false;
        handsResetPause = false;
      };
      mobileUnpauseBtn.addEventListener("pointerdown", onMobileUnpause, { passive: false });
      mobileControlDisposers.push(() => mobileUnpauseBtn.removeEventListener("pointerdown", onMobileUnpause));
    }

    const mobileHudPauseBtn = document.getElementById("mobile-hud-pause-btn");
    if (mobileHudPauseBtn) {
      const onMobileHudPause = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        tryMobileHudPause();
      };
      mobileHudPauseBtn.addEventListener("pointerdown", onMobileHudPause, { passive: false });
      mobileControlDisposers.push(() => mobileHudPauseBtn.removeEventListener("pointerdown", onMobileHudPause));
    }

    const stickZoneEl = document.getElementById("mobile-stick-zone");
    const stickKnobEl = document.getElementById("mobile-stick-knob");
    if (stickZoneEl && stickKnobEl) {
      let stickPointerId = null;
      let stickCx = 0;
      let stickCy = 0;
      let stickR = 1;
      const updateStickGeom = () => {
        const rect = stickZoneEl.getBoundingClientRect();
        stickCx = rect.left + rect.width / 2;
        stickCy = rect.top + rect.height / 2;
        stickR = Math.max(24, Math.min(rect.width, rect.height) * 0.36);
      };
      const resetStick = () => {
        stickPointerId = null;
        clearTouchMoveInputs();
        stickKnobEl.style.transform = "translate(0px, 0px)";
      };
      const updateStickFromEvent = (ev) => {
        const dx = ev.clientX - stickCx;
        const dy = ev.clientY - stickCy;
        const len = Math.hypot(dx, dy) || 1;
        const clamped = Math.min(stickR, len);
        const kx = (dx / len) * clamped;
        const ky = (dy / len) * clamped;
        stickKnobEl.style.transform = `translate(${kx}px, ${ky}px)`;
        setTouchMoveFromStick(dx / stickR, dy / stickR);
      };
      const onStickDown = (ev) => {
        ev.preventDefault();
        updateStickGeom();
        stickPointerId = ev.pointerId;
        stickZoneEl.setPointerCapture(ev.pointerId);
        updateStickFromEvent(ev);
      };
      const onStickMove = (ev) => {
        if (ev.pointerId !== stickPointerId) return;
        ev.preventDefault();
        updateStickFromEvent(ev);
      };
      const onStickUp = (ev) => {
        if (ev.pointerId !== stickPointerId) return;
        ev.preventDefault();
        resetStick();
      };
      stickZoneEl.addEventListener("pointerdown", onStickDown);
      stickZoneEl.addEventListener("pointermove", onStickMove);
      stickZoneEl.addEventListener("pointerup", onStickUp);
      stickZoneEl.addEventListener("pointercancel", onStickUp);
      window.addEventListener("blur", resetStick);
      mobileControlDisposers.push(() => {
        stickZoneEl.removeEventListener("pointerdown", onStickDown);
        stickZoneEl.removeEventListener("pointermove", onStickMove);
        stickZoneEl.removeEventListener("pointerup", onStickUp);
        stickZoneEl.removeEventListener("pointercancel", onStickUp);
        window.removeEventListener("blur", resetStick);
      });
    }

    for (const slot of ["q", "w", "e", "r"]) {
      const btn = document.getElementById(`mobile-btn-${slot}`);
      if (!btn) continue;
      let heldPointerId = null;
      const onDown = (ev) => {
        ev.preventDefault();
        heldPointerId = ev.pointerId;
        btn.setPointerCapture?.(ev.pointerId);
        if (slot === "q" || slot === "e") touchSteerHeld[slot] = true;
        btn.classList.add("mobile-action-btn--active");
        handleAbilityPress(slot);
      };
      const onUp = (ev) => {
        if (heldPointerId != null && ev.pointerId !== heldPointerId) return;
        ev.preventDefault();
        heldPointerId = null;
        if (slot === "q" || slot === "e") touchSteerHeld[slot] = false;
        btn.classList.remove("mobile-action-btn--active");
        handleAbilityRelease(slot);
      };
      btn.addEventListener("pointerdown", onDown);
      btn.addEventListener("pointerup", onUp);
      btn.addEventListener("pointercancel", onUp);
      btn.addEventListener("pointerleave", onUp);
      mobileControlDisposers.push(() => {
        btn.removeEventListener("pointerdown", onDown);
        btn.removeEventListener("pointerup", onUp);
        btn.removeEventListener("pointercancel", onUp);
        btn.removeEventListener("pointerleave", onUp);
      });
    }
  }

  function isLootForbiddenForSpawns(q, r) {
    if (specials.isSpecialTile(q, r)) return true;
    if (activeCharacterId === "lunatic" && typeof character.getHealExcludeHexKey === "function") {
      const ex = character.getHealExcludeHexKey();
      if (ex && hexKey(q, r) === ex) return true;
    }
    return false;
  }

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

    if (mobileUiEnabled && mobileUnpauseBtn) {
      const showMbUnpause =
        (manualPause || handsResetPause) && !runDead && !(characterSelectModalEl?.classList.contains("open") ?? false);
      mobileUnpauseBtn.hidden = !showMbUnpause;
    }

    if (!paused) {
      playerDamage.tickCombatPresentation(rawDt);
    }

    if (!simPaused && !runDead) {
      simElapsed += rawDt;
      character.tick(buildAbilityContext(dt));
      pathRuntime.applyDebuffHooks({ dt, simElapsed, runLevel, player, inventory, activeCharacterId });
      const swampPathActive = pathRuntime.getCurrentPathId() === "swamp";
      const firePathActive = pathRuntime.getCurrentPathId() === "fire";
      const bonePathActive = pathRuntime.getCurrentPathId() === "bone";
      if (swampDamageInstanceSeenAt.size > 0) {
        const cutoff = simElapsed - 20;
        for (const [k, t] of swampDamageInstanceSeenAt) {
          if (t < cutoff) swampDamageInstanceSeenAt.delete(k);
        }
      }
      if (!swampPathActive && (inventory.swampInfectionStacks ?? 0) > 0) {
        resetSwampInfection();
      }
      if (!firePathActive) {
        fireIgniteUntil = 0;
        fireIgniteNextTickAt = 0;
        fireIgniteTickStep = 1;
      } else if (fireIgniteUntil > simElapsed && fireIgniteNextTickAt > 0 && simElapsed >= fireIgniteNextTickAt) {
        while (fireIgniteUntil > simElapsed && simElapsed >= fireIgniteNextTickAt) {
          damagePlayerThroughPath(1, { fireIgniteTick: true, fireNoIgnite: true, sourceX: player.x, sourceY: player.y });
          fireIgniteNextTickAt += fireIgniteTickStep;
          if (player.hp <= 0) break;
        }
      } else if (fireIgniteUntil <= simElapsed) {
        fireIgniteUntil = 0;
        fireIgniteNextTickAt = 0;
        fireIgniteTickStep = 1;
      }
      if (!bonePathActive) {
        boneBlindDebuffPeakEnd = 0;
        boneBlindDebuffFadeEnd = 0;
        boneBlindDebuffFromBlueLaser = false;
      }
      player.hp = Math.max(0, Math.min(player.maxHp, player.hp));
      if (activeCharacterId === "valiant") {
        const lootPlacementOpts = () => ({
          player,
          obstacles,
          collectibles,
          activeHexes,
          hexToWorld,
          worldToHex,
          isLootForbiddenHex: isLootForbiddenForSpawns,
          tileW: REFERENCE_TILE_W,
          canvasW: canvas.width,
          canvasH: canvas.height,
        });
        valiantWorld.trySpawnWildBunny(simElapsed, () =>
          randomOpenLootPoint({ ...lootPlacementOpts(), hitR: VALIANT_BUNNY_PICKUP_R }),
        );
      }
    }

    if (!paused && !runDead) {
      let vx = 0;
      let vy = 0;
      let rogueMovementIntent = false;
      if (simElapsed < playerTimelockUntil) {
        player.velX = 0;
        player.velY = 0;
        player._px = player.x;
        player._py = player.y;
      } else {
      const lunaticMove =
        activeCharacterId === "lunatic" && typeof character.applyMovementFrame === "function"
          ? character.applyMovementFrame({
              dt,
              simElapsed,
              player,
              keys: {
                isDown: (k) =>
                  k === "ArrowLeft" || k === "ArrowRight" || k === "ArrowUp" || k === "ArrowDown"
                    ? isArrowHeld(k)
                    : keys.isDown(k),
              },
              steerLeft: () => isSteerHeld("q"),
              steerRight: () => isSteerHeld("e"),
              inventory,
              PLAYER_SPEED,
              ultimateSpeedUntil,
              laserSlowMult: playerDamage.getMovementSlowMult(),
              getObsForCollision: () => obstaclesForPlayerCollision(),
              resolvePlayerAgainstRects,
              circleOverlapsAnyRect,
              damagePlayer: (amt, opts) => damagePlayerThroughPath(amt, opts),
              spawnAttackRing: (x, y, r, color, durationSec) => {
                pushAttackRing(attackRings, x, y, r, color, simElapsed, durationSec);
              },
              onLunaticSprintTierFx: (tier) => {
                const dur = tier === 4 ? LUNATIC_SPRINT_TIER_FX_DUR_T4 : LUNATIC_SPRINT_TIER_FX_DUR_T2;
                lunaticSprintTierFx.push({
                  bornAt: simElapsed,
                  expiresAt: simElapsed + dur,
                  tier: /** @type {2 | 4} */ (tier),
                });
              },
            })
          : null;

      const bulwarkCharging =
        activeCharacterId === "bulwark" &&
        typeof character.isBulwarkCharging === "function" &&
        character.isBulwarkCharging();

      let sweepTouchedObstacle = false;
      if (!lunaticMove && !bulwarkCharging) {
        if (isArrowHeld("ArrowLeft")) vx -= 1;
        if (isArrowHeld("ArrowRight")) vx += 1;
        if (isArrowHeld("ArrowUp")) vy -= 1;
        if (isArrowHeld("ArrowDown")) vy += 1;
        const len = Math.hypot(vx, vy);
        const rogueDashHold = activeCharacterId === "rogue" && rogueWorld.getDashAiming();
        if (len > 1e-6) {
          rogueMovementIntent = !rogueDashHold;
          player.facing = { x: vx / len, y: vy / len };
          if (!rogueDashHold) {
            let sp = PLAYER_SPEED * (player.speedBurstMult ?? 1);
            if (simElapsed < ultimateSpeedUntil) sp *= 1.75;
            sp *= player.speedPassiveMult ?? 1;
            if (simElapsed < (inventory.spadesObstacleBoostUntil ?? 0)) {
              sp *= 1 + Math.max(0, (player.terrainTouchMult ?? 1) - 1);
            }
            sp *= playerDamage.getMovementSlowMult();
            vx = (vx / len) * sp * dt;
            vy = (vy / len) * sp * dt;
          } else {
            vx = 0;
            vy = 0;
          }
        }

        const moveDist = Math.hypot(vx, vy);
        const moveSteps = Math.max(1, Math.ceil(moveDist / Math.max(3, player.r * 0.35)));
        const stepX = vx / moveSteps;
        const stepY = vy / moveSteps;
        for (let i = 0; i < moveSteps; i++) {
          player.x += stepX;
          player.y += stepY;
          const preResolveX = player.x;
          const preResolveY = player.y;
          const stepResolved = resolvePlayerAgainstRects(player.x, player.y, player.r, obstaclesForPlayerCollision());
          if (Math.abs(stepResolved.x - preResolveX) > 1e-6 || Math.abs(stepResolved.y - preResolveY) > 1e-6) {
            sweepTouchedObstacle = true;
          }
          player.x = stepResolved.x;
          player.y = stepResolved.y;
        }
      } else if (lunaticMove) {
        rogueMovementIntent = lunaticMove.rogueMovementIntent;
      }

      ({ obstacles, activePlayerHex, activeHexes, lastPlayerHexKey } = tiles.ensureTilesForPlayer({
        player,
        obstacles,
        activePlayerHex,
        activeHexes,
        lastPlayerHexKey,
      }));

      let touchedObstacle = false;
      if (!lunaticMove) {
        const obsForPlayer = obstaclesForPlayerCollision();
        const resolved = resolvePlayerAgainstRects(player.x, player.y, player.r, obsForPlayer);
        touchedObstacle =
          sweepTouchedObstacle ||
          Math.abs(resolved.x - player.x) > 1e-6 ||
          Math.abs(resolved.y - player.y) > 1e-6;
        player.x = resolved.x;
        player.y = resolved.y;
        if (activeCharacterId === "bulwark" && typeof character.getBulwarkWorld === "function") {
          character.getBulwarkWorld().clampPlayerInDeathLock(player);
        }
      } else {
        touchedObstacle = lunaticMove.touchedObstacle;
      }
      if (touchedObstacle && (player.terrainTouchMult ?? 1) > 1) {
        inventory.spadesObstacleBoostUntil = simElapsed + TERRAIN_SPEED_BOOST_LINGER;
      }

      if (lunaticMove && typeof character.tickLunaticRoarTerrain === "function") {
        character.tickLunaticRoarTerrain({
          simDt: dt,
          simElapsed,
          player,
          obstacles,
          damagePlayer: (amt, opts) => damagePlayerThroughPath(amt, opts),
        });
      }
      if (lunaticMove && typeof character.ejectFromObstaclesIfStuck === "function") {
        character.ejectFromObstaclesIfStuck({
          player,
          circleHitsObstacle: (x, y, r) => circleOverlapsAnyRect(x, y, r, obstacles),
        });
      }

      if (!runDead && specialsSimUnpaused()) {
        hexEventRuntime?.clampPlayer(player);
      }

      const pdt = Math.max(dt, 1e-5);
      player.velX = (player.x - player._px) / pdt;
      player.velY = (player.y - player._py) / pdt;
      player._px = player.x;
      player._py = player.y;

      if (!simPaused && activeCharacterId === "rogue") {
        rogueWorld.tickNeeds(
          {
            simDt: dt,
            simElapsed,
            player,
            inventory,
            obstacles,
            moving: rogueMovementIntent,
            touchedObstacle,
            rand: randRange,
            randomFoodPoint: () =>
              randomOpenLootPoint({
                player,
                obstacles,
                collectibles,
                activeHexes,
                hexToWorld,
                worldToHex,
                isLootForbiddenHex: isLootForbiddenForSpawns,
                tileW: REFERENCE_TILE_W,
                canvasW: canvas.width,
                canvasH: canvas.height,
                hitR: 13,
              }),
            spawnWorldPopup: (wx, wy, text, color) => {
              rogueWorld.spawnPopup(wx, wy, text, color, simElapsed);
            },
          },
          () => {
            playerDamage.killPlayerImmediate();
          },
        );
        if (hunterRuntime) {
          rogueWorld.updateEnemyLos(hunterRuntime.entities, simElapsed, player, (h) =>
            hunterRuntime.hasEnemyLineOfSightToPlayer(h),
          );
        }
      }
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
        isLootForbiddenHex: isLootForbiddenForSpawns,
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
        if (!runDead && activeCharacterId !== "lunatic") {
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
            if (activeCharacterId === "lunatic") {
              player.maxHp += 1;
              player.hp = Math.min(player.maxHp, player.hp + 1);
            } else if (activeCharacterId === "valiant" && typeof character.onHealCrystalPickup === "function") {
              character.onHealCrystalPickup(buildAbilityContext(0), c.heal ?? HEAL_CRYSTAL_HP);
            } else {
              player.hp = Math.min(player.maxHp, player.hp + (c.heal ?? HEAL_CRYSTAL_HP));
            }
            fireIgniteUntil = 0;
            fireIgniteNextTickAt = 0;
            fireIgniteTickStep = 1;
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
            damagePlayerThroughPath(ROULETTE_OUTER_PENALTY_HP, {
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
            damagePlayerThroughPath(FORGE_OUTER_PENALTY_HP, {
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
          if (h.type !== "spawner" && h.type !== "airSpawner" && h.type !== "cryptSpawner") {
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
            if (h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner") continue;
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
      const enemyHook = pathRuntime.applyEnemyHooks({
        dt,
        simElapsed,
        runLevel,
        worldTimeScale,
        timelockFrozen,
        player,
        inventory,
      });
      worldTimeScale = enemyHook?.worldTimeScale ?? worldTimeScale;

      if (huntersEnabled && !runDead) {
        hunterRuntime.tick(dt * worldTimeScale, { suppressRangedAttacks: timelockFrozen });
      }
      if (!runDead) {
        hexEventRuntime?.postHunterTick();
      }

      tickAttackRings(attackRings, simElapsed);
      tickLunaticSprintTierFx(lunaticSprintTierFx, simElapsed);
      if ((inventory.heartsRegenPerSec ?? 0) > 0 && player.hp > 0) {
        if (activeCharacterId === "valiant") {
          inventory.heartsRegenBank = (inventory.heartsRegenBank ?? 0) + inventory.heartsRegenPerSec * dt;
          while (inventory.heartsRegenBank >= 1) {
            const hurt = [];
            for (let j = 0; j < 3; j++) {
              const s = valiantWorld.getRabbitSlots()[j];
              if (s && s.hp < s.maxHp) hurt.push(j);
            }
            if (!hurt.length) {
              inventory.heartsRegenBank = 0;
              break;
            }
            const ri = hurt[Math.floor(Math.random() * hurt.length)];
            const rb = valiantWorld.getRabbitSlots()[ri];
            if (!rb) break;
            inventory.heartsRegenBank -= 1;
            rb.hp = Math.min(rb.maxHp, rb.hp + 1);
          }
        } else if (player.hp < player.maxHp) {
          inventory.heartsRegenBank = (inventory.heartsRegenBank ?? 0) + inventory.heartsRegenPerSec * dt;
          while (inventory.heartsRegenBank >= 1 && player.hp < player.maxHp) {
            player.hp += 1;
            inventory.heartsRegenBank -= 1;
          }
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
      clearKeys: () => clearMovementKeys(),
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

    const floorHexFill = pathRuntime.getPathVisualConfig().tileTint || FLOOR_HEX_FILL;
    const bonePathActive = pathRuntime.getCurrentPathId() === "bone";
    const boneAmbientOverlay = bonePathActive;
    const boneBlindDebuffActive =
      bonePathActive && simElapsed < boneBlindDebuffFadeEnd && boneBlindDebuffFadeEnd > 0;
    const firePathActive = pathRuntime.getCurrentPathId() === "fire";
    const swampPathActive = pathRuntime.getCurrentPathId() === "swamp";
    for (const h of activeHexes) {
      const { x: cx, y: cy } = hexToWorld(h.q, h.r);
      fillPointyHexCell(ctx, cx, cy, HEX_SIZE, floorHexFill, null);
    }
    if (bonePathActive) {
      const edge = Math.min(160, viewW * 0.16, viewH * 0.16);
      const pulse = 0.82 + 0.18 * Math.sin(simElapsed * 2.8);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const topG = ctx.createLinearGradient(0, 0, 0, edge);
      topG.addColorStop(0, `rgba(255, 255, 255, ${0.26 * pulse})`);
      topG.addColorStop(0.55, `rgba(248, 250, 252, ${0.1 * pulse})`);
      topG.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = topG;
      ctx.fillRect(0, 0, viewW, edge);
      const botG = ctx.createLinearGradient(0, viewH, 0, viewH - edge);
      botG.addColorStop(0, `rgba(255, 255, 255, ${0.26 * pulse})`);
      botG.addColorStop(0.55, `rgba(248, 250, 252, ${0.1 * pulse})`);
      botG.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = botG;
      ctx.fillRect(0, viewH - edge, viewW, edge);
      const leftG = ctx.createLinearGradient(0, 0, edge, 0);
      leftG.addColorStop(0, `rgba(255, 255, 255, ${0.22 * pulse})`);
      leftG.addColorStop(0.65, `rgba(241, 245, 249, ${0.08 * pulse})`);
      leftG.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = leftG;
      ctx.fillRect(0, 0, edge, viewH);
      const rightG = ctx.createLinearGradient(viewW, 0, viewW - edge, 0);
      rightG.addColorStop(0, `rgba(255, 255, 255, ${0.22 * pulse})`);
      rightG.addColorStop(0.65, `rgba(241, 245, 249, ${0.08 * pulse})`);
      rightG.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = rightG;
      ctx.fillRect(viewW - edge, 0, edge, viewH);
      ctx.restore();
    }
    /** REFERENCE `render`: obstacles, sanctuary, arena nexus, roulette, surge (specials above tetris footprint). */
    drawObstacles(
      ctx,
      obstacles,
      swampPathActive ? { fill: "#3b2d20", stroke: "#7c5a3b" } : undefined,
    );
    if (activeCharacterId === "bulwark" && typeof character.getBulwarkWorld === "function") {
      const lock = character.getBulwarkWorld().getDeathLock();
      if (lock) {
        ctx.save();
        ctx.strokeStyle = "rgba(248, 113, 113, 0.5)";
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 7]);
        ctx.beginPath();
        ctx.arc(lock.cx, lock.cy, lock.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }
    if (activeCharacterId === "rogue") {
      rogueWorld.drawSmokeAndFood(ctx, simElapsed);
    }
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
      if (firePathActive) {
        for (const h of hunterRuntime.entities.hunters) h.fireGlow = true;
      } else {
        for (const h of hunterRuntime.entities.hunters) h.fireGlow = false;
      }
      hunterRuntime.draw(ctx);
    }
    for (const c of collectibles) {
      if (c.kind === "heal") {
        drawHealPickup(ctx, c, simElapsed, { lunaticMaxHpCrystal: activeCharacterId === "lunatic" });
      } else if (c.kind === "card") {
        drawCardPickupWorld(ctx, c, simElapsed);
      }
    }
    drawDamagePopups(ctx);
    // Bone path: static ambient tunnel (no ctx.filter). Laser "blind" debuff = separate harsh blackout + dimmed center.
    if (boneAmbientOverlay) {
      const px = player.x;
      const py = player.y;
      const vx = cameraX + viewW / 2;
      const vy = cameraY + viewH / 2;
      const maxR = Math.max(viewW, viewH) * 0.92;
      const ambInner = 98;

      ctx.save();
      ctx.globalAlpha = 0.76;
      const vignette = ctx.createRadialGradient(px, py, ambInner, vx, vy, maxR);
      vignette.addColorStop(0, "rgba(15, 23, 42, 0)");
      vignette.addColorStop(0.46, "rgba(15, 23, 42, 0.42)");
      vignette.addColorStop(1, "rgba(15, 23, 42, 0.86)");
      ctx.fillStyle = vignette;
      ctx.fillRect(cameraX - 200, cameraY - 200, viewW + 400, viewH + 400);

      const fog = ctx.createRadialGradient(px, py, 108, px, py, 400);
      fog.addColorStop(0, "rgba(15, 23, 42, 0)");
      fog.addColorStop(0.6, "rgba(8, 10, 14, 0.44)");
      fog.addColorStop(1, "rgba(8, 10, 14, 0.9)");
      ctx.fillStyle = fog;
      ctx.fillRect(cameraX - 200, cameraY - 200, viewW + 400, viewH + 400);
      ctx.restore();

      if (boneBlindDebuffActive) {
        const fadeSpan = Math.max(0.0001, boneBlindDebuffFadeEnd - boneBlindDebuffPeakEnd);
        const debuffStr =
          simElapsed < boneBlindDebuffPeakEnd ? 1 : clamp((boneBlindDebuffFadeEnd - simElapsed) / fadeSpan, 0, 1);
        const innerR = ambInner * (1 - 0.3 * debuffStr);

        ctx.save();
        ctx.globalAlpha = debuffStr;
        const crushOuter = ctx.createRadialGradient(px, py, innerR * 0.7, vx, vy, maxR);
        crushOuter.addColorStop(0, "rgba(0, 0, 0, 0)");
        crushOuter.addColorStop(0.34, `rgba(0, 0, 0, ${0.72 + 0.26 * debuffStr})`);
        crushOuter.addColorStop(0.58, `rgba(0, 0, 0, ${Math.min(1, 0.96 + 0.04 * debuffStr)})`);
        crushOuter.addColorStop(1, "rgba(0, 0, 0, 0.998)");
        ctx.fillStyle = crushOuter;
        ctx.fillRect(cameraX - 200, cameraY - 200, viewW + 400, viewH + 400);

        const innerDim = ctx.createRadialGradient(px, py, 0, px, py, innerR * 0.9);
        innerDim.addColorStop(0, `rgba(0, 0, 0, ${0.78 + 0.2 * debuffStr})`);
        innerDim.addColorStop(0.5, `rgba(0, 0, 0, ${0.42 * debuffStr})`);
        innerDim.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = innerDim;
        ctx.fillRect(cameraX - 200, cameraY - 200, viewW + 400, viewH + 400);
        ctx.restore();

        if (boneBlindDebuffFromBlueLaser && debuffStr > 0.04) {
          ctx.save();
          ctx.globalAlpha = debuffStr * 0.88;
          const ice = ctx.createRadialGradient(px, py, innerR * 0.55, vx, vy, maxR * 0.96);
          ice.addColorStop(0, "rgba(255, 255, 255, 0)");
          ice.addColorStop(0.42, "rgba(224, 242, 254, 0.2)");
          ice.addColorStop(0.75, "rgba(186, 230, 253, 0.42)");
          ice.addColorStop(1, "rgba(56, 189, 248, 0.5)");
          ctx.fillStyle = ice;
          ctx.fillRect(cameraX - 200, cameraY - 200, viewW + 400, viewH + 400);
          ctx.restore();
        }
      }
    }
    for (const d of character.getDecoys()) {
      if (activeCharacterId === "bulwark" && d.kind === "bulwarkFlag") {
        drawBulwarkFlagPlanted(
          ctx,
          d,
          simElapsed,
          typeof character.getBulwarkWorld === "function" ? character.getBulwarkWorld().getPlantedChargeCount() : 0,
        );
      } else {
        drawDecoy(ctx, d);
      }
    }
    drawAttackRings(ctx, attackRings, simElapsed);
    if (activeCharacterId === "lunatic") {
      drawLunaticSprintTierSpeedFx(ctx, lunaticSprintTierFx, player, simElapsed);
    }
    drawUltimateEffects(ctx, ultimateEffects, ultimateShields, simElapsed, player);
    if (activeCharacterId === "rogue") {
      rogueWorld.drawFoodSenseArrows(ctx, simElapsed, player);
      const dashPreview =
        typeof character.getDashPreviewRange === "function" ? character.getDashPreviewRange() : 120;
      rogueWorld.drawDashAim(ctx, player, dashPreview);
      rogueWorld.drawStealthAid(ctx, player, obstacles);
      rogueWorld.drawWorldPopups(ctx, simElapsed);
    }

    const hurt01 =
      activeCharacterId === "valiant"
        ? Math.min(1, 1 - valiantWorld.getWill() + (playerDamage.combat.hurtFlashRemain > 0 ? 0.22 : 0))
        : player.maxHp > 0
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
    if (activeCharacterId === "rogue" && rogueWorld.stealthBlocksDamage(simElapsed, inventory)) {
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
    if (activeCharacterId === "bulwark") {
      drawBulwarkFrontShieldArc(ctx, player, simElapsed);
    } else {
      drawFrontShieldArc(ctx, player, simElapsed);
    }

    if (activeCharacterId === "valiant") {
      drawValiantShockFields(ctx, valiantWorld.getElectricBoxes(), simElapsed);
      drawValiantBunnies(ctx, valiantWorld.getBunnies(), simElapsed);
    }
    if (activeCharacterId === "valiant") {
      drawValiantWillTextAbovePlayer(
        ctx,
        player,
        valiantWorld.getWill(),
        typeof character.getHpHudYOffset === "function" ? character.getHpHudYOffset() : 0,
      );
    } else {
      drawPlayerHpHud(ctx, player, {
        tempHp: player.tempHp,
        extraHudYOffset: typeof character.getHpHudYOffset === "function" ? character.getHpHudYOffset() : 0,
      });
    }
    if (activeCharacterId === "rogue") {
      rogueWorld.drawSurvivalHudArcs(ctx, player, simElapsed);
    }
    if (swampPathActive && simElapsed < swampInfectionPopupUntil) {
      const u = clamp((swampInfectionPopupUntil - simElapsed) / 0.95, 0, 1);
      const alpha = 0.25 + u * 0.75;
      const extraHudYOffset = typeof character.getHpHudYOffset === "function" ? character.getHpHudYOffset() : 0;
      const infX = player.x + player.r + 34;
      const infY = player.y - player.r - 10 - extraHudYOffset;
      const inf = Math.max(0, Math.floor(inventory.swampInfectionStacks ?? 0));
      const txt = `${inf}`;
      ctx.save();
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.font = 'bold 14px ui-sans-serif, system-ui, "Segoe UI", sans-serif';
      ctx.lineWidth = 4;
      ctx.strokeStyle = `rgba(2, 6, 23, ${0.8 * alpha})`;
      ctx.strokeText(txt, infX, infY);
      ctx.fillStyle = `rgba(163, 230, 53, ${alpha})`;
      ctx.fillText(txt, infX, infY);
      ctx.restore();
    }
    const heartsResistanceCount = playerDamage.getHeartsResistanceCardCount?.() ?? 0;
    const heartsResistanceReady = heartsResistanceCount > 0 && simElapsed >= (inventory.heartsResistanceReadyAt ?? 0);
    if (heartsResistanceReady) {
      ctx.strokeStyle = "rgba(252, 165, 165, 0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (heartsResistanceCount > 0 && !heartsResistanceReady) {
      const cdDur = Math.max(
        0.001,
        inventory.heartsResistanceCooldownDuration || playerDamage.getHeartsResistanceCooldown?.() || 1,
      );
      const rem = Math.max(0, (inventory.heartsResistanceReadyAt ?? 0) - simElapsed);
      const t = clamp(1 - rem / cdDur, 0, 1);
      const iconX = player.x;
      const iconY = player.y + player.r + 20;
      const ringR = 7;
      const g = Math.round(148 + (191 - 148) * t);
      const b = Math.round(163 + (255 - 163) * t);
      ctx.strokeStyle = `rgb(100,${g},${b})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(iconX, iconY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * t);
      ctx.stroke();
      ctx.strokeStyle = "rgba(100, 116, 139, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(iconX, iconY, ringR, -Math.PI / 2 + Math.PI * 2 * t, -Math.PI / 2 + Math.PI * 2);
      ctx.stroke();
    }
    if (firePathActive && fireIgniteUntil > simElapsed) {
      const pulse = 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(simElapsed * 12));
      ctx.fillStyle = `rgba(220, 38, 38, ${0.18 + pulse * 0.1})`;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r + 10 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(251, 113, 133, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r + 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    drawPlayerBody(ctx, player.x, player.y, player.r, player.facing, hurt01, bodyAlpha);
    if (activeCharacterId === "bulwark" && typeof character.getBulwarkParryUntil === "function") {
      drawBulwarkParry(ctx, player, simElapsed, character.getBulwarkParryUntil());
    }
    if (
      activeCharacterId === "bulwark" &&
      typeof character.getBulwarkWorld === "function" &&
      character.getBulwarkWorld().isFlagCarried()
    ) {
      const bw = character.getBulwarkWorld();
      drawBulwarkFlagCarried(ctx, player, bw.getCarriedHp(), BULWARK_FLAG_MAX_HP, simElapsed);
    }
    if (activeCharacterId === "valiant") {
      drawValiantRabbitOrbiters(ctx, valiantWorld, player, simElapsed, bodyAlpha);
      drawValiantRabbitFx(ctx, valiantWorld, simElapsed);
      drawValiantFloatPopups(ctx, valiantWorld.getFloatPopups(), simElapsed);
    }
    if (activeCharacterId === "lunatic") {
      const phase = typeof character.getLunaticPhase === "function" ? character.getLunaticPhase() : "stumble";
      const roarUntil = typeof character.getLunaticRoarUntil === "function" ? character.getLunaticRoarUntil() : 0;
      drawLunaticSprintDirectionArrow(ctx, player, phase);
      drawLunaticRoarFx(ctx, player, simElapsed, roarUntil, bodyAlpha);
      drawLunaticRoarTimerBar(ctx, player, simElapsed, roarUntil, bodyAlpha);
    }

    ctx.restore();

    drawRunStatsHud(ctx, {
      survivalSec: simElapsed,
      bestSec: bestSurvivalSec,
      displayLevel: runLevel + 1,
      wave: hunterRuntime?.spawnState?.wave ?? 0,
      hunterCount: hunterRuntime?.entities?.hunters?.length ?? 0,
    });

    if (activeCharacterId === "valiant" && !runDead) {
      drawValiantScreenHud(ctx, {
        will01: valiantWorld.getWill(),
        occupiedRabbitCount: valiantWorld.occupiedRabbitCount(),
        netWillPerSec: valiantWorld.getWillNetChangePerSec(),
        rabbitSlots: valiantWorld.getRabbitSlots(),
      });
    }

    if (activeCharacterId === "rogue" && !runDead) {
      rogueWorld.drawScreenHud(ctx, simElapsed, viewW, viewH);
    }

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
      ctx.fillText(
        mobileUiEnabled ? "Tap Unpause (or stick / abilities) to resume" : "Press movement or ability keys to resume",
        viewW / 2,
        viewH / 2 + 24,
      );
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
      steerKeys.dispose();
      abilityKeys.dispose();
      clearTouchInputs();
      mobileControlDisposers.forEach((fn) => fn());
      devHeroSelect.dispose();
      cardPickup?.dispose();
      rouletteModal?.dispose();
      forgeWorldModal?.dispose();
    },
    { once: true },
  );
}

function startBootWhenGameCanvasMounted() {
  const canvas = document.getElementById("game");
  if (canvas instanceof HTMLCanvasElement) {
    boot();
    return;
  }
  /** Build output may execute before body subtree is observable in some hosts; defer until `#game` exists. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startBootWhenGameCanvasMounted, { once: true });
    return;
  }
  let frames = 0;
  function tick() {
    frames += 1;
    if (document.getElementById("game") instanceof HTMLCanvasElement) {
      boot();
      return;
    }
    if (frames > 120) {
      boot();
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

startBootWhenGameCanvasMounted();
