# 0003 — sessionStorage (not localStorage) for boot-skip memory

**Date:** Phase 2 (boot sequence)
**Status:** Accepted

## Context

The UX flow doc's open questions (§8) explicitly flagged this as undecided:
*"Whether the boot sequence should have a 'memory' (skip on repeat visits)
tied to localStorage or session only."* The coding prompt (§6) recommended
`sessionStorage` with reasoning, but left it as a final call to make during
implementation.

## Decision

Use `sessionStorage`, not `localStorage`, to track whether the boot sequence
has already played.

## Reasoning

These two browser storage APIs differ in exactly one relevant way: `sessionStorage`
clears when the tab/browser closes; `localStorage` persists indefinitely
across sessions, days, weeks.

If we used `localStorage`: a visitor who watches the full boot sequence once,
then comes back to the site **three weeks later**, would never see the full
sequence again — they'd get the compressed fast-fade forever, because
`localStorage` still remembers their first visit. That directly undercuts the
sequence's purpose: it's a "wow, this feels like opening a Mac" moment
specifically meant to establish tone on arrival. A returning visitor weeks
later is, for all practical purposes, having a *fresh* first impression —
they've likely forgotten what the site even looks like.

`sessionStorage` gets this right: within one browsing session (e.g.
clicking "back to Welcome" from inside the OS, or navigating between
`/` and `/recruiter` and back), the boot sequence correctly doesn't replay
in full every time — but closing the tab and coming back later, even the
same day, is treated as a new session and gets the full experience again.

## Alternatives considered

- **`localStorage`:** rejected for the reasoning above — permanently
  suppresses the "wow" moment after the very first visit ever.
- **No memory at all (always play full sequence):** rejected because
  navigating *within* a session (e.g. Welcome → mode → back to Welcome)
  would force the visitor to sit through a 5-second sequence repeatedly in
  quick succession, which reads as punishing rather than premium.
- **A time-based expiry on localStorage** (e.g. "replay after 24 hours"):
  would achieve a similar outcome to `sessionStorage` but requires storing
  and checking a timestamp — more code, more edge cases (clock skew, what
  counts as "expired") — for no real benefit over the browser's own
  session boundary, which already captures "is this meaningfully a new
  visit" reasonably well.

## Implementation note

See `useBootStore.ts` — the read/write helpers (`hasSeenBootThisSession`,
`markBootSeen`) wrap `sessionStorage` calls in `try/catch`, because
`sessionStorage` can throw in some privacy-mode browser configurations. On
failure, the code fails open to "treat as first-time visitor" (full sequence
plays) rather than crashing — worse case is an unnecessary full boot replay,
never a broken app.
