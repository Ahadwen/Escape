export function formatValiantWillRateLine(occupiedCount, netPerSec) {
  const empty = 3 - occupiedCount;
  const sign = netPerSec >= 0 ? "+" : "";
  return `Rabbits: ${occupiedCount}/3 (${empty} empty) — ${sign}${netPerSec.toFixed(3)} Will/s`;
}
