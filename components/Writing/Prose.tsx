import React from 'react';
import OptimizedImage from '../UI/OptimizedImage';

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
// Media keeps to the words' width. 'full' lets one run the column's
// whole width, to its margins: for a diagram or a screenshot that
// needs the room. 'wide' keeps to the words' width, as no bleed does;
// it's still taken, so older pages read the same. Worked out against
// the column (`.writing-flow` in index.css), at any depth.

const bleedClass = (bleed?: Bleed): string => (bleed === 'full' ? 'bleed-full' : '');

// ─── Typography ──────────────────────────────────────────────────

/** Body paragraph: Switzer light, 16–18px. A touch darker than it would be in regular, for its thinner strokes. */
export const P: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  <p className={`fluid-text-body font-light leading-[1.6] text-charcoal/85 mb-4 ${className}`}>
    {children}
  </p>
);

/** Opening/intro paragraph. Slightly larger and more prominent. */
export const Lead: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  <p className={`text-xl font-light leading-relaxed mb-6 text-charcoal/90 ${className}`}>
    {children}
  </p>
);

/** Semantic bold: semibold, a step over the title's medium rather than past it, and full charcoal. */
export const Bold: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  <strong className={`font-semibold text-charcoal ${className}`}>{children}</strong>
);

// ─── Headings ────────────────────────────────────────────────────
// H1 is intentionally omitted — the page title is handled by
// WritingLayout's `title` prop to preserve heading hierarchy.

/** Section heading: medium, as the title is, and close-set as large type is, a step down from it. */
export const H2: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  // A section starts below anything set beside the text before it.
  <h2 className={`clear-both font-medium text-[clamp(1.875rem,1.2vw+1.4rem,2.5rem)] leading-[1.1] tracking-[-0.02em] text-charcoal mt-10 mb-5 ${className}`}>{children}</h2>
);

/** Sub-section heading. */
export const H3: React.FC<ProseBaseProps> = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-medium tracking-[-0.01em] mb-4 mt-8 text-moss ${className}`}>{children}</h3>
);

// ─── Block Elements ──────────────────────────────────────────────

/** Pull-quote with left moss border and italic styling. */
export const Quote: React.FC<BleedableProps> = ({ children, bleed, className = '' }) => (
  <blockquote className={`my-8 pl-6 border-l-4 border-moss/40 py-2 ${bleedClass(bleed)} ${className}`}>
    <div className="italic font-light text-xl leading-relaxed text-charcoal/75">
      {children}
    </div>
  </blockquote>
);

/** Moss-tinted callout card for emphasized content blocks. */
export const Callout: React.FC<BleedableProps> = ({ children, bleed, className = '' }) => (
  <div className={`bg-moss/5 p-8 md:p-12 border border-moss/10 my-16 ${bleedClass(bleed)} ${className}`}>
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
  <code className={`bg-charcoal/5 px-1.5 py-0.5 text-sm font-mono ${className}`}>
    {children}
  </code>
);

/** Multi-line code block with subtle background. */
export const CodeBlock: React.FC<BleedableProps> = ({ children, bleed, className = '' }) => (
  <pre className={`bg-charcoal/[0.03] p-6 overflow-x-auto my-8 border border-charcoal/5 ${bleedClass(bleed)} ${className}`}>
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
  /** Beside the text, the paragraphs after it wrapping round it: for a tall picture to have a column of its own (as `MediaGallery`'s). */
  beside?: 'left' | 'right';
}

/** Image with OptimizedImage loading, optional caption, and bleed support. */
export const Img: React.FC<ImgProps> = ({
  src, alt, caption, bleed, aspectRatio = 'aspect-auto', priority, capped, beside, className = ''
}) => (
  <figure
    className={`${
      beside
        ? `my-6 md:mb-5 md:mt-1 md:w-[42%] ${beside === 'left' ? 'md:float-left md:mr-8' : 'md:float-right md:ml-8'}`
        : `my-4 ${bleedClass(bleed)}`
    } ${className}`}
  >
    {capped ? (
      <div className="relative h-[600px] w-full overflow-hidden shadow-md border border-charcoal/10 bg-charcoal/5 flex items-center justify-center">
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
    ) : (
      <OptimizedImage
        src={src}
        alt={alt}
        aspectRatio={aspectRatio}
        priority={priority}
        className="w-full h-auto"
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
    <div className="overflow-hidden shadow-lg border border-charcoal/10 bg-charcoal/5">
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
// A bento grid of pictures and videos, all in view at once (Gallery.tsx).

export { MediaGallery } from './Gallery';
export type { MediaItem } from './Gallery';

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
    <Tag className={`${listStyle} list-outside pl-6 space-y-2 text-charcoal/85 fluid-text-body font-light leading-[1.6] mb-4 ${className}`}>
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
      <div className="overflow-x-auto border border-charcoal/10">
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
