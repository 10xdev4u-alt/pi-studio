// ESLint v9 flat config — pragmatic for a monorepo
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "dist",
      ".next",
      "node_modules",
      "coverage",
      "out",
      "**/*.d.ts",
      "**/dist/**",
      ".superpowers",
      "scripts",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 2022, sourceType: "module" },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        WebSocket: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        FormData: "readonly",
        Headers: "readonly",
        Response: "readonly",
        Request: "readonly",
        crypto: "readonly",
        CustomEvent: "readonly",
        HTMLElement: "readonly",
        KeyboardEvent: "readonly",
        React: "readonly",
        JSX: "readonly",
      },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      // Pragmatic: catch obvious bugs, don't be a strictness tyrant
      "no-undef": "off", // TypeScript handles this
      "no-unused-vars": "off",
      "no-empty": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/ban-types": "off",
    },
  },
];
