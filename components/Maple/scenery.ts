import * as THREE from 'three';
import { EYE, inView, LOOK } from './shot';
import { groundHeight, groundNormal } from './terrain';
import { mulberry32 } from './tree';

/**
 * The rest of the landscape: daisies drifting over the far hill, a line of
 * trees across the plain beyond, and a river winding through it. All drawn
 * once onto small canvases and set out as cards, like the leaves and the
 * grass; the river is painted by the ground itself.
 *
 * The atlases are data, not colour — the shaders paint them:
 *
 *   r  tone, lighter where the sun strikes
 *   g  which part: stem, petal or eye for a daisy; which tree for a tree
 *   a  coverage
 */

/** Across the shot and out from the eye, in degrees and metres, to a point on the ground. */
const fromEye = (degrees: number, distance: number) => {
  const a = THREE.MathUtils.degToRad(degrees);
  const right = new THREE.Vector3(-LOOK.z, 0, LOOK.x);
  return new THREE.Vector2(
    EYE.x + (LOOK.x * Math.cos(a) + right.x * Math.sin(a)) * distance,
    EYE.z + (LOOK.z * Math.cos(a) + right.z * Math.sin(a)) * distance,
  );
};

const atlasTexture = (canvas: HTMLCanvasElement) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
};

/* ─── Daisies ──────────────────────────────────────────────────── */

export const DAISY_ATLAS = { width: 256, height: 64, tiles: 4 };

/** The parts of a daisy, as the shader tells them apart by g. */
const STEM = 40;
const PETAL = 140;
const EYE_PART = 240;

function drawDaisy(g: CanvasRenderingContext2D, x: number, y: number, r: number, squash: number, rand: () => number) {
  // Petals round a yellow eye, a little uneven as real ones are.
  const petals = 11 + Math.floor(rand() * 4);
  const turn = rand() * Math.PI;
  for (let i = 0; i < petals; i++) {
    const a = turn + (i / petals) * Math.PI * 2;
    const len = r * (0.88 + 0.24 * rand());
    g.save();
    g.translate(x, y);
    g.scale(1, squash);
    g.rotate(a);
    const fill = g.createLinearGradient(0, 0, len, 0);
    fill.addColorStop(0, `rgb(190, ${PETAL}, 0)`);
    fill.addColorStop(1, `rgb(255, ${PETAL}, 0)`);
    g.fillStyle = fill;
    g.beginPath();
    g.ellipse(len * 0.55, 0, len * 0.5, r * 0.17, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  g.fillStyle = `rgb(230, ${EYE_PART}, 0)`;
  g.beginPath();
  g.ellipse(x, y, r * 0.32, r * 0.32 * squash, 0, 0, Math.PI * 2);
  g.fill();
}

/** Four tiles: a daisy face-on, one turned away a little, a pair, and three small ones together. */
export function makeDaisyAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = DAISY_ATLAS.width;
  canvas.height = DAISY_ATLAS.height;
  const g = canvas.getContext('2d')!;
  const rand = mulberry32(31);
  const cell = DAISY_ATLAS.width / DAISY_ATLAS.tiles;
  const H = DAISY_ATLAS.height;
  const stem = (x: number, top: number, lean: number) => {
    g.strokeStyle = `rgb(150, ${STEM}, 0)`;
    g.lineWidth = 2.2;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x, H);
    g.quadraticCurveTo(x + lean * 0.4, (H + top) / 2, x + lean, top);
    g.stroke();
  };
  const flower = (tile: number, fx: number, top: number, r: number, squash: number, lean: number) => {
    const x = tile * cell + fx * cell;
    stem(x, top, lean);
    drawDaisy(g, x + lean, top, r, squash, rand);
  };
  flower(0, 0.5, H * 0.36, cell * 0.3, 1, 0);
  flower(1, 0.5, H * 0.4, cell * 0.28, 0.55, 2);
  flower(2, 0.32, H * 0.5, cell * 0.2, 0.8, -3);
  flower(2, 0.66, H * 0.32, cell * 0.25, 0.9, 2);
  flower(3, 0.25, H * 0.56, cell * 0.16, 0.85, -2);
  flower(3, 0.52, H * 0.42, cell * 0.18, 0.7, 1);
  flower(3, 0.78, H * 0.6, cell * 0.15, 0.9, 2);
  return atlasTexture(canvas);
}

/** Of the far hill's daisies, the share that sway; the rest stand still. */
const FAR_HILL_SWAYING = 0.1;
/** Of the far hill's daisies, the shares in white, pink and yellow. */
const FAR_HILL_PETALS = [0.4, 0.3, 0.3];

/**
 * Drifts of daisies over the far hill's near side — the side the shot looks
 * at — up to its top, and a lighter sprinkling on the knoll's near slope. Each drift a few metres
 * across; flowers drawn a little larger than life so they read from afar.
 *
 * Those on the knoll, near the eye, are white and all sway. On the far hill
 * they come in white, pink and yellow, mixed flower by flower through every
 * drift; and only a tenth sway, one or two in every drift, so the movement is
 * spread over the whole hill and it still reads as alive.
 */
export function buildDaisies(): THREE.InstancedBufferGeometry {
  const rand = mulberry32(37);
  // Colours drawn from their own stream, so choosing them moves no flower.
  const tint = mulberry32(41);
  const base: number[] = [];
  const normals: number[] = [];
  const flower: number[] = [];
  const swaying: number[] = [];
  const petal: number[] = [];
  const n = new THREE.Vector3();
  const toEye = new THREE.Vector3();

  const drift = (cx: number, cz: number, count: number, spread: number, size: number, far = false) => {
    const moving = Math.max(1, Math.round(count * (far ? FAR_HILL_SWAYING : 1)));
    let kept = 0;
    for (let k = 0; k < count; k++) {
      const a = rand() * Math.PI * 2;
      const r = spread * Math.sqrt(rand());
      const x = cx + Math.cos(a) * r;
      const z = cz + Math.sin(a) * r;
      if (!inView(x, z) || x * x + z * z < 4) continue;
      groundNormal(x, z, n);
      base.push(x, groundHeight(x, z) - 0.02, z);
      normals.push(n.x, n.y, n.z);
      flower.push(size * (0.8 + 0.4 * rand()), Math.floor(rand() * DAISY_ATLAS.tiles), rand(), 0.8 + 0.4 * rand());
      // Placed at random, so the first few of a drift are as good as any.
      swaying.push(kept++ < moving ? 1 : 0);
      const t = far ? tint() : 0;
      petal.push(t < FAR_HILL_PETALS[0] ? 0 : t < FAR_HILL_PETALS[0] + FAR_HILL_PETALS[1] ? 1 : 2);
    }
  };

  // The far hill: drifts all over the slope turned to the eye, right up to its top.
  for (let placed = 0, tries = 0; placed < 64 && tries < 4000; tries++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 0.88;
    const x = 22 + Math.cos(a) * r * 28;
    const z = -52 + Math.sin(a) * r * 20;
    groundNormal(x, z, n);
    toEye.set(EYE.x - x, 0, EYE.z - z).normalize();
    if (!inView(x, z) || (r > 0.3 && n.dot(toEye) < 0.02)) continue;
    drift(x, z, 10 + Math.floor(rand() * 14), 1.6 + rand() * 2.4, 0.4, true);
    placed++;
  }
  // The knoll's near slope: a few, small, nearer the eye — kept sparse, so the maple stands clear.
  for (let i = 0; i < 21; i++) {
    const a = THREE.MathUtils.degToRad(-60 + rand() * 120);
    drift(Math.sin(a) * (7 + rand() * 7) + 3, Math.cos(a) * (6 + rand() * 6), 4 + Math.floor(rand() * 8), 0.8 + rand(), 0.3);
  }

  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0], 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.setAttribute('aBase', new THREE.InstancedBufferAttribute(new Float32Array(base), 3));
  g.setAttribute('aNormal', new THREE.InstancedBufferAttribute(new Float32Array(normals), 3));
  g.setAttribute('aFlower', new THREE.InstancedBufferAttribute(new Float32Array(flower), 4));
  g.setAttribute('aSway', new THREE.InstancedBufferAttribute(new Float32Array(swaying), 1));
  g.setAttribute('aPetal', new THREE.InstancedBufferAttribute(new Float32Array(petal), 1));
  g.instanceCount = base.length / 3;
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(16, 0, -30), 90);
  return g;
}

/* ─── Trees in the distance ─────────────────────────────────────── */

export const GROVE_ATLAS = { width: 256, height: 128, tiles: 4 };

/**
 * A tree far off: one crown, a round with leafy bumps all round its edge and
 * a flatter underside, lit as one form from up and to the left and dabbed
 * lighter and darker so it reads as leaves; the trunk grows up into it.
 * Shapes: 0 broad and round, 1 a taller round, 2 slender, 3 two grown together.
 */
function drawFarTree(g: CanvasRenderingContext2D, ox: number, w: number, h: number, shape: number, id: number, rand: () => number) {
  const G = Math.round(id * 255);
  const crowns: [number, number, number, number][] =
    shape === 0 ? [[0.5, 0.52, 0.44, 0.34]]
    : shape === 1 ? [[0.5, 0.48, 0.38, 0.38]]
    : shape === 2 ? [[0.5, 0.45, 0.3, 0.41]]
    : [[0.34, 0.55, 0.3, 0.31], [0.65, 0.48, 0.32, 0.35]];

  g.fillStyle = `rgb(80, ${G}, 0)`;
  for (const [cx, cy, , ry] of crowns) {
    const from = (cy + ry * 0.3) * h;
    g.fillRect(ox + cx * w - w * 0.05, from, w * 0.1, h - from);
  }

  const crown = new Path2D();
  for (const [cx, cy, rx, ry] of crowns) {
    const phase = rand() * 6;
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const bump = 1 + 0.07 * Math.sin(a * 7 + phase) + 0.045 * Math.sin(a * 13 + phase * 2) + 0.03 * Math.sin(a * 19 + phase * 3);
      const under = Math.sin(a) > 0 ? 0.86 : 1;
      const x = ox + (cx + Math.cos(a) * rx * bump) * w;
      const y = (cy + Math.sin(a) * ry * bump * under) * h;
      if (i === 0) crown.moveTo(x, y);
      else crown.lineTo(x, y);
    }
    crown.closePath();
  }
  const top = Math.min(...crowns.map(([, cy, , ry]) => cy - ry)) * h;
  const bottom = Math.max(...crowns.map(([, cy, , ry]) => cy + ry)) * h;
  const light = g.createLinearGradient(ox + w * 0.25, top, ox + w * 0.75, bottom);
  light.addColorStop(0, `rgb(245, ${G}, 0)`);
  light.addColorStop(0.55, `rgb(170, ${G}, 0)`);
  light.addColorStop(1, `rgb(95, ${G}, 0)`);
  g.fillStyle = light;
  g.fill(crown);

  // Dabs of light up toward the sun and of shade low down: the look of leaves at a distance.
  g.save();
  g.clip(crown);
  for (let i = 0; i < 20; i++) {
    const [cx, cy, rx, ry] = crowns[i % crowns.length];
    const up = rand() < 0.55;
    const x = ox + (cx + (rand() - (up ? 0.7 : 0.35)) * rx * 1.3) * w;
    const y = (cy + (rand() - (up ? 0.85 : 0.15)) * ry * 1.2) * h;
    g.fillStyle = up ? `rgb(255, ${G}, 0)` : `rgb(80, ${G}, 0)`;
    g.globalAlpha = up ? 0.5 : 0.4;
    g.beginPath();
    g.arc(x, y, (0.05 + 0.05 * rand()) * w, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

export function makeGroveAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = GROVE_ATLAS.width;
  canvas.height = GROVE_ATLAS.height;
  const g = canvas.getContext('2d')!;
  const rand = mulberry32(41);
  const cell = GROVE_ATLAS.width / GROVE_ATLAS.tiles;
  for (let t = 0; t < GROVE_ATLAS.tiles; t++) drawFarTree(g, t * cell, cell, GROVE_ATLAS.height, t, rand(), rand);
  return atlasTexture(canvas);
}

/**
 * Woods across the far plain, behind the river: trees close-set so their
 * crowns run together, with a break here and there. Thinner on the left,
 * behind the maple, so it stands clear; fuller on the right, and a grove
 * gathered over the top of the far hill.
 */
export function buildGrove(): THREE.InstancedBufferGeometry {
  const rand = mulberry32(43);
  const base: number[] = [];
  const tree: number[] = [];
  const plant = (at: THREE.Vector2, height: number, onHill = false) => {
    if (!inView(at.x, at.y)) return;
    const y = groundHeight(at.x, at.y);
    // Out on the plain, never up a slope — save for the hill grove — and never in the river.
    if ((!onHill && y > -2.6) || inRiver(at.x, at.y, 3)) return;
    base.push(at.x, y - 0.1, at.y);
    tree.push(height, Math.floor(rand() * GROVE_ATLAS.tiles), rand(), 0.85 + 0.45 * rand());
  };

  for (let deg = -42; deg < 40; deg += 0.45 + rand() * 0.55) {
    // Unbroken from the middle rightward; behind the maple and to its left,
    // two in five gone, so it stands clear of them.
    if (deg < -8 && rand() < 0.4) continue;
    const distance = 186 + 9 * Math.sin(deg * 0.11 + 0.6) + (rand() - 0.5) * 12;
    plant(fromEye(deg, distance), (deg > 8 ? 5.5 : 4.8) + rand() * rand() * 5);
  }
  // A copse to the left, standing back behind the river.
  for (let i = 0; i < 4; i++) plant(fromEye(-31 + rand() * 7, 170 + rand() * 10), 4.5 + rand() * 2.5);
  // The far hill's grove: over its top and down its far side, crowns showing above the crest.
  const hill = new THREE.Vector2(22, -52);
  const away = new THREE.Vector2(hill.x - EYE.x, hill.y - EYE.z).normalize();
  for (let i = 0; i < 13; i++) {
    const at = hill.clone().addScaledVector(away, 2 + rand() * 9).add(new THREE.Vector2(-away.y, away.x).multiplyScalar((rand() - 0.5) * 22));
    plant(at, 3.6 + rand() * 1.6, true);
  }

  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0], 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.setAttribute('aBase', new THREE.InstancedBufferAttribute(new Float32Array(base), 3));
  g.setAttribute('aTree', new THREE.InstancedBufferAttribute(new Float32Array(tree), 4));
  g.instanceCount = base.length / 3;
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(EYE.x + LOOK.x * 150, 0, EYE.z + LOOK.z * 150), 170);
  return g;
}

/* ─── The river ────────────────────────────────────────────────── */

/**
 * The river's course, as points out from the eye: across the view in front
 * of the far woods, well clear of both hills, in one long easy S — out by the
 * woods on the left, swung nearer behind the tree, so it passes under the
 * crown, and out again in the middle — and away behind the far hill on the
 * right.
 */
export const RIVER_COURSE = [
  [-52, 158],
  [-40, 150],
  [-28, 134],
  [-15, 96],
  [-3, 108],
  [8, 150],
  [20, 140],
  [32, 122],
  [44, 128],
].map(([deg, distance]) => fromEye(deg, distance));

/** Half its width, in metres, at its two ends. */
export const RIVER_WIDTH = [8, 8] as const;

/**
 * The course smoothed out into short straight runs; the box it lies in, and
 * the ring about the eye — between the nearest and farthest it comes — so the
 * ground needn't look for it anywhere else; and the highest the plain comes
 * along it: water paints no higher, so never up the slope of a hill.
 */
export const RIVER = (() => {
  const points = new THREE.SplineCurve(RIVER_COURSE).getSpacedPoints(27);
  const margin = RIVER_WIDTH[0] + 2;
  const box = new THREE.Box2().setFromPoints(points).expandByScalar(margin);
  const away = points.map((q) => Math.hypot(q.x - EYE.x, q.y - EYE.z));
  const ring = new THREE.Vector4(EYE.x, EYE.z, Math.min(...away) - margin, Math.max(...away) + margin);
  const level = Math.max(...points.map((q) => groundHeight(q.x, q.y)));
  return { points, box: new THREE.Vector4(box.min.x, box.min.y, box.max.x, box.max.y), ring, level };
})();

/** Whether ground at (x, z) is in the river or on its banks: for keeping grass and trees out of the water. */
export const inRiver = (x: number, z: number, margin = 1) => {
  const { points } = RIVER;
  let best = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const abx = points[i + 1].x - a.x;
    const abz = points[i + 1].y - a.y;
    const t = THREE.MathUtils.clamp(((x - a.x) * abx + (z - a.y) * abz) / (abx * abx + abz * abz), 0, 1);
    best = Math.min(best, Math.hypot(x - a.x - abx * t, z - a.y - abz * t));
  }
  return best < RIVER_WIDTH[0] + margin;
};
