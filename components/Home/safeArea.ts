import { useSyncExternalStore } from 'react';

/**
 * The screen's safe area: how far in from each edge a phone's status bar,
 * notch, rounded corners and home bar reach. The page is drawn edge to edge
 * (`viewport-fit=cover` in index.html), so the scene runs under all of them,
 * and whatever's placed on the page's margins starts this much further in.
 * All zero on a screen without them.
 */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const NONE: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

let probe: HTMLDivElement | null = null;
let now: Insets = NONE;
let read = false;
const listeners = new Set<() => void>();

/** Read off an element padded by the insets: CSS knows them, script doesn't. */
const measure = () => {
  if (!probe) {
    probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText =
      'position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;' +
      'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    document.body.append(probe);
  }
  const s = getComputedStyle(probe);
  const next = { top: parseFloat(s.paddingTop) || 0, right: parseFloat(s.paddingRight) || 0, bottom: parseFloat(s.paddingBottom) || 0, left: parseFloat(s.paddingLeft) || 0 };
  read = true;
  if (next.top === now.top && next.right === now.right && next.bottom === now.bottom && next.left === now.left) return false;
  now = next.top || next.right || next.bottom || next.left ? next : NONE;
  return true;
};

// Turning the phone moves the notch to a side: read again whenever the window changes shape.
const remeasure = () => measure() && listeners.forEach((listen) => listen());

const subscribe = (listen: () => void) => {
  if (listeners.size === 0) {
    window.addEventListener('resize', remeasure);
    window.addEventListener('orientationchange', remeasure);
  }
  listeners.add(listen);
  return () => {
    listeners.delete(listen);
    if (listeners.size === 0) {
      window.removeEventListener('resize', remeasure);
      window.removeEventListener('orientationchange', remeasure);
    }
  };
};

export const useSafeArea = () =>
  useSyncExternalStore(subscribe, () => {
    if (!read) measure();
    return now;
  });
