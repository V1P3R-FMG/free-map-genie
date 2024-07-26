import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
    {
        ignores: ["data/", "mg/", "build/"],
    },
    { files: ["fmg/**/*.{ts,json}", "webpack/**/*.{ts,json}", "wdio/**/*.{ts,json}"] },
    { languageOptions: { globals: globals.browser } },
    ...tseslint.configs.recommended,
    ...pluginVue.configs["flat/essential"],
    {
        files: ["src/**/*.vue"],
        languageOptions: { parserOptions: { parser: tseslint.parser } },
    },
    {
        rules: {
            "max-len": ["error", { code: 100 }],
            semi: "error",
            "prefer-const": "error",
            "no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn", // or "error"
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    },
    eslintPluginPrettierRecommended,
];
