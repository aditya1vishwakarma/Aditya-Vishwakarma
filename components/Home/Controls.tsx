import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeftRight, Leaf, Moon, Sun, Wind } from 'lucide-react';
// Music is off for now, its switch below with it.
// import { Volume2, VolumeX } from 'lucide-react';
import { navHeight, navPlace } from '../Layout/Navbar';
import { glassStyle } from '../UI/glass';
import { swapMenuSide } from './menuSide';
// import { toggleMuted, useMuted } from './music';
import { useSafeArea } from './safeArea';
import { toggleTheme, useTheme } from './theme';
import { useTouch } from './touch';

const ROW = 'flex w-full items-center gap-3 rounded-full px-3 py-1.5 text-left';
const ACT = `${ROW} italic transition-colors duration-300 hover:bg-wash/35 focus-visible:bg-wash/35 focus-visible:outline-none`;
/**
 * On a touch screen, each is a row of its own on a white of its own, its whole
 * width the button: plainly something to tap, and 44px tall, the least a
 * finger wants. Its corners are the pane's 23px less the 6px round it.
 */
const TAP =
  'flex h-11 w-full items-center gap-2.5 rounded-[17px] bg-wash/40 px-3 text-left text-[14px] text-charcoal/80 dark:text-paper ' +
  'transition-colors duration-300 active:bg-wash/70 focus-visible:bg-wash/60 focus-visible:outline-none';
/** Open, wide enough for the longest of them. */
const OPEN = { keys: 208, touch: 224 };

/**
 * How it opens. With a pointer that hovers, on pointing at it or tabbing to
 * it; on a touch screen, on a tap, and it stays open until a tap elsewhere —
 * there's no hover to leave, and a tapped button there may or may not keep
 * the focus.
 */
const OPENS = {
  keys: {
    pane: 'hover:w-[var(--open)] focus-within:w-[var(--open)]',
    rows: 'group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]',
    list: 'group-hover:opacity-100 group-focus-within:opacity-100',
  },
  touch: {
    pane: 'data-[open]:w-[var(--open)]',
    rows: 'group-data-[open]:grid-rows-[1fr]',
    list: 'group-data-[open]:opacity-100',
  },
};

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border border-charcoal/15 bg-wash/45 text-[11px] font-medium not-italic text-charcoal/70 dark:text-paper">
    {children}
  </span>
);

/** In a key's place, and the music's: what the row does, drawn. */
const Mark: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center text-charcoal/70 dark:text-paper" aria-hidden="true">
    {children}
  </span>
);

/**
 * The page's controls, on the nav's glass in the one corner the page leaves
 * clear: level with the nav, on the same margins, as tall. Closed, it's just
 * wide enough to say "controls"; opened, it opens out and down to them, one
 * under another — a gust, the season, and the music. With a keyboard, the
 * gust and the season have keys, shown beside them; on a touch screen, a tap
 * on the tree sends the gust. The music has no key: it only plays when it's
 * turned on here.
 */
const Controls: React.FC<{ margin: number; compact: boolean; onGust: () => void; onSeason: () => void }> = ({ margin, compact, onGust, onSeason }) => {
  // const muted = useMuted();
  const touch = useTouch();
  const dark = useTheme() === 'dark';
  const safe = useSafeArea();
  // The nav's distance in from the right, taken in from the left.
  const inset = navPlace(margin, compact).right;
  const top = navPlace(margin, compact, safe).top;
  const left = inset + safe.left;
  const row = navHeight(compact);
  const opens = touch ? OPENS.touch : OPENS.keys;
  // At home on a phone, the menu is down by the title, so the top is clear all the way across.
  const open = touch ? `min(${OPEN.touch}px, calc(100vw - ${left + inset + safe.right}px))` : `${OPEN.keys}px`;

  // Closed, as wide as its word: measured, so the width has something to open from.
  const label = useRef<HTMLButtonElement>(null);
  const [closed, setClosed] = useState(90);
  useLayoutEffect(() => {
    const measure = () => label.current && setClosed(Math.ceil(label.current.offsetWidth));
    measure();
    document.fonts?.ready.then(measure);
  }, []);

  // On a touch screen, a tap opens it; a tap anywhere else, or Escape, closes it.
  const root = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!shown) return;
    const elsewhere = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setShown(false);
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setShown(false);
    window.addEventListener('pointerdown', elsewhere);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('pointerdown', elsewhere);
      window.removeEventListener('keydown', key);
    };
  }, [shown]);
  useEffect(() => {
    if (!touch) setShown(false);
  }, [touch]);

  return (
    <div
      ref={root}
      role="group"
      aria-label="Controls"
      data-open={touch && shown ? '' : undefined}
      className={`group fixed z-[60] w-[var(--closed)] overflow-hidden font-sans text-[13px] italic text-charcoal/55 dark:text-paper transition-[width] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${opens.pane}`}
      style={{ ...glassStyle, top, left, borderRadius: row / 2, '--closed': `${closed}px`, '--open': open } as React.CSSProperties}
    >
      <button
        ref={label}
        type="button"
        aria-expanded={touch ? shown : undefined}
        onClick={() => touch && setShown((v) => !v)}
        className="flex w-max items-center whitespace-nowrap px-[18px] italic focus-visible:outline-none"
        style={{ height: row }}
      >
        Controls
      </button>
      {/* Opening: its height, from nothing to all of it, and the list fading up — the glass itself never fades. */}
      <div className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${opens.rows}`}>
        <div className="min-h-0 overflow-hidden">
          <ul className={`flex w-[var(--open)] flex-col px-1.5 opacity-0 transition-opacity duration-300 ${touch ? 'gap-1 pb-1.5' : 'gap-0.5 pb-2'} ${opens.list}`}>
            {touch ? (
              <>
                {/* A line to read, not a button: on a touch screen the gust is the tree's. It lines up with the rows' words. */}
                <li className="flex h-9 items-center gap-2.5 px-3 text-[14px] text-charcoal/65 dark:text-paper/70">
                  <Mark>
                    <Wind size={15} strokeWidth={1.75} />
                  </Mark>
                  Tap the tree for a breeze
                </li>
                <li>
                  <button type="button" onClick={onSeason} className={TAP}>
                    <Mark>
                      <Leaf size={15} strokeWidth={1.75} />
                    </Mark>
                    Change Seasons
                  </button>
                </li>
                <li>
                  <button type="button" onClick={toggleTheme} className={TAP}>
                    <Mark>{dark ? <Sun size={15} strokeWidth={1.75} /> : <Moon size={15} strokeWidth={1.75} />}</Mark>
                    {dark ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </li>
                {/* The menu's spine is a phone's alone. */}
                {compact && (
                  <li>
                    <button type="button" onClick={swapMenuSide} className={TAP}>
                      <Mark>
                        <ArrowLeftRight size={15} strokeWidth={1.75} />
                      </Mark>
                      Swap Menu Side
                    </button>
                  </li>
                )}
              </>
            ) : (
              <>
                <li>
                  <button type="button" onClick={onGust} className={ACT}>
                    <Key>G</Key> Gust of Wind
                  </button>
                </li>
                <li>
                  <button type="button" onClick={onSeason} className={ACT}>
                    <Key>S</Key> Change Seasons
                  </button>
                </li>
                <li>
                  <button type="button" onClick={toggleTheme} className={ACT}>
                    <Mark>{dark ? <Sun size={15} strokeWidth={1.75} /> : <Moon size={15} strokeWidth={1.75} />}</Mark>
                    {dark ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </li>
                {/* A narrow window has the phone's layout, and its spine, too. */}
                {compact && (
                  <li>
                    <button type="button" onClick={swapMenuSide} className={ACT}>
                      <Mark>
                        <ArrowLeftRight size={15} strokeWidth={1.75} />
                      </Mark>
                      Swap Menu Side
                    </button>
                  </li>
                )}
              </>
            )}
            {/* Music is off for now.
            <li>
              <button type="button" onClick={toggleMuted} aria-pressed={!muted} className={ACT}>
                <Mark>{muted ? <VolumeX size={15} strokeWidth={1.75} /> : <Volume2 size={15} strokeWidth={1.75} />}</Mark>
                Music {muted ? 'muted' : 'on'}
              </button>
            </li> */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Controls;
