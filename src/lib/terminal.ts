// The terminal's contract and its one renderer (04, "Terminal"). The site supplies an interpreter;
// matrix prints what it returns. `render` turns output items into markup, and the same function
// prints the recorded session at build time and live output in the browser, so the two cannot
// disagree. Text is always escaped, and a link exists only where the interpreter returned one:
// nothing a reader typed (including through `?run=`) ever becomes markup or a link.

/** A tone on a run of text: muted, lit (accent), or a directory. */
export type Tone = "dim" | "hi" | "dir";
/**
 * One segment of a line: text, text with a tone, a link, a tappable command, or the eight theme
 * colours (the swatches of the fetch card).
 */
export type Seg = string | { text: string; tone?: Tone; href?: string; run?: string } | { swatches: true };
export type Line = Seg | Seg[];
/** A card: an image (the mark) with lines set beside it, as neofetch prints. */
export interface Card {
  card: { src: string; alt: string; width: number; height: number };
  lines?: Line[];
}
export type Item = Line | Card;
/** A full-screen view inside the screen (the site's `vim`); the prompt is its command line. */
export interface Takeover {
  /** The process name the status line shows while it is open. */
  name: string;
  lines: string[];
  message: string;
  /** Said once in the status region when it opens: how to leave. */
  announce?: string;
}
/** Requests the terminal carries out. Unknown ones are ignored. */
export interface Effects {
  open?: string;
  exit?: boolean;
  clear?: boolean;
  theme?: "day" | "night";
  palette?: "operator" | "phosphor";
  /** Open or update the takeover; `null` closes it. */
  takeover?: Takeover | null;
  overlay?: "rain";
  navigate?: string;
}
export interface Result {
  out: Item[];
  fx?: Effects;
}
export interface Prompt {
  user: string;
  host: string;
  cwd: string;
  /** The process name in the status line when nothing else runs. */
  shell?: string;
}
/** What the site supplies. The interpreter touches nothing: it returns output and asks for effects. */
export interface Interpreter {
  prompt(): Prompt;
  /** Lines printed on login. */
  motd(): Item[];
  exec(line: string): Result;
  /** Tab: candidates for the last word of `line`, each ending in a space or `/`. */
  complete(line: string): string[];
  /** A key pressed while a takeover is open, outside its command line: `Escape`, `C-c` or one character. */
  key?(k: string): Result;
}

export const isCard = (i: Item): i is Card => typeof i === "object" && i !== null && !Array.isArray(i) && "card" in i;
export const segs = (l: Line): Seg[] => (Array.isArray(l) ? l : [l]);
/** The prompt as printed before the field: `user@host:cwd$`. */
export const promptText = (p: Prompt): string => `${p.user}@${p.host}:${p.cwd}$`;

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escape = (s: string): string => String(s).replace(/[&<>"']/g, (c) => ESC[c]);
/** Runs of Japanese carry `lang="ja"` (L6): [latin, japanese, latin, …], the prototype's split. */
const jaRuns = (s: string) => s.split(/([　-ヿ㐀-鿿＀-￯]+)/);
const text = (s: string) => jaRuns(s).map((part, i) => (i % 2 ? `<span lang="ja">${escape(part)}</span>` : escape(part))).join("");
/** Only these schemes, or an address on the same site, may become a link. */
const safe = (href: string) => !/^[a-z][a-z\d+.-]*:/i.test(href) || /^(https?|mailto):/i.test(href);
/** The eight theme colours, in the prototype's order. */
export const SWATCHES = ["panel", "rule", "rain-tail", "rain-body", "muted", "text", "lead", "accent"] as const;

export interface RenderOptions {
  /** Said after a link's text, because links in the shell open a new tab (05). */
  newTab: string;
}

function seg(s: Seg, o: RenderOptions): string {
  if (typeof s === "string") return text(s);
  if ("swatches" in s) return `<span class="mx-swatches" aria-hidden="true">${SWATCHES.map((w) => `<span class="mx-swatch" data-swatch="${w}"></span>`).join("")}</span>`;
  const tone = s.tone ? ` data-tone="${escape(s.tone)}"` : "";
  if (s.href && safe(s.href)) {
    // A new tab keeps the session; mail opens the mail program and needs no tab.
    const tab = /^mailto:/i.test(s.href) ? "" : ` target="_blank" rel="noopener"`;
    const note = tab ? `<span class="mx-vh">${escape(o.newTab)}</span>` : "";
    return `<a href="${escape(s.href)}"${tab}${tone}>${text(s.text)}${note}</a>`;
  }
  // A command you can tap. Not a tab stop: a listing would otherwise add one per file name.
  if (s.run) return `<button class="mx-run" type="button" tabindex="-1" data-run="${escape(s.run)}"${tone}>${text(s.text)}</button>`;
  return s.tone ? `<span${tone}>${text(s.text)}</span>` : text(s.text);
}

const line = (l: Line, o: RenderOptions) => `<div class="mx-ln">${segs(l).map((s) => seg(s, o)).join("")}</div>`;

/** Output items as markup: one `.mx-ln` per line, a `.mx-fetch` per card. */
export function render(items: readonly Item[], o: RenderOptions): string {
  return items
    .map((i) => {
      if (!isCard(i)) return line(i, o);
      const { src, alt, width, height } = i.card;
      const side = i.lines?.length ? `<div class="mx-fetch-side">${i.lines.map((l) => line(l, o)).join("")}</div>` : "";
      // The mark is always the real file, whole and square (L5). It is never drawn out of characters.
      return `<div class="mx-fetch"><img class="mx-logo mx-fetch-mark" src="${escape(src)}" alt="${escape(alt)}" width="${+width}" height="${+height}" />${side}</div>`;
    })
    .join("");
}

/** A command as it stands in the scrollback: its prompt (hidden from assistive technology), then what was typed, as text. */
export const renderEcho = (p: Prompt, cmd: string, tail = ""): string =>
  `<div class="mx-ln mx-ln-echo"><span class="mx-prompt-ps" aria-hidden="true">${escape(promptText(p))}</span> ${text(cmd + tail)}</div>`;

/** The login card: the first command and its card as a `<details>`, closed below 720px (04, "Login card"). */
export const renderLogin = (summary: string, name: string, inner: string): string =>
  `<details class="mx-login"><summary class="mx-login-summary" aria-label="${escape(name)}">${escape(summary)}</summary>${inner}</details>`;
