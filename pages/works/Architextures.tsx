import React from 'react';
import WritingLayout from '../../components/Writing/WritingLayout';
import OptimizedImage from '../../components/UI/OptimizedImage';

const Architextures = () => {
  return (
    <WritingLayout
      title="Architextures: Curate and tag architectural inspirations"
      category="iOS Development"
      date="June 2026"
      readTime="5 min read"
      backLink={{ path: '/works', label: 'Back to Works' }}
    >
      <div className="mb-16">
        <p className="text-xl leading-relaxed mb-6">
          An iOS app that photographs, classifies, and curates architecture using nothing beyond the frameworks already on your phone.
        </p>
      </div>

      <div className="full-bleed mb-16">
        <OptimizedImage
          src="https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/projectvideos/app%20images.jpg"
          alt="Brutalist concrete architecture"
          className="w-full h-[50vh] md:rounded-squircle hidden md:block"
        />
        <OptimizedImage
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600"
          alt="Brutalist concrete architecture"
          className="w-full h-[300px] md:hidden"
        />
      </div>

      <div className="mb-16">
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          Architextures is an app for people who notice these nuances of wonderful architecture aroudn them and want a place to organize them when the native Photos app won't cut it. This is the user persona I created for a very real issue I face in my life.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          The premise is simple. Photograph architecture, interior design, and the app tells you what it sees: materials, structural elements, stylistic periods. You accept, reject, or add your own labels. Over time, your library becomes a personal taxonomy of the built world, organized by the descriptors that matter to you.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          Rather than have my references get lost in my camera roll or end up endlessly scrolling ‘inspiration’ boards on pintrest or instagram, I used frameworks like Vision and CreateML to help me capture the beauty of the world around me.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-serif mb-6 text-moss">Zero dependencies, fully on-device</h2>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          This app is built with Apple's native frameworks ONLY: SwiftData for persistence, Vision for image classification, AVFoundation for the camera, CoreLocation for GPS, MapKit for the location experience, and UIKit and SwiftUI together for the interface.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          All machine learning inference runs on-device through <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">VNClassifyImageRequest</code>. Vision returns roughly 1,300 taxonomy identifiers with confidence scores for any given image. Most of those describe the natural world. "FloIr." "Dog." For an architecture app, that raw output is almost entirely noise.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-serif mb-6 text-moss">The architectural mapping layer</h2>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          The solution is a curated translation dictionary: a static property list that maps Vision's taxonomy identifiers to architectural terms. When Vision returns <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">material</code> with high confidence, the dictionary resolves it to "Mosaic Tile" under the Element category. When it returns <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">building</code>, the dictionary knows what that means in an architectural context and how to surface it.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          Identifiers that have no match in the dictionary are dropped entirely. This is deliberate. A suggestion that reads "outdoor" or "recreation" teaches the user nothing about the building they photographed. By filtering aggressively at the mapping layer, I ensure that every suggestion surfaced to the user is architecturally meaningful.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          The mapping is a maintained resource. It is intentionally non-exhaustive today, strong on materials and structural elements, thinner on style (which waits for a dedicated CoreML classifier). It is designed to grow.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-serif mb-6 text-moss">Staging, not guessing</h2>
        <div className="my-8 pl-6 border-l-4 border-moss py-2">
          <p className="font-serif italic text-2xl text-charcoal/70 leading-relaxed">
            "A tag does not exist in the database until a person says it should."
          </p>
        </div>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          The inference pipeline produces suggestions, not facts. Each Vision result that survives the mapping layer becomes a <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">TagSuggestion</code>: a temporary staging object that holds the identifier, its human-readable name, its confidence score, and its proposed category. The suggestion is linked to the individual photo it was generated from. It carries no resolved tag. Its <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">targetTag</code> field is nil.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          Tags are canonical. They live in a shared library with a unique constraint on the name field. They belong to photo groups, not individual photos. A <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">Tag</code> is created or reused only when the user explicitly accepts a suggestion during the save transaction. This separation betIen inference output and user-confirmed metadata is the backbone of the data architecture. It means the app never pollutes the user's library with machine-generated labels they did not choose.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          Unaccepted suggestions are cleaned up. Anything older than 24 hours that was never converted into a tag relationship is purged automatically by a background janitor service.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-serif mb-6 text-moss">The unit of curation</h2>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          The core organizational tenet is the <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">PhotoGroup</code>. A single import creates one group. A multi-photo import also creates one group. The home grid, the data queries, the tag relationships, the favorites, the description: all of these live on the group.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          This means a user who photographs a building from three angles and imports those three photos gets one card in their library, one set of tags, one description, favorite toggle and map location.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          The inference pipeline, however, still runs per-photo (each image may surface different materials or elements), and suggestions from all photos in the group are presented together. The accepted tags land on the group. This provides breadth of per-image analysis with the clarity of per-subject organization.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-serif mb-6 text-moss">UIKit where it matters, SwiftUI where it fits</h2>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          The home screen is a masonry grid. Early versions used SwiftUI's <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">LazyVStack</code> with a column-balancing pre-pass. It worked for sample data. It would not have worked at scale: eager layout computation, no true cell reuse, no prefetching.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          I moved the home shell to UIKit. <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">UICollectionViewCompositionalLayout</code> computes the masonry incrementally, per section. <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">UICollectionViewDiffableDataSource</code> feeds it from a batched <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">FetchDescriptor</code>. Prefetching decodes upcoming thumbnails off the main thread. The staggered opening animation is driven imperatively through cell appearance callbacks.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          Inside those cells, the card content is still SwiftUI, hosted via <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">UIHostingConfiguration</code>. The detail view, the tag suggestion editor, the filter sheet: all SwiftUI. The camera is UIKit and AVFoundation. Each framework is used where its strengths are clearest.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-serif mb-6 text-moss">The camera and deferred processing</h2>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          The capture experience prioritizes a balanced session between responsiveness and quality. Zero-shutter-lag is enabled. Fast capture prioritization is on. A readiness coordinator gates the shutter button on the camera's actual ready state, so the button is honest: if you can tap it, the shot will land.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          During a capture session, nothing else happens. No Vision inference, no thumbnail generation, no SwiftData writes. Each shot is written to a temporary file and that is all. The camera stays fast because the camera only does camera work.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          Processing is deferred to the moment you tap "Use Photos." At that point, a single <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">PhotoGroup</code> is created, 600px thumbnails are generated, EXIF GPS is extracted (or CoreLocation coordinates are written into the image metadata for geotagging), and the detail view opens in edit mode. Vision classification runs on appear, and the tag suggestion editor presents itself with the results organized by category: Style, Element, Vibe.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          This flow means you go from shutter to curated entry in one continuous gesture. Capture, review, tag, describe, save.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-serif mb-6 text-moss">Coming Iterations</h2>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          The Stage 3 CoreML style classifier (Art Deco, Brutalist, Mid-Century Modern) is designed in the data architecture and has a place in the pipeline. It has not been trained yet. When it arrives, it will run independently of the Vision pipeline, produce its own <code className="bg-charcoal/5 px-1.5 py-0.5 rounded text-sm font-mono">TagSuggestion</code> objects, and surface alongside the mapped results. The staging layer is already waiting for it.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          Pagination is partial. The grid fetches in batches of 200, sorted by most recently updated. True offset-based paging and a full-text search strategy are both noted for when the library size demands them.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-serif mb-6 text-moss">The shape of the work</h2>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          Architextures is a small app with a specific point of view. It is built on the belief that on-device intelligence, local persistence, and careful data modeling can produce an experience that feels considered and fast, without reaching for anything beyond the platform.
        </p>
        <p className="text-lg leading-relaxed text-charcoal/70 mb-4">
          The constraints I started with turned out to be generative. Having no server meant every feature had to justify its data model locally. Having no dependencies meant understanding every framework I used at the API level. Having a staging layer betIen inference and the user's library meant I had to design the entire flow around human judgment, which is, in the end, the whole point of a curation app.
        </p>

      </div>
    </WritingLayout>
  );
};

export default Architextures;
