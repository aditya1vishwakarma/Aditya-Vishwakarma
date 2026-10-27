import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useIsPresent } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Instagram, Linkedin, Mail, Twitter } from 'lucide-react';
import { BLOG_POSTS, PHOTOS, PROJECTS, SOCIAL_LINKS } from '../../constants';
import type { Project } from '../../types';
import Squircle from '../UI/Squircle';
import { PANE_PAD, PANE_TITLE, usePaneHeld, usePaneLook, usePaneRadius, usePaneSettled, usePaneTitle } from './SectionPane';
import { photoPath } from './routes';

const { useNavigate } = ReactRouterDOM as any;

/**
 * What the pane shows, from the site's own lists: each section's list, and a
 * photo open on its own. A link to a project or a post opens it in the pane
 * to read, and carries the site's arrow, sliding in beside it on hover. On a
 * phone, each list keeps to the least it takes to choose from it.
 */

/** A section or piece of the site, by its address — on the hash, so it opens in the pane wherever the page is. */
const page = (path: string) => `#${path}`;

/** The museum is a room of its own, outside the one page. */
const MUSEUM = '/#/mindmuseum';

// Strong enough to read on the glass wherever it floats: 4.5:1 and up, as small text needs. A touch smaller on a phone.
const DETAIL = 'font-sans text-[10.5px] uppercase tracking-[0.15em] roomy:text-[11.5px] roomy:tracking-[0.16em]';
const META = `${DETAIL} text-charcoal/75`;
const BODY = 'font-sans text-[15.5px] leading-relaxed text-charcoal/80';

/**
 * A row or a tile pointed at is lifted onto the site's off-white. On a list's
 * frost that's plain to see; on the thickened glass of a list opened out, a
 * faint edge and shadow show it too.
 */
const LIFT = 'transition-[background-color,box-shadow] duration-300 hover:bg-background/80 focus-visible:bg-background/80';
const LIFT_EDGED = `${LIFT} hover:shadow-[0_0_0_1px_rgba(51,51,51,0.08),0_10px_28px_-14px_rgba(0,0,0,0.22)] focus-visible:shadow-[0_0_0_1px_rgba(51,51,51,0.08),0_10px_28px_-14px_rgba(0,0,0,0.22)]`;
const lift = (look: 'select' | 'view') => (look === 'view' ? LIFT_EDGED : LIFT);

/** A card's arrow: hidden until the card is pointed at, then sliding in from the left, as on the home page's cards. */
const CardArrow: React.FC<{ size?: number; className?: string }> = ({ size = 22, className = '' }) => (
  <ArrowRight
    size={size}
    strokeWidth={1.5}
    aria-hidden="true"
    className={`shrink-0 text-moss opacity-0 -translate-x-3 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 ${className}`}
  />
);

/**
 * Pictures come on a few at a time, a frame apart, in the order they're laid
 * out: a grid of them never asks the browser to fetch, decode and draw them
 * all in one frame, and they sweep in across it.
 */
const PER_FRAME = 4;
const waiting: (() => void)[] = [];
let ticking = 0;
const tick = () => {
  waiting.splice(0, PER_FRAME).forEach((go) => go());
  ticking = waiting.length ? requestAnimationFrame(tick) : 0;
};
const inTurn = (go: () => void) => {
  waiting.push(go);
  ticking ||= requestAnimationFrame(tick);
  return () => {
    const at = waiting.indexOf(go);
    if (at >= 0) waiting.splice(at, 1);
  };
};

/**
 * A picture in a pane, filling its frame. It's drawn once the pane and its
 * card have come to rest — so fetching and decoding it never holds up the
 * glass, or the card coming in — in its turn among the others, and fades up
 * once it's decoded, so drawing it never waits on that either. It grows a
 * touch while its card is pointed at.
 *
 * Never lazy: a pane's pictures are all in view as it rests, and Safari can
 * leave a lazy one in a clipped frame unloaded — so it never fades up. One
 * already in hand when it's drawn is shown as soon as it's decoded, load
 * event or no.
 */
const PaneImage: React.FC<{ src: string; grow: string; alt?: string; onError?: React.ReactEventHandler<HTMLImageElement> }> = ({ src, grow, alt = '', onError }) => {
  const settled = usePaneSettled();
  const [turn, setTurn] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => (settled ? inTurn(() => setTurn(true)) : undefined), [settled]);
  const ready = useCallback((img: HTMLImageElement) => {
    // Not decoded after all (it's been given another picture to fall back on, say): shown if it's there to show.
    img.decode().then(
      () => setShown(true),
      () => img.complete && img.naturalWidth > 0 && setShown(true),
    );
  }, []);
  const inHand = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth) ready(img);
    },
    [ready],
  );
  if (!settled || !turn) return null;
  return (
    <img
      ref={inHand}
      src={src}
      alt={alt}
      decoding="async"
      onLoad={(e) => ready(e.currentTarget)}
      onError={onError}
      className={`h-full w-full object-cover ${grow} ${shown ? 'opacity-100' : 'opacity-0'}`}
      style={{ transition: 'opacity 0.45s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
    />
  );
};

/** Start a picture loading ahead of the pane that shows it, so it's in hand by the time the pane opens. */
const preload = (src: string) => {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  // Decoded too, off the page's own work, so drawing it in the pane later costs next to nothing.
  img.decode?.().catch(() => {});
};

/** Whether there's room for a desktop's lists: `roomy:` in index.css, for what's sized in script. */
const ROOMY = '(width >= 600px) and (height >= 500px)';
const useRoomy = () => {
  const [roomy, setRoomy] = useState(() => window.matchMedia(ROOMY).matches);
  useEffect(() => {
    const query = window.matchMedia(ROOMY);
    const onChange = () => setRoomy(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return roomy;
};

/**
 * How tall the pane's reading area is from the top of `inside` down, inside
 * the scroll's bottom padding — for a section that fills the pane, or keeps
 * something at its foot. Whatever is above it on the glass is taken off: the
 * head the scroll starts beneath, and a list's line about itself.
 */
const usePaneRoom = (inside: React.RefObject<HTMLElement | null>) => {
  const [room, setRoom] = useState<number | null>(null);
  // Made while the glass is still on its way: the height the scroll will have, not the one it has this frame.
  const held = usePaneHeld();
  useLayoutEffect(() => {
    const el = inside.current;
    const scroller = el?.closest<HTMLElement>('[data-pane-scroll]');
    if (!el || !scroller) return;
    const measure = () => {
      // How far down the scroll it starts, by layout — not by where its card is, turned, on its way in.
      let top = 0;
      let at: HTMLElement | null = el;
      while (at && at !== scroller) {
        top += at.offsetTop;
        at = at.offsetParent as HTMLElement | null;
      }
      if (!at) top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
      setRoom((held ?? scroller.clientHeight) - top - (parseFloat(getComputedStyle(scroller).paddingBottom) || 0));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    if (el.parentElement) ro.observe(el.parentElement);
    measure();
    return () => ro.disconnect();
  }, [inside, held]);
  return room;
};

/* ─── Work ─────────────────────────────────────────────────────── */

let workAsked = false;

/** Start the selected projects' pictures loading, once, so the cards are full by the time Work opens. */
export const prefetchWork = () => {
  if (workAsked) return;
  workAsked = true;
  for (const p of PROJECTS) if (p.isSelected && p.imageUrl) preload(p.imageUrl);
};

/** What a project is, and when. */
const details = (p: Project) => `${p.category} · ${p.date}`;

/**
 * Selected works to a view: three on a list's glass, four opened out. Past
 * that, they're swiped across, the next one just showing at the edge, so
 * it's plain there are more.
 */
const PER_VIEW = { select: 3, view: 4 };
/** As many columns as the room there is takes, up to a view's worth. */
const COLUMNS = {
  select: '[--per:1] @min-[440px]:[--per:2] @min-[680px]:[--per:3]',
  view: '[--per:1] @min-[440px]:[--per:2] @min-[680px]:[--per:3] @min-[920px]:[--per:4]',
};

/**
 * A selected work, on a tile of its own: its picture over its name, what it
 * is and when, and a line about it, with an arrow in the corner when it's
 * pointed at. On a phone, a row: a small picture beside its name, what it is
 * and when. Each nests its picture's corners in its own: its radius is the
 * picture's and the room between.
 */
const SelectedWork: React.FC<{ p: Project; look: 'select' | 'view' }> = ({ p, look }) => {
  const roomy = useRoomy();
  // The picture's corners, and the tile's: the picture's and the room round it.
  const picture = roomy ? 18 : 12;
  const tile = picture + (roomy ? 10 : 8);
  return (
    <a href={page(p.path)} className="group relative flex items-center gap-4 p-2 focus-visible:outline-none roomy:block roomy:p-2.5">
      {/* Lifted, pointed at: the site's off-white, in a squircle as the glass is — with a faint edge and a shadow on
          the thickened glass of an expanded view, drawn round the squircle itself. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 ${
          look === 'view' ? '[filter:drop-shadow(0_0_0.75px_rgba(51,51,51,0.3))_drop-shadow(0_10px_16px_rgba(0,0,0,0.1))]' : ''
        }`}
      >
        <Squircle radius={tile} smoothing={1} className="h-full w-full bg-background/80" />
      </span>
      {p.imageUrl && (
        <Squircle
          radius={picture}
          smoothing={1}
          shadow="0 10px 24px -14px rgba(0,0,0,0.35)"
          wrapperClassName="relative aspect-[16/10] w-[38%] max-w-[180px] shrink-0 roomy:w-auto roomy:max-w-none"
          className="h-full w-full bg-charcoal/5"
        >
          <PaneImage src={p.imageUrl} grow="group-hover:scale-[1.03]" />
        </Squircle>
      )}
      <div className="relative min-w-0 roomy:px-1.5 roomy:pb-7 roomy:pt-4">
        <h3 className="font-serif text-[19px] leading-[1.15] tracking-[-0.015em] text-charcoal roomy:text-[clamp(22px,1.9vw,26px)] roomy:leading-[1.1]">{p.title}</h3>
        <p className={`mt-1.5 ${META}`}>{details(p)}</p>
        <p className={`mt-2.5 hidden roomy:block ${BODY}`}>{p.description}</p>
      </div>
      <CardArrow className="absolute bottom-3.5 right-3.5 hidden roomy:block" />
    </a>
  );
};

/**
 * The selected works, and then the un-selected, a section of their own: a
 * row each, what and when beside its name and a line about it, cut to two
 * lines on a phone.
 */
export const WorkSection: React.FC = () => {
  const look = usePaneLook();
  const selected = PROJECTS.filter((p) => p.isSelected);
  const more = PROJECTS.filter((p) => !p.isSelected && !p.isRedirect);
  const archive = PROJECTS.find((p) => p.isRedirect);
  const across = selected.length > PER_VIEW[look];

  return (
    <div className="flex flex-col gap-10 roomy:gap-14">
      {/* The tiles' own room hangs past the column, so their pictures line up with everything else. */}
      <div data-pane-part="selected" className="@container -mx-2 roomy:-mx-2.5">
        <div
          className={`grid gap-1.5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))] roomy:gap-x-3 roomy:gap-y-4 ${COLUMNS[look]} ${
            across
              ? 'roomy:flex roomy:snap-x roomy:snap-mandatory roomy:overflow-x-auto roomy:[scrollbar-width:none] roomy:[&::-webkit-scrollbar]:hidden'
              : 'roomy:[grid-template-columns:repeat(var(--per),minmax(0,1fr))]'
          }`}
        >
          {selected.map((p) => (
            <div
              key={p.path}
              className={across ? 'roomy:shrink-0 roomy:snap-start roomy:[flex-basis:calc((100cqw_-_var(--per)*12px)/(var(--per)_+_0.12))]' : undefined}
            >
              <SelectedWork p={p} look={look} />
            </div>
          ))}
        </div>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="unselected-works" data-pane-part="unselected">
          <h2 id="unselected-works" className={PANE_TITLE}>
            {archive?.title ?? 'Un-Selected Works'}
          </h2>
          {archive && <p className={`mt-4 ${BODY}`}>{archive.description}</p>}
          <ul className="mt-4 roomy:mt-6">
            {more.map((p) => (
              <li key={p.path} className="border-b border-charcoal/10 last:border-b-0">
                <a href={page(p.path)} className={`group -mx-4 flex items-center gap-6 rounded-[20px] px-4 py-4 focus-visible:outline-none roomy:py-6 ${lift(look)}`}>
                  <div className="hidden w-[26%] shrink-0 roomy:block">
                    <span className={`block ${META}`}>{p.date}</span>
                    <span className={`mt-1 block ${DETAIL} text-moss`}>{p.category}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`mb-1.5 roomy:hidden ${META}`}>{details(p)}</p>
                    <h3 className="font-serif text-[20px] leading-snug text-charcoal transition-transform duration-300 group-hover:translate-x-1 roomy:text-[clamp(24px,2.3vw,32px)]">
                      {p.title}
                    </h3>
                    <p className={`mt-1.5 line-clamp-2 roomy:mt-3 roomy:line-clamp-none ${BODY}`}>{p.description}</p>
                  </div>
                  <CardArrow size={24} className="hidden roomy:block" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

/* ─── Writing ──────────────────────────────────────────────────── */

/** Where else there's writing of mine, at the head of the list. */
export const WRITING_CAPTION = (
  <>
    Some of my thoughts and ramblings.
  </>
);

const CATEGORIES = ['All', ...Array.from(new Set(BLOG_POSTS.map((p) => p.category)))];

const CHIP =
  'rounded-full px-3 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-300 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss';
const CHIP_ON = 'bg-white/65 text-charcoal shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.06),0_3px_10px_-3px_rgba(0,0,0,0.12)]';
const CHIP_OFF = 'text-charcoal/65 hover:bg-white/30 hover:text-charcoal';

/**
 * The posts, under a compact choice of what they're on — chips, the one
 * chosen on a pill as the nav's open section is. Each post: when, and how
 * long to read; its name; a line about it, cut to two on a phone.
 */
export const WritingSection: React.FC = () => {
  const look = usePaneLook();
  const [only, setOnly] = useState('All');
  const posts = only === 'All' ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === only);
  return (
    <>
      {/* Tucked up under the line about the list, its first chip's word level with it. */}
      <div role="group" aria-label="Show posts on" className="-ml-3 -mt-2 mb-5 flex flex-wrap gap-1">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" aria-pressed={only === c} onClick={() => setOnly(c)} className={`${CHIP} ${only === c ? CHIP_ON : CHIP_OFF}`}>
            {c}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10">
        {posts.map((post) => (
          <li key={post.path}>
            <a href={page(post.path)} className={`group -mx-4 my-1 block rounded-[20px] px-4 py-4 focus-visible:outline-none roomy:py-6 ${lift(look)}`}>
              <p className={META}>
                {post.date} · {post.readTime}
              </p>
              <div className="mt-2 flex items-start justify-between gap-4 roomy:mt-2.5">
                <h3 className="font-serif text-[21px] leading-[1.15] tracking-[-0.015em] text-charcoal roomy:text-[29px] roomy:leading-[1.1]">{post.title}</h3>
                <CardArrow className="mt-1.5 hidden roomy:block" />
              </div>
              <p className={`mt-2 line-clamp-2 max-w-[60ch] roomy:mt-3 roomy:line-clamp-none ${BODY}`}>{post.excerpt}</p>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
};

/* ─── Photos ───────────────────────────────────────────────────── */

let photosAsked = false;

/** Start the gallery's previews loading, once, so they're in hand by the time the pane opens. About 2 MB in all. */
export const prefetchPhotos = () => {
  if (photosAsked) return;
  photosAsked = true;
  for (const photo of PHOTOS) preload(photo.preview);
};

/**
 * A preview that won't decode — some of the old ones are AVIF tiled in a grid,
 * which Firefox refuses — is swapped for the full image, so the cell is never
 * left empty. Once the previews are rebuilt (devtools/make-previews.mjs), this
 * never fires.
 */
const fallBackToFull = (full: string) => (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.dataset.fellBack) return;
  img.dataset.fellBack = 'true';
  img.src = full;
};

/** What the photos are, at the head of the grid. */
export const PHOTOS_CAPTION = "I'm also a hobbyist photographer. Here are some of my favourites! I shoot on a Fujifilm XT-4";

/** Between photos in the grid. */
const GAP = 8;
/** Where a photo grows from, pointed at: its outer edge, at the grid's sides, so it grows inward. */
const growFrom = (i: number, cols: number, rows: number) => {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = cols === 1 ? 'center' : col === 0 ? 'left' : col === cols - 1 ? 'right' : 'center';
  const y = rows === 1 ? 'center' : row === 0 ? 'top' : row === rows - 1 ? 'bottom' : 'center';
  return `${x} ${y}`;
};

/** Smaller than this and the photos stop filling the pane: the grid scrolls instead. */
const MIN_CELL = 64;

/**
 * Columns and rows for `n` photos filling a `width` × `height` box: cells as
 * near square as can be, and as few left empty as can be — each one empty
 * counts against a layout as much as a quarter-step in shape does.
 */
const fitGrid = (n: number, width: number, height: number) => {
  let best: { cols: number; rows: number; cell: number; score: number } | null = null;
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const empty = cols * rows - n;
    const w = (width - (cols - 1) * GAP) / cols;
    const h = (height - (rows - 1) * GAP) / rows;
    if (w <= 0 || h <= 0 || empty >= cols) continue;
    const score = Math.abs(Math.log(w / h)) + 0.25 * empty;
    if (!best || score < best.score) best = { cols, rows, cell: Math.min(w, h), score };
  }
  return best;
};

/**
 * Every photo at once, filling the pane: as many columns and rows as suit its
 * shape, each photo cropped to its cell. Each opens on its own to look at.
 */
export const PhotosSection: React.FC = () => {
  const root = useRef<HTMLUListElement>(null);
  const room = usePaneRoom(root);
  // The grid's columns and rows, and whether the photos fill the pane at a size worth seeing. Only a
  // new layout is kept, not every size: while the window's resized, the pane's width changes every
  // frame, and the grid's cells follow it on their own.
  const [fit, setFit] = useState<{ cols: number; rows: number } | null>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || room === null) return;
    const measure = () => {
      const best = fitGrid(PHOTOS.length, el.clientWidth, room);
      const next = best && best.cell >= MIN_CELL ? { cols: best.cols, rows: best.rows } : null;
      setFit((f) => (f?.cols === next?.cols && f?.rows === next?.rows ? f : next));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [room]);

  useEffect(prefetchPhotos, []);

  const fills = fit !== null;

  return (
    <ul
      ref={root}
      className="grid"
      style={{
        gap: GAP,
        ...(fills && room !== null
          ? { height: room, gridTemplateColumns: `repeat(${fit.cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${fit.rows}, minmax(0, 1fr))` }
          : { gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))' }),
      }}
    >
        {PHOTOS.map((photo, i) => (
          <li key={photo.preview} className="relative min-h-0 hover:z-10 focus-within:z-10">
            {/* Pointed at, a photo lifts out of the grid — grown from its outer edges inward at the grid's sides, so it
                never reaches past the glass and brings up a scrollbar. */}
            <a
              href={page(photoPath(i))}
              aria-label={`Open photo ${i + 1} of ${PHOTOS.length}`}
              className={`group block w-full overflow-hidden rounded-[12px] bg-charcoal/5 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.08] hover:shadow-[0_14px_30px_-10px_rgba(0,0,0,0.45)] focus-visible:scale-[1.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss ${fills ? 'h-full' : 'aspect-square'}`}
              style={{ transformOrigin: fit ? growFrom(i, fit.cols, fit.rows) : 'center' }}
            >
              <PaneImage src={photo.preview} onError={fallBackToFull(photo.full)} grow="" />
            </a>
          </li>
        ))}
    </ul>
  );
};

const STEP_BUTTON =
  'flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/10 bg-white/60 text-charcoal/75 shadow-sm transition-colors duration-300 ' +
  'hover:bg-white/90 hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss';

/**
 * One photo, open on its own to look at: as large as the pane allows, with
 * the ones either side a press or an arrow key away. They load meanwhile, so
 * the next is in hand.
 */
export const PhotoPiece: React.FC<{ index: number }> = ({ index }) => {
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const room = usePaneRoom(root);
  const settled = usePaneSettled();
  const current = useIsPresent();
  const named = usePaneTitle();
  const [shown, setShown] = useState(false);
  const count = PHOTOS.length;
  // Each step along stands in for the last, so Back still goes straight to the grid.
  const move = useCallback((by: number) => navigate(photoPath((index + by + count) % count), { replace: true }), [index, count, navigate]);

  useEffect(() => {
    preload(PHOTOS[(index + 1) % count].full);
    preload(PHOTOS[(index - 1 + count) % count].full);
  }, [index, count]);

  // Only the photo on show answers the arrows, not the one going.
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move(-1);
      else if (e.key === 'ArrowRight') move(1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, move]);

  return (
    <div ref={root} className="flex flex-col" style={room !== null ? { height: room } : undefined}>
      <h2 {...named} className="sr-only">
        Photo {index + 1} of {count}
      </h2>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-14">
        {settled && (
          <img
            src={PHOTOS[index].full}
            alt={`Photo ${index + 1} of ${count}`}
            decoding="async"
            onLoad={() => setShown(true)}
            className={`max-h-full max-w-full rounded-[14px] object-contain shadow-[0_22px_44px_-20px_rgba(0,0,0,0.45)] ${shown ? 'opacity-100' : 'opacity-0'}`}
            style={{ transition: 'opacity 0.45s ease' }}
          />
        )}
        <button type="button" aria-label="Previous photo" onClick={() => move(-1)} className={`${STEP_BUTTON} absolute left-0 top-1/2 -translate-y-1/2`}>
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <button type="button" aria-label="Next photo" onClick={() => move(1)} className={`${STEP_BUTTON} absolute right-0 top-1/2 -translate-y-1/2`}>
          <ChevronRight size={24} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

/* ─── About ────────────────────────────────────────────────────── */

const APPROACH = [
  {
    title: 'My approach to the “what”',
    text: "Solve the user's problem. Find the signal in the noise, define the product's core issue, and make sure every design decision is in service of a singular, impactful user experience.",
  },
  {
    title: 'My approach to the “how”',
    text: 'Bridge the gap of user experience with human intuition as guidance and data as my backup. The final output has to be a natural evolution that is as functional as it is beautiful.',
  },
];

/** Me, for the About pane: the portrait among the photos. */
const PORTRAIT = PHOTOS.find((p) => p.preview.includes('/pfp.'));

// Smaller on a shorter screen, so About never needs a scroll.
const ABOUT_BODY = 'font-sans text-[14px] leading-[1.5] text-charcoal/80 roomy:text-[clamp(13.5px,1.75vh,15px)]';

/**
 * The way to the museum, nested in the glass's bottom corners: as far from
 * the glass's edges at the sides as at the foot, its own corners smoothed as
 * the glass's are, and concentric with them — its radius the glass's less
 * the room between.
 */
const MuseumCard: React.FC = () => {
  const radius = usePaneRadius();
  const room = Math.round(radius * 0.4);
  return (
    <a
      href={MUSEUM}
      className="group mt-auto block focus-visible:outline-none"
      style={{ marginInline: `calc(${room}px - ${PANE_PAD.sides})`, marginBottom: `calc(${room}px - ${PANE_PAD.bottom})` }}
    >
      <Squircle
        radius={radius - room}
        smoothing={1}
        className="flex items-center justify-between gap-6 bg-white/35 px-5 py-3.5 transition-colors duration-300 group-hover:bg-background/80 group-focus-visible:bg-background/80 roomy:px-6 roomy:py-4"
      >
        <span>
          <span className="block font-serif text-[20px] leading-tight text-moss roomy:text-[22px]">My Mind Museum</span>
          <span className={`mt-1 block ${ABOUT_BODY}`}>A Mood Board: Some artifacts, interfaces, music, and projects that inspire me.</span>
        </span>
        <CardArrow size={24} />
      </Squircle>
    </a>
  );
};

/** The least width About needs for its picture beside the approaches, rather than under them. */
const PICTURE_BESIDE = 400;
/** The picture's shape beside the approaches, as tall as they are: a little taller than it's wide. */
const PICTURE_SHAPE = 1.15;

/**
 * Who I am, at a glance: a few lines across the top; under them, a picture of
 * me with how I work stacked beside it, the picture as tall as the two; and,
 * at the foot, the way to the museum. Where there isn't the width, one under
 * another, the picture last.
 */
export const AboutSection: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);
  const room = usePaneRoom(root);
  const roomy = useRoomy();
  const picture = useRef<HTMLDivElement>(null);
  const approaches = useRef<HTMLDivElement>(null);
  const [across, setAcross] = useState<number | null>(null);
  const beside = roomy && across !== null && across >= PICTURE_BESIDE;
  const [width, setWidth] = useState(200);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const look = () => setAcross(el.clientWidth);
    look();
    const ro = new ResizeObserver(look);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The picture's width, chosen so that, as tall as the approaches beside it, it keeps its shape — a narrower
  // picture leaves them more width, and fewer lines. Then narrower still, if it must be, so About never scrolls.
  useLayoutEffect(() => {
    const pic = picture.current;
    const text = approaches.current;
    const whole = root.current;
    if (!beside || !pic || !text || !whole) return;
    let live = true;
    const fit = () => {
      if (!live) return;
      const row = (pic.parentElement as HTMLElement).clientWidth;
      const least = Math.round(row * 0.3);
      const set = (w: number) => (pic.style.width = `${w}px`);
      let best = Math.round(row * 0.5);
      let miss = Infinity;
      for (let w = best; w >= least; w -= 8) {
        set(w);
        const off = Math.abs(text.offsetHeight / w - PICTURE_SHAPE);
        if (off < miss) [miss, best] = [off, w];
      }
      set(best);
      while (room !== null && whole.offsetHeight > room + 1 && best > least) set((best = Math.max(least, best - 8)));
      setWidth(best);
    };
    fit();
    document.fonts?.ready.then(fit);
    return () => {
      live = false;
    };
  }, [beside, across, room]);

  return (
    <div ref={root} className="flex flex-col" style={room !== null ? { minHeight: room } : undefined}>
      <p className="font-sans text-[15px] leading-[1.6] text-charcoal/85 roomy:text-[clamp(14px,1.9vh,16.5px)] roomy:leading-[1.55]">
        I'm a Bay Area native who grew up in Cupertino. Previously, I was helping marketing teams scale growth via GTM internal tools. My goal in life is to
        make products that real people use, and help the world be a more beautiful and intentional place.
      </p>
      <div className={beside ? 'my-[clamp(16px,2.8vh,24px)] flex gap-6' : 'mb-5 mt-5 flex flex-col gap-5'}>
        {PORTRAIT && (
          <div ref={picture} className={beside ? 'relative shrink-0' : 'relative order-last aspect-[5/4] w-full'} style={beside ? { width } : undefined}>
            <Squircle
              radius={beside ? 28 : 24}
              smoothing={1}
              shadow="0 10px 24px -12px rgba(0,0,0,0.35)"
              wrapperClassName="absolute inset-0"
              className="h-full w-full bg-charcoal/5"
            >
              <PaneImage src={PORTRAIT.preview} alt="Aditya Vishwakarma" onError={fallBackToFull(PORTRAIT.full)} grow="" />
            </Squircle>
          </div>
        )}
        <div ref={approaches} className={beside ? 'flex min-w-0 flex-1 flex-col gap-[clamp(14px,2.6vh,24px)] self-start' : 'flex flex-col gap-5 roomy:gap-6'}>
          {APPROACH.map((a) => (
            <div key={a.title}>
              <h3 className="font-serif text-[19px] leading-tight text-charcoal roomy:text-[clamp(19px,2.4vh,22px)]">{a.title}</h3>
              <p className={`mt-2 ${ABOUT_BODY}`}>{a.text}</p>
            </div>
          ))}
        </div>
      </div>
      <MuseumCard />
    </div>
  );
};

/* ─── Contact ──────────────────────────────────────────────────── */

const CONTACTS = [
  { label: 'Email me', href: SOCIAL_LINKS.email, Icon: Mail },
  { label: 'LinkedIn', href: SOCIAL_LINKS.linkedin, Icon: Linkedin },
  { label: 'Instagram', href: SOCIAL_LINKS.instagram, Icon: Instagram },
  { label: 'Twitter', href: SOCIAL_LINKS.twitter, Icon: Twitter },
];

/** Who made the site, and where — as at the foot of every page — kept at the foot of the pane. */
export const ContactSection: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);
  const room = usePaneRoom(root);
  return (
    <div ref={root} className="flex flex-col" style={room !== null ? { minHeight: room } : undefined}>
      <p className="font-serif text-[25px] leading-snug text-charcoal">Feel free to reach out!</p>
      <p className={`mt-2 ${BODY}`}>I'm always open to collaboration and new opportunities.</p>
      <ul className="mt-7 divide-y divide-charcoal/10 border-y border-charcoal/10">
        {CONTACTS.map(({ label, href, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="group flex items-center gap-3 py-4 font-sans text-[16px] text-charcoal transition-colors hover:text-moss focus-visible:text-moss focus-visible:outline-none"
            >
              <Icon size={19} strokeWidth={1.6} className="text-charcoal/60 transition-colors group-hover:text-moss" />
              {label}
              <CardArrow size={18} className="ml-auto" />
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-1 pt-10 font-sans text-[13px] text-charcoal/75">
        <p>Designed by Aditya, Built with Claude</p>
        <p>California {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};
