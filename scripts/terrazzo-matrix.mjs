// Terrazzo plugin that writes matrix's token outputs. Stock @terrazzo/plugin-css writes one
// block per permutation and cannot pair day and night in light-dark() (spike S2), so this
// asks the resolver for each context and writes the shape defined in 03.
import { transformCSSValue } from "@terrazzo/token-tools/css";

export const CONTEXTS = ["phosphor-night", "phosphor-day", "operator-night", "operator-day"];
export const cssName = (id) => `--mx-${id.replaceAll(".", "-")}`;

export default function matrix() {
  return {
    name: "matrix",
    build({ resolver, outputFile }) {
      const sets = Object.fromEntries(CONTEXTS.map((c) => [c, resolver.apply({ context: c })]));
      const options = (c) => ({
        tokensSet: sets[c],
        transformAlias: (t) => `var(${cssName(t.id)})`,
        color: { legacyHex: true },
        permutation: { context: c },
      });
      const css = (c, id) => transformCSSValue(sets[c][id], options(c));
      // tokens.json is for scripts, so aliases are resolved to values.
      const value = (c, id) => transformCSSValue({ ...sets[c][id], aliasOf: undefined, aliasChain: undefined }, options(c));

      const ids = Object.keys(sets["phosphor-night"]).sort();
      const colors = ids.filter((id) => sets["phosphor-night"][id].$type === "color");
      const scales = ids.filter((id) => !colors.includes(id));
      const rule = (selector, decls, indent = "  ") =>
        `${indent}${selector} {\n${decls.map(([id, v]) => `${indent}  ${cssName(id)}: ${v};`).join("\n")}\n${indent}}`;
      const night = (p) => colors.map((id) => [id, css(`${p}-night`, id)]);
      const pair = (p) =>
        colors.map((id) => {
          const day = css(`${p}-day`, id);
          const nite = css(`${p}-night`, id);
          return [id, day === nite ? nite : `light-dark(${day}, ${nite})`];
        });

      outputFile(
        "tokens.css",
        `/* Generated from tokens/ by \`npm run build\`. Do not edit. */
@layer mx.tokens {
${rule(":root", scales.map((id) => [id, css("phosphor-night", id)]))}

  /* 1. Night values, for every engine. */
${rule(':root, [data-palette="phosphor"]', night("phosphor"))}
${rule('[data-palette="operator"]', night("operator"))}
  :root, [data-theme="night"] { color-scheme: dark; }

  /* 2. Both themes, where light-dark() exists. */
  @supports (color: light-dark(#000, #fff)) {
${rule(':root, [data-palette="phosphor"]', pair("phosphor"), "    ")}
${rule('[data-palette="operator"]', pair("operator"), "    ")}
    [data-theme="day"] { color-scheme: light; }
  }
}
`,
      );
      const json = Object.fromEntries(CONTEXTS.map((c) => [c, Object.fromEntries(ids.map((id) => [id, value(c, id)]))]));
      outputFile("tokens.json", `${JSON.stringify(json, null, 2)}\n`);
      outputFile(
        "tokens.d.ts",
        `export type MxContext =\n${CONTEXTS.map((c) => `  | ${JSON.stringify(c)}`).join("\n")};\n` +
          `export type MxToken =\n${ids.map((id) => `  | ${JSON.stringify(id)}`).join("\n")};\n`,
      );
    },
  };
}
