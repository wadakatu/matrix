import TerminalPart from "../../fixtures/TerminalPart.astro";
import md from "./takeover.md?raw";
import { contexts, docs, japanese, narrow, shell } from "../../fixtures/stories.ts";

export default { title: "Terminal/Takeover", component: TerminalPart, ...docs(md, { chrome: true }) };

export const Default = { args: { part: "takeover" }, ...shell };
export const Contexts = { args: { part: "takeover" }, ...shell, ...contexts };
export const Japanese = { args: { part: "takeover" }, ...shell, ...japanese };
export const Narrow = { args: { part: "takeover" }, ...shell, ...narrow };
