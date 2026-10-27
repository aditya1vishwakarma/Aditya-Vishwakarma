import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import * as ReactRouterDOM from 'react-router-dom';
import '../index.css';
import HomeHero from '../components/Home/HomeHero';
import type { MapleHandle } from '../components/Maple/MapleScene';

const { HashRouter } = ReactRouterDOM as any;

/**
 * The site's one page — the maple, with the name, title, nav, pane and
 * controls over it — for working on away from the site, and some ways in by
 * the address: a season to open in, a gust a few seconds after load, the
 * page without its controls, or the scene alone.
 */

const params = new URLSearchParams(window.location.search);
const asked = params.get('season');

const MapleDev: React.FC = () => {
  const handle = useRef<MapleHandle | null>(null);

  useEffect(() => {
    const at = Number(params.get('gust'));
    if (!at) return;
    const timer = window.setTimeout(() => handle.current?.gust(), at * 1000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <HashRouter>
      <HomeHero
        season={asked === 'autumn' || asked === 'summer' ? asked : undefined}
        handle={handle}
        overlay={params.get('hero') !== '0'}
        controls={params.get('hud') !== '0'}
      />
    </HashRouter>
  );
};

createRoot(document.getElementById('root')!).render(<MapleDev />);
