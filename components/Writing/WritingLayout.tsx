import React, { useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion as motionComponent } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import CircularScrollIndicator from './CircularScrollIndicator';

const { Link } = ReactRouterDOM as any;
const motion = motionComponent as any;

interface WritingLayoutProps {
  children: React.ReactNode;
  title?: string;
  date?: string;
  readTime?: string;
  category?: string;
  backLink?: {
    path: string;
    label: string;
  };
}

const WritingLayout: React.FC<WritingLayoutProps> = ({ 
  children, 
  title, 
  date, 
  readTime, 
  category, 
  backLink = { path: '/', label: 'Back' }
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-background min-h-screen relative selection:bg-moss/20 selection:text-moss-light">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="pt-24 pb-32 px-6 md:px-8 max-w-none relative"
      >
        <CircularScrollIndicator />

        <div className="editorial-grid relative">
          {/* Header Section (falls into the reading column text block) */}
          <div className="mb-6">
            <Link to={backLink.path} className="inline-flex items-center gap-2 text-charcoal/40 hover:text-moss mb-12 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="uppercase tracking-widest text-[10px] font-bold">{backLink.label}</span>
            </Link>

            {/* Optional Metadata */}
            {(date || readTime || category) && (
              <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-widest text-charcoal/40 mb-6 font-bold pb-6 border-b border-charcoal/10">
                {date && <span>{date}</span>}
                {date && (readTime || category) && <span className="w-1 h-1 bg-charcoal/20 rounded-full" />}
                {readTime && <span>{readTime}</span>}
                {readTime && category && <span className="w-1 h-1 bg-charcoal/20 rounded-full" />}
                {category && <span className="text-moss">{category}</span>}
              </div>
            )}

            {/* Title */}
            {title && (
              <h1 className="font-serif fluid-heading-desktop text-charcoal leading-[1.1] tracking-tight mb-8">
                {title}
              </h1>
            )}
          </div>

          {/* 
            Content Block: The editorial grid handles sizing. 
            Standard elements like <p>, <ul> fall into the central grid column.
            Images and embeds can break out with "full-bleed" or "wide-bleed".
          */}
          <article ref={containerRef} className="col-span-full grid grid-cols-subgrid text-charcoal/80 fluid-text-lg font-serif">
            {children}
          </article>
        </div>
      </motion.div>
    </div>
  );
};

export default WritingLayout;
