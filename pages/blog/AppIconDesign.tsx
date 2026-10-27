import React from 'react';
import WritingLayout from '../../components/Writing/WritingLayout';
import * as Prose from '../../components/Writing/Prose';
const { Section, Lead, P, H2, Bold, List, ListItem, Img, MediaGallery } = Prose;

const AppIconDesign = () => {
  return (
    <WritingLayout
      title="Learning App Icon Design"
      category="Design"
      date="October 2026"
      readTime="3 min read"
    >
      <Section>
        <Lead>
          I've never created a logo before. Let alone an app icon, so this is a quick documentation of the creative process and thought process that went into making my icon for Placemarks, my iOS app.
        </Lead>
        <P>
          In short, below is how I made my first app icon and evolved it to what it is now:
        </P>

        {/* TODO: paste CDN link */}
        <Img
          src="https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/Blog%20Post%20Assets/Icon%20Design%20Assets/iconcompare.avif"
          alt="The evolution of the Placemarks app icon"
          bleed="wide"
          priority
        />
      </Section>

      <Section>
        <P>
          I started the same way that I start a lot of my creative works. I ask myself, what do I want this to communicate, and what do I want it to feel like? The answers to these questions were:
        </P>
        <List type="numbered">
          <ListItem><Bold>Communication —</Bold> Clearly communicate this is an architecturally focused app.</ListItem>
          <ListItem><Bold>Feel —</Bold> Modern, premium. Utilize Liquid Glass icon components.</ListItem>
        </List>
      </Section>

      <Section>
        <H2>Inspiration</H2>
        <P>
          I typically don't go online for inspiration or curation. Since I treat photography as a way to "save" what I liked about the world, I just refer back to my old photos. Below are some of the images that I considered. Hills, buildings, shapes, etc.
        </P>

        {/* Paste CDN links into `items`. Each entry: { src, alt, caption? } */}
        <MediaGallery
          bleed="wide"
          orientation="square"
          items={[
            { src: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/Blog%20Post%20Assets/Icon%20Design%20Assets/IMG_9283.avif', alt: 'Inspo 1' },
            { src: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/Blog%20Post%20Assets/Icon%20Design%20Assets/IMG_9255.avif', alt: 'Inspo 2' },
            { src: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/Blog%20Post%20Assets/Icon%20Design%20Assets/_DSF1299.avif', alt: 'Insp 3' },
            {src: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/Blog%20Post%20Assets/Icon%20Design%20Assets/_DSF1242.avif', alt: 'Inspo 4'},
            {src: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/Blog%20Post%20Assets/Icon%20Design%20Assets/IMG_6222.avif', alt: 'Inspo 5'}
          ]}
          caption="All of the photos above are taken by me. You can see where I eventually get the shape of the hill from in the app icon"
        />
      </Section>

      <Section>
        <H2>The First Iteration/Concept</H2>
        <P>
          My initial ideas were to center the icon on nature. Architecture is the art of interacting with our environments as humans. Furthermore, I think the future of it really will be adapting to nature instead of a historic pattern of conquering it. I think this was the inspiration to have something that indicated nature well but was minimal. From my photography, I naturally came to the idea of a hill. A simple green line, with a building perched atop.
        </P>
        <P>
          For the building, my inspiration came from the college campus of UCSD. I ADORE the Geisel Library's architecture and its sharp contrasting shapes. So I decided to take the hill and the library and combine it into my first icon concept. Pictured below.
        </P>

        {/* TODO: paste CDN link */}
        <Img
          src="https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/Blog%20Post%20Assets/Icon%20Design%20Assets/initialicon.avif"
          alt="First icon concept: a green hill line with an abstract of Geisel perched on it."
          caption="First icon concept: a green hill line with an abstract of Geisel perched on it."
        />
      </Section>

      <Section>
        <H2>Feedback</H2>
        <P>
          This concept, however, was not the most clear, upon showing it to friends and family. People thought it looked like some analytics tool with the line for the hill looking like a graph, and the stacked layers of the 'building' as a bar chart. So I had to go back and re-evaluate.
        </P>
        <P>
          I think what worked for me was the building. I love the shape of it and the sheer contrast it provides. The green hill line was the most unclear, so I took it out, and focused on the building itself. What worked out though in this was that Geisel Library is a brutalist building. The nature of a brutalist building is inherently to provide a large contrast between the surrounding environment and itself. Exactly the type of contrast an app icon needs to signal the app's function. So I had to make an icon "unmistakably a building".
        </P>

        {/* TODO: paste CDN link */}
        <Img
          src="https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/Blog%20Post%20Assets/Icon%20Design%20Assets/IMG_3159.jpeg"
          alt="A few iterations/ideations of what a new icon woudl be like."
          caption="A few iterations/ideations of what a new icon woudl be like."
        />
      </Section>

      <Section>
        <H2>Why I Prefer to Sketch </H2>
        <P>
          Sketching it out really helped, because, for abstract concepts like what this app icon had now become, I prefer to sketch and use physical methods of ideation rather than put stuff into Claude and ask it to spit out a bunch of variations at me. That's useful for prototyping but not for creative work, in my opinion. Sketching allows my brain to focus in on the intention of the 2 questions I mentioned at the start of the post. It needs to communicate that it's an architecture-focused app, and it has to feel "good".
        </P>
        <P>
          So I ended up with the 8 ideas above. And from there, I decided that a closeup of Geisel would be the best. From here it was easy to go back to Figma, make the shapes, export to SVG and optimize in Icon Composer. What I ended up with was the icon set below, and I'm super proud of it. It's not perfect but it's good.
        </P>
        <P>
          I evolved the icon from using the exact shape of Geisel to a more 'clean' version for the icon, and that's how the current shape came to be.
        </P>

        {/* Paste CDN links into `items`. Each entry: { src, alt, caption? } */}
        <MediaGallery
          bleed="wide"
          items={[
            { src: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/Blog%20Post%20Assets/Icon%20Design%20Assets/Slant%20Building.avif', alt: 'Final Placemarks icon' },
            {src: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/Blog%20Post%20Assets/Icon%20Design%20Assets/Perchnoperch.avif', alt: 'Sketch of the final icon shape' },
            { src: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/Blog%20Post%20Assets/Icon%20Design%20Assets/finalicon.avif', alt: 'Final Placemarks icon variant' },
          ]}
          caption="The final Placemarks icon set."
        />
      </Section>
    </WritingLayout>
  );
};

export default AppIconDesign;
