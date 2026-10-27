import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import HomeHero from './components/Home/HomeHero';
import MoodBoardMuseumPage from './pages/MoodBoardMuseumPage';

const { HashRouter, Routes, Route, Navigate } = ReactRouterDOM as any;

/** The mood board's home. Its old addresses redirect here. */
const MIND_MUSEUM = '/mindmuseum';

/**
 * The site is one page — the maple, and the pane over it — at every address
 * but the museum's, which is a room of its own. What the pane shows is read
 * from the address (components/Home/routes.tsx), so every old link to a
 * project or a post still opens it.
 */
const App: React.FC = () => (
  <HashRouter>
    <div className="min-h-screen bg-background text-charcoal font-sans selection:bg-moss selection:text-white overflow-x-hidden">
      <Routes>
        <Route path={MIND_MUSEUM} element={<MoodBoardMuseumPage />} />
        {/* Old addresses for the mood board, kept so existing links still land. */}
        <Route path="/moodboard" element={<Navigate to={MIND_MUSEUM} replace />} />
        <Route path="/moodboard-museum" element={<Navigate to={MIND_MUSEUM} replace />} />
        <Route path="*" element={<HomeHero />} />
      </Routes>
    </div>
  </HashRouter>
);

export default App;
