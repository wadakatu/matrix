import Rain from "./Rain.astro";
import md from "./rain.md?raw";
import { docs, framed, japanese, narrow, still } from "../../fixtures/stories.ts";
import { signature } from "../../fixtures/corpus.ts";

const args = { phrases: signature.phrases };
export default { title: "Signature/Rain", component: Rain, ...docs(md) };

export const Default = { args };
export const Band = { args: { ...args, variant: "band" } };
export const Held = { args, globals: { motion: "held" } };
export const Still = { args, ...still };
export const Contexts = { args, ...framed };
export const Japanese = { args, ...japanese };
export const Narrow = { args, ...narrow, ...framed, globals: narrow.globals };
