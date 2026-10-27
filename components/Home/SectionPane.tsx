import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { AnimatePresence, motion as motionComponent, useIsPresent, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Maximize2, X } from 'lucide-react';
import Squircle from '../UI/Squircle';
import CircularScrollIndicator from '../Writing/CircularScrollIndicator';
import { CARD_SHADOW, FROST_NOISE, GLASS_BACKDROP, GLASS_EDGE, GLASS_TINT } from '../UI/glass';

const motion = motionComponent as any;

/**
 * The pane: everything on the site opens in it, over the scene. A section
 * chosen from the nav opens its list, on the glass of the mood board's cards,
 * cut as a squircle at full smoothing, below the nav and as wide as the
 * section needs. Something chosen from a list opens to read, and a list
 * opened out to fill the screen is read the same way: the glass fills the
 * screen inside the margins and thickens to nearly solid, under the same
 * head for everything — Back, and a close.
 *
 * The head floats over what's on the glass, which scrolls up beneath it and
 * blurs away into it.
 *
 * Nothing on the glass is ever laid out again while it changes size. Going
 * between two sizes, the glass starts at once, and what was on it fades held
 * at the width it had. The next is made meanwhile, at the size it will have,
 * and fades in as the glass lands. Between two of a size,
 * the next is made beneath the last as soon as the last starts to go — so
 * however long it takes to make, the last is already on its way — and it
 * comes in as the last has gone, like turning to the next of a stack of
 * notecards.
 */

/** What names the pane: a section's name, or the title of what's open to read. */
export const PANE_TITLE_ID = 'section-pane-title';

/** A list's name, at the pane's head — and a part of a list as distinct as a list of its own. */
export const PANE_TITLE = 'font-serif text-[clamp(30px,3.1vw,46px)] font-normal leading-none tracking-[-0.025em] text-charcoal';

/** How long the glass takes to thicken, as something opens to read, and to thin again. */
export const VEIL_MS = 900;

/** Over the glass's own 60% tint, this makes it 90% solid. */
const VEIL = 'rgba(251, 250, 248, 0.75)';

/** The glass taking a new size, with nothing on it. */
const MOVE_MS = 440;
const MOVE = ['top', 'right', 'bottom', 'left'].map((edge) => `${edge} ${MOVE_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`).join(', ');

/** A card going, in seconds. The next one of a size comes in as it has gone. */
const LEAVE = 0.16;

/** The head: room above it, its one row — as tall as a list's name or a button, whichever is taller — and room below. */
const HEAD_TOP = 'clamp(20px, 2.4vw, 34px)';
const HEAD_ROW = 'max(40px, clamp(30px, 3.1vw, 46px))';
const HEAD_BOTTOM = '16px';

/** The room inside the glass, at its sides and its foot: for what's nested in its corners to reach past. */
export const PANE_PAD = { sides: 'clamp(22px, 2.6vw, 40px)', bottom: 'clamp(24px, 2.8vw, 40px)' };

const CAPTION = 'font-sans text-[15.5px] leading-relaxed text-charcoal/80';

/**
 * Whether the pane, and the card on it, have come to rest: the glass slid in
 * and done changing size, and the card come in on it. Until then, what's
 * heavy to draw — its pictures, to be fetched and decoded — waits, so the
 * glass and then the card each have the machine to themselves.
 */
const Settled = createContext(true);
export const usePaneSettled = () => useContext(Settled);

/** How the glass looks under a card — a list's frost, or thickened to read on — for what's on it to suit. */
const Look = createContext<'select' | 'view'>('select');
export const usePaneLook = () => useContext(Look);

/**
 * The height the scroll will have once the glass lands, for a card made while
 * it's still on its way — so a list that fills the glass is laid out for
 * where it's going, once, not again every frame of the move. Null at rest.
 */
const Held = createContext<number | null>(null);
export const usePaneHeld = () => useContext(Held);

/** The glass's corner radius, for what's nested in its corners to sit concentric: its radius less the room between. */
const Radius = createContext(44);
export const usePaneRadius = () => useContext(Radius);

/**
 * For whatever names the pane — a section's name, a piece's title — while
 * it's the one on show: the pane is labelled by it, and the reader's focus
 * goes to it as it arrives.
 */
export const usePaneTitle = () => {
  const current = useIsPresent();
  return current ? { id: PANE_TITLE_ID, 'data-pane-focus': '', tabIndex: -1 } : { tabIndex: -1 };
};

export interface PaneBox {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** What's on the glass: a section's list, or a piece open to read. */
export interface PaneCard {
  /** Which it is: the pane turns over to another card when this changes. */
  key: string;
  /** How the glass looks: a list's frost, or thickened to read on. */
  look: 'select' | 'view';
  /** A list's name, and a line about it, if it has one. A piece has its own title, in it. */
  title?: string;
  caption?: React.ReactNode;
  /** Whether the head offers the way Back — from a piece, or a list opened out — rather than the list's name. */
  back?: boolean;
  /**
   * A list whose name scrolls away with it, rather than staying at the head:
   * Work, whose name would otherwise stack over its second section's.
   */
  titleScrolls?: boolean;
  /** A plain fade from one to the next, for photos, rather than the notecard's turn. */
  fade?: boolean;
  /** A list's parts, each marked on its glass with `data-pane-part`: a rail by the scrollbar shows them, and which is in view. */
  parts?: { id: string; label: string }[];
  /** Whether a list can be opened out to fill the screen: only those with plenty to look at. */
  expandable?: boolean;
  node: React.ReactNode;
}

interface Props {
  card: PaneCard;
  box: PaneBox;
  /**
   * Which of the pane's layouts the box is: a list, or something to read. The
   * box changing with it is a move, made with nothing on the glass; changing
   * without it — the window resized — the glass just follows.
   */
  layout: string;
  radius: number;
  onExpand: () => void;
  onBack: () => void;
  onClose: () => void;
}

const sameBox = (a: PaneBox, b: PaneBox) => a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left;

const buttonLook =
  'flex h-10 items-center justify-center rounded-full border border-charcoal/10 bg-white/45 text-charcoal/75 transition-colors duration-300 ' +
  'hover:border-charcoal/20 hover:bg-white/75 hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss';

const IconButton: React.FC<{ label: string; onClick: () => void; children: React.ReactNode }> = ({ label, onClick, children }) => (
  <button type="button" onClick={onClick} aria-label={label} title={label} className={`${buttonLook} w-10`}>
    {children}
  </button>
);

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button type="button" onClick={onClick} className={`${buttonLook} gap-2 pl-3.5 pr-[18px] font-sans text-[12px] font-medium uppercase tracking-[0.16em]`}>
    <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
    Back
  </button>
);

/** A list's name, at the head, on one line. */
const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 {...usePaneTitle()} className={`truncate outline-none ${PANE_TITLE}`}>
    {children}
  </h2>
);

/**
 * A list's name over the list itself: under Back, or, for a name that scrolls
 * away, in the head's row — level with its buttons, and clear of them.
 */
const ListTitle: React.FC<{ inRow?: boolean; children: React.ReactNode }> = ({ inRow, children }) => (
  <div className={`flex items-center ${inRow ? 'pr-[104px]' : ''}`} style={{ minHeight: inRow ? HEAD_ROW : undefined, marginBottom: inRow ? HEAD_BOTTOM : 16 }}>
    <h2 {...usePaneTitle()} className={`outline-none ${PANE_TITLE}`}>
      {children}
    </h2>
  </div>
);

/** The head's left: a list's name, or Back — going and coming with what's on the glass. */
const HeadItem: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => (
  <motion.div
    className="col-start-1 row-start-1 flex min-w-0 items-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, transition: { duration: 0.3, delay, ease: 'easeOut' } }}
    exit={{ opacity: 0, transition: { duration: LEAVE * 0.9, ease: 'easeIn' } }}
  >
    {children}
  </motion.div>
);

/**
 * What's scrolled up under the head blurs away into it, the more the higher
 * it goes: layers of blur, each stronger and nearer the top, and a touch of
 * the glass's tint once anything's under it, so the head always reads.
 * Faded never, only the tint: frosted glass under a fade paints white in
 * Safari.
 */
const BLURS = [
  { blur: 2, mask: 'linear-gradient(to bottom, #000 45%, transparent 100%)' },
  { blur: 6, mask: 'linear-gradient(to bottom, #000 30%, transparent 75%)' },
  { blur: 14, mask: 'linear-gradient(to bottom, #000 15%, transparent 50%)' },
];

const Haze: React.FC<{ tinted: boolean; edge: boolean }> = ({ tinted, edge }) => (
  // Under a head with no name in it, only along the glass's top edge, clear of the name resting below.
  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0" style={{ bottom: edge ? undefined : '-2rem', height: edge ? HEAD_TOP : undefined }}>
    {BLURS.map(({ blur, mask }) => (
      <div
        key={blur}
        className="absolute inset-0"
        style={{ backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, maskImage: mask, WebkitMaskImage: mask }}
      />
    ))}
    <div
      className="absolute inset-0 transition-opacity duration-300"
      style={{ background: 'linear-gradient(to bottom, rgba(251, 250, 248, 0.55), rgba(251, 250, 248, 0))', opacity: tinted ? 1 : 0 }}
    />
  </div>
);

/**
 * One card of what's on the glass. Going, it tips back on its top edge as it
 * fades; coming, it settles flat from just beneath. It only ever tips away
 * and draws in on itself, never out past where it started, so a section that
 * fills the pane exactly never brings up its scrollbar; and once flat it has
 * no transform at all, so anything inside that covers the glass is placed
 * against the glass.
 */
const turned = (tip: number, scale: number) => `perspective(1400px) rotateX(${tip}deg) scale(${scale})`;
const FLAT = turned(0, 1);
const EXPO_OUT = [0.16, 1, 0.3, 1];

const Notecard: React.FC<{ delay: number; turns: boolean; fade?: boolean; width?: number; rest: boolean; children: React.ReactNode }> = ({
  delay,
  turns,
  fade,
  width,
  rest,
  children,
}) => {
  const current = useIsPresent();
  // A photo for a photo: a quick fade across, overlapping a touch, and no turn.
  const tips = turns && !fade;
  const wait = fade ? Math.min(delay, 0.08) : delay;
  const card = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  // Its pictures wait for it to have come in: the glass lands, then the card, then what's heavy on it. Not a
  // photo after a photo, though, which is all picture, and is stepped through quickly.
  const [landed, setLanded] = useState(!!fade);
  useEffect(() => {
    if (landed) return;
    const done = window.setTimeout(() => setLanded(true), (wait + 0.32) * 1000);
    return () => window.clearTimeout(done);
    // Timed from when it's made, with the wait it was made with.
  }, []);

  // Going, it's held where the reader left it — at the width it had, too, so a glass changing size never lays it
  // out again — while the pane goes back to the top for the next, and it has no more say in how far the pane
  // scrolls, or how wide.
  useLayoutEffect(() => {
    const el = card.current;
    const block = inner.current;
    const scroller = el?.closest<HTMLElement>('[data-pane-scroll]');
    if (current || !el || !block || !scroller) return;
    const held = scroller.scrollTop;
    const s = el.style;
    block.style.width = `${block.offsetWidth}px`;
    s.height = '0px';
    s.contain = 'layout';
    s.translate = `0 ${-held}px`;
    s.transformOrigin = `50% ${held}px`;
    // Chosen again before it had gone.
    return () => {
      s.height = s.contain = s.translate = s.transformOrigin = '';
      block.style.width = '';
    };
  }, [current]);

  return (
    <motion.div
      ref={card}
      inert={!current}
      className="col-start-1 row-start-1 origin-top"
      // Made at the width it will have while the glass is still on its way there: what reaches past is no scroll's.
      style={width ? { contain: 'layout' } : undefined}
      initial={{ opacity: 0, ...(tips && { transform: turned(-10, 0.965) }) }}
      animate={{
        opacity: 1,
        ...(tips && { transform: FLAT, transitionEnd: { transform: 'none' } }),
        transition: { opacity: { duration: fade ? 0.24 : 0.32, delay: wait, ease: 'easeOut' }, transform: { duration: 0.55, delay: wait, ease: EXPO_OUT } },
      }}
      exit={{
        opacity: 0,
        // From flat, not from no transform: framer would make "none" a transform of zeroes, and scale the card from nothing.
        ...(tips && { transform: [FLAT, turned(-10, 0.97)] }),
        transition: { opacity: { duration: fade ? 0.16 : LEAVE * 0.9, ease: 'easeIn' }, transform: { duration: LEAVE, ease: 'easeIn' } },
      }}
    >
      <div ref={inner} style={width ? { width } : undefined}>
        <Settled.Provider value={rest && landed}>{children}</Settled.Provider>
      </div>
    </motion.div>
  );
};

/** Where `el` starts down its scroll's content, by layout. */
const offsetIn = (el: HTMLElement, scroller: HTMLElement) => {
  let top = 0;
  for (let at: HTMLElement | null = el; at && at !== scroller; at = at.offsetParent as HTMLElement | null) top += at.offsetTop;
  return top;
};

/**
 * A list's parts, by its scrollbar: a line for each, as long as the part is
 * tall, its name set along it, and the one in view darker. So it's plain from
 * the first that there's more below; and each is a way there.
 */
const PartsRail: React.FC<{ scroller: React.RefObject<HTMLDivElement | null>; parts: { id: string; label: string }[]; under: 'edge' | 'head' }> = ({
  scroller,
  parts,
  under,
}) => {
  const [shape, setShape] = useState<{ sizes: number[]; at: number } | null>(null);
  const tops = useRef<number[]>([]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const read = () => {
      const marks = parts.map((p) => el.querySelector<HTMLElement>(`[data-pane-part="${p.id}"]`));
      if (marks.some((m) => !m)) return setShape(null);
      const at = marks.map((m) => offsetIn(m!, el));
      tops.current = at;
      const sizes = at.map((t, i) => (at[i + 1] ?? el.scrollHeight) - (i === 0 ? 0 : t));
      // In view: the last part whose top has come up past a little above the middle — or, scrolled to the end, the last.
      const line = el.scrollTop + el.clientHeight * 0.45;
      let now = 0;
      at.forEach((t, i) => i > 0 && line >= t && (now = i));
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) now = at.length - 1;
      setShape((s) => (s && s.at === now && s.sizes.every((v, i) => Math.abs(v - sizes[i]) < 1) ? s : { sizes, at: now }));
    };
    read();
    el.addEventListener('scroll', read, { passive: true });
    const ro = new ResizeObserver(read);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener('scroll', read);
      ro.disconnect();
    };
  }, [scroller, parts]);

  const go = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    const head = under === 'edge' ? parseFloat(getComputedStyle(el).paddingTop) || 0 : (el.parentElement?.querySelector('header')?.offsetHeight ?? 0);
    el.scrollTo({ top: i === 0 ? 0 : Math.max(0, tops.current[i] - head - 12), behavior: 'smooth' });
  };

  if (!shape) return null;
  return (
    <motion.nav
      aria-label="Parts of this list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.2 } }}
      className="absolute z-20 flex flex-col gap-2"
      style={{ right: `max(4px, calc((${PANE_PAD.sides} - 18px) / 2))`, top: `calc(${HEAD_TOP} + ${HEAD_ROW} + 28px)`, bottom: PANE_PAD.bottom }}
    >
      {parts.map((p, i) => {
        const on = shape.at === i;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => go(i)}
            aria-current={on ? 'true' : undefined}
            className="group/part flex min-h-[72px] items-start gap-[5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            style={{ flexGrow: shape.sizes[i], flexBasis: 0 }}
          >
            <span
              className={`font-sans text-[9.5px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 [writing-mode:vertical-rl] ${
                on ? 'text-charcoal/75' : 'text-charcoal/35 group-hover/part:text-charcoal/60'
              }`}
            >
              {p.label}
            </span>
            <span className={`w-[2px] self-stretch rounded-full transition-colors duration-300 ${on ? 'bg-charcoal/55' : 'bg-charcoal/15 group-hover/part:bg-charcoal/30'}`} />
          </button>
        );
      })}
    </motion.nav>
  );
};

const SectionPane: React.FC<Props> = ({ card, box, layout, radius, onExpand, onBack, onClose }) => {
  const pane = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const turns = !useReducedMotion();
  const [, redraw] = useReducer((n: number) => n + 1, 0);

  // What's asked for, and what's on show: a card (or none, between two), and the glass's size. What's on show
  // follows what's asked for a step at a time.
  const asked = useRef({ card, box, layout });
  asked.current = { card, box, layout };
  const shown = useRef<{ key: string | null; box: PaneBox; layout: string; delay: number; width?: number }>({ key: card.key, box, layout, delay: 0 });
  const leaving = useRef(false);
  const moving = useRef(false);
  const moved = useRef(0);
  const frame = useRef(0);
  // Asked for less motion: the glass takes its new size at once.
  const instant = useRef(!turns);
  instant.current = !turns;

  /** How wide what's on the glass will be once the glass is in `box`: inside its sides, and its scrollbar if any. */
  const widthIn = (b: PaneBox) => {
    const el = scroller.current;
    if (!el) return undefined;
    const style = getComputedStyle(el);
    const sides = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    return Math.max(0, window.innerWidth - b.left - b.right - sides - (el.offsetWidth - el.clientWidth));
  };

  /** The card asked for comes on: early, made at its width while the glass is still on its way and fading in as it lands; or now. */
  const arrive = useCallback((early: boolean) => {
    const want = asked.current;
    const now = shown.current;
    if (now.key !== null || !sameBox(want.box, now.box)) return;
    now.layout = want.layout;
    now.key = want.card.key;
    now.width = early ? widthIn(want.box) : undefined;
    now.delay = early ? MOVE_MS / 1000 - 0.14 : leaving.current ? LEAVE : 0;
    redraw();
  }, []);

  const step = useCallback(() => {
    const want = asked.current;
    const now = shown.current;
    // The window resized: the glass follows it at once, with whatever's on it.
    if (want.layout === now.layout && !sameBox(want.box, now.box)) {
      now.box = want.box;
      redraw();
    }
    const sized = sameBox(want.box, now.box);
    const twice = (then: () => void) => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => (frame.current = requestAnimationFrame(then)));
    };
    if (now.key !== null) {
      if (now.key === want.card.key && sized) return;
      // What's on show goes.
      now.key = null;
      leaving.current = true;
      redraw();
      // Of a size, the next is made beneath it straight away — two frames on, once the browser has the last one's
      // going in hand and runs it on its own, so making the next can't hold it up.
      if (sized) {
        twice(step);
        return;
      }
    }
    if (!sized) {
      // A new size: the glass sets off at once, while what was on it fades out held at its width.
      now.box = want.box;
      now.layout = want.layout;
      if (instant.current) {
        redraw();
        step();
        return;
      }
      moving.current = true;
      redraw();
      window.clearTimeout(moved.current);
      moved.current = window.setTimeout(() => {
        moving.current = false;
        now.width = undefined;
        redraw();
        step();
      }, MOVE_MS);
      // The next is made meanwhile, at the size it will have — its width held, and the height it fills told it.
      twice(() => arrive(true));
      return;
    }
    if (moving.current) return;
    arrive(false);
  }, [arrive]);

  const gone = useCallback(() => {
    leaving.current = false;
    step();
  }, [step]);

  useLayoutEffect(step, [card.key, box.top, box.right, box.bottom, box.left, layout, step]);
  useEffect(
    () => () => {
      window.clearTimeout(moved.current);
      cancelAnimationFrame(frame.current);
    },
    [],
  );

  // Anything under the head yet: the head takes a touch of tint to stand on.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 4);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const now = shown.current;
  const on = now.key === card.key ? card : null;
  // The glass thickens as soon as something's chosen to read, while the list goes and it takes its new size.
  const reading = card.look === 'view';

  // A new card on show: start it from the top, and take the reader's focus to what names it.
  useLayoutEffect(() => {
    if (!on) return;
    scroller.current?.scrollTo({ top: 0 });
    pane.current?.querySelector<HTMLElement>('[data-pane-focus]')?.focus({ preventScroll: true });
  }, [on?.key]);

  return (
    <motion.section
      ref={pane}
      role="dialog"
      aria-modal="false"
      aria-labelledby={PANE_TITLE_ID}
      // Slid, never faded: frosted glass under a fade paints white in Safari until the fade lands.
      // The whole transform, not `x`: framer hands that to the browser, which slides it off the
      // main thread, so the scene's frames and React's work can't hold it up.
      initial={{ transform: 'translateX(112%)' }}
      animate={{ transform: 'translateX(0%)' }}
      exit={{ transform: 'translateX(112%)' }}
      transition={{ type: 'spring', stiffness: 170, damping: 28, mass: 1 }}
      onAnimationComplete={() => setSettled(true)}
      className="fixed z-40"
      style={{ top: now.box.top, right: now.box.right, bottom: now.box.bottom, left: now.box.left, transition: moving.current ? MOVE : undefined }}
    >
      <Squircle
        radius={radius}
        smoothing={1}
        shadow={CARD_SHADOW}
        wrapperClassName="h-full w-full"
        className="relative h-full w-full"
        style={{ background: GLASS_TINT, backdropFilter: GLASS_BACKDROP, WebkitBackdropFilter: GLASS_BACKDROP, boxShadow: GLASS_EDGE }}
      >
        {/* The glass's own layers, under all that's on it: a tint thickening to read on — never a fade of the glass,
            see above — and its grain. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: VEIL, opacity: reading ? 1 : 0, transition: `opacity ${VEIL_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: FROST_NOISE, opacity: 0.07, mixBlendMode: 'overlay' }} />

        {/* The scroll runs the glass's full height, so what's on it scrolls up beneath the head. Each card starts below
            the head's row on its own — or level with it, for a name that scrolls — so turning from one to another never
            moves the one going. */}
        <div
          ref={scroller}
          data-pane-scroll=""
          // A list with a rail by its scrollbar has no scrollbar: the rail says where the reader is, and is a way about.
          data-rail={on?.parts ? '' : undefined}
          className="pane-scroll absolute inset-0 overflow-y-auto"
          style={{ overscrollBehavior: 'contain', paddingTop: HEAD_TOP, paddingInline: PANE_PAD.sides, paddingBottom: PANE_PAD.bottom }}
        >
          {/* One cell for both cards, the one going and the one coming, as they overlap. */}
          <div className="grid grid-cols-[minmax(0,1fr)]">
            <AnimatePresence initial={false} onExitComplete={gone}>
              {on && (
                <Notecard key={on.key} delay={now.delay} turns={turns} fade={on.fade} width={now.width} rest={settled && !moving.current}>
                  <Held.Provider value={now.width !== undefined ? window.innerHeight - now.box.top - now.box.bottom : null}>
                    <Look.Provider value={on.look}>
                      <Radius.Provider value={radius}>
                        {on.titleScrolls && !on.back ? (
                          on.title && <ListTitle inRow>{on.title}</ListTitle>
                        ) : (
                          <div aria-hidden="true" style={{ height: `calc(${HEAD_ROW} + ${HEAD_BOTTOM})` }} />
                        )}
                        {/* With Back at the head, a list's name heads the list itself; its line about it is the list's first. */}
                        {on.back && on.title && <ListTitle>{on.title}</ListTitle>}
                        {on.caption && <p className={`mb-5 ${CAPTION}`}>{on.caption}</p>}
                        {on.node}
                      </Radius.Provider>
                    </Look.Provider>
                  </Held.Provider>
                </Notecard>
              )}
            </AnimatePresence>
          </div>
        </div>

        <header
          className="pointer-events-none absolute inset-x-0 top-0 z-10 [&_button]:pointer-events-auto"
          style={{ paddingTop: HEAD_TOP, paddingBottom: HEAD_BOTTOM, paddingInline: PANE_PAD.sides }}
        >
          <Haze tinted={scrolled} edge={!!on?.titleScrolls && !on.back} />
          <div className="relative flex items-center justify-between gap-6" style={{ height: HEAD_ROW }}>
            <div className="grid min-w-0 flex-1">
              <AnimatePresence initial={false}>
                {on && !(on.titleScrolls && !on.back) && (
                  <HeadItem key={on.key} delay={now.delay}>
                    {on.back ? <BackButton onClick={onBack} /> : <Title>{on.title}</Title>}
                  </HeadItem>
                )}
              </AnimatePresence>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {card.look === 'select' && card.expandable && (
                <IconButton label="Fill the screen" onClick={onExpand}>
                  <Maximize2 size={17} strokeWidth={1.75} />
                </IconButton>
              )}
              <IconButton label="Close" onClick={onClose}>
                <X size={19} strokeWidth={1.75} />
              </IconButton>
            </div>
          </div>
        </header>

        {on?.look === 'view' && !on.title && <CircularScrollIndicator key={on.key} scroller={scroller} />}
        {on?.parts && <PartsRail key={on.key} scroller={scroller} parts={on.parts} under={on.titleScrolls && !on.back ? 'edge' : 'head'} />}
      </Squircle>
    </motion.section>
  );
};

export default SectionPane;
