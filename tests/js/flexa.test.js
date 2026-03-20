/**
 * Unit tests for Flexa JS API (Theme, Direction, ButtonBusy, PasswordToggle, Collapse, init).
 * Loads the UMD bundle by reading and running in global scope so it attaches to window/global.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';

const PREFIX = 'fx-';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const flexaPath = path.resolve(__dirname, '../../dist/js/flexa.js');

let Flexa;
beforeAll(() => {
  const umdCode = fs.readFileSync(flexaPath, 'utf8');
  const run = new Function('window', 'document', 'globalThis', umdCode + '\nreturn globalThis.Flexa;');
  Flexa = run(globalThis, typeof document !== 'undefined' ? document : undefined, globalThis);
});

describe('Flexa API', () => {
  it('exposes PREFIX and all public modules', () => {
    expect(Flexa.PREFIX).toBe(PREFIX);
    expect(Flexa.Theme).toBeDefined();
    expect(Flexa.Direction).toBeDefined();
    expect(Flexa.ButtonBusy).toBeDefined();
    expect(Flexa.PasswordToggle).toBeDefined();
    expect(Flexa.Collapse).toBeDefined();
    expect(typeof Flexa.init).toBe('function');
  });
});

describe('Theme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    Flexa.Theme.set('light');
  });

  it('get() returns "light" when data-theme is not set', () => {
    expect(Flexa.Theme.get()).toBe('light');
  });

  it('set() applies data-theme and get() returns it', () => {
    Flexa.Theme.set('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(Flexa.Theme.get()).toBe('dark');

    Flexa.Theme.set('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(Flexa.Theme.get()).toBe('light');
  });

  it('set() dispatches flexa:theme-change', () => {
    const spy = vi.fn();
    document.documentElement.addEventListener('flexa:theme-change', spy);
    Flexa.Theme.set('dark');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.theme).toBe('dark');
    document.documentElement.removeEventListener('flexa:theme-change', spy);
  });

  it('set("auto") syncs data-theme with prefers-color-scheme', () => {
    window.matchMedia = vi.fn((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));
    Flexa.Theme.set('auto');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(Flexa.Theme.get()).toBe('dark');
  });
});

describe('Direction', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('data-dir', 'ltr');
  });

  it('get() returns current dir', () => {
    expect(Flexa.Direction.get()).toBe('ltr');
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('data-dir', 'rtl');
    expect(Flexa.Direction.get()).toBe('rtl');
  });

  it('set() updates dir and data-dir', () => {
    Flexa.Direction.set('rtl');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('data-dir')).toBe('rtl');
    Flexa.Direction.set('ltr');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(document.documentElement.getAttribute('data-dir')).toBe('ltr');
  });

  it('set() dispatches flexa:direction-change', () => {
    const spy = vi.fn();
    document.documentElement.addEventListener('flexa:direction-change', spy);
    Flexa.Direction.set('rtl');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.direction).toBe('rtl');
    document.documentElement.removeEventListener('flexa:direction-change', spy);
  });
});

describe('ButtonBusy', () => {
  let button;

  beforeEach(() => {
    button = document.createElement('button');
    button.setAttribute('aria-busy', 'false');
    document.body.appendChild(button);
  });

  afterEach(() => {
    button.remove();
  });

  it('set(element, true) sets aria-busy="true"', () => {
    Flexa.ButtonBusy.set(button, true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('set(element, true, label) sets aria-label', () => {
    Flexa.ButtonBusy.set(button, true, 'Loading…');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Loading…');
  });

  it('set(element, false) sets aria-busy="false"', () => {
    Flexa.ButtonBusy.set(button, false);
    expect(button.getAttribute('aria-busy')).toBe('false');
  });

  it('get(element) returns busy state', () => {
    Flexa.ButtonBusy.set(button, false);
    expect(Flexa.ButtonBusy.get(button)).toBe(false);
    Flexa.ButtonBusy.set(button, true);
    expect(Flexa.ButtonBusy.get(button)).toBe(true);
  });

  it('set(selector, busy) works with CSS selector', () => {
    button.id = 'btn-busy';
    Flexa.ButtonBusy.set('#btn-busy', true);
    expect(Flexa.ButtonBusy.get(button)).toBe(true);
  });

  it('get(missing) returns false', () => {
    expect(Flexa.ButtonBusy.get('#nonexistent')).toBe(false);
  });

  it('set(missing, busy) does not throw', () => {
    expect(() => Flexa.ButtonBusy.set('#nonexistent', true)).not.toThrow();
  });

  it('enableBusy / disableBusy delegate to set', () => {
    Flexa.ButtonBusy.enableBusy(button, 'Please wait');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Please wait');
    Flexa.ButtonBusy.disableBusy(button);
    expect(button.getAttribute('aria-busy')).toBe('false');
  });

  it('set() dispatches flexa:button-busy', () => {
    const spy = vi.fn();
    button.addEventListener('flexa:button-busy', spy);
    Flexa.ButtonBusy.set(button, true);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { busy: true } }));
    Flexa.ButtonBusy.set(button, false);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { busy: false } }));
    expect(spy).toHaveBeenCalledTimes(2);
    button.removeEventListener('flexa:button-busy', spy);
  });
});

describe('PasswordToggle', () => {
  it('init() does not throw when no toggle buttons exist', () => {
    expect(() => Flexa.PasswordToggle.init()).not.toThrow();
  });

  it('init() binds click on button.fx-toggle-password with linked input', () => {
    const input = document.createElement('input');
    input.type = 'password';
    input.id = 'pwd';
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('fx-toggle-password');
    button.setAttribute('aria-controls', 'pwd');
    document.body.appendChild(input);
    document.body.appendChild(button);

    Flexa.PasswordToggle.init();

    expect(input.type).toBe('password');
    button.click();
    expect(input.type).toBe('text');
    button.click();
    expect(input.type).toBe('password');

    input.remove();
    button.remove();
  });
});

describe('Collapse', () => {
  let trigger;
  let target;

  const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

  afterEach(() => {
    if (trigger && trigger.parentNode) trigger.parentNode.removeChild(trigger);
    if (target && target.parentNode) target.parentNode.removeChild(target);
    trigger = null;
    target = null;
  });

  it('init() toggles vertical collapse target via trigger', async () => {
    trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.setAttribute('data-toggle', 'collapse');
    trigger.setAttribute('data-target', '#collapse-target-vertical');
    trigger.setAttribute('aria-expanded', 'false');

    target = document.createElement('div');
    target.id = 'collapse-target-vertical';
    target.className = 'fx-collapse';
    target.textContent = 'Vertical body';

    document.body.appendChild(trigger);
    document.body.appendChild(target);

    Flexa.Collapse.init();

    trigger.click();
    await nextTick();
    expect(target.classList.contains('show')).toBe(true);

    trigger.click();
    await nextTick();
    expect(target.classList.contains('show')).toBe(false);
  });

  it('init() toggles horizontal collapse target via trigger', async () => {
    trigger = document.createElement('a');
    trigger.href = '#collapse-target-horizontal';
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('data-toggle', 'collapse');
    trigger.setAttribute('data-target', '#collapse-target-horizontal');
    trigger.setAttribute('aria-expanded', 'false');

    target = document.createElement('div');
    target.id = 'collapse-target-horizontal';
    target.className = 'fx-collapse fx-collapse-horizontal';
    target.innerHTML = '<div style="width: 12rem;">Horizontal body</div>';

    document.body.appendChild(trigger);
    document.body.appendChild(target);

    Flexa.Collapse.init();

    trigger.click();
    await nextTick();
    expect(target.classList.contains('show')).toBe(true);

    trigger.click();
    await nextTick();
    expect(target.classList.contains('show')).toBe(false);
  });
});

describe('init', () => {
  it('init() runs Theme.init, Direction.init, PasswordToggle.init, Collapse.init', () => {
    const themeInit = vi.spyOn(Flexa.Theme, 'init');
    const dirInit = vi.spyOn(Flexa.Direction, 'init');
    const pwdInit = vi.spyOn(Flexa.PasswordToggle, 'init');
    const collapseInit = vi.spyOn(Flexa.Collapse, 'init');
    Flexa.init();
    expect(themeInit).toHaveBeenCalled();
    expect(dirInit).toHaveBeenCalled();
    expect(pwdInit).toHaveBeenCalled();
    expect(collapseInit).toHaveBeenCalled();
    themeInit.mockRestore();
    dirInit.mockRestore();
    pwdInit.mockRestore();
    collapseInit.mockRestore();
  });
});
