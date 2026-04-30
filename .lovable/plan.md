## Goal

Restyle the `/customize` page to mimic owayo's 3D Designer layout & feel — a clean, light, studio-style configurator with a big 3D stage on the left and a tabbed control panel docked on the right.

## Reference layout (owayo)

```text
┌──────────────────────────────────────────────┬────────────────────────┐
│  [logo] owayo 3D Designer                    │  Change Product | Feat │
│                                              │  ─────────────────────│
│                                              │  ( Design )( Colors ) │
│                                              │  ( Text )( Logos )    │
│                                              │                       │
│            ┌──────────────┐                  │  [active tab content] │
│   ‹  →     │   3D JERSEY  │   ←  ›           │                       │
│            └──────────────┘                  │                       │
│                                              │                       │
│  [zoom+] [zoom-] [rotate] [undo] [reset]     │                       │
│                                              │  Save  Drafts  Roster │
│                                              │  [ Add to cart ]      │
└──────────────────────────────────────────────┴────────────────────────┘
```

## Changes

### 1. Page layout (`src/pages/Customize.tsx`)
- Replace the current 3-column grid with a 2-column layout: large 3D stage (≈65% width) on the left, control panel (≈35%, max ~440px) on the right.
- Light "studio" background for the stage area (soft off-white/very light gray) instead of the dark card it sits in now — matches owayo's airy feel.
- Move all controls (jersey type, zones, palette, graphics) into the right panel as **tabs**: `Design` (jersey type) · `Colors` (zones + palette) · `Graphics` (vector library) · `Review` (summary + send).
- Floating toolbar overlay on the bottom-left of the stage: Zoom in / Zoom out / Reset rotation / Undo / Front-Back toggle — using small round icon buttons like owayo.
- Sticky footer inside right panel with **Reset** + **Send to Enquiry** (styled like owayo's "Add to cart" pill button).
- Keep the "Customize Your Design" hero but make it a slim header bar above the stage rather than a tall hero.

### 2. 3D stage styling (`src/components/customize/Jersey3D.tsx`)
- Switch background from dark gray `#5a5a5d` to a soft light studio (`#f3f4f6` → radial gradient to `#e5e7eb`) to match owayo's clean look.
- Adjust lighting for the lighter backdrop (reduce ambient slightly, soften directional, keep contact shadows).
- Keep the existing geometry — model replacement is on hold until you provide a `.glb`.

### 3. Right panel — tabbed controls
- Use the existing shadcn `Tabs` component for `Design / Colors / Graphics / Review`.
- **Design tab**: jersey type list (current cards, simplified — light theme).
- **Colors tab**: zone selector (Body / Sleeves / Collar / Side panel) as a row of pill chips with a color swatch dot, then the palette grid below. If a graphic is selected, swap to "Graphic color" mode like today.
- **Graphics tab**: the vector grid (tap to add). Includes the size slider for the currently selected graphic.
- **Review tab**: small summary list (jersey type, each zone color w/ swatch, graphics count) + the Send button.

### 4. Floating canvas toolbar (`JerseyCanvas` or new overlay)
- Bottom-left vertical stack of round icon buttons (Lucide: `ZoomIn`, `ZoomOut`, `RotateCcw`, `Undo2`, `RefreshCw`).
- Front/Back toggle becomes a pill at the top-center of the stage (like owayo's arrow chevrons but clearer).
- Zoom buttons drive the existing `OrbitControls` via a ref (`controls.dollyIn / dollyOut` then `update()`), reset button resets camera + rotation.

### 5. Theming tweaks
- Use Tailwind tokens already in the project; introduce light-stage utility classes (no new global tokens needed).
- Keep the accent/primary color story consistent — buttons, active tab, Send-to-Enquiry pill all use `accent`.

## Files to edit

- `src/pages/Customize.tsx` — full restructure into 2-col + tabs.
- `src/components/customize/Jersey3D.tsx` — lighter background + minor lighting tweak; expose imperative camera/orbit ref for toolbar.
- `src/components/customize/JerseyCanvas.tsx` — render the floating toolbar overlay; forward ref for zoom/reset.
- (No new dependencies — `@radix-ui/react-tabs` is already in shadcn `tabs.tsx`.)

## Out of scope (waiting on you)
- Replacing the 3D model with a real jersey `.glb` — you mentioned you'll send a file. I'll wire it up via `useGLTF` once it lands.
- Real-time text/logo upload features (owayo has them but you haven't asked for them yet).