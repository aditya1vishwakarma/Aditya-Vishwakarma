# Site rules

The site is one page: the maple scene, and a pane over it. These are the rules it's built to. Keep to them when you add to it.

## One page

- Every address except the museum's (`/#/mindmuseum`) renders the one page, `components/Home/HomeHero.tsx`. The address says what the pane shows. The table of addresses is `components/Home/routes.tsx`.
- Old addresses keep working: `/#/works/…` and `/#/blog/…` open that piece, and `/#/works` and `/#/blog` open the lists. An address the site doesn't have goes home.
- Links within the site are hash links (`#/works/placemarks`). The page routes them itself, so the pane's Back and the browser's back button agree.
- To add a project or a post:
  1. Write its page under `pages/works` or `pages/blog`, using `WritingLayout` and `Prose`.
  2. Give it an entry in `constants.ts` (`PROJECTS` or `BLOG_POSTS`, with its `path`).
  3. Add its address to `PIECES` in `routes.tsx`.

  See `components/Writing/renamewriting.md`.

## The pane's states

1. **Collapsed (home).** No pane: the scene, the name and the title, with the nav in the top right.
2. **contentSelect (a section's list).** Chosen from the nav.
   - **Look:** frosted glass (a 60% tint), below the nav.
   - **Width:** as wide as the section needs: wide (two thirds of the screen), medium or narrow. Narrow widens a little on a big screen (a fifth of it, 420–520px) so it never reads as a sliver. About takes its own share instead: 41% (see About).
   - **Height:** Work and Photos reach the bottom margin. On a desktop, the others stop where their content does (`SECTIONS` in `HomeHero.tsx`):
     - **About, Writing and Contact are only as tall as what's on them** (`fits`), up to the room, then they scroll. Each is laid out unseen, off the screen, at the width its glass will have (`PaneMeasure` in `SectionPane.tsx`), so the glass takes its height before it moves and nothing on it is laid out again. It's measured again as fonts land and the window resizes.
     - Writing's pane is as tall as every post, whichever category is chosen, so choosing one never moves the glass.
     - Shorter than the room, a pane keeps its top under the nav and its right edge on the margin; its foot lifts off the margin.
     - A phone's pane fills the screen, whatever's on it.
   - **Head:** the section's name, open out (Work and Photos), and close. A section's line about itself (Photos, Writing) sits directly under its name, as the first thing on the glass, and scrolls away under the head.
   - **Work's name** scrolls away with its list rather than staying in the head, so it never stacks over Un-Selected Works. Only the buttons stay, and only the glass's top edge blurs.
   - **Scene:** it keeps drawing, the camera slides so the tree stays in view beside the pane, and the wind settles.
   - **The field calms:** of the daisies that sway, only 5% go on swaying, while the tree sways on. They settle one at a time over about 2.4s, and take it up again at home (`FLOWERS_BESIDE` in `components/Maple/MapleScene.tsx`).
3. **contentView (a piece open to read).** Chosen from a list: a project, a post, or a photo from the expanded view.
   - **Look:** the glass fills the screen inside the reading margin and thickens to 90% solid over about 0.9s.
   - **Head:** the same for everything, Back (to the list) and close.
   - **Nav:** it moves up off the screen.
   - **Scene:** it stops drawing once the glass has thickened, and starts again when the pane leaves this state. The camera doesn't move.
4. **expandedView (a list opened out).** A list's open-out button (Work, Photos). It isn't about reading one piece, but it works as contentView does: the reading margin, the thickened glass, Back and close, the nav away and the scene stopped. Back returns the list to its own size. The list's name and line about it head the list itself.

**A photo** opens in the pane it was chosen in:
- **From the list:** in the list's own pane, at the same size, so the glass never resizes for it. The head becomes Back and close, and the scene pauses while the photo is up.
- **From expandedView:** in contentView.
- **Between photos:** a plain quick fade, not the notecard's turn.
- **On a touch screen** (a phone, or a tablet without a mouse), a photo is handled by touch (`components/Home/photoGestures.ts`):
  - No arrow buttons. They're still there for screen readers.
  - The photo takes the pane's whole width, to within 8px of the glass's sides.
  - A swipe across steps to the next or the last photo: 56px across, or a quick flick. The next one slides in from the side it was swiped toward. A drag up or down does nothing.
  - A pinch zooms up to 4×, and a double tap zooms to 2.5× where it's tapped, or back out. Zoomed, a drag moves the photo about, but never so far that a gap opens at an edge. The zoomed photo is clipped to its own room, below the head.
  - A computer keeps its arrow buttons and keys.

**The head** floats over what's on the glass. Whatever scrolls up under it blurs away progressively (three layers of blur, strongest at the top), with a touch of tint once anything is under it. Its height is fixed for each look, so nothing on the glass jumps.

**Navigating:**
- Escape goes up one level: from a piece, a photo or expandedView to the list, then from a list to home.
- Back goes back through the history when the list is where the reader came from, and otherwise to the list.
- Stepping between photos replaces the history entry, so Back still goes straight to the grid.

## Margins

- **Desktop:** one margin, 36px, on every edge.
  - The nav pill's top and right edges sit on it.
  - A list's pane has its right edge on it, and its bottom edge too unless what's on it is shorter than the room (Writing, Contact and About; see contentSelect's height).
  - The name's and the title's last baselines sit on it.
- **contentView and expandedView:** the pane comes nearer, 18px from every edge, for the room. Nothing else is there to line up with, since the nav has gone.
- **Phone:**
  - The type sits on a 24px margin.
  - The nav and the pane sit 14px from the edges (`navPlace` in `components/Layout/Navbar.tsx`).
  - In contentView the pane takes the top as well, still 14px in.
- **Edge to edge:** the page is drawn under a phone's status bar, notch and home bar (`viewport-fit=cover` in `index.html`), so the scene fills the whole screen.
  - Everything placed on the margins is placed inside the safe area: the nav, the controls, the pane and the type, each on its margin plus the inset on that side.
  - Script reads the insets with `useSafeArea` (`components/Home/safeArea.ts`); CSS uses `env(safe-area-inset-*)`. Both are zero on a screen without them.
  - **In Safari on iOS 26** the strips under the status bar and behind the toolbar are painted by Safari, not the page. It paints them solid, in the colour of a full-width fixed element at that edge: here, the scene's container. Only ordinary, scrolling content shows through under them. So the moving scene doesn't reach behind the clock or the toolbar in a Safari tab; each strip is the scene's colour at that edge.

## Breakpoints

- **Phone layout for the pane and the nav** (the pane filling the screen, the nav behind a menu button): a screen narrower than 740px, or shorter than 500px, which is a phone held sideways (`isCompact` in `constants.ts`).
- **The lists** follow the pane. Where it fills the screen over the tree, they get the phone's rows; where it sits beside the tree (a tablet and up), the desktop's tiles and rows. Tailwind's `roomy:` variant (`index.css`) is that same split, 740px wide and 500px tall, the other side of `isCompact`: keep the two together.
- **The name and title** arrange by width alone.
  - From 740px wide, they always share one baseline on the bottom margin: the name at the left, the title at the right. A phone held sideways does this too.
  - Where they'd run into each other (an iPad, a smaller window), both are set smaller, in proportion, until they fit with 48px between. The title goes no smaller than 13px, and past that only the name shrinks (`--fit`, worked out in `HeroText` in `HomeHero.tsx`).
  - Below 740px, the title stands above the name, flush left.
  - Whenever the title is under 24px, it gets the deeper haze and tighter shadow that small text needs.
- **Writing inside a piece** goes by width alone, Tailwind's `md:` (740px and up).
- **Type scales with the screen** rather than jumping at breakpoints:
  - the name: a tenth of the width, never more than a quarter of the height, then smaller if it must be to fit beside the title
  - the hero title: by the screen's shorter side, 15–24px (as small as 13px to fit beside the name); on the phone layout 13–17px
  - list names and article titles: `clamp()` between a phone size and a desktop size
- **Phone lists keep to the least it takes to choose:**
  - a selected work is a row with a small picture, its name, and what it is and when
  - un-selected works and posts are cards of their own (see *Pointing at things*), with no dividers between, and no role or date
  - an un-selected work: its name, and its line cut to two
  - a post: its name, its line cut to two, and how long it is to read under them
  - a card's line is 14px, a step down from its 20px name, so the name leads
  - small capitals drop to 10.5px

## Motion

- **Nothing on the glass is laid out again while the glass changes size.** Content reflowing during a resize stalls the main thread, badly in Firefox.
  - The glass sets off at once (0.44s). Meanwhile what was on it fades out (0.16s), held at the width it had.
  - The next card is built during the move, at the width and height it will have (`usePaneHeld` gives the height), and fades in as the glass lands. It's laid out once, never again frame by frame. It's built unseen during the move rather than after, because building it after the glass lands puts its cost in the very frame where it starts to fade in.
- **The order, every time:** the glass moves, then the card comes in, then its pictures. Opening Photos out takes about 0.8s: the glass in 0.44s, the grid in by about 0.6s, and the 32 photos in by about 0.8s.
- **New content at the same size:** the next card is built beneath the old one as soon as the old one starts to leave, and comes in once it has gone (the notecard turn). Building it can't hold the turn up.
- **Frosted glass is moved or tinted, never faded.** Safari paints faded frosted glass white.
  - To thicken it, animate the opacity of an overlay inside the glass.
  - To move the nav away, use `translate`.
- **Animate the whole `transform`, and `opacity`.** The browser runs those off the main thread. Avoid framer's `x`/`y` and layout properties. The one exception is the pane's edges during a resize, when there's nothing on it.
- **Reduced motion:** cards only fade, and the glass and the nav move at once.

## Performance

- **A pane's pictures wait for the glass to land and the card to come in** (`usePaneSettled`, per card). A photo after a photo doesn't wait, so stepping through them stays quick.
- **They come in four a frame**, in the order they're laid out, so the browser never decodes and draws a whole grid in one frame. Each fades up only once it's decoded.
- A section's pictures start loading when its nav item is pointed at or focused (Work, Photos).
- Content images use `decoding="async"`, so a large picture never holds up a frame.
- A pane's pictures are never `loading="lazy"`: they're all in view once the pane rests, and Safari can leave a lazy picture in a clipped frame unloaded. Prefetched pictures are decoded ahead too.
- The scene draws 30fps in calm air and 60fps during a gust or a camera move. It draws nothing while contentView covers it.

## Pointing at things

- **The home screen isn't selectable:** a stray tap, a double tap or a long press on a phone highlights nothing, and there's no grey tap flash. What's on the pane can still be selected and copied (`.hero` in `home.css`).
- **Lifting:** a row or tile pointed at, or tapped, is lifted onto the site's off-white, `--color-background` (#FBFAF8) at 80%. It's not a green tint, and titles don't turn green.
- **In expandedView** the glass is nearly that colour already, so a faint grey edge and a soft shadow show the lift as well.
- **Arrows:** a card's arrow slides in on hover, or on a tap. On a selected work's tile it sits in the bottom-right corner.
- **Tapping a row** (Work and Writing, on any touch screen) lifts it as pointing at it does, so it's plain which was chosen (`useTapLift` in `sections.tsx`):
  - It lifts 70ms after the finger lands, so a list scrolled by a finger on a row doesn't flash, or as the finger comes up, for a quick tap. A scroll lets it go.
  - Chosen, it's held lifted for 110ms before its piece opens, through the router as any link within the site is, and stays lifted as the list goes.
  - Held down, it stays lifted: iOS doesn't peek at its page or select its words (no touch callout, no selection).
- **On a phone** nothing points, so un-selected works and posts are cards from the first (`CardFill` in `sections.tsx`):
  - White at 50%, under each row. No arrow: the fill says it's a way in, and the words get the room.
  - A card keeps to the column, its edges in line with the list's name and the selected works' pictures. Its words sit 16px in, and its corners are 18px, the museum card's on a phone.

## Nesting

- **Concentric corners:** anything nested in a rounded container keeps its corners concentric with the container's: outer radius = inner radius + the padding between.
- **Smoothing:** anything nested in the pane's squircle corners is smoothed 100% too (`Squircle`, smoothing 1).
  - A selected work's tile: its picture's 18px corners plus 10px of padding make 28px.
  - The way to the museum isn't nested in the pane's corners: it keeps to the column, as the portrait above it does. Its lift reaches 12px past the column, at 28px corners (18px on a phone), the same as a selected work's tile.

## Nav

- A frosted pill on the margins, 43px tall: 5px of glass round each link's own pill.
- The open section's link sits on a white pill, which slides from link to link as the section changes. Pointing at a link shows a fainter pill.
- **On a phone, at home,** the menu is a spine: a pill set like a book's spine, reading *Menu* (`MenuSpine` in `components/Layout/Navbar.tsx`).
  - 50 × 110 with its glass (a 44 × 104 button in 3px). It stands on the type's 24px margin, its foot 8px above the top of the title's line (about 16px above its capitals), so it follows the title on any phone.
  - **Its side** is the right, until the visitor swaps it from the controls. On the right its word runs down it (turned 90°); on the left, up it (270°), so the letters' tops face the nearer edge.
  - **The side is remembered** in this browser (`localStorage`, `menu-side`, in `components/Home/menuSide.ts`). Only `left` is read back as left; anything else, or no storage, is the right.
  - **A tap** opens the list beside it, 8px from it, reaching to 14px from the far edge, centred on the spine as far as the screen allows. The spine reads *Close* in the same place, and the scene dims behind (14%). A tap anywhere else, or Escape, closes it.
  - **The list:** five rows, 56px tall, each name in Newsreader at 28px, centred. Its corners are 32px: the rows' 24px plus 8px of padding.
  - **With a pane open,** the spine moves off its side of the screen, and the nav comes down from the top in its place: the small name, to go home, and a 46px button for the other sections. That menu is a 208px pane of glass, each link a row across its whole width, 52px tall, its name set to the right; its corners are 32px, the rows' 26px plus 6px of padding.

## Work

- **Selected Works**, the pane's title, is a grid of tiles. Each is a picture over its name, what it is and when, and a line about it, wrapping within the tile.
  - The columns follow the room the list actually has, using container queries: one, then two (from 440px), then three (from 680px). In expandedView, four from 920px.
  - **Past three selected works** (four in expandedView) the row becomes a horizontal carousel that snaps to each tile, with a sliver of the next one showing so it's plain there are more.
- **A rail on the right** marks the two parts, Selected and Un-Selected: a line for each, as long as the part is tall, with its name set vertically along it. The part in view is darker, and each is a way to jump there. Any list can have one: mark its parts with `data-pane-part` and pass `parts` on its card.
  - The rail takes the scrollbar's place: a pane with one hides its scrollbar (`data-rail`, in `home.css`). It still scrolls by wheel, touch and keys.
  - **The rail has room of its own:** the list's right-hand padding grows by `railRoom` (`SectionPane.tsx`), about 19–29px depending on the screen's width, and 22px on a phone.
    - On a desktop the pane is that much wider, so the list keeps its width. A row lifted under the pointer, which reaches 16px past the list's edge, still stops 10px short of the rail.
    - A phone's pane is the screen's width, so there the list gives the room up. A selected work's row, lifted by a tap, reaches 8px past the list's edge and stops 10px short of the rail; the cards keep to the edge.
    - Selected Works, in the head's row, keeps clear of the head's buttons rather than of the rail's room, so it stays on one line on a 375px phone.
- Tiles and their pictures have 100%-smoothed (squircle) corners, and so does the lift.
- **Un-Selected Works** is a section as distinct as a list of its own: its heading is the size of the pane's title, with its line about it. Each row has what it is and when beside its name and a line about it, as the old Works page had.

## Writing

- Its line about itself points to the Substack.
- Under it, a compact filter by category. The chosen chip sits on a pill, as the nav's open section does.
- On a desktop its pane is as tall as all its posts, and no wider than 880px (`WRITING_MOST`), about a third of a 27" display: 696×708 at 1512×860, and 880×708 on a 27". On a short screen (1280×720) the posts are taller than the room, so it fills the height and scrolls.

## About

- Smaller type, sized by the screen's height on desktop.
- **Its pane takes 41% of the screen's width on a desktop** (`ABOUT_SHARE` in `HomeHero.tsx`), and never less than 620px, the 41% of a 1512px laptop (`SHARE_LEAST`).
  - 41% is the least share at which About fits without a scroll on a laptop (1512×860) and a desktop (1920×1080), with the picture at a natural size. Narrower, its lines run on: at a third of the screen it still scrolls about 50px on a laptop. Keeping the picture at 1.15:1 everywhere would take 47%.
  - The floor keeps a smaller window's About laid out as the laptop's: 1280×720 fits without a scroll.
  - Like Writing and Contact, it's only as tall as what's on it. It hugs its content at 1920×1080 (787×692) and on a 27" (1050×730), and the scene shows below. On a laptop it fills the room (620×729).
- **The opening lines** run across the top.
- **Below them, on desktop and tablets** (about 400px of room and up): a picture of me in a squircle on the left, with the two approaches stacked on the right. The three are one group.
  - The picture is exactly as tall as the two approaches: its bottom edge is level with the last line of "how". Its width is chosen so it's a little taller than it's wide (about 1.15:1), at 30–50% of the row.
  - Where About would scroll, the picture narrows, giving the approaches more width and fewer lines, but never past 1.5:1 (`PICTURE_TALLEST`). It's 207×270 on a laptop. It never grows to fill space.
  - The spacing tightens with the screen's height.
  - A small window (890×692 or so) still scrolls a little, since the text alone is taller than the room.
- **On a phone**, everything stacks: the opening lines, the "what", the "how", then the picture, full width.
- **The way to the museum** sits at the foot, on the column's margins like everything above it. It has no card at rest:
  - "Step Inside: My Mind Museum", in moss: an invitation, so it reads as something to press. Its arrow slides in on hover; on a touch screen it's always shown.
  - Under it, the museum's shelves themselves, as wide as the column, straight on the glass, their edges fading into it (`public/museum/shelves.webp`, about 24 KB).
    - The cut-out is two renders of the museum, on a black wall and a white one, with what differs kept as transparency. The room's own shadows are left out, since they pooled into smudges on the glass. A soft drop shadow, worked out from the outline, stands the shelves off the glass instead.
    - They're a quarter of the column's width tall (120–300px), so they keep their shape as it widens.
    - On a short screen, once the picture has narrowed as far as it goes, they give up height, down to a 64px band (`SHELVES_LEAST`), so About still fits. At 1280×720 they're 105px.
  - Pointing at it lifts it all onto the off-white, reaching 12px past the column, as a list's rows do.

## Photos

- The grid fills the pane exactly, under its line about itself.
- **Wait before the photos appear:** switching to Photos waits for the last list to leave. From a narrower section, the glass also resizes first.
- **The pictures themselves** are already loaded by then: the previews are fetched at idle on desktop, and on pointing at Photos elsewhere.
- **The previews must be plain AVIFs**, about 800px on the short side, as `devtools/make-previews.mjs` makes them. Firefox can't decode tiled AVIFs, or ones with a crop box. It then falls back to the full-size photo, and decoding 32 of those at once froze opening Photos out for about 2s.
- **Pointing at a photo** lifts it out of its cell: it grows 8% over its neighbours, with a shadow, from the corner that keeps it inside the grid (a photo on the right edge grows leftwards, and so on).

## Season

- The scene opens in autumn from October through February, and in summer from March through September (`seasonOf` in `components/Maple/mapleConfig.ts`).
- S swaps it, or *Change Seasons* in the controls (*Swap Seasons* on a touch screen). On the dev page, `?season=` sets it.

## Type

- **Serif:** Newsreader, from Google Fonts.
- **Sans:** Helvetica Neue, then Helvetica, then Arial (`--font-sans` in `index.css`). There's no web font for the sans.
- **Small text on the glass** keeps a contrast of at least 4.5:1: charcoal at 75% opacity or more.

## Content pages

- A page is `WritingLayout` (title, date, read time and category) around `Prose` components. It has no back link or page chrome of its own; the pane provides Back, close and the reading-progress ring.
- A gallery's lightbox covers the pane, and its keys take precedence over the pane's: Escape closes the picture first.

## Controls

- **A pill on the nav's glass** in the top left, level with the nav and as tall, reading *Controls* in italic Helvetica Neue. Closed, it's only as wide as the word (`components/Home/Controls.tsx`).
- It's there at home, with no pane open, on every screen.
- **With a pointer that hovers** (a computer), pointing at it or tabbing to it opens it, 208px wide, down to:
  - *G* Gust of Wind
  - *S* Change Seasons
  - Swap Menu Side, in a window narrow or short enough for the phone's layout and its spine (see *Nav*)
- **On a touch screen** (`(hover: none)`: a phone or a tablet), a tap opens it, up to 224px wide: kept small, as it opens over the scene. A tap anywhere else closes it. Its words are 14px.
  - First, a line to read, not a button, 36px tall with no white under it: *Tap the tree for a breeze*. Its words line up with the rows' below.
  - Then each control, a row of its own, its whole width the button: 44px tall (the least a finger wants), on white at 40%, its corners 17px (the pane's 23px less the 6px round it), 4px between rows.
    - Change Seasons
    - Dark Mode / Light Mode
    - Swap Menu Side, on a phone only: it moves the menu's spine to the other side (see *Nav*).
- **The tree:** on a touch screen, a tap on the tree at home sends a gust through it. A tap is lifted within 0.5s and moved less than 12px. The tree counts wherever it's drawn this frame: each leaf mass, 10% bigger than drawn, and the trunk, at least 18px wide (`treeAt` on the scene's handle).
- **The keys:**
  - G brings on a gust, and S swaps the season.
  - W, P and B open Work, Photos and the blog from anywhere, as the nav does: pressed again on that list, they close it. About and Contact have no key.
  - Keys do nothing with Cmd, Ctrl or Alt held, or while typing.
- **Music is off for now.** Its switch is commented out in `Controls.tsx`; `music.ts` is kept as it was. When it comes back:
- **Music** is muted on every visit. It has no key, so a stray press can't start it: it only plays when it's turned on in the controls. That press is also what lets the browser play sound.
  - The song streams from R2 and loops. Set its address in `MUSIC_SRC` in `components/Home/music.ts`. Until then the switch works and nothing plays.
  - Nothing is fetched until it's first turned on.

## Dev view

- `devtools/maple.html`, served by the dev server only, is the one page for working on the scene.
- URL options: `?season=autumn`, `?gust=2`, `?hud=0` (no controls) and `?hero=0` (the scene alone).
- The scene's handle is on the console as `maple`: `maple.current.gust()`, `maple.current.treeAt(x, y)`.

## Retired

Retired code is kept for reference in `archive/` and never built (each folder's README lists what's there):
- `archive/old-site/`: the old multi-page site, with its pages, sections, footer, CSS utilities and test page.
- `archive/moodboard/`: the old mood board and its (Rest) tab, with their settings.

Anything the live site stops using goes there, at the path it had, not left in the project.
