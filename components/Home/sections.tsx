import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useIsPresent } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Instagram, Linkedin, Mail, Twitter } from 'lucide-react';
import { BLOG_POSTS, MOBILE_MAX, PHOTOS, PROJECTS, SHORT_MAX, SOCIAL_LINKS } from '../../constants';
import type { Project } from '../../types';
import Squircle from '../UI/Squircle';
import { PANE_PAD, PANE_TITLE, usePaneHeld, usePaneLook, usePaneRadius, usePaneSettled, usePaneTitle } from './SectionPane';
import { photoPath } from './routes';
import { usePhotoGestures } from './photoGestures';
import { useTouch } from './touch';

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
// A row's line about it: on a phone, a step down from its name, so the name leads.
const LINE = 'font-sans text-[14px] leading-[1.45] text-charcoal/75 roomy:text-[15.5px] roomy:leading-relaxed roomy:text-charcoal/80';

/**
 * A row or a tile pointed at, or tapped (`useTapLift`), is lifted onto the
 * site's off-white. On a list's frost that's plain to see; on the thickened
 * glass of a list opened out, a faint edge and shadow show it too. A phone's
 * rows are on cards of their own instead (`CardFill`).
 */
const LIFT =
  'transition-[background-color,box-shadow] duration-300 roomy:hover:bg-background/80 roomy:focus-visible:bg-background/80 ' +
  'roomy:data-[lifted]:bg-background/80 roomy:data-[lifted]:duration-0';
const LIFT_EDGED = `${LIFT} roomy:hover:shadow-[0_0_0_1px_rgba(51,51,51,0.08),0_10px_28px_-14px_rgba(0,0,0,0.22)] roomy:focus-visible:shadow-[0_0_0_1px_rgba(51,51,51,0.08),0_10px_28px_-14px_rgba(0,0,0,0.22)] roomy:data-[lifted]:shadow-[0_0_0_1px_rgba(51,51,51,0.08),0_10px_28px_-14px_rgba(0,0,0,0.22)]`;
const lift = (look: 'select' | 'view') => (look === 'view' ? LIFT_EDGED : LIFT);

/** Held down on a touch screen, a row stays lifted, rather than iOS peeking at its page or selecting its words. */
const HELD = '[@media(hover:none)]:select-none [@media(hover:none)]:[-webkit-touch-callout:none]';

/**
 * A tap on a row lifts it, as pointing at it does: a beat after the finger
 * lands, so a list scrolled by a finger on a row doesn't flash, or as it
 * lifts, for a quick tap. Chosen, the row is held lifted a moment before its
 * piece opens, so it's plain which was chosen; and it stays lifted as the
 * list goes. A tap that doesn't choose it — the finger held, say — lets it go.
 */
const TAP = { lift: 70, hold: 110, letGo: 300 };
let pressed: { row: HTMLElement; timer: number } | null = null;
let opening: { row: HTMLElement; timer: number } | null = null;

const setLifted = (row: HTMLElement, on: boolean) => {
  if (on) row.dataset.lifted = '';
  else delete row.dataset.lifted;
};

const letGo = () => {
  if (!pressed) return;
  window.clearTimeout(pressed.timer);
  setLifted(pressed.row, false);
  pressed = null;
};

/** The handlers for a row of a list, to lift it as it's tapped and open its piece once it's been seen to lift. */
const useTapLift = () => {
  const navigate = useNavigate();
  return useMemo(
    () => ({
      onPointerDown: (e: React.PointerEvent<HTMLAnchorElement>) => {
        if (e.pointerType === 'mouse') return;
        letGo();
        const row = e.currentTarget;
        pressed = { row, timer: window.setTimeout(() => setLifted(row, true), TAP.lift) };
      },
      // The finger scrolled the list instead.
      onPointerCancel: letGo,
      onPointerUp: (e: React.PointerEvent<HTMLAnchorElement>) => {
        if (pressed?.row !== e.currentTarget) return;
        window.clearTimeout(pressed.timer);
        setLifted(pressed.row, true);
        pressed.timer = window.setTimeout(letGo, TAP.letGo);
      },
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (pressed?.row !== e.currentTarget) return;
        // Followed by the router after the hold, as any link within the site is (HomeHero), so Back counts the step.
        e.preventDefault();
        window.clearTimeout(pressed.timer);
        const row = pressed.row;
        const to = row.getAttribute('href')!.slice(1);
        pressed = null;
        // Another chosen before the last had opened: this one opens instead.
        if (opening) {
          window.clearTimeout(opening.timer);
          if (opening.row !== row) setLifted(opening.row, false);
        }
        opening = { row, timer: window.setTimeout(() => ((opening = null), navigate(to)), TAP.hold) };
      },
    }),
    [navigate],
  );
};

/**
 * On a phone, where nothing points at them, the un-selected works and the
 * posts are cards from the first: each on a fill of its own, so it's plain
 * each is a way in — the fill's enough, with no arrow, so its words have the
 * room. A card keeps to the column, its edges in line with the list's name
 * and the selected works' pictures, and its words sit 16px in. Its corners
 * are the museum card's on a phone.
 */
const CARD_RADIUS = 18;

/**
 * A phone's card, behind its row — which is `isolate`d, so it sits over the
 * row's own background and under what's on it. Tapped, it lifts to the
 * off-white at once (`useTapLift`).
 */
const CardFill: React.FC = () => (
  <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 roomy:hidden">
    <Squircle
      radius={CARD_RADIUS}
      smoothing={1}
      className="h-full w-full bg-wash/50 transition-colors duration-300 group-hover:bg-background/80 group-focus-visible:bg-background/80 group-data-[lifted]:bg-background/80 group-data-[lifted]:duration-0"
    />
  </span>
);

/**
 * A card's arrow: hidden until the card is pointed at, then sliding in from the left, as on the home page's cards.
 * Or always `shown`, where nothing will point at it — a touch screen — and it's the sign there's somewhere to go.
 */
const CardArrow: React.FC<{ size?: number; className?: string; shown?: boolean }> = ({ size = 22, className = '', shown = false }) => (
  <ArrowRight
    size={size}
    strokeWidth={1.5}
    aria-hidden="true"
    className={`shrink-0 text-moss transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${
      shown
        ? ''
        : 'opacity-0 -translate-x-3 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 group-data-[lifted]:translate-x-0 group-data-[lifted]:opacity-100'
    } ${className}`}
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

/** Whether there's room for a desktop's lists, the pane beside the tree rather than over it: `roomy:` in index.css, for what's sized in script. */
const ROOMY = `(width >= ${MOBILE_MAX}px) and (height >= ${SHORT_MAX}px)`;
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
  const tap = useTapLift();
  return (
    <a href={page(p.path)} {...tap} className={`group relative flex items-center gap-4 p-2 focus-visible:outline-none roomy:block roomy:p-2.5 ${HELD}`}>
      {/* Lifted, pointed at or tapped: the site's off-white, in a squircle as the glass is — with a faint edge and a
          shadow on the thickened glass of an expanded view, drawn round the squircle itself. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[lifted]:opacity-100 group-data-[lifted]:duration-0 ${
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
 * row each, what and when beside its name and a line about it. On a phone,
 * the un-selected are a card each: its name, and its line cut to two.
 */
export const WorkSection: React.FC = () => {
  const look = usePaneLook();
  const tap = useTapLift();
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
          <ul className="mt-5 flex flex-col gap-2 roomy:mt-6 roomy:block">
            {more.map((p) => (
              <li key={p.path} className="roomy:border-b roomy:border-charcoal/10 roomy:last:border-b-0">
                <a
                  href={page(p.path)}
                  {...tap}
                  className={`group relative isolate flex items-center gap-3 rounded-[20px] p-4 focus-visible:outline-none roomy:-mx-4 roomy:gap-6 roomy:py-6 ${lift(look)} ${HELD}`}
                >
                  <CardFill />
                  <div className="hidden w-[26%] shrink-0 roomy:block">
                    <span className={`block ${META}`}>{p.date}</span>
                    <span className={`mt-1 block ${DETAIL} text-moss`}>{p.category}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-[20px] leading-[1.2] text-charcoal transition-transform duration-300 group-hover:translate-x-1 roomy:text-[clamp(24px,2.3vw,32px)] roomy:leading-snug">
                      {p.title}
                    </h3>
                    <p className={`mt-1 line-clamp-2 roomy:mt-3 roomy:line-clamp-none ${LINE}`}>{p.description}</p>
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
const CHIP_ON = 'bg-wash/65 text-charcoal shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.06),0_3px_10px_-3px_rgba(0,0,0,0.12)]';
const CHIP_OFF = 'text-charcoal/65 hover:bg-wash/30 hover:text-charcoal';

/**
 * The posts, under a compact choice of what they're on — chips, the one
 * chosen on a pill as the nav's open section is. Each post: when, and how
 * long to read; its name; a line about it. On a phone, a card each: its
 * name, its line cut to two, and how long it is to read.
 */
export const WritingSection: React.FC = () => {
  const look = usePaneLook();
  const tap = useTapLift();
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
      <ul className="flex flex-col gap-2 roomy:block roomy:divide-y roomy:divide-charcoal/10 roomy:border-y roomy:border-charcoal/10">
        {posts.map((post) => (
          <li key={post.path}>
            <a
              href={page(post.path)}
              {...tap}
              className={`group relative isolate flex items-center gap-3 rounded-[20px] p-4 focus-visible:outline-none roomy:-mx-4 roomy:my-1 roomy:block roomy:py-6 ${lift(look)} ${HELD}`}
            >
              <CardFill />
              <div className="min-w-0 flex-1">
                <p className={`mb-2.5 hidden roomy:block ${META}`}>
                  {post.date} · {post.readTime}
                </p>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-serif text-[20px] leading-[1.15] tracking-[-0.015em] text-charcoal roomy:text-[29px] roomy:leading-[1.1]">{post.title}</h3>
                  <CardArrow className="mt-1.5 hidden roomy:block" />
                </div>
                <p className={`mt-1 line-clamp-2 max-w-[60ch] roomy:mt-3 roomy:line-clamp-none ${LINE}`}>{post.excerpt}</p>
                <p className={`mt-2.5 roomy:hidden ${META}`}>{post.readTime}</p>
              </div>
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
  'flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/10 bg-wash/60 text-charcoal/75 shadow-sm transition-colors duration-300 ' +
  'hover:bg-wash/90 hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss';

/** On a touch screen, a photo reaches past the pane's padding, to this near the glass's sides. */
const PHOTO_BLEED = 8;

/**
 * One photo, open on its own to look at: as large as the pane allows, with
 * the ones either side a press or an arrow key away. They load meanwhile, so
 * the next is in hand. On a touch screen there are no arrows to press: the
 * photo takes the pane's whole width, a swipe steps along, and a pinch or a
 * double tap zooms in (`photoGestures.ts`). The arrows are still there for
 * a screen reader.
 */
export const PhotoPiece: React.FC<{ index: number }> = ({ index }) => {
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const room = usePaneRoom(root);
  const settled = usePaneSettled();
  const current = useIsPresent();
  const named = usePaneTitle();
  const touch = useTouch();
  const [shown, setShown] = useState(false);
  const count = PHOTOS.length;
  // Each step along stands in for the last, so Back still goes straight to the grid.
  const move = useCallback((by: number) => navigate(photoPath((index + by + count) % count), { replace: true }), [index, count, navigate]);
  // Only the photo on show answers a touch, not the one going.
  usePhotoGestures(touch && current, stage, photo, move);

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
      {/* On a touch screen, the photo's room reaches nearly to the glass's sides; zoomed in, the photo is clipped to
          that room, rather than spilling under the head. */}
      <div
        ref={stage}
        className={
          touch
            ? 'relative flex min-h-0 flex-1 touch-none select-none items-center justify-center rounded-[14px] data-[zoomed]:overflow-hidden'
            : 'relative flex min-h-0 flex-1 items-center justify-center px-14'
        }
        style={touch ? { marginInline: `calc(${PHOTO_BLEED}px - ${PANE_PAD.sides})` } : undefined}
      >
        {settled && (
          <img
            ref={photo}
            src={PHOTOS[index].full}
            alt={`Photo ${index + 1} of ${count}`}
            decoding="async"
            draggable={false}
            onLoad={() => setShown(true)}
            className={`max-h-full max-w-full rounded-[14px] object-contain shadow-[0_22px_44px_-20px_rgba(0,0,0,0.45)] ${shown ? 'opacity-100' : 'opacity-0'}`}
            style={{ transition: 'opacity 0.45s ease' }}
          />
        )}
        <button type="button" aria-label="Previous photo" onClick={() => move(-1)} className={touch ? 'sr-only' : `${STEP_BUTTON} absolute left-0 top-1/2 -translate-y-1/2`}>
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <button type="button" aria-label="Next photo" onClick={() => move(1)} className={touch ? 'sr-only' : `${STEP_BUTTON} absolute right-0 top-1/2 -translate-y-1/2`}>
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
 * The museum's shelves, cut out of the room: a render on a black wall and a
 * white one, the difference kept as transparency, so only the shelving and
 * what stands on it are left. About 24 KB, so it's kept with the site rather
 * than on R2.
 */
const MUSEUM_SHELVES = '/museum/shelves.webp';

/**
 * The shelves' edges fade into the glass, as the room runs off both edges of the screen. They're cut out without
 * the room's own shadows, which pool into smudges on the glass; a soft drop shadow, worked out from their outline,
 * stands them off it instead.
 */
const SHELVES_SHADOW = 'drop-shadow-[0_5px_7px_rgba(40,52,20,0.18)]';
const SHELVES_FADE: React.CSSProperties = {
  maskImage: 'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent), linear-gradient(to bottom, transparent, #000 10%, #000 90%, transparent)',
  WebkitMaskImage: 'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent), linear-gradient(to bottom, transparent, #000 10%, #000 90%, transparent)',
  maskComposite: 'intersect',
  WebkitMaskComposite: 'source-in',
};

/**
 * The way to the museum, at the foot of About, on the column's margins as
 * everything above it is: an invitation in, in the moss of a link, and under
 * it the shelves themselves, as wide as the column, straight on the glass.
 * Pointing at it lifts it onto the off-white, reaching past the column as a
 * list's rows do. On a touch screen the arrow stays out, as there's no
 * pointer to bring it.
 */
const MuseumCard: React.FC = () => {
  const radius = usePaneRadius() === 44 ? 28 : 18;
  const touch = useTouch();
  return (
    <a href={MUSEUM} className="group @container relative mt-auto block focus-visible:outline-none">
      <Squircle
        radius={radius}
        smoothing={1}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 bg-background/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
      />
      <span className="relative block">
        <span className="mb-1 flex items-center gap-3">
          <span className="font-serif text-[20px] leading-tight text-moss roomy:text-[22px]">Step Inside: My Mind Museum</span>
          <CardArrow size={22} shown={touch} />
        </span>
        {/* Taller as the column widens, so the shelves keep their shape; never so short a phone can't make them out.
            On a short screen, About may take some of it back (`SHELVES_LEAST`). */}
        <span data-shelves="" className="relative block h-[clamp(120px,24cqw,300px)]">
          <span className="absolute inset-0" style={SHELVES_FADE}>
            <PaneImage src={MUSEUM_SHELVES} grow={SHELVES_SHADOW} />
          </span>
        </span>
      </span>
    </a>
  );
};

/** The least width About needs for its picture beside the approaches, rather than under them. */
const PICTURE_BESIDE = 400;
/** The picture's shape beside the approaches, as tall as they are: a little taller than it's wide, and never more than half again. */
const PICTURE_SHAPE = 1.15;
const PICTURE_TALLEST = 1.5;
/** The least the museum's shelves are cut to, on a short screen, so About still fits: a band of them. */
const SHELVES_LEAST = 64;

/**
 * Who I am, at a glance: a few lines across the top; under them, a picture of
 * me with how I work stacked beside it, the picture as tall as the two; and,
 * at the foot, the way to the museum, with whatever room is over left above
 * it. Where there isn't the width, one under another, the picture last.
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
  // picture leaves them more width, and fewer lines. Then narrower still, if it must be, so About never scrolls,
  // though never past its tallest shape; and if even that isn't enough, the museum's shelves give up some of their
  // height.
  useLayoutEffect(() => {
    const pic = picture.current;
    const text = approaches.current;
    const whole = root.current;
    const shelves = whole?.querySelector<HTMLElement>('[data-shelves]');
    if (!beside || !pic || !text || !whole || !shelves) return;
    let live = true;
    const fit = () => {
      if (!live) return;
      shelves.style.height = '';
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
      while (room !== null && whole.offsetHeight > room + 1 && best > least) {
        const next = Math.max(least, best - 8);
        set(next);
        if (text.offsetHeight / next > PICTURE_TALLEST) {
          set(best);
          break;
        }
        best = next;
      }
      const over = room === null ? 0 : whole.offsetHeight - room;
      if (over > 1) shelves.style.height = `${Math.max(SHELVES_LEAST, shelves.offsetHeight - over)}px`;
      setWidth(best);
    };
    fit();
    document.fonts?.ready.then(fit);
    return () => {
      live = false;
      shelves.style.height = '';
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
