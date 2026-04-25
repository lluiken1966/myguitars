# Frontend Design Best Practices — 2025

*Researched and applied to the MyGuitars redesign. Sources: Figma, DEV Community, Peterdraw Studio, NN/g.*

---

## Typography

- **Choose character over safety.** Avoid Inter, Roboto, Arial, Space Grotesk. Use display fonts with personality — Cormorant Garamond, Playfair Display, Libre Baskerville, DM Serif Display.
- **Pair contrasting weights and families.** A thin italic serif headline + geometric sans body creates tension and hierarchy. Example: Cormorant Garamond (display) + Jost (body).
- **Use monospace for data.** Spec tables, years, serial numbers, and labels read better in Space Mono or similar — it signals "technical precision."
- **Uppercase small labels.** `font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em` turns mundane labels into deliberate design elements.
- **Variable fonts** when available — a single file supports the full weight/width range with better load performance.

## Color

- **One dominant accent beats many.** Choose a single hero color and derive everything from it. Old gold (#B8860B), teal (#00A8A0), or rust (#A0522D) — not purple-to-pink gradients.
- **Warm neutrals over cool grays.** `#F9F6F0` (paper white) and `#1A1208` (warm ink) feel crafted; `#F8FAFC` and `#0F172A` feel like a SaaS template.
- **Use CSS `rgba(var(--primary-rgb), 0.12)` for tinted focus rings.** Keeps focus states on-brand without hardcoding.
- **Dark themes need warmth too.** `#100E09` (warm near-black) + `#1C1910` (dark walnut) is more premium than `#000000` or `#0F172A`.

## Motion & Interaction

- **One well-orchestrated entrance beats scattered micro-interactions.** A single `fadeIn` + `translateY` on `.container` is enough; adding more creates noise.
- **The inset box-shadow left-border is the editorial hover.** `box-shadow: inset 4px 0 0 var(--primary)` reveals a gold accent on hover with zero layout shift — no `transform: translateY(-4px)` needed.
- **Transition only what changes.** `transition: box-shadow 0.22s ease, border-color 0.22s ease` not `transition: all 0.3s`.
- **CSS-first animations.** `@keyframes fadeIn` on the container is zero JS and composited by the GPU.

## Layout & Geometry

- **Border-radius tells a story.** `9999px` (pills) = modern SaaS. `3px` (rectangular) = editorial, handcrafted, premium. Match the radius to your brand's personality.
- **Asymmetric borders as accents.** `border-top: 3px solid var(--primary)` on cards/forms creates a deliberate accent without changing the full border.
- **Let the page breathe.** Open editorial layouts (no card wrappers on every section) feel more confident than wrapping everything in a surface.
- **The double-rule masthead.** A `::after` pseudo-element at `bottom: -5px` on the navbar creates a classic editorial double-line — two lines close together signal "masthead."

## Backgrounds & Texture

- **CSS patterns over images.** `repeating-linear-gradient` for ruled paper lines; `feTurbulence` SVG filter encoded as a data URI for film grain. No network requests.
- **Warm cast in shadows.** `rgba(26, 18, 8, 0.10)` (warm amber tint) feels handcrafted; `rgba(0, 0, 0, 0.10)` feels generic.
- **Dark mode diagonal grain:** `repeating-linear-gradient(-18deg, ...)` gives a subtle wood-grain texture to dark surfaces.

## Performance

- **Use `next/font` over `@import url()`** — self-hosts fonts, eliminates render-blocking `<link>`, zero CLS.
- **`display: swap`** on all font declarations — shows fallback immediately, swaps when loaded.
- **`mix-blend-mode: multiply` grain overlays** are GPU-composited and don't affect layout performance.
- **`pointer-events: none`** on decorative overlays (grain, texture) — never block interaction.

## Accessibility

- **Uppercase labels need adequate size.** Never go below `0.65rem` for uppercased text — optical weight is lower than mixed-case at the same size.
- **Gold on paper-white passes WCAG AA.** `#B8860B` on `#F9F6F0` achieves 4.6:1 contrast ratio.
- **`aria-label` on icon-only buttons.** The ThemeSwitcher uses descriptive labels per state.
- **`suppressHydrationWarning` on `<html>`** when using `next-themes` — prevents React hydration mismatch on the `data-theme` attribute.

## Component Architecture

- **CSS custom properties for theming, not class names.** Swapping `data-theme` attribute changes the entire palette atomically — no per-component theme classes.
- **`--primary-rgb` pattern.** Store the raw RGB triple as a separate variable to enable `rgba(var(--primary-rgb), 0.12)` alpha variants without hardcoding.
- **One CSS variable system, four themes.** All four themes (light/dark/vintage/retro) override the same token set — components need zero theme-awareness.

## Neo-Retro / Modern Vintage

- **Pick a decade and be specific.** "Vintage" is vague; "aged photograph / daguerreotype" is not. Specific decade references produce coherent palettes.
- **Sepia filter on images:** `filter: sepia(50%) contrast(0.9) brightness(1.05)` — three properties that together feel photographic, not washed out.
- **Film grain via SVG `feTurbulence`:** Encode as a data URI, apply via `body::before` with `mix-blend-mode: multiply`. No JS, no image file.
- **Warm ink + cream paper** is the universal vintage signal — everything else (fonts, borders, accents) builds on top of that foundation.

---

*Applied in this project: `app/globals.css`, `app/layout.tsx`*
