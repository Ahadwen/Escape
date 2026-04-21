/**
 * World scale — values taken from REFERENCE `dist/assets/escape-*.js` (early Escape build):
 * - `T = 560 * 1.15` used as `hexSize` in `hexToWorld` / `generateHexTileObstacles`
 * - `tileConfig`: `{ TILE_W: 560, BLOCK: 35, hexSize: T, TILE_COLS/TILE_ROWS from canvas }`
 * - Player `r: 10`, `speed: 198` in bundled initial state
 */
/** Pointy-top hex vertex radius (world px); REFERENCE: `560 * 1.15`. */
export const HEX_SIZE = 560 * 1.15;
/** Tetris-style obstacle cell (world px); REFERENCE tileConfig. */
export const BLOCK = 35;
/** Player radius (world px); REFERENCE default `V.r`. */
export const PLAYER_RADIUS = 10;
/** Walk speed (world px / s); REFERENCE `V.speed`. */
export const PLAYER_SPEED = 198;

/** Strip-world width constant bundled into REFERENCE `tileConfig` (hex path ignores it). */
export const REFERENCE_TILE_W = 560;

/**
 * Camera follow smoothing (0..1). Used as: blend = 1 - (1 - lerp)^(dt * 60).
 * Higher = snappier; lower = more lag behind the player.
 */
export const CAMERA_FOLLOW_LERP = 0.18;

/** Seconds between health crystal spawns (REFERENCE `PICKUP_SPAWN_INTERVAL`). */
export const PICKUP_SPAWN_INTERVAL = 3.2;
/** Seconds between floating card spawns (REFERENCE `CARD_SPAWN_INTERVAL`). */
export const CARD_SPAWN_INTERVAL = 8.5;
/** Health crystal despawn timer (REFERENCE heal pickup `life`). */
export const HEAL_CRYSTAL_LIFETIME_SEC = 7.2;
/** Card pickup despawn timer (REFERENCE). */
export const CARD_COLLECTIBLE_LIFETIME_SEC = 12;
/** HP restored per crystal for Knight-scale runs (REFERENCE default `heal: 3`). */
export const HEAL_CRYSTAL_HP = 3;

/** Rank 2 vs King spawn weight ratio (REFERENCE). */
export const CARD_RANK_SPAWN_WEIGHT_MAX = 24;
export const CARD_RANK_SPAWN_WEIGHT_MIN = 1;

/** Set bonus: seven of a suit in the rank deck (REFERENCE). */
export const SET_BONUS_SUIT_THRESHOLD = 7;
export const SET_BONUS_SUIT_MAX = 13;

/** No procedural specials (except dev west-test hex) until this many seconds of sim time. */
export const SPECIAL_PROCEDURAL_GRACE_SEC = 15;
/** After any procedural special spawns, none may spawn until this many seconds later. */
export const SPECIAL_PROCEDURAL_POST_SPAWN_LOCK_SEC = 15;
/** Procedural special spawn chance is `1 / denominator`; denominator starts here and tightens over time. */
export const SPECIAL_PROCEDURAL_DENOM_START = 30;
/** Minimum denominator (max chance) for procedural special rolls (`1/12`). */
export const SPECIAL_PROCEDURAL_DENOM_MIN = 12;
/** Every this many seconds of sim time, the denominator decreases by 1 until `SPECIAL_PROCEDURAL_DENOM_MIN`. */
export const SPECIAL_PROCEDURAL_RAMP_STEP_SEC = 10;

const _SQRT3 = Math.sqrt(3);
/** REFERENCE arena nexus — inner hex scale vs `HEX_SIZE` circumradius. */
export const ARENA_NEXUS_INNER_HEX_SCALE = 0.62;
/** Distance from nexus center to inner threshold (pointy-top inradius × 0.96). */
export const ARENA_NEXUS_INNER_ENTER_R = HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE * (_SQRT3 / 2) * 0.96;
/** Inner hex apothem (center → flat edge). */
export const ARENA_NEXUS_INNER_APOTHEM = HEX_SIZE * ARENA_NEXUS_INNER_HEX_SCALE * (_SQRT3 / 2);

/** Arena nexus siege duration (REFERENCE). */
export const ARENA_NEXUS_SIEGE_SEC = 10;
export const ARENA_NEXUS_RING_LO = HEX_SIZE * 0.66;
export const ARENA_NEXUS_RING_HI = HEX_SIZE * 0.93;
export const ARENA_NEXUS_RING_LASER_SPAWN_INTERVAL = 2.85;
export const ARENA_NEXUS_RING_SNIPER_SPAWN_INTERVAL = 3.45;
export const ARENA_NEXUS_REWARD_MODAL_DELAY_SEC = 1.35;

/** Surge / gauntlet hex (REFERENCE). */
export const SURGE_HEX_WAVES = 10;
export const SURGE_TRAVEL_DUR_FIRST = 1.1;
export const SURGE_TRAVEL_DUR_DECREMENT_PER_WAVE = 0.05;
export const SURGE_WAVE_PAUSE_SEC = 0.3;
export const SURGE_TILE_DAMAGE = 2;
export const SURGE_TILE_FLASH_SEC = 0.22;
/** Safe pocket draw / hit (world px) — REFERENCE values at this `HEX_SIZE`. */
export const SURGE_GAUNTLET_SAFE_DRAW_R = 81;
export const SURGE_GAUNTLET_SAFE_HIT_R = 99;
export const SURGE_GAUNTLET_MIN_CENTER_SEP_PX = SURGE_GAUNTLET_SAFE_DRAW_R * 2;
/** Forge / non-roulette special inner interaction (world px); roulette uses `ROULETTE_INNER_HIT_R`. */
export const SPECIAL_TILE_INNER_HIT_R = HEX_SIZE * 0.38;

/** REFERENCE `balance.js` — roulette inner ring and modal spin timing (world px / sec). */
export const ROULETTE_INNER_HIT_R = 52;
export const ROULETTE_INNER_HEX_DRAW_R = 58;
export const ROULETTE_SPIN_SHUFFLE_SEC = 2.15;
export const ROULETTE_SPIN_WHITEOUT_SEC = 0.42;
/** HP lost crossing the roulette hex outer ring the first time (REFERENCE `damagePlayer(2, …)`). */
export const ROULETTE_OUTER_PENALTY_HP = 2;
/** Same toll pattern as roulette for procedural forge hexes. */
export const FORGE_OUTER_PENALTY_HP = 2;

/** Sanctuary: standing in inner core opens the level-up modal (world px). */
export const SAFEHOUSE_INNER_HIT_R = 46;
/** Hit radius for embedded mini roulette / forge sites (world px). */
export const SAFEHOUSE_EMBED_SITE_HIT_R = 28;
/** Mini-site centers sit this fraction of `HEX_SIZE` along west / east neighbor chords. */
export const SAFEHOUSE_EMBED_CENTER_INSET = 0.4;
/** Vertex radius multiplier for embedded mini hexes vs full tile. */
export const SAFEHOUSE_EMBED_HEX_VERTEX_R_MULT = 0.14;
/** Full-tile darken duration when a sanctuary becomes spent (ms). */
export const SAFEHOUSE_SPENT_TILE_ANIM_MS = 1200;

// --- Hunter / wave pacing (REFERENCE `balance.js`) ---

/** Seconds until first hunter wave scheduling tick. */
export const HUNTER_FIRST_WAVE_AT_SEC = 3;
/** Hunter wave spacing at run start (seconds until next wave after scheduling). */
export const SPAWN_INTERVAL_START = 8;
/** Minimum seconds between hunter spawn waves once danger ramp is full. */
export const SPAWN_INTERVAL_FLOOR = 1.5;
/** Survival time over which wave spacing eases from START → FLOOR (matches danger bar). */
export const DANGER_RAMP_SECONDS = 300;
/** From this many seconds, waves can include `airSpawner` and `laserBlue` elites. */
export const LATE_GAME_ELITE_SPAWN_SEC = 180;
/** After this many seconds, every `MIDGAME_ESCALATION_INTERVAL_SEC` adds +5% enemy speed and +1 spawn per wave. */
export const MIDGAME_ESCALATION_START_SEC = 240;
export const MIDGAME_ESCALATION_INTERVAL_SEC = 15;
export const MIDGAME_ESCALATION_SPEED_FACTOR = 1.05;
export const BASE_WAVE_SPAWN_JOBS = 14;
/** Flying spawner chase speed (world px/s). */
export const AIR_SPAWNER_CHASE_SPEED = 84 * 1.05;
export const LASER_BLUE_COOLDOWN_SEC = 1.22;
export const LASER_BLUE_WARN_SEC = 0.3;
export const HUNTER_SPEED_AGE_COEFF = 1.1;
/** Cooldown after a hunter deals contact damage to the player. */
export const ENEMY_HIT_COOLDOWN_SEC = 0.52;

// --- Player damage / hit feedback (REFERENCE `game.js` / `balance.js`) ---

export const DAMAGE_HURT_FLASH_SEC = 0.16;
export const DAMAGE_PLAYER_INVULN_SEC = 0.35;
export const DAMAGE_SCREEN_SHAKE_SEC = 0.18;
export const DAMAGE_SCREEN_SHAKE_STRENGTH = 8;
export const LASER_BLUE_PLAYER_SLOW_MULT = 0.8;
export const LASER_BLUE_PLAYER_SLOW_SEC = 1.5;
/** Hearts 13: once per this many seconds, lethal damage sets HP to 5 instead. */
export const HEARTS_13_DEATH_DEFY_CD_SEC = 30;
/** Clubs 13: after taking real HP damage, enemies ignore the player briefly. */
export const CLUBS_13_UNTARGETABLE_SEC = 1;
/** Terrain-touch speed boost linger from spades cards (REFERENCE `TERRAIN_SPEED_BOOST_LINGER`). */
export const TERRAIN_SPEED_BOOST_LINGER = 0.16;
