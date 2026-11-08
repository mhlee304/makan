# Makan — Project Handoff

**Last updated:** 2026-11-08  
**Status:** Stage 1 complete, running at `localhost:3000`

---

## 1. What We're Building

**Makan** is a recipe collection generator inspired by the interaction model of [Coolors.co](https://coolors.co). Instead of color palettes, it generates curated collections of recipes.

The core loop: five full-height recipe cards fill the viewport. Press **spacebar** to shuffle. Lock cards you want to keep. Click any card to see the full recipe. Hit "Grocery list" to aggregate ingredients across all selected dishes.

The product vision is to make meal discovery fast, addictive, and effortless — not another recipe blog.

---

## 2. Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.4.5 |
| Language | TypeScript | ^5 |
| UI | React | 19.3.0 |
| Styling | Tailwind CSS | v4 (via `@tailwindcss/turbopack`) |
| Fonts | Fraunces (display) + Inter (UI) | via `next/font/google` |
| Images | Unsplash CDN | No API key — direct photo URLs |
| Database | Supabase | **Not yet connected** |
| Auth | Supabase Auth | **Not yet connected** |

### Known dependency fix
`@tailwindcss/node@4.3.5` uses `require()` on `magic-string`, which became ESM-only in v1.x. Fixed with an npm override in `package.json`:

```json
"overrides": {
  "magic-string": "0.30.14"
}
```

If you ever run `npm install` fresh, this override is already in place. If the dev server crashes with an ESM error on `globals.css`, delete `.next/` and restart — it's a Turbopack cache issue.

---

## 3. Features Implemented

### Generator (fully working)
- Five recipe cards displayed as full-height strips, filling the viewport
- **Spacebar** shuffles all unlocked cards with a 220ms fade transition
- Each card shows: food photo, cuisine badge, total time badge, dish name, description (on hover)
- **Lock button** appears on hover; locked cards survive shuffles and show a persistent lock icon
- Spacebar is suppressed when a panel is open or a form element is focused
- Shuffle guard prevents double-firing during the animation

### Slot management
- **+ / −** buttons in the toolbar to add or remove dish slots
- Range: 3 minimum, 7 maximum
- Adding a slot picks a new recipe not already in the collection

### Recipe detail drawer
- Click any card → drawer slides in from the right (480px wide on desktop, full-screen on mobile)
- Shows: hero image, dish name, cuisine, prep/cook/total time, servings
- Full ingredient list with quantities and units
- Numbered step-by-step instructions
- Escape key and backdrop click both close the drawer
- Body scroll is locked while open

### Grocery list panel
- "Grocery list" button in the toolbar opens a full panel
- Aggregates ingredients across **all** currently displayed recipes
- Ingredients with the same name + unit are summed (e.g., "garlic / clove" across recipes)
- Grouped by category: Fresh Produce, Meat & Poultry, Seafood, Dairy & Eggs, Pantry & Dry Goods, Herbs & Spices, Bread & Bakery
- Checkbox per item (checked items get a strikethrough)
- **Copy to clipboard** button exports a plain-text formatted list
- **Print** button triggers `window.print()`
- Shows a chip for each recipe contributing to the list

### Shuffle algorithm
The generator is not purely random. `pickDiverseCollection()` in `lib/generator.ts` maximizes diversity on each shuffle by:
1. Preferring recipes with a cuisine **and** protein not yet used in the current collection
2. Falling back to new cuisines only
3. Falling back to fully random if necessary

This prevents getting five Italian pasta dishes in a row.

### Design system
- **Palette:** warm cream background (`#F8F7F4`), near-black ink (`#1A1917`), terracotta accent (`#C55A3A`)
- **Typography:** Fraunces serif for dish names and headings (`font-display`), Inter for all UI text (`font-sans`)
- Tailwind v4 `@theme inline` block in `globals.css` exposes all tokens as utility classes (`bg-cream`, `text-ink`, `text-terra`, `font-display`, etc.)
- Responsive: horizontal card strip on `sm:` and up, vertical stack on mobile with `min-h-72` per card

---

## 4. Files and Architecture

```
app/
├── page.tsx                        # Thin server component; just renders GeneratorPage
├── layout.tsx                      # Loads Fraunces + Inter fonts; sets metadata
├── globals.css                     # Tailwind v4 @theme tokens; scrollbar styles
│
├── types/
│   └── recipe.ts                   # Recipe, Ingredient, Slot interfaces + IngredientCategory type
│
├── lib/
│   ├── data/
│   │   └── recipes.ts              # RECIPES array — 28 hand-curated recipes, exported
│   └── generator.ts                # buildInitialSlots(), shuffleSlots(), re-exports RECIPES
│
└── components/
    ├── ui/
    │   ├── Badge.tsx               # Pill badge (cuisine, time variants)
    │   └── LockButton.tsx          # Animated padlock toggle button
    │
    ├── Generator/
    │   ├── GeneratorPage.tsx       # Main client component; owns all state
    │   ├── RecipeCard.tsx          # Full-height card with photo bg, hover effects, lock
    │   ├── CardSkeleton.tsx        # Shimmer placeholder (shown during SSR + shuffle)
    │   └── GeneratorToolbar.tsx    # Fixed bottom bar: slot count, spacebar hint, +/−, grocery CTA
    │
    ├── Recipe/
    │   └── RecipeDrawer.tsx        # Slide-in detail panel; full recipe view
    │
    └── GroceryList/
        └── GroceryListPanel.tsx    # Ingredient aggregation, grouped list, copy/print
```

### State model (GeneratorPage.tsx)

```ts
slots: Slot[]          // Array of { recipe, locked, shuffling }
activeRecipe: Recipe | null   // Drives RecipeDrawer open/closed
isGroceryOpen: boolean        // Drives GroceryListPanel mount
isShuffling: boolean          // Guard flag; prevents double-fire during animation
mounted: boolean              // Defers random init to client to avoid SSR mismatch
```

All state lives in `GeneratorPage`. Components receive only what they need via props and fire callbacks upward. No global state manager.

### Recipe data shape

```ts
interface Recipe {
  id: string              // kebab-case slug
  name: string
  cuisine: string         // e.g. 'Italian', 'Thai', 'Indian'
  description: string     // 2–3 sentence editorial blurb
  imageUrl: string        // Unsplash CDN URL (?w=800&fit=crop&q=80)
  prepTime: number        // minutes
  cookTime: number        // minutes
  servings: number
  ingredients: Ingredient[]
  instructions: string[]  // 5–7 steps
  tags: string[]          // e.g. ['weeknight', 'spicy', 'classic']
  protein: string         // 'chicken'|'beef'|'pork'|'fish'|'shrimp'|'lamb'|'egg'|'legume'|'dairy'|'seafood'|'none'
  flavorProfile: string[] // e.g. ['savory', 'spicy', 'bright']
}
```

### Recipe catalog (28 recipes)

| Cuisine | Recipes |
|---|---|
| Italian | Pasta Carbonara, Mushroom Risotto, Cacio e Pepe, Margherita Pizza |
| Japanese | Tonkotsu Ramen, Miso-Glazed Salmon |
| Thai | Pad Thai, Tom Yum Goong |
| Korean | Chicken Bibimbap |
| Chinese | Kung Pao Chicken, Pork & Cabbage Dumplings |
| Vietnamese | Beef Pho |
| Indian | Butter Chicken, Lamb Dum Biryani, Chana Masala, Palak Paneer |
| Middle Eastern | Shakshuka |
| Greek | Lamb Kofta with Tzatziki, Classic Greek Salad |
| Spanish | Seafood Paella |
| Levantine | Hummus & Roasted Vegetable Bowl |
| Mexican | Tacos al Pastor, Chicken Enchiladas, Beef Birria Tacos |
| French | Beef Bourguignon, Coq au Vin, Ratatouille |
| American | BBQ Pulled Pork |

---

## 5. What Was Changed from the Scaffold

The project was a fresh `create-next-app` with Next.js 16, React 19, TypeScript, and Tailwind v4. Everything below was added or replaced:

- `app/page.tsx` — replaced boilerplate with `<GeneratorPage />`
- `app/layout.tsx` — replaced Geist fonts with Fraunces + Inter; updated metadata
- `app/globals.css` — replaced defaults with Makan design tokens and scrollbar styles
- `next.config.ts` — added `images.remotePatterns` for `images.unsplash.com`
- `package.json` — added `"overrides": { "magic-string": "0.30.14" }` to fix ESM/CJS mismatch in `@tailwindcss/node`
- All files under `app/types/`, `app/lib/`, `app/components/` — created from scratch

---

## 6. What's Currently Unfinished

### Not started
- **Supabase** — no database connection, no schema, no env vars
- **Authentication** — no sign-in/sign-up, no user sessions
- **Favorites** — the drawer has no working "Save" button; nothing persists
- **Personalization** — dietary restrictions, disliked ingredients, preferred cuisines, cooking time cap, meals-per-week — none of this exists yet
- **Previously cooked** — no history tracking
- **Collections** — no ability to save/name a collection and return to it

### Partially done
- **Shuffle algorithm** — basic diversity (cuisine + protein variety) is implemented. Stage 2 calls for a richer correlation model: shared ingredients, flavor compatibility, cooking time balance. The `flavorProfile`, `tags`, and `protein` fields on each recipe are ready to power this — the algorithm just isn't using them yet.
- **Favorites UI** — `RecipeDrawer` has space for a heart/save button but it's not rendered yet.

### Known rough edges
- Removing a slot always removes the **last** card, not a specific one. Users can't choose which unlocked slot to remove.
- Food photos are direct Unsplash URLs with no fallback. If a photo 404s, Next.js shows a broken image placeholder. No alt-layout is implemented.
- The grocery list aggregation combines by exact `name + unit` match. "Garlic / clove" and "Garlic / whole" remain separate entries. A normalization layer would improve this.
- No `loading.tsx` or `error.tsx` boundary files exist yet.

---

## 7. Recommended Next Steps

Work through the original development stages in order. Each is self-contained.

### Stage 2 — Richer shuffle algorithm
Improve `lib/generator.ts` using the data already on each recipe:
- Penalize collections where all proteins are the same
- Penalize collections where all cooking times are very long (> 90 min) or all very short
- Bonus for `flavorProfile` diversity (avoid all-spicy or all-rich)
- Bonus for shared-ingredient clusters (e.g., if one dish uses lemongrass, slightly prefer another that also uses it)

No new files needed — just update `pickDiverseCollection()`.

### Stage 3 — Favorites (client-side first, then Supabase)
1. Add a heart button to `RecipeDrawer`
2. Store favorites in `localStorage` as `string[]` (recipe IDs)
3. Show a heart badge on locked/favorited cards
4. Later, migrate storage to Supabase once auth is wired up

### Stage 4 — Supabase setup
1. Create a Supabase project
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
3. Install `@supabase/supabase-js`
4. Schema to create:
   - `profiles` (id, dietary_restrictions, disliked_ingredients, preferred_cuisines, max_cook_time)
   - `saved_recipes` (user_id, recipe_id, saved_at)
   - `saved_collections` (user_id, slot_snapshot JSONB, created_at)
5. Add `app/lib/supabase.ts` client singleton
6. Auth: add sign-in with Google/GitHub via `@supabase/auth-ui-react` or a custom form

### Stage 5 — Personalization
Once Supabase is connected, wire a preferences modal (accessible from the header) that updates the user's profile row. Modify `pickDiverseCollection()` to filter against `dietary_restrictions` and `disliked_ingredients` before selecting.

### Stage 6 — Polish
- Add `loading.tsx` and `error.tsx` app-level boundaries
- Add page transition animations (Framer Motion or CSS)
- Improve mobile UX: swipe to shuffle, tap-to-lock without hover
- Add an "Undo last shuffle" button (keep a one-step history of the previous `Slot[]`)
- SEO: generate static recipe detail pages at `/recipe/[id]` for shareability
- Image fallback: show a colored gradient placeholder if an Unsplash image fails to load

---

## Running the Project

```bash
npm install       # handles the magic-string override automatically
npm run dev       # starts at localhost:3000

# If you get an ESM error on globals.css:
rm -rf .next && npm run dev
```

No environment variables are needed to run the current frontend-only stage.
