import ReadingPart from "../../fixtures/ReadingPart.astro";
import md from "./share.md?raw";
import { contexts, docs, japanese } from "../../fixtures/stories.ts";

export default { title: "Reading/Share", component: ReadingPart, ...docs(md, { chrome: true }) };

/** Where navigator.share exists, mx-share shows the sheet button too. */
const sheet = {
  play: ({ canvasElement }: { canvasElement: HTMLElement }) => {
    for (const b of canvasElement.querySelectorAll<HTMLButtonElement>('button[data-share="sheet"]')) b.hidden = false;
  },
};
export const Default = { args: { part: "share" } };
export const WithSheet = { args: { part: "share" }, ...sheet };
export const Contexts = { args: { part: "share" }, ...contexts };
export const Japanese = { args: { part: "share" }, ...japanese };
