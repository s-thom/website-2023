/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import eslint from "@eslint/js";
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
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    extends: [
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat["jsx-runtime"],
      reactHooks.configs["recommended-latest"],
    ],
  },
  {
    plugins: { "jsx-a11y": jsxA11y },
    rules: jsxA11y.configs.recommended.rules,
  },
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs["jsx-a11y-recommended"],
  {
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
        node: true,
      },
      react: { version: "detect" },
    },
  },
  {
    files: ["*.astro"],
    rules: {
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
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
      "import/no-unresolved": [
        "error",
        {
          ignore: ["astro:*"],
        },
      ],
      "no-continue": "off",
      "no-plusplus": "off",
      "prettier/prettier": "warn",
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          caughtErrors: "none",
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allow: [{ name: ["Error", "URL", "URLSearchParams"], from: "lib" }],
          allowAny: true,
          allowBoolean: true,
          allowNullish: true,
          allowNumber: true,
          allowRegExp: true,
        },
      ],

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
]);
