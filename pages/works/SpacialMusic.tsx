import React from 'react';
import WritingLayout from '../../components/Writing/WritingLayout';
import { Section, Lead, P, InlineCode, Img, H2, H3 } from '../../components/Writing/Prose';

const SpacialMusic = () => {
  return (
    <WritingLayout
      title="Spatial Album Art - A cool, unrealistic idea."
      category="Product Manager"
      date="May 2026"
      readTime="3 min read"
      backLink={{ path: '/works', label: 'Back to Works' }}
    >
      <Section className="mb-8">
        <H2>Ideation</H2>
        <P>
          As a user of Apple Music, I noticed that a lot of albums had gorgeous full-screen album art either in the media player, or on the lock screen. Others didn’t. What if I could work on something that would allow every album art to go full screen? This is where I leaned into iOS’s existing feature set. Just as you can do on a lock screen, the feature would analyze the album art, segment the subjects and make “spatial Album Art”.
        </P>
        <P>
          The main subject would get separated, the user can tilt the device, and the subject of the cover lifts off the background with a parallax effect. Behind it, a color-matched MeshGradient breathes slowly, just like in full-screen artwork now.
        </P>
        <P>
          The thesis behind the prototype was that Apple's spatial capabilities and Apple Music could unify into a more continuous experience across platforms. The lock screen would evolve into a spatial scene not just for wallpapers, but music too. Spatial album art would give artists who don’t have resources to put towards a full-screen album art video, a level playing field on users’ devices. AND the user would feel continuity in their lock screen experience across both spatial wallpaper or spatial album art.
        </P>

        <H3>This is sort of where the idea fails as well:</H3>
        <P>
          For this feature to ship as a real product, it would require an artist program where artists and labels can provide their own spatial layers, or at minimum approve a generated result. That is a meaningful investment in tooling, partnerships, and workflow. A MUCH heavier lift for this feature than anticipated. Mainly because it breaks a central rule of iOS’s product philosophy: No tampering with user or partner content. The legal ramifications of altering album artwork with vision would be huge. Which meant that the feature that would be shipped would be something that might look great for some artwork, but other times misrepresents someone else’s. That is not a product quality bar that would fly anywhere, especially Apple without moving huge mountains.
        </P>

        <H3>Prototype (?)</H3>
        <P>
          I did, however, prototype it just for fun, to almost no success. The intention being that this would be structured as an “internal demo”. So the experience that would be shaped would be allowing users to switch between the lock screen and the music player. And allows the user to spatial-ize any selected album art image they would want. The whole demo would run on-device using Vision for subject extraction, SceneKit for the spatial layers, and CoreMotion for head-tracked motion.
        </P>
        <P>
          I built the prototype targeting iOS 26 on my iPhone Air. Two modes: a simulated lock screen (since developers are not allowed to develop for iOS lock screens), and a full-screen music player with functional media controls. The user would be allowed to choose between a slew of albums just using the native photoPicker. The initial build had a 4-layer rendering stack: animated gradient, blurred background plane, SwiftUI overlay, and the extracted foreground at 1.3x scale breaking the square frame. None of this really happened in the first few iterations.
        </P>
        <P>
          The core framework of the experience is Vision's <InlineCode>VNGenerateForegroundInstanceMaskRequest</InlineCode>. It analyzes the image (album cover), pulls the foreground subject from the background, and renders them on separate planes. This works well on photographic covers. On illustrated or abstract art, the results range from imperfect to wrong. I planned fallbacks for that, including hand-made PNGs and single-plane rendering when extraction failed. I just never got to it because I had an idea for an actual app (Architextures) that I could make. I didn’t want to put my energy into something I think would be DOA anyways.
        </P>
        <Img
          src="https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/projectvideos/IMG_2420.PNG"
          alt="Spatial Music Screenshot"
          caption="Demo home page"
          capped={true}
        />
        <Img
          src="https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/projectvideos/IMG_2421.PNG"
          alt="Spatial Music Screenshot"
          caption="The first run of the music player subject separation - terrible! XD"
          capped={true}
        />

        <P>
          But the core of it is still tampering with user content that I found myself having to optimize for: When the subject was extracted, the device, therefore iOS would be making an editorial choice about that art on the artist's behalf. Vision decides what the foreground is, how much it scales, what the blur is, and what the background extends. None of that was the artist's intent.
        </P>
        <P className="mb-0">
          Furthermore, at WWDC 2026, with image extension for photos, this feature could be even more robust. The background of album art could be extended to however much it needed to scale for the device screen size and subject lift and zoom factors. But I already scrapped the idea, hence why it is an Un-Selected Work.
        </P>
      </Section>
    </WritingLayout>
  );
};

export default SpacialMusic;
