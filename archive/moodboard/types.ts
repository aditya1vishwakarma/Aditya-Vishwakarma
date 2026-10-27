// The live types, plus the one only the (Rest) tab used: moved here from the project's types.ts when the
// tab was retired, so this folder's imports of '../types' and '../../types' still find what they named.
export * from '../../types';

/**
 * A single photograph shown in the mood board's "(Rest)" tab. Deliberately
 * thinner than MoodBoardItem — these are just pictures, with no tags, links or
 * descriptions to read. The layout derives everything else (size, position,
 * timing) at runtime from the image's own aspect ratio.
 */
export interface RestPlate {
  id: string;
  imageUrl: string;
  /** Optional one-liner shown beneath the photo (place, date, whatever). */
  caption?: string;
}
