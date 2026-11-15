// npm run test:specimens: Playwright on the specimen pages. Pages are served from the
// checkout by a route in each test, so no server runs and every other origin is visible.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: "*.spec.mjs",
  reporter: "list",
  use: { browserName: "chromium" },
});
