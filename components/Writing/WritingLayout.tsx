import React, { useLayoutEffect, useRef } from 'react';
import { motion as motionComponent, useIsPresent } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { HEAD_TOP, PANE_PAD, usePaneActions, usePaneTitle, usePieceMotion } from '../Home/SectionPane';
import { pieceAt, usePiecePath, type PieceLink } from './pieces';
import { useFitTitle } from './useFitTitle';

interface WritingLayoutProps {
  children: React.ReactNode;
  /** Each of these is the piece's entry in `constants.ts` unless it's given here. */
  title?: string;
  /** The line under the title: a project's `description`, or a post's `excerpt`. */
  subtitle?: string;
  date?: string;
  readTime?: string;
  category?: string;
  role?: string;
  tools?: string[];
}

// Strong enough to read on the glass, as small text needs: 4.5:1 and up. Split in two, sized by the glass's height.
const LABEL = 'text-[11.5px] uppercase tracking-[0.16em] text-charcoal/75 split:text-[length:var(--col-label)]';
const VALUE = 'text-[16.5px] leading-snug text-charcoal split:text-[length:var(--col-value)] split:leading-[1.3]';
const RULE = 'border-t border-charcoal/10';
/**
 * Back and Home, in the left column: words on the column, no pill. A finger's height, and reaching 8px past the
 * words either side, so the words themselves sit on the margin.
 */
const HEAD_LINK =
  'group flex h-10 items-center gap-2 px-2 text-[12px] font-medium uppercase tracking-[0.16em] text-charcoal/75 ' +
  'transition-colors duration-300 hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss';
/** The size of a way to the piece before or after. */
const NEIGHBOUR = 'text-[clamp(20px,1.5vw,25px)]';

const motion = motionComponent as any;

/**
 * From piece to piece, the title's pulled across first, as if by a hand, on a lively spring; the rest of the piece
 * follows a beat behind on a softer one, as if on a string. Going, the title's pulled away first, the rest after it.
 * The column's furniture — its grey, Back and Home, its rule — stays put, the same from one piece to the next, and
 * the column's edges mask what crosses them.
 */
const PULL = {
  title: { from: 120, out: 80, lag: 0, spring: { visualDuration: 0.5, bounce: 0.32 }, fade: 0.18, leave: 0.18, leaveLag: 0 },
  rest: { from: 72, out: 40, lag: 0.09, spring: { visualDuration: 0.62, bounce: 0.18 }, fade: 0.28, leave: 0.22, leaveLag: 0.05 },
};

/**
 * A part's motion: in from `way`, after `wait`; out the other way from `next`; none where there's no slide that way,
 * so the part goes with its card. Each part runs its own, rather than waiting on its card's: a piece whose code is
 * still coming arrives after its card has, and would otherwise miss its cue and stay hidden.
 */
const pulled = (part: keyof typeof PULL, way: number, next: number, wait: number) => {
  const p = PULL[part];
  if (!way && !next) return {};
  return {
    initial: 'hidden',
    animate: 'shown',
    exit: 'gone',
    variants: {
    ...(way && {
      hidden: { opacity: 0, transform: `translateX(${way * p.from}px)` },
      shown: {
        opacity: 1,
        transform: 'translateX(0px)',
        transitionEnd: { transform: 'none' },
        transition: {
          transform: { type: 'spring', ...p.spring, delay: wait + p.lag },
          opacity: { duration: p.fade, delay: wait + p.lag, ease: 'easeOut' },
        },
      },
    }),
    ...(next && {
      gone: {
        opacity: 0,
        transform: ['translateX(0px)', `translateX(${-next * p.out}px)`],
        transition: { duration: p.leave, delay: p.leaveLag, ease: [0.4, 0, 1, 1] },
      },
    }),
    },
  };
};

/** A label and its value, a row each: the labels in the column's first half, the values from halfway across. */
const Details: React.FC<{ rows: [string, React.ReactNode][] }> = ({ rows }) => (
  <dl className="grid grid-cols-2 items-baseline gap-x-5 gap-y-2.5 split:gap-y-[var(--col-row)]">
    {rows.map(([label, value]) => (
      <React.Fragment key={label}>
        <dt className={LABEL}>{label}</dt>
        <dd className={VALUE}>{value}</dd>
      </React.Fragment>
    ))}
  </dl>
);

/**
 * The piece before or after: its arrow, its name, and under the name which list it's in — set apart on a line of
 * its own, where it sits the same however long the name runs. Followed, it takes the place of this one in the
 * history, as stepping between photos does, so Back still goes straight to the list.
 */
const Neighbour: React.FC<{ to: PieceLink; dir: 'prev' | 'next' }> = ({ to, dir }) => {
  const navigate = useNavigate();
  const next = dir === 'next';
  const go = (e: React.MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to.path, { replace: true, state: { turn: next ? 1 : -1 } });
  };
  const arrow = (
    <span
      aria-hidden="true"
      className={`relative flex h-[1.2em] items-center text-charcoal/75 transition-transform duration-300 ${NEIGHBOUR} ${
        next ? 'roomy:group-hover:translate-x-1' : 'roomy:group-hover:-translate-x-1'
      }`}
    >
      {next ? <ArrowRight size={18} strokeWidth={1.75} /> : <ArrowLeft size={18} strokeWidth={1.75} />}
    </span>
  );
  const name = <span className={`relative font-medium leading-[1.2] tracking-[-0.01em] text-charcoal ${NEIGHBOUR}`}>{to.title}</span>;
  return (
    <a
      href={`#${to.path}`}
      rel={dir}
      onClick={go}
      className={`group relative grid items-start gap-x-3 focus-visible:outline-none ${
        next ? 'grid-cols-[minmax(0,1fr)_auto] text-right md:col-start-2' : 'grid-cols-[auto_minmax(0,1fr)] text-left'
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 bg-background/80 opacity-0 transition-opacity duration-300 roomy:group-hover:opacity-100 group-focus-visible:opacity-100"
      />
      {next ? (
        <>
          {name}
          {arrow}
        </>
      ) : (
        <>
          {arrow}
          {name}
        </>
      )}
      <span className={`relative mt-1 text-[15px] italic text-charcoal/75 ${next ? 'col-start-1' : 'col-start-2'}`}>({to.label})</span>
    </a>
  );
};

/**
 * A project or a post, as it's read in the pane.
 *
 * Split in two (`split:`, an iPad on its side and up), its details are pinned in a column on the left, as tall as
 * the glass: Back and Home, its title as large as the column allows, the line under it, and at the foot its date,
 * role and tools. What's read scrolls on the right, its words and pictures at one width, a picture let
 * through running the column's whole width (see `.writing-flow` and Prose), with the pieces either side at the end. The piece fills the glass edge to edge, so the
 * pane's head steps aside for it (`ownHead`).
 *
 * Narrower, the same stacked: the pane's head as for any card, then the title, its details, what's read, and the
 * pieces either side. The reading progress is the pane's either way.
 */
const WritingLayout: React.FC<WritingLayoutProps> = (props) => {
  const { children } = props;
  const named = usePaneTitle();
  const { back, close } = usePaneActions();
  const { way, next: nextWay, wait } = usePieceMotion();
  const lead = pulled('title', way, nextWay, wait);
  const follow = pulled('rest', way, nextWay, wait);
  const piece = pieceAt(usePiecePath());
  const work = piece?.kind === 'work' ? piece.entry : undefined;
  const post = piece?.kind === 'writing' ? piece.entry : undefined;
  const isWork = piece ? piece.kind === 'work' : !!(props.role || props.tools);

  const title = props.title ?? piece?.entry.title;
  const subtitle = props.subtitle ?? work?.description ?? post?.excerpt;
  const date = props.date ?? piece?.entry.date;
  const category = props.category ?? piece?.entry.category;
  const role = props.role ?? work?.role;
  const readTime = props.readTime ?? post?.readTime;
  const tools = props.tools ?? piece?.entry.tools;
  const rows = (
    isWork
      ? [
          ['Date', date],
          ['Role', role],
        ]
      : [
          ['Date', date],
          ['Length', readTime],
          ['Category', category],
        ]
  ).filter((r): r is [string, string] => !!r[1]);

  const column = useRef<HTMLElement>(null);
  const room = useRef<HTMLDivElement>(null);
  const block = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useFitTitle({ block, heading, room, column }, [title, subtitle]);

  // Going, the card is held where the reader left it while the pane goes back to the top for the next — moved up by
  // as far as it was scrolled. A column pinned to the glass would then be carried up out of sight with it, so it's
  // held where it was instead. Before the card's own hold, which is laid out after this.
  const present = useIsPresent();
  useLayoutEffect(() => {
    const el = column.current;
    const scroller = el?.closest<HTMLElement>('[data-pane-scroll]');
    if (present || !el || !scroller || getComputedStyle(el).position !== 'sticky') return;
    el.style.position = 'relative';
    el.style.top = `${scroller.scrollTop}px`;
    // Chosen again before it had gone.
    return () => {
      el.style.position = el.style.top = '';
    };
  }, [present]);

  const prev = piece?.prev;
  const next = piece?.next;
  // Split in two, the piece takes back the pane's padding, to fill the glass edge to edge (`--pad-*`), and its
  // columns keep a closer room of their own (`--col-*`: its sides here, the rest by the glass's height in
  // index.css). The column is pinned above the padding's top too: a pinned box otherwise keeps clear of its scroll's
  // padding.
  const pad = {
    '--pad-top': HEAD_TOP,
    '--pad-x': PANE_PAD.sides,
    '--pad-bottom': PANE_PAD.bottom,
    '--col-x': 'clamp(20px, 2vw, 28px)',
  } as React.CSSProperties;

  return (
    <div
      style={pad}
      className="writing-piece font-switzer pb-24 pt-5 selection:bg-moss/20 selection:text-moss-light md:pt-8 split:-mx-[var(--pad-x)] split:-mb-[var(--pad-bottom)] split:-mt-[var(--pad-top)] split:grid split:min-h-[var(--pane-h)] split:grid-cols-[clamp(340px,30vw,460px)_minmax(0,1fr)] split:p-0"
    >
      <aside
        ref={column}
        className={`mx-auto mb-10 flex w-full max-w-[var(--measure)] flex-col border-b border-charcoal/10 pb-10 split:sticky split:top-[calc(var(--pad-top)*-1)] split:mb-0 split:h-[var(--pane-h)] split:max-w-none split:self-start split:overflow-hidden split:border-b-0 split:bg-[var(--info-paper)] split:px-[var(--col-x)] split:py-[var(--col-y)]`}
      >
        {/* Back at the left margin, Home at the right: a short row, each a finger's height reaching past it. The column
            never scrolls: all in it is sized to fit the glass's height, the title last (`useFitTitle`). */}
        <div className="hidden shrink-0 items-center justify-between split:flex split:h-[var(--col-head)]">
          <button type="button" onClick={back} className={`-ml-2 ${HEAD_LINK}`}>
            <ArrowLeft size={15} strokeWidth={1.75} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back
          </button>
          <button type="button" onClick={close} className={`-mr-2 ${HEAD_LINK}`}>
            Home
          </button>
        </div>
        <div aria-hidden="true" className={`hidden shrink-0 split:mt-[var(--col-head-rule)] split:block ${RULE}`} />

        {/* The room the title has: all that's left between the head and the details, split in two. */}
        <div ref={room} className="split:min-h-0 split:flex-1 split:pt-[var(--col-gap)]">
          <div ref={block}>
            {/* Size first: a word too long for a line breaks where its title has a soft hyphen (`Place&shy;marks`), and
                only there, alike in every browser — a browser's own hyphenation skips capitalised words, as titles' are. */}
            {title && (
              <motion.h1
                ref={heading}
                {...lead}
                {...named}
                className="font-medium leading-[0.95] tracking-[-0.02em] text-charcoal outline-none hyphens-manual [font-size:var(--title,64px)] [text-box:trim-start_cap_alphabetic] [text-wrap:balance]"
              >
                {title.split(/\s+/).map((word, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && ' '}
                    <span data-word="">
                      {word}
                    </span>
                  </React.Fragment>
                ))}
              </motion.h1>
            )}
            {subtitle && (
              // In proportion to the title, and split in two, no larger than the glass's height allows either.
              <motion.p
                {...follow}
                className="mt-[clamp(14px,calc(var(--title,64px)*0.18),24px)] text-[length:clamp(18px,calc(var(--title,64px)*0.18),24px)] font-medium leading-[1.3] tracking-[-0.01em] text-charcoal/75 [text-wrap:pretty] split:mt-[clamp(8px,min(calc(var(--title,64px)*0.18),var(--col-sub)),24px)] split:text-[length:clamp(14px,min(calc(var(--title,64px)*0.18),var(--col-sub)),24px)]">
                {subtitle}
              </motion.p>
            )}
          </div>
        </div>

        {(rows.length > 0 || !!tools?.length) && (
          <motion.div {...follow} className={`mt-8 shrink-0 pt-5 split:mt-[var(--col-gap)] split:pt-[var(--col-rule)] ${RULE}`}>
            {rows.length > 0 && <Details rows={rows} />}
            {!!tools?.length && (
              <>
                {rows.length > 0 && <div aria-hidden="true" className={`my-5 split:my-[var(--col-rule)] ${RULE}`} />}
                <Details
                  rows={[
                    [
                      'Tools',
                      <ul>
                        {tools.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>,
                    ],
                  ]}
                />
              </>
            )}
          </motion.div>
        )}
      </aside>

      {/* Split in two, what's read is on the glass, the scene showing through; the column beside it is solid. */}
      <motion.div {...follow} className="writing-column flex flex-col split:min-h-[var(--pane-h)]">
        <article className="writing-flow fluid-text-body font-light text-charcoal/85 split:pt-[var(--col-y)]">{children}</article>
        <div aria-hidden="true" className="h-16 shrink-0" />

        {(prev || next) && (
          // At the foot of the column, however short the piece; clear of the reading-progress ring in the corner.
          <nav
            aria-label={isWork ? 'More work' : 'More writing'}
            className={`mx-auto mt-auto grid w-full max-w-[var(--measure)] grid-cols-1 gap-x-10 gap-y-8 pt-8 md:grid-cols-2 split:mx-[var(--gutter)] split:w-auto split:max-w-none split:pb-[88px] ${RULE}`}
          >
            {prev && <Neighbour to={prev} dir="prev" />}
            {next && <Neighbour to={next} dir="next" />}
          </nav>
        )}
      </motion.div>
    </div>
  );
};

export default WritingLayout;
