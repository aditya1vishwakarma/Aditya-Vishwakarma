
import React from 'react';
import { motion as motionComponent } from 'framer-motion';
import { MOOD_BOARD } from '../../constants';

// Fix: Cast motion to any to resolve property existence type errors
const motion = motionComponent as any;

const MoodBoard: React.FC = () => {
  return (
    <section id="mood-board" className="py-24 bg-[#F5F4F0]">
      <div className="px-6 md:px-12 mb-12 max-w-7xl mx-auto">
        <h2 className="font-serif text-5xl text-charcoal">Mood & Inspiration</h2>
        <p className="mt-4 text-charcoal/60">Hover to explore details.</p>
      </div>

      <div className="relative w-full overflow-x-auto pb-16 hide-scrollbar cursor-grab active:cursor-grabbing">
        <div className="flex gap-8 px-6 md:px-12 w-max">
          {MOOD_BOARD.map((item) => {
            const isLandscape = item.orientation === 'landscape';
            const widthClass = isLandscape ? "w-[400px] md:w-[600px]" : "w-[280px] md:w-[350px]";

            return (
              <motion.div
                key={item.id}
                className={`relative ${widthClass} h-[400px] md:h-[500px] rounded-squircle overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-moss/20 transition-all duration-500 bg-white`}
                whileHover={{
                  y: -20,
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                {/* Pop-up Card Content on Hover */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-charcoal/80 flex flex-col justify-center items-center text-center p-6 backdrop-blur-sm"
                >
                  <h3 className="font-serif text-3xl text-white mb-2">{item.title}</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-xs uppercase tracking-wider text-white border border-white/30 px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MoodBoard;
