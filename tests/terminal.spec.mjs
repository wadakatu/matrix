// Phase 4, Terminal (09, tasks 4.1–4.4), on the 機械用 specimens: Home (the machine landing) and Projects.
// Ported from the prototype's term.mjs checks (MATRIX-NOTES, "機械用 as a shell", "Checks"), plus the
// release rule (05) and a late-arriving element. Needs `npm run build`; `npm run test:specimens` builds
// the pages with Astro first.
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ORIGIN, axe, root, serve } from "./support/serve.mjs";

const DIRS = { "/assets/": "assets", "/": "dist-specimens" };
const HOME = "/home.html";
const PROJECTS = "/projects.html";
const tokens = JSON.parse(readFileSync(join(root, "dist/tokens.json"), "utf8"))["phosphor-night"];
const FALLBACK = parseInt(tokens["motion.shell.fallback"]);
/** The specimens' own start script: the one that gives the element its interpreter. */
const STARTER = (url) => /SignaturePage\.astro_astro_type_script_index_1_lang/.test(url.pathname);

async function open(page, path, { block, delay } = {}) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const requests = await serve(page, DIRS, { block });
  // Registered after serve's route, so it is asked first (Playwright tries the newest route first).
  if (delay) {
    await page.route((url) => STARTER(url), async (route) => {
      await new Promise((r) => setTimeout(r, delay.ms));
      await route.fallback();
    });
  }
  await page.addInitScript(() => sessionStorage.setItem("mx-boot", "1"));
  await page.goto(ORIGIN + path);
  await page.evaluate(() => document.fonts.ready);
  return { errors, requests };
}
const live = (page) => page.waitForFunction(() => document.documentElement.dataset.shell === "live");
const field = (page) => page.locator(".mx-prompt-field input");
const tty = (page) => page.locator(".mx-terminal-tty");
const type = async (page, line) => {
  await field(page).fill(line);
  await field(page).press("Enter");
};
const lastLines = (page, n = 3) => page.evaluate((n) => [...document.querySelectorAll(".mx-terminal-tty > .mx-ln")].slice(-n).map((l) => l.textContent), n);
/** The window and the shell, as the prototype's viewport check measured them. */
const fit = (page) =>
  page.evaluate(() => {
    const r = (s) => document.querySelector(s).getBoundingClientRect();
    const screen = document.querySelector(".mx-terminal-screen");
    return {
      docHeight: document.documentElement.scrollHeight,
      docWidth: document.documentElement.scrollWidth,
      inner: [innerWidth, innerHeight],
      bodyOverflow: getComputedStyle(document.body).overflowY,
      prompt: r(".mx-prompt").bottom,
      modeline: [r(".mx-modeline").top, r(".mx-modeline").bottom],
      header: r(".mx-header").height,
      scrolls: screen.scrollHeight > screen.clientHeight,
      screenScrollable: getComputedStyle(screen).overflowY,
      scrollY,
    };
  });

// ---------- 4.1 The contract and the renderer ----------

test.describe("4.1 renderer", () => {
  test("recorded and live output for the same items are identical markup", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    // The recorded session, as built (scripts never start: the element stays recorded).
    await open(page, HOME, { block: STARTER });
    const recorded = await tty(page).evaluate((t) => t.innerHTML);
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await open(page, HOME);
    await live(page);
    // The login card is the same markup: the first command in a closed <details> below 720px.
    const login = await page.locator(".mx-terminal-tty > .mx-login").evaluate((d) => d.outerHTML);
    expect(recorded).toContain(login);
    // Every later command of the recording, run live, prints what the recording printed.
    const blocks = recorded.split(/(?=<div class="mx-ln mx-ln-echo">)/).slice(1).filter((b) => !b.includes("mx-login"));
    expect(blocks.length).toBeGreaterThan(5);
    for (const block of blocks) {
      const cmd = await page.evaluate((h) => Object.assign(document.createElement("div"), { innerHTML: h }).firstElementChild.lastChild.textContent.trim(), block);
      await page.evaluate(() => document.querySelector(".mx-terminal-tty").replaceChildren());
      await type(page, cmd);
      expect(await tty(page).evaluate((t) => t.innerHTML), cmd).toBe(block.replace(/<\/details>$/, ""));
    }
  });

  test("typed markup and typed URLs are printed as text, never as elements or links", async ({ page }) => {
    await open(page, `${HOME}?run=${encodeURIComponent('echo <img src=x onerror="window.pwned=1"> https://example.com/run')}`);
    await live(page);
    await type(page, "echo <script>window.pwned=2</script>");
    await type(page, "echo https://example.com/typed");
    await type(page, "cat contact.txt");
    const out = await tty(page).evaluate((t) => ({ imgs: t.querySelectorAll("img:not(.mx-fetch-mark)").length, scripts: t.querySelectorAll("script").length, links: [...t.querySelectorAll("a")].map((a) => a.href), text: t.textContent }));
    expect(out).toMatchObject({ imgs: 0, scripts: 0, links: [] });
    expect(out.text).toContain('<img src=x onerror="window.pwned=1">');
    expect(out.text).toContain("https://example.com/typed");
    expect(await page.evaluate(() => window.pwned)).toBeUndefined();
  });
});

// ---------- 4.2 The line editor ----------

test.describe("4.2 mx-terminal", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, HOME);
    await live(page);
  });

  test("arriving focuses the field on a fine pointer; the prompt and the status line name where it is", async ({ page }) => {
    await expect(field(page)).toBeFocused();
    expect(await page.locator(".mx-prompt-who").textContent()).toBe("fixture@example:~");
    await expect(page.locator(".mx-modeline-where")).toHaveText("0:sh* ~");
    await expect(page.locator(".mx-modeline-time")).toHaveText(/^\d\d:\d\d JST$/);
    expect(await tty(page).getAttribute("role")).toBe("log");
  });

  test("history: Up and Down recall, and the draft comes back", async ({ page }) => {
    await type(page, "echo one");
    await type(page, "echo two");
    await field(page).fill("draft");
    for (const [key, want] of [["ArrowUp", "echo two"], ["ArrowUp", "echo one"], ["ArrowUp", "echo one"], ["ArrowDown", "echo two"], ["ArrowDown", "draft"]]) {
      await field(page).press(key);
      await expect(field(page)).toHaveValue(want);
    }
    // The login command and ?run= are not history; a reload in the same tab keeps it.
    await page.reload();
    await live(page);
    await field(page).press("ArrowUp");
    await expect(field(page)).toHaveValue("echo two");
  });

  test("Tab completes when the line has text and the caret is at its end, and lists what is ambiguous", async ({ page }) => {
    await field(page).fill("he");
    await field(page).press("Tab");
    await expect(field(page)).toHaveValue("help ");
    await field(page).fill("cat pro");
    await field(page).press("Tab");
    await expect(field(page)).toHaveValue("cat projects/");
    await field(page).fill("c");
    await field(page).press("Tab");
    await expect(field(page)).toHaveValue("c");
    expect(await lastLines(page, 1)).toEqual(["cd  cat  clear"]);
    await expect(field(page)).toBeFocused();
  });

  for (const [way, act] of [
    ["on an empty line", (p) => p.keyboard.press("Tab")],
    ["with Shift", async (p) => { await field(p).fill("he"); await p.keyboard.press("Shift+Tab"); }],
    ["after Escape", async (p) => { await field(p).fill("he"); await p.keyboard.press("Escape"); await p.keyboard.press("Tab"); }],
    ["with the caret not at the end", async (p) => { await field(p).fill("help"); await field(p).evaluate((i) => i.setSelectionRange(0, 0)); await p.keyboard.press("Tab"); }],
  ]) {
    test(`Tab leaves the field ${way}`, async ({ page }) => {
      await act(page);
      await expect(field(page)).not.toBeFocused();
    });
  }

  test("keys are ignored while an input method is composing", async ({ page }) => {
    await type(page, "echo one");
    await field(page).fill("he");
    const prevented = await field(page).evaluate((input) =>
      ["Tab", "ArrowUp", "ArrowDown", "PageUp"].map((key) => !input.dispatchEvent(new KeyboardEvent("keydown", { key, isComposing: true, bubbles: true, cancelable: true }))));
    expect(prevented).toEqual([false, false, false, false]);
    await expect(field(page)).toHaveValue("he");
  });

  test("Ctrl+C is left to the browser with a selection, and cancels the line without one", async ({ page }) => {
    await field(page).fill("echo keep");
    await field(page).evaluate((i) => i.setSelectionRange(0, 4));
    const withSelection = await field(page).evaluate((i) => !i.dispatchEvent(new KeyboardEvent("keydown", { key: "c", ctrlKey: true, bubbles: true, cancelable: true })));
    expect(withSelection).toBe(false);
    await expect(field(page)).toHaveValue("echo keep");
    await field(page).evaluate((i) => i.setSelectionRange(9, 9));
    await page.keyboard.press("Control+c");
    await expect(field(page)).toHaveValue("");
    expect((await lastLines(page, 1))[0]).toBe("fixture@example:~$ echo keep^C");
  });

  test("Ctrl+L clears, Ctrl+U cuts to the start, Ctrl+A and Ctrl+E jump, PageUp and PageDown scroll", async ({ page }) => {
    for (let i = 0; i < 6; i++) await type(page, "help");
    const screen = page.locator(".mx-terminal-screen");
    const top = () => screen.evaluate((s) => s.scrollTop);
    const bottom = await top();
    await field(page).press("PageUp");
    expect(await top()).toBeLessThan(bottom);
    await field(page).press("PageDown");
    expect(await top()).toBe(bottom);
    await field(page).fill("echo abc");
    await field(page).press("Control+a");
    expect(await field(page).evaluate((i) => i.selectionStart)).toBe(0);
    await field(page).press("Control+e");
    expect(await field(page).evaluate((i) => i.selectionStart)).toBe(8);
    await field(page).evaluate((i) => i.setSelectionRange(5, 5));
    await field(page).press("Control+u");
    await expect(field(page)).toHaveValue("abc");
    await field(page).press("Control+l");
    expect(await tty(page).evaluate((t) => t.childElementCount)).toBe(0);
  });

  test("Ctrl+D on an empty line, exit and the status line's link lead back; returning finds the session", async ({ page }) => {
    await type(page, "echo still here");
    await field(page).press("Control+d");
    await page.waitForFunction(() => document.documentElement.dataset.reading === "human" && !document.querySelector("[aria-busy]"));
    await page.locator(".mx-header a[data-to]:not([aria-current])").click();
    await page.waitForFunction(() => document.documentElement.dataset.reading === "machine" && !document.querySelector("[aria-busy]"));
    expect(await tty(page).textContent()).toContain("still here");
    await expect(field(page)).toBeFocused();
    await type(page, "exit");
    await page.waitForFunction(() => document.documentElement.dataset.reading === "human" && !document.querySelector("[aria-busy]"));
    expect(new URL(page.url()).pathname).toBe("/human-home.html");
  });

  test("the block cursor: on the caret, lit with focus, hollow without, five blinks", async ({ page }) => {
    await field(page).fill("abcdef");
    await field(page).evaluate((i) => i.setSelectionRange(2, 2));
    await field(page).press("ArrowRight");
    await page.waitForTimeout(50);
    const c = await page.evaluate(() => {
      const cur = document.querySelector(".mx-prompt-cursor"), mirror = document.querySelector(".mx-prompt-mirror");
      const s = getComputedStyle(cur);
      return { under: cur.textContent, mirror: mirror.textContent, x: cur.getBoundingClientRect().x - mirror.getBoundingClientRect().x, w: mirror.offsetWidth, bg: s.backgroundColor, blinks: s.animationIterationCount, name: s.animationName };
    });
    expect(c).toMatchObject({ under: "d", mirror: "abc", blinks: "5", name: "mx-blink" });
    expect(Math.round(c.x)).toBe(c.w);
    expect(c.bg).not.toBe("rgba(0, 0, 0, 0)");
    await field(page).blur();
    await page.waitForTimeout(50);
    expect(await page.locator(".mx-prompt-cursor").evaluate((cur) => [getComputedStyle(cur).backgroundColor, getComputedStyle(cur).boxShadow !== "none"])).toEqual(["rgba(0, 0, 0, 0)", true]);
  });
});

test("reduced motion: the cursor does not blink, and nothing in the shell moves", async ({ page }) => {
  await open(page, `${HOME}?motion=0`);
  await live(page);
  await type(page, "help");
  expect(await page.locator(".mx-prompt-cursor").evaluate((c) => getComputedStyle(c).animationName)).toBe("none");
  expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
});

// ---------- 4.3 The viewport ----------

test.describe("4.3 viewport", () => {
  for (const [w, h] of [[1440, 900], [960, 700], [390, 844], [320, 568]]) {
    for (const path of [HOME, PROJECTS]) {
      test(`one viewport at ${w}×${h}, ${path}`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: h });
        await open(page, path);
        await live(page);
        for (let i = 0; i < 4; i++) await type(page, "help");
        const f = await fit(page);
        expect(f.docHeight).toBe(h);
        expect(f.docWidth).toBe(w);
        expect(f.bodyOverflow).toBe("hidden");
        expect(f.scrolls).toBe(true);
        expect(f.prompt).toBeLessThanOrEqual(f.modeline[0]);
        expect(f.modeline[1]).toBeLessThanOrEqual(h + 0.5);
        await page.mouse.wheel(0, 800);
        expect((await fit(page)).scrollY).toBe(0);
      });
    }
  }

  test("the lock lets go under 480px tall without a keyboard (05), and takes the window back above it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 420 });
    await open(page, HOME);
    await live(page);
    await type(page, "help");
    let f = await fit(page);
    expect(f.bodyOverflow).not.toBe("hidden");
    expect(f.docHeight).toBeGreaterThan(420);
    await page.mouse.wheel(0, 400);
    await expect.poll(async () => (await fit(page)).scrollY).toBeGreaterThan(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(100);
    f = await fit(page);
    expect([f.docHeight, f.bodyOverflow, f.scrollY]).toEqual([844, "hidden", 0]);
  });

  test("a keyboard (visualViewport 420 of 844): the shell is 420 tall, the status line and guide give way, the prompt stays above it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      const vv = window.visualViewport;
      Object.defineProperty(vv, "height", { get: () => (window.__kb ? 420 : innerHeight) });
      window.__setKb = (on) => ((window.__kb = on), vv.dispatchEvent(new Event("resize")));
    });
    await open(page, HOME);
    await live(page);
    await page.evaluate(() => window.__setKb(true));
    const f = await page.evaluate(() => ({
      kb: document.querySelector("mx-terminal").hasAttribute("data-keyboard"),
      body: document.body.getBoundingClientRect().height,
      modeline: getComputedStyle(document.querySelector(".mx-modeline")).display,
      guide: getComputedStyle(document.querySelector(".mx-guide")).display,
      prompt: document.querySelector(".mx-prompt").getBoundingClientRect().bottom,
      chips: document.querySelector(".mx-chips").getBoundingClientRect().bottom,
      switch: document.querySelector(".mx-header .mx-switch").getBoundingClientRect().height > 0,
    }));
    expect(f).toMatchObject({ kb: true, body: 420, modeline: "none", guide: "none", switch: true });
    expect(f.prompt).toBeLessThanOrEqual(420);
    expect(f.chips).toBeLessThanOrEqual(420);
    await page.evaluate(() => window.__setKb(false));
    expect(await page.locator("mx-terminal").getAttribute("data-keyboard")).toBeNull();
  });

  test("a pinch zoom (half the height at twice the scale) is not taken for a keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      const vv = window.visualViewport;
      Object.defineProperty(vv, "height", { get: () => innerHeight / 2 });
      Object.defineProperty(vv, "scale", { get: () => 2 });
    });
    await open(page, HOME);
    await live(page);
    expect(await page.locator("mx-terminal").getAttribute("data-keyboard")).toBeNull();
    expect(await page.evaluate(() => document.body.getBoundingClientRect().height)).toBe(844);
  });

  test("the shell's script blocked: the recorded session gets its scrolling page back after motion.shell.fallback", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const t0 = Date.now();
    await open(page, HOME, { block: STARTER });
    expect(await page.evaluate(() => getComputedStyle(document.body).overflowY)).toBe("hidden");
    await page.waitForFunction(() => document.documentElement.dataset.shell === "recorded");
    expect(Date.now() - t0).toBeGreaterThanOrEqual(FALLBACK - 500);
    const f = await fit(page);
    expect(f.bodyOverflow).not.toBe("hidden");
    expect(f.docHeight).toBeGreaterThan(900);
    await expect(page.locator(".mx-modeline-where")).toHaveText("recorded session");
    await expect(page.locator(".mx-prompt")).toBeHidden();
    await expect(page.locator(".mx-footer")).toBeVisible();
  });

  test("the shell's script five seconds late: it falls back, then takes the one viewport back", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // Every value data-shell takes, in order.
    await page.addInitScript(() => {
      window.__shells = [];
      new MutationObserver((ms) => ms.forEach((m) => m.target === document.documentElement && window.__shells.push(m.target.dataset.shell))).observe(document, { subtree: true, attributeFilter: ["data-shell"] });
    });
    await open(page, HOME, { delay: { ms: FALLBACK + 1000 } });
    await live(page);
    expect(await page.evaluate(() => window.__shells)).toEqual(["recorded", "live"]);
    const f = await fit(page);
    expect([f.docHeight, f.bodyOverflow, f.scrollY]).toEqual([900, "hidden", 0]);
    await expect(field(page)).toBeFocused();
  });

  test("without scripts: a recorded session in a scrolling page, real links, no prompt, no chips", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await open(page, HOME);
    const f = await fit(page);
    expect(f.bodyOverflow).not.toBe("hidden");
    expect(f.docHeight).toBeGreaterThan(900);
    await expect(page.locator(".mx-modeline-where")).toHaveText("recorded session");
    for (const s of [".mx-prompt", ".mx-chips", ".mx-guide-hide", ".mx-modeline-time"]) await expect(page.locator(s)).toBeHidden();
    await expect(page.locator(".mx-terminal-tty")).toContainText("This is a recorded session. The live prompt needs JavaScript.");
    await expect(page.locator(".mx-terminal-tty")).toContainText("fixture-five");
    expect(await page.locator(".mx-guide-way").getAttribute("href")).toBe("/human-home.html");
    expect(await page.locator(".mx-modeline-way").getAttribute("href")).toBe("/human-home.html");
    await expect(page.locator(".mx-footer")).toBeVisible();
    await ctx.close();
  });
});

// ---------- 4.4 Guide, chips, status line, fetch card, login card, swatches, run, takeover ----------

test.describe("4.4 parts", () => {
  test("the guide: its link is the in-place change; × hides it, and that is remembered in the tab", async ({ page }) => {
    await open(page, HOME);
    await live(page);
    await expect(page.locator(".mx-guide")).toBeVisible();
    const screen = async () => (await page.locator(".mx-terminal-screen").boundingBox()).height;
    const before = await screen();
    await page.locator(".mx-guide-hide").click();
    await expect(page.locator(".mx-guide")).toBeHidden();
    await expect(field(page)).toBeFocused();
    expect(await screen()).toBeGreaterThan(before);
    await type(page, "clear");
    await page.reload();
    await live(page);
    await expect(page.locator(".mx-guide")).toBeHidden();
    expect(await page.evaluate(() => sessionStorage.getItem("mx-guide"))).toBe("off");
  });

  test("on touch nothing takes focus on arrival; key chips first; chips and runs in output work without moving focus; 16px field", async ({ browser }) => {
    const ctx = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await open(page, HOME);
    await live(page);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    const chips = page.locator(".mx-chip:visible");
    expect((await chips.allTextContents()).slice(0, 5)).toEqual(["tab", "↑", "↓", "^C", "help"]);
    expect(await page.locator(".mx-chip[data-key]").evaluateAll((b) => b.map((x) => x.getAttribute("aria-label")))).toEqual(["Complete", "Previous command", "Next command", "Cancel"]);
    expect(await page.locator(".mx-prompt").evaluate((p) => getComputedStyle(p).fontSize)).toBe("16px");
    await page.locator('.mx-chip[data-run="help"]').tap();
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await expect(tty(page)).toContainText("Commands you can run:");
    await page.locator('.mx-terminal-tty .mx-run[data-run="ls"]').last().tap();
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    expect((await lastLines(page, 2))[0]).toBe("fixture@example:~$ ls");
    // The key chips act on the line: ↑ recalls what the chips ran.
    await page.locator('.mx-chip[data-key="ArrowUp"]').tap();
    await expect(field(page)).toHaveValue("ls");
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    for (const b of await page.locator(".mx-chip:visible").all()) expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(24);
    await ctx.close();
  });

  test("chips: a run without moving focus away from the field on a fine pointer", async ({ page }) => {
    await open(page, HOME);
    await live(page);
    await page.locator('.mx-chip[data-run="ls"]').click();
    await expect(field(page)).toBeFocused();
    expect((await lastLines(page, 2))[0]).toBe("fixture@example:~$ ls");
    await expect(page.locator(".mx-chip[data-key]").first()).toBeHidden();
  });

  test("the login card: closed below 720px with a 44px summary, contents from 720px; a typed neofetch prints in the open", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, HOME);
    await live(page);
    const card = page.locator(".mx-terminal-tty > .mx-login");
    expect(await card.evaluate((d) => d.open)).toBe(false);
    expect((await page.locator(".mx-login-summary").boundingBox()).height).toBeGreaterThanOrEqual(44);
    expect(await page.locator(".mx-login-summary").getAttribute("aria-label")).toBe("who am I? fixture_, Fixture developer");
    await page.locator(".mx-login-summary").click();
    await expect(page.locator(".mx-login .mx-fetch")).toBeVisible();
    await type(page, "neofetch");
    expect(await page.locator(".mx-terminal-tty .mx-fetch").count()).toBe(2);
    expect(await page.locator(".mx-terminal-tty > .mx-login").count()).toBe(1);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await live(page);
    await expect(page.locator(".mx-login-summary")).toBeHidden();
    await expect(page.locator(".mx-login .mx-fetch")).toBeVisible();
  });

  test("?run= replaces the login command: no card, not in history", async ({ page }) => {
    await open(page, `${HOME}?run=neofetch`);
    await live(page);
    expect(await page.locator(".mx-terminal-tty > .mx-login").count()).toBe(0);
    expect(await page.locator(".mx-terminal-tty .mx-fetch").count()).toBe(1);
    await field(page).press("ArrowUp");
    await expect(field(page)).toHaveValue("");
  });

  test("the fetch card: the real mark, whole and square, eight swatches, decoration hidden", async ({ page }) => {
    await open(page, HOME);
    await live(page);
    const f = await page.locator(".mx-fetch").first().evaluate((card) => {
      const img = card.querySelector("img"), r = img.getBoundingClientRect();
      return { src: img.getAttribute("src"), ratio: r.width / r.height, swatches: card.querySelectorAll(".mx-swatch").length, hidden: card.querySelector(".mx-swatches").getAttribute("aria-hidden"), fills: new Set([...card.querySelectorAll(".mx-swatch")].map((s) => getComputedStyle(s).backgroundColor)).size };
    });
    expect(f).toEqual({ src: "/assets/logo/logo-400.png", ratio: 1, swatches: 8, hidden: "true", fills: 8 });
  });

  test("the takeover: the screen is its view, it announces how to leave, keys act at once, and it leaves", async ({ page }) => {
    await open(page, HOME);
    await live(page);
    await type(page, "view about.txt");
    await expect(page.locator(".mx-takeover")).toBeVisible();
    await expect(tty(page)).toBeHidden();
    await expect(page.locator(".mx-status")).toHaveText("view. Press q, or type colon q and press Enter, to leave.");
    await expect(page.locator(".mx-takeover-buffer")).toContainText("Fixture developer");
    await expect(page.locator(".mx-modeline-where")).toHaveText("0:view* ~");
    await expect(page.locator(".mx-prompt > label > .mx-prompt-ps")).toBeHidden();
    await field(page).press("x");
    await expect(page.locator(".mx-takeover-message")).toHaveText("Read-only: press q to leave");
    await expect(field(page)).toHaveValue("");
    await field(page).press("Control+c");
    await expect(page.locator(".mx-takeover-message")).toHaveText("Type :q and press Enter to leave");
    await type(page, ":w");
    await expect(page.locator(".mx-takeover-message")).toHaveText("Not an editor command: :w");
    await type(page, ":q");
    await expect(page.locator(".mx-takeover")).toBeHidden();
    await expect(tty(page)).toBeVisible();
    await type(page, "view about.txt");
    await field(page).press("q");
    await expect(page.locator(".mx-takeover")).toBeHidden();
    await expect(page.locator(".mx-modeline-where")).toHaveText("0:sh* ~");
  });

  test("the rain overlay: over the screen until any key, which is not typed; still with motion off", async ({ page }) => {
    await open(page, HOME);
    await live(page);
    await type(page, "rain");
    await expect(page.locator(".mx-rain")).toBeVisible();
    await expect(page.locator(".mx-modeline-where")).toHaveText("0:rain* any key stops the rain");
    await expect(page.locator(".mx-status")).toHaveText("Rain. Press any key to stop.");
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBeGreaterThan(100);
    await page.keyboard.press("x");
    await expect(page.locator(".mx-rain")).toBeHidden();
    await expect(field(page)).toHaveValue("");
    await open(page, `${HOME}?motion=0`);
    await live(page);
    await type(page, "rain");
    await expect(page.locator(".mx-modeline-where")).toHaveText("0:rain* any key stops the rain (held still: motion is off)");
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
  });

  test("effects: theme, palette, open (only with a gesture), navigate keeps the carried flags, clear", async ({ page, context }) => {
    await open(page, `${HOME}?motion=0`);
    await live(page);
    await type(page, "theme day");
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("day");
    await type(page, "palette operator");
    expect(await page.evaluate(() => document.documentElement.dataset.palette)).toBe("operator");
    const popup = context.waitForEvent("page");
    await type(page, "open github");
    expect((await popup).url()).toBe("https://github.com/example");
    await type(page, "clear");
    expect(await tty(page).evaluate((t) => t.childElementCount)).toBe(0);
    await type(page, "reboot");
    await page.waitForURL(/boot=1/);
    expect(new URL(page.url()).searchParams.get("palette")).toBe("operator");
    expect(new URL(page.url()).searchParams.get("motion")).toBe("0");
  });

  test("?run=open prints its link without opening a window", async ({ page, context }) => {
    let opened = false;
    context.on("page", () => (opened = true));
    await open(page, `${HOME}?run=open%20github`);
    await live(page);
    await expect(tty(page).locator('a[href="https://github.com/example"]')).toHaveCount(1);
    await page.waitForTimeout(300);
    expect(opened).toBe(false);
  });

  test("the status line is above the scan lines: its fill is unbroken on every pixel row (3.9)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, HOME);
    await live(page);
    const box = await page.locator(".mx-modeline-where").boundingBox();
    // A strip of the fill right of the text, every pixel row of the line.
    const shot = await page.screenshot({ clip: { x: 900, y: (await page.locator(".mx-modeline").boundingBox()).y, width: 4, height: 6 } });
    const colours = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = Object.assign(document.createElement("canvas"), { width: img.width, height: img.height }).getContext("2d");
      c.drawImage(img, 0, 0);
      const d = c.getImageData(0, 0, img.width, img.height).data;
      return new Set(Array.from({ length: d.length / 4 }, (_, i) => d.slice(i * 4, i * 4 + 3).join())).size;
    }, shot.toString("base64"));
    expect(box.width).toBeGreaterThan(0);
    expect(colours).toBe(1);
    // A strip of the screen beside it does show the lines: the check can fail.
    const screenShot = await page.screenshot({ clip: { x: 1300, y: 600, width: 4, height: 6 } });
    const screenColours = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = Object.assign(document.createElement("canvas"), { width: img.width, height: img.height }).getContext("2d");
      c.drawImage(img, 0, 0);
      const d = c.getImageData(0, 0, img.width, img.height).data;
      return new Set(Array.from({ length: d.length / 4 }, (_, i) => d.slice(i * 4, i * 4 + 3).join())).size;
    }, screenShot.toString("base64"));
    expect(screenColours).toBeGreaterThan(1);
  });

  for (const [w, h] of [[1440, 900], [390, 844]]) {
    test(`axe on the live shell and the recorded session at ${w}`, async ({ page, browser }) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width: w, height: h });
      await open(page, HOME);
      await live(page);
      await type(page, "help");
      await type(page, "ls -l projects");
      expect(await axe(page)).toEqual([]);
      // axe needs timers, which a page without JavaScript does not run: audit the no-JS DOM, its scripts
      // removed, in a page that has them (as chrome.spec.mjs does), laid out as recorded.
      const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: w, height: h } });
      const nojs = await ctx.newPage();
      await open(nojs, HOME);
      const html = (await nojs.content()).replace(/<script\b[\s\S]*?<\/script>/g, "").replace("<html ", '<html data-shell="recorded" ');
      await ctx.close();
      const audit = await browser.newPage({ viewport: { width: w, height: h } });
      await serve(audit, DIRS);
      await audit.route(`${ORIGIN}/__nojs.html`, (r) => r.fulfill({ contentType: "text/html", body: html }));
      await audit.goto(`${ORIGIN}/__nojs.html`);
      expect(await axe(audit)).toEqual([]);
      await audit.close();
    });
  }

  test("the off switch fits the 機械用 header row: 69px at 1440 and 1100, with Hold rain shown", async ({ page }) => {
    for (const w of [1440, 1100]) {
      await page.setViewportSize({ width: w, height: 900 });
      await open(page, HOME);
      await live(page);
      await expect(page.locator('.mx-header [data-action="shortcut"]')).toBeVisible();
      await expect(page.locator('.mx-header [data-action="hold"]')).toBeVisible();
      expect((await page.locator(".mx-header").boundingBox()).height).toBe(69);
    }
    // From 1360px the colour buttons stay; below it they give way to `theme` and `palette`.
    await expect(page.locator('.mx-header [data-action="palette"]')).toBeHidden();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('.mx-header [data-action="palette"]')).toBeVisible();
  });
});
