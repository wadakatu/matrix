// Each gate passes on the repository and fails on a deliberate violation (09, task 1.4).
// Run by `npm run check`; needs `npm run build` first.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import stylelint from "stylelint";
import * as gate from "../scripts/gates.mjs";
import * as budget from "../scripts/budgets.mjs";
import { CONTEXTS } from "../scripts/terrazzo-matrix.mjs";
import { readSources } from "../scripts/tokens-doc.mjs";

const root = join(import.meta.dirname, "..");
const read = (f) => readFileSync(join(root, f), "utf8");
const built = () => JSON.parse(read("dist/tokens.json"));
const sources = () => readSources(root);
const clone = (x) => structuredClone(x);

test("token validity: tz check rejects an invalid token", () => {
  const dir = mkdtempSync(join(tmpdir(), "mx-tz-"));
  cpSync(join(root, "tokens"), join(dir, "tokens"), { recursive: true });
  writeFileSync(join(dir, "terrazzo.config.mjs"), 'export default { tokens: ["./tokens/matrix.resolver.json"], plugins: [] };\n');
  const tz = (cwd) => spawnSync(join(root, "node_modules/.bin/tz"), ["check", "-c", "terrazzo.config.mjs"], { cwd, encoding: "utf8" });
  assert.equal(tz(dir).status, 0, tz(dir).stdout + tz(dir).stderr);
  const file = join(dir, "tokens/base.tokens.json");
  const base = JSON.parse(readFileSync(file, "utf8"));
  base.space["4"].$value = { value: 16, unit: "ch" };
  writeFileSync(file, JSON.stringify(base));
  assert.notEqual(tz(dir).status, 0);
});

test("token validity: a missing description, a hex that disagrees, a context that lacks a token", () => {
  assert.deepEqual(gate.tokenValidity(sources()), []);
  const s = sources();
  delete s.base.space["4"].$description;
  s.contexts["operator-day"].color.ground.$value.hex = "#000000";
  delete s.contexts["phosphor-day"].color.rule;
  const errors = gate.tokenValidity(s);
  assert.ok(errors.some((e) => e.includes("space.4 has no $description")), errors.join("\n"));
  assert.ok(errors.some((e) => e.includes("color.ground components give #cdd6cb, hex says #000000")), errors.join("\n"));
  assert.ok(errors.some((e) => e.includes("phosphor-day does not define the same tokens")), errors.join("\n"));
});

test("contrast: the self-test catches broken luminance maths", () => {
  assert.deepEqual(gate.contrastSelfTest(), []);
  assert.ok(gate.contrastSelfTest((a, b) => gate.ratio(a, b) * 1.01).length > 0);
});

test("contrast: a pair under its floor, and rain over its ceiling, fail in a non-default context", () => {
  const pairs = gate.declaredPairs(sources());
  assert.deepEqual(gate.contrast(built(), pairs).failures, []);
  const b = built();
  b["operator-day"]["color.text-muted"] = "#8fa093"; // the rule colour: far under 4.5:1
  b["phosphor-day"]["color.rain.body"] = "#0c2115"; // the text colour: far over 5:1
  const { failures } = gate.contrast(b, pairs);
  assert.ok(failures.some((f) => f.startsWith("color.text-muted on color.ground in operator-day") && f.includes("under its floor 4.5")), failures.join("\n"));
  assert.ok(failures.some((f) => f.startsWith("color.rain.body on color.ground in phosphor-day") && f.includes("over its ceiling 5")), failures.join("\n"));
});

test("contrast: every role 02 gives a floor declares one", () => {
  const declared = new Set(gate.declaredPairs(sources()).map((p) => `${p.fg} on ${p.bg}`));
  for (const fg of ["text", "text-lead", "text-muted", "accent", "control-border", "focus", "reading.human", "reading.machine"])
    for (const bg of ["ground", "panel"]) assert.ok(declared.has(`color.${fg} on color.${bg}`), `${fg} on ${bg}`);
  assert.ok(declared.has("color.on-accent on color.accent"));
  assert.ok(declared.has("color.rain.body on color.ground"));
});

test("golden values: the gate reproduces table M2, and a changed value fails it", () => {
  const m2 = gate.parseM2(read("docs/matrix-design/10-verification-log.md"));
  assert.equal(m2.length, 17);
  assert.deepEqual(gate.golden(built(), m2).failures, []);
  const b = built();
  b["phosphor-night"]["color.text-muted"] = "#7cbd90"; // the prototype's value before decision Q9
  const { failures } = gate.golden(b, m2);
  assert.ok(failures.includes("M2 text-muted on ground in phosphor-night: measured 9.18, table says 9.59"), failures.join("\n"));
});

test("tokens: every value in 02's table is in the output for its context", () => {
  const doc = read("docs/matrix-design/02-tokens.md").split("### Values")[1].split("###")[0];
  const b = built();
  let n = 0;
  for (const line of doc.split("\n")) {
    const cells = line.split("|").slice(1, -1).map((s) => s.trim());
    const id = cells[0]?.match(/^`(color\.[\w.-]+)`$/)?.[1];
    if (!id) continue;
    CONTEXTS.forEach((c, i) => {
      const cell = cells[i + 1];
      const hex = cell.match(/#[0-9a-f]{6}/)?.[0];
      const alpha = cell.match(/α ([\d.]+)/)?.[1];
      const want =
        cell === "transparent" ? /^#[0-9a-f]{6}00$/ : alpha ? `${hex}${Math.round(Number(alpha) * 255).toString(16).padStart(2, "0")}` : hex;
      if (want instanceof RegExp) assert.match(b[c][id], want, `${id} in ${c}`);
      else assert.equal(b[c][id], want, `${id} in ${c}`);
      n++;
    });
  }
  assert.equal(n, 14 * 4);
});

const lint = async (code) => (await stylelint.lint({ code, codeFilename: join(root, "src/components/x/x.css"), configFile: join(root, "stylelint.config.mjs") })).results[0].warnings.map((w) => w.rule);

test("no raw values: colour, font-size and z-index literals fail in component CSS", async () => {
  assert.deepEqual(await lint(".mx-x { color: var(--mx-color-text); font-size: var(--mx-font-size-ui); z-index: var(--mx-layer-overlay); }"), []);
  assert.deepEqual(await lint(".mx-x { color: #2bf07a; }"), ["color-no-hex"]);
  assert.deepEqual(await lint(".mx-x { color: green; }"), ["color-named"]);
  assert.deepEqual(await lint(".mx-x { background: rgb(0 0 0); }"), ["function-disallowed-list"]);
  assert.deepEqual(await lint(".mx-x { font-size: 14px; }"), ["declaration-property-value-allowed-list"]);
  assert.deepEqual(await lint(".mx-x { font: 400 15px/1.7 var(--mx-font-family-mono); }"), ["declaration-property-value-disallowed-list"]);
  assert.deepEqual(await lint(".mx-x { z-index: 50; }"), ["declaration-property-value-allowed-list"]);
});

test("the shipped config (@wadakatu/matrix/stylelint) holds the no-raw-values rules without matrix's ledger", async () => {
  const shipped = async (code) => (await stylelint.lint({ code, codeFilename: join(root, "x.css"), configFile: join(root, "stylelint/index.mjs") })).results[0].warnings.map((w) => w.rule);
  assert.deepEqual(await shipped(".x { color: var(--mx-color-text); text-autospace: normal; }"), []);
  assert.deepEqual(await shipped(".x { color: #2bf07a; z-index: 50; }"), ["color-no-hex", "declaration-property-value-allowed-list"]);
});

test("breakpoints: only 600, 720, 1100 and 1360px, in either notation", async () => {
  assert.deepEqual(await lint("@media (min-width: 720px) { .mx-x { display: grid; } } @media (600px <= width < 1360px) { .mx-x { gap: 0; } }"), []);
  assert.deepEqual(await lint("@media (min-width: 777px) { .mx-x { display: grid; } }"), ["media-feature-name-value-allowed-list"]);
  assert.deepEqual(await lint("@media (width >= 45rem) { .mx-x { display: grid; } }"), ["media-feature-name-value-allowed-list"]);
  assert.deepEqual(await lint("@media (min-inline-size: 777px) { .mx-x { display: grid; } }"), ["media-feature-name-disallowed-list"]);
});

test("Baseline ledger: a feature that is not widely available fails until it is listed", async () => {
  assert.deepEqual(await lint(".mx-x { word-break: auto-phrase; }"), []);
  assert.deepEqual(await lint(".mx-x { text-autospace: normal; }"), ["plugin/use-baseline"]);
});

test("unknown token: a --mx-* property that is neither a token nor declared fails", () => {
  assert.deepEqual(gate.unknownTokens({ "a.css": ":root { --mx-pad: 1px; } .a { padding: var(--mx-pad); color: var(--mx-color-text); }" }, built()), []);
  assert.deepEqual(gate.unknownTokens({ "a.css": ".a { color: var(--mx-color-txet); }" }, built()), ["a.css: --mx-color-txet is not a token or a declared property"]);
  // A property an element sets at runtime counts as declared.
  assert.deepEqual(gate.unknownTokens({ "a.css": "body { height: var(--mx-vvh); }", "a.ts": 'd.style.setProperty("--mx-vvh", h)' }, built()), []);
});

test("freshness: a stale generated doc fails", () => {
  assert.deepEqual(gate.freshness("a", "a", "docs/tokens.md"), []);
  assert.equal(gate.freshness("a", "b", "docs/tokens.md").length, 1);
});

test("package contents: the logo, a stray file, or a missing output fails", () => {
  const ok = ["package.json", "README.md", "LICENSE", "CHANGELOG.md", "AGENTS.md", "docs/tokens.md", "dist/tokens.css", "dist/tokens.json", "dist/tokens.d.ts", "dist/matrix.css", "dist/fonts.css", "dist/fonts/a-400-normal.woff2", "dist/fonts/dotgothic16.LICENSE.txt", "dist/fonts/ibm-plex-mono.LICENSE.txt", "dist/fonts/m-plus-1-code.LICENSE.txt", "tokens/matrix.resolver.json", "tokens/base.tokens.json", "tokens/context/phosphor-night.tokens.json", "src/css/base.css", "dist/elements.js", "dist/head/head.js", "dist/lib/index.js", "dist/strings/index.js", "src/astro.ts", "src/components/panel/Panel.astro", "src/components/panel/panel.css", "stylelint/index.mjs", "docs/components.json", "llms.txt", "llms-full.txt", "skills/matrix/SKILL.md", "skills/matrix/references/index.md", "scripts/drift.mjs"];
  assert.deepEqual(gate.packageContents(ok), []);
  assert.deepEqual(gate.packageContents([...ok, "src/components/panel/Panel.stories.ts"]), ["src/components/panel/Panel.stories.ts: stories are not part of the package"]);
  assert.deepEqual(gate.packageContents([...ok, "assets/logo/logo-400.png"]), ["assets/logo/logo-400.png: the logo and its notice must not be in the package (decision Q3)"]);
  assert.deepEqual(gate.packageContents([...ok, "scripts/check.mjs"]), ["scripts/check.mjs: not an intended package file"]);
  assert.deepEqual(gate.packageContents(ok.filter((p) => p !== "dist/tokens.css")), ["dist/tokens.css: missing from the package"]);
  assert.deepEqual(gate.packageContents(ok.filter((p) => p !== "dist/fonts/ibm-plex-mono.LICENSE.txt")), ["dist/fonts/ibm-plex-mono.LICENSE.txt: missing from the package"]);
});

test("version consistency: package, lockfile, changelog and tag must agree", () => {
  const pkg = { version: "1.0.0-alpha.0" };
  const lock = { version: "1.0.0-alpha.0", packages: { "": { version: "1.0.0-alpha.0" } } };
  const changelog = "# Changelog\n\n## 1.0.0-alpha.0\n";
  assert.deepEqual(gate.versionConsistency({ pkg, lock, changelog }), []);
  assert.deepEqual(gate.versionConsistency({ pkg, lock, changelog, tag: "v1.0.0-alpha.0" }), []);
  assert.equal(gate.versionConsistency({ pkg, lock, changelog, tag: "v1.0.0-alpha.1" }).length, 1);
  assert.equal(gate.versionConsistency({ pkg, lock, changelog: "## 0.14.1\n" }).length, 1);
  assert.equal(gate.versionConsistency({ pkg, lock: { ...lock, version: "0.0.0" }, changelog }).length, 1);
});

test("budgets: the ceilings are read from budgets.md, and a size over its ceiling or unrecorded fails", () => {
  const b = budget.budgets();
  assert.equal(b.animating, 170);
  assert.deepEqual(b.endless, ["transform", "background-position", "mask-position", "clip-path"]);
  assert.ok(b.stylesheet.ceiling > 0 && b.terminal.ceiling > 0 && b.readingChange === 200 && b.longTasks === 0);
  assert.deepEqual(budget.sizeGate("x", 100, { ceiling: 100, measured: 100 }), []);
  assert.equal(budget.sizeGate("x", 101, { ceiling: 100, measured: 101 }).length, 1);
  assert.equal(budget.sizeGate("x", 99, { ceiling: 100, measured: 100 }).length, 1);
  assert.throws(() => budget.budgets("# Budgets\n"), /no "## Ceilings" section/);
});
