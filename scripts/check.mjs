// npm run check: every gate that needs no browser. Run `npm run build` first; CI does.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CONTEXTS } from "./terrazzo-matrix.mjs";
import { readSources, renderTokensDoc } from "./tokens-doc.mjs";
import * as gate from "./gates.mjs";

process.chdir(join(import.meta.dirname, ".."));
if (!existsSync("dist/tokens.json")) {
  console.error("✖ dist/ is missing: run `npm run build` first");
  process.exit(1);
}
const read = (f) => readFileSync(f, "utf8");
const built = JSON.parse(read("dist/tokens.json"));
const sources = readSources();
let failed = 0;

function run(name, fn) {
  const errors = fn();
  if (errors.length) {
    failed++;
    console.log(`✖ ${name}`);
    for (const e of errors) console.log(`    ${e}`);
  } else console.log(`✔ ${name}`);
}
const command = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  const out = `${r.stdout}${r.stderr}`.split("\n").filter((l) => l.trim() && !/DeprecationWarning|trace-deprecation/.test(l));
  return r.status === 0 ? [] : out;
};

run("token validity: tz check", () => command("node_modules/.bin/tz", ["check", "--quiet"]));
run("token validity: descriptions, hex, contexts", () => gate.tokenValidity(sources));

run("contrast: self-test", () => gate.contrastSelfTest());
const { rows, failures } = gate.contrast(built, gate.declaredPairs(sources));
console.log("\n  Declared pairs (WCAG 2 ratio; APCA Lc advisory, never a failure)\n");
console.log(`  ${"pair".padEnd(38)} ${CONTEXTS.map((c) => c.padStart(18)).join("")}  rule`);
const seen = new Set();
for (const r of rows) {
  const key = `${r.fg} on ${r.bg}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const cells = CONTEXTS.map((c) => {
    const x = rows.find((y) => y.fg === r.fg && y.bg === r.bg && y.context === c);
    return (x.error ? "error" : `${x.ratio.toFixed(2)} (${x.lc.toFixed(1)})${x.ok ? "" : "!"}`).padStart(18);
  }).join("");
  console.log(`  ${key.padEnd(38)} ${cells}  ${r.floor !== undefined ? `≥ ${r.floor}` : `≤ ${r.ceiling}`}`);
}
console.log("");
run("contrast: floors and ceiling in all four contexts", () => failures);

const m2 = gate.parseM2(read("docs/matrix-design/10-verification-log.md"));
const { table, failures: goldenFailures } = gate.golden(built, m2);
console.log("\n  Table M2, recomputed\n");
console.log(`  | Pair | ${["phosphor-night", "phosphor-day", "operator-night", "operator-day"].join(" | ")} |`);
for (const t of table) console.log(`  | ${t.label} | ${Object.values(t.cells).join(" | ")} |`);
console.log("");
run("golden values: table M2 in 10-verification-log.md", () => goldenFailures);

run("no raw values, breakpoints, Baseline ledger: stylelint", () =>
  command("node_modules/.bin/stylelint", ["src/**/*.css", "dist/tokens.css"]));

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]));
const sourceFiles = Object.fromEntries(walk("src").filter((f) => /\.(css|ts|astro|mdx?)$/.test(f)).map((f) => [f, read(f)]));
run("unknown token", () => gate.unknownTokens(sourceFiles, built));

run("freshness: docs/tokens.md", () => gate.freshness(read("docs/tokens.md"), renderTokensDoc(sources, built), "docs/tokens.md"));

run("package contents: npm pack --dry-run", () => {
  const [pack] = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  return gate.packageContents(pack.files.map((f) => f.path));
});

run("version consistency", () =>
  gate.versionConsistency({
    pkg: JSON.parse(read("package.json")),
    lock: JSON.parse(read("package-lock.json")),
    changelog: read("CHANGELOG.md"),
    tag: process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME : undefined,
  }));

run("gate tests: node --test", () => command("node", ["--test", "tests/gates.test.mjs"]));

if (failed) {
  console.log(`\n✖ ${failed} gate(s) failed`);
  process.exit(1);
}
console.log("\n✔ all gates passed");
