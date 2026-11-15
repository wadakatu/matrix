// The data behind Storybook's Foundations pages, from dist/tokens.json and the token sources.
// The contrast rows are the contrast gate's own output (gates.contrast over the declared pairs),
// so the Colour page cannot show a ratio the gate did not compute (06). Written by .storybook/main.ts.
import { writeFileSync } from "node:fs";
import { CONTEXTS, cssName } from "./terrazzo-matrix.mjs";
import { readSources, sourceTokens } from "./tokens-doc.mjs";
import { contrast, declaredPairs } from "./gates.mjs";
import { strings } from "../dist/strings/index.js";
import { readFileSync } from "node:fs";

export function foundations(root = ".") {
  const built = JSON.parse(readFileSync(`${root}/dist/tokens.json`, "utf8"));
  const sources = readSources(root);
  const { base, contexts } = sourceTokens(sources);
  const roles = Object.keys(contexts[CONTEXTS[0]]).sort();
  const token = (id, t) => ({ id, css: cssName(id), value: built[CONTEXTS[0]][id], description: t.$description });
  const group = (prefix) => Object.entries(base).filter(([id]) => id.startsWith(prefix)).map(([id, t]) => token(id, t));
  const { rows } = contrast(built, declaredPairs(sources));
  return {
    contexts: CONTEXTS,
    colour: roles.map((id) => ({ ...token(id, contexts[CONTEXTS[0]][id]), values: Object.fromEntries(CONTEXTS.map((c) => [c, built[c][id]])) })),
    contrast: rows.map((r) => ({ fg: r.fg, bg: r.bg, context: r.context, rule: r.floor !== undefined ? `≥ ${r.floor}` : `≤ ${r.ceiling}`, ratio: r.ratio.toFixed(2), lc: r.lc.toFixed(1), ok: r.ok })),
    type: group("font."),
    space: [...group("space."), ...group("size."), ...group("border."), ...group("radius."), ...group("breakpoint.")],
    motion: [...group("motion."), ...group("layer.")],
    strings: { en: strings.en, ja: strings.ja },
  };
}

export const write = (root = ".") => writeFileSync(`${root}/.storybook/foundations.json`, JSON.stringify(foundations(root), null, 2));
if (process.argv[1] === import.meta.filename) write();
