// npm run check: every gate that needs no browser. Run `npm run build` first; CI does.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CONTEXTS } from "./terrazzo-matrix.mjs";
import { readSources, renderTokensDoc } from "./tokens-doc.mjs";
import * as gate from "./gates.mjs";
import * as agent from "./agent-docs.mjs";
import { known as knownToMatrix } from "./drift.mjs";
import * as budget from "./budgets.mjs";

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

// The agent layer (07, "The freshness checks").
const generated = agent.generate();
run("freshness: docs/components.json, llms.txt, llms-full.txt", () =>
  Object.entries(generated).flatMap(([f, text]) => gate.freshness(existsSync(f) ? read(f) : "", text, f)));
const ids = Object.keys(built[CONTEXTS[0]]);
const pages = agent.readPages();
run("pages: one per directory, seven headings, front matter", () =>
  [...agent.pageErrors(pages), ...agent.nameErrors([...pages.pages.map((p) => p.path), ...agent.MIRRORED])]);
run("tokens on a page: listed if read, read if listed", () => agent.tokenErrors(pages.pages, ids));
const forAgents = Object.fromEntries(["llms.txt", "skills/matrix/SKILL.md", "skills/matrix/references/index.md"].map((f) => [f, read(f)]));
run("links: llms.txt and the skill point at files in the package", () => agent.linkErrors(forAgents, agent.packed()));
run("tokens and classes in prose: llms.txt and the skill", () => agent.proseErrors(forAgents, ids, knownToMatrix()));
run("the skill: name, description, length", () => agent.skillErrors(read("skills/matrix/SKILL.md")));
run("AGENTS.md: under 100 lines, real commands; CLAUDE.md imports it", () =>
  agent.agentsErrors({ agents: read("AGENTS.md"), claude: read("CLAUDE.md"), scripts: JSON.parse(read("package.json")).scripts }));
run("drift: unknown --mx-* property or mx-* class in src/", () => command("node", ["scripts/drift.mjs", "src"]));

run("package contents: npm pack --dry-run", () => {
  const [pack] = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  return gate.packageContents(pack.files.map((f) => f.path));
});

// The two size budgets (05, task 6.3): ceilings and recorded figures in docs/verification/budgets.md.
const ceilings = budget.budgets();
run("budget: stylesheet, gzip", () => budget.sizeGate("dist/matrix.css", budget.stylesheetSize(), ceilings.stylesheet));
run("budget: terminal element, gzip", () => budget.sizeGate("mx-terminal.js and its relative imports", budget.terminalSize().bytes, ceilings.terminal));

run("version consistency", () =>
  gate.versionConsistency({
    pkg: JSON.parse(read("package.json")),
    lock: JSON.parse(read("package-lock.json")),
    changelog: read("CHANGELOG.md"),
    tag: process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME : undefined,
  }));

run("gate tests: node --test", () => command("node", ["--test", "tests/gates.test.mjs"]));
run("agent layer tests: node --test (task 6.4)", () => command("node", ["--test", "tests/agent-docs.test.mjs"]));
run("lib tests: node --test (task 3.1)", () => command("node", ["--test", "tests/lib.test.mjs"]));
run("terminal tests: node --test (task 4.1)", () => command("node", ["--test", "tests/terminal.test.mjs"]));

if (failed) {
  console.log(`\n✖ ${failed} gate(s) failed`);
  process.exit(1);
}
console.log("\n✔ all gates passed");
