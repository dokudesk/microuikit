<p align="center">
  <a href="https://dokudesk.com/microuikit" target="_blank">
    <img src="https://raw.githubusercontent.com/dokudesk/microuikit/HEAD/.github/microuikit.png" alt="MicroUIKit Logo" width="120" height="120">
  </a>
</p>

<h2 align="center">MicroUIKit</h2>

<p align="center">Compact and powerful front-end framework for building micro UIs.</p>

<p align="center">
  <a href="https://github.com/dokudesk/microuikit/releases"><img src="https://img.shields.io/npm/v/microuikit" alt="Latest Release"></a>
  <a href="https://www.npmjs.com/package/microuikit"><img src="https://img.shields.io/npm/dt/microuikit" alt="Total Downloads"></a>
  <a href="https://github.com/dokudesk/microuikit/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/microuikit" alt="License"></a>
</p>

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
npm install microuikit
```

**For development (clone first):**

```bash
git clone https://github.com/dokudesk/microuikit.git
cd microuikit
npm install
```

## Usage

### CDN

```html
<!-- unpkg -->
<link rel="stylesheet" href="https://unpkg.com/microuikit@latest/dist/css/microuikit.min.css" />
<link rel="stylesheet" href="https://unpkg.com/microuikit@latest/dist/css/themes/microuikit-theme-default.min.css" />
<script src="https://unpkg.com/microuikit@latest/dist/js/microuikit.min.js"></script>

<!-- jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/microuikit@latest/dist/css/microuikit.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/microuikit@latest/dist/css/themes/microuikit-theme-default.min.css" />
<script src="https://cdn.jsdelivr.net/npm/microuikit@latest/dist/js/microuikit.min.js"></script>
```

### npm / Local build

After `npm run build`, use the built files:

```html
<link rel="stylesheet" href="path/to/node_modules/microuikit/dist/css/microuikit.css" />
<link rel="stylesheet" href="path/to/node_modules/microuikit/dist/css/themes/microuikit-theme-default.css" />
<script src="path/to/node_modules/microuikit/dist/js/microuikit.js"></script>
```

### Theme and direction

- **Theme:** Set `data-theme` on `<html>` (e.g. `data-theme="dark"`, `data-theme="light"`, `data-theme="auto"`). With the JS bundle, use `MicroUIKit.Theme.set('dark')`.
- **RTL:** Use `dir="rtl"` or `data-dir="rtl"` on `<html>`. With the JS bundle, use `MicroUIKit.Direction.set('rtl')`.

## Usage Guides

For detailed usage and component examples, see the local docs in `docs/`:

- `docs/index.html` (entry page)

## Build

```bash
npm run build
```

**Outputs in `dist/`:**


| File                                       | Description                                                                 |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| `css/microuikit.css`                          | Main stylesheet (expanded)                                                  |
| `css/microuikit.min.css`                      | Minified for CDN                                                            |
| `css/themes/microuikit-theme-default.css`     | Default theme (expanded)                                                    |
| `css/themes/microuikit-theme-default.min.css` | Theme minified for CDN                                                      |
| `js/microuikit.js`                            | JavaScript library (UMD)                                                    |
| `js/microuikit.min.js`                        | JavaScript minified for CDN                                                 |
| `*.map`                                    | Source maps for debugging                                                   |


**Build script:**

- `npm run build` — Full build (clean, compile CSS/themes/JS, then create CDN minified assets)

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

The bundle is UMD (Universal Module Definition); in the browser it attaches to `window.MicroUIKit`.

### Theme

```javascript
MicroUIKit.Theme.set('dark');   // or 'light', 'auto'
MicroUIKit.Theme.get();         // current theme
```

### Direction

```javascript
MicroUIKit.Direction.set('rtl'); // or 'ltr'
MicroUIKit.Direction.get();
```

### Button busy state

```javascript
const button = document.querySelector('#save-btn');

// Low-level API: set/get busy state directly
MicroUIKit.ButtonBusy.set(button, true, 'Loading...');
// Disable busy status
MicroUIKit.ButtonBusy.set(button, false);

// Convenience API: easier for async actions
MicroUIKit.ButtonBusy.enableBusy(button, 'Saving...');
// ...await async work...
MicroUIKit.ButtonBusy.disableBusy(button);
```

### Password toggle

Buttons with class `mk-toggle-password` and `aria-controls` pointing to an input are enhanced automatically on `MicroUIKit.init()` (or when the script loads).

### Collapse

Elements with `data-toggle="collapse"` and `data-target="#target-id"` are wired automatically on `MicroUIKit.init()` (or when the script loads).  
Use `.mk-collapse` for vertical and `.mk-collapse-horizontal` for horizontal transitions, then toggle visibility with the `.show` class.

### Init

```javascript
MicroUIKit.init(); // Theme.init(), Direction.init(), PasswordToggle.init(), Collapse.init()
```

`MicroUIKit.init()` runs automatically on DOM ready when the script is loaded.

## Development

- **Node:** `engines.node` >= 18 (see `package.json`).
- **Linting:** Stylelint 17 with `stylelint-config-standard-scss` and `@stylistic/stylelint-plugin`.
- **Prefix:** Default class/variable prefix is `mk-` (see `src/abstracts/variables/_global.scss`).
- **Browsers:** `browserslist` in `package.json` (e.g. `>0.5%`, last 2 versions).

## Scripts


| Script                  | Description                                                                |
| ----------------------- | -------------------------------------------------------------------------- |
| `npm run build`         | Full build (clean, compile CSS/themes/JS, then create CDN minified assets) |
| `npm run lint`          | Lint SCSS (`stylelint:scss`)                                               |
| `npm run lint:fix`      | Lint and fix SCSS                                                          |
| `npm run test`          | Vitest watch                                                               |
| `npm run test:run`      | Vitest single run                                                          |
| `npm run test:coverage` | Vitest run + coverage report                                               |
| `npm run clean`         | Remove `dist/` directory (run automatically before build)                  |


