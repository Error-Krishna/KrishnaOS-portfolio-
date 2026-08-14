# Project State

Last updated: 2026-08-14

## Current Work

- Phase 6 recruiter-mode implementation landed; phase/state docs are being synced.

## Changes Made

- Verified the codebase against `context.md`, the kickoff prompt, and the living docs.
- Replaced the Recruiter Mode placeholder with a real single-screen glass view in `apps/client/src/recruiter/RecruiterRoot.tsx`.
- Wired Recruiter Mode to consume shared content directly, including `Project.featured` filtering for the condensed case-study column.
- Updated `OsRoot` so `mode === 'recruiter'` renders the real recruiter view instead of the old placeholder.
- Updated the phase docs and project context to reflect the new recruiter-mode state.

## Ongoing / Incomplete

- Phase 7 is not started: polish, accessibility, performance, and responsive fallback work remain.
- Final content pass is still open: the portfolio copy in `apps/client/src/lib/content.ts` is intentionally placeholder content.
- Final voice/copy decisions are still open for the Welcome panel and tour-bar labels.
- Recruiter Mode still uses placeholder content text and link targets by design pending the final content pass.

## Important Notes

- `useBootStore` uses `sessionStorage` for boot-skip memory, so repeat visits within a browser session get the compressed boot sequence.
- `useWindowStore` owns open/focus/z-index/minimize/resize state; minimized windows still have no tray or restore UI.
- `APP_REGISTRY` remains the single source of truth for the seven confirmed content apps, and Spotlight/Dock/WindowManager all read from it.
- `ContactApp` is wired to the Express `/api/contact` route and MongoDB; `/api/content` still exists as a placeholder surface.
- `RecruiterRoot` syncs the global mode store on direct route visits so `/recruiter` stays honest even when boot/welcome are bypassed.
- There is an unrelated modified file in the working tree: `AGENTS.md`. I did not change it.

## Next Step

- Start Phase 7 with polish and responsive fallback work, starting from the recruiter-mode layout and the rest of the OS shell.
