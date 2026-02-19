# Flexa

Compact CSS package for developing web UI. Responsive-ready and easy to use.

## Features

- **Source maps** — Debug with original SCSS line numbers
- **Sass (SCSS)** — Variables, mixins, and modular architecture
- **CDN-ready build** — Minified CSS for unpkg and jsDelivr
- **CSS Cascade Layers** — Predictable cascade control
- **Utility-first** — Utility classes generated from design tokens
- **Theme support** — Dark/light themes and `prefers-color-scheme`
- **RTL / LTR** — Full direction support via selectors
- **Design tokens** — Colors, spacing, typography, borders, shadows, transitions, flexbox, and more

## Installation

```bash
npm install
```

## Usage

### CDN

```html
<!-- unpkg -->
<link rel="stylesheet" href="https://unpkg.com/flexa@1/dist/core.min.css" />

<!-- jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flexa@1/dist/core.min.css" />
```

### npm / Local build

After `npm run build`, link the built files:

```html
<link rel="stylesheet" href="path/to/dist/flexa.css" />
<!-- Optional theme -->
<link rel="stylesheet" href="path/to/dist/themes/flexa-theme-default.css" />
<!-- Optional JavaScript -->
<script src="path/to/dist/flexa.js"></script>
```

### ES Modules

```javascript
import { setTheme, getTheme, initSelects } from 'flexa/src/js/index.js';
```

### Theme and direction

- **Theme:** Set `data-theme` or `theme` on `<html>` (e.g. `data-theme="dark"`, `data-theme="auto"`).
- **RTL:** Use `dir="rtl"` or `data-dir="rtl"` on `<html>` for RTL variables.

## Build

```bash
npm run build
```

**Outputs in `dist/`:**

| File | Description |
|------|-------------|
| `core.css` | Main stylesheet (expanded, with source map) |
| `core.min.css` | Minified for CDN |
| `themes/theme-default.css` | Default theme (expanded, with source map) |
| `themes/theme-default.min.css` | Theme minified for CDN |
| `flexa.js` | JavaScript library (UMD format) |

**Individual steps:**

- `npm run build:css` — Build `core.css` only
- `npm run build:themes` — Build theme CSS only
- `npm run build:js` — Copy JavaScript files to `dist/`
- `npm run build:cdn` — Minify `core.css` → `core.min.css`
- `npm run build:themes:cdn` — Minify theme → `theme-default.min.css`

## Project structure

```
flexa/
├── src/
│   ├── core.scss              # Main entry
│   ├── abstracts/
│   │   ├── _functions.scss    # Sass helpers
│   │   ├── variables/         # Design tokens (colors, spacing, typography, etc.)
│   │   │   ├── _index.scss
│   │   │   ├── _global.scss
│   │   │   ├── _colors.scss
│   │   │   ├── _spacing.scss
│   │   │   ├── _typography.scss
│   │   │   ├── _borders.scss
│   │   │   ├── _shadows.scss
│   │   │   ├── _transitions.scss
│   │   │   ├── _sizing.scss
│   │   │   ├── _flexbox.scss
│   │   │   ├── _utilities.scss
│   │   │   └── ...
│   │   └── mixins/            # Theme, typography, utilities, banner
│   │       ├── _index.scss
│   │       ├── _theme.scss
│   │       ├── _utilities.scss
│   │       └── ...
│   ├── foundation/            # Base styles, headings
│   │   ├── _index.scss
│   │   ├── _base.scss
│   │   └── _headings.scss
│   ├── js/                    # JavaScript modules
│   │   ├── index.js          # ES modules entry point
│   │   ├── theme.js          # Theme management
│   │   ├── select.js         # Select component enhancement
│   │   └── flexa.js          # UMD bundle for browsers
│   └── themes/
│       └── theme-default.scss
├── dist/                      # Production build (generated)
├── examples/                  # Demos and playground
├── docs/
├── stylelint.config.mjs       # Stylelint 17 + SCSS + stylistic
├── postcss.config.cjs         # Autoprefixer + cssnano
└── package.json
```

## JavaScript API

### Theme Management

```javascript
// Using UMD (browser)
Flexa.Theme.set('dark');        // Set theme to dark
Flexa.Theme.set('light');       // Set theme to light
Flexa.Theme.set('auto');        // Use system preference
Flexa.Theme.get();              // Get current theme
Flexa.Theme.init();             // Initialize theme from localStorage

// Using ES Modules
import { setTheme, getTheme, initTheme } from 'flexa/src/js/index.js';
setTheme('dark');
getTheme();
initTheme();
```

### Select Component Enhancement

The JavaScript automatically enhances `<select>` elements with `fx-select` class to manage `aria-expanded` attribute for proper arrow icon display.

```javascript
// Auto-initialized, but can be manually initialized
import { initSelects } from 'flexa/src/js/index.js';
initSelects();
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Full build (clean + CSS + themes + JS + minify) |
| `npm run build:css` | Build `core.css` |
| `npm run build:themes` | Build theme CSS |
| `npm run build:js` | Copy JavaScript files to `dist/` |
| `npm run build:cdn` | Minify core for CDN |
| `npm run build:themes:cdn` | Minify theme for CDN |
| `npm run stylelint:scss` | Lint SCSS |
| `npm run stylelint:scss:fix` | Lint and auto-fix SCSS |
| `npm run stylelint:css` | Lint built CSS |

## Development

- **Linting:** Stylelint 17 with `stylelint-config-standard-scss` and `@stylistic/stylelint-plugin`.
- **Prefix:** Default CSS variable/class prefix is `fx-` (configurable in `src/abstracts/variables/_global.scss`).
- **Browsers:** Defined in `browserslist` in `package.json` (e.g. `>0.5%`, last 2 versions).

## License

MIT
