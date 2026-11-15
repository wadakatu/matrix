// Phase 3, Signature (09, tasks 3.2–3.9), on the Human home and Projects specimens in both readings.
// Needs `npm run build`; `npm run test:specimens` builds the pages with Astro first.
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ORIGIN, axe, root, serve } from "./support/serve.mjs";

const DIRS = { "/assets/": "assets", "/": "dist-specimens" };
const tokens = JSON.parse(readFileSync(join(root, "dist/tokens.json"), "utf8"))["phosphor-night"];
const ELEMENTS = (url) => url.pathname.startsWith("/_astro/") && url.pathname.endsWith(".js");
const PAGES = { human: { home: "/human-home.html", projects: "/human-projects.html" }, machine: { home: "/home.html", projects: "/projects.html" } };
const TITLES = {
  home: { machine: "fixture_ | Fixture developer", human: "fixture_, human reading | Fixture developer" },
  projects: { machine: "Projects | fixture_", human: "Projects, human reading | fixture_" },
};
const STATUS = { machine: "Machine reading", human: "Human reading" };

/** Opens a specimen. The boot is marked seen unless `boot` is set. */
async function open(page, path, { boot = false, block } = {}) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const requests = await serve(page, DIRS, { block });
  if (!boot) await page.addInitScript(() => sessionStorage.setItem("mx-boot", "1"));
  await page.goto(ORIGIN + path);
  await page.evaluate(() => document.fonts.ready);
  return { errors, requests };
}
const ready = (page) => page.waitForFunction(() => customElements.get("mx-readings") && customElements.get("mx-root"));
const state = (page) =>
  page.evaluate(() => ({
    reading: document.documentElement.dataset.reading,
    path: location.pathname + location.search,
    title: document.title,
    status: document.querySelector(".mx-status").textContent,
    busy: document.querySelectorAll("[aria-busy]").length,
    styled: [...document.querySelectorAll("mx-readings, .mx-ln")].filter((e) => e.hasAttribute("style")).length,
    transform: getComputedStyle(document.querySelector("mx-readings")).transform,
    scripted: document.getAnimations().filter((a) => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition)).length,
    doubled: document.querySelectorAll(".mx-name[data-double]").length,
    curtain: document.querySelectorAll(".mx-curtain[data-on]").length,
    current: [...document.querySelectorAll(".mx-header a[data-to][aria-current]")].map((a) => a.dataset.to),
    focus: document.activeElement?.matches(".mx-header a[data-to]") ? `switch:${document.activeElement.dataset.to}` : document.activeElement?.tagName,
  }));
const texts = (page) =>
  page.evaluate(() => [...document.querySelectorAll('mx-readings > [data-reading="human"] :is(h2, p, li, .mx-stream-name), .mx-name, .mx-header .mx-switch-label')].map((e) => e.textContent));
async function settled(page, page_, want, before) {
  const s = await state(page);
  expect(s).toMatchObject({ reading: want, path: PAGES[want][page_], title: TITLES[page_][want], status: STATUS[want], busy: 0, styled: 0, transform: "none", scripted: 0, doubled: 0, curtain: 0, current: [want] });
  if (before) expect(await texts(page)).toEqual(before);
  return s;
}
const running = (page, endless = false) =>
  page.evaluate((endless) => document.getAnimations().filter((a) => a.playState === "running" && (!endless || a.effect.getComputedTiming().iterations === Infinity)).length, endless);
const press = (page) => page.locator(".mx-header a[data-to]:not([aria-current])").evaluate((a) => a.click());

// ---------- 3.2 Rain, and Hold ----------

test.describe("3.2 rain", () => {
  for (const [width, cols] of [[1440, 40], [1100, 40], [1099, 20], [720, 20], [719, 10], [390, 10]]) {
    test(`density at ${width}: ${cols} columns`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page, PAGES.human.home);
      expect(await page.locator(".mx-rain .mx-rain-col").evaluateAll((c) => c.filter((e) => getComputedStyle(e).display !== "none").length)).toBe(cols);
    });
  }

  test("band: not fixed, one viewport tall, fading from half way", async ({ page }) => {
    await open(page, PAGES.human.home);
    const band = await page.locator(".mx-rain").evaluate((r) => {
      r.dataset.variant = "band";
      const s = getComputedStyle(r);
      return { position: s.position, height: r.getBoundingClientRect().height, mask: s.maskImage };
    });
    expect(band).toMatchObject({ position: "absolute", height: page.viewportSize().height });
    expect(band.mask).toContain("linear-gradient");
  });

  test("the still: drops parked down the whole document, nothing moves, no Hold control", async ({ page }) => {
    await open(page, `${PAGES.human.home}?motion=0`);
    expect(await running(page)).toBe(0);
    const r = await page.locator(".mx-rain").evaluate((el) => ({ position: getComputedStyle(el).position, height: el.getBoundingClientRect().height, doc: document.documentElement.scrollHeight }));
    expect(r.position).toBe("absolute");
    expect(r.height).toBeGreaterThan(1500);
    const tops = await page.locator(".mx-drop").evaluateAll((ds) => ds.slice(0, 6).map((d) => [d.style.getPropertyValue("--rest"), getComputedStyle(d).top]));
    for (const [rest, top] of tops) expect(parseFloat(top)).toBeGreaterThanOrEqual(0) && expect(rest).toMatch(/%$/);
    await expect(page.locator('[data-action="hold"]')).toBeHidden();
  });

  test("reduced motion from the OS is the same still, without scripts too", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await open(page, PAGES.human.home);
    expect(await running(page)).toBe(0);
    await ctx.close();
  });

  for (const reading of ["human", "machine"]) {
    test(`held with scripts, ${reading}: no endless animation runs`, async ({ page }) => {
      await open(page, PAGES[reading].home);
      await ready(page);
      expect(await running(page, true)).toBeGreaterThan(0);
      await page.locator('[data-action="hold"]').click();
      expect(await page.evaluate(() => document.documentElement.dataset.rain)).toBe("held");
      expect(await running(page, true)).toBe(0);
    });
  }

  test("held without scripts, through :has()", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await open(page, PAGES.human.home);
    expect(await running(page, true)).toBeGreaterThan(0);
    await page.locator('[data-action="hold"] input').check();
    expect(await page.evaluate(() => document.documentElement.dataset.rain)).toBeUndefined();
    expect(await running(page, true)).toBe(0);
    await ctx.close();
  });

  // Ported from the prototype's docs/design-explore/hold-recolor.mjs: Hold, then palette and theme twice.
  for (const width of [1440, 390]) {
    test(`hold then recolour does not freeze the page at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      let crashed = false;
      page.on("crash", () => (crashed = true));
      await open(page, PAGES.human.home);
      await ready(page);
      if (width < 720) await page.locator(".mx-menu > summary").click();
      await page.locator('[data-action="hold"] input').check();
      for (const action of ["palette", "theme", "palette", "theme"]) {
        const t0 = Date.now();
        await page.locator(`[data-action="${action}"]`).click({ timeout: 5000 });
        const click = Date.now() - t0;
        const frames = await page.evaluate(() => new Promise((resolve) => {
          const start = performance.now();
          let n = 0;
          const tick = () => (++n, performance.now() - start >= 1500 ? resolve(n) : requestAnimationFrame(tick));
          requestAnimationFrame(tick);
        }));
        expect(click, `${action}: click time`).toBeLessThan(5000);
        expect(frames, `${action}: frames in 1.5s`).toBeGreaterThanOrEqual(20);
      }
      expect(crashed).toBe(false);
    });
  }

  for (const [reading, page_] of [["human", "home"], ["human", "projects"], ["machine", "home"], ["machine", "projects"]]) {
    for (const width of [1440, 390]) {
      test(`at most 170 animating elements: ${reading} ${page_} at ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await open(page, PAGES[reading][page_]);
        await ready(page);
        await page.waitForTimeout(200);
        const n = await page.evaluate(() => new Set(document.getAnimations().filter((a) => a.playState === "running").map((a) => a.effect.target)).size);
        console.log(`animating elements, ${reading} ${page_} at ${width}: ${n}`);
        expect(n).toBeLessThanOrEqual(170);
      });
    }
  }
});

// ---------- 3.3 Name ----------

test.describe("3.3 name", () => {
  for (const [width, masked] of [[1440, true], [720, true], [719, false], [390, false]]) {
    test(`masked from 720px, solid below: ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page, PAGES.human.home);
      const mask = await page.locator(".mx-name").evaluate((h) => getComputedStyle(h).maskImage);
      if (masked) expect(mask).toContain("data:image/svg+xml");
      else expect(mask).toBe("none");
    });
  }

  test("a terminal line with a cursor in 機械用, five blinks", async ({ page }) => {
    await open(page, PAGES.machine.home);
    const n = await page.locator(".mx-name").evaluate((h) => {
      const s = getComputedStyle(h), a = getComputedStyle(h, "::after");
      return { mask: s.maskImage, size: parseFloat(s.fontSize), cursor: a.content, iterations: a.animationIterationCount, shadow: s.textShadow };
    });
    expect(n).toMatchObject({ mask: "none", cursor: '""', iterations: "5" });
    expect(n.size).toBeGreaterThanOrEqual(28);
    expect(n.size).toBeLessThanOrEqual(44);
    expect(n.shadow).not.toBe("none");
  });

  for (const [reading, page_] of [["human", "home"], ["human", "projects"], ["machine", "home"], ["machine", "projects"]]) {
    for (const js of [true, false]) {
      test(`one h1 in ${reading} ${page_}${js ? "" : " without scripts"}`, async ({ browser }) => {
        const ctx = await browser.newContext({ javaScriptEnabled: js });
        const page = await ctx.newPage();
        await open(page, PAGES[reading][page_]);
        expect(await page.locator("h1").count()).toBe(1);
        await expect(page.locator("h1")).toBeVisible();
        await ctx.close();
      });
    }
  }

  test("one h1 after a change, in each reading", async ({ page }) => {
    await open(page, `${PAGES.human.home}?motion=0`);
    await ready(page);
    for (const _ of [1, 2]) {
      await press(page);
      expect(await page.locator("h1:visible").count()).toBe(1);
    }
  });
});

// ---------- 3.4 Stream and Streams ----------

test.describe("3.4 streams", () => {
  test("wall: seven columns from 1360px, stacked below; rows stay stacked", async ({ page }) => {
    const cols = () => page.locator(".mx-streams").evaluate((u) => getComputedStyle(u).gridTemplateColumns.split(" ").length);
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, PAGES.human.home);
    expect(await cols()).toBe(7);
    await page.setViewportSize({ width: 1359, height: 900 });
    expect(await cols()).toBe(1);
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, PAGES.human.projects);
    expect(await cols()).toBe(1);
    expect(await page.locator(".mx-streams").getAttribute("data-variant")).toBe("rows");
  });

  test("hover and focus hold a stream; its link's focus outlines the whole stream", async ({ page }) => {
    await open(page, PAGES.human.projects);
    await ready(page);
    const stream = page.locator(".mx-stream").first();
    const playing = () => stream.locator(".mx-drop").evaluateAll((ds) => ds.flatMap((d) => d.getAnimations()).map((a) => a.playState));
    expect(await playing()).toContain("running");
    await stream.hover();
    expect(new Set(await playing())).toEqual(new Set(["paused"]));
    await page.mouse.move(0, 0);
    await page.locator("main").focus();
    await page.keyboard.press("Tab");
    while (!(await page.evaluate(() => document.activeElement.matches(".mx-stream-name a")))) await page.keyboard.press("Tab");
    expect(new Set(await playing())).toEqual(new Set(["paused"]));
    const outline = await stream.evaluate((s) => [getComputedStyle(s).outlineStyle, getComputedStyle(s.querySelector(".mx-stream-name a")).outlineStyle]);
    expect(outline).toEqual(["solid", "none"]);
  });
});

// ---------- 3.5 Switch ----------

test.describe("3.5 switch", () => {
  test("rain in the header, capsule on 人間用 Home; no brace, no bits, no ?switch=", async ({ page }) => {
    await open(page, `${PAGES.human.home}?switch=brace`);
    const header = await page.locator(".mx-header .mx-switch-side").first().evaluate((a) => ({ mode: getComputedStyle(a).writingMode, font: getComputedStyle(a).fontFamily }));
    expect(header.mode).toBe("vertical-rl");
    expect(header.font).toContain("DotGothic16");
    expect(await page.evaluate(() => document.documentElement.hasAttribute("data-switch"))).toBe(false);
    const capsule = page.locator('.mx-switch[data-variant="capsule"]');
    await expect(capsule).toHaveCount(1);
    expect(await capsule.locator("small").allTextContents()).toEqual(["the page", "a shell"]);
    expect(await capsule.locator('[data-to="machine"]').evaluate((a) => getComputedStyle(a, "::before").backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
    for (const name of ["人間用", "機械用"]) await expect(page.getByRole("link", { name, exact: true }).first()).toBeVisible();
  });

  test("compact at 390: one tab stop named by its destination, which changes in place", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, PAGES.human.home);
    await ready(page);
    const sides = page.locator(".mx-header a[data-to]");
    expect(await sides.evaluateAll((as) => as.map((a) => [a.dataset.to, a.tabIndex, a.getAttribute("aria-hidden"), a.getAttribute("aria-label")]))).toEqual([
      ["human", -1, "true", null],
      ["machine", 0, null, "人間用から機械用へ"],
    ]);
    const box = await page.locator(".mx-header .mx-switch").boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await page.getByRole("link", { name: "人間用から機械用へ" }).focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => !document.querySelector("[aria-busy]"));
    expect((await state(page)).reading).toBe("machine");
    await expect(page.getByRole("link", { name: "機械用から人間用へ" })).toBeFocused();
  });

  // The prototype at 93ca12d: 69px at 1440 and 1100, 53px from 320 to 719, both readings
  // (docs/verification/phase-2.md), now with the switch in the row.
  for (const reading of ["human", "machine"]) {
    test(`the header keeps its height with the switch, ${reading}`, async ({ page }) => {
      for (const [width, want] of [[1440, 69], [1100, 69], [719, 53], [601, 53], [600, 53], [390, 53], [320, 53]]) {
        await page.setViewportSize({ width, height: 900 });
        await open(page, PAGES[reading].home);
        await ready(page);
        expect(await page.locator(".mx-header").evaluate((h) => h.getBoundingClientRect().height), `${width}px`).toBe(want);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no overflow at ${width}`).toBe(true);
      }
    });
  }

  test("tab order at 1440 is the prototype's", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, PAGES.human.home);
    await ready(page);
    const order = [];
    for (let i = 0; i < 11; i++) {
      await page.keyboard.press("Tab");
      order.push(await page.evaluate(() => (document.activeElement.closest("label") ?? document.activeElement).textContent.trim()));
    }
    expect(order).toEqual(["Skip to content", "fixture_", "Home", "Projects", "Blog", "About", "人間用", "機械用", "Hold rain", "Operator colours", "Daylight"]);
  });

  test("601px: still two strands", async ({ page }) => {
    await page.setViewportSize({ width: 601, height: 844 });
    await open(page, PAGES.human.home);
    await ready(page);
    expect(await page.locator(".mx-header a[data-to]").evaluateAll((as) => as.map((a) => a.tabIndex))).toEqual([0, 0]);
  });

  test("forced colours: the current side is Highlight on HighlightText", async ({ browser }) => {
    const ctx = await browser.newContext({ forcedColors: "active" });
    const page = await ctx.newPage();
    await open(page, PAGES.human.home);
    const c = await page.evaluate(() => {
      const probe = document.body.appendChild(document.createElement("i"));
      probe.style.cssText = "forced-color-adjust:none;background:Highlight;color:HighlightText";
      const want = [getComputedStyle(probe).backgroundColor, getComputedStyle(probe).color];
      const a = document.querySelector(".mx-header .mx-switch a[aria-current]");
      return { want, got: [getComputedStyle(a).backgroundColor, getComputedStyle(a).color], idle: getComputedStyle(document.querySelector(".mx-header a:not([aria-current]) .mx-switch-label")).backgroundImage };
    });
    expect(c.got).toEqual(c.want);
    expect(c.idle).toBe("none");
    await ctx.close();
  });

  for (const reading of ["human", "machine"]) {
    test(`the drop stops under Hold, ${reading}`, async ({ page }) => {
      await open(page, PAGES[reading].home);
      await ready(page);
      const drip = () => page.evaluate(() => document.getAnimations().filter((a) => a.animationName === "mx-drip").map((a) => a.playState));
      expect(await drip()).toContain("running");
      await page.locator('[data-action="hold"]').click();
      expect(new Set(await drip())).toEqual(new Set(["paused"]));
    });
  }

  test("the still: no drop, a caret on the compact button", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, `${PAGES.human.home}?motion=0`);
    expect(await running(page)).toBe(0);
    expect(await page.locator(".mx-header .mx-switch").evaluate((s) => getComputedStyle(s, "::after").content)).toContain("▾");
  });

  test("without scripts: two links to the static twins", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await open(page, PAGES.human.home);
    expect(await page.locator(".mx-header a[data-to]").evaluateAll((as) => as.map((a) => [a.getAttribute("href"), a.getAttribute("aria-current")]))).toEqual([
      ["/human-home.html", "true"],
      ["/home.html", null],
    ]);
    await page.locator('.mx-header a[data-to="machine"]').click();
    await page.waitForURL(`${ORIGIN}/home.html`);
    expect(await page.evaluate(() => document.documentElement.dataset.reading)).toBe("machine");
    await ctx.close();
  });
});

// ---------- 3.6 Readings ----------

test.describe("3.6 readings", () => {
  // Every way of switching in MATRIX-NOTES ("How to switch", and the landing's ways to 人間用).
  const WAYS = {
    "the header switch": (p) => p.locator(".mx-header a[data-to]:not([aria-current])").click(),
    "the shortcut \\": (p) => p.keyboard.press("Backslash"),
    "the shortcut ¥ (JIS)": (p) => p.evaluate(() => dispatchEvent(new KeyboardEvent("keydown", { key: "¥", bubbles: true, cancelable: true }))),
  };
  for (const [way, act] of Object.entries(WAYS)) {
    for (const [from, page_] of [["human", "home"], ["machine", "home"], ["human", "projects"], ["machine", "projects"]]) {
      test(`${way}, from ${from} ${page_}`, async ({ page }) => {
        const { errors } = await open(page, PAGES[from][page_]);
        await ready(page);
        const before = await texts(page);
        await act(page);
        await page.waitForTimeout(1900);
        const to = from === "human" ? "machine" : "human";
        await settled(page, page_, to, before);
        expect(errors).toEqual([]);
      });
    }
  }

  test("the capsule on 人間用 Home, from inside the reading: focus goes to the header switch", async ({ page }) => {
    await open(page, PAGES.human.home);
    await ready(page);
    await page.locator('.mx-switch[data-variant="capsule"] a[data-to="machine"]').click();
    await page.waitForTimeout(1900);
    expect(await settled(page, "home", "machine")).toMatchObject({ focus: "switch:machine" });
  });

  test("the way back inside 機械用 (guide and status line stand-in), focus to the header switch", async ({ page }) => {
    await open(page, PAGES.machine.projects);
    await ready(page);
    await page.locator('mx-readings > [data-reading="machine"] a[data-to="human"]').click();
    await page.waitForTimeout(1900);
    expect(await settled(page, "projects", "human")).toMatchObject({ focus: "switch:human" });
  });

  test("the shortcut with focus on a stream link hands focus to the switch", async ({ page }) => {
    await open(page, PAGES.human.projects);
    await ready(page);
    await page.locator(".mx-stream-name a").first().focus();
    await page.keyboard.press("Backslash");
    await page.waitForTimeout(1900);
    expect(await settled(page, "projects", "machine")).toMatchObject({ focus: "switch:machine" });
  });

  test("flags travel: palette and motion=0 are carried, theme is spent", async ({ page }) => {
    await open(page, `${PAGES.human.home}?palette=operator&theme=day`);
    await ready(page);
    await press(page);
    await page.waitForTimeout(1900);
    expect(new URL(page.url()).pathname + new URL(page.url()).search).toBe("/home.html?palette=operator");
    expect(await page.locator(".mx-nav a").first().getAttribute("href")).toBe(`${ORIGIN}/home.html?palette=operator`);
    await open(page, `${PAGES.human.home}?motion=0`);
    await ready(page);
    await press(page);
    expect(new URL(page.url()).search).toBe("?motion=0");
  });

  test("links that follow the reading: mark, nav and the after link", async ({ page }) => {
    await open(page, `${PAGES.human.home}?motion=0`);
    await ready(page);
    await press(page);
    expect(await page.evaluate(() => [document.querySelector(".mx-mark").getAttribute("href"), ...[...document.querySelectorAll(".mx-nav a")].slice(0, 2).map((a) => a.getAttribute("href"))])).toEqual([
      `${ORIGIN}/home.html?motion=0`,
      `${ORIGIN}/home.html?motion=0`,
      `${ORIGIN}/projects.html?motion=0`,
    ]);
  });

  // The prototype's six rapid-press patterns (extra.mjs, section 5; recorded in spikes/S3-motion.md):
  // one press from 人間用 to reach 機械用, then the six in sequence, 1900ms after each.
  test("the six rapid-press patterns", async ({ page }) => {
    test.setTimeout(60_000);
    const { errors, requests } = await open(page, PAGES.human.home);
    await ready(page);
    const before = await texts(page);
    const pressAll = async (gaps) => {
      for (const gap of gaps) {
        await press(page);
        if (gap) await page.waitForTimeout(gap);
      }
      await page.waitForTimeout(1900);
    };
    await pressAll([0]);
    await settled(page, "home", "machine", before);
    for (const [name, gaps, want] of [
      ["machine -> page -> machine, 50ms apart", [50, 0], "machine"],
      ["machine -> page -> machine -> page, 50ms apart", [50, 50, 0], "human"],
      ["page -> machine -> page, 50ms apart", [50, 0], "human"],
      ["page -> machine -> page -> machine, 300ms apart (mid-collapse, mid-print)", [300, 300, 0], "machine"],
      ["machine -> page -> machine -> page, 400ms apart (mid-decode)", [400, 400, 0], "human"],
      ["five presses 120ms apart", [120, 120, 120, 120, 0], "machine"],
    ]) {
      await pressAll(gaps);
      await test.step(name, () => settled(page, "home", want, before));
    }
    expect(errors).toEqual([]);
    expect(requests.filter((u) => !u.startsWith(ORIGIN))).toEqual([]);
  });

  for (const from of ["human", "machine"]) {
    test(`reduced motion switched on mid-change, from ${from}`, async ({ page }) => {
      await open(page, PAGES[from].home);
      await ready(page);
      const before = await texts(page);
      await press(page);
      await page.waitForTimeout(150);
      expect(await page.evaluate(() => !!document.querySelector("[aria-busy]"))).toBe(true);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForTimeout(50);
      await settled(page, "home", from === "human" ? "machine" : "human", before);
    });
  }

  test("reduced motion: an instant change", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, PAGES.human.home);
    await ready(page);
    await press(page);
    await settled(page, "home", "machine");
  });

  test("the shortcut's guards: modifiers, form fields, composition, an already-handled event", async ({ page }) => {
    await open(page, `${PAGES.human.home}?motion=0`);
    await ready(page);
    for (const k of ["Control+Backslash", "Meta+Backslash", "Alt+Backslash"]) await page.keyboard.press(k);
    await page.evaluate(() => {
      const k = (o) => dispatchEvent(new KeyboardEvent("keydown", { key: "\\", bubbles: true, cancelable: true, ...o }));
      k({ isComposing: true });
      const handled = new KeyboardEvent("keydown", { key: "\\", bubbles: true, cancelable: true });
      handled.preventDefault();
      dispatchEvent(handled);
      const field = document.body.appendChild(Object.assign(document.createElement("input"), { id: "probe" }));
      field.dispatchEvent(new KeyboardEvent("keydown", { key: "\\", bubbles: true, cancelable: true }));
      const edit = document.body.appendChild(Object.assign(document.createElement("div"), { contentEditable: "true" }));
      edit.dispatchEvent(new KeyboardEvent("keydown", { key: "\\", bubbles: true, cancelable: true }));
    });
    expect((await state(page)).reading).toBe("human");
    // Ctrl and Alt together are AltGr.
    await page.evaluate(() => dispatchEvent(new KeyboardEvent("keydown", { key: "\\", ctrlKey: true, altKey: true, bubbles: true, cancelable: true })));
    expect((await state(page)).reading).toBe("machine");
  });

  test("the off switch: in the footer and the menu, in both readings, stored", async ({ page }) => {
    await open(page, `${PAGES.human.home}?motion=0`);
    await ready(page);
    await expect(page.locator('.mx-footer [data-action="shortcut"]')).toBeVisible();
    await expect(page.locator('.mx-header [data-action="shortcut"]')).toBeHidden();
    expect(await page.locator(".mx-header a[data-to]").first().getAttribute("aria-keyshortcuts")).toBe("\\ ¥");
    await page.locator('.mx-footer [data-action="shortcut"] input').uncheck();
    expect(await page.locator('.mx-header [data-action="shortcut"] input').isChecked()).toBe(false);
    expect(await page.locator(".mx-header a[data-to]").first().getAttribute("aria-keyshortcuts")).toBeNull();
    await page.keyboard.press("Backslash");
    expect((await state(page)).reading).toBe("human");
    await page.locator(".mx-header a[data-to]:not([aria-current])").click();
    expect((await state(page)).reading).toBe("machine");
    // 機械用: in the footer, and in the menu once the live shell has taken the footer away (4.3).
    await expect(page.locator('.mx-footer [data-action="shortcut"]')).toBeVisible();
    await expect(page.locator('.mx-header [data-action="shortcut"]')).toBeHidden();
    await page.evaluate(() => (document.documentElement.dataset.shell = "live"));
    await expect(page.locator('.mx-header [data-action="shortcut"]')).toBeVisible();
    await page.evaluate(() => delete document.documentElement.dataset.shell);
    await page.reload();
    await ready(page);
    expect(await page.locator('.mx-header [data-action="shortcut"] input').isChecked()).toBe(false);
    await page.keyboard.press("Backslash");
    expect((await state(page)).reading).toBe("machine");
    await page.locator('.mx-footer [data-action="shortcut"] input').check();
    expect(await page.locator('.mx-header [data-action="shortcut"] input').isChecked()).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem("mx-shortcut"))).toBe("on");
    await page.locator("main").focus(); // the shortcut is ignored in a form field, the checkbox included
    await page.keyboard.press("Backslash");
    expect((await state(page)).reading).toBe("human");
  });

  test("the off switch at 390, in the menu of either reading", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, `${PAGES.human.home}?motion=0`);
    await ready(page);
    await page.locator(".mx-menu > summary").click();
    await expect(page.locator('.mx-header [data-action="shortcut"]')).toBeVisible();
    expect((await page.locator('.mx-header [data-action="shortcut"]').boundingBox()).height).toBeGreaterThanOrEqual(44);
  });

  test("without scripts, the off switch and its hint are absent", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await open(page, PAGES.human.home);
    await expect(page.locator('[data-action="shortcut"]')).toHaveCount(2);
    for (const el of await page.locator('[data-action="shortcut"]').all()) await expect(el).toBeHidden();
    await expect(page.locator(".mx-footer-row")).toBeHidden();
    await ctx.close();
  });

  test("storage that throws changes nothing visible", async ({ page }) => {
    await page.addInitScript(() => {
      for (const s of ["localStorage", "sessionStorage"]) Object.defineProperty(window, s, { get() { throw new DOMException("denied", "SecurityError"); } });
    });
    const { errors } = await open(page, PAGES.human.home, { boot: true });
    await ready(page);
    await page.keyboard.press("Escape");
    await press(page);
    await page.waitForTimeout(1900);
    await settled(page, "home", "machine");
    expect(errors).toEqual([]);
  });

  test("mx:reading carries the new value", async ({ page }) => {
    await open(page, `${PAGES.human.home}?motion=0`);
    await ready(page);
    const got = page.evaluate(() => new Promise((r) => addEventListener("mx:reading", (e) => r(e.detail), { once: true })));
    await press(page);
    expect(await got).toBe("machine");
  });

  for (const [reading, page_] of [["human", "home"], ["machine", "home"], ["human", "projects"], ["machine", "projects"]]) {
    test(`axe, ${reading} ${page_}`, async ({ page }) => {
      await open(page, `${PAGES[reading][page_]}?motion=0`);
      await ready(page);
      expect(await axe(page)).toEqual([]);
    });
  }
});

// ---------- 3.7 Boot and Curtain ----------

test.describe("3.7 boot", () => {
  const boot = (page) => page.evaluate(() => document.documentElement.dataset.boot ?? null);
  const until = (page) => page.waitForFunction(() => !document.documentElement.dataset.boot, null, { timeout: 12_000 });

  test("plays on the first visit, Skip is focused, it ends by itself before the failsafe", async ({ page }) => {
    const t0 = Date.now();
    await open(page, PAGES.machine.home, { boot: true });
    expect(await boot(page)).toBe("play");
    await expect(page.locator(".mx-boot-skip")).toBeFocused();
    await until(page);
    const ms = Date.now() - t0;
    console.log(`boot ended by itself after ${ms}ms`);
    expect(ms).toBeLessThan(parseInt(tokens["motion.boot.failsafe"]));
    await expect(page.locator("main")).toBeFocused();
    await page.waitForTimeout(1200); // the curtain lifts after the boot has ended
    expect(await state(page)).toMatchObject({ curtain: 0, reading: "machine" });
    // Once per tab.
    await page.reload();
    expect(await boot(page)).toBeNull();
  });

  for (const [way, act, reading] of [
    ["Skip", (p) => p.locator(".mx-boot-skip").click(), "machine"],
    ["Enter on Skip", (p) => p.keyboard.press("Enter"), "machine"],
    ["Escape", (p) => p.keyboard.press("Escape"), "machine"],
    ["a click on the layer", (p) => p.mouse.click(700, 60), "machine"],
    ["人間用 on its switch", (p) => p.locator('.mx-boot a[data-to="human"]').click(), "human"],
    ["機械用 on its switch", (p) => p.locator('.mx-boot a[data-to="machine"]').click(), "machine"],
  ]) {
    test(`skipped by ${way}`, async ({ page }) => {
      await open(page, `${PAGES.machine.home}?boot=1`, { boot: true });
      await ready(page);
      await page.waitForTimeout(600);
      await act(page);
      expect(await boot(page)).toBeNull();
      await page.waitForTimeout(100);
      expect(await state(page)).toMatchObject({ reading, curtain: 0, scripted: 0 });
      await expect(page.locator(".mx-boot")).toBeHidden();
      // On the boot layer neither side was current.
      expect(await page.locator('.mx-boot a[aria-current]').count()).toBe(0);
    });
  }

  test("the logo is wiped in by a cover; the image itself is never clipped or animated (L5)", async ({ page }) => {
    await open(page, `${PAGES.machine.home}?boot=1`, { boot: true });
    await ready(page);
    // Polled every frame from the start: any clip or animation on the image at any moment is recorded.
    const seen = await page.evaluate(() => new Promise((r) => {
      const img = document.querySelector(".mx-boot-logo .mx-logo");
      const out = { img: new Set(), covered: false };
      const tick = () => {
        if (getComputedStyle(img).clipPath !== "none") out.img.add("clip-path");
        if (getComputedStyle(img).transform !== "none") out.img.add("transform");
        for (const a of img.getAnimations()) out.img.add("animation");
        const c = document.querySelector(".mx-boot-cover");
        // Covered means the cover is what is on top at the image's middle, not only that it is unclipped.
        if (c.getAnimations().length && getComputedStyle(c).clipPath.startsWith("inset(0")) {
          const r = img.getBoundingClientRect();
          if (document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === c) out.covered = true;
        }
        if (document.documentElement.dataset.boot) requestAnimationFrame(tick);
        else r({ img: [...out.img], covered: out.covered });
      };
      tick();
    }));
    expect(seen).toEqual({ img: [], covered: true });
  });

  test("fails open with every other script blocked, no later than the failsafe", async ({ page }) => {
    const t0 = Date.now();
    await open(page, PAGES.human.home, { boot: true, block: ELEMENTS });
    expect(await boot(page)).toBe("play");
    await until(page);
    const ms = Date.now() - t0;
    console.log(`blocked scripts: boot ended after ${ms}ms`);
    expect(ms).toBeGreaterThan(7000);
    expect(ms).toBeLessThan(9500);
    await expect(page.locator("main")).toBeVisible();
  });

  test("blocked scripts: Escape still ends it", async ({ page }) => {
    await open(page, PAGES.human.home, { boot: true, block: ELEMENTS });
    await page.keyboard.press("Escape");
    expect(await boot(page)).toBeNull();
  });

  test("never with reduced motion, ?motion=0 or ?run=, never without scripts", async ({ browser }) => {
    for (const [opts, q] of [[{ reducedMotion: "reduce" }, ""], [{}, "?motion=0"], [{}, "?run=ls"], [{ javaScriptEnabled: false }, ""]]) {
      const ctx = await browser.newContext(opts);
      const page = await ctx.newPage();
      await open(page, PAGES.machine.home + q, { boot: true });
      expect(await boot(page), JSON.stringify([opts, q])).toBeNull();
      await expect(page.locator(".mx-boot")).toBeHidden();
      await ctx.close();
    }
  });

  test("reduced motion switched on mid-boot ends it at once", async ({ page }) => {
    await open(page, `${PAGES.machine.home}?boot=1`, { boot: true });
    await ready(page);
    await page.waitForTimeout(800);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(50);
    expect(await boot(page)).toBeNull();
    expect(await state(page)).toMatchObject({ curtain: 0, scripted: 0 });
  });

  test("the frozen still shows only settled text, with no script, and does not time out", async ({ page }) => {
    test.setTimeout(30_000);
    await open(page, `${PAGES.machine.home}?boot=frozen`, { boot: true, block: ELEMENTS });
    expect(await boot(page)).toBe("frozen");
    const lines = () => page.locator(".mx-boot-value").evaluateAll((vs) => vs.map((v) => [v.textContent, v.dataset.text, getComputedStyle(v.parentElement).visibility]));
    for (const [text, want, vis] of await lines()) expect([text, vis]).toEqual([want, "visible"]);
    await expect(page.locator(".mx-boot-logo .mx-logo")).toBeVisible();
    await page.waitForTimeout(8500);
    expect(await boot(page)).toBe("frozen");
  });

  test("with scripts the frozen still is settled too, and nothing moves", async ({ page }) => {
    await open(page, `${PAGES.machine.home}?boot=frozen`, { boot: true });
    await ready(page);
    await page.waitForTimeout(500);
    for (const [text, want] of await page.locator(".mx-boot-value").evaluateAll((vs) => vs.map((v) => [v.textContent, v.dataset.text]))) expect(text).toBe(want);
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && a.effect.target?.closest?.(".mx-boot")).length)).toBe(0);
  });
});

// ---------- the flash check (05): frame capture and luminance analysis ----------

/** Mean relative luminance of a JPEG frame, decoded in the page's own canvas. */
async function luminance(page, buffers) {
  return page.evaluate(async (frames) => {
    const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const out = [];
    for (const b64 of frames) {
      const img = await createImageBitmap(await (await fetch(`data:image/jpeg;base64,${b64}`)).blob());
      const c = new OffscreenCanvas(img.width / 4, img.height / 4);
      const x = c.getContext("2d");
      x.drawImage(img, 0, 0, c.width, c.height);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      let sum = 0;
      for (let i = 0; i < d.length; i += 4) sum += 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
      out.push(sum / (d.length / 4));
    }
    return out;
  }, buffers.map((b) => b.toString("base64")));
}
/** WCAG 2.3.1: a flash is a pair of opposing changes of at least 0.1 in relative luminance. Most in any one second. */
function flashesPerSecond(samples) {
  const turns = [];
  let ref = samples[0], dir = 0;
  for (const s of samples) {
    const delta = s.l - ref.l;
    if (Math.abs(delta) >= 0.1 && Math.sign(delta) !== dir) {
      turns.push(s.t);
      dir = Math.sign(delta);
      ref = s;
    } else if (Math.sign(delta) === dir && Math.abs(delta) > 0) ref = s;
  }
  let most = 0;
  for (const t of turns) most = Math.max(most, turns.filter((u) => u >= t && u < t + 1000).length);
  return Math.floor(most / 2);
}
async function film(page, ms) {
  const frames = [];
  const t0 = Date.now();
  while (Date.now() - t0 < ms) frames.push({ t: Date.now() - t0, b: await page.screenshot({ type: "jpeg", quality: 60 }) });
  const l = await luminance(page, frames.map((f) => f.b));
  return frames.map((f, i) => ({ t: f.t, l: l[i] }));
}

for (const theme of ["night", "day"]) {
  test(`flash check: the boot and the reading change, ${theme}, full window`, async ({ page }) => {
    test.setTimeout(60_000);
    const q = theme === "day" ? "&theme=day" : "";
    await open(page, `${PAGES.machine.home}?boot=1${q}`, { boot: true });
    const boot = await film(page, 7000);
    await page.waitForFunction(() => !document.documentElement.dataset.boot);
    await press(page);
    const change = await film(page, 1600);
    await press(page);
    const back = await film(page, 1600);
    for (const [name, s] of [["boot", boot], ["into 機械用", change], ["back to 人間用", back]]) {
      const n = flashesPerSecond(s);
      console.log(`flash check ${theme} ${name}: ${s.length} frames, luminance ${Math.min(...s.map((x) => x.l)).toFixed(3)}–${Math.max(...s.map((x) => x.l)).toFixed(3)}, most flashes in one second ${n}`);
      expect(n).toBeLessThanOrEqual(3);
    }
  });
}

test("flash check self-test: a page alternating light and dark is caught", async ({ page }) => {
  await page.setContent(`<body style="margin:0;height:100vh"><script>let on=0;setInterval(()=>document.body.style.background=(on^=1)?'#fff':'#000',100)</script>`);
  expect(flashesPerSecond(await film(page, 1500))).toBeGreaterThan(3);
});

// ---------- 3.8 Decode and the three rewards ----------

test.describe("3.8 rewards", () => {
  const visitTwice = async (page) => {
    const s = page.locator(".mx-stream").first();
    await s.hover();
    await page.mouse.move(0, 0);
    await s.hover();
    return s;
  };

  test("déjà vu: the second visit repeats the line once, and leaves nothing", async ({ page }) => {
    await open(page, PAGES.human.projects);
    await ready(page);
    const s = await visitTwice(page);
    expect(await s.getAttribute("data-reward")).toBe("deja");
    expect(await s.locator(".mx-stream-name").evaluate((h) => getComputedStyle(h, "::after").content)).toContain("fixture-one");
    await page.waitForTimeout(700);
    expect(await s.getAttribute("data-reward")).toBeNull();
  });

  test("title to commit: once, after 2s on screen, then nothing left behind", async ({ page }) => {
    await open(page, PAGES.human.projects);
    await ready(page);
    const s = page.locator(".mx-stream[data-commit]").first();
    await page.waitForTimeout(2600);
    await expect(s.locator(".mx-ghost")).toHaveCount(1);
    expect(await s.locator(".mx-ghost").getAttribute("aria-hidden")).toBe("true");
    await page.waitForTimeout(1800);
    await expect(page.locator(".mx-ghost")).toHaveCount(0);
    expect(await page.locator(".mx-stream[data-reward]").count()).toBe(0);
    expect(await s.locator(".mx-stream-name a").textContent()).toBe("fixture-one");
  });

  test("the name doubles once on the way back to 人間用, then is clean", async ({ page }) => {
    await open(page, PAGES.machine.home);
    await ready(page);
    const seen = page.evaluate(() => new Promise((r) => new MutationObserver((_, o) => document.querySelector(".mx-name[data-double]") && (o.disconnect(), r(true))).observe(document.querySelector(".mx-name"), { attributes: true })));
    await press(page);
    expect(await seen).toBe(true);
    await page.waitForTimeout(1900);
    expect((await state(page)).doubled).toBe(0);
  });

  // Hold checked on the way back to 人間用, while the headings decode and then while the name doubles.
  for (const at of ["decode", "double"]) {
    test(`held mid-${at}: it stops at once, nothing left running`, async ({ page }) => {
      await open(page, PAGES.machine.home);
      await ready(page);
      const H = 'mx-readings > [data-reading="human"] :is(h2, .mx-stream-name a)';
      const final = await page.evaluate((H) => [...document.querySelectorAll(H)].map((e) => e.textContent), H);
      await press(page);
      await page.waitForFunction(([H, final, at]) => at === "double"
        ? document.querySelector(".mx-name[data-double]")
        : [...document.querySelectorAll(H)].some((e, i) => e.textContent !== final[i]), [H, final, at], { timeout: 3000, polling: "raf" });
      // Checked and read in one task: "at once" is before any further frame.
      const now = await page.evaluate((H) => {
        document.querySelector('[data-action="hold"] input').click();
        return {
          texts: [...document.querySelectorAll(H)].map((e) => e.textContent),
          doubled: document.querySelectorAll(".mx-name[data-double]").length,
        };
      }, H);
      expect(now).toEqual({ texts: final, doubled: 0 });
      // Nothing restarts: no heading changes and no doubling after Hold, and the change still ends.
      await page.evaluate((H) => {
        const seen = (window.__mx = []);
        const m = new MutationObserver((r) => seen.push(...r.map((x) => x.attributeName ?? x.target.textContent)));
        for (const el of document.querySelectorAll(H)) m.observe(el, { childList: true, characterData: true, subtree: true });
        m.observe(document.querySelector(".mx-name"), { attributes: true, attributeFilter: ["data-double"] });
      }, H);
      await page.waitForTimeout(1200);
      expect(await page.evaluate(() => window.__mx)).toEqual([]);
      expect(await state(page)).toMatchObject({ reading: "human", busy: 0, scripted: 0, doubled: 0, styled: 0 });
    });
  }

  test("decode: the side just taken settles out of corpus glyphs, then reads its name", async ({ page }) => {
    await open(page, PAGES.human.home);
    await ready(page);
    const pools = await page.evaluate(() => document.querySelector("mx-root").dataset.wide + document.querySelector("mx-root").dataset.narrow);
    await press(page);
    const mid = await page.waitForFunction(() => {
      const t = document.querySelector('.mx-header a[data-to="machine"] .mx-switch-label').textContent;
      return t !== "機械用" && t;
    }, null, { timeout: 3000 });
    for (const c of Array.from(await mid.jsonValue())) expect(pools + "機械用").toContain(c);
    await page.waitForTimeout(1900);
    expect(await page.locator('.mx-header a[data-to="machine"] .mx-switch-label').textContent()).toBe("機械用");
  });

  for (const [why, q, setup] of [
    ["reduced motion", "?motion=0", async () => {}],
    ["rain held", "", (p) => p.locator('[data-action="hold"] input').check()],
  ]) {
    test(`all off with ${why}`, async ({ page }) => {
      await open(page, PAGES.human.projects + q);
      await ready(page);
      await setup(page);
      const s = await visitTwice(page);
      expect(await s.getAttribute("data-reward")).toBeNull();
      await page.waitForTimeout(2600);
      await expect(page.locator(".mx-ghost")).toHaveCount(0);
      // Any frame of Decode or of the doubling counts, not only what is left once they would have ended.
      const watch = (sel, o) => page.evaluate(([sel, o]) => {
        const seen = (window.__mx ??= []);
        const m = new MutationObserver((r) => seen.push(...r.map((x) => x.attributeName ?? x.target.textContent)));
        for (const el of document.querySelectorAll(sel)) m.observe(el, o);
      }, [sel, o]);
      await watch(".mx-header .mx-switch-label", { childList: true, characterData: true, subtree: true });
      await watch(".mx-name", { attributes: true, attributeFilter: ["data-double"] });
      await page.locator('.mx-header a[data-to="machine"]').click();
      await page.waitForTimeout(q ? 50 : 1900);
      // The way back is where the headings settle; the way out dissolves them into hex, which stays.
      await watch('mx-readings > [data-reading="human"] :is(h2, .mx-stream-name a)', { childList: true, characterData: true, subtree: true });
      await page.locator('.mx-header a[data-to="human"]').click();
      await page.waitForTimeout(q ? 50 : 1900);
      expect(await page.evaluate(() => window.__mx)).toEqual([]);
      expect((await state(page)).doubled).toBe(0);
    });
  }

  test("held mid-flicker: the ghost goes at once", async ({ page }) => {
    await open(page, PAGES.human.projects);
    await ready(page);
    await page.waitForTimeout(2500);
    await expect(page.locator(".mx-ghost")).toHaveCount(1);
    await page.locator('[data-action="hold"] input').check();
    await expect(page.locator(".mx-ghost")).toHaveCount(0);
    expect(await page.locator(".mx-stream[data-reward]").count()).toBe(0);
  });
});

// ---------- 3.9 Scan lines ----------

test.describe("3.9 scan lines", () => {
  test("in 機械用 only, under the status line; logo and filled controls lifted", async ({ page }) => {
    await open(page, `${PAGES.machine.home}?palette=operator`);
    await ready(page);
    const m = await page.evaluate(() => {
      const a = getComputedStyle(document.body, "::after");
      const z = (s) => getComputedStyle(document.querySelector(s)).zIndex;
      return { content: a.content, position: a.position, z: a.zIndex, events: a.pointerEvents, bg: a.backgroundImage, logo: z(".mx-header .mx-logo"), sw: z(".mx-header .mx-switch"), pressed: z('[data-action="palette"]') };
    });
    expect(m).toMatchObject({ content: '""', position: "fixed", z: tokens["layer.scanline"], events: "none", logo: tokens["layer.lifted"], sw: tokens["layer.lifted"], pressed: tokens["layer.lifted"] });
    expect(m.bg).toContain("repeating-linear-gradient");
    expect(Number(tokens["layer.scanline"])).toBeLessThan(Number(tokens["layer.status"]));
    expect(Number(tokens["layer.scanline"])).toBeLessThan(Number(tokens["layer.lifted"]));
    await page.locator(".mx-header a[data-to=human]").click();
    await page.waitForTimeout(1900);
    expect(await page.evaluate(() => getComputedStyle(document.body, "::after").content)).toBe("none");
  });
});
