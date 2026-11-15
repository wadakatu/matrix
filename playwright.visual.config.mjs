// npm run test:visual: Playwright against the static Storybook and the specimen pages, inside the
// pinned image only (scripts/test_visual.sh). Pixel baselines live in tests/visual/snapshots/.
import { defineConfig } from "@playwright/test";

if (process.env.MX_VISUAL_CONTAINER !== "1" || process.platform !== "linux" || process.arch !== "x64") {
  throw new Error("Use npm run test:visual (or test:visual:update) for the pinned Linux/amd64 environment.");
}

export default defineConfig({
  testDir: "tests",
  testMatch: ["visual/*.spec.mjs", "storybook/*.spec.mjs"],
  // One worker: two writing traces into the bind-mounted test-results/ at once lost files (ENOENT).
  workers: 1,
  retries: 0,
  forbidOnly: true,
  // A missing baseline fails; it is written only by `npm run test:visual:update`.
  updateSnapshots: "none",
  snapshotPathTemplate: "{testDir}/visual/snapshots/{arg}{ext}",
  reporter: [["list"], ["html", { open: "never" }]],
  expect: { timeout: 15_000, toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixels: 0 } },
  use: {
    browserName: "chromium",
    deviceScaleFactor: 1,
    locale: "en-US",
    timezoneId: "UTC",
    reducedMotion: "no-preference",
    trace: "retain-on-failure",
  },
});
