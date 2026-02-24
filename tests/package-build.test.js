/**
 * Package build smoke tests.
 * Ensures the published package output (dist/) is built and contains expected core content:
 * main CSS/JS, theme CSS, and minified (CDN) assets.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { describe, it, expect, beforeAll } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distCss = path.join(projectRoot, 'dist', 'css');
const distThemes = path.join(distCss, 'themes');
const distJs = path.join(projectRoot, 'dist', 'js');

function runBuild(script) {
  try {
    execSync(`npm run ${script}`, { cwd: projectRoot, stdio: 'pipe' });
  } catch {
    // may already exist from full build
  }
}

beforeAll(() => {
  runBuild('build:css');
  runBuild('build:themes');
  runBuild('build:cdn');
  runBuild('build:themes:cdn');
  runBuild('build:js:cdn');
});

describe('Package build output', () => {

  it('dist/css/flexa.css exists after build', () => {
    expect(fs.existsSync(path.join(distCss, 'flexa.css'))).toBe(true);
  });

  it('main CSS contains :root design tokens', () => {
    const mainCss = path.join(distCss, 'flexa.css');
    if (!fs.existsSync(mainCss)) return;
    const content = fs.readFileSync(mainCss, 'utf8');
    expect(content).toMatch(/:root\s*\{/);
    expect(content).toMatch(/--fx-/);
  });

  it('main CSS contains core utility/component selectors', () => {
    const mainCss = path.join(distCss, 'flexa.css');
    if (!fs.existsSync(mainCss)) return;
    const content = fs.readFileSync(mainCss, 'utf8');
    expect(content).toMatch(/\.fx-btn/);
    expect(content).toMatch(/\.fx-select/);
    expect(content).toMatch(/\.fx-input/);
  });

  it('dist/js/flexa.js exists (from pretest build:js)', () => {
    expect(fs.existsSync(path.join(distJs, 'flexa.js'))).toBe(true);
  });

  it('main JS bundle exposes Theme and Direction (UMD shape)', () => {
    const mainJs = path.join(distJs, 'flexa.js');
    if (!fs.existsSync(mainJs)) return;
    const content = fs.readFileSync(mainJs, 'utf8');
    expect(content).toMatch(/Theme/);
    expect(content).toMatch(/Direction/);
    expect(content).toMatch(/ButtonBusy/);
    expect(content).toMatch(/PREFIX/);
  });
});

describe('Theme build output', () => {
  it('dist/css/themes/flexa-theme-default.css exists', () => {
    const themeCss = path.join(distThemes, 'flexa-theme-default.css');
    expect(fs.existsSync(themeCss)).toBe(true);
  });

  it('theme CSS contains theme-related selectors or variables', () => {
    const themeCss = path.join(distThemes, 'flexa-theme-default.css');
    if (!fs.existsSync(themeCss)) return;
    const content = fs.readFileSync(themeCss, 'utf8');
    expect(content.length).toBeGreaterThan(0);
    expect(content).toMatch(/\[data-theme|:root|--fx-|\.fx-/);
  });
});

describe('Minified (CDN) build output', () => {
  it('dist/css/flexa.min.css exists and has content', () => {
    const minified = path.join(distCss, 'flexa.min.css');
    expect(fs.existsSync(minified)).toBe(true);
    expect(fs.statSync(minified).size).toBeGreaterThan(0);
  });

  it('flexa.min.css contains core tokens or selectors', () => {
    const minCss = path.join(distCss, 'flexa.min.css');
    if (!fs.existsSync(minCss)) return;
    const content = fs.readFileSync(minCss, 'utf8');
    expect(content).toMatch(/--fx-|\.fx-btn|\.fx-select/);
  });

  it('dist/css/themes/flexa-theme-default.min.css exists', () => {
    const themeMin = path.join(distThemes, 'flexa-theme-default.min.css');
    expect(fs.existsSync(themeMin)).toBe(true);
  });

  it('dist/js/flexa.min.js exists and exposes API (minified)', () => {
    const minJs = path.join(distJs, 'flexa.min.js');
    expect(fs.existsSync(minJs)).toBe(true);
    const content = fs.readFileSync(minJs, 'utf8');
    expect(content.length).toBeGreaterThan(0);
    expect(content).toMatch(/Theme|Direction|ButtonBusy|data-theme|aria-busy/);
  });
});
