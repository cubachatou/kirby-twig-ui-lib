---
name: kirby-kui-create-component
description: >
  Scaffold a new UI component in the kirby-twig-ui-lib plugin following the
  established accordion pattern. Use whenever a developer asks to "add a new
  component", "create a [name] block", "scaffold a [name] widget", or "add
  [tabs|modal|carousel|…] to the UI library". Also triggers when the user says
  "follow the same pattern as the accordion" or "create a block like accordion".
  Even if the user only names a UI pattern without saying "component", apply
  this skill to scaffold all required files correctly.
---

# Create Component — KUI

Scaffold a complete new Kirby block component for `site/plugins/kui/`
following the inversion-of-dependency pattern established by the accordion:
stable JS and SCSS base, multiple Twig variants overridable via `{% embed %}`,
JS bound exclusively to `data-*` attributes.

## Inputs

Collect before starting:

| Input          | Example                           | Notes                                                                  |
| -------------- | --------------------------------- | ---------------------------------------------------------------------- |
| `{{SLUG}}`     | `tabs`                            | Lowercase, hyphens OK — used for filenames, CSS classes, blueprint key |
| `{{LABEL}}`    | `Tabs`                            | Human-readable Panel label                                             |
| `{{VARIANTS}}` | `simple`, `with-icons`            | Comma-separated; first is default                                      |
| `{{FIELDS}}`   | `items (structure), label (text)` | Structure of the main data; free-form                                  |

If the request provides all inputs, proceed immediately. If any are missing,
ask for them in a single grouped question before generating any files.

---

## Files to create

For a component with slug `{{SLUG}}` you will create **8 files** plus register it
in `index.php`. Work through them in order.

### 1. Blueprint — block definition

**Path:** `site/plugins/kui/blueprints/blocks/{{SLUG}}.yml`

```yaml
title: {{LABEL}}
icon: # choose a descriptive Kirby icon name
preview: fields
wysiwyg: true

tabs:
  content:
    label: Content
    fields:
      items:
        type: structure
        label: {{LABEL}} Items
        sortable: true
        fields:
          # Add per-item fields here — DO NOT use 'content' as a field name
          # (conflicts with Kirby's content() method on StructureObject).
          # Use 'text', 'body', 'description', etc. instead.
          title:
            type: text
            label: Title
            required: true

      style:
        type: select
        label: Display Style
        default: {{FIRST_VARIANT}}
        width: 1/2
        options:
          # One entry per variant:
          - value: {{FIRST_VARIANT}}
            text: "{{FIRST_VARIANT_LABEL}}"

  settings:
    label: Settings
    fields:
      html_id:
        extends: fields/html_id
        width: 1/2
      css_classes:
        extends: fields/css_classes
        width: 1/2
```

**Rules:**

- Tabs use `fields:` directly under the tab key — NOT `sections: → type: fields:`.
- Never name a structure field `content` — it shadows `StructureObject::content()`.
- Always extend shared field mixins from `blueprints/fields/` rather than repeating definitions.

---

### 2. Base Twig template (internal partial)

**Path:** `site/plugins/kui/snippets/blocks/_{{SLUG}}_base.twig`

```twig
{#
  _{{SLUG}}_base.twig — Base layout (internal partial).

  Expected variables (passed via {% embed %} with {...}):
    items       {StructureCollection}  Items to iterate over.
    wrapper_id  {string}               HTML id for the root element.
    extra_class {string}               Extra CSS classes on the root element.

  Overridable blocks:
    {% block item_header %}  — Trigger/heading inner content.
    {% block item_content %} — Panel/body content.

  JS hook attributes (never rename or remove):
    data-kui-{{SLUG}}          — Root element.
    data-kui-{{SLUG}}-item     — Individual item wrapper.
    data-kui-{{SLUG}}-trigger  — The interactive element (<button> etc.).
    data-kui-{{SLUG}}-panel    — The collapsible/dynamic region.
#}

{% set _id    = wrapper_id  is defined and wrapper_id  ? wrapper_id  : '{{SLUG}}' %}
{% set _extra = extra_class is defined and extra_class ? ' ' ~ extra_class : '' %}

<div
  class="kui-{{SLUG}}{{ _extra }}"
  id="{{ _id }}"
  data-kui-{{SLUG}}
>
  {% for item in items %}
    {% set trigger_id = _id ~ '__trigger-' ~ loop.index %}
    {% set panel_id   = _id ~ '__panel-'   ~ loop.index %}

    <div class="kui-{{SLUG}}__item" data-kui-{{SLUG}}-item>

      <div class="kui-{{SLUG}}__header">
        <button
          class="kui-{{SLUG}}__trigger"
          id="{{ trigger_id }}"
          type="button"
          aria-expanded="{{ loop.first ? 'true' : 'false' }}"
          aria-controls="{{ panel_id }}"
          data-kui-{{SLUG}}-trigger
        >
          {% block item_header %}
            {{ item.title.value }}
          {% endblock %}
        </button>
      </div>

      <div
        class="kui-{{SLUG}}__body"
        id="{{ panel_id }}"
        role="region"
        aria-labelledby="{{ trigger_id }}"
        {% if not loop.first %}hidden{% endif %}
        data-kui-{{SLUG}}-panel
      >
        {% block item_content %}
          <div class="kui-{{SLUG}}__content">
            {{ item.text.kirbytext | raw }}
          </div>
        {% endblock %}
      </div>

    </div>
  {% endfor %}
</div>
```

**Rules:**

- Use `item.text` (or your chosen field name) — never `item.content`.
- All JS hooks are `data-kui-{{SLUG}}-*` — never CSS classes.
- Keep aria attributes: `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`, `hidden`.

---

### 3. Default variant template

**Path:** `site/plugins/kui/snippets/blocks/{{SLUG}}_{{FIRST_VARIANT}}.twig`

```twig
{#
  {{SLUG}}_{{FIRST_VARIANT}}.twig — Default variant.

  Overrides item_header and item_content blocks from the base.
  To add another variant: copy this file, rename it, change only the blocks.
  No changes to _{{SLUG}}_base.twig, {{SLUG}}.js, or _{{SLUG}}.scss needed.
#}

{% set _wrapper_id = block.html_id.isNotEmpty ? block.html_id.value : '{{SLUG}}' %}
{% set _extra_class = block.css_classes.value %}

{% embed '@ui/_{{SLUG}}_base.twig'
	with {
		items: block.items.toStructure(),
		wrapper_id: _wrapper_id,
		extra_class: _extra_class
	}
%}
	{% block item_header %}
		{{- item.title.value -}}
	{% endblock %}
	{% block item_content %}
		<div class="kui-{{ SLUG }}__content">
			{{ item.text.kirbytext|raw }}
		</div>
	{% endblock %}
{% endembed %}
```

---

### 4. Additional variant templates

For each extra variant (e.g., `with-icons`):

**Path:** `site/plugins/kui/snippets/blocks/{{SLUG}}_{{VARIANT}}.twig`

Same structure as the default variant — only the block bodies differ. Add BEM
modifier classes to `extra_class` if needed:

```twig
{% embed '@ui/_{{SLUG}}_base.twig'
	with {
		items: block.items.toStructure(),
		wrapper_id: _wrapper_id,
		extra_class: _extra_class ~ ' kui-{{SLUG}}--{{VARIANT}}'
	}
%}
	{% block item_header %}
		{# Variant-specific header markup — icon, image, etc. #}
	{% endblock %}
	{% block item_content %}
		{# Variant-specific content wrapper #}
	{% endblock %}
{% endembed %}
```

---

### 5. Dispatcher template

**Path:** `site/plugins/kui/snippets/blocks/{{SLUG}}.twig`

```twig
{#
  {{SLUG}}.twig — Variant dispatcher.

  Reads the `style` field and delegates to the correct variant template.
  Adding a new variant: add its value to the blueprint style select and a new
  branch here. No other files need changing.
#}

{% set style = block.style.value %}

{% if style == '{{SECOND_VARIANT}}' %}
	{% include '@ui/{{SLUG}}_{{SECOND_VARIANT}}.twig' %}
{% else %}
	{% include '@ui/{{SLUG}}_{{FIRST_VARIANT}}.twig' %}
{% endif %}
```

Adjust the branches to match your actual variant count. Use `{% include %}` (not
`{% embed %}`) in the dispatcher — the embed happens inside each variant file.

---

### 6. SCSS partial

**Path:** `site/plugins/kui/src/scss/_{{SLUG}}.scss`

```scss
// =============================================================================
// _{{SLUG}}.scss — BEM styles for the {{LABEL}} component.
//
// Structure mirrors the HTML:
//   .kui-{{SLUG}}
//   └─ .kui-{{SLUG}}__item         (data-kui-{{SLUG}}-item)
//      ├─ .kui-{{SLUG}}__header
//      │  └─ .kui-{{SLUG}}__trigger  (data-kui-{{SLUG}}-trigger, <button>)
//      └─ .kui-{{SLUG}}__body      (data-kui-{{SLUG}}-panel)
//         └─ .kui-{{SLUG}}__content
// =============================================================================

@use 'tokens' as *;

// ── Block ─────────────────────────────────────────────────────────────────────
.kui-{{SLUG}} {
  width: 100%;
  font-family: $font-family-base;
}

// ── Item ──────────────────────────────────────────────────────────────────────
.kui-{{SLUG}}__item {
  border-bottom: $border-width solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

// ── Header / Trigger ──────────────────────────────────────────────────────────
.kui-{{SLUG}}__header {
  display: flex;
  align-items: center;
}

.kui-{{SLUG}}__trigger {
  display: flex;
  align-items: center;
  width: 100%;
  padding: $space-md $space-lg;
  background: none;
  border: none;
  cursor: pointer;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: var(--foreground);
  text-align: left;
  transition: background-color $transition-fast;

  &:hover {
    background-color: var(--accent);
  }

  &:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: -2px;
  }
}

// ── Body / Panel ──────────────────────────────────────────────────────────────
.kui-{{SLUG}}__body {
  overflow: hidden;

  // Hidden state — driven by the `hidden` attribute toggled by JS.
  &[hidden] {
    display: none;
  }
}

.kui-{{SLUG}}__content {
  padding: $space-md $space-lg $space-lg;
  color: var(--foreground);
  line-height: $line-height-base;
}
```

**Rules:**

- Import `tokens` with `@use 'tokens' as *` — never `@import`.
- **Color values: always use CSS custom properties (`var(--token)`), never `$color-*` SCSS variables.** The full token set is defined in `_root.scss` following the shadcn/ui convention. Key tokens:
  - `var(--background)` / `var(--foreground)` — default surface and text
  - `var(--accent)` / `var(--accent-foreground)` — hover / active surface
  - `var(--border)` — all borders and dividers; `var(--input)` — form control borders
  - `var(--muted-foreground)` — placeholder text, captions, muted icons
  - `var(--ring)` — focus outlines (`outline: 2px solid var(--ring)`)
  - `var(--destructive)` — error / danger states
- Non-color build-time values (`$space-*`, `$font-*`, `$border-width`, `$border-radius-*`, `$transition-*`) remain SCSS variables from `_tokens.scss`.
- Never use JS-bound selectors (`[data-*]`) in SCSS — those attributes are for JS only.
- State-driven styling uses the HTML attribute (`[hidden]`, `[aria-expanded]`) not JS-added classes.

---

### 7. JavaScript module

**Path:** `site/plugins/kui/src/js/{{SLUG}}.js`

```js
/**
 * {{SLUG}}.js — {{LABEL}} widget module.
 *
 * Queries elements via data-* attributes only — never CSS class names.
 * Strategy hooks (onOpen/onClose) allow callers to inject custom behaviour
 * without modifying this file.
 *
 * Required HTML attributes:
 *   data-kui-{{SLUG}}          — root element
 *   data-kui-{{SLUG}}-trigger  — <button> with aria-expanded + aria-controls
 *   data-kui-{{SLUG}}-panel    — collapsible region, toggled via `hidden`
 */

/**
 * @typedef {Object} {{LABEL_PASCAL}}Config
 * @property {string}   [triggerSelector='[data-kui-{{SLUG}}-trigger]']
 * @property {string}   [panelSelector='[data-kui-{{SLUG}}-panel]']
 * @property {boolean}  [allowMultipleOpen=false]
 * @property {Function} [onOpen]   Called after a panel opens. (trigger, panel) => void
 * @property {Function} [onClose]  Called after a panel closes. (trigger, panel) => void
 */

export class {{LABEL_PASCAL}} {
    /**
     * @param {HTMLElement}         root
     * @param {{{LABEL_PASCAL}}Config} [config]
     */
    constructor(root, config = {}) {
        this.root = root;
        this.config = {
            triggerSelector: '[data-kui-{{SLUG}}-trigger]',
            panelSelector:   '[data-kui-{{SLUG}}-panel]',
            allowMultipleOpen: false,
            onOpen:  null,
            onClose: null,
            ...config,
        };
        this._boundHandleClick = this._handleClick.bind(this);
    }

    /** Attach event listeners. Returns `this` for chaining. */
    init() {
        this._getTriggers().forEach((trigger) => {
            trigger.addEventListener('click', this._boundHandleClick);
        });
        return this;
    }

    /** Remove all listeners added by init(). Safe to call multiple times. */
    destroy() {
        this._getTriggers().forEach((trigger) => {
            trigger.removeEventListener('click', this._boundHandleClick);
        });
    }

    _getTriggers() {
        return this.root.querySelectorAll(this.config.triggerSelector);
    }

    _handleClick(event) {
        const trigger = event.currentTarget;
        const panelId = trigger.getAttribute('aria-controls');
        if (!panelId) return;

        const panel = this.root.querySelector(`#${CSS.escape(panelId)}`);
        if (!panel) return;

        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            this._close(trigger, panel);
        } else {
            if (!this.config.allowMultipleOpen) this._closeAll(trigger);
            this._open(trigger, panel);
        }
    }

    _open(trigger, panel) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.removeAttribute('hidden');
        if (typeof this.config.onOpen === 'function') {
            this.config.onOpen(trigger, panel);
        }
    }

    _close(trigger, panel) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('hidden', '');
        if (typeof this.config.onClose === 'function') {
            this.config.onClose(trigger, panel);
        }
    }

    _closeAll(activeTrigger) {
        this._getTriggers().forEach((trigger) => {
            if (trigger === activeTrigger) return;
            const panelId = trigger.getAttribute('aria-controls');
            if (!panelId) return;
            const panel = this.root.querySelector(`#${CSS.escape(panelId)}`);
            if (panel) this._close(trigger, panel);
        });
    }
}

/**
 * Initialize all [data-kui-{{SLUG}}] roots on the page.
 * @param {{{LABEL_PASCAL}}Config} [config]
 * @returns {{{LABEL_PASCAL}}[]}
 */
export function init{{LABEL_PASCAL}}s(config = {}) {
    return Array.from(document.querySelectorAll('[data-kui-{{SLUG}}]')).map(
        (root) => new {{LABEL_PASCAL}}(root, config).init()
    );
}
```

---

### 8. Wire into existing entry files

**`src/scss/main.scss`** — add one `@use` line:

```scss
@use "{{SLUG}}";
```

**`src/js/main.js`** — add import and DOMContentLoaded call:

```js
import { init{{LABEL_PASCAL}}s } from './{{SLUG}}.js';

document.addEventListener('DOMContentLoaded', () => {
    init{{LABEL_PASCAL}}s();
});
```

---

### 9. Register in `index.php`

Add entries to the `'blueprints'` and `'snippets'` arrays in
`site/plugins/kui/index.php`:

```php
// In 'blueprints':
'blocks/{{SLUG}}'             => __DIR__ . '/blueprints/blocks/{{SLUG}}.yml',

// In 'snippets':
'blocks/{{SLUG}}'                       => __DIR__ . '/snippets/blocks/{{SLUG}}.twig',
'blocks/{{SLUG}}_{{FIRST_VARIANT}}'     => __DIR__ . '/snippets/blocks/{{SLUG}}_{{FIRST_VARIANT}}.twig',
// (repeat for each additional variant)
'blocks/_{{SLUG}}_base'                 => __DIR__ . '/snippets/blocks/_{{SLUG}}_base.twig',
```

---

## Checklist before finishing

- [ ] No structure field is named `content` (use `text`, `body`, `description`, …)
- [ ] All JS hooks are `data-kui-{{SLUG}}-*` attributes — no CSS class selectors in JS
- [ ] All Twig cross-file references use `@ui/` namespace, not relative paths
- [ ] SCSS imports `tokens` with `@use 'tokens' as *`
- [ ] Blueprint tabs use `fields:` directly — no `sections:` wrapper
- [ ] Both new keys are added to `index.php` blueprints AND snippets arrays
- [ ] `main.scss` and `main.js` import/call the new component
- [ ] `initExampleWrappers` in `assets/js/main.js` lists the component's root CSS class in the `PREVIEW_CLASSES` array (e.g. `"kui-badge"`) — required for the live preview + code card wrapper to appear on the doc page
- [ ] `content/2_components/N_{{SLUG}}/{{SLUG}}.txt` created with realistic demo blocks and `Template: {{SLUG}}` + `Uuid: doc-{{SLUG}}`
- [ ] Kirby cache cleared after creating the content file (`find site/cache -name "*.cache" -delete`)

---

## Canonical reference: the accordion component

When in doubt, look at the accordion implementation as the ground truth:

| Role               | File                                                         |
| ------------------ | ------------------------------------------------------------ |
| Blueprint          | `site/plugins/kui/blueprints/blocks/kui-accordion.yml`       |
| Base template      | `site/plugins/kui/snippets/blocks/_kui-accordion_base.twig`  |
| Default variant    | `site/plugins/kui/snippets/blocks/kui-accordion_simple.twig` |
| Dispatcher         | `site/plugins/kui/snippets/blocks/kui-accordion.twig`        |
| SCSS               | `site/plugins/kui/src/scss/_accordion.scss`                  |
| JS module          | `site/plugins/kui/src/js/accordion.js`                       |
| Registration       | `site/plugins/kui/index.php`                                 |
| Doc page blueprint | `site/blueprints/pages/accordion.yml`                        |
| Doc page template  | `site/templates/accordion.twig`                              |
| Doc page content   | `content/2_components/1_accordion/accordion.txt`             |

---

### Doc-site custom color overrides

When the doc page demonstrates `extra_class` color variants (e.g. `badge--blue`), define those classes in `assets/scss/main.scss` using a **compound selector** that includes the component's root class:

```scss
// ✓ Correct — compound selector wins over .kui-badge--{variant} even when plugin CSS loads after doc CSS
.kui-badge.badge--blue   { background-color: oklch(30% 0.10 264); ... }

// ✗ Wrong — single class has equal specificity; plugin CSS loaded later will override it
.badge--blue             { background-color: oklch(30% 0.10 264); ... }
```

Also add light-mode inversions inside the `:root[data-theme='light'] { }` block using the same compound selector.

### Destructive variant style

All components that expose a `destructive` variant must use the **same soft-tint pattern** — a transparent-mixed background with the full `--destructive` color as text:

```scss
&--destructive {
	background-color: color-mix(in oklab, var(--destructive) 20%, transparent);
	color: var(--destructive);
	// button also sets: border-color: transparent;
	// button hover:     background-color: color-mix(in oklab, var(--destructive) 30%, transparent);
}
```

The `--destructive` CSS custom property is defined in `site/plugins/kui/src/scss/_root.scss` for both light and dark themes:

```scss
:root {
	--destructive: oklch(0.577 0.245 27.325); // light
}
:root[data-theme="dark"] {
	--destructive: oklch(0.704 0.191 22.216); // dark
}
```

Do **not** use a SCSS `$color-*` variable for destructive — all color values are CSS custom properties. When adding a new element or component with a destructive variant, follow this soft-tint rule so all destructive elements look consistent.

---

## Doc page — scaffold the documentation page

Every new component needs a documentation page. Create these three files.

### Page blueprint

**Path:** `site/blueprints/pages/{{SLUG}}.yml`

```yaml
title: { { LABEL } }
icon: code

sections:
  content:
    type: fields
    fields:
      title:
        type: text
        required: true
      excerpt:
        type: text
        label: Excerpt
        help: Short description shown in search results and meta description.
      intro:
        type: writer
        label: Intro
        help: Lead paragraph beneath the title. 1–2 sentences.
        marks:
          - bold
          - italic
          - code
          - link

      usage:
        type: blocks
        label: Usage
        help: Short connection snippet. Renders before Examples on the doc page.
        fieldsets:
          - heading
          - text
          - code
          - list

      # Add one `demo_*` field per named example variant (Basic, Multiple, etc.)
      # For snippets (no Kirby block): omit demo_* fields; put Examples in body.
      demo:
        type: blocks
        label: "Example — Basic"
        help: Renders live on the doc page.
        fieldsets:
          - { { SLUG } }

      body:
        type: blocks
        label: Body
        help: Extending, API Reference, Blueprint fields, Accessibility sections.
        fieldsets:
          - heading
          - text
          - code
          - list
          - table
          - quote
```

### Doc page template

**Path:** `site/templates/{{SLUG}}.twig`

Canonical section order — **Usage → Examples → Extending → API Reference → Blueprint fields → Accessibility**:

```twig
{% extends '@docs/layout.twig' %}

{% block page_title %}
	{{ page.title }} — Kirby UI Library
{% endblock %}
{% block page_description %}
	{{ page.excerpt }}
{% endblock %}

{% block content %}
	{# ── 1. Component header ─────────────────────────────────────────── #}
	<div class="mb-14">
		<h1 class="mb-4 text-[2.25rem] font-extrabold leading-none tracking-tight text-doc-bright">{{ page.title }}</h1>
		{% if page.intro.isNotEmpty %}
			<div class="doc-intro">
				{{ page.intro|raw }}
			</div>
		{% endif %}
	</div>

	{# ── 2. Usage — installation and basic usage blocks ──────────────── #}
	{% if page.usage.isNotEmpty %}
		<section id="usage" class="mb-14 scroll-mt-20">
			<h2 class="doc-heading">Usage</h2>
			{{ page.usage.toBlocks|raw }}
		</section>
	{% endif %}

	{# ── 3. Examples — live component blocks from Kirby panel fields ─── #}
	<section id="examples" class="mb-14 scroll-mt-20">
		<h2 class="doc-heading">Examples</h2>

		{% if page.demo.isNotEmpty %}
			<h3 class="doc-subheading">Basic</h3>
			<p class="doc-lead">
				A standard {{ LABEL }} with default settings.
			</p>
			<div class="doc-demo">
				{{ page.demo.toBlocks|raw }}
			</div>
		{% endif %}

		{# Add more {% if page.demo_*.isNotEmpty %} blocks for each named example #}
	</section>

	{# ── 4. Body blocks — Extending, API Reference, Blueprint fields, A11y #}
	{{ page.body.toBlocks|raw }}
{% endblock %}
```

**Doc CSS classes** (for body block content):

- `doc-heading` — h2 section heading
- `doc-subheading` — h3 example sub-heading
- `doc-lead` — introductory paragraph beneath a heading
- `doc-demo` — live component preview wrapper
- `doc-intro` — lead paragraph below the page h1
- `doc-prose` — prose text container
- `doc-code` — code block wrapper
- `doc-table` — table wrapper

### Usage field content

The `usage` field is intentionally short — one note + one or two code blocks:

- **For blocks** (Kirby block components): reference to [Installation guide](/getting-started/installation), then add-to-blueprint YAML, then render-blocks Twig snippet.
- **For snippets** (Twig partials): reference to Installation guide, then the `{% include '@ui/_snippet.twig' with {...} %}` call.

Do NOT put embed/override patterns in Usage — those belong in the Extending section of the body.

### Body section order

When editing body blocks in the panel, follow this order:

1. **Extending** (h2) — how to override Twig, SCSS without forking; JS strategies only if the component has JavaScript
2. **API Reference** (h2) — JS class/config options, or snippet parameters
3. **Blueprint fields** (h2) — block blueprint field reference table (blocks only; omit for snippets)
4. **Accessibility** (h2) — ARIA attributes, keyboard, focus ring notes

> **Always include the Blueprint fields section** — it is required for the "On this page" sidebar to list it and for users to understand Panel field mapping. Do not skip it.

**JS strategies in Extending** — include only when the component ships its own JavaScript module:

- **Strategy 1 — Class Extension**: import the JS class from `site/plugins/kui/src/js/{slug}.js`, subclass it, and override private methods (`_open`, `_close`, `_selectItem`, etc.). Load CSS only via `snippet('kui/assets', { js: false })` to prevent double-init.
- **Strategy 2 — Eject**: don't import the plugin JS at all — write your own. The `data-kui-{slug}-*` attribute contract is the stable public API and will not change between versions. Load CSS only via `snippet('kui/assets', { js: false })` and bind whatever logic you need.

Components/snippets with **no JS module** must not include these strategies.

### Content file

**Path:** `content/2_components/N_{{SLUG}}/{{SLUG}}.txt`

Replace `N` with the next sequential number in the `content/2_components/` folder (list the folder to find it). This file is the flat-file content Kirby reads to render the doc page — **without it the page does not exist and will not appear in the site or panel**.

Format rules:

- Fields are separated by `\n\n----\n\n` (a blank line, four dashes, a blank line).
- Each block field value is a JSON array on a **single line** — no embedded newlines.
- Block objects: `{"content":{...},"id":"unique-id","isHidden":false,"type":"{{SLUG}}"}`.
- Toggle values inside block content JSON: `"true"` or `"false"` (strings, not booleans).
- Always include `Template: {{SLUG}}` and `Uuid: doc-{{SLUG}}` at the end.

Minimal required fields (add `demo_*` for each example defined in the blueprint):

```
Title: {{LABEL}}

----

Excerpt: One-line description shown in search results and meta.

----

Intro: <p>Lead paragraph shown beneath the page title.</p>

----

Usage: [{"content":{"text":"<p>Requires the plugin installed and the <code>@ui</code> Twig namespace registered — see the <a href=\"/getting-started/installation\">Installation guide</a>.</p>"},"id":"{{SLUG}}-usage-note","isHidden":false,"type":"text"},{"content":{"code":"fields:\n  blocks:\n    type: blocks\n    fieldsets:\n      - {{SLUG}}","language":"yaml"},"id":"{{SLUG}}-usage-bp","isHidden":false,"type":"code"},{"content":{"code":"{{ page.blocks.toBlocks|raw }}","language":"twig"},"id":"{{SLUG}}-usage-render","isHidden":false,"type":"code"}]

----

Demo: [{"content":{...block fields...},"id":"{{SLUG}}-demo-basic","isHidden":false,"type":"{{SLUG}}"}]

----

Body: []

----

Template: {{SLUG}}

----

Uuid: doc-{{SLUG}}
```

For the `demo_*` fields, pre-populate each with a realistic block that shows that example variant. Use the accordion's `content/2_components/1_accordion/accordion.txt` as the canonical format reference.

#### Body field — required section structure

The `Body` field must always include the following sections in this order. Use Kirby `heading` type blocks (not inline HTML inside `text` blocks) for all h2/h3/h4 headings so they are picked up correctly by the TOC.

**Extending** (h2) — four h3 sub-sections:

- Structure — add a new variant
- Fields — add custom Panel fields
- Styles — override or extend
- JavaScript — extending behaviour

**API Reference** (h2) — these h3 sub-sections in order:

1. **Initialization** — description + code block showing `init{{Label}}(config)`
2. **Options** — `table` block with columns `Option | Type | Default | Description`
3. **Data attributes** — intro text + `table` block with columns `Attribute | Element | Description`. List every `data-kui-{{SLUG}}-*` attribute used by the JS. Intro text: `<p>These attributes are set by the Twig template and read by the JavaScript initialiser. Do not rename or remove them; the JS uses them as selectors and state hooks.</p>`
4. **CSS classes** — `table` block with columns `Class | Element | Notes` (lowercase "classes")

**Blueprint fields** (h2, not h3) — intro text + `table` block with columns `Field | Type | Default | Description`. This section is at h2 level, outside and after the API Reference h2.

**Accessibility** (h2) — two `text` blocks:

1. Intro paragraph: `<p>WCAG 2.1 AA. The attributes below are set automatically; you do not need to add them to templates or configure them in the panel.</p>`
2. A `<ul>` list with `<li><p><strong>Category:</strong> detail.</p></li>` items covering: Keyboard navigation, ARIA, Focus management, No-JS fallback (if applicable).

All Options / Data attributes / CSS classes / Blueprint fields sections **must** use Kirby `table` type blocks — never prose paragraphs listing items.

---
