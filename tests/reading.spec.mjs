// Phase 5, Reading (09, tasks 5.1–5.4), on the Article specimens A, B and C and the Blog index, and the
// automated rows of the verification matrix (05) on them. Needs `npm run build`; `npm run test:specimens`
// builds the pages with Astro first.
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ORIGIN, axe, root, serve } from "./support/serve.mjs";
import { ratio } from "../scripts/gates.mjs";

const DIRS = { "/assets/": "assets", "/": "dist-specimens" };
const tokens = JSON.parse(readFileSync(join(root, "dist/tokens.json"), "utf8"));
const ARTICLES = { a: "/article-a.html", b: "/article-b.html", c: "/article-c.html" };
const CONTEXTS = { "phosphor-night": "", "phosphor-day": "theme=day", "operator-night": "palette=operator", "operator-day": "palette=operator&theme=day" };
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
const ELEMENTS = (url) => url.pathname.startsWith("/_astro/") && url.pathname.endsWith(".js");

async function open(page, path, { block } = {}) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const requests = await serve(page, DIRS, { block });
  await page.goto(ORIGIN + path);
  await page.evaluate(() => document.fonts.ready);
  return { errors, requests };
}
const defined = (page) => page.waitForFunction(() => ["mx-toc", "mx-copy", "mx-share", "mx-root"].every((n) => customElements.get(n)));
const nojs = async (browser, opts = {}) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, ...opts });
  return [ctx, await ctx.newPage()];
};

// ---------- 5.1 Masthead, Contents, Post foot, Share, Index ----------

test.describe("5.1 masthead, contents, post foot, share, index", () => {
  for (const [width, rail] of [[1440, true], [1100, true], [1099, false], [720, false], [390, false]]) {
    test(`contents at ${width}: ${rail ? "a sticky rail, always open, beside the body" : "a closed disclosure above the body"}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page, ARTICLES.a);
      await defined(page);
      const t = await page.evaluate(() => {
        const toc = document.querySelector(".mx-toc"), prose = document.querySelector(".mx-prose");
        const a = toc.getBoundingClientRect(), b = prose.getBoundingClientRect();
        return {
          position: getComputedStyle(toc).position,
          width: Math.round(a.width),
          open: toc.querySelector("details").open,
          summary: getComputedStyle(toc.querySelector("summary")).display,
          linkShown: toc.querySelector("nav a").checkVisibility(),
          beside: a.right <= b.left && Math.abs(a.top - b.top) < 1,
          label: getComputedStyle(toc.querySelector("nav"), "::before").content,
        };
      });
      if (rail) expect(t).toMatchObject({ position: "sticky", width: Number(tokens["phosphor-night"]["size.rail"].replace("px", "")), open: true, summary: "none", linkShown: true, beside: true, label: '"目次" / ""' });
      else expect(t).toMatchObject({ position: "static", open: false, summary: "flex", linkShown: false, beside: false });
    });
  }

  test("the rail stays in view while the body scrolls", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, ARTICLES.a);
    await page.evaluate(() => scrollTo(0, 3000));
    const top = await page.locator(".mx-toc").evaluate((t) => t.getBoundingClientRect().top);
    expect(top).toBe(20);
  });

  test("the section being read is marked, once, with aria-current=location, as the page scrolls", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, ARTICLES.a);
    await defined(page);
    const current = () => page.evaluate(() => [...document.querySelectorAll('.mx-toc a[aria-current="location"]')].map((a) => a.hash));
    expect(await current()).toEqual([]);
    for (const id of ["#setup", "#way-2", "#settings-one", "#summary"]) {
      await page.evaluate((id) => document.querySelector(id).scrollIntoView(), id);
      await expect.poll(current).toEqual([id]);
      const look = await page.locator(`.mx-toc a[href="${id}"]`).evaluate((a) => [getComputedStyle(a).color, getComputedStyle(a).borderLeftColor]);
      expect(look).toEqual([rgb(tokens["phosphor-night"]["color.text-lead"]), rgb(tokens["phosphor-night"]["color.accent"])]);
    }
  });

  test("below 1100px, choosing a section closes the disclosure and goes there; the keyboard path is Tab, Enter", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, ARTICLES.a);
    await defined(page);
    const summary = page.locator(".mx-toc-summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    expect(await page.locator(".mx-toc details").evaluate((d) => d.open)).toBe(true);
    await page.keyboard.press("Tab");
    await expect(page.locator(".mx-toc nav a").first()).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#what");
    expect(await page.locator(".mx-toc details").evaluate((d) => d.open)).toBe(false);
    expect(await page.locator("#what").evaluate((h) => Math.round(h.getBoundingClientRect().top))).toBe(20);
  });

  test("without scripts: the disclosure and its links work; no mark, no Copy, no Copy link, no sheet", async ({ browser }) => {
    const [ctx, page] = await nojs(browser, { viewport: { width: 390, height: 844 } });
    await open(page, ARTICLES.a);
    await page.locator(".mx-toc-summary").click();
    await page.locator('.mx-toc a[href="#what"]').click();
    expect(await page.evaluate(() => location.hash)).toBe("#what");
    expect(await page.locator(".mx-toc [aria-current]").count()).toBe(0);
    for (const sel of [".mx-copy", 'button[data-share="link"]', 'button[data-share="sheet"]']) await expect(page.locator(sel).first()).toBeHidden();
    await expect(page.locator(".mx-share a.mx-control")).toBeVisible();
    await ctx.close();
  });

  test("an engine without ::details-content gets the disclosure from 1100px, and the element opens it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await serve(page, DIRS);
    // The rule the engine would not have: dropped from the stylesheet before the page sees it.
    await page.route(/\/_astro\/.*\.css$/, async (r) => {
      const file = join(root, "dist-specimens", new URL(r.request().url()).pathname);
      const body = readFileSync(file, "utf8").replaceAll("selector(::details-content)", "selector(::not-a-thing)");
      return r.fulfill({ body, contentType: "text/css" });
    });
    await page.goto(ORIGIN + ARTICLES.a);
    await defined(page);
    expect(await page.locator(".mx-toc details").evaluate((d) => d.open)).toBe(true);
    await expect(page.locator(".mx-toc-summary")).toBeVisible();
    await expect(page.locator(".mx-toc nav a").first()).toBeVisible();
  });

  test("share: Post on X is a link to the canonical address; Copy link copies it and says so", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await open(page, ARTICLES.a);
    await defined(page);
    const share = page.locator(".mx-share");
    const url = await share.getAttribute("data-url");
    expect(url).toBe("https://example.com/blog/3fa91c07d2b8e6/");
    const x = new URL(await share.locator("a").getAttribute("href"));
    expect([x.origin + x.pathname, x.searchParams.get("url"), x.searchParams.get("text")]).toEqual(["https://x.com/intent/post", url, await page.locator("h1").textContent()]);
    const link = share.locator('button[data-share="link"]');
    await link.click();
    await expect(link).toHaveText("コピーしました");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(url);
    await expect(link).toHaveText("リンクをコピー", { timeout: 3000 });
  });

  test("share: the system sheet is offered only where navigator.share exists", async ({ page, browser }) => {
    await open(page, ARTICLES.a);
    await defined(page);
    expect(await page.evaluate(() => "share" in navigator)).toBe(false);
    await expect(page.locator('button[data-share="sheet"]')).toBeHidden();

    const ctx = await browser.newContext();
    const with_ = await ctx.newPage();
    await with_.addInitScript(() => {
      window.__shared = [];
      navigator.share = (d) => (window.__shared.push(d), Promise.resolve());
    });
    await open(with_, ARTICLES.a);
    await defined(with_);
    const sheet = with_.locator('button[data-share="sheet"]');
    await expect(sheet).toBeVisible();
    await sheet.click();
    expect(await with_.evaluate(() => window.__shared)).toEqual([{ title: await with_.locator("h1").textContent(), url: "https://example.com/blog/3fa91c07d2b8e6/" }]);
    await ctx.close();
  });

  test("masthead: one h1, the path line, a strip of its own words from 720px and none below", async ({ page }) => {
    for (const [width, strip] of [[1440, true], [720, true], [719, false], [390, false]]) {
      await page.setViewportSize({ width, height: 900 });
      await open(page, ARTICLES.a);
      const m = await page.evaluate(() => {
        const fall = document.querySelector(".mx-masthead > .mx-stream-fall");
        return {
          h1: document.querySelectorAll("h1").length,
          crumb: [...document.querySelectorAll(".mx-crumb a, .mx-crumb [aria-current]")].map((a) => a.textContent),
          strip: getComputedStyle(fall).display !== "none",
          strands: [...fall.querySelectorAll(".mx-strand")].filter((s) => getComputedStyle(s).display !== "none").length,
          hidden: fall.getAttribute("aria-hidden"),
          words: [...fall.querySelectorAll(".mx-drop")].map((d) => d.textContent).join(""),
          masthead: document.querySelector(".mx-masthead").textContent.replace(/\s/g, ""),
        };
      });
      expect(m).toMatchObject({ h1: 1, crumb: ["~", "posts", "3fa91c07d2b8e6.md"], strip, hidden: "true" });
      if (strip) expect(m.strands).toBe(4);
      // L1: every glyph in the strip is in the masthead.
      for (const ch of m.words.replace(/\s/g, "")) expect(m.masthead).toContain(ch);
    }
  });

  test("post foot: A and B are each other's Newer and Older; the ways back; the index lists every article", async ({ page }) => {
    const pager = () => page.evaluate(() => [...document.querySelectorAll(".mx-pager a")].map((a) => [a.rel, a.getAttribute("href")]));
    await open(page, ARTICLES.a);
    expect(await pager()).toEqual([["next", "/article-b.html"]]);
    expect(await page.locator(".mx-ways a").evaluateAll((as) => as.map((a) => a.getAttribute("href")))).toEqual(["/blog.html", "/human-home.html", "/home.html?run=cat+%7E%2Fposts%2F3fa91c07d2b8e6.md"]);
    await open(page, ARTICLES.b);
    expect(await pager()).toEqual([["prev", "/article-a.html"]]);
    await open(page, "/blog.html");
    expect(await page.locator(".mx-index a").evaluateAll((as) => as.map((a) => a.getAttribute("href")))).toEqual(["/article-c.html", "/article-b.html", "/article-a.html"]);
    expect(await page.locator(".mx-index time").allTextContents()).toEqual(["2026-01-20", "2025-12-10", "2025-07-31"]);
  });

  test("the switch shows 人間用 as current; its 機械用 side opens the shell at the file", async ({ page }) => {
    await open(page, ARTICLES.b);
    const sides = await page.locator(".mx-header .mx-switch-side").evaluateAll((as) => as.map((a) => [a.dataset.to, a.getAttribute("aria-current"), a.getAttribute("href")]));
    expect(sides).toEqual([["human", "true", "/article-b.html"], ["machine", null, "/home.html?run=cat+%7E%2Fposts%2Fb6e20d4f9a13c8.md"]]);
    expect(await page.evaluate(() => document.documentElement.dataset.reading)).toBeUndefined();
  });
});

// ---------- 5.2 Prose and Code block ----------

test.describe("5.2 prose and code block", () => {
  // MATRIX-NOTES, "Blog post pages": the prototype's characters per line on the Serena article.
  for (const [width, figure, size] of [[390, 20.6, "16px"], [768, 38.4, "17px"], [1100, 38.1, "17px"], [1440, 39.9, "17px"]]) {
    test(`characters per line at ${width}: within one of the prototype's ${figure}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of [ARTICLES.a, ARTICLES.b]) {
        await open(page, path);
        const m = await page.locator(".mx-prose").evaluate((p) => {
          const s = getComputedStyle(p);
          return { cpl: (p.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)) / parseFloat(s.fontSize), size: s.fontSize, leading: s.lineHeight };
        });
        console.log(`${path} at ${width}: ${m.cpl.toFixed(1)} characters per line, ${m.size} / ${m.leading}`);
        expect(Math.abs(m.cpl - figure)).toBeLessThanOrEqual(1);
        expect(m.size).toBe(size);
        expect(m.leading).toBe(`${parseFloat(size) * 2}px`);
      }
    });
  }

  test("the type table in 04", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const t = tokens["phosphor-night"];
    const styles = () => page.evaluate(() => {
      const q = (sel) => document.querySelector(`.mx-prose ${sel}`);
      const cs = (sel, pseudo) => (q(sel) ? getComputedStyle(q(sel), pseudo) : null);
      const prose = getComputedStyle(document.querySelector(".mx-prose"));
      return {
        family: prose.fontFamily.split(",")[0], weight: prose.fontWeight, lineBreak: prose.lineBreak, align: prose.textAlign, spacing: prose.letterSpacing,
        h2: [cs("h2").fontSize, cs("h2", "::before").content], h3: cs("h3") && [cs("h3").fontSize, cs("h3", "::before").content], h4: cs("h4") && [cs("h4").fontSize, cs("h4", "::before").content],
        link: cs("li > a") && [cs("li > a").color, cs("li > a").textDecorationLine], strong: cs("strong") && [cs("strong").fontWeight, cs("strong").color],
        ul: [cs("ul > li", "::before").content, cs("ul > li", "::before").color, cs("ul > li", "::before").fontFamily.split(",")[0]],
        ol: cs("ol > li") && cs("ol > li", "::before").content,
        hr: cs("hr") && [cs("hr").borderTopStyle, cs("hr").borderTopColor],
        quote: cs("blockquote") && [cs("blockquote").borderLeftWidth, cs("blockquote").borderLeftColor, cs("blockquote").color],
        code: cs(":not(pre) > code") && [cs(":not(pre) > code").backgroundColor, cs(":not(pre) > code").borderTopWidth, cs(":not(pre) > code").color, (parseFloat(cs(":not(pre) > code").fontSize) / parseFloat(prose.fontSize)).toFixed(2)],
        title: [getComputedStyle(document.querySelector(".mx-masthead-title")).wordBreak, getComputedStyle(document.querySelector(".mx-masthead-title")).textWrap],
      };
    });
    const common = { family: '"M PLUS 1 Code"', weight: "400", lineBreak: "strict", align: "start", spacing: "normal", h2: ["22px", '"##" / ""'], ul: ['"-" / ""', rgb(t["color.accent"]), '"IBM Plex Mono"'], title: ["auto-phrase", "balance"] };
    await open(page, ARTICLES.a);
    expect(await styles()).toEqual({
      ...common, h3: ["18px", '"###" / ""'], h4: ["17px", '"####" / ""'], ol: null, quote: null,
      link: [rgb(t["color.accent"]), "underline"], strong: ["500", rgb(t["color.text-lead"])],
      hr: ["dashed", rgb(t["color.rule"])],
      code: [rgb(t["color.ground"]), "1px", rgb(t["color.text-lead"]), "0.90"],
    });
    await open(page, ARTICLES.c);
    expect(await styles()).toMatchObject({ ...common, ol: 'counter(mx-item) "." / ""', quote: ["2px", rgb(t["color.rule"]), rgb(t["color.text-muted"])] });
    await open(page, ARTICLES.b);
    const imgs = await page.locator(".mx-prose img").evaluateAll((is) => is.map((i) => [i.getAttribute("width"), i.getAttribute("height"), !!i.alt, getComputedStyle(i).borderTopWidth, i.naturalWidth > 0]));
    expect(imgs).toEqual([["750", "235", true, "1px", true], ["250", "333", true, "1px", true], ["250", "334", true, "1px", true], ["350", "262", true, "1px", true]]);
  });

  for (const [context, q] of Object.entries(CONTEXTS)) {
    test(`Shiki's colours follow ${context}`, async ({ page }) => {
      await open(page, `${ARTICLES.a}?${q}`);
      const t = tokens[context];
      const c = await page.evaluate(() => {
        const pre = document.querySelector(".mx-code pre");
        const by = (v) => [...pre.querySelectorAll("span[style]")].find((s) => s.getAttribute("style").includes(v));
        return { bg: getComputedStyle(pre).backgroundColor, fg: getComputedStyle(pre).color, comment: getComputedStyle(by("token-comment")).color, fn: getComputedStyle(by("token-function")).color, string: getComputedStyle(by("token-string")).color, tab: getComputedStyle(pre, "::before").content };
      });
      expect(c).toEqual({ bg: rgb(t["color.ground"]), fg: rgb(t["color.text"]), comment: rgb(t["color.text-muted"]), fn: rgb(t["color.accent"]), string: rgb(t["color.text-lead"]), tab: '"bash" / ""' });
    });
  }

  test("code: ten blocks in A, eight bash and two plaintext; long lines wrap inside the box", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, ARTICLES.a);
    expect(await page.locator(".mx-code pre").evaluateAll((ps) => ps.map((p) => p.dataset.language))).toEqual([...Array(8).fill("bash"), "plaintext", "plaintext"]);
    const long = await page.locator(".mx-code pre").nth(1).evaluate((p) => ({ chars: p.textContent.length, scroll: p.scrollWidth <= p.clientWidth, lines: Math.round(p.querySelector("code").getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight)) }));
    expect(long).toMatchObject({ chars: 131, scroll: true });
    expect(long.lines).toBeGreaterThan(1);
  });

  test("Copy copies the code and says so for a moment; it is after the code in the focus order", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await open(page, ARTICLES.a);
    await defined(page);
    const block = page.locator(".mx-code").nth(2);
    const code = await block.locator("code").textContent();
    await block.locator("pre").focus();
    await page.keyboard.press("Tab");
    const copy = block.locator(".mx-copy button");
    await expect(copy).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(copy).toHaveText("コピーしました");
    expect(await copy.evaluate((b) => [getComputedStyle(b).backgroundColor, b.hasAttribute("data-done")])).toEqual([rgb(tokens["phosphor-night"]["color.accent"]), true]);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code);
    await expect(copy).toHaveText("コピー", { timeout: 3000 });
  });

  test("a clipboard that refuses: Copy says Not copied, then Copy again", async ({ page }) => {
    await page.addInitScript(() => (navigator.clipboard.writeText = () => Promise.reject(new Error("refused"))));
    await open(page, ARTICLES.a);
    await defined(page);
    const copy = page.locator(".mx-copy button").first();
    await copy.click();
    await expect(copy).toHaveText("コピーできませんでした");
    await expect(copy).toHaveText("コピー", { timeout: 3000 });
  });
});

// ---------- 5.3 Drafts ----------

test.describe("5.3 drafts", () => {
  test("diff: readable without colour, by the sign and the weight; tokens in a changed line take its tone", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await open(page, ARTICLES.c);
    await defined(page);
    const t = tokens["phosphor-night"];
    const lines = await page.locator(".mx-code[data-diff]").first().locator(".line").evaluateAll((ls) =>
      ls.map((l) => ({ sign: l.textContent[0], diff: l.dataset.diff ?? null, weight: getComputedStyle(l).fontWeight, colours: [...new Set([...l.querySelectorAll("span")].map((s) => getComputedStyle(s).color))], indent: getComputedStyle(l).textIndent, pad: getComputedStyle(l).paddingLeft })),
    );
    expect(lines.map((l) => [l.sign, l.diff, l.weight])).toEqual([[" ", null, "400"], ["-", "del", "400"], ["+", "add", "500"], [" ", null, "400"]]);
    expect(lines[1].colours).toEqual([rgb(t["color.text-muted"])]);
    expect(lines[2].colours).toEqual([rgb(t["color.text-lead"])]);
    expect(lines[0].colours.length).toBeGreaterThan(1);
    for (const l of lines) expect(parseFloat(l.indent)).toBe(-parseFloat(l.pad));
    // Copy gives back a diff that applies: the signs are text.
    await page.locator(".mx-code[data-diff] .mx-copy button").first().click();
    expect((await page.evaluate(() => navigator.clipboard.readText())).split("\n").map((l) => l[0])).toEqual([" ", "-", "+", " "]);
  });

  test("diff in forced colours: the sign and the weight are still there", async ({ browser }) => {
    const ctx = await browser.newContext({ forcedColors: "active" });
    const page = await ctx.newPage();
    await open(page, ARTICLES.c);
    const w = await page.locator(".mx-code[data-diff] .line[data-diff]").evaluateAll((ls) => ls.map((l) => [l.textContent[0], getComputedStyle(l).fontWeight]));
    expect(w.slice(0, 2)).toEqual([["-", "400"], ["+", "500"]]);
    await ctx.close();
  });

  test("code title: a figure and its caption; no tab; clear of Copy at 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, ARTICLES.c);
    await defined(page);
    const fig = page.locator("figure.mx-code").nth(1);
    const m = await fig.evaluate((f) => {
      const cap = f.querySelector("figcaption.mx-code-title").getBoundingClientRect();
      const copy = f.querySelector(".mx-copy button").getBoundingClientRect();
      const pre = f.querySelector("pre");
      return { text: f.querySelector("figcaption").textContent, tab: getComputedStyle(pre, "::before").content, clear: cap.right <= copy.left, gap: Math.round(parseFloat(getComputedStyle(pre).paddingTop)) };
    });
    expect(m).toEqual({ text: "src/fixtures/fixture-station.yml", tab: "none", clear: true, gap: 16 });
  });

  test("callout: the word tells a message from an alert, with a ! on the alert; no live region", async ({ page }) => {
    await open(page, ARTICLES.c);
    const c = await page.locator(".mx-callout").evaluateAll((cs) => cs.map((c) => [c.dataset.variant ?? null, c.querySelector(".mx-callout-label").textContent, getComputedStyle(c.querySelector(".mx-callout-label"), "::before").content, c.getAttribute("role")]));
    expect(c.slice(0, 2)).toEqual([[null, "メモ", "none", null], ["alert", "警告", '"!" / ""', null]]);
  });

  test("details: closed by default, Enter opens it, ▸ and ▾; the summary is a 44px target", async ({ page }) => {
    await open(page, ARTICLES.c);
    const d = page.locator(".mx-details").first();
    const s = d.locator("summary");
    expect(await s.evaluate((x) => [x.parentElement.open, getComputedStyle(x, "::before").content, x.getBoundingClientRect().height >= 44])).toEqual([false, '"▸" / ""', true]);
    await s.focus();
    await page.keyboard.press("Enter");
    expect(await s.evaluate((x) => [x.parentElement.open, getComputedStyle(x, "::before").content])).toEqual([true, '"▾" / ""']);
    expect(await d.evaluate((x) => x.getAnimations({ subtree: true }).length)).toBe(0);
  });

  test("table: the wide one scrolls inside its focusable, labelled wrapper at 390; the narrow one does not", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, ARTICLES.c);
    const t = await page.locator(".mx-table").evaluateAll((ws) => ws.map((w) => ({ scrolls: w.scrollWidth > w.clientWidth, tab: w.tabIndex, label: w.getAttribute("aria-label"), role: w.getAttribute("role") })));
    expect(t).toEqual([{ scrolls: false, tab: 0, label: "表", role: "group" }, { scrolls: true, tab: 0, label: "表", role: "group" }]);
    const wide = page.locator(".mx-table").nth(1);
    await wide.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => wide.evaluate((w) => w.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("task list and footnotes: names, states and the target", async ({ page }) => {
    await open(page, ARTICLES.c);
    const boxes = page.locator(".mx-prose").getByRole("checkbox");
    expect(await boxes.count()).toBe(2);
    await expect(boxes.nth(0)).toBeChecked();
    await expect(boxes.nth(0)).toBeDisabled();
    expect(await boxes.nth(1).evaluate((b) => [b.checked, b.labels[0].textContent.trim().length > 0])).toEqual([false, true]);
    expect(await page.locator(".task-list-item").evaluateAll((ls) => ls.map((l) => getComputedStyle(l, "::before").content))).toEqual(['"[x]" / ""', '"[ ]" / ""']);
    await page.locator("[data-footnote-ref]").first().click();
    const target = await page.locator("#user-content-fn-1").evaluate((li) => [li.matches(":target"), getComputedStyle(li).borderLeftWidth, getComputedStyle(li).borderLeftStyle]);
    expect(target).toEqual([true, "2px", "solid"]);
    await page.locator("#user-content-fn-1 [data-footnote-backref]").click();
    expect(await page.evaluate(() => location.hash)).toBe("#user-content-fnref-1");
  });
});

// ---------- 5.4 Print ----------

test.describe("5.4 print", () => {
  for (const [context, q] of Object.entries(CONTEXTS)) {
    for (const [name, path] of Object.entries(ARTICLES)) {
      test(`article ${name} in ${context} on paper: no rain, no chrome, the day ink, no painted surface`, async ({ page }) => {
        await open(page, `${path}?${q}`);
        await page.emulateMedia({ media: "print" });
        const palette = context.split("-")[0];
        const day = tokens[`${palette}-day`];
        const p = await page.evaluate(() => {
          const shown = (sel) => [...document.querySelectorAll(sel)].some((e) => getComputedStyle(e).display !== "none");
          const gone = [".mx-rain", ".mx-masthead > .mx-stream-fall", ".mx-header", ".mx-footer", ".mx-skip", ".mx-status", ".mx-toc", ".mx-copy", ".mx-postfoot"].filter(shown);
          const surfaces = [".mx-prose", ".mx-masthead", ".mx-code", ".mx-code pre", ".mx-ref", ".mx-prose :not(pre) > code", ".mx-prose img", ".mx-callout", ".mx-details", "main", "body"];
          const painted = surfaces.flatMap((s) => [...document.querySelectorAll(s)]).filter((e) => {
            const c = getComputedStyle(e);
            return c.backgroundColor !== "rgba(0, 0, 0, 0)" || c.backgroundImage !== "none";
          }).map((e) => e.className || e.tagName);
          const panel = getComputedStyle(document.querySelector(".mx-prose"));
          return {
            gone, painted,
            html: getComputedStyle(document.documentElement).backgroundColor,
            scheme: getComputedStyle(document.documentElement).colorScheme,
            text: getComputedStyle(document.querySelector(".mx-prose p")).color,
            crumb: getComputedStyle(document.querySelector(".mx-crumb")).display,
            panel: [panel.borderTopStyle, panel.paddingLeft],
            rule: getComputedStyle(document.querySelector(".mx-code") ?? document.body).borderTopStyle,
          };
        });
        expect(p).toMatchObject({ gone: [], painted: [], html: "rgba(0, 0, 0, 0)", scheme: "light", text: rgb(day["color.text"]), crumb: "block", panel: ["none", "0px"] });
        if (name !== "b") expect(p.rule).toBe("solid");
      });
    }
  }

  test("at desk width the body is not left in the Contents rail: one column, plain flow at the measure", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, ARTICLES.a);
    await page.emulateMedia({ media: "print" });
    const g = await page.evaluate(() => {
      const box = (sel) => document.querySelector(sel).getBoundingClientRect();
      const [head, prose] = [box(".mx-masthead"), box(".mx-prose")];
      return {
        columns: getComputedStyle(document.querySelector(".mx-post-grid")).gridTemplateColumns.split(" ").length,
        left: prose.left - head.left,
        widths: [head.width, prose.width],
        padding: getComputedStyle(document.querySelector(".mx-prose")).paddingLeft,
      };
    });
    const measure = parseFloat(tokens["phosphor-night"]["size.measure.read"]);
    expect(g).toEqual({ columns: 1, left: 0, widths: [measure, measure], padding: "0px" });
  });

  test("addresses: after a link to another site; not after a Reference link, a link to this site, or one to this page", async ({ page }) => {
    await open(page, ARTICLES.c);
    await page.emulateMedia({ media: "print" });
    const after = (sel) => page.locator(sel).first().evaluate((a) => getComputedStyle(a, "::after").content);
    expect(await after('.mx-prose p a[href^="https://"]:not(.mx-ref)')).toBe('" (https://example.com/fixture/elsewhere)"');
    expect(await page.locator('.mx-prose p a[href^="https://"]:not(.mx-ref)').first().evaluate((a) => [getComputedStyle(a, "::after").fontFamily.split(",")[0], getComputedStyle(a, "::after").fontSize])).toEqual(['"IBM Plex Mono"', "13px"]);
    expect(await after('.mx-prose a[href="/blog.html"]')).toBe("none");
    expect(await after('.mx-prose a[href="#tables"]')).toBe("none");
    expect(await after(".mx-prose [data-footnote-ref]")).toBe('"]" / ""');
    expect(await page.locator("[data-footnote-backref]").first().evaluate((a) => getComputedStyle(a).display)).toBe("none");
    await open(page, ARTICLES.a);
    await page.emulateMedia({ media: "print" });
    expect(await after(".mx-prose a.mx-ref")).toBe("none");
    expect(await after('.mx-prose li a[href^="https://"]')).toBe('" (https://example.com/fixture/station)"');
    // Outside the prose, nothing: the masthead's path line.
    expect(await after(".mx-crumb a")).toBe("none");
  });

  test("details print open, with ▾; the table does not scroll; breaks are asked for", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, ARTICLES.c);
    await page.emulateMedia({ media: "print" });
    const d = await page.evaluate(() => {
      const closed = document.querySelector(".mx-details:not([open])");
      const wide = document.querySelectorAll(".mx-table")[1];
      return {
        body: closed.querySelector(".mx-details-body").getBoundingClientRect().height > 0,
        marker: getComputedStyle(closed.querySelector("summary"), "::before").content,
        table: [getComputedStyle(wide).overflowX, wide.scrollWidth <= wide.clientWidth],
        avoid: [".mx-code", ".mx-callout", ".mx-details", ".mx-prose tr"].map((s) => getComputedStyle(document.querySelector(s)).breakInside),
        after: getComputedStyle(document.querySelector(".mx-prose h2")).breakAfter,
        lines: [getComputedStyle(document.querySelector(".mx-prose p")).orphans, getComputedStyle(document.querySelector(".mx-prose p")).widows],
        page: [...document.styleSheets].flatMap((s) => [...s.cssRules]).some((r) => r instanceof CSSPageRule),
      };
    });
    expect(d).toEqual({ body: true, marker: '"▾" / ""', table: ["visible", true], avoid: Array(4).fill("avoid"), after: "avoid", lines: ["3", "3"], page: false });
    await open(page, ARTICLES.b);
    expect(await page.evaluate(() => [".mx-ref", ".mx-prose img"].map((s) => getComputedStyle(document.querySelector(s)).breakInside))).toEqual(["avoid", "avoid"]);
  });

  test("print to PDF works with every article element on the page", async ({ page }) => {
    await open(page, ARTICLES.c);
    const pdf = await page.pdf();
    expect(pdf.length).toBeGreaterThan(10_000);
  });
});

// ---------- The verification matrix (05), automated rows, on the Article specimens ----------

test.describe("verification matrix on the articles", () => {
  for (const [name, path] of Object.entries({ ...ARTICLES, index: "/blog.html" })) {
    test(`${name}: no other origin, no page error, no horizontal overflow at nine widths`, async ({ page }) => {
      for (const width of [320, 360, 390, 601, 719, 720, 1100, 1360, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const { errors, requests } = await open(page, path);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px`).toBe(true);
        expect(requests.filter((u) => !u.startsWith(ORIGIN))).toEqual([]);
        expect(errors).toEqual([]);
      }
    });
  }

  for (const [w, h] of [[1440, 900], [390, 844]]) {
    for (const [name, path] of Object.entries({ ...ARTICLES, index: "/blog.html" })) {
      test(`axe at ${w}, ${name}, with and without scripts`, async ({ page, browser }) => {
        await page.setViewportSize({ width: w, height: h });
        await open(page, path);
        await defined(page);
        expect(await axe(page)).toEqual([]);
        // axe needs timers, which a page without JavaScript does not run: the no-JS DOM, its scripts removed.
        const [ctx, off] = await nojs(browser, { viewport: { width: w, height: h } });
        await open(off, path);
        const html = (await off.content()).replace(/<script\b[\s\S]*?<\/script>/g, "");
        await ctx.close();
        const audit = await browser.newPage({ viewport: { width: w, height: h } });
        await serve(audit, DIRS);
        await audit.route(`${ORIGIN}/__nojs.html`, (r) => r.fulfill({ contentType: "text/html", body: html }));
        await audit.goto(`${ORIGIN}/__nojs.html`);
        expect(await axe(audit)).toEqual([]);
        await audit.close();
      });
    }
  }

  for (const [context, q] of Object.entries(CONTEXTS)) {
    test(`rendered contrast of the article's text in ${context}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await open(page, `${ARTICLES.c}?${q}`);
      // Each text's colour against the first painted surface under it.
      const pairs = await page.evaluate(() => {
        const bg = (el) => {
          for (let e = el; e; e = e.parentElement) {
            const c = getComputedStyle(e).backgroundColor;
            if (c !== "rgba(0, 0, 0, 0)") return c;
          }
          return getComputedStyle(document.documentElement).backgroundColor;
        };
        const sel = ".mx-masthead-id :is(a, span, h1, time, li), .mx-toc :is(a, summary), .mx-prose :is(p, li, h2, h3, h4, a, strong, code, th, td, blockquote, summary, .mx-callout-label, .mx-code-title, .line span, .mx-ref-host, .mx-ref-path), .mx-copy button, .mx-postfoot :is(p, a, span, code)";
        return [...document.querySelectorAll(sel)].filter((e) => e.textContent.trim() && e.getClientRects().length).map((e) => [getComputedStyle(e).color, bg(e), e.className || e.tagName]);
      });
      const hex = (c) => `#${c.match(/\d+/g).slice(0, 3).map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`;
      const low = pairs.filter(([fg, b]) => ratio(hex(fg), hex(b)) < 4.5).map(([fg, b, what]) => `${what}: ${fg} on ${b} = ${ratio(hex(fg), hex(b)).toFixed(2)}`);
      console.log(`${context}: ${pairs.length} texts checked, ${low.length} under 4.5:1`);
      expect(low).toEqual([]);
    });
  }

  test("keyboard path through an article at 1440: skip link, header, contents, body, foot, in order", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, ARTICLES.a);
    await defined(page);
    const order = [];
    for (let i = 0; i < 140; i++) {
      await page.keyboard.press("Tab");
      const where = await page.evaluate(() => {
        const e = document.activeElement;
        const part = e.closest(".mx-skip, .mx-header, .mx-masthead, .mx-toc, .mx-prose, .mx-postfoot, .mx-footer");
        return part ? part.className.split(" ")[0] : e.tagName;
      });
      if (order.at(-1) !== where) order.push(where);
    }
    expect(order.slice(0, 7)).toEqual(["mx-skip", "mx-header", "mx-masthead", "mx-toc", "mx-prose", "mx-postfoot", "mx-footer"]);
  });

  test("targets: every control in the article is at least 24px, the summaries 44px", async ({ page }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await open(page, ARTICLES.c);
      await defined(page);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll(".mx-copy button, .mx-share .mx-control, .mx-pager a, .mx-details-summary, .mx-toc-summary")]
          .filter((e) => e.getClientRects().length)
          .map((e) => [e.className || e.tagName, e.getBoundingClientRect()])
          .filter(([c, r]) => r.height < (/summary/.test(c) ? 44 : 24) || r.width < 24)
          .map(([c, r]) => `${c} ${r.width}×${r.height}`),
      );
      expect(small, `${width}px`).toEqual([]);
    }
  });

  test("reduced motion and Hold: nothing runs on an article", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await open(page, ARTICLES.a);
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
    await ctx.close();
    const held = await browser.newPage();
    await open(held, ARTICLES.a);
    await defined(held);
    await held.locator('[data-action="hold"]').click();
    expect(await held.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && a.effect.getComputedTiming().iterations === Infinity).length)).toBe(0);
    await held.close();
  });

  test("forced colours: no rain, the diff's signs, the current section's rule", async ({ browser }) => {
    const ctx = await browser.newContext({ forcedColors: "active", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await open(page, ARTICLES.a);
    await defined(page);
    await page.evaluate(() => document.querySelector("#setup").scrollIntoView());
    await expect.poll(() => page.locator('.mx-toc a[aria-current="location"]').count()).toBe(1);
    const f = await page.evaluate(() => ({
      rain: getComputedStyle(document.querySelector(".mx-rain")).display,
      rule: getComputedStyle(document.querySelector('.mx-toc a[aria-current="location"]')).borderLeftStyle,
      borders: getComputedStyle(document.querySelector(".mx-prose")).borderTopStyle,
    }));
    expect(f).toEqual({ rain: "none", rule: "solid", borders: "solid" });
    await ctx.close();
  });

  test("with every script blocked the article is whole: text, contents, images, code and links", async ({ page }) => {
    const { errors } = await open(page, ARTICLES.a, { block: ELEMENTS });
    expect(await page.locator(".mx-prose h2").count()).toBe(7);
    expect(await page.locator(".mx-prose .mx-code").count()).toBe(10);
    expect(await page.locator(".mx-prose .mx-ref").count()).toBe(9);
    await expect(page.locator(".mx-copy").first()).toBeHidden();
    expect(errors).toEqual([]);
  });
});
