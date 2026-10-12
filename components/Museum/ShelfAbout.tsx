import React, { useEffect, useRef, useState } from 'react';
import { motion as motionComponent, AnimatePresence } from 'framer-motion';
import Squircle from '../UI/Squircle';
import { CARD_SHADOW, FROST_NOISE, GLASS_BACKDROP } from './glass';
import type { MuseumTheme } from './museumTheme';

const motion = motionComponent as any;

/**
 * The words in the "why is the shelf organized this way?" popover.
 * Placeholder for now — write the real story here.
 */
export const SHELF_ABOUT = {
  title: 'The significance of the shelf',
  body: [
    'This shelf is something I saw at the Art Institute of Chicago. From the moment I saw it, I fell in love with the craftsmanship of the shelves rather than the ceramics the museum piece aimed to display. The joinery, the angles, the quality of the wood. I love it.',
  ],
  image: '/museum/img_0930.jpg',
  imageAlt: 'The museum display case the shelving is modelled on',
};

/** The frosted pill shared by Home, this button and the theme toggle, so they read as a set. */
export const pillClass = (theme: MuseumTheme, compact = false) =>
  `${compact ? 'rounded-[13px]' : 'rounded-[22px]'} border shadow-lg backdrop-blur-xl transition-all duration-500 ${theme.pill}`;

/** Square, and as tall as the Home pill: full size, and the phone size the mood board uses. */
export const buttonSize = (compact = false) => (compact ? 40 : 58);
/** Between the button and the card — the same gap as between the two buttons on a phone. */
const GAP = 8;

interface Props {
  /** Hidden while a pane is out, as Home is. */
  visible: boolean;
  theme: MuseumTheme;
  /** Phone-sized. */
  compact?: boolean;
}

/** A small "i" in the top-left corner that opens a note on how the shelf is arranged. */
const ShelfAbout: React.FC<Props> = ({ visible, theme, compact = false }) => {
  const BUTTON = buttonSize(compact);
  // The ring view's popup card glass (MoodBoardCard), in this theme's tint.
  const glass = { background: theme.glass, backdropFilter: GLASS_BACKDROP, WebkitBackdropFilter: GLASS_BACKDROP };
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);

  // Decode the reference photo ahead of time, so the first open doesn't stall on it.
  useEffect(() => {
    const img = new Image();
    img.src = SHELF_ABOUT.image;
    img.decode?.().catch(() => { });
  }, []);

  // Close on Escape, or on a press anywhere outside the button and popover.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onPress = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPress);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPress);
    };
  }, [open]);

  return (
    <div
      ref={root}
      data-ui
      className={`relative transition-opacity duration-500 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      // Presses here are for the button and popover, never a drag of the shelf.
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label={SHELF_ABOUT.title}
        aria-expanded={open}
        title={SHELF_ABOUT.title}
        onClick={() => setOpen((o) => !o)}
        className={`${pillClass(theme, compact)} flex items-center justify-center font-serif font-medium italic active:scale-95 ${compact ? 'text-lg' : 'text-2xl'}`}
        style={{ width: BUTTON, height: BUTTON }}
      >
        i
      </button>

      <AnimatePresence>
        {open && (
          /* Framer owns this element's transform and opacity, so it must carry
             no CSS transitions of its own — the pill's `transition-all` here is
             what replayed the fade and made the popover flicker open twice.
             The entrance is scale-only: glass with a backdrop blur mustn't sit
             under an ancestor that's fading in, or Safari paints it white until
             the fade lands. */
          <motion.div
            role="dialog"
            aria-label={SHELF_ABOUT.title}
            initial={{ scale: 0.92, y: -4 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -2, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 36 }}
            className="absolute left-0 w-[min(380px,calc(100vw-2rem))]"
            style={{ top: BUTTON + GAP, transformOrigin: `${BUTTON / 2}px ${-GAP}px` }}
          >
            {/* The ring view's popup card, with its corners fully smoothed. */}
            <Squircle
              radius={28}
              smoothing={1}
              shadow={CARD_SHADOW}
              wrapperClassName="w-full"
              style={{ ...glass, position: 'relative', padding: 12, boxShadow: theme.glassEdge, transition: 'background-color 500ms' }}
            >
              <div className="relative flex flex-col">
                <div className="flex flex-col gap-[5px]" style={{ padding: '10px 14px 14px' }}>
                  <h2 className="font-serif text-[22px] font-semibold leading-tight tracking-tight md:text-[24px]" style={{ color: theme.text }}>
                    {SHELF_ABOUT.title}
                  </h2>
                  {SHELF_ABOUT.body.map((p, i) => (
                    <p key={i} className="font-sans text-[15px] leading-snug" style={{ color: theme.textBody }}>
                      {p}
                    </p>
                  ))}
                </div>
                <Squircle radius={16} className="w-full">
                  <img
                    src={SHELF_ABOUT.image}
                    alt={SHELF_ABOUT.imageAlt}
                    decoding="async"
                    className="block aspect-[1200/929] w-full object-cover"
                  />
                </Squircle>
              </div>

              {/* Frost grain over the whole pane at 7%, as on the ring's cards. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: FROST_NOISE, opacity: 0.07, mixBlendMode: 'overlay' }}
              />
            </Squircle>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShelfAbout;
