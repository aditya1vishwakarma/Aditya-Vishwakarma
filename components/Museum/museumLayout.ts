import type { MoodBoardItem } from '../../types';
import {
  PAD_SECTIONS,
  PANE,
  POST,
  SECTION_POSTS,
  SECTION_SHELVES,
  SECTION_W,
  SHELF,
  SHELF_FRONT_Z,
  type PostDef,
  type ShelfDef,
} from './museumConfig';

/**
 * Lays the board out along the shelving.
 *
 * The one rule everything else bends around: a pane needs room above it.
 * Open sky is best, but the shelves hang free, so a pane may also stand
 * beneath a higher shelf as long as there's generous headroom — never
 * tucked under a low overhang. The stretches that qualify are "zones", and
 * panes are packed into them in shallow clusters — a front lane and a
 * raised back lane — so a stretch can hold two or three panes.
 */

export type Lane = 'front' | 'back';

export interface Zone {
  x0: number;
  x1: number;
  /** Top of the surface the zone sits on. */
  y: number;
  /** Clear height up to the lowest shelf overhead; Infinity under open sky. */
  headroom: number;
}

export interface PanePlacement {
  item: MoodBoardItem;
  /** Centre of the pane's bottom edge, at rest. */
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  yaw: number;
  lane: Lane;
  /** Surface the pane stands over (for its contact shadow and glow pool). */
  surfaceY: number;
  /** Front panes stand in a slotted foot; back panes hover. */
  stand: boolean;
}

export interface CaseLayout {
  /** Sections that hold the board; the empty ones either side aren't counted. */
  sections: number;
  /** Where the board starts and ends: the outer edges of the first and last pane. */
  x0: number;
  x1: number;
  shelves: ShelfDef[];
  posts: PostDef[];
  zones: Zone[];
  panes: PanePlacement[];
}

/* ─── Small deterministic helpers ──────────────────────────────── */

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/** mulberry32 — tiny, seedable, good enough for placement jitter. */
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Interval = [number, number];

const subtract = (spans: Interval[], cut: Interval): Interval[] =>
  spans.flatMap(([a, b]) => {
    const [c, d] = cut;
    if (d <= a || c >= b) return [[a, b] as Interval];
    const out: Interval[] = [];
    if (c > a) out.push([a, c]);
    if (d < b) out.push([d, b]);
    return out;
  });

/* ─── Structure ────────────────────────────────────────────────── */

/** A typical pane's width; capacity is measured in these. */
const UNIT = PANE.size * 1.1;
const MIN_ZONE = UNIT * 0.85;

/**
 * How many panes a stretch of shelf can show without crowding: each pane
 * after the first adds what's left of it once it overlaps its neighbour.
 */
const capacity = (width: number) => {
  const step = UNIT * (1 - PANE.overlap);
  return width < MIN_ZONE ? 0 : Math.min(3, 1 + Math.floor((width - UNIT * 0.95) / step + 1e-6));
};

/** The board's sections, plus empty ones either side so the shelving runs on past the screen. */
function buildStructure(sections: number) {
  const shelves: ShelfDef[] = [];
  const posts: PostDef[] = [];
  for (let s = -PAD_SECTIONS; s < sections + PAD_SECTIONS; s++) {
    const dx = s * SECTION_W;
    SECTION_SHELVES.forEach((d) => shelves.push({ ...d, id: `${d.id}${s}`, x0: d.x0 + dx, x1: d.x1 + dx }));
    SECTION_POSTS.forEach((p) => posts.push({ ...p, x: p.x + dx }));
  }
  return { shelves, posts };
}

/** Every stretch of surface with room above it, inside the board's own sections. */
function findZones(shelves: ShelfDef[], posts: PostDef[], sections: number): Zone[] {
  const zones: Zone[] = [];
  const postCut = (p: PostDef): Interval => [p.x - POST.size / 2, p.x + POST.size / 2];
  const clearance = (s: ShelfDef, o: ShelfDef) => o.y - SHELF.thickness - s.y;

  for (const s of shelves) {
    const overhead = shelves.filter((o) => o.y > s.y);
    let open: Interval[] = [[s.x0, s.x1]];
    // A low shelf overhead closes the stretch beneath it; a high one leaves room.
    for (const o of overhead) if (clearance(s, o) < PANE.minHeadroom) open = subtract(open, [o.x0, o.x1]);
    // A post standing on this shelf, or passing down through it.
    for (const p of posts) if (p.y0 <= s.y + 1e-6 && p.y1 > s.y + SHELF.thickness) open = subtract(open, postCut(p));
    for (const [a, b] of open) {
      const above = overhead.filter((o) => o.x0 < b && o.x1 > a).map((o) => clearance(s, o));
      zones.push({ x0: a, x1: b, y: s.y, headroom: Math.min(Infinity, ...above) });
    }
  }

  const end = sections * SECTION_W;
  return zones
    .map((z) => ({ ...z, x0: z.x0 + PANE.margin, x1: z.x1 - PANE.margin }))
    .filter((z) => z.x1 - z.x0 >= MIN_ZONE && (z.x0 + z.x1) / 2 >= 0 && (z.x0 + z.x1) / 2 < end)
    .sort((a, b) => a.x0 - b.x0);
}

/* ─── Panes ───────────────────────────────────────────────────── */

/** Pane size for an image of this aspect ratio, before lane scaling. */
function baseSize(aspect: number) {
  let w = PANE.size * Math.sqrt(aspect);
  let h = PANE.size / Math.sqrt(aspect);
  const k = Math.min(1, PANE.maxW / w, PANE.maxH / h);
  w *= k;
  h *= k;
  return { w, h };
}

interface Draft {
  item: MoodBoardItem;
  w: number;
  h: number;
  lane: Lane;
}

/**
 * Pick the lane pattern that keeps the taller pane at the back, so a raised
 * back pane always clears the one standing in front of it.
 */
function assignLanes(items: { item: MoodBoardItem; w: number; h: number }[], zoneIndex: number): Draft[] {
  const patterns: Lane[][] =
    items.length === 1
      ? [[zoneIndex % 2 ? 'front' : 'back']]
      : items.length === 2
        ? [['back', 'front'], ['front', 'back']]
        : [['back', 'front', 'back'], ['front', 'back', 'front']];

  const score = (lanes: Lane[]) => {
    let s = 0;
    for (let i = 0; i + 1 < lanes.length; i++) {
      const [a, b] = [items[i], items[i + 1]];
      s += lanes[i] === 'back' ? a.h - b.h : b.h - a.h;
    }
    return s;
  };
  const best = patterns.reduce((p, q) => (score(q) > score(p) ? q : p));
  return items.map((it, i) => {
    const k = best[i] === 'back' ? PANE.backScale : PANE.frontScale;
    return { ...it, w: it.w * k, h: it.h * k, lane: best[i] };
  });
}

/** Left edges of a cluster, given how much each neighbouring pair may overlap. */
function clusterSpan(drafts: Draft[], overlap: number) {
  const xs: number[] = [0];
  for (let i = 1; i < drafts.length; i++) {
    const prev = drafts[i - 1];
    const cur = drafts[i];
    const step = prev.lane === cur.lane ? prev.w + PANE.gap : prev.w - overlap * Math.min(prev.w, cur.w);
    xs.push(xs[i - 1] + step);
  }
  const last = drafts.length - 1;
  return { xs, width: xs[last] + drafts[last].w };
}

function placeCluster(zone: Zone, zoneIndex: number, items: MoodBoardItem[], aspectOf: (i: MoodBoardItem) => number): PanePlacement[] {
  const width = zone.x1 - zone.x0;
  let drafts = assignLanes(
    items.map((item) => ({ item, ...baseSize(aspectOf(item)) })),
    zoneIndex,
  );

  // Under a shelf, every pane — raised back panes included — keeps clear of it.
  const maxTop = zone.y + zone.headroom - PANE.headroomGap;
  const tallest = Math.max(...drafts.map((d) => d.h));
  const fit = Math.min(1, (maxTop - zone.y - PANE.backRaise) / tallest);
  if (fit < 1) drafts = drafts.map((d) => ({ ...d, w: d.w * fit, h: d.h * fit }));

  // Tighten the layering first, then shrink, until the cluster fits its stretch.
  let overlap = PANE.overlap;
  let span = clusterSpan(drafts, overlap);
  while (span.width > width && overlap < 0.42) {
    overlap += 0.02;
    span = clusterSpan(drafts, overlap);
  }
  if (span.width > width) {
    const k = width / span.width;
    drafts = drafts.map((d) => ({ ...d, w: d.w * k, h: d.h * k }));
    span = clusterSpan(drafts, overlap);
  }

  const rand = rng(hash(items.map((i) => i.id).join('|')));
  const free = width - span.width;
  const start = zone.x0 + free * (0.5 + (rand() - 0.5) * 0.5);
  const centre = start + span.width / 2;

  const backZ = SHELF.backZ + PANE.backInset;
  const frontZ = SHELF_FRONT_Z - PANE.frontInset;

  const placed = drafts.map((d, i): PanePlacement => {
    const r = rng(hash(d.item.id));
    const x = start + span.xs[i] + d.w / 2;
    const isBack = d.lane === 'back';
    const float = PANE.floatMin + r() * (PANE.floatMax - PANE.floatMin);
    const lift = isBack ? Math.min(float, maxTop - zone.y - d.h) : PANE.standH;
    // Turn gently toward the middle of the cluster, as if set by hand.
    const toward = Math.sign(centre - x) || (r() < 0.5 ? -1 : 1);
    const yaw = toward * (isBack ? 0.02 + r() * 0.03 : 0.04 + r() * 0.05);
    return {
      item: d.item,
      x,
      y: zone.y + lift,
      z: (isBack ? backZ : frontZ) + (r() - 0.5) * 0.024,
      w: d.w,
      h: d.h,
      yaw,
      lane: d.lane,
      surfaceY: zone.y,
      stand: !isBack,
    };
  });

  // A back pane must clear the top of any front pane it stands behind.
  for (let i = 0; i < placed.length; i++) {
    const p = placed[i];
    if (p.lane !== 'back') continue;
    for (const j of [i - 1, i + 1]) {
      const q = placed[j];
      if (!q || q.lane !== 'front') continue;
      const need = q.y + q.h + 0.05 - (p.y + p.h);
      if (need > 0) p.y = Math.min(p.y + need, p.surfaceY + PANE.backRaise, maxTop - p.h);
    }
  }
  return placed;
}

/* ─── Entry point ─────────────────────────────────────────────── */

export function layoutCase(items: MoodBoardItem[], aspectOf: (i: MoodBoardItem) => number): CaseLayout {
  // Fewest sections that still hold everything — the board should feel
  // curated, not stretched thin across empty shelf.
  let sections = 1;
  let built = buildStructure(sections);
  let zones = findZones(built.shelves, built.posts, sections);
  while (zones.reduce((n, z) => n + capacity(z.x1 - z.x0), 0) < items.length && sections < 64) {
    sections++;
    built = buildStructure(sections);
    zones = findZones(built.shelves, built.posts, sections);
  }

  // Share the panes out in proportion to each stretch's capacity, carrying
  // the rounding error forward so the last section is never left bare.
  const caps = zones.map((z) => capacity(z.x1 - z.x0));
  const totalCap = caps.reduce((a, b) => a + b, 0);
  const fill = Math.min(1, items.length / Math.max(1, totalCap));
  let carry = 0;
  let next = 0;
  const panes: PanePlacement[] = [];
  zones.forEach((zone, zi) => {
    const exact = caps[zi] * fill + carry;
    let n = Math.min(caps[zi], Math.round(exact), items.length - next);
    if (zi === zones.length - 1) n = Math.min(caps[zi], items.length - next);
    carry = exact - n;
    if (n <= 0) return;
    panes.push(...placeCluster(zone, zi, items.slice(next, next + n), aspectOf));
    next += n;
  });

  const x0 = panes.length ? Math.min(...panes.map((p) => p.x - p.w / 2)) : 0;
  const x1 = panes.length ? Math.max(...panes.map((p) => p.x + p.w / 2)) : sections * SECTION_W;

  return { sections, ...built, zones, panes, x0, x1 };
}
