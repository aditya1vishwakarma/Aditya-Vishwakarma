import React, { useEffect, useLayoutEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { INK } from './mapleConfig';
import { makeInkMaterial, makeSmoothMaterial } from './materials';

/**
 * Takes over drawing the frame, in three passes: the scene is painted into
 * an offscreen target that keeps its depth; inked and laid on paper; then
 * smoothed onto the screen with FXAA.
 *
 * Nothing is multisampled. At full-screen sizes a multisampled target costs
 * several times the memory of all three passes put together, and FXAA gives
 * the inked lines and leaf edges much the same finish. Eight bits a channel
 * is plenty: the scene's colours are display colours already.
 */
const InkPass: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const dpr = useThree((s) => s.viewport.dpr);

  const pass = useMemo(() => {
    const painted = new THREE.WebGLRenderTarget(1, 1, { depthTexture: new THREE.DepthTexture(1, 1) });
    const inked = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });
    const ink = makeInkMaterial();
    ink.uniforms.tColor.value = painted.texture;
    ink.uniforms.tDepth.value = painted.depthTexture;
    ink.uniforms.uWeight.value = INK.weight;
    ink.uniforms.uThreshold.value.set(...INK.threshold);
    ink.uniforms.uFade.value.set(...INK.fade);
    ink.uniforms.uClumpLine.value = INK.clumpLine;
    ink.uniforms.uClumpShadow.value = INK.clumpShadow;
    ink.uniforms.uClumpReach.value = INK.clumpShadowWidth;
    const smooth = makeSmoothMaterial();
    smooth.uniforms.tDiffuse.value = inked.texture;
    // One triangle that covers the screen, drawn once with each pass's material.
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    const quad = new THREE.Mesh(geometry, ink);
    quad.frustumCulled = false;
    const post = new THREE.Scene();
    post.add(quad);
    return { painted, inked, ink, smooth, geometry, quad, post, camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) };
  }, []);

  useEffect(
    () => () => {
      pass.painted.depthTexture?.dispose();
      pass.painted.dispose();
      pass.inked.dispose();
      pass.ink.dispose();
      pass.smooth.dispose();
      pass.geometry.dispose();
    },
    [pass],
  );

  useLayoutEffect(() => {
    const w = Math.max(1, Math.round(width * dpr));
    const h = Math.max(1, Math.round(height * dpr));
    pass.painted.setSize(w, h);
    pass.inked.setSize(w, h);
    pass.ink.uniforms.uRes.value.set(w, h);
    pass.ink.uniforms.uDpr.value = dpr;
    pass.smooth.uniforms.resolution.value.set(1 / w, 1 / h);
  }, [pass, width, height, dpr]);

  useFrame(() => {
    pass.ink.uniforms.uNear.value = camera.near;
    pass.ink.uniforms.uFar.value = camera.far;
    gl.setRenderTarget(pass.painted);
    gl.render(scene, camera);
    pass.quad.material = pass.ink;
    gl.setRenderTarget(pass.inked);
    gl.render(pass.post, pass.camera);
    pass.quad.material = pass.smooth;
    gl.setRenderTarget(null);
    gl.render(pass.post, pass.camera);
  }, 1);

  return null;
};

export default InkPass;
