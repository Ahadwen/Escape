/**
 * Halls-specific wave pacing and piece-based enemy composition.
 * Keeps all "chess identity" spawn decisions centralized..
 */

export const HALLS_PIECE_IDS = Object.freeze({
  PAWN: "hallsPawn",
  ROOK: "hallsRook",
  KNIGHT: "hallsKnight",
  BISHOP: "hallsBishop",
  QUEEN: "hallsQueen",
  KING: "hallsKing",
});

/** @param {string | undefined} type */
export function isHallsChessEnemyType(type) {
  return (
    type === HALLS_PIECE_IDS.PAWN ||
    type === HALLS_PIECE_IDS.ROOK ||
    type === HALLS_PIECE_IDS.KNIGHT ||
    type === HALLS_PIECE_IDS.BISHOP ||
    type === HALLS_PIECE_IDS.QUEEN ||
    type === HALLS_PIECE_IDS.KING
  );
}

/** Wave chess-coin hunters are removed after this many simulated seconds (`spawnHunter` → `dieAt`). */
export const HALLS_ENEMY_LIFETIME_SEC = 20;

/** World / contact radius for halls coin hunters (px); full diameter = 2×. Must match coin art in `hunterDraw.js`. */
export const HALLS_COIN_HIT_RADIUS_PX = 50;

/**
 * Atlas `Chess.png`: pixel source rects per piece (non-blank bbox from edge flood-fill).
 * Regenerate after changing the PNG: `npm run analyze:chess` (see `scripts/analyze-chess-atlas.mjs`).
 * Row0: king, queen, rook — row1: bishop, knight, pawn.
 */
export const HALLS_CHESS_ATLAS_SRC_RECTS = Object.freeze({
  [HALLS_PIECE_IDS.KING]: { sx: 271, sy: 117, sw: 506, sh: 505 },
  [HALLS_PIECE_IDS.QUEEN]: { sx: 883, sy: 117, sw: 505, sh: 505 },
  [HALLS_PIECE_IDS.ROOK]: { sx: 1497, sy: 116, sw: 505, sh: 506 },
  [HALLS_PIECE_IDS.BISHOP]: { sx: 272, sy: 648, sw: 507, sh: 511 },
  [HALLS_PIECE_IDS.KNIGHT]: { sx: 884, sy: 648, sw: 507, sh: 511 },
  [HALLS_PIECE_IDS.PAWN]: { sx: 1497, sy: 647, sw: 510, sh: 512 },
});

function clamp01(v) {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
}

/**
 * Pixel source rect for a halls chess piece in `Chess.png` (`HALLS_CHESS_ATLAS_SRC_RECTS`).
 * @param {string} pieceType `hallsKing` … `hallsPawn`
 * @param {number} imgW
 * @param {number} imgH
 * @returns {{ sx: number; sy: number; sw: number; sh: number } | null}
 */
export function getHallsChessAtlasSrcRect(pieceType, imgW, imgH) {
  if (!Number.isFinite(imgW) || !Number.isFinite(imgH) || imgW < 8 || imgH < 8) return null;
  const rect = HALLS_CHESS_ATLAS_SRC_RECTS[pieceType];
  if (!rect) return null;
  const { sx, sy, sw, sh } = rect;
  if (sx + sw > imgW + 0.5 || sy + sh > imgH + 0.5) return null;
  return { sx, sy, sw, sh };
}

/** Visual coin diameter (2 × hit radius); dash distances are keyed off this. */
export const HALLS_COIN_DIAMETER_PX = HALLS_COIN_HIT_RADIUS_PX * 2;
/** “1.5× coin” pawn step; also knight short leg. */
export const HALLS_PAWN_DASH_PX = HALLS_COIN_DIAMETER_PX * 1.5;
/** Knight long leg (= 2 pawn dashes); short leg (= 1 pawn dash). */
export const HALLS_KNIGHT_LONG_LEG_PX = HALLS_PAWN_DASH_PX * 2;
export const HALLS_KNIGHT_SHORT_LEG_PX = HALLS_PAWN_DASH_PX;

/** Sliding pieces (rook/bishop/queen/king): max ray probe per move. */
export const HALLS_SLIDE_PROBE_MAX_PX = 1000;

/** Bishop: hard cap on any single ray probe (obstacles). */
export const HALLS_BISHOP_APPROACH_CAP_PX = 2400;
/** One diagonal “line up” glide: up to this length, and at least `LINEUP_MIN`, scaled by distance. */
export const HALLS_BISHOP_LINEUP_MIN_PX = 220;
export const HALLS_BISHOP_LINEUP_MAX_PX = 920;
/** Fraction of distance-to-player used as line-up slide length (clamped by min/max). */
export const HALLS_BISHOP_LINEUP_FRAC = 0.42;
/** Planner weights: prioritize lying on a shot diagonal, then closing distance. */
export const HALLS_BISHOP_ALIGN_CROSS_WEIGHT = 3.1;
export const HALLS_BISHOP_ALIGN_DIST_WEIGHT = 0.00012;
/** Pause on-diagonal before committing a strike through the player. */
export const HALLS_BISHOP_PAUSE_SEC = 0.36;
/** Pause when switching to a different diagonal before the line-up glide (longer = clearer “re-aim”). */
export const HALLS_BISHOP_TURN_PAUSE_SEC = 0.28;
/** Ray–player alignment (px): |cross| below this ⇒ player lies near this diagonal from the bishop. */
export const HALLS_BISHOP_LINE_CROSS_EPS = 48;
export const HALLS_BISHOP_PLAYER_CLEAR_BUFFER = 18;
/** Strike commits when first hit along ray is within this (px) and we’re aligned. */
export const HALLS_BISHOP_STRIKE_COMMIT_MAX_T_PX = 520;
/** How far past first contact with the player disk the strike glide aims (px along ray). */
export const HALLS_BISHOP_STRIKE_PAST_PLAYER_PX = 110;
export const HALLS_BISHOP_STRIKE_MAX_T_PX = 2200;

/** Rook: slide along rank or file only until aligned, pause, then strike on that line (re-approach after miss). */
export const HALLS_ROOK_APPROACH_CAP_PX = 2400;
export const HALLS_ROOK_LINEUP_MIN_PX = 180;
export const HALLS_ROOK_LINEUP_MAX_PX = 820;
export const HALLS_ROOK_LINEUP_FRAC = 0.54;
export const HALLS_ROOK_ALIGN_CROSS_WEIGHT = 4.2;
export const HALLS_ROOK_ALIGN_DIST_WEIGHT = 0.00007;
export const HALLS_ROOK_PAUSE_SEC = 0.18;
export const HALLS_ROOK_TURN_PAUSE_SEC = 0.2;
/** |Δx| or |Δy| to ray (same file / same rank) must be below this to commit a strike. */
export const HALLS_ROOK_LINE_CROSS_EPS = 56;
export const HALLS_ROOK_STRIKE_COMMIT_MAX_T_PX = 760;
export const HALLS_ROOK_STRIKE_PAST_PLAYER_PX = 140;
export const HALLS_ROOK_STRIKE_MAX_T_PX = 2200;

/** Queen ray slide cap per impulse (still “freedom”, just not absurd single ticks). King uses the same mechanics with a modest cap. */
export const HALLS_QUEEN_SLIDE_CAP_PX = 5200;
export const HALLS_KING_SLIDE_CAP_PX = 1320;

/** Default chess-piece glide speed (px/s); knight long leg runs slower so L-shape reads clearly. */
export const HALLS_CHESS_GLIDE_SPEED_PX_S = 820;
/** Knight: long leg glide (orthogonal); short leg is faster for a crisp “corner”. */
export const HALLS_KNIGHT_LONG_GLIDE_MUL = 0.64;
export const HALLS_KNIGHT_SHORT_GLIDE_MUL = 1.52;

const HALLS_WAVE_RAMP_SEC = 300;
const HALLS_WAVE_INTERVAL_START_SEC = 20;
const HALLS_WAVE_INTERVAL_FLOOR_SEC = 10;
const HALLS_WAVE_JOBS_START = 1;
const HALLS_WAVE_JOBS_END = 3;

function hallsRamp01(relDifficultySurvivalSec) {
  return clamp01(relDifficultySurvivalSec / HALLS_WAVE_RAMP_SEC);
}

export function getHallsSpawnIntervalSec(relDifficultySurvivalSec) {
  const t = hallsRamp01(relDifficultySurvivalSec);
  return HALLS_WAVE_INTERVAL_START_SEC + (HALLS_WAVE_INTERVAL_FLOOR_SEC - HALLS_WAVE_INTERVAL_START_SEC) * t;
}

export function getHallsWaveSpawnJobs(relDifficultySurvivalSec) {
  const t = hallsRamp01(relDifficultySurvivalSec);
  return Math.max(HALLS_WAVE_JOBS_START, Math.min(HALLS_WAVE_JOBS_END, HALLS_WAVE_JOBS_START + Math.floor(t * 2)));
}

/**
 * Maps chess piece identities to current hunter archetypes.
 * This lets us evolve each piece into bespoke behavior later without changing call sites.
 */
export function resolveHallsPieceHunterType(pieceType) {
  if (pieceType === HALLS_PIECE_IDS.PAWN) return HALLS_PIECE_IDS.PAWN;
  if (pieceType === HALLS_PIECE_IDS.ROOK) return HALLS_PIECE_IDS.ROOK;
  if (pieceType === HALLS_PIECE_IDS.KNIGHT) return HALLS_PIECE_IDS.KNIGHT;
  if (pieceType === HALLS_PIECE_IDS.BISHOP) return HALLS_PIECE_IDS.BISHOP;
  if (pieceType === HALLS_PIECE_IDS.QUEEN) return HALLS_PIECE_IDS.QUEEN;
  if (pieceType === HALLS_PIECE_IDS.KING) return HALLS_PIECE_IDS.KING;
  return HALLS_PIECE_IDS.PAWN;
}

/**
 * Piece mix shifts from mostly pawns to more elite pieces over time.
 * @param {number} relDifficultySurvivalSec
 * @param {() => number} [rng]
 */
export function pickHallsWavePieceType(relDifficultySurvivalSec, rng = Math.random) {
  const t = hallsRamp01(relDifficultySurvivalSec);
  const roll = Math.max(0, Math.min(0.999999, Number(rng?.() ?? Math.random())));

  const pawnCut = 0.72 - t * 0.28; // 72% -> 44%
  const rookCut = pawnCut + (0.11 + t * 0.05);
  const knightCut = rookCut + (0.09 + t * 0.06);
  const bishopCut = knightCut + (0.09 + t * 0.07);
  const queenCut = bishopCut + (0.04 + t * 0.08);
  if (roll < pawnCut) return HALLS_PIECE_IDS.PAWN;
  if (roll < rookCut) return HALLS_PIECE_IDS.ROOK;
  if (roll < knightCut) return HALLS_PIECE_IDS.KNIGHT;
  if (roll < bishopCut) return HALLS_PIECE_IDS.BISHOP;
  if (roll < queenCut) return HALLS_PIECE_IDS.QUEEN;
  return HALLS_PIECE_IDS.KING;
}

export function pickHallsWaveSpawnSpec(relDifficultySurvivalSec, rng = Math.random) {
  const pieceType = pickHallsWavePieceType(relDifficultySurvivalSec, rng);
  return {
    pieceType,
    hunterType: resolveHallsPieceHunterType(pieceType),
  };
}
