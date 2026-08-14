# Styling System

## The token file: `apps/client/src/index.css`

Everything visual in this project traces back to one `@theme` block at the
top of `index.css`. This is Tailwind v4's CSS-first config mechanism (see
`02-tech-stack.md` for why v4 over v3) — instead of a `tailwind.config.js`
JS object, tokens are declared as CSS custom properties inside `@theme`:

```css
@theme {
  --color-os-bg: #0a0a0c;
  --color-os-accent: #0a84ff;
  --spacing-os-4: 16px;
  --radius-os-lg: 20px;
  --text-os-body: 14px;
  /* ...etc */
}
```

Two things happen from this one declaration:

1. **It's a real CSS custom property** — usable anywhere as
   `var(--color-os-accent)`, including in inline styles or plain CSS.
2. **Tailwind generates a matching utility class** — `--color-os-accent`
   becomes usable as `bg-os-accent`, `text-os-accent`, `border-os-accent`,
   etc.; `--spacing-os-4` becomes `p-os-4`, `gap-os-4`, `m-os-4`, etc.

That's the entire point of using v4 here: **one declaration, two consumption
paths, zero duplication.** In v3 you'd either maintain the JS config and CSS
variables separately, or pick just one and lose the other's benefit.

## Naming convention: the `os-` prefix

Every token is prefixed `os-` (`--color-os-bg`, not `--color-bg`). This is
deliberate namespacing — it makes every KrishnaOS-specific token
visually distinct from Tailwind's own built-in scale (`bg-blue-500`,
`p-4`, etc.) at a glance, both in the CSS file and in JSX className strings.
If you see `os-` in a class name, it's a project-specific design token, not
a Tailwind default.

## Theme overrides in CSS

The base `@theme` block defines the defaults, but the actual runtime theme is
now driven by `data-os-theme` on the root element:

```css
[data-os-theme='light'] { /* lighter surfaces, text, and shadows */ }
[data-os-theme='dark'] { /* deeper surfaces and higher contrast glass */ }
```

This lets the shell switch Light, Dark, and System themes without swapping
component class names. The same components keep rendering; only the CSS
variables and theme-scoped overrides change.

## Token categories

| Category | Prefix | Example | Used for |
|---|---|---|---|
| Surface & glass | `--color-os-*` | `--color-os-glass`, `--color-os-glass-border` | Backgrounds, the glass-panel material |
| Text | `--color-os-text-*` | `--color-os-text-primary/secondary/tertiary` | Text color hierarchy (see below) |
| Accent | `--color-os-accent*` | `--color-os-accent`, `--color-os-accent-hover` | Interactive/brand color (buttons, focus rings) |
| Spacing | `--spacing-os-*` | `--spacing-os-4` (16px) | Padding, gap, margin — 4px base scale |
| Radius | `--radius-os-*` | `--radius-os-lg` (20px) | Border radius, sm→full |
| Type | `--text-os-*`, `--font-os-sans` | `--text-os-body` (14px) | Font sizes, font family stack |
| Motion | `--ease-os-*` | `--ease-os-spring-soft` | Easing curves — referenced by GSAP/Framer Motion configs, not raw CSS transitions |

**Text color has three tiers on purpose** — `primary` (fully opaque),
`secondary` (70% opacity), `tertiary` (45% opacity) — rather than one flat
white. This mirrors how macOS itself uses opacity, not distinct colors, to
create text hierarchy (headline vs. supporting text vs. disabled/muted text).
Using opacity of the *same* base color rather than three unrelated grays
keeps everything visually related even as the underlying background changes
(glass panels sit on varying backdrops).

## ⚠️ These are placeholder values

Every value in the current `@theme` block was picked to be *reasonable and
functional*, not final. The plan (from the original coding prompt) is to
replace every single one with an exact export from the Figma design system
once that's finalized, keeping the **names** identical so no component code
needs to change — only the token *values* get swapped.

**If you're building new UI:** use the existing token names
(`bg-os-glass`, `text-os-body`, `p-os-4`, etc.), never hardcode a raw
hex/px value in a component. When Figma tokens are finalized, updating
`index.css` should be the *only* file that needs to change to reskin the
whole app.

## The `.glass-panel` utility class

```css
.glass-panel {
  background: var(--color-os-glass);
  border: 1px solid var(--color-os-glass-border);
  border-radius: var(--radius-os-lg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  box-shadow:
    0 8px 32px rgb(0 0 0 / 0.35),
    inset 0 1px 0 var(--color-os-glass-highlight);
}
```

This is a plain CSS class, not a Tailwind utility, because it's a **composite
pattern** — five properties working together to create one visual effect
(the "Liquid Glass" material) — not a single-property utility like `p-4`.
Defining it once here and applying `className="glass-panel"` wherever glass
material is needed (Welcome panel, boot sequence panel, mode placeholders)
means the glass *look* stays perfectly consistent, and if the recipe needs
to change (e.g. adjusting blur intensity project-wide), there's exactly one
place to edit.

**The four layers that make up the glass effect, and why each exists:**
1. **`background` (8% white)** — the base tint. Very low opacity because
   glass should read as "barely there," letting the blurred content behind
   it carry most of the visual weight.
2. **`border` (12% white)** — a hairline edge. Without this, a glass panel
   with a similarly-toned background behind it can visually disappear.
3. **`backdrop-filter: blur(24px) saturate(180%)`** — the actual glass
   blur. `saturate(180%)` is doing real work here, not just decoration — it
   boosts the color intensity of whatever's blurred behind the panel, which
   is what makes the blur read as "frosted glass over a vibrant scene"
   rather than "gray smudge." This mirrors how Apple's own material system
   behaves.
3. **`-webkit-backdrop-filter`** — Safari (and older WebKit-based browsers)
   needed the vendor-prefixed property historically; kept for broader
   compatibility even though modern Safari also supports the unprefixed
   version.
4. **`box-shadow` (two layered shadows)** — an outer drop shadow (depth,
   separation from what's behind) plus an `inset` highlight along the top
   edge (mimics a light catching the top of a physical glass surface).

The same pattern is reused for the theme-aware wallpaper and mobile shell
surfaces, but with slightly lower blur/opacity on smaller screens so the
look stays crisp without punishing weaker GPUs.

## Performance note: `backdrop-filter` is expensive

The coding prompt flags this explicitly (Phase 7, item 17): `backdrop-filter`
is GPU-intensive, especially with multiple glass panels stacked or animating
simultaneously. This hasn't been profiled yet (that's a Phase 7 task), but
it's worth knowing now: if you're building a screen with several
`.glass-panel` elements overlapping or animating at once, that's a candidate
for a performance check on mid-tier hardware before considering the feature
done.

The current shell also uses `prefers-reduced-motion` to shorten or remove
animations when the user asks for less motion, which keeps the visual style
intact without forcing every transition to run at full intensity.

## `body { overflow: hidden }`

One more deliberate rule in `index.css`:

```css
body {
  overflow: hidden; /* the OS shell owns scroll regions, not the page */
}
```

This is intentional and will matter a lot once the OS shell (Phase 3) is
built: KrishnaOS is meant to feel like an actual operating system, not a
scrolling webpage. The browser page itself should never scroll — instead,
*individual windows* will have their own internal scroll regions once the
window manager exists. If you ever find yourself needing the whole page to
scroll for a new feature, that's a signal something is being built outside
the OS metaphor, not a signal to remove this rule.
