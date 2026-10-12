import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, invalidate } from '@react-three/fiber';
import * as THREE from 'three';
import { motion as motionComponent, AnimatePresence } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { MOOD_BOARD } from '../constants';
import type { MoodBoardItem } from '../types';
import MuseumScene from '../components/Museum/MuseumScene';
import MuseumSlider from '../components/Museum/MuseumSlider';
import ShelfAbout from '../components/Museum/ShelfAbout';
import SelectedCard, { CardMeasurer } from '../components/Museum/SelectedCard';
import type { CardGeometry } from '../components/Museum/selectedLayout';
import ThemeToggle from '../components/Museum/ThemeToggle';
import { pillClass } from '../components/Museum/ShelfAbout';
import { THEMES, storedTheme, storeTheme, type ThemeMode } from '../components/Museum/museumTheme';
import { CAMERA, FRAME, INTENSITY } from '../components/Museum/museumConfig';
import { layoutCase, type CaseLayout } from '../components/Museum/museumLayout';
import { computeView, clampRig, EASE, type MuseumRig, type MuseumView } from '../components/Museum/museumView';
import { useMuseumTextures } from '../components/Museum/useMuseumTextures';

const { Link } = ReactRouterDOM as any;
const motion = motionComponent as any;

/**
 * (Museum) — the mood board as a run of Japanese cypress shelving.
 *
 * You stand at eye level before shelves that hang in front of a cream wall,
 * lit from above, running off both edges of the screen. Photographs stand
 * on them as panes of glass. Slide along to see more; hover a pane to light
 * it, click to take it out.
 *
 * Desktop, tablet and phone: on a touch screen a finger lighting a pane
 * stands in for hover, and swipes in either direction slide the shelf.
 */

/** Hold the loader at least this long once images are in, so shaders compile behind it. */
const SETTLE_MS = 700;
/** Give up waiting on slow images after this; their panes fill in when they land. */
const BAIL_MS = 9000;

const fallbackAspect = (item: MoodBoardItem) => (item.orientation === 'portrait' ? 3 / 4 : 16 / 10);

const MuseumRoom: React.FC = () => {
  const { textures, loadedCount, total, loadDetail } = useMuseumTextures(MOOD_BOARD);
  const progress = total > 0 ? (loadedCount / total) * 100 : 100;

  /* ─── Load → lay out → reveal ─────────────────────────────── */

  // The layout waits for real aspect ratios, then is fixed for the visit —
  // a late image must never rearrange the shelves under someone's cursor.
  const [layout, setLayout] = useState<CaseLayout | null>(null);
  const [isReady, setIsReady] = useState(false);
  const texturesRef = useRef(textures);
  texturesRef.current = textures;

  useEffect(() => {
    if (layout) return;
    const build = () => {
      const t = texturesRef.current;
      setLayout(layoutCase(MOOD_BOARD, (item) => t.get(item.imageUrl)?.aspect ?? fallbackAspect(item)));
    };
    const timer = window.setTimeout(build, progress >= 100 ? 0 : BAIL_MS);
    return () => window.clearTimeout(timer);
  }, [progress, layout]);

  useEffect(() => {
    if (!layout) return;
    const timer = window.setTimeout(() => setIsReady(true), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [layout]);

  /* ─── Rig: where the camera is along the case ─────────────── */

  const rig = useRef<MuseumRig>({
    targetX: 0,
    x: 0,
    ease: EASE.glide,
    minX: 0,
    maxX: 0,
    view: computeView(window.innerWidth, window.innerHeight),
    shadowDirty: true,
    selected: null,
  });
  const [view, setViewState] = useState<MuseumView | null>(null);
  // Only a real change of window size is news; the same view again must not re-render the page.
  const setView = useCallback(
    (next: MuseumView) => setViewState((prev) => (prev && prev.width === next.width && prev.height === next.height ? prev : next)),
    [],
  );

  // Open on the middle of the case.
  useEffect(() => {
    if (!layout) return;
    const mid = (layout.x0 + layout.x1) / 2;
    rig.current.x = rig.current.targetX = mid;
  }, [layout]);

  /* ─── Hover & selection ───────────────────────────────────── */

  const [hovered, setHovered] = useState<MoodBoardItem | null>(null);
  const [selected, setSelected] = useState<MoodBoardItem | null>(null);
  const [detail, setDetailState] = useState<{ id: string; texture: THREE.Texture } | null>(null);
  const detailRef = useRef(detail);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  /** Swap in a new sharp copy (or none), disposing whatever it replaces. */
  const setDetail = useCallback((next: { id: string; texture: THREE.Texture } | null) => {
    if (detailRef.current && detailRef.current !== next) detailRef.current.texture.dispose();
    detailRef.current = next;
    setDetailState(next);
  }, []);
  useEffect(() => () => detailRef.current?.texture.dispose(), []);

  // The card takes over from the pane once it lands, and hands it back once it
  // has folded away again — so opening and closing are each one continuous move.
  const [covered, setCovered] = useState(false);
  const [closing, setClosing] = useState(false);
  const coveredRef = useRef(covered);
  coveredRef.current = covered;

  const select = useCallback(
    (item: MoodBoardItem) => {
      setHovered(null);
      setCovered(false);
      setClosing(false);
      setSelected(item);
      loadDetail(item).then((texture) => {
        if (!texture) return;
        // Only if it's still the pane on show — a slow load must not land on the next one.
        if (selectedRef.current?.id === item.id) setDetail({ id: item.id, texture });
        else texture.dispose();
      });
    },
    [loadDetail, setDetail],
  );
  const close = useCallback(() => {
    if (!selectedRef.current) return;
    // Fold the card away first if it's out; otherwise send the pane straight home.
    if (coveredRef.current) setClosing(true);
    else setSelected(null);
  }, []);
  const landed = useCallback((item: MoodBoardItem) => {
    if (selectedRef.current?.id === item.id) setCovered(true);
  }, []);
  const retracted = useCallback(() => {
    setSelected(null);
    setCovered(false);
    setClosing(false);
    setGeometry(null);
    rig.current.selected = null;
  }, []);

  // The card is laid out (its text measured) the moment a piece is chosen, so
  // its pane flies straight to where the photo will sit in it.
  const [geometry, setGeometry] = useState<{ id: string; geometry: CardGeometry } | null>(null);
  const laidOut = useCallback((id: string, g: CardGeometry) => {
    rig.current.selected = { id, geometry: g };
    rig.current.shadowDirty = true;
    setGeometry({ id, geometry: g });
    invalidate();
  }, []);
  const selectedAspect = (() => {
    const p = selected && layout?.panes.find((q) => q.item.id === selected.id);
    return p ? p.w / p.h : 4 / 3;
  })();

  // Once a pane is back on its shelf, drop its sharp copy.
  const returned = useCallback(
    (item: MoodBoardItem) => {
      if (detailRef.current?.id === item.id) setDetail(null);
    },
    [setDetail],
  );

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);

  /* ─── Sliding: wheel, drag, keys ──────────────────────────── */

  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (selectedRef.current || e.ctrlKey) return; // ctrl+wheel is a trackpad pinch
      if ((e.target as Element | null)?.closest?.('[data-ui]')) return; // reading the About note, not sliding
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * scale;
      const r = rig.current;
      // The trackpad already supplies its own momentum; follow it closely.
      r.ease = EASE.wheel;
      r.targetX = clampRig(r, r.targetX + d * r.view.worldPerPx * 1.1);
      invalidate();
    };
    // Safari turns a trackpad pinch into page zoom through its own gesture events.
    const noZoom = (e: Event) => e.preventDefault();
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('gesturestart', noZoom);
    el.addEventListener('gesturechange', noZoom);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('gesturestart', noZoom);
      el.removeEventListener('gesturechange', noZoom);
    };
  }, []);

  /**
   * Dragging the shelf. A mouse drags it sideways. A finger can swipe either
   * way: the first few pixels of movement decide the axis for that swipe, and
   * up and down slide the shelf just as a trackpad's scroll does.
   */
  const drag = useRef<{
    id: number;
    touch: boolean;
    x0: number;
    y0: number;
    lastX: number;
    lastY: number;
    lastT: number;
    v: number;
    axis: 'x' | 'y' | null;
  } | null>(null);
  const [grabbing, setGrabbing] = useState(false);
  const AXIS_LOCK_PX = 8;

  const onPointerDown = (e: React.PointerEvent) => {
    if (selected || e.button !== 0) return;
    const touch = e.pointerType !== 'mouse';
    drag.current = {
      id: e.pointerId,
      touch,
      x0: e.clientX,
      y0: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      lastT: performance.now(),
      v: 0,
      axis: touch ? null : 'x',
    };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.axis) {
      const ax = Math.abs(e.clientX - d.x0);
      const ay = Math.abs(e.clientY - d.y0);
      if (Math.max(ax, ay) < AXIS_LOCK_PX) return;
      d.axis = ax >= ay ? 'x' : 'y';
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      // It's a swipe, not a press: let go of the pane the finger landed on.
      setHovered(null);
    }
    const r = rig.current;
    // Swiping left or up moves along to the right, as scrolling does.
    const delta = d.axis === 'x' ? e.clientX - d.lastX : e.clientY - d.lastY;
    if (!grabbing && !d.touch && Math.abs(delta) > 2) setGrabbing(true);
    // Move the shelves with the pointer, matched at mid-shelf depth.
    const perPx = r.view.worldPerPx;
    r.ease = EASE.drag;
    r.targetX = clampRig(r, r.targetX - delta * perPx);
    invalidate();
    const now = performance.now();
    d.v = d.v * 0.6 + ((-delta * perPx) / Math.max(1, now - d.lastT)) * 0.4;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    d.lastT = now;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    // A finger lifting puts out the pane it lit (a tap goes on to open it).
    if (d.touch) setHovered(null);
    const r = rig.current;
    // Coast on after a flick — but not if the pointer had already come to rest.
    const v = performance.now() - d.lastT > 80 ? 0 : d.v;
    r.ease = EASE.glide;
    r.targetX = clampRig(r, r.targetX + v * 220);
    invalidate();
    drag.current = null;
    setGrabbing(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close();
      if (selectedRef.current) return;
      const r = rig.current;
      if (e.key === 'ArrowRight') r.targetX = clampRig(r, r.targetX + 0.9);
      else if (e.key === 'ArrowLeft') r.targetX = clampRig(r, r.targetX - 0.9);
      else return;
      r.ease = EASE.seek;
      invalidate();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  /* ─── Light / dark ────────────────────────────────────────── */

  const [mode, setMode] = useState<ThemeMode>(storedTheme);
  const theme = THEMES[mode];
  const toggleTheme = useCallback(() => {
    setMode((m) => {
      const next = m === 'dark' ? 'light' : 'dark';
      storeTheme(next);
      return next;
    });
  }, []);

  /* ─── Edge to edge, scoped to this page (as on the board) ─── */

  const themeMeta = useRef<HTMLMetaElement | null>(null);
  useEffect(() => {
    const html = document.documentElement;
    const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    const prevViewport = viewport?.content;
    const prevHtmlBg = html.style.backgroundColor;
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    const metaIsOurs = !meta;
    const prevMeta = meta?.content;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    themeMeta.current = meta;
    if (viewport) viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    return () => {
      if (viewport && prevViewport !== undefined) viewport.content = prevViewport;
      if (metaIsOurs) meta?.remove();
      else if (meta && prevMeta !== undefined) meta.content = prevMeta;
      html.style.backgroundColor = prevHtmlBg;
      themeMeta.current = null;
    };
  }, []);

  // Safari paints its chrome in the canvas colour, so it follows the theme too.
  useEffect(() => {
    if (themeMeta.current) themeMeta.current.content = theme.pageBg;
    document.documentElement.style.backgroundColor = theme.pageBg;
  }, [theme]);

  const lightsTarget = isReady ? 1 : 0;
  const bottomPad = view?.bottomPadPx ?? FRAME.bottomPadPx;
  const compact = (view ?? rig.current.view).compact;
  const boardLength = layout ? layout.x1 - layout.x0 + CAMERA.endReveal * 2 : 1;
  const placard = hovered;

  return (
    <div
      ref={stage}
      className="fixed inset-0 w-screen select-none overflow-hidden"
      style={{
        background: theme.pageBg,
        transition: 'background-color 500ms',
        height: '100vh',
        minHeight: '100lvh',
        touchAction: 'none',
        cursor: grabbing ? 'grabbing' : undefined,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* ──── SHELVING ──── */}
      {layout && (
        <Canvas
          style={{ position: 'absolute', inset: 0 }}
          // Draw a frame only when something moves — an idle shelf costs the GPU nothing.
          frameloop="demand"
          // 1.5× is crisp on a Retina screen at half the pixels (and framebuffer memory) of 2×.
          dpr={[1, 1.5]}
          shadows="percentage"
          gl={{ antialias: true, powerPreference: 'default' }}
          camera={{ fov: CAMERA.fov, near: 0.05, far: 60 }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NeutralToneMapping;
            gl.toneMappingExposure = INTENSITY.exposure;
            gl.shadowMap.autoUpdate = false;
            gl.setClearColor(THEMES[mode].pageBg);
          }}
        >
          <MuseumScene
            layout={layout}
            textures={textures}
            detail={detail}
            rig={rig}
            view={view}
            onView={setView}
            hoveredId={hovered?.id ?? null}
            selectedId={selected?.id ?? null}
            coveredId={covered ? selected?.id ?? null : null}
            lightsTarget={lightsTarget}
            onHover={setHovered}
            onSelect={select}
            onLanded={landed}
            onReturned={returned}
            theme={theme}
          />
        </Canvas>
      )}

      {/* ──── ABOUT · THEME · HOME ──── */}
      <div
        className={`absolute z-40 flex items-start ${
          compact ? 'left-4 top-[calc(1rem_+_env(safe-area-inset-top))] gap-2' : 'left-8 top-[calc(1.5rem_+_env(safe-area-inset-top))] gap-3'
        }`}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <ShelfAbout visible={isReady && !selected} theme={theme} compact={compact} />
        <ThemeToggle visible={isReady && !selected} theme={theme} onToggle={toggleTheme} compact={compact} />
      </div>
      <Link
        to="/#about"
        onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
        className={`${pillClass(theme, compact)} absolute z-40 flex items-center justify-center font-serif font-medium italic active:scale-95 ${
          compact
            ? 'right-4 top-[calc(1rem_+_env(safe-area-inset-top))] h-10 min-w-[80px] px-4 text-base'
            : 'right-8 top-[calc(1.5rem_+_env(safe-area-inset-top))] min-w-[120px] px-6 py-3 text-2xl'
        } ${isReady && !selected ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        Home
      </Link>

      {/* ──── RAIL: the hovered piece's title · slider ──── */}
      {/* On a phone the two stack, centred: the title over a slim progress line. */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 items-center transition-opacity duration-700 ${
          compact ? 'flex flex-col justify-center gap-1 px-4' : 'grid grid-cols-[1fr_auto_1fr] px-8'
        } ${isReady ? 'opacity-100' : 'opacity-0'}`}
        style={{ height: bottomPad, paddingBottom: 'env(safe-area-inset-bottom)' }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className={`relative min-w-0 ${compact ? 'h-6 w-full' : 'h-10'}`}>
          <AnimatePresence mode="wait" initial={false}>
            {placard && (
              <motion.div
                key={placard.id}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className={`absolute inset-0 flex items-center ${compact ? 'justify-center' : ''}`}
              >
                <span className={`truncate font-serif italic leading-tight ${compact ? 'text-[15px]' : 'text-[17px]'}`} style={{ color: theme.text }}>
                  {placard.title}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <MuseumSlider rig={rig} boardLength={boardLength} disabled={!!selected} theme={theme} compact={compact} />
      </div>

      {/* ──── SELECTED: one card — text beside the photo, or under it when upright ──── */}
      {selected && !closing && (
        <CardMeasurer item={selected} theme={theme} view={view ?? rig.current.view} aspect={selectedAspect} onGeometry={laidOut} />
      )}
      <AnimatePresence>
        {selected && covered && layout && geometry?.id === selected.id && (
          <motion.div
            key="selected"
            className="absolute inset-0 z-30"
            // A press anywhere off the card puts the piece back.
            onClick={close}
            onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
            // By now the card has folded back behind the photo; a brief fade
            // covers the frame or two before the pane reappears beneath it.
            exit={{ opacity: 0, pointerEvents: 'none', transition: { duration: 0.1 } }}
          >
            <SelectedCard
              item={selected}
              source={
                ((detail?.id === selected.id ? detail.texture : textures.get(selected.imageUrl)?.texture)?.image as CanvasImageSource | undefined) ?? null
              }
              geometry={geometry.geometry}
              closing={closing}
              onClose={close}
              onRetracted={retracted}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── LOADING ──── */}
      <AnimatePresence>
        {!isReady && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: theme.pageBg }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="font-serif font-medium italic leading-none" style={{ fontSize: 'clamp(64px, 12vw, 180px)', color: theme.text }}>
                {Math.round(progress)}%
              </div>
              <div className={`relative mt-6 h-[2px] w-40 overflow-hidden rounded-full ${theme.rail}`}>
                <div className="absolute inset-y-0 left-0 rounded-full bg-[#3F6D0D] transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Phones, tablets and desktops all get the shelf; the layout adapts to each. */
const MoodBoardMuseumPage: React.FC = () => <MuseumRoom />;

export default MoodBoardMuseumPage;
