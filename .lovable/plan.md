## Custom Your Design — Interactive Jersey Builder

A new public page where visitors can pick a jersey type, recolor its zones, and stamp simple vector graphics onto it. When done, their selections are passed to the existing Enquiry form so they can submit contact details.

### Page layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Navbar                                                        │
├──────────────┬───────────────────────────┬───────────────────┤
│ JERSEY TYPE  │                           │  COLORS           │
│ ◉ Standard   │                           │  ▢▢▢▢▢▢▢▢        │
│ ○ Long Sleeve│      [ Live SVG          │  ▢▢▢▢▢▢▢▢        │
│ ○ Singlet    │        Jersey Preview ]   │  + custom hex     │
│ ○ Collared   │                           │                   │
│              │      Front / Back toggle  │  ZONES            │
│ VECTORS      │                           │  • Body  ■        │
│ [stripe]     │                           │  • Sleeves ■     │
│ [chevron]    │                           │  • Collar ■       │
│ [star] ...   │                           │  • Side panel ■   │
│              │                           │                   │
│              │                           │  [ Reset ]        │
│              │                           │  [ Send to Enquiry] │
└──────────────┴───────────────────────────┴───────────────────┘
```

### Features

1. **Jersey type picker** — 4 options matching existing catalogue: Standard Cutting (default), Long Sleeve, Singlet, Collared. Switching swaps the SVG template; chosen colors persist across types when the zone exists.

2. **Live SVG preview** — Flat front/back jersey illustrations with named, separately-fillable zones (`body`, `sleeves`, `collar`, `sidePanel`). All zones default to **white**. Front/back toggle button.

3. **Color picker**
   - Curated swatch palette (~20 colors: white, black, greys, reds, blues, greens, yellow, orange, purple, pink, gold, navy, maroon).
   - Custom HEX input for anything off-palette.
   - User first selects which zone to paint, then taps a color.

4. **Vector graphics library** (~10 starter SVG shapes)
   - stripe, chevron, diagonal slash, dots pattern, star, flame, lightning, wing, shield, tiger-stripe.
   - Click to add onto the jersey; placed graphic can be dragged, resized via corner handle, recolored, and removed (X button).
   - Stored as an array of `{vectorId, x, y, scale, rotation, color}`.

5. **Send to Enquiry**
   - Generates a PNG snapshot of the preview using `html-to-image` (lightweight, no canvas-tainting issues since everything is inline SVG).
   - Builds a structured summary string: jersey type + color list + vector list.
   - Navigates to `/enquiry` with the summary pre-filled into the existing `notes` / `jersey_type` field via React Router `state`. The Enquiry page reads `location.state` on mount and pre-fills the form.
   - The PNG preview is shown above the enquiry form as a thumbnail so the user (and admins later) can see what they designed.

6. **Navigation** — Add "Customize" link to `Navbar` between Catalogue and Enquiry. Add a CTA card on the Catalogue page linking to `/customize`.

### Technical details

**New files**
- `src/pages/Customize.tsx` — main page, layout, state management.
- `src/components/customize/JerseyCanvas.tsx` — wraps the SVG, handles vector placement/drag.
- `src/components/customize/jerseyTemplates.tsx` — 4 SVG components (Standard, LongSleeve, Singlet, Collared) each accepting `colors: { body, sleeves, collar, sidePanel }` and a `view: 'front' | 'back'` prop. Shapes drawn with rounded vector paths in a clean flat style.
- `src/components/customize/vectorLibrary.tsx` — 10 inline SVG vector components with `color` prop.
- `src/components/customize/ColorPalette.tsx` — swatch grid + hex input.

**Modified files**
- `src/App.tsx` — add `<Route path="/customize" element={<Customize />} />`.
- `src/components/Navbar.tsx` — add `{ to: "/customize", label: "Customize" }`.
- `src/pages/Enquiry.tsx` — read `location.state.customDesign` (summary string + preview dataURL), pre-fill notes textarea, render preview thumbnail above form.
- `src/pages/Catalogue.tsx` — add a small CTA section linking to the customizer.

**Dependencies**
- Add `html-to-image` (~15kb) for SVG → PNG export.

**State shape (Customize page)**
```ts
type ZoneColors = { body: string; sleeves: string; collar: string; sidePanel: string };
type PlacedVector = { id: string; vectorId: string; x: number; y: number; scale: number; rotation: number; color: string };
type DesignState = {
  jerseyType: 'standard' | 'long-sleeve' | 'singlet' | 'collared';
  view: 'front' | 'back';
  colors: ZoneColors;
  vectors: PlacedVector[];
  selectedZone: keyof ZoneColors;
  selectedVectorId: string | null;
};
```

**No backend changes required.** Submissions still flow through the existing `enquiries` table via the unchanged Enquiry form. PNG preview is held in memory only (passed via router state), since storage of design images can be added later if needed.

### Out of scope (future)
- Saving designs to the database / user accounts.
- Number, name, and logo upload onto the jersey (can be added as another vector slot later).
- Realistic 3D mockup — current scope is clean flat SVG only.
