/**
 * MicroUIKit documentation script.
 * Handles HTML includes, theme/direction controls, class reference panel, and code copy.
 * @see docs/index.html, docs/showcase (foundations and components)
 */
(function() {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------
  const STORAGE_KEYS = {
    THEME: 'microuikit-demo-theme',
    DIR: 'microuikit-demo-dir',
  };
  const IDS = {
    THEME_SELECT: 'mk-theme-select',
    DIR_SELECT: 'mk-dir-select',
    SAVE_BTN: 'save-btn',
    CLASS_SEARCH: 'mk-demo-doc-class-search',
  };
  const DATA_BOUND = 'fxCopyBound';
  const COPY_FEEDBACK_MS = 1500;
  const MICROUIKIT_CSS_REGEX = /[/\\]dist[/\\]css[/\\]microuikit\.css$/i;
  const SLUG_REGEX = /\/showcase\/foundations\/([^/]+)\.html$/;
  const FX_CLASS_REGEX = /\.mk-[a-z0-9-]+/gi;

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
        message.className = "mk-text-danger";
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
      if (value === "auto") value = "system";
      if (window.MicroUIKit && MicroUIKit.Theme) {
        MicroUIKit.Theme.set(value);
      } else {
        root.setAttribute("data-theme", value);
      }
      storage.set(STORAGE_KEYS.THEME, value);
    }

    function applyDir(value) {
      if (window.MicroUIKit && MicroUIKit.Direction) {
        MicroUIKit.Direction.set(value);
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
      themeSelect.value = storedTheme === "auto" ? "system" : storedTheme;
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
  }

  function initButtonBusyDemo() {
    const saveBtn = document.getElementById(IDS.SAVE_BTN);
    if (saveBtn && window.MicroUIKit && MicroUIKit.ButtonBusy) {
      saveBtn.addEventListener("click", function() {
        MicroUIKit.ButtonBusy.enableBusy(this, "Saving...");
        setTimeout(() => {
          MicroUIKit.ButtonBusy.disableBusy(this);
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

  /** Collect .mk-* rules from the microuikit.css stylesheet (when accessible). */
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
      if (!MICROUIKIT_CSS_REGEX.test(href)) continue;
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
        /^mk-rtl$/,
        /^mk-ltr$/,
      ],
      "base-reset-and-elements": [
        /^mk-mark$/,
        /^mk-strong$/,
        /^mk-small$/,
        /^mk-img$/,
        /^mk-svg$/,
        /^mk-h[1-6]$/,
        /^mk-hidden$/,
        /^mk-invisible$/,
        /^mk-visible$/,
      ],
      "accessibility-and-motion": [],
      "scrollbar": [],
      "typography": [
        /^mk-fs-/,
        /^mk-fst-/,
        /^mk-fw-/,
        /^mk-text-start$/,
        /^mk-text-center$/,
        /^mk-text-end$/,
        /^mk-text-justify$/,
        /^mk-case-/,
        /^mk-decor-/,
        /^mk-overflow-text-/,
        /^mk-indent-/,
        /^mk-whitespace-/,
        /^mk-word-b-/,
        /^mk-wrap-w-/,
        /^mk-overflow-wrap-/,
      ],
      "visibility-and-interaction": [
        /^mk-hidden$/,
        /^mk-invisible$/,
        /^mk-visible$/,
        /^mk-user-select-/,
      ],
      "layout": [
        /^mk-position-/,
        /^mk-d-/,
        /^mk-float-/,
        /^mk-valign-/,
      ],
      "sizing": [
        /^mk-w-/,
        /^mk-max-w-/,
        /^mk-min-w-/,
        /^mk-h-/,
        /^mk-max-h-/,
        /^mk-min-h-/,
      ],
      "aspect-ratio": [
        /^mk-aspect-/,
      ],
      "overflow-and-object": [
        /^mk-overflow-/,
        /^mk-object-/,
      ],
      "spacing": [
        /^mk-m([trblsexy])?-(\d+|auto)$/,
        /^mk-p([trblsexy])?-\d+$/,
        /^mk-row-gap-/,
        /^mk-column-gap-/,
      ],
      "flex": [
        /^mk-flex-dir-/,
        /^mk-flex-fill$/,
        /^mk-flex-wrap-/,
        /^mk-flex-shrink-/,
        /^mk-flex-grow-/,
        /^mk-justify-/,
        /^mk-items-/,
        /^mk-content-/,
        /^mk-self-/,
        /^mk-center$/,
        /^mk-center-x$/,
        /^mk-center-y$/,
        /^mk-flex-row$/,
      ],
      "text-flow": [
        /^mk-indent-/,
        /^mk-whitespace-/,
        /^mk-word-b-/,
        /^mk-wrap-w-/,
        /^mk-overflow-wrap-/,
        /^mk-overflow-text-/,
      ],
      "border": [
        /^mk-border$/,
        /^mk-border-(top|bottom|left|right)$/,
        /^mk-border-w-/,
        /^mk-border-s-/,
      ],
      "shadow": [
        /^mk-shadow/,
      ],
      "opacity-and-transform": [
        /^mk-opacity-/,
        /^mk-flip-/,
      ],
      "color": [
        /^mk-text-(primary|secondary|success|info|warning|danger|light|dark)$/,
        /^mk-background-(primary|secondary|success|info|warning|danger|light|dark)$/,
        /^mk-border-(primary|secondary|success|info|warning|danger|light|dark)$/,
      ],
      "grid": [
        /^mk-container/,
        /^mk-row$/,
        /^mk-col-auto$/,
        /^mk-col-\d+$/,
        /^mk-offset-\d+$/,
      ],
      "responsive-grid-variants": [
        /^mk-col-(sm|md|lg|xl|xxl)-/,
        /^mk-offset-(sm|md|lg|xl|xxl)-/,
      ],
      "gutter": [
        /^mk-gx-/,
        /^mk-gy-/,
      ],
      "radius": [
        /^mk-rounded$/,
        /^mk-rounded-(xs|sm|md|lg|xl|xxl|circle|pill|none)$/,
        /^mk-rounded-(top|bottom|left|right)($|-(xs|sm|md|lg|xl|xxl|circle|pill|none)$)/,
        /^mk-rounded-(top-left|top-right|bottom-left|bottom-right)($|-(xs|sm|md|lg|xl|xxl|circle|pill|none)$)/,
      ],
      "validation-and-feedback": [
        /^mk-valid$/,
        /^mk-is-valid$/,
        /^mk-invalid$/,
        /^mk-is-invalid$/,
        /^mk-feedback$/,
        /^mk-valid-feedback$/,
        /^mk-invalid-feedback$/,
        /^mk-text-muted$/,
      ],
    "text-title": [
      /^mk-text-title$/,
      /^mk-text-subtitle$/,
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
    const allClasses = Array.from(classesMap.keys()).filter((name) => name.startsWith("mk-"));
    const matched = allClasses
      .filter((name) => matchesAnyMatcher(name, matchers))
      .sort((a, b) => a.localeCompare(b));

    // Do not render an empty reference block.
    if (!matched.length) {
      return;
    }

    const section = document.createElement("section");
    section.className = "mk-demo-section";
    const title = document.createElement("h5");
    title.textContent = "Complete Class Reference";
    section.appendChild(title);
    const panel = document.createElement("div");
    panel.className = "mk-demo-panel";
    const totalTag = document.createElement("span");
    totalTag.textContent = formatClassCount(matched.length, matched.length);
    totalTag.setAttribute("aria-live", "polite");
    totalTag.setAttribute("aria-atomic", "true");
    const controls = document.createElement("div");
    controls.className = "mk-d-flex mk-align-items-center mk-border mk-rounded mk-flex-wrap-nowrap mk-px-2 mk-py-1 mk-items-center mk-whitespace-nowrap mk-gap-2 mk-fs-sm mk-demo-list-toolbar";
    const searchLabel = document.createElement("label");
    searchLabel.setAttribute("for", IDS.CLASS_SEARCH);
    searchLabel.textContent = "Filter classes";
    const searchInput = document.createElement("input");
    searchInput.id = IDS.CLASS_SEARCH;
    searchInput.setAttribute("aria-label", "Filter classes");
    searchInput.className = "mk-border mk-rounded mk-px-3 mk-fs-normal mk-w-100 mk-demo-search-input";
    searchInput.type = "search";
    searchInput.placeholder = "Type class name, selector, or declaration...";
    searchInput.setAttribute("autocomplete", "off");
    controls.appendChild(searchLabel);
    controls.appendChild(searchInput);
    controls.appendChild(totalTag);
    panel.appendChild(controls);

    const list = document.createElement("div");
    list.className = "mk-demo-list ";

    const head = document.createElement("div");
    head.className = "mk-demo-list-row mk-demo-list-head";
    head.innerHTML =
      "<div class=\"mk-d-flex mk-align-items-center mk-py-2 mk-gap-3\">" +
      "<span class=\"mk-text-muted\">#</span>" +
      "<span>Class</span>" +
      "</div>" +
      "<div class=\"mk-d-flex mk-align-items-center\">Selector and declarations</div>";
    list.appendChild(head);

    const listItems = [];
    matched.forEach((className, index) => {
      const entry = classesMap.get(className);
      const selector = entry && entry.selectors && entry.selectors.size ? Array.from(entry.selectors)[0] : "." + className;
      const declarations = entry && entry.declarations && entry.declarations.size ? Array.from(entry.declarations)[0] : "";

      const item = document.createElement("div");
      item.className = "mk-demo-list-row";
      item.dataset.search = (className + " " + selector + " " + declarations).toLowerCase();
      item.innerHTML =
        "<div class=\"mk-d-flex mk-align-items-center mk-gap-3\">" +
        "<span class=\"mk-text-muted\">" + (index + 1) + "</span>" +
        "<code>" + escapeHtml(className) + "</code>" +
        "</div>" +
        "<div>" +
        "<div class=\"mk-d-flex mk-align-items-center mk-gap-2\"><span class=\"mk-text-muted\">Selector:</span><code>" + escapeHtml(selector) + "</code></div>" +
        "<div class=\"mk-d-flex mk-align-items-center mk-gap-2\"><span class=\"mk-text-muted\">Declarations:</span><code>" + escapeHtml(declarations) + "</code></div>" +
        "</div>";
      listItems.push(item);
      list.appendChild(item);
    });
    panel.appendChild(list);

    const emptyState = document.createElement("p");
    emptyState.className = "mk-text-muted mk-hidden";
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
          const indexTag = item.querySelector(".mk-text-muted");
          if (indexTag) {
            indexTag.textContent = String(visibleCount);
          }
        }
      }
      totalTag.textContent = formatClassCount(visibleCount, matched.length);
      emptyState.classList.toggle("mk-hidden", visibleCount !== 0);
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
      let button = pre.querySelector(".mk-demo-code-copy");
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "mk-demo-code-copy";
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
        console.error("[MicroUIKit docs] initHtmlIncludes failed:", err);
      }
    }
    try {
      initThemeControls();
    } catch (err) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[MicroUIKit docs] initThemeControls failed:", err);
      }
    }
    try {
      initButtonBusyDemo();
    } catch (err) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[MicroUIKit docs] initButtonBusyDemo failed:", err);
      }
    }
    try {
      initCoreClassReference();
    } catch (err) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[MicroUIKit docs] initCoreClassReference failed:", err);
      }
    }
    try {
      initCodeCopyButtons();
    } catch (err) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[MicroUIKit docs] initCodeCopyButtons failed:", err);
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
