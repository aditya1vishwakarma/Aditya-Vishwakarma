
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motion as motionComponent, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { MOOD_BOARD } from '../constants';
import type { MoodBoardItem } from '../types';
import MoodBoardCard, {
  GlassRefractionFilter,
  GLASS_EDGE,
  GLASS_TINT_DARK,
  GLASS_BACKDROP,
} from '../components/UI/MoodBoardCard';
import Squircle from '../components/UI/Squircle';

const { Link } = ReactRouterDOM as any;
const motion = motionComponent as any;

// This page paints its own cream. It also has to be the *canvas* colour while the
// page is open — Safari extends the canvas behind its chrome, and the fixed layer
// below can't reach there.
const PAGE_BG = '#FBFCF6';

/* ─────────────────────────────────────────────
 * Pre-load all images & create THREE.Textures
 * before the 3D scene even mounts.
 *
 * Strategy: fetch() every image as a blob during
 * the loading screen. This bypasses the browser's
 * image cache (which can hold stale non-CORS
 * entries) and guarantees proper CORS handling.
 * Blob URLs are kept alive in a ref until unmount
 * so Three.js can upload them to the GPU lazily.
 * ───────────────────────────────────────────── */
function usePreloadTextures(items: MoodBoardItem[]) {
  const [textures, setTextures] = useState<Map<string, THREE.Texture>>(new Map());
  const [loadedCount, setLoadedCount] = useState(0);
  const blobUrlsRef = useRef<string[]>([]); // Keep blobs alive until unmount
  const total = items.length;

  useEffect(() => {
    let cancelled = false;
    const map = new Map<string, THREE.Texture>();
    let count = 0;

    const onDone = () => {
      count++;
      if (!cancelled) {
        setLoadedCount(count);
        setTextures(new Map(map));
      }
    };

    // Helper: create a Three.js texture from any img element
    const makeTexture = (img: HTMLImageElement, srgb: boolean) => {
      const tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    items.forEach((item) => {
      const isVideo = item.imageUrl.toLowerCase().match(/\.(mp4|webm)$/i);

      if (isVideo) {
        const vid = document.createElement('video');
        vid.crossOrigin = 'anonymous';
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.autoplay = true;

        // Use onloadeddata or oncanplay to trigger completion
        vid.onloadeddata = () => {
          if (cancelled) return;
          const tex = new THREE.VideoTexture(vid);
          tex.colorSpace = THREE.SRGBColorSpace;
          map.set(item.imageUrl, tex);
          onDone();
        };

        vid.onerror = () => {
          onDone();
        };

        vid.src = item.imageUrl;
        vid.load();
        vid.play().catch(() => { }); // Attempt autoplay to ensure it buffers properly
      } else {
        // Fetch as blob so we bypass the browser image cache entirely.
        // This guarantees we always get a fresh CORS response, not a stale
        // cached entry that lacks Access-Control headers.
        fetch(item.imageUrl, { mode: 'cors', cache: 'reload' })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.blob();
          })
          .then((blob) => {
            if (cancelled) return;
            const blobUrl = URL.createObjectURL(blob);
            // Store the blob URL so it stays alive until this component
            // unmounts — Three.js uploads textures to the GPU lazily,
            // and the img element must remain valid until that happens.
            blobUrlsRef.current.push(blobUrl);
            const img = new Image();
            img.onload = () => {
              if (cancelled) return;
              map.set(item.imageUrl, makeTexture(img, true));
              onDone();
            };
            img.onerror = () => onDone();
            img.src = blobUrl;
          })
          .catch(() => {
            // fetch failed (network / CORS) — fall back to direct img load
            if (cancelled) return onDone();
            const img = new Image();
            img.crossOrigin = 'anonymous'; // MUST HAVE THIS FOR WEBGL
            img.onload = () => {
              if (cancelled) return;
              map.set(item.imageUrl, makeTexture(img, false));
              onDone();
            };
            img.onerror = () => onDone();
            img.src = item.imageUrl;
          });
      }
    });

    return () => {
      cancelled = true;
      // Revoke all blob URLs now that we're done
      blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrlsRef.current = [];
      map.forEach((tex) => {
        if ((tex as any).isVideoTexture && tex.image) {
          const vid = tex.image as HTMLVideoElement;
          vid.pause();
          vid.removeAttribute('src');
          vid.load();
        }
        tex.dispose();
      });
    };
  }, []); // Only run once

  return { textures, loadedCount, total };
}

/* ─────────────────────────────────────────────
 * Pre-load every board image and record its intrinsic aspect ratio.
 * This is the mobile counterpart to the texture preloader above — the grid
 * needs pixels and dimensions, not GPU textures.
 *
 * The ratios matter as much as the bytes. An <img> with `height: auto` and no
 * declared ratio contributes ZERO height until its bytes land, so a column of
 * not-yet-loaded tiles collapses the scroll container to nothing — and a
 * container with no scroll range can never bring the next lazy image into view
 * to load it. That deadlock is why the grid went dead after the tap view
 * remounted it: every <img> restarted at zero height at once.
 *
 * Plain <img> loads rather than fetch(), so this rides the browser cache
 * instead of bypassing it the way the WebGL path has to.
 * ───────────────────────────────────────────── */
function usePreloadImages(items: MoodBoardItem[]) {
  const [ratios, setRatios] = useState<Map<string, number>>(new Map());
  const [loadedCount, setLoadedCount] = useState(0);
  // Holding the elements keeps the decoded bitmaps warm for the page's lifetime.
  const keepAliveRef = useRef<HTMLImageElement[]>([]);
  const total = items.length;

  useEffect(() => {
    if (total === 0) return;
    let cancelled = false;
    const map = new Map<string, number>();
    let count = 0;

    const settle = () => {
      if (cancelled) return;
      count++;
      setLoadedCount(count);
      setRatios(new Map(map));
    };

    items.forEach((item) => {
      const img = new Image();
      keepAliveRef.current.push(img);
      img.decoding = 'async';
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          map.set(item.imageUrl, img.naturalWidth / img.naturalHeight);
        }
        settle();
      };
      // A broken URL counts as settled — one 404 must never wedge the loader.
      img.onerror = settle;
      img.src = item.imageUrl;
    });

    return () => {
      cancelled = true;
      keepAliveRef.current = [];
    };
  }, [total]); // items is a module constant; length is a sufficient identity

  return { ratios, loadedCount, total };
}

/**
 * Box to reserve for an image. Falls back to the coarse orientation in the data
 * until (or if) a real measurement arrives — anything is better than zero.
 */
const ratioFor = (item: MoodBoardItem, ratios: Map<string, number>) =>
  ratios.get(item.imageUrl) ?? (item.orientation === 'portrait' ? 3 / 4 : 4 / 3);

/* ─────────────────────────────────────────────
 * Pane — receives a pre-created texture (or null)
 * ───────────────────────────────────────────── */
interface PaneProps {
  item: MoodBoardItem;
  texture: THREE.Texture | null;
  angle: number;
  radius: number;
  isSelected: boolean;
  onSelect: () => void;
}

const Pane: React.FC<PaneProps> = ({ item, texture, angle, radius, isSelected, onSelect }) => {
  const paneW = 3.0;
  const paneH = 2.2;

  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const tangent = angle + Math.PI / 2;

  const scale = isSelected ? 1.12 : 1;
  const borderColor = isSelected ? '#3F6D0D' : '#D0D0C8';

  return (
    <group position={[x, 0, z]} rotation={[0, -tangent, 0]}>
      {/* Border / frame */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} scale={scale}>
        <planeGeometry args={[paneW + 0.14, paneH + 0.14]} />
        <meshBasicMaterial color={borderColor} toneMapped={false} />
      </mesh>

      {/* Image pane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        scale={scale}
        userData={{ moodBoardItem: item }}
      >
        <planeGeometry args={[paneW, paneH]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            side={THREE.FrontSide}
            metalness={0.02}
            roughness={0.5}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial
            color="#E8E8E0"
            metalness={0.02}
            roughness={0.5}
          />
        )}
      </mesh>

      {/* Selection glow */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} scale={scale}>
          <planeGeometry args={[paneW + 0.5, paneH + 0.5]} />
          <meshBasicMaterial color="#3F6D0D" transparent opacity={0.1} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

/* ─────────────────────────────────────────────
 * Rotating Ring — receives texture map
 * ───────────────────────────────────────────── */
interface RingProps {
  speed: number;
  selectedId: string | null;
  onSelectItem: (item: MoodBoardItem | null) => void;
  textures: Map<string, THREE.Texture>;
  items: MoodBoardItem[];
}

const RotatingRing: React.FC<RingProps> = ({ speed, selectedId, onSelectItem, textures, items }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const count = items.length;
  const radius = Math.max(6, count * 1.2);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed;
    }
  });

  return (
    <group ref={groupRef}>
      {items.map((item, i) => {
        const angle = (i / count) * Math.PI * 2;
        return (
          <Pane
            key={item.id}
            item={item}
            texture={textures.get(item.imageUrl) ?? null}
            angle={angle}
            radius={radius}
            isSelected={selectedId === item.id}
            onSelect={() => onSelectItem(selectedId === item.id ? null : item)}
          />
        );
      })}

      {/* Subtle ring guide */}
      <mesh rotation={[0, 0, 0]} position={[0, -0.04, 0]}>
        <torusGeometry args={[radius, 0.015, 8, 128]} />
        <meshBasicMaterial color="#3F6D0D" transparent opacity={0.00} toneMapped={false} />
      </mesh>

      {/* Center dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color="#3F6D0D" transparent opacity={0.12} toneMapped={false} />
      </mesh>
    </group>
  );
};

/* ─────────────────────────────────────────────
 * Continuous Raycast — runs every frame
 * ───────────────────────────────────────────── */
interface ContinuousRaycastProps {
  onHover: (item: MoodBoardItem | null) => void;
}

const ContinuousRaycast: React.FC<ContinuousRaycastProps> = ({ onHover }) => {
  const { camera, pointer, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const lastIdRef = useRef<string | null>(null);

  useFrame(() => {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let found: MoodBoardItem | null = null;
    for (const hit of intersects) {
      const item = hit.object.userData?.moodBoardItem as MoodBoardItem | undefined;
      if (item) { found = item; break; }
    }

    const id = found?.id ?? null;
    if (id !== lastIdRef.current) {
      lastIdRef.current = id;
      onHover(found);
    }
  });

  return null;
};

/* ─────────────────────────────────────────────
 * Camera
 * ───────────────────────────────────────────── */
const TopDownCamera: React.FC = () => {
  const { camera, size } = useThree();

  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    const aspect = size.width / size.height;
    const count = MOOD_BOARD.length;
    const radius = Math.max(6, count * 1.2);
    const frustum = radius * 1.15;
    cam.left = -frustum * aspect;
    cam.right = frustum * aspect;
    cam.top = frustum;
    cam.bottom = -frustum;
    cam.near = 0.1;
    cam.far = 200;
    cam.position.set(0, 50, 0);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }, [camera, size]);

  return null;
};

/* ─────────────────────────────────────────────
 * Page — orchestrates loading → scene
 * ───────────────────────────────────────────── */
const MoodBoardV2Page: React.FC = () => {
  // Detect mobile once on mount. Each platform preloads what it actually renders:
  // desktop needs GPU textures for the ring, mobile needs decoded images and their
  // dimensions for the grid. Only one of the two ever runs.
  const [isMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );

  const texturePreload = usePreloadTextures(isMobile ? [] : MOOD_BOARD);
  const imagePreload = usePreloadImages(isMobile ? MOOD_BOARD : []);

  const { textures } = texturePreload;
  const { ratios } = imagePreload;
  const { loadedCount, total } = isMobile ? imagePreload : texturePreload;
  const progress = total > 0 ? (loadedCount / total) * 100 : 100;

  const [isReady, setIsReady] = useState(false);
  const [speed, setSpeed] = useState(0.05);
  const [selectedItem, setSelectedItem] = useState<MoodBoardItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<MoodBoardItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'circle' | 'grid'>('grid');
  // Mobile-only layout: 2-column masonry of images (tap to expand) vs. the
  // original single scrollable list of full cards.
  const [mobileLayout, setMobileLayout] = useState<'masonry' | 'list'>('masonry');
  const [expandedItem, setExpandedItem] = useState<MoodBoardItem | null>(null);
  const [gridItems] = useState<MoodBoardItem[]>(() => [...MOOD_BOARD].sort(() => Math.random() - 0.5));

  // Smooth the progress for the loading bar
  const animatedProgress = useSpring(progress, { stiffness: 50, damping: 20 });

  // When loading completes, wait a beat then reveal.
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setIsReady(true), isMobile ? 400 : 800);
      return () => clearTimeout(timer);
    }
    // Stall guard: this effect re-arms on every tick of progress, so the timer only
    // fires if loading goes quiet for 8s. A hung request can't trap the page behind
    // the loader — and thanks to the reserved ratio boxes, revealing mid-load still
    // gives a correctly-sized, fully scrollable grid.
    const bail = setTimeout(() => setIsReady(true), 8000);
    return () => clearTimeout(bail);
  }, [progress, isMobile]);

  /* ─── Edge-to-edge, scoped to this page ───────────────────────
   * Two things have to be true for the board to fill the screen in mobile Safari:
   *
   *   1. viewport-fit=cover, or Safari insets the page above the status bar and below
   *      the toolbar — the two bands framing the content.
   *   2. The document canvas has to be this page's cream. Safari extends the canvas
   *      colour behind its chrome, and a `fixed` layer can never paint up there.
   *
   * Both are document-level, and the rest of the site doesn't want either — so they're
   * applied on mount and fully reverted on unmount rather than living in index.html.
   * Safari doesn't always re-evaluate viewport-fit on a live meta change; when it
   * doesn't, (2) still lands, so the strips take the page's cream and read seamless.
   * The fallback is a flat page, never the two-tone bands.
   * ───────────────────────────────────────────── */
  useEffect(() => {
    const html = document.documentElement;
    const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    const prevViewport = viewport?.content;
    const prevHtmlBg = html.style.backgroundColor;

    // The site has no theme-color tag — add one for this page and take it away after.
    let theme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    const themeIsOurs = !theme;
    const prevTheme = theme?.content;
    if (!theme) {
      theme = document.createElement('meta');
      theme.name = 'theme-color';
      document.head.appendChild(theme);
    }

    if (viewport) viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    theme.content = PAGE_BG;
    html.style.backgroundColor = PAGE_BG;

    return () => {
      if (viewport && prevViewport !== undefined) viewport.content = prevViewport;
      if (themeIsOurs) theme?.remove();
      else if (theme && prevTheme !== undefined) theme.content = prevTheme;
      html.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  const handleSelectItem = useCallback((item: MoodBoardItem | null) => {
    setSelectedItem(item);
  }, []);

  const handleHover = useCallback((item: MoodBoardItem | null) => {
    setHoveredItem(item);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div
      className="fixed inset-0 w-screen overflow-hidden select-none"
      style={{
        background: PAGE_BG,
        // Full-bleed: 100lvh is the viewport with Safari's chrome collapsed, so the
        // layer stays edge to edge (content runs under the bars) instead of resizing
        // as the toolbar shows and hides. h-screen would have been over-constrained
        // against inset-0 anyway.
        height: '100vh',
        minHeight: '100lvh',
      }}
      onMouseMove={handleMouseMove}
    >
      {/* SVG displacement filter for glass refraction (mounted once). */}
      <GlassRefractionFilter />

      {/* ──── LOADING OVERLAY ──── */}
      <AnimatePresence>
        {!isReady && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: '#FBFCF6' }}
          >
            <div className="relative text-center flex flex-col items-center">
              {/* Large percentage */}
              <motion.div
                className="font-serif italic font-medium text-charcoal/90 leading-none"
                style={{ fontSize: 'clamp(64px, 12vw, 180px)' }}
              >
                {Math.round(progress)}%
              </motion.div>

              {/* Progress bar */}
              <div className="mt-6 overflow-hidden h-[2px] w-40 bg-charcoal/10 rounded-full relative">
                <motion.div
                  style={{ width: `${progress}%` }}
                  className="absolute inset-0 bg-[#3F6D0D] rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── TOP BAR ──── */}
      {/* Steps aside while the tap view is open — its close chip takes the Home pill's
          slot, and two chips stacked in one corner reads as clutter. */}
      <div className={`fixed top-0 left-0 right-0 z-50 flex flex-row items-start md:items-center justify-between px-5 md:px-8 pb-5 md:pb-6 pt-[calc(1.25rem_+_env(safe-area-inset-top))] md:pt-[calc(1.5rem_+_env(safe-area-inset-top))] pointer-events-none gap-4 transition-opacity duration-300 ${expandedItem ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pointer-events-auto">

          {/* Mobile Layout Toggle — masonry image grid vs. single list.
              Hidden on desktop, where the Ring/Grid toggle is used instead. */}
          <div className="flex md:hidden items-center gap-1 h-[40px] px-1 bg-white/50 rounded-[13px] border border-charcoal/10 backdrop-blur-xl shadow-lg">
            <button
              onClick={() => setMobileLayout('masonry')}
              aria-label="Grid view"
              className={`relative flex items-center justify-center h-[32px] w-[38px] rounded-[9px] transition-colors duration-300 ${mobileLayout === 'masonry' ? 'text-charcoal' : 'text-charcoal/40'
                }`}
            >
              {mobileLayout === 'masonry' && (
                <motion.div
                  layoutId="mobileTogglePill"
                  className="absolute inset-0 bg-white rounded-[9px] shadow-sm"
                  transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                />
              )}
              <svg className="relative z-10" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7.5" height="8.5" rx="2" />
                <rect x="13.5" y="3" width="7.5" height="12" rx="2" />
                <rect x="3" y="14" width="7.5" height="7" rx="2" />
                <rect x="13.5" y="17.5" width="7.5" height="3.5" rx="1.6" />
              </svg>
            </button>
            <button
              onClick={() => setMobileLayout('list')}
              aria-label="List view"
              className={`relative flex items-center justify-center h-[32px] w-[38px] rounded-[9px] transition-colors duration-300 ${mobileLayout === 'list' ? 'text-charcoal' : 'text-charcoal/40'
                }`}
            >
              {mobileLayout === 'list' && (
                <motion.div
                  layoutId="mobileTogglePill"
                  className="absolute inset-0 bg-white rounded-[9px] shadow-sm"
                  transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                />
              )}
              <svg className="relative z-10" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="4" width="18" height="7" rx="2.2" />
                <rect x="3" y="13" width="18" height="7" rx="2.2" />
              </svg>
            </button>
          </div>

          {/* View Toggle — Ring is disabled on mobile, so hide the toggle there */}
          <div className="hidden md:flex items-center bg-white/50 p-1 rounded-full border border-charcoal/10 backdrop-blur-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'grid'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-charcoal/60 hover:text-charcoal/90'
                }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('circle')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'circle'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-charcoal/60 hover:text-charcoal/90'
                }`}
            >
              Ring
            </button>
          </div>

          <div className={`flex items-center gap-3 transition-opacity duration-300 ${viewMode === 'grid' ? 'opacity-0 pointer-events-none hidden md:flex' : 'opacity-100 pointer-events-auto flex'}`}>
            {/* Turtle (slow) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/30 flex-shrink-0"><path d="m12 10 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a8 8 0 1 0-16 0v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3l2-4h4Z" /><path d="M4.82 7.9 8 10" /><path d="M15.18 7.9 12 10" /><path d="M16.93 10H20a2 2 0 0 1 0 4H2" /></svg>

            <input
              type="range"
              min="0"
              max="0.64"
              step="0.01"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="mood-slider w-28 h-[2px] appearance-none bg-charcoal/15 rounded-full outline-none cursor-pointer"
            />

            {/* Rabbit (fast) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/30 flex-shrink-0"><path d="M13 16a3 3 0 0 1 2.24 5" /><path d="M18 12h.01" /><path d="M18 21h-8a4 4 0 0 1-4-4 7 7 0 0 1 7-7h.2L9.6 6.4a1 1 0 1 1 2.8-2.8L15.8 7h.2c3.3 0 6 2.7 6 6v1a2 2 0 0 1-2 2h-1a3 3 0 0 0-3 3" /><path d="M20 8.54V4a2 2 0 1 0-4 0v3" /><path d="M7.612 12.524a3 3 0 1 0-1.6 4.3" /></svg>
          </div>
        </div>

        <Link
          to="/#about"
          className="pointer-events-auto flex items-center justify-center text-center min-h-[40px] md:min-h-0 min-w-[80px] md:min-w-[120px] font-serif italic font-medium text-base md:text-2xl px-4 md:px-6 py-1.5 md:py-3 text-charcoal bg-white/50 border border-charcoal/10 rounded-[13px] md:rounded-[22px] backdrop-blur-xl hover:bg-white/60 hover:border-charcoal/20 transition-all duration-500 shadow-lg active:scale-95"
        >
          Home
        </Link>
      </div>

      {/* ──── MAIN VIEW ──── */}
      {viewMode === 'circle' && (
        <Canvas
          orthographic
          camera={{ position: [0, 50, 0], zoom: 1, near: 0.1, far: 200 }}
          style={{ width: '100%', height: '100%' }}
          onPointerMissed={() => setSelectedItem(null)}
        >
          <color attach="background" args={['#FBFCF6']} />
          <TopDownCamera />

          {/* Lighting */}
          <ambientLight intensity={0.7} color="#FFFFFF" />
          <directionalLight position={[10, 50, 8]} intensity={2.0} color="#FFFFF0" />
          <directionalLight position={[-6, 40, -10]} intensity={0.5} color="#F0F0FF" />

          <RotatingRing
            speed={speed}
            selectedId={selectedItem?.id ?? null}
            onSelectItem={handleSelectItem}
            textures={textures}
            items={gridItems}
          />

          <ContinuousRaycast onHover={handleHover} />
        </Canvas>
      )}

      {viewMode === 'grid' && (
        <div className="absolute inset-0 w-full h-full overflow-y-auto pointer-events-auto pt-[calc(120px_+_env(safe-area-inset-top))] md:pt-[calc(140px_+_env(safe-area-inset-top))] pb-[calc(6rem_+_env(safe-area-inset-bottom))]">

          {/* ── MOBILE: 2-column masonry of images only (tap to expand) ──
              Built as two explicit flex columns (top-aligned) rather than CSS
              multicol — multicol's default column-fill:balance left the right
              column not flush at the top, which read as a phantom shadow. */}
          {mobileLayout === 'masonry' && (
            <div className="md:hidden flex items-start gap-3 px-4">
              {[0, 1].map((col) => (
                <div key={col} className="flex-1 min-w-0 flex flex-col gap-3">
                  {gridItems.filter((_, i) => i % 2 === col).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setExpandedItem(item)}
                      className="block w-full p-0 bg-transparent border-0 outline-none appearance-none active:scale-[0.97] transition-transform duration-200"
                      style={{
                        // Directional shadow that sits *below* the tile so it
                        // never haloes above the top edge. Lives here (not on the
                        // clipped Squircle) so corner-smoothing can't clip it.
                        borderRadius: 18,
                        boxShadow: '0 10px 22px -12px rgba(0,0,0,0.22), 0 4px 8px -5px rgba(0,0,0,0.10)',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <Squircle radius={18} className="block w-full">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          // Still lazy — 37 tiles is a lot to hold decoded at once — but
                          // the reserved ratio means the column is its full height from
                          // the first frame, so there's always somewhere to scroll to.
                          // The preload has the bytes cached by the time you get here.
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto object-cover block"
                          style={{ aspectRatio: ratioFor(item, ratios) }}
                        />
                      </Squircle>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ── MOBILE: single scrollable list of full cards (original) ── */}
          {mobileLayout === 'list' && (
            <div className="md:hidden px-6">
              {gridItems.map((item) => (
                <div key={item.id} className="w-full mb-6">
                  {/* Same reserved box as the masonry — this list is the layout that
                      collapsed hardest, since every card is a full-width image. */}
                  <MoodBoardCard item={item} aspectRatio={ratioFor(item, ratios)} />
                </div>
              ))}
            </div>
          )}

          {/* ── DESKTOP: full-card masonry ── */}
          <div className="hidden md:block max-w-[1600px] mx-auto columns-2 lg:columns-3 xl:columns-4 gap-6 px-12">
            {gridItems.map((item) => (
              <div key={item.id} className="inline-block w-full break-inside-avoid mb-6">
                <MoodBoardCard item={item} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──── HOVER POPOVER ──── */}
      <AnimatePresence>
        {hoveredItem && !selectedItem && viewMode === 'circle' && (
          <motion.div
            key={`hover-${hoveredItem.id}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: mousePos.x + 20,
              top: mousePos.y - 100,
            }}
          >
            <Squircle
              radius={16}
              shadow="0 25px 50px -12px rgba(0,0,0,0.25)"
              wrapperClassName="w-[260px]"
            >
              <img
                src={hoveredItem.imageUrl}
                alt={hoveredItem.title}
                className="w-full h-auto object-cover block"
                style={{ maxHeight: '200px' }}
              />
            </Squircle>
            <div className="mt-2 px-1">
              <span className="text-[11px] font-semibold text-charcoal/70">
                {hoveredItem.title}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── CLICK-OUTSIDE OVERLAY ──── */}
      <AnimatePresence>
        {selectedItem && viewMode === 'circle' && (
          <motion.div
            key="dismiss-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30"
            onClick={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>

      {/* ──── DETAIL PANEL (bottom-left) ──── */}
      <AnimatePresence>
        {selectedItem && viewMode === 'circle' && (
          <motion.div
            key="detail-panel"
            initial={{ y: '50%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '10%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 38 }}
            className="fixed bottom-[calc(1.5rem_+_env(safe-area-inset-bottom))] left-6 z-40 w-[90vw] md:w-[420px]"
          >
            <MoodBoardCard item={selectedItem} isPopup={true} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── MOBILE EXPANDED IMAGE (tap masonry to expand) ──── */}
      <AnimatePresence>
        {expandedItem && (
          /* No opacity animation anywhere above the card: an ancestor at opacity < 1
             makes the card's backdrop-filter sample a backdrop that isn't composited
             yet, so on iOS the glass paints near-white and only snaps to grey once the
             fade lands — the two-step load. The scrim is a *sibling* instead, and it
             appears at full strength on the first frame, so the glass is correct
             immediately. */
          <motion.div
            key="mobile-expanded"
            className="fixed inset-0 z-[120] overflow-y-auto md:hidden"
            onClick={() => setExpandedItem(null)}
            // Keeps a drag inside the preview from chaining into the grid underneath,
            // so closing it returns you exactly where you left off.
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Darker, only lightly-blurred scrim: the grid stays visible behind the
                expanded card but recedes so the pane reads clearly. Fades on exit only. */}
            <motion.div
              aria-hidden="true"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-0 z-0 pointer-events-none"
              style={{
                background: 'rgba(22, 20, 17, 0.42)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
              }}
            />

            {/* Close chip — fixed to the viewport rather than pinned to the card, so a
                tall card that scrolls past the top of the screen (leaving no scrim to
                tap) can still be dismissed. Same glass as the card it closes. Scale-only
                entrance: an opacity animation would cost it its backdrop on the first
                frame, exactly like the card. */}
            <motion.button
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setExpandedItem(null); }}
              aria-label="Close"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              // whileTap, not active:scale-95 — Framer owns this element's transform,
              // so a Tailwind scale utility would never land.
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="fixed z-20 right-5 flex items-center justify-center h-10 w-10 text-white"
              style={{
                top: 'calc(1.25rem + env(safe-area-inset-top))',
                borderRadius: 13,
                background: GLASS_TINT_DARK,
                backdropFilter: GLASS_BACKDROP,
                WebkitBackdropFilter: GLASS_BACKDROP,
                boxShadow: GLASS_EDGE,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>

            {/* Scroll happens on the padded backdrop so the card's shadow
                isn't clipped and tall images never hard-cut at the top. */}
            <div
              className="relative z-10 min-h-full flex items-center justify-center px-6"
              style={{
                paddingTop: 'calc(1.5rem + env(safe-area-inset-top))',
                paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 28 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                className="w-full max-w-[430px]"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <MoodBoardCard item={expandedItem} isPopup={true} whiteText={true} refractive={true} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom hint */}
      <AnimatePresence>
        {!selectedItem && isReady && viewMode === 'circle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-[calc(2rem_+_env(safe-area-inset-bottom))] left-8 pointer-events-none z-20"
          >
            <span className="text-[9px] uppercase tracking-[0.5em] text-charcoal/20 font-semibold">
              Click or Hover!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slider styles */}
      <style>{`
        .mood-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 1.75px;
          height: 14px;
          border-radius: 0;
          background: #2A2A2A;
          cursor: pointer;
        }
        .mood-slider::-moz-range-thumb {
          width: 1.75px;
          height: 14px;
          border-radius: 0;
          background: #2A2A2A;
          border: none;
          cursor: pointer;
        }
        .mood-slider::-webkit-slider-runnable-track { background: transparent; }
        .mood-slider::-moz-range-track { background: transparent; }
      `}</style>
    </div>
  );
};

export default MoodBoardV2Page;
