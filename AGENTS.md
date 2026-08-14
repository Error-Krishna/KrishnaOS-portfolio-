# AGENTS.md

Instructions for any AI coding agent (Claude Code, Cursor, etc.) working in
this repository. Read `context.md` first for project intent and current
phase — this file is about **how to write code here**, not what to build.

## Before writing any code

1. Read `context.md` for current phase and hard constraints.
2. Check if `/docs` already documents the area you're touching — if so, your
   change needs to keep that doc accurate, not just make the code work.
3. Check `docs/02-tech-stack.md` before adding any new dependency — the
   library you need may already be in the stack.

## Project structure — where things go

See `docs/01-architecture.md` for the full reasoning. Quick reference:

| Building... | Goes in... |
|---|---|
| New content window | `apps/client/src/apps/<name>/` |
| New OS chrome (dock, menu bar, etc.) | `apps/client/src/os/<feature>/` |
| New global state | `apps/client/src/store/use<Name>Store.ts` |
| New API route | `apps/server/src/routes/<name>.ts` + controller in `controllers/` |
| Shape both client and server need | `packages/shared-types/src/<name>.ts`, exported from `index.ts` |
| Client-only utility | `apps/client/src/lib/` |

## TypeScript conventions

- **Strict mode is non-negotiable.** Every `tsconfig.json` in this repo has
  `"strict": true`. Do not add `// @ts-ignore` or loosen strictness to make
  something compile — fix the actual type issue. See
  `docs/decisions/0002-typescript-strict-mode.md` for why.
- **Prefer `type` imports for type-only imports:** `import type { Foo } from
  '...'`, not `import { Foo } from '...'` when `Foo` is only used as a type.
  The existing codebase does this consistently (see any file in
  `packages/shared-types` or the store files).
- **No `any`.** If a type is genuinely unknown, use `unknown` and narrow it
  (see `contactController.ts`'s `validateContactPayload` for the pattern).
- **Shared types live in `packages/shared-types`, nowhere else.** Never
  redefine a shape that already exists there. If client and server need
  slightly different views of the same data, extend/pick/omit from the
  shared type rather than duplicating fields by hand.

## React conventions

- **Function components only**, named exports (not default exports) for
  components — matches every existing component in the codebase
  (`export function WelcomeScreen()`, not `export default function`).
- **Zustand selectors, always narrow:** `useModeStore((s) => s.mode)`, never
  `useModeStore()` destructured wholesale. This is what keeps components
  from re-rendering on unrelated state changes — see
  `docs/03-state-management.md`.
- **Path alias `@/` maps to `apps/client/src/`** — use it for any import
  crossing feature-folder boundaries (`import { useModeStore } from
  '@/store/useModeStore'`), not relative paths like `../../store/...`.
  Relative imports (`./`) are fine for files in the same folder.
- **New Zustand stores follow the existing pattern exactly:** interface
  first (state + actions in one shape), then `create<StoreName>((set, get) =>
  ({ ...initial state, action: () => set(...) }))`. Look at
  `useBootStore.ts` (simplest) or `useWindowStore.ts` (most complex) as
  templates.

## Styling conventions

See `docs/04-styling-system.md` for the full reasoning.

- **Never hardcode a color, spacing value, or font size.** Use the existing
  `os-` prefixed tokens (`bg-os-glass`, `p-os-4`, `text-os-body`, etc.)
  defined in `apps/client/src/index.css`'s `@theme` block. If you need a
  new token, add it there first with the same naming pattern, then use it —
  don't inline a raw value "just this once."
- **Glass material always uses the `.glass-panel` class**, not a one-off
  set of `backdrop-filter` utilities. If you need a variant, extend the
  class in `index.css`, don't duplicate its five properties inline.
- **No `localStorage`/`sessionStorage` reads outside a `try/catch`** — see
  `useBootStore.ts`'s pattern. These APIs can throw in private-browsing
  contexts; always fail open to a safe default.

## Backend conventions

- **Every route handler returns the shared `ApiResponse<T>` shape** —
  `{ success: true, data: T }` or `{ success: false, error: { message,
  code? } }`. See any file in `apps/server/src/routes/` or
  `controllers/contactController.ts` for the pattern. Never return a bare
  object or array from a route.
- **Validate input by hand at the controller layer**, don't reach for a
  validation library for a route this simple — see
  `contactController.ts`'s `validateContactPayload` as the pattern to
  follow for any new POST route. (If routes grow significantly more complex
  later, revisit this — but don't add a validation library preemptively.)
- **The server must never crash on a missing `MONGODB_URI`.** See `db.ts` —
  it logs a warning and continues. Any new code that depends on a DB
  connection existing should degrade gracefully (return a clear error via
  `ApiResponse`), not throw an unhandled exception.

## What NOT to do

- **Don't build fake/placeholder UI that looks finished.** If a feature
  isn't built yet, it should visibly say so (see `ModePlaceholder` in
  `OsRoot.tsx` as the pattern) — never ship a convincing-looking screen
  with no real logic behind it, even temporarily.
- **Don't scope-creep into later phases.** Check `krishnaos-coding-prompt.md`'s
  phase breakdown before building — if you're in Phase 3 and find yourself
  writing Phase 5's tour-content-wiring logic, stop and flag it instead of
  continuing.
- **Don't skip the docs update.** Any change that alters architecture,
  adds a new pattern, or makes a non-obvious decision needs a corresponding
  update to the relevant `/docs/*.md` file (or a new `docs/decisions/000N-*.md`
  entry for a genuinely new decision) in the *same* session — not deferred.
- **Don't add a dependency without checking if the stack already covers
  it.** Re-read `docs/02-tech-stack.md`'s "what we deliberately did NOT add"
  section before reaching for a new library.
- **Don't rename or restructure existing folders without updating
  `docs/01-architecture.md`'s structure diagram** — that doc is meant to
  always match the real folder layout.

## After finishing a task

1. Run `npm run typecheck` from the repo root — must pass clean.
2. If you touched `apps/client`, run `npm run build -w apps/client` to
   confirm it actually bundles.
3. Update `context.md`'s "Current phase" section if you completed or
   started a new phase item.
4. Update the relevant `/docs/*.md` file(s) if you made an architectural
   decision, added a pattern, or changed how something works.


## Project State

`PROJECT_STATE.md` is the single source of truth for the current development state.

While working:
- Keep `PROJECT_STATE.md` updated as meaningful changes are made.
- Record completed changes, ongoing/incomplete work, important discoveries, and the logical next step.
- Do not wait until the end of the task to update it.
- Keep it concise. Do not duplicate information already documented in `docs/` or `context.md`.
- Never invent or guess project state.

At the start of a task:
- Read `PROJECT_STATE.md` to understand what the previous agent was doing.

Before making a significant change:
- Update the current work/ongoing section if necessary.

After completing a meaningful change:
- Update the changes made section and next step.

The goal is that if the current AI agent suddenly runs out of tokens, another AI agent can read `PROJECT_STATE.md` and immediately continue the work without needing the previous conversation.