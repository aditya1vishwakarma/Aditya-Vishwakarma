import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { advance, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { PACE, PALETTES, SCENE_COLOURS, SHOT, TREE, type Season } from './mapleConfig';
import {
  createUniforms,
  makeCloudMaterial,
  makeCoreMaterial,
  makeDaisyMaterial,
  makeGroundMaterial,
  makeGroveMaterial,
  makeLeafMaterial,
  makeRidgeMaterial,
  makeSkyMaterial,
  makeTuftMaterial,
  makeWoodMaterial,
  rgb,
  type SceneUniforms,
} from './materials';
import { buildClouds, makePuffAtlas } from './clouds';
import { buildTufts, makeTuftAtlas } from './grass';
import { makeLeafAtlas } from './leafAtlas';
import { buildDaisies, buildGrove, makeDaisyAtlas, makeGroveAtlas } from './scenery';
import { FAR_RIDGE, NEAR_RIDGE, buildGround, buildRidge, farRidgeHeight, groundHeight, nearRidgeHeight } from './terrain';
import { EYE, FAN, LOOK, TARGET } from './shot';
import { buildMaple, type MapleModel } from './tree';
import { Gusts, sway } from './wind';
import Flights from './Flights';
import InkPass from './InkPass';

/**
 * A maple on a knoll at noon, idling in the wind — drawn rather than
 * rendered. The tree sways; every so often a gust runs through it, lifts a
 * leaf or two away along a line of wind, and lets them fall to the grass.
 *
 * Expects a Canvas with `flat` (the scene paints its own colours) that it
 * can take over the drawing of — ideally with `frameloop="never"`, so the
 * scene draws its own frames at its own pace.
 */

export interface MapleHandle {
  /** Bring on a gust now. */
  gust: () => void;
  /** Seconds until the next gust; 0 while one is blowing. */
  nextGust: () => number;
  /** Where the eye is, what it's turned on (while the camera is free) and how wide it sees, for framing a shot by hand. */
  view: () => { position: THREE.Vector3; target: THREE.Vector3 | null; fov: number };
  /** Frames drawn so far. */
  frames: () => number;
  /** Whether a point on the page, in client pixels, falls on the tree as it's drawn just now: its leaf masses, or its trunk. */
  treeAt: (x: number, y: number) => boolean;
}

/* ─── Camera ───────────────────────────────────────────────────── */

const LINE = new THREE.Vector3().subVectors(TARGET, EYE);
const REACH = LINE.length();
LINE.normalize();

/** A way of looking at the scene: from where, at what, how wide, and how far the picture is slid sideways (the camera's film offset). */
interface Framing {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  shift: number;
}

/**
 * Where the eye goes for a screen of this shape: on a wide one, the shot as
 * framed; narrower, it draws back along the same line and turns in toward
 * the tree, so the tree stays in frame; narrower still, a phone held
 * upright, it comes in close on the tree with a wider view. `phone` says how
 * far it has gone that last way, 0 to 1.
 */
const composeShot = (aspect: number) => {
  const narrow = 1 - THREE.MathUtils.smoothstep(aspect, 0.6, 1.6);
  const target = TARGET.clone().lerp(new THREE.Vector3(...SHOT.narrowTarget), narrow);
  const position = target.clone().addScaledVector(LINE, -REACH * (1 + (SHOT.drawBack - 1) * narrow));
  const phone = 1 - THREE.MathUtils.smoothstep(aspect, ...SHOT.phone.aspect);
  const phoneTarget = new THREE.Vector3(...SHOT.phone.target);
  const phoneEye = new THREE.Vector3(...SHOT.phone.position)
    .sub(phoneTarget)
    .multiplyScalar(Math.max(1, SHOT.phone.framedFor / aspect))
    .add(phoneTarget);
  target.lerp(phoneTarget, phone);
  position.lerp(phoneEye, phone);
  position.y = Math.max(position.y, groundHeight(position.x, position.z) + SHOT.minEyeHeight);
  return { position, target, phone };
};

/** The crown as drawn: its middle, and half its width, leaf masses and all. */
const CROWN = new THREE.Vector3(...TREE.crownCentre);
const CROWN_HALF = TREE.crownRadii[0] + TREE.lobeRadius[1];

/**
 * Beside a pane: how much of the clear width the crown fills; the least the
 * eye draws back, however much room there is; and the widest the view may
 * open, to fit the tree in when the eye can't go back far enough.
 */
const ASIDE = { fill: 0.62, minBack: 0.12, maxFov: 50 };

/** How long the camera takes to move when a pane opens or closes. */
const MOVE_MS = 1400;

const tanHalf = (fov: number) => Math.tan(THREE.MathUtils.degToRad(fov) / 2);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** How far the eye may go back along `dir` and stay well inside the world that's built. */
const roomBehind = (from: THREE.Vector3, dir: THREE.Vector3) => {
  const along = (from.x - FAN.apex.x) * LOOK.x + (from.z - FAN.apex.z) * LOOK.z;
  const rate = dir.x * LOOK.x + dir.z * LOOK.z;
  return rate > 1e-3 ? Math.max(0, (along - 3) / rate) : 0;
};

const probe = new THREE.PerspectiveCamera();

/** Where the trunk stands, and how much wider than drawn it counts as, to be easy to tap. */
const TRUNK_FOOT = new THREE.Vector3(0, groundHeight(0, 0), 0);
const TRUNK_REACH = 2.5;
/** How much bigger than drawn a leaf mass counts as: a fingertip is wide. */
const LOBE_REACH = 1.1;
/** The least a tap may miss the trunk by and still be on it, in pixels. */
const TRUNK_LEAST = 18;

/**
 * The shot with a pane open over the right of the screen, leaving the left
 * `clear` of its width: the eye draws back along its line, and the picture
 * slides over — as a shift lens would, with nothing turned, so the tree
 * keeps its shape — until the tree stands in the middle of what's left.
 */
const composeAside = (shot: Framing, aspect: number, clear: number): Framing => {
  if (clear >= 1) return shot;
  const dir = shot.target.clone().sub(shot.position).normalize();
  const position = shot.position.clone();
  // The crown's width wanted, in screen heights, and how far back the eye must be for it.
  const want = ASIDE.fill * clear * aspect;
  const d0 = position.distanceTo(CROWN);
  const back = Math.min(Math.max(d0 * ASIDE.minBack, CROWN_HALF / (want * tanHalf(shot.fov)) - d0), roomBehind(position, dir));
  position.addScaledVector(dir, -back);
  position.y = Math.max(position.y, groundHeight(position.x, position.z) + SHOT.minEyeHeight);
  // Still too big from as far back as the world allows: open the view a little.
  const d = position.distanceTo(CROWN);
  const fov =
    CROWN_HALF / (d * tanHalf(shot.fov)) > want
      ? Math.min(ASIDE.maxFov, THREE.MathUtils.radToDeg(2 * Math.atan(CROWN_HALF / (d * want))))
      : shot.fov;
  // Where the crown's middle would fall across the screen, -1 to 1, and where it should: the middle of the clear width.
  probe.fov = fov;
  probe.aspect = aspect;
  probe.filmOffset = 0;
  probe.position.copy(position);
  probe.lookAt(shot.target);
  probe.updateMatrixWorld();
  probe.updateProjectionMatrix();
  const at = CROWN.clone().project(probe).x;
  const shift = -(clear - 1 - at) * tanHalf(fov) * aspect * probe.getFilmWidth();
  return { position, target: shot.target.clone(), fov, shift };
};

const copyFraming = (f: Framing): Framing => ({ position: f.position.clone(), target: f.target.clone(), fov: f.fov, shift: f.shift });

const mixFraming = (out: Framing, a: Framing, b: Framing, t: number) => {
  out.position.lerpVectors(a.position, b.position, t);
  out.target.lerpVectors(a.target, b.target, t);
  out.fov = THREE.MathUtils.lerp(a.fov, b.fov, t);
  out.shift = THREE.MathUtils.lerp(a.shift, b.shift, t);
};

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const Shot: React.FC<{ free: boolean; fov: number; clear: number; motion: { moving: boolean } }> = ({ free, fov, clear, motion }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const aspect = width / height;
  const shot = useMemo(() => composeShot(aspect), [aspect]);
  const plain = useMemo<Framing>(
    () => ({ position: shot.position, target: shot.target, fov: THREE.MathUtils.lerp(fov, SHOT.phone.fov, shot.phone), shift: 0 }),
    [shot, fov],
  );
  const goal = useMemo(() => composeAside(plain, aspect, clear), [plain, aspect, clear]);

  // Where the camera is now, and the move it's making, if any.
  const rig = useRef<{ now: Framing | null; from: Framing | null; start: number; size: string }>({ now: null, from: null, start: 0, size: '' });

  useLayoutEffect(() => {
    const r = rig.current;
    const size = `${width}x${height}`;
    camera.near = 0.5;
    camera.far = 1500;
    camera.aspect = aspect;
    // A new screen size, or the free camera let go, snaps to its framing; a pane opening or closing is a move.
    if (!r.now || size !== r.size || free || reducedMotion()) {
      r.now = copyFraming(goal);
      r.from = null;
    } else {
      r.from = copyFraming(r.now);
      r.start = performance.now();
    }
    r.size = size;
    motion.moving = !!r.from;
    if (free) {
      // The free camera looks about from the plain shot, unslid.
      camera.fov = plain.fov;
      camera.filmOffset = 0;
    } else {
      camera.position.copy(r.now.position);
      camera.lookAt(r.now.target);
      camera.fov = r.now.fov;
      camera.filmOffset = r.now.shift;
    }
    camera.updateProjectionMatrix();
  }, [camera, width, height, aspect, plain, goal, free, motion]);

  useFrame(() => {
    if (free) {
      // Walking round the tree, the eye stays above the grass.
      const floor = groundHeight(camera.position.x, camera.position.z) + SHOT.minEyeHeight;
      if (camera.position.y < floor) camera.position.y = floor;
      return;
    }
    const r = rig.current;
    if (!r.from || !r.now) return;
    const t = Math.min(1, (performance.now() - r.start) / MOVE_MS);
    mixFraming(r.now, r.from, goal, easeInOut(t));
    if (t >= 1) {
      r.from = null;
      motion.moving = false;
    }
    camera.position.copy(r.now.position);
    camera.lookAt(r.now.target);
    camera.fov = r.now.fov;
    camera.filmOffset = r.now.shift;
    camera.updateProjectionMatrix();
  }, -2);

  // The free camera turns about the shot's target, only so far either way, and
  // nearer or farther only so much — the world is built no farther than that.
  const limits = useMemo(() => {
    const offset = shot.position.clone().sub(shot.target);
    const turn = Math.atan2(offset.x, offset.z);
    const tilt = Math.acos(offset.y / offset.length());
    const r = THREE.MathUtils.degToRad;
    return {
      azimuth: [turn - r(SHOT.freeTurn), turn + r(SHOT.freeTurn)],
      polar: [tilt - r(SHOT.freeTilt), Math.min(Math.PI / 2 + 0.02, tilt + r(SHOT.freeTilt))],
      distance: [offset.length() * SHOT.freeReach[0], offset.length() * SHOT.freeReach[1]],
    };
  }, [shot]);

  return free ? (
    <OrbitControls
      makeDefault
      target={shot.target}
      enableDamping
      enablePan={false}
      dampingFactor={0.08}
      minAzimuthAngle={limits.azimuth[0]}
      maxAzimuthAngle={limits.azimuth[1]}
      minPolarAngle={limits.polar[0]}
      maxPolarAngle={limits.polar[1]}
      minDistance={limits.distance[0]}
      maxDistance={limits.distance[1]}
    />
  ) : null;
};

/* ─── Pace ─────────────────────────────────────────────────────── */

/**
 * Draws a frame only as often as the scene needs: `PACE.calm` a second, and
 * the `PACE.full` rate only while the wind has a leaf or the camera is on the
 * move. An idle scene spends nearly all its life at the calm rate, so the
 * GPU does half the work or less. Paused — covered by something — it draws
 * nothing at all once it's up and the camera's at rest, until it's let go.
 * Only when the Canvas is set to draw nothing on its own
 * (`frameloop="never"`); any other Canvas draws at its own pace.
 */
const Pacer: React.FC<{ wind: Gusts; motion: { moving: boolean }; drawn: { frames: number }; paused: boolean }> = ({ wind, motion, drawn, paused }) => {
  const frameloop = useThree((s) => s.frameloop);

  useEffect(() => {
    if (frameloop !== 'never') return;
    let raf = 0;
    let last = -Infinity;
    const tick = (now: number) => {
      if (paused && drawn.frames >= 2 && !motion.moving) return;
      raf = requestAnimationFrame(tick);
      // A little slack, so a 60 Hz screen asked for 30 shows every other frame rather than drifting.
      if (now - last < 1000 / (wind.carrying || motion.moving ? PACE.full : PACE.calm) - 2) return;
      last = now;
      advance(now / 1000);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [wind, motion, drawn, paused, frameloop]);

  // A canvas resized is a canvas cleared: paused, it's drawn once more at its new size, so the scene round the
  // edges of what covers it stays.
  const size = useThree((s) => s.size);
  useEffect(() => {
    if (!paused || frameloop !== 'never' || drawn.frames < 2) return;
    const raf = requestAnimationFrame((now) => advance(now / 1000));
    return () => cancelAnimationFrame(raf);
  }, [size, paused, frameloop, drawn]);

  return null;
};

/* ─── Wind and season ──────────────────────────────────────────── */

const tmp = new THREE.Vector3();
const spot = new THREE.Vector3();
const middle = new THREE.Vector3();
const rim = new THREE.Vector3();
const across = new THREE.Vector3();
const tap = new THREE.Vector2();
const onPage = new THREE.Vector2();
const edge = new THREE.Vector2();
const along = new THREE.Vector2();
const tmp2 = new THREE.Vector2();

/** How far `p` is from the line from `a` to `b`, all on the page. */
const offSegment = (p: THREE.Vector2, a: THREE.Vector2, b: THREE.Vector2) => {
  along.subVectors(b, a);
  const t = THREE.MathUtils.clamp(along.dot(tmp2.subVectors(p, a)) / Math.max(along.lengthSq(), 1e-6), 0, 1);
  return tmp2.copy(a).addScaledVector(along, t).distanceTo(p);
};

/**
 * Beside a pane, the field calms: of the daisies that sway, only this share
 * goes on swaying, while the tree sways on. How fast it calms, and how fast
 * it wakes again at home, in shares a second.
 */
const FLOWERS_BESIDE = 0.05;
const CALMING = 0.4;
const WAKING = 0.8;

/** Steps the wind and moves the leaf masses' shadows with the crown. Runs before anything else each frame. */
const useWind = (wind: Gusts, model: MapleModel, uniforms: SceneUniforms) => {
  useFrame((_, dt) => {
    wind.update(Math.min(dt, 1 / 20));
    uniforms.uTime.value = wind.time;
    uniforms.uGust.value = wind.level;
    for (let i = 0; i < model.lobes.length; i++) {
      const lobe = model.lobes[i];
      sway(lobe.centre, wind.time, wind.level, tmp).add(lobe.centre);
      uniforms.uLobes.value[i].set(tmp.x, tmp.y, tmp.z, lobe.radius);
    }
  }, -1);
};

/** A change of season is a slow turn of the colours, not a cut. Once they've turned, it rests. */
const useSeason = (uniforms: SceneUniforms, season: Season) => {
  const turn = useMemo(() => {
    const p = PALETTES[season];
    const pairs: [THREE.Vector3, THREE.Vector3][] = [];
    const pair = (from: THREE.Vector3[], to: string[]) => to.forEach((hex, i) => pairs.push([from[i], rgb(hex)]));
    pair(uniforms.uLeaf.value, p.leaf);
    pair(uniforms.uLeafAlt.value, p.leafAlt);
    pair(uniforms.uGrass.value, p.grass);
    pair([uniforms.uGrassPatch.value], [p.grassPatch]);
    pair(uniforms.uGrove.value, p.grove);
    return { pairs, settled: false };
  }, [uniforms, season]);

  useFrame((_, dt) => {
    if (turn.settled) return;
    const k = 1 - Math.exp(-Math.min(dt, 1 / 20) * 2.2);
    let left = 0;
    for (const [colour, target] of turn.pairs) {
      colour.lerp(target, k);
      left = Math.max(left, colour.distanceToSquared(target));
    }
    if (left < 1e-7) {
      for (const [colour, target] of turn.pairs) colour.copy(target);
      turn.settled = true;
    }
  });
};

/* ─── The scene ────────────────────────────────────────────────── */

const MapleScene: React.FC<{
  season: Season;
  freeCamera?: boolean;
  /** Field of view, top to bottom, in degrees; the shot is framed round it. */
  fov?: number;
  /**
   * How much of the screen's width, from its left edge, is still the scene's
   * own — less than 1 while something covers the right of it. The camera
   * draws back and slides the picture over, so the tree stands in what's left.
   */
  clear?: number;
  /** Hold the wind: no gust or breeze begins, and the tree only sways. */
  still?: boolean;
  /** Covered: stop drawing, once the scene is up and the camera's at rest, until this goes false. */
  paused?: boolean;
  /** Called once, when the scene has drawn its first frames. */
  onReady?: () => void;
  handle?: React.MutableRefObject<MapleHandle | null>;
}> = ({ season, freeCamera = false, fov = SHOT.fov, clear = 1, still = false, paused = false, onReady, handle }) => {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const get = useThree((s) => s.get);

  const initialSeason = useRef(season).current;
  const world = useMemo(() => {
    const model = buildMaple();
    const atlas = makeLeafAtlas();
    const tuftAtlas = makeTuftAtlas();
    const daisyAtlas = makeDaisyAtlas();
    const groveAtlas = makeGroveAtlas();
    const puffAtlas = makePuffAtlas();
    const uniforms = createUniforms(initialSeason);

    // Where the crown's shadow falls on level ground at the tree's foot, and how far it can reach.
    const sun = uniforms.uCastSun.value;
    const foot = (c: THREE.Vector3) => c.clone().addScaledVector(sun, -c.y / sun.y);
    const shadowCentre = foot(model.lobes.reduce((acc, l) => acc.add(l.centre), new THREE.Vector3()).divideScalar(model.lobes.length));
    const reach = Math.max(
      ...model.lobes.map((l) => {
        const f = foot(l.centre);
        return Math.hypot(f.x - shadowCentre.x, f.z - shadowCentre.z) + l.radius / sun.y;
      }),
    );

    // Each leaf mass's dark heart, squashed as its leaves are.
    const cores = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), makeCoreMaterial(uniforms), model.lobes.length);
    const place = new THREE.Matrix4();
    model.lobes.forEach((l, i) => {
      const r = l.radius * 0.66;
      cores.setMatrixAt(i, place.makeScale(r, r * 0.82, r).setPosition(l.centre));
    });
    cores.frustumCulled = false;

    return {
      model,
      atlas,
      tuftAtlas,
      daisyAtlas,
      groveAtlas,
      puffAtlas,
      cores,
      uniforms,
      drawn: { frames: 0 },
      motion: { moving: false },
      wind: new Gusts(Math.random),
      geometry: {
        ground: buildGround(),
        tufts: buildTufts(),
        daisies: buildDaisies(),
        grove: buildGrove(),
        clouds: buildClouds(),
        nearRidge: buildRidge(NEAR_RIDGE, nearRidgeHeight),
        farRidge: buildRidge(FAR_RIDGE, farRidgeHeight),
        sky: new THREE.SphereGeometry(600, 48, 24),
      },
      material: {
        leaves: makeLeafMaterial(uniforms, atlas),
        wood: makeWoodMaterial(uniforms),
        ground: makeGroundMaterial(uniforms, shadowCentre, reach + 0.5),
        tufts: makeTuftMaterial(uniforms, tuftAtlas, shadowCentre, reach + 0.5),
        daisies: makeDaisyMaterial(uniforms, daisyAtlas, shadowCentre, reach + 0.5),
        grove: makeGroveMaterial(uniforms, groveAtlas),
        clouds: makeCloudMaterial(uniforms, puffAtlas),
        nearRidge: makeRidgeMaterial(SCENE_COLOURS.ridgeNear, 0.42),
        farRidge: makeRidgeMaterial(SCENE_COLOURS.ridgeFar, 0.55),
        sky: makeSkyMaterial(),
      },
    };
  }, [initialSeason]);

  useEffect(
    () => () => {
      world.model.wood.dispose();
      world.model.leaves.dispose();
      world.atlas.dispose();
      world.tuftAtlas.dispose();
      world.daisyAtlas.dispose();
      world.groveAtlas.dispose();
      world.puffAtlas.dispose();
      world.cores.geometry.dispose();
      world.cores.dispose();
      (world.cores.material as THREE.Material).dispose();
      Object.values(world.geometry).forEach((g) => g.dispose());
      Object.values(world.material).forEach((m) => m.dispose());
    },
    [world],
  );

  useEffect(() => {
    gl.setClearColor(SCENE_COLOURS.skyHorizon);
  }, [gl]);

  useEffect(() => {
    if (!handle) return;
    const { wind } = world;
    handle.current = {
      gust: () => wind.trigger(),
      nextGust: () => (wind.blowing ? 0 : Math.max(0, wind.nextAt - wind.time)),
      view: () => {
        const { camera: eye, controls } = get();
        const target = (controls as { target?: THREE.Vector3 } | null)?.target ?? null;
        return { position: eye.position, target, fov: (eye as THREE.PerspectiveCamera).fov };
      },
      frames: () => world.drawn.frames,
      treeAt: (x, y) => {
        const { camera: eye, gl: renderer } = get();
        const box = renderer.domElement.getBoundingClientRect();
        const toPage = (p: THREE.Vector3, out: THREE.Vector2) => {
          spot.copy(p).project(eye);
          out.set(box.left + ((spot.x + 1) / 2) * box.width, box.top + ((1 - spot.y) / 2) * box.height);
          return spot.z < 1;
        };
        tap.set(x, y);
        across.setFromMatrixColumn(eye.matrixWorld, 0);
        // A leaf mass where it's swayed to this frame, as far across as it is wide.
        for (let i = 0; i < world.model.lobes.length; i++) {
          const lobe = world.uniforms.uLobes.value[i];
          middle.set(lobe.x, lobe.y, lobe.z);
          if (!toPage(middle, onPage)) continue;
          rim.copy(middle).addScaledVector(across, lobe.w * LOBE_REACH);
          toPage(rim, edge);
          if (tap.distanceTo(onPage) <= onPage.distanceTo(edge)) return true;
        }
        // The trunk, from its foot to the middle of the crown.
        rim.set(TREE.trunkRadius * TRUNK_REACH, 0, 0).add(TRUNK_FOOT);
        toPage(TRUNK_FOOT, onPage);
        toPage(rim, edge);
        const width = Math.max(TRUNK_LEAST, onPage.distanceTo(edge));
        toPage(CROWN, edge);
        return offSegment(tap, onPage, edge) <= width;
      },
    };
    return () => {
      handle.current = null;
    };
  }, [handle, world, get]);

  useWind(world.wind, world.model, world.uniforms);
  useSeason(world.uniforms, season);

  useEffect(() => {
    world.wind.held = still;
  }, [world, still]);

  const calm = useRef(still);
  calm.current = still;
  useFrame((_, dt) => {
    const share = world.material.daisies.uniforms.uSwayShare;
    const want = calm.current ? FLOWERS_BESIDE : 1;
    if (share.value === want) return;
    const by = Math.min(dt, 1 / 20) * (want < share.value ? CALMING : WAKING);
    share.value = want < share.value ? Math.max(want, share.value - by) : Math.min(want, share.value + by);
  });

  // Ready once two frames are up: the first can still be compiling its shaders.
  const ready = useRef(onReady);
  ready.current = onReady;
  const told = useRef(false);
  useFrame(() => {
    if (told.current || world.drawn.frames < 2) return;
    told.current = true;
    ready.current?.();
  }, 2);

  const sky = useRef<THREE.Mesh>(null);
  useFrame(() => {
    sky.current?.position.copy(camera.position);
    world.drawn.frames++;
  });

  return (
    <>
      <Pacer wind={world.wind} motion={world.motion} drawn={world.drawn} paused={paused} />
      <Shot free={freeCamera} fov={fov} clear={clear} motion={world.motion} />
      <mesh ref={sky} geometry={world.geometry.sky} material={world.material.sky} renderOrder={1} frustumCulled={false} />
      <mesh geometry={world.geometry.clouds} material={world.material.clouds} />
      <mesh geometry={world.geometry.farRidge} material={world.material.farRidge} />
      <mesh geometry={world.geometry.nearRidge} material={world.material.nearRidge} />
      <mesh geometry={world.geometry.ground} material={world.material.ground} />
      <mesh geometry={world.geometry.grove} material={world.material.grove} />
      <mesh geometry={world.geometry.tufts} material={world.material.tufts} />
      <mesh geometry={world.geometry.daisies} material={world.material.daisies} />
      <mesh geometry={world.model.wood} material={world.material.wood} />
      <primitive object={world.cores} />
      <mesh geometry={world.model.leaves} material={world.material.leaves} />
      <Flights model={world.model} wind={world.wind} uniforms={world.uniforms} atlas={world.atlas} />
      <InkPass />
    </>
  );
};

export default MapleScene;
