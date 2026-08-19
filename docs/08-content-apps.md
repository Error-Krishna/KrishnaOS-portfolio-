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
`ABOUT_CONTENT`, `SKILLS_CONTENT`, `PROFILE_LINKS`, `FEATURED_PROJECTS`),
each app component imports the slice it needs and renders it. No fetch, no
loading state, no `/api/content` calls yet — that's the deferred "real
backend flex" the route comment describes, not something Phase 4 needed to
build to satisfy the coding prompt's scope.

**`FEATURED_PROJECTS`** is a derived export —
`PROJECTS_CONTENT.filter(p => p.featured)` — consumed by Recruiter Mode
and the desktop Featured Project widget so neither duplicates the filter.

**`PROFILE_LINKS`** holds external resume/GitHub/LinkedIn URLs for Recruiter
Mode's quick tiles. GitHub is populated; resume/LinkedIn are empty strings
pending the final content pass (Recruiter Mode shows those tiles as honestly
disabled until the URLs land here).

**Every value in `content.ts` is placeholder copy, clearly marked as such**
in the file's own header comment — **except `ABOUT_CONTENT`, which now
holds Krishna's real bio and narrative content** (see "About: from a
single bio field to a typed narrative" below). The remaining sections
(`PROJECTS_CONTENT`, `EXPERIENCE_CONTENT`, etc.) still mirror the
project's existing "don't fake finished UI" principle (`context.md` hard
constraint #1), extended to content: rather than inventing a fabricated
job history or fake achievements that read as real, every entry is an
obvious stand-in ("Company Name", "Add your real bio here") that's honest
about needing a real content pass — which was already an open question in
both source docs before this phase started, not a new gap introduced
here.

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
- **No separate recruiter-only data source or `/api/content` fetch.**
  `RecruiterRoot` and the Featured Project widget read the same
  `lib/content.ts` exports (`FEATURED_PROJECTS`, `PROFILE_LINKS`, etc.).
- **No `/api/content` fetches.** Content is hardcoded per the server route's
  own comment; wiring a real content API is future work, not a Phase 4 gap.

## About: from a single bio field to a typed narrative (hands-on Phase B)

Added after Phase 4/7, as a hands-on feature (see
`KRISHNAOS_HANDS_ON_CONTEXT.md` Phase B). `ABOUT_CONTENT` originally held
just `{ name, headline, bio: string[] }` — enough for a short professional
summary, but nowhere to put a real narrative (identity, journey, honest
self-reflection, ambition) without overloading `bio`'s job.

**`bio` was kept exactly as-is rather than repurposed**, because it's load
-bearing outside `AboutApp.tsx`: `RecruiterRoot.tsx` renders `bio[0]`
directly as a short, scannable one-liner for a recruiter skimming many
portfolios. That's a fundamentally different kind of writing than a story
section — trying to make one field serve both audiences would have meant
either a recruiter-hostile wall of text or a visitor-hostile one-liner
masquerading as a personal story. So the narrative content is additive:

```ts
export interface AboutSection {
  id: string;
  kind: 'story' | 'quote' | 'traits';
  heading?: string;
  body?: string[];   // 'story' only
  quote?: string;    // 'quote' only
  items?: string[];  // 'traits' only
}

export interface AboutContent {
  name: string;
  headline: string;
  bio: string[];
  tagline: string;
  sections: AboutSection[];
}
```

`ABOUT_CONTENT` is explicitly annotated `: AboutContent` (rather than left
to structural inference) specifically so `AboutApp.tsx` gets real
discriminated-union narrowing on `section.kind` — without the annotation,
TypeScript's inferred type for the `sections` array is close enough to
work by accident, but doesn't actually constrain what fields are required
for a given `kind`, which defeats the point of the union.

**`AboutApp.tsx` renders each section differently by `kind`**, one
`if`/`else if` branch per kind inside a single `.map()`:

- `'quote'` → `<blockquote>` with a left accent border
  (`--color-os-accent`) and `text-os-title italic` — visually set apart
  from body text rather than just bolded, since a pull-quote's job is to
  read as a distinct moment, not emphasized prose.
- `'traits'` → heading + a `flex flex-wrap` row of pill `<span>`s, styled
  with the same glass-border pill recipe `RecruiterRoot.tsx`'s skill tags
  already use — reused rather than reinvented, so the pill visual language
  stays consistent across the app.
- `'story'` → heading + `body.map(...)` paragraphs, the same shape as the
  existing `bio.map(...)` rendering just above it in the component.

Each branch's returned element is keyed by `section.id` (a real, stable
identifier already on the data), not array index — matching how
`SKILLS_CONTENT` groups are already keyed elsewhere in the codebase.
Array index is only used for the disposable inner lists (`body` paragraphs,
`items` pills), where the items are plain strings with no independent
identity and the array is never reordered — the same reasoning
`docs/07-os-shell.md`'s window-manager sections apply to `key` choices
elsewhere.

**Content is real, not placeholder-with-a-different-label.** The three
story sections (`journey`, `self-awareness`, `ambition`) were deliberately
left as empty `body: []` arrays with `// Do not paraphrase or invent this
section` comments until Krishna wrote the actual words himself — per
`KRISHNAOS_HANDS_ON_CONTEXT.md`'s explicit Phase B rule that the AI must
not invent personal experiences or personality claims. An AI-drafted
illustrative example was caught and rejected mid-session specifically
because it would have shipped as first-person narrative that wasn't
actually Krishna's.

**Not yet done:** scroll-in motion (a stagger-fade using Framer Motion's
`whileInView`, matching the pattern already used in `StatusWidgets`/`Dock`,
respecting `prefers-reduced-motion`), the remaining visual redesign below
the hero (icon-grid traits, journey pipeline, terminal, closing-quote pill
row — see "About: expanded visual redesign" below), and mobile/responsive
verification for this screen (desktop-first, per explicit scope decision).

## About: expanded visual redesign — hero section (hands-on Phase B, continued)

After the initial narrative pass above, Krishna requested a substantially
larger visual redesign modeled on a reference screenshot: photo, status
card, icon-grid trait questions, a multi-stage "journey" pipeline, a real
interactive terminal, and a richer closing section. This is being built
incrementally, one piece at a time, same reviewed-hands-on process as
everything else — this section covers the **hero**, the first piece done.

**Scope tension, resolved explicitly rather than silently:** the reference
leans harder on decorative gradients/glow/duplicate imagery than
`context.md` §13's stated visual direction ("avoid excessive glass...
flashy effects that do not communicate anything"). This was surfaced to
Krishna directly rather than either refused outright or built without
comment; his call was to keep the reference's fuller visual language
(including a decorative terminal, addressed below) while still reusing
this project's real design tokens throughout rather than inventing new
raw colors — the tension is resolved per-token, not by abandoning the
restraint principle wholesale.

**`AboutContent` grew hero-specific fields**, additive alongside the
existing narrative shape:

```ts
export interface AboutBadge {
  label: string;
}

export interface AboutStatus {
  label: string;
  lines: string[];
}

export interface AboutContent {
  name: string;
  headline: string;
  bio: string[];
  tagline: string;
  sections: AboutSection[];
  badges: AboutBadge[];
  welcomeBadge: string;
  status: AboutStatus;
  photoUrl: string;
}
```

`welcomeBadge` is a plain `string`, not an `AboutBadge[]` — an early draft
mistakenly modeled it as a one-item array of the same shape as the four
trait badges. Caught during review: `welcomeBadge` is conceptually a
single fixed eyebrow label above the name, not a member of a parallel,
reorderable collection the way `badges` (India / CS Student / Builder /
Lifelong Learner) genuinely is — forcing it into the same shape would have
meant an unnecessary `.map()` over an array that can only ever hold one
item.

**`bio` stays the single source for the hero's intro line too** —
`HeroSection.tsx` renders `bio[0]`, the same value `RecruiterRoot.tsx`
already reads. No new duplicate intro-text field was added.

**No new icon-lookup registry was built for the four hero badges.** The
project already has a real theme-aware icon system (`os/icons.tsx`,
hand-drawn stroke SVGs keyed by `AppId` for Dock/Spotlight/title bars).
The hero badges deliberately don't extend that registry — four one-off
labels used in exactly one place don't justify a second lookup table; they
render as plain text pills, matching the pill recipe already established
for `AboutSection`'s `'traits'` kind.

**`HeroSection.tsx` (`apps/client/src/apps/about/`) replaces `AboutApp.tsx`'s
original plain name/headline block**, wired in as `<HeroSection />` at the
top of `AboutApp`'s render, before the `bio` paragraphs and `sections`
list (both untouched). Structure: a `flex flex-col md:flex-row` two-column
layout (stacked on narrow viewports, side-by-side from `md:` up, `w-3/5`
text / `w-2/5` photo split) containing:

- Left: welcome badge, split-styled name (`"I'm "` normal weight, first
  name only in `--color-os-accent`, surname normal — the exact split is
  hardcoded in JSX rather than derived from `name.split(' ')`, a
  deliberate choice: deriving it programmatically would silently assume
  `name` always has exactly a "First Last" shape with no type-level
  guarantee, whereas the fixed split Krishna asked for is more honestly
  expressed as literal JSX than as fragile string-parsing logic), headline,
  `bio[0]`, and the four `badges` as a `flex flex-wrap` pill row.
- Right: the photo in a `glass-panel` frame (reusing the project's existing
  reusable glass-surface class from `index.css` rather than hand-rolled
  border/shadow values), a small decorative (`aria-hidden`) green status
  dot in the top-right corner, and the floating `status` card
  (`status.label` + `status.lines.map(...)`) anchored `absolute
  bottom-os-4 right-[-1rem]` to the photo's bottom-right corner.

**The floating status card's positioning required understanding a real
CSS ownership rule, not just copying classes:** the photo has
`overflow-hidden` (needed so the `<img>` clips to the frame's rounded
corners), but the status card intentionally hangs partially outside the
photo's box (negative `right` offset). A child of an `overflow-hidden`
element gets clipped at that element's edge — so the status card cannot
live inside the same box as the photo. The resolved structure is one
shared `relative` wrapper with **no** `overflow-hidden` of its own,
containing two siblings: the photo (its own separate `overflow-hidden`
box, holding only the `<img>` and the green dot) and the status card
(`absolute`, positioned against the shared wrapper, never clipped). An
earlier draft tried nesting two `glass-panel` divs — one wrapping the
other — specifically to add `overflow-visible` somewhere to escape
clipping; that worked by accident but duplicated the glass-panel
treatment twice for no visual gain. The sibling structure is the version
that actually reflects why each box exists.

**A `--clor-os-accent` typo (missing the `o` in `color`) and a
`--color-os-text-muted` reference (not a real token — the actual tier
names are `-primary`/`-secondary`/`-tertiary`) both surfaced during this
build and were caught in review, not by the build failing.** Worth noting
for anyone debugging a token that silently doesn't apply later: `var()`
referencing an undefined CSS custom property fails silently in the
browser — no TypeScript error, no console warning, no build failure — the
property just doesn't get set. This is a different failure mode than a
missing Tailwind utility class (which also does nothing, but for a
different reason) and is worth checking for by eye against `index.css`'s
real token list whenever a color or token-driven style doesn't seem to be
applying.

**Not yet done, hero-adjacent:** the reference's icon-grid trait treatment,
journey pipeline, terminal, and closing-quote redesign are separate,
not-yet-built pieces (see the top-level "Not yet done" note above this
section). `photoUrl` currently points to a real hosted image URL Krishna
provided; no local asset pipeline/optimization was added since the URL is
externally hosted already.

## Terminal command table (hands-on Phase B, continued)

`TERMINAL_COMMANDS` (`content.ts`) is built ahead of the terminal UI
component itself, data-first — same sequencing as `ABOUT_CONTENT.sections`
was built before `AboutApp.tsx`'s render logic. This backs a **real,
bounded command-driven terminal**, not decorative typing-animation text: a
visitor can type one of a small fixed set of commands and see real output
read live from existing content exports, with no arbitrary code execution
and therefore no meaningful security surface.

```ts
export interface TerminalCommand {
  description: string;
  run: () => string[];
}

export const TERMINAL_COMMANDS: Record<string, TerminalCommand> = {
  whoami: { description: 'Display who I am', run: () => [...] },
  skills: { description: 'List my technical skills', run: () => SKILLS_CONTENT.map(...) },
  projects: { description: 'List my featured projects', run: () => FEATURED_PROJECTS.map(...) },
  help: { description: 'Show available commands', run: () => Object.entries(TERMINAL_COMMANDS).map(...) },
  clear: { description: 'Clear the terminal', run: () => [] },
};
```

**Why `run` is a function (`() => string[]`) and not a precomputed
string/array value:** a precomputed value would duplicate content that
already lives in `ABOUT_CONTENT`/`SKILLS_CONTENT`/`FEATURED_PROJECTS` —
exactly the "same content in two places" pattern
`KRISHNAOS_HANDS_ON_CONTEXT.md` §7 warns against, and it would silently
drift out of sync the moment either source was edited without remembering
to update the terminal's copy too. A function computes the output live,
from the real source, every time it runs, so there is only ever one place
any of this content actually lives.

**`help`'s `run` function references `TERMINAL_COMMANDS` from inside
`TERMINAL_COMMANDS`'s own definition, and this is not a bug.** The
reference is inside an arrow function body, which doesn't execute at
definition time — only later, whenever something actually calls
`TERMINAL_COMMANDS.help.run()`. By then the `const TERMINAL_COMMANDS = {...}`
statement has long finished, so the full object (all five commands)
already exists. This is the general reason closures can safely reference
bindings that don't exist yet at the *point in the file* where the closure
is written, as long as nothing tries to *call* the closure before the
binding is actually ready.

**Not yet built:** the terminal UI component itself (input field, output
history, prompt styling, keyboard/accessibility handling, wiring into the
"What I'm still working on" section) — this is data/logic only so far.
History/current-input state for that component is planned as local
`useState`, not a new Zustand store, per the same reasoning
`ContactApp.tsx`'s status state already established: nothing outside a
single self-contained widget needs to read or coordinate with it.
