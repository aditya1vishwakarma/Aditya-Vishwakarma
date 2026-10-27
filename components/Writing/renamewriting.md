# How to Rename a Writing Template

If you want to duplicate or rename an existing writing template (like turning `DJXProject.tsx` into `KeepVibe.tsx`), you need to update a few connection points in the React application. 

Follow these 4 steps:

### 1. Rename the file itself
First, physically rename the file in your code editor or terminal.
*Example: Change `pages/works/DJXProject.tsx` to `pages/works/KeepVibe.tsx`*

### 2. Update the names inside the file
Open your newly renamed file (`KeepVibe.tsx`). You need to alter the component function name at the top, and the export statement at the bottom.

```tsx
// Change the function name
const KeepVibe = () => { // formerly DJXProject
  // ... your content block
}

// Change the export at the bottom of the file
export default KeepVibe; // formerly DJXProject
```

### 3. Update the address in `components/Home/routes.tsx`
The site is one page, and every project and post opens in its pane by its address. Open `components/Home/routes.tsx`, update the import, and update its entry in `PIECES` — its address, and the section whose list it's in (`'work'` or `'writing'`).

```tsx
// 1. Change the import at the top of routes.tsx
import KeepVibe from '../../pages/works/KeepVibe';

// ... deeper in the file ...

// 2. Change its entry in PIECES
'/works/keep-vibe': { section: 'work', Page: KeepVibe },
```

### 4. Update the link in its list (`constants.ts`)
The Work and Writing panes list what's in `PROJECTS` and `BLOG_POSTS`. Find its entry in `constants.ts` and update the `path` property so a click on it opens the right piece:

```typescript
{ 
  title: 'Keep Vibe App', 
  // ... other properties
  path: '/works/keep-vibe' // Update this string to match the address from Step 3
}
```

Once you do those 4 things, your new template is fully integrated and ready to be customized!
