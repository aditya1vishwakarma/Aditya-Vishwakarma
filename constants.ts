
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

  { id: '1', title: 'Nurture by Porter Robinson', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/Nurture%20Visuals%202.avif', tags: ['Music'], description: 'Perhaps my favorite album of all time. The visuals on this album and the subsequent tour had a major impact in my relationship with nature and how I view the world.', orientation: 'landscape', link: 'https://jackentee.com/project/porter-robinson' },
  { id: '2', title: 'Japanese Gradients', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/%E3%81%86.avif', tags: ['Design'], description: 'Nuevo Tokyo is a studio based in Shibuya that does really good work in R&D and design. I bought this gradient pack a few years ago, this is the う varient I use often.', orientation: 'landscape', link: 'https://www.nuevo.tokyo/japanese-gradients-for-ui' },
  { id: '3', title: 'Air 2 Earth', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/a2e.avif', tags: ['Music'], description: 'Another Porter Robinson work. This is a side project that focuses on Airy House and Tranquil Progressive House.', orientation: 'landscape' },
  { id: '4', title: 'Indian Painters', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/peacock.avif', tags: ['Art'], description: 'Taken from the Chandra Mahal in Jaipur. Amazing Artistry.', orientation: 'portrait' },
  { id: '5', title: 'Ferrari Sp3 Daytona', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/sp3%20daytona.avif', tags: ['Cars'], description: 'One of the most beautiful modern cars.', orientation: 'landscape', link: 'https://en.wikipedia.org/wiki/Ferrari_Daytona_SP3' },
  { id: '6', title: 'Nurture By Porter Robinson (again)', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/Nurture%20Visuals%203.avif', tags: ['Music'], description: 'Another one from Nurture. The interaction between nature, our digital world, and a hopeful message is what makes this album deeply meaningful to me.', orientation: 'landscape', link: 'https://jackentee.com/project/porter-robinson' },
  { id: '7', title: 'Astronaut Bruce McCandless Floating', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/spacewalk.avif', tags: ['Tech'], description: 'This is probably one of the most dangerous things anyone has ever done.', orientation: 'landscape' },
  { id: '8', title: 'Neon Genesis Evangelion', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/neon-genesis-evangelion-unit01-hughes-thompson.avif', tags: ['Art'], description: 'This anime has inspired me to accept myself. Also has amazing visuals.', orientation: 'portrait' },
  { id: '9', title: 'Space Shuttle Program', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/space%20shuttle.avif', tags: ['Tech'], description: 'The best visuals and brand design. Reach for the stars.', orientation: 'landscape' },
  { id: '10', title: 'Discovery by Daft Punk', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/intrastella.avif', tags: ['Music'], description: 'Both Discovery and Intrastella 5555. Amazing.', orientation: 'landscape', link: 'https://www.yokogaomag.com/editorial/interstella5555' },
  { id: '11', title: 'The iPad 2', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/iPad-2-ad.avif', tags: ['Tech'], description: 'This was the first iPad that I ever got. The thin design that formed around your hands along with the magnetic smart folio got my 13 year-old self extremely excited.', orientation: 'landscape', link: 'https://support.apple.com/en-us/111990' },
  { id: '12', title: 'Iridescence', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/iridescent.avif', tags: ['Art'], description: 'Taken at the Hakone Glass Museum - Iridescence is one of the coolest phenomena with light.', orientation: 'portrait' },
  { id: '13', title: 'Old Car Adverts', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/porschelemans.avif', tags: ['Design', 'Art'], description: 'Old car adverts, especially Porsche, had so much panache.', orientation: 'portrait' },
  { id: '14', title: 'Top Gear Africa Special', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/tgafrica.avif', tags: ['Cars', 'TV'], description: 'Top Gear is why I love cars so much. ', orientation: 'landscape', link: 'https://www.youtube.com/watch?v=qqQzU-q8S2o' },
  { id: '15', title: 'Solid Nature', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/solidnature.avif', tags: ['Design', 'Art'], description: 'This is a design firm that specializes in maximizing the potential of marble. At Milan Design Week 2026, they created a supermarket entirely out of marble.', orientation: 'portrait', link: 'https://www.designboom.com/design/il-sonno-supermarket-amo-oma-fruits-vegetables-carved-solidnature-stone-milan-room-dreams/' },
  { id: '16', title: 'Nurture by Porter Robinson | Tour Visuals', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/Nurture%20Visuals.avif', tags: ['Music'], description: 'The Nurture Tour was full of the same themes of appreciating life. Our relationship with nature and having hope for the future.', orientation: 'landscape', link: 'https://jackentee.com/project/porter-robinson' },
  { id: '17', title: 'Works of Hayden Clay', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/trackSocialMedia.avif', tags: ['Art'], description: 'Pictured: Track & Field. Hayden is a 3D artist that portrays the natural world through with a very surreal lens. His words: I’m particular interested in blurring the line between dreams and reality, creating sensations of strange tranquility" I resonate with these themes heavily as that is I also think about art and the world. ', orientation: 'landscape', link: 'https://www.haydenclay.com/other-work' },
  { id: '18', title: 'Works of Tomislav Topić', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/tomislav.avif', tags: ['Art'], description: 'Tomislav Topić is a Berlin based artist who does really great mesh/fabric instalations. I love how his works emphasize how color and light interact in a space.', orientation: 'landscape', link: 'https://tomislav-topic.com/installations' },
  { id: '19', title: 'Works of Takashi Murakami', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/IMG_9410.avif', tags: ['Art'], description: 'Takashi Murakami is a Japanese artist who has inspired many designers and artists I love, like Kanye West. This is a work from when he had an exhibit at the Asian Art Museum.', orientation: 'portrait', link: 'https://gagosian.com/artists/takashi-murakami/' },
  { id: '20', title: 'Mt Madonna', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/MtMadonna.avif', tags: ['Nature'], description: 'Nature has the best gradients. Also has my favorite temple in the world.', orientation: 'landscape' },
  { id: '21', title: 'Sixteen Oceans by Four Tet', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/Sixteen%20Oceans.avif', tags: ['Music'], description: 'This is a deeply personal album for me, as it brings me back to a similar place as Nurture does. But in a much more self-guided, introspective way.', orientation: 'landscape', link: 'https://fourtet.bandcamp.com/album/sixteen-oceans' },
  { id: '22', title: 'Random Access Memories by Daft Punk', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/daft%20punk.avif', tags: ['Music'], description: 'These guys are just the coolest ever. And RAM is a beautiful album built around the appreciation of music.', orientation: 'landscape', link: 'https://daftpunk.com/releases/random-access-memories' },
  { id: '23', title: 'Pokemon Generation 4', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/IMG_0316.avif', tags: ['Game'], description: 'Generation 4 of Pokemon is my favorite generation, I love the world, the lore, everything.', orientation: 'landscape', link: 'https://bulbapedia.bulbagarden.net/wiki/Generation_IV' },
  { id: '24', title: 'Horology', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/1165_metro_neomatik_41_update_1bn_pr.avif', tags: ['Watches'], description: 'I really admire the intricacy and detail that goes into watchmaking. Pictured is a Nomos Metro Neomatik 41 Update.', orientation: 'portrait', link: 'https://nomos-glashuette.com/en-us/tangente/tangente-neomatik-41-update-180?srsltid=AfmBOor2Lck20HVVuOaD7nfWEUsoqS5MjoumGBGn3oNgjH0bPaHGHjLC' },
  { id: '25', title: 'Singapore ArtScience Museum', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/ArtScience.avif', tags: ['Architecture'], description: 'This building is one of my favorites in the world. The lotus is also a special flower in India, symbolizing symbolises creation, purity and enlightenment. Things that Art and Science stand for. The perfect concept for a building', orientation: 'landscape' },
  { id: '26', title: 'iPhone Air', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/iphoneair.avif', tags: ['Tech'], description: 'Greatest phone since the iPhone X', orientation: 'landscape', link: 'https://www.apple.com/iphone-air/' },
  { id: '27', title: 'Rajasthani Phad Paintings', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/IMG_8577.avif', tags: ['Art'], description: 'This is a painting my family bought form Rajhasthan. I love the use of color and contrast in this classical Indian painting style.', orientation: 'landscape' },
  { id: '28', title: 'Works of Hiroshi Yoshida', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/the-palace-of-udaipur.avif', tags: ['Art'], description: 'I discovered Hiroshi Yoshida and his work in late High School. He has a way of making the world feel more serene that I adore.', orientation: 'portrait', link: 'https://hiroshiyoshida.art/product-category/india-and-southeast-asia/' },
  { id: '29', title: 'Time n Place by Kero Kero Bonito', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/kkbtnp.avif', tags: ['Music'], description: ' I resonate heavily with this album because it talks all about how it sucks growing up. Makes me appreciate life as I grow older.', orientation: 'landscape', link: 'https://kerokerobonito.bandcamp.com/album/time-n-place' },
  { id: '30', title: 'Osaka World Expo - Joinery', imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/mood%20board/worldexpo.avif', tags: ['Architecture', 'Design'], description: 'The Osaka World Exo ring was one of the things I really wanted to see when I went. It uses a concept called Nuki which is a joinery style that tries to do everything without glue or nails. Sashimoni is also another joinery style I love.', orientation: 'portrait', link: 'https://www.dezeen.com/2025/04/24/the-grand-ring-expo-2025-osaka/' }
];

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/aditya.pictures/',
  twitter: 'https://x.com/adityav__',
  linkedin: 'https://www.linkedin.com/in/adityavishwakarma1/',
  email: 'mailto:aditya1vishwakarma@gmail.com'
};
