import { SELECT } from './museumConfig';

/**
 * Where a selected piece comes to rest on screen, and the card around it, in
 * CSS px.
 *
 * The 3D pane flies to exactly the photo's rectangle, and the card then takes
 * over from it — so both read it from here, and the hand-off can never drift.
 *
 *   side     (landscape) the photo on the left, 40% of the screen wide, with
 *            the text in a column beside it.
 *   stacked  (portrait)  the photo on top, the text underneath. The text is
 *            measured first and the photo gets all the height that's left, so
 *            an upright photo fills the card's width instead of floating in
 *            it; one too tall to manage that narrows the card to hug it, so
 *            the glass margin is the same all the way round.
 */

export type CardLayout = 'side' | 'stacked';

export interface SelectedView {
  width: number;
  height: number;
  topPadPx: number;
  bottomPadPx: number;
  portrait: boolean;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CardGeometry {
  stacked: boolean;
  /** The photo — where the 3D pane lands. */
  img: Rect;
  card: Rect;
  /** Height given to the text under the photo (stacked only). */
  textH: number;
}

/** Gap between the photo and the card's edge, as in the ring's popup card. */
export const CARD_PAD = 12;
/** The stacked card's text: padding inside it (the measured block includes it). */
export const STACK_TEXT_PAD = { top: 4, x: 22, bottom: 16 };

/** Side card: kept this far from the right edge, its text column no wider than a comfortable line. */
const SIDE_RIGHT_MARGIN = 0.07;
const SIDE_TEXT_W = 480;

/** Stacked card: its margin to the screen edges, and widest and narrowest it gets. */
const stackMargin = (width: number) => (width < 600 ? 16 : 40);
const STACK_MAX_W = 640;
const STACK_MIN_W = 300;
/** Room assumed for the text before it's been measured. */
const STACK_TEXT_GUESS = 210;
/** Clear of the status bar and notch at the top, and the home bar at the bottom. */
const STACK_SAFE_TOP = 56;
const STACK_SAFE_BOTTOM = 40;
/** However the sums fall, the photo stays between these fractions of the screen's height. */
const STACK_PHOTO_MIN_H = 0.34;
const STACK_PHOTO_MAX_H = 0.64;

export const cardLayoutFor = (view: SelectedView): CardLayout => (view.portrait ? 'stacked' : 'side');

function sideGeometry(view: SelectedView, aspect: number): CardGeometry {
  const { width, height } = view;
  const w = Math.min(SELECT.widthFrac * width, SELECT.maxHeightFrac * height * aspect);
  const h = w / aspect;
  const cx = SELECT.centerX * width;
  const cy = height / 2 - (view.bottomPadPx - view.topPadPx) / 2;
  const img = { left: cx - w / 2, top: cy - h / 2, width: w, height: h };
  const card = {
    left: img.left - CARD_PAD,
    top: img.top - CARD_PAD,
    width: Math.min(width * (1 - SIDE_RIGHT_MARGIN) - (img.left - CARD_PAD), w + CARD_PAD * 2 + SIDE_TEXT_W),
    height: h + CARD_PAD * 2,
  };
  return { stacked: false, img, card, textH: 0 };
}

/**
 * @param measureText  The text block's natural height at a given card width.
 *                     Without it, a typical height is assumed.
 */
function stackedGeometry(view: SelectedView, aspect: number, measureText?: (cardWidth: number) => number): CardGeometry {
  const { width, height } = view;
  const maxW = Math.min(width - stackMargin(width) * 2, STACK_MAX_W);
  const minW = Math.min(STACK_MIN_W, maxW);
  const measure = (cardW: number) => (measureText ? measureText(cardW) : STACK_TEXT_GUESS);

  // The photo takes the height the text leaves, within bounds, and as much of
  // the card's width as that allows.
  const fit = (textH: number, cardW: number) => {
    const budget = height - STACK_SAFE_TOP - STACK_SAFE_BOTTOM - CARD_PAD * 2 - textH;
    const maxH = Math.min(Math.max(budget, height * STACK_PHOTO_MIN_H), height * STACK_PHOTO_MAX_H);
    const w = Math.min(cardW - CARD_PAD * 2, maxH * aspect);
    return { w, h: w / aspect };
  };

  // Measure at full width; if the photo can't fill it, hug the photo and
  // measure again at that width (narrower text wraps taller). Settles in a pass or two.
  let cardW = maxW;
  let textH = measure(cardW);
  let photo = fit(textH, cardW);
  for (let i = 0; i < 3; i++) {
    const hug = Math.min(maxW, Math.max(minW, photo.w + CARD_PAD * 2));
    if (Math.abs(hug - cardW) < 1) break;
    cardW = hug;
    textH = measure(cardW);
    photo = fit(textH, cardW);
  }

  const group = photo.h + CARD_PAD * 2 + textH;
  const top = Math.max(STACK_SAFE_TOP, (height - group) / 2);
  const img = { left: (width - photo.w) / 2, top: top + CARD_PAD, width: photo.w, height: photo.h };
  // Past the bottom of the screen, the description scrolls inside the card.
  const shownTextH = Math.min(textH, Math.max(120, height - STACK_SAFE_BOTTOM - (img.top + photo.h + CARD_PAD)));
  const card = { left: (width - cardW) / 2, top, width: cardW, height: photo.h + CARD_PAD * 2 + shownTextH };
  return { stacked: true, img, card, textH: shownTextH };
}

export function cardGeometry(view: SelectedView, aspect: number, measureText?: (cardWidth: number) => number): CardGeometry {
  return cardLayoutFor(view) === 'stacked' ? stackedGeometry(view, aspect, measureText) : sideGeometry(view, aspect);
}
