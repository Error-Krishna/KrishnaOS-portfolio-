# State Management

## Why four stores instead of one

`apps/client/src/store/` has four separate Zustand stores:

- `useBootStore` — has the boot sequence finished?
- `useModeStore` — which top-level mode is active (welcome/tour/free/recruiter)?
- `useWindowStore` — which windows are open, where, in what order?
- `useTourStore` — is the guided tour active, and on which step?

A natural question: why not one `useAppStore` with everything in it?

**Because these four things change at completely different rates and are read
by completely different parts of the app**, and Zustand's whole performance
model depends on components subscribing to narrow slices. If everything lived
in one store, a component that only cares about `mode` would still risk
re-rendering when `openWindows` changes (unless you're very careful with
selectors everywhere, all the time). Four stores means the *boundary itself*
protects you — a component importing `useWindowStore` structurally cannot be
affected by a boot-sequence state change, because it's not even looking at
that store.

There's also a conceptual reason: these four things really are different
kinds of state with different lifetimes:

| Store | Lifetime | Changes on... |
|---|---|---|
| `useBootStore` | Once per page load | Boot sequence completing |
| `useModeStore` | Once per "session" until user switches | User picking Tour/Free/Recruiter, or returning to Welcome |
| `useWindowStore` | Continuously, once in Free/Tour mode | Every window open/close/drag/resize/focus |
| `useTourStore` | Only relevant during a guided tour | Every tour step advance |

Splitting along those lifetime boundaries makes each store's job obvious from
its name and its file.

## `useBootStore`

```ts
// apps/client/src/store/useBootStore.ts
{
  isBootComplete: boolean;
  isReturningThisSession: boolean;
  completeBoot: () => void;
}
```

**`isBootComplete`** gates whether `OsRoot` renders `<BootSequence />` or
moves on to Welcome/mode content. It starts `false` on every page load —
this is in-memory React state (via Zustand), not persisted, so a hard reload
always starts from "boot not complete" as far as this flag is concerned.

**`isReturningThisSession`** is different — it's read *once*, at store
creation time, from `sessionStorage`:

```ts
isReturningThisSession: hasSeenBootThisSession(),
```

This is the mechanism behind the UX doc's skip logic: "returning visitors
(same session) get a compressed boot." `sessionStorage` (not `localStorage`)
was a deliberate choice — see `decisions/0003-sessionstorage-for-boot-skip.md`.
The short version: `localStorage` persists across browser sessions (days
later, still remembers), which would mean a visitor who comes back next week
never sees the full "wow" boot sequence again. `sessionStorage` clears when
the tab/browser closes, so the full sequence plays again on a genuinely new
visit, but repeated in-session navigation (e.g. clicking "back to Welcome"
and re-entering) doesn't replay the whole thing.

**Why this flag lives in a *store* and not just a `useState` inside
`BootSequence`:** `useBootTimeline` (the hook that builds the GSAP timeline)
also needs to read `isReturningThisSession` to decide which timeline variant
to build — full 6-beat sequence, or compressed fast-fade. Putting it in a
shared store avoids prop-drilling that flag from `BootSequence` down into
the timeline hook.

## `useModeStore`

```ts
// apps/client/src/store/useModeStore.ts
{
  mode: OsMode;  // 'welcome' | 'tour' | 'free' | 'recruiter'
  setMode: (mode: OsMode) => void;
}
```

The simplest store — deliberately. `OsMode` is defined in
`packages/shared-types` (not just client-local) because it's a plausible
candidate for the server to eventually reason about too (e.g. different
Open Graph meta tags per mode for link previews). See
`packages/shared-types/src/os-mode.ts`.

Note there's **no `'boot'` value** in `OsMode`. Boot is tracked separately in
`useBootStore` because, conceptually, boot isn't one of the OS's *modes* —
it's a *pre-mode* loading phase that happens before the OS "exists" yet.
Modeling it as a fifth `OsMode` value would have made every switch statement
over `OsMode` need to handle a "boot" case that's structurally different
from the other four (the other four are all valid states the user chose;
boot is not a choice, it's a phase).

**Cross-mode navigation rules are NOT enforced by this store.** The UX flow
doc (§7) has rules like "no mode is a dead end" and "Recruiter Mode is
always one action away" — those are navigational *policies*, not data. They
belong in the components that call `setMode()` (e.g. a persistent menu-bar
control, built in Phase 3), not baked into the store itself. The store's job
is just to hold and update the current mode; deciding *when* it's
appropriate to switch modes is a UI/UX concern that lives closer to the UI.

## `useWindowStore`

```ts
// apps/client/src/store/useWindowStore.ts
{
  openWindows: OsWindow[];
  focusedWindowId: string | null;
  openWindow, closeWindow, focusWindow, minimizeWindow, moveWindow, resizeWindow
}
```

This is the most involved store, and it's the "own the window-state
architecture yourself" piece the coding prompt called out explicitly (see
`02-tech-stack.md`'s react-rnd section). Each `OsWindow` tracks:

```ts
{
  id: string;           // stable id, e.g. "about", "projects" — matches the app it hosts
  position: { x, y };
  size: { width, height };
  zIndex: number;
  isMinimized: boolean;
}
```

**z-index management** uses a module-level counter (`zIndexCounter`) that
increments every time a window opens *or* gets focused. This is the standard
"bring to front" pattern — rather than re-sorting an array or reassigning
every window's z-index on every focus change, each window just remembers the
highest z-index value it was ever given, and a newly-focused window always
gets a value higher than anything before it. Simple, and correct as long as
the counter never resets mid-session (it doesn't — it's module scope, not
component state, so it survives re-renders).

**`openWindow` is idempotent** — calling it on an already-open window just
focuses that window instead of creating a duplicate. This matters because
the same "open Projects" action might get triggered from the Dock, from
Spotlight search, *and* from the guided tour — all three should converge on
"there's one Projects window, now focused," not spawn three windows.

**Minimize vs. close** are different actions on purpose: `closeWindow`
removes the window from `openWindows` entirely; `minimizeWindow` keeps it in
the array (`isMinimized: true`) but clears focus. This distinction exists
because a minimized window's *position and size are preserved* — reopening
it (via `focusWindow`, which also clears `isMinimized`) should restore it
where the user left it, not reset to defaults.

## `useTourStore`

```ts
// apps/client/src/store/useTourStore.ts
{
  isActive: boolean;
  stepIndex: number;
  startTour, nextStep, previousStep, skipTour
}

export const TOUR_STEPS = ['about', 'work', 'projects', 'skills',
  'experience', 'education', 'achievements', 'contact'] as const;
```

`TOUR_STEPS` is exported as a `const` array (not just typed as `string[]`)
specifically so `TourStepId` can be derived from it:

```ts
export type TourStepId = (typeof TOUR_STEPS)[number];
```

This means the 8 step names are defined **once**, and the type system
enforces that any code referencing a tour step uses one of those exact 8
strings — you can't typo `'experiance'` and have it silently compile.

**`skipTour` deliberately does NOT touch `useWindowStore`.** Per UX doc §7
rule 2 ("no progress is silently lost"), skipping the tour should drop the
visitor into Free Exploration with whatever window the tour had open still
open — not reset the desktop. Keeping `useTourStore` and `useWindowStore`
independent (rather than tour logic reaching into window state to "clean up"
on skip) is what makes that UX guarantee automatic rather than something
that has to be remembered and hand-coded at every exit point.

**As of Phase 5, this store is fully wired** — `TourController`
(`tour/TourController.tsx`) reads `stepIndex`/`isActive` and calls
`nextStep`/`previousStep`/`skipTour`, driving `useWindowStore.openWindow`
per step. See `docs/09-guided-tour.md` for the full breakdown.

## How the stores compose in `OsRoot`

```tsx
// apps/client/src/app/OsRoot.tsx (simplified)
const isBootComplete = useBootStore((s) => s.isBootComplete);
const mode = useModeStore((s) => s.mode);

// renders BootSequence, or WelcomeScreen, or the active mode,
// based on reading from two different stores
```

Note each store is read with a **selector** —
`useBootStore((s) => s.isBootComplete)`, not `useBootStore()` — which is
what makes `OsRoot` only re-render when `isBootComplete` specifically
changes, not on every field in every store. This selector pattern is used
everywhere stores are read in this codebase; it's the main reason Zustand
was chosen over plain Context (see `02-tech-stack.md`).
