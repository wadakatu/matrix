// The static Storybook (09, task 2.1): each toolbar global changes the rendered story, and the
// Colour page shows the contrast gate's own figures. Runs with the visual tests, against the build.
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ORIGIN, root, serve } from "../support/serve.mjs";
import { contrast, declaredPairs } from "../../scripts/gates.mjs";
import { readSources } from "../../scripts/tokens-doc.mjs";

const tokens = JSON.parse(readFileSync(join(root, "dist/tokens.json"), "utf8"));
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
const story = async (page, id, globals = "") => {
  await serve(page, { "/": "storybook-static" });
  await page.goto(`${ORIGIN}/iframe.html?id=${id}&viewMode=story${globals && `&globals=${globals}`}`);
  await page.locator("#storybook-root > *").first().waitFor({ state: "attached" });
  return page;
};
const rootAttrs = (page) => page.evaluate(() => ({ ...document.documentElement.dataset, lang: document.documentElement.lang }));

test("palette and theme: the root attributes, and the story's colours, follow the toolbar", async ({ page }) => {
  for (const [palette, theme] of [["phosphor", "night"], ["operator", "night"], ["phosphor", "day"], ["operator", "day"]]) {
    await story(page, "surfaces-panel--default", `palette:${palette};theme:${theme}`);
    expect(await rootAttrs(page)).toMatchObject({ palette, theme });
    const bg = await page.locator(".mx-panel").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg, `${palette}-${theme}`).toBe(rgb(tokens[`${palette}-${theme}`]["color.panel"]));
  }
});

test("motion: held sets data-rain, off sets data-motion and takes Hold rain away", async ({ page }) => {
  await story(page, "chrome-control--hold");
  await expect(page.locator('[data-action="hold"]')).toBeVisible();
  await story(page, "chrome-control--hold", "motion:held");
  expect(await rootAttrs(page)).toMatchObject({ rain: "held" });
  await story(page, "chrome-control--hold", "motion:off");
  expect(await rootAttrs(page)).toMatchObject({ motion: "off" });
  await expect(page.locator('[data-action="hold"]')).toBeHidden();
});

test("language: lang on the root, and the text takes the Japanese face", async ({ page }) => {
  const face = () => page.locator(".mx-lede").evaluate((el) => getComputedStyle(el).fontFamily);
  await story(page, "surfaces-lede--default");
  expect(await face()).toMatch(/^"IBM Plex Mono"/);
  await story(page, "surfaces-lede--default", "language:ja");
  expect((await rootAttrs(page)).lang).toBe("ja");
  expect(await face()).toMatch(/^"M PLUS 1 Code"/);
});

test("reading: 機械用 draws the nav as a numbered window list", async ({ page }) => {
  const marker = () => page.locator(".mx-nav a").first().evaluate((el) => getComputedStyle(el, "::before").content);
  await story(page, "chrome-nav--default");
  expect(await marker()).toBe("none");
  await story(page, "chrome-nav--default", "reading:machine");
  expect((await rootAttrs(page)).reading).toBe("machine");
  expect(await marker()).toMatch(/^counter\(win\) ":"/);
});

test("the Colour page shows the ratios the contrast gate computes", async ({ page }) => {
  const { rows } = contrast(tokens, declaredPairs(readSources(root)));
  await serve(page, { "/": "storybook-static" });
  await page.goto(`${ORIGIN}/iframe.html?id=foundations-colour--docs&viewMode=docs`);
  await page.locator("#contrast tbody tr").first().waitFor();
  const shown = await page.$$eval("#contrast tbody td[data-context]", (tds) => tds.map((td) => [td.closest("tr").dataset.pair, td.dataset.context, td.textContent]));
  expect(shown.length).toBe(rows.length);
  for (const r of rows) {
    const cell = shown.find(([pair, c]) => pair === `${r.fg} on ${r.bg}` && c === r.context);
    expect(cell?.[2], `${r.fg} on ${r.bg} in ${r.context}`).toBe(`${r.ratio.toFixed(2)} (Lc ${r.lc.toFixed(1)})`);
  }
});
