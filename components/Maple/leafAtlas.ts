import * as THREE from 'three';
import { mulberry32 } from './tree';

/**
 * The leaves themselves, drawn once onto a small canvas: a 2×2 atlas of a
 * maple leaf alone, a pair and a spray of three on a twig, and a second lone
 * leaf a little different from the first. Not colour — the shaders paint
 * that — but data the shaders read:
 *
 *   r  shading: the leaf's tone, darker along its veins
 *   g  which leaf this is, 0–1, so leaves on one card can differ in hue
 *   a  coverage
 *
 * Tile 0 is the lone leaf the loose leaves use. 128 pixels a tile is more
 * than a leaf ever covers on screen, so the atlas stays small.
 */

export const LEAF_ATLAS_SIZE = 256;
const TILE = LEAF_ATLAS_SIZE / 2;

/* ─── The leaf ─────────────────────────────────────────────────── */

/**
 * Half a maple leaf's edge, read off a Norway maple: from the point of the
 * middle lobe round to where the stalk joins, as [degrees from straight up,
 * distance from where the veins meet, rounded?]. Five lobes — the middle one,
 * a broad pair beside it reaching nearly as far, and a small pair down by the
 * stalk pointing down and out — each edged with a few big teeth, with deep
 * rounded gaps between them and a shallow notch where the stalk comes in.
 * Tips and teeth are sharp; the gaps are rounded. The other half is the
 * mirror of this one.
 */
const HALF: [number, number, boolean?][] = [
  [0, 1],
  [5, 0.86],
  [11, 0.83],
  [13.5, 0.72],
  [21, 0.73],
  [23, 0.62],
  [32, 0.47, true],
  [38, 0.58],
  [41, 0.7],
  [44, 0.67],
  [48, 0.84],
  [50.5, 0.81],
  [56, 0.97],
  [63, 0.83],
  [67, 0.8],
  [70, 0.69],
  [76, 0.66],
  [78.5, 0.56],
  [90, 0.4, true],
  [99, 0.5],
  [104, 0.58],
  [107, 0.55],
  [118, 0.66],
  [127, 0.52],
  [131, 0.49],
  [136, 0.38],
  [160, 0.18, true],
];

/** Where the main veins run: out to the point of every lobe. */
const VEINS: [number, number][] = [
  [0, 1],
  [56, 0.97],
  [-56, 0.97],
  [118, 0.66],
  [-118, 0.66],
];

/**
 * The whole edge, as points in the leaf's own units — veins meeting at
 * (0, 0), the middle lobe's point at (0, -1) — each marked sharp or rounded.
 * `lean` makes one side's lobes a little bigger than the other's, as real
 * leaves are.
 */
const edge = (lean: number) => {
  const side = (sign: number) =>
    HALF.map(([deg, r, round]) => {
      // The lobes either side of the middle one, fuller on one side than the other.
      const grow = 1 + sign * lean * THREE.MathUtils.smoothstep(deg, 25, 60);
      const a = THREE.MathUtils.degToRad(deg * sign);
      return { x: Math.sin(a) * r * grow, y: -Math.cos(a) * r * grow, round: !!round };
    });
  const right = side(1);
  const left = side(-1).slice(1).reverse();
  // Where the stalk joins, between the two small lobes.
  return [...right, { x: 0, y: 0.07, round: true }, ...left];
};

/** Trace the edge: straight between sharp points, curving through rounded ones. */
const trace = (points: { x: number; y: number; round: boolean }[]) => {
  const path = new Path2D();
  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  path.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    if (!p.round) {
      path.lineTo(p.x, p.y);
      continue;
    }
    const before = mid(points[i - 1], p);
    const after = mid(p, points[(i + 1) % points.length]);
    path.lineTo(before.x, before.y);
    path.quadraticCurveTo(p.x, p.y, after.x, after.y);
  }
  path.closePath();
  return path;
};

/** One leaf, its veins meeting at (x, y), `size` pixels from there to its tip, pointing `angle` from straight up. */
function drawLeaf(g: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, id: number, lean = 0) {
  const G = Math.round(id * 255);
  g.save();
  g.translate(x, y);
  g.rotate(angle);
  // From here on, units are the leaf's own.
  g.scale(size, size);
  g.lineCap = 'round';

  // The stalk, behind the blade.
  g.strokeStyle = `rgb(150, ${G}, 0)`;
  g.lineWidth = 0.05;
  g.beginPath();
  g.moveTo(0, 0);
  g.quadraticCurveTo(0.03, 0.3, -0.03, 0.6);
  g.stroke();

  const tone = g.createRadialGradient(0, 0, 0, 0, 0, 1);
  tone.addColorStop(0, `rgb(214, ${G}, 0)`);
  tone.addColorStop(1, `rgb(250, ${G}, 0)`);
  g.fillStyle = tone;
  g.fill(trace(edge(lean)));

  // A vein out to every point.
  g.strokeStyle = `rgb(178, ${G}, 0)`;
  g.lineWidth = 0.03;
  g.beginPath();
  for (const [deg, r] of VEINS) {
    const a = THREE.MathUtils.degToRad(deg);
    g.moveTo(0, 0);
    g.lineTo(Math.sin(a) * r * 0.86, -Math.cos(a) * r * 0.86);
  }
  g.stroke();
  g.restore();
}

/* ─── The atlas ────────────────────────────────────────────────── */

/** Canvas origin of tile `i`. The texture is flipped on upload, so tile 0 is bottom-left. */
const tileOrigin = (i: number) => ({ x: (i % 2) * TILE, y: LEAF_ATLAS_SIZE - (Math.floor(i / 2) + 1) * TILE });

/** Leaves fanned out from one point on a twig, each `size` pixels heart to tip. */
const spray = (g: CanvasRenderingContext2D, tile: number, angles: number[], size: number, rand: () => number) => {
  const o = tileOrigin(tile);
  const twigX = o.x + TILE * 0.5;
  const twigY = o.y + TILE * 0.8;
  angles.forEach((a) => {
    const reach = size * 0.5;
    drawLeaf(g, twigX + Math.sin(a) * reach, twigY - Math.cos(a) * reach, size, a + (rand() - 0.5) * 0.2, rand(), (rand() - 0.5) * 0.16);
  });
};

export function makeLeafAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = LEAF_ATLAS_SIZE;
  const g = canvas.getContext('2d')!;
  const rand = mulberry32(5);

  // Tile 0: one leaf, upright, filling the tile.
  const lone = tileOrigin(0);
  drawLeaf(g, lone.x + TILE * 0.5, lone.y + TILE * 0.62, TILE * 0.58, 0, rand());
  // Tiles 1 and 2: a pair, and three on a twig.
  spray(g, 1, [-0.55, 0.5], TILE * 0.36, rand);
  spray(g, 2, [-0.8, 0.02, 0.78], TILE * 0.32, rand);
  // Tile 3: a second lone leaf, leaning a little, one side fuller.
  const other = tileOrigin(3);
  drawLeaf(g, other.x + TILE * 0.5, other.y + TILE * 0.6, TILE * 0.48, 0.18, rand(), 0.08);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
