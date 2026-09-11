# CONNECT — Next.js port

A pixel-for-pixel, behavior-for-behavior port of the original single-file
static site (`reference/connect.original.html`) into a Next.js App Router
project. Same design tokens, same copy, same animations, same waitlist form
and validation, same hash-based routing between the home page and the
Privacy/Terms views.

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app/layout.tsx` — root layout: metadata, the self-hosted "Anek Latin"
  variable font (via `next/font/google`), and the same
  `html.classList.add('js')` pre-hydration script the original used to gate
  entrance animations.
- `src/app/globals.css` — the original's CSS, ported verbatim (same custom
  properties, same breakpoints, same keyframes).
- `src/app/page.tsx` — assembles every section and owns the interactive
  behavior: nav scroll/active-link state, the mobile menu, the `#/privacy`
  and `#/terms` hash router, scroll-triggered reveals, and the waitlist
  form's validation/submit/success flow. This logic is a near line-for-line
  port of the original's vanilla-JS IIFE (same DOM queries, same
  `IntersectionObserver` usage), wired up in a single `useEffect` so the
  behavior matches exactly rather than being reinterpreted.
- `src/components/` — one component per section (`Hero`, `Vision`, `Ideas`,
  `WhyConnect`, `Impact`, `Ahead`, `Join`, `SiteHeader`, `SiteFooter`,
  `PrivacyView`, `TermsView`, `Toast`, `IconSprite`), all presentational —
  the shared `id`/`class` attributes are what `page.tsx`'s effect hooks into.
- `src/lib/config.ts` — the same `CONFIG` object as the original (waitlist
  endpoint, contact email, LinkedIn URL). **Fill in `waitlistEndpoint`
  before going live** — until then the form runs in demo mode.
- `src/lib/countries.ts` — the country list for the waitlist form's select.
- `public/logo.webp`, `src/app/icon.png` — the CONNECT mark and favicon,
  extracted from the original file's inline base64 data URIs.
- `reference/connect.original.html` — the original static file, kept as a
  reference / fallback.

## Notes on fidelity vs. idiom

To guarantee an exact match, `/privacy` and `/terms` are **not** separate
Next.js routes — they're shown/hidden in place via the same `#/privacy` /
`#/terms` hash-routing scheme as the original single-page app (deep links
still work: loading the site directly at `#/privacy` renders that view).
If you'd rather have them as real, independently-navigable Next.js routes
(better for SEO and shareable URLs, at the cost of no longer matching the
original's exact SPA behavior), that's a straightforward follow-up — just ask.

## Build

```bash
npm run build
```
