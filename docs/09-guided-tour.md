# The Guided Tour (Phase 5)

## Files involved

- `apps/client/src/tour/tourSteps.ts` — step → `AppId` mapping + step labels
- `apps/client/src/tour/TourController.tsx` — drives the OS, owns the skip/completion logic
- `apps/client/src/tour/TourBar.tsx` — the visual bar (two render states)
- `apps/client/src/app/OsRoot.tsx` — wires `TourController` alongside `Desktop`

## The core idea: the tour doesn't get its own environment

Per UX flow doc §4: *"rather than a modal carousel, the tour drives the OS
itself."* `OsRoot` takes this literally — `mode === 'tour'` renders the
exact same `<Desktop />` component `mode === 'free'` does:

```tsx
{isBootComplete && (mode === 'free' || mode === 'tour') && (
  <motion.div key={mode} className="relative h-full w-full" ...>
    <Desktop />
    {mode === 'tour' && <TourController />}
  </motion.div>
)}
```

`TourController` is a sibling of `Desktop`, not a wrapper or a restricted
substitute for it. It never renders windows itself — it reads from and
writes to the same `useWindowStore` that the Dock, Spotlight, and a
visitor's own dragging all use. This is what makes the UX doc's "a curious
visitor can go off-script mid-tour by just interacting with the desktop;
the tour bar stays present but doesn't force them back on track" true
*by construction*: there's no special "tour mode" window manager to escape
from, just the one real desktop, with a `TourController` also poking at it.

## Mapping 8 tour steps onto 7 apps: the "work" gap

`useTourStore.TOUR_STEPS` (defined in Phase 1, per `docs/03-state-management.md`)
has 8 entries, matching the UX doc's 8-step sequence exactly: about, work,
projects, skills, experience, education, achievements, contact. But
`os/appRegistry.ts`'s `AppId` — the 7 confirmed content pillars — has no
"work" entry, because the UX doc describes that step as narrative framing
("what I do") rather than a distinct content pillar.

`tourSteps.ts`'s `TOUR_STEP_TO_APP` makes this gap explicit instead of
papering over it:

```ts
export const TOUR_STEP_TO_APP: Record<TourStepId, AppId | null> = {
  about: 'about',
  work: null,
  projects: 'projects',
  // ...
};
```

When `TourController` looks up `null` for the current step, it simply
doesn't call `openWindow` that render — the tour bar still advances and
its label still changes to "Work," but whatever window was already open
(realistically, About, from the previous step) stays open and focused.
This wasn't treated as a bug to work around by inventing an 8th "Work" app
— the coding prompt explicitly warns against expanding the app roster
without a real reason, and a window that would only ever show a single
framing sentence isn't one.

## Why `openWindow` being idempotent made this trivial

```ts
useEffect(() => {
  if (!isActive) return;
  const targetApp = TOUR_STEP_TO_APP[currentStepId];
  if (targetApp) openWindow(targetApp);
}, [isActive, currentStepId, openWindow]);
```

This effect re-runs on every step change and just calls `openWindow`
unconditionally when a step has a mapped app. It doesn't need to check
"is a window already open for a *different* app, should I close it?" —
per the UX doc, previous steps' windows are meant to stay open (a visitor
finishing the tour should see the desktop they were walked through, not a
single window that replaced the last one). `useWindowStore.openWindow`'s
existing idempotency (see `docs/03-state-management.md`) means re-opening
an already-open window is a no-op besides re-focusing it — exactly the
"open or focus" language the UX doc uses for tour steps.

## Skip vs. completion: solved without changing the store

The UX doc describes two different end states for the tour:
- **Skip** (any point): "drops the visitor into Free Exploration."
- **Completion** (finishing step 8): "tour bar offering 'Explore Freely'
  and 'Back to Welcome' — never a dead end."

Both end with `useTourStore.isActive` becoming `false` — `skipTour()` sets
it directly, and `nextStep()` sets it when advancing past the last step.
That's ambiguous from inside the store alone. Rather than adding a second
flag (e.g. `wasSkipped: boolean`) to disambiguate, `TourController` sidesteps
the problem entirely:

```ts
const handleSkip = () => {
  skipTour();
  setMode('free');   // ← this is the key move
};
```

`handleSkip` calls `setMode('free')` immediately. Since `TourController`
only renders while `mode === 'tour'` (see `OsRoot.tsx`), that `setMode`
call unmounts `TourController` on the very next render — there is no
render of this component with `isActive === false` that resulted from a
skip. So when `TourController` *does* render with `isActive === false`,
it can only mean one thing: `nextStep()` reached the end naturally, with
`mode` still `'tour'`. That's exactly when the completion `<TourBar
completed />` should show, and the component doesn't need to track *why*
`isActive` became false — the fact that it's still mounted already answers
that question.

## `TourBar`'s two states, and why it lives top-adjacent

`TourBar` takes a discriminated-union prop type (`completed?: false | true`)
matching `TourController`'s two possible renders — active-step controls, or
the completion offer. Positioned `top-9` (directly below `MenuBar`'s 36px
height) rather than bottom: the Dock already owns bottom-center screen
real estate (see `os/dock/Dock.tsx`), and the UX doc explicitly allows
either placement ("bottom or top-adjacent, not blocking content"). Top
avoids the two pieces of persistent chrome fighting for the same space.

## What Phase 5 deliberately didn't touch

- **No changes to `Desktop.tsx`, `WindowManager.tsx`, `Dock.tsx`, or
  `Spotlight.tsx`.** The tour reuses all of them unmodified — it only reads
  `useWindowStore`'s existing `openWindow` action, the same one every other
  entry point already called.
- **No changes to `useTourStore` itself.** `startTour`/`nextStep`/
  `previousStep`/`skipTour` were already correct from Phase 1; Phase 5 only
  added the component layer that calls them.
- **No Recruiter Mode involvement.** The tour and Recruiter Mode remain
  fully independent per UX doc §1 ("all three destinations are peers").
