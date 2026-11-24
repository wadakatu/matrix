// The agent layer's checks (07, "The freshness checks"): each passes on the repository and fails on
// a deliberate fault. Run by `npm run check`; needs `npm run build` first.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import * as agent from "../scripts/agent-docs.mjs";
import { drift, known } from "../scripts/drift.mjs";

const root = join(import.meta.dirname, "..");
const read = (f) => readFileSync(join(root, f), "utf8");
const ids = Object.keys(JSON.parse(read("dist/tokens.json"))["phosphor-night"]);
const fresh = () => agent.readPages(root);
const page = (pages, path) => pages.pages.find((p) => p.path === path);

// The committed files against a fresh build is the freshness gate itself (scripts/check.mjs).
test("generated files: the index is sorted and complete, and a page edited after the build makes it differ", () => {
  const generated = agent.generate(root);
  const index = JSON.parse(generated["docs/components.json"]);
  assert.deepEqual(index.map((e) => e.name), index.map((e) => e.name).sort());
  const figures = index.find((e) => e.name === "Figures");
  assert.equal(figures.doc, "src/components/figures/figures.md");
  assert.ok(figures.classes.includes("mx-figures"));
  // A page edited after the build: the index differs.
  const pages = fresh();
  const p = page(pages, "src/components/figures/figures.md");
  p.data = { ...p.data, status: "draft" };
  assert.notEqual(agent.renderIndex(pages.pages), generated["docs/components.json"]);
});

test("pages: a directory without its page, a missing heading, a missing or misplaced field", () => {
  assert.deepEqual(agent.pageErrors(fresh()), []);
  const pages = fresh();
  pages.missing.push("src/components/x/x.md");
  const p = page(pages, "src/components/figures/figures.md");
  p.body = p.body.replace("## Accessibility", "## Access");
  p.keys = p.keys.filter((k) => k !== "attributes");
  const q = page(pages, "src/components/menu/menu.md");
  q.keys = ["status", "name", ...q.keys.slice(2)];
  const errors = agent.pageErrors(pages);
  assert.ok(errors.includes("src/components/x/x.md: missing (every component directory has its page)"), errors.join("\n"));
  assert.ok(errors.includes('src/components/figures/figures.md: no "## Accessibility" heading'), errors.join("\n"));
  assert.ok(errors.includes("src/components/figures/figures.md: front matter has no `attributes`"), errors.join("\n"));
  assert.ok(errors.some((e) => e.startsWith("src/components/menu/menu.md: front matter is not in the order")), errors.join("\n"));
});

test("pages: a page with no class and no element is accepted (Notice's shape)", () => {
  const text = "---\nname: Notice\nstatus: draft\nclass: mx-notice\nattributes: []\ntokens: []\n---\n\n# Notice\n\n" +
    agent.HEADINGS.map((h) => `## ${h}\n\nx.\n`).join("\n");
  assert.deepEqual(agent.pageErrors({ pages: [{ path: "src/components/notice/notice.md", ...agent.frontMatter(text) }], missing: [] }), []);
});

test("pages: two pages with one file name fail, because their mirrors would be one file", () => {
  assert.deepEqual(agent.nameErrors(fresh().pages.map((p) => p.path)), []);
  assert.equal(agent.nameErrors(["src/components/index/index.md", "skills/matrix/references/index.md"]).length, 1);
});

test("tokens on a page: read and not listed fails; listed and read by no route fails; the three routes pass", () => {
  assert.deepEqual(agent.tokenErrors(fresh().pages, ids), []);
  const pages = fresh();
  const menu = page(pages, "src/components/menu/menu.md");
  menu.data.tokens = menu.data.tokens.filter((t) => t !== "border.width.hair"); // 07's first finding
  const logo = page(pages, "src/components/logo/logo.md");
  logo.data.tokens = ["size.logo.header"]; // read by Mark, not by Logo
  const errors = agent.tokenErrors(pages.pages, ids);
  assert.deepEqual(errors, [
    "src/components/logo/logo.md: lists size.logo.header, which its files do not read, directly, through a derived property or by id",
    "src/components/menu/menu.md: its files read border.width.hair (--mx-border-width-hair) and its tokens do not list it",
  ]);
  // Routes: Masthead's title sizes through --mx-text-title; Head's failsafe by id in head.ts.
  assert.ok(page(fresh(), "src/components/masthead/masthead.md").data.tokens.includes("font.size.title.max"));
  assert.ok(page(fresh(), "src/head/head.md").data.tokens.includes("motion.boot.failsafe"));
});

test("links: a path that is not a file, not in the package, or climbs out of the package fails", () => {
  const packed = new Set(["docs/components.json"]);
  assert.deepEqual(agent.linkErrors({ "a.md": "[i](docs/components.json) [w](https://x.dev/) [h](#top)" }, packed), []);
  assert.deepEqual(agent.linkErrors({ "a.md": "[x](docs/nothing.md) [t](tests/gates.test.mjs) [u](../../docs/tokens.md)" }, packed, (p) => p !== "docs/nothing.md"), [
    "a.md: docs/nothing.md is not a file",
    "a.md: tests/gates.test.mjs is not in the package",
    "a.md: ../../docs/tokens.md is not a path from the package root",
  ]);
});

test("tokens and classes in prose: a token, a property or a class that does not exist fails", () => {
  const k = known(root);
  const texts = { "llms.txt": read("llms.txt"), SKILL: read("skills/matrix/SKILL.md"), refs: read("skills/matrix/references/index.md") };
  assert.deepEqual(agent.proseErrors(texts, ids, k), []);
  assert.deepEqual(agent.proseErrors({ s: "Read `color.acent`, `size.measure.*`, `var(--mx-color-txet)` and `.mx-figure`." }, ids, k), [
    "s: --mx-color-txet is not a token or a property matrix declares",
    "s: .mx-figure is not a class in docs/components.json",
    "s: `color.acent` is not a token",
  ]);
});

test("the skill: a wrong name, a long description, a long body fail", () => {
  const skill = read("skills/matrix/SKILL.md");
  assert.deepEqual(agent.skillErrors(skill), []);
  const errors = agent.skillErrors(skill.replace("name: matrix", "name: matrix-ui").replace(/^description: .*$/m, `description: ${"x".repeat(1025)}`) + "x\n".repeat(200));
  assert.equal(errors.length, 3, errors.join("\n"));
});

test("AGENTS.md: 100 lines, an npm run that does not exist, a CLAUDE.md that is more than the import", () => {
  const files = { agents: read("AGENTS.md"), claude: read("CLAUDE.md"), scripts: JSON.parse(read("package.json")).scripts };
  assert.deepEqual(agent.agentsErrors(files), []);
  const errors = agent.agentsErrors({ ...files, agents: `${files.agents}\nRun \`npm run lint\`.\n${"x\n".repeat(100)}`, claude: "@AGENTS.md\nAlso this." });
  assert.equal(errors.length, 3, errors.join("\n"));
});

test("drift: an unknown --mx-* property and an mx-* class outside the index fail; matrix's own pass", () => {
  const k = known(root);
  assert.deepEqual(drift({ "a.css": ".mx-panel { color: var(--mx-color-text); padding: var(--mx-pad); }", "b.astro": '<div class="mx-figures x">' }, k), []);
  assert.deepEqual(drift({ "a.css": ".mx-card { color: var(--mx-colour-text); }", "b.astro": '<div class="x mx-panell">' }, k), [
    "a.css: --mx-colour-text is not a token or a property matrix declares",
    "a.css: .mx-card is not a class in docs/components.json",
    "b.astro: .mx-panell is not a class in docs/components.json",
  ]);
});
