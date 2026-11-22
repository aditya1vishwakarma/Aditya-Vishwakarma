import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion as motionComponent, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { usePaneSettled } from '../Home/SectionPane';

const motion = motionComponent as any;

export interface MediaItem {
  /** 'image' (default) or 'video'. */
  type?: 'image' | 'video';
  /** CDN url for the media. */
  src: string;
  /** Alt text (images) or aria-label (videos). */
  alt?: string;
  /** Its own caption, by the pointer as it's pointed at, and in the viewer. Without one, nothing follows the pointer. */
  caption?: string;
  /** Its shape, width over height, if it's known: otherwise it's read from the file as the pane settles. */
  ratio?: number;
  /** Where it sits on its mat if its frame's a touch another shape, as `object-position`. Centred by default. */
  position?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  /** The gallery's own caption: its caption line at rest, and any item's without one of its own. */
  caption?: string;
  /** 'full' lets it run the column's whole width; otherwise it keeps to the words' width. */
  bleed?: 'wide' | 'full';
  /**
   * Beside the text, rather than between paragraphs: to one side, 42% of the words' width, the paragraphs after it
   * wrapping round it as a magazine's do; for a tall picture, or two, to have a column of their own. On a phone it's
   * between paragraphs as ever. A section heading starts below it.
   */
  beside?: 'left' | 'right';
  /** Kept so older pages read the same: the grid lays itself out. */
  orientation?: 'portrait' | 'landscape' | 'square';
  align?: 'center' | 'start';
  className?: string;
}

/** Pointed at, a tile lifts this much over its neighbours, or less where it would reach past the gallery by more than SLACK. */
const LIFT = 1.3;
const SLACK = 16;
const LIFT_SHADOW = '0 30px 60px -24px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.06)';
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
/**
 * The caption that follows the pointer: how far from it, how it glides after it, and how near the screen's foot it
 * may come before it goes above the pointer instead.
 */
const CHIP = { gap: 18, foot: 12, spring: { stiffness: 520, damping: 42, mass: 0.6 } };
/** How the tiles come in, the first time the gallery's in view: each a beat after the last. */
const REVEAL = { stagger: 60, rise: 18 };

/** An item's shape: tall (a phone's screenshot), even (about square), or wide (a photo, a desktop's screenshot). */
type Shape = 'tall' | 'even' | 'wide';
const shapeOf = (ratio: number): Shape => (ratio < 0.85 ? 'tall' : ratio > 1.25 ? 'wide' : 'even');
/** How many of a shape go side by side: three tall or even, two wide. */
const ACROSS: Record<Shape, number> = { tall: 3, even: 3, wide: 2 };
/** Until an item's shape is known, it's taken as a photo's. */
const GUESS = 4 / 3;
/** No frame taller than this: a lone tall one, or a pair, keeps to it and narrows, centred, rather than running on. */
const TALLEST = 'min(78vh, 720px)';

/** n of a shape into rows of at most `most`, as even as they'll go: 4 is 2 and 2, 5 is 3 and 2, a lone one a row of its own. */
const evenly = (n: number, most: number) => {
  const out: number[] = [];
  let left = n;
  for (let rows = Math.ceil(n / most); rows > 0; rows--) {
    const k = Math.ceil(left / rows);
    out.push(k);
    left -= k;
  }
  return out;
};

type Row = { items: number[]; ratio: number };

/**
 * Symmetric sets: the items, in their order, in runs of one shape, and each run in rows of equal frames — tall ones
 * three across, wide ones two. A row's frames share its items' average shape, each item whole on its mat.
 */
const rowsOf = (ratios: number[]): Row[] => {
  const rows: Row[] = [];
  for (let i = 0; i < ratios.length; ) {
    const shape = shapeOf(ratios[i]);
    let j = i;
    while (j < ratios.length && shapeOf(ratios[j]) === shape) j++;
    let at = i;
    for (const k of evenly(j - i, ACROSS[shape])) {
      const items = Array.from({ length: k }, (_, m) => at + m);
      rows.push({ items, ratio: items.reduce((sum, m) => sum + ratios[m], 0) / k });
      at += k;
    }
    i = j;
  }
  return rows;
};

const two = (n: number) => String(n).padStart(2, '0');

/** A video's first frame, drawn before it plays: Safari draws nothing for a video it's only read the size of, without a start. */
const firstFrame = (src: string) => (src.includes('#') ? src : `${src}#t=0.001`);

/** A mouse or a trackpad, that can point at a tile without choosing it: a video's loaded ahead there, to play the moment it's pointed at. */
const canPoint = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * A gallery of pictures and videos, all in view at once and every one whole, in symmetric sets (`rowsOf`): rows of
 * equal frames, by shape. Or beside the text (`beside`), the paragraphs wrapping round it.
 *
 * - Pointed at (or tabbed to), a tile lifts over its neighbours, which dim. If it has a caption of its own, that
 *   follows the pointer, with its number; if not, nothing does. The gallery's own caption is under it.
 * - A video plays, muted, while it's lifted, a line in its corner running as it plays. Where there's a pointer, it's
 *   loaded once the gallery's in view, so it starts as soon as it's pointed at.
 * - Chosen (a click, a tap, Enter), it opens in the viewer over the pane, at full size with its caption: arrows,
 *   keys and a swipe step through them, Escape or the backdrop puts it away.
 * - Its items' shapes are read as the pane settles; it comes in once they're known, tile by tile, the first time it
 *   scrolls into view, so nothing moves once it's there.
 */
export const MediaGallery: React.FC<MediaGalleryProps> = ({ items, caption, bleed, beside, className = '' }) => {
  const id = useId();
  const still = useReducedMotion();
  const grid = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  // Each video's line, how far it's played; and which video's playing, its frames moving (not waiting on the file).
  const lines = useRef<(HTMLSpanElement | null)[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);
  const [pointer] = useState(canPoint);
  const [active, setActive] = useState<number | null>(null);
  // The caption by the pointer: which captioned tile's it last showed (kept as it goes), and where it is, gliding after it.
  const [shown, setShown] = useState(0);
  const chip = useRef<HTMLDivElement>(null);
  const chipShown = useRef(false);
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const sx = useSpring(cx, CHIP.spring);
  const sy = useSpring(cy, CHIP.spring);
  const chipAt = useMotionTemplate`translate3d(${sx}px, ${sy}px, 0)`;
  const [lift, setLift] = useState<{ scale: number; origin: string }>({ scale: 1, origin: '50% 50%' });
  const [open, setOpen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(!!still);
  const n = items.length;

  // Each item's shape: given, or read from its file once the pane's settled (a picture's or a video's own size). One
  // that can't be read is taken as a photo; so is any not read within 4s.
  const settled = usePaneSettled();
  const [ratios, setRatios] = useState<(number | null)[]>(() => items.map((it) => it.ratio ?? null));
  useEffect(() => {
    if (!settled) return;
    let alive = true;
    const put = (i: number, ratio: number) =>
      alive && setRatios((r) => (r[i] ? r : Object.assign([...r], { [i]: ratio })));
    items.forEach((it, i) => {
      if (ratios[i]) return;
      if (it.type === 'video') {
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.muted = true;
        v.onloadedmetadata = () => put(i, v.videoWidth && v.videoHeight ? v.videoWidth / v.videoHeight : GUESS);
        v.onerror = () => put(i, GUESS);
        v.src = it.src;
      } else {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => put(i, img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : GUESS);
        img.onerror = () => put(i, GUESS);
        img.src = it.src;
      }
    });
    const late = window.setTimeout(() => alive && setRatios((r) => r.map((x) => x ?? GUESS)), 4000);
    return () => {
      alive = false;
      window.clearTimeout(late);
    };
    // Read once, when the pane's settled.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settled]);
  const known = ratios.every(Boolean);
  const rows = rowsOf(ratios.map((r) => r ?? GUESS));
  const inView = revealed && known;

  // In they come, the first time the gallery's in view.
  useEffect(() => {
    const el = grid.current;
    if (revealed || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [revealed]);

  /** Lift a tile: as far as LIFT, or less where it would reach past the gallery, from the side that keeps it in. */
  const enter = useCallback((index: number, cell: HTMLElement) => {
    const root = grid.current;
    if (!root) return;
    // Where the cell is in the grid, by layout: never thrown by a tile still lifted or settling.
    let x = 0;
    let y = 0;
    for (let at: HTMLElement | null = cell; at && at !== root; at = at.offsetParent as HTMLElement | null) {
      x += at.offsetLeft;
      y += at.offsetTop;
    }
    const W = root.clientWidth;
    const H = root.clientHeight;
    const w = cell.offsetWidth;
    const h = cell.offsetHeight;
    const scale = Math.max(1, Math.min(LIFT, (W + 2 * SLACK) / w, (H + 2 * SLACK) / h));
    const ox = x < 1 ? 0 : x + w > W - 1 ? 100 : 50;
    const oy = y < 1 ? 0 : y + h > H - 1 ? 100 : 50;
    setLift({ scale, origin: `${ox}% ${oy}%` });
    setActive(index);
  }, []);
  const leave = useCallback((index: number) => {
    setActive((a) => (a === index ? null : a));
    chipShown.current = false;
  }, []);

  /** The caption to the pointer: below and right of it, or left of it near the gallery's right, or above it near the screen's foot. */
  const follow = (clientX: number, clientY: number) => {
    const root = grid.current;
    if (!root) return;
    const r = root.getBoundingClientRect();
    const w = chip.current?.offsetWidth ?? 240;
    const h = chip.current?.offsetHeight ?? 64;
    let x = clientX - r.left + CHIP.gap;
    if (x + w > r.width) x = clientX - r.left - CHIP.gap - w;
    let y = clientY - r.top + CHIP.gap;
    if (clientY + CHIP.gap + h > window.innerHeight - CHIP.foot) y = clientY - r.top - CHIP.gap - h;
    // Coming onto the gallery, it's there at once; moving over it, it glides.
    if (!chipShown.current) {
      cx.jump(x);
      cy.jump(y);
      sx.jump(x);
      sy.jump(y);
      chipShown.current = true;
    } else {
      cx.set(x);
      cy.set(y);
    }
  };

  /** Tabbed to, the caption sits in the tile's lower left corner. */
  const atCorner = (cell: HTMLElement) => {
    const root = grid.current;
    if (!root) return;
    let x = 0;
    let y = 0;
    for (let at: HTMLElement | null = cell; at && at !== root; at = at.offsetParent as HTMLElement | null) {
      x += at.offsetLeft;
      y += at.offsetTop;
    }
    const h = chip.current?.offsetHeight ?? 64;
    const px = x + 12;
    const py = y + cell.offsetHeight - h - 12;
    cx.jump(px);
    cy.jump(py);
    sx.jump(px);
    sy.jump(py);
    chipShown.current = true;
  };

  // A video plays while it's lifted, its line following it.
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) v.play().catch(() => {});
      else v.pause();
    });
    const v = active === null ? null : videos.current[active];
    const line = active === null ? null : lines.current[active];
    if (!v || !line) return;
    let frame = 0;
    const tick = () => {
      if (v.duration) line.style.transform = `scaleX(${v.currentTime / v.duration})`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const tile = (index: number, ratio: number) => {
    const item = items[index];
    const lifted = active === index;
    const dimmed = active !== null && !lifted;
    const delay = still ? 0 : index * REVEAL.stagger;
    const label = item.alt || `${item.type === 'video' ? 'Video' : 'Picture'} ${index + 1} of ${n}`;
    const media =
      item.type === 'video' ? (
        <video
          ref={(el) => {
            videos.current[index] = el;
          }}
          src={firstFrame(item.src)}
          muted
          loop
          playsInline
          preload={pointer && inView ? 'auto' : 'metadata'}
          onPlaying={() => setPlaying(index)}
          onPause={() => setPlaying((p) => (p === index ? null : p))}
          onWaiting={() => setPlaying((p) => (p === index ? null : p))}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain"
          style={{ objectPosition: item.position }}
        />
      ) : (
        <img
          ref={(el) => {
            if (el?.complete) el.dataset.loaded = '';
          }}
          src={item.src}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={(e) => (e.currentTarget.dataset.loaded = '')}
          className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-500 data-[loaded]:opacity-100"
          style={{ objectPosition: item.position }}
        />
      );
    return (
      // The cell comes in; the tile in it lifts. The cell stays over its neighbours until a tile let go has settled.
      <div
        key={index}
        className="relative min-h-0 min-w-0"
        style={{
          zIndex: lifted ? 20 : 0,
          opacity: inView ? 1 : 0,
          transform: inView ? 'none' : `translateY(${REVEAL.rise}px)`,
          transition: `opacity 0.6s ${EASE} ${delay}ms, transform 0.8s ${EASE} ${delay}ms, z-index 0s linear ${lifted ? 0 : 0.45}s`,
        }}
      >
        <button
          type="button"
          aria-label={label}
          aria-describedby={`${id}-${index}`}
          onClick={() => setOpen(index)}
          onPointerEnter={(e) => {
            if (e.pointerType === 'touch') return;
            enter(index, e.currentTarget.parentElement!);
            if (item.caption) setShown(index);
            follow(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => e.pointerType !== 'touch' && follow(e.clientX, e.clientY)}
          onPointerLeave={() => leave(index)}
          onFocus={(e) => {
            if (!e.currentTarget.matches(':focus-visible')) return;
            enter(index, e.currentTarget.parentElement!);
            if (item.caption) setShown(index);
            atCorner(e.currentTarget.parentElement!);
          }}
          onBlur={() => leave(index)}
          className="group/tile relative block w-full overflow-hidden bg-charcoal/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          style={{
            aspectRatio: ratio,
            transform: lifted ? `scale(${lift.scale})` : 'none',
            transformOrigin: lifted ? lift.origin : undefined,
            opacity: dimmed ? 0.6 : 1,
            boxShadow: lifted ? LIFT_SHADOW : '0 0 0 0 rgba(0,0,0,0)',
            transition: still ? 'opacity 0.2s' : `transform 0.45s ${EASE}, box-shadow 0.45s ${EASE}, opacity 0.3s ease`,
          }}
        >
          {media}
          {/* A video's mark: its play sign, which beats while it's lifted and still loading, and once it's playing, a
              line beside it running as it plays. Dark, so it reads over any frame. */}
          {item.type === 'video' && (
            <span aria-hidden="true" className="absolute bottom-2 left-2 flex h-7 items-center bg-black/45 px-2 text-white backdrop-blur-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={lifted && playing !== index ? 'animate-pulse' : ''}>
                <path d="M7 4.5v15l13-7.5z" />
              </svg>
              <span
                className="relative h-[2px] overflow-hidden bg-white/30"
                style={{
                  width: playing === index ? 40 : 0,
                  marginLeft: playing === index ? 8 : 0,
                  transition: still ? 'none' : `width 0.35s ${EASE}, margin 0.35s ${EASE}`,
                }}
              >
                <span
                  ref={(el) => {
                    lines.current[index] = el;
                  }}
                  className="absolute inset-0 origin-left bg-white"
                  style={{ transform: 'scaleX(0)' }}
                />
              </span>
            </span>
          )}
        </button>
      </div>
    );
  };

  const said = (i: number) => items[i]?.caption ?? caption;

  return (
    <>
      <figure
        className={`${
          beside
            ? `my-8 md:mb-5 md:mt-1 md:w-[42%] ${beside === 'left' ? 'md:float-left md:mr-8' : 'md:float-right md:ml-8'}`
            : `my-10 ${bleed === 'full' ? 'bleed-full' : ''}`
        } ${className}`}
      >
        <div ref={grid} className="relative flex flex-col gap-[var(--gallery-gap)] [--gallery-gap:8px] md:[--gallery-gap:12px]">
          {rows.map((row, r) => {
            const k = row.items.length;
            return (
              // A row of equal frames, no taller than TALLEST: narrower then, and centred.
              <div
                key={r}
                className="mx-auto grid w-full gap-[var(--gallery-gap)]"
                style={{
                  gridTemplateColumns: `repeat(${k}, minmax(0, 1fr))`,
                  maxWidth: `calc(${k} * ${TALLEST} * ${row.ratio} + ${k - 1} * var(--gallery-gap))`,
                }}
              >
                {row.items.map((i) => tile(i, row.ratio))}
              </div>
            );
          })}

          {/* The caption by the pointer, for a tile with a caption of its own: solid, so it reads over any picture, its
              number over its words. Charcoal by day and cream by night, the page's own colours turned over. */}
          <AnimatePresence>
            {active !== null && !!items[active]?.caption && (
              <motion.div ref={chip} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-30" style={{ transform: chipAt }}>
                <motion.div
                  initial={{ opacity: 0, transform: 'scale(0.94)' }}
                  animate={{ opacity: 1, transform: 'scale(1)' }}
                  exit={{ opacity: 0, transform: 'scale(0.97)' }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="max-w-[260px] origin-top-left bg-charcoal px-3 py-2.5 text-background shadow-[0_14px_32px_-14px_rgba(0,0,0,0.5)]"
                >
                  <span className="block text-[10.5px] font-medium uppercase tabular-nums tracking-[0.16em] opacity-75">
                    {two(shown + 1)} / {two(n)}
                  </span>
                  <span className="mt-1 block text-[14px] leading-[1.35] [text-wrap:pretty]">{items[shown]?.caption}</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {caption && <figcaption className="mt-3 text-[15px] leading-snug text-charcoal/75 [text-wrap:pretty]">{caption}</figcaption>}
        {/* What a tile says, for a screen reader: the caption by the pointer is for the eye only. */}
        {items.map((_, i) => (
          <span key={i} id={`${id}-${i}`} className="sr-only">
            {two(i + 1)} of {two(n)}. {said(i)}
          </span>
        ))}
      </figure>

      <Viewer items={items} caption={caption} at={open} onAt={setOpen} />
    </>
  );
};

/**
 * One picture or video at full size, over the whole of the pane it's in, with its number and caption. Its keys come
 * first, so Escape puts it away before it would take the pane back to its list.
 */
const Viewer: React.FC<{ items: MediaItem[]; caption?: string; at: number | null; onAt: (i: number | null) => void }> = ({ items, caption, at, onAt }) => {
  const n = items.length;
  const touch = useRef<number | null>(null);
  const step = useCallback((by: number) => at !== null && onAt((at + by + n) % n), [at, n, onAt]);

  useEffect(() => {
    if (at === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onAt(null);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else return;
      e.stopPropagation();
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey, true);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = '';
    };
  }, [at, onAt, step]);

  const item = at === null ? null : items[at];
  const text = item ? item.caption ?? caption : undefined;
  const arrow = 'absolute top-1/2 z-10 hidden -translate-y-1/2 p-2 text-white/60 transition-colors hover:text-white md:flex';

  return (
    <AnimatePresence>
      {item && at !== null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={item.alt || 'Picture'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-black/85 px-6 backdrop-blur-sm"
          onClick={() => onAt(null)}
          onTouchStart={(e: React.TouchEvent) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e: React.TouchEvent) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(dx) > 50) step(dx > 0 ? -1 : 1);
            touch.current = null;
          }}
        >
          <span className="absolute left-6 top-6 text-[11.5px] uppercase tabular-nums tracking-[0.16em] text-white/70">
            {two(at + 1)} / {two(n)}
          </span>
          <button type="button" onClick={() => onAt(null)} aria-label="Close" className="absolute right-5 top-5 z-10 p-1 text-white/60 transition-colors hover:text-white">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {n > 1 && (
            <>
              <button type="button" aria-label="Previous" className={`${arrow} left-4`} onClick={(e) => (e.stopPropagation(), step(-1))}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button type="button" aria-label="Next" className={`${arrow} right-4`} onClick={(e) => (e.stopPropagation(), step(1))}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}
          <motion.div
            key={at}
            initial={{ opacity: 0, transform: 'scale(0.96)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {item.type === 'video' ? (
              <video src={item.src} controls autoPlay playsInline aria-label={item.alt} className="max-h-[78vh] max-w-[88vw] shadow-2xl" />
            ) : (
              <img src={item.src} alt={item.alt || ''} decoding="async" className="max-h-[78vh] max-w-[88vw] object-contain shadow-2xl" />
            )}
          </motion.div>
          {text && <p className="max-w-[60ch] text-center text-[15px] leading-snug text-white/80 [text-wrap:pretty]">{text}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
