# KrishnaOS

A personal portfolio website disguised as a macOS-inspired operating system.
Boot sequence → Liquid Glass welcome → Guided Tour / Free Exploration /
Recruiter Mode. See `krishnaos-ux-flow.md` for full navigation logic and
`krishnaos-coding-prompt.md` for the build plan this scaffold implements.

## 📖 Documentation

This project is documented as it's built, not after the fact — the goal is
for every architectural decision to be explainable, not just functional.

- **New to this project? Start with [`context.md`](./context.md)** — current
  phase, what's built, hard constraints, how to get back up to speed fast.
- **[`/docs`](./docs/00-overview.md)** — the full learning documentation:
  architecture, tech stack reasoning, state management, styling system, the
  boot sequence, navigation flow, and dated decision records in
  [`docs/decisions/`](./docs/decisions/).
- **[`AGENTS.md`](./AGENTS.md)** — coding conventions for this repo, written
  for AI coding agents (Claude Code, Cursor, etc.) so architecture and style
  stay consistent across sessions and across different tools.

## Stack

- **Client:** React 19 + TypeScript + Vite, Tailwind CSS v4, Framer Motion,
  GSAP, Zustand, Fuse.js, React Router, react-rnd
- **Server:** Node + Express + TypeScript + Mongoose
- **Shared:** `@krishnaos/shared-types` — TS interfaces used by both sides

## Structure

```
krishnaos/
├── apps/
│   ├── client/     # React + Vite + TS frontend
│   └── server/     # Express + TS backend
└── packages/
    └── shared-types/  # Shared TS interfaces
```

## Getting started

```bash
npm install                 # installs and links all workspaces
npm run build -w packages/shared-types   # build shared types once before first run

cp apps/client/.env.example apps/client/.env
cp apps/server/.env.example apps/server/.env
# fill in MONGODB_URI in apps/server/.env if you want DB-backed routes to work

npm run dev                 # runs client (5173) + server (4000) concurrently
```

The server boots fine without `MONGODB_URI` set — it logs a warning and
routes that need the DB will return errors until it's configured. Good for
frontend-only iteration.

## Scripts (run from repo root)

| Script | What it does |
|---|---|
| `npm run dev` | Client + server together, via `concurrently` |
| `npm run dev:client` / `npm run dev:server` | Just one side |
| `npm run build` | Builds shared-types, then client, then server, in order |
| `npm run typecheck` | Typechecks client and server |
| `npm run lint` | Lints the client |

## Current state

**Phase 1 (Foundation): complete**
- Workspace tooling, design tokens (placeholder values), routing skeleton
  (`/`, `/recruiter`)
- Express server with `/api/health`, `/api/contact` (validated, saves to
  Mongo), `/api/content` (placeholder)
- `useModeStore`, `useWindowStore`, `useTourStore` skeletons

**Phase 3 (OS Shell): complete**
- `os/appRegistry.ts` — single source of truth for the 7 app pillars
- Menu bar, Dock, Window Manager (react-rnd + `useWindowStore`), Spotlight
  (⌘K, Fuse.js fuzzy search) — composed together in `os/desktop/Desktop.tsx`
- Both entry points into Recruiter Mode (`WelcomeScreen`, `MenuBar`) now
  behave identically — `setMode('recruiter')` + `navigate('/recruiter')`

**Phase 4 (Content Apps): complete**
- `lib/content.ts` — hardcoded, typed placeholder content for all 7 apps
- All 7 content apps built (`About`, `Projects`, `Skills`, `Experience`,
  `Education`, `Achievements`, `Contact`) and wired into the window manager
- `Contact` is real — posts to `/api/contact` → MongoDB with hand-rolled
  validation and idle/submitting/success/error states

**Phase 5 (Guided Tour): complete**
- `tour/tourSteps.ts` — maps the UX doc's 8 tour steps to `AppId`s
- `TourController` drives `useWindowStore.openWindow` per step, rendering
  the real `Desktop` (not a restricted environment) alongside itself
- `TourBar` — progress + Back/Next/Skip, plus a completion state

**Phase 6 (Recruiter Mode): functionally complete**
- Direct-linkable `/recruiter` route, single-screen glass document view,
  reads from the same `lib/content.ts` the real apps use
- One partial gap: Resume/LinkedIn quick-tile URLs are still empty in
  `PROFILE_LINKS` (`content.ts`) pending the final content pass — GitHub is
  wired; see `docs/10-recruiter-mode.md`

**Phase 7 (Polish pass): in progress**
- Real theming (`useThemeStore`, light/dark, system-aware), real wallpaper
  assets, hand-drawn SVG app icons, real mobile-responsive layouts for
  Dock/MenuBar/WindowManager (a deliberate deviation from the original
  "desktop-only" spec — see `docs/decisions/0004-real-mobile-responsiveness.md`)
- Desktop widgets (Clock, Weather, GitHub, Timeline) — each **independently**
  positioned and draggable, not one shared bundle
- Still open: final content copy, accessibility/perf pass, a couple of
  small flagged items in `docs/11-visual-polish-and-mobile.md`

See [`context.md`](./context.md) for the full, currently-accurate phase
breakdown — this section is a summary, that file is the source of truth.

## Notes / deviations from the original spec

- Scaffolded with **React 19** and **Tailwind CSS v4** rather than React 18 /
  Tailwind v3 — both are the current stable versions as of this scaffold and
  fully compatible with the rest of the stack (Framer Motion, react-rnd).
  Tailwind v4's CSS-first `@theme` config in `apps/client/src/index.css` maps
  naturally onto the "CSS variables mirroring Figma tokens" requirement.
- Design tokens in `index.css` are **placeholders** — swap for exact Figma
  export values before any real screen work begins.
- Boot-skip memory uses `sessionStorage` (not `localStorage`), per the coding
  prompt's own recommendation in §6 — repeat visits days later still get the
  full boot "wow" moment, but same-session navigation doesn't replay it.
