import * as THREE from 'three';
import { inRiver } from './scenery';
import { inView } from './shot';
import { groundHeight, groundNormal } from './terrain';
import { mulberry32 } from './tree';

/**
 * Tufts of grass, drawn the way you'd dash them in with a pen: a fan of a
 * few curved blades, each edged in a darker line. They stand upright and
 * turn to the eye, thick around the tree and in the near grass, thinning
 * out with distance until the painted ground carries on alone.
 *
 * The atlas holds four tufts side by side, as data like the leaves': r is
 * tone — darker at the root and along the drawn edge, lighter at the tip —
 * g tells blade from blade, a is coverage. A tuft never stands much more
 * than forty pixels tall on screen, so sixty-four is plenty.
 */

export const TUFT_ATLAS = { width: 256, height: 64, tufts: 4 };
const { width: W, height: H, tufts: TUFTS } = TUFT_ATLAS;

export function makeTuftAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d')!;
  const rand = mulberry32(17);
  const cell = W / TUFTS;
  // Drawn at the scale of a 128-pixel cell, whatever the atlas's size.
  const px = cell / 128;

  for (let t = 0; t < TUFTS; t++) {
    const blades = 5 + Math.floor(rand() * 4);
    const ox = t * cell + cell / 2;
    for (let b = 0; b < blades; b++) {
      const k = blades === 1 ? 0 : b / (blades - 1) - 0.5;
      const G = Math.round(rand() * 255);
      const baseX = ox + k * cell * 0.34 + (rand() - 0.5) * 8 * px;
      const tall = H * (0.55 + 0.4 * rand()) * (1 - Math.abs(k) * 0.5);
      const lean = k * cell * 0.55 + (rand() - 0.5) * 16 * px;
      const tipX = baseX + lean;
      const tipY = H - tall;
      const half = (3.2 + rand() * 2.2) * px;
      const bend = (rand() - 0.5) * 18 * px + lean * 0.25;

      const blade = new Path2D();
      blade.moveTo(baseX - half, H);
      blade.quadraticCurveTo(baseX - half * 0.6 + bend, H - tall * 0.55, tipX, tipY);
      blade.quadraticCurveTo(baseX + half * 0.6 + bend, H - tall * 0.55, baseX + half, H);
      blade.closePath();

      const fill = g.createLinearGradient(0, H, 0, tipY);
      fill.addColorStop(0, `rgb(120, ${G}, 0)`);
      fill.addColorStop(1, `rgb(250, ${G}, 0)`);
      g.fillStyle = fill;
      g.fill(blade);
      g.strokeStyle = `rgb(70, ${G}, 0)`;
      g.lineWidth = 1.6 * px;
      g.lineJoin = 'round';
      g.stroke(blade);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Scatter tufts over the ground in view, in clumps of a few as you'd dash
 * them in by hand: most round the tree's foot and in the near grass, fewer
 * farther off, none so far away they'd be specks, and none the shot can't see.
 */
export function buildTufts(clumps = 900): THREE.InstancedBufferGeometry {
  const rand = mulberry32(23);
  const base: number[] = [];
  const normals: number[] = [];
  const tuft: number[] = [];
  const n = new THREE.Vector3();

  let placed = 0;
  for (let tries = 0; placed < clumps && tries < clumps * 40; tries++) {
    const cx = -34 + rand() * 82;
    const cz = -26 + rand() * 66;
    // Thickest round the trunk, and close to the eye; the far hills keep only a sprinkling.
    const nearTree = Math.exp(-(cx * cx + cz * cz) / (2 * 6 * 6));
    const nearEye = THREE.MathUtils.smoothstep(cz, -10, 30);
    if (rand() > 0.05 + 0.6 * nearTree + 0.4 * nearEye) continue;
    placed++;
    const count = 1 + Math.floor(rand() * rand() * 7);
    const spread = 0.25 + 0.6 * rand();
    for (let k = 0; k < count; k++) {
      const x = cx + (rand() - 0.5) * 2 * spread;
      const z = cz + (rand() - 0.5) * 2 * spread;
      // Not inside the trunk, in the river, nor anywhere out of the shot.
      if (x * x + z * z < 0.55 * 0.55 || !inView(x, z) || inRiver(x, z)) continue;
      groundNormal(x, z, n);
      base.push(x, groundHeight(x, z) - 0.03, z);
      normals.push(n.x, n.y, n.z);
      // The middle of a clump stands tallest.
      const size = (0.3 + 0.3 * rand() * rand()) * (k === 0 ? 1.1 : 0.85);
      tuft.push(size, Math.floor(rand() * TUFTS), rand(), 0.85 + 0.3 * rand());
    }
  }

  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0], 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.setAttribute('aBase', new THREE.InstancedBufferAttribute(new Float32Array(base), 3));
  g.setAttribute('aNormal', new THREE.InstancedBufferAttribute(new Float32Array(normals), 3));
  g.setAttribute('aTuft', new THREE.InstancedBufferAttribute(new Float32Array(tuft), 4));
  g.instanceCount = base.length / 3;
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(7, 0, 7), 60);
  return g;
}
