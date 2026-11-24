// The chrome specimen in all four contexts and both languages, at 1440 and 390 (the Phase 2 exit), and
// every specimen in the set (tests/support/specimens.mjs) as a still (`motion=0`) in all four: the
// Signature pages (Phase 3), the live shell (Phase 4), the articles and the index (Phase 5), Not found
// and Offline (Phase 6). Moved is not captured: it leaves at once for the chrome specimen.
import { expect, test } from "@playwright/test";
import { ORIGIN, serve } from "../support/serve.mjs";
import { CONTEXTS, DIRS, SPECIMENS } from "../support/specimens.mjs";

const PAGES = { chrome: "", "chrome.ja": "", ...Object.fromEntries(SPECIMENS.filter((s) => s.page !== "moved").map((s) => [s.page, "motion=0"])) };
for (const [page, still] of Object.entries(PAGES)) {
  for (const [context, query] of Object.entries(CONTEXTS)) {
    for (const width of [1440, 390]) {
      test(`${page} ${context} at ${width}`, async ({ page: p }) => {
        const requests = await serve(p, DIRS);
        await p.addInitScript(() => sessionStorage.setItem("mx-boot", "1"));
        await p.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        const q = [still, query].filter(Boolean).join("&");
        await p.goto(`${ORIGIN}/specimens/${page}.html${q && `?${q}`}`);
        await p.evaluate(() => document.fonts.ready);
        // 機械用: wait for the live shell; its clock is the time of capture, so it is masked.
        if (SPECIMENS.find((s) => s.page === page)?.reading === "machine") await p.waitForFunction(() => document.documentElement.dataset.shell === "live");
        await expect(p).toHaveScreenshot(`specimens/${page}-${context}-${width}.png`, { fullPage: true, mask: [p.locator(".mx-modeline-time")] });
        expect(requests.filter((u) => !u.startsWith(ORIGIN))).toEqual([]);
      });
    }
  }
}
