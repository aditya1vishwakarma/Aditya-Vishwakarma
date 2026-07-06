import React from 'react';
import WritingLayout from '../../components/Writing/WritingLayout';
import { Section, Lead, P, H2, Quote, InlineCode, Img } from '../../components/Writing/Prose';

const Architextures = () => {
  return (
    <WritingLayout
      title="Architextures: Curate and tag architectural inspirations"
      category="iOS Development"
      date="June 2026"
      readTime="5 min read"
      backLink={{ path: '/works', label: 'Back to Works' }}
    >
      <Section>
        <Lead>
          An iOS app that photographs, classifies, and curates architecture using nothing beyond the frameworks already on your phone.
        </Lead>
      </Section>

      <Img
        src="https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/projectvideos/app%20images.jpg"
        alt="Brutalist concrete architecture"
        bleed="full"
        className="mb-16"
      />

      <Section>
        <P>
          Architextures is an app for people who notice these nuances of wonderful architecture around them and want a place to organize them when the native Photos app won't cut it. This is the user persona I created for a very real issue I face in my life.
        </P>
        <P>
          The premise is simple. Photograph architecture, interior design, and the app tells you what it sees: materials, structural elements, stylistic periods. You accept, reject, or add your own labels. Over time, your library becomes a personal taxonomy of the built world, organized by the descriptors that matter to you.
        </P>
        <P>
          Rather than have my references get lost in my camera roll or end up endlessly scrolling 'inspiration' boards on pintrest or instagram, I used frameworks like Vision and CreateML to help me capture the beauty of the world around me.
        </P>
      </Section>

      <Section>
        <H2>Zero dependencies, fully on-device</H2>
        <P>
          This app is built with Apple's native frameworks ONLY: SwiftData for persistence, Vision for image classification, AVFoundation for the camera, CoreLocation for GPS, MapKit for the location experience, and UIKit and SwiftUI together for the interface.
        </P>
        <P>
          All machine learning inference runs on-device through <InlineCode>VNClassifyImageRequest</InlineCode>. Vision returns roughly 1,300 taxonomy identifiers with confidence scores for any given image. Most of those describe the natural world. "Floor." "Dog." For an architecture app, that raw output is almost entirely noise.
        </P>
      </Section>

      <Section>
        <H2>The architectural mapping layer</H2>
        <P>
          The solution is a curated translation dictionary: a static property list that maps Vision's taxonomy identifiers to architectural terms. When Vision returns <InlineCode>material</InlineCode> with high confidence, the dictionary resolves it to "Mosaic Tile" under the Element category. When it returns <InlineCode>building</InlineCode>, the dictionary knows what that means in an architectural context and how to surface it.
        </P>
        <P>
          Identifiers that have no match in the dictionary are dropped entirely. This is deliberate. A suggestion that reads "outdoor" or "recreation" teaches the user nothing about the building they photographed. By filtering aggressively at the mapping layer, I ensure that every suggestion surfaced to the user is architecturally meaningful.
        </P>
        <P>
          The mapping is a maintained resource. It is intentionally non-exhaustive today, strong on materials and structural elements, thinner on style (which waits for a dedicated CoreML classifier). It is designed to grow.
        </P>
      </Section>

      <Section>
        <H2>Staging, not guessing</H2>
        <Quote>"A tag does not exist in the database until a person says it should."</Quote>
        <P>
          The inference pipeline produces suggestions, not facts. Each Vision result that survives the mapping layer becomes a <InlineCode>TagSuggestion</InlineCode>: a temporary staging object that holds the identifier, its human-readable name, its confidence score, and its proposed category. The suggestion is linked to the individual photo it was generated from. It carries no resolved tag. Its <InlineCode>targetTag</InlineCode> field is nil.
        </P>
        <P>
          Tags are canonical. They live in a shared library with a unique constraint on the name field. They belong to photo groups, not individual photos. A <InlineCode>Tag</InlineCode> is created or reused only when the user explicitly accepts a suggestion during the save transaction. This separation between inference output and user-confirmed metadata is the backbone of the data architecture. It means the app never pollutes the user's library with machine-generated labels they did not choose.
        </P>
        <P>
          Unaccepted suggestions are cleaned up. Anything older than 24 hours that was never converted into a tag relationship is purged automatically by a background janitor service.
        </P>
      </Section>

      <Section>
        <H2>The unit of curation</H2>
        <P>
          The core organizational tenet is the <InlineCode>PhotoGroup</InlineCode>. A single import creates one group. A multi-photo import also creates one group. The home grid, the data queries, the tag relationships, the favorites, the description: all of these live on the group.
        </P>
        <P>
          This means a user who photographs a building from three angles and imports those three photos gets one card in their library, one set of tags, one description, favorite toggle and map location.
        </P>
        <P>
          The inference pipeline, however, still runs per-photo (each image may surface different materials or elements), and suggestions from all photos in the group are presented together. The accepted tags land on the group. This provides breadth of per-image analysis with the clarity of per-subject organization.
        </P>
      </Section>

      <Section>
        <H2>UIKit where it matters, SwiftUI where it fits</H2>
        <P>
          The home screen is a masonry grid. Early versions used SwiftUI's <InlineCode>LazyVStack</InlineCode> with a column-balancing pre-pass. It worked for sample data. It would not have worked at scale: eager layout computation, no true cell reuse, no prefetching.
        </P>
        <P>
          I moved the home shell to UIKit. <InlineCode>UICollectionViewCompositionalLayout</InlineCode> computes the masonry incrementally, per section. <InlineCode>UICollectionViewDiffableDataSource</InlineCode> feeds it from a batched <InlineCode>FetchDescriptor</InlineCode>. Prefetching decodes upcoming thumbnails off the main thread. The staggered opening animation is driven imperatively through cell appearance callbacks.
        </P>
        <P>
          Inside those cells, the card content is still SwiftUI, hosted via <InlineCode>UIHostingConfiguration</InlineCode>. The detail view, the tag suggestion editor, the filter sheet: all SwiftUI. The camera is UIKit and AVFoundation. Each framework is used where its strengths are clearest.
        </P>
      </Section>

      <Section>
        <H2>The camera and deferred processing</H2>
        <P>
          The capture experience prioritizes a balanced session between responsiveness and quality. Zero-shutter-lag is enabled. Fast capture prioritization is on. A readiness coordinator gates the shutter button on the camera's actual ready state, so the button is honest: if you can tap it, the shot will land.
        </P>
        <P>
          During a capture session, nothing else happens. No Vision inference, no thumbnail generation, no SwiftData writes. Each shot is written to a temporary file and that is all. The camera stays fast because the camera only does camera work.
        </P>
        <P>
          Processing is deferred to the moment you tap "Use Photos." At that point, a single <InlineCode>PhotoGroup</InlineCode> is created, 600px thumbnails are generated, EXIF GPS is extracted (or CoreLocation coordinates are written into the image metadata for geotagging), and the detail view opens in edit mode. Vision classification runs on appear, and the tag suggestion editor presents itself with the results organized by category: Style, Element, Vibe.
        </P>
        <P>
          This flow means you go from shutter to curated entry in one continuous gesture. Capture, review, tag, describe, save.
        </P>
      </Section>

      <Section>
        <H2>Coming Iterations</H2>
        <P>
          The Stage 3 CoreML style classifier (Art Deco, Brutalist, Mid-Century Modern) is designed in the data architecture and has a place in the pipeline. It has not been trained yet. When it arrives, it will run independently of the Vision pipeline, produce its own <InlineCode>TagSuggestion</InlineCode> objects, and surface alongside the mapped results. The staging layer is already waiting for it.
        </P>
        <P>
          Pagination is partial. The grid fetches in batches of 200, sorted by most recently updated. True offset-based paging and a full-text search strategy are both noted for when the library size demands them.
        </P>
      </Section>

      <Section>
        <H2>The shape of the work</H2>
        <P>
          Architextures is a small app with a specific point of view. It is built on the belief that on-device intelligence, local persistence, and careful data modeling can produce an experience that feels considered and fast, without reaching for anything beyond the platform.
        </P>
        <P>
          The constraints I started with turned out to be generative. Having no server meant every feature had to justify its data model locally. Having no dependencies meant understanding every framework I used at the API level. Having a staging layer betIen inference and the user's library meant I had to design the entire flow around human judgment, which is, in the end, the whole point of a curation app.
        </P>
      </Section>
    </WritingLayout>
  );
};

export default Architextures;
