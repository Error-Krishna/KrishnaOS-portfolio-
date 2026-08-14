# Phase 7 Polish

## Files involved

- `apps/client/src/app/ThemeManager.tsx` — applies Light/Dark/System to the
  document root
- `apps/client/src/store/useThemeStore.ts` — persists the theme choice
- `apps/client/src/os/theme/Wallpaper.tsx` — theme-aware wallpaper layer
- `apps/client/src/os/theme/ThemeToggle.tsx` — theme switcher used in the
  shell and Recruiter Mode
- `apps/client/src/os/icons.tsx` — theme-aware app/icon glyphs
- `apps/client/src/os/widgets/StatusWidgets.tsx` — time, weather, GitHub,
  and development timeline widgets
- `apps/client/src/os/menu-bar/MenuBar.tsx` — desktop/mobile system chrome
- `apps/client/src/os/dock/Dock.tsx` — desktop dock and mobile tab-style nav
- `apps/client/src/os/window-manager/WindowManager.tsx` — desktop windows
  and mobile stacked sheets
- `apps/client/src/boot/BootSequence.tsx` — boot wallpaper handoff
- `apps/client/src/recruiter/RecruiterRoot.tsx` — recruiter surface styling

## What changed in this phase

Phase 7 is the polish pass that makes KrishnaOS feel like a real desktop on
larger screens and a native mobile experience on small screens.

The main additions are:

- Light / Dark / System theme support
- authored wallpaper variants for light and dark themes
- proper app glyphs instead of text-only dock markers
- desktop widgets for time, weather, GitHub activity, and a development
  timeline
- a responsive shell that becomes mobile-first rather than a shrunk desktop
- reduced-motion support and lighter blur on mobile

## Theme behavior

Theme choice lives in `useThemeStore`. `ThemeManager` applies the resolved
theme to the root element with `data-os-theme`, and the CSS token layer in
`index.css` swaps the glass/surface/text colors between light and dark.

The wallpaper, dock, navbar, widgets, recruiter surface, and windows all
inherit those tokens, so changing the theme updates the whole experience
without each component needing its own theme logic.

## Wallpaper

The wallpaper is now an authored SVG asset instead of a flat gradient. There
are separate light and dark variants under `apps/client/public/wallpapers/`,
and the shell chooses between them automatically.

Boot, Welcome, the desktop shell, and Recruiter Mode all share the same
wallpaper system so the transition between states stays visually cohesive.

## Widgets

The desktop widget stack surfaces useful glanceable data:

- current time and date
- local weather via Open-Meteo when geolocation is allowed
- a real GitHub contribution graph for the configured GitHub username
- a development timeline that reflects the current KrishnaOS phase arc

This keeps the shell feeling alive without inventing fake system apps.

## Mobile shell

On mobile, the OS shell changes shape instead of just shrinking:

- the menu bar becomes a compact status/header area
- the dock becomes a horizontal, tab-like bottom navigation bar
- windows become stacked, touch-friendly sheets
- widgets appear in a vertical, glanceable feed

That keeps the experience closer to iOS than to a reduced desktop.

## Remaining polish work

The major implementation decisions are now settled. The remaining work in
Phase 7 is mainly quality-focused:

- keyboard navigation and focus order auditing
- contrast and touch-target verification
- motion-reduction validation
- performance tuning for blur-heavy surfaces on weaker devices
- final content pass for copy and real link targets
