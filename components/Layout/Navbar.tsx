import React, { useEffect, useState } from 'react';
import { motion as motionComponent, AnimatePresence } from 'framer-motion';
import { CARD_SHADOW, GLASS_BACKDROP, GLASS_EDGE, PILL_TINT, pillGlassStyle } from '../UI/glass';
import Squircle from '../UI/Squircle';
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

/** Between the nav and what opens below it: a section's pane, or a phone's menu, which so lies exactly over a pane's top. */
export const navGap = (compact: boolean) => (compact ? 12 : 16);

/** A link's text, and a faint pill under it while it's pointed at. On its white pill, it's charcoal in either look. */
const LINK =
  'relative block rounded-full font-sans font-medium text-[rgba(51,51,51,0.78)] transition-colors duration-300 dark:text-paper ' +
  'hover:bg-wash/30 hover:text-charcoal focus-visible:bg-wash/30 focus-visible:text-charcoal focus-visible:outline-none ' +
  'aria-[current=true]:text-ink aria-[current=true]:hover:bg-transparent dark:aria-[current=true]:text-ink';

/** A phone's menu button: its word on a pill, as wide for Close as for Menu. */
const MENU_WORD = 72;
/** How wide a phone's nav is at home, its button alone in 3px of glass: the controls stop short of it. */
export const navMenuWidth = MENU_WORD + 6;
/**
 * A phone's open menu has a section pane's top and right edges and its corners, 30px smoothed 100% (the `radius`
 * HomeHero gives a phone's pane). Held upright, a phone's menu is as wide as its pane too; on anything wider (a phone
 * on its side, a narrow window) it keeps to 360px, a menu's width, rather than a pane's. It's only as tall as its rows.
 */
const MENU_CORNER = 30;
const MENU_PAD = 8;

/** A link in a phone's menu: its name in Newsreader, centred in a row as wide as the glass and 56px tall, its corners the glass's less the padding. */
const MENU_LINK =
  'relative flex h-14 w-full items-center justify-center font-serif text-[28px] leading-none tracking-[-0.01em] text-charcoal/85 ' +
  'transition-colors duration-300 dark:text-paper hover:bg-wash/30 hover:text-charcoal focus-visible:bg-wash/30 focus-visible:text-charcoal ' +
  'focus-visible:outline-none active:bg-wash/40 aria-[current=true]:text-ink aria-[current=true]:hover:bg-transparent dark:aria-[current=true]:text-ink';

/** The pill under the open section's link: from one link to the next, it slides across as the section changes. White in either look. */
const Current: React.FC = () => (
  <motion.span
    layoutId="nav-current"
    aria-hidden="true"
    className="absolute inset-0 rounded-[inherit] bg-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.06),0_3px_10px_-3px_rgba(0,0,0,0.14)]"
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

  const safe = useSafeArea();
  const place = navPlace(margin, compact, safe);
  // `translate` rather than `transform`, which the nav's arrival holds at the end of its animation.
  const style: React.CSSProperties = {
    ...place,
    translate: away ? `0 calc(-100% - ${place.top + 32}px)` : '0 0',
    transition: 'translate 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
  };

  if (!compact) {
    return (
      <nav ref={root} aria-label="Sections" inert={away} className={`fixed z-50 ${className}`} style={style}>
        <div className="flex items-center rounded-full" style={{ ...pillGlassStyle, padding: INSET }}>
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

  // Open, the menu reaches across to the nav's margin on the far side, as a pane does.
  const menuFill = `calc(100vw - ${place.right + navPlace(margin, true).right + safe.left}px)`;

  return (
    <>
      {/* The scene dims behind the open menu; a press on it, as anywhere outside the nav, closes the menu. */}
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
      <nav ref={root} aria-label="Sections" inert={away} className={`fixed z-50 flex flex-col items-end ${className}`} style={style}>
        <div className="flex items-center rounded-full p-[3px]" style={pillGlassStyle}>
          <AnimatePresence initial={false}>{showName && <SmallName key="name" onClick={onHome} compact />}</AnimatePresence>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-menu"
            className="flex h-10 items-center justify-center rounded-full text-[16px] font-medium text-charcoal transition-colors duration-300 active:bg-wash/40 dark:text-paper"
            style={{ width: MENU_WORD }}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
        <AnimatePresence>
          {open && (
            /* Scale only: glass with a backdrop blur mustn't sit under a fade, or Safari paints it white until the fade lands. */
            <motion.div
              initial={{ scale: 0.94, y: -6 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: -6, visibility: 'hidden' }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              // As wide as the pane on an upright phone (under 480px); 360px on anything wider.
              className="w-[var(--menu-fill)] origin-top-right min-[480px]:w-[360px]"
              style={{ '--menu-fill': menuFill, marginTop: navGap(true) } as React.CSSProperties}
            >
              {/* Cut as the pane is, a squircle at full smoothing, its shadow outside the cut. */}
              <Squircle
                as="ul"
                id="nav-menu"
                radius={MENU_CORNER}
                smoothing={1}
                shadow={CARD_SHADOW}
                className="flex flex-col"
                style={{ background: PILL_TINT, backdropFilter: GLASS_BACKDROP, WebkitBackdropFilter: GLASS_BACKDROP, boxShadow: GLASS_EDGE, padding: MENU_PAD }}
              >
                {/* Each row fills the glass's width, so a tap anywhere on it lands; its corners are the glass's less the padding, smoothed as the glass's are. */}
                {items.map((item) => (
                  <Squircle as="li" key={item.id} radius={MENU_CORNER - MENU_PAD} smoothing={1}>
                    <button type="button" onClick={() => select(item.id)} aria-current={active === item.id ? 'true' : undefined} className={MENU_LINK}>
                      {active === item.id && <Current />}
                      <span className="relative">{item.label}</span>
                    </button>
                  </Squircle>
                ))}
              </Squircle>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
