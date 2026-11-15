import ReadingsDemo from "../../fixtures/ReadingsDemo.astro";
import md from "./readings.md?raw";
import { contexts, docs, japanese, narrow, still } from "../../fixtures/stories.ts";

export default { title: "Signature/Readings", component: ReadingsDemo, ...docs(md, { chrome: true }) };

export const Default = { args: {} };
export const Machine = { args: {}, globals: { reading: "machine" } };
export const Still = { args: {}, ...still };
export const Contexts = { args: {}, ...contexts };
export const Japanese = { args: {}, ...japanese };
export const Narrow = { args: {}, ...narrow };
