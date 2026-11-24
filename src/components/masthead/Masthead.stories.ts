import ReadingPart from "../../fixtures/ReadingPart.astro";
import md from "./masthead.md?raw";
import { contexts, docs, japanese, narrow, still } from "../../fixtures/stories.ts";

export default { title: "Reading/Masthead", component: ReadingPart, ...docs(md, { chrome: true }) };

export const Default = { args: { part: "masthead" } };
/** The blog's index: the title, then a meta line. */
export const Index = { args: { part: "index-head" } };
export const Still = { args: { part: "masthead" }, ...still };
/** Below 720px: no strip; the title in four lines. */
export const Narrow = { args: { part: "masthead" }, ...narrow };
export const Contexts = { args: { part: "masthead" }, ...contexts };
export const Japanese = { args: { part: "masthead" }, ...japanese };
