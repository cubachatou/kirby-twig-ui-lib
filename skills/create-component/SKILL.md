---
name: kirby-ui-library-create-component
description: >
  Scaffold a new UI component in the kirby-twig-ui-lib plugin following the
  established accordion pattern. Use whenever a developer asks to "add a new
  component", "create a [name] block", "scaffold a [name] widget", or "add
  [tabs|modal|carousel|…] to the UI library". Also triggers when the user says
  "follow the same pattern as the accordion" or "create a block like accordion".
  Even if the user only names a UI pattern without saying "component", apply
  this skill to scaffold all required files correctly.
---

# Create Component — kirby-ui-library

Scaffold a complete new Kirby block component for `site/plugins/ui-library/`
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

**Path:** `site/plugins/ui-library/blueprints/blocks/{{SLUG}}.yml`

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

**Path:** `site/plugins/ui-library/snippets/blocks/_{{SLUG}}_base.twig`

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
    data-{{SLUG}}          — Root element.
    data-{{SLUG}}-item     — Individual item wrapper.
    data-{{SLUG}}-trigger  — The interactive element (<button> etc.).
    data-{{SLUG}}-panel    — The collapsible/dynamic region.
#}

{% set _id    = wrapper_id  is defined and wrapper_id  ? wrapper_id  : '{{SLUG}}' %}
{% set _extra = extra_class is defined and extra_class ? ' ' ~ extra_class : '' %}

<div
  class="{{SLUG}}{{ _extra }}"
  id="{{ _id }}"
  data-{{SLUG}}
>
  {% for item in items %}
    {% set trigger_id = _id ~ '__trigger-' ~ loop.index %}
    {% set panel_id   = _id ~ '__panel-'   ~ loop.index %}

    <div class="{{SLUG}}__item" data-{{SLUG}}-item>

      <div class="{{SLUG}}__header">
        <button
          class="{{SLUG}}__trigger"
          id="{{ trigger_id }}"
          type="button"
          aria-expanded="{{ loop.first ? 'true' : 'false' }}"
          aria-controls="{{ panel_id }}"
          data-{{SLUG}}-trigger
        >
          {% block item_header %}
            {{ item.title.value }}
          {% endblock %}
        </button>
      </div>

      <div
        class="{{SLUG}}__body"
        id="{{ panel_id }}"
        role="region"
        aria-labelledby="{{ trigger_id }}"
        {% if not loop.first %}hidden{% endif %}
        data-{{SLUG}}-panel
      >
        {% block item_content %}
          <div class="{{SLUG}}__content">
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
- All JS hooks are `data-{{SLUG}}-*` — never CSS classes.
- Keep aria attributes: `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`, `hidden`.

---

### 3. Default variant template

**Path:** `site/plugins/ui-library/snippets/blocks/{{SLUG}}_{{FIRST_VARIANT}}.twig`

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
		<div class="{{ SLUG }}__content">
			{{ item.text.kirbytext|raw }}
		</div>
	{% endblock %}
{% endembed %}
```

---

### 4. Additional variant templates

For each extra variant (e.g., `with-icons`):

**Path:** `site/plugins/ui-library/snippets/blocks/{{SLUG}}_{{VARIANT}}.twig`

Same structure as the default variant — only the block bodies differ. Add BEM
modifier classes to `extra_class` if needed:

```twig
{% embed '@ui/_{{SLUG}}_base.twig'
	with {
		items: block.items.toStructure(),
		wrapper_id: _wrapper_id,
		extra_class: _extra_class ~ ' {{SLUG}}--{{VARIANT}}'
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

**Path:** `site/plugins/ui-library/snippets/blocks/{{SLUG}}.twig`

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

**Path:** `site/plugins/ui-library/src/scss/_{{SLUG}}.scss`

```scss
// =============================================================================
// _{{SLUG}}.scss — BEM styles for the {{LABEL}} component.
//
// Structure mirrors the HTML:
//   .{{SLUG}}
//   └─ .{{SLUG}}__item         (data-{{SLUG}}-item)
//      ├─ .{{SLUG}}__header
//      │  └─ .{{SLUG}}__trigger  (data-{{SLUG}}-trigger, <button>)
//      └─ .{{SLUG}}__body      (data-{{SLUG}}-panel)
//         └─ .{{SLUG}}__content
// =============================================================================

@use 'tokens' as *;

// ── Block ─────────────────────────────────────────────────────────────────────
.{{SLUG}} {
  width: 100%;
  font-family: $font-family-base;
}

// ── Item ──────────────────────────────────────────────────────────────────────
.{{SLUG}}__item {
  border-bottom: $border-width solid $color-border;

  &:last-child {
    border-bottom: none;
  }
}

// ── Header / Trigger ──────────────────────────────────────────────────────────
.{{SLUG}}__header {
  display: flex;
  align-items: center;
}

.{{SLUG}}__trigger {
  display: flex;
  align-items: center;
  width: 100%;
  padding: $space-md $space-lg;
  background: none;
  border: none;
  cursor: pointer;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $color-text;
  text-align: left;
  transition: background-color $transition-fast;

  &:hover {
    background-color: $color-surface-alt;
  }

  &:focus-visible {
    outline: 2px solid $color-focus-ring;
    outline-offset: -2px;
  }
}

// ── Body / Panel ──────────────────────────────────────────────────────────────
.{{SLUG}}__body {
  overflow: hidden;

  // Hidden state — driven by the `hidden` attribute toggled by JS.
  &[hidden] {
    display: none;
  }
}

.{{SLUG}}__content {
  padding: $space-md $space-lg $space-lg;
  color: $color-text;
  line-height: $line-height-base;
}
```

**Rules:**

- Import `tokens` with `@use 'tokens' as *` — never `@import`.
- Never use JS-bound selectors (`[data-*]`) in SCSS — those attributes are for JS only.
- State-driven styling uses the HTML attribute (`[hidden]`, `[aria-expanded]`) not JS-added classes.

---

### 7. JavaScript module

**Path:** `site/plugins/ui-library/src/js/{{SLUG}}.js`

```js
/**
 * {{SLUG}}.js — {{LABEL}} widget module.
 *
 * Queries elements via data-* attributes only — never CSS class names.
 * Strategy hooks (onOpen/onClose) allow callers to inject custom behaviour
 * without modifying this file.
 *
 * Required HTML attributes:
 *   data-{{SLUG}}          — root element
 *   data-{{SLUG}}-trigger  — <button> with aria-expanded + aria-controls
 *   data-{{SLUG}}-panel    — collapsible region, toggled via `hidden`
 */

/**
 * @typedef {Object} {{LABEL_PASCAL}}Config
 * @property {string}   [triggerSelector='[data-{{SLUG}}-trigger]']
 * @property {string}   [panelSelector='[data-{{SLUG}}-panel]']
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
            triggerSelector: '[data-{{SLUG}}-trigger]',
            panelSelector:   '[data-{{SLUG}}-panel]',
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
 * Initialize all [data-{{SLUG}}] roots on the page.
 * @param {{{LABEL_PASCAL}}Config} [config]
 * @returns {{{LABEL_PASCAL}}[]}
 */
export function init{{LABEL_PASCAL}}s(config = {}) {
    return Array.from(document.querySelectorAll('[data-{{SLUG}}]')).map(
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
`site/plugins/ui-library/index.php`:

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
- [ ] All JS hooks are `data-{{SLUG}}-*` attributes — no CSS class selectors in JS
- [ ] All Twig cross-file references use `@ui/` namespace, not relative paths
- [ ] SCSS imports `tokens` with `@use 'tokens' as *`
- [ ] Blueprint tabs use `fields:` directly — no `sections:` wrapper
- [ ] Both new keys are added to `index.php` blueprints AND snippets arrays
- [ ] `main.scss` and `main.js` import/call the new component

---

## Canonical reference: the accordion component

When in doubt, look at the accordion implementation as the ground truth:

| Role               | File                                                            |
| ------------------ | --------------------------------------------------------------- |
| Blueprint          | `site/plugins/ui-library/blueprints/blocks/accordion.yml`       |
| Base template      | `site/plugins/ui-library/snippets/blocks/_accordion_base.twig`  |
| Default variant    | `site/plugins/ui-library/snippets/blocks/accordion_simple.twig` |
| Dispatcher         | `site/plugins/ui-library/snippets/blocks/accordion.twig`        |
| SCSS               | `site/plugins/ui-library/src/scss/_accordion.scss`              |
| JS module          | `site/plugins/ui-library/src/js/accordion.js`                   |
| Registration       | `site/plugins/ui-library/index.php`                             |
| Doc page blueprint | `site/blueprints/pages/accordion.yml`                           |
| Doc page template  | `site/templates/accordion.twig`                                 |
| Doc page content   | `content/2_components/1_accordion/accordion.txt`                |

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

**JS strategies in Extending** — include only when the component ships its own JavaScript module:

- **Strategy 1: Data-attribute configuration** — read options from `data-*` attributes at init; no hardcoded values in JS
- **Strategy 2: Push to stack** — push per-instance scripts to the page footer from within an embed
- **Strategy 3: Stimulus controllers** — bind a `data-controller` for maintainable, decoupled behaviour
- **Strategy 4: Combine embed and Stimulus** — use `{% embed %}` to change structure AND a Stimulus controller for new behaviour in the same block

Components/snippets with **no JS module** must not include these strategies.

---
