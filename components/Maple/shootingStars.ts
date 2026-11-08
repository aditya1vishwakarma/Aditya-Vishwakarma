import * as THREE from 'three';
import { EVENING } from './mapleConfig';
import type { Lobe } from './tree';

/**
 * Now and then at night, a star falls: a dead straight line, fast, with a
 * bright head and a tail thinning away behind it. The head burns out where
 * the line ends, and the tail lingers where it was and fades. Nothing like the
 * wind's lines, which are slow and curved and swell through their middles.
 *
 * It's drawn in the sky's own shader (`makeSkyMaterial`), and only ever laid
 * where it's clear of everything: each path is chosen on the screen as the shot
 * stands then, wholly above the land's highest point in view, the far trees
 * included, and clear of the maple's crown. A straight line between two points
 * above that stays above it. If no such path comes up, as on a narrow screen
 * can happen, none falls this time.
 */

const { first, every, flight, linger, length, slant, tail } = EVENING.shootingStars;
/** How far clear of the land, and of the crown, a path keeps, as shares of the screen's height. */
const CLEAR = { land: 0.05, crown: 0.04 };
/** How near the screen's other edges a path comes, as a share of the way from its middle to the edge. */
const EDGE = 0.92;
/** Paths tried before giving this one up. */
const TRIES = 32;

const between = ([least, most]: readonly [number, number]) => least + Math.random() * (most - least);

const point = new THREE.Vector3();
const rim = new THREE.Vector3();
const across = new THREE.Vector3();
const start = new THREE.Vector3();
const end = new THREE.Vector3();
const toward = new THREE.Vector3();
const normal = new THREE.Vector3();

/** How far (x, y) is from the line from a to b, as far as its ends. */
const offLine = (x: number, y: number, ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = THREE.MathUtils.clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1);
  return Math.hypot(x - ax - dx * t, y - ay - dy * t);
};

/** The sky's uniforms for this: `uFall` is the head, how long the tail is, and how bright the tail and the head. */
export interface FallUniforms {
  uFrom: { value: THREE.Vector3 };
  uAlong: { value: THREE.Vector3 };
  uSide: { value: THREE.Vector3 };
  uFall: { value: THREE.Vector4 };
}

export class ShootingStars {
  /** One falling now: the scene draws every frame while it does. */
  falling = false;
  private span = 0;
  private time = 0;
  private flies = 0;
  private next = 0;
  private waiting = false;

  constructor(
    private sky: FallUniforms,
    /** What's solid at the skyline, as points: the land's, and each far tree's top. */
    private land: Float32Array[],
    private lobes: Lobe[],
  ) {}

  /** A path on the screen as the camera stands, or null if none is clear. Each end in the screen's own -1 to 1. */
  private path(camera: THREE.PerspectiveCamera) {
    camera.updateMatrixWorld();
    // The highest the land comes on the screen.
    let top = -1;
    for (const points of this.land) {
      for (let i = 0; i < points.length; i += 3) {
        point.set(points[i], points[i + 1], points[i + 2]).project(camera);
        if (point.z < 1 && Math.abs(point.x) < 1.05 && point.y > top) top = point.y;
      }
    }
    const aspect = camera.aspect;
    const floor = top + 2 * CLEAR.land;
    // The crown's leaf masses on the screen, in the screen's height across (x stretched by the aspect).
    across.setFromMatrixColumn(camera.matrixWorld, 0);
    const crown = this.lobes.map((lobe) => {
      point.copy(lobe.centre).project(camera);
      rim.copy(lobe.centre).addScaledVector(across, lobe.radius).project(camera);
      return { x: point.x * aspect, y: point.y, r: Math.hypot((rim.x - point.x) * aspect, rim.y - point.y) + 2 * CLEAR.crown };
    });
    for (let i = 0; i < TRIES; i++) {
      const long = 2 * between(length) * Math.min(1, aspect);
      const angle = THREE.MathUtils.degToRad(between(slant));
      const dx = Math.cos(angle) * long * (Math.random() < 0.5 ? -1 : 1);
      const dy = Math.sin(angle) * long * (Math.random() < 0.5 ? -1 : 1);
      // Both ends on the screen, above the land, in x stretched by the aspect as the crown's are.
      const reach = EDGE * aspect;
      const ax = -reach + Math.random() * 2 * reach;
      const ay = floor + Math.random() * (EDGE - floor);
      const bx = ax + dx;
      const by = ay + dy;
      if (Math.abs(bx) > reach || by > EDGE || by < floor) continue;
      if (crown.some((c) => offLine(c.x, c.y, ax, ay, bx, by) < c.r)) continue;
      return { from: [ax / aspect, ay] as const, to: [bx / aspect, by] as const };
    }
    return null;
  }

  /** Sets one falling now, if there's a clear path. Returns the path, on the screen. */
  launch(camera: THREE.PerspectiveCamera) {
    const path = this.path(camera);
    if (!path) return null;
    start.set(path.from[0], path.from[1], 0.5).unproject(camera).sub(camera.position).normalize();
    end.set(path.to[0], path.to[1], 0.5).unproject(camera).sub(camera.position).normalize();
    // The great circle through them, which a camera sees as a straight line.
    normal.crossVectors(start, end).normalize();
    toward.crossVectors(normal, start).normalize();
    this.sky.uFrom.value.copy(start);
    this.sky.uAlong.value.copy(toward);
    this.sky.uSide.value.copy(normal);
    this.span = THREE.MathUtils.radToDeg(start.angleTo(end));
    this.flies = between(flight);
    this.time = 0;
    this.falling = true;
    return path;
  }

  /** A frame: `free` is whether one may set off now (full night, nothing moving, no pane open). */
  update(dt: number, camera: THREE.PerspectiveCamera, night: boolean, free: boolean) {
    if (!night) {
      this.waiting = false;
    } else if (!this.waiting) {
      this.waiting = true;
      this.next = between(first);
    }
    if (this.falling) this.fly(dt);
    else if (this.waiting && free && (this.next -= dt) <= 0) {
      this.next = between(every);
      this.launch(camera);
      if (this.falling) this.fly(0);
    }
  }

  private fly(dt: number) {
    this.time += dt;
    const fall = this.sky.uFall.value;
    const t = this.time / this.flies;
    if (this.time >= this.flies + linger) {
      this.falling = false;
      fall.set(0, 0, 0, 0);
      return;
    }
    const ss = THREE.MathUtils.smoothstep;
    // Flares up quickly, runs the line, burns out at its end; what it left fades where it lies.
    const head = this.span * Math.min(1, t);
    const trail = ss(t, 0, 0.12) * (1 - ss(this.time, this.flies, this.flies + linger));
    const glow = ss(t, 0, 0.12) * (1 - ss(t, 0.7, 1));
    fall.set(head, this.span * tail, trail, glow);
  }
}
