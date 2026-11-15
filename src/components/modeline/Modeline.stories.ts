import TerminalPart from "../../fixtures/TerminalPart.astro";
import md from "./modeline.md?raw";
import { contexts, docs, japanese, narrow, focused } from "../../fixtures/stories.ts";

export default { title: "Chrome/Status line", component: TerminalPart, ...docs(md, { chrome: true }) };

export const Default = { args: { part: "modeline" }, live: true };
/** Without scripts: `recorded session`. */
export const Recorded = { args: { part: "modeline" } };
export const Focused = { args: { part: "modeline", live: true }, ...focused(".mx-modeline-way") };
export const Contexts = { args: { part: "modeline", live: true }, ...contexts };
export const Japanese = { args: { part: "modeline", live: true }, ...japanese };
export const Narrow = { args: { part: "modeline", live: true }, ...narrow };
