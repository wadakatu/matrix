// The agent layer (07): writes docs/components.json, llms.txt and llms-full.txt from the component
// pages, and holds the checks on them that `npm run check` runs. `npm run docs` writes; with --check
// it writes nothing and fails on a difference. Pure functions, so tests can feed each check a fault.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { drift, names } from "./drift.mjs";

export const HEADINGS = ["Purpose", "Contract", "Variants and states", "Behaviour", "Tokens", "Accessibility", "Do / Don't"];
export const FIELDS = ["name", "status", "class", "element", "attributes", "tokens"];
const REQUIRED = ["name", "status", "attributes", "tokens"];
const STATUS = ["approved", "draft"];
// Every directory here has a page named after it; two pages cover what has no directory of its own.
const DIRS = ["src/components", "src/effects"];
const OWN = ["src/head/head.md", "src/css/foundations.md"];
const SKILL = "skills/matrix/SKILL.md";
// What llms.txt links, in order. Markdown here goes into llms-full.txt and is mirrored by file name.
const LINKED = [SKILL, "docs/components.json", "docs/tokens.md", "CHANGELOG.md"];
export const MIRRORED = LINKED.filter((p) => p.endsWith(".md"));
const CONTEXTS = ["phosphor-night", "phosphor-day", "operator-night", "operator-day"];

const cssName = (id) => `--mx-${id.replaceAll(".", "-")}`;
const reads = (text) => [...text.matchAll(/var\(\s*(--mx-[\w-]+)/g)].map((m) => m[1]);

// ---------- pages ----------

/** The front matter's keys in order, and its values: a string, or a list for `[a, b]`. */
export function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  const keys = [];
  const data = {};
  for (const line of m?.[1].split("\n") ?? []) {
    const [, k, v] = line.match(/^([\w-]+):\s*(.*)$/) ?? [];
    if (!k) continue;
    keys.push(k);
    data[k] = v.startsWith("[") ? v.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean) : v;
  }
  return { keys, data, body: m ? text.slice(m[0].length) : text };
}

/** Every page with its front matter and its directory's other files (not stories, not Markdown). */
export function readPages(root = ".") {
  const missing = [];
  const paths = [];
  for (const base of DIRS) {
    for (const d of readdirSync(join(root, base), { withFileTypes: true }).filter((d) => d.isDirectory())) {
      const p = `${base}/${d.name}/${d.name}.md`;
      (existsSync(join(root, p)) ? paths : missing).push(p);
    }
  }
  for (const p of OWN) (existsSync(join(root, p)) ? paths : missing).push(p);
  const pages = paths.sort().map((path) => {
    const text = readFileSync(join(root, path), "utf8");
    const dir = dirname(path);
    const files = Object.fromEntries(
      readdirSync(join(root, dir), { withFileTypes: true })
        .filter((f) => f.isFile() && !f.name.endsWith(".md") && !f.name.includes(".stories."))
        .map((f) => [`${dir}/${f.name}`, readFileSync(join(root, dir, f.name), "utf8")]),
    );
    return { path, text, files, ...frontMatter(text) };
  });
  return { pages, missing };
}

/** A directory without its page; a page without one of the seven headings or a front matter field. */
export function pageErrors({ pages, missing }) {
  const errors = missing.map((p) => `${p}: missing (every component directory has its page)`);
  for (const { path, keys, data, body } of pages) {
    for (const h of HEADINGS) if (!new RegExp(`^## ${h}$`, "m").test(body)) errors.push(`${path}: no "## ${h}" heading`);
    for (const k of REQUIRED) if (!keys.includes(k)) errors.push(`${path}: front matter has no \`${k}\``);
    for (const k of keys) if (!FIELDS.includes(k)) errors.push(`${path}: front matter field \`${k}\` is not one of ${FIELDS.join(", ")}`);
    const order = keys.filter((k) => FIELDS.includes(k));
    if (order.join() !== FIELDS.filter((k) => order.includes(k)).join()) errors.push(`${path}: front matter is not in the order ${FIELDS.join(", ")}`);
    if (data.status && !STATUS.includes(data.status)) errors.push(`${path}: status "${data.status}" is not ${STATUS.join(" or ")}`);
    for (const a of data.attributes ?? []) if (!/^(data|aria)-[\w-]+$/.test(a)) errors.push(`${path}: attribute "${a}" is not a data-* or ARIA attribute`);
  }
  return errors;
}

/** The published copy mirrors each page as docs/<file name> (06), so two pages may not share a name. */
export function nameErrors(paths) {
  const seen = {};
  for (const p of paths) (seen[basename(p)] ??= []).push(p);
  return Object.values(seen).filter((ps) => ps.length > 1).map((ps) => `${ps.join(" and ")}: one file name, one mirror (docs/${basename(ps[0])})`);
}

// ---------- tokens on a page ----------

/** Properties that are not tokens, declared in CSS, and the tokens their values read (02, "Derived properties"). */
export function derivedProperties(pages, ids) {
  const tokens = new Set(ids.map(cssName));
  const byProp = Object.fromEntries(ids.map((id) => [cssName(id), id]));
  const derived = {};
  for (const page of pages) {
    for (const [file, text] of Object.entries(page.files)) {
      if (!file.endsWith(".css")) continue;
      for (const [, prop, value] of text.matchAll(/(--mx-[\w-]+)\s*:([^;]*);/g)) {
        if (tokens.has(prop)) continue;
        derived[prop] ??= new Set();
        for (const r of reads(value)) if (byProp[r]) derived[prop].add(byProp[r]);
      }
    }
  }
  return derived;
}

/**
 * Read through its custom property → listed. Listed → read: directly, through a derived property
 * the files read, or by its id in a script (07, "Every component page").
 */
export function tokenErrors(pages, ids) {
  const byProp = Object.fromEntries(ids.map((id) => [cssName(id), id]));
  const derived = derivedProperties(pages, ids);
  const errors = [];
  for (const { path, files, data } of pages) {
    const listed = data.tokens ?? [];
    const read = reads(Object.values(files).join("\n"));
    const direct = new Set(read.filter((p) => byProp[p]).map((p) => byProp[p]));
    const viaDerived = new Set(read.flatMap((p) => [...(derived[p] ?? [])]));
    const scripts = Object.entries(files).filter(([f]) => /\.(ts|js|astro)$/.test(f)).map(([, t]) => t).join("\n");
    const byId = (id) => scripts.includes(`"${id}"`) || scripts.includes(`'${id}'`);
    for (const id of direct) if (!listed.includes(id)) errors.push(`${path}: its files read ${id} (${cssName(id)}) and its tokens do not list it`);
    for (const id of listed) {
      if (!byProp[cssName(id)]) errors.push(`${path}: lists ${id}, which is not a token`);
      else if (!direct.has(id) && !viaDerived.has(id) && !byId(id)) errors.push(`${path}: lists ${id}, which its files do not read, directly, through a derived property or by id`);
    }
  }
  return errors;
}

// ---------- generated files ----------

/** The first sentence under "## Purpose". */
export function purpose(body) {
  const para = body.split(/^## Purpose\s*$/m)[1]?.trim().split(/\n\s*\n/)[0].replace(/\s+/g, " ") ?? "";
  return para.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? para;
}

/**
 * Every mx-* class in the stylesheet, and in the Contract: a class the markup carries only for a
 * script (Boot's skip, the status line's way back) has no rule, and the class check must know it too.
 */
export function classes(files, body) {
  const css = Object.entries(files).filter(([f]) => f.endsWith(".css")).map(([, t]) => t).join("\n");
  const contract = body.split(/^## Contract\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  return [...new Set([...names(css).classes, ...names(contract).classes])].sort();
}

export function renderIndex(pages) {
  const entries = pages.map(({ path, files, data, body }) => ({
    name: data.name,
    status: data.status,
    ...(data.class && { class: data.class }),
    ...(data.element && { element: data.element }),
    attributes: data.attributes ?? [],
    tokens: data.tokens ?? [],
    purpose: purpose(body),
    classes: classes(files, body),
    doc: path,
  }));
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return `${JSON.stringify(entries, null, 2)}\n`;
}

export function renderLlms() {
  return `# matrix

> wadakatu's personal design system for wadakatu.dev, the package \`@wadakatu/matrix\`: design tokens, CSS, custom elements and Astro components. These files document the version they ship in. Every link is a path from the package root, which is \`node_modules/@wadakatu/matrix/\` in a repository that installs it.

Before building any UI, search the component index; if a component fits, read its page and use its contract. Colours, type sizes and layers are tokens, read by role, never raw values.

## Docs

- [Agent skill](${SKILL}): how to build UI with matrix. Search first, tokens by role, the seven laws and the check that catches each, adding a component, and a worked example.
- [Component index](docs/components.json): one entry per component page, sorted by name. Each entry holds \`name\`; \`status\` (\`approved\` or \`draft\`); \`class\` and \`element\` where it has one; \`attributes\`, the \`data-*\` and ARIA attributes that are its variants and states; \`tokens\`, every token it reads; \`purpose\`, the first sentence of its page; \`classes\`, every class in its stylesheet and its contract; and \`doc\`, the path of its page.
- [Tokens](docs/tokens.md): every token with its custom property, its value in each of the four contexts, and what it is for.
- [Changelog](CHANGELOG.md): what changed in each version.

## Optional

- [Full reference](llms-full.txt): the skill, the tokens page, the changelog and every component page in one file, for clients that cannot follow links.
- [Token resolver](tokens/matrix.resolver.json): the DTCG 2025.10 resolver; its one modifier is the context.
- [Base tokens](tokens/base.tokens.json): the scales, the same in every context.
${CONTEXTS.map((c) => `- [${c}](tokens/context/${c}.tokens.json): the colours of the ${c} context.`).join("\n")}
`;
}

/** Every page llms.txt and the index lead to, in that order, each under a line with its path. */
export function renderFull(root, pages) {
  const paths = [...MIRRORED, ...JSON.parse(renderIndex(pages)).map((e) => e.doc)];
  return [
    "# matrix: full reference",
    "",
    "Generated by `npm run docs` from the files below; each follows a line with its path from the package root.",
    "",
    ...paths.flatMap((p) => [`<!-- Source: ${p} -->`, "", readFileSync(join(root, p), "utf8").trimEnd(), ""]),
  ].join("\n");
}

export function generate(root = ".") {
  const { pages } = readPages(root);
  return {
    "docs/components.json": renderIndex(pages),
    "llms.txt": renderLlms(),
    "llms-full.txt": renderFull(root, pages),
  };
}

// ---------- checks on what agents read ----------

/** Every relative link target is a file, and in the package. */
export function linkErrors(texts, packed, exists = existsSync) {
  const errors = [];
  for (const [file, text] of Object.entries(texts)) {
    for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^[a-z]+:/.test(target) || target.startsWith("#")) continue;
      const path = target.split("#")[0];
      if (path.startsWith("../") || path.startsWith("/")) errors.push(`${file}: ${target} is not a path from the package root`);
      else if (!packed.has(path)) errors.push(`${file}: ${target} ${exists(path) ? "is not in the package" : "is not a file"}`);
    }
  }
  return errors;
}

/** Tokens (`color.accent`, `--mx-*`) and mx-* classes named in prose exist. */
export function proseErrors(texts, ids, known) {
  const errors = drift(texts, known);
  const family = /^(color|font|space|size|radius|border|layer|motion|breakpoint)\./;
  for (const [file, text] of Object.entries(texts)) {
    for (const [, id] of text.matchAll(/`([a-z][\w-]*(?:\.[\w-]+)*(?:\.\*)?)`/g)) {
      if (!family.test(id)) continue;
      const ok = id.endsWith(".*") ? ids.some((t) => t.startsWith(id.slice(0, -1))) : ids.includes(id);
      if (!ok) errors.push(`${file}: \`${id}\` is not a token`);
    }
  }
  return errors;
}

/** The Agent Skills rules, with the body under 200 lines (07). */
export function skillErrors(text) {
  const { data, body } = frontMatter(text);
  const errors = [];
  if (data.name !== "matrix") errors.push(`${SKILL}: name is "${data.name}", not "matrix" (the directory's name)`);
  if (!data.description) errors.push(`${SKILL}: no description`);
  else if (data.description.length > 1024) errors.push(`${SKILL}: the description is ${data.description.length} characters, over 1024`);
  const lines = body.trimEnd().split("\n").length;
  if (lines >= 200) errors.push(`${SKILL}: the body is ${lines} lines; it stays under 200`);
  return errors;
}

/** AGENTS.md under 100 lines, naming only scripts that exist; CLAUDE.md only imports it. */
export function agentsErrors({ agents, claude, scripts }) {
  const errors = [];
  const lines = agents.trimEnd().split("\n").length;
  if (lines >= 100) errors.push(`AGENTS.md: ${lines} lines; it stays under 100`);
  for (const [, s] of agents.matchAll(/npm run ([\w:-]+)/g)) if (!(s in scripts)) errors.push(`AGENTS.md: \`npm run ${s}\` is not a script in package.json`);
  if (claude.trim() !== "@AGENTS.md") errors.push("CLAUDE.md: must be `@AGENTS.md` and nothing else");
  return errors;
}

/** The files `npm pack` would ship. */
export const packed = (root = ".") =>
  new Set(JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }))[0].files.map((f) => f.path));

// ---------- command ----------

if (import.meta.filename === process.argv[1]) {
  process.chdir(join(import.meta.dirname, ".."));
  const { pages } = readPages();
  const clash = nameErrors([...pages.map((p) => p.path), ...MIRRORED]);
  if (clash.length) {
    for (const e of clash) console.error(`✖ ${e}`);
    process.exit(1);
  }
  const check = process.argv.includes("--check");
  let stale = 0;
  for (const [file, text] of Object.entries(generate())) {
    if (check) {
      const same = existsSync(file) && readFileSync(file, "utf8") === text;
      if (!same) stale++;
      console.log(`${same ? "✔" : "✖"} ${file}${same ? "" : " differs from a fresh build: run `npm run docs` and commit it"}`);
    } else {
      writeFileSync(file, text);
      console.log(`✔ ${file}`);
    }
  }
  if (stale) process.exit(1);
}
