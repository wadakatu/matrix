import CodeDemo from "../../fixtures/CodeDemo.astro";
import md from "./code.md?raw";
import { contexts, docs, focused, japanese, narrow } from "../../fixtures/stories.ts";

export default { title: "Reading/Code block", component: CodeDemo, ...docs(md, { chrome: true }) };

/** Copy, the moment after a press: what mx-copy shows for 1.6s. */
const copied = {
  play: ({ canvasElement }: { canvasElement: HTMLElement }) => {
    for (const c of canvasElement.querySelectorAll<HTMLElement>("mx-copy")) {
      const b = c.querySelector("button")!;
      b.textContent = c.dataset.copied ?? "";
      b.dataset.done = "";
    }
  },
};

export const Default = { args: { kind: "default" } };
/** No language: the tab reads plaintext. */
export const Plaintext = { args: { kind: "plaintext" } };
export const Copied = { args: { kind: "default" }, ...copied };
export const CopyFocused = { args: { kind: "default" }, ...focused(".mx-copy button") };
/** Draft: a file name in the tab's place. */
export const Titled = { args: { kind: "titled" } };
/** Draft: signs and weight, no hue. */
export const Diff = { args: { kind: "diff" } };
export const TitledDiff = { args: { kind: "titled-diff" } };
/** The 34-character title at 390: it wraps, clear of Copy. */
export const Narrow = { args: { kind: "titled-diff" }, ...narrow };
export const Contexts = { args: { kind: "all" }, ...contexts };
export const Japanese = { args: { kind: "default" }, ...japanese };
