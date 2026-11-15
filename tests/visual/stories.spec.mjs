// One screenshot per Contexts story at 1440 and per Narrow story at 390 (06, "Testing through
// stories"); a component without a Narrow story has its Contexts story captured at 390 as well,
// so every component has a wide and a narrow baseline (04, definition of done, point 6).
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ORIGIN, root, serve } from "../support/serve.mjs";

const index = JSON.parse(readFileSync(join(root, "storybook-static/index.json"), "utf8"));
const stories = Object.values(index.entries).filter((e) => e.type === "story" && !e.id.startsWith("self-test"));
const byComponent = Object.groupBy(stories, (s) => s.title);
const shots = [];
for (const [title, list] of Object.entries(byComponent)) {
  const narrow = list.filter((s) => /^Narrow/.test(s.name));
  for (const s of list.filter((s) => /Contexts$/.test(s.name))) {
    shots.push([s, 1440]);
    if (!narrow.length) shots.push([s, 390]);
  }
  for (const s of narrow) shots.push([s, 390]);
  if (!list.some((s) => /Contexts$/.test(s.name)) && !narrow.length) console.log(`no visual baseline for ${title}: it has no Contexts or Narrow story`);
}

for (const [story, width] of shots) {
  test(`${story.id} at ${width}`, async ({ page }) => {
    const failures = [];
    page.on("pageerror", (e) => failures.push(e.message));
    const requests = await serve(page, { "/": "storybook-static" });
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto(`${ORIGIN}/iframe.html?id=${story.id}&viewMode=story`);
    await page.locator("#storybook-root > *").first().waitFor({ state: "attached" });
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "no horizontal overflow").toBe(true);
    await expect(page).toHaveScreenshot(`stories/${story.id}-${width}.png`, { fullPage: true });
    expect(requests.filter((u) => !u.startsWith(ORIGIN))).toEqual([]);
    expect(failures).toEqual([]);
  });
}
