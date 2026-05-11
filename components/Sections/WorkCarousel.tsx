
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PROJECTS } from '../../constants';
import OptimizedImage from '../UI/OptimizedImage';

import { ArrowRight } from 'lucide-react';

// Base offsets
const SPINE_OFFSET = 60;
const MOBILE_SPINE_OFFSET = 40;
const FAN_OUT_EXTRA = 15; // Extra pixels when an individual spine is hovered
const CONTENT_FADE_DELAY = 0.05; // 50ms delay for content fade-in

const WorkCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredSpineIndex, setHoveredSpineIndex] = useState<number | null>(null);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        // setActiveIndex((prev) => Math.min(prev + 1, PROJECTS.length - 1));
        setActiveIndex((prev) => Math.min(prev + 1, 2)); // 3 cards max
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const goToCard = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const baseOffset = isMobile ? MOBILE_SPINE_OFFSET : SPINE_OFFSET;

  return (
    <section
      id="works"
      className="relative w-full bg-background py-20 overflow-hidden min-h-[800px] flex flex-col justify-center"
      style={{ zIndex: 1 }}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full px-6 mb-12 flex justify-between items-end">
        <h2 className="text-5xl md:text-6xl font-serif text-charcoal">
          Selected <span className="text-[#3F6D0D] font-serif font-normal tracking-[-0.02em]">Works</span>
        </h2>
        <div className="flex flex-col items-end gap-2 hidden md:flex">
          <Link
            to="/works"
            className="group inline-flex items-center gap-2 text-charcoal/80 hover:text-moss transition-colors duration-300 font-medium uppercase tracking-widest text-xs"
          >
            View All
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <span className="text-charcoal/40 font-mono text-sm tracking-widest">
            {PROJECTS.length} projects so far
          </span>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full max-w-7xl mx-auto px-6 h-[650px]">
        <div className="relative w-full h-full">
          {/* {PROJECTS.map((project, index) => { */}
          {PROJECTS.slice(0, 3).map((project, index) => {
            const currentProjects = PROJECTS.slice(0, 3);
            const isActive = index === activeIndex;
            const isBehindActive = index > activeIndex;
            const isBeforeActive = index < activeIndex;

            // Z-Index Logic
            let zIndex = 10;
            if (isActive) zIndex = 50;
            else if (isBehindActive) zIndex = currentProjects.length - index;
            else if (isBeforeActive) zIndex = index;

            return (
              <Card
                key={project.id}
                project={project}
                index={index}
                isActive={isActive}
                isBehindActive={isBehindActive}
                isBeforeActive={isBeforeActive}
                zIndex={zIndex}
                activeIndex={activeIndex}
                baseOffset={baseOffset}
                isHovered={hoveredSpineIndex === index}
                onHoverStart={() => setHoveredSpineIndex(index)}
                onHoverEnd={() => setHoveredSpineIndex(null)}
                totalCards={currentProjects.length} // formerly PROJECTS.length
                onClick={() => goToCard(index)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

interface CardProps {
  project: typeof PROJECTS[0];
  index: number;
  isActive: boolean;
  isBehindActive: boolean;
  isBeforeActive: boolean;
  zIndex: number;
  activeIndex: number;
  baseOffset: number;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  totalCards: number;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({
  project,
  index,
  isActive,
  isBehindActive,
  isBeforeActive,
  zIndex,
  activeIndex,
  baseOffset,
  isHovered,
  onHoverStart,
  onHoverEnd,
  totalCards,
  onClick,
}) => {
  // Spine-level hover: only THIS spine fans out
  const spineWidth = isHovered && !isActive ? baseOffset + FAN_OUT_EXTRA : baseOffset;

  // Active card position anchors (stable)
  const stableLeftSpace = activeIndex * baseOffset;
  const stableRightSpace = (totalCards - activeIndex - 1) * baseOffset;

  // Background card positions
  const dynamicBehindLeftPosition = isBehindActive
    ? `calc(100% - ${(totalCards - index) * baseOffset}px)`
    : 'auto';

  // Left spines: shift left on hover so they fan OUTWARD
  const leftSpineHoverShift = isBeforeActive && isHovered ? FAN_OUT_EXTRA : 0;
  const dynamicBeforeLeftPosition = isBeforeActive
    ? `${index * baseOffset - leftSpineHoverShift}px`
    : 'auto';

  // Atmospheric perspective (NO scale change)
  const brightness = isActive ? 1 : 0.94;
  const grayscale = isActive ? 0 : 0.15;

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        filter: `brightness(${brightness}) grayscale(${grayscale})`,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      onHoverStart={!isActive ? onHoverStart : undefined}
      onHoverEnd={!isActive ? onHoverEnd : undefined}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: isActive
          ? `${stableLeftSpace}px`
          : (isBeforeActive ? dynamicBeforeLeftPosition : dynamicBehindLeftPosition),
        width: isActive
          ? `calc(100% - ${stableLeftSpace + stableRightSpace}px)`
          : `${spineWidth}px`,
        zIndex: zIndex,
        cursor: !isActive ? 'pointer' : 'default',
      }}
      onClick={!isActive ? onClick : undefined}
      className={`
        bg-white 
        border border-charcoal/10
        ${isActive ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'}
        overflow-hidden
      `}
    >
      {/* Active Card Content - Fades in with delay */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            key="active-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
              delay: CONTENT_FADE_DELAY,
              ease: 'easeOut'
            }}
            className="w-full h-full flex flex-col"
          >
            <div className="flex-grow grid grid-rows-[55%_45%] h-full">
              <div className="relative bg-charcoal/5 w-full h-full overflow-hidden">
                {project.imageUrl ? (
                  <OptimizedImage
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-charcoal/20 uppercase tracking-widest font-bold">
                    Image
                  </div>
                )}
              </div>

              {/* Footer Grid */}
              <div className="bg-white p-6 md:p-10 grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8 md:gap-16 items-start h-full">
                {/* Left Col */}
                <div className="flex flex-col">
                  <h3 className="text-2xl md:text-4xl font-serif text-charcoal leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-xs font-mono text-charcoal/50 uppercase tracking-widest mt-4">
                    {project.date} // {project.role}
                  </p>
                </div>

                {/* Right Col */}
                <div className="flex flex-col justify-between h-full">
                  <p className="text-charcoal/80 leading-relaxed text-sm md:text-base mb-6 line-clamp-5">
                    {project.fullDescription || project.description}
                  </p>

                  <Link
                    to={project.path}
                    className="self-end group inline-flex items-center gap-2 text-moss font-bold uppercase text-[10px] tracking-widest hover:text-moss/80 transition-colors duration-300"
                  >
                    Read Case Study
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spine Content - Fades out immediately */}
      <AnimatePresence mode="wait">
        {!isActive && (
          <motion.div
            key="spine-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="w-full h-full flex items-center justify-center bg-white"
          >
            <div className={`whitespace-nowrap text-charcoal/60 uppercase tracking-widest font-mono text-[10px] origin-center ${isBeforeActive ? '-rotate-90' : 'rotate-90'}`}>
              {project.title}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorkCarousel;
