// The browser budgets (05, "How each budget is measured"), in Chromium, with `npm run test:specimens`.
// The ceilings are read from docs/verification/budgets.md; each test prints what it measured, which is
// the figure recorded there.
import { expect, test } from "@playwright/test";
import { ORIGIN, root, serve } from "./support/serve.mjs";
import { DIRS, SPECIMENS, holdMoved, path } from "./support/specimens.mjs";
import { budgets } from "../scripts/budgets.mjs";

const B = budgets();
const settle = (page) => page.waitForFunction(() => [...document.querySelectorAll("*")].every((e) => !e.localName.startsWith("mx-") || customElements.get(e.localName)));
const press = (page) => page.locator(".mx-header a[data-to]:not([aria-current])").first().click();
const changed = (page, to) => page.waitForFunction((to) => document.documentElement.dataset.reading === to && !document.querySelector("[aria-busy]") && !document.getAnimations().some((a) => a.playState === "running" && a.effect.getComputedTiming().iterations !== Infinity), to);

async function open(page, page_, { boot = false } = {}) {
  await serve(page, DIRS);
  if (page_ === "moved") await holdMoved(page, root);
  if (!boot) await page.addInitScript(() => sessionStorage.setItem("mx-boot", "1"));
  await page.goto(`${ORIGIN}${path(page_)}`);
  await settle(page);
}

// ---------- Animating elements per page ----------

for (const s of SPECIMENS) {
  for (const width of [1440, 390]) {
    test(`animating elements: ${s.page} at ${width}, at most ${B.animating}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await open(page, s.page);
      await page.waitForTimeout(200);
      const n = await page.evaluate(() => new Set(document.getAnimations().filter((a) => a.playState === "running").map((a) => a.effect.target)).size);
      console.log(`animating elements, ${s.page} at ${width}: ${n}`);
      expect(n).toBeLessThanOrEqual(B.animating);
    });
  }
}

// ---------- Animated properties ----------

/** Every animation seen, sampled each frame: its name, whether it has no end, and its keyframes' properties. */
const RECORD = () => {
  const seen = (window.__mxSeen = []);
  const known = new WeakSet();
  // A longhand counts as its property: the switch's drop steps background-position-y.
  const kebab = (p) => p.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/^webkit-/, "-webkit-").replace(/^((-webkit-)?(background|mask)-position)-[xy]$/, "$1");
  const tick = () => {
    for (const a of document.getAnimations()) {
      if (known.has(a)) continue;
      known.add(a);
      const props = new Set(a.transitionProperty ? [a.transitionProperty] : []);
      for (const k of a.effect.getKeyframes()) for (const p of Object.keys(k)) if (!["offset", "computedOffset", "easing", "composite"].includes(p)) props.add(kebab(p).replace(/^-webkit-/, ""));
      seen.push({ name: a.animationName ?? a.transitionProperty ?? (a.id || a.constructor.name), endless: a.effect.getTiming().iterations === Infinity, props: [...props] });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
/** 05: endless animations animate only the four; any other property is one recorded in budgets.md. */
function judge(seen, where) {
  const props = [...new Set(seen.flatMap((a) => a.props))].sort();
  const ends = [...new Set(seen.filter((a) => a.endless).flatMap((a) => a.props))].sort();
  console.log(`animated properties, ${where}: ${props.join(", ") || "none"}; of endless animations: ${ends.join(", ") || "none"}`);
  const endless = seen.filter((a) => a.endless).flatMap((a) => a.props.filter((p) => !B.endless.includes(p)).map((p) => `${a.name}: ${p}`));
  const unknown = seen.flatMap((a) => a.props.filter((p) => !B.endless.includes(p) && !(p in B.recorded)).map((p) => `${a.name}: ${p}`));
  expect([...new Set(endless)], "endless animations").toEqual([]);
  expect([...new Set(unknown)], "properties in neither list of budgets.md").toEqual([]);
}

for (const s of SPECIMENS) {
  test(`animated properties: ${s.page} at rest`, async ({ page }) => {
    await page.addInitScript(RECORD);
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, s.page);
    await page.waitForTimeout(2500);
    judge(await page.evaluate(() => window.__mxSeen), `${s.page} at rest`);
  });
}

test("animated properties: through the boot", async ({ page }) => {
  await page.addInitScript(RECORD);
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, "home", { boot: true });
  await page.waitForFunction(() => !document.documentElement.dataset.boot && document.documentElement.dataset.shell === "live", null, { timeout: 15_000 });
  await page.waitForTimeout(1000);
  judge(await page.evaluate(() => window.__mxSeen), "home through the boot");
});

for (const [from, there, back] of [["human-home", "machine", "human"], ["home", "human", "machine"]]) {
  test(`animated properties: through a reading change each way, from ${from}`, async ({ page }) => {
    await page.addInitScript(RECORD);
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, from);
    await press(page);
    await changed(page, there);
    await press(page);
    await changed(page, back);
    await page.waitForTimeout(500);
    judge(await page.evaluate(() => window.__mxSeen), `${from}, a reading change each way`);
  });
}

// ---------- Long tasks after load, four times slower ----------

for (const page_ of ["home", "human-home", "article-a"]) {
  test(`long tasks after load at 4× CPU: ${page_}, at most ${B.longTasks}`, async ({ page }) => {
    test.setTimeout(60_000);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      window.__mxLong = [];
      new PerformanceObserver((l) => window.__mxLong.push(...l.getEntries().map((e) => [e.startTime, e.duration]))).observe({ type: "longtask", buffered: true });
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    // The machine landing as a first visit: the boot plays, then the shell goes live.
    await open(page, page_, { boot: page_ === "home" });
    if (page_ === "home") await page.waitForFunction(() => !document.documentElement.dataset.boot && document.documentElement.dataset.shell === "live", null, { timeout: 30_000 });
    await page.waitForTimeout(2000);
    const { load, long } = await page.evaluate(() => ({ load: performance.getEntriesByType("navigation")[0].loadEventEnd, long: window.__mxLong }));
    const after = long.filter(([start]) => start >= load);
    console.log(`long tasks at 4×, ${page_}: ${after.length} after load (${after.map(([s, d]) => `${Math.round(d)}ms at ${Math.round(s)}`).join(", ") || "none"}); ${long.length - after.length} before`);
    expect(after.length).toBeLessThanOrEqual(B.longTasks);
  });
}

// ---------- Reading change, input to first frame ----------

/** The worst Event Timing duration of five presses each way; under 16ms there is no entry at all. */
async function readingChange(page, from, rate) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate });
  await page.addInitScript(() => {
    window.__mxEvents = [];
    new PerformanceObserver((l) => window.__mxEvents.push(...l.getEntries().filter((e) => e.interactionId).map((e) => [e.interactionId, e.duration]))).observe({ type: "event", durationThreshold: 16, buffered: true });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, from);
  const start = await page.evaluate(() => document.documentElement.dataset.reading);
  const other = start === "human" ? "machine" : "human";
  const worst = { [`${start}→${other}`]: 0, [`${other}→${start}`]: 0 };
  for (let i = 0; i < 10; i++) {
    const [a, b] = i % 2 ? [other, start] : [start, other];
    const before = await page.evaluate(() => window.__mxEvents.length);
    await press(page);
    await changed(page, b);
    await page.waitForTimeout(100);
    const d = await page.evaluate((n) => Math.max(0, ...window.__mxEvents.slice(n).map(([, d]) => d)), before);
    worst[`${a}→${b}`] = Math.max(worst[`${a}→${b}`], d);
  }
  return worst;
}

for (const from of ["human-home", "home"]) {
  test(`reading change, input to first frame: from ${from}, each way, worst of five, under ${B.readingChange}ms`, async ({ page }) => {
    test.setTimeout(60_000);
    const worst = await readingChange(page, from, 1);
    console.log(`reading change from ${from} at 1×, worst of five (0 = under 16ms, no entry): ${JSON.stringify(worst)}`);
    for (const d of Object.values(worst)) expect(d).toBeLessThan(B.readingChange);
  });

  test(`reading change at 4× (recorded, not gated): from ${from}`, async ({ page }) => {
    test.setTimeout(90_000);
    const worst = await readingChange(page, from, 4);
    console.log(`reading change from ${from} at 4×, worst of five (0 = under 16ms, no entry): ${JSON.stringify(worst)}`);
  });
}
