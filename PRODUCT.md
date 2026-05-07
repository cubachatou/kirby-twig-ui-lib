# Product

## Register

product

## Users

Kirby CMS 5 developers who need pre-built, accessible UI blocks for Twig-based sites. Two modes of use:

1. **Evaluating**: reading the doc site to decide whether the plugin fits their project — checking component quality, accessibility approach, and integration complexity.
2. **Referencing**: already using the plugin; looking up block configuration options, Twig embed patterns, and blueprint field names.

Their context is technical. They are comfortable with PHP, Kirby's template system, BEM CSS, and vanilla JS. They care about clean output, accessibility, and not being locked into opinionated JS frameworks.

## Product Purpose

A reusable Kirby CMS UI component library delivered as a self-contained plugin. It provides:

- **Semantic, accessible blocks** (accordion and more to come) built on Kirby's block system
- **Twig `{% embed %}` pattern** for variant-level template overrides without code duplication
- **CSS-agnostic JS** bound exclusively to `data-*` attributes — works regardless of visual styling or class naming
- **Self-contained Vite asset pipeline** — pre-built CSS/JS committed inside the plugin; consumers don't need to run npm

Success is a developer installing the plugin via Composer and having a working, accessible accordion (or other block) with zero custom JS, in under five minutes.

## Brand Personality

Precise. Pragmatic. Considered.

The plugin does not call attention to itself. It is the scaffold other people's designs sit on. Personality is expressed through quality: clean accessible markup, thoughtful API surface, and docs that don't waste developer time.

References that capture the right feel:

- **Headless UI** (Tailwind Labs) — accessible primitives, no visual opinions, excellent docs
- **Radix UI** — developer-centric, composable, accessibility-first
- **Kirby CMS itself** — friendly but technical, excellent documentation, clean admin UI

## Anti-references

- Heavy, opinionated component libraries that enforce visual style (Material UI, Ant Design) — this plugin is deliberately theme-agnostic
- Marketing-heavy docs sites with hero animations, gradient blobs, or "web3" energy
- Bloated JS frameworks — the plugin ships vanilla JS; docs should not contradict this philosophy

## Design Principles

1. **Practice what you preach** — the doc site uses the same blocks it documents. If a component looks bad in its own documentation, it ships broken.
2. **CSS-agnostic by design** — JS binds to data attributes, never class names. The doc site's visual layer can change without touching logic.
3. **Explicit over implicit** — `@ui/` namespace, BEM, data attributes, named blueprint fields. No magic. Docs reflect this: show the actual code, not abstractions.
4. **Self-contained over coupled** — the plugin is independent of the doc site. Design tokens live inside the plugin; the doc site adapts to what the plugin outputs.
5. **Progressive enhancement** — components render correctly without JS and gain behavior when JS is present. Docs demonstrate this clearly.

## Accessibility & Inclusion

WCAG 2.1 AA minimum. The plugin already implements:

- `aria-expanded`, `aria-controls`, `role="region"` on accordion panels
- `hidden` attribute for panel visibility (CSS-independent state)
- Visible focus rings using `$color-focus-ring` (`oklch(57.311% 0.21458 258.263)`) and `$color-focus-ring-hover` (`oklch(39.107% 0.16074 260.151)`) tokens
- `data-*` hook pattern that does not interfere with AT (assistive technology)

The doc site must meet the same standard as the components it documents.
