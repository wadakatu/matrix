import ReadingPart from "../../fixtures/ReadingPart.astro";
import md from "./toc.md?raw";
import { contexts, docs, focused, japanese, narrow } from "../../fixtures/stories.ts";

export default { title: "Reading/Contents", component: ReadingPart, ...docs(md, { chrome: true }) };

type Ctx = { canvasElement: HTMLElement };
/** The section being read, as mx-toc marks it on scroll. */
const reading = {
  play: ({ canvasElement }: Ctx) => {
    for (const toc of canvasElement.querySelectorAll(".mx-toc")) toc.querySelectorAll("a")[3]?.setAttribute("aria-current", "location");
  },
};
const opened = {
  play: ({ canvasElement }: Ctx) => {
    for (const d of canvasElement.querySelectorAll<HTMLDetailsElement>(".mx-toc details")) d.open = true;
  },
};

export const Default = { args: { part: "toc" } };
export const Current = { args: { part: "toc" }, ...reading };
/** Below 1100px: a disclosure, closed. */
export const Narrow = { args: { part: "toc" }, ...narrow };
export const NarrowOpen = { args: { part: "toc" }, ...narrow, ...opened };
export const NarrowFocused = { args: { part: "toc" }, ...narrow, ...focused(".mx-toc-summary") };
export const Contexts = { args: { part: "toc" }, ...contexts, ...reading };
export const Japanese = { args: { part: "toc" }, ...japanese };
