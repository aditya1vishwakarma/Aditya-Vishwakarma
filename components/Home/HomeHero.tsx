import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import MapleScene, { type MapleHandle } from '../Maple/MapleScene';
import { seasonOf, type Season } from '../Maple/mapleConfig';
import Navbar, { MenuSpine, navBottom, navPlace } from '../Layout/Navbar';
import { useSafeArea, type Insets } from './safeArea';
import { MOBILE_MAX, isCompact } from '../../constants';
import SectionPane, { PaneMeasure, VEIL_MS, railRoom, type PaneBox, type PaneCard } from './SectionPane';
import TextHaze from './TextHaze';
import Controls from './Controls';
import { usePaintTheme, useTheme } from './theme';
import {
  AboutSection,
  ContactSection,
  PHOTOS_CAPTION,
  PhotoPiece,
  PhotosSection,
  WRITING_CAPTION,
  WorkSection,
  WritingSection,
  prefetchPhotos,
  prefetchWork,
} from './sections';
import { SECTION_PATHS, routeFor, type SectionId } from './routes';
import './home.css';

const { useLocation, useNavigate } = ReactRouterDOM as any;

/**
 * The site, all on one page: the maple scene filling the screen, beneath
 * everything else, with the name and the title set over it on the page's
 * grid and the nav in the top right corner. Everything else opens in the
 * pane, and the address says what it shows (routes.tsx):
 *
 * - home: nothing, just the scene, the name and the title;
 * - a section's list, chosen from the nav, in a frosted pane over the right
 *   of the scene: the camera draws back and slides over so the tree stays in
 *   view beside it, the wind settles to a sway, and the name and the title
 *   step away until it's closed;
 * - a piece open to read, chosen from a list, or a list opened out to fill
 *   the screen: the pane fills it inside the reading margins and thickens to
 *   nearly solid, the nav goes up out of the way, and the scene, covered,
 *   stops drawing until it's back in view.
 *
 * The type comes in at once, without waiting on the scene; the scene fades
 * up over a painted meadow as soon as it has drawn.
 */

/** The page's one margin, on every edge: a desktop or tablet, and a phone. */
const MARGIN = { wide: 36, compact: 24 };
/** Reading, the pane comes nearer the edges, for the room: on a phone, as near as its pane already is. */
const READING_MARGIN = 18;

/**
 * What the type stands on, for contrast with the picture: a haze behind each
 * block — the scene blurred and darkened a touch, in the shape of the text —
 * and a soft shadow hugging the letters themselves.
 *
 * Measured against the scene glyph by glyph (WCAG 2.2): the name and the
 * title are large text and want 3:1, which the name meets on 99% of its
 * letters' pixels and the title on all of them, in calm air and in a gust.
 * Set smaller than 24px — on a phone, or a smaller screen — the title is
 * small text, wanting 4.5:1, so it gets a deeper haze and a tighter shadow:
 * 97% of it meets 4.5:1, and all of it 3:1.
 */
const HAZE = { blur: '24px', tint: 'rgba(16, 32, 20, 0.15)', phoneTitle: 'rgba(16, 32, 20, 0.25)' };
const NAME_SHADOW = '0 0 0.22em rgba(16, 32, 20, 0.46), 0 0.014em 0.055em rgba(16, 32, 20, 0.5)';
const TITLE_SHADOW = { wide: '0 0 14px rgba(16, 32, 20, 0.55), 0 1px 3px rgba(16, 32, 20, 0.6)', compact: '0 0 8px rgba(16, 32, 20, 0.72), 0 1px 2px rgba(16, 32, 20, 0.85)' };

/** Painted behind the scene until it has drawn: its sky, its horizon, its grass. */
const MEADOW = 'linear-gradient(180deg, #4FADE8 0%, #73BDEC 30%, #A6D4EE 49%, #A9CDB9 52%, #9CC86A 60%, #8ABE5A 100%)';
/** The same in the evening (dark mode): the sunset's sky, and the grass by moonlight. */
const EVENING_MEADOW = 'linear-gradient(180deg, #AEA8CA 0%, #DEB7A8 30%, #E68F6A 49%, #6E755C 52%, #556942 60%, #4A693A 100%)';

/** How much a section has to show, and so how wide its pane is. */
type PaneSize = 'wide' | 'medium' | 'narrow';

/**
 * About's share of the screen's width: the least at which it fits without a scroll on a laptop (1512×860) and a
 * desktop (1920×1080), its photo at a natural size — no more than half again as tall as it's wide. Narrower, and its
 * lines run on until it scrolls; at a third of the screen it still runs 50px over on a laptop.
 */
const ABOUT_SHARE = 0.41;
/** The screen a share is worked out for, at the least: a laptop's, 1512px wide. About is never narrower than 620px. */
const SHARE_LEAST = 1512;

/** Writing's pane, only as tall as its list, stays wide enough to hold its own on a big screen: a third of a 27". */
const WRITING_MOST = { width: 880 };

/**
 * Each section's pane: its name and a line about it, how wide (a share of the screen's, where its size's own rule
 * won't do; and, for one that has a ceiling, the most it grows to), whether it's only as tall as what's on it
 * (`fits`), and whether it can be opened out to fill the screen — only those with plenty to look at.
 *
 * A pane that `fits` is as tall as its whole list, up to the screen's room, then scrolls. Writing's is as tall as
 * every post, whichever category is chosen, so choosing one never moves the glass under the reader's finger.
 */
const SECTIONS: {
  id: SectionId;
  label: string;
  title: string;
  caption?: React.ReactNode;
  size: PaneSize;
  share?: number;
  most?: { width: number; height?: number };
  fits?: boolean;
  expandable: boolean;
  Content: React.FC;
}[] = [
  { id: 'about', label: 'About', title: 'About', size: 'medium', share: ABOUT_SHARE, fits: true, expandable: false, Content: AboutSection },
  { id: 'work', label: 'Work', title: 'Selected Works', size: 'wide', expandable: true, Content: WorkSection },
  { id: 'writing', label: 'Blog', title: 'Writing', caption: WRITING_CAPTION, size: 'medium', most: WRITING_MOST, fits: true, expandable: false, Content: WritingSection },
  { id: 'photos', label: 'Photos', title: 'Photos', caption: PHOTOS_CAPTION, size: 'wide', expandable: true, Content: PhotosSection },
  { id: 'contact', label: 'Contact', title: 'Contact', size: 'narrow', fits: true, expandable: false, Content: ContactSection },
];
type Section = (typeof SECTIONS)[number];

const NAV_ITEMS = SECTIONS.map(({ id, label }) => ({ id, label }));

/** A tap, on a touch screen: lifted this soon, and moved no further than this, or it's a drag or a press held. */
const TAP = { ms: 500, slop: 12 };

/** The keys that open a section, as its nav item does: W, P and B. About and Contact have none. */
const SECTION_KEYS: Record<string, SectionId> = { w: 'work', p: 'photos', b: 'writing' };

const WORK_PARTS = [
  { id: 'selected', label: 'Selected' },
  { id: 'unselected', label: 'Un-Selected' },
];

/**
 * A heavy section takes two thirds of the screen's width; the others less. A narrow one widens a little on a big
 * screen (a fifth of it, up to 520px), so it never reads as a sliver. Never more than fits `inset` in from either side.
 */
const paneWidth = (size: PaneSize, width: number, inset: number) => {
  const most = width - 2 * inset;
  if (size === 'wide') return Math.min(most, 0.66 * width);
  if (size === 'medium') return Math.min(most, Math.max(460, 0.46 * width));
  return Math.min(most, Math.max(420, Math.min(520, 0.2 * width)));
};

const useViewport = () => {
  const [size, setSize] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
};

/* ─── The name and the title ───────────────────────────────────── */

/** Waiting on the fonts; coming in; and in. */
type Stage = 'waiting' | 'in' | 'done';

/** From a block's last baseline down to the bottom of its box, read off a point set on that baseline. */
const belowBaseline = (block: HTMLElement) => {
  const probe = block.querySelector('.hero-baseline');
  return probe ? block.getBoundingClientRect().bottom - probe.getBoundingClientRect().top : 0;
};

/** The least room between the name and the title side by side. */
const GUTTER = 48;
/** The smallest the title is set to make room beside the name; past that, the name alone gives way. */
const TITLE_LEAST = 13;
/** Between the title and the name below it, on a phone. */
const STACK_GAP = 18;
/** Between the top of the title's line and the menu's spine above it: about 16px above its capitals. */
const SPINE_LIFT = 8;

type Delay = React.CSSProperties & { '--delay': string };
const delay = (s: number): Delay => ({ '--delay': `${s}s` });

/**
 * The name at the bottom left and the title at the bottom right, their last
 * lines on one baseline a margin above the bottom of the screen. Real
 * baselines, read off the type, not the bottoms of their boxes. Where they'd
 * run into each other, both are set smaller, in proportion, until they fit
 * side by side (the title no smaller than 13px; the name gives way after
 * that). On a phone the title stands above the name instead, flush left.
 * `onTop` hears how high the two reach, from the bottom of the screen.
 */
const HeroText: React.FC<{
  shown: boolean;
  margin: number;
  safe: Insets;
  compact: boolean;
  smallTitle: boolean;
  stage: Stage;
  viewport: string;
  onTop: (top: number) => void;
}> = ({ shown, margin, safe, compact, smallTitle, stage, viewport, onTop }) => {
  const name = useRef<HTMLHeadingElement>(null);
  const title = useRef<HTMLParagraphElement>(null);
  const [place, setPlace] = useState<{ name: number; title: number; nameFit: number; titleFit: number; small: boolean; key: string } | null>(null);

  useLayoutEffect(() => {
    let raf = 0;
    const measure = () => {
      const n = name.current;
      const t = title.current;
      if (!n || !t) return;
      // Each at its own size first (home.css), to see whether they fit side by side; then smaller, to fit.
      n.style.setProperty('--fit', '1');
      t.style.setProperty('--fit', '1');
      let nameFit = 1;
      let titleFit = 1;
      if (!compact) {
        const room = window.innerWidth - 2 * margin - safe.left - safe.right - GUTTER - 1;
        const nameWidth = n.getBoundingClientRect().width;
        const titleWidth = t.getBoundingClientRect().width;
        if (nameWidth + titleWidth > room) {
          const least = TITLE_LEAST / parseFloat(getComputedStyle(t).fontSize);
          titleFit = Math.min(1, Math.max(room / (nameWidth + titleWidth), least));
          nameFit = (room - titleWidth * titleFit) / nameWidth;
          n.style.setProperty('--fit', String(nameFit));
          t.style.setProperty('--fit', String(titleFit));
        }
      }
      // Above a phone's home bar, too.
      const foot = margin + safe.bottom;
      const nameBottom = foot - belowBaseline(n);
      const nameBox = n.getBoundingClientRect();
      const titleBox = t.getBoundingClientRect();
      const titleBottom = compact ? nameBottom + nameBox.height + STACK_GAP : foot - belowBaseline(t);
      const small = parseFloat(getComputedStyle(t).fontSize) < 24;
      const key = `${viewport}:${nameBottom.toFixed(2)}:${titleBottom.toFixed(2)}:${nameBox.width.toFixed(1)}:${titleBox.width.toFixed(1)}`;
      setPlace((p) => (p?.key === key ? p : { name: nameBottom, title: titleBottom, nameFit, titleFit, small, key }));
      onTop(Math.max(nameBottom + nameBox.height, titleBottom + titleBox.height));
    };
    measure();
    // Measured again once the fonts are in: until then the lines are set in whatever stood in for them.
    document.fonts?.ready.then(() => {
      raf = requestAnimationFrame(measure);
    });
    return () => cancelAnimationFrame(raf);
  }, [margin, safe, compact, viewport, onTop]);

  const hazeOn = shown && stage !== 'waiting';
  // Under 24px, by its own measure or set smaller to fit, the title is small text.
  const small = smallTitle || !!place?.small;
  return (
    <>
      <TextHaze target={name} layout={place?.key ?? ''} on={hazeOn} tint={HAZE.tint} />
      <TextHaze target={title} layout={place?.key ?? ''} on={hazeOn} tint={small ? HAZE.phoneTitle : HAZE.tint} />
      <h1 ref={name} className="hero-name" data-hero-text="name" data-shown={shown} style={{ bottom: place?.name ?? margin, '--fit': place?.nameFit ?? 1 } as React.CSSProperties}>
        <span data-line="" className="hero-reveal" style={{ letterSpacing: '-0.035em', ...delay(0.1) }}>
          Aditya
        </span>{' '}
        <span data-line="" className="hero-reveal" style={{ letterSpacing: '-0.02em', ...delay(0.32) }}>
          Vishwakarma
          <span className="hero-baseline" />
        </span>
      </h1>
      <p ref={title} className="hero-title" data-hero-text="title" data-shown={shown}
        style={{ bottom: place?.title ?? margin, '--fit': place?.titleFit ?? 1, '--hero-title-shadow': small ? TITLE_SHADOW.compact : TITLE_SHADOW.wide } as React.CSSProperties}
      >
        <span data-line="" className="hero-reveal" style={delay(0.8)}>
          Product Manager
        </span>{' '}
        <span data-line="" className="hero-reveal" style={delay(0.95)}>
          Based in San Francisco
          <span className="hero-baseline" />
        </span>
      </p>
    </>
  );
};

/* ─── The page ─────────────────────────────────────────────────── */

interface HomeHeroProps {
  /** The season to open in. By the date, unless it's given; S swaps it after. */
  season?: Season;
  handle?: React.MutableRefObject<MapleHandle | null>;
  /** The type, nav and pane over the scene. Off, to look at the scene alone. */
  overlay?: boolean;
  /** The controls pill at home. Off, to look at the page without it. */
  controls?: boolean;
}

const HomeHero: React.FC<HomeHeroProps> = ({ season: opening, handle: given, overlay = true, controls = true }) => {
  const { width, height } = useViewport();
  // On a phone, the scene runs under the status bar and the home bar; what's placed on the margins keeps clear of them.
  usePaintTheme();
  // Dark mode is evening in the scene: a sunset's sky, the land lit by the moon.
  const dusk = useTheme() === 'dark';
  const safe = useSafeArea();
  // The pane's and the nav's phone layout, for a screen narrow or short; the name and title's, for a narrow one.
  const compact = isCompact(width, height);
  const narrow = width < MOBILE_MAX;
  const margin = compact ? MARGIN.compact : MARGIN.wide;
  // The title is set by the screen's shorter side (home.css), and under 24px it's small text.
  const smallTitle = narrow || Math.min(width, height) * 0.028 < 24;
  const [season, setSeason] = useState<Season>(() => opening ?? seasonOf(new Date()));
  const own = useRef<MapleHandle | null>(null);
  const handle = given ?? own;
  const gust = useCallback(() => handle.current?.gust(), [handle]);
  const swapSeason = useCallback(() => setSeason((s) => (s === 'autumn' ? 'summer' : 'autumn')), []);
  // How high the name and the title reach: on a phone, the menu's spine stands just above them.
  const [textTop, setTextTop] = useState<number | null>(null);


  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  // The type comes in as soon as its fonts are here — or after a moment without them — and doesn't wait for the scene.
  const [stage, setStage] = useState<Stage>('waiting');
  useEffect(() => {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      setStage('in');
    };
    document.fonts?.ready.then(start);
    const timer = window.setTimeout(start, 900);
    return () => {
      started = true;
      window.clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    if (stage !== 'in') return;
    const timer = window.setTimeout(() => setStage('done'), 2800);
    return () => window.clearTimeout(timer);
  }, [stage]);

  // What the pane shows, from the address. One the site doesn't have goes home.
  const location = useLocation();
  const navigate = useNavigate();
  const found = useMemo(() => routeFor(location.pathname), [location.pathname]);
  useEffect(() => {
    if (!found) navigate('/', { replace: true });
  }, [found, navigate]);
  const route = found ?? { mode: 'home' as const };
  const section = route.mode === 'home' ? null : SECTIONS.find((s) => s.id === route.section) ?? null;

  // A list opened out to fill the screen — the expanded view — is read like a piece. It's still so coming Back to it
  // from what was opened from it; another section opens at its own size.
  const [openedOut, setOpenedOut] = useState<SectionId | null>(null);
  useEffect(() => setOpenedOut(null), [section?.id]);
  const out = !!section?.expandable && openedOut === section.id;
  const expanded = route.mode === 'select' && out;
  const onExpand = useCallback(() => section && setOpenedOut(section.id), [section]);
  // A photo opens in the pane it was chosen in: filling the screen from the expanded view, and from the list, in the
  // list's own pane, so the glass doesn't change size for it.
  const inPlace = route.mode === 'photo' && !out;
  // Filling the screen inside the reading margin, the nav away: a piece, the expanded view, or a photo from it.
  const reading = route.mode === 'view' || (route.mode === 'photo' && out) || expanded;
  const layoutOf = section ? (reading ? 'view' : `select:${section.id}`) : 'home';

  // Where each step of this visit led, by its place in the history — so Back from a piece goes back through the
  // history if its list is where the reader came from, and to the list otherwise.
  const steps = useRef(new Map<number, string>());
  useEffect(() => {
    const at = window.history.state?.idx;
    if (typeof at === 'number') steps.current.set(at, location.pathname);
  }, [location]);

  // A link within the site is the router's to follow, not the browser's: that way it counts the step, for Back.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#/"]');
      if (!link || (link.getAttribute('target') ?? '_self') !== '_self') return;
      e.preventDefault();
      navigate(link.getAttribute('href')!.slice(1));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  // Whatever had the focus when the first pane opened, to hand it back once they're all closed.
  const opener = useRef<HTMLElement | null>(null);
  const close = useCallback(() => navigate('/'), [navigate]);
  useEffect(() => {
    if (section) return;
    opener.current?.focus({ preventScroll: true });
    opener.current = null;
  }, [section]);
  const choose = useCallback(
    (id: string) => {
      if (route.mode === 'select' && route.section === id) return close();
      if (!section) opener.current = document.activeElement as HTMLElement | null;
      navigate(SECTION_PATHS[id as SectionId]);
    },
    [route, section, close, navigate],
  );
  // The page's keys: G a gust, S the other season, and W, P and B open Work, Photos and the blog, as the nav does.
  // Not while typing, nor with a modifier held. The music has no key, so a stray press never starts it: it's only
  // turned on from the controls.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat || e.defaultPrevented) return;
      if ((e.target as HTMLElement | null)?.closest?.('input, textarea, [contenteditable=true]')) return;
      const key = e.key.toLowerCase();
      if (key === 'g') gust();
      else if (key === 's') swapSeason();
      else if (key in SECTION_KEYS) choose(SECTION_KEYS[key]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gust, swapSeason, choose]);

  const back = useCallback(() => {
    if (!section) return;
    if (expanded) return setOpenedOut(null);
    const list = SECTION_PATHS[section.id];
    const at = window.history.state?.idx;
    if (typeof at === 'number' && steps.current.get(at - 1) === list) navigate(-1);
    else navigate(list, { replace: true });
  }, [section, expanded, navigate]);

  // The gallery's previews, about 2 MB, load once the scene has drawn and the page is idle — on a
  // wide screen, on a connection that's neither slow nor saving data — so Photos opens full.
  // Anywhere else they load as Photos is pointed at or opened.
  useEffect(() => {
    if (!ready || compact) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType ?? '')) return;
    // Safari has no idle callback: a few seconds' wait stands in for one.
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(prefetchPhotos, { timeout: 6000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(prefetchPhotos, 2500);
    return () => clearTimeout(timer);
  }, [ready, compact]);
  // Work's pictures, about 470 KB, load only as Work is pointed at or opened.
  const onIntent = useCallback((id: string) => {
    if (id === 'photos') prefetchPhotos();
    if (id === 'work') prefetchWork();
  }, []);

  // Escape goes up a step: from a piece, a photo or the expanded view to the list; from a list to home.
  useEffect(() => {
    if (!section) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (reading || inPlace) back();
      else close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [section, reading, inPlace, back, close]);

  // Reading, the scene is covered: once the glass has thickened over it, it stops drawing until it's back in view.
  // Looking at a photo in the list's pane, it pauses too, for as long as the photo's up.
  const still = reading || inPlace;
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    if (!still) {
      setCovered(false);
      return;
    }
    const timer = window.setTimeout(() => setCovered(true), VEIL_MS);
    return () => window.clearTimeout(timer);
  }, [still]);

  // How tall each list that `fits` needs its glass, measured unseen at the width its glass will have (`PaneMeasure`).
  const [fitted, setFitted] = useState<Partial<Record<SectionId, number>>>({});
  const onFitted = useMemo(
    () =>
      Object.fromEntries(
        SECTIONS.filter((s) => s.fits).map((s) => [s.id, (h: number) => setFitted((f) => (f[s.id] === h ? f : { ...f, [s.id]: h }))]),
      ) as Partial<Record<SectionId, (h: number) => void>>,
    [],
  );

  // A list's pane sits below the nav, its edges where the nav's right edge does, on the margin: two thirds of the
  // screen for a heavy section, less for the others. To read, it fills the screen inside the reading margin. A
  // phone's fills the screen either way.
  const edge = navPlace(margin, compact).right;
  const below = navBottom(margin, compact, safe) + (compact ? 12 : 16);
  const near = compact ? edge : READING_MARGIN;
  // Work's rail of its parts gets room of its own. On a desktop its pane is that much wider, so the list keeps its
  // width; a phone's pane fills the screen, so there the list gives the room up.
  const railGutter = section?.id === 'work' ? railRoom(width, height) : 0;
  // A pane that takes a share of the screen is never narrower than that share of a laptop's (`SHARE_LEAST`), so a
  // smaller window lays it out as the laptop does rather than running its lines on until it scrolls.
  const paneWidthOf = (s: Section) => {
    const across = width - safe.left - safe.right;
    const own = s.share ? Math.min(across - 2 * edge, Math.max(s.share * SHARE_LEAST, s.share * across)) : paneWidth(s.size, across, edge);
    return Math.min(own, s.most?.width ?? Infinity);
  };
  const listWidth = section ? paneWidthOf(section) + railGutter : 0;
  // A pane with a ceiling, or only as tall as what's on it, keeps its top under the nav and its right edge on the
  // margin; where it's shorter than the room, its foot lifts off the margin.
  const fit = section?.fits ? fitted[section.id] : undefined;
  const listBottom = Math.max(edge + safe.bottom, height - below - Math.min(section?.most?.height ?? Infinity, fit ?? Infinity));
  const box: PaneBox | null = !section
    ? null
    : reading
      ? { top: near + safe.top, right: near + safe.right, bottom: near + safe.bottom, left: near + safe.left }
      : compact
        ? { top: below, right: edge + safe.right, bottom: edge + safe.bottom, left: edge + safe.left }
        : { top: below, right: edge + safe.right, bottom: listBottom, left: width - edge - safe.right - listWidth };
  // What a section's list leaves of the screen, from the left, for the tree — kept while reading, so the camera
  // doesn't move under the glass. A phone's pane covers it all, so the camera stays.
  const clear = section && !compact ? Math.max(0.16, (width - edge - listWidth) / width) : 1;

  const card: PaneCard | null = !section
    ? null
    : route.mode === 'view'
      ? { key: `view:${route.path}`, look: 'view', back: true, node: <route.Page /> }
      : route.mode === 'photo'
        ? { key: `view:${route.path}`, look: inPlace ? 'select' : 'view', back: true, fade: true, node: <PhotoPiece index={route.index} /> }
        : {
            key: `select:${section.id}${expanded ? ':out' : ''}`,
            look: expanded ? 'view' : 'select',
            back: expanded,
            // Work's name scrolls away with its list, rather than stacking over Un-Selected Works'.
            titleScrolls: section.id === 'work',
            // Work's two parts, marked by its scrollbar, so it's plain there's more than the first.
            parts: section.id === 'work' ? WORK_PARTS : undefined,
            title: section.title,
            caption: section.caption,
            expandable: !compact && section.expandable,
            node: <section.Content />,
          };

  // On a touch screen, a tap on the tree sends a gust through it, as G does with a keyboard.
  const touched = useRef<{ id: number; x: number; y: number; at: number } | null>(null);
  const onSceneDown = useCallback((e: React.PointerEvent) => {
    touched.current = e.pointerType === 'mouse' ? null : { id: e.pointerId, x: e.clientX, y: e.clientY, at: e.timeStamp };
  }, []);
  const onSceneUp = useCallback(
    (e: React.PointerEvent) => {
      const down = touched.current;
      touched.current = null;
      if (!down || down.id !== e.pointerId || e.timeStamp - down.at > TAP.ms || Math.hypot(e.clientX - down.x, e.clientY - down.y) > TAP.slop) return;
      if (handle.current?.treeAt(e.clientX, e.clientY)) gust();
    },
    [handle, gust],
  );

  const vars = {
    '--hero-m': `${margin}px`,
    '--hero-name-shadow': NAME_SHADOW,
    '--hero-title-shadow': smallTitle ? TITLE_SHADOW.compact : TITLE_SHADOW.wide,
    '--hero-haze-blur': HAZE.blur,
  } as React.CSSProperties;

  return (
    <div className="hero" data-stage={stage} style={vars}>
      {/* The scene, beneath everything. */}
      <div
        className="fixed inset-0 touch-manipulation"
        style={{ background: dusk ? EVENING_MEADOW : MEADOW }}
        onPointerDown={onSceneDown}
        onPointerUp={onSceneUp}
        onPointerCancel={() => (touched.current = null)}
      >
        <div className="hero-scene" data-ready={ready}>
          <Canvas
            flat
            // The scene draws its own frames, at its own pace: fewer in calm air, none while it's covered.
            frameloop="never"
            // 1.5× is crisp on a Retina screen at half the pixels of 2×, as on the mood board.
            dpr={[1, 1.5]}
            // The scene is drawn offscreen and smoothed on its way here; the canvas only shows the result.
            gl={{ antialias: false, depth: false, stencil: false, powerPreference: 'default' }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <MapleScene season={season} dusk={dusk} clear={clear} still={!!section} paused={covered} onReady={onReady} handle={handle} />
          </Canvas>
        </div>
      </div>

      {overlay && (
        <>
          <HeroText
            shown={!section}
            margin={margin}
            safe={safe}
            compact={narrow}
            smallTitle={smallTitle}
            stage={stage}
            viewport={`${width}x${height}`}
            onTop={setTextTop}
          />

          {/* A press anywhere on the scene puts a list away. Reading, the margins are only margins. */}
          {section && !reading && <div aria-hidden="true" className="fixed inset-0 z-30" onPointerDown={close} />}

          <AnimatePresence>
            {card && box && (
              <SectionPane
                key="pane"
                card={card}
                box={box}
                layout={layoutOf}
                radius={compact ? 30 : 44}
                railGutter={railGutter}
                onExpand={onExpand}
                onBack={back}
                onClose={close}
              />
            )}
          </AnimatePresence>

          {/* The lists only as tall as what's on them, laid out unseen to find how tall that is. A phone's pane fills the
              screen whatever's on it. */}
          {!compact &&
            SECTIONS.filter((s) => s.fits).map((s) => (
              <PaneMeasure key={s.id} width={paneWidthOf(s)} caption={s.caption} onHeight={onFitted[s.id]!}>
                <s.Content />
              </PaneMeasure>
            ))}

          {controls && route.mode === 'home' && <Controls margin={margin} compact={compact} onGust={gust} onSeason={swapSeason} />}

          {/* On a phone at home, the menu is the spine above the title; the nav comes down from the top once a pane is open. */}
          {compact && textTop !== null && (
            <MenuSpine
              items={NAV_ITEMS}
              onSelect={choose}
              onIntent={onIntent}
              margin={margin}
              foot={textTop + SPINE_LIFT}
              height={height}
              away={!!section}
              className={stage === 'waiting' ? 'invisible' : 'hero-nav-in'}
            />
          )}

          <Navbar
            items={NAV_ITEMS}
            active={route.mode === 'select' ? route.section : null}
            onSelect={choose}
            showName={!!section}
            onHome={close}
            onIntent={onIntent}
            margin={margin}
            compact={compact}
            away={reading || (compact && !section)}
            className={stage === 'waiting' ? 'invisible' : 'hero-nav-in'}
          />
        </>
      )}
    </div>
  );
};

export default HomeHero;
