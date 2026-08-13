# KrishnaOS — Context

**Read this file first, every session.** It's the fastest way for a human or
an AI agent to get back to full working context on this project. If you're
an AI agent: treat this file as authoritative for current state. If it
conflicts with something you infer from the code, the code is more likely to
be right about *implementation detail*, but this file is authoritative about
*intent, current phase, and what NOT to do*.

## What this project is

KrishnaOS — a personal portfolio website disguised as a macOS-inspired
operating system, built by Krishna Goyal as the flagship project for his
frontend engineering resume. Boot sequence → Liquid Glass welcome → three
peer destinations (Guided Tour / Free Exploration / Recruiter Mode), all
built as an actually-interactive desktop OS metaphor (draggable windows,
dock, menu bar, Spotlight search) — not a slideshow wearing an OS skin.

**This is explicitly not a "move fast, ship something" project.** Every
significant decision is documented (see `/docs`) and every phase is meant to
be understood by Krishna before moving to the next, so he can defend any
part of it in a technical interview. If a shortcut would make the code work
but make it harder to explain, don't take it — flag it instead.

## Source-of-truth documents

- `krishnaos-ux-flow.md` — the complete navigational logic (every screen,
  every transition, every rule). This is the spec for *behavior*.
- `krishnaos-coding-prompt.md` — the original build plan (stack decisions,
  phase breakdown, data models). This is the spec for *how to build it*.
- `/docs/` — living documentation of what's actually been built and why,
  written phase-by-phase as the project progresses. Read `/docs/00-overview.md`
  first if you haven't seen this project before.
- `AGENTS.md` — coding conventions for this repo (file placement, naming,
  patterns to follow). Read this before writing any code.

If this file ever says something that contradicts `krishnaos-ux-flow.md` or
`krishnaos-coding-prompt.md`, treat those two as the ground truth for *what
the product should do* — this file tracks *where we currently are* against
that plan, not a replacement for the plan.

## Current phase: Phase 2 in progress (Boot & Welcome)

Per `krishnaos-coding-prompt.md`'s phase breakdown:

- ✅ **Phase 1 (Foundation)** — complete. Monorepo scaffolding, design token
  system, routing skeleton, all four Zustand store skeletons, Express server
  with health/contact/content routes.
- 🔶 **Phase 2 (Boot & Welcome)** — in progress.
  - ✅ GSAP boot sequence (`boot/BootSequence.tsx`, `boot/useBootTimeline.ts`)
    — full 6-beat timeline + compressed returning-visitor variant + Skip
    affordance, all implemented and matching the UX doc's spec.
  - ✅ Liquid Glass Welcome screen (`welcome/WelcomeScreen.tsx`) — three
    equal-weight entry buttons + skip-intro affordance.
  - ✅ `OsRoot` orchestrates boot → welcome → mode via `AnimatePresence`.
  - ⬜ Not yet done: exact final copy for Welcome panel (currently
    placeholder text), any visual QA/polish pass, SF Pro vs Inter licensing
    decision (currently defaulting to Inter in the font stack).
- ⬜ **Phase 3 (OS Shell)** — not started. Menu bar, dock, window manager,
  Spotlight search. This is next.
- ⬜ **Phases 4–7** — not started (content apps, guided tour wiring,
  Recruiter Mode real content, polish pass).

**Known gap to fix during Phase 3 or 6:** clicking "Recruiter Mode" from
`WelcomeScreen` currently calls `setMode('recruiter')`, which renders
`ModePlaceholder` inside `OsRoot` — it does NOT yet navigate to the real
`/recruiter` route. See `docs/06-navigation-flow.md`'s "Current gap" note.

## Hard constraints — do not violate these without explicit discussion

1. **Don't fake finished UI for unbuilt phases.** `ModePlaceholder` is a
   deliberate, honest stand-in (see `docs/06-navigation-flow.md`). If a
   phase isn't built, say so in the UI — don't build a convincing-looking
   screen with no real functionality behind it.
2. **Don't hardcode colors/spacing/fonts.** Everything visual goes through
   the token system in `apps/client/src/index.css`'s `@theme` block (see
   `docs/04-styling-system.md`). Token values are placeholders pending
   Figma finalization, but the *pattern* of using tokens is not optional.
3. **Don't add a dependency without checking `docs/02-tech-stack.md` first**
   — there's likely already a library in the stack that does what you need,
   and adding a redundant one undermines the "every dependency earns its
   place" story this project is telling.
4. **TypeScript strict mode stays on, everywhere, no exceptions.** See
   `docs/decisions/0002-typescript-strict-mode.md` — it's already caught
   real bugs, not hypothetical ones.
5. **Don't build the window manager as a wrapper around a pre-built window
   manager library.** `react-rnd` is for drag/resize *math* only — the
   actual window state architecture (`useWindowStore`) is meant to be
   hand-built. See `docs/02-tech-stack.md`'s react-rnd section for why this
   distinction matters to the project's goals.
6. **Every phase gets a docs update in the same session as the code change**
   — not "we'll document it later." See `docs/00-overview.md`'s note on
   the learning method.

## Environment / running locally

```bash
cd "/Users/krishnagoyal/Development/personal projects/krishnaos"
npm install
npm run build -w packages/shared-types   # must run before first dev/build
npm run dev                               # client :5173, server :4000
```

Server runs fine without `MONGODB_URI` set (logs a warning, DB-dependent
routes degrade gracefully). See `apps/server/.env.example` and
`apps/client/.env.example` for required env vars.

## Open questions still unresolved

From `krishnaos-coding-prompt.md` §6 and the UX doc §8:

- **SF Pro web licensing** — unresolved. Currently defaulting to Inter in
  the font stack (`--font-os-sans` in `index.css`). Needs a final call
  before any visual polish pass.
- **Exact Welcome panel / tour-bar copy** — currently placeholder/functional
  text, not final voice/copy.
- **Dock icon roster beyond confirmed content pillars** — deferred until
  Phase 3 is underway, per the original brief's explicit instruction not to
  invent apps prematurely.

## For AI agents picking up this project

1. Read this file fully.
2. Skim `AGENTS.md` for coding conventions.
3. Check the "Current phase" section above to know what's already built.
4. If you're about to build something in Phase 3+, check
   `krishnaos-coding-prompt.md`'s phase breakdown for what that phase is
   actually scoped to include — don't scope-creep into later phases.
5. After building something, update the relevant `/docs` file(s) **and**
   this file's "Current phase" section, in the same session — don't leave
   this file stale for the next session to discover.
