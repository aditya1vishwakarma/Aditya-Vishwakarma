import { lazy, type ComponentType } from 'react';
import { PHOTOS } from '../../constants';

/**
 * The site is one page, and its address says what the pane shows: nothing
 * (home), a section's list, or a piece open to read. Work and the blog keep
 * the old site's addresses, so every link to them still lands.
 */

export type SectionId = 'about' | 'work' | 'writing' | 'photos' | 'contact';

export const SECTION_PATHS: Record<SectionId, string> = {
  about: '/about',
  work: '/works',
  writing: '/blog',
  photos: '/photos',
  contact: '/contact',
};

/** Each piece is loaded apart from the page: when it's opened, or ahead of that once the page is idle (`prefetchPieces`). */
const loaders: (() => Promise<unknown>)[] = [];
const page = (load: () => Promise<{ default: ComponentType }>) => {
  loaders.push(load);
  return lazy(load);
};

/** The museum's code, loaded apart from the page: when it's opened, or ahead of that once the page is idle. Its images wait until it's opened. */
export const loadMuseum = () => import('../../pages/MoodBoardMuseumPage');

/** Start every piece's code loading, and the museum's, for the page to call when it's idle. A failure here is put right on opening one. */
export const prefetchPieces = () => {
  for (const load of [...loaders, loadMuseum]) load().catch(() => {});
};

/** Every project and post, by its address, and the section whose list it's in. */
const PIECES: Record<string, { section: SectionId; Page: ComponentType }> = {
  '/works/placemarks': { section: 'work', Page: page(() => import('../../pages/works/Placemarks')) },
  '/works/djx-project': { section: 'work', Page: page(() => import('../../pages/works/DJXProject')) },
  '/works/locally-hosted-apps': { section: 'work', Page: page(() => import('../../pages/works/LocallyHostedApps')) },
  '/works/SpacialMusic': { section: 'work', Page: page(() => import('../../pages/works/SpacialMusic')) },
  '/works/AMDesktopRed': { section: 'work', Page: page(() => import('../../pages/works/AMDesktopRed')) },
  '/works/photo-captions': { section: 'work', Page: page(() => import('../../pages/works/PhotoCaptions')) },
  '/blog/app-icon-design': { section: 'writing', Page: page(() => import('../../pages/blog/AppIconDesign')) },
  '/blog/curation': { section: 'writing', Page: page(() => import('../../pages/blog/Curation')) },
  '/blog/nostalgia': { section: 'writing', Page: page(() => import('../../pages/blog/Nostalgia')) },
};

/** Addresses match whatever their case, as the old site's did. */
const PIECES_BY_LOWER = new Map(Object.entries(PIECES).map(([path, piece]) => [path.toLowerCase(), piece]));

/** One photo, open on its own: counted from 1. */
export const photoPath = (index: number) => `${SECTION_PATHS.photos}/${index + 1}`;

export type PaneRoute =
  | { mode: 'home' }
  | { mode: 'select'; section: SectionId }
  | { mode: 'view'; section: SectionId; path: string; Page: ComponentType }
  | { mode: 'photo'; section: 'photos'; path: string; index: number };

/** What the pane shows at an address, or null for one the site doesn't have. */
export const routeFor = (pathname: string): PaneRoute | null => {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return { mode: 'home' };
  const lower = path.toLowerCase();
  for (const [section, at] of Object.entries(SECTION_PATHS) as [SectionId, string][]) {
    if (lower === at) return { mode: 'select', section };
  }
  const piece = PIECES_BY_LOWER.get(lower);
  if (piece) return { mode: 'view', section: piece.section, path, Page: piece.Page };
  const photo = lower.match(/^\/photos\/(\d+)$/);
  if (photo) {
    const index = Number(photo[1]) - 1;
    if (index >= 0 && index < PHOTOS.length) return { mode: 'photo', section: 'photos', path, index };
  }
  return null;
};
