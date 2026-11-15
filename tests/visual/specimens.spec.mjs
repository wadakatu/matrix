// The chrome specimen in all four contexts and both languages, at 1440 and 390 (the Phase 2 exit).
import { expect, test } from "@playwright/test";
import { ORIGIN, serve } from "../support/serve.mjs";

const CONTEXTS = { "phosphor-night": "", "phosphor-day": "theme=day", "operator-night": "palette=operator", "operator-day": "palette=operator&theme=day" };
for (const page of ["chrome", "chrome.ja"]) {
  for (const [context, query] of Object.entries(CONTEXTS)) {
    for (const width of [1440, 390]) {
      test(`${page} ${context} at ${width}`, async ({ page: p }) => {
        const requests = await serve(p, { "/assets/": "assets", "/": "dist-specimens" });
        await p.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await p.goto(`${ORIGIN}/${page}.html${query && `?${query}`}`);
        await p.evaluate(() => document.fonts.ready);
        await expect(p).toHaveScreenshot(`specimens/${page}-${context}-${width}.png`, { fullPage: true });
        expect(requests.filter((u) => !u.startsWith(ORIGIN))).toEqual([]);
      });
    }
  }
}
