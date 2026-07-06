import React from 'react';
import WritingLayout from '../../components/Writing/WritingLayout';
import { Section, Lead, P, InlineCode } from '../../components/Writing/Prose';

const SpacialMusic = () => {
  return (
    <WritingLayout
      title="Spatial Album Art: What I Explored and Why I Shelved It"
      category="Product Manager"
      date="April 2026"
      readTime="3 min read"
      backLink={{ path: '/works', label: 'Back to Works' }}
    >
      <Section className="mb-8">
        <Lead>
          The idea was simple and, I think, genuinely good: what if the lock screen and Music player treated album art as a living, spatial surface? You tilt your phone, and the foreground subject of the cover lifts off the background with real parallax. Behind it, a color-matched MeshGradient breathes slowly, filling the screen with the album's palette. The whole thing runs on-device using Vision for subject extraction, SceneKit for the spatial layers, and CoreMotion for head-tracked motion. No server calls. No external dependencies. Pure platform.
        </Lead>
      </Section>

      <Section>
        <P>
          I built the prototype targeting iOS 26 on iPhone Air. Two modes: a simulated lock screen with spatial immersive and standard states, and a full-screen music player with functional transport controls. Five albums, hand-picked for diversity between photographic and stylized covers. The rendering stack was a four-layer sandwich: animated gradient, blurred background plane, SwiftUI overlay, and the extracted foreground at 1.3x scale breaking the square frame. At 120Hz on ProMotion hardware, the effect was genuinely beautiful. It felt like the album was breathing.
        </P>
        <P>
          The thesis behind the prototype was that Apple's spatial capabilities and Apple Music could unify into a single sensory brand. The 2D lock screen is starting to feel like a legacy surface. Spatial album art would give Music a visual identity that matched the ambition of the platform.
        </P>
        <P>
          I knew going in that this idea had a ceiling. I built it anyway because I needed to see it.
        </P>
        <P>
          The core mechanic of the experience is automated subject extraction. Vision's <InlineCode>VNGenerateForegroundInstanceMaskRequest</InlineCode> analyzes the album cover, pulls the foreground subject off the background, and renders them on separate planes. This works well on photographic covers. On illustrated or abstract art, the results range from imperfect to wrong. I planned fallbacks for that, including hand-made PNGs and single-plane rendering when extraction failed.
        </P>
        <P>
          But the real constraint was never technical. It was philosophical, and I recognized it before I wrote the first line of code. Album art is an artist's creative decision. The cover of an album is designed as a single, composed image. When I run subject extraction and separate the layers, I am making an editorial choice about that art on the artist's behalf. I am deciding what the foreground is. I am deciding how much to scale it. I am deciding to blur and extend the background. None of that was the artist's intent.
        </P>
        <P>
          Apple has a strong and correct position on respecting creator content. Apple does not crop, recolor, or reinterpret artwork without the artist or label's explicit participation. The spatial photo features on iPhone work because those photos belong to the user. Album art does not. It belongs to the artist and the label. I agree with that position. It is the right one.
        </P>
        <P>
          For this feature to ship as a real product, it would require an artist tools program where creators provide their own spatial layers, or at minimum approve the generated result. That is a meaningful investment in tooling, partnerships, and workflow. It is a different product than what I prototyped.
        </P>
        <P>
          What I proved is that the rendering pipeline works and that the visual result is compelling when the source material cooperates. The MeshGradient ambient feel is strong on its own and could have legs in other contexts. The spatial SceneKit sandwich at 120Hz is smooth and the motion response feels right. The prototype did exactly what I needed it to do: it confirmed the visual thesis and clarified the boundary.
        </P>
        <P>
          What I also confirmed is something I suspected from the start. The most interesting version of this idea requires artist participation that does not exist today. Without it, I would be shipping a feature that sometimes looks great and sometimes misrepresents someone's work. That is not a quality bar I would accept, and I would not ask anyone else to accept it either.
        </P>
        <P className="mb-0">
          I am shelving the prototype. The rendering techniques and the ambient gradient work are worth keeping in mind for future explorations where the content is user-owned or artist-provided. The spatial album art concept itself should wait until there is a real path to artist collaboration. I would rather kill something I like than ship something I know is wrong.
        </P>
      </Section>
    </WritingLayout>
  );
};

export default SpacialMusic;
