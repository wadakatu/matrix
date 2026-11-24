// The chrome specimen in all four contexts and both languages, at 1440 and 390 (the Phase 2 exit), and
// the Signature specimens, Human home and Projects in 人間用, as stills (`motion=0`), in all four (Phase 3),
// the machine landing and Projects in 機械用, the live shell, in all four (Phase 4), and the three Article
// specimens and the Blog index, as stills, in all four (Phase 5).
import { expect, test } from "@playwright/test";
import { ORIGIN, serve } from "../support/serve.mjs";

const CONTEXTS = { "phosphor-night": "", "phosphor-day": "theme=day", "operator-night": "palette=operator", "operator-day": "palette=operator&theme=day" };
const PAGES = { chrome: "", "chrome.ja": "", "human-home": "motion=0", "human-projects": "motion=0", home: "motion=0", projects: "motion=0", "article-a": "motion=0", "article-b": "motion=0", "article-c": "motion=0", blog: "motion=0" };
for (const [page, still] of Object.entries(PAGES)) {
  for (const [context, query] of Object.entries(CONTEXTS)) {
    for (const width of [1440, 390]) {
      test(`${page} ${context} at ${width}`, async ({ page: p }) => {
        const requests = await serve(p, { "/assets/": "assets", "/specimens/": "dist-specimens" });
        await p.addInitScript(() => sessionStorage.setItem("mx-boot", "1"));
        await p.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        const q = [still, query].filter(Boolean).join("&");
        await p.goto(`${ORIGIN}/specimens/${page}.html${q && `?${q}`}`);
        await p.evaluate(() => document.fonts.ready);
        // 機械用: wait for the live shell; its clock is the time of capture, so it is masked.
        if (page === "home" || page === "projects") await p.waitForFunction(() => document.documentElement.dataset.shell === "live");
        await expect(p).toHaveScreenshot(`specimens/${page}-${context}-${width}.png`, { fullPage: true, mask: [p.locator(".mx-modeline-time")] });
        expect(requests.filter((u) => !u.startsWith(ORIGIN))).toEqual([]);
      });
    }
  }
}
