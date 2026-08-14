# Recruiter Mode (Phase 6)

## Files involved

- `apps/client/src/recruiter/RecruiterRoot.tsx` — the single-screen glass view
- `apps/client/src/app/OsRoot.tsx` — switches to `RecruiterRoot` for the
  in-app `mode === 'recruiter'` path
- `apps/client/src/lib/content.ts` — shared content slices used to populate
  the recruiter layout
- `apps/client/src/os/appRegistry.ts` — the shared `AppId` set, still the
  source for opening the contact window from the escape hatch

## What Recruiter Mode is

Recruiter Mode is the direct-linkable, no-metaphor fast path described in the
UX flow doc: a single-screen glass "document" view that surfaces the most
important information without making the visitor learn the desktop metaphor
first.

The implementation follows the coding prompt's Phase 6 scope:

- name + frontend-engineer identity up top
- compact skills summary
- condensed experience timeline
- featured projects only, filtered from the same shared `PROJECTS_CONTENT`
  that the full Projects app uses
- education and selected achievements visible on the same screen
- resume / GitHub / LinkedIn / contact surfaced up front
- a low-emphasis escape hatch into Free Exploration

## Why it reads from the same content slices

Recruiter Mode does not maintain its own data source. It imports the same
client-side content constants that the windowed apps use, then presents a
compressed version of them. That keeps the screen honest and avoids a second
copy of the same information drifting out of sync.

The one special behavior is the featured-project filter:

```ts
const FEATURED_PROJECTS = PROJECTS_CONTENT.filter((project) => project.featured);
```

That `featured` flag already existed in the shared `Project` type so Recruiter
Mode could have a 2-4 project highlight list without inventing a separate data
model or duplicating project content.

## Route behavior

`/recruiter` is a real React Router route, not just another `OsMode` value.
That matters because the route must be shareable directly. A recruiter can
open the URL and land on the view immediately, without seeing Boot or Welcome.

To keep the global state honest on direct visits, `RecruiterRoot` syncs the
mode store on mount:

```ts
useEffect(() => {
  setMode('recruiter');
}, [setMode]);
```

The screen also provides two exits:

- `Open the full desktop` sets the mode to `free` and routes back to `/`
- `Open contact window` opens the `contact` window in the OS shell and then
  routes back to the desktop

## Why this is separate from the OS shell

Recruiter Mode is intentionally not another desktop variant. It is the one
screen that is allowed to skip the OS metaphor entirely when that helps the
visitor move faster. That keeps the "highest-intent, lowest-time-budget"
path lightweight while still preserving the same visual language as the rest
of KrishnaOS.
