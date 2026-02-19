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

  // Lightweight HTML include support for docs pages.
  // Usage: <include src="../_header.html"></include>
  async function resolveIncludeNodes(root, baseUrl) {
    const includeNodes = Array.from(root.querySelectorAll("include[src]"));
    if (!includeNodes.length) {
      return;
    }

    await Promise.all(includeNodes.map(async (node) => {
      const rawSrc = node.getAttribute("src");
      if (!rawSrc) {
        return;
      }

      const resolvedUrl = new URL(rawSrc, baseUrl).toString();

      try {
        const response = await fetch(resolvedUrl, { credentials: "same-origin" });
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        const html = await response.text();

        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;

        // Resolve nested includes relative to the included file itself.
        await resolveIncludeNodes(wrapper, response.url || resolvedUrl);

        node.replaceWith(...Array.from(wrapper.childNodes));
      } catch (error) {
        const message = document.createElement("p");
        message.className = "fx-text-danger";
        message.textContent = "Include failed: " + rawSrc;
        node.replaceWith(message);
      }
    }));
  }

  async function initHtmlIncludes() {
    await resolveIncludeNodes(document, window.location.href);
  }

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

  function getCorePageSlug() {
    const path = (window.location.pathname || "").replace(/\\/g, "/");
    const match = path.match(/\/showcase\/foundations\/([^/]+)\.html$/);
    return match ? match[1] : null;
  }

  function extractCoreStyleRules() {
    const classesMap = new Map();

    function walkRules(ruleList) {
      for (const rule of ruleList) {
        if (rule.cssRules && rule.cssRules.length) {
          walkRules(rule.cssRules);
          continue;
        }
        if (!rule.selectorText || !rule.style) {
          continue;
        }
        const selector = rule.selectorText;
        const classMatches = selector.match(/\.fx-[a-z0-9-]+/gi);
        if (!classMatches || !classMatches.length) {
          continue;
        }

        for (const rawClass of classMatches) {
          const className = rawClass.replace(".", "");
          if (!classesMap.has(className)) {
            classesMap.set(className, {
              selectors: new Set(),
              declarations: new Set(),
            });
          }
          const entry = classesMap.get(className);
          entry.selectors.add(selector);
          if (rule.style.cssText) {
            entry.declarations.add(rule.style.cssText);
          }
        }
      }
    }

    for (const sheet of document.styleSheets) {
      const href = String(sheet.href || "");
      const isCoreSheet = /\/dist\/css\/flexa\.css$/i.test(href) || /\\dist\\css\\flexa\.css$/i.test(href) || /dist\/css\/flexa\.css/i.test(href);
      if (!isCoreSheet) {
        continue;
      }
      try {
        if (sheet.cssRules) {
          walkRules(sheet.cssRules);
        }
      } catch {
        // Ignore inaccessible stylesheets (e.g., browser security constraints)
      }
    }

    return classesMap;
  }

  function getCoreCategoryMatchers() {
    return {
      "introduction": [],
      "design-tokens": [],
      "theme-system": [],
      "direction-and-locale": [
        /^fx-rtl$/,
        /^fx-ltr$/,
      ],
      "base-reset-and-elements": [
        /^fx-mark$/,
        /^fx-strong$/,
        /^fx-small$/,
        /^fx-img$/,
        /^fx-svg$/,
        /^fx-h[1-6]$/,
        /^fx-hidden$/,
        /^fx-invisible$/,
        /^fx-visible$/,
      ],
      "accessibility-and-motion": [],
      "scrollbar-styling": [],
      "typography-utilities": [
        /^fx-fs-/,
        /^fx-fst-/,
        /^fx-fw-/,
        /^fx-text-start$/,
        /^fx-text-center$/,
        /^fx-text-end$/,
        /^fx-text-justify$/,
        /^fx-case-/,
        /^fx-decor-/,
        /^fx-overflow-text-/,
        /^fx-indent-/,
        /^fx-whitespace-/,
        /^fx-word-b-/,
        /^fx-wrap-w-/,
        /^fx-overflow-wrap-/,
      ],
      "visibility-and-interaction-utilities": [
        /^fx-hidden$/,
        /^fx-invisible$/,
        /^fx-visible$/,
        /^fx-user-select-/,
      ],
      "layout-basics": [
        /^fx-position-/,
        /^fx-d-/,
        /^fx-float-/,
        /^fx-valign-/,
      ],
      "sizing-utilities": [
        /^fx-w-/,
        /^fx-max-w-/,
        /^fx-min-w-/,
        /^fx-h-/,
        /^fx-max-h-/,
        /^fx-min-h-/,
      ],
      "aspect-ratio-utilities": [
        /^fx-aspect-/,
      ],
      "overflow-and-object-utilities": [
        /^fx-overflow-/,
        /^fx-object-/,
      ],
      "spacing-utilities": [
        /^fx-m([trblsexy])?-(\d+|auto)$/,
        /^fx-p([trblsexy])?-\d+$/,
        /^fx-row-gap-/,
        /^fx-column-gap-/,
      ],
      "flex-utilities": [
        /^fx-flex-dir-/,
        /^fx-flex-fill$/,
        /^fx-flex-wrap-/,
        /^fx-flex-shrink-/,
        /^fx-flex-grow-/,
        /^fx-justify-/,
        /^fx-items-/,
        /^fx-content-/,
        /^fx-self-/,
        /^fx-center$/,
        /^fx-center-x$/,
        /^fx-center-y$/,
        /^fx-flex-row$/,
      ],
      "text-flow-utilities": [
        /^fx-indent-/,
        /^fx-whitespace-/,
        /^fx-word-b-/,
        /^fx-wrap-w-/,
        /^fx-overflow-wrap-/,
        /^fx-overflow-text-/,
      ],
      "border-utilities": [
        /^fx-border$/,
        /^fx-border-(top|bottom|left|right)$/,
        /^fx-border-w-/,
        /^fx-border-s-/,
      ],
      "shadow-utilities": [
        /^fx-shadow/,
      ],
      "opacity-and-transform-utilities": [
        /^fx-opacity-/,
        /^fx-flip-/,
      ],
      "color-utilities": [
        /^fx-text-(primary|secondary|success|info|warning|danger|light|dark)$/,
        /^fx-background-(primary|secondary|success|info|warning|danger|light|dark)$/,
        /^fx-border-(primary|secondary|success|info|warning|danger|light|dark)$/,
      ],
      "grid-system": [
        /^fx-container/,
        /^fx-row$/,
        /^fx-col-auto$/,
        /^fx-col-\d+$/,
        /^fx-offset-\d+$/,
      ],
      "responsive-grid-variants": [
        /^fx-col-(sm|md|lg|xl|xxl)-/,
        /^fx-offset-(sm|md|lg|xl|xxl)-/,
      ],
      "gutter-utilities": [
        /^fx-gx-/,
        /^fx-gy-/,
      ],
      "radius-utilities-physical": [
        /^fx-rounded$/,
        /^fx-rounded-(xs|sm|md|lg|xl|xxl|circle|pill|none)$/,
        /^fx-rounded-(top|bottom|left|right)($|-(xs|sm|md|lg|xl|xxl|circle|pill|none)$)/,
        /^fx-rounded-(top-left|top-right|bottom-left|bottom-right)($|-(xs|sm|md|lg|xl|xxl|circle|pill|none)$)/,
      ],
      "radius-utilities-logical": [
        /^fx-rounded-(start|end)($|-(xs|sm|md|lg|xl|xxl|circle|pill|none)$)/,
        /^fx-rounded-(start-top|start-bottom|end-top|end-bottom)($|-(xs|sm|md|lg|xl|xxl|circle|pill|none)$)/,
      ],
      "validation-and-feedback-helpers": [
        /^fx-valid$/,
        /^fx-is-valid$/,
        /^fx-invalid$/,
        /^fx-is-invalid$/,
        /^fx-feedback$/,
        /^fx-valid-feedback$/,
        /^fx-invalid-feedback$/,
        /^fx-text-muted$/,
      ],
      "text-title-helpers": [
        /^fx-text-title$/,
        /^fx-text-subtitle$/,
      ],
    };
  }

  function matchesAnyMatcher(className, matchers) {
    if (!matchers || !matchers.length) {
      return false;
    }
    for (const matcher of matchers) {
      if (matcher.test(className)) {
        return true;
      }
    }
    return false;
  }

  function formatClassCount(visibleCount, totalCount) {
    return "Classes: " + visibleCount + " of " + totalCount;
  }

  function renderClassReferenceList(mainEl, slug, classesMap) {
    const categoryMatchers = getCoreCategoryMatchers();
    const matchers = categoryMatchers[slug] || [];
    const allClasses = Array.from(classesMap.keys()).filter((name) => name.startsWith("fx-"));
    const matched = allClasses
      .filter((name) => matchesAnyMatcher(name, matchers))
      .sort((a, b) => a.localeCompare(b));

    // Do not render an empty reference block.
    if (!matched.length) {
      return;
    }

    const section = document.createElement("section");
    section.className = "fx-demo-section fx-mt-4";

    const title = document.createElement("h2");
    title.className = "fx-demo-section-title fx-fs-lg fx-fw-semibold fx-mb-3";
    title.textContent = "Complete Class Reference";
    section.appendChild(title);

    const panel = document.createElement("div");
    panel.className = "fx-demo-panel fx-border fx-rounded";

    const totalTag = document.createElement("label");
    totalTag.className = "fx-demo-doc-toolbar-label";
    totalTag.textContent = formatClassCount(matched.length, matched.length);

    const controls = document.createElement("div");
    controls.className = "fx-demo-doc-toolbar";
    const searchLabel = document.createElement("label");
    searchLabel.className = "fx-demo-doc-toolbar-label";
    searchLabel.setAttribute("for", "fx-demo-doc-class-search");
    searchLabel.textContent = "Filter classes";
    const searchInput = document.createElement("input");
    searchInput.id = "fx-demo-doc-class-search";
    searchInput.className = "fx-demo-doc-search-input";
    searchInput.type = "search";
    searchInput.placeholder = "Type class name, selector, or declaration...";
    searchInput.setAttribute("autocomplete", "off");
    controls.appendChild(searchLabel);
    controls.appendChild(searchInput);
    controls.appendChild(totalTag);
    panel.appendChild(controls);

    const list = document.createElement("div");
    list.className = "fx-demo-list fx-border fx-rounded fx-demo-doc-reference-list";

    const head = document.createElement("div");
    head.className = "fx-demo-list-item fx-demo-doc-reference-head";
    head.innerHTML =
      "<div class=\"fx-demo-list-label fx-demo-doc-reference-label\">" +
      "<span class=\"fx-demo-doc-row-index\">#</span>" +
      "<span>Class</span>" +
      "</div>" +
      "<div class=\"fx-demo-list-description\">Selector and declarations</div>";
    list.appendChild(head);

    function escapeHtml(value) {
      return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    const listItems = [];
    matched.forEach((className, index) => {
      const entry = classesMap.get(className);
      const selector = entry && entry.selectors && entry.selectors.size ? Array.from(entry.selectors)[0] : "." + className;
      const declarations = entry && entry.declarations && entry.declarations.size ? Array.from(entry.declarations)[0] : "";

      const item = document.createElement("div");
      item.className = "fx-demo-list-item fx-demo-doc-reference-item";
      item.dataset.search = (className + " " + selector + " " + declarations).toLowerCase();
      item.innerHTML =
        "<div class=\"fx-demo-list-label fx-demo-doc-reference-label\">" +
        "<span class=\"fx-demo-doc-row-index\">" + (index + 1) + "</span>" +
        "<code>" + escapeHtml(className) + "</code>" +
        "</div>" +
        "<div class=\"fx-demo-list-description fx-demo-doc-reference-description\">" +
        "<div><strong class=\"fx-demo-doc-inline-title\">Selector:</strong><code>" + escapeHtml(selector) + "</code></div>" +
        "<div><strong class=\"fx-demo-doc-inline-title\">Declarations:</strong><code>" + escapeHtml(declarations) + "</code></div>" +
        "</div>";
      listItems.push(item);
      list.appendChild(item);
    });
    panel.appendChild(list);

    const emptyState = document.createElement("p");
    emptyState.className = "fx-text-muted fx-mt-2 fx-hidden";
    emptyState.textContent = "No classes match the current filter.";
    panel.appendChild(emptyState);

    searchInput.addEventListener("input", (event) => {
      const query = String(event.target.value || "").trim().toLowerCase();
      let visibleCount = 0;
      for (const item of listItems) {
        const haystack = String(item.dataset.search || "");
        const shouldShow = !query || haystack.includes(query);
        item.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visibleCount += 1;
        }
      }
      totalTag.textContent = formatClassCount(visibleCount, matched.length);
      emptyState.classList.toggle("fx-hidden", visibleCount !== 0);
    });

    section.appendChild(panel);
    mainEl.appendChild(section);
  }

  function initCoreClassReference() {
    const slug = getCorePageSlug();
    if (!slug) {
      return;
    }
    const mainEl = document.querySelector("main.fx-demo-content");
    if (!mainEl) {
      return;
    }
    const classesMap = extractCoreStyleRules();
    if (!classesMap.size) {
      return;
    }
    renderClassReferenceList(mainEl, slug, classesMap);
  }

  // Initialize when DOM is ready
  async function init() {
    await initHtmlIncludes();
    initThemeControls();
    initButtonBusyDemo();
    initCoreClassReference();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      void init();
    });
  } else {
    void init();
  }
})();
