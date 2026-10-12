import React, { useEffect, useRef } from 'react';
import { invalidate } from '@react-three/fiber';
import { EASE, type MuseumRig } from './museumView';
import type { MuseumTheme } from './museumTheme';

interface Props {
  rig: React.MutableRefObject<MuseumRig>;
  /** Length of shelf the slide covers, so the thumb can show how much of it is in view. */
  boardLength: number;
  disabled?: boolean;
  theme: MuseumTheme;
  /** Phone-sized: a slimmer, shorter rail. */
  compact?: boolean;
}

/** One arrow-key step: a little under one shelf section. */
const STEP = 0.9;

/**
 * A hairline track with a thumb sized to the part of the board on screen —
 * a scrollbar, pared back to a rail. Reads the rig every frame and writes
 * straight to the DOM, so sliding never re-renders React.
 */
const MuseumSlider: React.FC<Props> = ({ rig, boardLength, disabled, theme, compact = false }) => {
  const track = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    let raf = 0;
    let shown = '';
    const tick = () => {
      const r = rig.current;
      const span = r.maxX - r.minX;
      const size = Math.min(1, Math.max(0.1, r.view.visibleW / Math.max(boardLength, 0.01)));
      const frac = span > 1e-3 ? (r.x - r.minX) / span : 0.5;
      // Only touch the DOM when the thumb has actually moved.
      const key = `${size.toFixed(4)}:${frac.toFixed(4)}`;
      if (key !== shown && thumb.current) {
        shown = key;
        thumb.current.style.width = `${size * 100}%`;
        thumb.current.style.left = `${frac * (1 - size) * 100}%`;
        track.current?.setAttribute('aria-valuenow', String(Math.round(frac * 100)));
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [rig, boardLength]);

  const seek = (clientX: number, ease: number) => {
    const el = track.current;
    if (!el) return;
    const r = rig.current;
    r.ease = ease;
    const rect = el.getBoundingClientRect();
    const size = Math.min(1, Math.max(0.1, r.view.visibleW / boardLength));
    // Centre the thumb under the pointer.
    const frac = (clientX - rect.left - (size * rect.width) / 2) / Math.max(1, rect.width * (1 - size));
    r.targetX = r.minX + Math.min(1, Math.max(0, frac)) * (r.maxX - r.minX);
    invalidate();
  };

  const step = (dir: number) => {
    const r = rig.current;
    r.ease = EASE.seek;
    r.targetX = Math.min(r.maxX, Math.max(r.minX, r.targetX + dir * STEP));
    invalidate();
  };

  return (
    <div className={`flex items-center transition-opacity duration-500 ${disabled ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label="Move along the shelf"
        aria-valuemin={0}
        aria-valuemax={100}
        className={`group relative cursor-pointer touch-none outline-none ${compact ? 'h-7 w-[min(46vw,240px)]' : 'h-8 w-[clamp(200px,30vw,440px)]'}`}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          // A click glides there; dragging the thumb follows the pointer.
          seek(e.clientX, EASE.seek);
        }}
        onPointerMove={(e) => dragging.current && seek(e.clientX, EASE.wheel)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') step(-1);
          else if (e.key === 'ArrowRight') step(1);
          else return;
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className={`absolute inset-x-0 top-1/2 h-px -translate-y-1/2 transition-colors duration-500 ${theme.rail}`} />
        <div
          ref={thumb}
          className={`absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full transition-[height,background-color] duration-500 group-hover:h-[4px] ${theme.thumb}`}
        />
      </div>
    </div>
  );
};

export default MuseumSlider;
