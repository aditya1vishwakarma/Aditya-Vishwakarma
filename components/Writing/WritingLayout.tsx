import React from 'react';
import { usePaneTitle } from '../Home/SectionPane';

interface WritingLayoutProps {
  children: React.ReactNode;
  title?: string;
  date?: string;
  readTime?: string;
  category?: string;
}

// Strong enough to read on the glass, as small text needs: 4.5:1 and up.
const DETAIL = 'font-sans text-[11.5px] uppercase tracking-[0.16em]';
const META = `${DETAIL} text-charcoal/75`;
const CATEGORY = `${DETAIL} text-moss`;

/**
 * A project or a post, as it's read in the pane: its details and title over
 * an editorial grid. Paragraphs and lists fall into the middle column, the
 * width for reading; pictures and embeds can bleed out wide, or across all
 * of it (see Prose). Getting back to the list and the reading progress are
 * the pane's.
 */
const WritingLayout: React.FC<WritingLayoutProps> = ({ children, title, date, readTime, category }) => {
  const named = usePaneTitle();
  const details = [date, readTime].filter(Boolean);

  return (
    <div className="pb-24 pt-2 selection:bg-moss/20 selection:text-moss-light md:pt-4">
      <div className="editorial-grid">
        <header className="mb-6">
          {(details.length > 0 || category) && (
            <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-charcoal/10 pb-6">
              {details.map((d, i) => (
                <React.Fragment key={d}>
                  {i > 0 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-charcoal/25" />}
                  <span className={META}>{d}</span>
                </React.Fragment>
              ))}
              {details.length > 0 && category && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-charcoal/25" />}
              {category && <span className={CATEGORY}>{category}</span>}
            </div>
          )}

          {title && (
            <h1 {...named} className="mb-8 font-serif text-[clamp(2.25rem,4vw+1.25rem,4.5rem)] leading-[1.1] tracking-tight text-charcoal outline-none">
              {title}
            </h1>
          )}
        </header>

        <article className="col-span-full grid grid-cols-subgrid font-serif fluid-text-lg text-charcoal/80">{children}</article>
      </div>
    </div>
  );
};

export default WritingLayout;
