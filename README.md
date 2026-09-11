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

## CONNECT Assistant (chatbot)

A chat widget (bottom-right on every view) that answers visitors' questions
about CONNECT using Claude, and links them to the right section or the
waitlist.

**Setup:** copy `.env.example` to `.env.local`, set `ANTHROPIC_API_KEY`, and
restart `npm run dev`. In production, set the same variable in your host's
environment settings. Without a key the widget still renders, but replies
fail with "The assistant isn't available right now", and the server log
explains why.

- `src/app/api/chat/route.ts` — the only code that holds the API key.
  Validates the conversation, applies per-visitor rate limits, streams the
  reply from `claude-opus-5` as newline-delimited JSON, and maps API errors
  to friendly messages. Refusals are retried server-side on Anthropic's
  recommended fallback model; the system prompt is prompt-cached.
- `src/lib/chat/system-prompt.ts` — what the assistant knows and how it
  behaves. Lists come from `src/lib/content.ts` (shared with the sections);
  the prose mirrors the Hero, Vision, Impact, Join, and legal copy, so
  **update it when that copy changes.** The assistant is told not to invent
  launch dates, pricing, or features the site hasn't announced.
- `src/lib/chat/protocol.ts` — request/stream format and length limits
  shared by the route and the widget.
- `src/lib/chat/rate-limit.ts` — 10 requests/minute and 60/hour per IP, in
  memory. That's per server instance; use a shared store (e.g. Redis) if you
  need strict limits across serverless instances.
- `src/components/chat/ChatWidget.tsx` — the launcher and panel: a start
  view (resume card, suggested questions) and a conversation view with a
  back button between them; streaming replies with stop/retry/new chat and
  follow-up suggestions; keyboard and screen-reader support. A new question
  scrolls to the top of the panel and its reply streams in below. On phones
  the panel is full-screen, the system Back gesture steps
  chat → start → closed, and the panel tracks the on-screen keyboard. The
  conversation lives in `sessionStorage` only.
- `src/components/chat/ChatMarkdown.tsx` — renders the small Markdown subset
  replies use, as React elements (no injected HTML). Hash links such as
  `#join` go through the page's existing router.

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
