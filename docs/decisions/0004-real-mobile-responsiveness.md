# 0004 — Real mobile responsiveness instead of a "desktop only" message

**Date:** Phase 7 (visual polish pass)
**Status:** Accepted — supersedes the original spec

## Context

`krishnaos-coding-prompt.md`'s Phase 7 item 19 explicitly scoped mobile out:

> "Responsive fallback messaging (mobile isn't in scope yet per the brief,
> but the desktop-only build should show a clean 'best viewed on desktop'
> state on small viewports rather than a broken layout)."

That was a reasonable call at the time — a desktop-window-manager metaphor
(drag, resize, multiple floating windows) doesn't obviously translate to a
touch screen, and scoping it out kept Phases 1–6 focused.

## Decision

Build real, touch-appropriate mobile layouts instead of a "come back on
desktop" message. `Dock`, `MenuBar`, `WindowManager`, and `StatusWidgets`
all branch on `useIsMobile()` (`max-width: 767px`) and render alternate,
purpose-built layouts rather than a fallback screen.

## Reasoning

A portfolio site meant to demonstrate frontend engineering skill arguably
loses more by being desktop-only in 2026 (a meaningful share of any
recruiter or hiring manager's first click on a shared link will be on a
phone) than it saves in scope by skipping mobile. The "best viewed on
desktop" message was the right call when it was written, given the
project's priorities at the time (get the desktop-OS metaphor right
first); by Phase 7, with the desktop experience solid, the cost/benefit
flipped.

This is being formally logged as a decision — not just a phase quietly
doing more than planned — because it's a real, deliberate deviation from a
previously-written spec, and the project's whole documentation discipline
exists specifically to make that kind of change explainable later rather
than silently drifting.

## What actually changed, concretely

Rather than one generic "not on mobile" fallback, each piece of chrome got
its own touch-appropriate reinterpretation instead of a shrunk desktop:

- **Dock** → horizontally-scrollable bottom bar with labeled icons (hover
  magnification has no meaning on a touch screen, so it's dropped entirely
  rather than kept as dead code).
- **Menu Bar** → stacks into two rows instead of fighting for space in one
  horizontal bar.
- **Window Manager** → windows become full-width stacked sheets, not
  freely-positioned/resized frames — `react-rnd` drag/resize is skipped
  entirely on mobile (dragging a window on a phone isn't a meaningful
  interaction), not just visually disabled.
- **Status Widgets** → a scrollable vertical feed instead of a
  fixed-position floating panel.

## Alternatives considered

- **Ship the original "best viewed on desktop" message as planned:**
  rejected per the reasoning above — the cost of being desktop-only now
  outweighs the scope savings.
- **A single generic responsive breakpoint that just shrinks/reflows the
  desktop layout, without rethinking each component:** rejected — a
  shrunk desktop UI (tiny draggable windows, a hover-dependent Dock) would
  be technically "responsive" but not actually usable on a touch device.
  Each surface needed its own touch-appropriate interaction model, not
  just a smaller version of the mouse-driven one.

## See also

`docs/11-visual-polish-and-mobile.md` for the full implementation detail —
this record exists to make the *decision itself* discoverable and dated,
not to duplicate that doc's walkthrough.
