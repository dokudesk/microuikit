/**
 * Unit tests for MicroUIKit JS API (Theme, Direction, ButtonBusy, PasswordToggle, Collapse, init).
 * Loads the UMD bundle by reading and running in global scope so it attaches to window/global.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';

const PREFIX = 'mk-';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const microuikitPath = path.resolve(__dirname, '../../dist/js/microuikit.js');

let MicroUIKit;
beforeAll(() => {
  const umdCode = fs.readFileSync(microuikitPath, 'utf8');
  const run = new Function('window', 'document', 'globalThis', umdCode + '\nreturn globalThis.MicroUIKit;');
  MicroUIKit = run(globalThis, typeof document !== 'undefined' ? document : undefined, globalThis);
});

describe('MicroUIKit API', () => {
  it('exposes PREFIX and all public modules', () => {
    expect(MicroUIKit.PREFIX).toBe(PREFIX);
    expect(MicroUIKit.Theme).toBeDefined();
    expect(MicroUIKit.Direction).toBeDefined();
    expect(MicroUIKit.ButtonBusy).toBeDefined();
    expect(MicroUIKit.PasswordToggle).toBeDefined();
    expect(MicroUIKit.Collapse).toBeDefined();
    expect(typeof MicroUIKit.init).toBe('function');
  });
});

describe('Theme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    MicroUIKit.Theme.set('light');
  });

  it('get() returns "light" when data-theme is not set', () => {
    expect(MicroUIKit.Theme.get()).toBe('light');
  });

  it('set() applies data-theme and get() returns it', () => {
    MicroUIKit.Theme.set('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(MicroUIKit.Theme.get()).toBe('dark');

    MicroUIKit.Theme.set('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(MicroUIKit.Theme.get()).toBe('light');
  });

  it('set() dispatches microuikit:theme-change', () => {
    const spy = vi.fn();
    document.documentElement.addEventListener('microuikit:theme-change', spy);
    MicroUIKit.Theme.set('dark');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.theme).toBe('dark');
    document.documentElement.removeEventListener('microuikit:theme-change', spy);
  });

  it('set("auto") syncs data-theme with prefers-color-scheme', () => {
    window.matchMedia = vi.fn((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));
    MicroUIKit.Theme.set('auto');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(MicroUIKit.Theme.get()).toBe('dark');
  });
});

describe('Direction', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('data-dir', 'ltr');
  });

  it('get() returns current dir', () => {
    expect(MicroUIKit.Direction.get()).toBe('ltr');
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('data-dir', 'rtl');
    expect(MicroUIKit.Direction.get()).toBe('rtl');
  });

  it('set() updates dir and data-dir', () => {
    MicroUIKit.Direction.set('rtl');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('data-dir')).toBe('rtl');
    MicroUIKit.Direction.set('ltr');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(document.documentElement.getAttribute('data-dir')).toBe('ltr');
  });

  it('set() dispatches microuikit:direction-change', () => {
    const spy = vi.fn();
    document.documentElement.addEventListener('microuikit:direction-change', spy);
    MicroUIKit.Direction.set('rtl');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.direction).toBe('rtl');
    document.documentElement.removeEventListener('microuikit:direction-change', spy);
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
    MicroUIKit.ButtonBusy.set(button, true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('set(element, true, label) sets aria-label', () => {
    MicroUIKit.ButtonBusy.set(button, true, 'Loading…');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Loading…');
  });

  it('set(element, false) sets aria-busy="false"', () => {
    MicroUIKit.ButtonBusy.set(button, false);
    expect(button.getAttribute('aria-busy')).toBe('false');
  });

  it('get(element) returns busy state', () => {
    MicroUIKit.ButtonBusy.set(button, false);
    expect(MicroUIKit.ButtonBusy.get(button)).toBe(false);
    MicroUIKit.ButtonBusy.set(button, true);
    expect(MicroUIKit.ButtonBusy.get(button)).toBe(true);
  });

  it('set(selector, busy) works with CSS selector', () => {
    button.id = 'btn-busy';
    MicroUIKit.ButtonBusy.set('#btn-busy', true);
    expect(MicroUIKit.ButtonBusy.get(button)).toBe(true);
  });

  it('get(missing) returns false', () => {
    expect(MicroUIKit.ButtonBusy.get('#nonexistent')).toBe(false);
  });

  it('set(missing, busy) does not throw', () => {
    expect(() => MicroUIKit.ButtonBusy.set('#nonexistent', true)).not.toThrow();
  });

  it('enableBusy / disableBusy delegate to set', () => {
    MicroUIKit.ButtonBusy.enableBusy(button, 'Please wait');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Please wait');
    MicroUIKit.ButtonBusy.disableBusy(button);
    expect(button.getAttribute('aria-busy')).toBe('false');
  });

  it('set() dispatches microuikit:button-busy', () => {
    const spy = vi.fn();
    button.addEventListener('microuikit:button-busy', spy);
    MicroUIKit.ButtonBusy.set(button, true);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { busy: true } }));
    MicroUIKit.ButtonBusy.set(button, false);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ detail: { busy: false } }));
    expect(spy).toHaveBeenCalledTimes(2);
    button.removeEventListener('microuikit:button-busy', spy);
  });
});

describe('PasswordToggle', () => {
  it('init() does not throw when no toggle buttons exist', () => {
    expect(() => MicroUIKit.PasswordToggle.init()).not.toThrow();
  });

  it('init() binds click on button.mk-toggle-password with linked input', () => {
    const input = document.createElement('input');
    input.type = 'password';
    input.id = 'pwd';
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('mk-toggle-password');
    button.setAttribute('aria-controls', 'pwd');
    document.body.appendChild(input);
    document.body.appendChild(button);

    MicroUIKit.PasswordToggle.init();

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
    target.className = 'mk-collapse';
    target.textContent = 'Vertical body';

    document.body.appendChild(trigger);
    document.body.appendChild(target);

    MicroUIKit.Collapse.init();

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
    target.className = 'mk-collapse mk-collapse-horizontal';
    target.innerHTML = '<div style="width: 12rem;">Horizontal body</div>';

    document.body.appendChild(trigger);
    document.body.appendChild(target);

    MicroUIKit.Collapse.init();

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
    const themeInit = vi.spyOn(MicroUIKit.Theme, 'init');
    const dirInit = vi.spyOn(MicroUIKit.Direction, 'init');
    const pwdInit = vi.spyOn(MicroUIKit.PasswordToggle, 'init');
    const collapseInit = vi.spyOn(MicroUIKit.Collapse, 'init');
    MicroUIKit.init();
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
