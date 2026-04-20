/** Uniform float in `[a, b)` for gameplay jitter (spawn spacing, etc.). */
export function randRange(a, b) {
  return a + Math.random() * (b - a);
}

/** Deterministic 0..1 PRNG for world generation (Mulberry32-style mix). */
export function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
