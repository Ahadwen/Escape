(() => {
  // src/escape/balance.js
  var HEX_SIZE = 560 * 1.15;
  var BLOCK = 35;
  var PLAYER_RADIUS = 10;
  var PLAYER_SPEED = 198;
  var REFERENCE_TILE_W = 560;
  var CAMERA_FOLLOW_LERP = 0.18;
  var PICKUP_SPAWN_INTERVAL = 3.2;
  var CARD_SPAWN_INTERVAL = 8.5;
  var HEAL_CRYSTAL_LIFETIME_SEC = 7.2;
  var CARD_COLLECTIBLE_LIFETIME_SEC = 12;
  var HEAL_CRYSTAL_HP = 3;
  var SWAMP_BOOTLEG_CRYSTAL_HP = 2;
  var CARD_RANK_SPAWN_WEIGHT_MAX = 24;
  var CARD_RANK_SPAWN_WEIGHT_MIN = 1;
  var SET_BONUS_SUIT_THRESHOLD = 7;
  var SET_BONUS_SUIT_MAX = 13;
  var SPECIAL_PROCEDURAL_GRACE_SEC = 15;
  var SPECIAL_PROCEDURAL_POST_DESPAWN_LOCK_SEC = 10;
  var SPECIAL_PROCEDURAL_DENOM_START = 30;
  var SPECIAL_PROCEDURAL_DENOM_MIN = 12;
  var SPECIAL_PROCEDURAL_RAMP_STEP_SEC = 10;
  var _SQRT3 = Math.sqrt(3);
  var ARENA_NEXUS_INNER_HEX_SCALE = 0.62;
  var ARENA_NEXUS_INNER_ENTER_R = HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE * (_SQRT3 / 2) * 0.96;
  var ARENA_NEXUS_INNER_APOTHEM = HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE * (_SQRT3 / 2);
  var ARENA_NEXUS_SIEGE_SEC = 10;
  var ARENA_NEXUS_RING_LO = HEX_SIZE * 0.66;
  var ARENA_NEXUS_RING_HI = HEX_SIZE * 0.93;
  var ARENA_NEXUS_RING_LASER_SPAWN_INTERVAL = 2.85;
  var ARENA_NEXUS_RING_SNIPER_SPAWN_INTERVAL = 3.45;
  var ARENA_NEXUS_REWARD_MODAL_DELAY_SEC = 1.35;
  var SURGE_HEX_WAVES = 10;
  var SURGE_TRAVEL_DUR_FIRST = 1.1;
  var SURGE_TRAVEL_DUR_DECREMENT_PER_WAVE = 0.05;
  var SURGE_WAVE_PAUSE_SEC = 0.3;
  var SURGE_TILE_DAMAGE = 2;
  var SURGE_TILE_FLASH_SEC = 0.22;
  var SURGE_GAUNTLET_SAFE_DRAW_R = 81;
  var SURGE_GAUNTLET_SAFE_HIT_R = 99;
  var SURGE_GAUNTLET_MIN_CENTER_SEP_PX = SURGE_GAUNTLET_SAFE_DRAW_R * 2;
  var SPECIAL_TILE_INNER_HIT_R = HEX_SIZE * 0.38;
  var ROULETTE_INNER_HIT_R = 52;
  var ROULETTE_INNER_HEX_DRAW_R = 58;
  var ROULETTE_SPIN_SHUFFLE_SEC = 2.15;
  var ROULETTE_SPIN_WHITEOUT_SEC = 0.42;
  var ROULETTE_OUTER_PENALTY_HP = 2;
  var FORGE_OUTER_PENALTY_HP = 2;
  var SAFEHOUSE_INNER_HIT_R = 46;
  var SAFEHOUSE_EMBED_SITE_HIT_R = 28;
  var SAFEHOUSE_EMBED_CENTER_INSET = 0.4;
  var SAFEHOUSE_EMBED_HEX_VERTEX_R_MULT = 0.14;
  var SAFEHOUSE_SPENT_TILE_ANIM_MS = 1200;
  var HUNTER_FIRST_WAVE_AT_SEC = 3;
  var SPAWN_INTERVAL_START = 8;
  var SPAWN_INTERVAL_FLOOR = 1.5;
  var DANGER_RAMP_SECONDS = 300;
  var LATE_GAME_ELITE_SPAWN_SEC = 180;
  var MIDGAME_ESCALATION_START_SEC = 240;
  var MIDGAME_ESCALATION_INTERVAL_SEC = 15;
  var MIDGAME_ESCALATION_SPEED_FACTOR = 1.05;
  var BASE_WAVE_SPAWN_JOBS = 14;
  var AIR_SPAWNER_CHASE_SPEED = 84 * 1.05;
  var LASER_BLUE_COOLDOWN_SEC = 1.22;
  var LASER_BLUE_WARN_SEC = 0.3;
  var HUNTER_SPEED_AGE_COEFF = 1.1;
  var ENEMY_HIT_COOLDOWN_SEC = 0.52;
  var DAMAGE_HURT_FLASH_SEC = 0.16;
  var DAMAGE_PLAYER_INVULN_SEC = 0.35;
  var BULWARK_POST_HIT_INVULN_SEC = 0.52;
  var BULWARK_FLAG_MAX_HP = 10;
  var BULWARK_FLAG_PLANT_INVULN_SEC = 0.55;
  var BULWARK_FLAG_PLANT_CHARGE_INTERVAL_SEC = 0.5;
  var BULWARK_FLAG_PICKUP_HEAL_PER_CHARGE = 1;
  var BULWARK_FLAG_PICKUP_R = 22;
  var BULWARK_FLAG_LURE_RADIUS = 320;
  var BULWARK_FLAG_RECHARGE_PER_SEC = 0.6;
  var BULWARK_NEAR_FLAG_CD_RADIUS = 200;
  var BULWARK_DEATH_LOCK_RADIUS = 220;
  var BULWARK_DEATH_LOCK_SEC = 8;
  var BULWARK_FLAG_RESPAWN_HP = 1;
  var BULWARK_MAX_HP = 15;
  var BULWARK_CHARGE_COOLDOWN_SEC = 8;
  var BULWARK_CHARGE_COOLDOWN_NEAR_FLAG_SEC = 1.5;
  var BULWARK_PARRY_COOLDOWN_SEC = 8;
  var BULWARK_PARRY_COOLDOWN_NEAR_FLAG_SEC = 1.5;
  var BULWARK_PARRY_DURATION_SEC = 0.2;
  var BULWARK_CHARGE_DISTANCE = 236;
  var BULWARK_CHARGE_SPEED = 410;
  var BULWARK_CHARGE_PUSH_CORRIDOR_MARGIN = 30;
  var BULWARK_PASSIVE_FRONT_SHIELD_DEG = 52;
  var BULWARK_CHARGE_FRONT_SHIELD_DEG = 148;
  var BULWARK_PARRY_PUSH_RADIUS = 200;
  var BULWARK_PARRY_PUSH_DIST = 95;
  var BULWARK_CHARGE_WALL_STUN_SEC = 0.95;
  var BULWARK_CHARGE_TERRAIN_GROUP_STUN_SEC = 0.6;
  var DAMAGE_SCREEN_SHAKE_SEC = 0.18;
  var DAMAGE_SCREEN_SHAKE_STRENGTH = 8;
  var LASER_BLUE_PLAYER_SLOW_MULT = 0.8;
  var LASER_BLUE_PLAYER_SLOW_SEC = 1.5;
  var SWAMP_HIT_SLOW_MULT = 0.8;
  var SWAMP_HIT_SLOW_SEC = 1;
  var FROG_MUD_POOL_MOVE_MULT = 0.8;
  var SWAMP_L3PLUS_SNIPER_WAVE_KEEP_FRACTION = 0.4;
  var SWAMP_INFECTION_CAP = 10;
  var SWAMP_INFECTION_STACK_MIN_GAP_LEVEL2_SEC = 0.3;
  var SWAMP_INFECTION_STACK_MIN_GAP_LEVEL3_SEC = 0.2;
  var SWAMP_INFECTION_BURST_STUN_SEC = 0.4;
  var SWAMP_INFECTION_BURST_SLOW_SEC = 2;
  var SWAMP_INFECTION_BURST_SLOW_MULT = 0.45;
  var SWAMP_INFECTION_TEN_DRIFT_SEC = 0.85;
  var HEARTS_13_DEATH_DEFY_CD_SEC = 30;
  var CLUBS_13_UNTARGETABLE_SEC = 1;
  var TERRAIN_SPEED_BOOST_LINGER = 0.16;
  var ROGUE_STEALTH_AFTER_LOS_BREAK = 0.35;
  var ROGUE_STEALTH_OPEN_GRACE = 0.4;
  var ROGUE_FOOD_HUNGER_RESTORE = 30;
  var ROGUE_FOOD_LIFETIME = 21;
  var ROGUE_FOOD_SENSE_DURATION = 2.35;
  var ROGUE_FOOD_ARROW_CLOSE_PLATEAU = 96;
  var ROGUE_FOOD_ARROW_FAR_LEN = 440;
  var ROGUE_DESPERATION_SPEED_MAX = 0.2;
  var ROGUE_HUNGER_MAX = 60;
  var ROGUE_FIRST_FOOD_AT_SEC = 6;
  var LUNATIC_PASSIVE_HP_PER_SEC = 0.28;
  var LUNATIC_STUMBLE_MOVE_MULT = 0.66;
  var LUNATIC_W_TOGGLE_COOLDOWN_SEC = 4;
  var LUNATIC_SPRINT_MOMENTUM_RAMP_SEC = 8;
  var LUNATIC_SPRINT_PEAK_SPEED_MULT = 1.845;
  var LUNATIC_DECEL_SEC = 0.3;
  var LUNATIC_DECEL_SPRINT_REF_SEC = 5;
  var LUNATIC_CRASH_STUN_SEC = 0.3;
  var LUNATIC_CRASH_DAMAGE_BRACKET_1_SEC = 2;
  var LUNATIC_CRASH_DAMAGE_BRACKET_2_SEC = 4;
  var LUNATIC_CRASH_DAMAGE_TIER_1 = 1;
  var LUNATIC_CRASH_DAMAGE_TIER_2 = 2;
  var LUNATIC_CRASH_DAMAGE_TIER_3 = 3;
  var LUNATIC_TURN_RADIUS_PX = 168;
  var LUNATIC_STEER_MAX_RAD_PER_SEC = 2.35;
  var LUNATIC_ROAR_COOLDOWN_SEC = 30;
  var LUNATIC_ROAR_DURATION_SEC = 1;
  var LUNATIC_ROAR_SPEED_MULT = 1.12;
  var LUNATIC_ROAR_TERRAIN_DAMAGE_INTERVAL_SEC = 0.1;
  var LUNATIC_ROAR_TERRAIN_DAMAGE = 3;
  var LUNATIC_SPRINT_TIER_FX_DUR_T2 = 0.38;
  var LUNATIC_SPRINT_TIER_FX_DUR_T4 = 0.52;
  var VALIANT_RABBIT_BASE_HP = 4;
  var VALIANT_RESCUE_COOLDOWN_SEC = 25;
  var VALIANT_RESCUE_WILL_RESTORE = 0.4;
  var VALIANT_WILL_RABBIT_DEATH_COST = 0.25;
  var VALIANT_WILL_DECAY_PER_EMPTY_SLOT = 7e-3;
  var VALIANT_WILL_REGEN_PER_SEC_THREE_RABBITS = 3e-3;
  var VALIANT_SHOCK_BOX_W = 168;
  var VALIANT_SHOCK_BOX_H = 120;
  var VALIANT_SHOCK_BOX_DURATION_SEC = 4.6;
  var VALIANT_BUNNY_PICKUP_R = 12;
  var VALIANT_BUNNY_SPAWN_INTERVAL = 7.2;
  var VALIANT_BUNNY_LIFETIME_SEC = 18;
  var VALIANT_DIAMOND_RESCUE_WILL_BONUS = 0.12;
  var VALIANT_DIAMOND_BOX_SCALE = 1.32;
  var VALIANT_SURGE_COOLDOWN_SEC = 5;
  var VALIANT_SURGE_MIN_COOLDOWN_SEC = 0.45;
  var VALIANT_SURGE_DURATION_SEC = 3;
  var VALIANT_SURGE_SPEED_MULT = 2;
  var VALIANT_SURGE_SPEED_MULT_DIAMOND = 2.6;
  var VALIANT_SURGE_DURATION_DIAMOND_BONUS_SEC = 1.5;
  var VALIANT_SHOCK_ABILITY_COOLDOWN_SEC = 6.5;
  var VALIANT_SHOCK_ABILITY_MIN_COOLDOWN_SEC = 0.5;

  // src/escape/hexMath.js
  var SQRT3 = Math.sqrt(3);
  var HEX_DIRS = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 }
  ];
  function hexKey(q, r) {
    return `${q},${r}`;
  }
  function axialToWorld(q, r, hexRadius) {
    return {
      x: hexRadius * SQRT3 * (q + r / 2),
      y: hexRadius * 1.5 * r
    };
  }
  function axialRound(fracQ, fracR) {
    let x = fracQ;
    let z = fracR;
    let y = -x - z;
    let rx = Math.round(x);
    let ry = Math.round(y);
    let rz = Math.round(z);
    const xDiff = Math.abs(rx - x);
    const yDiff = Math.abs(ry - y);
    const zDiff = Math.abs(rz - z);
    if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz;
    else if (yDiff > zDiff) ry = -rx - rz;
    else rz = -rx - ry;
    return { q: rx, r: rz };
  }
  function worldToAxial(x, y, hexRadius) {
    const qf = SQRT3 / 3 * (x / hexRadius) - 1 / 3 * (y / hexRadius);
    const rf = 2 / 3 * y / hexRadius;
    return axialRound(qf, rf);
  }

  // src/escape/rng.js
  function randRange(a, b) {
    return a + Math.random() * (b - a);
  }
  function makeRng(seed) {
    let s = seed >>> 0;
    return () => {
      s = Math.imul(s, 1664525) + 1013904223 >>> 0;
      return s / 4294967296;
    };
  }

  // src/escape/tiles.js
  function rotatePoints(points) {
    return points.map((p) => ({ x: p.y, y: -p.x }));
  }
  function normalizePoints(points) {
    let minX = Infinity;
    let minY = Infinity;
    for (const p of points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
    }
    return points.map((p) => ({ x: p.x - minX, y: p.y - minY }));
  }
  function generateHexTileObstacles(q, r, d) {
    if (d.emptyTerrain) return [];
    const { BLOCK: BLOCK2, centerX, centerY, hexSize } = d;
    const SQRT36 = Math.sqrt(3);
    const halfW = SQRT36 * hexSize / 2;
    const halfH = hexSize;
    const TILE_COLS = Math.max(8, Math.ceil(halfW * 2 / BLOCK2));
    const TILE_ROWS = Math.max(8, Math.ceil(halfH * 2 / BLOCK2));
    const seed = q * 73856093 ^ r * 19349663 | 0;
    const rng = makeRng(seed);
    const grid = Array.from({ length: TILE_ROWS }, () => Array(TILE_COLS).fill(false));
    const inHex = Array.from({ length: TILE_ROWS }, () => Array(TILE_COLS).fill(false));
    const minRow = 0;
    const maxRow = TILE_ROWS - 1;
    const baseX = centerX - halfW;
    const baseY = centerY - halfH;
    function worldToHexRounded(x, y) {
      const qf = (SQRT36 / 3 * x - 1 / 3 * y) / hexSize;
      const rf = 2 / 3 * y / hexSize;
      let xCube = qf;
      let zCube = rf;
      let yCube = -xCube - zCube;
      let rx = Math.round(xCube);
      let ry = Math.round(yCube);
      let rz = Math.round(zCube);
      const xDiff = Math.abs(rx - xCube);
      const yDiff = Math.abs(ry - yCube);
      const zDiff = Math.abs(rz - zCube);
      if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz;
      else if (yDiff > zDiff) ry = -rx - rz;
      else rz = -rx - ry;
      return { q: rx, r: rz };
    }
    let maskCount = 0;
    for (let row = 0; row < TILE_ROWS; row++) {
      for (let col = 0; col < TILE_COLS; col++) {
        const cx = baseX + col * BLOCK2 + BLOCK2 * 0.5;
        const cy = baseY + row * BLOCK2 + BLOCK2 * 0.5;
        const owner = worldToHexRounded(cx, cy);
        const inside = owner.q === q && owner.r === r;
        inHex[row][col] = inside;
        if (inside) maskCount++;
      }
    }
    const tetrominoes = [
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }],
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }],
      [{ x: 2, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }],
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }]
    ];
    let filled = 0;
    const targetBlocks = Math.floor(maskCount * (0.145 + rng() * 0.04));
    let safety = 0;
    while (filled < targetBlocks && safety < 620) {
      safety++;
      const base = tetrominoes[Math.floor(rng() * tetrominoes.length)];
      let points = base.map((p) => ({ ...p }));
      const rotations = Math.floor(rng() * 4);
      for (let i = 0; i < rotations; i++) points = rotatePoints(points);
      points = normalizePoints(points);
      const maxX = Math.max(...points.map((p) => p.x));
      const maxY = Math.max(...points.map((p) => p.y));
      const originX = Math.floor(rng() * Math.max(1, TILE_COLS - (maxX + 1)));
      const originYMin = minRow;
      const originYMax = maxRow - maxY;
      if (originYMax < originYMin) continue;
      const originY = originYMin + Math.floor(rng() * (originYMax - originYMin + 1));
      let ok = true;
      for (const p of points) {
        const gx = originX + p.x;
        const gy = originY + p.y;
        if (gx < 0 || gx >= TILE_COLS || gy < minRow || gy > maxRow || grid[gy][gx] || !inHex[gy][gx]) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      for (const p of points) {
        const gx = originX + p.x;
        const gy = originY + p.y;
        grid[gy][gx] = true;
        filled++;
      }
    }
    for (let i = 0; i < 5; i++) {
      const c = Math.floor(rng() * TILE_COLS);
      const start = Math.floor(rng() * TILE_ROWS);
      const len = Math.floor(TILE_ROWS * (0.45 + rng() * 0.35));
      for (let k = 0; k < len; k++) {
        const rr = start + k;
        if (rr < 0 || rr >= TILE_ROWS) continue;
        if (inHex[rr][c]) grid[rr][c] = false;
      }
    }
    for (let i = 0; i < 5; i++) {
      const row = minRow + Math.floor(rng() * Math.max(1, maxRow - minRow + 1));
      const start = Math.floor(rng() * TILE_COLS);
      const len = Math.floor(TILE_COLS * (0.45 + rng() * 0.35));
      for (let k = 0; k < len; k++) {
        const cc = start + k;
        if (cc < 0 || cc >= TILE_COLS) continue;
        if (inHex[row][cc]) grid[row][cc] = false;
      }
    }
    const rects = [];
    for (let rr = minRow; rr <= maxRow; rr++) {
      for (let c = 0; c < TILE_COLS; c++) {
        if (!grid[rr][c] || !inHex[rr][c]) continue;
        rects.push({ x: baseX + c * BLOCK2, y: baseY + rr * BLOCK2, w: BLOCK2, h: BLOCK2 });
      }
    }
    return rects;
  }

  // src/escape/WorldGeneration/tileGenerator.js
  function referenceTileGridFromCanvasHeight(canvasHeight) {
    return {
      TILE_COLS: 16,
      TILE_ROWS: Math.floor(canvasHeight / 35),
      TILE_W: REFERENCE_TILE_W
    };
  }

  // src/escape/gameControls.js
  var ARROWS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  function attachArrowKeyState(win = window) {
    const down = Object.fromEntries(ARROWS.map((k) => [k, false]));
    function onDown(e) {
      if (ARROWS.includes(e.key)) {
        down[e.key] = true;
        e.preventDefault();
      }
    }
    function onUp(e) {
      if (ARROWS.includes(e.key)) {
        down[e.key] = false;
        e.preventDefault();
      }
    }
    win.addEventListener("keydown", onDown);
    win.addEventListener("keyup", onUp);
    return {
      isDown(key) {
        return !!down[key];
      },
      /** Clear held movement keys (REFERENCE `state.keys.clear()` on manual pause). */
      clearHeld() {
        for (const k of ARROWS) down[k] = false;
      },
      dispose() {
        win.removeEventListener("keydown", onDown);
        win.removeEventListener("keyup", onUp);
      }
    };
  }
  function attachHeldLetterKeys(win = window, letters = ["q", "e"]) {
    const norm = letters.map((l) => String(l).toLowerCase());
    const down = Object.fromEntries(norm.map((k) => [k, false]));
    function onDown(e) {
      if (e.repeat) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : "";
      if (!norm.includes(k)) return;
      down[k] = true;
      e.preventDefault();
    }
    function onUp(e) {
      const k = e.key.length === 1 ? e.key.toLowerCase() : "";
      if (!norm.includes(k)) return;
      down[k] = false;
      e.preventDefault();
    }
    win.addEventListener("keydown", onDown);
    win.addEventListener("keyup", onUp);
    return {
      isDown(letter) {
        return !!down[String(letter).toLowerCase()];
      },
      clearHeld() {
        for (const k of norm) down[k] = false;
      },
      dispose() {
        win.removeEventListener("keydown", onDown);
        win.removeEventListener("keyup", onUp);
      }
    };
  }

  // src/escape/controls/abilityKeys.js
  var DEFAULT_SLOTS = ["q", "w", "e", "r"];
  var SHELL_SELECTS_THAT_DO_NOT_BLOCK_ABILITY_KEYS = [
    "#dev-active-hero-select",
    "#special-test-west-select",
    "#game-speed",
    "#debug-item-suit",
    "#debug-item-rank",
    "#debug-item-effect",
    "#debug-path-select"
  ];
  function isShellControlThatKeepsFocusButAllowsAbilityKeys(el) {
    if (!el || !(el instanceof Element)) return false;
    for (const sel of SHELL_SELECTS_THAT_DO_NOT_BLOCK_ABILITY_KEYS) {
      if (el.matches(sel) || el.closest(sel)) return true;
    }
    return false;
  }
  function isDomShellTypingTarget(el) {
    if (!el || !(el instanceof Element)) return false;
    if (isShellControlThatKeepsFocusButAllowsAbilityKeys(el)) return false;
    return !!el.closest("input, textarea, select, button, [contenteditable=true]");
  }
  function attachAbilityKeyPresses(win = window, onPress, slots = DEFAULT_SLOTS, onRelease = null) {
    const slotList = slots ?? DEFAULT_SLOTS;
    function onKeyDown(e) {
      if (e.repeat) return;
      if (isDomShellTypingTarget(e.target)) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (!slotList.includes(k)) return;
      e.preventDefault();
      onPress(k);
    }
    function onKeyUp(e) {
      if (!onRelease) return;
      if (isDomShellTypingTarget(e.target)) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (!slotList.includes(k)) return;
      e.preventDefault();
      onRelease(k);
    }
    win.addEventListener("keydown", onKeyDown);
    if (onRelease) win.addEventListener("keyup", onKeyUp);
    return {
      dispose() {
        win.removeEventListener("keydown", onKeyDown);
        if (onRelease) win.removeEventListener("keyup", onKeyUp);
      }
    };
  }

  // src/escape/items/ultimateSlot.js
  var ULTIMATE_ABILITY_COOLDOWN_SEC = 20;
  var ULT_BURST_RADIUS = 250;
  var ULT_BURST_WAVE_COUNT = 4;
  var ULT_BURST_WAVE_SPAN_SEC = 2;
  var KNIGHT_SPADES_WORLD_SLOW_SEC = 2;
  function getEquippedUltimateType(inventory2) {
    const ace = inventory2?.deckByRank?.[1];
    const e = ace?.effect;
    return e && e.kind === "ultimate" ? e.ultType : null;
  }
  function cdRemaining(readyAt, elapsed) {
    return Math.max(0, readyAt - elapsed);
  }
  function cdValue(readyAt, elapsed) {
    const left = cdRemaining(readyAt, elapsed);
    if (left <= 0.05) return "READY";
    return `${left.toFixed(1)}s`;
  }
  function ultimateDisplayName(ultType) {
    if (ultType === "shield") return "Shield";
    if (ultType === "burst") return "Earthquake";
    if (ultType === "timelock") return "Timelock";
    if (ultType === "heal") return "Heal";
    return "Ultimate";
  }
  function buildEquippedUltimateHud(inventory2, elapsed, fallbackLabel = "Ultimate", color = "#60a5fa") {
    const ultType = getEquippedUltimateType(inventory2);
    const hasAceUlt = !!ultType;
    const readyAt = Number(inventory2?.aceUltimateReadyAt ?? 0);
    const displayName = ultimateDisplayName(ultType);
    return {
      label: hasAceUlt ? displayName : fallbackLabel,
      value: hasAceUlt ? cdValue(readyAt, elapsed) : "---",
      fill: {
        remaining: hasAceUlt ? cdRemaining(readyAt, elapsed) : 1,
        duration: hasAceUlt ? ULTIMATE_ABILITY_COOLDOWN_SEC : 1,
        color
      }
    };
  }
  function applyUltimateBurstWavePush(player, hunterEntities, burstRadius) {
    if (!hunterEntities) return;
    for (const h of hunterEntities.hunters ?? []) {
      const dx = h.x - player.x;
      const dy = h.y - player.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > burstRadius * burstRadius) continue;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const push = h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner" ? 0 : 95;
      h.x += ux * push;
      h.y += uy * push;
      h.dir = { x: ux, y: uy };
    }
    for (let i = (hunterEntities.projectiles?.length ?? 0) - 1; i >= 0; i--) {
      const p = hunterEntities.projectiles[i];
      const dx = p.x - player.x;
      const dy = p.y - player.y;
      if (dx * dx + dy * dy <= burstRadius * burstRadius) hunterEntities.projectiles.splice(i, 1);
    }
  }
  function tryUseEquippedUltimate(ctx) {
    const ultType = getEquippedUltimateType(ctx.inventory);
    if (!ultType) return false;
    const elapsed = ctx.elapsed ?? 0;
    const readyAt = Number(ctx.inventory.aceUltimateReadyAt ?? 0);
    if (elapsed < readyAt) return true;
    if (ultType === "shield") {
      ctx.bumpScreenShake?.(9, 0.2);
      ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 28, "#ffffff", 0.12);
      ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 52, "#bfdbfe", 0.34);
      ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 88, "#60a5fa", 0.42);
      ctx.spawnUltimateEffect?.("shieldSummon", ctx.player.x, ctx.player.y, "#93c5fd", 0.95, 88);
      ctx.setUltimateShields?.(elapsed, ctx.player.r + 34);
    } else if (ultType === "burst") {
      ctx.bumpScreenShake?.(13, 0.24);
      ctx.setUltimateSpeedUntil?.(elapsed + ULT_BURST_WAVE_SPAN_SEC);
      ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ULT_BURST_RADIUS * 0.35, "#ffffff", 0.14);
      ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ULT_BURST_RADIUS * 0.72, "#bfdbfe", 0.24);
      ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ULT_BURST_RADIUS * 0.95, "#93c5fd", 0.28);
      ctx.spawnUltimateEffect?.("burstWave", ctx.player.x, ctx.player.y, "#e0f2fe", 0.4, ULT_BURST_RADIUS * 0.6);
      ctx.scheduleBurstWaves?.(elapsed, ULT_BURST_WAVE_COUNT, ULT_BURST_WAVE_SPAN_SEC, ULT_BURST_RADIUS);
      applyUltimateBurstWavePush(ctx.player, ctx.hunterEntities, ULT_BURST_RADIUS);
    } else if (ultType === "timelock") {
      ctx.bumpScreenShake?.(6, 0.18);
      ctx.grantInvulnerabilityUntil?.(elapsed + 4);
      ctx.setPlayerTimelockUntil?.(elapsed + 2);
      ctx.setTimelockWindow?.(elapsed + 2, elapsed + 4);
      ctx.setTimelockWorldShakeAt?.(elapsed + 2);
      ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 18, "#faf5ff", 0.22);
      ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 36, "#e9d5ff", 0.32);
      ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 58, "#c084fc", 0.4);
      ctx.spawnUltimateEffect?.("timelock", ctx.player.x, ctx.player.y, "#c084fc", 4, 56);
      ctx.spawnUltimateEffect?.("timelockWorld", ctx.player.x, ctx.player.y, "#c4b5fd", 2, ULT_BURST_RADIUS * 1.05, {
        bornAt: elapsed + 2,
        expiresAt: elapsed + 4
      });
    } else if (ultType === "heal") {
      ctx.bumpScreenShake?.(7, 0.18);
      ctx.setTempHp?.(3, elapsed + 20);
      ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 18, "#ecfdf5", 0.2);
      ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 38, "#bbf7d0", 0.34);
      ctx.spawnAttackRing?.(ctx.player.x, ctx.player.y, ctx.player.r + 62, "#34d399", 0.42);
      ctx.spawnUltimateEffect?.("healVitality", ctx.player.x, ctx.player.y, "#34d399", 1.15, 72);
    }
    const spades = ctx.countActiveSuits?.().spades ?? 0;
    if (spades >= SET_BONUS_SUIT_THRESHOLD) {
      ctx.setWorldSlowUntil?.(elapsed + KNIGHT_SPADES_WORLD_SLOW_SEC);
    }
    ctx.inventory.aceUltimateReadyAt = elapsed + ULTIMATE_ABILITY_COOLDOWN_SEC;
    return true;
  }

  // src/escape/items/cardUtils.js
  var SUIT_GLYPH = {
    diamonds: "\u2666",
    hearts: "\u2665",
    clubs: "\u2663",
    spades: "\u2660",
    joker: "\u2605"
  };
  var MODAL_SET_SUIT_ORDER = ["hearts", "diamonds", "clubs", "spades"];
  var CARD_SET_GLOW_CLASSES = [
    "card-set-glow-red",
    "card-set-glow-yellow",
    "card-set-glow-green",
    "card-set-glow-blue",
    "card-set-glow-white"
  ];
  function cardRankText(rank) {
    if (rank === 1) return "A";
    if (rank === 11) return "J";
    if (rank === 12) return "Q";
    if (rank === 13) return "K";
    return String(rank);
  }
  function formatCardName(card) {
    return `${cardRankText(card.rank)}${SUIT_GLYPH[card.suit] ?? "?"}`;
  }
  function formatCardHudSuitGlyph(card) {
    if (!card) return "?";
    if (card.suit === "joker") return SUIT_GLYPH.joker;
    return SUIT_GLYPH[card.suit] ?? "?";
  }
  function deckKey(suit, rank) {
    return `${suit}:${rank}`;
  }
  var SUITS = ["diamonds", "hearts", "clubs", "spades"];
  function makePickupFlipFace(realCard) {
    for (let attempt = 0; attempt < 32; attempt++) {
      const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
      const rank = 1 + Math.floor(Math.random() * 13);
      if (suit !== realCard.suit || rank !== realCard.rank) return { suit, rank };
    }
    const altSuit = SUITS.find((s) => s !== realCard.suit) ?? "spades";
    return { suit: altSuit, rank: realCard.rank === 1 ? 2 : realCard.rank - 1 };
  }
  function makePickupVisualPair(realCard) {
    const a = makePickupFlipFace(realCard);
    for (let attempt = 0; attempt < 24; attempt++) {
      const b = makePickupFlipFace(realCard);
      if (b.suit !== a.suit || b.rank !== a.rank) {
        return { visualCardA: a, visualCardB: b };
      }
    }
    return {
      visualCardA: a,
      visualCardB: { suit: a.suit === "spades" ? "hearts" : "spades", rank: a.rank === 13 ? 1 : a.rank + 1 }
    };
  }

  // src/escape/items/inventoryState.js
  function createEmptyInventory() {
    const deckByRank = {};
    for (let r = 1; r <= 13; r++) deckByRank[r] = null;
    return {
      deckByRank,
      backpackSlots: (
        /** @type {(object | null)[]} */
        [null, null, null]
      ),
      diamondEmpower: null,
      valiantElectricBoxChargeBonus: 0,
      heartsRegenPerSec: 0,
      heartsRegenBank: 0,
      heartsResistanceReadyAt: 0,
      heartsResistanceCooldownDuration: 0,
      swampInfectionStacks: 0,
      /** Swamp bootleg crystal curses (runtime rows; cleared on run / path reset). */
      swampBootlegCurses: (
        /** @type {object[]} */
        []
      ),
      swampBootlegCdDash: 0,
      swampBootlegCdBurst: 0,
      swampBootlegSpellSilenceUntil: 0,
      swampBootlegBloodTax: null,
      spadesObstacleBoostUntil: 0,
      aceUltimateReadyAt: 0,
      /** Seven diamonds in rank deck — larger dash range and smoke radius (rogue). */
      rogueDiamondRangeBoost: false,
      /** Lunatic passive fractional HP bank (whole HP granted when bank ≥ 1). */
      lunaticRegenBank: 0
    };
  }
  function addReservedDeckKey(card, reserved) {
    if (card?.suit != null && Number.isInteger(card.rank)) {
      reserved.add(deckKey(card.suit, card.rank));
      if (card.suit === "joker") {
        for (const s of ["diamonds", "hearts", "clubs", "spades"]) {
          reserved.add(deckKey(s, card.rank));
        }
      }
    }
  }
  function collectReservedDeckKeys(inventory2, pendingCard, worldCards) {
    const reserved = /* @__PURE__ */ new Set();
    addReservedDeckKey(pendingCard, reserved);
    for (let r = 1; r <= 13; r++) addReservedDeckKey(inventory2.deckByRank[r], reserved);
    for (const c of inventory2.backpackSlots) addReservedDeckKey(c, reserved);
    for (const w of worldCards) addReservedDeckKey(w.card, reserved);
    return reserved;
  }
  function forEachDeckCard(inventory2, fn) {
    for (let r = 1; r <= 13; r++) {
      const c = inventory2.deckByRank[r];
      if (c) fn(c, r);
    }
  }

  // src/escape/Characters/Knight.js
  var LABEL_Q = "Dash";
  var LABEL_W = "Burst";
  var LABEL_E = "Decoy";
  var LABEL_R = "Ultimate";
  var KNIGHT_MAX_HP = 10;
  var DASH_COOLDOWN = 2.2;
  var DASH_DISTANCE = 120;
  var DASH_DISTANCE_EMPOWERED = 240;
  var BURST_COOLDOWN = 5;
  var BURST_DURATION = 3;
  var BURST_SPEED_MULT = 2;
  var DECOY_COOLDOWN = 8;
  var DECOY_DURATION = 5;
  var DECOY_MIN_UPTIME_SEC = 0.3;
  var DECOY_HITS_AFTER_ARM = 4;
  var KNIGHT_DIAMOND_DECOY_DURATION_BONUS_SEC = 2.5;
  var KNIGHT_DIAMOND_DECOY_HITS_BONUS = 3;
  var KNIGHT_DIAMOND_BURST_SPEED_MULT = 2.6;
  var KNIGHT_DIAMOND_BURST_DURATION_BONUS_SEC = 1.5;
  function clamp(x, a, b) {
    return Math.max(a, Math.min(b, x));
  }
  function cdRemaining2(readyAt, elapsed) {
    return Math.max(0, readyAt - elapsed);
  }
  function cdValue2(readyAt, elapsed) {
    const left = cdRemaining2(readyAt, elapsed);
    if (left <= 0.05) return "READY";
    return `${left.toFixed(1)}s`;
  }
  function sumInvisBurstSecondsFromDeck(inventory2) {
    let s = 0;
    forEachDeckCard(inventory2, (c) => {
      if (c?.effect?.kind === "invisBurst" && typeof c.effect.value === "number") s += c.effect.value;
    });
    return s;
  }
  function createKnight() {
    let dashReadyAt = 0;
    let burstReadyAt = 0;
    let decoyReadyAt = 0;
    let currentInventory = null;
    let burstUntil = 0;
    let decoys = [];
    let invulnUntil = 0;
    let dashChargesMax = 1;
    let dashCharges = 1;
    let dashNextRechargeAt = 0;
    const cdrHud = { dash: "", burst: "", decoy: "" };
    function collectPassive2(inventory2) {
      const p = {
        cooldownFlat: { dash: 0, burst: 0, decoy: 0 },
        cooldownPct: { dash: 0, burst: 0, decoy: 0 },
        speedMult: 1,
        obstacleTouchMult: 1,
        dodgeChanceWhenDashCd: 0,
        stunOnHitSecs: 0,
        invisOnBurst: 0,
        dashChargesBonus: 0,
        heartsShieldArc: 0,
        maxHpBonus: 0,
        suits: { diamonds: 0, hearts: 0, clubs: 0, spades: 0 }
      };
      forEachDeckCard(inventory2, (card) => {
        if (!card?.suit) return;
        if (card.suit === "joker") {
          p.suits.diamonds += 1;
          p.suits.hearts += 1;
          p.suits.clubs += 1;
          p.suits.spades += 1;
        } else if (p.suits[card.suit] != null) {
          p.suits[card.suit] += 1;
        }
        const e = card.effect;
        if (!e) return;
        if (e.kind === "cooldown") p.cooldownFlat[e.target] = (p.cooldownFlat[e.target] ?? 0) + e.value;
        else if (e.kind === "cooldownPct") p.cooldownPct[e.target] = (p.cooldownPct[e.target] ?? 0) + e.value;
        else if (e.kind === "maxHp") p.maxHpBonus += e.value;
        else if (e.kind === "dodge") p.dodgeChanceWhenDashCd += e.value;
        else if (e.kind === "stun") p.stunOnHitSecs += e.value;
        else if (e.kind === "invisBurst") p.invisOnBurst += e.value;
        else if (e.kind === "speed") p.speedMult += e.value;
        else if (e.kind === "terrainBoost") p.obstacleTouchMult += e.value;
        else if (e.kind === "dashCharge") p.dashChargesBonus += e.value;
        else if (e.kind === "frontShield") p.heartsShieldArc += e.arc;
      });
      return p;
    }
    function effectiveCooldown2(passive, abilityId, baseCooldown, minCooldown, inventory2) {
      const flat = passive.cooldownFlat[abilityId] || 0;
      const pct = clamp(passive.cooldownPct[abilityId] || 0, 0, 0.85);
      const baseEff = Math.max(0.3, minCooldown, Math.max(0, baseCooldown - flat) * (1 - pct));
      const swQ = abilityId === "dash" ? inventory2?.swampBootlegCdDash ?? 0 : 0;
      const swW = abilityId === "burst" ? inventory2?.swampBootlegCdBurst ?? 0 : 0;
      return baseEff + swQ + swW;
    }
    function cooldownIndicator2(baseCooldown, effectiveCooldownSec) {
      const reducedBy = Math.max(0, baseCooldown - effectiveCooldownSec);
      if (reducedBy <= 0.05) return "";
      return ` \u2193${reducedBy.toFixed(1)}s`;
    }
    function diamondOmniEmpowerActive(passive) {
      return passive.suits.diamonds >= SET_BONUS_SUIT_MAX;
    }
    function diamondSpeedEmpowerActive(passive, inventory2) {
      return passive.suits.diamonds >= SET_BONUS_SUIT_THRESHOLD && (inventory2.diamondEmpower === "speedPassive" || diamondOmniEmpowerActive(passive));
    }
    function diamondDecoyEmpowerActive(passive, inventory2) {
      return passive.suits.diamonds >= SET_BONUS_SUIT_THRESHOLD && (inventory2?.diamondEmpower === "decoyFortify" || diamondOmniEmpowerActive(passive));
    }
    function dashDistanceForState(passive, inventory2) {
      const omniEmpower = diamondOmniEmpowerActive(passive);
      const dash2xEmpower = inventory2?.diamondEmpower === "dash2x";
      return dash2xEmpower || omniEmpower ? DASH_DISTANCE_EMPOWERED : DASH_DISTANCE;
    }
    function tryDash(ctx) {
      const { player, elapsed, resolvePlayer, spawnAttackRing, circleHitsObstacle, inventory: inventory2 } = ctx;
      const passive = collectPassive2(inventory2);
      if (dashCharges <= 0) return;
      const dashCd = effectiveCooldown2(passive, "dash", DASH_COOLDOWN, 0.25, inventory2);
      dashCharges -= 1;
      if (dashCharges < dashChargesMax && dashNextRechargeAt <= elapsed) {
        dashNextRechargeAt = elapsed + dashCd;
        dashReadyAt = dashNextRechargeAt;
      }
      const dashDistance = dashDistanceForState(passive, inventory2);
      const len = Math.hypot(player.facing.x, player.facing.y) || 1;
      const fx = player.facing.x / len;
      const fy = player.facing.y / len;
      const step = 12;
      let tx = player.x;
      let ty = player.y;
      let progressed = false;
      if (typeof circleHitsObstacle === "function") {
        for (let d = step; d <= dashDistance; d += step) {
          const nx = player.x + fx * d;
          const ny = player.y + fy * d;
          if (circleHitsObstacle(nx, ny, player.r)) continue;
          tx = nx;
          ty = ny;
          progressed = true;
        }
      } else {
        tx = player.x + fx * dashDistance;
        ty = player.y + fy * dashDistance;
        progressed = true;
      }
      if (progressed) {
        const res = resolvePlayer(tx, ty, player.r);
        player.x = res.x;
        player.y = res.y;
      }
      if (progressed && typeof spawnAttackRing === "function") {
        spawnAttackRing(player.x, player.y, 30, "rgba(56, 189, 248, 0.4)", 0.1);
      }
      if (progressed && typeof ctx.spawnKnightDashEndSplash === "function") {
        ctx.spawnKnightDashEndSplash(player.x, player.y);
      }
    }
    function tryBurst(ctx) {
      const { player, elapsed, inventory: inventory2, spawnAttackRing } = ctx;
      const passive = collectPassive2(inventory2);
      if (elapsed < burstReadyAt) return;
      burstReadyAt = elapsed + effectiveCooldown2(passive, "burst", BURST_COOLDOWN, 0.4, inventory2);
      const burstDurBonus = diamondSpeedEmpowerActive(passive, inventory2) ? KNIGHT_DIAMOND_BURST_DURATION_BONUS_SEC : 0;
      burstUntil = elapsed + BURST_DURATION + burstDurBonus;
      const invisSec = passive.invisOnBurst + sumInvisBurstSecondsFromDeck(inventory2);
      if (invisSec > 0) {
        const invisUntil = Math.min(burstUntil, elapsed + invisSec);
        inventory2.clubsInvisUntil = Math.max(inventory2.clubsInvisUntil ?? 0, invisUntil);
      }
      if (typeof spawnAttackRing === "function") {
        spawnAttackRing(player.x, player.y, 72, "#94a3b8", 0.2);
        spawnAttackRing(player.x, player.y, 128, "#cbd5e1", 0.28);
      }
    }
    function tryDecoy(ctx) {
      const { player, elapsed, spawnAttackRing, inventory: inventory2 } = ctx;
      const passive = collectPassive2(inventory2);
      if (elapsed < decoyReadyAt) return;
      decoyReadyAt = elapsed + effectiveCooldown2(passive, "decoy", DECOY_COOLDOWN, 0.4, inventory2);
      const decoyEmpower = diamondDecoyEmpowerActive(passive, inventory2);
      decoys.push({
        x: player.x,
        y: player.y,
        r: player.r * 0.85,
        until: elapsed + DECOY_DURATION + (decoyEmpower ? KNIGHT_DIAMOND_DECOY_DURATION_BONUS_SEC : 0),
        invulnerableUntil: elapsed + DECOY_MIN_UPTIME_SEC,
        hp: DECOY_HITS_AFTER_ARM + (decoyEmpower ? KNIGHT_DIAMOND_DECOY_HITS_BONUS : 0)
      });
      if (typeof spawnAttackRing === "function") {
        spawnAttackRing(player.x, player.y, player.r + 24, "#818cf8", 0.25);
      }
    }
    return {
      id: "knight",
      getCombatProfile() {
        return { maxHp: KNIGHT_MAX_HP, startingHp: KNIGHT_MAX_HP };
      },
      getHpHudYOffset() {
        return 0;
      },
      getShellUi() {
        return {
          controlsHintLine: `Move: Arrows | ${LABEL_Q} (Q), ${LABEL_W} (W), ${LABEL_E} (E), ${LABEL_R} (R \u2014 item deck can override R) | Pause: Space | After death: Enter or Choose hero \u2192 character select`
        };
      },
      getDecoys() {
        return decoys;
      },
      getInvulnUntil() {
        return invulnUntil;
      },
      /** For REFERENCE-style burst cyan halo (`player.burstUntil`). */
      getBurstVisualUntil(elapsed) {
        return elapsed < burstUntil ? burstUntil : 0;
      },
      tick(ctx) {
        const { elapsed, player, inventory: inventory2 } = ctx;
        currentInventory = inventory2;
        const passive = collectPassive2(inventory2);
        const dashCd = effectiveCooldown2(passive, "dash", DASH_COOLDOWN, 0.25, inventory2);
        const burstCd = effectiveCooldown2(passive, "burst", BURST_COOLDOWN, 0.4, inventory2);
        const decoyCd = effectiveCooldown2(passive, "decoy", DECOY_COOLDOWN, 0.4, inventory2);
        dashChargesMax = 1 + passive.dashChargesBonus;
        dashCharges = Math.min(dashCharges, dashChargesMax);
        if (dashCharges >= dashChargesMax) {
          dashNextRechargeAt = 0;
          dashReadyAt = 0;
        } else if (dashNextRechargeAt <= 0) {
          dashNextRechargeAt = elapsed + dashCd;
          dashReadyAt = dashNextRechargeAt;
        }
        if (dashCharges < dashChargesMax && dashNextRechargeAt > 0 && elapsed >= dashNextRechargeAt) {
          dashCharges = dashChargesMax;
          dashNextRechargeAt = 0;
          dashReadyAt = dashNextRechargeAt;
        }
        decoys = decoys.filter((d) => d.until > elapsed);
        const burstLeg = elapsed < burstUntil || diamondSpeedEmpowerActive(passive, inventory2);
        player.speedBurstMult = burstLeg ? diamondSpeedEmpowerActive(passive, inventory2) ? KNIGHT_DIAMOND_BURST_SPEED_MULT : BURST_SPEED_MULT : 1;
        player.speedPassiveMult = passive.speedMult;
        player.terrainTouchMult = passive.obstacleTouchMult;
        player.dodgeChanceWhenDashCd = passive.dodgeChanceWhenDashCd;
        player.stunOnHitSecs = passive.stunOnHitSecs;
        player.frontShieldArcDeg = passive.heartsShieldArc;
        player.maxHp = Math.max(1, KNIGHT_MAX_HP + passive.maxHpBonus);
        player.hp = Math.min(player.hp, player.maxHp);
        inventory2.heartsRegenPerSec = passive.suits.hearts >= SET_BONUS_SUIT_THRESHOLD ? 0.3 : 0;
        cdrHud.dash = cooldownIndicator2(DASH_COOLDOWN, dashCd);
        cdrHud.burst = cooldownIndicator2(BURST_COOLDOWN, burstCd);
        cdrHud.decoy = cooldownIndicator2(DECOY_COOLDOWN, decoyCd);
        if (!getEquippedUltimateType(inventory2)) inventory2.aceUltimateReadyAt = 0;
      },
      getAbilityHud(elapsed) {
        const dashChargesText = `${dashCharges}/${dashChargesMax}`;
        const dashCdText = cdValue2(dashReadyAt, elapsed);
        const ultimateHud = buildEquippedUltimateHud(currentInventory, elapsed, LABEL_R, "#60a5fa");
        return {
          q: {
            label: LABEL_Q,
            value: dashCdText === "READY" ? `${dashChargesText}${cdrHud.dash} READY` : `${dashChargesText}${cdrHud.dash} ${dashCdText}`,
            fill: {
              remaining: cdRemaining2(dashReadyAt, elapsed),
              duration: DASH_COOLDOWN,
              color: "#38bdf8"
            }
          },
          w: {
            label: LABEL_W,
            value: `${cdrHud.burst ? cdrHud.burst.trim() + " " : ""}${cdValue2(burstReadyAt, elapsed)}`,
            fill: {
              remaining: cdRemaining2(burstReadyAt, elapsed),
              duration: BURST_COOLDOWN,
              color: "#22d3ee"
            }
          },
          e: {
            label: LABEL_E,
            value: `${cdrHud.decoy ? cdrHud.decoy.trim() + " " : ""}${cdValue2(decoyReadyAt, elapsed)}`,
            fill: {
              remaining: cdRemaining2(decoyReadyAt, elapsed),
              duration: DECOY_COOLDOWN,
              color: "#a78bfa"
            }
          },
          r: {
            ...ultimateHud
          }
        };
      },
      onAbilityPress(slot, ctx) {
        if (slot === "r") return;
        if (slot === "q") tryDash(ctx);
        else if (slot === "w") tryBurst(ctx);
        else if (slot === "e") tryDecoy(ctx);
      },
      isDashCoolingDown(elapsed) {
        return elapsed < dashReadyAt || dashCharges < dashChargesMax;
      }
    };
  }

  // src/escape/Characters/Rogue.js
  var LABEL_Q2 = "Dash";
  var LABEL_W2 = "Smoke";
  var LABEL_E2 = "Consume";
  var LABEL_R2 = "Ultimate";
  var ROGUE_MAX_HP = 7;
  var DASH_COOLDOWN2 = 2.2;
  var BURST_COOLDOWN2 = 16;
  var CONSUME_COOLDOWN = 4.5;
  var DASH_RANGE_BASE = 120;
  var DASH_RANGE_DIAMONDS = 180;
  var DASH_RANGE_DIAMONDS_13 = 220;
  var SMOKE_DURATION = 3;
  function clamp2(x, a, b) {
    return Math.max(a, Math.min(b, x));
  }
  function cdRemaining3(readyAt, elapsed) {
    return Math.max(0, readyAt - elapsed);
  }
  function cdValue3(readyAt, elapsed, dashAiming) {
    if (dashAiming) return "AIM";
    const left = cdRemaining3(readyAt, elapsed);
    if (left <= 0.05) return "READY";
    return `${left.toFixed(1)}s`;
  }
  function collectSuits(inventory2) {
    const suits = { diamonds: 0, hearts: 0, clubs: 0, spades: 0 };
    forEachDeckCard(inventory2, (card) => {
      if (!card?.suit) return;
      if (card.suit === "joker") {
        suits.diamonds += 1;
        suits.hearts += 1;
        suits.clubs += 1;
        suits.spades += 1;
      } else if (suits[card.suit] != null) {
        suits[card.suit] += 1;
      }
    });
    return suits;
  }
  function collectPassive(inventory2) {
    const p = {
      cooldownFlat: { dash: 0, burst: 0, decoy: 0 },
      cooldownPct: { dash: 0, burst: 0, decoy: 0 },
      speedMult: 1,
      obstacleTouchMult: 1,
      dodgeChanceWhenDashCd: 0,
      stunOnHitSecs: 0,
      invisOnBurst: 0,
      dashChargesBonus: 0,
      heartsShieldArc: 0,
      maxHpBonus: 0,
      suits: { diamonds: 0, hearts: 0, clubs: 0, spades: 0 }
    };
    forEachDeckCard(inventory2, (card) => {
      if (!card?.suit) return;
      if (card.suit === "joker") {
        p.suits.diamonds += 1;
        p.suits.hearts += 1;
        p.suits.clubs += 1;
        p.suits.spades += 1;
      } else if (p.suits[card.suit] != null) {
        p.suits[card.suit] += 1;
      }
      const e = card.effect;
      if (!e) return;
      if (e.kind === "cooldown") p.cooldownFlat[e.target] = (p.cooldownFlat[e.target] ?? 0) + e.value;
      else if (e.kind === "cooldownPct") p.cooldownPct[e.target] = (p.cooldownPct[e.target] ?? 0) + e.value;
      else if (e.kind === "maxHp") p.maxHpBonus += e.value;
      else if (e.kind === "dodge") p.dodgeChanceWhenDashCd += e.value;
      else if (e.kind === "stun") p.stunOnHitSecs += e.value;
      else if (e.kind === "invisBurst") p.invisOnBurst += e.value;
      else if (e.kind === "speed") p.speedMult += e.value;
      else if (e.kind === "terrainBoost") p.obstacleTouchMult += e.value;
      else if (e.kind === "dashCharge") p.dashChargesBonus += e.value;
      else if (e.kind === "frontShield") p.heartsShieldArc += e.arc;
    });
    return p;
  }
  function effectiveCooldown(passive, abilityId, baseCooldown, minCooldown, inventory2) {
    const flat = passive.cooldownFlat[abilityId] || 0;
    const pct = clamp2(passive.cooldownPct[abilityId] || 0, 0, 0.85);
    const baseEff = Math.max(0.3, minCooldown, Math.max(0, baseCooldown - flat) * (1 - pct));
    const swQ = abilityId === "dash" ? inventory2?.swampBootlegCdDash ?? 0 : 0;
    const swW = abilityId === "burst" ? inventory2?.swampBootlegCdBurst ?? 0 : 0;
    return baseEff + swQ + swW;
  }
  function cooldownIndicator(baseCooldown, effectiveCooldownSec) {
    const reducedBy = Math.max(0, baseCooldown - effectiveCooldownSec);
    if (reducedBy <= 0.05) return "";
    return ` \u2193${reducedBy.toFixed(1)}s`;
  }
  function createRogue(rogueWorld) {
    let dashReadyAt = 0;
    let burstReadyAt = 0;
    let consumeReadyAt = 0;
    let currentInventory = null;
    let smokeUntil = 0;
    const cdrHud = { dash: "", burst: "", decoy: "" };
    function currentDashRange(inventory2) {
      if (inventory2?.rogueDiamondRangeBoost) {
        const suits = collectSuits(inventory2);
        if (suits.diamonds >= 13) return DASH_RANGE_DIAMONDS_13;
        return DASH_RANGE_DIAMONDS;
      }
      return DASH_RANGE_BASE;
    }
    function tryExecuteDash(ctx) {
      const { player, elapsed, resolvePlayer, circleHitsObstacle, spawnAttackRing, inventory: inventory2 } = ctx;
      const passive = collectPassive(inventory2);
      const dashCd = effectiveCooldown(passive, "dash", DASH_COOLDOWN2, 0.25, inventory2);
      if (elapsed < dashReadyAt) return;
      dashReadyAt = elapsed + dashCd;
      const range = currentDashRange(inventory2);
      const len = Math.hypot(player.facing.x, player.facing.y) || 1;
      const fx = player.facing.x / len;
      const fy = player.facing.y / len;
      const step = 12;
      let tx = player.x;
      let ty = player.y;
      for (let d = step; d <= range; d += step) {
        const nx = player.x + fx * d;
        const ny = player.y + fy * d;
        if (typeof circleHitsObstacle === "function" && circleHitsObstacle(nx, ny, player.r)) break;
        tx = nx;
        ty = ny;
      }
      const res = resolvePlayer(tx, ty, player.r);
      player.x = res.x;
      player.y = res.y;
      spawnAttackRing?.(player.x, player.y, 26, "rgba(56, 189, 248, 0.35)", 0.1);
      const qualifies = rogueWorld.stealthBlocksDamage(elapsed, inventory2) || elapsed < (inventory2.clubsInvisUntil ?? 0);
      rogueWorld.onDashLanded(inventory2, elapsed, qualifies);
    }
    function trySmoke(ctx) {
      const { player, elapsed, inventory: inventory2, spawnAttackRing } = ctx;
      const passive = collectPassive(inventory2);
      const burstCd = effectiveCooldown(passive, "burst", BURST_COOLDOWN2, 1, inventory2);
      if (elapsed < burstReadyAt) return;
      burstReadyAt = elapsed + burstCd;
      const linger = SMOKE_DURATION + passive.invisOnBurst;
      smokeUntil = elapsed + linger;
      rogueWorld.pushSmokeZone(player.x, player.y, elapsed, linger, inventory2);
      spawnAttackRing?.(player.x, player.y, 72, "#94a3b8", 0.2);
      spawnAttackRing?.(player.x, player.y, 128, "#cbd5e1", 0.28);
    }
    function tryConsume(ctx) {
      const { elapsed, player, inventory: inventory2 } = ctx;
      const passive = collectPassive(inventory2);
      const consumeCd = effectiveCooldown(passive, "decoy", CONSUME_COOLDOWN, 0.4, inventory2);
      if (elapsed < consumeReadyAt) return;
      consumeReadyAt = elapsed + consumeCd;
      rogueWorld.beginFoodSense(elapsed);
      rogueWorld.spawnPopup(player.x, player.y - player.r - 10, "Sense", "#f59e0b", elapsed, 0.45);
    }
    return {
      id: "rogue",
      getCombatProfile() {
        return { maxHp: ROGUE_MAX_HP, startingHp: ROGUE_MAX_HP };
      },
      getHpHudYOffset() {
        return 7;
      },
      getShellUi() {
        return {
          controlsHintLine: "Move: Arrows | Q hold aim / release dash, W Smoke, E Food sense, R Ultimate | Pause: Space | After death: Enter or Choose hero \u2192 character select"
        };
      },
      getDecoys() {
        return [];
      },
      getInvulnUntil() {
        return 0;
      },
      getBurstVisualUntil(elapsed) {
        return elapsed < smokeUntil ? smokeUntil : 0;
      },
      tick(ctx) {
        const { inventory: inventory2, player } = ctx;
        currentInventory = inventory2;
        const passive = collectPassive(inventory2);
        const dashCd = effectiveCooldown(passive, "dash", DASH_COOLDOWN2, 0.25, inventory2);
        const burstCd = effectiveCooldown(passive, "burst", BURST_COOLDOWN2, 1, inventory2);
        const consumeCd = effectiveCooldown(passive, "decoy", CONSUME_COOLDOWN, 0.4, inventory2);
        cdrHud.dash = cooldownIndicator(DASH_COOLDOWN2, dashCd);
        cdrHud.burst = cooldownIndicator(BURST_COOLDOWN2, burstCd);
        cdrHud.decoy = cooldownIndicator(CONSUME_COOLDOWN, consumeCd);
        player.maxHp = Math.max(1, ROGUE_MAX_HP + passive.maxHpBonus);
        player.hp = clamp2(player.hp, 0, player.maxHp);
        player.speedBurstMult = 1;
        player.speedPassiveMult = passive.speedMult * (1 + rogueWorld.desperationSpeedMult());
        player.terrainTouchMult = passive.obstacleTouchMult;
        player.dodgeChanceWhenDashCd = passive.dodgeChanceWhenDashCd;
        player.stunOnHitSecs = passive.stunOnHitSecs;
        player.frontShieldArcDeg = passive.heartsShieldArc;
        inventory2.heartsRegenPerSec = passive.suits.hearts >= SET_BONUS_SUIT_THRESHOLD ? 0.3 : 0;
        if (!getEquippedUltimateType(inventory2)) inventory2.aceUltimateReadyAt = 0;
      },
      getAbilityHud(elapsed) {
        const passive = collectPassive(currentInventory ?? { deckByRank: {} });
        const dashCd = effectiveCooldown(passive, "dash", DASH_COOLDOWN2, 0.25, inventory);
        const burstCd = effectiveCooldown(passive, "burst", BURST_COOLDOWN2, 1, inventory);
        const consumeCd = effectiveCooldown(passive, "decoy", CONSUME_COOLDOWN, 0.4, inventory);
        const ultimateHud = buildEquippedUltimateHud(currentInventory, elapsed, LABEL_R2, "#60a5fa");
        const aiming = rogueWorld.getDashAiming();
        return {
          q: {
            label: LABEL_Q2,
            value: `${cdrHud.dash ? cdrHud.dash.trim() + " " : ""}${cdValue3(dashReadyAt, elapsed, aiming)}`,
            fill: aiming ? { remaining: 0, duration: dashCd, color: "#38bdf8" } : { remaining: cdRemaining3(dashReadyAt, elapsed), duration: dashCd, color: "#38bdf8" }
          },
          w: {
            label: LABEL_W2,
            value: `${cdrHud.burst ? cdrHud.burst.trim() + " " : ""}${(() => {
              const left = cdRemaining3(burstReadyAt, elapsed);
              if (left <= 0.05) return "READY";
              return `${left.toFixed(1)}s`;
            })()}`,
            fill: { remaining: cdRemaining3(burstReadyAt, elapsed), duration: burstCd, color: "#22d3ee" }
          },
          e: {
            label: LABEL_E2,
            value: `${cdrHud.decoy ? cdrHud.decoy.trim() + " " : ""}${(() => {
              const left = cdRemaining3(consumeReadyAt, elapsed);
              if (left <= 0.05) return "READY";
              return `${left.toFixed(1)}s`;
            })()}`,
            fill: { remaining: cdRemaining3(consumeReadyAt, elapsed), duration: consumeCd, color: "#f59e0b" }
          },
          r: { ...ultimateHud }
        };
      },
      onAbilityPress(slot, ctx) {
        if (slot === "r") return;
        if (slot === "q") {
          rogueWorld.setDashAiming(true);
          return;
        }
        if (slot === "w") trySmoke(ctx);
        else if (slot === "e") tryConsume(ctx);
      },
      onAbilityRelease(slot, ctx) {
        if (slot !== "q") return;
        if (!rogueWorld.getDashAiming()) return;
        rogueWorld.setDashAiming(false);
        tryExecuteDash(ctx);
      },
      isDashCoolingDown(elapsed) {
        return elapsed < dashReadyAt;
      },
      getDashPreviewRange() {
        return currentDashRange(currentInventory ?? { rogueDiamondRangeBoost: false });
      }
    };
  }

  // src/escape/constants.js
  var TAU = Math.PI * 2;
  var SNIPER_ARTILLERY_WINDUP = 1.38;
  var SNIPER_ARTILLERY_LEAD = 0.82;
  var SNIPER_ARTILLERY_BANG_DURATION = 0.34;
  var HEAL_PICKUP_HIT_R = 26;
  var CARD_PICKUP_HIT_R = 22;
  var CARD_PICKUP_REACH_EXTRA = 12;
  var HEAL_PICKUP_PLUS_HALF = 13;
  var HEAL_PICKUP_ARM_THICK = 6;

  // src/escape/Characters/Lunatic.js
  var LABEL_Q3 = "Steer L";
  var LABEL_W3 = "Sprint / Stop";
  var LABEL_E3 = "Steer R";
  var LABEL_R3 = "Roar";
  var LUNATIC_MAX_HP = 18;
  function clamp3(x, a, b) {
    return Math.max(a, Math.min(b, x));
  }
  function cdRemaining4(readyAt, elapsed) {
    return Math.max(0, readyAt - elapsed);
  }
  function cdValue4(readyAt, elapsed) {
    const left = cdRemaining4(readyAt, elapsed);
    if (left <= 0.05) return "READY";
    return `${left.toFixed(1)}s`;
  }
  function fmtSec(s) {
    return `${s.toFixed(1)}s`;
  }
  function sprintSpeedMultFromMomentum(m) {
    return LUNATIC_STUMBLE_MOVE_MULT + (LUNATIC_SPRINT_PEAK_SPEED_MULT - LUNATIC_STUMBLE_MOVE_MULT) * m;
  }
  function intersectsRectCircle(circle, rect) {
    const cx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
    const cy = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
    const dx = circle.x - cx;
    const dy = circle.y - cy;
    return dx * dx + dy * dy < circle.r * circle.r;
  }
  function removeObstaclesIntersectingPlayerCircle(player, obstacles) {
    const c = { x: player.x, y: player.y, r: player.r };
    for (let i = obstacles.length - 1; i >= 0; i--) {
      if (intersectsRectCircle(c, obstacles[i])) obstacles.splice(i, 1);
    }
  }
  function playerCollidesAnyObstacle(player, obstacles) {
    for (const o of obstacles) {
      if (intersectsRectCircle({ x: player.x, y: player.y, r: player.r }, o)) return true;
    }
    return false;
  }
  function createLunatic() {
    let phase = "stumble";
    let momentum = 0;
    let pressSprintUnlockAt = 0;
    let pressStopUnlockAt = 0;
    let decelEndAt = 0;
    let decelStartAt = 0;
    let sprintStartedAt = 0;
    let stunUntil = 0;
    let roarUntil = 0;
    let roarReadyAt = 0;
    let roarTerrainDmgBank = 0;
    let healExcludeHexKey = "";
    let sprintTier2FxFired = false;
    let sprintTier4FxFired = false;
    let currentInventory = null;
    function resetInternal(spawnHexKey) {
      phase = "stumble";
      momentum = 0;
      pressSprintUnlockAt = 0;
      pressStopUnlockAt = 0;
      decelEndAt = 0;
      decelStartAt = 0;
      sprintStartedAt = 0;
      stunUntil = 0;
      roarUntil = 0;
      roarReadyAt = 0;
      roarTerrainDmgBank = 0;
      healExcludeHexKey = spawnHexKey || "";
      sprintTier2FxFired = false;
      sprintTier4FxFired = false;
    }
    function crashDamageFromSprintDur(elapsed) {
      const d = Math.max(0, elapsed - sprintStartedAt);
      if (d <= LUNATIC_CRASH_DAMAGE_BRACKET_1_SEC) return LUNATIC_CRASH_DAMAGE_TIER_1;
      if (d <= LUNATIC_CRASH_DAMAGE_BRACKET_2_SEC) return LUNATIC_CRASH_DAMAGE_TIER_2;
      return LUNATIC_CRASH_DAMAGE_TIER_3;
    }
    function applyCrashFromObstacle(player, elapsed, damagePlayer, spawnAttackRing) {
      damagePlayer(crashDamageFromSprintDur(elapsed), { lunaticCrash: true });
      if (typeof spawnAttackRing === "function") {
        spawnAttackRing(player.x, player.y, player.r + 14, "#fef9c3", 0.14);
        spawnAttackRing(player.x, player.y, player.r + 34, "#fb923c", 0.28);
        spawnAttackRing(player.x, player.y, player.r + 56, "#ea580c", 0.4);
      }
      phase = "stumble";
      momentum = 0;
      decelEndAt = 0;
      decelStartAt = 0;
      stunUntil = elapsed + LUNATIC_CRASH_STUN_SEC;
      pressSprintUnlockAt = elapsed + LUNATIC_W_TOGGLE_COOLDOWN_SEC;
      sprintTier2FxFired = false;
      sprintTier4FxFired = false;
    }
    function tryWToggle(elapsed) {
      if (elapsed < stunUntil) return;
      if (phase === "stumble") {
        if (elapsed < pressSprintUnlockAt) return;
        phase = "sprint";
        momentum = 0;
        sprintStartedAt = elapsed;
        sprintTier2FxFired = false;
        sprintTier4FxFired = false;
        pressStopUnlockAt = elapsed + LUNATIC_W_TOGGLE_COOLDOWN_SEC;
        return;
      }
      if (phase === "sprint") {
        if (elapsed < pressStopUnlockAt) return;
        const sprintDur = Math.max(0, elapsed - sprintStartedAt);
        const decelScale = clamp3(sprintDur / Math.max(1e-4, LUNATIC_DECEL_SPRINT_REF_SEC), 0, 1);
        const decelDur = LUNATIC_DECEL_SEC * decelScale;
        phase = "decel";
        decelStartAt = elapsed;
        decelEndAt = elapsed + decelDur;
        pressSprintUnlockAt = elapsed + LUNATIC_W_TOGGLE_COOLDOWN_SEC;
      }
    }
    function tryRoar(elapsed, spawnAttackRing, player) {
      if (elapsed < roarReadyAt) return false;
      if (phase !== "sprint") return false;
      roarUntil = elapsed + LUNATIC_ROAR_DURATION_SEC;
      roarReadyAt = elapsed + LUNATIC_ROAR_COOLDOWN_SEC;
      roarTerrainDmgBank = 0;
      if (typeof spawnAttackRing === "function") {
        spawnAttackRing(player.x, player.y, player.r + 24, "#ef4444", 0.35);
      }
      return true;
    }
    return {
      id: "lunatic",
      getCombatProfile() {
        return { maxHp: LUNATIC_MAX_HP, startingHp: LUNATIC_MAX_HP };
      },
      getShellUi() {
        return {
          controlsHintLine: `Move: Arrows \xB7 Sprint: W \xB7 Roar: R (while sprinting) \xB7 Steer sprint: Q / E or Left / Right | Pause: Space | After death: Enter or Choose hero \u2192 character select`
        };
      },
      getInvulnUntil() {
        return 0;
      },
      getDecoys() {
        return [];
      },
      getLunaticPhase() {
        return phase;
      },
      getLunaticRoarUntil() {
        return roarUntil;
      },
      getHealExcludeHexKey() {
        return healExcludeHexKey;
      },
      /** @param {string} [spawnHexKey] */
      resetRunState(spawnHexKey) {
        resetInternal(spawnHexKey);
      },
      getLunaticSprintDamageImmune() {
        return phase === "sprint" || phase === "decel";
      },
      isDashCoolingDown() {
        return false;
      },
      tick(ctx) {
        const { elapsed, player, inventory: inventory2, dt } = ctx;
        currentInventory = inventory2;
        player.speedBurstMult = 1;
        player.speedPassiveMult = 1;
        player.terrainTouchMult = 1;
        player.dodgeChanceWhenDashCd = 0;
        player.stunOnHitSecs = 0;
        player.frontShieldArcDeg = 0;
        inventory2.heartsRegenPerSec = 0;
        if (!getEquippedUltimateType(inventory2)) inventory2.aceUltimateReadyAt = 0;
        if (player.hp > 0) {
          inventory2.lunaticRegenBank = (inventory2.lunaticRegenBank ?? 0) + LUNATIC_PASSIVE_HP_PER_SEC * (dt ?? 0);
          while ((inventory2.lunaticRegenBank ?? 0) >= 1 && player.hp < player.maxHp) {
            inventory2.lunaticRegenBank -= 1;
            player.hp += 1;
          }
          if (player.hp >= player.maxHp) inventory2.lunaticRegenBank = 0;
        }
      },
      onAbilityPress(slot, ctx) {
        if (slot === "w") tryWToggle(ctx.elapsed);
        else if (slot === "r") tryRoar(ctx.elapsed, ctx.spawnAttackRing, ctx.player);
      },
      /**
       * @param {object} ctx
       * @param {number} ctx.dt
       * @param {number} ctx.simElapsed
       * @param {{ x: number; y: number; r: number; facing: { x: number; y: number }; speedBurstMult?: number; speedPassiveMult?: number; terrainTouchMult?: number }} ctx.player
       * @param {{ isDown: (k: string) => boolean }} ctx.keys
       * @param {() => boolean} ctx.steerLeft
       * @param {() => boolean} ctx.steerRight
       * @param {object} ctx.inventory
       * @param {number} ctx.PLAYER_SPEED
       * @param {number} ctx.ultimateSpeedUntil
       * @param {number} ctx.laserSlowMult
       * @param {() => unknown[]} ctx.getObsForCollision
       * @param {(x: number, y: number, r: number, rects: unknown[]) => { x: number; y: number }} ctx.resolvePlayerAgainstRects
       * @param {(x: number, y: number, r: number, rects: unknown[]) => boolean} ctx.circleOverlapsAnyRect
       * @param {(n: number, o?: object) => void} ctx.damagePlayer
       * @param {(x: number, y: number, r: number, color: string, dur: number) => void} [ctx.spawnAttackRing]
       * @returns {{ rogueMovementIntent: boolean; touchedObstacle: boolean } | null}
       */
      applyMovementFrame(ctx) {
        const {
          dt,
          simElapsed,
          player,
          keys,
          steerLeft,
          steerRight,
          inventory: inventory2 = {},
          PLAYER_SPEED: PLAYER_SPEED2,
          ultimateSpeedUntil,
          laserSlowMult,
          getObsForCollision,
          resolvePlayerAgainstRects: resolvePlayerAgainstRects2,
          circleOverlapsAnyRect: circleOverlapsAnyRect2,
          damagePlayer,
          spawnAttackRing,
          onLunaticSprintTierFx
        } = ctx;
        if (phase === "decel" && simElapsed >= decelEndAt) {
          phase = "stumble";
          momentum = 0;
          decelEndAt = 0;
          decelStartAt = 0;
        }
        let mx = 0;
        let my = 0;
        if (keys.isDown("ArrowLeft")) mx -= 1;
        if (keys.isDown("ArrowRight")) mx += 1;
        if (keys.isDown("ArrowUp")) my -= 1;
        if (keys.isDown("ArrowDown")) my += 1;
        const obsRects = getObsForCollision();
        let touchedObstacle = false;
        let rogueMovementIntent = false;
        if (simElapsed < stunUntil) {
          return { rogueMovementIntent: false, touchedObstacle: false };
        }
        if (phase === "stumble") {
          if (mx || my) {
            const mlen2 = Math.hypot(mx, my) || 1;
            player.facing = { x: mx / mlen2, y: my / mlen2 };
          }
          const effectiveSpeed = PLAYER_SPEED2 * (player.speedBurstMult ?? 1) * (player.speedPassiveMult ?? 1) * laserSlowMult * LUNATIC_STUMBLE_MOVE_MULT;
          const mlen = Math.hypot(mx, my) || 1;
          const ddx = mx / mlen * effectiveSpeed * dt;
          const ddy = my / mlen * effectiveSpeed * dt;
          rogueMovementIntent = !!(mx || my);
          player.x += ddx;
          player.y += ddy;
          const resolved2 = resolvePlayerAgainstRects2(player.x, player.y, player.r, obsRects);
          touchedObstacle = Math.abs(resolved2.x - player.x) > 1e-6 || Math.abs(resolved2.y - player.y) > 1e-6;
          player.x = resolved2.x;
          player.y = resolved2.y;
          return { rogueMovementIntent, touchedObstacle };
        }
        let speedMult = 1;
        if (phase === "sprint") {
          momentum = Math.min(1, momentum + dt / Math.max(1e-4, LUNATIC_SPRINT_MOMENTUM_RAMP_SEC));
          speedMult = sprintSpeedMultFromMomentum(momentum);
          if (simElapsed < roarUntil) speedMult *= LUNATIC_ROAR_SPEED_MULT;
          const sprintDur = simElapsed - sprintStartedAt;
          if (!sprintTier2FxFired && sprintDur > LUNATIC_CRASH_DAMAGE_BRACKET_1_SEC) {
            sprintTier2FxFired = true;
            onLunaticSprintTierFx?.(2);
          }
          if (!sprintTier4FxFired && sprintDur > LUNATIC_CRASH_DAMAGE_BRACKET_2_SEC) {
            sprintTier4FxFired = true;
            onLunaticSprintTierFx?.(4);
          }
        } else if (phase === "decel") {
          const decelTotal = Math.max(1e-5, decelEndAt - decelStartAt);
          const u = clamp3(1 - (decelEndAt - simElapsed) / decelTotal, 0, 1);
          const peak = sprintSpeedMultFromMomentum(momentum);
          speedMult = peak * (1 - u);
          if (simElapsed < roarUntil) speedMult *= LUNATIC_ROAR_SPEED_MULT;
        }
        const laserM = laserSlowMult;
        let sp = PLAYER_SPEED2 * (player.speedBurstMult ?? 1) * (player.speedPassiveMult ?? 1) * laserM * speedMult;
        if (simElapsed < ultimateSpeedUntil) sp *= 1.75;
        if (simElapsed < (inventory2?.spadesObstacleBoostUntil ?? 0)) {
          sp *= 1 + Math.max(0, (player.terrainTouchMult ?? 1) - 1);
        }
        const yawRate = Math.min(LUNATIC_STEER_MAX_RAD_PER_SEC, sp / Math.max(1, LUNATIC_TURN_RADIUS_PX));
        let fx = player.facing.x;
        let fy = player.facing.y;
        const fl0 = Math.hypot(fx, fy) || 1;
        fx /= fl0;
        fy /= fl0;
        let sl = steerLeft() || keys.isDown("ArrowLeft");
        let sr = steerRight() || keys.isDown("ArrowRight");
        if (sl && sr) sl = sr = false;
        if (sl) {
          const ang = -yawRate * dt;
          const c = Math.cos(ang);
          const s = Math.sin(ang);
          const nx = fx * c - fy * s;
          const ny = fx * s + fy * c;
          fx = nx;
          fy = ny;
        }
        if (sr) {
          const ang = yawRate * dt;
          const c = Math.cos(ang);
          const s = Math.sin(ang);
          const nx = fx * c - fy * s;
          const ny = fx * s + fy * c;
          fx = nx;
          fy = ny;
        }
        const flN = Math.hypot(fx, fy) || 1;
        player.facing = { x: fx / flN, y: fy / flN };
        fx = player.facing.x;
        fy = player.facing.y;
        const vx = fx * sp * dt;
        const vy = fy * sp * dt;
        const prevX = player.x;
        const prevY = player.y;
        const roarPlowing = simElapsed < roarUntil;
        rogueMovementIntent = phase === "sprint" || phase === "decel" || !!(mx || my) || sl || sr;
        if (roarPlowing) {
          player.x += vx;
          player.y += vy;
          return { rogueMovementIntent, touchedObstacle: false };
        }
        player.x += vx;
        player.y += vy;
        const resolved = resolvePlayerAgainstRects2(player.x, player.y, player.r, obsRects);
        const hit = Math.abs(resolved.x - player.x) > 1e-6 || Math.abs(resolved.y - player.y) > 1e-6;
        player.x = resolved.x;
        player.y = resolved.y;
        touchedObstacle = hit;
        const overlapStill = circleOverlapsAnyRect2(player.x, player.y, player.r, obsRects);
        if (hit || overlapStill) {
          player.x = prevX;
          player.y = prevY;
          applyCrashFromObstacle(player, simElapsed, damagePlayer, spawnAttackRing);
          touchedObstacle = true;
          return { rogueMovementIntent: true, touchedObstacle: true };
        }
        return { rogueMovementIntent, touchedObstacle };
      },
      /**
       * @param {object} ctx
       * @param {number} ctx.simDt
       * @param {number} ctx.simElapsed
       * @param {{ x: number; y: number; r: number }} ctx.player
       * @param {unknown[]} ctx.obstacles
       * @param {(n: number, o?: object) => void} ctx.damagePlayer
       */
      tickLunaticRoarTerrain(ctx) {
        const { simDt, simElapsed, player, obstacles, damagePlayer } = ctx;
        if (simElapsed >= roarUntil) return;
        if (!playerCollidesAnyObstacle(player, obstacles)) return;
        roarTerrainDmgBank += simDt;
        while (roarTerrainDmgBank >= LUNATIC_ROAR_TERRAIN_DAMAGE_INTERVAL_SEC) {
          roarTerrainDmgBank -= LUNATIC_ROAR_TERRAIN_DAMAGE_INTERVAL_SEC;
          damagePlayer(LUNATIC_ROAR_TERRAIN_DAMAGE, { lunaticRoarTerrain: true });
        }
        removeObstaclesIntersectingPlayerCircle(player, obstacles);
      },
      /**
       * @param {object} ctx
       * @param {{ x: number; y: number; r: number }} ctx.player
       * @param {(x: number, y: number, r: number) => boolean} ctx.circleHitsObstacle
       */
      ejectFromObstaclesIfStuck(ctx) {
        const { player, circleHitsObstacle } = ctx;
        if (!circleHitsObstacle(player.x, player.y, player.r)) return;
        const STEP = 3;
        const ANGLES = 28;
        const MAX_R = 220;
        for (let rad = STEP; rad <= MAX_R; rad += STEP) {
          for (let i = 0; i < ANGLES; i++) {
            const ang = i / ANGLES * TAU;
            const candX = player.x + Math.cos(ang) * rad;
            const candY = player.y + Math.sin(ang) * rad;
            if (!circleHitsObstacle(candX, candY, player.r)) {
              player.x = candX;
              player.y = candY;
              return;
            }
          }
        }
      },
      getAbilityHud(elapsed) {
        const inv = currentInventory ?? {};
        const sprintCdRem = Math.max(0, pressSprintUnlockAt - elapsed);
        const stopCdRem = Math.max(0, pressStopUnlockAt - elapsed);
        const roarRem = Math.max(0, roarReadyAt - elapsed);
        const ultHud = buildEquippedUltimateHud(inv, elapsed, LABEL_R3, "#60a5fa");
        const hasAceUlt = !!getEquippedUltimateType(inv);
        return {
          q: {
            label: LABEL_Q3,
            value: "Hold Q",
            fill: { remaining: 0, duration: 1, color: "#64748b" }
          },
          w: {
            label: LABEL_W3,
            value: `Sprint ${fmtSec(sprintCdRem)}
Stop ${fmtSec(stopCdRem)}`,
            valueClass: "ability-value--lunatic-w",
            fill: {
              remaining: sprintCdRem,
              duration: LUNATIC_W_TOGGLE_COOLDOWN_SEC,
              color: "#22d3ee"
            }
          },
          e: {
            label: LABEL_E3,
            value: "Hold E",
            fill: { remaining: 0, duration: 1, color: "#64748b" }
          },
          r: hasAceUlt ? ultHud : {
            label: LABEL_R3,
            value: `${cdValue4(roarReadyAt, elapsed)} \xB7 ${phase === "sprint" ? "Sprint" : "\u2014"}`,
            fill: {
              remaining: roarRem,
              duration: LUNATIC_ROAR_COOLDOWN_SEC,
              color: "#f87171"
            }
          }
        };
      }
    };
  }

  // src/escape/Characters/Valiant.js
  var LABEL_Q4 = "Surge";
  var LABEL_W4 = "Shock field";
  var LABEL_E4 = "Rescue";
  var LABEL_R4 = "Ultimate";
  function clamp4(x, a, b) {
    return Math.max(a, Math.min(b, x));
  }
  function cdRemaining5(readyAt, elapsed) {
    return Math.max(0, readyAt - elapsed);
  }
  function cdValue5(readyAt, elapsed) {
    const left = cdRemaining5(readyAt, elapsed);
    if (left <= 0.05) return "READY";
    return `${left.toFixed(1)}s`;
  }
  function sumInvisBurstSecondsFromDeck2(inventory2) {
    let s = 0;
    forEachDeckCard(inventory2, (c) => {
      if (c?.effect?.kind === "invisBurst" && typeof c.effect.value === "number") s += c.effect.value;
    });
    return s;
  }
  function createValiant(valiantWorld) {
    let surgeReadyAt = 0;
    let surgeUntil = 0;
    let burstReadyAt = 0;
    let invulnUntil = 0;
    let currentInventory = null;
    const cdrHud = { dash: "", burst: "", decoy: "" };
    function collectPassive2(inventory2) {
      const p = {
        cooldownFlat: { dash: 0, burst: 0, decoy: 0 },
        cooldownPct: { dash: 0, burst: 0, decoy: 0 },
        speedMult: 1,
        obstacleTouchMult: 1,
        dodgeChanceWhenDashCd: 0,
        stunOnHitSecs: 0,
        invisOnBurst: 0,
        dashChargesBonus: 0,
        heartsShieldArc: 0,
        maxHpBonus: 0,
        suits: { diamonds: 0, hearts: 0, clubs: 0, spades: 0 }
      };
      inventory2.valiantElectricBoxChargeBonus = 0;
      forEachDeckCard(inventory2, (card) => {
        if (!card?.suit) return;
        if (card.suit === "joker") {
          p.suits.diamonds += 1;
          p.suits.hearts += 1;
          p.suits.clubs += 1;
          p.suits.spades += 1;
        } else if (p.suits[card.suit] != null) {
          p.suits[card.suit] += 1;
        }
        const e = card.effect;
        if (!e) return;
        if (e.kind === "cooldown") p.cooldownFlat[e.target] = (p.cooldownFlat[e.target] ?? 0) + e.value;
        else if (e.kind === "cooldownPct") p.cooldownPct[e.target] = (p.cooldownPct[e.target] ?? 0) + e.value;
        else if (e.kind === "maxHp") p.maxHpBonus += e.value;
        else if (e.kind === "dodge") p.dodgeChanceWhenDashCd += e.value;
        else if (e.kind === "stun") p.stunOnHitSecs += e.value;
        else if (e.kind === "invisBurst") p.invisOnBurst += e.value;
        else if (e.kind === "speed") p.speedMult += e.value;
        else if (e.kind === "terrainBoost") p.obstacleTouchMult += e.value;
        else if (e.kind === "dashCharge") {
          if (card.suit === "spades" || card.suit === "joker") inventory2.valiantElectricBoxChargeBonus += e.value;
          else p.dashChargesBonus += e.value;
        } else if (e.kind === "frontShield") p.heartsShieldArc += e.arc;
      });
      return p;
    }
    function effectiveCooldown2(passive, abilityId, baseCooldown, minCooldown, inventory2) {
      const flat = passive.cooldownFlat[abilityId] || 0;
      const pct = clamp4(passive.cooldownPct[abilityId] || 0, 0, 0.85);
      const baseEff = Math.max(0.3, minCooldown, Math.max(0, baseCooldown - flat) * (1 - pct));
      const swQ = abilityId === "dash" ? inventory2?.swampBootlegCdDash ?? 0 : 0;
      const swW = abilityId === "burst" ? inventory2?.swampBootlegCdBurst ?? 0 : 0;
      return baseEff + swQ + swW;
    }
    function cooldownIndicator2(baseCooldown, effectiveCooldownSec) {
      const reducedBy = Math.max(0, baseCooldown - effectiveCooldownSec);
      if (reducedBy <= 0.05) return "";
      return ` \u2193${reducedBy.toFixed(1)}s`;
    }
    function effectiveRescueCd(passive, inventory2) {
      return effectiveCooldown2(passive, "decoy", VALIANT_RESCUE_COOLDOWN_SEC, 0.5, inventory2);
    }
    function trySurge(ctx) {
      const { player, elapsed, inventory: inventory2, spawnAttackRing } = ctx;
      const passive = collectPassive2(inventory2);
      if (elapsed < surgeReadyAt) return;
      const cd = effectiveCooldown2(passive, "dash", VALIANT_SURGE_COOLDOWN_SEC, VALIANT_SURGE_MIN_COOLDOWN_SEC, inventory2);
      surgeReadyAt = elapsed + cd;
      const diamondSurgeTuning = inventory2.diamondEmpower === "valiantSpeed" && passive.suits.diamonds >= SET_BONUS_SUIT_THRESHOLD || passive.suits.diamonds >= SET_BONUS_SUIT_MAX;
      const durBonus = diamondSurgeTuning ? VALIANT_SURGE_DURATION_DIAMOND_BONUS_SEC : 0;
      surgeUntil = elapsed + VALIANT_SURGE_DURATION_SEC + durBonus;
      const invisSec = passive.invisOnBurst + sumInvisBurstSecondsFromDeck2(inventory2);
      if (invisSec > 0) {
        inventory2.clubsInvisUntil = Math.max(inventory2.clubsInvisUntil ?? 0, elapsed + invisSec);
      }
      spawnAttackRing?.(player.x, player.y, 58, "#38bdf8", 0.22);
      spawnAttackRing?.(player.x, player.y, 88, "#7dd3fc", 0.18);
    }
    function tryShock(ctx) {
      const { player, elapsed, inventory: inventory2, spawnAttackRing } = ctx;
      const passive = collectPassive2(inventory2);
      const effBurst = effectiveCooldown2(
        passive,
        "burst",
        VALIANT_SHOCK_ABILITY_COOLDOWN_SEC,
        VALIANT_SHOCK_ABILITY_MIN_COOLDOWN_SEC,
        inventory2
      );
      const st = valiantWorld.getBoxChargeState();
      if (st.charges <= 0 && elapsed < burstReadyAt) return;
      if (st.charges <= 0) return;
      if (!valiantWorld.tryConsumeShockCharge(elapsed, effBurst)) return;
      valiantWorld.placeShockField(player, inventory2, elapsed, spawnAttackRing);
      const st2 = valiantWorld.getBoxChargeState();
      if (st2.charges <= 0) burstReadyAt = elapsed + effBurst;
    }
    function tryRescue(ctx) {
      const { player, elapsed, inventory: inventory2, spawnAttackRing } = ctx;
      const passive = collectPassive2(inventory2);
      valiantWorld.tryRescue(elapsed, inventory2, player, effectiveRescueCd(passive, inventory2), spawnAttackRing);
    }
    return {
      id: "valiant",
      getCombatProfile() {
        return { maxHp: 1, startingHp: 1 };
      },
      getHpHudYOffset() {
        return 0;
      },
      getShellUi() {
        return {
          controlsHintLine: `Move: Arrows | ${LABEL_Q4} (Q) Surge \xB7 ${LABEL_W4} (W) shock \xB7 ${LABEL_E4} (E) Rescue \xB7 ${LABEL_R4} (R) | Pause: Space | After death: Enter or Choose hero \u2192 character select`
        };
      },
      getDecoys() {
        return [];
      },
      getInvulnUntil() {
        return invulnUntil;
      },
      getBurstVisualUntil(elapsed) {
        return elapsed < surgeUntil ? surgeUntil : 0;
      },
      getValiantSurgeUntil() {
        return surgeUntil;
      },
      getValiantWorld() {
        return valiantWorld;
      },
      applySafehouseFullHeal() {
        valiantWorld.applySafehouseFullHeal();
      },
      onHealCrystalPickup(ctx, healAmt) {
        valiantWorld.healInjuredRabbitFromCrystal(healAmt);
        const refreshFactor = 0.8;
        const now = ctx.elapsed;
        const passive = collectPassive2(ctx.inventory);
        const shrink = (readyAt) => {
          const rem = readyAt - now;
          if (rem <= 0) return readyAt;
          return now + rem * refreshFactor;
        };
        surgeReadyAt = shrink(surgeReadyAt);
        burstReadyAt = shrink(burstReadyAt);
        const st = valiantWorld.getBoxChargeState();
        if (st.nextRechargeAt > 0) st.nextRechargeAt = shrink(st.nextRechargeAt);
        valiantWorld.setRescueReadyAt(shrink(valiantWorld.getRescueReadyAt()));
      },
      tick(ctx) {
        const { elapsed, player, inventory: inventory2, dt } = ctx;
        currentInventory = inventory2;
        const passive = collectPassive2(inventory2);
        inventory2.heartsRegenPerSec = passive.suits.hearts >= SET_BONUS_SUIT_THRESHOLD ? 0.3 : 0;
        const bonusSplit = [0, 0, 0];
        for (let k = 0; k < passive.maxHpBonus; k++) bonusSplit[k % 3]++;
        valiantWorld.setSlotBonusMax(bonusSplit);
        valiantWorld.syncBoxMaxCharges(1 + (inventory2.valiantElectricBoxChargeBonus ?? 0));
        valiantWorld.tickBoxRecharge(elapsed);
        player.maxHp = 1;
        player.hp = 1;
        player.speedPassiveMult = passive.speedMult;
        player.terrainTouchMult = passive.obstacleTouchMult;
        player.dodgeChanceWhenDashCd = passive.dodgeChanceWhenDashCd;
        player.stunOnHitSecs = passive.stunOnHitSecs;
        player.frontShieldArcDeg = passive.heartsShieldArc;
        const diamondSurgeTuning = inventory2.diamondEmpower === "valiantSpeed" && passive.suits.diamonds >= SET_BONUS_SUIT_THRESHOLD || passive.suits.diamonds >= SET_BONUS_SUIT_MAX;
        const surgeLeg = elapsed < surgeUntil || diamondSurgeTuning;
        player.speedBurstMult = surgeLeg ? diamondSurgeTuning ? VALIANT_SURGE_SPEED_MULT_DIAMOND : VALIANT_SURGE_SPEED_MULT : 1;
        const rescueCd = effectiveRescueCd(passive, inventory2);
        valiantWorld.tickWillDecay(dt ?? 0, { onWillDeath: ctx.onValiantWillDeath });
        valiantWorld.tickExpireEntities(elapsed);
        valiantWorld.tryPickupBunnies(player, elapsed);
        valiantWorld.updateRescueCooldownWhenNoRabbits(elapsed, rescueCd);
        const dashCd = effectiveCooldown2(passive, "dash", VALIANT_SURGE_COOLDOWN_SEC, VALIANT_SURGE_MIN_COOLDOWN_SEC, inventory2);
        const burstCd = effectiveCooldown2(
          passive,
          "burst",
          VALIANT_SHOCK_ABILITY_COOLDOWN_SEC,
          VALIANT_SHOCK_ABILITY_MIN_COOLDOWN_SEC,
          inventory2
        );
        cdrHud.dash = cooldownIndicator2(VALIANT_SURGE_COOLDOWN_SEC, dashCd);
        cdrHud.burst = cooldownIndicator2(VALIANT_SHOCK_ABILITY_COOLDOWN_SEC, burstCd);
        cdrHud.decoy = cooldownIndicator2(VALIANT_RESCUE_COOLDOWN_SEC, rescueCd);
        if (!getEquippedUltimateType(inventory2)) inventory2.aceUltimateReadyAt = 0;
      },
      getAbilityHud(elapsed) {
        const inv = currentInventory ?? { deckByRank: {}, backpackSlots: [], valiantElectricBoxChargeBonus: 0 };
        const passive = collectPassive2(inv);
        const dashCd = effectiveCooldown2(passive, "dash", VALIANT_SURGE_COOLDOWN_SEC, VALIANT_SURGE_MIN_COOLDOWN_SEC, inv);
        const burstCd = effectiveCooldown2(
          passive,
          "burst",
          VALIANT_SHOCK_ABILITY_COOLDOWN_SEC,
          VALIANT_SHOCK_ABILITY_MIN_COOLDOWN_SEC,
          inv
        );
        const rescueCd = effectiveRescueCd(passive, inv);
        const st = valiantWorld.getBoxChargeState();
        const shockLabel = st.charges > 0 ? `${st.charges}/${st.maxCharges}` : cdRemaining5(burstReadyAt, elapsed) > 0 ? cdValue5(burstReadyAt, elapsed) : "READY";
        const ultimateHud = buildEquippedUltimateHud(currentInventory, elapsed, LABEL_R4, "#a5b4fc");
        return {
          q: {
            label: LABEL_Q4,
            value: `${cdrHud.dash ? cdrHud.dash.trim() + " " : ""}${cdValue5(surgeReadyAt, elapsed)}`,
            fill: { remaining: cdRemaining5(surgeReadyAt, elapsed), duration: dashCd, color: "#38bdf8" }
          },
          w: {
            label: LABEL_W4,
            value: `${cdrHud.burst ? cdrHud.burst.trim() + " " : ""}${shockLabel}`,
            fill: {
              remaining: st.charges > 0 ? 0 : cdRemaining5(burstReadyAt, elapsed),
              duration: burstCd,
              color: "#22d3ee"
            }
          },
          e: {
            label: LABEL_E4,
            value: `${cdrHud.decoy ? cdrHud.decoy.trim() + " " : ""}${cdValue5(valiantWorld.getRescueReadyAt(), elapsed)}`,
            fill: { remaining: cdRemaining5(valiantWorld.getRescueReadyAt(), elapsed), duration: rescueCd, color: "#a78bfa" }
          },
          r: { ...ultimateHud }
        };
      },
      onAbilityPress(slot, ctx) {
        if (slot === "r") return;
        if (slot === "q") trySurge(ctx);
        else if (slot === "w") tryShock(ctx);
        else if (slot === "e") tryRescue(ctx);
      },
      isDashCoolingDown(elapsed) {
        return elapsed < surgeReadyAt;
      }
    };
  }

  // src/escape/Characters/Bulwark.js
  var LABEL_Q5 = "Charge";
  var LABEL_W5 = "Parry";
  var LABEL_E5 = "Flag";
  var LABEL_R5 = "Ultimate";
  function clamp5(x, a, b) {
    return Math.max(a, Math.min(b, x));
  }
  function cdRemaining6(readyAt, elapsed) {
    return Math.max(0, readyAt - elapsed);
  }
  function cdValue6(readyAt, elapsed) {
    const left = cdRemaining6(readyAt, elapsed);
    if (left <= 0.05) return "READY";
    return `${left.toFixed(1)}s`;
  }
  function createBulwark(bulwarkWorld) {
    let chargeReadyAt = 0;
    let parryReadyAt = 0;
    let parryUntil = 0;
    let chargeShieldUntil = 0;
    let chargeActive = false;
    let chargeDirX = 0;
    let chargeDirY = 0;
    let chargeTraveled = 0;
    const chargePushedHunterSet = /* @__PURE__ */ new Set();
    let currentInventory = null;
    let nearFlagHud = false;
    const cdrHud = { dash: "", burst: "", decoy: "" };
    function collectPassive2(inventory2) {
      const p = {
        cooldownFlat: { dash: 0, burst: 0, decoy: 0 },
        cooldownPct: { dash: 0, burst: 0, decoy: 0 },
        speedMult: 1,
        obstacleTouchMult: 1,
        dodgeChanceWhenDashCd: 0,
        stunOnHitSecs: 0,
        heartsShieldArc: 0,
        maxHpBonus: 0,
        suits: { diamonds: 0, hearts: 0, clubs: 0, spades: 0 }
      };
      forEachDeckCard(inventory2, (card) => {
        if (!card?.suit) return;
        if (card.suit === "joker") {
          p.suits.diamonds += 1;
          p.suits.hearts += 1;
          p.suits.clubs += 1;
          p.suits.spades += 1;
        } else if (p.suits[card.suit] != null) {
          p.suits[card.suit] += 1;
        }
        const e = card.effect;
        if (!e) return;
        if (e.kind === "cooldown") p.cooldownFlat[e.target] = (p.cooldownFlat[e.target] ?? 0) + e.value;
        else if (e.kind === "cooldownPct") p.cooldownPct[e.target] = (p.cooldownPct[e.target] ?? 0) + e.value;
        else if (e.kind === "maxHp") p.maxHpBonus += e.value;
        else if (e.kind === "dodge") p.dodgeChanceWhenDashCd += e.value;
        else if (e.kind === "stun") p.stunOnHitSecs += e.value;
        else if (e.kind === "speed") p.speedMult += e.value;
        else if (e.kind === "terrainBoost") p.obstacleTouchMult += e.value;
        else if (e.kind === "frontShield") p.heartsShieldArc += e.arc;
      });
      return p;
    }
    function effectiveCooldown2(passive, abilityId, baseCooldown, minCooldown, inventory2) {
      const flat = passive.cooldownFlat[abilityId] || 0;
      const pct = clamp5(passive.cooldownPct[abilityId] || 0, 0, 0.85);
      const baseEff = Math.max(0.3, minCooldown, Math.max(0, baseCooldown - flat) * (1 - pct));
      const swQ = abilityId === "dash" ? inventory2?.swampBootlegCdDash ?? 0 : 0;
      const swW = abilityId === "burst" ? inventory2?.swampBootlegCdBurst ?? 0 : 0;
      return baseEff + swQ + swW;
    }
    function cooldownIndicator2(baseCooldown, effectiveCooldownSec) {
      const reducedBy = Math.max(0, baseCooldown - effectiveCooldownSec);
      if (reducedBy <= 0.05) return "";
      return ` \u2193${reducedBy.toFixed(1)}s`;
    }
    function chargeBaseCd(player) {
      return bulwarkWorld.isNearPlantedFlag(player) ? BULWARK_CHARGE_COOLDOWN_NEAR_FLAG_SEC : BULWARK_CHARGE_COOLDOWN_SEC;
    }
    function parryBaseCd(player) {
      return bulwarkWorld.isNearPlantedFlag(player) ? BULWARK_PARRY_COOLDOWN_NEAR_FLAG_SEC : BULWARK_PARRY_COOLDOWN_SEC;
    }
    function spawnChargeEndFx(spawnAttackRing, player) {
      spawnAttackRing?.(player.x, player.y, player.r + 22, "rgba(148, 163, 184, 0.45)", 0.18);
      spawnAttackRing?.(player.x, player.y, player.r + 48, "rgba(226, 232, 240, 0.28)", 0.24);
    }
    function tickBulwarkCharge(ctx) {
      if (!chargeActive) return;
      const {
        player,
        elapsed,
        dt,
        resolvePlayer,
        circleHitsObstacle,
        bulwarkChargePushHunters,
        bulwarkChargeApplyTerrainGroupStun,
        spawnAttackRing
      } = ctx;
      const speed = BULWARK_CHARGE_SPEED;
      const stepCap = speed * Math.max(dt ?? 0.016, 1e-4);
      let remaining = BULWARK_CHARGE_DISTANCE - chargeTraveled;
      if (remaining <= 1e-3) {
        chargeActive = false;
        spawnChargeEndFx(spawnAttackRing, player);
        chargePushedHunterSet.clear();
        return;
      }
      const step = Math.min(remaining, stepCap);
      const fx = chargeDirX;
      const fy = chargeDirY;
      const ox = player.x;
      const oy = player.y;
      const nx = player.x + fx * step;
      const ny = player.y + fy * step;
      if (typeof circleHitsObstacle === "function" && circleHitsObstacle(nx, ny, player.r)) {
        chargeActive = false;
        spawnChargeEndFx(spawnAttackRing, player);
        bulwarkChargeApplyTerrainGroupStun?.(chargePushedHunterSet, elapsed);
        chargePushedHunterSet.clear();
        return;
      }
      player.x = nx;
      player.y = ny;
      const res = resolvePlayer(player.x, player.y, player.r);
      const slip = Math.hypot(res.x - nx, res.y - ny);
      const blocked = slip > 1.2;
      player.x = res.x;
      player.y = res.y;
      bulwarkChargePushHunters?.(ox, oy, player.x, player.y, player.r, elapsed, chargePushedHunterSet);
      const moved = Math.hypot(player.x - ox, player.y - oy);
      chargeTraveled += moved;
      if (blocked || moved < step * 0.22) {
        chargeActive = false;
        spawnChargeEndFx(spawnAttackRing, player);
        bulwarkChargeApplyTerrainGroupStun?.(chargePushedHunterSet, elapsed);
        chargePushedHunterSet.clear();
        return;
      }
      if (chargeTraveled >= BULWARK_CHARGE_DISTANCE - 0.5) {
        chargeActive = false;
        spawnChargeEndFx(spawnAttackRing, player);
        chargePushedHunterSet.clear();
      }
    }
    function tryCharge(ctx) {
      const { player, elapsed, inventory: inventory2, spawnAttackRing } = ctx;
      const passive = collectPassive2(inventory2);
      if (chargeActive) return;
      if (elapsed < chargeReadyAt) return;
      const baseCd = chargeBaseCd(player);
      const effCd = effectiveCooldown2(passive, "dash", baseCd, 0.35, inventory2);
      chargeReadyAt = elapsed + effCd;
      const fl = Math.hypot(player.facing.x, player.facing.y) || 1;
      chargeDirX = player.facing.x / fl;
      chargeDirY = player.facing.y / fl;
      chargeTraveled = 0;
      chargePushedHunterSet.clear();
      chargeActive = true;
      const dur = BULWARK_CHARGE_DISTANCE / BULWARK_CHARGE_SPEED;
      chargeShieldUntil = elapsed + dur + 0.22;
      spawnAttackRing?.(player.x, player.y, player.r + 12, "rgba(148, 163, 184, 0.38)", 0.12);
      spawnAttackRing?.(player.x, player.y, player.r + 28, "rgba(203, 213, 225, 0.22)", 0.16);
    }
    function tryParry(ctx) {
      const { player, elapsed, inventory: inventory2, spawnAttackRing, bulwarkParryPushHunters, bumpScreenShake } = ctx;
      const passive = collectPassive2(inventory2);
      if (elapsed < parryReadyAt) return;
      const baseCd = parryBaseCd(player);
      const effCd = effectiveCooldown2(passive, "burst", baseCd, 0.35, inventory2);
      parryReadyAt = elapsed + effCd;
      parryUntil = elapsed + BULWARK_PARRY_DURATION_SEC;
      bulwarkParryPushHunters?.(player.x, player.y, BULWARK_PARRY_PUSH_RADIUS, BULWARK_PARRY_PUSH_DIST);
      spawnAttackRing?.(player.x, player.y, player.r + 20, "rgba(254, 249, 195, 0.55)", 0.14);
      spawnAttackRing?.(player.x, player.y, player.r + 58, "rgba(250, 204, 21, 0.32)", 0.22);
      spawnAttackRing?.(player.x, player.y, player.r + 92, "rgba(251, 191, 36, 0.2)", 0.28);
      bumpScreenShake?.(6, 0.09);
    }
    function tryFlag(ctx) {
      const { player, elapsed, spawnAttackRing } = ctx;
      if (bulwarkWorld.isFlagCarried()) {
        if (bulwarkWorld.tryPlantFlag(player, elapsed)) {
          spawnAttackRing?.(player.x, player.y, player.r + 30, "rgba(34, 197, 94, 0.35)", 0.22);
        }
      } else {
        const pickupHeal = bulwarkWorld.tryPickupFlag(player);
        if (pickupHeal !== false) {
          if (pickupHeal > 0) {
            player.hp = Math.min(player.maxHp, player.hp + pickupHeal);
          }
          spawnAttackRing?.(player.x, player.y, player.r + 26, "rgba(59, 130, 246, 0.32)", 0.2);
        }
      }
    }
    return {
      id: "bulwark",
      resetRunState() {
        bulwarkWorld.reset();
        chargeReadyAt = 0;
        parryReadyAt = 0;
        parryUntil = 0;
        chargeShieldUntil = 0;
        chargeActive = false;
        chargeTraveled = 0;
        chargeDirX = 0;
        chargeDirY = 0;
        chargePushedHunterSet.clear();
      },
      getCombatProfile() {
        return { maxHp: BULWARK_MAX_HP, startingHp: BULWARK_MAX_HP };
      },
      getShellUi() {
        return {
          controlsHintLine: `Move: Arrows | ${LABEL_Q5} (Q), ${LABEL_W5} (W), ${LABEL_E5} (E) plant/pick flag | ${LABEL_R5} (R) | Pause: Space | After death: Enter or Choose hero \u2192 character select`
        };
      },
      getDecoys() {
        return bulwarkWorld.getDecoys();
      },
      getInvulnUntil() {
        return 0;
      },
      isBulwarkCharging() {
        return chargeActive;
      },
      getBulwarkParryUntil() {
        return parryUntil;
      },
      getBulwarkWorld() {
        return bulwarkWorld;
      },
      tick(ctx) {
        const { elapsed, player, inventory: inventory2 } = ctx;
        currentInventory = inventory2;
        const passive = collectPassive2(inventory2);
        nearFlagHud = bulwarkWorld.isNearPlantedFlag(player);
        bulwarkWorld.tick(elapsed, ctx.dt ?? 0);
        tickBulwarkCharge(ctx);
        const qBase = chargeBaseCd(player);
        const wBase = parryBaseCd(player);
        const qCd = effectiveCooldown2(passive, "dash", qBase, 0.35, inventory2);
        const wCd = effectiveCooldown2(passive, "burst", wBase, 0.35, inventory2);
        cdrHud.dash = cooldownIndicator2(qBase, qCd);
        cdrHud.burst = cooldownIndicator2(wBase, wCd);
        player.speedBurstMult = 1;
        player.speedPassiveMult = passive.speedMult;
        player.terrainTouchMult = passive.obstacleTouchMult;
        player.dodgeChanceWhenDashCd = passive.dodgeChanceWhenDashCd;
        player.stunOnHitSecs = passive.stunOnHitSecs;
        const passiveArc = passive.heartsShieldArc + BULWARK_PASSIVE_FRONT_SHIELD_DEG;
        if (elapsed < chargeShieldUntil || chargeActive) {
          player.frontShieldArcDeg = Math.max(passiveArc, BULWARK_CHARGE_FRONT_SHIELD_DEG);
        } else {
          player.frontShieldArcDeg = passiveArc;
        }
        player.maxHp = Math.max(1, BULWARK_MAX_HP + passive.maxHpBonus);
        player.hp = Math.min(player.hp, player.maxHp);
        inventory2.heartsRegenPerSec = passive.suits.hearts >= SET_BONUS_SUIT_THRESHOLD ? 0.3 : 0;
        if (!getEquippedUltimateType(inventory2)) inventory2.aceUltimateReadyAt = 0;
      },
      getAbilityHud(elapsed) {
        const inv = currentInventory ?? { deckByRank: {}, backpackSlots: [] };
        const passive = collectPassive2(inv);
        const qBase = nearFlagHud ? BULWARK_CHARGE_COOLDOWN_NEAR_FLAG_SEC : BULWARK_CHARGE_COOLDOWN_SEC;
        const wBase = nearFlagHud ? BULWARK_PARRY_COOLDOWN_NEAR_FLAG_SEC : BULWARK_PARRY_COOLDOWN_SEC;
        const qCd = effectiveCooldown2(passive, "dash", qBase, 0.35, inv);
        const wCd = effectiveCooldown2(passive, "burst", wBase, 0.35, inv);
        const ultimateHud = buildEquippedUltimateHud(inv, elapsed, LABEL_R5, "#94a3b8");
        const carried = bulwarkWorld.isFlagCarried();
        const fd = bulwarkWorld.getPlantedFlagDecoy();
        const charges = bulwarkWorld.getPlantedChargeCount();
        const pickupHp = charges * BULWARK_FLAG_PICKUP_HEAL_PER_CHARGE;
        const eCarriedLine = `Carry ${bulwarkWorld.getCarriedHp()}/${BULWARK_FLAG_MAX_HP} (regen while held) \u2014 E plant`;
        const ePlantedValue = fd.hp > 0 ? `${charges}
Planted ${fd.hp}/${BULWARK_FLAG_MAX_HP} \xB7 pickup +${pickupHp} HP` : "Flag down";
        return {
          q: {
            label: LABEL_Q5,
            value: `${cdrHud.dash ? cdrHud.dash.trim() + " " : ""}${cdValue6(chargeReadyAt, elapsed)}`,
            fill: { remaining: cdRemaining6(chargeReadyAt, elapsed), duration: qBase, color: "#94a3b8" }
          },
          w: {
            label: LABEL_W5,
            value: `${cdrHud.burst ? cdrHud.burst.trim() + " " : ""}${cdValue6(parryReadyAt, elapsed)}`,
            fill: { remaining: cdRemaining6(parryReadyAt, elapsed), duration: wBase, color: "#fbbf24" }
          },
          e: carried ? { label: LABEL_E5, value: eCarriedLine, fill: null } : fd.hp > 0 ? { label: LABEL_E5, value: ePlantedValue, fill: null, valueClass: "ability-value--bulwark-e" } : { label: LABEL_E5, value: ePlantedValue, fill: null },
          r: { ...ultimateHud }
        };
      },
      onAbilityPress(slot, ctx) {
        if (slot === "r") return;
        if (slot === "q") tryCharge(ctx);
        else if (slot === "w") tryParry(ctx);
        else if (slot === "e") tryFlag(ctx);
      },
      isDashCoolingDown(elapsed) {
        return elapsed < chargeReadyAt;
      }
    };
  }

  // src/escape/Characters/bulwarkWorld.js
  function distSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }
  function createBulwarkWorld() {
    let carriedHp = BULWARK_FLAG_MAX_HP;
    let flagCarried = true;
    let planted = null;
    let deathLock = null;
    const plantedFlagDecoy = {
      kind: "bulwarkFlag",
      x: 0,
      y: 0,
      r: 26,
      until: 1e12,
      hp: BULWARK_FLAG_MAX_HP,
      maxHp: BULWARK_FLAG_MAX_HP,
      invulnerableUntil: 0,
      /** Last `damageId` from hunter laser that already applied 1 HP this beam. */
      lastLaserBeamHitId: 0
    };
    const decoysReturn = [];
    let plantChargeAcc = 0;
    let plantedCharges = 0;
    function reset() {
      carriedHp = BULWARK_FLAG_MAX_HP;
      flagCarried = true;
      planted = null;
      deathLock = null;
      decoysReturn.length = 0;
      plantedFlagDecoy.hp = BULWARK_FLAG_MAX_HP;
      plantedFlagDecoy.invulnerableUntil = 0;
      plantedFlagDecoy.lastLaserBeamHitId = 0;
      plantChargeAcc = 0;
      plantedCharges = 0;
    }
    function getPlantedFlagForAi() {
      if (flagCarried || !planted || plantedFlagDecoy.hp <= 0) return null;
      return { x: planted.x, y: planted.y, r: plantedFlagDecoy.r, lureR: BULWARK_FLAG_LURE_RADIUS };
    }
    function isNearPlantedFlag(player) {
      if (flagCarried || !planted || plantedFlagDecoy.hp <= 0) return false;
      return distSq(player, planted) <= BULWARK_NEAR_FLAG_CD_RADIUS * BULWARK_NEAR_FLAG_CD_RADIUS;
    }
    function getDeathLock() {
      return deathLock;
    }
    function clampPlayerInDeathLock(player) {
      if (!deathLock) return;
      const dx = player.x - deathLock.cx;
      const dy = player.y - deathLock.cy;
      const d = Math.hypot(dx, dy) || 1;
      const maxD = Math.max(0, deathLock.r - player.r - 2);
      if (d > maxD) {
        player.x = deathLock.cx + dx / d * maxD;
        player.y = deathLock.cy + dy / d * maxD;
      }
    }
    function tickDeathLock(elapsed) {
      if (deathLock && elapsed >= deathLock.until) {
        deathLock = null;
        flagCarried = true;
        carriedHp = BULWARK_FLAG_RESPAWN_HP;
      }
    }
    function onPlantedFlagDestroyed(px, py, elapsed) {
      planted = null;
      decoysReturn.length = 0;
      plantChargeAcc = 0;
      plantedCharges = 0;
      deathLock = { cx: px, cy: py, r: BULWARK_DEATH_LOCK_RADIUS, until: elapsed + BULWARK_DEATH_LOCK_SEC };
    }
    function tick(elapsed, dt) {
      tickDeathLock(elapsed);
      if (flagCarried && carriedHp < BULWARK_FLAG_MAX_HP && !deathLock) {
        carriedHp = Math.min(BULWARK_FLAG_MAX_HP, carriedHp + BULWARK_FLAG_RECHARGE_PER_SEC * (dt ?? 0));
      }
      if (!flagCarried && planted && plantedFlagDecoy.hp > 0) {
        plantChargeAcc += dt;
        while (plantChargeAcc >= BULWARK_FLAG_PLANT_CHARGE_INTERVAL_SEC) {
          plantChargeAcc -= BULWARK_FLAG_PLANT_CHARGE_INTERVAL_SEC;
          plantedCharges += 1;
        }
      } else if (flagCarried) {
        plantChargeAcc = 0;
      }
      if (!flagCarried && planted && plantedFlagDecoy.hp <= 0) {
        onPlantedFlagDestroyed(planted.x, planted.y, elapsed);
      }
    }
    function tryPlantFlag(player, elapsed) {
      if (!flagCarried || Math.floor(carriedHp) < 1 || deathLock) return false;
      planted = { x: player.x, y: player.y };
      plantedFlagDecoy.x = planted.x;
      plantedFlagDecoy.y = planted.y;
      const pool = Math.min(BULWARK_FLAG_MAX_HP, Math.max(1, Math.floor(carriedHp)));
      plantedFlagDecoy.hp = pool;
      plantedFlagDecoy.maxHp = BULWARK_FLAG_MAX_HP;
      plantedFlagDecoy.invulnerableUntil = elapsed + BULWARK_FLAG_PLANT_INVULN_SEC;
      plantedFlagDecoy.lastLaserBeamHitId = 0;
      plantChargeAcc = 0;
      plantedCharges = 0;
      flagCarried = false;
      decoysReturn.length = 0;
      decoysReturn.push(plantedFlagDecoy);
      return true;
    }
    function tryPickupFlag(player) {
      if (flagCarried || !planted || plantedFlagDecoy.hp <= 0) return false;
      const rr = BULWARK_FLAG_PICKUP_R + player.r;
      if (distSq(player, planted) > rr * rr) return false;
      const heal = plantedCharges * BULWARK_FLAG_PICKUP_HEAL_PER_CHARGE;
      plantedCharges = 0;
      plantChargeAcc = 0;
      carriedHp = plantedFlagDecoy.hp;
      flagCarried = true;
      planted = null;
      decoysReturn.length = 0;
      return heal;
    }
    function getDecoys() {
      decoysReturn.length = 0;
      if (!flagCarried && planted && plantedFlagDecoy.hp > 0) {
        plantedFlagDecoy.x = planted.x;
        plantedFlagDecoy.y = planted.y;
        decoysReturn.push(plantedFlagDecoy);
      }
      return decoysReturn;
    }
    return {
      reset,
      tick,
      getPlantedFlagForAi,
      isNearPlantedFlag,
      getDeathLock,
      clampPlayerInDeathLock,
      tryPlantFlag,
      tryPickupFlag,
      getDecoys,
      isFlagCarried: () => flagCarried,
      /** Integer HP shown in HUD / on the carried flag (internal HP regens fractionally). */
      getCarriedHp: () => Math.floor(carriedHp),
      getPlantedChargeCount: () => plantedCharges,
      getPlantedFlagDecoy: () => plantedFlagDecoy,
      hasPlantedFlag: () => !!planted && plantedFlagDecoy.hp > 0
    };
  }

  // src/escape/Characters/roster.js
  var HERO_ROSTER = [
    {
      id: "knight",
      title: "Knight",
      /** Keep HP line in sync with `KNIGHT_MAX_HP` in `Knight.js`. */
      /** Keep HP line in sync with `KNIGHT_MAX_HP` in `Knight.js`. */
      meta: "Balanced \xB7 10 HP \xB7 classic kit",
      implemented: true
    },
    {
      id: "rogue",
      title: "Hungry Rogue",
      meta: "High risk \xB7 hunger \xB7 stealth & smoke",
      implemented: true
    },
    {
      id: "lunatic",
      title: "The Lunatic",
      meta: "No cards \xB7 sprint charge \xB7 roar through walls \xB7 18 HP \xB7 crystals +max HP",
      implemented: true
    },
    {
      id: "valiant",
      title: "The Valiant",
      meta: "Will meter \xB7 find and protect rabbits \xB7 shock fields",
      implemented: true
    },
    {
      id: "bulwark",
      title: "Bulwark",
      /** Keep HP line in sync with `BULWARK_MAX_HP` in `balance.js` / `Bulwark.js`. */
      meta: "Mostly unstoppable \xB7 15 HP \xB7 charge / parry / rally flag",
      implemented: true
    }
  ];
  function getHeroRoster() {
    return HERO_ROSTER;
  }
  function resolveImplementedHeroId(preferredId) {
    const roster = getHeroRoster();
    return roster.find((h) => h.id === preferredId && h.implemented)?.id ?? roster.find((h) => h.implemented)?.id ?? "knight";
  }

  // src/escape/Characters/index.js
  function createCharacterController(characterId, rogueWorld = null, valiantWorld = null, bulwarkWorld = null) {
    if (characterId === "knight") return createKnight();
    if (characterId === "rogue") {
      if (!rogueWorld) throw new Error("createCharacterController(rogue): rogueWorld is required");
      return createRogue(rogueWorld);
    }
    if (characterId === "lunatic") return createLunatic();
    if (characterId === "valiant") {
      if (!valiantWorld) throw new Error("createCharacterController(valiant): valiantWorld is required");
      return createValiant(valiantWorld);
    }
    if (characterId === "bulwark") {
      if (!bulwarkWorld) throw new Error("createCharacterController(bulwark): bulwarkWorld is required");
      return createBulwark(bulwarkWorld);
    }
    throw new Error(`Unknown character: ${characterId}`);
  }

  // src/escape/Characters/rogueWorld.js
  var TAU2 = Math.PI * 2;
  function clamp6(x, a, b) {
    return Math.max(a, Math.min(b, x));
  }
  function distSq2(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }
  function countSuitInDeck(inventory2, suit) {
    let n = 0;
    forEachDeckCard(inventory2, (card) => {
      if (!card?.suit) return;
      if (card.suit === "joker") n += 1;
      else if (card.suit === suit) n += 1;
    });
    return n;
  }
  function syncRogueDiamondRangeBoost(inventory2) {
    let diamonds = 0;
    forEachDeckCard(inventory2, (card) => {
      if (!card?.suit) return;
      if (card.suit === "joker" || card.suit === "diamonds") diamonds += 1;
    });
    inventory2.rogueDiamondRangeBoost = diamonds >= SET_BONUS_SUIT_THRESHOLD;
  }
  function createRogueWorld() {
    const smokeZones = [];
    const foods = [];
    const popups = [];
    let hunger = ROGUE_HUNGER_MAX;
    let hungerMax = ROGUE_HUNGER_MAX;
    let lastSeenAt = 0;
    let alertUntil = 0;
    let stealthActive = false;
    let stealthOpenUntil = 0;
    let foodSenseUntil = 0;
    let nextFoodAt = 0;
    let nextHungryPopupAt = 0;
    let hasEnemyLos = false;
    let dashAiming = false;
    let lastKnownPlayerPos = { x: 0, y: 0 };
    function reset(simElapsed, player) {
      smokeZones.length = 0;
      foods.length = 0;
      popups.length = 0;
      hunger = ROGUE_HUNGER_MAX;
      hungerMax = ROGUE_HUNGER_MAX;
      lastSeenAt = simElapsed;
      alertUntil = 0;
      stealthActive = false;
      stealthOpenUntil = 0;
      foodSenseUntil = 0;
      nextFoodAt = simElapsed + ROGUE_FIRST_FOOD_AT_SEC;
      nextHungryPopupAt = 0;
      hasEnemyLos = false;
      dashAiming = false;
      lastKnownPlayerPos = player ? { x: player.x, y: player.y } : { x: 0, y: 0 };
    }
    function spawnPopup(px, py, text, color, elapsed, life = 0.65) {
      popups.push({
        x: px,
        y: py - 18,
        text,
        color,
        bornAt: elapsed,
        expiresAt: elapsed + life
      });
    }
    function prunePopups(elapsed) {
      for (let i = popups.length - 1; i >= 0; i--) {
        if (elapsed >= popups[i].expiresAt) popups.splice(i, 1);
      }
    }
    function isPointNearTerrain(px, py, margin, rects) {
      for (const o of rects) {
        const cx = clamp6(px, o.x, o.x + o.w);
        const cy = clamp6(py, o.y, o.y + o.h);
        if (Math.hypot(px - cx, py - cy) <= margin) return true;
      }
      return false;
    }
    function playerInsideSmoke(px, py, elapsed) {
      for (const z of smokeZones) {
        if (elapsed >= z.expiresAt) continue;
        const dx = px - z.x;
        const dy = py - z.y;
        if (dx * dx + dy * dy <= z.r * z.r) return true;
      }
      return false;
    }
    function smokeRadiusForInventory(inventory2) {
      const d = countSuitInDeck(inventory2, "diamonds");
      if (d >= SET_BONUS_SUIT_MAX) return 300;
      if (inventory2.rogueDiamondRangeBoost) return 260;
      return 180;
    }
    function clubsPhaseThroughObstacles(inventory2, px, py, elapsed) {
      if (countSuitInDeck(inventory2, "clubs") < SET_BONUS_SUIT_THRESHOLD) return false;
      return playerInsideSmoke(px, py, elapsed);
    }
    function updateEnemyLos(hunterEntities, elapsed, player, hasLineOfSight) {
      if (!hunterEntities?.hunters) {
        hasEnemyLos = false;
        return;
      }
      let seen = false;
      for (const h of hunterEntities.hunters) {
        if (h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner" && h.cryptDisguised)
          continue;
        if (elapsed < (h.stunnedUntil || 0)) continue;
        if (hasLineOfSight(h, player)) {
          seen = true;
          break;
        }
      }
      hasEnemyLos = seen;
      if (seen) lastSeenAt = elapsed;
    }
    function tickNeeds(deps, onHungerDeath) {
      const {
        simDt,
        simElapsed,
        player,
        inventory: inventory2,
        obstacles,
        moving: _moving,
        touchedObstacle,
        rand,
        randomFoodPoint,
        spawnWorldPopup
      } = deps;
      void _moving;
      syncRogueDiamondRangeBoost(inventory2);
      for (let i = smokeZones.length - 1; i >= 0; i--) {
        if (simElapsed >= smokeZones[i].expiresAt) smokeZones.splice(i, 1);
      }
      hunger = Math.max(0, hunger - simDt);
      if (hunger <= 0) {
        onHungerDeath("hunger");
        return;
      }
      while (simElapsed >= nextFoodAt) {
        const pt = randomFoodPoint();
        if (pt) {
          foods.push({
            x: pt.x,
            y: pt.y,
            r: 13,
            bornAt: simElapsed,
            expiresAt: simElapsed + ROGUE_FOOD_LIFETIME,
            nutrition: ROGUE_FOOD_HUNGER_RESTORE
          });
        }
        nextFoodAt += rand(4.8, 7.8);
      }
      const inSmoke = playerInsideSmoke(player.x, player.y, simElapsed);
      const huggingTerrain = touchedObstacle || isPointNearTerrain(player.x, player.y, 20, obstacles) || isPointNearTerrain(player.x, player.y, 56, obstacles);
      const canEnterStealth = simElapsed - lastSeenAt >= ROGUE_STEALTH_AFTER_LOS_BREAK || inSmoke;
      if (canEnterStealth && (huggingTerrain || inSmoke)) {
        stealthActive = true;
        stealthOpenUntil = simElapsed + ROGUE_STEALTH_OPEN_GRACE;
      }
      if (stealthActive) {
        if (huggingTerrain || inSmoke) {
          stealthOpenUntil = simElapsed + ROGUE_STEALTH_OPEN_GRACE;
        } else if (simElapsed >= stealthOpenUntil) {
          stealthActive = false;
        }
      }
      const hungryRatio = 1 - clamp6(hunger / Math.max(1e-3, hungerMax), 0, 1);
      if (hungryRatio >= 0.25 && simElapsed >= nextHungryPopupAt) {
        spawnWorldPopup?.(player.x, player.y - player.r - 12, "I'm hungry", "#67e8f9");
        const cadence = hungryRatio >= 0.7 ? 3.2 : hungryRatio >= 0.45 ? 5.2 : 7;
        nextHungryPopupAt = simElapsed + cadence;
      }
      for (let i = foods.length - 1; i >= 0; i--) {
        const f = foods[i];
        if (simElapsed >= f.expiresAt) {
          foods.splice(i, 1);
          continue;
        }
        const rr = f.r + player.r;
        if (distSq2(f, player) <= rr * rr) {
          hunger = Math.min(hungerMax, Math.max(hunger, f.nutrition ?? ROGUE_FOOD_HUNGER_RESTORE));
          spawnWorldPopup?.(player.x, player.y - player.r - 8, "Fed", "#fcd34d");
          foods.splice(i, 1);
        }
      }
      prunePopups(simElapsed);
    }
    function pushSmokeZone(x, y, elapsed, durationSec, inventory2) {
      const r = smokeRadiusForInventory(inventory2);
      smokeZones.push({
        x,
        y,
        r,
        bornAt: elapsed,
        expiresAt: elapsed + durationSec
      });
    }
    function beginFoodSense(elapsed) {
      foodSenseUntil = Math.max(foodSenseUntil, elapsed + ROGUE_FOOD_SENSE_DURATION);
    }
    function pickRogueHunterTarget(hunter, player, inventory2, nearestDecoy, hasLOS, fallback, simElapsed) {
      if (simElapsed < (inventory2.spadesLandingStealthUntil ?? 0)) return nearestDecoy(hunter) || fallback;
      if (stealthActive) return nearestDecoy(hunter) || fallback;
      if (hasLOS(hunter, player)) {
        lastSeenAt = simElapsed;
        alertUntil = Math.max(alertUntil, simElapsed + 1.4);
        lastKnownPlayerPos = { x: player.x, y: player.y };
        return player;
      }
      return lastKnownPlayerPos && Number.isFinite(lastKnownPlayerPos.x) ? lastKnownPlayerPos : fallback;
    }
    function onDashLanded(inventory2, elapsed, qualifiesForSpadesDashBonus) {
      const spades = countSuitInDeck(inventory2, "spades");
      if (spades < SET_BONUS_SUIT_THRESHOLD || !qualifiesForSpadesDashBonus) return;
      stealthActive = true;
      stealthOpenUntil = Math.max(stealthOpenUntil, elapsed + ROGUE_STEALTH_OPEN_GRACE + 0.12);
      inventory2.spadesLandingStealthUntil = Math.max(
        inventory2.spadesLandingStealthUntil ?? 0,
        stealthOpenUntil
      );
    }
    function desperationSpeedMult() {
      const hungerLeftRatio = clamp6(hunger / Math.max(1e-3, hungerMax), 0, 1);
      return (1 - hungerLeftRatio) * ROGUE_DESPERATION_SPEED_MAX;
    }
    function stealthBlocksDamage(elapsed, inventory2) {
      if (stealthActive) return true;
      if (elapsed < (inventory2.spadesLandingStealthUntil ?? 0)) return true;
      return false;
    }
    function drawSmokeAndFood(ctx, elapsed) {
      for (const z of smokeZones) {
        if (elapsed >= z.expiresAt) continue;
        const u = clamp6((z.expiresAt - elapsed) / Math.max(1e-3, z.expiresAt - z.bornAt), 0, 1);
        const g = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
        g.addColorStop(0, `rgba(148, 163, 184, ${0.22 * u})`);
        g.addColorStop(0.55, `rgba(100, 116, 139, ${0.12 * u})`);
        g.addColorStop(1, `rgba(71, 85, 105, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, 0, TAU2);
        ctx.fill();
      }
      for (const f of foods) {
        if (elapsed >= f.expiresAt) continue;
        const pulse = 0.85 + 0.15 * Math.sin(elapsed * 9 + f.x * 0.01);
        ctx.fillStyle = `rgba(251, 191, 36, ${0.55 * pulse})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, TAU2);
        ctx.fill();
        ctx.strokeStyle = "rgba(254, 243, 199, 0.55)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
    function drawFoodSenseArrows(ctx, elapsed, player) {
      if (elapsed >= foodSenseUntil) return;
      for (const f of foods) {
        if (elapsed >= f.expiresAt) continue;
        const lifeTotal = Math.max(1e-3, f.expiresAt - f.bornAt);
        const freshness = clamp6((f.expiresAt - elapsed) / lifeTotal, 0, 1);
        const dx = f.x - player.x;
        const dy = f.y - player.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const close = len <= ROGUE_FOOD_ARROW_CLOSE_PLATEAU ? 1 : clamp6(
          1 - (len - ROGUE_FOOD_ARROW_CLOSE_PLATEAU) / Math.max(1e-3, ROGUE_FOOD_ARROW_FAR_LEN - ROGUE_FOOD_ARROW_CLOSE_PLATEAU),
          0,
          1
        );
        const reach = 44 + close * 22;
        const px = player.x;
        const py = player.y;
        const sideX = -uy;
        const sideY = ux;
        const s = 5.5 + close * 6.5;
        const freshAlpha = 0.54 + 0.4 * freshness;
        const a = Math.min(0.94, Math.max(0.48, freshAlpha));
        const tipX = px + ux * reach;
        const tipY = py + uy * reach;
        ctx.fillStyle = `rgba(252, 211, 77, ${a})`;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - ux * (s * 1.8) + sideX * s, tipY - uy * (s * 1.8) + sideY * s);
        ctx.lineTo(tipX - ux * (s * 1.8) - sideX * s, tipY - uy * (s * 1.8) - sideY * s);
        ctx.closePath();
        ctx.fill();
      }
    }
    function drawSurvivalHudArcs(ctx, player, elapsed) {
      const arcR = player.r + 12;
      const trackStroke = "rgba(148, 163, 184, 0.42)";
      const trackStrokeWide = "rgba(30, 41, 59, 0.55)";
      ctx.save();
      ctx.lineCap = "round";
      if (stealthActive) {
        const graceRem = stealthOpenUntil - elapsed;
        const graceRatio = clamp6(graceRem / Math.max(1e-3, ROGUE_STEALTH_OPEN_GRACE), 0, 1);
        if (graceRatio > 0.02) {
          const sCx = player.x;
          const sCy = player.y;
          const sLeft = -Math.PI * 0.8;
          const sRight = -Math.PI * 0.2;
          const stealthFill = graceRatio > 0.35 ? "#6ee7b7" : "#34d399";
          ctx.strokeStyle = trackStrokeWide;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(sCx, sCy, arcR, sLeft, sRight);
          ctx.stroke();
          ctx.strokeStyle = trackStroke;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sCx, sCy, arcR, sLeft, sRight);
          ctx.stroke();
          ctx.strokeStyle = stealthFill;
          ctx.lineWidth = 2;
          ctx.beginPath();
          const stealthEnd = sLeft + (sRight - sLeft) * graceRatio;
          ctx.arc(sCx, sCy, arcR, stealthEnd, sLeft, true);
          ctx.stroke();
        }
      }
      const ratio = clamp6(hunger / Math.max(1e-3, hungerMax), 0, 1);
      const hungerFill = ratio > 0.35 ? "#f59e0b" : "#ef4444";
      const hCx = player.x;
      const hCy = player.y;
      const hLeft = Math.PI * 0.2;
      const hRight = Math.PI * 0.8;
      ctx.strokeStyle = trackStrokeWide;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hCx, hCy, arcR, hLeft, hRight);
      ctx.stroke();
      ctx.strokeStyle = trackStroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hCx, hCy, arcR, hLeft, hRight);
      ctx.stroke();
      if (ratio > 1e-3) {
        ctx.strokeStyle = hungerFill;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const hungerStart = hRight - (hRight - hLeft) * ratio;
        ctx.arc(hCx, hCy, arcR, hungerStart, hRight);
        ctx.stroke();
      }
      ctx.restore();
    }
    function drawDashAim(ctx, player, range) {
      if (!dashAiming) return;
      const fl = Math.hypot(player.facing.x, player.facing.y) || 1;
      const fx = player.facing.x / fl;
      const fy = player.facing.y / fl;
      const x2 = player.x + fx * range;
      const y2 = player.y + fy * range;
      ctx.strokeStyle = "rgba(125, 211, 252, 0.9)";
      ctx.lineWidth = 2.4;
      ctx.setLineDash([9, 7]);
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(186, 230, 253, 0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x2, y2, 7, 0, TAU2);
      ctx.stroke();
    }
    function drawWorldPopups(ctx, elapsed) {
      ctx.save();
      ctx.font = "bold 13px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const p of popups) {
        if (elapsed >= p.expiresAt) continue;
        const u = clamp6((p.expiresAt - elapsed) / Math.max(1e-3, p.expiresAt - p.bornAt), 0, 1);
        ctx.globalAlpha = 0.35 + 0.65 * u;
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.restore();
    }
    function drawScreenHud(ctx, elapsed, viewW, viewH) {
      const ratio = clamp6(hunger / Math.max(1e-3, hungerMax), 0, 1);
      const x = 14;
      const y = 114;
      const w = 160;
      const h = 10;
      ctx.save();
      ctx.fillStyle = "rgba(51, 65, 85, 0.9)";
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = ratio > 0.35 ? "#f59e0b" : "#ef4444";
      ctx.fillRect(x, y, w * ratio, h);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
      ctx.fillStyle = "#fde68a";
      ctx.font = "12px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`Fed: ${hunger.toFixed(1)}s`, x, y + 14);
      if (stealthActive) {
        ctx.fillStyle = "#bbf7d0";
        ctx.fillText("Stealthed", x, y + 31);
      } else if (elapsed <= alertUntil) {
        ctx.fillStyle = "#fca5a5";
        ctx.fillText("Alerted", x, y + 31);
      } else {
        ctx.fillStyle = "#93c5fd";
        ctx.fillText("Seeking", x, y + 31);
      }
      const hungerMissing = 1 - ratio;
      if (hungerMissing > 0) {
        ctx.fillStyle = `rgba(20, 184, 166, ${0.04 + hungerMissing * 0.18})`;
        ctx.fillRect(0, 0, viewW, viewH);
      }
      if (!hasEnemyLos) {
        ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
        ctx.fillRect(0, 0, viewW, viewH);
        ctx.fillStyle = "#d1fae5";
        ctx.font = "bold 14px Arial";
        ctx.fillText("LoS broken", 14, 130);
      }
      ctx.restore();
    }
    function drawStealthAid(ctx, player, obstacles) {
      if (!stealthActive) return;
      const safeRadius = 56;
      ctx.strokeStyle = "rgba(16, 185, 129, 0.22)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(player.x, player.y, safeRadius, 0, TAU2);
      ctx.stroke();
      let bestD = Infinity;
      let bestPt = null;
      for (const o of obstacles) {
        const cx = clamp6(player.x, o.x, o.x + o.w);
        const cy = clamp6(player.y, o.y, o.y + o.h);
        const d = Math.hypot(player.x - cx, player.y - cy);
        if (d < bestD) {
          bestD = d;
          bestPt = { x: cx, y: cy };
        }
      }
      const inSafe = bestD <= safeRadius;
      if (bestPt && inSafe) {
        ctx.strokeStyle = "rgba(110, 231, 183, 0.72)";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(bestPt.x, bestPt.y);
        ctx.stroke();
        ctx.fillStyle = "rgba(167, 243, 208, 0.95)";
        ctx.beginPath();
        ctx.arc(bestPt.x, bestPt.y, 3.4, 0, TAU2);
        ctx.fill();
      }
    }
    return {
      reset,
      get smokeZones() {
        return smokeZones;
      },
      get foods() {
        return foods;
      },
      getHunger() {
        return hunger;
      },
      getDashAiming() {
        return dashAiming;
      },
      setDashAiming(v) {
        dashAiming = !!v;
      },
      tickNeeds,
      updateEnemyLos,
      pushSmokeZone,
      beginFoodSense,
      pickRogueHunterTarget,
      onDashLanded,
      desperationSpeedMult,
      stealthBlocksDamage,
      clubsPhaseThroughObstacles,
      playerInsideSmoke,
      drawSmokeAndFood,
      drawFoodSenseArrows,
      drawDashAim,
      drawSurvivalHudArcs,
      drawScreenHud,
      drawWorldPopups,
      drawStealthAid,
      spawnPopup,
      syncRogueDiamondRangeBoost,
      countSuitInDeck,
      smokeRadiusForInventory
    };
  }

  // src/escape/Hunters/hunterGeometry.js
  function distSq3(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }
  function clamp7(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }
  function vectorToTarget(from, target) {
    const dx = target.x - from.x;
    const dy = target.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }
  function intersectsRectCircle2(circle, rect) {
    const cx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
    const cy = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
    const dx = circle.x - cx;
    const dy = circle.y - cy;
    return dx * dx + dy * dy < circle.r * circle.r;
  }
  function lineIntersectsRect(x1, y1, x2, y2, rect) {
    const steps = Math.max(6, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 12));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return true;
    }
    return false;
  }
  function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const vx = x2 - x1;
    const vy = y2 - y1;
    const wx = px - x1;
    const wy = py - y1;
    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) return Math.hypot(px - x1, py - y1);
    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) return Math.hypot(px - x2, py - y2);
    const b = c1 / c2;
    const bx = x1 + b * vx;
    const by = y1 + b * vy;
    return Math.hypot(px - bx, py - by);
  }
  function outOfBoundsCircle() {
    return false;
  }

  // src/escape/items/setBonusPresentation.js
  function addSuitCount(suits, card) {
    if (!card?.suit) return;
    if (card.suit === "joker") {
      suits.diamonds += 1;
      suits.hearts += 1;
      suits.clubs += 1;
      suits.spades += 1;
    } else if (suits[card.suit] != null) suits[card.suit] += 1;
  }
  function countSuitsAcrossAllStowed(inventory2, pendingCard) {
    const suits = { diamonds: 0, hearts: 0, clubs: 0, spades: 0 };
    addSuitCount(suits, pendingCard);
    forEachDeckCard(inventory2, (c) => addSuitCount(suits, c));
    for (const c of inventory2.backpackSlots) addSuitCount(suits, c);
    return suits;
  }
  function countSuitsInActiveSlots(inventory2) {
    const suits = { diamonds: 0, hearts: 0, clubs: 0, spades: 0 };
    forEachDeckCard(inventory2, (c) => addSuitCount(suits, c));
    return suits;
  }
  function suitDisplayNameForModal(suit) {
    return { diamonds: "Diamonds", hearts: "Hearts", clubs: "Clubs", spades: "Spades" }[suit] ?? suit;
  }
  function suitInventoryGlowClass(card, suits) {
    if (!card?.suit) return "";
    if (card.suit === "joker") return "card-set-glow-white";
    const n = suits[card.suit];
    if (n < 2) return "";
    const suitsWithPair = MODAL_SET_SUIT_ORDER.filter((s) => suits[s] >= 2);
    const idx = suitsWithPair.indexOf(card.suit);
    if (idx < 0) return "";
    if (suitsWithPair.length === 1 && n >= 4) return "card-set-glow-yellow";
    const glowByPairOrder = ["card-set-glow-red", "card-set-glow-yellow", "card-set-glow-green", "card-set-glow-blue"];
    return glowByPairOrder[Math.min(idx, glowByPairOrder.length - 1)];
  }
  function clearCardGlowClasses(el) {
    if (!el) return;
    for (const c of CARD_SET_GLOW_CLASSES) el.classList.remove(c);
  }
  function getModalSetBonusProgressLines(inventory2, pendingCard, itemRules) {
    const suits = countSuitsInActiveSlots(inventory2);
    const lines = [];
    for (const suit of MODAL_SET_SUIT_ORDER) {
      const n = suits[suit];
      if (n < 1) continue;
      const name = suitDisplayNameForModal(suit);
      if (n < SET_BONUS_SUIT_THRESHOLD) {
        lines.push(`${name} ${n}/${SET_BONUS_SUIT_THRESHOLD} (${itemRules.suitSetBonusGoalLabel(suit)})`);
        continue;
      }
      lines.push(
        `${name} ${SET_BONUS_SUIT_THRESHOLD}/${SET_BONUS_SUIT_THRESHOLD} (${itemRules.suitSetBonusSevenActiveShort(suit)})`
      );
      if (n < SET_BONUS_SUIT_MAX) {
        lines.push(`${name} ${n}/${SET_BONUS_SUIT_MAX} (${itemRules.suitSetBonusTierTwoGoalLabel(suit)})`);
      } else {
        lines.push(`${name} ${SET_BONUS_SUIT_MAX}/${SET_BONUS_SUIT_MAX} (${itemRules.suitSetBonusTierTwoActiveShort(suit)})`);
      }
    }
    return lines;
  }

  // src/escape/Characters/valiantWorld.js
  function distSq4(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }
  function createValiantWorld() {
    let will = 1;
    let rabbitSlots = [null, null, null];
    let rescueReadyAt = 0;
    let nextBunnyAt = 0;
    let slotBonusMax = [0, 0, 0];
    let bunnies = [];
    let electricBoxes = [];
    let rabbitFx = [];
    let floatPopups = [];
    const boxChargeState = { charges: 1, maxCharges: 1, nextRechargeAt: 0 };
    function shockBoxScale(inventory2) {
      if (!inventory2) return 1;
      if (inventory2.diamondEmpower === "valiantBox") return VALIANT_DIAMOND_BOX_SCALE;
      const suits = countSuitsInActiveSlots(inventory2);
      if (suits.diamonds >= SET_BONUS_SUIT_MAX) return VALIANT_DIAMOND_BOX_SCALE;
      return 1;
    }
    function firstEmptySlot() {
      for (let i = 0; i < 3; i++) if (!rabbitSlots[i]) return i;
      return -1;
    }
    function lowestHpOccupiedSlot() {
      let best = -1;
      let bestHp = Infinity;
      for (let i = 0; i < 3; i++) {
        const s = rabbitSlots[i];
        if (!s || s.hp <= 0) continue;
        if (best < 0 || s.hp < bestHp || s.hp === bestHp && i < best) {
          bestHp = s.hp;
          best = i;
        }
      }
      return best;
    }
    function randomOccupiedRabbitIndex() {
      const opts = [];
      for (let i = 0; i < 3; i++) {
        const s = rabbitSlots[i];
        if (s && s.hp > 0) opts.push(i);
      }
      if (!opts.length) return -1;
      return opts[Math.floor(Math.random() * opts.length)];
    }
    function rabbitAnchorWorld(slot, player) {
      const px = player.x;
      const py = player.y;
      const fx = player.facing?.x || 1;
      const fy = player.facing?.y || 0;
      const fl = Math.hypot(fx, fy) || 1;
      const rdx = fx / fl;
      const rdy = fy / fl;
      const lx = -rdy;
      const ly = rdx;
      const spots = [
        { slot: 0, ox: lx * 15 - rdx * 7, oy: ly * 15 - rdy * 7 },
        { slot: 1, ox: -lx * 15 - rdx * 7, oy: -ly * 15 - rdy * 7 },
        { slot: 2, ox: -rdx * 19, oy: -rdy * 19 }
      ];
      const sp = spots.find((s) => s.slot === slot);
      if (!sp) return { x: px, y: py };
      return { x: px + sp.ox, y: py + sp.oy };
    }
    function occupiedRabbitCount() {
      let n = 0;
      for (let i = 0; i < 3; i++) if (rabbitSlots[i]) n += 1;
      return n;
    }
    function willNetChangePerSec() {
      const occ = occupiedRabbitCount();
      const drainAtZeroRabbits = 3 * VALIANT_WILL_DECAY_PER_EMPTY_SLOT;
      if (occ === 0) return -drainAtZeroRabbits;
      if (occ === 1) return -drainAtZeroRabbits / 2;
      if (occ === 2) return 0;
      return VALIANT_WILL_REGEN_PER_SEC_THREE_RABBITS;
    }
    function getWillNetChangePerSec() {
      return willNetChangePerSec();
    }
    function triggerDeathFromWill(hooks) {
      will = 0;
      hooks?.onWillDeath?.();
    }
    function applyDamage(amount, opts, rt) {
      if (amount <= 0) return;
      const elapsed = rt.getSimElapsed();
      const dmg = opts.surgeHexPulse ? 1 : amount;
      const idx = opts.surgeHexPulse ? lowestHpOccupiedSlot() : randomOccupiedRabbitIndex();
      if (idx < 0) return;
      const slot = rabbitSlots[idx];
      if (!slot) return;
      slot.hp -= dmg;
      if (opts.laserBlueSlow) {
        rt.combat.playerLaserSlowUntil = elapsed + LASER_BLUE_PLAYER_SLOW_SEC;
      }
      rt.combat.hurtFlashRemain = 0.16;
      rt.combat.playerInvulnerableUntil = elapsed + 0.35;
      rt.combat.screenShakeUntil = elapsed + 0.18;
      rt.combat.screenShakeStrength = Math.max(rt.combat.screenShakeStrength ?? 0, 8);
      rt.bumpScreenShake?.(8, 0.18);
      rt.grantInvulnerabilityUntil?.(elapsed + 0.35);
      const stunSecs = rt.getPlayer().stunOnHitSecs ?? 0;
      if (stunSecs > 0) rt.stunNearbyEnemies?.(stunSecs);
      if (slot.hp <= 0) {
        const { x: dax, y: day } = rabbitAnchorWorld(idx, rt.getPlayer());
        rabbitSlots[idx] = null;
        will = Math.max(0, will - VALIANT_WILL_RABBIT_DEATH_COST);
        rabbitFx.push({
          kind: "rabbitDeath",
          x: dax,
          y: day,
          angles: Array.from({ length: 11 }, (_, i) => i / 11 * Math.PI * 2 + (Math.random() * 2 - 1) * 0.22),
          bornAt: elapsed,
          expiresAt: elapsed + 0.52
        });
        rt.bumpScreenShake?.(16, 0.26);
        if (will <= 0) triggerDeathFromWill({ onWillDeath: rt.onWillDeath });
      }
    }
    function collidesEnemyShockField(circle, elapsed) {
      for (const box of electricBoxes) {
        if (elapsed >= box.expiresAt) continue;
        if (intersectsRectCircle2(circle, box)) return true;
      }
      return false;
    }
    function tryConsumeShockCharge(elapsed, effectiveBurstCd) {
      const st = boxChargeState;
      if (st.charges <= 0) return false;
      st.charges -= 1;
      if (st.charges < st.maxCharges) {
        st.nextRechargeAt = Math.max(st.nextRechargeAt || 0, elapsed + effectiveBurstCd);
      }
      return true;
    }
    function placeShockField(player, inventory2, elapsed, spawnAttackRing) {
      const scale = shockBoxScale(inventory2);
      const w = VALIANT_SHOCK_BOX_W * scale;
      const h = VALIANT_SHOCK_BOX_H * scale;
      const cx = player.x;
      const cy = player.y;
      electricBoxes.push({
        x: cx - w / 2,
        y: cy - h / 2,
        w,
        h,
        expiresAt: elapsed + VALIANT_SHOCK_BOX_DURATION_SEC
      });
      spawnAttackRing?.(cx, cy, Math.max(w, h) * 0.55, "#38bdf8", 0.28);
      spawnAttackRing?.(cx, cy, Math.max(w, h) * 0.38, "#bae6fd", 0.22);
    }
    function tryRescue(elapsed, inventory2, player, effectiveRescueCd, spawnAttackRing) {
      if (elapsed < rescueReadyAt) return;
      const slot = lowestHpOccupiedSlot();
      if (slot < 0) return;
      const anchor = rabbitAnchorWorld(slot, player);
      rabbitSlots[slot] = null;
      rescueReadyAt = elapsed + effectiveRescueCd;
      let willBump = VALIANT_RESCUE_WILL_RESTORE;
      if (inventory2.diamondEmpower === "valiantRescue" || countSuitsInActiveSlots(inventory2).diamonds >= SET_BONUS_SUIT_MAX) {
        willBump += VALIANT_DIAMOND_RESCUE_WILL_BONUS;
      }
      will = Math.min(1, will + willBump);
      rabbitFx.push({
        kind: "rescue",
        x: anchor.x,
        y: anchor.y,
        bornAt: elapsed,
        expiresAt: elapsed + 0.92
      });
      spawnAttackRing?.(player.x, player.y, player.r + 24, "#818cf8", 0.25);
    }
    function startRescueCooldownFromNow(elapsed, effectiveRescueCd) {
      rescueReadyAt = elapsed + effectiveRescueCd;
    }
    function tickExpireEntities(elapsed) {
      for (let i = electricBoxes.length - 1; i >= 0; i--) {
        if (elapsed >= electricBoxes[i].expiresAt) electricBoxes.splice(i, 1);
      }
      for (let i = rabbitFx.length - 1; i >= 0; i--) {
        if (elapsed >= rabbitFx[i].expiresAt) rabbitFx.splice(i, 1);
      }
      for (let i = bunnies.length - 1; i >= 0; i--) {
        if (elapsed >= bunnies[i].expiresAt) bunnies.splice(i, 1);
      }
      for (let i = floatPopups.length - 1; i >= 0; i--) {
        if (elapsed >= floatPopups[i].expiresAt) floatPopups.splice(i, 1);
      }
    }
    function spawnBunnySavedPopup(player, elapsed) {
      floatPopups.push({
        x: player.x,
        y: player.y - player.r - 10,
        text: "Saved",
        color: "#86efac",
        fontPx: 13,
        bornAt: elapsed,
        expiresAt: elapsed + 0.65
      });
    }
    function tryPickupBunnies(player, elapsed) {
      for (let i = bunnies.length - 1; i >= 0; i--) {
        const b = bunnies[i];
        if (elapsed >= b.expiresAt) {
          bunnies.splice(i, 1);
          continue;
        }
        const slot = firstEmptySlot();
        if (slot < 0) continue;
        const rr = b.r + player.r;
        if (distSq4(b, player) <= rr * rr) {
          const bonus = slotBonusMax[slot] ?? 0;
          rabbitSlots[slot] = { hp: VALIANT_RABBIT_BASE_HP + bonus, maxHp: VALIANT_RABBIT_BASE_HP + bonus };
          rabbitFx.push({
            kind: "bunnySaved",
            x: b.x,
            y: b.y,
            bornAt: elapsed,
            expiresAt: elapsed + 0.92
          });
          bunnies.splice(i, 1);
          spawnBunnySavedPopup(player, elapsed);
        }
      }
    }
    function tickWillDecay(simDt, hooks) {
      const netPerSec = willNetChangePerSec();
      will += netPerSec * simDt;
      will = Math.min(1, will);
      if (will <= 0) {
        will = 0;
        triggerDeathFromWill(hooks);
      }
    }
    function updateRescueCooldownWhenNoRabbits(elapsed, effectiveRescueCd) {
      if (occupiedRabbitCount() === 0) startRescueCooldownFromNow(elapsed, effectiveRescueCd);
    }
    function tickBoxRecharge(elapsed) {
      if (boxChargeState.charges < boxChargeState.maxCharges && boxChargeState.nextRechargeAt > 0 && elapsed >= boxChargeState.nextRechargeAt) {
        boxChargeState.charges = boxChargeState.maxCharges;
        boxChargeState.nextRechargeAt = 0;
      }
    }
    function syncBoxMaxCharges(maxCharges) {
      boxChargeState.maxCharges = Math.max(1, maxCharges);
      boxChargeState.charges = Math.min(boxChargeState.charges || boxChargeState.maxCharges, boxChargeState.maxCharges);
    }
    function trySpawnWildBunny(elapsed, randomPointFn, lootScale = 1) {
      if (elapsed < nextBunnyAt) return;
      const pt = randomPointFn();
      if (!pt) return;
      nextBunnyAt = elapsed + (VALIANT_BUNNY_SPAWN_INTERVAL + (Math.random() * 2 - 1) * 1.1 + Math.random() * 1.3) * lootScale;
      bunnies.push({
        x: pt.x,
        y: pt.y,
        r: VALIANT_BUNNY_PICKUP_R,
        bornAt: elapsed,
        expiresAt: elapsed + VALIANT_BUNNY_LIFETIME_SEC
      });
    }
    function healInjuredRabbitFromCrystal(healAmt) {
      const hurt = [];
      for (let j = 0; j < 3; j++) {
        const s = rabbitSlots[j];
        if (s && s.hp < s.maxHp) hurt.push(j);
      }
      if (!hurt.length) return false;
      const ri = hurt[Math.floor(Math.random() * hurt.length)];
      const rb = rabbitSlots[ri];
      if (!rb) return false;
      rb.hp = Math.min(rb.maxHp, rb.hp + healAmt);
      return true;
    }
    function applySafehouseFullHeal() {
      will = 1;
      for (let i = 0; i < 3; i++) {
        const s = rabbitSlots[i];
        if (s) {
          s.hp = s.maxHp;
        }
      }
    }
    function reset(elapsed) {
      will = 1;
      rabbitSlots = [null, null, null];
      rescueReadyAt = 0;
      nextBunnyAt = elapsed + 5;
      slotBonusMax = [0, 0, 0];
      bunnies.length = 0;
      electricBoxes.length = 0;
      rabbitFx.length = 0;
      floatPopups.length = 0;
      boxChargeState.charges = 1;
      boxChargeState.maxCharges = 1;
      boxChargeState.nextRechargeAt = 0;
    }
    return {
      reset,
      getWill: () => will,
      setSlotBonusMax(arr) {
        slotBonusMax = arr;
        for (let i = 0; i < 3; i++) {
          const s = rabbitSlots[i];
          if (s) {
            s.maxHp = VALIANT_RABBIT_BASE_HP + (arr[i] ?? 0);
            s.hp = Math.min(s.hp, s.maxHp);
          }
        }
      },
      getSlotBonusMax: () => slotBonusMax.slice(),
      getRabbitSlots: () => rabbitSlots,
      getBunnies: () => bunnies,
      getElectricBoxes: () => electricBoxes,
      getRabbitFx: () => rabbitFx,
      getFloatPopups: () => floatPopups,
      getBoxChargeState: () => boxChargeState,
      getRescueReadyAt: () => rescueReadyAt,
      setRescueReadyAt: (t) => {
        rescueReadyAt = t;
      },
      getNextBunnyAt: () => nextBunnyAt,
      setNextBunnyAt: (t) => {
        nextBunnyAt = t;
      },
      rabbitAnchorWorld,
      applyDamage,
      collidesEnemyShockField,
      placeShockField,
      tryConsumeShockCharge,
      tryRescue,
      tickExpireEntities,
      tryPickupBunnies,
      tickWillDecay,
      updateRescueCooldownWhenNoRabbits,
      tickBoxRecharge,
      syncBoxMaxCharges,
      trySpawnWildBunny,
      healInjuredRabbitFromCrystal,
      applySafehouseFullHeal,
      shockBoxScale,
      startRescueCooldownFromNow,
      occupiedRabbitCount,
      getWillNetChangePerSec
    };
  }

  // src/escape/hud/abilityBar.js
  function clamp8(x, a, b) {
    return Math.max(a, Math.min(b, x));
  }
  function syncAbilityBarDocument(doc, hud) {
    for (const slot of ["q", "w", "e", "r"]) {
      const root = doc.querySelector(`[data-ability-slot="${slot}"]`);
      if (!root) continue;
      const cell = hud[slot];
      if (!cell) continue;
      const fillEl = root.querySelector(".ability-fill");
      const labelEl = root.querySelector(".ability-label");
      const valueEl = root.querySelector(".ability-value");
      if (labelEl) labelEl.textContent = cell.label;
      if (valueEl) {
        valueEl.textContent = cell.value;
        valueEl.classList.remove("ability-value--lunatic-w", "ability-value--bulwark-e");
        if (cell.valueClass) valueEl.classList.add(cell.valueClass);
      }
      if (fillEl) {
        const f = cell.fill;
        if (f && f.duration > 1e-4) {
          const cooldownProgress = clamp8(1 - f.remaining / f.duration, 0, 1);
          fillEl.style.width = `${Math.round(cooldownProgress * 100)}%`;
          fillEl.style.background = f.color;
          fillEl.style.opacity = String(0.2 + cooldownProgress * 0.75);
          root.style.borderColor = f.color;
        } else {
          fillEl.style.width = "100%";
          fillEl.style.background = "#64748b";
          fillEl.style.opacity = "0.35";
          root.style.borderColor = "#475569";
        }
      }
      const mobileBtn = doc.getElementById(`mobile-btn-${slot}`);
      if (mobileBtn) {
        const keyEl = mobileBtn.querySelector(".mobile-action-key");
        const labelEl2 = mobileBtn.querySelector(".mobile-action-label");
        const valueEl2 = mobileBtn.querySelector(".mobile-action-value");
        const fillEl2 = mobileBtn.querySelector(".mobile-action-fill");
        if (keyEl) keyEl.textContent = slot.toUpperCase();
        if (labelEl2) labelEl2.textContent = cell.label;
        if (valueEl2) valueEl2.textContent = cell.value;
        if (fillEl2) {
          const idleBorder = mobileBtn.classList.contains("mobile-action-btn--ultimate") ? "rgba(249, 115, 22, 0.95)" : "#475569";
          const f = cell.fill;
          if (f && f.duration > 1e-4) {
            const cooldownProgress = clamp8(1 - f.remaining / f.duration, 0, 1);
            fillEl2.style.width = `${Math.round(cooldownProgress * 100)}%`;
            fillEl2.style.background = f.color;
            fillEl2.style.opacity = String(0.2 + cooldownProgress * 0.75);
            mobileBtn.style.borderColor = f.color;
          } else {
            fillEl2.style.width = "100%";
            fillEl2.style.background = "#64748b";
            fillEl2.style.opacity = "0.35";
            mobileBtn.style.borderColor = idleBorder;
          }
        }
      }
    }
  }

  // src/escape/hud/shellUi.js
  var GENERIC_CONTROLS_HINT = "Move: Arrows | Abilities: Q, W, E, R (labels from your hero) | Pause: Space | After death: Enter or Choose hero \u2192 character select";
  function applyShellUiFromCharacter(doc, character) {
    const el = doc.getElementById("game-controls-hint");
    if (!el) return;
    const line = typeof character.getShellUi === "function" ? character.getShellUi()?.controlsHintLine : null;
    el.textContent = line && line.trim() || GENERIC_CONTROLS_HINT;
  }

  // src/escape/hud/characterRoster.js
  function mountCharacterRoster(doc) {
    const host = doc.getElementById("character-select-pick");
    if (!host) return;
    host.replaceChildren();
    getHeroRoster().forEach((hero, index) => {
      const btn = doc.createElement("button");
      btn.type = "button";
      btn.className = "character-option";
      if (index > 0) btn.style.marginTop = "10px";
      btn.dataset.characterId = hero.id;
      btn.setAttribute("aria-label", hero.title);
      if (!hero.implemented) {
        btn.disabled = true;
        btn.classList.add("character-option--locked");
        btn.title = "Coming soon";
      }
      const title = doc.createElement("span");
      title.className = "title";
      title.textContent = hero.title;
      const meta = doc.createElement("span");
      meta.className = "meta";
      meta.textContent = hero.meta;
      btn.append(title, meta);
      host.append(btn);
    });
  }

  // src/escape/hud/devHeroSelect.js
  function mountDevActiveHeroSelect(doc, { initialId, onSelect }) {
    const sel = doc.getElementById("dev-active-hero-select");
    if (!(sel instanceof HTMLSelectElement)) {
      return { dispose() {
      }, setValue() {
      } };
    }
    sel.replaceChildren();
    for (const h of getHeroRoster()) {
      const opt = doc.createElement("option");
      opt.value = h.id;
      opt.textContent = h.title;
      opt.disabled = !h.implemented;
      sel.append(opt);
    }
    const roster = getHeroRoster();
    const resolved = roster.find((h) => h.id === initialId && h.implemented)?.id ?? roster.find((h) => h.implemented)?.id ?? "knight";
    sel.value = resolved;
    function setValue(id) {
      if (roster.some((h) => h.id === id && h.implemented)) {
        sel.value = id;
      }
    }
    function onChange() {
      const id = sel.value;
      const hero = roster.find((x) => x.id === id);
      if (!hero?.implemented) return;
      onSelect(id);
      sel.blur();
    }
    sel.addEventListener("change", onChange);
    return {
      setValue,
      dispose() {
        sel.removeEventListener("change", onChange);
      }
    };
  }

  // src/escape/WorldGeneration/generatedTiles.js
  function createGeneratedTilesManager({
    worldToHex,
    hexKey: hexKey2,
    hexToWorld,
    HEX_DIRS: HEX_DIRS2,
    generateHexTileObstacles: generateHexTileObstacles2,
    tileConfig,
    tryProceduralRareSpecialHex = () => {
    },
    isSpecialTile = () => false,
    onTileEvicted = () => {
    },
    purgeProceduralSpecialAnchorsOutsideWindow = () => {
    }
  }) {
    const tileCache = /* @__PURE__ */ new Map();
    function clearCache() {
      tileCache.clear();
    }
    function ensureTilesForPlayer({ player, obstacles, activePlayerHex, activeHexes, lastPlayerHexKey }) {
      const center = worldToHex(player.x, player.y);
      const centerKey = hexKey2(center.q, center.r);
      activePlayerHex = center;
      if (lastPlayerHexKey === centerKey && obstacles.length) {
        return { obstacles, activePlayerHex, activeHexes, lastPlayerHexKey };
      }
      lastPlayerHexKey = centerKey;
      const needed = [{ q: center.q, r: center.r }, ...HEX_DIRS2.map((d) => ({ q: center.q + d.q, r: center.r + d.r }))];
      activeHexes = needed;
      for (const h of needed) {
        const key = hexKey2(h.q, h.r);
        if (!tileCache.has(key)) {
          tryProceduralRareSpecialHex(h.q, h.r);
          const c = hexToWorld(h.q, h.r);
          const emptyTerrain = isSpecialTile(h.q, h.r);
          tileCache.set(
            key,
            generateHexTileObstacles2(h.q, h.r, {
              ...tileConfig,
              centerX: c.x,
              centerY: c.y,
              emptyTerrain
            })
          );
        }
      }
      const neededKeys = new Set(needed.map((h) => hexKey2(h.q, h.r)));
      for (const key of Array.from(tileCache.keys())) {
        if (!neededKeys.has(key)) {
          onTileEvicted(key);
          tileCache.delete(key);
        }
      }
      purgeProceduralSpecialAnchorsOutsideWindow(neededKeys);
      obstacles = [];
      for (const h of needed) {
        obstacles = obstacles.concat(tileCache.get(hexKey2(h.q, h.r)));
      }
      return { obstacles, activePlayerHex, activeHexes, lastPlayerHexKey };
    }
    return {
      clearCache,
      ensureTilesForPlayer
    };
  }

  // src/escape/WorldGeneration/specialHexState.js
  function proceduralSpecialDenominator(sim, rampBaseSim) {
    const elapsed = sim - rampBaseSim;
    if (elapsed < 0) return SPECIAL_PROCEDURAL_DENOM_START;
    const steps = Math.floor(elapsed / SPECIAL_PROCEDURAL_RAMP_STEP_SEC);
    return Math.max(SPECIAL_PROCEDURAL_DENOM_MIN, SPECIAL_PROCEDURAL_DENOM_START - steps);
  }
  function createSpecialHexRuntime({
    HEX_DIRS: HEX_DIRS2,
    hexKey: hexKey2,
    getIsLunatic = () => false,
    getSimElapsed = () => 0
  }) {
    const west = HEX_DIRS2[3];
    const westTestQ = west.q;
    const westTestR = west.r;
    const proceduralRoulette = /* @__PURE__ */ new Set();
    const proceduralForge = /* @__PURE__ */ new Set();
    const proceduralArena = /* @__PURE__ */ new Set();
    const proceduralSurge = /* @__PURE__ */ new Set();
    const proceduralSafehouse = /* @__PURE__ */ new Set();
    const rouletteSpent = /* @__PURE__ */ new Set();
    const forgeSpent = /* @__PURE__ */ new Set();
    const arenaSpent = /* @__PURE__ */ new Set();
    const surgeSpent = /* @__PURE__ */ new Set();
    const safehouseSpent = /* @__PURE__ */ new Set();
    let testWestKind = "na";
    let onProceduralSafehousePlaced = null;
    let quadRampBaseSim = SPECIAL_PROCEDURAL_GRACE_SEC;
    let safeRampBaseSim = SPECIAL_PROCEDURAL_GRACE_SEC;
    let spawnLockUntilSim = 0;
    function bumpProceduralSpecialDespawnLock() {
      const t = getSimElapsed();
      spawnLockUntilSim = Math.max(spawnLockUntilSim, t + SPECIAL_PROCEDURAL_POST_DESPAWN_LOCK_SEC);
    }
    function setOnProceduralSafehousePlaced(fn) {
      onProceduralSafehousePlaced = typeof fn === "function" ? fn : null;
    }
    function parseWestKind(raw) {
      const v = String(raw || "").trim();
      if (v === "roulette" || v === "forge" || v === "arena" || v === "surge" || v === "safehouse") return v;
      return "na";
    }
    function setTestWestKind(raw) {
      testWestKind = parseWestKind(raw);
    }
    function key(q, r) {
      return hexKey2(q, r);
    }
    function isSpawnHex(q, r) {
      return q === 0 && r === 0;
    }
    function isWestTestHex(q, r) {
      return q === westTestQ && r === westTestR;
    }
    function westVisualKind() {
      if (testWestKind === "roulette") return "roulette";
      if (testWestKind === "forge") return "forge";
      if (testWestKind === "arena") return "arena";
      if (testWestKind === "surge") return "surge";
      if (testWestKind === "safehouse") return "safehouse";
      return null;
    }
    function tryProceduralRareSpecialHex(q, r) {
      if (isSpawnHex(q, r)) return;
      if (isWestTestHex(q, r)) return;
      const k = key(q, r);
      if (proceduralRoulette.has(k) || proceduralForge.has(k) || proceduralArena.has(k) || proceduralSurge.has(k) || proceduralSafehouse.has(k) || safehouseSpent.has(k)) {
        return;
      }
      const activeSpecials = proceduralRoulette.size + proceduralForge.size + proceduralArena.size + proceduralSurge.size + proceduralSafehouse.size;
      if (activeSpecials >= 1) return;
      const sim = getSimElapsed();
      if (sim < SPECIAL_PROCEDURAL_GRACE_SEC) return;
      if (sim < spawnLockUntilSim) return;
      for (const d of HEX_DIRS2) {
        if (getVisualKind(q + d.q, r + d.r) !== null) return;
      }
      rouletteSpent.delete(k);
      forgeSpent.delete(k);
      arenaSpent.delete(k);
      surgeSpent.delete(k);
      safehouseSpent.delete(k);
      if (getIsLunatic()) {
        const dSafe2 = proceduralSpecialDenominator(sim, safeRampBaseSim);
        if (Math.random() >= 1 / dSafe2) return;
        proceduralSafehouse.add(k);
        onProceduralSafehousePlaced?.();
        safeRampBaseSim = sim;
        return;
      }
      const dQuad = proceduralSpecialDenominator(sim, quadRampBaseSim);
      if (Math.random() < 1 / dQuad) {
        const kindRoll = Math.random();
        const kind = kindRoll < 0.25 ? "arena" : kindRoll < 0.5 ? "roulette" : kindRoll < 0.75 ? "surge" : "forge";
        if (kind === "arena") proceduralArena.add(k);
        else if (kind === "roulette") proceduralRoulette.add(k);
        else if (kind === "surge") proceduralSurge.add(k);
        else proceduralForge.add(k);
        quadRampBaseSim = sim;
        return;
      }
      const dSafe = proceduralSpecialDenominator(sim, safeRampBaseSim);
      if (Math.random() >= 1 / dSafe) return;
      proceduralSafehouse.add(k);
      onProceduralSafehousePlaced?.();
      safeRampBaseSim = sim;
    }
    function purgeProceduralSpecialAnchorsOutsideWindow(neededKeys) {
      for (const s of proceduralRoulette) {
        if (!neededKeys.has(s) && proceduralRoulette.delete(s)) bumpProceduralSpecialDespawnLock();
      }
      for (const s of proceduralForge) {
        if (!neededKeys.has(s) && proceduralForge.delete(s)) bumpProceduralSpecialDespawnLock();
      }
      for (const s of proceduralArena) {
        if (!neededKeys.has(s) && proceduralArena.delete(s)) bumpProceduralSpecialDespawnLock();
      }
      for (const s of proceduralSurge) {
        if (!neededKeys.has(s) && proceduralSurge.delete(s)) bumpProceduralSpecialDespawnLock();
      }
      for (const s of proceduralSafehouse) {
        if (!neededKeys.has(s) && proceduralSafehouse.delete(s)) bumpProceduralSpecialDespawnLock();
      }
      for (const s of rouletteSpent) {
        if (!neededKeys.has(s)) rouletteSpent.delete(s);
      }
      for (const s of forgeSpent) {
        if (!neededKeys.has(s)) forgeSpent.delete(s);
      }
      for (const s of arenaSpent) {
        if (!neededKeys.has(s)) arenaSpent.delete(s);
      }
      for (const s of surgeSpent) {
        if (!neededKeys.has(s)) surgeSpent.delete(s);
      }
      for (const s of safehouseSpent) {
        if (!neededKeys.has(s)) safehouseSpent.delete(s);
      }
    }
    function onTileEvicted(cacheKey) {
      let removedActive = false;
      if (proceduralRoulette.delete(cacheKey)) removedActive = true;
      if (proceduralForge.delete(cacheKey)) removedActive = true;
      if (proceduralArena.delete(cacheKey)) removedActive = true;
      if (proceduralSurge.delete(cacheKey)) removedActive = true;
      if (proceduralSafehouse.delete(cacheKey)) removedActive = true;
      if (removedActive) bumpProceduralSpecialDespawnLock();
      rouletteSpent.delete(cacheKey);
      forgeSpent.delete(cacheKey);
      arenaSpent.delete(cacheKey);
      surgeSpent.delete(cacheKey);
      safehouseSpent.delete(cacheKey);
    }
    function getVisualKind(q, r) {
      if (isSpawnHex(q, r)) return null;
      const k = key(q, r);
      if (isWestTestHex(q, r)) {
        const w = westVisualKind();
        if (w) return w;
      }
      if (proceduralRoulette.has(k) || rouletteSpent.has(k)) return "roulette";
      if (proceduralForge.has(k) || forgeSpent.has(k)) return "forge";
      if (proceduralArena.has(k) || arenaSpent.has(k)) return "arena";
      if (proceduralSurge.has(k) || surgeSpent.has(k)) return "surge";
      if (proceduralSafehouse.has(k) || safehouseSpent.has(k)) return "safehouse";
      return null;
    }
    function isRouletteHexTile(q, r) {
      const k = key(q, r);
      if (proceduralRoulette.has(k) || rouletteSpent.has(k)) return true;
      if (isWestTestHex(q, r) && testWestKind === "roulette") return true;
      return false;
    }
    function isRouletteHexInteractive(q, r) {
      const k = key(q, r);
      if (proceduralRoulette.has(k)) return true;
      if (isWestTestHex(q, r) && testWestKind === "roulette") return true;
      return false;
    }
    function markProceduralRouletteHexSpent(q, r) {
      const k = key(q, r);
      if (!proceduralRoulette.has(k)) return;
      proceduralRoulette.delete(k);
      rouletteSpent.add(k);
      bumpProceduralSpecialDespawnLock();
    }
    function isForgeHexTile(q, r) {
      const k = key(q, r);
      if (proceduralForge.has(k) || forgeSpent.has(k)) return true;
      if (isWestTestHex(q, r) && testWestKind === "forge") return true;
      return false;
    }
    function isForgeHexInteractive(q, r) {
      const k = key(q, r);
      if (proceduralForge.has(k)) return true;
      if (isWestTestHex(q, r) && testWestKind === "forge") return true;
      return false;
    }
    function markProceduralForgeHexSpent(q, r) {
      const k = key(q, r);
      if (!proceduralForge.has(k)) return;
      proceduralForge.delete(k);
      forgeSpent.add(k);
      bumpProceduralSpecialDespawnLock();
    }
    function isArenaHexTile(q, r) {
      const k = key(q, r);
      if (proceduralArena.has(k) || arenaSpent.has(k)) return true;
      if (isWestTestHex(q, r) && testWestKind === "arena") return true;
      return false;
    }
    function isArenaHexInteractive(q, r) {
      const k = key(q, r);
      if (proceduralArena.has(k)) return true;
      if (isWestTestHex(q, r) && testWestKind === "arena") return true;
      return false;
    }
    function markProceduralArenaHexSpent(q, r) {
      const k = key(q, r);
      if (!proceduralArena.has(k)) return;
      proceduralArena.delete(k);
      arenaSpent.add(k);
      bumpProceduralSpecialDespawnLock();
    }
    function isSurgeHexTile(q, r) {
      const k = key(q, r);
      if (proceduralSurge.has(k) || surgeSpent.has(k)) return true;
      if (isWestTestHex(q, r) && testWestKind === "surge") return true;
      return false;
    }
    function isSurgeHexInteractive(q, r) {
      const k = key(q, r);
      if (proceduralSurge.has(k)) return true;
      if (isWestTestHex(q, r) && testWestKind === "surge") return true;
      return false;
    }
    function markProceduralSurgeHexSpent(q, r) {
      const k = key(q, r);
      if (!proceduralSurge.has(k)) return;
      proceduralSurge.delete(k);
      surgeSpent.add(k);
      bumpProceduralSpecialDespawnLock();
    }
    function isSafehouseHexActiveTile(q, r) {
      const k = key(q, r);
      if (safehouseSpent.has(k)) return false;
      if (proceduralSafehouse.has(k)) return true;
      if (isWestTestHex(q, r) && testWestKind === "safehouse") return true;
      return false;
    }
    function isSafehouseHexSpentTile(q, r) {
      return safehouseSpent.has(key(q, r));
    }
    function isSafehouseHexTile(q, r) {
      return isSafehouseHexActiveTile(q, r) || isSafehouseHexSpentTile(q, r);
    }
    function getPrimarySafehouseAxial() {
      if (isWestTestHex(westTestQ, westTestR) && testWestKind === "safehouse") {
        const k = key(westTestQ, westTestR);
        if (!safehouseSpent.has(k)) return { q: westTestQ, r: westTestR };
      }
      for (const k of proceduralSafehouse) {
        const [q, r] = k.split(",").map(Number);
        return { q, r };
      }
      return null;
    }
    function forEachSafehouseBarrierHex(cb) {
      for (const k of proceduralSafehouse) {
        const [q, r] = k.split(",").map(Number);
        if (Number.isFinite(q) && Number.isFinite(r)) cb(q, r);
      }
      for (const k of safehouseSpent) {
        const [q, r] = k.split(",").map(Number);
        if (Number.isFinite(q) && Number.isFinite(r)) cb(q, r);
      }
      if (testWestKind === "safehouse") cb(westTestQ, westTestR);
    }
    function markProceduralSafehouseHexSpent(q, r) {
      const k = key(q, r);
      const isDev = isWestTestHex(q, r) && testWestKind === "safehouse";
      if (proceduralSafehouse.has(k)) {
        proceduralSafehouse.delete(k);
        safehouseSpent.add(k);
        bumpProceduralSpecialDespawnLock();
      } else if (isDev) {
        safehouseSpent.add(k);
        bumpProceduralSpecialDespawnLock();
      } else {
        return;
      }
    }
    function isSpecialTile(q, r) {
      if (isSpawnHex(q, r)) return true;
      const kind = getVisualKind(q, r);
      return kind === "roulette" || kind === "forge" || kind === "arena" || kind === "surge" || kind === "safehouse";
    }
    function resetSessionState() {
      proceduralRoulette.clear();
      proceduralForge.clear();
      proceduralArena.clear();
      proceduralSurge.clear();
      proceduralSafehouse.clear();
      rouletteSpent.clear();
      forgeSpent.clear();
      arenaSpent.clear();
      surgeSpent.clear();
      safehouseSpent.clear();
      quadRampBaseSim = SPECIAL_PROCEDURAL_GRACE_SEC;
      safeRampBaseSim = SPECIAL_PROCEDURAL_GRACE_SEC;
      spawnLockUntilSim = 0;
    }
    return {
      westTestQ,
      westTestR,
      setTestWestKind,
      setOnProceduralSafehousePlaced,
      tryProceduralRareSpecialHex,
      purgeProceduralSpecialAnchorsOutsideWindow,
      onTileEvicted,
      getVisualKind,
      isSpecialTile,
      isRouletteHexTile,
      isRouletteHexInteractive,
      markProceduralRouletteHexSpent,
      isForgeHexTile,
      isForgeHexInteractive,
      markProceduralForgeHexSpent,
      isRouletteSpent: (q, r) => rouletteSpent.has(key(q, r)),
      isForgeSpent: (q, r) => forgeSpent.has(key(q, r)),
      isArenaHexTile,
      isArenaHexInteractive,
      isArenaSpent: (q, r) => arenaSpent.has(key(q, r)),
      markProceduralArenaHexSpent,
      isSurgeHexTile,
      isSurgeHexInteractive,
      isSurgeSpent: (q, r) => surgeSpent.has(key(q, r)),
      markProceduralSurgeHexSpent,
      isSafehouseHexTile,
      isSafehouseHexActiveTile,
      isSafehouseHexSpentTile,
      getPrimarySafehouseAxial,
      markProceduralSafehouseHexSpent,
      forEachSafehouseBarrierHex,
      resetSessionState
    };
  }

  // src/escape/draw.js
  var POINTY_HEX_PATH_CACHE = /* @__PURE__ */ new Map();
  function pointyHexPathAtOrigin(vertexRadius) {
    const key = Math.round(vertexRadius * 100) / 100;
    const hit = POINTY_HEX_PATH_CACHE.get(key);
    if (hit) return hit;
    const path = new Path2D();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + Math.PI / 3 * i;
      const x = Math.cos(a) * key;
      const y = Math.sin(a) * key;
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    path.closePath();
    POINTY_HEX_PATH_CACHE.set(key, path);
    return path;
  }
  function drawCircle(ctx, x, y, r, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  function drawHealPickup(ctx, p, elapsed, opts = {}) {
    const maxHpCrystal = !!opts.lunaticMaxHpCrystal;
    const bootlegSwamp = !!opts.bootlegSwampCrystal;
    const pulse = 0.94 + 0.06 * (0.5 + 0.5 * Math.sin(elapsed * 5));
    const h = (p.plusHalf ?? HEAL_PICKUP_PLUS_HALF) * pulse;
    const t = p.plusThick ?? HEAL_PICKUP_ARM_THICK;
    const { x, y } = p;
    ctx.save();
    ctx.translate(x, y);
    if (bootlegSwamp) {
      ctx.shadowColor = "rgba(202, 138, 4, 0.75)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#713f12";
      ctx.fillRect(-h, -t / 2, 2 * h, t);
      ctx.fillRect(-t / 2, -h, t, 2 * h);
      ctx.shadowBlur = 11;
      ctx.fillStyle = "#a16207";
      ctx.fillRect(-h + 0.8, -t / 2 + 0.5, 2 * h - 1.6, t - 1);
      ctx.fillRect(-t / 2 + 0.5, -h + 0.8, t - 1, 2 * h - 1.6);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#fde047";
      ctx.fillRect(-h * 0.52, -t * 0.32, h * 1.04, t * 0.64);
      ctx.fillRect(-t * 0.32, -h * 0.52, t * 0.64, h * 1.04);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(254, 240, 138, 0.55)";
    } else if (maxHpCrystal) {
      ctx.shadowColor = "rgba(251, 191, 36, 0.9)";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#92400e";
      ctx.fillRect(-h, -t / 2, 2 * h, t);
      ctx.fillRect(-t / 2, -h, t, 2 * h);
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#d97706";
      ctx.fillRect(-h + 0.8, -t / 2 + 0.5, 2 * h - 1.6, t - 1);
      ctx.fillRect(-t / 2 + 0.5, -h + 0.8, t - 1, 2 * h - 1.6);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = "#fde68a";
      ctx.fillRect(-h * 0.52, -t * 0.32, h * 1.04, t * 0.64);
      ctx.fillRect(-t * 0.32, -h * 0.52, t * 0.64, h * 1.04);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(254, 243, 199, 0.65)";
    } else {
      ctx.shadowColor = "rgba(52, 211, 153, 0.95)";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#047857";
      ctx.fillRect(-h, -t / 2, 2 * h, t);
      ctx.fillRect(-t / 2, -h, t, 2 * h);
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#10b981";
      ctx.fillRect(-h + 0.8, -t / 2 + 0.5, 2 * h - 1.6, t - 1);
      ctx.fillRect(-t / 2 + 0.5, -h + 0.8, t - 1, 2 * h - 1.6);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#d1fae5";
      ctx.fillRect(-h * 0.52, -t * 0.32, h * 1.04, t * 0.64);
      ctx.fillRect(-t * 0.32, -h * 0.52, t * 0.64, h * 1.04);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(236, 253, 245, 0.55)";
    }
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-h, -t / 2, 2 * h, t);
    ctx.strokeRect(-t / 2, -h, t, 2 * h);
    const lifeSpan = Math.max(1e-3, (p.expiresAt ?? elapsed) - (p.bornAt ?? elapsed - 1));
    const rem = Math.max(0, (p.expiresAt ?? elapsed) - elapsed);
    const frac = Math.max(0, Math.min(1, rem / lifeSpan));
    const barW = 24;
    const barH = 4;
    const barY = h + 8;
    ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
    ctx.fillRect(-barW / 2, barY, barW, barH);
    ctx.fillStyle = bootlegSwamp ? frac > 0.35 ? "rgba(250, 204, 21, 0.92)" : "rgba(217, 119, 6, 0.9)" : maxHpCrystal ? frac > 0.35 ? "rgba(251, 191, 36, 0.95)" : "rgba(248, 113, 113, 0.95)" : frac > 0.35 ? "rgba(110, 231, 183, 0.95)" : "rgba(251, 146, 60, 0.95)";
    ctx.fillRect(-barW / 2, barY, barW * frac, barH);
    ctx.strokeStyle = bootlegSwamp ? "rgba(253, 224, 71, 0.65)" : maxHpCrystal ? "rgba(254, 243, 199, 0.75)" : "rgba(236, 253, 245, 0.7)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-barW / 2, barY, barW, barH);
    ctx.restore();
  }
  function drawObstacles(ctx, obstacles, opts = {}) {
    const fill = opts.fill ?? "#334155";
    const stroke = opts.stroke ?? "#94a3b8";
    const glowColor = opts.glowColor ?? null;
    const glowBlur = Math.max(0, Number(opts.glowBlur ?? 0));
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    if (glowColor && glowBlur > 0) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = glowBlur;
    }
    for (const o of obstacles) {
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    }
    if (glowColor && glowBlur > 0) ctx.shadowBlur = 0;
  }
  function fillPointyHexCell(ctx, cx, cy, vertexRadius, fillStyle, strokeStyle = "rgba(148, 163, 184, 0.35)") {
    const fillBleed = 0.85;
    const R = vertexRadius + fillBleed;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + Math.PI / 3 * i;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    if (strokeStyle != null && strokeStyle !== "") {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + Math.PI / 3 * i;
        const x = cx + Math.cos(a) * vertexRadius;
        const y = cy + Math.sin(a) * vertexRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
  function drawDecoy(ctx, d) {
    ctx.save();
    ctx.globalAlpha = 0.36;
    drawCircle(ctx, d.x, d.y, d.r, "#64748b", 1);
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  function drawPlayerHpHud(ctx, player, opts = {}) {
    const tempHp = opts.tempHp ?? player.tempHp ?? 0;
    const extraHudYOffset = opts.extraHudYOffset ?? 0;
    const x = player.x;
    const y = player.y;
    const r = player.r;
    const maxHp = Math.max(1, player.maxHp ?? 1);
    const hpText = `${Math.ceil(player.hp)} / ${maxHp}`;
    const tempText = tempHp > 0 ? `+${Math.ceil(tempHp)} temp` : "";
    const mainY = y - r - 10 - extraHudYOffset;
    const extraY = mainY - (tempText ? 14 : 0);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.font = 'bold 15px ui-sans-serif, system-ui, "Segoe UI", sans-serif';
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(2, 6, 23, 0.82)";
    ctx.strokeText(hpText, x, mainY);
    ctx.fillStyle = player.hp <= maxHp * 0.35 ? "#fca5a5" : "#f8fafc";
    ctx.fillText(hpText, x, mainY);
    if (tempText) {
      ctx.font = '11px ui-sans-serif, system-ui, "Segoe UI", sans-serif';
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(2, 6, 23, 0.82)";
      ctx.strokeText(tempText, x, extraY);
      ctx.fillStyle = "#6ee7b7";
      ctx.fillText(tempText, x, extraY);
    }
    ctx.restore();
  }
  function drawRunStatsHud(ctx, { survivalSec, bestSec, displayLevel, wave, hunterCount }) {
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "15px Arial";
    ctx.fillText(`Survival: ${survivalSec.toFixed(1)}s`, 14, 12);
    ctx.fillText(`Best: ${bestSec.toFixed(1)}s`, 14, 32);
    ctx.fillText(`Level: ${displayLevel}`, 14, 52);
    ctx.fillText(`Wave: ${wave}`, 14, 72);
    ctx.fillText(`Hunters: ${hunterCount}`, 14, 92);
    ctx.restore();
  }
  function drawSwampBootlegCursesHud(ctx, viewW, viewH, rows) {
    if (!rows?.length) return;
    const pad = 12;
    const x = viewW - pad;
    const maxW = Math.min(240, viewW * 0.34);
    ctx.save();
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    let y = 10;
    ctx.font = "600 11px ui-sans-serif, system-ui, Arial, sans-serif";
    ctx.fillStyle = "rgba(217, 249, 157, 0.95)";
    ctx.fillText("BOG DEBTS", x, y);
    y += 15;
    ctx.font = "11px ui-sans-serif, system-ui, Arial, sans-serif";
    for (const r of rows) {
      if (y > viewH - 100) break;
      const eff = truncateHudLine(ctx, r.effect, maxW);
      const pur = truncateHudLine(ctx, r.purge, maxW);
      ctx.fillStyle = "#ecfccb";
      ctx.fillText(eff, x, y);
      y += 13;
      ctx.fillStyle = "rgba(203, 213, 225, 0.92)";
      ctx.fillText(pur, x, y);
      y += 16;
    }
    ctx.restore();
  }
  function truncateHudLine(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    const ell = "\u2026";
    let s = text;
    while (s.length > 0 && ctx.measureText(s + ell).width > maxW) {
      s = s.slice(0, -1);
    }
    return s + ell;
  }
  function drawPlayerBody(ctx, x, y, radius, facing = { x: 1, y: 0 }, hurt01 = 0, bodyAlpha = 1) {
    const e = Math.max(0, Math.min(1, hurt01)) * 0.65;
    const t = { r: 96, g: 165, b: 250 };
    const n = { r: 239, g: 68, b: 68 };
    const mid = `rgb(${Math.round(t.r + (n.r - t.r) * e)},${Math.round(t.g + (n.g - t.g) * e)},${Math.round(t.b + (n.b - t.b) * e)})`;
    const g = ctx.createRadialGradient(
      x - radius * 0.42,
      y - radius * 0.48,
      radius * 0.06,
      x,
      y,
      radius
    );
    g.addColorStop(0, "rgba(248, 250, 252, 0.95)");
    g.addColorStop(0.38, mid);
    g.addColorStop(1, "rgba(15, 23, 42, 0.88)");
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, bodyAlpha));
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();
    const c = facing.x;
    const l = facing.y;
    const len = Math.hypot(c, l) || 1;
    const fx = c / len;
    const fy = l / len;
    const u = x + fx * radius * 0.72;
    const d = y + fy * radius * 0.72;
    const fp = -fy * radius * 0.28;
    const fq = fx * radius * 0.28;
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.beginPath();
    ctx.moveTo(u, d);
    ctx.lineTo(x + fx * radius * 0.15 + fp, y + fy * radius * 0.15 + fq);
    ctx.lineTo(x + fx * radius * 0.15 - fp, y + fy * radius * 0.15 - fq);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  function drawKnightBurstAura(ctx, x, y, radius, bodyAlpha = 1) {
    ctx.save();
    ctx.globalAlpha = 0.3 * Math.max(0, Math.min(1, bodyAlpha));
    drawCircle(ctx, x, y, radius + 4, "#22d3ee", 1);
    ctx.restore();
  }
  function drawFrontShieldArc(ctx, player, elapsed) {
    const arcDeg = Math.max(0, Number(player.frontShieldArcDeg ?? 0));
    if (arcDeg <= 0) return;
    const fx = player.facing?.x ?? 1;
    const fy = player.facing?.y ?? 0;
    const facing = Math.atan2(fy, fx);
    const arc = arcDeg * Math.PI / 180;
    const pulse = 0.85 + 0.15 * (0.5 + 0.5 * Math.sin(elapsed * 8));
    const r = player.r + 30;
    ctx.save();
    ctx.strokeStyle = `rgba(248, 113, 113, ${0.78 * pulse})`;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(player.x, player.y, r, facing - arc / 2, facing + arc / 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(254, 202, 202, ${0.34 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, r + 4, facing - arc / 2, facing + arc / 2);
    ctx.stroke();
    ctx.restore();
  }
  function drawArenaNexusHexWorld(ctx, activeHexes, hexToWorld, isArenaTile, isArenaSpent, arenaFx = null) {
    for (const h of activeHexes) {
      if (!isArenaTile(h.q, h.r)) continue;
      const { x: cx, y: cy } = hexToWorld(h.q, h.r);
      let outer = "rgba(59, 130, 246, 0.92)";
      let inner = "rgba(96, 165, 250, 0.88)";
      if (isArenaSpent(h.q, h.r)) {
        outer = "rgba(34, 197, 94, 0.92)";
        inner = "rgba(74, 222, 128, 0.88)";
      } else if (arenaFx && arenaFx.phase === 1) {
        outer = "rgba(239, 68, 68, 0.95)";
        inner = "rgba(248, 113, 113, 0.9)";
      } else if (arenaFx && arenaFx.phase === 2) {
        outer = "rgba(34, 197, 94, 0.92)";
        inner = "rgba(74, 222, 128, 0.88)";
      }
      strokePointyHexOutline(ctx, cx, cy, HEX_SIZE, outer, 3.2, 18);
      strokePointyHexOutline(ctx, cx, cy, HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE, inner, 2.4, 14);
      if (arenaFx && arenaFx.phase === 1 && h.q === arenaFx.siegeQ && h.r === arenaFx.siegeR && !isArenaSpent(h.q, h.r)) {
        const rem = Math.max(0, arenaFx.siegeEndAt - arenaFx.simElapsed);
        const u = rem / ARENA_NEXUS_SIEGE_SEC;
        const arcR = HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE * 0.78;
        ctx.save();
        ctx.strokeStyle = "rgba(248, 250, 252, 0.95)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(cx, cy, arcR, -Math.PI / 2, -Math.PI / 2 + TAU * u);
        ctx.stroke();
        ctx.fillStyle = "rgba(248, 250, 252, 0.85)";
        ctx.font = "600 13px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(rem <= 0 ? "0" : rem.toFixed(1) + "s", cx, cy);
        ctx.restore();
      }
    }
  }
  function drawSurgeHexWorld(ctx, activeHexes, hexToWorld, isSurgeTile, isSurgeSpent, surgeFx = null) {
    const innerVertexR = HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE;
    for (const h of activeHexes) {
      if (!isSurgeTile(h.q, h.r)) continue;
      const { x: cx, y: cy } = hexToWorld(h.q, h.r);
      const isOuterWait = surgeFx && surgeFx.phase === 1 && h.q === surgeFx.lockQ && h.r === surgeFx.lockR;
      const isActiveGauntlet = surgeFx && surgeFx.phase === 2 && h.q === surgeFx.lockQ && h.r === surgeFx.lockR;
      const isInnerOpenOuterLocked = surgeFx && surgeFx.phase === 3 && h.q === surgeFx.lockQ && h.r === surgeFx.lockR;
      const isFullyCleared = surgeFx && surgeFx.phase === 4 && h.q === surgeFx.lockQ && h.r === surgeFx.lockR;
      let outer = "rgba(59, 130, 246, 0.92)";
      let inner = "rgba(96, 165, 250, 0.88)";
      if (isSurgeSpent(h.q, h.r)) {
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
      if (isActiveGauntlet && surgeFx) {
        ctx.save();
        ctx.fillStyle = "rgba(248, 250, 252, 0.92)";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI / 2 + Math.PI / 3 * i;
          const x = surgeFx.safeX + Math.cos(a) * SURGE_GAUNTLET_SAFE_DRAW_R;
          const y = surgeFx.safeY + Math.sin(a) * SURGE_GAUNTLET_SAFE_DRAW_R;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
        const u = Math.max(
          0,
          Math.min(1, (surgeFx.simElapsed - surgeFx.travelStartAt) / Math.max(1e-4, surgeFx.travelDur))
        );
        const pulseCx = cx + (surgeFx.safeX - cx) * u;
        const pulseCy = cy + (surgeFx.safeY - cy) * u;
        const pulseR = innerVertexR + (SURGE_GAUNTLET_SAFE_DRAW_R - innerVertexR) * u;
        const pulseStroke = 2.4 + (3.2 - 2.4) * (1 - u);
        strokePointyHexOutline(ctx, pulseCx, pulseCy, pulseR, "rgba(248, 113, 113, 0.95)", pulseStroke, 18);
      }
    }
  }
  function strokePointyHexOutline(ctx, cx, cy, vertexRadius, strokeStyle, lineWidth, glowBlur) {
    const path = pointyHexPathAtOrigin(vertexRadius);
    const blur = Math.max(0, Math.min(6, Number(glowBlur) || 0));
    ctx.save();
    if (blur > 0) {
      ctx.shadowColor = strokeStyle;
      ctx.shadowBlur = blur;
    }
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.translate(cx, cy);
    ctx.stroke(path);
    ctx.restore();
  }
  function fillPointyHexRainbowGlow(ctx, cx, cy, vertexRadius, elapsed, drawOutline = true, fillAlphaScale = 1) {
    const path = pointyHexPathAtOrigin(vertexRadius);
    ctx.save();
    ctx.translate(cx, cy);
    const spin = elapsed * 2.8;
    ctx.fillStyle = `hsla(${spin * 57 % 360}, 92%, 58%, 0.55)`;
    ctx.globalAlpha = 0.52 * fillAlphaScale;
    ctx.fill(path);
    ctx.globalAlpha = 1;
    if (drawOutline) {
      ctx.strokeStyle = `rgba(255,255,255,${0.35 * fillAlphaScale})`;
      ctx.lineWidth = 1.5;
      ctx.stroke(path);
    }
    ctx.restore();
  }
  function drawSafehouseHexCell(ctx, cx, cy, vertexRadius, elapsed) {
    const innerVertexR = vertexRadius * SURGE_GAUNTLET_SAFE_DRAW_R / HEX_SIZE;
    const coreFill = "rgba(15, 23, 42, 0.94)";
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + Math.PI / 3 * i;
      const x = cx + Math.cos(a) * vertexRadius;
      const y = cy + Math.sin(a) * vertexRadius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.clip();
    const outerGradR = vertexRadius * 0.98;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerGradR);
    g.addColorStop(0, coreFill);
    g.addColorStop(0.12, "rgba(15, 23, 42, 0.9)");
    g.addColorStop(0.28, "rgba(30, 41, 59, 0.42)");
    g.addColorStop(0.4, "rgba(51, 65, 85, 0.32)");
    g.addColorStop(0.52, "rgba(100, 116, 139, 0.38)");
    g.addColorStop(0.62, "rgba(148, 163, 184, 0.46)");
    g.addColorStop(0.7, "rgba(186, 198, 214, 0.55)");
    g.addColorStop(0.78, "rgba(226, 232, 240, 0.72)");
    g.addColorStop(0.86, "rgba(248, 250, 252, 0.9)");
    g.addColorStop(0.93, "rgba(255, 255, 255, 0.97)");
    g.addColorStop(1, "rgba(255, 255, 255, 0.99)");
    ctx.fillStyle = g;
    ctx.fill();
    const nWisps = 6;
    for (let w = 0; w < nWisps; w++) {
      const drift = elapsed * 0.48 + w * (TAU / nWisps) + w * 0.31;
      const radial = 0.72 + 0.12 * Math.sin(elapsed * 0.9 + w * 0.7) + w % 4 * 0.018;
      const px = cx + Math.cos(drift) * vertexRadius * radial + Math.sin(elapsed * 1.15 + w * 0.9) * 4;
      const py = cy + Math.sin(drift * 0.85) * vertexRadius * radial + Math.cos(elapsed * 0.95 + w * 0.6) * 3;
      const smokeR = vertexRadius * (0.14 + 0.06 * Math.sin(elapsed * 2.2 + w * 1.1));
      const sg = ctx.createRadialGradient(px, py, 0, px, py, smokeR);
      sg.addColorStop(0, "rgba(148, 163, 184, 0.12)");
      sg.addColorStop(0.5, "rgba(148, 163, 184, 0.06)");
      sg.addColorStop(1, "rgba(148, 163, 184, 0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(px, py, smokeR, 0, TAU);
      ctx.fill();
    }
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + Math.PI / 3 * i;
      const x = cx + Math.cos(a) * innerVertexR;
      const y = cy + Math.sin(a) * innerVertexR;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = coreFill;
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + Math.PI / 3 * i;
      const x = cx + Math.cos(a) * innerVertexR;
      const y = cy + Math.sin(a) * innerVertexR;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.clip();
    const pad = innerVertexR * 2.8;
    const t = elapsed;
    const hx = Math.cos(t * 0.62) * innerVertexR * 0.42;
    const hy = Math.sin(t * 0.48 + 0.7) * innerVertexR * 0.36;
    const sh1 = ctx.createRadialGradient(cx + hx, cy + hy, 0, cx + hx * 0.15, cy + hy * 0.12, innerVertexR * 1.45);
    sh1.addColorStop(0, "rgba(190, 220, 235, 0.5)");
    sh1.addColorStop(0.38, "rgba(56, 100, 128, 0.18)");
    sh1.addColorStop(1, "rgba(15, 23, 42, 0)");
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = sh1;
    ctx.fillRect(cx - pad, cy - pad, pad * 2, pad * 2);
    const hx2 = Math.cos(t * 0.38 + 2.2) * innerVertexR * 0.33;
    const hy2 = Math.sin(t * 0.71 + 1.1) * innerVertexR * 0.4;
    const sh2 = ctx.createRadialGradient(cx + hx2, cy + hy2, 0, cx, cy, innerVertexR * 1.05);
    sh2.addColorStop(0, "rgba(165, 200, 218, 0.35)");
    sh2.addColorStop(0.5, "rgba(30, 55, 75, 0.08)");
    sh2.addColorStop(1, "rgba(15, 23, 42, 0)");
    ctx.globalAlpha = 0.11;
    ctx.fillStyle = sh2;
    ctx.fillRect(cx - pad, cy - pad, pad * 2, pad * 2);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
    ctx.restore();
    strokePointyHexOutline(ctx, cx, cy, vertexRadius, "rgba(255, 255, 255, 0.94)", 3.4, 14);
  }
  function drawSafehouseEmbeddedFacilities(ctx, opts) {
    const {
      rouletteX,
      rouletteY,
      forgeX,
      forgeY,
      vertexRadius,
      elapsed,
      embeddedRouletteComplete,
      embeddedForgeComplete = false
    } = opts;
    ctx.save();
    if (embeddedRouletteComplete) {
      fillPointyHexRainbowGlow(ctx, rouletteX, rouletteY, vertexRadius, elapsed, false, 0.34);
    } else {
      fillPointyHexRainbowGlow(ctx, rouletteX, rouletteY, vertexRadius, elapsed, false);
    }
    ctx.restore();
    drawForgeHexCell(ctx, forgeX, forgeY, vertexRadius, elapsed, !!embeddedForgeComplete);
  }
  var SQRT3_DRAW = Math.sqrt(3);
  function drawSafehouseHexWorld(ctx, o) {
    let prim = null;
    if (!o.isLunatic() && o.innerFacilitiesUnlocked) {
      const p = o.getPrimarySafehouseAxial();
      if (p && o.isSafehouseHexActiveTile(p.q, p.r)) prim = p;
    }
    for (const h of o.activeHexes) {
      if (!o.isSafehouseHexTile(h.q, h.r)) continue;
      const c = o.hexToWorld(h.q, h.r);
      drawSafehouseHexCell(ctx, c.x, c.y, HEX_SIZE, o.simElapsed);
      const kk = `${h.q},${h.r}`;
      if (o.isSafehouseHexSpentTile(h.q, h.r)) {
        const fx = o.spentTileAnim;
        let u = 1;
        if (fx && fx.key === kk) {
          const raw = (o.nowMs - fx.startMs) / SAFEHOUSE_SPENT_TILE_ANIM_MS;
          u = Math.max(0, Math.min(1, raw));
          u = u * u * (3 - 2 * u);
        }
        const overlayA = 0.72 * u;
        const rimA = 0.62 * Math.max(0, u - 0.12) * Math.min(1, (u - 0.12) / 0.55);
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI / 2 + Math.PI / 3 * i;
          const x = c.x + Math.cos(a) * HEX_SIZE;
          const y = c.y + Math.sin(a) * HEX_SIZE;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        if (fx && fx.key === kk && u < 0.28) {
          const w = Math.sin(u / 0.28 * Math.PI);
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
      if (prim && prim.q === h.q && prim.r === h.r) {
        const w = o.hexToWorld(h.q + o.HEX_DIRS[3].q, h.r + o.HEX_DIRS[3].r);
        const e = o.hexToWorld(h.q + o.HEX_DIRS[0].q, h.r + o.HEX_DIRS[0].r);
        const t = HEX_SIZE * SAFEHOUSE_EMBED_CENTER_INSET;
        const lenW = Math.hypot(w.x - c.x, w.y - c.y) || 1;
        const lenE = Math.hypot(e.x - c.x, e.y - c.y) || 1;
        const rw = { x: c.x + (w.x - c.x) / lenW * t, y: c.y + (w.y - c.y) / lenW * t };
        const fw = { x: c.x + (e.x - c.x) / lenE * t, y: c.y + (e.y - c.y) / lenE * t };
        const vr = HEX_SIZE * SAFEHOUSE_EMBED_HEX_VERTEX_R_MULT;
        drawSafehouseEmbeddedFacilities(ctx, {
          rouletteX: rw.x,
          rouletteY: rw.y,
          forgeX: fw.x,
          forgeY: fw.y,
          vertexRadius: vr,
          elapsed: o.simElapsed,
          embeddedRouletteComplete: o.embeddedRouletteComplete,
          embeddedForgeComplete: o.embeddedForgeComplete
        });
      }
    }
  }
  function safehouseEmbedSiteHitRadiusWorld() {
    const vr = HEX_SIZE * SAFEHOUSE_EMBED_HEX_VERTEX_R_MULT;
    return Math.max(SAFEHOUSE_EMBED_SITE_HIT_R, vr * (SQRT3_DRAW / 2) * 1.08);
  }
  function drawForgeHexCell(ctx, cx, cy, vertexRadius, elapsed, spentLook = false) {
    const t = elapsed;
    const lwOut = Math.max(1.1, Math.min(3.1, vertexRadius * 0.16));
    const lwIn = Math.max(0.9, lwOut * 0.52);
    const outStroke = spentLook ? "rgba(55, 48, 36, 0.92)" : "rgba(180, 83, 9, 0.95)";
    const inStroke = spentLook ? "rgba(71, 85, 105, 0.45)" : "rgba(253, 224, 71, 0.55)";
    strokePointyHexOutline(ctx, cx, cy, vertexRadius, outStroke, lwOut, Math.min(12, vertexRadius * 0.45));
    strokePointyHexOutline(ctx, cx, cy, vertexRadius * 0.88, inStroke, lwIn, Math.min(6, vertexRadius * 0.28));
    const pulse = spentLook ? 0.35 : 0.5 + 0.5 * Math.sin(t * 2.4);
    const coreR = vertexRadius * 0.42;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 1.6);
    g.addColorStop(0, `rgba(254, 243, 199, ${spentLook ? 0.08 : 0.35 + 0.2 * pulse})`);
    g.addColorStop(0.45, spentLook ? "rgba(30, 27, 20, 0.72)" : "rgba(120, 53, 15, 0.55)");
    g.addColorStop(1, "rgba(30, 20, 12, 0.2)");
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + Math.PI / 3 * i;
      const x = cx + Math.cos(a) * vertexRadius * 0.78;
      const y = cy + Math.sin(a) * vertexRadius * 0.78;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }
  var CARD_PICKUP_SUIT_GLYPH = {
    hearts: "\u2665",
    diamonds: "\u2666",
    clubs: "\u2663",
    spades: "\u2660"
  };
  function cardPickupRankLabel(rank) {
    if (rank === 1) return "A";
    if (rank === 11) return "J";
    if (rank === 12) return "Q";
    if (rank === 13) return "K";
    return String(rank);
  }
  function cardPickupSuitPalette(suit) {
    if (suit === "hearts") return { ink: "#b91c1c", fill: "#fff1f2", rim: "rgba(185, 28, 28, 0.45)" };
    if (suit === "diamonds") return { ink: "#b91c1c", fill: "#fff5f5", rim: "rgba(185, 28, 28, 0.42)" };
    if (suit === "clubs") return { ink: "#166534", fill: "#f0fdf4", rim: "rgba(22, 101, 52, 0.45)" };
    return { ink: "#0f172a", fill: "#f8fafc", rim: "rgba(15, 23, 42, 0.4)" };
  }
  function drawCardPickupMiniFace(ctx, card, w, h) {
    const { ink, fill, rim } = cardPickupSuitPalette(card.suit);
    const glyph = CARD_PICKUP_SUIT_GLYPH[card.suit] ?? "?";
    const hw = w / 2;
    const hh = h / 2;
    ctx.save();
    ctx.shadowColor = "rgba(15, 23, 42, 0.35)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = fill;
    ctx.fillRect(-hw, -hh, w, h);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = rim;
    ctx.lineWidth = 2;
    ctx.strokeRect(-hw + 1, -hh + 1, w - 2, h - 2);
    ctx.fillStyle = ink;
    ctx.font = "bold 11px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`${cardPickupRankLabel(card.rank)}${glyph}`, -hw + 4, -hh + 3);
    ctx.font = "bold 20px ui-serif, Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(glyph, 0, 1);
    ctx.restore();
  }
  function drawCardPickupWorld(ctx, pickup, elapsed) {
    const born = pickup.bornAt ?? elapsed;
    const bob = Math.sin((elapsed - born) * 4.2) * 2.2;
    const cx = pickup.x;
    const cy = pickup.y + bob;
    const flipT = (elapsed - born) * 2.35;
    const cos = Math.cos(flipT);
    const scaleX = Math.max(0.11, Math.abs(cos));
    const faceA = pickup.visualCardA ?? pickup.flipCard ?? pickup.card;
    const faceB = pickup.visualCardB ?? pickup.card;
    const face = cos >= 0 ? faceA : faceB;
    const w = 28;
    const h = 38;
    const spotR = Math.max(48, (pickup.r ?? 20) * 2.6);
    ctx.save();
    ctx.translate(cx, cy);
    const g0 = ctx.createRadialGradient(0, 0, 0, 0, 0, spotR);
    g0.addColorStop(0, "rgba(254, 252, 232, 0.42)");
    g0.addColorStop(0.35, "rgba(251, 191, 36, 0.14)");
    g0.addColorStop(0.65, "rgba(59, 130, 246, 0.06)");
    g0.addColorStop(1, "rgba(15, 23, 42, 0)");
    ctx.fillStyle = g0;
    ctx.beginPath();
    ctx.arc(0, 0, spotR, 0, TAU);
    ctx.fill();
    const ringPulse = 0.5 + 0.5 * Math.sin(elapsed * 3.1 + born * 0.7);
    const ringR = (pickup.r ?? 20) + 10 + ringPulse * 5;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.22 + 0.18 * ringPulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = `rgba(251, 191, 36, ${0.12 + 0.1 * ringPulse})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, ringR + 3, 0, TAU);
    ctx.stroke();
    ctx.scale(scaleX, 1);
    if (scaleX < 0.2) {
      ctx.strokeStyle = "rgba(248, 250, 252, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.55);
      ctx.lineTo(0, h * 0.55);
      ctx.stroke();
    } else {
      drawCardPickupMiniFace(ctx, face, w, h);
    }
    const lifeSpan = Math.max(1e-3, (pickup.expiresAt ?? elapsed) - (pickup.bornAt ?? elapsed - 1));
    const rem = Math.max(0, (pickup.expiresAt ?? elapsed) - elapsed);
    const frac = Math.max(0, Math.min(1, rem / lifeSpan));
    const barW = 26;
    const barH = 4;
    ctx.restore();
    const stableBarY = cy + h * 0.6 + 7;
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.fillRect(cx - barW / 2, stableBarY, barW, barH);
    ctx.fillStyle = frac > 0.35 ? "rgba(191, 219, 254, 0.95)" : "rgba(251, 146, 60, 0.95)";
    ctx.fillRect(cx - barW / 2, stableBarY, barW * frac, barH);
    ctx.strokeStyle = "rgba(248, 250, 252, 0.72)";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - barW / 2, stableBarY, barW, barH);
  }

  // src/escape/fx/valiantDraw.js
  function clamp9(x, a, b) {
    return Math.max(a, Math.min(b, x));
  }
  function drawValiantShockFields(ctx, boxes, elapsed) {
    for (const box of boxes) {
      if (elapsed >= box.expiresAt) continue;
      const { x, y, w, h } = box;
      const cs = Math.min(28, w * 0.11, h * 0.11);
      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
      ctx.fillRect(x, y, cs, cs);
      ctx.fillRect(x + w - cs, y, cs, cs);
      ctx.fillRect(x + w - cs, y + h - cs, cs, cs);
      ctx.fillRect(x, y + h - cs, cs, cs);
      const inset = cs * 0.32;
      const ix = x + inset;
      const iy = y + inset;
      const iw = w - inset * 2;
      const ih = h - inset * 2;
      const flicker = 0.55 + 0.45 * Math.sin(elapsed * 19 + x * 0.015);
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.52 * flicker})`;
      ctx.lineWidth = 3.2;
      ctx.shadowColor = "rgba(56, 189, 248, 0.65)";
      ctx.shadowBlur = 16;
      ctx.setLineDash([8, 5]);
      ctx.lineDashOffset = -elapsed * 52;
      ctx.strokeRect(ix, iy, iw, ih);
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(147, 197, 253, ${0.45 + 0.4 * Math.sin(elapsed * 24 + y * 0.018)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const jx = 0.18 + 0.08 * Math.sin(elapsed * 31);
      ctx.moveTo(ix + iw * jx, iy);
      ctx.lineTo(ix + iw * jx, iy + ih);
      ctx.moveTo(ix + iw * (1 - jx), iy);
      ctx.lineTo(ix + iw * (1 - jx), iy + ih);
      ctx.moveTo(ix, iy + ih * jx);
      ctx.lineTo(ix + iw, iy + ih * jx);
      ctx.moveTo(ix, iy + ih * (1 - jx));
      ctx.lineTo(ix + iw, iy + ih * (1 - jx));
      ctx.stroke();
      ctx.strokeStyle = `rgba(253, 224, 71, ${0.22 + 0.18 * flicker})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      ctx.restore();
    }
  }
  function drawValiantBunnies(ctx, bunnies, elapsed) {
    for (const bn of bunnies) {
      if (elapsed >= bn.expiresAt) continue;
      const { x, y, r } = bn;
      const pulse = 0.92 + 0.08 * Math.sin(elapsed * 9 + x * 0.02);
      const rp = r * pulse;
      ctx.save();
      ctx.fillStyle = "#fecdd3";
      ctx.beginPath();
      ctx.ellipse(x, y + rp * 0.08, rp * 0.82, rp * 0.68, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.ellipse(x - rp * 0.55, y - rp * 0.42, rp * 0.28, rp * 0.5, -0.4, 0, TAU);
      ctx.ellipse(x + rp * 0.55, y - rp * 0.42, rp * 0.28, rp * 0.5, 0.4, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(157, 23, 77, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y + rp * 0.08, rp * 0.82, rp * 0.68, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }
  function drawValiantRabbitOrbiters(ctx, world, player, elapsed, bodyAlpha = 1) {
    void elapsed;
    ctx.save();
    ctx.globalAlpha = clamp9(bodyAlpha, 0, 1);
    const slots = world.getRabbitSlots();
    const br = 5.5;
    for (let slot = 0; slot < 3; slot++) {
      const rb = slots[slot];
      if (!rb || rb.hp <= 0) continue;
      const { x: bx, y: by } = world.rabbitAnchorWorld(slot, player);
      ctx.fillStyle = "#fecdd3";
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(157, 23, 77, 0.8)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      const earR = br * 0.28;
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.ellipse(bx - br * 0.55, by - br * 0.42, earR, earR * 1.2, -0.4, 0, TAU);
      ctx.ellipse(bx + br * 0.55, by - br * 0.42, earR, earR * 1.2, 0.4, 0, TAU);
      ctx.fill();
      const ratio = rb.maxHp > 0 ? rb.hp / rb.maxHp : 0;
      ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
      ctx.fillRect(bx - br, by + br + 2, br * 2, 2.5);
      ctx.fillStyle = ratio > 0.45 ? "#4ade80" : "#f87171";
      ctx.fillRect(bx - br, by + br + 2, br * 2 * ratio, 2.5);
      const hpLabel = `${Math.round(rb.hp)}/${Math.round(rb.maxHp)}`;
      ctx.font = "bold 9px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(15, 23, 42, 0.92)";
      ctx.strokeText(hpLabel, bx, by + br + 5);
      ctx.fillStyle = "#f8fafc";
      ctx.fillText(hpLabel, bx, by + br + 5);
    }
    ctx.restore();
  }
  function drawValiantRabbitFx(ctx, world, elapsed) {
    for (const fx of world.getRabbitFx()) {
      const u = clamp9((elapsed - fx.bornAt) / Math.max(1e-3, fx.expiresAt - fx.bornAt), 0, 1);
      if (fx.kind === "rabbitDeath") {
        const { x, y, angles } = fx;
        const fade = (1 - u) * (1 - u);
        const splurt = Math.sin(u * Math.PI);
        ctx.save();
        ctx.globalAlpha = 0.9 * fade;
        for (let i = 0; i < (angles?.length ?? 0); i++) {
          const ang = angles[i];
          const len = 7 + splurt * (24 + i % 4 * 5);
          ctx.strokeStyle = i % 2 === 0 ? "rgba(185, 28, 28, 0.95)" : "rgba(127, 29, 29, 0.88)";
          ctx.lineWidth = 1.8 + i % 3 * 0.45;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
          ctx.stroke();
        }
        ctx.globalAlpha = 0.45 * (1 - u);
        ctx.fillStyle = "rgba(153, 27, 27, 0.9)";
        ctx.beginPath();
        ctx.ellipse(x, y + 3, 11 * (0.45 + u * 0.55), 5 * (0.4 + u * 0.35), 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      } else if (fx.kind === "rescue" || fx.kind === "bunnySaved") {
        const { x, y } = fx;
        const riseEnd = 0.42;
        if (u < riseEnd) {
          const u1 = u / riseEnd;
          ctx.save();
          const beamH = 22 + u1 * 118;
          const grad = ctx.createLinearGradient(x, y + 24, x, y - beamH);
          grad.addColorStop(0, "rgba(254, 243, 199, 0)");
          grad.addColorStop(0.28, "rgba(253, 224, 71, 0.28)");
          grad.addColorStop(0.62, "rgba(255, 255, 255, 0.5)");
          grad.addColorStop(1, "rgba(255, 255, 255, 0.12)");
          ctx.fillStyle = grad;
          const wv = 11 + u1 * 16;
          ctx.beginPath();
          ctx.moveTo(x - wv * 0.5, y + 24);
          ctx.lineTo(x + wv * 0.5, y + 24);
          ctx.lineTo(x + wv * 0.2, y - beamH);
          ctx.lineTo(x - wv * 0.2, y - beamH);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = `rgba(254, 252, 232, ${0.32 * (1 - u1 * 0.25)})`;
          ctx.fillRect(x - 3.5, y - beamH * u1, 7, beamH * u1 + 22);
          const ry = y - 10 - 36 * u1;
          const br = 5.5;
          ctx.fillStyle = "#fecdd3";
          ctx.beginPath();
          ctx.arc(x, ry, br, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "rgba(157, 23, 77, 0.78)";
          ctx.lineWidth = 1.15;
          ctx.stroke();
          ctx.restore();
        } else {
          const u2 = (u - riseEnd) / (1 - riseEnd);
          const ease = u2 * u2;
          const br = 5.5 * (1 - ease * 0.88);
          const rx = x + 78 * ease * ease + Math.sin(u2 * Math.PI * 2.5) * 5;
          const ry = y - 46 - 128 * ease - 18 * Math.sin(u2 * Math.PI);
          const fade = 1 - ease;
          ctx.save();
          ctx.globalAlpha = 0.4 * fade;
          ctx.strokeStyle = "rgba(253, 230, 138, 0.95)";
          ctx.lineWidth = 2;
          for (let k = 0; k < 5; k++) {
            const lag = k * 0.07;
            const lk = clamp9(u2 - lag, 0, 1);
            const sx = x + 62 * lk * lk;
            const sy = y - 46 - 102 * lk * lk;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(sx, sy);
            ctx.stroke();
          }
          ctx.globalAlpha = fade;
          ctx.fillStyle = "#fecdd3";
          ctx.beginPath();
          ctx.arc(rx, ry, Math.max(1.5, br), 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }
  function drawValiantWillTextAbovePlayer(ctx, player, will01, extraHudYOffset = 0) {
    const px = player.x;
    const py = player.y;
    const pr = player.r;
    const wPct = Math.round(will01 * 100);
    const yMain = py - pr - 10 - extraHudYOffset;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.font = 'bold 14px ui-sans-serif, system-ui, "Segoe UI", sans-serif';
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(2, 6, 23, 0.82)";
    ctx.strokeText(`Will ${wPct}%`, px, yMain);
    ctx.fillStyle = will01 <= 0.22 ? "#fca5a5" : "#e0e7ff";
    ctx.fillText(`Will ${wPct}%`, px, yMain);
    ctx.restore();
  }
  function drawValiantScreenHud(ctx, p) {
    const { will01, occupiedRabbitCount, netWillPerSec, rabbitSlots } = p;
    const x = 14;
    const y = 114;
    const w = 160;
    const h = 10;
    const occ = occupiedRabbitCount;
    const empty = 3 - occ;
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(51, 65, 85, 0.9)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = will01 > 0.22 ? "#a5b4fc" : "#fb7185";
    ctx.fillRect(x, y, w * clamp9(will01, 0, 1), h);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
    ctx.font = "15px Arial";
    ctx.fillStyle = "#e0e7ff";
    ctx.fillText(`Will ${(will01 * 100).toFixed(0)}%`, x, y + 14);
    ctx.font = "12px Arial";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(
      `Rabbits: ${occ}/3 (${empty} empty) \u2014 ${netWillPerSec >= 0 ? "+" : ""}${netWillPerSec.toFixed(3)} Will/s`,
      x,
      y + 30
    );
    const pipY = y - 10;
    const pipSpacing = 18;
    for (let i = 0; i < 3; i++) {
      const slot = rabbitSlots[i];
      const filled = slot && slot.hp > 0;
      const cx = x + 8 + i * pipSpacing;
      ctx.beginPath();
      ctx.arc(cx, pipY + 4, 5, 0, TAU);
      if (filled) {
        const t = slot.maxHp > 0 ? slot.hp / slot.maxHp : 0;
        ctx.fillStyle = t < 0.35 ? "#fca5a5" : "#fecdd3";
        ctx.fill();
        ctx.strokeStyle = "rgba(157, 23, 77, 0.85)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = "#fb7185";
        const er = 2.1;
        ctx.beginPath();
        ctx.ellipse(cx - 2.8, pipY + 1.5, er, er * 1.1, -0.35, 0, TAU);
        ctx.ellipse(cx + 2.8, pipY + 1.5, er, er * 1.1, 0.35, 0, TAU);
        ctx.fill();
      } else {
        ctx.strokeStyle = "rgba(148, 163, 184, 0.55)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  function drawValiantFloatPopups(ctx, popups, elapsed) {
    if (!popups?.length) return;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const p of popups) {
      if (elapsed >= p.expiresAt) continue;
      const dur = p.expiresAt - p.bornAt;
      const t = dur > 0 ? clamp9((elapsed - p.bornAt) / dur, 0, 1) : 1;
      const y = p.y - t * 20;
      ctx.globalAlpha = 1 - t;
      const fs = p.fontPx ?? 13;
      ctx.font = `bold ${fs}px Arial`;
      ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = p.color ?? "#86efac";
      ctx.fillText(p.text, p.x, y);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    ctx.restore();
  }

  // src/escape/collectibles/placement.js
  function circleRectOverlap(cx, cy, cr, rect) {
    const px = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const py = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - px;
    const dy = cy - py;
    return dx * dx + dy * dy < cr * cr;
  }
  function circleHitsAnyObstacle(cx, cy, r, obstacles) {
    for (const o of obstacles) {
      if (circleRectOverlap(cx, cy, r, o)) return true;
    }
    return false;
  }
  function separatedFromCollectibles(x, y, r, collectibles, minGap = 68) {
    for (const c of collectibles) {
      if (Math.hypot(c.x - x, c.y - y) < c.r + r + minGap) return false;
    }
    return true;
  }
  function spawnLootPointClear(x, y, r, player, obstacles, collectibles, worldToHex, isLootForbiddenHex) {
    if (isLootForbiddenHex && worldToHex) {
      const h = worldToHex(x, y);
      if (isLootForbiddenHex(h.q, h.r)) return false;
    }
    if (circleHitsAnyObstacle(x, y, r, obstacles)) return false;
    if (!separatedFromCollectibles(x, y, r, collectibles)) return false;
    const rr = r + player.r + 44;
    const dx = x - player.x;
    const dy = y - player.y;
    if (dx * dx + dy * dy <= rr * rr) return false;
    return true;
  }
  function randomOpenLootPoint(opts) {
    const {
      player,
      obstacles,
      collectibles,
      activeHexes,
      hexToWorld,
      worldToHex,
      tileW,
      canvasW,
      canvasH,
      hitR,
      attempts = 96,
      isLootForbiddenHex
    } = opts;
    const dMin = 96 + hitR;
    const dMax = Math.min(canvasW, canvasH) * 0.66;
    const baseHexes = activeHexes.length ? activeHexes : [{ q: 0, r: 0 }];
    const sourceHexes = isLootForbiddenHex ? baseHexes.filter((h) => !isLootForbiddenHex(h.q, h.r)) : baseHexes;
    for (let i = 0; i < attempts; i++) {
      let candidate;
      const useHexJitter = i % 2 === 1 && sourceHexes.length > 0;
      if (!useHexJitter) {
        const ang = Math.random() * TAU;
        const d = randRange(dMin, dMax);
        candidate = { x: player.x + Math.cos(ang) * d, y: player.y + Math.sin(ang) * d, r: hitR };
      } else {
        const h = sourceHexes[Math.floor(Math.random() * sourceHexes.length)];
        const c = hexToWorld(h.q, h.r);
        candidate = {
          x: c.x + randRange(-tileW * 0.46, tileW * 0.46),
          y: c.y + randRange(-tileW * 0.46, tileW * 0.46),
          r: hitR
        };
      }
      if (spawnLootPointClear(candidate.x, candidate.y, candidate.r, player, obstacles, collectibles, worldToHex, isLootForbiddenHex)) {
        return candidate;
      }
    }
    for (let j = 0; j < 40; j++) {
      const ang = Math.random() * TAU;
      const d = randRange(dMin, dMax * 0.92);
      const candidate = { x: player.x + Math.cos(ang) * d, y: player.y + Math.sin(ang) * d, r: hitR };
      if (spawnLootPointClear(candidate.x, candidate.y, candidate.r, player, obstacles, collectibles, worldToHex, isLootForbiddenHex)) {
        return candidate;
      }
    }
    for (let k = 0; k < 24; k++) {
      const candidate = { x: player.x + randRange(-280, 280), y: player.y + randRange(-280, 280), r: hitR };
      if (spawnLootPointClear(candidate.x, candidate.y, candidate.r, player, obstacles, collectibles, worldToHex, isLootForbiddenHex)) {
        return candidate;
      }
    }
    for (let f = 0; f < 32; f++) {
      const p = { x: player.x + randRange(-140, 140), y: player.y + randRange(-140, 140), r: hitR };
      if (spawnLootPointClear(p.x, p.y, p.r, player, obstacles, collectibles, worldToHex, isLootForbiddenHex)) return p;
    }
    for (let z = 0; z < 24; z++) {
      const p = { x: player.x + randRange(-100, 100), y: player.y + randRange(-100, 100), r: hitR };
      if (spawnLootPointClear(p.x, p.y, p.r, player, obstacles, collectibles, worldToHex, isLootForbiddenHex)) return p;
    }
    return null;
  }

  // src/escape/items/makeRandomCard.js
  function cardRankSpawnWeight(rank) {
    if (rank === 1) return cardRankSpawnWeight(9);
    if (rank >= 2 && rank <= 13) {
      const span = 11;
      const t = (rank - 2) / span;
      return CARD_RANK_SPAWN_WEIGHT_MAX - t * (CARD_RANK_SPAWN_WEIGHT_MAX - CARD_RANK_SPAWN_WEIGHT_MIN);
    }
    return CARD_RANK_SPAWN_WEIGHT_MIN;
  }
  function makeRandomMapCard(reserved, itemRules) {
    const suits = ["diamonds", "hearts", "clubs", "spades"];
    const candidates = [];
    for (const suit2 of suits) {
      for (let rank2 = 1; rank2 <= 13; rank2++) {
        if (reserved.has(deckKey(suit2, rank2))) continue;
        candidates.push({ suit: suit2, rank: rank2, w: cardRankSpawnWeight(rank2) });
      }
    }
    let suit;
    let rank;
    if (!candidates.length) {
      let found = null;
      outer: for (const s of suits) {
        for (let r = 1; r <= 13; r++) {
          if (!reserved.has(deckKey(s, r))) {
            found = { suit: s, rank: r };
            break outer;
          }
        }
      }
      if (!found) {
        suit = "hearts";
        rank = 2;
      } else {
        suit = found.suit;
        rank = found.rank;
      }
    } else {
      let total = 0;
      for (const c of candidates) total += c.w;
      let pick = Math.random() * total;
      let chosen = candidates[candidates.length - 1];
      for (const c of candidates) {
        pick -= c.w;
        if (pick <= 0) {
          chosen = c;
          break;
        }
      }
      suit = chosen.suit;
      rank = chosen.rank;
    }
    return {
      id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      suit,
      rank,
      effect: itemRules.makeCardEffect(suit, rank)
    };
  }

  // src/escape/items/defaultCardEffects.js
  function makeDefaultCardEffect(suit, rank, ctx) {
    const abilityPool = ctx.diamondCooldownAbilityIds?.length ? ctx.diamondCooldownAbilityIds : ["dash", "burst", "decoy"];
    if (rank === 1) {
      const pool = ["shield", "burst", "timelock", "heal"];
      return { kind: "ultimate", ultType: pool[Math.floor(Math.random() * pool.length)] };
    }
    if (suit === "diamonds") {
      const target = abilityPool[Math.floor(Math.random() * abilityPool.length)];
      return { kind: "cooldown", target, value: 0.1 * rank };
    }
    if (suit === "hearts") {
      if (rank >= 11) return { kind: "frontShield", arc: 28 + rank * 4 };
      if (Math.random() < 0.5) return { kind: "maxHp", value: Math.ceil(rank * 0.5) };
      return { kind: "hitResist", cooldown: Math.max(3, 15 - 0.5 * rank) };
    }
    if (suit === "clubs") {
      const picks = ["dodge", "stun", "invisBurst"];
      const pick = picks[Math.floor(Math.random() * picks.length)];
      if (pick === "dodge") return { kind: "dodge", value: (2 + rank) / 100 };
      if (pick === "stun") return { kind: "stun", value: 0.2 * rank };
      return { kind: "invisBurst", value: invisBurstDurationSeconds(rank) };
    }
    if (rank >= 11) return { kind: "dashCharge", value: 1 };
    if (Math.random() < 0.5) return { kind: "speed", value: Math.min(0.18, 0.018 * rank) };
    return { kind: "terrainBoost", value: Math.min(0.36, 0.036 * rank) };
  }
  function invisBurstDurationSeconds(rank) {
    if (rank <= 6) return 0.2;
    return Math.max(0.2, (rank - 4) / 10);
  }
  function describeDefaultCardEffect(card, helpers) {
    const e = card.effect;
    const abilityLabel = helpers.abilityLabel;
    let base;
    if (e.kind === "ultimate") {
      const names = {
        shield: "Orbiting shields",
        burst: "Earthquake",
        timelock: "Timelock",
        heal: "Vitality (temp HP)"
      };
      base = `Ultimate \u2014 ${names[e.ultType] ?? e.ultType}`;
    } else if (e.kind === "cooldown") base = `-${e.value.toFixed(1)}s ${abilityLabel(e.target)} cooldown`;
    else if (e.kind === "cooldownPct") base = `-${Math.round(e.value * 100)}% ${abilityLabel(e.target)} cooldown`;
    else if (e.kind === "maxHp") base = `+${e.value} max HP`;
    else if (e.kind === "hitResist") base = `Block one hit every ${e.cooldown.toFixed(1)}s`;
    else if (e.kind === "frontShield") base = `Front shield arc +${Math.round(e.arc)}deg`;
    else if (e.kind === "dodge") base = `${Math.round(e.value * 1e3) / 10}% dodge while dash is cooling down`;
    else if (e.kind === "stun") base = `Stun nearby enemies ${e.value.toFixed(1)}s on hit`;
    else if (e.kind === "invisBurst") base = `Burst grants ${e.value.toFixed(1)}s invisibility`;
    else if (e.kind === "speed") base = `+${Math.round(e.value * 100)}% passive speed`;
    else if (e.kind === "terrainBoost") base = `+${Math.round(e.value * 100)}% terrain-touch speed boost`;
    else if (e.kind === "dashCharge") base = `+${e.value} dash charge`;
    else base = "Passive effect";
    return base;
  }

  // src/escape/items/knightItemRules.js
  var ABILITY_LABELS = {
    dash: "Dash",
    burst: "Burst",
    decoy: "Decoy",
    random: "Ultimate"
  };
  function createKnightItemRules() {
    const ctx = {
      characterId: "knight",
      diamondCooldownAbilityIds: ["dash", "burst", "decoy"]
    };
    return {
      characterId: "knight",
      makeCardEffect(suit, rank) {
        return makeDefaultCardEffect(suit, rank, ctx);
      },
      describeCardEffect(card) {
        return describeDefaultCardEffect(card, {
          abilityLabel: (id) => ABILITY_LABELS[id] ?? id
        });
      },
      suitSetBonusGoalLabel(suit) {
        if (suit === "hearts") return "continuous health regen";
        if (suit === "diamonds") return "ability empowerment";
        if (suit === "clubs") return "burst: speed + deck stealth (solid terrain)";
        return "after ultimate: world (except you) at 30% speed for 2s";
      },
      suitSetBonusSevenActiveShort(suit) {
        if (suit === "diamonds") return "diamond empowerment active";
        if (suit === "hearts") return "passive HP regeneration";
        if (suit === "clubs") return "burst speed + stealth";
        return "ultimate world slow";
      },
      suitSetBonusTierTwoGoalLabel(suit) {
        if (suit === "hearts") return "death defiance on 30s cooldown (lethal -> 5 HP)";
        if (suit === "diamonds") return "all empowerments active";
        if (suit === "clubs") return "30% smaller hitbox; 1s untargetable after hit";
        if (suit === "spades") return "~2in aura: hostiles slowed ~30%";
        return "";
      },
      suitSetBonusTierTwoActiveShort(suit) {
        if (suit === "hearts") return "death defiance active";
        if (suit === "diamonds") return "max diamond empowerment active";
        if (suit === "clubs") return "smaller hitbox + untargetable";
        if (suit === "spades") return "nearby hostiles slowed in aura";
        return "";
      }
    };
  }

  // src/escape/items/rogueItemRules.js
  var ABILITY_LABELS2 = {
    dash: "Dash",
    burst: "Smoke",
    decoy: "Consume",
    random: "Ultimate"
  };
  var ROGUE_DIAMOND_COOLDOWN_CTX = {
    characterId: "rogue",
    diamondCooldownAbilityIds: ["dash", "burst", "decoy"]
  };
  function rogueDiamondCooldownPctForRank(rank) {
    if (rank <= 2) return 0.05;
    if (rank <= 4) return 0.08;
    if (rank === 5) return 0.1;
    if (rank <= 8) return 0.12;
    if (rank <= 10) return 0.15;
    if (rank === 11) return 0.18;
    if (rank === 12) return 0.22;
    return 0.25;
  }
  function createRogueItemRules() {
    return {
      characterId: "rogue",
      makeCardEffect(suit, rank) {
        if (suit === "diamonds") {
          const abilityPool = ROGUE_DIAMOND_COOLDOWN_CTX.diamondCooldownAbilityIds;
          const target = abilityPool[Math.floor(Math.random() * abilityPool.length)];
          return { kind: "cooldownPct", target, value: rogueDiamondCooldownPctForRank(rank) };
        }
        return makeDefaultCardEffect(suit, rank, ROGUE_DIAMOND_COOLDOWN_CTX);
      },
      describeCardEffect(card) {
        const e = card?.effect;
        if (e?.kind === "invisBurst") {
          const base = `Smoke lingers +${e.value.toFixed(1)}s`;
          if (card?.suit === "joker") return base;
          return `${base} (clubs)`;
        }
        return describeDefaultCardEffect(card, {
          abilityLabel: (id) => ABILITY_LABELS2[id] ?? id
        });
      },
      suitSetBonusGoalLabel(suit) {
        if (suit === "hearts") return "continuous health regen";
        if (suit === "diamonds") return "larger dash & smoke radius";
        if (suit === "clubs") return "phase through terrain in smoke";
        return "stealth refresh on stealth-dash landing";
      },
      suitSetBonusSevenActiveShort(suit) {
        if (suit === "diamonds") return "diamond empowerment active";
        if (suit === "hearts") return "passive HP regeneration";
        if (suit === "clubs") return "phase in smoke";
        return "stealth refresh on dash";
      },
      suitSetBonusTierTwoGoalLabel(suit) {
        if (suit === "hearts") return "death defiance on 30s cooldown (lethal -> 5 HP)";
        if (suit === "diamonds") return "stronger dash, smoke, and consume together";
        if (suit === "clubs") return "30% smaller hitbox; 1s untargetable after hit";
        if (suit === "spades") return "~2in aura: hostiles slowed ~30%";
        return "";
      },
      suitSetBonusTierTwoActiveShort(suit) {
        if (suit === "hearts") return "death defiance active";
        if (suit === "diamonds") return "maximum diamond mobility";
        if (suit === "clubs") return "smaller hitbox + untargetable";
        if (suit === "spades") return "nearby hostiles slowed in aura";
        return "";
      }
    };
  }

  // src/escape/items/lunaticItemRules.js
  var ABILITY_LABELS3 = {
    dash: "Steer L",
    burst: "Sprint",
    decoy: "Steer R",
    random: "Roar"
  };
  var LUNATIC_CTX = {
    characterId: "lunatic",
    diamondCooldownAbilityIds: ["dash", "burst", "decoy"]
  };
  function createLunaticItemRules() {
    return {
      characterId: "lunatic",
      makeCardEffect(suit, rank) {
        return makeDefaultCardEffect(suit, rank, LUNATIC_CTX);
      },
      describeCardEffect(card) {
        return describeDefaultCardEffect(card, {
          abilityLabel: (id) => ABILITY_LABELS3[id] ?? id
        });
      },
      suitSetBonusGoalLabel() {
        return "not used \u2014 no card deck";
      },
      suitSetBonusSevenActiveShort() {
        return "";
      },
      suitSetBonusTierTwoGoalLabel() {
        return "";
      },
      suitSetBonusTierTwoActiveShort() {
        return "";
      }
    };
  }

  // src/escape/items/valiantItemRules.js
  var ABILITY_LABELS4 = {
    dash: "Surge",
    burst: "Shock field",
    decoy: "Rescue",
    random: "Ultimate"
  };
  function createValiantItemRules() {
    const ctx = {
      characterId: "valiant",
      diamondCooldownAbilityIds: ["dash", "burst", "decoy"]
    };
    return {
      characterId: "valiant",
      makeCardEffect(suit, rank) {
        return makeDefaultCardEffect(suit, rank, ctx);
      },
      describeCardEffect(card) {
        return describeDefaultCardEffect(card, {
          abilityLabel: (id) => ABILITY_LABELS4[id] ?? id
        });
      },
      suitSetBonusGoalLabel(suit) {
        if (suit === "hearts") return "regen ticks heal injured rabbits at random";
        if (suit === "diamonds") return "Surge / shock field / Rescue empowerment";
        if (suit === "clubs") return "phase through terrain during Surge (Q)";
        return "+1 shock-field charge (J/Q/K); ultimate still slows the world";
      },
      suitSetBonusSevenActiveShort(suit) {
        if (suit === "diamonds") return "diamond empowerment active";
        if (suit === "hearts") return "hearts regen heals rabbits";
        if (suit === "clubs") return "phase-through during Surge";
        return "+1 shock charge; ultimate world slow";
      },
      suitSetBonusTierTwoGoalLabel(suit) {
        if (suit === "hearts") return "death defiance on 30s cooldown (lethal -> 5 HP)";
        if (suit === "diamonds") return "all empowerments active";
        if (suit === "clubs") return "30% smaller hitbox; 1s untargetable after hit";
        if (suit === "spades") return "~2in aura: hostiles slowed ~30%";
        return "";
      },
      suitSetBonusTierTwoActiveShort(suit) {
        if (suit === "hearts") return "death defiance active";
        if (suit === "diamonds") return "max diamond empowerment active";
        if (suit === "clubs") return "smaller hitbox + untargetable";
        if (suit === "spades") return "nearby hostiles slowed in aura";
        return "";
      }
    };
  }

  // src/escape/items/bulwarkItemRules.js
  var ABILITY_LABELS5 = {
    dash: "Charge",
    burst: "Parry",
    decoy: "Flag",
    random: "Ultimate"
  };
  function createBulwarkItemRules() {
    const ctx = {
      characterId: "bulwark",
      diamondCooldownAbilityIds: ["dash", "burst", "decoy"]
    };
    return {
      characterId: "bulwark",
      makeCardEffect(suit, rank) {
        return makeDefaultCardEffect(suit, rank, ctx);
      },
      describeCardEffect(card) {
        return describeDefaultCardEffect(card, {
          abilityLabel: (id) => ABILITY_LABELS5[id] ?? id
        });
      },
      suitSetBonusGoalLabel(suit) {
        if (suit === "hearts") return "continuous health regen";
        if (suit === "diamonds") return "ability empowerment";
        if (suit === "clubs") return "burst phases through terrain";
        return "after ultimate: world (except you) at 30% speed for 2s";
      },
      suitSetBonusSevenActiveShort(suit) {
        if (suit === "diamonds") return "diamond empowerment active";
        if (suit === "hearts") return "passive HP regeneration";
        if (suit === "clubs") return "phase-through active";
        return "ultimate world slow";
      },
      suitSetBonusTierTwoGoalLabel(suit) {
        if (suit === "hearts") return "death defiance on 30s cooldown (lethal -> 5 HP)";
        if (suit === "diamonds") return "all empowerments active";
        if (suit === "clubs") return "30% smaller hitbox; 1s untargetable after hit";
        if (suit === "spades") return "~2in aura: hostiles slowed ~30%";
        return "";
      },
      suitSetBonusTierTwoActiveShort(suit) {
        if (suit === "hearts") return "death defiance active";
        if (suit === "diamonds") return "max diamond empowerment active";
        if (suit === "clubs") return "smaller hitbox + untargetable";
        if (suit === "spades") return "nearby hostiles slowed in aura";
        return "";
      }
    };
  }

  // src/escape/items/itemRulesRegistry.js
  function getItemRulesForCharacter(characterId) {
    switch (characterId) {
      case "knight":
        return createKnightItemRules();
      case "rogue":
        return createRogueItemRules();
      case "lunatic":
        return createLunaticItemRules();
      case "valiant":
        return createValiantItemRules();
      case "bulwark":
        return createBulwarkItemRules();
      default:
        return createKnightItemRules();
    }
  }

  // src/escape/items/cardPickupModal.js
  function rankDeckIsCompletelyEmpty(inventory2) {
    for (let rank = 1; rank <= 13; rank++) if (inventory2.deckByRank[rank]) return false;
    return true;
  }
  function cardModalInventoryDragHintHtml() {
    return `<aside class="card-face-hint" aria-label="How to use inventory"><strong>Using inventory</strong><p><strong>Desktop:</strong> click and hold, then <b>drag</b> a card to a slot and release.<br><strong>Touch:</strong> press and <b>drag</b> a card onto another slot (same as desktop).</p></aside>`;
  }
  function preferTouchPointerDrag() {
    return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  }
  function cardFaceNameHtml(card) {
    const red = card?.suit === "hearts" || card?.suit === "diamonds";
    return `<span class="card-face-name${red ? " card-face-name--red" : ""}">${formatCardName(card)}</span>`;
  }
  function createCardPickupModal(opts) {
    const {
      cardModal,
      cardModalFace,
      modalDeckStripEl,
      cardSwapRow,
      modalSetBonusStatusEl,
      cardCloseButton,
      inventory: inventory2,
      getItemRules,
      syncDeckSlots,
      onPausedChange = (
        /** @param {boolean} _ */
        () => {
        }
      ),
      onDiamondEmpowerPicked = () => {
      }
    } = opts;
    let inventoryModalOpen = false;
    let cardPickupFlowActive = false;
    let pendingCard = null;
    let setBonusChoicePendingSuit = null;
    let pickupTargetRank = null;
    let dragIntentRank = null;
    let tapSwapSourceZoneId = null;
    let touchDragSession = null;
    function clearDropZoneHoverHighlights() {
      if (!cardSwapRow) return;
      for (const el of cardSwapRow.querySelectorAll(".drop-zone.over")) el.classList.remove("over");
    }
    function dropZoneFromClientPoint(clientX, clientY) {
      const stack = typeof document.elementsFromPoint === "function" ? document.elementsFromPoint(clientX, clientY) : [document.elementFromPoint(clientX, clientY)];
      for (const node of stack) {
        if (!(node instanceof Element)) continue;
        const z = node.closest("[data-zone-id].drop-zone");
        if (z && cardSwapRow?.contains(z)) return z;
      }
      return null;
    }
    function endTouchDragSession() {
      if (!touchDragSession) return;
      window.removeEventListener("pointermove", touchDragSession.onMove);
      window.removeEventListener("pointerup", touchDragSession.onUp);
      window.removeEventListener("pointercancel", touchDragSession.onUp);
      if (cardModal && "releasePointerCapture" in cardModal) {
        try {
          cardModal.releasePointerCapture(touchDragSession.pointerId);
        } catch {
        }
      }
      touchDragSession = null;
      clearDropZoneHoverHighlights();
    }
    function effectivePickupRank() {
      if (pendingCard?.rank != null) return pendingCard.rank;
      if (dragIntentRank != null) return dragIntentRank;
      return pickupTargetRank;
    }
    function parseDeckZoneId(zoneId) {
      const m = /^deck-(\d+)$/.exec(zoneId);
      if (!m) return null;
      const r = Number(m[1]);
      return r >= 1 && r <= 13 ? r : null;
    }
    function parseBpZoneId(zoneId) {
      const m = /^bp-(\d+)$/.exec(zoneId);
      if (!m) return null;
      const i = Number(m[1]);
      return i >= 0 && i < 3 ? i : null;
    }
    function getCardByZone(zoneId) {
      if (zoneId === "pickup") return pendingCard;
      const dr = parseDeckZoneId(zoneId);
      if (dr != null) return inventory2.deckByRank[dr] || null;
      const bi = parseBpZoneId(zoneId);
      if (bi != null) return inventory2.backpackSlots[bi] || null;
      return null;
    }
    function setCardByZone(zoneId, card) {
      if (zoneId === "pickup") pendingCard = card;
      else {
        const dr = parseDeckZoneId(zoneId);
        if (dr != null) inventory2.deckByRank[dr] = card || null;
        else {
          const bi = parseBpZoneId(zoneId);
          if (bi != null) inventory2.backpackSlots[bi] = card || null;
        }
      }
    }
    function syncPickupTargetRankAfterSwap(fromZoneId, toZoneId, fromCardBefore, toCardBefore) {
      if (!cardPickupFlowActive) return;
      if (pendingCard) {
        pickupTargetRank = pendingCard.rank;
        return;
      }
      if (fromZoneId === "pickup") {
        const dTo = parseDeckZoneId(toZoneId);
        if (dTo != null) {
          pickupTargetRank = dTo;
          return;
        }
        const bTo = parseBpZoneId(toZoneId);
        if (bTo != null && !toCardBefore && fromCardBefore) {
          pickupTargetRank = fromCardBefore.rank;
          return;
        }
      }
      const bFrom = parseBpZoneId(fromZoneId);
      if (bFrom != null && fromCardBefore) {
        pickupTargetRank = fromCardBefore.rank;
        return;
      }
      const dFrom = parseDeckZoneId(fromZoneId);
      if (dFrom != null && fromCardBefore) {
        pickupTargetRank = fromCardBefore.rank;
        return;
      }
      pickupTargetRank = null;
    }
    function swapCardsBetweenZones(fromZoneId, toZoneId) {
      if (!fromZoneId || !toZoneId || fromZoneId === toZoneId) return;
      const dFrom = parseDeckZoneId(fromZoneId);
      const dTo = parseDeckZoneId(toZoneId);
      const bFrom = parseBpZoneId(fromZoneId);
      const bTo = parseBpZoneId(toZoneId);
      const toPickup = toZoneId === "pickup";
      if (dFrom != null && dTo != null && dFrom !== dTo) return;
      const fromCard = getCardByZone(fromZoneId);
      const toCard = getCardByZone(toZoneId);
      if (!fromCard && !toCard) return;
      const allowStageToEmptyPickup = toPickup && !pendingCard && cardPickupFlowActive && fromCard && (bFrom != null || dFrom != null && fromCard.rank === dFrom && (pickupTargetRank == null || dFrom === pickupTargetRank || dragIntentRank != null && dFrom === dragIntentRank));
      if (toPickup && !pendingCard && !allowStageToEmptyPickup) return;
      if (toPickup && !fromCard) return;
      if (dFrom != null && fromCard && fromCard.rank !== dFrom) return;
      if (dTo != null && fromCard && fromCard.rank !== dTo) return;
      if (dTo != null && toCard && toCard.rank !== dTo) return;
      if (dFrom != null && toPickup && toCard && toCard.rank !== dFrom) return;
      if (dFrom != null && bTo != null && toCard && toCard.rank !== dFrom) return;
      setCardByZone(fromZoneId, toCard || null);
      setCardByZone(toZoneId, fromCard || null);
      syncPickupTargetRankAfterSwap(fromZoneId, toZoneId, fromCard, toCard);
      renderCardModal();
      syncDeckSlots();
    }
    function clearTapSwapSelection() {
      tapSwapSourceZoneId = null;
      if (!cardSwapRow) return;
      const highlighted = cardSwapRow.querySelectorAll(".drop-zone.over");
      for (const el of highlighted) el.classList.remove("over");
    }
    function markTapSwapSelection(zoneId) {
      if (!cardSwapRow) return;
      const zones = cardSwapRow.querySelectorAll("[data-zone-id]");
      for (const zoneEl of zones) {
        if (!(zoneEl instanceof HTMLElement)) continue;
        zoneEl.classList.toggle("over", zoneEl.dataset.zoneId === zoneId);
      }
      tapSwapSourceZoneId = zoneId;
    }
    function wireDropZone(zoneEl, zoneId) {
      zoneEl.dataset.zoneId = zoneId;
      zoneEl.addEventListener("dragover", (event) => {
        event.preventDefault();
        zoneEl.classList.add("over");
      });
      zoneEl.addEventListener("dragleave", () => zoneEl.classList.remove("over"));
      zoneEl.addEventListener("drop", (event) => {
        event.preventDefault();
        zoneEl.classList.remove("over");
        const from = event.dataTransfer?.getData("text/plain");
        if (!from) return;
        swapCardsBetweenZones(from, zoneId);
        clearTapSwapSelection();
      });
      if (!preferTouchPointerDrag()) {
        zoneEl.addEventListener("click", () => {
          if (!tapSwapSourceZoneId) return;
          if (tapSwapSourceZoneId === zoneId) {
            clearTapSwapSelection();
            return;
          }
          const from = tapSwapSourceZoneId;
          clearTapSwapSelection();
          swapCardsBetweenZones(from, zoneId);
        });
      }
    }
    function beginTouchDragFromZone(zoneId, card, pointerId) {
      if (touchDragSession) return;
      clearTapSwapSelection();
      if (cardPickupFlowActive && card?.rank != null) {
        const fromBp = parseBpZoneId(zoneId) != null;
        const fromDeck = parseDeckZoneId(zoneId) != null;
        if (fromBp || fromDeck) {
          dragIntentRank = card.rank;
          refreshRankTargetUiDuringDrag();
        }
      }
      const fromZoneId = zoneId;
      const onMove = (ev) => {
        if (ev.pointerId !== pointerId) return;
        ev.preventDefault();
        clearDropZoneHoverHighlights();
        const drop = dropZoneFromClientPoint(ev.clientX, ev.clientY);
        if (drop) drop.classList.add("over");
      };
      const onUp = (ev) => {
        if (ev.pointerId !== pointerId) return;
        ev.preventDefault();
        const drop = dropZoneFromClientPoint(ev.clientX, ev.clientY);
        const to = drop?.dataset?.zoneId;
        if (to && to !== fromZoneId) {
          swapCardsBetweenZones(fromZoneId, to);
          clearTapSwapSelection();
        } else if (dragIntentRank != null) {
          dragIntentRank = null;
          renderCardModal();
        }
        endTouchDragSession();
      };
      touchDragSession = { pointerId, onMove, onUp };
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      if (cardModal && "setPointerCapture" in cardModal) {
        try {
          cardModal.setPointerCapture(pointerId);
        } catch {
        }
      }
    }
    function appendCardToZone(zoneEl, zoneId, card, compact, itemRules) {
      const suitsAll = countSuitsAcrossAllStowed(inventory2, pendingCard);
      const usePointerDrag = preferTouchPointerDrag();
      if (card) {
        const cardEl = document.createElement("div");
        cardEl.className = "zone-card";
        cardEl.draggable = !usePointerDrag;
        const glow = suitInventoryGlowClass(card, suitsAll);
        if (glow) cardEl.classList.add(glow);
        cardEl.textContent = compact ? formatCardName(card) : `${cardRankText(card.rank)}${formatCardHudSuitGlyph(card)} \u2014 ${itemRules.describeCardEffect(card)}`;
        cardEl.addEventListener("dragstart", (event) => {
          if (usePointerDrag) {
            event.preventDefault();
            return;
          }
          event.dataTransfer?.setData("text/plain", zoneId);
          if (cardPickupFlowActive && card?.rank != null) {
            const fromBp = parseBpZoneId(zoneId) != null;
            const fromDeck = parseDeckZoneId(zoneId) != null;
            if (fromBp || fromDeck) {
              dragIntentRank = card.rank;
              refreshRankTargetUiDuringDrag();
            }
          }
        });
        cardEl.addEventListener("dragend", () => {
          if (dragIntentRank != null) {
            dragIntentRank = null;
            renderCardModal();
          }
        });
        if (usePointerDrag) {
          cardEl.addEventListener("pointerdown", (event) => {
            if (event.button !== 0) return;
            if (touchDragSession) return;
            event.preventDefault();
            beginTouchDragFromZone(zoneId, card, event.pointerId);
          });
        } else {
          cardEl.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (tapSwapSourceZoneId === zoneId) {
              clearTapSwapSelection();
              return;
            }
            markTapSwapSelection(zoneId);
          });
        }
        zoneEl.appendChild(cardEl);
      } else {
        const emptyEl = document.createElement("div");
        emptyEl.className = "zone-empty";
        emptyEl.textContent = "Empty";
        zoneEl.appendChild(emptyEl);
      }
    }
    function appendModalDeckDisplayCell(parent, rank, card, extraClass = "") {
      const cell = document.createElement("div");
      cell.className = ["modal-deck-cell", extraClass].filter(Boolean).join(" ");
      for (const c of CARD_SET_GLOW_CLASSES) cell.classList.remove(c);
      const rankLabelText = card ? cardRankText(card.rank) : cardRankText(rank);
      cell.innerHTML = `<div class="modal-deck-cell-label">${rankLabelText}</div>`;
      const suitsAll = countSuitsAcrossAllStowed(inventory2, pendingCard);
      if (card) {
        const glow = suitInventoryGlowClass(card, suitsAll);
        if (glow) cell.classList.add(glow);
        const t = document.createElement("div");
        t.className = "modal-deck-cell-card";
        t.textContent = formatCardHudSuitGlyph(card);
        cell.appendChild(t);
      } else {
        const e = document.createElement("div");
        e.className = "modal-deck-cell-empty";
        e.textContent = "\u2014";
        cell.appendChild(e);
      }
      parent.appendChild(cell);
    }
    function appendModalBackpackDisplayCell(parent, packIndex, card) {
      const cell = document.createElement("div");
      cell.className = "modal-deck-cell modal-deck-cell--bp";
      for (const c of CARD_SET_GLOW_CLASSES) cell.classList.remove(c);
      const bpLabel = card ? cardRankText(card.rank) : `Pack ${packIndex + 1}`;
      cell.innerHTML = `<div class="modal-deck-cell-label">${bpLabel}</div>`;
      const suitsAll = countSuitsAcrossAllStowed(inventory2, pendingCard);
      if (card) {
        const glow = suitInventoryGlowClass(card, suitsAll);
        if (glow) cell.classList.add(glow);
        const t = document.createElement("div");
        t.className = "modal-deck-cell-card";
        t.textContent = formatCardHudSuitGlyph(card);
        cell.appendChild(t);
      } else {
        const e = document.createElement("div");
        e.className = "modal-deck-cell-empty";
        e.textContent = "\u2014";
        cell.appendChild(e);
      }
      parent.appendChild(cell);
    }
    function refreshRankTargetUiDuringDrag() {
      const itemRules = getItemRules();
      if (!cardPickupFlowActive || !cardModalFace || !cardSwapRow) return;
      const r = effectivePickupRank();
      if (r == null) return;
      renderPickupFlowFaceHtml(itemRules, r);
      const pickupEl = cardSwapRow.querySelector('[data-zone-id="pickup"]');
      if (!pickupEl) return;
      const newDeckId = `deck-${r}`;
      const oldDeck = cardSwapRow.querySelector('[data-zone-id^="deck-"]');
      if (oldDeck?.dataset.zoneId === newDeckId) return;
      oldDeck?.remove();
      const zoneEl = document.createElement("div");
      zoneEl.className = "drop-zone drop-zone--swap drop-zone--main-slot";
      zoneEl.innerHTML = `<div class="zone-label">Card slot: ${cardRankText(r)}</div>`;
      wireDropZone(zoneEl, newDeckId);
      appendCardToZone(zoneEl, newDeckId, inventory2.deckByRank[r] || null, false, itemRules);
      pickupEl.insertAdjacentElement("afterend", zoneEl);
    }
    function renderPickupFlowFaceHtml(itemRules, r) {
      const showCard = pendingCard || inventory2.deckByRank[r] || null;
      const showFirstCardHint = rankDeckIsCompletelyEmpty(inventory2);
      if (showCard) {
        cardModalFace.classList.remove("compact");
        if (showFirstCardHint) {
          cardModalFace.innerHTML = `<div class="card-face-layout"><div class="card-face-primary"><div class="big">${cardFaceNameHtml(showCard)}</div><div class="desc">${itemRules.describeCardEffect(showCard)}</div></div>${cardModalInventoryDragHintHtml()}</div>`;
        } else {
          cardModalFace.innerHTML = `<div class="big">${cardFaceNameHtml(showCard)}</div><div class="desc">${itemRules.describeCardEffect(showCard)}</div>`;
        }
      } else if (showFirstCardHint) {
        cardModalFace.classList.remove("compact");
        cardModalFace.innerHTML = `<div class="card-face-layout"><div class="card-face-primary"><div class="desc">Rank <strong>${cardRankText(r)}</strong> \u2014 empty. Use <strong>New pickup</strong> or a backpack slot below, or <strong>Leave</strong>.</div></div>${cardModalInventoryDragHintHtml()}</div>`;
      } else {
        cardModalFace.classList.add("compact");
        cardModalFace.innerHTML = `<div class="desc">Rank <strong>${cardRankText(r)}</strong> \u2014 empty. Use <strong>New pickup</strong> or a backpack slot below, or <strong>Leave</strong>.</div>`;
      }
    }
    function renderCardModal() {
      endTouchDragSession();
      const itemRules = getItemRules();
      if (!cardModal || !cardModalFace || !cardSwapRow) return;
      dragIntentRank = null;
      tapSwapSourceZoneId = null;
      if (modalDeckStripEl) modalDeckStripEl.innerHTML = "";
      if (!inventoryModalOpen) {
        cardModal.classList.remove("open");
        if (modalSetBonusStatusEl) modalSetBonusStatusEl.textContent = "";
        cardSwapRow.innerHTML = "";
        cardModalFace.innerHTML = "";
        syncDeckSlots();
        return;
      }
      cardModal.classList.add("open");
      if (modalDeckStripEl) {
        const labelRow = document.createElement("div");
        labelRow.className = "player-deck-label-row";
        labelRow.innerHTML = '<span class="deck-slots-label">Deck (one card per rank)</span><span class="deck-slots-label deck-slots-label--sub">Backpack (3)</span>';
        modalDeckStripEl.appendChild(labelRow);
        const wings = document.createElement("div");
        wings.className = "modal-deck-wings-grid";
        wings.setAttribute("aria-label", "Read-only deck and backpack preview");
        const aceWing = document.createElement("div");
        aceWing.className = "modal-deck-ace-wing";
        appendModalDeckDisplayCell(aceWing, 1, inventory2.deckByRank[1] || null, "modal-deck-cell--ace");
        const mid = document.createElement("div");
        mid.className = "modal-deck-middle-twelve";
        for (let r = 2; r <= 13; r++) appendModalDeckDisplayCell(mid, r, inventory2.deckByRank[r] || null);
        const bpWing = document.createElement("div");
        bpWing.className = "modal-deck-backpack-wing";
        for (let i = 0; i < 3; i++) appendModalBackpackDisplayCell(bpWing, i, inventory2.backpackSlots[i] || null);
        wings.appendChild(aceWing);
        wings.appendChild(mid);
        wings.appendChild(bpWing);
        modalDeckStripEl.appendChild(wings);
      }
      if (cardPickupFlowActive) {
        const r = effectivePickupRank();
        if (r != null) {
          renderPickupFlowFaceHtml(itemRules, r);
        } else {
          const showFirstHintNoRank = cardPickupFlowActive && rankDeckIsCompletelyEmpty(inventory2);
          if (showFirstHintNoRank) {
            cardModalFace.classList.remove("compact");
            cardModalFace.innerHTML = `<div class="card-face-layout"><div class="card-face-primary"><div class="desc">Drag a card into <strong>New pickup</strong> from a backpack slot or the rank row above, or <strong>Leave</strong>.</div></div>${cardModalInventoryDragHintHtml()}</div>`;
          } else {
            cardModalFace.classList.add("compact");
            cardModalFace.innerHTML = '<div class="desc">Drag a card into <strong>New pickup</strong> from a backpack slot or the rank row above, or <strong>Leave</strong>.</div>';
          }
        }
      } else if (pendingCard) {
        const card = pendingCard;
        cardModalFace.classList.remove("compact");
        cardModalFace.innerHTML = `<div class="big">${cardFaceNameHtml(card)}</div><div class="desc">${itemRules.describeCardEffect(card)}</div>`;
      } else {
        cardModalFace.classList.add("compact");
        cardModalFace.innerHTML = '<div class="desc">Drag between rank slots and the three backpack packs. Leave closes without taking a new pickup.</div>';
      }
      cardSwapRow.innerHTML = "";
      const zones = [];
      if (cardPickupFlowActive) {
        zones.push({ id: "pickup", label: "New pickup", card: pendingCard, kind: "pickup" });
        const deckR = effectivePickupRank();
        if (deckR != null) {
          zones.push({
            id: `deck-${deckR}`,
            label: `Card slot: ${cardRankText(deckR)}`,
            card: inventory2.deckByRank[deckR] || null,
            kind: "rank"
          });
        }
      } else if (pendingCard) {
        zones.push({ id: "pickup", label: "New pickup", card: pendingCard, kind: "pickup" });
      }
      for (let i = 0; i < 3; i++) {
        zones.push({ id: `bp-${i}`, label: `Backpack ${i + 1}`, card: inventory2.backpackSlots[i] || null, kind: "bp" });
      }
      for (const zone of zones) {
        const zoneEl = document.createElement("div");
        let zc = "drop-zone drop-zone--swap";
        if (zone.kind === "pickup" || zone.kind === "rank") zc += " drop-zone--main-slot";
        if (zone.kind === "bp") zc += " drop-zone--backpack-sm";
        zoneEl.className = zc;
        zoneEl.innerHTML = `<div class="zone-label">${zone.label}</div>`;
        wireDropZone(zoneEl, zone.id);
        appendCardToZone(zoneEl, zone.id, zone.card, false, itemRules);
        cardSwapRow.appendChild(zoneEl);
      }
      {
        const leaveBtn = document.createElement("button");
        leaveBtn.type = "button";
        leaveBtn.className = "leave-button";
        leaveBtn.textContent = "Leave";
        leaveBtn.addEventListener("click", () => continueAfterLoadout());
        cardSwapRow.appendChild(leaveBtn);
      }
      if (modalSetBonusStatusEl) {
        const progress = getModalSetBonusProgressLines(inventory2, pendingCard, itemRules);
        modalSetBonusStatusEl.textContent = progress.length ? progress.join("\n") : "";
      }
      syncDeckSlots();
    }
    function closeCardModal() {
      const wasOpen = inventoryModalOpen;
      inventoryModalOpen = false;
      pendingCard = null;
      cardPickupFlowActive = false;
      pickupTargetRank = null;
      dragIntentRank = null;
      tapSwapSourceZoneId = null;
      if (wasOpen) onPausedChange(false);
      renderCardModal();
    }
    function continueAfterLoadout() {
      pendingCard = null;
      clearTapSwapSelection();
      closeCardModal();
    }
    function openCardPickup(card) {
      pendingCard = card;
      cardPickupFlowActive = true;
      pickupTargetRank = card.rank;
      inventoryModalOpen = true;
      onPausedChange(true);
      renderCardModal();
    }
    function resetAll() {
      for (let r = 1; r <= 13; r++) inventory2.deckByRank[r] = null;
      for (let i = 0; i < 3; i++) inventory2.backpackSlots[i] = null;
      continueAfterLoadout();
    }
    const onCloseClick = () => {
      if (setBonusChoicePendingSuit === "diamonds" && !inventory2.diamondEmpower) return;
      continueAfterLoadout();
    };
    if (cardCloseButton) cardCloseButton.addEventListener("click", onCloseClick);
    function onGlobalKeydown(e) {
      const needsDiamondChoice = setBonusChoicePendingSuit === "diamonds" && !inventory2.diamondEmpower;
      if (needsDiamondChoice && inventoryModalOpen) {
        const k = String(e.key || "").toLowerCase();
        if (k === "q" || k === "w" || k === "e") {
          e.preventDefault();
          if (k === "q") applyDiamondEmpowerChoice("dash2x");
          else if (k === "w") applyDiamondEmpowerChoice("speedPassive");
          else applyDiamondEmpowerChoice("decoyFortify");
          return;
        }
      }
      if (e.key !== "Escape") return;
      if (!inventoryModalOpen) return;
      if (needsDiamondChoice) return;
      e.preventDefault();
      continueAfterLoadout();
    }
    window.addEventListener("keydown", onGlobalKeydown);
    function applyDiamondEmpowerChoice(id) {
      if (setBonusChoicePendingSuit !== "diamonds") return;
      if (inventory2.diamondEmpower) return;
      inventory2.diamondEmpower = id;
      setBonusChoicePendingSuit = null;
      renderCardModal();
      onDiamondEmpowerPicked();
    }
    return {
      openCardPickup,
      isPaused: () => inventoryModalOpen,
      resetAll,
      renderCardModal,
      /** @returns {object | null} */
      getPendingCard: () => pendingCard,
      openSetBonusChoice(suit) {
        if (suit !== "diamonds") return;
        if (inventory2.diamondEmpower) return;
        if (setBonusChoicePendingSuit === "diamonds" && inventoryModalOpen) return;
        setBonusChoicePendingSuit = "diamonds";
        inventoryModalOpen = true;
        cardPickupFlowActive = false;
        pendingCard = null;
        pickupTargetRank = null;
        dragIntentRank = null;
        onPausedChange(true);
        renderCardModal();
      },
      clearSetBonusChoice(suit = null) {
        if (suit != null && setBonusChoicePendingSuit !== suit) return;
        if (setBonusChoicePendingSuit == null) return;
        const wasDiamonds = setBonusChoicePendingSuit === "diamonds";
        setBonusChoicePendingSuit = null;
        renderCardModal();
        if (wasDiamonds) onDiamondEmpowerPicked();
      },
      applyDiamondEmpowerChoice,
      isDiamondSetBonusChoicePending: () => setBonusChoicePendingSuit === "diamonds" && !inventory2.diamondEmpower,
      dispose() {
        endTouchDragSession();
        if (cardCloseButton) cardCloseButton.removeEventListener("click", onCloseClick);
        window.removeEventListener("keydown", onGlobalKeydown);
      }
    };
  }

  // src/escape/items/deckHudSync.js
  function preferTouchPointerDrag2() {
    return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  }
  function fillDeckSlotEl(el, rank, card, inventory2, pendingCard, itemRules, forgeHudDragSources) {
    if (!el) return;
    const suitsAll = countSuitsAcrossAllStowed(inventory2, pendingCard);
    clearCardGlowClasses(el);
    el.classList.toggle("filled", !!card);
    el.dataset.rank = String(rank);
    if (!card) {
      el.removeAttribute("draggable");
      delete el.dataset.forgeRef;
      el.innerHTML = `<span class="deck-rank-label">${cardRankText(rank)}</span><span class="deck-slot-empty">\u2014</span>`;
      return;
    }
    const glow = suitInventoryGlowClass(card, suitsAll);
    if (glow) el.classList.add(glow);
    const red = card.suit === "hearts" || card.suit === "diamonds";
    el.innerHTML = `<div class="card-slot-headline"><span class="card-slot-rank-suit${red ? " card-slot-rank-suit--red" : ""}">${formatCardName(card)}</span></div><div class="card-slot-copy"><span class="meta">${itemRules.describeCardEffect(card)}</span></div>`;
    if (forgeHudDragSources && card.suit !== "joker") {
      el.draggable = !preferTouchPointerDrag2();
      el.dataset.forgeRef = JSON.stringify({ kind: "deck", rank });
    } else {
      el.removeAttribute("draggable");
      delete el.dataset.forgeRef;
    }
  }
  function syncDeckSlotsFromInventory(deckRankSlotEls, backpackSlotEls, inventory2, pendingCard, itemRules, forgeHudDragSources = false) {
    if (deckRankSlotEls?.length) {
      for (let r = 1; r <= 13; r++) {
        const el = deckRankSlotEls[r - 1];
        fillDeckSlotEl(el, r, inventory2.deckByRank[r] || null, inventory2, pendingCard, itemRules, forgeHudDragSources);
      }
    }
    const suitsAll = countSuitsAcrossAllStowed(inventory2, pendingCard);
    if (backpackSlotEls?.length) {
      for (let i = 0; i < 3; i++) {
        const slot = backpackSlotEls[i];
        if (!slot) continue;
        const card = inventory2.backpackSlots[i] || null;
        clearCardGlowClasses(slot);
        slot.classList.toggle("filled", !!card);
        slot.dataset.bpIdx = String(i);
        if (!card) {
          slot.removeAttribute("draggable");
          delete slot.dataset.forgeRef;
          slot.innerHTML = `Pack ${i + 1}<span class="deck-slot-empty">Empty</span>`;
          continue;
        }
        const glow = suitInventoryGlowClass(card, suitsAll);
        if (glow) slot.classList.add(glow);
        const red = card.suit === "hearts" || card.suit === "diamonds";
        slot.innerHTML = `<div class="card-slot-headline"><span class="card-slot-rank-suit${red ? " card-slot-rank-suit--red" : ""}">${formatCardName(
          card
        )}</span></div><div class="card-slot-copy"><span class="meta">${itemRules.describeCardEffect(card)}</span></div>`;
        if (forgeHudDragSources && card.suit !== "joker") {
          slot.draggable = !preferTouchPointerDrag2();
          slot.dataset.forgeRef = JSON.stringify({ kind: "bp", idx: i });
        } else {
          slot.removeAttribute("draggable");
          delete slot.dataset.forgeRef;
        }
      }
    }
  }

  // src/escape/specials/forgeHexFlow.js
  var SQRT32 = Math.sqrt(3);
  function pointInsidePointyHex(px, py, cx, cy, radius) {
    const dx = Math.abs(px - cx);
    const dy = Math.abs(py - cy);
    if (dx > SQRT32 / 2 * radius) return false;
    return dy <= radius - dx / SQRT32;
  }
  function createForgeHexFlow({ hexKey: hexKey2 }) {
    const OUTER_BARRIER_R = HEX_SIZE;
    const PENALTY_RING_R = HEX_SIZE - 160;
    let phase = 0;
    let lockQ = 0;
    let lockR = 0;
    let wasInHex = false;
    let innerExitLatch = false;
    let forgeComplete = false;
    let wasInsidePenaltyRing = false;
    let preInnerCrossLockActive = false;
    const outerDamageAppliedKeys = /* @__PURE__ */ new Set();
    let screenFlashUntil = 0;
    function resetLeavingHex() {
      phase = 0;
      forgeComplete = false;
      innerExitLatch = false;
      wasInHex = false;
      lockQ = 0;
      lockR = 0;
      wasInsidePenaltyRing = false;
      preInnerCrossLockActive = false;
    }
    function resetSession() {
      resetLeavingHex();
      outerDamageAppliedKeys.clear();
      screenFlashUntil = 0;
    }
    function onForgeSuccess() {
      forgeComplete = true;
      phase = 2;
    }
    function tick(o) {
      if (o.isWorldPaused()) return;
      const player = o.getPlayer();
      const ph = o.worldToHex(player.x, player.y);
      const inHex = o.isForgeHexTile(ph.q, ph.r);
      if (!inHex) {
        resetLeavingHex();
        return;
      }
      const rc = o.hexToWorld(ph.q, ph.r);
      const inInner = Math.hypot(player.x - rc.x, player.y - rc.y) <= ROULETTE_INNER_HIT_R;
      const insidePenaltyRing = pointInsidePointyHex(player.x, player.y, rc.x, rc.y, PENALTY_RING_R + player.r);
      const enteredHexThisFrame = inHex && !wasInHex;
      wasInHex = true;
      if (enteredHexThisFrame && phase === 0 && o.isForgeHexInteractive(ph.q, ph.r)) {
        lockQ = ph.q;
        lockR = ph.r;
        phase = 1;
        preInnerCrossLockActive = true;
        screenFlashUntil = 0;
        wasInsidePenaltyRing = insidePenaltyRing;
      }
      if (phase === 1 && ph.q === lockQ && ph.r === lockR) {
        const rk = hexKey2(ph.q, ph.r);
        const crossedInnerRingInward = insidePenaltyRing && !wasInsidePenaltyRing;
        if (!outerDamageAppliedKeys.has(rk) && crossedInnerRingInward) {
          screenFlashUntil = o.getSimElapsed() + 0.4;
          o.onOuterPenalty();
          outerDamageAppliedKeys.add(rk);
        }
      }
      wasInsidePenaltyRing = insidePenaltyRing;
      if (phase === 1 && ph.q === lockQ && ph.r === lockR && inInner && !forgeComplete && !innerExitLatch) {
        preInnerCrossLockActive = false;
        innerExitLatch = true;
        o.openForgeModal();
      }
      if (!inInner) innerExitLatch = false;
    }
    function onTileCacheEvicted(cacheKey, closeForgeModalIfOpen) {
      if (hexKey2(lockQ, lockR) === cacheKey) {
        closeForgeModalIfOpen();
        resetLeavingHex();
      }
      outerDamageAppliedKeys.delete(cacheKey);
    }
    function drawWorld(ctx, activeHexes, hexToWorld, simElapsed, isForgeHexTile, isForgeHexInteractive, isForgeSpent) {
      for (const h of activeHexes) {
        if (!isForgeHexTile(h.q, h.r)) continue;
        const c = hexToWorld(h.q, h.r);
        const cx = c.x;
        const cy = c.y;
        const k = hexKey2(h.q, h.r);
        const isInteractive = isForgeHexInteractive(h.q, h.r);
        const outerYellow = "rgba(250, 204, 21, 0.96)";
        const innerRing = outerDamageAppliedKeys.has(k) ? "rgba(250, 204, 21, 0.94)" : "rgba(217, 119, 6, 0.94)";
        strokePointyHexOutline(ctx, cx, cy, OUTER_BARRIER_R, outerYellow, 3.4, 18);
        if (isInteractive) strokePointyHexOutline(ctx, cx, cy, PENALTY_RING_R, innerRing, 2.6, 14);
        drawForgeHexCell(ctx, cx, cy, ROULETTE_INNER_HEX_DRAW_R, simElapsed, isForgeSpent(h.q, h.r));
      }
    }
    function isOuterBarrierWorldPoint(px, py, worldToHex, hexToWorld, isForgeHexInteractive) {
      if (phase !== 1 || !preInnerCrossLockActive) return false;
      const h = worldToHex(px, py);
      if (h.q !== lockQ || h.r !== lockR) return false;
      if (!isForgeHexInteractive(h.q, h.r)) return false;
      const c = hexToWorld(h.q, h.r);
      return Math.hypot(px - c.x, py - c.y) <= OUTER_BARRIER_R + 1.5;
    }
    return {
      tick,
      resetSession,
      onTileCacheEvicted,
      onForgeSuccess,
      drawWorld,
      getLock: () => ({ q: lockQ, r: lockR }),
      getScreenFlashUntil: () => screenFlashUntil,
      setScreenFlashUntil(t) {
        screenFlashUntil = t;
      },
      isOuterBarrierWorldPoint
    };
  }

  // src/escape/specials/forgeModal.js
  function preferTouchPointerDrag3() {
    return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  }
  function forgeRefKey(ref) {
    if (!ref) return "";
    return ref.kind === "deck" ? `d:${ref.rank}` : `b:${ref.idx}`;
  }
  function parseForgeRefFromDataset(json) {
    try {
      const o = JSON.parse(json);
      if (o?.kind === "deck" && Number.isInteger(o.rank)) return { kind: "deck", rank: o.rank };
      if (o?.kind === "bp" && Number.isInteger(o.idx)) return { kind: "bp", idx: o.idx };
    } catch {
    }
    return null;
  }
  function clamp10(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }
  function forgeForgedRankFromCards(a, b) {
    if (!a || !b || a.suit === "joker" || b.suit === "joker") return null;
    const ra = a.rank;
    const rb = b.rank;
    if (!Number.isInteger(ra) || !Number.isInteger(rb)) return null;
    return clamp10(ra + rb, 1, 13);
  }
  function forgeOutcomeSuit(a, b) {
    const suits = [];
    if (a?.suit && a.suit !== "joker") suits.push(a.suit);
    if (b?.suit && b.suit !== "joker") suits.push(b.suit);
    if (!suits.length) return "spades";
    return suits[Math.floor(Math.random() * suits.length)];
  }
  function createForgeWorldModal(deps) {
    const {
      doc,
      inventory: inventory2,
      getItemRules,
      syncDeckSlots,
      getOpenCardPickup,
      onPausedChange = () => {
      }
    } = deps;
    const forgeModal = doc.getElementById("forge-modal");
    const forgeModalTitle = doc.getElementById("forge-modal-title");
    const forgeModalSub = doc.getElementById("forge-modal-sub");
    const forgeModalActions = doc.getElementById("forge-modal-actions");
    const forgeSlotLeft = doc.getElementById("forge-slot-left");
    const forgeSlotRight = doc.getElementById("forge-slot-right");
    const forgePreviewValue = doc.getElementById("forge-preview-value");
    const forgeModalHint = doc.getElementById("forge-modal-hint");
    let mode = false;
    let forgeRefA = null;
    let forgeRefB = null;
    let forgePendingSuit = (
      /** @type {string | null} */
      null
    );
    let onCommitSuccess = null;
    let deckPanelRestore = null;
    function isForgePaused() {
      return mode;
    }
    function cardAtForgeRef(ref) {
      if (!ref) return null;
      if (ref.kind === "deck") return inventory2.deckByRank[ref.rank] || null;
      return inventory2.backpackSlots[ref.idx] || null;
    }
    function clearForgeRefSlot(ref) {
      if (!ref) return;
      if (ref.kind === "deck") inventory2.deckByRank[ref.rank] = null;
      else inventory2.backpackSlots[ref.idx] = null;
    }
    let forgeTouchSession = null;
    function clearForgeDropHover() {
      forgeSlotLeft?.classList.remove("forge-drop-slot--hover");
      forgeSlotRight?.classList.remove("forge-drop-slot--hover");
    }
    function forgeDropSlotFromClientPoint(clientX, clientY) {
      const stack = typeof document.elementsFromPoint === "function" ? document.elementsFromPoint(clientX, clientY) : [document.elementFromPoint(clientX, clientY)];
      for (const node of stack) {
        if (!(node instanceof Element)) continue;
        const z = node.closest(".forge-drop-slot[data-slot]");
        if (z && forgeModal?.contains(z)) return z;
      }
      return null;
    }
    function endForgeTouchSession() {
      if (!forgeTouchSession) return;
      window.removeEventListener("pointermove", forgeTouchSession.onMove);
      window.removeEventListener("pointerup", forgeTouchSession.onUp);
      window.removeEventListener("pointercancel", forgeTouchSession.onUp);
      if (forgeModal && "releasePointerCapture" in forgeModal) {
        try {
          forgeModal.releasePointerCapture(forgeTouchSession.pointerId);
        } catch {
        }
      }
      forgeTouchSession = null;
      clearForgeDropHover();
    }
    function closeUi() {
      endForgeTouchSession();
      const had = mode;
      mode = false;
      forgeRefA = null;
      forgeRefB = null;
      forgePendingSuit = null;
      onCommitSuccess = null;
      if (forgeModal) forgeModal.hidden = true;
      restoreDeckPanelIntoPage();
      if (forgeSlotLeft) {
        forgeSlotLeft.innerHTML = "";
        forgeSlotLeft.textContent = "";
        forgeSlotLeft.style.fontSize = "";
        forgeSlotLeft.style.color = "";
      }
      if (forgeSlotRight) {
        forgeSlotRight.innerHTML = "";
        forgeSlotRight.textContent = "";
        forgeSlotRight.style.fontSize = "";
        forgeSlotRight.style.color = "";
      }
      if (forgePreviewValue) forgePreviewValue.textContent = "\u2014";
      if (forgeModalHint) forgeModalHint.textContent = "";
      if (forgeModalActions) forgeModalActions.innerHTML = "";
      if (had) onPausedChange(false);
      syncDeckSlots();
    }
    function mountDeckPanelIntoForgeModal() {
      const panel = doc.getElementById("player-deck-panel");
      const inner = forgeModal?.querySelector(".forge-modal-inner");
      if (!panel || !inner) return;
      if (!deckPanelRestore && panel.parentNode) {
        deckPanelRestore = { parent: panel.parentNode, next: panel.nextSibling };
      }
      const head = inner.querySelector(".roulette-modal-head");
      if (panel.parentNode === inner) return;
      if (head) head.insertAdjacentElement("afterend", panel);
      else inner.prepend(panel);
    }
    function restoreDeckPanelIntoPage() {
      const panel = doc.getElementById("player-deck-panel");
      if (!panel || !deckPanelRestore?.parent) return;
      const { parent, next } = deckPanelRestore;
      if (panel.parentNode === parent) return;
      if (next && next.parentNode === parent) parent.insertBefore(panel, next);
      else parent.appendChild(panel);
    }
    function onGlobalKeydown(e) {
      if (e.key !== "Escape" || !mode) return;
      e.preventDefault();
      closeUi();
    }
    doc.defaultView?.addEventListener("keydown", onGlobalKeydown);
    function renderForgeSlotContents() {
      for (
        const slot of
        /** @type {const} */
        ["left", "right"]
      ) {
        const el = slot === "left" ? forgeSlotLeft : forgeSlotRight;
        if (!el) continue;
        const ref = slot === "left" ? forgeRefA : forgeRefB;
        const card = cardAtForgeRef(ref);
        el.innerHTML = "";
        if (!card) {
          el.textContent = "Drop";
          el.style.fontSize = "12px";
          el.style.color = "rgba(148,163,184,0.75)";
          continue;
        }
        el.textContent = "";
        el.style.fontSize = "";
        el.style.color = "";
        const wrap = doc.createElement("div");
        wrap.className = "forge-slot-card";
        wrap.textContent = formatCardName(card);
        el.appendChild(wrap);
      }
    }
    function assignForgeToSlot(slot, ref) {
      if (!ref || slot !== "left" && slot !== "right") return;
      const k = forgeRefKey(ref);
      if (slot === "left") {
        if (forgeRefKey(forgeRefB) === k) forgeRefB = null;
        forgeRefA = ref;
      } else {
        if (forgeRefKey(forgeRefA) === k) forgeRefA = null;
        forgeRefB = ref;
      }
      syncForgeMergeUi();
    }
    function commitForgeMerge() {
      const ca = cardAtForgeRef(forgeRefA);
      const cb = cardAtForgeRef(forgeRefB);
      const rank = forgeForgedRankFromCards(ca, cb);
      if (!ca || !cb || rank == null) {
        closeUi();
        return;
      }
      const suit = forgePendingSuit || forgeOutcomeSuit(ca, cb);
      const rules = getItemRules();
      const placed = {
        id: `forge-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        suit,
        rank,
        effect: rules.makeCardEffect(suit, rank)
      };
      const dest = !inventory2.deckByRank[rank] ? { kind: "deck", rank } : (() => {
        const i = inventory2.backpackSlots.findIndex((s) => !s);
        return i >= 0 ? { kind: "bp", idx: i } : null;
      })();
      if (!dest) {
        if (forgeModalHint) {
          forgeModalHint.textContent = "That forged rank\u2019s deck slot is occupied and your backpack is full. Make room, then try again.";
        }
        return;
      }
      clearForgeRefSlot(forgeRefA);
      clearForgeRefSlot(forgeRefB);
      syncDeckSlots();
      onCommitSuccess?.();
      closeUi();
      const pickup = getOpenCardPickup();
      if (typeof pickup === "function") pickup(placed);
    }
    function forgeRefreshActionButtons() {
      if (!forgeModalActions) return;
      forgeModalActions.innerHTML = "";
      const ca = cardAtForgeRef(forgeRefA);
      const cb = cardAtForgeRef(forgeRefB);
      const rank = forgeForgedRankFromCards(ca, cb);
      const ready = rank != null;
      const confirm = doc.createElement("button");
      confirm.type = "button";
      confirm.className = "leave-button";
      confirm.textContent = "Confirm forge";
      confirm.disabled = !ready;
      confirm.addEventListener("click", () => {
        const c1 = cardAtForgeRef(forgeRefA);
        const c2 = cardAtForgeRef(forgeRefB);
        if (forgeForgedRankFromCards(c1, c2) == null) return;
        if (!forgePendingSuit) forgePendingSuit = forgeOutcomeSuit(c1, c2);
        commitForgeMerge();
      });
      forgeModalActions.appendChild(confirm);
      const clear = doc.createElement("button");
      clear.type = "button";
      clear.className = "leave-button";
      clear.textContent = "Clear";
      clear.addEventListener("click", () => {
        forgeRefA = null;
        forgeRefB = null;
        forgePendingSuit = null;
        syncForgeMergeUi();
      });
      forgeModalActions.appendChild(clear);
      const cancel = doc.createElement("button");
      cancel.type = "button";
      cancel.className = "leave-button";
      cancel.textContent = "Cancel";
      cancel.addEventListener("click", () => closeUi());
      forgeModalActions.appendChild(cancel);
    }
    function syncForgeMergeUi() {
      const ca = cardAtForgeRef(forgeRefA);
      const cb = cardAtForgeRef(forgeRefB);
      const rank = forgeForgedRankFromCards(ca, cb);
      if (forgePreviewValue) forgePreviewValue.textContent = rank == null ? "\u2014" : String(rank);
      if (ca && cb && rank != null) {
        if (!forgePendingSuit) forgePendingSuit = forgeOutcomeSuit(ca, cb);
        if (forgeModalHint) {
          forgeModalHint.textContent = `Creates rank ${rank}. Suit: ${forgePendingSuit} (random donor). Passive rerolls on confirm.`;
        }
      } else {
        forgePendingSuit = null;
        if (forgeModalHint) {
          forgeModalHint.textContent = preferTouchPointerDrag3() ? "Press and drag two cards from the deck row above into the side slots, then confirm." : "Drag two cards from your deck and backpack above into the side slots, then confirm.";
        }
      }
      renderForgeSlotContents();
      forgeRefreshActionButtons();
    }
    function onForgeHudDragStart(e) {
      if (!mode) return;
      if (preferTouchPointerDrag3()) {
        e.preventDefault();
        return;
      }
      const t = e.target;
      const src = t instanceof Element ? t.closest("[data-forge-ref]") : null;
      if (!src?.dataset.forgeRef) return;
      e.dataTransfer?.setData("application/json", src.dataset.forgeRef);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = "copy";
    }
    function onForgeModalPointerDownCapture(e) {
      if (!mode || !preferTouchPointerDrag3() || e.button !== 0) return;
      const src = e.target instanceof Element ? e.target.closest("[data-forge-ref]") : null;
      if (!src?.dataset?.forgeRef || !forgeModal?.contains(src)) return;
      if (forgeTouchSession) return;
      e.preventDefault();
      const refJson = src.dataset.forgeRef;
      const pointerId = e.pointerId;
      const onMove = (ev) => {
        if (ev.pointerId !== pointerId) return;
        ev.preventDefault();
        clearForgeDropHover();
        const drop = forgeDropSlotFromClientPoint(ev.clientX, ev.clientY);
        if (drop) drop.classList.add("forge-drop-slot--hover");
      };
      const onUp = (ev) => {
        if (ev.pointerId !== pointerId) return;
        ev.preventDefault();
        const drop = forgeDropSlotFromClientPoint(ev.clientX, ev.clientY);
        const slot = drop?.dataset?.slot;
        const ref = parseForgeRefFromDataset(refJson);
        if (ref && (slot === "left" || slot === "right")) assignForgeToSlot(slot, ref);
        endForgeTouchSession();
      };
      forgeTouchSession = { pointerId, onMove, onUp };
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      if ("setPointerCapture" in forgeModal) {
        try {
          forgeModal.setPointerCapture(pointerId);
        } catch {
        }
      }
    }
    function wireForgeModalDragDropOnce() {
      if (!forgeModal || forgeModal.dataset.forgeDragWired === "1") return;
      if (!forgeSlotLeft || !forgeSlotRight) return;
      forgeModal.dataset.forgeDragWired = "1";
      doc.addEventListener("dragstart", onForgeHudDragStart, true);
      forgeModal.addEventListener("pointerdown", onForgeModalPointerDownCapture, true);
      for (const slotEl of [forgeSlotLeft, forgeSlotRight]) {
        slotEl.addEventListener("dragenter", (e) => {
          e.preventDefault();
          slotEl.classList.add("forge-drop-slot--hover");
        });
        slotEl.addEventListener("dragleave", () => slotEl.classList.remove("forge-drop-slot--hover"));
        slotEl.addEventListener("dragover", (e) => {
          e.preventDefault();
          slotEl.classList.add("forge-drop-slot--hover");
        });
        slotEl.addEventListener("drop", (e) => {
          e.preventDefault();
          slotEl.classList.remove("forge-drop-slot--hover");
          const raw = e.dataTransfer?.getData("application/json") ?? "";
          const ref = parseForgeRefFromDataset(raw);
          if (!ref) return;
          const slot = slotEl.dataset.slot;
          if (slot === "left" || slot === "right") assignForgeToSlot(slot, ref);
        });
      }
    }
    function open(opts = {}) {
      wireForgeModalDragDropOnce();
      if (!forgeModal || !forgeModalActions || !forgeSlotLeft || !forgeSlotRight || !forgePreviewValue || mode) {
        return;
      }
      onCommitSuccess = opts.onCommitSuccess ?? null;
      mode = true;
      onPausedChange(true);
      forgeRefA = null;
      forgeRefB = null;
      forgePendingSuit = null;
      forgeModal.hidden = false;
      if (forgeModalTitle) forgeModalTitle.textContent = "Forge";
      if (forgeModalSub) {
        forgeModalSub.textContent = preferTouchPointerDrag3() ? "Use your normal deck row above. Press and drag two cards into the side slots. The center is the forged rank (sum of ranks, capped at 13)." : "Use your normal deck row above. Drag two cards into the side slots. The center is the forged rank (sum of ranks, capped at 13).";
      }
      mountDeckPanelIntoForgeModal();
      syncForgeMergeUi();
      syncDeckSlots();
    }
    function dispose() {
      endForgeTouchSession();
      doc.defaultView?.removeEventListener("keydown", onGlobalKeydown);
      doc.removeEventListener("dragstart", onForgeHudDragStart, true);
      forgeModal?.removeEventListener("pointerdown", onForgeModalPointerDownCapture, true);
      if (forgeModal) delete forgeModal.dataset.forgeDragWired;
    }
    return {
      isForgePaused,
      open,
      closeUi,
      dispose
    };
  }

  // src/escape/specials/rouletteHexFlow.js
  var SQRT33 = Math.sqrt(3);
  function pointInsidePointyHex2(px, py, cx, cy, radius) {
    const dx = Math.abs(px - cx);
    const dy = Math.abs(py - cy);
    if (dx > SQRT33 / 2 * radius) return false;
    return dy <= radius - dx / SQRT33;
  }
  function createRouletteHexFlow({ hexKey: hexKey2 }) {
    const OUTER_BARRIER_R = HEX_SIZE;
    const PENALTY_RING_R = HEX_SIZE - 160;
    let phase = 0;
    let lockQ = 0;
    let lockR = 0;
    let wasInHex = false;
    let innerExitLatch = false;
    let forgeComplete = false;
    let wasInsidePenaltyRing = false;
    let preInnerCrossLockActive = false;
    const outerDamageAppliedKeys = /* @__PURE__ */ new Set();
    let screenFlashUntil = 0;
    function resetLeavingHex() {
      phase = 0;
      forgeComplete = false;
      innerExitLatch = false;
      wasInHex = false;
      lockQ = 0;
      lockR = 0;
      wasInsidePenaltyRing = false;
      preInnerCrossLockActive = false;
    }
    function resetSession() {
      resetLeavingHex();
      outerDamageAppliedKeys.clear();
      screenFlashUntil = 0;
    }
    function onForgeSuccess() {
      forgeComplete = true;
      phase = 2;
    }
    function onForgeCancel() {
    }
    function tick(o) {
      if (o.isWorldPaused()) return;
      const player = o.getPlayer();
      const ph = o.worldToHex(player.x, player.y);
      const inHex = o.isRouletteHexTile(ph.q, ph.r);
      if (!inHex) {
        resetLeavingHex();
        return;
      }
      const rc = o.hexToWorld(ph.q, ph.r);
      const inInner = Math.hypot(player.x - rc.x, player.y - rc.y) <= ROULETTE_INNER_HIT_R;
      const insidePenaltyRing = pointInsidePointyHex2(player.x, player.y, rc.x, rc.y, PENALTY_RING_R + player.r);
      const enteredHexThisFrame = inHex && !wasInHex;
      wasInHex = true;
      if (enteredHexThisFrame && phase === 0 && o.isRouletteHexInteractive(ph.q, ph.r)) {
        lockQ = ph.q;
        lockR = ph.r;
        phase = 1;
        preInnerCrossLockActive = true;
        screenFlashUntil = 0;
        wasInsidePenaltyRing = insidePenaltyRing;
      }
      if (phase === 1 && ph.q === lockQ && ph.r === lockR) {
        const rk = hexKey2(ph.q, ph.r);
        const crossedInnerRingInward = insidePenaltyRing && !wasInsidePenaltyRing;
        if (!outerDamageAppliedKeys.has(rk) && crossedInnerRingInward) {
          screenFlashUntil = o.getSimElapsed() + 0.4;
          o.onOuterPenalty();
          outerDamageAppliedKeys.add(rk);
        }
      }
      wasInsidePenaltyRing = insidePenaltyRing;
      if (phase === 1 && ph.q === lockQ && ph.r === lockR && inInner && !forgeComplete && !innerExitLatch) {
        preInnerCrossLockActive = false;
        innerExitLatch = true;
        o.openRouletteModal();
      }
      if (!inInner) innerExitLatch = false;
    }
    function onTileCacheEvicted(cacheKey, closeRouletteModalIfOpen) {
      if (hexKey2(lockQ, lockR) === cacheKey) {
        closeRouletteModalIfOpen();
        resetLeavingHex();
      }
      outerDamageAppliedKeys.delete(cacheKey);
    }
    function drawWorld(ctx, activeHexes, hexToWorld, simElapsed, isRouletteHexTile, isRouletteHexInteractive, isRouletteSpent) {
      for (const h of activeHexes) {
        if (!isRouletteHexTile(h.q, h.r)) continue;
        const c = hexToWorld(h.q, h.r);
        const cx = c.x;
        const cy = c.y;
        const k = hexKey2(h.q, h.r);
        const isInteractive = isRouletteHexInteractive(h.q, h.r);
        const outerYellow = "rgba(250, 204, 21, 0.96)";
        const innerRing = outerDamageAppliedKeys.has(k) ? "rgba(250, 204, 21, 0.94)" : "rgba(249, 115, 22, 0.92)";
        strokePointyHexOutline(ctx, cx, cy, OUTER_BARRIER_R, outerYellow, 3.4, 18);
        if (isInteractive) strokePointyHexOutline(ctx, cx, cy, PENALTY_RING_R, innerRing, 2.6, 14);
        fillPointyHexRainbowGlow(ctx, cx, cy, ROULETTE_INNER_HEX_DRAW_R, simElapsed);
      }
    }
    function isOuterBarrierWorldPoint(px, py, worldToHex, hexToWorld, isRouletteHexInteractive) {
      if (phase !== 1 || !preInnerCrossLockActive) return false;
      const h = worldToHex(px, py);
      if (h.q !== lockQ || h.r !== lockR) return false;
      if (!isRouletteHexInteractive(h.q, h.r)) return false;
      const c = hexToWorld(h.q, h.r);
      return Math.hypot(px - c.x, py - c.y) <= OUTER_BARRIER_R + 1.5;
    }
    function getScreenFlashUntil() {
      return screenFlashUntil;
    }
    function getLock() {
      return { q: lockQ, r: lockR };
    }
    return {
      tick,
      resetSession,
      onTileCacheEvicted,
      onForgeSuccess,
      onForgeCancel,
      drawWorld,
      getLock,
      getScreenFlashUntil,
      /** @param {number} t */
      setScreenFlashUntil(t) {
        screenFlashUntil = t;
      },
      isOuterBarrierWorldPoint,
      outerDamageHas(key) {
        return outerDamageAppliedKeys.has(key);
      }
    };
  }

  // src/escape/specials/rouletteModal.js
  function pinPlayerDeckPanel(doc) {
    const el = doc.getElementById("player-deck-panel");
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.dataset.rouletteDeckPinned = "1";
    el.style.boxSizing = "border-box";
    el.style.position = "fixed";
    el.style.top = `${Math.max(0, r.top)}px`;
    el.style.left = `${Math.max(0, r.left)}px`;
    el.style.width = `${r.width}px`;
    el.style.zIndex = "55";
  }
  function unpinPlayerDeckPanel(doc) {
    const el = doc.getElementById("player-deck-panel");
    if (!el || el.dataset.rouletteDeckPinned !== "1") return;
    delete el.dataset.rouletteDeckPinned;
    el.style.position = "";
    el.style.top = "";
    el.style.left = "";
    el.style.width = "";
    el.style.zIndex = "";
    el.style.boxSizing = "";
  }
  function getReservedDeckKeysExcludingCard(inv, pending, world, exCard) {
    const reserved = collectReservedDeckKeys(inv, pending, world);
    if (exCard && exCard.suit && exCard.suit !== "joker" && Number.isInteger(exCard.rank)) {
      reserved.delete(deckKey(exCard.suit, exCard.rank));
    }
    return reserved;
  }
  function makeRouletteCandidateCard(suit, rank, itemRules) {
    return {
      id: `roulette-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      suit,
      rank,
      effect: itemRules.makeCardEffect(suit, rank)
    };
  }
  function buildRoulettePairFromSource(sourceCard, inv, pending, world, itemRules) {
    if (!sourceCard || sourceCard.suit === "joker" || !Number.isInteger(sourceCard.rank)) return null;
    const rank = sourceCard.rank;
    const reserved = getReservedDeckKeysExcludingCard(inv, pending, world, sourceCard);
    const suits = ["diamonds", "hearts", "clubs", "spades"].filter((s) => s !== sourceCard.suit);
    const avail = suits.filter((s) => !reserved.has(deckKey(s, rank)));
    for (let i = avail.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [avail[i], avail[j]] = [avail[j], avail[i]];
    }
    if (avail.length < 2) return null;
    return {
      a: makeRouletteCandidateCard(avail[0], rank, itemRules),
      b: makeRouletteCandidateCard(avail[1], rank, itemRules)
    };
  }
  function createRouletteModal(deps) {
    const {
      doc,
      inventory: inventory2,
      getItemRules,
      getPendingCard,
      getWorldCardPickups,
      syncDeckSlots,
      onPausedChange = () => {
      }
    } = deps;
    const rouletteModal = doc.getElementById("roulette-modal");
    const rouletteModalTitle = doc.getElementById("roulette-modal-title");
    const rouletteModalSub = doc.getElementById("roulette-modal-sub");
    const rouletteModalSpinRow = doc.getElementById("roulette-modal-spin-row");
    const rouletteModalActions = doc.getElementById("roulette-modal-actions");
    let mode = false;
    let step = null;
    let sourceRef = null;
    let optionA = null;
    let optionB = null;
    let shuffleUntilSec = 0;
    let revealAtSec = 0;
    let onSuccessComplete = null;
    function isPaused() {
      return mode;
    }
    function closeUi() {
      if (!rouletteModal) return;
      const had = mode;
      rouletteModal.hidden = true;
      unpinPlayerDeckPanel(doc);
      mode = false;
      step = null;
      sourceRef = null;
      optionA = null;
      optionB = null;
      shuffleUntilSec = 0;
      revealAtSec = 0;
      if (rouletteModalSpinRow) rouletteModalSpinRow.innerHTML = "";
      if (rouletteModalActions) rouletteModalActions.innerHTML = "";
      if (had) onPausedChange(false);
    }
    function onGlobalKeydown(e) {
      if (e.key !== "Escape" || !mode) return;
      e.preventDefault();
      closeUi();
    }
    doc.defaultView?.addEventListener("keydown", onGlobalKeydown);
    function setRouletteSpinCardFace(cardEl, card) {
      if (!cardEl || !card) return;
      let name = cardEl.querySelector(".roulette-spin-name");
      let meta = cardEl.querySelector(".roulette-spin-meta");
      if (!name) {
        name = doc.createElement("span");
        name.className = "roulette-spin-name";
        cardEl.appendChild(name);
      }
      if (!meta) {
        meta = doc.createElement("span");
        meta.className = "roulette-spin-meta";
        cardEl.appendChild(meta);
      }
      const rules = getItemRules();
      name.textContent = formatCardName(card);
      meta.textContent = rules.describeCardEffect(card);
    }
    function createRouletteSpinDom() {
      if (!rouletteModalSpinRow || !optionA || !optionB) return;
      rouletteModalSpinRow.innerHTML = `
    <div class="roulette-spin-pair roulette-spin-pair--shuffling" id="roulette-spin-pair-root">
      <div class="roulette-spin-card roulette-spin-card--shuffling" id="roulette-spin-left"></div>
      <div class="roulette-spin-card roulette-spin-card--shuffling" id="roulette-spin-right"></div>
    </div>`;
      const left = doc.getElementById("roulette-spin-left");
      const right = doc.getElementById("roulette-spin-right");
      if (left) setRouletteSpinCardFace(left, optionA);
      if (right) setRouletteSpinCardFace(right, optionB);
    }
    function syncRouletteSpinShuffleVisual(nowSec) {
      if (!rouletteModalSpinRow || !optionA || !optionB) return;
      const pair = doc.getElementById("roulette-spin-pair-root");
      const left = doc.getElementById("roulette-spin-left");
      const right = doc.getElementById("roulette-spin-right");
      if (!pair || !left || !right) return;
      const t = nowSec;
      const a = optionA;
      const b = optionB;
      const swap = Math.floor(t * 3.1 + Math.sin(t * 5.2) * 1.4) % 2 === 1;
      const leftCard = swap ? b : a;
      const rightCard = swap ? a : b;
      setRouletteSpinCardFace(left, leftCard);
      setRouletteSpinCardFace(right, rightCard);
      const micro = Math.sin(t * 12) + Math.sin(t * 7.1);
      const hi = Math.floor((t * 4.6 + micro * 0.9) % 2);
      const bothDim = Math.floor(t * 5.5) % 13 === 0;
      let leftCls = "roulette-spin-card roulette-spin-card--shuffling";
      let rightCls = "roulette-spin-card roulette-spin-card--shuffling";
      if (bothDim) {
        leftCls += " roulette-spin-card--dim";
        rightCls += " roulette-spin-card--dim";
      } else if (hi === 0) {
        leftCls += " roulette-spin-card--hot";
      } else {
        rightCls += " roulette-spin-card--hot";
      }
      left.className = leftCls;
      right.className = rightCls;
      pair.classList.add("roulette-spin-pair--shuffling");
      pair.classList.remove("roulette-spin-pair--whiteout");
    }
    function syncRouletteSpinWhiteoutVisual() {
      const pair = doc.getElementById("roulette-spin-pair-root");
      const left = doc.getElementById("roulette-spin-left");
      const right = doc.getElementById("roulette-spin-right");
      if (pair) {
        pair.classList.remove("roulette-spin-pair--shuffling");
        pair.classList.add("roulette-spin-pair--whiteout");
      }
      if (left) left.className = "roulette-spin-card roulette-spin-card--whiteout-panel";
      if (right) right.className = "roulette-spin-card roulette-spin-card--whiteout-panel";
    }
    function renderRouletteSpinSettled() {
      const pair = doc.getElementById("roulette-spin-pair-root");
      const left = doc.getElementById("roulette-spin-left");
      const right = doc.getElementById("roulette-spin-right");
      if (!pair || !left || !right || !optionA || !optionB) return;
      const a = optionA;
      const b = optionB;
      pair.classList.remove("roulette-spin-pair--shuffling", "roulette-spin-pair--whiteout");
      setRouletteSpinCardFace(left, a);
      setRouletteSpinCardFace(right, b);
      left.className = "roulette-spin-card roulette-spin-card--revealed roulette-spin-card--pickable";
      right.className = "roulette-spin-card roulette-spin-card--revealed roulette-spin-card--pickable";
    }
    function wireRouletteCardPickListeners() {
      const left = doc.getElementById("roulette-spin-left");
      const right = doc.getElementById("roulette-spin-right");
      if (!left || !right || !optionA || !optionB) return;
      left.tabIndex = 0;
      right.tabIndex = 0;
      left.onclick = () => finishSuccess(optionA);
      right.onclick = () => finishSuccess(optionB);
      const onKey = (ev, pickA) => {
        if (ev.key !== "Enter" && ev.key !== " ") return;
        ev.preventDefault();
        finishSuccess(pickA ? optionA : optionB);
      };
      left.onkeydown = (ev) => onKey(ev, true);
      right.onkeydown = (ev) => onKey(ev, false);
    }
    function renderRoulettePickWinnerButtons() {
      if (!rouletteModalActions || !optionA || !optionB) return;
      rouletteModalActions.innerHTML = "";
      const cancel = doc.createElement("button");
      cancel.type = "button";
      cancel.className = "leave-button";
      cancel.textContent = "Cancel";
      cancel.addEventListener("click", () => closeUi());
      rouletteModalActions.appendChild(cancel);
    }
    function finishSuccess(chosen) {
      const ref = sourceRef;
      if (!ref || !chosen) {
        closeUi();
        return;
      }
      const placed = {
        ...chosen,
        id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`
      };
      if (ref.kind === "deck") inventory2.deckByRank[ref.rank] = placed;
      else if (ref.kind === "bp") inventory2.backpackSlots[ref.idx] = placed;
      syncDeckSlots();
      onSuccessComplete?.();
      closeUi();
    }
    function startSpinFromSource(sourceCard, ref) {
      const rules = getItemRules();
      const pair = buildRoulettePairFromSource(
        sourceCard,
        inventory2,
        getPendingCard() ?? null,
        getWorldCardPickups(),
        rules
      );
      if (!pair) {
        if (rouletteModalSub) {
          rouletteModalSub.textContent = "That card has no two free suits at this rank (other ranks may still work). Pick another or cancel.";
        }
        return;
      }
      sourceRef = ref;
      optionA = pair.a;
      optionB = pair.b;
      step = "spin";
      if (rouletteModalSpinRow) rouletteModalSpinRow.innerHTML = "";
      if (rouletteModalActions) rouletteModalActions.innerHTML = "";
      createRouletteSpinDom();
      const now = performance.now() / 1e3;
      shuffleUntilSec = now + ROULETTE_SPIN_SHUFFLE_SEC;
      revealAtSec = shuffleUntilSec + ROULETTE_SPIN_WHITEOUT_SEC;
      if (rouletteModalSub) rouletteModalSub.textContent = "Shuffling";
    }
    function renderRouletteSourcePicker() {
      if (!rouletteModalSpinRow || !rouletteModalActions) return;
      rouletteModalSpinRow.innerHTML = "";
      rouletteModalActions.innerHTML = "";
      const rules = getItemRules();
      let pickCount = 0;
      for (let r = 1; r <= 13; r++) {
        const c = inventory2.deckByRank[r];
        if (!c || c.suit === "joker") continue;
        if (!buildRoulettePairFromSource(c, inventory2, getPendingCard() ?? null, getWorldCardPickups(), rules)) continue;
        const b = doc.createElement("button");
        b.type = "button";
        b.className = "leave-button";
        b.textContent = `Deck ${cardRankText(r)} \u2014 ${formatCardName(c)}`;
        b.addEventListener("click", () => startSpinFromSource(c, { kind: "deck", rank: r }));
        rouletteModalActions.appendChild(b);
        pickCount += 1;
      }
      for (let i = 0; i < 3; i++) {
        const c = inventory2.backpackSlots[i];
        if (!c || c.suit === "joker") continue;
        if (!buildRoulettePairFromSource(c, inventory2, getPendingCard() ?? null, getWorldCardPickups(), rules)) continue;
        const b = doc.createElement("button");
        b.type = "button";
        b.className = "leave-button";
        b.textContent = `Backpack ${i + 1} \u2014 ${formatCardName(c)}`;
        b.addEventListener("click", () => startSpinFromSource(c, { kind: "bp", idx: i }));
        rouletteModalActions.appendChild(b);
        pickCount += 1;
      }
      if (pickCount === 0) {
        if (rouletteModalSub) {
          rouletteModalSub.textContent = "No card can forge right now \u2014 you need a non-joker in deck or backpack whose rank still has two suits not already in your deck.";
        }
        const hint = doc.createElement("p");
        hint.className = "roulette-empty-hint";
        hint.textContent = "Leave the inner hex and return with a different loadout, or press Escape to close.";
        rouletteModalSpinRow.appendChild(hint);
      }
      const cancel = doc.createElement("button");
      cancel.type = "button";
      cancel.className = "leave-button";
      cancel.textContent = "Cancel";
      cancel.addEventListener("click", () => closeUi());
      rouletteModalActions.appendChild(cancel);
    }
    function open(onSuccess) {
      if (!rouletteModal) return;
      onSuccessComplete = onSuccess ?? null;
      mode = true;
      step = "pickSource";
      onPausedChange(true);
      rouletteModal.hidden = false;
      if (rouletteModalTitle) rouletteModalTitle.textContent = "Roulette forge";
      if (rouletteModalSub) {
        rouletteModalSub.textContent = "Pick a card to re-roll into two other suits at the same rank.";
      }
      renderRouletteSourcePicker();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => pinPlayerDeckPanel(doc));
      });
    }
    function tickWallClock() {
      if (!mode || step !== "spin" || !optionA || !optionB) return;
      const now = performance.now() / 1e3;
      if (now >= revealAtSec) {
        step = "pick";
        renderRouletteSpinSettled();
        if (rouletteModalSub) {
          rouletteModalSub.textContent = "Click a card to keep (the other is lost).";
        }
        renderRoulettePickWinnerButtons();
        wireRouletteCardPickListeners();
        return;
      }
      if (now >= shuffleUntilSec) {
        if (rouletteModalSub) rouletteModalSub.textContent = "Revealing\u2026";
        syncRouletteSpinWhiteoutVisual();
        return;
      }
      syncRouletteSpinShuffleVisual(now);
    }
    function dispose() {
      doc.defaultView?.removeEventListener("keydown", onGlobalKeydown);
    }
    return {
      isPaused,
      open,
      closeUi,
      tickWallClock,
      dispose
    };
  }

  // src/escape/specials/swampBootlegCrystalModal.js
  function createSwampBootlegCrystalModal(opts) {
    const onPausedChange = opts.onPausedChange ?? (() => {
    });
    const root = document.getElementById("swamp-bootleg-crystal-modal");
    const flavorEl = document.getElementById("swamp-bootleg-flavor");
    const btnA = document.getElementById("swamp-bootleg-choice-a");
    const btnB = document.getElementById("swamp-bootleg-choice-b");
    let open = false;
    let resolvePick = null;
    function setHidden(hidden) {
      if (!root) return;
      root.hidden = hidden;
      root.setAttribute("aria-hidden", hidden ? "true" : "false");
    }
    function close() {
      const needUnpause = open || resolvePick != null;
      open = false;
      resolvePick = null;
      setHidden(true);
      if (needUnpause) onPausedChange(false);
    }
    function openModal(payload) {
      if (!root || !flavorEl || !btnA || !btnB) {
        return Promise.resolve("a");
      }
      open = true;
      setHidden(false);
      onPausedChange(true);
      flavorEl.textContent = payload.flavor;
      btnA.innerHTML = formatChoiceHtml(payload.left);
      btnB.innerHTML = formatChoiceHtml(payload.right);
      return new Promise((resolve) => {
        resolvePick = resolve;
      });
    }
    function formatChoiceHtml(offer) {
      return `<span class="swamp-bootleg-choice__title">${escapeHtml(offer.title)}</span><span class="swamp-bootleg-choice__body">${offer.bodyLines.map(escapeHtml).join("<br/>")}</span>`;
    }
    function escapeHtml(s) {
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    function onChoose(side) {
      if (!open || !resolvePick) return;
      const res = resolvePick;
      resolvePick = null;
      open = false;
      setHidden(true);
      onPausedChange(false);
      res(side);
    }
    if (btnA) btnA.addEventListener("click", () => onChoose("a"));
    if (btnB) btnB.addEventListener("click", () => onChoose("b"));
    return {
      openModal,
      close,
      isPaused: () => open
    };
  }

  // src/escape/swamp/swampBootlegCrystalPool.js
  function rollBootlegPurge(rand) {
    const u = rand();
    if (u < 1 / 3) {
      return { kind: "nextCrystal", label: "Curse ends when you touch the next health crystal." };
    }
    if (u < 2 / 3) {
      const n = 1 + Math.floor(rand() * 3);
      return { kind: "damageHits", n, label: `Curse ends after you take damage ${n} more time(s).` };
    }
    const sec = 5 + Math.floor(rand() * 11);
    return { kind: "timer", sec, label: `Curse ends after ${sec} seconds.` };
  }
  var FLAVOR_LINES = [
    "You hear the sound of distant maniacal laughter, slowly getting closer.",
    "The bog remembers other footsteps \u2014 none of them left.",
    "Something under the water counts your heartbeats, one\u2026 two\u2026"
  ];
  function pickBootlegFlavor(rand) {
    return FLAVOR_LINES[Math.floor(rand() * FLAVOR_LINES.length)];
  }
  function resolvePurgeAtApply(spec, simElapsed) {
    if (spec.kind === "nextCrystal") return { kind: "nextCrystal" };
    if (spec.kind === "damageHits") return { kind: "damageHits", left: spec.n };
    return { kind: "timer", until: simElapsed + spec.sec };
  }
  var RANDOM_PURGE_EFFECT_IDS = ["tax_q", "tax_w", "mud_legs", "murk_vision", "brittle", "wrong_footing"];
  var ALL_EFFECT_IDS = ["blood_bargain", "stingy", "silence_feast", "honest_two", ...RANDOM_PURGE_EFFECT_IDS];
  function buildOfferForEffect(effectId, purgeSpec, simElapsed) {
    switch (effectId) {
      case "blood_bargain":
        return {
          id: "blood_bargain",
          title: "Blood bargain",
          bodyLines: [
            "Restore 5 HP now.",
            "Lose 1 HP every 5 seconds for 20 seconds (four bites). Net +1 if you survive the toll."
          ],
          heal: 5,
          bloodTax: { intervalSec: 5, ticks: 4, damagePerTick: 1 },
          curse: null
        };
      case "stingy":
        return {
          id: "stingy",
          title: "Stingy sip",
          bodyLines: ["Only restore 1 HP.", "No curse hangs on after this \u2014 the bog barely gives."],
          heal: 1,
          curse: null
        };
      case "silence_feast": {
        const paired = (
          /** @type {const} */
          { kind: "timer", sec: 6, label: "" }
        );
        return {
          id: "silence_feast",
          title: "Heavy meal",
          bodyLines: [
            "Restore 3 HP.",
            "You cannot use Q, W, or E for 6 seconds \u2014 the same window ends the bargain."
          ],
          heal: 3,
          spellSilenceSec: 6,
          curse: {
            clearsWithSpellSilence: true,
            purge: resolvePurgeAtApply(paired, simElapsed)
          }
        };
      }
      case "honest_two":
        return {
          id: "honest_two",
          title: "Honest glint",
          bodyLines: ["Restore 2 HP.", "No curse \u2014 this one is almost real."],
          heal: 2,
          curse: null
        };
      case "tax_q":
        return {
          id: "tax_q",
          title: "Q toll",
          bodyLines: ["Restore 2 HP.", `Your Q ability cooldown is +1s (after reductions). ${purgeSpec.label}`],
          heal: 2,
          curse: { extraDashCd: 1, purge: resolvePurgeAtApply(purgeSpec, simElapsed) }
        };
      case "tax_w":
        return {
          id: "tax_w",
          title: "W toll",
          bodyLines: ["Restore 2 HP.", `Your W ability cooldown is +3s (after reductions). ${purgeSpec.label}`],
          heal: 2,
          curse: { extraBurstCd: 3, purge: resolvePurgeAtApply(purgeSpec, simElapsed) }
        };
      case "mud_legs":
        return {
          id: "mud_legs",
          title: "Mud legs",
          bodyLines: ["Restore 2 HP.", `Move speed \u221215%. ${purgeSpec.label}`],
          heal: 2,
          curse: { moveSlow: true, purge: resolvePurgeAtApply(purgeSpec, simElapsed) }
        };
      case "murk_vision":
        return {
          id: "murk_vision",
          title: "Murk vision",
          bodyLines: [
            "Restore 2 HP.",
            `Colourblind murk: every hunter reads the same grey-green shade. ${purgeSpec.label}`
          ],
          heal: 2,
          curse: { colourblind: true, purge: resolvePurgeAtApply(purgeSpec, simElapsed) }
        };
      case "brittle":
        return {
          id: "brittle",
          title: "Brittle glass",
          bodyLines: ["Restore 2 HP.", `Fragile: you take +1 damage from each hit. ${purgeSpec.label}`],
          heal: 2,
          curse: { fragile: true, purge: resolvePurgeAtApply(purgeSpec, simElapsed) }
        };
      case "wrong_footing":
        return {
          id: "wrong_footing",
          title: "Wrong footing",
          bodyLines: ["Restore 2 HP.", `Movement controls are inverted. ${purgeSpec.label}`],
          heal: 2,
          curse: { invertMove: true, purge: resolvePurgeAtApply(purgeSpec, simElapsed) }
        };
      default:
        return {
          id: "honest_two",
          title: "Honest glint",
          bodyLines: ["Restore 2 HP.", "No curse \u2014 this one is almost real."],
          heal: 2,
          curse: null
        };
    }
  }
  function rollEffectId(rand) {
    return ALL_EFFECT_IDS[Math.floor(rand() * ALL_EFFECT_IDS.length)];
  }
  function rollDistinctEffectId(rand, excludeId) {
    let id = rollEffectId(rand);
    let guard = 0;
    while (id === excludeId && guard++ < 64) {
      id = rollEffectId(rand);
    }
    if (id === excludeId) {
      const idx = ALL_EFFECT_IDS.indexOf(excludeId);
      id = ALL_EFFECT_IDS[(idx + 1) % ALL_EFFECT_IDS.length];
    }
    return id;
  }
  function composeOffer(effectId, rand, simElapsed) {
    if (RANDOM_PURGE_EFFECT_IDS.includes(effectId)) {
      const purgeSpec = rollBootlegPurge(rand);
      return buildOfferForEffect(effectId, purgeSpec, simElapsed);
    }
    const dummyPurge = { kind: "nextCrystal", label: "" };
    return buildOfferForEffect(effectId, dummyPurge, simElapsed);
  }
  function rollTwoBootlegOffers(rand, simElapsed) {
    const leftId = rollEffectId(rand);
    const rightId = rollDistinctEffectId(rand, leftId);
    const flavor = pickBootlegFlavor(rand);
    return {
      flavor,
      left: composeOffer(leftId, rand, simElapsed),
      right: composeOffer(rightId, rand, simElapsed)
    };
  }

  // src/escape/swamp/swampBootlegRuntime.js
  function swampBootlegPurgeIsActive(row, simElapsed) {
    const p = row.purge;
    if (!p) return false;
    if (p.kind === "nextCrystal") return true;
    if (p.kind === "timer") return simElapsed < p.until;
    if (p.kind === "damageHits") return p.left > 0;
    return false;
  }
  function recalcSwampBootlegCdMirror(inventory2, simElapsed) {
    let d = 0;
    let b = 0;
    const list = inventory2.swampBootlegCurses;
    if (Array.isArray(list)) {
      for (const row of list) {
        if (!swampBootlegPurgeIsActive(row, simElapsed)) continue;
        d += row.extraDashCd || 0;
        b += row.extraBurstCd || 0;
      }
    }
    inventory2.swampBootlegCdDash = d;
    inventory2.swampBootlegCdBurst = b;
  }
  function tickSwampBootlegCurses(inventory2, simElapsed) {
    const list = inventory2.swampBootlegCurses;
    if (!Array.isArray(list) || list.length === 0) {
      recalcSwampBootlegCdMirror(inventory2, simElapsed);
      return;
    }
    for (let i = list.length - 1; i >= 0; i--) {
      const row = list[i];
      const p = row.purge;
      if (!p) {
        list.splice(i, 1);
        continue;
      }
      if (p.kind === "timer" && simElapsed >= p.until) {
        if (row.clearsWithSpellSilence) {
          inventory2.swampBootlegSpellSilenceUntil = 0;
        }
        list.splice(i, 1);
        continue;
      }
      if (p.kind === "damageHits" && p.left <= 0) {
        list.splice(i, 1);
        continue;
      }
    }
    if ((inventory2.swampBootlegSpellSilenceUntil ?? 0) > 0 && simElapsed >= inventory2.swampBootlegSpellSilenceUntil) {
      inventory2.swampBootlegSpellSilenceUntil = 0;
    }
    recalcSwampBootlegCdMirror(inventory2, simElapsed);
  }
  function purgeSwampBootlegNextCrystalCurses(inventory2) {
    const list = inventory2.swampBootlegCurses;
    if (!Array.isArray(list)) return;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].purge?.kind === "nextCrystal") list.splice(i, 1);
    }
  }
  function onSwampBootlegPlayerDamageHit(inventory2, simElapsed) {
    const list = inventory2.swampBootlegCurses;
    if (!Array.isArray(list)) return;
    for (const row of list) {
      const p = row.purge;
      if (!p || p.kind !== "damageHits") continue;
      if (!swampBootlegPurgeIsActive(row, simElapsed)) continue;
      p.left = Math.max(0, (p.left ?? 0) - 1);
    }
  }
  function getSwampBootlegMoveSpeedMult(inventory2, simElapsed) {
    let m = 1;
    const list = inventory2.swampBootlegCurses;
    if (!Array.isArray(list)) return m;
    for (const row of list) {
      if (row.moveSlow && swampBootlegPurgeIsActive(row, simElapsed)) m *= 0.85;
    }
    return m;
  }
  function getSwampBootlegColourblind(inventory2, simElapsed) {
    const list = inventory2.swampBootlegCurses;
    if (!Array.isArray(list)) return false;
    for (const row of list) {
      if (row.colourblind && swampBootlegPurgeIsActive(row, simElapsed)) return true;
    }
    return false;
  }
  function getSwampBootlegInvertMove(inventory2, simElapsed) {
    const list = inventory2.swampBootlegCurses;
    if (!Array.isArray(list)) return false;
    for (const row of list) {
      if (row.invertMove && swampBootlegPurgeIsActive(row, simElapsed)) return true;
    }
    return false;
  }
  function getSwampBootlegFragileExtra(inventory2, simElapsed) {
    let n = 0;
    const list = inventory2.swampBootlegCurses;
    if (!Array.isArray(list)) return 0;
    for (const row of list) {
      if (row.fragile && swampBootlegPurgeIsActive(row, simElapsed)) n += 1;
    }
    return n;
  }
  function tickSwampBootlegBloodTax(inventory2, simElapsed, damageFn) {
    const t = inventory2.swampBootlegBloodTax;
    if (!t || t.ticksLeft <= 0) {
      inventory2.swampBootlegBloodTax = null;
      return;
    }
    if (simElapsed < t.nextAt) return;
    damageFn(t.damagePerTick ?? 1);
    t.ticksLeft -= 1;
    if (t.ticksLeft <= 0) {
      inventory2.swampBootlegBloodTax = null;
      return;
    }
    t.nextAt = simElapsed + (t.intervalSec ?? 5);
  }
  function applySwampBootlegOffer(inventory2, offer, simElapsed, nextUid) {
    if (!Array.isArray(inventory2.swampBootlegCurses)) inventory2.swampBootlegCurses = [];
    if (offer.bloodTax) {
      const { intervalSec, ticks, damagePerTick } = offer.bloodTax;
      inventory2.swampBootlegBloodTax = {
        nextAt: simElapsed + intervalSec,
        ticksLeft: ticks,
        intervalSec,
        damagePerTick
      };
    }
    if (offer.spellSilenceSec) {
      inventory2.swampBootlegSpellSilenceUntil = simElapsed + offer.spellSilenceSec;
    }
    const curse = offer.curse;
    if (curse && curse.purge) {
      inventory2.swampBootlegCurses.push({
        uid: nextUid(),
        extraDashCd: curse.extraDashCd,
        extraBurstCd: curse.extraBurstCd,
        moveSlow: curse.moveSlow,
        colourblind: curse.colourblind,
        fragile: curse.fragile,
        invertMove: curse.invertMove,
        clearsWithSpellSilence: curse.clearsWithSpellSilence,
        purge: curse.purge
      });
    }
    recalcSwampBootlegCdMirror(inventory2, simElapsed);
  }
  function resetSwampBootlegState(inventory2) {
    inventory2.swampBootlegCurses = [];
    inventory2.swampBootlegCdDash = 0;
    inventory2.swampBootlegCdBurst = 0;
    inventory2.swampBootlegSpellSilenceUntil = 0;
    inventory2.swampBootlegBloodTax = null;
  }
  function bootlegCurseEffectLabel(row) {
    if (row.extraBurstCd) return `W +${row.extraBurstCd}s cooldown`;
    if (row.extraDashCd) return `Q +${row.extraDashCd}s cooldown`;
    if (row.moveSlow) return "Move speed \u221215%";
    if (row.colourblind) return "Murk vision (grey hunters)";
    if (row.fragile) return "Fragile (+1 damage taken)";
    if (row.invertMove) return "Inverted movement";
    if (row.clearsWithSpellSilence) return "Spell lock (Q/W/E)";
    return "Curse";
  }
  function bootlegCursePurgeLabel(purge, simElapsed) {
    if (!purge) return "\u2014";
    if (purge.kind === "nextCrystal") return "Ends: next health crystal";
    if (purge.kind === "damageHits") return `Ends: ${purge.left} more hit(s)`;
    const rem = Math.max(0, purge.until - simElapsed);
    if (rem >= 120) return `Ends: ${(rem / 60).toFixed(1)} min`;
    return `Ends: ${rem.toFixed(1)}s`;
  }
  function getSwampBootlegSidebarRows(inventory2, simElapsed) {
    const rows = [];
    const blood = inventory2.swampBootlegBloodTax;
    if (blood && (blood.ticksLeft ?? 0) > 0) {
      const nextIn = Math.max(0, blood.nextAt - simElapsed);
      rows.push({
        effect: "Blood toll",
        purge: `${blood.ticksLeft} drain(s) \xB7 \u2212${blood.damagePerTick ?? 1} HP in ${nextIn.toFixed(1)}s`
      });
    }
    const list = inventory2.swampBootlegCurses;
    if (!Array.isArray(list)) return rows;
    for (const row of list) {
      if (!swampBootlegPurgeIsActive(row, simElapsed)) continue;
      rows.push({
        effect: bootlegCurseEffectLabel(row),
        purge: bootlegCursePurgeLabel(row.purge, simElapsed)
      });
    }
    return rows;
  }

  // src/escape/specials/safehouseHexFlow.js
  function createSafehouseHexFlow() {
    const levelPromptShownKeys = /* @__PURE__ */ new Set();
    let innerFacilitiesUnlocked = false;
    let embeddedRouletteComplete = false;
    let embeddedForgeComplete = false;
    let embedRevealAtMs = 0;
    let forgeInnerExitLatch = false;
    let rouletteInnerExitLatch = false;
    let levelInnerLatch = false;
    let pausedForSafehousePrompt = false;
    let awaitingLeaveAfterLevelUp = false;
    let levelUpTileKey = "";
    let safehouseClockFreeze = 0;
    let spentTileAnim = null;
    function resetEmbeddedProgress() {
      innerFacilitiesUnlocked = false;
      embeddedRouletteComplete = false;
      embeddedForgeComplete = false;
      embedRevealAtMs = 0;
      forgeInnerExitLatch = false;
      rouletteInnerExitLatch = false;
      levelInnerLatch = false;
      awaitingLeaveAfterLevelUp = false;
      levelUpTileKey = "";
    }
    function resetSession() {
      levelPromptShownKeys.clear();
      resetEmbeddedProgress();
      pausedForSafehousePrompt = false;
      safehouseClockFreeze = 0;
      spentTileAnim = null;
    }
    function onTileCacheEvicted(cacheKey, specials) {
      const parts = cacheKey.split(",");
      if (parts.length !== 2) return;
      const q = Number(parts[0]);
      const r = Number(parts[1]);
      if (!Number.isFinite(q) || !Number.isFinite(r)) return;
      if (!specials.isSafehouseHexTile(q, r)) return;
      levelPromptShownKeys.delete(cacheKey);
      if (levelUpTileKey === cacheKey) {
        awaitingLeaveAfterLevelUp = false;
        levelUpTileKey = "";
      }
      if (spentTileAnim?.key === cacheKey) spentTileAnim = null;
      resetEmbeddedProgress();
    }
    function onProceduralSafehousePlaced() {
      resetEmbeddedProgress();
    }
    function onProceduralSafehouseSpent(k) {
      resetEmbeddedProgress();
      spentTileAnim = { key: k, startMs: performance.now() };
    }
    function tickSpentTileAnimDone() {
      const fx = spentTileAnim;
      if (!fx) return;
      if (performance.now() - fx.startMs >= SAFEHOUSE_SPENT_TILE_ANIM_MS) spentTileAnim = null;
    }
    function tickEmbedRevealFromWallClock(getIsLunatic) {
      if (getIsLunatic()) {
        embedRevealAtMs = 0;
        return;
      }
      if (embedRevealAtMs > 0 && performance.now() >= embedRevealAtMs) {
        innerFacilitiesUnlocked = true;
        embedRevealAtMs = 0;
      }
    }
    function updateSpendAfterLevelLeave(getPlayer, worldToHex, markProceduralSafehouseHexSpent) {
      if (!awaitingLeaveAfterLevelUp || !levelUpTileKey) return;
      const pk = levelUpTileKey;
      const parts = pk.split(",");
      if (parts.length !== 2) {
        awaitingLeaveAfterLevelUp = false;
        levelUpTileKey = "";
        return;
      }
      const pq = Number(parts[0]);
      const pr = Number(parts[1]);
      if (!Number.isFinite(pq) || !Number.isFinite(pr)) {
        awaitingLeaveAfterLevelUp = false;
        levelUpTileKey = "";
        return;
      }
      const ph = worldToHex(getPlayer().x, getPlayer().y);
      if (ph.q === pq && ph.r === pr) return;
      markProceduralSafehouseHexSpent(pq, pr);
    }
    function clampPlayerOutOfSpentCore(getPlayer, worldToHex, hexToWorld, isSafehouseHexSpentTile, setPlayerPos) {
      const p = getPlayer();
      const ph = worldToHex(p.x, p.y);
      if (!isSafehouseHexSpentTile(ph.q, ph.r)) return;
      const cc = hexToWorld(ph.q, ph.r);
      const dx = p.x - cc.x;
      const dy = p.y - cc.y;
      const d = Math.hypot(dx, dy) || 1;
      const minR = SAFEHOUSE_INNER_HIT_R + PLAYER_RADIUS * 0.25;
      if (d < minR && d > 1e-4) {
        setPlayerPos(cc.x + dx / d * minR, cc.y + dy / d * minR);
      }
    }
    function tickAlways(getIsLunatic) {
      tickSpentTileAnimDone();
      tickEmbedRevealFromWallClock(getIsLunatic);
    }
    function tick(o) {
      tickAlways(o.getIsLunatic);
      if (o.advanceFreezeClock && o.dt > 0 && !o.runDead()) {
        const p0 = o.getPlayer();
        const ph0 = o.worldToHex(p0.x, p0.y);
        if (o.isSafehouseHexTile(ph0.q, ph0.r)) safehouseClockFreeze += o.dt;
      }
      if (!o.runDead()) {
        updateSpendAfterLevelLeave(o.getPlayer, o.worldToHex, o.markProceduralSafehouseHexSpent);
        clampPlayerOutOfSpentCore(
          o.getPlayer,
          o.worldToHex,
          o.hexToWorld,
          o.isSafehouseHexSpentTile,
          o.setPlayerPos
        );
      }
      if (o.runDead() || o.innerGameplayFrozen()) return;
      const prim = o.getPrimarySafehouseAxial();
      if (prim && o.isSafehouseHexActiveTile(prim.q, prim.r) && o.safehouseModalEl) {
        const k = hexKey(prim.q, prim.r);
        const player = o.getPlayer();
        const ph = o.worldToHex(player.x, player.y);
        const c = o.hexToWorld(prim.q, prim.r);
        const dist = Math.hypot(player.x - c.x, player.y - c.y);
        const inInner = ph.q === prim.q && ph.r === prim.r && dist <= SAFEHOUSE_INNER_HIT_R;
        if (!inInner) {
          levelInnerLatch = false;
        } else if (!pausedForSafehousePrompt && !levelPromptShownKeys.has(k)) {
          if (!levelInnerLatch) {
            levelInnerLatch = true;
            levelPromptShownKeys.add(k);
            pausedForSafehousePrompt = true;
            o.clearKeys();
            o.safehouseModalEl.hidden = false;
          }
        }
      } else {
        levelInnerLatch = false;
      }
      const embedHitR = safehouseEmbedSiteHitRadiusWorld();
      const inset = o.hexSize * SAFEHOUSE_EMBED_CENTER_INSET;
      if (!o.getIsLunatic() && innerFacilitiesUnlocked && !embeddedForgeComplete) {
        const p2 = o.getPrimarySafehouseAxial();
        if (p2 && o.isSafehouseHexActiveTile(p2.q, p2.r)) {
          const player = o.getPlayer();
          const ph = o.worldToHex(player.x, player.y);
          if (ph.q !== p2.q || ph.r !== p2.r) forgeInnerExitLatch = false;
          else {
            const cc = o.hexToWorld(p2.q, p2.r);
            const e = o.hexToWorld(p2.q + o.HEX_DIRS[0].q, p2.r + o.HEX_DIRS[0].r);
            const lenE = Math.hypot(e.x - cc.x, e.y - cc.y) || 1;
            const fw = {
              x: cc.x + (e.x - cc.x) / lenE * inset,
              y: cc.y + (e.y - cc.y) / lenE * inset
            };
            const dist = Math.hypot(player.x - fw.x, player.y - fw.y);
            const inForge = dist <= embedHitR;
            if (inForge && !forgeInnerExitLatch) {
              forgeInnerExitLatch = true;
              o.openForgeWorldEmbedded();
            }
            if (!inForge) forgeInnerExitLatch = false;
          }
        }
      }
      if (!o.getIsLunatic() && innerFacilitiesUnlocked && !embeddedRouletteComplete) {
        const p3 = o.getPrimarySafehouseAxial();
        if (p3 && o.isSafehouseHexActiveTile(p3.q, p3.r)) {
          const player = o.getPlayer();
          const ph = o.worldToHex(player.x, player.y);
          if (ph.q !== p3.q || ph.r !== p3.r) {
            rouletteInnerExitLatch = false;
          } else {
            const cc = o.hexToWorld(p3.q, p3.r);
            const w = o.hexToWorld(p3.q + o.HEX_DIRS[3].q, p3.r + o.HEX_DIRS[3].r);
            const lenW = Math.hypot(w.x - cc.x, w.y - cc.y) || 1;
            const rw = {
              x: cc.x + (w.x - cc.x) / lenW * inset,
              y: cc.y + (w.y - cc.y) / lenW * inset
            };
            const d = Math.hypot(player.x - rw.x, player.y - rw.y);
            const inRainbow = d <= embedHitR;
            if (inRainbow && !rouletteInnerExitLatch) {
              rouletteInnerExitLatch = true;
              o.openRouletteEmbedded();
            }
            if (!inRainbow) rouletteInnerExitLatch = false;
          }
        }
      }
    }
    function getDifficultyClockSec(simElapsed) {
      return Math.max(0, simElapsed - safehouseClockFreeze);
    }
    function applyLevelUpAccepted(o) {
      o.onRunLevelIncrement();
      o.onSpawnAnchorResetToDifficultyClock(getDifficultyClockSec(o.getSimElapsed()));
      o.healPlayerToMax();
      if (!o.getIsLunatic()) embedRevealAtMs = performance.now() + 830;
      const prim = o.getPrimarySafehouseAxial();
      const tileK = prim ? hexKey(prim.q, prim.r) : "";
      if (tileK) {
        awaitingLeaveAfterLevelUp = true;
        levelUpTileKey = tileK;
      }
    }
    function closeLevelModal(safehouseModalEl, clearKeys) {
      pausedForSafehousePrompt = false;
      if (safehouseModalEl) safehouseModalEl.hidden = true;
      clearKeys();
    }
    return {
      resetSession,
      onTileCacheEvicted,
      onProceduralSafehousePlaced,
      onProceduralSafehouseSpent,
      tick,
      tickAlways,
      getDifficultyClockSec,
      isPausedForSafehousePrompt: () => pausedForSafehousePrompt,
      closeLevelModal,
      applyLevelUpAccepted,
      getInnerFacilitiesUnlocked: () => innerFacilitiesUnlocked,
      getEmbeddedRouletteComplete: () => embeddedRouletteComplete,
      getEmbeddedForgeComplete: () => embeddedForgeComplete,
      setEmbeddedRouletteComplete(v) {
        embeddedRouletteComplete = !!v;
      },
      setEmbeddedForgeComplete(v) {
        embeddedForgeComplete = !!v;
      },
      getSpentTileAnim: () => spentTileAnim,
      getSafehouseClockFreeze: () => safehouseClockFreeze
    };
  }

  // src/escape/WorldGeneration/eventTiles/innerHexZone.js
  var SQRT34 = Math.sqrt(3);
  function pointInsidePointyHex3(px, py, cx, cy, vertexRadius) {
    const dx = Math.abs(px - cx);
    const dy = Math.abs(py - cy);
    if (dx > SQRT34 / 2 * vertexRadius) return false;
    return dy <= vertexRadius - dx / SQRT34;
  }
  function innerInteractionVertexRadius(playerR) {
    return HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE + playerR;
  }
  var SEGMENT_INNER_STEPS = 22;
  function crossedIntoExpandedInnerHex(prevX, prevY, currX, currY, cx, cy, vr) {
    const prevIn = pointInsidePointyHex3(prevX, prevY, cx, cy, vr);
    const currIn = pointInsidePointyHex3(currX, currY, cx, cy, vr);
    if (currIn && !prevIn) return true;
    if (prevIn || currIn) return false;
    for (let i = 1; i < SEGMENT_INNER_STEPS; i++) {
      const t = i / SEGMENT_INNER_STEPS;
      const sx = prevX + (currX - prevX) * t;
      const sy = prevY + (currY - prevY) * t;
      if (pointInsidePointyHex3(sx, sy, cx, cy, vr)) return true;
    }
    return false;
  }
  function clampPlayerCenterToExpandedInnerHex(player, cx, cy, vr) {
    if (pointInsidePointyHex3(player.x, player.y, cx, cy, vr)) return;
    let lo = 0;
    let hi = 1;
    const px = player.x;
    const py = player.y;
    for (let k = 0; k < 22; k++) {
      const mid = (lo + hi) * 0.5;
      const tx = cx + (px - cx) * mid;
      const ty = cy + (py - cy) * mid;
      if (pointInsidePointyHex3(tx, ty, cx, cy, vr)) lo = mid;
      else hi = mid;
    }
    const t = Math.max(0, lo - 1e-5);
    player.x = cx + (px - cx) * t;
    player.y = cy + (py - cy) * t;
  }

  // src/escape/WorldGeneration/eventTiles/Arena.js
  function createArenaHexEvent(deps) {
    const {
      getSimElapsed,
      getPlayer,
      worldToHex,
      hexToWorld,
      isArenaHexInteractive,
      markProceduralArenaHexSpent,
      dropSpecialEventJokerReward,
      spawnHunter,
      cleanupArenaNexusSiegeCombat,
      clampArenaNexusDefendersOnRing,
      ejectHuntersFromArenaNexusDuringSiege,
      isCardPickupPaused = () => false
    } = deps;
    let phase = 0;
    let siegeQ = 0;
    let siegeR = 0;
    let siegeEndAt = 0;
    let nextLaserEnemyAt = 0;
    let nextSniperEnemyAt = 0;
    let cardRewardAt = 0;
    let arenaRewardPendingOnUnpause = false;
    function reset() {
      phase = 0;
      siegeQ = 0;
      siegeR = 0;
      siegeEndAt = 0;
      nextLaserEnemyAt = 0;
      nextSniperEnemyAt = 0;
      cardRewardAt = 0;
      arenaRewardPendingOnUnpause = false;
    }
    function worldCenter() {
      return hexToWorld(siegeQ, siegeR);
    }
    function beginSiege() {
      const player = getPlayer();
      const ph = worldToHex(player.x, player.y);
      siegeQ = ph.q;
      siegeR = ph.r;
      phase = 1;
      const elapsed = getSimElapsed();
      siegeEndAt = elapsed + ARENA_NEXUS_SIEGE_SEC;
      nextLaserEnemyAt = elapsed;
      nextSniperEnemyAt = elapsed + 0.12;
      const c = worldCenter();
      ejectHuntersFromArenaNexusDuringSiege(c.x, c.y);
      clampPlayerToInnerHex();
    }
    function finishSiege() {
      phase = 2;
      cleanupArenaNexusSiegeCombat();
      arenaRewardPendingOnUnpause = false;
      cardRewardAt = getSimElapsed() + ARENA_NEXUS_REWARD_MODAL_DELAY_SEC;
      markProceduralArenaHexSpent(siegeQ, siegeR);
    }
    function randomPointOnRing() {
      const { x: cx, y: cy } = worldCenter();
      const ang = Math.random() * TAU;
      const t = 0.15 + Math.random() * 0.85;
      const ringR = ARENA_NEXUS_RING_LO + t * (ARENA_NEXUS_RING_HI - ARENA_NEXUS_RING_LO);
      return { x: cx + Math.cos(ang) * ringR, y: cy + Math.sin(ang) * ringR };
    }
    function spawnRingLaserHunter() {
      const elapsed = getSimElapsed();
      const late = elapsed >= LATE_GAME_ELITE_SPAWN_SEC;
      const type = late && Math.random() < 0.38 ? "laserBlue" : "laser";
      const p = randomPointOnRing();
      spawnHunter(type, p.x, p.y, { arenaNexusSpawn: true });
    }
    function spawnRingSniperHunter() {
      const p = randomPointOnRing();
      spawnHunter("sniper", p.x, p.y, { arenaNexusSpawn: true });
    }
    function clampPlayerToInnerHex() {
      if (phase !== 1) return;
      const player = getPlayer();
      const { x: cx, y: cy } = worldCenter();
      clampPlayerCenterToExpandedInnerHex(player, cx, cy, innerInteractionVertexRadius(player.r));
    }
    function clampPlayerSegment(player) {
      if (phase !== 1) return;
      const { x: cx, y: cy } = worldCenter();
      clampPlayerCenterToExpandedInnerHex(player, cx, cy, innerInteractionVertexRadius(player.r));
    }
    function tick(dt = 1 / 60) {
      const elapsed = getSimElapsed();
      const player = getPlayer();
      const cardPaused = isCardPickupPaused();
      const ph = worldToHex(player.x, player.y);
      const pdt = Math.max(1e-5, dt);
      if (phase === 2 && cardRewardAt > 0 && elapsed >= cardRewardAt) {
        if (!cardPaused) {
          cardRewardAt = 0;
          arenaRewardPendingOnUnpause = false;
          dropSpecialEventJokerReward();
        } else {
          arenaRewardPendingOnUnpause = true;
        }
      }
      if (!cardPaused && phase === 2 && arenaRewardPendingOnUnpause) {
        arenaRewardPendingOnUnpause = false;
        cardRewardAt = 0;
        dropSpecialEventJokerReward();
      }
      if (phase === 2 && (ph.q !== siegeQ || ph.r !== siegeR)) {
        if (cardRewardAt > 0) {
          if (!cardPaused) {
            dropSpecialEventJokerReward();
            cardRewardAt = 0;
            arenaRewardPendingOnUnpause = false;
          } else {
            arenaRewardPendingOnUnpause = true;
            return;
          }
        }
        reset();
        return;
      }
      if (phase === 1) {
        while (elapsed >= nextLaserEnemyAt) {
          spawnRingLaserHunter();
          nextLaserEnemyAt += ARENA_NEXUS_RING_LASER_SPAWN_INTERVAL;
        }
        while (elapsed >= nextSniperEnemyAt) {
          spawnRingSniperHunter();
          nextSniperEnemyAt += ARENA_NEXUS_RING_SNIPER_SPAWN_INTERVAL;
        }
        if (elapsed >= siegeEndAt) finishSiege();
      }
      if (phase !== 0) return;
      if (!isArenaHexInteractive(ph.q, ph.r)) return;
      const c = hexToWorld(ph.q, ph.r);
      const vr = innerInteractionVertexRadius(player.r);
      const prevX = player.x - (player.velX || 0) * pdt;
      const prevY = player.y - (player.velY || 0) * pdt;
      if (pointInsidePointyHex3(player.x, player.y, c.x, c.y, vr) || crossedIntoExpandedInnerHex(prevX, prevY, player.x, player.y, c.x, c.y, vr)) {
        beginSiege();
      }
    }
    function postHunterTick() {
      if (phase === 1) {
        const c = worldCenter();
        ejectHuntersFromArenaNexusDuringSiege(c.x, c.y);
        clampArenaNexusDefendersOnRing(c.x, c.y);
      }
    }
    function getDrawState() {
      const elapsed = getSimElapsed();
      return {
        phase,
        siegeQ,
        siegeR,
        siegeEndAt,
        simElapsed: elapsed
      };
    }
    function getPhase() {
      return phase;
    }
    return {
      reset,
      tick,
      clampPlayerSegment,
      clampPlayerToInnerHex,
      postHunterTick,
      getDrawState,
      getPhase
    };
  }

  // src/escape/WorldGeneration/eventTiles/Gauntlet.js
  var SQRT35 = Math.sqrt(3);
  function createGauntletHexEvent(deps) {
    const {
      getSimElapsed,
      getPlayer,
      worldToHex,
      hexToWorld,
      isSurgeHexTile,
      isSurgeHexInteractive,
      markProceduralSurgeHexSpent,
      damagePlayer,
      bumpScreenShake,
      dropSpecialEventJokerReward,
      killHuntersOnSurgeHex,
      ejectHuntersFromSurgeLockHex,
      isCardPickupPaused = () => false
    } = deps;
    let phase = 0;
    let lockQ = 0;
    let lockR = 0;
    let wave = 1;
    let wasInSurgeHex = false;
    let awaitMode = "idle";
    let travelStartAt = 0;
    let travelDur = 1;
    let pauseEndAt = 0;
    let safeX = 0;
    let safeY = 0;
    let prevSafeX = 0;
    let prevSafeY = 0;
    let hasPrevSafeBubble = false;
    let eligibleForInnerExitReward = false;
    let rewardPendingOnUnpause = false;
    let wasInsideInnerRewardHex = false;
    let screenFlashUntil = 0;
    function reset() {
      phase = 0;
      lockQ = 0;
      lockR = 0;
      wave = 1;
      wasInSurgeHex = false;
      awaitMode = "idle";
      travelStartAt = 0;
      travelDur = 1;
      pauseEndAt = 0;
      safeX = 0;
      safeY = 0;
      prevSafeX = 0;
      prevSafeY = 0;
      hasPrevSafeBubble = false;
      eligibleForInnerExitReward = false;
      rewardPendingOnUnpause = false;
      wasInsideInnerRewardHex = false;
      screenFlashUntil = 0;
    }
    function travelDurationForWave(w) {
      return Math.max(0.05, SURGE_TRAVEL_DUR_FIRST - SURGE_TRAVEL_DUR_DECREMENT_PER_WAVE * (w - 1));
    }
    function lockTileMaxCenterDistPx() {
      const player = getPlayer();
      return Math.max(6, ARENA_NEXUS_INNER_APOTHEM - player.r - 0.75);
    }
    function outerWaitingMaxCenterDistPx() {
      const player = getPlayer();
      return Math.max(6, HEX_SIZE * (SQRT35 / 2) - player.r - 1.5);
    }
    function pickSafeAndPulseFrom(q, r) {
      const tc = hexToWorld(q, r);
      const apo = HEX_SIZE * (SQRT35 / 2) * 0.72;
      const maxSafeCenterDist = Math.max(10, lockTileMaxCenterDistPx() - SURGE_GAUNTLET_SAFE_HIT_R - 8);
      const distCap = Math.min(apo * 0.69, maxSafeCenterDist);
      const minSep = SURGE_GAUNTLET_MIN_CENTER_SEP_PX;
      const inPlayDisc = (sx2, sy2) => Math.hypot(sx2 - tc.x, sy2 - tc.y) <= maxSafeCenterDist + 1e-3;
      const farEnoughFromPrev = (sx2, sy2) => {
        if (!hasPrevSafeBubble) return true;
        return Math.hypot(sx2 - prevSafeX, sy2 - prevSafeY) >= minSep - 1e-3;
      };
      let sx = tc.x;
      let sy = tc.y;
      let found = false;
      for (let a = 0; a < 56; a++) {
        const ang = Math.random() * TAU;
        const dist = (0.14 + Math.random() * 0.55) / 0.69 * distCap;
        const tx = tc.x + Math.cos(ang) * dist;
        const ty = tc.y + Math.sin(ang) * dist;
        if (inPlayDisc(tx, ty) && farEnoughFromPrev(tx, ty)) {
          sx = tx;
          sy = ty;
          found = true;
          break;
        }
      }
      if (!found && hasPrevSafeBubble) {
        const px = prevSafeX;
        const py = prevSafeY;
        for (let i = 0; i < 40; i++) {
          const ang = i / 40 * TAU;
          const tx = px + Math.cos(ang) * minSep;
          const ty = py + Math.sin(ang) * minSep;
          if (inPlayDisc(tx, ty) && farEnoughFromPrev(tx, ty)) {
            sx = tx;
            sy = ty;
            found = true;
            break;
          }
        }
      }
      if (!found && hasPrevSafeBubble) {
        const vx = tc.x - prevSafeX;
        const vy = tc.y - prevSafeY;
        const vlen = Math.hypot(vx, vy) || 1;
        const ux = vx / vlen;
        const uy = vy / vlen;
        for (let s = maxSafeCenterDist; s >= minSep * 0.4; s -= maxSafeCenterDist * 0.07) {
          const tx = tc.x + ux * s;
          const ty = tc.y + uy * s;
          if (inPlayDisc(tx, ty) && farEnoughFromPrev(tx, ty)) {
            sx = tx;
            sy = ty;
            found = true;
            break;
          }
        }
      }
      if (!found && hasPrevSafeBubble) {
        for (let b = 0; b < 48; b++) {
          const ang = Math.random() * TAU;
          const dist = (0.3 + Math.random() * 0.7) * distCap;
          const tx = tc.x + Math.cos(ang) * dist;
          const ty = tc.y + Math.sin(ang) * dist;
          if (inPlayDisc(tx, ty) && farEnoughFromPrev(tx, ty)) {
            sx = tx;
            sy = ty;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        const ang = Math.random() * TAU;
        const dist = (0.14 + Math.random() * 0.55) / 0.69 * distCap;
        sx = tc.x + Math.cos(ang) * dist;
        sy = tc.y + Math.sin(ang) * dist;
      }
      safeX = sx;
      safeY = sy;
      prevSafeX = sx;
      prevSafeY = sy;
      hasPrevSafeBubble = true;
    }
    function beginTravelWave() {
      pickSafeAndPulseFrom(lockQ, lockR);
      travelDur = travelDurationForWave(wave);
      travelStartAt = getSimElapsed();
      awaitMode = "travel";
    }
    function hitNow() {
      const elapsed = getSimElapsed();
      screenFlashUntil = elapsed + SURGE_TILE_FLASH_SEC;
      bumpScreenShake(12, 0.18);
      const player = getPlayer();
      const inSafe = Math.hypot(player.x - safeX, player.y - safeY) <= SURGE_GAUNTLET_SAFE_HIT_R;
      if (!inSafe) damagePlayer(SURGE_TILE_DAMAGE, { surgeHexPulse: true });
    }
    function beginOuterLock(q, r) {
      phase = 1;
      lockQ = q;
      lockR = r;
      wave = 1;
      hasPrevSafeBubble = false;
      eligibleForInnerExitReward = false;
      rewardPendingOnUnpause = false;
      wasInsideInnerRewardHex = false;
      killHuntersOnSurgeHex(q, r);
      awaitMode = "idle";
      screenFlashUntil = 0;
      clampPlayerToLockHex();
    }
    function beginGauntletActive() {
      phase = 2;
      wave = 1;
      hasPrevSafeBubble = false;
      eligibleForInnerExitReward = false;
      rewardPendingOnUnpause = false;
      wasInsideInnerRewardHex = false;
      clampPlayerToLockHex();
      beginTravelWave();
    }
    function clampPlayerToLockHex() {
      clampPlayerToLockHexFor(getPlayer());
    }
    function clampPlayerSegment(player) {
      clampPlayerToLockHexFor(player);
    }
    function clampPlayerToLockHexFor(player) {
      if (phase !== 1 && phase !== 2) return;
      const ph = worldToHex(player.x, player.y);
      if (ph.q !== lockQ || ph.r !== lockR) return;
      const c = hexToWorld(ph.q, ph.r);
      const maxD = phase === 1 ? outerWaitingMaxCenterDistPx() : lockTileMaxCenterDistPx();
      const dx = player.x - c.x;
      const dy = player.y - c.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d <= maxD) return;
      player.x = c.x + dx / d * maxD;
      player.y = c.y + dy / d * maxD;
    }
    function tick(dt = 1 / 60) {
      const elapsed = getSimElapsed();
      const player = getPlayer();
      const cardPaused = isCardPickupPaused();
      const pdt = Math.max(1e-5, dt);
      if (!cardPaused && phase === 3 && rewardPendingOnUnpause) {
        rewardPendingOnUnpause = false;
        dropSpecialEventJokerReward();
        phase = 4;
      }
      const ph = worldToHex(player.x, player.y);
      const inSurge = isSurgeHexTile(ph.q, ph.r);
      if (!inSurge) {
        wasInSurgeHex = false;
        if (phase === 4) {
          phase = 0;
        } else if (phase === 3) {
          rewardPendingOnUnpause = false;
          phase = 0;
          awaitMode = "travel";
          wave = 1;
          screenFlashUntil = 0;
          hasPrevSafeBubble = false;
          eligibleForInnerExitReward = false;
          wasInsideInnerRewardHex = false;
        } else if (phase === 1 || phase === 2) {
          phase = 0;
          awaitMode = "travel";
          wave = 1;
          screenFlashUntil = 0;
          hasPrevSafeBubble = false;
          eligibleForInnerExitReward = false;
          rewardPendingOnUnpause = false;
          wasInsideInnerRewardHex = false;
        }
        return;
      }
      const enteredThisFrame = inSurge && !wasInSurgeHex;
      wasInSurgeHex = true;
      if (enteredThisFrame && phase === 0 && isSurgeHexInteractive(ph.q, ph.r)) {
        beginOuterLock(ph.q, ph.r);
      }
      if (phase === 1 && ph.q === lockQ && ph.r === lockR) {
        const c = hexToWorld(lockQ, lockR);
        const vr = innerInteractionVertexRadius(player.r);
        const prevX = player.x - (player.velX || 0) * pdt;
        const prevY = player.y - (player.velY || 0) * pdt;
        if (pointInsidePointyHex3(player.x, player.y, c.x, c.y, vr) || crossedIntoExpandedInnerHex(prevX, prevY, player.x, player.y, c.x, c.y, vr)) {
          beginGauntletActive();
        }
      }
      if (phase === 3 && ph.q === lockQ && ph.r === lockR) {
        const c = hexToWorld(lockQ, lockR);
        const vr = innerInteractionVertexRadius(player.r);
        const prevX = player.x - (player.velX || 0) * pdt;
        const prevY = player.y - (player.velY || 0) * pdt;
        const insideInner = pointInsidePointyHex3(player.x, player.y, c.x, c.y, vr);
        const crossedIntoInner = eligibleForInnerExitReward && (crossedIntoExpandedInnerHex(prevX, prevY, player.x, player.y, c.x, c.y, vr) || insideInner && !wasInsideInnerRewardHex);
        wasInsideInnerRewardHex = insideInner;
        if (crossedIntoInner) {
          eligibleForInnerExitReward = false;
          if (cardPaused) {
            rewardPendingOnUnpause = true;
          } else {
            dropSpecialEventJokerReward();
            phase = 4;
          }
        }
      }
      if (phase !== 2) return;
      if (ph.q !== lockQ || ph.r !== lockR) return;
      if (awaitMode === "travel") {
        const u = (elapsed - travelStartAt) / Math.max(1e-4, travelDur);
        if (u >= 1) {
          hitNow();
          pauseEndAt = elapsed + SURGE_WAVE_PAUSE_SEC;
          awaitMode = "pause";
        }
      } else if (awaitMode === "pause" && elapsed >= pauseEndAt) {
        wave += 1;
        if (wave > SURGE_HEX_WAVES) {
          phase = 3;
          awaitMode = "idle";
          rewardPendingOnUnpause = false;
          markProceduralSurgeHexSpent(lockQ, lockR);
          const c = hexToWorld(lockQ, lockR);
          const vr = innerInteractionVertexRadius(player.r);
          const insideNow = pointInsidePointyHex3(player.x, player.y, c.x, c.y, vr);
          wasInsideInnerRewardHex = insideNow;
          if (insideNow) {
            eligibleForInnerExitReward = false;
            if (cardPaused) {
              rewardPendingOnUnpause = true;
            } else {
              dropSpecialEventJokerReward();
              phase = 4;
            }
          } else {
            eligibleForInnerExitReward = true;
          }
        } else {
          beginTravelWave();
        }
      }
    }
    function postHunterTick() {
      ejectHuntersFromSurgeLockHex(lockQ, lockR, phase);
    }
    function getDrawState() {
      const elapsed = getSimElapsed();
      return {
        phase,
        lockQ,
        lockR,
        safeX,
        safeY,
        travelStartAt,
        travelDur,
        simElapsed: elapsed
      };
    }
    function getScreenFlashUntil() {
      return screenFlashUntil;
    }
    function getPhase() {
      return phase;
    }
    function isSurgeLockBarrierWorldPoint(px, py) {
      if (phase !== 1 && phase !== 2 && phase !== 3) return false;
      const h = worldToHex(px, py);
      if (h.q !== lockQ || h.r !== lockR) return false;
      const c = hexToWorld(h.q, h.r);
      return Math.hypot(px - c.x, py - c.y) <= HEX_SIZE + 4;
    }
    return {
      reset,
      tick,
      clampPlayerSegment,
      clampPlayerToLockHex,
      postHunterTick,
      getDrawState,
      getScreenFlashUntil,
      getPhase,
      isSurgeLockBarrierWorldPoint
    };
  }

  // src/escape/WorldGeneration/eventTiles/eventController.js
  function createEventHexController(deps) {
    const cardPaused = deps.isCardPickupPaused ?? (() => false);
    const arena = createArenaHexEvent({
      getSimElapsed: deps.getSimElapsed,
      getPlayer: deps.getPlayer,
      worldToHex: deps.worldToHex,
      hexToWorld: deps.hexToWorld,
      isArenaHexInteractive: deps.isArenaHexInteractive,
      markProceduralArenaHexSpent: deps.markProceduralArenaHexSpent,
      dropSpecialEventJokerReward: deps.dropSpecialEventJokerReward,
      spawnHunter: deps.spawnHunter,
      cleanupArenaNexusSiegeCombat: deps.cleanupArenaNexusSiegeCombat,
      clampArenaNexusDefendersOnRing: deps.clampArenaNexusDefendersOnRing,
      ejectHuntersFromArenaNexusDuringSiege: deps.ejectHuntersFromArenaNexusDuringSiege,
      isCardPickupPaused: cardPaused
    });
    const gauntlet = createGauntletHexEvent({
      getSimElapsed: deps.getSimElapsed,
      getPlayer: deps.getPlayer,
      worldToHex: deps.worldToHex,
      hexToWorld: deps.hexToWorld,
      isSurgeHexTile: deps.isSurgeHexTile,
      isSurgeHexInteractive: deps.isSurgeHexInteractive,
      markProceduralSurgeHexSpent: deps.markProceduralSurgeHexSpent,
      damagePlayer: deps.damagePlayer,
      bumpScreenShake: deps.bumpScreenShake,
      dropSpecialEventJokerReward: deps.dropSpecialEventJokerReward,
      killHuntersOnSurgeHex: deps.killHuntersOnSurgeHex,
      ejectHuntersFromSurgeLockHex: deps.ejectHuntersFromSurgeLockHex,
      isCardPickupPaused: cardPaused
    });
    function reset() {
      arena.reset();
      gauntlet.reset();
    }
    function tick(dt) {
      if (deps.getRunDead() || !deps.specialsUnpaused()) return;
      arena.tick(dt);
      gauntlet.tick(dt);
    }
    function postHunterTick() {
      if (deps.getRunDead()) return;
      arena.postHunterTick();
      gauntlet.postHunterTick();
    }
    function clampPlayer(player) {
      arena.clampPlayerSegment(player);
      gauntlet.clampPlayerSegment(player);
    }
    return {
      reset,
      tick,
      postHunterTick,
      clampPlayer,
      getArenaDrawState: () => arena.getDrawState(),
      getSurgeDrawState: () => gauntlet.getDrawState(),
      getSurgeScreenFlashUntil: () => gauntlet.getScreenFlashUntil(),
      isSurgeLockBarrierWorldPoint: (x, y) => gauntlet.isSurgeLockBarrierWorldPoint(x, y)
    };
  }

  // src/escape/items/jokerEventReward.js
  var JOKER_REWARD_PICKUP_SOURCE = "specialEventHex";
  function makeJokerEventRewardCard(characterId = "knight") {
    const ranks = [10, 11, 12, 13];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    const sourceSuits = ["diamonds", "hearts", "clubs", "spades"];
    const effectBorrowedSuit = sourceSuits[Math.floor(Math.random() * sourceSuits.length)];
    const ctx = {
      characterId,
      diamondCooldownAbilityIds: ["dash", "burst", "decoy"]
    };
    return {
      id: `joker-event-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      suit: "joker",
      rank,
      effectBorrowedSuit,
      effect: makeDefaultCardEffect(effectBorrowedSuit, rank, ctx),
      pickupSource: JOKER_REWARD_PICKUP_SOURCE
    };
  }
  function dropJokerRewardFromSpecialEvent(deps) {
    const { getCharacterId, openCardPickup } = deps;
    const card = makeJokerEventRewardCard(getCharacterId());
    openCardPickup(card);
  }

  // src/escape/Hunters/hunterDraw.js
  var FROG_SPLASH_GROW_SEC = 0.88;
  function frogMudPoolGrowScale(bornAt, now) {
    const u = clamp7((now - bornAt) / FROG_SPLASH_GROW_SEC, 0, 1);
    return 1 - Math.pow(1 - u, 2.45);
  }
  function hunterPalette(type) {
    switch (type) {
      case "chaser":
        return { light: "#fecaca", core: "#dc2626", shadow: "#7f1d1d", rim: "#fca5a5", mark: "#fff1f2" };
      case "frogChaser":
        return { light: "#86efac", core: "#166534", shadow: "#14532d", rim: "#4ade80", mark: "#ecfccb" };
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
      case "cryptSpawner":
        return { light: "#f8fafc", core: "#e2e8f0", shadow: "#475569", rim: "#f1f5f9", mark: "#ffffff" };
      case "ranged":
        return { light: "#bae6fd", core: "#0284c7", shadow: "#0c4a6e", rim: "#38bdf8", mark: "#f0f9ff" };
      case "fast":
        return { light: "#fed7aa", core: "#ea580c", shadow: "#7c2d12", rim: "#fb923c", mark: "#fff7ed" };
      case "ghost":
        return { light: "#f3f4f6", core: "#cbd5e1", shadow: "#6b7280", rim: "#e5e7eb", mark: "#ffffff" };
      default:
        return { light: "#ddd6fe", core: "#7c3aed", shadow: "#3b0764", rim: "#c4b5fd", mark: "#f5f3ff" };
    }
  }
  function drawHunterBody(ctx, h, opts = {}) {
    if (h.type === "cryptSpawner" && h.cryptDisguised) {
      const s = 35;
      const pulse = 0.5 + 0.5 * Math.sin((Number(h.bornAt ?? 0) + h.x * 0.01 + h.y * 0.01) * 4.2);
      ctx.save();
      ctx.fillStyle = "#1b1d24";
      ctx.strokeStyle = "#8b95a8";
      ctx.lineWidth = 2;
      ctx.fillRect(h.x - s / 2, h.y - s / 2, s, s);
      ctx.strokeRect(h.x - s / 2, h.y - s / 2, s, s);
      ctx.strokeStyle = `rgba(226, 232, 240, ${0.18 + pulse * 0.18})`;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(h.x - s / 2 + 1.8, h.y - s / 2 + 1.8, s - 3.6, s - 3.6);
      ctx.restore();
      return;
    }
    const boneSwarmGhostFast = h.type === "fast" && !!h.boneSwarmPhasing;
    const swampMudFast = h.type === "fast" && !!h.swampMudSpawn;
    const colourblind = !!opts.colourblind;
    const pal = colourblind ? { light: "#9ca89a", core: "#5a6658", shadow: "#3a4239", rim: "#6b7569", mark: "#b4c0b0" } : boneSwarmGhostFast ? { light: "#f8fafc", core: "#cbd5e1", shadow: "#64748b", rim: "#e2e8f0", mark: "#ffffff" } : swampMudFast ? { light: "#5c4a3a", core: "#342a1f", shadow: "#120e0a", rim: "#3d3024", mark: "#2a2218" } : hunterPalette(h.type);
    const { x, y, r } = h;
    const alpha = clamp7(Number(h.opacity ?? 1), 0, 1);
    const cryptRevealU = h.type === "cryptSpawner" ? clamp7(Number(h.cryptRevealU ?? 1), 0, 1) : 1;
    const cryptRevealPulse = h.type === "cryptSpawner" ? 1 + (1 - cryptRevealU) * 0.22 : 1;
    const ghostTelegraph = h.type === "ghost" && (h.ghostPhase === "telegraph1" || h.ghostPhase === "telegraph2");
    const teleU = ghostTelegraph ? clamp7(Number(h.ghostTelegraphU ?? 0), 0, 1) : 0;
    const rBase = ghostTelegraph ? r * (1 - 0.12 * Math.sin(teleU * Math.PI)) : r;
    const rBody = rBase * cryptRevealPulse;
    if (h.type === "ghost" && Array.isArray(h.motionTrail)) {
      for (const tr of h.motionTrail) {
        const ta = clamp7(Number(tr.alpha ?? 0), 0, 1) * 0.55 * alpha;
        if (ta <= 0.01) continue;
        drawCircle2(ctx, tr.x, tr.y, tr.r ?? r, "#9ca3af", ta);
      }
    }
    if (ghostTelegraph) {
      const dx = Number(h.ghostDashDir?.x ?? 1);
      const dy = Number(h.ghostDashDir?.y ?? 0);
      const lenFull = Math.max(40, Number(h.ghostTelegraphLineLen ?? 200));
      const len = lenFull * Math.max(1e-3, teleU);
      const x2 = x + dx * len;
      const y2 = y + dy * len;
      const lineA = 0.42 + teleU * 0.48;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = `rgba(226, 232, 240, ${lineA})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(148, 163, 184, ${lineA * 0.38})`;
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }
    if (h.type === "ghost") {
      const aura = clamp7(Number(h.ghostAura ?? 0.75), 0, 1);
      drawCircle2(ctx, x, y, rBody + 11 + aura * 3, "#cbd5e1", 0.13 + aura * 0.08);
      drawCircle2(ctx, x, y, rBody + 6 + aura * 2, "#94a3b8", 0.1 + aura * 0.06);
    }
    if (boneSwarmGhostFast) {
      const pulse = 0.5 + 0.5 * Math.sin((Number(h.bornAt ?? 0) + x * 0.01 + y * 0.01) * 6);
      drawCircle2(ctx, x, y, rBody + 6 + pulse * 3, "#e2e8f0", 0.16 + pulse * 0.12);
      drawCircle2(ctx, x, y, rBody + 2 + pulse * 1.5, "#cbd5e1", 0.18 + pulse * 0.14);
    }
    if (h.type === "cryptSpawner" && cryptRevealU < 1) {
      const flash = 1 - cryptRevealU;
      drawCircle2(ctx, x, y, rBody + 24 + flash * 11, "#ffffff", 0.1 + flash * 0.24);
      drawCircle2(ctx, x, y, rBody + 15 + flash * 8, "#e2e8f0", 0.14 + flash * 0.2);
    }
    if (h.type === "cryptSpawner") {
      const pulse = 0.5 + 0.5 * Math.sin((Number(h.cryptRevealU ?? 1) + x * 4e-3 + y * 4e-3) * 8.5);
      drawCircle2(ctx, x, y, rBody + 9 + pulse * 3, "#cbd5e1", 0.12 + pulse * 0.1);
      drawCircle2(ctx, x, y, rBody + 4 + pulse * 2, "#f8fafc", 0.08 + pulse * 0.08);
    }
    const g = ctx.createRadialGradient(x - rBody * 0.38, y - rBody * 0.42, rBody * 0.08, x, y, rBody);
    g.addColorStop(0, pal.light);
    g.addColorStop(0.55, pal.core);
    g.addColorStop(1, pal.shadow);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, rBody, 0, TAU);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = pal.rim;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (h.fireGlow) {
      ctx.strokeStyle = "rgba(248, 113, 113, 0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, rBody + 4.5, 0, TAU);
      ctx.stroke();
    }
    const mx = h.dir.x * rBody * 0.38;
    const my = h.dir.y * rBody * 0.38;
    ctx.fillStyle = pal.mark;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(x + mx, y + my, rBody * 0.22, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  function drawCircle2(ctx, x, y, r, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  function drawProjectileBody(ctx, p) {
    if (p.fireCone) {
      const gFire = ctx.createRadialGradient(p.x - p.r * 0.32, p.y - p.r * 0.32, 0.5, p.x, p.y, p.r);
      gFire.addColorStop(0, "#fee2e2");
      gFire.addColorStop(0.4, "#fb7185");
      gFire.addColorStop(1, "#7f1d1d");
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.fillStyle = gFire;
      ctx.fill();
      ctx.strokeStyle = "rgba(248, 113, 113, 0.9)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
      return;
    }
    const g = ctx.createRadialGradient(p.x - 1, p.y - 1, 0.5, p.x, p.y, p.r);
    g.addColorStop(0, "#fef3c7");
    g.addColorStop(0.4, "#f59e0b");
    g.addColorStop(1, "#b45309");
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, TAU);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }
  function drawLaserBeamFancy(ctx, beam, now) {
    const x1 = beam.x1;
    const y1 = beam.y1;
    const x2 = beam.x2;
    const y2 = beam.y2;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const blue = !!beam.blueLaser;
    const boneGhostGrey = !!beam.boneGhostBeam && !blue;
    const boneGhostPaleBlue = !!beam.boneGhostBlueBeam && blue;
    const pulse = 0.5 + 0.5 * Math.sin(now * (beam.warning ? 26 : 16));
    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(ang);
    ctx.lineCap = "round";
    if (beam.warning) {
      const t = clamp7((now - beam.bornAt) / Math.max(1e-3, beam.expiresAt - beam.bornAt), 0, 1);
      const fade = 0.42 + 0.48 * (1 - t * 0.4);
      if (boneGhostPaleBlue) {
        ctx.shadowBlur = 22;
        ctx.shadowColor = "rgba(186, 230, 253, 0.65)";
        const gWide = ctx.createLinearGradient(0, 0, len, 0);
        gWide.addColorStop(0, `rgba(255, 255, 255, ${0.16 * fade})`);
        gWide.addColorStop(0.35, `rgba(224, 242, 254, ${0.42 * fade + 0.14 * pulse})`);
        gWide.addColorStop(1, `rgba(125, 211, 252, ${0.36 * fade})`);
        ctx.strokeStyle = gWide;
        ctx.lineWidth = 11 + pulse * 5;
        ctx.setLineDash([16, 9]);
        ctx.lineDashOffset = -now * 130;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(len, 0);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + 0.38 * pulse})`;
        ctx.lineWidth = 3.2 + pulse * 1.8;
        ctx.setLineDash([9, 11]);
        ctx.lineDashOffset = now * 100;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      } else if (boneGhostGrey) {
        ctx.shadowBlur = 18;
        ctx.shadowColor = "rgba(203, 213, 225, 0.55)";
        const gWide = ctx.createLinearGradient(0, 0, len, 0);
        gWide.addColorStop(0, `rgba(248, 250, 252, ${0.12 * fade})`);
        gWide.addColorStop(0.35, `rgba(226, 232, 240, ${0.4 * fade + 0.14 * pulse})`);
        gWide.addColorStop(1, `rgba(100, 116, 139, ${0.34 * fade})`);
        ctx.strokeStyle = gWide;
        ctx.lineWidth = 11 + pulse * 5;
        ctx.setLineDash([16, 9]);
        ctx.lineDashOffset = -now * 130;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(len, 0);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.34 + 0.4 * pulse})`;
        ctx.lineWidth = 3.2 + pulse * 1.8;
        ctx.setLineDash([9, 11]);
        ctx.lineDashOffset = now * 100;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      } else {
        ctx.shadowBlur = blue ? 20 : 16;
        ctx.shadowColor = blue ? "rgba(56, 189, 248, 0.75)" : "rgba(248, 113, 113, 0.7)";
        const gWide = ctx.createLinearGradient(0, 0, len, 0);
        if (blue) {
          gWide.addColorStop(0, `rgba(191, 219, 254, ${0.12 * fade})`);
          gWide.addColorStop(0.35, `rgba(96, 165, 250, ${0.38 * fade + 0.12 * pulse})`);
          gWide.addColorStop(1, `rgba(30, 64, 175, ${0.35 * fade})`);
        } else {
          gWide.addColorStop(0, `rgba(254, 226, 226, ${0.14 * fade})`);
          gWide.addColorStop(0.35, `rgba(248, 113, 113, ${0.42 * fade + 0.18 * pulse})`);
          gWide.addColorStop(1, `rgba(127, 29, 29, ${0.38 * fade})`);
        }
        ctx.strokeStyle = gWide;
        ctx.lineWidth = 11 + pulse * 5;
        ctx.setLineDash([16, 9]);
        ctx.lineDashOffset = -now * 130;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(len, 0);
        ctx.stroke();
        ctx.strokeStyle = blue ? `rgba(224, 242, 254, ${0.35 + 0.4 * pulse})` : `rgba(254, 249, 239, ${0.38 + 0.42 * pulse})`;
        ctx.lineWidth = 3.2 + pulse * 1.8;
        ctx.setLineDash([9, 11]);
        ctx.lineDashOffset = now * 100;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      }
    } else if (boneGhostPaleBlue) {
      ctx.shadowBlur = 26;
      ctx.shadowColor = "rgba(186, 230, 253, 0.75)";
      const gBody = ctx.createLinearGradient(0, 0, len, 0);
      gBody.addColorStop(0, "rgba(255, 255, 255, 0.96)");
      gBody.addColorStop(0.2, "rgba(240, 249, 255, 0.96)");
      gBody.addColorStop(0.45, "rgba(186, 230, 253, 0.95)");
      gBody.addColorStop(0.72, "rgba(125, 211, 252, 0.92)");
      gBody.addColorStop(1, "rgba(56, 189, 248, 0.78)");
      ctx.strokeStyle = gBody;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (boneGhostGrey) {
      ctx.shadowBlur = 22;
      ctx.shadowColor = "rgba(226, 232, 240, 0.7)";
      const gBody = ctx.createLinearGradient(0, 0, len, 0);
      gBody.addColorStop(0, "rgba(255, 255, 255, 0.96)");
      gBody.addColorStop(0.22, "rgba(241, 245, 249, 0.96)");
      gBody.addColorStop(0.5, "rgba(203, 213, 225, 0.95)");
      gBody.addColorStop(0.78, "rgba(148, 163, 184, 0.9)");
      gBody.addColorStop(1, "rgba(71, 85, 105, 0.82)");
      ctx.strokeStyle = gBody;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      ctx.shadowBlur = blue ? 28 : 24;
      ctx.shadowColor = blue ? "rgba(56, 189, 248, 0.85)" : "rgba(251, 113, 133, 0.8)";
      const gBody = ctx.createLinearGradient(0, 0, len, 0);
      if (blue) {
        gBody.addColorStop(0, "rgba(224, 231, 255, 0.98)");
        gBody.addColorStop(0.22, "rgba(96, 165, 250, 0.98)");
        gBody.addColorStop(0.55, "rgba(37, 99, 235, 0.96)");
        gBody.addColorStop(1, "rgba(23, 37, 84, 0.9)");
      } else {
        gBody.addColorStop(0, "rgba(255, 251, 235, 0.98)");
        gBody.addColorStop(0.18, "rgba(251, 191, 36, 0.96)");
        gBody.addColorStop(0.48, "rgba(248, 113, 113, 0.98)");
        gBody.addColorStop(0.82, "rgba(220, 38, 38, 0.95)");
        gBody.addColorStop(1, "rgba(88, 28, 28, 0.88)");
      }
      ctx.strokeStyle = gBody;
      ctx.lineWidth = blue ? 9 : 10;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }
  function drawArtilleryDetonationBang(ctx, zone, u) {
    const { x, y, r } = zone;
    const fade = 1 - u * u;
    const coreR = r * (0.5 + 0.2 * (1 - u));
    drawCircle2(ctx, x, y, coreR, "#fef3c7", 0.38 * fade);
    drawCircle2(ctx, x, y, coreR * 0.42, "#fffbeb", 0.48 * fade);
    const ringR = r * (0.4 + u * 1.25);
    ctx.save();
    ctx.strokeStyle = `rgba(254, 215, 170, ${0.72 * fade})`;
    ctx.lineWidth = 2.6 * (1 - u * 0.45);
    ctx.beginPath();
    ctx.arc(x, y, ringR, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  function drawDangerZones(ctx, dangerZones, now, sniperBangDuration) {
    for (const zone of dangerZones) {
      const zu = zone.windup != null ? zone.windup : 0.8;
      const life = clamp7((now - zone.bornAt) / zu, 0, 1);
      const lingering = zone.exploded && now < (zone.lingerUntil ?? zone.detonateAt);
      const tSinceDet = now - zone.detonateAt;
      const inBang = zone.exploded && lingering && tSinceDet < sniperBangDuration;
      if (!zone.exploded) {
        const pulse = 1 + Math.sin(now * 20) * 0.08;
        const radius = zone.r * pulse;
        const firePath = !!zone.firePath;
        drawCircle2(ctx, zone.x, zone.y, radius, firePath ? "#dc2626" : "#ef4444", 0.25 + life * 0.4);
        ctx.strokeStyle = firePath ? "#fb7185" : "#f87171";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, radius, 0, TAU);
        ctx.stroke();
        if (firePath) {
          const inner = radius * (0.58 + 0.08 * Math.sin(now * 9));
          drawCircle2(ctx, zone.x, zone.y, inner, "#fb7185", 0.16 + 0.1 * life);
          ctx.strokeStyle = "rgba(254, 226, 226, 0.55)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, radius * 0.78, 0, TAU);
          ctx.stroke();
        }
      } else if (lingering) {
        const r = zone.r;
        const firePath = !!zone.firePath;
        drawCircle2(ctx, zone.x, zone.y, r, firePath ? "#991b1b" : "#9f1239", firePath ? 0.46 : 0.38);
        ctx.strokeStyle = firePath ? "rgba(251, 113, 133, 0.95)" : "rgba(248, 113, 113, 0.95)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, r, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = "rgba(254, 202, 202, 0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, r * 0.72, 0, TAU);
        ctx.stroke();
        if (firePath) {
          const swirl = now * 2.6;
          const ringR = r * (0.5 + 0.08 * Math.sin(now * 7));
          ctx.strokeStyle = "rgba(252, 165, 165, 0.45)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, ringR, swirl, swirl + Math.PI * 1.5);
          ctx.stroke();
          ctx.strokeStyle = "rgba(254, 242, 242, 0.28)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, r * 0.9, -swirl * 0.9, -swirl * 0.9 + Math.PI * 1.2);
          ctx.stroke();
        }
        if (inBang) {
          const u = clamp7(tSinceDet / sniperBangDuration, 0, 1);
          drawArtilleryDetonationBang(ctx, zone, u);
        }
      }
    }
  }
  function drawSniperFireArcs(ctx, fireArcs, now) {
    for (const arc of fireArcs) {
      const t = clamp7((now - arc.bornAt) / Math.max(1e-3, arc.life), 0, 1);
      const fade = 1 - t * 0.35;
      const start = arc.a - arc.halfA;
      const end = arc.a + arc.halfA;
      const outerR = arc.radius + arc.width * 0.52;
      const innerR = Math.max(1, arc.radius - arc.width * 0.52);
      ctx.save();
      ctx.fillStyle = `rgba(251, 113, 133, ${0.72 * fade})`;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "rgba(220, 38, 38, 0.65)";
      ctx.beginPath();
      ctx.arc(arc.x, arc.y, outerR, start, end);
      ctx.arc(arc.x, arc.y, innerR, end, start, true);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(251, 113, 133, ${0.98 * fade})`;
      ctx.lineWidth = Math.max(2, arc.width * 0.34);
      ctx.beginPath();
      ctx.arc(arc.x, arc.y, outerR, start, end);
      ctx.stroke();
      ctx.strokeStyle = `rgba(254, 226, 226, ${0.92 * fade})`;
      ctx.lineWidth = Math.max(1.5, arc.width * 0.2);
      ctx.beginPath();
      ctx.arc(arc.x, arc.y, innerR, start, end);
      ctx.stroke();
      ctx.restore();
    }
  }
  function drawSwampPools(ctx, pools, now) {
    for (const p of pools) {
      const life = clamp7((now - p.bornAt) / Math.max(1e-3, p.expiresAt - p.bornAt), 0, 1);
      const fade = 1 - life * 0.75;
      const pulse = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(now * 5 + p.x * 0.01 + p.y * 0.01));
      const R = p.r;
      if (p.frogMudPool) {
        ctx.save();
        const grow = frogMudPoolGrowScale(p.bornAt, now);
        const drawR = Math.max(2, R * grow);
        const g = ctx.createRadialGradient(p.x, p.y - drawR * 0.12, drawR * 0.06, p.x, p.y, drawR);
        g.addColorStop(0, `rgba(36, 44, 30, ${0.9 * fade})`);
        g.addColorStop(0.28, `rgba(44, 36, 24, ${0.88 * fade})`);
        g.addColorStop(0.55, `rgba(32, 40, 28, ${0.78 * fade})`);
        g.addColorStop(0.78, `rgba(22, 30, 22, ${0.62 * fade})`);
        g.addColorStop(0.94, `rgba(16, 22, 18, ${0.45 * fade})`);
        g.addColorStop(1, `rgba(10, 14, 12, ${0.28 * fade})`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, drawR, 0, TAU);
        ctx.fillStyle = g;
        ctx.fill();
        const gSheen = ctx.createRadialGradient(
          p.x - drawR * 0.22,
          p.y - drawR * 0.28,
          0,
          p.x,
          p.y,
          drawR * 0.52
        );
        gSheen.addColorStop(0, `rgba(62, 54, 42, ${0.22 * fade})`);
        gSheen.addColorStop(0.45, `rgba(40, 34, 26, ${0.12 * fade})`);
        gSheen.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, drawR * 0.98, 0, TAU);
        ctx.fillStyle = gSheen;
        ctx.fill();
        ctx.strokeStyle = `rgba(6, 8, 6, ${0.72 * fade})`;
        ctx.lineWidth = 3.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.5, drawR - 1.2), 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = `rgba(153, 27, 27, ${(0.62 + pulse * 0.18) * fade})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.2, drawR - 0.6), 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = `rgba(254, 202, 202, ${0.14 * fade})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, drawR - 2.4), 0, TAU);
        ctx.stroke();
        ctx.restore();
      } else {
        drawCircle2(ctx, p.x, p.y, R, "#2d1f12", 0.5 * fade);
        drawCircle2(ctx, p.x, p.y, R * 0.78, "#3f2f1e", (0.2 + 0.12 * pulse) * fade);
        ctx.strokeStyle = `rgba(161, 98, 7, ${(0.45 + pulse * 0.2) * fade})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, R * (0.9 + 0.05 * pulse), 0, TAU);
        ctx.stroke();
      }
    }
  }
  function drawSwampBlastBursts(ctx, bursts, now) {
    for (const b of bursts) {
      const t = clamp7((now - b.bornAt) / Math.max(1e-3, b.life), 0, 1);
      const fade = 1 - t * 0.2;
      if (b.frogWave) {
        const ease = 1 - Math.pow(1 - t, 2.45);
        const rr = b.r * (0.02 + 0.98 * ease);
        const vis = Math.pow(Math.sin(Math.min(1, t / 0.9) * Math.PI), 0.75);
        const aMul = vis * (0.88 + 0.12 * (1 - t));
        ctx.save();
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, Math.max(rr, 2));
        g.addColorStop(0, `rgba(30, 44, 32, ${0.5 * aMul})`);
        g.addColorStop(0.38, `rgba(48, 40, 28, ${0.4 * aMul})`);
        g.addColorStop(0.72, `rgba(26, 38, 30, ${0.2 * aMul})`);
        g.addColorStop(1, "rgba(8, 12, 10, 0)");
        ctx.beginPath();
        ctx.arc(b.x, b.y, rr, 0, TAU);
        ctx.fillStyle = g;
        ctx.fill();
        const edgeA = 0.55 * aMul * (0.35 + 0.65 * ease);
        ctx.strokeStyle = `rgba(140, 28, 28, ${0.82 * edgeA})`;
        ctx.lineWidth = 1.6 + (1 - ease) * 1.4;
        ctx.beginPath();
        ctx.arc(b.x, b.y, rr, 0, TAU);
        ctx.stroke();
        const rippleStart = 0.58;
        if (t >= rippleStart) {
          const rip = clamp7((t - rippleStart) / (1 - rippleStart), 0, 1);
          const decay = (1 - rip) * (1 - rip);
          const baseR = b.r;
          for (let ring = 0; ring < 3; ring++) {
            const lag = ring * 0.16;
            const uRing = clamp7((rip - lag) / Math.max(1e-3, 1 - lag), 0, 1);
            if (uRing <= 0.02) continue;
            const ringR = baseR * (0.72 + 0.32 * uRing);
            const ra = 0.38 * decay * (1 - ring * 0.18);
            ctx.strokeStyle = `rgba(48, 36, 26, ${ra})`;
            ctx.lineWidth = 5 + (1 - uRing) * 6;
            ctx.beginPath();
            ctx.arc(b.x, b.y, ringR, 0, TAU);
            ctx.stroke();
          }
          ctx.strokeStyle = `rgba(28, 44, 32, ${0.22 * decay})`;
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.arc(b.x, b.y, baseR * (0.68 + 0.36 * rip), 0, TAU);
          ctx.stroke();
          ctx.strokeStyle = `rgba(185, 45, 45, ${0.2 * decay})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(b.x, b.y, baseR * (0.82 + 0.28 * rip), 0, TAU);
          ctx.stroke();
        }
        ctx.restore();
      } else {
        const rr = b.r * (0.2 + 0.95 * t);
        drawCircle2(ctx, b.x, b.y, rr, "#a16207", 0.22 * fade);
        ctx.strokeStyle = `rgba(217, 119, 6, ${0.75 * fade})`;
        ctx.lineWidth = 3.2 - t * 1.8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, rr, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = `rgba(254, 243, 199, ${0.5 * fade})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(b.x, b.y, rr * (0.72 + 0.15 * (1 - t)), 0, TAU);
        ctx.stroke();
      }
    }
  }
  function drawSniperBullets(ctx, bullets, now) {
    for (const b of bullets) {
      const life = clamp7((now - b.bornAt) / b.life, 0, 1);
      const x = b.x + (b.tx - b.x) * life;
      const y = b.y + (b.ty - b.y) * life;
      drawCircle2(ctx, x, y, 2, "#fca5a5");
    }
  }
  function drawSpawnerChargeClocks(ctx, hunters, now) {
    for (const h of hunters) {
      if (h.type !== "spawner" && h.type !== "airSpawner" && h.type !== "cryptSpawner") continue;
      if (h.type === "cryptSpawner" && h.cryptDisguised) continue;
      if (now >= h.spawnDelayUntil) continue;
      const delayTotal = h.type === "airSpawner" ? 2.1 : 2;
      const elapsedSinceBorn = now - h.bornAt;
      const progress = clamp7(elapsedSinceBorn / delayTotal, 0, 1);
      const remaining = 1 - progress;
      const clockR = h.r + 28 + remaining * 6;
      const pulse = 1 + Math.sin(now * 10) * 0.04;
      const alpha = 0.1 + remaining * 0.18;
      const ringCol = h.type === "airSpawner" ? "#a78bfa" : h.type === "cryptSpawner" ? "#e2e8f0" : "#fb7185";
      const handCol = h.type === "airSpawner" ? "#7c3aed" : h.type === "cryptSpawner" ? "#cbd5e1" : "#f43f5e";
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = ringCol;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, clockR * pulse, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = handCol;
      ctx.lineWidth = 4;
      ctx.beginPath();
      const a1 = -Math.PI / 2 + progress * TAU * 0.9;
      const a2 = -Math.PI / 2 + progress * TAU * 0.35;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a1) * clockR * 0.68, Math.sin(a1) * clockR * 0.68);
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a2) * clockR * 0.45, Math.sin(a2) * clockR * 0.45);
      ctx.stroke();
      ctx.restore();
    }
  }
  function drawHunterLifeBars(ctx, hunters, now) {
    for (const h of hunters) {
      if (h.type === "cryptSpawner" && h.cryptDisguised) continue;
      const total = h.life || Math.max(1e-4, h.dieAt - h.bornAt);
      const lifeLeft = clamp7((h.dieAt - now) / total, 0, 1);
      const barW = h.r * 2.6;
      const barH = 5;
      const x = h.x - barW / 2;
      const y = h.y + h.r + 9;
      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
      ctx.fillRect(x - 1, y - 1, barW + 2, barH + 2);
      ctx.fillStyle = "rgba(51, 65, 85, 0.92)";
      ctx.fillRect(x, y, barW, barH);
      ctx.fillStyle = lifeLeft > 0.35 ? "#22c55e" : "#ef4444";
      ctx.fillRect(x, y, barW * lifeLeft, barH);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 0.5, y - 0.5, barW + 1, barH + 1);
      ctx.restore();
    }
  }

  // src/escape/Hunters/hunterRuntime.js
  var SWAMP_FROG_BLAST_R = 105;
  var SWAMP_FROG_LAND_EXPLODE_DIST = SWAMP_FROG_BLAST_R + 24;
  function createHunterRuntime(deps) {
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
      getSwampBootlegColourblind: getSwampBootlegColourblindDep
    } = deps;
    const worldToHex = worldToHexDep ?? (() => ({ q: 0, r: 0 }));
    const hexToWorld = hexToWorldDep ?? ((q, r) => ({ x: 0, y: 0 }));
    const isArenaHexTile = isArenaHexTileDep ?? (() => false);
    const isWorldPointOnSurgeLockBarrierTile = surgeBarrierDep ?? (() => false);
    const isWorldPointOnSpecialSpawnerForbiddenHex = forbiddenHexDep ?? (() => false);
    const ejectSpawnerHunterFromSpecialHexFootprint = ejectSpawnerDep ?? (() => {
    });
    const getDifficultyClockSec = getDifficultyClockSecDep ?? getSimElapsed;
    const getRunLevel = getRunLevelDep ?? (() => 0);
    const isWorldPointOnSafehouseBarrierDisk = safehouseBarrierDep ?? (() => false);
    const clampHunterOutsideSafehouseDisk = clampSafehouseDep ?? (() => {
    });
    const isWorldPointOnForgeRouletteBarrierTile = forgeRouletteBarrierDep ?? (() => false);
    const getActivePathId = getActivePathIdDep ?? (() => null);
    const getInventory = getInventoryDep ?? (() => ({}));
    const getPlayerUntargetableUntil = getPlayerUntargetableUntilDep ?? (() => 0);
    const pickRogueHunterTarget = pickRogueHunterTargetDep ?? null;
    const getBulwarkPlantedFlag = getBulwarkPlantedFlagDep ?? (() => null);
    const getDebugHunterTypeFilter = getDebugHunterTypeFilterDep ?? (() => null);
    const getSwampBootlegColourblind2 = getSwampBootlegColourblindDep ?? (() => false);
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
      swampBursts: []
    };
    let suppressRangedAttacksNow = false;
    let nextLaserBeamDamageId = 1;
    const spawnState = {
      wave: 0,
      spawnInterval: SPAWN_INTERVAL_START,
      nextSpawnAt: 0,
      /** @type {{ at: number; fn: () => void }[]} */
      spawnScheduled: []
    };
    let spawnDifficultyAnchorSurvival = 0;
    let boneGhostNextSpawnAt = null;
    function relDifficultySurvivalSec() {
      return Math.max(0, getDifficultyClockSec() - spawnDifficultyAnchorSurvival);
    }
    function getDangerRamp01() {
      return clamp7(relDifficultySurvivalSec() / DANGER_RAMP_SECONDS, 0, 1);
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
        if (intersectsRectCircle2(circle, obstacle)) return true;
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
      const nxBlocked = outOfBoundsCircle(nx) || isWorldPointOnForgeRouletteBarrierTile(nx.x, nx.y) || !ignoreObstacles && collidesAnyObstacle(nx) || blockValiantShock && !!collidesValiantEnemyShockFieldDep?.(nx, elapsed);
      if (!nxBlocked) entity.x = nx.x;
      else if (!ignoreObstacles) touchedObstacle = true;
      const ny = { x: entity.x, y: entity.y + vy * dt, r: entity.r };
      const nyBlocked = outOfBoundsCircle(ny) || isWorldPointOnForgeRouletteBarrierTile(ny.x, ny.y) || !ignoreObstacles && collidesAnyObstacle(ny) || blockValiantShock && !!collidesValiantEnemyShockFieldDep?.(ny, elapsed);
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
        const score = distSq3(from, d);
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
        if (distSq3(hunter, bFlag) <= lr * lr) {
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
        if (decoy && distSq3(hunter, decoy) < 240 * 240) return decoy;
      }
      return target;
    }
    function anyOtherEnemyHasLineOfSightToPlayer(excludedHunter) {
      const elapsed = getSimElapsed();
      const player = getPlayer();
      for (const h of entities.hunters) {
        if (h === excludedHunter) continue;
        if (h.type === "spawner" || h.type === "airSpawner" || h.type === "cryptSpawner" && h.cryptDisguised)
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
        r: hunter.r
      };
      if (!collidesAnyObstacle(sample)) return desired;
      let ax = 0;
      let ay = 0;
      for (const obstacle of getObstacles()) {
        const closestX = clamp7(hunter.x, obstacle.x, obstacle.x + obstacle.w);
        const closestY = clamp7(hunter.y, obstacle.y, obstacle.y + obstacle.h);
        const awayX = hunter.x - closestX;
        const awayY = hunter.y - closestY;
        const dist = Math.hypot(awayX, awayY) || 1;
        const influence = 1 / Math.max(25, dist);
        ax += awayX / dist * influence;
        ay += awayY / dist * influence;
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
          const ang = i / ANGLES * Math.PI * 2;
          const cand = { x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad, r };
          if (!outOfBoundsCircle(cand) && !collidesAnyObstacle(cand) && !isWorldPointOnSpecialSpawnerForbiddenHex(cand.x, cand.y)) {
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
        hitLockUntil: 0
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
        h.chaserDashNextReady = elapsed + rand(0.35, 1);
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
        lastShotAt = elapsed + rand(0.4, 1);
        h.shotInterval = 1.35;
        h.shotSpeed = 360;
      } else if (type === "laser") {
        r = 13;
        life = 8;
        lastShotAt = elapsed + rand(0.6, 1.2);
        h.laserState = "move";
        h.aimStartedAt = 0;
        h.nextLaserReadyAt = elapsed + rand(0.7, 1.4);
        h.laserCooldown = 1;
        h.laserWarning = 0.42;
        h.laserAim = null;
      } else if (type === "laserBlue") {
        r = 13;
        life = 8;
        lastShotAt = elapsed + rand(0.5, 1);
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
        const at = clamp7(t0 + (i + 0.5) * slot + jitter, t0 + 0.04, t0 + spread);
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
        if (getCharacterId() === "rogue" && !h.arenaNexusSpawn && !anyOtherEnemyHasLineOfSightToPlayer(h)) {
          continue;
        }
        h.lastShotAt = elapsed;
        const windup = SNIPER_ARTILLERY_WINDUP;
        const leadT = windup * SNIPER_ARTILLERY_LEAD;
        const tvx = target === player ? player.velX ?? 0 : 0;
        const tvy = target === player ? player.velY ?? 0 : 0;
        let aimX = target.x + tvx * leadT + rand(-12, 12);
        let aimY = target.y + tvy * leadT + rand(-12, 12);
        aimX = clamp7(aimX, player.x - VIEW_W * 0.9, player.x + VIEW_W * 0.9);
        aimY = clamp7(aimY, player.y - VIEW_H * 0.9, player.y + VIEW_H * 0.9);
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
          firePath
        });
        const dist = Math.hypot(aimX - h.x, aimY - h.y) || 1;
        entities.bullets.push({
          x: h.x,
          y: h.y,
          tx: aimX,
          ty: aimY,
          bornAt: elapsed,
          life: clamp7(0.14 + dist / 2200, 0.16, 0.32)
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
          if (isWorldPointOnSurgeLockBarrierTile(sx, sy) || isWorldPointOnSafehouseBarrierDisk(sx, sy) || isWorldPointOnForgeRouletteBarrierTile(sx, sy) || collidesAnyObstacle({ x: sx, y: sy, r: 2 })) {
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
            if (distSq3(zone, player) <= rr * rr) {
              damagePlayer(2, {
                sourceX: zone.x,
                sourceY: zone.y,
                ...zone.firePath ? { fireApplyIgnite: true } : {}
              });
            }
          }
          if (getActivePathId() === "swamp" && getRunLevel() >= 2 && !zone.firePath) {
            applySwampFrogExplosionAt(zone.x, zone.y, elapsed);
          }
        }
        if (zone.exploded && elapsed < (zone.lingerUntil ?? zone.detonateAt) && elapsed >= (zone.nextTickAt ?? Infinity)) {
          zone.nextTickAt += zone.tickInterval ?? 0.3;
          if (!hitDecoyIfAny(zone, zone.r * 0.92, { artilleryKind: "linger" })) {
            const rr = zone.r * 0.92 + player.r;
            if (distSq3(zone, player) <= rr * rr) {
              damagePlayer(1, {
                sourceX: zone.x,
                sourceY: zone.y,
                ...zone.firePath ? { fireApplyIgnite: true } : {}
              });
            }
          }
        }
        const zu = zone.windup != null ? zone.windup : 0.8;
        const lingerTotal = Math.max(zu + 0.48, (zone.lingerUntil ?? zone.bornAt) - zone.bornAt);
        if (elapsed - zone.bornAt > lingerTotal) entities.dangerZones.splice(i, 1);
      }
    }
    function applySwampFrogExplosionAt(wx, wy, elapsed) {
      const player = getPlayer();
      const blastR = SWAMP_FROG_BLAST_R;
      const center = { x: wx, y: wy };
      if (!hitDecoyIfAny(center, blastR, { damage: 1 })) {
        const rr = blastR + player.r;
        if (distSq3(center, player) <= rr * rr) {
          damagePlayer(1, {
            sourceX: wx,
            sourceY: wy,
            swampApplyInfection: true
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
        frogMudPool: true
      });
      entities.swampBursts.push({
        x: wx,
        y: wy,
        r: blastR,
        bornAt: elapsed,
        life: FROG_SPLASH_GROW_SEC,
        frogWave: true
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
          if (t1 > t0) h.cryptRevealU = clamp7((elapsed - t0) / Math.max(1e-4, t1 - t0), 0, 1);
          else h.cryptRevealU = 1;
        }
        if (h.type === "spawner" || h.type === "cryptSpawner") continue;
        if (elapsed < (h.stunnedUntil || 0)) continue;
        const spDt = dt * spades13AuraEnemyDtMult();
        if (h.type === "airSpawner") {
          const target = pickTargetForHunter(h);
          const desired2 = vectorToTarget(h, target);
          const sm2 = runLevelEnemySpeedMult();
          const am = runLevelEnemyAccelMult();
          const airSteer = Math.min(0.88, 0.78 * am);
          const airInertia = 1 - airSteer;
          const airSpeed = AIR_SPAWNER_CHASE_SPEED * sm2 * midgameEnemySpeedMult() * boneEnemySpeedMult();
          h.dir.x = h.dir.x * airInertia + desired2.x * airSteer;
          h.dir.y = h.dir.y * airInertia + desired2.y * airSteer;
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
            const dur = Math.max(1e-4, h.ghostTelegraphDur ?? 0.18);
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
            if ((h.ghostDashRemain ?? 0) <= 1e-4) {
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
            const dur = Math.max(1e-4, h.ghostTelegraphDur ?? 0.13);
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
            h.opacity = clamp7(1 - traveledU, 0, 1);
            trail.push({ x: prevX, y: prevY, r: h.r * 0.95, alpha: 0.48 * h.opacity });
            if (traveledU <= 0.75 && elapsed >= (h.ghostDamageLockUntil ?? 0)) {
              const hitDist = pointToSegmentDistance(player.x, player.y, prevX, prevY, h.x, h.y);
              if (hitDist <= player.r + h.r * 0.9) {
                damagePlayer(1, { sourceX: h.x, sourceY: h.y });
                h.ghostDamageLockUntil = elapsed + ENEMY_HIT_COOLDOWN_SEC;
              }
            }
            if ((h.ghostDashRemain ?? 0) <= 1e-4) {
              h._removeNow = true;
              scheduleNextBoneGhostSpawn(elapsed, true);
            }
            continue;
          }
        }
        const lifeSpan = h.life || Math.max(1e-4, h.dieAt - h.bornAt);
        const age = clamp7((elapsed - h.bornAt) / lifeSpan, 0, 1);
        const speedFactor = 1 + age * HUNTER_SPEED_AGE_COEFF;
        const baseSpeed = h.type === "sniper" ? 100 : h.type === "cutter" ? 116 : h.type === "laser" || h.type === "laserBlue" ? h.type === "laserBlue" ? 156 : 138 : h.type === "ranged" ? 85 : h.type === "fast" ? 150 : 110;
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
          const d2 = distSq3(h, target);
          desired = d2 < 210 * 210 ? away : toward;
        } else if (h.type === "ranged") {
          const target = pickTargetForHunter(h);
          const d2 = distSq3(h, target);
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
                ...bone && !isBlue ? { boneGhostBeam: true } : {},
                ...bone && isBlue ? { boneGhostBlueBeam: true } : {}
              });
              if (!hitDecoyAlongSegment(aim.x1, aim.y1, aim.x2, aim.y2, 5, { laserOneShotId: laserDamageId })) {
                const hitDist = pointToSegmentDistance(player.x, player.y, aim.x1, aim.y1, aim.x2, aim.y2);
                if (hitDist <= player.r + 5) {
                  damagePlayer(
                    2,
                    isBlue ? {
                      laserBlueSlow: true,
                      sourceX: aim.x1,
                      sourceY: aim.y1,
                      swampDamageInstanceId: `laser-${laserDamageId}`
                    } : {
                      sourceX: aim.x1,
                      sourceY: aim.y1,
                      swampDamageInstanceId: `laser-${laserDamageId}`
                    }
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
            const endpoint = isBlue ? getLaserEndpoint(h.x, h.y, aimDirX, aimDirY, 900, { throughObstacles: true }) : getLaserEndpoint(h.x, h.y, aimDirX, aimDirY);
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
              ...boneW && !isBlue ? { boneGhostBeam: true } : {},
              ...boneW && isBlue ? { boneGhostBlueBeam: true } : {}
            });
            continue;
          }
          const d2 = distSq3(h, target);
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
            if (outOfBoundsCircle(test) || collidesAnyObstacle(test) || !!collidesValiantEnemyShockFieldDep?.(test, elapsed)) {
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
            if (outOfBoundsCircle(test) || collidesAnyObstacle(test) || !!collidesValiantEnemyShockFieldDep?.(test, elapsed)) {
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
          ignoreObstacles: !!h.boneSwarmPhasing
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
            halfA: Math.PI / 24,
            // +/- 7.5deg (15deg total arc angle).
            radius: 8,
            width: 20,
            speed: 380,
            maxRadius: Math.max(220, dist + 28),
            bornAt: elapsed,
            life: 0.96,
            nextHitAt: elapsed,
            fireApplyIgnite: true
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
            damage: 1
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
          const ageU = clamp7((elapsed - p.bornAt) / Math.max(1e-3, p.life), 0, 1);
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
        if (distSq3(p, player) <= rr * rr) {
          damagePlayer(p.damage || 1, {
            sourceX: p.x,
            sourceY: p.y,
            ...p.fireApplyIgnite ? { fireApplyIgnite: true } : {}
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
            ...arc.fireApplyIgnite ? { fireApplyIgnite: true } : {}
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
        if (distSq3(p, player) <= rr * rr) {
          damagePlayer(0, {
            sourceX: p.x,
            sourceY: p.y,
            swampApplyInfection: true,
            swampInfectionOnly: true
          });
        }
      }
    }
    function getFrogMudPoolMoveMult(px, py, pr, elapsed) {
      for (const p of entities.swampPools) {
        if (!p.frogMudPool) continue;
        if (elapsed >= p.expiresAt) continue;
        const rPool = p.r * frogMudPoolGrowScale(p.bornAt, elapsed);
        const rr = rPool + pr;
        if (distSq3(p, { x: px, y: py }) <= rr * rr) return FROG_MUD_POOL_MOVE_MULT;
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
            const open = h.type === "airSpawner" ? resolveFastSpawnNearAirSpawner(h, fastR) : randomOpenPointAround(h.x, h.y, h.r + 16, h.r + 34, fastR, 25, { excludeSpecialHex: true });
            spawnHunter("fast", open.x, open.y, { boneSwarmPhasing: h.type === "cryptSpawner" });
          }
        }
      }
    }
    function applyFrontShieldArc() {
      const player = getPlayer();
      const arcDeg = Math.max(0, Number(player.frontShieldArcDeg ?? 0));
      if (arcDeg <= 0) return;
      const facingAngle = Math.atan2(player.facing?.y ?? 0, player.facing?.x ?? 1);
      const halfArc = arcDeg * Math.PI / 360;
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
        const laserOpts = typeof beam.damageId === "number" ? { laserOneShotId: beam.damageId, damage: 1 } : { damage: 1 };
        if (!hitDecoyAlongSegment(beam.x1, beam.y1, beam.x2, beam.y2, 5, laserOpts)) {
          const hitDist = pointToSegmentDistance(player.x, player.y, beam.x1, beam.y1, beam.x2, beam.y2);
          if (hitDist <= player.r + 5) {
            damagePlayer(
              2,
              beam.blueLaser ? {
                laserBlueSlow: true,
                sourceX: beam.x1,
                sourceY: beam.y1,
                swampDamageInstanceId: `laser-${beam.damageId ?? beam.bornAt ?? 0}`
              } : {
                sourceX: beam.x1,
                sourceY: beam.y1,
                swampDamageInstanceId: `laser-${beam.damageId ?? beam.bornAt ?? 0}`
              }
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
        if (distSq3(h, player) <= rr * rr) {
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
            excludeSpecialHex: true
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
        h.x = cx + dx / len * (edgeR + h.r);
        h.y = cy + dy / len * (edgeR + h.r);
      }
    }
    function clampArenaNexusDefendersOnRing(cx, cy) {
      for (const h of entities.hunters) {
        if (!h.arenaNexusSpawn) continue;
        const dx = h.x - cx;
        const dy = h.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        if (d < ARENA_NEXUS_RING_LO) {
          h.x = cx + dx / d * ARENA_NEXUS_RING_LO;
          h.y = cy + dy / d * ARENA_NEXUS_RING_LO;
        } else if (d > ARENA_NEXUS_RING_HI) {
          h.x = cx + dx / d * ARENA_NEXUS_RING_HI;
          h.y = cy + dy / d * ARENA_NEXUS_RING_HI;
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
        h.x = cx + dx / len * (edgeR + h.r);
        h.y = cy + dy / len * (edgeR + h.r);
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
      const colourblind = getSwampBootlegColourblind2();
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
      getFrogMudPoolMoveMult
    };
  }

  // src/escape/fx/attackRings.js
  function clamp11(x, a, b) {
    return Math.max(a, Math.min(b, x));
  }
  function tickAttackRings(rings, elapsed) {
    for (let i = rings.length - 1; i >= 0; i--) {
      if (elapsed >= rings[i].expiresAt) rings.splice(i, 1);
    }
  }
  function drawAttackRings(ctx, rings, elapsed) {
    for (const ring of rings) {
      const span = Math.max(1e-4, ring.expiresAt - ring.bornAt);
      const t = clamp11((elapsed - ring.bornAt) / span, 0, 1);
      const rr = ring.r * (1 + t * 0.28);
      ctx.save();
      ctx.strokeStyle = ring.color;
      ctx.globalAlpha = 0.85 * (1 - t);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, rr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
  function pushAttackRing(rings, x, y, r, color, bornAt, durationSec) {
    rings.push({
      x,
      y,
      r,
      color,
      bornAt,
      expiresAt: bornAt + durationSec
    });
  }

  // src/escape/fx/lunaticDraw.js
  function clamp12(x, a, b) {
    return Math.max(a, Math.min(b, x));
  }
  function tickLunaticSprintTierFx(events, simElapsed) {
    for (let i = events.length - 1; i >= 0; i--) {
      if (simElapsed >= events[i].expiresAt) events.splice(i, 1);
    }
  }
  function drawLunaticSprintTierSpeedFx(ctx, events, player, simElapsed) {
    if (!events.length) return;
    let ffx = player.facing.x;
    let ffy = player.facing.y;
    const fl = Math.hypot(ffx, ffy) || 1;
    ffx /= fl;
    ffy /= fl;
    const bx = -ffx;
    const by = -ffy;
    const px = -ffy;
    const py = ffx;
    const cx = player.x;
    const cy = player.y;
    for (const b of events) {
      const span = Math.max(1e-4, b.expiresAt - b.bornAt);
      const u = clamp12((simElapsed - b.bornAt) / span, 0, 1);
      const fade = 1 - u;
      const lineCount = b.tier === 4 ? 12 : 8;
      const baseLen = (b.tier === 4 ? 78 : 56) * (0.72 + 0.28 * fade);
      const spreadW = b.tier === 4 ? 26 : 18;
      const jitter = (b.tier === 4 ? 5 : 3) * Math.sin(simElapsed * 38 + b.bornAt * 7);
      ctx.save();
      ctx.lineCap = "round";
      for (let i = 0; i < lineCount; i++) {
        const t = lineCount <= 1 ? 0 : i / (lineCount - 1) - 0.5;
        const off = spreadW * t + jitter * (0.35 + 0.65 * Math.abs(t));
        const len = baseLen * (0.82 + 0.18 * Math.abs(t));
        const x0 = cx + bx * 14 + px * off;
        const y0 = cy + by * 14 + py * off;
        const x1 = cx + bx * (14 + len) + px * off * 1.08;
        const y1 = cy + by * (14 + len) + py * off * 1.08;
        const a = (b.tier === 4 ? 0.55 : 0.42) * fade;
        ctx.strokeStyle = b.tier === 4 ? `rgba(254, 215, 170, ${a})` : `rgba(125, 211, 252, ${a})`;
        ctx.lineWidth = b.tier === 4 ? 2.1 : 1.45;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  function drawLunaticSprintDirectionArrow(ctx, player, phase) {
    if (phase !== "sprint") return;
    const px = player.x;
    const py = player.y;
    const pr = player.r;
    let fx = player.facing.x;
    let fy = player.facing.y;
    const fl = Math.hypot(fx, fy) || 1;
    fx /= fl;
    fy /= fl;
    const stemStart = pr + 4;
    const stemEnd = pr + 26;
    const tipDist = pr + 42;
    const headHalf = 9;
    const sx = px + fx * stemStart;
    const sy = py + fy * stemStart;
    const ex = px + fx * stemEnd;
    const ey = py + fy * stemEnd;
    const tipX = px + fx * tipDist;
    const tipY = py + fy * tipDist;
    const ox = -fy * headHalf;
    const oy = fx * headHalf;
    ctx.save();
    ctx.strokeStyle = "rgba(251, 191, 36, 0.95)";
    ctx.fillStyle = "rgba(254, 249, 195, 0.88)";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(ex + ox, ey + oy);
    ctx.lineTo(ex - ox, ey - oy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  function drawLunaticRoarFx(ctx, player, simElapsed, roarUntil, bodyAlpha) {
    if (simElapsed >= roarUntil) return;
    const px = player.x;
    const py = player.y;
    const pr = player.r;
    const throb = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(simElapsed * 22));
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const rr = pr + 8 + i * 11 + throb * 10;
      const a = (0.42 - i * 0.07) * bodyAlpha * throb;
      ctx.strokeStyle = `rgba(220, 38, 38, ${a})`;
      ctx.lineWidth = 2.4 - i * 0.35;
      ctx.beginPath();
      ctx.arc(px, py, rr, 0, TAU);
      ctx.stroke();
    }
    const fx = player.facing.x;
    const fy = player.facing.y;
    const fl = Math.hypot(fx, fy) || 1;
    const fan = Math.PI * 0.42;
    const baseAng = Math.atan2(fy / fl, fx / fl);
    ctx.globalAlpha = 0.28 * bodyAlpha * throb;
    ctx.fillStyle = "rgba(248, 113, 113, 0.55)";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, pr + 36, baseAng - fan / 2, baseAng + fan / 2);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  function drawLunaticRoarTimerBar(ctx, player, simElapsed, roarUntil, bodyAlpha) {
    if (simElapsed >= roarUntil) return;
    const px = player.x;
    const py = player.y;
    const pr = player.r;
    const dur = Math.max(1e-3, LUNATIC_ROAR_DURATION_SEC);
    const rem = Math.max(0, roarUntil - simElapsed);
    const ratio = clamp12(rem / dur, 0, 1);
    const barW = 48;
    const barH = 5;
    const x = px - barW / 2;
    const y = py + pr + 11;
    ctx.save();
    ctx.globalAlpha = bodyAlpha;
    ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
    ctx.fillRect(x - 1, y - 1, barW + 2, barH + 2);
    ctx.strokeStyle = "rgba(248, 113, 113, 0.95)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 0.5, y - 0.5, barW + 1, barH + 1);
    ctx.fillStyle = "rgba(30, 41, 59, 0.98)";
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = ratio > 0.22 ? "#dc2626" : "#f87171";
    ctx.fillRect(x, y, barW * ratio, barH);
    ctx.restore();
  }

  // src/escape/fx/bulwarkDraw.js
  function drawBulwarkFrontShieldArc(ctx, player, elapsed) {
    const arcDeg = Math.max(0, Number(player.frontShieldArcDeg ?? 0));
    if (arcDeg <= 0) return;
    const fx = player.facing?.x ?? 1;
    const fy = player.facing?.y ?? 0;
    const facing = Math.atan2(fy, fx);
    const arc = arcDeg * Math.PI / 180;
    const pulse = 0.82 + 0.18 * (0.5 + 0.5 * Math.sin(elapsed * 8));
    const r = player.r + 28;
    ctx.save();
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.82 * pulse})`;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(player.x, player.y, r, facing - arc / 2, facing + arc / 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(186, 230, 253, ${0.42 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, r + 4, facing - arc / 2, facing + arc / 2);
    ctx.stroke();
    ctx.restore();
  }
  function drawBulwarkFlagCarried(ctx, player, carriedHp, maxHp, elapsed) {
    const bx = player.x;
    const by = player.y - player.r - 30;
    const mh = maxHp > 0 ? maxHp : BULWARK_FLAG_MAX_HP;
    const hpText = `${Math.floor(carriedHp)}/${Math.ceil(mh)}`;
    ctx.save();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, by + 18);
    ctx.lineTo(bx, by - 18);
    ctx.stroke();
    const wave = Math.sin(elapsed * 9) * 2.5;
    ctx.fillStyle = "#15803d";
    ctx.beginPath();
    ctx.moveTo(bx, by - 14);
    ctx.lineTo(bx + 26 + wave, by - 10);
    ctx.lineTo(bx + 22 - wave * 0.35, by + 2);
    ctx.lineTo(bx, by - 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#86efac";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.font = "bold 10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(2, 6, 23, 0.85)";
    ctx.strokeText(hpText, bx, by + 22);
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(hpText, bx, by + 22);
    ctx.restore();
  }
  function drawBulwarkFlagPlanted(ctx, flagDecoy, elapsed, chargeCount = 0) {
    const { x, y, hp, maxHp } = flagDecoy;
    const mh = maxHp ?? BULWARK_FLAG_MAX_HP;
    const hpText = `${Math.ceil(hp)}/${Math.ceil(mh)}`;
    const chargeText = String(Math.floor(chargeCount));
    ctx.save();
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + 22);
    ctx.lineTo(x, y - 40);
    ctx.stroke();
    const wave = Math.sin(elapsed * 5.5 + x * 0.015) * 3.5;
    ctx.fillStyle = "#166534";
    ctx.beginPath();
    ctx.moveTo(x, y - 34);
    ctx.lineTo(x + 34 + wave, y - 26);
    ctx.lineTo(x + 30 - wave * 0.5, y - 12);
    ctx.lineTo(x, y - 18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(2, 6, 23, 0.85)";
    ctx.strokeText(hpText, x, y + 30);
    ctx.fillStyle = "#f1f5f9";
    ctx.fillText(hpText, x, y + 30);
    ctx.font = "800 14px system-ui, sans-serif";
    ctx.strokeStyle = "rgba(2, 6, 23, 0.9)";
    ctx.lineWidth = 4;
    ctx.strokeText(chargeText, x, y + 46);
    ctx.fillStyle = "#6ee7b7";
    ctx.fillText(chargeText, x, y + 46);
    ctx.restore();
  }
  function drawBulwarkParry(ctx, player, elapsed, parryUntil) {
    if (elapsed >= parryUntil) return;
    const start = parryUntil - BULWARK_PARRY_DURATION_SEC;
    const u = Math.max(0, Math.min(1, (elapsed - start) / BULWARK_PARRY_DURATION_SEC));
    const { x: px, y: py, r: pr } = player;
    const pulse = 1 + 0.35 * Math.sin(u * Math.PI * 18);
    const fade = 1 - u * 0.35;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `rgba(254, 249, 195, ${0.55 * fade})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(px, py, pr + 12 + u * 26 * pulse, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = `rgba(250, 204, 21, ${0.45 * fade})`;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(px, py, pr + 22 + u * 40 * pulse, 0, TAU);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(253, 224, 71, ${0.14 * fade})`;
    ctx.beginPath();
    ctx.arc(px, py, pr + 8, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // src/escape/fx/ultimateEffects.js
  var TAU3 = Math.PI * 2;
  function clamp13(x, a, b) {
    return Math.max(a, Math.min(b, x));
  }
  function drawCircle3(ctx, x, y, r, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU3);
    ctx.fill();
    ctx.restore();
  }
  function drawUltimateEffects(ctx, effects, shields, elapsed, player) {
    for (const fx of effects) {
      if (elapsed < fx.bornAt) continue;
      const span = Math.max(1e-3, fx.expiresAt - fx.bornAt);
      const t = clamp13((elapsed - fx.bornAt) / span, 0, 1);
      if (fx.type === "burstWave") {
        const ease = 1 - Math.pow(1 - t, 1.35);
        const rr = fx.radius * (0.1 + ease * 0.98);
        ctx.save();
        ctx.translate(fx.x, fx.y);
        ctx.rotate(elapsed * 6 + fx.bornAt * 3);
        if (t < 0.22) {
          const flash = 1 - t / 0.22;
          drawCircle3(ctx, 0, 0, rr * 0.12 + flash * fx.radius * 0.1, "#ffffff", 0.5 * flash);
        }
        const segs = 40;
        for (let k = 0; k < 3; k++) {
          const rrk = rr * (1 - k * 0.1);
          const alpha = (0.62 - k * 0.14) * (1 - t);
          ctx.strokeStyle = `rgba(224, 242, 254, ${alpha})`;
          ctx.lineWidth = 11 - k * 2.5 - t * 5;
          ctx.beginPath();
          for (let i = 0; i <= segs; i++) {
            const ang = i / segs * TAU3;
            const wobble = 1 + 0.045 * Math.sin(ang * 9 + elapsed * 24);
            const px = Math.cos(ang) * rrk * wobble;
            const py = Math.sin(ang) * rrk * wobble;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = `rgba(96, 165, 250, ${0.4 * (1 - t)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, rr + 10, 0, TAU3);
        ctx.stroke();
      } else if (fx.type === "shieldSummon") {
        const rr = fx.radius * (0.2 + t * 1.05);
        const pulse = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(elapsed * 18));
        ctx.save();
        ctx.translate(fx.x, fx.y);
        ctx.rotate(-elapsed * 2.2);
        const rays = 24;
        for (let i = 0; i < rays; i++) {
          const ang = i / rays * TAU3;
          const len = rr * (0.5 + 0.55 * (1 - t));
          const alpha = (0.35 - i * 8e-3) * (1 - t);
          ctx.strokeStyle = `rgba(191, 219, 254, ${Math.max(0, alpha)})`;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ang) * rr * 0.08, Math.sin(ang) * rr * 0.08);
          ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
          ctx.stroke();
        }
        ctx.restore();
        drawCircle3(ctx, fx.x, fx.y, rr * (0.2 + pulse * 0.1), "#ffffff", 0.2 * (1 - t));
        drawCircle3(ctx, fx.x, fx.y, rr * 0.45, "#dbeafe", 0.28 * (1 - t * 0.6));
        drawCircle3(ctx, fx.x, fx.y, rr, fx.color, 0.14 * (1 - t));
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 * (1 - t)})`;
        ctx.lineWidth = 5 - t * 2.5;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, rr * (0.92 - t * 0.08), 0, TAU3);
        ctx.stroke();
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.45 * (1 - t)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, rr * 1.08, 0, TAU3);
        ctx.stroke();
        ctx.strokeStyle = `rgba(186, 230, 253, ${0.35 * (1 - t)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, rr * (0.72 + 0.12 * pulse), 0, TAU3);
        ctx.stroke();
      } else if (fx.type === "timelockWorld") {
        const ease = 1 - Math.pow(1 - t, 0.85);
        const rr = fx.radius * (0.15 + ease * 1.05);
        const frost = 0.22 * (1 - t);
        drawCircle3(ctx, fx.x, fx.y, rr, "#e0e7ff", frost * 0.5);
        ctx.strokeStyle = `rgba(196, 181, 253, ${0.55 * (1 - t * 0.5)})`;
        ctx.lineWidth = 5 + (1 - t) * 4;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, rr, 0, TAU3);
        ctx.stroke();
        const ticks = 24;
        for (let i = 0; i < ticks; i++) {
          const ang = i / ticks * TAU3 - elapsed * 0.35;
          ctx.strokeStyle = `rgba(237, 233, 254, ${0.35 * (1 - t)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(fx.x + Math.cos(ang) * rr * 0.88, fx.y + Math.sin(ang) * rr * 0.88);
          ctx.lineTo(fx.x + Math.cos(ang) * rr * 1.02, fx.y + Math.sin(ang) * rr * 1.02);
          ctx.stroke();
        }
      } else if (fx.type === "timelock") {
        const phaseSelf = t < 0.5;
        const localSelf = phaseSelf ? t / 0.5 : 1;
        const fade = phaseSelf ? 1 : Math.max(0, 1 - (t - 0.5) * 2.2);
        const pulse = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(elapsed * 14));
        const spiralR = fx.radius * (0.35 + localSelf * 0.9) + pulse * 8;
        drawCircle3(ctx, fx.x, fx.y, spiralR, "#c084fc", (0.1 + (1 - localSelf) * 0.08) * fade);
        ctx.strokeStyle = `rgba(233, 213, 255, ${(0.5 + 0.25 * (1 - localSelf)) * fade})`;
        ctx.lineWidth = 3;
        const coils = 3;
        ctx.beginPath();
        for (let i = 0; i <= 72; i++) {
          const u = i / 72;
          const ang = u * coils * TAU3 + elapsed * 3;
          const rad = 8 + u * spiralR * 0.95;
          const px = fx.x + Math.cos(ang) * rad;
          const py = fx.y + Math.sin(ang) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        const tickN = 12;
        for (let i = 0; i < tickN; i++) {
          const ang = i / tickN * TAU3 - elapsed * 2;
          ctx.strokeStyle = `rgba(250, 245, 255, ${0.55 * fade})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(fx.x + Math.cos(ang) * (player.r + 6), fx.y + Math.sin(ang) * (player.r + 6));
          ctx.lineTo(fx.x + Math.cos(ang) * (player.r + 18), fx.y + Math.sin(ang) * (player.r + 18));
          ctx.stroke();
        }
      } else if (fx.type === "healVitality") {
        const pulse = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(elapsed * 16));
        for (let ring = 0; ring < 3; ring++) {
          const lag = ring * 0.12;
          const tt = clamp13((t - lag) / (1 - lag), 0, 1);
          const rr = fx.radius * (0.25 + tt * 0.82);
          drawCircle3(ctx, fx.x, fx.y, rr, "#6ee7b7", 0.08 * (1 - tt) * (1 - ring * 0.2));
          ctx.strokeStyle = `rgba(52, 211, 153, ${0.45 * (1 - tt) * pulse})`;
          ctx.lineWidth = 4 - ring;
          ctx.beginPath();
          ctx.arc(fx.x, fx.y, rr, 0, TAU3);
          ctx.stroke();
        }
        const rays = 14;
        for (let i = 0; i < rays; i++) {
          const ang = i / rays * TAU3 + elapsed * 0.8;
          const len = fx.radius * (0.4 + 0.55 * (1 - t));
          ctx.strokeStyle = `rgba(167, 243, 208, ${0.4 * (1 - t)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(fx.x, fx.y);
          ctx.lineTo(fx.x + Math.cos(ang) * len, fx.y + Math.sin(ang) * len);
          ctx.stroke();
        }
        if (t < 0.35) {
          const b = 1 - t / 0.35;
          drawCircle3(ctx, fx.x, fx.y, player.r + 6 + b * 12, "#ecfdf5", 0.35 * b);
        }
      }
    }
    for (const shield of shields) {
      const spawnAge = shield.bornAt != null ? clamp13((elapsed - shield.bornAt) / 0.34, 0, 1) : 1;
      const pop = 0.2 + 0.8 * (1 - Math.pow(1 - spawnAge, 2.4));
      const pulse = 0.9 + 0.1 * Math.sin(elapsed * 8 + shield.angle * 2.2);
      const drawR = shield.r * pop * pulse;
      const tx = -Math.sin(shield.angle);
      const ty = Math.cos(shield.angle);
      ctx.strokeStyle = "rgba(147, 197, 253, 0.35)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(shield.x - tx * (drawR + 6), shield.y - ty * (drawR + 6));
      ctx.lineTo(shield.x + tx * (drawR + 14), shield.y + ty * (drawR + 14));
      ctx.stroke();
      drawCircle3(ctx, shield.x, shield.y, drawR + 9, "#bfdbfe", 0.28);
      drawCircle3(ctx, shield.x, shield.y, drawR + 4, "#e0f2fe", 0.45);
      drawCircle3(ctx, shield.x, shield.y, drawR, "#38bdf8", 0.95);
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(shield.x, shield.y, drawR + 1.2, 0, TAU3);
      ctx.stroke();
    }
    if (shields.length) {
      const orbitR = shields[0].radius;
      ctx.strokeStyle = "rgba(147, 197, 253, 0.2)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 10]);
      ctx.lineDashOffset = -elapsed * 40;
      ctx.beginPath();
      ctx.arc(player.x, player.y, orbitR, 0, TAU3);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // src/escape/playerDamage.js
  function createPlayerDamage(deps) {
    const {
      getSimElapsed,
      getPlayer,
      inventory: inventory2,
      getCharacterInvulnUntil,
      isDashCoolingDown,
      stunNearbyEnemies,
      onPlayerDeath,
      rogueStealthBlocksDamage,
      getLunaticSprintDamageImmune,
      getIsValiant,
      applyValiantIncomingDamage,
      getBulwarkParryActive,
      getPostHitInvulnerabilitySec
    } = deps;
    const combat = {
      playerInvulnerableUntil: 0,
      playerUntargetableUntil: 0,
      hurtFlashRemain: 0,
      screenShakeUntil: 0,
      screenShakeStrength: 0,
      playerLaserSlowUntil: 0,
      playerSwampSlowUntil: 0,
      swampInfectionMoveLockUntil: 0,
      swampInfectionBurstSlowEnd: 0,
      heartsDeathDefyReadyAt: 0
    };
    function countSuitInRankDeck(suit) {
      let n = 0;
      forEachDeckCard(inventory2, (c) => {
        if (c && c.suit === suit) n += 1;
      });
      return n;
    }
    function getHeartsResistanceCardCount() {
      let n = 0;
      forEachDeckCard(inventory2, (c) => {
        if (c?.effect?.kind === "hitResist") n += 1;
      });
      return n;
    }
    function getFrontShieldArcDeg() {
      const player = getPlayer();
      return Math.max(0, Number(player.frontShieldArcDeg ?? 0));
    }
    function getDodgeChanceWhenDashCd() {
      const player = getPlayer();
      return Math.max(0, Number(player.dodgeChanceWhenDashCd ?? 0));
    }
    function getStunOnHitSecs() {
      const player = getPlayer();
      return Math.max(0, Number(player.stunOnHitSecs ?? 0));
    }
    function getHeartsResistanceCooldown() {
      let totalRank = 0;
      forEachDeckCard(inventory2, (c) => {
        if (c?.effect?.kind === "hitResist") totalRank += c.rank;
      });
      if (totalRank <= 0) return 15;
      return Math.max(3, 15 - 0.5 * totalRank);
    }
    function clearTempHp(player) {
      player.tempHp = 0;
      player.tempHpExpiry = 0;
    }
    function damagePlayer(amount, opts = {}) {
      const elapsed = getSimElapsed();
      const player = getPlayer();
      const rouletteHexOuter = !!opts.rouletteHexOuterPenalty;
      if (!rouletteHexOuter) {
        const invulnGate = Math.max(combat.playerInvulnerableUntil, getCharacterInvulnUntil());
        if (elapsed < invulnGate) return;
        if (elapsed < combat.playerUntargetableUntil) return;
        if (rogueStealthBlocksDamage?.()) return;
        if (getLunaticSprintDamageImmune?.() && !opts.lunaticCrash && !opts.lunaticRoarTerrain) return;
        if (elapsed < (inventory2.clubsInvisUntil ?? 0)) return;
        if ((isDashCoolingDown?.() ?? false) && Math.random() < getDodgeChanceWhenDashCd()) return;
        if (getBulwarkParryActive?.()) return;
        const arcDeg = getFrontShieldArcDeg();
        if (arcDeg > 0 && opts.sourceX != null && opts.sourceY != null) {
          const fx = player.facing?.x ?? 1;
          const fy = player.facing?.y ?? 0;
          const fl = Math.hypot(fx, fy) || 1;
          const nx = fx / fl;
          const ny = fy / fl;
          const vx = opts.sourceX - player.x;
          const vy = opts.sourceY - player.y;
          const vl = Math.hypot(vx, vy) || 1;
          const dot = nx * (vx / vl) + ny * (vy / vl);
          const halfArc = arcDeg * Math.PI / 360;
          if (Math.acos(Math.max(-1, Math.min(1, dot))) <= halfArc) return;
        }
        const heartsResistanceCount = getHeartsResistanceCardCount();
        if (heartsResistanceCount > 0 && elapsed >= (inventory2.heartsResistanceReadyAt ?? 0) && !opts.lunaticCrash && !opts.lunaticRoarTerrain) {
          const cd = getHeartsResistanceCooldown();
          inventory2.heartsResistanceCooldownDuration = cd;
          inventory2.heartsResistanceReadyAt = elapsed + cd;
          return;
        }
      }
      if (amount <= 0) return;
      if (getIsValiant?.()) {
        applyValiantIncomingDamage?.(amount, opts);
        return;
      }
      let rem = amount;
      const temp = player.tempHp ?? 0;
      if (temp > 0) {
        const absorbed = Math.min(rem, temp);
        player.tempHp = temp - absorbed;
        rem -= absorbed;
        if ((player.tempHp ?? 0) <= 0) clearTempHp(player);
      }
      if (rem > 0) player.hp = Math.max(0, player.hp - rem);
      if (opts.floorHpAtMin != null) player.hp = Math.max(opts.floorHpAtMin, player.hp);
      if (rem > 0 && countSuitInRankDeck("clubs") >= SET_BONUS_SUIT_MAX) {
        combat.playerUntargetableUntil = elapsed + CLUBS_13_UNTARGETABLE_SEC;
      }
      if (opts.laserBlueSlow) {
        combat.playerLaserSlowUntil = elapsed + LASER_BLUE_PLAYER_SLOW_SEC;
      }
      combat.hurtFlashRemain = DAMAGE_HURT_FLASH_SEC;
      const invulnSec = getPostHitInvulnerabilitySec?.();
      const invulnDur = typeof invulnSec === "number" && Number.isFinite(invulnSec) && invulnSec > 0 ? invulnSec : DAMAGE_PLAYER_INVULN_SEC;
      combat.playerInvulnerableUntil = elapsed + invulnDur;
      combat.screenShakeUntil = elapsed + DAMAGE_SCREEN_SHAKE_SEC;
      combat.screenShakeStrength = Math.max(combat.screenShakeStrength, DAMAGE_SCREEN_SHAKE_STRENGTH);
      const stunSecs = getStunOnHitSecs();
      if (stunSecs > 0) stunNearbyEnemies?.(stunSecs);
      if (player.hp <= 0) {
        const heartsFull = countSuitInRankDeck("hearts") >= SET_BONUS_SUIT_MAX;
        if (heartsFull && elapsed >= combat.heartsDeathDefyReadyAt) {
          player.hp = 5;
          combat.heartsDeathDefyReadyAt = elapsed + HEARTS_13_DEATH_DEFY_CD_SEC;
          combat.playerInvulnerableUntil = Math.max(combat.playerInvulnerableUntil, elapsed + 0.55);
          return;
        }
        onPlayerDeath?.();
      }
    }
    function tickCombatPresentation(dt) {
      combat.hurtFlashRemain = Math.max(0, combat.hurtFlashRemain - dt);
      combat.screenShakeStrength = Math.max(0, combat.screenShakeStrength - dt * 30);
      const elapsed = getSimElapsed();
      const player = getPlayer();
      if ((player.tempHp ?? 0) > 0 && (player.tempHpExpiry ?? 0) > 0 && elapsed >= player.tempHpExpiry) {
        clearTempHp(player);
      }
    }
    function getShakeOffset() {
      const elapsed = getSimElapsed();
      if (elapsed >= combat.screenShakeUntil) return { x: 0, y: 0 };
      const s = combat.screenShakeStrength;
      return { x: (Math.random() * 2 - 1) * s, y: (Math.random() * 2 - 1) * s };
    }
    function isLaserSlowActive() {
      return getSimElapsed() < combat.playerLaserSlowUntil;
    }
    function applySwampHitSlow() {
      const elapsed = getSimElapsed();
      combat.playerSwampSlowUntil = elapsed + SWAMP_HIT_SLOW_SEC;
    }
    function applySwampInfectionBurst(elapsed) {
      combat.swampInfectionMoveLockUntil = elapsed + SWAMP_INFECTION_BURST_STUN_SEC;
      combat.swampInfectionBurstSlowEnd = elapsed + SWAMP_INFECTION_BURST_STUN_SEC + SWAMP_INFECTION_BURST_SLOW_SEC;
    }
    function isSwampInfectionMoveLocked() {
      return getSimElapsed() < combat.swampInfectionMoveLockUntil;
    }
    function getMovementSlowMult() {
      const elapsed = getSimElapsed();
      let m = 1;
      if (elapsed < combat.playerLaserSlowUntil) m *= LASER_BLUE_PLAYER_SLOW_MULT;
      if (elapsed < combat.playerSwampSlowUntil) m *= SWAMP_HIT_SLOW_MULT;
      if (combat.swampInfectionBurstSlowEnd > 0 && elapsed >= combat.swampInfectionMoveLockUntil && elapsed < combat.swampInfectionBurstSlowEnd) {
        m *= SWAMP_INFECTION_BURST_SLOW_MULT;
      }
      return m;
    }
    function resetCombatState() {
      combat.playerInvulnerableUntil = 0;
      combat.playerUntargetableUntil = 0;
      combat.hurtFlashRemain = 0;
      combat.screenShakeUntil = 0;
      combat.screenShakeStrength = 0;
      combat.playerLaserSlowUntil = 0;
      combat.playerSwampSlowUntil = 0;
      combat.swampInfectionMoveLockUntil = 0;
      combat.swampInfectionBurstSlowEnd = 0;
      combat.heartsDeathDefyReadyAt = 0;
    }
    function bumpScreenShake(strength = DAMAGE_SCREEN_SHAKE_STRENGTH, sec = DAMAGE_SCREEN_SHAKE_SEC) {
      const elapsed = getSimElapsed();
      combat.screenShakeUntil = elapsed + sec;
      combat.screenShakeStrength = Math.max(combat.screenShakeStrength, strength);
    }
    function grantInvulnerabilityUntil(until) {
      combat.playerInvulnerableUntil = Math.max(combat.playerInvulnerableUntil, until);
    }
    function killPlayerImmediate() {
      const player = getPlayer();
      if (player.hp <= 0) return;
      player.hp = 0;
      onPlayerDeath?.();
    }
    return {
      damagePlayer,
      killPlayerImmediate,
      combat,
      tickCombatPresentation,
      getShakeOffset,
      isLaserSlowActive,
      applySwampHitSlow,
      applySwampInfectionBurst,
      isSwampInfectionMoveLocked,
      getMovementSlowMult,
      resetCombatState,
      bumpScreenShake,
      grantInvulnerabilityUntil,
      getHeartsResistanceCardCount,
      getHeartsResistanceCooldown
    };
  }

  // src/escape/debug/runLogger.js
  var MAX_LINES_DEFAULT = 30;
  function fmtNow() {
    const d = /* @__PURE__ */ new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  }
  function createRunLogger(maxLines = MAX_LINES_DEFAULT) {
    const lines = [];
    let onChange = null;
    function emit(level, scope, message, data) {
      const suffix = data == null ? "" : ` ${safeJson(data)}`;
      const line = `[${fmtNow()}] ${level.toUpperCase()} ${scope}: ${message}${suffix}`;
      lines.push(line);
      while (lines.length > maxLines) lines.shift();
      onChange?.(lines.join("\n"));
      if (level === "error") console.error(line);
    }
    return {
      log(scope, message, data) {
        emit("log", scope, message, data);
      },
      error(scope, message, err) {
        emit("error", scope, message, err instanceof Error ? { message: err.message, stack: err.stack } : err);
      },
      bindTextSink(fn) {
        onChange = fn;
        onChange?.(lines.join("\n"));
      },
      lines: () => [...lines],
      text: () => lines.join("\n"),
      clear() {
        lines.length = 0;
        onChange?.("");
      }
    };
  }
  function safeJson(v) {
    try {
      return JSON.stringify(v);
    } catch {
      return "[unserializable]";
    }
  }
  function instrumentObjectMethods(target, scope, logger, options = {}) {
    if (!target || typeof target !== "object") return target;
    const skip = new Set(options.skip ?? []);
    for (const key of Object.keys(target)) {
      if (skip.has(key)) continue;
      const v = target[key];
      if (typeof v !== "function") continue;
      target[key] = (...args) => {
        logger.log(scope, `${key}()`, args.length ? { argc: args.length } : void 0);
        try {
          return v(...args);
        } catch (err) {
          logger.error(scope, `${key}() failed`, err);
          throw err;
        }
      };
    }
    return target;
  }

  // src/escape/map/path/bone.js
  var BONE_PATH_DEF = {
    id: "bone",
    label: "Bone",
    tileTint: "#2a2d33",
    /** @param {any} payload */
    onDamage(payload) {
      return payload;
    },
    /** @param {any} payload */
    onEnemy(payload) {
      return payload;
    },
    /** @param {any} payload */
    onDebuff(payload) {
      return payload;
    }
  };

  // src/escape/map/path/fire.js
  var FIRE_PATH_DEF = {
    id: "fire",
    label: "Fire",
    tileTint: "#341412",
    /** @param {any} payload */
    onDamage(payload) {
      if (!payload || (payload.amount ?? 0) <= 0) return payload;
      const prevOpts = payload.opts || {};
      if (prevOpts.fireIgniteTick || prevOpts.fireNoIgnite) return payload;
      return {
        ...payload,
        opts: {
          ...prevOpts,
          fireApplyIgnite: true
        }
      };
    },
    /** @param {any} payload */
    onEnemy(payload) {
      return payload;
    },
    /** @param {any} payload */
    onDebuff(payload) {
      return payload;
    }
  };

  // src/escape/map/path/swamp.js
  var SWAMP_PATH_DEF = {
    id: "swamp",
    label: "Swamp",
    tileTint: "#122015",
    /** @param {any} payload */
    onDamage(payload) {
      if (!payload) return payload;
      const amount = Number(payload.amount ?? 0);
      const opts = payload.opts || {};
      if (opts.swampInfectionOnly) {
        return {
          ...payload,
          amount: 0,
          opts: { ...opts, swampApplyInfection: true }
        };
      }
      if (amount <= 0) return payload;
      return {
        ...payload,
        opts: { ...opts, swampApplyInfection: true }
      };
    },
    /** @param {any} payload */
    onEnemy(payload) {
      return payload;
    },
    /** @param {any} payload */
    onDebuff(payload) {
      return payload;
    }
  };

  // src/escape/run/pathRuntime.js
  var PATH_DEFS = [BONE_PATH_DEF, FIRE_PATH_DEF, SWAMP_PATH_DEF];
  var PATH_BY_ID = new Map(PATH_DEFS.map((d) => [d.id, d]));
  function normalizePathId(value) {
    if (typeof value !== "string") return null;
    return PATH_BY_ID.has(
      /** @type {PathId} */
      value
    ) ? (
      /** @type {PathId} */
      value
    ) : null;
  }
  function createPathRuntime(opts = {}) {
    const rng = typeof opts.rng === "function" ? opts.rng : Math.random;
    let currentPathId = null;
    let forcedPathId = null;
    let assignedAtLevel = null;
    function resetRun() {
      currentPathId = null;
      forcedPathId = null;
      assignedAtLevel = null;
    }
    function pickRandomPathId() {
      const i = Math.max(0, Math.min(PATH_DEFS.length - 1, Math.floor(rng() * PATH_DEFS.length)));
      return PATH_DEFS[i].id;
    }
    function ensurePathAssignedForLevel(runLevel2) {
      if (forcedPathId) {
        currentPathId = forcedPathId;
        assignedAtLevel = Math.max(1, runLevel2);
        return currentPathId;
      }
      if (runLevel2 < 1) return currentPathId;
      if (!currentPathId) {
        currentPathId = pickRandomPathId();
        assignedAtLevel = runLevel2;
      }
      return currentPathId;
    }
    function setForcedPathId(pathId) {
      forcedPathId = normalizePathId(pathId);
      if (forcedPathId) {
        currentPathId = forcedPathId;
        if (assignedAtLevel == null) assignedAtLevel = 0;
      }
      return forcedPathId;
    }
    function getPathVisualConfig() {
      const def = currentPathId ? PATH_BY_ID.get(currentPathId) : null;
      return {
        id: currentPathId,
        label: def?.label ?? "None",
        tileTint: def?.tileTint ?? "#0f172a"
      };
    }
    function currentPathDef() {
      return currentPathId ? PATH_BY_ID.get(currentPathId) ?? null : null;
    }
    function applyDamageHooks(payload) {
      const def = currentPathDef();
      return def?.onDamage ? def.onDamage(payload) : payload;
    }
    function applyEnemyHooks(payload) {
      const def = currentPathDef();
      return def?.onEnemy ? def.onEnemy(payload) : payload;
    }
    function applyDebuffHooks(payload) {
      const def = currentPathDef();
      return def?.onDebuff ? def.onDebuff(payload) : payload;
    }
    return {
      resetRun,
      ensurePathAssignedForLevel,
      setForcedPathId,
      getPathVisualConfig,
      getCurrentPathId: () => currentPathId,
      getForcedPathId: () => forcedPathId,
      getAssignedAtLevel: () => assignedAtLevel,
      getPathDefs: () => PATH_DEFS.slice(),
      applyDamageHooks,
      applyEnemyHooks,
      applyDebuffHooks
    };
  }

  // src/escape/hud/pathShellTheme.js
  var SHELL_THEMES = {
    default: {
      body: "#111827",
      panel: "#1e293b",
      deep: "#0f172a",
      mid: "#111827",
      veil: "#0b1220",
      panelAlt: "#1f2937",
      border: "#334155",
      borderBright: "#475569",
      hover: "#334155",
      bpA: "#172033",
      bpB: "#0c1424",
      inkOnLight: "#0f172a",
      inkRgb: "2, 6, 23",
      deepRgb: "15, 23, 42",
      panelRgb: "30, 41, 59"
    },
    fire: {
      body: "#1a1010",
      panel: "#422626",
      deep: "#2c1515",
      mid: "#1c0e0e",
      veil: "#120909",
      panelAlt: "#3a2323",
      border: "#4a3535",
      borderBright: "#5c4545",
      hover: "#5a3a3a",
      bpA: "#301a1a",
      bpB: "#140808",
      inkOnLight: "#2c1515",
      inkRgb: "26, 8, 8",
      deepRgb: "44, 21, 21",
      panelRgb: "66, 38, 38"
    },
    swamp: {
      body: "#101816",
      panel: "#1e332c",
      deep: "#142922",
      mid: "#0f1a16",
      veil: "#0a100d",
      panelAlt: "#1a2d26",
      border: "#2a3f36",
      borderBright: "#3d5249",
      hover: "#2f4a3e",
      bpA: "#163026",
      bpB: "#0a1510",
      inkOnLight: "#142922",
      inkRgb: "6, 18, 12",
      deepRgb: "20, 41, 34",
      panelRgb: "36, 58, 48"
    },
    bone: {
      body: "#151618",
      panel: "#343842",
      deep: "#23262d",
      mid: "#141518",
      veil: "#0b0c0f",
      panelAlt: "#2d313a",
      border: "#3d424d",
      borderBright: "#525866",
      hover: "#4a505e",
      bpA: "#282c35",
      bpB: "#12141a",
      inkOnLight: "#23262d",
      inkRgb: "12, 14, 18",
      deepRgb: "35, 38, 45",
      panelRgb: "52, 56, 66"
    }
  };
  function applyPathShellTheme(pathId) {
    const key = pathId === "fire" || pathId === "swamp" || pathId === "bone" ? (
      /** @type {ShellThemeId} */
      pathId
    ) : "default";
    const t = SHELL_THEMES[key];
    const r = document.documentElement;
    r.style.setProperty("--escape-ui-body", t.body);
    r.style.setProperty("--escape-ui-panel", t.panel);
    r.style.setProperty("--escape-ui-deep", t.deep);
    r.style.setProperty("--escape-ui-mid", t.mid);
    r.style.setProperty("--escape-ui-veil", t.veil);
    r.style.setProperty("--escape-ui-panel-alt", t.panelAlt);
    r.style.setProperty("--escape-ui-border", t.border);
    r.style.setProperty("--escape-ui-border-bright", t.borderBright);
    r.style.setProperty("--escape-ui-hover", t.hover);
    r.style.setProperty("--escape-ui-bp-a", t.bpA);
    r.style.setProperty("--escape-ui-bp-b", t.bpB);
    r.style.setProperty("--escape-ui-ink-on-light", t.inkOnLight);
    r.style.setProperty("--escape-ui-ink-rgb", t.inkRgb);
    r.style.setProperty("--escape-ui-deep-rgb", t.deepRgb);
    r.style.setProperty("--escape-ui-panel-rgb", t.panelRgb);
  }

  // src/escape/entry.js
  var FLOOR_HEX_FILL = "#0f172a";
  var activeCharacterId = "knight";
  var runLevel = 0;
  var BEST_SURVIVAL_LS_KEY = "escape-best-survival-sec";
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
      const L2 = Math.hypot(dx, dy) || 1;
      return { dx: dx / L2 * r, dy: dy / L2 * r };
    }
    const L = Math.sqrt(d2);
    const pen = r - L;
    return { dx: dx / L * pen, dy: dy / L * pen };
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
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
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
    if (runLogLiveEl) runLogger.bindTextSink((text) => runLogLiveEl.textContent = text);
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
      setTimeout(() => URL.revokeObjectURL(a.href), 1e3);
    });
    runLogger.log("entry", "boot");
    const mobileUiEnabled = shouldUseMobileUi(window);
    document.body.classList.toggle("is-mobile-ui", mobileUiEnabled);
    const characterSelectModalEl = document.getElementById("character-select-modal");
    const mobileUnpauseBtn = document.getElementById("mobile-unpause-btn");
    let hasLockedInitialHeroFromModal = !mobileUiEnabled;
    let expectingCharacterPickAfterDeath = false;
    let hunterRuntime = (
      /** @type {ReturnType<typeof createHunterRuntime> | null} */
      null
    );
    let hexEventRuntime = (
      /** @type {ReturnType<typeof createEventHexController> | null} */
      null
    );
    let simElapsed = 0;
    const worldToHex = (x, y) => worldToAxial(x, y, HEX_SIZE);
    const hexToWorld = (q, r) => axialToWorld(q, r, HEX_SIZE);
    const specials = instrumentObjectMethods(createSpecialHexRuntime({
      HEX_DIRS,
      hexKey,
      getIsLunatic: () => activeCharacterId === "lunatic",
      getSimElapsed: () => simElapsed
    }), "specials", runLogger);
    const safehouseHexFlow = instrumentObjectMethods(createSafehouseHexFlow(), "safehouse", runLogger);
    specials.setOnProceduralSafehousePlaced(() => safehouseHexFlow.onProceduralSafehousePlaced());
    const rouletteHexFlow = instrumentObjectMethods(createRouletteHexFlow({ hexKey }), "rouletteHex", runLogger);
    const forgeHexFlow = instrumentObjectMethods(createForgeHexFlow({ hexKey }), "forgeHex", runLogger);
    let rouletteModal = (
      /** @type {ReturnType<typeof createRouletteModal> | null} */
      null
    );
    let forgeWorldModal = (
      /** @type {ReturnType<typeof createForgeWorldModal> | null} */
      null
    );
    const tileConfig = {
      BLOCK,
      hexSize: HEX_SIZE,
      ...referenceTileGridFromCanvasHeight(canvas.height)
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
      purgeProceduralSpecialAnchorsOutsideWindow: (neededKeys) => specials.purgeProceduralSpecialAnchorsOutsideWindow(neededKeys)
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
          lastPlayerHexKey
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
      _py: 0
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
      lastPlayerHexKey
    }));
    activeCharacterId = resolveImplementedHeroId(activeCharacterId);
    const inventory2 = createEmptyInventory();
    inventory2.clubsInvisUntil = 0;
    inventory2.spadesLandingStealthUntil = 0;
    inventory2.spadesObstacleBoostUntil = 0;
    inventory2.heartsResistanceReadyAt = 0;
    inventory2.heartsResistanceCooldownDuration = 0;
    inventory2.swampInfectionStacks = 0;
    inventory2.heartsRegenPerSec = 0;
    inventory2.heartsRegenBank = 0;
    const rogueWorld = createRogueWorld();
    rogueWorld.reset(0, player);
    const valiantWorld = createValiantWorld();
    const bulwarkWorld = createBulwarkWorld();
    let character = instrumentObjectMethods(
      createCharacterController(activeCharacterId, rogueWorld, valiantWorld, bulwarkWorld),
      "character",
      runLogger,
      {
        skip: ["getAbilityHud"]
      }
    );
    function obstaclesForPlayerCollision() {
      if (activeCharacterId === "rogue" && rogueWorld.clubsPhaseThroughObstacles(inventory2, player.x, player.y, simElapsed)) {
        return [];
      }
      if (activeCharacterId === "knight" && countSuitsInActiveSlots(inventory2).clubs >= SET_BONUS_SUIT_THRESHOLD && typeof character.getBurstVisualUntil === "function" && simElapsed < character.getBurstVisualUntil(simElapsed)) {
        return [];
      }
      if (activeCharacterId === "valiant" && countSuitsInActiveSlots(inventory2).clubs >= SET_BONUS_SUIT_THRESHOLD && typeof character.getValiantSurgeUntil === "function" && simElapsed < character.getValiantSurgeUntil()) {
        return [];
      }
      return obstacles;
    }
    function knightHasClubsSevenSet() {
      return countSuitsInActiveSlots(inventory2).clubs >= SET_BONUS_SUIT_THRESHOLD;
    }
    function ejectKnightFromSolidTerrainIfNeeded() {
      if (activeCharacterId !== "knight" || !knightHasClubsSevenSet()) return;
      if (!circleOverlapsAnyRect(player.x, player.y, player.r, obstacles)) return;
      const res = resolvePlayerAgainstRects(player.x, player.y, player.r, obstacles);
      player.x = res.x;
      player.y = res.y;
      if (!circleOverlapsAnyRect(player.x, player.y, player.r, obstacles)) return;
      const ox = player.x;
      const oy = player.y;
      const pr = player.r;
      const maxPush = pr * 14;
      for (let dist = 4; dist <= maxPush; dist += 4) {
        for (let s = 0; s < 24; s++) {
          const ang = s / 24 * Math.PI * 2 + dist * 0.17;
          const cx = ox + Math.cos(ang) * dist;
          const cy = oy + Math.sin(ang) * dist;
          if (!circleOverlapsAnyRect(cx, cy, pr, obstacles)) {
            player.x = cx;
            player.y = cy;
            return;
          }
        }
      }
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
    const collectibles = [];
    const attackRings = [];
    const lunaticSprintTierFx = (
      /** @type {{ bornAt: number; expiresAt: number; tier: 2 | 4 }[]} */
      []
    );
    const ultimateEffects = [];
    const ultimateShields = [];
    const ultimateBurstWaves = [];
    let timelockEnemyFrom = 0;
    let timelockEnemyUntil = 0;
    let playerTimelockUntil = 0;
    let timelockWorldShakeAt = 0;
    let ultimateSpeedUntil = 0;
    let knightSpadesWorldSlowUntil = 0;
    let fireIgniteUntil = 0;
    let fireIgniteNextTickAt = 0;
    let fireIgniteTickStep = 1;
    let boneBlindDebuffPeakEnd = 0;
    let boneBlindDebuffFadeEnd = 0;
    let boneBlindDebuffFromBlueLaser = false;
    const BONE_BLIND_DEBUFF_PEAK_SEC = 0.92;
    const BONE_BLIND_DEBUFF_FADE_SEC = 0.55;
    let prevKnightClubsInvisActive = false;
    let prevKnightBurstTerrainPhase = false;
    const FIRE_GROWTH_ZONE_VISUAL_RADIUS_MULT = 1.9;
    let swampInfectionTenBurstAt = 0;
    let swampInfectionDebuffOverlayUntil = 0;
    let swampInfectionChainLockUntil = 0;
    let swampInfectionStackLastAt = 0;
    const swampDamageInstanceSeenAt = /* @__PURE__ */ new Map();
    const swampMudTrail = (
      /** @type {{ x: number; y: number; t: number }[]} */
      []
    );
    let swampMudTrailLastX = NaN;
    let swampMudTrailLastY = NaN;
    const SWAMP_MUD_TRAIL_MAX = 58;
    const SWAMP_MUD_TRAIL_SAMPLE_MIN = 4.2;
    const SWAMP_MUD_TRAIL_DECAY_SEC = 5.2;
    const SWAMP_ENEMY_TRAIL_MAX = 36;
    const SWAMP_TRAIL_HUNTER_TYPES = /* @__PURE__ */ new Set(["chaser", "frogChaser", "cutter"]);
    const swampHunterMudTrailByHunter = /* @__PURE__ */ new WeakMap();
    const knightSwampDashSplashes = (
      /** @type {{ x: number; y: number; bornAt: number; pr: number }[]} */
      []
    );
    const KNIGHT_SWAMP_DASH_SPLASH_SEC = 0.62;
    const damagePopups = (
      /** @type {{ x: number; y: number; bornAt: number; expiresAt: number; base: number; swampBonus: number; driftX: number }[]} */
      []
    );
    const fireGrowthZones = (
      /** @type {Array<{
        key: string;
        q: number;
        r: number;
        x: number;
        y: number;
        bornAt: number;
        growDur: number;
        baseR: number;
        maxR: number;
        nextTouchDamageAt: number;
        seed: number;
      }>} */
      []
    );
    let nextHealSpawnAt = 3.5;
    let nextCardSpawnAt = 10;
    const MAX_HEAL_CRYSTALS = 6;
    const MAX_CARD_PICKUPS = 4;
    let runDead = false;
    let manualPause = false;
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
    function showDeathScreen(stats) {
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
    let playerDamage;
    playerDamage = createPlayerDamage({
      getSimElapsed: () => simElapsed,
      getPlayer: () => player,
      inventory: inventory2,
      getCharacterInvulnUntil: () => character.getInvulnUntil(),
      rogueStealthBlocksDamage: () => activeCharacterId === "rogue" && rogueWorld.stealthBlocksDamage(simElapsed, inventory2),
      getLunaticSprintDamageImmune: () => activeCharacterId === "lunatic" && typeof character.getLunaticSprintDamageImmune === "function" && character.getLunaticSprintDamageImmune(),
      getIsValiant: () => activeCharacterId === "valiant",
      applyValiantIncomingDamage: (amount, opts) => {
        valiantWorld.applyDamage(amount, opts, {
          getSimElapsed: () => simElapsed,
          getPlayer: () => player,
          inventory: inventory2,
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
          onWillDeath: () => playerDamage.killPlayerImmediate()
        });
      },
      isDashCoolingDown: () => typeof character.isDashCoolingDown === "function" ? character.isDashCoolingDown(simElapsed) : false,
      getBulwarkParryActive: () => activeCharacterId === "bulwark" && typeof character.getBulwarkParryUntil === "function" && simElapsed < character.getBulwarkParryUntil(),
      getPostHitInvulnerabilitySec: () => activeCharacterId === "bulwark" ? BULWARK_POST_HIT_INVULN_SEC : null,
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
        }
        const wave = hunterRuntime?.spawnState?.wave ?? 0;
        const hunters = hunterRuntime?.entities?.hunters?.length ?? 0;
        showDeathScreen({
          survival,
          displayLevel: runLevel + 1,
          wave,
          hunters,
          best: bestSurvivalSec
        });
        attackRings.length = 0;
        lunaticSprintTierFx.length = 0;
      }
    });
    function resetSwampInfection() {
      inventory2.swampInfectionStacks = 0;
      swampInfectionTenBurstAt = 0;
      swampInfectionDebuffOverlayUntil = 0;
      swampInfectionChainLockUntil = 0;
      swampInfectionStackLastAt = 0;
      swampDamageInstanceSeenAt.clear();
    }
    function finalizeSwampBootlegCrystalPick(offer) {
      const h = Math.max(0, Math.floor(offer.heal ?? 0));
      if (activeCharacterId === "lunatic") {
        player.hp = Math.min(player.maxHp, player.hp + h);
      } else if (activeCharacterId === "valiant" && typeof character.onHealCrystalPickup === "function") {
        character.onHealCrystalPickup(buildAbilityContext(0), h);
      } else {
        player.hp = Math.min(player.maxHp, player.hp + h);
      }
      applySwampBootlegOffer(inventory2, offer, simElapsed, () => {
        swampBootlegCurseUid += 1;
        return swampBootlegCurseUid;
      });
      fireIgniteUntil = 0;
      fireIgniteNextTickAt = 0;
      fireIgniteTickStep = 1;
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
        driftX: (Math.random() - 0.5) * 28
      });
      if (damagePopups.length > 90) damagePopups.splice(0, damagePopups.length - 90);
    }
    function drawDamagePopups(ctx2) {
      for (let i = damagePopups.length - 1; i >= 0; i--) {
        const p = damagePopups[i];
        if (simElapsed >= p.expiresAt) {
          damagePopups.splice(i, 1);
          continue;
        }
        const u = clamp7((simElapsed - p.bornAt) / Math.max(1e-3, p.expiresAt - p.bornAt), 0, 1);
        const alpha = 1 - u;
        const px = p.x + p.driftX * u;
        const py = p.y - u * 40;
        ctx2.save();
        ctx2.textAlign = "center";
        ctx2.textBaseline = "bottom";
        ctx2.font = 'bold 15px ui-sans-serif, system-ui, "Segoe UI", sans-serif';
        ctx2.lineWidth = 4;
        const baseTxt = `-${p.base}`;
        ctx2.strokeStyle = `rgba(2, 6, 23, ${0.85 * alpha})`;
        ctx2.strokeText(baseTxt, px, py);
        ctx2.fillStyle = `rgba(248, 113, 113, ${alpha})`;
        ctx2.fillText(baseTxt, px, py);
        if (p.swampBonus > 0) {
          const extraTxt = `-${p.swampBonus}`;
          ctx2.font = 'bold 13px ui-sans-serif, system-ui, "Segoe UI", sans-serif';
          ctx2.strokeStyle = `rgba(2, 6, 23, ${0.8 * alpha})`;
          ctx2.strokeText(extraTxt, px + 20, py - 8);
          ctx2.fillStyle = `rgba(163, 230, 53, ${alpha})`;
          ctx2.fillText(extraTxt, px + 20, py - 8);
        }
        ctx2.restore();
      }
    }
    function drawFireAtmosphereWorld(ctx2, viewW, viewH) {
      const pulse = 0.5 + 0.5 * Math.sin(simElapsed * 1.9);
      const r1 = Math.max(viewW, viewH) * 0.66;
      const r2 = Math.max(viewW, viewH) * 0.98;
      const g1 = ctx2.createRadialGradient(player.x, player.y, r1 * 0.08, player.x, player.y, r1);
      g1.addColorStop(0, `rgba(254, 215, 170, ${0.09 + pulse * 0.06})`);
      g1.addColorStop(0.5, `rgba(251, 146, 60, ${0.075 + pulse * 0.05})`);
      g1.addColorStop(1, "rgba(127, 29, 29, 0)");
      ctx2.fillStyle = g1;
      ctx2.fillRect(cameraX - 24, cameraY - 24, viewW + 48, viewH + 48);
      const g2 = ctx2.createRadialGradient(player.x, player.y, r2 * 0.18, player.x, player.y, r2);
      g2.addColorStop(0, "rgba(0, 0, 0, 0)");
      g2.addColorStop(0.62, "rgba(120, 53, 15, 0.2)");
      g2.addColorStop(1, "rgba(69, 10, 10, 0.4)");
      ctx2.fillStyle = g2;
      ctx2.fillRect(cameraX - 24, cameraY - 24, viewW + 48, viewH + 48);
      const emberN = 32;
      for (let i = 0; i < emberN; i++) {
        const seed = i * 17.13;
        const t = simElapsed * (0.32 + i * 0.02);
        const sx = cameraX + ((Math.sin(t + seed) * 0.5 + 0.5) * (viewW + 140) - 70);
        const sy = cameraY + ((Math.sin(t * 0.7 + seed * 1.37) * 0.5 + 0.5) * (viewH + 140) - 70);
        const rr = 1.5 + i % 4 * 0.9;
        const a = 0.12 + (0.5 + 0.5 * Math.sin(simElapsed * 3.6 + i)) * 0.18;
        ctx2.fillStyle = i % 5 === 0 ? `rgba(254, 215, 170, ${a})` : `rgba(251, 146, 60, ${a})`;
        ctx2.beginPath();
        ctx2.arc(sx, sy, rr, 0, Math.PI * 2);
        ctx2.fill();
      }
    }
    function getSwampAtmosphereAnchorWorld(viewW, viewH) {
      return { x: cameraX + viewW * 0.5, y: cameraY + viewH * 0.5 };
    }
    function drawSwampAtmosphereBackgroundWorld(ctx2, viewW, viewH) {
      const anchor = getSwampAtmosphereAnchorWorld(viewW, viewH);
      const rMax = Math.max(viewW, viewH) * 0.95;
      const g1 = ctx2.createRadialGradient(anchor.x, anchor.y, rMax * 0.11, anchor.x, anchor.y, rMax * 0.52);
      g1.addColorStop(0, "rgba(42, 58, 48, 0.095)");
      g1.addColorStop(0.5, "rgba(22, 38, 30, 0.072)");
      g1.addColorStop(1, "rgba(15, 23, 42, 0)");
      ctx2.fillStyle = g1;
      ctx2.fillRect(cameraX - 28, cameraY - 28, viewW + 56, viewH + 56);
      const g2 = ctx2.createRadialGradient(anchor.x, anchor.y, rMax * 0.2, anchor.x, anchor.y, rMax);
      g2.addColorStop(0, "rgba(0, 0, 0, 0)");
      g2.addColorStop(0.58, "rgba(6, 26, 18, 0.44)");
      g2.addColorStop(0.82, "rgba(4, 16, 12, 0.56)");
      g2.addColorStop(1, "rgba(2, 8, 6, 0.68)");
      ctx2.fillStyle = g2;
      ctx2.fillRect(cameraX - 28, cameraY - 28, viewW + 56, viewH + 56);
      const footY0 = cameraY + viewH * 0.66;
      const footG = ctx2.createLinearGradient(cameraX, footY0, cameraX, cameraY + viewH + 24);
      footG.addColorStop(0, "rgba(28, 22, 16, 0)");
      footG.addColorStop(0.35, "rgba(24, 30, 22, 0.06)");
      footG.addColorStop(0.72, "rgba(20, 26, 20, 0.1)");
      footG.addColorStop(1, "rgba(14, 20, 16, 0.14)");
      ctx2.fillStyle = footG;
      ctx2.fillRect(cameraX - 32, footY0 - 6, viewW + 64, viewH * 0.38 + 32);
      const L = activeHexes.length;
      if (!L) return;
      for (const h of activeHexes) {
        const mix = h.q * 9283711 + h.r * 689287 >>> 0;
        const { x: hx, y: hy } = hexToWorld(h.q, h.r);
        const wobx = Math.sin((mix & 4095) * 15e-4) * HEX_SIZE * 0.07;
        const woby = Math.cos((mix >> 12 & 4095) * 14e-4) * HEX_SIZE * 0.06;
        const peat = ctx2.createRadialGradient(hx, hy + HEX_SIZE * 0.1, 0, hx, hy + HEX_SIZE * 0.08, HEX_SIZE * 0.95);
        peat.addColorStop(0, "rgba(38, 30, 22, 0.22)");
        peat.addColorStop(0.55, "rgba(22, 32, 26, 0.11)");
        peat.addColorStop(1, "rgba(12, 22, 18, 0)");
        ctx2.fillStyle = peat;
        ctx2.beginPath();
        ctx2.arc(hx, hy + HEX_SIZE * 0.06, HEX_SIZE * 0.88, 0, Math.PI * 2);
        ctx2.fill();
        const fr = HEX_SIZE * (0.88 + mix % 5 * 0.04);
        const fog = ctx2.createRadialGradient(hx + wobx, hy + woby, 0, hx + wobx, hy + woby, fr);
        fog.addColorStop(0, "rgba(55, 88, 72, 0.085)");
        fog.addColorStop(0.55, "rgba(28, 52, 42, 0.06)");
        fog.addColorStop(1, "rgba(10, 28, 22, 0)");
        ctx2.fillStyle = fog;
        ctx2.beginPath();
        ctx2.arc(hx + wobx, hy + woby, fr, 0, Math.PI * 2);
        ctx2.fill();
      }
    }
    function pruneSwampMudTrailPoints(points) {
      const cutoff = simElapsed - SWAMP_MUD_TRAIL_DECAY_SEC;
      while (points.length > 0 && points[0].t < cutoff) points.shift();
    }
    function pruneSwampMudTrail() {
      pruneSwampMudTrailPoints(swampMudTrail);
    }
    function drawSwampMudTrailStrip(ctx2, points, opts) {
      const n = points.length;
      if (n < 2) return;
      const decay = SWAMP_MUD_TRAIL_DECAY_SEC;
      const SHELLS = 6;
      const salt = opts.salt >>> 0;
      const headR = Math.max(4, opts.headR);
      ctx2.lineCap = "round";
      ctx2.lineJoin = "round";
      for (let i = 1; i < n; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const u0 = Math.max(0, 1 - (simElapsed - p0.t) / decay);
        const u1 = Math.max(0, 1 - (simElapsed - p1.t) / decay);
        const u = Math.min(u0, u1);
        if (u <= 0.015) continue;
        const mixH = ((Math.floor(p0.x * 0.7) ^ Math.floor(p0.y * 0.61) ^ Math.floor(p1.x * 0.67) ^ Math.floor(p1.y * 0.6) ^ salt) >>> 0) % 4096;
        const jagW = 0.55 + (mixH & 255) / 255 * 1.05;
        const jagNarrow = 0.62 + (mixH >> 8 & 255) / 255 * 0.55;
        const wMax = (7 + u * 19) * jagW;
        const aBase = (0.055 + u * 0.2) * (0.72 + (mixH >> 4 & 127) / 127 * 0.48);
        for (let s = SHELLS - 1; s >= 0; s--) {
          const outerness = s / Math.max(1, SHELLS - 1);
          const lw = wMax * (0.14 + 0.86 * outerness) * jagNarrow;
          const wash = Math.pow(Math.max(0, u), 0.28 + outerness * 1.55);
          if (wash < 0.02 || lw < 0.6) continue;
          const aBr = aBase * wash;
          const mottle = (mixH >>> s % 5 ^ s * 17489) & 1;
          const br = mottle ? { r: 52, g: 38, b: 28, ir: 22, ig: 34, ib: 28 } : { r: 28, g: 20, b: 14, ir: 12, ig: 22, ib: 16 };
          ctx2.beginPath();
          ctx2.moveTo(p0.x, p0.y);
          ctx2.lineTo(p1.x, p1.y);
          ctx2.strokeStyle = `rgba(${br.r}, ${br.g}, ${br.b}, ${aBr})`;
          ctx2.lineWidth = lw;
          ctx2.stroke();
          ctx2.beginPath();
          ctx2.moveTo(p0.x, p0.y);
          ctx2.lineTo(p1.x, p1.y);
          ctx2.strokeStyle = `rgba(${br.ir}, ${br.ig}, ${br.ib}, ${aBr * 0.5})`;
          ctx2.lineWidth = lw * 0.42;
          ctx2.stroke();
        }
      }
      const newest = points[n - 1];
      const nu = Math.max(0, 1 - (simElapsed - newest.t) / decay);
      if (nu > 0.02) {
        const splashR = headR * 1.65 + 10 + nu * 8;
        const inward = 1 - nu;
        const g = ctx2.createRadialGradient(newest.x, newest.y, 0, newest.x, newest.y, splashR);
        const mid = 0.22 + inward * 0.38;
        const midA = (0.09 + nu * 0.06) * (1 - inward * 0.55);
        g.addColorStop(0, `rgba(46, 36, 28, ${(0.12 + nu * 0.05) * (0.55 + 0.45 * nu)})`);
        g.addColorStop(mid * 0.55, `rgba(38, 32, 26, ${midA * 0.95})`);
        g.addColorStop(mid, `rgba(32, 40, 32, ${midA * 0.72})`);
        g.addColorStop(mid + (1 - mid) * (0.35 + inward * 0.35), `rgba(24, 32, 26, ${midA * 0.35 * (1 - inward * 0.8)})`);
        g.addColorStop(1, "rgba(14, 22, 18, 0)");
        ctx2.fillStyle = g;
        ctx2.beginPath();
        ctx2.arc(newest.x, newest.y, splashR, 0, Math.PI * 2);
        ctx2.fill();
      }
    }
    function drawSwampMudTrailWorld(ctx2) {
      pruneSwampMudTrail();
      ctx2.save();
      ctx2.lineCap = "round";
      ctx2.lineJoin = "round";
      drawSwampMudTrailStrip(ctx2, swampMudTrail, { headR: player.r, salt: 0 });
      if (hunterRuntime) {
        for (const h of hunterRuntime.entities.hunters) {
          if (!SWAMP_TRAIL_HUNTER_TYPES.has(h.type)) continue;
          const st = swampHunterMudTrailByHunter.get(h);
          if (!st || st.points.length < 2) continue;
          pruneSwampMudTrailPoints(st.points);
          if (st.points.length < 2) continue;
          const salt = (h.bornAt * 1009 ^ String(h.type).length * 131) >>> 0;
          drawSwampMudTrailStrip(ctx2, st.points, { headR: h.r, salt });
        }
      }
      ctx2.restore();
    }
    function getSwampHunterMudTrailState(h) {
      let st = swampHunterMudTrailByHunter.get(h);
      if (!st) {
        st = {
          points: (
            /** @type {{ x: number; y: number; t: number }[]} */
            []
          ),
          lastX: NaN,
          lastY: NaN,
          prevX: h.x,
          prevY: h.y
        };
        swampHunterMudTrailByHunter.set(h, st);
      }
      return st;
    }
    function tickSwampHunterMudTrails(dt) {
      if (!hunterRuntime) return;
      const pdt = Math.max(dt, 1e-5);
      for (const h of hunterRuntime.entities.hunters) {
        if (!SWAMP_TRAIL_HUNTER_TYPES.has(h.type)) {
          swampHunterMudTrailByHunter.delete(h);
          continue;
        }
        const st = getSwampHunterMudTrailState(h);
        const vx = (h.x - st.prevX) / pdt;
        const vy = (h.y - st.prevY) / pdt;
        st.prevX = h.x;
        st.prevY = h.y;
        const sp = Math.hypot(vx, vy);
        pruneSwampMudTrailPoints(st.points);
        if (sp > 20) {
          if (!Number.isFinite(st.lastX)) {
            st.points.push({ x: h.x, y: h.y, t: simElapsed });
            st.lastX = h.x;
            st.lastY = h.y;
          } else {
            const d = Math.hypot(h.x - st.lastX, h.y - st.lastY);
            if (d >= SWAMP_MUD_TRAIL_SAMPLE_MIN) {
              st.points.push({ x: h.x, y: h.y, t: simElapsed });
              st.lastX = h.x;
              st.lastY = h.y;
              while (st.points.length > SWAMP_ENEMY_TRAIL_MAX) st.points.shift();
            }
          }
        }
      }
    }
    function clearSwampHunterMudTrails() {
      if (!hunterRuntime) return;
      for (const h of hunterRuntime.entities.hunters) {
        swampHunterMudTrailByHunter.delete(h);
      }
    }
    function drawKnightSwampDashSplashesWorld(ctx2) {
      const dur = KNIGHT_SWAMP_DASH_SPLASH_SEC;
      const now = simElapsed;
      for (let i = knightSwampDashSplashes.length - 1; i >= 0; i--) {
        if (now - knightSwampDashSplashes[i].bornAt > dur) knightSwampDashSplashes.splice(i, 1);
      }
      ctx2.save();
      ctx2.lineCap = "round";
      ctx2.lineJoin = "round";
      for (const s of knightSwampDashSplashes) {
        const u = (now - s.bornAt) / dur;
        if (u >= 1) continue;
        const pr = Math.max(12, Number(s.pr) || PLAYER_RADIUS);
        const rx = s.x;
        const ry = s.y;
        const fade = Math.pow(1 - u, 1.05);
        const hit = Math.sin(Math.min(1, u / 0.1) * Math.PI);
        const vis = fade * (0.55 + 0.45 * hit);
        const outerR = pr * 2.45 + 52 + u * (pr * 1.05 + 42);
        const g = ctx2.createRadialGradient(rx, ry + 4, 0, rx, ry, outerR);
        g.addColorStop(0, `rgba(46, 34, 26, ${0.55 * vis})`);
        g.addColorStop(0.22, `rgba(40, 30, 22, ${0.48 * vis})`);
        g.addColorStop(0.45, `rgba(34, 42, 30, ${0.32 * vis})`);
        g.addColorStop(0.72, `rgba(24, 34, 26, ${0.16 * fade})`);
        g.addColorStop(1, "rgba(10, 16, 12, 0)");
        ctx2.fillStyle = g;
        ctx2.beginPath();
        ctx2.ellipse(rx, ry + 6, outerR * 1.06, outerR * 0.86, 0, 0, Math.PI * 2);
        ctx2.fill();
        const salt = (Math.floor(rx) * 92837111 ^ Math.floor(ry) * 689287451) >>> 0;
        const spokes = 15;
        const len0 = pr * 1.25 + 36;
        for (let k = 0; k < spokes; k++) {
          const ang = k / spokes * Math.PI * 2 + (salt & 4095) * 35e-5 + u * 0.15;
          const len = len0 * (1.05 - u * 0.92) + (salt >>> k % 9 & 19);
          const inner = pr * 0.22;
          const aSp = 0.38 * fade * (0.7 + 0.3 * hit);
          ctx2.strokeStyle = `rgba(52, 38, 28, ${aSp})`;
          ctx2.lineWidth = 6 + (1 - u) * 8;
          ctx2.beginPath();
          ctx2.moveTo(rx + Math.cos(ang) * inner, ry + Math.sin(ang) * inner);
          ctx2.lineTo(rx + Math.cos(ang) * (inner + len), ry + Math.sin(ang) * (inner + len));
          ctx2.stroke();
          ctx2.strokeStyle = `rgba(20, 30, 24, ${aSp * 0.5})`;
          ctx2.lineWidth = 2.8;
          ctx2.beginPath();
          ctx2.moveTo(rx + Math.cos(ang) * inner, ry + Math.sin(ang) * inner);
          ctx2.lineTo(rx + Math.cos(ang) * (inner + len * 0.52), ry + Math.sin(ang) * (inner + len * 0.52));
          ctx2.stroke();
        }
        const ringR = pr * 2.15 + 28 + u * (pr + 56);
        ctx2.strokeStyle = `rgba(36, 28, 20, ${0.45 * fade})`;
        ctx2.lineWidth = 8 + (1 - u) * 7;
        ctx2.beginPath();
        ctx2.arc(rx, ry, ringR, 0, Math.PI * 2);
        ctx2.stroke();
        ctx2.strokeStyle = `rgba(22, 34, 26, ${0.28 * fade})`;
        ctx2.lineWidth = 3.5;
        ctx2.beginPath();
        ctx2.arc(rx, ry, ringR + 8 + u * 12, 0, Math.PI * 2);
        ctx2.stroke();
      }
      ctx2.restore();
    }
    function drawSwampPlayerMudChurnWorld(ctx2) {
      const px = player.x;
      const py = player.y;
      const ph = 0.5 + 0.5 * Math.sin(simElapsed * 2.05);
      const pw = 0.5 + 0.5 * Math.sin(simElapsed * 1.55 + 1.1);
      const rOuter = player.r + 22 + ph * 10;
      const g = ctx2.createRadialGradient(px, py + 3, 0, px, py, rOuter);
      g.addColorStop(0, `rgba(32, 24, 18, ${0.07 + ph * 0.05})`);
      g.addColorStop(0.42, `rgba(28, 36, 28, ${0.075 + pw * 0.025})`);
      g.addColorStop(1, "rgba(12, 20, 16, 0)");
      ctx2.fillStyle = g;
      ctx2.beginPath();
      ctx2.arc(px, py, rOuter, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.strokeStyle = `rgba(22, 34, 26, ${0.045 + pw * 0.035})`;
      ctx2.lineWidth = 2.5;
      ctx2.beginPath();
      ctx2.arc(px, py, player.r + 9 + ph * 5, 0, Math.PI * 2);
      ctx2.stroke();
      ctx2.strokeStyle = `rgba(18, 28, 22, ${0.03 + ph * 0.02})`;
      ctx2.lineWidth = 1.5;
      ctx2.beginPath();
      ctx2.arc(px, py, player.r + 16 + pw * 6, 0, Math.PI * 2);
      ctx2.stroke();
    }
    function drawSwampBubbleGlyph(ctx2, x, y, R, alpha) {
      if (alpha <= 8e-3 || R < 0.5) return;
      const a = alpha;
      ctx2.fillStyle = `rgba(210, 232, 220, ${0.1 * a})`;
      ctx2.beginPath();
      ctx2.arc(x, y, R, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.strokeStyle = `rgba(160, 190, 175, ${0.26 * a})`;
      ctx2.lineWidth = Math.max(0.85, R * 0.1);
      ctx2.beginPath();
      ctx2.arc(x, y, R, 0, Math.PI * 2);
      ctx2.stroke();
      ctx2.fillStyle = `rgba(255, 255, 255, ${0.2 * a})`;
      ctx2.beginPath();
      ctx2.arc(x - R * 0.38, y - R * 0.4, R * 0.22, 0, Math.PI * 2);
      ctx2.fill();
    }
    function swampObstacleInnerPoint(o, salt) {
      const xi = Math.floor(o.x) | 0;
      const yi = Math.floor(o.y) | 0;
      const h = (xi * 92837111 ^ yi * 689287451 ^ salt * 374761393) >>> 0;
      const mx = 0.1 + (h & 1023) / 1024 * 0.8;
      const my = 0.1 + (h >>> 10 & 1023) / 1024 * 0.8;
      return { x: o.x + mx * o.w, y: o.y + my * o.h };
    }
    function clampSwampBugToObstacle(px, py, o, pad) {
      return {
        x: Math.min(o.x + o.w - pad, Math.max(o.x + pad, px)),
        y: Math.min(o.y + o.h - pad, Math.max(o.y + pad, py))
      };
    }
    function drawSwampAtmosphereForegroundWorld(ctx2, viewW, viewH) {
      const L = activeHexes.length;
      if (!L) return;
      const pickHex = (i) => activeHexes[((i * 17 ^ i * 3 + (i >> 1)) >>> 0) % L];
      for (const h of activeHexes) {
        const { x: cx, y: cy } = hexToWorld(h.q, h.r);
        const mix = h.q * 9283711 + h.r * 689287 >>> 0;
        const nBubbles = 10 + mix % 12;
        for (let m = 0; m < nBubbles; m++) {
          const hsh = mix * 2654435761 + m * 1597334677 + h.q * 374761393 + h.r * 668265263 >>> 0;
          const u01 = hsh / 4294967296;
          const u02 = (hsh >>> 11) / 4294967296;
          const ang = u01 * Math.PI * 2 + m * 1.713;
          const radT = 0.11 + u02 * 0.26;
          const spawnX = cx + Math.cos(ang) * HEX_SIZE * radT;
          const spawnY0 = cy + Math.sin(ang * 1.09 + m * 0.37) * HEX_SIZE * radT * 0.92 + HEX_SIZE * 0.06;
          const R = 2.55 + (mix + m * 47 + (hsh & 15)) % 6 * 0.36;
          const life = 15 + (mix >> m % 4 & 7) * 1.6;
          const phase = hsh % 1e4 / 1e4;
          const t = simElapsed + phase * life;
          const u = t % life / life;
          const travel = 52 + (hsh >>> 8) % 5 * 16;
          const speedMul = 1 + 7 * ((hsh >>> 20) % 1e3) / 1e3;
          const x = spawnX;
          const y = spawnY0 - u * travel * speedMul;
          let alpha = 0.72;
          if (u < 0.1) alpha *= u / 0.1;
          else if (u > 0.62) alpha *= (1 - u) / 0.38;
          drawSwampBubbleGlyph(ctx2, x, y, R, alpha);
        }
      }
      const steamN = 40;
      for (let i = 0; i < steamN; i++) {
        const fh = pickHex(i * 5 + 2);
        const sm = fh.q * 311 + fh.r * 177 + i * 41 >>> 0;
        const { x: sx0, y: sy0 } = hexToWorld(fh.q, fh.r);
        const rise = (simElapsed * (0.12 + sm % 5 * 0.02) + sm * 3e-3) % 1;
        const sx = sx0 + Math.sin(sm * 0.02 + simElapsed * 0.12) * HEX_SIZE * 0.28;
        const sy = sy0 - rise * HEX_SIZE * 0.85;
        const hSteam = 18 + sm % 6 * 4;
        const wSteam = 4 + sm % 3;
        const sa = (0.026 + Math.sin(rise * Math.PI) * 0.036) * (0.9 + i % 3 * 0.09);
        ctx2.save();
        ctx2.translate(sx, sy);
        ctx2.rotate((sm * 8e-3 + simElapsed * 0.06) % (Math.PI * 2));
        const st = ctx2.createLinearGradient(0, hSteam * 0.5, 0, -hSteam * 0.5);
        st.addColorStop(0, `rgba(40, 55, 48, ${sa * 0.6})`);
        st.addColorStop(0.4, `rgba(95, 110, 98, ${sa * 0.45})`);
        st.addColorStop(0.65, `rgba(200, 210, 198, ${sa * 0.75})`);
        st.addColorStop(1, "rgba(220, 228, 218, 0)");
        ctx2.fillStyle = st;
        ctx2.beginPath();
        ctx2.ellipse(0, 0, wSteam, hSteam, 0, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.restore();
      }
      const mud = obstacles;
      if (mud.length) {
        const GNAT_CAP = 260;
        let gnatPlaced = 0;
        for (let oi = 0; oi < mud.length && gnatPlaced < GNAT_CAP; oi++) {
          const o = mud[oi];
          if (o.w < 0.5 || o.h < 0.5) continue;
          const xi = Math.floor(o.x) | 0;
          const yi = Math.floor(o.y) | 0;
          const h0 = (xi * 92837111 ^ yi * 689287451 ^ oi * 2654435761) >>> 0;
          const gn = 1 + (h0 >> 2 & 1) + (h0 >> 9 & 1);
          const pad = 1.1;
          const rx = Math.min(3.2, o.w * 0.38);
          const ry = Math.min(3.2, o.h * 0.38);
          for (let k = 0; k < gn && gnatPlaced < GNAT_CAP; k++) {
            gnatPlaced++;
            const base = swampObstacleInnerPoint(o, oi * 17 + k * 31);
            const ks = h0 * 0.01 + k * 2.1 + oi * 0.11;
            const t = simElapsed * 0.35;
            const p = clampSwampBugToObstacle(
              base.x + Math.sin(t + ks) * rx,
              base.y + Math.cos(t * 0.95 + ks * 1.1) * ry,
              o,
              pad
            );
            const gx = p.x;
            const gy = p.y;
            const gk = 0.5 + 0.5 * Math.sin(simElapsed * 2.8 + h0 + k);
            const gr = 1.15 + k % 3 * 0.55;
            const ga = 0.32 + gk * 0.28;
            ctx2.fillStyle = `rgba(48, 56, 50, ${ga})`;
            ctx2.beginPath();
            ctx2.arc(gx, gy, gr, 0, Math.PI * 2);
            ctx2.fill();
            ctx2.strokeStyle = `rgba(22, 28, 24, ${Math.min(0.9, ga + 0.12)})`;
            ctx2.lineWidth = 1;
            ctx2.beginPath();
            ctx2.arc(gx, gy, gr, 0, Math.PI * 2);
            ctx2.stroke();
          }
        }
      }
      const flyN = 118;
      for (let i = 0; i < flyN; i++) {
        if (!mud.length) break;
        const seed = i * 11.27 + 0.55;
        const o = mud[(i * 79 + 61 * (i % 11) >>> 0) % mud.length];
        if (o.w < 0.5 || o.h < 0.5) continue;
        const base = swampObstacleInnerPoint(o, i * 7919 + 42);
        const buzz = simElapsed * (5.5 + i % 4 * 0.6);
        const pad = 1.2;
        const bx = Math.min(4, o.w * 0.42);
        const by = Math.min(3.5, o.h * 0.42);
        const p = clampSwampBugToObstacle(
          base.x + Math.sin(buzz + seed) * bx + Math.sin(buzz * 2.1 + i) * (bx * 0.45),
          base.y + Math.cos(buzz * 0.95 + seed * 2) * by + Math.cos(buzz * 2.4) * (by * 0.4),
          o,
          pad
        );
        const fx = p.x;
        const fy = p.y;
        const wing = 0.5 + 0.5 * Math.sin(buzz * 3.2);
        const wingA = 0.52 + wing * 0.38;
        ctx2.strokeStyle = `rgba(12, 18, 14, ${wingA})`;
        ctx2.lineWidth = 1.35;
        ctx2.beginPath();
        ctx2.moveTo(fx - 4.5, fy - 0.45);
        ctx2.lineTo(fx + 4.5, fy + 0.45);
        ctx2.stroke();
        ctx2.fillStyle = `rgba(18, 26, 20, ${0.62 + wing * 0.28})`;
        ctx2.beginPath();
        ctx2.arc(fx, fy, 1.45, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.strokeStyle = `rgba(8, 12, 10, ${0.55 + wing * 0.2})`;
        ctx2.lineWidth = 0.9;
        ctx2.beginPath();
        ctx2.arc(fx, fy, 1.45, 0, Math.PI * 2);
        ctx2.stroke();
      }
    }
    function resetFireGrowthZones() {
      fireGrowthZones.length = 0;
    }
    function fireGrowthZoneRadius(zone) {
      const u = clamp7((simElapsed - zone.bornAt) / Math.max(1e-3, zone.growDur), 0, 1);
      const e = u * u * (3 - 2 * u);
      return zone.baseR + (zone.maxR - zone.baseR) * e;
    }
    function fireGrowthZoneVisualRadius(zone) {
      return fireGrowthZoneRadius(zone) * FIRE_GROWTH_ZONE_VISUAL_RADIUS_MULT;
    }
    function pruneFireGrowthZonesToActiveHexes() {
      if (!fireGrowthZones.length) return;
      const needed = new Set(activeHexes.map((h) => hexKey(h.q, h.r)));
      for (let i = fireGrowthZones.length - 1; i >= 0; i--) {
        if (!needed.has(fireGrowthZones[i].key)) fireGrowthZones.splice(i, 1);
      }
    }
    function spawnFireGrowthZoneAt(x, y, opts = {}) {
      const miniFromArtillery = !!opts.miniFromArtillery;
      let h = worldToHex(x, y);
      if (miniFromArtillery && specials.isSpecialTile(h.q, h.r)) {
        for (const d of HEX_DIRS) {
          const q2 = h.q + d.q;
          const r2 = h.r + d.r;
          if (!specials.isSpecialTile(q2, r2)) {
            h = { q: q2, r: r2 };
            break;
          }
        }
      }
      const k = hexKey(h.q, h.r);
      if (!miniFromArtillery) {
        if (specials.isSpecialTile(h.q, h.r)) return false;
        if (fireGrowthZones.some((z) => z.key === k)) return false;
      }
      fireGrowthZones.push({
        key: k,
        q: h.q,
        r: h.r,
        x,
        y,
        bornAt: simElapsed,
        growDur: miniFromArtillery ? randRange(3.2, 6.1) : randRange(5.2, 7.4),
        baseR: miniFromArtillery ? randRange(30, 68) : randRange(90, 128),
        maxR: miniFromArtillery ? randRange(86, 104) : randRange(328, 386),
        nextTouchDamageAt: simElapsed + 0.18,
        seed: Math.random() * Math.PI * 2
      });
      return true;
    }
    function maybeSpawnFireGrowthZone(dt) {
      const targetMax = Math.min(5, 2 + Math.max(0, runLevel - 2));
      if (fireGrowthZones.length >= targetMax) return;
      const dangerRamp01 = hunterRuntime ? hunterRuntime.getDangerRamp01() : clamp7(simElapsed / 300, 0, 1);
      const levelBonus = Math.max(0, runLevel - 2) * 0.04;
      const spawnPerSec = 0.16 + levelBonus + 0.34 * dangerRamp01;
      if (Math.random() >= spawnPerSec * Math.max(0, dt)) return;
      const blocked = new Set(fireGrowthZones.map((z) => z.key));
      const playerHex = worldToHex(player.x, player.y);
      const candidates = activeHexes.filter((h2) => {
        if (h2.q === 0 && h2.r === 0) return false;
        if (h2.q === playerHex.q && h2.r === playerHex.r) return false;
        if (blocked.has(hexKey(h2.q, h2.r))) return false;
        if (specials.isSpecialTile(h2.q, h2.r)) return false;
        return true;
      });
      if (!candidates.length) return;
      const h = candidates[Math.floor(Math.random() * candidates.length)];
      const c = hexToWorld(h.q, h.r);
      const a = Math.random() * Math.PI * 2;
      const d = randRange(HEX_SIZE * 0.12, HEX_SIZE * 0.46);
      const x = c.x + Math.cos(a) * d;
      const y = c.y + Math.sin(a) * d;
      if (Math.hypot(x - player.x, y - player.y) < player.r + 68) return;
      spawnFireGrowthZoneAt(x, y);
    }
    function spawnFireGrowthZonesFromFireArtillery() {
      if (!hunterRuntime) return;
      for (const z of hunterRuntime.entities.dangerZones) {
        if (!z || !z.firePath || !z.exploded) continue;
        if (z.fireGrowthSpawned) continue;
        const spawned = spawnFireGrowthZoneAt(z.x, z.y, { miniFromArtillery: true });
        if (spawned) z.fireGrowthSpawned = true;
      }
    }
    function tickFireGrowthZones(dt) {
      const firePathActive = pathRuntime.getCurrentPathId() === "fire";
      if (!firePathActive || runLevel < 1) {
        if (fireGrowthZones.length) resetFireGrowthZones();
        return;
      }
      pruneFireGrowthZonesToActiveHexes();
      if (runLevel >= 2) maybeSpawnFireGrowthZone(dt);
      for (const zone of fireGrowthZones) {
        const rr = fireGrowthZoneVisualRadius(zone) * 0.92 + player.r;
        const dx = player.x - zone.x;
        const dy = player.y - zone.y;
        if (dx * dx + dy * dy > rr * rr) continue;
        if (simElapsed < zone.nextTouchDamageAt) continue;
        damagePlayerThroughPath(1, { sourceX: zone.x, sourceY: zone.y, fireApplyIgnite: true });
        zone.nextTouchDamageAt = simElapsed + 0.35;
      }
    }
    function drawFireGrowthZones(ctx2) {
      if (!fireGrowthZones.length) return;
      for (const zone of fireGrowthZones) {
        const r = fireGrowthZoneRadius(zone);
        const pulse = 0.5 + 0.5 * Math.sin(simElapsed * 5.4 + zone.seed);
        const visualR = fireGrowthZoneVisualRadius(zone);
        const scorch = ctx2.createRadialGradient(zone.x, zone.y, visualR * 0.12, zone.x, zone.y, visualR * 1.2);
        scorch.addColorStop(0, "rgba(69, 10, 10, 0.56)");
        scorch.addColorStop(0.55, "rgba(39, 39, 42, 0.34)");
        scorch.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx2.fillStyle = scorch;
        ctx2.beginPath();
        ctx2.arc(zone.x, zone.y, visualR * 1.2, 0, Math.PI * 2);
        ctx2.fill();
        const core = ctx2.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, visualR);
        core.addColorStop(0, `rgba(255, 251, 235, ${0.34 + pulse * 0.14})`);
        core.addColorStop(0.22, `rgba(253, 186, 116, ${0.56 + pulse * 0.24})`);
        core.addColorStop(0.58, `rgba(249, 115, 22, ${0.4 + pulse * 0.22})`);
        core.addColorStop(1, "rgba(153, 27, 27, 0)");
        ctx2.fillStyle = core;
        ctx2.beginPath();
        ctx2.arc(zone.x, zone.y, visualR, 0, Math.PI * 2);
        ctx2.fill();
        const outerHeat = ctx2.createRadialGradient(zone.x, zone.y, visualR * 0.55, zone.x, zone.y, visualR * 1.55);
        outerHeat.addColorStop(0, `rgba(251, 146, 60, ${0.12 + pulse * 0.06})`);
        outerHeat.addColorStop(0.7, "rgba(220, 38, 38, 0.08)");
        outerHeat.addColorStop(1, "rgba(153, 27, 27, 0)");
        ctx2.fillStyle = outerHeat;
        ctx2.beginPath();
        ctx2.arc(zone.x, zone.y, visualR * 1.55, 0, Math.PI * 2);
        ctx2.fill();
        const tongues = 10;
        for (let i = 0; i < tongues; i++) {
          const a = zone.seed + i * (Math.PI * 2 / tongues) + simElapsed * (0.55 + i * 0.08);
          const tr = visualR * (0.5 + 0.18 * Math.sin(simElapsed * 2.2 + i));
          const tx = zone.x + Math.cos(a) * tr;
          const ty = zone.y + Math.sin(a) * tr;
          const fr = visualR * (0.16 + 0.05 * Math.sin(simElapsed * 6 + i));
          const fg = ctx2.createRadialGradient(tx, ty, 0, tx, ty, fr);
          fg.addColorStop(0, "rgba(254, 243, 199, 0.32)");
          fg.addColorStop(0.5, "rgba(251, 146, 60, 0.28)");
          fg.addColorStop(1, "rgba(185, 28, 28, 0)");
          ctx2.fillStyle = fg;
          ctx2.beginPath();
          ctx2.arc(tx, ty, fr, 0, Math.PI * 2);
          ctx2.fill();
        }
        ctx2.strokeStyle = `rgba(254, 215, 170, ${0.4 + pulse * 0.22})`;
        ctx2.lineWidth = 2.4;
        ctx2.beginPath();
        ctx2.arc(zone.x, zone.y, visualR * (0.86 + pulse * 0.08), 0, Math.PI * 2);
        ctx2.stroke();
      }
    }
    function damagePlayerThroughPath(amount, opts = {}) {
      const hooked = pathRuntime.applyDamageHooks({
        amount,
        opts,
        simElapsed,
        runLevel,
        player,
        inventory: inventory2,
        activeCharacterId
      });
      if (hooked?.cancel) return;
      const finalAmount = hooked?.amount ?? amount;
      const finalOpts = hooked?.opts ?? opts;
      const baseDamage = Math.max(0, Number(amount) || 0);
      let dmgToApply = Math.max(0, Number(finalAmount) || 0);
      if (pathRuntime.getCurrentPathId() === "swamp" && dmgToApply > 0 && !finalOpts?.swampBootlegBloodTax) {
        dmgToApply += getSwampBootlegFragileExtra(inventory2, simElapsed);
      }
      const damageBonus = Math.max(0, dmgToApply - baseDamage);
      playerDamage.damagePlayer(dmgToApply, finalOpts);
      if (dmgToApply > 0 && !finalOpts?.swampBootlegBloodTax) {
        onSwampBootlegPlayerDamageHit(inventory2, simElapsed);
      }
      if (pathRuntime.getCurrentPathId() === "swamp" && runLevel >= 2 && Number(dmgToApply) > 0) {
        playerDamage.applySwampHitSlow();
      }
      if (pathRuntime.getCurrentPathId() === "bone" && Number(finalAmount) > 0) {
        boneBlindDebuffPeakEnd = simElapsed + BONE_BLIND_DEBUFF_PEAK_SEC;
        boneBlindDebuffFadeEnd = boneBlindDebuffPeakEnd + BONE_BLIND_DEBUFF_FADE_SEC;
        boneBlindDebuffFromBlueLaser = !!finalOpts?.laserBlueSlow;
      }
      if (dmgToApply > 0) spawnDamagePopup(dmgToApply, damageBonus, finalOpts);
      if (pathRuntime.getCurrentPathId() === "swamp" && !finalOpts?.swampInfectionBurst && !finalOpts?.swampBootlegBloodTax && (finalOpts?.swampApplyInfection || dmgToApply > 0) && simElapsed >= swampInfectionChainLockUntil) {
        const instanceId = finalOpts?.swampDamageInstanceId;
        let shouldAddStack = true;
        if (instanceId != null) {
          const key = String(instanceId);
          if (swampDamageInstanceSeenAt.has(key)) shouldAddStack = false;
          else swampDamageInstanceSeenAt.set(key, simElapsed);
        }
        if (shouldAddStack) {
          const minGap = runLevel >= 2 ? SWAMP_INFECTION_STACK_MIN_GAP_LEVEL3_SEC : runLevel >= 1 ? SWAMP_INFECTION_STACK_MIN_GAP_LEVEL2_SEC : 0;
          if (minGap > 0 && swampInfectionStackLastAt > 0 && simElapsed - swampInfectionStackLastAt < minGap) {
            shouldAddStack = false;
          }
        }
        if (shouldAddStack) {
          const prev = Math.max(0, Math.floor(inventory2.swampInfectionStacks ?? 0));
          const next = prev + 1;
          if (next >= SWAMP_INFECTION_CAP) {
            inventory2.swampInfectionStacks = SWAMP_INFECTION_CAP;
            swampInfectionChainLockUntil = simElapsed + SWAMP_INFECTION_BURST_STUN_SEC + SWAMP_INFECTION_BURST_SLOW_SEC;
            swampInfectionTenBurstAt = simElapsed;
            swampInfectionDebuffOverlayUntil = simElapsed + SWAMP_INFECTION_BURST_STUN_SEC + SWAMP_INFECTION_BURST_SLOW_SEC;
            playerDamage.applySwampInfectionBurst(simElapsed);
            damagePlayerThroughPath(1, {
              sourceX: player.x,
              sourceY: player.y,
              swampInfectionBurst: true
            });
          } else {
            inventory2.swampInfectionStacks = next;
          }
          swampInfectionStackLastAt = simElapsed;
        }
      }
      if ((finalOpts?.fireApplyIgnite ?? false) && !(finalOpts?.fireIgniteTick ?? false)) {
        const igniteStep = runLevel >= 2 ? 2 / 3 : 1;
        fireIgniteTickStep = igniteStep;
        fireIgniteUntil = simElapsed + 2;
        fireIgniteNextTickAt = simElapsed + igniteStep;
      }
    }
    let cardPickup = null;
    let swampBootlegCrystalModal = null;
    let swampBootlegCurseUid = 0;
    function modalChromePausesWorld() {
      return (cardPickup?.isPaused() ?? false) || (rouletteModal?.isPaused() ?? false) || (forgeWorldModal?.isForgePaused() ?? false) || safehouseHexFlow.isPausedForSafehousePrompt() || (swampBootlegCrystalModal?.isPaused() ?? false);
    }
    function simClockPaused() {
      return manualPause || handsResetPause || (cardPickup?.isPaused() ?? false) || (rouletteModal?.isPaused() ?? false) || (forgeWorldModal?.isForgePaused() ?? false) || (swampBootlegCrystalModal?.isPaused() ?? false);
    }
    function isWorldPaused() {
      return manualPause || handsResetPause || modalChromePausesWorld();
    }
    function syncDeckHud() {
      syncDeckSlotsFromInventory(
        deckRankSlotEls,
        backpackSlotEls,
        inventory2,
        cardPickup?.getPendingCard() ?? null,
        getItemRulesForCharacter(activeCharacterId),
        forgeWorldModal?.isForgePaused() ?? false
      );
      if (setBonusStatusEl) {
        const lines = getModalSetBonusProgressLines(inventory2, cardPickup?.getPendingCard() ?? null, getItemRulesForCharacter(activeCharacterId));
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
      if (inventory2.diamondEmpower) {
        cardPickup.clearSetBonusChoice?.("diamonds");
        hideDiamondEmpowerOverlay();
        return;
      }
      const suits = countSuitsInActiveSlots(inventory2);
      if (suits.diamonds < SET_BONUS_SUIT_THRESHOLD || suits.diamonds >= SET_BONUS_SUIT_MAX) {
        cardPickup.clearSetBonusChoice?.("diamonds");
        hideDiamondEmpowerOverlay();
        return;
      }
      if (!(cardPickup.isPaused?.() ?? false)) return;
      cardPickup.openSetBonusChoice("diamonds");
      if (cardPickup.isDiamondSetBonusChoicePending?.()) showDiamondEmpowerOverlay();
    }
    function switchActiveCharacter(id, opts = {}) {
      const forceReselect = !!(opts && opts.forceReselect);
      if (!forceReselect && id === activeCharacterId) return;
      hideDeathScreen();
      activeCharacterId = id;
      if (id === "lunatic") {
        for (let r = 1; r <= 13; r++) {
          inventory2.deckByRank[r] = null;
        }
        inventory2.backpackSlots[0] = null;
        inventory2.backpackSlots[1] = null;
        inventory2.backpackSlots[2] = null;
        inventory2.lunaticRegenBank = 0;
        inventory2.diamondEmpower = null;
        inventory2.valiantElectricBoxChargeBonus = 0;
      }
      character = instrumentObjectMethods(createCharacterController(id, rogueWorld, valiantWorld, bulwarkWorld), "character", runLogger, {
        skip: ["getAbilityHud"]
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
      inventory2.aceUltimateReadyAt = 0;
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
      resetFireGrowthZones();
      swampMudTrail.length = 0;
      swampMudTrailLastX = NaN;
      swampMudTrailLastY = NaN;
      knightSwampDashSplashes.length = 0;
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
        lastPlayerHexKey
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
      prevKnightClubsInvisActive = false;
      prevKnightBurstTerrainPhase = false;
      syncDeckHud();
    }
    const devHeroSelect = mountDevActiveHeroSelect(document, {
      initialId: activeCharacterId,
      onSelect: switchActiveCharacter
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
      inventory: inventory2,
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
      onDiamondEmpowerPicked: hideDiamondEmpowerOverlay
    }), "cardModal", runLogger);
    swampBootlegCrystalModal = createSwampBootlegCrystalModal({
      onPausedChange: (paused) => {
        if (paused) {
          handsResetPause = false;
          return;
        }
        if (runDead) return;
        handsResetPause = true;
        clearMovementKeys();
      }
    });
    wireDiamondEmpowerOverlay();
    syncDeckHud();
    rouletteModal = instrumentObjectMethods(createRouletteModal({
      doc: document,
      inventory: inventory2,
      getItemRules: () => getItemRulesForCharacter(activeCharacterId),
      getPendingCard: () => cardPickup?.getPendingCard() ?? null,
      getWorldCardPickups: () => collectibles.filter((x) => x.kind === "card").map((x) => ({ card: x.card })),
      syncDeckSlots: syncDeckHud,
      onPausedChange: () => {
      }
    }), "rouletteModal", runLogger);
    forgeWorldModal = instrumentObjectMethods(createForgeWorldModal({
      doc: document,
      inventory: inventory2,
      getItemRules: () => getItemRulesForCharacter(activeCharacterId),
      syncDeckSlots: syncDeckHud,
      getOpenCardPickup: () => (card) => cardPickup?.openCardPickup(card),
      onPausedChange: () => {
      }
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
          getSimElapsed: () => simElapsed
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
      h.x = c.x + dx / d * targetR;
      h.y = c.y + dy / d * targetR;
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
          h.x = cx + dx / d * minDist;
          h.y = cy + dy / d * minDist;
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
      return !runDead && !(cardPickup?.isPaused() ?? false) && !(rouletteModal?.isPaused() ?? false) && !(forgeWorldModal?.isForgePaused() ?? false);
    }
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
      getInventory: () => inventory2,
      getPlayerUntargetableUntil: () => playerDamage.combat.playerUntargetableUntil,
      pickRogueHunterTarget: (hunter, playerRef, inv, nearestDecoy, hasLOS, fallback, elapsed) => rogueWorld.pickRogueHunterTarget(hunter, playerRef, inv, nearestDecoy, hasLOS, fallback, elapsed),
      rand: randRange,
      getViewSize: () => ({ w: canvas.width, h: canvas.height }),
      damagePlayer: (amt, opts) => damagePlayerThroughPath(amt, opts),
      collidesValiantEnemyShockField: (circle, elapsed) => valiantWorld.collidesEnemyShockField(circle, elapsed),
      getBulwarkPlantedFlag: () => activeCharacterId === "bulwark" && typeof character.getBulwarkWorld === "function" ? character.getBulwarkWorld().getPlantedFlagForAi() : null,
      getDebugHunterTypeFilter: () => huntersEnabled ? debugHunterTypeFilter : null,
      getSwampBootlegColourblind: () => pathRuntime.getCurrentPathId() === "swamp" && getSwampBootlegColourblind(inventory2, simElapsed),
      hitDecoyIfAny,
      hitDecoyAlongSegment,
      worldToHex,
      hexToWorld,
      isArenaHexTile: (q, r) => specials.isArenaHexTile(q, r),
      isWorldPointOnSurgeLockBarrierTile: (x, y) => hexEventRuntime?.isSurgeLockBarrierWorldPoint?.(x, y) ?? false,
      isWorldPointOnSpecialSpawnerForbiddenHex,
      ejectSpawnerHunterFromSpecialHexFootprint,
      getDifficultyClockSec: () => safehouseHexFlow.getDifficultyClockSec(simElapsed),
      getRunLevel: () => runLevel,
      isWorldPointOnSafehouseBarrierDisk,
      clampHunterOutsideSafehouseDisk,
      isWorldPointOnForgeRouletteBarrierTile: (x, y) => (rouletteHexFlow?.isOuterBarrierWorldPoint?.(
        x,
        y,
        worldToHex,
        hexToWorld,
        (q, r) => specials.isRouletteHexInteractive(q, r)
      ) ?? false) || (forgeHexFlow?.isOuterBarrierWorldPoint?.(
        x,
        y,
        worldToHex,
        hexToWorld,
        (q, r) => specials.isForgeHexInteractive(q, r)
      ) ?? false)
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
      dropSpecialEventJokerReward: () => dropJokerRewardFromSpecialEvent({
        getCharacterId: () => activeCharacterId,
        openCardPickup: (card) => cardPickup?.openCardPickup(card)
      }),
      spawnHunter: (type, x, y, opts) => hunterRuntime.spawnHunter(type, x, y, opts),
      killHuntersOnSurgeHex: (q, r) => hunterRuntime.killHuntersStandingOnSurgeHex(q, r),
      cleanupArenaNexusSiegeCombat: () => hunterRuntime.cleanupArenaNexusSiegeCombat(),
      clampArenaNexusDefendersOnRing: (cx, cy) => hunterRuntime.clampArenaNexusDefendersOnRing(cx, cy),
      ejectHuntersFromArenaNexusDuringSiege: (cx, cy) => hunterRuntime.ejectHuntersFromArenaNexusDuringSiege(cx, cy),
      ejectHuntersFromSurgeLockHex: (lq, lr, sp) => hunterRuntime.ejectHuntersFromSurgeLockHex(lq, lr, sp),
      isCardPickupPaused: () => cardPickup?.isPaused() ?? false
    }), "events", runLogger, { skip: ["tick", "postHunterTick", "getArenaDrawState", "getSurgeDrawState"] });
    function performFullRunResetAfterDeath() {
      if (!runDead || !hunterRuntime) return;
      hideDeathScreen();
      runDead = false;
      manualPause = false;
      handsResetPause = false;
      simElapsed = 0;
      character = instrumentObjectMethods(createCharacterController(activeCharacterId, rogueWorld, valiantWorld, bulwarkWorld), "character", runLogger, {
        skip: ["getAbilityHud"]
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
        inventory2.deckByRank[r] = null;
      }
      inventory2.backpackSlots[0] = null;
      inventory2.backpackSlots[1] = null;
      inventory2.backpackSlots[2] = null;
      inventory2.clubsInvisUntil = 0;
      inventory2.spadesLandingStealthUntil = 0;
      inventory2.spadesObstacleBoostUntil = 0;
      inventory2.heartsResistanceReadyAt = 0;
      inventory2.heartsResistanceCooldownDuration = 0;
      inventory2.swampInfectionStacks = 0;
      resetSwampBootlegState(inventory2);
      swampBootlegCurseUid = 0;
      swampBootlegCrystalModal?.close?.();
      inventory2.heartsRegenPerSec = 0;
      inventory2.heartsRegenBank = 0;
      inventory2.diamondEmpower = null;
      inventory2.valiantElectricBoxChargeBonus = 0;
      inventory2.lunaticRegenBank = 0;
      inventory2.aceUltimateReadyAt = 0;
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
      resetFireGrowthZones();
      swampMudTrail.length = 0;
      swampMudTrailLastX = NaN;
      swampMudTrailLastY = NaN;
      knightSwampDashSplashes.length = 0;
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
        lastPlayerHexKey
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
      prevKnightClubsInvisActive = false;
      prevKnightBurstTerrainPhase = false;
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
    const RESUME_KEYS = /* @__PURE__ */ new Set(["q", "w", "e", "r", "arrowup", "arrowdown", "arrowleft", "arrowright"]);
    function isCharacterSelectModalOpen() {
      return characterSelectModalEl?.classList.contains("open") ?? false;
    }
    function pauseKeyRoutingBlocked(ev) {
      const t = ev.target;
      if (isDomShellTypingTarget(t)) return true;
      if (isCharacterSelectModalOpen()) return true;
      return false;
    }
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
    function tryMobileHudPause() {
      if (runDead) return;
      if (modalChromePausesWorld()) return;
      if (manualPause || handsResetPause) return;
      manualPause = true;
      clearMovementKeys();
    }
    const dangerRampFillEl = document.getElementById("danger-ramp-fill");
    const devHuntersEl = document.getElementById("dev-hunters-enabled");
    const devHunterTypeFilterEl = document.getElementById("dev-hunter-type-filter");
    var huntersEnabled = true;
    const HUNTERS_LS_KEY = "escape-dev-hunters-enabled";
    const HUNTER_TYPE_FILTER_LS_KEY = "escape-dev-hunter-type-filter";
    var debugHunterTypeFilter = null;
    function normalizeDebugHunterTypeFilter(value) {
      if (typeof value !== "string") return null;
      const v = value.trim();
      if (!v || v === "__all__") return null;
      if (v === "chaser" || v === "frogChaser" || v === "cutter" || v === "sniper" || v === "ranged" || v === "laser" || v === "laserBlue" || v === "spawner" || v === "airSpawner" || v === "cryptSpawner" || v === "ghost" || v === "fast") {
        return v;
      }
      return null;
    }
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
    if (devHunterTypeFilterEl && "value" in devHunterTypeFilterEl) {
      const saved = localStorage.getItem(HUNTER_TYPE_FILTER_LS_KEY);
      const normalized = normalizeDebugHunterTypeFilter(saved);
      debugHunterTypeFilter = normalized;
      devHunterTypeFilterEl.value = normalized ?? "__all__";
      devHunterTypeFilterEl.addEventListener("change", () => {
        const normalizedNext = normalizeDebugHunterTypeFilter(String(devHunterTypeFilterEl.value || "__all__"));
        debugHunterTypeFilter = normalizedNext;
        localStorage.setItem(HUNTER_TYPE_FILTER_LS_KEY, normalizedNext ?? "__all__");
        if (huntersEnabled) hunterRuntime.reset();
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
        debugRunLevelValueEl.textContent = `Level ${runLevel + 1} \xB7 Path: ${pathVisual.label}`;
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
    const debugItemPopulateBuildBtn = document.getElementById("debug-item-populate-build-button");
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
    const DEBUG_POPULATE_SUITS = ["diamonds", "hearts", "clubs", "spades", "joker"];
    function makeRandomDebugBuildCard(rank, idTag) {
      const suit = DEBUG_POPULATE_SUITS[Math.floor(Math.random() * DEBUG_POPULATE_SUITS.length)];
      const options = debugEffectOptions(suit, rank);
      if (!options.length) return null;
      const chosen = options[Math.floor(Math.random() * options.length)];
      return {
        id: `debug-build-${Date.now()}-${idTag}-${Math.floor(Math.random() * 1e6)}`,
        suit,
        rank,
        effect: chosen.effect,
        ...suit === "joker" ? { effectBorrowedSuit: chosen.effectBorrowedSuit ?? "spades" } : {}
      };
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
        { v: 13, t: "K" }
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
      const chosen = selectedId === "__random__" ? options[Math.floor(Math.random() * options.length)] : options.find((o) => o.id === selectedId) ?? options[Math.floor(Math.random() * options.length)];
      if (!chosen) return;
      const card = {
        id: `debug-drop-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        suit,
        rank,
        effect: chosen.effect,
        ...suit === "joker" ? { effectBorrowedSuit: chosen.effectBorrowedSuit ?? "spades" } : {}
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
        expiresAt: simElapsed + CARD_COLLECTIBLE_LIFETIME_SEC
      });
      runLogger.log("debug", "spawned item drop", {
        suit: card.suit,
        rank: card.rank,
        effect: card.effect?.kind ?? "unknown"
      });
    });
    debugItemPopulateBuildBtn?.addEventListener("click", () => {
      for (let r = 1; r <= 13; r++) {
        inventory2.deckByRank[r] = Math.random() < 0.1 ? null : makeRandomDebugBuildCard(r, `deck${r}`);
      }
      for (let i = 0; i < inventory2.backpackSlots.length; i++) {
        const rank = 1 + Math.floor(Math.random() * 13);
        inventory2.backpackSlots[i] = Math.random() < 0.1 ? null : makeRandomDebugBuildCard(rank, `bp${i}`);
      }
      syncDeckHud();
      runLogger.log("debug", "populate build", { deckFilled: 13, backpackSlots: inventory2.backpackSlots.length });
    });
    function buildAbilityContext(dt) {
      return {
        player,
        elapsed: simElapsed,
        dt,
        obstacles,
        inventory: inventory2,
        resolvePlayer: (x, y, r) => resolvePlayerAgainstRects(x, y, r, obstaclesForPlayerCollision()),
        circleHitsObstacle: (x, y, r) => circleOverlapsAnyRect(x, y, r, obstaclesForPlayerCollision()),
        spawnAttackRing: (x, y, r, color, durationSec) => {
          pushAttackRing(attackRings, x, y, r, color, simElapsed, durationSec);
        },
        spawnKnightDashEndSplash: (x, y) => {
          if (pathRuntime.getCurrentPathId() !== "swamp") return;
          knightSwampDashSplashes.push({ x, y, bornAt: simElapsed, pr: player.r });
          while (knightSwampDashSplashes.length > 6) knightSwampDashSplashes.shift();
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
              angle: Math.PI * 2 * i / 4,
              radius,
              r: 10,
              bornAt,
              expiresAt: simElapsed + 4 * (i + 1),
              x: player.x,
              y: player.y
            });
          }
        },
        scheduleBurstWaves: (startAt, count, spanSec, radius) => {
          ultimateBurstWaves.length = 0;
          for (let i = 0; i < count; i++) {
            ultimateBurstWaves.push({
              at: startAt + i * spanSec / count,
              radius
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
        countActiveSuits: () => countSuitsInActiveSlots(inventory2),
        bumpScreenShake: (strength, sec) => playerDamage.bumpScreenShake(strength, sec),
        grantInvulnerabilityUntil: (until) => playerDamage.grantInvulnerabilityUntil(until),
        onValiantWillDeath: () => playerDamage.killPlayerImmediate(),
        hunterEntities: hunterRuntime?.entities ?? null,
        bulwarkChargePushHunters: (px, py, nx, ny, pr, at, pushedOut) => hunterRuntime?.bulwarkChargePushHunters?.(px, py, nx, ny, pr, at, pushedOut),
        bulwarkChargeApplyTerrainGroupStun: (set, at) => hunterRuntime?.bulwarkChargeApplyTerrainGroupStun?.(set, at),
        bulwarkParryPushHunters: (px, py, rad, dist) => hunterRuntime?.bulwarkParryPushHunters?.(px, py, rad, dist)
      };
    }
    function handleAbilityPress(slot) {
      if (runDead) return;
      if (manualPause || handsResetPause) {
        manualPause = false;
        handsResetPause = false;
      }
      if (isWorldPaused()) return;
      if ((slot === "q" || slot === "w" || slot === "e") && simElapsed < (inventory2.swampBootlegSpellSilenceUntil ?? 0)) {
        return;
      }
      if (simElapsed < playerTimelockUntil) return;
      const ctx2 = buildAbilityContext(0);
      if (slot === "r" && tryUseEquippedUltimate(ctx2)) return;
      character.onAbilityPress(slot, ctx2);
    }
    function handleAbilityRelease(slot) {
      if (runDead || isWorldPaused()) return;
      if (simElapsed < playerTimelockUntil) return;
      if (typeof character.onAbilityRelease !== "function") return;
      const ctx2 = buildAbilityContext(0);
      character.onAbilityRelease(slot, ctx2);
    }
    const abilityKeys = attachAbilityKeyPresses(window, handleAbilityPress, void 0, handleAbilityRelease);
    if (mobileUiEnabled) {
      if (characterSelectModalEl) {
        characterSelectModalEl.classList.add("open");
        manualPause = true;
        clearMovementKeys();
      }
      if (mobileUnpauseBtn) {
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
          const kx = dx / len * clamped;
          const ky = dy / len * clamped;
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
    let cameraX = 0;
    let cameraY = 0;
    function snapCameraToPlayer() {
      const viewW = canvas.width;
      const viewH = canvas.height;
      cameraX = player.x - viewW / 2;
      cameraY = player.y - viewH / 2;
    }
    snapCameraToPlayer();
    let last = performance.now() / 1e3;
    let raf = 0;
    function frame(nowMs) {
      try {
        const now = nowMs / 1e3;
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
          const showMbUnpause = (manualPause || handsResetPause) && !runDead && !(characterSelectModalEl?.classList.contains("open") ?? false);
          mobileUnpauseBtn.hidden = !showMbUnpause;
        }
        if (!paused) {
          playerDamage.tickCombatPresentation(rawDt);
        }
        if (!simPaused && !runDead) {
          simElapsed += rawDt;
          if (swampInfectionChainLockUntil > 0 && simElapsed >= swampInfectionChainLockUntil) {
            swampInfectionChainLockUntil = 0;
            inventory2.swampInfectionStacks = 0;
            swampInfectionStackLastAt = 0;
          }
          tickSwampBootlegCurses(inventory2, simElapsed);
          tickSwampBootlegBloodTax(
            inventory2,
            simElapsed,
            (amt) => damagePlayerThroughPath(amt, {
              swampBootlegBloodTax: true,
              sourceX: player.x,
              sourceY: player.y
            })
          );
          character.tick(buildAbilityContext(dt));
          pathRuntime.applyDebuffHooks({ dt, simElapsed, runLevel, player, inventory: inventory2, activeCharacterId });
          const swampPathActive2 = pathRuntime.getCurrentPathId() === "swamp";
          const firePathActive2 = pathRuntime.getCurrentPathId() === "fire";
          const bonePathActive2 = pathRuntime.getCurrentPathId() === "bone";
          if (swampDamageInstanceSeenAt.size > 0) {
            const cutoff = simElapsed - 20;
            for (const [k, t] of swampDamageInstanceSeenAt) {
              if (t < cutoff) swampDamageInstanceSeenAt.delete(k);
            }
          }
          if (!swampPathActive2 && (inventory2.swampInfectionStacks ?? 0) > 0) {
            resetSwampInfection();
          }
          if (!firePathActive2) {
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
          if (!bonePathActive2) {
            boneBlindDebuffPeakEnd = 0;
            boneBlindDebuffFadeEnd = 0;
            boneBlindDebuffFromBlueLaser = false;
          }
          tickFireGrowthZones(rawDt);
          if (activeCharacterId === "knight") {
            const clubsInvis = simElapsed < (inventory2.clubsInvisUntil ?? 0);
            const burstTerrainPhase = knightHasClubsSevenSet() && typeof character.getBurstVisualUntil === "function" && character.getBurstVisualUntil(simElapsed) > simElapsed;
            if (prevKnightClubsInvisActive && !clubsInvis) ejectKnightFromSolidTerrainIfNeeded();
            if (prevKnightBurstTerrainPhase && !burstTerrainPhase) ejectKnightFromSolidTerrainIfNeeded();
            prevKnightClubsInvisActive = clubsInvis;
            prevKnightBurstTerrainPhase = burstTerrainPhase;
          } else {
            prevKnightClubsInvisActive = false;
            prevKnightBurstTerrainPhase = false;
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
              canvasH: canvas.height
            });
            valiantWorld.trySpawnWildBunny(
              simElapsed,
              () => randomOpenLootPoint({ ...lootPlacementOpts(), hitR: VALIANT_BUNNY_PICKUP_R })
            );
          }
        }
        if (!paused && !runDead) {
          let vx = 0;
          let vy = 0;
          let rogueMovementIntent = false;
          if (simElapsed < playerTimelockUntil || playerDamage.isSwampInfectionMoveLocked()) {
            player.velX = 0;
            player.velY = 0;
            player._px = player.x;
            player._py = player.y;
          } else {
            const lunaticMove = activeCharacterId === "lunatic" && typeof character.applyMovementFrame === "function" ? character.applyMovementFrame({
              dt,
              simElapsed,
              player,
              keys: {
                isDown: (k) => k === "ArrowLeft" || k === "ArrowRight" || k === "ArrowUp" || k === "ArrowDown" ? isArrowHeld(k) : keys.isDown(k)
              },
              steerLeft: () => isSteerHeld("q"),
              steerRight: () => isSteerHeld("e"),
              inventory: inventory2,
              PLAYER_SPEED,
              ultimateSpeedUntil,
              laserSlowMult: playerDamage.getMovementSlowMult() * (pathRuntime.getCurrentPathId() === "swamp" && hunterRuntime ? hunterRuntime.getFrogMudPoolMoveMult(player.x, player.y, player.r, simElapsed) : 1) * (pathRuntime.getCurrentPathId() === "swamp" ? getSwampBootlegMoveSpeedMult(inventory2, simElapsed) : 1),
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
                  tier: (
                    /** @type {2 | 4} */
                    tier
                  )
                });
              }
            }) : null;
            const bulwarkCharging = activeCharacterId === "bulwark" && typeof character.isBulwarkCharging === "function" && character.isBulwarkCharging();
            let sweepTouchedObstacle = false;
            if (!lunaticMove && !bulwarkCharging) {
              if (isArrowHeld("ArrowLeft")) vx -= 1;
              if (isArrowHeld("ArrowRight")) vx += 1;
              if (isArrowHeld("ArrowUp")) vy -= 1;
              if (isArrowHeld("ArrowDown")) vy += 1;
              if (pathRuntime.getCurrentPathId() === "swamp" && getSwampBootlegInvertMove(inventory2, simElapsed)) {
                vx = -vx;
                vy = -vy;
              }
              const len = Math.hypot(vx, vy);
              const rogueDashHold = activeCharacterId === "rogue" && rogueWorld.getDashAiming();
              if (len > 1e-6) {
                rogueMovementIntent = !rogueDashHold;
                player.facing = { x: vx / len, y: vy / len };
                if (!rogueDashHold) {
                  let sp = PLAYER_SPEED * (player.speedBurstMult ?? 1);
                  if (simElapsed < ultimateSpeedUntil) sp *= 1.75;
                  sp *= player.speedPassiveMult ?? 1;
                  if (simElapsed < (inventory2.spadesObstacleBoostUntil ?? 0)) {
                    sp *= 1 + Math.max(0, (player.terrainTouchMult ?? 1) - 1);
                  }
                  sp *= playerDamage.getMovementSlowMult();
                  if (pathRuntime.getCurrentPathId() === "swamp" && hunterRuntime) {
                    sp *= hunterRuntime.getFrogMudPoolMoveMult(player.x, player.y, player.r, simElapsed);
                  }
                  if (pathRuntime.getCurrentPathId() === "swamp") {
                    sp *= getSwampBootlegMoveSpeedMult(inventory2, simElapsed);
                  }
                  vx = vx / len * sp * dt;
                  vy = vy / len * sp * dt;
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
              lastPlayerHexKey
            }));
            let touchedObstacle = false;
            if (!lunaticMove) {
              const obsForPlayer = obstaclesForPlayerCollision();
              const resolved = resolvePlayerAgainstRects(player.x, player.y, player.r, obsForPlayer);
              touchedObstacle = sweepTouchedObstacle || Math.abs(resolved.x - player.x) > 1e-6 || Math.abs(resolved.y - player.y) > 1e-6;
              player.x = resolved.x;
              player.y = resolved.y;
              if (activeCharacterId === "bulwark" && typeof character.getBulwarkWorld === "function") {
                character.getBulwarkWorld().clampPlayerInDeathLock(player);
              }
            } else {
              touchedObstacle = lunaticMove.touchedObstacle;
            }
            if (touchedObstacle && (player.terrainTouchMult ?? 1) > 1) {
              inventory2.spadesObstacleBoostUntil = simElapsed + TERRAIN_SPEED_BOOST_LINGER;
            }
            if (lunaticMove && typeof character.tickLunaticRoarTerrain === "function") {
              character.tickLunaticRoarTerrain({
                simDt: dt,
                simElapsed,
                player,
                obstacles,
                damagePlayer: (amt, opts) => damagePlayerThroughPath(amt, opts)
              });
            }
            if (lunaticMove && typeof character.ejectFromObstaclesIfStuck === "function") {
              character.ejectFromObstaclesIfStuck({
                player,
                circleHitsObstacle: (x, y, r) => circleOverlapsAnyRect(x, y, r, obstacles)
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
            pruneSwampMudTrail();
            if (pathRuntime.getCurrentPathId() === "swamp") {
              const sp = Math.hypot(player.velX, player.velY);
              if (sp > 20) {
                const ax = player.x;
                const ay = player.y;
                if (!Number.isFinite(swampMudTrailLastX)) {
                  swampMudTrail.push({ x: ax, y: ay, t: simElapsed });
                  swampMudTrailLastX = ax;
                  swampMudTrailLastY = ay;
                } else {
                  const d = Math.hypot(ax - swampMudTrailLastX, ay - swampMudTrailLastY);
                  if (d >= SWAMP_MUD_TRAIL_SAMPLE_MIN) {
                    swampMudTrail.push({ x: ax, y: ay, t: simElapsed });
                    swampMudTrailLastX = ax;
                    swampMudTrailLastY = ay;
                    while (swampMudTrail.length > SWAMP_MUD_TRAIL_MAX) swampMudTrail.shift();
                  }
                }
              }
            } else {
              swampMudTrail.length = 0;
              swampMudTrailLastX = NaN;
              swampMudTrailLastY = NaN;
              knightSwampDashSplashes.length = 0;
              clearSwampHunterMudTrails();
            }
            if (!simPaused && activeCharacterId === "rogue") {
              rogueWorld.tickNeeds(
                {
                  simDt: dt,
                  simElapsed,
                  player,
                  inventory: inventory2,
                  obstacles,
                  moving: rogueMovementIntent,
                  touchedObstacle,
                  rand: randRange,
                  randomFoodPoint: () => randomOpenLootPoint({
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
                    hitR: 13
                  }),
                  spawnWorldPopup: (wx, wy, text, color) => {
                    rogueWorld.spawnPopup(wx, wy, text, color, simElapsed);
                  }
                },
                () => {
                  playerDamage.killPlayerImmediate();
                }
              );
              if (hunterRuntime) {
                rogueWorld.updateEnemyLos(
                  hunterRuntime.entities,
                  simElapsed,
                  player,
                  (h) => hunterRuntime.hasEnemyLineOfSightToPlayer(h)
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
            canvasH: canvas.height
          });
          const worldCardPickups = collectibles.filter((x) => x.kind === "card").map((x) => ({ card: x.card }));
          const reserved = collectReservedDeckKeys(inventory2, cardPickup?.getPendingCard() ?? null, worldCardPickups);
          if (simElapsed >= nextHealSpawnAt) {
            if (!runDead) {
              if (collectibles.filter((c) => c.kind === "heal").length < MAX_HEAL_CRYSTALS) {
                const pt = randomOpenLootPoint({ ...lootPlacementOpts(), hitR: HEAL_PICKUP_HIT_R });
                if (pt) {
                  const onSwamp = pathRuntime.getCurrentPathId() === "swamp";
                  collectibles.push({
                    kind: "heal",
                    x: pt.x,
                    y: pt.y,
                    r: HEAL_PICKUP_HIT_R,
                    plusHalf: HEAL_PICKUP_PLUS_HALF,
                    plusThick: HEAL_PICKUP_ARM_THICK,
                    heal: onSwamp ? SWAMP_BOOTLEG_CRYSTAL_HP : HEAL_CRYSTAL_HP,
                    bootlegSwamp: onSwamp,
                    bornAt: simElapsed,
                    expiresAt: simElapsed + HEAL_CRYSTAL_LIFETIME_SEC
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
                    expiresAt: simElapsed + CARD_COLLECTIBLE_LIFETIME_SEC
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
                if (pathRuntime.getCurrentPathId() === "swamp" && swampBootlegCrystalModal) {
                  collectibles.splice(i, 1);
                  const bundle = rollTwoBootlegOffers(() => Math.random(), simElapsed);
                  purgeSwampBootlegNextCrystalCurses(inventory2);
                  void swampBootlegCrystalModal.openModal(bundle).then((side) => {
                    const offer = side === "a" ? bundle.left : bundle.right;
                    finalizeSwampBootlegCrystalPick(offer);
                  });
                  break;
                }
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
          const hexFlowsUnpaused = !runDead && !(cardPickup?.isPaused() ?? false) && !(rouletteModal?.isPaused() ?? false) && !(forgeWorldModal?.isForgePaused() ?? false) && !(swampBootlegCrystalModal?.isPaused() ?? false) && !safehouseHexFlow.isPausedForSafehousePrompt();
          if (hexFlowsUnpaused) {
            const modalPause = () => (cardPickup?.isPaused() ?? false) || (rouletteModal?.isPaused() ?? false) || (forgeWorldModal?.isForgePaused() ?? false) || (swampBootlegCrystalModal?.isPaused() ?? false);
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
                  floorHpAtMin: 1
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
              }
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
                  floorHpAtMin: 1
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
                  }
                });
              }
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
              radius: wave.radius
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
            inventory: inventory2
          });
          worldTimeScale = enemyHook?.worldTimeScale ?? worldTimeScale;
          if (huntersEnabled && !runDead) {
            hunterRuntime.tick(dt * worldTimeScale, { suppressRangedAttacks: timelockFrozen });
            if (pathRuntime.getCurrentPathId() === "swamp") {
              tickSwampHunterMudTrails(dt);
            }
            if (pathRuntime.getCurrentPathId() === "fire" && runLevel >= 1) {
              spawnFireGrowthZonesFromFireArtillery();
            }
          }
          if (hunterRuntime && pathRuntime.getCurrentPathId() !== "swamp") {
            clearSwampHunterMudTrails();
          }
          if (!runDead) {
            hexEventRuntime?.postHunterTick();
          }
          tickAttackRings(attackRings, simElapsed);
          tickLunaticSprintTierFx(lunaticSprintTierFx, simElapsed);
          if ((inventory2.heartsRegenPerSec ?? 0) > 0 && player.hp > 0) {
            if (activeCharacterId === "valiant") {
              inventory2.heartsRegenBank = (inventory2.heartsRegenBank ?? 0) + inventory2.heartsRegenPerSec * dt;
              while (inventory2.heartsRegenBank >= 1) {
                const hurt = [];
                for (let j = 0; j < 3; j++) {
                  const s = valiantWorld.getRabbitSlots()[j];
                  if (s && s.hp < s.maxHp) hurt.push(j);
                }
                if (!hurt.length) {
                  inventory2.heartsRegenBank = 0;
                  break;
                }
                const ri = hurt[Math.floor(Math.random() * hurt.length)];
                const rb = valiantWorld.getRabbitSlots()[ri];
                if (!rb) break;
                inventory2.heartsRegenBank -= 1;
                rb.hp = Math.min(rb.maxHp, rb.hp + 1);
              }
            } else if (player.hp < player.maxHp) {
              inventory2.heartsRegenBank = (inventory2.heartsRegenBank ?? 0) + inventory2.heartsRegenPerSec * dt;
              while (inventory2.heartsRegenBank >= 1 && player.hp < player.maxHp) {
                player.hp += 1;
                inventory2.heartsRegenBank -= 1;
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
              }
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
          }
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
        const bonePathActive = pathRuntime.getCurrentPathId() === "bone";
        const floorHexFill = bonePathActive ? "#1b1d24" : pathRuntime.getPathVisualConfig().tileTint || FLOOR_HEX_FILL;
        const boneAmbientOverlay = bonePathActive;
        const boneBlindDebuffActive = bonePathActive && simElapsed < boneBlindDebuffFadeEnd && boneBlindDebuffFadeEnd > 0;
        const firePathActive = pathRuntime.getCurrentPathId() === "fire";
        const swampPathActive = pathRuntime.getCurrentPathId() === "swamp";
        if (!swampPathActive) {
          swampMudTrail.length = 0;
          swampMudTrailLastX = NaN;
          swampMudTrailLastY = NaN;
          knightSwampDashSplashes.length = 0;
          resetSwampBootlegState(inventory2);
          swampBootlegCrystalModal?.close?.();
        }
        for (const h of activeHexes) {
          const { x: cx, y: cy } = hexToWorld(h.q, h.r);
          fillPointyHexCell(ctx, cx, cy, HEX_SIZE, floorHexFill, null);
        }
        if (firePathActive) drawFireAtmosphereWorld(ctx, viewW, viewH);
        if (swampPathActive) drawSwampAtmosphereBackgroundWorld(ctx, viewW, viewH);
        if (swampPathActive) drawSwampMudTrailWorld(ctx);
        if (swampPathActive) drawKnightSwampDashSplashesWorld(ctx);
        if (bonePathActive) {
          const pulse = 0.5 + 0.5 * Math.sin(simElapsed * 1.6);
          const r1 = Math.max(viewW, viewH) * 0.62;
          const r2 = Math.max(viewW, viewH) * 0.92;
          const g1 = ctx.createRadialGradient(player.x, player.y, r1 * 0.06, player.x, player.y, r1);
          g1.addColorStop(0, `rgba(226, 232, 240, ${0.05 + pulse * 0.025})`);
          g1.addColorStop(0.45, `rgba(148, 163, 184, ${0.045 + pulse * 0.02})`);
          g1.addColorStop(1, "rgba(15, 23, 42, 0)");
          ctx.fillStyle = g1;
          ctx.fillRect(cameraX - 16, cameraY - 16, viewW + 32, viewH + 32);
          const g2 = ctx.createRadialGradient(player.x, player.y, r2 * 0.15, player.x, player.y, r2);
          g2.addColorStop(0, "rgba(0, 0, 0, 0)");
          g2.addColorStop(0.68, "rgba(2, 6, 23, 0.16)");
          g2.addColorStop(1, "rgba(2, 6, 23, 0.34)");
          ctx.fillStyle = g2;
          ctx.fillRect(cameraX - 20, cameraY - 20, viewW + 40, viewH + 40);
        }
        drawObstacles(
          ctx,
          obstacles,
          swampPathActive ? { fill: "#3b2d20", stroke: "#7c5a3b" } : firePathActive ? { fill: "#3a1812", stroke: "#fca5a5", glowColor: "rgba(251, 113, 133, 0.45)", glowBlur: 8 } : bonePathActive ? { fill: "#151821", stroke: "#aeb7c9", glowColor: "rgba(226, 232, 240, 0.55)", glowBlur: 12 } : void 0
        );
        if (swampPathActive) drawSwampAtmosphereForegroundWorld(ctx, viewW, viewH);
        if (firePathActive && runLevel >= 1) drawFireGrowthZones(ctx);
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
          spentTileAnim: safehouseHexFlow.getSpentTileAnim()
        });
        drawArenaNexusHexWorld(
          ctx,
          activeHexes,
          hexToWorld,
          specials.isArenaHexTile,
          specials.isArenaSpent,
          hexEventRuntime?.getArenaDrawState() ?? null
        );
        rouletteHexFlow.drawWorld(
          ctx,
          activeHexes,
          hexToWorld,
          simElapsed,
          (q, r) => specials.isRouletteHexTile(q, r),
          (q, r) => specials.isRouletteHexInteractive(q, r),
          (q, r) => specials.isRouletteSpent(q, r)
        );
        forgeHexFlow.drawWorld(
          ctx,
          activeHexes,
          hexToWorld,
          simElapsed,
          (q, r) => specials.isForgeHexTile(q, r),
          (q, r) => specials.isForgeHexInteractive(q, r),
          (q, r) => specials.isForgeSpent(q, r)
        );
        drawSurgeHexWorld(
          ctx,
          activeHexes,
          hexToWorld,
          specials.isSurgeHexTile,
          specials.isSurgeSpent,
          hexEventRuntime?.getSurgeDrawState() ?? null
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
            drawHealPickup(ctx, c, simElapsed, {
              lunaticMaxHpCrystal: activeCharacterId === "lunatic",
              bootlegSwampCrystal: !!c.bootlegSwamp
            });
          } else if (c.kind === "card") {
            drawCardPickupWorld(ctx, c, simElapsed);
          }
        }
        drawDamagePopups(ctx);
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
            const fadeSpan = Math.max(1e-4, boneBlindDebuffFadeEnd - boneBlindDebuffPeakEnd);
            const debuffStr = simElapsed < boneBlindDebuffPeakEnd ? 1 : clamp7((boneBlindDebuffFadeEnd - simElapsed) / fadeSpan, 0, 1);
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
              typeof character.getBulwarkWorld === "function" ? character.getBulwarkWorld().getPlantedChargeCount() : 0
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
          const dashPreview = typeof character.getDashPreviewRange === "function" ? character.getDashPreviewRange() : 120;
          rogueWorld.drawDashAim(ctx, player, dashPreview);
          rogueWorld.drawStealthAid(ctx, player, obstacles);
          rogueWorld.drawWorldPopups(ctx, simElapsed);
        }
        const hurt01 = activeCharacterId === "valiant" ? Math.min(1, 1 - valiantWorld.getWill() + (playerDamage.combat.hurtFlashRemain > 0 ? 0.22 : 0)) : player.maxHp > 0 ? Math.min(1, 1 - player.hp / player.maxHp + (playerDamage.combat.hurtFlashRemain > 0 ? 0.22 : 0)) : 0;
        const invulnGate = Math.max(character.getInvulnUntil(), playerDamage.combat.playerInvulnerableUntil);
        let bodyAlpha = 1;
        if (simElapsed < invulnGate) {
          bodyAlpha = 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(simElapsed * 32));
        }
        if (activeCharacterId === "knight" && simElapsed < (inventory2.clubsInvisUntil ?? 0)) {
          const pulse = 0.5 + 0.5 * Math.sin(simElapsed * 12);
          const ghostAlpha = clamp7(0.34 + 0.16 * pulse, 0.28, 0.52);
          bodyAlpha = Math.min(bodyAlpha, ghostAlpha);
        }
        if (activeCharacterId === "rogue" && rogueWorld.stealthBlocksDamage(simElapsed, inventory2)) {
          const pulse = 0.5 + 0.5 * Math.sin(simElapsed * 12);
          const ghostAlpha = clamp7(0.34 + 0.16 * pulse, 0.28, 0.52);
          bodyAlpha = Math.min(bodyAlpha, ghostAlpha);
        }
        if (typeof character.getBurstVisualUntil === "function" && character.getBurstVisualUntil(simElapsed) > simElapsed) {
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
            typeof character.getHpHudYOffset === "function" ? character.getHpHudYOffset() : 0
          );
        } else {
          drawPlayerHpHud(ctx, player, {
            tempHp: player.tempHp,
            extraHudYOffset: typeof character.getHpHudYOffset === "function" ? character.getHpHudYOffset() : 0
          });
        }
        if (activeCharacterId === "rogue") {
          rogueWorld.drawSurvivalHudArcs(ctx, player, simElapsed);
        }
        if (swampPathActive) {
          const extraHudYOffset = typeof character.getHpHudYOffset === "function" ? character.getHpHudYOffset() : 0;
          const infX = player.x + player.r + 34;
          const baseY = player.y - player.r - 10 - extraHudYOffset;
          const stacks = Math.max(0, Math.floor(inventory2.swampInfectionStacks ?? 0));
          const tenEnd = swampInfectionTenBurstAt + SWAMP_INFECTION_BURST_STUN_SEC + SWAMP_INFECTION_TEN_DRIFT_SEC;
          const showTenFx = swampInfectionTenBurstAt > 0 && simElapsed < tenEnd;
          const showStackHud = stacks >= 1 && stacks <= SWAMP_INFECTION_CAP - 1;
          const chainLocked = simElapsed < swampInfectionChainLockUntil;
          const holdTenHud = chainLocked && stacks >= SWAMP_INFECTION_CAP && !showTenFx;
          if (showTenFx || showStackHud || holdTenHud) {
            ctx.save();
            ctx.textAlign = "left";
            ctx.textBaseline = "bottom";
            let txt = "";
            let alpha = 1;
            let infY = baseY;
            let fontPx = 14;
            if (showTenFx) {
              const stunEnd = swampInfectionTenBurstAt + SWAMP_INFECTION_BURST_STUN_SEC;
              txt = "10!";
              fontPx = 17;
              if (simElapsed < stunEnd) {
                alpha = 1;
                infY = baseY;
              } else {
                const driftU = clamp7((simElapsed - stunEnd) / SWAMP_INFECTION_TEN_DRIFT_SEC, 0, 1);
                infY = baseY - driftU * 36;
                alpha = 1 - driftU;
              }
            } else if (holdTenHud) {
              txt = "10";
              fontPx = 15;
              alpha = 0.74;
            } else {
              txt = stacks >= 8 ? `${stacks}!` : `${stacks}`;
              if (stacks >= 8) fontPx = 15;
            }
            ctx.font = `bold ${fontPx}px ui-sans-serif, system-ui, "Segoe UI", sans-serif`;
            ctx.lineWidth = 4;
            ctx.strokeStyle = `rgba(2, 6, 23, ${0.82 * alpha})`;
            ctx.strokeText(txt, infX, infY);
            ctx.fillStyle = `rgba(163, 230, 53, ${0.92 * alpha})`;
            ctx.fillText(txt, infX, infY);
            ctx.restore();
          }
          if (swampInfectionTenBurstAt > 0 && simElapsed >= tenEnd) {
            swampInfectionTenBurstAt = 0;
          }
        }
        const heartsResistanceCount = playerDamage.getHeartsResistanceCardCount?.() ?? 0;
        const heartsResistanceReady = heartsResistanceCount > 0 && simElapsed >= (inventory2.heartsResistanceReadyAt ?? 0);
        if (heartsResistanceReady) {
          ctx.strokeStyle = "rgba(252, 165, 165, 0.95)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(player.x, player.y, player.r + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (heartsResistanceCount > 0 && !heartsResistanceReady) {
          const cdDur = Math.max(
            1e-3,
            inventory2.heartsResistanceCooldownDuration || playerDamage.getHeartsResistanceCooldown?.() || 1
          );
          const rem = Math.max(0, (inventory2.heartsResistanceReadyAt ?? 0) - simElapsed);
          const t = clamp7(1 - rem / cdDur, 0, 1);
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
        if (swampPathActive) drawSwampPlayerMudChurnWorld(ctx);
        drawPlayerBody(ctx, player.x, player.y, player.r, player.facing, hurt01, bodyAlpha);
        if (activeCharacterId === "bulwark" && typeof character.getBulwarkParryUntil === "function") {
          drawBulwarkParry(ctx, player, simElapsed, character.getBulwarkParryUntil());
        }
        if (activeCharacterId === "bulwark" && typeof character.getBulwarkWorld === "function" && character.getBulwarkWorld().isFlagCarried()) {
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
        if (pathRuntime.getCurrentPathId() === "swamp" && simElapsed < swampInfectionDebuffOverlayUntil) {
          const dur = SWAMP_INFECTION_BURST_STUN_SEC + SWAMP_INFECTION_BURST_SLOW_SEC;
          const fade = clamp7((swampInfectionDebuffOverlayUntil - simElapsed) / dur, 0, 1);
          const pulse = 0.88 + 0.12 * (0.5 + 0.5 * Math.sin(simElapsed * 11));
          const a = fade * pulse;
          ctx.save();
          ctx.fillStyle = `rgba(4, 22, 12, ${0.58 * a})`;
          ctx.fillRect(0, 0, viewW, viewH);
          ctx.fillStyle = `rgba(12, 38, 22, ${0.38 * a})`;
          ctx.fillRect(0, 0, viewW, viewH);
          const cx = viewW * 0.5;
          const cy = viewH * 0.5;
          const r0 = Math.min(viewW, viewH) * 0.05;
          const r1 = Math.max(viewW, viewH) * 0.88;
          const g = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1);
          g.addColorStop(0, `rgba(45, 88, 52, ${0.38 * a})`);
          g.addColorStop(0.32, `rgba(18, 52, 30, ${0.72 * a})`);
          g.addColorStop(0.65, `rgba(6, 26, 14, ${0.86 * a})`);
          g.addColorStop(1, `rgba(2, 10, 5, ${0.94 * a})`);
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, viewW, viewH);
          ctx.strokeStyle = `rgba(52, 211, 102, ${0.72 * a})`;
          ctx.lineWidth = 7;
          ctx.strokeRect(2, 2, viewW - 4, viewH - 4);
          ctx.strokeStyle = `rgba(16, 90, 48, ${0.45 * a})`;
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, viewW - 20, viewH - 20);
          ctx.fillStyle = `rgba(4, 22, 10, ${0.68 * a})`;
          ctx.fillRect(0, 0, viewW, viewH * 0.14);
          ctx.fillRect(0, viewH * 0.86, viewW, viewH * 0.14);
          ctx.fillStyle = `rgba(22, 163, 74, ${0.2 * a})`;
          ctx.fillRect(0, 0, viewW, viewH);
          ctx.fillStyle = `rgba(34, 197, 94, ${0.1 * a})`;
          ctx.globalCompositeOperation = "screen";
          ctx.fillRect(0, 0, viewW, viewH);
          ctx.globalCompositeOperation = "source-over";
          ctx.restore();
        }
        drawRunStatsHud(ctx, {
          survivalSec: simElapsed,
          bestSec: bestSurvivalSec,
          displayLevel: runLevel + 1,
          wave: hunterRuntime?.spawnState?.wave ?? 0,
          hunterCount: hunterRuntime?.entities?.hunters?.length ?? 0
        });
        if (pathRuntime.getCurrentPathId() === "swamp") {
          drawSwampBootlegCursesHud(ctx, viewW, viewH, getSwampBootlegSidebarRows(inventory2, simElapsed));
        }
        if (activeCharacterId === "valiant" && !runDead) {
          drawValiantScreenHud(ctx, {
            will01: valiantWorld.getWill(),
            occupiedRabbitCount: valiantWorld.occupiedRabbitCount(),
            netWillPerSec: valiantWorld.getWillNetChangePerSec(),
            rabbitSlots: valiantWorld.getRabbitSlots()
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
            viewH / 2 + 24
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
      { once: true }
    );
  }
  function startBootWhenGameCanvasMounted() {
    const canvas = document.getElementById("game");
    if (canvas instanceof HTMLCanvasElement) {
      boot();
      return;
    }
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
})();
