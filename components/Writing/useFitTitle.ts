import { useLayoutEffect, type RefObject } from 'react';
import { SPLIT_QUERY } from '../../constants';

/**
 * A piece's title, as large as it can be: split in two, 184px if every word and the column's height allow; stacked,
 * 120px. A word too long for a line breaks at its soft hyphen, but no word takes more than two lines, and a word with
 * no soft hyphen is kept to one. Split in two there's no least size beyond what can be measured: the column never
 * scrolls, so the title is what gives.
 */
const SIZES = { split: { least: 12, most: 184 }, stacked: { least: 36, most: 120 } };
/** The most lines one word may break over. */
const WORD_LINES = 2;
/** Stacked, the title and the line under it take no more than this share of the glass's height. */
const STACKED_SHARE = 0.5;

interface Refs {
  /** The title and its line under it, together: given `--title`, the title's size, which the line takes its own from. */
  block: RefObject<HTMLElement | null>;
  /** The title, each word in a `data-word` span, so the lines each word breaks over can be counted. */
  heading: RefObject<HTMLElement | null>;
  /** Split in two, the room the block has: what the column has left over it, between the head's rule and the details. */
  room: RefObject<HTMLElement | null>;
  /** The column: measured again only as its own size changes. */
  column: RefObject<HTMLElement | null>;
}

/**
 * Sizes a piece's title: the largest at which no word breaks over more than two lines, nor runs past the column
 * where it can't be hyphenated, and the title and the line under it fit their room — split in two, all the column
 * has left, so it never scrolls; stacked, half the glass's height.
 *
 * Worked out before the card is first drawn — it's made at the width it will have, while the glass is still on its
 * way — and again only as the column changes size or the fonts land, never as the glass moves.
 */
export const useFitTitle = ({ block, heading, room, column }: Refs, deps: unknown[]) => {
  useLayoutEffect(() => {
    const fit = () => {
      const b = block.current;
      const h = heading.current;
      const r = room.current;
      if (!b || !h || !r) return;
      const split = window.matchMedia(SPLIT_QUERY).matches;
      const { least, most } = split ? SIZES.split : SIZES.stacked;
      const set = (px: number) => b.style.setProperty('--title', `${px}px`);

      const words = Array.from(h.querySelectorAll<HTMLElement>('[data-word]'));
      const glass = parseFloat(getComputedStyle(b).getPropertyValue('--pane-h')) || window.innerHeight;
      // The block's room. Split in two, inside the room's own padding (what's above the title, under the head's rule);
      // the room's size is the column's, less all else in it, so it's the same whatever size the title is.
      const inset = getComputedStyle(r);
      const roomFor = split ? r.clientHeight - parseFloat(inset.paddingTop) - parseFloat(inset.paddingBottom) : glass * STACKED_SHARE;
      // The lines a word lies on: its pieces, gathered by the line each starts on. A word comes in pieces wherever it
      // has a soft hyphen, and its hyphen is a piece of its own, broken there or not.
      const linesOf = (w: HTMLElement) => {
        const tops: number[] = [];
        for (const r of Array.from(w.getClientRects())) if (r.width > 0 && !tops.some((t) => Math.abs(t - r.top) < 2)) tops.push(r.top);
        return tops.length;
      };
      // Untransformed sizes for what's measured (the card may be tipped as it comes in); a word's lines are counted.
      const fits = (px: number) => {
        set(px);
        if (h.scrollWidth > h.clientWidth + 0.5) return false;
        if (words.some((w) => linesOf(w) > WORD_LINES)) return false;
        return b.offsetHeight <= roomFor;
      };

      let size = least;
      if (fits(most)) size = most;
      else if (fits(least)) {
        let lo = least;
        let hi = most;
        while (hi - lo > 1) {
          const mid = (lo + hi) >> 1;
          if (fits(mid)) lo = mid;
          else hi = mid;
        }
        size = lo;
      }
      set(size);
    };

    // Measured again only for a change that could move it: the column's width, its height split in two (stacked,
    // its height is the title's own), and the glass's height.
    let last = '';
    const check = () => {
      const c = column.current;
      if (!c) return;
      const split = window.matchMedia(SPLIT_QUERY).matches;
      const key = `${split}:${c.clientWidth}:${split ? c.clientHeight : window.innerHeight}`;
      if (key === last) return;
      last = key;
      fit();
    };
    check();

    const ro = new ResizeObserver(check);
    if (column.current) ro.observe(column.current);
    window.addEventListener('resize', check);
    const fonts = document.fonts;
    const refit = () => fit();
    fonts?.addEventListener?.('loadingdone', refit);
    let alive = true;
    if (fonts && fonts.status !== 'loaded') fonts.ready.then(() => alive && fit());
    return () => {
      alive = false;
      ro.disconnect();
      window.removeEventListener('resize', check);
      fonts?.removeEventListener?.('loadingdone', refit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
