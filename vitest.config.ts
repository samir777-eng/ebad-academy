import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test-utils/",
        "tests/",
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/*.config.ts",
        "prisma/",
        ".next/",
        "السيرة/",
      ],
    },
    include: ["lib/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: [
      "node_modules",
      ".next",
      "test-results",
      "playwright-report",
      "**/node_modules/**",
      "السيرة/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
