
import React from 'react';
import { motion as motionComponent } from 'framer-motion';
import Hero from '../components/Sections/Hero';
import About from '../components/Sections/About';
import WorkCarousel from '../components/Sections/WorkCarousel';
import BlogPreview from '../components/Sections/BlogPreview';

// Fix: Cast motion to any to resolve property existence type errors
const motion = motionComponent as any;

const Home: React.FC = () => {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <About />
      <WorkCarousel />
      <BlogPreview />
    </motion.main>
  );
};

export default Home;
