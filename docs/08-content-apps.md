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

## Skills: dashboard-style redesign (hands-on Phase E)

Built out of the documented roadmap order (`KRISHNAOS_HANDS_ON_CONTEXT.md`
lists Skills after Projects/Achievements) at Krishna's explicit request,
modeled on a reference screenshot: an eyebrow/title/tagline header, a row
of stat cards, several grouped skill-tag cards, and a closing quote card.
The original `SkillsApp.tsx` (a heading + flat pill list per group) is
replaced; `SKILLS_CONTENT`'s shape and the six original groups are
unchanged, so nothing that already read `SKILLS_CONTENT` elsewhere (the
`skills` terminal command, Recruiter Mode if it ever adds a skills tile)
needed to change.

**Two new groups were added to `SKILLS_CONTENT`, confirmed by Krishna as
real rather than invented:** `Developer Tools` (VS Code, Terminal, ESLint,
Prettier, Jest, Postman, Thunder Client, GitHub Actions, NPM / Yarn) and
`Soft Skills` (Problem Solving, Critical Thinking, System Design,
Adaptability, Continuous Learning, Team Collaboration, Communication,
Ownership) — bringing the total to eight groups. Per this file's
established pattern (see the About sections above), content this
substantive is not invented silently; Krishna was asked directly whether
he actually uses/has these before they were added, since neither list
existed anywhere in `krish_public.md` or the prior `content.ts`.

**A new `SkillsPageContent` type + `SKILLS_PAGE_CONTENT` export holds the
header/tagline/quote copy**, following the same "content lives in
`content.ts`, not inline JSX strings" rule as everything else on this
page:

```ts
export interface SkillsPageContent {
  eyebrow: string;
  title: string;
  titleAccent: string;
  tagline: string;
  badges: string[];
  quote: {
    heading: string;
    lines: string[];
  };
}
```

The quote card's wording (`"I believe the best way to learn is by
building."` + supporting lines) is Krishna's own, given directly rather
than drafted by the AI — the same non-negotiable rule
`KRISHNAOS_HANDS_ON_CONTEXT.md` applies to About's narrative sections
applies here: a first-person quote is a personal claim, not filler copy an
AI can safely originate.

**Stat-card numbers are computed, not hardcoded**, specifically because
the reference image's numbers ("20+ Technologies", "7 Project Domains",
"10+ Major Projects") aren't independently verifiable against real
content:

```ts
const uniqueSkillCount = new Set(SKILLS_CONTENT.flatMap((g) => g.skills)).size;
const groupCount = SKILLS_CONTENT.length;
const projectCount = PROJECTS_CONTENT.length;
```

"Technologies" is a de-duplicated count across every group (some skills,
like WebSockets, legitimately appear in more than one group, so a naive
sum would double-count). The reference's "Project Domains" stat had no
honest equivalent in existing content — inventing a count to match the
picture would have reintroduced exactly the fabricated-number problem
this file's own "no invented personal content" principle exists to avoid —
so it was relabeled "Skill Areas" and backed by `SKILLS_CONTENT.length`
instead of forcing a number the data doesn't actually support. "Major
Projects" reads `PROJECTS_CONTENT.length` directly, the same array
`ProjectsApp` and `FEATURED_PROJECTS` already treat as the one source of
truth for project data.

**The reference's "Currently Exploring" tag row and the fourth
stat-card's exact framing were both explicitly decided, not assumed:**
Krishna asked to skip "Currently Exploring" for now (no confirmed list
existed), so it isn't in this build; "Always Learning" appears only as
the existing eyebrow badge copy and the fourth stat card's fixed label,
never as a numeric claim.

**Icons and tints are a parallel, index-matched array to `SKILLS_CONTENT`**
rather than a field on `SkillGroup` itself:

```ts
const GROUP_ICONS = [CodeGlyph, LayersGlyph, ServerGlyph, DatabaseGlyph, WrenchGlyph, CompassGlyph, TerminalGlyph, UsersGlyph];
const GROUP_TINTS = ['#a78bfa', '#38bdf8', '#818cf8', '#38bdf8', '#a78bfa', '#818cf8', '#38bdf8', '#4ade80'];
```

This mirrors `AmbitionGrid.tsx`'s existing `PILLAR_ICONS`/`PILLAR_TINTS`
pattern exactly, for the same reason given there: icon/tint choice is a
purely visual decision that doesn't belong on the content type itself
(`SkillGroup` has no icon field, and none was added). A defensive
fallback (`GROUP_ICONS[i] ?? GROUP_ICONS[GROUP_ICONS.length - 1]`) exists
so that if a future group is appended to `SKILLS_CONTENT` without a
matching icon/tint entry, the card still renders with a repeated icon
instead of crashing.

**Two new icon glyphs were added to `os/icons.tsx`** (`DatabaseGlyph`,
`WrenchGlyph`, `UsersGlyph`, `TerminalGlyph`) rather than forcing existing
Dock/app icons into a mismatched role, following the same reasoning as
`AboutApp.tsx`'s hero section: the existing `AppId`-keyed icon registry in
`os/icons.tsx` is for Dock/Spotlight/title-bar icons and is deliberately
not extended for one-off content icons; these new glyphs are plain
exports alongside the existing ones, matching how `CompassGlyph`/
`LayersGlyph`/`PuzzleGlyph`/`HeartGlyph` already work for `AmbitionGrid`.

**The Skills window's default size grew from 560×420 to 920×640**
(`os/appRegistry.ts`). The original size fit a simple pill-list layout;
the new 4-column stat-card row and `xl:grid-cols-4` skill-group grid need
real width to avoid cramming into a single narrow column by default. This
is a window *default* only — `useWindowStore`'s existing resize/fullscreen
behavior (Phase A) is untouched, so a visitor can still resize or
fullscreen the window exactly as before.

**Not yet done:** no motion/stagger-in animation was added (matches the
current state of the rest of Skills' siblings — Projects/Achievements/
Experience don't have entrance animation yet either); mobile/responsive
verification beyond the existing `sm:`/`xl:` Tailwind breakpoints hasn't
been manually checked on a real device.

## Experience: dashboard-style redesign (hands-on Phase F)

Built directly after Skills, again ahead of the documented roadmap order
(`KRISHNAOS_HANDS_ON_CONTEXT.md` lists Experience after Achievements/
Skills) at Krishna's explicit request, modeled on a reference screenshot:
a current-role header card, a real company link, a badge row, a "Tech
Stack I Use" grid, a "My Journey" vertical timeline, and a closing quote +
trait-card section. The original `ExperienceApp.tsx` (a plain bordered
list with a bullet-point per highlight) is replaced; `EXPERIENCE_CONTENT`'s
shape and its one real entry are unchanged.

**The reference invents an entire career history that doesn't exist in
real content** — three additional timeline entries (2023–24 freelance
work, 2022–23 internship, 2021–22 "personal projects" era) beyond the one
real `EXPERIENCE_CONTENT` entry (Udhyog Saathi, 2024–present). Per this
file's "no invented personal content" principle, none of those three
entries were added. Krishna's explicit instruction was to build the *UI*
generically over `EXPERIENCE_CONTENT` (so it correctly renders one entry
now and however many entries he adds to `content.ts` himself later,
without any component changes) rather than have the AI invent placeholder
history to match the picture. `ExperienceApp.tsx` therefore always
`.map()`s the full array — it was never hardcoded to assume exactly one
entry.

**Two sections in the reference were dropped entirely, not just toned
down:** a "What I Do Best" panel showing skill categories as percentage
progress bars (Frontend Development 95%, UI/UX 90%, etc.), and an "Impact
at Udhyog Saathi" stats panel (10+ Modules Built, 20+ Active Features, 50+
Users Onboarded, 90% Manual Work Reduced). Neither had honest data behind
it — no module count, feature count, user count, or productivity metric
exists anywhere in `krish_public.md`/`krish_private.md`/`content.ts` — and
`KRISHNAOS_HANDS_ON_CONTEXT.md`'s Phase E section explicitly names
percentage-based skill ratings as a pattern to avoid ("These numbers are
subjective and usually add little value"). Krishna confirmed both should
be skipped rather than backfilled with placeholder numbers.

**A new `ExperiencePageContent` type + `EXPERIENCE_PAGE_CONTENT` export**
holds the eyebrow/badges/quote/traits copy, mirroring `SkillsPageContent`
exactly:

```ts
export interface ExperiencePageContent {
  eyebrow: string;
  badges: string[];
  quote: { heading: string; lines: string[] };
  traits: { title: string; description: string }[];
}
```

The header's badge row (`SaaS`, `Full-Stack`, `Product`, `Problem Solver`,
`Builder`) is Krishna's own framing of his real Udhyog Saathi role —
confirmed explicitly as the sourcing method during this build, rather than
a literal skill-rating claim the way the reference's percentage bars
were. The closing quote (`"I believe in building things that make a
difference..."`) and the three trait cards (Curious Mind / Builder at
Heart / User Focused) are the reference's wording, which Krishna reviewed
and chose to keep as his own rather than rewrite — the same "a first-
person quote is a personal claim, not filler copy an AI can safely
originate" rule from the Skills section applies here, satisfied by
explicit confirmation rather than by the AI drafting new wording.

**The company link and tech-stack grid are both derived, not
hand-typed**, to avoid creating a second, driftable copy of data that
already exists once:

```ts
const companyProject = PROJECTS_CONTENT.find((p) => p.title === current.company);
const companyLink = companyProject?.links.live;

const techStack = Array.from(new Set(PROJECTS_CONTENT.flatMap((p) => p.stack))).sort();
```

`Experience` (the shared type) has no `link` field, and none was added —
Udhyog Saathi's canonical live URL already exists once on its matching
`PROJECTS_CONTENT` entry, so `ExperienceApp` looks it up by matching
`company`/`title` rather than duplicating the URL as a new field, the same
reasoning `FEATURED_PROJECTS` already established for not maintaining a
second project list. The tech-stack grid is the de-duplicated union of
every real project's `stack` array — this deliberately excludes a few
libraries the reference image shows (Redux Toolkit, React Query) that
aren't recorded as used in any real project entry, rather than trusting
the picture over the actual data.

**Highlights render as prose or as a pill, decided per-string, not by a
fixed content shape:**

```ts
function isPillLike(text: string) {
  return text.length <= 40 && !text.endsWith('.');
}
```

The reference's timeline cards show short tag-style labels ("Dashboard &
Analytics", "Inventory Management"). Krishna's real
`EXPERIENCE_CONTENT[0].highlights` are full sentences he wrote for the
prior narrative pass (Phase 4), not short labels — forcing a full sentence
into a cramped pill would visually mangle it. Rather than silently
changing Krishna's existing sentences to fit the picture, or asking him to
rewrite already-real content a second time, each highlight is classified
at render time: long, period-ending strings render as wrapped paragraph
text (which is what all four of the current real highlights are, so today
the pill row simply doesn't appear), while any future highlight written as
a short label (as the reference intends) renders as a pill automatically.
This means the component is ready for either style of content without
needing a schema change or a second field.

**The vertical "My Journey" timeline reuses `JourneyPipeline.tsx`'s visual
language rather than inventing a new one** — a repeating-gradient dashed
rail line with per-entry dot markers, index-matched tint array
(`TIMELINE_TINTS`, same pattern as `STAGE_TINTS`/`PILLAR_TINTS`), the
current entry's dot filled solid while earlier entries (once they exist)
would render hollow. The rail is vertical here instead of horizontal,
which is a genuinely new layout (About's pipeline has no vertical
precedent in this codebase), but the *device* — dashed line + circular
node + tint cycling — is the same one already established, not a
four-th distinct visual system for the same underlying idea.

**Negative dot-offset positioning follows the codebase's existing
convention of a raw arbitrary bracket value** (`left-[-1.5rem]`), matching
`HeroSection.tsx`'s `right-[-1rem]` for its floating status card, rather
than an untested negative custom-spacing utility (`-left-os-6`) that isn't
used anywhere else in this codebase and wasn't worth introducing as a new,
unverified pattern for one offset.

**The Experience window's default size grew from 640×480 to 960×680**
(`os/appRegistry.ts`), for the same reason Skills' window grew — the
original size fit a simple bulleted list; the new two-column header +
tech-stack grid + timeline need more room by default. Window resize/
fullscreen behavior (Phase A) is untouched.

**Not yet done:** no motion/stagger-in animation; mobile/responsive
verification beyond existing Tailwind breakpoints hasn't been manually
checked; a second `EXPERIENCE_CONTENT` entry (freelance work, internship,
or earlier roles, if Krishna has real ones to add) would be a pure
content.ts edit with no component changes required, per the generic
timeline `.map()`.

## Education: deliberately kept simple (hands-on Phase G)

Built in the same session as Achievements/Contact, from a reference
screenshot showing Education as a decorated dashboard: a large hero
illustration, per-entry subject-tag pills (Algorithms, Data Structures,
DBMS...), an institution logo tile, and a stat footer (8+ Core Subjects,
50+ Concepts Learned, ∞ Curiosity). This is the one page in this batch
where the reference was **not** matched, on purpose.

**`KRISHNAOS_HANDS_ON_CONTEXT.md`'s Phase G section is explicit and
unambiguous:** *"Do NOT make Education a flashy OS animation showcase...
KrishnaOS demonstrates engineering through interaction where interaction
adds value, while simple information stays simple."* This directly
conflicts with the reference image, which is one of the more decorated
dashboards in the whole app. Rather than silently picking a side, this
tension was surfaced to Krishna directly; he confirmed keeping Education
minimal over matching the fuller reference design. This is the same
"surface tension, don't silently resolve it" pattern already used for
HeroSection's glass/glow decision and Experience's fabricated-history
refusal — the difference here is Krishna sided with the project's own
stated principle rather than the reference image.

**What was actually built:** a small header (`EducationPageContent` —
eyebrow, tagline, and a `closingNote` for the bottom line, mirroring
`SkillsPageContent`'s content-lives-in-content.ts rule), and the existing
institution/degree/date list dressed up only as far as a small connecting
timeline rail — reusing the exact dashed-line-plus-dot device already
established in `ExperienceApp.tsx`'s "My Journey" timeline, not a new
visual system. `EDUCATION_CONTENT` itself is completely unchanged.

**Deliberately NOT included, matching the explicit decision:** per-entry
subject-tag pills, an institution logo/icon tile, and a stat footer.
None of these exist as real content (`EducationEntry` has no `field`/
`tags`/`grade` properties, and adding them would have meant inventing
subject lists for entries Krishna hasn't specified), and building them
anyway would have been exactly the "flashy dashboard" Phase G warns
against — not a content gap to backfill later, but a page that's
intentionally simpler than its sibling apps.

## Achievements: dashboard-style redesign (hands-on Phase D)

Built in the same session as Education/Contact, modeled on a reference
screenshot: header, a computed stat row, a two-column grid of achievement
tiles, and a closing quote card with a CTA. Unlike Education, this page
isn't covered by `KRISHNAOS_HANDS_ON_CONTEXT.md`'s "keep it simple"
instruction, so it follows the richer dashboard treatment already
established for Skills/Experience. The original `AchievementsApp.tsx`
(presumably a simpler list, superseded here) is replaced.

**Two new achievements were added to `ACHIEVEMENTS_CONTENT`** — `Open
Source Contributor` (2024) and `Continuous Learner` (`Always`) — bringing
the real total from 4 to 6, matching the reference's tile count exactly.
Unlike Skills'/Experience's refusals to invent unconfirmed content, Krishna
explicitly confirmed both entries as real and asked to use the
reference's exact wording for both title and description, so neither
required the AI to draft new copy.

**A new `AchievementsPageContent` type + `ACHIEVEMENTS_PAGE_CONTENT`
export** holds the eyebrow/tagline/quote/CTA-label copy, following the
same pattern as `SkillsPageContent`/`ExperiencePageContent`:

```ts
export interface AchievementsPageContent {
  eyebrow: string;
  tagline: string;
  quote: { heading: string; lines: string[] };
  ctaLabel: string;
}
```

The closing quote (`"Achievements are temporary, but the learnings stay
forever. I focus on growth, not just glory."`) is the reference's wording,
which Krishna explicitly chose to keep rather than rewrite — the same
"personal claim, satisfied by confirmation rather than AI-drafted
wording" pattern already used for Experience's closing quote.

**Stat numbers are computed, not copied from the reference image:**

```ts
const achievementCount = ACHIEVEMENTS_CONTENT.length;
const certificationCount = CERTIFICATIONS_CONTENT.length;
const hackathonCount = ACHIEVEMENTS_CONTENT.filter((a) =>
  /hackathon|techathon/i.test(a.title),
).length;
```

"Achievements" and "Certifications" read real array lengths directly (6
and 2). "Hackathons" deliberately does **not** hardcode the reference's
"3" — it live-counts titles matching `/hackathon|techathon/i`, which today
evaluates to 2 (EY Techathon 5.0 + Smart India Hackathon 2023). This is
honestly lower than the reference's number, and that's the point: the
stat reflects what's actually recorded in `ACHIEVEMENTS_CONTENT` rather
than a number picked to match the picture, and it will correctly become 3
the moment a third hackathon-type entry is ever added — no component
change needed. "Learning" uses the fixed label `"∞"`, matching Skills'
"Always" stat card convention of a qualitative label rather than a
fabricated number for an open-ended claim.

**The closing "Let's build more →" CTA is a real button, not decorative
text styled to look clickable:**

```ts
const openWindow = useWindowStore((s) => s.openWindow);
// ...
<button type="button" onClick={() => openWindow('projects')}>{ctaLabel}</button>
```

The reference doesn't specify what this button links to. Rendering it as
inert-looking `<span>` text styled like a button would have been
misleading UI — a person would reasonably expect it to do something on
click. Projects is the natural real destination for "see more of what
I've built," and `useWindowStore.openWindow` is the same real, existing
action the Dock/Spotlight/Recruiter Mode already use to open windows, not
a new navigation mechanism invented for this one button.

**Not yet done:** no motion/stagger-in animation; mobile/responsive
verification beyond existing Tailwind breakpoints hasn't been manually
checked.

## Contact: real Subject field + info-card redesign (hands-on Phase, contact enrichment)

Built in the same session as Education/Achievements, from a reference
screenshot showing a "Get In Touch" header, a 2×2 info-card grid
(Email/Phone/Location/LinkedIn), an "open to opportunities" tag row, and
a contact form with an added Subject field. The existing working
Name/Email/Message → MongoDB flow (`docs/08-content-apps.md`'s earlier
"Contact: the real backend-flex moment" section, still accurate) is
preserved exactly — this section only covers what was added on top of it.

**Subject is a genuine cross-stack schema addition, not just a new
`<input>` with nowhere for the value to go.** Krishna explicitly confirmed
this should touch the real backend rather than be a decorative extra
field the form silently drops. Four files changed together:

```ts
// packages/shared-types/src/contact.ts
export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;  // optional, per Krishna's explicit choice
  message: string;
}
```

```ts
// apps/server/src/models/ContactSubmission.ts
subject: { type: String, required: false, trim: true, maxlength: 200 },
```

`contactController.ts`'s `validateContactPayload` gained matching
optional-field validation (type-checks `subject` only if present, caps it
at 200 characters, omits the key entirely from the saved payload if
empty/whitespace-only rather than persisting an empty string) and the
response-mapping in `submitContact` was updated to include `subject` in
the returned `ContactSubmission` when present — without that second
change, a saved subject would have silently vanished from the API
response even though it was correctly persisted to MongoDB.

**Client-side validation and the submit call were extended to match,
keeping the existing mirroring convention** (client validation duplicates
the server's checks for instant UX feedback; the server remains the real
source of truth, per this file's existing note on why that duplication
isn't a security boundary being duplicated insecurely). `subject` is only
included in the submitted payload when non-empty, matching the server's
same "omit rather than send empty string" behavior:

```ts
const trimmedSubject = subject.trim();
const res = await submitContactForm({
  name: name.trim(),
  email: email.trim(),
  ...(trimmedSubject.length > 0 ? { subject: trimmedSubject } : {}),
  message: message.trim(),
});
```

`apps/client/src/lib/apiClient.ts`'s `submitContactForm` needed **no
changes** — it already accepted a generic `ContactPayload`, so the new
optional field flows through automatically once the shared type gained it.

**Phone and Location are real facts that were previously private-only,
now shown publicly by explicit confirmation.** The phone number
(`+91 9064700906`) exists in `krish_private.md`, marked private; Krishna
explicitly confirmed showing it on this public-facing page during this
session — it was not assumed safe to surface just because a reference
image showed a phone card. Location is deliberately shown at
country-level only (`"India"`), Krishna's own choice over the more
specific state/institution-level detail also on file privately. Both live
in a new `ContactPageContent` (`content.ts`), alongside the opportunity-
tag row (`Open Source` / `Freelance` / `Full-time` / `Internships`,
Krishna confirmed using the reference's exact tags and label wording) and
the header tagline — the tagline was initially drafted directly in JSX
during the build and caught in self-review as a violation of this file's
own "content lives in `content.ts`" rule before being moved into
`ContactPageContent` where it belongs.

**Email and LinkedIn info cards reuse `PROFILE_LINKS` rather than storing
a second copy of those URLs** — the same "one source of truth" reasoning
already applied to Experience's company-link lookup. A dedicated
`PhoneGlyph` and `MapPinGlyph` were added to `os/icons.tsx` for the two
new info cards rather than reusing a thematically-mismatched existing
icon (an earlier draft used `TargetGlyph` for Phone and `UsersGlyph` for
Location before this was caught in review and corrected) — consistent
with this file's existing principle that a new icon is added when no
existing one genuinely fits, rather than forcing a visual mismatch.

**The Contact window's default size grew from 480×440 to 840×560**
(`os/appRegistry.ts`), for the same reason every other redesigned window
grew this session — the original size fit a single-column form; the new
two-column (info cards + form) layout needs more room by default. Window
resize/fullscreen behavior (Phase A) is untouched.

**`RecruiterRoot.tsx` was checked and needed no changes** — it opens the
real `ContactApp` window via `useWindowStore.openWindow('contact')`
rather than rendering a second, duplicate contact form, so the Subject
field addition required no changes there.

**Not yet done:** no motion/stagger-in animation; mobile/responsive
verification beyond existing Tailwind breakpoints hasn't been manually
checked; existing contact submissions already in MongoDB predate the
`subject` field and simply won't have it (Mongoose's `required: false`
means this is non-breaking, but worth a quick sanity check against the
real database).

