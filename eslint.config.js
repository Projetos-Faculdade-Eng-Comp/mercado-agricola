import js from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
    },
    plugins: {
      prettier: prettier,
    },
    rules: {
      // ...js.configs.recommended.rules,
      ...prettier.rules,
    },
  },
];
