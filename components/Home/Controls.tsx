import React, { useLayoutEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { navHeight, navPlace } from '../Layout/Navbar';
import { glassStyle } from '../UI/glass';
import { toggleMuted, useMuted } from './music';

const ROW = 'flex w-full items-center gap-3 rounded-full px-3 py-1.5 text-left';
/** Open, wide enough for the longest of them. */
const OPEN = 208;

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border border-charcoal/15 bg-white/45 text-[11px] font-medium not-italic text-charcoal/70">
    {children}
  </span>
);

/**
 * The page's controls, on the nav's glass in the one corner the page leaves
 * clear: level with the nav, on the same margins, as tall. Closed, it's just
 * wide enough to say "controls"; pointed at or focused, it opens out and down
 * to them, one under another — a gust, the season, and the music. The gust
 * and the season have keys too. The music doesn't: it only plays when it's
 * turned on here.
 */
const Controls: React.FC<{ margin: number; onGust: () => void; onSeason: () => void }> = ({ margin, onGust, onSeason }) => {
  const muted = useMuted();
  const { top, right } = navPlace(margin, false);
  const row = navHeight(false);
  // Closed, as wide as its word: measured, so the width has something to open from.
  const label = useRef<HTMLDivElement>(null);
  const [closed, setClosed] = useState(90);
  useLayoutEffect(() => {
    const measure = () => label.current && setClosed(Math.ceil(label.current.offsetWidth));
    measure();
    document.fonts?.ready.then(measure);
  }, []);
  return (
    <div
      tabIndex={0}
      aria-label="Controls"
      className="group fixed z-[60] w-[var(--closed)] overflow-hidden rounded-[22px] font-sans text-[13px] italic text-charcoal/55 outline-none transition-[width] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:w-[var(--open)] hover:w-[var(--open)]"
      style={{ ...glassStyle, top, left: right, '--closed': `${closed}px`, '--open': `${OPEN}px` } as React.CSSProperties}
    >
      <div ref={label} className="flex w-max items-center whitespace-nowrap px-[18px]" style={{ height: row }}>
        controls
      </div>
      {/* Opening: its height, from nothing to all of it, and the list fading up — the glass itself never fades. */}
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-focus-within:grid-rows-[1fr] group-hover:grid-rows-[1fr]">
        <div className="min-h-0 overflow-hidden">
          <ul className="flex w-[var(--open)] flex-col gap-0.5 px-1.5 pb-2 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
            {[
              { key: 'G', label: 'Gust', act: onGust },
              { key: 'S', label: 'Swap seasons', act: onSeason },
            ].map(({ key, label, act }) => (
              <li key={key}>
                <button type="button" onClick={act} className={`${ROW} italic transition-colors duration-300 hover:bg-white/35 focus-visible:bg-white/35 focus-visible:outline-none`}>
                  <Key>{key}</Key> {label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={toggleMuted}
                aria-pressed={!muted}
                className={`${ROW} italic transition-colors duration-300 hover:bg-white/35 focus-visible:bg-white/35 focus-visible:outline-none`}
              >
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center text-charcoal/70">
                  {muted ? <VolumeX size={15} strokeWidth={1.75} aria-hidden="true" /> : <Volume2 size={15} strokeWidth={1.75} aria-hidden="true" />}
                </span>
                Music {muted ? 'muted' : 'on'}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Controls;
