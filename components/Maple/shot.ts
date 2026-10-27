import * as THREE from 'three';
import { SHOT } from './mapleConfig';

/**
 * The shot's lines, worked out once: where the eye stands, which way it
 * looks, and how far to either side anything can ever come into view — the
 * widest field of view there's room for, plus the free camera's turn. The
 * world is built within that and no farther.
 */

export const EYE = new THREE.Vector3(...SHOT.position);
export const TARGET = new THREE.Vector3(...SHOT.target);

/** The way the eye looks, level. */
export const LOOK = new THREE.Vector3().subVectors(TARGET, EYE).setY(0).normalize();

/** Compass bearing of the shot in degrees, 0 being straight down -z. The sky's clouds are set about it. */
export const BEARING = THREE.MathUtils.radToDeg(Math.atan2(LOOK.x, -LOOK.z));

/**
 * What can be seen: a fan opening from a point a little behind the eye, so
 * it holds wherever the free camera stands, out past the near ridge.
 */
export const FAN = {
  apex: EYE.clone().addScaledVector(LOOK, -16),
  /** Either side of the shot's line, in degrees. */
  spread: 72,
  reach: 340,
};

/** Whether ground at (x, z) can ever be seen. */
export const inView = (x: number, z: number, margin = 0) => {
  const dx = x - FAN.apex.x;
  const dz = z - FAN.apex.z;
  const along = dx * LOOK.x + dz * LOOK.z;
  const across = Math.abs(dx * LOOK.z - dz * LOOK.x);
  return along > 0 && Math.atan2(across, along) < THREE.MathUtils.degToRad(FAN.spread + margin);
};
