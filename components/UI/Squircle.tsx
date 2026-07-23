import React, { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────
 * iOS-style corner smoothing (squircle).
 *
 * Generates a superellipse "smoothed rounded rect" SVG path — the same
 * technique Figma uses for its `cornerSmoothing` control. A smoothing of
 * 0.6 matches how iOS rounds its icons/cards.
 *
 * The path is computed at the element's *actual* pixel size (via a
 * ResizeObserver) so it scales with responsive / auto-height images, and
 * applied with `clip-path`. Because clip-path also clips box-shadow, any
 * drop shadow must live on a parent element (see the `shadow` prop).
 * ───────────────────────────────────────────── */

const toRad = (deg: number) => (deg * Math.PI) / 180;

// Bezier/arc parameters for a single 90° smoothed corner.
function cornerParams(radius: number, smoothing: number) {
  const p = (1 + smoothing) * radius;
  const arcMeasure = 90 * (1 - smoothing);
  const arc = Math.sin(toRad(arcMeasure / 2)) * radius * Math.SQRT2;
  const angleAlpha = (90 - arcMeasure) / 2;
  const p3ToP4 = radius * Math.tan(toRad(angleAlpha / 2));
  const angleBeta = 45 * smoothing;
  const c = p3ToP4 * Math.cos(toRad(angleBeta));
  const d = c * Math.tan(toRad(angleBeta));
  const b = (p - arc - c - d) / 3;
  const a = 2 * b;
  return { a, b, c, d, p, arc, r: radius };
}

export function squirclePath(width: number, height: number, radius: number, smoothing = 0.6) {
  // Keep the smoothing "budget" inside the box so edges never invert.
  const maxR = Math.min(width, height) / 2 / (1 + smoothing);
  const r = Math.max(0, Math.min(radius, maxR));
  const { a, b, c, d, p, arc } = cornerParams(r, smoothing);

  return [
    `M ${width - p} 0`,
    `c ${a} 0 ${a + b} 0 ${a + b + c} ${d}`,
    `a ${r} ${r} 0 0 1 ${arc} ${arc}`,
    `c ${d} ${c} ${d} ${b + c} ${d} ${a + b + c}`,
    `L ${width} ${height - p}`,
    `c 0 ${a} 0 ${a + b} ${-d} ${a + b + c}`,
    `a ${r} ${r} 0 0 1 ${-arc} ${arc}`,
    `c ${-c} ${d} ${-(b + c)} ${d} ${-(a + b + c)} ${d}`,
    `L ${p} ${height}`,
    `c ${-a} 0 ${-(a + b)} 0 ${-(a + b + c)} ${-d}`,
    `a ${r} ${r} 0 0 1 ${-arc} ${-arc}`,
    `c ${-d} ${-c} ${-d} ${-(b + c)} ${-d} ${-(a + b + c)}`,
    `L 0 ${p}`,
    `c 0 ${-a} 0 ${-(a + b)} ${d} ${-(a + b + c)}`,
    `a ${r} ${r} 0 0 1 ${arc} ${-arc}`,
    `c ${c} ${-d} ${b + c} ${-d} ${a + b + c} ${-d}`,
    'Z',
  ].join(' ');
}

// Returns a ref + a clip-path value that tracks the element's size.
export function useSquircle(radius: number, smoothing = 0.6) {
  const ref = useRef<HTMLElement | null>(null);
  const [clipPath, setClipPath] = useState<string | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      setClipPath(`path('${squirclePath(w, h, radius, smoothing)}')`);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [radius, smoothing]);

  return { ref, clipPath };
}

interface SquircleProps extends React.HTMLAttributes<HTMLElement> {
  radius: number;
  smoothing?: number;
  /** Optional box-shadow — rendered on an outer wrapper so clip-path can't clip it. */
  shadow?: string;
  /** Class names for the (optional) shadow wrapper — put layout classes here. */
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  as?: any;
  children?: React.ReactNode;
}

/**
 * Clips its children to an iOS-style squircle. When `shadow` is provided it
 * wraps the clipped element so the shadow follows the (visually identical)
 * rounded silhouette instead of being clipped away.
 */
const Squircle: React.FC<SquircleProps> = ({
  radius,
  smoothing = 0.6,
  shadow,
  wrapperClassName,
  wrapperStyle,
  as: Tag = 'div',
  style,
  children,
  ...rest
}) => {
  const { ref, clipPath } = useSquircle(radius, smoothing);

  const clipped = (
    <Tag
      ref={ref}
      style={{
        // Fallback rounded corners until clip-path is measured (avoids a
        // one-frame flash of sharp corners), then clip-path takes over.
        borderRadius: radius,
        overflow: 'hidden',
        ...style,
        clipPath,
        WebkitClipPath: clipPath,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );

  if (!shadow) return clipped;

  return (
    <div
      className={wrapperClassName}
      style={{ borderRadius: radius, boxShadow: shadow, ...wrapperStyle }}
    >
      {clipped}
    </div>
  );
};

export default Squircle;
