
## Add More Animations to Homepage

Enhance the landing page with smooth, professional animations to make it feel more dynamic and engaging without being distracting.

### What will change

**1. Scroll-triggered reveal animations**
Sections will fade and slide in as the user scrolls down. Each section (About, Gallery, Services, Clients, Reviews, Map) animates into view once it enters the viewport.

**2. Hero section enhancements**
- Stagger the existing hero text so the tagline, heading, paragraph, buttons, and location info appear one after another instead of all at once.
- Add a subtle slow zoom-in (Ken Burns effect) on the hero background image.
- Add a soft floating glow behind the gradient heading.

**3. Section heading animations**
Section labels ("Our Work", "Trusted By Many", etc.) and their headings will fade up with a small delay between them for a polished cascading effect.

**4. Card and image hover effects**
- Service cards: lift slightly and add a soft shadow on hover.
- Client carousel images: smoother zoom + subtle border glow on hover.
- Review cards: gentle lift on hover.

**5. Gallery improvements**
- Replace the current opacity-only crossfade with a smoother fade + subtle scale transition between slides.
- Animate the active dot indicator more fluidly.

**6. Button micro-interactions**
Primary CTA buttons (Get A Quote, Contact Us) get a subtle scale-on-hover and an icon nudge animation (arrow/send icon shifts slightly on hover).

**7. Footer fade-in**
Footer content fades up gently when scrolled into view.

### Technical approach

- Add new keyframes to `tailwind.config.ts`: `fade-in-up`, `slow-zoom`, `float`, `shimmer`.
- Create a small reusable `useInView` hook (using `IntersectionObserver`) in `src/hooks/use-in-view.ts` to trigger animations only when sections enter the viewport.
- Wrap section contents in a lightweight `<AnimatedSection>` component (or apply the hook directly) that toggles animation classes on intersection.
- Update each landing component (`Hero`, `About`, `Gallery`, `Services`, `Clients`, `Reviews`, `Map`, `Footer`) to use the new animations and stagger delays via inline `animationDelay` styles.
- Use `prefers-reduced-motion` media query to disable animations for users who opt out (accessibility).
- No new dependencies required — pure CSS + Tailwind + native IntersectionObserver.

### Files to be edited
- `tailwind.config.ts` — new keyframes & animation utilities
- `src/index.css` — reduced-motion fallback + helper classes
- `src/hooks/use-in-view.ts` — new file (intersection observer hook)
- `src/components/landing/Hero.tsx`
- `src/components/landing/About.tsx`
- `src/components/landing/Gallery.tsx`
- `src/components/landing/Services.tsx`
- `src/components/landing/Clients.tsx`
- `src/components/landing/Reviews.tsx`
- `src/components/landing/Map.tsx`
- `src/components/landing/Footer.tsx`
