import * as THREE from 'three';
import { BEARING, FAN, LOOK } from './shot';

/**
 * The lie of the land, read off the sketch: the tree's knoll on the left, a
 * dip, a broader hill behind and to the right, then a long rise running off
 * the right edge. Two far ridges stand behind it all, flat as stage flats.
 *
 * One height function serves the ground mesh and the falling leaves, so a
 * leaf always comes to rest on the grass that's drawn.
 */

/** A round-shouldered rise: 1 at its centre, easing smoothly to 0 at one radius. */
const rise = (dx: number, dz: number, rx: number, rz: number) => {
  const q = (dx / rx) ** 2 + (dz / rz) ** 2;
  return q >= 1 ? 0 : (1 - q) * (1 - q);
};

const raw = (x: number, z: number) =>
  // The knoll the tree stands on, its crown a little right of the trunk, its
  // broad near slope where the fallen leaves come to rest.
  3.3 * rise(x - 2.5, z + 0.5, 17, 13) +
  // The hill behind, to the right…
  7.5 * rise(x - 22, z + 52, 28, 20) +
  // …a dip, and the long rise off the right edge.
  13 * rise(x - 72, z + 62, 42, 32) +
  0.25 * Math.sin(x * 0.11 + 1.3) * Math.sin(z * 0.09 + 0.4);

const ORIGIN = raw(0, 0);

/** Height of the ground, with the tree's foot at 0. */
export const groundHeight = (x: number, z: number) => raw(x, z) - ORIGIN;

export const groundNormal = (x: number, z: number, out = new THREE.Vector3()) => {
  const e = 0.05;
  const dx = groundHeight(x + e, z) - groundHeight(x - e, z);
  const dz = groundHeight(x, z + e) - groundHeight(x, z - e);
  return out.set(-dx, 2 * e, -dz).normalize();
};

/* ─── Geometry ─────────────────────────────────────────────────── */

/**
 * The ground the shot can see, and no more: a fan opening out from just
 * behind the eye, its rings bunched up close by and spreading out with
 * distance, where nothing small is ever seen.
 */
export function buildGround(): THREE.BufferGeometry {
  const turns = 96;
  const rings = 150;
  const near = 4;
  const facing = Math.atan2(LOOK.x, LOOK.z);
  const spread = THREE.MathUtils.degToRad(FAN.spread);
  const positions = new Float32Array((turns + 1) * (rings + 1) * 3);
  const normals = new Float32Array(positions.length);
  const n = new THREE.Vector3();
  let k = 0;
  for (let j = 0; j <= rings; j++) {
    const r = near * Math.pow(FAN.reach / near, j / rings);
    for (let i = 0; i <= turns; i++) {
      const a = facing + ((i / turns) * 2 - 1) * spread;
      const x = FAN.apex.x + Math.sin(a) * r;
      const z = FAN.apex.z + Math.cos(a) * r;
      positions[k] = x;
      positions[k + 1] = groundHeight(x, z);
      positions[k + 2] = z;
      groundNormal(x, z, n);
      normals[k] = n.x;
      normals[k + 1] = n.y;
      normals[k + 2] = n.z;
      k += 3;
    }
  }
  // Wound so every face looks up, whichever way round the fan was swept.
  const up = (() => {
    const p = (v: number) => new THREE.Vector3(positions[v * 3], 0, positions[v * 3 + 2]);
    const a = p(0);
    return new THREE.Vector3().crossVectors(p(turns + 1).sub(a), p(1).sub(a)).y > 0;
  })();
  const index: number[] = [];
  for (let j = 0; j < rings; j++) {
    for (let i = 0; i < turns; i++) {
      const a = j * (turns + 1) + i;
      const b = a + turns + 1;
      if (up) index.push(a, b, a + 1, a + 1, b, b + 1);
      else index.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setIndex(index);
  geometry.computeBoundingSphere();
  return geometry;
}

/** The far ridges stand round the scene, centred on the middle of the shot. */
const RING_CENTRE = { x: 8, z: 0 };
export const NEAR_RIDGE = 240;
export const FAR_RIDGE = 420;

/**
 * A far ridge: a flat silhouette standing upright at `radius` from the middle
 * of the shot, its top edge traced by `height` — a function of the angle
 * round from straight down -z. Far enough off that it needs no more than
 * that, and only built across the part of the horizon the shot can see.
 */
export function buildRidge(radius: number, height: (angle: number) => number): THREE.BufferGeometry {
  const segments = 240;
  const facing = THREE.MathUtils.degToRad(BEARING);
  const half = THREE.MathUtils.degToRad(110);
  const positions: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = facing + ((i / segments) * 2 - 1) * half;
    const x = RING_CENTRE.x + radius * Math.sin(a);
    const z = RING_CENTRE.z - radius * Math.cos(a);
    positions.push(x, -40, z, x, height(a), z);
  }
  const index: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * The nearer ridge: low and rolling, with a fringe of distant trees along its
 * top. It only shows in the dips, never behind the tree, which stands against
 * open sky as in the sketch. Whole turns of every wave fit round the ring,
 * so it meets itself without a seam.
 */
export const nearRidgeHeight = (a: number) => {
  const x = a * NEAR_RIDGE;
  const roll = -0.8 + 2.1 * Math.sin(a * 3 + 1.1) + 1.3 * Math.sin(a * 8 + 2.3);
  const trees = Math.max(0, Math.sin(x * 0.9) * Math.sin(x * 0.37 + 1.0)) * 1.2 + Math.abs(Math.sin(x * 2.3)) * 0.45;
  return roll + trees * (0.5 + 0.5 * Math.sin(a * 12));
};

export const farRidgeHeight = (a: number) => 6.2 + 3.7 * Math.sin(a * 3 + 0.4) + 2.5 * Math.sin(a * 8 + 2.0);
