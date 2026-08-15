# Tech Stack — What, and Why

Every dependency in this project earns its place. This doc is your answer key
for "why did you choose X" in an interview — read it once, and you should be
able to defend every major library choice without notes.

## Frontend

### React 19 + TypeScript + Vite

**What it does:** the UI framework, type safety, and dev/build tooling.

**Why React 19, not 18:** the original plan (`krishnaos-coding-prompt.md`)
specified React 18. When scaffolding, `npm create vite@latest` pulled React
19 as the current stable default. Rather than pin backward to 18, we kept 19
— it's the current stable release, and every other library in the stack
(Framer Motion, react-rnd) supports it fully. There's no compatibility reason
to run an older major version; "use what's current and stable" beat "match
an older written spec exactly."

**Why Vite over Create React App / webpack:** CRA is deprecated. Vite gives
near-instant dev server startup and hot module replacement because it
serves source files over native ES modules in dev (no bundling until you
build for production) — that matters a lot when you're iterating on
animation timing, which needs fast feedback loops.

### Tailwind CSS v4

**What it does:** utility-first CSS, plus (critically for this project) the
mechanism for our design token system.

**Why v4, not v3:** v3 configures its theme in a separate JS file
(`tailwind.config.js`) — you write `theme.extend.colors` as a JS object. v4
moved to a **CSS-first** config: you define tokens directly in CSS using an
`@theme` block (see `apps/client/src/index.css`). This matters specifically
for this project because the plan (per the coding prompt) was always to
mirror Figma's variable structure "1:1" using CSS custom properties. In v3
you'd effectively maintain tokens twice — once as CSS variables, once as
Tailwind's JS config, kept in sync by hand. In v4, the `@theme` block *is*
both: it defines real CSS custom properties (`--color-os-accent`, etc.) *and*
generates the matching Tailwind utility classes (`bg-os-accent`) from the
same declaration. One source of truth. See `04-styling-system.md` for how
this is actually used.

**Why Tailwind at all, vs. plain CSS or CSS Modules:** velocity, mostly —
this project has a lot of surface area (dozens of UI states across boot,
welcome, dock, windows, tour) and utility classes let us move fast without
inventing a new class name for every visual tweak. The token system (above)
is what keeps that speed from turning into visual inconsistency.

### Framer Motion

**What it does:** component-level animation — the kind tied to React state
and lifecycle. Used for: the Welcome panel's entrance, button hover states,
mode-switch fade transitions in `OsRoot`.

**Why Framer Motion over just CSS transitions:** Framer Motion animations are
declarative and tied to component mount/unmount (`AnimatePresence`), which
matters a lot for something like "the Welcome panel should fade out cleanly
when the user picks a mode, and the next screen should fade in" — coordinating
that with raw CSS transitions across React re-renders is fragile. Framer
Motion also gives us spring physics (`ease: [0.34, 1.1, 0.64, 1]` on the
Welcome panel) that's hard to hand-write in CSS.

### GSAP

**What it does:** the boot sequence's timeline animation specifically —
nothing else in the app uses it (deliberately, see below).

**Why GSAP for boot, but Framer Motion for everything else:** these two
libraries are good at different things. GSAP's `.timeline()` API is built for
*sequenced, filmic, multi-beat* animation — "do A, then 0.3s before A ends
start B, then after B finishes wait 0.4s then do C" — with frame-accurate
control over overlap and timing offsets. That's exactly the boot sequence:
6 precisely-timed beats with intentional overlaps (see `05-boot-sequence.md`
for the beat-by-beat breakdown). Framer Motion *can* sequence things via
`variants` and `staggerChildren`, but it's optimized for component-driven
animation (animate when props/state change), not authored timelines with
frame-level scrubbing control. Using GSAP for the one place that needs a
true timeline, and Framer Motion for everything reactive to component state,
plays to each library's actual strength rather than forcing one tool to do
both jobs.

### Zustand

**What it does:** global client-side state — which mode the OS is in, which
windows are open, boot completion status, tour progress.

**Why Zustand over React Context, or over Redux:**
- **vs. Context:** Context re-renders every consumer on every change unless
  you carefully split providers or memoize — Zustand's selector pattern
  (`useModeStore((s) => s.mode)`) means a component only re-renders when the
  *specific slice* it reads changes. For OS-level state that changes
  frequently (window positions dragging, z-index on every focus), that
  matters for perf.
- **vs. Redux:** Redux's actions/reducers/dispatch ceremony is overhead this
  project doesn't need. Zustand stores are just a function returning state +
  the functions that mutate it — see `03-state-management.md` for the actual
  stores (five, as of Phase 7's `useThemeStore`) and why they're kept
  separate instead of one big store.

### Fuse.js

**What it does:** fuzzy search, powering Spotlight (the ⌘K-style search).

**Why Fuse.js over a real search service (Algolia, etc.):** this project's
entire searchable corpus is maybe a few dozen items — projects, skills,
experience entries. That's small enough to hold in memory client-side.
Fuse.js does approximate/fuzzy string matching entirely in the browser with
zero backend calls, which is the right amount of tool for "search seven
categories of portfolio content," not "search a million-row dataset."

### React Router

**What it does:** client-side routing — currently `/` (the full OS
experience) and `/recruiter` (a direct-linkable Recruiter Mode).

**Why routing at all, if this is a single-page "OS":** because Recruiter
Mode needs to be **shareable as a direct link** — a recruiter should be able
to get a URL that drops them straight into the condensed view without
watching the boot sequence or clicking through Welcome. That's explicitly
called out in the UX flow doc's open questions ("recruiters share links").
Routing is the standard, correct tool for "this state should be
bookmarkable/shareable via URL."

### react-rnd

**What it does:** low-level drag/resize math for the window manager
(`os/window-manager/WindowManager.tsx`), on desktop viewports only — on
mobile, windows render as stacked sheets instead and never touch
react-rnd at all (see `docs/11-visual-polish-and-mobile.md`).

**Why react-rnd, and why the coding prompt explicitly said "own the
window-state architecture yourself":** dragging and resizing a DOM element
involves a lot of fiddly math (pointer deltas, boundary clamping, resize
handle hit-testing) that's genuinely not worth hand-rolling — react-rnd
solves that math well. But *where windows live, how focus/z-index work,
what "opening an app" means* — that's `useWindowStore` (see
`03-state-management.md`), built from scratch. The split matters for the
"flex" story: using a library for solved-problem math (drag math) while
owning the actual state architecture yourself (window manager logic) is a
more honest signal of engineering judgment than either "I built literally
everything by hand" (not true, and drag math isn't the interesting problem)
or "I used a pre-built window manager library" (that would hide the actual
skill this project is meant to demonstrate).

## Backend

### Express + TypeScript

**What it does:** the API server — currently three routes
(`/api/health`, `/api/contact`, `/api/content`).

**Why Express, not Fastify/Koa/a framework-less approach:** Express is the
default, well-understood choice for a small REST surface. This backend is
intentionally minimal (see `01-architecture.md`) — there's no case here for a
framework chosen for raw throughput or plugin ecosystem depth. Express keeps
the backend code legible to any reviewer.

### Mongoose + MongoDB

**What it does:** schema-validated persistence for contact form submissions,
and (later) portfolio content if it moves off hardcoded client data.

**Why Mongoose over the raw MongoDB driver:** Mongoose gives schema
validation at the application layer (`required`, `maxlength`, `trim` on the
`ContactSubmission` schema) and TypeScript type inference
(`InferSchemaType`) from that schema — so the shape of a saved document and
the shape TypeScript checks against come from one definition, not two.

**Why MongoDB over Postgres/a relational DB:** the data here (contact
submissions, and eventually project/experience entries) is document-shaped,
low-relational, and low-volume. There's no join-heavy query pattern that
would push toward a relational database. MongoDB Atlas's free tier is also
the standard, zero-friction choice for a portfolio-scale project.

## Shared

### TypeScript (strict mode, everywhere)

Every package (`client`, `server`, `shared-types`) runs with `"strict": true`.
This isn't a default — it was deliberately kept on rather than loosened, and
it caught real bugs during scaffolding (see `decisions/0002-typescript-strict-mode.md`
for two examples: an unsafe tuple index on `mongoose.connection.readyState`,
and a Fuse.js type import that only strict mode's stricter resolution
surfaced).

## What we deliberately did NOT add

Worth knowing for interviews — the absence of a tool is also a decision:

- **No GraphQL** — the API surface is three simple REST routes. GraphQL
  solves over-fetching/under-fetching problems for larger, more relational
  APIs; adding it here would be complexity with no corresponding benefit.
- **No Redux** — see Zustand above.
- **No a11y-only or animation-only mega-libraries** (e.g. React Spring
  instead of Framer Motion) — Framer Motion covers both component animation
  and gesture/drag primitives, so one library does more of the job.
- **No Turborepo/Nx** — see `01-architecture.md`.
- **No icon library** (e.g. lucide-react, heroicons) — `os/icons.tsx` is a
  small, fixed set of hand-drawn inline SVGs (7 app glyphs + a handful of
  chrome glyphs). A real icon library makes sense when you need hundreds of
  icons on demand; this project needs about a dozen, known in advance, so
  pulling in a dependency (and its bundle weight) for that would cost more
  than it saves. See `docs/11-visual-polish-and-mobile.md`.
- **No weather/GitHub API client library** — `StatusWidgets.tsx` calls
  `api.open-meteo.com` with plain `fetch` (no API key required) and renders
  GitHub's own public image endpoints (`github.com/<user>.png`,
  `github.com/users/<user>/contributions`) as plain `<img>` tags. Neither
  integration is complex enough to justify a dedicated SDK.
- **No responsive/breakpoint library** (e.g. react-responsive) —
  `lib/useMediaQuery.ts` is an 8-line hook wrapping `window.matchMedia`
  directly. The project only ever needs one breakpoint check
  (`useIsMobile`, `max-width: 767px`), which doesn't warrant a dependency.
