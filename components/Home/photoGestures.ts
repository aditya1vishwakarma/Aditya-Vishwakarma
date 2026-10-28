import { useEffect } from 'react';

/**
 * A photo, handled by touch: swiped across to the next one, pinched or
 * double-tapped to zoom, and dragged about while it's zoomed. All of it moves
 * the photo itself — a transform set straight on it, frame by frame, with no
 * render in between — and lets it go with a short glide. A mouse is left
 * alone: a computer has its arrows and keys.
 */

/** The most a photo is pinched up to, and where a double tap takes it. */
const MOST = 4;
const DOUBLE_TAP_ZOOM = 2.5;
/** A swipe to the next photo: this far across, or this fast (px a millisecond), and more across than down. */
const SWIPE = { distance: 56, speed: 0.4 };
/** A tap: lifted this soon and moved no further than this. A second this soon after, this near, makes a double tap. */
const TAP = { ms: 260, slop: 10 };
const DOUBLE = { ms: 320, slop: 32 };
/** How far a photo that arrives by a swipe slides in from, in px. */
const ARRIVE = 44;
const GLIDE = 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)';
/** The photo's own fade up, kept through every glide. */
const FADE = 'opacity 0.45s ease';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The way the last photo was swiped, for the next to come in from the other side; 0 for any other way there. */
let swiped: 1 | -1 | 0 = 0;

export const usePhotoGestures = (
  on: boolean,
  stage: React.RefObject<HTMLElement | null>,
  photo: React.RefObject<HTMLElement | null>,
  step: (by: 1 | -1) => void,
) => {
  useEffect(() => {
    const el = stage.current;
    if (!on || !el) return;

    // The photo's zoom, and how far it's moved from the middle of the stage.
    let scale = 1;
    let x = 0;
    let y = 0;
    const show = (glide: boolean) => {
      const p = photo.current;
      if (!p) return;
      p.style.transition = glide ? `${GLIDE}, ${FADE}` : FADE;
      p.style.transform = scale === 1 && x === 0 && y === 0 ? '' : `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      el.toggleAttribute('data-zoomed', scale > 1);
    };
    // Zoomed, it's moved only so far as still covers what it covered: no gap opens at an edge.
    const keepIn = () => {
      const p = photo.current;
      if (!p) return;
      const room = el.getBoundingClientRect();
      const across = Math.max(0, (p.offsetWidth * scale - room.width) / 2);
      const down = Math.max(0, (p.offsetHeight * scale - room.height) / 2);
      x = clamp(x, -across, across);
      y = clamp(y, -down, down);
    };
    /** A point on the page, from the stage's middle — where the photo's middle is, unmoved. */
    const fromMiddle = (px: number, py: number) => {
      const room = el.getBoundingClientRect();
      return { x: px - (room.left + room.width / 2), y: py - (room.top + room.height / 2) };
    };

    // Come in from the side it was swiped toward: the next from the right, the last from the left.
    if (swiped && photo.current) {
      x = swiped * ARRIVE;
      show(false);
      x = 0;
      requestAnimationFrame(() => requestAnimationFrame(() => show(true)));
    }
    swiped = 0;

    const touches = new Map<number, { x: number; y: number }>();
    // The gesture so far: where it began, the photo as it was then, and whether it's been a pinch or moved at all.
    let from: { x: number; y: number; at: number; scale: number; px: number; py: number; gap: number; mid: { x: number; y: number } } | null = null;
    let pinched = false;
    let moved = false;
    // Which way a drag at rest went first: only one across moves the photo toward the next.
    let across: boolean | null = null;
    let tapped = { at: -Infinity, x: 0, y: 0 };

    const begin = (at: number) => {
      const [a, b] = [...touches.values()];
      const mid = b ? fromMiddle((a.x + b.x) / 2, (a.y + b.y) / 2) : fromMiddle(a.x, a.y);
      from = { x: a.x, y: a.y, at, scale, px: x, py: y, gap: b ? Math.hypot(a.x - b.x, a.y - b.y) : 0, mid };
      show(false);
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      el.setPointerCapture?.(e.pointerId);
      if (touches.size === 0) {
        pinched = false;
        moved = false;
        across = null;
      }
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size > 1) pinched = true;
      begin(e.timeStamp);
    };

    const move = (e: PointerEvent) => {
      if (!touches.has(e.pointerId) || !from) return;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...touches.values()];
      if (b && from.gap > 0) {
        // Pinched: the point of the photo first between the fingers stays between them.
        const mid = fromMiddle((a.x + b.x) / 2, (a.y + b.y) / 2);
        const next = clamp((from.scale * Math.hypot(a.x - b.x, a.y - b.y)) / from.gap, 0.8, MOST * 1.15);
        x = mid.x - ((from.mid.x - from.px) * next) / from.scale;
        y = mid.y - ((from.mid.y - from.py) * next) / from.scale;
        scale = next;
        moved = true;
        show(false);
        return;
      }
      const dx = e.clientX - from.x;
      const dy = e.clientY - from.y;
      if (Math.hypot(dx, dy) > TAP.slop) {
        moved = true;
        across ??= Math.abs(dx) > Math.abs(dy);
      }
      if (from.scale > 1) {
        // Zoomed: dragged about.
        x = from.px + dx;
        y = from.py + dy;
        keepIn();
      } else if (!pinched && across) {
        // At rest: it follows the finger across, toward the next.
        x = dx;
        y = 0;
      }
      show(false);
    };

    const up = (e: PointerEvent) => {
      if (!touches.has(e.pointerId)) return;
      const start = from;
      touches.delete(e.pointerId);
      // A finger lifted from a pinch: carry on with the other from where things are.
      if (touches.size > 0) return begin(e.timeStamp);
      from = null;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const took = e.timeStamp - start.at;

      if (e.type === 'pointerup' && !moved && took < TAP.ms) {
        // Tapped twice: zoom in on where, or back out.
        if (e.timeStamp - tapped.at < DOUBLE.ms && Math.hypot(e.clientX - tapped.x, e.clientY - tapped.y) < DOUBLE.slop) {
          tapped = { at: -Infinity, x: 0, y: 0 };
          if (scale > 1) {
            scale = 1;
            x = y = 0;
          } else {
            const at = fromMiddle(e.clientX, e.clientY);
            scale = DOUBLE_TAP_ZOOM;
            x = at.x * (1 - scale);
            y = at.y * (1 - scale);
            keepIn();
          }
          return show(true);
        }
        tapped = { at: e.timeStamp, x: e.clientX, y: e.clientY };
        return;
      }

      if (pinched || scale !== 1) {
        // Let go of a pinch or a drag: back within what the photo can do.
        scale = clamp(scale, 1, MOST);
        if (scale < 1.02) {
          scale = 1;
          x = y = 0;
        }
        keepIn();
        return show(true);
      }

      // Swiped across, far enough or fast enough: on to the next, the way it was swiped.
      if (e.type === 'pointerup' && across && Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) > SWIPE.distance || Math.abs(dx) / Math.max(took, 1) > SWIPE.speed)) {
        const by = dx < 0 ? 1 : -1;
        x = -by * el.getBoundingClientRect().width * 0.4;
        show(true);
        swiped = by;
        return step(by);
      }
      x = 0;
      show(true);
    };

    // Safari's own pinch, which would zoom the whole page.
    const hold = (e: Event) => e.preventDefault();
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('gesturestart', hold);
    el.addEventListener('gesturechange', hold);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('gesturestart', hold);
      el.removeEventListener('gesturechange', hold);
    };
  }, [on, stage, photo, step]);
};
