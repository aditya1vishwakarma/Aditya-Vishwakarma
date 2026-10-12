import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { makeSoftDisc } from './museumMaterials';

export interface MuseumAssets {
  softDisc: THREE.Texture;
  /** Unit primitives every pane scales, so a hundred panes share three buffers. */
  unitBox: THREE.BoxGeometry;
  unitPlane: THREE.PlaneGeometry;
  flatPlane: THREE.PlaneGeometry;
}

/** Shared textures and geometry, made once per mount. */
export function useMuseumAssets(): MuseumAssets {
  const assets = useMemo<MuseumAssets>(
    () => ({
      softDisc: makeSoftDisc(),
      unitBox: new THREE.BoxGeometry(1, 1, 1),
      unitPlane: new THREE.PlaneGeometry(1, 1),
      // Lying flat, facing up — for pools and contact shadows on a shelf.
      flatPlane: new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    }),
    [],
  );

  useEffect(
    () => () => {
      assets.softDisc.dispose();
      assets.unitBox.dispose();
      assets.unitPlane.dispose();
      assets.flatPlane.dispose();
    },
    [assets],
  );

  return assets;
}
