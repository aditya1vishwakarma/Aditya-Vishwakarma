
import React, { useState, useEffect } from 'react';
import { motion as motionComponent, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';

// Fix: Cast imports to any to resolve environment-specific type errors
const { Link, useLocation } = ReactRouterDOM as any;
const motion = motionComponent as any;

const Navbar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isHome = location.pathname === '/';
      // Navbar is always visible on subpages, but only shows on scroll on Home page
      if (!isHome) {
        setIsVisible(true);
        return;
      }
      const threshold = window.innerHeight * 0.75;
      setIsVisible(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Works', path: '/works' },
    { label: 'Blog', path: '/blog' },
  ];

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);

    // Smoothly scroll to the global footer (present on all pages)
    const footer = document.getElementById('contact');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <AnimatePresence>
        {(isVisible || isMenuOpen) && (
          <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4 md:px-12 md:py-6 bg-background/75 backdrop-blur-xl border-b border-charcoal/5"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link
                to="/"
                className="font-serif text-xl md:text-2xl tracking-tight text-charcoal group whitespace-nowrap"
                onClick={() => setIsMenuOpen(false)}
              >
                Aditya <span className="text-moss font-serif font-normal tracking-[-0.02em]">Vishwakarma</span>
              </Link>

              {/* DESKTOP NAV */}
              <div className="hidden md:flex items-center gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`font-serif text-xs uppercase tracking-[0.2em] transition-colors ${location.pathname === item.path ? 'text-moss' : 'text-charcoal/40 hover:text-charcoal'}`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="w-[1px] h-3 bg-charcoal/10" />
                <button
                  onClick={handleContactClick}
                  className="font-serif text-xs uppercase tracking-[0.2em] text-charcoal/40 hover:text-moss transition-colors"
                >
                  Contact
                </button>
              </div>

              {/* MOBILE MENU TOGGLE */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-charcoal/5 rounded-full transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center md:hidden"
          >
            <div className="flex flex-col gap-10 text-center px-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`font-serif uppercase tracking-wide text-4xl transition-all duration-300 ${location.pathname === item.path ? 'text-moss' : 'text-charcoal'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-6 items-center">
                <div className="w-12 h-[1px] bg-charcoal/10" />
                <button
                  onClick={handleContactClick}
                  className="font-serif text-lg uppercase tracking-[0.2em] text-charcoal/60 hover:text-moss transition-colors"
                >
                  Contact
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
