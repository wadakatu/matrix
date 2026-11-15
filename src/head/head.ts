// @wadakatu/matrix/head: the pre-paint script and its flag contract (03, "Before the first paint").
import tokens from "../../dist/tokens.json" with { type: "json" };

/** Flags that travel on in-site links, and flags that are spent after one load. */
export const FLAGS = { carried: ["palette", "motion"], spent: ["theme", "boot", "run", "mode"] } as const;
/** The only persistent key (03, "Storage and same-origin neighbours"). */
export const THEME_KEY = "mx-theme";

const ground = Object.fromEntries(Object.entries(tokens).map(([c, t]) => [c, t["color.ground"]]));

/**
 * The script, as a string for an inline <script>. `site` is code the site runs in the same place,
 * for its own flags (`mode`, `boot`, `run`): it sees `d` (the root), `q` (the query) and
 * `get(storage, key)` (a read that never throws).
 */
export function headScript(site = ""): string {
  return `(() => {
const d = document.documentElement, q = new URLSearchParams(location.search);
const get = (s, k) => { try { return window[s].getItem(k); } catch { return null; } };
if ((q.get("theme") || get("localStorage", ${JSON.stringify(THEME_KEY)})) === "day") d.dataset.theme = "day";
if (q.get("palette") === "operator") d.dataset.palette = "operator";
const still = q.get("motion") === "0";
if (still || matchMedia("(prefers-reduced-motion: reduce)").matches) d.dataset.motion = "off";
const ground = ${JSON.stringify(ground)};
const meta = document.querySelector('meta[name="theme-color"]');
if (meta) meta.content = ground[(d.dataset.palette || "phosphor") + "-" + (d.dataset.theme || "night")];
${site}
addEventListener("DOMContentLoaded", () => {
  if (customElements.get("mx-root")) return;
  const flags = [];
  if (d.dataset.palette === "operator") flags.push(["palette", "operator"]);
  if (still) flags.push(["motion", "0"]);
  if (!flags.length) return;
  for (const a of document.querySelectorAll("a[href]")) {
    if (a.origin !== location.origin || a.getAttribute("href").startsWith("#")) continue;
    const u = new URL(a.href);
    for (const [k, v] of flags) u.searchParams.set(k, v);
    a.href = u.href;
  }
}, { once: true });
})();`;
}
