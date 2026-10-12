import * as THREE from 'three';
import { COLORS, INTENSITY } from './museumConfig';
import { THEMES } from './museumTheme';

/**
 * Surfaces and light for the shelving.
 *
 * The hinoki is not a texture. Each board is cut from its own virtual log,
 * and the shader works out, for every pixel, how far that point sits from
 * the log's heart. Growth rings, figure and tone follow from that one number,
 * so the long faces show straight grain, the bevelled ends show end grain
 * and the posts run vertical — all consistent, at any distance, with nothing
 * to tile or stretch.
 */

/* ─── Light from above ─────────────────────────────────────────── */

/** Shared by the wood and the panes: the light is strongest high up and eases off below. */
export const CASE_LIGHT_GLSL = /* glsl */ `
  uniform float uLightsOn;
  varying vec3 vCaseWorld;

  float caseLight(vec3 p) {
    return mix(0.74, 1.08, smoothstep(0.6, 2.0, p.y));
  }
`;

export interface CaseLightUniforms {
  uLightsOn: { value: number };
  /**
   * The shelf height under each hover light, in scene order. The hover lights
   * cast no shadows, so without this their glow would shine straight down
   * through the shelf a pane stands on.
   */
  uHoverFloor: { value: number[] };
}

export const createCaseLightUniforms = (): CaseLightUniforms => ({
  uLightsOn: { value: 0 },
  uHoverFloor: { value: [-10, -10] },
});

/* ─── Hinoki ───────────────────────────────────────────────────── */

const linear = (hex: string) => {
  const c = new THREE.Color(hex);
  return `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`;
};

/**
 * Per board, the geometry carries `aWood`: which way the grain runs (0 = x,
 * 1 = y), a seed, and where the log's heart sits in the board's cross-section.
 */
const HINOKI_GLSL = /* glsl */ `
  varying vec4 vWood;

  float wHash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float wNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(wHash(i), wHash(i + vec3(1, 0, 0)), f.x), mix(wHash(i + vec3(0, 1, 0)), wHash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(wHash(i + vec3(0, 0, 1)), wHash(i + vec3(1, 0, 1)), f.x), mix(wHash(i + vec3(0, 1, 1)), wHash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }

  // Two octaves are plenty for grain this quiet, and half the cost of four.
  float wFbm(vec3 p) {
    return (wNoise(p) * 2.0 + wNoise(p * 2.03 + 17.1)) / 3.0;
  }

  struct Hinoki {
    vec3 color;
    float rough;
    float height;
  };

  Hinoki hinoki(vec3 p) {
    float seed = vWood.y;
    bool upright = vWood.x > 0.5;
    float along = upright ? p.y : p.x;
    vec2 xs = (upright ? p.xz : p.yz) - vWood.zw;

    // A board is never sawn quite parallel to the log, so rings drift slowly across it.
    xs += (vec2(fract(seed * 7.13), fract(seed * 3.71)) - 0.5) * 0.014 * along;

    // Rings wander a little as the tree grew.
    vec3 q = vec3(along * 0.8, xs * 3.5) + seed * 11.0;
    float r = length(xs) + (wFbm(q) - 0.5) * 0.014;

    // Slow-grown cypress: tight rings, each ending in a thin, darker band of
    // latewood — wider and narrower as good years and lean ones came.
    float rings = r * 250.0 + (wNoise(vec3(r * 34.0, seed, seed * 0.37)) - 0.5) * 6.0;
    float ph = fract(rings);
    float late = smoothstep(0.56, 0.8, ph) * (1.0 - smoothstep(0.86, 0.99, ph));
    // Rings finer than a pixel blend to their average instead of shimmering.
    float resolve = 1.0 - smoothstep(0.3, 0.85, fwidth(rings));
    float lateAA = mix(0.22, late, resolve);

    // Figure: long streaks of tone a centimetre or two across — what still
    // reads as grain from across the room, once single rings are too fine to see.
    float figure = wFbm(vec3(along * 0.6, xs * 38.0) + seed * 2.0);

    // Tone drifts along each board, and from board to board.
    float drift = wFbm(vec3(along * 0.32, xs * 1.4) + seed * 5.0);
    float heart = smoothstep(0.55, 1.0, fract(seed * 5.31)) * 0.4;

    // The honeyed tone of the reference's shelving; grain kept quiet.
    vec3 early = ${linear('#9F7048')};
    vec3 lateWood = ${linear('#906342')};
    vec3 col = mix(early, lateWood, lateAA * 0.35);
    col *= mix(0.96, 1.03, smoothstep(0.25, 0.75, figure));
    col *= mix(0.95, 1.04, drift);
    col *= mix(vec3(1.0), ${linear('#9B684A')} / early, heart); // a warmer blush of heartwood

    Hinoki h;
    h.color = col;
    // Satin oil finish: latewood a touch glossier than the open earlywood.
    h.rough = mix(0.52, 0.42, lateAA);
    // Earlywood wears a hair lower than latewood; felt, not seen.
    h.height = lateAA * resolve;
    return h;
  }

  vec3 woodPerturb(vec3 surfPos, vec3 surfNorm, vec2 dHdxy, float faceDir) {
    vec3 sx = normalize(dFdx(surfPos));
    vec3 sy = normalize(dFdy(surfPos));
    vec3 r1 = cross(sy, surfNorm);
    vec3 r2 = cross(surfNorm, sx);
    float det = dot(sx, r1) * faceDir;
    vec3 grad = sign(det) * (dHdxy.x * r1 + dHdxy.y * r2);
    return normalize(abs(det) * surfNorm - grad);
  }
`;

/**
 * Oiled hinoki with a thin satin topcoat. The wood colour, roughness and
 * relief all come from the procedural grain; the light above shapes the
 * direct light, and each hover light is stopped at its pane's shelf.
 */
export function makeHinokiMaterial(uniforms: CaseLightUniforms) {
  const material = new THREE.MeshPhysicalMaterial({
    color: '#FFFFFF',
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.38,
    specularIntensity: 0.55,
    envMapIntensity: INTENSITY.environment,
  });

  let lightsBegin = THREE.ShaderChunk.lights_fragment_begin.replace(
    'getDirectionalLightInfo( directionalLight, directLight );',
    'getDirectionalLightInfo( directionalLight, directLight );\n\t\tdirectLight.color *= caseMod;',
  );

  // Point lights are only ever the hover lights, and they're drawn as pure
  // diffuse glow: a bell-curve falloff, light that wraps a little past the
  // edge of each surface, no specular — so it reads as light diffused out of
  // the pane, never as a bulb reflected in the finish. Each is stopped at the
  // shelf its pane stands on, with a little spill over the edge.
  const pointAt = lightsBegin.indexOf('getPointLightInfo( pointLight, geometryPosition, directLight );');
  const directAt = lightsBegin.indexOf('RE_Direct(', pointAt);
  const directEnd = lightsBegin.indexOf(';', directAt) + 1;
  lightsBegin =
    lightsBegin.slice(0, directAt) +
    `{
      float hoverD = length( pointLight.position - geometryPosition );
      float hoverWrap = saturate( ( dot( geometryNormal, directLight.direction ) + 0.45 ) / 1.45 );
      float hoverMask = smoothstep( uHoverFloor[ i ] - 0.09, uHoverFloor[ i ] + 0.004, vCaseWorld.y );
      reflectedLight.directDiffuse += pointLight.color * hoverWrap * hoverMask
        * exp( -hoverD * hoverD / ${(INTENSITY.hoverSpread ** 2).toFixed(4)} ) * BRDF_Lambert( material.diffuseColor );
    }` +
    lightsBegin.slice(directEnd);

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 aWood;\nvarying vec4 vWood;\nvarying vec3 vCaseWorld;')
      .replace(
        '#include <project_vertex>',
        '#include <project_vertex>\nvCaseWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWood = aWood;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\n${CASE_LIGHT_GLSL}\n${HINOKI_GLSL}\n#if NUM_POINT_LIGHTS > 0\nuniform float uHoverFloor[ NUM_POINT_LIGHTS ];\n#endif`,
      )
      .replace('#include <map_fragment>', '#include <map_fragment>\nHinoki wood = hinoki(vCaseWorld);\ndiffuseColor.rgb *= wood.color;')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = wood.rough;')
      .replace(
        '#include <normal_fragment_maps>',
        '#include <normal_fragment_maps>\nnormal = woodPerturb(-vViewPosition, normal, vec2(dFdx(wood.height), dFdy(wood.height)) * 0.03, faceDirection);',
      )
      .replace('#include <lights_fragment_begin>', `float caseMod = caseLight(vCaseWorld) * uLightsOn;\n${lightsBegin}`)
      .replace(
        '#include <lights_fragment_end>',
        `#include <lights_fragment_end>
        reflectedLight.indirectDiffuse *= 0.15 + 0.85 * uLightsOn;
        reflectedLight.indirectSpecular *= 0.15 + 0.85 * uLightsOn;`,
      );
  };
  material.customProgramCacheKey = () => 'museum-hinoki';
  return material;
}

/* ─── Backdrop ─────────────────────────────────────────────────── */

export interface BackdropUniforms {
  uGlowPos: { value: THREE.Vector3[] };
  uGlowAmt: { value: number[] };
}

/**
 * The wall, drawn unlit so its colour is exact: the theme's colour, a little
 * brighter toward the light above, with the faintest pools from lamps out of
 * sight. Hovered panes wash it with their glow; shadows are laid over it by
 * a separate shadow-catcher.
 */
export function makeBackdropMaterial(light: CaseLightUniforms, glow: BackdropUniforms) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...light,
      ...glow,
      uLow: { value: new THREE.Color(THEMES.light.backdropLow) },
      uHigh: { value: new THREE.Color(THEMES.light.backdropHigh) },
      uGlowColor: { value: new THREE.Color(COLORS.hoverLight) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      uniform float uLightsOn;
      uniform float uHoverFloor[2];
      uniform vec3 uGlowPos[2];
      uniform float uGlowAmt[2];
      uniform vec3 uLow;
      uniform vec3 uHigh;
      uniform vec3 uGlowColor;
      varying vec3 vWorld;

      void main() {
        float h = smoothstep(0.1, 2.9, vWorld.y);
        vec3 col = mix(uLow, uHigh, h * (2.0 - h));
        float pools = 0.5 + 0.5 * cos(vWorld.x * 3.92699);
        col *= 1.0 + 0.022 * pools * smoothstep(1.3, 2.6, vWorld.y);

        // A hovered pane's glow on the wall: wide and faint, no core.
        for (int i = 0; i < 2; i++) {
          vec2 d = (vWorld.xy - uGlowPos[i].xy) * vec2(1.0, 1.25);
          float g = uGlowAmt[i] * exp(-dot(d, d) / 0.16);
          g *= smoothstep(uHoverFloor[i] - 0.18, uHoverFloor[i] + 0.04, vWorld.y);
          col += uGlowColor * g * ${INTENSITY.hoverWall.toFixed(3)};
        }

        col *= 0.9 + 0.1 * uLightsOn;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }
    `,
    toneMapped: false,
    depthWrite: false,
  });
}

/* ─── Soft round sprite ────────────────────────────────────────── */

/** White-to-clear falloff, used for glow pools and contact shadows. */
export function makeSoftDisc() {
  const S = 128;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  // Roughly gaussian; a linear ramp shows a visible rim.
  [1, 0.82, 0.55, 0.3, 0.13, 0.04, 0].forEach((a, i, all) => grad.addColorStop(i / (all.length - 1), `rgba(255,255,255,${a})`));
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
