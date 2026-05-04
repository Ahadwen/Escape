/**
 * Halls `hallsRadial` — strike radii and timings (shared by `hunterRuntime` + `hunterDraw`).
 * Strikes use filled disks: any target overlapping the circle of radius `*_STRIKE_R` is hit.
 */

export const HALLS_RADIAL_BODY_R = 46;

/** First strike: full damage within this radius from spawn center. */
export const HALLS_RADIAL_INNER_STRIKE_R = 200;

/** Second strike: larger disk. */
export const HALLS_RADIAL_OUTER_STRIKE_R = 322;

/** Broadcast at landing site before the unit appears. */
export const HALLS_RADIAL_WARN_SEC = 0.92;

/** Landed: body visible and can move before the first ring fires. */
export const HALLS_RADIAL_BODY_SEC = 1.45;

/** Moving disk stays lethal for this long (damage ticks follow the hunter). */
export const HALLS_RADIAL_RING_HIT_VIS_SEC = 0.52;

/** Min time between moving-disk damage samples while inner/outer hit is active. */
export const HALLS_RADIAL_RING_DISK_TICK_SEC = 0.34;

export const HALLS_RADIAL_FADE_SEC = 0.55;

/** `hallsTribunalBouncer` — lethal disk radius (matches `applyHallsRadialRingStrike` in hunterRuntime). */
export const HALLS_TRIBUNAL_BOUNCER_RING_DAMAGE_R = 124;

/** Min time between moving-disk damage samples for tribunal bouncers. */
export const HALLS_TRIBUNAL_BOUNCER_RING_TICK_SEC = 0.16;
