import TerminalPart from "../../fixtures/TerminalPart.astro";
import md from "./login.md?raw";
import { contexts, docs, japanese, narrow } from "../../fixtures/stories.ts";

export default { title: "Terminal/Login card", component: TerminalPart, ...docs(md, { chrome: true }) };

export const Default = { args: { part: "login" } };
/** Below 720px: closed, one 44px summary. */
export const Narrow = { args: { part: "login" }, ...narrow };
export const NarrowOpen = { args: { part: "login", open: true }, ...narrow };
export const Contexts = { args: { part: "login" }, ...contexts };
export const Japanese = { args: { part: "login" }, globals: { ...narrow.globals, ...japanese.globals } };
