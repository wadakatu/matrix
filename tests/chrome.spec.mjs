// The chrome on its specimen pages (09, tasks 2.3 and 2.4, and the Phase 2 exit). Needs
// `npm run build`; `npm run test:specimens` builds the pages with Astro first.
import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ORIGIN, axe, root, serve } from "./support/serve.mjs";

const DIRS = { "/assets/": "assets", "/": "dist-specimens" };
const tokens = JSON.parse(readFileSync(join(root, "dist/tokens.json"), "utf8"));
const rgb = (hex) => (hex.startsWith("rgb") ? hex : `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`);
const EN = `${ORIGIN}/chrome.html`;
const JA = `${ORIGIN}/chrome.ja.html`;
const ELEMENTS = (url) => url.pathname.startsWith("/_astro/") && url.pathname.endsWith(".js");
const CONTEXTS = [
  ["phosphor", "night", ""],
  ["phosphor", "day", "theme=day"],
  ["operator", "night", "palette=operator"],
  ["operator", "day", "palette=operator&theme=day"],
];

const root$ = (page) =>
  page.evaluate(() => {
    const d = document.documentElement;
    return { theme: d.dataset.theme, palette: d.dataset.palette ?? null, motion: d.dataset.motion ?? null, rain: d.dataset.rain ?? null, reading: d.dataset.reading ?? null, lang: d.lang };
  });
const storage = (page) =>
  page.evaluate(() => {
    const dump = (s) => Object.fromEntries(Object.keys(s).map((k) => [k, s.getItem(k)]));
    return { local: dump(localStorage), session: dump(sessionStorage) };
  });
const hrefs = (page) => page.$$eval("a[href]", (as) => as.filter((a) => !a.getAttribute("href").startsWith("#")).map((a) => a.href));
const inSite = (list) => list.filter((h) => h.startsWith(ORIGIN));
const header = (page) => page.locator(".mx-header").evaluate((el) => el.getBoundingClientRect().height);

// ---------- 2.3: the flag table in 03, one row at a time ----------

test.describe("flags (03, the root contract)", () => {
  test("no flags: night, phosphor, motion allowed, the route's reading, the page's lang", async ({ page }) => {
    await serve(page, DIRS);
    await page.goto(EN);
    expect(await root$(page)).toEqual({ theme: "night", palette: null, motion: null, rain: null, reading: "human", lang: "en" });
    expect(rgb(await page.locator('meta[name="theme-color"]').getAttribute("content"))).toBe(rgb(tokens["phosphor-night"]["color.ground"]));
    expect((await storage(page)).local).toEqual({});
  });

  test("?theme=day forces day for one load: not stored, not on links, not written back", async ({ page }) => {
    await serve(page, DIRS);
    await page.goto(`${EN}?theme=day`);
    expect((await root$(page)).theme).toBe("day");
    expect(rgb(await page.locator('meta[name="theme-color"]').getAttribute("content"))).toBe(rgb(tokens["phosphor-day"]["color.ground"]));
    expect((await storage(page)).local).toEqual({});
    for (const h of inSite(await hrefs(page))) expect(h).not.toContain("theme=");
    await page.locator('[data-action="palette"]').click();
    expect(page.url()).not.toContain("theme=");
  });

  test("?theme=night wins over a stored day; a stored day is day", async ({ page }) => {
    await serve(page, DIRS);
    await page.addInitScript(() => localStorage.setItem("mx-theme", "day"));
    await page.goto(`${EN}?theme=night`);
    expect((await root$(page)).theme).toBe("night");
    await page.goto(EN);
    expect((await root$(page)).theme).toBe("day");
    await expect(page.locator('[data-action="theme"]')).toHaveAttribute("aria-pressed", "true");
  });

  test("Daylight sets data-theme and stores mx-theme, the only persistent key", async ({ page }) => {
    await serve(page, DIRS);
    await page.goto(EN);
    await page.locator('[data-action="theme"]').click();
    expect((await root$(page)).theme).toBe("day");
    expect((await storage(page)).local).toEqual({ "mx-theme": "day" });
    expect(await page.locator('meta[name="theme-color"]').getAttribute("content")).toBe(rgb(tokens["phosphor-day"]["color.ground"]));
    await page.reload();
    expect((await root$(page)).theme).toBe("day");
    await page.locator('[data-action="theme"]').click();
    expect((await storage(page)).local).toEqual({ "mx-theme": "night" });
  });

  test("?palette=operator: operator, carried on every in-site link, never stored", async ({ page }) => {
    await serve(page, DIRS);
    await page.goto(`${EN}?palette=operator`);
    expect((await root$(page)).palette).toBe("operator");
    await expect(page.locator('[data-action="palette"]')).toHaveAttribute("aria-pressed", "true");
    const links = inSite(await hrefs(page));
    expect(links.length).toBeGreaterThan(4);
    for (const h of links) expect(new URL(h).searchParams.get("palette"), h).toBe("operator");
    for (const h of (await hrefs(page)).filter((h) => !h.startsWith(ORIGIN))) expect(h).not.toContain("palette=");
    expect(await storage(page)).toEqual({ local: {}, session: {} });
  });

  test("Operator colours rewrites the address and the links, and back", async ({ page }) => {
    await serve(page, DIRS);
    await page.goto(`${EN}?run=ls&boot=1&mode=machine#main`);
    await page.locator('[data-action="palette"]').click();
    expect((await root$(page)).palette).toBe("operator");
    expect(page.url()).toBe(`${EN}?palette=operator#main`);
    for (const h of inSite(await hrefs(page))) expect(new URL(h).searchParams.get("palette")).toBe("operator");
    await page.locator('[data-action="palette"]').click();
    expect((await root$(page)).palette).toBe(null);
    expect(page.url()).toBe(`${EN}#main`);
    for (const h of inSite(await hrefs(page))) expect(h).not.toContain("palette=");
  });

  test("?motion=0: motion off, carried on links; the OS setting: off, not carried, followed live", async ({ page }) => {
    await serve(page, DIRS);
    await page.goto(`${EN}?motion=0`);
    expect((await root$(page)).motion).toBe("off");
    for (const h of inSite(await hrefs(page))) expect(new URL(h).searchParams.get("motion")).toBe("0");
    await expect(page.locator('[data-action="hold"]')).toBeHidden();

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(EN);
    expect((await root$(page)).motion).toBe("off");
    for (const h of inSite(await hrefs(page))) expect(h).not.toContain("motion=");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect.poll(async () => (await root$(page)).motion).toBe(null);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(async () => (await root$(page)).motion).toBe("off");
  });

  test("Hold rain sets data-rain=held with scripts, and the checkbox holds without them", async ({ page, browser }) => {
    await serve(page, DIRS);
    await page.goto(EN);
    await page.locator('[data-action="hold"] input').check();
    expect((await root$(page)).rain).toBe("held");
    await page.locator('[data-action="hold"] input').uncheck();
    expect((await root$(page)).rain).toBe(null);

    const off = await browser.newPage({ javaScriptEnabled: false });
    await serve(off, DIRS);
    await off.goto(EN);
    await off.locator('[data-action="hold"] input').check();
    expect(await off.evaluate(() => document.documentElement.matches(':has([data-action="hold"] input:checked)'))).toBe(true);
    await off.close();
  });

  test("spent flags (theme, boot, run, mode) are never carried on links", async ({ page }) => {
    await serve(page, DIRS);
    await page.goto(`${EN}?theme=day&boot=1&run=ls&mode=machine&palette=operator`);
    for (const h of inSite(await hrefs(page))) {
      const q = new URL(h).searchParams;
      for (const k of ["theme", "boot", "run", "mode"]) expect(q.has(k), `${k} on ${h}`).toBe(false);
    }
  });

  test("lang and the chrome strings follow the page", async ({ page }) => {
    await serve(page, DIRS);
    await page.goto(JA);
    expect((await root$(page)).lang).toBe("ja");
    await expect(page.locator(".mx-skip")).toHaveText("本文へ移動");
  });
});

test("storage that throws changes nothing visible", async ({ page, browser }) => {
  const shot = async (p) => {
    await p.evaluate(() => document.fonts.ready);
    return p.screenshot({ fullPage: true, animations: "disabled" });
  };
  await serve(page, DIRS);
  await page.goto(EN);
  const normal = await shot(page);

  const broken = await browser.newPage();
  const errors = [];
  broken.on("pageerror", (e) => errors.push(e.message));
  await broken.addInitScript(() => {
    for (const name of ["localStorage", "sessionStorage"]) {
      Object.defineProperty(window, name, { get: () => { throw new DOMException("denied", "SecurityError"); } });
    }
  });
  await serve(broken, DIRS);
  await broken.goto(EN);
  expect(Buffer.compare(await shot(broken), normal)).toBe(0);
  await broken.locator('[data-action="theme"]').click();
  await broken.locator('[data-action="palette"]').click();
  expect(await root$(broken)).toMatchObject({ theme: "day", palette: "operator" });
  expect(errors).toEqual([]);
  await broken.close();
});

test("with the controller blocked, links still carry palette and motion, and no toggle is a dead button", async ({ page }) => {
  const requests = await serve(page, DIRS, { block: ELEMENTS });
  await page.goto(`${EN}?palette=operator&motion=0&run=ls`);
  expect(requests.some((u) => ELEMENTS(new URL(u)))).toBe(true);
  expect(await page.evaluate(() => customElements.get("mx-root"))).toBeUndefined();
  expect(await root$(page)).toMatchObject({ palette: "operator", motion: "off" });
  const links = inSite(await hrefs(page));
  expect(links.length).toBeGreaterThan(4);
  for (const h of links) {
    const q = new URL(h).searchParams;
    expect([q.get("palette"), q.get("motion"), q.has("run")], h).toEqual(["operator", "0", false]);
  }
  await expect(page.locator('[data-action="palette"]')).toBeHidden();
  await expect(page.locator('[data-action="theme"]')).toBeHidden();
});

test("no flash of the wrong theme on a day reload", async ({ page, context }, info) => {
  await serve(page, DIRS);
  await page.goto(EN);
  await page.locator('[data-action="theme"]').click();
  // Before the first frame paints, record the ground the root resolves to.
  await page.addInitScript(() => {
    requestAnimationFrame(() => {
      window.__firstFrame = { theme: document.documentElement.dataset.theme, ground: getComputedStyle(document.documentElement).backgroundColor };
    });
  });
  await context.tracing.start({ screenshots: true, snapshots: true });
  await page.reload();
  await page.waitForFunction(() => window.__firstFrame);
  const trace = info.outputPath("day-reload-trace.zip");
  await context.tracing.stop({ path: trace });
  await info.attach("day reload trace", { path: trace, contentType: "application/zip" });
  expect(await page.evaluate(() => window.__firstFrame)).toEqual({ theme: "day", ground: rgb(tokens["phosphor-day"]["color.ground"]) });
});

test("the palette is in no storage after any sequence of changes (decision Q4)", async ({ page }) => {
  await serve(page, DIRS);
  await page.goto(EN);
  const palette = page.locator('[data-action="palette"]');
  const theme = page.locator('[data-action="theme"]');
  for (const step of [palette, theme, palette, palette, theme, page.locator('[data-action="hold"] input'), palette]) await step.click();
  await page.reload();
  await page.goto(`${EN}?palette=operator`);
  await palette.click();
  await palette.click();
  await page.locator(".mx-nav a").nth(0).click();
  const all = JSON.stringify(await storage(page));
  expect(all).not.toMatch(/palette|operator|phosphor/);
});

test("the Mark is the real logo from assets/logo/, whole", async ({ page }) => {
  await serve(page, DIRS);
  await page.goto(EN);
  const img = page.locator(".mx-mark .mx-logo");
  const src = new URL(await img.getAttribute("src"), EN).pathname;
  expect(src).toBe("/assets/logo/logo-400.png");
  const sum = createHash("sha256").update(readFileSync(join(root, src))).digest("hex");
  expect(readFileSync(join(root, "assets/logo/logo-400.png.sha256"), "utf8")).toContain(sum);
  expect(await img.evaluate((el) => ({ loaded: el.complete && el.naturalWidth, alt: el.alt, radius: getComputedStyle(el).borderRadius, clip: getComputedStyle(el).clipPath, transform: getComputedStyle(el).transform, fit: getComputedStyle(el).objectFit })))
    .toEqual({ loaded: 400, alt: "", radius: "0px", clip: "none", transform: "none", fit: "contain" });
});

// ---------- 2.4: the header and its menu ----------

test.describe("header", () => {
  for (const reading of ["human", "machine"]) {
    // The prototype at 93ca12d measures 69 at 1440 and 1100, wraps at 720 (125px), and 53 from 320 to 719.
    test(`is 69px at 1440 and 53px from 320 to 719, in ${reading}`, async ({ page }) => {
      await serve(page, DIRS);
      for (const [width, want] of [[1440, 69], [1100, 69], [719, 53], [601, 53], [600, 53], [430, 53], [390, 53], [360, 53], [320, 53]]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(EN);
        await page.evaluate((r) => (document.documentElement.dataset.reading = r), reading);
        await page.evaluate(() => document.fonts.ready);
        expect(await header(page), `${width}px`).toBe(want);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no horizontal overflow at ${width}`).toBe(true);
        await expect(page.locator('[data-action="hold"]'), `Hold rain at ${width}, ${reading}`).toHaveCount(1);
      }
    });
  }

  test("Hold rain is present in both readings, from 720px without opening anything", async ({ page }) => {
    await serve(page, DIRS);
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const reading of ["human", "machine"]) {
      await page.goto(EN);
      await page.evaluate((r) => (document.documentElement.dataset.reading = r), reading);
      await expect(page.locator('[data-action="hold"]')).toBeVisible();
    }
  });

  test("tab order at 1440: the prototype's, without the switch (task 3.5), then the language link", async ({ page }) => {
    await serve(page, DIRS);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(EN);
    const order = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      order.push(await page.evaluate(() => (document.activeElement.closest("label") ?? document.activeElement).textContent.trim()));
    }
    // The prototype at 93ca12d, 1440, 人間用 Home: Skip to content, wadakatu_, Home, Projects, Blog,
    // About, 人間用, 機械用, Hold rain, Operator colours, Daylight (docs/verification/phase-2.md).
    expect(order).toEqual(["Skip to content", "fixture_", "Home", "Projects", "Blog", "About", "Hold rain", "Operator colours", "Daylight", "日本語"]);
  });

  test.describe("the menu at 390 (MATRIX-NOTES, the phone header: Checks)", () => {
    test.beforeEach(async ({ page }) => {
      await serve(page, DIRS);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(EN);
    });
    const summary = (page) => page.locator(".mx-menu > summary");
    const open = (page) => page.locator(".mx-menu").evaluate((d) => d.open);

    test("closed: Skip, Mark, Menu; Enter opens; Escape closes and returns focus", async ({ page }) => {
      const order = [];
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press("Tab");
        order.push(await page.evaluate(() => (document.activeElement.closest("label") ?? document.activeElement).textContent.trim()));
      }
      expect(order).toEqual(["Skip to content", "fixture_", "Menu"]);
      await page.keyboard.press("Enter");
      expect(await open(page)).toBe(true);
      await page.keyboard.press("Tab");
      await expect(page.locator(".mx-nav a").first()).toBeFocused();
      await page.keyboard.press("Escape");
      expect(await open(page)).toBe(false);
      await expect(summary(page)).toBeFocused();
    });

    test("an outside press closes it; Hold rain set in the menu stays held when closed", async ({ page }) => {
      await summary(page).click();
      await page.locator('[data-action="hold"] input').check();
      await page.mouse.click(200, 600);
      expect(await open(page)).toBe(false);
      expect((await root$(page)).rain).toBe("held");
    });

    test("palette and theme change without closing it", async ({ page }) => {
      await summary(page).click();
      await page.locator('[data-action="palette"]').click();
      await page.locator('[data-action="theme"]').click();
      expect(await open(page)).toBe(true);
      expect(await root$(page)).toMatchObject({ palette: "operator", theme: "day" });
    });

    test("a change of reading closes it", async ({ page }) => {
      await summary(page).click();
      await page.evaluate(() => dispatchEvent(new CustomEvent("mx:reading", { detail: "machine" })));
      expect(await open(page)).toBe(false);
    });

    test("open, then resized to 1440, it is the 69px row", async ({ page }) => {
      await summary(page).click();
      expect(await header(page)).toBeGreaterThan(53);
      await page.setViewportSize({ width: 1440, height: 900 });
      expect(await header(page)).toBe(69);
    });

    test("forced colours: the figure stays; open and pressed are Highlight / HighlightText (05)", async ({ page }) => {
      await page.emulateMedia({ forcedColors: "active" });
      // A system colour as the engine resolves it, from a probe that forced colours leave alone.
      const sys = (c) => page.evaluate((c) => {
        const i = document.body.appendChild(document.createElement("i"));
        i.style.cssText = `forced-color-adjust: none; color: ${c}`;
        const v = getComputedStyle(i).color;
        i.remove();
        return v;
      }, c);
      const look = (sel, pseudo) => page.locator(sel).evaluate((el, pseudo) => {
        const s = getComputedStyle(el, pseudo);
        return { bg: s.backgroundColor, color: s.color, image: s.backgroundImage };
      }, pseudo);
      expect(await look(".mx-menu > summary", "::before")).toMatchObject({ color: await sys("ButtonText"), image: expect.stringContaining("gradient") });
      await summary(page).click();
      expect((await look(".mx-menu > summary")).bg).toBe(await sys("Highlight"));
      expect(await look(".mx-menu > summary", "::before")).toMatchObject({ color: await sys("HighlightText"), image: expect.stringContaining("gradient") });
      await page.locator('[data-action="palette"]').click();
      expect(await look('[data-action="palette"]')).toMatchObject({ bg: await sys("Highlight"), color: await sys("HighlightText") });
      expect((await look('[data-action="theme"]')).bg).not.toBe(await sys("Highlight"));
    });

    test("menu lines and controls are 44px targets", async ({ page }) => {
      await summary(page).click();
      const boxes = await page.$$eval(".mx-header .mx-nav a, .mx-controls .mx-control, .mx-lang, .mx-menu > summary", (els) => els.map((e) => [e.textContent.trim(), e.getBoundingClientRect().height]));
      for (const [name, h] of boxes) expect(h, name).toBeGreaterThanOrEqual(44);
    });
  });
});

// ---------- Phase 2 exit: accessibility and no-JavaScript, four contexts, both languages ----------

for (const [lang, url] of [["en", EN], ["ja", JA]]) {
  for (const [palette, theme, query] of CONTEXTS) {
    const context = `${palette}-${theme}`;
    test(`exit (${lang}, ${context}): no axe violations at WCAG 2.2 AA, at 1440 and 390`, async ({ page }) => {
      await serve(page, DIRS);
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(query ? `${url}?${query}` : url);
        expect(await root$(page)).toMatchObject({ palette: palette === "operator" ? "operator" : null, theme });
        expect(await axe(page), `${width}px`).toEqual([]);
      }
    });

    test(`exit (${lang}, ${context}): without JavaScript the page is complete and has no dead controls`, async ({ browser }) => {
      const page = await browser.newPage({ javaScriptEnabled: false });
      await serve(page, DIRS);
      await page.goto(url);
      // Without scripts the head script cannot read flags; a context is a theme scope set on the root.
      await page.evaluate(([p, t]) => Object.assign(document.documentElement.dataset, { palette: p, theme: t }), [palette, theme]);
      const s = await page.evaluate(() => ({ bg: getComputedStyle(document.documentElement).backgroundColor, text: getComputedStyle(document.body).color }));
      expect(s).toEqual({ bg: rgb(tokens[context]["color.ground"]), text: rgb(tokens[context]["color.text"]) });
      await expect(page.locator(".mx-header")).toBeVisible();
      await expect(page.locator(".mx-panel")).toHaveCount(3);
      await expect(page.locator(".mx-footer")).toBeVisible();
      await expect(page.locator('[data-action="palette"]')).toBeHidden();
      await expect(page.locator('[data-action="theme"]')).toBeHidden();
      await expect(page.locator('[data-action="hold"]')).toBeVisible();
      for (const a of await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")))) expect(a).not.toBe("");
      // The phone menu is the native disclosure.
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator(".mx-menu > summary").click();
      await expect(page.locator(".mx-nav")).toBeVisible();
      // axe needs timers, which a page without JavaScript does not run: audit this same DOM, its
      // scripts removed, in a page that has them.
      const html = (await page.content()).replace(/<script\b[\s\S]*?<\/script>/g, "");
      const audit = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await serve(audit, DIRS);
      await audit.route(`${ORIGIN}/__nojs.html`, (r) => r.fulfill({ contentType: "text/html", body: html }));
      await audit.goto(`${ORIGIN}/__nojs.html`);
      expect(await audit.evaluate(() => customElements.get("mx-root"))).toBeUndefined();
      expect(await axe(audit)).toEqual([]);
      await audit.close();
      await page.close();
    });
  }
}

test("Moved: refresh, canonical and a visible link; with scripts the query and fragment come along", async ({ page, browser }) => {
  await serve(page, DIRS);
  await page.goto(`${ORIGIN}/moved.html?palette=operator#main`);
  await page.waitForURL(`${EN}?palette=operator#main`);
  const off = await browser.newPage({ javaScriptEnabled: false });
  await serve(off, DIRS);
  await off.goto(`${ORIGIN}/moved.html?palette=operator`, { waitUntil: "commit" });
  const head = await off.evaluate(() => ({ refresh: document.querySelector('meta[http-equiv="refresh"]')?.content, canonical: document.querySelector('link[rel="canonical"]')?.href, link: document.querySelector(".mx-moved a")?.getAttribute("href") }));
  expect(head).toEqual({ refresh: "0; url=/chrome.html", canonical: "https://example.com/chrome.html", link: "/chrome.html" });
  await off.close();
});
