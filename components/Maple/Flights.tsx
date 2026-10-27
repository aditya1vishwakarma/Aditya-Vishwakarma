import React, { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BREEZE, FLIGHT, WIND } from './mapleConfig';
import { makeLooseLeafMaterial, makeStreakMaterial, type SceneUniforms } from './materials';
import { EYE } from './shot';
import { groundHeight, groundNormal } from './terrain';
import type { Lobe, MapleModel } from './tree';
import { sway, type Gusts } from './wind';

/**
 * What a gust carries off: a leaf or two, and the wind's line drawn ahead.
 *
 * Each gust picks a leaf out on the downwind face of the crown and works out
 * the path the air will take: in from upwind, off the left of the shot,
 * into the crown and through the leaves to that one, then out the far side
 * — often throwing a loop like a written "e" — and away downwind, sinking.
 * A pale streak draws itself along that path and lifts off again behind;
 * the leaf trembles on its stalk as the streak reaches it, lets go, and is
 * carried along. When the gust dies it drops into the slow side-to-side
 * swing of a falling leaf, comes to rest in the grass, and after a while is
 * gone.
 *
 * Between gusts the breeze runs elsewhere: a pale line now and then over the
 * crown, along the grass or away behind — never through the tree, so it
 * takes nothing with it.
 */

const TAU = Math.PI * 2;
const Z = new THREE.Vector3(0, 0, 1);
const UP = new THREE.Vector3(0, 1, 0);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);

/* ─── Paths ────────────────────────────────────────────────────── */

/** Where every gust comes from: just off the left of the shot, upwind of the tree. */
const UPWIND_X = -13;

/** The loop a path throws, like a written "e": up, back over the top, and down through itself. */
const LOOP: [number, number][] = [[0.45, 0.3], [0.6, 0.95], [0.05, 1.3], [-0.45, 0.9], [-0.15, 0.3], [0.75, 0.02]];

/**
 * The ways the air runs on once it has let a leaf go — never the same twice:
 * on, near level; rising away; curling over at the end, like the upper
 * stroke in the sketch; or easing down and levelling out.
 */
const TAILS: [number, number][][] = [
  [[1.8, 0.15], [3.6, 0.05], [5.4, 0.25], [7, 0.2]],
  [[1.8, 0.25], [3.6, 0.7], [5.2, 1.3], [6.6, 1.8]],
  [[1.7, 0.15], [3.2, 0.5], [4.2, 1.05], [4.7, 1.6], [4.45, 1.95], [4.05, 1.8]],
  [[1.8, -0.2], [3.6, -0.55], [5.4, -0.7], [7, -0.6]],
];

/** The way in, from upwind to the point (0, 0): a long, easy wave, ending level as it reaches it. */
const leadIn = (fromX: number, add: (x: number, y: number) => void) => {
  const rise = (Math.random() - 0.5) * 1.6;
  add(fromX, rise - 0.3);
  add(fromX * 0.72, rise * 0.7 + 0.25);
  add(fromX * 0.45, rise * 0.4 - 0.1);
  add(fromX * 0.2, 0.08);
};

/** One of the tails, from (x, y), stretched and lifted a little differently each time. */
const tailOn = (x: number, y: number, add: (x: number, y: number) => void) => {
  const tail = TAILS[Math.floor(Math.random() * TAILS.length)];
  const long = 0.85 + 0.35 * Math.random();
  const tall = 0.75 + 0.5 * Math.random();
  for (const [dx, dy] of tail) add(x + dx * long, y + dy * tall);
};

/** A path, and how far along it lies each of the given points. */
const curveThrough = (pts: THREE.Vector3[], marks: number[]) => {
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const divisions = (pts.length - 1) * 24;
  curve.arcLengthDivisions = divisions;
  const lengths = curve.getLengths(divisions);
  return { curve, at: marks.map((m) => lengths[m * 24]) };
};

/**
 * The gust's path through the leaf at `at`: in from upwind and through the
 * crown to the leaf, out the far side, perhaps a loop, and away. The leaf is
 * carried as far as `release`, a little past the loop, and from there falls
 * on its own; the air runs on and lifts off.
 */
const windPath = (at: THREE.Vector3, loop: boolean) => {
  const pts: THREE.Vector3[] = [];
  // Once past the leaf, most paths drift a little toward the viewer, so it lands on the near slope.
  const toward = (Math.random() - 0.25) * 0.24;
  const add = (x: number, y: number) => pts.push(new THREE.Vector3(at.x + x, at.y + y, at.z + Math.max(0, x) * toward));
  leadIn(UPWIND_X - at.x, add);
  add(-1.4, -0.04);
  const reach = pts.length;
  add(0, 0);
  add(1.3, 0.22);
  let x = 2.4;
  const y = 0.4;
  if (loop) {
    const s = 1.05 + 0.4 * Math.random();
    for (const [dx, dy] of LOOP) add(x + dx * s, y + dy * s);
    x += 1.2 * s;
  }
  add(x + 1.4, y + (Math.random() - 0.5) * 0.4);
  const release = pts.length - 1;
  tailOn(x + 1.4, y, add);
  const { curve, at: [start, letGo] } = curveThrough(pts, [reach, release]);
  return { curve, start, release: letGo };
};

/** A second line, higher through the crown, that runs on in a tail of its own. */
const curlPath = (from: THREE.Vector3) => {
  const o = new THREE.Vector3(from.x - 0.8, from.y + 1.0, from.z + 0.3);
  const pts: THREE.Vector3[] = [];
  const add = (x: number, y: number) => pts.push(new THREE.Vector3(o.x + x, o.y + y, o.z));
  leadIn(UPWIND_X - o.x, add);
  add(-1.2, -0.1);
  add(0, 0);
  add(1.8, 0.1);
  tailOn(1.8, 0.1, add);
  return curveThrough(pts, []).curve;
};

/**
 * A breath of wind somewhere else in the scene, mostly low enough to cross
 * the lower two-thirds of the frame: along the near grass, across the plain
 * behind the tree — both following the ground's rise and fall — or now and
 * then high over the crown. Never through the tree: a path that comes within
 * `BREEZE.clearance` of any leaf mass is thrown away and another tried.
 */
const breezePath = (lobes: Lobe[]) => {
  for (let attempt = 0; attempt < 6; attempt++) {
    const band = Math.random();
    const near = band < 0.55;
    const high = band >= 0.88;
    const z = near ? 3 + Math.random() * 13 : high ? -6 + Math.random() * 12 : -14 - Math.random() * 26;
    const lift = near ? 1.2 + Math.random() : high ? 11.5 + Math.random() * 2 : 1.5 + Math.random() * 3.5;
    const heightAt = (x: number) => (high ? lift : groundHeight(x, z) + lift);
    const x0 = near ? -26 + Math.random() * 10 : -50 + Math.random() * 14;
    const step = (near ? 30 + Math.random() * 12 : 40 + Math.random() * 15) / 8;
    const phase = Math.random() * 6;
    const loopAt = Math.random() < 0.3 ? 3 + Math.floor(Math.random() * 3) : -1;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const x = x0 + step * i;
      const y = heightAt(x) + Math.sin(i * 0.9 + phase) * 0.35;
      pts.push(new THREE.Vector3(x, y, z + Math.sin(x * 0.15 + phase) * 0.8));
      if (i !== loopAt) continue;
      const s = 0.9 + 0.5 * Math.random();
      for (const [dx, dy] of LOOP) pts.push(new THREE.Vector3(x + dx * s, y + dy * s, pts[pts.length - 1].z));
    }
    const { curve } = curveThrough(pts, []);
    const clear = curve.getSpacedPoints(48).every((p) => lobes.every((l) => p.distanceTo(l.centre) > l.radius + BREEZE.clearance));
    if (clear) return curve;
  }
  return null;
};

/* ─── Streaks ──────────────────────────────────────────────────── */

const STREAK_POINTS = 180;

class Streak {
  readonly material = makeStreakMaterial();
  readonly mesh: THREE.Mesh;
  active = false;
  private geometry = new THREE.BufferGeometry();
  private t = 0;
  private length = 1;
  private opacity = 0.82;

  constructor() {
    const n = STREAK_POINTS + 1;
    const side = new Float32Array(n * 2);
    const u = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      side[i * 2] = -1;
      side[i * 2 + 1] = 1;
      u[i * 2] = u[i * 2 + 1] = i / STREAK_POINTS;
    }
    const index: number[] = [];
    for (let i = 0; i < STREAK_POINTS; i++) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3));
    this.geometry.setAttribute('aNext', new THREE.BufferAttribute(new Float32Array(n * 6), 3));
    this.geometry.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
    this.geometry.setAttribute('aU', new THREE.BufferAttribute(u, 1));
    this.geometry.setIndex(index);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    this.mesh.renderOrder = 2;
  }

  launch(curve: THREE.Curve<THREE.Vector3>, delay: number, width: number, opacity = 0.82) {
    const pts = curve.getSpacedPoints(STREAK_POINTS);
    const pos = this.geometry.attributes.position.array as Float32Array;
    const next = this.geometry.attributes.aNext.array as Float32Array;
    pts.forEach((p, i) => {
      const q = pts[i + 1] ?? p.clone().multiplyScalar(2).sub(pts[i - 1]);
      for (let s = 0; s < 2; s++) {
        const k = (i * 2 + s) * 3;
        pos[k] = p.x;
        pos[k + 1] = p.y;
        pos[k + 2] = p.z;
        next[k] = q.x;
        next[k + 1] = q.y;
        next[k + 2] = q.z;
      }
    });
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.aNext.needsUpdate = true;
    this.length = curve.getLength();
    this.opacity = opacity;
    this.t = -delay;
    this.material.uniforms.uWidth.value = width;
    this.active = true;
  }

  /** The line is a fixed length running along the path at the gust's speed: it draws itself in, and lifts off at the end. */
  update(dt: number) {
    if (!this.active) return;
    this.t += dt;
    const run = this.t * FLIGHT.streakSpeed;
    const head = Math.min(this.length, Math.max(0, run));
    const tail = Math.min(this.length, Math.max(0, run - FLIGHT.streakLength));
    const u = this.material.uniforms;
    u.uHead.value = head / this.length;
    u.uTail.value = tail / this.length;
    u.uOpacity.value = this.opacity;
    this.mesh.visible = head - tail > 0.01;
    if (tail >= this.length) {
      this.active = false;
      this.mesh.visible = false;
    }
  }
}

/* ─── Loose leaves ─────────────────────────────────────────────── */

type Phase = 'idle' | 'waiting' | 'tug' | 'ride' | 'fall' | 'rest' | 'fade';

const TUG = 0.55;
const FADE = 1.6;
const tmpV = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const tmpN = new THREE.Vector3();
const settle = new THREE.Quaternion();

/** The JS twin of the shaders' `lobeShadow`, for a leaf that's left the crown. */
const lobeShadow = (p: THREE.Vector3, lobes: THREE.Vector4[], sun: THREE.Vector3) => {
  let cover = 0;
  for (const b of lobes) {
    const ox = b.x - p.x;
    const oy = b.y - p.y;
    const oz = b.z - p.z;
    const t = ox * sun.x + oy * sun.y + oz * sun.z;
    if (t <= 0) continue;
    const miss = Math.hypot(ox - sun.x * t, oy - sun.y * t, oz - sun.z * t) / b.w;
    cover = Math.max(cover, 1 - THREE.MathUtils.smoothstep(miss, 0.62, 0.96));
  }
  return 1 - 0.78 * cover;
};

/** A leaf lying flat with its face toward `normal`, turned `yaw` about it. */
const lyingFlat = (normal: THREE.Vector3, yaw: number, out: THREE.Quaternion) =>
  out.setFromUnitVectors(Z, normal).premultiply(tmpQ.setFromAxisAngle(normal, yaw));

class LooseLeaf {
  readonly material: THREE.ShaderMaterial;
  readonly mesh: THREE.Mesh;
  phase: Phase = 'idle';
  /** When it came to rest, so the oldest fallen leaf is the first to go. */
  landedAt = 0;

  private clock = 0;
  private hang = new THREE.Vector3();
  private curve: THREE.Curve<THREE.Vector3> | null = null;
  private length = 1;
  private release = 1;
  private s = 0;
  private speed = 0;
  private offset = new THREE.Vector3();
  private pos = new THREE.Vector3();
  private base = new THREE.Vector3();
  private vel = new THREE.Vector3();
  private quat = new THREE.Quaternion();
  private hold = new THREE.Quaternion();
  private spinAxis = new THREE.Vector3(1, 0, 0);
  private swing = 0;
  private swingAmp = 0;
  private swingDir = new THREE.Vector3(1, 0, 0);
  private yaw = 0;
  /** Its own size, as a fraction of the usual. */
  private size = 1;

  constructor(geometry: THREE.BufferGeometry, uniforms: SceneUniforms, atlas: THREE.Texture) {
    this.material = makeLooseLeafMaterial(uniforms, atlas);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.visible = false;
    this.mesh.frustumCulled = false;
  }

  launch(hang: THREE.Vector3, curve: THREE.Curve<THREE.Vector3>, start: number, release: number, delay: number) {
    this.phase = 'waiting';
    this.clock = -delay;
    this.hang.copy(hang);
    this.curve = curve;
    this.length = curve.getLength();
    this.release = release;
    this.s = start;
    this.speed = 0;
    this.size = 0.88 + 0.24 * Math.random();
    this.spinAxis.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    this.material.uniforms.uTint.value = Math.random();
    this.material.uniforms.uSeed.value = Math.random();
  }

  fadeOut() {
    if (this.phase === 'rest') {
      this.phase = 'fade';
      this.clock = 0;
    }
  }

  update(dt: number, wind: Gusts, camera: THREE.Camera, u: SceneUniforms) {
    if (this.phase === 'idle') return;
    this.clock += dt;
    let scale = 1;
    let flutter = 0;
    let grow = 1;

    switch (this.phase) {
      case 'waiting':
        if (this.clock < 0) break;
        // It starts out as it hung on the tree: face to the eye, like the leaves around it.
        this.hold.copy(camera.quaternion).multiply(tmpQ.setFromAxisAngle(Z, (Math.random() - 0.5) * 1.6));
        this.phase = 'tug';
        this.clock = 0;
      // falls through
      case 'tug': {
        grow = 0;
        sway(this.hang, wind.time, wind.level, this.pos).add(this.hang);
        const shake = Math.sin(this.clock * 26) * 0.32 * Math.min(1, this.clock * 4);
        this.quat.copy(this.hold).multiply(tmpQ.setFromAxisAngle(Z, shake));
        flutter = 0.6;
        if (this.clock >= TUG) {
          this.phase = 'ride';
          this.clock = 0;
          this.offset.copy(this.pos).sub(this.curve!.getPointAt(Math.min(1, this.s / this.length), tmpV));
        }
        break;
      }
      case 'ride': {
        // Carried along the gust's path, faster as it blows harder, tumbling as it goes.
        const want = FLIGHT.rideSpeed * (0.35 + 0.65 * clamp01(wind.level / 0.6));
        this.speed += (want - this.speed) * (1 - Math.exp(-dt * 2.5));
        this.s += this.speed * dt;
        const t = Math.min(1, this.s / this.length);
        this.curve!.getPointAt(t, this.pos).addScaledVector(this.offset, 1 - smooth(clamp01(this.clock / 0.6)));
        grow = smooth(clamp01(this.clock / 1.4));
        this.spinAxis.applyAxisAngle(UP, dt * 0.7).normalize();
        this.quat.multiply(tmpQ.setFromAxisAngle(this.spinAxis, dt * (2.4 + 3 * wind.level))).normalize();
        flutter = 1;
        if (this.s >= this.release || (wind.level < 0.18 && this.clock > 2)) {
          this.phase = 'fall';
          this.clock = 0;
          this.curve!.getTangentAt(t, this.vel).multiplyScalar(this.speed);
          this.base.copy(this.pos);
          this.swing = 0;
          this.swingAmp = 0;
          this.swingDir.set(1, 0, (Math.random() - 0.5) * 1.2).normalize();
          this.yaw = Math.random() * TAU;
        }
        break;
      }
      case 'fall': {
        // The gust has let go. The leaf drifts on what breeze is left and sinks,
        // swinging side to side, tipped up at the end of each swing. Seen from
        // level it would mostly be edge-on, so it's always tipped a little
        // toward the eye, as you'd draw it.
        tmpV.set(FLIGHT.drift * (0.5 + wind.level), -FLIGHT.sink, 0);
        this.vel.lerp(tmpV, 1 - Math.exp(-dt * 1.4));
        this.base.addScaledVector(this.vel, dt);
        this.swingAmp = Math.min(1, this.swingAmp + dt / 1.8);
        this.swing += (dt * TAU) / FLIGHT.swingPeriod;
        const side = Math.sin(this.swing) * this.swingAmp;
        this.pos.copy(this.base).addScaledVector(this.swingDir, FLIGHT.swingWidth * side);
        this.pos.y += FLIGHT.swingLift * side * side;
        this.yaw += dt * 0.45;
        tmpN.subVectors(camera.position, this.pos).normalize().multiplyScalar(0.7).add(UP).addScaledVector(this.swingDir, -0.85 * side).normalize();
        this.quat.slerp(lyingFlat(tmpN, this.yaw, settle), 1 - Math.exp(-dt * (0.8 + 3 * this.swingAmp)));
        flutter = 0.35;

        const ground = groundHeight(this.pos.x, this.pos.z);
        if (this.pos.y < ground + 0.12) {
          this.pos.y = ground + 0.12;
          // It settles on the grass tops, tipped toward the eye as a drawing would show it, not edge-on.
          groundNormal(this.pos.x, this.pos.z, tmpN).lerp(tmpV.subVectors(camera.position, this.pos).normalize(), 0.45).normalize();
          lyingFlat(tmpN, this.yaw, this.hold);
          this.phase = 'rest';
          this.clock = 0;
          this.landedAt = wind.time;
        }
        break;
      }
      case 'rest':
        this.quat.slerp(this.hold, 1 - Math.exp(-dt * 6));
        if (this.clock > FLIGHT.restFor) this.fadeOut();
        break;
      case 'fade':
        // It settles down into the grass and is gone.
        scale = 1 - smooth(clamp01(this.clock / FADE));
        this.pos.y -= dt * 0.03;
        if (this.clock >= FADE) {
          this.phase = 'idle';
          this.mesh.visible = false;
          return;
        }
        break;
    }

    this.mesh.visible = this.phase !== 'waiting';
    this.mesh.position.copy(this.pos);
    this.mesh.quaternion.copy(this.quat);
    this.mesh.scale.setScalar(THREE.MathUtils.lerp(FLIGHT.size, FLIGHT.flyingSize, grow) * this.size * scale);
    const m = this.material.uniforms;
    m.uFlutter.value += (flutter - m.uFlutter.value) * (1 - Math.exp(-dt * 4));
    m.uShadow.value = lobeShadow(this.pos, u.uLobes.value, u.uSun.value);
  }
}

/* ─── The flights ──────────────────────────────────────────────── */

const Flights: React.FC<{
  model: MapleModel;
  wind: Gusts;
  uniforms: SceneUniforms;
  atlas: THREE.Texture;
}> = ({ model, wind, uniforms, atlas }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 6, 6), []);
  const streaks = useMemo(() => Array.from({ length: 8 }, () => new Streak()), []);
  const breeze = useMemo(() => ({ next: 6 + Math.random() * 4 }), []);
  const leaves = useMemo(
    () => Array.from({ length: 10 }, () => new LooseLeaf(geometry, uniforms, atlas)),
    [geometry, uniforms, atlas],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      streaks.forEach((s) => {
        s.mesh.geometry.dispose();
        s.material.dispose();
      });
      leaves.forEach((l) => l.material.dispose());
    },
    [geometry, streaks, leaves],
  );

  useEffect(() => {
    streaks.forEach((s) => s.material.uniforms.uRes.value.set(width / 2, height / 2));
  }, [streaks, width, height]);

  // Drawn once now, as the scene loads, where no one sees it — so their
  // shaders are built, and readied for the GPU, before the first gust shows
  // them, which would otherwise catch the animation on it. Into a target
  // made like the ink pass's, so what's readied is just what it will use.
  useEffect(() => {
    const hidden = [streaks[0].mesh, leaves[0].mesh];
    const target = new THREE.WebGLRenderTarget(1, 1, { depthTexture: new THREE.DepthTexture(1, 1) });
    const was = gl.getRenderTarget();
    hidden.forEach((m) => (m.visible = true));
    gl.setRenderTarget(target);
    gl.render(scene, camera);
    gl.setRenderTarget(was);
    hidden.forEach((m) => (m.visible = false));
    target.depthTexture?.dispose();
    target.dispose();
  }, [gl, scene, camera, streaks, leaves]);

  useEffect(() => {
    wind.onGust = () => {
      const count = Math.random() < FLIGHT.twoLeafChance ? 2 : 1;
      let first: THREE.Vector3 | null = null;
      for (let k = 0; k < count; k++) {
        const leaf = leaves.find((l) => l.phase === 'idle');
        if (!leaf || model.loose.length === 0) break;
        const hang = model.loose[Math.floor(Math.random() * model.loose.length)];
        const at = sway(hang, wind.time, wind.level).add(hang);
        const { curve, start, release } = windPath(at, Math.random() < FLIGHT.loopChance);
        const delay = k * 0.9;
        streaks.find((s) => !s.active)?.launch(curve, delay, k ? 1.8 : 2.5);
        leaf.launch(hang, curve, start, release, delay + start / FLIGHT.streakSpeed);
        first ??= at;
      }
      if (first) streaks.find((s) => !s.active)?.launch(curlPath(first), 0.25, 1.9);
    };
    return () => {
      wind.onGust = null;
    };
  }, [wind, model, leaves, streaks]);

  useFrame((_, dt) => {
    const step = Math.min(dt, 1 / 20);

    // Now and then, a breath of wind through the rest of the scene. Farther lines are drawn finer.
    if (wind.held) breeze.next = Math.max(breeze.next, wind.time + WIND.afterHold);
    if (wind.time >= breeze.next) {
      const [soonest, latest] = BREEZE.every;
      breeze.next = wind.time + soonest + Math.random() * (latest - soonest);
      const count = Math.random() < BREEZE.pairChance ? 2 : 1;
      for (let k = 0; k < count; k++) {
        const curve = breezePath(model.lobes);
        const free = streaks.find((s) => !s.active);
        if (!curve || !free) break;
        const away = curve.getPointAt(0.6).distanceTo(EYE);
        free.launch(curve, k * 0.7, 2.4 * THREE.MathUtils.clamp(34 / away, 0.85, 1.15), BREEZE.opacity);
      }
    }

    for (const s of streaks) s.update(step);
    // Only so many leaves lie in the grass at once; the longest fallen goes first.
    let resting = 0;
    let oldest: LooseLeaf | null = null;
    let carrying = false;
    for (const l of leaves) {
      l.update(step, wind, camera, uniforms);
      if (l.phase === 'tug' || l.phase === 'ride') carrying = true;
      if (l.phase !== 'rest') continue;
      resting++;
      if (!oldest || l.landedAt < oldest.landedAt) oldest = l;
    }
    if (resting > FLIGHT.maxResting) oldest?.fadeOut();
    wind.carrying = carrying;
  });

  return (
    <>
      {streaks.map((s, i) => (
        <primitive key={`streak${i}`} object={s.mesh} />
      ))}
      {leaves.map((l, i) => (
        <primitive key={`leaf${i}`} object={l.mesh} />
      ))}
    </>
  );
};

export default Flights;
