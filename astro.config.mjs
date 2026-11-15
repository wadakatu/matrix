// Astro builds the specimen pages (src/specimens/<lower-case>.astro; capitalised files are their parts) for the browser tests; it is also the
// config Storybook's Astro framework applies. Specimens are dev only and not in the package.
import { defineConfig } from "astro/config";
import { readdirSync } from "node:fs";

const specimens = {
  name: "matrix-specimens",
  hooks: {
    "astro:config:setup": ({ injectRoute, updateConfig }) => {
      // Storybook's Astro server reads integrations but not this file's devToolbar setting, and
      // with the toolbar on Astro writes each file's absolute path into the markup (data-astro-source-file).
      updateConfig({ devToolbar: { enabled: false } });
      for (const f of readdirSync("src/specimens").filter((f) => /^[a-z][\w.-]*\.astro$/.test(f))) {
        const name = f.replace(/\.astro$/, "");
        injectRoute({ pattern: `/${name}`, entrypoint: `./src/specimens/${f}` });
      }
    },
  },
};

export default defineConfig({
  outDir: "dist-specimens",
  build: { format: "file" },
  integrations: [specimens],
  devToolbar: { enabled: false },
});
