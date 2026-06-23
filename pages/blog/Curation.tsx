import React from 'react';
import WritingLayout from '../../components/Writing/WritingLayout';

const Curation = () => {
  return (
    <WritingLayout
      title="On Curation"
      date="Random Note, 2025"
      readTime="1 min read"
      category="Random Thoughts"
      backLink={{ path: '/blog', label: 'Back to Journal' }}
    >
      <div className="mb-16">
        <p className="text-xl leading-relaxed text-charcoal/80 mb-8 italic border-l-4 border-moss/40 pl-6">
          "Good artists copy, great artists steal" by Piccaso.
        </p>

        <p className="mb-8">
          Curation is the core of anyone's creative prowess.
          <br />
          To me, the core of this message is not that you have to be extremely original, or you have to copy others work. It's more that we don't put enough emphasis on what "steal" means.
        </p>
        <p className="text-charcoal/70 mb-0">
          Stealing is curation. I'm going to live my life consuming things, forming opinions about them, and one day, if I'm lucky enough to make something truly of my own. I'm going to draw from those inpirations. These are not things that I explicitly made, but are things I want to combine with other things I like.
        </p>
      </div>
    </WritingLayout>
  );
};

export default Curation;
