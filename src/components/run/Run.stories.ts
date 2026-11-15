import TerminalPart from "../../fixtures/TerminalPart.astro";
import md from "./run.md?raw";
import { contexts, docs, japanese, narrow, hovered } from "../../fixtures/stories.ts";

export default { title: "Terminal/Run", component: TerminalPart, ...docs(md, { chrome: true }) };

export const Default = { args: { part: "run" } };
export const Hovered = { args: { part: "run" }, ...hovered(".mx-run") };
export const Contexts = { args: { part: "run" }, ...contexts };
export const Japanese = { args: { part: "run" }, ...japanese };
