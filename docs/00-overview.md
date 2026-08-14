# KrishnaOS — Documentation Overview

Welcome to the docs. This folder exists so that **you** (Krishna) can point to
any part of this project in an interview and explain not just *what* it does,
but *why* it's built that way. That's the whole point of these docs — this
project is your flagship frontend engineering piece, and "I vibe-coded it
with AI" is not the story we're telling. "I made deliberate engineering
decisions, understood the tradeoffs, and can defend every one of them" is.

## How to use this folder

Read docs **in order** the first time, then use them as reference after that.
Each doc assumes you've read the ones before it.

| Doc | What it covers | Read this when... |
|---|---|---|
| `01-architecture.md` | Monorepo shape, workspace boundaries, why this structure | You're confused about where a file should live |
| `02-tech-stack.md` | Every library, why it was picked, what it owns | You're about to add a dependency, or an interviewer asks "why X?" |
| `03-state-management.md` | The four Zustand stores and how they talk to each other | You're wiring new UI to existing state, or adding a new store |
| `04-styling-system.md` | Tailwind v4 tokens, the glass-panel pattern, no-JS-config approach | You're styling something new and unsure which token to use |
| `05-boot-sequence.md` | The GSAP timeline beat-by-beat, sessionStorage skip logic | You're touching boot/, or explaining the animation system |
| `06-navigation-flow.md` | Mode routing, boot→welcome→mode orchestration, cross-mode rules | You're adding a new mode or route |
| `07-os-shell.md` | App registry, menu bar, dock, window manager, Spotlight | You're touching `os/*`, or adding a new app to the registry |
| `decisions/` | Short ADR-style notes, one per major decision, dated | You want to know *when* and *why* a choice was made, or you're reconsidering one |
| `10-recruiter-mode.md` | Recruiter Mode's condensed single-screen view | You're touching the `/recruiter` fast path, escape hatch, or featured-project filtering |

## The learning method we're using

Every phase of this build follows the same loop:

1. **Build the phase** (with AI assistance, but every file reviewed and
   understood by Krishna before moving on)
2. **Document what was built and why**, in plain language, before starting
   the next phase — not after the whole project is "done"
3. **Krishna can explain it back** — if you can't explain a piece of code
   without looking at it, that's a signal to slow down and actually read it,
   not just move to the next phase

This means docs are written *as we build*, not bolted on at the end. If a doc
here feels out of date with the code, that's a bug — flag it and we fix the
doc in the same session as the code change.

## Project context files (for AI agents)

Separate from `/docs` (which is for *you* to read), the project root has:

- **`context.md`** — the single file to reference at the start of any AI
  coding session. Current phase, what's built, what's next, hard constraints.
- **`AGENTS.md`** — coding conventions and patterns any AI agent (Claude Code,
  Cursor, etc.) should follow when writing code in this repo, so style and
  architecture stay consistent across sessions and across different AI tools.

Read `context.md` first if you're picking this project back up after a break
— it's the fastest way back to full context, for you or for an AI agent.

## What "done" looks like for this documentation

Not exhaustive API documentation — this isn't a library. The bar is: **a
competent frontend developer (or Krishna, six months from now) can open any
doc, understand the reasoning, and make a confident, correct change without
having to reverse-engineer intent from the code alone.**
