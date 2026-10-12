import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { isMobileViewport } from '../../constants';
import type { MoodBoardItem } from '../../types';
import { DETAIL_TEXTURE_MAX, TEXTURE_MAX } from './museumConfig';

export interface PaneTexture {
  texture: THREE.Texture;
  aspect: number;
}

const isVideo = (url: string) => /\.(mp4|webm)$/i.test(url);

/**
 * At most this many full-size photographs held decoded at once.
 *
 * The board's AVIFs are small to download but enormous to decode — the
 * largest is 36 megapixels, 146 MB as a bitmap, and the thirty together come
 * to well over half a gigabyte. Decoding them all at once is what made Safari
 * reload the page. Two at a time keeps the peak to a couple of photos.
 */
const DECODE_SLOTS = 2;
/** Phones give a tab far less memory, so they decode one at a time. */
const decodeSlots = () => (isMobileViewport() ? 1 : DECODE_SLOTS);

/** Run tasks with no more than `slots` in flight; a finished task hands its slot straight on. */
function slotQueue(slots: number) {
  let active = 0;
  const waiting: (() => void)[] = [];
  return async <T,>(task: () => Promise<T>): Promise<T> => {
    if (active < slots) active++;
    else await new Promise<void>((resolve) => waiting.push(resolve));
    try {
      return await task();
    } finally {
      const next = waiting.shift();
      if (next) next();
      else active--;
    }
  };
}

const loadImage = (src: string, crossOrigin: boolean) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous'; // WebGL can't sample a tainted image
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/**
 * Decode an image and redraw it at most `max` px on its long side, then let
 * the full-size bitmap go at once rather than whenever the collector gets to it.
 */
async function shrink(src: string, crossOrigin: boolean, max: number): Promise<PaneTexture> {
  const img = await loadImage(src, crossOrigin);
  try {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const k = Math.min(1, max / Math.max(w, h));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * k));
    c.height = Math.max(1, Math.round(h * k));
    const g = c.getContext('2d')!;
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, c.width, c.height);
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return { texture, aspect: w / Math.max(1, h) };
  } finally {
    img.onload = img.onerror = null;
    img.removeAttribute('src');
  }
}

/**
 * Load every board image as a shelf-sized texture, with its aspect ratio.
 *
 * Images are fetched as blobs with the cache bypassed, as the ring view does:
 * the mobile grid's plain <img> tags leave non-CORS entries in the HTTP
 * cache, and a texture upload from one of those fails. Downloads run side by
 * side; decoding queues for one of a couple of slots. The blob is kept, so a
 * selected pane can be redrawn sharper without another download.
 */
export function useMuseumTextures(items: MoodBoardItem[]) {
  const [textures, setTextures] = useState<Map<string, PaneTexture>>(new Map());
  const [loadedCount, setLoadedCount] = useState(0);
  const sources = useRef(new Map<string, string>());
  const blobUrls = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const abort = new AbortController();
    const decode = slotQueue(decodeSlots());
    const map = new Map<string, PaneTexture>();
    let count = 0;
    const settle = () => {
      count++;
      if (cancelled) return;
      setLoadedCount(count);
      setTextures(new Map(map));
    };

    const loadVideo = (url: string) => {
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.loop = vid.muted = vid.playsInline = vid.autoplay = true;
      vid.onloadeddata = () => {
        if (cancelled) return;
        const tex = new THREE.VideoTexture(vid);
        tex.colorSpace = THREE.SRGBColorSpace;
        map.set(url, { texture: tex, aspect: vid.videoWidth / Math.max(1, vid.videoHeight) });
        settle();
      };
      vid.onerror = settle;
      vid.src = url;
      vid.load();
      vid.play().catch(() => {});
    };

    const loadPhoto = async (url: string) => {
      let src = url;
      let crossOrigin = true;
      try {
        const res = await fetch(url, { mode: 'cors', cache: 'reload', signal: abort.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (cancelled) return;
        src = URL.createObjectURL(blob);
        crossOrigin = false;
        blobUrls.current.push(src);
      } catch {
        if (cancelled) return;
        // Network or CORS trouble with fetch — fall back to a direct CORS image load.
      }
      sources.current.set(url, src);
      try {
        const loaded = await decode(() => (cancelled ? Promise.resolve(null) : shrink(src, crossOrigin, TEXTURE_MAX)));
        if (!loaded) return;
        if (cancelled) return loaded.texture.dispose();
        map.set(url, loaded);
      } catch {
        // A broken image must never wedge the loader; its pane stays blank.
      }
      settle();
    };

    items.forEach((item) => (isVideo(item.imageUrl) ? loadVideo(item.imageUrl) : loadPhoto(item.imageUrl)));

    return () => {
      cancelled = true;
      abort.abort();
      map.forEach(({ texture }) => {
        if ((texture as THREE.VideoTexture).isVideoTexture) {
          const vid = texture.image as HTMLVideoElement;
          vid.pause();
          vid.removeAttribute('src');
          vid.load();
        }
        texture.dispose();
      });
      blobUrls.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrls.current = [];
      sources.current.clear();
    };
  }, [items]);

  /** A sharper copy for the selected pane. The caller owns (and disposes) it. */
  const loadDetail = useCallback(async (item: MoodBoardItem): Promise<THREE.Texture | null> => {
    const src = sources.current.get(item.imageUrl);
    if (!src || isVideo(item.imageUrl)) return null;
    try {
      return (await shrink(src, src === item.imageUrl, DETAIL_TEXTURE_MAX)).texture;
    } catch {
      return null;
    }
  }, []);

  return { textures, loadedCount, total: items.length, loadDetail };
}
