
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motion as motionComponent, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { MOOD_BOARD } from '../constants';
import type { MoodBoardItem } from '../types';
import MoodBoardCard from '../components/UI/MoodBoardCard';

const { Link } = ReactRouterDOM as any;
const motion = motionComponent as any;

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
}

const RotatingRing: React.FC<RingProps> = ({ speed, selectedId, onSelectItem, textures }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const items = MOOD_BOARD;
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
  const { textures, loadedCount, total } = usePreloadTextures(MOOD_BOARD);
  const progress = total > 0 ? (loadedCount / total) * 100 : 100;

  const [isReady, setIsReady] = useState(false);
  const [speed, setSpeed] = useState(0.05);
  const [selectedItem, setSelectedItem] = useState<MoodBoardItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<MoodBoardItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'circle' | 'grid'>('grid');

  // Smooth the progress for the loading bar
  const animatedProgress = useSpring(progress, { stiffness: 50, damping: 20 });

  // When loading completes, wait a beat then reveal
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setIsReady(true), 800);
      return () => clearTimeout(timer);
    }
  }, [progress]);

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
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none"
      style={{ background: '#FBFCF6' }}
      onMouseMove={handleMouseMove}
    >

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
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col md:flex-row items-start md:items-center justify-between px-8 py-6 pointer-events-none gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pointer-events-auto">

          {/* View Toggle */}
          <div className="flex items-center bg-charcoal/5 p-1 rounded-full border border-charcoal/10 backdrop-blur-md">
            <button
              onClick={() => setViewMode('circle')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'circle'
                  ? 'bg-white text-charcoal shadow-sm'
                  : 'text-charcoal/40 hover:text-charcoal/70'
                }`}
            >
              Ring
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'grid'
                  ? 'bg-white text-charcoal shadow-sm'
                  : 'text-charcoal/40 hover:text-charcoal/70'
                }`}
            >
              Grid
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
          className="pointer-events-auto flex items-center justify-center text-center min-w-[120px] font-serif italic font-medium text-2xl px-6 py-3 text-charcoal bg-charcoal/5 border border-charcoal/10 rounded-[22px] backdrop-blur-xl hover:bg-charcoal/10 hover:border-charcoal/20 transition-all duration-500 shadow-lg active:scale-95"
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
          />

          <ContinuousRaycast onHover={handleHover} />
        </Canvas>
      )}

      {viewMode === 'grid' && (
        <div className="absolute inset-0 w-full h-full overflow-y-auto pt-[140px] pb-24 px-6 md:px-12 pointer-events-auto">
          <div className="max-w-[1600px] mx-auto columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
            {MOOD_BOARD.map((item) => (
              <div key={item.id} className="break-inside-avoid mb-6">
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
            <img
              src={hoveredItem.imageUrl}
              alt={hoveredItem.title}
              className="w-[260px] h-auto object-cover shadow-2xl"
              style={{
                borderRadius: '16px',
                maxHeight: '200px',
              }}
            />
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
            className="fixed bottom-6 left-6 z-40 w-[90vw] md:w-[420px]"
          >
            <MoodBoardCard item={selectedItem} isPopup={true} />
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
            className="fixed bottom-8 left-8 pointer-events-none z-20"
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
