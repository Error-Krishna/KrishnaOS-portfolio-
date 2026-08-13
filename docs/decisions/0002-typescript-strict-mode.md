# 0002 — TypeScript strict mode, everywhere, no exceptions

**Date:** Phase 1 scaffolding
**Status:** Accepted

## Context

`"strict": true` in every package's `tsconfig.json` turns on a bundle of
TypeScript's stricter checks (`strictNullChecks`, `noImplicitAny`, etc.).
It catches more bugs at compile time but requires more upfront type
discipline — some teams disable it for velocity, especially early in a
project.

## Decision

Strict mode is on in `packages/shared-types`, `apps/client`, and
`apps/server`, with no exceptions, from the very first commit.

## Reasoning

This is a portfolio project meant to demonstrate engineering rigor — loosening
type safety for short-term velocity would undercut the actual point of the
project. But beyond the "this is a flex" argument, strict mode caught two
real bugs during scaffolding, not hypothetical ones:

### Bug 1: unsafe tuple indexing

Original code:
```ts
const dbStateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'] as const;
const dbState = dbStateNames[mongoose.connection.readyState] ?? 'unknown';
```

`mongoose.connection.readyState` is typed as `number`, not a `0 | 1 | 2 | 3`
union — Mongoose's own types don't constrain it that tightly. Strict mode's
`noUncheckedIndexedAccess`-adjacent tuple checking flagged: *"Tuple type...
of length 4 has no element at index 99"* — TypeScript correctly recognized
that indexing a 4-element tuple with an arbitrary `number` is unsound, even
though in practice `readyState` only ever takes values 0-3. Fixed by
switching to a `Record<number, string>` lookup with an explicit `?? 'unknown'`
fallback — safe regardless of what `readyState` actually returns at runtime.

### Bug 2: incorrect Fuse.js type import

Original code:
```ts
import Fuse from 'fuse.js';
const fuseOptions: Fuse.IFuseOptions<SearchableEntry> = { ... };
```

This compiled under looser settings but failed under strict mode with
*"'Fuse' only refers to a type, but is being used as a namespace here."*
The installed Fuse.js version exports `IFuseOptions` as a **named type
export**, not a member of a `Fuse` namespace. Fixed by importing it
explicitly: `import Fuse, { type IFuseOptions } from 'fuse.js'`.

## Takeaway

Both of these are exactly the class of bug that "works during development,
breaks in an edge case nobody tested" — an out-of-range `readyState` value,
or a slightly different library version with different type export shapes.
Strict mode turned both into "code that doesn't compile" instead of "code
that ships and breaks later." That's the argument for strict mode in one
sentence, backed by two real examples from this exact project rather than
a generic claim.
