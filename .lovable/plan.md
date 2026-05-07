# Catalogue Page Enhancement Plan

The current `/catalogue` page works but feels flat: a basic 2x2 grid of carousels, two big static fabric/collar images, and a Telegram CTA. Since this is the link clients open most, it should feel like a premium brand lookbook — bold, editorial, and easy to skim on mobile.

## Design Inspiration (Referrals)

I'll model the redesign on patterns from these brands (jersey/sportswear/streetwear leaders known for strong catalogue UX):

1. **Nike — By You / Football kits** ([nike.com/football](https://www.nike.com)) — Big edge-to-edge hero collage, sticky category chips, and oversized typography paired with quiet UI.
2. **Adidas — Custom Teamwear catalogue** ([adidas.com/teamwear](https://www.adidas.com)) — Category cards with hover-reveal of multiple jerseys and clear "Explore the range" CTA.
3. **Off-White / Palace lookbooks** — Editorial magazine layout: oversized index numbers ("01 / 04"), asymmetric grid, generous whitespace, bold serif/condensed display type accents.
4. **Aimé Leon Dore** ([aimeleondore.com](https://www.aimeleondore.com)) — Clean bento-style category mosaic with mixed aspect ratios (tall + square) instead of uniform cards.
5. **Castore / Castelli teamwear** — Materials & customization shown as interactive tabbed swatches rather than one large image.

Common thread: bold hero, varied tile sizes, less chrome around images, materials shown as a tactile grid, sticky/quick navigation.

## What Will Change

### 1. Hero — Editorial opener
- Replace the small centered title with a full-width hero band: a large background collage (3–4 jerseys faded behind a dark gradient) + oversized condensed headline ("THE 2026 CATALOGUE") + short subline.
- Add a **sticky category chip bar** below the hero (Long Sleeve · Singlet · Collared · Standard · Fabrics · Collars) that smooth-scrolls to each section. Stays useful when sharing the link — clients can jump straight to what they want.

### 2. Category showcase — Bento mosaic
- Replace uniform 2x2 grid with an **asymmetric bento grid**: one feature tile (tall, e.g. Long Sleeve) + three supporting tiles. Rotates emphasis on desktop, stacks cleanly on mobile.
- Each tile:
  - Numbered index ("01 — Long Sleeve") in condensed display type.
  - Image fills the tile edge-to-edge (remove inner border/padding).
  - Hover: subtle zoom + dark overlay revealing 3 thumbnail strip + "View all 24 designs →".
  - Auto-rotating preview kept but slower (5s) and crossfade instead of horizontal scroll for smoother feel.

### 3. Fabric Types — Interactive swatch grid
- Replace the single static image with a **grid of 10 fabric cards** (one per fabric: Interlock, Pin Dot Mesh, etc.). Each card shows the fabric crop + name + 1-line use case. Click opens a lightbox with the full reference image.
- Falls back gracefully on mobile (2-col grid).

### 4. Collar Types — Same swatch treatment
- Mirror the fabric grid: 11 small collar cards with name labels. Hover lifts the card and shows a tooltip with style notes.

### 5. Section dividers & rhythm
- Replace the thin gradient line dividers with **labeled section headers**: small accent eyebrow ("02 / Materials"), large display title, short intro paragraph — magazine style.
- Add scroll-reveal (`reveal in-view` already in `index.css`) to each section for a smoother feel as clients scroll.

### 6. Telegram CTA — Upgrade to full call-to-action band
- Replace centered text + button with a **dark bordered band** spanning the section: left side has heading + "Browse 500+ designs in our Telegram channel", right side has the Telegram button + a secondary "Request custom design" link going to `/enquiry`.

### 7. Sharing polish
- Since the link is shared often, add an **Open Graph meta** update for `/catalogue` (title, description, og:image using one of the hero collage images) so previews look strong on WhatsApp/Telegram.

## Technical Notes

- **Files to edit:** `src/pages/Catalogue.tsx` (full rework), `index.html` (OG tags — but page-level meta needs `react-helmet-async` or a small `<Head>` effect; will use a lightweight `useEffect` to set `document.title` + meta tags for `/catalogue` route).
- **No new dependencies.** Reuse existing `lucide-react` icons, Tailwind utilities, and animations (`animate-fade-in`, `reveal in-view`, `card-lift`).
- **CategoryCard component** stays in the same file but gets a `variant: "feature" | "standard"` prop for bento sizing, and switches carousel from horizontal scroll to opacity crossfade.
- **Fabric/Collar grids** read from existing `fabric-types.png` / `collar-types.png` via small hardcoded arrays of `{ name, useCase }` overlaid on cropped tiles. If individual fabric images aren't available, the lightbox shows the full reference image. (I'll check `src/assets/catalogue/` for separate fabric/collar assets first; if absent, I'll use CSS background-position cropping on the existing combined image.)
- **Sticky nav bar** uses `position: sticky; top: navbar-height` with smooth-scroll anchors (`#long-sleeve`, `#fabrics`, etc.).
- **No data model or routing changes.** All existing links (`/catalogue/:slug`) keep working.

## Out of Scope (for now)

- Reworking the per-category pages (`CatalogueCategory.tsx`).
- Adding filtering/search.
- Localization changes.

Approve to implement, or tell me which sections to drop/swap.
