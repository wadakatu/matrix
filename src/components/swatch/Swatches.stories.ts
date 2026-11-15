import TerminalPart from "../../fixtures/TerminalPart.astro";
import md from "./swatch.md?raw";
import { contexts, docs, japanese, narrow } from "../../fixtures/stories.ts";

export default { title: "Terminal/Swatches", component: TerminalPart, ...docs(md, { chrome: true }) };

export const Default = { args: { part: "swatches" } };
export const Contexts = { args: { part: "swatches" }, ...contexts };
export const Japanese = { args: { part: "swatches" }, ...japanese };
