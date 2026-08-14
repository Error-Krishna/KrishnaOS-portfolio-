# Content Apps (Phase 4)

## Files involved

- `apps/client/src/lib/content.ts` — single source of hardcoded content data
- `apps/client/src/apps/about/AboutApp.tsx`
- `apps/client/src/apps/projects/ProjectsApp.tsx`
- `apps/client/src/apps/skills/SkillsApp.tsx`
- `apps/client/src/apps/experience/ExperienceApp.tsx`
- `apps/client/src/apps/education/EducationApp.tsx`
- `apps/client/src/apps/achievements/AchievementsApp.tsx`
- `apps/client/src/apps/contact/ContactApp.tsx`
- `apps/client/src/os/desktop/Desktop.tsx` — wires the above into the window manager

## Where content data lives, and why

`apps/server/src/routes/content.ts` already said the plan out loud before
Phase 4 existed: *"content can stay hardcoded client-side"* until/unless it
moves into a real MongoDB-backed API. Phase 4 takes that at face value —
`lib/content.ts` exports typed constants (`PROJECTS_CONTENT`,
`EXPERIENCE_CONTENT`, `EDUCATION_CONTENT`, `ACHIEVEMENTS_CONTENT`,
`ABOUT_CONTENT`, `SKILLS_CONTENT`), each app component imports the slice it
needs and renders it. No fetch, no loading state, no `/api/content` calls
yet — that's the deferred "real backend flex" the route comment describes,
not something Phase 4 needed to build to satisfy the coding prompt's scope.

**Every value in `content.ts` is placeholder copy, clearly marked as such**
in the file's own header comment. This mirrors the project's existing
"don't fake finished UI" principle (`context.md` hard constraint #1),
extended to content: rather than inventing a fabricated job history or
fake achievements that read as real, every entry is an obvious stand-in
("Company Name", "Add your real bio here") that's honest about needing a
real content pass — which was already an open question in both source docs
before this phase started, not a new gap introduced here.

## Why `SkillGroup` lives in `content.ts`, not `shared-types`

The coding prompt's §5 data model explicitly lists `Project`, `Experience`,
`EducationEntry`, `Achievement`, and `ContactPayload` as the shared shapes —
no `Skill` type. Per `docs/01-architecture.md`'s placement test ("does the
server ever need to know about this shape?"), skills never touch the
server or a route, so `SkillGroup` is defined locally in `content.ts`
rather than added to `packages/shared-types`.

## Each app component is a pure render of its content slice

Every component in `apps/*` follows the same shape: import a constant from
`content.ts`, `.map()` over it, render tokens-only markup. None of them own
scroll behavior or outer padding — `WindowManager`'s content region
(`flex-1 overflow-auto p-os-4`) already provides both, per
`docs/04-styling-system.md`'s "the OS shell owns scroll regions" rule. An
app component that added its own `overflow-auto` or top-level padding would
be fighting the window chrome, not cooperating with it.

`ProjectsApp` renders every project in `PROJECTS_CONTENT`, not just
`featured: true` ones — the full catalog belongs here. `Project.featured`
exists specifically so Recruiter Mode (Phase 6) can filter the *same* data
down to a condensed highlight list without duplicating content, per the
coding prompt §5's explicit note: *"this is exactly how Recruiter Mode's
'2–4 featured projects' filters from the same data source as the full
Projects app."* Phase 4 doesn't consume `featured` at all — it's there for
Phase 6 to read later. Recruiter Mode now does read it: the
`RecruiterRoot` screen filters `PROJECTS_CONTENT` down to
`project.featured === true` before rendering its compact project column.

## `Desktop.tsx`: the one file that changed to go from placeholder to real

`docs/07-os-shell.md` called this out in advance: *"only this one function
in `Desktop.tsx` needs to change... `WindowManager` itself doesn't need to
be touched at all."* That held. `renderPlaceholderAppContent` (an honest
"not built yet" stand-in) became `renderAppContent`, a `switch` over
`AppId` returning the matching real component. Nothing in
`WindowManager.tsx`, `useWindowStore.ts`, `Dock.tsx`, or `Spotlight.tsx`
changed — they only ever dealt with `AppId` and a `renderAppContent`
function prop, never with what's inside a window.

The `switch` has no `default` case. Because `AppId` is an exhaustive
string-literal union (`os/appRegistry.ts`), TypeScript strict mode already
guarantees every case is handled at compile time — adding a `default`
would just mask a real error (a forgotten new app) as a silent fallback
instead of a type error. This is the same reasoning `docs/07-os-shell.md`
gives for `AppId` being a union instead of `string` in the first place.

## Contact: the real backend-flex moment

`ContactApp.tsx` is the one Phase 4 component that isn't a pure content
render — it's a real form, wired to `submitContactForm` in
`lib/apiClient.ts`, which `POST`s to the Express `/api/contact` route and
persists to MongoDB via `contactController.ts` (see `docs/01-architecture.md`).

**Validation is hand-rolled and intentionally mirrors the server's, rather
than being shared:**

```ts
// ContactApp.tsx (client)                    // contactController.ts (server)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

Per `AGENTS.md`'s backend conventions ("validate input by hand... don't
reach for a validation library for a route this simple"), there's no
shared validation function to import — validation logic isn't a *shape*
`shared-types` is for, it's behavior. Client-side validation exists purely
so a visitor gets instant feedback on an empty field without a round trip;
the server independently re-validates everything and remains the actual
source of truth. If this pair of regexes ever drifts, that's a real bug
worth fixing, but it's a UX optimization duplicating a check, not a
security boundary being duplicated insecurely — the server never trusts
the client's validation.

**Status states (`idle` → `submitting` → `success` | `error`)** are plain
`useState`, not a new Zustand store — this is transient, single-component
UI state with no other component needing to read it, which is exactly the
line `docs/03-state-management.md` draws between "goes in Zustand" and
"stays local." A submitted-successfully state clears the form and offers
"Send another message"; an error state surfaces the server's own
`ApiResponse` error message (or the client-side validation message)
inline, without losing what the visitor typed.

## What Phase 4 deliberately didn't touch

- **No Guided Tour wiring.** The tour driving these same windows open/closed
  per step is Phase 5 — `useTourStore` isn't referenced anywhere in `apps/*`.
- **No Recruiter Mode consumption of this content.** `RecruiterRoot` now
  consumes the shared content slices directly and filters featured projects
  from `PROJECTS_CONTENT`; there is still no separate recruiter-only data
  source or `/api/content` fetch.
- **No `/api/content` fetches.** Content is hardcoded per the server route's
  own comment; wiring a real content API is future work, not a Phase 4 gap.
