// The page-wide rows of the verification matrix (05, "Where each row runs") on every specimen in the
// set, from the one list (tests/support/specimens.mjs). Runs in Chromium with `npm run test:specimens`,
// and in Playwright's Firefox and WebKit builds with `npm run test:engines`; a row an engine cannot run
// is skipped there by a line that says why.
import { expect, test } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ORIGIN, axe, root, serve } from "./support/serve.mjs";
import { CONTEXTS, DIRS, SPECIMENS, holdMoved, path } from "./support/specimens.mjs";
import { ratio } from "../scripts/gates.mjs";

const tokens = JSON.parse(readFileSync(join(root, "dist/tokens.json"), "utf8"));
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
const hex = (c) => `#${c.match(/[\d.]+/g).slice(0, 3).map((n) => Math.round(Number(n)).toString(16).padStart(2, "0")).join("")}`;
const WIDTHS = [320, 360, 390, 601, 719, 720, 1100, 1360, 1440];
const SIZES = [[1440, 900], [390, 844]];

/** Routes the page to the build; Moved without its redirect (holdMoved). */
async function prepare(page, s) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const requests = await serve(page, DIRS);
  if (s.page === "moved") await holdMoved(page, root);
  // The boot is marked seen; the budgets test it.
  await page.addInitScript(() => { try { sessionStorage.setItem("mx-boot", "1"); } catch {} });
  return { errors, requests };
}
/** Opens the specimen and waits until its elements are defined and, in 機械用, the shell is live. */
async function go(page, s, query = "") {
  await page.goto(`${ORIGIN}${path(s.page)}${query && `?${query}`}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.querySelectorAll("*")].every((e) => !e.localName.startsWith("mx-") || customElements.get(e.localName)));
  if (s.reading === "machine") await page.waitForFunction(() => document.documentElement.dataset.shell === "live");
}
/** A page without scripts, and its DOM with the scripts removed for axe, which needs timers. */
async function withoutScripts(browser, s, viewport) {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport });
  const page = await ctx.newPage();
  const { errors, requests } = await prepare(page, s);
  await page.goto(`${ORIGIN}${path(s.page)}`);
  return { ctx, page, errors, requests };
}
/** The context as root attributes too: what the flag sets, and Moved, which reads no flags, gets it this way. */
const scope = (page, context) => page.evaluate(([p, t]) => Object.assign(document.documentElement.dataset, { palette: p, theme: t }), context.split("-"));
const running = (page, endless) =>
  page.evaluate((endless) => document.getAnimations().filter((a) => a.playState === "running" && (!endless || a.effect.getComputedTiming().iterations === Infinity)).map((a) => a.animationName ?? a.constructor.name), endless);

for (const s of SPECIMENS) {
  test.describe(`${s.name} (${s.page})`, () => {
    test("no horizontal overflow at nine widths; nothing from another origin; no page error", async ({ page }) => {
      const { errors, requests } = await prepare(page, s);
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await go(page, s);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px`).toBe(true);
      }
      expect(requests.filter((u) => !u.startsWith(ORIGIN))).toEqual([]);
      expect(errors).toEqual([]);
    });

    for (const [width, height] of SIZES) {
      test(`axe at ${width}, with and without scripts`, async ({ page, browser }) => {
        await page.setViewportSize({ width, height });
        await prepare(page, s);
        await go(page, s);
        expect(await axe(page), "with scripts").toEqual([]);
        const off = await withoutScripts(browser, s, { width, height });
        const html = (await off.page.content()).replace(/<script\b[\s\S]*?<\/script>/g, "");
        await off.ctx.close();
        const audit = await browser.newPage({ viewport: { width, height } });
        await serve(audit, DIRS);
        await audit.route(`${ORIGIN}/__nojs.html`, (r) => r.fulfill({ contentType: "text/html", body: html }));
        await audit.goto(`${ORIGIN}/__nojs.html`);
        expect(await axe(audit), "without scripts").toEqual([]);
        await audit.close();
      });
    }

    for (const [context, q] of Object.entries(CONTEXTS)) {
      test(`rendered contrast of its text in ${context}`, async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await prepare(page, s);
        await go(page, s, ["motion=0", q].filter(Boolean).join("&"));
        await scope(page, context);
        // Every visible run of text that is not decoration, against the first painted surface under it.
        const pairs = await page.evaluate(() => {
          const painted = (c) => c !== "transparent" && !/rgba\(.*, 0\)$/.test(c);
          const bg = (el) => {
            for (let e = el; e; e = e.parentElement) if (painted(getComputedStyle(e).backgroundColor)) return getComputedStyle(e).backgroundColor;
            return getComputedStyle(document.documentElement).backgroundColor;
          };
          const out = [];
          const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let n = walk.nextNode(); n; n = walk.nextNode()) {
            const e = n.parentElement;
            if (!n.textContent.trim() || e.closest('[aria-hidden="true"], .mx-vh, script, style, template')) continue;
            if (!e.checkVisibility({ visibilityProperty: true, opacityProperty: true }) || !e.getClientRects().length) continue;
            const c = getComputedStyle(e).color;
            if (!painted(c)) continue;
            out.push([c, bg(e), `${e.localName}.${[...e.classList].join(".")} "${n.textContent.trim().slice(0, 24)}"`]);
          }
          return out;
        });
        const low = pairs.filter(([fg, b]) => ratio(hex(fg), hex(b)) < 4.5).map(([fg, b, what]) => `${what}: ${fg} on ${b} = ${ratio(hex(fg), hex(b)).toFixed(2)}`);
        console.log(`${s.page} ${context}: ${pairs.length} runs of text, ${low.length} under 4.5:1`);
        expect(pairs.length).toBeGreaterThan(0);
        expect(low).toEqual([]);
      });
    }

    for (const [width, height] of SIZES) {
      test(`keyboard at ${width}: Tab reaches each focusable thing once, in document order, and each shows its indicator`, async ({ page, browserName }) => {
        // WebKit's Tab skips links unless the reader turns on "Press Tab to highlight each item"; Option+Tab is that order.
        const TAB = browserName === "webkit" ? "Alt+Tab" : "Tab";
        await page.setViewportSize({ width, height });
        await prepare(page, s);
        await go(page, s);
        const n = await page.evaluate(() => {
          const tabbable = [...document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, summary, [tabindex]")].filter(
            (e) => e.tabIndex >= 0 && !e.disabled && !e.closest("[inert]") && e.checkVisibility({ visibilityProperty: true }) && (e.localName !== "summary" || e.parentElement.querySelector(":scope > summary") === e),
          );
          tabbable.forEach((e, i) => (e.dataset.mxTab = i));
          // Tab from a mark before everything else, so no engine's way of wrapping round decides the start.
          const start = Object.assign(document.createElement("span"), { tabIndex: -1 });
          document.body.prepend(start);
          start.focus();
          return tabbable.length;
        });
        const seen = [];
        for (let i = 0; i < n + 4 && seen.length < n + 1; i++) {
          await page.keyboard.press(TAB);
          const f = await page.evaluate(() => {
            const e = document.activeElement;
            if (!e || e === document.body) return null;
            const ring = (x) => { const c = getComputedStyle(x); return c.outlineStyle !== "none" && parseFloat(c.outlineWidth) > 0; };
            // 05, "Focus": a ring on the thing, or the documented replacement: the stream or the Hold label
            // outlined around it, or the command field's lit block cursor.
            let shown = ring(e) || getComputedStyle(e).boxShadow !== "none";
            for (let a = e.parentElement, k = 0; !shown && a && k < 4; a = a.parentElement, k++) shown = a.matches(":focus-within") && ring(a);
            const cursor = e.closest(".mx-prompt")?.querySelector(".mx-prompt-cursor");
            if (!shown && cursor) shown = getComputedStyle(cursor).backgroundColor !== "rgba(0, 0, 0, 0)";
            // Firefox also stops on a scroller that overflows (the chips' row at 390): the engine's own stop, not the page's.
            const c = getComputedStyle(e);
            const scroller = e.dataset.mxTab === undefined && /auto|scroll/.test(c.overflowX + c.overflowY) && (e.scrollWidth > e.clientWidth || e.scrollHeight > e.clientHeight);
            return { scroller, i: e.dataset.mxTab === undefined ? -1 : Number(e.dataset.mxTab), what: `${e.localName}.${[...e.classList].join(".")} "${(e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 24)}"`, shown };
          });
          if (f?.scroller) console.log(`${browserName}, ${s.page} at ${width}: a tab stop on the scroller ${f.what}`);
          else if (f) seen.push(f);
        }
        const cycle = seen.slice(0, n);
        expect(cycle.map((f) => f.i), cycle.map((f) => f.what).join(" → ")).toEqual([...Array(n).keys()]);
        expect(cycle.filter((f) => !f.shown).map((f) => f.what), "no indicator").toEqual([]);
      });
    }

    test("without JavaScript: the page is there, nothing errs, and the only buttons are commands in the recorded session", async ({ browser }) => {
      const off = await withoutScripts(browser, s, { width: 1440, height: 900 });
      const p = await off.page.evaluate(() => ({
        text: document.querySelector("main")?.innerText.trim().length ?? 0,
        buttons: [...document.querySelectorAll("button")].filter((b) => b.checkVisibility({ visibilityProperty: true }) && !b.matches(".mx-run")).map((b) => b.outerHTML.slice(0, 80)),
        defined: [...document.querySelectorAll("*")].filter((e) => e.localName.startsWith("mx-") && customElements.get(e.localName)).length,
      }));
      expect(p.text).toBeGreaterThan(0);
      expect(p.buttons).toEqual([]);
      expect(p.defined).toBe(0);
      expect(off.errors).toEqual([]);
      expect(off.requests.filter((u) => !u.startsWith(ORIGIN))).toEqual([]);
      await off.ctx.close();
    });

    test("reduced motion: no running animation", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      await prepare(page, s);
      await go(page, s);
      await page.waitForTimeout(300);
      expect(await running(page, false)).toEqual([]);
      await ctx.close();
    });

    test("Hold: no running endless animation", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await prepare(page, s);
      await go(page, s);
      const hold = page.locator('[data-action="hold"]');
      // A page without the control has nothing endless to hold: that is checked instead.
      if (await hold.count()) {
        await hold.first().click();
        await expect(page.locator("html")).toHaveAttribute("data-rain", "held");
      }
      await page.waitForTimeout(300);
      expect(await running(page, true)).toEqual([]);
    });

    test("forced colours: it renders, no rain is drawn, and each region keeps its border", async ({ browser, browserName }, info) => {
      for (const [width, height] of SIZES) {
        const ctx = await browser.newContext({ forcedColors: "active", viewport: { width, height } });
        const page = await ctx.newPage();
        const { errors } = await prepare(page, s);
        await go(page, s, "motion=0");
        test.skip(!(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)), `${browserName} does not emulate forced-colors`);
        const f = await page.evaluate(() => ({
          rain: [...document.querySelectorAll(".mx-rain")].filter((r) => r.checkVisibility()).length,
          main: document.querySelector("main")?.checkVisibility() ?? false,
          panels: [...document.querySelectorAll(".mx-panel, .mx-notice main")].filter((e) => getComputedStyle(e).borderTopStyle === "none").length,
        }));
        expect(f).toEqual({ rain: 0, main: true, panels: 0 });
        expect(errors).toEqual([]);
        // The stills 05 asks for, looked at by hand: written only on request (MX_STILLS=1), in Chromium.
        if (process.env.MX_STILLS && browserName === "chromium") {
          mkdirSync(join(root, "docs/verification/1.0/forced-colours"), { recursive: true });
          await page.screenshot({ path: join(root, `docs/verification/1.0/forced-colours/${s.page}-${width}.png`), fullPage: true, animations: "disabled" });
        }
        await ctx.close();
      }
    });

    for (const [context, q] of Object.entries(CONTEXTS)) {
      test(`print in ${context}: no rain, no scan lines, no chrome, the day ink, no painted surface`, async ({ page, browserName }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await prepare(page, s);
        await go(page, s, ["motion=0", q].filter(Boolean).join("&"));
        await scope(page, context);
        await page.emulateMedia({ media: "print" });
        const palette = context.split("-")[0];
        const p = await page.evaluate(() => ({
          // 05, "Print": the rain layer and the scan lines; the chrome it lists.
          shown: [...document.querySelectorAll(".mx-rain, .mx-scanlines, .mx-skip, .mx-header, .mx-footer, .mx-status, .mx-toc, .mx-postfoot, .mx-copy")].filter((e) => e.checkVisibility()).map((e) => e.className),
          ink: getComputedStyle(document.body).color,
          html: getComputedStyle(document.documentElement).backgroundColor,
          body: getComputedStyle(document.body).backgroundColor,
          surfaces: [...document.querySelectorAll(".mx-panel, .mx-prose, main")].map((e) => getComputedStyle(e).backgroundColor).filter((c) => c !== "rgba(0, 0, 0, 0)"),
        }));
        expect(p).toEqual({ shown: [], ink: rgb(tokens[`${palette}-day`]["color.text"]), html: "rgba(0, 0, 0, 0)", body: "rgba(0, 0, 0, 0)", surfaces: [] });
        if (s.page === "article-c" && context === "phosphor-night" && browserName === "chromium") {
          // The one PDF of 05 ("The manual rows"): Chromium's, kept as a CI artefact and read by hand.
          mkdirSync(join(root, "test-results/1.0"), { recursive: true });
          await page.pdf({ path: join(root, "test-results/1.0/article-c.pdf") });
        }
      });
    }

    test("targets: every control is at least 24px or spaced as 2.5.8 allows, and the primary controls 44px at 390", async ({ page }) => {
      await prepare(page, s);
      for (const [width, height] of SIZES) {
        await page.setViewportSize({ width, height });
        await go(page, s);
        const { small, spaced } = await page.evaluate((width) => {
          // 05, "Targets": a link inside a line of text, or a command inside a line of output, is covered by the inline exception.
          const inline = (e) => (getComputedStyle(e).display === "inline" || e.matches(".mx-run")) && e.parentElement.textContent.trim().length > e.textContent.trim().length;
          const primary = ".mx-menu > summary, .mx-switch[data-variant='compact'] a, .mx-guide button, .mx-header .mx-nav a, .mx-controls .mx-control, .mx-login > summary";
          const name = (e) => `${e.localName}.${[...e.classList].join(".")} "${e.textContent.trim().slice(0, 20)}"`;
          const targets = [...document.querySelectorAll("a[href], button, summary, input, select, textarea")]
            .filter((e) => e.checkVisibility({ visibilityProperty: true }) && !e.closest('[aria-hidden="true"]') && !(e.matches("input[type=checkbox]") && e.closest("label")) && !inline(e))
            .map((e) => ({ e, r: (e.matches("input[type=checkbox], input[type=radio]") ? e.closest("label") ?? e : e).getBoundingClientRect() }));
          const small = [], spaced = [];
          for (const t of targets) {
            if (width <= 600 && t.e.matches(primary) && (t.r.width < 44 || t.r.height < 44)) small.push(`${name(t.e)} ${t.r.width.toFixed(1)}×${t.r.height.toFixed(1)} < 44`);
            if (t.r.width >= 24 && t.r.height >= 24) continue;
            // 2.5.8's spacing exception: a 24px circle on the target's centre meets no other target, nor the
            // circle of another undersized one.
            const c = [t.r.x + t.r.width / 2, t.r.y + t.r.height / 2];
            const clash = targets.some((u) => {
              if (u === t || u.e.contains(t.e) || t.e.contains(u.e)) return false;
              if (u.r.width < 24 || u.r.height < 24) return Math.hypot(u.r.x + u.r.width / 2 - c[0], u.r.y + u.r.height / 2 - c[1]) < 24;
              const dx = Math.max(u.r.left - c[0], 0, c[0] - u.r.right), dy = Math.max(u.r.top - c[1], 0, c[1] - u.r.bottom);
              return Math.hypot(dx, dy) < 12;
            });
            (clash ? small : spaced).push(`${name(t.e)} ${t.r.width.toFixed(1)}×${t.r.height.toFixed(1)}`);
          }
          return { small, spaced };
        }, width);
        if (spaced.length) console.log(`${s.page} at ${width}: under 24px, passing by 2.5.8's spacing: ${spaced.join("; ")}`);
        expect(small, `${width}px`).toEqual([]);
      }
    });

    test("200% text (emulated, evidence only): with the root's font size doubled at 1280, nothing is cut off and nothing scrolls sideways", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await prepare(page, s);
      await go(page, s, "motion=0");
      await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
      await page.waitForTimeout(100);
      const r = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth <= innerWidth,
        cut: [...document.querySelectorAll("body *")]
          .filter((e) => e.checkVisibility() && e.clientWidth > 1 && !e.closest('[aria-hidden="true"], .mx-vh') && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
          .filter((e) => { const c = getComputedStyle(e); return /hidden|clip/.test(c.overflowX + c.overflowY) && c.textOverflow !== "ellipsis" && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1); })
          .map((e) => `${e.localName}.${[...e.classList].join(".")}`),
      }));
      expect(r).toEqual({ overflow: true, cut: [] });
    });

    test("a still at 1440 and 390 for Playwright's other engines (05: looked at, not compared)", async ({ page, browserName }) => {
      test.skip(browserName === "chromium", "Chromium's pixels are the visual baselines (tests/visual)");
      await prepare(page, s);
      for (const [width, height] of SIZES) {
        await page.setViewportSize({ width, height });
        await go(page, s, "motion=0");
        await page.screenshot({ path: join(root, `test-results/engines/${browserName}/${s.page}-${width}.png`), fullPage: true, animations: "disabled" });
      }
    });
  });
}
