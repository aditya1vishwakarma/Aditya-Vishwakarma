import { createContext, useContext } from 'react';
import { BLOG_POSTS, PROJECTS } from '../../constants';
import type { BlogPost, Project } from '../../types';

/**
 * The address of the piece open in the pane, handed down with it (`HomeHero`). It's part of the card, so a piece
 * on its way out keeps its own, rather than reading the address the next one has already taken.
 */
export const PiecePath = createContext<string | null>(null);
export const usePiecePath = () => useContext(PiecePath);

/** A way to the piece before or after, in the order its list has them. */
export interface PieceLink {
  title: string;
  path: string;
  /** Which list it's in: Selected or Un-Selected Works, or a post's category. */
  label: string;
}

export type Piece =
  | { kind: 'work'; entry: Project; prev?: PieceLink; next?: PieceLink }
  | { kind: 'writing'; entry: BlogPost; prev?: PieceLink; next?: PieceLink };

/** Work, in its list's order: the selected, then the un-selected (`WorkSection` in sections.tsx). */
const WORKS = [...PROJECTS.filter((p) => p.isSelected), ...PROJECTS.filter((p) => !p.isSelected && !p.isRedirect)];
const UNSELECTED = PROJECTS.find((p) => p.isRedirect)?.title ?? 'Un-Selected Works';
const workLink = (p?: Project): PieceLink | undefined => p && { title: p.title, path: p.path, label: p.isSelected ? 'Selected Works' : UNSELECTED };
const postLink = (p?: BlogPost): PieceLink | undefined => p && { title: p.title, path: p.path, label: p.category };

/** The piece at an address, whatever its case, as the routes match: its entry in its list, and those either side. */
export const pieceAt = (path: string | null): Piece | null => {
  if (!path) return null;
  const at = path.replace(/\/+$/, '').toLowerCase();
  const w = WORKS.findIndex((p) => p.path.toLowerCase() === at);
  if (w >= 0) return { kind: 'work', entry: WORKS[w], prev: workLink(WORKS[w - 1]), next: workLink(WORKS[w + 1]) };
  const b = BLOG_POSTS.findIndex((p) => p.path.toLowerCase() === at);
  if (b >= 0) return { kind: 'writing', entry: BLOG_POSTS[b], prev: postLink(BLOG_POSTS[b - 1]), next: postLink(BLOG_POSTS[b + 1]) };
  return null;
};
