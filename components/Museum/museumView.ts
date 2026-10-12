import { MOBILE_MAX } from '../../constants';
import { CAMERA, FRAME } from './museumConfig';
import type { CardGeometry } from './selectedLayout';

/**
 * Where the camera stands, worked out from the window size.
 *
 * The shelving's height (from just under the lowest shelf to over the
 * tallest pane) is fitted between the top of the window and the controls at
 * the bottom — unless that would show too little of its length, in which
 * case the camera backs away and the spare height is shared out above and
 * below. Everything is measured mid-shelf.
 *
 * Phones (and any short window) get "compact" framing: slimmer margins for
 * the smaller controls, and in portrait a closer view — two or three panes
 * across, large enough to read and to tap.
 */
export interface MuseumView {
  width: number;
  height: number;
  camY: number;
  camZ: number;
  /** World metres per CSS px, mid-shelf. */
  worldPerPx: number;
  /** Half the visible width / height, mid-shelf. */
  halfW: number;
  halfH: number;
  /** Shelf visible across the screen. */
  visibleW: number;
  topPadPx: number;
  bottomPadPx: number;
  /** Phone-sized controls and framing. */
  compact: boolean;
  /** Taller than wide: the selected card stacks its text under the photo. */
  portrait: boolean;
}

/** Shelf to show across a portrait phone: two or three panes, each a good thumb's width. */
const PHONE_MIN_W = 0.95;

export function computeView(width: number, height: number): MuseumView {
  const tan = Math.tan(((CAMERA.fov / 2) * Math.PI) / 180);
  const aspect = width / Math.max(1, height);
  const compact = width < MOBILE_MAX || height < 500;
  const portrait = height > width;

  // Room kept clear for the controls: the top row of buttons, the rail at the bottom.
  const topPad = compact ? (portrait ? 64 : 56) : FRAME.topPadPx;
  const bottomPad = compact ? (portrait ? 84 : 52) : FRAME.bottomPadPx;

  const band = FRAME.contentTopY - FRAME.contentBottomY;
  const avail = Math.max(160, height - topPad - bottomPad);

  // A portrait window can't show a full section without shrinking everything; ask for less.
  const minW = compact && portrait ? PHONE_MIN_W : CAMERA.minVisibleW * Math.min(1, aspect / 1.4);
  const worldPerPx = Math.max(band / avail, minW / width);

  // Spare height goes mostly above on a wide screen, where the light comes
  // from; on a tall one it's shared, so the shelf sits in the middle.
  const halfH = (height / 2) * worldPerPx;
  const spare = avail * worldPerPx - band;
  const bottomY = FRAME.contentBottomY - spare * (portrait ? 0.45 : 0.22);
  return {
    width,
    height,
    camY: bottomY + (height / 2 - bottomPad) * worldPerPx - CAMERA.lower,
    camZ: CAMERA.measureZ + halfH / tan,
    worldPerPx,
    halfW: halfH * aspect,
    halfH,
    visibleW: 2 * halfH * aspect,
    topPadPx: topPad,
    bottomPadPx: bottomPad,
    compact,
    portrait,
  };
}

/**
 * Mutable state shared between the scene and the DOM, read and written every
 * frame. Kept out of React so dragging the case never re-renders anything.
 */
export interface MuseumRig {
  /** Where the view is heading, and where it is right now. */
  targetX: number;
  x: number;
  /** How fast the view closes on its target (per second). Each input sets its own. */
  ease: number;
  minX: number;
  maxX: number;
  view: MuseumView;
  /** Something that casts a shadow moved this frame; redraw the shadow map. */
  shadowDirty: boolean;
  /** The selected piece's card, laid out — where its pane flies to. */
  selected: { id: string; geometry: CardGeometry } | null;
}

export const clampRig = (rig: MuseumRig, x: number) => Math.min(rig.maxX, Math.max(rig.minX, x));

/**
 * Easing rates for the different ways of moving along the shelf. A trackpad
 * or a drag is already a continuous gesture, so the shelf tracks it almost
 * exactly — any lag there reads as the shelf being on a spring. A jump (an
 * arrow key, a click on the rail) or the coast after a flick is a single
 * request, and glides there instead.
 */
export const EASE = {
  drag: 30,
  wheel: 18,
  seek: 9,
  glide: 5,
};
