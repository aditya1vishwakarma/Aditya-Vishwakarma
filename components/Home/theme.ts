import { useLayoutEffect, useSyncExternalStore } from 'react';

/**
 * The site's look, light or dark: light, until the visitor turns it over from
 * the controls. Kept in this browser, so it's as they left it next visit. The
 * choice is made on the page's root (data-theme), where index.css turns the
 * colours over; nothing else needs to know. The museum keeps its own.
 */
export type SiteTheme = 'light' | 'dark';

const KEY = 'site-theme';

const stored = (): SiteTheme => {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

let theme: SiteTheme = stored();
const listeners = new Set<() => void>();

export const toggleTheme = () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Storage turned off, or full: it's turned for this visit only.
  }
  listeners.forEach((listen) => listen());
};

const subscribe = (listen: () => void) => {
  listeners.add(listen);
  return () => listeners.delete(listen);
};

export const useTheme = () => useSyncExternalStore(subscribe, () => theme);

/**
 * Puts the look on the page's root while the home page is up, before its
 * first frame, and takes it off on leaving: the museum is a room of its own,
 * with its own light and dark.
 */
export const usePaintTheme = () => {
  const current = useTheme();
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = current;
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [current]);
};
