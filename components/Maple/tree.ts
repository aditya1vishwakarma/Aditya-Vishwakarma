import * as THREE from 'three';
import { MAX_LOBES, TREE } from './mapleConfig';

/**
 * The maple, grown from a seed.
 *
 * It's built crown first, the way you'd draw one: the leaf masses are laid
 * out as a full, rounded cloud that sits low on a short trunk, and then the
 * wood grows up into them. The trunk divides at the fork into stems, each
 * stem into limbs, each limb into a bough per leaf mass, and each bough into
 * twigs that end among the leaves.
 *
 * The leaves are cards, each carrying a few leaves, scattered through every
 * mass and thickest at its surface. Each mass is itself made of smaller
 * clumps over its outside, and a card is shaded by the clump and the mass it
 * belongs to rather than by its own flat face — so the crown reads as many
 * rounded forms, each light on top and in shade beneath, the way a painter
 * blocks in foliage.
 */

export const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export interface Lobe {
  centre: THREE.Vector3;
  radius: number;
}

/** At most this many clumps: each card writes its clump into 8 bits for the ink pass to read. */
export const MAX_CLUMPS = 126;

export interface MapleModel {
  wood: THREE.BufferGeometry;
  leaves: THREE.InstancedBufferGeometry;
  lobes: Lobe[];
  /** Rest positions of leaves out on the downwind face, where a gust can pull one loose. */
  loose: THREE.Vector3[];
}

const UP = new THREE.Vector3(0, 1, 0);
const TAU = Math.PI * 2;

/* ─── Wood ─────────────────────────────────────────────────────── */

/** One length of wood: a quadratic curve from `a` through the pull of `c` to `b`. */
interface Bough {
  a: THREE.Vector3;
  c: THREE.Vector3;
  b: THREE.Vector3;
  r0: number;
  r1: number;
  rings: number;
  sides: number;
  /** The trunk's foot, which spreads into roots. */
  flare?: boolean;
}

const tmp = new THREE.Vector3();

const pointAt = (s: Bough, t: number, out: THREE.Vector3) => {
  const u = 1 - t;
  return out.set(0, 0, 0).addScaledVector(s.a, u * u).addScaledVector(s.c, 2 * u * t).addScaledVector(s.b, t * t);
};

const tangentAt = (s: Bough, t: number, out: THREE.Vector3) =>
  out
    .subVectors(s.c, s.a)
    .multiplyScalar(2 * (1 - t))
    .addScaledVector(tmp.subVectors(s.b, s.c), 2 * t)
    .normalize();

/** A bough that bows upward as it goes, as limbs reaching for light do. */
const bowed = (a: THREE.Vector3, b: THREE.Vector3, bow: number) =>
  a.clone().lerp(b, 0.5).addScaledVector(UP, a.distanceTo(b) * bow);

/** Buttress roots: five ridges that swell out of the trunk near the ground. */
const flare = (angle: number, y: number) => {
  const k = 1 - THREE.MathUtils.smoothstep(y, -0.3, 0.95);
  const roots = Math.pow(0.5 + 0.5 * Math.cos(5 * angle + 0.7), 3);
  return 1 + k * k * (0.35 + 0.8 * roots);
};

class WoodBuilder {
  positions: number[] = [];
  normals: number[] = [];
  /** Distance along the bough and the way round it, for the bark's grain. */
  bark: number[] = [];
  index: number[] = [];

  add(s: Bough) {
    const start = this.positions.length / 3;
    const p = new THREE.Vector3();
    const last = new THREE.Vector3();
    const T = new THREE.Vector3();
    const N = new THREE.Vector3();
    const B = new THREE.Vector3();
    const dir = new THREE.Vector3();

    tangentAt(s, 0, T);
    N.set(0, 1, 0);
    if (Math.abs(T.y) > 0.9) N.set(1, 0, 0);
    pointAt(s, 0, last);
    let along = 0;

    for (let i = 0; i <= s.rings; i++) {
      // The trunk's rings crowd toward the foot, where the roots need them.
      const t = s.flare ? Math.pow(i / s.rings, 1.35) : i / s.rings;
      pointAt(s, t, p);
      tangentAt(s, t, T);
      along += p.distanceTo(last);
      last.copy(p);
      // Carry the frame along the curve so the rings never twist.
      N.addScaledVector(T, -N.dot(T)).normalize();
      B.crossVectors(T, N);
      const radius = THREE.MathUtils.lerp(s.r0, s.r1, Math.pow(t, 0.85));
      for (let j = 0; j <= s.sides; j++) {
        const a = (j / s.sides) * TAU;
        dir.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(B, Math.sin(a));
        const r = radius * (s.flare ? flare(a, p.y) : 1);
        this.positions.push(p.x + dir.x * r, p.y + dir.y * r, p.z + dir.z * r);
        this.normals.push(dir.x, dir.y, dir.z);
        this.bark.push(along, j / s.sides);
      }
    }

    const row = s.sides + 1;
    for (let i = 0; i < s.rings; i++) {
      for (let j = 0; j < s.sides; j++) {
        const a = start + i * row + j;
        const b = a + row;
        this.index.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }

  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
    g.setAttribute('aBark', new THREE.Float32BufferAttribute(this.bark, 2));
    g.setIndex(this.index);
    g.computeBoundingSphere();
    return g;
  }
}

/* ─── The tree ─────────────────────────────────────────────────── */

export function buildMaple(seed = TREE.seed): MapleModel {
  const rand = mulberry32(seed);
  const between = (a: number, b: number) => a + (b - a) * rand();
  const crownC = new THREE.Vector3(...TREE.crownCentre);
  const crownR = new THREE.Vector3(...TREE.crownRadii);

  /* The leaf masses: a dome on top, a ring of five round the upper crown,
     six round its broad waist and four beneath, hanging low and full. */
  const lobes: Lobe[] = [];
  const place = (y: number, az: number, inset: number, size: number) => {
    const s = Math.sqrt(1 - y * y);
    const c = new THREE.Vector3(Math.cos(az) * s * crownR.x, y * crownR.y, Math.sin(az) * s * crownR.z)
      .multiplyScalar(inset)
      .add(crownC);
    c.x += between(-0.3, 0.3);
    c.y += between(-0.25, 0.25);
    c.z += between(-0.3, 0.3);
    lobes.push({ centre: c, radius: between(...TREE.lobeRadius) * size });
  };
  // Widest through the waist and drawn in above and below, so the crown is an oval, not a barrel.
  place(1, 0, 0.66, 0.98);
  for (let i = 0; i < 5; i++) place(0.55, (i / 5) * TAU + between(-0.25, 0.25), 0.75, 0.97);
  for (let i = 0; i < 6; i++) place(-0.02, ((i + 0.5) / 6) * TAU + between(-0.2, 0.2), 0.88, 1.04);
  for (let i = 0; i < 4; i++) place(-0.58, ((i + 0.25) / 4) * TAU + between(-0.25, 0.25), 0.74, 0.94);
  if (lobes.length > MAX_LOBES) throw new Error(`maple: ${lobes.length} lobes, shaders hold ${MAX_LOBES}`);

  /* The clumps: spread evenly over the outside of each mass — none on the
     side turned into the crown, nor buried in a neighbouring mass, where
     nobody would see them. */
  const clumps: Lobe[] = [];
  lobes.forEach((lobe, li) => {
    const out = new THREE.Vector3().subVectors(lobe.centre, crownC).normalize();
    const count = Math.max(3, Math.round(TREE.clumpsPerLobe * (lobe.radius / 1.9) ** 2));
    for (let k = 0; k < count; k++) {
      const y = 1 - (2 * (k + 0.5)) / count;
      const ring = Math.sqrt(1 - y * y);
      const phi = k * 2.39996 + li * 1.3 + between(-0.3, 0.3);
      const dir = new THREE.Vector3(Math.cos(phi) * ring, y, Math.sin(phi) * ring);
      if (dir.dot(out) < -0.35) continue;
      const centre = lobe.centre.clone().addScaledVector(dir.multiply(tmp.set(1, 0.82, 1)), lobe.radius * between(0.55, 0.7));
      if (lobes.some((o, oi) => oi !== li && centre.distanceTo(o.centre) < o.radius * 0.7)) continue;
      if (clumps.length < MAX_CLUMPS) clumps.push({ centre, radius: lobe.radius * TREE.clumpRadius * between(0.85, 1.15) });
    }
  });

  /* The wood. The trunk runs on a little past the fork and every limb sets
     out from inside it, so the limbs grow out of the trunk instead of
     standing on top of it. */
  const wood = new WoodBuilder();
  const fork = new THREE.Vector3(-0.1, TREE.forkY, 0.05);
  const trunkTop = TREE.trunkRadius * 0.72;
  wood.add({
    a: new THREE.Vector3(0, -0.6, 0),
    c: new THREE.Vector3(0.14, 1.2, -0.04),
    b: fork.clone().add(new THREE.Vector3(-0.03, 0.35, 0)),
    r0: TREE.trunkRadius,
    r1: trunkTop * 0.82,
    rings: 24,
    sides: 14,
    flare: true,
  });
  const limbFoot = fork.clone().add(new THREE.Vector3(0, -0.3, 0));

  const twigs = (from: THREE.Vector3, lobe: Lobe, count: number) => {
    for (let i = 0; i < count; i++) {
      const out = new THREE.Vector3(between(-1, 1), between(-0.4, 1), between(-1, 1))
        .normalize()
        .add(tmp.subVectors(lobe.centre, fork).setY(0).normalize().multiplyScalar(0.6))
        .normalize();
      const end = lobe.centre.clone().addScaledVector(out, lobe.radius * between(0.6, 0.85));
      wood.add({ a: from, c: bowed(from, end, 0.08), b: end, r0: 0.028, r1: 0.009, rings: 5, sides: 5 });
    }
  };

  const bough = (from: THREE.Vector3, fromRadius: number, lobe: Lobe) => {
    const end = lobe.centre.clone().addScaledVector(tmp.subVectors(lobe.centre, from).normalize(), lobe.radius * 0.1);
    wood.add({ a: from, c: bowed(from, end, 0.12), b: end, r0: fromRadius, r1: 0.03, rings: 8, sides: 7 });
    twigs(end, lobe, 4);
  };

  // The rest of the crown, taken in order round the fork, is shared among
  // three stems — the trunk divides at the fork, as a maple's usually does —
  // and each stem divides again higher up into limbs that splay out like the
  // ribs of a vase. The last stem also carries the leader up to the top mass.
  const top = lobes[0];
  const around = lobes
    .slice(1)
    .sort((p, q) => Math.atan2(p.centre.z - fork.z, p.centre.x - fork.x) - Math.atan2(q.centre.z - fork.z, q.centre.x - fork.x));
  const groups: Lobe[][] = [];
  let taken = 0;
  for (const size of [3, 3, 3, 3, 3]) {
    groups.push(around.slice(taken, taken + size));
    taken += size;
  }
  const mids = groups.map((g) => g.reduce((acc, l) => acc.add(l.centre), new THREE.Vector3()).divideScalar(g.length));
  const stems = [[0, 1], [2, 3], [4]];

  stems.forEach((members, si) => {
    const leader = si === stems.length - 1;
    const carried = members.reduce((n, gi) => n + groups[gi].length, 0) + (leader ? 1 : 0);
    const aim = members.reduce((acc, gi) => acc.add(mids[gi]), new THREE.Vector3()).divideScalar(members.length);
    const stemEnd = fork.clone().lerp(aim, 0.22).addScaledVector(UP, 0.75 + 0.25 * si);
    const sr0 = trunkTop * Math.pow(carried / (lobes.length - 1), 0.4) * 1.05;
    const sr1 = sr0 * 0.8;
    wood.add({ a: limbFoot, c: bowed(limbFoot, stemEnd, 0.05), b: stemEnd, r0: sr0, r1: sr1, rings: 9, sides: 11 });
    // The limbs set out from a little inside the stem's end.
    const from = stemEnd.clone().addScaledVector(tmp.subVectors(stemEnd, limbFoot).normalize(), -0.18);

    members.forEach((gi) => {
      const group = groups[gi];
      const end = fork.clone().lerp(mids[gi], 0.6).addScaledVector(UP, 0.15);
      const r0 = sr1 * Math.pow(group.length / carried, 0.4);
      const r1 = r0 * 0.62;
      wood.add({ a: from, c: bowed(from, end, 0.06), b: end, r0, r1, rings: 10, sides: 9 });
      const share = r1 * 0.85 * Math.pow(1 / group.length, 0.3);
      group.forEach((lobe) => bough(end, share, lobe));
    });

    if (leader) {
      wood.add({ a: from, c: bowed(from, top.centre, 0.04), b: top.centre.clone(), r0: sr1 * 0.75, r1: 0.05, rings: 12, sides: 9 });
      twigs(top.centre, top, 4);
    }
  });

  /* The leaves. */
  const centres: number[] = [];
  const normals: number[] = [];
  const leaf: number[] = [];
  const shade: number[] = [];
  const loose: THREE.Vector3[] = [];
  const p = new THREE.Vector3();
  const lobeN = new THREE.Vector3();
  const crownN = new THREE.Vector3();
  const clumpN = new THREE.Vector3();
  const crownBottom = crownC.y - crownR.y;
  const crownTop = crownC.y + crownR.y + 0.8;

  lobes.forEach((lobe, li) => {
    const count = Math.round(TREE.cardsPerLobe * (lobe.radius / 1.65) ** 2);
    for (let k = 0; k < count; k++) {
      // Most leaves sit out at the surface of their mass, where they'd be seen.
      const dir = new THREE.Vector3(between(-1, 1), between(-1, 1), between(-1, 1));
      if (dir.lengthSq() > 1 || dir.lengthSq() < 1e-4) {
        k--;
        continue;
      }
      dir.normalize();
      const depth = lobe.radius * (0.55 + 0.49 * Math.pow(rand(), 0.25));
      p.copy(dir).multiplyScalar(depth).multiply(tmp.set(1, 0.82, 1)).add(lobe.centre);

      // Skip leaves buried in a neighbouring mass; nobody would ever see them.
      let buried = false;
      let open = Infinity;
      lobes.forEach((other, oi) => {
        const d = p.distanceTo(other.centre);
        if (oi !== li && d < other.radius * 0.62) buried = true;
        open = Math.min(open, d - other.radius);
      });
      if (buried) continue;

      // Which clump the leaf belongs to: the one it lies deepest within.
      let clump = 0;
      let within = Infinity;
      for (let c = 0; c < clumps.length; c++) {
        const d = p.distanceTo(clumps[c].centre) / clumps[c].radius;
        if (d < within) {
          within = d;
          clump = c;
        }
      }

      lobeN.subVectors(p, lobe.centre).normalize();
      crownN.subVectors(p, crownC).divide(tmp.copy(crownR).multiply(crownR)).normalize();
      clumpN.subVectors(p, clumps[clump].centre).normalize();
      const n = clumpN.multiplyScalar(0.5).addScaledVector(lobeN, 0.3).addScaledVector(crownN, 0.2).normalize();

      const openness = THREE.MathUtils.smoothstep(open, -0.9, 0.05);
      const height = THREE.MathUtils.smoothstep(p.y, crownBottom, crownTop);
      // Deep in its clump, a leaf is in the clump's own shade.
      const ao = openness * (0.62 + 0.38 * height) * (0.78 + 0.22 * THREE.MathUtils.smoothstep(within, 0.35, 1));

      centres.push(p.x, p.y, p.z);
      normals.push(n.x, n.y, n.z);
      const tile = rand() < 0.45 ? (rand() < 0.5 ? 0 : 3) : rand() < 0.5 ? 1 : 2;
      const [small, large] = tile === 0 || tile === 3 ? TREE.cardSize.lone : TREE.cardSize.spray;
      leaf.push(between(small, large), rand() * TAU, rand(), tile);
      shade.push(ao, li, clump);

      if (lobeN.x > 0.45 && p.z > -0.3 && openness > 0.8 && p.y > 3.4 && p.y < 7.2) loose.push(p.clone());
    }
  });
  // Only the ones out at the crown's right edge, so their gust breaks into open sky.
  loose.sort((p, q) => q.x - p.x);
  loose.length = Math.max(1, Math.ceil(loose.length * 0.3));

  const leaves = new THREE.InstancedBufferGeometry();
  leaves.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3));
  leaves.setIndex([0, 1, 2, 0, 2, 3]);
  leaves.setAttribute('aCenter', new THREE.InstancedBufferAttribute(new Float32Array(centres), 3));
  leaves.setAttribute('aNormal', new THREE.InstancedBufferAttribute(new Float32Array(normals), 3));
  leaves.setAttribute('aLeaf', new THREE.InstancedBufferAttribute(new Float32Array(leaf), 4));
  leaves.setAttribute('aShade', new THREE.InstancedBufferAttribute(new Float32Array(shade), 3));
  leaves.instanceCount = centres.length / 3;
  // The quad alone would put the bounds at the origin; the whole crown is what moves on screen.
  leaves.boundingSphere = new THREE.Sphere(crownC.clone(), 8);

  return { wood: wood.build(), leaves, lobes, loose };
}
