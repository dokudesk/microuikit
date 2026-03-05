# Flexa

Compact front-end framework for micro UIs. Fully responsive, WCAG 2.1 compliant, with built-in RTL/LTR support, flexible theming, and an easy to use.

## Features

- **Source maps** — Debug with original SCSS line numbers
- **Sass (SCSS)** — Variables, mixins, and modular architecture
- **CDN-ready build** — Minified CSS/JS for unpkg and jsDelivr
- **CSS Cascade Layers** — Predictable cascade control
- **Utility-first** — Utility classes generated from design tokens
- **Theme support** — Dark/light themes and `prefers-color-scheme`
- **RTL / LTR** — Full direction support via selectors
- **Responsive-ready** — Utilities and layout that adapt to all screen sizes  
- **Design tokens** — Colors, spacing, typography, borders, shadows, transitions, flexbox, and more

## Installation

**As a dependency:**

```bash
npm install flexa
```

**For development (clone first):**

```bash
git clone https://github.com/dokudesk/flexa.git
cd flexa
npm install
```

## Usage

### CDN

```html
<!-- unpkg -->
<link rel="stylesheet" href="https://unpkg.com/flexa@latest/dist/css/flexa.min.css" />
<link rel="stylesheet" href="https://unpkg.com/flexa@latest/dist/css/themes/flexa-theme-default.min.css" />
<script src="https://unpkg.com/flexa@latest/dist/js/flexa.min.js"></script>

<!-- jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flexa@latest/dist/css/flexa.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flexa@latest/dist/css/themes/flexa-theme-default.min.css" />
<script src="https://cdn.jsdelivr.net/npm/flexa@latest/dist/js/flexa.min.js"></script>
```

### npm / Local build

After `npm run build`, use the built files:

```html
<link rel="stylesheet" href="path/to/node_modules/flexa/dist/css/flexa.css" />
<link rel="stylesheet" href="path/to/node_modules/flexa/dist/css/themes/flexa-theme-default.css" />
<script src="path/to/node_modules/flexa/dist/js/flexa.js"></script>
```

### Theme and direction

- **Theme:** Set `data-theme` on `<html>` (e.g. `data-theme="dark"`, `data-theme="light"`, `data-theme="auto"`). With the JS bundle, use `Flexa.Theme.set('dark')`.
- **RTL:** Use `dir="rtl"` or `data-dir="rtl"` on `<html>`. With the JS bundle, use `Flexa.Direction.set('rtl')`.

## Usage Guides

For detailed usage and component examples, see the local docs in `docs/`:

- `docs/index.html` (entry page)

## Build

```bash
npm run build
```

**Outputs in `dist/`:**


| File                                     | Description                                 |
| ---------------------------------------- | ------------------------------------------- |
| `css/flexa.css`                          | Main stylesheet (expanded, with source map) |
| `css/flexa.min.css`                      | Minified for CDN                            |
| `css/themes/flexa-theme-default.css`     | Default theme (expanded, with source map)   |
| `css/themes/flexa-theme-default.min.css` | Theme minified for CDN                      |
| `js/flexa.js`                            | JavaScript library (UMD)                    |
| `js/flexa.min.js`                        | JavaScript minified for CDN                 |
| `js/flexa.min.js.map`                    | Source map for minified JS                  |


**Build script:**

- `npm run build` — Full build (clean + CSS + themes + JS + minify)

## Testing

Tests use [Vitest](https://vitest.dev/) and [jsdom](https://github.com/jsdom/jsdom) to validate the JavaScript API and verify package build integrity.

```bash
npm run test          # watch mode
npm run test:run      # single run
npm run test:coverage # single run + coverage report (text, HTML, lcov)
```

A CI/CD pipeline runs linting, testing, and build checks.
Reports are written to `coverage/`. To enforce coverage thresholds, set `thresholds` in `vitest.config.mjs`.

## Workflow

See **[WORKFLOW.md](WORKFLOW.md)** for the full step-by-step process.

## JavaScript API

The bundle is UMD (Universal Module Definition); in the browser it attaches to `window.Flexa`.

### Theme

```javascript
Flexa.Theme.set('dark');   // or 'light', 'auto'
Flexa.Theme.get();         // current theme
```

### Direction

```javascript
Flexa.Direction.set('rtl'); // or 'ltr'
Flexa.Direction.get();
```

### Button busy state

```javascript
const button = document.querySelector('#save-btn');

// Low-level API: set/get busy state directly
Flexa.ButtonBusy.set(button, true, 'Loading...');
// Disable busy status
Flexa.ButtonBusy.set(button, false);

// Convenience API: easier for async actions
Flexa.ButtonBusy.enableBusy(button, 'Saving...');
// ...await async work...
Flexa.ButtonBusy.disableBusy(button);
```

### Password toggle

Buttons with class `fx-toggle-password` and `aria-controls` pointing to an input are enhanced automatically on `Flexa.init()` (or when the script loads).

### Init

```javascript
Flexa.init(); // Theme.init(), Direction.init(), PasswordToggle.init()
```

`Flexa.init()` runs automatically on DOM ready when the script is loaded.

## Development

- **Node:** `engines.node` >= 18 (see `package.json`).
- **Linting:** Stylelint 17 with `stylelint-config-standard-scss` and `@stylistic/stylelint-plugin`.
- **Prefix:** Default class/variable prefix is `fx-` (see `src/abstracts/variables/_global.scss`).
- **Browsers:** `browserslist` in `package.json` (e.g. `>0.5%`, last 2 versions).

## Scripts


| Script                  | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `npm run build`         | Full build (clean + CSS + themes + JS + minify)                |
| `npm run lint`          | Lint SCSS (`stylelint:scss`)                                   |
| `npm run lint:fix`      | Lint and fix SCSS                                              |
| `npm run test`          | Vitest watch                                                   |
| `npm run test:run`      | Vitest single run                                              |
| `npm run test:coverage` | Vitest run + coverage report                                   |
| `npm run clean`         | Remove `dist/` directory (run automatically before full build) |
