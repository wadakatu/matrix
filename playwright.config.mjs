// npm run test:specimens: Playwright on the specimen pages (Astro builds them into dist-specimens/ first). Pages are served from the
// checkout by a route in each test, so no server runs and every other origin is visible.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: "*.spec.mjs",
  // The visual and Storybook tests run in the pinned Docker image (npm run test:visual).
  testIgnore: ["visual/**", "storybook/**"],
  reporter: "list",
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    // npm run test:engines: the verification matrix in Playwright's Firefox and WebKit builds (05,
    // "Where each row runs"). They are Playwright's patched builds, not Firefox or Safari.
    { name: "firefox", testMatch: "matrix.spec.mjs", use: { browserName: "firefox" } },
    { name: "webkit", testMatch: "matrix.spec.mjs", use: { browserName: "webkit" } },
  ],
});
