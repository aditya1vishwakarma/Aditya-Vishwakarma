/**
 * Every dimension, colour and timing for the maple scene lives here.
 *
 * Units are metres and seconds. Axes: +x runs to the right of the shot, the
 * way the wind blows; +y is up; +z points toward the viewer. The tree stands
 * at the origin, on the crown of its knoll.
 */

/* ─── Tree ───────────────────────────────────────────────────── */

export const TREE = {
  seed: 11,
  /** Where the trunk divides into its stems: low, so the crown sits close over a short trunk. */
  forkY: 1.7,
  trunkRadius: 0.34,
  /** The crown as a whole: a full, rounded oval the leaf masses are set around. */
  crownCentre: [0.2, 5.25, 0] as const,
  crownRadii: [3.1, 4.2, 3.1] as const,
  /** Each leaf mass is a rough sphere of foliage; these bound its radius. */
  lobeRadius: [1.7, 2.1] as const,
  /** Leaf cards for a lobe of middling size; bigger lobes get more. */
  cardsPerLobe: 300,
  /** Edge length of a leaf card: one carrying a lone leaf, and one carrying a spray of two or three. */
  cardSize: { lone: [0.48, 0.62] as const, spray: [0.6, 0.78] as const },
  /**
   * Each leaf mass is made of smaller clumps, each lit as its own little dome.
   * How many to a mass of middling size, and how big, as a fraction of it.
   */
  clumpsPerLobe: 6,
  clumpRadius: 0.48,
};

/** At most this many leaf masses; the shaders loop over them for shadow. */
export const MAX_LOBES = 16;

/* ─── Light ──────────────────────────────────────────────────── */

/** Toward the sun: high and a little to the left and front, as near noon. */
export const SUN_DIR: [number, number, number] = [-0.42, 0.84, 0.3];
/**
 * The sun the tree's shadow is cast from: the same, but higher, so the
 * shadow pools under the crown as at noon rather than reaching away.
 */
export const CAST_SUN_DIR: [number, number, number] = [-0.24, 0.96, 0.17];

/* ─── Wind ───────────────────────────────────────────────────── */

export const WIND = {
  /** The first gust comes soon, so whoever opens the page sees one. */
  firstGust: 3.5,
  /** Seconds of calm air between gusts. */
  calm: [6, 13] as const,
  /** Seconds a gust takes to build, to hold, and to die away. */
  rise: 1.4,
  hold: [2.2, 3.4] as const,
  fall: 3.2,
  /** How hard a gust blows, as a fraction of the strongest. */
  strength: [0.7, 1.0] as const,
  /** Once the wind has been held (while a pane is open), at least this much calm before the next gust. */
  afterHold: 4,
};

/* ─── Leaves in flight ───────────────────────────────────────── */

export const FLIGHT = {
  /** Most gusts loose one leaf; now and then, two. */
  twoLeafChance: 0.3,
  /** How often the gust's path throws a loop, like the "e" in the sketch. */
  loopChance: 0.8,
  /**
   * Edge length of a loose leaf: its neighbours' size as it lets go, and
   * larger than life once it's clear of the crown, so it reads at a distance.
   */
  size: 0.55,
  flyingSize: 0.88,
  /** How fast a leaf is carried along the wind's path, and the streak drawn ahead of it. */
  rideSpeed: 2.8,
  streakSpeed: 6.5,
  /** How much of the path the streak shows at once. */
  streakLength: 6.5,
  /** Once the gust lets go: how fast it drifts and sinks, and how it swings as it falls. */
  drift: 0.35,
  sink: 0.85,
  swingPeriod: 2.7,
  swingWidth: 0.55,
  /** How far it rises at the end of each swing, tipping up before it swings back. */
  swingLift: 0.12,
  /** Seconds a fallen leaf lies in the grass, and how many may lie there at once. */
  restFor: 28,
  maxResting: 6,
};

/* ─── The breeze ─────────────────────────────────────────────── */

/**
 * Wind that runs through the rest of the scene between gusts: a pale line
 * every few seconds, the same way as the gusts, mostly across the lower part
 * of the frame — never through the tree, so it carries nothing off.
 */
export const BREEZE = {
  /** Seconds between one line and the next. */
  every: [6, 7] as const,
  /** Now and then two come together. */
  pairChance: 0.25,
  /** Kept at least this far from any leaf mass. */
  clearance: 1.5,
  opacity: 0.85,
};

/* ─── Colour ─────────────────────────────────────────────────── */

export type Season = 'autumn' | 'summer';

/** The season the scene opens in, by the date: autumn from October through February, summer from March through September. */
export const seasonOf = (date: Date): Season => {
  const month = date.getMonth();
  return month >= 9 || month <= 1 ? 'autumn' : 'summer';
};

/** A painted ramp, darkest first: deep shadow, shade, light, highlight. */
export type Ramp = [string, string, string, string];

export interface Palette {
  /** Two families mixed leaf by leaf, so the crown never reads as one flat colour. */
  leaf: Ramp;
  leafAlt: Ramp;
  grass: Ramp;
  /** Sun-dried patches through the grass. */
  grassPatch: string;
  /** The trees across the plain that turn with the season; the rest stay evergreen. */
  grove: Ramp;
}

export const PALETTES: Record<Season, Palette> = {
  autumn: {
    leaf: ['#8C3043', '#CC553E', '#EE8A45', '#FCC066'],
    leafAlt: ['#984A3A', '#D5803C', '#F2AE48', '#FDDC8A'],
    grass: ['#3D6A4F', '#5B9249', '#86B456', '#ADCD69'],
    grassPatch: '#AFC160',
    grove: ['#7A4638', '#B0603D', '#CF8C47', '#E0B25E'],
  },
  summer: {
    leaf: ['#2D6450', '#4F9448', '#86BE58', '#C2DE78'],
    leafAlt: ['#3B6A47', '#6A9E47', '#A6C95A', '#DCE78A'],
    grass: ['#3B6A50', '#58914A', '#82B556', '#A8CD69'],
    grassPatch: '#A3C25C',
    grove: ['#3E6A50', '#5C8E57', '#7CAD62', '#9CC66E'],
  },
};

/** Colours that don't change with the season. */
export const SCENE_COLOURS = {
  skyZenith: '#4FADE8',
  skyMid: '#73BDEC',
  skyHorizon: '#A6D4EE',
  cloud: '#FFFFFF',
  cloudShade: '#C9D9EA',
  bark: ['#4D3F46', '#6B5957', '#94796A', '#BBA28C'] as Ramp,
  /** The two far ridges, and the haze the distance fades into. */
  ridgeNear: '#8DB98C',
  ridgeFar: '#A2C7BE',
  haze: '#B0D5E0',
  /** Trees far off that keep their green through the year. */
  evergreen: ['#36604D', '#4F8352', '#6FA25C', '#8CBB68'] as Ramp,
  /**
   * Daisies: petals in shade and in sun — white, and on the far hill a
   * pastel pink and a butter yellow too, kept soft so they don't call the
   * eye from the tree — and their eyes.
   */
  petal: [
    ['#DCDDEA', '#FFFFFF'],
    ['#D6BDCC', '#F5D5DE'],
    ['#D8CC9C', '#F7E5A4'],
  ],
  daisyEye: ['#D79A2E', '#F5C847'],
  /** The river: its depths, its body, and the sky caught down its middle. */
  water: ['#4C93CC', '#69ADE2', '#BDE1F6'],
  /** Ink for the outlines: a warm near-black, never pure. */
  ink: '#2D2932',
  streak: '#FFFEF8',
};

/* ─── Evening ────────────────────────────────────────────────── */

/**
 * The scene in dark mode: evening, the sun just gone down behind the far
 * hills. Only the sky takes a sunset's colours, from a photo taken at dusk:
 * coral along the hills, up through apricot and peach to lavender overhead.
 * The land keeps its own colours, lit now by the moon rather than the
 * afternoon sun: less light, and softer, so each surface takes the shade end
 * of its own ramp, dimmed and cooled a touch (`moon`). The sunset reaches the
 * land only where it would: the river mirrors it, the clouds catch it from
 * beneath, and the distance fades into its haze.
 */
export const EVENING = {
  /** The sky from the horizon up: how high each colour lies, in degrees, and the colour. */
  sky: [
    [0, '#E68F6A'],
    [2, '#F2A671'],
    [4, '#EBB490'],
    [6.5, '#DEB7A8'],
    [11, '#C5B2C0'],
    [18.5, '#AEA8CA'],
    [40, '#9894C2'],
  ] as [number, string][],
  /** Clouds lit from beneath by the sun gone down, their tops in the lavender of the sky. */
  cloud: '#F6CBB4',
  cloudShade: '#A9A0C3',
  /** The moon's light, laid over the land's own colours: dimmer than the sun's, and a little cooler. */
  moon: '#8D96AE',
  /** The river, mirroring the sunset: its depths, its body, and the glow down its middle. */
  water: ['#8F7B86', '#E8A47D', '#F8C08E'],
  /** The air over the far plain, warm with the glow at the horizon. */
  haze: '#AB8F7F',
  /** Seconds the light takes to turn, either way. */
  turn: 2.6,
};

/* ─── Camera ─────────────────────────────────────────────────── */

/**
 * The shot, framed by hand in the dev view on a wide screen: in front of the
 * tree and off to its right, looking past it, the trunk a third of the way
 * in from the left with open sky beyond for the wind. On a tall, narrow
 * screen the eye draws back along the same line and turns in toward the
 * tree, so it stays in frame. On a phone held upright it comes in close
 * instead, so the tree fills most of the screen.
 *
 * The world is only built as far as this shot can see, and the free camera
 * may only look about within it.
 */
export const SHOT = {
  /** Vertical field of view. Narrow, so the perspective stays flat like a drawing. */
  fov: 37,
  position: [27.92, 4.38, 26.82] as const,
  target: [10.12, 4.19, 0] as const,
  /** Where the eye turns, on the narrowest screens, and how much farther back it stands. */
  narrowTarget: [0.8, 4.3, 0] as const,
  drawBack: 1.5,
  /**
   * A phone held upright: nearer and wider, the tree filling about 70% of the
   * width, a little left of middle so there's room on its right for the leaf,
   * with sky above it for the leaf's loops. Framed for a screen of shape
   * `framedFor`; on narrower ones the eye stands back, so the tree keeps its
   * share of the width. Any screen narrower than the first `aspect` is a
   * phone; any wider than the second keeps the shot above; between the two,
   * the one turns into the other.
   */
  phone: {
    position: [32.3, 4.9, 18.4] as const,
    target: [0.7, 3.6, -0.8] as const,
    fov: 44,
    framedFor: 0.46,
    aspect: [0.56, 0.62] as const,
  },
  /** How far the free camera may turn about its target, either way, in degrees; and how much nearer or farther it may go. */
  freeTurn: 28,
  freeTilt: 16,
  freeReach: [0.55, 1.4] as const,
  /** Never closer to the grass than this. */
  minEyeHeight: 1.4,
};

/**
 * Frames a second: calm air needs few, and so does most of a gust — its
 * build-up, and the leaf's slow swinging fall. Only while the wind is
 * carrying a leaf, tumbling it along with the crown thrown about, or the
 * camera is moving, does the scene get the full rate.
 */
export const PACE = {
  calm: 30,
  full: 60,
};

/* ─── Ink ────────────────────────────────────────────────────── */

export const INK = {
  /** Line weight in CSS pixels. */
  weight: 1.15,
  /** How much an edge must stand proud of what's behind it to be drawn, as a fraction of its distance. */
  threshold: [0.014, 0.05] as const,
  /** Beyond these distances lines thin out, as they would in a drawing. */
  fade: [45, 170] as const,
  /**
   * Inside the crown, where one clump of leaves overlaps another: how dark the
   * faint line along the front clump's edge, and the shadow it lays on the one
   * behind — and how wide that shadow, in CSS pixels.
   */
  clumpLine: 0.3,
  clumpShadow: 0.11,
  clumpShadowWidth: 3.5,
};
