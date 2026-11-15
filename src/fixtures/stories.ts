// What every component's stories share (06, "Required stories").
import { fixture } from "./corpus.ts";
import { demo } from "./terminal.ts";

export { fixture };

/**
 * The Docs page renders the component's own <name>.md; the same text is the contract the test reads.
 * `chrome`: the component takes `lang` and renders chrome strings, so the Language global sets it.
 */
export const docs = (md: string, { chrome = false } = {}) => ({
  tags: ["autodocs"],
  parameters: { docs: { description: { component: md } }, contract: md, chrome },
});
/** The component four times in one frame, one per context. Visual regression captures it. Framed in preview.ts. */
export const contexts = { parameters: { contexts: true } };
/** Japanese content, `lang="ja"` on the root and the Japanese chrome strings. */
export const japanese = { globals: { language: "ja" } };
/** Contexts for a fixed layer: each scope holds it and has a height. */
export const framed = { parameters: { contexts: true, framed: true } };
/** Motion off: the still (L4). */
export const still = { globals: { motion: "off" } };
/** At 390 wide, for a component that changes shape there. */
export const narrow = { globals: { viewport: { value: "narrow", isRotated: false } } };

type Play = { play: (c: { canvasElement: HTMLElement }) => void };
/** Focused: real focus, as the keyboard leaves it (`:focus-visible`), on the first match in each frame. */
export const focused = (selector: string): Play => ({
  play: ({ canvasElement }) => canvasElement.querySelector<HTMLElement>(selector)?.focus(),
});
/**
 * Hovered: a still cannot hold a pointer, so each `:hover` rule in the page's stylesheets is copied
 * once with `[data-sb-hover]` in its place, and the first match carries the attribute.
 */
export const hovered = (selector: string): Play => ({
  play: ({ canvasElement }) => {
    if (!document.documentElement.hasAttribute("data-sb-hover-rules")) {
      document.documentElement.setAttribute("data-sb-hover-rules", "");
      const found: [CSSStyleRule, CSSStyleSheet | CSSGroupingRule][] = [];
      const walk = (list: CSSRuleList, parent: CSSStyleSheet | CSSGroupingRule) => {
        for (const r of list) {
          if (r instanceof CSSStyleRule && r.selectorText.includes(":hover")) found.push([r, parent]);
          else if (r instanceof CSSGroupingRule) walk(r.cssRules, r);
        }
      };
      for (const sheet of document.styleSheets) walk(sheet.cssRules, sheet);
      for (const [r, parent] of found) parent.insertRule(r.cssText.replaceAll(":hover", "[data-sb-hover]"), parent.cssRules.length);
    }
    canvasElement.querySelector(selector)?.setAttribute("data-sb-hover", "");
  },
});

/** The live shell: the play function gives every terminal in the story the demo interpreter (4.2). */
export const live: Play = {
  play: ({ canvasElement }) => {
    for (const t of canvasElement.querySelectorAll<HTMLElement & { interpreter: unknown }>("mx-terminal")) t.interpreter = demo();
  },
};
/** A part that only shows in a live shell (the prompt, the chips, the guide's ×): the root says it is live. */
export const shell = { parameters: { shell: "live" } };
