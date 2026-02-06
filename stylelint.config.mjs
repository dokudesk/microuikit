/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard-scss"],

  plugins: [
    "stylelint-scss",
    "@stylistic/stylelint-plugin"
  ],

  ignoreFiles: [
    "node_modules/**",
    "dist/**",
    "examples/**",
    "docs/**"
  ],

  rules: {
    // SCSS naming conventions
    "scss/dollar-variable-pattern": "^[a-z0-9-]+$",
    "scss/at-mixin-pattern": "^[a-z0-9-]+$",
    "scss/at-function-pattern": "^[a-z0-9-]+$",
    "scss/percent-placeholder-pattern": "^%[a-z0-9-]+$",
    "scss/selector-no-redundant-nesting-selector": true,
    "scss/dollar-variable-no-missing-interpolation": true,
    "scss/load-no-partial-leading-underscore": true,
    "scss/at-rule-conditional-no-parentheses": null,
    "no-invalid-position-declaration": null,

    // Structure
    "max-nesting-depth": 8,
    "selector-max-id": 0,
    "selector-max-universal": 1,
    "no-empty-source": true,
    "comment-empty-line-before": [
      "always",
      {
        except: ["first-nested"],
        ignore: ["stylelint-commands", "after-comment"]
      }
    ],

    // Colors & numbers
    "color-hex-length": "short",
    "length-zero-no-unit": true,
    "unit-allowed-list": [
      "px",
      "em",
      "rem",
      "%",
      "vh",
      "vw",
      "dvh",
      "dvw",
      "ms",
      "s",
      "deg",
      "turn" 
    ],

    // Stylistic rules (Stylelint 17 compatible via @stylistic/stylelint-plugin)
    "@stylistic/color-hex-case": "lower",
    "@stylistic/number-leading-zero": "always",
    "@stylistic/indentation": [
      2,
      {
        ignore: ["inside-parens"]
      }
    ],
    "@stylistic/declaration-colon-space-after": "always",
    "@stylistic/declaration-colon-space-before": "never",
    "@stylistic/block-opening-brace-space-before": "always",
    "@stylistic/selector-list-comma-space-after": "always",
    "@stylistic/no-eol-whitespace": true,
    "@stylistic/max-empty-lines": 1
  }
};
