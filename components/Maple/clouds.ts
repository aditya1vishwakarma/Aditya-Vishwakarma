import * as THREE from 'three';
import { EYE, LOOK } from './shot';
import { mulberry32 } from './tree';

/**
 * Fair-weather clouds, made the way Jaume Sanchez makes them in CSS ("How to
 * make clouds with CSS 3D", clicktorelease.com; github.com/spite/CSS3DClouds):
 * each cloud a clump of cloud images — five to ten layers, each seen at 0.8
 * opacity, packed close together and spread a little in depth, each at its
 * own size and angle and slowly turning — so that together they read as one
 * cloud with depth, always billowing a little. Here the layers are cards in
 * the scene, turned to face the eye, and the cloud image is drawn at load,
 * after the photograph the CSS clouds use, rather than downloaded.
 *
 * The clouds drift with the wind across the shot, and come round again.
 */

/**
 * Four cloud images, two by two, 256 px each: how light the cloud is in one
 * channel, how much cloud there is in the other.
 */
export const PUFF_ATLAS = { size: 512, tiles: 4 };
const TILE = PUFF_ATLAS.size / 2;

/** Where the clouds are, about the shot's line: degrees across, degrees up, degrees wide. */
const CLOUDS: [number, number, number][] = [
  [-26, 11.5, 9],
  [6, 12.8, 11],
  [27, 9.5, 13],
  [-58, 10.5, 12],
  [52, 11.5, 11],
];

/** How far off the clouds stand along the shot's line, in metres. */
const AWAY = 380;

/** Smooth value noise, about one bump every `scale` pixels, for fraying the edge. */
const hash = (x: number, y: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const noise = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
};
const fray = (x: number, y: number) => 0.5 * noise(x / 14, y / 14) + 0.3 * noise(x / 6 + 7, y / 6) + 0.2 * noise(x / 2.5, y / 2.5 + 3);

/**
 * One cloud image, after the photograph the CSS clouds use: a heap of soft
 * billows, each a cluster of smaller ones, domed over the top and feathering
 * away into wisps at the edge, where it thins enough for the sky to show
 * through. It's lit from one side — the billows bright where they face the
 * light, greying into the crevices and over the far side — so that layers
 * laid over one another at all angles, as the CSS clouds' are, mix into
 * soft shading through the whole cloud. Drawn twice over: once for how much
 * cloud there is, once for its light.
 */
function drawPuff(cover: CanvasRenderingContext2D, tone: CanvasRenderingContext2D, ox: number, oy: number, rand: () => number) {
  const cx = ox + TILE * 0.5;
  const cy = oy + TILE * 0.54;
  // The heap's outline: a rough oval, fuller on some sides than others.
  const wide = TILE * (0.25 + 0.04 * rand());
  const tall = TILE * (0.22 + 0.04 * rand());
  const lobes = [rand() * 6, rand() * 6];
  const edge = (a: number) => 1 + 0.12 * Math.sin(2 * a + lobes[0]) + 0.08 * Math.sin(3 * a + lobes[1]);

  // The light side and the far side.
  const side = tone.createLinearGradient(ox + TILE * 0.25, oy + TILE * 0.25, ox + TILE * 0.75, oy + TILE * 0.8);
  side.addColorStop(0, 'rgb(226, 226, 226)');
  side.addColorStop(1, 'rgb(178, 178, 178)');
  tone.fillStyle = side;
  tone.fillRect(ox, oy, TILE, TILE);

  // A billow is a smooth round bump of cloud, thickest at its heart, catching the light on its near shoulder.
  const billow = (x: number, y: number, r: number, amount: number, shine: number) => {
    const c = cover.createRadialGradient(x, y, 0, x, y, r);
    [1, 0.88, 0.56, 0.19, 0].forEach((k, i) => c.addColorStop(i / 4, `rgba(255, 255, 255, ${amount * k})`));
    cover.fillStyle = c;
    cover.beginPath();
    cover.arc(x, y, r, 0, Math.PI * 2);
    cover.fill();
    const t = tone.createRadialGradient(x - r * 0.3, y - r * 0.35, 0, x - r * 0.15, y - r * 0.2, r);
    [1, 0.65, 0.25, 0].forEach((k, i) => t.addColorStop(i / 3, `rgba(255, 255, 255, ${shine * k})`));
    tone.fillStyle = t;
    tone.beginPath();
    tone.arc(x, y, r, 0, Math.PI * 2);
    tone.fill();
  };
  // Out toward the edge in some direction, mostly over the top.
  const around = (out: [number, number], r: [number, number], amount: number, shine: number) => {
    let a = rand() * Math.PI * 2;
    if (Math.sin(a) > 0.2 && rand() < 0.7) a = -a;
    const d = (out[0] + (out[1] - out[0]) * rand()) * edge(a);
    billow(cx + Math.cos(a) * wide * d, cy + Math.sin(a) * tall * d, TILE * (r[0] + (r[1] - r[0]) * rand()), amount, shine);
  };

  // The underside: broad and soft.
  for (let i = 0; i < 3; i++) billow(cx + (rand() - 0.5) * wide * 1.2, cy + tall * (0.4 + 0.15 * rand()), TILE * (0.15 + 0.05 * rand()), 0.5, 0.15);
  // The body.
  for (let i = 0, n = 5 + Math.floor(rand() * 3); i < n; i++) {
    const a = rand() * Math.PI * 2;
    const d = 0.45 * Math.sqrt(rand());
    billow(cx + Math.cos(a) * wide * d, cy + Math.sin(a) * tall * d - tall * 0.1, TILE * (0.19 + 0.06 * rand()), 0.85, 0.55);
  }
  // Domes over it, a few tufts on those, and wisps feathering the edge.
  for (let i = 0, n = 10 + Math.floor(rand() * 5); i < n; i++) around([0.55, 0.82], [0.1, 0.15], 0.75, 0.8);
  for (let i = 0, n = 12 + Math.floor(rand() * 7); i < n; i++) around([0.82, 1.0], [0.04, 0.07], 0.6, 0.7);
  for (let i = 0; i < 30; i++) around([0.9, 1.15], [0.025, 0.05], 0.22, 0.4);
}

export function makePuffAtlas(): THREE.DataTexture {
  const size = PUFF_ATLAS.size;
  const layer = (fill: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const g = canvas.getContext('2d', { willReadFrequently: true })!;
    g.fillStyle = fill;
    g.fillRect(0, 0, size, size);
    return g;
  };
  const cover = layer('#000');
  const tone = layer('#000');
  const rand = mulberry32(53);
  for (let t = 0; t < PUFF_ATLAS.tiles; t++) drawPuff(cover, tone, (t % 2) * TILE, Math.floor(t / 2) * TILE, rand);

  const amount = cover.getImageData(0, 0, size, size).data;
  const light = tone.getImageData(0, 0, size, size).data;
  const data = new Uint8Array(size * size * 2);
  const { smoothstep, lerp } = THREE.MathUtils;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const from = (y * size + x) * 4;
      // Texture rows run from the bottom up.
      const to = ((size - 1 - y) * size + x) * 2;
      // Thick through the body; the thin edge frayed into wisps.
      let a = smoothstep(amount[from] / 255, 0.04, 0.95);
      let l = light[from] / 255;
      if (a > 0) {
        const n = fray(x, y);
        a *= lerp(0.25 + 0.75 * n, 1, smoothstep(a, 0.45, 0.95));
        l += (n - 0.5) * 0.05;
      }
      data[to] = Math.round(THREE.MathUtils.clamp(l, 0, 1) * 255);
      data[to + 1] = Math.round(a * 255);
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGFormat, THREE.UnsignedByteType);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

/**
 * The layers, one card each: which cloud, where in it, how big, at what
 * angle and how fast it turns. Each cloud is two or three clumps abreast,
 * overlapping, on one roughly flat base — the middle fuller and so taller,
 * heaping up into a dome. Each clump is laid out as the CSS clouds are: six
 * to ten layers close together, spread a little in depth, from a quarter to
 * one and a quarter times the clump's size. Set out farthest first, so each
 * is laid over the ones behind it.
 */
export function buildClouds(): THREE.InstancedBufferGeometry {
  const rand = mulberry32(59);
  const right = new THREE.Vector3(-LOOK.z, 0, LOOK.x);
  const layers: { centre: THREE.Vector3; offset: THREE.Vector3; size: number; turn: number; spin: number; tile: number; height: number }[] = [];

  for (const [across, up, wide] of CLOUDS) {
    const r = THREE.MathUtils.degToRad;
    const centre = EYE.clone()
      .addScaledVector(LOOK, AWAY)
      .addScaledVector(right, Math.tan(r(across)) * AWAY)
      .setY(EYE.y + Math.tan(r(up)) * AWAY);
    const width = Math.tan(r(wide)) * AWAY;
    const clumps = wide >= 11 ? 3 : 2;
    const cloud: typeof layers = [];
    for (let c = 0; c < clumps; c++) {
      const x = (c / (clumps - 1) - 0.5) * width * (clumps === 2 ? 0.3 : 0.5) + (rand() - 0.5) * width * 0.06;
      const heap = 1 - (x / (width * 0.5)) ** 2;
      const clump = width * 0.5 * (0.45 + 0.55 * heap);
      for (let k = 0, count = 6 + Math.round(rand() * 4); k < count; k++) {
        const scale = 0.25 + rand();
        // Bigger layers sit higher, so their undersides line up along the base.
        const y = clump * (0.22 * scale + 0.12 * (rand() - 0.3));
        cloud.push({
          centre,
          offset: new THREE.Vector3()
            .addScaledVector(right, x + (rand() - 0.5) * clump * 0.4)
            .setY(y)
            .addScaledVector(LOOK, (rand() - 0.5) * clump * 0.8),
          size: clump * scale,
          turn: rand() * Math.PI * 2,
          spin: (rand() < 0.5 ? -1 : 1) * (0.012 + 0.03 * rand()),
          tile: Math.floor(rand() * PUFF_ATLAS.tiles),
          height: y,
        });
      }
    }
    // Height through the cloud, 0 at the base to 1 at the top layer's middle.
    const top = Math.max(...cloud.map((l) => l.height));
    for (const l of cloud) l.height /= top;
    layers.push(...cloud);
  }
  layers.sort((a, b) => b.centre.clone().add(b.offset).distanceTo(EYE) - a.centre.clone().add(a.offset).distanceTo(EYE));

  const centres: number[] = [];
  const offsets: number[] = [];
  const puff: number[] = [];
  const height: number[] = [];
  for (const l of layers) {
    centres.push(l.centre.x, l.centre.y, l.centre.z);
    offsets.push(l.offset.x, l.offset.y, l.offset.z);
    puff.push(l.size, l.turn, l.spin, l.tile);
    height.push(l.height);
  }

  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.setAttribute('aCloud', new THREE.InstancedBufferAttribute(new Float32Array(centres), 3));
  g.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
  g.setAttribute('aPuff', new THREE.InstancedBufferAttribute(new Float32Array(puff), 4));
  g.setAttribute('aHeight', new THREE.InstancedBufferAttribute(new Float32Array(height), 1));
  g.instanceCount = layers.length;
  g.boundingSphere = new THREE.Sphere(EYE.clone(), AWAY * 2);
  return g;
}

/** For the drift: the shot's sideways line, and how far the clouds may go along it before coming round. */
export const DRIFT = {
  right: new THREE.Vector3(-LOOK.z, 0, LOOK.x),
  span: Math.tan(THREE.MathUtils.degToRad(70)) * AWAY,
  speed: 0.6,
};
