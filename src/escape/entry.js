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
} from "./balance.js";
import { referenceTileGridFromCanvasHeight } from "./WorldGeneration/tileGenerator.js";
import { attachArrowKeyState } from "./gameControls.js";
import { attachAbilityKeyPresses } from "./controls/abilityKeys.js";
import {
  createCharacterController,
  resolveImplementedHeroId,
} from "./Characters/index.js";
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
  drawArenaNexusHexWorld,
  drawSurgeHexWorld,
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
import { makePickupFlipFace } from "./items/cardUtils.js";
import { createEmptyInventory, collectReservedDeckKeys } from "./items/inventoryState.js";
import { makeRandomMapCard } from "./items/makeRandomCard.js";
import { getItemRulesForCharacter } from "./items/itemRulesRegistry.js";
import { createCardPickupModal } from "./items/cardPickupModal.js";
import { syncDeckSlotsFromInventory } from "./items/deckHudSync.js";
import { getModalSetBonusProgressLines } from "./items/setBonusPresentation.js";
import { createForgeHexFlow } from "./specials/forgeHexFlow.js";
import { createForgeWorldModal } from "./specials/forgeModal.js";
import { createRouletteHexFlow } from "./specials/rouletteHexFlow.js";
import { createRouletteModal } from "./specials/rouletteModal.js";
import { createEventHexController } from "./WorldGeneration/eventTiles/eventController.js";
import { dropJokerRewardFromSpecialEvent } from "./items/jokerEventReward.js";
import { createHunterRuntime } from "./Hunters/hunterRuntime.js";
import { clamp, pointToSegmentDistance } from "./Hunters/hunterGeometry.js";
import { tickAttackRings, drawAttackRings, pushAttackRing } from "./fx/attackRings.js";
import { createPlayerDamage } from "./playerDamage.js";

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
  mountCharacterRoster(document);

  const canvas = document.getElementById("game");
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    console.warn("escape/entry: #game canvas not found");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  /** Declared early so west-test `change` / death callbacks never hit the TDZ on these bindings. */
  let hunterRuntime = /** @type {ReturnType<typeof createHunterRuntime> | null} */ (null);
  let hexEventRuntime = /** @type {ReturnType<typeof createEventHexController> | null} */ (null);

  const worldToHex = (x, y) => worldToAxial(x, y, HEX_SIZE);
  const hexToWorld = (q, r) => axialToWorld(q, r, HEX_SIZE);

  const specials = createSpecialHexRuntime({ HEX_DIRS, hexKey });
  const rouletteHexFlow = createRouletteHexFlow({ hexKey });
  const forgeHexFlow = createForgeHexFlow({ hexKey });

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
  let character = createCharacterController(activeCharacterId);
  applyShellUiFromCharacter(document, character);

  function applyCombatFromCharacter() {
    const profile = character.getCombatProfile();
    player.maxHp = Math.max(1, profile.maxHp);
    player.hp = Math.min(player.maxHp, profile.startingHp ?? profile.maxHp);
    player.tempHp = 0;
    player.tempHpExpiry = 0;
  }
  applyCombatFromCharacter();

  /** @type {Array<{ kind: string, x: number, y: number, r: number, expiresAt: number } & Record<string, unknown>>} */
  const collectibles = [];
  /** REFERENCE `entities.attackRings` — ability impact rings. */
  const attackRings = [];
  let nextHealSpawnAt = 3.5;
  let nextCardSpawnAt = 10;
  const MAX_HEAL_CRYSTALS = 6;
  const MAX_CARD_PICKUPS = 4;

  const inventory = createEmptyInventory();
  inventory.clubsInvisUntil = 0;
  inventory.spadesLandingStealthUntil = 0;
  inventory.heartsResistanceReadyAt = 0;

  /** When true, movement, pickups, specials, and hunters stop (REFERENCE `state.running === false`). */
  let runDead = false;

  const deckRankSlotEls = Array.from({ length: 13 }, (_, i) => document.getElementById(`deck-slot-${i + 1}`));
  const backpackSlotEls = Array.from({ length: 3 }, (_, i) => document.getElementById(`backpack-slot-${i + 1}`));
  const setBonusStatusEl = document.getElementById("set-bonus-status");

  /** Simulation clock in seconds (same base as `elapsed` in frame). */
  let simElapsed = 0;

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
    onPlayerDeath: () => {
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
  function isWorldPaused() {
    return (
      (cardPickup?.isPaused() ?? false) ||
      (rouletteModal?.isPaused() ?? false) ||
      (forgeWorldModal?.isForgePaused() ?? false)
    );
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
    character = createCharacterController(id);
    applyShellUiFromCharacter(document, character);
    applyCombatFromCharacter();
    runDead = false;
    playerDamage.resetCombatState();
    player.x = 0;
    player.y = 0;
    player._px = 0;
    player._py = 0;
    player.speedBurstMult = 1;
    specials.resetSessionState();
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

  cardPickup = createCardPickupModal({
    cardModal: document.getElementById("card-modal"),
    cardModalFace: document.getElementById("card-modal-face"),
    modalDeckStripEl: document.getElementById("modal-deck-strip"),
    cardSwapRow: document.getElementById("card-swap-row"),
    modalSetBonusStatusEl: document.getElementById("modal-set-bonus-status"),
    cardCloseButton: document.getElementById("card-close-button"),
    inventory,
    getItemRules: () => getItemRulesForCharacter(activeCharacterId),
    syncDeckSlots: syncDeckHud,
    onPausedChange: () => {},
  });
  syncDeckHud();

  rouletteModal = createRouletteModal({
    doc: document,
    inventory,
    getItemRules: () => getItemRulesForCharacter(activeCharacterId),
    getPendingCard: () => cardPickup?.getPendingCard() ?? null,
    getWorldCardPickups: () =>
      collectibles.filter((x) => x.kind === "card").map((x) => ({ card: x.card })),
    syncDeckSlots: syncDeckHud,
    onPausedChange: () => {},
  });

  forgeWorldModal = createForgeWorldModal({
    doc: document,
    inventory,
    getItemRules: () => getItemRulesForCharacter(activeCharacterId),
    syncDeckSlots: syncDeckHud,
    getOpenCardPickup: () => (card) => cardPickup?.openCardPickup(card),
    onPausedChange: () => {},
  });

  function isWorldPointOnRouletteHexTile(x, y) {
    const h = worldToHex(x, y);
    if (!specials.isRouletteHexTile(h.q, h.r)) return false;
    const c = hexToWorld(h.q, h.r);
    return Math.hypot(x - c.x, y - c.y) <= HEX_SIZE + 4;
  }

  function isWorldPointOnSpecialSpawnerForbiddenHex(x, y) {
    if (isWorldPointOnRouletteHexTile(x, y)) return true;
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
    for (let i = ds.length - 1; i >= 0; i--) {
      const d = ds[i];
      const rr = range + d.r;
      const dx = source.x - d.x;
      const dy = source.y - d.y;
      if (dx * dx + dy * dy <= rr * rr) {
        ds.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  function hitDecoyAlongSegment(x1, y1, x2, y2, extraRadius) {
    const ds = character.getDecoys();
    for (let i = ds.length - 1; i >= 0; i--) {
      const d = ds[i];
      if (pointToSegmentDistance(d.x, d.y, x1, y1, x2, y2) <= d.r + extraRadius) {
        ds.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  hunterRuntime = createHunterRuntime({
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
    isWorldPointOnSpecialSpawnerForbiddenHex,
    ejectSpawnerHunterFromSpecialHexFootprint,
  });
  hunterRuntime.reset();

  hexEventRuntime = createEventHexController({
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
  });

  function restartRunAfterDeath() {
    if (!runDead || !hunterRuntime) return;
    hideDeathScreen();
    runDead = false;
    simElapsed = 0;
    character = createCharacterController(activeCharacterId);
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
    inventory.heartsResistanceReadyAt = 0;
    specials.resetSessionState();
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
    };
  }

  const abilityKeys = attachAbilityKeyPresses(window, (slot) => {
    if (runDead || isWorldPaused()) return;
    character.onAbilityPress(slot, buildAbilityContext(0));
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

    const paused = isWorldPaused();

    if (!paused) {
      playerDamage.tickCombatPresentation(rawDt);

      if (!runDead) {
        simElapsed += rawDt;
        character.tick(buildAbilityContext(dt));
        player.hp = Math.max(0, Math.min(player.maxHp, player.hp));

        let vx = 0;
        let vy = 0;
        if (keys.isDown("ArrowLeft")) vx -= 1;
        if (keys.isDown("ArrowRight")) vx += 1;
        if (keys.isDown("ArrowUp")) vy -= 1;
        if (keys.isDown("ArrowDown")) vy += 1;
        const len = Math.hypot(vx, vy);
        if (len > 1e-6) {
          player.facing = { x: vx / len, y: vy / len };
          let sp = PLAYER_SPEED * (player.speedBurstMult ?? 1);
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
        player.x = resolved.x;
        player.y = resolved.y;

        if (!runDead && specialsSimUnpaused()) {
          hexEventRuntime?.clampPlayer(player);
        }

        const pdt = Math.max(dt, 1e-5);
        player.velX = (player.x - player._px) / pdt;
        player.velY = (player.y - player._py) / pdt;
        player._px = player.x;
        player._py = player.y;
      }

      const lootPlacementOpts = () => ({
        player,
        obstacles,
        collectibles,
        activeHexes,
        hexToWorld,
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
              collectibles.push({
                kind: "card",
                x: pt.x,
                y: pt.y,
                r: CARD_PICKUP_HIT_R,
                card,
                flipCard: makePickupFlipFace(card),
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
        !(forgeWorldModal?.isForgePaused() ?? false);
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
            rouletteModal?.open(() => {
              const { q, r } = rouletteHexFlow.getLock();
              specials.markProceduralRouletteHexSpent(q, r);
              rouletteHexFlow.onForgeSuccess();
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
            forgeWorldModal?.open({
              onCommitSuccess: () => {
                const { q, r } = forgeHexFlow.getLock();
                specials.markProceduralForgeHexSpent(q, r);
                forgeHexFlow.onForgeSuccess();
              },
            });
          },
        });

        hexEventRuntime?.tick(dt);
      }

      if (huntersEnabled && !runDead) {
        hunterRuntime.tick(dt);
      }
      if (!runDead) {
        hexEventRuntime?.postHunterTick();
      }

      tickAttackRings(attackRings, simElapsed);
    }

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
    const targetCameraX = player.x - viewW / 2;
    const targetCameraY = player.y - viewH / 2;
    const cameraBlend = 1 - Math.pow(1 - CAMERA_FOLLOW_LERP, dt * 60);
    cameraX += (targetCameraX - cameraX) * cameraBlend;
    cameraY += (targetCameraY - cameraY) * cameraBlend;

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
    drawArenaNexusHexWorld(
      ctx,
      activeHexes,
      hexToWorld,
      specials.isArenaHexTile,
      specials.isArenaSpent,
      hexEventRuntime?.getArenaDrawState() ?? null,
    );
    drawSurgeHexWorld(
      ctx,
      activeHexes,
      hexToWorld,
      specials.isSurgeHexTile,
      specials.isSurgeSpent,
      hexEventRuntime?.getSurgeDrawState() ?? null,
    );

    drawObstacles(ctx, obstacles);
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

    raf = window.requestAnimationFrame(frame);
  }

  raf = window.requestAnimationFrame(frame);

  window.addEventListener(
    "beforeunload",
    () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onDeathRetryKeydown);
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
