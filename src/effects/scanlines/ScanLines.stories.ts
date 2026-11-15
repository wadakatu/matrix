import ScanlinesDemo from "../../fixtures/ScanlinesDemo.astro";
import md from "./scanlines.md?raw";
import { contexts, docs, japanese, narrow } from "../../fixtures/stories.ts";

const machine = { globals: { reading: "machine" } };
export default { title: "Signature/Scan lines", component: ScanlinesDemo, ...docs(md) };

export const Default = { args: {}, ...machine };
export const Human = { args: {} };
// A root effect over the window: the scopes are not framed, so lifting works as on a page.
export const Contexts = { args: {}, ...contexts, ...machine };
export const Japanese = { args: {}, globals: { ...machine.globals, ...japanese.globals } };
export const Narrow = { args: {}, globals: { ...machine.globals, ...narrow.globals } };
