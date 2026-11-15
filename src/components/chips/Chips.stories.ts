import TerminalPart from "../../fixtures/TerminalPart.astro";
import md from "./chips.md?raw";
import { contexts, docs, japanese, narrow, hovered, shell } from "../../fixtures/stories.ts";

export default { title: "Terminal/Chips", component: TerminalPart, ...docs(md, { chrome: true }) };

export const Default = { args: { part: "chips" }, ...shell };
export const Hovered = { args: { part: "chips" }, ...shell, ...hovered('.mx-chip[data-run="ls"]') };
export const Contexts = { args: { part: "chips" }, parameters: { ...shell.parameters, ...contexts.parameters } };
export const Japanese = { args: { part: "chips" }, ...shell, ...japanese };
export const Narrow = { args: { part: "chips" }, ...shell, ...narrow };
