// Serves built pages to Playwright from disk through a route, so no server runs and every request
// to another origin is visible (and aborted). Used by the specimen tests and the visual harness.
import { readFileSync, existsSync, statSync } from "node:fs";
import { extname, join } from "node:path";

export const root = join(import.meta.dirname, "../..");
// localhost, because a secure context is needed by Storybook (crypto.randomUUID); nothing listens there.
export const ORIGIN = "http://localhost:4173";
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml", ".md": "text/markdown" };

/**
 * `dirs` maps a URL prefix to a directory in the checkout, longest prefix first. `block` returns
 * true for a URL whose request should fail (a blocked script). Returns the list of requested URLs.
 */
export async function serve(page, dirs, { block = () => false } = {}) {
  const requests = [];
  const prefixes = Object.keys(dirs).sort((a, b) => b.length - a.length);
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    requests.push(url.href);
    if (url.origin !== ORIGIN || block(url)) return route.abort();
    const prefix = prefixes.find((p) => url.pathname.startsWith(p));
    let file = prefix && join(root, dirs[prefix], decodeURIComponent(url.pathname.slice(prefix.length)));
    if (file && existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!file || !existsSync(file)) return route.fulfill({ status: 404, body: "not found" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[extname(file)] ?? "application/octet-stream" });
  });
  return requests;
}

/** Runs axe-core with the same WCAG 2.2 A/AA tags as the Storybook addon (06). */
const AXE = readFileSync(join(root, "node_modules/axe-core/axe.min.js"), "utf8");
export async function axe(page) {
  // Evaluated rather than added as a <script>, so it also runs on a page with JavaScript disabled.
  await page.evaluate(`${AXE};0`);
  return page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] });
    return r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  });
}
