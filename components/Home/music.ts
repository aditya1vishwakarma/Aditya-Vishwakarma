import { useSyncExternalStore } from 'react';

/**
 * The site's music: muted on every visit, until the visitor turns it on from
 * the controls — and that press is what lets a browser play sound at all. On,
 * the song streams from R2 and loops; muted, it pauses where it is.
 */

/** The song, on R2. Empty until there is one: the switch still works, and nothing plays. */
export const MUSIC_SRC = '';

let muted = true;
let audio: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();

export const setMuted = (next: boolean) => {
  muted = next;
  if (MUSIC_SRC) {
    // Fetched only once it's first asked for, and then streamed as it plays.
    audio ??= Object.assign(new Audio(MUSIC_SRC), { loop: true, preload: 'none' });
    if (muted) audio.pause();
    else audio.play().catch(() => setMuted(true));
  }
  listeners.forEach((listen) => listen());
};

export const toggleMuted = () => setMuted(!muted);

const subscribe = (listen: () => void) => {
  listeners.add(listen);
  return () => listeners.delete(listen);
};

export const useMuted = () => useSyncExternalStore(subscribe, () => muted);
