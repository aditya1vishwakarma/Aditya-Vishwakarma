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
   - **Width:** as wide as the section needs: wide (two thirds of the screen), medium or narrow.
   - **Head:** the section's name, open out (Work and Photos), and close. A section's line about itself (Photos, Writing) sits directly under its name, as the first thing on the glass, and scrolls away under the head.
   - **Work's name** scrolls away with its list rather than staying in the head, so it never stacks over Un-Selected Works. Only the buttons stay, and only the glass's top edge blurs.
   - **Scene:** it keeps drawing, the camera slides so the tree stays in view beside the pane, and the wind settles.
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

**The head** floats over what's on the glass. Whatever scrolls up under it blurs away progressively (three layers of blur, strongest at the top), with a touch of tint once anything is under it. Its height is fixed for each look, so nothing on the glass jumps.

**Navigating:**
- Escape goes up one level: from a piece, a photo or expandedView to the list, then from a list to home.
- Back goes back through the history when the list is where the reader came from, and otherwise to the list.
- Stepping between photos replaces the history entry, so Back still goes straight to the grid.

## Margins

- **Desktop:** one margin, 36px, on every edge.
  - The nav pill's top and right edges sit on it.
  - A list's pane has its right and bottom edges on it.
  - The name's and the title's last baselines sit on it.
- **contentView and expandedView:** the pane comes nearer, 18px from every edge, for the room. Nothing else is there to line up with, since the nav has gone.
- **Phone:**
  - The type sits on a 24px margin.
  - The nav and the pane sit 14px from the edges (`navPlace` in `components/Layout/Navbar.tsx`).
  - In contentView the pane takes the top as well, still 14px in.

## Breakpoints

- **Phone layout for the pane and the nav** (the pane filling the screen, the nav behind a menu button): a screen narrower than 740px, or shorter than 500px, which is a phone held sideways (`isCompact` in `constants.ts`).
- **The lists** switch with Tailwind's `roomy:` variant, at 600px wide and 500px tall (`index.css`). From 600px a tablet-width screen gets the desktop's tiles and rows even where its pane fills the screen. Below that, or on a phone held sideways, it gets the phone's rows.
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
  - an un-selected work or a post has its line cut to two
  - small capitals drop to 10.5px

## Motion

- **Nothing on the glass is laid out again while the glass changes size.** Content reflowing during a resize is what made Photos lag: 1–2s main-thread stalls in Firefox.
  - The glass sets off at once (0.44s). Meanwhile what was on it fades out (0.16s), held at the width it had.
  - The next card is built during the move, at the width and height it will have (`usePaneHeld` gives the height), and fades in as the glass lands. It's laid out once, never again frame by frame, so opening Photos out to expandedView doesn't stall on its grid.
- **New content at the same size:** the next card is built beneath the old one as soon as the old one starts to leave, and comes in once it has gone (the notecard turn). Building it can't hold the turn up.
- **Frosted glass is moved or tinted, never faded.** Safari paints faded frosted glass white.
  - To thicken it, animate the opacity of an overlay inside the glass.
  - To move the nav away, use `translate`.
- **Animate the whole `transform`, and `opacity`.** The browser runs those off the main thread. Avoid framer's `x`/`y` and layout properties. The one exception is the pane's edges during a resize, when there's nothing on it.
- **Reduced motion:** cards only fade, and the glass and the nav move at once.

## Performance

- A pane's pictures wait until the pane has come to rest. A section's pictures start loading when its nav item is pointed at or focused (Work, Photos).
- Content images use `decoding="async"`, so a large picture never holds up a frame.
- A pane's pictures are never `loading="lazy"`: they're all in view once the pane rests, and Safari can leave a lazy picture in a clipped frame unloaded. Prefetched pictures are decoded ahead too.
- The scene draws 30fps in calm air and 60fps during a gust or a camera move. It draws nothing while contentView covers it.

## Pointing at things

- **Lifting:** a row or tile pointed at is lifted onto the site's off-white, `--color-background` (#FBFAF8) at 80%. It's not a green tint, and titles don't turn green.
- **In expandedView** the glass is nearly that colour already, so a faint grey edge and a soft shadow show the lift as well.
- **Arrows:** a card's arrow slides in on hover. On a selected work's tile it sits in the bottom-right corner.

## Nesting

- **Concentric corners:** anything nested in a rounded container keeps its corners concentric with the container's: outer radius = inner radius + the padding between.
- **Smoothing:** anything nested in the pane's squircle corners is smoothed 100% too (`Squircle`, smoothing 1).
  - A selected work's tile: its picture's 18px corners plus 10px of padding make 28px.
  - The museum card sits 18px from the pane's edges, 12px on a phone, at 26px (18px on a phone): the pane's 44px (30px) less the padding.

## Nav

- A frosted pill on the margins, 43px tall: 5px of glass round each link's own pill.
- The open section's link sits on a white pill, which slides from link to link as the section changes. Pointing at a link shows a fainter pill.

## Work

- **Selected Works**, the pane's title, is a grid of tiles. Each is a picture over its name, what it is and when, and a line about it, wrapping within the tile.
  - The columns follow the room the list actually has, using container queries: one, then two (from 440px), then three (from 680px). In expandedView, four from 920px.
  - **Past three selected works** (four in expandedView) the row becomes a horizontal carousel that snaps to each tile, with a sliver of the next one showing so it's plain there are more.
- **A rail on the right** marks the two parts, Selected and Un-Selected: a line for each, as long as the part is tall, with its name set vertically along it. The part in view is darker, and each is a way to jump there. Any list can have one: mark its parts with `data-pane-part` and pass `parts` on its card.
  - The rail takes the scrollbar's place: a pane with one hides its scrollbar (`data-rail`, in `home.css`). It still scrolls by wheel, touch and keys.
- Tiles and their pictures have 100%-smoothed (squircle) corners, and so does the lift.
- **Un-Selected Works** is a section as distinct as a list of its own: its heading is the size of the pane's title, with its line about it. Each row has what it is and when beside its name and a line about it, as the old Works page had.

## Writing

- Its line about itself points to the Substack.
- Under it, a compact filter by category. The chosen chip sits on a pill, as the nav's open section does.

## About

- Smaller type, sized by the screen's height on desktop.
- **The opening lines** run across the top.
- **Below them, on desktop and tablets** (about 400px of room and up): a picture of me in a squircle on the left, with the two approaches stacked on the right.
  - The picture is exactly as tall as the two approaches. Its width is chosen so it's a little taller than it's wide (about 1.15:1), at 30–50% of the row.
  - On a short screen it narrows, so the pane doesn't scroll. The spacing also tightens with the screen's height.
  - A small window (890×692 or so) still scrolls a little, since the text alone is taller than the room.
- **On a phone**, everything stacks: the opening lines, the "what", the "how", then the picture, full width.
- The museum card sits at the foot, nested in the pane's bottom corners.

## Photos

- The grid fills the pane exactly, under its line about itself.
- **Wait before the photos appear:** switching to Photos waits for the last list to leave. From a narrower section, the glass also resizes first.
- **The pictures themselves** are already loaded by then: the previews are fetched at idle on desktop, and on pointing at Photos elsewhere.
- **Pointing at a photo** lifts it out of its cell: it grows 8% over its neighbours, with a shadow, from the corner that keeps it inside the grid (a photo on the right edge grows leftwards, and so on).

## Season

- The scene opens in autumn from October through February, and in summer from March through September (`seasonOf` in `components/Maple/mapleConfig.ts`).
- S swaps it (or *Swap seasons* in the controls). On the dev page, `?season=` sets it.

## Type

- **Serif:** Newsreader, from Google Fonts.
- **Sans:** Helvetica Neue, then Helvetica, then Arial (`--font-sans` in `index.css`). There's no web font for the sans.
- **Small text on the glass** keeps a contrast of at least 4.5:1: charcoal at 75% opacity or more.

## Content pages

- A page is `WritingLayout` (title, date, read time and category) around `Prose` components. It has no back link or page chrome of its own; the pane provides Back, close and the reading-progress ring.
- A gallery's lightbox covers the pane, and its keys take precedence over the pane's: Escape closes the picture first.

## Controls

- **A pill on the nav's glass** in the top left, level with the nav and as tall, reading *controls* in italic Helvetica Neue. Closed, it's only as wide as the word. Pointed at or focused, it widens to 208px and opens down to the controls, one under another (`components/Home/Controls.tsx`).
- It's only there at home, with no pane open, and never on a phone.
- **The keys:** G brings on a gust, and S swaps the season.
- **Music** is muted on every visit. It has no key, so a stray press can't start it: it only plays when it's turned on in the controls. That press is also what lets the browser play sound.
  - The song streams from R2 and loops. Set its address in `MUSIC_SRC` in `components/Home/music.ts`. Until then the switch works and nothing plays.
  - Nothing is fetched until it's first turned on.

## Dev view

- `devtools/maple.html`, served by the dev server only, is the one page for working on the scene.
- URL options: `?season=autumn`, `?gust=2`, `?hud=0` (no controls) and `?hero=0` (the scene alone).

## Retired

Retired code is kept for reference in `archive/` and never built (each folder's README lists what's there):
- `archive/old-site/`: the old multi-page site, with its pages, sections, footer, CSS utilities and test page.
- `archive/moodboard/`: the old mood board and its (Rest) tab, with their settings.

Anything the live site stops using goes there, at the path it had, not left in the project.
