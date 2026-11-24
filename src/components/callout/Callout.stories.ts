import ReadingPart from "../../fixtures/ReadingPart.astro";
import md from "./callout.md?raw";
import { articles } from "../../fixtures/articles.ts";
import { contexts, docs, japanese, narrow } from "../../fixtures/stories.ts";

export default { title: "Reading/Callout", component: ReadingPart, ...docs(md, { chrome: true }) };

const callouts = articles.c.body.filter((b) => "callout" in b);
export const Default = { args: { part: "prose", blocks: [callouts[0]] } };
export const Alert = { args: { part: "prose", blocks: [callouts[1]] } };
/** Holding a list and a code block. */
export const WithList = { args: { part: "prose", blocks: [callouts[2]] } };
export const Narrow = { args: { part: "prose", blocks: callouts.slice(0, 2) }, ...narrow };
export const Contexts = { args: { part: "prose", blocks: callouts }, ...contexts };
export const Japanese = { args: { part: "prose", blocks: callouts.slice(0, 2) }, ...japanese };
