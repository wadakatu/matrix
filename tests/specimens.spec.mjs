// Specimen checks for the foundation (09, tasks 1.5 and 1.6). Needs `npm run build`.
import { expect, test } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const root = join(import.meta.dirname, "..");
const ORIGIN = "http://specimens.test";
const TYPES = { ".html": "text/html", ".css": "text/css", ".woff2": "font/woff2" };
const tokens = JSON.parse(readFileSync(join(root, "dist/tokens.json"), "utf8"));
const CONTEXTS = [
  ["phosphor", "night"],
  ["phosphor", "day"],
  ["operator", "night"],
  ["operator", "day"],
];
const PAGES = [
  ["en", "/src/specimens/bare.html"],
  ["ja", "/src/specimens/bare.ja.html"],
];

/** Serves the checkout at ORIGIN; records every request, and aborts any to another origin. */
async function serve(page) {
  const requests = [];
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    requests.push(url.href);
    if (url.origin !== ORIGIN) return route.abort();
    const file = join(root, decodeURIComponent(url.pathname));
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[extname(file)] });
  });
  return requests;
}

const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;

/** unicode-range of each font file, from dist/fonts.css. */
const RANGES = Object.fromEntries(
  [...readFileSync(join(root, "dist/fonts.css"), "utf8").matchAll(/url\(\.\/fonts\/([^)]+)\)[^}]*?unicode-range: ([^;]+);/g)].map(([, file, ranges]) => [
    file,
    ranges.split(",").map((r) => {
      const [a, b = a] = r.trim().replace("U+", "").split("-");
      return [parseInt(a, 16), parseInt(b, 16)];
    }),
  ]),
);

for (const [lang, path] of PAGES) {
  test(`fonts (${lang}): no other origin, and only subsets the page uses`, async ({ page }) => {
    const requests = await serve(page);
    await page.goto(ORIGIN + path);
    await page.evaluate(() => document.fonts.ready);
    const fonts = requests.filter((u) => u.endsWith(".woff2")).map((u) => u.split("/fonts/")[1]);
    const text = await page.evaluate(() => document.body.innerText + document.title);
    const codes = new Set([...text].map((ch) => ch.codePointAt(0)));
    console.log(`${lang}: ${requests.length} requests, ${fonts.length} of ${Object.keys(RANGES).length} font files:\n  ${fonts.join("\n  ")}`);
    expect(requests.filter((u) => !u.startsWith(ORIGIN))).toEqual([]);
    expect(fonts.length).toBeGreaterThan(0);
    for (const f of fonts) {
      const used = [...codes].some((c) => RANGES[f].some(([a, b]) => c >= a && c <= b));
      expect(used, `${f} was fetched but no character on the page is in its range`).toBe(true);
    }
    const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family} ${f.weight}`));
    expect(loaded).toContain(lang === "en" ? "IBM Plex Mono 400" : "M PLUS 1 Code 400");

    // The network log task 1.5 asks for, next to the page; sorted so that a rerun leaves it unchanged.
    const inRange = (f) => [...codes].filter((c) => RANGES[f].some(([a, b]) => c >= a && c <= b)).length;
    const log = [
      `# Network log for ${path} (Chromium), written by tests/specimens.spec.mjs when it passes.`,
      `# Every request the page made; any to another origin would be listed and aborted.`,
      `requests: ${requests.length}, to another origin: ${requests.filter((u) => !u.startsWith(ORIGIN)).length}`,
      `font files fetched: ${fonts.length} of ${Object.keys(RANGES).length} in dist/fonts.css`,
      "",
      ...requests.map((u) => u.replace(ORIGIN, "")).sort().map((u) => (u.endsWith(".woff2") ? `${u}  page characters in its unicode-range: ${inRange(u.split("/fonts/")[1])}` : u)),
      "",
    ];
    writeFileSync(join(root, path.replace(/\.html$/, ".network.log")), log.join("\n"));
  });

  for (const [palette, theme] of CONTEXTS) {
    const context = `${palette}-${theme}`;
    test(`${context} (${lang}): text renders in the context's colours, and focus is visible on every focusable element`, async ({ page }) => {
      await serve(page);
      await page.goto(ORIGIN + path);
      await page.evaluate(([p, t]) => Object.assign(document.documentElement.dataset, { palette: p, theme: t }), [palette, theme]);
      const t = tokens[context];
      const body = await page.evaluate(() => {
        const s = getComputedStyle(document.body);
        return { color: s.color, background: getComputedStyle(document.documentElement).backgroundColor, family: s.fontFamily, height: document.querySelector("h1").getBoundingClientRect().height };
      });
      expect(body.color).toBe(rgb(t["color.text"]));
      expect(body.background).toBe(rgb(t["color.ground"]));
      expect(body.height).toBeGreaterThan(0);
      expect(body.family).toContain(lang === "en" ? "IBM Plex Mono" : "M PLUS 1 Code");

      const focusable = await page.locator("a[href], button, [tabindex]:not([tabindex='-1'])").count();
      const seen = [];
      for (let i = 0; i < focusable; i++) {
        await page.keyboard.press("Tab");
        const ring = await page.evaluate(() => {
          const el = document.activeElement;
          const s = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          return { name: el.textContent.trim(), style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor, offset: s.outlineOffset, visible: box.width > 0 && box.height > 0 && box.bottom > 0 };
        });
        seen.push(ring.name);
        expect(ring, `focus ring on "${ring.name}"`).toMatchObject({ style: "solid", width: "2px", color: rgb(t["color.focus"]), offset: "3px", visible: true });
      }
      expect(new Set(seen).size).toBe(focusable);
    });
  }
}

test("the skip link is the first tab stop and moves focus to main without a ring", async ({ page }) => {
  await serve(page);
  await page.goto(ORIGIN + PAGES[0][1]);
  await page.keyboard.press("Tab");
  await expect(page.locator(".mx-skip")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)).toBe("none");
});

test("a Japanese run inside English, and an English run inside Japanese, take their own face", async ({ page }) => {
  await serve(page);
  for (const [path, sel, face] of [
    [PAGES[0][1], 'span[lang="ja"]', "M PLUS 1 Code"],
    [PAGES[1][1], 'span[lang="en"]', "IBM Plex Mono"],
  ]) {
    await page.goto(ORIGIN + path);
    const family = await page.locator(sel).evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family.startsWith(`"${face}"`), `${sel} in ${path}: ${family}`).toBe(true);
  }
});
