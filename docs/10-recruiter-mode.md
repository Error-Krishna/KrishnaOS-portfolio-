# Recruiter Mode (Phase 6)

**Status note:** this phase was built directly by Krishna, not scaffolded
through this doc first. This file was written after the fact by reading
`recruiter/RecruiterRoot.tsx` — it documents what's actually there, not a
plan that was executed.

## Files involved

- `apps/client/src/recruiter/RecruiterRoot.tsx` — the single-screen route
- `apps/client/src/app/App.tsx` — routes `/recruiter` directly to it

## Matches the UX doc's brief closely

Per UX flow doc §6, Recruiter Mode is meant to be a single, scroll-minimal
glass "document" view — same design tokens as the rest of KrishnaOS, but
resume-shaped rather than desktop-shaped. `RecruiterRoot` delivers exactly
that: name/headline/bio up top, then Skills / Experience / Education /
Achievements / Projects / Contact as glass-panel sections in a responsive
grid, all visible without needing the desktop metaphor at all.

**Reads from the same content source as the real apps** — `lib/content.ts`
— rather than duplicating data. `FEATURED_PROJECTS = PROJECTS_CONTENT.filter(p
=> p.featured)` is exactly the mechanism the coding prompt §5 called out in
advance: *"this is exactly how Recruiter Mode's '2–4 featured projects'
filters from the same data source as the full Projects app."* `Project.featured`
sat unread since Phase 4 specifically for this.

## The escape hatch, both ways

UX doc §6 describes Recruiter Mode as "an escape hatch, not a cage" —
`RecruiterRoot` gives visitors two different ways out, matching two
different intents:

- **"Open the full desktop" / "Explore freely"** → `setMode('free')` +
  `navigate('/')`. A recruiter who wants to see the whole OS metaphor.
- **"Open contact window"** → `openWindow('contact')` **then**
  `setMode('free')` + `navigate('/')`. A recruiter who specifically wants
  to reach out — this pre-opens the real `ContactApp` window (the same one
  from Phase 4, wired to the real `/api/contact` endpoint) so they land
  directly on the form instead of an empty desktop.

Both paths reuse the real `useWindowStore`/`useModeStore` — Recruiter Mode
never had its own contact form; it just gives fast access into the desktop
apps that already exist.

## Mode sync on direct visits

```tsx
useEffect(() => {
  setMode('recruiter');
}, [setMode]);
```

Because `/recruiter` is directly linkable (bypassing Boot + Welcome
entirely, per the coding prompt §6's open question — resolved as "yes" by
this implementation), a visitor can land here with `useModeStore.mode`
still at its default `'welcome'`. This effect keeps the store honest for
any other component that reads `mode` (e.g. if `MenuBar` were ever
rendered here) without gating the route behind boot/welcome first.

## Deviations worth knowing about

- No `ModePlaceholder` fallback for Recruiter Mode remains anywhere —
  `OsRoot.tsx` renders `<RecruiterRoot key={mode} />` directly for
  `mode === 'recruiter'`.
- `RecruiterRoot` includes a `<ThemeToggle />` (Phase 7 territory,
  see `docs/11-theme-and-polish.md`) even though Phase 6 wasn't scoped to
  include it — reasonable since Recruiter Mode is a fully standalone route
  that doesn't inherit `MenuBar`'s toggle, and a recruiter opening a shared
  link with no dark/light control at all would be a worse experience than
  a slightly early Phase 7 dependency.
