# Flexa

Compact CSS for web and micro UIs. Responsive ready and easy to use.

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
git clone https://github.com/DokuDesk/flexa.git
cd flexa
npm install
```

## Usage

### CDN

```html
<!-- unpkg -->
<link rel="stylesheet" href="https://unpkg.com/flexa@1/dist/css/flexa.min.css" />

<!-- jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flexa@1/dist/css/flexa.min.css" />

<!-- default theme -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flexa@1/dist/css/themes/flexa-theme-default.min.css" />

<!-- JavaScript (theme, direction, button busy, password toggle) -->
<script src="https://cdn.jsdelivr.net/npm/flexa@1/dist/js/flexa.min.js"></script>
```

### npm / Local build

After `npm run build`, use the built files:

```html
<link rel="stylesheet" href="path/to/node_modules/flexa/dist/css/flexa.css" />
<!-- Optional theme -->
<link rel="stylesheet" href="path/to/node_modules/flexa/dist/css/themes/flexa-theme-default.css" />
<!-- Optional JavaScript -->
<script src="path/to/node_modules/flexa/dist/js/flexa.js"></script>
```

### Theme and direction

- **Theme:** Set `data-theme` on `<html>` (e.g. `data-theme="dark"`, `data-theme="light"`, `data-theme="auto"`). With the JS bundle, use `Flexa.Theme.set('dark')`.
- **RTL:** Use `dir="rtl"` or `data-dir="rtl"` on `<html>`. With the JS bundle, use `Flexa.Direction.set('rtl')`.

## Build

```bash
npm run build
```

**Outputs in `dist/`:**

| File | Description |
|------|-------------|
| `css/flexa.css` | Main stylesheet (expanded, with source map) |
| `css/flexa.min.css` | Minified for CDN |
| `css/themes/flexa-theme-default.css` | Default theme (expanded, with source map) |
| `css/themes/flexa-theme-default.min.css` | Theme minified for CDN |
| `js/flexa.js` | JavaScript library (UMD) |
| `js/flexa.min.js` | JavaScript minified for CDN |
| `js/flexa.min.js.map` | Source map for minified JS |

**Individual steps:**

- `npm run build` — Full build (clean + CSS + themes + JS + minify)
- `npm run build:css` — Build `dist/css/flexa.css`
- `npm run build:themes` — Build theme CSS
- `npm run build:js` — Copy `src/js/flexa.js` to `dist/js/flexa.js`
- `npm run build:cdn` — Minify main CSS → `flexa.min.css`
- `npm run build:themes:cdn` — Minify theme CSS
- `npm run build:js:cdn` — Minify JS → `flexa.min.js`

## Testing

Tests use [Vitest](https://vitest.dev/) and [jsdom](https://github.com/jsdom/jsdom). The suite covers the JavaScript API (Theme, Direction, ButtonBusy, PasswordToggle, `init`) and package build output (CSS/JS and minified assets).

```bash
npm run test          # watch mode
npm run test:run      # single run (runs build:js first)
npm run test:coverage # single run + coverage report (text, HTML, lcov)
```

Reports are written to `coverage/`. To enforce coverage thresholds, set `thresholds` in `vitest.config.mjs`.

## JavaScript API

The bundle is UMD; in the browser it attaches to `window.Flexa`.

### Theme

```javascript
Flexa.Theme.set('dark');   // or 'light', 'auto'
Flexa.Theme.get();         // current theme
Flexa.Theme.init();        // init from storage / system
```

### Direction

```javascript
Flexa.Direction.set('rtl'); // or 'ltr'
Flexa.Direction.get();
Flexa.Direction.init();
```

### Button busy state

```javascript
Flexa.ButtonBusy.set(buttonElement, true, 'Loading…');
Flexa.ButtonBusy.get(buttonElement);
Flexa.ButtonBusy.enableBusy(button, 'Saving…');
Flexa.ButtonBusy.disableBusy(button);
```

### Password toggle

Buttons with class `fx-toggle-password` and `aria-controls` pointing to an input are enhanced automatically on `Flexa.init()` (or when the script loads).

### Init

```javascript
Flexa.init(); // Theme.init(), Direction.init(), PasswordToggle.init()
```

`Flexa.init()` runs automatically on DOM ready when the script is loaded.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Full build (clean + CSS + themes + JS + minify) |
| `npm run build:css` | Build `dist/css/flexa.css` |
| `npm run build:themes` | Build theme CSS |
| `npm run build:js` | Copy JS to `dist/js/flexa.js` |
| `npm run build:cdn` | Minify main CSS |
| `npm run build:themes:cdn` | Minify theme CSS |
| `npm run build:js:cdn` | Minify JS |
| `npm run lint` | Lint SCSS (`stylelint:scss`) |
| `npm run lint:fix` | Lint and fix SCSS |
| `npm run stylelint:scss` | Lint `src/**/*.scss` |
| `npm run stylelint:css` | Lint `dist/css` and `docs/assets/css` |
| `npm run test` | Vitest watch |
| `npm run test:run` | Vitest single run |
| `npm run test:coverage` | Vitest run + coverage report |
| `npm run clean:build` | Remove `build/` directory |
| `npm run clean:dist` | Remove `dist/` directory (run automatically before full build) |

## Development

- **Node:** `engines.node` >= 18 (see `package.json`).
- **Linting:** Stylelint 17 with `stylelint-config-standard-scss` and `@stylistic/stylelint-plugin`.
- **Prefix:** Default class/variable prefix is `fx-` (see `src/abstracts/variables/_global.scss`).
- **Browsers:** `browserslist` in `package.json` (e.g. `>0.5%`, last 2 versions).

## Project structure

```
flexa/
├── src/
│   ├── flexa.scss                    # Main SCSS entry
│   ├── abstracts/
│   │   ├── _functions.scss
│   │   ├── variables/                # Design tokens
│   │   │   ├── _index.scss
│   │   │   ├── _global.scss
│   │   │   ├── _colors.scss
│   │   │   ├── _typography.scss
│   │   │   ├── _spacing.scss
│   │   │   ├── _borders.scss
│   │   │   ├── _shadows.scss
│   │   │   ├── _flexbox.scss
│   │   │   ├── _utilities.scss
│   │   │   └── ...
│   │   └── mixins/
│   │       ├── _index.scss
│   │       ├── _theme.scss
│   │       ├── _utilities.scss
│   │       └── ...
│   ├── foundation/
│   │   ├── _index.scss
│   │   ├── _base.scss
│   │   └── _headings.scss
│   ├── component/
│   │   ├── _index.scss
│   │   ├── _button.scss
│   │   ├── _input.scss
│   │   ├── _select.scss
│   │   ├── _card.scss
│   │   └── ...
│   ├── js/
│   │   └── flexa.js                  # UMD bundle
│   └── themes/
│       └── flexa-theme-default.scss
├── dist/                             # Build output (generated)
├── docs/                             # Documentation and showcase
│   ├── assets/
│   └── showcase/
├── tests/
│   ├── js/flexa.test.js              # JS API tests
│   └── package-build.test.js         # Build output smoke tests
├── stylelint.config.mjs
├── postcss.config.cjs
├── vitest.config.mjs
└── package.json
```
