
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Works from './pages/Works';
import Blog from './pages/Blog';
import MoodBoardMuseumPage from './pages/MoodBoardMuseumPage';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// Individual Blog Posts
import Curation from './pages/blog/Curation';
import Nostalgia from './pages/blog/Nostalgia';

// Individual Project Pages
import DJXProject from './pages/works/DJXProject';
import Placemarks from './pages/works/Placemarks';
import SpacialMusic from './pages/works/SpacialMusic';
import PhotoCaptions from './pages/works/PhotoCaptions';
import AMDesktopRed from './pages/works/AMDesktopRed';
import LocallyHostedApps from './pages/works/LocallyHostedApps';

const { HashRouter, Routes, Route, Navigate, useLocation } = ReactRouterDOM as any;

/** The mood board's home. Its old addresses redirect here. */
const MIND_MUSEUM = '/mindmuseum';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  React.useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      // Small delay to ensure the Home component is mounted before scrolling
      setTimeout(() => {
        const el = document.getElementById(hash.slice(1));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname, hash]);
  return null;
};

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isMoodBoard = location.pathname === MIND_MUSEUM;

  return (
    <div className="min-h-screen bg-background text-charcoal font-sans selection:bg-moss selection:text-white overflow-x-hidden">
      {!isMoodBoard && <Navbar />}
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
      {!isMoodBoard && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/works" element={<Works />} />
          <Route path="/blog" element={<Blog />} />
          <Route path={MIND_MUSEUM} element={<MoodBoardMuseumPage />} />
          {/* Old addresses for the mood board, kept so existing links still land. */}
          <Route path="/moodboard" element={<Navigate to={MIND_MUSEUM} replace />} />
          <Route path="/moodboard-museum" element={<Navigate to={MIND_MUSEUM} replace />} />

          {/* Project Routes */}
          <Route path="/works/djx-project" element={<DJXProject />} />
          <Route path="/works/placemarks" element={<Placemarks />} />
          <Route path="/works/SpacialMusic" element={<SpacialMusic />} />
          <Route path="/works/photo-captions" element={<PhotoCaptions />} />
          <Route path="/works/AMDesktopRed" element={<AMDesktopRed />} />
          <Route path="/works/locally-hosted-apps" element={<LocallyHostedApps />} />

          {/* Blog Routes */}
          <Route path="/blog/curation" element={<Curation />} />
          <Route path="/blog/nostalgia" element={<Nostalgia />} />
        </Routes>
      </LayoutWrapper>
    </HashRouter>
  );
};

export default App;
