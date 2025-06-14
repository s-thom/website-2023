/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import eslint from "@eslint/js";
import parser from "astro-eslint-parser";
import eslintPluginAstro from "eslint-plugin-astro";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config([
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  importPlugin.flatConfigs.recommended,
  eslintPluginPrettier,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  reactHooks.configs["recommended-latest"],
  {
    plugins: { "jsx-a11y": jsxA11y },
    rules: jsxA11y.configs.recommended.rules,
  },
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs["jsx-a11y-recommended"],
  {
    settings: {
      "import/resolver": {
        // You will also need to install and configure the TypeScript resolver
        // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
        typescript: {
          project: "./tsconfig.json",
        },
        node: true,
      },
      react: { version: "detect" },
    },
  },
  {
    languageOptions: {
      ecmaVersion: 5,
      sourceType: "script",
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "import/prefer-default-export": "off",
      "no-continue": "off",
      "no-plusplus": "off",
      "prettier/prettier": "warn",

      "no-restricted-syntax": [
        "error",
        {
          selector: "ForInStatement",
          message:
            "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.",
        },
        {
          selector: "LabeledStatement",
          message:
            "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.",
        },
        {
          selector: "WithStatement",
          message:
            "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
        },
      ],
    },
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: parser,
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
    rules: {
      "import/no-unresolved": [
        "error",
        {
          ignore: ["astro:*"],
        },
      ],
    },
  },
]);
