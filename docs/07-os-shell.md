# The OS Shell (Phase 3)

## Files involved

- `apps/client/src/os/appRegistry.ts` — the app catalog (single source of truth)
- `apps/client/src/os/desktop/Desktop.tsx` — composes everything below
- `apps/client/src/os/menu-bar/MenuBar.tsx`
- `apps/client/src/os/dock/Dock.tsx`
- `apps/client/src/os/window-manager/WindowManager.tsx`
- `apps/client/src/os/spotlight/Spotlight.tsx`
- `apps/client/src/os/theme/` — wallpaper, theme toggle, and theme-aware shell surfaces
- `apps/client/src/os/widgets/` — desktop/mobile status widgets
- `apps/client/src/lib/searchIndex.ts` — Fuse.js index, now registry-driven

## The app registry: one source of truth for "what apps exist"

Before building the Dock, Spotlight, or window manager, one decision had to
be made first: **where does the list of apps (About, Projects, Skills, etc.)
live?** Four different pieces of UI all need it — the Dock (icons to show),
Spotlight (things to search for), the window manager (what title to put in
a window's title bar), and eventually the guided tour (what to open at each
step).

The wrong answer would be letting each of those four maintain its own copy
of "the app list." That's exactly the kind of duplication that drifts —
add an app to the Dock, forget to add it to Spotlight, and now search can't
find something that's visibly sitting in the Dock.

`os/appRegistry.ts` is the fix: one `APP_REGISTRY` object (keyed by `AppId`)
and one `APP_ORDER` array, and every other file imports from here:

```ts
export type AppId = 'about' | 'projects' | 'skills' | 'experience'
                   | 'education' | 'achievements' | 'contact';

export const APP_REGISTRY: Record<AppId, AppDefinition> = { ... };
export const APP_ORDER: AppId[] = [ ... ];
```

**Why `AppId` is a union of string literals, not just `string`:** this is
the same principle as `TourStepId` in `useTourStore` (see
`docs/03-state-management.md`) — defining the valid app ids as a type means
`useWindowStore.openWindow(id)`, `Dock`, `Spotlight`, and anywhere else that
takes an app id get compile-time protection against typos. Try to call
`openWindow('projcets')` (typo) anywhere in the codebase, and TypeScript
rejects it before you ever run the app.

**Why this stayed scoped to exactly the 7 confirmed content pillars, not
more:** both the UX flow doc and coding prompt explicitly warn against
inventing a large app roster prematurely ("do not invent a huge number of
apps yet"). The registry pattern makes adding a Settings app or a utility
widget later a one-file change — but that's a decision for whoever's
building that feature, deliberately deferred rather than guessed at now.

Phase 7 adds `icon` metadata here as well so Dock, Spotlight, and title bars
can render real glyphs instead of text-only markers, while keeping the app
list itself authoritative in one place.

## `useWindowStore` gets `title` and registry-driven defaults

Phase 1's `useWindowStore` (see `docs/03-state-management.md`) already had
the core open/close/focus/move/resize actions. Phase 3 extended it in two
small but meaningful ways:

**1. `OsWindow.title` was added**, and `openWindow` now pulls it from
`APP_REGISTRY[id].title` automatically — callers don't pass a title, they
just pass an `AppId`, and the window manager always has a correct title to
show without every call site needing to know or repeat it.

**2. Cascade positioning replaced a single fixed default position:**

```ts
const cascadeOffset = (cascadeCount % 6) * CASCADE_STEP;
cascadeCount += 1;
position: opts?.position ?? { x: BASE_POSITION.x + cascadeOffset, y: BASE_POSITION.y + cascadeOffset }
```

Before this, every newly-opened window (with no explicit position) would
land at the exact same `{ x: 120, y: 96 }` — opening three windows in a row
would stack them perfectly on top of each other, with no visual cue that
more than one is even open. The cascade offset (28px per step, wrapping
every 6 windows via `% 6`) mirrors how real desktop OSes stagger new
windows, so each one is at least partially visible and the user can tell
multiple windows exist without needing to drag anything first.

## Window Manager: react-rnd for math, useWindowStore for state

`WindowManager.tsx` renders one `WindowFrame` per entry in
`useWindowStore.openWindows`. Each `WindowFrame` wraps its content in
`react-rnd`'s `<Rnd>` component, which handles:

- Reading `position`/`size` **as controlled props** from the store (not
  react-rnd's own internal state) — `size={{ width: win.size.width, ... }}`
- Reporting drag/resize deltas back **only on drag/resize stop**, not on
  every pixel of movement — `onDragStop`, `onResizeStop` call
  `moveWindow`/`resizeWindow`, which write back to `useWindowStore`

This is the concrete implementation of the split described in
`docs/02-tech-stack.md`'s react-rnd section: react-rnd never "owns" a
window's position or size — `useWindowStore` does, always. React-rnd is
just the pointer-math engine that computes *what the new position/size
should be* while a drag or resize is happening, and reports back once.

**Why `bounds="parent"`:** constrains dragging/resizing so windows can't be
dragged completely off-screen and become unrecoverable without the
`ModePlaceholder`-style "start over" affordance. The parent is
`WindowManager`'s own `absolute inset-0` container, which fills the
available desktop area (below the menu bar, since `Desktop.tsx` stacks
`MenuBar` and `WindowManager` as siblings — see below).

**Why `dragHandleClassName="window-drag-handle"` instead of making the
whole window draggable:** only the title bar should initiate a drag — if
the entire window body were draggable, clicking a button or selecting text
inside a window's content would accidentally start dragging the window.
This is standard desktop-OS behavior, and react-rnd supports it natively
via a CSS class name matched against a child element.

**Traffic-light buttons (close/minimize) call `e.stopPropagation()`:**
without this, clicking the red close button would also trigger the title
bar's own `onMouseDown` (which calls `focusWindow`) and, worse, could be
interpreted as the start of a drag by react-rnd's drag-handle listener.
Stopping propagation ensures "close this window" is exactly one action, not
three overlapping ones.

**Minimize currently just hides the window (`isMinimized: true`, filtered
out of render) — there's no minimized-window tray/indicator yet.** This
matches the coding prompt's explicit scope note for Phase 3: *"minimize
(even if minimize just closes for v1 — don't over-scope)."* A minimized
window's state (position, size) is preserved in the store even though
nothing currently shows it can be reopened — `focusWindow` already clears
`isMinimized`, so the mechanism is ready; only the "how does a user get
back to a minimized window" UI (e.g. a Dock indicator) is deferred.

## Dock

Reads `APP_ORDER` and `APP_REGISTRY` to render one button per app. Two
pieces of live state are reflected per icon:

- **The "open" dot** (`isOpen = openWindows.some(w => w.id === appId)`) —
  mirrors macOS's small dot under a running app's Dock icon.
- **The "focused" highlight** (`isFocused = focusedWindowId === appId`) —
  the currently-focused window's Dock icon gets the accent-color
  background instead of the neutral surface color.

**Clicking a Dock icon always calls `openWindow(appId)`, regardless of
whether that app's window is already open.** This works correctly because
`openWindow` is idempotent (see `docs/03-state-management.md`) — if the
window already exists, `openWindow` just calls `focusWindow` internally
instead of creating a duplicate. The Dock component itself doesn't need an
`if (isOpen) focusWindow() else openWindow()` branch; that logic already
lives in the store, which is exactly the point of centralizing it there.

**Hover magnification (`whileHover={{ y: -8, scale: 1.15 }}`)** is Framer
Motion, not GSAP — this is reactive, per-icon hover state, which is exactly
Framer Motion's strength (see `docs/02-tech-stack.md`), not an authored
timeline.

Phase 7 swaps the text-first markers for theme-aware icons and gives the
mobile shell a tab-bar style dock instead of a miniature desktop dock, so
the same app roster feels native on both screen classes.

## Menu Bar

The smallest component, but it's what makes two of the UX flow doc's §7
cross-mode navigation rules actually true at runtime rather than just
described in a doc:

- **"KrishnaOS" wordmark → `setMode('welcome')`** — satisfies rule 5
  ("returning to Welcome is always possible... via a subtle 'KrishnaOS'
  wordmark in the menu bar").
- **"Switch to Recruiter Mode" button → `setMode('recruiter')` +
  `navigate('/recruiter')`** — satisfies rule 3 ("Recruiter Mode is always
  one action away... via a persistent system-level control").

**Why both `setMode` AND `navigate` are called together:** `setMode` keeps
`useModeStore` internally consistent (so any other UI reading `mode` agrees
Recruiter Mode is active), while `navigate('/recruiter')` actually moves
the browser to the real `/recruiter` route — see
`docs/06-navigation-flow.md`'s explanation of why Recruiter Mode is a
*route*, not just a mode value, for direct-linkability. Calling only one of
the two would leave the app in an inconsistent state (e.g. mode says
"recruiter" but the URL still says `/`).

**`.glass-bar`, not `.glass-panel`, styles the menu bar** — see
`docs/04-styling-system.md`'s existing note on `.glass-panel` being a
*floating panel* recipe (rounded corners, full border, drop shadow). The
menu bar spans edge-to-edge and needed a distinct, simpler variant (no
rounding, only a bottom border) rather than fighting `.glass-panel`'s
styles with utility-class overrides.

Phase 7 keeps that desktop bar but also adds a compact iOS-inspired mobile
variant and a built-in theme toggle, so the top chrome stays recognizable
without pretending the phone view is just a scaled-down monitor.

## Spotlight

The search overlay. Two behaviors worth calling out:

**Global keyboard listener, not scoped to a component:**

```ts
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    const isSpotlightShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
    ...
  }
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

Listening on `window`, not on a specific DOM element, is what makes ⌘K work
*no matter what's focused* — a text field inside an open window, a Dock
button, anywhere. This is the concrete mechanism behind UX doc §7 rule 4
("search is a universal escape valve") — it doesn't just conceptually work
everywhere, the listener is genuinely global.

**Fuse.js instance is memoized per-mount (`useMemo(() => createSearchIndex(), [])`),
not rebuilt on every keystroke.** Only the *search call*
(`fuse.search(query)`) re-runs when `query` changes; building the index
itself (tokenizing every searchable entry) is comparatively expensive and
only needs to happen once, since the underlying app roster doesn't change
during a session.

**Arrow-key navigation + Enter-to-select** is implemented by hand
(`selectedIndex` state, `ArrowUp`/`ArrowDown`/`Enter` handling) rather than
using a browser-native `<select>` or a library — this is standard
command-palette UX (matches real Spotlight, VS Code's command palette,
etc.) and the amount of logic involved (clamping an index, wrapping
selection to hover) is small enough that reaching for a dependency here
would be the kind of unnecessary addition `docs/02-tech-stack.md` argues
against.

## Desktop: composing the shell

```tsx
export function Desktop() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <MenuBar />
      <WindowManager renderAppContent={renderAppContent} />
      <Dock />
      <Spotlight />
    </div>
  );
}
```

Several independent pieces of chrome, stacked as siblings, each reading from
shared Zustand stores rather than passing props down through `Desktop`
itself. `Desktop` doesn't hold any state of its own — it's purely a
composition point. This is deliberate: it means these pieces could be
reordered, or Desktop could be replaced by a different composition (e.g.
the future Tour mode's version, which per the UX doc "drives the OS itself"
rather than getting a separate implementation) without touching the
components themselves.

Phase 7 extends this composition with the theme-aware wallpaper and the
status widget stack, so the shell now feels much closer to a macOS desktop:
top menu bar, glass layers, app dock, real icons, and live widgets.

**`renderAppContent` is passed in as a prop, not imported by
`WindowManager` directly:** this keeps `WindowManager` from needing to know
about every individual app in `apps/*` — it just needs *something* that can
turn an `AppId` into `ReactNode` content. As of Phase 4 that's a real
`switch` over `AppId` returning each app's actual component (`AboutApp`,
`ProjectsApp`, etc.) — see `docs/08-content-apps.md` for the full Phase 4
breakdown. Before Phase 4 this was `renderPlaceholderAppContent`, an honest
"not built yet" stand-in; the swap only touched this one function in
`Desktop.tsx`, exactly as designed — `WindowManager` itself was never
touched.

## `OsRoot` wiring: the real modes now render real content

Before Phase 3, `OsRoot` rendered `ModePlaceholder` for all three non-welcome
modes. Now:

```tsx
{isBootComplete && mode === 'free' && <Desktop />}
{isBootComplete && mode === 'tour' && <Desktop />}
{isBootComplete && mode === 'recruiter' && <RecruiterRoot />}
```

`free` and `tour` both render the real desktop shell, with Tour layering its
controller on top in `OsRoot`. `recruiter` now renders the Phase 6
single-screen glass document view directly. The old full-screen
`ModePlaceholder` is no longer part of the runtime flow.
