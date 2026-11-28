---
name: responsive-design
description: Studio Pilz must always be optimized for every screen size — phones, tablets, laptops, large desktops, portrait and landscape. Use whenever creating or editing any page, component, layout, styling, WebGL/Three.js scene, ASCII text, image, or animation in this project, and before considering any UI change done.
---

# Responsive design is mandatory

Every change to this website must work well on **all screen sizes**. A UI change is not finished until it has been checked at mobile, tablet, and desktop widths. Never ship something that only looks right on the screen it was built on.

## Target viewports (check all of these)

| Device            | Width × Height   |
|-------------------|------------------|
| Small phone       | 320 × 568        |
| Phone             | 375–430 × 812+   |
| Phone landscape   | 812 × 375        |
| Tablet portrait   | 768 × 1024       |
| Tablet landscape  | 1024 × 768       |
| Laptop            | 1280–1440 × 800  |
| Large desktop     | 1920+ × 1080     |

## Rules

### Layout
- Mobile-first: write base styles for small screens, then layer up with Tailwind `sm:` / `md:` / `lg:` / `xl:` / `2xl:` (Tailwind v4).
- No horizontal page scroll at any width. Avoid fixed pixel widths on containers; use `w-full`, `max-w-*`, `min()`, `clamp()`, flex/grid with wrapping.
- Keep a comfortable side gutter on mobile (at least `px-4`).
- Grids collapse gracefully (e.g. 1 column → 2 → 3+).
- Use `dvh`/`svh` instead of `vh` for full-height sections so mobile browser toolbars don't cut content off.
- Respect safe areas on notched devices (`env(safe-area-inset-*)`) for fixed/sticky chrome like the navigation.

### Typography
- Scale headings fluidly (`clamp()` or responsive Tailwind sizes); body text never below 16px on mobile.
- Long words, URLs, and titles must not overflow — use `break-words` / `hyphens-auto` where needed.
- ASCII art / `AsciiText`: make sure it scales or switches to a smaller variant on narrow screens instead of overflowing or becoming unreadable.

### Touch & interaction
- Tap targets at least 44 × 44px.
- Never rely on hover alone — every hover effect needs a touch/focus equivalent.
- The mobile navigation must be fully usable with one thumb.
- Interactive canvases (e.g. `DrawingPad`) must support touch/pointer events and must not hijack page scrolling unintentionally (`touch-action` set deliberately).

### WebGL / Three.js (`components/mycelium/*`, `ThreeBackground`, `GrainientBackground`, `HomeJourney`)
- Canvases resize with the viewport and handle orientation changes.
- Adjust camera FOV/position or scene scale by aspect ratio so key elements (e.g. the mushroom, the logo split) stay in frame on tall portrait screens and wide desktops.
- Cap device pixel ratio (e.g. `dpr={[1, 2]}`) and reduce expensive effects/postprocessing on small or low-power devices.
- Scroll-driven journeys must feel right with touch scrolling and shorter viewports.
- Honor `prefers-reduced-motion`.

### Media
- Use `next/image` with correct `sizes` so phones don't download desktop-sized images.
- Images and video keep their aspect ratio and never overflow their container.

## Verification checklist (do this before saying a UI task is done)
1. Run the dev server (`npm run dev`) and view the changed pages at the target viewports above — use a browser tool's resize / device emulation when available.
2. Confirm: no horizontal scroll, no clipped or overlapping content, readable text, usable nav, WebGL scene framed correctly, touch interactions work.
3. Check both portrait and landscape on phone and tablet.
4. Check light and dark themes at mobile width.
5. If you could not visually verify a viewport, say so explicitly rather than claiming it works.
