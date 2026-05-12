// @ts-check
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      "**/dist/",
      "**/node_modules/",
      "**/*.md",
      "**/*.json",
      "**/*.yaml",
      "**/*.yml",
      "**/*.sh",
      "**/*.mjs",
      "convex/",
      "web/",
      "plans/",
      "reference/",
      "scratchpads/",
    ],
  },

  // Base recommended rules
  eslint.configs.recommended,

  // TypeScript strict rules for core/cli
  {
    files: ["core/cli/**/*.ts"],
    extends: [...tseslint.configs.strict],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-undef": "off",
    },
  },

  // Scripts get relaxed rules (build tooling uses any intentionally)
  {
    files: ["core/scripts/**/*.ts"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-undef": "off",
    },
  },

  // Disable rules that conflict with Prettier (must be last)
  eslintConfigPrettier,
);
