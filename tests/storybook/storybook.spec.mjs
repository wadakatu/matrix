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

test("language: the chrome strings passed to the story follow the toolbar", async ({ page }) => {
  // The story is written in English; only the global changes.
  const words = () => page.locator("#storybook-root").evaluate((el) => ({
    text: el.textContent.replace(/\s+/g, " ").trim(),
    nav: el.querySelector(".mx-nav")?.getAttribute("aria-label"),
    lang: el.querySelector(".mx-lang")?.textContent,
  }));
  await story(page, "chrome-header--narrow-open", "language:en");
  expect(await words()).toMatchObject({ nav: "Main", lang: "日本語" });
  expect((await words()).text).toContain("Daylight");
  await story(page, "chrome-header--narrow-open", "language:ja");
  const ja = await words();
  expect(ja).toMatchObject({ nav: "メイン", lang: "English" });
  for (const s of ["メニュー", "雨を止める", "オペレーター配色", "デイライト"]) expect(ja.text).toContain(s);
  expect(ja.text).not.toContain("Daylight");
  // In Contexts every frame follows.
  await story(page, "chrome-control--contexts", "language:ja");
  expect(await page.locator(".fixture-scope .mx-control").allTextContents()).toEqual(Array(4).fill("オペレーター配色"));
});

test("the Control's state stories show their state: hovered takes the accent border, focused the ring", async ({ page }) => {
  // The pointer starts at (0, 0), over the control; move it off so only the story sets hover.
  const look = async () => (await page.mouse.move(600, 600), page.locator(".mx-control").first()).evaluate((el) => ({ border: getComputedStyle(el).borderColor, outline: getComputedStyle(el).outlineStyle }));
  const accent = rgb(tokens["phosphor-night"]["color.accent"]);
  await story(page, "chrome-control--default");
  expect(await look()).toMatchObject({ outline: "none" });
  expect((await look()).border).not.toBe(accent);
  for (const s of ["hovered", "hold-hovered"]) {
    await story(page, `chrome-control--${s}`);
    expect((await look()).border, s).toBe(accent);
  }
  for (const s of ["focused", "hold-focused"]) {
    await story(page, `chrome-control--${s}`);
    expect((await look()).outline, s).toBe("solid");
  }
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

test("the terminal's stories keep no mx-* storage: a closed guide and a typed command stay in their story (03, 06)", async ({ page }) => {
  const shell = async (id) => {
    await story(page, id);
    await page.waitForFunction(() => document.documentElement.dataset.shell === "live");
  };
  const keys = () => page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith("mx-")));
  const field = page.locator(".mx-prompt-field input");
  await shell("terminal-terminal--default");
  await page.locator(".mx-guide-hide").click();
  await expect(page.locator(".mx-guide")).toBeHidden();
  await field.fill("whoami");
  await field.press("Enter");
  expect(await keys()).toEqual([]);
  // Nor is what the site would have left read: the next story has its guide and an empty history.
  await page.evaluate(() => {
    sessionStorage.setItem("mx-guide", "off");
    sessionStorage.setItem("mx-history", JSON.stringify(["whoami"]));
  });
  await shell("terminal-terminal--projects");
  await expect(page.locator(".mx-guide")).toBeVisible();
  await field.press("ArrowUp");
  await expect(field).toHaveValue("");
});
