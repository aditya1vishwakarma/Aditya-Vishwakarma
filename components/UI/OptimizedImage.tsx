
import React, { useState } from 'react';
import { motion as motionComponent, AnimatePresence } from 'framer-motion';

const motion = motionComponent as any;

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  priority?: boolean;
  srcSet?: string;
  sizes?: string;
  width?: number | string;
  height?: number | string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  aspectRatio = "aspect-square",
  priority = false,
  srcSet,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  width,
  height
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${className} bg-charcoal/[0.03]`}>
      <AnimatePresence>
        {!isLoaded && !error && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-10"
          >
            <div
              className="absolute inset-0 animate-[shimmer_2s_infinite]"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
              }}
            />
            <div className="w-full h-full bg-moss/5 backdrop-blur-xl" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        width={width}
        height={height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
        animate={{
          opacity: isLoaded ? 1 : 0,
          scale: isLoaded ? 1 : 1.05,
          filter: isLoaded ? 'blur(0px)' : 'blur(10px)'
        }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1]
        }}
        className={`w-full h-full object-cover ${className}`}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-charcoal/5 text-charcoal/20 text-xs uppercase tracking-widest">
          Image unavailable
        </div>
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

export default OptimizedImage;
