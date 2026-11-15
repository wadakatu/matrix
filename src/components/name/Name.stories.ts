import Name from "./Name.astro";
import md from "./name.md?raw";
import { contexts, docs, japanese, narrow, still } from "../../fixtures/stories.ts";
import { signature } from "../../fixtures/corpus.ts";

const args = { lines: signature.commits, id: "name", slots: { default: "fixture_" } };
export default { title: "Signature/Name", component: Name, ...docs(md) };

export const Default = { args };
export const Machine = { args, globals: { reading: "machine" } };
export const Doubled = { args, play: ({ canvasElement }: { canvasElement: HTMLElement }) => canvasElement.querySelector(".mx-name")?.setAttribute("data-double", "") };
export const Still = { args, globals: { reading: "machine", motion: "off" } };
export const Contexts = { args, ...contexts };
export const MachineContexts = { args, ...contexts, globals: { reading: "machine" } };
export const Japanese = { args, ...japanese };
export const Narrow = { args, ...narrow };
