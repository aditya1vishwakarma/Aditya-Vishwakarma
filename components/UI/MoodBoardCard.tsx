import React from 'react';
import type { MoodBoardItem } from '../../types';

interface MoodBoardCardProps {
  item: MoodBoardItem;
  isPopup?: boolean;
}

const MoodBoardCard: React.FC<MoodBoardCardProps> = ({ item, isPopup = false }) => {
  return (
    <div
      className={`w-full ${!isPopup ? 'hover:-translate-y-1 transition-transform duration-300' : ''}`}
      style={{
        borderRadius: '28px',
        padding: '12px',
        background: 'rgba(251, 250, 248, 0.60)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 8px 16px -4px rgba(0,0,0,0.05), 0 16px 24px -4px rgba(0,0,0,0.05), 0 24px 32px -4px rgba(0,0,0,0.05)',
        transform: 'translateZ(0)'
      }}
      onClick={(e: React.MouseEvent) => {
        if (isPopup) e.stopPropagation();
      }}
    >
      <div className="flex flex-col">
        <div className="flex-shrink-0">
          <div
            className="w-full overflow-hidden"
            style={{ 
              borderRadius: '16px',
              transform: 'translateZ(0)',
              WebkitMaskImage: '-webkit-radial-gradient(white, black)'
            }}
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              loading={isPopup ? 'eager' : 'lazy'}
              decoding="async"
              className={`w-full h-auto object-cover block ${isPopup ? 'max-h-[70vh]' : ''}`}
            />
          </div>
        </div>

        <div
          className="flex flex-col gap-[5px] flex-shrink-0"
          style={{
            paddingTop: '14px',
            paddingBottom: '10px',
            paddingLeft: '14px',
            paddingRight: '14px',
            background: 'transparent',
          }}
        >
          <h2 className="font-serif font-semibold text-[22px] md:text-[24px] text-charcoal leading-tight tracking-tight">
            {item.title}
          </h2>

          <p className="text-[#847D72] text-[15px] leading-snug font-sans">
            {item.description}
          </p>

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between group text-[10px] uppercase tracking-widest text-charcoal/40 hover:text-[#3F6D0D] transition-colors pt-3 border-t border-charcoal/8 mt-2"
            >
              <span>Visit Source</span>
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodBoardCard;
