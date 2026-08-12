import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Configuration Vitest — tests unitaires purs (utils, stores, logique métier).
 * Les tests de composants (jsdom + Testing Library) et E2E (Playwright)
 * s'ajouteront dans des projets dédiés sans toucher à cette base.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
