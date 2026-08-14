# KrishnaOS — UX Flow Document
### v0.1 — Vision → UX phase deliverable

This document defines the complete navigational logic of KrishnaOS: every screen, decision point, and transition from first load to deep exploration. It is the blueprint for the Figma flow map and all subsequent screen design.

---

## 1. High-level flow

```
[Entry] 
   → Boot Sequence (non-skippable, ~4-6s)
   → Liquid Glass Welcome
        → Choice: "Take a Tour" / "Explore Freely" / "Recruiter Mode"
             ├─→ Guided Tour        (structured, skippable at any step)
             ├─→ Free Exploration   (open desktop, no constraints)
             └─→ Recruiter Mode     (single-screen fast-access view)
```

All three destinations are peers — none is more "correct" than another. The Welcome screen is the only forced gate. Everything past it is the visitor's choice, and every mode can reach every other mode without restarting.

---

## 2. Boot Sequence

**Purpose:** establish "I just opened a Mac" instantly, build anticipation, never overstay its welcome.

**Duration target:** 4–6 seconds total. This is a threshold, not a showcase — if a visitor has seen it once (return visit), it should be skippable or skipped automatically.

**Beats:**

| Step | Visual | Duration | Notes |
|---|---|---|---|
| 1. Black screen | Pure black, silent | 0.4s | Mirrors real boot — no branding yet, just a breath |
| 2. Logo appearance | KrishnaOS mark fades/scales in, centered | 1.2s | Apple-inspired restraint: one mark, no tagline yet |
| 3. Progress indicator | Thin minimal loading bar or subtle pulse beneath mark | 1.5s | Optional; can be replaced by a soft breathing animation on the logo itself |
| 4. Boot transition | Logo scales down slightly / fades, screen begins to lighten | 0.8s | This is the hinge moment — black → world |
| 5. Blur reveal | Desktop wallpaper appears already blurred (heavy blur, low opacity) | 0.6s | We never show a sharp desktop before Welcome — this keeps focus on the glass panel to come |
| 6. Liquid Glass panel arrives | Welcome panel materializes on top of the blurred backdrop | 0.5s | See Section 3 |

**Skip logic:**
- First-time visitors: full sequence plays.
- Returning visitors (same session / recent localStorage flag): boot compresses to ~1.5s or is skipped entirely, going straight to a fast-fade into Welcome. This avoids punishing engaged visitors who navigate back.
- A visible (but unobtrusive) "Skip" affordance appears after ~1.5s for anyone who doesn't want to wait, satisfying accessibility and impatience alike — this is a courtesy, not a core feature.

**Explicitly avoided:** fake progress percentages, spinning beachballs, kernel-panic jokes, sound requirements (autoplay audio is a hostile pattern — if sound is added later, it's opt-in and muted by default).

---

## 3. Liquid Glass Welcome

**Purpose:** the first moment of real choice. Sets tone (premium, calm, confident) and hands control to the visitor immediately.

**Layout:**
- Backdrop: blurred desktop wallpaper, already visible but out of focus — visitors sense there's a "world" behind the glass.
- Centered glass panel (large glass material token) containing:
  - KrishnaOS wordmark / small identity mark
  - One-line identity statement: *"Krishna Goyal — Frontend Engineer"* (exact copy TBD in content pass)
  - Three clear entry paths, presented as equal-weight glass buttons, not a primary/secondary hierarchy:
    - **Take a Tour**
    - **Explore Freely**
    - **Recruiter Mode**
  - A small secondary affordance below (e.g. "Skip intro, go straight to desktop") — this maps to Explore Freely and exists for visitors who don't want to read the three options at all. It prevents the Welcome screen from becoming a mandatory decision tax.

**Why three equal buttons, not a hidden mode:**
Recruiter Mode is easy to miss if it's buried in a menu — the brief is explicit that recruiters shouldn't have to explore to find it. Surfacing it at the same visual weight as the other two paths, right at the door, means the highest-intent, lowest-time-budget visitor (a recruiter skimming twenty portfolios) sees their fast path in the first two seconds.

**Motion:** panel arrives with a soft scale+fade (spring-like easing, no bounce/overshoot — restrained, not playful). Buttons have a subtle glass-highlight hover state (matches window/dock hover language established in Foundations).

**Exit transitions:**
- → Guided Tour: panel dissolves, desktop resolves into focus, first tour beat begins (see Section 4).
- → Explore Freely: panel dissolves, desktop resolves into focus, full desktop is immediately interactive, no overlay guidance.
- → Recruiter Mode: panel cross-fades directly into the Recruiter Mode layout (does not require passing through the full desktop first — this keeps the fast path fast).

---

## 4. Guided Tour

**Purpose:** narrative walkthrough of the story — About → Work → Projects → Skills → Experience → Education → Achievements → Contact — delivered *through* the OS metaphor, not as a slideshow bolted on top of it.

**Mechanism:** rather than a modal carousel, the tour drives the OS itself:
- Each tour step opens (or focuses) a relevant "app" window on the desktop — e.g. the About step opens an About window; the Projects step opens a Projects window/Finder-style grid; the Contact step opens a Contact card.
- A persistent, minimal glass tour-bar (bottom or top-adjacent, not blocking content) shows:
  - Current step label (e.g. "2 of 8 — Work")
  - Back / Next controls
  - **Skip Tour** — always visible, always one click, drops the visitor into Free Exploration at their current point (the window that's open stays open — no jarring reset)
- Windows opened during the tour behave like real windows (draggable, closable) — a curious visitor can go off-script mid-tour by just interacting with the desktop; the tour bar stays present but doesn't force them back on track. This satisfies "must be able to skip at any point" more gracefully than a hard exit — it's skippable *and* interruptible.

**Sequence (8 steps):**
1. About — who I am
2. Work — what I do (role/focus framing)
3. Projects — selected case studies
4. Skills — frontend/UI/UX capabilities
5. Experience — work history
6. Education
7. Achievements
8. Contact — resume, GitHub, LinkedIn, direct contact

**Completion state:** final step ends with the tour bar offering "Explore Freely" and "Back to Welcome" — never a dead end.

---

## 5. Free Exploration

**Purpose:** the memorable, demonstrative core of the portfolio — visitors use a working desktop OS.

**No imposed structure.** The visitor has:
- Menu bar (system-level actions, possibly an "About KrishnaOS" easter-egg menu, Spotlight trigger)
- Dock (pinned apps: About, Projects, Skills, Experience/Resume, Contact, and system-feeling utilities like Settings)
- Desktop icons/widgets (optional, used sparingly — e.g. a "Now Playing"-style widget or a live GitHub-activity widget, only if it earns its place)
- Spotlight-style search (⌘K-equivalent) as a fast alternate path to any content — this is the safety net for "a visitor who's never used macOS should still understand how to navigate": if the metaphor confuses them, search always works.

**Information architecture guarantee:** every piece of required content (skills, projects, experience, education, achievements, resume, GitHub, LinkedIn, contact) must be reachable within 2 clicks from any desktop state — either via Dock icon, Spotlight search, or a persistent "Contact/Resume" menu-bar shortcut. This is the non-negotiable usability floor beneath the OS metaphor.

**Entry points into Free Exploration:**
- Direct from Welcome ("Explore Freely")
- Falling out of the Guided Tour (skip or completion)
- Switching out of Recruiter Mode (see Section 6)

---

## 6. Recruiter Mode

**Purpose:** the express lane. A recruiter should get everything they need without learning the OS metaphor at all.

**Format:** single, scroll-free-if-possible glass "document" view — visually part of KrishnaOS (same material/type language) but structured like a well-designed resume/profile page, not a desktop:
- Name + Frontend Engineer identity + short intro (top, immediately visible)
- Skills (compact, scannable — tags or grouped list, not a deep-dive)
- Experience (condensed timeline)
- Featured projects (2–4 highlights, not the full project catalog)
- Education
- Resume (prominent download/view action)
- GitHub / LinkedIn (icon-linked, always visible)
- Contact (direct action, e.g. email or contact form trigger)

**Escape hatch, not a cage:** a small, low-emphasis affordance ("Curious? Explore the full experience →") lets an intrigued recruiter opt into Free Exploration or the Guided Tour without penalty. This is one-directional generosity — Recruiter Mode never traps someone who wants more, but it also never requires more.

**Entry points into Recruiter Mode:**
- Direct from Welcome
- From the menu bar / a persistent system-level control while in Free Exploration or the Tour (so a recruiter who accidentally chose "Explore Freely" isn't stuck) — this could live as a menu-bar item or Spotlight action ("Switch to Recruiter Mode")

---

## 7. Cross-mode navigation rules

These rules keep the three experiences feeling like one coherent product rather than three disconnected pages:

1. **No mode is a dead end.** Every mode has a visible way to reach the other two.
2. **No progress is silently lost.** Switching from Guided Tour to Free Exploration preserves whatever window/state was open.
3. **Recruiter Mode is always one action away**, from anywhere, via a persistent system-level control (menu bar and/or Spotlight) — not just from the Welcome screen.
4. **Search is a universal escape valve.** Spotlight-style search works identically in Free Exploration and (optionally, in a lighter form) is unnecessary in Recruiter Mode since everything's already on one screen.
5. **Returning to Welcome is always possible** (e.g. a subtle "KrishnaOS" wordmark in the menu bar acts as a home/logo-click affordance), but never required.

---

## 8. Open questions for next pass

- Exact copy/voice for the Welcome panel and tour-bar labels.
- Whether Recruiter Mode should have its own distinct URL/route for direct linking (likely yes — recruiters share links).
- Whether the boot sequence should have a "memory" (skip on repeat visits) tied to localStorage or session only.
- Icon/app roster for the Dock beyond the confirmed content pillars — deferred per brief ("do not invent a huge number of apps yet").

---

*This flow is the reference for the Figma "Flow Map" page — each numbered section above corresponds to one cluster of connected frames.*
