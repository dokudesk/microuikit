/**
 * MicroUIKit JavaScript Library (Browser Bundle)
 * UMD version for direct browser usage
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(factory);
  } else {
    // Browser globals
    global.MicroUIKit = factory();
  }
}(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  /**
   * Prefix configuration
   * Change this value to customize class prefixes
   * Default prefix is 'mk-' (MicroUIKit)
   */
  var PREFIX = 'mk-';

  /**
   * Theme Manager
   */
  const Theme = {
    _mediaQuery: null,
    _handler: null,

    _updateFromSystem: function (mediaQuery) {
      document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
    },

    set: function (theme) {
      var html = document.documentElement;

      if (theme === 'auto') {
        html.removeAttribute('data-theme');
        this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this._handler = this._updateFromSystem.bind(this);
        this._updateFromSystem(this._mediaQuery);
        this._mediaQuery.addEventListener('change', this._handler);
      } else {
        if (this._mediaQuery && this._handler) {
          this._mediaQuery.removeEventListener('change', this._handler);
          this._mediaQuery = null;
          this._handler = null;
        }
        html.setAttribute('data-theme', theme);
      }

      html.dispatchEvent(new CustomEvent('microuikit:theme-change', { detail: { theme: theme } }));
    },

    get: function () {
      return document.documentElement.getAttribute('data-theme') || 'light';
    },

    init: function () {
      this.set(this.get() || 'auto');
    }
  };

  /**
   * Direction Manager
   */
  const Direction = {
    set: function (direction) {
      var html = document.documentElement;

      if (direction === 'rtl' || direction === 'ltr') {
        html.setAttribute('dir', direction);
        html.setAttribute('data-dir', direction);
      }

      html.dispatchEvent(new CustomEvent('microuikit:direction-change', { detail: { direction: direction } }));
    },

    get: function () {
      var html = document.documentElement;
      return html.getAttribute('dir') || html.getAttribute('data-dir') || 'ltr';
    },

    init: function () {
      var current = this.get();
      if (current !== 'ltr' && current !== 'rtl') {
        this.set('ltr');
      }
    }
  };

  /**
   * Button Busy Manager
   */
  const ButtonBusy = {
    /**
     * Set button busy state
     * @param {HTMLElement|string} button - Button element or selector
     * @param {boolean} busy - Busy state
     * @param {string} label - Optional label to show when busy
     */
    set: function (button, busy, label) {
      var btn = typeof button === 'string' ? document.querySelector(button) : button;
      if (!btn) return;

      if (busy) {
        btn.setAttribute('aria-busy', 'true');
        if (label) {
          btn.setAttribute('aria-label', label);
        }
        btn.dispatchEvent(new CustomEvent('microuikit:button-busy', { detail: { busy: true } }));
      } else {
        btn.setAttribute('aria-busy', 'false');
        btn.dispatchEvent(new CustomEvent('microuikit:button-busy', { detail: { busy: false } }));
      }
    },

    /**
     * Get button busy state
     * @param {HTMLElement|string} button - Button element or selector
     * @returns {boolean} Busy state
     */
    get: function (button) {
      var btn = typeof button === 'string' ? document.querySelector(button) : button;
      if (!btn) return false;
      return btn.getAttribute('aria-busy') === 'true';
    },

    /**
     * Enable busy state for button
     * @param {HTMLElement|string} button - Button element or selector
     * @param {string} label - Optional label to show when busy
     */
    enableBusy: function (button, label) {
      this.set(button, true, label);
    },

    /**
     * Disable busy state for button
     * @param {HTMLElement|string} button - Button element or selector
     */
    disableBusy: function (button) {
      this.set(button, false);
    }
  };

  /**
   * Password Toggle Manager
   */
  const PasswordToggle = {
    /**
     * Update button state based on password visibility
     */
    _updateState: function (button, input, isHidden) {
      button.setAttribute('aria-pressed', String(isHidden));
      button.setAttribute('aria-label', isHidden ? 'Show password' : 'Hide password');
      input.type = isHidden ? 'password' : 'text';
    },

    /**
     * Initialize password toggle buttons
     */
    init: function () {
      document.querySelectorAll('button.' + PREFIX + 'toggle-password').forEach(function (button) {
        const input = document.getElementById(button.getAttribute('aria-controls'));
        if (!input || (input.type !== 'password' && input.type !== 'text')) return;

        // Set initial state
        PasswordToggle._updateState(button, input, input.type === 'password');

        // Handle click
        button.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          PasswordToggle._updateState(button, input, input.type === 'text');
        });
      });
    }
  };

  /**
   * Collapse Manager
   */
  const Collapse = {

    // Simple guard to avoid concurrent transitions.
    // Note: this is global for all collapse elements in current implementation.
    _isTransitioning: false,

    _getDimension(element) {
      // Horizontal collapse animates width, otherwise animate height.
      return element.classList.contains(PREFIX + 'collapse-horizontal')
        ? 'width'
        : 'height';
    },

    _getScrollSize(element, dimension) {
      return dimension === 'width' ? element.scrollWidth : element.scrollHeight;
    },

    _show(element) {

      if (!element || element.classList.contains('show') || this._isTransitioning) return;

      const dimension = this._getDimension(element);
      const collapsingClass = PREFIX + 'collapsing';

      this._isTransitioning = true;

      element.classList.remove(PREFIX + 'collapse');
      element.classList.add(collapsingClass);
      element.style[dimension] = '0px';

      // Force reflow so the browser commits the start value before transition.
      void element.offsetHeight;

      const size = this._getScrollSize(element, dimension);
      element.style[dimension] = size + 'px';

      this._waitTransitionEnd(element, () => {

        element.classList.remove(collapsingClass);
        element.classList.add(PREFIX + 'collapse', 'show');

        element.style[dimension] = '';
        this._isTransitioning = false;

      });

    },

    _hide(element) {

      if (!element || !element.classList.contains('show') || this._isTransitioning) return;

      const dimension = this._getDimension(element);
      const collapsingClass = PREFIX + 'collapsing';

      this._isTransitioning = true;

      const rect = element.getBoundingClientRect();

      // Lock current size first, then transition to zero.
      element.style[dimension] = rect[dimension] + 'px';

      // Force reflow between fixed size and collapsing state.
      void element.offsetHeight;

      element.classList.remove('show');
      element.classList.remove(PREFIX + 'collapse');
      element.classList.add(collapsingClass);

      element.style[dimension] = '0px';

      this._waitTransitionEnd(element, () => {

        element.classList.remove(collapsingClass);
        element.classList.add(PREFIX + 'collapse');

        element.style[dimension] = '';
        this._isTransitioning = false;

      });

    },

    _waitTransitionEnd(element, callback) {

      // Fallback timeout guarantees cleanup when transitionend is missed.
      const duration = parseFloat(getComputedStyle(element).transitionDuration) * 1000;

      let called = false;

      const handler = () => {
        if (called) return;
        called = true;

        element.removeEventListener('transitionend', handler);
        callback();
      };

      element.addEventListener('transitionend', handler);

      setTimeout(handler, duration + 50);
    },

    _toggle(element) {
      if (!element) return;

      if (element.classList.contains('show')) {
        this._hide(element);
      } else {
        this._show(element);
      }
    },

    init() {

      // Event delegation: one listener handles all [data-toggle='collapse'] triggers.
      document.addEventListener('click', (e) => {

        const trigger = e.target.closest("[data-toggle='collapse']");
        if (!trigger) return;

        e.preventDefault();

        const selector = trigger.getAttribute('data-target');
        if (!selector) return;

        const target = document.querySelector(selector);
        if (!target) return;

        const expanded = target.classList.contains('show');

        this._toggle(target);

        if (trigger.hasAttribute('aria-expanded')) {
          trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }

      });

    }

  };
  /**
   * Initialize all MicroUIKit components
   */
  function init() {
    Theme.init();
    Direction.init();
    PasswordToggle.init();
    Collapse.init();
  }

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  return {
    PREFIX: PREFIX,
    Theme: Theme,
    Direction: Direction,
    ButtonBusy: ButtonBusy,
    PasswordToggle: PasswordToggle,
    Collapse: Collapse,
    init: init
  };
}));
