// Drift check for code that uses matrix (07, "Drift control"): every --mx-* property it names is a
// token or a property matrix's stylesheet names, and every mx-* class is in docs/components.json.
// No dependency, so a consumer runs it from the installed package:
//   node node_modules/@wadakatu/matrix/scripts/drift.mjs src
// matrix's `npm run check` runs it on src/; in this repository it needs `npm run build` first.
import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { join } from "node:path";

const TEXT = /\.(css|scss|html|astro|md|mdx|js|mjs|ts|jsx|tsx|vue|svelte)$/;
const SKIP = new Set(["node_modules", "dist", ".git"]);

/** The --mx-* properties and mx-* classes a text names: classes in selectors and in class attributes. */
export function names(text) {
  const props = new Set(text.match(/--mx-[\w-]+/g));
  const classes = new Set([...text.matchAll(/\.(mx-[\w-]+)/g)].map((m) => m[1]));
  for (const [, v] of text.matchAll(/\bclass(?:Name)?\s*[=:]\s*\{?\s*["'`]([^"'`]*)/g)) for (const c of v.match(/(?<![\w-])mx-[\w-]+/g) ?? []) classes.add(c);
  return { props, classes };
}

// A name that ends in "-" is a family (`--mx-text-*`, `mx-boot-*` in prose): one member must exist.
const knownIn = (set, name) => (name.endsWith("-") ? [...set].some((k) => k.startsWith(name)) : set.has(name));

/** `files` is { path: text }; `known` is { props: Set, classes: Set }. */
export function drift(files, known) {
  const errors = [];
  for (const [file, text] of Object.entries(files)) {
    const { props, classes } = names(text);
    for (const p of props) if (!knownIn(known.props, p)) errors.push(`${file}: ${p} is not a token or a property matrix declares`);
    for (const c of classes) if (!knownIn(known.classes, c)) errors.push(`${file}: .${c} is not a class in docs/components.json`);
  }
  return errors;
}

/** What the installed matrix knows, from its own files. */
export function known(root = join(import.meta.dirname, "..")) {
  const read = (f) => readFileSync(join(root, f), "utf8");
  const tokens = Object.keys(Object.values(JSON.parse(read("dist/tokens.json")))[0]);
  const props = new Set([...tokens.map((id) => `--mx-${id.replaceAll(".", "-")}`), ...(read("dist/matrix.css").match(/--mx-[\w-]+/g) ?? [])]);
  const classes = new Set(JSON.parse(read("docs/components.json")).flatMap((c) => [c.class, ...c.classes].filter(Boolean)));
  return { props, classes };
}

const walk = (p) => (statSync(p).isDirectory() ? readdirSync(p).filter((f) => !SKIP.has(f)).flatMap((f) => walk(join(p, f))) : TEXT.test(p) ? [p] : []);

// Run, not imported (agent-docs.mjs imports it). realpath: the package may be installed as a link.
if (process.argv[1] && realpathSync(process.argv[1]) === import.meta.filename) {
  const paths = process.argv.slice(2);
  if (!paths.length) {
    console.error("usage: node drift.mjs <file or directory>...");
    process.exit(2);
  }
  const files = Object.fromEntries(paths.flatMap(walk).map((f) => [f, readFileSync(f, "utf8")]));
  const errors = drift(files, known());
  for (const e of errors) console.log(e);
  if (errors.length) process.exit(1);
  console.log(`✔ drift: ${Object.keys(files).length} files, every --mx-* property and mx-* class is matrix's`);
}
