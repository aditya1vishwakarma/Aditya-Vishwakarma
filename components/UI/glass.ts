import type React from 'react';
import { CARD_SHADOW, FROST_NOISE, GLASS_BACKDROP } from '../Museum/glass';
import { THEMES } from '../Museum/museumTheme';

/**
 * The site's frosted glass, for anything that floats over a picture: the
 * light recipe the mood board's cards and the museum share — a cream tint, a
 * blur that thickens the frost and lifts its colours, a bevelled rim, a soft
 * shadow and a fine grain.
 */

export { CARD_SHADOW, FROST_NOISE, GLASS_BACKDROP };

export const GLASS_TINT = THEMES.light.glass;
export const GLASS_EDGE = THEMES.light.glassEdge;

/** Tint, frost, rim and shadow in one, for glass whose outline isn't clipped (a clip-path would cut the shadow away). */
export const glassStyle: React.CSSProperties = {
  background: GLASS_TINT,
  backdropFilter: GLASS_BACKDROP,
  WebkitBackdropFilter: GLASS_BACKDROP,
  boxShadow: `${GLASS_EDGE}, ${CARD_SHADOW}`,
};
