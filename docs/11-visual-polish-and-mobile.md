# Visual Polish & Responsiveness (Phase 7, in progress)

**Status note:** like Phase 6, this was built directly by Krishna. This
file documents what's actually in the code, written after the fact.

This covers the first slice of Phase 7 (coding prompt item 16, "micro-
interactions audit... visual polish") — specifically the pieces addressing
the "doesn't feel like real macOS yet" gap: real icons, a real wallpaper,
light/dark theming, and desktop widgets. It also covers a deliberate
**deviation** from the original spec: real mobile responsiveness, where
the coding prompt originally called for a "best viewed on desktop" message
instead. See `docs/decisions/0004-real-mobile-responsiveness.md` for that
decision recorded in ADR form; this doc covers the implementation detail.

## Files involved

- `apps/client/src/os/icons.tsx` — hand-drawn SVG glyph set
- `apps/client/src/os/theme/Wallpaper.tsx`, `ThemeToggle.tsx`
- `apps/client/src/store/useThemeStore.ts`
- `apps/client/src/app/ThemeManager.tsx`
- `apps/client/src/os/widgets/StatusWidgets.tsx`
- `apps/client/src/store/useWidgetBoardStore.ts`
- `apps/client/src/lib/useMediaQuery.ts`
- `apps/client/public/wallpapers/krishnaos-{light,dark}.svg`
- Mobile-responsive variants added to `Dock.tsx`, `MenuBar.tsx`,
  `WindowManager.tsx`

## Real icons (`os/icons.tsx`)

Replaces the Phase 3 "single capital letter" Dock/Spotlight/window-titlebar
icon with hand-drawn stroke-based SVG glyphs — one per `AppId`
(`AboutGlyph`, `ProjectsGlyph`, etc.), plus a handful of chrome glyphs
(`HomeGlyph`, `SearchGlyph`, `ThemeGlyph`, `ClockGlyph`, `WeatherGlyph`,
`GithubGlyph`, `TimelineGlyph`). `AppGlyph({ appId })` is the lookup
component every consumer (`Dock`, `Spotlight`, `WindowManager`'s title bar)
actually imports — same pattern as `appRegistry.ts`: one source of truth,
consumers don't hardcode per-app switch statements of their own.

All glyphs are plain inline SVG using `currentColor` for stroke — no icon
library dependency added, consistent with the "every dependency earns its
place" principle (`context.md` hard constraint #3) and `docs/02-tech-stack.md`.

**Worth double-checking:** `appRegistry.ts` deliberately has **no** separate
`icon` field — `AppGlyph({ appId })` in `os/icons.tsx` resolves glyphs
directly from each entry's `id`. A redundant `icon: AppId` field that always
mirrored `id` was removed after the docs cross-check confirmed nothing read it.

## Theming: `useThemeStore` + `ThemeManager` + CSS `[data-os-theme]`

This is a **5th Zustand store**, added after `docs/03-state-management.md`
was written around "why four stores." The reasoning there still holds —
`useThemeStore` is yet another piece of state with its own lifetime
(persists across page loads, unlike the other four) and its own narrow set
of readers (`ThemeManager`, `ThemeToggle`, `Wallpaper`), so splitting it
out rather than folding it into `useModeStore` is consistent with the
existing pattern, not an exception to it.

**Why theme state needs a store at all, not just CSS `prefers-color-scheme`:**
Because `ThemeToggle` lets a visitor explicitly override system preference
(`'system' | 'light' | 'dark'`), and that choice needs to persist
(`localStorage`, key `krishnaos:themeMode`) and be readable from multiple
components (`Wallpaper` needs to know the resolved theme to pick the right
SVG asset; `MenuBar`/`RecruiterRoot` render the toggle itself).

**Two-part sync to avoid a flash of the wrong theme:**
1. `main.tsx` runs a synchronous read of `localStorage` *before* React
   even mounts, and sets `document.documentElement.dataset.osTheme`
   directly. This is the standard pattern for avoiding FOUC (flash of
   unstyled/wrong-theme content) — if this only happened inside a React
   `useEffect`, there'd be one visible frame of the default (dark) theme
   before the effect ran, even for a visitor with light saved.
2. `ThemeManager` (mounted once in `main.tsx`, outside `<App />`) then
   takes over reactively — it reads `useThemeStore` and keeps
   `data-os-theme` in sync any time the mode changes, including live
   updates if `themeMode === 'system'` and the OS-level preference changes
   mid-session (via a `matchMedia` change listener).

CSS itself (`index.css`) resolves theme purely through `[data-os-theme='light']`
/ `[data-os-theme='dark']` attribute selectors overriding the same
`@theme` token variables Phase 1 already established — no component ever
branches on theme directly; they all just read `var(--color-os-*)` as
before, and the attribute on `<html>` decides which value that resolves to.
This means every existing token-based component (from every prior phase)
got dark/light support "for free" without being touched.

## Wallpaper (`os/theme/Wallpaper.tsx`)

Replaces the Phase 2 gradient placeholder (`BootSequence`'s inline
`radial-gradient` `style` prop) with real authored SVG wallpaper assets
(`public/wallpapers/krishnaos-{light,dark}.svg`), theme-aware via
`useThemeStore`. One component, three call sites (`BootSequence`,
`Desktop`, `RecruiterRoot`), parameterized by a `variant` prop
(`'boot' | 'shell' | 'recruiter'`) that only adjusts blur strength and
overlay darkness per surface — not three separate implementations.

`isMobile`-aware blur reduction (`blurStrength = ... isMobile ? 10 : 18`)
is a real performance consideration, not cosmetic: `docs/07-os-shell.md`'s
Phase 3 polish note already flagged `backdrop-filter`/blur as GPU-expensive
on mid-tier hardware — mobile devices are the mid-tier-or-worse case that
note was written for.

## Widgets (`os/widgets/StatusWidgets.tsx`)

The UX flow doc §5 explicitly gates desktop widgets behind "used sparingly...
only if it earns its place," and names two candidate examples: a
"Now Playing"-style widget, or a live GitHub-activity widget. This
implementation builds the GitHub-activity one (plus Clock, Weather, a
"Timeline" widget showing phase-completion progress, a rotating **Featured
Project** card, and a **Quick Note** sticky) rather than Now Playing —
reasonable, since a portfolio has no music to play, and a contribution
graph is directly relevant to a frontend-engineer portfolio in a way a
Spotify widget wouldn't be. Featured Project reads `FEATURED_PROJECTS`
from `lib/content.ts` (same export Recruiter Mode uses); Quick Note
autosaves to `localStorage` and opts out of drag-start via
`data-widget-interactive` on its textarea.

**No new dependency was added for any of this** — Weather calls
`api.open-meteo.com` directly via `fetch` (no API key required, geolocation-
gated), and GitHub renders `github.com/<user>.png` (avatar) and
`github.com/users/<user>/contributions` (contribution graph image) as
plain `<img>` tags, not an API client. This holds the line on `context.md`
hard constraint #3 exactly the way `docs/02-tech-stack.md` intends —
neither integration justified a real dependency.

`GITHUB_USERNAME` is read from `import.meta.env.VITE_GITHUB_USERNAME`
(added to `.env.example`), falling back to a hardcoded default of
`'Error-Krishna'`. **Worth confirming directly** whether that fallback is
your actual GitHub handle or a placeholder that needs swapping before this
ships — it reads ambiguously either way and is worth being certain about
rather than assuming.

Weather requires geolocation permission; the widget degrades gracefully
through three explicit states (`'Location pending'` → `'Weather'` /
`'Weather unavailable'` / `'Location blocked'`) rather than showing a blank
or broken widget if permission is denied.

**Each widget is independently positioned and independently draggable —
not one shared board.** This wasn't the original implementation: the first
pass had a single `useWidgetBoardStore.position` shared by all four
widgets inside one draggable panel, so dragging any one of them dragged
all four together (Krishna flagged this directly — "I want all widgets to
move independently like an actual OS system, not as a bundle"). The fix
changed `useWidgetBoardStore`'s shape from one `position` to a
`positions: Record<WidgetId, WidgetPosition>` map, and split the single
`StatusWidgets` board component into a `DraggableWidget` wrapper that each
of the six widgets (`Clock`, `Weather`, `GitHub`, `Timeline`, `Featured
Project`, `Quick Note`) renders independently through — its own glass
card, its own drag surface, its own arrow-key nudging, its own
double-click-to-reset, its own `localStorage` entry. **The whole card is
the drag surface** (like macOS Stickies), not just a header handle —
interactive controls inside a widget (links, the Quick Note textarea,
Featured Project dot buttons) opt out via `isInteractiveTarget` /
`data-widget-interactive` so they still work normally. None of that state
is shared between widgets anymore; this is now structurally the same
relationship every window in `WindowManager` already has to
`useWindowStore` (many independent entries in one store, not one entry
that fans out to many UI elements) — see
`docs/03-state-management.md`'s `useWindowStore` section for why that
pattern was already the house style before widgets existed.

Default starting positions are laid out in two non-overlapping columns
along the right edge (`WIDGET_LAYOUT` in `useWidgetBoardStore.ts` is a
starting-position heuristic only, not a constraint enforced afterward),
but that's purely a starting arrangement — a visitor can drag any single
widget anywhere on screen and the others won't move. On mobile, widgets
still render as a plain scrollable stack with no drag affordance at all
(touch-dragging small cards around a phone screen isn't a meaningful
interaction, matching the reasoning already applied to `WindowManager` and
`Dock` below).

Featured Project auto-rotation pauses on hover and respects
`prefers-reduced-motion: reduce`.

The Timeline widget's progress dots are driven by a hardcoded
`index < 6` check against `DEVELOPMENT_MILESTONES`'s array position, not by
reading real phase-completion state from anywhere (e.g. `context.md`).
That's fine as a lightweight decorative widget, but worth knowing it's not
actually wired to truth — if the milestone list is ever reordered or a
phase's real status changes, this won't update itself.

## Mobile responsiveness — a deliberate deviation from the original spec

The coding prompt's Phase 7 item 19 originally called for: *"mobile isn't
in scope yet per the brief, but the desktop-only build should show a clean
'best viewed on desktop' state on small viewports rather than a broken
layout."*

**This was superseded, not followed** — see
`docs/decisions/0004-real-mobile-responsiveness.md` for the full reasoning.
`Dock`, `MenuBar`, `WindowManager`, and `StatusWidgets` all now branch on
`useIsMobile()` (`lib/useMediaQuery.ts`, a `max-width: 767px` match) and
render real, touch-appropriate alternate layouts instead of a "come back on
desktop" message:

- **`Dock`** → a horizontally-scrollable bottom bar with labeled icons,
  instead of the magnifying hover-dock (hover has no meaning on touch).
- **`MenuBar`** → stacks into two rows instead of one horizontal bar.
- **`WindowManager`** → windows become full-width stacked sheets (no
  `react-rnd` drag/resize — dragging a window on a phone screen isn't a
  meaningful interaction) instead of freely positioned/resized frames.
- **`StatusWidgets`** → stacks as a scrollable column instead of a
  fixed-position floating panel.

**Resolved (this session, reported directly by Krishna as "can't see the widgets"):**
The root cause wasn't the `flex` fix above — it was `StatusWidgets.tsx`'s own
desktop return, which gated visibility with `hidden md:block`:

```tsx
// before — visibility decided TWICE, by two different, misaligned rules
if (isMobile) {
  return <div className="... md:hidden">{widgets}</div>;
}
return <div className="... hidden ... md:block">{widgets}</div>;
```

`isMobile` (from `useMediaQuery.ts`, `max-width: 767px`) already decides
which branch renders — that's the actual, single source of truth for
mobile vs. desktop everywhere else in this codebase (`Dock.tsx`,
`MenuBar.tsx`, `WindowManager.tsx` all just branch on `isMobile` and
render different JSX, nothing more). `StatusWidgets` was the one place
that *also* layered Tailwind's `md:` responsive classes on top of that
same decision. Two problems followed from that redundancy: it did nothing
useful (the `isMobile` branch already decided which JSX tree exists at
all), and worse, Tailwind's `md` breakpoint (768px) and `useIsMobile`'s
threshold (767px) are two independently-defined, not-quite-matching
numbers — at any viewport width where the two disagreed, or if a browser's
reported width and CSS media-query evaluation timing ever diverged even
briefly, the desktop return path's `hidden` could apply with `md:block`
never kicking in, and the widgets rendered but were invisible.

Fixed by deleting `md:hidden`/`hidden ... md:block` entirely — `isMobile`
alone now decides visibility, matching every other responsive component in
the project.

## What's still open in Phase 7

- No bundle-size pass yet (the 510KB warning flagged back in Phase 3 is
  still open — `react-rnd` + `gsap` + `framer-motion` combined).
- No accessibility/keyboard-navigation audit yet (coding prompt item 18).
- No minimized-window tray/indicator (Phase 3's deferred item).
- Final copy pass (Welcome panel, tour-bar labels, `content.ts`,
  `PROFILE_LINKS` resume/LinkedIn URLs) is still outstanding — unrelated
  to this visual work, tracked since Phase 2/4.
- **`RecruiterRoot`'s Resume/LinkedIn quick tiles still need real URLs**
  in `PROFILE_LINKS` during the final content pass. GitHub is wired via
  `PROFILE_LINKS.github`; tiles without a URL show an honest
  "Link pending final content pass" label instead of faking a dead link.
- `GITHUB_USERNAME`'s fallback value (`'Error-Krishna'`, matching
  `.env.example`) should be confirmed as your real handle before shipping
  (see above).
