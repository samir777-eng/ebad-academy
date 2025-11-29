import nextPlugin from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "dist/**",
      ".vercel/**",
      "public/**",
      "prisma/migrations/**",
      "*.config.js",
      "*.config.ts",
      "*.config.mjs",
      "postcss.config.js",
      "postcss.config.mjs",
      "tailwind.config.ts",
      "next-env.d.ts",
      "test-results/**",
      "playwright-report/**",
      "السيرة/**",
    ],
  },
  ...nextPlugin,
];

export default eslintConfig;
