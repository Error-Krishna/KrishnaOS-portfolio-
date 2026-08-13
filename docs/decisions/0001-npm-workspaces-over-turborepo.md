# 0001 — npm workspaces over Turborepo/Nx

**Date:** Phase 1 scaffolding
**Status:** Accepted

## Context

The project needed a monorepo (client + server + shared types). Popular
choices for JS/TS monorepos in 2025–26 include plain npm/pnpm/yarn
workspaces, or a build-orchestration layer on top like Turborepo or Nx.

## Decision

Use plain npm workspaces. No Turborepo, no Nx.

## Reasoning

Turborepo and Nx solve problems around **build caching and task
orchestration at scale** — remote caching so CI doesn't rebuild unchanged
packages, dependency-graph-aware task running ("only rebuild what actually
changed"), etc. Those are real problems, but only once you have enough
packages and slow enough builds that naive `npm run build` across everything
becomes painful.

KrishnaOS has three packages, and `npm run build -w packages/shared-types &&
npm run build -w apps/client && npm run build -w apps/server` finishes in a
few seconds. There's no caching problem to solve yet.

## Alternatives considered

- **Turborepo:** would add a `turbo.json` pipeline config and a new command
  (`turbo build` instead of `npm run build`) — extra configuration surface
  for a benefit (caching) that doesn't matter at this scale yet.
- **Nx:** similar reasoning, plus Nx's plugin/generator system is overkill
  for three straightforward packages.
- **pnpm workspaces instead of npm:** pnpm's stricter node_modules linking
  (avoids "phantom dependencies") is a genuine advantage, but npm workspaces
  were chosen for zero-extra-tooling — everyone already has npm, and this
  project doesn't currently hit the phantom-dependency problems pnpm
  protects against.

## Revisit this if...

The project grows to significantly more packages, or CI build times become
a real friction point (multiple minutes, run frequently). At that point,
Turborepo's incremental build caching would start paying for its
configuration cost.
