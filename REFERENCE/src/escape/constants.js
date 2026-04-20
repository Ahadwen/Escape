export const TAU = Math.PI * 2;
export const TILE_W = 560;
export const BLOCK = 35;
export const CAMERA_PAN_SPEED = 900;
export const HEAL_PICKUP_HIT_R = 24;
/** Map card pickup: collision radius in world px. */
export const CARD_PICKUP_HIT_R = 20;
/** Extra reach beyond `card.r + player.r` when collecting a map card. */
export const CARD_PICKUP_REACH_EXTRA = 10;
export const HEAL_PICKUP_PLUS_HALF = 13;
export const HEAL_PICKUP_ARM_THICK = 6;
export const SNIPER_ARTILLERY_WINDUP = 1.38;
export const SNIPER_ARTILLERY_LEAD = 0.82;
/** Seconds of impact flash / shockwave before the lingering ground hazard is shown. */
export const SNIPER_ARTILLERY_BANG_DURATION = 0.34;

export function tileGridDims(viewH) {
  return {
    TILE_COLS: Math.floor(TILE_W / BLOCK),
    TILE_ROWS: Math.floor(viewH / BLOCK),
  };
}
