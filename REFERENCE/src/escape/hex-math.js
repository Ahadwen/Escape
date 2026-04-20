/**
 * Axial hex coordinates ↔ world pixels. Depends on `balance.js` hex scale.
 */
import { HEX_SIZE, SQRT3 } from "./balance.js";

export function hexToWorld(q, r) {
  return {
    x: HEX_SIZE * SQRT3 * (q + r / 2),
    y: HEX_SIZE * 1.5 * r,
  };
}

export function worldToHex(x, y) {
  const qf = ((SQRT3 / 3) * x - (1 / 3) * y) / HEX_SIZE;
  const rf = ((2 / 3) * y) / HEX_SIZE;
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

export function hexKey(q, r) {
  return `${q},${r}`;
}
