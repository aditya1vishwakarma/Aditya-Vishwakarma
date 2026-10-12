/**
 * Every dimension, colour and light level for the museum view lives here.
 *
 * Units are metres. Axes: +x runs along the shelving, +y is up, +z points
 * toward the viewer. The shelves hang a little in front of a cream backdrop.
 */

/* ─── Shelving ───────────────────────────────────────────────── */

export const SHELF = {
  thickness: 0.024,
  depth: 0.36,
  /** Shelves float in front of the backdrop so their shadows read. */
  backZ: -0.8,
  /** How far the undercut bevel pulls the underside in at each end. */
  bevel: 0.036,
  /** Radius of the eased arrises along the front and back. */
  ease: 0.0018,
};
export const SHELF_FRONT_Z = SHELF.backZ + SHELF.depth;

export const POST = {
  size: 0.028,
  /** Softened corners on the square section. */
  radius: 0.0035,
  /** Posts sit toward the back of the shelf, away from the panes. */
  z: -0.7,
  /** Hanging posts rise past the top of any screen; the struts under layer 5 run past the bottom. */
  topY: 5,
  bottomY: -3,
};

/** The cream wall behind everything. */
export const BACKDROP_Z = -0.95;

/**
 * One repeat of the shelf system, laid end to end as often as the board
 * needs and then some, so the shelving runs off both edges of the screen.
 *
 * Five hanging layers read off the reference (IMG_0930) top down, right to
 * left, and a sixth that bridges one repeat to the next. Each strut is
 * placed as a fraction of the shelf it meets:
 *
 *   Layer 1  the top. One strut, 20% in from its left, hangs through it
 *            and carries on down to layer 2.
 *   Layer 2  takes layer 1's strut 20% in from its right; holds layer 4
 *            from 20% in from its left. A hair higher than layer 3.
 *   Layer 3  like layer 1: its strut, 20% in from its right, hangs through
 *            it down to layer 4.
 *   Layer 4  the widest. Takes layer 3's strut 20% in from its left and
 *            layer 2's 12% in from its right; holds layer 5 at 65%.
 *   Layer 5  as wide again, under it all. Hangs from layer 4 near its left
 *            end; two struts go on down from it — one in line with layer
 *            1's, one 30% in, clear of the strut coming down into it. Its
 *            right end reaches just under the bridge's left strut.
 *   Layer 6  the bridge to the next repeat, hung between them as layer 4
 *            hangs between layers 3 and 2: from layer 1, 16% in from its
 *            right, and from the next repeat's layer 3, 16% in from its
 *            left. Each strut sits 12% in from the bridge's own ends (the
 *            left end let out 3.5cm more, for balance); the left strut runs
 *            on through it down to layer 5.
 *
 * Only the lengths, heights and those fractions are chosen; every position
 * follows from them, so each shelf lands where its struts say it must.
 *
 * A pane needs room above it: open sky, or a shelf high enough overhead —
 * as on layer 5, which shows its stretch under layers 2 and 1 but not the
 * part tucked close beneath layer 4.
 */
export const SECTION_W = 4.6;

export interface ShelfDef {
  id: string;
  y: number; // top surface
  x0: number;
  x1: number;
}

export interface PostDef {
  x: number;
  /** y of the bottom end — the shelf a post stands on, or out of sight below. */
  y0: number;
  /** y of the top end — a shelf underside, or out of sight above. */
  y1: number;
}

/** A shelf of the given length, placed so that x falls `f` of the way along it from its left end. */
const placed = (id: string, y: number, length: number, x: number, f: number): ShelfDef => ({
  id,
  y,
  x0: x - f * length,
  x1: x - f * length + length,
});
const along = (s: ShelfDef, f: number) => s.x0 + f * (s.x1 - s.x0);
/** A shelf carried by two struts, each `f` of its length in from its own end. */
const spanning = (id: string, y: number, left: number, right: number, f: number): ShelfDef => {
  const length = (right - left) / (1 - 2 * f);
  return { id, y, x0: left - f * length, x1: right + f * length };
};

// Chained from layer 3, the top left, through to layer 1, the top right.
const L3: ShelfDef = { id: '3', y: 1.356, x0: 0, x1: 1.39 };
const strut3 = along(L3, 0.8);
const L4 = placed('4', 1.086, 2.1, strut3, 0.2);
const strut2to4 = along(L4, 0.88);
const L2 = placed('2', 1.392, 1.24, strut2to4, 0.2);
const strut1 = along(L2, 0.8);
const L1 = placed('1', 1.638, 1.13, strut1, 0.2);
const strut4to5 = along(L4, 0.65);
const strut1to6 = along(L1, 0.84);
// Layer 5 reaches just past the bridge's left strut, so that strut can carry on down to it.
const L5: ShelfDef = { ...placed('5', 0.72, 2.18, strut4to5, 0.11), x1: strut1to6 + 0.15 };
const strut3to6 = SECTION_W + along(L3, 0.16);
const bridge = spanning('6', 1.13, strut1to6, strut3to6, 0.12);
// Its left end let out a few centimetres, for balance against layer 5 below.
const L6: ShelfDef = { ...bridge, x0: bridge.x0 - 0.035 };

export const SECTION_SHELVES: ShelfDef[] = [L1, L2, L3, L4, L5, L6];

const T = SHELF.thickness;
export const SECTION_POSTS: PostDef[] = [
  // Layer 1 hangs, and its strut runs on through it to layer 2.
  { x: strut1, y0: L2.y, y1: POST.topY },
  // Layer 3 hangs the same way, through to layer 4.
  { x: strut3, y0: L4.y, y1: POST.topY },
  // Layer 2 holds layer 4's right end.
  { x: strut2to4, y0: L4.y, y1: L2.y - T },
  // Layer 4 holds layer 5.
  { x: strut4to5, y0: L5.y, y1: L4.y - T },
  // Under layer 5: one in line with layer 1's strut, one 30% in.
  { x: strut1, y0: POST.bottomY, y1: L5.y - T },
  { x: along(L5, 0.3), y0: POST.bottomY, y1: L5.y - T },
  // The bridge hangs from layer 1 — a strut that runs on through it to layer
  // 5, as layer 1's first runs through it to layer 2 — and from the next
  // repeat's layer 3.
  { x: strut1to6, y0: L5.y, y1: L1.y - T },
  { x: strut3to6, y0: L6.y, y1: L3.y - T },
];

/** Empty sections beyond the board at each end, so the shelving never visibly stops. */
export const PAD_SECTIONS = 2;

/* ─── Panes ──────────────────────────────────────────────────── */

export const PANE = {
  /** Geometric-mean edge length: sqrt(w·h). Aspect decides the rest. */
  size: 0.31,
  maxW: 0.45,
  maxH: 0.38,
  thickness: 0.01,
  /** Back-lane panes read a touch larger, like objects set on a riser. */
  backScale: 1.1,
  frontScale: 0.9,
  /** How much a front pane may cover the pane behind it (fraction of the narrower). */
  overlap: 0.3,
  /** Clearance from shelf ends, posts and zone edges. */
  margin: 0.045,
  /** Gap between two panes in the same lane. */
  gap: 0.05,
  /** Back lane sits just off the wall side of the shelf; front lane keeps off the front edge. */
  backInset: 0.075,
  frontInset: 0.085,
  /** Hover heights: front panes sit on stands, back panes float. */
  floatMin: 0.025,
  floatMax: 0.06,
  standH: 0.012,
  /** Most a back pane is lifted to clear the front pane before it. */
  backRaise: 0.11,
  /** A pane may stand under a higher shelf only with at least this much clear height… */
  minHeadroom: 0.55,
  /** …and its top stays at least this far below that shelf. */
  headroomGap: 0.06,
};

/* ─── Light ──────────────────────────────────────────────────── */

/** Direction the suns' light travels: down and back toward the wall. Sets how far shadows fall. */
export const LIGHT_DIR: [number, number, number] = [0.0, -1.0, -1.25];

export const COLORS = {
  sun: '#FFF1DE',
  fillSky: '#FFF7EC',
  fillGround: '#B39575',
  hoverLight: '#FFEFD8',
};

export const INTENSITY = {
  /** Total of the shadow-casting suns, shared between them. */
  sun: 1.85,
  fill: 0.3,
  /** Studio reflections on the wood's satin finish. */
  environment: 0.32,
  exposure: 1.0,
  /**
   * Hover light — a soft, warm white, diffuse only (it never puts a shine on
   * the wood). It fades with distance along a bell curve of this spread, in
   * metres, rather than the sharp inverse falloff of a real bulb, which is
   * what made it read as a hot spot.
   */
  hover: 4.2,
  hoverSpread: 0.36,
  /** Hover glow added to the wall behind, at its centre, as a fraction of white. */
  hoverWall: 0.13,
};

/* ─── Camera & framing ───────────────────────────────────────── */

export const FRAME = {
  /** World heights the shelving fills: just under the lowest shelf to over the tallest pane. */
  contentBottomY: 0.64,
  contentTopY: 2.12,
  /** Room kept clear above, and for the controls along the bottom, in CSS px. */
  topPadPx: 24,
  bottomPadPx: 96,
};

export const CAMERA = {
  fov: 32,
  /** Never show less than this much shelf across, however narrow the window. */
  minVisibleW: 3.3,
  /** How far the eye sits below the framing's natural height — a touch under, looking a little up. */
  lower: 0.035,
  /** Depth used to measure "visible width" — the middle of the shelves. */
  measureZ: SHELF.backZ + SHELF.depth / 2,
  /** Empty shelf left showing past the first and last pane at either end of the slide. */
  endReveal: 0.55,
};

/* ─── Selection ──────────────────────────────────────────────── */

export const SELECT = {
  /** Fraction of the viewport width the selected pane takes. */
  widthFrac: 0.4,
  maxHeightFrac: 0.74,
  /** Screen-x of the pane's centre, as a fraction of the viewport width. */
  centerX: 0.29,
  /** Distance in front of the camera the pane comes to rest. */
  distance: 1.6,
};

/**
 * Shelf textures are downscaled to this. A pane on the shelf is at most a few
 * hundred device pixels across, so 640 stays sharp at a fraction of the
 * memory; the selected pane loads its own sharper copy.
 */
export const TEXTURE_MAX = 640;
export const DETAIL_TEXTURE_MAX = 2048;
