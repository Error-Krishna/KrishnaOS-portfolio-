# Visual Polish & Responsiveness (Phase 7, in progress)

**Status note:** like Phase 6, this was built directly by Krishna. This
file documents what's actually in the code, written after the fact.

This covers the first slice of Phase 7 (coding prompt item 16, "micro-
interactions audit... visual polish") — specifically the pieces addressing
the "doesn't feel like real macOS yet" gap: real icons, a real wallpaper,
light/dark theming, and desktop widgets. It also covers a deliberate
**deviation** from the original spec: real mobile responsiveness, where
the coding prompt originally called for a "best viewed on desktop" message
instead.

## Files involved

- `apps/client/src/os/icons.tsx` — hand-drawn SVG glyph set
- `apps/client/src/os/theme/Wallpaper.tsx`, `ThemeToggle.tsx`
- `apps/client/src/store/useThemeStore.ts`
- `apps/client/src/app/ThemeManager.tsx`
- `apps/client/src/os/widgets/StatusWidgets.tsx`
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
implementation builds the GitHub-activity one (plus Clock, Weather, and a
"Timeline" widget showing phase-completion progress) rather than Now
Playing — reasonable, since a portfolio has no music to play, and a
contribution graph is directly relevant to a frontend-engineer portfolio
in a way a Spotify widget wouldn't be.

**No new dependency was added for any of this** — Weather calls
`api.open-meteo.com` directly via `fetch` (no API key required, geolocation-
gated), and GitHub renders `github.com/<user>.png` (avatar) and
`github.com/users/<user>/contributions` (contribution graph image) as
plain `<img>` tags, not an API client. This holds the line on `context.md`
hard constraint #3 exactly the way `docs/02-tech-stack.md` intends —
neither integration justified a real dependency.

`GITHUB_USERNAME` is read from `import.meta.env.VITE_GITHUB_USERNAME`
(added to `.env.example`), falling back to a hardcoded default — same
`VITE_`-prefixed env pattern already established for `VITE_API_BASE_URL`
in `apiClient.ts`.

Weather requires geolocation permission; the widget degrades gracefully
through three explicit states (`'Location pending'` → `'Weather'` /
`'Weather unavailable'` / `'Location blocked'`) rather than showing a blank
or broken widget if permission is denied.

## Mobile responsiveness — a deliberate deviation from the original spec

The coding prompt's Phase 7 item 19 originally called for: *"mobile isn't
in scope yet per the brief, but the desktop-only build should show a clean
'best viewed on desktop' state on small viewports rather than a broken
layout."*

**This was superseded, not followed.** `Dock`, `MenuBar`, `WindowManager`,
and `StatusWidgets` all now branch on `useIsMobile()`
(`lib/useMediaQuery.ts`, a `max-width: 767px` match) and render real,
touch-appropriate alternate layouts instead of a "come back on desktop"
message:

- **`Dock`** → a horizontally-scrollable bottom bar with labeled icons,
  instead of the magnifying hover-dock (hover has no meaning on touch).
- **`MenuBar`** → stacks into two rows instead of one horizontal bar.
- **`WindowManager`** → windows become full-width stacked sheets (no
  `react-rnd` drag/resize — dragging a window on a phone screen isn't a
  meaningful interaction) instead of freely positioned/resized frames.
- **`StatusWidgets`** → stacks as a scrollable column instead of a
  fixed-position floating panel.

**Why this is noted as a deviation rather than quietly treated as always-
the-plan:** the original reasoning for *not* doing mobile ("mobile isn't in
scope yet") was a legitimate scope-control decision at the time, and this
doc exists so a future reader (or Krishna, in an interview) can explain
*why* the build now differs from the written plan, rather than the docs
silently going stale. The technical decision itself is sound — a portfolio
meant to demonstrate engineering skill arguably loses more by being
desktop-only in 2026 than it saves in scope — but it's a real scope change
worth being able to name explicitly, not just a phase being "done."

## What's still open in Phase 7

- No bundle-size pass yet (the 510KB warning flagged back in Phase 3 is
  still open — `react-rnd` + `gsap` + `framer-motion` combined).
- No accessibility/keyboard-navigation audit yet (coding prompt item 18).
- No minimized-window tray/indicator (Phase 3's deferred item).
- Final copy pass (Welcome panel, tour-bar labels, `content.ts`) is still
  outstanding — unrelated to this visual work, tracked since Phase 2/4.
