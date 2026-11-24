import ReadingPart from "../../fixtures/ReadingPart.astro";
import md from "./details.md?raw";
import { articles } from "../../fixtures/articles.ts";
import { contexts, docs, focused, japanese, narrow } from "../../fixtures/stories.ts";

export default { title: "Reading/Details", component: ReadingPart, ...docs(md, { chrome: true }) };

const [closed, holding] = articles.c.body.filter((b) => "details" in b);
export const Default = { args: { part: "prose", blocks: [closed] } };
export const Open = { args: { part: "prose", blocks: [{ ...closed, open: true }] } };
/** Open, holding a code block and a callout. */
export const WithCode = { args: { part: "prose", blocks: [holding] } };
export const Focused = { args: { part: "prose", blocks: [closed] }, ...focused(".mx-details-summary") };
export const Narrow = { args: { part: "prose", blocks: [closed, holding] }, ...narrow };
export const Contexts = { args: { part: "prose", blocks: [closed, holding] }, ...contexts };
export const Japanese = { args: { part: "prose", blocks: [closed, holding] }, ...japanese };
