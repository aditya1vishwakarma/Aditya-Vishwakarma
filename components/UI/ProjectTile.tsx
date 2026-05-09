import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import OptimizedImage from '../UI/OptimizedImage';
import { Project } from '../../types';

interface ProjectTileProps {
    project: Project;
}

const ProjectTile: React.FC<ProjectTileProps> = ({ project }) => {
    return (
        <Link to={project.path} className="group block relative w-full">
            <motion.div
                className="w-full bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] group-hover:scale-[1.02] group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-moss/30 border border-transparent"
            >
                {/* Image Container - No Radius */}
                <div className="relative aspect-[3/2] w-full overflow-hidden">
                    <OptimizedImage
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700"
                        aspectRatio="aspect-auto"
                    />
                    {/* Subtle overlay on hover if needed, but user asked for minimal animations */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/2 transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="p-5 md:p-6 flex flex-col items-start gap-4">
                    <div>
                        <span className="text-xs font-mono text-charcoal/50 uppercase tracking-widest mb-2 block">
                            {project.category}
                        </span>
                        <h3 className="text-xl md:text-2xl font-serif text-charcoal">
                            {project.title}
                        </h3>
                    </div>

                    <p className="text-charcoal/70 text-sm leading-relaxed line-clamp-2">
                        {project.description}
                    </p>

                    <span className="text-moss font-bold text-xs uppercase tracking-widest mt-2 group-hover:translate-x-2 transition-transform duration-300">
                        Read Case Study →
                    </span>
                </div>
            </motion.div>
        </Link>
    );
};

export default ProjectTile;
