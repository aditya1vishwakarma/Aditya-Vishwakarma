import React, { useState, useEffect } from 'react';
import { motion as motionComponent, AnimatePresence } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { Project } from '../../types';
import { ArrowRight } from 'lucide-react';

const { Link } = ReactRouterDOM as any;
const motion = motionComponent as any;

interface ArchivedProjectItemProps {
    project: Project;
}

const ArchivedProjectItem: React.FC<ArchivedProjectItemProps> = ({ project }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    // Detect mobile viewport (<600px)
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 600);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleInteraction = (e: React.MouseEvent) => {
        if (isMobile) {
            if (!isExpanded) {
                e.preventDefault();
                setIsExpanded(true);
            } else {
                setIsExpanded(false);
            }
        }
    };

    const handleMouseEnter = () => {
        if (!isMobile) {
            setIsExpanded(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            setIsExpanded(false);
        }
    };

    return (
        <motion.article
            layout
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="rounded-lg -mx-4 px-4 py-8 border-b border-charcoal/10 last:border-b-0 cursor-pointer"
            style={{
                backgroundColor: isExpanded ? 'rgba(46, 79, 10, 0.03)' : 'transparent',
                boxShadow: isExpanded
                    ? '0 8px 32px -8px rgba(46, 79, 10, 0.12), 0 4px 16px -4px rgba(0, 0, 0, 0.04)'
                    : '0 0 0 0 transparent',
                transition: 'background-color 300ms cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 300ms cubic-bezier(0.25, 0.1, 0.25, 1)'
            }}
        >
            <Link
                to={project.path}
                className="flex items-center justify-between gap-6"
                onClick={handleInteraction}
            >
                {/* LEFT: Metadata */}
                <div className="shrink-0 w-full md:w-1/4">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-charcoal/40 font-bold block">
                        {project.date}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-moss font-bold mt-1 block">
                        {project.category}
                    </span>
                </div>

                {/* CENTER: Title + Blooming Description */}
                <div className="flex-1 min-w-0">
                    <motion.h2
                        className="font-serif text-3xl md:text-4xl text-charcoal leading-snug"
                        animate={{ x: isExpanded ? 4 : 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        {project.title}
                    </motion.h2>

                    {/* Static Description */}
                    <p className="text-base text-charcoal/80 leading-relaxed font-sans mt-4">
                        {project.description}
                    </p>
                </div>

                {/* RIGHT: Centered Arrow */}
                <div className="shrink-0 w-8 flex items-center justify-center">
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.span
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                className="text-moss"
                            >
                                <ArrowRight size={24} strokeWidth={1.5} />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </Link>
        </motion.article>
    );
};

export default ArchivedProjectItem;
