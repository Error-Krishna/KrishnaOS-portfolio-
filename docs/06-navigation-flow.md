# Navigation Flow

This doc explains how `OsRoot` orchestrates the full experience, and how it
maps to the UX flow doc's rules. Read `krishnaos-ux-flow.md` (the original
design doc) alongside this — this doc explains the *implementation* of rules
defined there.

## The state machine, as implemented

`OsRoot` (`apps/client/src/app/OsRoot.tsx`) reads two stores and renders one
of four things:

```tsx
{!isBootComplete && <BootSequence key="boot" onComplete={completeBoot} />}

{isBootComplete && mode === 'welcome' && <WelcomeScreen />}

{isBootComplete && mode !== 'welcome' && <ModePlaceholder mode={mode} />}
```

This directly implements the UX doc's §1 flow diagram:

```
[Entry] → Boot Sequence → Liquid Glass Welcome → { Tour | Free | Recruiter }
```

`AnimatePresence mode="wait"` (Framer Motion) wraps all three branches — this
means when the condition switches (e.g. boot completes), the outgoing
element finishes its exit animation *before* the incoming element starts
mounting, rather than both cross-fading simultaneously. `mode="wait"` was
chosen specifically over the default (`mode="sync"`, which layers old and
new on top of each other) because boot → Welcome is meant to be **one
continuous handoff** (see `05-boot-sequence.md`'s note on the glass panel
handoff), not two elements briefly overlapping.

## Why `ModePlaceholder` exists, and why it's honest about being fake

```tsx
function ModePlaceholder({ mode }: { mode: string }) {
  return (
    <div className="glass-panel ...">
      <p>{mode} mode</p>
      <p>Not built yet — arriving in a later phase.</p>
      <button onClick={() => setMode('welcome')}>← Back to Welcome</button>
    </div>
  );
}
```

Tour, Free Exploration, and Recruiter Mode don't have real implementations
yet (that's Phase 3/5/6). Rather than leave `OsRoot` broken until those
phases are built, or fake a finished-looking screen that isn't actually
functional, `ModePlaceholder` is a deliberately honest stand-in — it tells
you which mode you're in and that it's not built, and gives you a way back.

**Why this matters beyond just "it looks nicer than a crash":** it means the
boot → welcome → mode-selection wiring is *actually testable right now*,
today, with real user interaction, rather than only testable once every
later phase is finished. You can click "Take a Tour," see the app correctly
register `mode === 'tour'`, and click back to Welcome — proving the state
machine itself is correct, independent of whether Tour's real content
exists yet. When Phase 5 builds the real Tour experience, `ModePlaceholder`'s
`mode === 'tour'` branch gets replaced with the real component; nothing about
`OsRoot`'s orchestration logic needs to change.

## Mapping UX doc §7 (cross-mode navigation rules) to code

The UX doc lists five navigation rules. Here's where each currently lives,
and what's still pending:

| Rule | Status | Where |
|---|---|---|
| 1. No mode is a dead end | **Partially implemented** | `ModePlaceholder`'s "Back to Welcome" button satisfies this today. Real per-mode escape hatches (e.g. Recruiter Mode's "Curious? Explore further" link) are Phase 6. |
| 2. No progress is silently lost | **Store-level guarantee in place** | `useTourStore.skipTour()` never touches `useWindowStore` — see `03-state-management.md`. Not yet exercised by real UI since Tour/Free aren't built. |
| 3. Recruiter Mode always one action away | **Not yet implemented** | Requires the persistent menu-bar control from Phase 3. Currently Recruiter Mode is only reachable from Welcome or `ModePlaceholder`'s generic back button. |
| 4. Search is a universal escape valve | **Not yet implemented** | Spotlight doesn't exist yet (Phase 3). `lib/searchIndex.ts` has the Fuse.js index ready to be wired up. |
| 5. Returning to Welcome is always possible | **Implemented** (generically) | `ModePlaceholder`'s back button. Will be superseded by the "KrishnaOS wordmark in menu bar = home" pattern the UX doc specifies, once the menu bar exists. |

This table is meant to be updated as each phase lands — it's a live checklist
of "is the navigation contract from the UX doc actually holding," not a
one-time note.

## The Recruiter Mode exception: routing bypasses the state machine

Per UX doc §3: *"→ Recruiter Mode: panel cross-fades directly into the
Recruiter Mode layout (does not require passing through the full desktop
first)."*

This is why `/recruiter` exists as a **separate React Router route**
(`apps/client/src/recruiter/RecruiterRoot.tsx`), not just a `mode` value
reached only via `OsRoot`'s internal state:

```tsx
// apps/client/src/app/App.tsx
<Routes>
  <Route path="/" element={<OsRoot />} />
  <Route path="/recruiter" element={<RecruiterRoot />} />
</Routes>
```

A visitor arriving directly at `yoursite.com/recruiter` (e.g. from a link a
recruiter received) never touches `OsRoot`, never sees the boot sequence,
never passes through Welcome — `RecruiterRoot` renders immediately. This
satisfies both of the UX doc's Recruiter Mode requirements simultaneously:
"one action away from Welcome" (when reached via the in-app button, which
will call `setMode('recruiter')` and route to `/recruiter`) *and*
"directly linkable" (when reached via a bookmarked/shared URL).

**Current gap:** clicking "Recruiter Mode" from `WelcomeScreen` today calls
`setMode('recruiter')`, which renders `ModePlaceholder` *inside* `OsRoot` —
it does not yet navigate to the `/recruiter` route. Wiring that button to
actually `navigate('/recruiter')` (via React Router) instead of just setting
mode is Phase 6 work, once `RecruiterRoot` has real content worth navigating
to.

## Why the boot sequence isn't skippable via routing

Notice `/recruiter` bypasses boot entirely, but there's no equivalent
`/tour` or `/free` route that would bypass boot for those modes. This is
intentional, matching the UX doc precisely: Recruiter Mode is the *one*
explicitly-designed fast path that's allowed to skip the full experience
("the highest-intent, lowest-time-budget visitor... sees their fast path").
Tour and Free Exploration are meant to be reached *through* the full
Boot → Welcome flow — they're the "experience the whole thing" paths, and
short-circuiting them via a direct URL would undermine the reason they
exist as separate from Recruiter Mode in the first place.

## What Phase 3 will add here

Once the menu bar exists, `OsRoot`'s orchestration will need to change in
one specific way: **the menu bar needs to render persistently across Tour,
Free, and Recruiter modes** (it's system-level chrome, not mode-specific
content) — so the shape will likely evolve from "one of four things renders"
to "menu bar always renders when boot is complete, plus mode-specific
content below it." That's a meaningful structural change worth flagging now
so it's not a surprise later — `ModePlaceholder`'s simple full-screen glass
panel will need to become mode content that sits *underneath* persistent
chrome, not content that fills the whole screen by itself.
