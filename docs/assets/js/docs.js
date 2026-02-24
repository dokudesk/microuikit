/**
 * Flexa documentation script.
 * Handles HTML includes, theme/direction controls, class reference panel, and code copy.
 * @see docs/index.html, docs/showcase (foundations and components)
 */
(function() {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------
  const STORAGE_KEYS = {
    THEME: 'flexa-demo-theme',
    DIR: 'flexa-demo-dir',
  };
  const IDS = {
    THEME_SELECT: 'fx-theme-select',
    DIR_SELECT: 'fx-dir-select',
    SAVE_BTN: 'save-btn',
    CLASS_SEARCH: 'fx-demo-doc-class-search',
  };
  const DATA_BOUND = 'fxCopyBound';
  const COPY_FEEDBACK_MS = 1500;
  const FLEXA_CSS_REGEX = /[/\\]dist[/\\]css[/\\]flexa\.css$/i;
  const SLUG_REGEX = /\/showcase\/foundations\/([^/]+)\.html$/;
  const FX_CLASS_REGEX = /\.fx-[a-z0-9-]+/gi;

  /** Safe localStorage wrapper (no throw in private/incognito). */
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

  /** Escape for HTML text content / attributes. */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /** Recursively resolve <include src="..."> and replace with fetched HTML. */
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

  /** Restore theme/dir from storage and wire header selects. */
  function initThemeControls() {
    const root = document.documentElement;
    const themeSelect = document.getElementById(IDS.THEME_SELECT);
    const dirSelect = document.getElementById(IDS.DIR_SELECT);

    if (!themeSelect && !dirSelect) return;

    function applyTheme(value) {
      if (window.Flexa && Flexa.Theme) {
        Flexa.Theme.set(value);
      } else {
        root.setAttribute("data-theme", value === "auto" ? "light" : value);
      }
      storage.set(STORAGE_KEYS.THEME, value);
    }

    function applyDir(value) {
      if (window.Flexa && Flexa.Direction) {
        Flexa.Direction.set(value);
      } else {
        root.setAttribute("dir", value);
      }
      storage.set(STORAGE_KEYS.DIR, value);
    }

    const storedTheme = storage.get(STORAGE_KEYS.THEME) || "light";
    const storedDir = storage.get(STORAGE_KEYS.DIR) || root.getAttribute("dir") || "ltr";

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

    const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    themeMedia.addEventListener("change", () => {
      if (storage.get(STORAGE_KEYS.THEME) === "auto") {
        applyTheme("auto");
      }
    });
  }

  function initButtonBusyDemo() {
    const saveBtn = document.getElementById(IDS.SAVE_BTN);
    if (saveBtn && window.Flexa && Flexa.ButtonBusy) {
      saveBtn.addEventListener("click", function() {
        Flexa.ButtonBusy.enableBusy(this, "Saving...");
        setTimeout(() => {
          Flexa.ButtonBusy.disableBusy(this);
        }, 1200);
      });
    }
  }

  /** @returns {string|null} Slug from URL path (e.g. "gutter", "flex") or null. */
  function getCorePageSlug() {
    const path = (window.location.pathname || "").replace(/\\/g, "/");
    const match = path.match(SLUG_REGEX);
    return match ? match[1] : null;
  }

  /** Collect .fx-* rules from the flexa.css stylesheet (when accessible). */
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
        const classMatches = selector.match(FX_CLASS_REGEX);
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
      const href = String(sheet.href || "").replace(/\\/g, "/");
      if (!FLEXA_CSS_REGEX.test(href)) continue;
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

  /** Slug → list of RegExp matchers for class names on foundation pages. */
  const CORE_CATEGORY_MATCHERS = {
    "introduction": [],
      "design-tokens": [],
      "theming": [],
      "direction": [
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
      "scrollbar": [],
      "typography": [
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
      "visibility-and-interaction": [
        /^fx-hidden$/,
        /^fx-invisible$/,
        /^fx-visible$/,
        /^fx-user-select-/,
      ],
      "layout": [
        /^fx-position-/,
        /^fx-d-/,
        /^fx-float-/,
        /^fx-valign-/,
      ],
      "sizing": [
        /^fx-w-/,
        /^fx-max-w-/,
        /^fx-min-w-/,
        /^fx-h-/,
        /^fx-max-h-/,
        /^fx-min-h-/,
      ],
      "aspect-ratio": [
        /^fx-aspect-/,
      ],
      "overflow-and-object": [
        /^fx-overflow-/,
        /^fx-object-/,
      ],
      "spacing": [
        /^fx-m([trblsexy])?-(\d+|auto)$/,
        /^fx-p([trblsexy])?-\d+$/,
        /^fx-row-gap-/,
        /^fx-column-gap-/,
      ],
      "flex": [
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
      "text-flow": [
        /^fx-indent-/,
        /^fx-whitespace-/,
        /^fx-word-b-/,
        /^fx-wrap-w-/,
        /^fx-overflow-wrap-/,
        /^fx-overflow-text-/,
      ],
      "border": [
        /^fx-border$/,
        /^fx-border-(top|bottom|left|right)$/,
        /^fx-border-w-/,
        /^fx-border-s-/,
      ],
      "shadow": [
        /^fx-shadow/,
      ],
      "opacity-and-transform": [
        /^fx-opacity-/,
        /^fx-flip-/,
      ],
      "color": [
        /^fx-text-(primary|secondary|success|info|warning|danger|light|dark)$/,
        /^fx-background-(primary|secondary|success|info|warning|danger|light|dark)$/,
        /^fx-border-(primary|secondary|success|info|warning|danger|light|dark)$/,
      ],
      "grid": [
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
      "gutter": [
        /^fx-gx-/,
        /^fx-gy-/,
      ],
      "radius": [
        /^fx-rounded$/,
        /^fx-rounded-(xs|sm|md|lg|xl|xxl|circle|pill|none)$/,
        /^fx-rounded-(top|bottom|left|right)($|-(xs|sm|md|lg|xl|xxl|circle|pill|none)$)/,
        /^fx-rounded-(top-left|top-right|bottom-left|bottom-right)($|-(xs|sm|md|lg|xl|xxl|circle|pill|none)$)/,
      ],
      "validation-and-feedback": [
        /^fx-valid$/,
        /^fx-is-valid$/,
        /^fx-invalid$/,
        /^fx-is-invalid$/,
        /^fx-feedback$/,
        /^fx-valid-feedback$/,
        /^fx-invalid-feedback$/,
        /^fx-text-muted$/,
      ],
    "text-title": [
      /^fx-text-title$/,
      /^fx-text-subtitle$/,
    ],
  };

  function getCoreCategoryMatchers() {
    return CORE_CATEGORY_MATCHERS;
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

  /** Build and append the "Complete Class Reference" section with filter list. */
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
    section.className = "fx-demo-section";
    const title = document.createElement("h5");
    title.textContent = "Complete Class Reference";
    section.appendChild(title);
    const panel = document.createElement("div");
    panel.className = "fx-demo-panel";
    const totalTag = document.createElement("span");
    totalTag.textContent = formatClassCount(matched.length, matched.length);
    totalTag.setAttribute("aria-live", "polite");
    totalTag.setAttribute("aria-atomic", "true");
    const controls = document.createElement("div");
    controls.className = "fx-d-flex fx-align-items-center fx-border fx-rounded fx-flex-wrap-nowrap fx-px-2 fx-py-1 fx-items-center fx-whitespace-nowrap fx-gap-2 fx-fs-sm fx-demo-list-toolbar";
    const searchLabel = document.createElement("label");
    searchLabel.setAttribute("for", IDS.CLASS_SEARCH);
    searchLabel.textContent = "Filter classes";
    const searchInput = document.createElement("input");
    searchInput.id = IDS.CLASS_SEARCH;
    searchInput.setAttribute("aria-label", "Filter classes");
    searchInput.className = "fx-border fx-rounded fx-px-3 fx-fs-normal fx-w-100 fx-demo-search-input";
    searchInput.type = "search";
    searchInput.placeholder = "Type class name, selector, or declaration...";
    searchInput.setAttribute("autocomplete", "off");
    controls.appendChild(searchLabel);
    controls.appendChild(searchInput);
    controls.appendChild(totalTag);
    panel.appendChild(controls);

    const list = document.createElement("div");
    list.className = "fx-demo-list ";

    const head = document.createElement("div");
    head.className = "fx-demo-list-row fx-demo-list-head";
    head.innerHTML =
      "<div class=\"fx-d-flex fx-align-items-center fx-py-2 fx-gap-3\">" +
      "<span class=\"fx-text-muted\">#</span>" +
      "<span>Class</span>" +
      "</div>" +
      "<div class=\"fx-d-flex fx-align-items-center\">Selector and declarations</div>";
    list.appendChild(head);

    const listItems = [];
    matched.forEach((className, index) => {
      const entry = classesMap.get(className);
      const selector = entry && entry.selectors && entry.selectors.size ? Array.from(entry.selectors)[0] : "." + className;
      const declarations = entry && entry.declarations && entry.declarations.size ? Array.from(entry.declarations)[0] : "";

      const item = document.createElement("div");
      item.className = "fx-demo-list-row";
      item.dataset.search = (className + " " + selector + " " + declarations).toLowerCase();
      item.innerHTML =
        "<div class=\"fx-d-flex fx-align-items-center fx-gap-3\">" +
        "<span class=\"fx-text-muted\">" + (index + 1) + "</span>" +
        "<code>" + escapeHtml(className) + "</code>" +
        "</div>" +
        "<div>" +
        "<div class=\"fx-d-flex fx-align-items-center fx-gap-2\"><span class=\"fx-text-muted\">Selector:</span><code>" + escapeHtml(selector) + "</code></div>" +
        "<div class=\"fx-d-flex fx-align-items-center fx-gap-2\"><span class=\"fx-text-muted\">Declarations:</span><code>" + escapeHtml(declarations) + "</code></div>" +
        "</div>";
      listItems.push(item);
      list.appendChild(item);
    });
    panel.appendChild(list);

    const emptyState = document.createElement("p");
    emptyState.className = "fx-text-muted fx-hidden";
    emptyState.style.textAlign = "center";
    emptyState.textContent = "No classes matched.";
    emptyState.setAttribute("aria-live", "assertive");
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
          const indexTag = item.querySelector(".fx-text-muted");
          if (indexTag) {
            indexTag.textContent = String(visibleCount);
          }
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
    const mainEl = document.querySelector("main");
    if (!mainEl) {
      return;
    }
    const classesMap = extractCoreStyleRules();
    if (!classesMap.size) {
      return;
    }
    renderClassReferenceList(mainEl, slug, classesMap);
  }

  function copyTextToClipboardSync(text) {
    const tmp = document.createElement("textarea");
    tmp.value = text;
    tmp.setAttribute("readonly", "");
    tmp.style.position = "fixed";
    tmp.style.left = "-9999px";
    tmp.style.top = "0";
    document.body.appendChild(tmp);
    tmp.focus();
    tmp.select();
    tmp.setSelectionRange(0, text.length);
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {}
    document.body.removeChild(tmp);
    return ok;
  }

  /** Prefer clipboard API with execCommand fallback. */
  async function copyTextToClipboard(text) {
    if (!text || typeof text !== "string") {
      return false;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    return copyTextToClipboardSync(text);
  }

  function initCodeCopyButtons() {
    const blocks = document.querySelectorAll("main pre");
    if (!blocks.length) {
      return;
    }

    blocks.forEach((pre) => {
      let button = pre.querySelector(".fx-demo-code-copy");
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "fx-demo-code-copy";
        button.setAttribute("aria-label", "Copy code");
        pre.appendChild(button);
      }
      if (button.dataset[DATA_BOUND] === "true") {
        return;
      }
      button.dataset[DATA_BOUND] = "true";

      button.addEventListener("click", async (e) => {
        e.preventDefault();
        const parent = button.parentElement;
        const codeEl = parent ? parent.querySelector("code") : null;
        const text = (codeEl ? codeEl.textContent : parent ? parent.textContent : "") || "";
        const originalLabel = button.getAttribute("aria-label") || "Copy code";
        const ok = await copyTextToClipboard(text);
        if (ok) {
          button.setAttribute("aria-label", "Copied");
          button.disabled = true;
          setTimeout(() => {
            button.setAttribute("aria-label", originalLabel);
            button.disabled = false;
          }, COPY_FEEDBACK_MS);
        }
      });
    });
  }

  /** Run all doc features; each step is wrapped in try/catch so one failure does not block others. */
  async function init() {
    try {
      await initHtmlIncludes();
    } catch (err) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[Flexa docs] initHtmlIncludes failed:", err);
      }
    }
    try {
      initThemeControls();
    } catch (err) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[Flexa docs] initThemeControls failed:", err);
      }
    }
    try {
      initButtonBusyDemo();
    } catch (err) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[Flexa docs] initButtonBusyDemo failed:", err);
      }
    }
    try {
      initCoreClassReference();
    } catch (err) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[Flexa docs] initCoreClassReference failed:", err);
      }
    }
    try {
      initCodeCopyButtons();
    } catch (err) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[Flexa docs] initCodeCopyButtons failed:", err);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      void init();
    });
  } else {
    void init();
  }
})();
