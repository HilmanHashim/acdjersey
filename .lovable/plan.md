

## Catalogue Carousels → Sub-Pages

Turn each category card on `/catalogue` into a clickable preview that links to a dedicated sub-page showing all images for that jersey type. Sub-pages won't appear in the navbar.

### What will change

**1. Extract uploaded archives**
Unpack the four `.rar` files (`Collared.rar`, `Long_Sleeve_And_Muslimah.rar`, `Singlet.rar`, `Standard_Cutting.rar`) into `src/assets/catalogue/` under sub-folders:
- `src/assets/catalogue/collared/`
- `src/assets/catalogue/longsleeve/` (Long Sleeve & Muslimah)
- `src/assets/catalogue/singlet/`
- `src/assets/catalogue/standard/`

Existing flat `collared-1.png`, `longsleeve-1.png`, etc. will be removed in favor of the new full sets.

**2. Update `/catalogue` page**
Each of the 4 category cards stays as a small auto-rotating preview carousel (showing ~5 representative images), but the entire card becomes a clickable link to its sub-page. The lightbox-on-image-click behavior is removed — clicking anywhere on the card navigates to the sub-page. A subtle "View all →" hint appears on hover.

**3. New sub-pages (4 total)**
- `/catalogue/long-sleeve`
- `/catalogue/singlet`
- `/catalogue/collared`
- `/catalogue/standard-cutting`

Each sub-page contains:
- Navbar + Footer (consistent with site).
- Back link → `/catalogue`.
- Hero with category title + description.
- Responsive masonry/grid of ALL images for that category (using `import.meta.glob` to auto-pick up every image in the folder — no manual import list to maintain).
- Click any image to open the existing lightbox (full-screen viewer).

**4. Routing**
Add 4 routes in `src/App.tsx` using a single `CatalogueCategory` page driven by a URL slug param (`/catalogue/:slug`). Sub-pages will NOT be added to the navbar — only reachable by clicking a card on `/catalogue`.

**5. Reusable carousel logic**
Extract the existing auto-rotating carousel from `Catalogue.tsx` into a small shared component used by both the category cards (preview mode) and sub-page (if needed). Keeps animations consistent.

### Technical approach

- Use `code--copy` to extract each `.rar` into `/tmp/`, then unpack with `unrar` (via `nix run nixpkgs#unrar`) and copy contents into `src/assets/catalogue/<category>/`.
- Use Vite's `import.meta.glob('@/assets/catalogue/<category>/*.{png,jpg,jpeg,webp}', { eager: true, as: 'url' })` to dynamically load all category images — no need to maintain an import list as new images are added.
- New file: `src/pages/CatalogueCategory.tsx` — single component that reads `:slug`, looks up the category metadata (title, description, image glob), and renders the grid + lightbox.
- Update `src/pages/Catalogue.tsx` — wrap each `CategoryCard` in a `<Link>` from `react-router-dom`, remove `onImageClick`/lightbox, replace per-image button with a non-interactive img, keep auto-rotation + dots + arrows (arrows stop event propagation so they don't trigger navigation).
- Update `src/App.tsx` — add `<Route path="/catalogue/:slug" element={<CatalogueCategory />} />`. Navbar untouched.
- Keep existing animations (`animate-slide-up`, hover lifts) consistent on sub-pages.

### Files to be created / edited
- **Created**: `src/pages/CatalogueCategory.tsx`
- **Created**: image folders under `src/assets/catalogue/{collared,longsleeve,singlet,standard}/` (populated from .rar archives)
- **Edited**: `src/pages/Catalogue.tsx` (cards become links, image lookup via glob)
- **Edited**: `src/App.tsx` (add `/catalogue/:slug` route)
- **Removed**: old flat `collared-N.png`, `longsleeve-N.png`, `singlet-N.png`, `standard-N.png` (replaced by folder contents)

### Open question
The Long Sleeve card on `/catalogue` is currently labeled "Long Sleeve / MUSLIMAH" and the archive is `Long_Sleeve_And_Muslimah.rar`. The sub-page will show all images together under that combined title. If you'd prefer Muslimah split into its own card + sub-page (`/catalogue/muslimah`), let me know after approval and I'll split them — depends on how the images are organized inside the .rar.

