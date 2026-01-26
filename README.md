# Flexa

Starter project for building a custom CSS package with:
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
- `core.css` (with sourcemap)
- `core.min.css` (for CDN)
- `themes/theme-default.css` (with sourcemap)
- `themes/theme-default.min.css` (for CDN)

## Project structure

```
src/
  core.scss
  themes/
    theme-default.scss
dist/          # Production build
  core.css
  core.min.css
  themes/
    theme-default.css
    theme-default.min.css
```
