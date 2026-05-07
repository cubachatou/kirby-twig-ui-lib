---
name: Kirby UI Library
description: Self-contained accessible Kirby CMS blocks — semantic markup, CSS-agnostic JS, zero framework opinions.
colors:
  surface: "oklch(14% 0.003 255)"
  surface-hover: "oklch(21% 0.004 255)"
  border: "oklch(28% 0.005 255)"
  text: "oklch(90% 0.004 255)"
  text-muted: "oklch(54% 0.005 255)"
  focus-ring: "oklch(57.311% 0.21458 258.263)"
  focus-ring-hover: "oklch(39.107% 0.16074 260.151)"
  destructive: "oklch(59.013% 0.20533 26.197)"
  destructive-hover: "oklch(52.301% 0.19793 27.578)"
doc-site-colors-dark:
  doc-bg: "oklch(10.5% 0.003 255)"
  doc-surface: "oklch(15% 0.004 255)"
  doc-surface-2: "oklch(19% 0.004 255)"
  doc-border: "oklch(27% 0.005 255)"
  doc-border-sub: "oklch(19% 0.003 255)"
  doc-text: "oklch(88% 0.004 255)"
  doc-bright: "oklch(94% 0.003 255)"
  doc-muted: "oklch(65% 0.005 255)"
  doc-accent: "oklch(57% 0.22 264)"
  doc-accent-dim: "oklch(18% 0.06 264)"
doc-site-colors-light:
  doc-bg: "#ffffff"
  doc-surface: "#f8f8f8"
  doc-surface-2: "#f0f0f0"
  doc-border: "#d4d4d4"
  doc-border-sub: "#e8e8e8"
  doc-text: "#1a1a1a"
  doc-bright: "#000000"
  doc-muted: "#6b6b6b"
  doc-accent: "#0070f3"
  doc-accent-dim: "#e5f0ff"
typography:
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.6
rounded:
  sm: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  accordion-trigger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "0"
    padding: "16px 24px"
  accordion-trigger-hover:
    textDecoration: underline
    textUnderlineOffset: "3px"
    textColor: "{colors.text}"
  accordion-trigger-expanded:
    textColor: "{colors.text}"
  accordion-body:
    backgroundColor: "{colors.surface}"
    padding: "16px 24px 24px"
    animation: "grid-template-rows 220ms ease"
  accordion-body-rich:
    backgroundColor: "{colors.surface-hover}"
    padding: "24px 24px 24px"
    animation: "grid-template-rows 220ms ease"
---

# Design System: Kirby UI Library

## 1. Overview

**Creative North Star: "The Calm Instrument"**

This system is the scaffolding other people's designs sit on. It has no visual opinions of its own. The aesthetic is achieved through restraint: system fonts, neutral surfaces, a single accent color that exists only because accessibility requires it. Nothing is added for visual interest. Nothing is removed for cleverness.

Every decision traces back to the same question: what does the component need to communicate its state? An accordion is open or closed. The trigger label underlines on hover. The chevron rotates 180 degrees on expand. The panel animates open with a smooth CSS grid height transition (220ms ease). That's it. There are no shadows for depth, no gradient fills for emphasis, no motion choreography for delight. The system behaves predictably because it does less than expected, not more.

The doc-website that documents this plugin is a separate design layer from the plugin itself. The plugin uses SCSS with BEM; the doc-site uses Tailwind v4. Both are dark-mode-first — the plugin's SCSS tokens use a cool-tinted near-black oklch palette (hue 255), and the doc-site mirrors this approach with its own `--color-doc-*` custom properties. The doc-site provides a toggleable light mode (`oklch(10.5% 0.003 255)` default dark, with hex-based light overrides) while the plugin's tokens are dark-first.

**Key Characteristics:**

- Restrained color strategy: five neutrals + one accessibility-functional accent, used in two lightness steps
- Zero shadows; depth via border stack and a one-step background tint
- System font stack — no web fonts loaded anywhere in the plugin
- State lives in the DOM (`aria-expanded`, `hidden` attribute), not in CSS class names
- BEM selects visually (`.kui-accordion__trigger`); data attributes select behaviorally (`[data-kui-accordion-trigger]`) — the two never cross
- Doc-site is dark-mode-first; `<html data-theme="dark">` is set before first paint via inline `<script>`, with `localStorage` persistence and `prefers-color-scheme` fallback

## 2. Colors: The Functional Palette

The palette is deliberately non-expressive. Dark cool-tinted neutrals (hue 255) handle all surfaces, borders, and text. The focus-ring blue is infrastructure, not brand.

### Focus / Interactive

- **`$color-focus-ring`** (`oklch(57.311% 0.21458 258.263)`): Used exclusively for focus rings (`outline: 2px solid`) and the rich variant's content-inner left border. Never a background fill. Never a button color. Its presence on screen means keyboard focus or structured editorial content; its absence is a guarantee of neither.
- **`$color-focus-ring-hover`** (`oklch(39.107% 0.16074 260.151)`): Deeper value for high-contrast focus and hover contexts.

### Destructive

- **`$color-destructive`** (`oklch(59.013% 0.20533 26.197)`): Semantic red for irreversible actions. Used as the destructive button fill and invalid-state border on form controls.
- **`$color-destructive-hover`** (`oklch(52.301% 0.19793 27.578)`): Darker hover step for destructive elements.

### Neutral

- **`$color-surface`** (`oklch(14% 0.003 255)`): Default component background. Near-black with a cool hue bias.
- **`$color-surface-hover`** (`oklch(21% 0.004 255)`): Alternate surface. Trigger background on hover and rich variant panel background. One lightness step up from `$color-surface` — enough to signal state change without a chromatic shift.
- **`$color-border`** (`oklch(28% 0.005 255)`): All borders. One weight, one value, used consistently as the component wrapper border and item dividers.
- **`$color-text`** (`oklch(90% 0.004 255)`): All body text and trigger labels. Near-white for contrast against dark surfaces.
- **`$color-text-muted`** (`oklch(54% 0.005 255)`): Secondary text, muted states. The rich variant icon sits here at rest before shifting to `$color-focus-ring` on expand.

### Named Rules

**The Functional Accent Rule.** `$color-focus-ring` is accessibility infrastructure, not brand expression. It appears on focus rings and the rich variant's content-inner structural accent. It is never a background fill, never a call-to-action color, never decorative. If the focus-ring blue is visible, something interactive is in focus or structured editorial content is being highlighted.

**The One-Step Tint Rule.** State change is expressed by shifting exactly one surface step: `$color-surface` to `$color-surface-hover`. No color-coded states, no traffic-light hues, no saturation shifts. Hovered/open is `$color-surface-hover`. Default is `$color-surface`. That's the full color vocabulary of state.

## 3. Typography

**Body Font:** system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
**Label/Semibold:** Same stack, weight 600.

**Character:** Invisible by intent. The system-ui stack renders in the OS's preferred sans-serif. There is no typographic fingerprint — no distinctive letterforms, no loaded cultural associations. This is correct. The plugin is a scaffold; the consumer's brand provides the type identity.

### Hierarchy

- **Body** (400, 1rem / 16px, lh 1.6): All accordion panel content. Line height 1.6 provides breathing room for longer descriptions without requiring explicit paragraph spacing.
- **Label** (600, 1rem / 16px, lh 1.6): Accordion trigger text. Same size as body — hierarchy is weight contrast alone, not scale. Avoids the over-engineered trigger that looks like a heading.
- **Small** (400, 0.875rem / 14px, lh 1.6): Supporting UI text where reduced scale is needed (helper text, metadata).

### Named Rules

**The No Web Font Rule.** The plugin never loads an external font file. No `@font-face`, no Google Fonts import, no variable font bundle. Every consumer's brand adds their own type on top; the plugin defers to the OS rather than imposing.

**The Weight-Not-Scale Rule.** Hierarchy within components is expressed through font-weight contrast (400 vs. 600), not font-size steps. Trigger labels and body text share 1rem; the label's semibold weight is the only signal of elevated status.

## 4. Elevation

Flat by design. No component in this library uses `box-shadow`. Depth is expressed through two mechanisms only:

1. **Border stack:** The accordion wrapper carries a full-perimeter 1px `$color-border` border with `border-radius-lg` (8px). Item separators use the same 1px rule internally. The border defines the component boundary without suggesting it floats above the page.
2. **Surface tint:** The shift from `$color-surface` (`oklch(14% 0.003 255)`) to `$color-surface-hover` (`oklch(21% 0.004 255)`) on trigger hover and expand conveys state change. A 7-step lightness delta — perceptible without being chromatic.

### Named Rules

**The Flat-by-Default Rule.** No component in this library uses `box-shadow`, at rest, on hover, or as a focus indicator. Focus is a `2px solid $color-focus-ring outline` with `-2px` offset (inset — never shifts surrounding layout). State is a background tint. Shadow = not here.

## 5. Components

### Accordion

The accordion is the library's first block. Both variants share the same JS, the same data-\* hook surface, and the same accessibility wiring. Visual differences are CSS only — swapping a variant never requires touching JavaScript.

**Outer wrapper:**

- No perimeter border — the accordion is an open list, not a boxed card
- Items are separated by `border-b: 1px $color-border`; the last item omits its bottom border (`:last-child { border-bottom: none }`)

---

**Simple variant** (default — `kui-accordion--simple` or no modifier):

- Trigger hover: label underlines (`text-decoration: underline; text-underline-offset: 3px`). No background shift.
- Trigger label: `$color-text`, 600 weight, 1rem, left-aligned
- Trigger padding: 16px top/bottom, 24px left/right
- Trigger chevron: CSS `::after` pseudo-element (SVG data URI, 1.25em square). Purely decorative; never a JS hook. Rotates `−180deg` when `aria-expanded="true"`, 220ms ease.
- Focus ring: `outline: 2px solid $color-focus-ring; outline-offset: −2px`. Inset, never shifting layout.
- Panel: `$color-surface` background; animated via CSS `grid-template-rows: 0fr → 1fr` (220ms ease). JS sets `data-state="open"|"closed"` on the panel; `hidden` attribute is only present before JS initialises (no-JS fallback). Panel inner wrapper (`__body-inner`) has `overflow: hidden; min-height: 0` to enable the grid collapse.
- Padding: 16px top / 24px left / 24px right / 24px bottom.

---

**Rich variant** (`.kui-accordion--rich`):

Everything above, plus:

- Optional image (`.kui-accordion__image`): max 480px wide, 6px radius, `object-fit: cover`, `loading="lazy"`
- Inline icon (`.kui-accordion__icon`): SVG in the trigger, `$color-text-muted` at rest. On `[aria-expanded="true"]`: shifts to `$color-focus-ring` and rotates 45deg, 220ms ease. Conveys "this has more content" without a second chevron.
- Panel background: `$color-surface-hover` (alt surface instead of `$color-surface`)
- Content inner (`.kui-accordion__content-inner`): 3px left border in `$color-focus-ring`, 8px top/bottom / 16px left/right padding. This is a structural editorial accent within the panel body — a reading-rail marker for rich formatted content, not a card decoration.

---

**JS API** (`accordion.js`):

- Constructor: `new Accordion(rootElement, config?)`
- Config keys: `triggerSelector` (default `[data-kui-accordion-trigger]`), `panelSelector` (default `[data-kui-accordion-panel]`), `allowMultipleOpen` (default: read from `data-kui-accordion-multiple` attribute on root, else `false`), `onOpen(trigger, panel)`, `onClose(trigger, panel)`
- `allowMultipleOpen` can also be toggled per-block in the Kirby panel (Settings tab). The block template writes `data-kui-accordion-multiple` on the root element when enabled.
- JS sets `data-state="open"|"closed"` on each panel; CSS `grid-template-rows` transition reads this attribute. The `hidden` attribute is only present server-side before JS initialises; `init()` removes it and seeds the `data-state` values.
- `destroy()` fully reverses initialization — removes all event listeners
- CSS-agnostic: JS never reads or writes class names

**Data-attribute hooks:**

| Attribute                | Element     | Role                        |
| ------------------------ | ----------- | --------------------------- |
| `data-kui-accordion`         | wrapper     | JS initializes on this root |
| `data-kui-accordion-item`    | each item   | scopes open/close logic     |
| `data-kui-accordion-trigger` | `<button>`  | click target                |
| `data-kui-accordion-panel`   | body region | toggled with `hidden`       |

**Aria wiring:**

| Attribute         | Element | Value                |
| ----------------- | ------- | -------------------- |
| `aria-expanded`   | trigger | `"true"` / `"false"` |
| `aria-controls`   | trigger | panel ID             |
| `role="region"`   | panel   | semantic region      |
| `aria-labelledby` | panel   | trigger ID           |

---

**Doc-site token system (Tailwind v4):**

The doc-site uses Tailwind v4's `@theme {}` block in `assets/css/main.css` to define CSS custom properties that Tailwind maps to utility classes. Dark mode values live in `@theme {}`; light mode overrides live in `:root[data-theme="light"] {}`. The `data-theme` attribute on `<html>` is the single switch.

```css
/* assets/css/main.css — dark defaults */
@theme {
	--color-doc-bg: oklch(10.5% 0.003 255);
	--color-doc-surface: oklch(15% 0.004 255);
	--color-doc-surface-2: oklch(19% 0.004 255);
	--color-doc-border: oklch(27% 0.005 255);
	--color-doc-border-sub: oklch(19% 0.003 255);
	--color-doc-text: oklch(88% 0.004 255);
	--color-doc-bright: oklch(94% 0.003 255);
	--color-doc-muted: oklch(65% 0.005 255);
	--color-doc-accent: oklch(57% 0.22 264);
	--color-doc-accent-dim: oklch(18% 0.06 264);

	/* Ring — focus indicator, decoupled from accent (shadcn/ui pattern) */
	--color-doc-ring: oklch(57% 0.22 264);

	/* Input — form-control border, separate from generic dividers */
	--color-doc-input: oklch(27% 0.005 255);

	/* Radius scale — one token per semantic size (shadcn/ui pattern) */
	--doc-radius-xs: 3px; /* code pills, kbd, tiny badges */
	--doc-radius-sm: 4px; /* small interactive controls */
	--doc-radius-md: 6px; /* panels, code blocks, tables, nav items */
	--doc-radius-lg: 8px; /* cards, example wrappers, demo surfaces */
	--doc-radius-xl: 10px; /* large floating surfaces (search panel) */
}

/* Light mode — maps to plugin design tokens for visual continuity */
:root[data-theme="light"] {
	--color-doc-bg: #ffffff;
	--color-doc-surface: #f8f8f8;
	--color-doc-surface-2: #f0f0f0;
	--color-doc-border: #d4d4d4;
	--color-doc-text: #1a1a1a;
	--color-doc-muted: #6b6b6b;
	--color-doc-accent: #0070f3;
	--color-doc-accent-dim: #e5f0ff;
	--color-doc-ring: #0070f3;
	--color-doc-input: #d4d4d4;
}
```

**Three patterns extracted from shadcn/ui's token model:**

**Ring vs. Accent separation.** shadcn/ui separates `--ring` (focus outline color) from `--accent` (interactive hover surface). Both currently share the same value in this project, but having them as distinct tokens means you can independently tune focus visibility without changing interactive-accent hue. All `focus-visible` outlines in the doc-site CSS use `--color-doc-ring`; all decorative accent usage (active nav state, link color, dot bullets) uses `--color-doc-accent`.

**Input vs. Border separation.** shadcn/ui separates `--input` (form control edge) from `--border` (generic divider). The search trigger uses `--color-doc-input`; structural dividers (sidebar, TOC, code block wrappers) use `--color-doc-border`. Same value initially — the semantic separation allows them to drift independently as the design evolves.

**Radius scale.** shadcn/ui derives its entire radius scale from a single `--radius` base token. This project uses explicit named sizes instead of derived calc() (the radius values don't need to be fluid — they're fixed design choices). Five tokens replace 29 hardcoded `px` values scattered through the CSS; changing `--doc-radius-md` from 6px to 8px would update all panels, tables, nav items, and code blocks simultaneously.

In Tailwind v4, these vars are consumed directly as `bg-doc-bg`, `text-doc-muted`, `border-doc-border`, etc. — no `tailwind.config.js` needed. The blue-tinted hue (255) in dark mode avoids dead-grey; the light mode values deliberately echo the plugin's own palette, so plugin components embedded on doc pages feel at home.

---

**Doc-site layout (3-column grid):**

```
┌────────────────────────────────────────────────────────────┐
│  .doc-header (sticky, 3.5rem, full width)                  │
├──────────────┬──────────────────────────┬──────────────────┤
│ .doc-sidebar │     .doc-content         │    .doc-toc      │
│   15rem      │        1fr               │    14rem         │
│ sticky, left │   grid-area: content     │ sticky, right    │
│ nav tree     │   padding: 2.5rem 0      │ h2 scroll-spy    │
├──────────────┴──────────────────────────┴──────────────────┤
│  max-width: 90rem; margin-inline: auto; padding-inline: 1.5rem │
└────────────────────────────────────────────────────────────┘
```

Responsive breakpoints:

- **≤ 1024px**: 1-column, TOC hidden, sidebar becomes a fixed slide-in drawer (`transform: translateX(-100%)` → 0 on `[data-sidebar-open]`), hamburger shown
- **1025–1280px**: 2-column (sidebar + content), TOC hidden
- **≥ 1281px**: Full 3-column

---

**Doc-site components:**

| Component      | Class / ID            | Behavior                                                                                                                                                                              |
| -------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header         | `.doc-header`         | Sticky, `backdrop-filter: blur(8px)`, 3.5rem height                                                                                                                                   |
| Logo           | `.doc-logo`           | Accent-colored SVG + text, links to `/`                                                                                                                                               |
| Search trigger | `.doc-search-trigger` | Opens `#doc-search-overlay`; Cmd/Ctrl+K also opens                                                                                                                                    |
| Theme toggle   | `.doc-theme-toggle`   | Toggles `data-theme` on `<html>`, persists to `localStorage('ui-lib-theme')`                                                                                                          |
| Hamburger      | `.doc-hamburger`      | Mobile only; toggles `data-sidebar-open` on `.doc-outer`                                                                                                                              |
| Sidebar        | `.doc-sidebar`        | Sticky left panel; Kirby page-tree driven                                                                                                                                             |
| Nav group      | `.doc-nav-group`      | One per site section (Getting Started, Components, …)                                                                                                                                 |
| Nav item       | `.doc-nav-item`       | Active state: `.doc-nav-item--active` + `aria-current="page"`                                                                                                                         |
| TOC            | `.doc-toc`            | Auto-populated from `h2[id]` and `h3[id]` in `#doc-content` via JS; h3s nest as `.doc-toc-sublist` under their parent h2 `<li>`                                                       |
| TOC link       | `.doc-toc-list a`     | Scroll-spy: `[data-toc-active]` via `IntersectionObserver` on all h2/h3; h2 links `0.875rem`, h3 links `0.8125rem`                                                                    |
| Example card   | `.doc-example`        | Auto-assembled by `initExampleWrappers` JS: wraps consecutive `.button` siblings + adjacent `.doc-code` into a card with `.doc-example-preview` (dark bg) on top and code block below |
| Search modal   | `#doc-search-overlay` | `role="dialog"`, `hidden` attribute; client-side filter                                                                                                                               |
| Search index   | `#doc-search-index`   | `<script type="application/json">` embedded in `<head>`, generated by Twig from page tree                                                                                             |
| Code block     | `.doc-code`           | Prism.js Tomorrow theme (CDN); copy button always visible, uses Lucide SVG copy icon, toggles to check SVG on success; light mode uses GitHub Light Prism token overrides in CSS      |
| Badge          | `.doc-badge`          | Small uppercase label for component metadata                                                                                                                                          |

---

**Doc-site JS modules (in `assets/js/main.js`):**

1. **Dark mode** — reads `localStorage('ui-lib-theme')` / `prefers-color-scheme` inline before paint (in `layout.twig`), `[data-theme-toggle]` button applies `document.documentElement.setAttribute('data-theme', …)`.
2. **Search** — parses `#doc-search-index` JSON, filters on `input` event, renders results as `<a class="doc-search-result">` links with section/title/excerpt. Opened by `[data-search-open]` or Cmd/Ctrl+K; closed by Escape or backdrop click.
3. **TOC** — collects `h2[id]` and `h3[id]` from `#doc-content`; nests each `h3` as a `.doc-toc-sublist` inside its preceding h2 `<li>`; `IntersectionObserver` with `rootMargin: '0px 0px -70% 0px'` drives `[data-toc-active]` on the matching link.
4. **Mobile sidebar** — `[data-sidebar-toggle]` toggles `data-sidebar-open` on `.doc-outer`, `[data-sidebar-backdrop]` and Escape close it.
5. **initExampleWrappers** — walks all `.doc-code` blocks in `#doc-content` (skipping `.doc-demo`); for each, collects consecutive preceding `.button` siblings (walk backwards); wraps buttons in `.doc-example-preview` and the pair in `.doc-example`. Handles multiple adjacent buttons (e.g. icon-before + icon-after demos sharing one code block).

---

**Kirby / Twig gotcha — `$children` public property:**

Kirby's `HasChildren` trait declares `public Pages|null $children = null;` as a lazy-cache property. Twig resolves the **property** (which is `null` before children are loaded) rather than calling the `children()` method. Using `section.children.listed` in a Twig loop fails with "Impossible to access an attribute on a null variable."

**Fix:** register a `page_children()` custom Twig function in `site/config/config.php`:

```php
'wearejust.twig.env.functions' => [
    'page_children' => function ($page) {
        return $page->children()->listed();
    },
],
```

Then use `page_children(section)` in Twig instead of `section.children.listed`.

## 6. Do's and Don'ts

### Do:

- **Do** use BEM class names (`.kui-accordion__trigger`) for all visual styling in CSS/SCSS — these are the styling surface.
- **Do** use data attributes (`[data-kui-accordion-trigger]`) exclusively for JavaScript selection — the two never cross.
- **Do** use `aria-expanded` + the `hidden` attribute for open/close state. State is semantic, not stylistic.
- **Do** use the `@ui/` Twig namespace prefix for all block snippet includes (`{% embed '@ui/accordion_simple.twig' %}`).
- **Do** use the Twig `{% embed %}` pattern with named blocks (`{% block item_header %}`) for variant-level overrides — zero code duplication.
- **Do** define doc-site tokens as CSS custom properties in Tailwind v4's `@theme {}` block. Use `--color-doc-*` prefix to namespace them away from plugin tokens.
- **Do** enqueue plugin CSS and JS through `snippets/kui/assets.php` — it handles dev (HMR) and production (manifest) automatically.
- **Do** pass `onOpen` / `onClose` callbacks to extend accordion behavior without modifying core JS.
- **Do** use `page_children(page)` custom Twig function when iterating over a Kirby page's children — `page.children` resolves the public `null` property, not the method.
- **Do** set `data-theme` on `<html>` before first paint (inline `<script>` in `<head>`) to avoid flash of wrong theme. Read `localStorage('ui-lib-theme')` first, fall back to `prefers-color-scheme`.
- **Do** give Kirby section folders numeric prefixes (`1_getting-started/`) so `site.children.listed` returns them. The prefix is stripped from the URL.

### Don't:

- **Don't** use class names as JS selection hooks — they break silently when class names are refactored. JS selects `[data-*]` only.
- **Don't** import opinionated visual frameworks (Material UI, Ant Design, Bootstrap) into the plugin or the doc-site — this plugin is deliberately theme-agnostic; heavy framework styles contradict that posture.
- **Don't** add JS framework dependencies (Vue, React, Alpine.js) — the plugin ships vanilla JS and must remain so. Docs should not contradict this.
- **Don't** use gradient text (`background-clip: text` + gradient background). Emphasis is via font weight or size.
- **Don't** use glassmorphism (`backdrop-filter: blur` + semi-transparent backgrounds) as decoration — purposeful and rare, or nothing.
- **Don't** use the hero-metric template (large number, small label, gradient accent card) anywhere in the doc-site.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored decorative stripe on cards or list items. (The `__content-inner` 3px left border is a structural editorial rail inside the accordion panel body — a specific, documented exception.)
- **Don't** add `box-shadow` to plugin components for any reason — state is communicated via background tint and outline, not elevation.
- **Don't** use identical card grids (same-sized cards with icon + heading + text, repeated) in the doc-site layout.
- **Don't** use `section.children.listed` directly in Twig — use `page_children(section)` instead (see Kirby/Twig gotcha above).
- **Don't** synthesize PRODUCT.md or DESIGN.md from the task prompt alone. Run the impeccable teach flow with the actual codebase.
