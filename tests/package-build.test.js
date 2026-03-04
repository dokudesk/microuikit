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

const PREFIX = 'fx-';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distRoot = path.join(projectRoot, 'dist');
const distCss = path.join( distRoot, 'css');
const distJs = path.join(distRoot, 'js');
const distThemes = path.join(distCss, 'themes');
const mainCss = path.join(distCss, 'flexa.css');
const mainMinCss = path.join(distCss, 'flexa.min.css');
const mainJs = path.join(distJs, 'flexa.js');
const mainMinJs = path.join(distJs, 'flexa.min.js');
const themeCss = path.join(distThemes, 'flexa-theme-default.css');
const themeMinCss = path.join(distThemes, 'flexa-theme-default.min.css');

beforeAll(() => {
  // If build artifacts don't exist (e.g. running vitest directly),
  // run a full build once for all tests.
  if (!fs.existsSync(mainCss) || !fs.existsSync(mainMinCss) || 
      !fs.existsSync(themeCss) || !fs.existsSync(themeMinCss) ||
      !fs.existsSync(mainJs) || !fs.existsSync(mainMinJs)) 
  {
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
  }
});

describe('Package build output', () => {

  it('dist/css/flexa.css exists after build', () => {
    expect(fs.existsSync(mainCss)).toBe(true);
    expect(fs.statSync(mainCss).size).toBeGreaterThan(0);
  });

  it('main CSS contains :root design tokens', () => {
    if (!fs.existsSync(mainCss)) return;
    const content = fs.readFileSync(mainCss, 'utf8');
    expect(content).toMatch(/:root/);
    expect(content).toMatch(/\[data-theme/);
    expect(content).toMatch(new RegExp(`--${PREFIX}`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}`));
  });

  it('main CSS contains core components', () => {
    if (!fs.existsSync(mainCss)) return;
    const content = fs.readFileSync(mainCss, 'utf8');
    expect(content).toMatch(new RegExp(`\\.${PREFIX}btn`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}input`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}input-frame`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}textarea`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}textarea-frame`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}checkbox`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}checkbox-frame`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}radio`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}radio-frame`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}select`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}select-frame`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}card`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}card-header`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}card-body`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}card-footer`));
  });

  it('dist/js/flexa.js exists after build', () => {
    expect(fs.existsSync(mainJs)).toBe(true);
    expect(fs.statSync(mainJs).size).toBeGreaterThan(0);
  });

  it('main JS bundle exposes API', () => {
    if (!fs.existsSync(mainJs)) return;
    const content = fs.readFileSync(mainJs, 'utf8');
    expect(content).toMatch(/Theme/);
    expect(content).toMatch(/Direction/);
    expect(content).toMatch(/ButtonBusy/);
    expect(content).toMatch(/PasswordToggle/);
    expect(content).toMatch(/PREFIX/);
  });
});

describe('Theme build output', () => {

  it('dist/css/themes/flexa-theme-default.css exists', () => {
    expect(fs.existsSync(themeCss)).toBe(true);
    expect(fs.statSync(themeCss).size).toBeGreaterThan(0);
  });

  it('theme CSS contains theme-related selectors or variables', () => {
    if (!fs.existsSync(themeCss)) return;
    const content = fs.readFileSync(themeCss, 'utf8');
    expect(content).toMatch(/:root/);
    expect(content).toMatch(/\[data-theme/);
    expect(content).toMatch(new RegExp(`--${PREFIX}`));
    /* There is no .${PREFIX} in the theme CSS file */
  });
});

describe('Minified (CDN) build output', () => {
  it('dist/css/flexa.min.css exists and has content (minified)', () => {
    const minified = path.join(distCss, 'flexa.min.css');
    expect(fs.existsSync(minified)).toBe(true);
    expect(fs.statSync(minified).size).toBeGreaterThan(0);
  });

  it('flexa.min.css contains core tokens or selectors (minified)', () => {
    if (!fs.existsSync(mainMinCss)) return;
    const content = fs.readFileSync(mainMinCss, 'utf8');
    expect(content).toMatch(/:root/);
    expect(content).toMatch(/\[data-theme/);
    expect(content).toMatch(new RegExp(`--${PREFIX}`));
    expect(content).toMatch(new RegExp(`\\.${PREFIX}`));
  });

  it('dist/css/themes/flexa-theme-default.min.css exists', () => {
    const themeMin = path.join(distThemes, 'flexa-theme-default.min.css');
    expect(fs.existsSync(themeMin)).toBe(true);
    expect(fs.statSync(themeMin).size).toBeGreaterThan(0);
  });

  it('flexa-theme-default.min.css contains theme-related selectors or variables  (minified)', () => {
    if (!fs.existsSync(themeMinCss)) return;
    const content = fs.readFileSync(themeMinCss, 'utf8');
    expect(content).toMatch(/:root/);
    expect(content).toMatch(/\[data-theme/);
    expect(content).toMatch(new RegExp(`--${PREFIX}`));
    /* There is no .${PREFIX} in the theme minified CSS file */
  });

  it('dist/js/flexa.min.js exists and exposes API (minified)', () => {
    expect(fs.existsSync(mainMinJs)).toBe(true);
    expect(fs.statSync(mainMinJs).size).toBeGreaterThan(0);
  });

  it('flexa.min.js exposes API (minified)', () => {
    if (!fs.existsSync(mainMinJs)) return;
    const content = fs.readFileSync(mainMinJs, 'utf8');
    expect(content).toMatch(/Theme/);
    expect(content).toMatch(/Direction/);
    expect(content).toMatch(/ButtonBusy/);
    expect(content).toMatch(/PasswordToggle/);
    expect(content).toMatch(/PREFIX/);
  });
});
