import React, { useEffect, useState } from 'react';
import { motion as motionComponent, useSpring, useMotionValue } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { isMobileViewport } from '../../constants';

const motion = motionComponent as any;

interface Props {
  /** What's being read scrolls in this: the pane's scroll. */
  scroller: React.RefObject<HTMLElement | null>;
}

/**
 * How far through a piece the reader is: a ring that fills as they go, in the
 * pane's bottom corner, that takes them back to the top. Pointed at, or at
 * the end, it says so. Only for a piece long enough to scroll.
 */
const CircularScrollIndicator: React.FC<Props> = ({ scroller }) => {
  const progressValue = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  // Smooth the scroll progress so the circle fills organically
  const smoothProgress = useSpring(progressValue, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const read = () => {
      const most = el.scrollHeight - el.clientHeight;
      const progress = most > 0 ? Math.min(Math.max(el.scrollTop / most, 0), 1) : 1;
      progressValue.set(progress);
      setIsFinished(progress >= 0.99);
      // At least 50px to scroll before it's worth showing.
      setIsScrollable(most > 50);
      setIsMobile(isMobileViewport());
    };
    read();
    el.addEventListener('scroll', read, { passive: true });
    // The piece grows as its pictures arrive.
    const ro = new ResizeObserver(read);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener('scroll', read);
      ro.disconnect();
    };
  }, [scroller, progressValue]);

  const handleScrollToTop = () => {
    scroller.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showText = isMobile ? isFinished : isHovered || isFinished;

  if (!isScrollable) return null;

  return (
    <motion.button
      onClick={handleScrollToTop}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.9, width: 40 }}
      animate={{
        opacity: 1,
        scale: 1,
        width: showText ? 160 : 40,
      }}
      transition={{
        width: { type: 'spring', stiffness: 260, damping: 26 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
      }}
      className={`
        absolute bottom-[22px] right-[22px] z-10 flex items-center justify-end overflow-hidden
        backdrop-blur-[20px] backdrop-saturate-150
        text-charcoal font-sans text-xs uppercase tracking-widest font-bold
        cursor-pointer
      `}
      style={{
        height: '40px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 0%)',
        boxShadow: 'inset 0 1.5px 1px rgba(255, 255, 255, 0.4), inset 0 -1px 1px rgba(0,0,0,0.05), 0 20px 60px -12px rgba(0,0,0,0.20)',
      }}
    >
      {/* "Back to Top" Text */}
      <motion.div
        initial={false}
        animate={{
          opacity: showText ? 1 : 0,
          scale: showText ? 1 : 0.95,
          x: showText ? 0 : 15,
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 26,
          delay: showText ? 0.05 : 0,
        }}
        className="whitespace-nowrap pl-[20px] pr-[48px]"
      >
        Back to Top
      </motion.div>

      {/* The 40x40 circle, pinned to the right: the text opens out to its left. */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[40px] h-[40px] pointer-events-none"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isMobile && !isFinished && <ChevronUp size={16} style={{ color: 'var(--color-moss)', position: 'relative', zIndex: 1 }} />}

        {/* Background track */}
        <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="20" cy="20" r="15" fill="transparent" stroke="rgba(51,51,51,0.08)" strokeWidth="2.5" />
        </svg>

        {/* Foreground progress ring */}
        <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
          <motion.circle
            cx="20"
            cy="20"
            r="15"
            fill="transparent"
            stroke="var(--color-moss)"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ pathLength: smoothProgress }}
          />
        </svg>
      </div>
    </motion.button>
  );
};

export default CircularScrollIndicator;
