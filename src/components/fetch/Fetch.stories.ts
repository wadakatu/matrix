import TerminalPart from "../../fixtures/TerminalPart.astro";
import md from "./fetch.md?raw";
import { contexts, docs, japanese, narrow } from "../../fixtures/stories.ts";

export default { title: "Terminal/Fetch card", component: TerminalPart, ...docs(md, { chrome: true }) };

export const Default = { args: { part: "fetch" } };
export const Contexts = { args: { part: "fetch" }, ...contexts };
export const Japanese = { args: { part: "fetch" }, ...japanese };
/** Below 600px the mark stands above the lines. */
export const Narrow = { args: { part: "fetch" }, ...narrow };
