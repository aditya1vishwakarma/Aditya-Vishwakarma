// The live constants, plus the (Rest) tab's settings: moved here from the project's constants.ts when the
// tab was retired, so this folder's imports of '../constants' and '../../constants' still find what they named.
import type { RestPlate } from './types';

export * from '../../constants';

// ─────────────────────────────────────────────────────────────
// (REST) — the mood board's quiet room. Desktop only.
//
// A full-bleed background, a drifting WebGL cloud layer over it, and
// photographs that breathe in and out at random spots on the screen.
// Everything you'd want to tune lives in this block.
// ─────────────────────────────────────────────────────────────

/**
 * Master switch for the (Rest) tab.
 *
 * Off: the toggle never renders, so the view is unreachable and none of its
 * work ever starts — no backdrop fetch, no WebGL context, no plate scheduler.
 * Everything below stays wired up; flip this to `true` to bring it back.
 */
export const REST_TAB_ENABLED = false;

/** Full-screen backdrop for the (Rest) tab. Rendered `object-cover`. */
export const REST_BACKGROUND_URL =
  'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/%E3%81%86.avif';

/**
 * Cloud-layer settings, passed straight through to <Clouds>. These are the
 * values from the canvasui.dev playground; see components/UI/Clouds.tsx for
 * the full option list (density, shading, opacity, wind, refraction…).
 */
export const REST_CLOUD_OPTIONS = {
  scale: 1.05,
  speed: 1.2,
  cover: 0.18,
  shadowOffsetY: 200,
};

/**
 * The photographs. Clouds, mountains — whatever you want to sit with.
 *
 * Order doesn't matter: the section shuffles them into a deck and deals the
 * whole deck before reshuffling, so nothing repeats until everything has been
 * shown. Size and placement are computed from each image's real aspect ratio,
 * so portrait and landscape both work — no `orientation` field needed.
 *
 * Four or more entries gives the rotation enough room to feel unrepetitive.
 * With zero entries the tab still renders: background and clouds, nothing else.
 */
export const REST_PLATES: RestPlate[] = [
  // Paste your CDN links here. Example:
  //
  // { id: 'r1', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/rest/sky-01.avif' },
  // { id: 'r2', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/rest/ridge-02.avif', caption: 'Mt Madonna, June' },
];
