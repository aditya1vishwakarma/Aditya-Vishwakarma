import React, { useLayoutEffect, useState } from 'react';

/**
 * A soft haze behind a block of text, so it reads against the picture: the
 * scene behind is blurred and darkened a touch, in the shape of the text
 * rather than a box. Each line's extent is taken from its text itself,
 * trimmed to the middle of its line box, feathered, and drawn as a mask —
 * so there's no edge anywhere, and whatever is behind the letters dissolves
 * into a wash.
 */

/** Each line's box is trimmed to this part of its height, top to bottom. */
const TRIM = [0.14, 0.86] as const;
/** The feather: this many pixels at least, or this much of the line's height. */
const FEATHER = { min: 14, ofLine: 0.42 };
/** The haze reaches this many feathers past the text, so the feather fades out within it. */
const REACH = 2.2;
/** The mask is all soft edges, so a quarter-size drawing of it is plenty. */
const MASK_SCALE = 0.25;

interface Shape {
  left: number;
  top: number;
  width: number;
  height: number;
  mask: string;
}

interface Props {
  /** The text block. Its lines are the children marked `data-line`, each starting with its text. */
  target: React.RefObject<HTMLElement | null>;
  /** Changes whenever the text has moved or been laid out afresh, so the haze is shaped again. */
  layout: string;
  /** Whether the haze is up: it fades in and out with its text. */
  on: boolean;
  /** How much it darkens the scene behind. */
  tint: string;
}

const TextHaze: React.FC<Props> = ({ target, layout, on, tint }) => {
  const [shape, setShape] = useState<Shape | null>(null);

  useLayoutEffect(() => {
    const block = target.current;
    if (!block) return;
    const lines = Array.from(block.querySelectorAll<HTMLElement>('[data-line]')).map((line) => {
      const range = document.createRange();
      if (line.firstChild) range.selectNodeContents(line.firstChild);
      const text = range.getBoundingClientRect();
      const box = line.getBoundingClientRect();
      return {
        left: text.left,
        right: text.right,
        top: box.top + box.height * TRIM[0],
        bottom: box.top + box.height * TRIM[1],
        feather: Math.max(FEATHER.min, FEATHER.ofLine * box.height),
      };
    });
    if (!lines.length) return;

    const pad = REACH * Math.max(...lines.map((l) => l.feather));
    const left = Math.min(...lines.map((l) => l.left)) - pad;
    const top = Math.min(...lines.map((l) => l.top)) - pad;
    const width = Math.max(...lines.map((l) => l.right)) + pad - left;
    const height = Math.max(...lines.map((l) => l.bottom)) + pad - top;

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width * MASK_SCALE));
    canvas.height = Math.max(1, Math.ceil(height * MASK_SCALE));
    const g = canvas.getContext('2d');
    if (!g) return;
    // Blurred rectangles: each drawn out of sight with its shadow cast back into
    // place, since a shadow's blur works everywhere and a canvas filter doesn't
    // yet. A shadow blurs by half its shadowBlur.
    const away = canvas.width + 64;
    g.shadowColor = '#000';
    g.shadowOffsetX = away;
    for (const l of lines) {
      g.shadowBlur = 2 * l.feather * MASK_SCALE;
      g.fillRect((l.left - left) * MASK_SCALE - away, (l.top - top) * MASK_SCALE, (l.right - l.left) * MASK_SCALE, (l.bottom - l.top) * MASK_SCALE);
    }
    setShape({ left, top, width, height, mask: `url(${canvas.toDataURL()})` });
  }, [target, layout]);

  if (!shape) return null;
  return (
    <div
      aria-hidden="true"
      data-hero-haze=""
      data-on={on}
      className="hero-haze"
      style={{
        ['--haze-tint' as string]: tint,
        left: shape.left,
        top: shape.top,
        width: shape.width,
        height: shape.height,
        maskImage: shape.mask,
        WebkitMaskImage: shape.mask,
      }}
    />
  );
};

export default TextHaze;
