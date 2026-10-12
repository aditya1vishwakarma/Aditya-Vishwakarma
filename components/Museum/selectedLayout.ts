import { SELECT } from './museumConfig';

/**
 * Where a selected piece comes to rest on screen, in CSS px.
 *
 * The 3D pane flies to exactly this rectangle, and the card then takes over
 * from it — so both read it from here, and the hand-off can never drift.
 *
 *   side     (landscape) the photo on the left, 40% of the screen wide, with
 *            the text in a column beside it.
 *   stacked  (portrait)  the photo near the top at nearly the card's width,
 *            with the text underneath.
 */

export type CardLayout = 'side' | 'stacked';

export interface SelectedView {
  width: number;
  height: number;
  topPadPx: number;
  bottomPadPx: number;
  portrait: boolean;
}

/** Gap between the photo and the card's edge, as in the ring's popup card. */
export const CARD_PAD = 12;

/** Stacked card: its margin to the screen edges, and widest it gets. */
const STACK_MARGIN = (width: number) => (width < 600 ? 16 : 40);
const STACK_MAX_W = 640;
/** Room expected for the text under the photo; the card measures the real thing. */
export const STACK_TEXT_GUESS = 210;
/** Clear of the status bar and notch at the top, and the home bar at the bottom. */
export const STACK_SAFE_TOP = 56;
export const STACK_SAFE_BOTTOM = 40;

export const cardLayoutFor = (view: SelectedView): CardLayout => (view.portrait ? 'stacked' : 'side');

/** The stacked card's outer width. */
export const stackedCardWidth = (view: SelectedView) =>
  Math.min(view.width - STACK_MARGIN(view.width) * 2, STACK_MAX_W);

export function selectedRect(view: SelectedView, aspect: number) {
  const { width, height } = view;

  if (cardLayoutFor(view) === 'side') {
    const w = Math.min(SELECT.widthFrac * width, SELECT.maxHeightFrac * height * aspect);
    const h = w / aspect;
    const cx = SELECT.centerX * width;
    const cy = height / 2 - (view.bottomPadPx - view.topPadPx) / 2;
    return { left: cx - w / 2, top: cy - h / 2, width: w, height: h };
  }

  // Stacked: as wide as the card allows, but never more than about half the
  // screen tall, so the text always has room beneath it.
  const cardW = stackedCardWidth(view);
  const maxH = height * (width < 600 ? 0.46 : 0.5);
  const w = Math.min(cardW - CARD_PAD * 2, maxH * aspect);
  const h = w / aspect;
  const group = h + CARD_PAD * 2 + STACK_TEXT_GUESS;
  const top = Math.max(STACK_SAFE_TOP, (height - group) / 2) + CARD_PAD;
  return { left: (width - w) / 2, top, width: w, height: h };
}
