# Architecture

## The big picture

KrishnaOS is a **monorepo** with three workspace packages:

```
krishnaos/
├── apps/
│   ├── client/     ← React app — everything the visitor sees and interacts with
│   └── server/     ← Express API — contact form storage, (future) content API
└── packages/
    └── shared-types/  ← TypeScript interfaces used by BOTH apps
```

This is managed with **npm workspaces** (the `workspaces` field in the root
`package.json`), not a heavier tool like Turborepo or Nx. For a project this
size, npm workspaces gives us the one thing we actually need — shared code
between client and server without publishing a package to npm — without the
extra config/mental overhead of a build-orchestration tool we don't need yet.

## Why a monorepo at all?

The alternative would be two separate repos (frontend, backend) with types
either duplicated by hand or published as a package to npm. Both of those are
worse for a solo-maintained project:

- **Duplicated types** silently drift — you fix a bug in one copy of
  `Project` and forget the other, and now client and server disagree about
  what a project looks like.
- **Publishing an npm package** for types nobody outside this project uses is
  pure ceremony — versioning, publishing, installing from a registry — for a
  package that only ever has one consumer relationship (this repo, talking
  to itself).

A monorepo with a shared-types workspace gets you type-safety across the
stack for free: change `Project` in `packages/shared-types`, and TypeScript
immediately flags every place in client *and* server that now has a type
error. That's a real "flex" moment in an interview — you can point at one
interface definition and say "this is enforced everywhere it's used, by the
compiler, not by discipline."

## Why npm workspaces specifically (not Turborepo/Nx)?

Those tools solve problems this project doesn't have yet:
- **Turborepo/Nx** shine when you have many packages, expensive builds you
  want to cache, and CI pipelines that need to build only what changed.
- KrishnaOS has **three** packages, tiny build times, and one person running
  `npm run dev` locally most of the time.

Reaching for Nx here would be solving a scaling problem that doesn't exist,
at the cost of another tool to configure and explain. If this project grows
into "many apps, many packages, slow CI," revisit this — see
`decisions/0001-npm-workspaces-over-turborepo.md`.

## The three packages, in detail

### `apps/client`

React 19 + TypeScript + Vite. This is the actual KrishnaOS experience —
everything visual. See `02-tech-stack.md` for what each library inside it
does.

Internal structure (`apps/client/src/`):

```
src/
├── app/            App shell + routing (App.tsx, OsRoot.tsx)
├── boot/           GSAP boot sequence timeline
├── welcome/        Liquid Glass welcome screen
├── os/             OS shell — Phase 3, now expanded with theme-aware
│                   wallpaper, widgets, and desktop/mobile chrome:
│   ├── appRegistry.ts    Single source of truth for the 7 app pillars
│   ├── menu-bar/          KrishnaOS-home + Recruiter Mode switch
│   ├── dock/              Icon row, opens windows
│   ├── window-manager/    Draggable/resizable windows (react-rnd + store)
│   ├── spotlight/         ⌘K fuzzy search overlay
│   ├── theme/             Theme mode, wallpaper, and theme toggle
│   ├── widgets/           Desktop/mobile status widgets
│   └── desktop/           Composes the above into Free Exploration's shell
├── apps/           Content "apps" that render inside windows
│                   (about, projects, skills, experience, education,
│                    achievements, contact — empty scaffolding, Phase 4)
├── tour/           Guided tour controller + tour-bar UI (Phase 5)
├── recruiter/      Recruiter Mode's single-screen view (Phase 6)
├── tokens/          Design tokens as TS constants, if/when needed
│                   alongside the CSS custom properties in index.css
├── lib/            Utilities: API client, Fuse.js search index
└── store/          Zustand stores (mode, window, boot, tour, theme)
```

The `apps/` and `tour/` deeper content are still empty or minimal scaffolding
from Phase 1 — they mark where Phase 4–5 work landed. `recruiter/` graduated
to a real Phase 6 screen that consumes the same shared content slices as the
windowed apps, but in a condensed single-screen layout. `os/` graduated from
scaffolding to real, working components in Phase 3 and now includes the
theme-aware shell polish from Phase 7; see `07-os-shell.md` for the full
breakdown of what's in each subfolder and why.

### `apps/server`

Express + TypeScript + Mongoose. Deliberately small — this is a portfolio
site, not a SaaS backend. It has exactly three responsibilities:

1. `/api/health` — reports server + DB connection status
2. `/api/contact` — validates and persists contact form submissions to MongoDB
3. `/api/content` — currently a placeholder; will eventually serve
   Project/Experience/etc. data if content moves from hardcoded client data
   into MongoDB

The server is intentionally allowed to run **without** a MongoDB connection
configured (`MONGODB_URI` unset) — it logs a warning and keeps serving
requests that don't need the DB. This matters for local frontend development:
you shouldn't need a database running just to iterate on the boot sequence.

### `packages/shared-types`

Pure TypeScript interfaces, no runtime code. Compiled to `dist/` (via `tsc`)
and consumed by both `apps/client` and `apps/server` as
`@krishnaos/shared-types`. See `02-tech-stack.md` for the full list of what's
defined here.

## How the packages connect

```
 ┌─────────────────┐         ┌─────────────────┐
 │  apps/client     │         │  apps/server     │
 │  (React/Vite)    │         │  (Express)       │
 └────────┬─────────┘         └────────┬─────────┘
         │                             │
         │   import from                │   import from
         │   '@krishnaos/shared-types'  │   '@krishnaos/shared-types'
         │                             │
         └──────────────┬──────────────┘
                         ▼
              ┌─────────────────────┐
              │ packages/shared-types│
              │ (compiled to dist/)  │
              └─────────────────────┘
```

Both apps depend on `"@krishnaos/shared-types": "*"` in their `package.json`.
npm workspaces resolves that to a **symlink** into `node_modules` pointing at
`packages/shared-types` — so there's no publishing step, no version bumping.
Edit a type, rebuild `shared-types` (`npm run build -w packages/shared-types`),
and both apps see the change immediately.

This is why `npm run build` at the root builds `shared-types` **first**,
*then* client, *then* server — client and server both need the compiled
`dist/` output to exist before they can typecheck or bundle against it.

## Boot → Welcome → Mode: the runtime flow

At the React level (inside `apps/client`), the experience is orchestrated by
one component, `OsRoot`, which owns three pieces of Zustand state:

```
useBootStore.isBootComplete === false
        │
        ▼
  <BootSequence />  ← GSAP timeline plays (see 05-boot-sequence.md)
        │  (onComplete fires)
        ▼
useBootStore.isBootComplete === true
useModeStore.mode === 'welcome'
        │
        ▼
  <WelcomeScreen /> ← three equal-weight buttons: Tour / Free / Recruiter
        │  (user clicks one)
        ▼
useModeStore.mode === 'tour' | 'free' | 'recruiter'
        │
        ▼
  Real destination (Desktop or RecruiterRoot), depending on the mode
```

This flow is described in full, with the reasoning behind each transition,
in `06-navigation-flow.md`.

## Where to put new code

A quick reference so nothing ends up in the wrong place:

| I'm building... | It goes in... |
|---|---|
| A new content window (e.g. the real Projects app) | `apps/client/src/apps/projects/` |
| A new piece of OS chrome (dock, menu bar, etc.) | `apps/client/src/os/<feature>/` |
| A new global state need | `apps/client/src/store/use<Name>Store.ts` |
| A new API route | `apps/server/src/routes/<name>.ts` + a controller in `controllers/` |
| A new shape of data both apps need to agree on | `packages/shared-types/src/<name>.ts`, re-exported from `index.ts` |
| A one-off utility only the client needs | `apps/client/src/lib/` |

If you're not sure, the test is: **"does the server ever need to know about
this shape?"** If yes → `shared-types`. If it's purely visual/interaction →
lives entirely in `apps/client`. If it's a backend concern only → `apps/server`.
