# Archived: the old multi-page site

Retired when the site became one page: the maple scene with a pane over it
(`components/Home/HomeHero.tsx`). Kept for reference only: nothing imports
these files, and they're excluded from the TypeScript build (`tsconfig.json`)
and from Tailwind's class scan (`index.css`).

Each file sits at the path it had in the project, under this folder, so its
relative imports read as they did when it was live. `constants.ts` and
`types.ts` here re-export the live files, plus the little only the old site
used (`PROJECT_COUNT`), so those imports still find what they name.

| File | What it was |
| --- | --- |
| `pages/Home.tsx` | The old home page: hero, about, work carousel and blog preview. |
| `pages/Works.tsx`, `pages/Blog.tsx` | The old Works and Blog list pages. |
| `components/Sections/` | The home page's sections: `Hero`, `About`, `WorkCarousel`, `BlogPreview`. |
| `components/Layout/Footer.tsx` | The footer under every page. |
| `components/UI/` | `Button`, `ProjectTile` and `ArchivedProjectItem`, used by those pages. |
| `devtools/mask-test.html` | A phone test page for the old hero's circles: masks and touch. |
| `metadata.json` | Google AI Studio's description of the project, from when it was started there. |
| `utilities.css` | The old site's utility classes that nothing uses any more (fluid type sizes, bleeds, float helpers). |

To bring a file back, move it to its original path.
