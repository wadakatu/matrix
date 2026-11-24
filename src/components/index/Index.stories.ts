import ReadingPart from "../../fixtures/ReadingPart.astro";
import md from "./index.md?raw";
import { contexts, docs, japanese, narrow } from "../../fixtures/stories.ts";

export default { title: "Reading/Index", component: ReadingPart, ...docs(md, { chrome: true }) };

export const Default = { args: { part: "index" } };
export const Narrow = { args: { part: "index" }, ...narrow };
export const Contexts = { args: { part: "index" }, ...contexts };
export const Japanese = { args: { part: "index" }, ...japanese };
