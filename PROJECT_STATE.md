# Project State

Last updated: 2026-08-22

## Current Work

- Experience (Phase F) was rebuilt as a dashboard-style page (header card, real company link, badge row, tech-stack grid, vertical "My Journey" timeline, closing quote + traits) at Krishna's explicit request, again ahead of its documented roadmap position. The timeline is built generically over `EXPERIENCE_CONTENT` — it renders correctly with the current single real entry and will render any future entries Krishna adds himself with zero component changes. The reference's fabricated career history (3 additional roles) and unverifiable stats/percentage panels were explicitly declined rather than invented.
- Skills (Phase E) was rebuilt as a dashboard-style page (header, stat cards, eight grouped skill cards, closing quote) at Krishna's explicit request, ahead of its documented roadmap position (`KRISHNAOS_HANDS_ON_CONTEXT.md` lists it after Projects/Achievements). This is a deliberate, flagged reordering, not a silent scope change — Phase B (About) below is still genuinely mid-build underneath it.
- Phase B (About Me) is in an expanded scope, approved by Krishna: full visual redesign modeled on a reference screenshot (hero, icon-grid traits, journey pipeline, real command-driven terminal, richer closing section), built incrementally. Hero section and the terminal's command-table data layer are done; remaining pieces are queued.
- Phase A (window fullscreen mode) is complete — implemented hands-on by Krishna per `KRISHNAOS_HANDS_ON_CONTEXT.md`, reviewed and debugged with AI mentoring rather than AI-authored.
- Phase 7 shell polish is largely landed: theme switching, wallpaper variants, theme-aware icons, independently draggable widgets (six cards), and the responsive desktop/mobile shell are implemented.
- Recruiter Mode quick tiles now read `PROFILE_LINKS` from `content.ts` — GitHub is wired; Resume/LinkedIn await the final content pass.
- Phase/state docs are synced to the current code.

## Changes Made

- Rebuilt Experience (`ExperienceApp.tsx`) as a dashboard-style page: header card (real role/company/badges, company link sourced from `PROJECTS_CONTENT`), a computed "Tech Stack I Use" grid (de-duplicated union of every real project's stack, no fabricated libraries), a generic vertical "My Journey" timeline built over the full `EXPERIENCE_CONTENT` array (currently one real entry — Udhyog Saathi — but ready for more without UI changes), and a closing quote + trait cards. Deliberately did not include the reference's fabricated 3-role career history, percentage skill bars, or unverifiable "Impact" stats. Added `EXPERIENCE_PAGE_CONTENT` to `content.ts`; widened the Experience window default from 640×480 to 960×680 in `appRegistry.ts`. See `docs/08-content-apps.md`'s "Experience: dashboard-style redesign" section.

- Rebuilt Skills (`SkillsApp.tsx`) as a dashboard-style page: header (eyebrow/title/tagline/badges from new `SKILLS_PAGE_CONTENT`), a computed stat-card row (unique skill count, group count, project count — no hardcoded numbers), eight grouped skill-tag cards (six original groups plus confirmed-real `Developer Tools` and `Soft Skills`), and a closing quote card using Krishna's own wording. Added `DatabaseGlyph`/`WrenchGlyph`/`UsersGlyph`/`TerminalGlyph` to `os/icons.tsx`; widened the Skills window default from 560×420 to 920×640 in `appRegistry.ts`. See `docs/08-content-apps.md`'s "Skills: dashboard-style redesign" section.

- Built About Me's hero section (`HeroSection.tsx`): `AboutContent` gained `badges: AboutBadge[]`, `welcomeBadge: string`, `status: AboutStatus`, `photoUrl: string`. Two-column responsive layout, photo in a reused `glass-panel` frame, decorative status dot, floating status card built as a sibling (not a child) of the photo's `overflow-hidden` box so it isn't clipped while overlapping the frame's edge. A `--clor-os-accent` typo and a non-existent `--color-os-text-muted` reference were caught in review (CSS custom-property lookups fail silently, not as build/type errors). See `docs/08-content-apps.md`'s "About: expanded visual redesign — hero section."
- Built the terminal's command-table data layer (`TERMINAL_COMMANDS` in `content.ts`): a real, bounded set of commands (`whoami`, `skills`, `projects`, `help`, `clear`) whose `run()` functions read live from `ABOUT_CONTENT`/`SKILLS_CONTENT`/`FEATURED_PROJECTS` rather than duplicating content. Terminal UI component not yet built. See `docs/08-content-apps.md`'s "Terminal command table" section.
- Added Phase B (About Me) narrative content: `ABOUT_CONTENT` gained a typed `sections: AboutSection[]` (kinds `'story' | 'quote' | 'traits'`) alongside the existing `bio` field (kept untouched — `RecruiterRoot.tsx` reads `bio[0]` directly for its short recruiter-facing line). `AboutApp.tsx` renders all three kinds: accent-bordered italic pull-quotes, a wrapping pill row (reusing `RecruiterRoot.tsx`'s existing skill-tag recipe), and heading+paragraph story sections. Real content for `bio`, `journey`, `self-awareness`, and `ambition` was written by Krishna — an AI-drafted illustrative example was caught and rejected mid-session for being first-person narrative that wasn't actually his. See `docs/08-content-apps.md`'s "About: from a single bio field to a typed narrative" section.
- Added window fullscreen mode (Phase A): `isFullscreen`/`previousGeometry` on `OsWindow`, `toggleFullscreen` action in `useWindowStore.ts`, fullscreen-aware `<Rnd>` sizing with dragging/resizing disabled in `WindowManager.tsx`, shell-hiding (`MenuBar`/`StatusWidgets`/`Dock`/`Spotlight`) via a derived `hasFullscreenWindow` selector in `Desktop.tsx`, and disabled-while-fullscreen minimize button. See `docs/07-os-shell.md`'s "Fullscreen" section.
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

- Run `npm run typecheck && npm run build && npm run lint` to verify both the Skills and Experience redesigns (not yet run from this environment — both changes were made via filesystem tools, not a local dev session).
- Manually check the Skills and Experience windows at a few widths/breakpoints and in both themes, since neither new layout was visually verified in a browser this session.
- Resume About Me's expanded visual redesign where it left off: icon-grid trait questions (replacing the current pill row for `curiosity`), the multi-stage journey pipeline, the terminal UI component (input + history + keyboard handling, wired to the now-complete `TERMINAL_COMMANDS` table), and the closing-section redesign (pill tags + avatar) — each its own focused step, same reviewed hands-on process.
- Once the visual pieces exist: scroll-in stagger motion (Framer Motion `whileInView`, reduced-motion aware, matching `StatusWidgets`/`Dock`'s existing pattern).
- Confirm Phase A + Phase B with a green `npm run typecheck && npm run build && npm run lint` baseline (not yet run since any of these changes).
- Mobile/responsive pass for the About page comes after the desktop visual redesign is complete.
- After About Me: Phase C (Projects) per `KRISHNAOS_HANDS_ON_CONTEXT.md`'s roadmap.
- Final content pass remains open elsewhere: placeholder copy (`PROJECTS_CONTENT`, `EXPERIENCE_CONTENT`, etc.) and empty `PROFILE_LINKS.resume` / `PROFILE_LINKS.linkedin` in `content.ts`.
- Accessibility/performance review (bundle size, keyboard nav edge cases, mobile layout on a real device) still pending.
