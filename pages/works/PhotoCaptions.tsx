import React from 'react';
import WritingLayout from '../../components/Writing/WritingLayout';
import { Section, Quote } from '../../components/Writing/Prose';

const PhotoCaptions = () => {
  return (
    <WritingLayout
      title="Shared Memories &amp; Captions"
      category="Un-Selected Works"
      backLink={{ path: '/works', label: 'Back to Works' }}
    >
      <Section>
        <Quote className="mt-12">
          This is a preliminary idea, but when we create memories in the native Photos app, we should be able to caption photos, tag contacts who the collection is shared with, etc. This makes it a lot more collaborative and makes it feel more like a scrapbook to be shared and is more personal than just a simple shared album.
        </Quote>
      </Section>
    </WritingLayout>
  );
};

export default PhotoCaptions;
