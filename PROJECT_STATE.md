# Project State

Last updated: 2026-08-15

## Current Work

- Phase 7 shell polish is largely landed: theme switching, wallpaper variants, theme-aware icons, independently draggable widgets (six cards), and the responsive desktop/mobile shell are implemented.
- Recruiter Mode quick tiles now read `PROFILE_LINKS` from `content.ts` — GitHub is wired; Resume/LinkedIn await the final content pass.
- Phase/state docs are synced to the current code.

## Changes Made

- Verified the codebase against `context.md`, the kickoff prompt, and the living docs.
- Added a persisted theme store plus a root theme manager so KrishnaOS now supports `system`, `light`, and `dark` modes.
- Added theme-aware wallpaper assets and routed the boot, welcome, desktop, and recruiter surfaces through the new wallpaper component.
- Replaced text-only app markers with real theme-aware icons across the Dock, Spotlight, title bars, and mobile navigation.
- Added desktop/mobile status widgets: Clock, Weather, GitHub, Timeline, Featured Project, and Quick Note.
- Made each desktop widget independently draggable (whole-card drag surface), keyboard-nudgeable, and persisted via `useWidgetBoardStore`.
- Consolidated `FEATURED_PROJECTS` into `lib/content.ts` as the single filter export for Recruiter Mode and the Featured Project widget.
- Wired Recruiter Mode quick tiles through `PROFILE_LINKS` in `content.ts` with honest disabled states for empty URLs.
- Removed the unused `icon` field from `appRegistry.ts` (`AppGlyph` resolves from `id` directly).
- Fixed `WindowManager` mobile flex layout (`flex` class missing).
- Updated architecture, state, styling, shell, recruiter, and phase docs to match.

## Ongoing / Incomplete

- Final content pass is still open: placeholder copy in `apps/client/src/lib/content.ts`, empty `PROFILE_LINKS.resume` / `PROFILE_LINKS.linkedin`, and functional Welcome/tour-bar copy.
- Phase 7 follow-ups remain: full accessibility/keyboard audit, bundle-size pass, minimized-window tray, and manual mobile visual QA.

## Important Notes

- `useBootStore` uses `sessionStorage` for boot-skip memory, so repeat visits within a browser session get the compressed boot sequence.
- `useWindowStore` owns open/focus/z-index/minimize/resize state; minimized windows still have no tray or restore UI.
- `APP_REGISTRY` remains the single source of truth for the seven confirmed content apps, and Spotlight/Dock/WindowManager all read from it.
- `useWidgetBoardStore` is the sixth Zustand store — widget positions persist in `localStorage` (`krishnaos:widgetPositions`); Quick Note text persists separately (`krishnaos:quickNote`).
- Theme state is handled outside the mode/window stores so the shell can respond globally without widening unrelated subscriptions.
- `ContactApp` is wired to the Express `/api/contact` route and MongoDB; `/api/content` still exists as a placeholder surface.
- `RecruiterRoot` syncs the global mode store on direct route visits so `/recruiter` stays honest even when boot/welcome are bypassed.

## Next Step

- Final content pass: swap placeholder copy and fill `PROFILE_LINKS.resume` / `PROFILE_LINKS.linkedin` in `content.ts`.
- Then run a quick accessibility/performance review (bundle size, keyboard nav edge cases, mobile layout on a real device).
