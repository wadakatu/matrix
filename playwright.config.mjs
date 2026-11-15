// npm run test:specimens: Playwright on the specimen pages (Astro builds them into dist-specimens/ first). Pages are served from the
// checkout by a route in each test, so no server runs and every other origin is visible.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: "*.spec.mjs",
  // The visual and Storybook tests run in the pinned Docker image (npm run test:visual).
  testIgnore: ["visual/**", "storybook/**"],
  reporter: "list",
  use: { browserName: "chromium" },
});
