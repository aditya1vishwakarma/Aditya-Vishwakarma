import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useThree } from '@react-three/fiber';
import MapleScene from '../components/Maple/MapleScene';
import { SHOT, type Season } from '../components/Maple/mapleConfig';

/** The maple from a camera given in the URL, as the dev view's Copy button reports it. */

const params = new URLSearchParams(window.location.search);
const vec = (key: string) => params.get(key)?.split(',').map(Number) as [number, number, number] | undefined;
const eye = vec('eye');
const target = vec('target');
const fov = Number(params.get('fov')) || SHOT.fov;
const season: Season = params.get('season') === 'autumn' ? 'autumn' : 'summer';

/** Holds the free camera where the URL puts it. */
const Pose: React.FC = () => {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as { target: { set: (...v: number[]) => void }; update: () => void } | null;
  useEffect(() => {
    if (!eye || !target || !controls) return;
    camera.position.set(...eye);
    controls.target.set(...target);
    controls.update();
  }, [camera, controls]);
  return null;
};

createRoot(document.getElementById('root')!).render(
  <Canvas flat dpr={2} gl={{ antialias: false, depth: false, stencil: false }} style={{ position: 'fixed', inset: 0 }}>
    <MapleScene season={season} freeCamera={!!eye} fov={fov} />
    <Pose />
  </Canvas>,
);
