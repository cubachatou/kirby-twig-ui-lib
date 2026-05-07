# kirby-twig-ui-lib — Doc Site

Development environment and documentation website for the [kirby-kui](site/plugins/kui/README.md) plugin. Built on Kirby CMS 5 with Twig templating, Tailwind CSS v4, and a dual Vite setup.

## What's in this repo

| Path | Purpose |
|---|---|
| `site/plugins/kui/` | The plugin itself (git submodule) |
| `assets/` | Doc-site source files (JS, SCSS, CSS) |
| `site/templates/` | Kirby/Twig page templates |
| `site/blueprints/` | Panel page and block blueprints |
| `site/config/config.php` | Kirby config (URL, Twig namespaces, Vite helper) |
| `vite.config.js` | Doc-site Vite config (port 5173, Tailwind v4) |

## Requirements

| Dependency | Version |
|---|---|
| PHP | 8.2 – 8.5 |
| Composer | 2.x |
| Node.js | 18+ |
| npm | 9+ |

## Getting started

### 1. Clone with submodules

\`\`\`bash
git clone --recurse-submodules https://github.com/your-username/kirby-twig-ui-lib.git
cd kirby-twig-ui-lib
\`\`\`

If you already cloned without `--recurse-submodules`:

\`\`\`bash
git submodule update --init
\`\`\`

### 2. Install PHP dependencies

\`\`\`bash
composer install
\`\`\`

### 3. Install doc-site Node dependencies

\`\`\`bash
npm install
\`\`\`

### 4. Install plugin Node dependencies

\`\`\`bash
cd site/plugins/kui
npm install
cd ../../..
\`\`\`

## Development

Open **two terminals**:

**Terminal 1 — Kirby + doc-site Vite:**

\`\`\`bash
npm run start
\`\`\`

This runs the PHP built-in server on `http://localhost:8000` and the doc-site Vite dev server on `http://localhost:5173` concurrently.

**Terminal 2 — Plugin Vite (HMR for component styles and JS):**

\`\`\`bash
cd site/plugins/kui
npm run dev     # → http://localhost:5174
\`\`\`

| URL | What |
|---|---|
| `http://localhost:8000` | Kirby site |
| `http://localhost:8000/panel` | Kirby Panel (CMS admin) |
| `http://localhost:5173` | Doc-site Vite HMR |
| `http://localhost:5174` | Plugin Vite HMR |

## Production build

\`\`\`bash
# Build doc-site assets
npm run build

# Build plugin assets (from inside the plugin)
cd site/plugins/kui && npm run build
\`\`\`

Doc-site output goes to `assets/dist/`. Plugin output goes to `site/plugins/kui/assets/` (self-contained, served by Kirby's media pipeline).

## Project structure

\`\`\`
kirby-twig-ui-lib/
├── assets/
│   ├── css/main.css          # Tailwind v4 entry (@import "tailwindcss")
│   ├── js/main.js            # Doc-site JS entry
│   └── scss/main.scss        # Doc-site SCSS
├── content/                  # Flat-file content (Kirby)
├── site/
│   ├── blueprints/           # Page blueprints for the Panel
│   ├── config/config.php     # Kirby config (url, Twig namespaces, viteAsset)
│   ├── plugins/
│   │   └── kui/       # ← git submodule (kirby-kui plugin)
│   └── templates/
│       └── default.twig      # Default page template
├── vite.config.js            # Doc-site Vite (port 5173, Tailwind v4)
├── package.json
└── composer.json
\`\`\`

## How the two Vite instances work

\`\`\`
Port 5173 — Doc site
  assets/js/main.js  ─────────►  assets/dist/  (production)
  assets/css/main.css              Tailwind v4 processed by @tailwindcss/vite

Port 5174 — UI Library plugin
  src/js/main.js  ────────────►  site/plugins/kui/assets/  (production)
  src/scss/main.scss              Served via Kirby media pipeline
\`\`\`

Both Vite servers run simultaneously in development; the Twig templates request assets from the correct port automatically.

## Kirby Panel first login

1. Go to `http://localhost:8000/panel`
2. Create an admin account on first visit
3. Add pages and use the **Accordion** block from the blocks field

## Plugin documentation

See [site/plugins/kui/README.md](site/plugins/kui/README.md) for full plugin API, component usage, and how to add new blocks.

## License

MIT
