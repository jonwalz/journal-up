import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        console: true,
        process: true,
        setTimeout: true,
        Bun: true,
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-unused-vars": "off", // Disable base rule as it can report incorrect errors
    },
  },
];
