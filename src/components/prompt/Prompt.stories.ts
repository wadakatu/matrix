import TerminalPart from "../../fixtures/TerminalPart.astro";
import md from "./prompt.md?raw";
import { contexts, docs, japanese, narrow, focused, shell, still } from "../../fixtures/stories.ts";

export default { title: "Terminal/Prompt", component: TerminalPart, ...docs(md, { chrome: true }) };

export const Default = { args: { part: "prompt" }, ...shell };
/** Focused: the block cursor is lit; it is the field's focus indicator. */
export const Focused = { args: { part: "prompt" }, ...shell, ...focused(".mx-prompt-field input") };
export const Still = { args: { part: "prompt" }, ...shell, ...still, ...focused(".mx-prompt-field input") };
export const Contexts = { args: { part: "prompt" }, ...shell, ...contexts };
export const Japanese = { args: { part: "prompt" }, ...shell, ...japanese };
/** Below 720px the path takes its own line and $ starts the next. */
export const Narrow = { args: { part: "prompt" }, ...shell, ...narrow };
