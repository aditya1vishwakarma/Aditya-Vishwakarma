
import { Project, BlogPost, MoodBoardItem } from './types';

/**
 * Single source of truth for the mobile/desktop split. Mirrors the `md`
 * variant in index.css — change both together or the CSS and JS layouts
 * disagree mid-page.
 *
 * 740 lands in the 736 (iPhone 8 Plus landscape) → 744 (iPad mini portrait)
 * gap, so no device sits on the boundary. Every iPad is desktop in both
 * orientations; phones are mobile in portrait, desktop in landscape from the
 * iPhone X up (812–956), which matches how apple.com treats the same widths.
 */
export const MOBILE_MAX = 740;

/**
 * The one page's own split goes by height as well: a screen less than this
 * tall is a phone held sideways, whatever its width, and gets the phone's
 * layout — the pane filling the screen, the nav behind a button — as there's
 * no room for the nav, the margins and a pane beneath them. No iPad is this
 * short. Mirrored in components/Home/home.css.
 */
export const SHORT_MAX = 500;

/** The one page's phone layout: a screen that's narrow, or short. */
export const isCompact = (width: number, height: number) => width < MOBILE_MAX || height < SHORT_MAX;

export const isMobileViewport = () =>
  typeof window !== 'undefined' && window.innerWidth < MOBILE_MAX;

export const PROJECTS: Project[] = [
  {
    id: '2',
    title: 'Placemarks',
    category: 'iOS Development',
    description: 'An iOS app that photographs, classifies, and curates architecture using native platform frameworks.',
    fullDescription: 'Placemarks is my in-development iOS app that allows you to curate the architecture you see around you. Just take a photo of a building you like and the app will suggest tags related to the photo. The result is an extremely personal mood board that stays on your phone. It uses Apple\'s native Vision, SwiftData, AVFoundation, and MapKit frameworks.',
    imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/projecthumbnails/placemarksbanner.jpg',
    date: 'Summer 2026',
    role: 'PM/ Developer',
    path: '/works/placemarks',
    isSelected: true
  },
  {
    id: '1',
    title: 'Keep This Vibe, DJ X',
    category: 'Exploration',
    description: 'Idea to Prototype to PRD for a feature that helps DJ X keep the vibe going for long listening sessions.',
    fullDescription: 'The DJX Project focuses on analyzing 8.7 million songs to validate a simple feature for Spotify\'s AI DJ. How I used the full PM cycle to take a personal frustration, stress-test it with data, and prototype a solution.',
    imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/projecthumbnails/djx.jpg',
    date: 'March 2026',
    role: 'Product Manager',
    path: '/works/djx-project',
    isSelected: true
  },
  {
    id: '3',
    title: 'Un-Selected Works',
    category: 'Archive',
    description: 'These are ideas that I\'ve had , but upon further exploration, found that I couldn\'t vouch for them for one reason or another.',
    fullDescription: 'These are ideas that I had for a product or feature, but upon further exploration, I found that I couldn\'t vouch for them for one reason or another.',
    imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/projecthumbnails/unselected.avif',
    date: 'N/a',
    role: 'Myself',
    path: '/works#unselected-works',
    isRedirect: true
  },
  // Sits after the first three so it stays out of the home carousel.
  {
    id: '6',
    title: 'Locally Hosted Apps',
    category: 'Self-Hosting',
    description: 'Running small, personal apps on my own NAS with TrueNAS, Pi-Hole, and Tailscale instead of the cloud.',
    fullDescription: 'Why I host light, personal apps on my own TrueNAS server, and how Pi-Hole DNS and Tailscale let me reach them from anywhere.',
    imageUrl: 'https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/projecthumbnails/LocallyHosted.avif',
    date: 'October 2026',
    role: 'Myself',
    path: '/works/locally-hosted-apps',
    isSelected: true
  },
  {
    id: '4',
    title: 'Spacial Album Art',
    category: 'Product Manager',
    description: 'An attempt to bring a fully immersive artwork experience to Apple Music.',
    fullDescription: 'A rough idea to bring a fully immersive artwork experience to all albums.',
    imageUrl: '',
    date: 'April 2026',
    role: 'Product Manager',
    path: '/works/SpacialMusic'
  },
  {
    id: '5',
    title: 'Apple Music Desktop Redesign',
    category: 'Learning: Design',
    description: 'An attempt to re-make components and un-antiquate the Apple Music Desktop app in 2025.',
    fullDescription: 'A project that attempts to re-make components and un-antiquate the Apple Music Desktop app in 2025.',
    imageUrl: '',
    date: 'March/April 2025',
    role: 'Product Designer',
    path: '/works/AMDesktopRed'
  },
  {
    id: '5',
    title: 'Shared Memories & Captions',
    category: 'Product Manager',
    description: 'A preliminary idea to add collaborative captions and tags to shared albums in the native Photos app.',
    fullDescription: 'This is a preliminary idea, but when we create memories in the native Photos app, we should be able to caption photos, tag contacts who the collection is shared with, etc. This makes it a lot more collaborative and makes it feel more like a scrapbook to be shared and is more personal than just a simple shared album.',
    imageUrl: '',
    date: 'June 2026',
    role: 'Product Manager',
    path: '/works/photo-captions'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '4',
    title: 'Learning App Icon Design',
    date: 'October 2026',
    readTime: '3 min read',
    category: 'Design',
    excerpt: 'How I designed my first app icon for Placemarks, from concept to interation to final design.',
    path: '/blog/app-icon-design',
    content: `I've never created a logo before. Let alone an app icon.`
  },
  {
    id: '2',
    title: 'On Curation',
    date: 'Random Note, 2025',
    readTime: '1 min read',
    category: 'Random Thoughts',
    excerpt: 'Curation is the root of ones creative prowess.',
    path: '/blog/curation',
    content: `Curation is really the core of all creative prowess...`
  },
  {
    id: '3',
    title: 'The Curse of Nostalgia',
    date: 'Random Note, 2025',
    readTime: '1 min read',
    category: 'Random Thoughts',
    excerpt: 'Nostalgia is probably the most potent and dangerous feeling we have.',
    path: '/blog/nostalgia',
    content: `Nostalgia is probably the most potent and dangerous feeling we have.`
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

/** Photographs: a ~400px preview for grids, and the full-quality file for viewing one on its own. */
export const PHOTOS: { preview: string; full: string }[] = [
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/cupertinoleaves.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/cupertinoleaves.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/lovespring.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/lovespring.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/appleparkvisitor.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/appleparkvisitor.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/chicagowaves.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/chicagowaves.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/vancouverleaves.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/vancouverleaves.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/hakonejapanesemaple.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/hakonejapanesemaple.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/porscheracing.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/porscheracing.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/atlasbar.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/atlasbar.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/daisies.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/daisies.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/alaskabus.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/alaskabus.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/mttam.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/mttam.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/self4.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/self4.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/pfp.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/pfp.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/maxverstappen.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/maxverstappen.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/hakone.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/hakone.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/beautiful.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/beautiful.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/futuresamurai.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/futuresamurai.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/birdvsworld.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/birdvsworld.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/halfdome.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/halfdome.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/shibuyaskyview.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/shibuyaskyview.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/steph.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/steph.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/mbs.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/mbs.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/selffav.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/selffav.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/sfhenge.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/sfhenge.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/thebay.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/thebay.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/whistler.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/whistler.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/water.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/water.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/ucschills.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/ucschills.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/glassrain.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/glassrain.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/arashiyama.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/arashiyama.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/giantsgame.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/giantsgame.avif" },
  { preview: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/previewimges/20kgtoyota.avif", full: "https://pub-9c95b4d2e81345c4a46a362747b32ea6.r2.dev/fullimages/20kgtoyota.avif" }
];

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/aditya.pictures/',
  twitter: 'https://x.com/adityav__',
  linkedin: 'https://www.linkedin.com/in/adityavishwakarma1/',
  email: 'mailto:aditya1vishwakarma@gmail.com'
};
