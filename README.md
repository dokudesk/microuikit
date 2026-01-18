# Flexa

Starter project for building a custom CSS package with:
- Watch mode
- Sourcemap
- Sass support
- CDN-ready build

## Setup

```bash
npm install
```

## Build outputs

```bash
npm run build
```

Outputs in `dist/`:
- `flexa.css` (with sourcemap)
- `flexa.min.css` (for CDN)
- `themes/default.css` (with sourcemap)
- `themes/default.min.css` (for CDN)

## Publish to npm + jsDelivr

1) Build the CSS:

```bash
npm run build
```

2) Publish to npm:

```bash
npm publish
```

3) Use via jsDelivr:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/flexa@0.1.0/dist/flexa.min.css"
/>
```

## Watch mode

Start watching for changes:

```bash
npm run watch
```

Stop watching:

Press `Ctrl + C` in the terminal to stop the watch process.

Watch outputs are generated in `build/` directory (separate from production `dist/`).

## Project structure

```
src/
  flexa.scss
  themes/
    default.scss
dist/          # Production build
  flexa.css
  flexa.min.css
  themes/
    default.css
    default.min.css
build/         # Watch mode output (gitignored)
  flexa.css
  flexa.css.map
  themes/
    default.css
    default.css.map
```
