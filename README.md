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
dist/          # Production build (gitignored)
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
