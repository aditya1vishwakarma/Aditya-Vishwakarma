# How to Rename a Writing Template

If you want to duplicate or rename an existing writing template (like turning `AlpineRetreat.tsx` into `KeepVibe.tsx`), you need to update a few connection points in the React application. 

Follow these 4 steps:

### 1. Rename the file itself
First, physically rename the file in your code editor or terminal.
*Example: Change `pages/works/AlpineRetreat.tsx` to `pages/works/KeepVibe.tsx`*

### 2. Update the names inside the file
Open your newly renamed file (`KeepVibe.tsx`). You need to alter the component function name at the top, and the export statement at the bottom.

```tsx
// Change the function name
const KeepVibe = () => { // formerly AlpineRetreat
  // ... your content block
}

// Change the export at the bottom of the file
export default KeepVibe; // formerly AlpineRetreat
```

### 3. Update the Routes in `App.tsx`
Your application needs to know how to route users to this new file. Open your `App.tsx` file and update the import path and the defined `<Route>`.

```tsx
// 1. Change the import at the top of App.tsx
import KeepVibe from './pages/works/KeepVibe';

// ... deeper in the file ...

// 2. Change the Route in the <Routes> block
<Route path="/works/keep-vibe" element={<KeepVibe />} />
```

### 4. Update the link in your Project Grid (`constants.ts`)
If this project/blog is shown on your main `/works` or `/blog` index pages, find its entry in your `constants.ts` file and update the `link` property so users clicking the tile are directed to the right place:

```typescript
{ 
  title: 'Keep Vibe App', 
  // ... other properties
  link: '/works/keep-vibe' // Update this string to match the Route path from Step 3
}
```

Once you do those 4 things, your new template is fully integrated and ready to be customized!
