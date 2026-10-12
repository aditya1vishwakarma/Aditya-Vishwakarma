import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { MoodBoardItem } from '../../types';
import { BACKDROP_Z, CAMERA, COLORS, INTENSITY, LIGHT_DIR, SHELF } from './museumConfig';
import type { CaseLayout } from './museumLayout';
import { computeView, type MuseumRig, type MuseumView } from './museumView';
import { createCaseLightUniforms, makeBackdropMaterial, type BackdropUniforms } from './museumMaterials';
import { useMuseumAssets } from './useMuseumAssets';
import type { PaneTexture } from './useMuseumTextures';
import MuseumShelves from './MuseumShelves';
import GlassPane, { type GlowRegistry, type PaneUniforms } from './GlassPane';
import type { MuseumTheme } from './museumTheme';

const LIGHT = new THREE.Vector3(...LIGHT_DIR).normalize();

/* ─── Camera ───────────────────────────────────────────────────── */

/** Eye-level camera that walks the length of the shelving, eased toward wherever it's sent. */
const CameraRig: React.FC<{
  rig: React.MutableRefObject<MuseumRig>;
  layout: CaseLayout;
  uniforms: PaneUniforms;
  onView: (v: MuseumView) => void;
}> = ({ rig, layout, uniforms, onView }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  // The numbers, not the size object: R3F hands out a fresh object whenever it
  // reconfigures, and reacting to that would re-run this on every page render.
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const events = useThree((s) => s.events);

  useLayoutEffect(() => {
    const view = computeView(width, height);
    const r = rig.current;
    r.view = view;
    // Slide until a little empty shelf shows past the first and last pane — the
    // shelving itself carries on beyond, so the board ends but the shelf doesn't.
    const mid = (layout.x0 + layout.x1) / 2;
    r.minX = Math.min(mid, layout.x0 - CAMERA.endReveal + view.halfW);
    r.maxX = Math.max(mid, layout.x1 + CAMERA.endReveal - view.halfW);
    r.targetX = THREE.MathUtils.clamp(r.targetX, r.minX, r.maxX);
    r.x = THREE.MathUtils.clamp(r.x, r.minX, r.maxX);

    camera.fov = CAMERA.fov;
    camera.near = 0.05;
    camera.far = 60;
    camera.aspect = width / height;
    camera.position.set(r.x, view.camY, view.camZ);
    camera.rotation.set(0, 0, 0);
    camera.updateProjectionMatrix();
    uniforms.uCamPos.value.copy(camera.position);
    onView(view);
  }, [camera, width, height, layout, rig, uniforms, onView]);

  useFrame((three, dt) => {
    const r = rig.current;
    if (r.x === r.targetX) return;
    r.x = THREE.MathUtils.damp(r.x, r.targetX, r.ease, Math.min(dt, 1 / 20));
    if (Math.abs(r.x - r.targetX) < 1e-4) r.x = r.targetX;
    camera.position.x = r.x;
    uniforms.uCamPos.value.copy(camera.position);
    // The shelving slides under a still cursor; re-test what it's over.
    events.update?.();
    three.invalidate();
  });
  return null;
};

/* ─── Light ────────────────────────────────────────────────────── */

/**
 * Three suns, fanned a little along the shelving: the real lights of the
 * scene. One sun gives hard-sided shadows; three, each a little off the
 * others, give the overlapping penumbrae of a row of spots overhead.
 *
 * Their shadow cameras only cover what's on screen and follow the view,
 * snapped to whole texels so edges never shimmer, and the maps are only
 * redrawn when something actually moves.
 */
const SUNS = [-0.2, 0, 0.2].map((tilt) => ({
  dir: new THREE.Vector3(tilt, LIGHT.y, LIGHT.z).normalize(),
  share: tilt === 0 ? 0.4 : 0.3,
}));

const SHADOW_MAP = 768;

const Lights: React.FC<{
  rig: React.MutableRefObject<MuseumRig>;
  view: MuseumView | null;
  uniforms: PaneUniforms;
  lightsTarget: number;
  layout: CaseLayout;
}> = ({ rig, view, uniforms, lightsTarget, layout }) => {
  const gl = useThree((s) => s.gl);
  const lights = useRef<THREE.DirectionalLight[]>([]);
  const target = useMemo(() => new THREE.Object3D(), []);
  const last = useRef({ x: NaN, texel: 0.004 });

  useLayoutEffect(() => {
    const halfX = (view?.visibleW ?? 4) / 2 + 1.5;
    lights.current.forEach((l) => {
      l.target = target;
      const cam = l.shadow.camera;
      cam.left = -halfX;
      cam.right = halfX;
      cam.top = 1.35;
      cam.bottom = -1.35;
      cam.near = 1;
      cam.far = 12;
      cam.updateProjectionMatrix();
    });
    last.current = { x: NaN, texel: (halfX * 2) / SHADOW_MAP };
  }, [view, target]);

  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    last.current.x = NaN; // geometry changed — redraw the shadow maps
    invalidate();
  }, [layout, invalidate]);
  useEffect(() => invalidate(), [lightsTarget, invalidate]);

  useFrame((three, dt) => {
    const u = uniforms.uLightsOn;
    if (u.value !== lightsTarget) {
      u.value = THREE.MathUtils.damp(u.value, lightsTarget, lightsTarget > u.value ? 1.9 : 2.6, Math.min(dt, 1 / 20));
      if (Math.abs(u.value - lightsTarget) < 0.001) u.value = lightsTarget;
      three.invalidate();
    }

    const { texel } = last.current;
    const x = Math.round(rig.current.x / texel) * texel;
    if (rig.current.shadowDirty) {
      rig.current.shadowDirty = false;
      gl.shadowMap.needsUpdate = true;
    }
    if (x === last.current.x) return;
    last.current.x = x;
    // Centred between the shelves and the backdrop their shadows land on.
    target.position.set(x, 1.35, (SHELF.backZ + BACKDROP_Z) / 2 + 0.1);
    target.updateMatrixWorld();
    lights.current.forEach((l, i) => {
      l.position.copy(target.position).addScaledVector(SUNS[i].dir, -6);
      l.updateMatrixWorld();
    });
    gl.shadowMap.needsUpdate = true;
  });

  return (
    <>
      <primitive object={target} />
      {SUNS.map((sun, i) => (
        <directionalLight
          key={i}
          ref={(l: THREE.DirectionalLight | null) => {
            if (l) lights.current[i] = l;
          }}
          color={COLORS.sun}
          intensity={INTENSITY.sun * sun.share}
          castShadow
          shadow-mapSize={[SHADOW_MAP, SHADOW_MAP / 2]}
          shadow-radius={7}
          shadow-intensity={0.62}
          shadow-bias={-0.0006}
          shadow-normalBias={0.016}
        />
      ))}
      <hemisphereLight args={[COLORS.fillSky, COLORS.fillGround, INTENSITY.fill]} />
    </>
  );
};

/** A soft studio room, reflected in the wood's satin finish. */
const StudioEnvironment: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      room.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
};

/**
 * Two soft white lights that follow whichever panes are glowing. Two, not
 * one, so a glow can fade out on one pane while it fades in on the next. The
 * light count never changes, so hovering never triggers a shader recompile.
 * The backdrop gets the same two glows, painted in its own shader.
 */
const HoverLights: React.FC<{ registry: GlowRegistry; uniforms: PaneUniforms; glow: BackdropUniforms }> = ({
  registry,
  uniforms,
  glow,
}) => {
  const a = useRef<THREE.PointLight>(null!);
  const b = useRef<THREE.PointLight>(null!);

  useFrame(() => {
    type Entry = GlowRegistry extends Map<string, infer E> ? E : never;
    let first: Entry | null = null;
    let second: Entry | null = null;
    registry.forEach((e) => {
      if (!first || e.glow > first.glow) {
        second = first;
        first = e;
      } else if (!second || e.glow > second.glow) second = e;
    });
    [a.current, b.current].forEach((l, i) => {
      const e = (i === 0 ? first : second) as Entry | null;
      l.intensity = e ? INTENSITY.hover * e.glow : 0;
      glow.uGlowAmt.value[i] = e ? e.glow : 0;
      if (!e) return;
      l.position.copy(e.pos);
      glow.uGlowPos.value[i].copy(e.pos);
      uniforms.uHoverFloor.value[i] = e.floor;
    });
  });

  // No physical falloff — the wood's shader gives these a soft bell curve instead.
  const props = { color: COLORS.hoverLight, distance: 0, decay: 0, intensity: 0 };
  return (
    <>
      <pointLight ref={a} {...props} />
      <pointLight ref={b} {...props} />
    </>
  );
};

/* ─── Backdrop & veil ──────────────────────────────────────────── */

/**
 * The cream wall behind the shelving, with a shadow-catcher laid over it,
 * and the veil that fades the shelves back while a pane is out. All three
 * travel with the camera, so the wall has no ends.
 */
const Surround: React.FC<{
  rig: React.MutableRefObject<MuseumRig>;
  view: MuseumView;
  uniforms: PaneUniforms;
  glow: BackdropUniforms;
  veil: React.MutableRefObject<number>;
  theme: MuseumTheme;
}> = ({ rig, view, uniforms, glow, veil, theme }) => {
  const group = useRef<THREE.Group>(null!);
  const veilMat = useRef<THREE.MeshBasicMaterial>(null!);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  const mats = useMemo(
    () => ({
      backdrop: (() => {
        // Starts in the theme it opens in; later changes ease across in the frame loop.
        const m = makeBackdropMaterial(uniforms, glow);
        (m.uniforms.uLow.value as THREE.Color).set(theme.backdropLow);
        (m.uniforms.uHigh.value as THREE.Color).set(theme.backdropHigh);
        return m;
      })(),
      shadow: new THREE.ShadowMaterial({
        color: theme.shadow,
        opacity: theme.shadowOpacity,
        depthWrite: false,
      }),
    }),
    [uniforms, glow],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  // The colours the wall is heading for; a theme change eases across to them.
  const target = useMemo(
    () => ({
      low: new THREE.Color(theme.backdropLow),
      high: new THREE.Color(theme.backdropHigh),
      veil: new THREE.Color(theme.veil),
      shadow: new THREE.Color(theme.shadow),
      clear: new THREE.Color(theme.pageBg),
      shadowOpacity: theme.shadowOpacity,
    }),
    [theme],
  );
  const clear = useMemo(() => new THREE.Color(), []);
  useEffect(() => invalidate(), [target, invalidate]);

  useFrame((three, dt) => {
    group.current.position.x = rig.current.x;
    veilMat.current.opacity = veil.current * 0.86;
    veilMat.current.visible = veil.current > 0.002;

    const u = mats.backdrop.uniforms;
    const low = u.uLow.value as THREE.Color;
    const k = 1 - Math.exp(-7 * Math.min(dt, 1 / 20));
    const moving = Math.abs(low.r - target.low.r) + Math.abs(low.g - target.low.g) + Math.abs(low.b - target.low.b) > 0.002;
    if (!moving) {
      low.copy(target.low);
      (u.uHigh.value as THREE.Color).copy(target.high);
      veilMat.current.color.copy(target.veil);
      mats.shadow.color.copy(target.shadow);
      mats.shadow.opacity = target.shadowOpacity;
      if (!gl.getClearColor(clear).equals(target.clear)) gl.setClearColor(target.clear);
      return;
    }
    low.lerp(target.low, k);
    (u.uHigh.value as THREE.Color).lerp(target.high, k);
    veilMat.current.color.lerp(target.veil, k);
    mats.shadow.color.lerp(target.shadow, k);
    mats.shadow.opacity += (target.shadowOpacity - mats.shadow.opacity) * k;
    gl.setClearColor(gl.getClearColor(clear).lerp(target.clear, k));
    three.invalidate();
  });

  // Big enough to fill the view at the backdrop's depth, with room to spare.
  const reach = (view.camZ - BACKDROP_Z) / (view.camZ - CAMERA.measureZ);
  const w = view.halfW * 2 * reach + 2;
  const h = view.halfH * 2 * reach + 2;

  return (
    <group ref={group}>
      <mesh material={mats.backdrop} position={[0, view.camY, BACKDROP_Z]} renderOrder={-1}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh material={mats.shadow} position={[0, view.camY, BACKDROP_Z + 0.004]} receiveShadow renderOrder={0}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh position={[0, view.camY, 0.4]} renderOrder={6}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial ref={veilMat} color={theme.veil} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

/* ─── Scene ────────────────────────────────────────────────────── */

interface SceneProps {
  layout: CaseLayout;
  textures: Map<string, PaneTexture>;
  detail: { id: string; texture: THREE.Texture } | null;
  rig: React.MutableRefObject<MuseumRig>;
  view: MuseumView | null;
  onView: (v: MuseumView) => void;
  hoveredId: string | null;
  selectedId: string | null;
  /** The selected pane whose photo the card is currently showing. */
  coveredId: string | null;
  lightsTarget: number;
  onHover: (item: MoodBoardItem | null) => void;
  onSelect: (item: MoodBoardItem) => void;
  onLanded: (item: MoodBoardItem) => void;
  onReturned: (item: MoodBoardItem) => void;
  theme: MuseumTheme;
}

const MuseumScene: React.FC<SceneProps> = ({
  layout,
  textures,
  detail,
  rig,
  view,
  onView,
  hoveredId,
  selectedId,
  coveredId,
  lightsTarget,
  onHover,
  onSelect,
  onLanded,
  onReturned,
  theme,
}) => {
  const assets = useMuseumAssets();
  const uniforms = useMemo<PaneUniforms>(
    () => ({ ...createCaseLightUniforms(), uCamPos: { value: new THREE.Vector3() } }),
    [],
  );
  const glow = useMemo<BackdropUniforms>(
    () => ({ uGlowPos: { value: [new THREE.Vector3(), new THREE.Vector3()] }, uGlowAmt: { value: [0, 0] } }),
    [],
  );
  const registry = useMemo<GlowRegistry>(() => new Map(), []);

  // The veil follows the selected pane out, and back.
  const veil = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => invalidate(), [selectedId, invalidate]);
  useFrame((three, dt) => {
    const to = selectedId ? 1 : 0;
    if (veil.current === to) return;
    veil.current = THREE.MathUtils.damp(veil.current, to, selectedId ? 3.2 : 4.5, Math.min(dt, 1 / 20));
    if (Math.abs(veil.current - to) < 0.001) veil.current = to;
    three.invalidate();
  });

  return (
    <>
      <CameraRig rig={rig} layout={layout} uniforms={uniforms} onView={onView} />
      <Lights rig={rig} view={view} uniforms={uniforms} lightsTarget={lightsTarget} layout={layout} />
      <StudioEnvironment />
      <HoverLights registry={registry} uniforms={uniforms} glow={glow} />

      <MuseumShelves layout={layout} uniforms={uniforms} />
      {view && <Surround rig={rig} view={view} uniforms={uniforms} glow={glow} veil={veil} theme={theme} />}

      {layout.panes.map((p) => (
        <GlassPane
          key={p.item.id}
          p={p}
          texture={textures.get(p.item.imageUrl)?.texture ?? null}
          detail={detail?.id === p.item.id ? detail.texture : null}
          assets={assets}
          uniforms={uniforms}
          rig={rig}
          registry={registry}
          hovered={hoveredId === p.item.id}
          selected={selectedId === p.item.id}
          covered={coveredId === p.item.id}
          interactive={!selectedId}
          onHover={onHover}
          onSelect={onSelect}
          onLanded={onLanded}
          onReturned={onReturned}
        />
      ))}
    </>
  );
};

export default MuseumScene;
