/**
 * Flexa JavaScript Library (Browser Bundle)
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
    global.Flexa = factory();
  }
}(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  /**
   * Prefix configuration
   * Change this value to customize class prefixes
   */
  var PREFIX = 'fx-';

  /**
   * Theme Manager
   */
  const Theme = {
    _mediaQuery: null,
    _handler: null,

    _updateFromSystem: function(mediaQuery) {
      document.documentElement.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
    },

    set: function(theme) {
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
      
      html.dispatchEvent(new CustomEvent('flexa:theme-change', { detail: { theme: theme } }));
    },

    get: function() {
      return document.documentElement.getAttribute('data-theme') || 'light';
    },

    init: function() {
      this.set(this.get() || 'auto');
    }
  };

  /**
   * Direction Manager
   */
  const Direction = {
    set: function(direction) {
      var html = document.documentElement;
      
      if (direction === 'rtl' || direction === 'ltr') {
        html.setAttribute('dir', direction);
        html.setAttribute('data-dir', direction);
      }
      
      html.dispatchEvent(new CustomEvent('flexa:direction-change', { detail: { direction: direction } }));
    },

    get: function() {
      var html = document.documentElement;
      return html.getAttribute('dir') || html.getAttribute('data-dir') || 'ltr';
    },

    init: function() {
      var current = this.get();
      if (current !== 'ltr' && current !== 'rtl') {
        this.set('ltr');
      }
    }
  };

  /**
   * Password Toggle Manager
   */
  const PasswordToggle = {
    /**
     * Update button state based on password visibility
     */
    _updateState: function(button, input, isHidden) {
      button.setAttribute('aria-pressed', String(isHidden));
      button.setAttribute('aria-label', isHidden ? 'Show password' : 'Hide password');
      input.type = isHidden ? 'password' : 'text';
    },

    /**
     * Initialize password toggle buttons
     */
    init: function() {
      document.querySelectorAll('button.' + PREFIX + 'toggle-password').forEach(function(button) {
        const input = document.getElementById(button.getAttribute('data-action'));
        if (!input || (input.type !== 'password' && input.type !== 'text')) return;
        
        // Set initial state
        PasswordToggle._updateState(button, input, input.type === 'password');
        
        // Handle click
        button.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          PasswordToggle._updateState(button, input, input.type === 'text');
        });
      });
    }
  };

  /**
   * Initialize all Flexa components
   */
  function init() {
    Theme.init();
    Direction.init();
    PasswordToggle.init();
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
    PasswordToggle: PasswordToggle,
    init: init
  };
}));
