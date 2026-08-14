# KrishnaOS — Development Kickoff Prompt (MERN Stack)

Use this as the master prompt to hand to yourself, a teammate, or an AI coding agent (Claude Code, etc.) to begin implementation. It translates the finished vision + UX flow into a concrete build plan.

---

## 0. Project framing (paste this as context first)

> I'm building KrishnaOS — a personal portfolio website disguised as a macOS-inspired operating system. The site opens with a Mac-style boot sequence, into a Liquid Glass welcome screen, into a fully interactive desktop environment (menu bar, dock, draggable windows, apps, Spotlight search) that contains my actual portfolio content. There are three entry paths from Welcome: a Guided Tour, Free Exploration, and a fast single-screen Recruiter Mode. This is my flagship frontend engineering project — the build quality and interaction polish matter as much as the content. Stack is MERN (MongoDB, Express, React, Node), TypeScript throughout, with Framer Motion + GSAP for animation. I'm attaching the UX flow document as the source of truth for navigation logic.

---

## 1. Stack decisions

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **React 18 + TypeScript + Vite** | Vite for fast dev iteration; TS is non-negotiable for a "flex your frontend skills" flagship project |
| Styling | **Tailwind CSS** + CSS variables for design tokens | Tailwind for velocity, CSS custom properties to mirror the Figma variable structure (color, spacing, radius tokens) 1:1 so design and code stay in sync |
| Animation — UI/micro-interactions | **Framer Motion** | Best-in-class for React component-level motion: window open/close, glass panel transitions, hover states, drag |
| Animation — Boot sequence timeline | **GSAP (+ ScrollTrigger only if needed later)** | Framer Motion is great for component state transitions; GSAP's timeline API gives more precise, filmic control over the scripted multi-beat boot sequence (logo fade → progress → blur reveal) |
| Glass/blur effects | **CSS `backdrop-filter`** with layered fallback | Native browser blur — performant, matches the Figma effect-style layering (blur + shadow + inner highlight) |
| Window management | Custom hook/context (**not** a third-party window-manager lib) | This is a core "flex" piece — build your own draggable/resizable/z-index window system in React; use `react-rnd` or `@dnd-kit` only for the low-level drag math if you want to save time, but own the window-state architecture yourself |
| Search (Spotlight) | Custom component + **Fuse.js** for fuzzy matching | Lightweight fuzzy search over your content index, no need for a heavy search service at this scale |
| State management | **Zustand** | Minimal boilerplate, ideal for OS-level state (open windows, active mode, tour step, z-index stack) without Redux ceremony |
| Backend | **Node.js + Express + TypeScript** | Matches MERN, TS for shared types with frontend via a shared `types` package |
| Database | **MongoDB (Atlas)** | Stores contact form submissions and — if you want the backend to do real work — a lightweight content collection (projects, experience entries) so content isn't hardcoded in components |
| API layer | **REST** (simple, small surface) — skip GraphQL, it's overhead this project doesn't need | Keep backend surface area small and clean; depth of frontend > breadth of backend here |
| Hosting | Frontend: **Vercel**. Backend: **Render/Railway**. DB: **MongoDB Atlas** | Standard, free-tier-friendly MERN deployment split |
| Fonts | **SF Pro / SF Pro Rounded** (as used in Figma) — confirm licensing for web use; fallback to **Inter** if SF Pro web-license isn't available | Apple doesn't formally license SF Pro for general web use — verify before shipping, or substitute Inter/Geist which are open and visually close |

---

## 2. Architecture overview

```
krishnaos/
├── apps/
│   ├── client/                 # React + Vite + TS frontend
│   │   ├── src/
│   │   │   ├── app/            # App shell, routing, providers
│   │   │   ├── boot/           # Boot sequence (GSAP timeline)
│   │   │   ├── welcome/        # Liquid Glass welcome screen
│   │   │   ├── os/             # Core OS shell
│   │   │   │   ├── menu-bar/
│   │   │   │   ├── dock/
│   │   │   │   ├── window-manager/   # Custom window system (context + hooks)
│   │   │   │   ├── spotlight/        # Search overlay
│   │   │   │   └── desktop/          # Wallpaper, icons, widgets
│   │   │   ├── apps/            # "Applications" that render inside windows
│   │   │   │   ├── about/
│   │   │   │   ├── projects/
│   │   │   │   ├── skills/
│   │   │   │   ├── experience/
│   │   │   │   ├── education/
│   │   │   │   ├── achievements/
│   │   │   │   └── contact/
│   │   │   ├── tour/            # Guided tour controller + tour-bar UI
│   │   │   ├── recruiter/       # Recruiter Mode single-screen view
│   │   │   ├── tokens/          # Design tokens as CSS vars / TS constants
│   │   │   ├── lib/             # Fuse.js index, API client, utils
│   │   │   └── store/           # Zustand stores (windowStore, modeStore, tourStore)
│   │   └── ...
│   └── server/                  # Express + TS backend
│       ├── src/
│       │   ├── routes/          # /api/contact, /api/content
│       │   ├── models/          # Mongoose schemas
│       │   ├── controllers/
│       │   └── index.ts
│       └── ...
├── packages/
│   └── shared-types/            # Shared TS interfaces (Project, Experience, ContactPayload, etc.)
└── README.md
```

**Why a monorepo-ish split even without full tooling (Turborepo/Nx optional):** keeps frontend/backend cleanly separated while sharing types, which is itself a small "flex" — type-safe contracts across the stack.

---

## 3. Core systems to build, in order

This order is deliberate: build the *shell* before the *content*, since the shell (window manager, dock, menu bar) is the actual engineering showcase.

### Phase 1 — Foundation
1. Design tokens as CSS variables (mirror the Figma Color/Spacing/Radius/Type scales exactly)
2. Base layout shell, routing (`/`, `/recruiter`, maybe deep-linkable app routes)
3. Zustand stores: `useModeStore` (welcome/tour/free/recruiter), `useWindowStore` (open windows, z-index, position, size)

### Phase 2 — Boot & Welcome
4. Boot sequence component (GSAP timeline, the 6 beats from the UX doc) with skip logic + `localStorage` "seen before" flag
5. Liquid Glass Welcome screen: blurred backdrop + glass panel + 3 equal-weight entry buttons (Framer Motion spring entrance)

### Phase 3 — OS Shell
6. Menu bar (system-feel, includes persistent "Recruiter Mode" switch + KrishnaOS logo-as-home)
7. Dock (icon row, magnification-on-hover micro-interaction, click → opens window)
8. Window Manager: draggable, resizable, closable, focus/z-index handling, minimize (even if minimize just closes for v1 — don't over-scope)
9. Spotlight search overlay (Fuse.js fuzzy search across all content, keyboard-triggered)

### Phase 4 — Apps (content windows)
10. About, Projects, Skills, Experience, Education, Achievements, Contact — each as a window-hosted component
11. Contact form wired to Express `/api/contact` → MongoDB, with real validation and a success/error state (this is your legitimate backend-flex moment)

### Phase 5 — Guided Tour
12. Tour controller (Zustand `useTourStore`): step index, opens/focuses the right window per step, tour-bar UI with Back/Next/Skip
13. Wire tour skip → Free Exploration with state preserved (per UX doc rule #2)

### Phase 6 — Recruiter Mode
14. Single-screen glass "document" view, same design tokens, condensed content, resume/GitHub/LinkedIn/contact all visible without scrolling if possible
15. Escape hatch link out to Free Exploration

### Phase 7 — Polish pass
16. Micro-interactions audit (hover states, transition easing consistency)
17. Performance pass: blur is GPU-expensive — profile `backdrop-filter` usage, especially with multiple stacked glass layers, on mid-tier hardware
18. Accessibility pass: keyboard navigation through the OS (this is a good showcase point, not just a checkbox — tab order through dock/windows/spotlight)
19. Responsive fallback messaging (mobile isn't in scope yet per the brief, but the desktop-only build should show a clean "best viewed on desktop" state on small viewports rather than a broken layout)

---

## 4. Starter prompt (paste into Claude Code / your coding agent)

```
I'm starting a new MERN + TypeScript project called KrishnaOS — a macOS-inspired
personal portfolio. Set up the initial monorepo structure:

- apps/client: React 18 + TypeScript + Vite + Tailwind CSS
- apps/server: Node + Express + TypeScript + Mongoose
- packages/shared-types: shared TS interfaces

Install and configure: Framer Motion, GSAP, Zustand, Fuse.js, react-rnd (or @dnd-kit,
your call on which is cleaner for a custom window-manager).

Set up:
1. Tailwind config with a custom theme extending colors/spacing/radius using CSS
   variables (I'll provide exact token values from my Figma design system).
2. Basic Express server with a health-check route and Mongoose connection to
   MongoDB Atlas (use env var MONGODB_URI).
3. A `shared-types` package exporting placeholder interfaces: Project, Experience,
   EducationEntry, Achievement, ContactPayload.
4. Client-side routing skeleton (React Router) with routes for `/` (main OS
   experience) and `/recruiter` (direct-linkable Recruiter Mode).
5. A `useWindowStore` (Zustand) skeleton: openWindows[], focusedWindowId,
   openWindow(id), closeWindow(id), focusWindow(id), with z-index management.

Don't build any visual UI yet — just get the scaffolding, tooling, and state
architecture correct and running (`npm run dev` should boot both client and
server concurrently). I'll provide the design tokens and first screen (boot
sequence) next.
```

---

## 5. Content data model (for `shared-types` + MongoDB)

```typescript
interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  role: string;
  stack: string[];
  links: { live?: string; github?: string; caseStudy?: string };
  featured: boolean; // true = shown in Recruiter Mode
  media?: { type: 'image' | 'video'; url: string }[];
}

interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string | 'present';
  highlights: string[];
}

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date?: string;
  link?: string;
}

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}
```

Keep `featured: boolean` on `Project` — this is exactly how Recruiter Mode's "2–4 featured projects" filters from the same data source as the full Projects app, so you're not duplicating content.

---

## 6. Things to decide before Phase 2 (carried over from the UX doc's open questions)

- Final copy/voice for Welcome panel and tour-bar labels
- Confirm SF Pro web licensing, or lock in Inter/Geist as the fallback now rather than mid-build
- Whether boot-skip memory is `localStorage` (persists across sessions) or `sessionStorage` (resets per browser session) — recommend `sessionStorage` so repeat visits days later still get the "wow" moment, but same-session navigation doesn't replay it
- Dock icon roster beyond the confirmed content pillars (Settings app? A widget?) — decide only once Phase 3 is underway, don't scope-creep Phase 1

---

*Reference: `krishnaos-ux-flow.md` for full navigation logic this build must satisfy.*
