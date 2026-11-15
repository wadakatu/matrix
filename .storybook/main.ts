// Storybook on the Astro framework, as spike S1 configured it (06; S1, "Configuration to carry into task 2.1").
import { write } from "../scripts/foundations.mjs";

// The Foundations pages read this file; it is rebuilt from dist/ whenever Storybook starts (npm run build first).
write();

export default {
  stories: [
    "../docs/storybook/*.mdx",
    "../src/**/*.stories.ts",
    // A story with a deliberate contrast violation, to show that test:stories fails on one (09, task 2.1).
    ...(process.env.MX_A11Y_SELFTEST ? ["../tests/a11y-selftest/*.stories.ts"] : []),
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  core: { disableTelemetry: true },
  framework: { name: "@storybook-astro/framework", options: {} },
  // The logo is shown on its own page and in the Mark; it is not in the package (decision Q3).
  staticDirs: [{ from: "../assets/logo", to: "/assets/logo" }],
};
