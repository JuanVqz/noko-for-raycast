const js = require("@eslint/js");
const typescriptEslint = require("typescript-eslint");
const prettier = require("eslint-config-prettier/flat");
const globals = require("globals");

module.exports = typescriptEslint.config(
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
      },
    },
  },
  prettier,
);
