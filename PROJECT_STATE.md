# Project State

Last updated: 2026-08-14

## Current Work

- Phase 7 shell polish landed: theme switching, wallpaper variants, theme-aware icons, widgets, and the responsive desktop/mobile shell are implemented.
- Phase/state docs are being synced to reflect the new shell behavior and remaining content work.

## Changes Made

- Verified the codebase against `context.md`, the kickoff prompt, and the living docs.
- Added a persisted theme store plus a root theme manager so KrishnaOS now supports `system`, `light`, and `dark` modes.
- Added theme-aware wallpaper assets and routed the boot, welcome, desktop, and recruiter surfaces through the new wallpaper component.
- Replaced text-only app markers with real theme-aware icons across the Dock, Spotlight, title bars, and mobile navigation.
- Added desktop/mobile status widgets for time, weather, GitHub activity, and a career timeline.
- Updated the shell so the desktop remains macOS-like while mobile gets an iOS-inspired navigation and window treatment.
- Kept all portfolio content placeholders intact for the final content pass, per the final decisions.
- Updated the architecture, state, styling, shell, and phase docs to match the new Phase 7 implementation.

## Ongoing / Incomplete

- Final content pass is still open: the portfolio copy in `apps/client/src/lib/content.ts` is intentionally placeholder content.
- Welcome/tour copy remains functional by design until the final content pass.
- The remaining Phase 7 follow-up is polish and profiling: accessibility edge cases, reduced-motion verification, and mobile/performance tuning should still be checked.
- Recruiter Mode still uses placeholder content text and link targets by design pending the final content pass.

## Important Notes

- `useBootStore` uses `sessionStorage` for boot-skip memory, so repeat visits within a browser session get the compressed boot sequence.
- `useWindowStore` owns open/focus/z-index/minimize/resize state; minimized windows still have no tray or restore UI.
- `APP_REGISTRY` remains the single source of truth for the seven confirmed content apps, and Spotlight/Dock/WindowManager all read from it.
- Theme state is handled outside the mode/window stores so the shell can respond globally without widening unrelated subscriptions.
- `ContactApp` is wired to the Express `/api/contact` route and MongoDB; `/api/content` still exists as a placeholder surface.
- `RecruiterRoot` syncs the global mode store on direct route visits so `/recruiter` stays honest even when boot/welcome are bypassed.
- There is an unrelated modified file in the working tree: `AGENTS.md`. I did not change it.

## Next Step

- Tackle the final content pass, then do a quick accessibility/performance review of the new theme-aware shell and mobile navigation.
