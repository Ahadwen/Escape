(() => {
  // src/escape/constants.js
  var TAU = Math.PI * 2;
  var TILE_W = 560;
  var BLOCK = 35;
  var HEAL_PICKUP_HIT_R = 24;
  var CARD_PICKUP_HIT_R = 20;
  var CARD_PICKUP_REACH_EXTRA = 10;
  var HEAL_PICKUP_PLUS_HALF = 13;
  var HEAL_PICKUP_ARM_THICK = 6;
  var SNIPER_ARTILLERY_WINDUP = 1.38;
  var SNIPER_ARTILLERY_LEAD = 0.82;
  var SNIPER_ARTILLERY_BANG_DURATION = 0.34;
  function tileGridDims(viewH) {
    return {
      TILE_COLS: Math.floor(TILE_W / BLOCK),
      TILE_ROWS: Math.floor(viewH / BLOCK)
    };
  }

  // src/escape/balance.js
  var DEATH_ANIM_DURATION = 0.42;
  var PICKUP_SPAWN_INTERVAL = 3.2;
  var CARD_SPAWN_INTERVAL = 8.5;
  var LOOT_DENSITY_BASE_ACTIVE_HEXES = 3;
  var TERRAIN_SPEED_BOOST_LINGER = 0.16;
  var ROGUE_STEALTH_AFTER_LOS_BREAK = 0.35;
  var ROGUE_STEALTH_OPEN_GRACE = 0.4;
  var KNIGHT_SPADES_WORLD_SLOW_MULT = 0.3;
  var KNIGHT_SPADES_WORLD_SLOW_SEC = 2;
  var SPAWN_INTERVAL_START = 8;
  var SPAWN_INTERVAL_FLOOR = 1.5;
  var DANGER_RAMP_SECONDS = 300;
  var KNIGHT_DIAMOND_BURST_SPEED_MULT = 2.6;
  var KNIGHT_DIAMOND_BURST_DURATION_BONUS_SEC = 1.5;
  var LATE_GAME_ELITE_SPAWN_SEC = 180;
  var MIDGAME_ESCALATION_START_SEC = 240;
  var MIDGAME_ESCALATION_INTERVAL_SEC = 15;
  var MIDGAME_ESCALATION_SPEED_FACTOR = 1.05;
  var BASE_WAVE_SPAWN_JOBS = 14;
  var AIR_SPAWNER_CHASE_SPEED = 84 * 1.05;
  var LASER_BLUE_COOLDOWN_SEC = 1.22;
  var LASER_BLUE_WARN_SEC = 0.3;
  var LASER_BLUE_PLAYER_SLOW_MULT = 0.8;
  var LASER_BLUE_PLAYER_SLOW_SEC = 1.5;
  var HUNTER_SPEED_AGE_COEFF = 1.1;
  var SET_BONUS_SUIT_THRESHOLD = 7;
  var SET_BONUS_SUIT_MAX = 13;
  var HEARTS_13_DEATH_DEFY_CD_SEC = 30;
  var SPADES_13_AURA_RADIUS_PX = 2 * 96;
  var SPADES_13_ENEMY_DT_MULT = 0.7;
  var CLUBS_13_HITBOX_MULT = 0.7;
  var CLUBS_13_UNTARGETABLE_SEC = 1;
  var PLAYER_BASE_HITBOX_R = 10;
  var CARD_RANK_SPAWN_WEIGHT_MAX = 24;
  var CARD_RANK_SPAWN_WEIGHT_MIN = 1;
  var ULTIMATE_ABILITY_COOLDOWN_SEC = 20;
  var ULT_BURST_RADIUS = 280;
  var ULT_BURST_WAVE_COUNT = 5;
  var ULT_BURST_WAVE_SPAN_SEC = 2;
  var ULT_ORBIT_SHIELD_RADIUS_EXTRA = 36;
  var ULT_ORBIT_SHIELD_STAGGER_SEC = 4;
  var ROGUE_FOOD_HUNGER_RESTORE = 30;
  var ROGUE_FOOD_LIFETIME = 21;
  var ROGUE_FOOD_SENSE_DURATION = 2.35;
  var ROGUE_FOOD_ARROW_CLOSE_PLATEAU = 96;
  var ROGUE_FOOD_ARROW_FAR_LEN = 440;
  var ROGUE_DESPERATION_SPEED_MAX = 0.2;
  var CAMERA_FOLLOW_LERP = 0.18;
  var CHARACTERS = {
    knight: {
      id: "knight",
      name: "Knight",
      baseHp: 10,
      cooldownAbilityIds: ["dash", "burst", "decoy"],
      abilities: {
        dash: { key: "q", label: "Dash", cooldown: 2.2, minCooldown: 0.25 },
        burst: { key: "w", label: "Burst", cooldown: 5, minCooldown: 0.4, duration: 3 },
        decoy: { key: "e", label: "Decoy", cooldown: 8, minCooldown: 0.4 },
        random: { key: "r", label: "Ultimate" }
      }
    },
    rogue: {
      id: "rogue",
      name: "Hungry Rogue",
      baseHp: 7,
      cooldownAbilityIds: ["dash", "burst"],
      abilities: {
        dash: { key: "q", label: "Dash", cooldown: 2.2, minCooldown: 0.25 },
        burst: { key: "w", label: "Smoke", cooldown: 16, minCooldown: 1, duration: 3 },
        decoy: { key: "e", label: "Consume", cooldown: 4.5, minCooldown: 0.5 },
        random: { key: "r", label: "Ultimate" }
      }
    },
    lunatic: {
      id: "lunatic",
      name: "The Lunatic",
      baseHp: 10,
      cooldownAbilityIds: ["dash", "burst", "decoy"],
      abilities: {
        dash: { key: "q", label: "Steer left", cooldown: 0, minCooldown: 0 },
        burst: { key: "w", label: "Sprint / Stop", cooldown: 0, minCooldown: 0, duration: 0 },
        decoy: { key: "e", label: "Steer right", cooldown: 0, minCooldown: 0 },
        random: { key: "r", label: "Roar" }
      }
    },
    valiant: {
      id: "valiant",
      name: "The Valiant",
      /** Robot body: no personal HP pool; rabbits + Will track survival. */
      baseHp: 1,
      cooldownAbilityIds: ["dash", "burst", "decoy"],
      abilities: {
        dash: { key: "q", label: "Surge", cooldown: 5, minCooldown: 0.45, duration: 3 },
        burst: { key: "w", label: "Shock field", cooldown: 6.5, minCooldown: 0.5, duration: 0 },
        decoy: { key: "e", label: "Rescue", cooldown: 25, minCooldown: 0.5 },
        random: { key: "r", label: "Ultimate" }
      }
    }
  };
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
  var VALIANT_DIAMOND_RESCUE_WILL_BONUS = 0.12;
  var VALIANT_DIAMOND_BOX_SCALE = 1.32;
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
  var LUNATIC_SPRINT_TIER_FX_DUR_T2 = 0.38;
  var LUNATIC_SPRINT_TIER_FX_DUR_T4 = 0.52;
  var LUNATIC_TURN_RADIUS_PX = 168;
  var LUNATIC_STEER_MAX_RAD_PER_SEC = 2.35;
  var LUNATIC_ROAR_COOLDOWN_SEC = 30;
  var LUNATIC_ROAR_DURATION_SEC = 1;
  var LUNATIC_ROAR_SPEED_MULT = 1.12;
  var LUNATIC_ROAR_TERRAIN_DAMAGE_INTERVAL_SEC = 0.1;
  var LUNATIC_ROAR_TERRAIN_DAMAGE = 3;
  var HEX_SIZE = TILE_W * 1.15;
  var SQRT3 = Math.sqrt(3);
  var HEX_DIRS = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 }
  ];
  var ARENA_NEXUS_SIEGE_SEC = 10;
  var ARENA_NEXUS_INNER_HEX_SCALE = 0.62;
  var ARENA_NEXUS_INNER_ENTER_R = HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE * (SQRT3 / 2) * 0.96;
  var ARENA_NEXUS_INNER_APOTHEM = HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE * (SQRT3 / 2);
  var ARENA_NEXUS_RING_LO = HEX_SIZE * 0.66;
  var ARENA_NEXUS_RING_HI = HEX_SIZE * 0.93;
  var ARENA_NEXUS_RING_LASER_SPAWN_INTERVAL = 2.85;
  var ARENA_NEXUS_RING_SNIPER_SPAWN_INTERVAL = 3.45;
  var ARENA_NEXUS_REWARD_MODAL_DELAY_SEC = 1.35;
  var PROCEDURAL_SPECIAL_HEX_MIN_ELAPSED_SEC = 15;
  var SPECIAL_SPAWN_WEIGHT_START = 1 / 30;
  var SPECIAL_SPAWN_WEIGHT_END = 1 / 10;
  var SPECIAL_SPAWN_DECAY_SEC = 20;
  var SPECIAL_SPAWN_COOLDOWN_SEC = 15;
  var ROULETTE_INNER_HIT_R = 52;
  var ROULETTE_INNER_HEX_DRAW_R = 46;
  var ROULETTE_SPIN_SHUFFLE_SEC = 2.15;
  var ROULETTE_SPIN_WHITEOUT_SEC = 0.42;
  var SURGE_HEX_WAVES = 10;
  var SURGE_TRAVEL_DUR_FIRST = 1.1;
  var SURGE_TRAVEL_DUR_DECREMENT_PER_WAVE = 0.05;
  var SURGE_WAVE_PAUSE_SEC = 0.3;
  var SURGE_TILE_DAMAGE = 2;
  var SURGE_TILE_FLASH_SEC = 0.22;
  var SURGE_SAFE_HEX_DRAW_R = 81;
  var SURGE_SAFE_HIT_R = 99;
  var SURGE_SAFE_MIN_CENTER_SEP_PX = SURGE_SAFE_HEX_DRAW_R * 2;
  var SAFEHOUSE_INNER_HIT_R = 46;
  var SAFEHOUSE_EMBED_SITE_HIT_R = 28;
  var SAFEHOUSE_EMBED_CENTER_INSET = 0.4;
  var SAFEHOUSE_EMBED_HEX_VERTEX_R_MULT = 0.14;

  // src/escape/hex-math.js
  function hexToWorld(q, r) {
    return {
      x: HEX_SIZE * SQRT3 * (q + r / 2),
      y: HEX_SIZE * 1.5 * r
    };
  }
  function worldToHex(x, y) {
    const qf = (SQRT3 / 3 * x - 1 / 3 * y) / HEX_SIZE;
    const rf = 2 / 3 * y / HEX_SIZE;
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
  function hexKey(q, r) {
    return `${q},${r}`;
  }

  // src/escape/dev/log-codes.js
  var EVT_SESSION_START = "ESC-EVT-0001";
  var EVT_GAME_START = "ESC-EVT-0010";
  var EVT_CHARACTER_SELECTED = "ESC-EVT-0012";
  var EVT_CHARACTER_CONFIRM = "ESC-EVT-0013";
  var EVT_CHARACTER_HOWTO_OPEN = "ESC-EVT-0014";
  var EVT_CHARACTER_HOWTO_BACK = "ESC-EVT-0015";
  var EVT_HEAL_PICKUP = "ESC-EVT-0100";
  var EVT_ROGUE_FOOD_EATEN = "ESC-EVT-0102";
  var EVT_PROCEDURAL_SPECIAL_HEX = "ESC-EVT-0103";
  var EVT_CARD_MODAL_OPEN = "ESC-EVT-0200";
  var EVT_CARD_MODAL_CLOSE = "ESC-EVT-0201";
  var EVT_CARD_LOADOUT_CONTINUE = "ESC-EVT-0202";
  var EVT_ROULETTE_MODAL_OPEN = "ESC-EVT-0210";
  var EVT_ROULETTE_MODAL_CLOSE = "ESC-EVT-0211";
  var EVT_ROULETTE_FORGE_SUCCESS = "ESC-EVT-0212";
  var EVT_SAFEHOUSE_LEVEL_UP = "ESC-EVT-0213";
  var EVT_FORGE_MODAL_OPEN = "ESC-EVT-0214";
  var EVT_FORGE_MODAL_CLOSE = "ESC-EVT-0215";
  var EVT_FORGE_SUCCESS = "ESC-EVT-0216";
  var EVT_MANUAL_PAUSE = "ESC-EVT-0220";
  var EVT_MANUAL_RESUME = "ESC-EVT-0221";
  var E_SNAPSHOT_FOLDER = "ESC-E-SNAP-0001";
  var E_SNAPSHOT_API = "ESC-E-SNAP-0005";
  var E_SNAPSHOT_BLOB = "ESC-E-SNAP-0002";
  var E_SNAPSHOT_SAVE = "ESC-E-SNAP-0003";
  var E_SNAPSHOT_RENDER_HOOK = "ESC-E-SNAP-0004";
  var E_RUN_LOG_FINALIZE = "ESC-E-LOG-0001";
  var E_MAIN_LOOP = "ESC-E-LOOP-0001";
  var E_ROULETTE_NO_FORGE_PAIR = "ESC-E-ROUL-0001";

  // src/escape/dev/run-log.js
  var RUN_LOG_MAX_ENTRIES = 30;
  function pad2(n) {
    return String(n).padStart(2, "0");
  }
  function sessionStamp() {
    const d = /* @__PURE__ */ new Date();
    return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
  }
  function randomSuffix() {
    return Math.random().toString(16).slice(2, 6);
  }
  function formatDetail(detail) {
    if (detail == null) return "";
    if (typeof detail === "string") return detail;
    try {
      return JSON.stringify(detail);
    } catch {
      return String(detail);
    }
  }
  function createRunLog({ enabled }) {
    const sessionId = `ESC-${sessionStamp()}-${randomSuffix()}`;
    const lines = [];
    function push(level, code, message, detail) {
      if (!enabled) return;
      const ts = (/* @__PURE__ */ new Date()).toISOString();
      const tail = detail != null ? ` | ${formatDetail(detail)}` : "";
      const line = `[${ts}] [${level}] ${code} \u2014 ${message}${tail}`;
      lines.push(line);
      while (lines.length > RUN_LOG_MAX_ENTRIES) lines.shift();
    }
    return {
      sessionId,
      enabled,
      getLines() {
        return enabled ? [...lines] : [];
      },
      /** Dump current buffer to the browser console (oldest → newest). */
      printToConsole() {
        if (!enabled) return;
        const snapshot = [...lines];
        const label = `Escape run log (${snapshot.length}/${RUN_LOG_MAX_ENTRIES}) session=${sessionId}`;
        console.group(label);
        if (snapshot.length === 0) console.log("(empty)");
        else for (const line of snapshot) console.log(line);
        console.groupEnd();
      },
      /** Download current buffer as a `.txt` file. */
      downloadTxt() {
        if (!enabled || lines.length === 0) return;
        try {
          const body = [
            `Escape run log`,
            `sessionId=${sessionId}`,
            `entries=${lines.length} (max ${RUN_LOG_MAX_ENTRIES})`,
            "",
            ...lines,
            ""
          ].join("\n");
          const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `escape-run-${sessionId}.txt`;
          a.rel = "noopener";
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 2500);
        } catch (err) {
          console.error(E_RUN_LOG_FINALIZE, err);
        }
      },
      /** Gameplay / UX events (pickups, modals, etc.) */
      event(code, message, detail) {
        push("EVENT", code, message, detail);
      },
      /** Non-fatal anomalies */
      warn(code, message, detail) {
        push("WARN", code, message, detail);
      },
      /**
       * Human-readable failure plus optional detail.
       * @param {string} code
       * @param {string} humanMessage
       * @param {unknown} [err]
       */
      fail(code, humanMessage, err) {
        const detail = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err != null ? { value: String(err) } : void 0;
        if (enabled) push("ERROR", code, humanMessage, detail);
        else if (err) console.error(code, humanMessage, err);
        else console.error(code, humanMessage);
      }
    };
  }

  // src/escape/math.js
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
  function distSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }
  function pointToSegmentDistance(px, py, ax, ay, bx, by) {
    const abx = bx - ax;
    const aby = by - ay;
    const ab2 = abx * abx + aby * aby || 1;
    const apx = px - ax;
    const apy = py - ay;
    const t = clamp((apx * abx + apy * aby) / ab2, 0, 1);
    const cx = ax + abx * t;
    const cy = ay + aby * t;
    return Math.hypot(px - cx, py - cy);
  }
  function rand(min, max) {
    return min + Math.random() * (max - min);
  }
  function intersectsRectCircle(circle, rect) {
    const nx = clamp(circle.x, rect.x, rect.x + rect.w);
    const ny = clamp(circle.y, rect.y, rect.y + rect.h);
    const dx = circle.x - nx;
    const dy = circle.y - ny;
    return dx * dx + dy * dy <= circle.r * circle.r;
  }

  // src/escape/rng.js
  function makeRng(seed) {
    let s = seed | 0;
    return () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return (s >>> 0) / 4294967296;
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
    const SQRT32 = Math.sqrt(3);
    const halfW = SQRT32 * hexSize / 2;
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
      const qf = (SQRT32 / 3 * x - 1 / 3 * y) / hexSize;
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

  // src/escape/draw.js
  function drawCircle(ctx, x, y, r, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  function drawHealPickup(ctx, p, elapsed) {
    const pulse = 0.94 + 0.06 * (0.5 + 0.5 * Math.sin(elapsed * 5));
    const h = (p.plusHalf ?? HEAL_PICKUP_PLUS_HALF) * pulse;
    const t = p.plusThick ?? HEAL_PICKUP_ARM_THICK;
    const { x, y } = p;
    ctx.save();
    ctx.translate(x, y);
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
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-h, -t / 2, 2 * h, t);
    ctx.strokeRect(-t / 2, -h, t, 2 * h);
    ctx.restore();
  }
  function drawObstacles(ctx, obstacles) {
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    for (const o of obstacles) {
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    }
  }
  function strokePointyHexOutline(ctx, cx, cy, vertexRadius, strokeStyle, lineWidth, glowBlur) {
    ctx.save();
    ctx.shadowColor = strokeStyle;
    ctx.shadowBlur = glowBlur;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + Math.PI / 3 * i;
      const x = cx + Math.cos(a) * vertexRadius;
      const y = cy + Math.sin(a) * vertexRadius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.stroke();
    ctx.restore();
  }
  function fillPointyHexRainbowGlow(ctx, cx, cy, vertexRadius, elapsed, drawOutline = true, fillAlphaScale = 1) {
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
    const spin = elapsed * 2.8;
    if (typeof ctx.createConicGradient === "function") {
      const g = ctx.createConicGradient(spin, cx, cy);
      for (let k = 0; k <= 7; k++) g.addColorStop(k / 7, `hsl(${k / 7 * 360} 92% 58%)`);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = `hsla(${elapsed * 110 % 360}, 92%, 58%, 0.55)`;
    }
    ctx.globalAlpha = 0.52 * fillAlphaScale;
    ctx.fill();
    ctx.globalAlpha = 1;
    if (drawOutline) {
      ctx.strokeStyle = `rgba(255,255,255,${0.35 * fillAlphaScale})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawSafehouseHexCell(ctx, cx, cy, vertexRadius, elapsed) {
    const innerVertexR = vertexRadius * SURGE_SAFE_HEX_DRAW_R / HEX_SIZE;
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
    const nWisps = 14;
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
    const face = cos >= 0 ? pickup.card : pickup.flipCard ?? pickup.card;
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
    ctx.restore();
  }

  // src/escape/game.js
  var RUN_LEVEL_UP_CINEMATIC_MS = 2800;
  var SAFEHOUSE_SPENT_TILE_ANIM_MS = 1200;
  function mountEscape({
    canvas,
    snapshotFolderButton,
    snapshotStatus,
    controlsHintEl,
    characterSelectModal,
    characterSelectOptions,
    abilitySlots,
    deckRankSlotEls,
    backpackSlotEls,
    setBonusStatusEl,
    dangerRampFillEl,
    cardModal,
    modalDeckStripEl,
    cardModalFace,
    modalSetBonusStatusEl,
    cardCloseButton,
    cardPickupButton,
    cardSkipButton,
    cardSwapRow,
    rouletteModal = null,
    rouletteModalTitle = null,
    rouletteModalSub = null,
    rouletteModalSpinRow = null,
    rouletteModalActions = null,
    forgeModalEl = null,
    forgeModalTitleEl = null,
    forgeModalSubEl = null,
    forgeModalActionsEl = null,
    safehouseLevelModalEl = null,
    safehouseLevelYesBtn = null,
    safehouseLevelNoBtn = null,
    /** Dev/test: `<select>` for which special tile (if any) is forced west of spawn; disabled while `gameStarted`. */
    specialTestWestSelect = null
  } = {}) {
    const escapeLocalDevHost = (() => {
      try {
        const h = window.location.hostname;
        return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
      } catch {
        return false;
      }
    })();
    const runLog = createRunLog({ enabled: escapeLocalDevHost });
    runLog.event(EVT_SESSION_START, "Escape session mounted", { sessionId: runLog.sessionId });
    const forgeModal = forgeModalEl ?? (typeof document !== "undefined" ? document.getElementById("forge-modal") : null);
    const forgeModalTitle = forgeModalTitleEl ?? (typeof document !== "undefined" ? document.getElementById("forge-modal-title") : null);
    const forgeModalSub = forgeModalSubEl ?? (typeof document !== "undefined" ? document.getElementById("forge-modal-sub") : null);
    const forgeModalActions = forgeModalActionsEl ?? (typeof document !== "undefined" ? document.getElementById("forge-modal-actions") : null);
    const forgeModalInventory = typeof document !== "undefined" ? document.getElementById("forge-modal-inventory") : null;
    const forgeSlotLeft = typeof document !== "undefined" ? document.getElementById("forge-slot-left") : null;
    const forgeSlotRight = typeof document !== "undefined" ? document.getElementById("forge-slot-right") : null;
    const forgePreviewValue = typeof document !== "undefined" ? document.getElementById("forge-preview-value") : null;
    const forgeModalHint = typeof document !== "undefined" ? document.getElementById("forge-modal-hint") : null;
    const safehouseLevelModal = safehouseLevelModalEl ?? (typeof document !== "undefined" ? document.getElementById("safehouse-level-modal") : null);
    const safehouseLevelYes = safehouseLevelYesBtn ?? (typeof document !== "undefined" ? document.getElementById("safehouse-level-yes") : null);
    const safehouseLevelNo = safehouseLevelNoBtn ?? (typeof document !== "undefined" ? document.getElementById("safehouse-level-no") : null);
    if (escapeLocalDevHost) {
      const runLogPrintBtn = document.getElementById("run-log-print-console");
      const runLogDownloadBtn = document.getElementById("run-log-download-txt");
      if (runLogPrintBtn) runLogPrintBtn.addEventListener("click", () => runLog.printToConsole());
      if (runLogDownloadBtn) runLogDownloadBtn.addEventListener("click", () => runLog.downloadTxt());
    }
    const deathSnapshotsEnabled = escapeLocalDevHost;
    if (!deathSnapshotsEnabled) {
      const meta = snapshotFolderButton?.closest(".meta");
      if (meta) meta.hidden = true;
    }
    if (!escapeLocalDevHost) {
      const testPanel = document.getElementById("special-test-west-panel");
      if (testPanel) testPanel.hidden = true;
    }
    const ctx = canvas.getContext("2d");
    const world = { w: canvas.width, h: canvas.height };
    const postFxCanvas = document.createElement("canvas");
    postFxCanvas.width = world.w;
    postFxCanvas.height = world.h;
    const postFxCtx = postFxCanvas.getContext("2d");
    const VIEW_W = world.w;
    const VIEW_H = world.h;
    const { TILE_COLS, TILE_ROWS } = tileGridDims(world.h);
    let obstacles = [];
    let activePlayerHex = { q: 0, r: 0 };
    let activeHexes = [];
    let cameraX = 0;
    let cameraY = 0;
    let lastPlayerHexKey = null;
    const tileCache = /* @__PURE__ */ new Map();
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
    function resetArenaNexusIfArenaHexEvicted(cacheKey) {
      const parts = cacheKey.split(",");
      if (parts.length !== 2) return;
      const q = Number(parts[0]);
      const r = Number(parts[1]);
      if (!Number.isFinite(q) || !Number.isFinite(r)) return;
      const k = hexKey(q, r);
      const isArena = state.proceduralArenaKeys.has(k) || state.proceduralArenaSpentKeys.has(k) || escapeLocalDevHost && state.testWestKind === "arena" && q === state.testWestQ && r === state.testWestR;
      if (!isArena) return;
      if (state.arenaPhase === 2 && state.arenaCardRewardAt > 0 && !state.pausedForCard) {
        openCardPickupModal(makeJokerArenaRewardCard());
        state.arenaCardRewardAt = 0;
      } else if (state.arenaPhase === 2 && state.arenaCardRewardAt > 0) {
        state.arenaCardRewardAt = 0;
      }
      if (state.arenaPhase === 1) cleanupArenaNexusSiegeCombat();
      state.arenaPhase = 0;
      state.arenaSiegeEndAt = 0;
      state.arenaNextLaserEnemyAt = 0;
      state.arenaNextSniperEnemyAt = 0;
      const hadActive = state.proceduralArenaKeys.has(k);
      state.proceduralArenaKeys.delete(k);
      state.proceduralArenaSpentKeys.delete(k);
      if (hadActive) notifyProceduralSpecialTileUnusedDespawned();
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
      const isDev = escapeLocalDevHost && state.testWestKind === "safehouse" && q === state.testWestQ && r === state.testWestR;
      if (state.proceduralSafehouseKeys.has(k)) {
        state.proceduralSafehouseKeys.delete(k);
        state.proceduralSafehouseSpentKeys.add(k);
        resetSafehouseEmbeddedProgress();
        state.safehouseSpentTileAnim = { key: k, startMs: performance.now() };
        notifyProceduralSpecialTileUsedForSpawnSchedule();
      } else if (isDev) {
        state.proceduralSafehouseSpentKeys.add(k);
        resetSafehouseEmbeddedProgress();
        state.safehouseSpentTileAnim = { key: k, startMs: performance.now() };
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
      const isSafe = state.proceduralSafehouseKeys.has(k) || state.proceduralSafehouseSpentKeys.has(k) || escapeLocalDevHost && state.testWestKind === "safehouse" && q === state.testWestQ && r === state.testWestR;
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
    function resetSurgeHexIfSurgeHexEvicted(cacheKey) {
      const parts = cacheKey.split(",");
      if (parts.length !== 2) return;
      const q = Number(parts[0]);
      const r = Number(parts[1]);
      if (!Number.isFinite(q) || !Number.isFinite(r)) return;
      const k = hexKey(q, r);
      const isSurge = state.proceduralSurgeKeys.has(k) || state.proceduralSurgeSpentKeys.has(k) || escapeLocalDevHost && state.testWestKind === "surge" && q === state.testWestQ && r === state.testWestR;
      if (!isSurge) return;
      if ((state.surgePhase === 1 || state.surgePhase === 2 || state.surgePhase === 3 || state.surgePhase === 4) && state.surgeLockQ === q && state.surgeLockR === r) {
        if ((state.surgePhase === 3 || state.surgePhase === 4) && state.surgeCardRewardAt > 0 && !state.pausedForCard) {
          openCardPickupModal(makeJokerArenaRewardCard());
          state.surgeCardRewardAt = 0;
        }
        state.surgePhase = 0;
        state.surgeAwait = "travel";
        state.surgeWave = 1;
        state.surgeScreenFlashUntil = 0;
        state.surgeHasPrevSafeBubble = false;
        state.surgeEligibleForInnerExitReward = false;
        state.surgeCardRewardAt = 0;
      }
      const hadActiveSurge = state.proceduralSurgeKeys.has(k);
      state.proceduralSurgeKeys.delete(k);
      state.proceduralSurgeSpentKeys.delete(k);
      if (hadActiveSurge) notifyProceduralSpecialTileUnusedDespawned();
    }
    function resetRouletteHexIfRouletteHexEvicted(cacheKey) {
      const parts = cacheKey.split(",");
      if (parts.length !== 2) return;
      const q = Number(parts[0]);
      const r = Number(parts[1]);
      if (!Number.isFinite(q) || !Number.isFinite(r)) return;
      const k = hexKey(q, r);
      const isRoulette = state.proceduralRouletteKeys.has(k) || state.proceduralRouletteSpentKeys.has(k) || escapeLocalDevHost && state.testWestKind === "roulette" && q === state.testWestQ && r === state.testWestR;
      if (!isRoulette) return;
      const hadActiveRoulette = state.proceduralRouletteKeys.has(k);
      if (state.rouletteLockQ === q && state.rouletteLockR === r) {
        if (state.pausedForRoulette) closeRouletteForgeUi();
        state.roulettePhase = 0;
        state.rouletteForgeComplete = false;
        state.rouletteInnerExitLatch = false;
        state.rouletteWasInHex = false;
        state.rouletteScreenFlashUntil = 0;
        state.rouletteLockQ = 0;
        state.rouletteLockR = 0;
      }
      state.proceduralRouletteKeys.delete(k);
      state.proceduralRouletteSpentKeys.delete(k);
      state.rouletteOuterDamageAppliedKeys.delete(k);
      if (hadActiveRoulette) notifyProceduralSpecialTileUnusedDespawned();
    }
    function purgeProceduralSpecialAnchorsOutsideWindow(neededKeys) {
      const purgeSet = (keys, resetFn) => {
        for (const k of Array.from(keys)) {
          if (!neededKeys.has(k)) resetFn(k);
        }
      };
      purgeSet(state.proceduralSafehouseKeys, resetSafehouseIfSafehouseHexEvicted);
      purgeSet(state.proceduralSafehouseSpentKeys, resetSafehouseIfSafehouseHexEvicted);
      purgeSet(state.proceduralArenaKeys, resetArenaNexusIfArenaHexEvicted);
      purgeSet(state.proceduralArenaSpentKeys, resetArenaNexusIfArenaHexEvicted);
      purgeSet(state.proceduralRouletteKeys, resetRouletteHexIfRouletteHexEvicted);
      purgeSet(state.proceduralRouletteSpentKeys, resetRouletteHexIfRouletteHexEvicted);
      purgeSet(state.proceduralSurgeKeys, resetSurgeHexIfSurgeHexEvicted);
      purgeSet(state.proceduralSurgeSpentKeys, resetSurgeHexIfSurgeHexEvicted);
    }
    function ensureTilesForPlayer() {
      const center = worldToHex(player.x, player.y);
      const centerKey = hexKey(center.q, center.r);
      activePlayerHex = center;
      if (lastPlayerHexKey === centerKey && obstacles.length) return;
      lastPlayerHexKey = centerKey;
      const needed = [{ q: center.q, r: center.r }, ...HEX_DIRS.map((d) => ({ q: center.q + d.q, r: center.r + d.r }))];
      activeHexes = needed;
      for (const h of needed) {
        const key = hexKey(h.q, h.r);
        if (!tileCache.has(key)) {
          tryProceduralRareSpecialHex(h.q, h.r);
          const c = hexToWorld(h.q, h.r);
          const emptyTerrain = isArenaNexusTile(h.q, h.r) || isRouletteHexTile(h.q, h.r) || isSurgeHexTile(h.q, h.r) || isSafehouseHexTile(h.q, h.r);
          tileCache.set(
            key,
            generateHexTileObstacles(h.q, h.r, {
              TILE_COLS,
              TILE_ROWS,
              TILE_W,
              BLOCK,
              centerX: c.x,
              centerY: c.y,
              hexSize: HEX_SIZE,
              emptyTerrain
            })
          );
        }
      }
      const neededKeys = new Set(needed.map((h) => hexKey(h.q, h.r)));
      for (const key of Array.from(tileCache.keys())) {
        if (!neededKeys.has(key)) {
          resetArenaNexusIfArenaHexEvicted(key);
          resetSurgeHexIfSurgeHexEvicted(key);
          resetSafehouseIfSafehouseHexEvicted(key);
          resetRouletteHexIfRouletteHexEvicted(key);
          tileCache.delete(key);
        }
      }
      purgeProceduralSpecialAnchorsOutsideWindow(neededKeys);
      obstacles = [];
      for (const h of needed) {
        obstacles = obstacles.concat(tileCache.get(hexKey(h.q, h.r)));
      }
    }
    function readTestSpecialWestSelection() {
      if (!escapeLocalDevHost) return "na";
      const raw = String(specialTestWestSelect?.value ?? "na").toLowerCase();
      if (raw === "arena" || raw === "roulette" || raw === "surge" || raw === "safehouse") return raw;
      return "na";
    }
    function syncSpecialTestWestPanelLock() {
      if (!escapeLocalDevHost) return;
      if (!specialTestWestSelect) return;
      specialTestWestSelect.disabled = !!gameStarted;
      const panel = document.getElementById("special-test-west-panel");
      if (panel) panel.classList.toggle("special-test-west-panel--locked", !!gameStarted);
    }
    function initSpecialHexTiles(spawnQ, spawnR) {
      const westQ = spawnQ + HEX_DIRS[3].q;
      const westR = spawnR + HEX_DIRS[3].r;
      state.testWestQ = westQ;
      state.testWestR = westR;
      const mode = readTestSpecialWestSelection();
      state.testWestKind = mode === "arena" ? "arena" : mode === "roulette" ? "roulette" : mode === "surge" ? "surge" : mode === "safehouse" ? "safehouse" : "none";
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
    function markProceduralArenaHexSpent(q, r) {
      const k = hexKey(q, r);
      if (!state.proceduralArenaKeys.has(k)) return;
      state.proceduralArenaKeys.delete(k);
      state.proceduralArenaSpentKeys.add(k);
      notifyProceduralSpecialTileUsedForSpawnSchedule();
    }
    function markProceduralRouletteHexSpent(q, r) {
      const k = hexKey(q, r);
      if (!state.proceduralRouletteKeys.has(k)) return;
      state.proceduralRouletteKeys.delete(k);
      state.proceduralRouletteSpentKeys.add(k);
      state.rouletteOuterDamageAppliedKeys.delete(k);
      notifyProceduralSpecialTileUsedForSpawnSchedule();
    }
    function markProceduralSurgeHexSpent(q, r) {
      const k = hexKey(q, r);
      if (!state.proceduralSurgeKeys.has(k)) return;
      state.proceduralSurgeKeys.delete(k);
      state.proceduralSurgeSpentKeys.add(k);
      notifyProceduralSpecialTileUsedForSpawnSchedule();
    }
    function firstProceduralArenaAxial() {
      const k = state.proceduralArenaKeys.values().next().value;
      if (!k) return null;
      const [q, r] = k.split(",").map(Number);
      return { q, r };
    }
    function arenaNexusWorldCenter() {
      if (state.arenaPhase === 1) {
        return hexToWorld(state.arenaSiegeQ, state.arenaSiegeR);
      }
      const firstArena = firstProceduralArenaAxial();
      if (firstArena) return hexToWorld(firstArena.q, firstArena.r);
      if (escapeLocalDevHost && state.testWestKind === "arena") return hexToWorld(state.testWestQ, state.testWestR);
      return hexToWorld(0, 0);
    }
    function collectArenaNexusAxials() {
      const out = [];
      const seen = /* @__PURE__ */ new Set();
      const add = (q, r) => {
        const k = hexKey(q, r);
        if (seen.has(k)) return;
        seen.add(k);
        out.push({ q, r });
      };
      for (const k of state.proceduralArenaKeys) {
        const [q, r] = k.split(",").map(Number);
        add(q, r);
      }
      for (const k of state.proceduralArenaSpentKeys) {
        const [q, r] = k.split(",").map(Number);
        add(q, r);
      }
      if (escapeLocalDevHost && state.testWestKind === "arena") add(state.testWestQ, state.testWestR);
      return out;
    }
    function collectRouletteHexAxials() {
      const out = [];
      const seen = /* @__PURE__ */ new Set();
      const add = (q, r) => {
        const k = hexKey(q, r);
        if (seen.has(k)) return;
        seen.add(k);
        out.push({ q, r });
      };
      for (const k of state.proceduralRouletteKeys) {
        const [q, r] = k.split(",").map(Number);
        add(q, r);
      }
      for (const k of state.proceduralRouletteSpentKeys) {
        const [q, r] = k.split(",").map(Number);
        add(q, r);
      }
      if (escapeLocalDevHost && state.testWestKind === "roulette") add(state.testWestQ, state.testWestR);
      return out;
    }
    function hasAnyRouletteHexSite() {
      return collectRouletteHexAxials().length > 0;
    }
    function isArenaNexusTile(q, r) {
      const k = hexKey(q, r);
      if (state.proceduralArenaKeys.has(k) || state.proceduralArenaSpentKeys.has(k)) return true;
      if (escapeLocalDevHost && state.testWestKind === "arena" && q === state.testWestQ && r === state.testWestR) return true;
      return false;
    }
    function isArenaNexusInteractive(q, r) {
      if (state.proceduralArenaKeys.has(hexKey(q, r))) return true;
      if (escapeLocalDevHost && state.testWestKind === "arena" && q === state.testWestQ && r === state.testWestR) return true;
      return false;
    }
    function isRouletteHexTile(q, r) {
      const k = hexKey(q, r);
      if (state.proceduralRouletteKeys.has(k) || state.proceduralRouletteSpentKeys.has(k)) return true;
      if (escapeLocalDevHost && state.testWestKind === "roulette" && q === state.testWestQ && r === state.testWestR) return true;
      return false;
    }
    function isRouletteHexInteractive(q, r) {
      if (state.proceduralRouletteKeys.has(hexKey(q, r))) return true;
      if (escapeLocalDevHost && state.testWestKind === "roulette" && q === state.testWestQ && r === state.testWestR) return true;
      return false;
    }
    function collectSurgeHexAxials() {
      const out = [];
      const seen = /* @__PURE__ */ new Set();
      const add = (q, r) => {
        const k = hexKey(q, r);
        if (seen.has(k)) return;
        seen.add(k);
        out.push({ q, r });
      };
      for (const k of state.proceduralSurgeKeys) {
        const [q, r] = k.split(",").map(Number);
        add(q, r);
      }
      for (const k of state.proceduralSurgeSpentKeys) {
        const [q, r] = k.split(",").map(Number);
        add(q, r);
      }
      if (escapeLocalDevHost && state.testWestKind === "surge") add(state.testWestQ, state.testWestR);
      return out;
    }
    function isSurgeHexTile(q, r) {
      const k = hexKey(q, r);
      if (state.proceduralSurgeKeys.has(k) || state.proceduralSurgeSpentKeys.has(k)) return true;
      if (escapeLocalDevHost && state.testWestKind === "surge" && q === state.testWestQ && r === state.testWestR) return true;
      return false;
    }
    function isSurgeHexInteractive(q, r) {
      if (state.proceduralSurgeKeys.has(hexKey(q, r))) return true;
      if (escapeLocalDevHost && state.testWestKind === "surge" && q === state.testWestQ && r === state.testWestR) return true;
      return false;
    }
    function collectSafehouseHexAxials() {
      const out = [];
      const seen = /* @__PURE__ */ new Set();
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
          h.x = cx + dx / d * minDist;
          h.y = cy + dy / d * minDist;
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
      return { x: c.x + (w.x - c.x) / len * t, y: c.y + (w.y - c.y) / len * t };
    }
    function getSafehouseEmbeddedForgeWorld(prim) {
      const c = hexToWorld(prim.q, prim.r);
      const e = hexToWorld(prim.q + HEX_DIRS[0].q, prim.r + HEX_DIRS[0].r);
      const t = HEX_SIZE * SAFEHOUSE_EMBED_CENTER_INSET;
      const len = Math.hypot(e.x - c.x, e.y - c.y) || 1;
      return { x: c.x + (e.x - c.x) / len * t, y: c.y + (e.y - c.y) / len * t };
    }
    function safehouseEmbeddedMiniVertexRadius() {
      return HEX_SIZE * SAFEHOUSE_EMBED_HEX_VERTEX_R_MULT;
    }
    function safehouseEmbedSiteHitR() {
      return Math.max(SAFEHOUSE_EMBED_SITE_HIT_R, safehouseEmbeddedMiniVertexRadius() * (SQRT3 / 2) * 1.08);
    }
    function drawSafehouseHexWorld(ctx2) {
      const cells = collectSafehouseHexAxials();
      if (!cells.length) return;
      const activePrim = getPrimarySafehouseAxial();
      const prim = !isLunatic() && state.safehouseInnerFacilitiesUnlocked && activePrim && isSafehouseHexActiveTile(activePrim.q, activePrim.r) ? activePrim : null;
      for (const { q, r } of cells) {
        const c = hexToWorld(q, r);
        drawSafehouseHexCell(ctx2, c.x, c.y, HEX_SIZE, state.elapsed);
        const kk = hexKey(q, r);
        if (state.proceduralSafehouseSpentKeys.has(kk)) {
          const fx = state.safehouseSpentTileAnim;
          let u = 1;
          if (fx && fx.key === kk) {
            const raw = (performance.now() - fx.startMs) / SAFEHOUSE_SPENT_TILE_ANIM_MS;
            u = clamp(raw, 0, 1);
            u = u * u * (3 - 2 * u);
          }
          const overlayA = 0.72 * u;
          const rimA = 0.62 * Math.max(0, u - 0.12) * Math.min(1, (u - 0.12) / 0.55);
          ctx2.save();
          ctx2.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = -Math.PI / 2 + Math.PI / 3 * i;
            const x = c.x + Math.cos(a) * HEX_SIZE;
            const y = c.y + Math.sin(a) * HEX_SIZE;
            if (i === 0) ctx2.moveTo(x, y);
            else ctx2.lineTo(x, y);
          }
          ctx2.closePath();
          if (fx && fx.key === kk && u < 0.28) {
            const w = Math.sin(u / 0.28 * Math.PI);
            ctx2.fillStyle = `rgba(254, 243, 199, ${0.1 * w})`;
            ctx2.fill();
          }
          ctx2.fillStyle = `rgba(15, 23, 42, ${overlayA})`;
          ctx2.fill();
          if (rimA > 0.02) {
            ctx2.strokeStyle = `rgba(51, 65, 85, ${rimA})`;
            ctx2.lineWidth = 2.4 + 1.8 * Math.min(1, (u - 0.2) / 0.65);
            ctx2.stroke();
          }
          ctx2.restore();
        }
        if (prim && prim.q === q && prim.r === r) {
          const rw = getSafehouseEmbeddedRouletteWorld(prim);
          const fw = getSafehouseEmbeddedForgeWorld(prim);
          const vr = safehouseEmbeddedMiniVertexRadius();
          drawSafehouseEmbeddedFacilities(ctx2, {
            rouletteX: rw.x,
            rouletteY: rw.y,
            forgeX: fw.x,
            forgeY: fw.y,
            vertexRadius: vr,
            elapsed: state.elapsed,
            embeddedRouletteComplete: state.safehouseEmbeddedRouletteComplete,
            embeddedForgeComplete: state.safehouseEmbeddedForgeComplete
          });
        }
      }
    }
    function tickSafehouseEmbedRevealFromWallClock() {
      if (isLunatic()) {
        state.safehouseEmbedRevealAtMs = 0;
        return;
      }
      if (state.safehouseEmbedRevealAtMs > 0 && performance.now() >= state.safehouseEmbedRevealAtMs) {
        state.safehouseInnerFacilitiesUnlocked = true;
        state.safehouseEmbedRevealAtMs = 0;
      }
    }
    function tickSafehouseSpentTileAnimDone() {
      const fx = state.safehouseSpentTileAnim;
      if (!fx) return;
      if (performance.now() - fx.startMs >= SAFEHOUSE_SPENT_TILE_ANIM_MS) {
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
        player.x = cc.x + dx / d * minR;
        player.y = cc.y + dy / d * minR;
      }
    }
    function runClockEffectiveSec() {
      return Math.max(0, state.elapsed - state.safehouseClockFreeze);
    }
    function relDifficultySurvivalSec() {
      return Math.max(0, runClockEffectiveSec() - state.spawnDifficultyAnchorSurvival);
    }
    function accumulateSafehouseClockFreeze(dt) {
      if (!state.running || dt <= 0) return;
      const ph = worldToHex(player.x, player.y);
      if (isSafehouseHexTile(ph.q, ph.r)) state.safehouseClockFreeze += dt;
    }
    function displayWorldLevel() {
      return state.runLevel + 1;
    }
    function runLevelEnemySpeedMult() {
      if (state.runLevel <= 0) return 1;
      return Math.pow(1.15, state.runLevel);
    }
    function runLevelEnemyAccelMult() {
      if (state.runLevel <= 0) return 1;
      return Math.pow(1.1, state.runLevel);
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
    function barrierDiskBlocksWorldPoint(x, y) {
      return isWorldPointOnSafehouseBarrierDisk(x, y);
    }
    function surgeTravelDurationForWave(wave) {
      return Math.max(
        0.05,
        SURGE_TRAVEL_DUR_FIRST - SURGE_TRAVEL_DUR_DECREMENT_PER_WAVE * (wave - 1)
      );
    }
    function surgeLockTileMaxCenterDistPx() {
      return Math.max(6, ARENA_NEXUS_INNER_APOTHEM - player.r - 0.75);
    }
    function surgeOuterWaitingMaxCenterDistPx() {
      return Math.max(6, HEX_SIZE * (SQRT3 / 2) - player.r - 1.5);
    }
    function pickSurgeSafeAndPulseFrom(q, r) {
      const tc = hexToWorld(q, r);
      const apo = HEX_SIZE * (SQRT3 / 2) * 0.72;
      const maxSafeCenterDist = Math.max(10, surgeLockTileMaxCenterDistPx() - SURGE_SAFE_HIT_R - 8);
      const distCap = Math.min(apo * 0.69, maxSafeCenterDist);
      const minSep = SURGE_SAFE_MIN_CENTER_SEP_PX;
      const inPlayDisc = (sx2, sy2) => Math.hypot(sx2 - tc.x, sy2 - tc.y) <= maxSafeCenterDist + 1e-3;
      const farEnoughFromPrev = (sx2, sy2) => {
        if (!state.surgeHasPrevSafeBubble) return true;
        return Math.hypot(sx2 - state.surgePrevSafeX, sy2 - state.surgePrevSafeY) >= minSep - 1e-3;
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
      if (!found && state.surgeHasPrevSafeBubble) {
        const px = state.surgePrevSafeX;
        const py = state.surgePrevSafeY;
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
      if (!found && state.surgeHasPrevSafeBubble) {
        const vx = tc.x - state.surgePrevSafeX;
        const vy = tc.y - state.surgePrevSafeY;
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
      if (!found && state.surgeHasPrevSafeBubble) {
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
      state.surgeSafeX = sx;
      state.surgeSafeY = sy;
      state.surgePrevSafeX = sx;
      state.surgePrevSafeY = sy;
      state.surgeHasPrevSafeBubble = true;
    }
    function beginSurgeTravelWave() {
      pickSurgeSafeAndPulseFrom(state.surgeLockQ, state.surgeLockR);
      state.surgeTravelDur = surgeTravelDurationForWave(state.surgeWave);
      state.surgeTravelStartAt = state.elapsed;
      state.surgeAwait = "travel";
    }
    function surgeHitNow() {
      state.surgeScreenFlashUntil = state.elapsed + SURGE_TILE_FLASH_SEC;
      triggerUltScreenShake(12, 0.18);
      const inSafe = Math.hypot(player.x - state.surgeSafeX, player.y - state.surgeSafeY) <= SURGE_SAFE_HIT_R;
      if (!inSafe) damagePlayer(SURGE_TILE_DAMAGE, { surgeHexPulse: true });
    }
    function killHuntersOnSurgeHex(q, r) {
      for (let i = entities.hunters.length - 1; i >= 0; i--) {
        const h = entities.hunters[i];
        const hq = worldToHex(h.x, h.y);
        if (hq.q !== q || hq.r !== r) continue;
        if (h.type === "spawner" || h.type === "airSpawner") {
          ejectSpawnerHunterFromSpecialHexFootprint(h);
          continue;
        }
        entities.hunters.splice(i, 1);
      }
    }
    function beginSurgeOuterLock(q, r) {
      state.surgePhase = 1;
      state.surgeLockQ = q;
      state.surgeLockR = r;
      state.surgeWave = 1;
      state.surgeHasPrevSafeBubble = false;
      state.surgeEligibleForInnerExitReward = false;
      state.surgeCardRewardAt = 0;
      killHuntersOnSurgeHex(q, r);
      state.surgeAwait = "idle";
      state.surgeScreenFlashUntil = 0;
      clampPlayerToSurgeLockHex();
    }
    function beginSurgeGauntletActive() {
      state.surgePhase = 2;
      state.surgeWave = 1;
      state.surgeHasPrevSafeBubble = false;
      state.surgeEligibleForInnerExitReward = false;
      state.surgeCardRewardAt = 0;
      clampPlayerToSurgeLockHex();
      beginSurgeTravelWave();
    }
    function ejectHuntersFromSurgeLockHex() {
      if (state.surgePhase !== 1 && state.surgePhase !== 2 && state.surgePhase !== 3) return;
      const edgeR = HEX_SIZE + 14;
      const { x: cx, y: cy } = hexToWorld(state.surgeLockQ, state.surgeLockR);
      for (const h of entities.hunters) {
        if (h.arenaNexusSpawn) continue;
        const hq = worldToHex(h.x, h.y);
        if (hq.q !== state.surgeLockQ || hq.r !== state.surgeLockR) continue;
        const dx = h.x - cx;
        const dy = h.y - cy;
        const len = Math.hypot(dx, dy) || 1;
        h.x = cx + dx / len * (edgeR + h.r);
        h.y = cy + dy / len * (edgeR + h.r);
      }
    }
    function clampPlayerToSurgeLockHex() {
      if (state.surgePhase !== 1 && state.surgePhase !== 2 && state.surgePhase !== 3) return;
      const ph = worldToHex(player.x, player.y);
      if (ph.q !== state.surgeLockQ || ph.r !== state.surgeLockR) return;
      const c = hexToWorld(ph.q, ph.r);
      const maxD = state.surgePhase === 1 || state.surgePhase === 3 ? surgeOuterWaitingMaxCenterDistPx() : surgeLockTileMaxCenterDistPx();
      const dx = player.x - c.x;
      const dy = player.y - c.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d <= maxD) return;
      player.x = c.x + dx / d * maxD;
      player.y = c.y + dy / d * maxD;
    }
    function isWorldPointOnSurgeLockBarrierTile(px, py) {
      if (state.surgePhase !== 1 && state.surgePhase !== 2 && state.surgePhase !== 3) return false;
      const h = worldToHex(px, py);
      if (h.q !== state.surgeLockQ || h.r !== state.surgeLockR) return false;
      const c = hexToWorld(h.q, h.r);
      return Math.hypot(px - c.x, py - c.y) <= HEX_SIZE + 4;
    }
    function updateSurgeHex(_dt) {
      if (!state.running || state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge) return;
      if (!state.pausedForCard && state.surgePhase === 3 && state.surgeCardRewardAt > 0 && state.elapsed >= state.surgeCardRewardAt) {
        state.surgeCardRewardAt = 0;
        openCardPickupModal(makeJokerArenaRewardCard());
        state.surgePhase = 4;
      }
      if (state.pausedForCard) return;
      const ph = worldToHex(player.x, player.y);
      const inSurge = isSurgeHexTile(ph.q, ph.r);
      if (!inSurge) {
        state.surgeWasInSurgeHex = false;
        if (state.surgePhase === 4) {
          state.surgePhase = 0;
        } else if (state.surgePhase === 3) {
          if (state.surgeCardRewardAt > 0 && !state.pausedForCard) {
            openCardPickupModal(makeJokerArenaRewardCard());
            state.surgeCardRewardAt = 0;
          }
          state.surgePhase = 0;
          state.surgeAwait = "travel";
          state.surgeWave = 1;
          state.surgeScreenFlashUntil = 0;
          state.surgeHasPrevSafeBubble = false;
          state.surgeEligibleForInnerExitReward = false;
        } else if (state.surgePhase === 1 || state.surgePhase === 2) {
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
      if (enteredThisFrame && state.surgePhase === 0 && isSurgeHexInteractive(ph.q, ph.r)) {
        beginSurgeOuterLock(ph.q, ph.r);
      }
      if (state.surgePhase === 1 && ph.q === state.surgeLockQ && ph.r === state.surgeLockR) {
        const c = hexToWorld(state.surgeLockQ, state.surgeLockR);
        if (Math.hypot(player.x - c.x, player.y - c.y) <= ARENA_NEXUS_INNER_ENTER_R) {
          beginSurgeGauntletActive();
        }
      }
      if (state.surgePhase === 3 && ph.q === state.surgeLockQ && ph.r === state.surgeLockR) {
        const c = hexToWorld(state.surgeLockQ, state.surgeLockR);
        const d = Math.hypot(player.x - c.x, player.y - c.y);
        if (state.surgeEligibleForInnerExitReward && d > ARENA_NEXUS_INNER_ENTER_R && state.surgeCardRewardAt <= 0) {
          state.surgeEligibleForInnerExitReward = false;
          state.surgeCardRewardAt = state.elapsed + ARENA_NEXUS_REWARD_MODAL_DELAY_SEC;
        }
      }
      if (state.surgePhase !== 2) return;
      if (ph.q !== state.surgeLockQ || ph.r !== state.surgeLockR) return;
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
        } else {
          beginSurgeTravelWave();
        }
      }
    }
    function drawSurgeHexWorld(ctx2) {
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
        strokePointyHexOutline(ctx2, cx, cy, HEX_SIZE, outer, 3.2, 18);
        strokePointyHexOutline(ctx2, cx, cy, innerVertexR, inner, 2.4, 14);
        if (isActiveGauntlet) {
          ctx2.save();
          ctx2.fillStyle = "rgba(248, 250, 252, 0.92)";
          ctx2.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = -Math.PI / 2 + Math.PI / 3 * i;
            const x = state.surgeSafeX + Math.cos(a) * SURGE_SAFE_HEX_DRAW_R;
            const y = state.surgeSafeY + Math.sin(a) * SURGE_SAFE_HEX_DRAW_R;
            if (i === 0) ctx2.moveTo(x, y);
            else ctx2.lineTo(x, y);
          }
          ctx2.closePath();
          ctx2.fill();
          ctx2.strokeStyle = "rgba(255,255,255,0.55)";
          ctx2.lineWidth = 1.2;
          ctx2.stroke();
          ctx2.restore();
          const u = clamp((state.elapsed - state.surgeTravelStartAt) / Math.max(1e-4, state.surgeTravelDur), 0, 1);
          const pulseCx = cx + (state.surgeSafeX - cx) * u;
          const pulseCy = cy + (state.surgeSafeY - cy) * u;
          const pulseR = innerVertexR + (SURGE_SAFE_HEX_DRAW_R - innerVertexR) * u;
          const pulseStroke = 2.4 + (3.2 - 2.4) * (1 - u);
          strokePointyHexOutline(ctx2, pulseCx, pulseCy, pulseR, "rgba(248, 113, 113, 0.95)", pulseStroke, 18);
        }
      }
    }
    function tryProceduralRareSpecialHex(q, r) {
      const w = getProceduralSpecialSpawnWeight();
      if (w <= 0) return;
      const k = hexKey(q, r);
      if (state.proceduralArenaKeys.has(k) || state.proceduralRouletteKeys.has(k) || state.proceduralSurgeKeys.has(k) || state.proceduralSafehouseKeys.has(k) || state.proceduralSafehouseSpentKeys.has(k) || escapeLocalDevHost && state.testWestQ === q && state.testWestR === r) {
        return;
      }
      const activeProceduralSpecials = state.proceduralArenaKeys.size + state.proceduralRouletteKeys.size + state.proceduralSurgeKeys.size + state.proceduralSafehouseKeys.size;
      if (activeProceduralSpecials >= 1) return;
      if (Math.random() >= w) return;
      state.proceduralArenaSpentKeys.delete(k);
      state.proceduralRouletteSpentKeys.delete(k);
      state.proceduralSurgeSpentKeys.delete(k);
      state.proceduralSafehouseSpentKeys.delete(k);
      const kindRoll = Math.random();
      const kind = isLunatic() ? "safehouse" : kindRoll < 0.25 ? "arena" : kindRoll < 0.5 ? "roulette" : kindRoll < 0.75 ? "surge" : "safehouse";
      if (kind === "arena") state.proceduralArenaKeys.add(k);
      else if (kind === "roulette") state.proceduralRouletteKeys.add(k);
      else if (kind === "surge") state.proceduralSurgeKeys.add(k);
      else {
        state.proceduralSafehouseKeys.add(k);
        state.safehouseLevelPromptShownKeys.delete(k);
        resetSafehouseEmbeddedProgress();
      }
      runLog.event(EVT_PROCEDURAL_SPECIAL_HEX, "Procedural special tile placed", { q, r, kind, spawnWeight: w });
    }
    function isWorldPointOnRouletteHexTile(x, y) {
      const h = worldToHex(x, y);
      if (!isRouletteHexTile(h.q, h.r)) return false;
      const c = hexToWorld(h.q, h.r);
      return Math.hypot(x - c.x, y - c.y) <= HEX_SIZE + 4;
    }
    function isWorldPointOnSpecialLootForbiddenHex(x, y) {
      const h = worldToHex(x, y);
      return isArenaNexusTile(h.q, h.r) || isRouletteHexTile(h.q, h.r) || isSurgeHexTile(h.q, h.r) || isSafehouseHexTile(h.q, h.r);
    }
    function isWorldPointOnSpecialSpawnerForbiddenHex(x, y) {
      if (isWorldPointOnSafehouseBarrierDisk(x, y)) return true;
      if (isWorldPointOnRouletteHexTile(x, y)) return true;
      const h = worldToHex(x, y);
      if (!isArenaNexusTile(h.q, h.r) && !isSurgeHexTile(h.q, h.r)) return false;
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
      let d = Math.hypot(dx, dy);
      if (d < 1e-3) {
        const ang = Math.random() * TAU;
        h.x = c.x + Math.cos(ang) * targetR;
        h.y = c.y + Math.sin(ang) * targetR;
        return;
      }
      h.x = c.x + dx / d * targetR;
      h.y = c.y + dy / d * targetR;
    }
    function cleanupArenaNexusSiegeCombat() {
      entities.laserBeams = entities.laserBeams.filter((b) => !b.arenaHazard);
      entities.dangerZones = entities.dangerZones.filter((z) => !z.arenaHazard);
      entities.hunters = entities.hunters.filter((h) => !h.arenaNexusSpawn);
    }
    function randomPointOnArenaNexusRing() {
      const { x: cx, y: cy } = arenaNexusWorldCenter();
      const ang = Math.random() * TAU;
      const t = 0.15 + Math.random() * 0.85;
      const ringR = ARENA_NEXUS_RING_LO + t * (ARENA_NEXUS_RING_HI - ARENA_NEXUS_RING_LO);
      return { x: cx + Math.cos(ang) * ringR, y: cy + Math.sin(ang) * ringR };
    }
    function spawnArenaNexusRingLaserHunter() {
      const late = state.elapsed >= LATE_GAME_ELITE_SPAWN_SEC;
      const type = late && Math.random() < 0.38 ? "laserBlue" : "laser";
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
        h.x = cx + dx / len * (edgeR + h.r);
        h.y = cy + dy / len * (edgeR + h.r);
      }
    }
    function clampArenaNexusDefendersToRing() {
      if (state.arenaPhase !== 1) return;
      const c = arenaNexusWorldCenter();
      for (const h of entities.hunters) {
        if (!h.arenaNexusSpawn) continue;
        const dx = h.x - c.x;
        const dy = h.y - c.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < ARENA_NEXUS_RING_LO) {
          h.x = c.x + dx / d * ARENA_NEXUS_RING_LO;
          h.y = c.y + dy / d * ARENA_NEXUS_RING_LO;
        } else if (d > ARENA_NEXUS_RING_HI) {
          h.x = c.x + dx / d * ARENA_NEXUS_RING_HI;
          h.y = c.y + dy / d * ARENA_NEXUS_RING_HI;
        }
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
      player.x = cx + dx / d * maxD;
      player.y = cy + dy / d * maxD;
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
    function updateArenaNexus(_dt) {
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
      const dist = Math.hypot(player.x - c.x, player.y - c.y);
      if (dist <= ARENA_NEXUS_INNER_ENTER_R) beginArenaNexusSiege();
    }
    function drawArenaNexusWorld(ctx2) {
      const cells = collectArenaNexusAxials();
      if (!cells.length) return;
      let outerColor = "rgba(59, 130, 246, 0.92)";
      let innerColor = "rgba(96, 165, 250, 0.88)";
      if (state.arenaPhase === 1) {
        outerColor = "rgba(239, 68, 68, 0.95)";
        innerColor = "rgba(248, 113, 113, 0.9)";
      } else if (state.arenaPhase === 2) {
        outerColor = "rgba(34, 197, 94, 0.92)";
        innerColor = "rgba(74, 222, 128, 0.88)";
      }
      for (const { q, r } of cells) {
        const c = hexToWorld(q, r);
        const cx = c.x;
        const cy = c.y;
        let cellOuter = outerColor;
        let cellInner = innerColor;
        if (state.proceduralArenaSpentKeys.has(hexKey(q, r))) {
          cellOuter = "rgba(34, 197, 94, 0.92)";
          cellInner = "rgba(74, 222, 128, 0.88)";
        }
        strokePointyHexOutline(ctx2, cx, cy, HEX_SIZE, cellOuter, 3.2, 18);
        strokePointyHexOutline(ctx2, cx, cy, HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE, cellInner, 2.4, 14);
        if (state.arenaPhase === 1 && q === state.arenaSiegeQ && r === state.arenaSiegeR) {
          const rem = Math.max(0, state.arenaSiegeEndAt - state.elapsed);
          const u = rem / ARENA_NEXUS_SIEGE_SEC;
          const arcR = HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE * 0.78;
          ctx2.save();
          ctx2.strokeStyle = "rgba(248, 250, 252, 0.95)";
          ctx2.lineWidth = 4;
          ctx2.lineCap = "round";
          ctx2.beginPath();
          ctx2.arc(cx, cy, arcR, -Math.PI / 2, -Math.PI / 2 + TAU * u);
          ctx2.stroke();
          ctx2.fillStyle = "rgba(248, 250, 252, 0.85)";
          ctx2.font = "600 13px system-ui, sans-serif";
          ctx2.textAlign = "center";
          ctx2.textBaseline = "middle";
          ctx2.fillText(rem <= 0 ? "0" : rem.toFixed(1) + "s", cx, cy);
          ctx2.restore();
        }
      }
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
        h.x = cx + dx / len * (edgeR + h.r);
        h.y = cy + dy / len * (edgeR + h.r);
      }
    }
    function ejectHuntersFromLockedSpecialHexes() {
      ejectHuntersFromArenaNexusDuringSiege();
      ejectHuntersFromRouletteHexLock();
      ejectHuntersFromSurgeLockHex();
    }
    function triggerRouletteHexOuterCrossing() {
      state.roulettePhase = 1;
      state.rouletteScreenFlashUntil = state.elapsed + 0.4;
      triggerUltScreenShake(14, 0.22);
      damagePlayer(2, { rouletteHexOuterPenalty: true });
      ejectHuntersFromRouletteHexLock();
      state.rouletteOuterDamageAppliedKeys.add(hexKey(state.rouletteLockQ, state.rouletteLockR));
    }
    function drawRouletteHexWorld(ctx2) {
      const cells = collectRouletteHexAxials();
      if (!cells.length) return;
      for (const { q, r } of cells) {
        const c = hexToWorld(q, r);
        const cx = c.x;
        const cy = c.y;
        const k = hexKey(q, r);
        let cellOuter = "rgba(59, 130, 246, 0.92)";
        if (state.proceduralRouletteSpentKeys.has(k)) {
          cellOuter = "rgba(34, 197, 94, 0.92)";
        } else if (isRouletteHexInteractive(q, r)) {
          cellOuter = state.rouletteOuterDamageAppliedKeys.has(k) ? "rgba(59, 130, 246, 0.92)" : "rgba(249, 115, 22, 0.92)";
        }
        strokePointyHexOutline(ctx2, cx, cy, HEX_SIZE, cellOuter, 3.2, 18);
        fillPointyHexRainbowGlow(ctx2, cx, cy, ROULETTE_INNER_HEX_DRAW_R, state.elapsed);
      }
    }
    function getReservedDeckKeysExcludingCard(exCard) {
      const reserved = getReservedDeckKeys();
      if (exCard && exCard.suit && exCard.suit !== "joker" && Number.isInteger(exCard.rank)) {
        reserved.delete(deckKey(exCard.suit, exCard.rank));
      }
      return reserved;
    }
    function makeRouletteCandidateCard(suit, rank) {
      return {
        id: `roulette-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        suit,
        rank,
        effect: makeCardEffect(suit, rank)
      };
    }
    function buildRoulettePairFromSource(sourceCard) {
      if (!sourceCard || sourceCard.suit === "joker" || !Number.isInteger(sourceCard.rank)) return null;
      const rank = sourceCard.rank;
      const reserved = getReservedDeckKeysExcludingCard(sourceCard);
      const suits = ["diamonds", "hearts", "clubs", "spades"].filter((s) => s !== sourceCard.suit);
      const avail = suits.filter((s) => !reserved.has(deckKey(s, rank)));
      for (let i = avail.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [avail[i], avail[j]] = [avail[j], avail[i]];
      }
      if (avail.length < 2) return null;
      return { a: makeRouletteCandidateCard(avail[0], rank), b: makeRouletteCandidateCard(avail[1], rank) };
    }
    function unpinPlayerDeckPanelForRouletteModal() {
      const el = document.getElementById("player-deck-panel");
      if (!el || el.dataset.rouletteDeckPinned !== "1") return;
      delete el.dataset.rouletteDeckPinned;
      el.style.position = "";
      el.style.top = "";
      el.style.left = "";
      el.style.width = "";
      el.style.zIndex = "";
      el.style.boxSizing = "";
    }
    function pinPlayerDeckPanelForRouletteModal() {
      const el = document.getElementById("player-deck-panel");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.dataset.rouletteDeckPinned = "1";
      el.style.boxSizing = "border-box";
      el.style.position = "fixed";
      el.style.top = `${Math.max(0, r.top)}px`;
      el.style.left = `${r.left}px`;
      el.style.width = `${r.width}px`;
      el.style.zIndex = "55";
    }
    function closeRouletteForgeUi() {
      runLog.event(EVT_ROULETTE_MODAL_CLOSE, "Roulette forge modal closed");
      if (rouletteModal) rouletteModal.hidden = true;
      unpinPlayerDeckPanelForRouletteModal();
      state.pausedForRoulette = false;
      state.inventoryModalOpen = false;
      state.rouletteStep = null;
      state.rouletteSourceRef = null;
      state.rouletteSourceCardSnapshot = null;
      state.rouletteOptionA = null;
      state.rouletteOptionB = null;
      state.rouletteSpinShuffleUntil = 0;
      state.rouletteSpinRevealAt = 0;
      if (rouletteModalSpinRow) rouletteModalSpinRow.innerHTML = "";
      if (rouletteModalActions) rouletteModalActions.innerHTML = "";
      state.keys.clear();
    }
    function finishRouletteForgeSuccess(chosen) {
      const ref = state.rouletteSourceRef;
      if (!ref || !chosen) {
        closeRouletteForgeUi();
        return;
      }
      const placed = { ...chosen, id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}` };
      if (ref.kind === "deck") inventory.deckByRank[ref.rank] = placed;
      else if (ref.kind === "bp") inventory.backpackSlots[ref.idx] = placed;
      state.rouletteForgeComplete = true;
      state.roulettePhase = 2;
      runLog.event(EVT_ROULETTE_FORGE_SUCCESS, "Roulette forge completed; card kept", {
        ref,
        chosenSuit: chosen?.suit,
        chosenRank: chosen?.rank
      });
      const lk = hexKey(state.rouletteLockQ, state.rouletteLockR);
      if (state.proceduralRouletteKeys.has(lk)) {
        markProceduralRouletteHexSpent(state.rouletteLockQ, state.rouletteLockR);
      } else {
        state.safehouseEmbeddedRouletteComplete = true;
      }
      closeRouletteForgeUi();
      recalcCardPassives();
    }
    function setRouletteSpinCardFace(cardEl, card) {
      if (!cardEl) return;
      let name = cardEl.querySelector(".roulette-spin-name");
      let meta = cardEl.querySelector(".roulette-spin-meta");
      if (!name) {
        name = document.createElement("span");
        name.className = "roulette-spin-name";
        cardEl.appendChild(name);
      }
      if (!meta) {
        meta = document.createElement("span");
        meta.className = "roulette-spin-meta";
        cardEl.appendChild(meta);
      }
      name.textContent = formatCardName(card);
      meta.textContent = describeCardEffect(card);
    }
    function createRouletteSpinDom() {
      if (!rouletteModalSpinRow || !state.rouletteOptionA || !state.rouletteOptionB) return;
      rouletteModalSpinRow.innerHTML = `
    <div class="roulette-spin-pair roulette-spin-pair--shuffling" id="roulette-spin-pair-root">
      <div class="roulette-spin-card roulette-spin-card--shuffling" id="roulette-spin-left"></div>
      <div class="roulette-spin-card roulette-spin-card--shuffling" id="roulette-spin-right"></div>
    </div>`;
      const left = document.getElementById("roulette-spin-left");
      const right = document.getElementById("roulette-spin-right");
      if (left) setRouletteSpinCardFace(left, state.rouletteOptionA);
      if (right) setRouletteSpinCardFace(right, state.rouletteOptionB);
    }
    function syncRouletteSpinShuffleVisual() {
      if (!rouletteModalSpinRow || !state.rouletteOptionA || !state.rouletteOptionB) return;
      const pair = document.getElementById("roulette-spin-pair-root");
      const left = document.getElementById("roulette-spin-left");
      const right = document.getElementById("roulette-spin-right");
      if (!pair || !left || !right) return;
      const t = state.elapsed;
      const a = state.rouletteOptionA;
      const b = state.rouletteOptionB;
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
      const pair = document.getElementById("roulette-spin-pair-root");
      const left = document.getElementById("roulette-spin-left");
      const right = document.getElementById("roulette-spin-right");
      if (pair) {
        pair.classList.remove("roulette-spin-pair--shuffling");
        pair.classList.add("roulette-spin-pair--whiteout");
      }
      if (left) left.className = "roulette-spin-card roulette-spin-card--whiteout-panel";
      if (right) right.className = "roulette-spin-card roulette-spin-card--whiteout-panel";
    }
    function renderRouletteSpinSettled() {
      const pair = document.getElementById("roulette-spin-pair-root");
      const left = document.getElementById("roulette-spin-left");
      const right = document.getElementById("roulette-spin-right");
      if (!pair || !left || !right || !state.rouletteOptionA || !state.rouletteOptionB) return;
      const a = state.rouletteOptionA;
      const b = state.rouletteOptionB;
      pair.classList.remove("roulette-spin-pair--shuffling", "roulette-spin-pair--whiteout");
      setRouletteSpinCardFace(left, a);
      setRouletteSpinCardFace(right, b);
      left.className = "roulette-spin-card roulette-spin-card--revealed roulette-spin-card--pickable";
      right.className = "roulette-spin-card roulette-spin-card--revealed roulette-spin-card--pickable";
    }
    function wireRouletteCardPickListeners() {
      const left = document.getElementById("roulette-spin-left");
      const right = document.getElementById("roulette-spin-right");
      if (!left || !right || !state.rouletteOptionA || !state.rouletteOptionB) return;
      left.tabIndex = 0;
      right.tabIndex = 0;
      left.onclick = () => finishRouletteForgeSuccess(state.rouletteOptionA);
      right.onclick = () => finishRouletteForgeSuccess(state.rouletteOptionB);
      const onKey = (ev, pickA) => {
        if (ev.key !== "Enter" && ev.key !== " ") return;
        ev.preventDefault();
        finishRouletteForgeSuccess(pickA ? state.rouletteOptionA : state.rouletteOptionB);
      };
      left.onkeydown = (ev) => onKey(ev, true);
      right.onkeydown = (ev) => onKey(ev, false);
    }
    function renderRoulettePickWinnerButtons() {
      if (!rouletteModalActions || !state.rouletteOptionA || !state.rouletteOptionB) return;
      rouletteModalActions.innerHTML = "";
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "leave-button";
      cancel.textContent = "Cancel";
      cancel.addEventListener("click", () => closeRouletteForgeUi());
      rouletteModalActions.appendChild(cancel);
    }
    function startRouletteSpinFromSourceCard(sourceCard, ref) {
      const pair = buildRoulettePairFromSource(sourceCard);
      if (!pair) {
        runLog.warn(E_ROULETTE_NO_FORGE_PAIR, "Could not build roulette forge pair for selected card.", {
          suit: sourceCard?.suit,
          rank: sourceCard?.rank,
          ref
        });
        if (rouletteModalSub) {
          rouletteModalSub.textContent = "That card has no two free suits at this rank (other ranks may still work). Pick another or cancel.";
        }
        return;
      }
      state.rouletteSourceRef = ref;
      state.rouletteSourceCardSnapshot = sourceCard;
      state.rouletteOptionA = pair.a;
      state.rouletteOptionB = pair.b;
      state.rouletteStep = "spin";
      if (rouletteModalSpinRow) rouletteModalSpinRow.innerHTML = "";
      if (rouletteModalActions) rouletteModalActions.innerHTML = "";
      createRouletteSpinDom();
      state.rouletteSpinShuffleUntil = state.elapsed + ROULETTE_SPIN_SHUFFLE_SEC;
      state.rouletteSpinRevealAt = state.rouletteSpinShuffleUntil + ROULETTE_SPIN_WHITEOUT_SEC;
      if (rouletteModalSub) rouletteModalSub.textContent = "Shuffling";
    }
    function renderRouletteSourcePicker() {
      if (!rouletteModalSpinRow || !rouletteModalActions) return;
      rouletteModalSpinRow.innerHTML = "";
      rouletteModalActions.innerHTML = "";
      let pickCount = 0;
      for (let r = 1; r <= 13; r++) {
        const c = inventory.deckByRank[r];
        if (!c || c.suit === "joker") continue;
        if (!buildRoulettePairFromSource(c)) continue;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "leave-button";
        b.textContent = `Deck ${cardRankText(r)} \u2014 ${formatCardName(c)}`;
        b.addEventListener("click", () => startRouletteSpinFromSourceCard(c, { kind: "deck", rank: r }));
        rouletteModalActions.appendChild(b);
        pickCount += 1;
      }
      for (let i = 0; i < 3; i++) {
        const c = inventory.backpackSlots[i];
        if (!c || c.suit === "joker") continue;
        if (!buildRoulettePairFromSource(c)) continue;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "leave-button";
        b.textContent = `Backpack ${i + 1} \u2014 ${formatCardName(c)}`;
        b.addEventListener("click", () => startRouletteSpinFromSourceCard(c, { kind: "bp", idx: i }));
        rouletteModalActions.appendChild(b);
        pickCount += 1;
      }
      if (pickCount === 0) {
        if (rouletteModalSub) {
          rouletteModalSub.textContent = "No card can forge right now \u2014 you need a non-joker in deck or backpack whose rank still has two suits not already in your deck.";
        }
        const hint = document.createElement("p");
        hint.className = "roulette-empty-hint";
        hint.textContent = "Leave the inner hex and return with a different loadout, or press Escape to close.";
        rouletteModalSpinRow.appendChild(hint);
      }
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "leave-button";
      cancel.textContent = "Cancel";
      cancel.addEventListener("click", () => closeRouletteForgeUi());
      rouletteModalActions.appendChild(cancel);
    }
    function openRouletteForgeModal() {
      if (!rouletteModal || state.rouletteForgeComplete) return;
      runLog.event(EVT_ROULETTE_MODAL_OPEN, "Roulette forge modal opened");
      state.pausedForRoulette = true;
      state.inventoryModalOpen = true;
      state.rouletteStep = "pickSource";
      state.keys.clear();
      rouletteModal.hidden = false;
      if (rouletteModalTitle) rouletteModalTitle.textContent = "Roulette forge";
      if (rouletteModalSub) rouletteModalSub.textContent = "Pick a card to re-roll into two other suits at the same rank.";
      renderRouletteSourcePicker();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => pinPlayerDeckPanelForRouletteModal());
      });
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
      runLog.event(EVT_SAFEHOUSE_LEVEL_UP, "Safehouse level accepted", {
        runLevel: state.runLevel,
        innerFacilities: !isLunatic()
      });
    }
    function updateSafehouseHex(_dt) {
      if (!state.running || state.pausedForCard || state.pausedForRoulette || state.pausedForForge || state.pausedForSafehousePrompt)
        return;
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
    function closeForgeModalUi() {
      runLog.event(EVT_FORGE_MODAL_CLOSE, "Forge modal closed");
      state.pausedForForge = false;
      state.forgeRefA = null;
      state.forgeRefB = null;
      state.forgePendingSuit = null;
      if (forgeModal) forgeModal.hidden = true;
      if (forgeModalInventory) forgeModalInventory.innerHTML = "";
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
      state.keys.clear();
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
    function cardAtForgeRef(ref) {
      if (!ref) return null;
      if (ref.kind === "deck") return inventory.deckByRank[ref.rank] || null;
      return inventory.backpackSlots[ref.idx] || null;
    }
    function forgeForgedRankFromCards(a, b) {
      if (!a || !b || a.suit === "joker" || b.suit === "joker") return null;
      const ra = a.rank;
      const rb = b.rank;
      if (!Number.isInteger(ra) || !Number.isInteger(rb)) return null;
      return clamp(ra + rb, 1, 13);
    }
    function forgeOutcomeSuit(a, b) {
      const suits = [];
      if (a?.suit && a.suit !== "joker") suits.push(a.suit);
      if (b?.suit && b.suit !== "joker") suits.push(b.suit);
      if (!suits.length) return "spades";
      return suits[Math.floor(Math.random() * suits.length)];
    }
    function clearForgeRefSlot(ref) {
      if (!ref) return;
      if (ref.kind === "deck") inventory.deckByRank[ref.rank] = null;
      else inventory.backpackSlots[ref.idx] = null;
    }
    function commitForgeMerge() {
      const ca = cardAtForgeRef(state.forgeRefA);
      const cb = cardAtForgeRef(state.forgeRefB);
      const rank = forgeForgedRankFromCards(ca, cb);
      if (!ca || !cb || rank == null) {
        closeForgeModalUi();
        return;
      }
      const suit = state.forgePendingSuit || forgeOutcomeSuit(ca, cb);
      const placed = {
        id: `forge-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        suit,
        rank,
        effect: makeCardEffect(suit, rank)
      };
      let dest = !inventory.deckByRank[rank] ? { kind: "deck", rank } : (() => {
        const i = inventory.backpackSlots.findIndex((s) => !s);
        return i >= 0 ? { kind: "bp", idx: i } : null;
      })();
      if (!dest) {
        if (forgeModalHint) {
          forgeModalHint.textContent = "That forged rank\u2019s deck slot is occupied and your backpack is full. Make room, then try again.";
        }
        return;
      }
      clearForgeRefSlot(state.forgeRefA);
      clearForgeRefSlot(state.forgeRefB);
      if (getPrimarySafehouseAxial() && state.safehouseInnerFacilitiesUnlocked) {
        state.safehouseEmbeddedForgeComplete = true;
      }
      runLog.event(EVT_FORGE_SUCCESS, "Forge merge completed", { rank, suit });
      recalcCardPassives();
      renderCardSlots();
      updateSetBonusStatus();
      closeForgeModalUi();
      openCardPickupModal(placed);
    }
    function assignForgeToSlot(slot, ref) {
      if (!ref || slot !== "left" && slot !== "right") return;
      const k = forgeRefKey(ref);
      if (slot === "left") {
        if (forgeRefKey(state.forgeRefB) === k) state.forgeRefB = null;
        state.forgeRefA = ref;
      } else {
        if (forgeRefKey(state.forgeRefA) === k) state.forgeRefA = null;
        state.forgeRefB = ref;
      }
      syncForgeMergeUi();
    }
    function renderForgeSlotContents() {
      for (
        const slot of
        /** @type {const} */
        ["left", "right"]
      ) {
        const el = slot === "left" ? forgeSlotLeft : forgeSlotRight;
        if (!el) continue;
        const ref = slot === "left" ? state.forgeRefA : state.forgeRefB;
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
        const wrap = document.createElement("div");
        wrap.className = "forge-slot-card";
        wrap.textContent = formatCardName(card);
        el.appendChild(wrap);
      }
    }
    function renderForgeInventoryChips() {
      if (!forgeModalInventory) return;
      forgeModalInventory.innerHTML = "";
      const usedA = forgeRefKey(state.forgeRefA);
      const usedB = forgeRefKey(state.forgeRefB);
      const mk = (label, ref) => {
        const k = forgeRefKey(ref);
        if (k && (k === usedA || k === usedB)) return;
        const d = document.createElement("div");
        d.className = "forge-inv-chip";
        d.draggable = true;
        d.dataset.forgeRef = JSON.stringify(ref);
        d.textContent = label;
        forgeModalInventory.appendChild(d);
      };
      for (let r = 1; r <= 13; r++) {
        const c = inventory.deckByRank[r];
        if (!c || c.suit === "joker") continue;
        mk(`Deck ${r} \u2014 ${formatCardName(c)}`, { kind: "deck", rank: r });
      }
      for (let i = 0; i < inventory.backpackSlots.length; i++) {
        const c = inventory.backpackSlots[i];
        if (!c || c.suit === "joker") continue;
        mk(`BP ${i + 1} \u2014 ${formatCardName(c)}`, { kind: "bp", idx: i });
      }
    }
    function forgeRefreshActionButtons() {
      if (!forgeModalActions) return;
      forgeModalActions.innerHTML = "";
      const ca = cardAtForgeRef(state.forgeRefA);
      const cb = cardAtForgeRef(state.forgeRefB);
      const rank = forgeForgedRankFromCards(ca, cb);
      const ready = rank != null;
      const confirm = document.createElement("button");
      confirm.type = "button";
      confirm.className = "leave-button";
      confirm.textContent = "Confirm forge";
      confirm.disabled = !ready;
      confirm.addEventListener("click", () => {
        const c1 = cardAtForgeRef(state.forgeRefA);
        const c2 = cardAtForgeRef(state.forgeRefB);
        if (forgeForgedRankFromCards(c1, c2) == null) return;
        if (!state.forgePendingSuit) state.forgePendingSuit = forgeOutcomeSuit(c1, c2);
        commitForgeMerge();
      });
      forgeModalActions.appendChild(confirm);
      const clear = document.createElement("button");
      clear.type = "button";
      clear.className = "leave-button";
      clear.textContent = "Clear";
      clear.addEventListener("click", () => {
        state.forgeRefA = null;
        state.forgeRefB = null;
        state.forgePendingSuit = null;
        syncForgeMergeUi();
      });
      forgeModalActions.appendChild(clear);
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "leave-button";
      cancel.textContent = "Cancel";
      cancel.addEventListener("click", () => closeForgeModalUi());
      forgeModalActions.appendChild(cancel);
    }
    function syncForgeMergeUi() {
      const ca = cardAtForgeRef(state.forgeRefA);
      const cb = cardAtForgeRef(state.forgeRefB);
      const rank = forgeForgedRankFromCards(ca, cb);
      if (forgePreviewValue) forgePreviewValue.textContent = rank == null ? "\u2014" : String(rank);
      if (ca && cb && rank != null) {
        if (!state.forgePendingSuit) state.forgePendingSuit = forgeOutcomeSuit(ca, cb);
        if (forgeModalHint) {
          forgeModalHint.textContent = `Creates rank ${rank}. Suit: ${state.forgePendingSuit} (random donor). Passive rerolls on confirm.`;
        }
      } else {
        state.forgePendingSuit = null;
        if (forgeModalHint) {
          forgeModalHint.textContent = "Drag two cards from the inventory into the left and right slots, then confirm.";
        }
      }
      renderForgeSlotContents();
      renderForgeInventoryChips();
      forgeRefreshActionButtons();
    }
    function wireForgeModalDragDropOnce() {
      if (!forgeModal || forgeModal.dataset.forgeDragWired === "1") return;
      if (!forgeModalInventory || !forgeSlotLeft || !forgeSlotRight) return;
      forgeModal.dataset.forgeDragWired = "1";
      forgeModalInventory.addEventListener("dragstart", (e) => {
        const t = e.target;
        const chip = t instanceof Element ? t.closest(".forge-inv-chip") : null;
        if (!chip || !chip.dataset.forgeRef) return;
        e.dataTransfer.setData("application/json", chip.dataset.forgeRef);
        e.dataTransfer.effectAllowed = "copy";
      });
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
          const raw = e.dataTransfer.getData("application/json");
          const ref = parseForgeRefFromDataset(raw);
          if (!ref) return;
          const slot = slotEl.dataset.slot;
          if (slot === "left" || slot === "right") assignForgeToSlot(slot, ref);
        });
      }
    }
    function openForgeModal() {
      wireForgeModalDragDropOnce();
      if (!forgeModal || !forgeModalActions || !forgeModalInventory || !forgeSlotLeft || !forgeSlotRight || !forgePreviewValue || state.pausedForForge)
        return;
      runLog.event(EVT_FORGE_MODAL_OPEN, "Forge modal opened");
      state.pausedForForge = true;
      state.forgeRefA = null;
      state.forgeRefB = null;
      state.forgePendingSuit = null;
      state.keys.clear();
      forgeModal.hidden = false;
      if (forgeModalTitle) forgeModalTitle.textContent = "Forge";
      if (forgeModalSub) {
        forgeModalSub.textContent = "Inventory above. Drag two cards into the side slots. The center is the forged rank (sum of ranks, capped at 13).";
      }
      syncForgeMergeUi();
    }
    function updateForgeHex(_dt) {
      if (!state.running || state.pausedForCard || state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge)
        return;
      if (!state.safehouseInnerFacilitiesUnlocked || state.safehouseEmbeddedForgeComplete) return;
      const prim = getPrimarySafehouseAxial();
      if (!prim) return;
      const ph = worldToHex(player.x, player.y);
      if (ph.q !== prim.q || ph.r !== prim.r) {
        state.forgeInnerExitLatch = false;
        return;
      }
      const fw = getSafehouseEmbeddedForgeWorld(prim);
      const dist = Math.hypot(player.x - fw.x, player.y - fw.y);
      const inInner = dist <= safehouseEmbedSiteHitR();
      if (inInner && !state.forgeInnerExitLatch) {
        state.forgeInnerExitLatch = true;
        openForgeModal();
      }
      if (!inInner) state.forgeInnerExitLatch = false;
    }
    function updateSafehouseEmbeddedRouletteHex(_dt, prim) {
      if (!state.running || state.pausedForCard || state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge)
        return;
      const ph = worldToHex(player.x, player.y);
      if (ph.q !== prim.q || ph.r !== prim.r) {
        state.rouletteInnerExitLatch = false;
        state.rouletteWasInHex = false;
        if (!state.safehouseEmbeddedRouletteComplete) {
          state.roulettePhase = 0;
          state.rouletteForgeComplete = false;
        }
        return;
      }
      const rw = getSafehouseEmbeddedRouletteWorld(prim);
      const d = Math.hypot(player.x - rw.x, player.y - rw.y);
      const inRainbow = d <= safehouseEmbedSiteHitR();
      state.rouletteWasInHex = true;
      if (inRainbow && !state.rouletteForgeComplete && !state.safehouseEmbeddedRouletteComplete && !state.rouletteInnerExitLatch) {
        state.rouletteInnerExitLatch = true;
        state.rouletteLockQ = prim.q;
        state.rouletteLockR = prim.r;
        state.roulettePhase = 1;
        openRouletteForgeModal();
      }
      if (!inRainbow) state.rouletteInnerExitLatch = false;
    }
    function updateRouletteHex(_dt) {
      if (!state.running || state.pausedForCard || state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge)
        return;
      const ph = worldToHex(player.x, player.y);
      const prim = getPrimarySafehouseAxial();
      if (state.safehouseInnerFacilitiesUnlocked && prim && ph.q === prim.q && ph.r === prim.r) {
        updateSafehouseEmbeddedRouletteHex(_dt, prim);
        return;
      }
      const inHex = isRouletteHexTile(ph.q, ph.r);
      if (!inHex) {
        state.rouletteWasInHex = false;
        state.roulettePhase = 0;
        state.rouletteForgeComplete = false;
        state.rouletteInnerExitLatch = false;
        return;
      }
      const rc = hexToWorld(ph.q, ph.r);
      const dist = Math.hypot(player.x - rc.x, player.y - rc.y);
      const inInner = dist <= ROULETTE_INNER_HIT_R;
      const enteredHexThisFrame = inHex && !state.rouletteWasInHex;
      if (enteredHexThisFrame && state.roulettePhase === 0 && isRouletteHexInteractive(ph.q, ph.r)) {
        state.rouletteLockQ = ph.q;
        state.rouletteLockR = ph.r;
        const rk = hexKey(ph.q, ph.r);
        if (state.rouletteOuterDamageAppliedKeys.has(rk)) {
          state.roulettePhase = 1;
          state.rouletteScreenFlashUntil = 0;
        } else {
          triggerRouletteHexOuterCrossing();
        }
      }
      state.rouletteWasInHex = true;
      if (state.roulettePhase === 1 && ph.q === state.rouletteLockQ && ph.r === state.rouletteLockR && inInner && !state.rouletteForgeComplete && !state.rouletteInnerExitLatch) {
        state.rouletteInnerExitLatch = true;
        openRouletteForgeModal();
      }
      if (!inInner) state.rouletteInnerExitLatch = false;
    }
    function updateRouletteUi(_dt) {
      if (state.rouletteStep !== "spin" || !state.rouletteOptionA || !state.rouletteOptionB) return;
      const elapsed = state.elapsed;
      if (elapsed >= state.rouletteSpinRevealAt) {
        state.rouletteStep = "pick";
        renderRouletteSpinSettled();
        if (rouletteModalSub) rouletteModalSub.textContent = "Click a card to keep (the other is lost).";
        renderRoulettePickWinnerButtons();
        wireRouletteCardPickListeners();
        return;
      }
      if (elapsed >= state.rouletteSpinShuffleUntil) {
        if (rouletteModalSub) rouletteModalSub.textContent = "Revealing\u2026";
        syncRouletteSpinWhiteoutVisual();
        return;
      }
      syncRouletteSpinShuffleVisual();
    }
    const player = {
      x: 96,
      y: 340,
      r: PLAYER_BASE_HITBOX_R,
      hp: 10,
      maxHp: 10,
      speed: 198,
      facing: { x: 1, y: 0 },
      burstUntil: 0,
      ultimateSpeedUntil: 0,
      velX: 0,
      velY: 0,
      _px: 96,
      _py: 340
    };
    const state = {
      keys: /* @__PURE__ */ new Set(),
      running: true,
      bestSurvival: 0,
      elapsed: 0,
      lastTime: 0,
      wave: 0,
      spawnInterval: 8,
      nextSpawnAt: 3,
      spawnScheduled: [],
      nextPickupAt: 3.5,
      nextCardAt: 10,
      hurtFlash: 0,
      damageEvents: [],
      enemyHitCooldown: 0.52,
      deathCount: 0,
      snapshotPending: false,
      playerInvulnerableUntil: 0,
      /** Clubs 13: enemies do not acquire the player as target; damage blocked. */
      playerUntargetableUntil: 0,
      /** Hearts 13: `elapsed` when death defiance may proc again. */
      heartsDeathDefyReadyAt: 0,
      /** Blue laser: movement slow until this `elapsed`. */
      playerLaserSlowUntil: 0,
      playerTimelockUntil: 0,
      tempHp: 0,
      tempHpExpiry: 0,
      ultimateBurstWaves: [],
      timelockEnemyFrom: 0,
      timelockEnemyUntil: 0,
      /** One-shot extra screen shake when timelock world phase begins. */
      timelockWorldShakeAt: 0,
      screenShakeUntil: 0,
      screenShakeStrength: 0,
      deathStartedAtMs: 0,
      manualPause: false,
      pausedForCard: false,
      inventoryModalOpen: false,
      waitingForMovementResume: false,
      pendingCard: null,
      /** True after touching a map card until modal closes; keeps pickup UI visible even when pending is empty. */
      cardPickupFlowActive: false,
      /** Rank (1–13) for this pickup session; bottom row shows one interactive slot for this rank. */
      pickupTargetRank: null,
      setBonusChoicePendingSuit: null,
      setBonusChoiceCard: null,
      /** Knight + Spades set: `elapsed` until ult-triggered world slow ends. */
      knightSpadesWorldSlowUntil: 0,
      playerHeadstartUntil: 0,
      rogueHunger: 60,
      rogueHungerMax: 60,
      rogueLastSeenAt: 0,
      rogueAlertUntil: 0,
      rogueStealthActive: false,
      rogueStealthOpenUntil: 0,
      rogueHasEnemyLos: false,
      rogueDashAiming: false,
      rogueFoodSenseUntil: 0,
      rogueNextFoodAt: 0,
      rogueNextHungryPopupAt: 0,
      rogueLastKnownPlayerPos: { x: 96, y: 340 },
      /** Procedural arena hexes (`hexKey` → Set); at most one active special (arena / roulette / surge / safehouse). */
      proceduralArenaKeys: /* @__PURE__ */ new Set(),
      proceduralRouletteKeys: /* @__PURE__ */ new Set(),
      proceduralSurgeKeys: /* @__PURE__ */ new Set(),
      proceduralArenaSpentKeys: /* @__PURE__ */ new Set(),
      proceduralRouletteSpentKeys: /* @__PURE__ */ new Set(),
      proceduralSurgeSpentKeys: /* @__PURE__ */ new Set(),
      /** Procedural safehouse sanctuary hexes (active instance). */
      proceduralSafehouseKeys: /* @__PURE__ */ new Set(),
      /** Spent sanctuary tiles (dark, inner locked) until chunk evicts from the active window. */
      proceduralSafehouseSpentKeys: /* @__PURE__ */ new Set(),
      /** Axial cell where the current roulette outer-lock session is anchored (set on outer crossing). */
      rouletteLockQ: 0,
      rouletteLockR: 0,
      /** No procedural special rolls until `elapsed` reaches this (seconds). */
      specialSpawnCooldownUntil: 0,
      /** After unused despawn: hold spawn weight at END until the next used special. */
      specialSpawnHoldMaxRate: false,
      /** Start of 1/30 → 1/10 decay window (`elapsed` seconds). */
      specialSpawnRateEpochStart: PROCEDURAL_SPECIAL_HEX_MIN_ELAPSED_SEC,
      /** 0 = idle (blue), 1 = siege (red), 2 = cleared (green). */
      arenaPhase: 0,
      arenaSiegeEndAt: 0,
      arenaNextLaserEnemyAt: 0,
      arenaNextSniperEnemyAt: 0,
      /** After siege: `elapsed` when to open the Joker reward modal; 0 = not scheduled / already offered. */
      arenaCardRewardAt: 0,
      /** Axial cell where the current arena siege is anchored (set when siege begins). */
      arenaSiegeQ: 0,
      arenaSiegeR: 0,
      /** Local-dev west neighbor for `#special-test-west-select` (additive with procedural specials). */
      testWestQ: 0,
      testWestR: 0,
      /** @type {"none"|"arena"|"roulette"|"surge"|"safehouse"} */
      testWestKind: "none",
      /** 0 idle blue, 1 locked after outer penalty, 2 cleared after forge. */
      roulettePhase: 0,
      /** `hexKey` for each roulette cell whose outer-ring 2 damage has already fired this visit. */
      rouletteOuterDamageAppliedKeys: /* @__PURE__ */ new Set(),
      rouletteWasInHex: false,
      rouletteScreenFlashUntil: 0,
      rouletteForgeComplete: false,
      rouletteInnerExitLatch: false,
      pausedForRoulette: false,
      rouletteStep: null,
      /** @type {{ kind: 'deck'; rank: number } | { kind: 'bp'; idx: number } | null} */
      rouletteSourceRef: null,
      rouletteSourceCardSnapshot: null,
      rouletteOptionA: null,
      rouletteOptionB: null,
      rouletteSpinShuffleUntil: 0,
      rouletteSpinRevealAt: 0,
      /** 0 idle; 1 outer lock; 2 gauntlet; 3 inner green + unlocked, outer locked; 4 fully cleared until leave. */
      surgePhase: 0,
      surgeLockQ: 0,
      surgeLockR: 0,
      surgeWave: 1,
      /** @type {"travel"|"pause"|"idle"} */
      surgeAwait: "travel",
      surgeTravelStartAt: 0,
      surgeTravelDur: SURGE_TRAVEL_DUR_FIRST,
      surgePauseEndAt: 0,
      surgeSafeX: 0,
      surgeSafeY: 0,
      surgePrevSafeX: 0,
      surgePrevSafeY: 0,
      surgeHasPrevSafeBubble: false,
      /** After gauntlet: set true until player exits inner reward ring (then Joker timer starts). */
      surgeEligibleForInnerExitReward: false,
      /** Like arena: `elapsed` when to open Joker modal after inner exit; 0 = none. */
      surgeCardRewardAt: 0,
      surgeWasInSurgeHex: false,
      surgeScreenFlashUntil: 0,
      /** Seconds of `elapsed` not counted toward survival HUD / danger ramp while on a safehouse tile. */
      safehouseClockFreeze: 0,
      /** `runClockEffectiveSec()` snapshot: difficulty ramp + midgame spawn escalation restart relative to this. */
      spawnDifficultyAnchorSurvival: 0,
      /** Sanctuary level-ups accepted this run; scaling uses this (display tier = +1). */
      runLevel: 0,
      /** `hexKey` → center level prompt already shown for this sanctuary **instance**. */
      safehouseLevelPromptShownKeys: (
        /** @type {Set<string>} */
        /* @__PURE__ */ new Set()
      ),
      /** Wall-clock ms when embedded forge/roulette may appear (after level-up cinematic flash). */
      safehouseEmbedRevealAtMs: 0,
      /** After accepting level-up, when player steps off this `hexKey`, sanctuary becomes spent. */
      safehouseAwaitingLeaveAfterLevelUp: false,
      safehouseLevelUpTileKey: (
        /** @type {string} */
        ""
      ),
      /** @type {{ startMs: number; announceLevel: number } | null} */
      runLevelUpCinematic: null,
      /** Full-tile darken animation when sanctuary becomes spent (see `SAFEHOUSE_SPENT_TILE_ANIM_MS`). */
      safehouseSpentTileAnim: (
        /** @type {{ key: string; startMs: number } | null} */
        null
      ),
      safehouseLevelInnerLatch: false,
      pausedForSafehousePrompt: false,
      pausedForForge: false,
      /** @type {{ kind: "deck"; rank: number } | { kind: "bp"; idx: number } | null} */
      forgeRefA: null,
      /** @type {{ kind: "deck"; rank: number } | { kind: "bp"; idx: number } | null} */
      forgeRefB: null,
      /** After first level-up: mini roulette + forge drawn inside the sanctuary tile. */
      safehouseInnerFacilitiesUnlocked: false,
      /** Embedded sanctuary roulette finished (mini stays cleared / green). */
      safehouseEmbeddedRouletteComplete: false,
      /** Embedded sanctuary forge used once (dimmed). */
      safehouseEmbeddedForgeComplete: false,
      forgeInnerExitLatch: false,
      /** Picked when showing forge confirm so commit matches preview. */
      forgePendingSuit: (
        /** @type {string | null} */
        null
      ),
      /** @type {"stumble"|"sprint"|"decel"} */
      lunaticPhase: "stumble",
      lunaticMomentum: 0,
      lunaticPressSprintUnlockAt: 0,
      lunaticPressStopUnlockAt: 0,
      lunaticDecelEndAt: 0,
      lunaticDecelStartAt: 0,
      lunaticSprintStartedAt: 0,
      lunaticStunUntil: 0,
      lunaticRoarUntil: 0,
      lunaticRoarReadyAt: 0,
      lunaticRoarTerrainDmgBank: 0,
      lunaticSteerLeft: false,
      lunaticSteerRight: false,
      lunaticSprintTier2FxFired: false,
      lunaticSprintTier4FxFired: false,
      /** Lunatic: `hexKey` of spawn tile — heal pickups skip this hex. */
      lunaticHealExcludeHexKey: (
        /** @type {string} */
        ""
      ),
      /** Valiant: 0–1 “Will to live”; drain eases with more equipped rabbits, flat at two, slight regen at three. */
      valiantWill: 1,
      /** Valiant: [left, right, back] — each slot `{ hp, maxHp }` or null. */
      valiantRabbitSlots: (
        /** @type {(null | { hp: number; maxHp: number })[]} */
        [null, null, null]
      ),
      /** Valiant E: `elapsed` when Rescue may be used again. */
      valiantRescueReadyAt: 0,
      /** Valiant: next wild bunny spawn time (`elapsed`). */
      valiantNextBunnyAt: 0,
      /** Valiant hearts itemisation: per-slot bonus max HP from `maxHp` cards (random split). */
      valiantSlotBonusMax: (
        /** @type {number[]} */
        [0, 0, 0]
      )
    };
    let snapshotDirectoryHandle = null;
    let selectedCharacter = CHARACTERS.knight;
    function makeAbilitiesForCharacter(character) {
      const spec = character.abilities;
      return {
        dash: { ...spec.dash, nextReadyAt: 0 },
        burst: { ...spec.burst, nextReadyAt: 0 },
        decoy: { ...spec.decoy, nextReadyAt: 0 },
        random: { ...spec.random, type: null, ammo: 0, maxAmmo: 0, nextReadyAt: 0 }
      };
    }
    function makeCooldownFlatForCharacter(character) {
      const out = {};
      for (const id of character.cooldownAbilityIds) out[id] = 0;
      return out;
    }
    function makeCooldownPctForCharacter(character) {
      const out = {};
      for (const id of character.cooldownAbilityIds) out[id] = 0;
      return out;
    }
    let abilities = makeAbilitiesForCharacter(selectedCharacter);
    const entities = {
      hunters: [],
      pickups: [],
      decoys: [],
      shields: [],
      dangerZones: [],
      bullets: [],
      projectiles: [],
      laserBeams: [],
      attackRings: [],
      damageRipples: [],
      ultimateEffects: [],
      cards: [],
      healPopups: [],
      smokeZones: [],
      foods: [],
      /** @type {{ bornAt: number; expiresAt: number; tier: 2 | 4 }[]} */
      lunaticSprintTierFx: [],
      /** Valiant: wild rabbits to pick up (world). */
      valiantBunnies: [],
      /** Valiant W: temporary blocking rects `{ x, y, w, h, expiresAt }`. */
      valiantElectricBoxes: [],
      /** Valiant: short-lived rescue / rabbit-death VFX in world space. */
      valiantRabbitFx: []
    };
    function makeEmptyDeckByRank() {
      const a = new Array(14).fill(null);
      return a;
    }
    let deckSuitCounts = { diamonds: 0, hearts: 0, clubs: 0, spades: 0 };
    const inventory = {
      deckByRank: makeEmptyDeckByRank(),
      backpackSlots: [null, null, null],
      diamondEmpower: null,
      heartsRegenPerSec: 0,
      spadesLandingStealthUntil: 0,
      spadesObstacleBoostUntil: 0,
      clubsInvisUntil: 0,
      clubsPhaseThroughTerrain: false,
      heartsResistanceReadyAt: 0,
      heartsResistanceCooldownDuration: 0,
      heartsRegenBank: 0,
      lunaticRegenBank: 0,
      dodgeTextUntil: 0,
      rogueDiamondRangeBoost: false,
      /** Valiant: extra W charges from Spades `dashCharge` cards (see `recalcCardPassives`). */
      valiantElectricBoxChargeBonus: 0
    };
    const passive = {
      cooldownFlat: makeCooldownFlatForCharacter(selectedCharacter),
      cooldownPct: makeCooldownPctForCharacter(selectedCharacter),
      speedMult: 1,
      obstacleTouchMult: 1,
      dodgeChanceWhenDashCd: 0,
      stunOnHitSecs: 0,
      invisOnBurst: 0,
      dashChargesBonus: 0,
      heartsShieldArc: 0
    };
    const dashState = {
      charges: 1,
      maxCharges: 1,
      nextRechargeAt: 0
    };
    const valiantBoxChargeState = {
      charges: 1,
      maxCharges: 1,
      nextRechargeAt: 0
    };
    const suitGlyph = { diamonds: "\u2666", hearts: "\u2665", clubs: "\u2663", spades: "\u2660", joker: "\u2605" };
    let gameStarted = false;
    let afterDeathRetry = () => {
    };
    function cardRankText(rank) {
      if (rank === 1) return "A";
      if (rank === 11) return "J";
      if (rank === 12) return "Q";
      if (rank === 13) return "K";
      return String(rank);
    }
    function formatCardName(card) {
      return `${cardRankText(card.rank)}${suitGlyph[card.suit] ?? "?"}`;
    }
    function deckKey(suit, rank) {
      return `${suit}:${rank}`;
    }
    function cardRankSpawnWeight(rank) {
      if (rank === 1) return cardRankSpawnWeight(9);
      if (rank >= 2 && rank <= 13) {
        const span = 11;
        const t = (rank - 2) / span;
        return CARD_RANK_SPAWN_WEIGHT_MAX - t * (CARD_RANK_SPAWN_WEIGHT_MAX - CARD_RANK_SPAWN_WEIGHT_MIN);
      }
      return CARD_RANK_SPAWN_WEIGHT_MIN;
    }
    function addReservedDeckKey(card, reserved) {
      if (card?.suit != null && Number.isInteger(card.rank)) {
        reserved.add(deckKey(card.suit, card.rank));
        if (card.suit === "joker") {
          for (const s of ["diamonds", "hearts", "clubs", "spades"]) reserved.add(deckKey(s, card.rank));
        }
      }
    }
    function getReservedDeckKeys() {
      const reserved = /* @__PURE__ */ new Set();
      addReservedDeckKey(state.pendingCard, reserved);
      for (let r = 1; r <= 13; r++) addReservedDeckKey(inventory.deckByRank[r], reserved);
      for (const c of inventory.backpackSlots) addReservedDeckKey(c, reserved);
      for (const ec of entities.cards) addReservedDeckKey(ec.card, reserved);
      return reserved;
    }
    function forEachDeckCard(fn) {
      for (let r = 1; r <= 13; r++) {
        const c = inventory.deckByRank[r];
        if (c) fn(c, r);
      }
    }
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
    function abilityLabelById(id) {
      return selectedCharacter.abilities[id]?.label ?? id;
    }
    function makeCardEffect(suit, rank) {
      if (rank === 1) {
        const pool = ["shield", "burst", "timelock", "heal"];
        return { kind: "ultimate", ultType: pool[Math.floor(Math.random() * pool.length)] };
      }
      if (suit === "diamonds") {
        const abilityPool = selectedCharacter.cooldownAbilityIds;
        const target = abilityPool[Math.floor(Math.random() * abilityPool.length)];
        if (selectedCharacter.id === "rogue") {
          return { kind: "cooldownPct", target, value: rogueDiamondCooldownPctForRank(rank) };
        }
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
        if (pick === "dodge") return { kind: "dodge", value: (5 + 0.1 * rank) / 100 };
        if (pick === "stun") return { kind: "stun", value: 0.2 * rank };
        return { kind: "invisBurst", value: 0.1 * rank };
      }
      if (rank >= 11) return { kind: "dashCharge", value: 1 };
      if (Math.random() < 0.5) return { kind: "speed", value: Math.min(0.18, 0.018 * rank) };
      return { kind: "terrainBoost", value: Math.min(0.36, 0.036 * rank) };
    }
    function makeRandomCard() {
      const reserved = getReservedDeckKeys();
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
        effect: makeCardEffect(suit, rank)
      };
    }
    function makePickupFlipFace(realCard) {
      const suits = ["diamonds", "hearts", "clubs", "spades"];
      for (let attempt = 0; attempt < 32; attempt++) {
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const rank = 1 + Math.floor(Math.random() * 13);
        if (suit !== realCard.suit || rank !== realCard.rank) return { suit, rank };
      }
      const altSuit = suits.find((s) => s !== realCard.suit) ?? "spades";
      return { suit: altSuit, rank: realCard.rank === 1 ? 2 : realCard.rank - 1 };
    }
    function makeJokerArenaRewardCard() {
      const ranks = [10, 11, 12, 13];
      const rank = ranks[Math.floor(Math.random() * ranks.length)];
      const sourceSuits = ["diamonds", "hearts", "clubs", "spades"];
      const effectBorrowedSuit = sourceSuits[Math.floor(Math.random() * sourceSuits.length)];
      return {
        id: `joker-arena-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        suit: "joker",
        rank,
        effectBorrowedSuit,
        effect: makeCardEffect(effectBorrowedSuit, rank)
      };
    }
    function describeCardEffect(card) {
      const e = card.effect;
      let base;
      if (e.kind === "ultimate") {
        const names = { shield: "Orbiting shields", burst: "Push waves", timelock: "Timelock", heal: "Vitality (temp HP)" };
        base = `Ultimate \u2014 ${names[e.ultType] ?? e.ultType}`;
      } else if (e.kind === "cooldown") base = `-${e.value.toFixed(1)}s ${abilityLabelById(e.target)} cooldown`;
      else if (e.kind === "cooldownPct") base = `-${Math.round(e.value * 100)}% ${abilityLabelById(e.target)} cooldown`;
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
      if (card?.suit === "joker") {
        const g = suitGlyph[card.effectBorrowedSuit] ?? "?";
        return `${base} (Joker \u2014 Contributes towards all set bonuses).`;
      }
      return base;
    }
    function fillDeckSlotEl(el, rank, card) {
      if (!el) return;
      for (const c of CARD_SET_GLOW_CLASSES) el.classList.remove(c);
      el.classList.toggle("filled", !!card);
      el.dataset.rank = String(rank);
      if (!card) {
        el.innerHTML = `<span class="deck-rank-label">${cardRankText(rank)}</span><span class="deck-slot-empty">\u2014</span>`;
        return;
      }
      const glow = suitInventoryGlowClass(card);
      if (glow) el.classList.add(glow);
      el.innerHTML = `<span class="deck-rank-label">${cardRankText(rank)}</span><div><span class="title">${formatCardName(
        card
      )}</span><span class="meta">${describeCardEffect(card)}</span></div>`;
    }
    function renderCardSlots() {
      if (deckRankSlotEls && deckRankSlotEls.length) {
        for (let r = 1; r <= 13; r++) {
          const el = deckRankSlotEls[r - 1];
          fillDeckSlotEl(el, r, inventory.deckByRank[r] || null);
        }
      }
      if (backpackSlotEls && backpackSlotEls.length) {
        for (let i = 0; i < 3; i++) {
          const slot = backpackSlotEls[i];
          if (!slot) continue;
          const card = inventory.backpackSlots[i] || null;
          for (const c of CARD_SET_GLOW_CLASSES) slot.classList.remove(c);
          slot.classList.toggle("filled", !!card);
          slot.dataset.bpIdx = String(i);
          if (!card) {
            slot.innerHTML = `Pack ${i + 1}<span class="deck-slot-empty">Empty</span>`;
            continue;
          }
          const glow = suitInventoryGlowClass(card);
          if (glow) slot.classList.add(glow);
          slot.innerHTML = `<span class="deck-rank-label">Pack ${i + 1}</span><div><span class="title">${formatCardName(
            card
          )}</span><span class="meta">${describeCardEffect(card)}</span></div>`;
        }
      }
    }
    function syncUltimateFromAceDeck() {
      const ace = inventory.deckByRank[1];
      const e = ace?.effect;
      if (!e || e.kind !== "ultimate") {
        abilities.random.type = null;
        abilities.random.maxAmmo = 0;
        abilities.random.ammo = 0;
        abilities.random.nextReadyAt = 0;
        entities.shields = [];
        return;
      }
      const ultType = e.ultType;
      const prevType = abilities.random.type;
      if (prevType != null && prevType !== ultType) entities.shields = [];
      abilities.random.type = ultType;
      abilities.random.maxAmmo = 1;
      if (state.elapsed >= abilities.random.nextReadyAt) abilities.random.ammo = 1;
      else abilities.random.ammo = 0;
    }
    function recalcCardPassives() {
      passive.cooldownFlat = makeCooldownFlatForCharacter(selectedCharacter);
      passive.cooldownPct = makeCooldownPctForCharacter(selectedCharacter);
      passive.speedMult = 1;
      passive.obstacleTouchMult = 1;
      passive.dodgeChanceWhenDashCd = 0;
      passive.stunOnHitSecs = 0;
      passive.invisOnBurst = 0;
      passive.dashChargesBonus = 0;
      passive.heartsShieldArc = 0;
      inventory.heartsRegenPerSec = 0;
      inventory.clubsPhaseThroughTerrain = false;
      inventory.rogueDiamondRangeBoost = false;
      inventory.valiantElectricBoxChargeBonus = 0;
      let maxHpBonus = 0;
      const suits = { diamonds: 0, hearts: 0, clubs: 0, spades: 0 };
      forEachDeckCard((card) => {
        if (!card?.suit) return;
        if (card.suit === "joker") {
          suits.diamonds += 1;
          suits.hearts += 1;
          suits.clubs += 1;
          suits.spades += 1;
        } else if (suits[card.suit] != null) suits[card.suit] += 1;
        const e = card.effect;
        if (e.kind === "cooldown") passive.cooldownFlat[e.target] += e.value;
        else if (e.kind === "cooldownPct") passive.cooldownPct[e.target] += e.value;
        else if (e.kind === "maxHp") maxHpBonus += e.value;
        else if (e.kind === "dodge") passive.dodgeChanceWhenDashCd += e.value;
        else if (e.kind === "stun") passive.stunOnHitSecs += e.value;
        else if (e.kind === "invisBurst") passive.invisOnBurst += e.value;
        else if (e.kind === "speed") passive.speedMult += e.value;
        else if (e.kind === "terrainBoost") passive.obstacleTouchMult += e.value;
        else if (e.kind === "dashCharge") {
          if (isValiant() && card.suit === "spades") inventory.valiantElectricBoxChargeBonus += e.value;
          else if (!isValiant()) passive.dashChargesBonus += e.value;
        } else if (e.kind === "frontShield") passive.heartsShieldArc += e.arc;
      });
      deckSuitCounts = { ...suits };
      player.r = suits.clubs >= SET_BONUS_SUIT_MAX ? PLAYER_BASE_HITBOX_R * CLUBS_13_HITBOX_MULT : PLAYER_BASE_HITBOX_R;
      if (suits.hearts >= SET_BONUS_SUIT_THRESHOLD) inventory.heartsRegenPerSec = 0.3;
      if (suits.clubs >= SET_BONUS_SUIT_THRESHOLD) inventory.clubsPhaseThroughTerrain = true;
      if (selectedCharacter.id === "rogue" && suits.diamonds >= SET_BONUS_SUIT_THRESHOLD) {
        inventory.rogueDiamondRangeBoost = true;
      }
      if (suits.spades >= SET_BONUS_SUIT_THRESHOLD) {
      }
      if (suits.diamonds >= SET_BONUS_SUIT_MAX && state.setBonusChoicePendingSuit === "diamonds") {
        state.setBonusChoicePendingSuit = null;
      }
      if (selectedCharacter.id !== "rogue" && suits.diamonds >= SET_BONUS_SUIT_THRESHOLD && suits.diamonds < SET_BONUS_SUIT_MAX && !inventory.diamondEmpower && !state.setBonusChoicePendingSuit) {
        state.setBonusChoicePendingSuit = "diamonds";
      }
      dashState.maxCharges = 1 + passive.dashChargesBonus;
      dashState.charges = Math.min(dashState.charges || dashState.maxCharges, dashState.maxCharges);
      if (isValiant()) {
        valiantBoxChargeState.maxCharges = 1 + inventory.valiantElectricBoxChargeBonus;
        valiantBoxChargeState.charges = Math.min(
          valiantBoxChargeState.charges || valiantBoxChargeState.maxCharges,
          valiantBoxChargeState.maxCharges
        );
        const bonusSplit = [0, 0, 0];
        for (let k = 0; k < maxHpBonus; k++) bonusSplit[Math.floor(Math.random() * 3)]++;
        state.valiantSlotBonusMax = bonusSplit;
        for (let i = 0; i < 3; i++) {
          const s = state.valiantRabbitSlots[i];
          if (s) {
            s.maxHp = VALIANT_RABBIT_BASE_HP + bonusSplit[i];
            s.hp = Math.min(s.hp, s.maxHp);
          }
        }
        player.maxHp = 1;
        player.hp = 1;
      } else {
        player.maxHp = Math.max(1, selectedCharacter.baseHp + maxHpBonus);
        player.hp = Math.min(player.hp, player.maxHp);
      }
      renderCardSlots();
      syncUltimateFromAceDeck();
      updateSetBonusStatus();
    }
    function effectiveAbilityCooldown(abilityId, baseCooldown, minCooldown, extraFlatReduction = 0) {
      const flat = (passive.cooldownFlat[abilityId] || 0) + extraFlatReduction;
      const pct = clamp(passive.cooldownPct[abilityId] || 0, 0, 0.85);
      return Math.max(minCooldown, Math.max(0, baseCooldown - flat) * (1 - pct));
    }
    function updateSetBonusStatus() {
      const lines = getSetBonusLines();
      if (setBonusStatusEl) setBonusStatusEl.textContent = lines.join(" ");
    }
    function getSetBonusLines() {
      const suits = { diamonds: 0, hearts: 0, clubs: 0, spades: 0 };
      forEachDeckCard((card) => {
        if (!card?.suit) return;
        if (card.suit === "joker") {
          suits.diamonds += 1;
          suits.hearts += 1;
          suits.clubs += 1;
          suits.spades += 1;
        } else if (suits[card.suit] != null) suits[card.suit] += 1;
      });
      const lines = [];
      if (suits.diamonds >= SET_BONUS_SUIT_THRESHOLD) {
        if (selectedCharacter.id === "rogue") {
          lines.push("Set bonus! Diamonds: dash range and smoke radius increased.");
        } else if (isValiant()) {
          const pick = suits.diamonds >= SET_BONUS_SUIT_MAX ? "Surge, shock field, and Rescue all empowered" : inventory.diamondEmpower === "valiantSpeed" ? "Surge: +30% speed, +1.5s duration (passive)" : inventory.diamondEmpower === "valiantBox" ? "shock field tiles are larger" : inventory.diamondEmpower === "valiantRescue" ? "Rescue restores more Will" : "choose your empowerment in inventory";
          lines.push(`Set bonus! Diamonds: ${pick}.`);
        } else {
          const pick = suits.diamonds >= SET_BONUS_SUIT_MAX ? "dash, burst, and decoy all empowered" : inventory.diamondEmpower === "dash2x" ? "dash goes twice as far" : inventory.diamondEmpower === "speedPassive" ? "speed burst: +30% boost, +1.5s on W (always on)" : inventory.diamondEmpower === "decoyLead" ? "decoy drifts away, cooldown -2s, duration +1s" : "choose your empowerment in inventory";
          lines.push(`Set bonus! Diamonds: ${pick}.`);
        }
      }
      if (suits.hearts >= SET_BONUS_SUIT_THRESHOLD) {
        lines.push(
          isValiant() ? "Set bonus! Hearts: regen ticks heal injured rabbits at random." : "Set bonus! Hearts: passive HP regeneration."
        );
      }
      if (suits.clubs >= SET_BONUS_SUIT_THRESHOLD) {
        lines.push(
          selectedCharacter.id === "rogue" ? "Set bonus! Clubs: phase through terrain while inside smoke." : isValiant() ? "Set bonus! Clubs: phase through terrain while Surge (Q) is active." : "Set bonus! Clubs: burst phase-through terrain."
        );
      }
      if (suits.spades >= SET_BONUS_SUIT_THRESHOLD) {
        lines.push(
          selectedCharacter.id === "rogue" ? "Set bonus! Spades: dash from stealth snaps you back into stealth on landing (extra grace to hug cover)." : isValiant() ? "Set bonus! Spades: +1 shock-field charge (J/Q/K); using your ultimate (R) still slows the world for 2s." : "Set bonus! Spades: using your ultimate (R) slows hunters, shots, and hazards to 30% speed for 2 seconds."
        );
      }
      if (suits.diamonds >= SET_BONUS_SUIT_MAX && selectedCharacter.id === "rogue") {
        lines.push("Set bonus! Diamonds (13): maximum dash, smoke, and consume tuning.");
      }
      if (suits.diamonds >= SET_BONUS_SUIT_MAX && isValiant()) {
        lines.push("Set bonus! Diamonds (13): maximum Surge, shock field, and Rescue tuning.");
      }
      if (suits.hearts >= SET_BONUS_SUIT_MAX) {
        lines.push("Set bonus! Hearts (13): death defiance \u2014 survive a lethal hit at 5 HP (30s cooldown).");
      }
      if (suits.clubs >= SET_BONUS_SUIT_MAX) {
        lines.push("Set bonus! Clubs (13): smaller hitbox; 1s untargetable after taking a hit.");
      }
      if (suits.spades >= SET_BONUS_SUIT_MAX) {
        lines.push(
          "Set bonus! Spades (13): hostiles near you (~2in) move and shoot ~30% slower while in the aura."
        );
      }
      return lines;
    }
    const MODAL_SET_SUIT_ORDER = ["hearts", "diamonds", "clubs", "spades"];
    const CARD_SET_GLOW_CLASSES = [
      "card-set-glow-red",
      "card-set-glow-yellow",
      "card-set-glow-green",
      "card-set-glow-blue",
      "card-set-glow-white"
    ];
    function countSuitsAcrossAllStowed() {
      const suits = { diamonds: 0, hearts: 0, clubs: 0, spades: 0 };
      const add = (card) => {
        if (!card?.suit) return;
        if (card.suit === "joker") {
          suits.diamonds += 1;
          suits.hearts += 1;
          suits.clubs += 1;
          suits.spades += 1;
        } else if (suits[card.suit] != null) suits[card.suit] += 1;
      };
      add(state.pendingCard);
      forEachDeckCard((c) => add(c));
      for (const c of inventory.backpackSlots) add(c);
      return suits;
    }
    function suitInventoryGlowClass(card) {
      if (!card?.suit) return "";
      if (card.suit === "joker") return "card-set-glow-white";
      const suits = countSuitsAcrossAllStowed();
      const n = suits[card.suit];
      if (n < 2) return "";
      const suitsWithPair = MODAL_SET_SUIT_ORDER.filter((s) => suits[s] >= 2);
      const idx = suitsWithPair.indexOf(card.suit);
      if (idx < 0) return "";
      if (suitsWithPair.length === 1 && n >= 4) return "card-set-glow-yellow";
      const glowByPairOrder = [
        "card-set-glow-red",
        "card-set-glow-yellow",
        "card-set-glow-green",
        "card-set-glow-blue"
      ];
      return glowByPairOrder[Math.min(idx, glowByPairOrder.length - 1)];
    }
    function countSuitsInActiveSlots() {
      const suits = { diamonds: 0, hearts: 0, clubs: 0, spades: 0 };
      forEachDeckCard((card) => {
        if (!card?.suit) return;
        if (card.suit === "joker") {
          suits.diamonds += 1;
          suits.hearts += 1;
          suits.clubs += 1;
          suits.spades += 1;
        } else if (suits[card.suit] != null) suits[card.suit] += 1;
      });
      return suits;
    }
    function diamondsOmniEmpowerActive() {
      return deckSuitCounts.diamonds >= SET_BONUS_SUIT_MAX;
    }
    function knightDiamondBurstEmpowerActive() {
      return selectedCharacter.id === "knight" && inventory.diamondEmpower === "speedPassive" || selectedCharacter.id === "valiant" && inventory.diamondEmpower === "valiantSpeed" || diamondsOmniEmpowerActive();
    }
    function spades13AuraEnemyDtMult(worldX, worldY) {
      if (deckSuitCounts.spades < SET_BONUS_SUIT_MAX) return 1;
      const dx = worldX - player.x;
      const dy = worldY - player.y;
      if (dx * dx + dy * dy <= SPADES_13_AURA_RADIUS_PX * SPADES_13_AURA_RADIUS_PX) return SPADES_13_ENEMY_DT_MULT;
      return 1;
    }
    function suitDisplayNameForModal(suit) {
      return { diamonds: "Diamonds", hearts: "Hearts", clubs: "Clubs", spades: "Spades" }[suit] ?? suit;
    }
    function suitSetBonusGoalLabel(suit) {
      if (suit === "hearts") return isValiant() ? "regen heals rabbits at random" : "continuous health regen";
      if (suit === "diamonds") {
        if (selectedCharacter.id === "rogue") return "larger dash & smoke radius";
        if (isValiant()) return "Surge / shock field / Rescue empowerment";
        return "ability empowerment";
      }
      if (suit === "clubs") {
        if (selectedCharacter.id === "rogue") return "phase through terrain in smoke";
        if (isValiant()) return "phase through terrain during Surge (Q)";
        return "burst phases through terrain";
      }
      if (suit === "spades") {
        if (selectedCharacter.id === "rogue") return "stealth refresh on stealth-dash landing";
        if (isValiant()) return "+1 shock-field charge; ultimate world slow";
        return "after ultimate: world (except you) at 30% speed for 2s";
      }
      return "";
    }
    function diamondsActiveSummary() {
      if (diamondsOmniEmpowerActive()) {
        return selectedCharacter.id === "rogue" ? "maximum dash, smoke, and consume tuning" : isValiant() ? "maximum Surge, shock field, and Rescue tuning" : "all three diamond empowerments active";
      }
      if (selectedCharacter.id === "rogue") return "larger dash & smoke radius";
      if (isValiant()) {
        if (inventory.diamondEmpower === "valiantSpeed") return "Surge: +30% boost, +1.5s duration (passive)";
        if (inventory.diamondEmpower === "valiantBox") return "larger shock field tiles";
        if (inventory.diamondEmpower === "valiantRescue") return "Rescue restores more Will";
        return "choose empowerment below";
      }
      if (inventory.diamondEmpower === "dash2x") return "dash goes twice as far";
      if (inventory.diamondEmpower === "speedPassive") {
        return selectedCharacter.id === "knight" ? "speed burst: +30% boost, +1.5s burst duration (always on)" : "speed burst is passive";
      }
      if (inventory.diamondEmpower === "decoyLead") return "decoy drifts, shorter cooldown, longer life";
      return "choose empowerment below";
    }
    function suitSetBonusSevenActiveShort(suit) {
      if (suit === "diamonds") return diamondsActiveSummary();
      if (suit === "hearts") return isValiant() ? "regen heals rabbits" : "passive HP regeneration";
      if (suit === "clubs") {
        if (selectedCharacter.id === "rogue") return "phase through terrain while inside smoke";
        if (isValiant()) return "phase during Surge (Q)";
        return "burst phase-through terrain";
      }
      if (selectedCharacter.id === "rogue") return "stealth refresh on stealth-dash landing";
      if (isValiant()) return "+1 shock charge; ult world slow";
      return "after ultimate: 30% world speed for 2s";
    }
    function suitSetBonusTierTwoGoalLabel(suit) {
      if (suit === "hearts") return "death defiance on 30s cooldown (lethal \u2192 5 HP)";
      if (suit === "diamonds") {
        if (selectedCharacter.id === "rogue") return "stronger dash, smoke, and consume together";
        if (isValiant()) return "Surge, shock field, and Rescue all empowered at once";
        return "all three abilities empowered at once";
      }
      if (suit === "clubs") return "30% smaller hitbox; 1s untargetable after a hit";
      if (suit === "spades") return "~2in aura: hostiles inside slowed ~30%";
      return "";
    }
    function suitSetBonusTierTwoActiveShort(suit) {
      if (suit === "hearts") return "death defiance (30s CD \u2192 5 HP)";
      if (suit === "diamonds") {
        if (selectedCharacter.id === "rogue") return "maximum diamond mobility";
        if (isValiant()) return "all three Valiant empowerments active";
        return "all three empowerments active";
      }
      if (suit === "clubs") return "smaller hitbox; untargetable 1s on hit";
      if (suit === "spades") return "nearby hostiles slowed ~30% in aura";
      return "";
    }
    function getModalSetBonusProgressLines() {
      const suits = countSuitsInActiveSlots();
      const lines = [];
      const T7 = SET_BONUS_SUIT_THRESHOLD;
      const T13 = SET_BONUS_SUIT_MAX;
      for (const suit of MODAL_SET_SUIT_ORDER) {
        const n = suits[suit];
        if (n < 1) continue;
        const name = suitDisplayNameForModal(suit);
        if (n < T7) {
          lines.push(`${name} ${n}/${T7} (${suitSetBonusGoalLabel(suit)})`);
          continue;
        }
        lines.push(`${name} ${T7}/${T7} (${suitSetBonusSevenActiveShort(suit)})`);
        if (n < T13) {
          lines.push(`${name} ${n}/${T13} (${suitSetBonusTierTwoGoalLabel(suit)})`);
        } else {
          lines.push(`${name} ${T13}/${T13} (${suitSetBonusTierTwoActiveShort(suit)})`);
        }
      }
      return lines;
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
      });
    }
    function appendCardToZone(zoneEl, zoneId, card, compact) {
      if (card) {
        const cardEl = document.createElement("div");
        cardEl.className = "zone-card";
        cardEl.draggable = true;
        const glow = suitInventoryGlowClass(card);
        if (glow) cardEl.classList.add(glow);
        cardEl.textContent = compact ? formatCardName(card) : `${formatCardName(card)} \u2014 ${describeCardEffect(card)}`;
        cardEl.addEventListener("dragstart", (event) => {
          event.dataTransfer?.setData("text/plain", zoneId);
        });
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
      cell.innerHTML = `<div class="modal-deck-cell-label">${cardRankText(rank)}</div>`;
      if (card) {
        const glow = suitInventoryGlowClass(card);
        if (glow) cell.classList.add(glow);
        const t = document.createElement("div");
        t.className = "modal-deck-cell-card";
        t.textContent = formatCardName(card);
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
      cell.innerHTML = `<div class="modal-deck-cell-label">Pack ${packIndex + 1}</div>`;
      if (card) {
        const glow = suitInventoryGlowClass(card);
        if (glow) cell.classList.add(glow);
        const t = document.createElement("div");
        t.className = "modal-deck-cell-card";
        t.textContent = formatCardName(card);
        cell.appendChild(t);
      } else {
        const e = document.createElement("div");
        e.className = "modal-deck-cell-empty";
        e.textContent = "\u2014";
        cell.appendChild(e);
      }
      parent.appendChild(cell);
    }
    function rankDeckIsCompletelyEmpty() {
      for (let rank = 1; rank <= 13; rank++) {
        if (inventory.deckByRank[rank]) return false;
      }
      return true;
    }
    function cardModalInventoryDragHintHtml() {
      return `<aside class="card-face-hint" aria-label="How to use inventory">
    <strong>Using inventory</strong>
    <p><strong>Click and hold</strong> a card, then <b>drag</b> it to a slot and <b>release</b> to drop, either in the relevant card slot, or the <b>backpack</b>. Cards in the backpack have no effect but are stored for later.</p>
  </aside>`;
    }
    function renderCardModal() {
      if (!cardModal || !cardModalFace || !cardSwapRow) return;
      if (modalDeckStripEl) modalDeckStripEl.innerHTML = "";
      if (!state.inventoryModalOpen) {
        cardModal.classList.remove("open");
        if (modalSetBonusStatusEl) modalSetBonusStatusEl.textContent = "";
        cardSwapRow.innerHTML = "";
        cardModalFace.classList.remove("compact");
        cardModalFace.innerHTML = "";
        renderCardSlots();
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
        appendModalDeckDisplayCell(aceWing, 1, inventory.deckByRank[1] || null, "modal-deck-cell--ace");
        const mid = document.createElement("div");
        mid.className = "modal-deck-middle-twelve";
        for (let r = 2; r <= 13; r++) {
          appendModalDeckDisplayCell(mid, r, inventory.deckByRank[r] || null);
        }
        const bpWing = document.createElement("div");
        bpWing.className = "modal-deck-backpack-wing";
        for (let i = 0; i < 3; i++) {
          appendModalBackpackDisplayCell(bpWing, i, inventory.backpackSlots[i] || null);
        }
        wings.appendChild(aceWing);
        wings.appendChild(mid);
        wings.appendChild(bpWing);
        modalDeckStripEl.appendChild(wings);
      }
      if (state.cardPickupFlowActive) {
        const r = state.pendingCard?.rank ?? state.pickupTargetRank;
        if (r != null) {
          const showCard = state.pendingCard || inventory.deckByRank[r] || null;
          const showFirstCardHint = rankDeckIsCompletelyEmpty();
          if (showCard) {
            cardModalFace.classList.remove("compact");
            if (showFirstCardHint) {
              cardModalFace.innerHTML = `<div class="card-face-layout"><div class="card-face-primary"><div class="big">${formatCardName(
                showCard
              )}</div><div class="desc">${describeCardEffect(showCard)}</div></div>${cardModalInventoryDragHintHtml()}</div>`;
            } else {
              cardModalFace.innerHTML = `<div class="big">${formatCardName(showCard)}</div><div class="desc">${describeCardEffect(showCard)}</div>`;
            }
          } else {
            if (showFirstCardHint) {
              cardModalFace.classList.remove("compact");
              cardModalFace.innerHTML = `<div class="card-face-layout"><div class="card-face-primary"><div class="desc">Rank <strong>${cardRankText(
                r
              )}</strong> \u2014 empty. Use <strong>New pickup</strong> or a backpack slot below, or <strong>Leave</strong>.</div></div>${cardModalInventoryDragHintHtml()}</div>`;
            } else {
              cardModalFace.classList.add("compact");
              cardModalFace.innerHTML = `<div class="desc">Rank <strong>${cardRankText(r)}</strong> \u2014 empty. Use <strong>New pickup</strong> or a backpack slot below, or <strong>Leave</strong>.</div>`;
            }
          }
        } else {
          const showFirstHintNoRank = state.cardPickupFlowActive && rankDeckIsCompletelyEmpty();
          if (showFirstHintNoRank) {
            cardModalFace.classList.remove("compact");
            cardModalFace.innerHTML = `<div class="card-face-layout"><div class="card-face-primary"><div class="desc">Drag a card into <strong>New pickup</strong> from a backpack slot or the rank row above, or <strong>Leave</strong>.</div></div>${cardModalInventoryDragHintHtml()}</div>`;
          } else {
            cardModalFace.classList.add("compact");
            cardModalFace.innerHTML = '<div class="desc">Drag a card into <strong>New pickup</strong> from a backpack slot or the rank row above, or <strong>Leave</strong>.</div>';
          }
        }
      } else if (state.pendingCard) {
        const card = state.pendingCard;
        cardModalFace.classList.remove("compact");
        cardModalFace.innerHTML = `<div class="big">${formatCardName(card)}</div><div class="desc">${describeCardEffect(card)}</div>`;
      } else {
        cardModalFace.classList.add("compact");
        cardModalFace.innerHTML = '<div class="desc">Drag between rank slots and the three backpack packs. Leave closes without taking a new pickup.</div>';
      }
      cardSwapRow.innerHTML = "";
      const zones = [];
      if (state.cardPickupFlowActive) {
        zones.push({ id: "pickup", label: "New pickup", card: state.pendingCard, kind: "pickup" });
        const deckR = state.pendingCard?.rank ?? state.pickupTargetRank;
        if (deckR != null) {
          zones.push({
            id: `deck-${deckR}`,
            label: `Card slot: ${cardRankText(deckR)}`,
            card: inventory.deckByRank[deckR] || null,
            kind: "rank"
          });
        }
      } else if (state.pendingCard) {
        zones.push({ id: "pickup", label: "New pickup", card: state.pendingCard, kind: "pickup" });
      }
      for (let i = 0; i < 3; i++) zones.push({ id: `bp-${i}`, label: `Backpack ${i + 1}`, card: inventory.backpackSlots[i] || null, kind: "bp" });
      for (const zone of zones) {
        const zoneEl = document.createElement("div");
        let zc = "drop-zone drop-zone--swap";
        if (zone.kind === "pickup" || zone.kind === "rank") zc += " drop-zone--main-slot";
        if (zone.kind === "bp") zc += " drop-zone--backpack-sm";
        zoneEl.className = zc;
        zoneEl.innerHTML = `<div class="zone-label">${zone.label}</div>`;
        wireDropZone(zoneEl, zone.id);
        appendCardToZone(zoneEl, zone.id, zone.card, false);
        cardSwapRow.appendChild(zoneEl);
      }
      if (state.setBonusChoicePendingSuit === "diamonds" && !inventory.diamondEmpower) {
        const mk = (id, text) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "leave-button";
          btn.textContent = `Set bonus! ${text}`;
          btn.addEventListener("click", () => {
            inventory.diamondEmpower = id;
            state.setBonusChoicePendingSuit = null;
            updateSetBonusStatus();
            renderCardModal();
          });
          return btn;
        };
        if (isValiant()) {
          cardSwapRow.appendChild(mk("valiantSpeed", "Surge: +30% speed boost, +1.5s duration (passive)"));
          cardSwapRow.appendChild(mk("valiantBox", "Shock field tiles are larger"));
          cardSwapRow.appendChild(mk("valiantRescue", "Rescue restores more Will"));
        } else {
          cardSwapRow.appendChild(mk("dash2x", "Dash goes twice as far"));
          cardSwapRow.appendChild(
            mk(
              "speedPassive",
              selectedCharacter.id === "knight" ? "Burst: +30% speed boost, +1.5s duration (passive)" : "Speed burst is passive"
            )
          );
          cardSwapRow.appendChild(mk("decoyLead", "Decoy drifts away, -2s cooldown, +1s duration"));
        }
      }
      const leaveBtn = document.createElement("button");
      leaveBtn.type = "button";
      leaveBtn.className = "leave-button";
      leaveBtn.textContent = "Leave";
      leaveBtn.addEventListener("click", () => continueAfterLoadout());
      cardSwapRow.appendChild(leaveBtn);
      if (modalSetBonusStatusEl) {
        const progress = getModalSetBonusProgressLines();
        modalSetBonusStatusEl.textContent = progress.length ? progress.join("\n") : "";
      }
      renderCardSlots();
    }
    function getCardByZone(zoneId) {
      if (zoneId === "pickup") return state.pendingCard;
      const dr = parseDeckZoneId(zoneId);
      if (dr != null) return inventory.deckByRank[dr] || null;
      const bi = parseBpZoneId(zoneId);
      if (bi != null) return inventory.backpackSlots[bi] || null;
      return null;
    }
    function setCardByZone(zoneId, card) {
      if (zoneId === "pickup") state.pendingCard = card;
      else {
        const dr = parseDeckZoneId(zoneId);
        if (dr != null) inventory.deckByRank[dr] = card || null;
        else {
          const bi = parseBpZoneId(zoneId);
          if (bi != null) inventory.backpackSlots[bi] = card || null;
        }
      }
    }
    function syncPickupTargetRankAfterSwap(fromZoneId, toZoneId, fromCardBefore, toCardBefore) {
      if (!state.cardPickupFlowActive) return;
      if (state.pendingCard) {
        state.pickupTargetRank = state.pendingCard.rank;
        return;
      }
      if (fromZoneId === "pickup") {
        const dTo = parseDeckZoneId(toZoneId);
        if (dTo != null) {
          state.pickupTargetRank = dTo;
          return;
        }
        const bTo = parseBpZoneId(toZoneId);
        if (bTo != null && !toCardBefore && fromCardBefore) {
          state.pickupTargetRank = fromCardBefore.rank;
          return;
        }
      }
      state.pickupTargetRank = null;
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
      const allowStageToEmptyPickup = toPickup && !state.pendingCard && state.cardPickupFlowActive && fromCard && (bFrom != null || dFrom != null && fromCard.rank === dFrom && (state.pickupTargetRank == null || dFrom === state.pickupTargetRank));
      if (toPickup && !state.pendingCard && !allowStageToEmptyPickup) return;
      if (toPickup && !fromCard) return;
      if (dFrom != null && fromCard && fromCard.rank !== dFrom) return;
      if (dTo != null && fromCard && fromCard.rank !== dTo) return;
      if (dTo != null && toCard && toCard.rank !== dTo) return;
      if (dFrom != null && toPickup && toCard && toCard.rank !== dFrom) return;
      if (dFrom != null && bTo != null && toCard && toCard.rank !== dFrom) return;
      setCardByZone(fromZoneId, toCard || null);
      setCardByZone(toZoneId, fromCard || null);
      syncPickupTargetRankAfterSwap(fromZoneId, toZoneId, fromCard, toCard);
      recalcCardPassives();
      renderCardModal();
    }
    function closeCardModal() {
      runLog.event(EVT_CARD_MODAL_CLOSE, "Card / inventory modal closed");
      state.inventoryModalOpen = false;
      state.pendingCard = null;
      state.cardPickupFlowActive = false;
      state.pickupTargetRank = null;
      state.pausedForCard = true;
      state.waitingForMovementResume = true;
      state.playerHeadstartUntil = state.elapsed + 0.3;
      renderCardModal();
    }
    function continueAfterLoadout() {
      runLog.event(EVT_CARD_LOADOUT_CONTINUE, "Player continued after card / loadout modal");
      state.pendingCard = null;
      closeCardModal();
    }
    function showSetBonusChoice() {
    }
    function outOfBoundsCircle(c) {
      return false;
    }
    function collidesAnyObstacle(circle) {
      for (const obstacle of obstacles) {
        if (intersectsRectCircle(circle, obstacle)) return true;
      }
      return false;
    }
    function collidesValiantEnemyShockField(circle) {
      for (const box of entities.valiantElectricBoxes) {
        if (state.elapsed >= box.expiresAt) continue;
        if (intersectsRectCircle(circle, box)) return true;
      }
      return false;
    }
    function isLunatic() {
      return selectedCharacter.id === "lunatic";
    }
    function isValiant() {
      return selectedCharacter.id === "valiant";
    }
    function valiantShockBoxScale() {
      if (inventory.diamondEmpower === "valiantBox" || diamondsOmniEmpowerActive()) return VALIANT_DIAMOND_BOX_SCALE;
      return 1;
    }
    function valiantFirstEmptySlot() {
      for (let i = 0; i < 3; i++) if (!state.valiantRabbitSlots[i]) return i;
      return -1;
    }
    function valiantLowestHpOccupiedSlot() {
      let best = -1;
      let bestHp = Infinity;
      for (let i = 0; i < 3; i++) {
        const s = state.valiantRabbitSlots[i];
        if (!s || s.hp <= 0) continue;
        if (best < 0 || s.hp < bestHp || s.hp === bestHp && i < best) {
          bestHp = s.hp;
          best = i;
        }
      }
      return best;
    }
    function valiantRandomOccupiedRabbitIndex() {
      const opts = [];
      for (let i = 0; i < 3; i++) {
        const s = state.valiantRabbitSlots[i];
        if (s && s.hp > 0) opts.push(i);
      }
      if (!opts.length) return -1;
      return opts[Math.floor(Math.random() * opts.length)];
    }
    function valiantRabbitAnchorWorld(slot) {
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
        { slot: 2, ox: -rdx * 19, oy: -rdy * 19 }
      ];
      const sp = spots.find((s) => s.slot === slot);
      if (!sp) return { x: px, y: py };
      return { x: px + sp.ox, y: py + sp.oy };
    }
    function valiantTriggerDeathFromWill() {
      if (!state.running) return;
      state.valiantWill = 0;
      player.hp = 0;
      state.running = false;
      state.deathCount += 1;
      if (deathSnapshotsEnabled) state.snapshotPending = true;
      state.deathStartedAtMs = state.lastTime;
      state.bestSurvival = Math.max(state.bestSurvival, runClockEffectiveSec());
    }
    function valiantApplyDamage(amount, opts = {}) {
      if (amount <= 0) return;
      const dmg = opts.surgeHexPulse ? 1 : amount;
      const idx = opts.surgeHexPulse ? valiantLowestHpOccupiedSlot() : valiantRandomOccupiedRabbitIndex();
      if (idx < 0) return;
      const slot = state.valiantRabbitSlots[idx];
      if (!slot) return;
      slot.hp -= dmg;
      if (opts.laserBlueSlow) {
        state.playerLaserSlowUntil = state.elapsed + LASER_BLUE_PLAYER_SLOW_SEC;
      }
      state.hurtFlash = 0.16;
      state.playerInvulnerableUntil = state.elapsed + 0.35;
      state.screenShakeUntil = state.elapsed + 0.18;
      state.screenShakeStrength = 8;
      entities.damageRipples.push({
        x: player.x,
        y: player.y,
        bornAt: state.elapsed,
        expiresAt: state.elapsed + 0.22
      });
      state.damageEvents.push({ t: state.elapsed, amount: dmg, hpAfter: Math.round(state.valiantWill * 100) });
      if (passive.stunOnHitSecs > 0) {
        for (const h of entities.hunters) {
          if (distSq(h, player) <= 220 * 220) h.stunnedUntil = Math.max(h.stunnedUntil || 0, state.elapsed + passive.stunOnHitSecs);
        }
      }
      if (slot.hp <= 0) {
        const { x: dax, y: day } = valiantRabbitAnchorWorld(idx);
        spawnValiantRabbitDeathFx(dax, day);
        triggerUltScreenShake(16, 0.26);
        state.valiantRabbitSlots[idx] = null;
        state.valiantWill = Math.max(0, state.valiantWill - VALIANT_WILL_RABBIT_DEATH_COST);
        spawnHealPopup(player.x, player.y - player.r - 14, "Rabbit lost", "#fca5a5", 0.85, 13);
        if (state.valiantWill <= 0) valiantTriggerDeathFromWill();
      }
    }
    function valiantOccupiedRabbitCount() {
      let n = 0;
      for (let i = 0; i < 3; i++) if (state.valiantRabbitSlots[i]) n++;
      return n;
    }
    function valiantWillNetChangePerSec() {
      const occ = valiantOccupiedRabbitCount();
      const drainAtZeroRabbits = 3 * VALIANT_WILL_DECAY_PER_EMPTY_SLOT;
      if (occ === 0) return -drainAtZeroRabbits;
      if (occ === 1) return -drainAtZeroRabbits / 2;
      if (occ === 2) return 0;
      return VALIANT_WILL_REGEN_PER_SEC_THREE_RABBITS;
    }
    function updateValiantWillDecay(simDt) {
      if (!isValiant() || !state.running) return;
      const netPerSec = valiantWillNetChangePerSec();
      state.valiantWill += netPerSec * simDt;
      state.valiantWill = Math.min(1, state.valiantWill);
      if (state.valiantWill <= 0) valiantTriggerDeathFromWill();
    }
    function spawnValiantWildBunny() {
      if (!isValiant()) return;
      const point = randomOpenPoint(VALIANT_BUNNY_PICKUP_R, 72, { excludeArenaNexus: true });
      entities.valiantBunnies.push({
        x: point.x,
        y: point.y,
        r: VALIANT_BUNNY_PICKUP_R,
        bornAt: state.elapsed,
        expiresAt: state.elapsed + 18
      });
    }
    function updateValiantBunnyPickups() {
      if (!isValiant()) return;
      for (let i = entities.valiantBunnies.length - 1; i >= 0; i--) {
        const b = entities.valiantBunnies[i];
        if (state.elapsed >= b.expiresAt) {
          entities.valiantBunnies.splice(i, 1);
          continue;
        }
        const slot = valiantFirstEmptySlot();
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
    function placeValiantShockField() {
      const scale = valiantShockBoxScale();
      const w = VALIANT_SHOCK_BOX_W * scale;
      const h = VALIANT_SHOCK_BOX_H * scale;
      const cx = player.x;
      const cy = player.y;
      entities.valiantElectricBoxes.push({
        x: cx - w / 2,
        y: cy - h / 2,
        w,
        h,
        expiresAt: state.elapsed + VALIANT_SHOCK_BOX_DURATION_SEC
      });
      spawnAttackRing(cx, cy, Math.max(w, h) * 0.55, "#38bdf8", 0.28);
      spawnAttackRing(cx, cy, Math.max(w, h) * 0.38, "#bae6fd", 0.22);
    }
    function drawValiantShockFields(ctx2) {
      const t = state.elapsed;
      for (const box of entities.valiantElectricBoxes) {
        if (state.elapsed >= box.expiresAt) continue;
        const { x, y, w, h } = box;
        const cs = Math.min(28, w * 0.11, h * 0.11);
        ctx2.save();
        ctx2.fillStyle = "rgba(15, 23, 42, 0.94)";
        ctx2.fillRect(x, y, cs, cs);
        ctx2.fillRect(x + w - cs, y, cs, cs);
        ctx2.fillRect(x + w - cs, y + h - cs, cs, cs);
        ctx2.fillRect(x, y + h - cs, cs, cs);
        const inset = cs * 0.32;
        const ix = x + inset;
        const iy = y + inset;
        const iw = w - inset * 2;
        const ih = h - inset * 2;
        const flicker = 0.55 + 0.45 * Math.sin(t * 19 + x * 0.015);
        ctx2.strokeStyle = `rgba(56, 189, 248, ${0.52 * flicker})`;
        ctx2.lineWidth = 3.2;
        ctx2.shadowColor = "rgba(56, 189, 248, 0.65)";
        ctx2.shadowBlur = 16;
        ctx2.setLineDash([8, 5]);
        ctx2.lineDashOffset = -t * 52;
        ctx2.strokeRect(ix, iy, iw, ih);
        ctx2.setLineDash([]);
        ctx2.shadowBlur = 0;
        ctx2.strokeStyle = `rgba(147, 197, 253, ${0.45 + 0.4 * Math.sin(t * 24 + y * 0.018)})`;
        ctx2.lineWidth = 1.4;
        ctx2.beginPath();
        const jx = 0.18 + 0.08 * Math.sin(t * 31);
        ctx2.moveTo(ix + iw * jx, iy);
        ctx2.lineTo(ix + iw * jx, iy + ih);
        ctx2.moveTo(ix + iw * (1 - jx), iy);
        ctx2.lineTo(ix + iw * (1 - jx), iy + ih);
        ctx2.moveTo(ix, iy + ih * jx);
        ctx2.lineTo(ix + iw, iy + ih * jx);
        ctx2.moveTo(ix, iy + ih * (1 - jx));
        ctx2.lineTo(ix + iw, iy + ih * (1 - jx));
        ctx2.stroke();
        ctx2.strokeStyle = `rgba(253, 224, 71, ${0.22 + 0.18 * flicker})`;
        ctx2.lineWidth = 1;
        ctx2.strokeRect(x + 1, y + 1, w - 2, h - 2);
        ctx2.restore();
      }
    }
    function spawnValiantRescueFx(x, y) {
      if (!isValiant()) return;
      entities.valiantRabbitFx.push({
        kind: "rescue",
        x,
        y,
        bornAt: state.elapsed,
        expiresAt: state.elapsed + 0.92
      });
    }
    function spawnValiantRabbitDeathFx(x, y) {
      if (!isValiant()) return;
      const n = 11;
      const angles = [];
      for (let i = 0; i < n; i++) angles.push(i / n * TAU + rand(-0.22, 0.22));
      entities.valiantRabbitFx.push({
        kind: "rabbitDeath",
        x,
        y,
        angles,
        bornAt: state.elapsed,
        expiresAt: state.elapsed + 0.52
      });
    }
    function drawValiantRabbitFx(ctx2) {
      if (!isValiant()) return;
      for (const fx of entities.valiantRabbitFx) {
        const u = clamp((state.elapsed - fx.bornAt) / Math.max(1e-3, fx.expiresAt - fx.bornAt), 0, 1);
        if (fx.kind === "rescue") {
          const { x, y } = fx;
          const riseEnd = 0.42;
          if (u < riseEnd) {
            const u1 = u / riseEnd;
            ctx2.save();
            const beamH = 22 + u1 * 118;
            const grad = ctx2.createLinearGradient(x, y + 24, x, y - beamH);
            grad.addColorStop(0, "rgba(254, 243, 199, 0)");
            grad.addColorStop(0.28, "rgba(253, 224, 71, 0.28)");
            grad.addColorStop(0.62, "rgba(255, 255, 255, 0.5)");
            grad.addColorStop(1, "rgba(255, 255, 255, 0.12)");
            ctx2.fillStyle = grad;
            const wv = 11 + u1 * 16;
            ctx2.beginPath();
            ctx2.moveTo(x - wv * 0.5, y + 24);
            ctx2.lineTo(x + wv * 0.5, y + 24);
            ctx2.lineTo(x + wv * 0.2, y - beamH);
            ctx2.lineTo(x - wv * 0.2, y - beamH);
            ctx2.closePath();
            ctx2.fill();
            ctx2.fillStyle = `rgba(254, 252, 232, ${0.32 * (1 - u1 * 0.25)})`;
            ctx2.fillRect(x - 3.5, y - beamH * u1, 7, beamH * u1 + 22);
            const ry = y - 10 - 36 * u1;
            const br = 5.5;
            ctx2.fillStyle = "#fecdd3";
            ctx2.beginPath();
            ctx2.arc(x, ry, br, 0, TAU);
            ctx2.fill();
            ctx2.strokeStyle = "rgba(157, 23, 77, 0.78)";
            ctx2.lineWidth = 1.15;
            ctx2.stroke();
            ctx2.restore();
          } else {
            const u2 = (u - riseEnd) / (1 - riseEnd);
            const ease = u2 * u2;
            const br = 5.5 * (1 - ease * 0.88);
            const rx = x + 78 * ease * ease + Math.sin(u2 * Math.PI * 2.5) * 5;
            const ry = y - 46 - 128 * ease - 18 * Math.sin(u2 * Math.PI);
            const fade = 1 - ease;
            ctx2.save();
            ctx2.globalAlpha = 0.4 * fade;
            ctx2.strokeStyle = "rgba(253, 230, 138, 0.95)";
            ctx2.lineWidth = 2;
            for (let k = 0; k < 5; k++) {
              const lag = k * 0.07;
              const lk = clamp(u2 - lag, 0, 1);
              const sx = x + 62 * lk * lk;
              const sy = y - 46 - 102 * lk * lk;
              ctx2.beginPath();
              ctx2.moveTo(rx, ry);
              ctx2.lineTo(sx, sy);
              ctx2.stroke();
            }
            ctx2.globalAlpha = fade;
            ctx2.fillStyle = "#fecdd3";
            ctx2.beginPath();
            ctx2.arc(rx, ry, Math.max(1.5, br), 0, TAU);
            ctx2.fill();
            ctx2.strokeStyle = "rgba(251, 191, 36, 0.6)";
            ctx2.lineWidth = 1.2;
            ctx2.stroke();
            ctx2.restore();
          }
        } else if (fx.kind === "rabbitDeath") {
          const { x, y, angles } = fx;
          const fade = (1 - u) * (1 - u);
          const splurt = Math.sin(u * Math.PI);
          ctx2.save();
          ctx2.globalAlpha = 0.9 * fade;
          for (let i = 0; i < angles.length; i++) {
            const ang = angles[i];
            const len = 7 + splurt * (24 + i % 4 * 5);
            ctx2.strokeStyle = i % 2 === 0 ? "rgba(185, 28, 28, 0.95)" : "rgba(127, 29, 29, 0.88)";
            ctx2.lineWidth = 1.8 + i % 3 * 0.45;
            ctx2.beginPath();
            ctx2.moveTo(x, y);
            ctx2.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
            ctx2.stroke();
          }
          ctx2.globalAlpha = 0.45 * (1 - u);
          ctx2.fillStyle = "rgba(153, 27, 27, 0.9)";
          ctx2.beginPath();
          ctx2.ellipse(x, y + 3, 11 * (0.45 + u * 0.55), 5 * (0.4 + u * 0.35), 0, 0, TAU);
          ctx2.fill();
          ctx2.restore();
        }
      }
    }
    function startValiantRescueCooldownFromNow() {
      if (!isValiant()) return;
      const rescueCd = effectiveAbilityCooldown("decoy", VALIANT_RESCUE_COOLDOWN_SEC, 0.5);
      state.valiantRescueReadyAt = state.elapsed + rescueCd;
      abilities.decoy.nextReadyAt = state.elapsed + rescueCd;
    }
    function updateValiantRescueCooldownWhenNoRabbits() {
      if (!isValiant() || !state.running) return;
      if (valiantOccupiedRabbitCount() === 0) startValiantRescueCooldownFromNow();
    }
    function tryValiantRescueRabbit() {
      if (state.elapsed < state.valiantRescueReadyAt || !state.running) return;
      const slot = valiantLowestHpOccupiedSlot();
      if (slot < 0) return;
      const anchor = valiantRabbitAnchorWorld(slot);
      state.valiantRabbitSlots[slot] = null;
      startValiantRescueCooldownFromNow();
      let willBump = VALIANT_RESCUE_WILL_RESTORE;
      if (inventory.diamondEmpower === "valiantRescue" || diamondsOmniEmpowerActive()) willBump += VALIANT_DIAMOND_RESCUE_WILL_BONUS;
      state.valiantWill = Math.min(1, state.valiantWill + willBump);
      spawnValiantRescueFx(anchor.x, anchor.y);
      spawnHealPopup(player.x, player.y - player.r - 12, "To safety", "#a5b4fc", 0.9, 14);
      spawnAttackRing(player.x, player.y, player.r + 24, "#818cf8", 0.25);
    }
    function lunaticSprintDamageImmune() {
      if (!isLunatic()) return false;
      return state.lunaticPhase === "sprint" || state.lunaticPhase === "decel";
    }
    function lunaticSprintSpeedMultFromMomentum(m) {
      return LUNATIC_STUMBLE_MOVE_MULT + (LUNATIC_SPRINT_PEAK_SPEED_MULT - LUNATIC_STUMBLE_MOVE_MULT) * m;
    }
    function removeObstaclesIntersectingPlayerCircle() {
      const c = { x: player.x, y: player.y, r: player.r };
      for (let i = obstacles.length - 1; i >= 0; i--) {
        if (intersectsRectCircle(c, obstacles[i])) obstacles.splice(i, 1);
      }
    }
    function lunaticCrashDamageFromSprintDur() {
      const d = Math.max(0, state.elapsed - state.lunaticSprintStartedAt);
      if (d <= LUNATIC_CRASH_DAMAGE_BRACKET_1_SEC) return LUNATIC_CRASH_DAMAGE_TIER_1;
      if (d <= LUNATIC_CRASH_DAMAGE_BRACKET_2_SEC) return LUNATIC_CRASH_DAMAGE_TIER_2;
      return LUNATIC_CRASH_DAMAGE_TIER_3;
    }
    function lunaticApplyCrashFromObstacle() {
      damagePlayer(lunaticCrashDamageFromSprintDur(), { lunaticCrash: true });
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
    function tryLunaticWToggle() {
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
        const sprintDur = Math.max(0, state.elapsed - state.lunaticSprintStartedAt);
        const decelScale = clamp(sprintDur / Math.max(1e-4, LUNATIC_DECEL_SPRINT_REF_SEC), 0, 1);
        const decelDur = LUNATIC_DECEL_SEC * decelScale;
        state.lunaticPhase = "decel";
        state.lunaticDecelStartAt = state.elapsed;
        state.lunaticDecelEndAt = state.elapsed + decelDur;
        state.lunaticPressSprintUnlockAt = state.elapsed + LUNATIC_W_TOGGLE_COOLDOWN_SEC;
        return;
      }
    }
    function tryLunaticRoar() {
      if (!state.running || !isLunatic()) return;
      if (state.elapsed < state.lunaticRoarReadyAt) return;
      if (state.lunaticPhase !== "sprint") return;
      state.lunaticRoarUntil = state.elapsed + LUNATIC_ROAR_DURATION_SEC;
      state.lunaticRoarReadyAt = state.elapsed + LUNATIC_ROAR_COOLDOWN_SEC;
      state.lunaticRoarTerrainDmgBank = 0;
      spawnAttackRing(player.x, player.y, player.r + 24, "#ef4444", 0.35);
    }
    function lunaticTickRoarTerrain(simDt) {
      if (!isLunatic() || state.elapsed >= state.lunaticRoarUntil) return;
      if (!collidesAnyObstacle({ x: player.x, y: player.y, r: player.r })) return;
      state.lunaticRoarTerrainDmgBank += simDt;
      while (state.lunaticRoarTerrainDmgBank >= LUNATIC_ROAR_TERRAIN_DAMAGE_INTERVAL_SEC) {
        state.lunaticRoarTerrainDmgBank -= LUNATIC_ROAR_TERRAIN_DAMAGE_INTERVAL_SEC;
        damagePlayer(LUNATIC_ROAR_TERRAIN_DAMAGE, { lunaticRoarTerrain: true });
      }
      removeObstaclesIntersectingPlayerCircle();
    }
    function updateLunaticMovement(dt, simDt) {
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
          const mlen2 = Math.hypot(mx, my);
          player.facing.x = mx / mlen2;
          player.facing.y = my / mlen2;
        }
        const laserSlowMult2 = state.elapsed < state.playerLaserSlowUntil ? LASER_BLUE_PLAYER_SLOW_MULT : 1;
        const effectiveSpeed = player.speed * playerSpeedHealthMultiplier() * laserSlowMult2 * LUNATIC_STUMBLE_MOVE_MULT;
        const mlen = Math.hypot(mx, my) || 1;
        return moveCircleWithCollisions(player, mx / mlen * effectiveSpeed, my / mlen * effectiveSpeed, dt, {});
      }
      let speedMult = 1;
      if (state.lunaticPhase === "sprint") {
        state.lunaticMomentum = Math.min(
          1,
          state.lunaticMomentum + simDt / Math.max(1e-4, LUNATIC_SPRINT_MOMENTUM_RAMP_SEC)
        );
        speedMult = lunaticSprintSpeedMultFromMomentum(state.lunaticMomentum);
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
        const u = clamp(1 - (state.lunaticDecelEndAt - state.elapsed) / decelTotal, 0, 1);
        const peak = lunaticSprintSpeedMultFromMomentum(state.lunaticMomentum);
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
        lunaticApplyCrashFromObstacle();
        return { touchedObstacle: true };
      }
      return moveRes;
    }
    function ejectPlayerFromObstaclesIfStuck() {
      const c = { x: player.x, y: player.y, r: player.r };
      if (!collidesAnyObstacle(c)) return;
      const STEP = 3;
      const ANGLES = 28;
      const MAX_R = 220;
      for (let rad = STEP; rad <= MAX_R; rad += STEP) {
        for (let i = 0; i < ANGLES; i++) {
          const ang = i / ANGLES * TAU;
          const cand = { x: player.x + Math.cos(ang) * rad, y: player.y + Math.sin(ang) * rad, r: player.r };
          if (!collidesAnyObstacle(cand)) {
            player.x = cand.x;
            player.y = cand.y;
            return;
          }
        }
      }
    }
    function isPointNearTerrain(x, y, extraRadius = 40) {
      const rr = extraRadius * extraRadius;
      for (const obstacle of obstacles) {
        const cx = clamp(x, obstacle.x, obstacle.x + obstacle.w);
        const cy = clamp(y, obstacle.y, obstacle.y + obstacle.h);
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= rr) return true;
      }
      return false;
    }
    function nearestTerrainInfo(x, y) {
      let bestDist = Infinity;
      let bestPoint = null;
      for (const obstacle of obstacles) {
        const cx = clamp(x, obstacle.x, obstacle.x + obstacle.w);
        const cy = clamp(y, obstacle.y, obstacle.y + obstacle.h);
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
    function playerInsideSmoke() {
      for (const smoke of entities.smokeZones) {
        if (state.elapsed >= smoke.expiresAt) continue;
        const dx = player.x - smoke.x;
        const dy = player.y - smoke.y;
        if (dx * dx + dy * dy <= smoke.r * smoke.r) return true;
      }
      return false;
    }
    function isPlayerHuggingTerrain(margin = 20) {
      const probe = { x: player.x, y: player.y, r: player.r + margin };
      for (const obstacle of obstacles) {
        if (intersectsRectCircle(probe, obstacle)) return true;
      }
      return false;
    }
    function pointToSegmentDistanceSq(px, py, x1, y1, x2, y2) {
      const vx = x2 - x1;
      const vy = y2 - y1;
      const wx = px - x1;
      const wy = py - y1;
      const c1 = vx * wx + vy * wy;
      if (c1 <= 0) return (px - x1) ** 2 + (py - y1) ** 2;
      const c2 = vx * vx + vy * vy;
      if (c2 <= c1) return (px - x2) ** 2 + (py - y2) ** 2;
      const b = c1 / c2;
      const bx = x1 + b * vx;
      const by = y1 + b * vy;
      return (px - bx) ** 2 + (py - by) ** 2;
    }
    function segmentIntersectsSmoke(x1, y1, x2, y2) {
      for (const smoke of entities.smokeZones) {
        if (state.elapsed >= smoke.expiresAt) continue;
        const d2 = pointToSegmentDistanceSq(smoke.x, smoke.y, x1, y1, x2, y2);
        if (d2 <= smoke.r * smoke.r) return true;
      }
      return false;
    }
    function lineIntersectsRect2(x1, y1, x2, y2, rect) {
      const steps = Math.max(6, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 12));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;
        if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return true;
      }
      return false;
    }
    function hasLineOfSight(from, target, opts = {}) {
      const ignoreObstacles = !!opts.ignoreObstacles;
      if (segmentIntersectsSmoke(from.x, from.y, target.x, target.y)) return false;
      for (let s = 0; s <= 20; s++) {
        const u = s / 20;
        const sx = from.x + (target.x - from.x) * u;
        const sy = from.y + (target.y - from.y) * u;
        if (barrierDiskBlocksWorldPoint(sx, sy)) return false;
      }
      if (!ignoreObstacles) {
        for (const obstacle of obstacles) {
          if (lineIntersectsRect2(from.x, from.y, target.x, target.y, obstacle)) return false;
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
        if (hasAnyRouletteHexSite() && isWorldPointOnRouletteHexTile(px, py)) {
          return { x: lastX, y: lastY };
        }
        if (isWorldPointOnSurgeLockBarrierTile(px, py)) {
          return { x: lastX, y: lastY };
        }
        if (barrierDiskBlocksWorldPoint(px, py)) {
          return { x: lastX, y: lastY };
        }
        if (!throughObstacles) {
          for (const obstacle of obstacles) {
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
    function sniperArtillerySuppressedByRoulette(sniperX, sniperY, aimX, aimY) {
      if (isWorldPointOnSurgeLockBarrierTile(aimX, aimY)) return true;
      if (barrierDiskBlocksWorldPoint(aimX, aimY)) return true;
      for (let s = 0; s <= 28; s++) {
        const u = s / 28;
        const sx = sniperX + (aimX - sniperX) * u;
        const sy = sniperY + (aimY - sniperY) * u;
        if (isWorldPointOnSurgeLockBarrierTile(sx, sy)) return true;
        if (barrierDiskBlocksWorldPoint(sx, sy)) return true;
      }
      if (!hasAnyRouletteHexSite()) return false;
      if (isWorldPointOnRouletteHexTile(aimX, aimY)) return true;
      for (let s = 0; s <= 28; s++) {
        const u = s / 28;
        const sx = sniperX + (aimX - sniperX) * u;
        const sy = sniperY + (aimY - sniperY) * u;
        if (isWorldPointOnRouletteHexTile(sx, sy)) return true;
      }
      return false;
    }
    function hitDecoyAlongSegment(ax, ay, bx, by, extraRadius = 0) {
      for (let i = entities.decoys.length - 1; i >= 0; i--) {
        const d = entities.decoys[i];
        const hitDist = pointToSegmentDistance(d.x, d.y, ax, ay, bx, by);
        if (hitDist <= d.r + extraRadius) {
          if (state.elapsed < d.invulnerableUntil) return true;
          d.hp -= 1;
          if (d.hp <= 0) entities.decoys.splice(i, 1);
          return true;
        }
      }
      return false;
    }
    function moveCircleWithCollisions(entity, vx, vy, dt, opts = {}) {
      const ignoreObstacles = !!opts.ignoreObstacles;
      const blockValiantShock = !!opts.blockValiantEnemyShockFields;
      let touchedObstacle = false;
      const nx = { x: entity.x + vx * dt, y: entity.y, r: entity.r };
      const nxBlocked = outOfBoundsCircle(nx) || !ignoreObstacles && collidesAnyObstacle(nx) || blockValiantShock && collidesValiantEnemyShockField(nx);
      if (!nxBlocked) entity.x = nx.x;
      else if (!ignoreObstacles) touchedObstacle = true;
      const ny = { x: entity.x, y: entity.y + vy * dt, r: entity.r };
      const nyBlocked = outOfBoundsCircle(ny) || !ignoreObstacles && collidesAnyObstacle(ny) || blockValiantShock && collidesValiantEnemyShockField(ny);
      if (!nyBlocked) entity.y = ny.y;
      else if (!ignoreObstacles) touchedObstacle = true;
      return { touchedObstacle };
    }
    function updatePlayerVelocity(dt) {
      const pdt = Math.max(dt, 1e-5);
      const ix = (player.x - player._px) / pdt;
      const iy = (player.y - player._py) / pdt;
      player.velX = player.velX * 0.38 + ix * 0.62;
      player.velY = player.velY * 0.38 + iy * 0.62;
      player._px = player.x;
      player._py = player.y;
    }
    function separatedFromExistingLoot(x, y, r, minGap = 68) {
      for (const p of entities.pickups) {
        if (Math.hypot(p.x - x, p.y - y) < p.r + r + minGap) return false;
      }
      for (const c of entities.cards) {
        if (Math.hypot(c.x - x, c.y - y) < c.r + r + minGap) return false;
      }
      return true;
    }
    function spawnLootPointClear(candidate) {
      if (collidesAnyObstacle(candidate)) return false;
      if (!separatedFromExistingLoot(candidate.x, candidate.y, candidate.r)) return false;
      const rr = candidate.r + player.r + 44;
      if (distSq(candidate, player) <= rr * rr) return false;
      return true;
    }
    function randomOpenPoint(radius, attempts = 96, opts = {}) {
      const excludeArenaNexus = !!opts.excludeArenaNexus;
      const excludeSpecialSpawnerHex = !!opts.excludeSpecialSpawnerHex;
      const excludeHexKey = typeof opts.excludeHexKey === "string" && opts.excludeHexKey ? opts.excludeHexKey : null;
      const dMin = 96 + radius;
      const dMax = Math.min(VIEW_W, VIEW_H) * 0.66;
      const sourceHexes = activeHexes.length ? activeHexes : [{ q: 0, r: 0 }];
      function isOnExcludedHex(x, y) {
        if (!excludeHexKey) return false;
        const h = worldToHex(x, y);
        return hexKey(h.q, h.r) === excludeHexKey;
      }
      function lootPointUsable(candidate) {
        if (excludeArenaNexus && isWorldPointOnSpecialLootForbiddenHex(candidate.x, candidate.y)) return false;
        if (excludeSpecialSpawnerHex && isWorldPointOnSpecialSpawnerForbiddenHex(candidate.x, candidate.y)) return false;
        if (isOnExcludedHex(candidate.x, candidate.y)) return false;
        return spawnLootPointClear(candidate);
      }
      for (let i = 0; i < attempts; i++) {
        let candidate;
        if (i % 2 === 0) {
          const ang = Math.random() * TAU;
          const d = rand(dMin, dMax);
          candidate = {
            x: player.x + Math.cos(ang) * d,
            y: player.y + Math.sin(ang) * d,
            r: radius
          };
        } else {
          const h = sourceHexes[Math.floor(Math.random() * sourceHexes.length)];
          const c = hexToWorld(h.q, h.r);
          candidate = {
            x: c.x + rand(-TILE_W * 0.46, TILE_W * 0.46),
            y: c.y + rand(-TILE_W * 0.46, TILE_W * 0.46),
            r: radius
          };
        }
        if (lootPointUsable(candidate)) return candidate;
      }
      for (let j = 0; j < 40; j++) {
        const ang = Math.random() * TAU;
        const d = rand(dMin, dMax * 0.92);
        const candidate = { x: player.x + Math.cos(ang) * d, y: player.y + Math.sin(ang) * d, r: radius };
        if (excludeArenaNexus && isWorldPointOnSpecialLootForbiddenHex(candidate.x, candidate.y)) continue;
        if (excludeSpecialSpawnerHex && isWorldPointOnSpecialSpawnerForbiddenHex(candidate.x, candidate.y)) continue;
        if (isOnExcludedHex(candidate.x, candidate.y)) continue;
        if (!collidesAnyObstacle(candidate)) return candidate;
      }
      for (let k = 0; k < 24; k++) {
        const candidate = { x: player.x + rand(-280, 280), y: player.y + rand(-280, 280), r: radius };
        if (excludeArenaNexus && isWorldPointOnSpecialLootForbiddenHex(candidate.x, candidate.y)) continue;
        if (excludeSpecialSpawnerHex && isWorldPointOnSpecialSpawnerForbiddenHex(candidate.x, candidate.y)) continue;
        if (isOnExcludedHex(candidate.x, candidate.y)) continue;
        if (!collidesAnyObstacle(candidate)) return candidate;
      }
      for (let f = 0; f < 32; f++) {
        const p = { x: player.x + rand(-140, 140), y: player.y + rand(-140, 140), r: radius };
        if (excludeArenaNexus && isWorldPointOnSpecialLootForbiddenHex(p.x, p.y)) continue;
        if (excludeSpecialSpawnerHex && isWorldPointOnSpecialSpawnerForbiddenHex(p.x, p.y)) continue;
        if (isOnExcludedHex(p.x, p.y)) continue;
        return p;
      }
      for (let z = 0; z < 24; z++) {
        const p = { x: player.x + rand(-100, 100), y: player.y + rand(-100, 100), r: radius };
        if (!isOnExcludedHex(p.x, p.y)) return p;
      }
      return { x: player.x + rand(-100, 100), y: player.y + rand(-100, 100), r: radius };
    }
    function randomOpenPointAround(cx, cy, radiusMin, radiusMax, r, attempts = 40, opts = {}) {
      const excludeSpecialHex = !!opts.excludeSpecialHex;
      for (let i = 0; i < attempts; i++) {
        const ang = Math.random() * TAU;
        const d = rand(radiusMin, radiusMax);
        const candidate = { x: cx + Math.cos(ang) * d, y: cy + Math.sin(ang) * d, r };
        if (excludeSpecialHex && isWorldPointOnSpecialSpawnerForbiddenHex(candidate.x, candidate.y)) continue;
        if (outOfBoundsCircle(candidate)) continue;
        if (!collidesAnyObstacle(candidate)) return candidate;
      }
      return {
        x: cx,
        y: cy,
        r
      };
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
          const ang = i / ANGLES * TAU;
          const cand = { x: cx + Math.cos(ang) * rad, y: cy + Math.sin(ang) * rad, r };
          if (!outOfBoundsCircle(cand) && !collidesAnyObstacle(cand) && !isWorldPointOnSpecialSpawnerForbiddenHex(cand.x, cand.y)) {
            return cand;
          }
        }
      }
      return randomOpenPoint(r, 96, { excludeSpecialSpawnerHex: true });
    }
    function resolveFastSpawnNearAirSpawner(h, fastR) {
      const ideal = randomOpenPointAround(h.x, h.y, h.r + 12, h.r + 40, fastR, 56, { excludeSpecialHex: true });
      return nearestLegalPointForSmallHunter(ideal.x, ideal.y, fastR);
    }
    function selectCharacter(id) {
      const picked = CHARACTERS[id];
      if (!picked) return;
      selectedCharacter = picked;
      abilities = makeAbilitiesForCharacter(selectedCharacter);
      passive.cooldownFlat = makeCooldownFlatForCharacter(selectedCharacter);
      passive.cooldownPct = makeCooldownPctForCharacter(selectedCharacter);
      refreshControlsHint();
    }
    function formatControlsHintLine() {
      if (selectedCharacter.id === "rogue") {
        return "Move: Arrows | Abilities: Q dash, W smoke bomb, E point to food | Pause: Space | Retry: R (character select)";
      }
      if (selectedCharacter.id === "valiant") {
        return "Move: Arrows | Abilities: Q Surge, W shock field (enemies), E Rescue, R Ultimate (Ace slot) | Pause: Space | Retry: R (character select)";
      }
      if (selectedCharacter.id === "lunatic") {
        return "Move: Arrows (stumble) | Sprint: W \u2014 hold Q or Left to curve left, E or Right to curve right | R roar (sprint only) | Pause: Space | Retry: R (character select)";
      }
      return "Move: Arrows | Abilities: Q dash, W speed burst, E decoy | Pause: Space | Retry: R (character select)";
    }
    function refreshControlsHint() {
      if (controlsHintEl) controlsHintEl.textContent = formatControlsHintLine();
    }
    function startGameWithCharacter(id) {
      runLog.event(EVT_GAME_START, "Run started with character", { characterId: id });
      selectCharacter(id);
      gameStarted = true;
      syncSpecialTestWestPanelLock();
      if (characterSelectModal) characterSelectModal.classList.remove("open");
      resetGame();
    }
    function characterTutorialHtml(id) {
      const k = CHARACTERS.knight.abilities;
      const r = CHARACTERS.rogue.abilities;
      const l = CHARACTERS.lunatic.abilities;
      const v = CHARACTERS.valiant.abilities;
      if (id === "knight") {
        return `
      <p class="character-detail-lead">The <strong>Knight</strong> is a sturdy all-rounder: forgiving HP and a simple rhythm for learning waves, spacing, and how the arena moves.</p>
      <ul>
        <li><strong>Q \u2014 ${k.dash.label}:</strong> quick dart through gaps to slip out of pressure.</li>
        <li><strong>W \u2014 ${k.burst.label}:</strong> short speed surge that shoves hunters aside\u2014break chokes or sprint to safety.</li>
        <li><strong>E \u2014 ${k.decoy.label}:</strong> drops a lure so hunters fixate elsewhere while you reposition.</li>
      </ul>
      <p class="character-detail-lead" style="margin-top:10px">Pause: Space \xB7 Retry: R returns to character select.</p>
    `;
      }
      if (id === "rogue") {
        return `
      <p class="character-detail-lead">The <strong>Hungry Rogue</strong> is always hungry and dies if he is not fed. Chase food across the arena to stay alive.</p>
      <ul>
        <li><strong>Passive:</strong> when you break line of sight on pursuers, you can enter stealth. Hug a wall while stealthed and you can stay hidden even across open sightlines\u2014use corners and cover to slip past danger.</li>
        <li><strong>Q \u2014 ${r.dash.label}:</strong> hold to aim a direction, release to snap forward in a quick dash\u2014your main burst of movement to dodge shots, round corners, or close distance.</li>
        <li><strong>W \u2014 ${r.burst.label}:</strong> throws a smoke bomb that leaves a lingering cloud\u2014fight inside it or chain it with walls to control where you are visible.</li>
        <li><strong>E \u2014 ${r.decoy.label}:</strong> for a short window, on-screen cues point toward nearby food\u2014use it when you are low and need to find the next bite fast.</li>
      </ul>
      <p class="character-detail-lead" style="margin-top:10px">The top-left <strong>Fed</strong> bar and the arcs around your hero show hunger and stealth grace. Pause: Space \xB7 Retry: R returns to character select.</p>
    `;
      }
      if (id === "valiant") {
        return `
      <p class="character-detail-lead">The <strong>Valiant</strong> is a guardian robot: your body ignores HP damage, but <strong>Will to live</strong> drains when you are short on companions\u2014fastest with no rabbits, half pace with one, steady with two, and it slowly climbs again when all three slots are filled. <strong>Wild rabbits</strong> appear on the map as pickups\u2014walk over them to tuck one into the first free slot (left, right, back). Each rabbit has a few HP; when one dies, you lose a chunk of Will.</p>
      <ul>
        <li><strong>Q \u2014 ${v.dash.label}:</strong> short speed surge (like a classic burst)\u2014pair with Clubs for phase-through terrain while it is active.</li>
        <li><strong>W \u2014 ${v.burst.label}:</strong> a large crackling perimeter with heavy corner posts; it only <strong>blocks enemies</strong> (you and projectiles pass through).</li>
        <li><strong>E \u2014 ${v.decoy.label}:</strong> sends your <strong>lowest current HP</strong> equipped rabbit to safety, freeing its slot and restoring a large chunk of Will (about 40%; long cooldown). With no rabbits equipped, Rescue stays locked on full cooldown until you have at least one again. Diamonds can add extra Will on use.</li>
        <li><strong>R \u2014 ${v.random.label}:</strong> same as other heroes\u2014the <strong>Ace</strong> in your rank deck sets which ultimate you get (shield ring, timelock, push waves, or vitality).</li>
      </ul>
      <p class="character-detail-lead" style="margin-top:10px">Hearts cards split bonus HP across rabbits; Spades face cards grant an extra shock-field charge. Pause: Space \xB7 Retry: R returns to character select.</p>
    `;
      }
      if (id === "lunatic") {
        return `
      <p class="character-detail-lead">The <strong>Lunatic</strong> cannot collect cards and does not roll procedural arena specials\u2014only sanctuaries appear. Sanctuaries still offer a level-up, but the inner roulette and forge do not appear. Health crystals raise your <strong>max HP</strong> instead of healing.</p>
      <ul>
        <li><strong>Passive:</strong> slow health regeneration (similar to a hearts set bonus).</li>
        <li><strong>W \u2014 ${l.burst.label}:</strong> toggle sprinting charge vs stumbling on foot. Each direction has its own short lockout. Releasing sprint runs a short deceleration whose length scales with how long you were sprinting (none at a tap, up to the full window after about five seconds). Slamming terrain while sprinting stuns you; crash damage scales with sprint time (1 / 2 / 3 for up to two seconds, up to four seconds, then above that) with a clear impact flash.</li>
        <li><strong>Q / E \u2014 ${l.dash.label} / ${l.decoy.label}:</strong> while sprinting (or decelerating from a stop), hold to curve \u2014 same as <strong>Left / Right arrow</strong>. Turn rate follows a minimum turning circle (tighter at lower speed).</li>
        <li><strong>R \u2014 ${l.random.label}:</strong> 30s cooldown, sprint-only: briefly surge faster; terrain you touch is torn away, but staying inside it still ticks heavy damage.</li>
      </ul>
      <p class="character-detail-lead" style="margin-top:10px">Pause: Space \xB7 After death, <strong>R</strong> returns to character select.</p>
    `;
      }
      return "";
    }
    function wireCharacterSelect() {
      if (!characterSelectModal || !characterSelectOptions?.length) {
        afterDeathRetry = () => {
          resetGame();
          gameStarted = true;
        };
        startGameWithCharacter("knight");
        return;
      }
      const flowPickEl = characterSelectModal.querySelector("#character-select-flow-pick");
      const howtoPanelEl = characterSelectModal.querySelector("#character-select-howto-panel");
      const howtoOpenBtn = characterSelectModal.querySelector("#character-how-to-play-button");
      const howtoBackBtn = characterSelectModal.querySelector("#character-howto-back-button");
      const pick = characterSelectModal.querySelector("#character-select-pick");
      const confirm = characterSelectModal.querySelector("#character-select-confirm");
      const detailEl = characterSelectModal.querySelector("#character-detail");
      const confirmBtn = characterSelectModal.querySelector("#character-confirm-button");
      const backBtn = characterSelectModal.querySelector("#character-back-button");
      const titleEl = characterSelectModal.querySelector("#character-confirm-title");
      let pendingCharacterId = null;
      function showPick() {
        pendingCharacterId = null;
        if (flowPickEl) flowPickEl.hidden = false;
        if (howtoPanelEl) howtoPanelEl.hidden = true;
        if (confirm) confirm.hidden = true;
      }
      function showHowToPlay() {
        runLog.event(EVT_CHARACTER_HOWTO_OPEN, "Character select: opened How to play");
        if (flowPickEl) flowPickEl.hidden = true;
        if (howtoPanelEl) howtoPanelEl.hidden = false;
        if (confirm) confirm.hidden = true;
        if (howtoBackBtn) howtoBackBtn.focus();
      }
      function showConfirm(id) {
        const ch = CHARACTERS[id];
        if (!ch) return;
        if (!pick || !confirm || !detailEl || !titleEl) {
          startGameWithCharacter(id);
          return;
        }
        pendingCharacterId = id;
        titleEl.textContent = `Confirm \u2014 ${ch.name}`;
        detailEl.innerHTML = characterTutorialHtml(id);
        if (flowPickEl) flowPickEl.hidden = true;
        if (howtoPanelEl) howtoPanelEl.hidden = true;
        confirm.hidden = false;
        if (confirmBtn) confirmBtn.focus();
      }
      characterSelectModal.classList.add("open");
      if (pick && confirm && detailEl && titleEl && confirmBtn && backBtn) {
        showPick();
        for (const btn of characterSelectOptions) {
          btn.addEventListener("click", () => {
            const id = btn.dataset.characterId || "knight";
            runLog.event(EVT_CHARACTER_SELECTED, "Character select: chose hero", { characterId: id });
            showConfirm(id);
          });
        }
        confirmBtn.addEventListener("click", () => {
          if (pendingCharacterId) {
            runLog.event(EVT_CHARACTER_CONFIRM, "Character select: confirmed", { characterId: pendingCharacterId });
            startGameWithCharacter(pendingCharacterId);
          }
        });
        backBtn.addEventListener("click", showPick);
        if (howtoOpenBtn) howtoOpenBtn.addEventListener("click", showHowToPlay);
        if (howtoBackBtn)
          howtoBackBtn.addEventListener("click", () => {
            runLog.event(EVT_CHARACTER_HOWTO_BACK, "Character select: back from How to play");
            showPick();
          });
        afterDeathRetry = () => {
          showPick();
          characterSelectModal.classList.add("open");
          syncSpecialTestWestPanelLock();
        };
      } else {
        for (const btn of characterSelectOptions) {
          btn.addEventListener("click", () => {
            const id = btn.dataset.characterId || "knight";
            runLog.event(EVT_CHARACTER_SELECTED, "Character select: quick start (no confirm UI)", { characterId: id });
            startGameWithCharacter(id);
          });
        }
        afterDeathRetry = () => {
          resetGame();
          gameStarted = true;
          syncSpecialTestWestPanelLock();
        };
      }
    }
    function lootSpawnIntervalScale() {
      const activeCount = Math.max(1, activeHexes.length || 1);
      return Math.max(1, Math.sqrt(activeCount / LOOT_DENSITY_BASE_ACTIVE_HEXES));
    }
    function getDangerRamp01() {
      return clamp(relDifficultySurvivalSec() / DANGER_RAMP_SECONDS, 0, 1);
    }
    function getSpawnIntervalFromRunTime() {
      const t = getDangerRamp01();
      return SPAWN_INTERVAL_START + (SPAWN_INTERVAL_FLOOR - SPAWN_INTERVAL_START) * t;
    }
    function resetGame() {
      if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
        if (cardModal?.contains(document.activeElement)) document.activeElement.blur();
      }
      state.keys.clear();
      tileCache.clear();
      state.running = true;
      state.elapsed = 0;
      state.lastTime = 0;
      state.wave = 0;
      state.spawnInterval = 8;
      state.nextSpawnAt = 3;
      state.spawnScheduled = [];
      state.nextPickupAt = 2.2;
      state.nextCardAt = 6.5;
      state.hurtFlash = 0;
      state.damageEvents = [];
      state.snapshotPending = false;
      state.playerInvulnerableUntil = 0;
      state.playerUntargetableUntil = 0;
      state.heartsDeathDefyReadyAt = 0;
      state.playerLaserSlowUntil = 0;
      state.playerTimelockUntil = 0;
      state.tempHp = 0;
      state.tempHpExpiry = 0;
      state.ultimateBurstWaves = [];
      state.timelockEnemyFrom = 0;
      state.timelockEnemyUntil = 0;
      state.timelockWorldShakeAt = 0;
      state.knightSpadesWorldSlowUntil = 0;
      state.screenShakeUntil = 0;
      state.screenShakeStrength = 0;
      state.deathStartedAtMs = 0;
      state.manualPause = false;
      state.pausedForCard = false;
      state.pausedForRoulette = false;
      state.pausedForSafehousePrompt = false;
      state.pausedForForge = false;
      state.safehouseLevelInnerLatch = false;
      state.forgeInnerExitLatch = false;
      state.forgeRefA = null;
      state.forgeRefB = null;
      state.forgePendingSuit = null;
      state.safehouseInnerFacilitiesUnlocked = false;
      state.safehouseEmbeddedRouletteComplete = false;
      state.safehouseEmbeddedForgeComplete = false;
      state.safehouseClockFreeze = 0;
      state.spawnDifficultyAnchorSurvival = 0;
      state.runLevel = 0;
      state.proceduralSafehouseSpentKeys.clear();
      state.safehouseLevelPromptShownKeys.clear();
      state.safehouseEmbedRevealAtMs = 0;
      state.safehouseAwaitingLeaveAfterLevelUp = false;
      state.safehouseLevelUpTileKey = "";
      state.runLevelUpCinematic = null;
      state.safehouseSpentTileAnim = null;
      state.inventoryModalOpen = false;
      state.waitingForMovementResume = false;
      state.pendingCard = null;
      state.cardPickupFlowActive = false;
      state.pickupTargetRank = null;
      state.setBonusChoicePendingSuit = null;
      state.playerHeadstartUntil = 0;
      state.rogueHungerMax = 60;
      state.rogueHunger = state.rogueHungerMax;
      state.rogueLastSeenAt = 0;
      state.rogueAlertUntil = 0;
      state.rogueStealthActive = false;
      state.rogueStealthOpenUntil = 0;
      state.rogueFoodSenseUntil = 0;
      state.rogueNextFoodAt = 6;
      state.rogueNextHungryPopupAt = 8;
      state.rogueDashAiming = false;
      state.rogueLastKnownPlayerPos = { x: player.x, y: player.y };
      state.lunaticPhase = "stumble";
      state.lunaticMomentum = 0;
      state.lunaticPressSprintUnlockAt = 0;
      state.lunaticPressStopUnlockAt = 0;
      state.lunaticDecelEndAt = 0;
      state.lunaticDecelStartAt = 0;
      state.lunaticSprintStartedAt = 0;
      state.lunaticStunUntil = 0;
      state.lunaticRoarUntil = 0;
      state.lunaticRoarReadyAt = 0;
      state.lunaticRoarTerrainDmgBank = 0;
      state.lunaticSteerLeft = false;
      state.lunaticSteerRight = false;
      state.lunaticSprintTier2FxFired = false;
      state.lunaticSprintTier4FxFired = false;
      player.x = 96;
      player.y = 340;
      const spawnAxial = worldToHex(96, 340);
      state.lunaticHealExcludeHexKey = isLunatic() ? hexKey(spawnAxial.q, spawnAxial.r) : "";
      state.valiantWill = 1;
      state.valiantRabbitSlots = [null, null, null];
      state.valiantNextBunnyAt = state.elapsed + 5;
      state.valiantSlotBonusMax = [0, 0, 0];
      initSpecialHexTiles(spawnAxial.q, spawnAxial.r);
      if (rouletteModal) rouletteModal.hidden = true;
      if (forgeModal) forgeModal.hidden = true;
      if (safehouseLevelModal) safehouseLevelModal.hidden = true;
      obstacles = [];
      activePlayerHex = { q: 0, r: 0 };
      activeHexes = [];
      lastPlayerHexKey = null;
      player.maxHp = selectedCharacter.baseHp;
      player.hp = player.maxHp;
      player.facing = { x: 1, y: 0 };
      player.burstUntil = 0;
      player.ultimateSpeedUntil = 0;
      player.velX = 0;
      player.velY = 0;
      player._px = player.x;
      player._py = player.y;
      abilities.dash.nextReadyAt = 0;
      abilities.burst.nextReadyAt = 0;
      abilities.decoy.nextReadyAt = 0;
      abilities.random.type = null;
      abilities.random.ammo = 0;
      abilities.random.maxAmmo = 0;
      abilities.random.nextReadyAt = 0;
      entities.hunters = [];
      entities.pickups = [];
      entities.decoys = [];
      entities.shields = [];
      entities.dangerZones = [];
      entities.bullets = [];
      entities.projectiles = [];
      entities.laserBeams = [];
      entities.attackRings = [];
      entities.damageRipples = [];
      entities.ultimateEffects = [];
      entities.cards = [];
      entities.healPopups = [];
      entities.smokeZones = [];
      entities.foods = [];
      entities.valiantBunnies = [];
      entities.valiantElectricBoxes = [];
      entities.valiantRabbitFx = [];
      entities.lunaticSprintTierFx = [];
      inventory.deckByRank = makeEmptyDeckByRank();
      inventory.backpackSlots = [null, null, null];
      inventory.diamondEmpower = null;
      inventory.heartsRegenPerSec = 0;
      inventory.spadesLandingStealthUntil = 0;
      inventory.spadesObstacleBoostUntil = 0;
      inventory.clubsInvisUntil = 0;
      inventory.clubsPhaseThroughTerrain = false;
      inventory.rogueDiamondRangeBoost = false;
      inventory.valiantElectricBoxChargeBonus = 0;
      inventory.heartsResistanceReadyAt = 0;
      inventory.heartsResistanceCooldownDuration = 0;
      inventory.heartsRegenBank = 0;
      inventory.lunaticRegenBank = 0;
      inventory.dodgeTextUntil = 0;
      passive.cooldownFlat = makeCooldownFlatForCharacter(selectedCharacter);
      passive.cooldownPct = makeCooldownPctForCharacter(selectedCharacter);
      passive.speedMult = 1;
      passive.obstacleTouchMult = 1;
      passive.dodgeChanceWhenDashCd = 0;
      passive.stunOnHitSecs = 0;
      passive.invisOnBurst = 0;
      passive.dashChargesBonus = 0;
      passive.heartsShieldArc = 0;
      dashState.maxCharges = 1;
      dashState.charges = 1;
      dashState.nextRechargeAt = 0;
      valiantBoxChargeState.maxCharges = 1;
      valiantBoxChargeState.charges = 1;
      valiantBoxChargeState.nextRechargeAt = 0;
      recalcCardPassives();
      if (isValiant()) startValiantRescueCooldownFromNow();
      ensureTilesForPlayer();
      cameraX = player.x - VIEW_W / 2;
      cameraY = player.y - VIEW_H / 2;
      renderCardSlots();
      updateSetBonusStatus();
      renderCardModal();
    }
    function playerMissingHealth01() {
      if (isValiant()) return clamp(1 - state.valiantWill, 0, 1);
      if (player.maxHp <= 0) return 0;
      return clamp(1 - player.hp / player.maxHp, 0, 1);
    }
    function playerSpeedHealthMultiplier() {
      return 1 + playerMissingHealth01() * 0.08;
    }
    function playerColorByHealth() {
      const t = playerMissingHealth01() * 0.65;
      const blue = { r: 96, g: 165, b: 250 };
      const red = { r: 239, g: 68, b: 68 };
      const r = Math.round(blue.r + (red.r - blue.r) * t);
      const g = Math.round(blue.g + (red.g - blue.g) * t);
      const b = Math.round(blue.b + (red.b - blue.b) * t);
      return `rgb(${r},${g},${b})`;
    }
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
    function drawHunterBody(ctx2, h) {
      const pal = hunterPalette(h.type);
      const { x, y, r } = h;
      const g = ctx2.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.08, x, y, r);
      g.addColorStop(0, pal.light);
      g.addColorStop(0.55, pal.core);
      g.addColorStop(1, pal.shadow);
      ctx2.save();
      ctx2.beginPath();
      ctx2.arc(x, y, r, 0, TAU);
      ctx2.fillStyle = g;
      ctx2.fill();
      ctx2.strokeStyle = pal.rim;
      ctx2.lineWidth = 2;
      ctx2.stroke();
      const mx = h.dir.x * r * 0.38;
      const my = h.dir.y * r * 0.38;
      ctx2.fillStyle = pal.mark;
      ctx2.globalAlpha = 0.45;
      ctx2.beginPath();
      ctx2.arc(x + mx, y + my, r * 0.22, 0, TAU);
      ctx2.fill();
      ctx2.globalAlpha = 1;
      ctx2.restore();
    }
    function drawDecoyBody(ctx2, d) {
      const { x, y, r } = d;
      const g = ctx2.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.05, x, y, r);
      g.addColorStop(0, "#ede9fe");
      g.addColorStop(0.5, "#a78bfa");
      g.addColorStop(1, "#5b21b6");
      ctx2.save();
      ctx2.beginPath();
      ctx2.arc(x, y, r, 0, TAU);
      ctx2.fillStyle = g;
      ctx2.fill();
      ctx2.strokeStyle = "rgba(196, 181, 253, 0.85)";
      ctx2.lineWidth = 2;
      ctx2.stroke();
      ctx2.restore();
    }
    function drawProjectileBody(ctx2, p) {
      const g = ctx2.createRadialGradient(p.x - 1, p.y - 1, 0.5, p.x, p.y, p.r);
      g.addColorStop(0, "#fef3c7");
      g.addColorStop(0.4, "#f59e0b");
      g.addColorStop(1, "#b45309");
      ctx2.save();
      ctx2.beginPath();
      ctx2.arc(p.x, p.y, p.r, 0, TAU);
      ctx2.fillStyle = g;
      ctx2.fill();
      ctx2.strokeStyle = "rgba(251, 191, 36, 0.9)";
      ctx2.lineWidth = 1.2;
      ctx2.stroke();
      ctx2.restore();
    }
    function drawValiantRabbitOrbiters(ctx2, alpha) {
      if (!isValiant()) return;
      ctx2.save();
      ctx2.globalAlpha = alpha;
      for (let slot = 0; slot < 3; slot++) {
        const rb = state.valiantRabbitSlots[slot];
        if (!rb) continue;
        const { x: bx, y: by } = valiantRabbitAnchorWorld(slot);
        const br = 5.5;
        ctx2.fillStyle = "#fecdd3";
        ctx2.beginPath();
        ctx2.arc(bx, by, br, 0, TAU);
        ctx2.fill();
        ctx2.strokeStyle = "rgba(157, 23, 77, 0.8)";
        ctx2.lineWidth = 1.2;
        ctx2.stroke();
        const ratio = rb.maxHp > 0 ? rb.hp / rb.maxHp : 0;
        ctx2.fillStyle = "rgba(15, 23, 42, 0.55)";
        ctx2.fillRect(bx - br, by + br + 2, br * 2, 2.5);
        ctx2.fillStyle = ratio > 0.45 ? "#4ade80" : "#f87171";
        ctx2.fillRect(bx - br, by + br + 2, br * 2 * ratio, 2.5);
        const hpLabel = `${Math.round(rb.hp)}/${Math.round(rb.maxHp)}`;
        ctx2.font = "bold 9px system-ui, sans-serif";
        ctx2.textAlign = "center";
        ctx2.textBaseline = "top";
        ctx2.lineWidth = 3;
        ctx2.strokeStyle = "rgba(15, 23, 42, 0.92)";
        ctx2.strokeText(hpLabel, bx, by + br + 5);
        ctx2.fillStyle = "#f8fafc";
        ctx2.fillText(hpLabel, bx, by + br + 5);
      }
      ctx2.restore();
    }
    function drawPlayerBody(ctx2, invulnAlpha) {
      const px = player.x;
      const py = player.y;
      const pr = player.r;
      const core = playerColorByHealth();
      const g = ctx2.createRadialGradient(px - pr * 0.42, py - pr * 0.48, pr * 0.06, px, py, pr);
      g.addColorStop(0, "rgba(248, 250, 252, 0.95)");
      g.addColorStop(0.38, core);
      g.addColorStop(1, "rgba(15, 23, 42, 0.88)");
      ctx2.save();
      ctx2.globalAlpha = invulnAlpha;
      ctx2.beginPath();
      ctx2.arc(px, py, pr, 0, TAU);
      ctx2.fillStyle = g;
      ctx2.fill();
      ctx2.strokeStyle = "rgba(56, 189, 248, 0.55)";
      ctx2.lineWidth = 2;
      ctx2.stroke();
      const fx = player.facing.x;
      const fy = player.facing.y;
      const tipX = px + fx * pr * 0.72;
      const tipY = py + fy * pr * 0.72;
      const ox = -fy * pr * 0.28;
      const oy = fx * pr * 0.28;
      ctx2.fillStyle = "rgba(255, 255, 255, 0.88)";
      ctx2.beginPath();
      ctx2.moveTo(tipX, tipY);
      ctx2.lineTo(px + fx * pr * 0.15 + ox, py + fy * pr * 0.15 + oy);
      ctx2.lineTo(px + fx * pr * 0.15 - ox, py + fy * pr * 0.15 - oy);
      ctx2.closePath();
      ctx2.fill();
      ctx2.restore();
    }
    function drawLunaticSprintDirectionArrow(ctx2) {
      if (!isLunatic() || state.lunaticPhase !== "sprint") return;
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
      ctx2.save();
      ctx2.strokeStyle = "rgba(251, 191, 36, 0.95)";
      ctx2.fillStyle = "rgba(254, 249, 195, 0.88)";
      ctx2.lineWidth = 2.5;
      ctx2.lineCap = "round";
      ctx2.beginPath();
      ctx2.moveTo(sx, sy);
      ctx2.lineTo(ex, ey);
      ctx2.stroke();
      ctx2.lineJoin = "round";
      ctx2.beginPath();
      ctx2.moveTo(tipX, tipY);
      ctx2.lineTo(ex + ox, ey + oy);
      ctx2.lineTo(ex - ox, ey - oy);
      ctx2.closePath();
      ctx2.fill();
      ctx2.stroke();
      ctx2.restore();
    }
    function drawLunaticRoarFx(ctx2, bodyAlpha) {
      if (!isLunatic() || state.elapsed >= state.lunaticRoarUntil) return;
      const px = player.x;
      const py = player.y;
      const pr = player.r;
      const throb = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(state.elapsed * 22));
      ctx2.save();
      ctx2.lineCap = "round";
      for (let i = 0; i < 4; i++) {
        const rr = pr + 8 + i * 11 + throb * 10;
        const a = (0.42 - i * 0.07) * bodyAlpha * throb;
        ctx2.strokeStyle = `rgba(220, 38, 38, ${a})`;
        ctx2.lineWidth = 2.4 - i * 0.35;
        ctx2.beginPath();
        ctx2.arc(px, py, rr, 0, TAU);
        ctx2.stroke();
      }
      const fx = player.facing.x;
      const fy = player.facing.y;
      const fl = Math.hypot(fx, fy) || 1;
      const fan = Math.PI * 0.42;
      const baseAng = Math.atan2(fy / fl, fx / fl);
      ctx2.globalAlpha = 0.28 * bodyAlpha * throb;
      ctx2.fillStyle = "rgba(248, 113, 113, 0.55)";
      ctx2.beginPath();
      ctx2.moveTo(px, py);
      ctx2.arc(px, py, pr + 36, baseAng - fan / 2, baseAng + fan / 2);
      ctx2.closePath();
      ctx2.fill();
      ctx2.globalAlpha = 1;
      ctx2.restore();
    }
    function drawLunaticRoarTimerBar(ctx2, bodyAlpha) {
      if (!isLunatic() || state.elapsed >= state.lunaticRoarUntil) return;
      const px = player.x;
      const py = player.y;
      const pr = player.r;
      const dur = Math.max(1e-3, LUNATIC_ROAR_DURATION_SEC);
      const rem = Math.max(0, state.lunaticRoarUntil - state.elapsed);
      const ratio = clamp(rem / dur, 0, 1);
      const barW = 48;
      const barH = 5;
      const x = px - barW / 2;
      const y = py + pr + 11;
      ctx2.save();
      ctx2.globalAlpha = bodyAlpha;
      ctx2.fillStyle = "rgba(15, 23, 42, 0.82)";
      ctx2.fillRect(x - 1, y - 1, barW + 2, barH + 2);
      ctx2.strokeStyle = "rgba(248, 113, 113, 0.95)";
      ctx2.lineWidth = 1;
      ctx2.strokeRect(x - 0.5, y - 0.5, barW + 1, barH + 1);
      ctx2.fillStyle = "rgba(30, 41, 59, 0.98)";
      ctx2.fillRect(x, y, barW, barH);
      ctx2.fillStyle = ratio > 0.22 ? "#dc2626" : "#f87171";
      ctx2.fillRect(x, y, barW * ratio, barH);
      ctx2.restore();
    }
    function spawnLunaticSprintTierSpeedFx(tier) {
      if (!isLunatic()) return;
      const dur = tier === 4 ? LUNATIC_SPRINT_TIER_FX_DUR_T4 : LUNATIC_SPRINT_TIER_FX_DUR_T2;
      entities.lunaticSprintTierFx.push({
        bornAt: state.elapsed,
        expiresAt: state.elapsed + dur,
        tier: (
          /** @type {2 | 4} */
          tier
        )
      });
    }
    function drawLunaticSprintTierSpeedFx(ctx2) {
      if (!isLunatic() || !entities.lunaticSprintTierFx.length) return;
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
      for (const b of entities.lunaticSprintTierFx) {
        const span = Math.max(1e-4, b.expiresAt - b.bornAt);
        const u = clamp((state.elapsed - b.bornAt) / span, 0, 1);
        const fade = 1 - u;
        const lineCount = b.tier === 4 ? 12 : 8;
        const baseLen = (b.tier === 4 ? 78 : 56) * (0.72 + 0.28 * fade);
        const spreadW = b.tier === 4 ? 26 : 18;
        const jitter = (b.tier === 4 ? 5 : 3) * Math.sin(state.elapsed * 38 + b.bornAt * 7);
        ctx2.save();
        ctx2.lineCap = "round";
        for (let i = 0; i < lineCount; i++) {
          const t = lineCount <= 1 ? 0 : i / (lineCount - 1) - 0.5;
          const off = spreadW * t + jitter * (0.35 + 0.65 * Math.abs(t));
          const len = baseLen * (0.82 + 0.18 * Math.abs(t));
          const x0 = cx + bx * 14 + px * off;
          const y0 = cy + by * 14 + py * off;
          const x1 = cx + bx * (14 + len) + px * off * 1.08;
          const y1 = cy + by * (14 + len) + py * off * 1.08;
          const a = (b.tier === 4 ? 0.55 : 0.42) * fade;
          ctx2.strokeStyle = b.tier === 4 ? `rgba(254, 215, 170, ${a})` : `rgba(125, 211, 252, ${a})`;
          ctx2.lineWidth = b.tier === 4 ? 2.1 : 1.45;
          ctx2.beginPath();
          ctx2.moveTo(x0, y0);
          ctx2.lineTo(x1, y1);
          ctx2.stroke();
        }
        ctx2.restore();
      }
    }
    function drawPlayerHpHud(ctx2) {
      if (isValiant()) {
        const px2 = player.x;
        const py2 = player.y;
        const pr2 = player.r;
        const wPct = Math.round(state.valiantWill * 100);
        ctx2.save();
        ctx2.textAlign = "center";
        ctx2.textBaseline = "bottom";
        const yMain2 = py2 - pr2 - 10;
        ctx2.font = "bold 14px ui-sans-serif, system-ui, Segoe UI, sans-serif";
        ctx2.lineWidth = 4;
        ctx2.strokeStyle = "rgba(2, 6, 23, 0.82)";
        ctx2.strokeText(`Will ${wPct}%`, px2, yMain2);
        ctx2.fillStyle = state.valiantWill <= 0.22 ? "#fca5a5" : "#e0e7ff";
        ctx2.fillText(`Will ${wPct}%`, px2, yMain2);
        ctx2.restore();
        return;
      }
      const px = player.x;
      const py = player.y;
      const pr = player.r;
      const main = player.hp + " / " + player.maxHp;
      const extra = state.tempHp > 0 ? "+" + state.tempHp + " temp" : "";
      ctx2.save();
      ctx2.textAlign = "center";
      ctx2.textBaseline = "bottom";
      const hpLift = selectedCharacter.id === "rogue" ? 7 : 0;
      const yMain = py - pr - 10 - hpLift;
      const yExtra = yMain - (extra ? 14 : 0);
      ctx2.font = "bold 15px ui-sans-serif, system-ui, Segoe UI, sans-serif";
      ctx2.lineWidth = 4;
      ctx2.strokeStyle = "rgba(2, 6, 23, 0.82)";
      ctx2.strokeText(main, px, yMain);
      ctx2.fillStyle = player.hp <= player.maxHp * 0.35 ? "#fca5a5" : "#f8fafc";
      ctx2.fillText(main, px, yMain);
      if (extra) {
        ctx2.font = "11px ui-sans-serif, system-ui, Segoe UI, sans-serif";
        ctx2.lineWidth = 3;
        ctx2.strokeStyle = "rgba(2, 6, 23, 0.82)";
        ctx2.strokeText(extra, px, yExtra);
        ctx2.fillStyle = "#6ee7b7";
        ctx2.fillText(extra, px, yExtra);
      }
      ctx2.restore();
    }
    function spawnAttackRing(x, y, r, color = "#fca5a5", duration = 0.18) {
      entities.attackRings.push({
        x,
        y,
        r,
        color,
        bornAt: state.elapsed,
        expiresAt: state.elapsed + duration
      });
    }
    function triggerUltScreenShake(strength = 10, durationSec = 0.22) {
      state.screenShakeUntil = state.elapsed + durationSec;
      state.screenShakeStrength = Math.max(state.screenShakeStrength, strength);
    }
    function drawArtilleryDetonationBang(ctx2, zone, u) {
      const { x, y, r } = zone;
      const fade = 1 - u * u;
      const coreR = r * (0.5 + 0.2 * (1 - u));
      drawCircle(ctx2, x, y, coreR, "#fef3c7", 0.38 * fade);
      drawCircle(ctx2, x, y, coreR * 0.42, "#fffbeb", 0.48 * fade);
      const ringR = r * (0.4 + u * 1.25);
      ctx2.strokeStyle = `rgba(254, 215, 170, ${0.72 * fade})`;
      ctx2.lineWidth = 2.6 * (1 - u * 0.45);
      ctx2.beginPath();
      ctx2.arc(x, y, ringR, 0, TAU);
      ctx2.stroke();
      const u2 = clamp((u - 0.1) / 0.9, 0, 1);
      if (u2 > 0) {
        const ringR2 = r * (0.32 + u2 * 1.05);
        ctx2.strokeStyle = `rgba(248, 113, 113, ${0.58 * (1 - u2 * u2)})`;
        ctx2.lineWidth = 1.9;
        ctx2.beginPath();
        ctx2.arc(x, y, ringR2, 0, TAU);
        ctx2.stroke();
      }
      const haloR = r * (0.72 + u * 0.8);
      ctx2.strokeStyle = `rgba(255, 247, 237, ${0.36 * fade})`;
      ctx2.lineWidth = 1.4;
      ctx2.beginPath();
      ctx2.arc(x, y, haloR, 0, TAU);
      ctx2.stroke();
      if (u < 0.28) {
        const sparkleT = 1 - u / 0.28;
        drawCircle(ctx2, x, y, r * 0.28, "#fff7ed", 0.2 * sparkleT);
      }
    }
    function spawnUltimateEffect(type, x, y, color, duration, radius, opts = {}) {
      const o = opts || {};
      const bornAt = o.bornAt != null ? o.bornAt : state.elapsed;
      const expiresAt = o.expiresAt != null ? o.expiresAt : bornAt + duration;
      const { bornAt: _b, expiresAt: _e, ...extra } = o;
      entities.ultimateEffects.push({
        type,
        x,
        y,
        color,
        bornAt,
        expiresAt,
        radius,
        ...extra
      });
    }
    function setSnapshotStatus(text) {
      if (!deathSnapshotsEnabled || !snapshotStatus) return;
      snapshotStatus.textContent = text;
    }
    function makeSnapshotFilename() {
      const stamp = (/* @__PURE__ */ new Date()).toISOString().replaceAll(":", "-").replaceAll(".", "-");
      return `death-snapshots/escape-death-${String(state.deathCount).padStart(3, "0")}-${stamp}.png`;
    }
    function makeSnapshotBlob() {
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png");
      });
    }
    async function chooseSnapshotFolder() {
      if (!deathSnapshotsEnabled) return;
      if (!window.showDirectoryPicker) {
        runLog.warn(E_SNAPSHOT_API, "showDirectoryPicker unavailable; snapshots use download fallback only.");
        setSnapshotStatus("Death screenshots: browser folder access unavailable, using downloads");
        return;
      }
      try {
        snapshotDirectoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
        setSnapshotStatus("Death screenshots: saving to chosen folder");
      } catch (error) {
        runLog.fail(E_SNAPSHOT_FOLDER, "User cancelled or could not open snapshot folder picker.", error);
        setSnapshotStatus("Death screenshots: folder not chosen, using downloads");
      }
    }
    async function saveDeathSnapshot() {
      if (!deathSnapshotsEnabled) return;
      try {
        const blob = await makeSnapshotBlob();
        if (!blob) {
          runLog.fail(E_SNAPSHOT_BLOB, "canvas.toBlob returned null; death screenshot skipped.", null);
          return;
        }
        const filename = makeSnapshotFilename();
        const shortName = filename.split("/").pop();
        if (snapshotDirectoryHandle) {
          try {
            let targetDir = snapshotDirectoryHandle;
            try {
              targetDir = await snapshotDirectoryHandle.getDirectoryHandle("death-snapshots", { create: true });
            } catch (error) {
              runLog.warn(E_SNAPSHOT_SAVE, "Could not create death-snapshots subfolder; saving to picker root.", {
                message: error instanceof Error ? error.message : String(error)
              });
              targetDir = snapshotDirectoryHandle;
            }
            const fileHandle = await targetDir.getFileHandle(shortName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            setSnapshotStatus(`Death screenshots: saved ${shortName}`);
            return;
          } catch (error) {
            runLog.fail(E_SNAPSHOT_SAVE, "Writing death snapshot to chosen folder failed; falling back to download.", error);
            setSnapshotStatus("Death screenshots: folder save failed, using downloads");
            snapshotDirectoryHandle = null;
          }
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = shortName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1e3);
        setSnapshotStatus(`Death screenshots: downloaded ${shortName}`);
      } catch (error) {
        runLog.fail(E_SNAPSHOT_SAVE, "Unexpected failure while saving death snapshot.", error);
        setSnapshotStatus("Death screenshots: save failed");
      }
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
        hitLockUntil: 0
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
        h.chaserDashNextReady = state.elapsed + rand(0.35, 1);
      } else if (type === "cutter") {
        r = 10;
        life = 8;
        lastShotAt = state.elapsed + rand(0.3, 1.1);
      } else if (type === "ranged") {
        r = 10;
        life = 8;
        lastShotAt = state.elapsed + rand(0.4, 1);
        h.shotInterval = 1.35;
        h.shotSpeed = 360;
      } else if (type === "laser") {
        r = 13;
        life = 8;
        lastShotAt = state.elapsed + rand(0.6, 1.2);
        h.laserState = "move";
        h.aimStartedAt = 0;
        h.nextLaserReadyAt = state.elapsed + rand(0.7, 1.4);
        h.laserCooldown = 1;
        h.laserWarning = 0.42;
        h.laserAim = null;
      } else if (type === "laserBlue") {
        r = 13;
        life = 8;
        lastShotAt = state.elapsed + rand(0.5, 1);
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
      if (type === "spawner" || type === "airSpawner") {
        ejectSpawnerHunterFromSpecialHexFootprint(h);
      }
      entities.hunters.push(h);
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
    function scheduleWaveSpawns() {
      const jobs = [];
      const nJobs = BASE_WAVE_SPAWN_JOBS + midgameEscalationTicks();
      for (let i = 0; i < nJobs; i++) {
        jobs.push(() => {
          const type = pickRegularHunterType();
          const r = hunterRadiusForType(type);
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
    function spawnPickup() {
      const point = randomOpenPoint(HEAL_PICKUP_HIT_R, 96, {
        excludeArenaNexus: true,
        excludeHexKey: state.lunaticHealExcludeHexKey || void 0
      });
      entities.pickups.push({
        x: point.x,
        y: point.y,
        r: HEAL_PICKUP_HIT_R,
        plusHalf: HEAL_PICKUP_PLUS_HALF,
        plusThick: HEAL_PICKUP_ARM_THICK,
        expiresAt: state.elapsed + 7.2,
        life: 7.2,
        heal: 3
      });
    }
    function spawnCardPickup() {
      if (isLunatic()) return;
      const card = makeRandomCard();
      const point = randomOpenPoint(CARD_PICKUP_HIT_R, 96, { excludeArenaNexus: true });
      entities.cards.push({
        x: point.x,
        y: point.y,
        r: CARD_PICKUP_HIT_R,
        card,
        flipCard: makePickupFlipFace(card),
        bornAt: state.elapsed,
        expiresAt: state.elapsed + 12
      });
    }
    function spawnRogueFood() {
      const point = randomOpenPoint(13);
      entities.foods.push({
        x: point.x,
        y: point.y,
        r: 13,
        bornAt: state.elapsed,
        expiresAt: state.elapsed + ROGUE_FOOD_LIFETIME,
        nutrition: ROGUE_FOOD_HUNGER_RESTORE
      });
    }
    function updateRogueNeeds(simDt, moving, touchedObstacle) {
      if (selectedCharacter.id !== "rogue") return;
      state.rogueHunger = Math.max(0, state.rogueHunger - simDt);
      if (state.rogueHunger <= 0) {
        player.hp = 0;
        state.running = false;
        state.deathStartedAtMs = state.lastTime;
        state.bestSurvival = Math.max(state.bestSurvival, runClockEffectiveSec());
        return;
      }
      while (state.elapsed >= state.rogueNextFoodAt) {
        spawnRogueFood();
        state.rogueNextFoodAt += rand(4.8, 7.8);
      }
      const inSmoke = playerInsideSmoke();
      const huggingTerrain = touchedObstacle || isPlayerHuggingTerrain(20) || isPointNearTerrain(player.x, player.y, 56);
      const canEnterStealth = state.elapsed - state.rogueLastSeenAt >= ROGUE_STEALTH_AFTER_LOS_BREAK || inSmoke;
      if (canEnterStealth && (huggingTerrain || inSmoke)) {
        state.rogueStealthActive = true;
        state.rogueStealthOpenUntil = state.elapsed + ROGUE_STEALTH_OPEN_GRACE;
      }
      if (state.rogueStealthActive) {
        if (huggingTerrain || inSmoke) {
          state.rogueStealthOpenUntil = state.elapsed + ROGUE_STEALTH_OPEN_GRACE;
        } else if (state.elapsed >= state.rogueStealthOpenUntil) {
          state.rogueStealthActive = false;
        }
      }
      const hungryRatio = 1 - clamp(state.rogueHunger / Math.max(1e-3, state.rogueHungerMax), 0, 1);
      if (hungryRatio >= 0.25 && state.elapsed >= state.rogueNextHungryPopupAt) {
        spawnHealPopup(player.x, player.y - player.r - 12, "I'm hungry", "#67e8f9");
        const cadence = hungryRatio >= 0.7 ? 3.2 : hungryRatio >= 0.45 ? 5.2 : 7;
        state.rogueNextHungryPopupAt = state.elapsed + cadence;
      }
      for (let i = entities.foods.length - 1; i >= 0; i--) {
        const f = entities.foods[i];
        if (state.elapsed >= f.expiresAt) {
          entities.foods.splice(i, 1);
          continue;
        }
        const rr = f.r + player.r;
        if (distSq(f, player) <= rr * rr) {
          state.rogueHunger = Math.min(
            state.rogueHungerMax,
            Math.max(state.rogueHunger, f.nutrition ?? ROGUE_FOOD_HUNGER_RESTORE)
          );
          runLog.event(EVT_ROGUE_FOOD_EATEN, "Rogue ate food pickup", {
            hungerAfter: state.rogueHunger,
            hungerMax: state.rogueHungerMax,
            nutrition: f.nutrition ?? ROGUE_FOOD_HUNGER_RESTORE
          });
          spawnHealPopup(player.x, player.y - player.r - 8, "Fed", "#fcd34d");
          entities.foods.splice(i, 1);
        }
      }
    }
    function updateRogueLineOfSightState() {
      if (selectedCharacter.id !== "rogue") {
        state.rogueHasEnemyLos = false;
        return;
      }
      let seen = false;
      for (const h of entities.hunters) {
        if (h.type === "spawner" || h.type === "airSpawner") continue;
        if (state.elapsed < (h.stunnedUntil || 0)) continue;
        if (hasLineOfSight(h, player)) {
          seen = true;
          break;
        }
      }
      state.rogueHasEnemyLos = seen;
      if (seen) state.rogueLastSeenAt = state.elapsed;
    }
    function anyOtherEnemyHasLineOfSightToPlayer(excludedHunter) {
      for (const h of entities.hunters) {
        if (h === excludedHunter) continue;
        if (h.type === "spawner" || h.type === "airSpawner") continue;
        if (state.elapsed < (h.stunnedUntil || 0)) continue;
        if (hasLineOfSight(h, player)) return true;
      }
      return false;
    }
    function spawnHealPopup(x, y, text = "+1", color = "#86efac", life = 0.6, fontPx = 14) {
      entities.healPopups.push({
        x,
        y,
        text,
        color,
        fontPx,
        bornAt: state.elapsed,
        expiresAt: state.elapsed + life
      });
    }
    function forEachActiveCard(fn) {
      forEachDeckCard((card) => fn(card));
    }
    function getHeartsResistanceCardCount() {
      let n = 0;
      forEachActiveCard((card) => {
        if (card.effect?.kind === "hitResist") n++;
      });
      return n;
    }
    function getHeartsResistanceCooldown() {
      let totalRank = 0;
      forEachActiveCard((card) => {
        if (card.effect?.kind === "hitResist") totalRank += card.rank;
      });
      if (totalRank <= 0) return 15;
      return Math.max(3, 15 - 0.5 * totalRank);
    }
    function openCardPickupModal(card) {
      state.pausedForCard = true;
      state.inventoryModalOpen = true;
      state.waitingForMovementResume = false;
      state.pendingCard = card;
      state.cardPickupFlowActive = true;
      state.pickupTargetRank = card.rank;
      state.keys.clear();
      runLog.event(EVT_CARD_MODAL_OPEN, "Card pickup / inventory modal opened", {
        suit: card?.suit,
        rank: card?.rank
      });
      renderCardModal();
    }
    function updateCardPickups() {
      for (let i = entities.cards.length - 1; i >= 0; i--) {
        const c = entities.cards[i];
        if (state.elapsed >= c.expiresAt) {
          entities.cards.splice(i, 1);
          continue;
        }
        const reach = c.r + player.r + CARD_PICKUP_REACH_EXTRA;
        if (distSq(c, player) <= reach * reach) {
          openCardPickupModal(c.card);
          entities.cards.splice(i, 1);
          break;
        }
      }
    }
    function tryDash() {
      if (isValiant()) {
        const ability2 = abilities.dash;
        if (!state.running) return;
        if (state.runLevelUpCinematic && performance.now() - state.runLevelUpCinematic.startMs < RUN_LEVEL_UP_CINEMATIC_MS)
          return;
        if (state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge) return;
        if (state.elapsed < ability2.nextReadyAt) return;
        const cd = effectiveAbilityCooldown("dash", ability2.cooldown, ability2.minCooldown ?? 0.45);
        ability2.nextReadyAt = state.elapsed + cd;
        const burstDurBonus = knightDiamondBurstEmpowerActive() ? KNIGHT_DIAMOND_BURST_DURATION_BONUS_SEC : 0;
        const dur = (abilities.dash.duration ?? abilities.burst.duration ?? 3) + burstDurBonus;
        player.burstUntil = state.elapsed + dur;
        if (passive.invisOnBurst > 0) {
          inventory.clubsInvisUntil = Math.max(inventory.clubsInvisUntil, state.elapsed + passive.invisOnBurst);
        }
        spawnAttackRing(player.x, player.y, 58, "#38bdf8", 0.22);
        spawnAttackRing(player.x, player.y, 88, "#7dd3fc", 0.18);
        return;
      }
      if (selectedCharacter.id === "lunatic") return;
      const ability = abilities.dash;
      if (!state.running) return;
      if (state.runLevelUpCinematic && performance.now() - state.runLevelUpCinematic.startMs < RUN_LEVEL_UP_CINEMATIC_MS)
        return;
      if (state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge) return;
      if (dashState.charges <= 0) return;
      let spadesCount = 0;
      forEachDeckCard((c) => {
        if (c.suit === "spades" || c.suit === "joker") spadesCount += 1;
      });
      const qualifiesForSpadesDashBonus = selectedCharacter.id === "rogue" && state.rogueStealthActive || state.elapsed < inventory.clubsInvisUntil;
      dashState.charges -= 1;
      if (dashState.charges < dashState.maxCharges) {
        const cd = effectiveAbilityCooldown("dash", ability.cooldown, ability.minCooldown ?? 0.25);
        dashState.nextRechargeAt = Math.max(dashState.nextRechargeAt, state.elapsed + cd);
      }
      const target = computeDashTarget();
      if (target.progressed) {
        player.x = target.x;
        player.y = target.y;
        clampPlayerToArenaNexusInnerHex();
        clampPlayerToSurgeLockHex();
        if (selectedCharacter.id === "rogue" && spadesCount >= SET_BONUS_SUIT_THRESHOLD && qualifiesForSpadesDashBonus) {
          state.rogueStealthActive = true;
          state.rogueStealthOpenUntil = Math.max(
            state.rogueStealthOpenUntil,
            state.elapsed + ROGUE_STEALTH_OPEN_GRACE + 0.12
          );
          inventory.spadesLandingStealthUntil = Math.max(
            inventory.spadesLandingStealthUntil,
            state.rogueStealthOpenUntil
          );
        }
      }
    }
    function currentDashDirection() {
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
    function currentDashRange() {
      if (selectedCharacter.id === "rogue") {
        if (deckSuitCounts.diamonds >= SET_BONUS_SUIT_MAX) return 220;
        return inventory.rogueDiamondRangeBoost ? 180 : 120;
      }
      return inventory.diamondEmpower === "dash2x" || diamondsOmniEmpowerActive() ? 240 : 120;
    }
    function computeDashTarget() {
      const dir = currentDashDirection();
      const step = 12;
      const dashRange = currentDashRange();
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
          if (selectedCharacter.id === "rogue") break;
          continue;
        }
        tx = test.x;
        ty = test.y;
        progressed = true;
      }
      return { x: tx, y: ty, progressed, dir, range: dashRange };
    }
    function startRogueDashAim() {
      if (selectedCharacter.id !== "rogue") return;
      if (!state.running || state.pausedForCard || state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge || state.inventoryModalOpen)
        return;
      if (dashState.charges <= 0) return;
      state.rogueDashAiming = true;
    }
    function releaseRogueDashAim() {
      if (selectedCharacter.id !== "rogue") return;
      if (!state.rogueDashAiming) return;
      state.rogueDashAiming = false;
      tryDash();
    }
    function tryBurst() {
      const ability = abilities.burst;
      if (selectedCharacter.id === "lunatic") {
        tryLunaticWToggle();
        return;
      }
      if (isValiant()) {
        if (!state.running) return;
        if (valiantBoxChargeState.charges <= 0 && state.elapsed < ability.nextReadyAt) return;
        if (valiantBoxChargeState.charges <= 0) return;
        valiantBoxChargeState.charges -= 1;
        if (valiantBoxChargeState.charges < valiantBoxChargeState.maxCharges) {
          const cd = effectiveAbilityCooldown("burst", ability.cooldown, ability.minCooldown ?? 0.5);
          valiantBoxChargeState.nextRechargeAt = Math.max(valiantBoxChargeState.nextRechargeAt, state.elapsed + cd);
        }
        if (valiantBoxChargeState.charges <= 0) {
          ability.nextReadyAt = state.elapsed + effectiveAbilityCooldown("burst", ability.cooldown, ability.minCooldown ?? 0.5);
        }
        placeValiantShockField();
        return;
      }
      if (state.elapsed < ability.nextReadyAt || !state.running) return;
      if (selectedCharacter.id === "rogue") {
        ability.nextReadyAt = state.elapsed + effectiveAbilityCooldown("burst", ability.cooldown, ability.minCooldown ?? 1);
        entities.smokeZones.push({
          x: player.x,
          y: player.y,
          r: deckSuitCounts.diamonds >= SET_BONUS_SUIT_MAX ? 300 : inventory.rogueDiamondRangeBoost ? 260 : 180,
          bornAt: state.elapsed,
          expiresAt: state.elapsed + (ability.duration ?? 3)
        });
        spawnAttackRing(player.x, player.y, 72, "#94a3b8", 0.2);
        spawnAttackRing(player.x, player.y, 128, "#cbd5e1", 0.28);
        return;
      }
      const burstCd = effectiveAbilityCooldown("burst", ability.cooldown, ability.minCooldown ?? 0.4);
      ability.nextReadyAt = state.elapsed + burstCd;
      const burstDurBonus = knightDiamondBurstEmpowerActive() ? KNIGHT_DIAMOND_BURST_DURATION_BONUS_SEC : 0;
      player.burstUntil = state.elapsed + ability.duration + burstDurBonus;
      if (selectedCharacter.id !== "rogue" && passive.invisOnBurst > 0) {
        inventory.clubsInvisUntil = Math.max(inventory.clubsInvisUntil, state.elapsed + passive.invisOnBurst);
      }
    }
    function tryDecoy() {
      if (selectedCharacter.id === "lunatic") return;
      if (isValiant()) {
        tryValiantRescueRabbit();
        return;
      }
      const ability = abilities.decoy;
      if (state.elapsed < ability.nextReadyAt || !state.running) return;
      if (selectedCharacter.id === "rogue") {
        ability.nextReadyAt = state.elapsed + Math.max(ability.minCooldown ?? 0.5, ability.cooldown);
        state.rogueFoodSenseUntil = Math.max(state.rogueFoodSenseUntil, state.elapsed + ROGUE_FOOD_SENSE_DURATION);
        return;
      }
      const decoyEmpower = inventory.diamondEmpower === "decoyLead" || diamondsOmniEmpowerActive();
      const decoyCd = effectiveAbilityCooldown("decoy", ability.cooldown, ability.minCooldown ?? 0.4, decoyEmpower ? 2 : 0);
      ability.nextReadyAt = state.elapsed + decoyCd;
      entities.decoys.push({
        x: player.x,
        y: player.y,
        r: player.r,
        hp: 3,
        invulnerableUntil: state.elapsed + 0.4,
        expiresAt: state.elapsed + 6 + (decoyEmpower ? 1 : 0)
      });
    }
    function applyUltimateBurstWavePush(burstRadius) {
      for (const h of entities.hunters) {
        const d2 = distSq(player, h);
        if (d2 > burstRadius * burstRadius) continue;
        const away = vectorToTarget(player, h);
        const push = h.type === "spawner" || h.type === "airSpawner" ? 0 : 95;
        const test = { x: h.x + away.x * push, y: h.y + away.y * push, r: h.r };
        if (!outOfBoundsCircle(test) && !collidesAnyObstacle(test)) {
          h.x = test.x;
          h.y = test.y;
        }
        h.dir.x = away.x;
        h.dir.y = away.y;
      }
      for (let i = entities.projectiles.length - 1; i >= 0; i--) {
        if (distSq(player, entities.projectiles[i]) <= burstRadius * burstRadius) {
          entities.projectiles.splice(i, 1);
        }
      }
    }
    function processUltimateBurstWaves() {
      const waves = state.ultimateBurstWaves;
      if (!waves.length) return;
      const r = ULT_BURST_RADIUS;
      while (waves.length && state.elapsed >= waves[0]) {
        waves.shift();
        applyUltimateBurstWavePush(r);
        triggerUltScreenShake(11, 0.16);
        spawnAttackRing(player.x, player.y, r * 0.92, "#e0f2fe", 0.26);
        spawnAttackRing(player.x, player.y, r * 0.72, "#93c5fd", 0.22);
        spawnAttackRing(player.x, player.y, r * 0.48, "#bfdbfe", 0.18);
        spawnUltimateEffect("burstWave", player.x, player.y, "#93c5fd", 0.52, r);
      }
    }
    function useRandomAbility() {
      const ability = abilities.random;
      if (!state.running || !ability.type || ability.ammo <= 0) return;
      if (state.elapsed < ability.nextReadyAt) return;
      if (state.playerTimelockUntil > state.elapsed) return;
      if (ability.type === "shield") {
        triggerUltScreenShake(9, 0.2);
        spawnAttackRing(player.x, player.y, player.r + 28, "#ffffff", 0.12);
        spawnAttackRing(player.x, player.y, player.r + 52, "#bfdbfe", 0.34);
        spawnAttackRing(player.x, player.y, player.r + 88, "#60a5fa", 0.42);
        spawnUltimateEffect("shieldSummon", player.x, player.y, "#93c5fd", 0.95, 88);
        entities.shields = [];
        const orbitR = player.r + ULT_ORBIT_SHIELD_RADIUS_EXTRA;
        const t0 = state.elapsed;
        for (let i = 0; i < 4; i++) {
          entities.shields.push({
            angle: TAU / 4 * i,
            radius: orbitR,
            r: 10,
            bornAt: t0,
            expiresAt: state.elapsed + ULT_ORBIT_SHIELD_STAGGER_SEC * (i + 1)
          });
        }
      } else if (ability.type === "burst") {
        player.ultimateSpeedUntil = state.elapsed + ULT_BURST_WAVE_SPAN_SEC;
        state.ultimateBurstWaves = [];
        for (let i = 0; i < ULT_BURST_WAVE_COUNT; i++) {
          state.ultimateBurstWaves.push(state.elapsed + i * ULT_BURST_WAVE_SPAN_SEC / ULT_BURST_WAVE_COUNT);
        }
        triggerUltScreenShake(13, 0.24);
        spawnAttackRing(player.x, player.y, ULT_BURST_RADIUS * 0.35, "#ffffff", 0.14);
        spawnAttackRing(player.x, player.y, ULT_BURST_RADIUS * 0.72, "#bfdbfe", 0.24);
        spawnAttackRing(player.x, player.y, ULT_BURST_RADIUS * 0.95, "#93c5fd", 0.28);
        spawnUltimateEffect("burstWave", player.x, player.y, "#e0f2fe", 0.4, ULT_BURST_RADIUS * 0.6);
      } else if (ability.type === "timelock") {
        state.playerTimelockUntil = Math.max(state.playerTimelockUntil, state.elapsed + 2);
        state.playerInvulnerableUntil = Math.max(state.playerInvulnerableUntil, state.elapsed + 2);
        state.timelockEnemyFrom = state.elapsed + 2;
        state.timelockEnemyUntil = state.elapsed + 4;
        state.timelockWorldShakeAt = state.elapsed + 2;
        triggerUltScreenShake(6, 0.18);
        spawnAttackRing(player.x, player.y, player.r + 18, "#faf5ff", 0.22);
        spawnAttackRing(player.x, player.y, player.r + 36, "#e9d5ff", 0.32);
        spawnAttackRing(player.x, player.y, player.r + 58, "#c084fc", 0.4);
        spawnUltimateEffect("timelock", player.x, player.y, "#c084fc", 4, 56);
        spawnUltimateEffect(
          "timelockWorld",
          player.x,
          player.y,
          "#c4b5fd",
          2,
          ULT_BURST_RADIUS * 1.05,
          { bornAt: state.elapsed + 2, expiresAt: state.elapsed + 4 }
        );
      } else if (ability.type === "heal") {
        state.tempHp = 3;
        state.tempHpExpiry = state.elapsed + 20;
        triggerUltScreenShake(7, 0.18);
        spawnAttackRing(player.x, player.y, player.r + 18, "#ecfdf5", 0.2);
        spawnAttackRing(player.x, player.y, player.r + 38, "#bbf7d0", 0.34);
        spawnAttackRing(player.x, player.y, player.r + 62, "#34d399", 0.42);
        spawnUltimateEffect("healVitality", player.x, player.y, "#34d399", 1.15, 72);
        spawnHealPopup(player.x, player.y - player.r - 20, "+3", "#6ee7b7", 1, 16);
        spawnHealPopup(player.x, player.y - player.r - 36, "VITALITY", "#a7f3d0", 0.85, 12);
      }
      ability.ammo -= 1;
      ability.nextReadyAt = state.elapsed + ULTIMATE_ABILITY_COOLDOWN_SEC;
      if ((selectedCharacter.id === "knight" || selectedCharacter.id === "valiant") && countSuitsInActiveSlots().spades >= SET_BONUS_SUIT_THRESHOLD) {
        state.knightSpadesWorldSlowUntil = state.elapsed + KNIGHT_SPADES_WORLD_SLOW_SEC;
      }
    }
    function nearestDecoy(from) {
      if (!entities.decoys.length) return null;
      let best = null;
      let bestDist = Infinity;
      for (const d of entities.decoys) {
        const score = distSq(from, d);
        if (score < bestDist) {
          bestDist = score;
          best = d;
        }
      }
      return best;
    }
    function pickTargetForHunter(hunter) {
      if (state.elapsed < state.playerUntargetableUntil) {
        return nearestDecoy(hunter) || { x: hunter.x + hunter.dir.x * 40, y: hunter.y + hunter.dir.y * 40 };
      }
      if (selectedCharacter.id === "rogue") {
        if (state.elapsed < inventory.spadesLandingStealthUntil) {
          return nearestDecoy(hunter) || { x: hunter.x + hunter.dir.x * 40, y: hunter.y + hunter.dir.y * 40 };
        }
        if (state.rogueStealthActive) {
          return nearestDecoy(hunter) || { x: hunter.x + hunter.dir.x * 40, y: hunter.y + hunter.dir.y * 40 };
        }
        const hasLosToPlayer = hasLineOfSight(hunter, player);
        if (hasLosToPlayer) {
          state.rogueLastSeenAt = state.elapsed;
          state.rogueAlertUntil = Math.max(state.rogueAlertUntil, state.elapsed + 1.4);
          state.rogueLastKnownPlayerPos = { x: player.x, y: player.y };
          return player;
        }
        return state.rogueLastKnownPlayerPos || { x: hunter.x + hunter.dir.x * 40, y: hunter.y + hunter.dir.y * 40 };
      }
      let target = player;
      if (state.elapsed < inventory.clubsInvisUntil || selectedCharacter.id === "rogue" && state.elapsed < inventory.spadesLandingStealthUntil) {
        return nearestDecoy(hunter) || { x: hunter.x + hunter.dir.x * 40, y: hunter.y + hunter.dir.y * 40 };
      }
      if (!entities.decoys.length) return target;
      if (hunter.type === "chaser" || hunter.type === "fast") {
        return nearestDecoy(hunter) || target;
      }
      if (hunter.type === "cutter") {
        const decoy = nearestDecoy(hunter);
        if (decoy && distSq(hunter, decoy) < 240 * 240) return decoy;
      }
      return target;
    }
    function vectorToTarget(from, target) {
      const dx = target.x - from.x;
      const dy = target.y - from.y;
      const len = Math.hypot(dx, dy) || 1;
      return { x: dx / len, y: dy / len };
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
      for (const obstacle of obstacles) {
        const closestX = clamp(hunter.x, obstacle.x, obstacle.x + obstacle.w);
        const closestY = clamp(hunter.y, obstacle.y, obstacle.y + obstacle.h);
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
    function moveHunters(dt) {
      for (const h of entities.hunters) {
        if (h.type === "spawner") continue;
        if (state.elapsed < (h.stunnedUntil || 0)) continue;
        const spDt = dt * spades13AuraEnemyDtMult(h.x, h.y);
        if (h.type === "airSpawner") {
          const target = pickTargetForHunter(h);
          const desired2 = vectorToTarget(h, target);
          const sm2 = runLevelEnemySpeedMult();
          const am = runLevelEnemyAccelMult();
          const airSteer = Math.min(0.88, 0.78 * am);
          const airInertia = 1 - airSteer;
          const airSpeed = AIR_SPAWNER_CHASE_SPEED * sm2 * midgameEnemySpeedMult();
          h.dir.x = h.dir.x * airInertia + desired2.x * airSteer;
          h.dir.y = h.dir.y * airInertia + desired2.y * airSteer;
          const alen = Math.hypot(h.dir.x, h.dir.y) || 1;
          h.dir.x /= alen;
          h.dir.y /= alen;
          moveCircleWithCollisions(h, h.dir.x * airSpeed, h.dir.y * airSpeed, spDt, { ignoreObstacles: true });
          ejectSpawnerHunterFromSpecialHexFootprint(h);
          continue;
        }
        const lifeSpan = h.life || Math.max(1e-4, h.dieAt - h.bornAt);
        const age = clamp((state.elapsed - h.bornAt) / lifeSpan, 0, 1);
        const speedFactor = 1 + age * HUNTER_SPEED_AGE_COEFF;
        const baseSpeed = h.type === "sniper" ? 100 : h.type === "cutter" ? 116 : h.type === "laser" || h.type === "laserBlue" ? h.type === "laserBlue" ? 156 : 138 : h.type === "ranged" ? 85 : h.type === "fast" ? 150 : 110;
        const sm = runLevelEnemySpeedMult();
        const steerW = Math.min(0.42, 0.26 * runLevelEnemyAccelMult());
        const inertiaW = 1 - steerW;
        let speed = baseSpeed * sm * speedFactor * midgameEnemySpeedMult();
        const rogueInSeekMode = selectedCharacter.id === "rogue" && state.elapsed > state.rogueAlertUntil;
        if (rogueInSeekMode) speed *= 0.58;
        if (selectedCharacter.id === "rogue" && state.rogueStealthActive) {
          if (!h.patrolDir || state.elapsed >= (h.patrolTurnAt ?? 0)) {
            const ang = Math.random() * TAU;
            h.patrolDir = { x: Math.cos(ang), y: Math.sin(ang) };
            h.patrolTurnAt = state.elapsed + rand(0.8, 1.8);
          }
          const patrolSteer = avoidObstacles(h, h.patrolDir);
          h.dir.x = h.dir.x * 0.7 + patrolSteer.x * 0.3;
          h.dir.y = h.dir.y * 0.7 + patrolSteer.y * 0.3;
          const plen = Math.hypot(h.dir.x, h.dir.y) || 1;
          h.dir.x /= plen;
          h.dir.y /= plen;
          moveCircleWithCollisions(h, h.dir.x * speed * 0.38, h.dir.y * speed * 0.38, spDt, {
            blockValiantEnemyShockFields: true
          });
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
        } else if (h.type === "laser" || h.type === "laserBlue") {
          const isBlue = h.type === "laserBlue";
          const target = pickTargetForHunter(h);
          const los = isBlue ? hasLineOfSight(h, target, { ignoreObstacles: true }) : hasLineOfSight(h, target);
          if (h.laserState === "aim") {
            if (state.elapsed >= h.aimStartedAt + h.laserWarning) {
              const aim = h.laserAim;
              if (!aim) {
                h.laserState = "move";
                h.nextLaserReadyAt = state.elapsed + h.laserCooldown;
                continue;
              }
              entities.laserBeams.push({
                x1: aim.x1,
                y1: aim.y1,
                x2: aim.x2,
                y2: aim.y2,
                bornAt: state.elapsed,
                expiresAt: state.elapsed + 0.5,
                warning: false,
                active: true,
                blueLaser: isBlue
              });
              spawnAttackRing(h.x, h.y, h.r + 9, isBlue ? "#3b82f6" : "#ef4444", 0.16);
              if (!hitDecoyAlongSegment(aim.x1, aim.y1, aim.x2, aim.y2, 5)) {
                const hitDist = pointToSegmentDistance(player.x, player.y, aim.x1, aim.y1, aim.x2, aim.y2);
                if (hitDist <= player.r + 5) damagePlayer(2, isBlue ? { laserBlueSlow: true } : {});
              }
              h.laserState = "move";
              h.laserAim = null;
              h.nextLaserReadyAt = state.elapsed + h.laserCooldown;
            }
            continue;
          }
          if (los && state.elapsed >= h.nextLaserReadyAt) {
            const aimDirX = target.x - h.x;
            const aimDirY = target.y - h.y;
            const endpoint = isBlue ? getLaserEndpoint(h.x, h.y, aimDirX, aimDirY, 900, { throughObstacles: true }) : getLaserEndpoint(h.x, h.y, aimDirX, aimDirY);
            h.laserAim = { x1: h.x, y1: h.y, x2: endpoint.x, y2: endpoint.y };
            h.laserState = "aim";
            h.aimStartedAt = state.elapsed;
            entities.laserBeams.push({
              x1: h.laserAim.x1,
              y1: h.laserAim.y1,
              x2: h.laserAim.x2,
              y2: h.laserAim.y2,
              bornAt: state.elapsed,
              expiresAt: state.elapsed + h.laserWarning,
              warning: true,
              active: false,
              blueLaser: isBlue
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
            if (state.elapsed >= h.chaserDashWindupEnd) {
              h.chaserDashPhase = "dashing";
              h.chaserDashDir = { x: toT.x, y: toT.y };
              h.chaserDashDist = 124;
              spawnAttackRing(h.x, h.y, h.r + 9, "#fecaca", 0.14);
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
            if (outOfBoundsCircle(test) || collidesAnyObstacle(test)) {
              h.chaserDashPhase = "chase";
              h.chaserDashNextReady = state.elapsed + rand(1.45, 2.05);
            } else {
              h.x = nx;
              h.y = ny;
              h.chaserDashDist -= stepLen;
              if (h.chaserDashDist <= 0) {
                h.chaserDashPhase = "chase";
                h.chaserDashNextReady = state.elapsed + rand(1.45, 2.05);
              }
            }
            continue;
          }
          desired = vectorToTarget(h, target);
          const canDash = state.elapsed >= (h.chaserDashNextReady ?? 0);
          if (h.chaserDashPhase === "chase" && canDash && dist <= 168 && dist >= 36 && hasLineOfSight(h, target)) {
            h.chaserDashPhase = "windup";
            h.chaserDashWindupEnd = state.elapsed + 0.1;
            h.dir.x = toT.x;
            h.dir.y = toT.y;
            spawnAttackRing(h.x, h.y, h.r + 4, "#fca5a5", 0.09);
            continue;
          }
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
        moveCircleWithCollisions(h, h.dir.x * speed, h.dir.y * speed, spDt, { blockValiantEnemyShockFields: true });
      }
      for (const h of entities.hunters) {
        if (h.type === "spawner") continue;
        clampHunterOutsideSafehouseDisks(h);
      }
    }
    function updateRangedAttackers(dt) {
      for (const h of entities.hunters) {
        if (h.type !== "ranged") continue;
        if (state.elapsed - h.lastShotAt < h.shotInterval) continue;
        const target = pickTargetForHunter(h);
        if (selectedCharacter.id === "rogue" && target !== player) continue;
        h.lastShotAt = state.elapsed;
        spawnAttackRing(h.x, h.y, h.r + 7, "#fb923c", 0.14);
        const to = vectorToTarget(h, target);
        const speed = (h.shotSpeed || 360) * runLevelEnemySpeedMult() * midgameEnemySpeedMult();
        entities.projectiles.push({
          x: h.x,
          y: h.y,
          vx: to.x * speed,
          vy: to.y * speed,
          r: 3,
          bornAt: state.elapsed,
          life: 1.25,
          damage: 1
        });
      }
      for (let i = entities.projectiles.length - 1; i >= 0; i--) {
        const p = entities.projectiles[i];
        const sp = spades13AuraEnemyDtMult(p.x, p.y);
        const prevX = p.x;
        const prevY = p.y;
        p.x += p.vx * dt * sp;
        p.y += p.vy * dt * sp;
        let hitSpecialBarrier = false;
        for (let s = 0; s <= 5; s++) {
          const u = s / 5;
          const sx = prevX + (p.x - prevX) * u;
          const sy = prevY + (p.y - prevY) * u;
          if (isWorldPointOnRouletteHexTile(sx, sy) || isWorldPointOnSurgeLockBarrierTile(sx, sy) || barrierDiskBlocksWorldPoint(sx, sy)) {
            hitSpecialBarrier = true;
            break;
          }
        }
        if (hitSpecialBarrier) {
          spawnAttackRing(p.x, p.y, p.r + 9, "#94a3b8", 0.1);
          entities.projectiles.splice(i, 1);
          continue;
        }
        const circle = { x: p.x, y: p.y, r: p.r };
        if (state.elapsed - p.bornAt > p.life || outOfBoundsCircle(circle) || collidesAnyObstacle(circle)) {
          entities.projectiles.splice(i, 1);
          continue;
        }
        if (hitDecoyIfAny(p, p.r)) {
          spawnAttackRing(p.x, p.y, p.r + 7, "#fca5a5", 0.12);
          entities.projectiles.splice(i, 1);
          continue;
        }
        const rr = p.r + player.r;
        if (distSq(p, player) <= rr * rr) {
          spawnAttackRing(p.x, p.y, p.r + 10, "#fca5a5", 0.18);
          damagePlayer(p.damage || 1);
          entities.projectiles.splice(i, 1);
        }
      }
    }
    function updateSpawners(dt) {
      for (const h of entities.hunters) {
        if (h.type === "spawner" || h.type === "airSpawner") ejectSpawnerHunterFromSpecialHexFootprint(h);
      }
      for (const h of entities.hunters) {
        if (h.type !== "spawner" && h.type !== "airSpawner") continue;
        if (state.elapsed < h.spawnDelayUntil) continue;
        if (state.elapsed >= h.spawnActiveUntil) continue;
        if (state.elapsed < h.nextSwarmAt) continue;
        let safety = 0;
        while (state.elapsed >= h.nextSwarmAt && safety < 4) {
          h.nextSwarmAt += h.swarmInterval;
          safety++;
          spawnAttackRing(h.x, h.y, h.r + 12, h.type === "airSpawner" ? "#a78bfa" : "#fb7185", 0.12);
          const fastR = h.fastR || 10;
          const swarmN = h.swarmN || 5;
          for (let i = 0; i < swarmN; i++) {
            const open = h.type === "airSpawner" ? resolveFastSpawnNearAirSpawner(h, fastR) : randomOpenPointAround(h.x, h.y, h.r + 16, h.r + 34, fastR, 25, { excludeSpecialHex: true });
            spawnHunter("fast", open.x, open.y);
          }
        }
      }
    }
    function clearTempHp() {
      state.tempHp = 0;
      state.tempHpExpiry = 0;
    }
    function hitDecoyIfAny(source, range) {
      const circ = { x: source.x, y: source.y, r: range };
      for (let i = entities.decoys.length - 1; i >= 0; i--) {
        const d = entities.decoys[i];
        const rr = range + d.r;
        if (distSq(source, d) <= rr * rr) {
          if (state.elapsed < d.invulnerableUntil) return true;
          d.hp -= 1;
          if (d.hp <= 0) entities.decoys.splice(i, 1);
          return true;
        }
      }
      return false;
    }
    function damagePlayer(amount, opts = {}) {
      if (!state.running) return;
      const rouletteHexOuter = !!opts.rouletteHexOuterPenalty;
      if (!rouletteHexOuter) {
        if (lunaticSprintDamageImmune() && !opts.lunaticCrash && !opts.lunaticRoarTerrain) return;
        if (selectedCharacter.id === "rogue" && state.rogueStealthActive) return;
        if (selectedCharacter.id === "rogue" && state.elapsed < inventory.spadesLandingStealthUntil) return;
        if (state.elapsed < state.playerInvulnerableUntil) return;
        if (state.elapsed < state.playerUntargetableUntil) return;
        if (state.elapsed < inventory.clubsInvisUntil) return;
        if (cdr(abilities.dash) > 0 && Math.random() < passive.dodgeChanceWhenDashCd) {
          inventory.dodgeTextUntil = state.elapsed + 0.8;
          return;
        }
        const heartsResistanceCount = getHeartsResistanceCardCount();
        if (heartsResistanceCount > 0 && state.elapsed >= inventory.heartsResistanceReadyAt && !opts.lunaticCrash && !opts.lunaticRoarTerrain) {
          const cd = getHeartsResistanceCooldown();
          inventory.heartsResistanceCooldownDuration = cd;
          inventory.heartsResistanceReadyAt = state.elapsed + cd;
          return;
        }
      }
      if (amount <= 0) return;
      if (isValiant()) {
        valiantApplyDamage(amount, opts);
        return;
      }
      let rem = amount;
      if (state.tempHp > 0) {
        const absorbed = Math.min(rem, state.tempHp);
        state.tempHp -= absorbed;
        rem -= absorbed;
        if (state.tempHp <= 0) clearTempHp();
      }
      if (rem > 0) player.hp = Math.max(0, player.hp - rem);
      if (rem > 0 && deckSuitCounts.clubs >= SET_BONUS_SUIT_MAX) {
        state.playerUntargetableUntil = state.elapsed + CLUBS_13_UNTARGETABLE_SEC;
      }
      if (opts.laserBlueSlow) {
        state.playerLaserSlowUntil = state.elapsed + LASER_BLUE_PLAYER_SLOW_SEC;
      }
      state.hurtFlash = 0.16;
      state.playerInvulnerableUntil = state.elapsed + 0.35;
      state.screenShakeUntil = state.elapsed + 0.18;
      state.screenShakeStrength = 8;
      entities.damageRipples.push({
        x: player.x,
        y: player.y,
        bornAt: state.elapsed,
        expiresAt: state.elapsed + 0.22
      });
      state.damageEvents.push({ t: state.elapsed, amount, hpAfter: player.hp });
      if (passive.stunOnHitSecs > 0) {
        for (const h of entities.hunters) {
          if (distSq(h, player) <= 220 * 220) h.stunnedUntil = Math.max(h.stunnedUntil || 0, state.elapsed + passive.stunOnHitSecs);
        }
      }
      if (player.hp <= 0) {
        if (deckSuitCounts.hearts >= SET_BONUS_SUIT_MAX && state.elapsed >= state.heartsDeathDefyReadyAt) {
          player.hp = 5;
          state.heartsDeathDefyReadyAt = state.elapsed + HEARTS_13_DEATH_DEFY_CD_SEC;
          state.playerInvulnerableUntil = state.elapsed + 0.55;
          spawnHealPopup(player.x, player.y - player.r - 16, "DEFIED", "#fb7185", 1.1, 17);
          return;
        }
        state.deathCount += 1;
        if (deathSnapshotsEnabled) state.snapshotPending = true;
        state.running = false;
        state.deathStartedAtMs = state.lastTime;
        state.bestSurvival = Math.max(state.bestSurvival, runClockEffectiveSec());
      }
    }
    function updateSnipers(dt) {
      for (const h of entities.hunters) {
        if (h.type !== "sniper") continue;
        if (state.elapsed - h.lastShotAt < 2.1) continue;
        const target = pickTargetForHunter(h);
        if (selectedCharacter.id === "rogue" && target !== player) continue;
        if (selectedCharacter.id === "rogue" && !h.arenaNexusSpawn && !anyOtherEnemyHasLineOfSightToPlayer(h)) continue;
        h.lastShotAt = state.elapsed;
        spawnAttackRing(h.x, h.y, h.r + 6, "#fb7185", 0.2);
        const windup = SNIPER_ARTILLERY_WINDUP;
        const leadT = windup * SNIPER_ARTILLERY_LEAD;
        const tvx = target === player ? player.velX : 0;
        const tvy = target === player ? player.velY : 0;
        let aimX = target.x + tvx * leadT + rand(-12, 12);
        let aimY = target.y + tvy * leadT + rand(-12, 12);
        aimX = clamp(aimX, player.x - VIEW_W * 0.9, player.x + VIEW_W * 0.9);
        aimY = clamp(aimY, player.y - VIEW_H * 0.9, player.y + VIEW_H * 0.9);
        if (sniperArtillerySuppressedByRoulette(h.x, h.y, aimX, aimY)) {
          h.lastShotAt = state.elapsed;
          continue;
        }
        entities.dangerZones.push({
          x: aimX,
          y: aimY,
          r: 28,
          bornAt: state.elapsed,
          detonateAt: state.elapsed + windup,
          lingerUntil: state.elapsed + windup + 1.8,
          nextTickAt: state.elapsed + windup + 0.25,
          tickInterval: 0.3,
          windup,
          exploded: false
        });
        const dist = Math.hypot(aimX - h.x, aimY - h.y) || 1;
        entities.bullets.push({
          x: h.x,
          y: h.y,
          tx: aimX,
          ty: aimY,
          bornAt: state.elapsed,
          life: clamp(0.14 + dist / 2200, 0.16, 0.32)
        });
      }
      for (let i = entities.bullets.length - 1; i >= 0; i--) {
        const b = entities.bullets[i];
        if (state.elapsed - b.bornAt > b.life) {
          entities.bullets.splice(i, 1);
          continue;
        }
        const life = clamp((state.elapsed - b.bornAt) / b.life, 0, 1);
        let hitSpecialBarrier = false;
        for (let s = 0; s <= 16; s++) {
          const u = s / 16;
          const sx = b.x + (b.tx - b.x) * u;
          const sy = b.y + (b.ty - b.y) * u;
          if (isWorldPointOnRouletteHexTile(sx, sy) || isWorldPointOnSurgeLockBarrierTile(sx, sy) || barrierDiskBlocksWorldPoint(sx, sy)) {
            hitSpecialBarrier = true;
            break;
          }
        }
        if (hitSpecialBarrier) {
          const x = b.x + (b.tx - b.x) * life;
          const y = b.y + (b.ty - b.y) * life;
          spawnAttackRing(x, y, 10, "#94a3b8", 0.1);
          entities.bullets.splice(i, 1);
        }
      }
      for (let i = entities.dangerZones.length - 1; i >= 0; i--) {
        const zone = entities.dangerZones[i];
        if (!zone.exploded && state.elapsed >= zone.detonateAt) {
          zone.exploded = true;
          if (!hitDecoyIfAny(zone, zone.r)) {
            const rr = zone.r + player.r;
            if (distSq(zone, player) <= rr * rr) damagePlayer(2);
          }
        }
        if (zone.exploded && state.elapsed < (zone.lingerUntil ?? zone.detonateAt) && state.elapsed >= (zone.nextTickAt ?? Infinity)) {
          zone.nextTickAt += zone.tickInterval ?? 0.3;
          if (!hitDecoyIfAny(zone, zone.r * 0.92)) {
            const rr = zone.r * 0.92 + player.r;
            if (distSq(zone, player) <= rr * rr) damagePlayer(1);
          }
        }
        const zu = zone.windup != null ? zone.windup : 0.8;
        const lingerTotal = Math.max(zu + 0.48, (zone.lingerUntil ?? zone.bornAt) - zone.bornAt);
        if (state.elapsed - zone.bornAt > lingerTotal) entities.dangerZones.splice(i, 1);
      }
    }
    function updateCollisions() {
      for (const h of entities.hunters) {
        if (state.elapsed < h.hitLockUntil) continue;
        if (hitDecoyIfAny(h, h.r + 2)) {
          spawnAttackRing(h.x, h.y, h.r + 7, "#fca5a5", 0.14);
          h.hitLockUntil = state.elapsed + state.enemyHitCooldown;
          continue;
        }
        const rr = h.r + player.r;
        if (distSq(h, player) <= rr * rr) {
          spawnAttackRing(h.x, h.y, h.r + 7, "#fca5a5", 0.14);
          damagePlayer(1);
          h.hitLockUntil = state.elapsed + state.enemyHitCooldown;
        }
      }
      for (let i = entities.pickups.length - 1; i >= 0; i--) {
        const p = entities.pickups[i];
        if (state.elapsed >= p.expiresAt) {
          entities.pickups.splice(i, 1);
          continue;
        }
        const rr = p.r + player.r;
        if (distSq(p, player) <= rr * rr) {
          clearTempHp();
          if (isLunatic()) {
            player.maxHp += 1;
            player.hp = Math.min(player.maxHp, player.hp + 1);
            runLog.event(EVT_HEAL_PICKUP, "Crystal max HP +1", { hpAfter: player.hp, maxHp: player.maxHp });
          } else if (isValiant()) {
            const hurt = [];
            for (let j = 0; j < 3; j++) {
              const s = state.valiantRabbitSlots[j];
              if (s && s.hp < s.maxHp) hurt.push(j);
            }
            if (hurt.length) {
              const ri = hurt[Math.floor(Math.random() * hurt.length)];
              const rb = state.valiantRabbitSlots[ri];
              if (rb) rb.hp = Math.min(rb.maxHp, rb.hp + p.heal);
              runLog.event(EVT_HEAL_PICKUP, "Heal cross to rabbit", { heal: p.heal, will: state.valiantWill });
            }
          } else {
            player.hp = Math.min(player.maxHp, player.hp + p.heal);
            runLog.event(EVT_HEAL_PICKUP, "Picked up heal cross", { heal: p.heal, hpAfter: player.hp, maxHp: player.maxHp });
          }
          const refreshFactor = 0.8;
          for (const ability of [abilities.dash, abilities.burst, abilities.decoy]) {
            const remaining = ability.nextReadyAt - state.elapsed;
            if (remaining > 0) ability.nextReadyAt = state.elapsed + remaining * refreshFactor;
          }
          if (isValiant()) state.valiantRescueReadyAt = abilities.decoy.nextReadyAt;
          entities.pickups.splice(i, 1);
        }
      }
    }
    function cdr(ability) {
      if (ability === abilities.dash) {
        if (isValiant()) return Math.max(0, abilities.dash.nextReadyAt - state.elapsed);
        if (dashState.charges >= dashState.maxCharges) return 0;
        return Math.max(0, dashState.nextRechargeAt - state.elapsed);
      }
      if (ability === abilities.burst && isValiant()) {
        if (valiantBoxChargeState.charges >= valiantBoxChargeState.maxCharges) return 0;
        return Math.max(0, valiantBoxChargeState.nextRechargeAt - state.elapsed);
      }
      return Math.max(0, ability.nextReadyAt - state.elapsed);
    }
    function updateSpecialAbilityEffects(dt) {
      if (inventory.diamondEmpower === "decoyLead" || diamondsOmniEmpowerActive()) {
        for (const d of entities.decoys) {
          const away = vectorToTarget(player, d);
          moveCircleWithCollisions(d, away.x * 110, away.y * 110, dt * spades13AuraEnemyDtMult(d.x, d.y));
        }
      }
      for (let i = entities.shields.length - 1; i >= 0; i--) {
        if (state.elapsed >= entities.shields[i].expiresAt) {
          entities.shields.splice(i, 1);
          continue;
        }
      }
      for (const shield of entities.shields) {
        shield.angle += dt * 3.8;
        shield.x = player.x + Math.cos(shield.angle) * shield.radius;
        shield.y = player.y + Math.sin(shield.angle) * shield.radius;
      }
      for (const shield of entities.shields) {
        for (const h of entities.hunters) {
          if (h.type === "spawner" || h.type === "airSpawner") continue;
          const rr = shield.r + h.r;
          if (distSq(shield, h) > rr * rr) continue;
          const away = vectorToTarget(player, h);
          const test = { x: h.x + away.x * 28, y: h.y + away.y * 28, r: h.r };
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
        let blocked = false;
        for (const shield of entities.shields) {
          const rr = shield.r + p.r;
          if (distSq(shield, p) <= rr * rr) {
            blocked = true;
            spawnAttackRing(shield.x, shield.y, shield.r + 6, "#93c5fd", 0.1);
            break;
          }
        }
        if (blocked) entities.projectiles.splice(i, 1);
      }
      for (let i = entities.bullets.length - 1; i >= 0; i--) {
        const b = entities.bullets[i];
        const life = clamp((state.elapsed - b.bornAt) / b.life, 0, 1);
        const x = b.x + (b.tx - b.x) * life;
        const y = b.y + (b.ty - b.y) * life;
        for (const shield of entities.shields) {
          const rr = shield.r + 3;
          if (distSq({ x, y }, shield) <= rr * rr) {
            entities.bullets.splice(i, 1);
            break;
          }
        }
      }
      if (passive.heartsShieldArc > 0) {
        const facingAngle = Math.atan2(player.facing.y, player.facing.x);
        const halfArc = passive.heartsShieldArc * Math.PI / 360;
        const shieldR = player.r + 30;
        for (const h of entities.hunters) {
          if (h.type === "spawner" || h.type === "airSpawner") continue;
          const dx = h.x - player.x;
          const dy = h.y - player.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d > shieldR + h.r) continue;
          const ang = Math.atan2(dy, dx);
          let delta = ang - facingAngle;
          while (delta > Math.PI) delta -= TAU;
          while (delta < -Math.PI) delta += TAU;
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
          while (delta > Math.PI) delta -= TAU;
          while (delta < -Math.PI) delta += TAU;
          if (Math.abs(delta) > halfArc) continue;
          entities.projectiles.splice(i, 1);
          spawnAttackRing(player.x + dx * 0.65, player.y + dy * 0.65, 12, "#fda4af", 0.12);
        }
      }
    }
    function updateLaserHazards() {
      for (const beam of entities.laserBeams) {
        if (beam.warning || !beam.active) continue;
        if (!hitDecoyAlongSegment(beam.x1, beam.y1, beam.x2, beam.y2, 5)) {
          const hitDist = pointToSegmentDistance(player.x, player.y, beam.x1, beam.y1, beam.x2, beam.y2);
          if (hitDist <= player.r + 5) damagePlayer(2, beam.blueLaser ? { laserBlueSlow: true } : {});
        }
      }
    }
    function update(dt) {
      if (!gameStarted) return;
      if (!state.running) return;
      tickSafehouseEmbedRevealFromWallClock();
      tickSafehouseSpentTileAnimDone();
      if (state.pausedForCard) return;
      const simDt = dt;
      if (state.runLevelUpCinematic) {
        const age = performance.now() - state.runLevelUpCinematic.startMs;
        if (age >= RUN_LEVEL_UP_CINEMATIC_MS) {
          state.runLevelUpCinematic = null;
        } else {
          if (!state.manualPause) {
            state.elapsed += simDt;
            accumulateSafehouseClockFreeze(simDt);
          }
          return;
        }
      }
      if (state.manualPause) return;
      state.elapsed += simDt;
      accumulateSafehouseClockFreeze(simDt);
      if (state.pausedForRoulette) {
        updateRouletteUi(simDt);
        return;
      }
      if (state.pausedForSafehousePrompt || state.pausedForForge) return;
      updateRogueLineOfSightState();
      const enemiesFrozen = state.elapsed < state.playerHeadstartUntil;
      const timelockWorldFrozen = state.timelockEnemyUntil > state.elapsed && state.elapsed >= state.timelockEnemyFrom;
      const pauseHostiles = enemiesFrozen || timelockWorldFrozen;
      const knightSpadesWorldSlowActive = (selectedCharacter.id === "knight" || selectedCharacter.id === "valiant") && state.elapsed < state.knightSpadesWorldSlowUntil;
      const enemySimDt = knightSpadesWorldSlowActive ? simDt * KNIGHT_SPADES_WORLD_SLOW_MULT : simDt;
      state.hurtFlash = Math.max(0, state.hurtFlash - simDt);
      state.screenShakeStrength = Math.max(0, state.screenShakeStrength - simDt * 30);
      if (state.elapsed >= state.playerTimelockUntil) state.playerTimelockUntil = 0;
      if (state.timelockEnemyUntil > 0 && state.elapsed >= state.timelockEnemyUntil) {
        state.timelockEnemyFrom = 0;
        state.timelockEnemyUntil = 0;
      }
      if (state.timelockWorldShakeAt > 0 && state.elapsed >= state.timelockWorldShakeAt) {
        state.timelockWorldShakeAt = 0;
        triggerUltScreenShake(20, 0.38);
      }
      processUltimateBurstWaves();
      if (abilities.random.type && state.elapsed >= abilities.random.nextReadyAt && abilities.random.ammo < abilities.random.maxAmmo) {
        abilities.random.ammo = abilities.random.maxAmmo;
      }
      if (state.tempHp > 0 && state.tempHpExpiry > 0 && state.elapsed >= state.tempHpExpiry) clearTempHp();
      if (inventory.heartsRegenPerSec > 0 && player.hp > 0) {
        if (isValiant()) {
          inventory.heartsRegenBank += inventory.heartsRegenPerSec * simDt;
          while (inventory.heartsRegenBank >= 1) {
            const hurt = [];
            for (let i = 0; i < 3; i++) {
              const s = state.valiantRabbitSlots[i];
              if (s && s.hp < s.maxHp) hurt.push(i);
            }
            if (!hurt.length) {
              inventory.heartsRegenBank = 0;
              break;
            }
            const ri = hurt[Math.floor(Math.random() * hurt.length)];
            const rb = state.valiantRabbitSlots[ri];
            if (!rb) break;
            inventory.heartsRegenBank -= 1;
            rb.hp = Math.min(rb.maxHp, rb.hp + 1);
            spawnHealPopup(player.x, player.y - player.r - 8, "+1 \u2665", "#fda4af");
          }
        } else {
          inventory.heartsRegenBank += inventory.heartsRegenPerSec * simDt;
          while (inventory.heartsRegenBank >= 1 && player.hp < player.maxHp) {
            inventory.heartsRegenBank -= 1;
            player.hp = Math.min(player.maxHp, player.hp + 1);
            spawnHealPopup(player.x, player.y - player.r - 8, "+1", "#86efac");
          }
          if (player.hp >= player.maxHp) inventory.heartsRegenBank = 0;
        }
      }
      if (isLunatic() && player.hp > 0) {
        inventory.lunaticRegenBank += LUNATIC_PASSIVE_HP_PER_SEC * simDt;
        while (inventory.lunaticRegenBank >= 1 && player.hp < player.maxHp) {
          inventory.lunaticRegenBank -= 1;
          player.hp = Math.min(player.maxHp, player.hp + 1);
          spawnHealPopup(player.x, player.y - player.r - 8, "+1", "#fda4af");
        }
        if (player.hp >= player.maxHp) inventory.lunaticRegenBank = 0;
      }
      if (dashState.charges < dashState.maxCharges && state.elapsed >= dashState.nextRechargeAt) {
        dashState.charges = dashState.maxCharges;
        dashState.nextRechargeAt = 0;
      }
      if (isValiant()) {
        if (valiantBoxChargeState.charges < valiantBoxChargeState.maxCharges && state.elapsed >= valiantBoxChargeState.nextRechargeAt) {
          valiantBoxChargeState.charges = valiantBoxChargeState.maxCharges;
          valiantBoxChargeState.nextRechargeAt = 0;
        }
        updateValiantWillDecay(simDt);
      }
      if (isValiant() && state.running && state.elapsed >= state.valiantNextBunnyAt) {
        const lootScale = lootSpawnIntervalScale();
        spawnValiantWildBunny();
        state.valiantNextBunnyAt = state.elapsed + (VALIANT_BUNNY_SPAWN_INTERVAL + rand(-1.1, 2.4)) * lootScale;
      }
      if (isValiant()) updateValiantBunnyPickups();
      if (isValiant()) updateValiantRescueCooldownWhenNoRabbits();
      ensureTilesForPlayer();
      const targetCameraX = player.x - VIEW_W / 2;
      const targetCameraY = player.y - VIEW_H / 2;
      const cameraBlend = 1 - Math.pow(1 - CAMERA_FOLLOW_LERP, simDt * 60);
      cameraX += (targetCameraX - cameraX) * cameraBlend;
      cameraY += (targetCameraY - cameraY) * cameraBlend;
      while (state.spawnScheduled.length && state.spawnScheduled[0].at <= state.elapsed) {
        state.spawnScheduled.shift().fn();
      }
      if (state.elapsed >= state.nextSpawnAt) advanceSpawnWave();
      if (state.elapsed >= state.nextPickupAt) {
        spawnPickup();
        const lootScale = lootSpawnIntervalScale();
        state.nextPickupAt = state.elapsed + (PICKUP_SPAWN_INTERVAL + rand(-0.45, 0.85)) * lootScale;
      }
      if (!isLunatic() && state.elapsed >= state.nextCardAt) {
        spawnCardPickup();
        const lootScale = lootSpawnIntervalScale();
        state.nextCardAt = state.elapsed + (CARD_SPAWN_INTERVAL + rand(-1.6, 3.4)) * lootScale;
      }
      for (let i = entities.hunters.length - 1; i >= 0; i--) {
        if (state.elapsed >= entities.hunters[i].dieAt) entities.hunters.splice(i, 1);
      }
      for (let i = entities.decoys.length - 1; i >= 0; i--) {
        if (state.elapsed >= entities.decoys[i].expiresAt) entities.decoys.splice(i, 1);
      }
      for (let i = entities.attackRings.length - 1; i >= 0; i--) {
        if (state.elapsed >= entities.attackRings[i].expiresAt) entities.attackRings.splice(i, 1);
      }
      for (let i = entities.damageRipples.length - 1; i >= 0; i--) {
        if (state.elapsed >= entities.damageRipples[i].expiresAt) entities.damageRipples.splice(i, 1);
      }
      for (let i = entities.lunaticSprintTierFx.length - 1; i >= 0; i--) {
        if (state.elapsed >= entities.lunaticSprintTierFx[i].expiresAt) entities.lunaticSprintTierFx.splice(i, 1);
      }
      for (let i = entities.ultimateEffects.length - 1; i >= 0; i--) {
        if (state.elapsed >= entities.ultimateEffects[i].expiresAt) entities.ultimateEffects.splice(i, 1);
      }
      for (let i = entities.laserBeams.length - 1; i >= 0; i--) {
        if (state.elapsed >= entities.laserBeams[i].expiresAt) entities.laserBeams.splice(i, 1);
      }
      for (let i = entities.healPopups.length - 1; i >= 0; i--) {
        if (state.elapsed >= entities.healPopups[i].expiresAt) entities.healPopups.splice(i, 1);
      }
      for (let i = entities.valiantElectricBoxes.length - 1; i >= 0; i--) {
        if (state.elapsed >= entities.valiantElectricBoxes[i].expiresAt) entities.valiantElectricBoxes.splice(i, 1);
      }
      for (let i = entities.valiantRabbitFx.length - 1; i >= 0; i--) {
        if (state.elapsed >= entities.valiantRabbitFx[i].expiresAt) entities.valiantRabbitFx.splice(i, 1);
      }
      for (let i = entities.smokeZones.length - 1; i >= 0; i--) {
        if (state.elapsed >= entities.smokeZones[i].expiresAt) entities.smokeZones.splice(i, 1);
      }
      let moveRes = { touchedObstacle: false };
      let moving = false;
      if (isLunatic()) {
        moveRes = updateLunaticMovement(dt, simDt);
        moving = state.lunaticPhase === "sprint" || state.lunaticPhase === "decel" || state.keys.has("arrowleft") || state.keys.has("arrowright") || state.keys.has("arrowup") || state.keys.has("arrowdown");
        lunaticTickRoarTerrain(simDt);
        if (collidesAnyObstacle(player)) ejectPlayerFromObstaclesIfStuck();
      } else {
        let mx = 0;
        let my = 0;
        if (state.keys.has("arrowleft")) mx -= 1;
        if (state.keys.has("arrowright")) mx += 1;
        if (state.keys.has("arrowup")) my -= 1;
        if (state.keys.has("arrowdown")) my += 1;
        if (mx || my) {
          const mlen = Math.hypot(mx, my);
          mx /= mlen;
          my /= mlen;
          player.facing.x = mx;
          player.facing.y = my;
        }
        if (selectedCharacter.id === "rogue" && state.rogueDashAiming) {
          mx = 0;
          my = 0;
        }
        if (state.playerTimelockUntil > 0) {
          mx = 0;
          my = 0;
        }
        const burstSpeedLeg = inventory.diamondEmpower === "speedPassive" || inventory.diamondEmpower === "valiantSpeed" || diamondsOmniEmpowerActive() || state.elapsed < player.burstUntil;
        const wBurstMult = burstSpeedLeg ? knightDiamondBurstEmpowerActive() ? KNIGHT_DIAMOND_BURST_SPEED_MULT : 2 : 1;
        const ultSpeedMult = state.elapsed < player.ultimateSpeedUntil ? 1.75 : 1;
        const terrainMult = state.elapsed < inventory.spadesObstacleBoostUntil ? 1 + passive.obstacleTouchMult : 1;
        const burstBonus = Math.max(0, Math.max(wBurstMult, ultSpeedMult) - 1);
        const passiveBonus = Math.max(0, passive.speedMult - 1);
        const terrainBonus = Math.max(0, terrainMult - 1);
        const hungerLeftRatio = selectedCharacter.id === "rogue" ? clamp(state.rogueHunger / Math.max(1e-3, state.rogueHungerMax), 0, 1) : 1;
        const rogueDesperationSpeed = selectedCharacter.id === "rogue" ? (1 - hungerLeftRatio) * ROGUE_DESPERATION_SPEED_MAX : 0;
        const speedMult = 1 + burstBonus + passiveBonus + terrainBonus + rogueDesperationSpeed;
        const laserSlowMult = state.elapsed < state.playerLaserSlowUntil ? LASER_BLUE_PLAYER_SLOW_MULT : 1;
        const effectiveSpeed = player.speed * speedMult * playerSpeedHealthMultiplier() * laserSlowMult;
        moving = mx !== 0 || my !== 0;
        const phaseThrough = inventory.clubsPhaseThroughTerrain && (selectedCharacter.id === "rogue" ? playerInsideSmoke() : state.elapsed < player.burstUntil);
        moveRes = moveCircleWithCollisions(player, mx * effectiveSpeed, my * effectiveSpeed, dt, {
          ignoreObstacles: phaseThrough
        });
        if (!phaseThrough && collidesAnyObstacle(player)) {
          ejectPlayerFromObstaclesIfStuck();
        }
      }
      clampPlayerToArenaNexusInnerHex();
      clampPlayerToSurgeLockHex();
      clampPlayerOutOfSpentSafehouseCore();
      if (moving && moveRes.touchedObstacle && passive.obstacleTouchMult > 1) {
        inventory.spadesObstacleBoostUntil = state.elapsed + TERRAIN_SPEED_BOOST_LINGER;
      }
      updateRogueNeeds(simDt, moving, moveRes.touchedObstacle);
      if (!state.running) return;
      updatePlayerVelocity(dt);
      updateArenaNexus(simDt);
      updateRouletteHex(simDt);
      updateSafehouseHex(simDt);
      updateForgeHex(simDt);
      updateSafehouseSpendAfterLevelLeave();
      updateSurgeHex(simDt);
      if (!pauseHostiles) {
        moveHunters(enemySimDt);
        updateSnipers(enemySimDt);
        updateRangedAttackers(enemySimDt);
        updateSpawners(enemySimDt);
      }
      ejectHuntersFromLockedSpecialHexes();
      clampArenaNexusDefendersToRing();
      updateSpecialAbilityEffects(enemySimDt);
      if (!pauseHostiles) {
        updateLaserHazards();
        updateCollisions();
      }
      updateCardPickups();
      if (state.setBonusChoicePendingSuit && state.inventoryModalOpen && !state.pausedForRoulette && !state.pausedForSafehousePrompt && !state.pausedForForge)
        showSetBonusChoice();
    }
    function drawHud() {
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "15px Arial";
      ctx.fillText("Survival: " + runClockEffectiveSec().toFixed(1) + "s", 14, 12);
      ctx.fillText("Best: " + state.bestSurvival.toFixed(1) + "s", 14, 32);
      ctx.fillText("Level: " + displayWorldLevel(), 14, 52);
      ctx.fillText("Wave: " + state.wave, 14, 72);
      ctx.fillText("Hunters: " + entities.hunters.length, 14, 92);
      if (selectedCharacter.id === "rogue") {
        const ratio = clamp(state.rogueHunger / Math.max(1e-3, state.rogueHungerMax), 0, 1);
        const x = 14;
        const y = 114;
        const w = 160;
        const h = 10;
        ctx.fillStyle = "rgba(51, 65, 85, 0.9)";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = ratio > 0.35 ? "#f59e0b" : "#ef4444";
        ctx.fillRect(x, y, w * ratio, h);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
        ctx.fillStyle = "#fde68a";
        ctx.fillText(`Fed: ${state.rogueHunger.toFixed(1)}s`, x, y + 14);
        if (state.rogueStealthActive) {
          ctx.fillStyle = "#bbf7d0";
          ctx.fillText("Stealthed", x, y + 31);
        } else if (state.elapsed <= state.rogueAlertUntil) {
          ctx.fillStyle = "#fca5a5";
          ctx.fillText("Alerted", x, y + 31);
        } else {
          ctx.fillStyle = "#93c5fd";
          ctx.fillText("Seeking", x, y + 31);
        }
      }
      if (isValiant()) {
        const x = 14;
        const y = 114;
        const w = 160;
        const h = 10;
        const occ = valiantOccupiedRabbitCount();
        const empty = 3 - occ;
        const netPerSec = valiantWillNetChangePerSec();
        ctx.fillStyle = "rgba(51, 65, 85, 0.9)";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = state.valiantWill > 0.22 ? "#a5b4fc" : "#fb7185";
        ctx.fillRect(x, y, w * clamp(state.valiantWill, 0, 1), h);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
        ctx.fillStyle = "#e0e7ff";
        ctx.fillText(`Will ${(state.valiantWill * 100).toFixed(0)}%`, x, y + 14);
        ctx.font = "12px Arial";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(
          `Rabbits: ${occ}/3 (${empty} empty) \u2014 ${netPerSec >= 0 ? "+" : ""}${netPerSec.toFixed(3)} Will/s`,
          x,
          y + 30
        );
        ctx.font = "15px Arial";
      }
    }
    function drawRogueSurvivalHud(ctx2) {
      if (selectedCharacter.id !== "rogue") return;
      const arcR = player.r + 12;
      const trackStroke = "rgba(148, 163, 184, 0.42)";
      const trackStrokeWide = "rgba(30, 41, 59, 0.55)";
      ctx2.save();
      ctx2.lineCap = "round";
      if (state.rogueStealthActive) {
        const graceRem = state.rogueStealthOpenUntil - state.elapsed;
        const graceRatio = clamp(graceRem / Math.max(1e-3, ROGUE_STEALTH_OPEN_GRACE), 0, 1);
        if (graceRatio > 0.02) {
          const sCx = player.x;
          const sCy = player.y;
          const sLeft = -Math.PI * 0.8;
          const sRight = -Math.PI * 0.2;
          const stealthFill = graceRatio > 0.35 ? "#6ee7b7" : "#34d399";
          ctx2.strokeStyle = trackStrokeWide;
          ctx2.lineWidth = 3;
          ctx2.beginPath();
          ctx2.arc(sCx, sCy, arcR, sLeft, sRight);
          ctx2.stroke();
          ctx2.strokeStyle = trackStroke;
          ctx2.lineWidth = 2;
          ctx2.beginPath();
          ctx2.arc(sCx, sCy, arcR, sLeft, sRight);
          ctx2.stroke();
          ctx2.strokeStyle = stealthFill;
          ctx2.lineWidth = 2;
          ctx2.beginPath();
          const stealthEnd = sLeft + (sRight - sLeft) * graceRatio;
          ctx2.arc(sCx, sCy, arcR, stealthEnd, sLeft, true);
          ctx2.stroke();
        }
      }
      const ratio = clamp(state.rogueHunger / Math.max(1e-3, state.rogueHungerMax), 0, 1);
      const hungerFill = ratio > 0.35 ? "#f59e0b" : "#ef4444";
      const hCx = player.x;
      const hCy = player.y;
      const hLeft = Math.PI * 0.2;
      const hRight = Math.PI * 0.8;
      ctx2.strokeStyle = trackStrokeWide;
      ctx2.lineWidth = 3;
      ctx2.beginPath();
      ctx2.arc(hCx, hCy, arcR, hLeft, hRight);
      ctx2.stroke();
      ctx2.strokeStyle = trackStroke;
      ctx2.lineWidth = 2;
      ctx2.beginPath();
      ctx2.arc(hCx, hCy, arcR, hLeft, hRight);
      ctx2.stroke();
      if (ratio > 1e-3) {
        ctx2.strokeStyle = hungerFill;
        ctx2.lineWidth = 2;
        ctx2.beginPath();
        const hungerStart = hRight - (hRight - hLeft) * ratio;
        ctx2.arc(hCx, hCy, arcR, hungerStart, hRight);
        ctx2.stroke();
      }
      ctx2.restore();
    }
    function updateAbilityButtons() {
      if (!abilitySlots) return;
      if (isLunatic()) {
        const sprintCdRem = Math.max(0, state.lunaticPressSprintUnlockAt - state.elapsed);
        const stopCdRem = Math.max(0, state.lunaticPressStopUnlockAt - state.elapsed);
        const wBarRem = Math.max(sprintCdRem, stopCdRem);
        const roarRem = Math.max(0, state.lunaticRoarReadyAt - state.elapsed);
        const abilitiesUi2 = [
          {
            key: abilities.dash.key.toUpperCase(),
            label: abilities.dash.label,
            color: "#38bdf8",
            remaining: 0,
            duration: 1e-3,
            extra: "Hold"
          },
          {
            key: abilities.burst.key.toUpperCase(),
            label: abilities.burst.label,
            color: "#22d3ee",
            remaining: wBarRem,
            duration: LUNATIC_W_TOGGLE_COOLDOWN_SEC,
            extra: "Stumble/Sprint",
            lunaticSprintCdRem: sprintCdRem,
            lunaticStopCdRem: stopCdRem
          },
          {
            key: abilities.decoy.key.toUpperCase(),
            label: abilities.decoy.label,
            color: "#a78bfa",
            remaining: 0,
            duration: 1e-3,
            extra: "Hold"
          },
          {
            key: abilities.random.key.toUpperCase(),
            label: abilities.random.label,
            color: "#f97316",
            remaining: roarRem,
            duration: LUNATIC_ROAR_COOLDOWN_SEC,
            extra: state.lunaticPhase === "sprint" ? "Sprint" : "\u2014"
          }
        ];
        for (let i = 0; i < abilitiesUi2.length; i++) {
          const info = abilitiesUi2[i];
          const slot = abilitySlots[i];
          if (!slot) continue;
          const fill = slot.querySelector(".ability-fill");
          const keyEl = slot.querySelector(".ability-key");
          const labelEl = slot.querySelector(".ability-label");
          const valueEl = slot.querySelector(".ability-value");
          if (!fill || !keyEl || !labelEl || !valueEl) continue;
          const cooldownProgress = clamp(1 - info.remaining / Math.max(1e-3, info.duration), 0, 1);
          fill.style.width = `${Math.round(cooldownProgress * 100)}%`;
          keyEl.textContent = info.key;
          labelEl.textContent = info.label;
          if (i === 1 && info.lunaticSprintCdRem != null && info.lunaticStopCdRem != null) {
            const fmt = (r) => r < 0.05 ? "ready" : `${r.toFixed(1)}s`;
            valueEl.classList.add("ability-value--lunatic-w");
            valueEl.textContent = `Sprint ${fmt(info.lunaticSprintCdRem)}
Stop ${fmt(info.lunaticStopCdRem)}`;
          } else {
            valueEl.classList.remove("ability-value--lunatic-w");
            valueEl.textContent = info.extra;
          }
          slot.style.borderColor = info.color;
        }
        return;
      }
      if (isValiant()) {
        const dashReduction2 = Math.max(0, passive.cooldownFlat.dash || 0);
        const burstReduction2 = Math.max(0, passive.cooldownFlat.burst || 0);
        const decoyReduction2 = Math.max(0, passive.cooldownFlat.decoy || 0);
        const dashPct2 = Math.max(0, passive.cooldownPct.dash || 0);
        const burstPct2 = Math.max(0, passive.cooldownPct.burst || 0);
        const decoyPct2 = Math.max(0, passive.cooldownPct.decoy || 0);
        const cdrSuffix2 = (base, reduction) => {
          if (!(reduction > 1e-3) || !(base > 1e-3)) return "";
          const pct = Math.round(reduction / base * 100);
          return ` -${reduction.toFixed(1)}s -${pct}%`;
        };
        const cdrPctSuffix2 = (pct) => pct > 1e-3 ? ` -${Math.round(pct * 100)}%` : "";
        const rescueRem = Math.max(0, state.valiantRescueReadyAt - state.elapsed);
        const rescueDur = effectiveAbilityCooldown("decoy", VALIANT_RESCUE_COOLDOWN_SEC, 0.5);
        const abilitiesUi2 = [
          {
            key: abilities.dash.key.toUpperCase(),
            label: `${abilities.dash.label}` + (dashPct2 > 1e-3 ? cdrPctSuffix2(dashPct2) : cdrSuffix2(abilities.dash.cooldown, dashReduction2)),
            color: "#38bdf8",
            remaining: cdr(abilities.dash),
            duration: effectiveAbilityCooldown("dash", abilities.dash.cooldown, abilities.dash.minCooldown ?? 0.45),
            extra: ""
          },
          {
            key: abilities.burst.key.toUpperCase(),
            label: `${abilities.burst.label}` + (burstPct2 > 1e-3 ? cdrPctSuffix2(burstPct2) : cdrSuffix2(abilities.burst.cooldown, burstReduction2)),
            color: "#22d3ee",
            remaining: cdr(abilities.burst),
            duration: effectiveAbilityCooldown("burst", abilities.burst.cooldown, abilities.burst.minCooldown ?? 0.5),
            extra: `${valiantBoxChargeState.charges}/${valiantBoxChargeState.maxCharges}`
          },
          {
            key: abilities.decoy.key.toUpperCase(),
            label: `${abilities.decoy.label}` + (decoyPct2 > 1e-3 ? cdrPctSuffix2(decoyPct2) : cdrSuffix2(VALIANT_RESCUE_COOLDOWN_SEC, decoyReduction2)),
            color: "#a78bfa",
            remaining: rescueRem,
            duration: rescueDur,
            extra: ""
          },
          (() => {
            const ult = abilities.random;
            const type = ult.type;
            const hasAbility = !!type;
            const displayName = type === "burst" ? "Push" : hasAbility ? type[0].toUpperCase() + type.slice(1) : "None";
            const cdRem = hasAbility ? Math.max(0, ult.nextReadyAt - state.elapsed) : 0;
            const ready = hasAbility && ult.ammo > 0 && cdRem <= 1e-3;
            let color = "#64748b";
            if (type === "shield") color = "#60a5fa";
            if (type === "burst") color = "#fde68a";
            if (type === "timelock") color = "#c084fc";
            if (type === "heal") color = "#4ade80";
            return {
              key: ult.key.toUpperCase(),
              label: displayName,
              color,
              remaining: ready ? 0 : hasAbility ? cdRem : 0,
              duration: hasAbility ? ULTIMATE_ABILITY_COOLDOWN_SEC : 1,
              extra: hasAbility ? `${ult.ammo}/${ult.maxAmmo}` : "0/0"
            };
          })()
        ];
        for (let i = 0; i < abilitiesUi2.length; i++) {
          const info = abilitiesUi2[i];
          const slot = abilitySlots[i];
          if (!slot) continue;
          const fill = slot.querySelector(".ability-fill");
          const keyEl = slot.querySelector(".ability-key");
          const labelEl = slot.querySelector(".ability-label");
          const valueEl = slot.querySelector(".ability-value");
          if (!fill || !keyEl || !labelEl || !valueEl) continue;
          const cooldownProgress = clamp(1 - info.remaining / Math.max(1e-3, info.duration), 0, 1);
          fill.style.width = `${Math.round(cooldownProgress * 100)}%`;
          fill.style.background = info.color;
          fill.style.opacity = String(0.2 + cooldownProgress * 0.75);
          keyEl.textContent = info.key;
          labelEl.textContent = info.label;
          valueEl.classList.remove("ability-value--lunatic-w");
          valueEl.textContent = info.extra;
          slot.style.borderColor = info.color;
        }
        return;
      }
      const dashReduction = Math.max(0, passive.cooldownFlat.dash || 0);
      const burstReduction = Math.max(0, passive.cooldownFlat.burst || 0);
      const decoyReduction = Math.max(
        0,
        (passive.cooldownFlat.decoy || 0) + (selectedCharacter.id === "knight" && (inventory.diamondEmpower === "decoyLead" || diamondsOmniEmpowerActive()) ? 2 : 0)
      );
      const dashPct = Math.max(0, passive.cooldownPct.dash || 0);
      const burstPct = Math.max(0, passive.cooldownPct.burst || 0);
      const decoyPct = Math.max(0, passive.cooldownPct.decoy || 0);
      const cdrSuffix = (base, reduction) => {
        if (!(reduction > 1e-3) || !(base > 1e-3)) return "";
        const pct = Math.round(reduction / base * 100);
        return ` -${reduction.toFixed(1)}s -${pct}%`;
      };
      const cdrPctSuffix = (pct) => pct > 1e-3 ? ` -${Math.round(pct * 100)}%` : "";
      const abilitiesUi = [
        {
          key: abilities.dash.key.toUpperCase(),
          label: `${abilities.dash.label}` + (dashPct > 1e-3 ? cdrPctSuffix(dashPct) : cdrSuffix(abilities.dash.cooldown, dashReduction)),
          color: "#38bdf8",
          remaining: cdr(abilities.dash),
          duration: effectiveAbilityCooldown("dash", abilities.dash.cooldown, abilities.dash.minCooldown ?? 0.25),
          extra: `${dashState.charges}/${dashState.maxCharges}`
        },
        {
          key: abilities.burst.key.toUpperCase(),
          label: `${abilities.burst.label}` + (burstPct > 1e-3 ? cdrPctSuffix(burstPct) : cdrSuffix(abilities.burst.cooldown, burstReduction)),
          color: "#22d3ee",
          remaining: cdr(abilities.burst),
          duration: effectiveAbilityCooldown("burst", abilities.burst.cooldown, abilities.burst.minCooldown ?? 0.4),
          extra: ""
        },
        {
          key: abilities.decoy.key.toUpperCase(),
          label: `${abilities.decoy.label}` + (decoyPct > 1e-3 ? cdrPctSuffix(decoyPct) : cdrSuffix(abilities.decoy.cooldown, decoyReduction)),
          color: "#a78bfa",
          remaining: cdr(abilities.decoy),
          duration: effectiveAbilityCooldown(
            "decoy",
            abilities.decoy.cooldown,
            abilities.decoy.minCooldown ?? 0.4,
            selectedCharacter.id === "knight" && (inventory.diamondEmpower === "decoyLead" || diamondsOmniEmpowerActive()) ? 2 : 0
          ),
          extra: ""
        },
        (() => {
          const ult = abilities.random;
          const type = ult.type;
          const hasAbility = !!type;
          const displayName = type === "burst" ? "Push" : hasAbility ? type[0].toUpperCase() + type.slice(1) : "None";
          const cdRem = hasAbility ? Math.max(0, ult.nextReadyAt - state.elapsed) : 0;
          const ready = hasAbility && ult.ammo > 0 && cdRem <= 1e-3;
          let color = "#64748b";
          if (type === "shield") color = "#60a5fa";
          if (type === "burst") color = "#fde68a";
          if (type === "timelock") color = "#c084fc";
          if (type === "heal") color = "#4ade80";
          return {
            key: ult.key.toUpperCase(),
            label: displayName,
            color,
            remaining: ready ? 0 : hasAbility ? cdRem : 0,
            duration: hasAbility ? ULTIMATE_ABILITY_COOLDOWN_SEC : 1,
            extra: hasAbility ? `${ult.ammo}/${ult.maxAmmo}` : "0/0"
          };
        })()
      ];
      for (let i = 0; i < abilitiesUi.length; i++) {
        const info = abilitiesUi[i];
        const slot = abilitySlots[i];
        if (!slot) continue;
        const fill = slot.querySelector(".ability-fill");
        const keyEl = slot.querySelector(".ability-key");
        const labelEl = slot.querySelector(".ability-label");
        const valueEl = slot.querySelector(".ability-value");
        if (!fill || !keyEl || !labelEl || !valueEl) continue;
        const cooldownProgress = clamp(1 - info.remaining / Math.max(1e-3, info.duration), 0, 1);
        fill.style.width = `${Math.round(cooldownProgress * 100)}%`;
        fill.style.background = info.color;
        fill.style.opacity = String(0.2 + cooldownProgress * 0.75);
        keyEl.textContent = info.key;
        labelEl.textContent = info.label;
        const cooldownText = info.remaining > 0.01 ? info.remaining.toFixed(1) + "s" : info.extra || "READY";
        valueEl.classList.remove("ability-value--lunatic-w");
        valueEl.textContent = cooldownText;
      }
    }
    function rogueFoodBurgerStackHalfHeight(rr) {
      return rr * 1.92 / 2;
    }
    function drawRogueFoodBurger(ctx2, cx, cy, rr, foodVis, freshness, sense, near) {
      const aBase = foodVis * (0.42 + 0.58 * freshness);
      const pulse = sense > 0 ? 0.12 * (0.45 + near * 0.35) : 0;
      const fillA = (opacity) => clamp(aBase * opacity + pulse, 0, 1);
      const H = rr * 1.92;
      const rxOuter = rr * 0.98;
      const ryOuter = H / 2;
      const ryTop = rr * 0.36;
      const ryBot = rr * 0.34;
      const ryPat = rr * 0.19;
      const ryLet = rr * 0.055;
      const ryCh = rr * 0.048;
      const rxTop = rxOuter * 0.96;
      const rxBot = rxOuter * 0.94;
      const rxPat = rxOuter * 0.88;
      const rxLet = rxOuter * 0.72;
      const rxCh = rxOuter * 0.76;
      const yTop = cy - ryOuter;
      const cyTopBun = yTop + ryTop;
      const yBot = cy + ryOuter;
      const cyBotBun = yBot - ryBot;
      const midY = (cyTopBun + ryTop + (cyBotBun - ryBot)) / 2;
      const cyPat = midY;
      const cyLet = midY - ryPat * 0.62 - ryLet * 0.5;
      const cyCh = midY - ryPat * 0.22;
      ctx2.fillStyle = `rgba(245, 158, 11, ${fillA(0.1)})`;
      ctx2.beginPath();
      ctx2.ellipse(cx, cy, rxOuter * 1.02, ryOuter * 1.02, 0, 0, TAU);
      ctx2.fill();
      ctx2.fillStyle = `rgba(217, 119, 6, ${fillA(0.88)})`;
      ctx2.beginPath();
      ctx2.ellipse(cx, cyBotBun, rxBot, ryBot, 0, 0, TAU);
      ctx2.fill();
      ctx2.fillStyle = `rgba(251, 191, 36, ${fillA(0.35)})`;
      ctx2.beginPath();
      ctx2.ellipse(cx, cyBotBun - ryBot * 0.22, rxBot * 0.62, ryBot * 0.38, 0, 0, TAU);
      ctx2.fill();
      ctx2.fillStyle = `rgba(78, 42, 16, ${fillA(0.92)})`;
      ctx2.beginPath();
      ctx2.ellipse(cx, cyPat, rxPat, ryPat, 0, 0, TAU);
      ctx2.fill();
      ctx2.fillStyle = `rgba(253, 224, 71, ${fillA(0.72)})`;
      ctx2.beginPath();
      ctx2.ellipse(cx, cyCh, rxCh, ryCh, 0, 0, TAU);
      ctx2.fill();
      ctx2.fillStyle = `rgba(52, 211, 153, ${fillA(0.5)})`;
      ctx2.beginPath();
      ctx2.ellipse(cx, cyLet, rxLet, ryLet, 0, 0, TAU);
      ctx2.fill();
      ctx2.fillStyle = `rgba(254, 243, 199, ${fillA(0.92)})`;
      ctx2.beginPath();
      ctx2.ellipse(cx, cyTopBun, rxTop, ryTop, 0, 0, TAU);
      ctx2.fill();
      ctx2.fillStyle = `rgba(255, 251, 235, ${fillA(0.45)})`;
      ctx2.beginPath();
      ctx2.ellipse(cx, cyTopBun - ryTop * 0.28, rxTop * 0.55, ryTop * 0.42, 0, 0, TAU);
      ctx2.fill();
      if (sense > 0) {
        const pd = 4 + near * 3.5;
        ctx2.strokeStyle = `rgba(252, 211, 77, ${(0.45 + near * 0.35) * (0.42 + 0.58 * freshness)})`;
        ctx2.lineWidth = 1.5;
        ctx2.beginPath();
        ctx2.ellipse(cx, cy, rxOuter + pd, ryOuter + pd * 0.85, 0, 0, TAU);
        ctx2.stroke();
      }
    }
    function drawLaserBeamFancy(ctx2, beam) {
      const x1 = beam.x1;
      const y1 = beam.y1;
      const x2 = beam.x2;
      const y2 = beam.y2;
      const len = Math.hypot(x2 - x1, y2 - y1) || 1;
      const ang = Math.atan2(y2 - y1, x2 - x1);
      const blue = !!beam.blueLaser;
      const pulse = 0.5 + 0.5 * Math.sin(state.elapsed * (beam.warning ? 26 : 16));
      ctx2.save();
      ctx2.translate(x1, y1);
      ctx2.rotate(ang);
      ctx2.lineCap = "round";
      if (beam.warning) {
        const t = clamp((state.elapsed - beam.bornAt) / Math.max(1e-3, beam.expiresAt - beam.bornAt), 0, 1);
        const fade = 0.42 + 0.48 * (1 - t * 0.4);
        ctx2.shadowBlur = blue ? 20 : 16;
        ctx2.shadowColor = blue ? "rgba(56, 189, 248, 0.75)" : "rgba(248, 113, 113, 0.7)";
        const gWide = ctx2.createLinearGradient(0, 0, len, 0);
        if (blue) {
          gWide.addColorStop(0, `rgba(191, 219, 254, ${0.12 * fade})`);
          gWide.addColorStop(0.35, `rgba(96, 165, 250, ${0.38 * fade + 0.12 * pulse})`);
          gWide.addColorStop(1, `rgba(30, 64, 175, ${0.35 * fade})`);
        } else {
          gWide.addColorStop(0, `rgba(254, 226, 226, ${0.14 * fade})`);
          gWide.addColorStop(0.35, `rgba(248, 113, 113, ${0.42 * fade + 0.18 * pulse})`);
          gWide.addColorStop(1, `rgba(127, 29, 29, ${0.38 * fade})`);
        }
        ctx2.strokeStyle = gWide;
        ctx2.lineWidth = 11 + pulse * 5;
        ctx2.setLineDash([16, 9]);
        ctx2.lineDashOffset = -state.elapsed * 130;
        ctx2.beginPath();
        ctx2.moveTo(0, 0);
        ctx2.lineTo(len, 0);
        ctx2.stroke();
        ctx2.strokeStyle = blue ? `rgba(224, 242, 254, ${0.35 + 0.4 * pulse})` : `rgba(254, 249, 239, ${0.38 + 0.42 * pulse})`;
        ctx2.lineWidth = 3.2 + pulse * 1.8;
        ctx2.setLineDash([9, 11]);
        ctx2.lineDashOffset = state.elapsed * 100;
        ctx2.stroke();
        ctx2.setLineDash([]);
        ctx2.shadowBlur = 0;
      } else {
        ctx2.shadowBlur = blue ? 28 : 24;
        ctx2.shadowColor = blue ? "rgba(56, 189, 248, 0.85)" : "rgba(251, 113, 133, 0.8)";
        const gBody = ctx2.createLinearGradient(0, 0, len, 0);
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
        ctx2.strokeStyle = gBody;
        ctx2.lineWidth = blue ? 9 : 10;
        ctx2.beginPath();
        ctx2.moveTo(0, 0);
        ctx2.lineTo(len, 0);
        ctx2.stroke();
        ctx2.shadowBlur = 0;
        ctx2.strokeStyle = blue ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 250, 250, 0.95)";
        ctx2.lineWidth = blue ? 2.4 : 2.6;
        ctx2.beginPath();
        ctx2.moveTo(0, 0);
        ctx2.lineTo(len, 0);
        ctx2.stroke();
      }
      ctx2.restore();
    }
    function drawRunLevelUpCinematic() {
      const cin = state.runLevelUpCinematic;
      if (!cin) return;
      const age = performance.now() - cin.startMs;
      if (age >= RUN_LEVEL_UP_CINEMATIC_MS) return;
      const w = world.w;
      const h = world.h;
      let dark = 0;
      let flash = 0;
      if (age < 620) {
        dark = age / 620 * 0.84;
      } else if (age < 820) {
        const u = (age - 620) / 200;
        dark = 0.84 * (1 - u * u);
        flash = Math.sin(u * Math.PI) * 0.95;
      } else if (age < 1380) {
        const u = (age - 820) / 560;
        flash = (1 - u) * 0.22;
        dark = 0;
      }
      if (dark > 0) {
        ctx.fillStyle = `rgba(2, 6, 23, ${dark})`;
        ctx.fillRect(0, 0, w, h);
      }
      if (flash > 0) {
        ctx.fillStyle = `rgba(255, 253, 245, ${flash})`;
        ctx.fillRect(0, 0, w, h);
      }
      if (age >= 780 && age < 2480) {
        const te = clamp((age - 780) / 400, 0, 1);
        const tout = age > 1980 ? clamp((2480 - age) / 500, 0, 1) : 1;
        const ta = (0.2 + 0.8 * Math.sin(te * (Math.PI / 2))) * tout;
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `bold ${Math.round(44 + 18 * te)}px Arial`;
        ctx.fillStyle = `rgba(248, 250, 252, ${ta})`;
        ctx.shadowColor = "rgba(251, 191, 36, 0.65)";
        ctx.shadowBlur = 22 + 16 * te;
        ctx.fillText(`LEVEL ${cin.announceLevel}`, w / 2, h / 2);
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    }
    function render(tsMs) {
      const deathElapsed = state.running ? 0 : Math.max(0, (tsMs - state.deathStartedAtMs) / 1e3);
      const deathAnimDone = !state.running && deathElapsed >= DEATH_ANIM_DURATION;
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, world.w, world.h);
      const shake = state.elapsed < state.screenShakeUntil ? {
        x: (Math.random() * 2 - 1) * state.screenShakeStrength,
        y: (Math.random() * 2 - 1) * state.screenShakeStrength
      } : { x: 0, y: 0 };
      ctx.save();
      ctx.translate(-cameraX + shake.x, -cameraY + shake.y);
      drawObstacles(ctx, obstacles);
      drawSafehouseHexWorld(ctx);
      drawArenaNexusWorld(ctx);
      drawRouletteHexWorld(ctx);
      drawSurgeHexWorld(ctx);
      if (state.elapsed < state.rouletteScreenFlashUntil && (hasAnyRouletteHexSite() || !isLunatic() && state.safehouseInnerFacilitiesUnlocked)) {
        const u = clamp((state.rouletteScreenFlashUntil - state.elapsed) / 0.4, 0, 1);
        ctx.fillStyle = `rgba(220, 38, 38, ${0.38 * u})`;
        if (hasAnyRouletteHexSite()) {
          for (const { q, r } of collectRouletteHexAxials()) {
            const c = hexToWorld(q, r);
            ctx.beginPath();
            ctx.arc(c.x, c.y, HEX_SIZE * 0.98, 0, TAU);
            ctx.fill();
          }
        }
        if (!isLunatic() && state.safehouseInnerFacilitiesUnlocked) {
          const prim = getPrimarySafehouseAxial();
          if (prim) {
            const rw = getSafehouseEmbeddedRouletteWorld(prim);
            const rr = safehouseEmbedSiteHitR();
            ctx.beginPath();
            ctx.arc(rw.x, rw.y, rr, 0, TAU);
            ctx.fill();
          }
        }
      }
      if (state.surgePhase === 2 && state.elapsed < state.surgeScreenFlashUntil) {
        const u = clamp((state.surgeScreenFlashUntil - state.elapsed) / SURGE_TILE_FLASH_SEC, 0, 1);
        ctx.fillStyle = `rgba(220, 38, 38, ${0.42 * u})`;
        const c = hexToWorld(state.surgeLockQ, state.surgeLockR);
        ctx.beginPath();
        ctx.arc(c.x, c.y, HEX_SIZE * 0.98, 0, TAU);
        ctx.fill();
      }
      for (const smoke of entities.smokeZones) {
        const t = clamp((state.elapsed - smoke.bornAt) / Math.max(1e-3, smoke.expiresAt - smoke.bornAt), 0, 1);
        const alpha = 0.26 * (1 - t * 0.55);
        drawCircle(ctx, smoke.x, smoke.y, smoke.r, "#1f2937", alpha);
        ctx.strokeStyle = `rgba(203, 213, 225, ${0.25 * (1 - t)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(smoke.x, smoke.y, smoke.r, 0, TAU);
        ctx.stroke();
      }
      drawValiantShockFields(ctx);
      for (const bn of entities.valiantBunnies) {
        if (state.elapsed >= bn.expiresAt) continue;
        const { x, y, r } = bn;
        ctx.fillStyle = "#fecdd3";
        ctx.beginPath();
        ctx.ellipse(x, y + r * 0.08, r * 0.82, r * 0.68, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#fb7185";
        ctx.beginPath();
        ctx.ellipse(x - r * 0.55, y - r * 0.42, r * 0.28, r * 0.5, -0.4, 0, TAU);
        ctx.ellipse(x + r * 0.55, y - r * 0.42, r * 0.28, r * 0.5, 0.4, 0, TAU);
        ctx.fill();
      }
      for (const food of entities.foods) {
        const lifeTotal = Math.max(1e-3, food.expiresAt - food.bornAt);
        const lifeLeft = clamp((food.expiresAt - state.elapsed) / lifeTotal, 0, 1);
        const freshness = lifeLeft;
        const foodVis = 0.55 + 0.45 * freshness;
        const d = Math.hypot(food.x - player.x, food.y - player.y);
        const near = clamp(1 - d / 360, 0, 1);
        const sense = state.elapsed < state.rogueFoodSenseUntil ? 1 : 0;
        const rr = food.r * (1 + near * 0.28 * sense);
        drawRogueFoodBurger(ctx, food.x, food.y, rr, foodVis, freshness, sense, near);
        const barW = 34;
        const barH = 4;
        const bx = food.x - barW / 2;
        const by = food.y + rogueFoodBurgerStackHalfHeight(rr) + 6;
        ctx.fillStyle = "rgba(148, 163, 184, 0.32)";
        ctx.fillRect(bx, by, barW, barH);
        ctx.fillStyle = lifeLeft > 0.35 ? "#f59e0b" : "#ef4444";
        ctx.fillRect(bx, by, barW * lifeLeft, barH);
      }
      if (selectedCharacter.id === "rogue" && state.rogueStealthActive) {
        const safeRadius = 56;
        const info = nearestTerrainInfo(player.x, player.y);
        const terrainDist = Number.isFinite(info.dist) ? info.dist : safeRadius;
        const inSafeRange = terrainDist <= safeRadius;
        const ringColor = inSafeRange ? "rgba(110, 231, 183, 0.72)" : "rgba(248, 113, 113, 0.72)";
        ctx.strokeStyle = "rgba(16, 185, 129, 0.22)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(player.x, player.y, safeRadius, 0, TAU);
        ctx.stroke();
        if (info.point && inSafeRange) {
          ctx.strokeStyle = ringColor;
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(player.x, player.y);
          ctx.lineTo(info.point.x, info.point.y);
          ctx.stroke();
          drawCircle(ctx, info.point.x, info.point.y, 3.4, "#a7f3d0", 0.95);
        }
      }
      for (const p of entities.pickups) {
        drawHealPickup(ctx, p, state.elapsed);
        const lifeLeft = clamp((p.expiresAt - state.elapsed) / (p.life || 1e-3), 0, 1);
        const barW = 34;
        const barH = 4;
        const bx = p.x - barW / 2;
        const by = p.y + (p.plusHalf ?? HEAL_PICKUP_PLUS_HALF) + 12;
        ctx.fillStyle = "rgba(148, 163, 184, 0.32)";
        ctx.fillRect(bx, by, barW, barH);
        ctx.fillStyle = lifeLeft > 0.35 ? "#22c55e" : "#ef4444";
        ctx.fillRect(bx, by, barW * lifeLeft, barH);
      }
      for (const c of entities.cards) drawCardPickupWorld(ctx, c, state.elapsed);
      for (const d of entities.decoys) drawDecoyBody(ctx, d);
      for (const zone of entities.dangerZones) {
        const zu = zone.windup != null ? zone.windup : 0.8;
        const life = clamp((state.elapsed - zone.bornAt) / zu, 0, 1);
        const lingering = zone.exploded && state.elapsed < (zone.lingerUntil ?? zone.detonateAt);
        const tSinceDet = state.elapsed - zone.detonateAt;
        const inBang = zone.exploded && lingering && tSinceDet < SNIPER_ARTILLERY_BANG_DURATION;
        if (!zone.exploded) {
          const pulse = 1 + Math.sin(state.elapsed * 20) * 0.08;
          const radius = zone.r * pulse;
          drawCircle(ctx, zone.x, zone.y, radius, "#ef4444", 0.25 + life * 0.4);
          ctx.strokeStyle = "#f87171";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, radius, 0, TAU);
          ctx.stroke();
        } else if (lingering) {
          const r = zone.r;
          drawCircle(ctx, zone.x, zone.y, r, "#9f1239", 0.38);
          ctx.strokeStyle = "rgba(248, 113, 113, 0.95)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, r, 0, TAU);
          ctx.stroke();
          ctx.strokeStyle = "rgba(254, 202, 202, 0.55)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, r * 0.72, 0, TAU);
          ctx.stroke();
          if (inBang) {
            const u = clamp(tSinceDet / SNIPER_ARTILLERY_BANG_DURATION, 0, 1);
            drawArtilleryDetonationBang(ctx, zone, u);
          }
        }
      }
      for (const b of entities.bullets) {
        const life = clamp((state.elapsed - b.bornAt) / b.life, 0, 1);
        const x = b.x + (b.tx - b.x) * life;
        const y = b.y + (b.ty - b.y) * life;
        drawCircle(ctx, x, y, 2, "#fca5a5");
      }
      for (const p of entities.projectiles) {
        drawProjectileBody(ctx, p);
      }
      for (const fx of entities.ultimateEffects) {
        if (state.elapsed < fx.bornAt) continue;
        const span = Math.max(1e-3, fx.expiresAt - fx.bornAt);
        const t = clamp((state.elapsed - fx.bornAt) / span, 0, 1);
        if (fx.type === "burstWave") {
          const ease = 1 - Math.pow(1 - t, 1.35);
          const rr = fx.radius * (0.1 + ease * 0.98);
          ctx.save();
          ctx.translate(fx.x, fx.y);
          ctx.rotate(state.elapsed * 6 + fx.bornAt * 3);
          if (t < 0.22) {
            const flash = 1 - t / 0.22;
            drawCircle(ctx, 0, 0, rr * 0.12 + flash * fx.radius * 0.1, "#ffffff", 0.5 * flash);
          }
          const segs = 40;
          for (let k = 0; k < 3; k++) {
            const rrk = rr * (1 - k * 0.1);
            const alpha = (0.62 - k * 0.14) * (1 - t);
            ctx.strokeStyle = `rgba(224, 242, 254, ${alpha})`;
            ctx.lineWidth = 11 - k * 2.5 - t * 5;
            ctx.beginPath();
            for (let i = 0; i <= segs; i++) {
              const ang = i / segs * TAU;
              const wobble = 1 + 0.045 * Math.sin(ang * 9 + state.elapsed * 24);
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
          ctx.arc(fx.x, fx.y, rr + 10, 0, TAU);
          ctx.stroke();
        } else if (fx.type === "shieldSummon") {
          const rr = fx.radius * (0.2 + t * 1.05);
          ctx.save();
          ctx.translate(fx.x, fx.y);
          ctx.rotate(-state.elapsed * 2.2);
          const rays = 20;
          for (let i = 0; i < rays; i++) {
            const ang = i / rays * TAU;
            const len = rr * (0.55 + 0.45 * (1 - t));
            const alpha = (0.35 - i * 8e-3) * (1 - t);
            ctx.strokeStyle = `rgba(191, 219, 254, ${Math.max(0, alpha)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * rr * 0.08, Math.sin(ang) * rr * 0.08);
            ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
            ctx.stroke();
          }
          ctx.restore();
          drawCircle(ctx, fx.x, fx.y, rr * 0.45, "#dbeafe", 0.28 * (1 - t * 0.6));
          drawCircle(ctx, fx.x, fx.y, rr, fx.color, 0.14 * (1 - t));
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 * (1 - t)})`;
          ctx.lineWidth = 5 - t * 2.5;
          ctx.beginPath();
          ctx.arc(fx.x, fx.y, rr * (0.92 - t * 0.08), 0, TAU);
          ctx.stroke();
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.45 * (1 - t)})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(fx.x, fx.y, rr * 1.08, 0, TAU);
          ctx.stroke();
        } else if (fx.type === "timelockWorld") {
          const ease = 1 - Math.pow(1 - t, 0.85);
          const rr = fx.radius * (0.15 + ease * 1.05);
          const frost = 0.22 * (1 - t);
          drawCircle(ctx, fx.x, fx.y, rr, "#e0e7ff", frost * 0.5);
          ctx.strokeStyle = `rgba(196, 181, 253, ${0.55 * (1 - t * 0.5)})`;
          ctx.lineWidth = 5 + (1 - t) * 4;
          ctx.beginPath();
          ctx.arc(fx.x, fx.y, rr, 0, TAU);
          ctx.stroke();
          const ticks = 24;
          for (let i = 0; i < ticks; i++) {
            const ang = i / ticks * TAU - state.elapsed * 0.35;
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
          const pulse = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(state.elapsed * 14));
          const spiralR = fx.radius * (0.35 + localSelf * 0.9) + pulse * 8;
          drawCircle(ctx, fx.x, fx.y, spiralR, "#c084fc", (0.1 + (1 - localSelf) * 0.08) * fade);
          ctx.strokeStyle = `rgba(233, 213, 255, ${(0.5 + 0.25 * (1 - localSelf)) * fade})`;
          ctx.lineWidth = 3;
          const coils = 3;
          ctx.beginPath();
          for (let i = 0; i <= 72; i++) {
            const u = i / 72;
            const ang = u * coils * TAU + state.elapsed * 3;
            const rad = 8 + u * spiralR * 0.95;
            const px = fx.x + Math.cos(ang) * rad;
            const py = fx.y + Math.sin(ang) * rad;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          const tickN = 12;
          for (let i = 0; i < tickN; i++) {
            const ang = i / tickN * TAU - state.elapsed * 2;
            ctx.strokeStyle = `rgba(250, 245, 255, ${0.55 * fade})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fx.x + Math.cos(ang) * (player.r + 6), fx.y + Math.sin(ang) * (player.r + 6));
            ctx.lineTo(fx.x + Math.cos(ang) * (player.r + 18), fx.y + Math.sin(ang) * (player.r + 18));
            ctx.stroke();
          }
        } else if (fx.type === "healVitality") {
          const pulse = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(state.elapsed * 16));
          for (let ring = 0; ring < 3; ring++) {
            const lag = ring * 0.12;
            const tt = clamp((t - lag) / (1 - lag), 0, 1);
            const rr = fx.radius * (0.25 + tt * 0.82);
            drawCircle(ctx, fx.x, fx.y, rr, "#6ee7b7", 0.08 * (1 - tt) * (1 - ring * 0.2));
            ctx.strokeStyle = `rgba(52, 211, 153, ${0.45 * (1 - tt) * pulse})`;
            ctx.lineWidth = 4 - ring;
            ctx.beginPath();
            ctx.arc(fx.x, fx.y, rr, 0, TAU);
            ctx.stroke();
          }
          const rays = 14;
          for (let i = 0; i < rays; i++) {
            const ang = i / rays * TAU + state.elapsed * 0.8;
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
            drawCircle(ctx, fx.x, fx.y, player.r + 6 + b * 12, "#ecfdf5", 0.35 * b);
          }
        }
      }
      const timelockWorldFrozenDraw = state.timelockEnemyUntil > state.elapsed && state.elapsed >= state.timelockEnemyFrom;
      if (timelockWorldFrozenDraw) {
        const w = Math.max(VIEW_W, VIEW_H) * 0.85;
        const v = 0.028 + 0.018 * Math.sin(state.elapsed * 11);
        const g = ctx.createRadialGradient(player.x, player.y, player.r * 2, player.x, player.y, w);
        g.addColorStop(0, `rgba(224, 231, 255, ${v * 0.35})`);
        g.addColorStop(0.45, `rgba(99, 102, 241, ${v * 0.55})`);
        g.addColorStop(1, "rgba(15, 23, 42, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(player.x, player.y, w, 0, TAU);
        ctx.fill();
      }
      if (entities.shields.length) {
        const orbitR = entities.shields[0].radius;
        ctx.strokeStyle = "rgba(147, 197, 253, 0.2)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 10]);
        ctx.lineDashOffset = -state.elapsed * 40;
        ctx.beginPath();
        ctx.arc(player.x, player.y, orbitR, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      for (const shield of entities.shields) {
        const spawnAge = shield.bornAt != null ? clamp((state.elapsed - shield.bornAt) / 0.34, 0, 1) : 1;
        const pop = 0.2 + 0.8 * (1 - Math.pow(1 - spawnAge, 2.4));
        const pulse = 0.9 + 0.1 * Math.sin(state.elapsed * 8 + shield.angle * 2.2);
        const drawR = shield.r * pop * pulse;
        const tx = -Math.sin(shield.angle);
        const ty = Math.cos(shield.angle);
        ctx.strokeStyle = "rgba(147, 197, 253, 0.35)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(shield.x - tx * (drawR + 6), shield.y - ty * (drawR + 6));
        ctx.lineTo(shield.x + tx * (drawR + 14), shield.y + ty * (drawR + 14));
        ctx.stroke();
        drawCircle(ctx, shield.x, shield.y, drawR + 9, "#bfdbfe", 0.28);
        drawCircle(ctx, shield.x, shield.y, drawR + 4, "#e0f2fe", 0.45);
        drawCircle(ctx, shield.x, shield.y, drawR, "#38bdf8", 0.95);
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(shield.x, shield.y, drawR + 1.2, 0, TAU);
        ctx.stroke();
      }
      for (const beam of entities.laserBeams) {
        drawLaserBeamFancy(ctx, beam);
      }
      for (const h of entities.hunters) {
        if (h.type !== "spawner" && h.type !== "airSpawner") continue;
        if (state.elapsed >= h.spawnDelayUntil) continue;
        const delayTotal = h.type === "airSpawner" ? 2.1 : 2;
        const elapsedSinceBorn = state.elapsed - h.bornAt;
        const progress = clamp(elapsedSinceBorn / delayTotal, 0, 1);
        const remaining = 1 - progress;
        const clockR = h.r + 28 + remaining * 6;
        const pulse = 1 + Math.sin(state.elapsed * 10) * 0.04;
        const alpha = 0.1 + remaining * 0.18;
        const ringCol = h.type === "airSpawner" ? "#a78bfa" : "#fb7185";
        const handCol = h.type === "airSpawner" ? "#7c3aed" : "#f43f5e";
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
      for (const h of entities.hunters) {
        drawHunterBody(ctx, h);
      }
      for (const h of entities.hunters) {
        const total = h.life || Math.max(1e-4, h.dieAt - h.bornAt);
        const lifeLeft = clamp((h.dieAt - state.elapsed) / total, 0, 1);
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
      for (const ring of entities.attackRings) {
        const t = clamp((state.elapsed - ring.bornAt) / Math.max(1e-3, ring.expiresAt - ring.bornAt), 0, 1);
        const rr = ring.r * (1 + t * 0.28);
        ctx.strokeStyle = ring.color;
        ctx.globalAlpha = 0.85 * (1 - t);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, rr, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      drawLunaticSprintTierSpeedFx(ctx);
      let playerBodyAlpha = state.elapsed < state.playerInvulnerableUntil ? 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(state.elapsed * 32)) : 1;
      if ((selectedCharacter.id === "knight" || selectedCharacter.id === "valiant") && state.elapsed < inventory.clubsInvisUntil) {
        const pulse = 0.5 + 0.5 * Math.sin(state.elapsed * 12);
        const ghostAlpha = clamp(0.34 + 0.16 * pulse, 0.28, 0.52);
        playerBodyAlpha = Math.min(playerBodyAlpha, ghostAlpha);
      }
      drawPlayerBody(ctx, playerBodyAlpha);
      drawValiantRabbitOrbiters(ctx, playerBodyAlpha);
      drawValiantRabbitFx(ctx);
      drawLunaticSprintDirectionArrow(ctx);
      drawLunaticRoarFx(ctx, playerBodyAlpha);
      drawLunaticRoarTimerBar(ctx, playerBodyAlpha);
      if (state.playerTimelockUntil > 0) {
        const timePulse = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(state.elapsed * 14));
        drawCircle(ctx, player.x, player.y, player.r + 10 + timePulse * 4, "#c084fc", 0.18);
        ctx.strokeStyle = `rgba(233, 213, 255, ${0.55 + 0.2 * timePulse})`;
        ctx.lineWidth = 3 + timePulse * 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r + 14 + timePulse * 5, 0, TAU);
        ctx.stroke();
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(state.elapsed * 1.8);
        const ticks = 16;
        for (let i = 0; i < ticks; i++) {
          const ang = i / ticks * TAU;
          ctx.strokeStyle = `rgba(250, 245, 255, ${0.35 + 0.2 * timePulse})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ang) * (player.r + 4), Math.sin(ang) * (player.r + 4));
          ctx.lineTo(Math.cos(ang) * (player.r + 11 + timePulse * 3), Math.sin(ang) * (player.r + 11 + timePulse * 3));
          ctx.stroke();
        }
        ctx.restore();
        const sweep = state.elapsed * 2.2 % TAU;
        ctx.strokeStyle = "rgba(196, 181, 253, 0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r + 9, sweep, sweep + Math.PI * 0.65);
        ctx.stroke();
      } else if (state.tempHp > 0) {
        const p = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(state.elapsed * 10));
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.35 + 0.25 * p})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r + 7 + p * 3, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = `rgba(167, 243, 208, ${0.28 * p})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r + 11 + p * 4, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = `rgba(236, 253, 245, ${0.22 * p})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r + 15 + p * 2, 0, TAU);
        ctx.stroke();
      }
      const heartsResistanceCount = getHeartsResistanceCardCount();
      const heartsResistanceReady = heartsResistanceCount > 0 && state.elapsed >= inventory.heartsResistanceReadyAt;
      if (heartsResistanceReady) {
        ctx.strokeStyle = "rgba(252, 165, 165, 0.95)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r + 4, 0, TAU);
        ctx.stroke();
      }
      if (heartsResistanceCount > 0 && !heartsResistanceReady) {
        const cdDur = Math.max(1e-3, inventory.heartsResistanceCooldownDuration || getHeartsResistanceCooldown());
        const rem = Math.max(0, inventory.heartsResistanceReadyAt - state.elapsed);
        const t = clamp(1 - rem / cdDur, 0, 1);
        const iconX = player.x;
        const iconY = player.y + player.r + 20;
        const r = 7;
        const g = Math.round(148 + (191 - 148) * t);
        const b = Math.round(163 + (255 - 163) * t);
        ctx.strokeStyle = `rgb(${100},${g},${b})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(iconX, iconY, r, -Math.PI / 2, -Math.PI / 2 + TAU * t);
        ctx.stroke();
        ctx.strokeStyle = "rgba(100, 116, 139, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(iconX, iconY, r, -Math.PI / 2 + TAU * t, -Math.PI / 2 + TAU);
        ctx.stroke();
      }
      for (const ripple of entities.damageRipples) {
        const t = clamp(
          (state.elapsed - ripple.bornAt) / Math.max(1e-3, ripple.expiresAt - ripple.bornAt),
          0,
          1
        );
        const rr = player.r + 3 + t * 17;
        ctx.strokeStyle = "#f43f5e";
        ctx.globalAlpha = 0.75 * (1 - t);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, rr, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (state.elapsed < player.burstUntil) {
        drawCircle(ctx, player.x, player.y, player.r + 4, "#22d3ee", 0.3 * playerBodyAlpha);
      } else if (state.elapsed < player.ultimateSpeedUntil) {
        drawCircle(ctx, player.x, player.y, player.r + 5, "#fde68a", 0.28 * playerBodyAlpha);
      }
      for (const popup of entities.healPopups) {
        const t = clamp((state.elapsed - popup.bornAt) / Math.max(1e-3, popup.expiresAt - popup.bornAt), 0, 1);
        const y = popup.y - t * 20;
        const fp = popup.fontPx ?? 14;
        ctx.fillStyle = popup.color || "#86efac";
        ctx.globalAlpha = 1 - t;
        ctx.font = `bold ${fp}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(15, 23, 42, 0.55)";
        ctx.shadowBlur = 4;
        ctx.fillText(popup.text, popup.x, y);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      if (passive.heartsShieldArc > 0) {
        const facing = Math.atan2(player.facing.y, player.facing.x);
        const arc = passive.heartsShieldArc * Math.PI / 180;
        ctx.strokeStyle = "rgba(248, 113, 113, 0.8)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r + 30, facing - arc / 2, facing + arc / 2);
        ctx.stroke();
      }
      if (!state.running && !deathAnimDone) {
        const t = clamp(deathElapsed / DEATH_ANIM_DURATION, 0, 1);
        const burstR = player.r + 12 + t * 78;
        const alpha = (1 - t) * 0.55;
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 6 - t * 3;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(player.x, player.y, burstR, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
        drawCircle(ctx, player.x, player.y, player.r + 8 + t * 24, "#fca5a5", 0.18 * (1 - t));
      }
      drawPlayerHpHud(ctx);
      drawRogueSurvivalHud(ctx);
      if (selectedCharacter.id === "rogue" && state.rogueDashAiming) {
        const target = computeDashTarget();
        const tipX = target.x;
        const tipY = target.y;
        ctx.strokeStyle = "rgba(125, 211, 252, 0.9)";
        ctx.lineWidth = 2.4;
        ctx.setLineDash([9, 7]);
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
        ctx.setLineDash([]);
        drawCircle(ctx, tipX, tipY, 7, "#7dd3fc", 0.3);
        ctx.strokeStyle = "rgba(186, 230, 253, 0.95)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tipX, tipY, 7, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
      drawRunLevelUpCinematic();
      if (state.snapshotPending) {
        state.snapshotPending = false;
        saveDeathSnapshot().catch((err) => {
          runLog.fail(E_SNAPSHOT_RENDER_HOOK, "Death snapshot async task rejected from render hook.", err);
          setSnapshotStatus("Death screenshots: save failed");
        });
      }
      if (state.hurtFlash > 0) {
        ctx.fillStyle = "rgba(220, 38, 38, 0.24)";
        ctx.fillRect(0, 0, world.w, world.h);
      }
      if (selectedCharacter.id === "rogue" && state.running) {
        const hungerMissing = 1 - clamp(state.rogueHunger / Math.max(1e-3, state.rogueHungerMax), 0, 1);
        if (hungerMissing > 0) {
          const alpha = 0.04 + hungerMissing * 0.22;
          ctx.fillStyle = `rgba(20, 184, 166, ${alpha})`;
          ctx.fillRect(0, 0, world.w, world.h);
        }
      }
      if (selectedCharacter.id === "rogue" && state.running && !state.rogueHasEnemyLos) {
        ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
        ctx.fillRect(0, 0, world.w, world.h);
        ctx.fillStyle = "#d1fae5";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "bold 14px Arial";
        ctx.fillText("LoS broken", 14, 130);
      }
      drawHud();
      if (selectedCharacter.id === "rogue" && state.elapsed < state.rogueFoodSenseUntil) {
        const px = player.x - cameraX + shake.x;
        const py = player.y - cameraY + shake.y;
        for (const food of entities.foods) {
          const lifeTotal = Math.max(1e-3, food.expiresAt - food.bornAt);
          const freshness = clamp((food.expiresAt - state.elapsed) / lifeTotal, 0, 1);
          const dx = food.x - player.x;
          const dy = food.y - player.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const close = len <= ROGUE_FOOD_ARROW_CLOSE_PLATEAU ? 1 : clamp(
            1 - (len - ROGUE_FOOD_ARROW_CLOSE_PLATEAU) / Math.max(1e-3, ROGUE_FOOD_ARROW_FAR_LEN - ROGUE_FOOD_ARROW_CLOSE_PLATEAU),
            0,
            1
          );
          const reach = 44 + close * 22;
          const tipX = px + ux * reach;
          const tipY = py + uy * reach;
          const sideX = -uy;
          const sideY = ux;
          const s = 5.5 + close * 6.5;
          const freshAlpha = 0.54 + 0.4 * freshness;
          const a = Math.min(0.94, Math.max(0.48, freshAlpha));
          ctx.fillStyle = `rgba(252, 211, 77, ${a})`;
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX - ux * (s * 1.8) + sideX * s, tipY - uy * (s * 1.8) + sideY * s);
          ctx.lineTo(tipX - ux * (s * 1.8) - sideX * s, tipY - uy * (s * 1.8) - sideY * s);
          ctx.closePath();
          ctx.fill();
        }
      }
      updateAbilityButtons();
      if (dangerRampFillEl) {
        const p = gameStarted ? getDangerRamp01() : 0;
        dangerRampFillEl.style.width = `${p * 100}%`;
      }
      if (state.elapsed < inventory.dodgeTextUntil) {
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 22px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Dodge!", world.w / 2, 56);
      }
      if (state.manualPause && state.running) {
        ctx.fillStyle = "rgba(2, 6, 23, 0.45)";
        ctx.fillRect(0, 0, world.w, world.h);
        ctx.fillStyle = "#f8fafc";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 38px Arial";
        ctx.fillText("Paused", world.w / 2, world.h / 2 - 10);
        ctx.font = "16px Arial";
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText("Press any key to resume", world.w / 2, world.h / 2 + 24);
      }
      if (!state.running && deathAnimDone) {
        postFxCtx.clearRect(0, 0, world.w, world.h);
        postFxCtx.drawImage(canvas, 0, 0);
        ctx.save();
        ctx.clearRect(0, 0, world.w, world.h);
        ctx.filter = "grayscale(1)";
        ctx.drawImage(postFxCanvas, 0, 0);
        ctx.restore();
        ctx.fillStyle = "rgba(2, 6, 23, 0.72)";
        ctx.fillRect(0, 0, world.w, world.h);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 34px Arial";
        ctx.fillText("You Died", world.w / 2 - 76, world.h / 2 - 20);
        ctx.font = "18px Arial";
        ctx.fillText("Press R to restart", world.w / 2 - 76, world.h / 2 + 18);
      }
    }
    function getSimulationTimeScale() {
      const el = document.getElementById("game-speed");
      if (!el) return 1;
      const raw = typeof el.value === "string" ? el.value.trim() : String(el.value);
      const v = parseFloat(raw);
      if (!Number.isFinite(v) || v <= 0) return 1;
      return clamp(v, 0.1, 5);
    }
    function loop(ts) {
      try {
        if (!state.lastTime) state.lastTime = ts;
        const dt = Math.min((ts - state.lastTime) / 1e3, 0.033);
        state.lastTime = ts;
        const scale = getSimulationTimeScale();
        update(dt * scale);
        render(ts);
      } catch (err) {
        runLog.fail(E_MAIN_LOOP, "Uncaught error in game loop (update/render).", err);
        throw err;
      }
      requestAnimationFrame(loop);
    }
    function onAbilityKey(key) {
      if (state.runLevelUpCinematic && performance.now() - state.runLevelUpCinematic.startMs < RUN_LEVEL_UP_CINEMATIC_MS)
        return;
      if (state.pausedForCard || state.pausedForRoulette || state.pausedForSafehousePrompt || state.pausedForForge) return;
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
        if (selectedCharacter.id === "rogue") {
          startRogueDashAim();
          return;
        }
        tryDash();
      }
      if (key === abilities.burst.key) tryBurst();
      if (key === abilities.decoy.key) tryDecoy();
      if (key === abilities.random.key) useRandomAbility();
    }
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (key.startsWith("arrow")) event.preventDefault();
      if (!gameStarted) return;
      if (key === abilities.random.key && !state.running) {
        event.preventDefault();
        gameStarted = false;
        resetGame();
        afterDeathRetry();
        return;
      }
      if (state.manualPause) {
        const resumeGameplay = key.startsWith("arrow") || key === abilities.dash.key || key === abilities.burst.key || key === abilities.decoy.key || key === abilities.random.key;
        if (!resumeGameplay) {
          if (key === " ") event.preventDefault();
          return;
        }
        state.manualPause = false;
        runLog.event(EVT_MANUAL_RESUME, "Manual pause: resumed");
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
        runLog.event(EVT_MANUAL_PAUSE, "Manual pause: paused (Space)");
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
      if (isLunatic()) {
        if (key === abilities.dash.key) state.lunaticSteerLeft = false;
        if (key === abilities.decoy.key) state.lunaticSteerRight = false;
      }
      if (key === abilities.dash.key) releaseRogueDashAim();
    });
    if (snapshotFolderButton) {
      snapshotFolderButton.addEventListener("click", () => {
        chooseSnapshotFolder();
      });
    }
    if (cardPickupButton) {
      cardPickupButton.addEventListener("click", () => continueAfterLoadout());
    }
    if (cardSkipButton) {
      cardSkipButton.addEventListener("click", () => continueAfterLoadout());
    }
    if (cardCloseButton) {
      cardCloseButton.addEventListener("click", () => continueAfterLoadout());
    }
    if (safehouseLevelYes) {
      safehouseLevelYes.addEventListener("click", () => {
        const prim = getPrimarySafehouseAxial();
        const tileK = prim ? hexKey(prim.q, prim.r) : "";
        closeSafehouseLevelModal();
        applySafehouseLevelUp();
        player.hp = player.maxHp;
        state.runLevelUpCinematic = { startMs: performance.now(), announceLevel: displayWorldLevel() };
        if (!isLunatic()) state.safehouseEmbedRevealAtMs = performance.now() + 830;
        if (tileK) {
          state.safehouseAwaitingLeaveAfterLevelUp = true;
          state.safehouseLevelUpTileKey = tileK;
        }
      });
    }
    if (safehouseLevelNo) safehouseLevelNo.addEventListener("click", () => closeSafehouseLevelModal());
    wireCharacterSelect();
    syncSpecialTestWestPanelLock();
    refreshControlsHint();
    requestAnimationFrame(loop);
  }

  // src/escape/entry.js
  mountEscape({
    canvas: document.getElementById("game"),
    snapshotFolderButton: document.getElementById("snapshot-folder-button"),
    snapshotStatus: document.getElementById("snapshot-status"),
    controlsHintEl: document.getElementById("game-controls-hint"),
    characterSelectModal: document.getElementById("character-select-modal"),
    characterSelectOptions: Array.from(document.querySelectorAll("[data-character-id]")),
    abilitySlots: Array.from(document.querySelectorAll(".ability-slot")),
    deckRankSlotEls: Array.from({ length: 13 }, (_, i) => document.getElementById(`deck-slot-${i + 1}`)),
    backpackSlotEls: Array.from({ length: 3 }, (_, i) => document.getElementById(`backpack-slot-${i + 1}`)),
    setBonusStatusEl: document.getElementById("set-bonus-status"),
    dangerRampFillEl: document.getElementById("danger-ramp-fill"),
    cardModal: document.getElementById("card-modal"),
    modalDeckStripEl: document.getElementById("modal-deck-strip"),
    cardModalFace: document.getElementById("card-modal-face"),
    modalSetBonusStatusEl: document.getElementById("modal-set-bonus-status"),
    cardCloseButton: document.getElementById("card-close-button"),
    cardPickupButton: document.getElementById("card-pickup-button"),
    cardSkipButton: document.getElementById("card-skip-button"),
    cardSwapRow: document.getElementById("card-swap-row"),
    rouletteModal: document.getElementById("roulette-modal"),
    rouletteModalTitle: document.getElementById("roulette-modal-title"),
    rouletteModalSub: document.getElementById("roulette-modal-sub"),
    rouletteModalSpinRow: document.getElementById("roulette-modal-spin-row"),
    rouletteModalActions: document.getElementById("roulette-modal-actions"),
    specialTestWestSelect: document.getElementById("special-test-west-select")
  });
})();
