// npm run test:stories: every story in Chromium, with the accessibility addon at `error` (06).
// Not wrapped in the framework's defineConfig (storybook-astro.org, "Testing Stories"; S1).
import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  plugins: [storybookTest({ configDir: ".storybook" })],
  test: { browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: "chromium" }] } },
});
