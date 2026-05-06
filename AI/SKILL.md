---
name: kirby-twig-best-practices
description: Kirby CMS 5 and Twig 3.x templating best practices. Use when writing, reviewing, or optimizing Kirby CMS projects that use Twig templates. Triggers on tasks involving Kirby CMS templates, blueprints, snippets, controllers, page models, collections, content representations, UUIDs, blocks/layout fields, virtual content, content structure, Twig template syntax, Twig filters/functions/blocks/tags, kirby-twig plugin setup, or any PHP flat-file CMS work with Twig. Also use when the user mentions "Kirby," ".twig templates," "blueprints," "kirbytext," "Kirby panel," "flat-file CMS," "content folder structure," "site/templates," "site/snippets," "site/models," "site/collections," "page models," "blocks field," "layout field," "UUID," "permalink," "content representation," or "Twig for Kirby." Even if the user doesn't say "best practices" explicitly, apply this skill whenever writing or reviewing Kirby+Twig code.
---

**Kirby CMS + Twig Best Practices**

Comprehensive guide for building Kirby CMS projects with Twig templating. Covers project structure, templates, snippets, blueprints, controllers, content management, security, performance, and the kirby-twig plugin integration.

## When to Apply

Reference these guidelines when:

- Setting up a new Kirby CMS project with Twig
- Writing or reviewing Twig templates for Kirby
- Creating blueprints for the Kirby Panel
- Structuring content folders and text files
- Building controllers to separate logic from templates
- Optimizing Kirby site performance and caching
- Securing a Kirby installation
- Creating or maintaining Kirby plugins

## Ecosystem Coverage

- **Kirby CMS 5** — Flat-file CMS built on PHP (Kirby 5 is current)
- **Twig 3.x** — Template engine for PHP (via kirby-twig plugin)
- **kirby-twig plugin** — `wearejust/kirby-twig` (Composer) or `site/plugins/kirby-twig`

---

## 1. Project Structure

### Standard Kirby + Twig Layout

```
project-root/
├── content/              # All site content (flat-file)
│   ├── site.txt          # Global site data
│   ├── home/
│   │   └── home.txt
│   ├── blog/
│   │   ├── blog.txt
│   │   └── 1_my-post/
│   │       └── post.txt
│   └── error/
│       └── error.txt
├── site/
│   ├── blueprints/       # Panel configuration (YAML)
│   │   ├── site.yml
│   │   ├── pages/
│   │   ├── files/
│   │   └── users/
│   ├── collections/      # Reusable page/file queries (PHP)
│   ├── config/
│   │   └── config.php
│   ├── controllers/      # Template logic (PHP)
│   ├── models/           # Page models (PHP)
│   ├── plugins/
│   │   └── kirby-twig/   # Twig plugin
│   ├── snippets/         # Reusable partials (.twig)
│   │   └── blocks/       # Block snippets for blocks field
│   └── templates/        # Page templates (.twig)
│       └── *.json.php    # Content representations
├── assets/               # CSS, JS, images
├── kirby/                # Kirby core (never edit)
└── .htaccess
```

### Key Conventions

- Template names must be **lowercase** and match the content text file name: `post.txt` → `post.twig`
- Always have a `default.twig` template as a fallback
- Blueprints use **YAML** format and go in `site/blueprints/`
- Controllers go in `site/controllers/` with the same base name as temples: `blog.twig` → `blog.php`
- Snippets go in `site/snippets/` and can be organized in subfolders

---

## 2. Installing the Twig Plugin

### Via Composer (recommended)

```bash
composer require wearejust/kirby-twig
```

### Via Git Submodule

```bash
git submodule add https://github.com/wearejust/kirby-twig.git site/plugins/kirby-twig
```

### Manual Download

Download and copy to `site/plugins/kirby-twig`.

After installation, Kirby will look for `.twig` files in `site/templates/` alongside (or instead of) `.php` files. PHP templates still work — you don't have to rewrite everything.

---

## 3. Twig Templating in Kirby

### Accessing Kirby Objects

In Twig templates, Kirby's core objects are available as variables:

| Kirby PHP | Twig equivalent |
| --------- | --------------- |
| `$page`   | `page`          |
| `$site`   | `site`          |
| `$pages`  | `pages`         |
| `$kirby`  | `kirby`         |

**Example — Basic page template:**

```twig
{# site/templates/default.twig #}
{% extends 'layout.twig' %}

{% block content %}
  <h1>{{ page.title }}</h1>
  {{ page.text.kirbytext | raw }}
{% endblock %}
```

### Method Calls vs Property Access

Twig tries property access first, then method call. When a Kirby object has both a public property and a method with the same name, property access may return `NULL`.

```twig
{# BAD — may return NULL if public property shadows the method #}
{{ page.children }}

{# GOOD — explicitly call the method #}
{{ page.children() }}
```

Always use **explicit parentheses** `()` when calling Kirby methods that return collections or perform logic.

### Null-Safe Operator

Twig 3.23+ supports the null-safe operator `?.` — returns `null` instead of throwing when the left operand is null:

```twig
{# Safe navigation through potentially null values #}
{{ page.cover.toFile?.url }}

{# Chain null-safe operators #}
{{ user?.address?.city }}

{# Null-safe with dynamic attributes #}
{{ user?.('get' ~ fieldName) }}
```

### KirbyText and Raw Output

Kirby's `kirbytext()` method returns HTML. Twig auto-escapes by default, so you need the `raw` filter:

```twig
{# Render KirbyText (Markdown + Kirby tags) as HTML #}
{{ page.text.kirbytext | raw }}

{# Render basic Markdown only #}
{{ page.text.markdown | raw }}

{# Plain text — auto-escaped, no raw needed #}
{{ page.title }}
```

Only use `| raw` when you trust the content source (Panel editors, your own content files). Never use `| raw` on user-submitted content from forms or APIs without sanitization.

### Field Methods

Kirby fields have many useful methods. Call them like Twig methods:

```twig
{{ page.title.html }}            {# HTML-escaped title #}
{{ page.date.toDate('d/m/Y') }}  {# Formatted date #}
{{ page.text.excerpt(300) }}     {# Truncated excerpt #}
{{ page.tags.split(',') }}       {# Split comma-separated field #}
{{ page.cover.toFile }}          {# Resolve file reference #}
```

### Reserved Field Names

Some field names collide with Kirby's built-in methods (`image`, `videos`, `audio`, `num`). Access them via `content()`:

```twig
{# If your content file has a field called "Image:" #}
{{ page.content.image }}

{# NOT page.image — that calls the built-in method #}
```

---

## 4. Template Inheritance and Layout

Twig's inheritance model replaces Kirby's traditional header/footer snippet pattern with a cleaner approach.

### Base Layout

```twig
{# site/templates/layout.twig #}
<!DOCTYPE html>
<html lang="{{ kirby.language.code | default('en') }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{ site.description }}">
  <title>{% block title %}{{ page.title }} | {{ site.title }}{% endblock %}</title>
  {% block head %}{% endblock %}
</head>
<body>
  {% block header %}
    {% include 'snippets/header.twig' %}
  {% endblock %}

  <main>
    {% block content %}{% endblock %}
  </main>

  {% block footer %}
    {% include 'snippets/footer.twig' %}
  {% endblock %}
</body>
</html>
```

### Child Template

```twig
{# site/templates/article.twig #}
{% extends 'layout.twig' %}

{% block title %}{{ page.title }} — Blog{% endblock %}

{% block head %}
  {{ parent() }}
  <link rel="canonical" href="{{ page.url }}">
{% endblock %}

{% block content %}
  <article>
    <h1>{{ page.title }}</h1>
    <time datetime="{{ page.date.toDate('Y-m-d') }}">
      {{ page.date.toDate('F j, Y') }}
    </time>
    {{ page.text.kirbytext | raw }}
  </article>
{% endblock %}
```

### When to Use `parent()`

Call `{{ parent() }}` inside a block when you want to **add to** the parent's content rather than replace it entirely — commonly used for the `head` block to add page-specific meta tags or styles.

### The `embed` Tag (Micro-Layouts)

The `embed` tag combines `include` and `extends` — it includes a template fragment and lets you override its blocks. Use it for reusable layout skeletons within a page (e.g., two-column vs. stacked card layouts):

```twig
{# site/snippets/two-col-layout.twig #}
<div class="two-col">
  <div class="col col--left">{% block left %}{% endblock %}</div>
  <div class="col col--right">{% block right %}{% endblock %}</div>
</div>
```

```twig
{# In your page template #}
{% embed 'snippets/two-col-layout.twig' %}
  {% block left %}
    <h2>{{ page.title }}</h2>
    {{ page.intro.kirbytext | raw }}
  {% endblock %}
  {% block right %}
    {% include 'snippets/sidebar.twig' %}
  {% endblock %}
{% endembed %}

{# Pass variables to embedded template #}
{% embed 'snippets/card.twig' with { featured: true } only %}
  {% block body %}{{ page.summary }}{% endblock %}
{% endembed %}
```

> **Note:** When embedding CSS/JS templates into HTML, set escaping explicitly with `{% autoescape 'html' %}` inside the embed, since auto-escaping strategy is based on template name and embedded templates have none.

---

## 5. Snippets (Partials)

Twig's `include` replaces Kirby's `snippet()` function.

### Basic Include

```twig
{# Include a snippet #}
{% include 'snippets/card.twig' %}

{# Include with variables #}
{% include 'snippets/card.twig' with { article: child } %}

{# Include with isolated scope (snippet only sees passed vars) #}
{% include 'snippets/card.twig' with { article: child } only %}
```

### Snippet with Fallback

```twig
{# Try specific snippet, fall back to default #}
{% include ['snippets/blocks/' ~ block.type ~ '.twig', 'snippets/blocks/default.twig'] %}
```

### Reusable Macros

For small repeated HTML patterns, use Twig macros instead of snippets:

```twig
{% macro icon(name, size) %}
  <svg class="icon icon--{{ name }}" width="{{ size | default(24) }}" height="{{ size | default(24) }}">
    <use href="/assets/icons.svg#{{ name }}"></use>
  </svg>
{% endmacro %}

{# Usage #}
{{ _self.icon('arrow', 16) }}
```

Import macros from separate files:

```twig
{% from 'snippets/macros/ui.twig' import icon, button %}
{{ icon('search') }}
```

---

## 6. Loops and Collections

### Iterating Page Children

```twig
{# Listed (published) children #}
{% for article in page.children.listed %}
  <h2><a href="{{ article.url }}">{{ article.title }}</a></h2>
{% endfor %}

{# With empty fallback #}
{% for project in page.children.listed %}
  {% include 'snippets/project-card.twig' with { project: project } %}
{% else %}
  <p>No projects yet.</p>
{% endfor %}
```

### Filtering and Sorting

```twig
{# Filter by template #}
{% for post in site.index.filterBy('template', 'post') %}
  ...
{% endfor %}

{# Sort by date descending #}
{% for post in page.children.listed.sortBy('date', 'desc') %}
  ...
{% endfor %}

{# Limit results #}
{% for post in page.children.listed.limit(6) %}
  ...
{% endfor %}
```

### Pagination

Handle pagination in the **controller**, then use it in the template:

```twig
{# Pagination from controller #}
{% for article in articles %}
  {% include 'snippets/article-card.twig' with { article: article } %}
{% endfor %}

{% if pagination.hasPages %}
  <nav class="pagination">
    {% if pagination.hasPrevPage %}
      <a href="{{ pagination.prevPageUrl }}">Previous</a>
    {% endif %}
    {% if pagination.hasNextPage %}
      <a href="{{ pagination.nextPageUrl }}">Next</a>
    {% endif %}
  </nav>
{% endif %}
```

---

## 7. Controllers

Controllers keep template logic out of Twig files. They return variables that become available in the template.

### Basic Controller

```php
<?php
// site/controllers/blog.php

return function ($page, $kirby) {
    $articles = $page->children()->listed()->sortBy('date', 'desc');

    // Tag filter from query string
    if ($tag = get('tag')) {
        $articles = $articles->filterBy('tags', '=', $tag, ',');
    }

    $articles = $articles->paginate(12);

    return [
        'articles'   => $articles,
        'pagination' => $articles->pagination(),
        'tags'       => $page->children()->listed()->pluck('tags', ',', true),
    ];
};
```

### General Site Controller

A `site.php` controller applies to **all** templates. Its data merges with page-specific controllers:

```php
<?php
// site/controllers/site.php

return function ($site, $kirby) {
    return [
        'navigation' => $site->children()->listed(),
        'year'       => date('Y'),
    ];
};
```

### Controller Best Practices

- Keep controllers focused: one concern per variable returned
- Do all filtering, sorting, and pagination in controllers, not templates
- Controller file name must match template name (minus extension)
- Avoid heavy computation — controllers run on every page load

---

## 8. Blueprints

Blueprints define the Panel UI in YAML.

### Page Blueprint Example

```yaml
# site/blueprints/pages/article.yml
title: Article
icon: 📝

status:
 draft:
  label: Draft
  text: Article is not visible
 listed:
  label: Published
  text: Article is publicly visible

tabs:
 content:
  label: Content
  columns:
   - width: 2/3
     sections:
      content:
       type: fields
       fields:
        text:
         label: Article Text
         type: writer
         marks:
          - bold
          - italic
          - link
        tags:
         label: Tags
         type: tags
   - width: 1/3
     sections:
      cover:
       type: files
       label: Cover Image
       max: 1
       layout: cards
       template: cover
      meta:
       type: fields
       fields:
        date:
         label: Published
         type: date
        author:
         label: Author
         type: users
         max: 1
```

### Blueprint Best Practices

- Use **tabs, columns, and sections** to organize complex pages — don't dump everything into one column
- Field names must use **alpha-numeric characters and underscores only** (no dashes)
- Use `type: writer` or `type: blocks` for rich content instead of plain `textarea` where appropriate
- Wrap labels containing special characters in double quotes: `label: "Fotograf*in"`
- Extend and reuse blueprints with `extends:` to avoid duplication
- Use Kirby's query language in blueprints for dynamic options

---

## 9. Content Structure

### Flat-File Conventions

Every page is a folder inside `content/`. The folder name determines the URL slug. Each page folder contains a text file whose name determines which template is used.

```
content/
├── site.txt                 # Global site fields
├── 1_home/
│   └── home.txt             # Uses home.twig template
├── 2_blog/
│   ├── blog.txt             # Uses blog.twig template
│   ├── 1_my-first-post/
│   │   ├── post.txt         # Uses post.twig template
│   │   └── cover.jpg
│   └── 2_another-post/
│       └── post.txt
├── 3_about/
│   └── about.txt
└── error/
    └── error.txt
```

### Content File Format

```
Title: My First Post

----

Date: 2026-01-15

----

Tags: design, kirby, twig

----

Text: This is the article body written in **Markdown** with KirbyText support.

----
```

### Performance Tip for Large Sites

If a page will have hundreds or thousands of children, add an extra nesting layer (e.g., by year) to help Kirby traverse the page tree faster:

```
blog/
├── 2025/
│   ├── 1_post-a/
│   └── 2_post-b/
└── 2026/
    └── 1_post-c/
```

---

## 10. Twig Coding Standards

Follow the official Twig coding standards:

### Spacing

```twig
{# GOOD — one space inside delimiters #}
{{ variable }}
{% if condition %}
{# comment #}

{# BAD — no spaces #}
{{variable}}
{%if condition%}
```

### Whitespace Control

Use `-` modifier to trim whitespace when the output matters:

```twig
{%- if true -%}
  {{- value -}}
{%- endif -%}
```

Use `~` modifier to trim whitespace but preserve newlines (added in Twig 3.x):

```twig
<li>
  {{~ value }}    {# trims leading whitespace but keeps newline #}
</li>
```

### Naming Conventions

```twig
{# GOOD — snake_case for all variable and function names #}
{% set first_name = 'Fabien' %}
{% set page_count = items | length %}

{# BAD — camelCase or PascalCase #}
{% set firstName = 'Fabien' %}
{% set PageCount = items | length %}
```

### Indentation

Indent code inside block tags:

```twig
{% block content %}
  {% if articles | length > 0 %}
    {% for article in articles %}
      <article>{{ article.title }}</article>
    {% endfor %}
  {% endif %}
{% endblock %}
```

### Operators

One space around comparison, math, logic, and ternary operators:

```twig
{{ 1 + 2 }}
{{ is_active ? 'yes' : 'no' }}
{{ first_name ~ ' ' ~ last_name }}
```

No spaces around `|`, `.`, `..`, `[]`:

```twig
{{ name|upper|lower }}
{{ user.name }}
{{ users[0] }}
```

### Named Arguments

Since Twig 3.12, named arguments use `:` syntax (not `=`). The `=` form still works but `:` is preferred:

```twig
{# GOOD — named arguments with colon (Twig 3.12+) #}
{{ data|convert_encoding(from: 'iso-2022-jp', to: 'UTF-8') }}
{{ "now"|date(timezone: "Europe/Paris") }}
{% for i in range(low: 1, high: 10, step: 2) %}

{# Macro default VALUES still use = (space around it) #}
{% macro html_input(name, class = "input") %}
  <input name="{{ name }}" class="{{ class }}">
{% endmacro %}
```

### Inline Comments (Twig 3.15+)

Inline comments starting with `#` can appear inside `{{ }}` and `{% %}` blocks:

```twig
{{
    # this is an inline comment
    "Hello World"|upper
}}

{% for item in items # iterating items %}
  {{ item.title }}
{% endfor %}
```

### Arrow Functions

Arrow functions `=>` are supported for `map`, `filter`, `reduce`, `find`, `sort`:

```twig
{# Map over a collection #}
{{ page.children().listed()|map(p => p.title)|join(', ') }}

{# Filter with arrow function #}
{% set featured = articles|filter(a => a.featured.toBool) %}

{# Store in a variable #}
{% set titleFn = (p) => p.title %}
{{ page.children()|map(titleFn)|join(', ') }}
```

### New Boolean Operators

```twig
{# Check if all/some elements match a condition #}
{% set sizes = [34, 36, 38, 40] %}
{{ sizes has every v => v > 30 }}   {# true #}
{{ sizes has some v => v > 38 }}    {# true #}

{# Spaceship / three-way comparison #}
{# Returns -1, 0 or 1 — useful with sort #}
{{ 1 <=> 2 }}   {# -1 #}
```

### Destructuring (Twig 3.23+)

```twig
{# Sequence destructuring #}
{% do [first, last] = ['Fabien', 'Potencier'] %}
{{ first }} {# Fabien #}

{# Skip values #}
{% do [, second] = ['skip', 'keep'] %}

{# Object/mapping destructuring #}
{% do {title, url} = page %}
{{ title }}

{# Rename on destructure #}
{% do {title: pageTitle, url: pageUrl} = page %}
```

---

## 11. Security

### Escaping Content

Twig auto-escapes variables by default, which protects against XSS. However:

- Only use `| raw` on **trusted content** (Panel fields, your own content files)
- **Never** use `| raw` on user-submitted data without sanitization
- Use context-specific escaping when outputting in non-HTML contexts:

```twig
{{ value | e('js') }}        {# In JavaScript #}
{{ value | e('css') }}       {# In CSS #}
{{ value | e('url') }}       {# In URLs #}
{{ value | e('html_attr') }} {# In HTML attributes #}
```

### Kirby-Side Escaping (PHP Templates / Snippets)

When writing PHP snippets called from Twig via `page.snippet()`, use Kirby's `esc()` helper and field methods for context-aware XSS protection:

```php
// HTML body context (default)
<?= $site->copyright()->escape() ?>

// HTML attribute context
<img alt="<?= $image->alt()->escape('attr') ?>" src="<?= $image->url() ?>">

// JavaScript context
<script>let title = "<?= $page->title()->escape('js') ?>";</script>

// CSS context
<section style="--columns: <?= $section->columns()->escape('css') ?>">

// URL context
<iframe src="https://map.example.com/?lat=<?= $map->lat()->escape('url') ?>">
```

### Escaping KirbyText

If KirbyText content comes from untrusted sources (e.g., comment forms), enable Markdown safe mode to strip raw HTML and malicious links:

```twig
{# In Twig — pass option to kirbytext #}
{{ page.text.kirbytext(['markdown' => ['safe' => true]]) | raw }}
```

Or enable globally in config:

```php
// site/config/config.php
return [
    'markdown' => ['safe' => true],
];
```

### Kirby Security Checklist

1. **Disable debug mode in production**: `'debug' => false` in `config.php`
2. **Never expose Kirby version** in templates
3. **Block access to sensitive folders** (`content/`, `site/`, `kirby/`, `.git/`) — Kirby's `.htaccess` does this by default for Apache; use a [public/private folder setup](https://getkirby.com/docs/guide/configuration/custom-folder-setup#public-and-private-folder-setup) when possible
4. **Use HTTPS** everywhere
5. **Use strong passwords** for Panel accounts — Panel has built-in brute-force protection
6. **Keep Kirby updated** to patch known vulnerabilities; never run end-of-life versions
7. **Filter and sanitize all user input** before storing via `Page::create()`, `$page->update()`, etc. — use [Kirby's input validators](https://getkirby.com/docs/reference#validators)
8. **Exclude sensitive files from Git**: add `site/accounts/` and `site/config/config.php` to `.gitignore`
9. **Restrict file permissions** — never use 777
10. **Use the latest stable PHP version** supported by Kirby
11. **Disable directory listings**: add `Options -Indexes` to `.htaccess` if not already done
12. **Sanitize virtual content props** — `filename`, `slug`, `num`, `root`, `template` of virtual pages must not come from unvalidated user input (path traversal risk)

### Disable Vue Template Compiler (Kirby 4.7+)

For sites with increased security requirements, disable the Vue 2 template compiler in the Panel:

```php
return [
    'panel' => [
        'vue' => ['compiler' => false],
    ],
];
```

### Content Security

```php
// site/config/config.php
return [
    'debug' => false,
    'panel' => [
        'install' => false, // Prevent public Panel installation
    ],
];
```

---

## 12. Caching

### Enable Page Caching

```php
// site/config/config.php
return [
    'cache' => [
        'pages' => [
            'active' => true,
            'type'   => 'file',
        ],
    ],
];
```

### Ignore Rules

Exclude dynamic pages from the cache with a callback or array of IDs:

```php
return [
    'cache' => [
        'pages' => [
            'active' => true,
            'ignore' => function ($page) {
                return $page->template()->name() === 'search';
            },
        ],
    ],
];
```

### Excluding Pages via Page Model

For fine-grained cache control, override `isCacheable()` in a page model:

```php
// site/models/project.php
class ProjectPage extends Page
{
    public function isCacheable(): bool
    {
        if (parent::isCacheable() === false) {
            return false;
        }
        // Don't cache pages with a specific field value
        return $this->nocache()->isNotTrue();
    }
}
```

### Automatic Cache Bypass

Kirby automatically skips caching for:

- Requests with query strings, `POST`/`PUT`/`DELETE` methods, or Kirby params
- Pages that read session data (`$kirby->session()`), cookies (`Cookie::get()`), or the `Authorization` header

If your template uses cookies/auth outside Kirby's built-in methods, signal it manually:

```php
// In a controller or template
$kirby->response()->usesCookie('my_cookie');
$kirby->response()->usesAuth(true);
```

### Custom Application Caches

Create named caches for external API data, computed results, etc.:

```php
// site/config/config.php
return [
    'cache' => [
        'api' => true,    // file cache by default
    ]
];
```

Use in controllers:

```php
// site/controllers/events.php
return function ($kirby) {
    $cache   = $kirby->cache('api');
    $apiData = $cache->get('events');

    if ($apiData === null) {
        $response = Remote::get('https://api.example.com/events');
        $apiData  = $response->json();
        $cache->set('events', $apiData, 30); // expires in 30 minutes
    }

    return compact('apiData');
};
```

### Alternative Cache Drivers

```php
return [
    'cache' => [
        'pages' => [
            'active' => true,
            'type'   => 'memcached',
            'host'   => 'localhost',
            'port'   => '11211',
        ]
    ]
];
```

Available drivers: `file` (default), `memcached`, `apcu`. Plugins can provide additional drivers.

### Twig Template Caching

The kirby-twig plugin leverages Twig's compiled template cache. Twig compiles `.twig` files to PHP on first render and reuses the compiled version. In production, set Twig's `auto_reload` to `false` for maximum performance (clear cache on deploy).

### Twig Fragment Caching (`{% cache %}`)

Twig 3.2+ supports block-level fragment caching via the `CacheExtension` (`twig/cache-extra`):

```bash
composer require twig/cache-extra
```

```twig
{# Cache a template fragment — good for expensive loops or API calls #}
{% cache "blog_posts;v1;" ~ page.id %}
  {% for post in page.children.listed.limit(5) %}
    {% include 'snippets/post-card.twig' with { post: post } %}
  {% endfor %}
{% endcache %}

{# With TTL (seconds) #}
{% cache "sidebar;v1" ttl(300) %}
  {{ include('snippets/sidebar.twig') }}
{% endcache %}

{# With cache tags for group invalidation #}
{% cache "post;" ~ post.id tags(['blog', 'content']) %}
  {{ post.text.kirbytext | raw }}
{% endcache %}
```

Cache key best practices:

- Namespace by template area: `"blog_post;v1;" ~ post.id`
- Include a version token (`v1`) to instantly invalidate on template changes
- Include an `updated_at` timestamp to auto-expire on content changes

---

## 13. Multi-Language Support

### Configuration

```php
// site/config/config.php
return [
    'languages' => true,
];
```

### Language-Aware Templates

```twig
{# Current language #}
<html lang="{{ kirby.language.code }}">

{# Language switcher #}
{% for lang in kirby.languages %}
  <a href="{{ page.url(lang.code) }}"
     {{ lang.code == kirby.language.code ? 'aria-current="page"' }}>
    {{ lang.name }}
  </a>
{% endfor %}

{# Translated content (Kirby handles this automatically based on active language) #}
{{ page.title }}
```

---

## 14. Files and Images

### Working with Files in Twig

```twig
{# Page images #}
{% for image in page.images %}
  <img src="{{ image.url }}" alt="{{ image.alt }}" width="{{ image.width }}" height="{{ image.height }}">
{% endfor %}

{# Specific file by filename #}
{% set cover = page.image('cover.jpg') %}
{% if cover %}
  <img src="{{ cover.resize(800).url }}" alt="{{ cover.alt }}">
{% endif %}

{# File from a file field #}
{% set hero = page.hero.toFile %}
{% if hero %}
  <img src="{{ hero.crop(1200, 600).url }}" alt="{{ hero.alt }}">
{% endif %}
```

### Responsive Images

```twig
{% set image = page.image('photo.jpg') %}
{% if image %}
  <img
    src="{{ image.resize(800).url }}"
    srcset="{{ image.resize(400).url }} 400w,
            {{ image.resize(800).url }} 800w,
            {{ image.resize(1200).url }} 1200w"
    sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
    alt="{{ image.alt }}"
    loading="lazy"
  >
{% endif %}
```

---

## 15. Plugin Development

When building Kirby plugins, follow these practices:

### Structure

```
site/plugins/my-plugin/
├── index.php          # Plugin registration
├── composer.json      # Plugin metadata and version
├── README.md          # Documentation
├── LICENSE.md
└── lib/               # Custom classes (if needed)
```

### Registration

```php
<?php
// index.php
Kirby::plugin('yourname/my-plugin', [
    'blueprints' => [...],
    'templates'  => [...],
    'snippets'   => [...],
    'hooks'      => [...],
    'routes'     => [...],
]);
```

### Plugin Best Practices

- Always include a `composer.json` with name, description, version, and license
- Use **semantic versioning** (MAJOR.MINOR.PATCH)
- Name your repo `kirby-pluginname`
- Tag with `kirby5`, `kirby-cms`, `kirby-plugin` on GitHub
- Write a detailed README with installation and usage instructions
- Add comments to your code — other developers will thank you

---

## 16. Page Models

Page models extend Kirby's `Page` class with custom methods available everywhere a page of that type is used. Place them in `site/models/`.

### Creating a Page Model

The model filename and class name are derived from the content text file name. `project.txt` → `site/models/project.php` → `class ProjectPage`.

```php
<?php
// site/models/project.php

class ProjectPage extends Page
{
    /**
     * Returns the cover image for this project page.
     * Use $this (not $page) inside models.
     */
    public function cover()
    {
        return $this->image('cover');
    }

    /**
     * Returns only published sub-projects, sorted by date.
     */
    public function publishedSubprojects()
    {
        return $this->children()->listed()->sortBy('date', 'desc');
    }
}
```

```twig
{# In any template or snippet #}
{% set cover = page.cover %}
{% if cover %}
  <img src="{{ cover.resize(800).url }}" alt="{{ cover.alt }}">
{% endif %}

{% for sub in page.publishedSubprojects %}
  <h3>{{ sub.title }}</h3>
{% endfor %}
```

### Dashes/Underscores in Template Names

`my-project.txt` and `my_project.txt` both map to the class `MyProjectPage`:

```php
class MyProjectPage extends Page { ... }
```

### Default Page Model

Define a `DefaultPage` to add methods to all pages that don't have a specific model:

```php
<?php
// site/models/default.php
class DefaultPage extends Page
{
    public function ogImage()
    {
        return $this->images()->first();
    }
}
```

### Overriding Core Methods

```php
class ProjectPage extends Page
{
    // Override images() to sort differently by default
    public function images()
    {
        return parent::images()->sortBy('sort', 'ASC');
    }
}
```

### Model Best Practices

- Use `$this` inside models (you're inside the Page class)
- Keep models thin — they're for reusable computed properties, not business logic
- Override `isCacheable()` for page-specific cache control
- Models can be defined in plugins for reuse across projects

---

## 17. Reusable Collections

Collections are shared page/file queries defined in `site/collections/`. They prevent DRY violations when the same set of pages is needed in multiple templates.

### Defining Collections

```php
<?php
// site/collections/articles.php
return function ($site) {
    return $site->find('blog')->children()->listed()->flip();
};
```

```php
<?php
// site/collections/admins.php
return function ($users) {
    return $users->filterBy('role', 'admin');
};
```

```php
<?php
// site/collections/project-covers.php
return function ($site) {
    return $site
        ->find('projects')
        ->children()
        ->images()
        ->template('cover');
};
```

### Using Collections in Twig

```twig
{# Call in a Twig template via kirby object #}
{% for article in kirby.collection('articles') %}
  <h2>{{ article.title }}</h2>
{% endfor %}

{# Or use a helper via PHP controller and pass to template #}
```

From a controller (preferred pattern):

```php
return function ($kirby) {
    return [
        'articles' => $kirby->collection('articles'),
    ];
};
```

### Nested Collections

```php
// site/collections/articles/latest.php
return function ($site) {
    return $site->find('blog')->children()->listed()->flip();
};
```

```php
$kirby->collection('articles/latest');
```

### Collection Best Practices

- Collections should not apply pagination or `limit()` — do that at the call site
- Keep collections general; specialize in the controller or template
- Name collections by what they return, not where they're used

---

## 18. Content Representations

Content representations serve page content in different formats (JSON, RSS, plain text) from the same URL with an extension suffix.

### Creating a JSON Representation

```php
<?php
// site/templates/article.json.php
// Also requires site/templates/article.php to exist

$data = [
    'title' => $page->title()->value(),
    'date'  => $page->date()->toDate('Y-m-d'),
    'text'  => $page->text()->kirbytext()->value(),
    'url'   => $page->url(),
];

echo json_encode($data);
// Kirby automatically sets Content-Type: application/json
```

Access at: `https://example.com/my-article.json`

### Representation Types and Auto Content-Type

Kirby auto-detects the `Content-Type` from the file extension:

| Extension | Content-Type          |
| --------- | --------------------- |
| `.json`   | `application/json`    |
| `.rss`    | `application/rss+xml` |
| `.xml`    | `application/xml`     |
| `.txt`    | `text/plain`          |

For custom extensions, set the type manually:

```php
<?php
// site/templates/default.hash.php
$kirby->response()->type('text/plain');
echo $page->content()->toArray()['hash'] ?? '';
```

### Representation Controllers

A representation can have its own dedicated controller:

```php
<?php
// site/controllers/blog.json.php
// Falls back to blog.php controller if this file doesn't exist

return function ($page, $kirby) {
    return [
        'articles' => $page->children()->listed()->limit(20),
    ];
};
```

### RSS Feed Example

```php
<?php
// site/templates/blog.rss.php
$kirby->response()->type('application/rss+xml');
echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<rss version="2.0">
  <channel>
    <title><?= $site->title()->xml() ?></title>
    <link><?= $site->url() ?></link>
    <?php foreach ($articles->limit(20) as $article): ?>
      <item>
        <title><?= $article->title()->xml() ?></title>
        <link><?= $article->url() ?></link>
        <description><?= $article->text()->kirbytext()->xml() ?></description>
      </item>
    <?php endforeach ?>
  </channel>
</rss>
```

Access at: `https://example.com/blog.rss`

### Representations in Plugins

```php
Kirby::plugin('your/feed', [
    'templates' => [
        'notes.rss' => __DIR__ . '/templates/notes.rss.php',
    ],
    'controllers' => [
        'notes.rss' => function () { /* ... */ },
    ],
]);
```

---

## 19. UUIDs and Permalinks

Kirby 3.8+ assigns unique IDs (UUIDs) to pages, files, and users. UUIDs never change, even when folders are renamed or moved — making them ideal for persistent references.

### UUID Format

```
page://Eesj89FnbMzMMvs0
file://nuvOLvWZZZWPSqxM
user://yB6pFotK
```

### UUIDs in Content Files

When using picker fields (`pages`, `files`, `users`), Kirby stores UUIDs automatically:

```
Cover: file://VYnAL00UhvmOxq8J
----
Related:

- page://hb38HvnQfm8HlQ6e
- page://jchKH3EufbjC37KR
```

### Using UUIDs in Templates

All Kirby helpers support UUIDs transparently — the same as file paths:

```twig
{# Fetch a page by UUID #}
{% set related = kirby.page('page://hb38HvnQfm8HlQ6e') %}

{# Field methods handle UUID resolution automatically #}
{% set cover = page.cover.toFile %}   {# cover field stores file://... #}
{% if cover %}
  <img src="{{ cover.url }}" alt="{{ cover.alt }}">
{% endif %}

{# pages field with UUIDs #}
{% for related in page.related.toPages %}
  <a href="{{ related.url }}">{{ related.title }}</a>
{% endfor %}
```

### Permalinks

Pages have a permanent URL that works even after renaming/moving:

```twig
{# Permalink: https://example.com/@/page/hb38HvnQfm8HlQ6e #}
<a href="{{ page.permalink() }}">Permanent link</a>
```

Kirby automatically redirects permalink URLs to the current canonical page URL.

### Config

```php
// Disable UUIDs (not recommended for most projects)
return [
    'content' => ['uuid' => false],
];
```

---

## 20. Blocks and Layout Field

Kirby's blocks and layout fields replace long-form textarea content with a structured, visual page builder. Output is rendered through snippet files.

### Blueprint Setup

```yaml
# site/blueprints/pages/article.yml
fields:
 content:
  type: blocks
  fieldsets:
   - heading
   - text
   - image
   - gallery
   - quote
   - video
   - code

 # For multi-column layouts:
 layout:
  type: layout
  layouts:
   - "1/1"
   - "1/2, 1/2"
   - "1/3, 2/3"
  fieldsets:
   - text
   - image
```

### Rendering Blocks in Twig

```twig
{# Render all blocks — each block uses site/snippets/blocks/<type>.twig #}
{{ page.content.toBlocks | raw }}

{# Or iterate manually for custom wrapping #}
{% for block in page.content.toBlocks %}
  <div class="block block--{{ block.type }}">
    {{ block.toHtml | raw }}
  </div>
{% endfor %}
```

### Custom Block Snippets

Override any core block or create custom block types by placing snippets in `site/snippets/blocks/`:

```twig
{# site/snippets/blocks/text.twig #}
<div class="prose">
  {{ block.text.kirbytext | raw }}
</div>
```

```twig
{# site/snippets/blocks/image.twig #}
{% set image = block.image.toFile %}
{% if image %}
  <figure class="block-image">
    <img
      src="{{ image.resize(1200).url }}"
      alt="{{ image.alt }}"
      loading="lazy"
    >
    {% if block.caption %}
      <figcaption>{{ block.caption }}</figcaption>
    {% endif %}
  </figure>
{% endif %}
```

### Custom Block Type

Define custom blocks in a blueprint:

```yaml
# site/blueprints/pages/article.yml
fields:
  content:
    type: blocks
    fieldsets:
      - callout  # custom block

# site/blueprints/blocks/callout.yml
name: Callout
icon: alert
fields:
  text:
    type: textarea
  type:
    type: select
    options:
      info: Info
      warning: Warning
      tip: Tip
```

```twig
{# site/snippets/blocks/callout.twig #}
<aside class="callout callout--{{ block.type }}">
  {{ block.text.kirbytext | raw }}
</aside>
```

### Blocks Best Practices

- Put block snippets in `site/snippets/blocks/` — Kirby finds them automatically
- Use the `layout` field when you need multi-column arrangements; use `blocks` for single-column rich text
- Custom blocks need both a blueprint (`site/blueprints/blocks/`) and a snippet (`site/snippets/blocks/`)
- The `{{ page.content.toBlocks | raw }}` shorthand calls each block's snippet automatically

---

## 21. Twig 3.x Tags Reference

A complete list of all Twig 3.x tags relevant to Kirby projects:

### `{% apply %}` — Apply Filter to Block

```twig
{% apply upper %}
  This text becomes uppercase
{% endapply %}

{% apply markdown %}
  # This heading is processed as Markdown
{% endapply %}
```

### `{% cache %}` — Fragment Caching

See Section 12 (Caching) for full details. Requires `twig/cache-extra`.

### `{% do %}` — Execute Without Output

```twig
{# Execute a method without printing the return value #}
{% do page.update({'views': page.views.toInt + 1}) %}

{# Also usable for variable assignment #}
{% do count = count + 1 %}
```

### `{% embed %}` — Include with Block Overrides

See Section 4 (Template Inheritance) for full details.

### `{% verbatim %}` — Output Raw Twig Syntax

```twig
{% verbatim %}
  This {{ will not }} be processed by Twig.
  {% for item in items %} Neither will this. {% endfor %}
{% endverbatim %}
```

Useful for including Vue.js or Alpine.js templates inside Kirby+Twig projects.

### `{% with %}` — Scoped Variables

```twig
{# Create a new scope; outer variables are still accessible #}
{% with { color: 'blue', size: 'large' } %}
  <div class="{{ color }} {{ size }}">{{ page.title }}</div>
{% endwith %}

{# Isolate scope entirely with `only` #}
{% with { title: 'Override' } only %}
  {{ title }}  {# 'Override' — outer scope not accessible #}
{% endwith %}
```

### `{% types %}` — Variable Type Hints (Twig 3.13+)

```twig
{# Document expected types for IDE support #}
{% types {
    page: 'Kirby\\Cms\\Page',
    articles: 'Kirby\\Cms\\Pages',
} %}
```

### `{% sandbox %}` — Restrict Template Execution

```twig
{# Execute user-provided template code in sandbox mode #}
{% sandbox %}
  {% include untrustedTemplate %}
{% endsandbox %}
```

Only use with Twig's sandbox policy configured on the environment.

### `{% deprecated %}` — Mark Features Deprecated

```twig
{# In a reusable snippet, warn when old variable name is used #}
{% if oldVar is defined %}
  {% deprecated 'The "oldVar" variable is deprecated. Use "newVar" instead.' %}
  {% set newVar = oldVar %}
{% endif %}
```

---

## Quick Reference: Kirby PHP → Twig Cheatsheet

| Kirby PHP                                        | Twig                                                     |
| ------------------------------------------------ | -------------------------------------------------------- |
| `<?= $page->title() ?>`                          | `{{ page.title }}`                                       |
| `<?= $page->text()->kirbytext() ?>`              | `{{ page.text.kirbytext \| raw }}`                       |
| `<?= $site->url() ?>`                            | `{{ site.url }}`                                         |
| `<?php foreach($page->children() as $child): ?>` | `{% for child in page.children() %}`                     |
| `<?php if($page->isActive()): ?>`                | `{% if page.isActive %}`                                 |
| `<?php snippet('header') ?>`                     | `{% include 'snippets/header.twig' %}`                   |
| `<?php snippet('card', ['item' => $item]) ?>`    | `{% include 'snippets/card.twig' with { item: item } %}` |
| `<?= $page->image('photo.jpg')->url() ?>`        | `{{ page.image('photo.jpg').url }}`                      |
| `<?= url('assets/css/style.css') ?>`             | `{{ url('assets/css/style.css') }}`                      |
| `<?= $page->date()->toDate('Y-m-d') ?>`          | `{{ page.date.toDate('Y-m-d') }}`                        |
| `$kirby->collection('articles')`                 | `{{ kirby.collection('articles') }}`                     |
| `$page->permalink()`                             | `{{ page.permalink() }}`                                 |
| `$cover = $page->cover()` (model method)         | `{{ page.cover.url }}`                                   |
| `$kirby->cache('api')->get('key')`               | _(in PHP controller only)_                               |
