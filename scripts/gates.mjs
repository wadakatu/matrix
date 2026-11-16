// The gates behind `npm run check`, as pure functions over data so that tests can feed each
// one a deliberate violation (tests/gates.test.mjs). scripts/check.mjs runs them on the repo.
import { APCAcontrast, sRGBtoY } from "apca-w3";
import { CONTEXTS, cssName } from "./terrazzo-matrix.mjs";
import { sourceTokens } from "./tokens-doc.mjs";

const X = "dev.wadakatu.matrix";

// ---------- token validity ----------

const hex2 = (n) => Math.round(n * 255).toString(16).padStart(2, "0");

/** Every token has a $description; colour components agree with their hex; contexts define the same IDs. */
export function tokenValidity(sources) {
  const errors = [];
  const { base, contexts } = sourceTokens(sources);
  const all = [["base", base], ...Object.entries(contexts)];
  for (const [file, tokens] of all) {
    for (const [id, t] of Object.entries(tokens)) {
      if (!t.$description?.trim()) errors.push(`${file}: ${id} has no $description`);
      const v = t.$value;
      if (v && typeof v === "object" && v.colorSpace === "srgb" && v.hex) {
        const fromComponents = `#${v.components.map(hex2).join("")}`;
        if (fromComponents !== v.hex.toLowerCase()) errors.push(`${file}: ${id} components give ${fromComponents}, hex says ${v.hex}`);
      }
    }
  }
  const ids = (c) => Object.keys(contexts[c]).sort().join(",");
  for (const c of CONTEXTS) if (ids(c) !== ids(CONTEXTS[0])) errors.push(`${c} does not define the same tokens as ${CONTEXTS[0]}`);
  return errors;
}

// ---------- contrast ----------

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const channel = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
export const luminance = (hex) => {
  const [r, g, b] = rgb(hex).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
export const lc = (fg, bg) => Number(APCAcontrast(sRGBtoY(rgb(fg)), sRGBtoY(rgb(bg))));

/** Known pairs, so that a broken luminance formula cannot pass the gate by passing everything. */
export const SELF_TEST = [
  ["#000000", "#ffffff", 21],
  ["#767676", "#ffffff", 4.54],
  ["#595959", "#ffffff", 7.0],
  ["#777777", "#ffffff", 4.48],
  ["#ffffff", "#ffffff", 1],
];
export function contrastSelfTest(ratioFn = ratio) {
  return SELF_TEST.filter(([a, b, want]) => ratioFn(a, b).toFixed(2) !== want.toFixed(2)).map(
    ([a, b, want]) => `self-test: ${a} on ${b} gave ${ratioFn(a, b).toFixed(2)}, expected ${want.toFixed(2)}`,
  );
}

/** The pairs each token declares in $extensions, the same in every context. */
export function declaredPairs(sources) {
  const tokens = sourceTokens(sources).contexts[CONTEXTS[0]];
  const pairs = [];
  for (const [id, t] of Object.entries(tokens)) {
    const ext = t.$extensions?.[X] ?? {};
    for (const { against, floor } of ext.contrast ?? []) pairs.push({ fg: id, bg: against, floor });
    if (ext.ceiling) pairs.push({ fg: id, bg: ext.ceiling.against, ceiling: ext.ceiling.max });
  }
  return pairs;
}

/** Every declared pair in every context. Returns rows and the failures among them. */
export function contrast(built, pairs) {
  const rows = [];
  for (const p of pairs) {
    for (const c of CONTEXTS) {
      const fg = built[c][p.fg];
      const bg = built[c][p.bg];
      if (!/^#[0-9a-f]{6}$/.test(fg ?? "") || !/^#[0-9a-f]{6}$/.test(bg ?? "")) {
        rows.push({ ...p, context: c, error: `${p.fg} on ${p.bg} in ${c}: not an opaque hex (${fg}, ${bg})` });
        continue;
      }
      const r = ratio(fg, bg);
      // Unrounded, as WCAG compares: 4.499 is under 4.5.
      const ok = p.floor !== undefined ? r >= p.floor : r <= p.ceiling;
      rows.push({ ...p, context: c, ratio: r, lc: lc(fg, bg), ok });
    }
  }
  const failures = rows
    .filter((r) => r.error || !r.ok)
    .map((r) => r.error ?? `${r.fg} on ${r.bg} in ${r.context}: ${r.ratio.toFixed(2)} ${r.floor !== undefined ? `under its floor ${r.floor}` : `over its ceiling ${r.ceiling}`}`);
  return { rows, failures };
}

// ---------- golden values (table M2 in docs/matrix-design/10-verification-log.md) ----------

const M2_COLUMNS = ["phosphor-night", "phosphor-day", "operator-night", "operator-day"];
const role = (name) => `color.${name.trim()}`;

/** Parses table M2: rows "<fg> on <bg>", cells "16.31 (Lc −92.2)", "11.36 (78.5)" or "2.07". */
export function parseM2(markdown) {
  const section = markdown.split(/^## M2\b.*$/m)[1]?.split(/^## /m)[0];
  if (!section) throw new Error("table M2 not found");
  const rows = [];
  for (const line of section.split("\n")) {
    const cells = line.split("|").slice(1, -1).map((s) => s.trim());
    const m = cells[0]?.match(/^([\w.-]+) on ([\w.-]+)$/);
    if (!m || cells.length !== 5) continue;
    const values = Object.fromEntries(
      cells.slice(1).map((cell, i) => {
        const [, r, l] = cell.match(/^([\d.]+)(?: \((?:Lc )?([−-]?[\d.]+)\))?$/) ?? [];
        if (!r) throw new Error(`M2: cannot read "${cell}"`);
        return [M2_COLUMNS[i], { ratio: r, lc: l?.replace("−", "-") }];
      }),
    );
    rows.push({ fg: role(m[1]), bg: role(m[2]), label: cells[0], values });
  }
  return rows;
}

/** Recomputes every cell of M2 from the built tokens; any difference fails. */
export function golden(built, m2) {
  const failures = [];
  const table = [];
  for (const row of m2) {
    const cells = {};
    for (const c of M2_COLUMNS) {
      const fg = built[c][row.fg];
      const bg = built[c][row.bg];
      const want = row.values[c];
      if (!fg || !bg) {
        failures.push(`M2 ${row.label}: ${row.fg} or ${row.bg} is not a token`);
        continue;
      }
      const r = ratio(fg, bg).toFixed(2);
      const l = lc(fg, bg).toFixed(1);
      cells[c] = want.lc === undefined ? r : `${r} (${l.replace("-", "−")})`;
      if (r !== want.ratio) failures.push(`M2 ${row.label} in ${c}: measured ${r}, table says ${want.ratio}`);
      if (want.lc !== undefined && l !== Number(want.lc).toFixed(1)) failures.push(`M2 ${row.label} in ${c}: measured Lc ${l}, table says ${want.lc}`);
    }
    table.push({ label: row.label, cells });
  }
  return { table, failures };
}

// ---------- unknown token ----------

/** Every var(--mx-*) used must be a token or a property declared somewhere in the sources, in CSS or by an element (`setProperty`). */
export function unknownTokens(files, built) {
  const known = new Set(Object.keys(built[CONTEXTS[0]]).map(cssName));
  for (const text of Object.values(files)) for (const [, a, b] of text.matchAll(/(--mx-[\w-]+)\s*:|setProperty\(\s*["'](--mx-[\w-]+)/g)) known.add(a ?? b);
  const errors = [];
  for (const [file, text] of Object.entries(files)) {
    for (const [, name] of text.matchAll(/var\(\s*(--mx-[\w-]+)/g)) if (!known.has(name)) errors.push(`${file}: ${name} is not a token or a declared property`);
  }
  return errors;
}

// ---------- package contents ----------

const ALLOWED = [
  /^package\.json$/,
  /^README\.md$/,
  /^LICENSE$/,
  /^CHANGELOG\.md$/,
  /^AGENTS\.md$/,
  /^docs\/tokens\.md$/,
  /^dist\/(tokens\.css|tokens\.json|tokens\.d\.ts|matrix\.css|fonts\.css)$/,
  /^dist\/fonts\/[\w.-]+\.woff2$/,
  /^dist\/fonts\/[\w-]+\.LICENSE\.txt$/,
  /^tokens\/(matrix\.resolver|base\.tokens|context\/[\w-]+\.tokens)\.json$/,
  /^src\/css\/[\w-]+\.css$/,
  /^dist\/(elements|head\/head|lib\/[\w-]+|strings\/[\w-]+|components\/[\w-]+\/mx-[\w-]+|effects\/[\w-]+\/(mx-)?[\w-]+)\.(js|d\.ts)$/,
  /^src\/components\/[\w-]+\/([\w-]+\.(css|md)|[A-Z]\w*\.astro|mx-[\w-]+\.ts)$/,
  /^src\/effects\/[\w-]+\/([\w-]+\.(css|md|ts)|[A-Z]\w*\.astro)$/,
  /^src\/head\/(head\.ts|Head\.astro)$/,
  /^src\/strings\/[\w-]+\.ts$/,
  /^src\/lib\/[\w-]+\.ts$/,
  /^src\/astro\.ts$/,
];
const REQUIRED = ["dist/elements.js", "dist/head/head.js", "dist/lib/index.js", "dist/strings/index.js", "src/astro.ts", "dist/tokens.css", "dist/tokens.json", "dist/tokens.d.ts", "dist/matrix.css", "dist/fonts.css", "tokens/matrix.resolver.json", "LICENSE",
  // OFL-1.1: each font's copyright notice and licence ships with its files.
  ...["dotgothic16", "ibm-plex-mono", "m-plus-1-code"].map((f) => `dist/fonts/${f}.LICENSE.txt`)];

/** `npm pack --dry-run` lists only intended files, and never the logo. */
export function packageContents(paths) {
  const errors = [];
  for (const p of paths) {
    if (/\.stories\.ts$/.test(p)) errors.push(`${p}: stories are not part of the package`);
    else if (p.startsWith("assets/")) errors.push(`${p}: the logo and its notice must not be in the package (decision Q3)`);
    else if (!ALLOWED.some((re) => re.test(p))) errors.push(`${p}: not an intended package file`);
  }
  for (const r of REQUIRED) if (!paths.includes(r)) errors.push(`${r}: missing from the package`);
  return errors;
}

// ---------- version consistency ----------

/** package.json, the lockfile, the changelog's latest entry and (on a tag) the tag agree. */
export function versionConsistency({ pkg, lock, changelog, tag }) {
  const v = pkg.version;
  const errors = [];
  if (lock.version !== v || lock.packages?.[""]?.version !== v) errors.push(`package-lock.json says ${lock.version}, package.json says ${v}`);
  const latest = changelog.match(/^## \[?([^\]\s]+)\]?/m)?.[1];
  if (latest !== v) errors.push(`CHANGELOG.md's latest entry is ${latest}, package.json says ${v}`);
  if (tag && tag !== `v${v}`) errors.push(`tag ${tag} does not match package version v${v}`);
  return errors;
}

// ---------- freshness ----------

export function freshness(committed, fresh, file) {
  return committed === fresh ? [] : [`${file} differs from a fresh build: run \`npm run docs\` and commit it`];
}
