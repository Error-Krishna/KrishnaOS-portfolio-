# The Boot Sequence

## Files involved

- `apps/client/src/boot/useBootTimeline.ts` — the GSAP timeline itself
- `apps/client/src/boot/BootSequence.tsx` — the component that renders the
  visual elements and wires the timeline to them
- `apps/client/src/store/useBootStore.ts` — tracks completion + returning-visitor state

## The goal (from the UX flow doc)

> Establish "I just opened a Mac" instantly, build anticipation, never
> overstay its welcome. 4–6 seconds total.

This is a **filmic, authored** animation — every beat has a specific
duration and a specific reason for that duration — which is why it's built
with GSAP's timeline API rather than Framer Motion (see `02-tech-stack.md`
for that distinction).

## The 6 beats, and why each one is timed the way it is

```
1. Black screen        0.4s   — silent breath, mirrors a real boot's blank moment
2. Logo fades/scales in 1.2s   — the "I just opened a Mac" moment
3. Progress pulses      1.5s   — reads as "loading" without a fake percentage
4. Logo fades out       0.8s   — the hinge: black → world
5. Wallpaper reveals    0.6s   — blurred, never sharp, before Welcome exists
6. Glass panel arrives  0.5s   — hands off directly into Welcome
```

Total: ~5s for a first-time visitor, matching the UX doc's 4–6s target.

**Beat 1 (black screen, 0.4s):** Deliberately does *nothing* visually. Real
macOS boot has a moment of pure black before any branding appears — this beat
exists purely to mirror that expectation. If this beat were skipped, the logo
would feel like it "pops" in too immediately, breaking the mental model
we're deliberately invoking.

**Beat 2 (logo, 1.2s):** The longest single beat on purpose — this is the
one moment where the visitor's attention is 100% on the brand mark, no
competing motion. `ease: 'power2.out'` (fast start, slow settle) rather than
a linear fade, because a linear fade reads as mechanical; power2.out reads
as the logo "arriving" and gently settling, which is calmer.

**Beat 3 (progress pulse, 1.5s):** This is a **breathing** pulse
(`autoAlpha` oscillating between 1 and 0.4, `yoyo: true, repeat: 1`), not a
progress bar filling left-to-right. The UX doc explicitly calls out "avoid
fake progress percentages" — a bar that fills to 100% implies it's tracking
real load progress, which would be a lie (nothing is actually loading; this
is a fixed-duration animation). A pulse communicates "something is
happening" without claiming to measure anything real.

**Beat 4 (logo fades out, 0.8s):** Uses `ease: 'power2.in'` (slow start, fast
exit) — the mirror image of beat 2's easing. This isn't accidental symmetry:
power2.out (beat 2) feels like arrival, power2.in (beat 4) feels like
departure. Using the inverse curve for the exit is a small detail that makes
the whole sequence feel considered rather than just "fade in, fade out" with
identical easing both ways.

**Beat 5 (wallpaper reveal, 0.6s):** The wallpaper starts at `blur(40px)`
and *stays blurred* — this beat only animates its opacity in, never its
blur. The UX doc is explicit: "we never show a sharp desktop before
Welcome." The blur exists so the visitor senses "there's a world behind this
glass" without that world competing for attention before they've made a
choice.

**Beat 6 (glass panel, 0.5s):** `ease: 'power2.out'`, scale from `0.96` to
`1`, **no bounce or overshoot**. The UX doc is explicit about this too: "no
bounce/overshoot — restrained, not playful." A bouncy spring here would
undercut the "premium, calm, confident" tone the Welcome screen is going for
— overshoot animations read as playful/casual, which is the wrong register
for what's meant to feel like a considered, high-end product.

## Overlapping timing (`'-=0.9'`, `'-=0.3'`, etc.)

GSAP timeline positions like `.to(el, {...}, '-=0.9')` mean "start this
tween 0.9 seconds before the previous tween in the chain would have
finished" — i.e., overlap them. This is used deliberately at several
transitions (progress fading in while the logo is still settling; the
wallpaper starting to reveal slightly before the logo has fully faded) so
beats **blend into each other** rather than having hard stop/start seams.
A sequence built entirely from back-to-back, non-overlapping tweens tends to
feel like a slideshow; overlapping the starts of adjacent beats is what
makes it read as one continuous motion instead of six separate clips.

## The returning-visitor compressed variant

```ts
if (isReturningThisSession) {
  // skip straight to wallpaper reveal + glass panel, ~1s total
}
```

Read from `useBootStore.isReturningThisSession`, itself read from
`sessionStorage` (see `03-state-management.md` and
`decisions/0003-sessionstorage-for-boot-skip.md` for the reasoning on
`sessionStorage` vs `localStorage`). If the visitor has already completed
boot once this browser session, the full 6-beat sequence is skipped
entirely — the timeline jumps straight to the wallpaper-reveal-then-glass-
panel beats, compressed to about 1 second total, with `ease: 'back.out(1.2)'`
on the glass panel (a *slight* overshoot here, unlike the first-time
sequence) to make the fast-return feel snappy rather than rushed.

**Why this exists:** the UX doc is explicit that repeat navigation within a
session (e.g. clicking "back to Welcome" from inside the OS) shouldn't force
the visitor to sit through the full sequence again — "this avoids punishing
engaged visitors who navigate back."

## The "Skip" affordance

```ts
const SKIP_AFFORDANCE_DELAY_MS = 1500;
```

A "Skip" button appears **after 1.5 seconds**, not immediately. This is
deliberate: showing it from frame one would visually compete with the boot
sequence's own opening beats and undercut the "I just opened a Mac" moment
before it's even had a chance to land. Appearing after the first beat or two
have played means it's there for anyone who's impatient, without being the
first thing every visitor sees.

Clicking Skip calls `gsap.killTweensOf(...)` on all the animated elements
(stopping any in-flight tween immediately, mid-animation) and then calls the
same `finish()` function the timeline's natural `onComplete` would call —
so skipping and naturally finishing converge on identical app state
afterward. There's no special "skipped" state to track separately.

## How completion hands off to Welcome

```ts
const finish = () => {
  if (hasFinishedRef.current) return;  // guards against double-calling
  hasFinishedRef.current = true;
  completeBoot();   // updates useBootStore
  onComplete();      // notifies the parent (OsRoot)
};
```

The `hasFinishedRef` guard exists because `finish` can be triggered two
different ways — the GSAP timeline's own `onComplete` callback, *or* the
user clicking Skip mid-animation. Both paths call `finish()`; the ref
ensures whichever happens first "wins" and the second call (if it somehow
still fires) is a no-op, so `completeBoot()` never double-fires.

Once `completeBoot()` runs, `useBootStore.isBootComplete` flips to `true`,
which is what `OsRoot` is watching (see `06-navigation-flow.md`) to swap
from rendering `<BootSequence />` to rendering `<WelcomeScreen />`.

## Known limitation, honestly noted

`BootSequence.tsx` currently renders its own inline "Welcome panel arrives
here" placeholder text inside the glass panel at beat 6 — this is a visual
stand-in. The *real* `WelcomeScreen` component renders separately, right
after boot completes, in the same screen position. This works visually right
now, but if the boot sequence's glass panel and the real Welcome panel ever
diverge in size/position, the handoff between them could look like a jump
cut instead of a seamless continuation. Worth revisiting once real Welcome
content (exact copy, sizing) is finalized — see
`decisions/` if this gets formally addressed later.
