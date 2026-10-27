import React, { useState, useRef } from 'react';
import { motion as motionComponent, useInView } from 'framer-motion';

const motion = motionComponent as any;

type EmbedType = 'youtube' | 'figma' | 'spotify' | 'generic';

interface EmbedContainerProps {
  url: string;
  type: EmbedType;
  title: string;
  previewImage?: string;
  aspectRatio?: string; // e.g. "aspect-video" or custom Tailwnind class
  className?: string;
}

const EmbedContainer: React.FC<EmbedContainerProps> = ({
  url,
  type,
  title,
  previewImage,
  aspectRatio,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "200px 0px" });
  const [isInteractive, setIsInteractive] = useState(false);

  // We hydrate when either: the user clicks the facade, or if they just scroll it into view 
  // (for better UX, maybe we auto-hydrate Spotify/YouTube when scrolled close, but let user click to play).
  // Currently, the prompt said: "Show a lightweight preview image/skeleton and only hydrate the full iframe on intersection or user interaction."
  // We'll hydrate iframe upon intersection, so it's ready.

  const shouldHydrate = isInView || isInteractive;

  // Type specific setups
  let iframeSrc = url;
  let finalAspectRatio = aspectRatio;

  if (type === 'youtube') {
    finalAspectRatio = finalAspectRatio || 'aspect-video'; // 16/9
    // auto-convert watch URLs to embed URLs if needed, assuming the user passes correct embed urls for now
  } else if (type === 'spotify') {
    finalAspectRatio = finalAspectRatio || 'aspect-[4/3]'; // roughly fits standard small spotify player
    className += ' rounded-[12px] overflow-hidden'; // Match spotify player border-radius
  } else if (type === 'figma') {
    finalAspectRatio = finalAspectRatio || 'aspect-video';
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-charcoal/[0.03] rounded-squircle 
        ${finalAspectRatio || 'aspect-video'} 
        ${className}
      `}
      onClick={() => setIsInteractive(true)}
    >
      {/* Facade layer */}
      {!isInteractive && previewImage && (
        <div className="absolute inset-0 z-10 cursor-pointer group">
          <img src={previewImage} alt={`Preview of ${title}`} decoding="async" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-background/80 backdrop-blur-md px-6 py-3 rounded-full text-charcoal font-sans text-sm font-bold uppercase tracking-widest shadow-lg">
              Load Interactive Embed
            </div>
          </div>
        </div>
      )}

      {/* Skeleton / Shimmer shown before hydration */}
      {!shouldHydrate && !previewImage && (
        <div className="absolute inset-0 z-0 animate-[shimmer_2s_infinite]" 
             style={{
               background: 'linear-gradient(90deg, rgba(51,51,51,0.02) 0%, rgba(51,51,51,0.06) 50%, rgba(51,51,51,0.02) 100%)',
             }} 
        />
      )}

      {/* Actual inline frame populated on hydration */}
      {shouldHydrate && (
        <iframe
          src={iframeSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full border-0 z-0"
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default EmbedContainer;
