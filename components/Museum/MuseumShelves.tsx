import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PANE, POST, SHELF } from './museumConfig';
import type { CaseLayout } from './museumLayout';
import { makeHinokiMaterial, type CaseLightUniforms } from './museumMaterials';

/* ─── Boards ───────────────────────────────────────────────────── */

/** Deterministic 0–1 per board, so the grain never reshuffles between visits. */
const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Tag a board with its grain: which way it runs, a seed, and where the
 * log's heart sits relative to it. Most boards are cut beside the heart
 * (quarter-sawn, the straight masame grain hinoki is prized for); a few
 * nearer under it, which opens the rings into broader figure.
 */
function grain(g: THREE.BufferGeometry, axis: 'x' | 'y', centre: [number, number], n: number) {
  const quarter = rand(n * 3.1) < 0.75;
  const dist = quarter ? 0.22 + rand(n * 5.7) * 0.4 : 0.12 + rand(n * 2.3) * 0.12;
  const angle = quarter ? (rand(n) < 0.5 ? 0 : Math.PI) + (rand(n * 9.2) - 0.5) * 0.5 : -Math.PI / 2 + (rand(n * 4.4) - 0.5) * 0.7;
  const heart = [centre[0] + Math.sin(angle) * dist, centre[1] + Math.cos(angle) * dist];
  const count = g.getAttribute('position').count;
  const data = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) data.set([axis === 'y' ? 1 : 0, rand(n * 1.37) * 10, heart[0], heart[1]], i * 4);
  g.setAttribute('aWood', new THREE.BufferAttribute(data, 4));
  return g;
}

/**
 * A shelf plank with the reference's undercut ends: the top runs the full
 * length and the underside is pulled in, so each end reads as a knife edge.
 * The long arrises front and back are eased, so they catch a line of light.
 */
function plank(x0: number, x1: number, y: number) {
  const t = SHELF.thickness;
  const b = SHELF.bevel;
  const e = SHELF.ease;
  const s = new THREE.Shape();
  s.moveTo(x0 + e, y - e);
  s.lineTo(x0 + b, y - t + e);
  s.lineTo(x1 - b, y - t + e);
  s.lineTo(x1 - e, y - e);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth: SHELF.depth - e * 2,
    bevelEnabled: true,
    bevelThickness: e,
    bevelSize: e,
    bevelSegments: 3,
    curveSegments: 1,
  });
  return g.translate(0, 0, SHELF.backZ + e);
}

/** A square post with softened corners, standing on y0 and rising to y1. */
function post(x: number, y0: number, y1: number) {
  const h = POST.size / 2;
  const r = POST.radius;
  const s = new THREE.Shape();
  s.moveTo(-h + r, -h);
  s.lineTo(h - r, -h);
  s.quadraticCurveTo(h, -h, h, -h + r);
  s.lineTo(h, h - r);
  s.quadraticCurveTo(h, h, h - r, h);
  s.lineTo(-h + r, h);
  s.quadraticCurveTo(-h, h, -h, h - r);
  s.lineTo(-h, -h + r);
  s.quadraticCurveTo(-h, -h, -h + r, -h);
  const g = new THREE.ExtrudeGeometry(s, { depth: y1 - y0, bevelEnabled: false, curveSegments: 3 });
  // Extruded along z; stand it up.
  return g.rotateX(-Math.PI / 2).translate(x, y0, POST.z);
}

/** The small slotted foot a front pane stands in. Kept square to the shelf, so its grain runs true. */
function stand(x: number, y: number, z: number, w: number) {
  return new THREE.BoxGeometry(w, PANE.standH, 0.034).toNonIndexed().translate(x, y + PANE.standH / 2, z);
}

/* ─── Shelving ─────────────────────────────────────────────────── */

interface Props {
  layout: CaseLayout;
  uniforms: CaseLightUniforms;
}

/** Every piece of hinoki in the scene, as one mesh with one material. */
const MuseumShelves: React.FC<Props> = ({ layout, uniforms }) => {
  const material = useMemo(() => makeHinokiMaterial(uniforms), [uniforms]);

  const geometry = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    let n = 1;
    layout.shelves.forEach((s) => {
      parts.push(grain(plank(s.x0, s.x1, s.y), 'x', [s.y - SHELF.thickness / 2, SHELF.backZ + SHELF.depth / 2], n++));
    });
    layout.posts.forEach((p) => {
      parts.push(grain(post(p.x, p.y0, p.y1), 'y', [p.x, POST.z], n++));
    });
    layout.panes.forEach((p) => {
      if (!p.stand) return;
      parts.push(grain(stand(p.x, p.surfaceY, p.z, Math.max(0.07, p.w * 0.52)), 'x', [p.surfaceY, p.z], n++));
    });
    // Box and extrusion UVs differ in layout but not in kind; the grain ignores them.
    return mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)));
  }, [layout]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  return <mesh geometry={geometry} material={material} castShadow receiveShadow />;
};

export default MuseumShelves;
