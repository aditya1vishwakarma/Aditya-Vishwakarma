import React from 'react';
import type { MoodBoardItem } from '../../types';
import Squircle from './Squircle';

interface MoodBoardCardProps {
  item: MoodBoardItem;
  isPopup?: boolean;
  /** Render all text as solid white (used by the mobile tap preview over its dark scrim). */
  whiteText?: boolean;
  /**
   * Add SVG refraction (feDisplacementMap backdrop-filter) to bend the backdrop
   * like real glass. Renders in Chromium; iOS Safari ignores it (blur stays).
   * Requires <GlassRefractionFilter /> mounted once on the page.
   */
  refractive?: boolean;
}

// Soft, layered drop shadow (Apple-esque). Lives on the Squircle's outer
// wrapper so corner-smoothing (clip-path) never clips it away.
const CARD_SHADOW =
  '0 8px 16px -4px rgba(0,0,0,0.05), 0 16px 24px -4px rgba(0,0,0,0.05), 0 24px 32px -4px rgba(0,0,0,0.05)';

// Specular edge — a bright inner rim + a top highlight so the pane catches
// light like a bevelled glass edge (the strongest "it's glass" cue).
const GLASS_EDGE =
  'inset 0 1px 1px rgba(255,255,255,0.55), inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 -12px 26px -20px rgba(0,0,0,0.22)';

// Fine fractal-noise grain, tiled — the "frost" scatter. Rendered at 7% opacity.
const FROST_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E\")";

/**
 * Mount once per page. Defines the SVG displacement filter used for refraction.
 * (A hidden <svg> — has no visual footprint.)
 */
export const GlassRefractionFilter: React.FC = () => (
  <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
    <filter id="mb-glass-refraction" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="turb" />
      <feGaussianBlur in="turb" stdDeviation="2" result="soft" />
      {/* scale = refraction strength ("100%") */}
      <feDisplacementMap in="SourceGraphic" in2="soft" scale="26" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
);

const MoodBoardCard: React.FC<MoodBoardCardProps> = ({
  item,
  isPopup = false,
  whiteText = false,
  refractive = false,
}) => {
  return (
    <Squircle
      radius={28}
      shadow={CARD_SHADOW}
      wrapperClassName={`w-full ${!isPopup ? 'hover:-translate-y-1 transition-transform duration-300' : ''}`}
      style={{
        position: 'relative',
        padding: '12px',
        // Dark, lower-opacity gray glass for the tap preview (white text over a
        // dark scrim); light cream for the in-page cards (dark text, light page).
        background: whiteText ? 'rgba(138, 138, 143, 0.42)' : 'rgba(251, 250, 248, 0.60)',
        // blur = frost thickness, saturate = glassy vividness of the backdrop.
        backdropFilter: 'blur(14px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.8)',
        boxShadow: GLASS_EDGE,
      }}
      onClick={(e: React.MouseEvent) => {
        if (isPopup) e.stopPropagation();
      }}
    >
      {/* Refraction — first child so it displaces only the page backdrop, never
          the card's own image/text. No-ops in browsers without SVG backdrops. */}
      {refractive && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backdropFilter: 'url(#mb-glass-refraction)',
            WebkitBackdropFilter: 'url(#mb-glass-refraction)',
          }}
        />
      )}

      <div className="relative flex flex-col">
        <div className="flex-shrink-0">
          <Squircle radius={16} className="w-full">
            <img
              src={item.imageUrl}
              alt={item.title}
              loading={isPopup ? 'eager' : 'lazy'}
              decoding="async"
              className={`w-full h-auto object-cover block ${isPopup ? 'max-h-[70vh]' : ''}`}
            />
          </Squircle>
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
          <h2 className={`font-serif font-semibold text-[22px] md:text-[24px] leading-tight tracking-tight ${whiteText ? 'text-[#FFFFFF]' : 'text-charcoal'}`}>
            {item.title}
          </h2>

          <p className={`text-[15px] leading-snug font-sans ${whiteText ? 'text-[#FFFFFF]' : 'text-[#847D72]'}`}>
            {item.description}
          </p>

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between group text-[10px] uppercase tracking-widest transition-colors pt-3 border-t mt-2 ${whiteText ? 'text-[#FFFFFF] hover:text-white border-white/25' : 'text-charcoal/40 hover:text-[#3F6D0D] border-charcoal/8'}`}
            >
              <span>Visit Source</span>
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </a>
          )}
        </div>
      </div>

      {/* Frost grain — last child so the scatter sits over the whole pane at 7%. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: FROST_NOISE,
          opacity: 0.07,
          mixBlendMode: 'overlay',
        }}
      />
    </Squircle>
  );
};

export default MoodBoardCard;
