import React, { useEffect, useState } from 'react';
import { motion as motionComponent, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { glassStyle } from '../UI/glass';
import { useSafeArea, type Insets } from '../Home/safeArea';

const motion = motionComponent as any;

export interface NavItem {
  id: string;
  label: string;
}

interface NavbarProps {
  items: NavItem[];
  /** The item whose pane is open, if any. */
  active: string | null;
  onSelect: (id: string) => void;
  /** The small name beside the links: kept out of the way while the big one is on screen. */
  showName: boolean;
  /** The small name leads home: every pane closed. */
  onHome: () => void;
  /** Someone is about to choose this item — it's under the pointer, or has the focus — so what it opens can start loading. */
  onIntent?: (id: string) => void;
  /** The page's margin. The nav's pane sits on it, at the top and the right. */
  margin: number;
  /** Phone-sized: the links fold away behind a menu button. */
  compact?: boolean;
  /** Up off the top of the screen, out of the way: while a piece is open to read. */
  away?: boolean;
  className?: string;
}

/** Between the nav's pane and the links' pills, all round. */
const INSET = 5;
/** Each link's own pill, round its line. */
const LINK_PAD = { x: 14, y: 8 };
const LINE = 14 * 1.2;

/**
 * Where the nav's pane sits, from the top and the right of the screen: on the
 * page's margins, as everything else is — inside the safe area, on a phone
 * with a status bar or a notch. A phone's sits a little outside its margins,
 * for the room.
 */
export const navPlace = (margin: number, compact: boolean, safe?: Insets) => {
  const place = compact ? { top: margin - 8, right: margin - 10 } : { top: margin, right: margin };
  return safe ? { top: place.top + safe.top, right: place.right + safe.right } : place;
};

/** How tall the nav's pane is: the links' pills and the glass round them. A phone's is a 40px button in 3px of pane. */
export const navHeight = (compact: boolean) => (compact ? 46 : 2 * (INSET + LINK_PAD.y) + LINE);

/** Where the nav's pane ends, going down. */
export const navBottom = (margin: number, compact: boolean, safe?: Insets) => navPlace(margin, compact, safe).top + navHeight(compact);

/** A link's text, and a faint pill under it while it's pointed at. */
const LINK =
  'relative block rounded-full font-sans font-medium text-[rgba(51,51,51,0.78)] transition-colors duration-300 ' +
  'hover:bg-white/30 hover:text-charcoal focus-visible:bg-white/30 focus-visible:text-charcoal focus-visible:outline-none ' +
  'aria-[current=true]:text-charcoal aria-[current=true]:hover:bg-transparent';

/** The pill under the open section's link: from one link to the next, it slides across as the section changes. */
const Current: React.FC = () => (
  <motion.span
    layoutId="nav-current"
    aria-hidden="true"
    className="absolute inset-0 rounded-full bg-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.06),0_3px_10px_-3px_rgba(0,0,0,0.14)]"
    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
  />
);

const SmallName: React.FC<{ onClick: () => void; compact: boolean }> = ({ onClick, compact }) => (
  <motion.button
    type="button"
    onClick={onClick}
    initial={{ width: 0, opacity: 0 }}
    animate={{ width: 'auto', opacity: 1 }}
    exit={{ width: 0, opacity: 0 }}
    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    className="overflow-hidden whitespace-nowrap text-left"
  >
    <span className={`block font-serif leading-none tracking-tight text-charcoal ${compact ? 'pl-2.5 pr-3 text-[17px]' : 'pl-[13px] pr-[14px] text-[19px]'}`}>
      Aditya <span className="text-moss tracking-[-0.02em]">Vishwakarma</span>
    </span>
  </motion.button>
);

/**
 * The site's nav: a frosted pane in the top right corner, wrapping only
 * what's in it, rather than a bar across the page, its top and right edges
 * on the page's margins. The open section's link sits on a pill of its own.
 * On a phone the links fold away behind a menu button. While a piece is open
 * to read, it rises up off the screen — moved, never faded: frosted glass
 * under a fade paints white in Safari.
 */
const Navbar: React.FC<NavbarProps> = ({ items, active, onSelect, showName, onHome, onIntent, margin, compact = false, away = false, className = '' }) => {
  const [open, setOpen] = useState(false);
  const root = React.useRef<HTMLElement>(null);

  // The folded menu closes on a press anywhere else, or Escape.
  useEffect(() => {
    if (!open) return;
    const elsewhere = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', elsewhere);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('pointerdown', elsewhere);
      window.removeEventListener('keydown', key);
    };
  }, [open]);
  useEffect(() => {
    if (!compact || away) setOpen(false);
  }, [compact, away]);

  const select = (id: string) => {
    setOpen(false);
    onIntent?.(id);
    onSelect(id);
  };

  const place = navPlace(margin, compact, useSafeArea());
  // `translate` rather than `transform`, which the nav's arrival holds at the end of its animation.
  const style: React.CSSProperties = {
    ...place,
    translate: away ? `0 calc(-100% - ${place.top + 32}px)` : '0 0',
    transition: 'translate 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
  };

  if (!compact) {
    return (
      <nav ref={root} aria-label="Sections" inert={away} className={`fixed z-50 ${className}`} style={style}>
        <div className="flex items-center rounded-full" style={{ ...glassStyle, padding: INSET }}>
          <AnimatePresence initial={false}>{showName && <SmallName key="name" onClick={onHome} compact={false} />}</AnimatePresence>
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  onPointerEnter={() => onIntent?.(item.id)}
                  onFocus={() => onIntent?.(item.id)}
                  aria-current={active === item.id ? 'true' : undefined}
                  className={`${LINK} text-[14px] leading-[1.2]`}
                  style={{ padding: `${LINK_PAD.y}px ${LINK_PAD.x}px` }}
                >
                  {active === item.id && <Current />}
                  <span className="relative">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav ref={root} aria-label="Sections" inert={away} className={`fixed z-50 flex flex-col items-end ${className}`} style={style}>
      <div className="flex items-center rounded-full p-[3px]" style={glassStyle}>
        <AnimatePresence initial={false}>{showName && <SmallName key="name" onClick={onHome} compact />}</AnimatePresence>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? 'Close menu' : 'Menu'}
          className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal"
        >
          {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          /* Scale only: glass with a backdrop blur mustn't sit under a fade, or Safari paints it white until the fade lands. */
          <motion.ul
            id="nav-menu"
            initial={{ scale: 0.94, y: -6 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: -6, visibility: 'hidden' }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="mt-2 flex min-w-[176px] origin-top-right flex-col items-end gap-0.5 rounded-[22px] p-[6px]"
            style={glassStyle}
          >
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => select(item.id)}
                  aria-current={active === item.id ? 'true' : undefined}
                  className={`${LINK} px-4 py-2.5 text-[17px] leading-[1.2]`}
                >
                  {active === item.id && <Current />}
                  <span className="relative">{item.label}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
