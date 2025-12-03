// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");
const importPlugin = require("eslint-plugin-import");


module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    plugins: {
      prettier: prettierPlugin,
      import: importPlugin,
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
      prettierConfig,
    ],
    processor: angular.processInlineTemplates,
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "kp",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "kp",
          style: "kebab-case",
        },
      ],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
          ],
          pathGroups: [
            {
              pattern: "@angular/core",
              group: "external",
              position: "before",
            },
            {
              pattern: "@angular/common",
              group: "external",
              position: "before",
            },
            {
              pattern: "@angular/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@angular/material/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "rxjs",
              group: "external",
              position: "before",
            },
            {
              pattern: "rxjs/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "primeng/**",
              group: "external",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "sort-imports": [
        "error",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          allowSeparatedGroups: true,
        },
      ],
      "import/no-duplicates": ["error", { "prefer-inline": false }],
      "prettier/prettier": "error",
    },
  },
  {
    files: ["**/*.html"],
    plugins: {
      prettier: prettierPlugin,
    },
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
      prettierConfig,
    ],
    rules: {
      "prettier/prettier": [
          "error",
          {
            "parser": "angular"
          }
        ]
    },
  }
]);
