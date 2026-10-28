import { useSyncExternalStore } from 'react';

/**
 * Which side of a phone's screen the menu stands on: the right, until the
 * visitor swaps it from the controls. Kept in this browser, so it's where they
 * left it next visit. Only 'left' is read back as left; anything else in its
 * place, or no storage at all, is the right.
 */
export type MenuSide = 'left' | 'right';

const KEY = 'menu-side';

const stored = (): MenuSide => {
  try {
    return localStorage.getItem(KEY) === 'left' ? 'left' : 'right';
  } catch {
    return 'right';
  }
};

let side: MenuSide = stored();
const listeners = new Set<() => void>();

export const swapMenuSide = () => {
  side = side === 'left' ? 'right' : 'left';
  try {
    localStorage.setItem(KEY, side);
  } catch {
    // Storage turned off, or full: it's swapped for this visit only.
  }
  listeners.forEach((listen) => listen());
};

const subscribe = (listen: () => void) => {
  listeners.add(listen);
  return () => listeners.delete(listen);
};

export const useMenuSide = () => useSyncExternalStore(subscribe, () => side);
