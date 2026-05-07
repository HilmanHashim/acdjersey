## Goal
Refresh the top navbar in `src/components/Navbar.tsx` to feel more like a premium sportswear brand site (Nike / Adidas / Under Armour) — bolder, sharper, more dynamic — instead of the current bland gradient bar.

## Visual direction
- Solid deep dark background (`bg-background/95`) with subtle blur, pure flat — no horizontal gradient. Thin red accent bar (1px primary line) at the very bottom of the nav for an athletic edge.
- Slightly taller bar (`h-20`) with logo bumped up (`h-10`).
- Nav links: heavier `font-display`, tighter `text-[13px]` uppercase, wider tracking (`tracking-[0.25em]`), bold weight, no pill backgrounds in idle state — clean text only.
- Hover state: animated underline that slides in from left (red→orange gradient bar 2px under the text), text color brightens to white. No background fill.
- Active route: same animated underline shown permanently + white text + tiny red dot indicator before label (nike-style accent).
- Replace the `Enquiry` link styling so the last link or a dedicated CTA button (e.g. "Get a Quote" → `/enquiry`) renders as a solid red `hero-gradient` pill button on the right, separated by a vertical divider — gives the navbar a strong call-to-action focal point like sportswear sites.
- Mobile: slide-in panel from right with the same underline treatment, larger tap targets, and the CTA button pinned at the bottom.
- Add a subtle scroll-aware effect: when page is scrolled > 20px, navbar shrinks (`h-16`) and gains a stronger shadow + fully opaque background. Use a `useEffect` scroll listener with `useState` for `scrolled`.

## Implementation outline
1. Edit `src/components/Navbar.tsx` only.
2. Add `scrolled` state + `useEffect` window scroll listener.
3. Restructure desktop links with a wrapper span containing label + an absolutely positioned underline `<span>` that uses `scale-x-0 group-hover:scale-x-100 origin-left transition-transform` + `bg-gradient-to-r from-primary to-accent`.
4. Add red dot indicator span shown only when `pathname === link.to`.
5. Add CTA "Get a Quote" button on the right (desktop) using `Button` variant `hero` from `@/components/ui/button`, with a vertical `border-l border-border/60 h-6` divider before it.
6. Update mobile menu styling to match (animated underline, CTA pinned at bottom, slide-in animation via existing tailwind classes).
7. Keep all routes and link labels unchanged. No new dependencies. No changes to other files.

## Out of scope
- No changes to `index.css`, color tokens, or any page content.
- No new routes or assets.
