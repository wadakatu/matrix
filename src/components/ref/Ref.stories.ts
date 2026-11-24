import ReadingPart from "../../fixtures/ReadingPart.astro";
import md from "./ref.md?raw";
import { contexts, docs, focused, hovered, narrow } from "../../fixtures/stories.ts";

export default { title: "Reading/Reference link", component: ReadingPart, ...docs(md) };

export const Default = { args: { part: "ref" } };
export const Hovered = { args: { part: "ref" }, ...hovered(".mx-ref") };
export const Focused = { args: { part: "ref" }, ...focused(".mx-ref") };
/** The path wraps under the host. */
export const Narrow = { args: { part: "ref" }, ...narrow };
export const Contexts = { args: { part: "ref" }, ...contexts };
