/**
 * Flexa Demo JavaScript
 * Provides theme/direction controls and component demos
 */

(function() {
  'use strict';

  // Storage helper with error handling
  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        return;
      }
    },
  };

  // Theme management
  function initThemeControls() {
    const root = document.documentElement;
    const themeSelect = document.getElementById("fx-theme-select");
    const dirSelect = document.getElementById("fx-dir-select");

    if (!themeSelect && !dirSelect) return;

    function applyTheme(value) {
      if (window.Flexa && Flexa.Theme) {
        Flexa.Theme.set(value);
      } else {
        root.setAttribute("data-theme", value === "auto" ? "light" : value);
      }
      storage.set("flexa-demo-theme", value);
    }

    function applyDir(value) {
      if (window.Flexa && Flexa.Direction) {
        Flexa.Direction.set(value);
      } else {
        root.setAttribute("dir", value);
      }
      storage.set("flexa-demo-dir", value);
    }

    const storedTheme = storage.get("flexa-demo-theme") || "light";
    const storedDir = storage.get("flexa-demo-dir") || root.getAttribute("dir") || "ltr";

    applyTheme(storedTheme);
    applyDir(storedDir);

    if (themeSelect) {
      themeSelect.value = storedTheme;
      themeSelect.addEventListener("change", (event) => {
        applyTheme(event.target.value);
      });
    }

    if (dirSelect) {
      dirSelect.value = storedDir;
      dirSelect.addEventListener("change", (event) => {
        applyDir(event.target.value);
      });
    }

    // Listen for system theme changes when auto mode is active
    const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    themeMedia.addEventListener("change", () => {
      if (storage.get("flexa-demo-theme") === "auto") {
        applyTheme("auto");
      }
    });
  }

  // Button busy state demo
  function initButtonBusyDemo() {
    const saveBtn = document.getElementById("save-btn");
    if (saveBtn && window.Flexa && Flexa.ButtonBusy) {
      saveBtn.addEventListener("click", function() {
        Flexa.ButtonBusy.enableBusy(this, "Saving...");
        setTimeout(() => {
          Flexa.ButtonBusy.disableBusy(this);
        }, 1200);
      });
    }
  }

  // Initialize when DOM is ready
  function init() {
    initThemeControls();
    initButtonBusyDemo();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
