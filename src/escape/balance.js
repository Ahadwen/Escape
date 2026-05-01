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
/** Swamp path: bootleg heal crystals use this base heal before the curse choice modal. */
export const SWAMP_BOOTLEG_CRYSTAL_HP = 2;

/** Rank 2 vs King spawn weight ratio (REFERENCE). */
export const CARD_RANK_SPAWN_WEIGHT_MAX = 24;
export const CARD_RANK_SPAWN_WEIGHT_MIN = 1;

/** Set bonus: seven of a suit in the rank deck (REFERENCE). */
export const SET_BONUS_SUIT_THRESHOLD = 7;
export const SET_BONUS_SUIT_MAX = 13;

/** No procedural specials (except dev west-test hex) until this many seconds of sim time. */
export const SPECIAL_PROCEDURAL_GRACE_SEC = 15;
/** Minimum sim-time after a procedural special tile despawns (spent or leaves the tile cache) before another may spawn. */
export const SPECIAL_PROCEDURAL_POST_DESPAWN_LOCK_SEC = 10;
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
/** Bulwark: longer post-hit invulnerability than `DAMAGE_PLAYER_INVULN_SEC`. */
export const BULWARK_POST_HIT_INVULN_SEC = 0.52;

/** --- Bulwark (flag + death lock) --- */
export const BULWARK_FLAG_MAX_HP = 10;
/** Planted flag ignores decoy damage briefly (avoids same-frame hunter pile + eases plant read). */
export const BULWARK_FLAG_PLANT_INVULN_SEC = 0.55;
/** While planted, one charge stacks this often (pickup heal = charge count × `BULWARK_FLAG_PICKUP_HEAL_PER_CHARGE`). */
export const BULWARK_FLAG_PLANT_CHARGE_INTERVAL_SEC = 0.5;
/** Hero HP restored per charge when picking up the planted flag. */
export const BULWARK_FLAG_PICKUP_HEAL_PER_CHARGE = 1;
export const BULWARK_FLAG_PICKUP_R = 22;
/** Hunters within this range of a planted flag treat the flag as their chase target. */
export const BULWARK_FLAG_LURE_RADIUS = 320;
/** Carried flag HP/sec (fractional; UI uses floor until the next whole). */
export const BULWARK_FLAG_RECHARGE_PER_SEC = 0.6;
/** Player within this range of planted flag gets short Q/W cooldowns. */
export const BULWARK_NEAR_FLAG_CD_RADIUS = 200;
export const BULWARK_DEATH_LOCK_RADIUS = 220;
export const BULWARK_DEATH_LOCK_SEC = 8;
export const BULWARK_FLAG_RESPAWN_HP = 1;

export const BULWARK_MAX_HP = 15;
export const BULWARK_CHARGE_COOLDOWN_SEC = 8;
export const BULWARK_CHARGE_COOLDOWN_NEAR_FLAG_SEC = 1.5;
export const BULWARK_PARRY_COOLDOWN_SEC = 8;
export const BULWARK_PARRY_COOLDOWN_NEAR_FLAG_SEC = 1.5;
export const BULWARK_PARRY_DURATION_SEC = 0.2;
/** Total forward travel for one Q (world px). */
export const BULWARK_CHARGE_DISTANCE = 236;
/** Forward speed during Q hold (world px/s). */
export const BULWARK_CHARGE_SPEED = 410;
/**
 * Wider charge “corridor”: hunters within `playerR + h.r + margin` of the charge segment get carried.
 * (Previously a fixed +8; larger margin = wider shove.)
 */
export const BULWARK_CHARGE_PUSH_CORRIDOR_MARGIN = 30;
/** Always-on narrow front block arc (stacks with hearts `frontShield` card arc). */
export const BULWARK_PASSIVE_FRONT_SHIELD_DEG = 52;
export const BULWARK_CHARGE_FRONT_SHIELD_DEG = 148;
/** Parry AoE; Earthquake wave uses 250 — slightly smaller defensive circle. */
export const BULWARK_PARRY_PUSH_RADIUS = 200;
/** Same radial displacement as one Earthquake wave (`ultimateSlot` / `entry` burst ticks). */
export const BULWARK_PARRY_PUSH_DIST = 95;
export const BULWARK_CHARGE_WALL_STUN_SEC = 0.95;
/** When Q stops on terrain, every hunter shoved during that charge gets this stun (sec). */
export const BULWARK_CHARGE_TERRAIN_GROUP_STUN_SEC = 0.6;
export const DAMAGE_SCREEN_SHAKE_SEC = 0.18;
export const DAMAGE_SCREEN_SHAKE_STRENGTH = 8;
export const LASER_BLUE_PLAYER_SLOW_MULT = 0.8;
export const LASER_BLUE_PLAYER_SLOW_SEC = 1.5;

/** Swamp path (run level 3+): slow after any damage; stacks multiplicatively with blue laser slow. */
export const SWAMP_HIT_SLOW_MULT = 0.8;
export const SWAMP_HIT_SLOW_SEC = 1.0;
/** Frog mud pool: walk speed multiplier while overlapping (~20% slower). */
export const FROG_MUD_POOL_MOVE_MULT = 0.8;
/**
 * Swamp display L3+ (`runLevel >= 2`): when the wave mix would spawn a sniper, keep it with this probability
 * (otherwise frog/cutter/ranged — artillery+frog detonation stacks were overtuned).
 */
export const SWAMP_L3PLUS_SNIPER_WAVE_KEEP_FRACTION = 0.4;

/** Swamp infection: stacks 1–9 then 10th triggers burst (damage + stun + slow). */
export const SWAMP_INFECTION_CAP = 10;
/** Display level 2 (`runLevel === 1`): min seconds between infection stack gains. */
export const SWAMP_INFECTION_STACK_MIN_GAP_LEVEL2_SEC = 0.3;
/** Display level 3+ (`runLevel >= 2`): min seconds between infection stack gains. */
export const SWAMP_INFECTION_STACK_MIN_GAP_LEVEL3_SEC = 0.2;
export const SWAMP_INFECTION_BURST_STUN_SEC = 0.4;
export const SWAMP_INFECTION_BURST_SLOW_SEC = 2.0;
/** Move speed multiplier during post-stun infection slow (lower = slower). */
export const SWAMP_INFECTION_BURST_SLOW_MULT = 0.45;
/** After stun, "10!" drifts upward for this long before hiding. */
export const SWAMP_INFECTION_TEN_DRIFT_SEC = 0.85;
/** Hearts 13: once per this many seconds, lethal damage sets HP to 5 instead. */
export const HEARTS_13_DEATH_DEFY_CD_SEC = 30;
/** Clubs 13: after taking real HP damage, enemies ignore the player briefly. */
export const CLUBS_13_UNTARGETABLE_SEC = 1;
/** Terrain-touch speed boost linger from spades cards (REFERENCE `TERRAIN_SPEED_BOOST_LINGER`). */
export const TERRAIN_SPEED_BOOST_LINGER = 0.16;

// --- Rogue (REFERENCE `balance.js` / `rogue/module.js`) ---

export const ROGUE_STEALTH_AFTER_LOS_BREAK = 0.35;
export const ROGUE_STEALTH_OPEN_GRACE = 0.4;
export const ROGUE_FOOD_HUNGER_RESTORE = 30;
export const ROGUE_FOOD_LIFETIME = 21;
export const ROGUE_FOOD_SENSE_DURATION = 2.35;
export const ROGUE_FOOD_ARROW_CLOSE_PLATEAU = 96;
export const ROGUE_FOOD_ARROW_FAR_LEN = 440;
export const ROGUE_DESPERATION_SPEED_MAX = 0.2;
/** Hunger timer max / starting value (REFERENCE `state.rogueHungerMax`). */
export const ROGUE_HUNGER_MAX = 60;
/** Seconds until first rogue food spawn after a reset (REFERENCE run init). */
export const ROGUE_FIRST_FOOD_AT_SEC = 6;

// --- Lunatic (REFERENCE `standalone.js` tuning) ---

export const LUNATIC_PASSIVE_HP_PER_SEC = 0.28;
export const LUNATIC_STUMBLE_MOVE_MULT = 0.66;
export const LUNATIC_W_TOGGLE_COOLDOWN_SEC = 4;
export const LUNATIC_SPRINT_MOMENTUM_RAMP_SEC = 8;
export const LUNATIC_SPRINT_PEAK_SPEED_MULT = 1.845;
export const LUNATIC_DECEL_SEC = 0.3;
export const LUNATIC_DECEL_SPRINT_REF_SEC = 5;
export const LUNATIC_CRASH_STUN_SEC = 0.3;
export const LUNATIC_CRASH_DAMAGE_BRACKET_1_SEC = 2;
export const LUNATIC_CRASH_DAMAGE_BRACKET_2_SEC = 4;
export const LUNATIC_CRASH_DAMAGE_TIER_1 = 1;
export const LUNATIC_CRASH_DAMAGE_TIER_2 = 2;
export const LUNATIC_CRASH_DAMAGE_TIER_3 = 3;
export const LUNATIC_TURN_RADIUS_PX = 168;
export const LUNATIC_STEER_MAX_RAD_PER_SEC = 2.35;
export const LUNATIC_ROAR_COOLDOWN_SEC = 30;
export const LUNATIC_ROAR_DURATION_SEC = 1;
export const LUNATIC_ROAR_SPEED_MULT = 1.12;
export const LUNATIC_ROAR_TERRAIN_DAMAGE_INTERVAL_SEC = 0.1;
export const LUNATIC_ROAR_TERRAIN_DAMAGE = 3;
export const LUNATIC_SPRINT_TIER_FX_DUR_T2 = 0.38;
export const LUNATIC_SPRINT_TIER_FX_DUR_T4 = 0.52;

// --- Valiant (REFERENCE `standalone.js` tuning) ---

export const VALIANT_RABBIT_BASE_HP = 4;
export const VALIANT_RESCUE_COOLDOWN_SEC = 25;
export const VALIANT_RESCUE_WILL_RESTORE = 0.4;
export const VALIANT_WILL_RABBIT_DEATH_COST = 0.25;
export const VALIANT_WILL_DECAY_PER_EMPTY_SLOT = 7e-3;
export const VALIANT_WILL_REGEN_PER_SEC_THREE_RABBITS = 3e-3;
export const VALIANT_SHOCK_BOX_W = 168;
export const VALIANT_SHOCK_BOX_H = 120;
export const VALIANT_SHOCK_BOX_DURATION_SEC = 4.6;
export const VALIANT_BUNNY_PICKUP_R = 12;
export const VALIANT_BUNNY_SPAWN_INTERVAL = 7.2;
export const VALIANT_BUNNY_LIFETIME_SEC = 18;
export const VALIANT_DIAMOND_RESCUE_WILL_BONUS = 0.12;
export const VALIANT_DIAMOND_BOX_SCALE = 1.32;
/** Q — REFERENCE `abilities.dash` for valiant. */
export const VALIANT_SURGE_COOLDOWN_SEC = 5;
export const VALIANT_SURGE_MIN_COOLDOWN_SEC = 0.45;
export const VALIANT_SURGE_DURATION_SEC = 3;
export const VALIANT_SURGE_SPEED_MULT = 2;
export const VALIANT_SURGE_SPEED_MULT_DIAMOND = 2.6;
export const VALIANT_SURGE_DURATION_DIAMOND_BONUS_SEC = 1.5;
/** W shock placement — REFERENCE `abilities.burst.cooldown`. */
export const VALIANT_SHOCK_ABILITY_COOLDOWN_SEC = 6.5;
export const VALIANT_SHOCK_ABILITY_MIN_COOLDOWN_SEC = 0.5;
