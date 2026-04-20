const SQRT3 = Math.sqrt(3);

/** Axial neighbor offsets (pointy-top), same winding as REFERENCE `HEX_DIRS`. */
export const HEX_DIRS = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export function hexKey(q, r) {
  return `${q},${r}`;
}

/** Pointy-top hex: world center from axial coordinates (q, r). */
export function axialToWorld(q, r, hexRadius) {
  return {
    x: hexRadius * SQRT3 * (q + r / 2),
    y: hexRadius * 1.5 * r,
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

/** Snap world position to nearest hex axial (q, r). */
export function worldToAxial(x, y, hexRadius) {
  const qf = (SQRT3 / 3) * (x / hexRadius) - (1 / 3) * (y / hexRadius);
  const rf = ((2 / 3) * y) / hexRadius;
  return axialRound(qf, rf);
}

/** All axial cells within `radius` steps of center (0,0), inclusive. */
export function hexDisk(radius) {
  const out = [];
  for (let q = -radius; q <= radius; q++) {
    const rMin = Math.max(-radius, -q - radius);
    const rMax = Math.min(radius, -q + radius);
    for (let r = rMin; r <= rMax; r++) out.push({ q, r });
  }
  return out;
}
