
import React, { useState, useEffect, useRef } from 'react';
import { motion as motionComponent, AnimatePresence, useMotionValue, useSpring, useTransform, useAnimationFrame } from 'framer-motion';
import { Camera, ArrowLeft, ChevronDown } from 'lucide-react';

// Fix: Cast motion to any to resolve property existence type errors for SVG and HTML motion elements
const motion = motionComponent as any;

const Hero: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showRevealButton, setShowRevealButton] = useState(false);
  const [isFullyRevealed, setIsFullyRevealed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Ripple animation (commented out for now)
  // const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  // const mobileTapCount = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. MOTION VALUES
  // Initialize cursor window relative to viewport size (85% width, 25% height)
  // This ensures consistent placement across different screen sizes
  const initialX = typeof window !== 'undefined' ? window.innerWidth * 0.745 : 0;
  const initialY = typeof window !== 'undefined' ? window.innerHeight * 0.265 : 0;
  const mouseX = useMotionValue(initialX);
  const mouseY = useMotionValue(initialY);
  const velocity = useMotionValue(0);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // 2. PHYSICS FOR FLUID BLOBS
  const springMain = { stiffness: 400, damping: 40, mass: 0.5 };
  const springTrail = { stiffness: 180, damping: 26, mass: 1 };
  const springSlow = { stiffness: 100, damping: 23, mass: 1.5 };

  const smoothX = useSpring(mouseX, springMain);
  const smoothY = useSpring(mouseY, springMain);
  const trailX = useSpring(mouseX, springTrail);
  const trailY = useSpring(mouseY, springTrail);
  const slowX = useSpring(mouseX, springSlow);
  const slowY = useSpring(mouseY, springSlow);

  // 3. DYNAMIC PARAMETERS
  const mainRadius = useTransform(velocity, [0, 2000], [100, 130]);

  // Refs for direct DOM mask updates (bypasses framer-motion style application issues in WebKit)
  const maskOuterRef = useRef<HTMLDivElement>(null);
  const maskMiddleRef = useRef<HTMLDivElement>(null);
  const maskInnerRef = useRef<HTMLDivElement>(null);

  // Helper: build a radial mask gradient string
  const buildMask = (r: number, x: number, y: number) =>
    `radial-gradient(circle ${r}px at ${x}px ${y}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 99.5%, white 100%)`;

  // Apply masks directly via DOM — more reliable than MotionValue style in Safari 27
  useEffect(() => {
    const applyMask = (el: HTMLElement | null, value: string) => {
      if (!el) return;
      el.style.setProperty('-webkit-mask-image', value);
      el.style.setProperty('mask-image', value);
    };

    const unsubMain = smoothX.on('change', () => {
      applyMask(maskOuterRef.current, buildMask(mainRadius.get(), smoothX.get(), smoothY.get()));
    });
    const unsubMainY = smoothY.on('change', () => {
      applyMask(maskOuterRef.current, buildMask(mainRadius.get(), smoothX.get(), smoothY.get()));
    });
    const unsubMainR = mainRadius.on('change', () => {
      applyMask(maskOuterRef.current, buildMask(mainRadius.get(), smoothX.get(), smoothY.get()));
    });
    const unsubTrailX = trailX.on('change', () => {
      applyMask(maskMiddleRef.current, buildMask(80, trailX.get(), trailY.get()));
    });
    const unsubTrailY = trailY.on('change', () => {
      applyMask(maskMiddleRef.current, buildMask(80, trailX.get(), trailY.get()));
    });
    const unsubSlowX = slowX.on('change', () => {
      applyMask(maskInnerRef.current, buildMask(60, slowX.get(), slowY.get()));
    });
    const unsubSlowY = slowY.on('change', () => {
      applyMask(maskInnerRef.current, buildMask(60, slowX.get(), slowY.get()));
    });

    // Set initial masks
    applyMask(maskOuterRef.current, buildMask(mainRadius.get(), smoothX.get(), smoothY.get()));
    applyMask(maskMiddleRef.current, buildMask(80, trailX.get(), trailY.get()));
    applyMask(maskInnerRef.current, buildMask(60, slowX.get(), slowY.get()));

    return () => {
      unsubMain(); unsubMainY(); unsubMainR();
      unsubTrailX(); unsubTrailY();
      unsubSlowX(); unsubSlowY();
    };
  }, []);

  const movementBuffer = useRef<{ x: number; y: number; time: number }[]>([]);

  useAnimationFrame((time, delta) => {
    const currentX = mouseX.get();
    const currentY = mouseY.get();
    const dist = Math.hypot(currentX - lastMousePos.current.x, currentY - lastMousePos.current.y);
    velocity.set((dist / (delta || 16)) * 1000);
    lastMousePos.current = { x: currentX, y: currentY };
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseX.set(x);
      mouseY.set(y);

      if (isFullyRevealed) return;

      const now = Date.now();
      movementBuffer.current.push({ x, y, time: now });
      movementBuffer.current = movementBuffer.current.filter(p => now - p.time < 1500);

      if (movementBuffer.current.length > 10) {
        let totalDist = 0;
        for (let i = 1; i < movementBuffer.current.length; i++) {
          totalDist += Math.hypot(
            movementBuffer.current[i].x - movementBuffer.current[i - 1].x,
            movementBuffer.current[i].y - movementBuffer.current[i - 1].y
          );
        }
        if (totalDist > 1600 && !showRevealButton) setShowRevealButton(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [showRevealButton, isFullyRevealed]);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Images with preview and full-quality URLs
  // Preview: ~400x400 thumbnails for grid (fast loading)
  // Full: High-resolution for lightbox
  const images = [
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/cupertinoleaves.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/cupertinoleaves.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/lovespring.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/lovespring.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/appleparkvisitor.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/appleparkvisitor.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/chicagowaves.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/chicagowaves.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/vancouverleaves.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/vancouverleaves.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/hakonejapanesemaple.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/hakonejapanesemaple.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/porscheracing.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/porscheracing.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/atlasbar.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/atlasbar.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/daisies.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/daisies.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/alaskabus.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/alaskabus.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/mttam.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/mttam.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/self4.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/self4.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/pfp.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/pfp.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/maxverstappen.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/maxverstappen.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/hakone.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/hakone.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/beautiful.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/beautiful.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/futuresamurai.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/futuresamurai.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/birdvsworld.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/birdvsworld.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/halfdome.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/halfdome.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/shibuyaskyview.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/shibuyaskyview.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/steph.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/steph.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/mbs.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/mbs.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/selffav.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/selffav.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/sfhenge.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/sfhenge.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/thebay.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/thebay.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/whistler.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/whistler.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/water.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/water.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/ucschills.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/ucschills.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/glassrain.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/glassrain.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/arashiyama.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/arashiyama.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/giantsgame.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/giantsgame.avif" },
    { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/20kgtoyota.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/20kgtoyota.avif" }
  ];

  // Mobile detection (disables cursor animation on small screens)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Lightbox navigation
  const handlePrevImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
    }
  };
  const handleNextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % images.length);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedImageIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevImage();
      else if (e.key === 'ArrowRight') handleNextImage();
      else if (e.key === 'Escape') setSelectedImageIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex]);

  // Touch swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handlePrevImage();
      else handleNextImage();
    }
    touchStartX.current = null;
  };

  /* Ripple tap handler (commented out for now)
  const handleMobileTap = (e: React.TouchEvent) => {
    if (!isMobile || isFullyRevealed) return;
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Add ripple
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1200);

    // Increment tap count and show reveal after 2 taps
    mobileTapCount.current += 1;
    if (mobileTapCount.current >= 2 && !showRevealButton) {
      setShowRevealButton(true);
    }
  };
  */

  const handleReveal = () => { setIsFullyRevealed(true); setShowRevealButton(false); };
  const handleHide = () => { setIsFullyRevealed(false); movementBuffer.current = []; setSelectedImageIndex(null); };

  return (
    <section
      ref={containerRef}
      className={`relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-[#D4DCDA] ${!isMobile && isHovered && !isFullyRevealed && selectedImageIndex === null ? 'cursor-none' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LAYER 1: BOTTOM GALLERY (Apple Photos Style) */}
      <div className="absolute inset-0 z-0 flex flex-col">
        {/* HEADER BAR */}
        <AnimatePresence>
          {isFullyRevealed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="w-full pt-10 pl-4 md:pl-10 pr-10 pb-4 z-20 pointer-events-auto flex justify-between items-center"
            >
              <p className="font-serif text-xl md:text-2xl text-charcoal/80 max-w-[70%] leading-none transform translate-y-[2px]">
                {isMobile ? "I'm also a hobbyist photographer!" : "I'm also a hobbyist photographer, here are some of my favorites!"}
              </p>

              <motion.button
                onClick={handleHide}
                className="w-[140px] py-3 bg-moss text-white rounded-full font-sans text-sm tracking-[0.1em] uppercase hover:bg-charcoal transition-all shadow-2xl active:scale-95 shrink-0"
              >
                Hide
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHOTO GRID - 4x8 on desktop, 4x5 on mobile (no overflow) */}
        <div className={`flex-1 w-full min-h-0 flex items-center justify-center p-2 md:p-6 transition-all duration-1000 ${isFullyRevealed ? "opacity-100" : "opacity-40"}`}>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-0.5 w-full max-h-full aspect-[4/5] md:aspect-[2/1]">
            {(isMobile ? images.slice(0, 20) : images).map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, zIndex: 10, transition: { duration: 0.2 } }}
                onClick={() => isFullyRevealed && setSelectedImageIndex(i)}
                className="cursor-pointer overflow-hidden w-full h-full shadow-sm hover:shadow-2xl transition-shadow bg-white/10"
              >
                <img
                  src={img.preview}
                  className="w-full h-full object-cover"
                  alt={`Gallery ${i}`}
                  loading="eager"
                  // @ts-ignore
                  fetchpriority="high"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* LIGHTBOX POPUP */}
        <AnimatePresence>
          {selectedImageIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedImageIndex(null)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Close Button - Top Right */}
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              {/* Left Arrow (hidden on mobile) */}
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>

              {/* Right Arrow (hidden on mobile) */}
              <button
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>

              {/* Image - Uses full resolution */}
              <motion.img
                key={selectedImageIndex}
                src={images[selectedImageIndex].full}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="max-w-[90vw] max-h-[85vh] object-contain shadow-2xl"
                alt="Enlarged"
                onClick={(e: any) => e.stopPropagation()}
                loading="lazy"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LAYER 2: CSS-MASKED OVERLAY (cursor animation - desktop only)
           Uses nested elements instead of mask-composite for Safari compatibility.
           Each div applies one mask via direct DOM refs — nesting achieves the intersect effect naturally. */}
      {!isMobile && (
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          animate={{ opacity: isFullyRevealed ? 0 : 1 }}
          transition={{ duration: 0.8 }}
        >
          <div ref={maskOuterRef} className="absolute inset-0">
            <div ref={maskMiddleRef} className="absolute inset-0">
              <div ref={maskInnerRef} className="absolute inset-0">
                <div className="absolute inset-0 bg-[#FBFAF8]" />
                <div className="relative h-full w-full">
                  {/* Scroll Indicator - Bottom Middle */}
                  <div className="absolute bottom-[28px] left-1/2 -translate-x-1/2 text-charcoal/20">
                    <ChevronDown size={32} strokeWidth={1.5} />
                  </div>

                  {/* Bottom-Left Stack Container */}
                  <div className="absolute bottom-[60px] left-[60px] flex flex-col items-start whitespace-nowrap">

                    {/* Role Stack */}
                    <div className="flex flex-col font-sans mb-[clamp(20px,3.6vw,58px)]">
                      <span className="text-[clamp(14px,2.2vw,28px)] font-medium tracking-[0.02em] leading-[1.4] text-charcoal/70 normal-case">
                        Product Manager
                      </span>
                      <span className="text-[clamp(14px,2.2vw,28px)] font-medium tracking-[0.02em] leading-[1.4] text-charcoal/70 normal-case">
                        Based in San Francisco
                      </span>
                    </div>

                    {/* Name Stack */}
                    <div className="flex flex-col items-start font-serif font-normal text-[12vw] leading-[0.92] text-charcoal">
                      <span className="tracking-[-0.04em] -ml-[0.06em]">Aditya</span>
                      <span className="text-moss tracking-[-0.02em] -ml-[0.05em]">Vishwakarma</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* LAYER 2: STATIC HERO TEXT (mobile only) */}
      {isMobile && !isFullyRevealed && (
        <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-4 bg-[#FBFAF8]">
          {/* Mobile Camera Icon Button - Top Left */}
          <button
            onClick={handleReveal}
            className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center text-moss hover:text-charcoal transition-colors pointer-events-auto"
          >
            <Camera size={24} />
          </button>

          <h1 className="font-serif leading-none text-charcoal mb-4 whitespace-nowrap text-[clamp(2.5rem,8.5vw,11rem)]">
            Aditya <span className="text-moss font-serif font-normal tracking-[-0.02em]">Vishwakarma</span>
          </h1>
          <div className="w-24 h-[1px] bg-charcoal/20 mx-auto mb-10" />
          <p className="text-lg text-charcoal/60 font-sans tracking-tight">
            Product Manager Based in San Francisco.
          </p>

          {/* Scroll Indicator - Bottom Middle */}
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-charcoal/20">
            <ChevronDown size={32} strokeWidth={1.5} />
          </div>
        </div>
      )}


      {/* UI CONTROLS - Only show Reveal button (Hide is now in header) */}
      <div className="absolute top-10 right-10 z-50 pointer-events-auto">
        <AnimatePresence mode="wait">
          {showRevealButton && !isFullyRevealed && (
            <motion.button
              key="reveal-btn" onClick={handleReveal}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="w-[140px] py-3 bg-moss text-white rounded-full font-sans text-sm tracking-[0.01em] uppercase hover:bg-charcoal transition-all shadow-2xl active:scale-95"
            >
              Reveal
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </section >
  );
};

export default Hero;
