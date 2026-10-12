import React from 'react';
import { motion as motionComponent, AnimatePresence } from 'framer-motion';
import { buttonSize, pillClass } from './ShelfAbout';
import type { MuseumTheme } from './museumTheme';

const motion = motionComponent as any;

interface Props {
  theme: MuseumTheme;
  onToggle: () => void;
  visible: boolean;
  /** Phone-sized. */
  compact?: boolean;
}

/** Switches the wall between cream and slate. Shows the mode you'd switch to. */
const ThemeToggle: React.FC<Props> = ({ theme, onToggle, visible, compact = false }) => {
  const dark = theme.mode === 'dark';
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onToggle}
      className={`${pillClass(theme, compact)} relative flex items-center justify-center overflow-hidden active:scale-95 ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      style={{ width: buttonSize(compact), height: buttonSize(compact) }}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.svg
          key={theme.mode}
          width={compact ? 17 : 20}
          height={compact ? 17 : 20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0, rotate: -40, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 40, scale: 0.8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {dark ? (
            // Sun
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
            </>
          ) : (
            // Moon
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
          )}
        </motion.svg>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
