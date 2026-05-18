// @ts-check
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

const eslintConfig = [
    ...nextCoreWebVitals,
    ...nextTypeScript,
    {
        settings: {
            react: {
                version: "19", // Avoids auto-detection crash
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
        },
    },
    eslintPluginPrettierRecommended,
];

export default eslintConfig;
