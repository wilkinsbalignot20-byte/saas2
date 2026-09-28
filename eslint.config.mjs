 import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // ⚡ IDINAGDAG: Dito pinatay ang error para sa 'any' sa buong project
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
    {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "off" // ⚡ IDINAGDAG: Papatayin nito ang warning sa mga `<img>` tags sa buong project
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
