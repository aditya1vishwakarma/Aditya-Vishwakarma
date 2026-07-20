import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion as motionComponent, AnimatePresence } from 'framer-motion';
import OptimizedImage from '../UI/OptimizedImage';

const motion = motionComponent as any;

// ─── Shared Types ────────────────────────────────────────────────

type Bleed = 'wide' | 'full';

interface ProseBaseProps {
  children?: React.ReactNode;
  className?: string;
}

interface BleedableProps extends ProseBaseProps {
  bleed?: Bleed;
}

// ─── Bleed Helper ────────────────────────────────────────────────
// Uses Tailwind arbitrary values to set grid-column directly,
// ensuring bleed works inside the WritingLayout subgrid.

const bleedClass = (bleed?: Bleed): string => {
  if (bleed === 'full') return '[grid-column:1/-1] w-full';
  if (bleed === 'wide') return '[grid-column:1/-1] max-w-5xl w-full mx-auto';
  return '';
};

// ─── Typography ──────────────────────────────────────────────────

/** Body paragraph. Serif (inherited), reading-optimized size and spacing. */
export const P: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  <p className={`text-lg leading-relaxed text-charcoal/70 mb-4 ${className}`}>
    {children}
  </p>
);

/** Opening/intro paragraph. Slightly larger and more prominent. */
export const Lead: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  <p className={`text-xl leading-relaxed mb-6 font-serif text-charcoal/90 ${className}`}>
    {children}
  </p>
);

/** Semantic bold with slightly higher opacity than body text. */
export const Bold: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  <strong className={`font-bold text-charcoal ${className}`}>{children}</strong>
);

// ─── Headings ────────────────────────────────────────────────────
// H1 is intentionally omitted — the page title is handled by
// WritingLayout's `title` prop to preserve heading hierarchy.

/** Section heading. */
export const H2: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  <h2 className={`text-3xl font-serif mb-6 text-moss ${className}`}>{children}</h2>
);

/** Sub-section heading. */
export const H3: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-serif mb-4 mt-8 text-moss ${className}`}>{children}</h3>
);

// ─── Block Elements ──────────────────────────────────────────────

/** Pull-quote with left moss border and italic styling. */
export const Quote: React.FC<BleedableProps> = ({ children, bleed, className = '' }) => (
  <blockquote className={`my-8 pl-6 border-l-4 border-moss/40 py-2 ${bleedClass(bleed)} ${className}`}>
    <div className="font-serif italic text-xl leading-relaxed text-charcoal/70">
      {children}
    </div>
  </blockquote>
);

/** Moss-tinted callout card for emphasized content blocks. */
export const Callout: React.FC<BleedableProps> = ({ children, bleed, className = '' }) => (
  <div className={`bg-moss/5 p-8 md:p-12 rounded-squircle border border-moss/10 my-16 ${bleedClass(bleed)} ${className}`}>
    {children}
  </div>
);

/** Groups related content with consistent bottom spacing. */
export const Section: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  <div className={`mb-6 ${className}`}>{children}</div>
);

// ─── Code ────────────────────────────────────────────────────────

/** Inline monospace snippet within body text. */
export const InlineCode: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  <code className={`bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono ${className}`}>
    {children}
  </code>
);

/** Multi-line code block with subtle background. */
export const CodeBlock: React.FC<BleedableProps> = ({ children, bleed, className = '' }) => (
  <pre className={`bg-charcoal/[0.03] rounded-squircle p-6 overflow-x-auto my-8 border border-charcoal/5 ${bleedClass(bleed)} ${className}`}>
    <code className="text-sm font-mono text-charcoal/80">{children}</code>
  </pre>
);

// ─── Media ───────────────────────────────────────────────────────

interface ImgProps extends BleedableProps {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: string;
  priority?: boolean;
  capped?: boolean;
}

/** Image with OptimizedImage loading, optional caption, and bleed support. */
export const Img: React.FC<ImgProps> = ({
  src, alt, caption, bleed, aspectRatio = 'aspect-auto', priority, capped, className = ''
}) => (
  <figure className={`my-4 ${bleedClass(bleed)} ${className}`}>
    {capped ? (
      <div className="relative h-[600px] w-full overflow-hidden shadow-md border border-charcoal/10 bg-charcoal/5 flex items-center justify-center rounded-squircle">
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain"
          loading={priority ? "eager" : "lazy"}
        />
      </div>
    ) : (
      <OptimizedImage
        src={src}
        alt={alt}
        aspectRatio={aspectRatio}
        priority={priority}
        className={`w-full h-auto ${bleed ? 'md:rounded-squircle' : 'rounded-squircle'}`}
      />
    )}
    {caption && (
      <figcaption className="text-xs md:text-sm text-charcoal/50 mt-3 text-center italic">
        {caption}
      </figcaption>
    )}
  </figure>
);

interface VideoProps extends BleedableProps {
  src: string;
  caption?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
}

/** Video with styled container, optional caption, and bleed support. */
export const Video: React.FC<VideoProps> = ({
  src, caption, bleed, controls = true, autoPlay = false,
  muted = false, loop = false, playsInline = true, className = ''
}) => (
  <figure className={`my-8 ${bleedClass(bleed)} ${className}`}>
    <div className="overflow-hidden rounded-squircle shadow-lg border border-charcoal/10 bg-charcoal/5">
      <video
        src={src}
        controls={controls}
        playsInline={playsInline}
        muted={muted}
        loop={loop}
        autoPlay={autoPlay}
        className="w-full h-auto object-cover max-h-[70vh]"
      >
        Your browser does not support the video tag.
      </video>
    </div>
    {caption && (
      <figcaption className="text-xs md:text-sm text-charcoal/60 mt-3 text-center italic">
        {caption}
      </figcaption>
    )}
  </figure>
);

// ─── Media Gallery ───────────────────────────────────────────────

interface MediaItem {
  /** 'image' (default) or 'video'. */
  type?: 'image' | 'video';
  /** CDN url for the media. */
  src: string;
  /** Alt text (images) or aria-label (videos). */
  alt?: string;
  /** Optional per-slide caption. */
  caption?: string;
}

interface MediaGalleryProps extends BleedableProps {
  /** Array of images / videos to display in the carousel. */
  items: MediaItem[];
  /** Gallery-level caption rendered below the carousel. */
  caption?: string;
}

/**
 * Horizontal media carousel with lightbox.
 *
 * - Scroll-snap carousel with left / right arrows (desktop) and swipe (mobile).
 * - Tap an image to open a full-resolution lightbox overlay.
 * - Arrow keys + Escape for keyboard navigation inside the lightbox.
 * - Tap the backdrop or press Escape to dismiss.
 * - Videos are rendered inline with native controls; they do not open a lightbox.
 */
export const MediaGallery: React.FC<MediaGalleryProps> = ({
  items, caption, bleed, className = ''
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // ── Scroll-state for arrow visibility ──────────────────────────
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    // ── Active card: find the card whose center is closest to the viewport center ──
    const cards = Array.from(el.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement && c.tagName === 'DIV'
    );
    if (cards.length > 0) {
      const viewportCenter = el.scrollLeft + el.clientWidth / 2;
      let closestIdx = 0, minDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - viewportCenter);
        if (dist < minDist) { minDist = dist; closestIdx = i; }
      });
      setActiveIndex(closestIdx);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const scrollToCard = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = Array.from(el.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement && c.tagName === 'DIV'
    );
    const card = cards[idx];
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
  };

  // ── Lightbox helpers ───────────────────────────────────────────
  // Filter to only image items for lightbox navigation
  const imageIndices = items
    .map((item, i) => (item.type !== 'video' ? i : -1))
    .filter(i => i !== -1);

  const openLightbox = (index: number) => {
    if (items[index]?.type === 'video') return; // videos stay inline
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const navigateLightbox = useCallback((dir: 1 | -1) => {
    setLightboxIndex(prev => {
      if (prev === null) return null;
      const currentPosInImageList = imageIndices.indexOf(prev);
      if (currentPosInImageList === -1) return null;
      const next = (currentPosInImageList + dir + imageIndices.length) % imageIndices.length;
      return imageIndices[next];
    });
  }, [imageIndices]);

  // ── Keyboard nav ───────────────────────────────────────────────
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') navigateLightbox(-1);
      else if (e.key === 'ArrowRight') navigateLightbox(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, navigateLightbox]);

  // ── Lock body scroll when lightbox is open ─────────────────────
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [lightboxIndex]);

  // ── Touch swipe for lightbox ───────────────────────────────────
  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleLightboxTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      navigateLightbox(diff > 0 ? -1 : 1);
    }
    touchStartX.current = null;
  };

  // ── Counter text ───────────────────────────────────────────────
  const lightboxPosition = lightboxIndex !== null
    ? `${imageIndices.indexOf(lightboxIndex) + 1} / ${imageIndices.length}`
    : '';

  return (
    <>
      <figure className={`my-8 ${bleedClass(bleed)} ${className}`}>
        {/* ── Carousel container ──────────────────────────────── */}
        <div className="relative group">
          {/* Scroll track */}
          <div
            ref={scrollRef}
            data-media-gallery-scroll
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-[12.5%]"
            style={{ scrollbarWidth: 'none' }}
          >
            <style>{`[data-media-gallery-scroll]::-webkit-scrollbar { display: none; }`}</style>
            {items.map((item, i) => (
              <div
                key={i}
                className="snap-center shrink-0"
                style={{ width: items.length === 1 ? '100%' : 'clamp(280px, 75%, 720px)' }}
              >
                {item.type === 'video' ? (
                  <div className="relative h-[600px] overflow-hidden shadow-md border border-charcoal/10 bg-charcoal/5 flex items-center justify-center">
                    <video
                      src={item.src}
                      controls
                      playsInline
                      muted
                      className="max-h-full max-w-full object-contain"
                      aria-label={item.alt}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openLightbox(i)}
                    className="block w-full text-left cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-moss/40"
                  >
                    <div className="relative h-[600px] overflow-hidden shadow-md border border-charcoal/10 bg-charcoal/5 flex items-center justify-center">
                      <img
                        src={item.src}
                        alt={item.alt || ''}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  </button>
                )}
                {item.caption && (
                  <p className="text-xs md:text-sm text-charcoal/50 mt-2 text-center italic">
                    {item.caption}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* ── Left / Right arrows (desktop, shown on hover) ── */}
          {items.length > 1 && canScrollLeft && (
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll gallery left"
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-md border border-charcoal/10 text-charcoal/60 hover:text-charcoal hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          {items.length > 1 && canScrollRight && (
            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll gallery right"
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-md border border-charcoal/10 text-charcoal/60 hover:text-charcoal hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
        </div>

        {/* ── Pill-style active indicator (Apple.com style) ────── */}
        {items.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToCard(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === i
                    ? 'w-8 bg-charcoal/80'
                    : 'w-4 bg-charcoal/20 hover:bg-charcoal/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* ── Gallery-level caption ───────────────────────────── */}
        {caption && (
          <figcaption className="text-xs md:text-sm text-charcoal/50 mt-3 text-center italic">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* ── Lightbox overlay (portalled to body via React) ──── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={closeLightbox}
            onTouchStart={handleLightboxTouchStart}
            onTouchEnd={handleLightboxTouchEnd}
          >
            {/* Counter */}
            <span className="absolute top-6 left-6 text-white/60 text-sm font-sans tracking-wide">
              {lightboxPosition}
            </span>

            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
              aria-label="Close lightbox"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Left arrow (desktop) */}
            {imageIndices.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
                className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10"
                aria-label="Previous image"
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            )}

            {/* Right arrow (desktop) */}
            {imageIndices.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
                className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10"
                aria-label="Next image"
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            )}

            {/* Full-resolution image */}
            <motion.img
              key={lightboxIndex}
              src={items[lightboxIndex].src}
              alt={items[lightboxIndex].alt || 'Enlarged image'}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-w-[90vw] max-h-[85vh] object-contain shadow-2xl rounded-lg"
              onClick={(e: any) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Utility ─────────────────────────────────────────────────────

/** Small muted text for image/embed descriptions. */
export const Caption: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  <p className={`text-xs md:text-sm text-charcoal/50 mt-3 text-center italic ${className}`}>
    {children}
  </p>
);

/** Thin horizontal rule for section breaks. */
export const Divider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <hr className={`border-t border-charcoal/10 my-12 ${className}`} />
);

// ─── Lists ───────────────────────────────────────────────────────

interface ListProps extends ProseBaseProps {
  type?: 'bullet' | 'numbered';
}

/** Styled list — bullet (ul) or numbered (ol). */
export const List: React.FC<ListProps> = ({ children, type = 'bullet', className = '' }) => {
  const Tag = type === 'numbered' ? 'ol' : 'ul';
  const listStyle = type === 'numbered' ? 'list-decimal' : 'list-disc';
  return (
    <Tag className={`${listStyle} list-outside pl-6 space-y-2 text-charcoal/70 text-lg mb-4 ${className}`}>
      {children}
    </Tag>
  );
};

/** Individual list item. */
export const ListItem: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  <li className={className}>{children}</li>
);

// ─── Table ───────────────────────────────────────────────────────

interface TableProps extends BleedableProps {
  /** Dimensions as "ROWSxCOLS", e.g. "3x3" or "2x4". */
  dimensions: string;
  /** Flat array of cell contents, filled row by row (left→right, top→bottom). */
  data: React.ReactNode[];
  /** If true, the first row is rendered as a <thead> with bold styling. */
  header?: boolean;
  /** Optional caption displayed below the table. */
  caption?: string;
}

/**
 * Data table built from a dimensions string and a flat data array.
 *
 * Usage:
 * ```tsx
 * <Table
 *   dimensions="3x3"
 *   header
 *   data={[
 *     'Name',  'Role',     'Status',
 *     'Alice', 'Engineer', 'Active',
 *     'Bob',   'Designer', 'Away',
 *   ]}
 * />
 * ```
 */
export const Table: React.FC<TableProps> = ({
  dimensions, data, header = false, caption, bleed, className = '',
}) => {
  // Parse "ROWSxCOLS"
  const [rowCount, colCount] = dimensions
    .toLowerCase()
    .split('x')
    .map(Number);

  if (!rowCount || !colCount) {
    console.warn(`[Prose.Table] Invalid dimensions "${dimensions}". Expected format: "3x3".`);
    return null;
  }

  // Chunk flat array into rows
  const rows: React.ReactNode[][] = [];
  for (let r = 0; r < rowCount; r++) {
    const row: React.ReactNode[] = [];
    for (let c = 0; c < colCount; c++) {
      const idx = r * colCount + c;
      row.push(idx < data.length ? data[idx] : '');
    }
    rows.push(row);
  }

  const headRow = header ? rows[0] : null;
  const bodyRows = header ? rows.slice(1) : rows;

  return (
    <figure className={`my-8 ${bleedClass(bleed)} ${className}`}>
      <div className="overflow-x-auto rounded-xl border border-charcoal/10">
        <table className="w-full text-left text-lg border-separate border-spacing-0">
          {headRow && (
            <thead>
              <tr className="bg-moss/[0.07] border-b border-charcoal/10">
                {headRow.map((cell, i) => (
                  <th
                    key={i}
                    className="px-5 py-3 font-semibold text-charcoal/90 text-sm uppercase tracking-wide align-middle border-r border-charcoal/10 last:border-r-0"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {bodyRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={`border-b border-charcoal/5 last:border-b-0 ${rIdx % 2 === 1 ? 'bg-charcoal/[0.035]' : ''
                  }`}
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-5 py-3 text-charcoal/70 border-r border-charcoal/10 last:border-r-0">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <figcaption className="text-xs md:text-sm text-charcoal/50 mt-3 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
