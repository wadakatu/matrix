import ReadingPart from "../../fixtures/ReadingPart.astro";
import md from "./postfoot.md?raw";
import { contexts, docs, japanese, narrow } from "../../fixtures/stories.ts";

export default { title: "Reading/Post foot", component: ReadingPart, ...docs(md, { chrome: true }) };

export const Default = { args: { part: "postfoot" } };
export const Older = { args: { part: "postfoot", pager: "older" } };
export const Both = { args: { part: "postfoot", pager: "both" } };
export const Narrow = { args: { part: "postfoot", pager: "both" }, ...narrow };
export const Contexts = { args: { part: "postfoot", pager: "both" }, ...contexts };
export const Japanese = { args: { part: "postfoot", pager: "both" }, ...japanese };
