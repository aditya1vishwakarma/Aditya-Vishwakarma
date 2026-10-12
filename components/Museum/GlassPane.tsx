import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { MoodBoardItem } from '../../types';
import { CAMERA, PANE, SELECT } from './museumConfig';
import { selectedRect } from './selectedLayout';
import type { PanePlacement } from './museumLayout';
import { CASE_LIGHT_GLSL, type CaseLightUniforms } from './museumMaterials';
import type { MuseumAssets } from './useMuseumAssets';
import type { MuseumRig } from './museumView';

/* ─── Shaders ──────────────────────────────────────────────────── */

const PHOTO_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vCaseWorld;
  varying vec3 vNormalW;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vCaseWorld = wp.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

/**
 * The photograph, printed edge to edge on the glass.
 *
 * It is deliberately close to unlit, so the photo keeps its own colour. The
 * light above only lends it a faint warm cast, a little falloff toward its
 * foot and the brightness of where it stands. Selecting a pane lifts all three.
 */
const PHOTO_FRAG = /* glsl */ `
  #include <common>
  ${CASE_LIGHT_GLSL}
  uniform sampler2D map;
  uniform float uHasMap;
  uniform float uFit;
  uniform float uGlow;
  uniform float uSelect;
  uniform vec2 uSize;
  uniform vec3 uCamPos;
  varying vec2 vUv;
  varying vec3 vNormalW;

  void main() {
    // Cover-fit, so an image whose shape wasn't known at layout time crops rather than stretches.
    vec2 fit = vUv - 0.5;
    if (uFit > 1.0) fit.x /= uFit; else fit.y *= uFit;
    vec3 photo = uHasMap > 0.5 ? texture2D(map, fit + 0.5).rgb : vec3(0.36, 0.3, 0.24);
    float on = mix(0.05 + 0.95 * uLightsOn, 1.0, uSelect);

    float pool = clamp(0.84 + 0.2 * caseLight(vCaseWorld), 0.8, 1.04);
    float foot = mix(0.88, 1.0, smoothstep(0.0, 0.85, vUv.y));
    vec3 tint = vec3(1.0, 0.972, 0.93);
    vec3 col = photo * mix(tint * pool * foot, vec3(1.0), uSelect) * on;

    // The polished edge: a hairline of bright glass around the rim.
    vec2 m = min(vUv, 1.0 - vUv) * uSize;
    float d = min(m.x, m.y);
    float aa = fwidth(d);
    float rim = 1.0 - smoothstep(0.0, aa * 1.4, d);
    float top = 1.0 - smoothstep(0.0, 0.003 + aa * 1.5, (1.0 - vUv.y) * uSize.y);
    vec3 glass = vec3(0.93, 1.0, 0.96);
    col = mix(col, glass * (0.5 + 0.45 * on), rim * 0.5);
    col += glass * top * 0.2 * on * (1.0 - uSelect);

    // Sheen: a faint diagonal band that drifts as you walk the shelf,
    // and the brightening of glass seen at a glancing angle.
    vec3 V = normalize(uCamPos - vCaseWorld);
    float fres = pow(1.0 - max(dot(normalize(vNormalW), V), 0.0), 4.0);
    float s = fract((vCaseWorld.x - uCamPos.x * 0.55) * 0.7 + vCaseWorld.y * 0.85);
    float band = smoothstep(0.4, 0.5, s) * (1.0 - smoothstep(0.5, 0.64, s));
    col += vec3(1.0, 0.97, 0.92) * (fres * 0.35 + band * 0.04) * on * (1.0 - uSelect * 0.85);

    // Hover: the pane brightens a touch, warmest toward its foot where the
    // light comes from — never washed out, so the photo keeps its colour.
    float rise = exp(-vUv.y * 3.0);
    col *= 1.0 + uGlow * (0.035 + 0.05 * rise);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const EDGE_VERT = /* glsl */ `
  varying vec3 vObjN;
  varying vec3 vObjPos;
  varying vec3 vCaseWorld;
  void main() {
    vObjN = normal;
    vObjPos = position;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vCaseWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

/** The slab's thickness: green-tinged float glass, brightest where the downlights catch its top. */
const EDGE_FRAG = /* glsl */ `
  #include <common>
  ${CASE_LIGHT_GLSL}
  uniform float uGlow;
  uniform float uSelect;
  varying vec3 vObjN;
  varying vec3 vObjPos;

  void main() {
    vec3 n = vObjN;
    float on = mix(0.05 + 0.95 * uLightsOn, 1.0, uSelect);
    float L = caseLight(vCaseWorld) * on;
    float top = step(0.5, n.y);
    float bottom = step(0.5, -n.y);
    float side = step(0.5, abs(n.x));
    float back = step(0.5, -n.z);

    vec3 glass = vec3(0.7, 0.84, 0.77);
    vec3 col = glass * (top * (0.3 + 0.95 * L) + side * (0.14 + 0.38 * L) + bottom * 0.05 + back * 0.04);

    vec3 warm = vec3(1.0, 0.95, 0.86);
    col += warm * uGlow * (bottom * 0.5 + side * 0.22 * exp(-(vObjPos.y + 0.5) * 5.0));

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

/* ─── Pane ─────────────────────────────────────────────────────── */

/** Where each lit pane's glow is, so the scene can hang its two hover lights there. */
export type GlowRegistry = Map<string, { glow: number; pos: THREE.Vector3; floor: number }>;

export interface PaneUniforms extends CaseLightUniforms {
  uCamPos: { value: THREE.Vector3 };
}

interface Props {
  p: PanePlacement;
  texture: THREE.Texture | null;
  detail: THREE.Texture | null;
  assets: MuseumAssets;
  uniforms: PaneUniforms;
  rig: React.MutableRefObject<MuseumRig>;
  registry: GlowRegistry;
  hovered: boolean;
  selected: boolean;
  /** The selected card is showing this pane's photo in its place; step out of sight. */
  covered: boolean;
  interactive: boolean;
  onHover: (item: MoodBoardItem | null) => void;
  onSelect: (item: MoodBoardItem) => void;
  /** Called once the selected pane has come to rest in front of the shelf. */
  onLanded: (item: MoodBoardItem) => void;
  /** Called once the pane is home again after a selection. */
  onReturned: (item: MoodBoardItem) => void;
}

const _rest = new THREE.Vector3();
const _sel = new THREE.Vector3();
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const DRAG_PX = 6; // a press that travels further than this was a slide, not a click

const GlassPane: React.FC<Props> = ({
  p,
  texture,
  detail,
  assets,
  uniforms,
  rig,
  registry,
  hovered,
  selected,
  interactive,
  onHover,
  onSelect,
  covered,
  onLanded,
  onReturned,
}) => {
  const group = useRef<THREE.Group>(null!);
  const shadow = useRef<THREE.Mesh>(null!);
  const state = useRef({ glow: 0, sel: 0, wasAway: false, landed: false });

  const photoMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: PHOTO_VERT,
        fragmentShader: PHOTO_FRAG,
        uniforms: {
          ...uniforms,
          map: { value: null },
          uHasMap: { value: 0 },
          uFit: { value: 1 },
          uGlow: { value: 0 },
          uSelect: { value: 0 },
          uSize: { value: new THREE.Vector2(p.w, p.h) },
        },
        toneMapped: false,
      }),
    [uniforms, p.w, p.h],
  );

  const edgeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: EDGE_VERT,
        fragmentShader: EDGE_FRAG,
        uniforms: { ...uniforms, uGlow: photoMat.uniforms.uGlow, uSelect: photoMat.uniforms.uSelect },
        toneMapped: false,
      }),
    [uniforms, photoMat],
  );

  const decals = useMemo(() => {
    return {
      shadow: new THREE.MeshBasicMaterial({
        map: assets.softDisc,
        color: '#000000',
        transparent: true,
        opacity: p.stand ? 0.5 : 0.3,
        depthWrite: false,
      }),
    };
  }, [assets, p.stand]);

  // The scene only renders on demand, so anything that changes the picture asks for a frame.
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => invalidate(), [invalidate, hovered, selected, covered]);

  useEffect(() => {
    const tex = detail ?? texture;
    photoMat.uniforms.map.value = tex;
    photoMat.uniforms.uHasMap.value = tex ? 1 : 0;
    const img = tex?.image as { width?: number; height?: number; videoWidth?: number; videoHeight?: number } | undefined;
    const w = img?.videoWidth || img?.width || 0;
    const h = img?.videoHeight || img?.height || 0;
    photoMat.uniforms.uFit.value = w && h ? w / h / (p.w / p.h) : 1;
    invalidate();
  }, [photoMat, texture, detail, p.w, p.h, invalidate]);

  useEffect(
    () => () => {
      photoMat.dispose();
      edgeMat.dispose();
      Object.values(decals).forEach((m) => m.dispose());
      registry.delete(p.item.id);
    },
    [photoMat, edgeMat, decals, registry, p.item.id],
  );

  const lift = p.y - p.surfaceY;

  useFrame((three, dt) => {
    const s = state.current;
    const d = Math.min(dt, 1 / 20);
    const glowTo = hovered && !selected ? 1 : 0;
    const selTo = selected ? 1 : 0;
    const flying = s.sel !== selTo;
    s.glow = THREE.MathUtils.damp(s.glow, glowTo, hovered ? 7 : 4, d);
    s.sel = THREE.MathUtils.damp(s.sel, selTo, selected ? 4.2 : 5.2, d);
    if (Math.abs(s.glow - glowTo) < 0.0005) s.glow = glowTo;
    if (Math.abs(s.sel - selTo) < 0.0005) s.sel = selTo;
    // Keep frames coming until both have settled; a video plays on regardless.
    if (s.glow !== glowTo || s.sel !== selTo || (texture as THREE.VideoTexture | null)?.isVideoTexture) three.invalidate();
    // A pane on its way out (or back) drags its shadow with it. The hover lift is
    // too slight to see in a shadow, so it never costs a shadow redraw.
    if (flying) rig.current.shadowDirty = true;
    const e = ease(Math.min(1, s.sel * 1.02));

    // At rest; a hovered pane rises a touch.
    _rest.set(p.x, p.y + s.glow * (p.stand ? 0.004 : 0.008), p.z);

    let scale = 1;
    if (s.sel > 0) {
      // Selected: come forward to the exact rectangle the card will take over from.
      const { view } = rig.current;
      const cam = three.camera as THREE.PerspectiveCamera;
      const visH = 2 * SELECT.distance * Math.tan(((CAMERA.fov / 2) * Math.PI) / 180);
      const perPx = visH / view.height; // world metres per CSS px, at the pane's resting depth
      const rect = selectedRect(view, p.w / p.h);
      const k = (rect.width * perPx) / p.w;
      const cx = (rect.left + rect.width / 2 - view.width / 2) * perPx;
      const cy = (view.height / 2 - (rect.top + rect.height / 2)) * perPx;
      _sel.set(cam.position.x + cx, cam.position.y + cy - (p.h * k) / 2, cam.position.z - SELECT.distance);
      scale = 1 + (k - 1) * e;
      group.current.position.lerpVectors(_rest, _sel, e);
      group.current.position.y += Math.sin(e * Math.PI) * 0.06;
    } else {
      group.current.position.copy(_rest);
    }
    group.current.rotation.y = p.yaw * (1 - e) * (1 - s.glow * 0.35);
    group.current.scale.setScalar(scale);
    // While the selected card shows this photo, the pane steps out of the way so
    // it can't blur through the card's glass at the edges.
    group.current.visible = !covered;
    if (selected && e > 0.995 && !s.landed) {
      s.landed = true;
      onLanded(p.item);
    } else if (!selected) s.landed = false;

    if (s.sel > 0.02) s.wasAway = true;
    else if (s.wasAway && !selected) {
      s.wasAway = false;
      onReturned(p.item);
    }

    const away = 1 - Math.min(1, s.sel * 3);
    photoMat.uniforms.uGlow.value = s.glow;
    photoMat.uniforms.uSelect.value = e;
    photoMat.uniforms.uSize.value.set(p.w * scale, p.h * scale);
    (shadow.current.material as THREE.MeshBasicMaterial).opacity = (p.stand ? 0.5 : 0.3 / (1 + lift * 12)) * away * (0.25 + 0.75 * uniforms.uLightsOn.value);

    if (s.glow > 0.002) {
      const entry = registry.get(p.item.id) ?? { glow: 0, pos: new THREE.Vector3(), floor: p.surfaceY };
      entry.glow = s.glow;
      // Held up a little and out in front of the pane's foot, so the light spreads
      // across the shelf rather than pooling in one spot beneath it.
      entry.pos.set(group.current.position.x, group.current.position.y + 0.05, group.current.position.z + 0.08);
      registry.set(p.item.id, entry);
    } else registry.delete(p.item.id);
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (interactive) onHover(p.item);
  };
  const out = () => onHover(null);
  // A finger has no hover: light the pane the moment it lands instead. The page
  // clears it again when the finger lifts or starts a swipe.
  const press = (e: ThreeEvent<PointerEvent>) => {
    if (e.nativeEvent.pointerType === 'mouse' || !interactive) return;
    onHover(p.item);
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!interactive || e.delta > DRAG_PX) return;
    onSelect(p.item);
  };

  const T = PANE.thickness;
  return (
    <>
      <group ref={group}>
        <mesh geometry={assets.unitBox} material={edgeMat} position={[0, p.h / 2, 0]} scale={[p.w, p.h, T]} castShadow />
        <mesh
          geometry={assets.unitPlane}
          material={photoMat}
          position={[0, p.h / 2, T / 2 + 0.0004]}
          scale={[p.w, p.h, 1]}
          onPointerOver={over}
          onPointerOut={out}
          onPointerDown={press}
          onClick={click}
        />
      </group>

      {/* The contact shadow stays on the shelf when the pane leaves it. */}
      <mesh
        ref={shadow}
        geometry={assets.flatPlane}
        material={decals.shadow}
        position={[p.x, p.surfaceY + 0.0012, p.z - 0.01]}
        rotation={[0, p.yaw, 0]}
        scale={p.stand ? [p.w * 0.8, 1, 0.075] : [p.w + 0.07, 1, 0.13]}
        renderOrder={1}
      />
    </>
  );
};

export default React.memo(GlassPane);
