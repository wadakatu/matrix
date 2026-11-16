// @wadakatu/matrix/lib: build-time helpers (01). All pure: each takes the site's corpus as an
// argument and holds no words of its own (L1). Ported from the prototype's `_lib.ts` and `_Stream.astro`.

/** Hiragana, katakana and CJK ideographs: what makes a run Japanese. */
const JA = /[぀-ヿ㐀-鿿]/;
export const hasJa = (s: string): boolean => JA.test(s);

/** A Latin sentence that ends in Japanese, split where the Japanese starts, so that part can carry `lang="ja"`. */
export function splitJa(s: string): [string, string] {
  const i = s.search(JA);
  return i < 0 ? [s, ""] : [s.slice(0, i).trim(), s.slice(i)];
}

/** Characters outside the Basic Multilingual Plane (emoji) have no dot-matrix glyph, so they are dropped. */
export const bmp = (s: string): string => Array.from(s).filter((c) => c.codePointAt(0)! < 0x10000).join("").trim();

/** The film-name filter (L1): a phrase that names the film is left out of everything. */
export const usable = (s: string): boolean => !/matrix/i.test(s);

/** The corpus as decoration may use it: film-named phrases out, emoji dropped, empty phrases gone. */
export const corpus = (phrases: readonly string[]): string[] => phrases.filter(usable).map(bmp).filter(Boolean);

/** mulberry32, so every build lays the decoration out the same way. */
export function rng(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A phrase in pieces of at most `n` characters (code points, so kana are never split in half). */
export function chunk(s: string, n = 22): string[] {
  const cs = Array.from(s);
  const out: string[] = [];
  for (let i = 0; i < cs.length; i += n) out.push(cs.slice(i, i + n).join("").trim());
  return out.filter(Boolean);
}

/** Japanese and Latin phrases alternate, so kana and kanji are always on screen. */
function mixer(phrases: readonly string[]): (i: number) => string {
  const ja = phrases.filter(hasJa);
  const latin = phrases.filter((p) => !hasJa(p));
  const pick = (list: readonly string[], i: number) => list[i % list.length];
  return (i) => {
    if (!ja.length || !latin.length) return pick(phrases, i * 5);
    return i % 2 ? pick(latin, i * 7) : pick(ja, i * 5);
  };
}

export interface RainDrop {
  text: string;
  ja: boolean;
  /** The column's fall, in seconds. */
  t: number;
  /** Negative delay, in seconds, so drops start spread down the column. */
  d: number;
  /** The still: where the drop is parked, as a percentage of the document height. */
  rest: number;
}
export interface RainColumn {
  /** Left edge, as a percentage of the width. */
  x: number;
  drops: RainDrop[];
}
export interface RainOptions {
  count?: number;
  perColumn?: number;
  seed?: number;
  /** One column's fall, seconds: `motion.rain.duration.min` / `.max`. */
  min?: number;
  max?: number;
  /** Glyphs per drop. */
  glyphs?: number;
}

/** The ambient rain: columns of drops, each drop one piece of one real phrase (04, "Rain"). */
export function rainColumns(phrases: readonly string[], o: RainOptions = {}): RainColumn[] {
  const { count = 40, perColumn = 3, seed = 20261113, min = 9, max = 21, glyphs = 20 } = o;
  const mixed = mixer(corpus(phrases));
  const r = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    // One speed per column and evenly spaced starts, so drops in a column never run into each other.
    const t = +(min + r() * (max - min)).toFixed(1);
    const phase = r();
    return {
      x: +(((i + 0.5) / count) * 100).toFixed(2),
      drops: Array.from({ length: perColumn }, (_, j) => {
        const parts = chunk(mixed(Math.floor(r() * 997) + i + j), glyphs);
        const text = parts[Math.floor(r() * parts.length)];
        const at = (j + phase) / perColumn;
        return { text, ja: hasJa(text), t, d: +(-at * t).toFixed(1), rest: Math.round(at * 96) };
      }),
    };
  });
}

export interface Strand {
  drops: { text: string; ja: boolean; t: number; d: number; rest: number }[];
}
/**
 * A stream's strands: two short drops of each of its own texts, half a cycle apart, so they follow
 * each other without touching. `index` seeds the stream; `min` / `max` are `motion.strand.duration.*`.
 */
export function streamStrands(texts: readonly string[], index: number, { min = 5, max = 11 } = {}): Strand[] {
  const r = rng(index + 1);
  return corpus(texts).map((s) => {
    const parts = chunk(s, 10).slice(0, 2);
    const t = +(min + r() * (max - min)).toFixed(1);
    const phase = r();
    return {
      drops: parts.map((text, k) => ({ text, ja: hasJa(text), t, d: +(-(phase + k / 2) * t).toFixed(1), rest: Math.round(phase * 45) })),
    };
  });
}

/** The curtain that covers the page as the boot ends: slabs of running corpus text. */
export function curtainSlabs(phrases: readonly string[], { count = 24, glyphs = 260, seed = 1999 } = {}): string[] {
  const mixed = mixer(corpus(phrases));
  const r = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    let s = "";
    for (let k = Math.floor(r() * 997) + i; Array.from(s).length < glyphs; k++) s += mixed(k).replace(/\s+/g, "");
    return Array.from(s).slice(0, glyphs).join("");
  });
}

/** Glyph pools for decode, read off the corpus: full-width for Japanese, half-width for Latin. */
export function glyphPools(phrases: readonly string[]): { wide: string; narrow: string } {
  const all = Array.from(corpus(phrases).join(""));
  const uniq = (re: RegExp) => [...new Set(all.filter((c) => re.test(c)))].join("");
  return { wide: uniq(JA), narrow: uniq(/[A-Za-z0-9]/) };
}

const WIDE = /[぀-ヿ㐀-鿿＀-￯]/;
/**
 * One frame of decode: `text` with its first `p` share settled and the rest still raw glyphs from
 * the pools. Deterministic in `tick`, so a still repeats. Spaces stay spaces.
 */
export function decodeFrame(text: string, p: number, tick: number, pools: { wide: string; narrow: string }, allWide = false): string {
  const cs = Array.from(text);
  const n = Math.round(cs.length * p);
  const wide = Array.from(pools.wide);
  const narrow = Array.from(pools.narrow);
  return cs
    .map((c, i) => {
      if (i < n || c === " ") return c;
      const pool = allWide || WIDE.test(c) ? wide : narrow;
      return pool.length ? pool[(i * 131 + tick * 71 + cs.length * 17) % pool.length] : c;
    })
    .join("");
}

/** The reading change's first step: each character becomes a hex digit of its own code point. */
export function hexFrame(text: string, p: number): string {
  return Array.from(text)
    .map((c, i) => ((i * 0.618) % 1 < p && !/\s/.test(c) ? c.codePointAt(0)!.toString(16).at(i % 2 ? -1 : 0)! : c))
    .join("");
}

/**
 * The giant name's mask (04, "Name"): opaque, with lines of the site's own text cut out of it. An SVG
 * image, so the cut-outs are set in the reader's system monospace. Returns a CSS `url()`.
 */
export function nameMask(lines: readonly string[], { rows = 26, width = 150 } = {}): string {
  const src = corpus(lines);
  const out: string[] = [];
  for (let i = 0, k = 0; i < rows && src.length; i++) {
    let s = "";
    while (Array.from(s).length < width) s += src[k++ % src.length] + "  ";
    out.push(s);
  }
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const lh = 13;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${out.length * lh}">` +
    `<mask id="m"><rect width="100%" height="100%" fill="#fff"/>` +
    `<g font-family="ui-monospace,Menlo,Consolas,monospace" font-size="10.5" font-weight="700" fill="#000">` +
    out.map((l, i) => `<text x="${-(i * 37) % 90}" y="${(i + 1) * lh - 3}">${esc(l)}</text>`).join("") +
    `</g></mask><rect width="100%" height="100%" mask="url(#m)"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export * from "./terminal.ts";
export { demoInterpreter, type DemoWorld } from "./demo.ts";
