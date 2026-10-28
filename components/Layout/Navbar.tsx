import React, { useEffect, useState } from 'react';
import { motion as motionComponent, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { glassStyle } from '../UI/glass';
import { useMenuSide } from '../Home/menuSide';
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

/** A link's text, and a faint pill under it while it's pointed at. On its white pill, it's charcoal in either look. */
const LINK =
  'relative block rounded-full font-sans font-medium text-[rgba(51,51,51,0.78)] transition-colors duration-300 dark:text-paper ' +
  'hover:bg-wash/30 hover:text-charcoal focus-visible:bg-wash/30 focus-visible:text-charcoal focus-visible:outline-none ' +
  'aria-[current=true]:text-ink aria-[current=true]:hover:bg-transparent dark:aria-[current=true]:text-ink';

/** The pill under the open section's link: from one link to the next, it slides across as the section changes. White in either look. */
const Current: React.FC = () => (
  <motion.span
    layoutId="nav-current"
    aria-hidden="true"
    className="absolute inset-0 rounded-full bg-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.06),0_3px_10px_-3px_rgba(0,0,0,0.14)]"
    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
  />
);

/** A folded menu closes on a press anywhere outside it, or Escape. */
const useDismiss = (open: boolean, setOpen: (open: boolean) => void, root: React.RefObject<HTMLElement | null>) => {
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
  }, [open, setOpen, root]);
};

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
    <span className={`block font-serif leading-none tracking-tight text-charcoal dark:text-paper ${compact ? 'pl-2.5 pr-3 text-[17px]' : 'pl-[13px] pr-[14px] text-[19px]'}`}>
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
  useDismiss(open, setOpen, root);
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
          className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal dark:text-paper"
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
            className="mt-2 flex w-[208px] origin-top-right flex-col rounded-[32px] p-[6px]"
            style={glassStyle}
          >
            {/* Each row fills the glass's width and is 52px tall, so a tap anywhere on it lands; its corners are the glass's less the padding. */}
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => select(item.id)}
                  aria-current={active === item.id ? 'true' : undefined}
                  className={`${LINK} flex h-[52px] w-full items-center justify-end px-[22px] text-[18px] leading-[1.2] active:bg-wash/40`}
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

/** The spine: a 44 × 104 button in 3px of glass. */
const SPINE = { width: 50, height: 110 };
/** Between the spine and its list. */
const SPINE_GAP = 8;
/** Each of the list's rows, and the glass round them: the rows' 24px corners in 8px make the glass's 32px. */
const SPINE_ROW = 56;
const SPINE_PAD = 8;

/** A link in the spine's list: its name in Newsreader, centred in a row as wide as the glass. */
const SPINE_LINK =
  'flex h-14 w-full items-center justify-center rounded-[24px] font-serif text-[28px] leading-none tracking-[-0.01em] text-charcoal/85 dark:text-paper ' +
  'transition-colors duration-300 hover:bg-wash/30 hover:text-charcoal focus-visible:bg-wash/30 focus-visible:text-charcoal focus-visible:outline-none active:bg-wash/40';

interface MenuSpineProps {
  items: NavItem[];
  onSelect: (id: string) => void;
  onIntent?: (id: string) => void;
  /** The type's margin: the spine stands on it. */
  margin: number;
  /** From the bottom of the screen to the spine's foot: just above the name and the title. */
  foot: number;
  /** The screen's height, to keep the open list on it. */
  height: number;
  /** Off its side of the screen, out of the way: while a pane is open. */
  away: boolean;
  className?: string;
}

/**
 * A phone's menu at home: a pill set like a book's spine, standing on the
 * type's margin just above the title, on whichever side the visitor has chosen
 * (`menuSide.ts`). Its word runs down it on the right and up it on the left,
 * turned 90° and 270°, so the letters' tops face the nearer edge either way.
 * A tap opens the list beside it, centred on it, and the spine reads Close in
 * the same place. While a pane is open it moves off its side of the screen,
 * and the nav at the top takes over.
 */
export const MenuSpine: React.FC<MenuSpineProps> = ({ items, onSelect, onIntent, margin, foot, height, away, className = '' }) => {
  const [open, setOpen] = useState(false);
  const root = React.useRef<HTMLElement>(null);
  useDismiss(open, setOpen, root);
  useEffect(() => {
    if (away) setOpen(false);
  }, [away]);

  const left = useMenuSide() === 'left';
  const safe = useSafeArea();
  const edge = margin + (left ? safe.left : safe.right);
  // The list runs from the pane's edge to 8px short of the spine, centred on the spine as far as the screen allows.
  const inset = navPlace(margin, true).right;
  const listEdge = edge + SPINE.width + SPINE_GAP;
  const listFar = inset + (left ? safe.right : safe.left);
  const tall = items.length * SPINE_ROW + 2 * SPINE_PAD;
  const middle = height - foot - SPINE.height / 2;
  const top = Math.max(inset + safe.top, Math.min(middle - tall / 2, height - inset - safe.bottom - tall));

  const select = (id: string) => {
    setOpen(false);
    onIntent?.(id);
    onSelect(id);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="dim"
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-[rgba(24,36,48,0.14)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
      <nav ref={root} aria-label="Sections" inert={away}>
        {/* `translate` to move it away, as the nav does: its arrival holds `transform`. */}
        <div
          className={`fixed z-50 flex rounded-full p-[3px] ${className}`}
          style={{
            ...glassStyle,
            bottom: foot,
            left: left ? edge : undefined,
            right: left ? undefined : edge,
            translate: away ? `calc(${left ? -1 : 1} * (100% + ${edge}px)) 0` : '0 0',
            transition: 'translate 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="spine-menu"
            aria-label={open ? 'Close menu' : 'Menu'}
            className="flex h-[104px] w-11 items-center justify-center rounded-full text-charcoal transition-colors dark:text-paper duration-300 active:bg-wash/40"
          >
            <span aria-hidden="true" className={`flex items-center gap-2 text-[16px] font-medium leading-none [writing-mode:vertical-rl] ${left ? 'rotate-180' : ''}`}>
              {open ? <X size={16} strokeWidth={1.9} className="rotate-90" /> : <Menu size={16} strokeWidth={1.9} className="rotate-90" />}
              {open ? 'Close' : 'Menu'}
            </span>
          </button>
        </div>
        <AnimatePresence>
          {open && (
            /* Scale only, as the nav's menu: glass with a backdrop blur mustn't sit under a fade. */
            <motion.ul
              id="spine-menu"
              initial={{ scale: 0.94, x: left ? -8 : 8 }}
              animate={{ scale: 1, x: 0 }}
              exit={{ scale: 0.94, x: left ? -8 : 8, visibility: 'hidden' }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className={`fixed z-50 flex flex-col rounded-[32px] ${left ? 'origin-left' : 'origin-right'}`}
              style={{ ...glassStyle, top, padding: SPINE_PAD, left: left ? listEdge : listFar, right: left ? listFar : listEdge }}
            >
              {items.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => select(item.id)} className={SPINE_LINK}>
                    {item.label}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
