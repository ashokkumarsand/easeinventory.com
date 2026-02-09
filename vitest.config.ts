import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["packages/*/src/**/*.ts", "src/services/**/*.ts"],
      exclude: ["**/*.d.ts", "**/index.ts"],
    },
  },
  resolve: {
    alias: {
      "@app/core": path.resolve(__dirname, "packages/core/src"),
      "@app/functions": path.resolve(__dirname, "packages/functions/src"),
      "@": path.resolve(__dirname, "src"),
    },
  },
});
