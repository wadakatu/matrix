import TerminalPart from "../../fixtures/TerminalPart.astro";
import md from "./guide.md?raw";
import { contexts, docs, japanese, narrow, hovered, shell } from "../../fixtures/stories.ts";

export default { title: "Chrome/Guide", component: TerminalPart, ...docs(md, { chrome: true }) };

export const Default = { args: { part: "guide" }, ...shell };
/** Without scripts: the sentence and the link; no ×, no hint to type. */
export const Recorded = { args: { part: "guide" } };
export const Hovered = { args: { part: "guide" }, ...shell, ...hovered(".mx-guide-way") };
export const Contexts = { args: { part: "guide" }, parameters: { ...shell.parameters, ...contexts.parameters } };
export const Japanese = { args: { part: "guide" }, ...shell, ...japanese };
/** Below 720px: the sentence is for assistive technology only; one 44px link and the ×. */
export const Narrow = { args: { part: "guide" }, ...shell, ...narrow };
