import React from 'react';
import { Canvas } from '@react-three/fiber';
import MapleScene, { type MapleHandle } from './MapleScene';
import type { Season } from './mapleConfig';

/**
 * The scene and what it's drawn on: three.js and everything of the scene's,
 * loaded apart from the page (HomeHero.tsx), so the type comes in without
 * waiting on it.
 */
const SceneCanvas: React.FC<{
  season: Season;
  dusk: boolean;
  clear: number;
  still: boolean;
  paused: boolean;
  onReady: () => void;
  handle: React.MutableRefObject<MapleHandle | null>;
}> = (scene) => (
  <Canvas
    flat
    // The scene draws its own frames, at its own pace: fewer in calm air, none while it's covered.
    frameloop="never"
    // 1.5× is crisp on a Retina screen at half the pixels of 2×, as on the mood board.
    dpr={[1, 1.5]}
    // The scene is drawn offscreen and smoothed on its way here; the canvas only shows the result.
    gl={{ antialias: false, depth: false, stencil: false, powerPreference: 'default' }}
    style={{ position: 'absolute', inset: 0 }}
  >
    <MapleScene {...scene} />
  </Canvas>
);

export default SceneCanvas;
