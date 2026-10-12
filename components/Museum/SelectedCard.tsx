import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { MoveRight } from 'lucide-react';
import type { MoodBoardItem } from '../../types';
import { squirclePath } from '../UI/Squircle';
import { CARD_SHADOW, FROST_NOISE, GLASS_BACKDROP } from './glass';
import type { MuseumTheme } from './museumTheme';
import {
  CARD_PAD,
  STACK_SAFE_BOTTOM,
  STACK_TEXT_GUESS,
  cardLayoutFor,
  selectedRect,
  stackedCardWidth,
  type SelectedView,
} from './selectedLayout';

const PAD = CARD_PAD;
/** The side card keeps at least this far from the right edge of the screen… */
const RIGHT_MARGIN = 0.07;
/** …and its text column is never wider than a comfortable line. */
const TEXT_W = 480;
/** Corner radii once fully open — the card's, and the photo's inside it. */
const CARD_R = 28;
const PHOTO_R = 16;
/** Padding above and below the stacked card's text. */
const STACK_TEXT_PAD = { top: 4, bottom: 16 };

/** The panel sliding out from behind the photo, and folding back. */
// A gentle ease-out: it starts unhurried and settles softly, rather than snapping open.
const OPEN = { duration: 0.9, ease: [0.33, 1, 0.68, 1] as const };
const CLOSE = { duration: 0.42, ease: [0.4, 0, 0.2, 1] as const };

/** A downward swipe on the stacked card puts the piece back: far enough, or fast enough. */
const SWIPE_CLOSE_PX = 90;
const SWIPE_CLOSE_SPEED = 0.6; // px per ms

/** A fully smoothed squircle path, offset to (x, y) inside its element. */
const squircleAt = (x: number, y: number, w: number, h: number, r: number) =>
  squirclePath(Math.max(w, 0.01), Math.max(h, 0.01), r, 1).replace(
    /([ML]) (-?[\d.e+-]+) (-?[\d.e+-]+)/g,
    (_, cmd, a, b) => `${cmd} ${(+a + x).toFixed(2)} ${(+b + y).toFixed(2)}`,
  );

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, t: number) => {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/**
 * The photo, drawn flat from the pane's own texture so it sits exactly over
 * the 3D pane — same crop, same pixels — and the hand-off can't be seen.
 */
const CardImage: React.FC<{ source: CanvasImageSource | null; width: number; height: number }> = ({ source, width, height }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvas.current;
    if (!c || !source) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(width * dpr);
    c.height = Math.round(height * dpr);
    const sw = (source as HTMLCanvasElement).width;
    const sh = (source as HTMLCanvasElement).height;
    if (!sw || !sh) return;
    // Cover-fit, as the pane's shader does.
    const k = Math.max(c.width / sw, c.height / sh);
    const g = c.getContext('2d')!;
    g.imageSmoothingQuality = 'high';
    g.drawImage(source, (c.width - sw * k) / 2, (c.height - sh * k) / 2, sw * k, sh * k);
  }, [source, width, height]);
  return <canvas ref={canvas} className="block h-full w-full" />;
};

interface Props {
  item: MoodBoardItem;
  /** The best texture image to hand: the sharp copy once it's in, the shelf copy before. */
  source: CanvasImageSource | null;
  /** The pane's own aspect (width / height) on the shelf. */
  aspect: number;
  view: SelectedView;
  /** Fold back behind the photo, then call onRetracted. */
  closing: boolean;
  onClose: () => void;
  onRetracted: () => void;
  theme: MuseumTheme;
}

/**
 * The selected piece, read up close: one frosted card — the same glass as the
 * ring's popup cards and the About note, corners fully smoothed — holding the
 * photo and its story. On a wide screen the text sits beside the photo; on a
 * tall one (phones, a tablet held upright) it sits beneath.
 *
 * It arrives as a square-cornered photo exactly where the 3D pane landed.
 * The glass panel then slides out from behind it, bringing the text, while
 * the photo's corners round off; closing runs the same move backwards. One
 * progress value drives all of it, written straight to the DOM each frame.
 */
const SelectedCard: React.FC<Props> = ({ item, source, aspect, view, closing, onClose, onRetracted, theme }) => {
  const stacked = cardLayoutFor(view) === 'stacked';
  const img = selectedRect(view, aspect);

  // The stacked card is as tall as its text needs, measured once it renders —
  // down to the bottom of the screen, past which the description scrolls.
  const [textH, setTextH] = useState(STACK_TEXT_GUESS);
  const maxTextH = Math.max(120, view.height - STACK_SAFE_BOTTOM - (img.top + img.height + PAD));
  const shownTextH = Math.min(textH, maxTextH);

  const card = stacked
    ? (() => {
        const width = stackedCardWidth(view);
        return { left: (view.width - width) / 2, top: img.top - PAD, width, height: img.height + PAD * 2 + shownTextH };
      })()
    : {
        left: img.left - PAD,
        top: img.top - PAD,
        width: Math.min(view.width * (1 - RIGHT_MARGIN) - (img.left - PAD), img.width + PAD * 2 + TEXT_W),
        height: img.height + PAD * 2,
      };
  // Where the photo sits inside the card.
  const photoX = img.left - card.left;
  const photoY = img.top - card.top;

  const sheet = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const links = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  // No Escape key to mention on a touch screen.
  const touch = useMemo(() => typeof window !== 'undefined' && !!window.matchMedia?.('(hover: none)').matches, []);

  useLayoutEffect(() => {
    if (!stacked || !content.current || !links.current) return;
    // The words themselves, not the box they scroll in — that only ever grows to fit.
    const natural = content.current.offsetHeight + links.current.offsetHeight + STACK_TEXT_PAD.top + STACK_TEXT_PAD.bottom;
    if (Math.abs(natural - textH) > 0.5) setTextH(natural);
    // Re-measure when the text or its width changes, not when the height we set does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stacked, item, view.width, view.height, img.width]);

  const apply = useCallback(
    (t: number) => {
      progress.current = t;
      // The panel grows from the photo's own rectangle out to the full card.
      const x = lerp(photoX, 0, t);
      const y = lerp(photoY, 0, t);
      const w = lerp(img.width, card.width, t);
      const h = lerp(img.height, card.height, t);
      const r = lerp(0, CARD_R, t);
      const clip = `path('${squircleAt(x, y, w, h, r)}')`;
      if (panel.current) {
        panel.current.style.clipPath = clip;
        panel.current.style.setProperty('-webkit-clip-path', clip);
      }
      if (shadow.current) {
        Object.assign(shadow.current.style, {
          left: `${card.left + x}px`,
          top: `${card.top + y}px`,
          width: `${w}px`,
          height: `${h}px`,
          borderRadius: `${r}px`,
          opacity: String(t),
        });
      }
      const photoClip = `path('${squircleAt(0, 0, img.width, img.height, lerp(0, PHOTO_R, t))}')`;
      if (photo.current) {
        photo.current.style.clipPath = photoClip;
        photo.current.style.setProperty('-webkit-clip-path', photoClip);
      }
      // The text follows the panel out — sideways or downwards — a beat behind it.
      if (text.current) {
        text.current.style.opacity = String(smooth(0.35, 0.95, t));
        text.current.style.transform = stacked ? `translateY(${(1 - t) * -24}px)` : `translateX(${(1 - t) * -36}px)`;
      }
    },
    [stacked, photoX, photoY, img.width, img.height, card.width, card.height, card.left, card.top],
  );

  // Keep the current pose if the window resizes (or the text is measured) mid-move —
  // and let a move already under way pick up the new shape on its next frame.
  const applyRef = useRef(apply);
  applyRef.current = apply;
  useLayoutEffect(() => apply(progress.current), [apply]);

  useEffect(() => {
    const step = (t: number) => applyRef.current(t);
    const controls = closing
      ? animate(progress.current, 0, { ...CLOSE, onUpdate: step, onComplete: onRetracted })
      : animate(progress.current, 1, { ...OPEN, onUpdate: step });
    return () => controls.stop();
    // Only a change of direction restarts the move.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  /* ─── Swipe down to put it back (stacked) ─────────────────── */

  const drag = useRef<{ id: number; y0: number; dy: number; t: number; v: number } | null>(null);
  const settle = (close: boolean) => {
    const el = sheet.current;
    if (el) {
      el.style.transition = 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = '';
    }
    if (close) onClose();
  };
  const onDown = (e: React.PointerEvent) => {
    if (!stacked || e.pointerType === 'mouse' || closing) return;
    // A description scrolled down is being read, not dismissed.
    if (body.current?.contains(e.target as Node) && body.current.scrollTop > 0) return;
    drag.current = { id: e.pointerId, y0: e.clientY, dy: 0, t: performance.now(), v: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || !sheet.current) return;
    const dy = Math.max(0, e.clientY - d.y0);
    const now = performance.now();
    d.v = (dy - d.dy) / Math.max(1, now - d.t);
    d.dy = dy;
    d.t = now;
    sheet.current.style.transition = 'none';
    // Follows the finger, with a little resistance.
    sheet.current.style.transform = `translateY(${dy * 0.85}px)`;
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    settle(d.dy > SWIPE_CLOSE_PX || (d.dy > 24 && d.v > SWIPE_CLOSE_SPEED));
  };
  const onCancel = () => {
    if (!drag.current) return;
    drag.current = null;
    settle(false);
  };

  return (
    <div
      ref={sheet}
      className="pointer-events-none absolute inset-0"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onCancel}
    >
      <div ref={shadow} aria-hidden="true" className="pointer-events-none absolute" style={{ boxShadow: CARD_SHADOW, opacity: 0 }} />

      <div
        ref={panel}
        role="dialog"
        aria-label={item.title}
        className="pointer-events-auto absolute"
        style={{
          ...card,
          background: theme.glass,
          transition: 'background-color 500ms',
          backdropFilter: GLASS_BACKDROP,
          WebkitBackdropFilter: GLASS_BACKDROP,
          boxShadow: theme.glassEdge,
          clipPath: `path('${squircleAt(photoX, photoY, img.width, img.height, 0)}')`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={text}
          className="absolute flex flex-col"
          style={
            stacked
              ? {
                  left: 0,
                  right: 0,
                  top: img.height + PAD * 2,
                  height: shownTextH,
                  padding: `${STACK_TEXT_PAD.top}px 22px ${STACK_TEXT_PAD.bottom}px`,
                  opacity: 0,
                }
              : { left: img.width + PAD * 2, top: PAD, right: 0, bottom: PAD, padding: '12px 30px 6px 20px', opacity: 0 }
          }
        >
          <div
            ref={body}
            className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${stacked ? 'justify-start' : 'justify-center'}`}
            style={{ overscrollBehavior: 'contain' }}
          >
            <div ref={content}>
              <h2 className="font-serif text-[22px] font-semibold leading-tight tracking-tight md:text-[24px]" style={{ color: theme.text }}>
                {item.title}
              </h2>
              <p className="mt-[5px] font-sans text-[15px] leading-snug" style={{ color: theme.textBody }}>
                {item.description}
              </p>
            </div>
          </div>

          <div ref={links} className="flex shrink-0 items-baseline justify-between pt-4 font-serif text-[17px]">
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 transition-opacity hover:opacity-70"
                style={{ color: theme.text }}
              >
                <span className="underline-offset-4 group-hover:underline">View source</span>
                {/* Centred on the lowercase letters, not the line box — a hair above
                    the box's middle, so the arrowhead never dips below the baseline. */}
                <MoveRight
                  aria-hidden="true"
                  size={16}
                  strokeWidth={1.3}
                  className="-translate-y-[0.5px] transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
            ) : (
              <span />
            )}
            <button type="button" onClick={onClose} className="transition-opacity hover:opacity-70" style={{ color: theme.textMuted }}>
              Close{!touch && <span className="text-[14px] opacity-75"> (esc)</span>}
            </button>
          </div>
        </div>

        {/* Frost grain over the whole pane at 7%, as on the ring's cards. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: FROST_NOISE, opacity: 0.07, mixBlendMode: 'overlay' }}
        />
      </div>

      <div ref={photo} className="pointer-events-auto absolute overflow-hidden" style={{ ...img }} onClick={(e) => e.stopPropagation()}>
        <CardImage source={source} width={img.width} height={img.height} />
      </div>
    </div>
  );
};

export default SelectedCard;
