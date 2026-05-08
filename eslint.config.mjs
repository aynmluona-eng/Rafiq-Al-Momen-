import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        ignores: ["dist/**/*", "node_modules/**/*"],
    },
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        rules: {
            "no-unused-vars": "off",
            "no-undef": "off",
        }
    }
];
