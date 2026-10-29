import * as THREE from 'three';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { TUFT_ATLAS } from './grass';
import { LEAF_ATLAS_SIZE } from './leafAtlas';
import { DRIFT } from './clouds';
import { DAISY_ATLAS, GROVE_ATLAS, RIVER, RIVER_WIDTH } from './scenery';
import { CAST_SUN_DIR, EVENING, MAX_LOBES, PALETTES, SCENE_COLOURS, SUN_DIR, type Ramp, type Season } from './mapleConfig';
import { BEARING, EYE } from './shot';
import { SWAY_GLSL } from './wind';

/**
 * How everything is painted.
 *
 * Nothing here is lit the physical way. Each surface works out one number —
 * how much light reaches it, from 0 in deep shade to 1 in full sun — and
 * looks that up in a ramp of four painted colours. So shadow is never just
 * darker: grass shades toward blue-green, maple leaves toward crimson, bark
 * toward violet, as a painter would mix them. The bands between the four are
 * soft but distinct, which is most of what makes it read as drawn.
 *
 * Shadow comes from the leaf masses themselves. Each is a sphere to the
 * shaders, and a point is in shade when any of them stands between it and
 * the sun — one shape, one flat tone, however many overlap, with a defined
 * edge, the way a shadow is painted. No shadow maps.
 *
 * All colour is worked in display space, straight from the hex values, and
 * written out untouched — what's in the palette is what's on screen.
 */

/** A hex colour as the shaders take it: display-space RGB, 0–1. */
export const rgb = (hex: string, out = new THREE.Vector3()) => {
  const c = new THREE.Color();
  c.setStyle(hex, THREE.LinearSRGBColorSpace);
  return out.set(c.r, c.g, c.b);
};
const ramp = (r: Ramp) => r.map((hex) => rgb(hex));

/* ─── Shared uniforms ──────────────────────────────────────────── */

export interface SceneUniforms {
  uTime: { value: number };
  uGust: { value: number };
  uSun: { value: THREE.Vector3 };
  /** The sun the tree's shadow on the grass is cast from. */
  uCastSun: { value: THREE.Vector3 };
  /** Leaf masses where they are this frame: centre, and radius in w. */
  uLobes: { value: THREE.Vector4[] };
  uLeaf: { value: THREE.Vector3[] };
  uLeafAlt: { value: THREE.Vector3[] };
  uGrass: { value: THREE.Vector3[] };
  uGrassPatch: { value: THREE.Vector3 };
  uGrove: { value: THREE.Vector3[] };
  /** The light: 0 the afternoon sun, 1 evening and the moon (dark mode). Every shader mixes by it. */
  uDusk: { value: number };
  uMoon: { value: THREE.Vector3 };
  /** The air the distance fades into, by day and in the evening. */
  uHaze: { value: THREE.Vector3 };
  uDuskHaze: { value: THREE.Vector3 };
}

export const createUniforms = (season: Season, dusk: boolean): SceneUniforms => {
  const p = PALETTES[season];
  return {
    uTime: { value: 0 },
    uGust: { value: 0 },
    uSun: { value: new THREE.Vector3(...SUN_DIR).normalize() },
    uCastSun: { value: new THREE.Vector3(...CAST_SUN_DIR).normalize() },
    // Unused masses sit far below the ground, where they shade nothing.
    uLobes: { value: Array.from({ length: MAX_LOBES }, () => new THREE.Vector4(0, -1e4, 0, 0.001)) },
    uLeaf: { value: ramp(p.leaf) },
    uLeafAlt: { value: ramp(p.leafAlt) },
    uGrass: { value: ramp(p.grass) },
    uGrassPatch: { value: rgb(p.grassPatch) },
    uGrove: { value: ramp(p.grove) },
    uDusk: { value: dusk ? 1 : 0 },
    uMoon: { value: rgb(EVENING.moon) },
    uHaze: { value: rgb(SCENE_COLOURS.haze) },
    uDuskHaze: { value: rgb(EVENING.haze) },
  };
};

/* ─── GLSL ─────────────────────────────────────────────────────── */

const NOISE_GLSL = /* glsl */ `
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
               mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm2(vec2 p) {
    float s = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      s += a * noise2(p);
      p = p * 2.03 + 17.1;
      a *= 0.5;
    }
    return s / 0.9375;
  }
  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }
  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), u.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), u.x), u.y),
      mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), u.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), u.x), u.y),
      u.z);
  }
`;

/**
 * Where a gust is passing through the grass: bands that lie across the wind
 * and roll downwind over the hills, where the blades bend over and catch the
 * light. Needs uTime, uGust and the noise above.
 */
const GUST_GLSL = /* glsl */ `
  float gustWave(vec2 p) {
    return smoothstep(0.55, 0.92, noise2(vec2((p.x - uTime * 3.4) * 0.16, p.y * 0.05 + 3.0))) * uGust;
  }
`;

/**
 * The river, as the ground paints it: how far a point lies from the water's
 * middle, and how far along the course, from one end (0) to the other (1).
 */
const RIVER_GLSL = /* glsl */ `
  #define RIVER_POINTS ${RIVER.points.length}
  uniform vec2 uRiver[RIVER_POINTS];
  uniform vec4 uRiverBox;
  uniform vec4 uRiverRing;
  uniform vec2 uRiverWidth;
  uniform float uRiverLevel;

  vec2 riverAt(vec2 p) {
    float best = 1e9;
    float along = 0.0;
    for (int i = 0; i < RIVER_POINTS - 1; i++) {
      vec2 a = uRiver[i];
      vec2 ab = uRiver[i + 1] - a;
      float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0);
      float d = length(p - a - ab * t);
      if (d < best) {
        best = d;
        along = (float(i) + t) / float(RIVER_POINTS - 1);
      }
    }
    return vec2(best, along);
  }
`;

/** Four painted colours, darkest first, and soft steps between them. */
const RAMP_GLSL = /* glsl */ `
  vec3 ramp(float x, vec3 c0, vec3 c1, vec3 c2, vec3 c3) {
    vec3 c = mix(c0, c1, smoothstep(0.2, 0.3, x));
    c = mix(c, c2, smoothstep(0.46, 0.56, x));
    return mix(c, c3, smoothstep(0.78, 0.88, x));
  }
`;

/**
 * Evening (dark mode): the sun gone down, and the land lit by the moon. The
 * moon lights nothing gold: whatever the sun lit brightest steps down its
 * ramp toward the middle, while the middle tones and the shade keep their
 * own colours, so the maple stays orange and crimson, the grass green, and
 * each keeps its light and shade. Then the moon's colour over the lot,
 * dimmer and a little cooler. Nothing changes its colour; it's only seen in
 * less light. And the haze the distance fades into: pale blue by day, the
 * sunset's in the evening.
 */
const DUSK_GLSL = /* glsl */ `
  uniform float uDusk;
  uniform vec3 uMoon;
  uniform vec3 uHaze;
  uniform vec3 uDuskHaze;

  float duskLight(float L) {
    return L - 0.25 * uDusk * smoothstep(0.45, 1.0, L);
  }
  vec3 duskTone(vec3 col) {
    return col * mix(vec3(1.0), uMoon, uDusk);
  }
  vec3 haze() {
    return mix(uHaze, uDuskHaze, uDusk);
  }
`;

/**
 * The light left at `p` once the leaf masses have had their say: 1 in sun,
 * low where any mass stands in its way. A mass doesn't shade itself (`self`)
 * — the turn of its own surface already does that — and foliage is never
 * wholly opaque.
 */
const LOBES_GLSL = /* glsl */ `
  #define MAX_LOBES ${MAX_LOBES}
  uniform vec3 uSun;
  uniform vec4 uLobes[MAX_LOBES];

  float lobeShadow(vec3 p, float self) {
    float cover = 0.0;
    for (int i = 0; i < MAX_LOBES; i++) {
      if (abs(float(i) - self) < 0.5) continue;
      vec4 b = uLobes[i];
      vec3 oc = b.xyz - p;
      float t = dot(oc, uSun);
      if (t <= 0.0) continue;
      float miss = length(oc - uSun * t) / b.w;
      cover = max(cover, 1.0 - smoothstep(0.62, 0.96, miss));
    }
    return 1.0 - 0.78 * cover;
  }
`;

/**
 * The crown's shadow on the grass, 0 in sun to 1 in full shade: one shape,
 * its edge wavering like leaves. It's cast as if onto level ground at the
 * tree's foot, from a sun a little higher than the one lighting the scene,
 * so it pools under the crown as a noon shadow does and the knoll falling
 * away never drags it out of shape. Inside it, small round spots of sun
 * where light finds a way through the leaves, shimmering as they move.
 * Needs the lobes, the noise and uTime.
 */
const CAST_GLSL = /* glsl */ `
  uniform vec3 uCastSun;
  uniform vec3 uShadowCentre;
  uniform float uShadowReach;

  float crownShadow(vec2 xz) {
    vec2 rel = xz - uShadowCentre.xz;
    if (dot(rel, rel) > uShadowReach * uShadowReach) return 0.0;
    vec3 q = vec3(xz.x, 0.0, xz.y);
    float edge = (noise2(xz * 2.4) - 0.5) * 0.16 + (noise2(xz * 6.3 + 4.1) - 0.5) * 0.07;
    float cover = 0.0;
    for (int i = 0; i < MAX_LOBES; i++) {
      vec4 b = uLobes[i];
      vec3 oc = b.xyz - q;
      float t = dot(oc, uCastSun);
      if (t <= 0.0) continue;
      float miss = length(oc - uCastSun * t) / b.w + edge;
      cover = max(cover, 1.0 - smoothstep(0.84, 0.9, miss));
    }
    return cover;
  }

  float dapple(vec2 xz) {
    vec2 g = xz / 0.55;
    vec2 cell = floor(g);
    float h = hash12(cell);
    if (h > 0.42) return 0.0;
    vec2 at = 0.22 + 0.56 * vec2(hash12(cell + 7.1), hash12(cell + 3.7));
    float r = (0.08 + 0.1 * hash12(cell + 1.3)) * (0.9 + 0.1 * sin(uTime * 2.2 + h * 40.0));
    return 1.0 - smoothstep(r - 0.03, r, length(fract(g) - at));
  }

  float groundShade(vec2 xz) {
    float shade = crownShadow(xz);
    return shade * (1.0 - 0.85 * dapple(xz) * smoothstep(0.5, 1.0, shade));
  }

  // How much light the grass gets. The hills are gentle and the sun is high,
  // so every slope meets it at much the same angle: stretch what difference
  // there is, so a slope turned toward the sun reads lighter than one turned
  // away — but keep that within the light tones, so only a real shadow is
  // ever painted dark.
  float grassLight(vec3 normal, float shade) {
    float form = smoothstep(0.45, 1.0, dot(normalize(normal), uSun));
    return mix(mix(0.56, 0.9, form), 0.36, 0.8 * shade);
  }
`;

/* ─── Leaves ───────────────────────────────────────────────────── */

/**
 * The crown: every card turned to face the eye and shaded by its mass, the
 * leaf shapes kept full as their texture shrinks into its mipmaps. The cards
 * flutter together, in a slow wave across the crown, so neighbouring leaves
 * turn as one and never open and shut gaps between them.
 */
export function makeLeafMaterial(u: SceneUniforms, atlas: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: { ...u, uAtlas: { value: atlas } },
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute vec3 aCenter;
      attribute vec3 aNormal;
      attribute vec4 aLeaf;  // size, roll, a random number, atlas tile
      attribute vec3 aShade; // ambient occlusion, which mass, which clump
      ${SWAY_GLSL}
      ${LOBES_GLSL}
      varying vec2 vUv;
      varying vec3 vLight;
      varying float vRand;
      varying float vClump;

      void main() {
        vec3 c = aCenter + sway(aCenter);
        // Each card flutters a little about its own centre, more as a gust blows,
        // in step with its neighbours.
        float wave = uTime * (3.2 + aLeaf.z * 0.6) + dot(aCenter, vec3(1.3, 0.9, 1.1)) + aLeaf.z * 1.5;
        float roll = aLeaf.y + sin(wave) * (0.05 + 0.2 * uGust);
        vec2 corner = position.xy;
        vec4 mv = modelViewMatrix * vec4(c, 1.0);
        mv.xy += mat2(cos(roll), sin(roll), -sin(roll), cos(roll)) * corner * aLeaf.x;
        gl_Position = projectionMatrix * mv;

        vUv = (vec2(mod(aLeaf.w, 2.0), floor(aLeaf.w / 2.0)) + corner + 0.5) * 0.5;
        vLight = vec3(dot(aNormal, uSun), lobeShadow(c, aShade.y), aShade.x);
        vRand = aLeaf.z;
        vClump = aShade.z;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uAtlas;
      uniform vec3 uLeaf[4];
      uniform vec3 uLeafAlt[4];
      varying vec2 vUv;
      varying vec3 vLight;
      varying float vRand;
      varying float vClump;
      ${RAMP_GLSL}
      ${DUSK_GLSL}

      void main() {
        vec4 tex = texture2D(uAtlas, vUv);
        vec2 texel = vUv * ${LEAF_ATLAS_SIZE.toFixed(1)};
        float mip = max(0.0, 0.5 * log2(max(dot(dFdx(texel), dFdx(texel)), dot(dFdy(texel), dFdy(texel)))));
        if (tex.a * (1.0 + mip * 0.22) < 0.5) discard;

        float direct = clamp((vLight.x + 0.45) / 1.45, 0.0, 1.0) * mix(0.25, 1.0, vLight.y);
        float L = mix(0.2, 1.0, direct) * mix(0.3, 1.0, vLight.z);
        // No two leaves quite alike: a nudge per card, and per leaf within it.
        float id = tex.g;
        L += (id - 0.5) * 0.09 + (vRand - 0.5) * 0.06;
        L = duskLight(L * (0.55 + 0.47 * tex.r));
        float hue = smoothstep(0.5, 0.9, fract(id * 3.7 + vRand * 1.3));
        vec3 col = mix(ramp(L, uLeaf[0], uLeaf[1], uLeaf[2], uLeaf[3]),
                       ramp(L, uLeafAlt[0], uLeafAlt[1], uLeafAlt[2], uLeafAlt[3]), hue);
        // Which clump this is, in alpha, for the ink pass: leaves are even numbers, anything else 255.
        gl_FragColor = vec4(duskTone(col), (vClump + 1.0) * 2.0 / 255.0);
      }
    `,
  });
}

/**
 * The heart of each leaf mass: a dark ball of foliage inside it, swaying with
 * it, so wherever the leaves part the eye meets more leaves in shade, never a
 * pinhole of sky that would twinkle as the crown moves.
 */
export function makeCoreMaterial(u: SceneUniforms) {
  return new THREE.ShaderMaterial({
    uniforms: { ...u },
    vertexShader: /* glsl */ `
      ${SWAY_GLSL}
      varying vec3 vWorld;
      varying vec3 vNormal;

      void main() {
        vec3 centre = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        vWorld = (instanceMatrix * vec4(position, 1.0)).xyz + sway(centre);
        vNormal = normalize(mat3(instanceMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uLeaf[4];
      varying vec3 vWorld;
      varying vec3 vNormal;
      ${NOISE_GLSL}
      ${LOBES_GLSL}
      ${RAMP_GLSL}
      ${DUSK_GLSL}

      void main() {
        float direct = clamp((dot(normalize(vNormal), uSun) + 0.45) / 1.45, 0.0, 1.0) * mix(0.25, 1.0, lobeShadow(vWorld, -1.0));
        // Deep in the crown it's all shade, broken up a little like leaves.
        float L = duskLight(mix(0.2, 1.0, direct) * 0.5 * (0.85 + 0.3 * noise3(vWorld * 2.5)));
        gl_FragColor = vec4(duskTone(ramp(L, uLeaf[0], uLeaf[1], uLeaf[2], uLeaf[3])), 1.0);
      }
    `,
  });
}

/** A leaf blown free: a cupped blade, lit on whichever face meets the sun and glowing through the other. */
export function makeLooseLeafMaterial(u: SceneUniforms, atlas: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...u,
      uAtlas: { value: atlas },
      uTint: { value: 0 },
      uShadow: { value: 1 },
      uBend: { value: 0.35 },
      uFlutter: { value: 0 },
      uSeed: { value: 0 },
    },
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uBend;
      uniform float uFlutter;
      uniform float uSeed;
      varying vec2 vUv;
      varying vec3 vNormalW;

      void main() {
        vec3 p = position;
        // Cupped along the midrib, and rippling as it's buffeted.
        float k = uBend;
        float ripple = sin(uTime * 9.0 + uSeed * 20.0 + p.y * 5.0) * 0.06 * uFlutter;
        p.z += k * p.x * p.x + ripple * (p.y + 0.5);
        vec3 n = normalize(vec3(-2.0 * k * p.x, -0.3 * ripple, 1.0));
        vNormalW = normalize(mat3(modelMatrix) * n);
        vUv = uv * 0.5;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uAtlas;
      uniform vec3 uSun;
      uniform vec3 uLeaf[4];
      uniform vec3 uLeafAlt[4];
      uniform float uTint;
      uniform float uShadow;
      varying vec2 vUv;
      varying vec3 vNormalW;
      ${RAMP_GLSL}
      ${DUSK_GLSL}

      void main() {
        vec4 tex = texture2D(uAtlas, vUv);
        vec2 texel = vUv * ${LEAF_ATLAS_SIZE.toFixed(1)};
        float mip = max(0.0, 0.5 * log2(max(dot(dFdx(texel), dFdx(texel)), dot(dFdy(texel), dFdy(texel)))));
        if (tex.a * (1.0 + mip * 0.22) < 0.5) discard;
        vec3 n = normalize(vNormalW) * (gl_FrontFacing ? 1.0 : -1.0);
        float ndl = dot(n, uSun);
        // A leaf is thin: sun on one face shows through the other. Out in the
        // open the whole bright sky lights it too, so it never goes dark.
        float direct = clamp(max(ndl, -ndl * 0.45), 0.0, 1.0) * mix(0.3, 1.0, uShadow);
        float L = duskLight(mix(0.46, 1.02, direct) * (0.55 + 0.47 * tex.r));
        vec3 col = mix(ramp(L, uLeaf[0], uLeaf[1], uLeaf[2], uLeaf[3]),
                       ramp(L, uLeafAlt[0], uLeafAlt[1], uLeafAlt[2], uLeafAlt[3]), uTint);
        // The underside is paler.
        if (!gl_FrontFacing) col = mix(col, uLeafAlt[3], 0.14);
        gl_FragColor = vec4(duskTone(col), 1.0);
      }
    `,
  });
}

/* ─── Wood ─────────────────────────────────────────────────────── */

export function makeWoodMaterial(u: SceneUniforms) {
  return new THREE.ShaderMaterial({
    uniforms: { ...u, uBark: { value: ramp(SCENE_COLOURS.bark) } },
    vertexShader: /* glsl */ `
      attribute vec2 aBark;
      ${SWAY_GLSL}
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying vec2 vBark;

      void main() {
        vec4 w = modelMatrix * vec4(position + sway(position), 1.0);
        vWorld = w.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        vBark = aBark;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uBark[4];
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying vec2 vBark;
      ${NOISE_GLSL}
      ${LOBES_GLSL}
      ${RAMP_GLSL}
      ${DUSK_GLSL}

      void main() {
        vec3 n = normalize(vNormal);
        float direct = clamp((dot(n, uSun) + 0.3) / 1.3, 0.0, 1.0);
        float sh = lobeShadow(vWorld, -1.0);
        // Flecks of sun that find their way down through the leaves.
        float fleck = smoothstep(0.72, 0.82, noise3(vWorld * 9.0 + vec3(uTime * 0.35, 0.0, uTime * 0.1)));
        sh = max(sh, fleck * 0.45);
        float L = mix(0.22, 1.0, direct * sh);
        // Bark runs in long ridges up the trunk and along every limb.
        L *= 0.86 + 0.26 * noise2(vec2(vBark.y * 24.0, vBark.x * 1.7));
        // Darker where the roots go into the grass.
        L *= mix(0.6, 1.0, smoothstep(-0.15, 0.7, vWorld.y));
        gl_FragColor = vec4(duskTone(ramp(duskLight(L), uBark[0], uBark[1], uBark[2], uBark[3])), 1.0);
      }
    `,
  });
}

/* ─── Ground ───────────────────────────────────────────────────── */

/**
 * The grass. Painted in soft patches; the tree's shadow pooled beneath it,
 * spotted with sun; and in a gust, brighter bands running through it as the
 * blades bend and catch the light.
 */
export function makeGroundMaterial(u: SceneUniforms, shadowCentre: THREE.Vector3, shadowReach: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...u,
      uRiver: { value: RIVER.points },
      uRiverBox: { value: RIVER.box },
      uRiverRing: { value: RIVER.ring },
      uRiverWidth: { value: new THREE.Vector2(...RIVER_WIDTH) },
      uRiverLevel: { value: RIVER.level },
      uWater: { value: SCENE_COLOURS.water.map((c) => rgb(c)) },
      uDuskWater: { value: EVENING.water.map((c) => rgb(c)) },
      uShadowCentre: { value: shadowCentre },
      uShadowReach: { value: shadowReach },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      varying vec3 vNormal;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        vNormal = normal;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uGust;
      uniform vec3 uGrass[4];
      uniform vec3 uGrassPatch;
      uniform vec3 uWater[3];
      uniform vec3 uDuskWater[3];
      varying vec3 vWorld;
      varying vec3 vNormal;
      ${NOISE_GLSL}
      ${GUST_GLSL}
      ${LOBES_GLSL}
      ${CAST_GLSL}
      ${RIVER_GLSL}
      ${RAMP_GLSL}
      ${DUSK_GLSL}

      void main() {
        float shade = groundShade(vWorld.xz);
        float foot = smoothstep(0.4, 1.8, length(vWorld.xz));
        float wave = gustWave(vWorld.xz);

        float L = grassLight(vNormal, shade) * mix(0.72, 1.0, foot);
        float dist = distance(vWorld, cameraPosition);
        float mottle = fbm2(vWorld.xz * 0.09);
        L = duskLight(L + (mottle - 0.5) * 0.09 + wave * 0.12);

        vec3 col = ramp(L, uGrass[0], uGrass[1], uGrass[2], uGrass[3]);
        col = mix(col, uGrassPatch, smoothstep(0.55, 0.8, mottle) * 0.3 * (1.0 - shade));
        col = duskTone(col);

        // The river: water where it runs, a darker line of bank either side, and
        // a glint of sky down its middle — only on the level plain, never up a slope.
        float away = distance(vWorld.xz, uRiverRing.xy);
        if (away > uRiverRing.z && away < uRiverRing.w &&
            all(greaterThan(vWorld.xz, uRiverBox.xy)) && all(lessThan(vWorld.xz, uRiverBox.zw))) {
          vec2 r = riverAt(vWorld.xz);
          float across = mix(uRiverWidth.y, uRiverWidth.x, r.y);
          float level = 1.0 - smoothstep(uRiverLevel + 0.3, uRiverLevel + 0.7, vWorld.y);
          float edge = max(fwidth(r.x), 0.05);
          float bank = (1.0 - smoothstep(0.0, max(0.6, edge * 1.5), abs(r.x - across - 0.35))) * level;
          col = mix(col, col * 0.72, bank * 0.7);
          float water = (1.0 - smoothstep(across - edge, across + edge, r.x)) * level;
          // In the evening it mirrors the sunset instead of the blue.
          vec3 wet = mix(mix(uWater[0], uDuskWater[0], uDusk), mix(uWater[1], uDuskWater[1], uDusk), smoothstep(0.0, 0.7, 1.0 - r.x / across));
          wet = mix(wet, mix(uWater[2], uDuskWater[2], uDusk), (1.0 - smoothstep(0.0, across * 0.3, r.x)) * 0.55);
          col = mix(col, wet, water);
        }
        col = mix(col, haze(), smoothstep(30.0, 220.0, dist) * 0.62);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/**
 * The tufts: upright, turned to the eye, lit as the ground they stand on and
 * shaded by the tree, their tips bending downwind — a little always, and
 * over in the gust bands as they pass.
 */
export function makeTuftMaterial(u: SceneUniforms, atlas: THREE.Texture, shadowCentre: THREE.Vector3, shadowReach: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...u,
      uAtlas: { value: atlas },
      uShadowCentre: { value: shadowCentre },
      uShadowReach: { value: shadowReach },
    },
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute vec3 aBase;
      attribute vec3 aNormal;
      attribute vec4 aTuft; // height, atlas cell, a random number, width
      uniform float uTime;
      uniform float uGust;
      ${NOISE_GLSL}
      ${GUST_GLSL}
      ${LOBES_GLSL}
      ${CAST_GLSL}
      varying vec2 vUv;
      varying float vLight;
      varying float vHaze;
      varying float vRand;

      void main() {
        vec3 toEye = cameraPosition - aBase;
        vec3 right = normalize(vec3(toEye.z, 0.0, -toEye.x));
        float h = aTuft.x;
        vec2 c = position.xy;
        float wave = gustWave(aBase.xz);
        float bend = 0.06 + 0.04 * sin(uTime * 1.9 + aBase.x * 0.35 + aBase.z * 0.2) + 0.1 * uGust + 0.45 * wave;
        vec3 p = aBase + right * c.x * h * aTuft.w + vec3(0.0, c.y * h, 0.0);
        p.x += bend * h * c.y * c.y;
        p.y -= 0.3 * bend * bend * h * c.y;
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        vUv = vec2((aTuft.y + c.x + 0.5) / ${TUFT_ATLAS.tufts.toFixed(1)}, c.y);

        vLight = grassLight(aNormal, groundShade(aBase.xz)) + 0.12 * wave;
        vHaze = smoothstep(30.0, 220.0, distance(aBase, cameraPosition)) * 0.62;
        vRand = aTuft.z;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uAtlas;
      uniform vec3 uGrass[4];
      varying vec2 vUv;
      varying float vLight;
      varying float vHaze;
      varying float vRand;
      ${RAMP_GLSL}
      ${DUSK_GLSL}

      void main() {
        vec4 tex = texture2D(uAtlas, vUv);
        vec2 texel = vUv * vec2(${TUFT_ATLAS.width.toFixed(1)}, ${TUFT_ATLAS.height.toFixed(1)});
        float mip = max(0.0, 0.5 * log2(max(dot(dFdx(texel), dFdx(texel)), dot(dFdy(texel), dFdy(texel)))));
        if (tex.a * (1.0 + mip * 0.3) < 0.5) discard;
        float L = duskLight(vLight + (tex.r - 0.65) * 0.5 + (tex.g - 0.5) * 0.08 + (vRand - 0.5) * 0.06);
        vec3 col = mix(duskTone(ramp(L, uGrass[0], uGrass[1], uGrass[2], uGrass[3])), haze(), vHaze);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/**
 * Daisies: petals round a yellow eye — white, or out on the far hill a
 * pastel pink or yellow — lit as the grass they stand in, on green stems;
 * their heads nod in the breeze and lean over as the gust bands run through.
 * Far ones fade into the haze like everything else.
 */
export function makeDaisyMaterial(u: SceneUniforms, atlas: THREE.Texture, shadowCentre: THREE.Vector3, shadowReach: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...u,
      uAtlas: { value: atlas },
      uPetal: { value: SCENE_COLOURS.petal.flat().map((c) => rgb(c)) },
      uEye: { value: SCENE_COLOURS.daisyEye.map((c) => rgb(c)) },
      uShadowCentre: { value: shadowCentre },
      uShadowReach: { value: shadowReach },
      uSwayShare: { value: 1 },
    },
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute vec3 aBase;
      attribute vec3 aNormal;
      attribute vec4 aFlower; // height, atlas tile, a random number, width
      attribute float aSway;  // 1 for a daisy that sways, 0 for one that stands still
      attribute float aPetal; // its petals: 0 white, 1 pink, 2 yellow
      uniform vec3 uPetal[${SCENE_COLOURS.petal.length * 2}]; // each colour in shade, then in sun
      uniform float uTime;
      uniform float uGust;
      // Of the daisies that sway, the share still swaying: all at home, a few beside a pane. Each eases to a stand
      // as the share passes its random number, so the field calms a flower at a time rather than all at once.
      uniform float uSwayShare;
      ${NOISE_GLSL}
      ${GUST_GLSL}
      ${LOBES_GLSL}
      ${CAST_GLSL}
      varying vec2 vUv;
      varying float vLight;
      varying float vHaze;
      varying vec3 vPetalShade;
      varying vec3 vPetalSun;

      void main() {
        int k = int(aPetal + 0.5) * 2;
        vPetalShade = uPetal[k];
        vPetalSun = uPetal[k + 1];
        vec3 toEye = cameraPosition - aBase;
        vec3 right = normalize(vec3(toEye.z, 0.0, -toEye.x));
        float h = aFlower.x;
        vec2 c = position.xy;
        float wave = gustWave(aBase.xz);
        float sways = aSway * (1.0 - smoothstep(uSwayShare, uSwayShare + 0.03, aFlower.z));
        float bend = sways * (0.07 * sin(uTime * 2.3 + aFlower.z * 9.0 + aBase.x * 0.4) + 0.08 * uGust + 0.4 * wave);
        vec3 p = aBase + right * c.x * h * aFlower.w + vec3(0.0, c.y * h, 0.0);
        p.x += bend * h * c.y * c.y;
        p.y -= 0.3 * bend * bend * h * c.y;
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        vUv = vec2((aFlower.y + c.x + 0.5) / ${DAISY_ATLAS.tiles.toFixed(1)}, c.y);
        vLight = grassLight(aNormal, groundShade(aBase.xz)) + 0.1 * wave;
        vHaze = smoothstep(30.0, 220.0, distance(aBase, cameraPosition)) * 0.62;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uAtlas;
      uniform vec3 uGrass[4];
      uniform vec3 uEye[2];
      varying vec2 vUv;
      varying float vLight;
      varying float vHaze;
      varying vec3 vPetalShade;
      varying vec3 vPetalSun;
      ${RAMP_GLSL}
      ${DUSK_GLSL}

      void main() {
        vec4 tex = texture2D(uAtlas, vUv);
        vec2 texel = vUv * vec2(${DAISY_ATLAS.width.toFixed(1)}, ${DAISY_ATLAS.height.toFixed(1)});
        float mip = max(0.0, 0.5 * log2(max(dot(dFdx(texel), dFdx(texel)), dot(dFdy(texel), dFdy(texel)))));
        if (tex.a * (1.0 + mip * 0.3) < 0.5) discard;
        float L = duskLight(vLight * (0.6 + 0.45 * tex.r));
        float lit = smoothstep(0.35, 0.8, L);
        vec3 col = tex.g < 0.35 ? ramp(L, uGrass[0], uGrass[1], uGrass[2], uGrass[3])
                 : tex.g < 0.75 ? mix(vPetalShade, vPetalSun, lit)
                 : mix(uEye[0], uEye[1], lit);
        // Flowers are too small to ink: 253 in alpha tells the ink pass to leave them be.
        gl_FragColor = vec4(mix(duskTone(col), haze(), vHaze), 253.0 / 255.0);
      }
    `,
  });
}

/**
 * Trees far off across the plain: flat painted shapes, light up and to the
 * left, set into the haze by distance. Some are evergreen; the rest turn
 * with the season.
 */
export function makeGroveMaterial(u: SceneUniforms, atlas: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...u,
      uAtlas: { value: atlas },
      uEvergreen: { value: ramp(SCENE_COLOURS.evergreen) },
    },
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute vec3 aBase;
      attribute vec4 aTree; // height, atlas tile, how far it turns with the season, width
      varying vec2 vUv;
      varying float vTurn;
      varying float vHaze;

      void main() {
        vec3 toEye = cameraPosition - aBase;
        vec3 right = normalize(vec3(toEye.z, 0.0, -toEye.x));
        vec2 c = position.xy;
        vec3 p = aBase + right * c.x * aTree.x * aTree.w + vec3(0.0, c.y * aTree.x, 0.0);
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        vUv = vec2((aTree.y + c.x + 0.5) / ${GROVE_ATLAS.tiles.toFixed(1)}, c.y);
        vTurn = aTree.z;
        vHaze = smoothstep(30.0, 220.0, distance(aBase, cameraPosition)) * 0.48;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uAtlas;
      uniform vec3 uEvergreen[4];
      uniform vec3 uGrove[4];
      varying vec2 vUv;
      varying float vTurn;
      varying float vHaze;
      ${RAMP_GLSL}
      ${DUSK_GLSL}

      void main() {
        vec4 tex = texture2D(uAtlas, vUv);
        vec2 texel = vUv * vec2(${GROVE_ATLAS.width.toFixed(1)}, ${GROVE_ATLAS.height.toFixed(1)});
        float mip = max(0.0, 0.5 * log2(max(dot(dFdx(texel), dFdx(texel)), dot(dFdy(texel), dFdy(texel)))));
        if (tex.a * (1.0 + mip * 0.25) < 0.5) discard;
        float L = duskLight(0.16 + 0.8 * tex.r);
        vec3 col = mix(ramp(L, uEvergreen[0], uEvergreen[1], uEvergreen[2], uEvergreen[3]),
                       ramp(L, uGrove[0], uGrove[1], uGrove[2], uGrove[3]), smoothstep(0.3, 0.6, vTurn));
        gl_FragColor = vec4(mix(duskTone(col), haze(), vHaze), 1.0);
      }
    `,
  });
}

/** A far ridge: one flat colour, paler toward its foot where the haze lies in the valleys. */
export function makeRidgeMaterial(u: SceneUniforms, colour: string, mist: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...u,
      uColour: { value: rgb(colour) },
      uMist: { value: mist },
    },
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColour;
      uniform float uMist;
      varying vec3 vWorld;
      ${DUSK_GLSL}
      void main() {
        float m = (1.0 - smoothstep(-6.0, 16.0, vWorld.y)) * uMist;
        gl_FragColor = vec4(mix(duskTone(uColour), haze(), m), 1.0);
      }
    `,
  });
}

/* ─── Sky ──────────────────────────────────────────────────────── */

/**
 * Noon: a clear wash from deep blue overhead to a softer blue at the horizon.
 * In the evening, a sunset's: coral along the hills, up through apricot and
 * peach to lavender overhead. The clouds are cards of their own.
 */
export function makeSkyMaterial(u: SceneUniforms) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uZenith: { value: rgb(SCENE_COLOURS.skyZenith) },
      uMid: { value: rgb(SCENE_COLOURS.skyMid) },
      uHorizon: { value: rgb(SCENE_COLOURS.skyHorizon) },
      uBearing: { value: BEARING },
      uDusk: u.uDusk,
      uDuskSky: { value: EVENING.sky.map(([, c]) => rgb(c)) },
      uDuskAt: { value: EVENING.sky.map(([el]) => el) },
    },
    side: THREE.BackSide,
    // Drawn after everything solid, at the very back, so it's painted only
    // where nothing stands in front of it.
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position.z = gl_Position.w;
      }
    `,
    fragmentShader: /* glsl */ `
      #define DUSK_STOPS ${EVENING.sky.length}
      uniform vec3 uZenith;
      uniform vec3 uMid;
      uniform vec3 uHorizon;
      uniform float uBearing;
      uniform float uDusk;
      uniform vec3 uDuskSky[DUSK_STOPS];
      uniform float uDuskAt[DUSK_STOPS];
      varying vec3 vDir;
      ${NOISE_GLSL}

      void main() {
        vec3 d = normalize(vDir);
        float el = degrees(asin(clamp(d.y, -1.0, 1.0)));
        // Azimuth measured from the shot's own line, so the wash keeps its place in the frame.
        float az = mod(degrees(atan(d.x, -d.z)) - uBearing + 540.0, 360.0) - 180.0;
        // Blue soon after the horizon, so the middle of the frame isn't a white haze.
        vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 9.0, el));
        col = mix(col, uZenith, smoothstep(5.0, 38.0, el));
        // The evening's, each colour easing into the next as the sky rises.
        vec3 eve = uDuskSky[0];
        for (int i = 1; i < DUSK_STOPS; i++) eve = mix(eve, uDuskSky[i], smoothstep(uDuskAt[i - 1], uDuskAt[i], el));
        col = mix(col, eve, uDusk);
        // A painted wash is never perfectly even.
        col *= 1.0 + (fbm2(vec2(az, el) * 0.05) - 0.5) * 0.05;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/**
 * The clouds' layers: each card turned to face the eye and slowly turning on
 * itself, seen at 0.8 opacity as the CSS clouds' layers are. White toward the
 * cloud's top and grey-blue in its underside; each layer lit from above
 * whichever way it has turned, its billows bright at heart and greyer at the
 * seams. Laid over the sky without touching its alpha, which tells the
 * crown's clumps apart for the ink.
 */
export function makeCloudMaterial(u: SceneUniforms, atlas: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: u.uTime,
      uDusk: u.uDusk,
      uAtlas: { value: atlas },
      uCloud: { value: rgb(SCENE_COLOURS.cloud) },
      uCloudShade: { value: rgb(SCENE_COLOURS.cloudShade) },
      uDuskCloud: { value: rgb(EVENING.cloud) },
      uDuskCloudShade: { value: rgb(EVENING.cloudShade) },
      uEye: { value: EYE },
      uDriftRight: { value: DRIFT.right },
      uDriftSpan: { value: DRIFT.span },
      uDriftSpeed: { value: DRIFT.speed },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
    vertexShader: /* glsl */ `
      attribute vec3 aCloud;
      attribute vec3 aOffset;
      attribute vec4 aPuff;    // size, angle, how fast it turns, atlas tile
      attribute float aHeight; // 0 at the cloud's base, 1 at its top
      uniform float uTime;
      uniform vec3 uEye;
      uniform vec3 uDriftRight;
      uniform float uDriftSpan;
      uniform float uDriftSpeed;
      varying vec2 vUv;
      varying float vHeight;
      varying float vUp;

      void main() {
        // The cloud drifts across the shot with the wind, and comes round again.
        float across = dot(aCloud - uEye, uDriftRight);
        float drifted = mod(across + uTime * uDriftSpeed + uDriftSpan, 2.0 * uDriftSpan) - uDriftSpan;
        vec4 mv = modelViewMatrix * vec4(aCloud + uDriftRight * (drifted - across) + aOffset, 1.0);
        float turn = aPuff.y + uTime * aPuff.z;
        vec2 off = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * position.xy;
        mv.xy += off * aPuff.x;
        gl_Position = projectionMatrix * mv;
        vUv = (vec2(mod(aPuff.w, 2.0), floor(aPuff.w / 2.0)) + position.xy + 0.5) * 0.5;
        vHeight = aHeight;
        vUp = off.y;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uAtlas;
      uniform float uDusk;
      uniform vec3 uCloud;
      uniform vec3 uCloudShade;
      uniform vec3 uDuskCloud;
      uniform vec3 uDuskCloudShade;
      varying vec2 vUv;
      varying float vHeight;
      varying float vUp;

      void main() {
        vec4 tex = texture2D(uAtlas, vUv); // r: how light, g: how much cloud
        float light = smoothstep(0.0, 1.0, 0.14 + 0.55 * vHeight + 0.35 * vUp + (tex.r - 0.84) * 2.6);
        vec3 col = mix(uCloudShade, uCloud, light);
        // In the evening the light comes from below, from the sun gone down behind the hills.
        float glow = smoothstep(0.0, 1.0, 0.8 - 0.6 * vHeight - 0.35 * vUp + (tex.r - 0.84) * 2.6);
        col = mix(col, mix(uDuskCloudShade, uDuskCloud, glow), uDusk);
        gl_FragColor = vec4(col, tex.g * 0.8);
      }
    `,
  });
}

/* ─── Wind streaks ─────────────────────────────────────────────── */

/**
 * The wind made visible, as in the sketch: a pale line that draws itself
 * along the gust's path and lifts off again behind. Its head and tail run
 * 0–1 along the path; it swells through the middle and thins to nothing at
 * each end, like a brush stroke. Width is in screen pixels.
 */
export function makeStreakMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uHead: { value: 0 },
      uTail: { value: 0 },
      uOpacity: { value: 0 },
      uWidth: { value: 2.6 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uColour: { value: rgb(SCENE_COLOURS.streak) },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.CustomBlending,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
    vertexShader: /* glsl */ `
      attribute vec3 aNext;
      attribute float aSide;
      attribute float aU;
      uniform float uHead;
      uniform float uTail;
      uniform float uWidth;
      uniform vec2 uRes;
      varying float vU;
      varying float vSide;

      void main() {
        vec4 c0 = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec4 c1 = projectionMatrix * modelViewMatrix * vec4(aNext, 1.0);
        vec2 s0 = c0.xy / c0.w * uRes;
        vec2 s1 = c1.xy / c1.w * uRes;
        vec2 t = normalize(s1 - s0 + vec2(1e-5, 0.0));
        float k = clamp((aU - uTail) / max(uHead - uTail, 1e-4), 0.0, 1.0);
        float w = uWidth * pow(sin(3.14159 * k), 0.6) * (0.55 + 0.45 * k);
        c0.xy += vec2(-t.y, t.x) * aSide * w / uRes * c0.w;
        gl_Position = c0;
        vU = aU;
        vSide = aSide;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uHead;
      uniform float uTail;
      uniform float uOpacity;
      uniform vec3 uColour;
      varying float vU;
      varying float vSide;

      void main() {
        if (vU > uHead || vU < uTail) discard;
        float edge = 1.0 - smoothstep(0.35, 1.0, abs(vSide));
        gl_FragColor = vec4(uColour, uOpacity * edge);
      }
    `,
  });
}

/* ─── Ink and paper ────────────────────────────────────────────── */

/** For the full-screen passes: one triangle that covers the screen. */
const SCREEN_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * The finishing pass: outlines inked over the painted scene, then the paper.
 *
 * A line is drawn wherever a form stands proud of what's behind it — read
 * off the depth buffer by comparing each pixel's nearness with its
 * neighbours'. Comparing in 1/depth means flat ground at a glancing angle
 * stays clean, and only the nearer side of an edge is inked, so lines hug
 * the form they belong to. Silhouettes against the sky come out bold,
 * edges within the crown fine, and lines fade with distance. The ink picks
 * up a little of the colour it's drawn over, and wavers a touch off the true
 * edge, as a hand would.
 */
export function makeInkMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      tColor: { value: null },
      tDepth: { value: null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1 },
      uNear: { value: 0.5 },
      uFar: { value: 1500 },
      uWeight: { value: 1 },
      uThreshold: { value: new THREE.Vector2(0.01, 0.05) },
      uFade: { value: new THREE.Vector2(70, 260) },
      uInk: { value: rgb(SCENE_COLOURS.ink) },
      uClumpLine: { value: 0.24 },
      uClumpShadow: { value: 0.09 },
      uClumpReach: { value: 3.5 },
    },
    depthTest: false,
    depthWrite: false,
    vertexShader: SCREEN_VERTEX,
    fragmentShader: /* glsl */ `
      #include <packing>
      uniform sampler2D tColor;
      uniform sampler2D tDepth;
      uniform vec2 uRes;
      uniform float uDpr;
      uniform float uNear;
      uniform float uFar;
      uniform float uWeight;
      uniform vec2 uThreshold;
      uniform vec2 uFade;
      uniform vec3 uInk;
      uniform float uClumpLine;
      uniform float uClumpShadow;
      uniform float uClumpReach;
      varying vec2 vUv;
      ${NOISE_GLSL}

      float depthAt(vec2 uv) {
        return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, uNear, uFar);
      }

      // What a pixel shows, from its alpha: an even number for a clump of the
      // crown, 253 for flowers, which go uninked, and 255 for anything else.
      float clumpAt(vec2 uv) {
        return floor(texture2D(tColor, uv).a * 255.0 + 0.5);
      }
      bool isLeaf(float id) {
        return id < 252.5 && mod(id, 2.0) < 0.5;
      }

      // How far the centre stands proud of the pair either side of it.
      float proud(vec2 uv, vec2 o, float iz, float z) {
        return (iz - 0.5 * (1.0 / depthAt(uv + o) + 1.0 / depthAt(uv - o))) * z;
      }

      // Paper: a fine tooth, and long faint fibres.
      vec3 paper(vec3 col, vec2 css) {
        float tooth = hash12(floor(css));
        float fibre = noise2(css * vec2(0.012, 0.09));
        return col * (1.0 - 0.028 * (tooth - 0.5) - 0.02 * (fibre - 0.5));
      }

      void main() {
        vec3 col = texture2D(tColor, vUv).rgb;
        vec2 css = gl_FragCoord.xy / uDpr;
        vec2 wob = (vec2(noise2(css * 0.045), noise2(css * 0.045 + 19.7)) - 0.5) * 1.6 * uDpr / uRes;
        vec2 uv = vUv + wob;
        vec2 px = uWeight * uDpr / uRes;
        float z = depthAt(uv);
        // Open sky stands proud of nothing and holds no leaves: there's no ink
        // to find there, only paper — and it's nearly half the frame.
        if (z > 0.9 * uFar) {
          gl_FragColor = vec4(paper(col, css), 1.0);
          return;
        }
        float iz = 1.0 / z;
        float edge = max(
          max(proud(uv, vec2(px.x, 0.0), iz, z), proud(uv, vec2(0.0, px.y), iz, z)),
          max(proud(uv, px * 0.7071, iz, z), proud(uv, vec2(px.x, -px.y) * 0.7071, iz, z)));

        float fade = 1.0 - 0.9 * smoothstep(uFade.x, uFade.y, z);
        vec3 ink = mix(uInk, col * 0.4, 0.5);

        // Inside the crown: where a clump overlaps one behind it, a faint line
        // along its edge, and the slightest shadow it lays on that one — most
        // below it, as the light comes from above.
        float me = clumpAt(uv);
        if (isLeaf(me)) {
          vec2 reach = uClumpReach * uDpr / uRes;
          float overlap = 0.0;
          float shadow = 0.0;
          for (int i = 0; i < 8; i++) {
            float a = float(i) * 0.7853982;
            vec2 dir = vec2(cos(a), sin(a));
            vec2 near = uv + dir * px;
            float other = clumpAt(near);
            if (isLeaf(other) && abs(other - me) > 0.5 && depthAt(near) > z + 0.3) overlap = 1.0;
            vec2 far = uv + dir * reach;
            other = clumpAt(far);
            if (isLeaf(other) && abs(other - me) > 0.5 && depthAt(far) < z - 0.3) shadow += 0.08 + 0.3 * max(dir.y, 0.0);
          }
          col *= 1.0 - uClumpShadow * smoothstep(0.0, 0.6, shadow) * fade;
          col = mix(col, ink, uClumpLine * overlap * fade);
        }

        // Every form against what's behind it: the strong line.
        float line = smoothstep(uThreshold.x, uThreshold.y, edge);
        float weight = mix(0.55, 0.92, smoothstep(0.06, 0.3, edge)) * fade;
        if (abs(me - 253.0) < 0.5) weight = 0.0;
        col = mix(col, ink, line * weight);

        gl_FragColor = vec4(paper(col, css), 1.0);
      }
    `,
  });
}

/**
 * The last pass: FXAA, which smooths the inked lines and the leaves' edges as
 * multisampling would, at a fraction of its memory. The paper's grain is too
 * faint for it to touch.
 */
export function makeSmoothMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      resolution: { value: new THREE.Vector2(1, 1) },
    },
    depthTest: false,
    depthWrite: false,
    vertexShader: SCREEN_VERTEX,
    fragmentShader: FXAAShader.fragmentShader,
  });
}
