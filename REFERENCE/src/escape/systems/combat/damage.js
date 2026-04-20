/**
 * Generic combat helpers extracted from game monolith.
 */
export function resolveValiantDamagePacket(amount, opts = {}) {
  if (amount <= 0) return 0;
  return opts.surgeHexPulse ? 1 : amount;
}
