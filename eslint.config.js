import js from "@eslint/js";
import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid/configs/typescript";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    ...solid,
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  prettier,
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vite/**",
      ".solid/**",
      "**/*.cache/**",
      "dev-dist/**",
      "sw.js",
      "workbox-*.js",
      "*.config.{js,ts}",
    ],
  }
);
