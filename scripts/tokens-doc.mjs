// Renders docs/tokens.md from the token sources and dist/tokens.json. `npm run docs` writes it;
// the freshness gate compares the committed file with a fresh render.
import { readFileSync, writeFileSync } from "node:fs";
import { CONTEXTS, cssName } from "./terrazzo-matrix.mjs";

const leaves = (node, path = [], out = {}) => {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("$")) continue;
    if (v && typeof v === "object" && "$value" in v) out[[...path, k].join(".")] = v;
    else if (v && typeof v === "object") leaves(v, [...path, k], out);
  }
  return out;
};

export function readSources(root = ".") {
  const read = (f) => JSON.parse(readFileSync(`${root}/tokens/${f}`, "utf8"));
  return {
    base: read("base.tokens.json"),
    contexts: Object.fromEntries(CONTEXTS.map((c) => [c, read(`context/${c}.tokens.json`)])),
  };
}

export const sourceTokens = (sources) => ({
  base: leaves(sources.base),
  contexts: Object.fromEntries(Object.entries(sources.contexts).map(([c, tree]) => [c, leaves(tree)])),
});

const cell = (s) => String(s).replaceAll("|", "\\|");

export function renderTokensDoc(sources, built) {
  const { base, contexts } = sourceTokens(sources);
  const colour = contexts["phosphor-night"];
  const lines = [
    "# Tokens",
    "",
    "Generated from `tokens/` by `npm run docs`. Do not edit; `npm run check` fails when this",
    "file differs from a fresh build. Values are the CSS values in `dist/tokens.json`.",
    "",
    "## Colour roles",
    "",
    `| Token | Custom property | ${CONTEXTS.join(" | ")} | Description |`,
    `| --- | --- | ${CONTEXTS.map(() => "---").join(" | ")} | --- |`,
    ...Object.keys(colour).sort().map((id) =>
      `| \`${id}\` | \`${cssName(id)}\` | ${CONTEXTS.map((c) => `\`${cell(built[c][id])}\``).join(" | ")} | ${cell(colour[id].$description)} |`),
    "",
    "## Scales",
    "",
    "| Token | Custom property | Value | Description |",
    "| --- | --- | --- | --- |",
    ...Object.keys(base).sort().map((id) =>
      `| \`${id}\` | \`${cssName(id)}\` | \`${cell(built["phosphor-night"][id])}\` | ${cell(base[id].$description)} |`),
    "",
  ];
  return lines.join("\n");
}

if (process.argv[2] === "--write") {
  writeFileSync("docs/tokens.md", renderTokensDoc(readSources(), JSON.parse(readFileSync("dist/tokens.json", "utf8"))));
  console.log("✔ docs/tokens.md");
}
