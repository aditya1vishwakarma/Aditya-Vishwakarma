import * as THREE from 'three';
import { WIND } from './mapleConfig';

/**
 * The wind, in two parts.
 *
 * Sway is how far a point on the tree has been pushed from where it grew. It
 * is a smooth function of that rest position alone, so a twig and the leaves
 * at its tip are always pushed alike and never come apart. It exists twice —
 * in GLSL for the drawing, in JS for the shadows and for loosing a leaf from
 * exactly where it hangs — and the two must be kept identical.
 *
 * Gusts come and go on a slow, irregular clock: build, hold, die away, calm.
 */

/* ─── Sway ─────────────────────────────────────────────────────── */

export const SWAY_GLSL = /* glsl */ `
  uniform float uTime;
  uniform float uGust;

  vec3 sway(vec3 p) {
    float h = clamp(p.y / 10.0, 0.0, 1.2);
    // The whole tree leans downwind as a gust builds, and rocks gently about that lean.
    float rock = sin(uTime * 0.83) * 0.55 + sin(uTime * 1.37 + 1.9) * 0.3 + sin(uTime * 2.11 + 0.7) * 0.15;
    float lean = uGust * 0.22 + (0.07 + 0.09 * uGust) * rock;
    vec3 d = vec3(lean, 0.0, -0.18 * lean) * h * h;
    // Limbs and leaf masses: quicker, smaller, and out of step across the crown.
    float reach = clamp(length(p.xz) / 4.0, 0.0, 1.3);
    float phase = dot(p, vec3(0.73, 0.41, 0.57));
    float amp = (0.05 + 0.075 * uGust) * (0.35 + reach) * h;
    d.x += amp * sin(uTime * 2.4 + phase);
    d.y += amp * 0.55 * sin(uTime * 3.1 + phase * 1.31 + 0.8);
    d.z += amp * 0.6 * sin(uTime * 2.0 + phase * 0.77 + 2.1);
    return d;
  }
`;

const clamp = THREE.MathUtils.clamp;

/** The JS twin of `sway` above. */
export const sway = (p: THREE.Vector3, time: number, gust: number, out = new THREE.Vector3()) => {
  const h = clamp(p.y / 10, 0, 1.2);
  const rock = Math.sin(time * 0.83) * 0.55 + Math.sin(time * 1.37 + 1.9) * 0.3 + Math.sin(time * 2.11 + 0.7) * 0.15;
  const lean = gust * 0.22 + (0.07 + 0.09 * gust) * rock;
  out.set(lean, 0, -0.18 * lean).multiplyScalar(h * h);
  const reach = clamp(Math.hypot(p.x, p.z) / 4, 0, 1.3);
  const phase = p.x * 0.73 + p.y * 0.41 + p.z * 0.57;
  const amp = (0.05 + 0.075 * gust) * (0.35 + reach) * h;
  out.x += amp * Math.sin(time * 2.4 + phase);
  out.y += amp * 0.55 * Math.sin(time * 3.1 + phase * 1.31 + 0.8);
  out.z += amp * 0.6 * Math.sin(time * 2.0 + phase * 0.77 + 2.1);
  return out;
};

/* ─── Gusts ────────────────────────────────────────────────────── */

const smooth = (t: number) => t * t * (3 - 2 * t);
const between = (rand: () => number, [a, b]: readonly [number, number]) => a + (b - a) * rand();

/**
 * The gust clock. `level` runs from 0 in calm air up to the gust's strength,
 * eased at both ends so nothing ever jerks.
 */
export class Gusts {
  time = 0;
  level = 0;
  /** When the next gust is due, while the air is calm. */
  nextAt: number = WIND.firstGust;
  /** Called as each gust begins, with its strength. */
  onGust: ((strength: number) => void) | null = null;
  /** Whether the wind is carrying a leaf just now; whoever flies the leaves says so. */
  carrying = false;
  /** While held, no gust begins — one already blowing dies away as usual — and the breezes wait too. */
  held = false;

  private start = -1;
  private from = 0;
  private hold = 2;
  private peak = 1;

  constructor(private rand: () => number) {}

  get blowing() {
    return this.start >= 0;
  }

  /** A gust now, rising from whatever the air is doing. */
  trigger() {
    this.begin();
  }

  update(dt: number) {
    this.time += dt;
    if (this.held && this.start < 0) this.nextAt = Math.max(this.nextAt, this.time + WIND.afterHold);
    if (this.start < 0 && this.time >= this.nextAt) this.begin();
    if (this.start < 0) {
      this.level = 0;
      return;
    }
    const t = this.time - this.start;
    const { rise, fall } = WIND;
    let e: number;
    if (t < rise) e = this.from + (1 - this.from) * smooth(t / rise);
    else if (t < rise + this.hold) e = 1;
    else if (t < rise + this.hold + fall) e = 1 - smooth((t - rise - this.hold) / fall);
    else {
      e = 0;
      this.start = -1;
      this.nextAt = this.time + between(this.rand, WIND.calm);
    }
    this.level = e * this.peak;
  }

  private begin() {
    this.peak = between(this.rand, WIND.strength);
    this.from = Math.min(1, this.level / this.peak);
    this.hold = between(this.rand, WIND.hold);
    this.start = this.time;
    this.onGust?.(this.peak);
  }
}
