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

## Current phase: Phase 7 in progress (polish pass)

Per `krishnaos-coding-prompt.md`'s phase breakdown:

- ✅ **Phase 1 (Foundation)** — complete. Monorepo scaffolding, design token
  system, routing skeleton, `useModeStore`/`useWindowStore` skeletons,
  Express server with health/contact/content routes. (`useTourStore` and
  `useThemeStore` were added later, in Phases 5 and 7 respectively —
  `useWidgetBoardStore` joined in Phase 7 alongside the widget stack — six
  Zustand stores total as of now, not four.)
- ✅ **Phase 2 (Boot & Welcome)** — functionally complete.
  - GSAP boot sequence (`boot/BootSequence.tsx`, `boot/useBootTimeline.ts`)
    — full 6-beat timeline + compressed returning-visitor variant + Skip
    affordance, all implemented and matching the UX doc's spec.
  - Liquid Glass Welcome screen (`welcome/WelcomeScreen.tsx`) — three
    equal-weight entry buttons + skip-intro affordance.
  - `OsRoot` orchestrates boot → welcome → mode via `AnimatePresence`.
  - ⬜ Not yet done: exact final copy for Welcome panel (currently
    placeholder text), any visual QA/polish pass, SF Pro vs Inter licensing
    decision (currently defaulting to Inter in the font stack).
- ✅ **Phase 3 (OS Shell)** — complete. See `docs/07-os-shell.md` for full
  detail.
  - ✅ `os/appRegistry.ts` — single source of truth for the 7 confirmed app
    pillars, read by Dock/Spotlight/WindowManager/search index.
  - ✅ Menu bar (`os/menu-bar/MenuBar.tsx`) — KrishnaOS-wordmark-as-home +
    persistent "Switch to Recruiter Mode" control.
  - ✅ Dock (`os/dock/Dock.tsx`) — icon row, hover magnification, open/focus
    indicators, opens windows via `useWindowStore`.
  - ✅ Window Manager (`os/window-manager/WindowManager.tsx`) —
    draggable/resizable/closable/minimizable windows via react-rnd +
    `useWindowStore`, cascade positioning for newly-opened windows.
  - ✅ Spotlight (`os/spotlight/Spotlight.tsx`) — ⌘K/Ctrl+K global shortcut,
    Fuse.js fuzzy search over the app registry, arrow-key navigation.
  - ✅ `Desktop.tsx` composes all four into Free Exploration's environment;
    `OsRoot` now renders it for `mode === 'free'`.
  - ✅ `WelcomeScreen`'s Recruiter Mode button now calls `setMode('recruiter')`
    **and** `navigate('/recruiter')`, matching `MenuBar`'s
    `switchToRecruiterMode` exactly — both entry points into Recruiter Mode
    behave identically. This closes the gap previously tracked here (see
    `docs/06-navigation-flow.md`, updated same session).
  - ✅ **Window fullscreen (green traffic light), added hands-on post-Phase-3:**
    `OsWindow` gained `isFullscreen`/`previousGeometry`; `toggleFullscreen`
    captures a window's current position/size before entering fullscreen and
    restores it on exit. `WindowManager.tsx`'s `<Rnd>` renders at 100%/100%
    with dragging/resizing disabled while fullscreen (guards against a stray
    drag corrupting the geometry that's about to be restored). `Desktop.tsx`
    hides MenuBar/StatusWidgets/Dock/Spotlight while any window is
    fullscreen, matching real macOS. Minimize is disabled (real `disabled`
    attribute, grayed out) while fullscreen, closing a bug where minimizing
    a fullscreen window left it flagged fullscreen with nothing visible to
    show for it. See `docs/07-os-shell.md`'s "Fullscreen" section for the
    full mechanism.
  - ⬜ Not yet done: minimized-window tray/indicator (matches the coding
    prompt's explicit Phase 3 scope note — "don't over-scope"). Bundle size
    warning at build time (510KB) from react-rnd + gsap + framer-motion
    combined — not yet addressed, candidate for the Phase 7 polish/perf pass.
- ✅ **Phase 4 (Content Apps)** — complete. See `docs/08-content-apps.md`
  for full detail.
  - ✅ `lib/content.ts` — hardcoded, typed content data for all 7 apps
    (`ABOUT_CONTENT`, `PROJECTS_CONTENT`, `SKILLS_CONTENT`,
    `EXPERIENCE_CONTENT`, `EDUCATION_CONTENT`, `ACHIEVEMENTS_CONTENT`) —
    all placeholder copy, clearly marked as such, pending the content pass
    noted in both source docs' open questions.
  - ✅ All 7 content apps built: `AboutApp`, `ProjectsApp`, `SkillsApp`,
    `ExperienceApp`, `EducationApp`, `AchievementsApp`, `ContactApp` — each
    a pure render of its content slice, tokens-only, no owned scroll (the
    window content region already provides it).
  - ✅ `ContactApp` is real, not a placeholder — wired to `submitContactForm`
    (`lib/apiClient.ts`) → Express `/api/contact` → MongoDB, hand-rolled
    validation mirroring `contactController.ts`, idle/submitting/success/error
    states.
  - ✅ `Desktop.tsx`'s `renderAppContent` now returns real components instead
    of `renderPlaceholderAppContent` — confirmed `WindowManager.tsx` itself
    needed zero changes, exactly as `docs/07-os-shell.md` predicted.
  - ⬜ Not yet done: real content (every string in `content.ts` is an
    explicit placeholder), any `/api/content` wiring (content stays
    hardcoded client-side per the server route's own comment).
- ✅ **Phase 5 (Guided Tour)** — complete. See `docs/09-guided-tour.md` for
  full detail.
  - ✅ `tour/tourSteps.ts` — maps the 8 UX-doc tour steps to `AppId`s
    ("work" intentionally maps to `null` — no 8th app invented for a
    framing-only step) plus human-readable step labels.
  - ✅ `tour/TourController.tsx` — drives `useWindowStore.openWindow` per
    step, renders the real `<Desktop />` alongside itself (not a
    restricted tour environment), cleanly disambiguates "skipped" vs
    "completed naturally" without adding new store state.
  - ✅ `tour/TourBar.tsx` — persistent, top-adjacent progress bar with
    Back/Next/Skip, plus a completion state offering "Explore Freely" /
    "Back to Welcome."
  - ✅ `OsRoot.tsx` updated: `mode === 'tour'` now renders `<Desktop />` +
    `<TourController />`, and `mode === 'recruiter'` now renders the real
    `<RecruiterRoot />` instead of a placeholder.
  - ⬜ Not yet done: nothing scoped to Phase 5 remains. Real tour-bar copy
    (labels are functional, not final voice) is still an open question
    carried from the UX doc's §8.
- ✅ **Phase 6 (Recruiter Mode)** — functionally complete. The direct-linkable
  `/recruiter` route renders the real condensed glass document view, filters
  featured projects from the shared project data, and includes two escape
  hatches back to Free Exploration. Quick tiles read `PROFILE_LINKS` from
  `lib/content.ts` — GitHub is wired; Resume/LinkedIn URLs are still empty
  placeholders pending the final content pass (tiles without a URL show an
  honest disabled state, not fake links).
- 🔶 **Phase 7 (Polish pass)** — in progress. Theme switching, wallpaper
  variants, app icons, widgets, and mobile-friendly shell/navigation are now
  implemented (see `docs/11-visual-polish-and-mobile.md` and
  `docs/decisions/0004-real-mobile-responsiveness.md` for the deliberate
  mobile-support deviation from the original spec); accessibility/
  performance tuning and final content remain.
  - ✅ **Fixed this session:** widgets previously shared one
    `useWidgetBoardStore.position` inside a single draggable board, so
    dragging any one widget moved all four together. Krishna flagged this
    directly. `useWidgetBoardStore` now keys positions per widget
    (`positions: Record<WidgetId, WidgetPosition>`), and `StatusWidgets.tsx`
    renders each widget through its own `DraggableWidget` — independent
    drag (whole-card surface, not just a header handle), independent
    keyboard nudging, independent reset, independent `localStorage` entry.
    Two additional widgets landed: **Featured Project** (reads
    `FEATURED_PROJECTS` from `content.ts`, auto-rotates with reduced-motion
    respect) and **Quick Note** (local sticky, autosaves to `localStorage`).
    See `docs/11-visual-polish-and-mobile.md`'s Widgets section.
  - ✅ **Fixed this session:** `WindowManager`'s mobile container was
    missing the base `flex` display class (had `flex-1`/`flex-col` with
    nothing activating them). Added `flex`. Still worth a manual visual
    check on a real/emulated mobile viewport to confirm the stacked-sheet
    layout actually looks right now.
  - ✅ **Fixed this session (previous pass):** Recruiter Mode quick tiles now
    read `PROFILE_LINKS` from `content.ts`. GitHub is a real external link;
    Resume/LinkedIn stay honestly disabled until URLs are filled in during
    the final content pass.
  - ✅ **Fixed this session (previous pass):** removed the redundant `icon: AppId`
    field from `appRegistry.ts` — `AppGlyph` already resolves icons from `id`
    directly, and nothing read the duplicate field.
  - ✅ **Fixed this session:** Krishna reported "can't see the widgets." Root
    cause was `StatusWidgets.tsx`'s desktop return using `hidden md:block`
    to gate visibility — redundant with (and not perfectly aligned to)
    `useIsMobile()`'s own `max-width: 767px` check, which already decided
    which branch rendered. Tailwind's `md` breakpoint is 768px, one pixel
    off from `useIsMobile`'s 767px threshold; at the boundary (or if a
    browser's reported width/media-query evaluation ever diverged even
    briefly) the desktop widgets could render but stay `display: none`.
    Fixed by removing `md:hidden`/`hidden ... md:block` entirely —
    `isMobile` alone now controls visibility, matching `Dock.tsx`,
    `MenuBar.tsx`, and `WindowManager.tsx`, which never had this redundancy.
    See `docs/11-visual-polish-and-mobile.md`'s Mobile Responsiveness
    section for the full writeup.
  - ⬜ Still open: `PROFILE_LINKS.resume` / `PROFILE_LINKS.linkedin` and
    all placeholder copy in `content.ts` (except `ABOUT_CONTENT`, see below)
    await the final content pass. `GITHUB_USERNAME`'s fallback
    (`'Error-Krishna'`, matching `.env.example`) should be confirmed as
    your real handle before shipping. Accessibility/perf audit and
    bundle-size pass remain Phase 7 follow-ups.

Phase 3 is functionally complete against its scoped items in the coding
prompt. Remaining Phase 3 items (minimized-window tray, bundle-size pass)
are explicitly deferred to Phase 7 per the coding prompt's own scope notes,
not gaps to close now.

## Hands-on phases (per `KRISHNAOS_HANDS_ON_CONTEXT.md`, built by Krishna, AI as reviewer)

- ✅ **Phase A — Window Fullscreen Mode.** See Phase 3's entry above and
  `docs/07-os-shell.md`'s "Fullscreen" section.
- 🔶 **Phase B — About Me.** In progress. See
  `docs/08-content-apps.md`'s "About: from a single bio field to a typed
  narrative" section for full detail.
  - ✅ `ABOUT_CONTENT` grew a typed `sections: AboutSection[]` (kinds:
    `'story' | 'quote' | 'traits'`), additive alongside the existing
    `bio` field — `bio` stays untouched because `RecruiterRoot.tsx` reads
    `bio[0]` directly and needs a short recruiter-facing line, a different
    job than the narrative sections.
  - ✅ `AboutApp.tsx` renders all three `kind`s: quotes as accent-bordered
    pull-quotes, traits as a pill row (reusing `RecruiterRoot.tsx`'s
    existing skill-tag recipe), story sections as heading + paragraphs.
  - ✅ Real content written by Krishna for `bio` and all three story
    sections (`journey`, `self-awareness`, `ambition`) — no invented
    personal narrative; empty-`body`/TODO placeholders were used and kept
    honest until the real words existed.
  - ⬜ Not yet done: scroll-in motion (stagger-fade, reduced-motion aware,
    matching `StatusWidgets`/`Dock`'s existing pattern), a fuller visual
    treatment beyond plain text blocks (explicitly the next step), and
    mobile/responsive verification for this screen (deferred — desktop
    first, per explicit scope decision this session).

## Hard constraints — do not violate these without explicit discussion

1. **Don't fake finished UI for unbuilt phases.** If a phase isn't built,
   say so in the UI — don't build a convincing-looking screen with no real
   functionality behind it. The old `ModePlaceholder` pattern was used for
   that during the build-up, but it is no longer part of the runtime flow.
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
cd "/Users/krishnagoyal/Desktop/krishnaos"
npm install
npm run build -w packages/shared-types   # must run before first dev/build
npm run dev                               # client :5173, server :4000
```

Server runs fine without `MONGODB_URI` set (logs a warning, DB-dependent
routes degrade gracefully). See `apps/server/.env.example` and
`apps/client/.env.example` for required env vars.

## Open questions still unresolved

From `krishnaos-coding-prompt.md` §6 and the UX doc §8:

- **Exact Welcome panel / tour-bar copy** — currently placeholder/functional
  text, not final voice/copy.
- **Final content pass** — the portfolio copy in `apps/client/src/lib/content.ts`
  is still intentionally placeholder content. `PROFILE_LINKS.resume` and
  `PROFILE_LINKS.linkedin` are still empty strings — Recruiter Mode shows
  those tiles as honestly disabled until real URLs land in the same file.
- **Final voice/copy decisions** — the Welcome panel and tour-bar labels are
  still functional copy, not final voice.
- **Confirm GitHub handle** — `VITE_GITHUB_USERNAME` / the `'Error-Krishna'`
  fallback should be verified as your real handle before shipping.

## Note on documentation hygiene (read if starting a fresh session)

`docs/` has now been cross-checked file-by-file against the actual code
twice: once after Phase 6/7 were built directly by Krishna outside a
docs-first flow, and again this session after the widget-independence fix.
Three stale/duplicate Phase 7 docs existed at one point
(`11-phase-7-polish.md`, `11-theme-and-polish.md`,
`11-visual-polish-and-mobile.md`) from multiple sessions covering the same
slice — `docs/11-visual-polish-and-mobile.md` is the canonical one; both
`11-phase-7-polish.md` and `11-theme-and-polish.md` are now redirect stubs
only, carrying no content of their own. If you're an AI agent and notice a
doc that seems to contradict the code, **verify against the actual source
file before trusting either** — this project has had real drift before,
and catching it early is exactly what this documentation system is for.

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
