# Editorial Data System — Portable Design Spec

A quiet, newspaper-grade system for data-dense interfaces. The philosophy:
**borders not boxes, color as meaning not decoration, numbers as first-class
typography.** Warm paper background, system fonts, no chrome. Drop these tokens
and conventions into any project (React + Tailwind, or plain CSS) to stay
consistent.

## Files

| File | What it is |
|---|---|
| `design-system.css` | CSS custom properties (tokens) + base document styles + minimal utility classes. **Import this once** at your app entry point. |
| `tailwind.preset.js` | Tailwind preset that aliases the same tokens to semantic class names (`bg-base`, `text-ink`, `border-muted`, …). Optional — only if you use Tailwind. |
| `README.md` | This document — the conventions the files don't enforce on their own. |

### Install (Tailwind project)
```js
// tailwind.config.js
import editorialDataSystem from './design-system/tailwind.preset.js'

export default {
  presets: [editorialDataSystem],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
}
```
```css
/* src/index.css */
@import '../design-system/design-system.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Install (plain CSS project)
```html
<link rel="stylesheet" href="/design-system/design-system.css" />
```
Reference tokens directly: `color: var(--text-muted);` and use the `ds-*`
utility classes (`ds-eyebrow`, `ds-rule`, `ds-cue`, `ds-focus`, …).

---

## 1. Principles

1. **Borders over boxes.** Structure comes from thin hairline separators, not
   cards, fills, or drop shadows. Shadows are reserved for elements that
   genuinely float (tooltips, modals, popovers).
2. **Color is meaning.** Accent colors encode state and direction
   (positive/negative/neutral), never decoration.
3. **Numbers are typography.** Every figure uses tabular numerals and a
   project-wide formatting layer. Consistent number presentation *is* design.
4. **Information hierarchy = ink + muted.** A muted label paired with an ink
   value is the atomic unit of every readout.
5. **Separate layouts beat fluid compromises.** For dense data, ship a
   stacked/card layout for small screens and a true table/grid for large ones.
6. **No layout shift.** Reserve space for conditionally-rendered elements
   (change indicators, async content); pin dimensions so content doesn't jump.
7. **Restraint by default.** Light scheme, system fonts, minimal motion. Add
   weight, not chrome, to create emphasis.

---

## 2. Design Tokens

Defined in `design-system.css`. **Always reference the semantic name, never the
raw value.**

| Token (CSS var) | Tailwind alias | Value | Role |
|---|---|---|---|
| `--bg` | `bg-base` | `#F3ECE4` | Warm paper background |
| `--surface` | `bg-surface` | `#FBF7F2` | Optional raised surface |
| `--text` | `text-ink` | `#1C1C1C` | Primary text, key numbers |
| `--text-muted` | `text-muted` | `#525252` | Labels, hints, **borders** |
| `--accent-negative` | `accent-neg` | `#E84855` | Downward delta, error, destructive |
| `--accent-warning` | `accent-warn` | `#FBAF00` | Caution, pending |
| `--accent-positive` | `accent-pos` | `#5D9878` | Upward delta, success |
| `--accent-neutral` | `accent-neutral` | `#12547D` | Brand/emphasis: links, focus, key figures |
| `--tint-04…50` | `bg-tint-*` | `rgba(28,28,28,α)` | Overlays, gridlines, scrim |

### Color usage rules
| Color | Use for | Never use for |
|---|---|---|
| `ink` | primary text, key numbers | — |
| `muted` | labels, hints, captions, **borders** | key figures |
| `accent-neutral` | links, focus rings, emphasized figures, primary series | directional change |
| `accent-pos` | upward deltas, success, "good" series | static labels |
| `accent-neg` | downward deltas, errors, destructive actions | static labels |
| `accent-warn` | caution, pending, in-review | success/info |
| ink-tints | overlays, scrims, gridlines, subtle fills | text |

- **Overlays come from ink-alpha (`--tint-*`), not the palette** — keeps tints
  neutral against the warm background.
- **Data-series / category colors are data, not theme.** Keep them in a config
  map keyed by entity name; allow per-entity overrides (palette var *or* one-off
  hex); fall back to alternating `accent-neutral` / `accent-pos`.
- **No dark mode** by default (`color-scheme: light`). If needed, mirror every
  token under a `[data-theme="dark"]` block — never hardcode.

---

## 3. Separators & Dividers (the structural backbone)

**Divider color:** always the muted/border token as a hairline. On floating
surfaces use low-opacity ink (`--tint-12` to `--tint-25`).

| Separator | Implementation | When |
|---|---|---|
| **Section divider** | `border-t` / `border-b` in muted, full width | Between major blocks; blocks butt directly together — the rule is the only gap |
| **Grid cell rules** | `border-r` (vertical) + `border-t` (horizontal), muted | Inside metric grids/tables; swap direction when the grid stacks (`border-t md:border-t-0 md:border-r`) |
| **List row dividers** | `divide-y` in muted (`.ds-divide`) | Stacked list/card rows |
| **Table rules** | `border-b` under `thead`, `divide-y` between `tbody` rows | Real tables; header rule heavier than row dividers |
| **Left accent rule** | `border-l-4` accent-neutral + `pl-3 py-2` + tint-05 bg (`.ds-callout`) | Callouts, notices |
| **Gridlines (charts)** | `--tint-12`, horizontal only | Chart backgrounds; axis lines `--tint-25`, tick lines off |
| **Floating-surface border** | `1px solid --tint-25` (`.ds-floating`) | Tooltips/popovers |

**Rules of thumb**
- One weight for structural rules (1px hairline). No second weight for decoration.
- Adjacent sections **share** their rule — never stack `border-b` + `border-t`.
- When a grid reflows row → stacked, **swap rule direction** (vertical →
  horizontal) so separation reads correctly at both breakpoints.

---

## 4. Typography

**Family:** system stack, no web fonts. Base `16px / 1.5`, antialiased,
`optimizeLegibility`, `font-synthesis: none`.

| Role | Suggested classes |
|---|---|
| Display / page title | `text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight` |
| Hero figure (headline number) | `text-5xl md:text-6xl font-bold tabular-nums` |
| Secondary big figure | `text-3xl md:text-5xl font-bold tabular-nums` |
| H2 / modal title | `text-xl md:text-2xl font-semibold` |
| Entity name / prominent label | `text-lg md:text-2xl font-semibold leading-tight` |
| Metric value | `text-xl md:text-2xl font-bold tabular-nums` |
| Section heading (H3) | `text-base md:text-lg font-semibold` |
| Body / table cell | `text-sm` (`md:text-base` for prose) |
| Hint / caption | `text-xs md:text-sm` |
| Micro-label | `text-[10px]` / `text-[11px]` |

**Conventions**
- **Eyebrow labels:** UPPERCASE + `tracking-wider`, micro size, always `muted`
  (`.ds-eyebrow`).
- **`tabular-nums` on every number** — values, deltas, tooltips, cells
  (`.ds-tnum`).
- **Weight ladder:** `bold` (headline numbers, display) → `semibold` (headings,
  names) → `medium` (inline emphasized values, deltas) → normal (body).
- **Ink/muted pairing:** value is `ink`, its label is `muted` — the core readout.

---

## 5. Spacing, Radius & Motion

**Spacing rhythm**
- Section vertical padding: `py-6 md:py-8` (standard block rhythm).
- Inline gaps: `gap-1.5` (label + control), `gap-2`/`gap-3` (value + indicator),
  `gap-6` (major splits).
- Dense cell padding: `px-2 py-3` to `px-3 md:px-5 py-4 md:py-5`.
- Container width/columns are **project-defined** — the system does not mandate
  a single column. Keep the section rhythm and separators consistent.

**Radius scale:** `rounded` (controls, chips, focus) · `rounded-md` (tooltips) ·
`rounded-full` (icon buttons, dots) · `rounded-2xl` (modals, panels).

**Motion** — minimal, fast, state-only:
- `transition: stroke-width 80ms, fill-opacity 80ms` for interactive SVG/map
  (`.ds-interactive`).
- Hover/selection feedback via **border or weight**, not by recoloring
  data-encoded fills.
- No decorative entrance animations.

---

## 6. Components & Patterns

### Change indicator ("DiffCue") — signature pattern
A reusable delta badge.
- Up → `accent-pos` + up-arrow + `+`; Down → `accent-neg` + down-arrow + `−`
  (true minus U+2212, not hyphen).
- Renders **nothing** when delta is zero or no prior value exists.
- Two sizes: `md` (`text-sm`, icon 14) / `sm` (`text-xs`, icon 12), arrow
  `strokeWidth 2.5`. Always `font-medium`, colored, with an `aria-label`.
- **Pair with a fixed-height slot** (`.ds-cue-slot`, `h-4`) wherever it appears
  conditionally, so layout never shifts.

### Metric readout
`muted uppercase micro-label` → `ink bold tabular-nums value` (+ optional change
indicator) → `muted hint`. The universal single-statistic presentation.

### Buttons & controls
- **No heavy filled buttons by default.** Primary actions are text + icon, or
  transparent controls.
- **Selects styled as inline text:** `bg-transparent hover:underline
  cursor-pointer`, paired with a `semibold ink` label.
- **Universal focus ring:** `focus:outline-none focus:ring-2
  focus:ring-accent-neutral rounded` (`.ds-focus`) on *every* focusable element.
- **Touch targets ≥ 44px** for icon-only controls.
- **Collapsibles:** full-width header button, `aria-expanded`, chevron toggle.

### Modal / dialog (reuse the full contract)
- Scrim: `fixed inset-0 z-50` + `--tint-50` + `backdrop-blur-sm` (`.ds-scrim`),
  click-outside closes.
- Panel: `surface`/`base` bg, `rounded-2xl shadow-modal`, `p-5 md:p-7`,
  `max-h-[calc(100dvh-2rem)] overflow-y-auto`, capped width (`md:max-w-2xl`).
- A11y: `role="dialog"` + `aria-modal` + `aria-labelledby`, focus trap (Tab /
  Shift-Tab cycle), Escape to close, focus restoration on close, body
  scroll-lock.

### Tooltip / floating surface
`base` bg + `border --tint-25` + `rounded-md px-3 py-2` + soft shadow
(`.ds-floating`). The sanctioned place for a shadow (it floats).

### Data list ↔ table responsiveness
Same data, two layouts: stacked cards (`md:hidden`, `divide-y`) on mobile; real
`<table>` (`hidden md:block`) with `thead` bottom-rule + `divide-y` rows on
desktop.

### Status dot
`inline-block w-2.5 h-2.5 rounded-full` (`.ds-dot`) filled with the
entity/category color — for legends and inline markers.

---

## 7. Iconography
- One icon library, **sized explicitly** (`16` / `20`), `aria-hidden` when
  decorative.
- Common set: help, close, chevron up/down, arrow up/down (deltas), heart.
- **Brand/logo marks as inline SVG**, scaled to text with `w-[1em] h-[1em]` and
  `fill="currentColor"`.

---

## 8. Number & Date Formatting (a design layer)
Centralize formatters so presentation is identical everywhere. Keep
locale/timezone **configurable per project** — do not hardcode.
- Integer: locale thousands separators.
- Percent: fixed decimals (project default); keep precision *consistent per
  metric type*.
- Signed deltas: explicit `+`/`−`, fixed decimals, with unit suffix where
  relevant.
- Dates: locale + explicit timezone, abbreviated month.
- Rule: a given metric type always renders with the same precision app-wide.

---

## 9. Accessibility Baseline
- `focus:ring-2 focus:ring-accent-neutral` on all interactive elements.
- `aria-label` on icon-only/ambiguous controls; `aria-expanded` on toggles;
  `role="img"` + label on meaningful SVG.
- Full modal contract (trap + Escape + scroll-lock + focus restore).
- ≥44px touch targets where space allows.
- Semantic headings (h1→h2→h3) and real table semantics on desktop.
- Don't rely on color alone — pair delta color with an arrow + sign; pair
  category color with a label.

---

## 10. Quick Reference

```
Background        base            Raised surface  surface
Primary text      ink             Labels/borders  muted
Dividers          border in muted (border-t/-b, divide-y); never doubled
Brand/emphasis    accent-neutral  Focus ring      ring-2 accent-neutral
Up delta          accent-pos      Down delta      accent-neg   Caution  accent-warn
Tints/overlays    rgba(28,28,28,a) via --tint-*   Scrim  --tint-50
Section rhythm    py-6 md:py-8    Eyebrow  text-[11px] uppercase tracking-wider muted
Headline number   text-5xl md:text-6xl font-bold tabular-nums ink
Numbers           ALWAYS tabular-nums + centralized formatter
Radius            rounded . rounded-md . rounded-full . rounded-2xl
Shadows           floating elements ONLY (tooltip, modal)
Motion            80ms, state-only; feedback via border/weight not data-color
```

**Anti-patterns** (the system rejects these): shadowed cards for static content;
decorative color; hover states that recolor data-encoded fills; one fluid table
for all breakpoints; double-stacked borders; numbers without `tabular-nums`;
hardcoded locale/timezone; a second border weight for decoration.
