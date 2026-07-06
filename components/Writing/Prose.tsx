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
  <div className={`mb-10 ${className}`}>{children}</div>
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
}

/** Image with OptimizedImage loading, optional caption, and bleed support. */
export const Img: React.FC<ImgProps> = ({
  src, alt, caption, bleed, aspectRatio = 'aspect-auto', priority, className = ''
}) => (
  <figure className={`my-8 ${bleedClass(bleed)} ${className}`}>
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio={aspectRatio}
      priority={priority}
      className={`w-full h-auto ${bleed ? 'md:rounded-squircle' : 'rounded-squircle'}`}
    />
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
    <Tag className={`${listStyle} list-inside space-y-2 text-charcoal/70 text-lg mb-4 ${className}`}>
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
