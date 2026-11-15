import StreamsDemo from "../../fixtures/StreamsDemo.astro";
import md from "./stream.md?raw";
import { contexts, docs, focused, hovered, japanese, narrow, still } from "../../fixtures/stories.ts";

// A Stream is a list item; it is shown in its list, one entry long.
export default { title: "Signature/Stream", component: StreamsDemo, ...docs(md) };

export const Default = { args: { count: 1 } };
export const Row = { args: { count: 1, variant: "rows" } };
export const Hovered = { args: { count: 1 }, ...hovered(".mx-stream") };
export const Focused = { args: { count: 1 }, ...focused(".mx-stream-name a") };
export const Still = { args: { count: 1 }, ...still };
export const Contexts = { args: { count: 1 }, ...contexts };
export const Japanese = { args: { count: 1, lang: "ja" }, ...japanese };
export const Narrow = { args: { count: 1 }, ...narrow };
