import TerminalDemo from "../../fixtures/TerminalDemo.astro";
import md from "./terminal.md?raw";
import { docs, japanese, live, narrow, still } from "../../fixtures/stories.ts";

const machine = { globals: { reading: "machine" } };
export default { title: "Terminal/Terminal", component: TerminalDemo, ...docs(md, { chrome: true }) };

/** The live shell: the demo interpreter prints a fresh session and the prompt waits. */
export const Default = { args: {}, ...live };
/** Without scripts, or before the element has its interpreter: the recorded session. */
export const Recorded = { args: { short: false } };
export const Projects = { args: { page: "projects" }, ...live };
/** The rain overlay (`cmatrix`) over the 機械用 page. */
export const Overlay = { args: { overlay: true }, ...machine };
export const Still = { args: {}, ...live, ...still };
// Four scopes, each its own terminal (unique field ids): the recorded session, so the capture is stable.
export const Contexts = { args: { contexts: true } };
export const Japanese = { args: { lang: "ja" }, ...live, ...japanese };
export const Narrow = { args: {}, ...narrow };
