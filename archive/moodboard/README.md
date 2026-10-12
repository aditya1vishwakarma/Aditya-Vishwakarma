# Archived: the old mood board

Retired when the Mind Museum (`pages/MoodBoardMuseumPage.tsx`, `components/Museum/`)
became the mood board on every platform, at `#/mindmuseum`. Kept for reference only:
nothing imports these files, and they're excluded from the TypeScript build
(`tsconfig.json`) and from Tailwind's class scan (`index.css`).

Each file sits at the path it had in the project, under this folder, so its
relative imports read as they did when it was live.

| File | What it was |
| --- | --- |
| `pages/MoodBoardV2Page.tsx` | The previous `/moodboard`: grid and ring views on desktop, masonry and list on phones. |
| `pages/MoodBoardPage.tsx` | An earlier mood board page, already unused. |
| `components/Sections/MoodBoard.tsx` | A horizontal-scroll mood board section, already unused. |
| `components/UI/MoodBoardCard.tsx` | The frosted card used by the grid and the ring. |
| `components/UI/RestView.tsx` | The "(Rest)" tab: photographs drifting over clouds. |
| `components/UI/RestPlates.tsx` | The photographs in the (Rest) tab. |
| `components/UI/Clouds.tsx` | The WebGL cloud layer behind (Rest). |
| `components/UI/CloudControls.tsx` | The (Rest) tab's cloud tuning panel. |

Still in the live code and still used: `MOOD_BOARD` in `constants.ts` (the board's
items) and `components/UI/Squircle.tsx`. The `REST_*` settings in `constants.ts`
and the `RestPlate` type in `types.ts` only fed the (Rest) tab and are now unused.

To bring a file back, move it to its original path.
