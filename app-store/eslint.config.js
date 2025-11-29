// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");


module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    plugins: {
      prettier: prettierPlugin,
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
      prettierConfig,
    ],
    processor: angular.processInlineTemplates,
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
      "sort-imports": [
          "error",
          {
            "ignoreCase": false,
            "ignoreDeclarationSort": false,
            "ignoreMemberSort": false,
            "memberSyntaxSortOrder": [
              "none",
              "all",
              "multiple",
              "single"
            ],
            "allowSeparatedGroups": true
          },
        ],
      "prettier/prettier": "error"
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
