

## Apply Hero Glow Globally + Random Catalogue Rotation in Gallery

### 1. Reusable glow on every page hero title

The pulsing radial glow currently sits behind only the homepage `<h1>ACD Jersey</h1>`. Apply the same effect behind the main `<h1>` of every other page hero:

- `src/pages/AboutUs.tsx` — "Who We Are"
- `src/pages/Agents.tsx` — "Contact Our Team"
- `src/pages/Enquiry.tsx` — "Get A Quote"
- `src/pages/EnquirySubmitted.tsx` — confirmation heading
- `src/pages/Catalogue.tsx` — "Our Catalogue"
- `src/pages/CatalogueCategory.tsx` — category title

Implementation: extract the glow markup into a tiny helper class in `src/index.css` (`.title-glow` — wraps the heading with a `::before` pseudo-element using the existing `animate-pulse-glow` keyframe and the primary→accent gradient). Then replace each page's plain `<h1 className="text-gradient ...">` with `<h1 className="text-gradient title-glow ...">`. No new keyframes needed (already exists in `tailwind.config.ts`).

This keeps Hero.tsx working as-is (its existing inline `<span>` glow remains visually identical), and brings the same subtle red→orange aura to every other hero title.

### 2. Random rotation of full catalogue in homepage Gallery

Currently `src/components/landing/Gallery.tsx` cycles through 8 hard-coded `carousel-N.jpg` files. Replace with all images from the four catalogue folders.

Changes to `Gallery.tsx`:
- Remove the 8 static imports.
- Use `import.meta.glob` (eager) on `@/assets/catalogue/{collared,longsleeve,singlet,standard}/*.{png,jpg,jpeg,webp}` — same pattern already used in `Catalogue.tsx`.
- Combine all URLs into one array, then shuffle once on mount with a Fisher–Yates shuffle in a `useMemo` so the order is randomized each page load.
- Keep the existing 3-second auto-advance, dots, prev/next arrows, and scale/fade transition unchanged.
- Cap the dots indicator: with ~346 images, 346 dots would overflow. Hide the dot row when there are more than 12 images (keep arrows + auto-rotate); show a small "X / N" counter pill at the bottom-center instead.

Result: every visit to the homepage shows a fresh random sequence drawn from the entire catalogue (~346 designs).

### Files to be edited
- `src/index.css` — add `.title-glow` utility (single rule with `::before` pseudo-element)
- `src/components/landing/Gallery.tsx` — swap static imports for catalogue glob, shuffle, replace dots with counter when many images
- `src/pages/AboutUs.tsx`, `src/pages/Agents.tsx`, `src/pages/Enquiry.tsx`, `src/pages/EnquirySubmitted.tsx`, `src/pages/Catalogue.tsx`, `src/pages/CatalogueCategory.tsx` — add `title-glow` class to main `<h1>`

No new dependencies, no schema changes.

