// The performance budgets (05, "How each budget is measured"): their ceilings and recorded figures are
// read from docs/verification/budgets.md, so a ceiling exists in one place, and the two sizes are
// measured here for `npm run check`. The browser budgets are in tests/budgets.spec.mjs.
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = join(import.meta.dirname, "..");
export const FILE = "docs/verification/budgets.md";

/** The rows of the first table under `## <heading>`, as arrays of cells. */
function table(md, heading) {
  const at = md.indexOf(`\n## ${heading}\n`);
  if (at < 0) throw new Error(`${FILE}: no "## ${heading}" section`);
  const lines = md.slice(at).split("\n").slice(2);
  const start = lines.findIndex((l) => l.startsWith("|"));
  const rows = [];
  for (const l of lines.slice(start + 2)) {
    if (!l.startsWith("|")) break;
    rows.push(l.slice(1, -1).split("|").map((c) => c.trim()));
  }
  return rows;
}
const number = (cell) => Number(cell.replace(/[^\d.]/g, ""));
const names = (cell) => [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

/** The ceilings (and the recorded sizes) from budgets.md. */
export function budgets(md = readFileSync(join(root, FILE), "utf8")) {
  const rows = table(md, "Ceilings");
  const row = (name) => rows.find((r) => r[0] === name) ?? (() => { throw new Error(`${FILE}: no row "${name}"`); })();
  return {
    animating: number(row("Animating elements per page")[1]),
    endless: names(row("Animated properties, endless animations")[1]),
    recorded: Object.fromEntries(table(md, "Animated properties of the other animations").map((r) => [r[0].replaceAll("`", ""), r[1]])),
    stylesheet: { ceiling: number(row("Stylesheet, gzip")[1]), measured: number(row("Stylesheet, gzip")[2]) },
    terminal: { ceiling: number(row("Terminal element, gzip")[1]), measured: number(row("Terminal element, gzip")[2]) },
    longTasks: number(row("Long tasks after load, 4× CPU")[1]),
    readingChange: number(row("Reading change, input to first frame")[1]),
  };
}

const gzip = (buf) => gzipSync(buf, { level: 9 }).length;

/** dist/matrix.css, gzip level 9, bytes. */
export const stylesheetSize = (dir = root) => gzip(readFileSync(join(dir, "dist/matrix.css")));

/** The element's module and every module it imports by a relative path, each once, joined, gzip level 9. */
export function terminalSize(dir = root) {
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const [, rel] of readFileSync(file, "utf8").matchAll(/(?:\bfrom|\bimport)\s*\(?\s*["'](\.{1,2}\/[^"']+)["']/g)) visit(resolve(dirname(file), rel));
  };
  visit(join(dir, "dist/components/terminal/mx-terminal.js"));
  return { bytes: gzip(Buffer.concat([...seen].map((f) => readFileSync(f)))), modules: [...seen].map((f) => f.slice(dir.length + 1)) };
}

/** The `npm run check` gate for one size: at most the ceiling, and the recorded figure is the built one. */
export function sizeGate(name, built, { ceiling, measured }) {
  const errors = [];
  if (built > ceiling) errors.push(`${name}: ${built} bytes is over the ceiling of ${ceiling} in ${FILE}; take something out, or raise the ceiling there on purpose`);
  if (built !== measured) errors.push(`${name}: the built figure is ${built} bytes and ${FILE} records ${measured}; record the built one`);
  return errors;
}
