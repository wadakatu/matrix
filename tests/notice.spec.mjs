// Notice, the 404 page and the offline page (04, "Notice"; 09, task 6.1). The page-wide rows run on
// both pages in tests/matrix.spec.mjs; these are Notice's own.
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ORIGIN, root, serve } from "./support/serve.mjs";
import { CONTEXTS, DIRS, path } from "./support/specimens.mjs";

const tokens = JSON.parse(readFileSync(join(root, "dist/tokens.json"), "utf8"));
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;

for (const js of [true, false]) {
  test(`the offline page requests nothing but its own document, ${js ? "with" : "without"} scripts`, async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: js });
    const page = await ctx.newPage();
    const requests = await serve(page, DIRS);
    for (const q of ["", "?theme=day&palette=operator"]) {
      requests.length = 0;
      await page.goto(`${ORIGIN}${path("offline")}${q}`);
      await page.waitForTimeout(300);
      expect(requests).toEqual([`${ORIGIN}${path("offline")}${q}`]);
    }
    expect(await page.locator("link[rel=stylesheet], img, script[src]").count()).toBe(0);
    await ctx.close();
  });
}

for (const page_ of ["not-found", "offline"]) {
  for (const [context, q] of Object.entries(CONTEXTS)) {
    test(`${page_} in ${context} by flag: the ground, the body type, the link and the focus ring are the Chrome specimen's`, async ({ page }) => {
      await serve(page, DIRS);
      // Notice's copy of base.css (notice.css) against base.css itself, in the same context.
      const read = async (p) => {
        await page.goto(`${ORIGIN}${path(p)}${q && `?${q}`}`);
        await page.locator("main a").first().focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        return page.evaluate(() => {
          const b = getComputedStyle(document.body), a = document.activeElement, l = getComputedStyle(a);
          const ground = [document.body, document.documentElement].map((e) => getComputedStyle(e).backgroundColor).find((c) => c !== "rgba(0, 0, 0, 0)");
          return {
            ground,
            body: [b.color, b.fontFamily, b.fontSize, b.fontWeight, b.lineHeight],
            link: [l.color, l.textDecorationLine, l.textDecorationThickness, l.textUnderlineOffset],
            ring: [l.outlineStyle, l.outlineWidth, l.outlineColor, l.outlineOffset],
          };
        });
      };
      const notice = await read(page_);
      const chrome = await read("chrome");
      expect(notice.ground).toBe(rgb(tokens[context]["color.ground"]));
      expect(notice.body[0]).toBe(rgb(tokens[context]["color.text"]));
      expect(notice.ring[2]).toBe(rgb(tokens[context]["color.focus"]));
      expect(notice).toEqual(chrome);
    });
  }
}

test("the panel: one heading set as a panel's, a hairline rule, no wider than the lede's measure, 20% down", async ({ page }) => {
  await serve(page, DIRS);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${ORIGIN}${path("not-found")}`);
  const p = await page.evaluate(() => {
    const m = document.querySelector("main"), h = getComputedStyle(document.querySelector("h1")), s = getComputedStyle(m);
    return { h1: document.querySelectorAll("h1").length, size: h.fontSize, weight: h.fontWeight, color: h.color, border: [s.borderTopWidth, s.borderTopStyle, s.borderTopColor], bg: s.backgroundColor, top: m.getBoundingClientRect().top, width: m.getBoundingClientRect().width };
  });
  const t = tokens["phosphor-night"];
  expect(p).toMatchObject({ h1: 1, size: "15px", weight: "500", color: rgb(t["color.accent"]), border: ["1px", "solid", rgb(t["color.rule"])], bg: rgb(t["color.panel"]), top: 180 });
  expect(p.width).toBeLessThan(1440 / 2);
});

test("keyboard: Tab goes through the links in order, Try again first when offline, each with the ring; nothing else", async ({ page }) => {
  await serve(page, DIRS);
  await page.goto(`${ORIGIN}${path("offline")}`);
  const seen = [];
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("Tab");
    seen.push(await page.evaluate(() => [document.activeElement.textContent, document.activeElement.getAttribute("href"), getComputedStyle(document.activeElement).outlineStyle, document.activeElement.getBoundingClientRect().height]));
  }
  expect(seen.map((s) => s.slice(0, 3))).toEqual([["Try again", "", "solid"], ["Home", "https://example.com/", "solid"], ["Blog", "https://example.com/blog/", "solid"]]);
  for (const [, , , h] of seen) expect(h).toBeGreaterThanOrEqual(24);
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement === document.body || !document.activeElement)).toBe(true);
});

test("Try again asks for the page's own address again", async ({ page }) => {
  const requests = await serve(page, DIRS);
  await page.goto(`${ORIGIN}${path("offline")}?palette=operator`);
  requests.length = 0;
  await page.getByRole("link", { name: "Try again" }).click();
  await page.waitForLoadState();
  expect(requests).toEqual([`${ORIGIN}${path("offline")}?palette=operator`]);
});

test("on paper: the day ink, no fill, the border kept", async ({ page }) => {
  await serve(page, DIRS);
  await page.goto(`${ORIGIN}${path("offline")}?palette=operator`);
  await page.emulateMedia({ media: "print" });
  const p = await page.evaluate(() => {
    const m = getComputedStyle(document.querySelector("main"));
    return { ink: getComputedStyle(document.body).color, bodyBg: getComputedStyle(document.body).backgroundColor, panelBg: m.backgroundColor, border: m.borderTopStyle, rule: m.borderTopColor };
  });
  const day = tokens["operator-day"];
  expect(p).toEqual({ ink: rgb(day["color.text"]), bodyBg: "rgba(0, 0, 0, 0)", panelBg: "rgba(0, 0, 0, 0)", border: "solid", rule: rgb(day["color.rule"]) });
});
