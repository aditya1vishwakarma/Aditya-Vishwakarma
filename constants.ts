
import { Project, BlogPost, MoodBoardItem } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Apple Music - Spatial Album Art',
    category: 'Exploration',
    description: 'An exploration of what Apple Music could look like with spatial album art effects.',
    fullDescription: 'The Alpine Retreat project focuses on minimal environmental impact while maximizing comfort. Using locally sourced timber and stone, the structure blends seamlessly into the mountainside.',
    imageUrl: 'https://images.unsplash.com/photo-1518128958364-65859d70aa41?q=80&w=1200',
    date: 'May 2026',
    role: 'Product Manager',
    path: '/works/alpine-retreat'
  },
  {
    id: '2',
    title: 'Keep this Vibe - DJ X',
    category: 'Exploration',
    description: 'Idea to Prototype to PRD for a feature that helps DJ X keep the vibe going for long listening sessions sessions.',
    fullDescription: 'We crafted a visual identity for "Botanical" that whispers rather than shouts. The typography is elegant and understated, paired with a color palette derived from dried herbs.',
    imageUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200',
    date: 'April 2026',
    role: 'Product Manager',
    path: '/works/botanical-brand'
  },
  {
    id: '3',
    title: 'Un-Selected Works',
    category: 'Archive',
    description: 'A collection of ideas that I couldn\'t vouch for, but are still worth sharing.',
    fullDescription: 'These are ideas that I had for a product or feature, but upon further exploration, I found that I couldn\'t vouch for them for one reason or another.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200', // Placeholder image, feel free to change
    date: 'Various',
    role: 'Explorer',
    path: '/works#unselected-works'
  },
  {
    id: '4',
    title: 'Nordic Furniture',
    category: 'Product Design',
    description: 'Ergonomic seating inspired by glacial forms.',
    fullDescription: 'This furniture collection emphasizes clean lines and functional beauty. Each piece is crafted from steam-bent ash wood.',
    imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200',
    date: 'Feb 2024',
    role: 'Product Designer',
    path: '/works/nordic-furniture'
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Invisible Hand of Design',
    date: 'March 12, 2024',
    readTime: '6 min read',
    category: 'Philosophy',
    excerpt: 'Exploring how the most impactful product decisions are often the ones users never explicitly notice.',
    path: '/blog/invisible-hand',
    content: `Design is not just what it looks like and feels like...`
  },
  {
    id: '2',
    title: 'Growth as a Design Problem',
    date: 'Feb 24, 2024',
    readTime: '4 min read',
    category: 'Product',
    excerpt: 'Why sustainable growth requires a deep understanding of user aesthetics and mental models.',
    path: '/blog/growth-as-design',
    content: `Growth is often treated as a series of hacks...`
  },
  {
    id: '3',
    title: 'Nature’s Grid Systems',
    date: 'Jan 15, 2024',
    readTime: '8 min read',
    category: 'Aesthetics',
    excerpt: 'What we can learn about layout and hierarchy from the golden ratio and organic patterns.',
    path: '/blog/natures-grid',
    content: `The mountains don't have a style guide...`
  },
  {
    id: '4',
    title: 'Placeholder Article One',
    date: 'Jan 30, 2026',
    readTime: '5 min read',
    category: 'Design',
    excerpt: 'This is a placeholder summary for your first new article. It will bloom beautifully on the writings index page.',
    path: '/blog/placeholder-one',
    content: 'Placeholder content for article one.'
  },
  {
    id: '5',
    title: 'Placeholder Article Two',
    date: 'Jan 30, 2026',
    readTime: '8 min read',
    category: 'Product',
    excerpt: 'A second placeholder summary. Notice how the category \'Product\' will allow users to filter for this post.',
    path: '/blog/placeholder-two',
    content: 'Placeholder content for article two.'
  },
  {
    id: '6',
    title: 'Placeholder Article Three',
    date: 'Jan 30, 2026',
    readTime: '12 min read',
    category: 'Philosophy',
    excerpt: 'The third and final placeholder. This one is tagged \'Philosophy\' to demonstrate the varied filtering categories.',
    path: '/blog/placeholder-three',
    content: 'Placeholder content for article three.'
  }
];

// ─────────────────────────────────────────────────────────────
// MOOD BOARD PANES
// To add a new pane: duplicate any entry below and update fields.
// imageUrl → replace with your CDN link
// orientation → 'landscape' or 'portrait' (controls panel sizing)
// link → optional external source link
// ─────────────────────────────────────────────────────────────
export const MOOD_BOARD: MoodBoardItem[] = [
  // ── 1–5: Architecture & Space ──
  { id: '1', title: 'Nurture by Porter Robinson', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/Nurture%20Visuals%202.avif', tags: ['Clean', 'Light', 'Space'], description: 'Perhaps my favorite album of all time. The visuals on this album and the subsequent tour had a major impact in my relationship with nature and how I view the world.', orientation: 'landscape', link: 'https://jackentee.com/project/porter-robinson' },
  { id: '2', title: 'Organic Forms', imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800', tags: ['Nature', 'Curves', 'Green'], description: 'Drawing inspiration from the fractals of fern leaves and the weathering of stone.', orientation: 'portrait', link: 'https://unsplash.com/photos/fern-leaves-f009c37129b9' },
  { id: '3', title: 'Brutalist Concrete', imageUrl: 'https://images.unsplash.com/photo-1517816428104-797678c7cf0c?q=80&w=800', tags: ['Concrete', 'Raw', 'Form'], description: 'The beauty of exposed structure and unapologetic materiality.', orientation: 'landscape' },
  { id: '4', title: 'Glass Facade', imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=800', tags: ['Glass', 'Reflection', 'Modern'], description: 'Light bending through geometry — transparent architecture.', orientation: 'portrait' },
  { id: '5', title: 'Desert Dwelling', imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=800', tags: ['Arid', 'Earth', 'Shelter'], description: 'Structures born from the landscape they inhabit.', orientation: 'landscape' },

  // ── 6–10: Nature & Texture ──
  { id: '6', title: 'Nurture By Porter Robinson (again)', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/Nurture%20Visuals%203.avif', tags: ['Moss', 'Zen', 'Texture'], description: 'Another one from Nurture. The interaction between nature, our digital world, and a hopeful message is what makes this album deeply meaningful to me.', orientation: 'landscape', link: 'https://jackentee.com/project/porter-robinson' },
  { id: '7', title: 'Ocean Surface', imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=800', tags: ['Water', 'Calm', 'Blue'], description: 'Infinite gradients formed by light meeting water.', orientation: 'landscape' },
  { id: '8', title: 'Driftwood', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800', tags: ['Wood', 'Erosion', 'Found'], description: 'Time sculpts what human hands cannot replicate.', orientation: 'landscape' },
  { id: '9', title: 'Mountain Fog', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800', tags: ['Fog', 'Summit', 'Mystery'], description: 'Peaks dissolving into atmosphere — where solid meets void.', orientation: 'portrait' },
  { id: '10', title: 'Dry Earth', imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800', tags: ['Cracks', 'Drought', 'Pattern'], description: 'Fractal patterns emerge when water retreats.', orientation: 'landscape' },

  // ── 11–15: Design & Typography ──
  { id: '11', title: 'The iPad 2', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/iPad-2-ad.avif', tags: ['Grid', 'Swiss', 'System'], description: 'This was the first iPad that I ever got. The thin design that formed around your hands along with the magnetic smart folio got my 13 year-old self extremely excited.', orientation: 'landscape', link: 'https://support.apple.com/en-us/111990' },
  { id: '12', title: 'Neon Glow', imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800', tags: ['Neon', 'Night', 'Glow'], description: 'Electric light as medium — signage as art.', orientation: 'landscape' },
  { id: '13', title: 'Ink on Paper', imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800', tags: ['Ink', 'Print', 'Craft'], description: 'The weight of a single mark on an empty page.', orientation: 'portrait' },
  { id: '14', title: 'Color Swatch', imageUrl: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?q=80&w=800', tags: ['Color', 'Palette', 'System'], description: 'Curated hues speaking in harmony.', orientation: 'landscape' },
  { id: '15', title: 'Letterpress', imageUrl: 'https://images.unsplash.com/photo-1473090826765-d54ac2fdc1eb?q=80&w=800', tags: ['Type', 'Press', 'Tactile'], description: 'Each character carrying the impression of physical force.', orientation: 'portrait' },

  // ── 16–20: Product & Object ──
  { id: '16', title: 'Nurture by Porter Robinson | Tour Visuals', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/Nurture%20Visuals.avif', tags: ['Ceramic', 'Craft', 'Form'], description: 'The Nurture Tour was full of the same themes of appreciating life. Our relationship with nature and having hope for the future.', orientation: 'landscape', link: 'https://jackentee.com/project/porter-robinson' },
  { id: '17', title: 'Works of Hayden Clay', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800', tags: ['Steel', 'Industrial', 'Curve'], description: 'Pictured: Track & Field. Hayden is a 3D artist that portrays the natural world through with a very surreal lens. His words: I’m particular interested in blurring the line between dreams and reality, creating sensations of strange tranquility" I resonate with these themes heavily as that is I also think about art and the world. ', orientation: 'landscape', link: 'https://www.haydenclay.com/other-work' },
  { id: '18', title: 'Linen Fold', imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=800', tags: ['Textile', 'Soft', 'Natural'], description: 'Fabric at rest — the poetry of drape.', orientation: 'portrait' },
  { id: '19', title: 'Watch Movement', imageUrl: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=800', tags: ['Precision', 'Mechanical', 'Detail'], description: 'Engineered beauty at microscopic scale.', orientation: 'landscape' },
  { id: '20', title: 'Camera Lens', imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800', tags: ['Optics', 'Glass', 'Tool'], description: 'The instrument that frames how we see.', orientation: 'portrait' },

  // ── 21–25: Light & Music ──
  { id: '21', title: 'Sixteen Oceans by Four Tet', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/Sixteen%20Oceans.avif', tags: ['Light', 'Window', 'Interior'], description: 'This is a deeply personal album for me, as it brings me back to a similar place as Nurture does. But in a much more self-guided, introspective way.', orientation: 'landscape', link: 'https://fourtet.bandcamp.com/album/sixteen-oceans' },
  { id: '22', title: 'Random Access Memories by Daft Punk', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/daft%20punk.avif', tags: ['Shadow', 'Contrast', 'Drama'], description: 'These guys are just the coolest ever. And RAM is a beautiful album built around the appreciation of music.', orientation: 'landscape', link: 'https://daftpunk.com/releases/random-access-memories' },
  { id: '23', title: 'Golden Hour', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800', tags: ['Warm', 'Gold', 'Horizon'], description: 'The moment when everything glows.', orientation: 'landscape' },
  { id: '24', title: 'Silhouette', imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=800', tags: ['Dark', 'Shape', 'Outline'], description: 'Identity reduced to its most essential contour.', orientation: 'portrait' },
  { id: '25', title: 'Candlelight', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800', tags: ['Flame', 'Warm', 'Intimate'], description: 'The oldest form of artificial light.', orientation: 'landscape' },

  // ── 26–30: Urban & Street ──`
  { id: '26', title: 'Chronograph Watches', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800', tags: ['Japan', 'Neon', 'Street'], description: 'Density as energy — compressed urban beauty.', orientation: 'landscape', link: 'https://revolutionwatch.com/the-complete-guide-to-patek-philippe-vintage-chronographs/' },
  { id: '27', title: 'Subway Tile', imageUrl: 'https://images.unsplash.com/photo-1517732306149-e8f829eb588a?q=80&w=800', tags: ['Tile', 'Grid', 'Underground'], description: 'Repeating geometry beneath the city.', orientation: 'landscape' },
  { id: '28', title: 'Fire Escape', imageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=800', tags: ['Metal', 'Urban', 'Pattern'], description: 'Functional iron rendered beautiful through repetition.', orientation: 'portrait' },
  { id: '29', title: 'Crosswalk', imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=800', tags: ['Lines', 'Motion', 'City'], description: 'The rhythm of movement painted on asphalt.', orientation: 'landscape' },
  { id: '30', title: 'Rooftop View', imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=800', tags: ['Skyline', 'Scale', 'Perspective'], description: 'Cities seen from above become abstract compositions.', orientation: 'landscape' },

  // ── 31–35: Art & Emotion ──
  { id: '31', title: 'Abstract Canvas', imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800', tags: ['Abstract', 'Paint', 'Emotion'], description: 'Color and gesture without the constraint of representation.', orientation: 'portrait' },
  { id: '32', title: 'Marble Sculpture', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800', tags: ['Marble', 'Classical', 'Form'], description: 'Stone made soft by a sculptor\'s patience.', orientation: 'portrait' },
  { id: '33', title: 'Film Grain', imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800', tags: ['Film', 'Analog', 'Nostalgia'], description: 'The texture of memory captured in silver halide.', orientation: 'landscape' },
  { id: '34', title: 'Dance Motion', imageUrl: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?q=80&w=800', tags: ['Movement', 'Body', 'Grace'], description: 'The human form expressing what words cannot.', orientation: 'portrait' },
  { id: '35', title: 'Wabi-Sabi', imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800', tags: ['Imperfect', 'Aged', 'Beauty'], description: 'Finding elegance in the incomplete and transient.', orientation: 'landscape' },

  // ── 36–40: Miscellaneous Inspiration ──
  { id: '36', title: 'Starfield', imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=800', tags: ['Space', 'Stars', 'Infinite'], description: 'Looking up to remember how small design problems really are.', orientation: 'landscape' },
  { id: '37', title: 'Bicycle Frame', imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=800', tags: ['Geometry', 'Transport', 'Minimal'], description: 'Function distilled into its purest structural form.', orientation: 'landscape' },
  { id: '38', title: 'Coffee Pour', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800', tags: ['Ritual', 'Warm', 'Daily'], description: 'The morning ritual that precedes creation.', orientation: 'portrait' },
  { id: '39', title: 'Bookshelf', imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800', tags: ['Books', 'Knowledge', 'Stack'], description: 'Ideas organized by spine — a wall of accumulated thought.', orientation: 'portrait' },
  { id: '40', title: 'Horizon Line', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800', tags: ['Horizon', 'Divide', 'Calm'], description: 'Where earth meets sky — the simplest composition.', orientation: 'landscape' },
];

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/aditya.pictures/',
  twitter: 'https://x.com/adityav__',
  linkedin: 'https://www.linkedin.com/in/adityavishwakarma1/',
  email: 'mailto:aditya1vishwakarma@gmail.com'
};
