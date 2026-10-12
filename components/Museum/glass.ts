/**
 * The frosted-glass recipe shared by the About note and the selected card.
 * Carried over from the old mood board's cards (now in archive/moodboard), so
 * the museum keeps the same glass without depending on them. The rim and the
 * tint change with the theme — see museumTheme.ts.
 */

/** Soft, layered drop shadow. Lives on a layer of its own, so a clip-path never clips it away. */
export const CARD_SHADOW =
  '0 8px 16px -4px rgba(0,0,0,0.05), 0 16px 24px -4px rgba(0,0,0,0.05), 0 24px 32px -4px rgba(0,0,0,0.05)';

/** blur = frost thickness, saturate = glassy vividness of the backdrop. */
export const GLASS_BACKDROP = 'blur(14px) saturate(1.8)';

/** Fine fractal-noise grain, tiled — the "frost" scatter. Rendered at 7% opacity. */
export const FROST_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E\")";
